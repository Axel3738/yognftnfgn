-- Kampanjfilter för annonskostnaden: flera butiker kan dela ETT annonskonto,
-- och då ska butiken kunna välja vilka kampanjer som räknas med.
-- "all" som default gör tillägget osynligt för befintliga butiker.
ALTER TABLE "ShopSettings" ADD COLUMN IF NOT EXISTS "campaignMode" TEXT NOT NULL DEFAULT 'all';
ALTER TABLE "ShopSettings" ADD COLUMN IF NOT EXISTS "campaignIds" TEXT;
