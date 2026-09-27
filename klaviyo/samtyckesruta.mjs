// Kassans ruta för e-postmarknadsföring: texten vid kryssrutan, per språk.
//
// Axels beslut A 2026-09-27. Bakgrund, mätt i CaraShells Shopify samma dag:
// rutan finns i alla marknader men är förikryssad bara i USA (59 av 77 sa ja),
// i Sverige kryssade 12 av 198, Norge 4 av 99, Danmark 3 av 28, Australien
// 2 av 32. Ingen popup (Axels regel), så den enda lagliga spaken är texten vid
// rutan: Shopifys "Skicka mig nyheter och erbjudanden via e-post" byts mot
// brandfilens `samtycke_kassan.<språk>` — konkret, sant mot det som skickas,
// och med orden mejl + erbjudanden kvar så att ingen kan säga att reklamen
// var dold (MFL 19 §, samma krav i NO/DK/UK/AU).
//
// Var texten ligger (mätt 2026-09-27): nyckeln
// shopify.checkout.marketing.accept_marketing_checkbox_label i det publicerade
// temats locale-innehåll (translatableResources, ONLINE_STORE_THEME_LOCALE_CONTENT
// på temats id). Andra språk än butikens huvudspråk skrivs med
// translationsRegister (kräver write_translations); huvudspråket ligger i temats
// locales/<språk>.json under "shopify" → "checkout" → "marketing" — samma fil
// som admin-editorn (Inställningar → Kassa → Kassaspråk → Redigera kassainnehåll)
// skriver. Allt läses tillbaka innan något rapporteras som klart.
//
//   node klaviyo/samtyckesruta.mjs --brand carashell            # torrt: nu → ny, per språk
//   node klaviyo/samtyckesruta.mjs --brand carashell --skarpt   # skriver + läser tillbaka
//   node klaviyo/samtyckesruta.mjs --brand carashell --kundvy   # kassan i Chromium per språk, skärmdumpar
//
// --kundvy går att köra före och efter: den lägger butikens första aktiva
// produkt i en varukorg, öppnar kassan på varje språk och läser texten vid
// rutan som kunden ser den (trippelkollen). Ingen order läggs.
// Loggen: klaviyo/konto/<brand>/samtyckesruta.jsonl (före/efter, committas).

import { appendFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROT } from './mallar.mjs';
import { lasBrand } from './ladda-upp.mjs';

export const NYCKEL = 'shopify.checkout.marketing.accept_marketing_checkbox_label';
export const MAX_TECKEN = 100;
const MEJLORD = /mejl|e-post|epost|e-mail|email|\bmail/i;
const ERBJUDANDEORD = /erbjudand|tilbud|offer/i;
const SPRAKTAGG = { sv: 'sv-SE', nb: 'nb-NO', da: 'da-DK', en: 'en-US', fi: 'fi-FI' };
const SPRAK_LAND = { sv: 'SE', nb: 'NO', da: 'DK', en: 'US', fi: 'FI' };
const PLAYWRIGHT = process.env.LR_PLAYWRIGHT || '/opt/node22/lib/node_modules/playwright/index.mjs';
const CHROME_KANDIDATER = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome', '/opt/pw-browsers/chromium'];

/** En rad granskas: tom, för lång, tankstreck, siffror, saknat mejl-/erbjudandeord. → lista med fel */
export function kontrolleraRad(sprak, text) {
  const t = String(text ?? '').trim();
  if (!t) return [`${sprak}: tom`];
  const fel = [];
  if (t.length > MAX_TECKEN) fel.push(`${sprak}: ${t.length} tecken (max ${MAX_TECKEN}, en rad på en telefon)`);
  if (/[—–]/.test(t)) fel.push(`${sprak}: tankstreck`);
  if (/\d/.test(t)) fel.push(`${sprak}: siffror (belopp, procent och antal hör inte hemma vid rutan)`);
  if (!MEJLORD.test(t)) fel.push(`${sprak}: ordet mejl/e-post/email saknas (kunden måste se att det är e-post)`);
  if (!ERBJUDANDEORD.test(t)) fel.push(`${sprak}: ordet erbjudanden/tilbud/offers saknas (kunden måste se att det är reklam)`);
  return fel;
}

