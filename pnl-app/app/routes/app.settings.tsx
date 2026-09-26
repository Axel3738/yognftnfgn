/**
 * Butiksinställningar: språk, tull per order, kortavgift, målmarginal och
 * Meta-koppling. Defaults är Bäverbutikens: $2,90 tull och 2,9 % kortavgift.
 *
 * Språkväljaren ligger överst med flit — den ska vara det första man hittar.
 *
 * Meta-kopplingen har två vägar: "Logga in med Facebook" (när META_APP_ID
 * finns på servern) som öppnar Metas dialog i ett eget fönster och sedan
 * låter handlaren välja annonskonto ur en lista — och den gamla vägen med
 * inklistrad token, som finns kvar som reserv för systemanvändare.
 *
 * FLERA ANNONSKONTON (2026-09-17): en butik kan ha hur många konton som helst
 * kopplade, och annonskostnaden är summan av dem. Varje konto har sitt EGET
 * kampanjfilter — kampanj-ID:n är kontospecifika, så ett delat filter hade
 * betytt "inga kampanjer alls" i alla utom ett konto.
 */

import { useEffect, useRef, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData, useRevalidator } from "@remix-run/react";
import {
  Banner,
  BlockStack,
  Button,
  Card,
  Checkbox,
  ChoiceList,
  Collapsible,
  InlineStack,
  Layout,
  Page,
  Select,
  Text,
  TextField,
} from "@shopify/polaris";
import { ClaudeGuide } from "../components/ClaudeGuide";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { decrypt, encrypt, encryptionAvailable } from "../lib/crypto.server";
/* Server-modulen får bara användas i loader/action (Remix skalar bort dem ur
   klientbygget); komponenten hämtar sina konstanter från meta-login.ts. */
import {
  aterkallaToken,
  bestamUtgang,
  farAterkallas,
  listaAnnonskonton,
  META_TOMT,
  metaLoginAvailable,
  metaLoginConfig,
  MetaLoginError,
  skapaInloggning,
} from "../lib/meta-login.server";
import { glomMetaFel, listaKampanjer } from "../lib/meta.server";
import {
  hamtaKonton,
  laggTillKonto,
  sparaKampanjfilter,
  taBortAllaKonton,
  taBortKonto,
} from "../lib/meta-konton.server";
import { dagarKvar, kontoId, VARNA_DAGAR, type Annonskonto } from "../lib/meta-login";
import {
  googleAvailable,
  googleSaknar,
  tjanstensNamn,
  GOOGLE_TOMT,
  glomKontolista,
  hamtaGoogleKonton,
  koppplaBort,
  laggTillGoogleKonto,
  taBortGoogleKonto,
  tillgangligaKonton,
  type GoogleKonto,
} from "../lib/google-ads.server";
import { glomGoogleFel } from "../lib/google-spend.server";
import { betalvagar90, kandaMarknader, uppmattaAvgifter } from "../lib/daily.server";
import { hemlandAv, marknadskod, marknadsnamn, sorteraMarknader, stadaAvgifter } from "../lib/marknad";
import { hamtaKoppling, provaNyckel, serNyckelUt } from "../lib/ai-nyckel.server";
import { asLang, localeOf, t, type Lang } from "../lib/texts";
import { tullKvitterad } from "../lib/kostnadstackning";
import { betalvagNamn } from "../lib/avgifter";

/** En kampanj som kryssrutorna visar den. Formen speglar MetaKampanj i
    meta.server.ts — typen får inte importeras hit, en klientkomponent som
    refererar en server-modul stoppar Remix-bygget. */
type Kampanj = { id: string; name: string; status: string; spend30: number };

