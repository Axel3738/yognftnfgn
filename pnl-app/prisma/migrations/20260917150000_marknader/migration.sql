-- Marknader: en butik säljer till Sverige, Norge och USA samtidigt, med helt
-- olika fraktkostnad per land och egna annonskampanjer per land. Utan en
-- marknadsdimension räknas alla ordrar på samma inköpspris och all vinst i
-- en klump. Marknad = ISO-landskoden i orderns leveransadress; ingen ny
-- Shopify-scope behövs (read_orders bär adressen).
--
-- Allt är idempotent, och allt har defaulten "" = standard/alla marknader,
-- så befintliga butiker ser exakt samma siffror som förut tills de själva
-- lägger in en marknadsspecifik kostnad eller märker en kampanj.

-- Kostnad per marknad. "" = standard, gäller marknader utan egen post.
ALTER TABLE "CostChange" ADD COLUMN IF NOT EXISTS "market" TEXT NOT NULL DEFAULT '';

ALTER TABLE "CostTier" ADD COLUMN IF NOT EXISTS "market" TEXT NOT NULL DEFAULT '';
-- Unikheten måste rymma marknaden, annars kan Norge inte ha ett eget
-- tvåpackspris bredvid standardens. Gamla indexet bort FÖRST.
DROP INDEX IF EXISTS "CostTier_shop_variantGid_units_key";
CREATE UNIQUE INDEX IF NOT EXISTS "CostTier_shop_variantGid_units_market_key"
  ON "CostTier" ("shop", "variantGid", "units", "market");

-- Annonskostnad per marknad, via kampanjmärkningen i Inställningar.
ALTER TABLE "DailySpend" ADD COLUMN IF NOT EXISTS "market" TEXT NOT NULL DEFAULT '';
DROP INDEX IF EXISTS "DailySpend_shop_day_account_key";
CREATE UNIQUE INDEX IF NOT EXISTS "DailySpend_shop_day_account_market_key"
  ON "DailySpend" ("shop", "day", "account", "market");

-- Kampanj → marknad per annonskonto.
ALTER TABLE "MetaAdAccount" ADD COLUMN IF NOT EXISTS "campaignMarkets" JSONB;

-- Dagsradens uppdelning per marknad. Null = skriven före den här migrationen;
-- fylls i nästa gång dagen exporteras om.
ALTER TABLE "DailyPnl" ADD COLUMN IF NOT EXISTS "markets" JSONB;
