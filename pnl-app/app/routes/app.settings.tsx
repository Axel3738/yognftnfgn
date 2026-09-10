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
import { dagarKvar, kontoId, VARNA_DAGAR, type Annonskonto } from "../lib/meta-login";
import { asLang, localeOf, t } from "../lib/texts";

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

  return json({
    lang: asLang(s.language),
    tariffPerOrder: Number(s.tariffPerOrder),
    feeRate: Number(s.feeRate),
    targetMargin: Number(s.targetMargin),
    metaAdAccountId: kontoId(s.metaAdAccountId),
    hasMetaToken: Boolean(s.metaAccessToken),
    metaLogin: metaLoginAvailable(),
    metaUserName: s.metaUserName,
    metaTokenSource: s.metaTokenSource,
    metaTokenDagar: dagarKvar(s.metaTokenExpiresAt),
    /* Snapshot för pollningen: ändras värdet efter klicket är inloggningen klar. */
    metaTokenSavedAt: s.metaTokenSavedAt?.toISOString() ?? null,
    /* Kampanjfiltret. Själva kampanjlistan hämtas först när handlaren öppnar
       kortet — Inställningar ska inte bli långsammare för alla andra. */
    campaignMode: s.campaignMode ?? "all",
    campaignIds: (s.campaignIds ?? "").split(",").map((x) => x.trim()).filter(Boolean),
    spendCurrency: s.spendCurrency,
    konton,
    kontoFel,
    krypteringPa: encryptionAvailable(),
    currency: s.currency,
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
    await prisma.dailySpend.deleteMany({ where: { shop: session.shop } });
    glomMetaFel(session.shop);
    if (token && aterkalla) await aterkallaToken(token);
    return json({ ok: true, message: T.settings.disconnected });
  }

  /* Kontovalet sparas i samma sekund det görs — Spara-knappen längst ner
     under två andra kort var ett steg som inte blev gjort. */
  if (intent === "meta-account") {
    const nyttKonto = kontoId(String(f.get("metaAdAccountId") ?? "")) || null;
    if (!nyttKonto) return json({ ok: false, message: T.settings.unknownError });
    const kontoBytt = kontoId(s?.metaAdAccountId) !== nyttKonto;
    await prisma.shopSettings.update({
      where: { shop: session.shop },
      data: {
        metaAdAccountId: nyttKonto,
        /* Nytt konto = nya kampanj-ID:n. Ett filter från det gamla kontot
           matchar ingenting här och skulle tysta hela annonskostnaden. */
        ...(kontoBytt ? { spendCurrency: null, campaignMode: "all", campaignIds: null } : {}),
      },
    });
    if (kontoBytt) await prisma.dailySpend.deleteMany({ where: { shop: session.shop } });
    /* Kontobyte: det gamla kontots backoff får inte ärvas — samma regel som Spara. */
    if (kontoBytt) glomMetaFel(session.shop);
    return json({ ok: true, message: T.settings.accountSaved(String(f.get("name") ?? nyttKonto)) });
  }

  /* Kampanjlistan: hämtas på klick, inte i loadern. Två Graph-anrop (namn +
     spend 30 dagar) ska inte ligga på varje sidladdning för alla som aldrig
     rör filtret. */
  if (intent === "meta-campaigns") {
    const token = s?.metaAccessToken ? decrypt(s.metaAccessToken) : null;
    const konto = kontoId(s?.metaAdAccountId);
    if (!token || !konto) return json({ ok: false, message: T.settings.campaigns.failed }, { status: 400 });
    try {
      return json({ ok: true, kampanjer: await listaKampanjer({ adAccountId: konto, accessToken: token }) });
    } catch (e) {
      console.error(`Kampanjlistan för ${session.shop} misslyckades:`, e);
      return json({ ok: false, message: T.settings.campaigns.failed }, { status: 500 });
    }
  }

  if (intent === "meta-campaigns-save") {
    const onskatLage = String(f.get("campaignMode") ?? "all");
    const valda = [
      ...new Set(String(f.get("campaignIds") ?? "").split(",").map((x) => x.trim()).filter(Boolean)),
    ];
    /* Utan kryssade kampanjer finns inget filter att tillämpa. "Bara valda"
       med noll val hade betytt noll annonskostnad — det är aldrig vad någon
       menar, och en tyst nolla är den dyraste lögnen panelen kan berätta. */
    const lage = (onskatLage === "include" || onskatLage === "exclude") && valda.length ? onskatLage : "all";
    const ids = lage === "all" ? null : valda.join(",");
    const bytt = (s?.campaignMode ?? "all") !== lage || (s?.campaignIds ?? null) !== ids;
    await prisma.shopSettings.update({
      where: { shop: session.shop },
      data: { campaignMode: lage, campaignIds: ids },
    });
    /* Cachade DailySpend-rader är räknade på det gamla filtret och är fel nu.
       De raderas och hämtas om per fönster nästa gång panelen öppnas — samma
       regel som vid kontobyte. */
    if (bytt) {
      await prisma.dailySpend.deleteMany({ where: { shop: session.shop } });
      glomMetaFel(session.shop);
    }
    return json({ ok: true, message: T.settings.campaigns.saved });
  }

  const dec = (k: string) => parseFloat(String(f.get(k) ?? "").replace(",", "."));
  const token = String(f.get("metaAccessToken") ?? "").trim();
  const nyttKonto = kontoId(String(f.get("metaAdAccountId") ?? "")) || null;
  /* Cachad annonskostnad hör till ett konto. Bara ett KONTOBYTE gör den
     ogiltig — en språkändring eller en ny token för samma konto ska inte
     kasta 90 dagars hämtade rader och tvinga fram en ny Meta-export. */
  const kontoBytt = kontoId(s?.metaAdAccountId) !== (nyttKonto ?? "");

  /* En inklistrad användartoken dör också efter 60 dagar — utan varning om
     vi inte frågar Meta när den går ut. Går bara att fråga om token kommer
     från samma Meta-app som servern känner; annars förblir utgången okänd. */
  const cfg = metaLoginConfig();
  const manuellUtgang = token && cfg ? await bestamUtgang(cfg, token, null) : null;

  await prisma.shopSettings.update({
    where: { shop: session.shop },
    data: {
      language: asLang(String(f.get("language") ?? "")),
      tariffPerOrder: dec("tariffPerOrder"),
      feeRate: dec("feeRate") / 100,
      targetMargin: dec("targetMargin") / 100,
      metaAdAccountId: nyttKonto,
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
      // Kvitterar kom igång-checklistans steg om tull och avgifter.
      settingsSavedAt: new Date(),
      // Nytt konto kan ha annan valuta — läs om den istället för att lita på
      // den gamla, annars jämförs butiken mot fel valuta. Kampanjfiltret
      // pekar på det gamla kontots kampanjer och nollställs av samma skäl.
      ...(kontoBytt ? { spendCurrency: null, campaignMode: "all", campaignIds: null } : {}),
    },
  });
  if (kontoBytt) {
    await prisma.dailySpend.deleteMany({ where: { shop: session.shop } });
  }
  if (token || kontoBytt) glomMetaFel(session.shop);
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
    targetMargin: String(Math.round(d.targetMargin * 100)),
    metaAdAccountId: d.metaAdAccountId,
    metaAccessToken: "",
  });
  const set = (k: keyof typeof v) => (val: string) => setV((s) => ({ ...s, [k]: val }));
  const T = t(d.lang);

  /* ---- Kampanjfiltret ----
     Flera butiker kan dela ETT annonskonto; utan filtret räknar var och en in
     de andras annonskostnad. Listan hämtas först när kortet öppnas — två
     Graph-anrop ska inte ligga på varje sidladdning för alla andra. */
  const kampanjFetcher = useFetcher<typeof action>();
  const kampanjSparaFetcher = useFetcher<typeof action>();
  const [kampanjOppen, setKampanjOppen] = useState(false);
  const [kampanjLage, setKampanjLage] = useState<string>(d.campaignMode);
  const [valdaKampanjer, setValdaKampanjer] = useState<string[]>(d.campaignIds);
  const kampanjSvar = kampanjFetcher.data as unknown as { ok?: boolean; kampanjer?: Kampanj[] } | undefined;
  const kampanjer = kampanjSvar?.kampanjer ?? [];
  const kampanjLaddar = kampanjFetcher.state !== "idle";
  const kampanjFel = !kampanjLaddar && Boolean(kampanjSvar) && !kampanjSvar?.ok;
  /* En sparad kampanj som inte längre finns i listan (arkiverad, borttagen)
     visas ändå — annars går valet inte att ångra utan att byta läge. */
  const kampanjRader: Kampanj[] = kampanjSvar?.ok
    ? [
        ...kampanjer,
        ...valdaKampanjer
          .filter((id) => !kampanjer.some((k) => k.id === id))
          .map((id) => ({ id, name: id, status: "", spend30: 0 })),
      ]
    : kampanjer;
  /* Spenden är i ANNONSKONTOTS valuta, aldrig butikens — den måste skrivas ut
     med sin valuta, annars läser man 5 000 som kronor när det är dollar. */
  const spendValuta =
    d.spendCurrency ?? d.konton?.find((k) => k.accountId === d.metaAdAccountId)?.currency ?? "";
  const kampanjNf = new Intl.NumberFormat(localeOf(d.lang), { maximumFractionDigits: 0 });
  const kampanjSammanfattning =
    d.campaignMode === "include"
      ? T.settings.campaigns.summaryInclude(d.campaignIds.length)
      : d.campaignMode === "exclude"
        ? T.settings.campaigns.summaryExclude(d.campaignIds.length)
        : T.settings.campaigns.summaryAll;
  const hamtaKampanjer = () => kampanjFetcher.submit({ intent: "meta-campaigns" }, { method: "POST" });
  const vaxlaKampanjer = () => {
    const oppnas = !kampanjOppen;
    setKampanjOppen(oppnas);
    if (oppnas && !kampanjSvar && kampanjFetcher.state === "idle") hamtaKampanjer();
  };
  const sparaKampanjval = () =>
    kampanjSparaFetcher.submit(
      {
        intent: "meta-campaigns-save",
        campaignMode: kampanjLage,
        campaignIds: kampanjLage === "all" ? "" : valdaKampanjer.join(","),
      },
      { method: "POST" },
    );
  const kampanjvalSaknas = kampanjLage === "include" && valdaKampanjer.length === 0;

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

  /* Loader-datan byts efter inloggning/bortkoppling — formulärets lokala
     kopia måste följa med, annars sparar nästa Spara ett gammalt konto-ID.
     Token-fältet töms bara när servern faktiskt sparat eller tagit bort en
     token — inte när kontovalet sparas, annars försvinner en inklistrad men
     osparad token under fingrarna på handlaren. */
  useEffect(() => {
    setV((s) => ({ ...s, metaAdAccountId: d.metaAdAccountId }));
  }, [d.metaAdAccountId]);
  useEffect(() => {
    setV((s) => ({ ...s, metaAccessToken: "" }));
  }, [d.metaTokenSavedAt, d.hasMetaToken]);

  const valjKonto = (id: string) => {
    set("metaAdAccountId")(id);
    const namn = d.konton?.find((k) => k.accountId === id)?.name ?? id;
    if (id) kontoFetcher.submit({ intent: "meta-account", metaAdAccountId: id, name: namn }, { method: "POST" });
  };

  const loginMisslyckades =
    loginFetcher.state === "idle" && loginFetcher.data && !(loginFetcher.data as { ok: boolean }).ok;

  const valdKontoIListan = d.konton?.some((k) => k.accountId === v.metaAdAccountId) ?? false;
  const kontoAlternativ = d.konton
    ? [
        ...(v.metaAdAccountId && !valdKontoIListan
          ? [{ label: T.settings.accountNotInList(v.metaAdAccountId), value: v.metaAdAccountId }]
          : []),
        ...d.konton.map((k) => ({
          label:
            `${k.name} · ${k.currency} · ${k.accountId}` +
            (k.status === 1 ? "" : ` (${T.settings.accountStatus(k.status)})`),
          value: k.accountId,
        })),
      ]
    : [];
  const visaLista = Boolean(d.konton && d.konton.length > 0);
  const valtKonto = d.konton?.find((k) => k.accountId === v.metaAdAccountId);
  const utgangen = (d.metaTokenDagar != null && d.metaTokenDagar < 0) || Boolean(d.kontoFel?.utgangen);
  const snartSlut = !utgangen && d.metaTokenDagar != null && d.metaTokenDagar <= VARNA_DAGAR;

  const kontoFalt = (
    <TextField
      label={T.settings.adAccountLabel}
      value={v.metaAdAccountId}
      onChange={set("metaAdAccountId")}
      autoComplete="off"
      helpText={T.settings.adAccountHelp}
    />
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
              <TextField
                label={T.settings.feeLabel}
                value={v.feeRate}
                onChange={set("feeRate")}
                autoComplete="off"
                helpText={T.settings.feeHelp}
              />
              <TextField
                label={T.settings.marginLabel}
                value={v.targetMargin}
                onChange={set("targetMargin")}
                autoComplete="off"
                helpText={T.settings.marginHelp}
              />
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

              {d.hasMetaToken && !d.metaAdAccountId && !utgangen ? (
                <Banner tone="warning">{T.settings.pickAccountReminder}</Banner>
              ) : null}

              {/* Kontovalet: lista när Meta gav en, annars skälet. Textfältet
                  för ID ligger i den manuella sektionen — ett ID skrivet för
                  hand fungerar ändå bara om token ser kontot. */}
              {visaLista ? (
                <BlockStack gap="100">
                  <Select
                    label={T.settings.accountSelectLabel}
                    options={kontoAlternativ}
                    placeholder={T.settings.accountSelectPlaceholder}
                    value={v.metaAdAccountId}
                    onChange={valjKonto}
                    helpText={T.settings.accountSelectHelp}
                  />
                  {kontoFetcher.data?.ok && kontoFetcher.state === "idle" ? (
                    <Text as="p" variant="bodySm" tone="success">
                      {(kontoFetcher.data as { message?: string }).message}
                    </Text>
                  ) : null}
                  {valtKonto && valtKonto.currency && valtKonto.currency !== d.currency ? (
                    <Text as="p" variant="bodySm" tone="subdued">
                      {T.dashboard.convertedNote(valtKonto.currency, d.currency)}
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

              {/* Vilka kampanjer i kontot som räknas. Standard är alla — en
                  befintlig butik ska aldrig se sin annonskostnad ändras för
                  att funktionen kom till. */}
              {d.hasMetaToken && d.metaAdAccountId ? (
                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm">{T.settings.campaigns.title}</Text>
                  <Text as="p" variant="bodySm" tone="subdued">{T.settings.campaigns.body}</Text>
                  <InlineStack gap="300" blockAlign="center" wrap>
                    <Text as="span" variant="bodySm">{kampanjSammanfattning}</Text>
                    <Button
                      variant="plain"
                      disclosure={kampanjOppen ? "up" : "down"}
                      onClick={vaxlaKampanjer}
                    >
                      {kampanjOppen ? T.settings.campaigns.close : T.settings.campaigns.open}
                    </Button>
                  </InlineStack>
                  <Collapsible open={kampanjOppen} id="meta-kampanjer">
                    <BlockStack gap="300">
                      <ChoiceList
                        title={T.settings.campaigns.modeLabel}
                        choices={[
                          { label: T.settings.campaigns.all, value: "all" },
                          { label: T.settings.campaigns.include, value: "include" },
                          { label: T.settings.campaigns.exclude, value: "exclude" },
                        ]}
                        selected={[kampanjLage]}
                        onChange={(val) => setKampanjLage(val[0] ?? "all")}
                      />
                      {kampanjFel ? (
                        <Banner
                          tone="warning"
                          action={{ content: T.settings.tryAgain, onAction: hamtaKampanjer }}
                        >
                          {T.settings.campaigns.failed}
                        </Banner>
                      ) : null}
                      {kampanjLage === "all" ? null : kampanjLaddar ? (
                        <Text as="p" tone="subdued">{T.settings.campaigns.loading}</Text>
                      ) : kampanjRader.length ? (
                        <BlockStack gap="150">
                          <InlineStack gap="300">
                            <Button variant="plain" onClick={() => setValdaKampanjer(kampanjRader.map((k) => k.id))}>
                              {T.settings.campaigns.selectAll}
                            </Button>
                            <Button variant="plain" onClick={() => setValdaKampanjer([])}>
                              {T.settings.campaigns.selectNone}
                            </Button>
                          </InlineStack>
                          {kampanjRader.map((k) => (
                            <Checkbox
                              key={k.id}
                              label={k.name}
                              checked={valdaKampanjer.includes(k.id)}
                              onChange={(kryssad) =>
                                setValdaKampanjer((v) =>
                                  kryssad ? [...v, k.id] : v.filter((x) => x !== k.id),
                                )
                              }
                              helpText={
                                (k.spend30 > 0
                                  ? T.settings.campaigns.spend30(kampanjNf.format(k.spend30), spendValuta)
                                  : T.settings.campaigns.noSpend) +
                                (k.status && k.status !== "ACTIVE" ? ` · ${k.status}` : "")
                              }
                            />
                          ))}
                        </BlockStack>
                      ) : kampanjFel ? null : (
                        <Text as="p" tone="subdued">{T.settings.campaigns.empty}</Text>
                      )}
                      <InlineStack gap="300" blockAlign="center" wrap>
                        <Button
                          variant="primary"
                          loading={kampanjSparaFetcher.state !== "idle"}
                          disabled={kampanjvalSaknas}
                          onClick={sparaKampanjval}
                        >
                          {T.settings.campaigns.save}
                        </Button>
                        {kampanjvalSaknas ? (
                          <Text as="span" variant="bodySm" tone="subdued">
                            {T.settings.campaigns.pickOne}
                          </Text>
                        ) : null}
                        {kampanjSparaFetcher.data && kampanjSparaFetcher.state === "idle" ? (
                          <Text as="span" variant="bodySm" tone="success">
                            {(kampanjSparaFetcher.data as { message?: string }).message}
                          </Text>
                        ) : null}
                      </InlineStack>
                    </BlockStack>
                  </Collapsible>
                </BlockStack>
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
                      setV((s) => ({ ...s, metaAdAccountId: "", metaAccessToken: "" }));
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

        <Layout.Section>
          <Button
            variant="primary"
            loading={fetcher.state !== "idle"}
            onClick={() => fetcher.submit({ ...v, intent: "save" }, { method: "POST" })}
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
