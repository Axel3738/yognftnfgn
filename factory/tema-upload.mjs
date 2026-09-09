// Kedjans steg 1: OPS-temat (factory/tema/ops-tema.zip — matstrumpor-cro-v5,
// samma källa som HeimGuard) upp i butiken som OPUBLICERAT utkast, och vänta
// tills Shopify packat upp det.
//
//   node factory/tema-upload.mjs "<namn>"                       [--zip <fil>] [--torr]
//   node factory/tema-upload.mjs factory/butiker/<butik>.yaml   (namn = "<Brand> – CRO v1")
//   node factory/tema-upload.mjs --namn "<namn>"                (äldre form, fungerar än)
//
// zip → stagedUploadsCreate (FILE) → POST till S3 → themeCreate → pollning.
// Temat är STRUKTUREN; brandingen läggs på av ops.mjs (brand-steget) och
// opf-sektionerna av tema-steget. Bygg alltid från zip:en i repot — aldrig
// från Dawn eller publika assets (Axels order 2026-09-08).
//
// Publicerar ALDRIG. themePublish är API-spärrat och klicket är VA:ns
// (checklistan). Temat läggs som UNPUBLISHED.
//
// Historik: steget fanns inte förrän 2026-09-09 — HeimGuard fick sitt tema
// uppladdat för hand, och varje ny butik stod med Shopifys standardtema och
// ett `hamtaUtkastTema()` som svarade null. Tre grenar byggde sedan varsin
// version (tema-upload.mjs på iqneba + damasker, tema-upp.mjs på jjwesr);
// den här filen förenar dem (KEDJAN.md, 2026-09-09).
//
// Staged upload ligger HÄR och inte i filer.mjs med flit: temazip:en är
// modulens enda fil och ett eget anrop ger noll korsberoenden mot
// filuppladdningen (som byggs för bilder). Byt inte till filer.stagedUpload
// utan att också ta bort begarUppladdning/laddaUpp nedan.

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';
import { graphql as shopifyGraphql, kontrolleraAnslutning } from './shopify.mjs';
import { laddaEnv } from './env.mjs';
import { lasYaml } from './yaml.mjs';

const FACTORY_ROT = dirname(fileURLToPath(import.meta.url));
export const TEMA_ZIP = join(FACTORY_ROT, 'tema', 'ops-tema.zip');
export const TEMA_FILNAMN = 'ops-tema.zip';

// Pollningen: Shopify packar upp zip:en asynkront. 60 × 3 s = 3 minuter,
// mätt 2026-09-09 tar det normalt 10–40 s.
export const POLL_FORSOK = 60;
export const POLL_PAUS_MS = 3000;

// `hamtaArbetstema()` i shopify.mjs känner igen fabrikens tema på ordet CRO i
// namnet när state saknar `arbetstemaId`. Standardnamnet bär därför ordet.
const CRO = /\bcro\b/i;
export function standardTemanamn(brand) {
  const b = String(brand ?? '').trim() || 'OPS';
  return `${b} – CRO v1`;
}
export const harCroINamnet = (namn) => CRO.test(String(namn ?? ''));

const sov = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// Ren logik (testas utan nätverk)
// ---------------------------------------------------------------------------

// Bedömer ett tema-svar från Shopify: 'klart' när uppackningen är färdig och
// filer finns, 'misslyckat' när Shopify själv säger att den gick fel, annars
// 'vantar'. Äldre API-versioner saknar `processing`-fälten — då räcker filer.
export function bedomUppackning(tema) {
  if (!tema) return 'vantar';
  if (tema.processingFailed === true) return 'misslyckat';
  const antalFiler = tema.files?.nodes?.length ?? 0;
  if (tema.processing === true) return 'vantar';
  return antalFiler > 0 ? 'klart' : 'vantar';
}

// Multipart-formuläret till S3. Parametrarna måste komma FÖRE filen —
// S3 avvisar annars uppladdningen utan att säga varför (mätt 2026-09-09).
export function byggUppladdningsform(mal, zip, filnamn = TEMA_FILNAMN) {
  const form = new FormData();
  for (const { name, value } of mal.parameters ?? []) form.append(name, value);
  form.append('file', new Blob([zip], { type: 'application/zip' }), filnamn);
  return form;
}

