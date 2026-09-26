-- Betalavgifter bara där de faktiskt finns.
--
-- Shopify skriver `fees` på transaktionerna bara för Shopify Payments. Förut
-- räknades hela dagens omsättning som "faktisk avgift" så fort fältet frågats
-- efter, så PayPal-, Klarna- och manuella ordrar fick avgift 0 i stället för
-- handlarens sats — och en butik utan Shopify Payments visade 0 överallt.
--
-- 1) feesCoveredSales: omsättningen i ordrar som gick genom Shopify Payments,
--    på dags-, timrader. Null = äldre rad, räknas som helt täckt (som förut)
--    tills returkollen eller panelen hämtar om dagen.
-- 2) gatewaySales: omsättning per betalväxel per dag, för listan i
--    Inställningar och avgiftsraden på panelen.
-- 3) thirdPartyFeeRate: Shopifys avgift på ordrar som inte betalats med
--    Shopify Payments. Default 0 — ingen butik får en ny kostnad utan att
--    handlaren skrivit in den.
-- Idempotent; sex Railway-tjänster kör migrate deploy var för sig.

ALTER TABLE "DailyPnl" ADD COLUMN IF NOT EXISTS "feesCoveredSales" DOUBLE PRECISION;
ALTER TABLE "DailyPnl" ADD COLUMN IF NOT EXISTS "gatewaySales" JSONB;
ALTER TABLE "HourlyPnl" ADD COLUMN IF NOT EXISTS "feesCoveredSales" DOUBLE PRECISION;

ALTER TABLE "ShopSettings" ADD COLUMN IF NOT EXISTS "thirdPartyFeeRate" DECIMAL(6,4) NOT NULL DEFAULT 0;
ALTER TABLE "ShopSettings" ALTER COLUMN "thirdPartyFeeRate" SET DEFAULT 0;
