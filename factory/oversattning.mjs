// Översättningslagret — fas 4 i factory/PROCESS.md, steg 14.
//
// PROCESS.md kräver att ALLT översätts via translationsRegister och
// trippelkollas mot /nb. Fram till 2026-09-09 fanns ingen kod för det:
// HeimGuard och TankGuard översattes för hand utanför repot, och det syntes
// — TankGuard låg kvar med otränslade sidtitlar, menylänkar, meta-
// beskrivningar och startsidans omdömen (mätt 2026-09-09 i den här filens
// egen granskning). Handarbete lämnar alltid rester. Därför bor mekaniken
// här i stället, och varje ny OPS granskas med samma mått.
//
//   node factory/oversattning.mjs granska <locale>     — vad saknas
//   node factory/oversattning.mjs granska nb --allt    — även maskinvärden
//
// Modulen skriver ALDRIG något av sig själv. `registrera()` anropas av den
// som har texterna; CLI:t är läs-bart med flit.
//
// ⚠️ Tema-översättningar är knutna till TEMA-ID (PROCESS.md steg 14). En ny
// temaklon ärver INTE dem — granska om efter varje klon. Nycklar och digests
// är stabila mellan kloner, så samma texter går att registrera om rakt av.

import { graphql } from './shopify.mjs';

// Resurstyper som bär kundsynlig text. Ordningen är den ordning en kund
// möter dem: produkten, sidorna, menyn, paketen, temat.
export const RESURSTYPER = [
  'PRODUCT',
  'PRODUCT_OPTION',
  'PRODUCT_OPTION_VALUE',
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
// och appen lokaliserar själv. Rör dem aldrig.
export function arAppcache(resourceId) {
  return /Metafield\//.test(String(resourceId));
}

export async function lasResurser(resurstyp, locale, antal = 50) {
  const d = await graphql(
    `query opsFactoryOversattning($t: TranslatableResourceType!, $locale: String!, $antal: Int!) {
      translatableResources(first: $antal, resourceType: $t) {
        nodes {
          resourceId
          translatableContent { key value digest }
          translations(locale: $locale) { key value }
        }
      }
    }`,
    { t: resurstyp, locale, antal }
  );
  return d.translatableResources.nodes;
}

// Vad som saknas i en resurslista. `allt: true` tar med maskinvärdena också
// — bara för felsökning, aldrig som arbetslista.
export function granska(noder, { allt = false } = {}) {
  const saknade = [];
  let kallor = 0;
  let oversatta = 0;
  for (const r of noder) {
    if (!allt && arAppcache(r.resourceId)) continue;
    const gjorda = new Map((r.translations ?? []).map((t) => [t.key, t.value]));
    for (const c of r.translatableContent) {
      if (!allt && (ALDRIG.has(c.key) || arMaskinvarde(c.value) || SENTINELVARDEN.has(c.value))) continue;
      kallor++;
      if (gjorda.get(c.key)) oversatta++;
      else saknade.push({ resourceId: r.resourceId, key: c.key, value: c.value, digest: c.digest });
    }
  }
  return { kallor, oversatta, saknade };
}

// Registrerar översättningar på EN resurs. `poster` = [{ key, value, digest }].
// Digesten måste komma från samma läsning som texten — ändras källtexten
// efteråt vägrar Shopify, och det är meningen: då är översättningen inaktuell.
export async function registrera(resourceId, locale, poster) {
  if (poster.length === 0) return { antal: 0, fel: [] };
  const d = await graphql(
    `mutation opsFactoryRegistrera($id: ID!, $t: [TranslationInput!]!) {
      translationsRegister(resourceId: $id, translations: $t) {
        translations { key value }
        userErrors { field message }
      }
    }`,
    {
      id: resourceId,
      t: poster.map((p) => ({
        key: p.key,
        value: p.value,
        locale,
        translatableContentDigest: p.digest,
      })),
    }
  );
  const svar = d.translationsRegister;
  return { antal: (svar.translations ?? []).length, fel: svar.userErrors ?? [] };
}

// Slår upp digesten för en nyckel — den som har texterna behöver sällan
// hålla reda på digests själv.
export function digestFor(noder, resourceId, key) {
  const r = noder.find((n) => n.resourceId === resourceId);
  return r?.translatableContent.find((c) => c.key === key)?.digest ?? null;
}

// ---------------------------------------------------------------------------
// CLI — läs-bart. Skriver aldrig.
// ---------------------------------------------------------------------------
if (import.meta.url === `file://${process.argv[1]}`) {
  const [kommando, locale, ...flaggor] = process.argv.slice(2);
  if (kommando !== 'granska' || !locale) {
    console.error('Användning: node factory/oversattning.mjs granska <locale> [--allt]');
    process.exit(1);
  }
  const { laddaEnv } = await import('./env.mjs');
  laddaEnv();
  const allt = flaggor.includes('--allt');
  let totaltKallor = 0;
  let totaltOversatta = 0;
  for (const typ of RESURSTYPER) {
    let noder;
    try {
      noder = await lasResurser(typ, locale);
    } catch {
      continue; // resurstypen finns inte i den här API-versionen
    }
    const { kallor, oversatta, saknade } = granska(noder, { allt });
    if (kallor === 0) continue;
    totaltKallor += kallor;
    totaltOversatta += oversatta;
    const ikon = saknade.length === 0 ? '✅' : '❌';
    console.log(`\n${ikon} ${typ}  ${oversatta}/${kallor}`);
    for (const s of saknade.slice(0, 20)) {
      console.log(`     ${s.resourceId.split('/').slice(-2).join('/')}  ${s.key} = ${JSON.stringify(s.value).slice(0, 64)}`);
    }
    if (saknade.length > 20) console.log(`     … +${saknade.length - 20} till`);
  }
  console.log(`\nSUMMA ${locale}: ${totaltOversatta}/${totaltKallor}`);
  process.exit(totaltOversatta === totaltKallor ? 0 : 2);
}
