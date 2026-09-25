// Sajtens anmälningsruta → klubben. Axels beslut 2026-09-25 ("det måste vara som
// ett medlemskap att vara med i Matstrumpors klubb"): rutan i sidfoten på
// matstrumpor.se hette "Missa inga nyheter" med knappen "Prenumerera" (mätt i
// det publicerade temat samma dag). Skriptet byter temats rubrik
// (sections/footer-group.json → sections.footer.settings.newsletter_heading)
// och knappen + bekräftelsen (locales/sv.json → newsletter.button_label /
// newsletter.success) till brandfilens `klubb.sajt`, via themeFilesUpsert på det
// publicerade temat, läser tillbaka exakt och kontrollerar den publika sidan.
//
//   node klaviyo/klubb-sajt.mjs --brand matstrumpor            # torrt: visar nu → ny
//   node klaviyo/klubb-sajt.mjs --brand matstrumpor --skarpt   # skriver, läser tillbaka, kollar sajten
//
// Bara de tre värdena byts, som strängbyten i råtexten: Shopifys kommentar
// överst i filerna och all annan formatering står kvar. Kräver butikens
// Shopify-nycklar (sparning/butiker.json + SHOPIFY_CLIENT_ID/SECRET_<suffix>).
// Loggen: klaviyo/konto/<brand>/klubb-sajt.jsonl (före/efter, committas).

import { readFileSync, appendFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROT } from './mallar.mjs';
import { lasBrand } from './ladda-upp.mjs';

export const FOOTER_FIL = 'sections/footer-group.json';
export const LOCALE_FIL = 'locales/sv.json';

const jsonStrang = (v) => JSON.stringify(String(v)).slice(1, -1);

/** Första "<nyckel>": "…" i texten → nytt värde. → { text, gammal } */
export function bytNyckel(text, nyckel, ny) {
  const re = new RegExp(`("${nyckel}":\\s*")([^"\\\\]*(?:\\\\.[^"\\\\]*)*)(")`);
  const m = re.exec(text);
  if (!m) throw new Error(`"${nyckel}" finns inte i filen — temat ser inte ut som väntat, inget skrivs.`);
  return { text: text.replace(re, `$1${jsonStrang(ny)}$3`), gammal: JSON.parse(`"${m[2]}"`) };
}

/** Byten inne i locale-filens "newsletter": { … }-block (platt objekt). → { text, gamla } */
export function bytINewsletterBlock(text, byten) {
  const start = text.indexOf('"newsletter": {');
  if (start < 0) throw new Error('"newsletter"-blocket finns inte i locale-filen — inget skrivs.');
  const slut = text.indexOf('}', start);
  let block = text.slice(start, slut);
  const gamla = {};
  for (const [k, v] of Object.entries(byten)) {
    if (v == null || v === '') continue;
    const r = bytNyckel(block, k, v);
    block = r.text;
    gamla[k] = r.gammal;
  }
  return { text: text.slice(0, start) + block + text.slice(slut), gamla };
}

/** Vad som ska stå, ur brandfilen. */
export function sajtVarden(brand) {
  const s = brand.klubb?.sajt;
  if (!s?.rubrik || !s?.knapp) throw new Error(`brandfilen saknar klubb.sajt.rubrik/knapp — inget att skriva.`);
  return { rubrik: s.rubrik, knapp: s.knapp, bekraftelse: s.bekraftelse ?? null };
}

/** Räknar ut de nya filerna ur de gamla. Ren funktion (testad utan nät). */
export function nyaFiler(filer, varden) {
  const footer = bytNyckel(filer[FOOTER_FIL], 'newsletter_heading', varden.rubrik);
  const locale = bytINewsletterBlock(filer[LOCALE_FIL], { button_label: varden.knapp, success: varden.bekraftelse });
  return {
    filer: { [FOOTER_FIL]: footer.text, [LOCALE_FIL]: locale.text },
    fore: { rubrik: footer.gammal, knapp: locale.gamla.button_label ?? null, bekraftelse: locale.gamla.success ?? null },
  };
}

async function lasTemafiler(klient, temaId, namn) {
  const d = await klient.graphql(
    `query klubbTemafiler($id: ID!, $namn: [String!]) { theme(id: $id) { files(filenames: $namn, first: 10) { nodes { filename body { ... on OnlineStoreThemeFileBodyText { content } } } } } }`,
    { id: temaId, namn }
  );
  const ut = {};
  for (const f of d.theme?.files?.nodes ?? []) ut[f.filename] = f.body?.content ?? null;
  for (const n of namn) if (ut[n] == null) throw new Error(`${n} finns inte i temat.`);
  return ut;
}

