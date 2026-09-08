-- Vinstmål per 30 dagar för panelens hero-kort. Nullbart tillägg.
ALTER TABLE "ShopSettings" ADD COLUMN IF NOT EXISTS "monthlyGoal" DECIMAL(12,2);
