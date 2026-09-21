// roller.mjs — vem får se vad. Ren logik, inga sidoeffekter, noll beroenden.
//
// Hela poängen med inloggningen: samma sida, olika mycket innehåll. Det finns
// exakt fyra roller och listan här är facit. Servern frågar den här modulen
// före VARJE sidvisning — menyn är bara en spegling av samma svar, aldrig
// säkerheten i sig. (En meny som döljer en länk skyddar ingenting; en session
// som gissar adressen ska mötas av 403.)
//
// Två järnregler ur CLAUDE.md som är inbakade i tabellen:
//   1. Redigerarna ser ALDRIG spend — varken totalt eller per annons.
//      (Axels beslut 2026-09-02, samma regel som topplistan.)
//   2. Bäverbutiken och Grillkliniken blandas aldrig ihop; verksamheterna
//      visas var för sig och valutor summeras aldrig.

/** Varje sida i den inloggade delen. `nyckel` är URL:en efter /app. */
export const SIDOR = Object.freeze([
  { nyckel: 'oversikt', titel: 'Översikt', url: '/app', beskrivning: 'Hela bolaget på en skärm' },
  { nyckel: 'butiker', titel: 'Butiker', url: '/app/butiker', beskrivning: 'Försäljning per butik' },
  { nyckel: 'annonser', titel: 'Annonser', url: '/app/annonser', beskrivning: 'Spend, köp och vinstbidrag' },
  { nyckel: 'redigerare', titel: 'Redigerare', url: '/app/redigerare', beskrivning: 'Topplista och leveranser' },
  { nyckel: 'kundtjanst', titel: 'Kundtjänst', url: '/app/kundtjanst', beskrivning: 'Ärenden och tvister' },
  { nyckel: 'leverans', titel: 'Leverans', url: '/app/leverans', beskrivning: 'Paket på väg till kund' },
  { nyckel: 'mig', titel: 'Min sida', url: '/app/mig', beskrivning: 'Ditt eget läge' },
  { nyckel: 'konton', titel: 'Konton', url: '/app/konton', beskrivning: 'Vem kan logga in' },
]);

/**
 * Rollerna. `sidor` är sidnycklarna rollen kommer åt, `ratt` är de finare
 * behörigheterna som styr enskilda tal på en sida rollen redan ser.
 */
export const ROLLER = Object.freeze({
  agare: {
    namn: 'Ägare',
    beskrivning: 'Allt. Pengar, annonser, folk och konton.',
    sidor: ['oversikt', 'butiker', 'annonser', 'redigerare', 'kundtjanst', 'leverans', 'mig', 'konton'],
    ratt: ['pengar', 'spend', 'marginal', 'konton', 'alla-butiker'],
  },
  chef: {
    namn: 'Chef',
    beskrivning: 'Allt utom vem som får logga in.',
    sidor: ['oversikt', 'butiker', 'annonser', 'redigerare', 'kundtjanst', 'leverans', 'mig'],
    ratt: ['pengar', 'spend', 'marginal', 'alla-butiker'],
  },
  redigerare: {
    namn: 'Redigerare',
    beskrivning: 'Sin egen sida och topplistan. Ser aldrig spend eller omsättning.',
    sidor: ['mig', 'redigerare'],
    ratt: [],
  },
  kundtjanst: {
    namn: 'Kundtjänst',
    beskrivning: 'Ärenden, tvister och paket. Ingen ekonomi.',
    sidor: ['kundtjanst', 'leverans', 'mig'],
    ratt: [],
  },
});

export const ROLLNYCKLAR = Object.freeze(Object.keys(ROLLER));

/** Rollens definition, eller null för ett okänt rollnamn. */
export function roll(namn) {
  return ROLLER[String(namn ?? '').trim().toLowerCase()] ?? null;
}

/** Får användaren öppna sidan? Okänd roll eller okänd sida ⇒ nej. */
export function farSe(anvandare, sidnyckel) {
  const r = roll(anvandare?.roll);
  if (!r) return false;
  if (!SIDOR.some((s) => s.nyckel === sidnyckel)) return false;
  return r.sidor.includes(sidnyckel);
}

/** Får användaren se den här sortens tal? ('pengar', 'spend', 'konton' …) */
export function harRatt(anvandare, ratt) {
  const r = roll(anvandare?.roll);
  return Boolean(r && r.ratt.includes(ratt));
}

/** Menyn för användaren, i sidordningen ovan. Tom lista för okänd roll. */
export function menyFor(anvandare) {
  return SIDOR.filter((s) => farSe(anvandare, s.nyckel));
}

/** Sidan användaren ska landa på efter inloggning — första i dess meny. */
export function startsidaFor(anvandare) {
  return menyFor(anvandare)[0]?.url ?? '/app/mig';
}

/**
 * Knyter ett konto till en person i dashboard/data/team.json.
 * Redigerarens egen sida bygger på den kopplingen: utan `personId` vet vi inte
 * vems siffror som är hens, och då visas ingenting — aldrig någon annans.
 */
export function personIdFor(anvandare) {
  const id = String(anvandare?.personId ?? '').trim();
  return id || null;
}
