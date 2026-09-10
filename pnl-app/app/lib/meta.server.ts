/**
 * Annonskostnad per dag från Meta Marketing API.
 *
 * Dagar som redan är stängda ändrar sig inte, så de cachas i DailySpend och
 * hämtas aldrig om. Bara dagens (och gårdagens, som kan efterjusteras) hämtas
 * på nytt. Det håller oss långt under rate limits.
 */

import { createHash } from "node:crypto";
import prisma from "../db.server";
import { GRAPH_VERSION } from "./meta-login";

const GRAPH = `https://graph.facebook.com/${GRAPH_VERSION}`;

/**
 * Felkoder i stället för engelsk prosa: panelen översätter dem till butikens
 * språk och kan visa EN banner per läge. `error` (texten) finns kvar för
 * loggar och för anropare som bara frågar "gick det?".
 */
export type SpendErrorCode = "no-connection" | "expired" | "retrying" | "fetch-failed";

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
}

/** ShopSettings-fälten som styr filtret, i den form MetaConfig vill ha dem. */
export function kampanjFilter(s: {
  campaignMode?: string | null;
  campaignIds?: string | null;
}): Pick<MetaConfig, "campaignMode" | "campaignIds"> {
  return { campaignMode: s.campaignMode ?? null, campaignIds: s.campaignIds ?? null };
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
): Promise<Insight[]> {
  const url = new URL(`${GRAPH}/${kontoNamn(cfg.adAccountId)}/insights`);
  /* Utan filter: kontonivå, en rad per dag — oförändrat sedan v1 och det
     billigaste Meta kan svara. Med filter: kampanjnivå, för då måste svaret
     gå att kontrollera rad för rad (och summeras per dag här nere). */
  url.searchParams.set(
    "fields",
    filtering ? "campaign_id,spend,impressions,clicks,account_currency" : "spend,impressions,clicks,account_currency",
  );
  url.searchParams.set("time_range", JSON.stringify({ since, until }));
  url.searchParams.set("time_increment", "1");
  url.searchParams.set("level", filtering ? "campaign" : "account");
  if (filtering) url.searchParams.set("filtering", filtering);
  url.searchParams.set("limit", "500");

  /* Timeout: det här anropet awaitas numera även i gruppsummeringen — utan
     gräns blir ett hängt Meta-svar en panel som aldrig laddar. */
  return graphSidor(url, cfg.accessToken, filtering ? 40 : 3, 15_000) as Promise<Insight[]>;
}

/** Månadsbitar när filtret är på — annars spränger radantalet sidtaket. */
const SPANN_DAGAR = 31;