/** Brandfilens samtycke_kassan → { sv: "…", nb: "…", … }, kontrollerad. */
export function samtyckeVarden(brand) {
  const s = brand.samtycke_kassan;
  const sprak = s && typeof s === 'object' ? Object.keys(s).filter((k) => k !== 'comment' && !k.endsWith('_comment')) : [];
  if (!sprak.length) throw new Error('brandfilen saknar samtycke_kassan — inget att skriva.');
  const ut = {};
  const fel = [];
  for (const k of sprak) {
    fel.push(...kontrolleraRad(k, s[k]));
    ut[k] = String(s[k] ?? '').trim();
  }
  if (fel.length) throw new Error(`samtycke_kassan: ${fel.join('; ')}`);
  return ut;
}

/**
 * Temats locale-fil (JSON, ev. med Shopifys kommentar överst) med nyckeln satt.
 * Kommentaren släpps — Shopify skriver den igen själv. → { text, gammal }
 */
export function nyLocaleFil(text, nyckel, varde) {
  const utanKommentar = String(text).replace(/^\s*\/\*[\s\S]*?\*\/\s*/, '');
  let obj;
  try { obj = JSON.parse(utanKommentar); } catch (e) { throw new Error(`locale-filen är inte JSON (${e.message.split('\n')[0]}) — inget skrivs.`); }
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) throw new Error('locale-filen är inte ett JSON-objekt — inget skrivs.');
  const delar = nyckel.split('.');
  let p = obj;
  for (const d of delar.slice(0, -1)) {
    if (p[d] == null) p[d] = {};
    else if (typeof p[d] !== 'object' || Array.isArray(p[d])) throw new Error(`"${d}" i locale-filen är inte ett objekt — inget skrivs.`);
    p = p[d];
  }
  const sista = delar.at(-1);
  const gammal = typeof p[sista] === 'string' ? p[sista] : null;
  p[sista] = varde;
  return { text: JSON.stringify(obj, null, 2) + '\n', gammal };
}

/**
 * Vad som ska göras per språk. Ren funktion.
 * lokaler = shopLocales, huvudsprakVarde = nyckelns värde på huvudspråket,
 * oversattningar = { nb: "…", … } som står i butiken nu.
 */
export function planeraByten({ varden, lokaler, huvudsprakVarde = null, oversattningar = {} }) {
  const primar = lokaler.find((l) => l.primary)?.locale ?? null;
  const rader = [];
  for (const [sprak, text] of Object.entries(varden)) {
    const lok = lokaler.find((l) => l.locale === sprak);
    if (!lok || !lok.published) { rader.push({ sprak, typ: 'ej_publicerad', fore: null, efter: text, andras: false }); continue; }
    if (sprak === primar) { rader.push({ sprak, typ: 'huvudsprak', fore: huvudsprakVarde, efter: text, andras: huvudsprakVarde !== text }); continue; }
    const fore = oversattningar[sprak] ?? null;
    rader.push({ sprak, typ: 'oversattning', fore, efter: text, andras: fore !== text });
  }
  for (const l of lokaler) {
    if (l.published && !(l.locale in varden)) rader.push({ sprak: l.locale, typ: 'utan_text', fore: l.locale === primar ? huvudsprakVarde : oversattningar[l.locale] ?? null, efter: null, andras: false });
  }
  return { primar, rader };
}

const typText = { huvudsprak: 'huvudspråk (temats locale-fil)', oversattning: 'översättning', ej_publicerad: 'SPRÅKET ÄR INTE PUBLICERAT i butiken — hoppas', utan_text: 'ingen text i brandfilen — Shopifys standard står kvar' };

async function lasNyckel(klient, rid) {
  const d = await klient.graphql(
    `query samtyckeNyckel($id: ID!) { translatableResource(resourceId: $id) { translatableContent { key value digest locale } } }`,
    { id: rid }
  );
  const c = (d.translatableResource?.translatableContent ?? []).find((x) => x.key === NYCKEL);
  if (!c) throw new Error(`${NYCKEL} finns inte i temats locale-innehåll — kassan ser inte ut som väntat, inget skrivs.`);
  return c;
}

async function lasOversattning(klient, rid, locale) {
  const d = await klient.graphql(
    `query samtyckeOversattning($id: ID!, $locale: String!) { translatableResource(resourceId: $id) { translations(locale: $locale) { key value outdated } } }`,
    { id: rid, locale }
  );
  return (d.translatableResource?.translations ?? []).find((x) => x.key === NYCKEL) ?? null;
}

