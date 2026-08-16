-- Två anrop mot Shopify låg på varje sidladdnings kritiska väg: butikens
-- tidszon och hela produktkatalogen. Båda ändras sällan och cachas nu.
ALTER TABLE "ShopSettings" ADD COLUMN IF NOT EXISTS "timezone" TEXT;

CREATE TABLE IF NOT EXISTS "CatalogCache" (
    "shop"      TEXT NOT NULL,
    "payload"   JSONB NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CatalogCache_pkey" PRIMARY KEY ("shop")
);
