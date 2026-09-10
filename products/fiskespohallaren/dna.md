# Creative DNA — Fiskespöhållaren (Bäverbutiken, svenska marknaden)

Skapad 2026-09-03, körning nr 1 i det nya minnessystemet — men produkten har
**redan haft två batcher** (historiska, gjorda innan `products/<id>/` fanns).
Detta är en **retroaktiv rekonstruktion** kombinerad med brief-rundan för
2026-09-03 (`/rond-auto` steg 4b, behov `brief_runda`, loggas `CS_BATCH_KLAR`
— inte `FORSTA_BATCH_KLAR`, se motivering i `.claude/commands/rond-auto.md`).

Uppdaterad 2026-09-06, körning nr 2 (`/cs`-runda via `/rond-auto`, batch #4,
3-dagarsrundan). Se batch-log för feedbackloopen och den nya batchen.

Uppdaterad 2026-09-10, körning nr 3 (`/cs`-runda via `/rond-auto`, batch #5,
4-dagarsrundan, `rundaAntal: 6`). Se "Feedbackloop 2026-09-10" nedan.

Kampanj: `Fiskespöhållaren | BE ROAS 1.50 | Launch 2026-08-18`
(`120249850522830291`), MagiBorsten `1867947880635861`, break-even-ROAS
**1,50**. Dagsbudget **1 500 kr** (avläst 2026-09-06, upp från 1 250 kr
2026-09-03 — läget är `drift` per `agent/produktkarta.json`, budgeten rörs
inte av denna körning). Livstid (avläst 2026-09-06): 61 942,37 kr spend,
324 köp, ROAS 2,26 — accelererande sedan förra avläsningen (58 111,52 kr /
300 köp / ROAS 2,23 den 2026-09-03).

## Produkten
Fiskespöhållaren = **4-pack plastklämmor** som håller ihopfällda fiskespön
stängda så de inte trasslar ihop sig i båten (Bäverbutiken/TEMU-produkt,
supplier-sku TEMU-601104615671651). Landningssida (handle, ur recensions-CSV):
`fiskespohallare-4-pack-kraftig-forvaring`.

✅ **PRISET ÄR BEKRÄFTAT 2026-09-10, körning nr 3: 289 kr.** Hämtat direkt ur
`https://xn--bverbutiken-l8a.se/products/fiskespohallare-4-pack-kraftig-forvaring.json`
(Shopify-MCP:n var fortsatt oautentiserad i denna körning — föll tillbaka på
butikens publika storefront-JSON, samma metod som en annan session använt
samma dag). `variants[0].price = "289.00"`, `compare_at_price = ""` (inget
jämförpris — **ingen rabatt går att visa ärligt**, ingen strykning), SKU
`TEMU-601104615671651` matchar produkten exakt, `taxable: false` (matchar att
Bäverbutiken säljer utan moms). Detta löser BLOCKER:n från batch #3/#4 (se
historik nedan) och bekräftar källa 3 av de tre tidigare motstridiga
uppgifterna.

Ytterligare bekräftelse denna körning: **två redan levande, bedömbara
annonser** (`Rodholder_PD_6_1` — vinnaren, ROAS 2,98 — och `Rodholder_SO_4_1`)
visar redan 289 kr i sin bild ("4-pack 289 kr – beställ idag"), granskat
visuellt. Att kontots bäst presterande statiska annons redan kör 289 kr utan
negativ signal är ytterligare ett dataargument, inte bara Shopify-sidan.

**Ny copy i denna och framtida batcher kan därför skriva exakt "289 kr"
rakt av — ingen BLOCKER längre.** Skriv aldrig ett jämförpris eller en
procentrabatt (t.ex. "40 % rabatt") i NY copy: Shopify har inget
`compare_at_price` satt, så en sådan siffra vore påhittad. De äldre CS-
annonserna (`CS_1_H1`, `CS_2_1`) kör redan "40 % RABATT – IDAG ENDAST" utan
jämförpris i Shopify — **flaggat här som ett möjligt integritetsproblem i
redan levande annonser**, men de rörs inte av den här körningen (de är
`amount_spent > 0`, se regeln om PAUSED/levande i CLAUDE.md); Axel bör känna
till det.

<details><summary>Historik (löst 2026-09-10, se ovan)</summary>

