// landningssida.mjs — vilken länk en Bäverbutiks-annons får peka på. Ren
// räkning, inga API-anrop, så spärrarna går att testa utan nät.
//
// Byggd 2026-10-03 när hubben Fish rod holder skulle upp i Fiskespöhållaren:
// briefernas "Destination: https://tacklebay.se/…" hade annars kunnat klistras
// in som --lank. En annons i MagiBorsten som pekar på en annan butik bokför
// köpen på fel pixel, och det syns aldrig som ett felmeddelande.

import { prefixAv } from './kampanjval.mjs';

/** Värdarna en annons i MagiBorsten får länka till. */
export const TILLATNA_VARDAR = new Set(['baverbutiken.se', 'www.baverbutiken.se']);

/** true om länken är en http(s)-URL på Bäverbutikens domän. */
export function lankTillaten(url) {
  let u;
  try { u = new URL(String(url ?? '')); } catch { return false; }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return false;
  return TILLATNA_VARDAR.has(u.hostname.toLowerCase());
}

/** Samma sida? Jämför värd utan www och sökväg utan avslutande snedstreck.
 *  Frågesträngen räknas inte (?variant=, utm-taggar pekar på samma sida). */
export function sammaSida(a, b) {
  try {
    const [x, y] = [new URL(a), new URL(b)];
    const vard = (u) => u.hostname.toLowerCase().replace(/^www\./, '');
    const vag = (u) => u.pathname.replace(/\/+$/, '').toLowerCase();
    return vard(x) === vard(y) && vag(x) === vag(y);
  } catch { return false; }
}

/**
 * Länken för en uppladdning: `--lank` mot prefixets alias i prefix-alias.json.
 *   - aliaset bär `landningssida` och --lank saknas ⇒ aliasets länk
 *   - aliaset bär `landningssida` och --lank är en annan sida ⇒ fel
 *   - annars --lank som den är (null om den saknas)
 * Returnerar { lank, kalla, fel? }. Domänspärren körs separat (lankTillaten).
 */
export function valjLank({ namn, lank = null, alias = {} } = {}) {
  const pfx = prefixAv(namn);
  const tvingad = pfx ? alias[pfx]?.landningssida ?? null : null;
  if (!tvingad) return { lank: lank || null, kalla: lank ? '--lank' : null };
  if (!lank) return { lank: tvingad, kalla: 'prefix-alias.json' };
  if (sammaSida(lank, tvingad)) return { lank, kalla: '--lank' };
  return {
    lank: null, kalla: null,
    fel: `"${namn}" har tvingad landningssida i products/prefix-alias.json (${pfx}): ${tvingad}\n`
       + `   men --lank är en annan sida: ${lank}\n`
       + `   Briefens länk gäller inte för det här prefixet. Kör utan --lank eller med aliasets länk.`,
  };
}
