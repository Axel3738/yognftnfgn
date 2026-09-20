## 0. Blockerare före allt annat (mätt 2026-09-20)

`kundtjanst/sop/` innehåller **bara `README.md`** (212 rader). De tio filerna README:n dirigerar till — `00-MASTER.md`, `10-NOT-RECEIVED.md`, `11-UNACCEPTABLE.md`, `12-CREDIT-NOT-PROCESSED.md`, `13-FRAUD-UNRECOGNIZED.md`, `14-DUPLICATE-SUBSCRIPTION-OTHER.md`, `20-NO-CONTACT.md`, `30-EMAIL-TEMPLATES.md`, `40-EVIDENCE-PACK.md`, `50-PREVENTION.md` — och mappen `orders/` **finns inte på disk, inte i git, inte på någon gren** (bara `main` + `origin/main`), inte i scratchpaden. Granskningsnoten för 14-DUPLICATE beskriver 24 rättade defekter i en fil som inte existerar. VA:ns första klick i rutinsteg 4 misslyckas. Allt nedan är underordnat detta.

## 1. Tvistsituationer som fortfarande är otäckta

1. **Delåterbetalning.** `dom()` i `tvistfakta.mjs` kräver `aterbetalt >= total` för "redan återbetald" (product_unacceptable), och för credit_not_processed ger `aterbetalt > 0` → FIGHT strong även när återbetalningen var partiell och kunden bestrider resten. Order 5763 har redan 100 SEK återbetalt 2026-09-19 — fallet finns i datan i dag.
2. **Splittad leverans.** `tvistfakta.mjs:235-236` läser `fulfillments[0].tracking_numbers[0]` — **ett kolli**. En delvis levererad order läses som levererad. Order 5053 (två tvister, 348 + 255, på delar av en order) är exakt det fallet.
3. **Flera tvister på en order.** Verktyget skriver ut båda (filter, inte find), men ingen SOP säger att varje tvist kräver **egen** bevispaket med rätt belopp, och att orderbekräftelsen som bevis täcker hela ordern — beloppen måste delas per tvist.
4. **Tvist på redan återbetald order.** Shopify-statusen `charge_refunded` normaliseras men finns inte i `OPPEN` och nämns ingenstans. Ingen regel: *återbetala aldrig en order som redan har en chargeback* — då betalar butiken två gånger plus avgift.
5. **Retur som faktiskt kommer in.** 6349, 5122 och 5044 har alla fått returadress. Bevislistan säger "proof no return has arrived" — men ingen gren för när returen ankommer: vem inspekterar, återbetalas den, och dödar det tvisten?
6. **Återkommande bestridare.** Inget slår upp kundens mejl/kort över ordrar. Ingen blockeringsregel, ingen "kolla kundens övriga ordrar först".
7. **Inquiry som eskalerar till chargeback på samma order.** 5435 finns både som vunnen inquiry och som öppen inquiry. Ingen regel för vad som händer med redan inskickade bevis, eller för att en vunnen tvist kan återkomma.
8. **Deadline passerad.** `dagarKvar` skriver OVERDUE — ingen procedur för det läget.
9. **Tvistgraden mot kortnätverkens tröskel.** `chargeback.mjs` räknar `tvistgrad` (0,5 % gul / 0,9 % röd) men bara inne i veckorapportens riskpoäng. Den syns inte i dagslarmet och **ändrar inte FIGHT/REFUND-policyn** — nära tröskeln ska man återbetala mer, inte mindre. Uppmätt nu: 0,11 %.
10. **Annan konsumenträtt.** README:n påstår att "a US or Norwegian store fills the same ten lines — the procedure does not [change]". Falskt för unacceptable/credit, där ångerrätten *är* argumentet. USA har ingen lagstadgad ångerrätt.
11. **Butik utan Shopify Payments.** `shopify.mjs:180` hanterar 404 med "tvister syns bara hos Klarna/Stripe" — ingen SOP alls för Klarna, som är stort i Sverige.
12. **Fel butik.** Order 4825-fallet ("what store?") har ingen rutin: kör `--alla` över brands innan du drar slutsatsen att tvisten inte finns.

