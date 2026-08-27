# EKONOMISK SÅGNING — Bäverbutikens skalnings- och volymsystem

Jag har läst räknemotorn i `/home/user/yognftnfgn/pnl-app/app/lib/pnl.server.ts`, datahämtaren i `/home/user/yognftnfgn/pnl-app/app/lib/shopify-data.server.ts`, `/home/user/yognftnfgn/pnl-app/prisma/schema.prisma` och `/home/user/yognftnfgn/pnl-app/CLAUDE.md` innan jag räknat. Flera av felen nedan är inte modellfel — de sitter i talet modellerna importerar.

**Sammanfattning i en mening:** alla tre modellerna, båda domarna och hela beslutsapparaten står på `breakEvenRoas` ur vinstappen, och det talet är en **bruttosiffra före moms, före returer, före creative och före fasta kostnader**. Den sanna break-even för medianprodukten ligger på **2,4–2,9 — inte 1,85**. Modellernas gemensamma "arbets-ROAS 2,2" ligger alltså **under** break-even, och varje tröskel i alla tre dokumenten är därmed satt mot fel tal.

---

## DEL 1 — DE TVÅ FEL SOM ENSAMMA VÄLTER SYSTEMET

### E1. Momsen finns inte någonstans i kedjan

**PÅSTÅENDE:** "Median BE-ROAS 1,85x. TB-marginal 54%. TB/order 189 kr." (alla tre modellerna, båda domarna, som givet faktum)

**VARFÖR FEL:** Kedjan är spårbar rad för rad:
- `pnl.server.ts:279`: `grossContribution = totalSales − cogs − tariff − fees`, och `breakEvenRoas = totalSales / grossContribution`.
- `shopify-data.server.ts:176`: `totalSales += totalPriceSet − refunded`. Shopifys `totalPriceSet` är **inklusive moms** i en svensk butik (`taxesIncluded`).
- `pnl-app/CLAUDE.md` rad 212, Axels egen regel: **"Bara strunta i momsen — moms är utanför appens ansvar."**

Det är ett rimligt *app*-beslut (moms är en genomströmningspost) och ett förödande *besluts*-beslut. Break-even räknas på en intäkt där 25% tillhör Skatteverket, och de 25 procenten ligger kvar i täljaren *och* i nämnaren. Meta rapporterar dessutom konverteringsvärdet inklusive moms, medan annonskostnaden är omvänd skattskyldighet (momsfri). Så både vinstappens och Meta Ads Managers ROAS är momsuppblåsta — men bara *intäktssidan*.

**RÄTT SIFFRA:** Medianprodukt 329 kr inkl. moms, `unitCost` 114 kr (härlett: 329 − 178 − 27,50 − 9,54), tull 27,50, avgift 2,9%:

| | Vinstappen | Scenario C: tullen är avdragsgill importmoms | Scenario B: tullen är en klareringsavgift (IOSS) |
|---|---|---|---|
| Intäkt att räkna på | 329 | 263,20 (ex moms) | 263,20 |
| TB/order | **178,00** | 139,66 | **112,16** |
| **Sann BE-ROAS** (på Metas momsinkl. tal) | **1,85** | **2,36** | **2,93** |

Generell omräkningsformel, använd den på varje produkt i katalogen:

> **BE-ROAS_sann = 1 ÷ (1/BE-ROAS_app − 0,20 + 27,50/pris)**  *(scenario C)*
> **BE-ROAS_sann = 1 ÷ (1/BE-ROAS_app − 0,20)**  *(scenario B, tull ej avdragsgill)*

Vad det gör med katalogen (scenario C):

| Produkt | BE app | **BE sann** |
|---|---|---|
| LED Arbetslampor 90W (1799) | 1,23 | **1,59** |
| Herrshorts 3-pack (459) | 1,40 | **1,74** |
| Vandringskängor Grepp (699) | 1,66 | **2,26** |
| Medianprodukt (329) | 1,85 | **2,36** |
| Magnetfiskesats (279) | 2,30 | **3,00** |
| Bollpannband (179) | 2,80 | **3,22** |
| Marin Motorhölje (299) | 2,90 | **4,22** |

**Konsekvens:** M1:s slutsats "BE-ROAS ≤ 1,87 krävs för målmarginal, alltså kan halva katalogen nå den" blir i sanna tal **BE-ROAS_app ≤ 1,32** — det är **5 av 119 produkter**, inte 52. Det är inte en justering, det är en annan butik.

**ÅTGÄRD FÖRE ALLT ANNAT:** avgör vilket scenario som gäller. Testet tar tio minuter: *"Redovisar butiken utgående moms på svenska B2C-ordrar, och dras ingående moms av på de 27,50 kronorna?"* Är svaret nej på första frågan är 1,85 rätt tal **och en latent skatteskuld**, inte en marginal.

---

