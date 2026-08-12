-- Session: krävs av @shopify/shopify-app-remix, en rad per installerad butik.
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" TIMESTAMP(3),
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "accountOwner" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT,
    "collaborator" BOOLEAN DEFAULT false,
    "emailVerified" BOOLEAN DEFAULT false,
    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Session_shop_idx" ON "Session"("shop");

CREATE TABLE "ShopSettings" (
    "shop" TEXT NOT NULL,
    "tariffPerOrder" DECIMAL(10,2) NOT NULL DEFAULT 27.50,
    "feeRate" DECIMAL(6,4) NOT NULL DEFAULT 0.029,
    "targetMargin" DECIMAL(6,4) NOT NULL DEFAULT 0.25,
    "metaAdAccountId" TEXT,
    "metaAccessToken" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'SEK',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ShopSettings_pkey" PRIMARY KEY ("shop")
);

-- Shopify sparar ingen kostnadshistorik — unitCost har bara ett nuvärde.
CREATE TABLE "CostChange" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "variantGid" TEXT,
    "productGid" TEXT NOT NULL,
    "unitCost" DECIMAL(10,2) NOT NULL,
    "effectiveFrom" DATE NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CostChange_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CostChange_shop_productGid_effectiveFrom_idx"
    ON "CostChange"("shop", "productGid", "effectiveFrom");
ALTER TABLE "CostChange" ADD CONSTRAINT "CostChange_shop_fkey"
    FOREIGN KEY ("shop") REFERENCES "ShopSettings"("shop")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Stängda dagar ändrar sig inte, så de hämtas en gång och sparas.
CREATE TABLE "DailySpend" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "spend" DECIMAL(12,2) NOT NULL,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DailySpend_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "DailySpend_shop_day_key" ON "DailySpend"("shop", "day");
CREATE INDEX "DailySpend_shop_day_idx" ON "DailySpend"("shop", "day");
