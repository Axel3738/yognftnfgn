/**
 * Steg 2 av Logga in med Facebook: Meta skickar tillbaka fönstret hit med en
 * kod (eller ett fel). Koden byts mot en long-lived token som sparas
 * krypterat på butiken. Har butiken redan ett annonskonto behålls det (om
 * den nya inloggningen ser det); finns exakt ett konto att välja på väljs
 * det direkt — då är handlaren klar utan att röra Settings.
 *
 * Resursrutt utan Shopify-auth. Engångsraden förbrukas oavsett utfall, och
 * cookien måste matcha — ett svar från Meta utan båda går ingenstans.
 */

import type { LoaderFunctionArgs } from "@remix-run/node";
import prisma from "../db.server";
import {
  aterkallaToken,
  bestamUtgang,
  bytKodMotToken,
  forbrukaInloggning,
  hamtaAnvandare,
  harAdsRead,
  lasNonceCookie,
  listaAnnonskonton,
  metaLoginConfig,
  MetaLoginError,
  sparaInloggadToken,
  tomNonceCookie,
} from "../lib/meta-login.server";
import { hamtaKonton } from "../lib/meta-konton.server";
import { GRANSKNING, granskningsResultat } from "../lib/meta-granska.server";
import { metaLoginSida, type LoginSignal } from "../lib/meta-login-sida.server";
import { asLang, t } from "../lib/texts";

