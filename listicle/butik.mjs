// butik.mjs — listiclen in i butiken, utan GemPages (Axels beslut 2026-09-16:
// "jättedyrt när jag ska installera GemPages på varje enda butik").
//
// Tre steg, alla via Admin GraphQL:
//
//   1. Temafilerna, EN gång per butik (skrivs om bara när innehållet ändrats):
//        layout/listicle.liquid          — ren layout utan header/footer/meny,
//                                          content_for_header kvar (pixlarna)
//        templates/page.listicle.liquid  — sidmallen "listicle": layouten + page.content
//        assets/listicle.css             — sidans stil (samma CSS som html.mjs)
//      Skrivs på det PUBLICERADE temat (role MAIN). Filerna gör ingenting
//      förrän en sida använder mallen, så de är ofarliga att lägga in.
//   2. Sidan: pageCreate/pageUpdate med templateSuffix "listicle", handle
//      <slug>-<koncept>, body = listiclens HTML (utan <style>). Finns handlen
//      redan uppdateras sidan — samma adress, ny text.
//   3. Trippelkollen: läs sidan som kund (factory/kundvy-kor.mjs, med
//      storefront-lösenord om butiken är stängd) och kontrollera: HTTP 200,
//      listiclen finns, INGA temasektioner (id="shopify-section-…" = header/
//      footer), bara vår egen <footer>.
//
// Butiker: "baverbutiken" (nycklarna SHOPIFY_*_SE, samma app som mejl/ —
// write_themes + write_content tillagda av Axel 2026-09-16) och OPS-butikerna
// (factory/butiker/<id>.yaml → butikens domän → suffixet i miljön, samma
// uppslag som factory/token.mjs). Tokenen mintas här (client credentials);
// fabrikens `anslut` används INTE: dess spärrar är byggda för att stoppa ett
// NYTT BYGGE på en live-butik, och en landningssida ska in i just live-butiken.
//
// Bilderna ligger kvar på källbutikens CDN (Bäverbutikens) — publika URL:er,
// samma som OPS-produkternas egna bilder redan gör.

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { NYCKELNAMN } from '../mejl/shopify.mjs';
import { losNycklar, suffixForDoman, storefrontLosenord, mintaToken, normaliseraDoman } from '../factory/token.mjs';
import { lasYaml } from '../factory/yaml.mjs';
import { domanForMarknad, arOpsMarknad } from '../factory/opsmarknader.mjs';
import { standardLocale, lokalValuta, landsnamnSv, landEn, arKandLandskod } from '../factory/lander.mjs';
import { CSS } from './html.mjs';

const HAR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HAR, '..');
const API_VERSION = '2025-07';
export const MALLSUFFIX = 'listicle';
export const BAVERBUTIKEN = 'baverbutiken';

// ------------------------------------------------------------ vilken butik

/** Bäverbutiken heter så i kommandona; "se"/"baver" tas emot också. */
export const arBaverbutiken = (id) => ['baverbutiken', 'baverbutiken.se', 'baver', 'se', 'bäverbutiken'].includes(String(id ?? '').trim().toLowerCase());

const forsta = (env, namn) => namn.map((n) => env[n]).find((v) => v && String(v).trim());

/** Domänen i factory/butiker/<id>.yaml (utan att dra in yaml-modulen för en rad). */
export function butiksDoman(butikId, { butikerMapp = join(ROT, 'factory', 'butiker') } = {}) {
  const fil = join(butikerMapp, `${butikId}.yaml`);
  if (!existsSync(fil)) return null;
  const m = /^\s*myshopify:\s*"?([a-z0-9-]+\.myshopify\.com)"?/m.exec(readFileSync(fil, 'utf8'));
  return m ? m[1] : null;
}

/**
 * Nycklarna för en butik ur miljön. Ren funktion över `env` så den går att testa.
 *   → { id, shop, clientId, clientSecret, losenord, kalla }
 */