// CLI-argument → { namn, zipSokvag, torr, butiksfil }. Namnet kan ges som
// positionellt argument, som --namn, eller härledas ur en butiks-yaml.
export function tolkaArgument(argv, { lasButik = lasButiksfil } = {}) {
  const arg = [...argv];
  const flagga = (f) => {
    const i = arg.indexOf(f);
    if (i === -1) return null;
    const v = arg[i + 1] ?? null;
    arg.splice(i, v === null ? 1 : 2);
    return v;
  };
  const torr = ['--torr', '--dry', '--dry-run'].some((f) => arg.includes(f));
  for (const f of ['--torr', '--dry', '--dry-run']) {
    const i = arg.indexOf(f);
    if (i !== -1) arg.splice(i, 1);
  }
  const zipSokvag = flagga('--zip') ?? TEMA_ZIP;
  let namn = flagga('--namn');
  const positionella = arg.filter((a) => !a.startsWith('--'));
  const butiksfil = positionella.find((a) => a.endsWith('.yaml') || a.endsWith('.yml')) ?? null;
  if (!namn) namn = positionella.find((a) => a !== butiksfil) ?? null;
  if (!namn && butiksfil) namn = standardTemanamn(lasButik(butiksfil)?.butik?.brand);
  return { namn, zipSokvag, torr, butiksfil };
}

function lasButiksfil(sokvag) {
  return lasYaml(readFileSync(sokvag, 'utf8'));
}

// ---------------------------------------------------------------------------
// Anrop mot Shopify
// ---------------------------------------------------------------------------

// Steg 1: be Shopify om en uppladdningsplats för zip:en.
async function begarUppladdning(graphql, filnamn, storlek) {
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
          // THEME finns inte som resurs i Admin-API 2025-07 (mätt 2026-09-09:
          // enumet tar bara COLLECTION_IMAGE, FILE, IMAGE, MODEL_3D,
          // PRODUCT_IMAGE, SHOP_IMAGE, VIDEO, BULK_MUTATION_VARIABLES,
          // RETURN_LABEL, URL_REDIRECT_IMPORT, DISPUTE_FILE_UPLOAD).
          // FILE ger en signerad resourceUrl som themeCreate läser lika bra.
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
  if (fel.length > 0) throw new Error(`stagedUploadsCreate: ${fel.map((f) => f.message).join('; ')}`);
  const mal = data.stagedUploadsCreate?.stagedTargets?.[0];
  if (!mal?.url || !mal?.resourceUrl) throw new Error('stagedUploadsCreate gav ingen uppladdningsplats.');
  return mal;
}

// Steg 2: lägg upp zip:en på platsen.
async function laddaUpp(hamta, mal, zip, filnamn) {
  const svar = await hamta(mal.url, { method: 'POST', body: byggUppladdningsform(mal, zip, filnamn) });
  if (!svar.ok) {
    let vard = mal.url;
    try { vard = new URL(mal.url).host; } catch { /* behåll hela url:en */ }
    const text = typeof svar.text === 'function' ? (await svar.text()).slice(0, 400) : '';
    throw new Error(`Uppladdningen till ${vard} nekades (${svar.status}): ${text}`);
  }
}

// Steg 3: skapa temat ur den uppladdade zip:en. ALLTID som utkast.
async function skapaTema(graphql, resourceUrl, namn) {
  const data = await graphql(
    `mutation opsFactoryTemaSkapa($source: URL!, $name: String!, $role: ThemeRole) {
      themeCreate(source: $source, name: $name, role: $role) {
        theme { id name role processing processingFailed }
        userErrors { field message }
      }
    }`,
    { source: resourceUrl, name: namn, role: 'UNPUBLISHED' }
  );
  const fel = data.themeCreate?.userErrors ?? [];
  if (fel.length > 0) throw new Error(`themeCreate: ${fel.map((f) => f.message).join('; ')}`);
  const tema = data.themeCreate?.theme;
  if (!tema?.id) throw new Error('themeCreate gav inget tema tillbaka.');
  return tema;
}

// Ett tema med exakt samma namn finns redan → återanvänd det (idempotens,
// KEDJAN.md regel 2). Rollen spelar ingen roll: har VA:n redan publicerat
// temat är det MAIN och fortfarande fabrikens tema.
export async function hittaTemaViaNamn(namn, { graphql = shopifyGraphql } = {}) {
  const data = await graphql(`query opsFactoryTemanViaNamn { themes(first: 50) { nodes { id name role } } }`);
  const teman = data.themes?.nodes ?? [];
  return teman.find((t) => String(t.name ?? '').trim() === String(namn ?? '').trim()) ?? null;
}

