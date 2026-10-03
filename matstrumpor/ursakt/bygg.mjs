// Ursäktsmejlet om leveransförseningen, Matstrumpor (Axels order 2026-10-03).
//
// Två delar, båda på alla Spoks-språk och båda AVSTÄNGDA tills Axel bestämmer:
//   1. Kampanjen: ett utkast per språk till dem som köpt från 23/9, ett segment per språk.
//   2. Flödet: order_created → en timme → ett sändsteg per språk, stänger sig självt efter 9/10.
//
// Skriptet läser texterna i sprak/<kod>.json, kontrollerar dem och skriver exakt de
// Spoks-anrop som ska göras till output/plan.json. Det pratar aldrig med Spoks själv:
// uppladdningen görs via Spoks-connectorn i en session, ett anrop i taget.
//
//   node matstrumpor/ursakt/bygg.mjs            # kontrollera + skriv planen
//   node matstrumpor/ursakt/bygg.mjs --kolla    # bara kontrollerna
//
// Språken och landsfiltren kommer ur samma motor som de andra Matstrumpor-flödena
// (klaviyo/spoks-sprak.mjs → sprakKonfig/sprakFilter), så ett land får samma språk här
// som i resten av mejlen.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { sprakKonfig, sprakFilter } from '../../klaviyo/spoks-sprak.mjs';

const HAR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HAR, '..', '..');

export const NYCKLAR = ['amne', 'forhand', 'rubrik', 'hej', 'du_reserv', 'intro_kampanj', 'intro_flode', 'forsening',
  'aterbetalning', 'behalla', 'redan_framme_kampanj', 'sparning', 'knapp', 'avslut', 'signatur'];

const KUNDUNDANTAG = () => ({ type: 'filter', field: 'emailMarketingConsent', operator: 'in', value: ['subscribed', 'not_subscribed'] });
const EJ_SPARRAD = () => ({ type: 'filter', field: 'state', operator: 'ne', value: 'suppressed' });
const och = (...f) => (f.length === 1 ? f[0] : { type: 'conjunction', operator: 'and', isGrouped: true, filters: f });
const eller = (...f) => (f.length === 1 ? f[0] : { type: 'conjunction', operator: 'or', isGrouped: true, filters: f });

const TANKSTRECK = /[—–―─－]/u;
const q = (s) => String(s).replace(/'/g, '’');

// Kontrollerna. Returnerar en lista med fel (tom = grönt).
export function textFel(sprak, t, stopp = []) {
  const fel = [];
  const saknas = NYCKLAR.filter((n) => typeof t[n] !== 'string' || !t[n].trim());
  if (saknas.length) fel.push(`${sprak}: saknar ${saknas.join(', ')}`);
  const extra = Object.keys(t).filter((n) => !NYCKLAR.includes(n));
  if (extra.length) fel.push(`${sprak}: okända nycklar ${extra.join(', ')}`);
  for (const n of NYCKLAR) {
    const v = String(t[n] ?? '');
    if (TANKSTRECK.test(v)) fel.push(`${sprak}.${n}: tankstreck`);
    const tokens = v.match(/\{\{[^}]*\}\}/g) ?? [];
    if (tokens.some((x) => x !== '{{fornamn}}')) fel.push(`${sprak}.${n}: okänd token ${tokens.join(' ')}`);
    if (n !== 'hej' && tokens.length) fel.push(`${sprak}.${n}: {{fornamn}} får bara stå i hälsningen`);
    // Inga andra tal än 5-10 (halvbredd och helbredd).
    const tal = (v.normalize('NFKC').match(/\d+/g) ?? []).filter((x) => x !== '5' && x !== '10');
    if (tal.length) fel.push(`${sprak}.${n}: talet ${tal.join(', ')} står inte i beställningen`);
    for (const s of stopp) if (s.re.test(v)) fel.push(`${sprak}.${n}: ${s.orsak}`);
  }
  if (!/5\s*[-~～〜]\s*10/.test(String(t.forsening ?? '').normalize('NFKC').replace(/～/g, '~'))) fel.push(`${sprak}.forsening: 5-10 saknas`);
  if (!String(t.hej ?? '').includes('{{fornamn}}')) fel.push(`${sprak}.hej: {{fornamn}} saknas`);
  if (t.signatur !== 'Matstrumpor') fel.push(`${sprak}.signatur: ska vara Matstrumpor`);
  if (/!/.test(t.amne ?? '')) fel.push(`${sprak}.amne: utropstecken`);
  const max = sprak === 'ja' ? { amne: 32, knapp: 16 } : { amne: 60, knapp: 28 };
  if ((t.amne ?? '').length > max.amne) fel.push(`${sprak}.amne: ${t.amne.length} tecken (max ${max.amne})`);
  if ((t.knapp ?? '').length > max.knapp) fel.push(`${sprak}.knapp: ${t.knapp.length} tecken (max ${max.knapp})`);
  return fel;
}

const fornamn = (t) => t.hej.replace('{{fornamn}}', `{{ contact.first_name | default: '${q(t.du_reserv)}' }}`);

