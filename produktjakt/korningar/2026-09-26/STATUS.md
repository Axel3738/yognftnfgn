# Produktjakt 2026-09-26 (vecka 39, lördag) — V3, dag 9

⚠️ **Rutinen stod stilla 2026-09-25.** Triggern avfyrades 04:34 UTC den 25:e men sessionen vaknade först 04:33 UTC den 26:e (notisen låg köad ett dygn). Ingen körning den 25:e; dagens körning täcker båda dagarna.

## Steg 0 — lärde FÖRE sökningen

### 0A. Axels svar: **11 nya** på julrunda 3 (2 ja / 0 kanske / 9 nej) → 125 totalt (73 ja / 16 kanske / 36 nej)
**Ja:** Katten full av katter, träpussel med ram (K0326); Ballongfäktningen, två trädockor (K0329). **Nej (utan etikett):** dragfjädern, ferrofluidflaskan, regnmolnet, vargpusslet, ringkrok-spelet, kaospendeln, bollkastaren, rävpusslet, väggkastaren för katten.
Läsning över tre julrundor (31 kort svarade): ja på 11, kanske 2, nej 18. **Vinnare i klick:** tävling/rörelse på bordet för flera (curling, Tetra Tower, hästkapplöpning, ballongfäktning, pingisrobot), stora synliga byggen (fyren, pariserhjul, kulbanetorn, julgran), formen ingen sett (kattpussel med ram). **Förlorare:** husdjursleksaker 0/3, skrivbordskinetik 0/3, sport/träning 0/3, klosståg/coaster, ensamsysslor. Spel/leksaker är uttömda för nu — dagens körning är ordinarie (ute-objekt, hobbyset, höstjobb).

### 0A′. Butiken: **+11 sedan 09-24** (248 aktiva). Axel la in: Båthuv trailerbåt 989 (K0244), Fönstertermomatta 539 (K0267), Slangboxhuv 389 (K0284), Kamadohuv 649 (K0245), Krukbärrem 539 (K0278), Läktarponcho med värme 849 (K0269), Regntunnehuv 349 (K0288), Scooterkapell 569 (K0257), Sorkkorgar 569 (K0280), Trädansiktet 389 (K0259), Maskinhylla 1 039 (K0253). Alla kopplade med nya `butik_koppla.py` (koncept.butik + launch-koppling + historik-taggar). Ur butiken: Elcykelbatteriets vinterjacka olivgrön (ersatt av svart variant), Automatisk fågeldrickare, Sushi-strumpor, Marin polish.

### 0B. Metas facit (snapshot `facit/snapshots/2026-09-26.json`; **25 REAL WINNER · 27 REAL LOSER · 49 INSUFFICIENT · 5 UNTESTED**; 116 kampanjer → 106 produkter)

| Kampanj | Spend | Köp | ROAS / BE | Klass | Läsning |
|---|---|---|---|---|---|
| Taköverdraget husvagn (V1) | **164 586** (+29 024 på två dygn) | 407 | 3,04 / 1,63 | REAL_WINNER | skalar vidare, ROAS glider 3,24 → 3,04 |
| Termoskyddet husbil | 29 251 | 120 | 2,46 / 1,61 | REAL_WINNER | |
| Sotarsetet | 16 532 | 91 | 2,86 / 1,61 | REAL_WINNER | +5 018 / +19 köp på två dygn |
| Solcellslampan | 10 688 | 24 | 1,84 / 1,62 | REAL_WINNER | nära BE vid skalning |
| **Täljset 30 delar** (K0243, kanske 09-11) | 1 848 | **12** | **6,24** / 1,63 | **REAL_WINNER (ny, MEANINGFUL)** | kontots högsta ROAS — H05 (hobbyset till namngiven mottagare) tredje vinnaren; modellen gav K0243 "kanske" |
| **Golf-adventskalendern** (Axels egen) | 2 110 | 9 | **3,25** / 1,70 | **REAL_WINNER (ny)** | hobby-identitet + hårt datum; pussel-/dinosauriekalendern förlorar — kalender vinner bara med HOBBY i namnet |
| ATV-kapellet (K0234) | 4 539 | 16 | 2,58 / 1,62 | REAL_WINNER (bekräftad, snapshot 09-24 + 09-26) | H06 (golv Jula 399 under) bekräftad i Meta |
| **Spabadskapellet** (K0-koncept ja) | 2 075 | **0** | — | **REAL_LOSER (ny)** | spabad har lock och fackhandelssortiment — H01 gäller inte objekt med egen lösning |
| Kapell till snöslunga · Dinosauriekalendern · Gör din egen · Biltvättborsten | — | — | < BE | REAL_LOSER | oförändrade |
| Pussel-adventskalendern (Axels) · Solcellsladdaren · Motorlåset · Dörr-/fönsterlarmet · Sittkäppen · Kajakhållaren · Infartslarmet | 1 500–2 200 | 1–4 | 0,59–1,27 | INSUFFICIENT − | Axels egna launcher 09-23/24 går svagt utom golf + täljset |
| Nya kampanjer (25–26/9): Värmesitsen 1 245/2, RC-driftbilen 1 139/1, Maskinhyllan 897/0, Värmesulorna 42, Rullknivslipen 36, Lövsilarna 0 (PAUSED) | | | | TOO_EARLY | RC-bilarna taggade i dag (G_Q4_GAVA, leksak) |

