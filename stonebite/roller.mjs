// roller.mjs — vem får se vad. Ren logik, inga sidoeffekter, noll beroenden.
//
// Hela poängen med inloggningen: samma sajt, olika mycket innehåll. Sex roller
// och listan här är facit. Servern frågar den här modulen före VARJE
// sidvisning — menyn är bara en spegling av samma svar, aldrig säkerheten i
// sig. (En meny som döljer en länk skyddar ingenting; en session som gissar
// adressen ska mötas av 403.)
//
// Axels fem inloggningar (2026-09-21) plus chefsrollen som redan fanns:
//   agare        — Axel själv
//   chef         — Anna, som ska ta över driften
//   produkttest  — de som hittar och testar nya produkter
//   redigerare   — videoredigerarna
//   support_chef — Head of customer support / VA
//   va           — vanliga VA:er
//
// Tre järnregler ur CLAUDE.md sitter i tabellen:
//   1. Redigerare ser ALDRIG spend — varken totalt eller per annons
//      (Axels beslut 2026-09-02, samma regel som topplistan).
//   2. Ingen utom ägaren rör konton.
//   3. Bäverbutiken och Grillkliniken blandas aldrig ihop, och valutor
//      summeras aldrig.

/** Varje sida i den inloggade delen. `nyckel` är det servern slår upp. */
export const SIDOR = Object.freeze([
  { nyckel: 'oversikt', titel: 'Översikt', url: '/app', beskrivning: 'Hela bolaget på en skärm' },
  { nyckel: 'varumarken', titel: 'Varumärken', url: '/app/varumarken', beskrivning: 'Ett kort per verksamhet, med allt därunder' },
  { nyckel: 'butiker', titel: 'Butiker', url: '/app/butiker', beskrivning: 'Försäljning per butik' },
  { nyckel: 'annonser', titel: 'Annonser', url: '/app/annonser', beskrivning: 'Spend, köp och vinstbidrag' },
  { nyckel: 'produkttest', titel: 'Produkttest', url: '/app/produkttest', beskrivning: 'Nya produkter på väg genom trappan' },
  { nyckel: 'redigerare', titel: 'Redigerare', url: '/app/redigerare', beskrivning: 'Topplista och leveranser' },
  { nyckel: 'kundtjanst', titel: 'Kundtjänst', url: '/app/kundtjanst', beskrivning: 'Ärenden och tvister' },
  { nyckel: 'recensioner', titel: 'Recensioner', url: '/app/recensioner', beskrivning: 'Vad kunderna skriver — och vem de tackar' },
  { nyckel: 'leverans', titel: 'Leverans', url: '/app/leverans', beskrivning: 'Paket på väg till kund' },
  { nyckel: 'bonus', titel: 'Bonus', url: '/app/bonus', beskrivning: 'Vad alla tjänar utöver lönen' },
  { nyckel: 'system', titel: 'System', url: '/app/system', beskrivning: 'Allt som är byggt och vad det gör' },
  // Kalendern ligger sist bland arbetssidorna med flit: startsidan efter
  // inloggning är den FÖRSTA sidan rollen får se, och en redigerare ska landa
  // på topplistan, inte i en tom kalender.
  { nyckel: 'kalender', titel: 'Kalender', url: '/app/kalender', beskrivning: 'Vad som ska hända, vad som hänt' },
  { nyckel: 'mig', titel: 'Min sida', url: '/app/mig', beskrivning: 'Dina uppdrag och dina pengar' },
  { nyckel: 'konton', titel: 'Konton', url: '/app/konton', beskrivning: 'Vem kan logga in' },
]);

/**
 * Rollerna. `sidor` är sidnycklarna rollen kommer åt, `ratt` styr enskilda
 * tal på en sida rollen redan ser.
 */
