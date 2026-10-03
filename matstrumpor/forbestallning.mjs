#!/usr/bin/env node
// forbestallning.mjs — förbeställning i Matstrumpor medan lagret är slutsålt.
//
// Axels beslut 2026-10-03: "jag börjar med att köra lite pre order på matstrumporna eftersom de
// redan är sold out". Allt är slut, nästa leverans är i lagret om 8 dagar (2026-10-11) och den
// säljer också slut snabbt. Evolve Q4 (docs/os/evolve/Q4-2026.md → Backend): sälj vidare som
// förbeställning med ärligt datum, annars tror kunden att paketet kommer om några dagar och
// det blir arga mejl och chargebacks.
//
// Vad som läggs in i det publicerade temat (alltid samma tre ställen, alla språk):
//   snippets/ms-forbestallning.liquid  rutan "Förbeställning" på produktsidan + en rad i korgen
//   snippets/ms-delivery-estimate      rutan ovanför "Beräknad leverans", och datumet räknas
//                                      från packningsdagen i stället för i dag (data-start)
//   assets/ms-cro.js                   <ms-delivery> läser data-start
//   snippets/cart-drawer.liquid        raden i varukorgslådan, ovanför Trustpilot-raden
//   sections/main-cart-footer.liquid   raden på varukorgssidan, ovanför kassaknappen
//
// Av och på styrs av shop-metafältet matstrumpor.forbestallning (json):
//   { aktiv, packning_fran, skickas_fran }. Rutan släcker sig själv dagen då skickas_fran
//   inträffar, och --av släcker den direkt. Temafilerna står kvar och ritar ingenting.
//
//   node matstrumpor/forbestallning.mjs                     # torrt: visar vad som byts
//   node matstrumpor/forbestallning.mjs --skarpt            # lägger in, sätter metafältet, läser tillbaka
//   node matstrumpor/forbestallning.mjs --av --skarpt       # släcker (metafältet aktiv: false)
//   node matstrumpor/forbestallning.mjs --kundvy            # Chromium som kund: syns rutan på sv/en/de/ja?
//
// Idempotent: en fil som redan bär markören rörs inte (snippeten skrivs alltid om, så ny text
// eller nytt datum går ut med en ny --skarpt). Originalen sparas i forbestallning/original/.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lasButik, skapaKlient } from '../sparning/butik.mjs';
import { bytExakt } from './korglada.mjs';

const HAR = dirname(fileURLToPath(import.meta.url));
const MAPP = join(HAR, 'forbestallning');
const ORIGINAL = join(MAPP, 'original');
export const MARK = 'ms-forbestallning';
export const METAFALT = { namespace: 'matstrumpor', key: 'forbestallning' };

export const SPRAK = ['sv', 'nb', 'da', 'fi', 'de', 'fr', 'nl', 'es', 'it', 'pl', 'pt-PT', 'en', 'ja', 'zh-TW'];
const INTL = { sv: 'sv-SE', nb: 'nb-NO', da: 'da-DK', fi: 'fi-FI', de: 'de-DE', fr: 'fr-FR', nl: 'nl-NL', es: 'es-ES', it: 'it-IT', pl: 'pl-PL', 'pt-PT': 'pt-PT', en: 'en-US', ja: 'ja-JP', 'zh-TW': 'zh-TW' };

export function lasKonfig() {
  return JSON.parse(readFileSync(join(MAPP, 'konfig.json'), 'utf8'));
}
export function lasTexter() {
  return JSON.parse(readFileSync(join(MAPP, 'texter.json'), 'utf8'));
}

/** "13 oktober", "October 13", "10月13日" … ur ISO-datumet, i språkets egen form. */
export function datumText(iso, sprak) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat(INTL[sprak], { day: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(y, m - 1, d)));
}

const escLiquid = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Kontroll av texterna: alla språk, alla fält, {datum} där det ska, inga tankstreck. */
export function kontrolleraTexter(texter) {
  const fel = [];
  for (const s of SPRAK) {
    const t = texter[s];
    if (!t) { fel.push(`${s}: saknas`); continue; }
    for (const f of ['rubrik', 'produkt', 'bradska', 'korg']) {
      if (!t[f] || typeof t[f] !== 'string') fel.push(`${s}.${f}: saknas`);
      else if (/[—–]/.test(t[f])) fel.push(`${s}.${f}: tankstreck`);
    }
    for (const f of ['produkt', 'korg']) if (t[f] && (t[f].match(/\{datum\}/g) ?? []).length !== 1) fel.push(`${s}.${f}: {datum} ska stå exakt en gång`);
    if (/[四]/.test(Object.values(t).join(''))) fel.push(`${s}: talet fyra`);
  }
  return fel;
}

