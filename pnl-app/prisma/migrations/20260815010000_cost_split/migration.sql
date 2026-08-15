-- Inköpspriset delas i vara och frakt. Frakten är den större posten och den
-- enda som ändras vid flerpack, så den måste gå att följa för sig.
ALTER TABLE "CostChange" ADD COLUMN IF NOT EXISTS "productCost" DECIMAL(10,2);
ALTER TABLE "CostChange" ADD COLUMN IF NOT EXISTS "shippingCost" DECIMAL(10,2);
