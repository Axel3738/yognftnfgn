// Laddar upp CRO-temat (factory/tema/ops-tema.zip) till butiken som UTKAST.
//
//   node factory/tema-upload.mjs [--namn "OPS v1"]
//
// Fanns inte i fabriken förrän 2026-09-09: HeimGuard fick sitt tema uppladdat
// för hand, och varje ny butik stod därför med Shopifys standardtema och ett
// `hamtaUtkastTema()` som svarade null. Steget är nu en del av kedjan.
//
// Publicerar ALDRIG — temat läggs som UNPUBLISHED. Publiceringen är API-spärrad
// och görs av VA:n (checklistans steg 8).

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';
import { graphql } from './shopify.mjs';
import { laddaEnv } from './env.mjs';

const FACTORY_ROT = dirname(fileURLToPath(import.meta.url));
export const TEMA_ZIP = join(FACTORY_ROT, 'tema', 'ops-tema.zip');

// Steg 1: be Shopify om en uppladdningsplats för en temazip.
async function begarUppladdning(filnamn, storlek) {
  const data = await graphql(
    `mutation opsFactoryStaged($input: [StagedUploadInput!]!) {
      stagedUploadsCreate(input: $input) {
        stagedTargets { url resourceUrl parameters { name value } }
        userErrors { field message }
      }
    }`,
    {
      input: [
        {
          // THEME finns inte som resurs i 2025-07 (mätt 2026-09-09: enumet
          // tillåter bara COLLECTION_IMAGE, FILE, IMAGE, MODEL_3D, …).
          // FILE ger en resourceUrl som themeCreate kan hämta zip:en från.
          resource: 'FILE',
          filename: filnamn,
          mimeType: 'application/zip',
          httpMethod: 'POST',
          fileSize: String(storlek),
        },
      ],
    }
  );
  const fel = data.stagedUploadsCreate?.userErrors ?? [];
  if (fel.length > 0) {
    throw new Error(`stagedUploadsCreate: ${fel.map((f) => f.message).join('; ')}`);
  }
  const mal = data.stagedUploadsCreate?.stagedTargets?.[0];
  if (!mal) throw new Error('stagedUploadsCreate gav ingen uppladdningsplats.');
  return mal;
}

// Steg 2: lägg upp zip:en på platsen. Parametrarna måste komma FÖRE filen i
// formuläret — S3 avvisar annars uppladdningen utan att säga varför.
async function laddaUpp(mal, zip, filnamn) {
  const form = new FormData();
  for (const { name, value } of mal.parameters) form.append(name, value);
  form.append('file', new Blob([zip], { type: 'application/zip' }), filnamn);

  const svar = await fetch(mal.url, { method: 'POST', body: form });
  if (!svar.ok) {
    throw new Error(`Uppladdningen nekades (${svar.status}): ${(await svar.text()).slice(0, 400)}`);
  }
}

// Steg 3: skapa temat ur den uppladdade zip:en. ALLTID som utkast.
async function skapaTema(resourceUrl, namn) {
  const data = await graphql(
    `mutation opsFactoryTemaSkapa($source: URL!, $name: String!, $role: ThemeRole) {
      themeCreate(source: $source, name: $name, role: $role) {
        theme { id name role }
        userErrors { field message }
      }
    }`,
    { source: resourceUrl, name: namn, role: 'UNPUBLISHED' }
  );
  const fel = data.themeCreate?.userErrors ?? [];
  if (fel.length > 0) throw new Error(`themeCreate: ${fel.map((f) => f.message).join('; ')}`);
  return data.themeCreate.theme;
}

export async function laddaUppTema(namn = 'OPS-tema', zipSokvag = TEMA_ZIP) {
  if (!existsSync(zipSokvag)) throw new Error(`Temazip saknas: ${zipSokvag}`);
  const zip = readFileSync(zipSokvag);
  const filnamn = 'ops-tema.zip';
  const mal = await begarUppladdning(filnamn, zip.length);
  await laddaUpp(mal, zip, filnamn);
  return skapaTema(mal.resourceUrl, namn);
}

// Väntar tills temat har filer — themeCreate packar upp zip:en asynkront, och
// skriver man filer före uppackningen skriver uppackningen över dem.
export async function vantaPaUppackning(temaId, { forsok = 40, paus = 6000 } = {}) {
  for (let i = 0; i < forsok; i += 1) {
    const data = await graphql(
      `query opsFactoryTemaFiler($id: ID!) {
        theme(id: $id) { id name role files(first: 5) { nodes { filename } } }
      }`,
      { id: temaId }
    );
    const antal = data.theme?.files?.nodes?.length ?? 0;
    if (antal > 0) return { klart: true, forsok: i + 1 };
    await new Promise((r) => setTimeout(r, paus));
  }
  return { klart: false, forsok };
}

async function huvud() {
  laddaEnv();
  const argv = process.argv.slice(2);
  const i = argv.indexOf('--namn');
  const namn = i !== -1 ? argv[i + 1] : 'OPS-tema';

  console.log(`Laddar upp ${TEMA_ZIP} som "${namn}" (utkast) …`);
  const tema = await laddaUppTema(namn);
  console.log(`✅ Tema skapat: ${tema.name} (${tema.role}) ${tema.id}`);
  process.stdout.write('Väntar på uppackning ');
  const lage = await vantaPaUppackning(tema.id);
  console.log(lage.klart ? `klart efter ${lage.forsok} kontroller.` : '— tog för lång tid, kontrollera i admin.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  huvud().catch((e) => {
    console.error(`\n❌ ${e.message}\n`);
    process.exit(1);
  });
}
