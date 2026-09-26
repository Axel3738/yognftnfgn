/**
 * Kostnadstäckning och tullens startvärde — ren logik utan I/O.
 *
 * Varför en egen fil: räknemotorn, panelen, gruppsumman, Kostnader-sidan
 * och Inställningar ska dra samma gräns på samma sätt, och testerna
 * (`node --experimental-strip-types`) kan bara läsa filer utan beroenden.
 * Klientkomponenter får importera härifrån — inget här är `.server`.
 *
 * Grundproblemet: en variant utan inköpspris lägger 0 till COGS. Samma sak
 * med ett uttryckligt 0,00 i Shopify. Båda gör vinsten för hög och
 * break-even för låg, utan att något ser trasigt ut. Räkneexempel: 300 000 kr
 * omsättning, verklig COGS 40 %, 30 % av enheterna utan kostnad ⇒ panelen
 * visar COGS 28 %, vinsten 36 000 kr för hög och break-even 1,45× i stället
 * för 1,75×. Annonser på 1,5–1,7× ser lönsamma ut och går med förlust.
 */

/**
 * Hur stor andel av nettoförsäljningen som får sakna riktig kostnad innan
 * vinsten räknas som osäker. Ett produktbeslut, hållet som EN konstant: över
 * gränsen blir hjälten gul i stället för grön, ingen konfetti, och break-even
 * visas som en undre gräns ("≥ 1,6×").
 */
export const KOSTNAD_TROSKEL = 0.02;

/**
 * Är vinsten osäker? Andelen jämförs direkt mot gränsen — INTE via
 * `1 − täckning`: 1 − 0,98 blir 0,020000000000000018 i flyttal, och exakt
 * 2 % hade då slagit om till osäker.
 */
export function arKostnadOsaker(andelUtanKostnad: number | null | undefined): boolean {
  return andelUtanKostnad != null && andelUtanKostnad > KOSTNAD_TROSKEL;
}

/**
 * Andel av omsättningen utan riktig kostnad. Null när underlaget är noll —
 * då finns inget att döma, och "0 %" hade sett ut som full täckning.
 */
export function andelUtan(utanKostnad: number, underlag: number): number | null {
  if (!(underlag > 0)) return null;
  return Math.min(1, Math.max(0, utanKostnad) / underlag);
}

/* ------------------------------------------------------------------------ */
/* Kostnader-sidan: täckning vägd efter omsättning                            */
/* ------------------------------------------------------------------------ */

export interface TackningsRad {
  variantGid: string;
  /** Saknar variant kostnad (null, eller varken standard eller alla säljmarknader)? */
  saknas: boolean;
  /** Står kostnaden på exakt 0 utan att handlaren sagt att varan är gratis? */
  noll: boolean;
}

/**
 * Täckning vägd efter de senaste 90 dagarnas nettoförsäljning. Tre
 * bästsäljare utan kostnad bland 200 varianter var 98,5 % "täckt" räknat i
 * varianter — och 60 % av omsättningen. `andel` är null när butiken inte
 * sålt något på 90 dagar; då finns ingen omsättning att väga med och sidan
 * faller tillbaka på antalet varianter.
 */
export function tackningEfterOmsattning(
  rader: TackningsRad[],
  omsPerVariant: Map<string, number>,
): { andel: number | null; omsUtan: number; oms: number } {
  let oms = 0;
  let omsUtan = 0;
  for (const r of rader) {
    const o = Math.max(0, omsPerVariant.get(r.variantGid) ?? 0);
    oms += o;
    if (r.saknas || r.noll) omsUtan += o;
  }
  return { andel: oms > 0 ? 1 - omsUtan / oms : null, omsUtan, oms };
}

/** Juicy-kortets läge A ("dina kostnader finns redan här") kräver så här mycket. */
export const JUICY_TACKNING = 0.98;

/* ------------------------------------------------------------------------ */
/* Tullen                                                                     */
/* ------------------------------------------------------------------------ */

/**
 * Tull per order för en NY butik. 27,50 är Axels EU-tull i kronor — rätt för
 * hans svenska butiker, som importerar utanför EU. I alla andra valutor är
 * talet påhittat: en amerikansk butik med 45 $ snittorder fick 27,50 $ i tull
 * per order, 0,40 $ kvar före annonser och break-even runt 112×. Därför noll
 * utanför SEK. Gäller bara när raden SKAPAS — aldrig vid uppdatering.
 */
export function startTull(currency: string | null | undefined): number {
  return currency === "SEK" ? 27.5 : 0;
}

export interface TullUppgifter {
  tariffPerOrder: number;
  /** Tull per marknad (landskod → belopp, null = butikens standard). */
  perMarknad: Record<string, number | null | undefined>;
}

/* Beloppen jämförs i ören: Decimal(10,2) i databasen och ett inskrivet
   "27.5" ska räknas som samma tal. */
const oren = (v: number | null | undefined): number | null =>
  v == null || !Number.isFinite(v) ? null : Math.round(v * 100);

/**
 * Har handlaren kvitterat tullen? Sant BARA när ett tullbelopp faktiskt
 * ändrats, eller när rutan "Tullbeloppen stämmer" är ikryssad.
 *
 * Varför inte "sparat Inställningar": Spara-knappen skickar språk, tull,
 * avgift och en inklistrad Meta-nyckel i samma formulär. Den som bara bytte
 * språk kvitterade tidigare 27,50 i tull utan att ha tittat på den.
 *
 * Ett ogiltigt postat huvudbelopp (tomt fält, text) räknas inte som ändring.
 * En marknad som saknas i posten räknas som tom (null) — Spara ersätter hela
 * kartan, så en marknad som inte skickas med försvinner ur den.
 */
export function tullKvitterad(stored: TullUppgifter, posted: TullUppgifter, kryssad: boolean): boolean {
  if (kryssad) return true;
  const nyHuvud = oren(posted.tariffPerOrder);
  if (nyHuvud != null && nyHuvud !== oren(stored.tariffPerOrder)) return true;
  const koder = new Set([...Object.keys(stored.perMarknad), ...Object.keys(posted.perMarknad)]);
  for (const k of koder) {
    if (oren(stored.perMarknad[k]) !== oren(posted.perMarknad[k])) return true;
  }
  return false;
}
