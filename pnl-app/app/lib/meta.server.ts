/**
 * Annonskostnad per dag från Meta Marketing API.
 *
 * Dagar som redan är stängda ändrar sig inte, så de cachas i DailySpend och
 * hämtas aldrig om. Bara dagens (och gårdagens, som kan efterjusteras) hämtas
 * på nytt. Det håller oss långt under rate limits.
 *
 * En butik kan ha FLERA annonskonton kopplade (2026-09-17). Varje konto
 * hämtas, cachas och räknas om för sig — de kan ligga i olika valutor och ha
 * olika kampanjfilter — och panelen får summan per dag. Ett konto som
 * krånglar stoppar inte de andra, men dagen det saknas på visas aldrig som
 * färdig: en för låg annonskostnad är en för hög vinst.
 */

import { createHash } from "node:crypto";
import prisma from "../db.server";
import { sparaKontovaluta } from "./meta-konton.server";
import { summeraDagar } from "./spend-summa";
import { GRAPH_VERSION, kontoId } from "./meta-login";
import { marknadskod } from "./marknad";
import { tidszonsOffset, timmeUrBreakdown } from "./timmar";
import { uppdateraGoogleSpend, type GoogleUtfall } from "./google-spend.server";
import { somKonto } from "./google-ads.server";

const GRAPH = `https://graph.facebook.com/${GRAPH_VERSION}`;

/**
 * Felkoder i stället för engelsk prosa: panelen översätter dem till butikens
 * språk och kan visa EN banner per läge. `error` (texten) finns kvar för
 * loggar och för anropare som bara frågar "gick det?".
 */
export type SpendErrorCode = "no-connection" | "expired" | "retrying" | "fetch-failed" | "google-expired";

export interface MetaConfig {
  adAccountId: string;
  accessToken: string;
  /**
   * Kampanjfilter: "all" (allt i kontot), "include" (bara de listade
   * kampanjerna) eller "exclude" (allt utom dem). Null/okänt = "all".
   * Finns för att flera butiker kan dela ETT annonskonto — utan filtret
   * räknar varje butik in de andras annonskostnad.
   */
  campaignMode?: string | null;
  /** Kampanj-ID:n, kommaseparerade. Tomt = inget filter, oavsett läge. */
  campaignIds?: string | null;
  /**
   * Annonskontots valuta som den är lagrad. Null = okänd, läses då från Meta
   * en gång och sparas. Ligger per konto: två konton på samma butik kan
   * mycket väl redovisa i SEK respektive USD.
   */
  spendCurrency?: string | null;
  /**
   * Kampanj → marknad (landskod): { "<kampanj-id>": "NO" }. Med minst en
   * märkning hämtas kostnaden på kampanjnivå och skrivs som en rad per
   * marknad och dag, så panelen kan filtrera "bara Norge". Omärkta kampanjer
   * hamnar på marknaden "". Null/tomt = hela kontot på "".
   */
  campaignMarkets?: Record<string, string> | null;
}

/** Marknaden en kampanj är märkt med. "" = omärkt. */
function kampanjMarknad(cfg: MetaConfig, campaignId: string): string {
  return marknadskod(cfg.campaignMarkets?.[campaignId]);
}

/** Finns någon marknadsmärkning alls? Då måste svaret komma per kampanj. */
function harMarknader(cfg: MetaConfig): boolean {
  return Object.values(cfg.campaignMarkets ?? {}).some((m) => marknadskod(m));
}

/** ID:n som filtret faktiskt gäller. Tom lista = inget filter. */
function kampanjIds(cfg: MetaConfig): string[] {
  if (cfg.campaignMode !== "include" && cfg.campaignMode !== "exclude") return [];
  return (cfg.campaignIds ?? "").split(",").map((s) => s.trim()).filter(Boolean);
}

/**
 * Predikat för vilka kampanjer som räknas. Null = alla (inget filter).
 *
 * Meta filtrerar redan serversidan (parametern nedan), men svaret kontrolleras
 * ändå rad för rad: skulle Meta ignorera filtret vill vi hellre räkna rätt än
 * att tyst servera hela kontots kostnad som butikens.
 */
function kampanjPredikat(cfg: MetaConfig): ((id: string) => boolean) | null {
  const ids = kampanjIds(cfg);
  if (!ids.length) return null;
  const set = new Set(ids);
  return cfg.campaignMode === "include" ? (id) => set.has(id) : (id) => !set.has(id);
}

/** Metas `filtering`-parameter för kampanjfiltret. Null = ingen parameter. */
function filterParam(cfg: MetaConfig): string | null {
  const ids = kampanjIds(cfg);
  if (!ids.length) return null;
  return JSON.stringify([
    { field: "campaign.id", operator: cfg.campaignMode === "include" ? "IN" : "NOT_IN", value: ids },
  ]);
}

