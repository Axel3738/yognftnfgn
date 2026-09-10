// filer.mjs — bilder in i butikens filarkiv (Innehåll → Filer). Noll beroenden.
//
// Temats bildinställningar (logga, favicon, hero, image-with-text, multicolumn)
// pekar på `shopify://shop_images/<lagrat filnamn MED ändelse>`. Produktens
// media räcker inte — en bild som bara ligger på produkten går inte att välja
// i en tema-sektion. Utan det här steget får startsidan tomma bildrutor.
//
//   laddaUppFiler([{ url|sokvag, alt? } | 'url'])  → [{ namn, handle, url, id }]
//   laddaUppBild(sokvagEllerUrl, { alt?, filnamn? }) → { namn, handle, url, id }
//   laddaUppVideo(sokvagEllerUrl, { alt?, filnamn? }) → { namn, handle:null, url, id, kallor }
//   hittaBild(filnamn)                              → samma objekt | null
//   hittaVideo(filnamn)                             → samma objekt | null
//   stagedUpload(sokvag, mime | { resource, mimeType, filnamn }) → resourceUrl
//   filnamnUrUrl(url)                               → 'namn.ext'
//
//   node factory/filer.mjs <url-eller-fil> [<url-eller-fil> ...]
//
// VIDEO (AdventLane 2026-09-10): demot i beskrivningen ska vara en loopad MP4
// (Axels beslut 2026-09-09), och källbutiken har oftast bara en GIF. En lokal
// MP4 (ffmpeg ur GIF:en) laddas upp som Video via stagedUploadsCreate
// (resource VIDEO) + fileCreate (contentType VIDEO), och Shopify transkodar
// den — `sources[]` bär de färdiga mp4-URL:erna (cdn.shopify.com/videos/…).
// Den URL:en är det som skrivs i media.gif_problem/media_losning (url-metafält).
// En video har ingen shopify://shop_images-handle — `handle` är null.
//
// Två källor förenade (KEDJAN.md): DryTreks version (URL → Files, UUID-suffix
// och filändelse i handeln) och TankGuards (staged upload för LOKALA filer,
// väntan på READY, idempotens på filnamnsstam).
//
// Flödet är Shopifys eget: en URL går rakt in i fileCreate som originalSource;
// en lokal fil får först en signerad mål-URL (stagedUploadsCreate), POST:as dit
// som multipart och resourceUrl:en blir originalSource. fileCreate svarar
// INNAN bilden är bearbetad — därför pollas filen tills fileStatus är READY och
// image.url finns. Annars saknar filen url och temat pekar på ingenting.

import { readFileSync, statSync, existsSync } from 'node:fs';
import { basename } from 'node:path';
import { laddaEnv } from './env.mjs';
import { graphql } from './shopify.mjs';

const sov = (ms) => new Promise((r) => setTimeout(r, ms));

const MIME = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  zip: 'application/zip',
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
};

export function mimeFor(namn) {
  const andelse = String(namn ?? '').split('?')[0].split('.').pop().toLowerCase();
  return MIME[andelse] ?? 'application/octet-stream';
}

export const arUrl = (s) => /^https?:\/\//i.test(String(s ?? ''));
export const arVideo = (namn) => mimeFor(filnamnUrUrl(namn)).startsWith('video/');

// Shopifys resurstyp för en staged upload ur mime-typen: bilder IMAGE, video
// VIDEO (transkoderas, får sources[]), allt annat FILE (tema-zip m.m.).
export function stagedResurs(mimeType) {
  const m = String(mimeType ?? '');
  if (m.startsWith('image/')) return 'IMAGE';
  if (m.startsWith('video/')) return 'VIDEO';
  return 'FILE';
}

// Filnamnet ur en URL eller en lokal sökväg: query och fragment bort, sista
// segmentet, URL-kodning upplöst. 'https://cdn/x/benskydd-08.jpg?v=1' → 'benskydd-08.jpg'.
export function filnamnUrUrl(url) {
  const utanQuery = String(url ?? '').split('#')[0].split('?')[0];
  const sista = utanQuery.split('/').pop() ?? '';
  try {
    return decodeURIComponent(sista);
  } catch {
    return sista;
  }
}

