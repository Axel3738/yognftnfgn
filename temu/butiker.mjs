// Butiksregistret — en sanning för alla fem butiker.
// Läses av ladda-upp.mjs. Ändra HÄR, aldrig på flera ställen.
//
// Varje butik behöver två miljövariabler:
//   SHOPIFY_SHOP_<LAND>   t.ex. baverbutiken.myshopify.com
//   SHOPIFY_TOKEN_<LAND>  Admin API access token (shpat_...)
// Se TOKENS.md för exakt klickväg.

export const API_VERSION = process.env.SHOPIFY_API_VERSION || '2025-10';

/** Avrundar till närmsta heltal som slutar på 9 (349, 789, 1029). */
export function nioSlut(v) {
  return Math.round(v / 10) * 10 - 1;
}

/** Avrundar till närmsta X,90 (29,90 · 67,90). */
export function niotio(v) {
  return +(Math.round(v - 0.9) + 0.9).toFixed(2);
}

/** Avrundar till närmsta X.99 (22.99 · 51.99). */
export function niotinio(v) {
  return +(Math.round(v - 0.99) + 0.99).toFixed(2);
}

export const BUTIKER = {
  se: {
    land: 'Sverige',
    namn: 'bäverbutiken.se',
    valuta: 'SEK',
    vendor: 'Bäverbutiken',
    baver: true,              // 🦫 i garantiblocket
    sprak: 'sv',
    faktor: 1,                // källpriset är redan SEK
    avrunda: (v) => Math.round(v),
    leverans: 'smidig leverans',
    env: 'SE',
  },
  no: {
    land: 'Norge',
    namn: 'grillklinikken.no',
    valuta: 'NOK',
    vendor: 'Grillklinikken',
    baver: false,             // ⚠️ Grillklinikken får ALDRIG bävern
    sprak: 'no',
    faktor: 1.13,
    avrunda: nioSlut,
    leverans: 'smidig levering',
    env: 'NO',
  },
  dk: {
    land: 'Danmark',
    namn: 'bæverbutiken.dk',
    valuta: 'DKK',
    vendor: 'Bæverbutiken',
    baver: true,
    sprak: 'da',
    faktor: 0.74,
    avrunda: nioSlut,
    leverans: 'smidig levering',
    env: 'DK',
  },
  fi: {
    land: 'Finland',
    namn: 'majavakauppa.fi',
    valuta: 'EUR',
    vendor: 'Majavakauppa',
    baver: true,              // majava = bäver
    sprak: 'fi',
    faktor: 0.097,
    avrunda: niotio,
    leverans: 'sujuva toimitus',
    env: 'FI',
  },
  uk: {
    land: 'Storbritannien',
    namn: 'beavershop.co.uk',
    valuta: 'GBP',
    vendor: 'BeaverShop',
    baver: true,
    sprak: 'en',
    faktor: 0.074,
    avrunda: niotinio,
    leverans: 'smooth delivery',
    env: 'UK',
  },
};

/** Priset i butikens valuta, räknat ur det svenska priset. */
export function pris(butiksnyckel, prisSek) {
  const b = BUTIKER[butiksnyckel];
  if (!b) throw new Error(`Okänd butik: ${butiksnyckel}`);
  return b.avrunda(prisSek * b.faktor);
}

/** Läser shop-domän och token ur miljön. Kastar med tydligt besked om något saknas. */
export function referenser(butiksnyckel) {
  const b = BUTIKER[butiksnyckel];
  const shop = process.env[`SHOPIFY_SHOP_${b.env}`];
  const token = process.env[`SHOPIFY_TOKEN_${b.env}`];
  const saknas = [];
  if (!shop) saknas.push(`SHOPIFY_SHOP_${b.env}`);
  if (!token) saknas.push(`SHOPIFY_TOKEN_${b.env}`);
  if (saknas.length) {
    throw new Error(
      `${b.namn}: saknar ${saknas.join(' och ')}.\n` +
      `  Sätt dem så här innan du kör:\n` +
      saknas.map((n) => `    export ${n}="..."`).join('\n') +
      `\n  Klickvägen för att skapa token står i temu/TOKENS.md`
    );
  }
  return { shop, token };
}
