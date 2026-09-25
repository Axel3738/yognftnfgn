// Produktdatan till Klaviyo-mejlen: pris, jämförpris, bild och länk per handle.
//
// Live: brandets Shopify-modul (`brand.shopify.modul`, standard mejl/shopify.mjs
// för Bäverbutiken; klaviyo/shopify-butik.mjs för butiker i sparning/butiker.json,
// t.ex. Matstrumpor). Modulens hamtaProdukter() får hela `brand.shopify` som
// argument, så den kan bära butikens id. Varje lyckad hämtning sparas i
// klaviyo/output/<brand>/produkter.json (gitignorerad), och `offline` läser den.
//
// Reservfilen (`brand.shopify.reserv`, Bäverbutiken: mejl/produkter.json,
// committad av /mejl) används BARA för det brand den hör till. Ett annat brand
// utan cache stannar med fel i stället för att bygga mejl med fel butiks
// produkter (järnregel 8: butiker blandas aldrig).
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

/** Reservfilen för ett brand, eller null. Bäverbutiken har mejl/produkter.json; andra bara det brandfilen säger. */
export function reservSokvag(brand, rot = ROT) {
  const id = typeof brand === 'string' ? brand : brand?.id;
  const egen = typeof brand === 'object' ? brand?.shopify?.reserv : null;
  const fil = egen ?? (id === 'baverbutiken' ? 'mejl/produkter.json' : null);
  return fil ? join(rot, fil) : null;
}

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
      const produkter = await f(typeof brand === 'object' ? { ...(brand.shopify ?? {}) } : {});
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
  const reserv = reservSokvag(brand, rot);
  if (reserv && existsSync(reserv)) {
    varningar.push(`Produktdatan kommer ur ${reserv.slice(rot.length + 1)} (${datumFor(reserv)}), inte live ur Shopify. Kontrollera priserna före utskick.`);
    return { produkter: lasJson(reserv), kalla: 'reserv', varningar };
  }
  throw new Error(`Ingen produktdata för ${id}: Shopify gick inte att läsa, ${cache} finns inte${reserv ? ` och inte ${reserv}` : ', och brandet har ingen reservfil'}. Butiker blandas aldrig, så ett annat brands produkter används inte.`);
}
