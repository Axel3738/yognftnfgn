# SÅGNING: Meta-mekanik i Bäverbutikens skalningssystem

Utgångspunkt: allt är fel tills det räknats om. Jag har räknat om varje mekanisk tröskel. **11 av 22 granskade Meta-påståenden håller inte.** Två av felen är strukturella nog att göra hela systemet obrukbart i drift; de sitter i multimarknadsutrullningen och i attributionsfönstret.

Referensvärden jag räknar på: BE-CPA (median) = 329/1,85 = **178 kr**. Arbets-CPA vid ROAS 2,2 = 329/2,2 = **150 kr**. CPM SE broad = 60–110 kr (jag använder 85). NO/DK/FI-BE-CPA utan tull = 205 kr, arbets-CPA ≈ 170 kr.

---

## A. LEARNING PHASE OCH KONVERTERINGSVOLYM

### A1. PÅSTÅENDE (M1, A1/D1): "S1 = 7 × BE-CPA är exakt learning phase-utgång: 50 konverteringar/adset/vecka."
**HÅLLER — i Sverige, för en produkt, i ett adset.** 50 × 150 kr = 7 500 kr/vecka = **1 071 kr/dag**. M1:s S1 = 1 246 kr/dag ger 58 köp/vecka. Aritmetiken är korrekt och det är materialets enda budgetankare som är härlett ur en verklig plattformsmekanism i stället för en gissad konstant. Det ska överleva.

**Men den håller bara i SE, bara vid median-CPA, och bara om produkten har ett eget adset.** Se A2–A5.

### A2. PÅSTÅENDE (M2 §6.4 + M1 D3 + båda domarna): "Rulla varje SE-vinnare till NO+DK+FI samma vecka. Kostar ~30 kr i översättning. Störst hävstång i hela systemet."
**VARFÖR FEL — detta är systemets enskilt största mekaniska fel.** En klonad marknad är inte en ny publik som ärver optimeringen. Den är:
1. **Ett nytt adset** som börjar om på noll mot 50-konverteringströskeln.
2. **En ny pixel/dataset** (separata Shopify-butiker ⇒ separata dataset). Metas konverteringsmodell för det datasetet har ingen historik. Dataset-kallstart är ett separat och långsammare problem än adset-learning — den kräver hundratals händelser innan modelleringen (som ersätter det ATT tar bort) är användbar.
3. **Ett nytt attributionsfönster som ännu inte mognat.**

Räkna på NO: för att ta EN produkt ur learning i Norge krävs 50 × 170 kr = **8 500 kr/vecka = 1 214 kr/dag på en enda produkt** i en marknad på 3,9 M Meta-användare. M1 föreskriver att man startar klonen på T1 = 2 × BE-CPA = **410 kr/dag → 17 köp/vecka**. Permanent learning limited, från dag ett, för alltid.

**RÄTT REGEL:** Per-produkt-adsets är strukturellt omöjliga i NO/DK/FI/UK. Den enda körbara utländska strukturen är **en pooad kampanj per marknad** (Advantage+ / ett enda brett adset med hela sortimentet), där 50-tröskeln möts på marknadsnivå: 50 ordrar/vecka totalt för hela NO-butiken ≈ **1 100–1 300 kr/dag**. Det är entrébiljetten till en ny marknad — inte 30 kr. Skriv om M2 §6.4 punkt 1 och M1 D3 till: *"En ny marknad kostar ~1 200 kr/dag i minst 4 veckor innan den ger läsbar data. Öppna en marknad i taget, inte fyra samma vecka."*

### A3. PÅSTÅENDE (M1, A1 + A2): "GOLV = BE-CPA ÷ 3 (60 kr/dag). Under detta levererar Meta inte alls — budgeten går till ingenting."
**VARFÖR FEL.** Det finns ingen sådan mekanism. Metas minsta dagsbudget för konverteringsoptimering är valutabunden och ligger långt under 60 kr; ett adset på 60 kr/dag **levererar**, det optimerar bara uselt och sitter i learning limited. Påståendet blandar ihop "dålig leverans" med "ingen leverans" och ger operatören en falsk trygghet i att ett golv på 60 kr är gratis-skydd.

**RÄTT REGEL:** Golv-adsets levererar och kostar pengar. Motivet för ett golv är inte leverans utan att slippa betala om learning-inlärningen — och den kostnaden är enligt ekonom-domarens R5 ~1 875 kr, alltså brytpunkt ~10 dagars paus. Kombinerat: **håll golv bara på säsongsprodukter du startar om inom en månad. Allt annat till 0.**

### A4. PÅSTÅENDE (M3, B3): "Ett konto behöver ~50 konverteringar för att lämna inlärningsfasen. 200 kr/dag håller reservkontot körklart."
**VARFÖR FEL.** *Learning phase är en adset-egenskap, inte en kontoegenskap.* Det finns ingen "kontots inlärningsfas" i Meta. Slutsatsen (håll ett varmt reservkonto) är rätt, men motiveringen är påhittad, och en påhittad mekanism är farlig eftersom den inte går att felsöka mot verkligheten.