export function losButik(butikId, env = process.env, { butikerMapp } = {}) {
  const id = String(butikId ?? '').trim().toLowerCase();
  if (!id) throw new Error('losButik: butik saknas — skriv --butik baverbutiken eller --butik <ops-id>.');
  if (arBaverbutiken(id)) {
    const shop = normaliseraDoman(env.SHOPIFY_SHOP_SE ?? '');
    const clientId = forsta(env, NYCKELNAMN.id) ?? '';
    const clientSecret = forsta(env, NYCKELNAMN.secret) ?? '';
    const saknas = [!shop && 'SHOPIFY_SHOP_SE', !clientId && NYCKELNAMN.id.join(' eller '), !clientSecret && NYCKELNAMN.secret.join(' eller ')].filter(Boolean);
    if (saknas.length) throw new Error(`Bäverbutiken: saknar ${saknas.join(', ')} i miljön.`);
    return { id: BAVERBUTIKEN, shop, clientId, clientSecret, losenord: env.SHOPIFY_STOREFRONT_PASSWORD_SE ?? '', kalla: 'SHOPIFY_*_SE' };
  }
  // OPS: domänen ur butiksfilen → suffixet som bär den i miljön (Axels beslut
  // 2026-09-10: VA:n döper variablerna efter adressen, inte efter butiks-id:t).
  const doman = butiksDoman(id, { butikerMapp });
  const suffix = doman ? suffixForDoman(doman, env) : null;
  const n = losNycklar(suffix ?? id, env);
  if (!n.shop || !n.clientId || !n.clientSecret) {
    throw new Error(
      `Butiken "${id}": hittar inte SHOPIFY_SHOP/CLIENT_ID/CLIENT_SECRET i miljön` +
        (doman ? ` för ${doman} (ingen SHOPIFY_SHOP_<suffix> bär den adressen)` : ` (ingen factory/butiker/${id}.yaml och inga _${id.toUpperCase()}-nycklar)`) + '.'
    );
  }
  return { id, shop: n.shop, clientId: n.clientId, clientSecret: n.clientSecret, losenord: storefrontLosenord(suffix ?? id, env), kalla: `SHOPIFY_*_${suffix ?? id.toUpperCase()}` };
}

// ------------------------------------------------------------ marknaden

// Samma sida på en annan MARKNAD (Axels fråga 2026-09-16 kväll: CaraShells
// två lagerrensningssidor "för carashell.com" — USA-marknaden, engelska, USD,
// egen domän). Det är samma Shopify-butik med Shopify Markets, så sidan
// dupliceras INTE: den svenska sidan får en ÖVERSÄTTNING (Translations API,
// locale en) och marknadens domän visar den. En dubblettsida hade fått en
// egen handle och synts på båda domänerna.
//
// Marknaden läses ur factory/butiker/<id>.yaml → butik.marknader (land,
// locale, valuta, doman) — samma rad /ny-marknad skrev. Bäverbutiken har
// ingen butiksfil och därmed inga marknader här.

/** Marknaden för en butik ur butiksfilen. → { kod, land, locale, valuta, doman, egen, namn } */
export function marknadForButik(butikId, kod, { butikerMapp = join(ROT, 'factory', 'butiker') } = {}) {
  const id = String(butikId ?? '').trim().toLowerCase();
  const k = String(kod ?? '').trim().toUpperCase();
  if (!k) throw new Error('marknadForButik: marknadskod saknas (--marknad US).');
  if (arBaverbutiken(id)) throw new Error('Bäverbutiken har inga marknader i fabriken (ingen factory/butiker/baverbutiken.yaml) — --marknad gäller OPS-butikerna.');
  const fil = join(butikerMapp, `${id}.yaml`);
  if (!existsSync(fil)) throw new Error(`Butiken "${id}": ingen factory/butiker/${id}.yaml — --marknad kräver en OPS-butik med marknader.`);
  const b = lasYaml(readFileSync(fil, 'utf8'));
  const rader = Array.isArray(b?.butik?.marknader) ? b.butik.marknader : [];
  const rad = rader.find((m) => String(m?.land ?? '').trim().toUpperCase() === k);
  if (!rad) throw new Error(`Butiken "${id}" har ingen marknad ${k} i factory/butiker/${id}.yaml (marknader: ${rader.map((m) => m?.land).filter(Boolean).join(', ') || 'inga'}). Kör /ny-marknad ${id} ${k} först.`);
  const { doman, egen } = domanForMarknad(b, k);
  const locale = String(rad.locale ?? standardLocale(k) ?? '').trim().toLowerCase();
  const valuta = String(rad.valuta ?? lokalValuta(k) ?? '').trim().toUpperCase();
  if (!locale || !valuta) throw new Error(`Marknaden ${k} i factory/butiker/${id}.yaml saknar locale/valuta.`);
  return { kod: k, land: k, locale, valuta, doman, egen, namn: landsnamnSv(k), butik: id, annonsmarknad: arOpsMarknad(k) };
}

