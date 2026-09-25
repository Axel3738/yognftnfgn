// Produktdatan till Klaviyo-mejlen: pris, jämförpris, bild och länk per handle.
//
// Live: brandets Shopify-modul (Bäverbutiken: mejl/shopify.mjs →
// hamtaProdukter(), samma data som notismejlen). Varje lyckad hämtning sparas
// i klaviyo/output/<brand>/produkter.json (gitignorerad), och `offline` läser
// den. Saknas cachen faller den tillbaka på mejl/produkter.json (committad av
// /mejl), med en varning om hur gammal datan kan vara.
//
// Priset i mejlet kommer ALLTID härifrån, aldrig ur copyn (ARKITEKTUR
// järnregel 6). En offline-körning säger därför i klartext att priserna är
// cachade.

import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { ROT } from './mallar.mjs';

export function cacheSokvag(brandId, rot = ROT) {
  return join(rot, 'klaviyo', 'output', brandId, 'produkter.json');
}

const RESERV = (rot) => join(rot, 'mejl', 'produkter.json');

function lasJson(fil) {
  return JSON.parse(readFileSync(fil, 'utf8'));
}

function datumFor(fil) {
  try {
    return statSync(fil).mtime.toISOString().slice(0, 16).replace('T', ' ');
  } catch {
    return 'okänt datum';
  }
}

// → { produkter, kalla: 'live'|'cache'|'reserv', varningar: [] }
export async function hamtaProdukterCache({ brand, offline = false, rot = ROT, hamta = null } = {}) {
  const id = typeof brand === 'string' ? brand : brand.id;
  const cache = cacheSokvag(id, rot);
  const varningar = [];
  if (!offline) {
    try {
      let f = hamta;
      if (!f) {
        const modul = (typeof brand === 'object' && brand.shopify?.modul) || 'mejl/shopify.mjs';
        f = (await import(join(rot, modul))).hamtaProdukter;
      }
      const produkter = await f();
      if (!Array.isArray(produkter) || !produkter.length) throw new Error('Shopify gav inga produkter');
      mkdirSync(dirname(cache), { recursive: true });
      writeFileSync(cache, JSON.stringify(produkter, null, 1) + '\n');
      return { produkter, kalla: 'live', varningar };
    } catch (e) {
      varningar.push(`Shopify gick inte att läsa (${e.message}), cachade priser används.`);
    }
  }
  if (existsSync(cache)) {
    varningar.push(`Produktdatan är cachad (${datumFor(cache)}), inte läst live ur Shopify.`);
    return { produkter: lasJson(cache), kalla: 'cache', varningar };
  }
  const reserv = RESERV(rot);
  if (existsSync(reserv)) {
    varningar.push(`Produktdatan kommer ur mejl/produkter.json (${datumFor(reserv)}), inte live ur Shopify. Kontrollera priserna före utskick.`);
    return { produkter: lasJson(reserv), kalla: 'reserv', varningar };
  }
  throw new Error(`Ingen produktdata: Shopify gick inte att läsa och varken ${cache} eller mejl/produkter.json finns.`);
}