Tidigare (batch #3/#4): priset gick inte att bekräfta — Shopify-kopplingen
pekade på fel butik (TwinPillow). Tre motstridiga uppgifter fanns i systemet:
149 kr (Fiskespöhållare_SO_Adcopy_1, Drive 2026-08-12), 269 kr (levande
NO-annonser `NO_SO_1_*`), 289 kr (`Rodholder_PROD_V01–V10`-briefer, Drive
2026-08-25). Facit blev 289 kr — källa 3.
</details>

Bekräftade, prisoberoende erbjudanden (ur kontots egna redan godkända
annonstexter, säkra att återanvända):
- **30 dagars nöjd-kund-garanti**
- **Fri frakt över 300 kr**
- **Klarna — betala senare**

## Datakvalitet / FAS 0 — vad som faktiskt gjordes denna körning

| Källa | Status |
|---|---|
| Meta Ads-data (kampanj/annons, hela livstiden + senaste 3 dagar) | ✅ Hämtad, `ads_get_ad_entities`, verifierade fältnamn |
| Statiska bilder | ✅ 6 granskade visuellt/via OCR-snippet i Drive (GT_2_1, PD_2_1, SP_2_1, SO_2_1, CS_2_1 m.fl.) |
| Video | ⚠️ Kunde INTE spelas upp. Manus lästa ur kontots egna ad-copy-dokument i Drive (PD/CS/SO/SP/GT_Adcopy_1) — inte transkriberat på gissning |
| Landningssida / Shopify | ❌ Fel butik kopplad (TwinPillow). Pris OBEKRÄFTAT, se ovan |
| Recensioner | ✅ Hittade i Drive: `TEMU-601104615671651 Fiskespöhållare_Reviews` (Google Sheet), 7 st, 5/5, citerade ordagrant i batch-log |
| Google Drive (batchmappar) | ✅ Nådd. Produktmapp: `TEMU-601104615671651 Fiskespöhållare_pausad` (id `14-_uqZQnj4j_R-PqdUwZzZc2DPAenkhy`) — namnet "_pausad" är MISSVISANDE, kampanjen är aktiv och lönsam idag |
| Notion-hub | ✅ "Fish rod holder" (`collection://3c3270ab-908c-8356-ad6c-87ff779e647d`), 49 rader, alla Status Approved |

Datakvalitetskontroll (`amount_spent × purchase_roas` mot `omni_purchase_values`):
stämde inom normal avrundning på samtliga bedömbara annonser — inget tecken
på den kända 100×-buggen i det här urvalet.

## Siffrorna — livstid (`date_preset: maximum`, 104 annonsrader lästa)

**Hela kampanjen:** 58 111,52 kr spend, 300 köp, 129 776,93 kr intäkt (ur
`spend × ROAS`), ROAS 2,23.

**Bedömbara annonser** (≥300 kr spend OCH ≥3 köp): 12 av 104, **55 137 kr
(94,9 % av spend)**, 290 köp.

**Vinstbidrag räknat som `spend × (ROAS − break-even-ROAS)`** — den metoden
används här i första hand (inte CPA-baserad) eftersom priset/AOV inte kunde
verifieras denna session; ROAS-metoden kräver inget antagande om ordervärde.
(Sekundär kontroll: real AOV ur Meta-intäkt/köp på de bedömbara annonserna
= 433 kr, vilket skulle ge break-even-CPA ≈ 289 kr — som råkar matcha den
mest troliga prissiffran ovan, men det är sannolikt en slump, inte en bekräftelse.)

| Annons | Format | Status | Spend | Andel spend | Köp | ROAS | **Vinstbidrag** | Andel vinst |
|---|---|---|---|---|---|---|---|---|
| Fiskespöhållare_CS_1_H1 | video | ACTIVE | 5 490 kr | 10,0 % | 40 | 3,15 | **+9 055 kr** | 21,1 % |
| Fiskespöhållare_PD_EXTRA (video A) | video | PAUSED | 9 159 kr | 16,6 % | 51 | 2,40 | **+8 277 kr** | 19,3 % |
| Fiskespöhållare_PD_EXTRA (video C) | video | ACTIVE | 4 219 kr | 7,7 % | 31 | 3,03 | **+6 439 kr** | 15,0 % |
| **Fiskespöhållare_PD_1_H1 — TOP SPENDER/benchmark** | video | ACTIVE | 10 034 kr | 18,2 % | 46 | 2,13 | +6 352 kr | 14,8 % |
| Rodholder_PD_15_H1 | video | PAUSED (rör ej) | 9 268 kr | 16,8 % | 39 | 1,94 | +4 092 kr | 9,5 % |
| Rodholder_PD_6_1 | **static** | ACTIVE | 1 773 kr | 3,2 % | 14 | 3,36 | +3 291 kr | 7,7 % |
| Fiskespöhållare_PD_EXTRA (video B) | video | ACTIVE | 9 130 kr | 16,6 % | 41 | 1,83 | +3 023 kr | 7,0 % |
| Fiskespöhållare_CS_1_H3 (423 kr — ⚠️ se regression-varning) | video | ACTIVE | 423 kr | 0,8 % | 8 | 8,20 | +2 835 kr | 6,6 % |
| Rodholder_PD_16_H1 | video | ACTIVE | 2 005 kr | 3,6 % | 8 | 1,50 | +3 kr | 0,0 % |
| Rodholder_PD_11_H2 | video | PAUSED (rör ej) | 1 922 kr | 3,5 % | 6 | 1,49 | −28 kr | −0,1 % |
| Rodholder_SO_4_1 | static | PAUSED (rör ej) | 808 kr | 1,5 % | 3 | 1,44 | −45 kr | −0,1 % |
| Fiskespöhållare_CS_2_1 | static | PAUSED (rör ej) | 907 kr | 1,6 % | 3 | 1,08 | **−380 kr** | −0,9 % |

**Total vinstbidrag (bedömbara): +42 914 kr.**

⚠️ **Top spendern (`PD_1_H1`, 18,2 % av spend) är BENCHMARK, inte en
förlorare** — den ligger på plats 4 av 12 i vinstbidrag men det är
regression till medelvärdet på skala som förväntas, inte ett tecken på
svaghet. Döm den aldrig mot `CS_1_H1` (10× mindre spend).

⚠️ **`Fiskespöhållare_CS_1_H3` (423 kr, ROAS 8,20) är en regression-varning**
— hög kvot på låg spend, exakt det mönster som fällde en tidigare dom i det
här repot (se ANALYSMETOD.md steg 5). Preliminär dom, inte bevisad.

⚠️ **Naming-fel:** `Fiskespöhållare_PD_EXTRA` är samma namn på **tre olika
annons-ID:n** (troligen samma vinnande video återlanserad för att nollställa
frekvens/utmattning) — går inte att särskilja variant-nivå-lärdom mellan de
tre. Nya annonser i denna batch numreras individuellt (se namnkonvention
nedan) för att inte upprepa felet.

## Per koncept (kod i annonsnamnet)

| Kod | Vinkel (ur kontots egen ad-copy) | Annonser | Spend | Köp | Vinstbidrag | Vinst/spend-krona |
|---|---|---|---|---|---|---|
| **PD** | Produktdemo ("klämman löser trasslet på 1 sekund") | 8 | 47 508 kr | 236 | **+31 449 kr** | 0,66 |
| **CS** | Clearance sale / rabatt+brådska ("40 % rabatt idag endast") | 3 | 6 821 kr | 51 | +11 510 kr | **1,69** |
| SO | Sale/offer (pris+frakt+Klarna, allmänt) | 1 | 808 kr | 3 | −45 kr | −0,06 |
| GT (gåva) | "Presenten han faktiskt kommer använda" | 0 bedömbara | <300 kr vardera | — | — | OTESTAT |
| SP (social proof) | Kundcitat/recension | 0 bedömbara | <300 kr vardera | — | — | OTESTAT |

## Per format

| Format | Annonser | Spend | Andel spend | Köp | Vinstbidrag | Vinst/spend-krona |
|---|---|---|---|---|---|---|
| **Video** | 9 | 51 649 kr | **93,7 %** | 270 | **+40 048 kr (93,3 %)** | 0,78 |
| Static | 3 | 3 488 kr | 6,3 % | 20 | +2 866 kr (6,7 %) | 0,82 (⚠️ drivs nästan helt av 1 annons, se nedan) |

## Creative-teardown — mönster (≥3 krävs, 4 levererade)

1. **BEVISAD (format): video bär praktiskt taget hela vinsten.** 9 av 12
   bedömbara annonser är video och står för 93,7 % av spenden och 93,3 % av
   vinstbidraget. Static har bara 3 bedömbara annonser, och av dem är en
   (`PD_6_1`) hela anledningen till att kategorin ser positiv ut — de andra
   två (`SO_4_1`, `CS_2_1`) är svagt/klart negativa. **Instruktion:** minst
   3 av 4 nya kärnannonser blir video (matchar kravet i denna runda);
   static-satsningen begränsas till en enda, medveten iteration av det som
   redan fungerat (`PD_6_1`-familjen), inte en ny chansning.
2. **BEVISAD (koncept): PD (produktdemo) är volymdrivaren.** 8 annonser,
   236 köp, +31 449 kr — mer än 2/3 av all vinst i kampanjen. Manuset
   ("Trassliga fiskespön i båten – igen? Den här lilla klämman löser det på
   1 sekund") är redan skrivet och godkänt. **Instruktion:** behåll PD som
   ryggraden i batchen, men isolera EN ny variabel per iteration (ny hook/
   öppning) i stället för att skriva om hela budskapet — budskapet är
   bevisat, det är bara aldrig testat med en vassare första sekund.
3. **HYPOTES (koncept × format): CS (rabatt/brådska) har högst
   vinst-per-krona (1,69) men bara i VIDEO — den enda static-varianten av en
   liknande brådske-vinkel (`CS_2_1`) är den SÄMSTA bedömbara annonsen i hela
   kampanjen (−380 kr, ROAS 1,08). n=3 för konceptet, alltså inte bevisat,
   men signalen är stark. **Instruktion:** testa CS-vinkeln igen i VIDEO,
   återuppliva den ALDRIG som static förrän den är omtestad.
4. **OPERATIVT FYND (inte ett prestandamönster): GT och SP har aldrig fått
   en chans.** Båda vinklarna producerades redan 2026-08-12 (tre veckor
   sedan) men ingen enskild annons i någotdera har passerat 300 kr
   livstidsspend. Batch #2 (~2026-08-20/21) lade till över 50 nya
   annonsvarianter (`Rodholder_PD_3`–`PD_30` i flera H-undervarianter,
   `PROD_V01`–`V10`, `REA_V01`–`V10`) i samma kampanj — Metas leverans har
   koncentrerat sig till en handfull av dem och lämnat resten, inklusive GT
   och SP, med under 20 kr spend var. **Instruktion:** ge GT och SP FÄRSKT,
   eget kreativt material i denna batch (inte bara återanvänd gammalt) så de
   får en riktig chans att särskilja sig i auktionen, i stället för att
   konkurrera mot 50+ andra varianter om samma dagsbudget.

⚠️ Detta batch #2-mönster (många varianter, koncentrerad leverans till ett
fåtal) är precis det CLAUDE.md regel 11 varnar för. Det är redan launchat,
inget den här körningen kan ändra — men värt att Axel känner till inför
framtida test-ABO-beslut.

## Winning DNA — behåll alltid
- PD (produktdemo): pain-hook ("trassliga fiskespön i båten") → snabb
  klämdemo → CTA. Bevisat, tredje bekräftelsen 2026-09-10: 285 köp över 8
  bedömbara annonser, +39 824 kr vinstbidrag (76,6 % av total vinst).
- Video som primärformat. Bekräftat tre gånger, stabilt: ~93 % av både spend
  och vinstbidrag kommer därifrån (2026-09-03/09-06/09-10).
- 30 dagars nöjd-kund-garanti, fri frakt >300 kr, Klarna betala senare —
  alla tre bekräftat äkta och prisoberoende.
- **Priset är 289 kr — bekräftat 2026-09-10 mot Shopifys publika storefront-
  JSON OCH mot två levande, bedömbara annonser som redan visar det.** Får nu
  skrivas rakt av i ny copy. Skriv ALDRIG ett jämförpris/en procentrabatt —
  `compare_at_price` är tomt i Shopify.
- Enkel static-formel (en bild, en rubrik, en underrad, prisband — `PD_6_1`):
  bäst presterande statiska annons, nu stärkt av en visuell genomgång
  2026-09-10 som visar att de två svagare statiska annonserna har MER text/
  visuell komplexitet, inte mindre. Hypotes (n=3), testas vidare i batch #5.

## Losing DNA — undvik
- Rabatt/brådska-budskap i STATIC-format (`CS_2_1`, −380 kr, sämst i hela
  kampanjen, mest textrik av de tre statiska bedömbara annonserna). Fungerar
  i video (`CS_1_H1`), inte i static.
- Collage-/flerpanel-statics med flera etiketter (`SO_4_1`, −45 kr) — mer
  visuell komplexitet än den enkla vinnarformeln, svagt negativt resultat.
  (Korrigering 2026-09-10: den här annonsen kodades "SO" men är visuellt en
  collage, inte en rabattannons — se creative-teardownet.)
- Att skriva ett exakt pris utan bekräftad källa — LÖST 2026-09-10 (se
  Winning DNA), men kvarstår som en historisk lärdom: kontot har redan en
  gång fått betala för det (`ZZ_GAMMAL_..._(fel pris)`-annonserna, pausade).
- Att döma en snabbstartare (hög ROAS, <500 kr spend) som bevisad vinnare
  innan den överlevt upprepade avläsningar (`CS_1_H3`: fortfarande 8 köp,
  fjärde dygnet i rad utan ett enda nytt köp trots att den passerat
  signifikansgrinden — flaggad stagnerande, inte bevisad, tre körningar i
  rad nu).
- Att lita på ett kodnamn (PD/CS/SO/GT/SP) som en garanti för vad creativen
  faktiskt visar — granska alltid bilden/manuset själv (se `SO_4_1`-fyndet).

## Testa kontrollerat
- GT (gåva) och SP (social proof) — fick färskt material i batch #3/#4, men
  INGET av det har hunnit få spend än (se Feedbackloop 2026-09-10 — 18
  briefer väntar fortfarande på leverans/granskning). Ingen ny GT/SP-vinkel
  läggs till i batch #5 — kön är redan full.
- Prisexplicit video (batch #5, `PD_37_H1`): testar om att säga priset
  högt/i bild mitt i videon (inte bara på slutkortet) ändrar konvertering,
  nu när priset är säkert att skriva ut.
- Talad brådska i video (batch #5, `CS_6_H1`): CS-mönstret är bevisat i
  video men alltid med text-only urgency hittills — testar röstad urgency.

## Obevisat
- SO (allmänt erbjudande) — enda bedömbara annonsen ligger precis under
  break-even (−45 kr på 808 kr spend, oförändrat sedan 2026-09-06, annonsen
  är PAUSAD så ingen ny data tillkommer). För lite data för en riktig dom,
  och nu dessutom omklassificerad som "collage", inte "erbjudande" (se
  Losing DNA).
- Allt i `PROD_V01–V10` och `REA_V01–V10` — under 20 kr spend vardera,
  ingen dom möjlig, oförändrat sedan 2026-09-06.
- Klarna som egen, dedikerad creative (`KL_1_1`, batch #5) — erbjudandet är
  bekräftat äkta men har aldrig testats som huvudbudskap i en egen annons.

## Namnkonvention för den här produkten
Kontot har växlat prefix mitt i historiken: `Fiskespöhållare_` (batch #1,
2026-08-12) → `Rodholder_` (batch #2, ~2026-08-20). Nya annonser fortsätter
med **`Rodholder_`** för att matcha den senaste, aktiva konventionen i
hubben. Upptagna nummer per kod (avlästa ur Notion-hubben 2026-09-10, efter
batch #5): PD upp till 41 (+ `PROD_V01–10`), CS upp till 6, SO upp till 7,
GT upp till 4, SP upp till 9, GA upp till 1, JF upp till 3, TR upp till 1,
**KL upp till 1** (ny kod, se nedan). Koder införda i batch #3 (2026-09-03):
**GA** (garanti/fri frakt-BOF) och **JF** (jämförelse/invändnings-BOF). Kod
införd i batch #4 (2026-09-06): **TR** (trust/social proof, numeriskt
sålda-antal-BOF). Kod införd i batch #5 (2026-09-10): **KL** (Klarna/betala
senare-BOF, egen kod — tidigare bara omnämnt i löptext, aldrig en egen
creative).

## Feedbackloop 2026-09-06 (körning nr 2, batch #4)

**Batch #3 (2026-09-03, 9 briefer) har INTE launchats än** — alla 9 items
(`Rodholder_PD_31_H1`, `PD_32_1`, `CS_4_H1`, `GT_4_H1`, `SO_5_1`, `GA_1_1`,
`JF_1_1`, `SP_3_1`, `SP_4_1`) står fortfarande `Status: Draft` i Notion-hubben
och syns inte alls i Meta-kontot (kontrollerat via `campaign_id`-filtrering,
ad-nivå, `date_preset: maximum`). Ingen av batch #3:s hypoteser går alltså
att stämma av än — redigerarna har inte producerat dem. Detta loggas här så
nästa `/cs`-körning vet att avläsa DEM innan den dömer batch #4.

**Marginal-CPA-grinden (ANALYSMETOD 2b) passerad:** snapshots 3 dygn isär
(2026-09-03 → 2026-09-06), 24 inkrementella köp (≥5-kravet uppfyllt),
inkrementell spend 3 830,85 kr → marginal-CPA ≈ **160 kr**, långt under
break-even (≈289 kr real AOV-baserad). Kampanjen accelererar, inte tvärtom.

**Vinstbidragstabellen (livstid, samma 12 bedömbara annonser som 2026-09-03,
metod: `spend × (ROAS − 1,50)` — prisoberoende, används i första hand
eftersom exakt pris fortfarande är obekräftat):**

| Annons | Format | Status | Spend | Köp | ROAS | Vinstbidrag | Δ spend/köp sedan 09-03 |
|---|---|---|---|---|---|---|---|
| Fiskespöhållare_PD_EXTRA (ad …564380291) | video | ACTIVE | 10 773,75 kr | 54 | 2,02 | **+5 663 kr** | +1 644 kr / +13 köp — störst rörelse i batchen |
| Fiskespöhållare_PD_1_H1 — TOP SPENDER/benchmark | video | ACTIVE | 11 071,04 kr | 50 | 2,12 | **+6 812 kr** | +1 037 kr / +4 köp |
| Fiskespöhållare_PD_EXTRA (ad …856844270291) | video | PAUSED (rör ej) | 9 158,59 kr | 51 | 2,40 | +8 259 kr | ±0 (pausad) |
| Fiskespöhållare_CS_1_H1 | video | ACTIVE | 5 807,29 kr | 43 | 3,17 | **+9 690 kr** | +317 kr / +3 köp |
| Fiskespöhållare_PD_EXTRA (ad …857099190291) | video | ACTIVE | 4 230,51 kr | 31 | 3,02 | +6 434 kr | +12 kr / +0 köp |
| Rodholder_PD_15_H1 | video | PAUSED (rör ej) | 9 267,93 kr | 39 | 1,94 | +4 084 kr | ±0 (pausad) |
| Rodholder_PD_6_1 | static | ACTIVE | 2 138,36 kr | 15 | 2,95 | **+3 100 kr** | +365 kr / +1 köp |
| Rodholder_PD_16_H1 | video | ACTIVE | 2 256,54 kr | 9 | 1,64 | +321 kr | +252 kr / +1 köp |
| Fiskespöhållare_CS_1_H3 (ad …856845560291) | video | ACTIVE | 431,28 kr | 8 | 8,05 | +2 823 kr | +8 kr / **+0 köp — stagnerar** |
| Rodholder_PD_11_H2 | video | PAUSED (rör ej) | 1 921,70 kr | 6 | 1,49 | −19 kr | ±0 (pausad) |
| Rodholder_SO_4_1 | static | PAUSED (rör ej) | 807,99 kr | 3 | 1,44 | −48 kr | ±0 (pausad) |
| Fiskespöhållare_CS_2_1 | static | PAUSED (rör ej) | 907,39 kr | 3 | 1,08 | **−382 kr** | ±0 (pausad) |

**Kampanjtotal (livstid):** 61 942,37 kr spend, 324 köp, ROAS 2,26.

**Avläst mönster (bekräftar dna:ts mönster, inga nya kill-beslut):**
1. **Fortsatt BEVISAD (video bär vinsten):** samtliga aktiva bedömbara annonser
   som växte gjorde det som video (PD_EXTRA +13 köp på 3 dygn). `PD_6_1`
   (static) växte också men svagt (+1 köp).
2. **`Fiskespöhållare_CS_1_H3` stagnerar** — 0 nya köp på 3 dygn trots att den
   passerat signifikansgrinden (8 köp). Enligt ANALYSMETOD 2c kvarstår den som
   **preliminär, inte bevisad** — flat utveckling är ett svagare tecken än
   fortsatt tillväxt. Skriv INTE in ROAS 8,05 i Winning DNA än.
2. **`Fiskespöhållare_PD_EXTRA` (video B, 54 köp)** är nu den enskilt mest
   köpstarka annonsen i kampanjen och har gått om `PD_1_H1` i antal köp (54 vs
   50) — men `PD_1_H1` behåller sin roll som benchmark eftersom den är äldst
   och mest stabil, inte för att den presterar bäst just nu.

**Konsekvens för batch #4:** inga kill/skala-beslut denna körning (produktens
budget hanteras av huvudsessionen/ronden). Batch #4 byggs enligt samma
Winning/Losing DNA som redan står nedan, med NYA isolerade variabler som inte
krockar med batch #3:s ännu olästa hypoteser (se batch-log för fullständig
lista + tre-frågorstest per rad).

## Feedbackloop 2026-09-10 (körning nr 3, batch #5)

**⚠️ Huvudfyndet denna körning är operativt, inte kreativt: batch #3 (9
briefer, 2026-09-03) och batch #4 (9 briefer, 2026-09-06) — 18 briefer totalt
— är FORTFARANDE inte uppe i Meta.** Kontrollerat två sätt: (1) hela
kampanjens annonser hämtade ur Meta (`date_preset: maximum`, sorterat på
spend) — inget av namnen `PD_31/32/34/35`, `CS_4/5`, `GT_4`, `SO_5/6`,
`GA_1`, `JF_1/2`, `SP_3–7`, `TR_1` finns i kontot. (2) Notion-hubben
kontrollerad rad för rad: **6 av 18 har flyttats till `To be Reviewed`**
(redigerarna har levererat dem — `PD_31_H1`, `CS_4_H1`, `GT_4_H1` från
batch #3, `SP_5_H1`, `PD_34_H1`, `CS_5_H1` från batch #4 — och väntar nu på
att `/notionkorning` plockar upp dem), **12 av 18 står fortfarande `Draft`**
(redigerarna har inte börjat: `PD_32_1`, `SO_5_1`, `GA_1_1`, `JF_1_1`,
`SP_3_1`, `SP_4_1` från batch #3; `PD_35_1`, `SO_6_1`, `JF_2_1`, `TR_1_1`,
`SP_6_1`, `SP_7_1` från batch #4). **Ingen enda hypotes från batch #3 eller
#4 kan alltså stämmas av ännu** — samma läge som `batch-log.md` redan
flaggade 2026-09-06, nu fyra dagar äldre och olöst. Se `backlog.md` för
konsekvensen för batch #5:s inriktning.

**Prisbekräftelse (se avsnittet högst upp i filen):** 289 kr, bekräftat både
mot Shopifys publika JSON och visuellt mot två levande annonser. BLOCKER:n
på `Rodholder_SO_5_1` (batch #3) är därmed löst i sak — det kräver ingen ny
körning, bara att en redigerare/CS fyller i siffran när den raden väl
plockas upp. Nämns här så nästa körning inte återupprepar frågan till Axel.

**Marginal-CPA-grinden (ANALYSMETOD 2b) passerad:** snapshots 4 dygn isär
(2026-09-06 → 2026-09-10), 32 inkrementella köp (≥5-kravet uppfyllt),
inkrementell spend 6 782,76 kr → marginal-CPA ≈ **212 kr**, klart under
break-even-CPA (≈289 kr, real AOV-baserad — se metodnot i tabellen nedan).
Kampanjen fortsätter accelerera på 4-dygnsbasis. **Observera samtidigt:**
`/rond-auto` sänkte dagsbudgeten 1 800 → 1 450 kr samma morgon (2026-09-10)
på ett *3-dagars rullande* snitt (ROAS 1,64 mot break-even 1,50, 5,5 % marginal)
— två olika tidsfönster, inga motstridiga fakta. 4-dygnstrenden (denna
analys) är fortsatt stark; det senaste 3-dygnsfönstret var svagare. Ingen
budgetåtgärd görs av `/cs` — det är rondens jobb.

**Vinstbidragstabellen (livstid, `spend × (ROAS − 1,50)` — samma metod som
tidigare körningar, prisoberoende även om priset nu är känt, för
jämförbarhet med historiken):**

| Annons | Format | Status | Spend | Köp | ROAS | Vinstbidrag | Andel vinst | Andel spend |
|---|---|---|---|---|---|---|---|---|
| Fiskespöhållare_PD_EXTRA (ad …564380291) | video | ACTIVE | 13 054,93 kr | 69 | 2,27 | **+10 082 kr** | 19,4 % | 19,0 % |
| Fiskespöhållare_CS_1_H1 | video | ACTIVE | 6 297,35 kr | 45 | 3,05 | **+9 784 kr** | 18,8 % | 9,2 % |
| Fiskespöhållare_PD_EXTRA (ad …856844270291) | video | PAUSED (rör ej) | 9 158,59 kr | 51 | 2,40 | +8 278 kr | 15,9 % | 13,3 % |
| **Fiskespöhållare_PD_1_H1 — TOP SPENDER/benchmark** | video | ACTIVE | 13 382,96 kr | 58 | 2,01 | +6 865 kr | 13,2 % | 19,5 % |
| Fiskespöhållare_PD_EXTRA (ad …857099190291) | video | ACTIVE | 4 665,25 kr | 33 | 2,88 | +6 445 kr | 12,4 % | 6,8 % |
| Rodholder_PD_15_H1 | video | PAUSED (rör ej) | 9 267,93 kr | 39 | 1,94 | +4 092 kr | 7,9 % | 13,5 % |
| Rodholder_PD_6_1 | static | ACTIVE | 2 669,20 kr | 19 | 2,98 | +3 952 kr | 7,6 % | 3,9 % |
| Fiskespöhållare_CS_1_H3 (ad …856845560291) | video | ACTIVE | 439,51 kr | 8 | 7,90 | +2 812 kr | 5,4 % | 0,6 % |
| Rodholder_PD_16_H1 | video | ACTIVE | 2 602,11 kr | 10 | 1,55 | +139 kr | 0,3 % | 3,8 % |
| Rodholder_PD_11_H2 | video | PAUSED (rör ej) | 1 921,70 kr | 6 | 1,49 | −28 kr | −0,1 % | 2,8 % |
| Rodholder_SO_4_1 | static | PAUSED (rör ej) | 807,99 kr | 3 | 1,44 | −45 kr | −0,1 % | 1,2 % |
| Fiskespöhållare_CS_2_1 | static | PAUSED (rör ej) | 907,39 kr | 3 | 1,08 | **−380 kr** | −0,7 % | 1,3 % |

**Total vinstbidrag (bedömbara): +51 995 kr** (65 175 kr / 94,8 % av
kampanjens 68 725,13 kr spend; 344 av 356 köp). **Kampanjtotal (livstid):**
68 725,13 kr spend, 356 köp, 154 741,40 kr intäkt, ROAS 2,25. Datakvalitet:
`amount_spent × purchase_roas` (154 759 kr) stämmer inom avrundning mot
`omni_purchase_values` (154 741,40 kr) — inget tecken på 100×-buggen i det
här urvalet.

**Metrik-diagnos (video, bedömbara annonser):** hook rate ligger onaturligt
jämnt högt över hela gruppen (93–95 % på alla utom `PD_15_H1` som ligger på
94,8 % också) — hooken är alltså INTE var skillnaden mellan vinnare och
förlorare uppstår för den här produkten. Hold varierar mer (6,7–9,5 % på de
flesta) UTOM `Rodholder_PD_15_H1` som sticker ut med 25,0 % hold — högst i
hela gruppen — men ligger ändå bara på plats 6 av 9 i vinstbidrag. **Hold
ensamt förutsäger alltså inte vinst** (ANALYSMETOD steg 6 varnar uttryckligen
för detta). Skillnaden mellan vinnare och förlorare i videogruppen sitter
längre ner i tratten (CVR/CPM), inte i hook eller hold.

### Creative-teardown — nya/bekräftade mönster (≥3 krävda, 5 levererade)

1. **BEVISAD (format), bekräftat en tredje gång: video bär praktiskt taget
   hela vinsten.** 9 av 12 bedömbara annonser är video: 60 790 kr spend
   (93,3 % av bedömbar spend), +48 467 kr vinstbidrag (93,2 % av vinsten).
   Static: 3 annonser, 4 385 kr spend (6,7 %), +3 527 kr vinstbidrag (6,8 %)
   — och den siffran drivs nästan helt av EN annons (`PD_6_1`, se mönster 4).
   Talen är i det närmaste identiska med 2026-09-03 och 2026-09-06 —
   mönstret är stabilt över tre oberoende avläsningar. **Instruktion
   (oförändrad):** minst två tredjedelar av kärnrundan är video.
2. **BEVISAD (koncept), bekräftat en tredje gång: PD (produktdemo) är
   volymdrivaren.** 8 av 12 bedömbara annonser är PD-kodade, 56 723 kr spend
   (87,0 % av bedömbar spend), +39 824 kr vinstbidrag (76,6 % av vinsten),
   285 köp. **Instruktion (oförändrad):** PD förblir ryggraden i varje
   batch, isolera en variabel per iteration.
3. **NYTT (data, inte hypotes): benchmark-annonsen visar utmattningstecken,
   den tidigare nummer-2-annonsen har gått om den.** `PD_1_H1` (benchmark,
   19,5 % av spend) har nu LÄGST vinst-per-spenderad-krona (0,51) av de fem
   topp-video-annonserna, och högst `frequency` i gruppen (1,82 mot 1,55 för
   `PD_EXTRA …564380291`, som nu är kampanjens enskilt mest lönsamma annons,
   +10 082 kr). Per ANALYSMETOD steg 5 ("kolla frequency och trend innan du
   drar slutsatsen") är detta ett tidigt utmattningstecken på benchmarken —
   INTE ett skäl att sluta använda den som jämförelsenorm (den är fortfarande
   näst störst i vinstbidrag och tredje störst i spend), men ett skäl att
   prioritera FRÄSCHA hook-iterationer på den bevisade strukturen framför
   fler PD_1-specifika varianter. **Instruktion:** batch #5:s PD-videor
   isolerar nya öppningsrader på `PD_EXTRA`s struktur, inte ännu en
   `PD_1_H1`-hook-variant.
4. **NYTT (visuell granskning, hypotes n=3): enkelhet slår komplexitet i
   static.** Bilderna för samtliga tre bedömbara statiska annonser granskade
   på riktigt denna körning (inte bara namn/prestanda som tidigare):
   `PD_6_1` (vinnare, +3 952 kr) är en enda skarp makrobild av klämman i
   användning, rubrik + en underrad, inget mer. `SO_4_1` (svagt negativ,
   −45 kr) är — trots kodnamnet "SO" (offer/sale) — visuellt en 4-rutig
   collage-bild ("Båten/Väggen/Förrådet/Transporten") med fyra egna
   etiketter, alltså MER text och visuell komplexitet än vinnaren, INTE en
   rabattannons. `CS_2_1` (sämst, −380 kr) har mest text av alla tre: rubrik,
   underrad, tre bullets och en CTA-knapp ovanpå en foto-bakgrund. Gradienten
   text/komplexitet → prestanda är tydlig men n=3 (ingen upprepning vid
   samma värde än) — **hypotes, inte bevisad.** **Instruktion:** batch #5:s
   nya statics replikerar `PD_6_1`s minimalistiska formel (en bild, en rubrik,
   en underrad, prisband) i nya miljöer, INTE fler collage- eller
   textrika format.
5. **KORRIGERAT NAMNGIVNINGSFYND: `SO`-koden speglar inte alltid
   creativens faktiska innehåll.** `Rodholder_SO_4_1` är kodad "SO"
   (sale/offer) men visar varken pris, rabatt eller brådska — det är ett
   användningsområdes-collage. Framtida teardown ska granska bilden själv,
   inte lita på kodnamnet, innan den grupperas per variabel.

**CS-mönstret (vinst-per-krona) håller fortsatt, bara i video, fortfarande
n=1 verkligt bevisad annons:** `CS_1_H1` ensam står för 9 784 kr av CS-
gruppens 12 216 kr totala vinstbidrag. `CS_1_H3` (8 köp, ROAS 7,90) har haft
**noll nya köp på fyra dygn i rad** (431,28 kr → 439,51 kr spend, 8 → 8 köp,
oförändrat sedan 2026-09-06) — enligt ANALYSMETOD 2c kvarstår den som
**stagnerande, INTE bevisad**, och flyttas inte till Winning DNA.

**Konsekvens för batch #5:** given att 18 briefer redan väntar i kön (se
ovan) byggs batch #5 medvetet KONSERVATIVT — enbart iterationer på redan
bevisade PD/CS-strukturer plus två direkta repliker av `PD_6_1`s
static-formel, inga nya obevisade vinklar (GT/SP/JF/TR/SO är redan
representerade i den väntande kön). Se `backlog.md` för det explicita
rådet till Axel om redigerarkapacitet.
