// publicera.mjs — Bäverbutikens storytelling in i Shopify-temat: fyra sektioner
// (förtroenderaden, historien, varför en bäver, recensionerna), startsidans ordning,
// sidfoten och sidan /pages/om-oss. Skriver ALLTID till ett namngivet tema,
// som standard arbetskopian ARBETSTEMA — aldrig tyst till det publicerade.
//
//   node storytelling/recensioner.mjs                   # väljer recensionerna (storytelling/recensioner.json)
//   node storytelling/publicera.mjs --torr              # visar vad som skulle skrivas
//   node storytelling/publicera.mjs --duplicera         # skapar arbetskopian ur det publicerade temat om den saknas
//   node storytelling/publicera.mjs                     # skriver till arbetstemat + sidan om-oss
//   node storytelling/publicera.mjs --bild-start <url> --bild-omoss <url>
//                                                       # laddar upp bilder till Filer först (publika URL:er)
//   node storytelling/publicera.mjs --publicera         # publicerar arbetstemat och läser tillbaka livesidan
//   node storytelling/publicera.mjs --tema "<namn>"     # annat tema (efter publiceringen heter det
//                                                       # publicerade temat fortfarande ARBETSTEMA)
//
// Ordningen: temafilerna (sektioner + mall) → index.json → settings_data.json →
// sidan → tillbakaläsning av varje fil → (valfritt) publicera → kundens vy.
// Varje skrivning läses tillbaka; JSON jämförs tolkat eftersom Shopify lägger
// sin egen kommentar överst i filen.

import { readFileSync, readdirSync, writeFileSync, appendFileSync, existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { losButik, skapaKlient } from '../listicle/butik.mjs';
import { ARBETSTEMA, byggIndex, byggFooter, byggOmOssMall, OM_OSS, MARKORER } from './innehall.mjs';
import { lasRecensioner } from './recensioner.mjs';

const HAR = dirname(fileURLToPath(import.meta.url));
const TEMAMAPP = join(HAR, 'tema');
const BILDFIL = join(HAR, 'bilder.json');
const LOGG = join(HAR, 'logg.jsonl');
const INDEX = 'templates/index.json';
const SETTINGS = 'config/settings_data.json';
const OM_OSS_MALLFIL = `templates/page.${OM_OSS.mall}.json`;
const sov = (ms) => new Promise((r) => setTimeout(r, ms));

// Miljöfällan (mätt 2026-09-27 på claude6-kontot): appens hemlighet ligger där
// som SHOPIFY_SECRET_ID_SE_BAVER_SE, inte SHOPIFY_CLIENT_SECRET_SE_BAVER_SE som
// mejl/shopify.mjs och listicle/butik.mjs läser. Utan raden nedan paras det nya
// app-id:t ihop med den GAMLA appens hemlighet och Shopify svarar 400
// "Oauth error invalid_request".
export function lagaMiljo(env = process.env) {
  if (!env.SHOPIFY_CLIENT_SECRET_SE_BAVER_SE && env.SHOPIFY_SECRET_ID_SE_BAVER_SE) env.SHOPIFY_CLIENT_SECRET_SE_BAVER_SE = env.SHOPIFY_SECRET_ID_SE_BAVER_SE;
  return env;
}

/** Temafilerna i repot: sections/*.liquid + templates/*.json → { 'sections/x.liquid': text } */
export function temafiler(mapp = TEMAMAPP) {
  const ut = {};
  for (const under of ['sections', 'templates']) {
    const dir = join(mapp, under);
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir).sort()) ut[`${under}/${f}`] = readFileSync(join(dir, f), 'utf8');
  }
  if (!Object.keys(ut).length) throw new Error(`Inga temafiler i ${mapp}.`);
  return ut;
}