### E2. Momsfloaten räknas som fri kassa — det är så här butiken faktiskt dör

**PÅSTÅENDE:** M3 B4: "S_max = fri kassa ÷ 10. 100 000 kr fri kassa → max 10 000 kr/dag."

**VARFÖR FEL:** Vid kvartalsvis momsredovisning (omsättning 1–40 Mkr) betalas momsen den 12:e i andra månaden efter periodens slut — i snitt **75–105 dagar efter försäljningen**. Pengarna står på bankkontot hela tiden och ser ut som vinst. Ingen av modellerna nämner ordet moms. Kombinerat med E1 betyder det att "fri kassa" i M3:s formel till stor del *är* momsskulden.

**RÄTT SIFFRA:** Vid 4 000 kr/dag och Meta-ROAS 2,2 (omsättning 8 800 kr/dag inkl. moms):
- Utgående moms = 1 760 kr/dag. Ackumulerad över 90 dagar: **158 400 kr.**
- Netto att betala efter ingående moms (scenario C): ~1 025 kr/dag → **ca 92 000 kr står på kontot och tillhör Skatteverket.**
- Vinstappens `netProfit` är i samma ögonblick uppblåst med 1 760 kr/dag = **53 000 kr/månad.**

Kör operatören M3:s regel med 100 000 kr på kontot, varav 92 000 är momsskuld, blir det verkliga taket **8 000 ÷ 10 = 800 kr/dag**, inte 10 000.

**RÄTT REGEL:**
> **Fri kassa = bankbehållning − ackumulerad utgående moms + ackumulerad ingående moms − nästa 60 dagars fasta kostnader.**
> Utgående moms flyttas till ett separat konto samma dag som Shopify-utbetalningen landar. Aldrig annat.

**Tillväxtfällan ovanpå:** momsfloaten *finansierar* snabb tillväxt och gör den därför bedräglig. Räknat per annonskrona och dag, scenario C, Meta-ROAS 2,8:
- Vid +30%/vecka: **+0,030 kr/dag.** Ser bra ut.
- Vid 0% tillväxt (samma ROAS, samma allt): momstermen hoppar från 0,020 till 0,326 → **+0,189 kr/dag** men med en **stegvis ny utbetalning på 0,26 kr per annonskrona per dag** = vid 4 000 kr/dag **1 040 kr/dag i ny utflöde den vecka tillväxten stannar.**

> **Den vecka du slutar växa dyker ett kassautflöde på ~1 000 kr/dag upp ur ingenting. Det är inte en risk — det är aritmetik.**

---

## DEL 2 — DROPSHIP-KASSAFLÖDET, RÄKNAT

### E3. "S_max = fri kassa ÷ 10" är rätt form men fel tal, och fel för 4 av 5 produkter

**PÅSTÅENDE:** M3 B4: bindningen är 10 × dagsspenden, härlett ur "2,01 kr utbetalning per spendkrona × 5 dagars fördröjning".

**VARFÖR FEL:** Två fel. (a) Konstanten 2,01 bygger på M3:s fiktiva COGS-andel 35,2% (se E10) — den varierar 14–53% i verkligheten. (b) Talet ignorerar Metas faktureringströskel, som ger 1,5–3 dagars gratisfloat på annonskostnaden, och företagskortets float ovanpå.

**RÄTT REGEL:**
> **WC-multipel = L_utbetalning × (1 + ROAS × (COGS + tull)/pris) − L_annonsfloat**

| Produkt | ROAS | COGS+tull / pris | **WC-multipel** (L=5, float 2 dagar) |
|---|---|---|---|
| LED Arbetslampor 90W | 2,0 | 15,8% | **6,6 ×** |
| Medianprodukt | 2,2 | 43,0% | **7,7 ×** |
| Magnetfiskesats (BE 2,30) | 2,2 | 53,6% | **8,9 ×** |
| Marin Motorhölje (BE 2,90) | 2,9 | 62,6% | **12,1 ×** |

Spannet är 6,6–12,1, inte en konstant 10. **Lågmarginalprodukterna binder nästan dubbelt så mycket rörelsekapital per annonskrona som högmarginalprodukterna — och tjänar mindre.** Det är ett andra, oberoende argument för att chilla BE > 2,2-gruppen som ingen modell gör.

---

### E4. Rullande reserv är basfallet, inte stresscaset

**PÅSTÅENDE:** M3 B4: "Stresscase: utlöser du en rullande reserv blir fördröjningen 14 dagar → S_max = kassa ÷ 28."

**VARFÖR FEL:** En rullande reserv är inte en förlängd fördröjning, det är en **procentandel som hålls i 90 dagar**. Och triggervillkoren för en reserv är: (1) plötsligt volymhopp, (2) lång leveranstid, (3) hög tvistfrekvens, (4) nytt/ungt bolag. Bäverbutiken uppfyller **alla fyra** — leveranstid 6–10 arbetsdagar och en modell som föreskriver +30%/vecka.

