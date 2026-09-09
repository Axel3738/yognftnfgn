// tema-upload.mjs — laddar upp factory/tema/ops-tema.zip som ett NYTT
// utkasttema i butiken. Fabrikens `tema`-steg förutsätter att ett utkasttema
// redan finns; på en färsk trial-butik finns bara live-temat, och steget
// svarade "Inget utkasttema finns i butiken — installera ett tema först"
// (mätt 2026-09-09 på DryTrek). Det här är det saknade steget.
//
//   node factory/tema-upload.mjs "DryTrek – CRO (utkast)"
//
// Publicerar ALDRIG. Temat skapas som UNPUBLISHED — publiceringen är
// API-spärrad och är VA:ns klick (checklistans steg 8).
//
// Vägen är Shopifys egen: stagedUploadsCreate(resource: THEME) → POST av
// zip:en till den signerade URL:en → themeCreate med resourceUrl.

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { laddaEnv } from './env.mjs';
import { graphql } from './shopify.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));
const ZIP = join(ROT, 'tema', 'ops-tema.zip');

export async function laddaUppTema(namn) {
  if (!existsSync(ZIP)) throw new Error(`Tema-zip:en saknas: ${ZIP}`);
  const zip = readFileSync(ZIP);

  const staged = await graphql(
    `mutation opsFactoryStaged($input: [StagedUploadInput!]!) {
      stagedUploadsCreate(input: $input) {
        stagedTargets { url resourceUrl parameters { name value } }
        userErrors { field message }
      }
    }`,
    {
      input: [
        {
          // Admin-API 2025-07 har INGEN THEME-resurs i stagedUploadsCreate
          // (mätt 2026-09-09: enum:et tar bara COLLECTION_IMAGE, FILE, IMAGE,
          // MODEL_3D, PRODUCT_IMAGE, SHOP_IMAGE, VIDEO, BULK_MUTATION_VARIABLES,
          // RETURN_LABEL, URL_REDIRECT_IMPORT, DISPUTE_FILE_UPLOAD).
          // FILE ger en signerad URL som themeCreate läser lika bra.
          resource: 'FILE',
          filename: 'ops-tema.zip',
          mimeType: 'application/zip',
          httpMethod: 'POST',
          fileSize: String(zip.length),
        },
      ],
    }
  );
  const stagedFel = staged.stagedUploadsCreate?.userErrors ?? [];
  if (stagedFel.length > 0) {
    throw new Error(`stagedUploadsCreate avvisade: ${stagedFel.map((f) => f.message).join('; ')}`);
  }
  const mal = staged.stagedUploadsCreate?.stagedTargets?.[0];
  if (!mal) throw new Error('stagedUploadsCreate gav inget mål tillbaka.');

  const form = new FormData();
  for (const p of mal.parameters) form.append(p.name, p.value);
  form.append('file', new Blob([zip], { type: 'application/zip' }), 'ops-tema.zip');

  const upp = await fetch(mal.url, { method: 'POST', body: form });
  if (!upp.ok) {
    throw new Error(`Uppladdningen misslyckades (${upp.status}): ${(await upp.text()).slice(0, 400)}`);
  }

  const skapad = await graphql(
    `mutation opsFactoryTemaSkapa($namn: String!, $kalla: URL!) {
      themeCreate(name: $namn, source: $kalla) {
        theme { id name role }
        userErrors { field message }
      }
    }`,
    { namn, kalla: mal.resourceUrl }
  );
  const temaFel = skapad.themeCreate?.userErrors ?? [];
  if (temaFel.length > 0) {
    throw new Error(`themeCreate avvisade: ${temaFel.map((f) => f.message).join('; ')}`);
  }
  return skapad.themeCreate.theme;
}

if (process.argv[1] && process.argv[1].endsWith('tema-upload.mjs')) {
  laddaEnv();
  const namn = process.argv[2] ?? 'OPS – CRO (utkast)';
  const tema = await laddaUppTema(namn);
  console.log(`✅ Tema uppladdat: ${tema.name} (${tema.id}, roll ${tema.role})`);
  console.log('   Temat är ett UTKAST. Publiceringen är API-spärrad och görs för hand.');
}
