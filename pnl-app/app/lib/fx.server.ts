/**
 * Växelkurser från Frankfurter (ECB:s publicerade kurser). Gratis, utan nyckel.
 *
 * Används på två ställen: annonskostnad som betalas i en annan valuta än
 * butiken säljer i, och sammanslagningen av flera butiker till en gemensam
 * siffra. Båda kräver att kursen går att lita på — vi gissar aldrig, och när
 * kursen inte går att hämta säger anropande kod ifrån istället för att räkna
 * vidare på ett påhittat tal.
 *
 * Två ytor:
 *   - `rate()`        dagens kurs (ett tal). För belopp som gäller NU, t.ex.
 *                     en leverantörsoffert i USD som ska visas i butikens valuta.
 *   - `dailyRates()`  kurs per DAG över ett intervall. För allt som redan har
 *                     hänt: en dags försäljning räknas om med den dagens kurs,
 *                     annars ändras gårdagens vinst varje gång kronan rör sig
 *                     och en 30-dagarsvy mäter valutamarknaden i dag i stället
 *                     för butiken. Gruppsumman går den här vägen sedan
 *                     2026-09-07 — tidigare gick hela perioden på `rate()`.
 *
 * `meta.server.ts` har fortfarande en egen, äldre kopia av intervallhämtningen
 * (`fetchRates`, ett försök, ingen cache). Den byts mot `dailyRates` när
 * Meta-inloggningsarbetet i samma fil har landat — inte i samma ändring.
 */

const cache = new Map<string, { rate: number; at: number }>();
const TTL = 6 * 60 * 60 * 1000; // kurser rör sig inte snabbt nog för tätare
/* Nödfallsgräns: misslyckas hämtningen serveras den senast kända kursen upp
   till så här gammal. En kurs från i morse är ett långt mindre fel än att
   utesluta hela butiken ur gruppsumman — det var precis vad som hände när
   Frankfurter hickade: butiker "försvann" ur den gemensamma vyn. */
const NODFALL_TTL = 7 * 24 * 60 * 60 * 1000;
/* Efter ett misslyckat försök: sluta jaga i fem minuter. Utan pausen gjorde
   varje sidladdning under ett Frankfurter-avbrott två nya timeout-försök per
   butik — fem butiker × två anrop framför en väntande panel. */
const misslyckadesVid = new Map<string, number>();
const RETRY_PAUS = 5 * 60 * 1000;

/** Dagens kurs mellan två valutor. 1 = samma valuta. undefined = okänd. */
export async function rate(from: string, to: string): Promise<number | undefined> {
  if (!from || !to) return undefined;
  if (from === to) return 1;

  const key = `${from}>${to}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return hit.rate;

  const nodfall = () => (hit && Date.now() - hit.at < NODFALL_TTL ? hit.rate : undefined);

  const fel = misslyckadesVid.get(key) ?? 0;
  if (Date.now() - fel < RETRY_PAUS) return nodfall();

  /* Två försök: enstaka nätverkshickor ska inte synas i UI:t. Timeout per
     försök — gruppsumman awaitar det här, och ett hängt svar utan gräns är
     en panel som aldrig laddar. */
  for (let försök = 0; försök < 2; försök++) {
    try {
      const res = await fetch(`https://api.frankfurter.dev/v1/latest?base=${from}&symbols=${to}`, {
        signal: AbortSignal.timeout(8_000),
      });
      if (!res.ok) continue;
      const body = await res.json();
      const v = body?.rates?.[to];
      if (typeof v !== "number") continue;
      cache.set(key, { rate: v, at: Date.now() });
      misslyckadesVid.delete(key);
      return v;
    } catch {
      /* nästa försök, eller nödfallet nedan */
    }
  }

  misslyckadesVid.set(key, Date.now());
  return nodfall();
}

/* ------------------------------------------------------------------------ */
/* Kurs per dag                                                              */
/* ------------------------------------------------------------------------ */

/** Kurser per dag: YYYY-MM-DD → hur många `to` en `from` var värd den dagen. */
export type DailyRates = Map<string, number>;

/* En post per valutapar. `rates` växer med varje lyckad hämtning (en
   publicerad dagskurs ändras aldrig, så gamla dagar är fortfarande sanna),
   medan `from`/`to` är det SAMMANHÄNGANDE fönster vi vet är komplett — bara
   det får serveras ur cachen. Poängen med par i stället för fönster som
   nyckel: panelens "30 dagar" flyttar sig varje midnatt, och nödfallet ska
   överleva den flytten. */
interface DagPost {
  rates: DailyRates;
  from: string;
  to: string;
  at: number;
}
const dagCache = new Map<string, DagPost>();

/* Ett fönster vars sista dag saknar notering (i dag före ~16 CET, helg,
   helgdag) kollas igen efter en timme i stället för sex — annars dröjer det
   upp till sex timmar efter ECB:s publicering innan dagens egen kurs används.
   Historiska dagar i samma svar påverkas inte: de ändras aldrig. */
const TTL_OFULLSTANDIG = 60 * 60 * 1000;

/* Fönstret breddas en vecka bakåt: ECB publicerar inget på helger och
   helgdagar, och ett intervall som börjar en lördag (eller en påskmåndag)
   behöver kursen från vardagen före. `rateOn` går bakåt till den. */
const BREDDNING_DAGAR = 7;
/* Längsta bakåtsökning i `rateOn`. Täcker jul + nyår med helger. */
const MAX_BAKAT = 10;

