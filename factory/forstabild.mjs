#!/usr/bin/env node
// forstabild.mjs — A/B-test: en UGC-bild FÖRST i produktgalleriet (OPS-temat).
//
//   node factory/forstabild.mjs --butik carashell --handle takskyddet --bild <fil.png> --alt "<text>" [--torr]
//   node factory/forstabild.mjs --butik carashell --handle takskyddet --kolla
//
// Axels idé 2026-09-29: en skärmdump ur en av våra egna UGC-annonser, där
// personen håller upp produkten, som första produktbild ("det känns som att
// det skapar mer trust"). Byggt som ett riktigt A/B-test på temats egen motor
// (assets/ms-ab.js), så utfallet läses ur ordrarnas attribut "AB forstabild".
//
// Så här fungerar det:
//  1. Bilden läggs SIST i produktens media, med alt som börjar med "[UGC]".
//     Sist med flit: produktens featured_image (varukorgen, kassan, produkt-
//     kortens hoverbild = media[1], katalogflöden) blir då densamma för båda
//     grupperna, och bara galleriet skiljer.
//  2. snippets/ms-head.liquid får ett märkt block (opf-forstabild). CSS döljer
//     [UGC]-bilden för alla som INTE är variant a — kontrollen, JS avstängt och
//     testet avstängt ser alltså exakt dagens galleri. För variant a flyttar ett
//     skript bilden först med galleriets egen setActiveMedia(id, true) — samma
//     anrop Dawn gör när en variant har egen bild. CSS order:-1 täcker
//     ögonblicket innan skriptet hunnit köra.
//  3. "forstabild" läggs till i temainställningen ms_ab_tests (50/50, kaka 30
//     dagar). tema.mjs BEVARADE_TESTER ser till att nästa fabriksvarv inte
//     stryker raden.
// Allt idempotent. Varje skrivning läses tillbaka.
//
// Stänga testet: sätt "#forstabild" i Temainställningar → A/B (eller i
// settings_data.json). Då ser alla kontrollen. Vinner a: flytta bilden först
// i media på riktigt och stäng testet.

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join, dirname, basename } from 'node:path';

export const FORSTABILD_MARKE = 'opf-forstabild';
export const UGC_PREFIX = '[UGC]';
const SLUT = `{%- comment -%} /${FORSTABILD_MARKE} {%- endcomment -%}`;

/** Alt-texten får alltid prefixet — det är det enda CSS:en och skriptet känner igen bilden på. */
export function ugcAlt(alt) {
  const t = String(alt ?? '').trim();
  return t.startsWith(UGC_PREFIX) ? t : `${UGC_PREFIX} ${t}`.trim();
}

/** Blocket i ms-head. Ren funktion. */
export function forstabildBlock({ test = 'forstabild', prefix = UGC_PREFIX } = {}) {
  const inte = `html:not([data-ms-ab-${test}="a"])`;
  const a = `html[data-ms-ab-${test}="a"]`;
  const bild = `img[alt^="${prefix}"]`;
  return `{%- comment -%} ${FORSTABILD_MARKE}: A/B-testet "${test}" (factory/forstabild.mjs). Bilden vars alt börjar med ${prefix} visas FÖRST för variant a och döljs för alla andra — kontrollen, JS av och testet avstängt ser dagens galleri. {%- endcomment -%}
<style>
${inte} .product__media-item:has(${bild}),${inte} .thumbnail-list__item:has(${bild}),${inte} .product__media-list li:has(${bild}),${inte} .product-media-modal__content ${bild}{display:none!important}
${a} .product__media-list li:has(${bild}),${a} .thumbnail-list__item:has(${bild}){order:-1}
</style>
<script>
(function () {
  if (document.documentElement.getAttribute('data-ms-ab-${test}') !== 'a' || !window.customElements) return;
  function forst() {
    customElements.whenDefined('media-gallery').then(function () {
      document.querySelectorAll('media-gallery').forEach(function (g) {
        var img = g.querySelector('[data-media-id] ${bild.replace(/"/g, '\\"')}');
        var li = img && img.closest('[data-media-id]');
        if (li && typeof g.setActiveMedia === 'function') g.setActiveMedia(li.getAttribute('data-media-id'), true);
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', forst); else forst();
})();
</script>
${SLUT}`;
}

/** Lägger in (eller byter) blocket i ms-head. Idempotent. Ren funktion. */
export function laggInForstabild(msHead, alt = {}) {
  const block = forstabildBlock(alt);
  const s = String(msHead ?? '');
  const start = s.indexOf(`{%- comment -%} ${FORSTABILD_MARKE}:`);
  if (start === -1) return `${s.replace(/\s*$/, '')}\n\n${block}\n`;
  const slut = s.indexOf(SLUT, start);
  if (slut === -1) throw new Error(`ms-head har ${FORSTABILD_MARKE}-starten men inte slutmärket — rätta filen för hand innan verktyget körs igen.`);
  return `${s.slice(0, start)}${block}${s.slice(slut + SLUT.length)}`;
}

