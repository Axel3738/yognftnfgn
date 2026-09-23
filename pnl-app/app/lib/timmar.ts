/**
 * Rena funktioner för timgrafen: timmen på dygnet, Metas timhinkar och
 * skillnaden mellan annonskontots och butikens klocka.
 *
 * Egen fil utan beroenden — går att testa utan databas och utan SDK, och en
 * klientkomponent får aldrig röra en server-modul.
 */

/* En formaterare per tidszon, inte en per order: en 90-dagarsexport går
   igenom tiotusentals rader. */
const timFormat = new Map<string, Intl.DateTimeFormat>();

/**
 * Timmen på dygnet (0–23) i en given tidszon.
 *
 * Egen formaterare vid sidan av `dayInTz` — `dateStyle` och `hour` går inte
 * att kombinera i Intl, så att slå ihop dem hade krävt att dagen (DailyPnl:s
 * primärnyckel) skrevs om. `hourCycle: "h23"` med flit: h24 skriver midnatt
 * som "24", vilket hade gett en 25:e hink och tappat hela timme 0.
 */
export function hourInTz(d: Date, tz: string): number {
  let f = timFormat.get(tz);
  if (!f) {
    try {
      f = new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", hourCycle: "h23" });
    } catch {
      f = new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", hour: "2-digit", hourCycle: "h23" });
    }
    timFormat.set(tz, f);
  }
  const n = parseInt(f.format(d), 10);
  return Number.isFinite(n) && n >= 0 && n <= 23 ? n : 0;
}

/** `"13:00:00 - 13:59:59"` → 13. Null när strängen inte är en timme. */
export function timmeUrBreakdown(v: unknown): number | null {
  const m = /^(\d{1,2}):/.exec(String(v ?? "").trim());
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return n >= 0 && n <= 23 ? n : null;
}

/**
 * Skillnaden i hela timmar mellan annonskontots och butikens tidszon en
 * given dag. 0 när de går i takt — vilket de gör oftare än namnen antyder:
 * Europe/Copenhagen och Europe/Stockholm är olika namn och exakt samma tid
 * (mätt 2026-09-23 på Axels riktiga konton). Därför jämförs OFFSET, aldrig
 * namnet; en namnjämförelse hade nekat ROAS per timme på varenda SE- och
 * NO-butik för en nolltimmes skillnad.
 *
 * Null när någon zon är okänd eller skillnaden inte är hela timmar — då går
 * Metas timmar inte att lägga på butikens klocka, och ROAS per timme ska
 * inte visas alls hellre än visas förskjuten.
 */
export function tidszonsOffset(
  annonszon: string | null | undefined,
  butikszon: string | null | undefined,
  dag: string,
): number | null {
  if (!annonszon || !butikszon) return null;
  const t = new Date(`${dag}T12:00:00Z`);
  if (Number.isNaN(t.getTime())) return null;
  const minuter = (tz: string): number | null => {
    try {
      const s = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      }).format(t);
      const m = /^(\d{2}):(\d{2})$/.exec(s);
      return m ? parseInt(m[1], 10) * 60 + parseInt(m[2], 10) : null;
    } catch {
      return null;
    }
  };
  const a = minuter(annonszon);
  const b = minuter(butikszon);
  if (a == null || b == null) return null;
  let diff = a - b;
  /* Över dygnsgränsen: +23 h är i praktiken −1 h. */
  if (diff > 720) diff -= 1440;
  if (diff < -720) diff += 1440;
  return diff % 60 === 0 ? diff / 60 : null;
}

/** Kontots timme lagd på butikens klocka. */
export const laggPaButikensKlocka = (kontotimme: number, offset: number): number =>
  (((kontotimme - offset) % 24) + 24) % 24;