**RÄTT MOTIVERING (starkare än den felaktiga):** ett nytt annonskonto har (a) **daglig utgiftsgräns som rampas upp** och betalningströsklar — det kan fysiskt inte absorbera 4 000 kr/dag dag ett, oavsett learning; (b) ett kallt dataset utan konverteringshistorik; (c) ingen granskningshistorik, vilket ger fler creative-avslag. Reservkontot ska hållas varmt för att rampa spendgränsen och bygga datasethistorik — 200 kr/dag är en rimlig siffra av det skälet, inte av 50-konverteringsskälet.

### A5. PÅSTÅENDE (samtliga tre modeller, implicit): optimeringshändelsen är alltid `purchase`.
**VARFÖR FEL — den största missade lever i hela materialet.** Vid BE-CPA 178 kr kan de flesta av de 119 produkterna aldrig nå 50 köp/vecka på realistiska budgetar. Modellerna löser detta genom att antingen (a) kräva orealistiska budgetar (M1 S1), (b) sänka budgeten (M2), eller (c) ignorera problemet (M3). Meta har ett fjärde svar som ingen av dem nämner: **byt optimeringshändelse.**

Räknat med M1:s egen ATC:köp-kvot 4:1: 50 ATC/vecka = 12,5 köp/vecka = 1,8 köp/dag = **≈320 kr/dag**. Alltså: **ett ATC-optimerat adset lämnar learning redan mellan T0 och T1**, där ett köpoptimerat adset kräver S1 (1 250 kr/dag) — en faktor 4 i budgetkrav.

**RÄTT REGEL:** `T0–T2 optimerar Add-to-Cart. S1 och uppåt optimerar Purchase.` Bytet är en *significant edit* och nollställer learning en gång, vilket är rätt pris att betala vid övergången T2→S1. Priset i övrigt är att ATC-optimering köper billigare, sämre trafik — därför ska lönsamheten fortfarande läsas som köp-ROAS ur vinstappen, aldrig som ATC-CPA. Detta gör hela nedre halvan av trappan mekaniskt funktionell för första gången.

### A6. PÅSTÅENDE (M1, A3 regel 1): "0 köp efter 3 × BE-CPA = 95 % säkerhet på att annonsen är sämre än break-even."
**VARFÖR FEL — logisk inversion.** e⁻³ = 4,98 % är P(0 köp | annonsen ligger exakt på break-even). Det är **inte** P(sämre än break-even | 0 köp). Att kasta om dem är en klassisk p-värdesinversion. Slumpen råkar vara förlåtande här (de flesta annonser *är* under break-even, så prioren räddar slutsatsen), men formuleringen lär operatören att läsa statistik fel, och samma fel återkommer i M3:s G2/G3 och M1:s högprisgrind (e⁻⁴·⁷).

**RÄTT FORMULERING:** *"Om annonsen låg på break-even skulle den ha 5 % chans att se ut så här. Det räcker för att sluta betala för den."* Ingen sannolikhetssiffra på slutsatsen.

---

## B. ADVANTAGE+ / ASC VS MANUELLA ADSETS — GÅR STRUKTUREN ATT KÖRA 2026?

### B1. PÅSTÅENDE (M1, D1): "`BAV_SALES_ENGINE` = Advantage+ Shopping-kampanj (ASC)."
**VARFÖR DELVIS FÖRÅLDRAT.** "Advantage+ Shopping Campaign" som separat kampanjobjekt slogs under 2025 ihop med det vanliga Sales-målet till **ett säljmål med en Advantage+-växel på kampanjnivå**. Ett dokument daterat 2026 som instruerar "skapa en ASC-kampanj" beskriver ett UI som inte finns kvar i den formen. Följdfel: M1:s varning *"i ASC styr du inte produktens budget direkt"* var sann för klassisk ASC men är svagare i den sammanslagna flödet, som tillåter mer adset-nivåkontroll.

**RÄTT REGEL:** Skriv container 3 som *"säljkampanj med Advantage+ påslaget, ett adset, hela chill-sortimentet"* och verifiera i kontot vilka reglage som finns innan dokumentet fryses. Namnkonventionens `advplus` i PLACEMENT-fältet (`/home/user/yognftnfgn/docs/naming-convention.md:31`) är däremot **korrekt** — det betyder Advantage+ *placeringar*, vilket är en levande inställning. Blanda inte ihop de två betydelserna i samma dokument; det är exakt den sortens tvetydighet som gör att fel person bygger fel kampanjtyp.

### B2. PÅSTÅENDE (M1, D1): "ENGINE löser learning-problemet: ASC poolar konverteringar över hela katalogen. Kontot behöver bara ~50 köp/vecka totalt ≈ 1 070 kr/dag."
**HÅLLER.** En Advantage+-säljkampanj har i praktiken ett adset. 50-tröskeln gäller per adset. Alltså poolas kravet till kampanjnivå och 1 070 kr/dag i totalspend räcker för att den behållaren ska lämna learning. Detta är materialets mekaniskt starkaste strukturidé och den ska stå kvar. Den är dessutom rätt svar på ATT-problemet: vid låga volymer är en stor andel av Metas rapporterade konverteringar modellerade, och modellering fungerar bättre mot ett stort pooat adset än mot åtta små.

