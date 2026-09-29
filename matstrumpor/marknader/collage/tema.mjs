#!/usr/bin/env node
// Lägger startsidans collage "Matstrumpor i världen" i matstrumpor.se:s
// publicerade tema: 13 bilder som assets, sektionen sections/ms-varlden.liquid
// och en rad i templates/index.json (efter "berattelse"). BARA startsidan.
//
//   node matstrumpor/marknader/collage/tema.mjs            # torrt: visar planen
//   node matstrumpor/marknader/collage/tema.mjs --skarpt   # skriver, läser tillbaka, kollar sajten
//
// Idempotent: finns sektionen redan i index.json flyttas inget, bara filerna
// skrivs om. Ta bort: radera "ms_varlden" ur index.json i temaredigeraren.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lasButik, skapaKlient } from '../../../sparning/butik.mjs';

const HAR = dirname(fileURLToPath(import.meta.url));
const K = JSON.parse(readFileSync(join(HAR, 'collage.json'), 'utf8'));
const SEKTION_ID = 'ms_varlden';
const EFTER = 'berattelse';
const skarpt = process.argv.includes('--skarpt');

/** index.json-texten → ny text med sektionen insatt. Ren funktion. */
export function medSektion(text) {
  const start = text.indexOf('{', text.indexOf('*/') + 2);
  const mall = JSON.parse(text.slice(start));
  if (!Array.isArray(mall.order)) throw new Error('index.json saknar "order" — inget skrivs.');
  if (mall.sections[SEKTION_ID]) return { text, nytt: false };
  mall.sections[SEKTION_ID] = { type: 'ms-varlden', settings: {} };
  const i = mall.order.indexOf(EFTER);
  mall.order.splice(i >= 0 ? i + 1 : mall.order.length, 0, SEKTION_ID);
  return { text: JSON.stringify(mall, null, 2), nytt: true };
}

export function sektionsText() {
  const rutor = K.rutor.map((r) => `${r.id}:${r.namn}`).join(',');
  if (/[',]/.test(K.rutor.map((r) => r.namn).join(''))) throw new Error('landsnamn får inte bära komma eller apostrof');
  return readFileSync(join(HAR, 'ms-varlden.liquid'), 'utf8').replace('__RUTOR__', rutor);
}

async function main() {
  (await import('../../../mejl/shopify.mjs')).kravProxy();
  const klient = await skapaKlient(lasButik('matstrumpor'));
  const d = await klient.graphql('{ themes(first: 5, roles: [MAIN]) { nodes { id name role } } }');
  const tema = d.themes.nodes.find((t) => t.role === 'MAIN');
  const las = async (namn) => {
    const r = await klient.graphql(
      `query($id: ID!, $n: [String!]) { theme(id: $id) { files(filenames: $n, first: 50) { nodes { filename size body { ... on OnlineStoreThemeFileBodyText { content } } } } } }`,
      { id: tema.id, n: namn });
    return r.theme.files.nodes;
  };
  const index = (await las(['templates/index.json']))[0].body.content;
  const ny = medSektion(index);
  const bilder = [K.karta, ...K.rutor].map((b) => ({
    filename: `assets/ms-varlden-${b.id}.jpg`,
    body: { type: 'BASE64', value: readFileSync(join(HAR, 'bilder', `${b.id}.jpg`)).toString('base64') },
  }));
  console.log(`Tema: "${tema.name}"`);
  console.log(`  ${bilder.length} bilder + sections/ms-varlden.liquid`);
  console.log(`  index.json: ${ny.nytt ? `ny sektion "${SEKTION_ID}" efter "${EFTER}"` : 'sektionen finns redan'}`);
  if (!skarpt) { console.log('Torrt: inget skrivet. Kör med --skarpt.'); return; }

  const skriv = async (files) => {
    const r = await klient.graphql(
      `mutation($t: ID!, $f: [OnlineStoreThemeFilesUpsertFileInput!]!) { themeFilesUpsert(themeId: $t, files: $f) { upsertedThemeFiles { filename } userErrors { filename message } } }`,
      { t: tema.id, f: files });
    const fel = r.themeFilesUpsert.userErrors;
    if (fel.length) throw new Error(JSON.stringify(fel));
  };
  // Bilder och sektion först — index.json får aldrig peka på en sektion som saknas.
  for (let i = 0; i < bilder.length; i += 4) await skriv(bilder.slice(i, i + 4));
  await skriv([{ filename: 'sections/ms-varlden.liquid', body: { type: 'TEXT', value: sektionsText() } }]);
  const koll = await las([...bilder.map((b) => b.filename), 'sections/ms-varlden.liquid']);
  if (koll.length !== bilder.length + 1) throw new Error(`bara ${koll.length} av ${bilder.length + 1} filer lästes tillbaka`);
  console.log(`  ✓ ${koll.length} filer skrivna och lästa tillbaka`);
  if (ny.nytt) {
    await skriv([{ filename: 'templates/index.json', body: { type: 'TEXT', value: ny.text } }]);
    const efter = (await las(['templates/index.json']))[0].body.content;
    if (!efter.includes(`"${SEKTION_ID}"`)) throw new Error('index.json lästes tillbaka utan sektionen');
    console.log('  ✓ index.json bär sektionen');
  }
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())) {
  main().catch((e) => { console.error(e.stack ?? e.message); process.exit(1); });
}
