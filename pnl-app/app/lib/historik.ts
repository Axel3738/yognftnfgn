/**
 * Orderhistorikens horisont — hur långt bakåt Shopify faktiskt visar ordrar
 * för den här appen.
 *
 * Utan scopen read_all_orders ser en app bara de senaste 60 dagarnas ordrar,
 * och Shopify svarar TOMT för äldre — inte med ett fel. Ingen av StonePNL:s
 * registreringar har den scopen (shopify.app.toml, `scopesForService`). Förut
 * startade `parseOrderLines` varje dag i fönstret på noll och `refreshDaily`
 * skrev dem alla, så en 90-dagarsvy skrev nollor över riktiga gamla dagar
 * medan deras annonskostnad låg kvar: ett lönsamt kvartal såg ut som förlust.
 *
 * Egen fil utan beroenden — går att testa med `node --test` utan databas, och
 * hjälparna nedan är medvetet egna kopior i stället för importer från
 * server-moduler som testkörningen inte kan lösa upp.
 */

const DAG_MS = 86_400_000;

const flytta = (iso: string, dagar: number): string => {
  const d = new Date(iso + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + dagar);
  return d.toISOString().slice(0, 10);
};

const dagI = (d: Date, tz: string): string => {
  try {
    return new Intl.DateTimeFormat("sv-SE", { timeZone: tz, dateStyle: "short" }).format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
};

/** Har scope-strängen read_all_orders? */
export function harAllaOrdrar(scope: string | null | undefined): boolean {
  return (scope ?? "").split(",").map((s) => s.trim()).includes("read_all_orders");
}

/**
 * Äldsta dag (butikens tid) som Shopify garanterat visar HELT. Null = ingen
 * gräns (read_all_orders, eller sonden har sett en order äldre än 61 dagar).
 *
 * Varför idag − 59 och inte − 60: Shopify räknar 60 dygn bakåt från NU, inte
 * från butikens kalenderdag. Gränsen (nu − 60 d) hamnar alltid någonstans
 * inne i dag idag − 60 eller tidigare — den dagen är alltså halv, och en halv
 * dag skriven som hel är samma lögn som en nolla. Idag − 59 syns alltid helt.
 */
export function historikHorisont(p: {
  scope: string | null | undefined;
  fullHistory: boolean | null | undefined;
  today: string;
}): string | null {
  if (harAllaOrdrar(p.scope) || p.fullHistory === true) return null;
  return flytta(p.today, -59);
}

/**
 * Klämmer ett hämtfönster mot horisonten. Null = hela fönstret ligger före
 * horisonten, och då ska INGENTING hämtas eller skrivas — en tom hämtning
 * hade skrivit nollor över dagar som kan ha riktiga siffror sedan förut.
 */
export function klampaFonster(
  from: string,
  to: string,
  horisont: string | null,
): [string, string] | null {
  if (horisont == null) return [from, to];
  if (to < horisont) return null;
  return [from > horisont ? from : horisont, to];
}

export type Dagklass = "sales" | "missing" | "outsideHistory";

/**
 * Vad en dag i ett intervall är värd, givet dess rad och horisonten.
 *
 * - `sales`: raden finns och hämtades medan dagen syntes — riktiga siffror.
 * - `missing`: ingen rad, men dagen går att hämta — exportera den.
 * - `outsideHistory`: ingen rad och dagen ligger före horisonten (kan aldrig
 *   hämtas), ELLER raden hämtades när dagen redan låg utanför Shopifys 60
 *   dygn. En sådan rad är tom av konstruktion: den skrevs innan spärren
 *   fanns, och dess nolla betyder "ingen åtkomst", inte "ingen försäljning".
 *
 * Radens hämtning täckte dagen helt bara om gränsen vid hämtningen
 * (fetchedAt − 60 dygn) låg FÖRE dagens början i butikens tid. Hamnade
 * gränsen inne i dagen är raden halv — även den räknas som utanför, för en
 * halv dag som visas som hel är fortfarande en för låg omsättning.
 */
export function klassaDag(
  day: string,
  row: { fetchedAt: Date } | null | undefined,
  horisont: string | null,
  tidszon = "UTC",
): Dagklass {
  if (horisont == null) return row ? "sales" : "missing";
  if (!row) return day < horisont ? "outsideHistory" : "missing";
  const grans = dagI(new Date(row.fetchedAt.getTime() - 60 * DAG_MS), tidszon);
  return grans >= day ? "outsideHistory" : "sales";
}

/** Hur många dagar bakåt returkollen går om (idag inräknat). */
export const RESYNC_DAGAR = 45;

/**
 * Returkollens fönster: de senaste 45 dagarna (idag − 44 … idag), klämt mot
 * orderhorisonten. Återbetalningar och avbokningar bokas på ORDERNS dag och
 * syns bara när den dagen exporteras om — i dropshipping kommer de 1–3 veckor
 * efter ordern, alltså långt utanför de tre dagar panelen och gruppen håller
 * färska. Fönstret kläms mot horisonten av samma skäl som `klampaFonster`:
 * en tom export bortom Shopifys 60 dygn hade skrivit nollor.
 */
export function resyncFonster(today: string, horisont: string | null): [string, string] {
  const start = flytta(today, -(RESYNC_DAGAR - 1));
  return [horisont != null && horisont > start ? horisont : start, today];
}