### B3. PÅSTÅENDE (M3, D): "Stäng av CBO/Advantage+ över produkter. Kör ABO med ett adset per produkt — då är produktens budget = portföljvikten."
**VARFÖR FEL.** M3:s egen fastrappa placerar produkterna under learning-tröskeln på varje nivå upp till Fas 4: Fas 1 = 10 köp/v, Fas 2 = 21 köp/v, Fas 3 = 42 köp/v. Kombinerat med B5 (8 produkter samtidigt i prospecting) blir resultatet **åtta permanent learning limited adsets**, och så förbjuds den enda mekanism som löser det.

Var dock ärlig om priset: den ofta citerade siffran "~25 % sämre CPA i learning limited" finns inte publicerad någonstans och ska inte skrivas in i dokumentet som ett tal (operatörsdomarens 34 000 kr/mån är en påhittad konstant × en påhittad konstant). Den verkliga kostnaden för learning limited är **högre varians och långsammare optimering**, inte en fast CPA-straffavgift.

**RÄTT REGEL:** Portföljkontroll och learning-volym är inte i konflikt om man delar sortimentet: **de 2–3 kärnprodukter vars budget faktiskt räknas mot 30 %-taket ligger i egna ABO/CBO-adsets med ≥ 7 × BE-CPA. Allt annat — chill, Klass A, högprisspåret — ligger i EN Advantage+-behållare där budgeten inte behöver styras per produkt.** M1:s fyra behållare gör redan detta; M3:s ABO-förbud ska bort.

### B4. PÅSTÅENDE (M1, D1): "Testa i ABO, skala i CBO, parkera i ASC."
**VARFÖR FEL (halva satsen är en no-op).** CBO (numera Advantage-kampanjbudget) ändrar ingenting för learning phase — **varje adset i en CBO-kampanj behöver fortfarande sina ~50 händelser**. CBO omfördelar bara budget mellan adsets. Och M1:s container 2 specificerar *en kampanj per produkt* med i praktiken ett adset. Ett CBO-adset ensamt i en CBO-kampanj är funktionellt identiskt med ABO.

**RÄTT REGEL:** "Testa i ABO, skala i ABO, poola i Advantage+." CBO tillför något först när du har ≥ 2 vinnaradsets på samma produkt att fördela mellan — alltså tidigast på S3.

### B5. PÅSTÅENDE (M1, D1): ENGINE (Advantage+, container 3) körs parallellt med `BAV_SALES_RETARGET` (DPA, container 4).
**VARFÖR FEL — direkt överlapp som ingen av modellerna nämner.** En Advantage+-säljkampanj innehåller per default både prospecting och befintliga kunder, och Advantage+ katalogannonser (det som ersatt "DPA broad") gör samma jobb som container 4. De två behållarna kommer att jaga samma varma användare, dubbelräkna konverteringar i rapporteringen, och göra M1:s regel *"höj DPA +20 % så länge marginal-ROAS ≥ 2 × BE"* omöjlig att tolka.

**RÄTT REGEL:** Om ENGINE körs som Advantage+ måste **existing-customer-budgetandelen sättas explicit** (annars äter ENGINE upp retargeting-poolen), och container 4 begränsas till en snäv, tidsbegränsad ATC/IC-målgrupp med exkludering av köpare. Annars: slå ihop dem och behåll bara ENGINE.

### B6. PÅSTÅENDE (M1 B5 steg 2, naming-convention `LAL1-purchasers`): "LAL på köpare" som skalningssteg när taket nås.
**VARFÖR FEL vid denna volym.** En lookalike behöver minst 100 källpersoner och fungerar rimligt först vid ~1 000–50 000. Vid 50 ordrar/vecka i SE har butiken ~2 600 köpare per år — en LAL byggd på det är brus. Dessutom: med Advantage+ Audience påslaget (default i säljkampanjer 2026) är målgruppen en **förslagsingång**, inte en avgränsning — leveransen går bred ändå. AUDIENCE-fältet i adset-namnet beskriver alltså i stigande grad något som inte finns.

**RÄTT REGEL:** Stryk LAL som eget skalningssteg. Ordningen i M1 B5 blir: `1) ny marknad (med A2:s riktiga prislapp) → 2) höj AOV/bundle → 3) nästa produkt`. Och dokumentera i namnkonventionen att AUDIENCE numera är en *seed*, inte ett filter, annars kommer trackerns segmentering att ljuga.

---

## C. ANTAL CREATIVES PER ADSET — NÄR SPLITTRAS LEVERANSEN

