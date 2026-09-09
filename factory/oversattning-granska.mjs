// Översättningsgranskaren — läs-bar. Mäter vad som saknas per resurstyp
// efter att marknad.oversattAllt kört (KEDJAN.md steg 17).
//
// PROCESS.md kräver att ALLT översätts via translationsRegister och
// trippelkollas mot /nb. Fram till 2026-09-09 fanns ingen kod för det:
// HeimGuard och TankGuard översattes för hand utanför repot, och det syntes
// — TankGuard låg kvar med otränslade sidtitlar, menylänkar, meta-
// beskrivningar och startsidans omdömen (mätt 2026-09-09 i den här filens
// egen granskning). Handarbete lämnar alltid rester. Därför mäts varje ny
// OPS med samma mått.
//
//   node factory/oversattning-granska.mjs <locale> [--allt] [--tema <id>]
//
// Modulen skriver ALDRIG något. Registrering görs av marknad.mjs.
//
// ⚠️ Tema-översättningar är knutna till TEMA-ID (PROCESS.md steg 14). En ny
// temaklon ärver INTE dem — granska om efter varje klon. Nycklar och digests
// är stabila mellan kloner, så samma texter går att registrera om rakt av.
// ⚠️ translatableResources(resourceType: …) listar temaraderna för LIVE-temat
// (mätt 2026-09-08). Ange --tema för att bara räkna rader med vårt theme_id.

import { pathToFileURL } from 'node:url';
import { graphql } from './shopify.mjs';

// Resurstyper som bär kundsynlig text. Ordningen är den ordning en kund
// möter dem: produkten, sidorna, menyn, paketen, temat.
export const RESURSTYPER = [
  'PRODUCT',
  'PRODUCT_OPTION',
  'PRODUCT_OPTION_VALUE',
  'COLLECTION',
  'PAGE',
  'LINK',
  'METAOBJECT',
  'SHOP_POLICY',
  'ONLINE_STORE_THEME_JSON_TEMPLATE',
  'ONLINE_STORE_THEME_SECTION_GROUP',
  'ONLINE_STORE_THEME_LOCALE_CONTENT',
  'ONLINE_STORE_THEME_SETTINGS_CATEGORY',
];

// Nycklar som ALDRIG ska översättas. Det är maskinvärden — översätts de går
// uppslaget sönder tyst: rabattkoden slutar matcha, A/B-varianten hamnar i
// fel hink, handlen byter URL under fötterna på annonserna.
export const ALDRIG = new Set([
  'handle',
  'product_type',
  'ab_variant',
  'rabattkod',
  'general.ms_ab_tests',   // testnamnen ms-ab.js matchar på
]);

// Shopifys egen sentinel för produkter utan riktiga varianter. Översätts den
// slutar Shopify känna igen den som "ingen variant" och väljaren dyker upp.
export const SENTINELVARDEN = new Set(['Default Title']);

