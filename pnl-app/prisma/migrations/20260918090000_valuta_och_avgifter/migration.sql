-- Valutan man skriver inköpspriser i (räknas om med ECB-kurs vid sparande),
-- och avgifter per marknad: Shopify Payments tar högre kortavgift för
-- utländska kort och en växlingsavgift när kunden betalar i en annan valuta.
-- På en butik som säljer till USA, Kanada, UK, Australien och Nya Zeeland
-- är det procent av omsättningen som annars räknades som vinst.
ALTER TABLE "ShopSettings" ADD COLUMN IF NOT EXISTS "costCurrency" TEXT;
ALTER TABLE "ShopSettings" ADD COLUMN IF NOT EXISTS "marketFees" JSONB;