const shiftIso = (iso: string, days: number): string => {
  const d = new Date(iso + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

/**
 * Kurser per dag för `from`→`to` över intervallet [fromDay, toDay].
 *
 * Returnerar en karta med ECB:s publicerade dagar (helger saknas — slå upp
 * med `rateOn`, som går bakåt till senaste notering). undefined = kunde inte
 * hämtas och inget nödfall fanns; anroparen ska då säga ifrån, aldrig gissa.
 *
 * Samma disciplin som `rate()`: två försök med timeout, fem minuters paus
 * efter ett misslyckande, och nödfall ur cachen i upp till sju dagar. I
 * nödfallet kan de sista dagarna sakna notering och får då den senast kända
 * kursen via `rateOn` — samma avvägning som för `rate()`: en dagsgammal kurs
 * på gårdagens rad är ett mindre fel än en butik som försvinner ur summan.
 */
export async function dailyRates(
  from: string,
  to: string,
  fromDay: string,
  toDay: string,
): Promise<DailyRates | undefined> {
  if (!from || !to || !fromDay || !toDay || fromDay > toDay) return undefined;
  if (from === to) {
    /* Samma valuta: kurs 1 varje dag, så anroparen slipper specialfallet. */
    const ettor: DailyRates = new Map();
    for (let d = fromDay; d <= toDay; d = shiftIso(d, 1)) ettor.set(d, 1);
    return ettor;
  }

  const start = shiftIso(fromDay, -BREDDNING_DAGAR);
  const key = `${from}>${to}`;
  const hit = dagCache.get(key);

  const tacker = (p: DagPost) => p.from <= start && p.to >= toDay;
  if (hit && tacker(hit)) {
    const ttl = hit.rates.has(toDay) ? TTL : TTL_OFULLSTANDIG;
    if (Date.now() - hit.at < ttl) return hit.rates;
  }

  /* Nödfall: cachen får bära intervallet om den täcker starten och når
     minst en vecka in mot slutet — resten överbryggas av `rateOn`:s
     bakåtsökning, vilket är exakt det "senast kända kursen"-beteende som
     `rate()` redan har. */
  const nodfall = () =>
    hit &&
    Date.now() - hit.at < NODFALL_TTL &&
    hit.from <= start &&
    hit.to >= shiftIso(toDay, -BREDDNING_DAGAR)
      ? hit.rates
      : undefined;

  const fel = misslyckadesVid.get(`dag:${key}`) ?? 0;
  if (Date.now() - fel < RETRY_PAUS) return nodfall();

  for (let försök = 0; försök < 2; försök++) {
    try {
      const res = await fetch(
        `https://api.frankfurter.dev/v1/${start}..${toDay}?base=${from}&symbols=${to}`,
        { signal: AbortSignal.timeout(10_000) },
      );
      if (!res.ok) continue;
      const body = await res.json();
      const nya: DailyRates = new Map();
      for (const [day, r] of Object.entries(body?.rates ?? {})) {
        const v = (r as Record<string, number> | undefined)?.[to];
        if (typeof v === "number" && v > 0) nya.set(day, v);
      }
      /* Ett svar utan en enda dag i ett fönster på minst en vecka är inget
         svar — behandla det som ett misslyckat försök. */
      if (!nya.size) continue;

      /* Slå ihop med det vi redan har. Det täckta fönstret förlängs bara om
         det nya överlappar eller ligger kant i kant — annars är det nya
         fönstret facit, och kartan får gärna bära gamla dagar ändå. */
      const rates: DailyRates = hit ? new Map(hit.rates) : new Map();
      for (const [d, v] of nya) rates.set(d, v);
      const overlappar = hit && start <= shiftIso(hit.to, 1) && toDay >= shiftIso(hit.from, -1);
      const post: DagPost = overlappar && hit
        ? { rates, from: hit.from < start ? hit.from : start, to: hit.to > toDay ? hit.to : toDay, at: Date.now() }
        : { rates, from: start, to: toDay, at: Date.now() };
      dagCache.set(key, post);
      misslyckadesVid.delete(`dag:${key}`);
      return post.rates;
    } catch {
      /* nästa försök, eller nödfallet nedan */
    }
  }

  misslyckadesVid.set(`dag:${key}`, Date.now());
  return nodfall();
}

/**
 * Kursen som gällde en viss dag. Helger och helgdagar saknar notering, och
 * dagens egen kommer först ~16 CET — då gäller den senast publicerade. Det
 * är också vad som gör historiken stabil: en dag som fått sin egen notering
 * slås alltid upp direkt och rör sig aldrig igen.
 * undefined = ingen notering inom tio dagar bakåt, alltså utanför kartan.
 */
export function rateOn(rates: DailyRates, day: string): number | undefined {
  let d = day;
  for (let i = 0; i <= MAX_BAKAT; i++) {
    const hit = rates.get(d);
    if (hit) return hit;
    d = shiftIso(d, -1);
  }
  return undefined;
}

/** Senaste publicerade dag i kartan på eller före `day`. Visas i UI:t. */
export function latestRateDay(rates: DailyRates, day: string): string | undefined {
  let d = day;
  for (let i = 0; i <= MAX_BAKAT; i++) {
    if (rates.has(d)) return d;
    d = shiftIso(d, -1);
  }
  return undefined;
}
