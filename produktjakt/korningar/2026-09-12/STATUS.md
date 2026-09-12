# Produktjakt 2026-09-12 (vecka 37) — V3, dag 2

## Steg 0 — lärde FÖRE sökningen

### 0A. Axels svar (18 nya, alla på gårdagens V3-batch) → 35 svar totalt: 22 ja / 7 kanske / 6 nej

| Dom | Produkt (09-11) | Orsak Axel | Varför-läsning (orsakstyp) |
|---|---|---|---|
| ja | Snöskoterkapellet 600D | Känns rätt · Deadline nu · Skyddar något | — |
| ja | ATV-kapellet Heavy Duty | Känns rätt · Deadline nu · Skyddar något | — |
| ja | Isfria vattenskålen 2,2 L (utekatt) | Känns rätt · Skyddar något · Deadline nu | — |
| ja | Viltsläden — rullbar dragmatta | Känns rätt | — |
| ja | Snöslungehuven 600D · Hönsgårdstaket · Takluckehuven 2-pack · Snöflingor till garageporten · Snöskyffeln Makita · Kajakhållaren 2-pack · Värmesitsen älgpass · Fågelmataren med kamera · Täljsetet · Adventskalender Dinosaurier · Motorlåset utombordare | (inga etiketter) | — |
| kanske | Hjulskydden 4-pack husvagn/släp | — | flerköp men "sett innan"-risk (däckskydd finns hos kedjan, STATUS 09-11 K4/K6) |
| kanske | Vedställsbeslaget 2-pack | — | kunden måste köpa reglar själv — lågt upplevt värde i bild (två beslag) |
| **nej** | Släpkärrekapellet 220×125 | **"Nöjd med det han har"** | **standardutrustning/sett innan** — kapellet följer ofta med kärran (samma som ramperna 09-10). Objektraden Släpkärra får anteckningen; kapell på kärra söks inte igen. Inte "överdrag är dött": han sa ja till fyra andra kapell/huvar samma dag. |
| **nej** | Värmepumpsskyddet i aluminium (1 499 kr) | — | **montering + pris**: styv låda som ska skruvas fast (montering_app = ja är HÖG förlorarsignal, 1 av 6 vann) och 1 499 kr utan att objektet syns "fara illa" i heron. Backlog-raden (snötak) stängs — inte kategorin luftvärmepump. |
| **nej** | Gårdshundens plastkoja (999 kr) | — | **kedjan har formen** (plastkojor 700–1 500 hos Granngården/Jula, hyllfrånvaro saknas) + "sett innan". Kattkojan vann för att formen (isolerad, på ben) inte fanns; plastkojan är kedjans standard. Backlog-raden gårdshund stängs; H09 (djur ute) lever — han sa ja till vattenskålen och hönstaket. |

**Signal ur svaren:** 15 av 15 icke-skyddsrader utanför överdragsfamiljen fick ja eller kanske (kajakhållare, värmesits, snöskyffel, täljset, fågelkamera, snöflingor, viltsläde, motorlås, vattenskål, dinosauriekalender) — diversifieringen efter "för mycket överdrag" träffade. Alla tre nej är skyddsformer på objekt där kedjan eller ägaren redan har lösningen.
`vikter.json`: 0 stopp, 25 lyft (klick är bevisnivå 2 — visas, styr inte). `koncept.json`: 243 koncept, 18 svar inlästa.

### 0B. Metas facit (snapshot `facit/snapshots/2026-09-12.json`, 84 kampanjer → 76 produkter: **19 REAL WINNER · 21 REAL LOSER · 34 INSUFFICIENT · 2 UNTESTED**)

