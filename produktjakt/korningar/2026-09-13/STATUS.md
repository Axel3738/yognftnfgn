# Produktjakt 2026-09-13 (vecka 37, söndag) — V3, dag 3

## Steg 0 — lärde FÖRE sökningen

### 0A. Axels svar (7 nya på gårdagens batch, 5 obesvarade) → 42 svar totalt: 29 ja / 7 kanske / 6 nej

| Dom | Produkt (09-12) | Orsak | Läsning |
|---|---|---|---|
| ja | Båthuven 600D trailerbåt 17–19 fot · Kamadohuven 600D · Kajakhuven formsydd | — | tre skyddsformer på nya objekt — H01/H04 lever i klicken |
| ja | Minikedjesågen för Makita-batteri | — | **första ja på en H12-rad** (maskinen på ägarens batteri) — trots piratrisk i heron |
| ja | Värmesulorna · Värmehandskarna för älgpasset | — | kroppsligt i säsongsjobbet (E_VADER_SASONG) — samma som Värmesitsen 09-11 |
| ja | Uppvärmda fågelbadet | — | H09 djur/vatten ute — tredje ja i raden (vattenskål, hönstak, fågelbad) |
| (obesvarade) | Krukväxthuven 3-pack · Bikupans vinterjacka · Maskinhyllan · Ljusslingevindorna · Makita-hållaren | — | de fem LÅG-raderna. Obesvarat ≠ nej — men alla fem hade golv under oss eller lågt upplevt värde. Läsning: **Axel hoppar över det som inte ser ut som sitt pris**; H11-raderna (ordning/flerköp) fick ingen reaktion alls. |

Inga nej i dag → ingen orsakstyp att skriva. `vikter.json`: 0 stopp, 29 lyft (bevisnivå 2). `koncept.json`: 255 koncept, 7 svar inlästa.

### 0A′. Butiken: Axel la in 16 nya produkter 09-12 (katalog-live 207 aktiva, +15 mot i går)

13 är forskningsprodukter från 09-10/09-11-batcherna, alla utan kampanj i kontot än. **Axels pris mot vårt förslag:**

| Butiken (pris) | Vårt förslag | Koncept |
|---|---|---|
| Kapell Till Snöslunga 459 | 599 | K0224 |
| Hönsgårdsduk 145 × 109 459 | 999 | K0205 |
| ATV-Kapell 3XL 579 | 899 | K0234 |
| Kajakhållare 2-pack 599 | 499 | K0239 |
| Motorlås rostfritt 909 | — (lins D) | K0236 |
| Snöflingor 25-pack 249 | 349 | K0237 |
| Snöskyffel utan batteri 2 349 | 1 799 | K0238 |
| Solcellsladdare 10 W 559 | — (09-10) | K0173 |
| Spabadskapell 210D 619 | — (lockskydd kanske 09-10) | K0053 |
| Täljset 30 delar 869 | 899 | K0243 |
| Uppvärmd Vattenskål 2,2 L 849 | 699 | K0232 |
| Vedställskapell 529 | — (09-10) | K0135 |
| Värmesits 45 × 90 599 | 599 | K0240 |
| Blockljus 3-pack 479 · Värmeljus 24-pack · (LED Campinglampa, MC-kapell = gamla) | — | ej våra |

Gjort: `facit/launch-koppling.json` (butikstitel → product_id) och 13 taggrader i `facit/historik-taggar.json` så att kampanjerna klassas samma morgon de dyker upp; `koncept.json` bär `butik` (titel, pris, datum) per koncept. Prisavvikelserna (hönsgårdsduk −54 %, snöslunga −23 %, ATV −36 %, vattenskål +21 %, snöskyffel +31 %) är facit på vår prissättning — läses av när Meta-utfallet finns.

### 0B. Metas facit (snapshot `facit/snapshots/2026-09-13.json`: 19 REAL WINNER · 21 REAL LOSER · 34 INSUFFICIENT · 2 UNTESTED; inga nya kampanjer, inga okopplade)

