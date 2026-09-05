-- Kostnad per antal i samma orderrad (flerpack). Leverantören tar mindre
-- per styck när två eller tre skickas ihop — frakten delas. Antal 1 ligger
-- kvar i Shopifys unitCost; här ligger bara stegen därefter.
CREATE TABLE IF NOT EXISTS "CostTier" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "variantGid" TEXT NOT NULL,
    "units" INTEGER NOT NULL,
    "totalCost" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CostTier_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "CostTier_shop_variantGid_units_key" ON "CostTier"("shop", "variantGid", "units");
CREATE INDEX IF NOT EXISTS "CostTier_shop_idx" ON "CostTier"("shop");