**RÄTT SIFFRA:** 10% rullande reserv i 90 dagar vid 4 000 kr/dag och ROAS 2,2:
- Låst kapital i steady state: 0,10 × 8 800 × 90 = **79 200 kr**
- Under de 90 dagar reserven byggs upp: **−880 kr/dag i kassaflöde**
- Vinstappens redovisade dagsnetto på app-basis: **+756 kr/dag**

> **En rullande reserv gör inte butiken mindre lönsam. Den gör den kassaflödesnegativ i 90 dagar, med marginal.** Och den utlöses av precis det beteende modellerna föreskriver.

---

### E5. +30%/vecka är kassaflödesmässigt omöjligt vid modellens egen arbets-ROAS

**PÅSTÅENDE:** M1 B1 "+30% per vecka". M2 6.3 "+50%". M3 C2 "+20–25%". Ingen av dem kontrollerar tillväxttakten mot kassan.

**VARFÖR FEL:** COGS + tull betalas vid orderläggning; utbetalningen kommer L dagar senare. Växer du under tiden är inflödet du får idag baserat på en mindre butik än den du finansierar idag. Kassaneutral veckotillväxt löser:

> **G_max = [0,971·R ÷ (1 + R·(COGS+tull)/pris)] ^ (7/L)**

Medianprodukt, app-basis (utan moms, dvs. det generösaste antagandet):

| Meta-ROAS | L = 5 dagar | L = 7 dagar |
|---|---|---|
| 2,0 | **+6,2%/v** | +4,4%/v |
| **2,2** (modellernas arbetspunkt) | **+13,9%/v** | **+9,8%/v** |
| 2,5 | +24,5%/v | +17,0%/v |
| 3,0 | +40,0%/v | +27,2%/v |

**RÄTT REGEL:** +30%/vecka är självfinansierat först vid **ROAS ≥ 2,65 (L=5)** respektive **ROAS ≥ 3,15 (L=7)**. Vid arbets-ROAS 2,2 är taket **+14%/vecka**, och då tar en fördubbling 5,3 veckor, inte 2,6.

Kostnaden att bryta mot detta, räknat: ramp från 1 000 → 4 000 kr/dag på +30%/vecka bränner **≈ 14 000 kr** i kassa **utöver** steady-state-bufferten på ~39 000 kr. Total kassa som krävs för att gå till 4 000 kr/dag: **~53 000 kr**, inte M3:s 40 000. Med moms och reserv: **150 000–200 000 kr.**

---

### E6. Kortfloaten — den enda gratisfinansieringen i strukturen — nämns inte alls

**PÅSTÅENDE:** (utelämnande i alla tre modellerna)

**VARFÖR FEL:** Meta fakturerar på tröskel + månadsdatum. Betalas annonskontot med företagskort får du kortets egen float ovanpå. Vid 4 000 kr/dag och 25 dagars genomsnittlig kortfloat är det **100 000 kr räntefri rörelsekapitalfinansiering** — mer än hela den buffert modellerna kräver att du har på banken.

**RÄTT REGEL:** Betala all annonsspend på företagskort med maximal betalningsfrist innan du överväger extern finansiering eller sänkta budgetar. Detta är en högre hävstång på kassan än varje skalningsregel i dokumenten.

---

## DEL 3 — UGC-KOSTNADEN, RÄKNAD PER SPENDNIVÅ

### E7. M1:s UGC-grind öppnar exakt på den nivå där UGC gör produkten olönsam

**PÅSTÅENDE:** M1 A5: "En UGC-video kostar 1 400 kr. Vid median-TB 178 kr betalar den sig på 8 ordrar. På T2 är videon betald på 2 dagar. → UGC-grinden öppnas vid T2."

**VARFÖR FEL:** Tre fel staplade. (a) 8 ordrar är återbetalningen på en **vinnande** video — träffkvoten (25% i M1:s egen A4) ignoreras. (b) Kostnaden ställs mot **hela** täckningsbidraget, inte mot nettot efter annonser. (c) Priset 800–2 000 kr är amerikanskt; nordiska kreatörer med egen båt/traktor/MC ligger enligt segmenteringens egen batchplan på 4 000–8 000 kr/dag.

**RÄTT SIFFRA.** Realistiska nordiska styckkostnader: färdig UGC-annons i batch ≈ **900 kr** (6 000 kr kreatörsdag ÷ 11 råklipp = 545 kr + redigering 350 kr), styckvis ≈ **2 200 kr**, omklipp 250 kr, static ur befintligt material 100 kr. M1:s eget schema (`nya/vecka = dagsbudget ÷ 500` med A5:s mix), app-basis BE 1,85 och ROAS 2,2:

| Nivå | kr/dag | Nya/v | Creative kr/mån (batch) | Netto kr/mån | **Creative som % av netto** |
|---|---|---|---|---|---|
| T1 | 360 | 1 | 433 | 2 041 | 21% |
| **T2** ← grinden | **710** | **2** | **4 333** | **4 026** | **108% — FÖRLUST** |
| S1 | 1 250 | 3 | 5 417 | 7 088 | 76% |
| S2 | 2 490 | 5 | 10 400 | 14 118 | 74% |
| S3 | 4 980 | 9 | 16 900 | 28 236 | 60% |

Med **styckvis** beställd UGC istället för batch: 108% på varje nivå — permanent förlust.

**Strukturfelet:** eftersom `nya/vecka = S/500` skalar linjärt med spenden blir creative en **fast procentsats av annonsbudgeten**, inte en fast kostnad som späds ut. Creative kostar **0,129 kr per annonskrona i batch** och **0,204 kr styckvis**, medan nettot vid ROAS 2,2 är 0,189 kr. Det spelar ingen roll hur mycket du skalar — andelen ändras aldrig.

**RÄTT REGEL:** creative-kadensen får aldrig vara en funktion av spend. Den ska vara en funktion av vinst:

> **Creative-budget/vecka = 0,20 × 7 × dagsbudget × (ROAS ÷ BE-ROAS_sann − 1)**
> **Antal enheter/vecka = den budgeten ÷ 450 kr**

Medianprodukten på S2 (2 490 kr/dag), scenario C (BE_sann 2,36):
- vid ROAS 2,4: 0,20 × 17 430 × 0,017 = 59 kr/v → **0 nya. Produkten har inte råd med creative alls.**
- vid ROAS 3,0: 0,20 × 17 430 × 0,271 = 945 kr/v → **2 nya/vecka.**
- vid ROAS 3,5: 0,20 × 17 430 × 0,483 = 1 684 kr/v → **3,7 nya/vecka.**

Regeln självjusterar: **du förtjänar creative-volym genom hög ROAS, inte genom hög spend.** Det är exakt tvärtemot alla tre modellerna.

**Vid vilken ROAS blir M1:s volymschema försvarbart** (creative ≤ 30% av nettot)? ROAS ≥ 1,6 × BE_sann:
- Scenario C, median: **ROAS ≥ 3,78.** Scenario B: **ROAS ≥ 4,69.** App-basis: ROAS ≥ 2,96.

Playbookens högsta bevisade ROAS i skala, på ett annat konto, är **2,47**.

---

### E8. Batchplanen kostar ungefär ett helt års vinst

**PÅSTÅENDE:** Segmenteringen: 6 kreatörer, 2 inspelningsfönster, 106 produkter täckta. M1 A7: "En kreatörsdag kostar 4 000–8 000 kr och betalar sig på ~2 veckor över tre produkter."

**VARFÖR FEL:** Kostnaden räknas per dag men aldrig för hela programmet, och tre poster saknas helt: **produktprover som måste skickas till kreatören** (du kan inte filma ett båtkapell utan ett båtkapell), **redigeringsarbetet** som förvandlar råklipp till annonser, och **överpriset på flaskhalskreatören** som segmenteringen själv föreskriver ("betala den personen över marknadspris").

**RÄTT SIFFRA — hela katalogen en gång:**

| Post | Uträkning | Kr |
|---|---|---|
| Kreatörsdagar | 106 produkter ÷ 3–5/dag = 21–35 dagar × 6 000 kr | 126 000–210 000 |
| Produktprover | 106 × ~250 kr (COGS + frakt, ej återvinningsbara) | 26 500 |
| Redigering | ~350 färdiga annonser × 300 kr | 105 000 |
| **Summa** | | **258 000–342 000 kr** |

Årsnetto vid 4 000 kr/dag, app-basis, ROAS 2,2: 4 000 × 365 × 0,189 = **276 000 kr/år.**

> **Batchplanen kostar 94–124% av ett års hela vinst på appens egna, för generösa tal. På sanna tal (E1) kostar den mer än oändligt, eftersom nettot är negativt.**

**RÄTT REGEL:** filma bara de produkter portföljreglerna själva tillåter dig att köra. M3:s eget operatörstak är **8 produkter i prospecting samtidigt**. Rätt dimensionering:

> 5–6 produkter per inspelningsfönster × 3 råklipp = 15–18 råklipp ≈ **2 kreatörsdagar = 12 000 kr + 1 500 kr prover + 16 200 kr redigering ≈ 30 000 kr per fönster, 60 000 kr/år** = 22% av årsnettot. Det är taket.

Segmenteringens 106-produktsplan är **4–5 gånger för stor i förhållande till den portfölj skalningsmodellerna tillåter.** Det är en direkt motsägelse mellan de två dokumenten som ingen av domarna fångade.

---

