// kundvy-kor.mjs — hämtar butikens RIKTIGA HTML som en kund ser den och kör
// kontrollerna i kundvy.mjs. Det här är nätverksdelen; kundvy.mjs är ren logik.
//
//   node factory/kundvy-kor.mjs <butik-id> <produkt-id> [--losenord <storefront-lösenord>]
//                                                       [--url <adress>] [--tema <id>]
//                                                       [--fil <sparad.html>] [--utan-kop]
//
// TRE SÄTT ATT FÅ TAG PÅ HTML:EN, i fallande ordning:
//   1. Butiken är öppen → hämta direkt.
//   2. Butiken är lösenordsskyddad (trial — kan inte tas bort förrän plan är
//      vald) → lösenordet ur --losenord eller env SHOPIFY_STOREFRONT_PASSWORD
//      (läggs i miljön för hand, checklistans avsnitt 3) postas till /password
//      med en kakburk, och sidan hämtas sen som en kund.
//   3. `--fil` läser en sparad HTML-fil (den en människa laddat ner).
//
// ⚠️ Utan HTML går det INTE att kontrollera butiken. Skriptet säger då det
// rakt ut och avslutar med felkod 2 — det gissar aldrig grönt (KEDJAN regel 3).
//
// Lärdomar som sitter i koden:
// - Behåll ALLA kakor. Shopify sätter sessionen i `_shopify_essential`, inte
//   längre i `storefront_digest` — ett filter på det gamla namnet kastar bort
//   den enda kaka som betyder något (mätt 2026-09-09: rätt lösenord gav 302
//   till "/" och exakt en kaka).
// - preview_theme_id kräver också kakburken — utan den redirectas man tyst
//   till live-temat (curl-läxan 2026-09-07). Parametern sätts bara när
//   arbetstemat INTE är MAIN; är det publicerat ser kunden det ändå.
// - Storefronten stryper täta anrop (429 efter ~10 sidor/minut, mätt
//   2026-09-08) — vänta och försök igen i stället för att rapportera falskt rött.

import { readFileSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { lasYaml } from './yaml.mjs';
import { laddaEnv } from './env.mjs';
import { graphql, kontrolleraAnslutning, hamtaArbetstema } from './shopify.mjs';
import { lasState } from './state.mjs';
import { byggPaketplan } from './paket.mjs';
import { lasOversattning } from './oversattning.mjs';
import { kodkoll } from './trippelkoll.mjs';
import {
  kontrolleraKundvy,
  rapport,
  strukturkoll,
  svenskaMarkorer,
  produktkoll,
  lasMarkorer,
  filtreraMarkorer,
} from './kundvy.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));
const HUVUD = {
  'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36 OPS-Factory-kundvy',
};
const vantaMs = (ms) => new Promise((r) => setTimeout(r, ms));

// ---- ren logik --------------------------------------------------------------

export class Kakburk {
  constructor() { this.kakor = new Map(); }
  // Tar emot alla Set-Cookie ur ett svar (eller en lista strängar).
  ta(svarEllerRader) {
    const rader = Array.isArray(svarEllerRader)
      ? svarEllerRader
      : (svarEllerRader?.headers?.getSetCookie?.() ?? [svarEllerRader?.headers?.get?.('set-cookie')]);
    for (const r of rader ?? []) {
      if (!r) continue;
      const [par] = String(r).split(';');
      const i = par.indexOf('=');
      if (i > 0) this.kakor.set(par.slice(0, i).trim(), par.slice(i + 1).trim());
    }
  }
  header() { return [...this.kakor].map(([k, v]) => `${k}=${v}`).join('; '); }
  get antal() { return this.kakor.size; }
}

// Bas-URL:en ur shop-objektet (kontrolleraAnslutning) — riktig domän först.
export function byggBas(shop, overstyrning = null) {
  if (overstyrning) return String(overstyrning).replace(/\/+$/, '');
  const url = shop?.primaryDomain?.url ?? (shop?.primaryDomain?.host ? `https://${shop.primaryDomain.host}` : null);
  const bas = url ?? (shop?.myshopifyDomain ? `https://${shop.myshopifyDomain}` : null);
  if (!bas) throw new Error('Ingen butiksadress: ctx.shop saknar primaryDomain och myshopifyDomain.');
  return bas.replace(/\/+$/, '');
}

// "/products/x" + locale "nb" → "/nb/products/x". Utan locale: oförändrad.
export function sidvag(vag, locale = null) {
  const v = `/${String(vag ?? '/').replace(/^\/+/, '')}`;
  const loc = String(locale ?? '').trim().replace(/^\/+|\/+$/g, '');
  if (!loc) return v;
  return v === '/' ? `/${loc}/` : `/${loc}${v}`;
}

// preview_theme_id: numret ur ett gid, ett tal eller ett temaobjekt. MAIN
// (publicerat) ger null — då är preview onödig och kunden ser temat ändå.
export function previewTemaId(tema) {
  if (tema === null || tema === undefined || tema === '') return null;
  if (typeof tema === 'object') {
    if (tema.role === 'MAIN') return null;
    return previewTemaId(tema.id);
  }
  const num = String(tema).split('/').pop();
  return /^\d+$/.test(num) ? num : null;
}

// ---- nätverk ----------------------------------------------------------------

function burk(ctx) {
  if (!ctx.burk) ctx.burk = new Kakburk();
  return ctx.burk;
}

async function hamtaMedTalamod(url, init) {
  for (let f = 0; f < 4; f++) {
    const svar = await fetch(url, init);
    if (svar.status !== 429) return svar;
    await vantaMs(15000 * (f + 1));
  }
  return fetch(url, init);
}

// Postar storefront-lösenordet och behåller kakan i ctx.burk.
export async function loggaInLosenord(ctx, losenord) {
  const bas = byggBas(ctx.shop, ctx.bas);
  const b = burk(ctx);
  const forsta = await fetch(new URL('/password', bas), { headers: { ...HUVUD, cookie: b.header() }, redirect: 'manual' });
  b.ta(forsta);
  const svar = await fetch(new URL('/password', bas), {
    method: 'POST',
    headers: { ...HUVUD, cookie: b.header(), 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ form_type: 'storefront_password', utf8: '✓', password: String(losenord) }),
    redirect: 'manual',
  });
  b.ta(svar);
  // Rätt lösenord ger 302 till startsidan. Fel lösenord renderar om /password
  // med 200 och ett felmeddelande.
  const dit = svar.headers.get('location') ?? '';
  if (svar.status !== 302 || /\/password/.test(dit)) {
    throw new Error(`Lösenordet avvisades (HTTP ${svar.status}, location ${dit || 'saknas'}).`);
  }
  if (b.antal === 0) throw new Error('Inloggningen gav ingen kaka tillbaka.');
  ctx.inloggad = true;
  return true;
}

