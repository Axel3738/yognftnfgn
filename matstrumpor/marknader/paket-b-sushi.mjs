// paket-b-sushi.mjs — pakettestets B-block bara på sushisidan (Matstrumpor).
//
// Felet (kundmejl 2026-10-03: "Varje gång jag lägger till donutstrumpor läggs istället till sushi +
// ätpinnar"), mätt samma dag som kund i Chromium:
//
//   templates/product.json bär två paketblock i köprutan, och mallen delas av ALLA produkter:
//     ms_paket    — den vanliga väljaren, i Sverige märkt data-ms-ab="paket:a" (göms för variant b)
//     ms_paket_b  — pakettestets B ("1 låda 399 / 2 lådor 499 / 4 lådor 799"), i Sverige märkt
//                   data-ms-ab="paket:b", med fast_variant: 52506473365843 = SUSHINS 5-parslåda.
//   Nivåerna för B finns bara för sushi (ab_variant "paket-b"). På donut-, pizza- och hamburgarsidan
//   visar B-blocket därför sortens vanliga nivåer ("Köp 1 – Få 1", DONUT-K1F1) — men ms-paket.js
//   köper ALLTID data-variant-id, alltså sushi. Hälften av Sverige (variant b) fick sushi + ätpinnar
//   i korgen hur de än valde, och den vanliga väljaren var gömd för dem.
//   Mätt: donutsidan, variant b, "Köp 1 – Få 1" ⇒ 2 × Sushi-Strumpor 5-par + 2 par ätpinnar, 399 kr,
//   koden DONUT-K1F1. Kundens flöde (sushi "1 låda" + donut) ⇒ 3 sushilådor, 798 kr, ingen donut.
//   Ingen order sedan 2026-09-01 bär en annan sorts kod än varorna — ingen hann betala för fel vara.
//
// Rättningen: båda blockens villkor får "och sidan är sushin" (product.id). Sushisidan i Sverige
// testar vidare precis som förut (a mot b); donut, pizza och hamburgare visar den vanliga väljaren
// för alla, som utlandet redan gör. Exakta träffar, originalet sparas i paket-b-sushi/original/.
//
//   node matstrumpor/marknader/paket-b-sushi.mjs                       # torrt mot MAIN: vad som byts
//   node matstrumpor/marknader/paket-b-sushi.mjs --kopia               # färsk kopia av MAIN att prova i
//   node matstrumpor/marknader/paket-b-sushi.mjs --tema <gid> --skarpt # skriv i kopian (utan --tema: MAIN)
//   node matstrumpor/marknader/paket-b-sushi.mjs --kundvy [--tema <gid>] # Chromium som kund: donut a/b, pizza b, sushi b, kundens flöde
//   node matstrumpor/marknader/paket-b-sushi.mjs --aterstall --skarpt [--tema <gid>]

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HAR = dirname(fileURLToPath(import.meta.url));
const MAPP = join(HAR, 'paket-b-sushi');
const ORIGINAL = join(MAPP, 'original');
const OUTPUT = join(HAR, 'output', 'paket-b-sushi');

export const FIL = 'templates/product.json';
export const SUSHI_PRODUKT = 10286130889043;
export const SUSHI_VARIANT = 52506473365843;
export const MARKE = `product.id == ${SUSHI_PRODUKT}`;

/** Byter EXAKT `sok` mot `ersatt`, kräver exakt `antal` träffar — aldrig "nästan rätt". */
export function bytExakt(kod, sok, ersatt, antal = 1) {
  const traffar = kod.split(sok).length - 1;
  if (traffar !== antal) throw new Error(`"${sok.slice(0, 70)}" hittades ${traffar} gånger, väntade ${antal}`);
  return kod.split(sok).join(ersatt);
}

// Strängarna som de står i filen (JSON-escapade, för filen är JSON med Shopifys kommentarshuvud).
const SE = `{%- if localization.country.iso_code == 'SE' -%}`;
const SE_SUSHI = `{%- if localization.country.iso_code == 'SE' and ${MARKE} -%}`;
const A_SOK = `${SE}<div data-ms-ab=\\"paket:a\\">`;
const A_NY = `${SE_SUSHI}<div data-ms-ab=\\"paket:a\\">`;
const B_SOK = `${SE}<div data-ms-ab=\\"paket:b\\" hidden>`;
const B_NY = `${SE_SUSHI}<div data-ms-ab=\\"paket:b\\" hidden>`;
const FAST = `fast_variant: ${SUSHI_VARIANT} %}`;

export const STEG = [
  [A_SOK, A_NY, 'ms_paket: paket:a-märket bara på sushisidan (andra sorter visar väljaren för alla)'],
  [B_SOK, B_NY, 'ms_paket_b: pakettestets B bara på sushisidan'],
];