## DEL 4 — TULLEN OCH AOV: DEN HÄVSTÅNG SOM FAKTISKT FINNS

### E9. Tullen äter hela dagsvinsten — och ingen modell säger det

**PÅSTÅENDE:** M1: "Samma produkt tål 15% dyrare trafik i Norge och UK." M2: "BE-ROAS −14% på medianprodukten." M3: "BE-CPA +14,6%."

**VARFÖR FEL:** Alla tre uttrycker tulleffekten i procent på break-even, vilket är det mått som gör den minst. Uttryckt i vinst är den enorm.

**RÄTT SIFFRA.** 4 000 kr/dag, ROAS 2,2, AOV 329 → 26,75 ordrar/dag:
- Tull betald per dag: 26,75 × 27,50 = **735 kr/dag**
- Vinstappens dagsnetto: 4 000 × 0,189 = **756 kr/dag**

> **Tullen är 97% av hela dagsvinsten.**

Samma produkt i Norge/UK (ingen tull): TB 205,46 → BE-ROAS 1,601 → netto/annonskrona vid ROAS 2,2 = 0,374 mot 0,189.

> **NO och UK är inte "nästa marknad". De ger 98% mer vinst per annonskrona än Sverige på medianprodukten.** M1:s D3 ("validera alltid i SE, klona vid godkänt T2") är därmed ekonomiskt bakvänd för allt under ~500 kr. Rätt sekvens för billiga produkter: **validera i NO, klona till SE bara om NO håller.**

---

### E10. M3:s hela härledda ekonomiska stack bygger på en COGS-andel som ingen produkt har

**PÅSTÅENDE:** M3 §0: "Implicit COGS 123,35 kr. COGS-andel av omsättning 35,2%. Prismultipel 2,67x." — och därefter produktklassgränserna, kassaspärren B4 och hela tullchockstabellen B6.

**VARFÖR FEL:** Antagandet om en konstant COGS-andel motsägs av katalogens egen BE-ROAS-spridning. Backräknat ur `pris ÷ BE-ROAS`:

| Produkt | Pris / BE | Härledd COGS | **COGS-andel** |
|---|---|---|---|
| LED Arbetslampor 90W | 1799 / 1,23 | 257 kr | **14,3%** |
| Medianprodukt | 329 / 1,85 | 114 kr | 34,6% |
| Marin Motorhölje | 299 / 2,90 | 160 kr | **53,4%** |

Spannet är 14–53%. M3:s 35,2% beskriver ingen faktisk produkt, och den härleddes dessutom ur AOV 350, som i sin tur kom av att dividera **median-TB (189)** med **median-TB-marginal (54%)** — två medianer över olika produkturval. M1 flaggar detta korrekt och väljer 178.

**RÄTT REGEL:** ta bort varje härlett katalogsnitt. Använd `produktens pris ÷ produktens BE-ROAS` ur vinstappen, alltid. Medianerna får förklara modellen och aldrig sätta ett tal.

---

### E11. M3 dubbelräknar tullen i upsell-exemplet och drar därför fel slutsats

**PÅSTÅENDE:** M3 C4: "Vid 15% attach rate av en 299-kronorsprodukt blir AOV 395 kr och TB/order 207 kr → **BE-ROAS stiger från 1,85 till 1,91**, men BE-CPA stiger från 189 till 207. Bedöm bundles på BE-CPA, aldrig på BE-ROAS."

**VARFÖR FEL:** TB-tillskottet 120,50 kr är Marin Motorhölje som **fristående order** — med 27,50 kr tull redan avdraget. Läggs den som en rad i en befintlig order betalas ingen andra tull. M3 drar alltså tullen två gånger på samma order och bygger sedan en "viktig nyans" på en artefakt.

**RÄTT SIFFRA:**

| Upsell-produkt | TB-tillskott vid 15% | Ny TB | Ny AOV | **Ny BE-ROAS** |
|---|---|---|---|---|
| M3:s uträkning | +18,1 | 207 | 395 | 1,91 ↑ |
| Rätt (Marin Motorhölje, tull ej dubblerad) | +22,2 | 211,2 | 395 | **1,87** ≈ oförändrad |
| Rätt (normalmarginal-upsell, t.ex. Herrshorts 71%) | +31,8 | 220,8 | 395 | **1,79 ↓ förbättras** |

**RÄTT REGEL:** M3:s slutsats är fel i sak. Den rätta är enklare och mer användbar:
> **Attacha bara produkter vars TB-marginal ≥ basproduktens. Då förbättras BE-ROAS *och* BE-CPA samtidigt, och du behöver inte välja mätetal.** BE-ROAS försämras bara när du attachar en sämre produkt än den du redan säljer.

---

### E12. AOV-hävstången är underskattad — den slår varje skalningsregel i dokumenten

