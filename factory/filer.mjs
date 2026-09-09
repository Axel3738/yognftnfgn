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

  const slutlig = await befintligaFiler();
  return Object.fromEntries(
    urlar.map((u) => {
      const namn = filnamnUrUrl(u);
      return [namn, slutlig.has(namn) ? `shopify://shop_images/${namn.replace(/\.[^.]+$/, '')}` : null];
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
