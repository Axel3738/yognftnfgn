-- Logga in med Facebook för Meta-kopplingen. Token från inloggningen har ett
-- känt utgångsdatum (~60 dagar) och en känd ägare; den manuellt inklistrade
-- systemanvändar-token har varken — därför är fälten nullbara.
ALTER TABLE "ShopSettings" ADD COLUMN IF NOT EXISTS "metaTokenExpiresAt" TIMESTAMP(3);
ALTER TABLE "ShopSettings" ADD COLUMN IF NOT EXISTS "metaTokenSource" TEXT;
ALTER TABLE "ShopSettings" ADD COLUMN IF NOT EXISTS "metaUserName" TEXT;
ALTER TABLE "ShopSettings" ADD COLUMN IF NOT EXISTS "metaTokenSavedAt" TIMESTAMP(3);
ALTER TABLE "ShopSettings" ADD COLUMN IF NOT EXISTS "metaTokenRefreshAttemptAt" TIMESTAMP(3);
ALTER TABLE "ShopSettings" ADD COLUMN IF NOT EXISTS "metaUserId" TEXT;
ALTER TABLE "ShopSettings" ADD COLUMN IF NOT EXISTS "metaAppId" TEXT;

-- Engångstillstånd som binder Metas OAuth-svar till rätt butik och till
-- webbläsaren som startade inloggningen. Kortlivad, engångs.
CREATE TABLE IF NOT EXISTS "MetaLoginState" (
    "state"     TEXT NOT NULL,
    "shop"      TEXT NOT NULL,
    "nonceHash" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt"    TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MetaLoginState_pkey" PRIMARY KEY ("state")
);
CREATE INDEX IF NOT EXISTS "MetaLoginState_shop_idx" ON "MetaLoginState"("shop");
CREATE INDEX IF NOT EXISTS "MetaLoginState_expiresAt_idx" ON "MetaLoginState"("expiresAt");
