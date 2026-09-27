// kundvy.mjs — läser matstrumpor.se som kund i varje launchland, på riktig HTML.
//
//   node matstrumpor/marknader/kundvy.mjs            # alla marknader ur konfig.json
//   node matstrumpor/marknader/kundvy.mjs --land NO  # ett land
//
// Per land: POST /localization (country_code + language_code, receptet i
// factory/API-GRANSER.md — utan _method=put svarar Shopify 404), sedan GET
// startsidan, produktsidan (sushi-strumpor) och /pages/spara med kakan. Mäts:
// <html lang>, Shopify.country, Shopify.currency.active, priset i köprutan,
// paketnivåernas rubrik, och svenska markörer som INTE får stå på sidan.
// Skriver ut vad som ÄR — aldrig "klart" utan mätning. Exit 1 om ett land läcker.
//
// ⚠️ Containern går ut på nätet från USA: utan kakan väljer Shopify marknad
// efter IP. Därför sätts landet uttryckligen för varje vy, även för Sverige.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const ROT = dirname(fileURLToPath(import.meta.url));
const KONFIG = JSON.parse(readFileSync(join(ROT, 'konfig.json'), 'utf8'));
const BAS = 'https://matstrumpor.se';

// Svenska ord som inte får synas för en kund på en annan marknad. Egennamn
// (Matstrumpor, STONEBITE, Göteborg) och produktnamnens svenska form i
// URL:er räknas inte — bara löptext.
export const MARKORER_SV = ['Fri frakt i Sverige', 'Fri frakt i hela Sverige', 'öppet köp', 'Lägg i varukorgen', 'Köp nu', 'Handla nu', 'Vanliga frågor', 'Beräknad leverans', 'arbetsdagar', 'Levereras presentklart', 'Köp 1 – Få 1', 'Mest Populär', 'Verifierat köp', 'Passar strl', 'Spåra paket', 'Kontakta', 'Strumpor som ser ut som mat', 'Sushi-Strumpor', 'Välj paket', 'Alla Produkter'];

/** Ren logik: plockar mätvärdena ur en sidas HTML. */
export function lasSida(html, { sprak, land }) {
  const text = html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<!--[\s\S]*?-->/g, ' ');
  const synlig = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const lang = /<html[^>]*\slang="([^"]+)"/i.exec(html)?.[1] ?? null;
  const country = /Shopify\.country\s*=\s*"([A-Z]{2})"/.exec(html)?.[1] ?? null;
  const currency = /Shopify\.currency\s*=\s*(\{[^}]*\})/.exec(html)?.[1] ?? null;
  const active = currency ? /"active":"([A-Z]{3})"/.exec(currency)?.[1] ?? null : null;
  const locale = /Shopify\.locale\s*=\s*"([^"]+)"/.exec(html)?.[1] ?? null;
  // Spårningssidan (sparning/sida.mjs) bär ALLA sina språk i en och samma HTML (C.sprak) och
  // byter i webbläsaren efter <html lang> — svenskan står alltså alltid kvar i källkoden och är
  // ingen läcka. Där mäts i stället att språkpaketet för kundens språk finns i sidan; saknas det
  // visar sidan svenska tills rutinen /sparning matstrumpor byggt om den (den klonar main).
  const sparsida = /id="bb-spar/.test(html);
  const sprakpaket = sparsida && /"sprak":\{/.test(html) && new RegExp(`"${sprak}":\\{"tz"`).test(html);
  const lackor = sprak === 'sv' ? []
    : sparsida ? (sprakpaket ? [] : [`spårningssidan saknar språkpaket ${sprak} (visar svenska tills /sparning matstrumpor byggt om sidan från main)`])
    : MARKORER_SV.filter((m) => synlig.includes(m));
  // Priset i köprutan: första money-beloppet i produktformuläret räcker som stickprov.
  const pris = /class="price-item price-item--regular[^"]*"[^>]*>\s*([^<]{1,30})</.exec(html)?.[1]?.trim() ?? null;
  const paket = [...synlig.matchAll(/(Köp 1 – Få 1[^.]{0,20}|Kjøp 1 – Få 1[^.]{0,20}|Køb 1 – Få 1[^.]{0,20}|Osta 1 – Saat 1[^.]{0,30}|Buy 1 – Get 1[^.]{0,20})/g)].map((m) => m[1].trim()).slice(0, 1);
  const judgeme = /"locale":"([a-z]{2}(?:-[A-Z]{2})?)"/.exec(html)?.[1] ?? null;
  return { lang, country, active, locale, pris, paket: paket[0] ?? null, judgeme, lackor, bytes: html.length, land, sprak };
}

