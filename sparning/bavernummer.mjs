// Bävernumret: kundens eget paketnummer, räknat ur fraktbolagets.
//
// Axels beslut 2026-09-20: "Ta bort & maska med ett eget bävernummer så de
// inte ser YT nr". Fraktbolagets nummer börjar på YT eller 4PX och
// skvallrar om varifrån paketet kommer.
//
// ⚠️ VARFÖR SHA-256 OCH INTE EN EGEN HASH: numret måste gå att räkna fram
// på TRE ställen med exakt samma svar — här i Node (bygget och
// kundsupportens verktyg), i kundens webbläsare (sidan) och i SHOPIFYS
// MEJLMALLAR. Liquid har filtret `sha256` men ingen egen kod, så en
// hemmasnickrad hash hade lämnat mejlet utanför. Med SHA-256 kan
// fraktmejlet skriva "Ditt paketnummer: BB-…" utan att någon fil behöver
// hållas i synk:
//
//   {{ fulfillment.tracking_number | upcase | replace: ' ', '' | replace: '-', ''
//      | sha256 | slice: 0, 8 | upcase | prepend: 'BB-' }}
//
// (Kedjan står som BAVER_LIQUID i mejl/mallar.mjs; mejltestet "Liquid och
// Node ger samma bävernummer" kör den steg för steg mot bavernummer().)
//
// Sidan räknar INTE själv — bygget skriver numret i datan (postens fjärde
// fält, se uppacka.mjs), så webbläsaren slipper en hashfunktion och kan
// aldrig räkna annorlunda än mejlet. Kundtjänst: `node sparning/baver.mjs`.
//
// ⚠️ NORMALISERINGEN MÅSTE VARA IDENTISK i Node och i Liquid. Node tar bort
// allt som inte är A–Z eller 0–9; Liquid tar bara bort mellanslag och
// bindestreck. Det ger samma svar så länge spårningsnumret bara innehåller
// bokstäver, siffror, mellanslag och bindestreck — vilket alla 1 055 mätta
// nummer gör. `avvikerFranLiquid()` säger till om ett nummer skulle skilja.
//
// Åtta hexsiffror: 16^8 ≈ 4,3 miljarder mot ~1 100 paket i fönstret, och
// bygget mäter krockar ändå. Hex saknar I och O, så "0" är alltid noll och
// "1" alltid ett — numret går att läsa upp i telefon.
//
// ⚠️ DET HÄR ÄR MASKERING, INTE SEKRETESS. Sidans datablock bär
// spårningsnumren i klartext (uppslaget sker i webbläsaren), och den som
// läser sidkällan ser dem. Skyddet är att datan saknar namn, adress och
// ordernummer — det ändras inte av bävernumret.

import { createHash } from 'node:crypto';

export const PREFIX = 'BB-';
export const LANGD = 8;

// Samma sak som uppacka.nyckel(): versaler, bara A–Z och 0–9.
export function normalisera(nummer) {
  return String(nummer == null ? '' : nummer).toUpperCase().replace(/[^A-Z0-9]/g, '');
}

// Vad Liquid-kedjan ovan hade gett — bara mellanslag och bindestreck bort.
function normaliseraSomLiquid(nummer) {
  return String(nummer == null ? '' : nummer).toUpperCase().replace(/[ -]/g, '');
}

export function avvikerFranLiquid(nummer) {
  return normalisera(nummer) !== normaliseraSomLiquid(nummer);
}

// "BB-3F7A2C1D" — eller tom sträng för ett tomt nummer.
// `prefix` är butikens (sparning/butiker.json: BB- för Bäver-butikerna, CS-
// för CaraShell). Hexsiffrorna är alltid samma — bara prefixet skiljer.
export function bavernummer(nummer, prefix = PREFIX) {
  const n = normalisera(nummer);
  if (!n) return '';
  const hex = createHash('sha256').update(n, 'utf8').digest('hex');
  return prefix + hex.slice(0, LANGD).toUpperCase();
}

// Uppslagsnyckel: "BB3F7A2C1D" — det uppacka.nyckel() gör av det kunden
// skriver, med eller utan bindestreck, versaler eller inte.
export function bavernyckel(nummer, prefix = PREFIX) {
  return normalisera(bavernummer(nummer, prefix));
}

// Ser en sträng ut som ett bävernummer? (Kunden kan skriva "bb-3f7a2c1d".)
export function arBavernummer(text, prefix = PREFIX) {
  const p = normalisera(prefix);
  return new RegExp('^' + p + '[0-9A-F]{8}$').test(normalisera(text));
}
