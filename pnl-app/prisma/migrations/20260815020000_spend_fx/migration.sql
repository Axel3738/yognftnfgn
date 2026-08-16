-- Annonskostnad i annat valuta än butikens räknas om med dagskurs. Ursprungs-
-- beloppet och kursen sparas, så en siffra alltid går att härleda tillbaka.
ALTER TABLE "DailySpend" ADD COLUMN IF NOT EXISTS "spendRaw" DECIMAL(12,2);
ALTER TABLE "DailySpend" ADD COLUMN IF NOT EXISTS "fxRate" DECIMAL(18,8);