async function sattLand(land, sprak) {
  const svar = await fetch(`${BAS}/localization`, {
    method: 'POST', redirect: 'manual',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'Mozilla/5.0 (kundvy matstrumpor)' },
    body: new URLSearchParams({ form_type: 'localization', _method: 'put', country_code: land, language_code: sprak, return_to: '/' }),
  });
  if (svar.status !== 302 && svar.status !== 200) throw new Error(`POST /localization ${land}/${sprak} svarade ${svar.status} — finns landet som marknad och språket som publicerad locale?`);
  const kakor = (svar.headers.getSetCookie?.() ?? []).map((c) => c.split(';')[0]).join('; ');
  return kakor;
}

async function hamta(url, kakor) {
  const svar = await fetch(url, { headers: { Cookie: kakor, 'User-Agent': 'Mozilla/5.0 (kundvy matstrumpor)', 'Accept-Language': 'en' }, redirect: 'follow' });
  return { status: svar.status, url: svar.url, html: await svar.text() };
}

export async function lasMarknad({ land, sprak, valuta }) {
  const kakor = await sattLand(land, sprak);
  // Shopify skriver locale-mappen med gemener: pt-PT ligger på /pt-pt.
  const prefix = sprak === 'sv' ? '' : `/${sprak.toLowerCase()}`;
  const ut = [];
  for (const path of ['/', '/products/sushi-strumpor', '/pages/spara']) {
    const r = await hamta(`${BAS}${prefix}${path}`, kakor);
    const m = lasSida(r.html, { sprak, land });
    ut.push({ path: `${prefix}${path}`, status: r.status, ...m, ok: r.status === 200 && m.lang?.startsWith(sprak) && m.country === land && (!valuta || m.active === valuta) && m.lackor.length === 0 });
  }
  return ut;
}

async function huvud() {
  const arg = process.argv.slice(2);
  const bara = arg.includes('--land') ? arg[arg.indexOf('--land') + 1].toUpperCase() : null;
  const vyer = [{ land: 'SE', sprak: 'sv', valuta: 'SEK' }];
  // Europa-marknaden har många språk: kundens land avgör vilket vi läser som. Länder utan
  // eget språk i marknaden (CZ, HU, RO, GR, IE …) läses som DE/EUR-vyn — de får samma sidor.
  const SPRAK_PER_LAND = { DK: 'da', FI: 'fi', DE: 'de', AT: 'de', CH: 'de', FR: 'fr', BE: 'nl', LU: 'fr', NL: 'nl', ES: 'es', IT: 'it', PL: 'pl', PT: 'pt-PT' };
  const VALUTA_PER_LAND = { US: 'USD', NO: 'NOK', DK: 'DKK', GB: 'GBP', AU: 'AUD', CA: 'CAD', NZ: 'NZD', PL: 'PLN', CH: 'CHF', CZ: 'CZK', HU: 'HUF', RO: 'RON', IS: 'ISK' };
  const alla = arg.includes('--alla-lander');
  for (const m of KONFIG.marknader) for (const land of m.lander) {
    const sprak = SPRAK_PER_LAND[land] ?? m.locales[0];
    if (!alla && m.id === 'EU' && !(land in SPRAK_PER_LAND)) continue;
    vyer.push({ land, sprak, valuta: VALUTA_PER_LAND[land] ?? (m.id === 'EU' ? 'EUR' : null) });
  }
  let rott = 0;
  for (const v of vyer) {
    if (bara && v.land !== bara) continue;
    try {
      const rader = await lasMarknad(v);
      for (const r of rader) {
        console.log(`${r.ok ? '✅' : '❌'} ${v.land}/${v.sprak} ${r.path}: ${r.status} lang=${r.lang} land=${r.country} valuta=${r.active} pris=${r.pris ?? '—'} paket=${r.paket ?? '—'} judgeme=${r.judgeme ?? '—'}${r.lackor.length ? ` LÄCKOR: ${r.lackor.join(' | ')}` : ''}`);
        if (!r.ok) rott++;
      }
    } catch (e) { console.log(`❌ ${v.land}/${v.sprak}: ${e.message}`); rott++; }
  }
  process.exit(rott ? 1 : 0);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) huvud().catch((e) => { console.error(`❌ ${e.message}`); process.exit(1); });
