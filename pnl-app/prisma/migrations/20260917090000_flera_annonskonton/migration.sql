-- Flera annonskonton per butik. Axel (och många dropshippare) kör annonser
-- från två eller tre konton till SAMMA butik; med ett enda konto per butik
-- saknades resten av annonskostnaden och vinsten såg för hög ut.
--
-- Tre steg, alla idempotenta: tabellen, kolumnen på DailySpend, och en
-- bakfyllning som gör om varje befintlig koppling till exakt en rad. Ingen
-- butik ska märka någon skillnad förrän den själv lägger till ett konto till.

CREATE TABLE IF NOT EXISTS "MetaAdAccount" (
  "shop"         TEXT NOT NULL,
  "accountId"    TEXT NOT NULL,
  "name"         TEXT,
  "currency"     TEXT,
  "campaignMode" TEXT NOT NULL DEFAULT 'all',
  "campaignIds"  TEXT,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MetaAdAccount_pkey" PRIMARY KEY ("shop", "accountId")
);
CREATE INDEX IF NOT EXISTS "MetaAdAccount_shop_idx" ON "MetaAdAccount" ("shop");

-- Varje butik som redan har ett konto valt får sin rad, med valutan och
-- kampanjfiltret den redan kört på. Utan den här raden hade befintliga
-- butiker vaknat utan annonskonto.
INSERT INTO "MetaAdAccount" ("shop", "accountId", "currency", "campaignMode", "campaignIds")
SELECT
  "shop",
  regexp_replace("metaAdAccountId", '^act_', ''),
  "spendCurrency",
  COALESCE("campaignMode", 'all'),
  "campaignIds"
FROM "ShopSettings"
WHERE "metaAdAccountId" IS NOT NULL
  AND regexp_replace("metaAdAccountId", '^act_', '') <> ''
ON CONFLICT ("shop", "accountId") DO NOTHING;

-- Cachad annonskostnad måste veta vilket konto den kom från, annars går ett
-- konto varken att uppdatera eller ta bort för sig.
ALTER TABLE "DailySpend" ADD COLUMN IF NOT EXISTS "account" TEXT NOT NULL DEFAULT '';

UPDATE "DailySpend" d
SET "account" = regexp_replace(s."metaAdAccountId", '^act_', '')
FROM "ShopSettings" s
WHERE s."shop" = d."shop"
  AND d."account" = ''
  AND s."metaAdAccountId" IS NOT NULL
  AND regexp_replace(s."metaAdAccountId", '^act_', '') <> '';

-- Unikheten flyttas från (butik, dag) till (butik, dag, konto). Det gamla
-- indexet måste bort FÖRST — annars kan bara ett konto per dag skrivas, och
-- det andra kontots kostnad försvinner tyst.
DROP INDEX IF EXISTS "DailySpend_shop_day_key";
CREATE UNIQUE INDEX IF NOT EXISTS "DailySpend_shop_day_account_key"
  ON "DailySpend" ("shop", "day", "account");
