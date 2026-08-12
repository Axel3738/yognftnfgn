import "./env.server";   // validerar miljön innan något annat laddas
import "@shopify/shopify-app-remix/adapters/node";
import {
  AppDistribution,
  BillingInterval,
  LATEST_API_VERSION,
  shopifyApp,
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";

export const STANDARD_PLAN = "Standard";

/**
 * Butiker som aldrig debiteras: egna butiker och custom-installationerna.
 * Kommaseparerade .myshopify.com-domäner i BILLING_EXEMPT_SHOPS.
 */
export const billingExemptShops = new Set(
  (process.env.BILLING_EXEMPT_SHOPS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),
);

/** Betalning aktiveras per deployment: den publika App Store-tjänsten sätter
 *  BILLING_ENABLED=1; custom-tjänsterna (egna butiker) lämnar den osatt. */
export const billingEnabled = process.env.BILLING_ENABLED === "1";

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecretKey: process.env.SHOPIFY_API_SECRET!,
  apiVersion: LATEST_API_VERSION,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL!,
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.SingleMerchant,
  billing: {
    [STANDARD_PLAN]: {
      lineItems: [
        // ~100 SEK — App Store debiterar i USD.
        { amount: 9.99, currencyCode: "USD", interval: BillingInterval.Every30Days },
      ],
      trialDays: 7,
    },
  },
  future: { unstable_newEmbeddedAuthStrategy: true, removeRest: true },
  hooks: {
    /** Varje ny butik får sina inställningar direkt, med butikens egen valuta. */
    afterAuth: async ({ session, admin }) => {
      await shopify.registerWebhooks({ session });

      /* Valutan måste komma från butiken, inte från en default. En norsk butik
         med "SEK" efter varje siffra är inte ett skönhetsfel — den får dig att
         läsa NOK-belopp som kronor och räkna fel på marginalen. Slår det fel
         får installationen ändå gå igenom; valutan synkas om vid varje besök. */
      let currency: string | undefined;
      try {
        const res = await admin.graphql(`#graphql\n    { shop { currencyCode } }`);
        const body = await res.json();
        currency = body?.data?.shop?.currencyCode ?? undefined;
      } catch (e) {
        console.error("Kunde inte läsa butikens valuta vid installation:", e);
      }

      await prisma.shopSettings.upsert({
        where: { shop: session.shop },
        create: { shop: session.shop, ...(currency ? { currency } : {}) },
        update: currency ? { currency } : {},
      });
    },
  },
});

export default shopify;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