// Väntar tills temat är uppackat: `processing` false, `processingFailed`
// false och minst en fil. Skriver man temafiler före uppackningen skriver
// uppackningen över dem (mätt 2026-09-09 på TackleBay).
export async function vantaPaUppackning(
  temaId,
  { forsok = POLL_FORSOK, paus = POLL_PAUS_MS, graphql = shopifyGraphql, vanta = sov } = {}
) {
  let senaste = null;
  for (let i = 0; i < forsok; i += 1) {
    const data = await graphql(
      `query opsFactoryTemaStatus($id: ID!) {
        theme(id: $id) { id name role processing processingFailed files(first: 1) { nodes { filename } } }
      }`,
      { id: temaId }
    );
    senaste = data.theme ?? null;
    const lage = bedomUppackning(senaste);
    if (lage === 'misslyckat') {
      throw new Error(`Temat ${senaste?.name ?? temaId} gick inte att packa upp (processingFailed). Ladda upp igen.`);
    }
    if (lage === 'klart') return { klart: true, forsok: i + 1, tema: senaste };
    if (i + 1 < forsok) await vanta(paus);
  }
  return { klart: false, forsok, tema: senaste };
}

// Kontraktet (KEDJAN.md): laddaUppTema(namn) → { id, name } — väntar på
// uppackning innan den svarar. Kastar om zip:en saknas, om Shopify avvisar
// något steg, om uppackningen misslyckas eller om den inte blir klar i tid.
//
//   { zipSokvag }   annan zip än TEMA_ZIP
//   { aterAnvand }  false = ladda upp även om ett tema med samma namn finns
//   { graphql, fetch, vanta, forsok, paus }  injiceras av tester
export async function laddaUppTema(
  namn,
  {
    zipSokvag = TEMA_ZIP,
    aterAnvand = true,
    graphql = shopifyGraphql,
    fetch: hamta = globalThis.fetch,
    vanta = sov,
    forsok = POLL_FORSOK,
    paus = POLL_PAUS_MS,
    logg = () => {},
  } = {}
) {
  const temanamn = String(namn ?? '').trim();
  if (!temanamn) throw new Error('Temat behöver ett namn — t.ex. "TackleBay – CRO v1".');
  if (!harCroINamnet(temanamn)) {
    logg(`⚠️ Temanamnet "${temanamn}" saknar ordet CRO — tappas state hittar hamtaArbetstema() inte temat.`);
  }
  if (!existsSync(zipSokvag)) throw new Error(`Temazip saknas: ${zipSokvag} — pulla main.`);

  let tema = aterAnvand ? await hittaTemaViaNamn(temanamn, { graphql }) : null;
  let redanUppe = Boolean(tema);
  if (tema) {
    logg(`Temat "${tema.name}" finns redan (${tema.role}, ${tema.id}) — laddar inte upp igen.`);
  } else {
    const zip = readFileSync(zipSokvag);
    const mal = await begarUppladdning(graphql, TEMA_FILNAMN, zip.length);
    await laddaUpp(hamta, mal, zip, TEMA_FILNAMN);
    tema = await skapaTema(graphql, mal.resourceUrl, temanamn);
    logg(`Tema skapat: ${tema.name} (${tema.role}) ${tema.id}`);
  }

  const lage = await vantaPaUppackning(tema.id, { forsok, paus, graphql, vanta });
  if (!lage.klart) {
    throw new Error(
      `Temat ${tema.name} (${tema.id}) blev aldrig färdigprocessat efter ${lage.forsok} kontroller — ` +
        'kontrollera i admin och kör om steget med --resume.'
    );
  }
  return {
    id: tema.id,
    name: lage.tema?.name ?? tema.name,
    role: lage.tema?.role ?? tema.role ?? 'UNPUBLISHED',
    redanUppe,
    kontroller: lage.forsok,
  };
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

async function huvud() {
  laddaEnv();
  const { namn, zipSokvag, torr } = tolkaArgument(process.argv.slice(2));
  if (!namn) {
    console.error(
      'Användning: node factory/tema-upload.mjs "<namn>" [--zip <fil>] [--torr]\n' +
        '            node factory/tema-upload.mjs factory/butiker/<butik>.yaml [--torr]'
    );
    process.exit(1);
  }

  const shop = await kontrolleraAnslutning();
  console.log(`Connected: ${shop.myshopifyDomain} ✓`);
  console.log(`Tema "${namn}" ur ${zipSokvag} (UNPUBLISHED)`);
  if (torr) {
    console.log('(torrkörning — inget laddades upp)');
    return;
  }

  const tema = await laddaUppTema(namn, { zipSokvag, logg: (rad) => console.log(`   ${rad}`) });
  console.log(
    `✅ ${tema.redanUppe ? 'Tema återanvänt' : 'Tema uppladdat'}: ${tema.name} (${tema.role}, ${tema.id}) — ` +
      `uppackat efter ${tema.kontroller} kontroller.`
  );
  console.log('   Nästa: node factory/ops.mjs <butik> <produkt> --resume  (brand + opf-sektioner in i utkastet)');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  huvud().catch((e) => {
    console.error(`\n❌ ${e.message}\n`);
    process.exit(1);
  });
}
