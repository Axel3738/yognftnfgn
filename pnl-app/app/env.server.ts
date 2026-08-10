/**
 * Kontrollerar miljön innan något annat laddas.
 *
 * Utan det här kraschar appen någonstans nere i Shopify- eller Prisma-biblioteket
 * med ett stackspår som inte säger vad som saknas. En deploy som går sönder ska
 * säga exakt vilken variabel som fattas och var den sätts.
 */

const REQUIRED = {
  SHOPIFY_API_KEY: "Client ID från Partners → din app → Inställningar",
  SHOPIFY_API_SECRET: "Client secret från samma sida",
  SHOPIFY_APP_URL: "Hostingens publika URL, t.ex. https://xxx.up.railway.app",
  DATABASE_URL: "Sätts automatiskt när en PostgreSQL-databas kopplas till tjänsten",
  SCOPES: "read_products,read_orders,read_inventory,read_reports,write_inventory",
} as const;

const missing = Object.entries(REQUIRED).filter(([key]) => !process.env[key]?.trim());

if (missing.length) {
  const lines = missing.map(([key, hint]) => `  ${key} — ${hint}`).join("\n");
  throw new Error(
    `\n\nAppen kan inte starta. Följande miljövariabler saknas:\n\n${lines}\n\n` +
      `Sätt dem under Variables på hostingen och deploya om.\n`,
  );
}

// SHOPIFY_APP_URL används för att bygga OAuth-callbacks. Ett avslutande snedstreck
// ger dubbla slash i redirect-URI:n, som då inte matchar den registrerade — och
// felet syns först vid installationen, långt från orsaken.
if (process.env.SHOPIFY_APP_URL!.endsWith("/")) {
  process.env.SHOPIFY_APP_URL = process.env.SHOPIFY_APP_URL!.replace(/\/+$/, "");
}

if (!/^https:\/\//.test(process.env.SHOPIFY_APP_URL!)) {
  throw new Error(
    `SHOPIFY_APP_URL måste börja med https:// — nu står det "${process.env.SHOPIFY_APP_URL}".`,
  );
}

export {};
