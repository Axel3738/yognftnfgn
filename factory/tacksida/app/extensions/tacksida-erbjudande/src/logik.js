// Den rena logiken bakom erbjudandekortet — inget Preact, inget shopify-objekt,
// så den går att testa med node --test (factory/tacksida/test/tacksida.test.mjs).
// Erbjudande.jsx importerar härifrån; ändra aldrig en regel på bara ett ställe.

export const STANDARD = {
  produkt_1: 'fonstertermomatta-2-pack',
  kod_1: 'TACKMATTA',
  procent_1: 34.88,
  produkt_2: 'adventskalender-retrobussar',
  kod_2: 'TACKKALENDER',
  procent_2: 36.94,
  giltig_timmar: 48,
  visa_ordinarie_pris: false,
  marknadsdomaner: 'us=https://carashell.com|en',
  standard_sprak: 'sv',
};

export const varde = (s) => (s && typeof s === 'object' && 'value' in s ? s.value : s);
export const tomt = (x) => x === undefined || x === null || String(x).trim() === '';

/** Inställningar med standardvärden för tomma fält. */
export function installningar(satta) {
  const ut = { ...STANDARD };
  for (const [k, v] of Object.entries(satta ?? {})) if (!tomt(v)) ut[k] = v;
  ut.procent_1 = Number(String(ut.procent_1).replace(',', '.')) || 0;
  ut.procent_2 = Number(String(ut.procent_2).replace(',', '.')) || 0;
  ut.giltig_timmar = Number(ut.giltig_timmar) || STANDARD.giltig_timmar;
  ut.visa_ordinarie_pris = ut.visa_ordinarie_pris === true || String(ut.visa_ordinarie_pris).toLowerCase() === 'true';
  return ut;
}

/** Kod + procent för en produkt, ur inställningarna. */
export function erbjudandeFor(inst, handle) {
  if (handle && handle === inst.produkt_1) return { kod: inst.kod_1, procent: inst.procent_1 };
  if (handle && handle === inst.produkt_2) return { kod: inst.kod_2, procent: inst.procent_2 };
  return { kod: '', procent: 0 };
}

/** "us=https://carashell.com|en, no=https://…|nb" → { us: { bas, sprak } } */
export function tolkaMarknadsdomaner(text) {
  const ut = {};
  for (const del of String(text ?? '').split(',')) {
    const m = /^\s*([a-z0-9-]+)\s*=\s*(https?:\/\/[^|\s]+)\s*(?:\|\s*([a-z-]+))?\s*$/i.exec(del);
    if (m) ut[m[1].toLowerCase()] = { bas: m[2].replace(/\/+$/, ''), sprak: (m[3] ?? '').toLowerCase() || null };
  }
  return ut;
}

/** Basadress + språkprefix för kundens marknad och språk. */
export function adressFor({ storefrontUrl, marknadHandle, sprak, inst }) {
  const per = tolkaMarknadsdomaner(inst.marknadsdomaner);
  const egen = marknadHandle ? per[String(marknadHandle).toLowerCase()] : null;
  const bas = (egen?.bas ?? storefrontUrl ?? '').replace(/\/+$/, '');
  const standardSprak = (egen?.sprak ?? inst.standard_sprak ?? 'sv').toLowerCase();
  const kort = String(sprak ?? '').toLowerCase().split('-')[0];
  const prefix = kort && kort !== standardSprak ? `/${kort}` : '';
  return { bas, prefix };
}

/** Numeriskt id ur ett gid. */
export const numId = (gid) => String(gid ?? '').split('/').pop();

/** Cart-permalinken (Shopifys dokumenterade syntax, inkl. förifylld kassa). */
export function byggLank({ bas, prefix, variantId, kod, plats, orderNamn, email, adress }) {
  const q = new URLSearchParams();
  if (kod) q.set('discount', kod);
  q.set('attributes[kalla]', 'tacksida');
  q.set('attributes[plats]', plats);
  if (orderNamn) q.set('attributes[efter_order]', String(orderNamn));
  if (email) q.set('checkout[email]', email);
  const falt = {
    first_name: adress?.firstName,
    last_name: adress?.lastName,
    address1: adress?.address1,
    address2: adress?.address2,
    city: adress?.city,
    zip: adress?.zip,
    country: adress?.countryCode,
    province: adress?.provinceCode,
  };
  for (const [k, v] of Object.entries(falt)) if (!tomt(v)) q.set(`checkout[shipping_address][${k}]`, String(v));
  return `${bas}${prefix}/cart/${numId(variantId)}:1?${q.toString()}`;
}

/** Erbjudandepriset: procenten på Storefront-priset. Shopify TRUNKERAR
 *  rabattbeloppet till hela ören (mätt i kassan 2026-09-26: 35,25 % på 539
 *  gav 189,99, inte 190,00) — räkna exakt likadant, annars visar kortet ett
 *  öre fel mot kassan. */
export function erbjudandepris(belopp, procent) {
  const b = Number(belopp);
  if (!Number.isFinite(b)) return null;
  const rabatt = Math.floor(b * procent + 1e-6) / 100;
  return Math.round((b - rabatt) * 100) / 100;
}

