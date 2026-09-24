/**
 * Steg 1 av Logga in med Google: fönstret öppnas hit med sitt engångs-state,
 * får en nonce-cookie och skickas vidare till Googles samtyckesdialog.
 *
 * Spegelbild av `/meta/start` — samma spärrar, samma skäl. Resursrutt utan
 * Shopify-auth: fönstret är top-level och har ingen session, så raden i
 * MetaLoginState är det enda som säger vilken butik det gäller.
 */

import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import prisma from "../db.server";
import { dialogUrl, googleConfig } from "../lib/google-ads.server";
import { nonceCookie, oppnaRad, oppnadFranAppen } from "../lib/meta-login.server";
import { metaLoginSida } from "../lib/meta-login-sida.server";
import { asLang, t } from "../lib/texts";

export async function loader({ request }: LoaderFunctionArgs) {
  const cfg = googleConfig();
  const url = new URL(request.url);
  const state = url.searchParams.get("state") ?? "";

  /* Språket följer butiken som startade — raden vet vilken. */
  const rad = state ? await prisma.metaLoginState.findUnique({ where: { state } }) : null;
  const inst = rad ? await prisma.shopSettings.findUnique({ where: { shop: rad.shop } }) : null;
  const lang = asLang(inst?.language);
  const T = t(lang);

  if (!cfg) {
    return metaLoginSida(lang, { title: T.metaLogin.errorTitle, body: T.googleLogin.notConfigured, status: 404, signalType: "google-login" });
  }

  /* Jämför HOST, inte origin: bakom Railways TLS-terminering ser servern
     anropet som http:// medan variabeln alltid är https://. Stämmer inte
     värden hamnar Googles svar på en adress utan cookie — ett
     konfigurationsfel, inte handlarens. */
  const appHost = new URL(process.env.SHOPIFY_APP_URL!).host;
  if (url.host !== appHost) {
    console.error(`/google/start: appen serveras från ${url.host} men SHOPIFY_APP_URL är ${appHost}.`);
    return metaLoginSida(lang, {
      title: T.metaLogin.errorTitle,
      body: T.metaLogin.hostMismatch(url.host, appHost),
      status: 500,
      signalType: "google-login",
    });
  }

  /* En länk som inte öppnats av appen själv får inte starta flödet: annars
     kunde vem som helst med en butik skicka sin länk vidare och få NÅGON
     ANNANS Google Ads-konton kopplade till sin butik. */
  if (!oppnadFranAppen(request)) {
    console.error(
      `/google/start avvisad: sec-fetch-site=${request.headers.get("sec-fetch-site") ?? "(saknas)"}`,
    );
    return metaLoginSida(lang, { title: T.metaLogin.errorTitle, body: T.metaLogin.wrongBrowser, status: 403, signalType: "google-login" });
  }

  const oppnad = await oppnaRad(state, "google");
  if (!oppnad) {
    return metaLoginSida(lang, { title: T.metaLogin.errorTitle, body: T.metaLogin.expired, status: 400, signalType: "google-login" });
  }

  return redirect(dialogUrl(cfg, state), {
    headers: { "Set-Cookie": nonceCookie(oppnad.nonce, "google"), "Cache-Control": "no-store" },
  });
}