interface Insight {
  date_start: string;
  spend?: string;
  impressions?: string;
  clicks?: string;
  /** Meta redovisar alltid i ANNONSKONTOTS valuta, inte butikens. */
  account_currency?: string;
  /** Bara vid kampanjfilter (level=campaign) — annars kontonivå utan id. */
  campaign_id?: string;
  /** Timbreakdown: "00:00:00 - 00:59:59", i ANNONSKONTOTS tidszon. */
  hourly_stats_aggregated_by_advertiser_time_zone?: string;
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

const kontoNamn = (id: string) => (id.startsWith("act_") ? id : `act_${id}`);

/**
 * Ett Graph-anrop med paginering. Token går i Authorization-headern, aldrig i
 * adressen — en loggad URL eller ett felmeddelande ska inte kunna läcka den.
 * Metas `paging.next` bär då ingen token, så headern skickas med varje sida.
 *
 * Nås sidtaket med fler sidor kvar KASTAS ett fel. Att returnera det halva
 * svaret vore att skriva en för låg annonskostnad — och därmed en för hög
 * vinst — utan att någon ser det. En tyst trunkering är det farligaste den
 * här filen kan göra; ett fel syns åtminstone som en banner i panelen.
 */
async function graphSidor(
  url: URL,
  token: string,
  maxSidor: number,
  timeoutMs: number,
): Promise<any[]> {
  const ut: any[] = [];
  let next: string | null = null;
  for (let sida = 0; sida < maxSidor; sida++) {
    const res = await fetch(next ?? url, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(timeoutMs),
    });
    const body: any = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = body?.error ?? {};
      // 190 = token utgången/återkallad. Allt annat är oftast rate limit eller fel konto.
      throw new MetaError(err.message ?? `Meta responded ${res.status}`, err.code, err.code === 190);
    }
    ut.push(...(body?.data ?? []));
    next = body?.paging?.next ?? null;
    if (!next) return ut;
  }
  throw new MetaError(`Meta returned more than ${maxSidor} pages — the answer would have been incomplete.`);
}

/** Ett spann på insights-endpointen. Filtret gör svaret kampanjuppdelat. */
async function hamtaInsightSpann(
  cfg: MetaConfig,
  since: string,
  until: string,
  filtering: string | null,
  kampanjniva: boolean,
  timvis = false,
): Promise<Insight[]> {
  const url = new URL(`${GRAPH}/${kontoNamn(cfg.adAccountId)}/insights`);
  /* Kontonivå: en rad per dag — oförändrat sedan v1 och det billigaste Meta
     kan svara. Kampanjnivå krävs av två skäl: ett kampanjfilter (svaret ska
     kontrolleras rad för rad) eller en marknadsmärkning (kostnaden ska delas
     per land). Summeras per dag här nere i båda fallen. */
  url.searchParams.set(
    "fields",
    kampanjniva ? "campaign_id,spend,impressions,clicks,account_currency" : "spend,impressions,clicks,account_currency",
  );
  url.searchParams.set("time_range", JSON.stringify({ since, until }));
  /* time_increment=1 MÅSTE stå kvar även med timbreakdown. Utan den svarar
     Meta med EN uppsättning om 24 timmar för HELA spannet, och varje stapel
     blir N dagar för stor — utan felmeddelande. */
  url.searchParams.set("time_increment", "1");
  if (timvis) url.searchParams.set("breakdowns", "hourly_stats_aggregated_by_advertiser_time_zone");
  url.searchParams.set("level", kampanjniva ? "campaign" : "account");
  if (filtering) url.searchParams.set("filtering", filtering);
  url.searchParams.set("limit", "500");

  /* Timeout: det här anropet awaitas numera även i gruppsummeringen — utan
     gräns blir ett hängt Meta-svar en panel som aldrig laddar. */
  /* Timbreakdown ger 24 rader per dag och kampanj i stället för en; taket
     höjs därefter. Spannet självt kapas till 31 dagar av anroparen. */
  const sidtak = timvis ? (kampanjniva ? 120 : 24) : kampanjniva ? 40 : 3;
  return graphSidor(url, cfg.accessToken, sidtak, 15_000) as Promise<Insight[]>;
}

/** Månadsbitar när svaret är per kampanj — annars spränger radantalet sidtaket. */
const SPANN_DAGAR = 31;

/** Timgrafen sträcker sig aldrig längre bakåt än så här. */
export const TIMFONSTER_DAGAR = 31;

/**
 * Annonskostnad per timme. Samma filter och samma marknadsmärkning som
 * dagsvägen — men aldrig mer än 31 dagar: med timbreakdown är svaret
 * dagar × kampanjer × 24 rader.
 */
async function fetchInsightsTimvis(cfg: MetaConfig, since: string, until: string): Promise<Insight[]> {
  const filtering = filterParam(cfg);
  const kampanjniva = Boolean(filtering) || harMarknader(cfg);
  return hamtaInsightSpann(cfg, since, until, filtering, kampanjniva, true);
}

async function fetchInsights(cfg: MetaConfig, since: string, until: string): Promise<Insight[]> {
  const filtering = filterParam(cfg);
  const kampanjniva = Boolean(filtering) || harMarknader(cfg);
  if (!kampanjniva) return hamtaInsightSpann(cfg, since, until, null, false);

  /* Kampanjnivå ger dagar × kampanjer rader: 90 dagar och 200 kampanjer är
     18 000 rader, långt bortom vad ett anrop orkar paginera. Spannet delas
     därför i månadsbitar. Bitarna hämtas i tur och ordning — parallellt hade
     bara gjort det lättare att slå i Metas rate limit. */
  const ut: Insight[] = [];
  let start = since;
  while (start <= until) {
    const kant = shiftIso(start, SPANN_DAGAR - 1);
    const slut = kant < until ? kant : until;
    ut.push(...(await hamtaInsightSpann(cfg, start, slut, filtering, true)));
    start = shiftIso(slut, 1);
  }
  return ut;
}

