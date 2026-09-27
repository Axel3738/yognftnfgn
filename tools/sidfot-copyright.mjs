// Sidfotens copyright-rad — året räknas av temat självt, aldrig av en människa.
//
// Axels fråga 2026-09-27 (skärmdump på baverbutiken.se): sidfoten sa
// "© 2023 xoxo. Alla rättigheter förbehållna." — "Kan vi ändra detta till 2026?"
// Mätt samma dag i det publicerade temat: raden är `{{ powered_by_link }}` i
// sections/footer.liquid, och temats locales/sv.json har skrivit över Shopifys
// systemtext `shopify.links.powered_by_shopify` med en fast text (och
// `all_rights_reserved` för kassan med "© 2023 Hahahhaha …"). Ett fast år blir
// fel varje januari, så raden byts mot Liquid som räknar året:
//
//   <p class="footer__small-text">{{ powered_by_link }}</p>
//   →
//   <p class="footer__small-text">&copy; {{ 'now' | date: '%Y' }} Bäverbutiken. Alla rättigheter förbehållna.</p>
//
// Locale-strängarna med fast år blir årslösa ("© Bäverbutiken. Alla rättigheter
// förbehållna.") — de renderas inte längre i sidfoten, men skulle någon lägga
// tillbaka powered_by_link står det aldrig ett gammalt år där igen.
//
// Samma rad finns i beverbutikken.no, baeverbutiken.dk och majavakauppa.fi
// ("© 2023 xoxo …" resp. "© 2023 Majavakauppa 🦫 …", mätt 2026-09-27) — samma
// verktyg, men deras appar (Bever No produkter claude / DK claudeprodukter /
// FI claudeprodukter) saknar read_themes + write_themes; verktyget säger då
// exakt vilket klick som behövs och skriver ingenting.
//
//   node tools/sidfot-copyright.mjs --butik baverbutiken            # torrt: visar nu → ny
//   node tools/sidfot-copyright.mjs --butik baverbutiken --skarpt   # skriver, läser tillbaka, kollar publika sidan
//
// Bara strängbyten i råtexten (som klaviyo/klubb-sajt.mjs): Shopifys kommentar
// överst och all annan formatering står kvar. Idempotent: står allt rätt skrivs inget.

import { pathToFileURL } from 'node:url';

/** Butikens text efter året, och adressen kontrollen läser som kund. */
export const BUTIKER = {
  baverbutiken:  { text: 'Bäverbutiken. Alla rättigheter förbehållna.',   url: 'https://baverbutiken.se/?country=SE' },
  beverbutikken: { text: 'Beverbutikken. Alle rettigheter forbeholdt.',   url: 'https://beverbutikken.no/' },
  baeverbutiken: { text: 'Bæverbutiken. Alle rettigheder forbeholdes.',   url: 'https://baeverbutiken.dk/' },
  majavakauppa:  { text: 'Majavakauppa 🦫. Kaikki oikeudet pidätetään.',   url: 'https://majavakauppa.fi/' },
};

/** Liquid-raden som ersätter powered_by_link. */
export const liquidRad = (text) => `&copy; {{ 'now' | date: '%Y' }} ${text}`;

const POWERED_BY = /\{\{-?\s*powered_by_link\s*-?\}\}/g;
const NYCKLAR_MED_AR = ['powered_by_shopify', 'all_rights_reserved'];
const FAST_AR = /^\s*(©|&copy;)\s*(19|20)\d\d\b\s*/;

/**
 * Temafilen med powered_by_link → samma fil med Liquid-raden. Ren funktion.
 *   → { text, antal }   antal = hur många powered_by_link som byttes (0 = redan gjort eller finns inte)
 */
export function nyLiquid(text, butikText) {
  const traffar = text.match(POWERED_BY) ?? [];
  if (traffar.length > 1) throw new Error(`powered_by_link står ${traffar.length} gånger i filen — väntade högst en, inget skrivs.`);
  return { text: text.replace(POWERED_BY, liquidRad(butikText)), antal: traffar.length };
}

/**
 * Locale-filen: varje "powered_by_shopify"/"all_rights_reserved" vars värde börjar
 * med "© <år>" blir "© <butikens text>". Ren funktion över råtexten.
 *   → { text, byten: [{ nyckel, gammal, ny }] }
 */
export function nyLocale(text, butikText) {
  const byten = [];
  let ut = text;
  for (const nyckel of NYCKLAR_MED_AR) {
    const re = new RegExp(`("${nyckel}":\\s*")([^"\\\\]*(?:\\\\.[^"\\\\]*)*)(")`, 'g');
    ut = ut.replace(re, (hela, fore, varde, efter) => {
      const gammal = JSON.parse(`"${varde}"`);
      if (!FAST_AR.test(gammal)) return hela;
      const ny = `© ${butikText}`;
      byten.push({ nyckel, gammal, ny });
      return `${fore}${JSON.stringify(ny).slice(1, -1)}${efter}`;
    });
  }
  return { text: ut, byten };
}

