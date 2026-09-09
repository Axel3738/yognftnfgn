// Marknaderna: Norge + locale nb, och översättningarna dit.
//
//   node factory/marknad.mjs <butik.yaml> [--dry]
//
// SE + NO är standard i varje OPS (Axels beslut 2026-09-08).
//
// Vad API:t KAN: skapa marknad, lägga till region, aktivera och publicera en
// locale, lägga nb som alternateLocale på webPresence, registrera
// översättningar.
// Vad API:t INTE kan: byta butikens PRIMÄRSPRÅK och slå på NOK. Båda är
// klick i adminen och står i VA:ns checklista.
//
// ⚠️ Tema-översättningar är knutna till TEMA-ID. Klonas temat måste raderna
// registreras om — nycklar och digests är stabila mellan kloner.

import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { lasYaml } from './yaml.mjs';
import { laddaEnv } from './env.mjs';
import { graphql } from './shopify.mjs';

export async function hamtaLage() {
  const data = await graphql(`
    query opsFactoryMarknadslage {
      shopLocales(published: false) { locale name primary published }
      markets(first: 20) { nodes { id name handle status } }
    }`);
  return data;
}

export async function sakerstallLocale(locale) {
  const lage = await hamtaLage();
  const finns = lage.shopLocales.find((l) => l.locale === locale);
  if (finns) {
    if (finns.published || finns.primary) return { locale, skapad: false, publicerad: true };
    await publiceraLocale(locale);
    return { locale, skapad: false, publicerad: true };
  }
  const data = await graphql(
    `mutation opsFactoryLocale($locale: String!) {
      shopLocaleEnable(locale: $locale) {
        shopLocale { locale name primary published }
        userErrors { field message }
      }
    }`,
    { locale }
  );
  const fel = data.shopLocaleEnable?.userErrors ?? [];
  if (fel.length > 0) throw new Error(`Locale ${locale}: ${fel.map((f) => f.message).join('; ')}`);
  await publiceraLocale(locale);
  return { locale, skapad: true, publicerad: true };
}

async function publiceraLocale(locale) {
  const data = await graphql(
    `mutation opsFactoryLocalePublicera($locale: String!, $shopLocale: ShopLocaleInput!) {
      shopLocaleUpdate(locale: $locale, shopLocale: $shopLocale) {
        shopLocale { locale published }
        userErrors { field message }
      }
    }`,
    { locale, shopLocale: { published: true } }
  );
  const fel = data.shopLocaleUpdate?.userErrors ?? [];
  if (fel.length > 0) throw new Error(`Publicera ${locale}: ${fel.map((f) => f.message).join('; ')}`);
  return data.shopLocaleUpdate.shopLocale;
}

export async function sakerstallMarknad(namn, landskod) {
  const lage = await hamtaLage();
  const finns = lage.markets.nodes.find(
    (mk) => mk.handle === landskod.toLowerCase() || mk.name.toLowerCase() === namn.toLowerCase()
  );
  if (finns) return { id: finns.id, namn: finns.name, skapad: false };

  const data = await graphql(
    `mutation opsFactoryMarknad($input: MarketCreateInput!) {
      marketCreate(input: $input) {
        market { id name handle status }
        userErrors { field message }
      }
    }`,
    {
      input: {
        name: namn,
        handle: landskod.toLowerCase(),
        status: 'ACTIVE',
        regions: [{ countryCode: landskod.toUpperCase() }],
      },
    }
  );
  const fel = data.marketCreate?.userErrors ?? [];
  if (fel.length > 0) throw new Error(`Marknad ${namn}: ${fel.map((f) => f.message).join('; ')}`);
  const mk = data.marketCreate.market;
  return { id: mk.id, namn: mk.name, skapad: true };
}

// nb som alternativt språk på HUVUDDOMÄNENS webPresence — inte på marknadens
// egen (PROCESS.md fas 4 steg 13: webPresenceUpdate, INTE market-varianten).
export async function laggTillAlternateLocale(locale) {
  const data = await graphql(`
    query opsFactoryWebPresence {
      shop { id }
      webPresences(first: 5) {
        nodes { id defaultLocale { locale } alternateLocales { locale } domain { host } }
      }
    }`);
  const wp = data.webPresences?.nodes?.[0];
  if (!wp) return { manuell: 'Ingen webPresence hittades.' };
  const har = (wp.alternateLocales ?? []).map((l) => l.locale);
  if (har.includes(locale)) return { id: wp.id, orord: true, alternateLocales: har };

  const nya = [...har, locale];
  const uppd = await graphql(
    // Argumentet heter `input` i 2025-07, inte `webPresence` (mätt 2026-09-09).
    `mutation opsFactoryWebPresence($id: ID!, $input: WebPresenceUpdateInput!) {
      webPresenceUpdate(id: $id, input: $input) {
        webPresence { id alternateLocales { locale } }
        userErrors { field message }
      }
    }`,
    { id: wp.id, input: { alternateLocales: nya } }
  );
  const fel = uppd.webPresenceUpdate?.userErrors ?? [];
  if (fel.length > 0) throw new Error(`webPresence: ${fel.map((f) => f.message).join('; ')}`);
  return { id: wp.id, orord: false, alternateLocales: nya };
}

