// marknad.mjs — marknaderna i butikskonfigen (`butik.marknader`) + deras språk.
//
//   node factory/marknad.mjs factory/butiker/<butik>.yaml
//
// SE + NO är standard i varje OPS (Axels beslut 2026-09-08). Steget fanns
// inte i fabriken — HeimGuards Norge-uppsättning gjordes för hand i en
// session och lämnade ingen kod efter sig. Det här är den koden.
//
// Gör tre saker, i den ordningen:
//   1. aktiverar marknadens locale (shopLocaleEnable) och publicerar den
//   2. skapar marknaden med rätt region, om den inte redan finns
//   3. lägger locale:n som alternateLocale på HUVUDDOMÄNENS webPresence
//      (webPresenceUpdate — INTE market-varianten, PROCESS.md fas 4 steg 13)
//
// Rör aldrig valutan: NOK slås på i admin, det är API-spärrat i unified markets.
// Översättningarna registreras separat (factory/oversatt.mjs).

import { readFileSync } from 'node:fs';
import { laddaEnv } from './env.mjs';
import { lasYaml } from './yaml.mjs';
import { graphql } from './shopify.mjs';

export async function lasLage() {
  // ⚠️ webPresences läses på ROTNIVÅ, inte via markets{ webPresences }.
  // Market-fältet svarade tom lista på en butik som ändå hade en
  // MarketWebPresence (mätt 2026-09-09 på DryTrek) — hade vi litat på det
  // hade språket aldrig hakats på domänen och /nb inte funnits för kunden.
  const d = await graphql(`query opsFactoryMarknadLage {
    shopLocales { locale name primary published }
    markets(first: 20) { nodes { id name handle status } }
    webPresences(first: 20) {
      nodes { id defaultLocale { locale } alternateLocales { locale } }
    }
  }`);
  return d;
}

export async function aktiveraLocale(locale) {
  const finns = (await graphql(`query { shopLocales { locale published } }`)).shopLocales ?? [];
  const traff = finns.find((l) => l.locale === locale);
  if (traff?.published) return { locale, redan: true };

  if (!traff) {
    const d = await graphql(
      `mutation opsFactoryLocale($locale: String!) {
        shopLocaleEnable(locale: $locale) {
          shopLocale { locale published }
          userErrors { field message }
        }
      }`,
      { locale }
    );
    const fel = d.shopLocaleEnable?.userErrors ?? [];
    if (fel.length > 0) throw new Error(`Locale ${locale}: ${fel.map((f) => f.message).join('; ')}`);
  }

  const p = await graphql(
    `mutation opsFactoryLocalePublicera($locale: String!, $shopLocale: ShopLocaleInput!) {
      shopLocaleUpdate(locale: $locale, shopLocale: $shopLocale) {
        shopLocale { locale published }
        userErrors { field message }
      }
    }`,
    { locale, shopLocale: { published: true } }
  );
  const pfel = p.shopLocaleUpdate?.userErrors ?? [];
  if (pfel.length > 0) throw new Error(`Publicera ${locale}: ${pfel.map((f) => f.message).join('; ')}`);
  return { locale, redan: false };
}

export async function sakerstallMarknad(namn, handle, landskod) {
  const lage = await lasLage();
  const traff = (lage.markets?.nodes ?? []).find(
    (m) => m.handle === handle || m.name.toLowerCase() === namn.toLowerCase()
  );
  if (traff) return { id: traff.id, namn: traff.name, ny: false };

  const d = await graphql(
    `mutation opsFactoryMarknadSkapa($input: MarketCreateInput!) {
      marketCreate(input: $input) {
        market { id name handle status }
        userErrors { field message }
      }
    }`,
    { input: { name: namn, handle, conditions: { regionsCondition: { regions: [{ countryCode: landskod }] } } } }
  );
  const fel = d.marketCreate?.userErrors ?? [];
  if (fel.length > 0) throw new Error(`Marknaden ${namn}: ${fel.map((f) => f.message).join('; ')}`);
  return { id: d.marketCreate.market.id, namn: d.marketCreate.market.name, ny: true };
}

// marketCreate ger status DRAFT. En marknad i DRAFT tar inte emot kunder —
// den måste aktiveras, annars finns Norge bara i adminen.
export async function aktiveraMarknad(id) {
  const d = await graphql(
    `mutation opsFactoryMarknadAktivera($id: ID!, $input: MarketUpdateInput!) {
      marketUpdate(id: $id, input: $input) {
        market { id name status }
        userErrors { field message }
      }
    }`,
    { id, input: { enabled: true } }
  );
  const fel = d.marketUpdate?.userErrors ?? [];
  if (fel.length > 0) throw new Error(`Aktivera marknaden: ${fel.map((f) => f.message).join('; ')}`);
  return d.marketUpdate.market;
}

