/**
 * Steg 1 av Logga in med Facebook: fönstret öppnas hit med sitt engångs-
 * state, får en nonce-cookie och skickas vidare till Metas dialog.
 *
 * Resursrutt utan Shopify-auth: fönstret är top-level och har ingen session.
 * Raden i MetaLoginState (skapad från den inloggade Settings-sidan) är det
 * enda som säger vilken butik det gäller.
 */

import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import prisma from "../db.server";
import { metaLoginConfig, nonceCookie, oppnadFranAppen, startaInloggning } from "../lib/meta-login.server";
import { metaLoginSida } from "../lib/meta-login-sida.server";
import { asLang, t } from "../lib/texts";

export async function loader({ request }: LoaderFunctionArgs) {
  const cfg = metaLoginConfig();
  const url = new URL(request.url);
  const state = url.searchParams.get("state") ?? "";

  /* Språket följer butiken som startade — raden vet vilken. */
  const rad = state ? await prisma.metaLoginState.findUnique({ where: { state } }) : null;
  const inst = rad ? await prisma.shopSettings.findUnique({ where: { shop: rad.shop } }) : null;
  const lang = asLang(inst?.language);
  const T = t(lang);

  if (!cfg) {
    return metaLoginSida(lang, { title: T.metaLogin.errorTitle, body: T.metaLogin.notConfigured, status: 404 });
  }

  /* Fönstret öppnades från adressen Shopify laddade iframen från. Är den en
     annan än SHOPIFY_APP_URL (custom-domän, www, fel variabel) hamnar Metas
     svar på en host utan cookie — ett konfigurationsfel, inte handlarens.
     Säg det med båda adresserna i stället för "fel webbläsare".
     Jämför HOST, inte origin: bakom Railways TLS-terminering ser remix-serve
     (Express utan "trust proxy") anropet som http://, medan variabeln alltid
     är https:// — en origin-jämförelse hade fällt varje inloggning. */
  const appHost = new URL(process.env.SHOPIFY_APP_URL!).host;
  if (url.host !== appHost) {
    console.error(`/meta/start: appen serveras från ${url.host} men SHOPIFY_APP_URL är ${appHost}.`);
    return metaLoginSida(lang, {
      title: T.metaLogin.errorTitle,
      body: T.metaLogin.hostMismatch(url.host, appHost),
      status: 500,
    });
  }

  /* En länk som inte öppnats av appen själv (vidarebefordrad, klistrad i en
     annan flik) får inte starta flödet — se oppnadFranAppen. Raden lämnas
     orörd; den går ut av sig själv. Loggen säger vilken header som fällde
     avgörandet, så ett falskt nej går att känna igen. */
  if (!oppnadFranAppen(request)) {
    console.error(
      `/meta/start avvisad: sec-fetch-site=${request.headers.get("sec-fetch-site") ?? "(saknas)"}, ` +
        `referer-origin=${(() => { try { return new URL(request.headers.get("referer") ?? "").origin; } catch { return "(saknas)"; } })()}`,
    );
    return metaLoginSida(lang, { title: T.metaLogin.errorTitle, body: T.metaLogin.wrongBrowser, status: 403 });
  }

  const start = await startaInloggning(cfg, state);
  if (!start) {
    return metaLoginSida(lang, { title: T.metaLogin.errorTitle, body: T.metaLogin.expired, status: 400 });
  }

  return redirect(start.dialogUrl, {
    headers: { "Set-Cookie": nonceCookie(start.nonce), "Cache-Control": "no-store" },
  });
}