/** Media-ordningen med UGC-bilden SIST. Ren funktion. */
export function ordningMedUgcSist(mediaIds, ugcId) {
  const ovriga = mediaIds.filter((id) => id !== ugcId);
  return [...ovriga, ugcId];
}

// ---------------------------------------------------------------------------

async function huvud() {
  const arg = process.argv.slice(2);
  const val = (n) => (arg.includes(n) ? arg[arg.indexOf(n) + 1] : null);
  const butikId = val('--butik');
  const handle = val('--handle');
  const bild = val('--bild');
  const altText = val('--alt') ?? 'Kund håller upp produkten';
  const torr = arg.includes('--torr');
  const kolla = arg.includes('--kolla');
  if (!butikId || !handle || (!bild && !kolla)) {
    console.error('Användning: node factory/forstabild.mjs --butik <id> --handle <produkt> --bild <fil> --alt "<text>" [--torr] | --kolla');
    process.exit(1);
  }

  const ROT = dirname(fileURLToPath(import.meta.url));
  const { lasYaml } = await import('./yaml.mjs');
  const { anslut } = await import('./token.mjs');
  const { graphql, hamtaProduktViaHandle, hamtaArbetstema, hamtaTemafil, skrivTemafiler, verifieraTemafiler } = await import('./shopify.mjs');
  const { laddaUppBild } = await import('./filer.mjs');
  const { slaIhopTester, lasTemaJson, FORSTABILD_TEST } = await import('./tema.mjs');
  const { onskadDomanUr } = await import('./ops.mjs');
  const { lasState } = await import('./state.mjs');

  const butik = lasYaml(readFileSync(join(ROT, 'butiker', `${butikId}.yaml`), 'utf8'));
  const b = await anslut(butikId, { onskadDoman: onskadDomanUr(butik), utanEnvFil: true });
  console.log(`Connected: ${b.domain} ✓ (${b.name})`);

  const state = lasState(butikId, '_butik');
  const temaId = state.steg?.['tema-upload']?.arbetstemaId ?? null;
  const tema = await hamtaArbetstema(temaId);
  console.log(`Tema: ${tema.name} (${tema.role})`);

  const p = await hamtaProduktViaHandle(handle);
  if (!p) throw new Error(`Produkten ${handle} finns inte i ${b.domain}.`);
  const lasMedia = async () => (await graphql(
    `query($id: ID!) { product(id: $id) { media(first: 100) { nodes { id alt status ... on MediaImage { image { url } } } } } }`,
    { id: p.id }
  )).product.media.nodes;
  let media = await lasMedia();
  let ugc = media.find((m) => String(m.alt ?? '').startsWith(UGC_PREFIX));

  const msHead = await hamtaTemafil(tema.id, 'snippets/ms-head.liquid');
  const settingsRa = await hamtaTemafil(tema.id, 'config/settings_data.json');
  if (!msHead || !settingsRa) throw new Error('Temat saknar ms-head.liquid eller settings_data.json — är det OPS-temat?');
  const settings = lasTemaJson(settingsRa);
  const testerNu = String(settings.current?.ms_ab_tests ?? '');

  const rapport = () => {
    const i = ugc ? media.findIndex((m) => m.id === ugc.id) : -1;
    console.log(`UGC-bild: ${ugc ? `${ugc.alt} — plats ${i + 1} av ${media.length}` : 'saknas'}`);
    console.log(`ms-head: ${msHead.includes(FORSTABILD_MARKE) ? 'har blocket' : 'saknar blocket'}`);
    console.log(`ms_ab_tests: ${JSON.stringify(testerNu)}`);
  };
  if (kolla) { rapport(); return; }
  if (!existsSync(bild)) throw new Error(`Bilden finns inte: ${bild}`);
  if (torr) { rapport(); console.log('(torr — inget skrivet)'); return; }

  // 1. Bilden: Files → produktens media (bara om ingen [UGC]-bild finns).
  if (!ugc) {
    const fil = await laddaUppBild(bild, { alt: ugcAlt(altText), filnamn: basename(bild) });
    const d = await graphql(
      `mutation($productId: ID!, $media: [CreateMediaInput!]!) {
        productCreateMedia(productId: $productId, media: $media) { media { id } mediaUserErrors { field message } }
      }`,
      { productId: p.id, media: [{ originalSource: fil.url, mediaContentType: 'IMAGE', alt: ugcAlt(altText) }] }
    );
    const fel = d.productCreateMedia?.mediaUserErrors ?? [];
    if (fel.length) throw new Error(`productCreateMedia: ${fel.map((f) => f.message).join('; ')}`);
    const nyttId = d.productCreateMedia.media[0].id;
    for (let i = 0; i < 40; i++) {
      await new Promise((r) => setTimeout(r, 3000));
      media = await lasMedia();
      ugc = media.find((m) => m.id === nyttId);
      if (ugc?.status === 'READY' && ugc.image?.url) break;
      if (ugc?.status === 'FAILED') throw new Error('Shopify kunde inte behandla bilden.');
    }
    if (!ugc?.image?.url) throw new Error('UGC-bilden blev aldrig READY.');
    console.log(`✅ UGC-bilden uppladdad: ${ugc.image.url}`);
  } else {
    console.log(`UGC-bilden fanns redan (${ugc.id}) — återanvänds.`);
  }

  // 2. Sist i media.
  const ids = media.map((m) => m.id);
  if (ids[ids.length - 1] !== ugc.id) {
    const ordning = ordningMedUgcSist(ids, ugc.id);
    const r = await graphql(
      `mutation($id: ID!, $moves: [MoveInput!]!) { productReorderMedia(id: $id, moves: $moves) { job { id } mediaUserErrors { field message } } }`,
      { id: p.id, moves: [{ id: ugc.id, newPosition: String(ordning.length - 1) }] }
    );
    const fel = r.productReorderMedia?.mediaUserErrors ?? [];
    if (fel.length) throw new Error(`productReorderMedia: ${fel.map((f) => f.message).join('; ')}`);
    await new Promise((res) => setTimeout(res, 4000));
  }

  // 3. Temat: ms-head-blocket + testet i inställningen.
  const nyHead = laggInForstabild(msHead, { test: FORSTABILD_TEST });
  settings.current = { ...(settings.current ?? {}), ms_ab_tests: slaIhopTester(testerNu, FORSTABILD_TEST) };
  if (!(Number(settings.current.ms_ab_cookie_days) > 0)) settings.current.ms_ab_cookie_days = 30;
  const filer = {};
  if (nyHead !== msHead) filer['snippets/ms-head.liquid'] = nyHead;
  const nySettings = `${JSON.stringify(settings, null, 2)}\n`;
  if (settings.current.ms_ab_tests !== testerNu) filer['config/settings_data.json'] = nySettings;
  if (Object.keys(filer).length) {
    await skrivTemafiler(tema.id, filer);
    // Liquid jämförs byte för byte. settings_data.json packar Shopify om
    // (mätt 2026-09-29: 13 474 byte skrivna, 10 023 lagrade) — den läses
    // tillbaka nedan på VÄRDET i stället.
    const liquid = Object.fromEntries(Object.entries(filer).filter(([f]) => !f.endsWith('.json')));
    const v = Object.keys(liquid).length ? await verifieraTemafiler(tema.id, liquid) : { ok: true, fel: [] };
    if (!v.ok) throw new Error(`Tillbakaläsningen av temat stämmer inte: ${v.fel.join('; ')}`);
    console.log(`✅ Temat: ${Object.keys(filer).join(', ')} skrivna och tillbakalästa`);
  } else {
    console.log('Temat hade redan blocket och testet.');
  }

  // Tillbakaläsning.
  media = await lasMedia();
  const plats = media.findIndex((m) => m.id === ugc.id) + 1;
  const head2 = await hamtaTemafil(tema.id, 'snippets/ms-head.liquid');
  const tester2 = lasTemaJson(await hamtaTemafil(tema.id, 'config/settings_data.json')).current?.ms_ab_tests;
  if (!String(tester2).split("\n").includes(FORSTABILD_TEST)) throw new Error(`ms_ab_tests i temat saknar ${FORSTABILD_TEST} efter skrivningen: ${JSON.stringify(tester2)}`);
  console.log(`\nUGC-bild: plats ${plats} av ${media.length} (${plats === media.length ? 'sist ✓' : 'INTE sist ✗'})`);
  console.log(`ms-head: ${head2.includes(FORSTABILD_MARKE) ? 'blocket finns ✓' : 'blocket SAKNAS ✗'}`);
  console.log(`ms_ab_tests: ${JSON.stringify(tester2)} ${String(tester2).split('\n').includes(FORSTABILD_TEST) ? '✓' : '✗'}`);
  console.log(`\nGranska: https://${b.primaryDomain ?? b.domain}/products/${handle}?ms_ab=${FORSTABILD_TEST}:a (UGC först) och ?ms_ab=${FORSTABILD_TEST}:b (dagens).`);
  console.log('⚠️ En tvingad visning sätter kakan och märks "forced" på ordern — räknas bort i analysen.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  huvud().catch((e) => { console.error(`\n❌ ${e.message}\n`); process.exit(1); });
}