// Locale:n måste ligga som alternateLocale på huvuddomänens webPresence,
// annars finns ingen /nb-väg för kunden att hamna på.
export async function laggTillAlternateLocale(locale) {
  const lage = await lasLage();
  const presences = lage.webPresences?.nodes ?? [];
  if (presences.length === 0) {
    return { manuell: 'Butiken har ingen webPresence att haka språket på ännu.' };
  }
  const resultat = [];
  for (const wp of presences) {
    const nuvarande = (wp.alternateLocales ?? []).map((l) => l.locale);
    if (nuvarande.includes(locale) || wp.defaultLocale?.locale === locale) {
      resultat.push({ id: wp.id, redan: true });
      continue;
    }
    const d = await graphql(
      // Argumenten heter id + input (INTE webPresenceId/webPresence, mätt
      // 2026-09-09 mot Admin-API 2025-07).
      `mutation opsFactoryWebPresence($id: ID!, $input: WebPresenceUpdateInput!) {
        webPresenceUpdate(id: $id, input: $input) {
          webPresence { id alternateLocales { locale } }
          userErrors { field message }
        }
      }`,
      { id: wp.id, input: { alternateLocales: [...nuvarande, locale] } }
    );
    const fel = d.webPresenceUpdate?.userErrors ?? [];
    if (fel.length > 0) throw new Error(`webPresence ${wp.id}: ${fel.map((f) => f.message).join('; ')}`);
    resultat.push({ id: wp.id, redan: false });
  }
  return { presences: resultat };
}

const LANDNAMN = { NO: 'Norge', DK: 'Danmark', FI: 'Finland', SE: 'Sverige', GB: 'Storbritannien' };

// Webbnärvaron måste KOPPLAS till marknaden, annars är /nb bara ett språk på
// Sveriges domän: norsk text, svenska priser, kassa i SEK (mätt 2026-09-10
// på DryTrek efter en dag med live norska annonser). Med närvaron kopplad
// väljer Shopify NOK på norsk IP; huvudmarknaden förblir default för andra.
export async function kopplaPresence(marketId) {
  const lage = await lasLage();
  const ids = (lage.webPresences?.nodes ?? []).map((w) => w.id);
  if (ids.length === 0) return { manuell: 'Ingen webPresence att koppla ännu.' };
  const d = await graphql(
    `mutation opsFactoryMarknadPresence($id: ID!, $input: MarketUpdateInput!) {
      marketUpdate(id: $id, input: $input) {
        market { id webPresences(first: 10) { nodes { id domain { host } } } }
        userErrors { field message }
      }
    }`,
    { id: marketId, input: { webPresencesToAdd: ids } }
  );
  const fel = d.marketUpdate?.userErrors ?? [];
  // "already" = redan kopplad — det är rätt läge, inte ett fel.
  if (fel.length > 0 && !fel.every((f) => /already/i.test(f.message))) {
    throw new Error(`Koppla webPresence: ${fel.map((f) => f.message).join('; ')}`);
  }
  return { hosts: (d.marketUpdate?.market?.webPresences?.nodes ?? []).map((w) => w.domain?.host ?? w.id) };
}

if (process.argv[1] && process.argv[1].endsWith('marknad.mjs')) {
  laddaEnv();
  const fil = process.argv[2];
  if (!fil) throw new Error('Ange butiksfil: node factory/marknad.mjs factory/butiker/<butik>.yaml');
  const butik = lasYaml(readFileSync(fil, 'utf8'));

  const fore = await lasLage();
  console.log('Språk före:', fore.shopLocales.map((l) => `${l.locale}${l.primary ? ' (primärt)' : ''}${l.published ? '' : ' (opublicerat)'}`).join(', '));
  console.log('Marknader före:', fore.markets.nodes.map((m) => `${m.name} [${m.handle}] ${m.status}`).join(', '));

  for (const m of butik.butik.marknader ?? []) {
    const namn = LANDNAMN[m.land] ?? m.land;
    console.log(`\n▫️ ${namn} (${m.land}), locale ${m.locale}`);
    const l = await aktiveraLocale(m.locale);
    console.log(`   ${l.redan ? '⏭ ' : '✅'} locale ${m.locale} publicerad`);
    const mk = await sakerstallMarknad(namn, m.land.toLowerCase(), m.land);
    console.log(`   ${mk.ny ? '✅' : '⏭ '} marknad ${mk.namn}`);
    const aktiv = await aktiveraMarknad(mk.id);
    console.log(`   ✅ marknad ${aktiv.name} är ${aktiv.status}`);
    const wp = await laggTillAlternateLocale(m.locale);
    if (wp.manuell) console.log(`   🖐 ${wp.manuell}`);
    else console.log(`   ✅ ${m.locale} som alternateLocale på ${wp.presences.length} webPresence(r)`);
    const kp = await kopplaPresence(mk.id);
    if (kp.manuell) console.log(`   🖐 ${kp.manuell}`);
    else console.log(`   ✅ marknaden kopplad till webbnärvaron: ${kp.hosts.join(', ')}`);
  }

  const efter = await lasLage();
  console.log('\nSpråk efter:', efter.shopLocales.map((l) => `${l.locale}${l.primary ? ' (primärt)' : ''}`).join(', '));
  console.log('Marknader efter:', efter.markets.nodes.map((m) => `${m.name} [${m.handle}] ${m.status}`).join(', '));
}