/** En kampanj i annonskontot, som kryssrutorna i Inställningar visar den. */
export interface MetaKampanj {
  id: string;
  name: string;
  /** Metas effective_status: ACTIVE, PAUSED, ARCHIVED … */
  status: string;
  /** Spend senaste 30 dagarna i ANNONSKONTOTS valuta (inte butikens). */
  spend30: number;
}

/**
 * Kampanjerna i kontot med spend senaste 30 dagarna — underlaget för att
 * kryssa i vilka som ska räknas. Namnen och spenden hämtas parallellt:
 * insights listar bara kampanjer som levererat, och en kampanj som ska
 * exkluderas kan mycket väl ha legat still den senaste månaden.
 */
export async function listaKampanjer(cfg: MetaConfig): Promise<MetaKampanj[]> {
  const konto = kontoNamn(cfg.adAccountId);

  const namnUrl = new URL(`${GRAPH}/${konto}/campaigns`);
  namnUrl.searchParams.set("fields", "id,name,effective_status");
  namnUrl.searchParams.set("limit", "200");

  const spendUrl = new URL(`${GRAPH}/${konto}/insights`);
  spendUrl.searchParams.set("fields", "campaign_id,campaign_name,spend");
  spendUrl.searchParams.set("level", "campaign");
  spendUrl.searchParams.set("date_preset", "last_30d");
  spendUrl.searchParams.set("limit", "500");

  const [namnRader, spendRader] = await Promise.all([
    graphSidor(namnUrl, cfg.accessToken, 10, 10_000),
    graphSidor(spendUrl, cfg.accessToken, 10, 12_000),
  ]);

  const spend = new Map<string, number>();
  const spendNamn = new Map<string, string>();
  for (const r of spendRader) {
    if (!r?.campaign_id) continue;
    spend.set(String(r.campaign_id), Number(r.spend ?? 0) || 0);
    if (r.campaign_name) spendNamn.set(String(r.campaign_id), String(r.campaign_name));
  }

  const ut = new Map<string, MetaKampanj>();
  for (const r of namnRader) {
    if (!r?.id) continue;
    const id = String(r.id);
    ut.set(id, {
      id,
      name: String(r.name ?? spendNamn.get(id) ?? id),
      status: String(r.effective_status ?? ""),
      spend30: spend.get(id) ?? 0,
    });
  }
  /* En kampanj som spenderat men inte kom med i /campaigns (arkiverad, eller
     bortom sidgränsen) får ändå synas — annars går den inte att kryssa bort. */
  for (const [id, belopp] of spend) {
    if (ut.has(id)) continue;
    ut.set(id, { id, name: spendNamn.get(id) ?? id, status: "", spend30: belopp });
  }

  return [...ut.values()].sort((a, b) => b.spend30 - a.spend30 || a.name.localeCompare(b.name));
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
      { signal: AbortSignal.timeout(10_000) },
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
/**
 * Kontots valuta OCH tidszon i ETT anrop. Tidszonen behövs för att lägga
 * Metas timmar på butikens klocka — timbreakdownen levereras i kontots zon.
 */
async function fetchAccountInfo(cfg: MetaConfig): Promise<{ currency?: string; timezone?: string }> {
  const account = cfg.adAccountId.startsWith("act_") ? cfg.adAccountId : `act_${cfg.adAccountId}`;
  const url = new URL(`${GRAPH}/${account}`);
  url.searchParams.set("fields", "currency,timezone_name");
  url.searchParams.set("access_token", cfg.accessToken);
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    const body = await res.json();
    if (!res.ok) return {};
    return { currency: body?.currency ?? undefined, timezone: body?.timezone_name ?? undefined };
  } catch {
    return {};
  }
}

const UTGANGEN_MSG = "The Meta token has expired — reconnect under Settings.";
const iso = (d: Date) => d.toISOString().slice(0, 10);

/** En DailySpend-rad, så mycket som summeringen bryr sig om. */
interface SpendRad {
  day: Date;
  account: string;
  market: string;
  spend: unknown;
  spendRaw: unknown;
  fxRate: unknown;
  impressions: number;
  clicks: number;
  fetchedAt: Date;
}

/** Databasraderna i den form den rena summeringen vill ha dem. */
const summerbara = (rader: SpendRad[]) =>
  rader.map((r) => ({
    day: iso(r.day),
    account: r.account,
    market: r.market,
    spend: Number(r.spend),
    impressions: r.impressions,
    clicks: r.clicks,
  }));

/** Vad ETT konto kom fram till under en körning. */
interface Kontoutfall {
  konto: string;
  error?: string;
  errorCode?: SpendErrorCode;
  needsFx: boolean;
  fxOk: boolean;
  /** Kontots valuta, när den är känd. */
  fran?: string | null;
  /**
   * Dagar som inte får serveras: kontot har en död token och dagen skulle ha
   * hämtats om. Att servera de ÖVRIGA kontonas kostnad för den dagen vore att
   * visa en för låg annonskostnad som om den vore hela sanningen.
   */
  doldaDagar: string[];
}

