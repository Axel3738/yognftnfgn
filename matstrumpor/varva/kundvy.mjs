// Kundvyn för värva en vän: landa som vän i Chromium och läs vad kunden får.
//
//   node matstrumpor/varva/kundvy.mjs              # temat som det ligger live
//   node matstrumpor/varva/kundvy.mjs --forhand    # skriptet injiceras i sidan (temat orört) — provet FÖRE --tema --skarpt
//   node matstrumpor/varva/kundvy.mjs --land NO    # samma sak som norsk kund (.com/nb)
//   node matstrumpor/varva/kundvy.mjs --kassa      # dessutom: paketet i varukorgen och kassans rabattrader
//
// Numret i länken är ett PROVNUMMER (inte en riktig kunds), så ingen kredit kan
// någonsin hamna fel av en provkörning. Ingen order läggs.
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lasKonfig, byggData, temaskript, SPRAKFIL, TEMASKRIPT_KALLA } from '../varva.mjs';

const HAR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HAR, '..', '..');
const PROVNUMMER = 'PROV0VARVA1';

const arg = process.argv.slice(2);
const har = (f) => arg.includes(f);
const land = (arg[arg.indexOf('--land') + 1] && har('--land') ? arg[arg.indexOf('--land') + 1] : 'SE').toUpperCase();
const SIDOR = { SE: 'https://matstrumpor.se', NO: 'https://matstrumpor.com/nb', DE: 'https://matstrumpor.com/de', GB: 'https://matstrumpor.com', US: 'https://matstrumpor.com', JP: 'https://matstrumpor.com/ja' };
const LOCALE = { SE: 'sv-SE', NO: 'nb-NO', DE: 'de-DE', GB: 'en-GB', US: 'en-US', JP: 'ja-JP' };

(await import('../../mejl/shopify.mjs')).kravProxy();
const konfig = lasKonfig();
const bas = SIDOR[land];
if (!bas) throw new Error(`okänt land ${land} (${Object.keys(SIDOR).join(', ')})`);
const { startaWebblasare } = await import('../../konkurrenter/adlibrary.mjs');
const { browser, ctx } = await startaWebblasare({ locale: LOCALE[land] });
const fel = [];
const ok = (villkor, text) => { console.log(`  ${villkor ? '✓' : '❌'} ${text}`); if (!villkor) fel.push(text); };
try {
  const sida = await ctx.newPage();
  // Landet först, med Shopifys eget landformulär (containern står i USA).
  await sida.goto(`${bas}/?country=${land}`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await sida.evaluate(async (l) => {
    const rot = (window.Shopify?.routes?.root) || '/';
    await fetch(`${rot}localization`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: `form_type=localization&utf8=%E2%9C%93&_method=put&return_to=%2F&country_code=${l}` });
  }, land);
  await sida.goto(`${bas}/?van=${PROVNUMMER}`, { waitUntil: 'load', timeout: 60_000 });
  if (har('--forhand')) {
    const js = temaskript(readFileSync(TEMASKRIPT_KALLA, 'utf8'), byggData(konfig), JSON.parse(readFileSync(SPRAKFIL, 'utf8')));
    await sida.addScriptTag({ content: js });
  } else {
    const src = await sida.evaluate(() => [...document.scripts].map((s) => s.src).find((s) => s.includes('ms-varva')) ?? null);
    ok(Boolean(src), `temat laddar ms-varva.js${src ? '' : ' — kör node matstrumpor/varva.mjs --tema --skarpt'}`);
  }
  await sida.waitForTimeout(3500);
  const vy = await sida.evaluate(async () => {
    const rot = (window.Shopify?.routes?.root) || '/';
    const vagn = await (await fetch(`${rot}cart.js`)).json();
    const ruta = document.getElementById('ms-varva-ruta');
    return { lang: document.documentElement.lang, valuta: window.Shopify?.currency?.active, koder: vagn.discount_codes, attribut: vagn.attributes, ruta: ruta?.innerText ?? null };
  });
  console.log(`  språk ${vy.lang}, valuta ${vy.valuta}`);
  ok((vy.koder ?? []).some((k) => k.code === konfig.kod), `vännens kod ${konfig.kod} ligger i varukorgen`);
  ok(vy.attribut?.[konfig.attribut] === PROVNUMMER, `varukorgen är märkt ${konfig.attribut}=${PROVNUMMER}`);
  ok(Boolean(vy.ruta), `rutan syns: "${(vy.ruta ?? '').replace(/\s*×\s*$/, '')}"`);
  if (vy.ruta) ok(!/\{van\}/.test(vy.ruta), 'rutan har ett belopp, ingen platshållare');
  await sida.screenshot({ path: join(ROT, 'matstrumpor', 'varva', 'output', `kundvy-${land}.png`) }).catch(() => {});

  if (har('--kassa')) {
    // Som paketväljaren: paketkoden via /discount/, sedan varorna.
    const vagn = await sida.evaluate(async () => {
      const rot = (window.Shopify?.routes?.root) || '/';
      await fetch(`${rot}discount/SUSHI-K1F1?redirect=${encodeURIComponent(rot + 'cart.js')}`);
      await fetch(`${rot}cart/add.js`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: [{ id: 52506473365843, quantity: 2 }, { id: 52940241207635, quantity: 2 }] }) });
      return (await fetch(`${rot}cart.js`)).json();
    });
    const koder = Object.fromEntries((vagn.discount_codes ?? []).map((d) => [d.code, d.applicable]));
    ok(koder['SUSHI-K1F1'] === true && koder[konfig.kod] === true, `paketkoden och vännens kod gäller båda i varukorgen (${JSON.stringify(koder)})`);
    console.log(`  varukorgen: ${vagn.total_price / 100} ${vagn.currency} att betala, rabatt ${vagn.total_discount / 100}`);
    await sida.goto(`${bas}/checkout`, { waitUntil: 'load', timeout: 90_000 }).catch(() => {});
    await sida.waitForTimeout(8000);
    const text = await sida.evaluate(() => document.body?.innerText ?? '');
    const rader = text.split('\n').filter((r) => /VAN-|SUSHI-K1F1|rabatt|Discount|Rabatt|Total|Totalt|Delsumma|Subtotal/i.test(r)).slice(0, 12);
    console.log(`  kassan (${sida.url().replace(/\?.*/, '')}):`);
    for (const r of rader) console.log(`    ${r}`);
    ok(text.includes(konfig.kod), `kassan visar ${konfig.kod}`);
    await sida.screenshot({ path: join(ROT, 'matstrumpor', 'varva', 'output', `kassa-${land}.png`), fullPage: true }).catch(() => {});
  }
} finally {
  await browser.close().catch(() => {});
}
console.log(fel.length ? `\n${fel.length} fel.` : '\nAllt stämmer.');
process.exit(fel.length ? 1 : 0);