/** Snippeten. Datumet bakas in per språk; metafältet bär av/på och slutdagen. */
export function byggSnippet(texter, konfig) {
  const gren = (falt) => {
    const rader = SPRAK.filter((s) => s !== 'sv').map((s) => `{%- when '${s}' -%}${escLiquid(texter[s][falt].replace('{datum}', datumText(konfig.skickas_fran, s)))}`);
    return `{%- case request.locale.iso_code -%}${rader.join('')}{%- else -%}${escLiquid(texter.sv[falt].replace('{datum}', datumText(konfig.skickas_fran, 'sv')))}{%- endcase -%}`;
  };
  return `{%- comment -%}
  ${MARK} — förbeställningen medan lagret är slutsålt (matstrumpor/forbestallning.mjs, Axel 2026-10-03).
  Skrivs om av skriptet — ändra texterna i matstrumpor/forbestallning/texter.json, inte här.
  Ritar bara när shop-metafältet matstrumpor.forbestallning är aktivt och skickas_fran inte inträffat.
  Parametrar: lage ('produkt' | 'korg')
{%- endcomment -%}
{%- liquid
  assign ms_fb = shop.metafields.matstrumpor.forbestallning.value
  assign ms_fb_idag = 'now' | date: '%Y%m%d' | plus: 0
  assign ms_fb_slut = ms_fb.skickas_fran | remove: '-' | plus: 0
-%}
{%- if ms_fb.aktiv == true and ms_fb_idag < ms_fb_slut -%}
  {%- if lage == 'korg' -%}
<p class="ms-forbestallning ms-forbestallning--korg" style="margin: 8px 0 10px; padding: 8px 12px; border-radius: 8px; background: #fff4e6; border: 1px solid #dd821d; font-size: 0.95rem; font-weight: 600; text-align: left;">${gren('korg')}</p>
  {%- else -%}
<div class="ms-forbestallning" style="margin: 14px 0 6px; padding: 12px 14px; border-radius: 10px; background: #fff4e6; border: 2px solid #dd821d;">
  <p style="margin: 0 0 4px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: #b8640f; font-size: 0.85rem;">${gren('rubrik')}</p>
  <p style="margin: 0 0 4px; font-weight: 600;">${gren('produkt')}</p>
  <p style="margin: 0; font-size: 0.95rem;">${gren('bradska')}</p>
</div>
  {%- endif -%}
{%- endif -%}
`;
}

// ---- patcharna -------------------------------------------------------------------

const LEV_SOK = '<ms-delivery class="ms-scope"\n';
const LEV_NY = `{%- comment -%} ${MARK}: rutan + packningsdagen som start (matstrumpor/forbestallning.mjs) {%- endcomment -%}
{%- render 'ms-forbestallning', lage: 'produkt' -%}
{%- liquid
  assign ms_fb = shop.metafields.matstrumpor.forbestallning.value
  assign ms_fb_idag = 'now' | date: '%Y%m%d' | plus: 0
  assign ms_fb_slut = ms_fb.skickas_fran | remove: '-' | plus: 0
-%}
<ms-delivery class="ms-scope"
  {% if ms_fb.aktiv == true and ms_fb_idag < ms_fb_slut %}data-start="{{ ms_fb.packning_fran }}"{% endif %}
`;
export function patchaLeverans(kod) {
  if (kod.includes(MARK)) return { kod, byten: [] };
  return { kod: bytExakt(kod, LEV_SOK, LEV_NY), byten: ['rutan + data-start'] };
}

const JS_SOK = `      // Helg: packning startar först på måndag.
      var wd = start.getDay();`;
const JS_NY = `      // ${MARK}: förbeställning — packningen börjar först när lagret är inne (data-start, ÅÅÅÅ-MM-DD).
      if (this.dataset.start) {
        var ms_fb = this.dataset.start.split('-');
        var ms_fb_start = new Date(Number(ms_fb[0]), Number(ms_fb[1]) - 1, Number(ms_fb[2]));
        if (!isNaN(ms_fb_start.getTime()) && ms_fb_start > start) start = ms_fb_start;
      }
      // Helg: packning startar först på måndag.
      var wd = start.getDay();`;
export function patchaJs(kod) {
  if (kod.includes(MARK)) return { kod, byten: [] };
  return { kod: bytExakt(kod, JS_SOK, JS_NY), byten: ['<ms-delivery> läser data-start'] };
}

const LADA_SOK = "        {% render 'ms-trustpilot-rad', kompakt: true %}\n        <!-- CTAs -->";
const LADA_NY = `        {%- comment -%} ${MARK} {%- endcomment -%}{% render 'ms-forbestallning', lage: 'korg' %}\n${LADA_SOK}`;
export function patchaLada(kod) {
  if (kod.includes(MARK)) return { kod, byten: [] };
  return { kod: bytExakt(kod, LADA_SOK, LADA_NY), byten: ['raden i lådan'] };
}

