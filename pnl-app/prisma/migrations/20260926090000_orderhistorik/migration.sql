-- Orderhistorikens horisont: ser butiken ordrar äldre än 60 dagar?
-- Utan read_all_orders svarar Shopify TOMT (inte fel) för äldre ordrar, och
-- en tom hämtning skrev förut nollor över riktiga dagsrader. Sonden sätter
-- fullOrderHistory en gång per butik och kontrollerar om varje vecka.
-- Null = aldrig sonderad; då räknas horisonten konservativt (idag − 59).
-- Idempotent; sex Railway-tjänster kör migrate deploy var för sig.

ALTER TABLE "ShopSettings" ADD COLUMN IF NOT EXISTS "fullOrderHistory" BOOLEAN;
ALTER TABLE "ShopSettings" ADD COLUMN IF NOT EXISTS "fullOrderHistoryCheckedAt" TIMESTAMP(3);