// Hämtar en sida rått: { status, html, url }. 401 = lösenordssidan stod i vägen.
export async function hamtaSidaRa(ctx, vag, { locale = null, temaId = null } = {}) {
  const bas = byggBas(ctx.shop, ctx.bas);
  const b = burk(ctx);
  const url = new URL(sidvag(vag, locale), bas);
  const preview = previewTemaId(temaId);
  if (preview) url.searchParams.set('preview_theme_id', preview);
  let svar = await hamtaMedTalamod(url, { headers: { ...HUVUD, cookie: b.header() }, redirect: 'manual' });
  b.ta(svar);
  for (let i = 0; i < 5 && svar.status >= 300 && svar.status < 400; i++) {
    const till = new URL(svar.headers.get('location'), url);
    if (till.pathname === '/password') return { status: 401, html: '', url: String(url) };
    svar = await fetch(till, { headers: { ...HUVUD, cookie: b.header() }, redirect: 'manual' });
    b.ta(svar);
  }
  const html = await svar.text();
  return { status: svar.status, html, url: String(url) };
}

// hamtaSida(ctx, vag, { locale, losenord, temaId }) → html
// Loggar in med lösenordet vid behov. Utan HTML: kastar (aldrig tom sträng).
export async function hamtaSida(ctx, vag, { locale = null, losenord = null, temaId = null } = {}) {
  const losen = losenord ?? process.env.SHOPIFY_STOREFRONT_PASSWORD ?? null;
  let svar = await hamtaSidaRa(ctx, vag, { locale, temaId });
  if (svar.status === 401) {
    if (!losen) {
      const e = new Error(
        `${svar.url} är lösenordsskyddad och inget storefront-lösenord finns (--losenord eller env SHOPIFY_STOREFRONT_PASSWORD). ` +
          'Admin-API:t lämnar inte ut lösenordet — be VA:n lägga in det (Online Store → Preferences → Password).'
      );
      e.kravLosenord = true;
      e.status = 401;
      throw e;
    }
    if (!ctx.inloggad) await loggaInLosenord(ctx, losen);
    svar = await hamtaSidaRa(ctx, vag, { locale, temaId });
  }
  if (svar.status === 429 || /Verifying your connection/i.test(svar.html)) {
    const e = new Error(`${svar.url}: Shopify svarade med en bot-kontroll (HTTP ${svar.status}). Sidan gick inte att läsa som en kund.`);
    e.status = svar.status;
    throw e;
  }
  if (svar.status !== 200) {
    const e = new Error(`${svar.url}: HTTP ${svar.status} — ingen HTML att kontrollera.`);
    e.status = svar.status;
    throw e;
  }
  return svar.html;
}

