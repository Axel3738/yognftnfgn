// Marknadssteget (PROCESS.md fas 4, PLAN.md 6b): marknad Norge + locale nb
// publicerad + nb som alternateLocale på butikens webbnärvaro, och ALLT
// översatt via translationsRegister — produkt, metafält, sidor, menylänkar,
// paket-metaobjekt, temats JSON-mallar och sektionsgrupper.
//
//   node factory/marknader.mjs factory/butiker/<butik>.yaml factory/produkter/<id>.yaml [--torr]
//
// Översättningen läses ur factory/output/<id>/oversattning-<locale>.json
// (skriven av en subagent ur oversattning-sv.json, samma nycklar). Matchningen
// mot Shopify görs på VÄRDE: varje översättningsbar sträng i butiken vars
// svenska text finns i källfilen får sin norska motsvarighet. Så behöver
// ingen gissa Shopifys nycklar — och allt svenskt som blev kvar listas i
// rapporten som läckor. Tema-översättningar är knutna till TEMA-ID — kör om
// steget för varje ny temaklon (nycklar och digests är stabila mellan kloner).
// Noll beroenden.

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';
import { lasYaml } from './yaml.mjs';
import { laddaEnv } from './env.mjs';
import { graphql, hamtaProduktViaHandle, hamtaUtkastTema, kontrolleraAnslutning } from './shopify.mjs';
import { METAOBJEKT_TYP } from './paket.mjs';

const FACTORY_ROT = dirname(fileURLToPath(import.meta.url));
const norm = (s) => String(s ?? '').replace(/\r\n/g, '\n').trim();

export function lasOversattning(produktId, locale) {
  const sv = join(FACTORY_ROT, 'output', produktId, 'oversattning-sv.json');
  const nb = join(FACTORY_ROT, 'output', produktId, `oversattning-${locale}.json`);
  if (!existsSync(sv) || !existsSync(nb)) {
    throw new Error(`Saknar ${sv} och/eller ${nb} — kör factory/oversattning.mjs och låt subagenten skriva ${locale}-filen.`);
  }
  const a = JSON.parse(readFileSync(sv, 'utf8'));
  const b = JSON.parse(readFileSync(nb, 'utf8'));
  const karta = new Map();
  // Ord som är likadana på båda språken (Kontakt, Returpolicy …) är ingen
  // läcka — de samlas för sig så rapporten inte larmar på dem.
  const samma = new Set();
  for (const [k, v] of Object.entries(a)) {
    if (typeof b[k] !== 'string' || !norm(b[k])) continue;
    if (norm(b[k]) === norm(v)) samma.add(norm(v));
    else karta.set(norm(v), b[k]);
  }
  return { karta, samma, sv: a, nb: b };
}

// ---- Marknad + locale + webbnärvaro ----------------------------------------

export async function sakerstallMarknad(land, namn, handle, torr) {
  const q = await graphql(`{ markets(first: 20) { nodes { id name handle status conditions { regionsCondition { regions(first: 10) { nodes { ... on MarketRegionCountry { code } } } } } } } }`);
  const finns = (q.markets?.nodes ?? []).find((m) => (m.conditions?.regionsCondition?.regions?.nodes ?? []).some((r) => r.code === land));
  if (finns) return { id: finns.id, namn: finns.name, ny: false, status: finns.status };
  if (torr) return { id: null, namn, ny: true };
  const m = await graphql(
    `mutation opsFactoryMarknad($input: MarketCreateInput!) {
      marketCreate(input: $input) { market { id name handle status } userErrors { field message } }
    }`,
    { input: { name: namn, handle, status: 'ACTIVE', conditions: { regionsCondition: { regions: [{ countryCode: land }] } } } }
  );
  const fel = m.marketCreate?.userErrors ?? [];
  if (fel.length > 0) throw new Error(`marketCreate ${namn}: ${fel.map((f) => f.message).join('; ')}`);
  return { id: m.marketCreate.market.id, namn, ny: true, status: m.marketCreate.market.status };
}