/**
 * Returnerar spend per dag för fönstret, summerad över butikens ALLA
 * annonskonton. Cachade dagar läses från databasen; bara det som saknas eller
 * kan ha ändrats hämtas från Meta, per konto.
 *
 * Kastar aldrig — ett fel returneras istället som `error` så att panelen kan
 * visa försäljningen ändå och flagga att TB är ofullständigt. Att tyst visa
 * noll annonskostnad vore värre än att visa ingenting.
 *
 * ⚠ NY ANROPARE: bygg listan med `konfigurationer()` i meta-konton.server.ts.
 * `DailySpend` har ingen kampanjdimension — en anropare som glömmer filtret
 * skriver ofiltrerad spend över de filtrerade raderna i den delade tabellen,
 * och siffran hoppar beroende på vilken sida som laddades sist.
 */
export async function getSpend(
  shop: string,
  konton: MetaConfig[] | null,
  from: string,
  to: string,
  today: string,
  shopCurrency?: string,
  /** syncFresh: vänta in även rena färskhetsuppdateringar (gruppsumman) i
      stället för att servera gamla rader och hämta i bakgrunden (panelen).
      tokenExpired: anroparen VET att token gått ut (metaTokenExpiresAt har
      passerat) — då görs inget dömt anrop, och den dag som fortfarande rör
      sig serveras inte som om den vore färdig.
      market: bara raderna märkta med den marknaden (landskod). Kampanjer
      utan märkning ligger på "" och räknas då inte med — de syns bara i
      vyn för alla marknader. */
  opts?: { syncFresh?: boolean; tokenExpired?: boolean; market?: string; perMarknad?: boolean },
): Promise<{
  days: { day: string; spend: number; impressions: number; clicks: number }[];
  /** Med `perMarknad` (och utan marknadsfilter): samma rader delade på
      kampanjernas marknadsmärkning, "" = omärkta kampanjer. Inga nya
      Meta-anrop — det är samma rader som `days` summerar. */
  byMarket?: Record<string, { day: string; spend: number; impressions: number; clicks: number }[]>;
  error?: string;
  errorCode?: SpendErrorCode;
  /* Sätts när ett annonskonto redovisar i en annan valuta än butiken OCH
     omräkningen misslyckades. Beloppen räknas då ihop som om de vore samma
     valuta — fel, och det måste synas. */
  currencyMismatch?: { spend: string; shop: string };
  /* Sätts när omräkningen lyckades. Informerar, varnar inte. */
  converted?: { from: string; to: string };
}> {
  const alla = (konton ?? [])
    .filter((c) => c && kontoId(c.adAccountId) && c.accessToken)
    .map((c) => ({ ...c, adAccountId: kontoId(c.adAccountId) }));

  const las = (): Promise<SpendRad[]> =>
    prisma.dailySpend.findMany({
      where: { shop, day: { gte: new Date(from), lte: new Date(to) } },
      orderBy: { day: "asc" },
    }) as unknown as Promise<SpendRad[]>;

  /* Google Ads skriver sina egna rader i SAMMA tabell (kontot `g:<id>`), så
     butiken får en annonskostnad i stället för två system att jämka ihop.
     Uppdateringen görs före läsningen, annars saknas dagens kostnad i den
     summa som just räknas. */
  const google = await uppdateraGoogleSpend(shop, from, to, today, shopCurrency, opts).catch((e) => {
    console.error(`Google-uppdatering för ${shop} misslyckades:`, (e as Error).message);
    return { konton: [] } as GoogleUtfall;
  });

  const cached = await las();

  if (!alla.length && !google.konton.length) {
    /* Ingen koppling: servera historiken som den är. Att filtrera på kopplade
       konton här hade raderat panelen för en butik som just kopplat bort. */
    return {
      days: summeraDagar(summerbara(cached)),
      ...(cached.length
        ? {}
        : { error: "Meta is not connected — ad spend is missing.", errorCode: "no-connection" as const }),
    };
  }

  /* Konto för konto, i tur och ordning. Parallellt hade bara gjort det
     lättare att slå i Metas rate limit, och kontona är sällan fler än tre. */
  const utfall: Kontoutfall[] = [];
  for (const cfg of alla) {
    utfall.push(await hamtaEttKonto(shop, cfg, cached, from, to, today, shopCurrency, opts));
  }

  const kopplade = new Set([...alla.map((c) => c.adAccountId), ...google.konton]);
  const marknad = marknadskod(opts?.market);
  const fresh = (await las()).filter((r) => kopplade.has(r.account) && (!marknad || r.market === marknad));

  /* Facit är raderna som serveras: ligger det en oomräknad rad med belopp kvar
     för ett konto ska varningen visas, oavsett vilken väg dit vi tog. */
  for (const u of utfall) {
    if (!u.needsFx) continue;
    const mina = fresh.filter((r) => r.account === u.konto);
    if (mina.some((r) => r.fxRate == null && Number(r.spend) !== 0)) u.fxOk = false;
  }

  const dolda = new Set(utfall.flatMap((u) => u.doldaDagar));
  /* Utgången token väger tyngst: den kräver en handling av handlaren, medan
     "försöker igen" går över av sig självt. */
  const varst =
    utfall.find((u) => u.errorCode === "expired") ?? utfall.find((u) => u.error);
  /* Googles fel visas när Meta inte redan har ett att visa: panelen har en
     rad för det här, och två samtidiga fel gör ingen klokare. En utgången
     Google-koppling väger dock lika tungt som Metas — den kräver en
     handling av handlaren. */
  const googleFel = google.error
    ? { error: google.error, errorCode: (google.utgangen ? "google-expired" : "retrying") as SpendErrorCode }
    : null;

  /* Valutorna som behövde räknas om, och de som inte gick. Googles konton
     räknas med på exakt samma villkor som Metas: lyckad omräkning
     informerar, misslyckad MÅSTE synas — annars adderas två valutor som om
     de vore en. */
  const valutor = (v: (string | null | undefined)[]) => [...new Set(v.filter(Boolean))].join(" + ");
  const behover = [
    ...utfall.filter((u) => u.needsFx).map((u) => u.fran),
    ...(google.fxFran ?? []),
    ...(google.fxSaknas ?? []),
  ];
  const misslyckade = [
    ...utfall.filter((u) => u.needsFx && !u.fxOk).map((u) => u.fran),
    ...(google.fxSaknas ?? []),
  ];

  let byMarket: Record<string, ReturnType<typeof summeraDagar>> | undefined;
  if (opts?.perMarknad && !marknad) {
    const grupper = new Map<string, SpendRad[]>();
    for (const r of fresh) {
      const m = r.market ?? "";
      if (!grupper.has(m)) grupper.set(m, []);
      grupper.get(m)!.push(r);
    }
    byMarket = Object.fromEntries([...grupper].map(([m, rader]) => [m, summeraDagar(summerbara(rader), dolda)]));
  }

  return {
    days: summeraDagar(summerbara(fresh), dolda),
    ...(byMarket ? { byMarket } : {}),
    ...(varst?.error
      ? { error: varst.error, errorCode: varst.errorCode }
      : googleFel
        ? googleFel
        : {}),
    ...(behover.length && shopCurrency
      ? misslyckade.length
        ? { currencyMismatch: { spend: valutor(misslyckade), shop: shopCurrency } }
        : { converted: { from: valutor(behover), to: shopCurrency } }
      : {}),
  };
}

