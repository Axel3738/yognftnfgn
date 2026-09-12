/**
 * Logga in med Facebook för Meta-kopplingen.
 *
 * Handlaren ska inte behöva hämta en token i Graph API Explorer och klistra in
 * den — en knapp öppnar Metas inloggning i ett eget fönster, appen byter koden
 * mot en long-lived token (~60 dagar) och handlaren väljer annonskonto ur en
 * lista. Den manuella token-vägen finns kvar som reserv.
 *
 * Varför ett eget fönster: appen kör i en iframe i Shopify-admin, och Meta
 * vägrar rendera sin inloggningsdialog i en iframe. Fönstret är top-level och
 * har ingen Shopify-session — därför binds hela flödet till en engångsrad
 * (MetaLoginState) som skapas från den inloggade Settings-sidan och till en
 * cookie som sätts i fönstret. Utan båda går svaret från Meta ingenstans.
 *
 * Ingen token loggas någonsin, och ingen adress med token i hamnar i ett
 * felmeddelande. Alla anrop har timeout — de awaitas i sidladdningar.
 */

import { createHash, randomBytes } from "node:crypto";
import prisma from "../db.server";
import { encrypt, encryptionAvailable } from "./crypto.server";
import { glomMetaFel } from "./meta.server";
import { GRAPH_VERSION, type Annonskonto } from "./meta-login";

const GRAPH = `https://graph.facebook.com/${GRAPH_VERSION}`;
const DIALOG = `https://www.facebook.com/${GRAPH_VERSION}/dialog/oauth`;

/** Hur länge en påbörjad inloggning får ta. Tvåfaktor, lösenordsåterställning,
 *  mobilen som ligger i ett annat rum — 30 minuter, inte 10. */
const STATE_MINUTER = 30;
/** Hur länge länken får ligga oöppnad. Fönstret öppnar den inom sekunder —
 *  en länk som öppnas minuter senare är en vidarebefordrad länk. */
const START_SEKUNDER = 120;
/** Cookien som binder Metas svar till webbläsaren som startade. */
export const COOKIE_NAMN = "meta_login";

export interface MetaLoginConfig {
  appId: string;
  appSecret: string;
  /** Satt ⇒ "Facebook Login for Business" (config_id i stället för scope). */
  configId?: string;
  redirectUri: string;
}

export class MetaLoginError extends Error {
  constructor(message: string, readonly code?: number) {
    super(message);
  }
  /** 190 = token utgången/återkallad — inget annat än en ny inloggning hjälper. */
  get utgangen(): boolean {
    return this.code === 190;
  }
}

/**
 * Null när META_APP_ID/META_APP_SECRET saknas — då finns inte knappen.
 * Också null utan TOKEN_ENCRYPTION_KEY: inloggningen sparar andra
 * människors 60-dagarstoken utan att de ser Settings-sidans varning, så
 * klartextlagring är inte ett alternativ på den vägen.
 */
export function metaLoginConfig(): MetaLoginConfig | null {
  const appId = process.env.META_APP_ID?.trim();
  const appSecret = process.env.META_APP_SECRET?.trim();
  if (!appId || !appSecret || !encryptionAvailable()) return null;
  return {
    appId,
    appSecret,
    configId: process.env.META_LOGIN_CONFIG_ID?.trim() || undefined,
    redirectUri: `${process.env.SHOPIFY_APP_URL}/meta/callback`,
  };
}

export const metaLoginAvailable = (): boolean => metaLoginConfig() !== null;

const hash = (s: string) => createHash("sha256").update(s).digest("hex");

/**
 * Skapar engångsraden och returnerar den relativa adress fönstret ska öppna.
 * Anropas från en autentiserad action — det är där butiken bevisas.
 */
export async function skapaInloggning(shop: string, syfte?: string): Promise<string> {
  const state = randomBytes(24).toString("base64url");
  await prisma.metaLoginState.create({
    data: { shop, state, syfte: syfte ?? null, expiresAt: new Date(Date.now() + STATE_MINUTER * 60 * 1000) },
  });
  /* Städning i förbifarten: rader äldre än en timme är döda oavsett. */
  void prisma.metaLoginState
    .deleteMany({ where: { expiresAt: { lt: new Date(Date.now() - 60 * 60 * 1000) } } })
    .catch(() => {});
  return `/meta/start?state=${encodeURIComponent(state)}`;
}

