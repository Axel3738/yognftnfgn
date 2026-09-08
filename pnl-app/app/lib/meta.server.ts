/**
 * Annonskostnad per dag från Meta Marketing API, plus Meta-inloggningen.
 *
 * Dagar som redan är stängda ändrar sig inte, så de cachas i DailySpend och
 * hämtas aldrig om. Bara dagens (och gårdagens, som kan efterjusteras) hämtas
 * på nytt. Det håller oss långt under rate limits.
 *
 * Spend sparas i ANNONSKONTOTS valuta och räknas om till butikens valuta vid
 * läsning, dag för dag, med ECB-kursen (`fx.server.ts`).
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import prisma from "../db.server";
import { getRates, fxSammanfattning, type FxDay } from "./fx.server";

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

const normalizeAccount = (id: string) => (id.startsWith("act_") ? id : `act_${id}`);

async function graph<T = any>(path: string, params: Record<string, string>): Promise<T> {
  const url = new URL(`${GRAPH}/${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, { signal: AbortSignal.timeout(20_000) });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = body?.error ?? {};
    // 190 = token utgången/återkallad. Allt annat är oftast rate limit eller fel konto.
    throw new MetaError(err.message ?? `Meta svarade ${res.status}`, err.code, err.code === 190);
  }
  return body as T;
}

async function fetchInsights(cfg: MetaConfig, since: string, until: string): Promise<Insight[]> {
  const body = await graph<{ data?: Insight[] }>(`${normalizeAccount(cfg.adAccountId)}/insights`, {
    fields: "spend,impressions,clicks,account_currency",
    time_range: JSON.stringify({ since, until }),
    time_increment: "1",
    level: "account",
    limit: "500",
    access_token: cfg.accessToken,
  });
  return body?.data ?? [];
}

/** Annonskontots valuta och namn. Används när kontot väljs/sparas. */
export async function fetchAdAccountInfo(cfg: MetaConfig): Promise<{ name: string; currency: string }> {
  const body = await graph<{ name?: string; currency?: string }>(normalizeAccount(cfg.adAccountId), {
    fields: "name,currency",
    access_token: cfg.accessToken,
  });
  return { name: body.name ?? "", currency: body.currency ?? "" };
}

export interface SpendDayOut {
  day: string;
  /** I butikens valuta. */
  spend: number;
  impressions: number;
  clicks: number;
}

export interface SpendResult {
  days: SpendDayOut[];
  error?: string;
  /** Sätts när annonskontot står i annan valuta än butiken. */
  fx?: { from: string; to: string; min: number; max: number; senasteDag: string } | null;
}

/**
 * Returnerar spend per dag för fönstret, i butikens valuta. Cachade dagar
 * läses från databasen; bara det som saknas eller kan ha ändrats hämtas från
 * Meta.
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
  shopCurrency = "SEK",
): Promise<SpendResult> {
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  let error: string | undefined;

  if (cfg?.adAccountId && cfg?.accessToken) {
    const cached = await prisma.dailySpend.findMany({
      where: { shop, day: { gte: new Date(from), lte: new Date(to) } },
      select: { day: true },
    });
    const have = new Set(cached.map((r) => iso(r.day)));

    // Dagar utan cache, plus de två senaste (kan efterjusteras av Meta).
    const stale: string[] = [];
    for (let d = from; d <= to; d = shiftIso(d, 1)) {
      if (!have.has(d) || d >= shiftIso(today, -1)) stale.push(d);
    }

    if (stale.length) {
      try {
        const rows = await fetchInsights(cfg, stale[0], stale[stale.length - 1]);
        for (const r of rows) {
          const rec = {
            spend: Number(r.spend ?? 0),
            currency: r.account_currency ?? null,
            impressions: parseInt(r.impressions ?? "0", 10) || 0,
            clicks: parseInt(r.clicks ?? "0", 10) || 0,
          };
          await prisma.dailySpend.upsert({
            where: { shop_day: { shop, day: new Date(r.date_start) } },
            create: { shop, day: new Date(r.date_start), ...rec },
            update: { ...rec, fetchedAt: new Date() },
          });
        }
        /* Kontots valuta sparas på butiken första gången vi ser den, så att
           inställningssidan kan visa den utan ett extra Meta-anrop. */
        const seen = rows.find((r) => r.account_currency)?.account_currency;
        if (seen) {
          await prisma.shopSettings.updateMany({
            where: { shop, OR: [{ metaAdAccountCurrency: null }, { metaAdAccountCurrency: { not: seen } }] },
            data: { metaAdAccountCurrency: seen },
          });
        }
      } catch (e) {
        error =
          e instanceof MetaError && e.needsReauth
            ? "Meta-token har gått ut — koppla om under Inställningar."
            : `Kunde inte hämta annonskostnad: ${(e as Error).message}`;
      }
    }
  }

  const rows = await prisma.dailySpend.findMany({
    where: { shop, day: { gte: new Date(from), lte: new Date(to) } },
    orderBy: { day: "asc" },
  });

  if (!cfg?.adAccountId || !cfg?.accessToken) {
    error = rows.length ? undefined : "Meta är inte kopplat — annonskostnad saknas.";
  }

  /* Omräkning. Rader utan valuta är skrivna före valutastödet och tolkas som
     butikens valuta — de hämtas ändå om så fort kontot byts. */
  const currencies = new Set(rows.map((r) => r.currency ?? shopCurrency));
  const rates = new Map<string, Map<string, FxDay>>();
  const fxMissing: string[] = [];
  let fxError: string | undefined;
  for (const cur of currencies) {
    if (cur === shopCurrency) continue;
    const r = await getRates(cur, shopCurrency, from, to);
    rates.set(cur, r.byDay);
    fxMissing.push(...r.missing);
    if (r.error) fxError = r.error;
  }

  const days: SpendDayOut[] = [];
  for (const r of rows) {
    const day = iso(r.day);
    const cur = r.currency ?? shopCurrency;
    let spend = Number(r.spend);
    if (cur !== shopCurrency) {
      const fx = rates.get(cur)?.get(day);
      if (!fx) continue; // ingen kurs → dagen rapporteras som saknad, aldrig som noll
      spend = Math.round(spend * fx.rate * 100) / 100;
    }
    days.push({ day, spend, impressions: r.impressions, clicks: r.clicks });
  }

  if (fxMissing.length && !error) {
    error = `${fxError ?? "Växelkurs saknas"} — ${fxMissing.length} dagar utan omräknad annonskostnad.`;
  }

  let fx: SpendResult["fx"] = null;
  const foreign = [...currencies].find((c) => c !== shopCurrency);
  if (foreign) {
    const s = fxSammanfattning(rates.get(foreign) ?? new Map());
    if (s) fx = { from: foreign, to: shopCurrency, ...s };
  }

  return { days, error, fx };
}