/**
 * Ett kontos del av körningen: avgör vad som saknas, hämtar det som behövs och
 * rapporterar tillbaka. Skriver bara DailySpend-rader för sitt eget konto.
 */
async function hamtaEttKonto(
  shop: string,
  cfg: MetaConfig,
  cached: SpendRad[],
  from: string,
  to: string,
  today: string,
  shopCurrency: string | undefined,
  opts: { syncFresh?: boolean; tokenExpired?: boolean } | undefined,
): Promise<Kontoutfall> {
  const konto = cfg.adAccountId;
  const mina = cached.filter((r) => r.account === konto);
  /* Flera marknadsrader per dag skrivs alltid i samma vända, så färskheten
     kan läsas ur vilken som helst av dem. */
  const byDay = new Map<string, SpendRad>();
  for (const r of mina) if (!byDay.has(iso(r.day))) byDay.set(iso(r.day), r);

  /* Valutan lagras första gången den är känd och jämförs sedan vid varje
     laddning. Utan lagringen syntes krocken bara de gånger panelen råkade
     hämta färska dagar — och försvann så fort allt låg i cachen. */
  let spendCurrency = cfg.spendCurrency ?? null;
  if (!spendCurrency) {
    const info = await fetchAccountInfo(cfg);
    spendCurrency = info.currency ?? null;
    if (spendCurrency) await sparaKontovaluta(shop, konto, spendCurrency, info.timezone ?? null);
  }
  const needsFx = Boolean(spendCurrency && shopCurrency && spendCurrency !== shopCurrency);
  const bas = { konto, needsFx, fran: spendCurrency };

  /* Vad behöver hämtas om?
     - Dagar utan rad har aldrig hämtats (eller hade noll leverans — de får en
       nollrad vid hämtning, så de inte jagas för evigt).
     - Färska dagar (Meta efterjusterar) — men bara om raden är äldre än 10
       minuter. Det är skillnaden mellan "Meta på varje sidladdning" (sekunder
       av väntan vid varje datumbyte) och "Meta var tionde minut".
     - Dagar sparade före valutaomräkningen fanns saknar kurs — men bara om
       det finns något att räkna om: en nollrad är noll i alla valutor, och
       att jaga den för evigt var precis det nollraderna skulle förhindra. */
  const FERSK_MS = 10 * 60 * 1000;
  const stale: string[] = [];
  let radSaknas = false;
  for (let d = from; d <= to; d = shiftIso(d, 1)) {
    const cachedRow = byDay.get(d);
    const recent = d >= shiftIso(today, -1);
    const gammal =
      cachedRow && recent && Date.now() - cachedRow.fetchedAt.getTime() > FERSK_MS;
    const oräknad =
      needsFx && cachedRow && cachedRow.fxRate == null && Number(cachedRow.spend) !== 0;
    /* En dag som konverterades samma dag den hämtades kan ha fått gårdagens
       kurs (ECB publicerar först på eftermiddagen). Hämtas om en gång när en
       senare dag passerat, så att den slutliga kursen blir dagens egen. */
    const provisorisk =
      needsFx && cachedRow && cachedRow.fxRate != null && cachedRow.spendRaw != null &&
      iso(cachedRow.fetchedAt) <= d;
    if (!cachedRow || gammal || oräknad || provisorisk) {
      stale.push(d);
      /* Bara helt saknade rader tvingar en synkron hämtning — oomräknade och
         provisoriska rader är servebara och får rättas via bakgrundsvägen. */
      if (!cachedRow) radSaknas = true;
    }
  }

  /* Backoff: ett konto vars Meta-anrop nyss misslyckades (död token, rate
     limit) ska inte betala ett nytt dömt anrop på varje sidladdning. Cachen
     serveras och `error` sätts så anroparen vet att spend är ofullständig. */
  const felKey = felNyckel(shop, cfg);
  const fel = senasteMetaFel.get(felKey);
  const nyligenFel = Date.now() - (fel?.at ?? 0) < 5 * 60 * 1000;
  /* Död token: anroparen vet att utgången passerat, eller senaste försöket
     gav 190. En död token är inte en hicka — inget nytt anrop, och dagen
     som fortfarande rör sig får inte serveras som om den vore färdig. Utan
     den i svaret listar compute() dagen som saknad, och panelen säger "för
     hög — annonsdata saknas" i stället för grönt. */
  const dod = Boolean(opts?.tokenExpired) || (nyligenFel && fel?.utgangen === true);
  const rorligaStale = () => stale.filter((d) => d >= today);
  const minnesFel = (e: unknown) => ({ at: Date.now(), utgangen: e instanceof MetaError && e.needsReauth });

  if (stale.length && !radSaknas && !opts?.syncFresh) {
    /* Alla dagar finns, bara färskheten släpar: servera databasen direkt och
       hämta i bakgrunden. Annonssiffror som är minuter gamla är rätt pris för
       en panel som svarar omedelbart. Säger minutspärren nej pågår (eller
       gjordes nyss) redan en hämtning — då serveras cachen som den är, den
       får INTE trilla ner i den synkrona grenen och blockera panelen. */
    if (!dod && !nyligenFel && farUppdateraMeta(shop, konto)) {
      void refreshSpend(shop, cfg, stale, needsFx, spendCurrency, shopCurrency).catch((e) => {
        senasteMetaFel.set(felKey, minnesFel(e));
        console.error(`Meta-bakgrundshämtning för ${shop} (konto ${konto}) misslyckades:`, e);
      });
    }
    return { ...bas, fxOk: true, doldaDagar: [] };
  }

  if (stale.length && nyligenFel) {
    /* Senaste försöket small nyss: servera det som finns och FLAGGA — alltid.
       Hit kommer bara den som saknar rader eller väntar in färskhet
       (gruppsumman); utan flaggan räknade den in en butik vars annonskostnad
       stod stilla, och summan blev tyst för hög. */
    const utg = fel?.utgangen ?? false;
    return {
      ...bas,
      fxOk: !mina.some((r) => r.fxRate == null && Number(r.spend) !== 0),
      error: utg ? UTGANGEN_MSG : "Ad spend could not be fetched just now — retrying in a few minutes.",
      errorCode: utg ? ("expired" as const) : ("retrying" as const),
      doldaDagar: utg ? rorligaStale() : [],
    };
  }

  if (stale.length && !dod) {
    try {
      const fxOk = await refreshSpend(shop, cfg, stale, needsFx, spendCurrency, shopCurrency);
      senasteMetaFel.delete(felKey);
      return { ...bas, fxOk, doldaDagar: [] };
    } catch (e) {
      senasteMetaFel.set(felKey, minnesFel(e));
      const utgangen = e instanceof MetaError && e.needsReauth;
      return {
        ...bas,
        fxOk: !(needsFx && mina.some((r) => r.fxRate == null && Number(r.spend) !== 0)),
        error: utgangen ? UTGANGEN_MSG : `Could not fetch ad spend: ${(e as Error).message}`,
        errorCode: utgangen ? ("expired" as const) : ("fetch-failed" as const),
        doldaDagar: utgangen ? rorligaStale() : [],
      };
    }
  }

  /* Känd död token med dagar som skulle behövt hämtas om: den rörliga dagen
     hålls utanför svaret och felet sägs rakt ut. */
  const dodMedLuckor = dod && stale.length > 0;
  return {
    ...bas,
    fxOk: true,
    ...(dodMedLuckor ? { error: UTGANGEN_MSG, errorCode: "expired" as const } : {}),
    doldaDagar: dodMedLuckor ? rorligaStale() : [],
  };
}