/**
 * Ett LAND inom en marknad (Shopify: en marknad med flera länder och lokal
 * valuta). CaraShells marknad "USA" täcker US, GB, CA, AU och NZ på
 * carashell.com med automatisk kursomräkning (mätt 2026-09-17) — samma
 * språk, samma domän, men eget pris i egen valuta och egen adress med
 * `?country=GB`. Landet får därför en EGEN sida (handle + "-gb"), inte en
 * översättning: översättningen är per språk och marknad, inte per land.
 *   landForMarknad(marknadForButik('carashell', 'US'), 'GB')
 *   → { …marknad, land: 'GB', valuta: 'GBP', namn: 'Storbritannien', landEn: 'United Kingdom', egetLand: true }
 */
export function landForMarknad(marknad, land) {
  const k = String(land ?? '').trim().toUpperCase();
  if (!k || k === marknad.land) return marknad;
  if (!arKandLandskod(k)) throw new Error(`Okänt land "${land}" — lägg till det i factory/lander.mjs (EN tabell).`);
  const valuta = lokalValuta(k);
  if (!valuta) throw new Error(`Landet ${k} saknar valuta i factory/lander.mjs.`);
  return { ...marknad, land: k, valuta, namn: landsnamnSv(k), landEn: landEn(k), inomMarknad: marknad.kod, egetLand: true };
}

/**
 * Marknadens bas-URL: egen domän bär språket själv (carashell.com), annars
 * ligger språket i en mapp på butikens domän (carashell.se/nb, /fi).
 * ⚠️ Regeln bor HÄR och inte i factory/opsmarknader.mjs: den tabellen är
 * ANNONSmarknaderna (vilket konto en kampanj hamnar i) och känner bara SE, NO
 * och US. Butikens marknader står i butiksfilen — Finland finns där sedan
 * 2026-09-18 utan att vara en annonsmarknad, och en listicle ska kunna
 * byggas för varje marknad butiken faktiskt säljer i.
 */
const marknadsBas = (marknad) => (marknad.egen ? `https://${marknad.doman}` : `https://${marknad.doman}/${marknad.locale}`);

/** Marknadens produktlänk för knapparna. `?country=` är aldrig valfritt — utan den får kunden språket men fel valuta. */
export function marknadsProduktLank(marknad, handle) {
  const h = String(handle ?? '').trim();
  if (!h) throw new Error('marknadsProduktLank: handle saknas.');
  return `${marknadsBas(marknad)}/products/${h}?country=${marknad.land}`;
}

/** Marknadens sidlänk (samma regel som produktlänken). */
export function marknadsSidlank(marknad, handle) {
  const h = String(handle ?? '').trim();
  if (!h) throw new Error('marknadsSidlank: handle saknas.');
  return `${marknadsBas(marknad)}/pages/${h}?country=${marknad.land}`;
}

// ------------------------------------------------------------ klienten

