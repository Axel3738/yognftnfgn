/**
 * Steg 2 av Logga in med Google: Google skickar tillbaka fönstret hit med en
 * kod (eller ett fel). Koden byts mot en refresh-token som sparas krypterat
 * på butiken, och finns exakt ett Google Ads-konto väljs det direkt — då är
 * handlaren klar utan att röra Settings.
 *
 * Resursrutt utan Shopify-auth. Engångsraden förbrukas oavsett utfall, och
 * nonce-cookien måste matcha: ett svar från Google utan båda går ingenstans.
 */

import type { LoaderFunctionArgs } from "@remix-run/node";
import prisma from "../db.server";
import {
  bytKodMotToken,
  googleConfig,
  GoogleError,
  laggTillGoogleKonto,
  listaKonton,
  hamtaGoogleKonton,
  sparaKoppling,
} from "../lib/google-ads.server";
import { forbrukaInloggning, lasNonceCookie, tomNonceCookie } from "../lib/meta-login.server";
import { metaLoginSida, type LoginSignal } from "../lib/meta-login-sida.server";
import { asLang, t } from "../lib/texts";

export async function loader({ request }: LoaderFunctionArgs) {
  const cfg = googleConfig();
  const url = new URL(request.url);
  const state = url.searchParams.get("state") ?? "";
  const headers = { "Set-Cookie": tomNonceCookie("google") };

  const rad = state ? await prisma.metaLoginState.findUnique({ where: { state } }) : null;
  const inst = rad ? await prisma.shopSettings.findUnique({ where: { shop: rad.shop } }) : null;
  const lang = asLang(inst?.language);
  const T = t(lang);
  const fel = (body: string, status = 400, signal?: LoginSignal) =>
    metaLoginSida(lang, { title: T.metaLogin.errorTitle, body, status, headers, signal, signalType: "google-login" });

  if (!cfg) return fel(T.googleLogin.notConfigured, 404);

  const utfall = await forbrukaInloggning(state, lasNonceCookie(request), "google");
  if (!utfall.ok) {
    return fel(utfall.skal === "fel-webblasare" ? T.metaLogin.wrongBrowser : T.metaLogin.expired);
  }
  const shop = utfall.shop;
  const butik = shop.replace(/\.myshopify\.com$/, "");

  /* Handlaren avbröt i Googles dialog. Signalen gör att Settings kan säga
     "avbrutet — inget ändrades" och fönstret stänger sig självt. */
  const felkod = url.searchParams.get("error");
  if (felkod) {
    return felkod === "access_denied"
      ? fel(T.googleLogin.cancelled, 200, { ok: false, reason: "cancelled" })
      : fel(T.googleLogin.failed(felkod.slice(0, 200)), 200, { ok: false, reason: "google-failed" });
  }

  const code = url.searchParams.get("code");
  if (!code) return fel(T.googleLogin.noCode, 400, { ok: false, reason: "google-failed" });

  try {
    const bytt = await bytKodMotToken(cfg, code);

    /* Dialogen låter användaren bocka ur enskilda behörigheter. Utan
       adwords-scopet blir varje senare anrop nekat, och Settings hade sett
       kopplad ut medan annonskostnaden tyst stannat på noll. Kontolistan är
       därför spärren: går den inte att hämta sparas ingenting. */
    const konton = await listaKonton(cfg, bytt.accessToken);

    const sparade = await hamtaGoogleKonton(shop);
    if (!sparade.length && konton.length === 0) {
      return fel(T.googleLogin.noAccounts, 200, { ok: false, reason: "no-accounts" });
    }

    await sparaKoppling(shop, bytt.refreshToken, bytt.email);

    /* Exakt ett konto att välja på: välj det. Handlaren är klar utan Settings. */
    const valjs = !sparade.length && konton.length === 1 ? konton[0] : null;
    if (valjs) await laggTillGoogleKonto(shop, valjs);

    const valt = valjs?.name ?? sparade[0]?.name ?? sparade[0]?.customerId ?? null;
    return metaLoginSida(lang, {
      title: T.metaLogin.doneTitle,
      body: valt
        ? T.googleLogin.doneBodyAccount(bytt.email, butik, valt)
        : T.googleLogin.doneBody(bytt.email, butik),
      signal: { ok: true },
      signalType: "google-login",
      headers,
    });
  } catch (e) {
    /* Googles egna felmeddelanden är läsbara och innehåller aldrig token.
       Andra fel (timeout, DB) blir ett generiskt "försök igen". */
    console.error(`Google-inloggning för ${shop} misslyckades:`, (e as Error).message);
    const reason = e instanceof GoogleError ? e.message : "network error";
    return fel(T.googleLogin.failed(reason.slice(0, 200)), 502, { ok: false, reason: "google-failed" });
  }
}
