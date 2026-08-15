-- Annonskontots valuta lagras så att en krock mot butikens valuta kan
-- upptäckas vid varje laddning, inte bara när Meta råkar anropas.
ALTER TABLE "ShopSettings" ADD COLUMN IF NOT EXISTS "spendCurrency" TEXT;
