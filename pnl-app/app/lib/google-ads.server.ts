/**
 * Google Ads: koppling, kontolistning och annonskostnad.
 *
 * Speglar `meta.server.ts` och `meta-login.server.ts` med flit — samma
 * engångs-state, samma nonce-cookie, samma krypterade token i vila, och
 * kostnaden skrivs i SAMMA `DailySpend` som Meta. Då räknar panelen,
 * gruppsumman, timgrafen och break-even redan med Google utan att en enda
 * rad i räknemotorn ändras.
 *
 * ⚠️ Kontot lagras i DailySpend med prefixet `g:` ("g:1234567890"). Både
 * Metas konto-id och Googles kundnummer är rena siffror, så utan prefix
 * hade ett kundnummer kunnat krocka med ett annonskonto-id och två olika
 * konton skrivit över varandras dagar — utan att något såg fel ut.
 *
 * ⚠️ Beloppen kommer i `cost_micros`: miljondelar av kontots valuta.
 * Divideras de inte med en miljon blir annonskostnaden en miljon gånger för
 * hög, och vinsten lika mycket för låg.
 *
 * ⚠️ Developer token. Googles REST-dokumentation säger fortfarande att
 * huvudet `developer-token` krävs vid varje anrop, medan Googles egen
 * ändringslogg (läst 2026-09-24) säger att token sunsattes 2026-09-09 och
 * numera ignoreras till förmån för åtkomstnivå per Cloud-projekt. Sidan som
 * skulle avgöra saken gav 404. Därför skickas huvudet NÄR det är satt och
 * utelämnas annars — det fungerar under båda reglerna.
 */

import prisma from "../db.server";
import { decrypt, encrypt, encryptionAvailable } from "./crypto.server";
/* Den rena logiken (kontoprefix, miljondelar, batchar) bor i google-ads.ts
   så den går att testa utan databas. */
import { felText, platta, PREFIX, somKonto, tolkaSpend, type GoogleSpendRad } from "./google-ads";

export { arGoogle, PREFIX, somKonto, type GoogleSpendRad } from "./google-ads";

const OAUTH = "https://oauth2.googleapis.com/token";
const AUTH = "https://accounts.google.com/o/oauth2/v2/auth";
const API = "https://googleads.googleapis.com/v25";

/**
 * Scopen. `adwords` är den enda Google Ads-API:t tar; `openid email` finns
 * med enbart för att kunna visa VILKET Google-konto som är kopplat. Utan
 * den raden skulle Settings säga "kopplat" utan att säga till vad, och den
 * som har tre Google-konton vet inte vilket som gäller.
 */
export const SCOPE = "https://www.googleapis.com/auth/adwords openid email";

export interface GoogleConfig {
  clientId: string;
  clientSecret: string;
  /** Utelämnas när den inte är satt — se filhuvudet. */
  developerToken?: string;
  redirectUri: string;
}

/**
 * Null när klient-id/hemlighet saknas — då finns inte knappen alls. Också
 * null utan krypteringsnyckel: kopplingen sparar en refresh-token som lever
 * tills den återkallas, och klartextlagring är inte ett alternativ.
 */
export function googleConfig(): GoogleConfig | null {
  const clientId = process.env.GOOGLE_ADS_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret || !encryptionAvailable()) return null;
  return {
    clientId,
    clientSecret,
    developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN?.trim() || undefined,
    redirectUri: `${process.env.SHOPIFY_APP_URL}/google/callback`,
  };
}

export const googleAvailable = (): boolean => googleConfig() !== null;

/**
 * Vad som fattas för att knappen ska finnas, med NAMN — aldrig värden.
 *
 * Finns för att "inte uppsatt på den här servern" inte går att felsöka när
 * sex Railway-tjänster delar en kodbas: en variabel som ligger på fel
 * tjänst, eller stavad fel, ser ut exakt som ingen variabel alls. Raden
 * namnger den som saknas, och namnen är inte hemliga.
 */