export const stam = (namn) => String(namn ?? '').replace(/\.[^.]+$/, '');
const andelse = (namn) => (String(namn ?? '').match(/\.([^.]+)$/)?.[1] ?? '').toLowerCase();

// ⚠️ HANDLEN HÄRLEDS UR DET LAGRADE FILNAMNET, aldrig ur käll-URL:en, och
// FILÄNDELSEN SKA VARA KVAR.
//
// Finns namnet redan i butiken lägger Shopify på ett UUID:
// benskydd-08.jpg blir benskydd-08_3ecbd654-….jpg. Det händer garanterat i en
// OPS-butik, för produktbilderna laddas upp från SAMMA käll-URL:er innan
// startsidan byggs. Mätt 2026-09-09 på DryTrek: alla fem startsidesbilder
// pekade på shopify://shop_images/<namn utan uuid> — filer som inte fanns —
// och hero, galleri och trygghetsbild renderade Dawns placeholder-svg.
// Samma dag: utan ändelsen hittar temat ingen bild. Bas-temats egna värden
// bär ändelsen ("shopify://shop_images/…-2026-03-19T120925.579.png").
export function byggHandle(lagratNamn) {
  if (!lagratNamn) return null;
  return `shopify://shop_images/${lagratNamn}`;
}

// Ren logik för idempotensen: vilket av de lagrade namnen är "samma bild" som
// det sökta? Exakt namn först, sedan samma stam med annan ändelse, sedan den
// UUID-suffixade varianten (samma ändelse före annan). null om inget passar.
export function matchaLagratNamn(lagradeNamn, soktNamn) {
  const lista = Array.isArray(lagradeNamn) ? lagradeNamn.filter(Boolean) : [];
  const bas = stam(soktNamn);
  const ext = andelse(soktNamn);
  if (!bas) return null;
  const uuidSuffix = (n) => stam(n).startsWith(`${bas}_`);
  return (
    lista.find((n) => n === soktNamn) ??
    lista.find((n) => stam(n) === bas) ??
    lista.find((n) => uuidSuffix(n) && andelse(n) === ext) ??
    lista.find((n) => uuidSuffix(n)) ??
    null
  );
}

// Objektet alla exporter svarar med. `namn` = det lagrade namnet i Files.
function filobjekt(nod) {
  const url = nod?.image?.url ?? nod?.url ?? null;
  const namn = url ? filnamnUrUrl(url) : null;
  return { namn, handle: byggHandle(namn), url, id: nod?.id ?? null };
}

// Alla bilder i Files, paginerat. Map lagrat namn → { namn, handle, url, id }.
export async function befintligaFiler() {
  const karta = new Map();
  let cursor = null;
  for (;;) {
    const d = await graphql(
      `query opsFactoryFiler($cursor: String) {
        files(first: 250, after: $cursor) {
          nodes { id alt fileStatus ... on MediaImage { image { url } } }
          pageInfo { hasNextPage endCursor }
        }
      }`,
      { cursor }
    );
    for (const n of d.files?.nodes ?? []) {
      const o = filobjekt(n);
      if (o.namn) karta.set(o.namn, o);
    }
    if (!d.files?.pageInfo?.hasNextPage) break;
    cursor = d.files.pageInfo.endCursor;
  }
  return karta;
}

// Slår upp en redan uppladdad bild på filnamnsstam (idempotens: ladda aldrig
// upp samma logga två gånger). Shopifys filsökning är fri text på stammen
// (mätt 2026-09-09 på DryTrek), så 'logga' träffar även 'logga-b' —
// matchaLagratNamn sållar till rätt fil.
export async function hittaBild(filnamn) {
  const sokt = filnamnUrUrl(filnamn);
  const data = await graphql(
    `query opsFactoryHittaFil($q: String!) {
      files(first: 50, query: $q) {
        nodes { id fileStatus ... on MediaImage { image { url } } }
      }
    }`,
    { q: stam(sokt) }
  );
  const noder = (data.files?.nodes ?? []).map(filobjekt).filter((o) => o.url);
  const traff = matchaLagratNamn(noder.map((o) => o.namn), sokt);
  return traff ? noder.find((o) => o.namn === traff) : null;
}

