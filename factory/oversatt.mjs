// oversatt.mjs — registrerar översättningar via translationsRegister.
//
//   node factory/oversatt.mjs <butik-id> <produkt-handle> --locale nb [--torr]
//
// Fas 4 steg 14 i PROCESS.md: ALLT ska översättas, inte bara produkten.
// Sju ytor, och de missas en och en om man går på känsla:
//   1. produkten (titel, beskrivning, handle)
//   2. produktens metafält (opf-sektionernas säljinnehåll)
//   3. tema-JSON-mallarna (index/product) — ⚠️ knutna till TEMA-ID
//   4. sektionsgrupperna (header-group/footer-group) — egna gid:n med theme_id
//   5. menylänkarna
//   6. sidorna (returpolicy, frakt, villkor, kontakt)
//   7. paket-metaobjekten
//
// ⚠️ Tema-översättningar dör i varje ny temaklon. Nycklar och digests är
// stabila mellan kloner, så raderna kan spelas upp rakt av mot det nya
// tema-id:t — men de MÅSTE spelas upp, annars står nya klonen på svenska.
//
// Metoden är alltid densamma: läs `translatableResource` för att få nyckel +
// digest, para ihop med översättningen på NYCKEL, registrera. En digest som
// inte stämmer avvisas av Shopify — därför läses de alltid färskt, aldrig
// ur en sparad fil.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { laddaEnv } from './env.mjs';
import { graphql } from './shopify.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));

export async function hamtaOversattbart(resourceId) {
  const d = await graphql(
    `query opsFactoryOversattbart($id: ID!) {
      translatableResource(resourceId: $id) {
        resourceId
        translatableContent { key value digest locale type }
      }
    }`,
    { id: resourceId }
  );
  return d.translatableResource?.translatableContent ?? [];
}

// `oversattningar` är { nyckel: text }. Nycklar som inte finns på resursen
// rapporteras tillbaka i stället för att tyst försvinna.
export async function registrera(resourceId, locale, oversattningar) {
  const innehall = await hamtaOversattbart(resourceId);
  const digest = new Map(innehall.map((c) => [c.key, c.digest]));

  const rader = [];
  const saknade = [];
  for (const [key, value] of Object.entries(oversattningar)) {
    if (value === null || value === undefined || value === '') continue;
    if (!digest.has(key)) { saknade.push(key); continue; }
    rader.push({ key, locale, value: String(value), translatableContentDigest: digest.get(key) });
  }
  if (rader.length === 0) return { antal: 0, saknade };

  const d = await graphql(
    `mutation opsFactoryOversatt($resourceId: ID!, $translations: [TranslationInput!]!) {
      translationsRegister(resourceId: $resourceId, translations: $translations) {
        translations { key locale }
        userErrors { field message }
      }
    }`,
    { resourceId, translations: rader }
  );
  const fel = d.translationsRegister?.userErrors ?? [];
  if (fel.length > 0) throw new Error(`Översättning ${resourceId}: ${fel.map((f) => f.message).join('; ')}`);
  return { antal: d.translationsRegister.translations.length, saknade };
}

// Slår upp alla resurser vi översätter, så inget glöms bort tyst.
export async function kartlaggResurser(produktHandle) {
  const d = await graphql(
    `query opsFactoryResurser($handle: String!) {
      productByIdentifier(identifier: { handle: $handle }) {
        id title
        metafields(first: 50, namespace: "opf") { nodes { id key } }
      }
      pages(first: 50) { nodes { id handle title } }
      menus(first: 20) { nodes { id handle title items { id title } } }
      themes(first: 20) { nodes { id name role } }
      metaobjects(type: "ms_paketniva", first: 50) { nodes { id handle } }
      shop { id }
    }`,
    { handle: produktHandle }
  );
  return d;
}

// Tema-resurserna: JSON-mallarna och sektionsgrupperna. Sektionsgruppernas
// gid har formen gid://shopify/OnlineStoreThemeSectionGroup/<grupp>?theme_id=<id>
// och finns inte i någon lista — de måste byggas ihop för hand.
export function temaResurser(temaId, { mallar = ['index', 'product'], grupper = ['header-group', 'footer-group'] } = {}) {
  const nummer = String(temaId).split('/').pop();
  return [
    ...mallar.map((m) => ({
      typ: 'mall',
      namn: m,
      id: `gid://shopify/OnlineStoreThemeJsonTemplate/${m}?theme_id=${nummer}`,
    })),
    ...grupper.map((g) => ({
      typ: 'sektionsgrupp',
      namn: g,
      id: `gid://shopify/OnlineStoreThemeSectionGroup/${g}?theme_id=${nummer}`,
    })),
  ];
}