export function googleSaknar(): string[] {
  const saknas: string[] = [];
  if (!process.env.GOOGLE_ADS_CLIENT_ID?.trim()) saknas.push("GOOGLE_ADS_CLIENT_ID");
  if (!process.env.GOOGLE_ADS_CLIENT_SECRET?.trim()) saknas.push("GOOGLE_ADS_CLIENT_SECRET");
  if (!encryptionAvailable()) saknas.push("TOKEN_ENCRYPTION_KEY");
  return saknas;
}

export class GoogleError extends Error {
  /** True när kopplingen är död och handlaren måste koppla om. */
  readonly behoverOmkoppling: boolean;
  constructor(message: string, behoverOmkoppling = false) {
    super(message);
    this.name = "GoogleError";
    this.behoverOmkoppling = behoverOmkoppling;
  }
}

/**
 * Googles samtyckesdialog.
 *
 * `access_type=offline` + `prompt=consent` är inte valfria: utan dem får vi
 * bara en access-token som dör om en timme, och panelen hade tappat
 * annonskostnaden nästa morgon utan att någon förstod varför.
 */
export function dialogUrl(cfg: GoogleConfig, state: string): string {
  const u = new URL(AUTH);
  u.searchParams.set("client_id", cfg.clientId);
  u.searchParams.set("redirect_uri", cfg.redirectUri);
  u.searchParams.set("response_type", "code");
  u.searchParams.set("scope", SCOPE);
  u.searchParams.set("access_type", "offline");
  u.searchParams.set("prompt", "consent");
  u.searchParams.set("include_granted_scopes", "true");
  u.searchParams.set("state", state);
  return u.toString();
}

/**
 * Läser e-posten ur Googles id_token utan att verifiera signaturen.
 *
 * Det är rätt här och bara här: token kom direkt från Googles egen
 * token-endpoint över TLS i det här anropet, inte från klienten. Värdet
 * används enbart som etikett i Settings — aldrig för att avgöra åtkomst.
 */
function epostUrIdToken(idToken: unknown): string | null {
  if (typeof idToken !== "string") return null;
  const del = idToken.split(".")[1];
  if (!del) return null;
  try {
    const p = JSON.parse(Buffer.from(del, "base64url").toString("utf8"));
    return typeof p?.email === "string" ? p.email.slice(0, 160) : null;
  } catch {
    return null;
  }
}

/** Koden från callbacken → refresh-token. */
export async function bytKodMotToken(
  cfg: GoogleConfig,
  code: string,
): Promise<{ refreshToken: string; accessToken: string; email: string | null }> {
  const res = await fetch(OAUTH, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
      redirect_uri: cfg.redirectUri,
      grant_type: "authorization_code",
    }),
    signal: AbortSignal.timeout(15_000),
  });
  const body = await res.json().catch(() => ({}) as any);
  if (!res.ok || !body?.refresh_token) {
    /* Utan refresh_token är kopplingen värdelös om en timme. Google utelämnar
       den när användaren redan gett samtycke och prompt=consent saknas. */
    throw new GoogleError(
      body?.error_description || body?.error || `Google svarade ${res.status} utan refresh-token.`,
    );
  }
  return {
    refreshToken: body.refresh_token,
    accessToken: body.access_token,
    email: epostUrIdToken(body.id_token),
  };
}

/** Refresh-token → en färsk access-token (giltig en timme). */
export async function faAccessToken(cfg: GoogleConfig, refreshToken: string): Promise<string> {
  const res = await fetch(OAUTH, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
      grant_type: "refresh_token",
    }),
    signal: AbortSignal.timeout(15_000),
  });
  const body = await res.json().catch(() => ({}) as any);
  if (!res.ok || !body?.access_token) {
    /* invalid_grant = handlaren har tagit bort appens åtkomst, eller bytt
       lösenord. Det går inte att laga från vår sida — säg det rakt ut. */
    const dod = body?.error === "invalid_grant";
    throw new GoogleError(body?.error_description || body?.error || `Google svarade ${res.status}.`, dod);
  }
  return body.access_token as string;
}

/** Butikens sparade refresh-token, avkrypterad. Null = inte kopplat. */
export async function hamtaRefreshToken(shop: string): Promise<string | null> {
  const s = await prisma.shopSettings
    .findUnique({ where: { shop }, select: { googleRefreshToken: true } })
    .catch(() => null);
  return s?.googleRefreshToken ? decrypt(s.googleRefreshToken) : null;
}

