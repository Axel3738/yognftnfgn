import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { boundary } from "@shopify/shopify-app-remix/server";
import {
  authenticate,
  billingEnabled,
  billingExemptShops,
  STANDARD_PLAN,
} from "../shopify.server";
import prisma from "../db.server";
import { asLang, t } from "../lib/texts";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export async function loader({ request }: LoaderFunctionArgs) {
  const { billing, session } = await authenticate.admin(request);

  /* Betalvägg för App Store-versionen. Egna/undantagna butiker och
     custom-deployments (BILLING_ENABLED osatt) passerar fritt. Utan aktiv
     prenumeration skickas handlaren till Shopifys godkännandesida — Shopify
     sköter debitering, kvitton och avslut.

     Fel här måste fångas och visas i klartext. Redirects (Response) är det
     normala flödet och släpps igenom — men ett API-fel som får bubbla blir
     "Application Error" utan detaljer, och det var precis så här den första
     riktiga installationen dog utan att säga varför. */
  let billingError: string | null = null;
  if (billingEnabled && !billingExemptShops.has(session.shop.toLowerCase())) {
    try {
      await billing.require({
        plans: [STANDARD_PLAN],
        onFailure: () => billing.request({ plan: STANDARD_PLAN }),
      });
    } catch (e) {
      if (e instanceof Response) throw e; // redirect till godkännandesidan
      const body = (e as any)?.response?.body ?? (e as any)?.body;
      console.error(
        "Betalvägen misslyckades:",
        (e as Error)?.message,
        body ? JSON.stringify(body) : "(ingen svarskropp)",
      );
      billingError =
        ((e as Error)?.message ?? String(e)) +
        (body?.errors ? ` — ${JSON.stringify(body.errors)}` : "");
    }
  }

  // Språket styr nav-menyns etiketter — upsert så att raden alltid finns.
  const settings = await prisma.shopSettings.upsert({
    where: { shop: session.shop },
    create: { shop: session.shop },
    update: {},
  });

  return json({ apiKey: process.env.SHOPIFY_API_KEY || "", lang: asLang(settings.language), billingError });
}

export default function App() {
  const { apiKey, lang, billingError } = useLoaderData<typeof loader>();
  const T = t(lang);
  /* Ett fel i betalvägen ska synas som text, inte som en död vit sida.
     Panelen renderas inte förrän prenumerationsfrågan går att avgöra. */
  if (billingError) {
    return (
      <AppProvider isEmbeddedApp apiKey={apiKey}>
        <div style={{ padding: 24, fontFamily: "system-ui" }}>
          <h2>Subscription check failed</h2>
          <p style={{ fontFamily: "monospace", whiteSpace: "pre-wrap" }}>{billingError}</p>
          <p>Reload the page to retry. If this keeps happening, contact support with a screenshot of this message.</p>
        </div>
      </AppProvider>
    );
  }
  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <NavMenu>
        <Link to="/app" rel="home">{T.nav.profit}</Link>
        <Link to="/app/costs">{T.nav.costs}</Link>
        <Link to="/app/fixed">{T.nav.fixedCosts}</Link>
        <Link to="/app/butiker">{T.nav.stores}</Link>
        <Link to="/app/settings">{T.nav.settings}</Link>
      </NavMenu>
      <Outlet />
    </AppProvider>
  );
}

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (args) => boundary.headers(args);
