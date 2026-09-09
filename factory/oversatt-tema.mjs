// oversatt-tema.mjs — översätter en tema-JSON-mall genom att MATCHA VÄRDEN,
// inte gissa nycklar.
//
//   node factory/oversatt-tema.mjs <butik-id> <mall> --locale nb [--torr]
//
// Varför värdematchning: nycklarna i en tema-mall ser ut som
// `section.index.json.hero.h.heading:19i18qlqd4da3` — sektions-id, block-id
// och en hash. De ändras när mallen byggs om, och en handskriven nyckellista
// blir fel utan att någon märker det. Men VÄRDET på svenska sidan är exakt
// den sträng fabriken själv skrev in. Så: bygg en tabell svensk sträng →
// norsk sträng ur startsidor/<butik>.json, läs temats översättningsbara
// innehåll, och para ihop på värdet.
//
// Strängar som inte matchar rapporteras — de är antingen bild-URL:er och
// länkar (ska inte översättas) eller något fabriken glömt skriva om.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { laddaEnv } from './env.mjs';
import { graphql } from './shopify.mjs';
import { hamtaOversattbart, temaResurser } from './oversatt.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));

// Alla strängpar (svenska → målspråk) som finns i copy-blocken.
export function byggPar(sv, mal) {
  const par = new Map();
  const lagg = (a, b) => {
    if (typeof a === 'string' && typeof b === 'string' && a.trim() !== '') par.set(a, b);
  };
  for (const nyckel of Object.keys(sv)) {
    const a = sv[nyckel];
    const b = mal[nyckel];
    // FAQ FÖRST — den är också en array, och den generiska array-grenen
    // nedan skulle annars svälja den och para ihop två objekt som strängar.
    if (nyckel === 'faq' && Array.isArray(a)) {
      a.forEach((f, i) => {
        lagg(f.fraga, b?.[i]?.fraga);
        lagg(f.svar, b?.[i]?.svar);
      });
    } else if (Array.isArray(a) && Array.isArray(b)) {
      // Listor hamnar både som hel sträng ("a|b|c") och som enskilda poster.
      lagg(a.join('|'), b.join('|'));
      a.forEach((x, i) => lagg(x, b[i]));
      // usp-posterna bär ett ikonprefix som inte ska översättas.
      a.forEach((x, i) => {
        const [, svText] = String(x).split(/:(.+)/);
        const [, malText] = String(b[i] ?? '').split(/:(.+)/);
        lagg(svText, malText);
      });
    } else {
      lagg(a, b);
    }
  }
  return par;
}

export async function oversattResurs(resursId, locale, par, { torr = false } = {}) {
  const innehall = await hamtaOversattbart(resursId);
  const rader = [];
  const omatchade = [];
  for (const c of innehall) {
    const varde = String(c.value ?? '');
    if (par.has(varde)) {
      rader.push({ key: c.key, locale, value: par.get(varde), translatableContentDigest: c.digest });
    } else if (varde.trim() !== '') {
      omatchade.push({ key: c.key, varde: varde.slice(0, 70) });
    }
  }
  if (torr || rader.length === 0) return { antal: rader.length, omatchade, rader };

  const d = await graphql(
    `mutation opsFactoryTemaOversatt($resourceId: ID!, $translations: [TranslationInput!]!) {
      translationsRegister(resourceId: $resourceId, translations: $translations) {
        translations { key }
        userErrors { field message }
      }
    }`,
    { resourceId: resursId, translations: rader }
  );
  const fel = d.translationsRegister?.userErrors ?? [];
  if (fel.length > 0) throw new Error(`${resursId}: ${fel.map((f) => f.message).join('; ')}`);
  return { antal: d.translationsRegister.translations.length, omatchade, rader };
}

if (process.argv[1] && process.argv[1].endsWith('oversatt-tema.mjs')) {
  laddaEnv();
  const arg = process.argv.slice(2);
  const [butikId, mall] = arg.filter((a) => !a.startsWith('--'));
  const locale = arg.includes('--locale') ? arg[arg.indexOf('--locale') + 1] : 'nb';
  const torr = arg.includes('--torr');
  if (!butikId || !mall) throw new Error('Användning: node factory/oversatt-tema.mjs <butik-id> <mall> [--locale nb] [--torr]');

  const konf = JSON.parse(readFileSync(join(ROT, 'startsidor', `${butikId}.json`), 'utf8'));
  const mal = konf[`${locale}_ratext`] ?? konf[locale];
  if (!mal) throw new Error(`startsidor/${butikId}.json saknar "${locale}_ratext" eller "${locale}".`);
  const par = byggPar(konf.sv, mal);
  console.log(`${par.size} strängpar sv → ${locale}`);

  const teman = await graphql(`query { themes(first: 20) { nodes { id name role } } }`);
  const tema = teman.themes.nodes.find((t) => t.role === 'UNPUBLISHED');
  if (!tema) throw new Error('Inget utkasttema.');
  const resurs = temaResurser(tema.id, { mallar: [mall], grupper: [] })[0];

  const r = await oversattResurs(resurs.id, locale, par, { torr });
  console.log(`${torr ? '(torrt) ' : ''}${r.antal} rader ${torr ? 'skulle registreras' : 'registrerade'} på ${locale}`);
  if (r.omatchade.length > 0) {
    console.log(`\n${r.omatchade.length} värden utan översättning (bild-URL:er och länkar är väntade):`);
    for (const o of r.omatchade) console.log(`   ${o.key.split(':')[0].replace(`section.${mall}.json.`, '')} = ${o.varde}`);
  }
}