export async function sparaKoppling(shop: string, refreshToken: string, email: string | null): Promise<void> {
  await prisma.shopSettings.update({
    where: { shop },
    data: {
      googleRefreshToken: encrypt(refreshToken),
      googleTokenSavedAt: new Date(),
      googleEmail: email,
    },
  });
}

/** Fälten som nollas när Google kopplas bort (Settings, avinstallation). */
export const GOOGLE_TOMT = {
  googleRefreshToken: null,
  googleTokenSavedAt: null,
  googleEmail: null,
} as const;

export async function koppplaBort(shop: string): Promise<void> {
  await prisma.$transaction([
    prisma.shopSettings.update({
      where: { shop },
      data: { googleRefreshToken: null, googleTokenSavedAt: null, googleEmail: null },
    }),
    prisma.googleAdsAccount.deleteMany({ where: { shop } }),
    /* Kostnaden hör till kopplingen: bort med den, annars ligger gamla
       Google-dagar kvar i vinsten för ett konto som inte finns längre. */
    prisma.dailySpend.deleteMany({ where: { shop, account: { startsWith: PREFIX } } }),
    prisma.hourlySpend.deleteMany({ where: { shop, account: { startsWith: PREFIX } } }),
  ]);
}

/** Butikens valda Google Ads-konton. */
export async function hamtaGoogleKonton(shop: string) {
  return prisma.googleAdsAccount.findMany({ where: { shop }, orderBy: { createdAt: "asc" } });
}

/**
 * Lägger TILL ett konto. Aldrig ersättning: en butik kan annonsera från
 * flera Google Ads-konton, och en ny inloggning ska inte tysta de andra.
 */
export async function laggTillGoogleKonto(shop: string, k: GoogleKonto): Promise<void> {
  const data = {
    name: k.name,
    currency: k.currency || null,
    timezoneName: k.timezone || null,
    loginCustomerId: k.loginCustomerId,
  };
  await prisma.googleAdsAccount.upsert({
    where: { shop_customerId: { shop, customerId: k.customerId } },
    create: { shop, customerId: k.customerId, ...data },
    update: data,
  });
}

/** Tar bort ETT konto och dess annonskostnad. */
export async function taBortGoogleKonto(shop: string, customerId: string): Promise<void> {
  const konto = somKonto(customerId);
  await prisma.$transaction([
    prisma.googleAdsAccount.deleteMany({ where: { shop, customerId } }),
    prisma.dailySpend.deleteMany({ where: { shop, account: konto } }),
    prisma.hourlySpend.deleteMany({ where: { shop, account: konto } }),
  ]);
}

/* Kontolistan är 1 + N Google-anrop (ett per kundnummer). Settings-sidan
   laddas om vid varje sparning, så utan cache blev det ett dussin anrop per
   klick. Tio minuter räcker: nya Google Ads-konton skapas inte i farten. */
const listCache = new Map<string, { at: number; konton: GoogleKonto[] }>();
const LISTA_MS = 10 * 60 * 1000;

/**
 * Kontona butikens koppling når, för väljaren i Settings.
 * Tom lista = inte kopplat. Kastar vidare Googles fel så sidan kan säga
 * "kopplingen har gått ut" i stället för att visa en tom väljare.
 */
export async function tillgangligaKonton(shop: string): Promise<GoogleKonto[]> {
  const cfg = googleConfig();
  if (!cfg) return [];
  const hit = listCache.get(shop);
  if (hit && Date.now() - hit.at < LISTA_MS) return hit.konton;

  const refresh = await hamtaRefreshToken(shop);
  if (!refresh) return [];
  const token = await faAccessToken(cfg, refresh);
  const konton = await listaKonton(cfg, token);
  listCache.set(shop, { at: Date.now(), konton });
  return konton;
}

/** Glöm kontolistan (ny koppling, bortkoppling). */
export function glomKontolista(shop: string): void {
  listCache.delete(shop);
}