const strippaKommentar = (s) => String(s ?? '').replace(/^\s*\/\*[\s\S]*?\*\/\s*/, '');
export function tolkaJson(text) { return JSON.parse(strippaKommentar(text)); }
/** JSON med nycklarna i bokstavsordning på varje nivå — så ordningen aldrig avgör "lika". */
export function kanonisk(v) {
  if (Array.isArray(v)) return `[${v.map(kanonisk).join(',')}]`;
  if (v && typeof v === 'object') return `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${kanonisk(v[k])}`).join(',')}}`;
  return JSON.stringify(v);
}
/** Lika tolkat (JSON, oavsett nyckelordning och Shopifys kommentar) eller exakt (Liquid). */
export function filerLika(namn, a, b) {
  if (/\.json$/.test(namn)) { try { return kanonisk(tolkaJson(a)) === kanonisk(tolkaJson(b)); } catch { return false; } }
  return String(a) === String(b);
}

export function lasBilder(fil = BILDFIL) { return existsSync(fil) ? JSON.parse(readFileSync(fil, 'utf8')) : {}; }

// ------------------------------------------------------------ Shopify

async function lasTemafiler(klient, temaId, namn) {
  const ut = {};
  for (let i = 0; i < namn.length; i += 20) {
    const del = namn.slice(i, i + 20);
    const d = await klient.graphql(
      `query stTemafiler($id: ID!, $namn: [String!]) { theme(id: $id) { files(filenames: $namn, first: 50) { nodes { filename body { ... on OnlineStoreThemeFileBodyText { content } } } } } }`,
      { id: temaId, namn: del }
    );
    for (const f of d.theme?.files?.nodes ?? []) ut[f.filename] = f.body?.content ?? null;
  }
  return ut;
}

async function skrivTemafiler(klient, temaId, filer, { logg }) {
  const namn = Object.keys(filer);
  await klient.graphql(
    `mutation stTemafilerUpp($themeId: ID!, $files: [OnlineStoreThemeFilesUpsertFileInput!]!) {
      themeFilesUpsert(themeId: $themeId, files: $files) { upsertedThemeFiles { filename } userErrors { filename message } }
    }`,
    { themeId: temaId, files: namn.map((filename) => ({ filename, body: { type: 'TEXT', value: filer[filename] } })) }
  );
  // Tillbakaläsningen: Shopify kan svara med den gamla filen någon sekund efter
  // upserten (mätt 2026-09-27 på config/settings_data.json — innehållet var
  // rätt vid nästa läsning). Därför upp till fem försök med paus.
  let fel = namn;
  for (let forsok = 0; forsok < 5 && fel.length; forsok++) {
    if (forsok) await sov(2000 * forsok);
    const efter = await lasTemafiler(klient, temaId, fel);
    fel = fel.filter((n) => !filerLika(n, efter[n], filer[n]));
  }
  if (fel.length) throw new Error(`Temafilerna lästes inte tillbaka lika: ${fel.join(', ')}.`);
  logg(`   ✓ ${namn.length} fil(er) skrivna och lästa tillbaka lika: ${namn.join(', ')}`);
}

export async function hittaTema(klient, { namn = ARBETSTEMA, id = null, duplicera = false, logg = () => {} } = {}) {
  const lista = async () => (await klient.graphql('{ themes(first: 50) { nodes { id name role processing } } }')).themes?.nodes ?? [];
  let alla = await lista();
  let t = id ? alla.find((x) => x.id === id || x.id.endsWith(`/${id}`)) : alla.find((x) => x.name === namn);
  if (!t && duplicera && !id) {
    // Arbetskopian: en kopia av det publicerade temat med arbetsnamnet (Axels
    // egen ordning — han duplicerar och publicerar utkastet).
    const main = alla.find((x) => x.role === 'MAIN');
    if (!main) throw new Error('Hittar inget publicerat tema att kopiera.');
    const d = await klient.graphql(`mutation stKopia($id: ID!, $name: String) { themeDuplicate(id: $id, name: $name) { newTheme { id name role processing } userErrors { field message } } }`, { id: main.id, name: namn });
    t = d.themeDuplicate?.newTheme;
    if (!t?.id) throw new Error('themeDuplicate gav inget tema.');
    logg(`   ✓ arbetskopia skapad ur "${main.name}": "${t.name}" ${t.id}`);
    for (let i = 0; i < 36 && t.processing; i++) { await sov(5000); t = (await lista()).find((x) => x.id === t.id) ?? t; }
  }
  if (!t) throw new Error(`Hittar inget tema ${id ? `med id ${id}` : `som heter "${namn}"`} (finns: ${alla.map((x) => `"${x.name}" [${x.role}]`).join(', ')}). Kör med --duplicera så skapas en kopia av det publicerade temat med det namnet.`);
  if (t.processing) throw new Error(`Temat "${t.name}" bearbetas fortfarande av Shopify — vänta en minut och kör igen.`);
  return t;
}

export async function laddaUppBild(klient, url, { filnamn, alt }) {
  if (/^shopify:\/\//.test(url)) return { ref: url, url: null };
  const d = await klient.graphql(
    `mutation stFil($files: [FileCreateInput!]!) { fileCreate(files: $files) { files { id fileStatus } userErrors { field message } } }`,
    { files: [{ originalSource: url, contentType: 'IMAGE', alt, filename: filnamn }] }
  );
  const id = d.fileCreate?.files?.[0]?.id;
  if (!id) throw new Error('fileCreate gav inget fil-id.');
  for (let i = 0; i < 40; i++) {
    const q = await klient.graphql(`query stBild($id: ID!) { node(id: $id) { ... on MediaImage { fileStatus image { url } } } }`, { id });
    const n = q.node;
    if (n?.fileStatus === 'READY' && n.image?.url) {
      const namn = basename(new URL(n.image.url).pathname);
      return { ref: `shopify://shop_images/${namn}`, url: n.image.url };
    }
    if (n?.fileStatus === 'FAILED') throw new Error(`Shopify kunde inte behandla bilden ${filnamn}.`);
    await sov(2000);
  }
  throw new Error(`Bilden ${filnamn} blev aldrig READY hos Shopify.`);
}