/* Senaste misslyckade Meta-hämtningen per butik — styr backoffen ovan.
   Nyckeln bär även ett kort avtryck av token: en ny token efter "logga in
   igen" ska inte ärva den gamla tokens fem minuters paus — inte ens i de
   fem andra processerna, som inte får veta att någon loggat in. */
const senasteMetaFel = new Map<string, { at: number; utgangen: boolean }>();
const felNyckel = (shop: string, cfg: MetaConfig) =>
  `${shop}:${createHash("sha256").update(cfg.accessToken).digest("hex").slice(0, 8)}:${cfg.adAccountId.replace(/^act_/i, "")}`;

/** Glöm backoffen för butiken (ny token sparad, koppling borttagen). */
export function glomMetaFel(shop: string): void {
  for (const k of [...senasteMetaFel.keys()]) if (k.startsWith(`${shop}:`)) senasteMetaFel.delete(k);
}

/* Bakgrundshämtningar mot Meta: högst en per KONTO och minut. Nyckeln bär
   kontot, annars fick bara det första kontot uppdateras och butikens andra
   konto låg kvar på gamla siffror tills någon råkade ladda om vid rätt minut. */
const senasteMeta = new Map<string, number>();
function farUppdateraMeta(shop: string, konto: string): boolean {
  const nyckel = `${shop}:${konto}`;
  const t = senasteMeta.get(nyckel) ?? 0;
  if (Date.now() - t < 60_000) return false;
  senasteMeta.set(nyckel, Date.now());
  return true;
}