export async function sakerstallLocale(locale, torr) {
  const q = await graphql('{ shopLocales { locale primary published } }');
  const finns = (q.shopLocales ?? []).find((l) => l.locale === locale);
  if (finns?.published) return { locale, ny: false, publicerad: true };
  if (torr) return { locale, ny: !finns, publicerad: false };
  if (!finns) {
    const e = await graphql(
      `mutation opsFactoryLocale($locale: String!) { shopLocaleEnable(locale: $locale) { shopLocale { locale } userErrors { field message } } }`,
      { locale }
    );
    const fel = e.shopLocaleEnable?.userErrors ?? [];
    if (fel.length > 0) throw new Error(`shopLocaleEnable ${locale}: ${fel.map((f) => f.message).join('; ')}`);
  }
  const u = await graphql(
    `mutation opsFactoryLocalePub($locale: String!, $shopLocale: ShopLocaleInput!) {
      shopLocaleUpdate(locale: $locale, shopLocale: $shopLocale) { shopLocale { locale published } userErrors { field message } }
    }`,
    { locale, shopLocale: { published: true } }
  );
  const fel = u.shopLocaleUpdate?.userErrors ?? [];
  if (fel.length > 0) throw new Error(`shopLocaleUpdate ${locale}: ${fel.map((f) => f.message).join('; ')}`);
  return { locale, ny: !finns, publicerad: true };
}

// nb som alternateLocale på VARJE webbnärvaro (domänen + myshopify) —
// webPresenceUpdate, inte market-varianten (unified markets, HeimGuard 2026-09-07).
export async function sakerstallWebPresence(locale, torr) {
  const q = await graphql('{ webPresences(first: 10) { nodes { id domain { host } defaultLocale { locale } alternateLocales { locale } } } }');
  const ut = [];
  for (const wp of q.webPresences?.nodes ?? []) {
    const har = (wp.alternateLocales ?? []).map((l) => l.locale);
    if (har.includes(locale) || wp.defaultLocale?.locale === locale) { ut.push(`${wp.domain?.host}: har ${locale}`); continue; }
    if (torr) { ut.push(`${wp.domain?.host}: skulle få ${locale}`); continue; }
    const u = await graphql(
      `mutation opsFactoryWp($id: ID!, $input: WebPresenceUpdateInput!) {
        webPresenceUpdate(id: $id, input: $input) { webPresence { id alternateLocales { locale } } userErrors { field message } }
      }`,
      { id: wp.id, input: { alternateLocales: [...har, locale] } }
    );
    const fel = u.webPresenceUpdate?.userErrors ?? [];
    if (fel.length > 0) throw new Error(`webPresenceUpdate ${wp.domain?.host}: ${fel.map((f) => f.message).join('; ')}`);
    ut.push(`${wp.domain?.host}: ${locale} tillagd`);
  }
  return ut;
}

// ---- Översättningar ---------------------------------------------------------

async function translatableIds(ids) {
  const ut = [];
  for (let i = 0; i < ids.length; i += 50) {
    const d = await graphql(
      `query opsFactoryTr($ids: [ID!]!) {
        translatableResourcesByIds(first: 50, resourceIds: $ids) { nodes { resourceId translatableContent { key value digest locale } } }
      }`,
      { ids: ids.slice(i, i + 50) }
    );
    ut.push(...(d.translatableResourcesByIds?.nodes ?? []));
  }
  return ut;
}

async function translatableTyp(typ) {
  const ut = [];
  let cursor = null;
  for (let i = 0; i < 20; i++) {
    const d = await graphql(
      `query opsFactoryTrTyp($typ: TranslatableResourceType!, $cursor: String) {
        translatableResources(first: 100, resourceType: $typ, after: $cursor) {
          nodes { resourceId translatableContent { key value digest locale } }
          pageInfo { hasNextPage endCursor }
        }
      }`,
      { typ, cursor }
    );
    ut.push(...(d.translatableResources?.nodes ?? []));
    if (!d.translatableResources?.pageInfo?.hasNextPage) break;
    cursor = d.translatableResources.pageInfo.endCursor;
  }
  return ut;
}

async function befintliga(resourceId, locale) {
  const d = await graphql(
    `query opsFactoryTrHar($id: ID!, $locale: String!) {
      translatableResource(resourceId: $id) { translations(locale: $locale) { key value outdated } }
    }`,
    { id: resourceId, locale }
  );
  return new Map((d.translatableResource?.translations ?? []).map((t) => [t.key, t]));
}

