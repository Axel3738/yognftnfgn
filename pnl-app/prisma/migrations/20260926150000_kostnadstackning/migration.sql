-- Kostnadstäckning och tullens startvärde.
--
-- 1) Tullens default blir 0. 27,50 är Axels EU-tull i kronor; i en USD-butik
--    blev det 27,50 dollar i påhittad tull per order och break-even runt
--    112×. Befintliga rader rörs INTE — bara nya rader får det nya värdet,
--    och afterAuth sätter 27,50 uttryckligen när en SEK-butik skapas.
-- 2) tariffConfirmedAt: handlarens kvittens av TULLEN, skild från
--    settingsSavedAt (som stämplas av vilken sparning som helst).
--    Fylls i från settingsSavedAt för befintliga rader, så att Axels butiker
--    inte får en ny fråga. Bara därifrån: en regel som "tullen är inte 27,50"
--    hade vid en omkörning kvitterat nya butiker som fått 0 som startvärde.
-- 3) freeVariants: varianter handlaren sagt är gratis; bara för dem räknas
--    inköpspris 0 som riktigt.
-- Idempotent; sex Railway-tjänster kör migrate deploy var för sig.

ALTER TABLE "ShopSettings" ALTER COLUMN "tariffPerOrder" SET DEFAULT 0;

ALTER TABLE "ShopSettings" ADD COLUMN IF NOT EXISTS "tariffConfirmedAt" TIMESTAMP(3);
ALTER TABLE "ShopSettings" ADD COLUMN IF NOT EXISTS "freeVariants" JSONB;

UPDATE "ShopSettings"
SET "tariffConfirmedAt" = "settingsSavedAt"
WHERE "tariffConfirmedAt" IS NULL
  AND "settingsSavedAt" IS NOT NULL;
