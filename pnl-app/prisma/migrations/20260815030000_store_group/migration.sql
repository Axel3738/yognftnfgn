-- Butiksgrupper: flera butiker som ägs av samma person får summeras ihop.
-- Kopplingen sker aldrig automatiskt utan genom en engångskod, eftersom
-- gemensam databas inte är samma sak som gemensam ägare.
ALTER TABLE "ShopSettings" ADD COLUMN IF NOT EXISTS "groupId" TEXT;
CREATE INDEX IF NOT EXISTS "ShopSettings_groupId_idx" ON "ShopSettings"("groupId");

CREATE TABLE IF NOT EXISTS "StoreLinkCode" (
    "code"      TEXT NOT NULL,
    "groupId"   TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt"    TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StoreLinkCode_pkey" PRIMARY KEY ("code")
);
CREATE INDEX IF NOT EXISTS "StoreLinkCode_groupId_idx" ON "StoreLinkCode"("groupId");