// Registrerar översättningar för en resurs: varje translatableContent vars
// svenska värde finns i kartan. Returnerar { registrerade, kvar } där kvar
// är de svenska texter som saknar översättning (= potentiella läckor).
export async function oversattResurs(resurs, karta, locale, torr) {
  const har = torr ? new Map() : await befintliga(resurs.resourceId, locale);
  const translations = [];
  const kvar = [];
  for (const c of resurs.translatableContent) {
    const sv = norm(c.value);
    if (!sv) continue;
    const nb = karta.get(sv);
    if (!nb) { kvar.push({ key: c.key, value: sv.slice(0, 60) }); continue; }
    const redan = har.get(c.key);
    if (redan && !redan.outdated && norm(redan.value) === norm(nb)) continue;
    translations.push({ locale, key: c.key, value: nb, translatableContentDigest: c.digest });
  }
  if (translations.length > 0 && !torr) {
    for (let i = 0; i < translations.length; i += 100) {
      const d = await graphql(
        `mutation opsFactoryTrReg($id: ID!, $translations: [TranslationInput!]!) {
          translationsRegister(resourceId: $id, translations: $translations) { userErrors { field message } }
        }`,
        { id: resurs.resourceId, translations: translations.slice(i, i + 100) }
      );
      const fel = d.translationsRegister?.userErrors ?? [];
      if (fel.length > 0) throw new Error(`${resurs.resourceId}: ${fel.map((f) => f.message).join('; ')}`);
    }
  }
  return { registrerade: translations.length, kvar };
}

// Alla resurser butiken bär text i. Tema-filerna filtreras på utkasttemat.
export async function samlaResurser(p, temaId) {
  const ut = [];
  const produkt = await hamtaProduktViaHandle(p.produkt.id);
  if (!produkt) throw new Error(`Produkten ${p.produkt.id} finns inte — kör ops.mjs först.`);
  const bonus = p.offer?.bonus_produkt?.handle ? await hamtaProduktViaHandle(p.offer.bonus_produkt.handle) : null;
  const produktIds = [produkt.id, bonus?.id].filter(Boolean);

  // Produkter + deras opf-metafält + variantvärden.
  const mf = await graphql(
    `query opsFactoryMf($id: ID!) {
      product(id: $id) { metafields(first: 30, namespace: "opf") { nodes { id key } } options { id optionValues { id name } } }
    }`,
    { id: produkt.id }
  );
  const mfIds = (mf.product?.metafields?.nodes ?? []).filter((m) => m.key !== 'gif_problem' && m.key !== 'media_losning' && m.key !== 'bild_lifestyle').map((m) => m.id);
  const optionValueIds = (mf.product?.options ?? []).flatMap((o) => o.optionValues.map((v) => v.id));
  for (const r of await translatableIds([...produktIds, ...mfIds, ...optionValueIds])) ut.push({ typ: r.resourceId.includes('Metafield') ? 'metafält' : r.resourceId.includes('OptionValue') ? 'variant' : 'produkt', ...r });

  for (const [typ, namn] of [['PAGE', 'sida'], ['LINK', 'menylänk'], ['METAOBJECT', 'paket'], ['SHOP_POLICY', 'policy']]) {
    for (const r of await translatableTyp(typ)) {
      if (typ === 'METAOBJECT' && !r.resourceId.includes('Metaobject/')) continue;
      ut.push({ typ: namn, ...r });
    }
  }
  if (temaId) {
    // translatableResources(resourceType: …) listar bara LIVE-temat (mätt
    // 2026-09-08) — utkasttemats mallar nås via translatableResourcesByIds
    // med konstruerade id:n: JsonTemplate/<mall>?theme_id=… och
    // SectionGroup/<grupp>?theme_id=…, härledda ur temats fillista.
    const temaNr = String(temaId).split('/').pop();
    const f = await graphql(
      `query opsFactoryTemaFiler($id: ID!) { theme(id: $id) { files(first: 250) { nodes { filename } } } }`,
      { id: temaId }
    );
    const filnamn = (f.theme?.files?.nodes ?? []).map((x) => x.filename);
    const ids = [
      ...filnamn.filter((x) => /^templates\/.+\.json$/.test(x)).map((x) => `gid://shopify/OnlineStoreThemeJsonTemplate/${x.replace(/^templates\//, '').replace(/\.json$/, '')}?theme_id=${temaNr}`),
      ...filnamn.filter((x) => /^sections\/.+-group\.json$/.test(x)).map((x) => `gid://shopify/OnlineStoreThemeSectionGroup/${x.replace(/^sections\//, '').replace(/\.json$/, '')}?theme_id=${temaNr}`),
      `gid://shopify/OnlineStoreThemeSettingsDataSections/${temaNr}`,
    ];
    for (const r of await translatableIds(ids)) {
      if ((r.translatableContent ?? []).length === 0) continue;
      ut.push({ typ: r.resourceId.includes('SectionGroup') ? 'sektionsgrupp' : r.resourceId.includes('SettingsData') ? 'temainställning' : 'temamall', ...r });
    }
  }
  return ut;
}