**Prediktion vs verklighet, 13 dömda launcher ur researchen:** vinnare taköverdraget, kalendern, kojan, sotarsetet, termoskyddet, ATV-kapellet, **täljsetet (kanske)**; förlorare biltvättborsten, dinosauriekalendern, hönsgårdsduken, snöslungekapellet, **spabadskapellet (ja)**, kajakhållaren (svag). Modellen rätt på 1 av 13; Axels klick rätt på 6 av 11 dömda. **Nytt i dag: två objekt Axel sa ja till gick åt olika håll — täljset (aktivitet, gåva) 6,24 mot spabadskapell (skydd på objekt med egen lösning) 0.**

### 0C. LEARNING_STATE.md (omskriven 2026-09-26, läst)
25/27/49/5. H05 tre vinnare (racingbilar, golf, täljset) — starkaste hypotesen just nu. H01/H02 får spabadskapellet + snöslungekapellet som förlorare: "dyr sak ute" räcker inte när objektet har lock/kedjeform eller datumet är > 4 v bort. H06 bekräftad i Meta (ATV) + klick ×2. H12 en vinnare (bandslip) / en förlorare (biltvättborste) / arbetslampan negativ.

### 0D. Säsong (`korningar/2026-09-26/SASONG.md`)
NOW: poolstängning 0,6 v · älgjakt syd 1,7 v · uppställning husvagn/husbil 2,0 v · båtupptagning 2,0 v · höstregn 2,0 v · MC-avställning 2,7 v · första frost Svealand 2,7 / Götaland 3,3 v · lövfällning 2,7 v · vedsäsong 2,7 v · invintring bin 2,7 v · robotindockning 4,1 v · vintermatning 4,1 v · första snö Norrland 4,1 v · höstlov 4,3 v · allhelgona 5,0 v · fars dag 6,1 v · vintertäckning 6,4 v · utedjur stänger 7,1 v · första snö Svealand 7,9 v · black week ~8,9 v · jul ~12 v.

## Linserna i dag

| Lins | Struktur | Slot | Hypotes | Varför |
|---|---|---|---|---|
| AE | Hobbysetet som är en aktivitet — 20–40 delar till en namngiven vuxen (fars dag 6,1 v, jul) | säsong | H05 | täljsetet 6,24 + golfkalendern 3,25 i dag |
| AF | Skyddet inför datumet 2–4 v bort — nya objekt/delar hos husvagns-, båt-, MC-ägaren; max 3 skyddsformer | exploitation | H01/H02/H06 | ATV-kapellet bekräftat; spabad/snöslunga visar gränsen |
| AG | Maskinen/setet som gör höstjobbet ägaren betalar för — vedsäsong, lövfällning, robotindockning | exploitation/exploration | H07/H12 | sotarsetet 91 köp, bälteslipen 2,49 |

Inga spel/leksaker (tre julrundor i går), inga kalendrar, ingen hönsgård/kanin, inget spabad.
