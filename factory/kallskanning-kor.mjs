// kallskanning-kor.mjs — kör källskanningen mot ALLA filer i butikens teman.
//
//   node factory/kallskanning-kor.mjs [--tema utkast|alla] [--json]
//
// `kallskanning.mjs` är ren logik utan nätverk. Det här är körningen: den
// hämtar varje temafil ur Shopify och skannar den. Listan KANDA_SMITTADE är
// var man börjar leta, inte var man slutar — därför läses ALLA filer.
//
// Regeln: ingen butik lämnas för publicering förrän rapporten är tom.

import { laddaEnv } from './env.mjs';
import { graphql } from './shopify.mjs';
import { skannaTema, rapport, KANDA_SMITTADE } from './kallskanning.mjs';

// Binärfiler och tredjepartsbibliotek skannas inte — en träff där är ändå
// inget vi kan skriva om, och de dränker rapporten i brus.
const HOPPA_OVER = /\.(png|jpg|jpeg|gif|webp|svg|woff2?|eot|ttf|mp4|ico)$/i;

export async function hamtaAllaTemafiler(temaId) {
  const filer = {};
  let cursor = null;
  for (;;) {
    const d = await graphql(
      `query opsFactoryAllaFiler($id: ID!, $cursor: String) {
        theme(id: $id) {
          files(first: 50, after: $cursor) {
            nodes {
              filename
              body { ... on OnlineStoreThemeFileBodyText { content } }
            }
            pageInfo { hasNextPage endCursor }
          }
        }
      }`,
      { id: temaId, cursor }
    );
    for (const n of d.theme?.files?.nodes ?? []) {
      if (HOPPA_OVER.test(n.filename)) continue;
      if (typeof n.body?.content === 'string') filer[n.filename] = n.body.content;
    }
    const info = d.theme?.files?.pageInfo;
    if (!info?.hasNextPage) break;
    cursor = info.endCursor;
  }
  return filer;
}

if (process.argv[1] && process.argv[1].endsWith('kallskanning-kor.mjs')) {
  laddaEnv();
  const arg = process.argv.slice(2);
  const alla = arg.includes('--alla') || (arg.includes('--tema') && arg[arg.indexOf('--tema') + 1] === 'alla');
  const somJson = arg.includes('--json');

  const t = await graphql(`query { themes(first: 20) { nodes { id name role } } }`);
  const teman = alla
    ? t.themes.nodes
    : t.themes.nodes.filter((x) => /\bcro\b/i.test(x.name)).slice(0, 1);
  if (teman.length === 0) throw new Error('Inget tema att skanna.');

  let totaltTraffar = 0;
  const allt = [];
  for (const tema of teman) {
    const filer = await hamtaAllaTemafiler(tema.id);
    const res = skannaTema(filer);
    totaltTraffar += res.traffar.length;
    allt.push({ tema: tema.name, roll: tema.role, ...res, antalFiler: Object.keys(filer).length });

    if (!somJson) {
      console.log(`\n━━━ ${tema.name} (${tema.role}) — ${Object.keys(filer).length} filer skannade ━━━`);
      console.log(rapport(res));
      // Redovisa alltid att de kända smittade faktiskt lästes — annars går
      // det inte att skilja "ren" från "aldrig hämtad".
      const lasta = KANDA_SMITTADE.filter((f) => f in filer);
      const saknade = KANDA_SMITTADE.filter((f) => !(f in filer));
      console.log(`\n  kända smittade filer lästa: ${lasta.join(', ') || '(inga)'}`);
      if (saknade.length > 0) console.log(`  ⚠️ fanns inte i temat: ${saknade.join(', ')}`);
    }
  }

  if (somJson) console.log(JSON.stringify(allt, null, 2));
  process.exit(totaltTraffar === 0 ? 0 : 1);
}