// Gammal anropsform (sprakkoll.mjs, 2026-09-09): hamtaStartsida(bas, losenord, vag)
// → { status, url, html } och kastar INTE på HTTP-fel — anroparen läser status
// själv. Behålls så språkkollen fungerar utan att skrivas om; nya anropare
// använder hamtaSida(ctx, vag, opt).
async function hamtaGammalForm(bas, losenord = null, vag = '/') {
  const ctx = { bas };
  const losen = losenord ?? process.env.SHOPIFY_STOREFRONT_PASSWORD ?? null;
  let svar = await hamtaSidaRa(ctx, vag);
  if (svar.status === 401 && losen) {
    await loggaInLosenord(ctx, losen);
    svar = await hamtaSidaRa(ctx, vag);
  }
  return svar;
}

export const hamtaStartsida = (ctx, opt = {}, vag = '/') =>
  typeof ctx === 'string' ? hamtaGammalForm(ctx, opt, vag) : hamtaSida(ctx, '/', opt);
export const hamtaProduktsida = (ctx, handle, opt = {}) => hamtaSida(ctx, `/products/${handle}`, opt);

// ---- köptestet ------------------------------------------------------------------
// Riktiga korgen, riktiga koder, exakt kassapris (samma kakburk som
// lösenordet). Returnerar rader [namn, ok, detalj].
export async function koptest(ctx, { variantId, bonusVariantId, pris, bonuspris, paket }) {
  const bas = byggBas(ctx.shop, ctx.bas);
  const b = burk(ctx);
  const rot = async (sokvag, init = {}) => {
    for (let f = 0; f < 4; f++) {
      await vantaMs(f === 0 ? 1500 : 15000 * f);
      const svar = await fetch(new URL(sokvag, bas), {
        ...init,
        headers: { ...HUVUD, cookie: b.header(), accept: 'application/json', 'content-type': 'application/json', ...(init.headers ?? {}) },
        redirect: 'manual',
      });
      b.ta(svar);
      // Cloudflares bot-utmaning ("Verifying your connection…", mätt 2026-09-08
      // på /cart/add.js) ser ut som 429 men går inte att vänta bort och ska inte
      // kringgås — korgen kan inte köras från en molnsession.
      if (svar.headers.get('cf-mitigated') === 'challenge') {
        const e = new Error(`${sokvag}: Cloudflare kräver webbläsarverifiering — köptestet i riktiga korgen kan inte köras härifrån.`);
        e.cloudflare = true;
        throw e;
      }
      if (svar.status !== 429) return svar;
    }
    throw new Error(`${sokvag}: storefronten svarade 429 fyra gånger — kör om kollen om en stund.`);
  };
  const rens = () => rot('/cart/clear.js', { method: 'POST' });
  const lagg = (items) => rot('/cart/add.js', { method: 'POST', body: JSON.stringify({ items }) });
  // /cart.js svarar med content-type text/javascript (mätt 2026-09-08) — tolka
  // kroppen som JSON och larma bara när det inte går (lösenordssidan är HTML).
  const korg = async () => {
    const s = await rot('/cart.js');
    const text = await s.text();
    try { return JSON.parse(text); } catch { throw new Error(`/cart.js gav ${s.status} ${s.headers.get('content-type') || ''} — lösenordskakan saknas?`); }
  };
  const ut = [];
  const kr = (ore) => `${(ore / 100).toFixed(2)} kr`;

  // 1. Korg-upsellen syns när korgen har varor.
  await rens();
  await lagg([{ id: variantId, quantity: 1 }]);
  const sek = await rot('/?sections=cart-drawer');
  const drawer = sek.ok ? (await sek.json())['cart-drawer'] ?? '' : '';
  ut.push(['korg-upsellen i lådan med varor i korgen', /opf-upsell/.test(drawer), drawer ? '' : `HTTP ${sek.status}`]);

  // 2. Nivå 1 + fullpris-kryssrutan: 1 huvudprodukt + 1 bonus utan kod.
  await rens();
  await lagg([{ id: variantId, quantity: 1 }, ...(bonusVariantId ? [{ id: bonusVariantId, quantity: 1 }] : [])]);
  let c = await korg();
  const forv1 = Math.round(pris * 100) + (bonusVariantId ? Math.round(bonuspris * 100) : 0);
  ut.push([`nivå 1 + tillval = ${kr(forv1)} i korgen (fullpris, ingen rabatt)`, c.total_price === forv1 && (c.total_discount ?? 0) === 0, `korgen säger ${kr(c.total_price)}, rabatt ${kr(c.total_discount ?? 0)}`]);

  // 3. Varje paketnivå med kod: koden + antal + gratis ⇒ exakt paketpriset.
  for (const n of paket) {
    await rens();
    const r = await rot(`/discount/${encodeURIComponent(n.kod)}?redirect=/cart.js`);
    await lagg([{ id: variantId, quantity: n.antal }, ...(n.gratisAntal > 0 && bonusVariantId ? [{ id: bonusVariantId, quantity: n.gratisAntal }] : [])]);
    c = await korg();
    const koder = (c.discount_codes ?? []).map((d) => `${d.code}${d.applicable ? '' : ' (ej tillämplig)'}`).join(',');
    const forv = Math.round(n.pris * 100);
    ut.push([`${n.kod}: ${n.antal} st + ${n.gratisAntal} gratis = ${kr(forv)}`, c.total_price === forv, `korgen säger ${kr(c.total_price)} (koder: ${koder || 'inga'}, kodsvar ${r.status})`]);
  }
  await rens();
  return ut;
}

