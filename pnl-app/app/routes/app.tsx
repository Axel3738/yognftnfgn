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
     sköter debitering, kvitton och avslut. */
  if (billingEnabled && !billingExemptShops.has(session.shop.toLowerCase())) {
    await billing.require({
      plans: [STANDARD_PLAN],
      onFailure: () => billing.request({ plan: STANDARD_PLAN }),
    });
  }

  // Språket styr nav-menyns etiketter — upsert så att raden alltid finns.
  const settings = await prisma.shopSettings.upsert({
    where: { shop: session.shop },
    create: { shop: session.shop },
    update: {},
  });

  return json({ apiKey: process.env.SHOPIFY_API_KEY || "", lang: asLang(settings.language) });
}

export default function App() {
  const { apiKey, lang } = useLoaderData<typeof loader>();
  const T = t(lang);
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