### C1. PÅSTÅENDE (M1, A3 regel 2): "Max live per adset = min(dagsbudget ÷ BE-CPA, 6). Under 6 kommer varje annons upp i sin läsbarhetsgräns inom ~3 dagar. Över 6 får den 7:e under 10 % av budgeten."
**VARFÖR FEL — och det här felet gör hela kill-gaten okörbar.** Meta fördelar **inte** budget jämnt mellan annonser i ett adset. Leveransen koncentreras på 1–3 annonser inom timmar. Typisk spendfördelning i ett köpoptimerat adset: #1 ≈ 50–65 %, #2 ≈ 20–25 %, #3 ≈ 10–12 %, resten under 5 % vardera. Det är alltså **den fjärde** annonsen som hamnar under 10 %, inte den sjunde.

Räknat mot M1:s egen läsbarhetsgräns (3 × BE-CPA = 534 kr i **egen** spend):

| Nivå | kr/dag | Live | Spend #4–6 | Dagar till läsbarhet |
|---|---|---|---|---|
| T2 | 710 | 5 | ~3 % = 21 kr/dag | **25 dagar** |
| S1 | 1 250 | 6 | ~2 % = 25 kr/dag | **21 dagar** |
| S2 | 2 490 | 6 | ~2 % = 50 kr/dag | 11 dagar |
| M2 §4.3 | 3 000 | 15 | ~1 % = 30 kr/dag | **18 dagar × 8 annonser** |

Samtidigt föreskriver M1 3 nya/vecka på S1 och 5 på S2. Du matar alltså in 3–5 annonser i veckan i ett adset där plats 4–6 tar tre veckor att läsa. **Kön växer obegränsat och 60–70 % av allt producerat material döms aldrig.** M2:s "13–16 live creatives" är fysiskt omöjligt att få signal på — leveransen finns helt enkelt inte.

*(Sifferbiten som håller: 6 annonser per adset stämmer med Metas egen tumregel. Men den regeln finns för att inte splittra leveransen — inte som ett löfte om att alla sex får spend.)*

**RÄTT REGEL — två adsettyper, inte en:**
- **Vinnaradset:** max **3–4** annonser. Förvänta att #1 tar 60 %. Ny annons in bara när en gammal pausas.
- **Testadset, eget och separat:** dagsbudget = **3 × BE-CPA** (534 kr för medianprodukten), max **3** annonser, optimerat på **ATC** (se A5). Vid 60/25/15-fördelning får den svagaste 80 kr/dag → **3 × BE-CPA på 7 dagar**. Det är den enda strukturen där M1:s egen läsbarhetsgräns faktiskt går att uppnå.
- **"Nya per vecka" = 3, aldrig fler**, oavsett vad `dagsbudget ÷ 500` säger. Formeln beskriver hur mycket creative marknaden *tål*; testadsettet beskriver hur mycket du kan *läsa*. Det lägre talet gäller.

### C2. PÅSTÅENDE (M1, C3 punkt 2): "Frys creatives i chill-läge. Varje ny annons återställer leveranssignalen och kastar tillbaka adsetet i inlärning."
**VARFÖR MESTADELS IRRELEVANT.** Att lägga till en annons räknas visserligen som en significant edit — men **du kan inte kastas tillbaka till en fas du aldrig lämnat.** En chill-produkt kör per definition låg budget (M1: ±15 %/vecka på en produkt som inte klarar S1). Vid 300–500 kr/dag och CPA 150 kr är det 14–23 köp/vecka. Adsetet är permanent learning limited. Att "frysa creatives för att skydda inlärningen" skyddar ett tillstånd som inte existerar.

**RÄTT MOTIVERING:** frys creatives i chill för att spara **produktionskapacitet och operatörstid**, inte för att skydda learning. Det är fortfarande rätt handling — men med rätt skäl, annars kommer operatören att tillämpa regeln även där den kostar (t.ex. vägra byta ut en avslagen annons).

### C3. PÅSTÅENDE (implicit i hela systemet + `naming-convention.md` regel 2): "Ändra en variabel i taget så testet blir rent."
**VARFÖR OKÖRBART PÅ META 2026 — två oberoende skäl.**
1. **Advantage+ creative enhancements** (auto-beskärning, musik, textöverlägg, bildexpansion, kommentarsförbättringar) är default påslagna och **modifierar dina creatives per visning och per person**. Två annonser med "en variabel skillnad" i ditt namn är inte två kontrollerade varianter i auktionen.
2. Leveransen är ojämn (C1). Att jämföra annons A (60 % av spenden) mot annons B (4 %) är ingen jämförelse.

**RÄTT REGEL:** (a) **Stäng av alla Advantage+ creative enhancements** i konton där trackern ska betyda något, och dokumentera det som en förutsättning i `naming-convention.md`. (b) Acceptera att rent creative-test på köpnivå är statistiskt omöjligt vid 50 ordrar/vecka — rangordna på uppströmssignal (hook rate, CTR, ATC-frekvens, som redan står i `/home/user/yognftnfgn/docs/playbook.md:17-23`) och använd köp bara som veto. (c) Slå av **auto-apply advertising recommendations** på kontot; annars ändras budgetar och målgrupper bakom ryggen på hela regelverket.

---

## D. FREKVENS OCH MÄTTNAD (SE 8M / NO-DK-FI 4-5M)