/** Kundens vy: står årets rad i HTML:en? (Liquid skriver &copy;, äldre text skrev ©.) */
export function sidanBar(html, butikText, ar = new Date().getFullYear()) {
  const esk = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const varianter = [`&copy; ${ar} ${butikText}`, `© ${ar} ${butikText}`, `&copy; ${ar} ${esk(butikText)}`, `© ${ar} ${esk(butikText)}`];
  return varianter.some((v) => html.includes(v));
}

// ------------------------------------------------------------ Shopify

const SCOPES = ['read_themes', 'write_themes'];

async function skapaTemaKlient(butikId) {
  if (butikId === 'baverbutiken') {
    const { losButik, skapaKlient } = await import('../listicle/butik.mjs');
    const k = await skapaKlient(losButik('baverbutiken')); // stoppar själv om write_themes saknas
    return { graphql: k.graphql, shop: k.shop, namn: k.namn, app: null, scopes: k.scopes };
  }
  const { lasButik, skapaKlient } = await import('../sparning/butik.mjs');
  const butik = lasButik(butikId);
  const k = await skapaKlient(butik);
  const info = await k.kolla();
  const saknar = SCOPES.filter((s) => !info.scopes.includes(s));
  if (saknar.length) {
    const err = new Error(
      `${butik.namn}: appen "${info.app}" saknar ${saknar.join(' + ')} — inget skrivs.\n` +
        `  Axels klick: dev.shopify.com → appen "${info.app}" → Configuration → Access scopes → bocka i read_themes och write_themes → Release ny version → godkänn den i butikens admin (Appar → ${info.app}).\n` +
        `  Kör sedan om: node tools/sidfot-copyright.mjs --butik ${butikId} --skarpt`
    );
    err.kod = 'SCOPE_SAKNAS';
    throw err;
  }
  return { graphql: k.graphql, shop: k.shop, namn: info.namn, app: info.app, scopes: info.scopes };
}

async function liveTema(klient) {
  const d = await klient.graphql('{ themes(first: 5, roles: [MAIN]) { nodes { id name role } } }');
  const tema = (d.themes?.nodes ?? []).find((t) => t.role === 'MAIN');
  if (!tema) throw new Error(`${klient.shop}: hittar inget publicerat tema (role MAIN).`);
  return tema;
}

async function allaFilnamn(klient, temaId) {
  let cursor = null; const namn = [];
  do {
    const d = await klient.graphql(
      `query sidfotFilnamn($id: ID!, $c: String) { theme(id: $id) { files(first: 250, after: $c) { nodes { filename } pageInfo { hasNextPage endCursor } } } }`,
      { id: temaId, c: cursor }
    );
    for (const f of d.theme.files.nodes) namn.push(f.filename);
    cursor = d.theme.files.pageInfo.hasNextPage ? d.theme.files.pageInfo.endCursor : null;
  } while (cursor);
  return namn;
}

async function lasFiler(klient, temaId, namn) {
  const ut = {};
  for (let i = 0; i < namn.length; i += 40) {
    const del = namn.slice(i, i + 40);
    const d = await klient.graphql(
      `query sidfotFiler($id: ID!, $namn: [String!]) { theme(id: $id) { files(filenames: $namn, first: 50) { nodes { filename body { ... on OnlineStoreThemeFileBodyText { content } } } } } }`,
      { id: temaId, namn: del }
    );
    for (const f of d.theme.files.nodes) ut[f.filename] = f.body?.content ?? null;
  }
  return ut;
}

/** Räknar ut vad som ska skrivas. → { skriv: {fil: text}, liquidFiler, localeByten, redanKlart } */
export function planera(filer, butikText) {
  const skriv = {}; const liquidFiler = []; const localeByten = [];
  for (const [fil, text] of Object.entries(filer)) {
    if (typeof text !== 'string') continue;
    if (fil.endsWith('.liquid')) {
      const r = nyLiquid(text, butikText);
      if (r.antal) { skriv[fil] = r.text; liquidFiler.push(fil); }
    } else if (/^locales\/.*\.json$/.test(fil)) {
      const r = nyLocale(text, butikText);
      if (r.byten.length) { skriv[fil] = r.text; localeByten.push(...r.byten.map((b) => ({ fil, ...b }))); }
    }
  }
  const redanKlart = Object.values(filer).some((t) => typeof t === 'string' && t.includes(liquidRad(butikText)));
  return { skriv, liquidFiler, localeByten, redanKlart };
}

