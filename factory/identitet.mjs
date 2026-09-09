// identitet.mjs — loggan, faviconen och huvudmenyn.
//
//   node factory/identitet.mjs <butik-id> <produkt-handle> [--logga <fil>]
//
// Tre saker som kunden ser FÖRST och som fabriken aldrig satte (Axels bakläxa
// 2026-09-09 på DryTrek — butiken nådde granskning utan logga och med Dawns
// meny):
//
//   1. `settings.logo` pekade fortfarande på BAS-TEMATS logga, en fil som inte
//      ens finns i den nya butiken. Headern föll då tillbaka på ren text.
//      ⚠️ Av-brandningen städade `brand_image` men inte `logo` — två olika
//      inställningar, samma fel.
//   2. `settings.favicon` var osatt — fliken visade Shopifys default.
//   3. `main-menu` var kvar på Dawns Home / Catalog / Contact. "Catalog" går
//      till /collections/all, som är TOM i en enproduktsbutik.
//
// Fabriken skrev bara footer-menyn. Huvudmenyn är den kunden faktiskt ser.

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { lasYaml } from './yaml.mjs';
import { laddaEnv } from './env.mjs';
import {
  graphql,
  hamtaArbetstema,
  hamtaTemafil,
  skrivTemafiler,
  skrivMeny,
} from './shopify.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));
const sov = (ms) => new Promise((r) => setTimeout(r, ms));

// Laddar upp en LOKAL fil till butikens filarkiv. factory/filer.mjs tar
// URL:er; loggan ligger på disk, så den behöver staged upload.
export async function laddaUppLokalBild(sokvag, filnamn) {
  const data = readFileSync(sokvag);
  const staged = await graphql(
    `mutation opsFactoryLoggaStaged($input: [StagedUploadInput!]!) {
      stagedUploadsCreate(input: $input) {
        stagedTargets { url resourceUrl parameters { name value } }
        userErrors { field message }
      }
    }`,
    {
      input: [{ resource: 'FILE', filename: filnamn, mimeType: 'image/png', httpMethod: 'POST', fileSize: String(data.length) }],
    }
  );
  const fel = staged.stagedUploadsCreate?.userErrors ?? [];
  if (fel.length > 0) throw new Error(`Staged upload: ${fel.map((f) => f.message).join('; ')}`);
  const mal = staged.stagedUploadsCreate.stagedTargets[0];

  const form = new FormData();
  for (const p of mal.parameters) form.append(p.name, p.value);
  form.append('file', new Blob([data], { type: 'image/png' }), filnamn);
  const upp = await fetch(mal.url, { method: 'POST', body: form });
  if (!upp.ok) throw new Error(`Uppladdningen misslyckades (${upp.status})`);

  const skapad = await graphql(
    `mutation opsFactoryLoggaFil($files: [FileCreateInput!]!) {
      fileCreate(files: $files) {
        files { id fileStatus ... on MediaImage { image { url } } }
        userErrors { field message }
      }
    }`,
    { files: [{ originalSource: mal.resourceUrl, contentType: 'IMAGE', alt: filnamn }] }
  );
  const ffel = skapad.fileCreate?.userErrors ?? [];
  if (ffel.length > 0) throw new Error(`fileCreate: ${ffel.map((f) => f.message).join('; ')}`);

  // Shopify bearbetar bilden asynkront — utan väntan saknar den url och
  // temat får en trasig referens.
  const bas = filnamn.replace(/\.[^.]+$/, '');
  for (let i = 0; i < 30; i++) {
    await sov(2000);
    const d = await graphql(
      `query opsFactoryHittaFil($fraga: String!) {
        files(first: 10, query: $fraga) { nodes { ... on MediaImage { image { url } } } }
      }`,
      { fraga: bas }
    );
    const url = d.files?.nodes?.map((n) => n.image?.url).find(Boolean);
    if (url) return { url, handle: `shopify://shop_images/${bas}` };
  }
  throw new Error(`Bilden ${filnamn} blev aldrig färdigbearbetad.`);
}

export function huvudmenyRader(butik, produkt, handle) {
  const b = butik.butik;
  return [
    { titel: 'Hem', url: '/' },
    // Aldrig /collections/all i en enproduktsbutik — den sidan är tom.
    { titel: produkt.produkt.namn.split(/[–—-]/)[0].trim(), url: `/products/${handle}` },
    { titel: 'Frakt & retur', url: '/pages/fraktpolicy' },
    { titel: 'Kontakt', url: '/pages/contact' },
  ].filter((r) => r.titel && r.url);
}

if (process.argv[1] && process.argv[1].endsWith('identitet.mjs')) {
  laddaEnv();
  const arg = process.argv.slice(2);
  const [butikId, handle] = arg.filter((a) => !a.startsWith('--'));
  if (!butikId || !handle) throw new Error('Användning: node factory/identitet.mjs <butik-id> <produkt-handle>');
  const loggaFil = arg.includes('--logga')
    ? arg[arg.indexOf('--logga') + 1]
    : join(ROT, 'output', handle, 'logo-b.png');

  const butik = lasYaml(readFileSync(join(ROT, 'butiker', `${butikId}.yaml`), 'utf8'));
  const produkt = lasYaml(readFileSync(join(ROT, 'produkter', `${handle}.yaml`), 'utf8'));

  // 1–2. Loggan och faviconen.
  if (!existsSync(loggaFil)) throw new Error(`Loggan saknas: ${loggaFil}`);
  const filnamn = `${butikId}-logga.png`;
  const bild = await laddaUppLokalBild(loggaFil, filnamn);
  console.log(`✅ Loggan uppladdad: ${bild.handle}`);

  const tema = await hamtaArbetstema();
  if (!tema) throw new Error('Inget utkasttema.');
  const rå = await hamtaTemafil(tema.id, 'config/settings_data.json');
  const sd = JSON.parse(String(rå).replace(/^\s*\/\*[\s\S]*?\*\//, ''));
  sd.current.logo = bild.handle;
  sd.current.favicon = bild.handle;
  sd.current.logo_width = sd.current.logo_width || 140;
  await skrivTemafiler(tema.id, { 'config/settings_data.json': JSON.stringify(sd, null, 2) });

  // settings_data.json skrivs om av Shopify vid mottagning, så byte-koll
  // duger inte — läs tillbaka och jämför VÄRDET.
  const efter = JSON.parse(
    String(await hamtaTemafil(tema.id, 'config/settings_data.json')).replace(/^\s*\/\*[\s\S]*?\*\//, '')
  );
  if (efter.current.logo !== bild.handle) {
    throw new Error(`Loggan fastnade inte: temat säger ${JSON.stringify(efter.current.logo)}`);
  }
  console.log(`✅ logo + favicon satta i "${tema.name}" — tillbakalästa`);

  // 3. Huvudmenyn.
  const rader = huvudmenyRader(butik, produkt, handle);
  const meny = await skrivMeny('main-menu', 'Main menu', rader);
  console.log(`✅ main-menu: ${rader.map((r) => r.titel).join(' · ')}`);
  if (meny.orord) console.log('   (menyn var redan rätt)');
}