const KORG_SOK = '              <div class="cart__ctas" {{ block.shopify_attributes }}>';
const KORG_NY = `              {%- comment -%} ${MARK} {%- endcomment -%}{% render 'ms-forbestallning', lage: 'korg' %}\n${KORG_SOK}`;
export function patchaKorg(kod) {
  if (kod.includes(MARK)) return { kod, byten: [] };
  return { kod: bytExakt(kod, KORG_SOK, KORG_NY), byten: ['raden på korgsidan'] };
}

export const PATCHAR = {
  'snippets/ms-delivery-estimate.liquid': patchaLeverans,
  'assets/ms-cro.js': patchaJs,
  'snippets/cart-drawer.liquid': patchaLada,
  'sections/main-cart-footer.liquid': patchaKorg,
};
export const SNIPPET = 'snippets/ms-forbestallning.liquid';

// ---- butiken ---------------------------------------------------------------------

async function huvudtema(k) {
  const th = await k.graphql('{ themes(first: 30) { nodes { id name role } } }');
  const t = th.themes.nodes.find((x) => x.role === 'MAIN');
  if (!t) throw new Error('inget publicerat tema');
  return t;
}
async function lasFiler(k, temaId, filer) {
  const d = await k.graphql('query($id: ID!, $f: [String!]) { theme(id: $id) { files(filenames: $f, first: 50) { nodes { filename body { ... on OnlineStoreThemeFileBodyText { content } } } } } }', { id: temaId, f: filer });
  return Object.fromEntries(d.theme.files.nodes.map((n) => [n.filename, n.body?.content ?? null]));
}
async function skrivMetafalt(k, varde) {
  const q = await k.graphql(`{ shop { id } }`);
  await k.graphql('mutation($m: [MetafieldsSetInput!]!) { metafieldsSet(metafields: $m) { metafields { id } userErrors { field message } } }',
    { m: [{ ownerId: q.shop.id, namespace: METAFALT.namespace, key: METAFALT.key, type: 'json', value: JSON.stringify(varde) }] });
  const las = await k.graphql(`{ shop { metafield(namespace: "${METAFALT.namespace}", key: "${METAFALT.key}") { value } } }`);
  const tillbaka = JSON.parse(las.shop.metafield?.value ?? 'null');
  if (JSON.stringify(tillbaka) !== JSON.stringify(varde)) throw new Error(`metafältet lästes tillbaka som ${JSON.stringify(tillbaka)}`);
  return tillbaka;
}