// Mejlets block. variant = 'kampanj' | 'flode'.
export function block(t, variant, lank) {
  const b = [
    { type: 'h1', text: t.rubrik, alignment: 'left' },
    { type: 'regular', text: `${fornamn(t)}\n\n${variant === 'flode' ? t.intro_flode : t.intro_kampanj}`, alignment: 'left' },
    { type: 'regular', text: t.forsening, alignment: 'left' },
    { type: 'regular', text: `**${t.aterbetalning}**`, alignment: 'left' },
    { type: 'regular', text: t.behalla, alignment: 'left' },
  ];
  if (variant === 'kampanj') b.push({ type: 'regular', text: t.redan_framme_kampanj, alignment: 'left' });
  b.push(
    { type: 'regular', text: t.sparning, alignment: 'left' },
    { type: 'link', text: t.knapp, url: lank, style: 'button', isFullWidth: false },
    { type: 'regular', text: `${t.avslut}\n\n${t.signatur}`, alignment: 'left' },
  );
  return b;
}

export function lankFor(butik, sprak, huvud) {
  if (sprak === huvud) return `${butik.url}/pages/${butik.handle}`;
  const r = (butik.mejl_sprak ?? []).find((x) => x.sprak === sprak);
  if (!r?.sida) throw new Error(`sparning/butiker.json → matstrumpor.mejl_sprak saknar sidan för ${sprak}`);
  return r.sida;
}

export function bygg({ rot = ROT } = {}) {
  const konfig = JSON.parse(readFileSync(join(HAR, 'konfig.json'), 'utf8'));
  const brand = { id: 'matstrumpor', ...JSON.parse(readFileSync(join(rot, 'klaviyo', 'brands', 'matstrumpor.json'), 'utf8')) };
  const butiker = JSON.parse(readFileSync(join(rot, 'sparning', 'butiker.json'), 'utf8'));
  const k = sprakKonfig(brand, rot, butiker);
  const butik = butiker.matstrumpor;
  const fel = [];
  const texter = {};
  for (const { sprak } of k.sprak) {
    const fil = join(HAR, 'sprak', `${sprak}.json`);
    if (!existsSync(fil)) { fel.push(`${sprak}: filen sprak/${sprak}.json saknas`); continue; }
    texter[sprak] = JSON.parse(readFileSync(fil, 'utf8'));
    fel.push(...textFel(sprak, texter[sprak], k.stoppFor(sprak)));
  }
  const kopt = { type: 'filter', field: 'lastPurchase', operator: 'gt', value: konfig.kopt_fran };
  const fortfarandeIgang = eller(
    { type: 'filter', field: 'lastPurchase', operator: 'nis' },
    { type: 'filter', field: 'lastPurchase', operator: 'lt', value: konfig.flode_slut },
  );
  const segment = [];
  const kampanjer = [];
  const steg = [{ type: 'delay', parameters: { delay: konfig.flode_vanta_ms } }];
  k.sprak.forEach(({ sprak }, i) => {
    const t = texter[sprak];
    if (!t) return;
    const lank = lankFor(butik, sprak, k.huvud);
    const notis = { emailTitle: t.amne, emailDescription: t.forhand };
    const segNamn = konfig.namn_segment.replace('{sprak}', sprak);
    segment.push({
      sprak,
      name: segNamn,
      description: `Ursäktsmejlet om leveransförseningen (2026-10-03): köpt från 23/9, alla köpare som inte tackat nej till mejl, språket ${sprak}.`,
      filter: och(kopt, KUNDUNDANTAG(), EJ_SPARRAD(), sprakFilter(k, sprak)),
    });
    kampanjer.push({
      sprak,
      segment: segNamn,
      postData: { title: konfig.namn_kampanj.replace(/\{sprak\}/g, sprak), blocks: block(t, 'kampanj', lank), customizedNotification: notis },
    });
    if (i > 0) steg.push({ type: 'delay', parameters: { delay: 0 } });
    steg.push({
      type: 'publish_flow_post_to_contact',
      parameters: { filter: och(sprakFilter(k, sprak), fortfarandeIgang) },
      sprak,
      postData: { title: `${konfig.namn_flode} · ${sprak}`, blocks: block(t, 'flode', lank), customizedNotification: notis },
    });
  });
  const flode = {
    create: {
      name: konfig.namn_flode,
      reenrollEnabled: false,
      trigger: { event: 'order_created', filter: och(KUNDUNDANTAG(), EJ_SPARRAD()), triggerFilter: null },
    },
    steg,
  };
  return { storeId: konfig.arbetsyta, konfig, sprak: k.sprak.map((x) => x.sprak), segment, kampanjer, flode, fel };
}

function main() {
  const p = bygg();
  console.log(`${p.sprak.length} språk: ${p.sprak.join(' ')}`);
  console.log(`${p.segment.length} segment, ${p.kampanjer.length} kampanjutkast, flödet ${p.flode.steg.length} steg (${p.flode.steg.filter((s) => s.sprak).length} sändsteg)`);
  if (p.fel.length) {
    console.error(`\n❌ ${p.fel.length} fel:\n${p.fel.map((f) => `  ${f}`).join('\n')}`);
    process.exit(1);
  }
  if (!process.argv.includes('--kolla')) {
    mkdirSync(join(HAR, 'output'), { recursive: true });
    writeFileSync(join(HAR, 'output', 'plan.json'), JSON.stringify(p, null, 2) + '\n');
    console.log(`→ matstrumpor/ursakt/output/plan.json`);
  }
  console.log('✅ Inga fel.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