export async function loader({ request }: LoaderFunctionArgs) {
  const cfg = metaLoginConfig();
  const url = new URL(request.url);
  const state = url.searchParams.get("state") ?? "";
  const headers = { "Set-Cookie": tomNonceCookie() };

  const rad = state ? await prisma.metaLoginState.findUnique({ where: { state } }) : null;
  const inst = rad ? await prisma.shopSettings.findUnique({ where: { shop: rad.shop } }) : null;
  const lang = asLang(inst?.language);
  const T = t(lang);
  const fel = (body: string, status = 400, signal?: LoginSignal) =>
    metaLoginSida(lang, { title: T.metaLogin.errorTitle, body, status, headers, signal });

  if (!cfg) return fel(T.metaLogin.notConfigured, 404);

  const utfall = await forbrukaInloggning(state, lasNonceCookie(request));
  if (!utfall.ok) {
    return fel(utfall.skal === "fel-webblasare" ? T.metaLogin.wrongBrowser : T.metaLogin.expired);
  }
  const shop = utfall.shop;
  const butik = shop.replace(/\.myshopify\.com$/, "");

  /* Handlaren avbröt, eller Meta nekade (t.ex. appen saknar behörigheten).
     Signalen gör att Settings kan säga "avbrutet — inget ändrades" och
     fönstret stänger sig självt. */
  if (url.searchParams.get("error")) {
    const reason = url.searchParams.get("error_reason") ?? "";
    const desc = url.searchParams.get("error_description") ?? url.searchParams.get("error") ?? "";
    return reason === "user_denied"
      ? fel(T.metaLogin.cancelled, 200, { ok: false, reason: "cancelled" })
      : fel(T.metaLogin.metaFailed(desc.slice(0, 200)), 200, { ok: false, reason: "meta-failed" });
  }

  /* Ingen kod och inget fel: dialogen svarade med token i fragmentet i
     stället för en kod — en felkonfigurerad Facebook Login for Business-
     konfiguration (svarstyp måste vara kod). Namnge orsaken. */
  const code = url.searchParams.get("code");
  if (!code) return fel(T.metaLogin.noCode, 400, { ok: false, reason: "meta-failed" });

  /* Metas granskare, inte en handlare: visa vad ads_read ger och släng
     nyckeln. Ingen butik rörs — raden hör inte till någon. */
  if (utfall.syfte === GRANSKNING) {
    try {
      const bytt = await bytKodMotToken(cfg, code);
      const [anvandare, konton] = await Promise.all([
        hamtaAnvandare(bytt.token).catch(() => ({ id: null, name: null })),
        listaAnnonskonton(bytt.token).catch(() => []),
      ]);
      /* Återkalla först, svara sedan: granskaren ska inte lämna en levande
         nyckel efter sig, och sidan påstår att den är borta. */
      await aterkallaToken(bytt.token).catch(() => false);
      return granskningsResultat(konton, anvandare.name);
    } catch (e) {
      console.error("Granskningsinloggningen misslyckades:", (e as Error).message);
      const reason = e instanceof MetaLoginError ? e.message : "network error";
      return fel(T.metaLogin.metaFailed(reason.slice(0, 200)), 502);
    }
  }

  try {
    const bytt = await bytKodMotToken(cfg, code);
    const token = bytt.token;

    /* Dialogen låter användaren bocka ur "Annonser". Då kommer en token utan
       ads_read tillbaka — sparas den ser Settings ut som kopplad medan varje
       anrop misslyckas. Spara ingenting; be om en ny inloggning. */
    if (!(await harAdsRead(token))) {
      return fel(T.metaLogin.declined, 200, { ok: false, reason: "declined" });
    }

    /* Butiken kan ha flera annonskonton kopplade. Alla räknas som "sparade" —
       en ny inloggning som inte ser något av dem byter en fungerande koppling
       mot en trasig. */
    const sparade = (await hamtaKonton(shop)).map((k) => k.accountId);
    const sparat = sparade[0] ?? "";
    /* Med sparade konton är listan en SPÄRR, inte en bekvämlighet: går den
       inte att hämta kan vi inte veta att kopplingen förblir hel — då sparas
       inget (yttre catch → "försök igen"). Utan sparat konto är null ofarligt:
       token sparas och Settings visar textfältet. */
    const konton = sparade.length
      ? await listaAnnonskonton(token, inst?.currency)
      : await listaAnnonskonton(token, inst?.currency).catch(() => null);

    /* Ser den nya inloggningen INGET av butikens konton (kanske via en
       systemanvändar-token som såg mer än den här personen) ändras inget. Ser
       den några men inte alla sparas token ändå: de kvarvarande fortsätter
       fungera, och Settings visar de andra som osynliga för den här nyckeln. */
    if (sparade.length && konton && !konton.some((k) => sparade.includes(k.accountId))) {
      return fel(T.metaLogin.accountNotVisible(sparat), 200, { ok: false, reason: "account-not-visible" });
    }

    /* Inget konto valt och inga att välja på: att spara token vore att låsa
       fast butiken i "välj annonskonto" med en tom lista. */
    if (!sparade.length && konton && konton.length === 0) {
      return fel(T.metaLogin.noAccounts, 200, { ok: false, reason: "no-accounts" });
    }

    const [anvandare, expiresAt] = await Promise.all([hamtaAnvandare(token), bestamUtgang(cfg, token, bytt.expiresAt)]);
    /* Exakt ett konto att välja på: välj det. Handlaren är klar utan Settings. */
    const valjs = !sparade.length && konton && konton.length === 1 ? konton[0] : null;
    await sparaInloggadToken(shop, cfg, token, expiresAt, anvandare, valjs?.accountId);

    return metaLoginSida(lang, {
      title: T.metaLogin.doneTitle,
      body:
        valjs || sparat
          ? T.metaLogin.doneBodyAccount(anvandare.name, butik, valjs?.name ?? sparat)
          : T.metaLogin.doneBody(anvandare.name, butik),
      signal: { ok: true },
      headers,
    });
  } catch (e) {
    /* Felmeddelandet från Meta är läsbart och innehåller aldrig token.
       Andra fel (timeout, DB) blir ett generiskt "försök igen". */
    console.error(`Facebook-inloggning för ${shop} misslyckades:`, (e as Error).message);
    const reason = e instanceof MetaLoginError ? e.message : "network error";
    return fel(T.metaLogin.metaFailed(reason.slice(0, 200)), 502, { ok: false, reason: "meta-failed" });
  }
}