async function huvud() {
  laddaEnv();
  const arg = process.argv.slice(2);
  const [butiksfil, produktfil] = arg.filter((a) => !a.startsWith('--') && a.endsWith('.yaml'));
  const torr = arg.includes('--torr') || arg.includes('--dry');
  if (!butiksfil || !produktfil) {
    console.error('Användning: node factory/marknader.mjs factory/butiker/<butik>.yaml factory/produkter/<id>.yaml [--torr]');
    process.exit(1);
  }
  const butik = lasYaml(readFileSync(butiksfil, 'utf8'));
  const p = lasYaml(readFileSync(produktfil, 'utf8'));
  const marknader = Array.isArray(butik?.butik?.marknader) ? butik.butik.marknader : [];
  if (marknader.length === 0) throw new Error('butik.marknader är tom — SE + NO är standard i varje OPS.');

  const shop = await kontrolleraAnslutning();
  console.log(`Connected: ${shop.myshopifyDomain} ✓${torr ? '  (torrkörning)' : ''}`);
  const tema = await hamtaUtkastTema();

  const NAMN = { NO: ['Norge', 'no'], DK: ['Danmark', 'dk'], FI: ['Finland', 'fi'], DE: ['Tyskland', 'de'] };
  for (const m of marknader) {
    const land = String(m.land).toUpperCase();
    const locale = String(m.locale);
    const [namn, handle] = NAMN[land] ?? [land, land.toLowerCase()];
    const mark = await sakerstallMarknad(land, namn, handle, torr);
    console.log(`✅ Marknad ${mark.namn}: ${mark.ny ? 'skapad' : 'finns'}${mark.id ? ` (${mark.id.split('/').pop()}, ${mark.status})` : ''}`);
    const loc = await sakerstallLocale(locale, torr);
    console.log(`✅ Språk ${locale}: ${loc.ny ? 'aktiverat' : 'fanns'}${loc.publicerad ? ', publicerat' : ''}`);
    for (const rad of await sakerstallWebPresence(locale, torr)) console.log(`   webbnärvaro ${rad}`);
    console.log(`🖐 Valutan ${m.valuta ?? 'NOK'} slås på i admin: Inställningar → Marknader → ${namn} (API-spärrat i unified markets).`);

    const { karta, samma } = lasOversattning(p.produkt.id, locale);
    console.log(`\nÖversättningar ${locale}: ${karta.size} svenska strängar i kartan, ${samma.size} likadana på båda språken.`);
    const resurser = await samlaResurser(p, tema?.id);
    const summa = {};
    const lackor = [];
    for (const r of resurser) {
      const res = await oversattResurs(r, karta, locale, torr);
      summa[r.typ] = (summa[r.typ] ?? 0) + res.registrerade;
      for (const k of res.kvar) lackor.push({ typ: r.typ, id: r.resourceId.split('/').pop().split('?')[0], ...k });
    }
    for (const [typ, n] of Object.entries(summa)) console.log(`   ${typ}: ${n} ${torr ? 'skulle registreras' : 'registrerade'}`);
    // Tekniska värden (handle, ikon-/layoutord, rabattkoder, URL:er) och
    // Shopifys egen integritetspolicy-mall (Liquid, kan inte översättas via
    // API — byts i admin under Policyer) är inga läckor. Kundkontots meny
    // (Orders/Profile) är Shopifys egen.
    const TEKNISKT = /^(shopify:\/\/|https?:\/\/|\/|[a-z0-9_-]+$|[A-Z0-9_]+$)/;
    const riktiga = lackor.filter(
      (l) =>
        !TEKNISKT.test(l.value) &&
        !samma.has(l.value) &&
        !/^(handle|product_type|meta_description)$/.test(l.key) &&
        !(l.typ === 'policy' && l.value.includes('{{')) &&
        !(l.typ === 'menylänk' && /^(Orders|Profile)$/.test(l.value))
    );
    if (riktiga.length > 0) {
      console.log(`\n⚠️  ${riktiga.length} svenska texter saknar översättning (läckor på /${locale}):`);
      for (const l of riktiga.slice(0, 40)) console.log(`   ${l.typ} ${l.id} ${l.key}: "${l.value}"`);
    } else {
      console.log(`\n✅ Inga oöversatta texter kvar i resurserna.`);
    }
  }
  console.log('\nTrippelkolla mot kundens vy: /nb på startsidan och produktsidan (preview_theme_id + kakburk), svensk regression, mobilkontroll.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  huvud().catch((e) => { console.error(`\n❌ ${e.message}\n`); process.exit(1); });
}
