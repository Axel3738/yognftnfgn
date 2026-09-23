-- Försäljning per timme på dygnet, i butikens tidszon.
--
-- Egen tabell i stället för en JSON-kolumn på DailyPnl: den kolumnen läses
-- oselekterat av varenda sida i appen, och timmarna hade varit marknader × 24
-- på ett svar ingen av dem ritar.
--
-- Idempotent: sex Railway-tjänster delar en Postgres och kör `migrate deploy`
-- var för sig vid varje deploy.
CREATE TABLE IF NOT EXISTS "HourlyPnl" (
    "shop"            TEXT NOT NULL,
    "day"             TEXT NOT NULL,
    "hour"            INTEGER NOT NULL,
    "market"          TEXT NOT NULL DEFAULT '',
    "orders"          INTEGER NOT NULL DEFAULT 0,
    "grossSales"      DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discounts"       DOUBLE PRECISION NOT NULL DEFAULT 0,
    "returns"         DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netSales"        DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalSales"      DOUBLE PRECISION NOT NULL DEFAULT 0,
    "shippingCharges" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fees"            DOUBLE PRECISION,
    CONSTRAINT "HourlyPnl_pkey" PRIMARY KEY ("shop","day","hour","market")
);

CREATE INDEX IF NOT EXISTS "HourlyPnl_shop_day_idx" ON "HourlyPnl"("shop","day");

-- Markerar att dagen faktiskt timuppdelats. Utan den går en dag utan
-- försäljning inte att skilja från en dag som hämtades före den här ändringen.
ALTER TABLE "DailyPnl" ADD COLUMN IF NOT EXISTS "hoursAt" TIMESTAMP(3);

-- Annonskostnad per timme, i ANNONSKONTOTS tidszon (så levererar Meta den).
CREATE TABLE IF NOT EXISTS "HourlySpend" (
    "shop"        TEXT NOT NULL,
    "day"         DATE NOT NULL,
    "account"     TEXT NOT NULL,
    "market"      TEXT NOT NULL DEFAULT '',
    "hour"        INTEGER NOT NULL,
    "spend"       DOUBLE PRECISION NOT NULL DEFAULT 0,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks"      INTEGER NOT NULL DEFAULT 0,
    "fetchedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HourlySpend_pkey" PRIMARY KEY ("shop","day","account","market","hour")
);

CREATE INDEX IF NOT EXISTS "HourlySpend_shop_day_idx" ON "HourlySpend"("shop","day");

-- Annonskontots tidszon. Behövs för att lägga Metas timmar på butikens klocka.
ALTER TABLE "MetaAdAccount" ADD COLUMN IF NOT EXISTS "timezoneName" TEXT;