/**
 * Är anropet till /meta/start gjort från appen själv?
 *
 * Länken skapas i en butiks inloggade Settings-sida, men fönstret som öppnar
 * den har ingen session. Utan den här kontrollen kunde vem som helst med en
 * butik (StonePNL är publik) skapa en länk, skicka den till någon annan, och
 * få DENNES annonskonton kopplade till SIN butik. Navigeringen startas av
 * Settings-sidans skript (`w.location.href = …`), så webbläsaren märker den
 * som same-origin — en vidarebefordrad länk som öppnas från mejl eller en
 * annan sajt gör det aldrig. Äldre webbläsare utan Sec-Fetch-* bedöms på
 * Referer; saknas båda avvisas anropet.
 */
export function oppnadFranAppen(request: Request): boolean {
  const site = request.headers.get("sec-fetch-site");
  if (site) return site === "same-origin";
  const referer = request.headers.get("referer");
  if (!referer) return false;
  try {
    return new URL(referer).origin === new URL(process.env.SHOPIFY_APP_URL!).origin;
  } catch {
    return false;
  }
}

/**
 * Steg 1 i fönstret: markera raden som öppnad (exakt en gång) och ge tillbaka
 * nonce + Metas dialogadress. Null = raden finns inte, är förbrukad, redan
 * öppnad eller utgången — fönstret ska då be handlaren klicka igen.
 */
export async function startaInloggning(
  cfg: MetaLoginConfig,
  state: string,
): Promise<{ shop: string; nonce: string; dialogUrl: string } | null> {
  if (!state) return null;
  const rad = await prisma.metaLoginState.findUnique({ where: { state } });
  if (!rad || rad.usedAt || rad.nonceHash || rad.expiresAt < new Date()) return null;
  if (Date.now() - rad.createdAt.getTime() > START_SEKUNDER * 1000) return null;

  const nonce = randomBytes(24).toString("base64url");
  /* updateMany med villkor: två samtidiga öppningar av samma länk får inte
     båda lyckas — den andra ska se "redan öppnad". */
  const r = await prisma.metaLoginState.updateMany({
    where: { state, nonceHash: null, usedAt: null },
    data: { nonceHash: hash(nonce) },
  });
  if (r.count !== 1) return null;

  return { shop: rad.shop, nonce, dialogUrl: dialogUrl(cfg, state) };
}

/** Metas inloggningsdialog. Exporterad för test. */
export function dialogUrl(cfg: MetaLoginConfig, state: string): string {
  const u = new URL(DIALOG);
  u.searchParams.set("client_id", cfg.appId);
  u.searchParams.set("redirect_uri", cfg.redirectUri);
  u.searchParams.set("state", state);
  u.searchParams.set("response_type", "code");
  /* rerequest: den som en gång bockat ur "Annonser" i dialogen får annars
     aldrig frågan igen — och står då för evigt med en token utan ads_read. */
  u.searchParams.set("auth_type", "rerequest");
  if (cfg.configId) {
    /* Facebook Login for Business: behörigheterna ligger i konfigurationen i
       Metas dashboard, inte i anropet. override_default_response_type krävs
       för att få en kod (standard är token i fragmentet). */
    u.searchParams.set("config_id", cfg.configId);
    u.searchParams.set("override_default_response_type", "true");
  } else {
    u.searchParams.set("scope", "ads_read");
  }
  return u.toString();
}

/**
 * Steg 2 i fönstret: Metas svar kommer tillbaka. Raden förbrukas OAVSETT
 * utfall — en misslyckad inloggning görs om från knappen, aldrig genom att
 * ladda om callback-sidan. Returnerar butiken, eller null med skäl.
 */
export async function forbrukaInloggning(
  state: string,
  cookieNonce: string | null,
): Promise<{ ok: true; shop: string; syfte: string | null } | { ok: false; skal: "okand" | "fel-webblasare" }> {
  if (!state) return { ok: false, skal: "okand" };
  const rad = await prisma.metaLoginState.findUnique({ where: { state } });
  if (!rad || rad.usedAt || rad.expiresAt < new Date()) return { ok: false, skal: "okand" };
  if (!rad.nonceHash || !cookieNonce || hash(cookieNonce) !== rad.nonceHash) {
    return { ok: false, skal: "fel-webblasare" };
  }
  const r = await prisma.metaLoginState.updateMany({
    where: { state, usedAt: null },
    data: { usedAt: new Date() },
  });
  if (r.count !== 1) return { ok: false, skal: "okand" };
  return { ok: true, shop: rad.shop, syfte: rad.syfte };
}

