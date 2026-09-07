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
import { glomMetaFel } from "../lib/meta.server";
import { dagarKvar, kontoId, VARNA_DAGAR, type Annonskonto } from "../lib/meta-login";
import { asLang, t } from "../lib/texts";

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
      data: { metaAdAccountId: nyttKonto, ...(kontoBytt ? { spendCurrency: null } : {}) },
    });
    if (kontoBytt) await prisma.dailySpend.deleteMany({ where: { shop: session.shop } });
    return json({ ok: true, message: T.settings.accountSaved(String(f.get("name") ?? nyttKonto)) });
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
      // den gamla, annars jämförs butiken mot fel valuta.
      ...(kontoBytt ? { spendCurrency: null } : {}),
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

  /* ---- Logga in med Facebook ----
     Klick → fönstret öppnas SYNKRONT (annars stoppar webbläsaren det som en
     oönskad popup) → en action skapar engångslänken → fönstret skickas dit.
     Sedan pollas en billig statusrutt tills en ny token sparats (eller fem
     minuter gått). Fönstrets egna signaler (postMessage, "stängt") är bara
     genvägar: en Cross-Origin-Opener-Policy hos Facebook kan kapa bandet
     mellan fönstren, och då är databasen det enda som säkert vet. */
  const popup = useRef<Window | null>(null);
  const [popupBlocked, setPopupBlocked] = useState(false);
  const [loginUrl, setLoginUrl] = useState<string | null>(null);
  const [vantar, setVantar] = useState(false);
  const [loginBesked, setLoginBesked] = useState<string | null>(null);
  const snapshot = useRef<string | null>(d.metaTokenSavedAt);
  const statusFetcher = useFetcher<{ savedAt: string | null; source: string | null }>();
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
    if (loginFetcher.state !== "idle" || !loginFetcher.data) return;
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
     Stängs fönstret utan att något sparats (Facebook visade sin egen felsida
     och skickade aldrig tillbaka) sägs det efter nästa svar i stället för
     att sidan bara står tyst. */
  useEffect(() => {
    if (!vantar) return;
    const start = Date.now();
    let stangdesVid = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const fraga = () => {
      if (Date.now() - start > 5 * 60 * 1000) {
        setVantar(false);
        return;
      }
      if (popup.current?.closed && !stangdesVid) stangdesVid = Date.now();
      if (stangdesVid && Date.now() - stangdesVid > 6000) {
        setVantar(false);
        setLoginBesked(T.settings.loginNothingBack);
        return;
      }
      if (statusFetcher.state === "idle") statusFetcher.load("/app/meta-status");
      timer = setTimeout(fraga, 2500);
    };
    timer = setTimeout(fraga, 2500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vantar]);

  const klar = () => {
    setVantar(false);
    setLoginUrl(null);
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
     kopia måste följa med, annars sparar nästa Spara ett gammalt konto-ID. */
  useEffect(() => {
    setV((s) => ({ ...s, metaAdAccountId: d.metaAdAccountId, metaAccessToken: "" }));
  }, [d.metaAdAccountId, d.hasMetaToken, d.metaTokenSource, d.metaTokenSavedAt]);

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
                  {popupBlocked ? (
                    <Banner tone="warning">
                      <BlockStack gap="200">
                        <Text as="p">{T.settings.loginPopupBlocked}</Text>
                        {loginUrl ? (
                          <div>
                            <Button url={loginUrl} target="_blank" variant="primary">
                              {T.settings.loginOpenLink}
                            </Button>
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
                <Banner tone="critical" title={T.settings.expiredTitle}>
                  {T.settings.expiredBody}
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
