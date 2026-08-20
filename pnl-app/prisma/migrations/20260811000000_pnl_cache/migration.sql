CREATE TABLE "PnlCache" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PnlCache_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PnlCache_shop_key_key" ON "PnlCache"("shop", "key");
