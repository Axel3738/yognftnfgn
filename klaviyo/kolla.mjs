// Kollen: nyckel, rätt konto, och en inventering av vad som redan finns i Klaviyo.
//
//   node klaviyo/kolla.mjs [--brand baverbutiken]        läser bara
//   node klaviyo/kolla.mjs --prov                        mäter dessutom det obekräftade
//                                                        i ARKITEKTUR.md (skapar och tar
//                                                        bort mallen TPL_prov_v1)
//
// Skriver klaviyo/konto/<brand>/lage.json. Exit 1 = nyckeln saknas, 2 = fel konto
// eller Klaviyo nekade, 0 = allt läst (varningar kan finnas).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { KlaviyoKlient, KlaviyoFel, nyckelFranEnv, kontrolleraKonto } from './klient.mjs';
import { hamtaMetriker, metrikIds, SHOPIFY_METRIKER, KANDA_METRIKER } from './metriker.mjs';
import { PRODUKTNAMN_EGENSKAP } from './segment.mjs';
import { lasBrand, ORDER_PRODUKTFALT } from './ladda-upp.mjs';

const HAR = path.dirname(fileURLToPath(import.meta.url));

/** Domäner utan MX-post (mätt 2026-09-12): mejl dit landar ingenstans. */
export const DOMANER_UTAN_MX = ['baverkoppling.se'];

const DUBBLETTORD = /abandon|checkout|kassa|övergiv|overgiv|welcome|välkom|valkom|nyhetsbrev/i;

export function nyckelSaknasText(brand) {
  const variabel = brand.nyckel_env[0];
  return [
    `Klaviyo-nyckeln för ${brand.namn} saknas: ingen av ${brand.nyckel_env.join(', ')} finns i miljön.`,
    '',
    'Så skapar du den:',
    '1. Logga in på Klaviyo (kontot ' + brand.public_id + ').',
    '2. Klicka Settings (kugghjulet nere till vänster) → API keys.',
    '3. Klicka Create Private API Key.',
    '4. Döp den till "Claude motor", välj Full Access, klicka Create.',
    '5. Kopiera nyckeln (börjar med pk_).',
    `6. På claude.ai: Environments → miljön → lägg till variabeln ${variabel} med nyckeln som värde.`,
  ].join('\n');
}

function domanen(epost) {
  return String(epost ?? '').split('@')[1]?.toLowerCase() ?? '';
}

/**
 * Inventeringen. Kastar KlaviyoFel FEL_KONTO om kontot inte är brandets.
 * @returns {Promise<{lage: object, varningar: string[]}>}
 */