async function lasTemafil(klient, temaId, filnamn) {
  const d = await klient.graphql(
    `query samtyckeTemafil($id: ID!, $namn: [String!]) { theme(id: $id) { files(filenames: $namn, first: 5) { nodes { filename body { ... on OnlineStoreThemeFileBodyText { content } } } } } }`,
    { id: temaId, namn: [filnamn] }
  );
  return d.theme?.files?.nodes?.find((f) => f.filename === filnamn)?.body?.content ?? null;
}

const sov = (ms) => new Promise((ok) => setTimeout(ok, ms));

/** Kassan som kunden ser den, per språk, i Chromium. → [{ sprak, url, lang, text, ratt, skarmdump, fel }] */
export async function kundvy({ brand, varden, klient, utMapp, logg = console.log }) {
  let pw;
  try { pw = await import(PLAYWRIGHT); } catch (e) { throw new Error(`Playwright saknas (${e.message.split('\n')[0]}) — kundvyn kan inte mätas här.`); }
  const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined;
  // --ignore-certificate-errors: claude.ai-containerns Chromium hänger på proxyns
  // omskrivna certifikat (mätt 2026-09-27: 40 s timeout utan flaggan, 2 s med).
  // Trafiken går ändå genom samma proxy; det här är en läs-bara skärmdumpsrunda.
  const args = ['--no-sandbox', '--ignore-certificate-errors'];
  const start = async () => {
    const fel = [];
    for (const exe of [null, ...CHROME_KANDIDATER]) {
      if (exe && !existsSync(exe)) continue;
      try { return await pw.chromium.launch({ headless: true, args, proxy, ...(exe ? { executablePath: exe } : {}) }); }
      catch (e) { fel.push(e.message.split('\n')[0]); }
    }
    throw new Error(`Chromium startade inte: ${fel.join(' | ')}`);
  };
  const p = await klient.graphql('{ products(first: 1, query: "status:active") { nodes { handle variants(first: 1) { nodes { id } } } } }');
  const produkt = p.products?.nodes?.[0];
  const variantId = produkt?.variants?.nodes?.[0]?.id?.split('/').pop();
  if (!produkt || !variantId) throw new Error('hittar ingen aktiv produkt att lägga i varukorgen.');
  mkdirSync(utMapp, { recursive: true });
  const browser = await start();
  const ut = [];
  try {
    for (const sprak of Object.keys(varden)) {
      const ps = brand.per_sprak?.[sprak] ?? {};
      const bas = (ps.butik_url ?? brand.butik_url).replace(/\/$/, '');
      // Landet måste med: containern går ut på nätet från USA och carashell.se
      // skickar annars vidare till .com (mätt 2026-09-27: svenska kassan blev engelsk).
      const suffix = ps.lank_suffix || (SPRAK_LAND[sprak] ? `?country=${SPRAK_LAND[sprak]}` : '');
      // Språkprefixet (/nb, /da) ska ligga kvar på varukorgen och kassan — det är
      // vägen kunden går (kassaknappen på /nb-sidan → /nb/checkout). Utan det
      // öppnas kassan på butikens huvudspråk (mätt: lang=sv-NO).
      const prefix = new URL(bas).pathname.replace(/\/$/, '');
      const rad = { sprak, url: null, lang: null, text: null, ratt: false, skarmdump: null, fel: null };
      const ctx = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 390, height: 844 }, locale: SPRAKTAGG[sprak] ?? sprak });
      const page = await ctx.newPage();
      try {
        await page.goto(`${bas}/products/${produkt.handle}${suffix}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
        const origin = new URL(page.url()).origin;
        const korg = await page.evaluate(async ({ url, id }) => {
          const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ items: [{ id: Number(id), quantity: 1 }] }) });
          return { status: r.status, text: (await r.text()).slice(0, 200) };
        }, { url: `${origin}${prefix}/cart/add.js`, id: variantId });
        if (korg.status !== 200) throw new Error(`varukorgen svarade ${korg.status}: ${korg.text}`);
        await page.goto(`${origin}${prefix}/checkout`, { waitUntil: 'load', timeout: 60000 });
        rad.url = page.url();
        try { await page.waitForSelector('input[name="marketing_opt_in"], #marketing_opt_in, input[type="checkbox"]', { timeout: 30000 }); } catch { /* läses ändå nedan */ }
        rad.lang = await page.evaluate(() => document.documentElement.lang || null);
        rad.text = await page.evaluate(() => {
          const norm = (s) => (s ?? '').replace(/\s+/g, ' ').trim();
          const inp = document.querySelector('input[name="marketing_opt_in"], #marketing_opt_in');
          if (inp) {
            const lbl = (inp.id && document.querySelector(`label[for="${CSS.escape(inp.id)}"]`)) || inp.closest('label');
            if (lbl && norm(lbl.textContent)) return norm(lbl.textContent);
            const aria = inp.getAttribute('aria-labelledby');
            if (aria) return norm(document.getElementById(aria)?.textContent);
          }
          const kandidater = [...document.querySelectorAll('label')].map((l) => norm(l.textContent)).filter((t) => /mejl|e-post|epost|e-mail|email|mail|nyheter|nyheder|news|tilbud|erbjudand|offer/i.test(t));
          return kandidater[0] ?? null;
        });
        rad.ratt = rad.text === varden[sprak];
        rad.skarmdump = join(utMapp, `${sprak}.png`);
        await page.screenshot({ path: rad.skarmdump, fullPage: true });
      } catch (e) {
        rad.fel = e.message.split('\n')[0];
        try { rad.skarmdump = join(utMapp, `${sprak}-fel.png`); await page.screenshot({ path: rad.skarmdump, fullPage: true }); } catch { rad.skarmdump = null; }
      } finally {
        await ctx.close();
      }
      logg(`  ${rad.ratt ? '✓' : '✗'} ${sprak}: ${rad.fel ? `kassan gick inte att läsa (${rad.fel})` : `texten vid rutan: "${rad.text}"${rad.lang ? ` (lang=${rad.lang})` : ''}`}${rad.skarmdump ? ` · ${rad.skarmdump}` : ''}`);
      ut.push(rad);
    }
  } finally {
    await browser.close();
  }
  return ut;
}

async function main() {
  const argv = process.argv.slice(2);
  const arg = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : null; };
  const brandId = arg('--brand');
  if (!brandId) throw new Error('Användning: node klaviyo/samtyckesruta.mjs --brand <id> [--skarpt] [--kundvy]');
  const brand = lasBrand(brandId);
  const skarpt = argv.includes('--skarpt');
  const visaKundvy = argv.includes('--kundvy');
  const varden = samtyckeVarden(brand);
  const butikId = brand.shopify?.butik;
  if (!butikId) throw new Error('brandfilen saknar shopify.butik (butikens id i sparning/butiker.json).');
  const { lasButik, skapaKlient } = await import('../sparning/butik.mjs');
  const klient = await skapaKlient(lasButik(butikId));

  const d = await klient.graphql('{ themes(first: 5, roles: [MAIN]) { nodes { id name role } } shopLocales { locale name primary published } }');
  const tema = (d.themes?.nodes ?? []).find((t) => t.role === 'MAIN');
  if (!tema) throw new Error('hittar inget publicerat tema (role MAIN).');
  const lokaler = d.shopLocales ?? [];
  const rid = `gid://shopify/OnlineStoreThemeLocaleContent/${tema.id.split('/').pop()}`;
  const nyckel = await lasNyckel(klient, rid);
  const oversattningar = {};
  for (const l of lokaler) if (l.published && !l.primary) oversattningar[l.locale] = (await lasOversattning(klient, rid, l.locale))?.value ?? null;
  const plan = planeraByten({ varden, lokaler, huvudsprakVarde: nyckel.value, oversattningar });

  console.log(`Tema: "${tema.name}" (publicerat) · huvudspråk ${plan.primar} · nyckel ${NYCKEL}`);
  for (const r of plan.rader) {
    const pil = r.efter == null ? `"${r.fore ?? '(Shopifys standard)'}"` : `"${r.fore ?? '(inget)'}" → "${r.efter}"`;
    console.log(`  ${r.sprak.padEnd(3)} ${r.andras ? '•' : '='} ${pil}  [${typText[r.typ]}]`);
  }
  const attAndra = plan.rader.filter((r) => r.andras);
  if (!attAndra.length) console.log('Allt står redan rätt i butiken — inget att skriva.');
  const loggDir = join(ROT, 'klaviyo', 'konto', brand.id);
  mkdirSync(loggDir, { recursive: true });
  const post = { tid: new Date().toISOString(), tema: tema.name, skarpt, rader: plan.rader, efter: null, kundvy: null };

  if (skarpt && attAndra.length) {
    const oversatt = attAndra.filter((r) => r.typ === 'oversattning');
    if (oversatt.length) {
      await klient.graphql(
        `mutation samtyckeOversattningar($id: ID!, $tr: [TranslationInput!]!) {
          translationsRegister(resourceId: $id, translations: $tr) { translations { key locale value } userErrors { field message code } }
        }`,
        { id: rid, tr: oversatt.map((r) => ({ locale: r.sprak, key: NYCKEL, value: r.efter, translatableContentDigest: nyckel.digest })) }
      );
      console.log(`  ✓ ${oversatt.length} översättning(ar) registrerade (${oversatt.map((r) => r.sprak).join(', ')})`);
    }
    const huvud = attAndra.find((r) => r.typ === 'huvudsprak');
    if (huvud) {
      const filnamn = `locales/${plan.primar}.json`;
      const fore = await lasTemafil(klient, tema.id, filnamn);
      if (fore == null) throw new Error(`${filnamn} finns inte i temat — huvudspråkets text måste då bytas för hand: Inställningar → Kassa → Kassaspråk → Redigera kassainnehåll.`);
      const ny = nyLocaleFil(fore, NYCKEL, huvud.efter);
      await klient.graphql(
        `mutation samtyckeTemafil($themeId: ID!, $files: [OnlineStoreThemeFilesUpsertFileInput!]!) {
          themeFilesUpsert(themeId: $themeId, files: $files) { upsertedThemeFiles { filename } userErrors { filename message } }
        }`,
        { themeId: tema.id, files: [{ filename: filnamn, body: { type: 'TEXT', value: ny.text } }] }
      );
      console.log(`  ✓ ${filnamn} skriven (nyckeln låg ${ny.gammal == null ? 'inte i filen förut' : `som "${ny.gammal}"`})`);
    }
    // Tillbakaläsningen: huvudspråket ur locale-innehållet (kan dröja några sekunder), översättningarna per språk.
    const efter = {};
    let huvudVarde = null;
    for (let i = 0; i < 6; i++) {
      huvudVarde = (await lasNyckel(klient, rid)).value;
      if (!huvud || huvudVarde === huvud.efter) break;
      await sov(3000);
    }
    if (plan.primar) efter[plan.primar] = huvudVarde;
    for (const r of oversatt) efter[r.sprak] = (await lasOversattning(klient, rid, r.sprak))?.value ?? null;
    const fel = attAndra.filter((r) => efter[r.sprak] !== r.efter).map((r) => `${r.sprak} lästes tillbaka som "${efter[r.sprak]}"`);
    post.efter = efter;
    if (fel.length) {
      appendFileSync(join(loggDir, 'samtyckesruta.jsonl'), JSON.stringify({ ...post, fel }) + '\n');
      throw new Error(`Tillbakaläsningen stämmer inte: ${fel.join('; ')}${fel.some((f) => f.startsWith(plan.primar)) ? ` — huvudspråket byts då för hand: Inställningar → Kassa → Kassaspråk → Redigera kassainnehåll, sök "${huvud?.fore ?? ''}".` : ''}`);
    }
    console.log(`  ✓ tillbakaläst: ${Object.entries(efter).map(([k, v]) => `${k} "${v}"`).join(' · ')}`);
  } else if (!skarpt && attAndra.length) {
    console.log('Torrt: inget skrivet. Kör med --skarpt.');
  }

  if (visaKundvy) {
    console.log('Kundvyn (kassan i Chromium, en varukorg per språk, ingen order):');
    const utMapp = join(ROT, 'klaviyo', 'output', brand.id, 'samtycke-kassan');
    try { post.kundvy = await kundvy({ brand, varden, klient, utMapp }); }
    catch (e) { post.kundvy = { fel: e.message }; console.log(`  ✗ kundvyn gick inte att mäta: ${e.message}`); }
  }
  if (skarpt || visaKundvy) appendFileSync(join(loggDir, 'samtyckesruta.jsonl'), JSON.stringify(post) + '\n');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { spawnSync } = await import('node:child_process');
  if (process.env.HTTPS_PROXY && process.env.NODE_USE_ENV_PROXY !== '1') {
    const r = spawnSync(process.execPath, process.argv.slice(1), { stdio: 'inherit', env: { ...process.env, NODE_USE_ENV_PROXY: '1' } });
    process.exit(r.status ?? 1);
  }
  main().catch((e) => { console.error(e.stack ?? e.message); process.exit(1); });
}