// ---- CLI ------------------------------------------------------------------------

async function huvud() {
  laddaEnv();
  const arg = process.argv.slice(2);
  const flagga = (n) => (arg.includes(n) ? arg[arg.indexOf(n) + 1] : null);
  const fria = arg.filter((a, i) => !a.startsWith('--') && !['--losenord', '--url', '--tema', '--fil'].includes(arg[i - 1]));
  const [butikId, produktId] = fria;
  if (!butikId || !produktId) {
    console.error('Användning: node factory/kundvy-kor.mjs <butik-id> <produkt-id> [--losenord X] [--url U] [--tema ID] [--fil f.html] [--utan-kop]');
    process.exit(1);
  }
  const butik = lasYaml(readFileSync(join(ROT, 'butiker', `${butikId}.yaml`), 'utf8'));
  const p = lasYaml(readFileSync(join(ROT, 'produkter', `${produktId}.yaml`), 'utf8'));
  const handle = p.produkt.handle ?? p.produkt.id;
  let fel = 0;
  const visa = (ok, text) => { console.log(`   ${ok ? '✅' : '❌'} ${text}`); if (!ok) fel++; };

  // Väg 3: sparad fil — bara startsidekontrollen, ingen struktur/marknad.
  const fil = flagga('--fil');
  if (fil) {
    const html = readFileSync(fil, 'utf8');
    console.log(`Kundvy läst ur fil: ${fil} (${html.length} tecken)\n`);
    const res = kontrolleraKundvy(html, butik, p);
    console.log(rapport(res));
    process.exit(res.ok ? 0 : 1);
  }

  const shop = await kontrolleraAnslutning();
  console.log(`Connected: ${shop.myshopifyDomain} ✓`);
  const ctx = { shop, bas: flagga('--url') };
  const state = lasState(butik.butik.id, '_butik');
  const arbetstemaId = state.arbetstemaId ?? state.steg?.['tema-upload']?.arbetstemaId ?? state.steg?.['tema-upload']?.temaId ?? null;
  const tema = flagga('--tema') ? { id: flagga('--tema'), role: 'UNPUBLISHED' } : await hamtaArbetstema(arbetstemaId);
  const losenord = flagga('--losenord') ?? process.env.SHOPIFY_STOREFRONT_PASSWORD ?? null;
  console.log(`Bas ${byggBas(shop, ctx.bas)} · tema ${tema.name ?? tema.id} (${tema.role})${previewTemaId(tema) ? ' via preview_theme_id' : ' = LIVE'}`);

  // Markörerna: butikens egna ord, minus de som är lika på målspråket.
  const markorerBas = lasMarkorer(butik);
  if (markorerBas.length === 0) {
    console.log('🖐 butik.markorer_sv saknas i butik.yaml — markörskanningen på översatta sidor hoppas över (manuell).');
  }

  let html;
  try {
    html = await hamtaStartsida(ctx, { losenord, temaId: tema });
  } catch (e) {
    console.error(`\n❌ KUNDVYN GÅR INTE ATT KONTROLLERA.\n   ${e.message}\n   Rapportera ALDRIG butiken som klar utan den här kontrollen.`);
    process.exit(2);
  }
  console.log(`\n/  (${html.length} tecken, tema-katalog t/${(html.match(/cdn\/shop\/t\/(\d+)\//) ?? [])[1] ?? '?'})`);
  const start = kontrolleraKundvy(html, butik, p);
  console.log(rapport(start));
  fel += start.fel.length;

  const locales = ['', ...((butik?.butik?.marknader ?? []).map((m) => m.locale).filter(Boolean))];
  for (const loc of locales) {
    let markorer = markorerBas;
    if (loc) {
      let ov = null;
      try { ov = lasOversattning(butik.butik.id, loc); } catch { ov = null; }
      markorer = filtreraMarkorer(markorerBas, ov?.sv, ov?.nb);
    }
    for (const vag of loc ? [`/`, `/products/${handle}`] : [`/products/${handle}`]) {
      await vantaMs(2500);
      let s;
      try {
        s = await hamtaSida(ctx, vag, { locale: loc || null, losenord, temaId: tema });
      } catch (e) {
        console.log(`\n${sidvag(vag, loc || null)}\n   ❌ ${e.message}`);
        fel++;
        continue;
      }
      console.log(`\n${sidvag(vag, loc || null)}  (${s.length} tecken)`);
      if (vag.includes('/products/')) {
        for (const pt of strukturkoll(s, { produkt: p, butik }).punkter) visa(pt.ok, pt.namn);
      }
      if (loc) {
        if (markorer.length === 0) console.log('   🖐 inga markörer att skanna');
        else {
          const lackor = svenskaMarkorer(s, markorer);
          visa(lackor.length === 0, lackor.length === 0 ? `0 svenska markörer av ${markorer.length}` : `svenska markörer kvar: ${lackor.join(', ')}`);
        }
      } else {
        const pk = produktkoll(s, p);
        visa(pk.ok, pk.ok ? 'huvudspråkets vy: produktnamn + pris syns' : pk.fel.join(' | '));
      }
    }
  }

  // Köptestet: riktiga korgen. Cloudflare stänger den för molnsessioner →
  // reservvägen är kodkollen mot admin (samma definitioner kassan räknar med).
  if (!arg.includes('--utan-kop')) {
    const bonusHandle = p.offer?.bonus_produkt?.handle ?? null;
    const q = await graphql(
      `query opsFactoryKundvyVarianter($h: String!, $b: String!) {
        produkt: productByIdentifier(identifier: { handle: $h }) { variants(first: 1) { nodes { id } } }
        bonus: productByIdentifier(identifier: { handle: $b }) { variants(first: 1) { nodes { id } } }
      }`,
      { h: handle, b: bonusHandle ?? handle }
    );
    const num = (gid) => Number(String(gid).split('/').pop());
    const variantId = num(q.produkt?.variants?.nodes?.[0]?.id);
    const bonusVariantId = bonusHandle ? num(q.bonus?.variants?.nodes?.[0]?.id) : null;
    const plan = byggPaketplan(p, butik);
    const paket = plan.poster.filter((x) => x.kod);
    const bonuspris = Number(p.offer?.bonus_produkt?.pris) || 0;
    console.log('\nKöptest (riktiga korgen):');
    try {
      for (const [namn, ok, detalj] of await koptest(ctx, { variantId, bonusVariantId, pris: p.ekonomi.pris, bonuspris, paket: paket.map((x) => ({ kod: x.kod, antal: x.antal, gratisAntal: x.gratisAntal, pris: x.kundpris })) })) {
        visa(ok, `${namn}${detalj ? ` — ${detalj}` : ''}`);
      }
    } catch (e) {
      if (!e.cloudflare) throw e;
      console.log(`   ⚠️  ${e.message}`);
      console.log('   Reservväg: rabattkoderna + priserna kontrolleras mot admin:');
      for (const [namn, ok, detalj] of await kodkoll({ shop }, p, butik)) visa(ok, `${namn}${detalj ? ` — ${detalj}` : ''}`);
      console.log('   🖐 Ett ögonköp i kundvyn (lägg paketet i korgen, se kassapriset) görs av en människa.');
    }
  }

  console.log(fel === 0 ? '\n✅ Kundvyn grön (startsida + struktur + markörer). Mobilkontrollen är ett ögonjobb i temaredigeraren.' : `\n❌ ${fel} fynd — inte klart.`);
  process.exit(fel === 0 ? 0 : 1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  huvud().catch((e) => { console.error(`\n❌ ${e.message}\n`); process.exit(e.kravLosenord ? 2 : 1); });
}
