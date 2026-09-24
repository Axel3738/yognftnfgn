# Produktjakt 2026-09-24 (vecka 39, torsdag) — V3, dag 8

## Steg 0 — lärde FÖRE sökningen

### 0A. Axels svar: **0 nya** (75: 51 ja / 14 kanske / 10 nej). Gårdagens 8 + 6 från 16/9 obesvarade (ett dygn) — följer med på dagens sida.

### 0A′. Butiken: **+22 sedan i går** (237 aktiva). Axel la in **17 forskningsprodukter** som han sagt ja till: Bikupans vinterjacka, Buskjackan 2-pack, Elcykelbatteriets vinterjacka, Highland Cow-kalendern, Husbilens cykelhållarskydd, Husbilens tak-AC-huv, Husbilskalendern, Krukväxthuv 3-pack, Ljusslingevindor 10-pack, Lövsilarna 6-pack, Makita-hållare 5-pack, Poolvärmepumpens vinterhuv, Regnkedjan, Rullknivslipen, Vedklyvshuv, Värmesulor, Ädelstenskalendern — plus 4 egna (bordsfotboll, magnetiska byggblock, två radiostyrda bilar). Alla 17 kopplade i `launch-koppling.json`, taggade i `historik-taggar.json`, `butik` på koncepten. Kampanjer syns inte än (utom sex nya med < 200 kr: täljset, dörrlarm, golfkalender, solcellsladdare, pusselkalender, motorlås — taggade).

### 0B. Metas facit (snapshot `facit/snapshots/2026-09-24.json`; **23 REAL WINNER · 27 REAL LOSER · 42 INSUFFICIENT · 8 UNTESTED**)

| Kampanj | Spend | Köp | ROAS / BE | Klass | Läsning |
|---|---|---|---|---|---|
| Taköverdraget husvagn (V1) | **145 006** | **385** | 3,24 / 1,63 | REAL_WINNER | +26 tkr på ett dygn; ROAS glider 3,47 → 3,24 vid skalning, långt över BE |
| Termoskyddet husbil | 27 472 | 114 | 2,49 / 1,61 | REAL_WINNER | glider 2,72 → 2,49 |
| Sotarsetet | **11 490** | **72** | 3,26 / 1,61 | REAL_WINNER | +3 tkr / +16 köp på ett dygn — håller |
| **ATV-kapellet** (K0234, 579 kr, ja 09-11) | 1 963 | **11** | **4,07** / 1,62 | **REAL_WINNER (ny, MEANINGFUL)** | 940 → 1 963 kr, 6 → 11 köp — snabbaste vinnaren sedan taköverdraget; B_SKYDDA_DYRT igen |
| Solcellslampan · Inomhustofflorna | 8 426 · 6 165 | 19 · 19 | 1,88 · 1,78 | REAL_WINNER | båda glider mot BE vid skalning |
| Adventskalendern racingbilar | 12 353 | 37 | 1,75 | REAL_WINNER | stillastående |
| **Kapell till snöslunga** (K0224, 459 kr, ja) | 1 684 | 2 | **0,55** | **REAL_LOSER (ny)** | vår första launch-kandidat (86 p) förlorade — Axel prissatte 459 mot vårt 599; första snö är 3,9 v bort (Norrland) — för tidigt? |
| Hönsgårdsduken · Dinosauriekalendern · Biltvättborsten · Gör din egen | — | — | < BE | REAL_LOSER | oförändrade |
| Kajakhållaren (K0239, ja) | 1 719 | 1 | 0,59 | INSUFFICIENT − | H11 (ordning/flerköp) första test — svagt |
| Snöskyffeln Makita · Snöflingor · Vedklyvborren · Sittkäppen · Infartslarmet | 1 000–2 000 | 0–3 | < 1,4 | INSUFFICIENT − | |
| Fågelmataren med kamera | 4 266 | 3 | 1,71 | INSUFFICIENT + | stillastående |

**Prediktion vs verklighet: 10 dömda launcher ur researchen** — vinnare: taköverdraget, kalendern, kojan, sotarsetet, termoskyddet, **ATV-kapellet (ja)**; förlorare: biltvättborsten, dinosauriekalendern, hönsgårdsduken, **snöslungekapellet (86 p, launch-kandidat)**. Modellen rätt på 1 av 10 (kojan); klicken (ja) rätt på 5 av 9. **Två skyddsformer på maskinobjekt gick åt olika håll samma vecka: ATV (jakt NU, objekt 60–150 tkr) vann, snöslungan (snö om 4–10 v, objekt 8–25 tkr) förlorade — datumet och objektvärdet skiljer, inte formen.**

### 0C. LEARNING_STATE.md (omskriven 2026-09-24, läst)
Klasser 23/27/42/8. H01/H02 får ATV-kapellet som vinnare; snöslungekapellet som förlorare säger att "första snö 4–10 v bort" är för tidigt — H02:s "2–12 v före" bör läsas som 2–6 v för väderdatum. H11 (ordning) första test negativt (kajakhållaren). H12 (Makita) första test negativt (snöskyffeln 2 349 kr). Prediktion vs verklighet oförändrad i huvudsak.

### 0D. Säsong (`korningar/2026-09-24/SASONG.md`)
NOW: älgjakt syd 1,9 v · poolstängning 0,9 v · uppställning + båtupptagning 2,3 v · MC-avställning 3,0 v · första frost Svealand 3,0 / Götaland 3,6 v · lövfällning/vedsäsong 3,0 v · robotindockning 4,4 v · vintertid/mörkret 4,4 v · vintermatning 4,4 v · fars dag 6,4 v · vintertäckning 6,7 v · utedjur stänger 7,4 v · 1 december 8,7 v · isläggning 8,9 v · Black Week 9,1 v.

## Linserna i dag

| Lins | Struktur | Slot | Hypotes | Varför |
|---|---|---|---|---|
| AB | Tjänsten man slipper — hantverkaren utanför kaminen (VVS, plåtslagare, fönsterputs, skadedjur, båtvarv) | exploitation | H03/H12 | sotarsetet 72 köp |
| AC | Samma ägare som ATV-kapellet — fyrhjuling, skoter, jakt, vedgård | exploitation | H01/H02/H08 | ATV-kapellet REAL_WINNER 4,07 |
| AD | Hårda datum utan kalender — fars dag, robotindockning, vintermatning, isläggning, MC-avställning | säsong | H02/H05/H09 | säsongsslotten tom två körningar |