async function hittaSida(klient, handle) {
  const d = await klient.graphql(`query stSida($q: String!) { pages(first: 10, query: $q) { nodes { id handle title templateSuffix isPublished } } }`, { q: `handle:${handle}` });
  return (d.pages?.nodes ?? []).find((s) => s.handle === handle) ?? null;
}

async function skrivSida(klient, { logg, torr }) {
  const befintlig = await hittaSida(klient, OM_OSS.handle);
  const url = `${klient.bas}/pages/${OM_OSS.handle}`;
  if (torr) { logg(`Sida: ${befintlig ? `finns (${befintlig.title}, mall ${befintlig.templateSuffix}) — skulle uppdateras` : 'finns inte — skulle skapas'} · ${url}`); return { url, torr: true }; }
  const page = { title: OM_OSS.titel, body: OM_OSS.body, isPublished: true, templateSuffix: OM_OSS.mall };
  let sida;
  if (befintlig) {
    const d = await klient.graphql(`mutation stSidaUpp($id: ID!, $page: PageUpdateInput!) { pageUpdate(id: $id, page: $page) { page { id handle templateSuffix isPublished } userErrors { field message } } }`, { id: befintlig.id, page });
    sida = d.pageUpdate.page;
  } else {
    const d = await klient.graphql(`mutation stSidaNy($page: PageCreateInput!) { pageCreate(page: $page) { page { id handle templateSuffix isPublished } userErrors { field message } } }`, { page: { ...page, handle: OM_OSS.handle } });
    sida = d.pageCreate.page;
  }
  if (sida.handle !== OM_OSS.handle) throw new Error(`Sidan fick handlen "${sida.handle}", inte "${OM_OSS.handle}" — adressen är upptagen.`);
  if (sida.templateSuffix !== OM_OSS.mall) throw new Error(`Sidan fick mallen "${sida.templateSuffix}", inte "${OM_OSS.mall}".`);
  logg(`   ✓ sidan ${befintlig ? 'uppdaterad' : 'skapad'}: ${url} (mall page.${OM_OSS.mall})`);
  return { url, id: sida.id, skapad: !befintlig };
}

/** Kundens vy av en adress i ett visst tema (preview_theme_id för opublicerade). → { ok, saknas, tecken } */
export async function kundvy(klient, tema, vag, markorer) {
  const { hamtaSida } = await import('../factory/kundvy-kor.mjs');
  const ctx = { shop: { primaryDomain: { url: klient.bas }, myshopifyDomain: klient.shop } };
  const html = await hamtaSida(ctx, vag, { temaId: tema.role === 'MAIN' ? null : tema, losenord: klient.butik.losenord || null });
  const saknas = markorer.filter((m) => !html.includes(m));
  return { ok: saknas.length === 0, saknas, tecken: html.length, html };
}