### D1. PÅSTÅENDE (M1 C2 villkor 3, M3 signal 4, M2 regel 6): "Chill vid frekvens 7d > 2,5" / "Pausa varje annons vid frekvens 7d ≥ 2,8, ingen diskussion."
**VARFÖR FEL — tröskeln kan aldrig utlösas vid modellernas egna budgetar.** Räkna: S1 = 1 250 kr/dag → 8 750 kr/vecka. Vid CPM 85 kr = **103 000 visningar/vecka**. I bred svensk leverans (Advantage+-placeringar) landar veckoräckvidden på 60 000–75 000 → **frekvens 1,4–1,7**. För att nå frekvens 2,5 på veckobasis i SE behöver du grovt **3 000+ kr/dag på en enskild produkt** — en nivå M1 självt kallar S3 och som ingen produkt i katalogen kommer att nå.

Alltså: M1:s chill-villkor är en AND-grind där villkor 3 aldrig slår in ⇒ **chill-läget är onåbart**, vilket är ordagrant det ägaren bad om. Och M2:s automatpaus vid 2,8 kommer aldrig att avfyras — den ser handlingskraftig ut och gör ingenting.

**RÄTT REGEL:**
- **En tröskel, på adsetnivå, 7 dagar: frekvens ≥ 2,0 = sluta höja budgeten.** Annonsnivåfrekvens är inte stabil nog för en automatregel (leveransen hoppar mellan annonser).
- **Där frekvens faktiskt biter är retargeting, inte prospecting.** Se D3.
- **Mät frekvens på kontonivå per marknad, inte per produkt.** Med 6–8 produkter som alla kör brett i SE är det samma 7 M människor som mättas. Fiskeköparen och båtköparen är samma befolkning. Ingen av de tre modellerna räknar kontonivåfrekvens; det är det tal som faktiskt beskriver mättnad i en 8-miljonersmarknad.

### D2. PÅSTÅENDE (M2, kap. 1–2): "Effektiv leveranspool (EDP) ≈ 90 000 i SE, backräknad ur frekvens via R(I) = P(1 − e^(−I/P)). Mättnadstak = 3 335 × π kr/dag."
**VARFÖR FEL — fel kurvfamilj, och poolen är inte fast.** Två fel staplade på varandra:
1. **Exponentiell/Poisson-räckviddskurva förutsätter att alla i poolen har samma exponeringssannolikhet.** Verkliga räckviddskurvor är tungsvansade (en minoritet ser annonsen många gånger). Att anpassa en exponentialkurva till en enda (frekvens, visningar)-punkt **underskattar poolen systematiskt**, ofta grovt. Metas egna räckvidds- och frekvensverktyg använder inte den kurvan.
2. **I bred leverans är poolen endogen mot budgeten.** Meta vidgar budet när budgeten ökar; "den effektiva leveransfickan" är inte en fysisk konstant som brinner upp, den är en funktion av vad du är villig att betala. M2 modellerar en fast resurs som töms. Det är fel modell för en auktion.

Konsekvens, konkret: M2:s "smal produkt i SE = tak 1 111 kr/dag" skulle innebära att LED Arbetslampor 90W (katalogens bästa produkt, TB-marginal 81 %) kapas vid **250 kr/dag** enligt kapitel 5-tabellen. Ekonom-domaren räknade skillnaden till ~280 000 kr/år på en produkt. Det är rätt storleksordning.

**RÄTT REGEL:** Behåll M2:s *diagnos* ("creative-brist ger sjunkande ROAS") och släng varje kronbelopp den räknar fram. Mättnad **observeras** (frekvens ≥ 2,0 på adset, CPM upp ≥ 20 % mot kontots eget 30-dagarsindex vid oförändrade creatives) — den **härleds inte** ur en gissad pool. Ingen automatisk budgetsänkning får någonsin utlösas av π.

### D3. PÅSTÅENDE (alla tre): "Låt DPA/katalog bära chill-produkterna. Retargeting behöver inte learning phase och håller hög ROAS naturligt." + M1: "Start 10 % av total, +20 %/vecka."
**VARFÖR FEL — retargetingpoolen är för liten och regeln saknar tak.** Räkna på SE: ~50 ordrar/vecka vid ~2–3 % CVR ⇒ 1 700–2 500 sessioner/vecka ⇒ en 14-dagars produktvisningspool på grovt **3 000–6 000 personer**. Vid en acceptabel retargetingfrekvens på ~6/vecka och CPM 85 kr blir taket:

5 000 × 6 = 30 000 visningar/vecka × 85 kr/1000 = 2 550 kr/vecka = **≈360 kr/dag för HELA retargeting-behållaren, alla 119 produkter tillsammans.**

M1:s "+20 % per vecka så länge marginal-ROAS ≥ 2 × BE" spränger det taket på under en månad, varefter frekvensen exploderar. Detta är för övrigt den **enda** plats i systemet där frekvens 2,5–5 faktiskt inträffar — och där finns ingen frekvensregel alls.

