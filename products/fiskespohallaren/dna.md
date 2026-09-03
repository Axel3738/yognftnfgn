# Creative DNA — Fiskespöhållaren (Bäverbutiken, svenska marknaden)

Skapad 2026-09-03, körning nr 1 i det nya minnessystemet — men produkten har
**redan haft två batcher** (historiska, gjorda innan `products/<id>/` fanns).
Detta är en **retroaktiv rekonstruktion** kombinerad med brief-rundan för
2026-09-03 (`/rond-auto` steg 4b, behov `brief_runda`, loggas `CS_BATCH_KLAR`
— inte `FORSTA_BATCH_KLAR`, se motivering i `.claude/commands/rond-auto.md`).

Kampanj: `Fiskespöhållaren | BE ROAS 1.50 | Launch 2026-08-18`
(`120249850522830291`), MagiBorsten `1867947880635861`, break-even-ROAS
**1,50**. Dagsbudget 1 250 kr. Senaste 3 dagar (avläst 2026-09-03):
3 565,59 kr spend, ROAS 2,15, 17 köp — lönsamt, ~20 % vinst, budgeten rörs
INTE denna körning (redan hanterat av huvudsessionen).

## Produkten
Fiskespöhållaren = **4-pack plastklämmor** som håller ihopfällda fiskespön
stängda så de inte trasslar ihop sig i båten (Bäverbutiken/TEMU-produkt,
supplier-sku TEMU-601104615671651). Landningssida (handle, ur recensions-CSV):
`fiskespohallare-4-pack-kraftig-forvaring`.

⚠️ **Priset går INTE att bekräfta i denna körning.** Shopify-kopplingen i
sessionen pekade på fel butik (TwinPillow, `twinpillow.se`) — inte
bäverbutiken.se. **Tre motstridiga prisuppgifter finns redan i systemet**
(bekräftat i `products/fiskespohallaren-no/dna.md`, byggd 2026-08-31 på samma
produkt/andra marknaden):
1. 149 kr — Fiskespöhållare_SO_Adcopy_1 (Drive, byggd 2026-08-12)
2. 269 kr — levande NO-annonser (`NO_SO_1_*`)
3. 289 kr — `Rodholder_PROD_V01–V10`-briefer (Drive, byggda 2026-08-25 — SENAST
   daterade källan, mest trolig aktuell)
**Ingen av dessa är verifierad mot en levande sida denna session.** Samma
konto har redan en gång skickat annonser med fel pris (`ZZ_GAMMAL_
Fiskespöhållare_SO_1/2 (fel pris)` — pausade, se nedan) — att gissa ett pris
i ny copy riskerar att upprepa exakt det misstaget. **Ny copy i denna batch
skriver därför inget exakt pris** (matchar för övrigt vad NO-analysen redan
fann: bäst presterande annons i hela produktfamiljen, NO_PD_1_H3, nämner
aldrig pris alls). Prisbriefen (BOF-1, se batch-log) är märkt BLOCKER tills
Axel bekräftar siffran.

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
  klämdemo → CTA. Bevisat 236 köp över 8 annonser.
- Video som primärformat. 93,7 % av spend och 93,3 % av vinsten kommer
  därifrån.
- 30 dagars nöjd-kund-garanti, fri frakt >300 kr, Klarna betala senare —
  alla tre bekräftat äkta och prisoberoende.
- Ingen exakt prissiffra i hook/huvudbudskap (lärdom extrapolerad från
  systerprodukten NO — INTE ännu direkt testad på SE, märkt som sådan).

## Losing DNA — undvik
- Rabatt/brådska-budskap i STATIC-format (`CS_2_1`, −380 kr, sämst i hela
  kampanjen). Fungerar i video (`CS_1_H1`), inte i static.
- Att skriva ett exakt pris utan bekräftad källa — kontot har redan en gång
  fått betala för det (`ZZ_GAMMAL_..._(fel pris)`-annonserna, pausade).
- Att döma en snabbstartare (hög ROAS, <500 kr spend) som bevisad vinnare
  innan den överlevt en andra avläsning (`CS_1_H3`).

## Testa kontrollerat
- GT (gåva) och SP (social proof) — aldrig fått riktig budget, ges nu färskt
  material (se batch-log #3).
- Static-iteration av PD (format-transfer av det bevisade demo-budskapet,
  eftersom `PD_6_1` visar att static KAN fungera för just detta koncept).

## Obevisat
- SO (allmänt erbjudande) — enda bedömbara annonsen ligger precis under
  break-even (−45 kr på 808 kr spend). För lite data för en riktig dom.
- Allt i `PROD_V01–V10` och `REA_V01–V10` — under 20 kr spend vardera,
  ingen dom möjlig.

## Namnkonvention för den här produkten
Kontot har växlat prefix mitt i historiken: `Fiskespöhållare_` (batch #1,
2026-08-12) → `Rodholder_` (batch #2, ~2026-08-20). Nya annonser i denna
batch (#3) fortsätter med **`Rodholder_`** för att matcha den senaste,
aktiva konventionen i hubben. Upptagna nummer per kod (avlästa ur kontot
2026-09-03): PD upp till 30 (+ `PROD_V01–10`), CS upp till 3, SO upp till 4,
GT upp till 3, SP upp till 2. Nya koder införda i denna batch (första
användning, loggat här så nästa körning inte kolliderar): **GA** (garanti/
fri frakt-BOF) och **JF** (jämförelse/invändnings-BOF).