function shiftIso(iso: string, days: number): string {
  const d = new Date(iso + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/* ------------------------------------------------------------------ */
/*  Meta-inloggning (knappen)                                           */
/* ------------------------------------------------------------------ */

/** Knappen finns bara när appen har en Meta-app att logga in mot. Utan
 *  META_APP_ID/META_APP_SECRET visas token-fältet som förut. */
export const metaOAuthEnabled = Boolean(
  process.env.META_APP_ID?.trim() && process.env.META_APP_SECRET?.trim(),
);

export const META_SCOPES = "ads_read";

export const metaRedirectUri = () => `${process.env.SHOPIFY_APP_URL}/meta/callback`;

/**
 * State-parametern bär butiken genom Meta-inloggningen och signeras så att
 * callbacken inte kan luras att spara en token på fel butik.
 */
export function signState(shop: string): string {
  const payload = `${shop}|${Date.now()}`;
  const sig = createHmac("sha256", process.env.SHOPIFY_API_SECRET!).update(payload).digest("hex");
  return Buffer.from(`${payload}|${sig}`).toString("base64url");
}

export function verifyState(state: string, maxAgeMs = 15 * 60 * 1000): string | null {
  let decoded: string;
  try {
    decoded = Buffer.from(state, "base64url").toString("utf8");
  } catch {
    return null;
  }
  const parts = decoded.split("|");
  if (parts.length !== 3) return null;
  const [shop, ts, sig] = parts;
  const expected = createHmac("sha256", process.env.SHOPIFY_API_SECRET!).update(`${shop}|${ts}`).digest("hex");
  const a = Buffer.from(sig, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  if (Date.now() - Number(ts) > maxAgeMs) return null;
  if (!/^[a-z0-9-]+\.myshopify\.com$/i.test(shop)) return null;
  return shop;
}

export function metaLoginUrl(state: string): string {
  const url = new URL("https://www.facebook.com/v21.0/dialog/oauth");
  url.searchParams.set("client_id", process.env.META_APP_ID!);
  url.searchParams.set("redirect_uri", metaRedirectUri());
  url.searchParams.set("state", state);
  url.searchParams.set("scope", META_SCOPES);
  url.searchParams.set("response_type", "code");
  return url.toString();
}

export interface MetaAdAccount {
  id: string; // utan act_
  name: string;
  currency: string;
}

/**
 * Byter koden mot en long-lived user token (~60 dagar) och listar
 * annonskontona den når. Två Meta-anrop plus ett för kontolistan.
 */
export async function completeMetaLogin(code: string): Promise<{
  accessToken: string;
  expiresAt: Date | null;
  accounts: MetaAdAccount[];
}> {
  const short = await graph<{ access_token: string }>("oauth/access_token", {
    client_id: process.env.META_APP_ID!,
    client_secret: process.env.META_APP_SECRET!,
    redirect_uri: metaRedirectUri(),
    code,
  });
  const long = await graph<{ access_token: string; expires_in?: number }>("oauth/access_token", {
    grant_type: "fb_exchange_token",
    client_id: process.env.META_APP_ID!,
    client_secret: process.env.META_APP_SECRET!,
    fb_exchange_token: short.access_token,
  });
  const accessToken = long.access_token ?? short.access_token;
  const expiresAt = long.expires_in ? new Date(Date.now() + long.expires_in * 1000) : null;

  const accounts: MetaAdAccount[] = [];
  let after: string | undefined;
  for (let page = 0; page < 10; page++) {
    const body = await graph<{
      data?: { account_id: string; name: string; currency: string }[];
      paging?: { cursors?: { after?: string }; next?: string };
    }>("me/adaccounts", {
      fields: "account_id,name,currency",
      limit: "100",
      access_token: accessToken,
      ...(after ? { after } : {}),
    });
    for (const a of body.data ?? []) accounts.push({ id: a.account_id, name: a.name, currency: a.currency });
    if (!body.paging?.next || !body.paging.cursors?.after) break;
    after = body.paging.cursors.after;
  }
  accounts.sort((a, b) => a.name.localeCompare(b.name, "sv"));
  return { accessToken, expiresAt, accounts };
}
