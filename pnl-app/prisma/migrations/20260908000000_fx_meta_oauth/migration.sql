-- Meta-knappen (OAuth) och växelkurs för annonskonton i annan valuta.

ALTER TABLE "ShopSettings" ADD COLUMN IF NOT EXISTS "metaAdAccountCurrency" TEXT;
ALTER TABLE "ShopSettings" ADD COLUMN IF NOT EXISTS "metaTokenExpiresAt" TIMESTAMP(3);
ALTER TABLE "ShopSettings" ADD COLUMN IF NOT EXISTS "metaConnectedVia" TEXT;
ALTER TABLE "ShopSettings" ADD COLUMN IF NOT EXISTS "metaAdAccounts" JSONB;

-- Butiker som redan har en inklistrad token har kopplat "för hand".
UPDATE "ShopSettings" SET "metaConnectedVia" = 'token'
  WHERE "metaAccessToken" IS NOT NULL AND "metaConnectedVia" IS NULL;

-- Spend sparas i annonskontots valuta. Gamla rader saknar valuta och tolkas
-- som butikens — de hämtas ändå om när kontot byts.
ALTER TABLE "DailySpend" ADD COLUMN IF NOT EXISTS "currency" TEXT;

CREATE TABLE IF NOT EXISTS "FxRate" (
  "id"        TEXT NOT NULL,
  "base"      TEXT NOT NULL,
  "quote"     TEXT NOT NULL,
  "day"       DATE NOT NULL,
  "rate"      DECIMAL(18,8) NOT NULL,
  "rateDay"   DATE NOT NULL,
  "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FxRate_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "FxRate_base_quote_day_key" ON "FxRate"("base", "quote", "day");
