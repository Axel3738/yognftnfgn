/**
 * Växelkurser per dag.
 *
 * Annonskontot kan stå i en annan valuta än butiken (ett NOK-konto mot en
 * SEK-butik). Då räknas annonskostnaden om DAG FÖR DAG med den dagens kurs —
 * aldrig med en enda kurs för hela perioden. Källan är Europeiska
 * centralbankens dagskurser via Frankfurter (samma källa som redigerarnas
 * topplista i `commission/valuta.mjs`).
 *
 * Kurser sparas i FxRate och hämtas aldrig om. Helger och helgdagar har ingen
 * egen kurs: senaste bankdag används och `rateDay` säger vilken. Dagens kurs
 * publiceras ~16:00 CET — före det används gårdagens, markerad som sådan.
 *
 * Kastar aldrig ut till panelen: går källan inte att nå och inget finns
 * sparat returneras null för de dagarna, och anroparen ska flagga att
 * annonskostnaden är ofullständig. En påhittad kurs vore värre än ingen.
 */

import prisma from "../db.server";

const KALLA = "https://api.frankfurter.dev/v1";

export interface FxDay {
  day: string;
  rate: number;
  /** Bankdagen kursen faktiskt är från (kan vara tidigare än `day`). */
  rateDay: string;
}

export interface FxResult {
  /** Kurs per dag för de dagar som gick att täcka. */
  byDay: Map<string, FxDay>;
  /** Dagar utan kurs. Tom när allt täcktes. */
  missing: string[];
  error?: string;
}

const iso = (d: Date) => d.toISOString().slice(0, 10);

const shiftIso = (s: string, days: number): string => {
  const d = new Date(s + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

/** Rimlighetsspärr: ingen kurs mellan två riktiga valutor ligger utanför
 *  det här spannet. Ett svar utanför är ett trasigt API, inte en kursrörelse. */
export const rimlig = (rate: unknown): rate is number =>
  typeof rate === "number" && Number.isFinite(rate) && rate > 0.0001 && rate < 100000;

/** Tolkar Frankfurters tidsserie-svar till (dag → kurs). Ren funktion. */
export function tolkaTidsserie(body: unknown, quote: string): Map<string, number> {
  const out = new Map<string, number>();
  const rates = (body as { rates?: Record<string, Record<string, unknown>> })?.rates;
  if (!rates || typeof rates !== "object") return out;
  for (const [day, r] of Object.entries(rates)) {
    const v = Number(r?.[quote]);
    if (/^\d{4}-\d{2}-\d{2}$/.test(day) && rimlig(v)) out.set(day, v);
  }
  return out;
}

/**
 * Fyller dagarna från..to med kurser. Dagar utan bankdag ärver senaste
 * tidigare bankdag. Ren funktion så att den går att testa utan nät.
 */
export function fyllDagar(
  from: string,
  to: string,
  bankdagar: Map<string, number>,
): Map<string, FxDay> {
  const sorted = [...bankdagar.keys()].sort();
  const out = new Map<string, FxDay>();
  let idx = -1;
  for (let d = from; d <= to; d = shiftIso(d, 1)) {
    while (idx + 1 < sorted.length && sorted[idx + 1] <= d) idx++;
    if (idx < 0) continue; // ingen bankdag före d ännu
    const rateDay = sorted[idx];
    out.set(d, { day: d, rate: bankdagar.get(rateDay)!, rateDay });
  }
  return out;
}

/**
 * Kurs per dag för base→quote över fönstret. Samma valuta ger 1,0 rakt av.
 */
export async function getRates(
  base: string,
  quote: string,
  from: string,
  to: string,
): Promise<FxResult> {
  const byDay = new Map<string, FxDay>();
  if (base === quote) {
    for (let d = from; d <= to; d = shiftIso(d, 1)) byDay.set(d, { day: d, rate: 1, rateDay: d });
    return { byDay, missing: [] };
  }

  const cached = await prisma.fxRate.findMany({
    where: { base, quote, day: { gte: new Date(from), lte: new Date(to) } },
  });
  for (const r of cached) {
    byDay.set(iso(r.day), { day: iso(r.day), rate: Number(r.rate), rateDay: iso(r.rateDay) });
  }

  const missing: string[] = [];
  for (let d = from; d <= to; d = shiftIso(d, 1)) if (!byDay.has(d)) missing.push(d);
  if (!missing.length) return { byDay, missing: [] };

  /* Hämta hela luckan i ett svep, med en veckas marginal bakåt så att den
     första dagen har en bankdag att ärva från (t.ex. om `from` är en söndag). */
  const fetchFrom = shiftIso(missing[0], -7);
  const fetchTo = missing[missing.length - 1];
  let error: string | undefined;
  try {
    const url = `${KALLA}/${fetchFrom}..${fetchTo}?base=${encodeURIComponent(base)}&symbols=${encodeURIComponent(quote)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const bankdagar = tolkaTidsserie(await res.json(), quote);
    if (!bankdagar.size) throw new Error("tomt eller oläsbart svar");

    const filled = fyllDagar(missing[0], fetchTo, bankdagar);
    const today = iso(new Date());
    for (const d of missing) {
      const f = filled.get(d);
      if (!f) continue;
      byDay.set(d, f);
      /* Dagens och gårdagens kurs kan fortfarande uppdateras (ECB publicerar
         ~16:00 CET) — spara dem inte, så hämtas de på nytt nästa gång. */
      if (d >= shiftIso(today, -1)) continue;
      await prisma.fxRate.upsert({
        where: { base_quote_day: { base, quote, day: new Date(d) } },
        create: { base, quote, day: new Date(d), rate: f.rate, rateDay: new Date(f.rateDay) },
        update: {},
      });
    }
  } catch (e) {
    error = `Växelkursen ${base}→${quote} gick inte att hämta: ${(e as Error).message}`;
  }

  const stillMissing = missing.filter((d) => !byDay.has(d));
  return { byDay, missing: stillMissing, error: stillMissing.length ? error : undefined };
}

/** Sammanfattning för UI:t: vilken kurs som gällde i perioden. */
export function fxSammanfattning(byDay: Map<string, FxDay>): { min: number; max: number; senasteDag: string } | null {
  if (!byDay.size) return null;
  let min = Infinity, max = -Infinity, senasteDag = "";
  for (const f of byDay.values()) {
    if (f.rate < min) min = f.rate;
    if (f.rate > max) max = f.rate;
    if (f.rateDay > senasteDag) senasteDag = f.rateDay;
  }
  return { min, max, senasteDag };
}