## 2. Det VA:n fortfarande måste fråga ägaren om (= luckor)

1. **ACCEPT finns inte.** `dom()` returnerar `REFUND` även på en chargeback (verifierat i koden — bara en risktext läggs till). Att "återbetala" en chargeback är ingen giltig åtgärd i Shopify; rätt knapp är *accept*. Verktyget lär ut fel handling.
2. Återbetalning eller ersättningsvara vid äkta fel, och vem betalar returfrakten (5044: knappen gick sönder, ersättning erbjöds, kunden svarade aldrig).
3. `strid_lonar_sig_over` (FIGHT_THRESHOLD) — **inget brandfilsvärde finns**: `tvister:`-blocket står i `brand-mall.yaml:58` men saknas helt i `brands/baverbutiken.yaml`, den enda riktiga butiksfilen. Alla mallar levereras med hål.
4. Får VA:n blockera en återkommande bestridare?
5. Goodwill-återbetalning över ett visst belopp — ingen gräns är satt.
6. Gäller 14-dagarsfönstret som policysidan säger, även när ordern redan skickats (5435)?
7. `subscription_canceled` har ingen gren i `dom()` — faller till `default`.

## 3. Operativa förutsättningar som saknas

1. `orders/`-mappen (README steg 7, "one decision sheet per order") existerar inte — besluten har ingen plats att bo på.
2. `tvister:`-blocket måste fyllas per butik, annars går varje mall ut med `{{PLACEHOLDERS}}`. Ingen kod läser blocket i dag.
3. 17TRACK-kvot är ett verkligt driftsberoende: 12 av 12 tvistordrar var äldre än spårningsrutinens 14-dagarsfönster och måste registreras (`--registrera`) innan någon skanning kan läsas. Tar kvoten slut kan inget "not received"-fall avgöras.
4. Shopify-scopet `read_shopify_payments_disputes` per butik; en 403 rapporteras som UNKNOWN och kan tolkas som "inga tvister".
5. Ingen tillgång till mejltråden per order i verktyget — VA:n måste söka i webbmejlen för hand, och det är just det steget som fällde 5122 ("CS missed his email").
6. Ingen loggplats för utfall (vann/förlorade/accepterade) och därmed ingen feedbackloop.

## 4. Vad som ska mätas — och vad som redan finns att mäta med

1. **Utfall per tvist och beslut** (FIGHT/REFUND/ESCALATE → won/lost/accepted). Finns redan: `tvistkoll.mjs` läser alla tvister med status varje dag till noll extra kostnad — låt den snapshotta utfallen.
2. **Vinstgrad per orsakskod och per typ.** Baslinje mätt 2026-09-20: inquiries 29/29 vunna, chargebacks 1/4.
3. **Tid från tvist öppnad → bevis inskickat, och antal missade deadlines.** `evidensSenast` + `dagarKvar` finns; inskickningstidpunkten loggas ingenstans.
4. **Tvistgrad per 1 000 ordrar över tid.** Finns redan i `historik/<brand>.jsonl` (`tvistgrad`, `tvister`, `forfragningar`, `ordrar`) — committas varje vecka. Lägg utfallsräknarna i samma fil.
5. **Andel tvister utan tidigare mejlkontakt.** Mätt nu: 5 av 12. Det är prevention nr 1.
6. **Andel tvister där spårningen måste registreras om.** Mätt nu: 12 av 12 — mäter om spårningsrutinens 14-dagarsfönster är för kort.
7. **Andel som eskaleras till ägaren.** Varje eskalering är en lucka i SOP:erna; talet ska falla över tid, annars fungerar inte systemet.
