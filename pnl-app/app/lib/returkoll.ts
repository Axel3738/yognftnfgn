/**
 * Returkollen — den rena delen: vilka butiker som står på tur, hur tiden
 * visas, och hur KundOrder-raderna i ett fönster ersätts.
 *
 * Varför den finns: en återbetalning eller avbokning bokas på ORDERNS dag
 * (`totalRefundedSet` och `cancelledAt` läses vid hämtningen) och når
 * siffrorna bara när den dagen exporteras om. Panelen och gruppen håller
 * bara de tre senaste dagarna färska, och i dropshipping kommer returerna
 * 1–3 veckor efter ordern. 500 000 kr/mån med 6 % returer = upp till
 * 30 000 kr som aldrig lämnade gruppens 30-dagarsvinst. Tokenvakten går
 * därför om de senaste 45 dagarna per butik var 6:e timme.
 *
 * Egen fil utan beroenden — testerna kör `node --experimental-strip-types`,
 * som varken når databasen eller kan lösa upp importer utan filändelse.
 */

/** Hur ofta en butiks 45 dagar gås om. */
export const RESYNC_INTERVALL_MS = 6 * 60 * 60 * 1000;
/** Högst så här många butiker per tick och tjänst — en bulk-export var. */
export const RESYNC_PER_TICK = 3;

export interface ResyncKandidat {
  shop: string;
  refundResyncAt: Date | null;
}

/**
 * Butikerna som står på tur: aldrig kollade först, sedan äldst först, högst
 * `max` stycken. Bara de vars senaste koll är äldre än 6 h.
 *
 * `pausade` är butiker som DEN HÄR tjänsten nyss misslyckades med. Utan den
 * hade en butik med död nyckel legat kvar som äldst (stämpeln rullas
 * tillbaka vid fel) och tagit en av tre platser på varje tick — tre sådana
 * butiker och ingen annan butik kollades någonsin. Andra tjänster ser den
 * fortfarande som äldst, och den som faktiskt kan förnya nyckeln tar den.
 */
export function valjResyncButiker(
  rader: ResyncKandidat[],
  nu: Date | number,
  max: number = RESYNC_PER_TICK,
  pausade: ReadonlySet<string> = new Set(),
): ResyncKandidat[] {
  const grans = (typeof nu === "number" ? nu : nu.getTime()) - RESYNC_INTERVALL_MS;
  return rader
    .filter((r) => !pausade.has(r.shop))
    .filter((r) => r.refundResyncAt == null || r.refundResyncAt.getTime() < grans)
    .sort((a, b) => {
      const ta = a.refundResyncAt?.getTime() ?? -Infinity;
      const tb = b.refundResyncAt?.getTime() ?? -Infinity;
      if (ta !== tb) return ta < tb ? -1 : 1;
      return a.shop < b.shop ? -1 : a.shop > b.shop ? 1 : 0;
    })
    .slice(0, Math.max(0, max));
}

/**
 * En tidpunkt som text för en TIMESTAMP(3)-kolumn ("2026-09-26 10:15:00.123",
 * UTC). Stämplarna skrivs med rå SQL — se `resyncRunda` för varför — och
 * text med CAST jämförs exakt, utan att bero på databassessionens tidszon.
 */
export function sqlTid(d: Date | null): string | null {
  return d ? d.toISOString().slice(0, 23).replace("T", " ") : null;
}

/**
 * "14:05" i butikens tid — eller "2026-09-25 14:05" när kollen inte var i
 * dag. Ett ensamt klockslag från i går hade sett ut som en färsk koll.
 */
export function klockslag(d: Date, tidszon: string, idag: string): string {
  let dag: string;
  let tid: string;
  try {
    dag = new Intl.DateTimeFormat("sv-SE", { timeZone: tidszon, dateStyle: "short" }).format(d);
    tid = new Intl.DateTimeFormat("sv-SE", { timeZone: tidszon, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(d);
  } catch {
    dag = d.toISOString().slice(0, 10);
    tid = d.toISOString().slice(11, 16);
  }
  return dag === idag ? tid : `${dag} ${tid}`;
}

/**
 * Gruppens returkoll: den ÄLDSTA kollen bland medlemmarna (summan är aldrig
 * färskare än sin äldsta del) och hur många som aldrig kollats.
 */
export function aldstaKoll(rader: { refundResyncAt: Date | null }[]): { aldsta: Date | null; saknas: number } {
  let aldsta: Date | null = null;
  let saknas = 0;
  for (const r of rader) {
    if (!r.refundResyncAt) saknas++;
    else if (!aldsta || r.refundResyncAt < aldsta) aldsta = r.refundResyncAt;
  }
  return { aldsta, saknas };
}

export interface KundOrderSkrivRad {
  orderId: string;
  kundHash: string | null;
  dag: string;
  netto: number;
  tb: number | null;
}

export interface KundOrderErsattning {
  /** Radera butikens rader med dag i [fran, till] … */
  fran: string;
  till: string;
  /** … och rader med de här order-ID:na, var de än ligger (bitvis). */
  orderIdBitar: string[][];
  /** Skriv sedan de här, bitvis (createMany). */
  bitar: (KundOrderSkrivRad & { shop: string })[][];
}

/**
 * Hur KundOrder-raderna för ett hämtat fönster ersätts. Radera + skriv, inte
 * upsert: en order som avbokats efter att den cachades kommer inte med i den
 * nya hämtningen (`parseOrderLines` hoppar över `cancelledAt`), och med
 * upsert låg dess gamla rad kvar med sitt gamla netto — i kohorterna, i
 * "nya kunder" och i CAC-nämnaren, för alltid.
 *
 * Order-ID:na raderas också utanför fönstret: en order vars dag flyttats
 * (butikens tidszon ändrad) hade annars krockat med primärnyckeln och fällt
 * hela transaktionen.
 *
 * Bitarna: Postgres tar högst 65 535 bind-parametrar per fråga och Prisma
 * delar inte createMany åt en — samma skäl som timraderna.
 */
export function kundOrderErsattning(
  shop: string,
  fran: string,
  till: string,
  rader: KundOrderSkrivRad[],
  bit = 2000,
): KundOrderErsattning {
  const skriv = rader.map((r) => ({ shop, ...r }));
  const bitvis = <T>(xs: T[]): T[][] =>
    Array.from({ length: Math.ceil(xs.length / bit) }, (_, i) => xs.slice(i * bit, (i + 1) * bit));
  return {
    fran,
    till,
    orderIdBitar: bitvis(rader.map((r) => r.orderId)),
    bitar: bitvis(skriv),
  };
}