/** Cookie-headern för fönstret. Path /meta: ingen annan sida ser den. */
export function nonceCookie(nonce: string): string {
  return `${COOKIE_NAMN}=${nonce}; Path=/meta; Max-Age=${STATE_MINUTER * 60}; HttpOnly; Secure; SameSite=Lax`;
}

/** Tömmer cookien efter avslutat flöde. */
export function tomNonceCookie(): string {
  return `${COOKIE_NAMN}=; Path=/meta; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;
}

export function lasNonceCookie(request: Request): string | null {
  const header = request.headers.get("cookie") ?? "";
  for (const del of header.split(";")) {
    const [k, ...rest] = del.trim().split("=");
    if (k === COOKIE_NAMN) return rest.join("=") || null;
  }
  return null;
}

/* ---------- Graph API ---------- */

/**
 * Ett Graph-anrop. Användartoken skickas som Authorization-header, aldrig i
 * adressen — då kan varken en loggad URL eller ett felmeddelande läcka den.
 * (Kodutbytet och debug_token är undantagen: Metas oauth-endpoints tar sina
 * parametrar i query-strängen, så där får adressen helt enkelt aldrig loggas.)
 */
async function graph<T>(
  path: string,
  opts: {
    params?: Record<string, string>;
    token?: string;
    method?: "GET" | "DELETE";
    timeoutMs?: number;
    /** Absolut adress (paginering) i stället för path. */
    url?: string;
  } = {},
): Promise<T> {
  const url = new URL(opts.url ?? `${GRAPH}/${path}`);
  for (const [k, v] of Object.entries(opts.params ?? {})) url.searchParams.set(k, v);
  const res = await fetch(url, {
    method: opts.method ?? "GET",
    headers: opts.token ? { Authorization: `Bearer ${opts.token}` } : {},
    signal: AbortSignal.timeout(opts.timeoutMs ?? 10_000),
  });
  const body: any = await res.json().catch(() => ({}));
  if (!res.ok || body?.error) {
    const err = body?.error ?? {};
    throw new MetaLoginError(err.message ?? `Meta responded ${res.status}`, err.code);
  }
  return body as T;
}

interface TokenSvar {
  access_token: string;
  token_type?: string;
  expires_in?: number;
}

const utgang = (expiresIn: unknown): Date | null =>
  typeof expiresIn === "number" && expiresIn > 0 ? new Date(Date.now() + expiresIn * 1000) : null;

/**
 * Byter koden från dialogen mot en long-lived användartoken.
 * Två anrop: kod → kortlivad token (timmar) → long-lived (~60 dagar).
 *
 * Misslyckas det andra steget behålls den första token: en Facebook Login
 * for Business-konfiguration kan ge en systemanvändar-token som inte går
 * att förlänga men heller inte går ut — att kasta en lyckad inloggning för
 * det vore fel.
 */
export async function bytKodMotToken(
  cfg: MetaLoginConfig,
  code: string,
): Promise<{ token: string; expiresAt: Date | null }> {
  const kort = await graph<TokenSvar>("oauth/access_token", {
    params: {
      client_id: cfg.appId,
      client_secret: cfg.appSecret,
      redirect_uri: cfg.redirectUri,
      code,
    },
  });
  if (!kort?.access_token) throw new MetaLoginError("Meta returned no access token.");
  try {
    return await forlangToken(cfg, kort.access_token);
  } catch (e) {
    console.error("Long-lived-utbytet misslyckades, behåller första token:", (e as Error).message);
    return { token: kort.access_token, expiresAt: utgang(kort.expires_in) };
  }
}

/**
 * Long-lived-utbytet. Tar både en kortlivad token (från inloggningen) och en
 * long-lived (förnyelse i tokenvakten) — Meta ger en ny 60-dagarstoken så
 * länge den man skickar in fortfarande är giltig och minst ett dygn gammal.
 */
export async function forlangToken(
  cfg: MetaLoginConfig,
  token: string,
): Promise<{ token: string; expiresAt: Date | null }> {
  const lang = await graph<TokenSvar>("oauth/access_token", {
    params: {
      grant_type: "fb_exchange_token",
      client_id: cfg.appId,
      client_secret: cfg.appSecret,
      fb_exchange_token: token,
    },
  });
  if (!lang?.access_token) throw new MetaLoginError("Meta returned no long-lived token.");
  return { token: lang.access_token, expiresAt: utgang(lang.expires_in) };
}

/**
 * Metas egen bild av en token: när den går ut OCH när dataåtkomsten går ut.
 *
 * Det andra datumet är det som biter: en användartoken bär
 * `data_access_expires_at` (~90 dagar från inloggningen), och det flyttas
 * bara av en ny tur genom inloggningsdialogen — inte av fb_exchange_token.
 * En token kan alltså säga "25 dagar kvar" och ändå vara död. Vi sparar det
 * TIDIGASTE av de två som utgång, så varningen kommer på rätt dag.
 * 0 = går aldrig ut (systemanvändare). Misslyckas anropet (token från en
 * annan Meta-app, nätverk) returneras null-värden — bättre än en gissning.
 */
export async function metaUtgang(
  cfg: MetaLoginConfig,
  token: string,
): Promise<{ expiresAt: Date | null; dataAccessExpiresAt: Date | null; ok: boolean }> {
  try {
    const r = await graph<{ data?: { expires_at?: number; data_access_expires_at?: number; is_valid?: boolean } }>(
      "debug_token",
      { params: { input_token: token, access_token: `${cfg.appId}|${cfg.appSecret}` }, timeoutMs: 8_000 },
    );
    const d = r?.data ?? {};
    const datum = (s: unknown) => (typeof s === "number" && s > 0 ? new Date(s * 1000) : null);
    return { expiresAt: datum(d.expires_at), dataAccessExpiresAt: datum(d.data_access_expires_at), ok: true };
  } catch (e) {
    console.error("debug_token misslyckades:", (e as Error).message);
    return { expiresAt: null, dataAccessExpiresAt: null, ok: false };
  }
}

/** Det tidigaste av kända utgångsdatum. Null = inget känt. */
export function tidigast(...datum: (Date | null | undefined)[]): Date | null {
  let ut: Date | null = null;
  for (const d of datum) if (d && (!ut || d < ut)) ut = d;
  return ut;
}

/**
 * Utgången som ska sparas: `expires_in` från utbytet, korrigerad med Metas
 * debug_token (dataåtkomstens 90 dagar, eller "aldrig" för systemanvändare).
 */
export async function bestamUtgang(
  cfg: MetaLoginConfig,
  token: string,
  franUtbyte: Date | null,
): Promise<Date | null> {
  const d = await metaUtgang(cfg, token);
  if (!d.ok) return franUtbyte;
  return tidigast(franUtbyte, d.expiresAt, d.dataAccessExpiresAt);
}

/** Gav inloggningen faktiskt ads_read? Dialogen låter användaren bocka ur. */
export async function harAdsRead(token: string): Promise<boolean> {
  const r = await graph<{ data?: { permission?: string; status?: string }[] }>("me/permissions", {
    token,
    timeoutMs: 8_000,
  });
  return (r?.data ?? []).some((p) => p.permission === "ads_read" && p.status === "granted");
}

/** Den inloggade: namn (visas i Settings) och app-scoped id (styr återkallelse). */
export async function hamtaAnvandare(token: string): Promise<{ id: string | null; name: string | null }> {
  try {
    const me = await graph<{ id?: string; name?: string }>("me", {
      params: { fields: "id,name" },
      token,
    });
    return { id: me?.id ? String(me.id) : null, name: me?.name?.slice(0, 120) ?? null };
  } catch {
    return { id: null, name: null }; // kosmetiskt — kopplingen fungerar utan
  }
}

/**
 * Återkallar appens åtkomst hos Meta. Best effort: en bortkoppling ska inte
 * lämna en giltig 60-dagarstoken kvar i världen, men kan Meta inte nås ska
 * bortkopplingen i appen ändå gå igenom.
 */
export async function aterkallaToken(token: string, timeoutMs = 8_000): Promise<boolean> {
  try {
    await graph("me/permissions", { method: "DELETE", token, timeoutMs });
    return true;
  } catch (e) {
    console.error("Kunde inte återkalla Meta-token:", (e as Error).message);
    return false;
  }
}

/**
 * Får den här butikens token återkallas hos Meta?
 *
 * `DELETE /me/permissions` avauktoriserar appen för hela Facebook-ANVÄNDAREN
 * — det går inte att återkalla en enskild token. Axels läge är precis det
 * farliga: samma person inloggad på fem butiker. Kopplar han bort Danmark
 * ska inte Sverige, Norge, Finland och UK dö i samma sekund. Återkalla
 * därför bara när ingen annan butik använder samma användare; annars nollas
 * bara den här butikens rad. Okänd användare (äldre rad utan id) ⇒ återkalla
 * inte — hellre en kvarvarande token än fyra döda butiker.
 */
export async function farAterkallas(shop: string, userId: string | null): Promise<boolean> {
  if (!userId) return false;
  const andra = await prisma.shopSettings.count({
    where: { metaTokenSource: "login", metaUserId: userId, shop: { not: shop } },
  });
  return andra === 0;
}

/**
 * Annonskontona token når. Fungerar för både inloggade användare och
 * systemanvändare (manuell token). Följer paginering ett par sidor — ingen
 * har hundratals konton att välja mellan i en rullista ändå.
 * Sortering: butikens egen valuta först (starkaste ledtråden för den som
 * inte kan kontonamnen), sedan aktiva, sedan namn.
 */
export async function listaAnnonskonton(token: string, butiksValuta?: string): Promise<Annonskonto[]> {
  const ut: Annonskonto[] = [];
  let next: string | null = null;
  for (let sida = 0; sida < 5; sida++) {
    const body: any = await graph<any>("me/adaccounts", {
      ...(next ? { url: next } : { params: { fields: "account_id,name,currency,account_status", limit: "100" } }),
      token,
      timeoutMs: 8_000,
    });
    for (const k of body?.data ?? []) {
      if (!k?.account_id) continue;
      ut.push({
        accountId: String(k.account_id),
        name: String(k.name ?? k.account_id),
        currency: String(k.currency ?? ""),
        status: Number(k.account_status ?? 0),
      });
    }
    next = body?.paging?.next ?? null;
    if (!next) break;
  }
  const rang = (k: Annonskonto) =>
    (butiksValuta && k.currency === butiksValuta ? 0 : 2) + (k.status === 1 ? 0 : 1);
  ut.sort((a, b) => rang(a) - rang(b) || a.name.localeCompare(b.name));
  return ut;
}

/** Sparar en token från inloggningen, och valfritt ett annonskonto. */
export async function sparaInloggadToken(
  shop: string,
  cfg: MetaLoginConfig,
  token: string,
  expiresAt: Date | null,
  anvandare: { id: string | null; name: string | null },
  adAccountId?: string,
): Promise<void> {
  const data = {
    metaAccessToken: encrypt(token),
    metaTokenExpiresAt: expiresAt,
    metaTokenSource: "login",
    metaTokenSavedAt: new Date(),
    metaTokenRefreshAttemptAt: null,
    metaUserName: anvandare.name,
    metaUserId: anvandare.id,
    metaAppId: cfg.appId,
    ...(adAccountId ? { metaAdAccountId: adAccountId, spendCurrency: null } : {}),
  };
  await prisma.shopSettings.upsert({
    where: { shop },
    create: { shop, ...data },
    update: data,
  });
  /* Den gamla tokens 5-minutersbackoff får inte ärvas av den nya — annars
     säger panelen "kunde inte hämtas" i fem minuter efter en lyckad inloggning. */
  glomMetaFel(shop);
}

/** Fälten som nollas när Meta kopplas bort (Settings, avinstallation). */
export const META_TOMT = {
  metaAccessToken: null,
  metaAdAccountId: null,
  metaTokenExpiresAt: null,
  metaTokenSource: null,
  metaTokenSavedAt: null,
  metaTokenRefreshAttemptAt: null,
  metaUserName: null,
  metaUserId: null,
  metaAppId: null,
  spendCurrency: null,
  /* Kampanjfiltret pekar på kampanjer i det konto som just kopplades bort —
     det får inte ligga kvar och tysta annonskostnaden i nästa konto. */
  campaignMode: "all",
  campaignIds: null,
} as const;