if (process.argv[1] && process.argv[1].endsWith('oversatt.mjs')) {
  laddaEnv();
  const arg = process.argv.slice(2);
  const [butikId, produktHandle] = arg.filter((a) => !a.startsWith('--'));
  const locale = arg.includes('--locale') ? arg[arg.indexOf('--locale') + 1] : 'nb';
  const torr = arg.includes('--torr');
  if (!butikId || !produktHandle) {
    throw new Error('Användning: node factory/oversatt.mjs <butik-id> <produkt-handle> [--locale nb] [--torr]');
  }

  const konf = JSON.parse(readFileSync(join(ROT, 'startsidor', `${butikId}.json`), 'utf8'));
  const text = konf[locale];
  if (!text) throw new Error(`startsidor/${butikId}.json saknar blocket "${locale}".`);

  const res = await kartlaggResurser(produktHandle);
  // Samma fälla som i oversatt-tema.mjs: efter publicering är UNPUBLISHED
  // Shopifys default-tema, inte vårt.
  const cro = (res.themes?.nodes ?? []).filter((t) => /\bcro\b/i.test(t.name));
  const tema = cro.find((t) => t.role === 'MAIN') ?? cro[0] ?? (res.themes?.nodes ?? []).find((t) => t.role === 'UNPUBLISHED');
  if (!tema) throw new Error('Inget utkasttema — kör factory/tema-upload.mjs först.');

  console.log(`Översätter till ${locale}${torr ? ' (TORRKÖRNING)' : ''}`);
  console.log(`  tema: ${tema.name}`);

  const jobb = [];

  // 1–2. Produkten + dess opf-metafält.
  if (res.productByIdentifier) {
    jobb.push({ namn: 'produkt', id: res.productByIdentifier.id, texter: text.produkt ?? {} });
    for (const mf of res.productByIdentifier.metafields?.nodes ?? []) {
      const t = (text.metafalt ?? {})[mf.key];
      if (t) jobb.push({ namn: `metafält ${mf.key}`, id: mf.id, texter: { value: t } });
    }
  }

  // 3–4. Tema-mallarna och sektionsgrupperna.
  for (const t of temaResurser(tema.id)) {
    const texter = (text.tema ?? {})[t.namn];
    if (texter) jobb.push({ namn: `tema ${t.namn}`, id: t.id, texter });
  }

  // 5. Menyerna.
  for (const m of res.menus?.nodes ?? []) {
    const texter = (text.menyer ?? {})[m.handle];
    if (texter) jobb.push({ namn: `meny ${m.handle}`, id: m.id, texter });
  }

  // 6. Sidorna.
  for (const s of res.pages?.nodes ?? []) {
    const texter = (text.sidor ?? {})[s.handle];
    if (texter) jobb.push({ namn: `sida ${s.handle}`, id: s.id, texter });
  }

  // 7. Paket-metaobjekten.
  for (const mo of res.metaobjects?.nodes ?? []) {
    const texter = (text.paket ?? {})[mo.handle];
    if (texter) jobb.push({ namn: `paket ${mo.handle}`, id: mo.id, texter });
  }

  let totalt = 0;
  const allaSaknade = [];
  for (const j of jobb) {
    if (torr) {
      const innehall = await hamtaOversattbart(j.id);
      const nycklar = new Set(innehall.map((c) => c.key));
      const traff = Object.keys(j.texter).filter((k) => nycklar.has(k));
      const miss = Object.keys(j.texter).filter((k) => !nycklar.has(k));
      console.log(`  ▫️ ${j.namn}: ${traff.length} nycklar matchar${miss.length ? `, SAKNAS: ${miss.join(', ')}` : ''}`);
      console.log(`      tillgängliga: ${[...nycklar].slice(0, 12).join(', ')}${nycklar.size > 12 ? ` … (${nycklar.size})` : ''}`);
      continue;
    }
    const r = await registrera(j.id, locale, j.texter);
    totalt += r.antal;
    if (r.saknade.length > 0) allaSaknade.push(`${j.namn}: ${r.saknade.join(', ')}`);
    console.log(`  ✅ ${j.namn}: ${r.antal} rader`);
  }

  if (!torr) {
    console.log(`\n✅ ${totalt} översättningar registrerade på ${locale}.`);
    if (allaSaknade.length > 0) {
      console.log('\n⚠️ Nycklar som inte fanns på resursen (översattes INTE):');
      for (const s of allaSaknade) console.log(`   • ${s}`);
    }
    console.log('\n⚠️ Tema-raderna är bundna till det här tema-id:t. Klonas temat måste de spelas upp igen.');
  }
}
