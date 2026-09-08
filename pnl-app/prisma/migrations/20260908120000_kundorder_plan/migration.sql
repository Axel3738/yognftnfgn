-- Kundvärde (LTV) och planläsning under Shopify App Pricing.
-- Bara nullbara tillägg och IF NOT EXISTS: sex tjänster kör migrationen
-- samtidigt mot samma databas.

ALTER TABLE "ShopSettings" ADD COLUMN IF NOT EXISTS "plan" TEXT;
ALTER TABLE "ShopSettings" ADD COLUMN IF NOT EXISTS "planCheckedAt" TIMESTAMP(3);
ALTER TABLE "ShopSettings" ADD COLUMN IF NOT EXISTS "juicyCardDismissedAt" TIMESTAMP(3);
ALTER TABLE "ShopSettings" ADD COLUMN IF NOT EXISTS "ltvHorizon" INTEGER;
ALTER TABLE "ShopSettings" ADD COLUMN IF NOT EXISTS "kundOrderBackfillAt" TIMESTAMP(3);
ALTER TABLE "ShopSettings" ADD COLUMN IF NOT EXISTS "kundOrderBackfillError" TEXT;

-- En rad per order med pseudonymiserad kund (HMAC). Inga kundfält.
CREATE TABLE IF NOT EXISTS "KundOrder" (
  "shop"      TEXT NOT NULL,
  "orderId"   TEXT NOT NULL,
  "kundHash"  TEXT,
  "dag"       TEXT NOT NULL,
  "netto"     DOUBLE PRECISION NOT NULL,
  "tb"        DOUBLE PRECISION,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "KundOrder_pkey" PRIMARY KEY ("shop", "orderId")
);
CREATE INDEX IF NOT EXISTS "KundOrder_shop_kundHash_dag_idx" ON "KundOrder"("shop", "kundHash", "dag");
CREATE INDEX IF NOT EXISTS "KundOrder_shop_dag_idx" ON "KundOrder"("shop", "dag");