// Signerad uppladdningsplats för en LOKAL fil. Andra argumentet är antingen
// mime-typen (kontraktet) eller { resource, mimeType, filnamn } (tema-zip:en
// använder resource FILE + application/zip). Svarar med resourceUrl:en som
// blir originalSource i fileCreate eller source i themeCreate.
export async function stagedUpload(sokvag, alternativ = {}) {
  const opt = typeof alternativ === 'string' ? { mimeType: alternativ } : alternativ ?? {};
  const filnamn = opt.filnamn ?? basename(sokvag);
  const mimeType = opt.mimeType ?? mimeFor(filnamn);
  const resource = opt.resource ?? stagedResurs(mimeType);
  if (!existsSync(sokvag)) throw new Error(`Filen saknas: ${sokvag}`);
  const storlek = statSync(sokvag).size;

  const data = await graphql(
    `mutation opsFactoryStaged($input: [StagedUploadInput!]!) {
      stagedUploadsCreate(input: $input) {
        stagedTargets { url resourceUrl parameters { name value } }
        userErrors { field message }
      }
    }`,
    { input: [{ resource, filename: filnamn, mimeType, httpMethod: 'POST', fileSize: String(storlek) }] }
  );
  const fel = data.stagedUploadsCreate?.userErrors ?? [];
  if (fel.length > 0) throw new Error(`stagedUploadsCreate: ${fel.map((f) => f.message).join('; ')}`);
  const mal = data.stagedUploadsCreate?.stagedTargets?.[0];
  if (!mal) throw new Error('stagedUploadsCreate gav ingen uppladdningsplats.');

  const form = new FormData();
  for (const p of mal.parameters) form.append(p.name, p.value);
  form.append('file', new Blob([readFileSync(sokvag)], { type: mimeType }), filnamn);
  const svar = await fetch(mal.url, { method: 'POST', body: form });
  if (!svar.ok) {
    throw new Error(
      `Uppladdningen till ${new URL(mal.url).host} svarade ${svar.status}: ${(await svar.text()).slice(0, 200)}`
    );
  }
  return mal.resourceUrl;
}

// Väntar tills Shopify bearbetat bilden. Utan väntan saknar filen url och
// temat får en trasig referens.
async function vantaPaReady(id, filnamn, { forsok = 30, paus = 2000 } = {}) {
  for (let i = 0; i < forsok; i += 1) {
    const q = await graphql(
      `query opsFactoryFilStatus($id: ID!) {
        node(id: $id) { ... on MediaImage { id fileStatus image { url } } }
      }`,
      { id }
    );
    const nod = q.node;
    if (nod?.fileStatus === 'READY' && nod.image?.url) return filobjekt(nod);
    if (nod?.fileStatus === 'FAILED') throw new Error(`Shopify kunde inte behandla bilden ${filnamn}.`);
    await sov(paus);
  }
  throw new Error(`Bilden ${filnamn} blev aldrig READY.`);
}