/**
 * Hämtar spannet från Meta och skriver DailySpend-rader. Dagar Meta inte
 * rapporterar (noll leverans) får en NOLLRAD — utan den räknas dagen som
 * "aldrig hämtad" för evigt och tvingar ett Meta-anrop på varje sidladdning.
 * Returnerar om valutaomräkningen (när den behövs) hade kurser.
 */
/**
 * Annonskostnad per timme på dygnet, lagd på BUTIKENS klocka.
 *
 * Tre saker som annars ger ett tyst fel:
 *  - `dagar` måste vara exakt de dagar försäljningen räknades på. Delas 30
 *    dagars spend med 12 dagars omsättning ser ROAS ut att vara en tredjedel.
 *  - Metas timmar ligger i ANNONSKONTOTS tidszon. Skiljer den sig från
 *    butikens förskjuts hinkarna; går skillnaden inte att räkna i hela
 *    timmar returneras `offset: null` och panelen visar ingen ROAS alls.
 *  - Bara kopplade konton, och marknadsfiltret på läsning — samma regler som
 *    dagsvägen i `getSpend`.
 */
export async function timvisSpend(
  shop: string,
  konton: MetaConfig[] | null,
  dagar: string[],
  butikensTidszon: string,
  market = "",
): Promise<{ timmar: number[]; offset: number | null } | null> {
  const metaKonton = (konton ?? []).map((c) => kontoId(c.adAccountId)).filter(Boolean);
  /* Google Ads skriver timrader i samma tabell och deltar på samma villkor —
     inklusive tidszonskravet nedan. */
  const googleKonton = await prisma.googleAdsAccount.findMany({
    where: { shop },
    select: { customerId: true, timezoneName: true },
  });
  const kopplade = [...metaKonton, ...googleKonton.map((k) => somKonto(k.customerId))];
  if (!kopplade.length || !dagar.length) return null;

  const [rader, konton2] = await Promise.all([
    prisma.hourlySpend.findMany({
      where: {
        shop,
        account: { in: kopplade },
        day: { in: dagar.map((d) => new Date(d)) },
        ...(market ? { market } : {}),
      },
    }),
    prisma.metaAdAccount.findMany({
      where: { shop, accountId: { in: metaKonton } },
      select: { timezoneName: true },
    }),
  ]);
  if (!rader.length) return null;

  /* Offseten räknas mot mitten av intervallet: den är konstant för alla
     zonpar butiken kan ha, och en förskjutning per dag vore mycket arbete
     för de tre dagar om året då EU och USA byter sommartid olika. */
  const mitt = dagar[Math.floor(dagar.length / 2)];
  const zoner = [
    ...new Set([...konton2, ...googleKonton].map((k) => k.timezoneName).filter(Boolean)),
  ] as string[];
  const offsets = zoner.map((z) => tidszonsOffset(z, butikensTidszon, mitt));
  /* Flera konton i olika zoner, eller en okänd zon: går inte att lägga på en
     gemensam klocka. Hellre ingen ROAS än en förskjuten. */
  const offset =
    offsets.length === 1 ? offsets[0] : offsets.length && offsets.every((o) => o === 0) ? 0 : null;
  if (offset == null) return { timmar: Array(24).fill(0), offset: null };

  const timmar: number[] = Array(24).fill(0);
  for (const r of rader) timmar[(((r.hour - offset) % 24) + 24) % 24] += r.spend;
  return { timmar, offset };
}