| Launch | Spend | Köp | ROAS / BE | Band | Klass | Bekräftad? |
|---|---:|---:|---|---|---|---|
| Taköverdraget för Husvagn 6,5 × 3 m (V1, 09-09) | 7 300 | 47 | 7,38 / 1,63 | HIGH | REAL_WINNER | preliminär — snapshot 1 = 09-11, ≥ 3 dygn = tidigast 09-14 |
| Adventskalendern Racingbilar (V3, 09-08) | 5 189 | 20 | 2,33 / 1,62 | HIGH | REAL_WINNER | preliminär (09-14) |
| Isolerade Utekattkojan (V2, 09-09) | 4 152 | 13 | 2,60 / 1,62 | HIGH | REAL_WINNER | preliminär (09-14) |
| **Termoskyddet för Husbil 211 × 171 cm (Axels egen, 09-11, 559 kr)** | 1 511 | 11 | **4,33 / 1,61** | MEANINGFUL | **REAL_WINNER (ny)** | preliminär — första snapshot i dag |
| Stegstödet 2-pack (09-10) | 1 974 | 2 | 0,72 / 1,63 | TOO_EARLY | INSUFFICIENT, lutning negativ | — |
| Staketstolpslagaren 2-pack (09-10) | 1 875 | 1 | 0,91 / 1,66 | TOO_EARLY | INSUFFICIENT, lutning negativ | — |
| Solcellslarmet 2-pack (09-11) | 1 494 | 1 | 0,51 / 1,63 | TOO_EARLY | INSUFFICIENT, lutning negativ | — |

- Nytt i facit: **Termoskyddet** — researchen killade det 2026-09-10 på K7 (landad 522 mot WeCamp 793); Axel launchade själv och det ligger på ROAS 4,33 efter ett dygn. Skrivet som **motbevisat antagande nr 8** i `hypoteser.json` (ekonomigrinden pris ÷ landad < 2,4). Tredje gången modellens grind dödar en vinnare (taköverdraget, adventskalendern, termoskyddet).
- Två kampanjer utan produktkoppling (MagiBorsten - SE 1 716 kr, Följ bäver 750 kr) taggade i `historik-taggar.json` som *ingen produkt* — de stod som okopplade i FACIT.md; räknas inte i signalerna.
- `utfall.json` omskriven ur facit (7 launchade forskningsprodukter), `koncept.py backfyll` kört.

### 0C. LEARNING_STATE.md (omskriven 2026-09-12, läst)

- Vinnarna: objekt_ute ja 16/19 · 55+ småhus 16/19 · B_SKYDDA_DYRT **8 av 9** dömda vann · deadline uppställning **4 av 4** · ankare ≥ 1,6× **4 av 4** · prisband 500–999 **8 av 10** · form överdrag 8 av 9. Förlorarna: objekt_ute nej 16/21 · deadline ingen 19/21 · form annat **0 av 13** · montering_app ja 1 av 6.
- Hypoteser: H01 (dyr sak ute + väderhot + formsydd form) och H02 (hårt datum) får Termoskyddet som femte/femte vinnare — **stärkta**. H07 (Axels verktygslauncher förlorar): Stegstödet, Staketstolpslagaren, Solcellslarmet alla under BE men TOO_EARLY — ingen dom än. H09 (djur ute): fortfarande inget launchat test (vattenskål + hönstak fick ja i går). H11/H12 (ordning, maskinen gör jobbet): Axel ja på kajakhållare, snöskyffel Makita — inget Meta-test än.
- Prediktion vs verklighet: 4 dömda launcher — researchen rätt på 1 (kojan), fel på 3 (taköverdraget refuterat, adventskalendern killad, termoskyddet killat). **Mönstret i felen är ett och samma: en enskild grind (pris > 1 000, STOPPORD, pris ÷ landad) dödade en rad där strukturen var rätt.** Rank per profil (V3) i stället för totalpoäng är rätt svar; ekonomin får bara vara en hård grind på BE-CPA ≥ 190.

### 0D. Säsong (`korningar/2026-09-12/SASONG.md`, 43 fönster)

NOW som styrde i dag: första frost Norrland 0,9 v / Svealand 4,7 v / Götaland 5,3 v · uppställning husvagn & båtupptagning 4,0 v · höstregn 4,0 v · MC-avställning 4,7 v · lövfällning 4,7 v · vedsäsong 4,7 v · robotindockning 6,1 v · första snö Norrland 6,1 v / Svealand 9,9 v · fars dag 8,1 v · utedjurens fönster stänger 9,1 v · 1 december 10,4 v · isläggning 10,6 v. EARLY (parkerat): snölast mitt i vintern 18,6 v, isfiske 18,6 v, sportlov 23 v.