Två följdfel: (a) retargeting-ROAS är den mest attributionsinflaterade siffran i kontot; påståendet att Marin Motorhölje (BE 2,90) blir lönsam i DPA är oprövbart och sannolikt falskt inkrementellt. (b) DPA förutsätter **en fungerande produktfeed per butik med `content_id` som matchar pixelns ViewContent/ATC/Purchase-events**. Inget i repot antyder att detta finns för fem butiker × 119 produkter. Utan matchning levererar DPA inte alls.

**RÄTT REGEL:** `Retargetingtak per marknad = (14-dagars produktvisningspool × 6) ÷ 1000 × CPM ÷ 7 kr/dag.` Räkna om den månadsvis ur Shopify-sessioner. Och verifiera feed-matchning (Metas katalog-diagnostik) **innan** en enda chill-produkt flyttas dit.

### D4. PÅSTÅENDE (M1, B4): "Fysiskt marknadstak: nischprodukt ficka ~80 000 i SE × frekvens 4 = 5 030 kr/dag."
**VARFÖR FEL, men åt det ofarliga hållet.** Frekvens 4 per vecka är extrem. Och du kommer aldrig att nå bara 80 000 personer när du lägger 35 200 kr/vecka brett — vid CPM 110 är det 320 000 visningar, vilket i bred svensk leverans ger 145 000–215 000 i räckvidd, alltså frekvens 1,5–2,2. Taket är alltså **2–4× underskattat**. Praktiskt spelar det ingen roll eftersom ingen produkt i katalogen kommer i närheten av 5 000 kr/dag — men behåll inte ett tak vars härledning är fel, för då är den fel även när kontot växer.

### D5. SAKNAS HELT: säsongsvariation i CPM.
Ingen av modellerna nämner att **nordiska CPM:er stiger 30–80 % i november–december**. Detta är inte en detalj här: segmenteringens **november-batch** (MC-handvärmare, kranskydd, plyschtofflor, vinterförvaring) lanseras exakt i det dyraste auktionsfönstret. Varje kronbelopp i modellerna — läsbarhetsgräns, creative-livslängd (M1:s 15 000 kr), mättnadstak, testbudget — är CPM-beroende och alltså 30–80 % fel i Q4.

**RÄTT REGEL:** Uttryck läsbarhets- och kill-gränser i **visningar och köp**, inte i kronor, där det går. Där kronor måste användas: multiplicera med kontots faktiska CPM-index (rullande 30 dagar mot årsmedian) i november–december.

---

## E. BUDGETHÖJNINGAR OCH LEARNING-RESET

### E1. PÅSTÅENDE (M1, D4): "Meta återställer learning phase vid ändringar över ~20 %. Max en budgetändring per produkt per vecka."
**VARFÖR FEL — 20 %-regeln är folklore, inte plattformsdokumentation.** Metas dokumenterade *significant edits* är: målgrupp, creative, optimeringshändelse, placeringar, budstrategi/budbelopp, samt tillägg av ny annons. Budgetändringar beskrivs som potentiellt signifikanta **när de är stora** — det finns ingen publicerad 20 %-tröskel. Att skriva in ett påhittat tal som en plattformsmekanism gör att operatören inte kan felsöka mot verkligheten när regeln inte stämmer.

**Och viktigare: reset-rädslan är i huvudsak irrelevant för den här butiken.** Vid BE-CPA 178 kr och realistiska per-produktbudgetar sitter merparten av adseten permanent i learning limited. **Du kan inte falla tillbaka in i en fas du aldrig lämnat.** Systemet ägnar tre dokument åt ritualer som skyddar ett tillstånd som inte existerar för 100+ av 119 produkter.

**RÄTT REGEL:**
- Adset i learning limited (< 50 köp/vecka): **höj så mycket och så ofta du vill** — det finns ingen inlärning att bränna. Begränsningen är mätbarhet, inte plattformen.
- Adset ute ur learning (≥ 50 köp/vecka, alltså S1+): **max +50 % per steg**, och gör ändringen vid dygnets början (en höjning mitt på dagen tvingar omfördelning av resterande budget på färre timmar och spikar CPA för den dagen).
- På kampanjbudget (CBO/Advantage+) absorberas höjningar bättre än på adsetbudget — ännu ett skäl att chill/högpris ligger i ENGINE.

### E2. PÅSTÅENDE (M3, C2 + operativt kort): "Höj 25 %. Håll 3–4 dagar. Jämför 7-dagars ROAS. Fall > 1 % → sluta skala."
**VARFÖR FEL — och detta är det farligaste enskilda felet i hela materialet, av en anledning som ingen av de två domarna fångade.** Domarna såg brusproblemet (1 % kräver ~8 300 ordrar). Det mekaniska felet är värre och systematiskt:

**Med 7-dagars klickattribution mognar ett ROAS-fönster i efterhand.** Gårdagens ROAS fortsätter stiga i sju dagar. Att jämföra ett *nyss avslutat* 7-dagarsfönster med ett *moget* föregående fönster jämför en omogen siffra med en mogen. För en övervägd outdoor-produkt konverterar grovt 60–75 % inom ett dygn efter sista klick och 85–90 % inom tre dagar — så en avläsning efter 3–4 dagar underrapporterar med **10–25 %**.