async function kor({ skarpt, av, logg = console.log }) {
  const konfig = lasKonfig();
  const k = await skapaKlient(lasButik('matstrumpor'));
  if (av) {
    if (!skarpt) { logg('torrt: skulle sätta matstrumpor.forbestallning aktiv: false'); return; }
    const v = await skrivMetafalt(k, { ...konfig, aktiv: false });
    logg(`✓ förbeställningen AV — metafältet tillbakaläst: ${JSON.stringify(v)}`);
    return;
  }
  const texter = lasTexter();
  const fel = kontrolleraTexter(texter);
  if (fel.length) throw new Error(`texterna: ${fel.join('; ')}`);
  const tema = await huvudtema(k);
  logg(`tema: ${tema.name} (${tema.id})`);
  const filer = await lasFiler(k, tema.id, Object.keys(PATCHAR));
  const skriv = [{ filename: SNIPPET, body: { type: 'TEXT', value: byggSnippet(texter, konfig) } }];
  mkdirSync(ORIGINAL, { recursive: true });
  for (const [fil, patcha] of Object.entries(PATCHAR)) {
    if (filer[fil] == null) throw new Error(`${fil} finns inte i temat`);
    const { kod, byten } = patcha(filer[fil]);
    if (!byten.length) { logg(`  ${fil}: redan inlagd`); continue; }
    const orig = join(ORIGINAL, fil.replace(/\//g, '__'));
    if (!existsSync(orig)) writeFileSync(orig, filer[fil]);
    skriv.push({ filename: fil, body: { type: 'TEXT', value: kod } });
    logg(`  ${fil}: ${byten.join(', ')}`);
  }
  logg(`  ${SNIPPET}: skrivs (datum ${konfig.skickas_fran}, ${SPRAK.length} språk)`);
  for (const s of ['sv', 'en', 'ja']) logg(`    ${s}: ${texter[s].korg.replace('{datum}', datumText(konfig.skickas_fran, s))}`);
  mkdirSync(join(HAR, 'output', 'forbestallning'), { recursive: true });
  for (const f of skriv) writeFileSync(join(HAR, 'output', 'forbestallning', f.filename.replace(/\//g, '__')), f.body.value);
  if (!skarpt) { logg('torrt: inget skrivet (filerna i matstrumpor/output/forbestallning/)'); return; }

  const v = await skrivMetafalt(k, { ...konfig, aktiv: true });
  logg(`✓ metafältet tillbakaläst: ${JSON.stringify(v)}`);
  const u = await k.graphql('mutation($id: ID!, $files: [OnlineStoreThemeFilesUpsertFileInput!]!) { themeFilesUpsert(themeId: $id, files: $files) { upsertedThemeFiles { filename } userErrors { filename code message } } }', { id: tema.id, files: skriv });
  const ufel = u.themeFilesUpsert?.userErrors ?? [];
  if (ufel.length) throw new Error(`themeFilesUpsert: ${ufel.map((f) => `${f.filename}: ${f.message}`).join('; ')}`);
  // Shopify kan svara med den gamla filen några sekunder efter skrivningen (mätt 2026-10-03 på
  // ms-cro.js: olika direkt, identisk en minut senare) — läs om upp till fem gånger.
  let kvar = skriv.map((f) => f.filename);
  for (let forsok = 1; kvar.length && forsok <= 5; forsok++) {
    if (forsok > 1) await new Promise((r) => setTimeout(r, 5000));
    const tillbaka = await lasFiler(k, tema.id, kvar);
    kvar = kvar.filter((fil) => tillbaka[fil] !== skriv.find((f) => f.filename === fil).body.value);
  }
  if (kvar.length) throw new Error(`lästes inte tillbaka likadant efter fem försök: ${kvar.join(', ')}`);
  logg(`✓ ${skriv.length} filer skrivna och tillbakalästa`);
}

// Kundvyn: produktsidan + korgen i Chromium, som kund i några länder.
export async function kundvy({ logg = console.log } = {}) {
  let pw;
  try { pw = await import('playwright'); } catch { pw = await import('/opt/node-tools/node_modules/playwright/index.mjs'); }
  const b = await pw.chromium.launch({ args: ['--ignore-certificate-errors'] });
  const prov = [
    ['sv', 'https://matstrumpor.se/products/sushi-strumpor?country=SE'],
    ['en', 'https://matstrumpor.com/products/sushi-strumpor?country=US'],
    ['de', 'https://matstrumpor.com/de/products/sushi-strumpor?country=DE'],
    ['ja', 'https://matstrumpor.com/ja/products/sushi-strumpor?country=JP'],
  ];
  const texter = lasTexter();
  let ok = 0;
  for (const [s, url] of prov) {
    const sida = await b.newPage({ ignoreHTTPSErrors: true });
    await sida.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sida.waitForTimeout(2500);
    const ruta = await sida.locator('.ms-forbestallning:not(.ms-forbestallning--korg)').first().innerText().catch(() => null);
    const lev = await sida.locator('[data-ms-delivery-range]').first().innerText().catch(() => null);
    const lang = await sida.evaluate(() => document.documentElement.lang);
    // Rubriken visas i versaler (text-transform), så jämför utan skiftläge.
    const ratt = Boolean(ruta && ruta.toLowerCase().includes(texter[s].rubrik.toLowerCase()));
    logg(`${ratt ? '✓' : '✗'} ${s} (lang=${lang}): ${ruta ? ruta.replace(/\s+/g, ' ') : 'INGEN RUTA'} | leverans: ${lev}`);
    if (ratt) ok++;
    await sida.screenshot({ path: join(HAR, 'output', 'forbestallning', `kundvy-${s}.png`), fullPage: false });
    if (s === 'sv') {
      // Korgen: lägg en låda i vagnen med Shopifys eget API och läs korgsidan.
      const korg = await sida.evaluate(async () => {
        const p = await (await fetch('/products/sushi-strumpor.js')).json();
        await fetch('/cart/add.js', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: [{ id: p.variants[0].id, quantity: 1 }] }) });
        const html = await (await fetch('/cart?country=SE')).text();
        const m = /class="ms-forbestallning ms-forbestallning--korg"[^>]*>([^<]*)</.exec(html);
        return m ? m[1].trim() : null;
      });
      const kok = korg && korg.includes(texter.sv.korg.split('{datum}')[0].trim());
      logg(`${kok ? '✓' : '✗'} sv korgsidan: ${korg ?? 'INGEN RAD'}`);
      if (kok) ok++; else ok -= 100;
    }
    await sida.close();
  }
  await b.close();
  return ok === prov.length + 1;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const a = process.argv.slice(2);
  try {
    if (a.includes('--kundvy')) process.exit((await kundvy()) ? 0 : 1);
    await kor({ skarpt: a.includes('--skarpt'), av: a.includes('--av') });
  } catch (e) { console.error(`✗ ${e.message}`); process.exit(1); }
}