// ------------------------------------------------------------ hela vägen

export async function publicera({ temanamn = ARBETSTEMA, temaId = null, duplicera = false, torr = false, publiceraTema = false, bildStart = null, bildOmOss = null, logg = console.log, env = process.env } = {}) {
  lagaMiljo(env);
  const butik = losButik('baverbutiken', env);
  const klient = await skapaKlient(butik);
  logg(`Butik: ${klient.namn} (${klient.shop}) · ${klient.bas}`);
  const tema = await hittaTema(klient, { namn: temanamn, id: temaId, duplicera: duplicera && !torr, logg });
  const recensioner = lasRecensioner();
  if (!recensioner.length) logg('⚠️ storytelling/recensioner.json är tom — kör node storytelling/recensioner.mjs först, annars blir recensionsblocket tomt.');
  logg(`Tema: "${tema.name}" (${tema.role}${tema.role === 'MAIN' ? ' — DET PUBLICERADE' : ''}) ${tema.id}`);

  // Bilderna: repots bilder.json är minnet, flaggorna vinner och skrivs dit.
  const bilder = lasBilder();
  const vill = { start: bildStart ?? bilder.start ?? null, omOss: bildOmOss ?? bilder.omOss ?? null };
  const ref = {};
  for (const [nyckel, kalla] of Object.entries(vill)) {
    if (!kalla) { ref[nyckel] = null; continue; }
    if (/^shopify:\/\//.test(kalla) || torr) { ref[nyckel] = kalla; continue; }
    const filnamn = nyckel === 'start' ? 'baverbutiken-historia.jpg' : 'baverbutiken-om-oss.jpg';
    const upp = await laddaUppBild(klient, kalla, { filnamn, alt: nyckel === 'start' ? 'Ett svenskt garage med verktyg, en tratt och en bensindunk' : 'Bäverbutikens bäver i garaget' });
    ref[nyckel] = upp.ref;
    logg(`   ✓ bild uppladdad (${nyckel}): ${upp.ref}`);
  }
  if (!torr && (ref.start !== bilder.start || ref.omOss !== bilder.omOss)) writeFileSync(BILDFIL, JSON.stringify({ start: ref.start, omOss: ref.omOss }, null, 2) + '\n');

  // 1. Temafilerna (sektioner + Om oss-mallen).
  const repo = temafiler();
  repo[OM_OSS_MALLFIL] = JSON.stringify(byggOmOssMall({ bilder: ref, recensioner }), null, 2) + '\n';
  const fore = await lasTemafiler(klient, tema.id, [...Object.keys(repo), INDEX, SETTINGS]);
  for (const n of [INDEX, SETTINGS]) if (fore[n] == null) throw new Error(`${n} finns inte i temat "${tema.name}".`);
  const nyaFiler = {};
  for (const [n, text] of Object.entries(repo)) if (!filerLika(n, fore[n], text)) nyaFiler[n] = text;

  // 2. Startsidan och sidfoten (rena funktioner över temats egna filer).
  const index = byggIndex(tolkaJson(fore[INDEX]), { bilder: ref, recensioner });
  const indexText = JSON.stringify(index, null, 2) + '\n';
  if (!filerLika(INDEX, fore[INDEX], indexText)) nyaFiler[INDEX] = indexText;
  const settings = byggFooter(tolkaJson(fore[SETTINGS]));
  const settingsText = JSON.stringify(settings, null, 2) + '\n';
  if (!filerLika(SETTINGS, fore[SETTINGS], settingsText)) nyaFiler[SETTINGS] = settingsText;

  const namn = Object.keys(nyaFiler);
  logg(`Filer: ${Object.keys(repo).length + 2} kontrollerade, ${namn.length} att skriva${namn.length ? `: ${namn.join(', ')}` : ' (allt står redan rätt)'}`);
  logg(`Startsidans ordning: ${index.order.filter((n) => index.sections[n]?.disabled !== true).join(' → ')}`);
  logg(`Sidfotens block: ${settings.current.sections.footer.block_order.map((id) => `${settings.current.sections.footer.blocks[id].type}${settings.current.sections.footer.blocks[id].settings?.title ? ` "${settings.current.sections.footer.blocks[id].settings.title}"` : ''} ${settings.current.sections.footer.blocks[id].settings?.container_width ?? ''}%`).join(' | ')}`);
  if (!torr && namn.length) await skrivTemafiler(klient, tema.id, nyaFiler, { logg });

  // 3. Sidan.
  const sida = await skrivSida(klient, { logg, torr });

  const rad = { tid: new Date().toISOString(), tema: { id: tema.id, namn: tema.name, roll: tema.role }, skrivna: namn, bilder: ref, sida: sida.url, torr, publicerad: false, kundvy: null };
  if (torr) { logg('Torrt: inget skrivet.'); return rad; }

  // 4. Kundens vy i det här temat (preview om det inte är publicerat).
  const nummer = tema.id.split('/').pop();
  const start = await kundvy(klient, tema, '/?country=SE', MARKORER.startsida);
  const om = await kundvy(klient, tema, `/pages/${OM_OSS.handle}?country=SE`, MARKORER.omOss);
  rad.kundvy = { startsida: { ok: start.ok, saknas: start.saknas }, omOss: { ok: om.ok, saknas: om.saknas } };
  logg(`Kundvy (${tema.role === 'MAIN' ? 'live' : `preview_theme_id=${nummer}`}): startsidan ${start.ok ? '✓' : `❌ saknar ${start.saknas.join(', ')}`} · om oss ${om.ok ? '✓' : `❌ saknar ${om.saknas.join(', ')}`}`);
  if (tema.role !== 'MAIN') logg(`Förhandsvisning: ${klient.bas}/?preview_theme_id=${nummer}`);

  // 5. Publicera — bara på begäran, bara om kundvyn är grön.
  if (publiceraTema) {
    if (tema.role === 'MAIN') logg('Temat är redan publicerat.');
    else {
      if (!start.ok || !om.ok) throw new Error('Publicerar inte: kundvyn i arbetstemat saknar markörer (se ovan).');
      const d = await klient.graphql(`mutation stPublicera($id: ID!) { themePublish(id: $id) { theme { id name role } userErrors { field message } } }`, { id: tema.id });
      const t = d.themePublish?.theme;
      if (t?.role !== 'MAIN') throw new Error(`themePublish gav rollen ${t?.role ?? '?'} — inte publicerat.`);
      logg(`   ✓ publicerat: "${t.name}" är nu det aktiva temat`);
      rad.publicerad = true;
      await sov(4000);
      const live = await kundvy(klient, { ...tema, role: 'MAIN' }, '/?country=SE', MARKORER.startsida);
      const liveOm = await kundvy(klient, { ...tema, role: 'MAIN' }, `/pages/${OM_OSS.handle}?country=SE`, MARKORER.omOss);
      rad.kundvy.live = { startsida: { ok: live.ok, saknas: live.saknas }, omOss: { ok: liveOm.ok, saknas: liveOm.saknas } };
      logg(`Live: ${klient.bas}/ ${live.ok ? '✓' : `❌ saknar ${live.saknas.join(', ')}`} · ${sida.url} ${liveOm.ok ? '✓' : `❌ saknar ${liveOm.saknas.join(', ')}`}`);
      if (!live.ok || !liveOm.ok) throw new Error('Publicerat, men livesidan saknar markörer — kontrollera i webbläsaren.');
    }
  }
  appendFileSync(LOGG, JSON.stringify(rad) + '\n');
  return rad;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const argv = process.argv.slice(2);
  const arg = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : null; };
  publicera({
    temanamn: arg('--tema') ?? ARBETSTEMA,
    temaId: arg('--tema-id'),
    duplicera: argv.includes('--duplicera'),
    torr: argv.includes('--torr'),
    publiceraTema: argv.includes('--publicera'),
    bildStart: arg('--bild-start'),
    bildOmOss: arg('--bild-omoss'),
  }).catch((e) => { console.error(`\n❌ ${e.message}\n`); process.exit(1); });
}
