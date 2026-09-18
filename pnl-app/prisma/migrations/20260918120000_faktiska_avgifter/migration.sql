-- Faktiska betalavgifter per dag, lästa ur ordertransaktionernas fees.
-- Axel: "jag vet ju inte avgifterna" — Shopify Payments tar olika för
-- utländska kort, valutaväxling och bank, och det enda som stämmer är vad
-- som faktiskt drogs. Null = okänt → procentsatsen i Inställningar gäller.
ALTER TABLE "DailyPnl" ADD COLUMN IF NOT EXISTS "fees" DOUBLE PRECISION;