Effekten är inte brus. Den är **partisk i en riktning**: varje skalningsförsök kommer att visa ett ROAS-fall, varje marginaltest kommer att "underkännas", och systemets egen logik ("två underkända i rad = CHILL") kommer att flytta **varje produkt i katalogen till chill inom cirka sex veckor**. Systemet skulle stänga ner sig självt och operatören skulle dra slutsatsen att marknaden är mättad.

**RÄTT REGEL — tre delar, alla obligatoriska:**
1. **Uteslut alltid de senaste 7 dagarna** vid varje jämförelse av två ROAS-fönster. Jämför dag −21..−14 mot dag −14..−7. Aldrig ett fönster som slutar idag.
2. **Höj +50 %, håll 14 dagar orört, jämför 14d mot 14d** (mogna fönster). Läsbart fall vid ~100 ordrar/fönster är ~25 % — acceptera att du testar "är detta en katastrof", inte "är sista kronan exakt break-even".
3. **Diagnostisera mättnad på frekvens och CPM, inte på ROAS.** Frekvens och CPM mäts på 10⁵ visningar och är i praktiken brusfria; ROAS mäts på 20–60 ordrar och är det inte. Rätt ordning: **frekvens/CPM signalerar (precist) → ROAS bekräftar över 14 dagar (grovt) → agera.**

### E3. SAKNAS HELT — den mekaniskt korrekta lösningen på hela skalningsproblemet: **cost cap.**
Alla tre modellerna kör implicit highest-volume-bud och försöker sedan styra CPA för hand med veckovisa budgetsteg och statistiskt oläsbara ROAS-deltan. Meta har ett reglage som gör exakt det de försöker approximera: **cost cap** (kostnadsgräns per resultat).

Butiken har en unikt bra förutsättning för det: **BE-CPA finns redan per produkt i vinstappen**, och spannet är 64–1 586 kr. Ett cost cap på ~0,85 × BE-CPA säger till Meta att inte köpa den dyra svansen — vilket är hela poängen med marginal-ROAS-testet, fast utfört av budgivningen i realtid i stället för av en människa på måndagar med för lite data.

Priset ska sägas rakt ut: cost cap underlevererar (adsetet spenderar inte hela budgeten), gör learning trögare, och kan strypa leveransen helt om taket sätts för lågt. Så det hör hemma på **S1 och uppåt**, inte i test.

**RÄTT REGEL:** `T0–T2: highest volume (lowest cost), ATC-optimerat. S1+: byt till cost cap = 0,85 × BE-CPA, purchase-optimerat. Höj taket i steg om 10 % om leveransen stryps.` Detta ersätter merparten av M1 B1, hela M3 C2 och hela M2 kapitel 6.3.

---

## F. MÄT- OCH SIGNALMEKANIK SOM SAKNAS HELT

### F1. SAKNAS: Conversions API och event match quality.
Ingen av de tre modellerna nämner CAPI, händelsematchningskvalitet eller deduplicering. För en butik som per definition är signalsvält (5 dataset, 20–60 ordrar/vecka och marknad, ATT-bortfall) är **förbättrad matchningskvalitet en större hävstång än varje budgetregel i alla tre dokumenten tillsammans**. Skillnaden mellan enbart webbläsarpixel och pixel + CAPI med god matchning är den enda insatsen som förbättrar *både* optimering *och* attribution samtidigt, för alla 119 produkter, i alla fem marknader, en gång.

**RÄTT PRIORITERING:** CAPI/EMQ-kontrollen ska stå **före** hela spendtrappan i dokumentet. Kontrollera matchningskvalitet per dataset i Metas Events Manager innan en enda tröskel kalibreras.

### F2. PÅSTÅENDE (repo-konventionerna, punkt 13): "En ROAS läst rakt i Ads Manager för en utländsk butik är inte jämförbar med BE-ROAS ur PNL, eftersom kontot betalar i SEK men intäkten är i NOK/EUR/GBP/DKK."
**VARFÖR DELVIS FEL — rätt slutsats, fel mekanism.** Pixeln skickar `value` **och** `currency`. Meta konverterar köpvärdet till annonskontots valuta med egen växelkurs för rapportering. Ads Manager-ROAS för NO-butiken är alltså i princip valutakorrekt — **förutsatt att `currency`-parametern faktiskt skickas rätt.** Gör den inte det (vanligt fel vid butikskloning) tolkas 990 NOK som 990 SEK och ROAS blir fel med hela växelkursfaktorn.

**RÄTT REGEL:** Skälet att läsa ROAS ur PNL är attribution (Meta överrapporterar, modellerade konverteringar, 7d-klick), **inte** valuta. Men lägg in en engångskontroll: verifiera i Events Manager att Purchase-eventet från varje klonbutik skickar rätt `currency`. Det är en tio-minuters kontroll som annars ger fyra butiker med systematiskt fel ROAS för alltid.