async function refreshSpend(
  shop: string,
  cfg: MetaConfig,
  stale: string[],
  needsFx: boolean,
  spendCurrency?: string | null,
  shopCurrency?: string,
): Promise<boolean> {
  const rows = await fetchInsights(cfg, stale[0], stale[stale.length - 1]);

  /* Fönstret breddas en vecka bakåt: ECB publicerar dagens kurs först på
     eftermiddagen, så "idag" (och helgdagar) konverteras med senast
     publicerade kurs via rateFor:s bakåtsökning. Utan breddningen var ett
     fönster som bara innehöll idag alltid tomt — och dagens spend skrevs
     oomräknad i butikens valuta. */
  const rates = needsFx
    ? await fetchRates(spendCurrency!, shopCurrency!, shiftIso(stale[0], -7), stale[stale.length - 1])
    : new Map<string, number>();
  const fxOk = !needsFx || rates.size > 0;

  /* Med kampanjfilter kommer svaret på kampanjnivå: flera rader per dag som
     ska summeras. Utan filter är det redan en rad per dag och går genom exakt
     samma väg. Kontrollen av campaign_id är avsiktligt hård — ett svar utan
     id betyder att filtret inte tillämpades, och då är hela kontots kostnad
     på väg in i butikens vinst. Hellre ett fel i panelen än en tyst lögn. */
  const tillat = kampanjPredikat(cfg);
  const marknader = harMarknader(cfg);
  /* Per dag OCH marknad. Utan märkning finns bara marknaden "" och det blir
     exakt en rad per dag, som förut. */
  const perDag = new Map<string, Map<string, { raw: number; impressions: number; clicks: number }>>();
  for (const r of rows) {
    if (tillat || marknader) {
      if (!r.campaign_id) {
        throw new MetaError("Meta returned ad spend without campaign id — the campaign filter could not be applied.");
      }
      if (tillat && !tillat(String(r.campaign_id))) continue;
    }
    const marknad = marknader ? kampanjMarknad(cfg, String(r.campaign_id)) : "";
    const dagens = perDag.get(r.date_start) ?? new Map();
    const hink = dagens.get(marknad) ?? { raw: 0, impressions: 0, clicks: 0 };
    hink.raw += Number(r.spend ?? 0) || 0;
    hink.impressions += parseInt(r.impressions ?? "0", 10) || 0;
    hink.clicks += parseInt(r.clicks ?? "0", 10) || 0;
    dagens.set(marknad, hink);
    perDag.set(r.date_start, dagens);
  }

  /* Raden hör till ETT konto. Utan kontot i nyckeln skrev butikens andra
     annonskonto över det förstas dag, och hälften av annonskostnaden försvann
     utan att något såg fel ut. Dagens rader skrivs om i sin helhet (radera +
     skriv i en transaktion): en kampanj som flyttats till en annan marknad
     ska inte lämna sin gamla marknadsrad kvar och räknas två gånger. */
  const konto = kontoId(cfg.adAccountId);
  const nu = new Date();
  const nollrad = { spend: 0, spendRaw: null, fxRate: null, impressions: 0, clicks: 0 };
  for (const day of stale) {
    const dagens = perDag.get(day);
    const rate = needsFx ? rateFor(rates, day) : undefined;
    const nya = dagens
      ? [...dagens.entries()].map(([market, v]) => ({
          shop,
          day: new Date(day),
          account: konto,
          market,
          spend: rate ? v.raw * rate : v.raw,
          spendRaw: needsFx ? v.raw : null,
          fxRate: rate ?? null,
          impressions: v.impressions,
          clicks: v.clicks,
          fetchedAt: nu,
        }))
      : /* Ingen leverans den dagen: en NOLLRAD, annars jagas dagen för evigt. */
        [{ shop, day: new Date(day), account: konto, market: "", ...nollrad, fetchedAt: nu }];
    await prisma.$transaction([
      prisma.dailySpend.deleteMany({ where: { shop, account: konto, day: new Date(day) } }),
      prisma.dailySpend.createMany({ data: nya }),
    ]);
  }

  /* Timmarna, ur SAMMA dagar, SAMMA filter och SAMMA kurs som dagsraderna
     ovan — då kan summan av timmarna inte bli något annat än dagen. Ett eget
     anrop (Meta ger inte båda i ett svar), men bara för dagar som ändå
     hämtades om, och aldrig mer än 31 dagar bakåt. */
  const timGrans = shiftIso(stale[stale.length - 1], -(TIMFONSTER_DAGAR - 1));
  const timDagar = stale.filter((d) => d >= timGrans);
  if (timDagar.length) {
    try {
      const timRader = await fetchInsightsTimvis(cfg, timDagar[0], timDagar[timDagar.length - 1]);
      type Hink = { raw: number; impressions: number; clicks: number };
      const perTimme = new Map<string, Map<string, Map<number, Hink>>>();
      for (const r of timRader) {
        const timme = timmeUrBreakdown(r.hourly_stats_aggregated_by_advertiser_time_zone);
        if (timme == null) continue;
        if (tillat && r.campaign_id && !tillat(String(r.campaign_id))) continue;
        const marknad = marknader && r.campaign_id ? kampanjMarknad(cfg, String(r.campaign_id)) : "";
        const dagens = perTimme.get(r.date_start) ?? new Map<string, Map<number, Hink>>();
        const perLand = dagens.get(marknad) ?? new Map<number, Hink>();
        const hink = perLand.get(timme) ?? { raw: 0, impressions: 0, clicks: 0 };
        hink.raw += Number(r.spend ?? 0) || 0;
        hink.impressions += parseInt(r.impressions ?? "0", 10) || 0;
        hink.clicks += parseInt(r.clicks ?? "0", 10) || 0;
        perLand.set(timme, hink);
        dagens.set(marknad, perLand);
        perTimme.set(r.date_start, dagens);
      }
      for (const day of timDagar) {
        const rate = needsFx ? rateFor(rates, day) : undefined;
        const nya: any[] = [];
        for (const [market, perLand] of perTimme.get(day) ?? []) {
          for (const [hour, v] of perLand) {
            nya.push({
              shop,
              day: new Date(day),
              account: konto,
              market,
              hour,
              spend: rate ? v.raw * rate : v.raw,
              impressions: v.impressions,
              clicks: v.clicks,
              fetchedAt: nu,
            });
          }
        }
        await prisma.$transaction([
          prisma.hourlySpend.deleteMany({ where: { shop, account: konto, day: new Date(day) } }),
          ...(nya.length ? [prisma.hourlySpend.createMany({ data: nya })] : []),
        ]);
      }
    } catch (e) {
      /* Timmarna är en extra vy, inte panelens siffror. Faller de bort ska
         dagsraderna som just skrevs stå kvar — annars tar en timgraf ner
         hela vinsträkningen. */
      console.error(`Timvis annonskostnad misslyckades för ${shop}/${konto}:`, e);
    }
  }
  return fxOk;
}

function shiftIso(iso: string, days: number): string {
  const d = new Date(iso + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
