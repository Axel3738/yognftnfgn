# Creative DNA — Damasker Vandring

## Uppdatering 2026-09-08 (`/cs`-feedbackloop, körning nr 3, `/rond-auto`: "3 dagar sedan senaste batchen")

Kampanj kontrollerad ACTIVE (dagsbudget-fältet inte rört av denna körning).
Hela kampanjen omhämtad (`date_preset: maximum`, ad-nivå, sorterad på spend).
Lifetime nu: **10 998,53 kr spend, 53 köp, kampanj-ROAS ≈2,47, totalt
vinstbidrag ≈+5 997 kr** (BE-ROAS 1,60). Datakvalitet ren: `amount_spent ×
purchase_roas` matchar `omni_purchase_values` inom rundningsfel på alla rader
med köp (PD_1, SP_2, SP_3, PD_2_1, PD_3) — inget nytt 100×-fel.

**⚠️ VIKTIG RÄTTELSE — SP_2:s "bekräftat lönsam"-dom från 2026-09-05 höll
inte.** Den var uttryckligen märkt preliminär (ANALYSMETOD steg 2c, endast 4
köp) och skulle överleva denna körning för att skrivas in i Winning DNA. Den
gjorde inte det: SP_2 fick 216,50 kr mer spend (847,74 → 1 064,24 kr) utan en
enda ny köp — samma 4 köp som förut. ROAS föll från 1,84 till **1,46 — under
break-even 1,60.** Vinstbidrag nu **−92 kr** (var +127 kr). Detta är precis
det regressionsmönster ANALYSMETOD steg 5 varnar för: tidig framgång på låg
spend regredierar när algoritmen ger den mer trafik. SP-vinkeln flyttas
tillbaka till Losing/rotorsaker nedan — INTE bevisad lönsam.

**PD_1 fortsätter dominera obestritt.** Nu 46 köp (var 34), CPA 184,98 kr,
ROAS 2,88, 8 509,16 kr spend (77,4 % av kampanjens spend). Vinstbidrag
≈+6 785 kr — **mer än 100 % av kampanjens totala vinst** (samma mönster som
tidigare körningar, nu på fyra på varandra följande avläsningar).

**PD_2 (identisk copy som PD_1, annan annons) fortsätter växa negativt utan
köp:** 464,72 kr spend, fortfarande 0 köp (var 369,25 kr/0 köp 2026-09-05).
Identisk copy garanterar alltså INTE identiskt utfall — stärker hypotesen att
placering/adset-tilldelning, inte bara creativen, avgör utfallet (se mönster
3 i teardownet).

**Batch #3:s briefer (2026-09-05) — produktionsflaskhalsen är nu bekräftad
tredje gången:** endast `Damasker_SP_4_H1` har launchats i Meta (15,06 kr
spend, 0 köp — långt under signifikansgrinden, ingen dom möjlig på
specificitets-hypotesen ännu). `PD_8_H1`, `FO_1_H1`, `ID_1_1`, `BOF_4_1`,
`BOF_5_1`, `BOF_6_1` syns fortfarande INTE i kontot 3 dagar efter leverans.
Samma mönster som batch #2 (18 briefer, fortfarande olaunchade vid
2026-09-05-avläsningen). Flaggas till Axel/managern igen — detta är nu den
faktiska flaskhalsen, inte briefkvoten.

**Recension-koll omkörd** (WebFetch, 2026-09-08): fortsatt "No reviews" —
ingen review-static byggd denna runda heller, tredje gången samma slutsats.

**Konkurrentbevakning omkörd** (Ad Library, 2026-09-08): fortfarande bara
kontots egna 3 annonser på "damasker vandring" i Sverige — obevakad nisch,
oförändrat sedan 2026-09-02.

**Batch #4 levererad denna körning** (7 briefer: 3 video + 1 bild i rundan +
3 BOF-bilder, 0 review). Se `batch-log.md` för fullständig tabell och
hypoteser, och creative-teardownet nedan för de 3 nya mönstren som styr den.

---

## Uppdatering 2026-09-05 (`/cs`-feedbackloop, körning nr 2)
Kampanjen omhämtad (`date_preset: maximum`, sorterad på spend). Lifetime nu:
7 570 kr spend, 40 köp, ROAS 2,71 (kampanjnivå), dagsbudget oförändrad 1 200 kr.

- **PD_1 är inte längre en preliminär dom.** 34 köp (var 14), CPA 161 kr, ROAS
  3,32, 5 478,87 kr spend (72 % av kampanjen). Bär >100 % av kampanjens
  vinstbidrag ensam — resten av kontot är fortsatt netto-förlust. **PD
  (demo/problem)-vinkeln flyttas härmed till bevisad, inte preliminär.**
