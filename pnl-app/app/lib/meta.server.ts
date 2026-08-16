/**
 * Annonskostnad per dag från Meta Marketing API.
 *
 * Dagar som redan är stängda ändrar sig inte, så de cachas i DailySpend och
 * hämtas aldrig om. Bara dagens (och gårdagens, som kan efterjusteras) hämtas
 * på nytt. Det håller oss långt under rate limits.
 */

import prisma from "../db.server";

const GRAPH = "https://graph.facebook.com/v21.0";

export interface MetaConfig {
  adAccountId: string;
  accessToken: string;
}

interface Insight {
  date_start: string;
  spend?: string;
  impressions?: string;
  clicks?: string;
  /** Meta redovisar alltid i ANNONSKONTOTS valuta, inte butikens. */
  account_currency?: string;
}

export class MetaError extends Error {
  constructor(
    message: string,
    readonly code?: number,
    readonly needsReauth = false,
  ) {
    super(message);
  }
}

async function fetchInsights(cfg: MetaConfig, since: string, until: string): Promise<Insight[]> {
  const account = cfg.adAccountId.startsWith("act_") ? cfg.adAccountId : `act_${cfg.adAccountId}`;
  const url = new URL(`${GRAPH}/${account}/insights`);
  url.searchParams.set("fields", "spend,impressions,clicks,account_currency");
  url.searchParams.set("time_range", JSON.stringify({ since, until }));
  url.searchParams.set("time_increment", "1");
  url.searchParams.set("level", "account");
  url.searchParams.set("limit", "500");
  url.searchParams.set("access_token", cfg.accessToken);

  const res = await fetch(url);
  const body = await res.json();

  if (!res.ok) {
    const err = body?.error ?? {};
    // 190 = token utgången/återkallad. Allt annat är oftast rate limit eller fel konto.
    throw new MetaError(err.message ?? `Meta responded ${res.status}`, err.code, err.code === 190);
  }
  return body?.data ?? [];
}

/**
 * Dagskurser från Frankfurter (ECB:s publicerade kurser). Gratis, utan nyckel.
 *
 * Historiska dagar räknas om med kursen som gällde DEN dagen, inte dagens —
 * annars ändras gårdagens vinst varje gång kronan rör sig, och en jämförelse
 * mot förra veckan mäter valutamarknaden istället för butiken.
 */
async function fetchRates(
  base: string,
  quote: string,
  from: string,
  to: string,
): Promise<Map<string, number>> {
  const out = new Map<string, number>();
  try {
    const res = await fetch(
      `https://api.frankfurter.dev/v1/${from}..${to}?base=${base}&symbols=${quote}`,
    );
    if (!res.ok) return out;
    const body = await res.json();
    for (const [day, r] of Object.entries(body?.rates ?? {})) {
      const v = (r as Record<string, number>)?.[quote];
      if (typeof v === "number") out.set(day, v);
    }
  } catch {
    /* Nätverksfel: tom karta → ingen omräkning, och panelen säger ifrån. */
  }
  return out;
}

/** Kurs för en dag. Helger och helgdagar saknar notering — gå bakåt till senaste. */
function rateFor(rates: Map<string, number>, day: string): number | undefined {
  let d = day;
  for (let i = 0; i < 10; i++) {
    const hit = rates.get(d);
    if (hit) return hit;
    d = shiftIso(d, -1);
  }
  return undefined;
}

/**
 * Annonskontots valuta, hämtad direkt från kontot.
 *
 * Den gick tidigare bara att läsa ur insights-raderna, vilket gjorde
 * upptäckten beroende av att det fanns leverans i fönstret och att panelen
 * råkade hämta färska dagar. Ett konto utan visningar såg då korrekt ut.
 */