async function main() {
  const argv = process.argv.slice(2);
  const arg = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : null; };
  const butikId = arg('--butik') ?? 'baverbutiken';
  const skarpt = argv.includes('--skarpt');
  const butik = BUTIKER[butikId];
  if (!butik) throw new Error(`Okänd butik "${butikId}". Finns: ${Object.keys(BUTIKER).join(', ')}.`);
  (await import('../mejl/shopify.mjs')).kravProxy();

  const klient = await skapaTemaKlient(butikId);
  const tema = await liveTema(klient);
  console.log(`Butik: ${klient.namn} (${klient.shop}) · publicerat tema "${tema.name}"`);

  const namn = (await allaFilnamn(klient, tema.id)).filter((n) => /^(sections|snippets|layout)\/.*\.liquid$|^locales\/.*\.json$/.test(n));
  const filer = await lasFiler(klient, tema.id, namn);
  const plan = planera(filer, butik.text);
  const attSkriva = Object.keys(plan.skriv);

  if (plan.liquidFiler.length) console.log(`  powered_by_link → "${liquidRad(butik.text)}" i ${plan.liquidFiler.join(', ')}`);
  else console.log(`  powered_by_link finns inte i temat${plan.redanKlart ? ' — årsraden står redan där' : ' (sidfoten byggs på annat sätt; läs sections/footer*.liquid för hand)'}`);
  for (const b of plan.localeByten) console.log(`  ${b.fil} ${b.nyckel}: "${b.gammal}" → "${b.ny}"`);
  if (!attSkriva.length) { console.log('Allt står redan rätt i temat — inget att skriva.'); }
  if (!skarpt) { console.log(`Torrt: inget skrivet. Kör med --skarpt (${attSkriva.length} fil(er) att skriva).`); return; }

  if (attSkriva.length) {
    await klient.graphql(
      `mutation sidfotUpp($themeId: ID!, $files: [OnlineStoreThemeFilesUpsertFileInput!]!) {
        themeFilesUpsert(themeId: $themeId, files: $files) { upsertedThemeFiles { filename } userErrors { filename message } }
      }`,
      { themeId: tema.id, files: attSkriva.map((filename) => ({ filename, body: { type: 'TEXT', value: plan.skriv[filename] } })) }
    );
    // Tillbakaläsning: Shopify skriver om sin kommentar överst, så jämför själva
    // raderna. ⚠️ Mätt 2026-09-27: en läsning direkt efter upsert gav den GAMLA
    // locales/sv.json (footer.liquid var redan ny) — filerna blir läsbara några
    // sekunder efter varandra. Därför upp till fem försök med paus emellan.
    const kontrollera = (efter) => {
      const fel = [];
      for (const fil of plan.liquidFiler) {
        if (!efter[fil]?.includes(liquidRad(butik.text))) fel.push(`${fil} saknar årsraden`);
        if (POWERED_BY.test(efter[fil] ?? '')) fel.push(`${fil} har kvar powered_by_link`);
        POWERED_BY.lastIndex = 0;
      }
      for (const b of plan.localeByten) {
        if (!efter[b.fil]?.includes(JSON.stringify(b.ny).slice(1, -1))) fel.push(`${b.fil} ${b.nyckel} lästes inte tillbaka som "${b.ny}"`);
      }
      return fel;
    };
    let fel = [];
    for (let forsok = 1; forsok <= 5; forsok++) {
      fel = kontrollera(await lasFiler(klient, tema.id, attSkriva));
      if (!fel.length) break;
      if (forsok < 5) { console.log(`  … tillbakaläsning ${forsok}: filen är inte uppdaterad än, väntar 4 s`); await new Promise((r) => setTimeout(r, 4000)); }
    }
    if (fel.length) throw new Error(`Tillbakaläsningen stämmer inte efter fem försök: ${fel.join('; ')}`);
    console.log(`  ✓ ${attSkriva.length} temafil(er) skrivna och lästa tillbaka`);
  }

  // Kundens vy: sidan som den servas, inte temafilen.
  try {
    const svar = await fetch(butik.url, { headers: { accept: 'text/html', 'accept-language': 'sv' } });
    const ok = sidanBar(await svar.text(), butik.text);
    console.log(`  publika sidan ${butik.url}: ${ok ? `✓ "© ${new Date().getFullYear()} ${butik.text}"` : '✗ årsraden syns inte än (kan vara cache — mät igen om en stund)'}`);
  } catch (e) { console.log(`  publika sidan gick inte att läsa: ${e.message}`); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => { console.error(e.stack && e.kod !== 'SCOPE_SAKNAS' ? e.stack : e.message); process.exit(e.kod === 'SCOPE_SAKNAS' ? 2 : 1); });
}