- **SP_2 passerade signifikansgrinden för första gången** (847,74 kr, 4 köp,
  ROAS 1,84 — lönsam, över BE-ROAS 1,60 men under target). Detta **nyanserar**
  (ersätter inte helt) förra körningens hypotes om att SP:s vaga påstående
  gjorde vinkeln svag: SP är nu en bekräftad men svagare presterare, inte en
  förlorare. Se `batch-log.md` 2026-09-05 för isoleringstestet
  (`Damasker_SP_4_H1`) som testar om specificitet förklarar skillnaden.
- **PD_2 (samma copy som PD_1) har 369 kr spend men 0 köp** — under
  köpgränsen för en dom, men värt att bevaka: identisk copy garanterar inte
  identiskt utfall (kan bero på placering/tajming, inte creativen).
- **Batch #2:s 18 briefer (2026-09-02) är fortfarande olaunchade i Meta** 3
  dagar efter leverans — 9 video står i Notion-status `Creative strat review`,
  9 bilder i `Draft`. Ingen ny creative-teardown möjlig på dem denna körning.
- Recension-koll omkörd (WebFetch, 2026-09-05): fortsatt "No reviews" —
  samma slutsats som 2026-09-02, ingen review-static byggd.

Skapad 2026-09-02 av `/forsta-batch` (körning nr 1, flaggad av `agent/rond.mjs`
som `forsta_batch`-behov samma dag). Datakälla: MagiBorsten `1867947880635861`,
kampanj `120250009391470291` ("Damasker Vandring | BE ROAS 1.60 | Launch
2026-08-29"), livstid 2026-08-29 → 2026-09-02 (`date_preset: maximum`).

## Produktfakta (verifierade mot Shopify 2026-09-02)
- **Damasker Vandring – Håller Snö, Väta & Grus Ute**
  (`damasker-vandring-haller-sno-vata-grus-ute`), Bäverbutiken.
- **Pris 389 kr, jämförpris 649 kr — verifierat äkta i Shopify
  (`compareAtPrice` satt på alla 18 färgvarianter).** Spara 260 kr (40,06 %,
  avrundas "40 %"). Till skillnad från Kranskydd Frost 420D:s falska
  "23 % rabatt" är CS-vinkelns "40% RABATT"-påstående i kontots befintliga
  annons (`Damasker_CS_1`) **korrekt** — ingen BLOCKER här.
- Mått 44 cm högt skydd, 43 cm omkrets, en storlek som justeras efter benet,
  100 % polyester. Fäste: krok i snörningen, rem under foten, kardborre runt
  benet. 18 färger (gul, neongrön, orange, svart, grå, marinblå, blå, ljusblå,
  röd, lila, rosa, brun, vit, olivgrön, kamouflage grön/svart, blå/neongrön,
  cerise/neongrön).
- 30 dagars öppet köp, Klarna. Fri frakt-tröskeln (>300 kr sitewide, verifierad
  i andra produkters dna-filer) gäller — 389 kr kvalar.
- ⚠️ **`totalInventory: 0` och FLERA färgvarianter negativa i Shopify**
  (t.ex. orange -14, röd -8, gul -3) — oversåld på flera färger samtidigt.
  Inte en creative-fråga, men en leveransrisk — flaggas till Axel, rörs inte
  här.
- Break-even-ROAS **1,60×** (ur kampanjnamnet). Break-even-CPA (enstyck)
  389/1,60 ≈ **243 kr**. Shopify-korskoll (60 dagar): 18 ordrar, 12 059 kr
  gross sales → AOV ≈ 670 kr, klart över styckpriset 389 kr — de flesta
  ordrar innehåller fler än ett par eller ett tillägg. Använd ROAS 1,60
  direkt för kill-beslut (AOV-oberoende, ANALYSMETOD steg 3), inte
  enstycks-CPA:n.

## Datakvalitet
16 köp i Meta (livstid), 18 ordrar i Shopify på produkten senaste 60 dagarna
— normal attributionsskillnad, inget datafel. `amount_spent × purchase_roas`
använd genomgående (inte `omni_purchase_values`, känd 100×-bugg på andra
produkter). Ad Library-sök ("damasker vandring", "benskydd vandring",
"gamacher") gav 0 konkurrenter i Sverige — bara kontots egna 3 annonser kom
upp på "damasker vandring". Nischen verkar obevakad.

⚠️ **Två recensionskällor hittade i Drive — INGEN är verifierad riktig:**
1. `Damasker Vandring_REVIEW` (Google Sheet, Joshs produktmapp): ett
   Judge.me-bulkimport-schema (`title,body,rating,review_date,reviewer_name,
   reviewer_email,product_id,product_handle,reply,picture_urls`) med endast
   `title`, `body` och `reviewer_name` ifyllda — **rating, datum, e-post,
   product_id är tomma.** Ett ofärdigt, aldrig importerat utkast.
2. `Damasker Vandring_SP_2_1.png` (samma mapp): en bild med ett inbränt citat
   ("Helt torra strumpor... Verifierad kund, 47 år — Pocekova") och Google
   Vision-etiketter som "Rain pants, Wellington boot, Gore-Tex" — mönstret
   matchar en TEMU-leverantörs marknadsföringsbild, inte en riktig
   Bäverbutiken-kund (produkten är sourcad från TEMU, SKU-prefix
   `TEMU-601101617191068`).

**Live-kontroll 2026-09-02 (WebFetch av produktsidan): "No reviews".** Ingen
recension är publicerad. **Båda Drive-filerna är därför flaggade som
opålitliga och har INTE använts som källa till någon rad i denna batch** —
i stället för en påhittad/overifierad testimonial-static byggdes
`Damasker_HL_1_1`: ett tydligt märkt "PRODUKTLÖFTET" (inte ett kundcitat).
**Om Axel kan bekräfta att recensionerna i sheetet är riktiga och importera
dem till Judge.me: nästa batch kan bygga en äkta review-static.**

## Siffrorna 2026-09-08 (bedömbara annonser, ≥300 kr + ≥3 köp; BE-ROAS 1,60)

| Annons | Format | Vinkel | Spend | Andel spend | Köp | CPA | ROAS | **Vinstbidrag*** | Andel vinst |
|---|---|---|---|---|---|---|---|---|---|
| **Damasker_PD_1** (benchmark/top spender) | video | demo/problem | 8 509,16 kr | 77,4 % | **46** | 184,98 kr | **2,88** | **≈+6 785 kr** | ≈113 % |
| Damasker_SP_2 | video | social proof/testimonial | 1 064,24 kr | 9,7 % | 4 | 266,06 kr | **1,46** | **−92 kr** | ≈−2 % |

*Vinstbidrag = intäkt/1,60 − spend (ROAS-baserad, AOV-oberoende — se
ANALYSMETOD steg 4). Kampanjens totala vinstbidrag är **≈+5 997 kr**; PD_1
ensam bidrar med ≈6 785 kr — **mer än 100 % av kampanjens totala vinst för
fjärde avläsningen i rad**, vilket betyder att resten av kontot är en
nettoförlust som PD_1 täcker upp för. PD_1 bär 46 av 53 köp (87 %).

**⚠️ SP_2 gick UNDER break-even sedan förra avläsningen** (var ROAS 1,84/+127
kr på 847,74 kr spend 2026-09-05). Den preliminära domen "bekräftat lönsam"
höll inte — se rättelsen högst upp i filen. Bytt hög: SP_2 räknas nu som
bedömbar men OLÖNSAM, inte längre preliminärt lönsam.

**För tidigt (ingen dom, redovisas ändå för mönstret):**

| Annons | Format | Vinkel | Spend | Köp | ROAS | Vinstbidrag | Kommentar |
|---|---|---|---|---|---|---|---|
| Damasker_PD_2 | video | demo/problem (samma copy som PD_1) | 464,72 kr | 0 | – | −465 kr | Växer negativt utan köp, samma copy som vinnaren — se mönster 3 |
| Damasker_SP_3 | video | social proof/testimonial (samma copy) | 405,34 kr | 1 | 0,96 | −162 kr | Samma svaghet som SP_2 |
| Damasker_PD_2_1 | video | demo/problem | 198,85 kr | 1 | 1,96 | +44 kr | Under tröskeln (<300 kr) |
| Damasker_SP_1 | video | social proof/testimonial | 105,85 kr | 0 | – | −106 kr | CBO-svält |
| Damasker_CS_1 | video | äkta rabatt 40 % | 100,49 kr | 0 | – | −100 kr | CBO-svält |
| Damasker_PD_3 | video | demo/problem | 62,89 kr | 1 | 6,19 | +180 kr | För lite spend för dom |
| Damasker_SP_4_H1 (batch #3) | video | social proof, specificitetstest | 15,06 kr | 0 | – | −15 kr | Precis launchad, ingen dom möjlig |
| Damasker_G_2_1, SP_2_1, CS_2_1/3/2, G_3/2/1 | – | – | 0,35–27,71 kr vardera | 0 | – | – | CBO-svält, aldrig fått en chans (≈63 kr totalt) |

## Creative-teardown 2026-09-08 (variabeltabell, ANALYSMETOD steg 6b)

Ingen ny bedömbar annons denna körning (PD_1 och SP_2 var redan granskade
2026-09-05) — teardownet nedan bygger på den bekräftade regressionen och
PD_2:s nollresultat, som är NY data denna körning.

| Variabelvärde | Antal annonser | Total spend | Vinstbidrag | Slutsats |
|---|---|---|---|---|
| Proof: konkreta verifierbara fakta (PD:s 4 punkter) | 1 (PD_1) | 8 509 kr | +6 785 kr | **Bevisad** (46 köp) — bär mer än hela kampanjens vinst |
| Proof: vagt/obestyrkt påstående ("älskade av tusentals vandrare", SP) | 2 (SP_2, SP_3) | 1 470 kr | −254 kr | **Bevisad** (SP_2 4 köp, regredierade under break-even när spend ökade) — vagt proof konverterar inte i skala |
| Identisk copy, ny annons-instans (PD_2 = PD_1:s manus, ny placering) | 1 (PD_2) | 465 kr | −465 kr | **Hypotes** (0 köp, under köpgränsen) — creativen förklarar inte hela utfallet, sannolikt placering/adset-tilldelning |

**Tre mönster, översatta till brief-instruktioner:**
1. **Bevisad — konkreta fakta slår vagt proof i skala.** PD_1:s fyra fakta
   (46 köp) mot SP:s vaga påstående (SP_2 nu −92 kr efter regression).
   → Instruktion: `Damasker_SP_5_H1` (denna batch) behåller SP:s
   testimonial-format men byter det vaga påståendet mot PD:s verifierbara
   fakta — isolerar om PROOF eller FORMAT var SP:s svaghet.
2. **Bevisad — domar på 3–4 köp regredierar och ska inte skrivas in som
   bevisade förrän de överlever en andra avläsning** (ANALYSMETOD steg 2c,
   2/5). SP_2 är levande bevis: +127 kr → −92 kr på 216 kr mer spend, 0 nya
   köp. → Instruktion: ingen ny annons byggd på en enda preliminär avläsning
   framöver utan att vänta på bekräftelse.
3. **Hypotes — samma copy i en annan annons/adset ger inte samma utfall**
   (PD_2: 0 köp på 465 kr, identisk copy som PD_1). → Instruktion: vid
   iteration på PD_1, ändra alltid minst en synlig variabel (hook-typ,
   talare) i stället för att klona rakt av — annars går det inte att skilja
   creative-effekt från serveringseffekt. `PD_9_H1` (hook-typ) och `PD_10_H1`
   (talare) i denna batch isolerar just detta, en variabel i taget.

## Winning DNA
1. **PD (demo/problem)-vinkeln är produktens bevisade angle** — inte SP
   (social proof), vilket är motsatsen till mönstret hos Kranskydd Frost
   420D (där SP vann). **Varje produkt har sin egen vinnare — vinklar
   överförs inte automatiskt mellan produkter.** PD_1: öppningsfråga
   ("Trött på snö, väta och grus i skorna?") + 4 konkreta ✅-punkter +
   SHOP_NOW. 14 köp, CPA 154 kr, 62,8 % av spenden, bär hela kampanjens
   vinst.
2. **PD har lägst CPM i kontot (107 kr) mot 150–252 kr för SP** — algoritmen
   hittar tydligen en billigare, bredare publik på PD:s copy än på SP:s.
3. **Konkreta specifikationer slår vag social proof.** PD:s fyra punkter är
   verifierbara fakta (håller snö ute, stoppar regn, skyddar mot grus,
   10 sekunders montering). SP:s "Älskade av tusentals vandrare" är ett
   opreciserat påstående som inte klarar tre-frågorstestets
   falsifierbarhets-fråga lika bra — matchar den svagare ROAS:en.

## Losing/rotorsaker
- **SP (social proof/testimonial) är BEVISAD svagare än PD, inte längre en
  öppen fråga.** 2026-09-05 passerade SP_2 signifikansgrinden preliminärt
  (4 köp, ROAS 1,84, +127 kr) — men den domen var uttryckligen preliminär
  (ANALYSMETOD steg 2c) och höll inte: 2026-09-08 hade SP_2 fått 216 kr mer
  spend utan en enda ny köp, ROAS föll till 1,46 — under break-even 1,60,
  vinstbidrag −92 kr. Hypotesen om att "tusentals vandrare"-påståendet är
  ospecificerat och obestyrkt (ingen riktig recension finns att luta det
  emot) står kvar och är nu bevisad av regressionen, inte bara en gissning.
  Isolerad variabel som testas nu: `Damasker_SP_5_H1` (denna batch) byter
  det vaga social-proof-löftet mot PD:s verifierbara fakta i SP:s
  testimonial-format — svarar på om PROOF eller FORMAT var SP:s svaghet.
  `Damasker_HL_1_1` (batch #2, ej launchad ännu) gör samma sak som static.
- **G (gåva/present) fick i praktiken ingen spend** (4 annonser, ≈14 kr av
  3 440 kr totalt). För lite data för att döma copyn — matchar mer troligt
  samma CBO-svält-mönster som setts hos andra produkter (Kranskydd, IBC)
  än ett angle-problem. Till skillnad från Kranskydds rena julvinkel är
  G-copyn här redan bredare ("jul, födelsedag eller bara en tanke") — inte
  lika säsongskänslig, så ingen paus rekommenderas, bara mer spend nästa
  runda om budget tillåter.
- **CS (rabatt) är INTE en BLOCKER här** (till skillnad från Kranskydd och
  Bälteslipmaskinen) — 40 %-påståendet stämmer exakt mot Shopifys
  `compareAtPrice`. Bara för lite spend (44 kr) för att döma. Nästa
  iteration (`Damasker_CS_4_H1`/`_CS_5_1` i denna batch) visar matematiken
  visuellt i stället för att bara påstå procenten.

## Behåll alltid / Testa kontrollerat / Undvik / Obevisat
- **Behåll:** PD:s fyra konkreta ✅-punkter (snö/regn/grus/10 sekunder) ·
  389 kr / jämförpris 649 kr exakt, aldrig andra tal · 30 dagars öppet köp
  som garantirad · SHOP_NOW.
- **Testa kontrollerat:** PD:s fakta i nya format (demo, before/after,
  jämförelse mot dyra kängor) och nya mekanismer (UGC, auktoritet,
  cost-of-inaction, myth-busting) — se FAS 7–9 i batch-log · CS med synlig
  prismatematik i stället för procent-påstående.
- **Undvik:** fabricerade kundcitat/recensioner (ingen riktig recension
  finns, se datakvalitet) · påhittade leveranstider eller lagerstatus
  (flera färger är oversålda — nämn aldrig "i lager" per färg) · att anta
  att SP (social proof) fungerar bara för att det gjorde det för Kranskydd
  — den här produktens egen data säger PD.
- **Obevisat:** allt i FAS 7–9 tills nästa avläsning — bara PD_1 har
  passerat signifikansgrinden i denna körning.

## Luckor (fyll före nästa körning)
- Videoinnehåll (rörelse, röst, exakt hook-bildruta) kunde inte öppnas
  härifrån — hela teardownet bygger på copy/thumbnail-nivå. Be Axel/
  redigerarna om transkript för PD_1 (vinnare) och SP_2/SP_3 (svagare)
  till nästa `/cs`-körning.
- Recensioner: se datakvalitet ovan — två opålitliga källor hittade, ingen
  använd. Fråga till Axel: är `Damasker Vandring_REVIEW`-sheetet riktiga
  recensioner som väntar på import, eller ett oanvänt/övergivet utkast?
- Inventarie negativ på 5+ färger — inte undersökt vidare (utanför
  creative-scope), men bör flaggas till Axel: leveransrisk som kan skada
  ROAS oavsett creative.
- Konkurrenter: 0 träffar i Meta Ad Library — obevakad nisch, ingen
  konkurrentanalys möjlig i denna körning.

## Namnkonvention — samma observerade diskrepans som tidigare produkter
Kontots faktiska annonsnamn (`Damasker_PD_1`, `Damasker_SP_2` osv.) och
`.claude/commands/forsta-batch.md`:s NAMING-sektion använder
`Produkt_KONCEPT_ID_VARIANT` (tvåbokstavskoncept), inte
`docs/naming-convention.md`:s `ANGLE_FORMAT_HOOK`-schema. Denna batch följer
den faktiskt använda konventionen, med nya koncept-koder för nya vinklar:
`UG` (UGC/identity), `AU` (auktoritet), `CI` (cost of inaction/konflikt),
`CO` (jämförelse), `MB` (myth-busting/nyfikenhet), `LI` (listicle),
`HL` (produktlöftes-static, ersätter en fabricerad testimonial), `BOF_N`
(bottom-of-funnel-statics). Flaggas här som tidigare — Axel bör bestämma
vilket dokument som är facit.