**PÅSTÅENDE:** M3 rankar upsell först "istället för att skala"; M1 rankar bundle som steg 3 av 4; M2 som steg 2 av 5. Ingen räknar vad den faktiskt är värd i kronor mot alternativet.

**VARFÖR FEL:** Alla tre räknar effekten på BE-ROAS (som knappt rör sig) i stället för på nettovinsten (som exploderar), eftersom tullen är per order och CPA är oförändrad.

**RÄTT SIFFRA.** 4 000 kr/dag, oförändrad annonsbudget, oförändrad CPA, post-purchase-upsell av en 300-kronorsprodukt:

| Attach rate | AOV | TB/order | Effektiv ROAS | **Netto kr/dag** | **Förändring** |
|---|---|---|---|---|---|
| 0% | 329 | 178,0 | 2,20 | 756 | — |
| **10%** | 359 | 195,1 | 2,40 | **1 218** | **+61%** |
| **20%** | 389 | 212,3 | 2,60 | **1 678** | **+122%** |

Jämför med alternativet: att skala +30%/vecka i en månad ger 2,86× spenden — men vid fallande ROAS, med 14 000 kr kassabränning (E5) och risk för rullande reserv (E4).

> **10–20% attach rate ger +61% till +122% nettovinst på noll extra annonskronor, noll extra tull, noll extra rörelsekapital och noll extra risk. Ingen skalningsåtgärd i något av de tre dokumenten kommer i närheten.** Detta ska stå överst i slutdokumentet, inte som "steg 3 när taket nås".

Bundle-brytpunkten stämmer däremot: 2-pack tål max **9,9% rabatt** innan tullvinsten är uppäten (M2:s 9,7% är rätt inom avrundning). Regeln "max 5% rabatt" är korrekt och ska stå kvar.

---

## DEL 5 — RETURER, VALUTA, FASTA KOSTNADER

### E13. Vinstappen hanterar returer rätt — men på fel tidsfönster, vilket är värre

**PÅSTÅENDE:** M1 osäkerhet 1: "Returer och reklamationer saknas helt i underlaget. Vid 5% returgrad faller TB ~5% och varje BE-ROAS är ~5% för låg."

**VARFÖR FEL PÅ TVÅ SÄTT:**

**(a) Returer saknas inte.** `shopify-data.server.ts:176` drar `totalRefundedSet` från `totalSales`, medan `agg.units` (rad 191) och `bucket.orders` (rad 172) förblir **brutto**. Alltså: intäkten minskar men COGS och tull gör det inte — vilket är exakt rätt för dropship, där varan aldrig kommer tillbaka. Appen är korrekt konstruerad här. M1:s premiss är fel.

**(b) Men effekten är dubbelt så stor som M1 tror, och den syns aldrig i beslutsfönstret.** Rätt formel:

> **TB_netto = TB − r × pris**, alltså **BE-ROAS_sann = BE-ROAS ÷ (1 − r × BE-ROAS)**

Vid r = 6% (rimligt för nordisk dropship: 2–4% äkta returer + 2–4% "ej mottagen" på 6–10 arbetsdagars leverans + 0,3–0,8% chargebacks):

| Produkt | BE app | **BE med 6% returer** | Ökning |
|---|---|---|---|
| LED Arbetslampor | 1,23 | 1,33 | +7,4% |
| Medianprodukt | 1,85 | **2,08** | **+12,5%** |
| Magnetfiskesats | 2,30 | 2,66 | +15,6% |
| Marin Motorhölje | 2,90 | **3,51** | **+21,0%** |

Effekten är **inte** ~5% och den är **inte** linjär — den växer kvadratiskt med BE-ROAS och slår alltså hårdast mot precis den halva av katalogen modellerna redan vill chilla.

**(c) Timingfelet, som är det operativa problemet.** En retur på en order lagd dag 0 landar dag 25–60 (leverans dag 8–14, klagomål dag 15–25, återbetalning därefter). Appen bokför den på **orderns dag** och uppdaterar korrekt (`app._index.tsx:107`, "sena returer bokförs på orderns dag"). Men modellerna fattar beslut på **7- och 14-dagarsfönster**, och i ett sådant fönster har **noll till fem procent** av den kohortens returer hunnit landa.

**RÄTT REGEL:**
> **BE-ROAS läses alltid på ett 90-dagarsfönster. ROAS läses på 7/14 dagar och multipliceras med (1 − r) innan den jämförs.** Ett färskt fönster är per konstruktion smickrande, och alla kill-, skal- och chill-trösklar i alla tre modellerna läser just ett färskt fönster.

---

### E14. Valutakostnaden saknar två av tre poster

**PÅSTÅENDE:** M3 B7 modellerar NOK-försvagning. M2 säger "räkna om BE-ROAS per marknad varje månad". M1 D3 punkt 4 likaså.

**VARFÖR FEL:** Alla tre modellerar **intäktssidans** FX och missar de två som faktiskt kostar pengar varje dag:

**(a) Valutakonverteringsavgiften finns inte i appen.** `ShopSettings.feeRate` har default 0,029 — ren kortavgift. Säljer butiken i NOK/DKK/EUR/GBP och utbetalning sker i annan valuta tar Shopify Payments **1,5% (EU) / 2% (utanför EU)** i konverteringsavgift ovanpå. Betalas det ut i lokal valuta och växlas på bank kostar spreaden 1–2%. Antingen vägen: **~1,5–2% obokförd kostnad på 4 av 5 butiker.**

> **RÄTT REGEL: sätt `feeRate` till 0,044 i NO-, DK-, FI- och UK-butikernas Settings.** Effekt på NO-median: BE-ROAS 1,601 → 1,641. Litet, men gratis att rätta och det är en app-inställning som redan finns.

**(b) COGS är USD/CNY-denominerad. Det nämns ingenstans.** En 10% starkare dollar höjer inköpspriset på **alla 119 produkter i alla 5 marknader samtidigt** — okorrelerat med intäktssidans FX och omöjligt att diversifiera bort. Median: COGS 114 → 125,4 → BE-ROAS 1,85 → **1,975 (+6,8%)**. USD/SEK har rört sig över 20% på enskilda år.

**(c) Kombinerad stress, app-basis:** USD +10% **och** returgrad 6% → TB 178 → 146,9 → **BE-ROAS 2,24.** Modellernas arbets-ROAS är 2,2. **Ett normalt dollarår plus normala returer sätter medianprodukten under vattenytan innan momsen ens räknats in.**

**(d) Teknisk detalj:** `fx.server.ts` hämtar `/v1/latest` — dagens kurs — och konverterar historisk annonskostnad med den. Vid `NODFALL_TTL` serveras dessutom en upp till 7 dagar gammal kurs. Under en volatil vecka är det ett par procents fel rakt in i varje ROAS för utlandsbutikerna, tyst.

---

### E15. Fasta kostnader: ingen modell anger ett tal, och formeln svänger 18–61% på försvarbara indata

**PÅSTÅENDE:** M3 B1a: "p ≤ 1 − F/(S×m). Vid m = 0,243, S = 4 000 och F = 600: p ≤ 38%. Vid S = 3 000: p ≤ 18%."

**VARFÖR FEL:** F = 600 kr/dag är en platshållare och m plockas ur luften. Byter man m från 0,243 (ROAS 2,3) till M3:s **eget operativa mål** 2,56 (m = 0,384) blir samma formel `p ≤ 1 − 600/1536 = 61%`. En regel vars utdata rör sig mellan 18% och 61% på indata modellen själv använder på andra ställen är ingen regel.

**RÄTT SIFFRA.** Realistiska fasta kostnader för fem Shopify-butiker + appar + Klaryio + bokföring: **6 000–12 000 kr/mån = 200–400 kr/dag exkl. ägarlön.** Med en blygsam ägarlön på 30 000 kr brutto + arbetsgivaravgifter (31,42%) = 39 400 kr/mån = **1 300 kr/dag**.

Kontrollräkning som borde ha stått först i alla tre dokumenten:

| | 4 000 kr/dag, ROAS 2,2 |
|---|---|
| Vinstappens TB2 | 756 kr/dag = **23 000 kr/mån** |
| − fasta (exkl. lön) | −9 000 kr/mån |
| − creative (batch, E7) | −10 400 kr/mån |
| **= kvar före moms och lön** | **+3 600 kr/mån** |
| − moms (E1, scenario C) | −53 000 kr/mån |
| **= verkligt resultat** | **−49 400 kr/mån** |

> **Vid den spendnivå och den ROAS alla tre modellerna räknar med är butiken kraftigt förlustbringande. Det är därför ingen av dem redovisar en resultaträkning — de stannar alla vid täckningsbidraget.**

**Vad krävs för 50 000 kr/mån verklig vinst?** Vid BE_sann 2,36 (scenario C) och Meta-ROAS 3,0 är nettot 0,271 kr/annonskrona före creative och fast. Efter creative (0,129) → 0,142. Behövs: (50 000 + 9 000 + ägarlön 39 400)/30 ÷ 0,142 = **23 200 kr/dag i annonsspend**, ~700 000 kr/mån omsättning, och **~180 000–250 000 kr i rörelsekapital**. Det är målbilden. Ingen av modellerna anger den, och alla tre skriver regler som om butiken redan vore där.

---

## DEL 6 — MASKERADE TUMREGLER

Genomgång av vilka trösklar som faktiskt är härledda ur butikens siffror och vilka som är importerade.

