-- Butikens riktiga namn, för att gruppsummans tabell ska gå att läsa.
-- Nullbart tillägg: fylls i första gången butikens panel eller gruppsumman körs.
ALTER TABLE "ShopSettings" ADD COLUMN IF NOT EXISTS "shopName" TEXT;
