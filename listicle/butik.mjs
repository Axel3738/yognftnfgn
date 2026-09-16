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

// ------------------------------------------------------------ trippelkollen

/** Ren granskning av den publika HTML:en. → { ok, fel: [] } */
export function granskaPublikSida(html, { markor = 'class="lr"' } = {}) {
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
  return { ok: fel.length === 0, fel };
}

/** Läser sidan som kund och granskar den. Lösenordsskyddad butik: storefront-lösenordet ur miljön. */
export async function kontrolleraSida(klient, handle, { logg = () => {} } = {}) {
  const { hamtaSida } = await import('../factory/kundvy-kor.mjs');
  const ctx = { shop: { primaryDomain: { url: klient.bas }, myshopifyDomain: klient.shop } };
  const html = await hamtaSida(ctx, `/pages/${handle}`, { losenord: klient.butik.losenord || null });
  const g = granskaPublikSida(html);
  const url = `${klient.bas}/pages/${handle}`;
  if (g.ok) logg(`   ✓ ${url} svarar som kund: listiclen finns, ingen header, ingen footer, ingen meny`);
  else for (const f of g.fel) logg(`   ❌ ${url}: ${f}`);
  return { ...g, url, tecken: html.length };
}

// ------------------------------------------------------------ hela vägen

/**
 * publicera({ butik: 'baverbutiken', handle, titel, body, torr, logg })
 *   → { butik, tema, sida, kontroll }
 */
export async function publicera({ butik: butikId, handle, titel, body, publicerad = true, torr = false, logg = console.log, env = process.env, fetchFn = fetch }) {
  const butik = losButik(butikId, env);
  logg(`Butik: ${butik.id} (${butik.shop}, nycklar ${butik.kalla})`);
  const klient = await skapaKlient(butik, { fetchFn });
  logg(`   ansluten: ${klient.namn} · ${klient.bas} · scopes ok`);
  const tema = await installeraTema(klient, { torr, logg });
  const sida = await publiceraSida(klient, { handle, titel, body, publicerad, torr, logg });
  const kontroll = torr ? null : await kontrolleraSida(klient, handle, { logg });
  if (kontroll && !kontroll.ok) throw new Error(`Sidan ligger uppe men ser inte rätt ut: ${kontroll.fel.join('; ')}`);
  return { butik: { id: butik.id, shop: klient.shop, namn: klient.namn, bas: klient.bas }, tema: { id: tema.tema.id, namn: tema.tema.name, skrivna: tema.skrivna }, sida, kontroll };
}