// Värden som inte ÄR text: filreferenser, länkar och Liquid-uttryck.
// De ligger i registret som "otränslade" för alltid, och ska göra det.
export function arMaskinvarde(varde) {
  const v = String(varde ?? '').trim();
  return v === '' || /^(shopify:\/\/|https?:\/\/|\{\{)/.test(v);
}

// Judge.me lägger sina widget-cachar som metafält i klartext. De skrivs om
// av appen vid varje synk, så en översättning där överlever inte natten —
// och appen lokaliserar själv. Våra opf-metafält är däremot riktig text och
// översätts av marknad.mjs; här räknas de när noden bär namespace opf.
export function arAppcache(resourceId, namespace = null) {
  return /Metafield\//.test(String(resourceId)) && namespace !== 'opf';
}

// En sida av en resurstyp, med befintliga översättningar. Paginerar tills
// allt är läst (max 20 sidor à `antal`).
export async function lasResurser(resurstyp, locale, antal = 100) {
  const ut = [];
  let cursor = null;
  for (let i = 0; i < 20; i++) {
    const d = await graphql(
      `query opsFactoryGranska($t: TranslatableResourceType!, $locale: String!, $antal: Int!, $cursor: String) {
        translatableResources(first: $antal, resourceType: $t, after: $cursor) {
          nodes {
            resourceId
            translatableContent { key value digest }
            translations(locale: $locale) { key value outdated }
          }
          pageInfo { hasNextPage endCursor }
        }
      }`,
      { t: resurstyp, locale, antal, cursor }
    );
    ut.push(...(d.translatableResources?.nodes ?? []));
    if (!d.translatableResources?.pageInfo?.hasNextPage) break;
    cursor = d.translatableResources.pageInfo.endCursor;
  }
  return ut;
}

// Ren logik: vad som saknas i en nodlista. `allt: true` tar med maskinvärdena
// också — bara för felsökning, aldrig som arbetslista. En outdated
// översättning räknas som saknad: källan har ändrats sedan den skrevs.
export function granskaNoder(noder, { allt = false } = {}) {
  const saknade = [];
  let kallor = 0;
  let oversatta = 0;
  for (const r of noder ?? []) {
    if (!allt && arAppcache(r.resourceId, r.namespace ?? null)) continue;
    const gjorda = new Map((r.translations ?? []).map((t) => [t.key, t]));
    for (const c of r.translatableContent ?? []) {
      if (!allt && (ALDRIG.has(c.key) || arMaskinvarde(c.value) || SENTINELVARDEN.has(c.value))) continue;
      kallor++;
      const t = gjorda.get(c.key);
      if (t?.value && !t.outdated) oversatta++;
      else saknade.push({ resourceId: r.resourceId, key: c.key, value: c.value, digest: c.digest, outdated: Boolean(t?.outdated) });
    }
  }
  return { kallor, oversatta, saknade };
}

// Filtrerar temarader på vårt theme_id när ett tema anges; rader utan
// theme_id i id:t lämnas kvar (de är inte temaspecifika).
export function filtreraPaTema(noder, temaId) {
  if (!temaId) return noder;
  const nr = String(temaId).split('/').pop();
  return (noder ?? []).filter((r) => !/theme_id=/.test(String(r.resourceId)) || String(r.resourceId).includes(`theme_id=${nr}`));
}

// Kontraktet (KEDJAN.md): granska(locale, { allt }) → { perTyp:[{ typ, kallor,
// oversatta, saknade }], kallor, oversatta }. Resurstyper API-versionen inte
// känner hoppas över tyst — de finns då inte att granska.
export async function granska(locale, { allt = false, temaId = null } = {}) {
  const perTyp = [];
  let kallor = 0;
  let oversatta = 0;
  for (const typ of RESURSTYPER) {
    let noder;
    try {
      noder = await lasResurser(typ, locale);
    } catch {
      continue;
    }
    const r = granskaNoder(filtreraPaTema(noder, temaId), { allt });
    if (r.kallor === 0) continue;
    kallor += r.kallor;
    oversatta += r.oversatta;
    perTyp.push({ typ, ...r });
  }
  return { locale, perTyp, kallor, oversatta, komplett: kallor === oversatta };
}

// Slår upp digesten för en nyckel — den som har texterna behöver sällan
// hålla reda på digests själv.
export function digestFor(noder, resourceId, key) {
  const r = (noder ?? []).find((n) => n.resourceId === resourceId);
  return r?.translatableContent?.find((c) => c.key === key)?.digest ?? null;
}

// ---------------------------------------------------------------------------
// CLI — läs-bart. Skriver aldrig.
// ---------------------------------------------------------------------------
async function huvud() {
  const arg = process.argv.slice(2);
  const locale = arg.find((a) => !a.startsWith('--') && arg[arg.indexOf(a) - 1] !== '--tema');
  if (!locale) {
    console.error('Användning: node factory/oversattning-granska.mjs <locale> [--allt] [--tema <id>]');
    process.exit(1);
  }
  const { laddaEnv } = await import('./env.mjs');
  laddaEnv();
  const allt = arg.includes('--allt');
  const temaId = arg.includes('--tema') ? arg[arg.indexOf('--tema') + 1] : null;
  const r = await granska(locale, { allt, temaId });
  for (const t of r.perTyp) {
    console.log(`\n${t.saknade.length === 0 ? '✅' : '❌'} ${t.typ}  ${t.oversatta}/${t.kallor}`);
    for (const s of t.saknade.slice(0, 20)) {
      console.log(`     ${s.resourceId.split('/').slice(-2).join('/')}  ${s.key}${s.outdated ? ' (outdated)' : ''} = ${JSON.stringify(s.value).slice(0, 64)}`);
    }
    if (t.saknade.length > 20) console.log(`     … +${t.saknade.length - 20} till`);
  }
  console.log(`\nSUMMA ${locale}: ${r.oversatta}/${r.kallor}`);
  process.exit(r.komplett ? 0 : 2);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  huvud().catch((e) => { console.error(`\n❌ ${e.message}\n`); process.exit(1); });
}
