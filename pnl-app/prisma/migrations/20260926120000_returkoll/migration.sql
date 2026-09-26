-- Returkollen: när butikens senaste 45 dagar senast exporterades om för att
-- fånga sena återbetalningar och avbokningar. De bokas på ORDERNS dag och syns
-- bara när den dagen hämtas igen — i dropshipping kommer de 1–3 veckor efter
-- ordern, långt utanför de tre dagar panelen och gruppen håller färska.
-- Tokenvakten (alla sex tjänster) tar butiker vars värde är null eller äldre
-- än 6 h och stämplar raden atomiskt, så bara en tjänst gör exporten.
-- Idempotent; sex Railway-tjänster kör migrate deploy var för sig.

ALTER TABLE "ShopSettings" ADD COLUMN IF NOT EXISTS "refundResyncAt" TIMESTAMP(3);