| Tröskel | Källa | **Dom** |
|---|---|---|
| S1 = 7 × BE-CPA (50 konv/adset/vecka) | Metas dokumenterade learning phase | **Äkta.** Enda mekanismförankrade budgetankaret i materialet |
| TB2 = 1/BE − 1/ROAS | Aritmetik | **Äkta.** Korrekt härledd |
| Tulleffekt, bundle-brytpunkt 9,9% | Butikens egna tal | **Äkta** |
| Kill vid 3 × BE-CPA, e⁻³ = 5% | Poisson, korrekt räknat | **Halvt äkta.** Aritmetiken stämmer, **tolkningen inte.** "5% risk" är ett p-värde under hypotesen att annonsens sanna CPA är *exakt* BE-CPA. Det är inte "95% säkerhet att annonsen är sämre än break-even". Är sanna CPA 1,5 × BE-CPA (en medioker annons du vill iterera på) är P(0 köp) 13,5% |
| **CPM 110 kr** (M1) vs **CPM 85 kr** (M2) | Ingen | **Tumregel.** Två modeller, samma konto, 29% isär. Flyttar M1:s frekvenstak och hela M2:s π-tabell |
| **15 000 kr creative-livslängd** (M1) | Tre omätta antaganden staplade | **Amerikansk byråtumregel.** M1 medger det själv i osäkerhet 2 |
| **EDP 90 000 / 30 000 / 180 000** (M2) | "Backräknat från ett typiskt svenskt e-com-konto" | **Tumregel förklädd till mätning.** Ett påhittat referenskonto backräknas till fyrsiffrig precision (1 111, 815, 627, 518 kr/dag) |
| **Träffkvot 1 av 5 / 1 av 6 / 25%** | Ingen | **Tumregel.** Tre olika tal i tre dokument, styr creative-volymen direkt |
| **UGC 800–2 000 kr** | Ingen | **Amerikanskt pris.** Nordisk verklighet enligt segmenteringens egen batchplan: 4 000–8 000 kr/dag ≈ 900 kr/färdig annons i batch, 2 200 kr styckvis |
| **"25% sämre CPA i inlärning"** (ekonomdomaren) | Ingen | **Tumregel.** Meta publicerar inget sådant tal. Det bär hela E-domarens kritik av M3:s ABO-förbud |
| **Frekvens 2,5 / 2,5 / 2,8** | Ingen | **Tumregel, och tre olika.** Operatörsdomaren fångar detta korrekt |
| **Portföljtak 30% / 25%** | Delvis | M3:s härledning (b) är genuin; M1:s "≈0,2 månaders vinst" är en gissning. M1 medger det |
| **Alla mätfelströsklar (1/√n)** | Fel formel | Standardfelet för en **kvot mellan två fönster** är √(2/n), och 95%-tröskeln 2,77/√n. Operatörsdomaren och ekonomdomaren fångar detta oberoende och har båda rätt |

**Dom:** ungefär **fyra** tal i hela materialet är härledda ur Bäverbutikens verklighet (BE-CPA, TB2-formeln, tulleffekten, bundle-brytpunkten). Resten är antingen aritmetik ovanpå antaganden eller importerade branschtal med svensk avrundning.

---

## DEL 7 — SLUTSATS: VAD SOM MÅSTE HÄNDA I DENNA ORDNING

1. **Avgör momsfrågan (E1) innan en enda annan siffra rörs.** Är momsen inte urräknad ur `breakEvenRoas` är varje tröskel i alla tre dokumenten fel med 27–58%, och hela debatten mellan modellerna är irrelevant. Detta är dag 1, timme 1.

2. **Skilj momsen från kassan fysiskt (E2).** Separat konto, samma dag som utbetalningen landar. Innan detta är gjort får ingen skalningsregel köras, eftersom "fri kassa" är ett meningslöst tal.

3. **Dra 90 dagars returgrad ur Shopify (E13)** och läs om BE-ROAS på ett 90-dagarsfönster, aldrig på 7 eller 14.

4. **Bygg post-purchase-upsell innan en enda budget höjs (E12).** +61% till +122% netto, noll annonskronor, noll kassaflödespåverkan, noll risk. Det är den enda åtgärden i hela materialet där avkastningen är säker.

5. **Sätt `feeRate = 0,044` i NO/DK/FI/UK (E14a)** och lägg in verkliga fasta kostnader i `FixedCost` (E15). Två fält, tio minuter, tar bort två systematiska fel.

6. **Ersätt creative-kadensregeln (E7)** med `budget = 20% av TB2`, och **skär batchplanen från 106 till 5–6 produkter per fönster (E8).**

7. **Sänk tillväxttakten till +14%/vecka (E5)** tills sann ROAS ligger över 2,65, och räkna WC-multipeln per produkt (E3) i stället för en konstant ÷10.

**Det system som just granskats svarar på frågan "hur mycket får jag skala?" med stor precision. Det ställer aldrig frågan "har butiken vinst att skala med?" — och på egna, korrigerade tal är svaret vid arbets-ROAS 2,2 nej.**