async function fetchAccountCurrency(cfg: MetaConfig): Promise<string | undefined> {
  const account = cfg.adAccountId.startsWith("act_") ? cfg.adAccountId : `act_${cfg.adAccountId}`;
  const url = new URL(`${GRAPH}/${account}`);
  url.searchParams.set("fields", "currency");
  url.searchParams.set("access_token", cfg.accessToken);
  try {
    const res = await fetch(url);
    const body = await res.json();
    return res.ok ? (body?.currency ?? undefined) : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Returnerar spend per dag för fönstret. Cachade dagar läses från databasen;
 * bara det som saknas eller kan ha ändrats hämtas från Meta.
 *
 * Kastar aldrig — ett fel returneras istället som `error` så att panelen kan
 * visa försäljningen ändå och flagga att TB är ofullständigt. Att tyst visa
 * noll annonskostnad vore värre än att visa ingenting.
 */
export async function getSpend(
  shop: string,
  cfg: MetaConfig | null,
  from: string,
  to: string,
  today: string,
  shopCurrency?: string,
  storedSpendCurrency?: string | null,
): Promise<{
  days: { day: string; spend: number; impressions: number; clicks: number }[];
  error?: string;
  /* Sätts när annonskontot redovisar i en annan valuta än butiken OCH
     omräkningen misslyckades. Beloppen räknas då ihop som om de vore samma
     valuta — fel, och det måste synas. */
  currencyMismatch?: { spend: string; shop: string };
  /* Sätts när omräkningen lyckades. Informerar, varnar inte. */
  converted?: { from: string; to: string };
}> {
  const cached = await prisma.dailySpend.findMany({
    where: { shop, day: { gte: new Date(from), lte: new Date(to) } },
    orderBy: { day: "asc" },
  });

  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const byDay = new Map(cached.map((r) => [iso(r.day), r]));

  if (!cfg?.adAccountId || !cfg?.accessToken) {
    return {
      days: cached.map((r) => ({
        day: iso(r.day),
        spend: Number(r.spend),
        impressions: r.impressions,
        clicks: r.clicks,
      })),
      error: cached.length ? undefined : "Meta is not connected — ad spend is missing.",
    };
  }

  /* Valutan lagras första gången den är känd och jämförs sedan vid varje
     laddning. Utan lagringen syntes krocken bara de gånger panelen råkade
     hämta färska dagar — och försvann så fort allt låg i cachen. */
  let spendCurrency = storedSpendCurrency;
  if (!spendCurrency) {
    spendCurrency = await fetchAccountCurrency(cfg);
    if (spendCurrency) {
      await prisma.shopSettings
        .update({ where: { shop }, data: { spendCurrency } })
        .catch(() => {});
    }
  }
  const needsFx = Boolean(spendCurrency && shopCurrency && spendCurrency !== shopCurrency);

  // Dagar utan cache, plus de två senaste (kan efterjusteras av Meta). Dagar
  // som sparats före omräkningen fanns saknar kurs och måste hämtas om.
  const stale: string[] = [];
  for (let d = from; d <= to; d = shiftIso(d, 1)) {
    const cachedRow = byDay.get(d);
    const recent = d >= shiftIso(today, -1);
    const oräknad = needsFx && cachedRow && cachedRow.fxRate == null;
    if (!cachedRow || recent || oräknad) stale.push(d);
  }

  let fxOk = !needsFx;

  if (stale.length) {
    try {
      const rows = await fetchInsights(cfg, stale[0], stale[stale.length - 1]);

      const rates = needsFx
        ? await fetchRates(spendCurrency!, shopCurrency!, stale[0], stale[stale.length - 1])
        : new Map<string, number>();
      if (needsFx && rates.size) fxOk = true;

      for (const r of rows) {
        const day = r.date_start;
        const raw = Number(r.spend ?? 0);
        const rate = needsFx ? rateFor(rates, day) : undefined;
        const rec = {
          spend: rate ? raw * rate : raw,
          spendRaw: needsFx ? raw : null,
          fxRate: rate ?? null,
          impressions: parseInt(r.impressions ?? "0", 10) || 0,
          clicks: parseInt(r.clicks ?? "0", 10) || 0,
        };
        await prisma.dailySpend.upsert({
          where: { shop_day: { shop, day: new Date(day) } },
          create: { shop, day: new Date(day), ...rec },
          update: { ...rec, fetchedAt: new Date() },
        });
        byDay.set(day, { ...(byDay.get(day) as any), day: new Date(day), ...rec });
      }
    } catch (e) {
      const msg =
        e instanceof MetaError && e.needsReauth
          ? "The Meta token has expired — reconnect under Settings."
          : `Could not fetch ad spend: ${(e as Error).message}`;
      return {
        days: [...byDay.values()].map((r: any) => ({
          day: typeof r.day === "string" ? r.day : iso(r.day),
          spend: Number(r.spend),
          impressions: r.impressions,
          clicks: r.clicks,
        })),
        error: msg,
        ...fxStatus(needsFx, fxOk, spendCurrency, shopCurrency),
      };
    }
  }

  const fresh = await prisma.dailySpend.findMany({
    where: { shop, day: { gte: new Date(from), lte: new Date(to) } },
    orderBy: { day: "asc" },
  });
  return {
    days: fresh.map((r) => ({
      day: iso(r.day),
      spend: Number(r.spend),
      impressions: r.impressions,
      clicks: r.clicks,
    })),
    ...fxStatus(needsFx, fxOk, spendCurrency, shopCurrency),
  };
}

/** Omräkning lyckad → informera. Behövdes men gick inte → varna. */
function fxStatus(needsFx: boolean, ok: boolean, from?: string, to?: string) {
  if (!needsFx || !from || !to) return {};
  return ok
    ? { converted: { from, to } }
    : { currencyMismatch: { spend: from, shop: to } };
}

function shiftIso(iso: string, days: number): string {
  const d = new Date(iso + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