// EN bild in i Files — URL eller lokal fil. Idempotent: finns en fil med samma
// stam redan svarar den (med sitt lagrade, ev. UUID-suffixade, namn).
export async function laddaUppBild(sokvagEllerUrl, { alt = '', filnamn = null, aterandvand = true } = {}) {
  const kalla = String(sokvagEllerUrl ?? '');
  if (!kalla) throw new Error('laddaUppBild: ingen källa angiven.');
  const namn = filnamn ?? filnamnUrUrl(kalla);

  if (aterandvand) {
    const redan = await hittaBild(namn);
    if (redan) return redan;
  }

  const originalSource = arUrl(kalla) ? kalla : await stagedUpload(kalla, { filnamn: namn });
  const data = await graphql(
    `mutation opsFactoryFilSkapa($files: [FileCreateInput!]!) {
      fileCreate(files: $files) {
        files { id fileStatus }
        userErrors { field message }
      }
    }`,
    { files: [{ originalSource, contentType: 'IMAGE', alt: alt || namn, filename: namn }] }
  );
  const fel = data.fileCreate?.userErrors ?? [];
  if (fel.length > 0) throw new Error(`fileCreate ${namn}: ${fel.map((f) => f.message).join('; ')}`);
  const id = data.fileCreate?.files?.[0]?.id;
  if (!id) throw new Error(`fileCreate ${namn}: inget fil-id i svaret.`);
  return vantaPaReady(id, namn);
}

// Videons färdiga mp4-källa: den bredaste transkodade mp4:an, annars originalet.
// Ren logik (testbar utan nät).
export function valjVideokalla(nod) {
  const kallor = Array.isArray(nod?.sources) ? nod.sources : [];
  const mp4 = kallor
    .filter((s) => /mp4/i.test(String(s?.mimeType ?? s?.format ?? '')) && s?.url)
    .sort((a, b) => (Number(b.width) || 0) - (Number(a.width) || 0));
  return mp4[0]?.url ?? nod?.originalSource?.url ?? null;
}

function videoobjekt(nod, filnamn) {
  const url = valjVideokalla(nod);
  return { namn: nod?.filename ?? filnamn ?? null, handle: null, url, id: nod?.id ?? null, kallor: nod?.sources ?? [] };
}

// Väntar tills Shopify transkodat videon. Tar längre tid än en bild —
// READY kommer först när sources[] finns.
async function vantaPaVideoReady(id, filnamn, { forsok = 60, paus = 3000 } = {}) {
  for (let i = 0; i < forsok; i += 1) {
    const q = await graphql(
      `query opsFactoryVideoStatus($id: ID!) {
        node(id: $id) {
          ... on Video { id fileStatus filename originalSource { url mimeType } sources { url mimeType format width height } }
        }
      }`,
      { id }
    );
    const nod = q.node;
    if (nod?.fileStatus === 'READY') {
      const o = videoobjekt(nod, filnamn);
      if (o.url) return o;
    }
    if (nod?.fileStatus === 'FAILED') throw new Error(`Shopify kunde inte behandla videon ${filnamn}.`);
    await sov(paus);
  }
  throw new Error(`Videon ${filnamn} blev aldrig READY.`);
}

// En redan uppladdad video på filnamnsstam (samma idempotens som hittaBild).
export async function hittaVideo(filnamn) {
  const sokt = filnamnUrUrl(filnamn);
  const data = await graphql(
    `query opsFactoryHittaVideo($q: String!) {
      files(first: 50, query: $q) {
        nodes { id fileStatus ... on Video { filename originalSource { url mimeType } sources { url mimeType format width height } } }
      }
    }`,
    { q: stam(sokt) }
  );
  const noder = (data.files?.nodes ?? [])
    .filter((n) => n?.fileStatus === 'READY' && (n.sources || n.originalSource))
    .map((n) => videoobjekt(n, n.filename))
    .filter((o) => o.url && o.namn);
  const traff = matchaLagratNamn(noder.map((o) => o.namn), sokt);
  return traff ? noder.find((o) => o.namn === traff) : null;
}