export function patcha(kod) {
  if (kod.includes(MARKE)) return { kod, byten: [], hoppade: ['redan patchad'] };
  if (!kod.includes(FAST)) throw new Error(`${FIL}: B-blocket bär inte fast_variant ${SUSHI_VARIANT} — mallen ser inte ut som när felet mättes, skriver inte`);
  const byten = [];
  for (const [sok, ny, namn] of STEG) { kod = bytExakt(kod, sok, ny, 1); byten.push(namn); }
  return { kod, byten, hoppade: [] };
}

export function avpatcha(kod) {
  if (!kod.includes(MARKE)) return { kod, byten: [], hoppade: ['inte patchad'] };
  const byten = [];
  for (const [sok, ny, namn] of [...STEG].reverse()) { kod = bytExakt(kod, ny, sok, 1); byten.push(`bort: ${namn}`); }
  return { kod, byten, hoppade: [] };
}

/** Shopifys JSON-mallar börjar med en /* … *\/-kommentar. Resten måste vara giltig JSON. */
export function giltigMall(kod) {
  try { JSON.parse(kod.replace(/^\s*\/\*[\s\S]*?\*\/\s*/, '')); return true; } catch { return false; }
}

// ---------------------------------------------------------------------------
// Shopify (bara i CLI)
// ---------------------------------------------------------------------------

async function klient() {
  const { lasButik, skapaKlient } = await import('../../sparning/butik.mjs');
  return skapaKlient(lasButik('matstrumpor'));
}
const paus = (ms) => new Promise((r) => setTimeout(r, ms));

async function valjTema(k, gid) {
  const th = await k.graphql('{ themes(first: 30) { nodes { id name role processing } } }');
  const tema = gid ? th.themes.nodes.find((t) => t.id === gid || t.id.endsWith(`/${gid}`)) : th.themes.nodes.find((t) => t.role === 'MAIN');
  if (!tema) throw new Error(`temat ${gid ?? 'MAIN'} finns inte`);
  return tema;
}

async function lasFil(k, temaId, fil) {
  const d = await k.graphql('query($id: ID!, $f: [String!]) { theme(id: $id) { files(first: 5, filenames: $f) { nodes { filename body { ... on OnlineStoreThemeFileBodyText { content } } } } } }', { id: temaId, f: [fil] });
  return d.theme.files.nodes[0]?.body?.content ?? null;
}

async function kopia({ logg = console.log }) {
  const k = await klient();
  const main = await valjTema(k, null);
  const namn = `PROV paket-b-sushi ${new Date().toISOString().slice(0, 10)} (kopia av MAIN, rörs inte live)`;
  const r = await k.graphql('mutation($id: ID!, $n: String) { themeDuplicate(id: $id, name: $n) { newTheme { id name role } userErrors { field message } } }', { id: main.id, n: namn });
  const fel = r.themeDuplicate.userErrors;
  if (fel.length) throw new Error(fel.map((e) => e.message).join('; '));
  const ny = r.themeDuplicate.newTheme;
  let klar = false;
  for (let i = 0; i < 120 && !klar; i++) { const t = await valjTema(k, ny.id); klar = !t.processing; if (!klar) await paus(5000); }
  if (!klar) throw new Error(`kopian ${ny.id} kopieras fortfarande efter tio minuter`);
  logg(`✅ kopian: ${ny.name} ${ny.id} (${ny.role})`);
  return ny;
}

