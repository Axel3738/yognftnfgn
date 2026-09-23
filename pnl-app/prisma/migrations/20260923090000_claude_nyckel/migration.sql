-- Handlarens egen Claude-nyckel, krypterad i vila (samma väg som Meta-token).
-- Nullbara kolumner utan default: en befintlig rad påverkas inte, och en
-- deploy som rullas tillbaka lämnar inget trasigt efter sig.
ALTER TABLE "ShopSettings" ADD COLUMN IF NOT EXISTS "anthropicApiKey" TEXT;
ALTER TABLE "ShopSettings" ADD COLUMN IF NOT EXISTS "anthropicKeySavedAt" TIMESTAMP(3);