| Launch | 09-11 → 09-12 → 09-13 spend | köp | ROAS nu / BE | Lutning senaste dygnet | Bekräftad? |
|---|---|---|---|---|---|
| Taköverdraget husvagn (V1) | 2 663 → 7 300 → **15 166** | 15 → 47 → **71** | 5,35 / 1,63 | +7 866 kr, +24 köp — CPA 328 | prel. HIGH — snapshot 09-11 + 09-14 ger bekräftelsen |
| Termoskyddet husbil (Axels, 09-11) | — → 1 511 → **3 417** | 11 → **19** | 3,22 / 1,61 | +1 906 kr, +8 köp | prel. HIGH |
| Adventskalendern racingbilar (V3) | 3 308 → 5 189 → **7 398** | 16 → 20 → **24** | 1,91 / 1,62 | +2 209 kr, +4 köp — CPA 552, ROAS faller (3,06 → 2,33 → 1,91) | prel. — **närmar sig BE** |
| Isolerade Utekattkojan (V2) | 2 890 → 4 152 → **6 237** | 9 → 13 → **13** | 1,73 / 1,62 | **+2 085 kr, 0 köp** — ROAS 2,46 → 2,60 → 1,73 | prel. — **ett dygn utan köp; nästa snapshot avgör** |
| Stegstödet 2-pack | 1 974 → 1 976 | 2 → 3 | 0,97 | stillastående (pausad/strypt) | EARLY_SIGNAL negativ |
| Solcellslarmet 2-pack | 1 494 → 1 991 | 1 → 1 | 0,39 | +497 kr, 0 köp | TOO_EARLY negativ |
| Staketstolpslagaren 2-pack | 1 875 → 1 875 | 1 | 0,91 | stillastående | TOO_EARLY negativ |

Läsning: **skalningen skiljer vinnarna åt.** Taköverdraget och termoskyddet håller ROAS när spenden dubblas; kojan och kalendern tappar när Axel skalar (kojan noll köp på 2 085 kr). Det är samma mönster som H06/H03 varnar för (look-alikes under vårt pris + tunn hyllfrånvaro): kojan kostar 789 mot kopior 157–504. Ingen dom i dag — två snapshots ≥ 3 dygn (09-11 + 09-14) krävs. Skrivs som **bevakning** i LEARNING_STATE-raden.

### 0C. LEARNING_STATE.md (omskriven 2026-09-13, läst)

Inga nya klasser (19/21/34/2), signalerna oförändrade; vinstbidragen: taköverdraget 34 631 kr (näst största i kontot efter spöklämman på 34 025 — på fyra dagar), termoskyddet 3 423, kalendern 1 305 (från 2 282), kojan 435 (från 2 520). Hypoteser: H01/H02/H04 stärkta i klicken (tre ja på skyddsformer + båthuven 1 399 kr); H12 första ja; H09 tredje ja; H11 noll reaktion (fem obesvarade). Motbevisade: 8 (oförändrat). Prediktion vs verklighet: 4 dömda launcher, alla REAL_WINNER prel. — men två av dem har negativ lutning i dag.

### 0D. Säsong (`korningar/2026-09-13/SASONG.md`)

NOW: första frost Norrland 0,7 v / Svealand 4,6 / Götaland 5,1 · poolstängning 2,4 v · älgjakt syd 3,6 v · uppställning husvagn + båtupptagning 3,9 v · MC-avställning 4,6 v · lövfällning 4,6 v · vedsäsong 4,6 v · robotindockning 6,0 v · vintermatning fåglar 6,0 v · första snö Norrland 6,0 v / Svealand 9,9 v · fars dag 8,0 v · utedjurens fönster stänger 9,0 v · 1 december 10,3 v · isläggning 10,4 v. EARLY parkerat: snölast 18,4 v, isfiske, sportlov.

## Linserna i dag (efter gårdagens "i morgon": exploration under minimum → en H10-lins; H09 med hästhinken; inga hållare där kedjan säljer styckvis)

| Lins | Struktur | Slot | Hypotes |
|---|---|---|---|
| K | "Visste inte att det fanns" — ny form på ägt objekt | exploration | H10 |
| L | Djur och vatten ute när det fryser (häst, damm, höns, katt) | säsong | H09 (+H08) |
| M | Q4-gåva med hårt datum (barnbarnets kalender nytt tema, hobbylådan till mannen) | säsong | H05 |
| N | Formsydd form på NYA maskinobjekt (poolvärmepump, vedklyv, promenadscooter, jordfräs) — max 4 rader | exploitation | H01/H02/H04 |