export async function kolla({ brand, klient, prov = false, nu = () => new Date() }) {
  const varningar = [];
  const konto = await kontrolleraKonto(klient, brand);
  const ci = konto.attributes?.contact_information ?? {};
  const lage = {
    brand: brand.id,
    hamtad: nu().toISOString(),
    konto: {
      id: konto.id,
      public_api_key: konto.attributes?.public_api_key,
      test_account: konto.attributes?.test_account ?? null,
      tidszon: konto.attributes?.timezone ?? null,
      valuta: konto.attributes?.preferred_currency ?? null,
      organisation: ci.organization_name ?? null,
      adress: ci.street_address ?? null,
    },
    avsandare: {
      konto_standard: { email: ci.default_sender_email ?? null, namn: ci.default_sender_name ?? null },
      brandfilen: brand.avsandare,
    },
  };

  for (const [vad, epost] of [['Kontots standardavsändare', ci.default_sender_email], ['Brandfilens avsändare', brand.avsandare?.from_email], ['Brandfilens svarsadress', brand.avsandare?.reply_to_email]]) {
    if (DOMANER_UTAN_MX.includes(domanen(epost))) {
      varningar.push(`${vad} är ${epost} — domänen ${domanen(epost)} saknar MX-post, svar från kunder landar ingenstans. Byt i Klaviyo → Settings → Brand → Email sender till ${brand.avsandare.from_email}.`);
    }
  }
  if (ci.default_sender_email && brand.avsandare?.from_email && ci.default_sender_email.toLowerCase() !== brand.avsandare.from_email.toLowerCase()) {
    varningar.push(`Kontots standardavsändare (${ci.default_sender_email}) är inte brandfilens (${brand.avsandare.from_email}). Motorn sätter brandfilens på varje mejl, men mejl som byggs för hand i Klaviyo får kontots.`);
  }
  if (!ci.street_address?.address1) varningar.push('Kontot saknar postadress — {{ organization.full_address }} blir tom i sidfoten (MFL 20 §). Fyll i Settings → Brand.');

  // Metriker
  const metriker = await hamtaMetriker(klient);
  const { ids, saknas, tvetydiga } = metrikIds(metriker);
  varningar.push(...tvetydiga);
  lage.metriker = { alla: metriker, kanda: ids, saknas };
  const shopifySaknas = saknas.filter((s) => SHOPIFY_METRIKER.includes(s.nyckel));
  if (shopifySaknas.length) varningar.push(`Shopify-metriker saknas: ${shopifySaknas.map((s) => KANDA_METRIKER[s.nyckel].join('/')).join(', ')}. Är Shopify-integrationen kopplad (Klaviyo → Integrations → Shopify)? Utan dem går flöden och köparsegment inte att bygga.`);
  for (const s of saknas.filter((x) => x.kod === 'METRIK_FLERA')) varningar.push(s.orsak);

  // Listor, segment, flöden, mallar, kampanjer
  const listor = await klient.allaSidor('/api/lists', { 'page[size]': 10 });
  lage.listor = listor.map((l) => ({ id: l.id, namn: l.attributes?.name, opt_in: l.attributes?.opt_in_process ?? null }));
  const segment = await klient.allaSidor('/api/segments', { 'page[size]': 10 });
  lage.segment = segment.map((s) => ({ id: s.id, namn: s.attributes?.name, aktiv: s.attributes?.is_active ?? null }));
  const floden = await klient.allaSidor('/api/flows', { 'page[size]': 50 });
  lage.floden = floden.map((f) => ({ id: f.id, namn: f.attributes?.name, status: f.attributes?.status, trigger_type: f.attributes?.trigger_type ?? null, arkiverad: f.attributes?.archived ?? false }));
  for (const f of lage.floden) {
    if (f.status === 'live' && !f.arkiverad && DUBBLETTORD.test(f.namn ?? '')) {
      varningar.push(`Flödet "${f.namn}" är LIVE (${f.trigger_type ?? 'okänd trigger'}). Motorns flöde för samma sak blir en dubblett — kunden får två mejl. Stäng av det gamla i Klaviyo innan motorns slås på.`);
    }
  }
  const mallar = await klient.allaSidor('/api/templates', { 'page[size]': 10, 'fields[template]': 'name,editor_type,updated' });
  lage.mallar = { antal: mallar.length, motorns: mallar.filter((m) => /^TPL_/.test(m.attributes?.name ?? '')).map((m) => ({ id: m.id, namn: m.attributes.name })) };
  if (mallar.length >= 900) varningar.push(`Kontot har ${mallar.length} mallar — API:t tar max 1 000. Rensa i Klaviyo.`);
  const kampanjer = await klient.allaSidor('/api/campaigns', { filter: "equals(messages.channel,'email')" });
  lage.kampanjer = kampanjer.map((k) => ({ id: k.id, namn: k.attributes?.name, status: k.attributes?.status ?? null, planerad: k.attributes?.scheduled_at ?? k.attributes?.send_time ?? null }));

  if (prov) lage.prov = await provmatningar({ klient, metriker, ids });
  return { lage, varningar };
}

/**
 * Mäter det obekräftade i ARKITEKTUR.md. Bara med --prov. Skapar mallen
 * TPL_prov_v1, renderar den och tar bort den. Skickar ingenting.
 */