// --- Översättningar --------------------------------------------------------

// Shopify kräver att varje översättning bär källans `digest` — den bevisar
// vilken källtext raden översätter. Ändras källan blir digesten ogiltig och
// raden markeras "outdated" i stället för att tyst visa fel text.
export async function hamtaOversattbara(resourceId) {
  const data = await graphql(
    `query opsFactoryOversattbar($id: ID!) {
      translatableResource(resourceId: $id) {
        resourceId
        translatableContent { key value digest locale }
      }
    }`,
    { id: resourceId }
  );
  return data.translatableResource?.translatableContent ?? [];
}

export async function registrera(resourceId, locale, rader) {
  if (rader.length === 0) return { antal: 0 };
  const data = await graphql(
    `mutation opsFactoryOversatt($resourceId: ID!, $translations: [TranslationInput!]!) {
      translationsRegister(resourceId: $resourceId, translations: $translations) {
        translations { key value }
        userErrors { field message }
      }
    }`,
    {
      resourceId,
      translations: rader.map((r) => ({
        key: r.key,
        value: r.value,
        locale,
        translatableContentDigest: r.digest,
      })),
    }
  );
  const fel = data.translationsRegister?.userErrors ?? [];
  if (fel.length > 0) throw new Error(`Översättning ${resourceId}: ${fel.map((f) => f.message).join('; ')}`);
  return { antal: data.translationsRegister.translations.length };
}

// Kopplar en ordlista { nyckel: översättning } mot resursens översättbara
// innehåll. Nycklar som inte finns i resursen hoppas över — tyst, för
// resursens fältuppsättning varierar mellan teman och produkttyper.
export async function oversattResurs(resourceId, locale, ordlista) {
  const innehall = await hamtaOversattbara(resourceId);
  const karta = new Map(innehall.map((c) => [c.key, c]));
  const rader = [];
  const saknade = [];
  for (const [key, value] of Object.entries(ordlista)) {
    const kalla = karta.get(key);
    if (!kalla) {
      saknade.push(key);
      continue;
    }
    rader.push({ key, value, digest: kalla.digest });
  }
  const resultat = await registrera(resourceId, locale, rader);
  return { ...resultat, saknade };
}

async function huvud() {
  laddaEnv();
  const argv = process.argv.slice(2);
  const dry = argv.includes('--dry');
  const butiksfil = argv.find((a) => !a.startsWith('--'));
  if (!butiksfil) {
    console.error('Användning: node factory/marknad.mjs <butik.yaml> [--dry]');
    process.exit(1);
  }
  const butik = lasYaml(readFileSync(butiksfil, 'utf8'));
  const marknader = Array.isArray(butik.butik?.marknader) ? butik.butik.marknader : [];

  const lage = await hamtaLage();
  console.log(`\nMarknader · ${butik.butik.brand}${dry ? ' · DRY' : ''}\n`);
  console.log(`Primärspråk: ${lage.shopLocales.find((l) => l.primary)?.locale ?? '?'}`);
  console.log(`Locales: ${lage.shopLocales.map((l) => `${l.locale}${l.published ? '' : ' (opublicerad)'}`).join(', ')}`);
  console.log(`Marknader: ${lage.markets.nodes.map((mk) => `${mk.name} [${mk.handle}] ${mk.status}`).join(', ')}`);

  if (dry) {
    for (const mk of marknader) console.log(`\nSkulle säkerställa: marknad ${mk.land} + locale ${mk.locale}`);
    console.log('\n✅ Dry — inget skrevs.\n');
    return;
  }

  for (const mk of marknader) {
    const marknad = await sakerstallMarknad(landsnamn(mk.land), mk.land);
    console.log(`✅ Marknad ${marknad.namn} — ${marknad.skapad ? 'skapad' : 'fanns redan'}`);
    const loc = await sakerstallLocale(mk.locale);
    console.log(`✅ Locale ${loc.locale} — ${loc.skapad ? 'aktiverad' : 'fanns redan'}, publicerad`);
    const wp = await laggTillAlternateLocale(mk.locale);
    console.log(
      wp.manuell
        ? `🖐 webPresence: ${wp.manuell}`
        : `✅ webPresence alternateLocales: ${wp.alternateLocales.join(', ')}${wp.orord ? ' (oförändrad)' : ''}`
    );
  }
  console.log('\n🖐 Kvar som klick i adminen: butikens primärspråk och NOK. API:t kan inte sätta dem.\n');
}

const LANDSNAMN = { NO: 'Norge', DK: 'Danmark', FI: 'Finland', SE: 'Sverige', GB: 'Storbritannien' };
const landsnamn = (kod) => LANDSNAMN[String(kod).toUpperCase()] ?? String(kod).toUpperCase();

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  huvud().catch((e) => {
    console.error(`\n❌ ${e.message}\n`);
    process.exit(1);
  });
}
