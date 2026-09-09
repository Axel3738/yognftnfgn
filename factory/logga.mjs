// Laddar upp butikens logga och favicon till Shopify Files och sätter dem
// i utkasttemats inställningar.
//
//   node factory/logga.mjs <logga.png> [--favicon <favicon.png>] [--bredd 180]
//
// Loggan VISAS i chatten innan den sätts (Axels krav 2026-09-08) — det här
// skriptet kör bara det Axel redan godkänt.

import { readFileSync, existsSync } from 'node:fs';
import { basename } from 'node:path';
import { pathToFileURL } from 'node:url';
import { laddaEnv } from './env.mjs';
import { graphql, hamtaUtkastTema, hamtaTemafil, skrivTemafiler } from './shopify.mjs';

async function stagedUpload(filnamn, storlek, mime) {
  const data = await graphql(
    `mutation opsFactoryBildStaged($input: [StagedUploadInput!]!) {
      stagedUploadsCreate(input: $input) {
        stagedTargets { url resourceUrl parameters { name value } }
        userErrors { field message }
      }
    }`,
    {
      input: [
        { resource: 'FILE', filename: filnamn, mimeType: mime, httpMethod: 'POST', fileSize: String(storlek) },
      ],
    }
  );
  const fel = data.stagedUploadsCreate?.userErrors ?? [];
  if (fel.length > 0) throw new Error(fel.map((f) => f.message).join('; '));
  return data.stagedUploadsCreate.stagedTargets[0];
}

// Shopify packar upp filen asynkront — utan väntan får man tillbaka en fil
// utan `image.url` och temat pekar på ingenting.
async function vantaPaFil(id, { forsok = 30, paus = 2000 } = {}) {
  for (let i = 0; i < forsok; i += 1) {
    const data = await graphql(
      `query opsFactoryFil($id: ID!) {
        node(id: $id) { ... on MediaImage { id fileStatus image { url } } }
      }`,
      { id }
    );
    const n = data.node;
    if (n?.fileStatus === 'READY' && n.image?.url) return n;
    if (n?.fileStatus === 'FAILED') throw new Error('Shopify kunde inte behandla bilden.');
    await new Promise((r) => setTimeout(r, paus));
  }
  throw new Error('Bilden blev inte klar i tid.');
}

export async function laddaUppBild(sokvag) {
  if (!existsSync(sokvag)) throw new Error(`Filen saknas: ${sokvag}`);
  const buf = readFileSync(sokvag);
  const filnamn = basename(sokvag);
  const mal = await stagedUpload(filnamn, buf.length, 'image/png');

  const form = new FormData();
  for (const { name, value } of mal.parameters) form.append(name, value);
  form.append('file', new Blob([buf], { type: 'image/png' }), filnamn);
  const svar = await fetch(mal.url, { method: 'POST', body: form });
  if (!svar.ok) throw new Error(`Uppladdningen nekades (${svar.status})`);

  const data = await graphql(
    `mutation opsFactoryFilSkapa($files: [FileCreateInput!]!) {
      fileCreate(files: $files) {
        files { ... on MediaImage { id fileStatus } }
        userErrors { field message }
      }
    }`,
    { files: [{ originalSource: mal.resourceUrl, contentType: 'IMAGE', alt: filnamn }] }
  );
  const fel = data.fileCreate?.userErrors ?? [];
  if (fel.length > 0) throw new Error(fel.map((f) => f.message).join('; '));

  const fil = await vantaPaFil(data.fileCreate.files[0].id);
  // Temat refererar filer på formen shopify://shop_images/<filnamn utan query>.
  const namn = new URL(fil.image.url).pathname.split('/').pop();
  return { id: fil.id, url: fil.image.url, refererbar: `shopify://shop_images/${namn}` };
}

export async function sattILogga(temaId, logoRef, faviconRef, bredd) {
  const ra = await hamtaTemafil(temaId, 'config/settings_data.json');
  if (!ra) throw new Error('Temat har ingen config/settings_data.json.');
  const settings = JSON.parse(String(ra).replace(/^\s*\/\*[\s\S]*?\*\//, '').trim());
  settings.current = {
    ...settings.current,
    logo: logoRef,
    logo_width: bredd,
    ...(faviconRef ? { favicon: faviconRef } : {}),
  };
  await skrivTemafiler(temaId, {
    'config/settings_data.json': `${JSON.stringify(settings, null, 2)}\n`,
  });
  return { logo: logoRef, favicon: faviconRef ?? null, bredd };
}

async function huvud() {
  laddaEnv();
  const argv = process.argv.slice(2);
  const logga = argv.find((a) => !a.startsWith('--'));
  const fi = argv.indexOf('--favicon');
  const favicon = fi !== -1 ? argv[fi + 1] : null;
  const bi = argv.indexOf('--bredd');
  const bredd = bi !== -1 ? Number(argv[bi + 1]) : 180;
  if (!logga) {
    console.error('Användning: node factory/logga.mjs <logga.png> [--favicon <fil.png>] [--bredd 180]');
    process.exit(1);
  }

  const tema = await hamtaUtkastTema();
  if (!tema) throw new Error('Inget utkasttema i butiken.');

  const l = await laddaUppBild(logga);
  console.log(`✅ Logga uppladdad: ${l.refererbar}`);
  let f = null;
  if (favicon) {
    f = await laddaUppBild(favicon);
    console.log(`✅ Favicon uppladdad: ${f.refererbar}`);
  }
  const r = await sattILogga(tema.id, l.refererbar, f?.refererbar ?? null, bredd);
  console.log(`✅ Satt i temat "${tema.name}" — bredd ${r.bredd}px.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  huvud().catch((e) => {
    console.error(`\n❌ ${e.message}\n`);
    process.exit(1);
  });
}
