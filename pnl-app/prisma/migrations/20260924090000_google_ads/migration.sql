-- Google Ads-koppling: OAuth per butik plus de kopplade kundkontona.
-- Idempotent; sex Railway-tjänster kör migrate deploy var för sig.

CREATE TABLE IF NOT EXISTS "GoogleAdsAccount" (
    "shop"            TEXT NOT NULL,
    "customerId"      TEXT NOT NULL,
    "name"            TEXT,
    "currency"        TEXT,
    "timezoneName"    TEXT,
    "loginCustomerId" TEXT,
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GoogleAdsAccount_pkey" PRIMARY KEY ("shop","customerId")
);

CREATE INDEX IF NOT EXISTS "GoogleAdsAccount_shop_idx" ON "GoogleAdsAccount"("shop");

-- Googles refresh-token på butiken, krypterad som Meta-token.
ALTER TABLE "ShopSettings" ADD COLUMN IF NOT EXISTS "googleRefreshToken" TEXT;
ALTER TABLE "ShopSettings" ADD COLUMN IF NOT EXISTS "googleTokenSavedAt" TIMESTAMP(3);
ALTER TABLE "ShopSettings" ADD COLUMN IF NOT EXISTS "googleEmail" TEXT;

-- Engångs-state delas med Facebook-inloggningen; raden säger vilken tjänst.
ALTER TABLE "MetaLoginState" ADD COLUMN IF NOT EXISTS "provider" TEXT NOT NULL DEFAULT 'meta';