async function tema({ skarpt, aterstall, temaGid, logg = console.log }) {
  const k = await klient();
  const t = await valjTema(k, temaGid);
  logg(`tema: ${t.name} (${t.id}, ${t.role})`);
  const kod = await lasFil(k, t.id, FIL);
  if (typeof kod !== 'string') throw new Error(`${FIL} saknas i temat`);
  const r = aterstall ? avpatcha(kod) : patcha(kod);
  for (const h of r.hoppade) logg(`  ${FIL}: ${h}`);
  for (const b of r.byten) logg(`  ${FIL}: ${b}`);
  if (!r.byten.length) { logg('inget att skriva'); return { skrivet: false }; }
  if (!giltigMall(r.kod)) throw new Error(`${FIL}: resultatet är inte giltig JSON — skriver inte`);
  const stampel = new Date().toISOString().replace(/[:.]/g, '-');
  const ut = join(OUTPUT, stampel);
  mkdirSync(join(ut, 'fore', dirname(FIL)), { recursive: true });
  mkdirSync(join(ut, 'efter', dirname(FIL)), { recursive: true });
  writeFileSync(join(ut, 'fore', FIL), kod);
  writeFileSync(join(ut, 'efter', FIL), r.kod);
  if (!aterstall && t.role === 'MAIN' && !existsSync(join(ORIGINAL, FIL))) { mkdirSync(join(ORIGINAL, dirname(FIL)), { recursive: true }); writeFileSync(join(ORIGINAL, FIL), kod); }
  if (!skarpt) { logg(`torrt: ${FIL} skulle skrivas (${ut}). Kör med --skarpt.`); return { skrivet: false }; }
  const u = await k.graphql('mutation($id: ID!, $files: [OnlineStoreThemeFilesUpsertFileInput!]!) { themeFilesUpsert(themeId: $id, files: $files) { upsertedThemeFiles { filename } userErrors { filename code message } } }', { id: t.id, files: [{ filename: FIL, body: { type: 'TEXT', value: r.kod } }] });
  const fel = u.themeFilesUpsert?.userErrors ?? [];
  if (fel.length) throw new Error(`themeFilesUpsert: ${fel.map((f) => `${f.filename}: ${f.message}`).join('; ')}`);
  let lika = false;
  for (let forsok = 1; forsok <= 3 && !lika; forsok++) { lika = (await lasFil(k, t.id, FIL)) === r.kod; if (!lika && forsok < 3) await paus(5000); }
  if (!lika) throw new Error(`${FIL} läses inte tillbaka identiskt (tre försök)`);
  logg(`✅ ${FIL} skriven och tillbakaläst (${ut})`);
  return { skrivet: true };
}

// ---------------------------------------------------------------------------
// Kundvyn: Chromium som svensk kund, båda A/B-varianterna
// ---------------------------------------------------------------------------

const DONUT_V = 52510025253203;
const PIZZA_V = 52579705225555;
const PINNE_V = 52940241207635;

async function kundvy({ temaGid = null, logg = console.log } = {}) {
  const { starta, sida } = await import('./granskning/kontroll-2026-10-01/webb.mjs');
  const temaId = temaGid ? String(temaGid).split('/').pop() : null;
  const adress = (bas, extra) => { const u = new URL(bas); for (const [k, v] of Object.entries(extra)) u.searchParams.set(k, v); if (temaId) u.searchParams.set('preview_theme_id', temaId); return u.toString(); };
  const b = await starta();
  let alla = true;
  const steg = (namn, ok, text) => { logg(`${ok ? '✅' : '❌'} ${namn}: ${text}`); if (!ok) alla = false; };
  try {
    for (const fall of [
      { namn: 'donut, variant b', handle: 'donut-strumpor', ab: 'b', niva: '2', vantat: { variant: DONUT_V, lador: 2, par: 2, total: 299, kod: 'DONUT-K1F1' } },
      { namn: 'donut, variant a', handle: 'donut-strumpor', ab: 'a', niva: '2', vantat: { variant: DONUT_V, lador: 2, par: 2, total: 299, kod: 'DONUT-K1F1' } },
      { namn: 'pizza, variant b', handle: 'pizza-strumpor', ab: 'b', niva: '2', vantat: { variant: PIZZA_V, lador: 2, par: 2, total: 449, kod: 'PIZZA-K1F1' } },
      { namn: 'sushi, variant a: "Köp 1 – Få 1"', handle: 'sushi-strumpor', ab: 'a', niva: '2', vantat: { variant: SUSHI_VARIANT, lador: 2, par: 2, total: 399, kod: 'SUSHI-K1F1' } },
      { namn: 'sushi, variant b: "1 låda"', handle: 'sushi-strumpor', ab: 'b', niva: '1', vantat: { variant: SUSHI_VARIANT, lador: 1, par: 1, total: 399, kod: 'SUSHI-1FOR399' } },
      { namn: 'kundens flöde: sushi "1 låda" (b) + donut "Köp 1 – Få 1"', handle: 'sushi-strumpor', ab: 'b', niva: '1', sedan: { handle: 'donut-strumpor', niva: '2' }, vantat: { variant: DONUT_V, lador: 3, par: 3, total: 698, kod: null, sorter: { [SUSHI_VARIANT]: 1, [DONUT_V]: 2 } } },
    ]) {
      const { ctx, page } = await sida(b, { locale: 'sv-SE', mobil: true });
      try {
        const r = await provaKop(page, adress, temaId, fall);
        const v = r.vagn;
        const ok = r.synligaPaket === 1 && (fall.vantat.sorter || v.rader[fall.vantat.variant] === fall.vantat.lador) && v.par === fall.vantat.par && Math.abs(v.total - fall.vantat.total) < 0.005
          && (!fall.vantat.kod || v.kodGaller.includes(fall.vantat.kod))
          && (!fall.vantat.sorter || Object.entries(fall.vantat.sorter).every(([id, n]) => v.rader[id] === n))
          && Object.keys(v.rader).every((id) => fall.vantat.sorter ? id in fall.vantat.sorter : Number(id) === fall.vantat.variant);
        steg(fall.namn, ok, `${r.synligaPaket} synlig paketväljare, vagnen ${Object.entries(v.rader).map(([id, n]) => `${n} × ${v.namn[id]}`).join(' + ')} + ${v.par} par ätpinnar (${v.parPris} kr), ${v.total} kr, koden som gäller: ${v.kodGaller.join(', ') || 'ingen'} (väntat ${fall.vantat.sorter ? Object.entries(fall.vantat.sorter).map(([id, n]) => `${n} × variant ${id}`).join(' + ') : `${fall.vantat.lador} × variant ${fall.vantat.variant}`}, ${fall.vantat.par} par, ${fall.vantat.total} kr)`);
      } catch (e) { steg(fall.namn, false, e.message); }
      await ctx.close();
      await paus(1500);
    }
  } finally { await b.close(); }
  logg(alla ? '\n✅ Kundvyn: varje sida lägger sin egen sort i korgen, i båda A/B-varianterna.' : '\n❌ Kundvyn: se raderna ovan.');
  return { ok: alla };
}