export async function provmatningar({ klient, metriker, ids }) {
  const p = {};
  const HTML = '<html><body><p>Hej {{ first_name|default:"" }}</p><p>{% unsubscribe %}</p><p>{{ organization.full_address }}</p></body></html>';
  // 1. editor_type CODE
  let mallId = null;
  try {
    const gammal = await klient.hittaPaNamn('template', 'TPL_prov_v1');
    if (gammal) await klient.delete(`/api/templates/${gammal.id}`);
    const svar = await klient.post('/api/templates', { data: { type: 'template', attributes: { name: 'TPL_prov_v1', editor_type: 'CODE', html: HTML, text: 'Hej' } } });
    mallId = svar?.data?.id;
    p.editor_type_code = { ok: true, id: mallId, editor_type: svar?.data?.attributes?.editor_type ?? null };
  } catch (e) { p.editor_type_code = { ok: false, fel: e.message }; }
  // 7. rendering (mallspråket i Klaviyo)
  if (mallId) {
    try {
      const r = await klient.post('/api/template-render', { data: { type: 'template', id: mallId, attributes: { context: { first_name: 'Prov' } } } });
      const html = r?.data?.attributes?.html ?? '';
      p.rendering = { ok: true, forNamnetRenderat: html.includes('Prov'), utdrag: html.slice(0, 300) };
    } catch (e) { p.rendering = { ok: false, fel: e.message }; }
    try { await klient.delete(`/api/templates/${mallId}`); p.borttagen = true; } catch (e) { p.borttagen = false; p.borttagen_fel = e.message; }
  }
  // 2. accept: application/json
  try {
    await klient.get('/api/accounts', null, { headers: { accept: 'application/json' } });
    p.accept_application_json = { ok: true };
  } catch (e) { p.accept_application_json = { ok: false, status: e.status, fel: e.message }; }
  // 3. kassametrikens namn
  p.kassametrik = metriker.filter((m) => ['Started Checkout', 'Checkout Started'].includes(m.namn)).map((m) => ({ id: m.id, namn: m.namn, integration: m.integration }));
  // Egenskaperna på Ordered Product (kategorisegmentens produktnamn)
  if (ids.ordered_product) {
    try {
      const e = await klient.get(`/api/metrics/${ids.ordered_product}/metric-properties`, { 'fields[metric-property]': 'property,label,inferred_type' });
      const egen = (e?.data ?? []).map((x) => x.attributes?.property ?? x.attributes?.label);
      p.ordered_product_egenskaper = { egenskaper: egen, produktnamn_finns: egen.includes(PRODUKTNAMN_EGENSKAP), segment_mjs_anvander: PRODUKTNAMN_EGENSKAP };
    } catch (err) { p.ordered_product_egenskaper = { fel: err.message }; }
  }
  // Placed Orders egenskaper: fältet produkt_innehaller filtrerar på (ladda-upp.mjs ORDER_PRODUKTFALT).
  if (ids.placed_order) {
    try {
      const e = await klient.get(`/api/metrics/${ids.placed_order}/metric-properties`, { 'fields[metric-property]': 'property,label,inferred_type,sample_values' });
      const egen = (e?.data ?? []).map((x) => ({ egenskap: x.attributes?.property ?? x.attributes?.label, typ: x.attributes?.inferred_type ?? null, exempel: (x.attributes?.sample_values ?? []).slice(0, 3) }));
      p.placed_order_egenskaper = { egenskaper: egen, produktfalt_finns: egen.some((x) => x.egenskap === ORDER_PRODUKTFALT), ladda_upp_anvander: ORDER_PRODUKTFALT };
    } catch (err) { p.placed_order_egenskaper = { fel: err.message }; }
  }
  p.ej_matt = [
    '4. om template_id i ett flöde kopieras eller länkas — mäts när första flödet laddats upp (GET /api/flow-messages/{id}/template)',
    '5. vad measurement "sum" summerar — inget VIP-segment byggs förrän det är mätt',
    '6. send_strategy-formen — felsvaret vid första kampanjen avgör',
    '7. händelsevariablerna i flödesmallarna — kräver en riktig händelse',
  ];
  return p;
}