export const ROLLER = Object.freeze({
  agare: {
    namn: 'Ägare',
    beskrivning: 'Allt. Pengar, annonser, folk, bonus och konton.',
    sidor: ['oversikt', 'varumarken', 'kalender', 'butiker', 'annonser', 'produkttest', 'redigerare', 'kundtjanst', 'recensioner', 'leverans', 'bonus', 'system', 'mig', 'konton'],
    ratt: ['pengar', 'spend', 'marginal', 'konton', 'alla-butiker', 'bonus-alla', 'godkanna', 'system', 'varumarken'],
  },
  // ⚠️ Namnen är medvetet övertydliga sedan 2026-09-23: Mechiles konto stod som
  // "Chef" (rollen låg direkt under Ägare i listan och heter nästan som hennes
  // titel) och hon såg dygnets omsättning, spenden och ROAS för alla butiker.
  chef: {
    namn: 'Chef — ser ALL ekonomi',
    beskrivning: 'Allt utom vem som får logga in. Ser omsättning, spend och ROAS för alla butiker.',
    sidor: ['oversikt', 'varumarken', 'kalender', 'butiker', 'annonser', 'produkttest', 'redigerare', 'kundtjanst', 'recensioner', 'leverans', 'bonus', 'system', 'mig'],
    ratt: ['pengar', 'spend', 'marginal', 'alla-butiker', 'bonus-alla', 'godkanna', 'system', 'varumarken'],
  },
  // Alla roller har en egen kalender — bara sina egna rader. Varumärkenas
  // kalendrar (med tvister, rutiner och spend-nära saker) ser bara ägare/chef.
  produkttest: {
    namn: 'Produkttest',
    beskrivning: 'Produkterna de testar och vad de tjänat på dem. Ingen spend, ingen omsättning.',
    sidor: ['produkttest', 'kalender', 'mig'],
    ratt: [],
  },
  redigerare: {
    namn: 'Videoredigerare',
    beskrivning: 'Topplistan och sin egen sida. Ser aldrig spend eller omsättning.',
    sidor: ['redigerare', 'kalender', 'mig'],
    ratt: [],
  },
  support_chef: {
    namn: 'Head of customer support — ingen ekonomi',
    beskrivning: 'Kundtjänst, recensioner, paket och hela VA-teamets bonus. Godkänner insatser. Ingen ekonomi.',
    sidor: ['kundtjanst', 'recensioner', 'leverans', 'bonus', 'kalender', 'mig'],
    ratt: ['bonus-alla', 'godkanna'],
  },
  va: {
    namn: 'Kundtjänst (VA)',
    beskrivning: 'Ärenden, tvister, paket och recensioner — plus sina egna uppdrag och pengar.',
    sidor: ['kundtjanst', 'recensioner', 'leverans', 'kalender', 'mig'],
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

/** Ser rollen all ekonomi (omsättning, spend, ROAS)? Bara ägare och chef. Ren. */
export function serEkonomi(rollnamn) {
  return Boolean(roll(rollnamn)?.ratt.includes('pengar'));
}

/**
 * Felet Konton-sidan visar när någon får en ekonomiroll utan att kryssrutan
 * är ibockad. Att ge fel person all ekonomi går inte att ta tillbaka — det
 * hen redan sett har hen sett — så det kräver ett andra, uttryckligt ja.
 */
export function ekonomiVarning(rollnamn) {
  const r = roll(rollnamn);
  return `Rollen "${r?.namn ?? rollnamn}" ser ALL ekonomi: omsättning, spend och ROAS för alla butiker. Kryssa i "ge all ekonomi" och spara igen om det verkligen är meningen. Kundtjänst och VA:er ska ha "Head of customer support" eller "Kundtjänst (VA)".`;
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
 * Knyter ett konto till en person i bonus/personer.json.
 * Den egna sidan bygger på kopplingen: utan `personId` vet vi inte vems
 * siffror som är hens, och då visas ingenting — aldrig någon annans.
 */
export function personIdFor(anvandare) {
  const id = String(anvandare?.personId ?? '').trim();
  return id || null;
}

/** Rollerna en användare tjänar pengar i (primär + extra). */
export function bonusrollerFor(anvandare, person = null) {
  const extra = person?.extraRoller ?? anvandare?.extraRoller ?? [];
  return [...new Set([anvandare?.roll, ...extra].filter(Boolean))];
}