/** Den publika sidan, som kunden ser den. → { rubrik: bool, knapp: bool } */
export function sidanBar(html, varden) {
  const esk = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const har = (s) => html.includes(s) || html.includes(esk(s));
  return { rubrik: har(varden.rubrik), knapp: har(varden.knapp) };
}

async function main() {
  const argv = process.argv.slice(2);
  const arg = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : null; };
  const brand = lasBrand(arg('--brand') ?? 'matstrumpor');
  const skarpt = argv.includes('--skarpt');
  const varden = sajtVarden(brand);
  const butikId = brand.shopify?.butik;
  if (!butikId) throw new Error('brandfilen saknar shopify.butik (butikens id i sparning/butiker.json).');
  (await import('../mejl/shopify.mjs')).kravProxy();
  const { lasButik, skapaKlient } = await import('../sparning/butik.mjs');
  const klient = await skapaKlient(lasButik(butikId));
  const d = await klient.graphql('{ themes(first: 5, roles: [MAIN]) { nodes { id name role } } }');
  const tema = (d.themes?.nodes ?? []).find((t) => t.role === 'MAIN');
  if (!tema) throw new Error('hittar inget publicerat tema (role MAIN).');
  const fore = await lasTemafiler(klient, tema.id, [FOOTER_FIL, LOCALE_FIL]);
  const ny = nyaFiler(fore, varden);
  console.log(`Tema: "${tema.name}" (publicerat)`);
  console.log(`  rubrik:      "${ny.fore.rubrik}" → "${varden.rubrik}"`);
  console.log(`  knapp:       "${ny.fore.knapp}" → "${varden.knapp}"`);
  if (varden.bekraftelse) console.log(`  bekräftelse: "${ny.fore.bekraftelse}" → "${varden.bekraftelse}"`);
  const oforandrat = Object.keys(ny.filer).filter((n) => ny.filer[n] === fore[n]);
  if (oforandrat.length === 2) { console.log('Allt står redan rätt i temat — inget att skriva.'); }
  if (!skarpt) { console.log('Torrt: inget skrivet. Kör med --skarpt.'); return; }
  const attSkriva = Object.keys(ny.filer).filter((n) => ny.filer[n] !== fore[n]);
  if (attSkriva.length) {
    await klient.graphql(
      `mutation klubbTemafilerUpp($themeId: ID!, $files: [OnlineStoreThemeFilesUpsertFileInput!]!) {
        themeFilesUpsert(themeId: $themeId, files: $files) { upsertedThemeFiles { filename } userErrors { filename message } }
      }`,
      { themeId: tema.id, files: attSkriva.map((filename) => ({ filename, body: { type: 'TEXT', value: ny.filer[filename] } })) }
    );
    const efter = await lasTemafiler(klient, tema.id, attSkriva);
    // Shopify skriver om sin kommentar överst; jämför själva värdena, inte hela texten.
    const kontroll = nyaFiler(efter, varden);
    const fel = [];
    if (kontroll.fore.rubrik !== varden.rubrik) fel.push(`rubriken lästes tillbaka som "${kontroll.fore.rubrik}"`);
    if (kontroll.fore.knapp !== varden.knapp) fel.push(`knappen lästes tillbaka som "${kontroll.fore.knapp}"`);
    if (varden.bekraftelse && kontroll.fore.bekraftelse !== varden.bekraftelse) fel.push(`bekräftelsen lästes tillbaka som "${kontroll.fore.bekraftelse}"`);
    if (fel.length) throw new Error(`Tillbakaläsningen stämmer inte: ${fel.join('; ')}`);
    console.log(`  ✓ ${attSkriva.length} temafil(er) skrivna och lästa tillbaka`);
  }
  // Kundens vy: sidan som den servas, inte temafilen.
  const url = `${brand.butik_url.replace(/\/$/, '')}/?country=SE`;
  let sida = { rubrik: null, knapp: null };
  try {
    const svar = await fetch(url, { headers: { accept: 'text/html', 'accept-language': 'sv' } });
    sida = sidanBar(await svar.text(), varden);
    console.log(`  publika sidan ${url}: rubrik ${sida.rubrik ? '✓' : '✗ (kan vara cache, mät igen om en stund)'} · knapp ${sida.knapp ? '✓' : '✗'}`);
  } catch (e) { console.log(`  publika sidan gick inte att läsa: ${e.message}`); }
  const loggDir = join(ROT, 'klaviyo', 'konto', brand.id);
  mkdirSync(loggDir, { recursive: true });
  appendFileSync(join(loggDir, 'klubb-sajt.jsonl'), JSON.stringify({ tid: new Date().toISOString(), tema: tema.name, fore: ny.fore, efter: varden, skrivna: attSkriva, publika_sidan: sida }) + '\n');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => { console.error(e.stack ?? e.message); process.exit(1); });
}
