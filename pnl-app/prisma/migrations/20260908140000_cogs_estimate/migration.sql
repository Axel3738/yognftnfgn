-- Uppskattad COGS (% av pris) för varianter utan inköpspris. Nullbart tillägg.
ALTER TABLE "ShopSettings" ADD COLUMN IF NOT EXISTS "cogsEstimatePct" INTEGER;