// EN video in i Files — URL eller lokal fil. Idempotent på filnamnsstam.
export async function laddaUppVideo(sokvagEllerUrl, { alt = '', filnamn = null, aterandvand = true } = {}) {
  const kalla = String(sokvagEllerUrl ?? '');
  if (!kalla) throw new Error('laddaUppVideo: ingen källa angiven.');
  const namn = filnamn ?? filnamnUrUrl(kalla);

  if (aterandvand) {
    const redan = await hittaVideo(namn);
    if (redan) return redan;
  }

  const originalSource = arUrl(kalla) ? kalla : await stagedUpload(kalla, { filnamn: namn, resource: 'VIDEO' });
  // MÄTT 2026-09-10 (AdventLane): en staged VIDEO-resourceUrl saknar filändelse,
  // och fileCreate avvisar då `filename` ("Provided filename extension must
  // match original source"). Filnamnet sätts därför efteråt med fileUpdate.
  const data = await graphql(
    `mutation opsFactoryVideoSkapa($files: [FileCreateInput!]!) {
      fileCreate(files: $files) {
        files { id fileStatus }
        userErrors { field message }
      }
    }`,
    { files: [{ originalSource, contentType: 'VIDEO', alt: alt || namn, ...(arUrl(kalla) ? { filename: namn } : {}) }] }
  );
  const fel = data.fileCreate?.userErrors ?? [];
  if (fel.length > 0) throw new Error(`fileCreate ${namn}: ${fel.map((f) => f.message).join('; ')}`);
  const id = data.fileCreate?.files?.[0]?.id;
  if (!id) throw new Error(`fileCreate ${namn}: inget fil-id i svaret.`);
  const klar = await vantaPaVideoReady(id, namn);
  if (!arUrl(kalla)) {
    // Namnet i Files ska vara vårt (idempotensen slår upp på stammen). Går
    // det inte är det en skönhetsfläck, inte ett fel — URL:en gäller ändå.
    try {
      const u = await graphql(
        `mutation opsFactoryVideoNamn($files: [FileUpdateInput!]!) {
          fileUpdate(files: $files) { files { id ... on Video { filename } } userErrors { field message } }
        }`,
        { files: [{ id, filename: namn }] }
      );
      const nyttNamn = u.fileUpdate?.files?.[0]?.filename;
      if (nyttNamn && (u.fileUpdate?.userErrors ?? []).length === 0) klar.namn = nyttNamn;
    } catch {
      // behåll Shopifys namn
    }
  }
  return klar;
}

// Tolkar en post i laddaUppFiler-listan: 'url', { url, alt } eller { sokvag, alt }.
export function tolkaFilpost(post) {
  if (typeof post === 'string') return { kalla: post, alt: '', filnamn: null };
  const kalla = post?.url ?? post?.sokvag ?? post?.fil ?? null;
  if (!kalla) throw new Error(`Filposten saknar url/sokvag: ${JSON.stringify(post)}`);
  return { kalla, alt: post.alt ?? '', filnamn: post.filnamn ?? null };
}

// Flera bilder, i ordning. Svarar med en lista i samma ordning som indata.
export async function laddaUppFiler(lista, { alt = {} } = {}) {
  const ut = [];
  for (const post of lista ?? []) {
    const { kalla, alt: postAlt, filnamn } = tolkaFilpost(post);
    const namn = filnamn ?? filnamnUrUrl(kalla);
    const upp = arVideo(namn) ? laddaUppVideo : laddaUppBild;
    ut.push(await upp(kalla, { alt: postAlt || alt[namn] || '', filnamn }));
  }
  return ut;
}

// Bekvämlighet för temabyggen: { källnamn: handle } ur laddaUppFilers svar.
export function somKarta(lista, kallor = null) {
  const namn = (i) => (kallor ? filnamnUrUrl(tolkaFilpost(kallor[i]).kalla) : lista[i]?.namn);
  return Object.fromEntries((lista ?? []).map((o, i) => [namn(i), o?.handle ?? null]));
}

if (process.argv[1] && process.argv[1].endsWith('filer.mjs')) {
  laddaEnv();
  const kallor = process.argv.slice(2);
  if (kallor.length === 0) throw new Error('Ange en eller flera bild-URL:er eller filer.');
  const lista = await laddaUppFiler(kallor);
  lista.forEach((o, i) => {
    // Bilder svarar med sin shop_images-handle, videor med den transkodade URL:en.
    const mal = o?.handle ?? o?.url ?? null;
    console.log(`${mal ? '✅' : '❌'} ${filnamnUrUrl(kallor[i])} → ${mal ?? 'kom inte upp'}`);
  });
}
