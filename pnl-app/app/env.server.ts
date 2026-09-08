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
  // Måste vara identisk med den aktiva appversionen i Dev Dashboard (stonepnl-4).
  // read_all_orders läggs till först när Shopify godkänt ansökan.
  SCOPES: "read_products,read_orders,read_inventory,read_reports,write_inventory,read_customers",
} as const;

/* Valfria variabler (funktionen döljs utan dem, inget fel):
   ANTHROPIC_API_KEY — kortet "Låt AI läsa av din gamla app" på Kostnader
   (skärmbild/text → inköpspriser). Sätts på varje tjänst som ska ha kortet. */

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

/* Logga in med Facebook är valfritt (utan variablerna döljs knappen och
   token klistras in för hand som förut) — men en halv konfiguration är ett
   fel som annars syns först när en handlare klickar och får ett kryptiskt
   svar från Meta. Båda eller ingen. */
const metaId = process.env.META_APP_ID?.trim();
const metaSecret = process.env.META_APP_SECRET?.trim();
if (Boolean(metaId) !== Boolean(metaSecret)) {
  throw new Error(
    `\n\nMETA_APP_ID och META_APP_SECRET måste sättas tillsammans — nu är bara ` +
      `${metaId ? "META_APP_ID" : "META_APP_SECRET"} satt. Sätt båda (Meta for Developers → ` +
      `appen → Appinställningar → Grundläggande) eller ta bort båda.\n`,
  );
}

export {};