async function provaKop(page, adress, temaId, fall) {
  const paus2 = (ms) => new Promise((r) => setTimeout(r, ms));
  async function ga(url) {
    await page.goto(url, { waitUntil: 'load', timeout: 90000 });
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await page.evaluate(() => { const r = document.querySelector('#shopify-pc__banner'); if (r) r.remove(); });
    if (temaId) { const t = await page.evaluate(() => window.Shopify && Shopify.theme && Shopify.theme.id); if (String(t) !== String(temaId)) throw new Error(`förhandsvisningen gav tema ${t}`); }
  }
  async function valjOchKop(niva) {
    const synliga = await page.evaluate(() => [...document.querySelectorAll('ms-paket')].filter((e) => !e.hidden && !e.closest('[hidden]') && getComputedStyle(e).display !== 'none' && e.querySelectorAll('.ms-paket__input').length > 0).length);
    const vald = await page.evaluate((n) => { const p = [...document.querySelectorAll('ms-paket')].filter((e) => !e.hidden && !e.closest('[hidden]'))[0]; const i = p && p.querySelector(`.ms-paket__input[data-antal="${n}"]`); if (!i) return null; i.checked = true; i.dispatchEvent(new Event('change', { bubbles: true })); return i.dataset.kod; }, niva);
    if (!vald) throw new Error(`nivån ${niva} finns inte i den synliga väljaren`);
    const kn = page.locator('form[action*="/cart/add"] [type="submit"]:visible, form[action*="/cart/add"] [name="add"]:visible').first();
    await kn.scrollIntoViewIfNeeded(); await kn.click();
    await paus2(7000);
    return synliga;
  }
  await ga(adress(`https://matstrumpor.se/products/${fall.handle}`, { country: 'SE', ms_ab: `paket:${fall.ab}` }));
  let synligaPaket = await valjOchKop(fall.niva);
  if (fall.sedan) { await ga(adress(`https://matstrumpor.se/products/${fall.sedan.handle}`, { country: 'SE' })); synligaPaket = await valjOchKop(fall.sedan.niva); }
  const v = await page.evaluate(async () => (await fetch('/cart.js', { headers: { Accept: 'application/json' } })).json());
  const rader = {}; const namn = {}; let par = 0; let parPris = 0;
  for (const i of v.items) { if (i.variant_id === PINNE_V) { par += i.quantity; parPris += i.final_line_price / 100; continue; } rader[i.variant_id] = (rader[i.variant_id] || 0) + i.quantity; namn[i.variant_id] = `${i.product_title} ${i.variant_title || ''}`.trim(); }
  return { synligaPaket, vagn: { rader, namn, par, parPris, total: v.total_price / 100, kodGaller: (v.discount_codes || []).filter((d) => d.applicable).map((d) => d.code) } };
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const arg = process.argv.slice(2);
  const temaIx = arg.indexOf('--tema');
  const temaGid = temaIx !== -1 ? arg[temaIx + 1] : null;
  const skarpt = arg.includes('--skarpt');
  const aterstall = arg.includes('--aterstall');
  try {
    if (arg.includes('--kopia')) await kopia({});
    else if (arg.includes('--kundvy')) { const r = await kundvy({ temaGid }); process.exit(r.ok ? 0 : 1); }
    else await tema({ skarpt, aterstall, temaGid });
  } catch (e) {
    console.error(`FEL: ${e.message}`);
    process.exit(1);
  }
}
