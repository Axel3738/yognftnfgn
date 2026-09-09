// filer.mjs — lägger bilder i butikens filarkiv (Innehåll → Filer).
//
// Temats bildinställningar (hero, image-with-text, multicolumn) pekar på
// `shopify://shop_images/<filnamn>`. Produktens media räcker alltså inte —
// en bild som bara ligger på produkten går inte att välja i en tema-sektion.
// Utan det här steget får startsidan tomma bildrutor.
//
//   node factory/filer.mjs <url> [<url> ...]
//
// Idempotent på filnamn: samma namn laddas inte upp två gånger.

import { laddaEnv } from './env.mjs';
import { graphql } from './shopify.mjs';

const sov = (ms) => new Promise((r) => setTimeout(r, ms));

export function filnamnUrUrl(url) {
  return String(url).split('?')[0].split('/').pop();
}

export async function befintligaFiler() {
  const karta = new Map();
  let cursor = null;
  for (;;) {
    const d = await graphql(
      `query opsFactoryFiler($cursor: String) {
        files(first: 250, after: $cursor) {
          nodes { id alt ... on MediaImage { image { url } } }
          pageInfo { hasNextPage endCursor }
        }
      }`,
      { cursor }
    );
    for (const n of d.files?.nodes ?? []) {
      const url = n.image?.url;
      if (url) karta.set(filnamnUrUrl(url), { id: n.id, url });
    }
    if (!d.files?.pageInfo?.hasNextPage) break;
    cursor = d.files.pageInfo.endCursor;
  }
  return karta;
}

export async function laddaUppFiler(urlar, { alt = {} } = {}) {
  const redan = await befintligaFiler();
  const nya = urlar.filter((u) => !redan.has(filnamnUrUrl(u)));

  if (nya.length > 0) {
    const d = await graphql(
      `mutation opsFactoryFilSkapa($files: [FileCreateInput!]!) {
        fileCreate(files: $files) {
          files { id fileStatus alt ... on MediaImage { image { url } } }
          userErrors { field message }
        }
      }`,
      {
        files: nya.map((u) => ({
          originalSource: u,
          contentType: 'IMAGE',
          alt: alt[filnamnUrUrl(u)] ?? '',
        })),
      }
    );
    const fel = d.fileCreate?.userErrors ?? [];
    if (fel.length > 0) throw new Error(`Filuppladdningen: ${fel.map((f) => f.message).join('; ')}`);

    // fileCreate svarar innan Shopify hunnit bearbeta bilden. Utan den här
    // väntan saknar filen url och sektionerna får tomma bildrutor.
    for (let forsok = 0; forsok < 30; forsok++) {
      await sov(2000);
      const karta = await befintligaFiler();
      if (nya.every((u) => karta.has(filnamnUrUrl(u)))) break;
    }
  }

  // ⚠️ HANDLEN MÅSTE HÄRLEDAS UR DET LAGRADE FILNAMNET, aldrig ur käll-URL:en.
  // Finns namnet redan i butiken lägger Shopify på ett UUID:
  // benskydd-benskydd-08.jpg blir benskydd-benskydd-08_3ecbd654-….jpg. Det
  // händer garanterat i en OPS-butik, för produktbilderna laddas upp från
  // SAMMA käll-URL:er innan startsidan byggs.
  //
  // Mätt 2026-09-09 på DryTrek: alla fem startsidesbilder pekade på
  // shopify://shop_images/<namn utan uuid> — filer som inte fanns. Hero,
  // galleriet och trygghetsbilden renderade temats placeholder, och det såg
  // ut som "Shopifys default-illustration" i kundvyn.
  const slutlig = await befintligaFiler();
  const lagrade = [...slutlig.keys()];
  return Object.fromEntries(
    urlar.map((u) => {
      const namn = filnamnUrUrl(u);
      const bas = namn.replace(/\.[^.]+$/, '');
      // Exakt träff först, annars den UUID-suffixade varianten.
      const traff =
        lagrade.find((n) => n.replace(/\.[^.]+$/, '') === bas) ??
        lagrade.find((n) => n.startsWith(`${bas}_`));
      // ⚠️ FILÄNDELSEN SKA VARA KVAR. Shopify resolvar
      // shopify://shop_images/<filnamn MED ändelse>. Utan den hittar temat
      // ingen bild och Dawn renderar sin placeholder-svg — mätt 2026-09-09
      // på DryTrek, där hero, galleri och trygghetsbild alla var tomma i
      // kundvyn trots att filerna fanns. Bas-temats egna värden bär ändelsen
      // ("shopify://shop_images/…-2026-03-19T120925.579.png").
      return [namn, traff ? `shopify://shop_images/${traff}` : null];
    })
  );
}

if (process.argv[1] && process.argv[1].endsWith('filer.mjs')) {
  laddaEnv();
  const urlar = process.argv.slice(2);
  if (urlar.length === 0) throw new Error('Ange en eller flera bild-URL:er.');
  const karta = await laddaUppFiler(urlar);
  for (const [namn, handle] of Object.entries(karta)) {
    console.log(`${handle ? '✅' : '❌'} ${namn} → ${handle ?? 'kom inte upp'}`);
  }
}