export function lageText(lage, varningar) {
  const rad = [];
  rad.push(`Klaviyo ${lage.brand}: kontot ${lage.konto.public_api_key} ✅ (${lage.konto.organisation ?? 'namn saknas'}, ${lage.konto.tidszon ?? '?'}, ${lage.konto.valuta ?? '?'})`);
  rad.push(`Avsändare i kontot: ${lage.avsandare.konto_standard.email ?? '(ingen)'} · motorn använder ${lage.avsandare.brandfilen?.from_email}`);
  rad.push(`Metriker: ${lage.metriker.alla.length} st, kända ${Object.keys(lage.metriker.kanda).length} av ${Object.keys(KANDA_METRIKER).length}${lage.metriker.saknas.length ? ` (saknas: ${lage.metriker.saknas.map((s) => s.nyckel).join(', ')})` : ''}`);
  rad.push(`Listor (${lage.listor.length}): ${lage.listor.map((l) => l.namn).join(', ') || '—'}`);
  rad.push(`Segment (${lage.segment.length}): ${lage.segment.map((s) => s.namn).join(', ') || '—'}`);
  rad.push(`Flöden (${lage.floden.length}):`);
  for (const f of lage.floden) rad.push(`  ${f.status ?? '?'}\t${f.trigger_type ?? '?'}\t${f.namn}`);
  rad.push(`Mallar: ${lage.mallar.antal} (motorns: ${lage.mallar.motorns.length})`);
  rad.push(`Kampanjer (${lage.kampanjer.length}):`);
  for (const k of lage.kampanjer.slice(0, 40)) rad.push(`  ${k.status ?? '?'}\t${k.namn}`);
  if (lage.kampanjer.length > 40) rad.push(`  … och ${lage.kampanjer.length - 40} till (se lage.json)`);
  if (lage.prov) rad.push('', 'Provmätningar:', JSON.stringify(lage.prov, null, 2));
  if (varningar.length) { rad.push('', 'VARNINGAR:'); for (const v of varningar) rad.push(`⚠️ ${v}`); }
  return rad.join('\n');
}

async function main() {
  const argv = process.argv.slice(2);
  let brandId = 'baverbutiken';
  let prov = false;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--brand') brandId = argv[++i];
    else if (argv[i] === '--prov') prov = true;
    else { console.error(`Okänt argument: ${argv[i]}`); process.exit(1); }
  }
  const brand = lasBrand(brandId);
  const nyckel = nyckelFranEnv(brand);
  if (!nyckel) { console.error(nyckelSaknasText(brand)); process.exit(1); }
  (await import('../mejl/shopify.mjs')).kravProxy();
  const klient = new KlaviyoKlient({ nyckel: nyckel.nyckel, logg: (t) => console.error(t) });
  let res;
  try {
    res = await kolla({ brand, klient, prov });
  } catch (e) {
    console.error(e instanceof KlaviyoFel ? e.message : e.stack);
    process.exit(2);
  }
  const dir = path.join(HAR, 'konto', brand.id);
  fs.mkdirSync(dir, { recursive: true });
  const fil = path.join(dir, 'lage.json');
  let gammal = {};
  try { gammal = JSON.parse(fs.readFileSync(fil, 'utf8')); } catch { gammal = {}; }
  const ut = { ...res.lage, varningar: res.varningar, ...(gammal.senaste_uppladdning ? { senaste_uppladdning: gammal.senaste_uppladdning } : {}) };
  fs.writeFileSync(fil, JSON.stringify(ut, null, 2) + '\n');
  console.log(`Nyckel: ${nyckel.variabel}`);
  console.log(lageText(res.lage, res.varningar));
  console.log(`\nSkrev ${path.relative(process.cwd(), fil)}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((e) => { console.error(e.stack ?? e.message); process.exit(1); });
}