/** Axels Loom: "så kopplar du Meta". Embed-adressen, inte delningslänken. */
const LOOM_META = "https://www.loom.com/embed/13de78aa18c14f78bc28845ff219e42a?hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true";

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const s = await prisma.shopSettings.upsert({
    where: { shop: session.shop },
    create: { shop: session.shop },
    update: {},
  });

  /* Annonskontona hämtas från Meta med den sparade token — fungerar för både
     inloggade användare och systemanvändare. Misslyckas det säger UI:t
     varför: utgången token är "logga in igen", allt annat "försök igen". */
  const token = s.metaAccessToken ? decrypt(s.metaAccessToken) : null;
  let konton: Annonskonto[] | null = null;
  let kontoFel: { utgangen: boolean; message: string } | null = null;
  if (token) {
    try {
      konton = await listaAnnonskonton(token, s.currency);
    } catch (e) {
      kontoFel = {
        utgangen: e instanceof MetaLoginError && e.utgangen,
        message: (e as Error).message || "unknown error",
      };
    }
  }

  /* Butikens kopplade konton — listan, inte ett enda ID. Namnet tas helst från
     Metas färska lista (kontot kan ha döpts om) och annars ur vår egen cache. */
  const kopplade = (await hamtaKonton(session.shop)).map((k) => {
    const live = konton?.find((x) => x.accountId === k.accountId);
    return {
      accountId: k.accountId,
      name: live?.name ?? k.name ?? k.accountId,
      currency: live?.currency ?? k.currency ?? "",
      /* Kontot syns inte för den sparade nyckeln: visas ändå, med etikett, så
         handlaren kan ta bort det i stället för att undra var kostnaden tog vägen. */
      saknasIListan: Boolean(konton && !live),
      campaignMode: k.campaignMode ?? "all",
      campaignIds: (k.campaignIds ?? "").split(",").map((x) => x.trim()).filter(Boolean),
      campaignMarkets: k.campaignMarkets,
    };
  });
  /* Marknaderna butiken sålt till (plus dem som redan har kostnad eller
     märkt kampanj) — valen i "Marknad" per kampanj. */
  const marknader = await kandaMarknader(session.shop, hemlandAv(s.currency));
  /* Vad Shopify Payments faktiskt tog per marknad de senaste 90 dagarna, ur
     ordrarna. Visas bredvid fälten så ingen behöver gissa — och panelen
     räknar redan med de faktiska avgifterna där de finns. */
  const uppmatt = await uppmattaAvgifter(session.shop).catch(() => ({}) as Record<string, never>);
  /* Betalväxlarna de senaste 90 dagarna med sin andel. Ett fel ger tom lista
     och texten "visas när ordrar hämtats" — aldrig ett påhittat "100 %
     Shopify Payments". */
  const vagar = await betalvagar90(session.shop).catch(() => []);

  return json({
    marknader,
    /* Bara marknader med omsättning genom Shopify Payments har en uppmätt
       sats — en sats ur noll kronor är ingen mätning. */
    uppmatt: Object.fromEntries(
      Object.entries(uppmatt)
        .filter(([, a]) => a.sales > 0)
        .map(([m, a]) => [m, { pct: (a.rate * 100).toFixed(2), days: a.days }]),
    ),
    betalvagar: vagar.map((b) => ({ gateway: b.gateway, pct: (b.share * 100).toFixed(1) })),
    thirdPartyFeeRate: Number(s.thirdPartyFeeRate ?? 0),
    /* Avgifter per marknad, i PROCENT som strängar — så som fälten visar dem. */
    marketFees: Object.fromEntries(
      Object.entries(stadaAvgifter(s.marketFees)).map(([m, a]) => [
        m,
        {
          feeRate: a.feeRate == null ? "" : (a.feeRate * 100).toFixed(2),
          fxFeeRate: a.fxFeeRate == null ? "" : (a.fxFeeRate * 100).toFixed(2),
          /* Tullen är ett BELOPP, inte procent — den skalas inte med 100. */
          tariffPerOrder: a.tariffPerOrder == null ? "" : String(a.tariffPerOrder),
        },
      ]),
    ),
    /* Bara ATT en nyckel finns och de fyra sista tecknen — aldrig nyckeln. */
    claude: await (async () => {
      const k = await hamtaKoppling(session.shop, s);
      return { kalla: k.kalla, slut: k.slut, sparad: k.sparad ? k.sparad.toISOString().slice(0, 10) : null };
    })(),
    lang: asLang(s.language),
    tariffPerOrder: Number(s.tariffPerOrder),
    /* När tullen senast kvitterades (null = aldrig). Rutan "Tullbeloppen
       stämmer" visas bara tills dess. */
    tariffConfirmedAt: s.tariffConfirmedAt ? s.tariffConfirmedAt.toISOString().slice(0, 10) : null,
    feeRate: Number(s.feeRate),
    targetMargin: Number(s.targetMargin),
    kopplade,
    hasMetaToken: Boolean(s.metaAccessToken),
    metaLogin: metaLoginAvailable(),
    metaUserName: s.metaUserName,
    metaTokenSource: s.metaTokenSource,
    metaTokenDagar: dagarKvar(s.metaTokenExpiresAt),
    /* Snapshot för pollningen: ändras värdet efter klicket är inloggningen klar. */
    metaTokenSavedAt: s.metaTokenSavedAt?.toISOString() ?? null,
    konton,
    kontoFel,
    krypteringPa: encryptionAvailable(),
    currency: s.currency,
    /* Google Ads. `valbara` är ett nätverksanrop mot Google (cachat tio
       minuter) — misslyckas det blir det tom lista plus ett fel, aldrig en
       tyst tom väljare som ser ut som "du har inga konton". */
    google: await (async () => {
      const uppsatt = googleAvailable();
      const kopplat = Boolean(s.googleRefreshToken);
      const valda = kopplat ? await hamtaGoogleKonton(session.shop).catch(() => []) : [];
      let valbara: GoogleKonto[] = [];
      let fel = false;
      if (kopplat) {
        try {
          valbara = await tillgangligaKonton(session.shop);
        } catch {
          fel = true;
        }
      }
      return {
        uppsatt,
        /* Bara NAMN på det som fattas — aldrig värden. */
        saknas: uppsatt ? [] : googleSaknar(),
        /* Vilken av de sex tjänsterna som svarar — annars går det inte att
           veta var variabeln ska läggas. */
        tjanst: uppsatt ? "" : tjanstensNamn(),
        kopplat,
        epost: s.googleEmail,
        valda: valda.map((k) => ({ customerId: k.customerId, name: k.name ?? k.customerId, currency: k.currency })),
        valbara: valbara.map((k) => ({
          customerId: k.customerId,
          name: k.name,
          currency: k.currency,
          timezone: k.timezone,
        })),
        fel,
      };
    })(),
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const f = await request.formData();
  const intent = String(f.get("intent") ?? "save");
  const s = await prisma.shopSettings.findUnique({ where: { shop: session.shop } });
  const T = t(asLang(s?.language));

  if (intent === "meta-login-url") {
    /* Engångslänken skapas här — i en autentiserad action — så att butiken är
       bevisad innan fönstret öppnas. Fönstret självt har ingen session. */
    if (!metaLoginAvailable()) return json({ ok: false, message: T.settings.loginFailed }, { status: 400 });
    const url = await skapaInloggning(session.shop);
    return json({ ok: true, url });
  }

  if (intent === "google-login-url") {
    /* Engångslänken skapas här — i en autentiserad action — så att butiken
       är bevisad innan fönstret öppnas. Fönstret självt har ingen session. */
    if (!googleAvailable()) return json({ ok: false, message: T.settings.googleNotConfigured }, { status: 400 });
    const url = await skapaInloggning(session.shop, undefined, "google");
    return json({ ok: true, url });
  }

  if (intent === "google-disconnect") {
    await prisma.shopSettings.update({ where: { shop: session.shop }, data: GOOGLE_TOMT });
    await koppplaBort(session.shop);
    glomGoogleFel(session.shop);
    glomKontolista(session.shop);
    return json({ ok: true, message: T.settings.googleDisconnected });
  }

  if (intent === "google-account-add") {
    const id = String(f.get("customerId") ?? "").replace(/\D/g, "");
    if (!id) return json({ ok: false, message: T.settings.unknownError });
    const namn = String(f.get("name") ?? "").trim() || id;
    await laggTillGoogleKonto(session.shop, {
      customerId: id,
      name: namn,
      currency: String(f.get("currency") ?? "").trim(),
      timezone: String(f.get("timezone") ?? "").trim(),
      loginCustomerId: null,
    });
    /* Nytt konto: en gammal backoff från ett dött konto får inte hindra
       hämtningen av det här. */
    glomGoogleFel(session.shop);
    return json({ ok: true, message: T.settings.googleAdded(namn) });
  }

  if (intent === "google-account-remove") {
    const id = String(f.get("customerId") ?? "").replace(/\D/g, "");
    if (!id) return json({ ok: false, message: T.settings.unknownError });
    const namn = String(f.get("name") ?? "").trim() || id;
    await taBortGoogleKonto(session.shop, id);
    return json({ ok: true, message: T.settings.googleRemoved(namn) });
  }

  if (intent === "meta-disconnect") {
    /* Databasen först, sedan Meta (best effort — en token från inloggningen
       ska inte ligga kvar giltig i världen). Bara inloggningstoken återkallas,
       och bara när ingen ANNAN butik använder samma Facebook-användare:
       återkallelsen gäller hela användaren, inte den här butiken. En
       inklistrad systemanvändar-token tillhör handlarens Business Manager
       och rörs aldrig. */
    const token = s?.metaTokenSource === "login" && s.metaAccessToken ? decrypt(s.metaAccessToken) : null;
    const aterkalla = token ? await farAterkallas(session.shop, s?.metaUserId ?? null) : false;
    await prisma.shopSettings.update({ where: { shop: session.shop }, data: META_TOMT });
    await taBortAllaKonton(session.shop);
    await prisma.dailySpend.deleteMany({ where: { shop: session.shop } });
    await prisma.hourlySpend.deleteMany({ where: { shop: session.shop } });
    glomMetaFel(session.shop);
    if (token && aterkalla) await aterkallaToken(token);
    return json({ ok: true, message: T.settings.disconnected });
  }

  /* Kontot kopplas i samma sekund det väljs — Spara-knappen längst ner under
     två andra kort var ett steg som inte blev gjort. Det LÄGGS TILL: en butik
     som kör annonser från tre konton ska se summan av alla tre. */
  if (intent === "meta-account-add") {
    const nyttKonto = kontoId(String(f.get("accountId") ?? "")) || null;
    if (!nyttKonto) return json({ ok: false, message: T.settings.unknownError });
    const namn = String(f.get("name") ?? "").trim() || null;
    const valuta = String(f.get("currency") ?? "").trim() || null;
    const nytt = await laggTillKonto(session.shop, nyttKonto, namn, valuta);
    /* Nytt konto: en gammal backoff från ett dött konto får inte hindra
       hämtningen av det här. */
    if (nytt) glomMetaFel(session.shop);
    return json({ ok: true, message: T.settings.accountAdded(namn ?? nyttKonto) });
  }

  if (intent === "meta-account-remove") {
    const konto = kontoId(String(f.get("accountId") ?? "")) || null;
    if (!konto) return json({ ok: false, message: T.settings.unknownError });
    await taBortKonto(session.shop, konto);
    glomMetaFel(session.shop);
    return json({ ok: true, message: T.settings.accountRemoved });
  }

  /* Kampanjlistan: hämtas på klick, inte i loadern. Två Graph-anrop (namn +
     spend 30 dagar) ska inte ligga på varje sidladdning för alla som aldrig
     rör filtret. Kontot måste vara ett av butikens — sidan ska inte gå att
     använda för att bläddra i konton butiken inte kopplat. */
  if (intent === "meta-campaigns" || intent === "meta-campaigns-save") {
    const konto = kontoId(String(f.get("accountId") ?? ""));
    const mina = await hamtaKonton(session.shop);
    if (!konto || !mina.some((k) => k.accountId === konto)) {
      return json({ ok: false, message: T.settings.campaigns.failed }, { status: 400 });
    }

    if (intent === "meta-campaigns") {
      const token = s?.metaAccessToken ? decrypt(s.metaAccessToken) : null;
      if (!token) return json({ ok: false, message: T.settings.campaigns.failed }, { status: 400 });
      try {
        return json({ ok: true, kampanjer: await listaKampanjer({ adAccountId: konto, accessToken: token }) });
      } catch (e) {
        console.error(`Kampanjlistan för ${session.shop} (konto ${konto}) misslyckades:`, e);
        return json({ ok: false, message: T.settings.campaigns.failed }, { status: 500 });
      }
    }

    const onskatLage = String(f.get("campaignMode") ?? "all");
    const valda = [
      ...new Set(String(f.get("campaignIds") ?? "").split(",").map((x) => x.trim()).filter(Boolean)),
    ];
    /* Utan kryssade kampanjer finns inget filter att tillämpa. "Bara valda"
       med noll val hade betytt noll annonskostnad — det är aldrig vad någon
       menar, och en tyst nolla är den dyraste lögnen panelen kan berätta. */
    const lage = (onskatLage === "include" || onskatLage === "exclude") && valda.length ? onskatLage : "all";
    const ids = lage === "all" ? null : valda.join(",");
    /* Marknad per kampanj: { "<kampanj-id>": "NO" }. Skräp filtreras i
       sparaKampanjfilter; ett trasigt JSON räknas som "ingen ändring". */
    let marknader: Record<string, string> | undefined;
    try {
      const ra = JSON.parse(String(f.get("campaignMarkets") ?? "null"));
      if (ra && typeof ra === "object") marknader = ra as Record<string, string>;
    } catch {
      marknader = undefined;
    }
    /* Cachade DailySpend-rader för DET HÄR kontot är räknade på det gamla
       filtret och är fel nu — de andra kontonas rader rörs inte. */
    if (await sparaKampanjfilter(session.shop, konto, lage, ids, marknader)) glomMetaFel(session.shop);
    return json({ ok: true, message: T.settings.campaigns.saved });
  }

  /* Koppla Claude: handlarens EGEN nyckel, krypterad i vila. Nyckeln testas
     mot Anthropic innan den sparas — en felklistrad nyckel som sparas tyst
     gör att AI-rutan slutar fungera utan att någon förstår varför. */
  if (intent === "claude-connect") {
    const nyckel = String(f.get("anthropicApiKey") ?? "").trim();
    if (!serNyckelUt(nyckel)) return json({ ok: false, message: T.settings.claude.badKey }, { status: 400 });
    if (!encryptionAvailable()) return json({ ok: false, message: T.settings.claude.noEncryption }, { status: 400 });
    const prov = await provaNyckel(nyckel);
    if (!prov.ok) return json({ ok: false, message: T.settings.claude.rejected(prov.fel ?? "?") }, { status: 400 });
    await prisma.shopSettings.update({
      where: { shop: session.shop },
      data: { anthropicApiKey: encrypt(nyckel), anthropicKeySavedAt: new Date() },
    });
    return json({ ok: true, message: T.settings.claude.saved });
  }

  if (intent === "claude-disconnect") {
    await prisma.shopSettings.update({
      where: { shop: session.shop },
      data: { anthropicApiKey: null, anthropicKeySavedAt: null },
    });
    return json({ ok: true, message: T.settings.claude.removed });
  }

  const dec = (k: string) => parseFloat(String(f.get(k) ?? "").replace(",", "."));
  const token = String(f.get("metaAccessToken") ?? "").trim();
  /* Avgifter per marknad: fälten heter fee_<KOD> och fx_<KOD>, i procent.
     Tomt fält = ingen egen sats (standardavgiften gäller, ingen växling). */
  const marketFees: Record<
    string,
    { feeRate: number | null; fxFeeRate: number | null; tariffPerOrder: number | null }
  > = {};
  for (const [k, v] of f.entries()) {
    const m = k.match(/^(fee|fx|tull)_([A-Z]{2})$/);
    if (!m) continue;
    const n = parseFloat(String(v ?? "").replace(",", "."));
    const post = (marketFees[m[2]] ??= { feeRate: null, fxFeeRate: null, tariffPerOrder: null });
    /* Tullen är ett belopp i butikens valuta; avgifterna är procent. Att
       dela tullen med 100 hade gjort 27,50 kr till 27,5 öre. */
    if (m[1] === "tull") post.tariffPerOrder = Number.isFinite(n) && n >= 0 ? n : null;
    else {
      const andel = Number.isFinite(n) && n >= 0 ? n / 100 : null;
      if (m[1] === "fee") post.feeRate = andel;
      else post.fxFeeRate = andel;
    }
  }

  /* En inklistrad användartoken dör också efter 60 dagar — utan varning om
     vi inte frågar Meta när den går ut. Går bara att fråga om token kommer
     från samma Meta-app som servern känner; annars förblir utgången okänd. */
  const cfg = metaLoginConfig();
  const manuellUtgang = token && cfg ? await bestamUtgang(cfg, token, null) : null;

  /* Tullen kvitteras bara när den faktiskt granskats: ett tullbelopp har
     ändrats (standard eller per marknad), eller rutan "Tullbeloppen stämmer"
     är ikryssad. En sparning som bara bytte språk eller klistrade in en
     Meta-nyckel stämplade förut 27,50 i tull som granskad. */
  const tullPer = (k: Record<string, { tariffPerOrder: number | null }>) =>
    Object.fromEntries(Object.entries(k).map(([m, a]) => [m, a.tariffPerOrder]));
  const nyaAvgifter = stadaAvgifter(marketFees);
  const kvitterad = tullKvitterad(
    { tariffPerOrder: Number(s?.tariffPerOrder ?? 0), perMarknad: tullPer(stadaAvgifter(s?.marketFees)) },
    { tariffPerOrder: dec("tariffPerOrder"), perMarknad: tullPer(nyaAvgifter) },
    String(f.get("tariffConfirm") ?? "") === "true",
  );

  await prisma.shopSettings.update({
    where: { shop: session.shop },
    data: {
      language: asLang(String(f.get("language") ?? "")),
      tariffPerOrder: dec("tariffPerOrder"),
      feeRate: dec("feeRate") / 100,
      /* Tomt eller ogiltigt fält = 0 (ingen tredjepartsavgift), aldrig NaN
         i databasen. Negativt vore en intäkt. */
      thirdPartyFeeRate: (() => {
        const n = dec("thirdPartyFeeRate");
        return Number.isFinite(n) && n > 0 ? n / 100 : 0;
      })(),
      targetMargin: dec("targetMargin") / 100,
      marketFees: nyaAvgifter as object,
      // Tomt fält = behåll befintlig token, radera den inte av misstag.
      ...(token
        ? {
            metaAccessToken: encrypt(token),
            metaTokenSource: "manual",
            metaTokenExpiresAt: manuellUtgang,
            metaTokenSavedAt: new Date(),
            metaTokenRefreshAttemptAt: null,
            metaUserName: null,
            metaUserId: null,
            metaAppId: null,
          }
        : {}),
      /* Sparad minst en gång. Kvitterar INTE längre tullsteget — det gör
         `tariffConfirmedAt` nedan, och bara vid en riktig granskning. */
      settingsSavedAt: new Date(),
      ...(kvitterad ? { tariffConfirmedAt: new Date() } : {}),
    },
  });
  if (token) glomMetaFel(session.shop);
  return json({ ok: true, message: T.settings.saved });
}

type LoginSignal = { type: "meta-login"; ok: boolean; reason?: string };

export default function Settings() {
  const d = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const loginFetcher = useFetcher<typeof action>();
  const kontoFetcher = useFetcher<typeof action>();
  const revalidator = useRevalidator();
  const [v, setV] = useState({
    language: d.lang as string,
    tariffPerOrder: String(d.tariffPerOrder),
    feeRate: String((d.feeRate * 100).toFixed(2)),
    thirdPartyFeeRate: String((d.thirdPartyFeeRate * 100).toFixed(2)),
    targetMargin: String(Math.round(d.targetMargin * 100)),
    metaAccessToken: "",
    /* Rutan "Tullbeloppen stämmer". Skickas som "true"/"false" — ikryssad
       kvitterar tullen även när inget belopp ändrats. */
    tariffConfirm: "false",
  });
  const set = (k: keyof typeof v) => (val: string) => setV((s) => ({ ...s, [k]: val }));
  const T = t(d.lang);
  /* Koppla Claude. Nyckeln skickas EN gång och lagras krypterad; fältet töms
     efteråt och visar sedan bara de fyra sista tecknen ur loadern. */
  const claudeFetcher = useFetcher<typeof action>();
  const [claudeNyckel, setClaudeNyckel] = useState("");
  useEffect(() => {
    if (claudeFetcher.state === "idle" && (claudeFetcher.data as { ok?: boolean } | undefined)?.ok) {
      setClaudeNyckel("");
      revalidator.revalidate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claudeFetcher.state, claudeFetcher.data]);

  /* Avgifter per marknad, som procentsträngar per landskod. Sparas med Spara. */
  type Avgiftsfalt = { feeRate: string; fxFeeRate: string; tariffPerOrder: string };
  const tomAvgift = (): Avgiftsfalt => ({ feeRate: "", fxFeeRate: "", tariffPerOrder: "" });
  const [avgifter, setAvgifter] = useState<Record<string, Avgiftsfalt>>(
    d.marketFees as Record<string, Avgiftsfalt>,
  );
  const sattAvgift = (m: string, falt: keyof Avgiftsfalt) => (val: string) =>
    setAvgifter((a) => ({ ...a, [m]: { ...tomAvgift(), ...(a[m] ?? {}), [falt]: val } }));
  const avgiftsFalt = Object.fromEntries(
    Object.entries(avgifter).flatMap(([m, a]) => [
      [`fee_${m}`, a.feeRate],
      [`fx_${m}`, a.fxFeeRate],
      [`tull_${m}`, a.tariffPerOrder ?? ""],
    ]),
  );
  /* Efter en sparning visar fälten det som FAKTISKT ligger i databasen, inte
     det man råkade skriva. Utan det här stod siffran kvar i rutan vare sig
     den sparades eller inte, och "gick det att spara?" gick inte att se.
     (Loadern läser om sig själv efter varje sparning.) */
  const sparadeAvgifter = JSON.stringify(d.marketFees);
  useEffect(() => {
    setAvgifter(d.marketFees as Record<string, Avgiftsfalt>);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sparadeAvgifter]);

  /* ---- Logga in med Facebook ----
     Klick → fönstret öppnas SYNKRONT (annars stoppar webbläsaren det som en
     oönskad popup) → en action skapar engångslänken → fönstret skickas dit.
     Sedan pollas en billig statusrutt tills en ny token sparats (eller fem
     minuter gått). Fönstrets egna signaler (postMessage, "stängt") är bara
     genvägar: en Cross-Origin-Opener-Policy hos Facebook kan kapa bandet
     mellan fönstren, och då är databasen det enda som säkert vet. */
  const popup = useRef<Window | null>(null);
  const [popupBlocked, setPopupBlocked] = useState(false);
  const [visaMetaVideo, setVisaMetaVideo] = useState(false);
  const [loginUrl, setLoginUrl] = useState<string | null>(null);
  const [vantar, setVantar] = useState(false);
  const [loginBesked, setLoginBesked] = useState<string | null>(null);
  const snapshot = useRef<string | null>(d.metaTokenSavedAt);
  const statusFetcher = useFetcher<{ savedAt: string | null; source: string | null }>();
  /* Fetcher-objektet byts vid varje tillståndsändring; effekten nedan skulle
     annars se ett fruset "idle" och avbryta en långsam fråga var 2,5 s. */
  const statusRef = useRef(statusFetcher);
  statusRef.current = statusFetcher;
  /* Vilket action-svar som redan skickat fönstret vidare — så att vi agerar
     så fort svaret finns, inte först när hela sidans loaders laddat om
     (kontolistan mot Meta kan ta åtta sekunder). */
  const hanterat = useRef<unknown>(null);
  const [manuellOppen, setManuellOppen] = useState(!d.metaLogin);

  const startaLogin = () => {
    setPopupBlocked(false);
    setLoginUrl(null);
    setLoginBesked(null);
    snapshot.current = d.metaTokenSavedAt;
    const w = window.open("", "meta-login", "popup,width=640,height=760");
    if (w) {
      popup.current = w;
      try {
        w.document.write(`<p style="font-family:system-ui;padding:24px">${T.settings.loginOpening}</p>`);
      } catch {
        /* kosmetiskt */
      }
    } else {
      popup.current = null;
      setPopupBlocked(true); // länken visas när adressen kommit
    }
    loginFetcher.submit({ intent: "meta-login-url" }, { method: "POST" });
  };

  useEffect(() => {
    if (!loginFetcher.data || loginFetcher.data === hanterat.current) return;
    hanterat.current = loginFetcher.data;
    const data = loginFetcher.data as { ok: boolean; url?: string };
    const w = popup.current;
    if (!data.ok || !data.url) {
      w?.close();
      popup.current = null;
      return;
    }
    /* about:blank saknar bas-URL — adressen måste vara absolut. */
    const abs = new URL(data.url, window.location.origin).href;
    if (w && !w.closed) {
      w.location.href = abs;
    } else {
      setLoginUrl(abs); // popup stoppad: handlaren klickar länken själv
    }
    setVantar(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginFetcher.state, loginFetcher.data]);

  /* Pollningen: en setTimeout-kedja grindad på att förra frågan är klar —
     aldrig setInterval, som skulle stapla frågor om servern är långsam.
     "Fönstret stängt" är bara en LEDTRÅD: en Cross-Origin-Opener-Policy hos
     Facebook får fönstret att se stängt ut i samma sekund det når dem. Efter
     sex sekunder visas därför "inget svar kom" som hjälp, men pollningen
     fortsätter till taket — en sen lyckad inloggning tar bort texten. */
  useEffect(() => {
    if (!vantar) return;
    const start = Date.now();
    let stangdesVid = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const fraga = () => {
      if (Date.now() - start > 5 * 60 * 1000) {
        setVantar(false);
        setLoginUrl(null);
        setPopupBlocked(false);
        setLoginBesked(T.settings.loginNothingBack);
        return;
      }
      if (popup.current?.closed && !stangdesVid) stangdesVid = Date.now();
      if (stangdesVid && Date.now() - stangdesVid > 6000) {
        setLoginBesked(T.settings.loginNothingBack);
      }
      if (statusRef.current.state === "idle") statusRef.current.load("/app/meta-status");
      timer = setTimeout(fraga, 2500);
    };
    timer = setTimeout(fraga, 2500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vantar]);

  const klar = () => {
    setVantar(false);
    setLoginUrl(null);
    setPopupBlocked(false);
    setLoginBesked(null);
    revalidator.revalidate();
  };

  useEffect(() => {
    if (!vantar || !statusFetcher.data) return;
    if (statusFetcher.data.savedAt && statusFetcher.data.savedAt !== snapshot.current) klar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFetcher.data]);

  useEffect(() => {
    /* Fönstret säger till direkt när det kan — snabbare än nästa poll, och
       enda sättet att få veta att handlaren AVBRÖT (inget sparas då). Bara
       meddelanden från vår egen origin räknas. */
    const h = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      const m = e.data as LoginSignal | undefined;
      if (!m || typeof m !== "object" || m.type !== "meta-login") return;
      if (m.ok) {
        klar();
        return;
      }
      setVantar(false);
      setLoginUrl(null);
      setPopupBlocked(false);
      const besked: Record<string, string> = {
        cancelled: T.settings.loginCancelled,
        declined: T.settings.loginDeclined,
        "no-accounts": T.settings.loginNoAccounts,
        "account-not-visible": T.settings.loginAccountNotVisible,
      };
      setLoginBesked(besked[m.reason ?? ""] ?? T.settings.loginMetaFailed);
    };
    window.addEventListener("message", h);
    return () => window.removeEventListener("message", h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Token-fältet töms bara när servern faktiskt sparat eller tagit bort en
     token — inte när ett konto kopplas, annars försvinner en inklistrad men
     osparad token under fingrarna på handlaren. */
  useEffect(() => {
    setV((s) => ({ ...s, metaAccessToken: "" }));
  }, [d.metaTokenSavedAt, d.hasMetaToken]);

  /* ---- Annonskontona ----
     Flera konton kan höra till samma butik; annonskostnaden är summan av dem.
     Väljaren visar bara de konton som INTE redan är kopplade — att kunna välja
     ett konto som redan står i listan gör bara knappen förvirrande. */
  const [laggTillOppen, setLaggTillOppen] = useState(false);
  const [manuelltKonto, setManuelltKonto] = useState("");
  const kopplade = d.kopplade;
  const kopplat = new Set(kopplade.map((k) => k.accountId));
  const lediga = (d.konton ?? []).filter((k) => !kopplat.has(k.accountId));

  const laggTill = (id: string, namn?: string, valuta?: string) => {
    if (!kontoId(id)) return;
    kontoFetcher.submit(
      { intent: "meta-account-add", accountId: id, name: namn ?? "", currency: valuta ?? "" },
      { method: "POST" },
    );
    setLaggTillOppen(false);
    setManuelltKonto("");
  };
  const valjKonto = (id: string) => {
    const k = d.konton?.find((x) => x.accountId === id);
    laggTill(id, k?.name, k?.currency);
  };

  const loginMisslyckades =
    loginFetcher.state === "idle" && loginFetcher.data && !(loginFetcher.data as { ok: boolean }).ok;

  const kontoAlternativ = lediga.map((k) => ({
    label:
      `${k.name} · ${k.currency} · ${k.accountId}` +
      (k.status === 1 ? "" : ` (${T.settings.accountStatus(k.status)})`),
    value: k.accountId,
  }));
  const visaLista = Boolean(d.konton && d.konton.length > 0);
  const utgangen = (d.metaTokenDagar != null && d.metaTokenDagar < 0) || Boolean(d.kontoFel?.utgangen);
  const snartSlut = !utgangen && d.metaTokenDagar != null && d.metaTokenDagar <= VARNA_DAGAR;

  /* Textfältet är reservvägen: en systemanvändar-token vars kontolista inte
     går att hämta måste ändå kunna peka ut ett konto. */
  const kontoFalt = (
    <InlineStack gap="200" blockAlign="end" wrap>
      <div style={{ minWidth: 220, flex: "1 1 220px" }}>
        <TextField
          label={T.settings.adAccountLabel}
          value={manuelltKonto}
          onChange={setManuelltKonto}
          autoComplete="off"
          helpText={T.settings.adAccountHelp}
        />
      </div>
      <Button
        disabled={!kontoId(manuelltKonto)}
        loading={kontoFetcher.state !== "idle"}
        onClick={() => laggTill(manuelltKonto)}
      >
        {T.settings.addAccountButton}
      </Button>
    </InlineStack>
  );
  const tokenFalt = (
    <TextField
      label={T.settings.tokenLabel}
      type="password"
      value={v.metaAccessToken}
      onChange={set("metaAccessToken")}
      autoComplete="off"
      helpText={d.hasMetaToken ? T.settings.tokenHelpSaved : T.settings.tokenHelpEmpty}
    />
  );

  return (
    <Page title={T.settings.title}>
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Select
                label={T.settings.languageLabel}
                options={[
                  { label: "English", value: "en" },
                  { label: "Svenska", value: "sv" },
                ]}
                value={v.language}
                onChange={set("language")}
              />
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingMd">{T.settings.costsPerOrder}</Text>
              <TextField
                label={T.settings.tariffLabel(d.currency)}
                value={v.tariffPerOrder}
                onChange={set("tariffPerOrder")}
                autoComplete="off"
                helpText={T.settings.tariffHelp}
              />
              {/* Kvittensen av tullen. Visas tills den gjorts — sedan bara
                  datumet. Att ändra ett tullbelopp kvitterar också. */}
              {d.tariffConfirmedAt ? (
                <Text as="p" variant="bodySm" tone="subdued">{T.settings.tariffConfirmedNote(d.tariffConfirmedAt)}</Text>
              ) : (
                <Checkbox
                  label={T.settings.tariffConfirm}
                  helpText={T.settings.tariffConfirmHelp}
                  checked={v.tariffConfirm === "true"}
                  onChange={(c) => setV((x) => ({ ...x, tariffConfirm: c ? "true" : "false" }))}
                />
              )}
              <TextField
                label={T.settings.feeLabel}
                value={v.feeRate}
                onChange={set("feeRate")}
                autoComplete="off"
                helpText={T.settings.feeHelp}
              />
              <TextField
                label={T.settings.thirdPartyLabel}
                value={v.thirdPartyFeeRate}
                onChange={set("thirdPartyFeeRate")}
                autoComplete="off"
                helpText={T.settings.thirdPartyHelp}
              />
              {/* Betalsätten de senaste 90 dagarna. Står bredvid avgifts-
                  fälten med flit: den som ser "paypal: 30 %" vet att satsen
                  ovan gäller på riktigt, och att "faktiska avgifter" bara
                  gäller Shopify Payments-delen. */}
              <BlockStack gap="100">
                <Text as="h3" variant="headingSm">{T.settings.gateways.title}</Text>
                {d.betalvagar.length ? (
                  d.betalvagar.map((b) => (
                    <Text key={b.gateway} as="p" variant="bodySm">
                      {T.settings.gateways.share(betalvagNamn(b.gateway, T.settings.gateways.none), b.pct)}
                    </Text>
                  ))
                ) : (
                  <Text as="p" variant="bodySm" tone="subdued">{T.settings.gateways.empty}</Text>
                )}
                <Text as="p" variant="bodySm" tone="subdued">{T.settings.gateways.explain}</Text>
              </BlockStack>
              <TextField
                label={T.settings.marginLabel}
                value={v.targetMargin}
                onChange={set("targetMargin")}
                autoComplete="off"
                helpText={T.settings.marginHelp}
              />
              {/* Avgifter per marknad. Shopify Payments tar mer för utländska
                  kort och en växlingsavgift när kunden betalar i en annan valuta
                  — på en butik som säljer till USA, Kanada, UK och Australien
                  är det procent av omsättningen som annars räknas som vinst. */}
              {d.marknader.length ? (
                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm">{T.settings.marketFees.title}</Text>
                  <Text as="p" variant="bodySm" tone="subdued">{T.settings.marketFees.body}</Text>
                  {d.uppmatt[""] ? (
                    <Banner tone="info">{T.settings.marketFees.measuredAll(d.uppmatt[""].pct, d.uppmatt[""].days)}</Banner>
                  ) : null}
                  {d.marknader.map((m) => (
                    <InlineStack key={m} gap="300" blockAlign="end" wrap>
                      <div style={{ minWidth: 160, flex: "1 1 160px" }}>
                        <Text as="p" variant="bodyMd">{`${marknadsnamn(m, d.lang, m)} (${m})`}</Text>
                        {d.uppmatt[m] ? (
                          <Text as="p" variant="bodySm" tone="subdued">{T.settings.marketFees.measured(d.uppmatt[m].pct)}</Text>
                        ) : null}
                      </div>
                      <div style={{ width: 170 }}>
                        <TextField
                          label={T.settings.marketFees.feeLabel}
                          value={avgifter[m]?.feeRate ?? ""}
                          onChange={sattAvgift(m, "feeRate")}
                          autoComplete="off"
                          placeholder={v.feeRate}
                          suffix="%"
                        />
                      </div>
                      <div style={{ width: 170 }}>
                        <TextField
                          label={T.settings.marketFees.fxLabel}
                          value={avgifter[m]?.fxFeeRate ?? ""}
                          onChange={sattAvgift(m, "fxFeeRate")}
                          autoComplete="off"
                          placeholder="0"
                          suffix="%"
                        />
                      </div>
                      {/* Tullen per order för just den här marknaden. En butik
                          som säljer både till EU och Nordamerika har två helt
                          olika tal, och tomt fält betyder butikens standard. */}
                      <div style={{ width: 170 }}>
                        <TextField
                          label={T.settings.marketFees.tariffLabel}
                          value={avgifter[m]?.tariffPerOrder ?? ""}
                          onChange={sattAvgift(m, "tariffPerOrder")}
                          autoComplete="off"
                          placeholder={v.tariffPerOrder}
                          suffix={d.currency}
                        />
                      </div>
                    </InlineStack>
                  ))}
                  <Text as="p" variant="bodySm" tone="subdued">{T.settings.marketFees.hint}</Text>
                </BlockStack>
              ) : null}
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingMd">{T.settings.metaTitle}</Text>

              {d.metaLogin ? (
                <BlockStack gap="200">
                  <InlineStack gap="300" blockAlign="center" wrap>
                    <Button
                      variant={d.hasMetaToken && !utgangen ? "secondary" : "primary"}
                      loading={loginFetcher.state !== "idle"}
                      onClick={startaLogin}
                    >
                      {d.hasMetaToken && d.metaTokenSource === "login"
                        ? T.settings.reconnectButton
                        : T.settings.loginButton}
                    </Button>
                    {d.hasMetaToken ? (
                      <Text as="span" tone="subdued">
                        {d.metaTokenSource === "login"
                          ? T.settings.connectedAs(d.metaUserName ?? "Facebook")
                          : T.settings.connectedManual}
                      </Text>
                    ) : null}
                  </InlineStack>
                  <Text as="p" variant="bodySm" tone="subdued">
                    {T.settings.loginHelp}
                  </Text>
                  {/* Axels Loom-inspelning (2026-09-08): hela Meta-kopplingen, klick för klick. */}
                  <Button variant="plain" disclosure={visaMetaVideo ? "up" : "down"} onClick={() => setVisaMetaVideo((x) => !x)}>
                    {visaMetaVideo ? T.settings.metaHideVideo : T.settings.metaVideo}
                  </Button>
                  {visaMetaVideo ? (
                    <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, borderRadius: 8, overflow: "hidden" }}>
                      <iframe
                        src={LOOM_META}
                        title={T.settings.metaVideo}
                        allowFullScreen
                        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
                      />
                    </div>
                  ) : null}
                  {popupBlocked ? (
                    <Banner tone="warning">
                      <BlockStack gap="200">
                        <Text as="p">{T.settings.loginPopupBlocked}</Text>
                        {loginUrl ? (
                          <div>
                            {/* Vanlig länk, inte Polaris Button: den sätter
                                rel="noreferrer" på _blank, och /meta/start
                                behöver Referer i webbläsare utan Sec-Fetch-Site.
                                rel="opener" (moderna webbläsare ger _blank
                                noopener som standard) så att klar-sidans
                                postMessage har någon att prata med. Sidan är
                                vår egen — inget främmande får referensen. */}
                            <a
                              href={loginUrl}
                              target="_blank"
                              rel="opener"
                              onClick={(e) => {
                                const w = window.open(loginUrl, "meta-login");
                                if (w) {
                                  e.preventDefault();
                                  popup.current = w;
                                }
                              }}
                            >
                              {T.settings.loginOpenLink}
                            </a>
                          </div>
                        ) : null}
                      </BlockStack>
                    </Banner>
                  ) : null}
                  {vantar && !popupBlocked ? (
                    <Text as="p" variant="bodySm" tone="subdued">
                      {T.settings.loginWaiting}
                    </Text>
                  ) : null}
                  {loginBesked ? <Banner tone="warning">{loginBesked}</Banner> : null}
                  {loginMisslyckades ? <Banner tone="critical">{T.settings.loginFailed}</Banner> : null}
                </BlockStack>
              ) : null}

              {utgangen ? (
                /* Utan inloggningsknapp på den här tjänsten är "logga in igen"
                   fel råd — då är åtgärden en ny inklistrad token. */
                <Banner
                  tone="critical"
                  title={d.metaLogin ? T.settings.expiredTitle : T.settings.expiredTitleManual}
                >
                  {d.metaLogin ? T.settings.expiredBody : T.settings.expiredBodyManual}
                </Banner>
              ) : snartSlut ? (
                <Banner tone="warning">{T.settings.expiresSoon(d.metaTokenDagar!)}</Banner>
              ) : null}

              {d.hasMetaToken && !kopplade.length && !utgangen ? (
                <Banner tone="warning">{T.settings.pickAccountReminder}</Banner>
              ) : null}

              {/* De kopplade kontona, ett kort per konto. Annonskostnaden är
                  summan av dem alla — därför är listan, inte ett enda val,
                  det handlaren ser. */}
              {kopplade.length ? (
                <BlockStack gap="300">
                  <Text as="h3" variant="headingSm">{T.settings.accountsTitle}</Text>
                  {kopplade.length > 1 ? (
                    <Text as="p" variant="bodySm" tone="subdued">{T.settings.accountsSummed}</Text>
                  ) : null}
                  {kopplade.map((k) => (
                    <KontoRad
                      key={k.accountId}
                      konto={k}
                      butiksValuta={d.currency}
                      lang={d.lang}
                      kanTaBort={d.hasMetaToken}
                      marknader={d.marknader}
                    />
                  ))}
                </BlockStack>
              ) : null}

              {/* Plusknappen: väljaren visas först när den trycks, så kortet
                  inte ser ut som ett formulär att fylla i varje gång. */}
              {visaLista ? (
                <BlockStack gap="200">
                  {laggTillOppen && lediga.length ? (
                    <Select
                      label={T.settings.accountSelectLabel}
                      options={kontoAlternativ}
                      placeholder={T.settings.accountSelectPlaceholder}
                      value=""
                      onChange={valjKonto}
                      helpText={T.settings.accountSelectHelp}
                    />
                  ) : (
                    <div>
                      <Button
                        variant="plain"
                        loading={kontoFetcher.state !== "idle"}
                        disabled={!lediga.length}
                        onClick={() => setLaggTillOppen(true)}
                      >
                        {kopplade.length
                          ? lediga.length
                            ? T.settings.addAnotherAccount
                            : T.settings.allAccountsAdded
                          : T.settings.chooseAccountButton}
                      </Button>
                    </div>
                  )}
                  {kontoFetcher.data?.ok && kontoFetcher.state === "idle" ? (
                    <Text as="p" variant="bodySm" tone="success">
                      {(kontoFetcher.data as { message?: string }).message}
                    </Text>
                  ) : null}
                </BlockStack>
              ) : d.konton && d.konton.length === 0 ? (
                <Banner tone="warning">{T.settings.noAccounts}</Banner>
              ) : d.kontoFel && !d.kontoFel.utgangen ? (
                <Banner
                  tone="warning"
                  action={{ content: T.settings.tryAgain, onAction: () => revalidator.revalidate() }}
                >
                  {T.settings.accountsUnavailableRetry}
                </Banner>
              ) : null}

              {d.metaLogin ? (
                <BlockStack gap="200">
                  <div>
                    <Button
                      variant="plain"
                      disclosure={manuellOppen ? "up" : "down"}
                      onClick={() => setManuellOppen((o) => !o)}
                    >
                      {T.settings.manualTitle}
                    </Button>
                  </div>
                  <Collapsible open={manuellOppen} id="meta-manuell">
                    <BlockStack gap="300">
                      <Text as="p" variant="bodySm" tone="subdued">
                        {T.settings.manualBody}
                      </Text>
                      {visaLista ? null : kontoFalt}
                      {tokenFalt}
                    </BlockStack>
                  </Collapsible>
                </BlockStack>
              ) : (
                <BlockStack gap="300">
                  {visaLista ? null : kontoFalt}
                  {tokenFalt}
                </BlockStack>
              )}

              <Banner tone="info">{T.settings.metaBanner}</Banner>
              {d.krypteringPa ? (
                <Text as="p" variant="bodySm" tone="subdued">
                  {T.settings.encryptedNote}
                </Text>
              ) : (
                <Banner tone="warning" title={T.settings.unencryptedTitle}>
                  {T.settings.unencryptedBody}
                </Banner>
              )}

              {d.hasMetaToken ? (
                <InlineStack gap="300" blockAlign="center" wrap>
                  <Button
                    tone="critical"
                    variant="plain"
                    loading={fetcher.state !== "idle"}
                    onClick={() => {
                      setV((s) => ({ ...s, metaAccessToken: "" }));
                      setManuelltKonto("");
                      fetcher.submit({ intent: "meta-disconnect" }, { method: "POST" });
                    }}
                  >
                    {T.settings.disconnectButton}
                  </Button>
                  <Text as="span" variant="bodySm" tone="subdued">
                    {T.settings.disconnectHelp}
                  </Text>
                </InlineStack>
              ) : null}
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Koppla Google Ads. Eget kort bredvid Metas: kostnaden hamnar i
            samma vinstsiffra, men kopplingen är en annan. */}
        <Layout.Section>
          <GoogleKort google={d.google} T={T} />
        </Layout.Section>

        {/* Koppla Claude. Egen knapp och eget kort — kopplingen ska se ut som
            Meta-kopplingen, inte gömma sig bakom Spara längst ner. */}
        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingMd">{T.settings.claude.title}</Text>
              <Text as="p" tone="subdued">{T.settings.claude.body}</Text>

              {d.claude.kalla === "butik" ? (
                <InlineStack gap="300" blockAlign="center" wrap>
                  <Text as="p" fontWeight="semibold">
                    {`${T.settings.claude.connected(d.claude.slut ?? "")}${d.claude.sparad ? ` · ${T.settings.claude.since(d.claude.sparad)}` : ""}`}
                  </Text>
                  <Button
                    tone="critical"
                    loading={claudeFetcher.state !== "idle"}
                    onClick={() => claudeFetcher.submit({ intent: "claude-disconnect" }, { method: "POST" })}
                  >
                    {T.settings.claude.remove}
                  </Button>
                </InlineStack>
              ) : (
                <BlockStack gap="400">
                  {d.claude.kalla === "server" ? (
                    <Text as="p" variant="bodySm" tone="subdued">{T.settings.claude.onServer}</Text>
                  ) : null}
                  {/* Guiden ligger ovanför fältet så länge ingen nyckel är
                      kopplad — är den kopplad är den bara i vägen. */}
                  <ClaudeGuide T={T} />
                  <TextField
                    label={T.settings.claude.label}
                    value={claudeNyckel}
                    onChange={setClaudeNyckel}
                    autoComplete="off"
                    type="password"
                    placeholder={T.settings.claude.placeholder}
                    helpText={T.settings.claude.where}
                  />
                  <div>
                    <Button
                      variant="primary"
                      disabled={!claudeNyckel.trim()}
                      loading={claudeFetcher.state !== "idle"}
                      onClick={() =>
                        claudeFetcher.submit(
                          { intent: "claude-connect", anthropicApiKey: claudeNyckel.trim() },
                          { method: "POST" },
                        )
                      }
                    >
                      {claudeFetcher.state !== "idle" ? T.settings.claude.saving : T.settings.claude.save}
                    </Button>
                  </div>
                </BlockStack>
              )}

              {claudeFetcher.state === "idle" && claudeFetcher.data ? (
                <Banner tone={(claudeFetcher.data as { ok?: boolean }).ok ? "success" : "critical"}>
                  {(claudeFetcher.data as { message?: string }).message ?? ""}
                </Banner>
              ) : null}
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Button
            variant="primary"
            loading={fetcher.state !== "idle"}
            onClick={() => fetcher.submit({ ...v, ...avgiftsFalt, intent: "save" }, { method: "POST" })}
          >
            {T.settings.save}
          </Button>
          {fetcher.data?.ok ? (
            <Banner tone="success">{(fetcher.data as { message?: string }).message ?? T.settings.saved}</Banner>
          ) : null}
        </Layout.Section>
      </Layout>
    </Page>
  );
}

/** Ett kopplat annonskonto: namn, valuta, kampanjfilter och "ta bort". */
type KopplatKonto = {
  accountId: string;
  name: string;
  currency: string;
  saknasIListan: boolean;
  campaignMode: string;
  campaignIds: string[];
  campaignMarkets: Record<string, string>;
};

/**
 * Ett konto i listan. Kampanjfiltret bor här för att kampanj-ID:n är
 * kontospecifika — varje konto måste kunna kryssas för sig, annars hade ett
 * filter satt på konto A tystat hela konto B.
 */
function KontoRad({
  konto,
  butiksValuta,
  lang,
  kanTaBort,
  marknader,
}: {
  konto: KopplatKonto;
  butiksValuta: string;
  lang: Lang;
  kanTaBort: boolean;
  /** Kända marknader (landskoder) att välja bland per kampanj. */
  marknader: string[];
}) {
  const T = t(lang);
  const kampanjFetcher = useFetcher<typeof action>();
  const sparaFetcher = useFetcher<typeof action>();
  const taBortFetcher = useFetcher<typeof action>();
  const [oppen, setOppen] = useState(false);
  const [lage, setLage] = useState<string>(konto.campaignMode);
  const [valda, setValda] = useState<string[]>(konto.campaignIds);
  /* Marknad per kampanj. Listan kan utökas med en landskod som inte sålt än
     ("JP" innan första japanska ordern) — annars går kampanjen inte att märka
     förrän det finns data, och då är det för sent att ha delat kostnaden. */
  const [marknadPer, setMarknadPer] = useState<Record<string, string>>(konto.campaignMarkets);
  const [nyMarknad, setNyMarknad] = useState("");
  const [extraMarknader, setExtraMarknader] = useState<string[]>([]);
  const allaMarknader = sorteraMarknader([...marknader, ...extraMarknader, ...Object.values(marknadPer)]);
  const marknadsval = [
    { label: T.settings.campaigns.marketNone, value: "" },
    ...allaMarknader.map((m) => ({ label: `${marknadsnamn(m, lang, m)} (${m})`, value: m })),
  ];
  const laggTillMarknad = () => {
    const kod = marknadskod(nyMarknad);
    if (!kod) return;
    setExtraMarknader((x) => [...x, kod]);
    setNyMarknad("");
  };
  const antalMarkta = Object.values(marknadPer).filter(Boolean).length;

  const svar = kampanjFetcher.data as unknown as { ok?: boolean; kampanjer?: Kampanj[] } | undefined;
  const kampanjer = svar?.kampanjer ?? [];
  const laddar = kampanjFetcher.state !== "idle";
  const fel = !laddar && Boolean(svar) && !svar?.ok;
  /* En sparad kampanj som inte längre finns i listan (arkiverad, borttagen)
     visas ändå — annars går valet inte att ångra utan att byta läge. */
  const rader: Kampanj[] = svar?.ok
    ? [
        ...kampanjer,
        ...valda
          .filter((id) => !kampanjer.some((k) => k.id === id))
          .map((id) => ({ id, name: id, status: "", spend30: 0 })),
      ]
    : kampanjer;
  /* Spenden är i ANNONSKONTOTS valuta, aldrig butikens — den måste skrivas ut
     med sin valuta, annars läser man 5 000 som kronor när det är dollar. */
  const nf = new Intl.NumberFormat(localeOf(lang), { maximumFractionDigits: 0 });
  const sammanfattning =
    konto.campaignMode === "include"
      ? T.settings.campaigns.summaryInclude(konto.campaignIds.length)
      : konto.campaignMode === "exclude"
        ? T.settings.campaigns.summaryExclude(konto.campaignIds.length)
        : T.settings.campaigns.summaryAll;

  const hamta = () =>
    kampanjFetcher.submit({ intent: "meta-campaigns", accountId: konto.accountId }, { method: "POST" });
  const vaxla = () => {
    const oppnas = !oppen;
    setOppen(oppnas);
    if (oppnas && !svar && kampanjFetcher.state === "idle") hamta();
  };
  const spara = () =>
    sparaFetcher.submit(
      {
        intent: "meta-campaigns-save",
        accountId: konto.accountId,
        campaignMode: lage,
        campaignIds: lage === "all" ? "" : valda.join(","),
        campaignMarkets: JSON.stringify(marknadPer),
      },
      { method: "POST" },
    );
  const valSaknas = lage === "include" && valda.length === 0;

  return (
    <Card>
      <BlockStack gap="200">
        <InlineStack gap="300" blockAlign="center" align="space-between" wrap>
          <BlockStack gap="050">
            <Text as="p" variant="bodyMd" fontWeight="semibold">{konto.name}</Text>
            <Text as="p" variant="bodySm" tone="subdued">
              {[konto.currency, konto.accountId].filter(Boolean).join(" · ")}
            </Text>
          </BlockStack>
          {kanTaBort ? (
            <Button
              variant="plain"
              tone="critical"
              loading={taBortFetcher.state !== "idle"}
              onClick={() =>
                taBortFetcher.submit(
                  { intent: "meta-account-remove", accountId: konto.accountId },
                  { method: "POST" },
                )
              }
            >
              {T.settings.removeAccount}
            </Button>
          ) : null}
        </InlineStack>

        {konto.saknasIListan ? (
          <Text as="p" variant="bodySm" tone="caution">
            {T.settings.accountNotInList(konto.accountId)}
          </Text>
        ) : null}
        {konto.currency && konto.currency !== butiksValuta ? (
          <Text as="p" variant="bodySm" tone="subdued">
            {T.dashboard.convertedNote(konto.currency, butiksValuta)}
          </Text>
        ) : null}

        {/* Vilka kampanjer i kontot som räknas. Standard är alla — en befintlig
            butik ska aldrig se sin annonskostnad ändras för att funktionen kom
            till. */}
        <InlineStack gap="300" blockAlign="center" wrap>
          <Text as="span" variant="bodySm">
            {sammanfattning}
            {antalMarkta ? ` · ${T.settings.campaigns.marketsSummary(antalMarkta)}` : ""}
          </Text>
          <Button variant="plain" disclosure={oppen ? "up" : "down"} onClick={vaxla}>
            {oppen ? T.settings.campaigns.close : T.settings.campaigns.open}
          </Button>
        </InlineStack>

        <Collapsible open={oppen} id={`meta-kampanjer-${konto.accountId}`}>
          <BlockStack gap="300">
            <Text as="p" variant="bodySm" tone="subdued">{T.settings.campaigns.body}</Text>
            <ChoiceList
              title={T.settings.campaigns.modeLabel}
              choices={[
                { label: T.settings.campaigns.all, value: "all" },
                { label: T.settings.campaigns.include, value: "include" },
                { label: T.settings.campaigns.exclude, value: "exclude" },
              ]}
              selected={[lage]}
              onChange={(val) => setLage(val[0] ?? "all")}
            />
            {fel ? (
              <Banner tone="warning" action={{ content: T.settings.tryAgain, onAction: hamta }}>
                {T.settings.campaigns.failed}
              </Banner>
            ) : null}
            {/* Marknad per kampanj: vilket land kampanjen annonserar mot. Med
                märkningen delas kontots kostnad per land, och panelen kan visa
                "bara Norge". Visas alltid — även i läget "alla kampanjer". */}
            <BlockStack gap="100">
              <Text as="h4" variant="headingSm">{T.settings.campaigns.marketTitle}</Text>
              <Text as="p" variant="bodySm" tone="subdued">{T.settings.campaigns.marketBody}</Text>
              <InlineStack gap="200" blockAlign="end" wrap>
                <div style={{ width: 200 }}>
                  <TextField
                    label={T.settings.campaigns.marketAddLabel}
                    value={nyMarknad}
                    onChange={setNyMarknad}
                    autoComplete="off"
                    placeholder="JP"
                    maxLength={2}
                  />
                </div>
                <Button disabled={!marknadskod(nyMarknad)} onClick={laggTillMarknad}>
                  {T.settings.campaigns.marketAdd}
                </Button>
              </InlineStack>
            </BlockStack>
            {laddar ? (
              <Text as="p" tone="subdued">{T.settings.campaigns.loading}</Text>
            ) : rader.length ? (
              <BlockStack gap="200">
                {lage === "all" ? null : (
                  <InlineStack gap="300">
                    <Button variant="plain" onClick={() => setValda(rader.map((k) => k.id))}>
                      {T.settings.campaigns.selectAll}
                    </Button>
                    <Button variant="plain" onClick={() => setValda([])}>
                      {T.settings.campaigns.selectNone}
                    </Button>
                  </InlineStack>
                )}
                {rader.map((k) => (
                  <InlineStack key={k.id} gap="300" blockAlign="center" wrap>
                    <div style={{ flex: "1 1 260px", minWidth: 220 }}>
                      {lage === "all" ? (
                        <BlockStack gap="050">
                          <Text as="span" variant="bodyMd">{k.name}</Text>
                          <Text as="span" variant="bodySm" tone="subdued">
                            {(k.spend30 > 0
                              ? T.settings.campaigns.spend30(nf.format(k.spend30), konto.currency)
                              : T.settings.campaigns.noSpend) +
                              (k.status && k.status !== "ACTIVE" ? ` · ${k.status}` : "")}
                          </Text>
                        </BlockStack>
                      ) : (
                        <Checkbox
                          label={k.name}
                          checked={valda.includes(k.id)}
                          onChange={(kryssad) =>
                            setValda((v) => (kryssad ? [...v, k.id] : v.filter((x) => x !== k.id)))
                          }
                          helpText={
                            (k.spend30 > 0
                              ? T.settings.campaigns.spend30(nf.format(k.spend30), konto.currency)
                              : T.settings.campaigns.noSpend) +
                            (k.status && k.status !== "ACTIVE" ? ` · ${k.status}` : "")
                          }
                        />
                      )}
                    </div>
                    <div style={{ width: 210 }}>
                      <Select
                        label={T.settings.campaigns.marketLabel}
                        labelHidden
                        options={marknadsval}
                        value={marknadPer[k.id] ?? ""}
                        onChange={(v) =>
                          setMarknadPer((m) => {
                            const ny = { ...m };
                            if (v) ny[k.id] = v;
                            else delete ny[k.id];
                            return ny;
                          })
                        }
                      />
                    </div>
                  </InlineStack>
                ))}
              </BlockStack>
            ) : fel ? null : (
              <Text as="p" tone="subdued">{T.settings.campaigns.empty}</Text>
            )}
            <InlineStack gap="300" blockAlign="center" wrap>
              <Button
                variant="primary"
                loading={sparaFetcher.state !== "idle"}
                disabled={valSaknas}
                onClick={spara}
              >
                {T.settings.campaigns.save}
              </Button>
              {valSaknas ? (
                <Text as="span" variant="bodySm" tone="subdued">
                  {T.settings.campaigns.pickOne}
                </Text>
              ) : null}
              {sparaFetcher.data && sparaFetcher.state === "idle" ? (
                <Text as="span" variant="bodySm" tone="success">
                  {(sparaFetcher.data as { message?: string }).message}
                </Text>
              ) : null}
            </InlineStack>
          </BlockStack>
        </Collapsible>
      </BlockStack>
    </Card>
  );
}

/**
 * Google Ads-kortet.
 *
 * Samma flöde som Meta: en knapp öppnar Googles dialog i ett eget fönster
 * (Google renderar inte sin inloggning i en iframe, och appen bor i en),
 * fönstret säger till med postMessage när det är klart, och sidan laddar om
 * sig själv. Finns bara ett Google Ads-konto är handlaren klar där — annars
 * väljer hen i listan nedan.
 */
function GoogleKort({
  google,
  T,
}: {
  google: {
    uppsatt: boolean;
    saknas: string[];
    tjanst: string;
    kopplat: boolean;
    epost: string | null;
    valda: { customerId: string; name: string; currency: string | null }[];
    valbara: { customerId: string; name: string; currency: string; timezone: string }[];
    fel: boolean;
  };
  T: ReturnType<typeof t>;
}) {
  const fetcher = useFetcher<{ ok: boolean; message?: string; url?: string }>();
  const revalidator = useRevalidator();
  const popup = useRef<Window | null>(null);
  const [popupBlocked, setPopupBlocked] = useState(false);
  const [loginUrl, setLoginUrl] = useState<string | null>(null);
  const [valt, setValt] = useState("");
  const hanterat = useRef<unknown>(null);

  /* Fönstret öppnas i samma klick som knappen trycks — öppnas det först när
     serverns svar kommit räknas det som en popup utan användarhandling och
     blockeras av webbläsaren. */
  const starta = () => {
    setPopupBlocked(false);
    setLoginUrl(null);
    const w = window.open("", "google-login", "popup,width=640,height=760");
    if (w) {
      popup.current = w;
      try {
        w.document.write(`<p style="font-family:system-ui;padding:24px">${T.settings.loginOpening}</p>`);
      } catch {
        /* kosmetiskt */
      }
    } else {
      popup.current = null;
      setPopupBlocked(true); // länken visas när adressen kommit
    }
    fetcher.submit({ intent: "google-login-url" }, { method: "POST" });
  };

  useEffect(() => {
    if (!fetcher.data || fetcher.data === hanterat.current) return;
    hanterat.current = fetcher.data;
    const data = fetcher.data;
    if (!data.url) return;
    const w = popup.current;
    if (!data.ok) {
      w?.close();
      popup.current = null;
      return;
    }
    /* about:blank saknar bas-URL — adressen måste vara absolut. */
    const abs = new URL(data.url, window.location.origin).href;
    if (w && !w.closed) w.location.href = abs;
    else setLoginUrl(abs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher.state, fetcher.data]);

  /* Fönstret säger till när det är klart. Origin-kontrollen är inte
     kosmetisk: utan den kan vilken sida som helst posta "klart" hit. */
  useEffect(() => {
    const lyssna = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      const m = e.data as { type?: string; ok?: boolean } | null;
      if (!m || typeof m !== "object" || m.type !== "google-login") return;
      if (m.ok) revalidator.revalidate();
    };
    window.addEventListener("message", lyssna);
    return () => window.removeEventListener("message", lyssna);
  }, [revalidator]);

  const valdaId = new Set(google.valda.map((k) => k.customerId));
  const kvar = google.valbara.filter((k) => !valdaId.has(k.customerId));
  const laddar = fetcher.state !== "idle";

  return (
    <Card>
      <BlockStack gap="300">
        <Text as="h2" variant="headingMd">{T.settings.googleTitle}</Text>
        <Text as="p" tone="subdued">{T.settings.googleIntro}</Text>

        {!google.uppsatt ? (
          <Banner tone="info">
            {`${T.settings.googleNotConfigured}${google.tjanst ? ` — ${T.settings.googleService(google.tjanst)}` : ""}${google.saknas.length ? ` (${google.saknas.join(", ")})` : ""}`}
          </Banner>
        ) : (
          <BlockStack gap="400">
            <InlineStack gap="300" blockAlign="center" wrap>
              {google.kopplat ? (
                <Text as="p" fontWeight="semibold">
                  {google.epost
                    ? T.settings.googleConnectedAs(google.epost)
                    : T.settings.googleConnectedNoEmail}
                </Text>
              ) : null}
              <Button variant={google.kopplat ? undefined : "primary"} loading={laddar} onClick={starta}>
                {google.kopplat ? T.settings.googleReconnect : T.settings.googleConnect}
              </Button>
              {google.kopplat ? (
                <Button
                  tone="critical"
                  loading={laddar}
                  onClick={() => fetcher.submit({ intent: "google-disconnect" }, { method: "POST" })}
                >
                  {T.settings.googleDisconnect}
                </Button>
              ) : null}
            </InlineStack>

            {/* Popup stoppad av webbläsaren: handlaren klickar länken själv. */}
            {popupBlocked && loginUrl ? (
              <Text as="p">
                <a href={loginUrl} target="google-login" rel="noreferrer">
                  {T.settings.googleConnect}
                </a>
              </Text>
            ) : null}

            {google.fel ? <Banner tone="critical">{T.settings.googleListFailed}</Banner> : null}

            {google.valda.length ? (
              <BlockStack gap="200">
                {google.valda.map((k) => (
                  <InlineStack key={k.customerId} gap="300" blockAlign="center" wrap>
                    <Text as="p">{`${k.name}${k.currency ? ` · ${k.currency}` : ""}`}</Text>
                    <Button
                      tone="critical"
                      variant="plain"
                      loading={laddar}
                      onClick={() =>
                        fetcher.submit(
                          { intent: "google-account-remove", customerId: k.customerId, name: k.name },
                          { method: "POST" },
                        )
                      }
                    >
                      {T.settings.googleRemove}
                    </Button>
                  </InlineStack>
                ))}
                <Text as="p" variant="bodySm" tone="subdued">{T.settings.googleMarketNote}</Text>
              </BlockStack>
            ) : null}

            {google.kopplat && !google.fel ? (
              kvar.length ? (
                <InlineStack gap="300" blockAlign="end" wrap>
                  <Select
                    label={T.settings.googlePickAccount}
                    options={kvar.map((k) => ({
                      label: `${k.name}${k.currency ? ` · ${k.currency}` : ""}`,
                      value: k.customerId,
                    }))}
                    placeholder={T.settings.googlePickAccount}
                    value={valt}
                    onChange={setValt}
                    helpText={T.settings.googlePickHelp}
                  />
                  <Button
                    disabled={!valt}
                    loading={laddar}
                    onClick={() => {
                      const k = kvar.find((x) => x.customerId === valt);
                      if (!k) return;
                      fetcher.submit(
                        {
                          intent: "google-account-add",
                          customerId: k.customerId,
                          name: k.name,
                          currency: k.currency,
                          timezone: k.timezone,
                        },
                        { method: "POST" },
                      );
                      setValt("");
                    }}
                  >
                    {T.settings.googleAdd}
                  </Button>
                </InlineStack>
              ) : google.valda.length ? null : (
                <Text as="p" tone="subdued">{T.settings.googleNoAccounts}</Text>
              )
            ) : null}
          </BlockStack>
        )}

        {fetcher.state === "idle" && fetcher.data?.message ? (
          <Banner tone={fetcher.data.ok ? "success" : "critical"}>{fetcher.data.message}</Banner>
        ) : null}
      </BlockStack>
    </Card>
  );
}