function huvuden(cfg: GoogleConfig, accessToken: string, loginCustomerId?: string | null): HeadersInit {
  return {
    authorization: `Bearer ${accessToken}`,
    "content-type": "application/json",
    ...(cfg.developerToken ? { "developer-token": cfg.developerToken } : {}),
    ...(loginCustomerId ? { "login-customer-id": loginCustomerId.replace(/\D/g, "") } : {}),
  };
}

export interface GoogleKonto {
  customerId: string;
  name: string;
  currency: string;
  timezone: string;
  loginCustomerId: string | null;
}

/**
 * Kontona handlaren kommer åt.
 *
 * Två steg, och det andra är inte valfritt: `listAccessibleCustomers` ger
 * bara kundnummer. Utan namn, valuta och tidszon hade handlaren fått välja
 * mellan tio tiosiffriga tal, och valutan behövs för att räkna om beloppet.
 */
export async function listaKonton(cfg: GoogleConfig, accessToken: string): Promise<GoogleKonto[]> {
  const res = await fetch(`${API}/customers:listAccessibleCustomers`, {
    headers: huvuden(cfg, accessToken),
    signal: AbortSignal.timeout(20_000),
  });
  const body = await res.json().catch(() => ({}) as any);
  if (!res.ok) {
    throw new GoogleError(felText(body) || `Google svarade ${res.status} på kontolistan.`, res.status === 401);
  }
  const ids: string[] = (body?.resourceNames ?? []).map((r: string) => r.split("/").pop() ?? "").filter(Boolean);

  const ut: GoogleKonto[] = [];
  for (const id of ids.slice(0, 50)) {
    const k = await beskrivKonto(cfg, accessToken, id).catch(() => null);
    if (k) ut.push(k);
  }
  return ut;
}

/** Namn, valuta och tidszon för ett kundnummer. */
async function beskrivKonto(cfg: GoogleConfig, accessToken: string, customerId: string): Promise<GoogleKonto | null> {
  const rader = await sok(
    cfg,
    accessToken,
    customerId,
    `SELECT customer.id, customer.descriptive_name, customer.currency_code, customer.time_zone,
            customer.manager, customer.status
     FROM customer
     LIMIT 1`,
    null,
  );
  const c = rader[0]?.customer;
  if (!c) return null;
  /* Chefskonton har ingen egen annonskostnad — de är mappar. Att lista dem
     som valbara hade gett en koppling som alltid rapporterar noll. */
  if (c.manager === true) return null;
  return {
    customerId: String(c.id ?? customerId),
    name: String(c.descriptiveName ?? c.descriptive_name ?? customerId),
    currency: String(c.currencyCode ?? c.currency_code ?? ""),
    timezone: String(c.timeZone ?? c.time_zone ?? ""),
    loginCustomerId: null,
  };
}

/** En GAQL-fråga. Returnerar alla rader; `searchStream` paginerar inte. */
export async function sok(
  cfg: GoogleConfig,
  accessToken: string,
  customerId: string,
  query: string,
  loginCustomerId: string | null,
): Promise<any[]> {
  const res = await fetch(`${API}/customers/${customerId.replace(/\D/g, "")}/googleAds:searchStream`, {
    method: "POST",
    headers: huvuden(cfg, accessToken, loginCustomerId),
    body: JSON.stringify({ query }),
    signal: AbortSignal.timeout(30_000),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new GoogleError(felText(body) || `Google svarade ${res.status}.`, res.status === 401);
  }
  return platta(body);
}

export async function hamtaSpend(
  cfg: GoogleConfig,
  accessToken: string,
  konto: { customerId: string; loginCustomerId: string | null },
  from: string,
  to: string,
  timvis = false,
): Promise<GoogleSpendRad[]> {
  const rader = await sok(
    cfg,
    accessToken,
    konto.customerId,
    `SELECT segments.date, ${timvis ? "segments.hour, " : ""}metrics.cost_micros,
            metrics.impressions, metrics.clicks
     FROM customer
     WHERE segments.date BETWEEN '${from}' AND '${to}'`,
    konto.loginCustomerId,
  );

  return tolkaSpend(rader, timvis);
}
