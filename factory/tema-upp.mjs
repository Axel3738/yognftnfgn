// Temasteget, del 1: OPS-temat (factory/tema/ops-tema.zip — matstrumpor-cro-v5,
// samma källa som HeimGuard) upp i butiken som OPUBLICERAT utkast.
//
//   node factory/tema-upp.mjs factory/butiker/<butik>.yaml [--namn "..."] [--torr]
//
// zip → staged upload → themeCreate. Temat är STRUKTUREN; brandingen läggs
// på efteråt av ops.mjs (brand-steget) och opf-sektionerna av tema-steget —
// kör `node factory/ops.mjs <butik> <produkt> --resume` när det här är klart.
// Publicerar aldrig: themePublish är API-spärrat, klicket är VA:ns
// (checklistans steg 10). Bygg alltid från zip:en i repot — aldrig från
// Dawn eller publika assets (Axels order 2026-09-08).

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';
import { lasYaml } from './yaml.mjs';
import { laddaEnv } from './env.mjs';
import { graphql, kontrolleraAnslutning } from './shopify.mjs';
import { stagedUpload } from './filer.mjs';

const FACTORY_ROT = dirname(fileURLToPath(import.meta.url));
export const TEMA_ZIP = join(FACTORY_ROT, 'tema', 'ops-tema.zip');

const sov = (ms) => new Promise((r) => setTimeout(r, ms));

export async function laddaUppTema(namn, zip = TEMA_ZIP) {
  if (!existsSync(zip)) throw new Error(`Temazip saknas: ${zip} — pulla main.`);
  const source = await stagedUpload(zip, { resource: 'FILE', mimeType: 'application/zip', filnamn: 'ops-tema.zip' });
  const data = await graphql(
    `mutation opsFactoryTema($source: URL!, $name: String!) {
      themeCreate(source: $source, name: $name) {
        theme { id name role processing }
        userErrors { field message }
      }
    }`,
    { source, name: namn }
  );
  const fel = data.themeCreate?.userErrors ?? [];
  if (fel.length > 0) throw new Error(`themeCreate: ${fel.map((f) => f.message).join('; ')}`);
  const tema = data.themeCreate.theme;

  // Shopify packar upp i bakgrunden — vänta tills filerna finns.
  for (let i = 0; i < 60; i++) {
    const q = await graphql(
      `query opsFactoryTemaStatus($id: ID!) {
        theme(id: $id) { id name role processing processingFailed files(first: 1) { nodes { filename } } }
      }`,
      { id: tema.id }
    );
    const t = q.theme;
    if (t?.processingFailed) throw new Error(`Temat ${t.name} gick inte att packa upp.`);
    if (t && !t.processing && (t.files?.nodes?.length ?? 0) > 0) return t;
    await sov(2000);
  }
  throw new Error('Temat blev aldrig färdigprocessat.');
}

async function huvud() {
  laddaEnv();
  const arg = process.argv.slice(2);
  const butiksfil = arg.find((a) => !a.startsWith('--') && a.endsWith('.yaml'));
  const torr = arg.includes('--torr') || arg.includes('--dry');
  if (!butiksfil) {
    console.error('Användning: node factory/tema-upp.mjs factory/butiker/<butik>.yaml [--namn "..."] [--torr]');
    process.exit(1);
  }
  const butik = lasYaml(readFileSync(butiksfil, 'utf8'));
  const brand = butik?.butik?.brand ?? 'OPS';
  const namn = arg.includes('--namn') ? arg[arg.indexOf('--namn') + 1] : `${brand} – CRO v1 (utkast)`;

  const shop = await kontrolleraAnslutning();
  console.log(`Connected: ${shop.myshopifyDomain} ✓`);
  console.log(`Tema "${namn}" ur ${TEMA_ZIP}`);
  if (torr) { console.log('(torrkörning — inget laddades upp)'); return; }

  const tema = await laddaUppTema(namn);
  console.log(`✅ Tema uppladdat: ${tema.name} (${tema.id}, ${tema.role})`);
  console.log('   Nästa: node factory/ops.mjs <butik> <produkt> --resume  (brand + opf-sektioner in i utkastet)');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  huvud().catch((e) => { console.error(`\n❌ ${e.message}\n`); process.exit(1); });
}
