CREATE TABLE "FixedCost" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "monthlyAmount" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FixedCost_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "FixedCost_shop_idx" ON "FixedCost"("shop");