/** Mintar token och ger en graphql-funktion bunden till butiken. */
export async function skapaKlient(butik, { fetchFn = fetch } = {}) {
  const m = await mintaToken({ shop: butik.shop, clientId: butik.clientId, clientSecret: butik.clientSecret, butikId: butik.id }, { fetchFn });
  const token = m.token;
  const graphql = async (query, variables = {}) => {
    const svar = await fetchFn(`https://${butik.shop}/admin/api/${API_VERSION}/graphql.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
      body: JSON.stringify({ query, variables }),
    });
    if (!svar.ok) throw new Error(`Shopify (${butik.shop}) svarade ${svar.status}: ${(await svar.text()).slice(0, 400)}`);
    const j = await svar.json();
    if (j.errors) throw new Error(`GraphQL-fel (${butik.shop}): ${JSON.stringify(j.errors).slice(0, 600)}`);
    for (const [op, payload] of Object.entries(j.data ?? {})) {
      const fel = payload?.userErrors;
      if (Array.isArray(fel) && fel.length) throw new Error(`Shopify avvisade ${op}: ${fel.map((f) => `${f.field ?? f.filename ?? ''} ${f.message}`.trim()).join('; ')}`);
    }
    return j.data;
  };
  const info = await graphql('{ shop { name myshopifyDomain primaryDomain { url } } currentAppInstallation { app { title } accessScopes { handle } } }');
  const scopes = (info.currentAppInstallation?.accessScopes ?? []).map((s) => s.handle);
  const saknas = ['write_themes', 'write_content'].filter((s) => !scopes.includes(s));
  if (saknas.length) throw new Error(`Appen "${info.currentAppInstallation?.app?.title ?? '?'}" i ${butik.shop} saknar ${saknas.join(' + ')} — lägg till dem i appens Access scopes och installera om appen.`);
  return {
    graphql, butik, token, scopes,
    namn: info.shop.name, shop: info.shop.myshopifyDomain, bas: String(info.shop.primaryDomain?.url ?? `https://${info.shop.myshopifyDomain}`).replace(/\/+$/, ''),
  };
}

// ------------------------------------------------------------ temafilerna

/** De tre temafilerna. CSS:en är html.mjs CSS + body-nollställning (layouten laddar inte temats CSS). */
export function temafiler({ css = CSS } = {}) {
  return {
    'layout/listicle.liquid': readFileSync(join(HAR, 'tema', 'layout.liquid'), 'utf8'),
    'templates/page.listicle.liquid': readFileSync(join(HAR, 'tema', 'page.liquid'), 'utf8'),
    'assets/listicle.css': `/* listicle.css — skrivs av listicle/butik.mjs (repot yognftnfgn), ändra inte här. */\nbody.listicle-sida{margin:0;background:#fff}\n${css}\n`,
  };
}

export async function hamtaLiveTema(klient) {
  const d = await klient.graphql('{ themes(first: 5, roles: [MAIN]) { nodes { id name role } } }');
  const tema = (d.themes?.nodes ?? []).find((t) => t.role === 'MAIN');
  if (!tema) throw new Error(`${klient.shop}: hittar inget publicerat tema (role MAIN).`);
  return tema;
}

async function lasTemafiler(klient, temaId, namn) {
  const d = await klient.graphql(
    `query lpTemafiler($id: ID!, $namn: [String!]) { theme(id: $id) { files(filenames: $namn, first: 10) { nodes { filename body { ... on OnlineStoreThemeFileBodyText { content } } } } } }`,
    { id: temaId, namn }
  );
  const ut = {};
  for (const f of d.theme?.files?.nodes ?? []) ut[f.filename] = f.body?.content ?? null;
  return ut;
}

/** Skriver de temafiler som saknas eller ändrats på live-temat. Läser tillbaka och jämför. */
export async function installeraTema(klient, { torr = false, logg = () => {} } = {}) {
  const tema = await hamtaLiveTema(klient);
  const filer = temafiler();
  const namn = Object.keys(filer);
  const befintliga = await lasTemafiler(klient, tema.id, namn);
  const attSkriva = namn.filter((n) => (befintliga[n] ?? null) !== filer[n]);
  const oforandrade = namn.filter((n) => !attSkriva.includes(n));
  logg(`Tema: "${tema.name}" (publicerat) · ${oforandrade.length} filer redan rätt, ${attSkriva.length} att skriva${attSkriva.length ? `: ${attSkriva.join(', ')}` : ''}`);
  if (torr || attSkriva.length === 0) return { tema, skrivna: [], oforandrade, attSkriva, torr };
  await klient.graphql(
    `mutation lpTemafilerUpp($themeId: ID!, $files: [OnlineStoreThemeFilesUpsertFileInput!]!) {
      themeFilesUpsert(themeId: $themeId, files: $files) { upsertedThemeFiles { filename } userErrors { filename message } }
    }`,
    { themeId: tema.id, files: attSkriva.map((filename) => ({ filename, body: { type: 'TEXT', value: filer[filename] } })) }
  );
  // Tillbakaläsning: exakt innehåll, annars stopp (en CSS-escape blev en gång dubblerad på vägen).
  const efter = await lasTemafiler(klient, tema.id, attSkriva);
  const fel = attSkriva.filter((n) => efter[n] !== filer[n]);
  if (fel.length) throw new Error(`Temafilerna lästes inte tillbaka lika: ${fel.join(', ')}.`);
  logg(`   ✓ ${attSkriva.length} temafil(er) skrivna och lästa tillbaka`);
  return { tema, skrivna: attSkriva, oforandrade, attSkriva, torr };
}

// ------------------------------------------------------------ sidan

export async function hittaSida(klient, handle) {
  const d = await klient.graphql(`query lpSida($q: String!) { pages(first: 10, query: $q) { nodes { id handle title templateSuffix isPublished } } }`, { q: `handle:${handle}` });
  return (d.pages?.nodes ?? []).find((s) => s.handle === handle) ?? null;
}

/** Skapar eller uppdaterar sidan med mallen "listicle". → { id, handle, url, skapad } */
export async function publiceraSida(klient, { handle, titel, body, publicerad = true, torr = false, logg = () => {} }) {
  if (!handle || !titel || !body) throw new Error('publiceraSida: handle, titel och body krävs.');
  const befintlig = await hittaSida(klient, handle);
  const url = `${klient.bas}/pages/${handle}`;
  if (torr) {
    logg(`Sida: ${befintlig ? `finns (${befintlig.title}) — skulle uppdateras` : 'finns inte — skulle skapas'} · ${url}`);
    return { id: befintlig?.id ?? null, handle, url, skapad: !befintlig, torr: true };
  }
  const page = { title: titel, body, isPublished: publicerad, templateSuffix: MALLSUFFIX };
  let sida;
  if (befintlig) {
    const d = await klient.graphql(
      `mutation lpSidaUpp($id: ID!, $page: PageUpdateInput!) { pageUpdate(id: $id, page: $page) { page { id handle templateSuffix isPublished } userErrors { field message } } }`,
      { id: befintlig.id, page }
    );
    sida = d.pageUpdate.page;
  } else {
    const d = await klient.graphql(
      `mutation lpSidaNy($page: PageCreateInput!) { pageCreate(page: $page) { page { id handle templateSuffix isPublished } userErrors { field message } } }`,
      { page: { ...page, handle } }
    );
    sida = d.pageCreate.page;
  }
  if (sida.handle !== handle) throw new Error(`Shopify gav sidan handlen "${sida.handle}" i stället för "${handle}" — adressen är upptagen av något annat.`);
  if (sida.templateSuffix !== MALLSUFFIX) throw new Error(`Sidan fick mallen "${sida.templateSuffix}", inte "${MALLSUFFIX}".`);
  logg(`   ✓ sidan ${befintlig ? 'uppdaterad' : 'skapad'}: ${url} (mall page.${MALLSUFFIX}, ${publicerad ? 'publicerad' : 'OPUBLICERAD'})`);
  return { id: sida.id, handle, url: `${klient.bas}/pages/${handle}`, skapad: !befintlig, torr: false };
}

// ------------------------------------------------------------ översättningen

/** Sidans översättbara fält (title, body_html …) med digest — det translationsRegister kräver. */
export async function hamtaOversattbart(klient, resourceId) {
  const d = await klient.graphql(
    `query lpOversattbar($id: ID!) { translatableResource(resourceId: $id) { resourceId translatableContent { key value digest locale } } }`,
    { id: resourceId }
  );
  return d.translatableResource?.translatableContent ?? [];
}

/** Översättningarna som redan ligger på resursen för ett språk. → Map key → { key, value, outdated } */
export async function hamtaOversattningar(klient, resourceId, locale) {
  const d = await klient.graphql(
    `query lpOversattningar($id: ID!, $locale: String!) { translatableResource(resourceId: $id) { translations(locale: $locale) { key value outdated } } }`,
    { id: resourceId, locale }
  );
  return new Map((d.translatableResource?.translations ?? []).map((t) => [t.key, t]));
}

/**
 * Registrerar titeln och kroppen på ett språk på en BEFINTLIG sida och läser
 * dem tillbaka. Kräver write_translations på appen (fabrikens app har det —
 * `oversatt`-steget använder samma scope).
 *   → { registrerade: ['title', 'body_html'], torr }
 */
export async function oversattSida(klient, { sidaId, locale, titel, body, torr = false, logg = () => {} }) {
  if (!sidaId || !locale || !titel || !body) throw new Error('oversattSida: sidaId, locale, titel och body krävs.');
  if (Array.isArray(klient.scopes) && !klient.scopes.includes('write_translations')) {
    throw new Error(`Appen i ${klient.shop} saknar write_translations — lägg till det i appens Access scopes och installera om appen.`);
  }
  const falt = await hamtaOversattbart(klient, sidaId);
  const per = new Map(falt.map((f) => [f.key, f]));
  const onskade = [['title', titel], ['body_html', body]];
  const saknas = onskade.filter(([k]) => !per.has(k)).map(([k]) => k);
  if (saknas.length) throw new Error(`Sidan ${sidaId} går inte att översätta: fälten ${saknas.join(', ')} finns inte bland de översättbara (${[...per.keys()].join(', ') || 'inga'}).`);
  if (torr) {
    logg(`Översättning (${locale}): skulle registrera title + body_html (${body.length} tecken) på sidan — torr`);
    return { registrerade: [], torr: true };
  }
  const translations = onskade.map(([key, value]) => ({ key, value, locale, translatableContentDigest: per.get(key).digest }));
  const d = await klient.graphql(
    `mutation lpOversatt($id: ID!, $translations: [TranslationInput!]!) {
      translationsRegister(resourceId: $id, translations: $translations) { translations { key locale } userErrors { field message } }
    }`,
    { id: sidaId, translations }
  );
  const registrerade = (d.translationsRegister?.translations ?? []).map((t) => t.key);
  // Tillbakaläsning: exakt det vi skrev, annars stopp.
  const efter = await hamtaOversattningar(klient, sidaId, locale);
  const fel = onskade.filter(([k, v]) => efter.get(k)?.value !== v).map(([k]) => k);
  if (fel.length) throw new Error(`Översättningen (${locale}) lästes inte tillbaka lika: ${fel.join(', ')}.`);
  logg(`   ✓ översättning ${locale} registrerad på sidan: ${registrerade.join(' + ')} (läst tillbaka lika)`);
  return { registrerade, torr: false };
}

// ------------------------------------------------------------ trippelkollen

/**
 * Ren granskning av den publika HTML:en. → { ok, fel: [] }
 * `maste` = strängar som MÅSTE finnas (marknadsversionen: den engelska hero-
 * rubriken, så vi vet att översättningen visas och inte den svenska
 * reservtexten); `farInte` = strängar som inte får finnas (den svenska rubriken).
 */
export function granskaPublikSida(html, { markor = 'class="lr"', maste = [], farInte = [] } = {}) {
  const fel = [];
  const h = String(html ?? '');
  if (!h.includes(markor)) fel.push('listiclen saknas i HTML:en (ingen class="lr")');
  if (/id="shopify-section-/.test(h)) fel.push('temasektioner renderas (id="shopify-section-…") — header/footer är kvar, mallen används inte');
  if (/<header[\s>]/i.test(h)) fel.push('en <header> finns på sidan');
  const footers = (h.match(/<footer[\s>]/gi) ?? []).length;
  const egna = (h.match(/<footer class="lr-sidfot"/g) ?? []).length;
  if (footers > egna) fel.push(`${footers - egna} främmande <footer> på sidan`);
  if (!/listicle\.css/.test(h)) fel.push('assets/listicle.css laddas inte (layouten används inte)');
  if (/<nav[\s>]/i.test(h)) fel.push('en <nav> (meny) finns på sidan');
  for (const m of maste) if (m && !h.includes(m)) fel.push(`texten "${String(m).slice(0, 60)}" saknas — sidan visar inte den versionen (översättningen är inte den som renderas)`);
  for (const m of farInte) if (m && h.includes(m)) fel.push(`texten "${String(m).slice(0, 60)}" finns på sidan — fel språk renderas`);
  return { ok: fel.length === 0, fel };
}

/**
 * Läser sidan som kund och granskar den. Lösenordsskyddad butik: storefront-
 * lösenordet ur miljön. `bas` + `sokvag` läser en annan adress än butikens egen
 * (marknadens domän, t.ex. https://carashell.com + /pages/x?country=US).
 */
export async function kontrolleraSida(klient, handle, { logg = () => {}, bas = null, sokvag = null, maste = [], farInte = [] } = {}) {
  const { hamtaSida } = await import('../factory/kundvy-kor.mjs');
  const ctx = { shop: { primaryDomain: { url: bas ?? klient.bas }, myshopifyDomain: klient.shop }, bas: bas ?? null };
  const vag = sokvag ?? `/pages/${handle}`;
  const html = await hamtaSida(ctx, vag, { losenord: klient.butik.losenord || null });
  const g = granskaPublikSida(html, { maste, farInte });
  const url = `${(bas ?? klient.bas).replace(/\/+$/, '')}${vag}`;
  if (g.ok) logg(`   ✓ ${url} svarar som kund: listiclen finns, ingen header, ingen footer, ingen meny${maste.length ? ', rätt språk' : ''}`);
  else for (const f of g.fel) logg(`   ❌ ${url}: ${f}`);
  return { ...g, url, tecken: html.length };
}

// ------------------------------------------------------------ hela vägen

// Butikernas huvudmarknad. Tillbakaläsningen av den svenska sidan sker med
// `?country=SE`: claude.ai-containern går ut på nätet från USA (mätt
// 2026-09-16, api.country.is → US), och Shopify skickar då amerikanska
// besökare på carashell.se vidare (302) till carashell.com — som efter
// marknadsversionen visar den ENGELSKA översättningen av samma handle. Utan
// parametern hade den svenska kontrollen läst den engelska sidan och ändå
// sagt ✓. `?country=SE` svarar 200 på svenska med lang="sv".
export const HUVUDLAND = 'SE';

/**
 * publicera({ butik: 'baverbutiken', handle, titel, body, maste: [svensk hero-rubrik i HTML], torr, logg })
 *   → { butik, tema, sida, kontroll }
 * `lasBas` + `lasSokvag` läser sidan tillbaka på en annan adress än butikens
 * egen (ett lands sida: https://carashell.com + /pages/x-gb?country=GB).
 */
export async function publicera({ butik: butikId, handle, titel, body, maste = [], farInte = [], publicerad = true, torr = false, lasBas = null, lasSokvag = null, logg = console.log, env = process.env, fetchFn = fetch }) {
  const butik = losButik(butikId, env);
  logg(`Butik: ${butik.id} (${butik.shop}, nycklar ${butik.kalla})`);
  const klient = await skapaKlient(butik, { fetchFn });
  logg(`   ansluten: ${klient.namn} · ${klient.bas} · scopes ok`);
  const tema = await installeraTema(klient, { torr, logg });
  const sida = await publiceraSida(klient, { handle, titel, body, publicerad, torr, logg });
  const kontroll = torr ? null : await kontrolleraSida(klient, handle, { logg, bas: lasBas, sokvag: lasSokvag ?? `/pages/${handle}?country=${HUVUDLAND}`, maste, farInte });
  if (kontroll && !kontroll.ok) throw new Error(`Sidan ligger uppe men ser inte rätt ut: ${kontroll.fel.join('; ')}`);
  return { butik: { id: butik.id, shop: klient.shop, namn: klient.namn, bas: klient.bas }, tema: { id: tema.tema.id, namn: tema.tema.name, skrivna: tema.skrivna }, sida, kontroll };
}

/**
 * Marknadsversionen: översätter den BEFINTLIGA sidan (samma handle) till
 * marknadens språk och läser den tillbaka på marknadens domän.
 *   publiceraMarknad({ butik: 'carashell', marknad: marknadForButik(…), handle, titel, body,
 *                      maste: [engelsk hero-rubrik i HTML], farInte: [svensk hero-rubrik], torr, logg })
 *   → { butik, marknad, sida, oversattning, kontroll }
 * Finns inte den svenska sidan stoppar det — den byggs först, utan --marknad.
 * Temafilerna rörs inte (de är språkneutrala) och sidans status ändras inte.
 */
export async function publiceraMarknad({ butik: butikId, marknad, handle, titel, body, maste = [], farInte = [], torr = false, logg = console.log, env = process.env, fetchFn = fetch }) {
  if (!marknad?.kod || !marknad?.locale || !marknad?.doman) throw new Error('publiceraMarknad: marknaden behöver kod, locale och doman (marknadForButik).');
  const butik = losButik(butikId, env);
  logg(`Butik: ${butik.id} (${butik.shop}, nycklar ${butik.kalla}) · marknad ${marknad.kod} (${marknad.doman}, ${marknad.locale}, ${marknad.valuta})`);
  const klient = await skapaKlient(butik, { fetchFn });
  logg(`   ansluten: ${klient.namn} · ${klient.bas} · scopes ok${klient.scopes.includes('write_translations') ? ' (write_translations finns)' : ''}`);
  const befintlig = await hittaSida(klient, handle);
  if (!befintlig) throw new Error(`Sidan /pages/${handle} finns inte i ${klient.namn} — bygg den svenska sidan först (samma kommando utan --marknad), sedan marknadsversionen.`);
  if (befintlig.templateSuffix !== MALLSUFFIX) throw new Error(`Sidan /pages/${handle} har mallen "${befintlig.templateSuffix}", inte "${MALLSUFFIX}" — det är inte listiclens sida.`);
  const url = marknadsSidlank(marknad, handle);
  const oversattning = await oversattSida(klient, { sidaId: befintlig.id, locale: marknad.locale, titel, body, torr, logg });
  if (torr) {
    logg(`Sida: finns (${befintlig.title}) — översättningen skulle läggas på den · ${url}`);
    return { butik: { id: butik.id, shop: klient.shop, namn: klient.namn, bas: klient.bas }, marknad, sida: { id: befintlig.id, handle, url, torr: true }, oversattning, kontroll: null };
  }
  const sokvag = url.replace(/^https?:\/\/[^/]+/, '');
  const bas = url.replace(/^(https?:\/\/[^/]+).*$/, '$1');
  const kontroll = await kontrolleraSida(klient, handle, { logg, bas, sokvag, maste, farInte });
  if (!kontroll.ok) throw new Error(`Översättningen ligger på sidan men marknadens adress ser inte rätt ut: ${kontroll.fel.join('; ')}`);
  return { butik: { id: butik.id, shop: klient.shop, namn: klient.namn, bas: klient.bas }, marknad, sida: { id: befintlig.id, handle, url, torr: false }, oversattning, kontroll };
}
