# Evolve Supply Chain Program (Kanary) — översikt

Läst 2026-10-01 i Skool (`skool.com/evolve-8484/classroom/992407ee`). Femton lektioner, ~10 timmar
video, gjorda av sourcingbolaget **Kanary Solutions** (Greg Chen-Lepkoff, CJ Christensen, Chris
Oslebo; kanarysolutions.com). Kanary vänder sig till varumärken med **5 miljoner dollar+ om året
som håller eget lager** — "Not for dropshipping". Det mesta gäller ändå oss, eftersom vi köper
via en agent (CWD) och redan håller förbetalt lager där.

Noter per lektion i `supply/NN.md` (svenska, med tidsstämplar). Undertexterna och bildspelens
text i `kalla/supply/`. Lektion 05, 12 och 15 är lästa av huvudsessionen, resten av hjälpagenter
(sonnet) som läste hela transkripten och bildspelen.

## Lektionerna

| # | Lektion | Längd | Det viktigaste |
|---|---|---|---|
| 01 | Introduction + Work With Our Supplier | text | Kanary: full kostnadsinsyn (fabrikspris och påslag separat), kreditvillkor "bättre än DS-agenter", fabriksbesök. Krav: 5 M$/år. |
| 02 | [Modul 0 — Take Full Control of Your Supply Chain](supply/02.md) | 1:13:55 | En agent som både sourcar och fraktar lägger marginal på båda — räkna alltid landad kostnad och be om uppdelning. Villkor förhandlas stegvis (7 → 10 → 14 dagar). |
| 03 | [Modul 1 — Supplier Types](supply/03.md) | 47:15 | Fabrik, tradingbolag, fulfillmentagent, sourcingbolag. Dropshippingagenter har noll prisinsyn och för inte vidare förhandlade priser. |
| 04 | [Modul 2 — Custom Products in China](supply/04.md) | 48:54 | Be om kostnadsnedbrytning och ge ett målpris. Beställ extra av den del som tar längst tid. |
| 05 | [Modul 3 — Quality & Profit Margin](supply/05.md) | 22:04 | 1 procentenhet lägre defektgrad = 3–6 % mer vinst. Garantipolicy, kredit och överleverans. Största problemet: slutförsäljning. |
| 06 | Modul 4 — Choose the Best Suppliers | text | "Just use the ones in Evolve discord plugs now" (Matedropshipping, se `OVRIGT.md`). |
| 07 | [Modul 5 — Work With Factories For A Brand](supply/07.md) | 27:22 | Förhandla i tre lägen: före första ordern, när den läggs (prognos → depositionsschema), efter några ordrar (30/40/30). Nästa order som hävstång mot defekter. |
| 08 | [Modul 6 — Perceived Product Value](supply/08.md) | 16:26 | Förpackningseffekter under 25 cent, tryck i stället för etikett, bundles. |
| 09 | [Due Diligence on Manufacturers](supply/09.md) | 44:43 | Prata med många, sortera bort tradingbolag, be om materiallista, fråga om deras värsta defekt. |
| 10 | [How to QC Manufacturers](supply/10.md) | 49:56 | Låt aldrig fabriken eller fulfillmentbolaget vara ensam QC. Golden sample, go/no-go-lista, oberoende stickprov. |
| 11 | [Compliance & Manufacturer Agreements](supply/11.md) | 58:38 | Avtal och certifikat före produktion. Aldrig 100 % i förskott; ~30 % deposition, resten efter inspektion. CE gäller EU. |
| 12 | [Payment Term Negotiating Strategies](supply/12.md) | 50:27 | Villkor före pris. Pay-as-you-ship, rullande deposition, kreditram, stegvisa villkor. **Fulfillment kostar ofta mer än varan — villkor på frakten är den största vinsten.** |
| 13 | [Supplements FAQ — Shipping Lines](supply/13.md) | 13:45 | Billigare pris kan betyda billigare fraktlinje med sämre leveransgrad. Fråga vilken linje som används. |
| 14 | [Q1 & Q2 Product Launch Strategies](supply/14.md) | 1:01:21 | Förhandla pris och villkor i januari med årsvolymen i handen. Lägg ordrar och dela prognos före nyåret. |
| 15 | [Last Minute CNY Prep — 2026](supply/15.md) | 40:53 | Ledtider dubblas före nyåret, full kapacitet först mitten av mars. Räkna "days of supply". Q4-volym som hävstång för Q1. Presenter till produktionscheferna. |

## Det här tar vi med oss (sessionens sammanfattning)

1. **Slutförsäljning är problem nummer ett** (lektion 05). Lösningen är att matcha försäljningstakten
   mot lagret och ledtiden varje dag — byggt som `lager/kor.mjs`, läser CWD:s lagerark.
2. **Kinesiska nyåret 6 februari 2027** stänger allt ~28 januari–mitten av mars. Matstrumpors
   eftersäsong (januari–februari) ligger mitt i glappet. Lagret ska ligga hos CWD före 28 januari.
3. **Landad kostnad, inte styckpris.** CWD är både sourcing och frakt; frakten är ofta större än
   varan. Be om uppdelning (vara / frakt / packning) och jämför mot en andra agent (Matedropshipping).
4. **Villkor före pris.** Be om frakten fakturerad varannan vecka eller månadsvis, pay-as-you-ship på
   förbetalt lager, och stegvisa villkor. "Jag lovar att de får villkor själva" (lektion 12).
5. **Hävstången är volym och prognos.** Visa CWD en prognos och vad bättre villkor gör ("med dagens
   villkor X, med Net 30 Y"). Använd Q4-volymen i januari (lektion 14–15).
6. **Defekter är pengar.** Kundtjänsten ska räkna defekter per produkt, och CWD ska få en ren
   rapport varje månad. Förhandla kredit och överleverans (lektion 05, 07).
7. **Var misstänksam mot "garanterat lägre pris"** — det betyder oftast sämre komponenter eller
   sämre fraktlinje (lektion 05, 13).
8. **Relationen räknas.** Betala i tid, särskilt före nyåret; skicka något till de som packar.

Strategin och de färdiga meddelandena: `leverantor/FORHANDLING.md` och `leverantor/meddelanden/`.