async function fetchInsights(cfg: MetaConfig, since: string, until: string): Promise<Insight[]> {
  const filtering = filterParam(cfg);
  if (!filtering) return hamtaInsightSpann(cfg, since, until, null);

  /* Kampanjnivå ger dagar × kampanjer rader: 90 dagar och 200 kampanjer är
     18 000 rader, långt bortom vad ett anrop orkar paginera. Spannet delas
     därför i månadsbitar. Bitarna hämtas i tur och ordning — parallellt hade
     bara gjort det lättare att slå i Metas rate limit. */
  const ut: Insight[] = [];
  let start = since;
  while (start <= until) {
    const kant = shiftIso(start, SPANN_DAGAR - 1);
    const slut = kant < until ? kant : until;
    ut.push(...(await hamtaInsightSpann(cfg, start, slut, filtering)));
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
async function fetchAccountCurrency(cfg: MetaConfig): Promise<string | undefined> {
  const account = cfg.adAccountId.startsWith("act_") ? cfg.adAccountId : `act_${cfg.adAccountId}`;
  const url = new URL(`${GRAPH}/${account}`);
  url.searchParams.set("fields", "currency");
  url.searchParams.set("access_token", cfg.accessToken);
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
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
 *
 * ⚠ NY ANROPARE: skicka ALLTID med `...kampanjFilter(settings)` i cfg.
 * `DailySpend` har ingen kampanjdimension — en anropare som glömmer filtret
 * skriver ofiltrerad spend över de filtrerade raderna i den delade tabellen,
 * och siffran hoppar beroende på vilken sida som laddades sist.
 */
export async function getSpend(
  shop: string,
  cfg: MetaConfig | null,
  from: string,
  to: string,
  today: string,
  shopCurrency?: string,
  storedSpendCurrency?: string | null,
  /** syncFresh: vänta in även rena färskhetsuppdateringar (gruppsumman) i
      stället för att servera gamla rader och hämta i bakgrunden (panelen).
      tokenExpired: anroparen VET att token gått ut (metaTokenExpiresAt har
      passerat) — då görs inget dömt anrop, och den dag som fortfarande rör
      sig serveras inte som om den vore färdig. */
  opts?: { syncFresh?: boolean; tokenExpired?: boolean },
): Promise<{
  days: { day: string; spend: number; impressions: number; clicks: number }[];
  error?: string;
  errorCode?: SpendErrorCode;
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
      ...(cached.length
        ? {}
        : { error: "Meta is not connected — ad spend is missing.", errorCode: "no-connection" as const }),
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

  /* fxOk speglar det som faktiskt SERVERAS: sant tills en rad i fönstret
     visar sig vara oomräknad. Tidigare startade den på false så fort valuta-
     omräkning behövdes och sattes bara av den synkrona hämtningen — så varje
     sidladdning som serverade cachen direkt (bakgrundsvägen, eller inget att
     hämta alls) visade "kunde inte räknas om"-bannern trots att allt var väl. */
  let fxOk = true;

  /* Backoff: en butik vars Meta-anrop nyss misslyckades (död token, rate
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
  const UTGANGEN_MSG = "The Meta token has expired — reconnect under Settings.";
  const rorlig = (day: string) => day >= today && stale.includes(day);
  const minnesFel = (e: unknown) => ({ at: Date.now(), utgangen: e instanceof MetaError && e.needsReauth });

  if (stale.length && !radSaknas && !opts?.syncFresh) {
    /* Alla dagar finns, bara färskheten släpar: servera databasen direkt och
       hämta i bakgrunden. Annonssiffror som är minuter gamla är rätt pris för
       en panel som svarar omedelbart. Säger minutspärren nej pågår (eller
       gjordes nyss) redan en hämtning — då serveras cachen som den är, den
       får INTE trilla ner i den synkrona grenen och blockera panelen. */
    if (!dod && !nyligenFel && farUppdateraMeta(shop)) {
      void refreshSpend(shop, cfg, stale, needsFx, spendCurrency, shopCurrency).catch((e) => {
        senasteMetaFel.set(felKey, minnesFel(e));
        console.error(`Meta-bakgrundshämtning för ${shop} misslyckades:`, e);
      });
    }
  } else if (stale.length && nyligenFel) {
    /* Senaste försöket small nyss: servera det som finns och FLAGGA — alltid.
       Hit kommer bara den som saknar rader eller väntar in färskhet
       (gruppsumman); utan flaggan räknade den in en butik vars annonskostnad
       stod stilla, och summan blev tyst för hög. */
    const utg = fel?.utgangen ?? false;
    return {
      days: cached
        .filter((r) => !(utg && rorlig(iso(r.day))))
        .map((r) => ({
          day: iso(r.day),
          spend: Number(r.spend),
          impressions: r.impressions,
          clicks: r.clicks,
        })),
      error: utg ? UTGANGEN_MSG : "Ad spend could not be fetched just now — retrying in a few minutes.",
      errorCode: utg ? ("expired" as const) : ("retrying" as const),
      ...fxStatus(
        needsFx,
        !cached.some((r) => r.fxRate == null && Number(r.spend) !== 0),
        spendCurrency,
        shopCurrency,
      ),
    };
  } else if (stale.length && !dod) {
    try {
      fxOk = await refreshSpend(shop, cfg, stale, needsFx, spendCurrency, shopCurrency);
      senasteMetaFel.delete(felKey);
    } catch (e) {
      senasteMetaFel.set(felKey, minnesFel(e));
      const utgangen = e instanceof MetaError && e.needsReauth;
      const msg = utgangen ? UTGANGEN_MSG : `Could not fetch ad spend: ${(e as Error).message}`;
      const cachadOomräknad =
        needsFx &&
        [...byDay.values()].some((r) => r.fxRate == null && Number(r.spend) !== 0);
      return {
        days: [...byDay.values()].map((r: any) => ({
          day: typeof r.day === "string" ? r.day : iso(r.day),
          spend: Number(r.spend),
          impressions: r.impressions,
          clicks: r.clicks,
        })),
        error: msg,
        errorCode: utgangen ? ("expired" as const) : ("fetch-failed" as const),
        ...fxStatus(needsFx, !cachadOomräknad, spendCurrency, shopCurrency),
      };
    }
  }

  const fresh = await prisma.dailySpend.findMany({
    where: { shop, day: { gte: new Date(from), lte: new Date(to) } },
    orderBy: { day: "asc" },
  });
  /* Facit är raderna som serveras: ligger det en oomräknad rad med belopp
     kvar i fönstret ska varningen visas, oavsett vilken väg hit vi tog. */
  if (needsFx && fresh.some((r) => r.fxRate == null && Number(r.spend) !== 0)) {
    fxOk = false;
  }
  /* Känd död token med dagar som skulle behövt hämtas om: den rörliga dagen
     hålls utanför svaret och felet sägs rakt ut. */
  const dodMedLuckor = dod && stale.length > 0;
  return {
    days: fresh
      .filter((r) => !(dodMedLuckor && rorlig(iso(r.day))))
      .map((r) => ({
        day: iso(r.day),
        spend: Number(r.spend),
        impressions: r.impressions,
        clicks: r.clicks,
      })),
    ...(dodMedLuckor ? { error: UTGANGEN_MSG, errorCode: "expired" as const } : {}),
    ...fxStatus(needsFx, fxOk, spendCurrency, shopCurrency),
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

/* Bakgrundshämtningar mot Meta: högst en per butik och minut. */
const senasteMeta = new Map<string, number>();
function farUppdateraMeta(shop: string): boolean {
  const t = senasteMeta.get(shop) ?? 0;
  if (Date.now() - t < 60_000) return false;
  senasteMeta.set(shop, Date.now());
  return true;
}

/**
 * Hämtar spannet från Meta och skriver DailySpend-rader. Dagar Meta inte
 * rapporterar (noll leverans) får en NOLLRAD — utan den räknas dagen som
 * "aldrig hämtad" för evigt och tvingar ett Meta-anrop på varje sidladdning.
 * Returnerar om valutaomräkningen (när den behövs) hade kurser.
 */
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
  const perDag = new Map<string, { raw: number; impressions: number; clicks: number }>();
  for (const r of rows) {
    if (tillat) {
      if (!r.campaign_id) {
        throw new MetaError("Meta returned ad spend without campaign id — the campaign filter could not be applied.");
      }
      if (!tillat(String(r.campaign_id))) continue;
    }
    const dag = perDag.get(r.date_start) ?? { raw: 0, impressions: 0, clicks: 0 };
    dag.raw += Number(r.spend ?? 0) || 0;
    dag.impressions += parseInt(r.impressions ?? "0", 10) || 0;
    dag.clicks += parseInt(r.clicks ?? "0", 10) || 0;
    perDag.set(r.date_start, dag);
  }

  for (const [day, v] of perDag) {
    const rate = needsFx ? rateFor(rates, day) : undefined;
    const rec = {
      spend: rate ? v.raw * rate : v.raw,
      spendRaw: needsFx ? v.raw : null,
      fxRate: rate ?? null,
      impressions: v.impressions,
      clicks: v.clicks,
    };
    await prisma.dailySpend.upsert({
      where: { shop_day: { shop, day: new Date(day) } },
      create: { shop, day: new Date(day), ...rec },
      update: { ...rec, fetchedAt: new Date() },
    });
  }
  const nollrad = { spend: 0, spendRaw: null, fxRate: null, impressions: 0, clicks: 0 };
  for (const day of stale) {
    if (perDag.has(day)) continue;
    await prisma.dailySpend.upsert({
      where: { shop_day: { shop, day: new Date(day) } },
      create: { shop, day: new Date(day), ...nollrad },
      update: { fetchedAt: new Date() },
    });
  }
  return fxOk;
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
