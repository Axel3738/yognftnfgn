-- Returkollen: när den senaste LYCKADE omexporten blev klar. `refundResyncAt`
-- är låset — det stämplas när en tjänst tar butiken, innan exporten körts,
-- och rullas tillbaka om den misslyckas. Visades låset som "senaste koll
-- HH:MM" påstod panelen att de senaste 45 dagarna kollats medan exporten
-- fortfarande pågick (eller skulle misslyckas). Det här fältet skrivs bara
-- efter en lyckad hämtning och är det enda UI:t läser.
-- Idempotent; sex Railway-tjänster kör migrate deploy var för sig.

ALTER TABLE "ShopSettings" ADD COLUMN IF NOT EXISTS "refundResyncOkAt" TIMESTAMP(3);
