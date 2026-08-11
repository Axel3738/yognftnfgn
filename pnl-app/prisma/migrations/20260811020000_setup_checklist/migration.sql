-- Kom igång-checklistan behöver veta två saker som inte gick att härleda:
-- om inställningarna någonsin sparats, och om checklistan dolts.
ALTER TABLE "ShopSettings" ADD COLUMN IF NOT EXISTS "settingsSavedAt" TIMESTAMP(3);
ALTER TABLE "ShopSettings" ADD COLUMN IF NOT EXISTS "setupDismissedAt" TIMESTAMP(3);

-- Butiker som redan kopplat ett annonskonto har bevisligen varit inne och
-- sparat inställningarna. Backfilla dem så checklistan inte ber om något
-- som redan är gjort.
UPDATE "ShopSettings" SET "settingsSavedAt" = "updatedAt" WHERE "metaAdAccountId" IS NOT NULL;