### F3. PÅSTÅENDE (repo-konventionerna 2f): "Pipelinen är hårdlåst till 4:5 (`pipeline/brand.mjs`: CANVAS = { w: 1080, h: 1350 }). Håll längd/ratio utanför namnet."
**VARFÖR FEL som produktionsbeslut.** Reels och Stories står för en stor och växande andel av leveransen i Norden. 4:5-material i 9:16-placeringar beskärs eller får letterbox — det presterar sämre och Meta prioriterar det lägre. En creative-bank som bara finns i 4:5 utestänger systematiskt den **billigaste** inventarien, vilket i sin tur gör alla CPM-antaganden i alla tre modellerna (som förutsätter breda placeringar) för optimistiska.

**RÄTT REGEL:** Varje UGC-råklipp levereras i **9:16 som master**, med 4:5 och 1:1 som beskurna derivat. Det ska stå i kreatörsbriefen, inte i namnkonventionen. (Att hålla ratio utanför annonsnamnet är däremot rätt — det hör hemma som trackerkolumn.)

---

## G. SAMMANFATTNING: VAD SOM HÅLLER

Kort, för balansens skull — dessa sex ska överleva sammanslagningen oförändrade:

1. **S1 = 7 × BE-CPA ↔ 50 konverteringar/vecka** (M1 A1). Korrekt aritmetik, korrekt mekanism, enda budgetankaret i materialet som inte är en gissning. Gäller SE, per produkt, per adset.
2. **Advantage+-behållaren poolar 50-kravet till ett adset** (M1 D1/B2). Mekaniskt korrekt och rätt svar även på ATT-brusproblemet.
3. **Högprisspåret bor i den pooade behållaren** (M1 A6). En produkt med BE-CPA 1 462 kr kan aldrig bära ett eget adset. Rätt slutsats. *(Men skriv gränsen som formeln `pris ≤ S_max × 7R ÷ 50`, inte som en fast lista på 16 produkter — operatörsdomarens R5 har rätt.)*
4. **"Splittra inte en S1-budget på två adsets"** (M1 A3 regel 3). Korrekt — båda halvorna fastnar i learning.
5. **Läs vinst ur PNL, aldrig ur Ads Manager** — korrekt för lönsamhetsbeslut. Men komplettera: **leveransbeslut (frekvens, CPM, hook rate, ATC) måste läsas i Meta**, PNL kan inte se dem.
6. **`EJ AVLÄST` som eget verdict** (M1 D2). Nödvändigt och rätt. Döp om det till **`EJ LEVERERAD`** — orsaken är nästan alltid att Meta valde bort annonsen, inte att du inte hann läsa den. Och notera i playbooken att utebliven leverans **är** en dom: algoritmen har rankat annonsen på tidiga engagemangssignaler. Att pausa den manuellt tillför ingenting.

---

## H. DE FEM ÄNDRINGAR SOM MÅSTE IN INNAN NÅGON KÖR DOKUMENTET

Rangordnade efter hur mycket skada de förhindrar:

1. **Uteslut alltid de senaste 7 dagarna vid varje ROAS-jämförelse** (E2). Utan detta partiskhetsfixet kommer systemet att chilla hela katalogen inom sex veckor och operatören kommer att tro att marknaden är mättad.
2. **Per-produkt-adsets bara i SE. NO/DK/FI/UK = en pooad Advantage+-kampanj per marknad, entrébiljett ~1 200 kr/dag** (A2). Marknadsutrullningen är materialets största påstådda hävstång och som specificerad är den en fabrik för learning-limited adsets.
3. **Separat testadset: 3 × BE-CPA/dag, max 3 annonser, ATC-optimerat** (C1 + A5). Detta är den enda strukturen där modellernas egen kill-gate faktiskt går att exekvera, och det gör hela T0–T2 mekaniskt funktionellt.
4. **Cost cap = 0,85 × BE-CPA från S1 och uppåt** (E3). Ersätter tre olika statistiskt oläsbara marginal-ROAS-tester med ett reglage som gör samma sak i realtid.
5. **Stäng av Advantage+ creative enhancements och auto-apply recommendations; verifiera CAPI/EMQ och `currency` per dataset** (C3, F1, F2). Fyra kontroller, kanske två timmar totalt. Utan dem betyder ingenting i `ad-tracker.md` det man tror att det betyder.

**Relevanta filer:** `/home/user/yognftnfgn/docs/naming-convention.md` (rad 31 — `advplus` som PLACEMENT är korrekt och ska inte ändras; AUDIENCE-fältet på rad 28 behöver en not om att Advantage+ Audience gör det till en seed), `/home/user/yognftnfgn/docs/playbook.md` (rad 17–23 — benchmarktabellen är rätt plats för hook rate/CTR-gates och saknar 3s-views/ThruPlay/hold rate), `/home/user/yognftnfgn/docs/ad-tracker.md` (behöver attributionsfönster överst, plus kolumnerna optimeringshändelse och budstrategi — utan dem går inga två rader att jämföra).