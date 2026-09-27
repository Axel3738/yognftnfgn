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

## Steg 1–4 — tre linser, 7 kandidater → 7 klarade grindarna → batch 7 (levererad först 27/9 — sessionen somnade efter arkbygget)

| Lins | Sökt | Levererat | Strukna (skäl) |
|---|---|---|---|
| AE (H05, hobbysetet som aktivitet) | ~25 fraser, PriceRunner + fackhandel | 2: Läderplånbokssetet 14 delar (svensk handel säljer verktyg/läder/mallar styckvis, aldrig setet), Flugbindningssetet med städ (H06: flyangler 199 under, Loon 789 = 1,61×) | **sortiment:** golfgrepp 20+, knivslipsystem 20+, agility 20+, fågelholk 20+, ljusstöpning, bivaxark (Panduro) · **ankare utan Ali-listning → backlog:** jägarens styckset (Outdoor Edge 780–1 226), lockpipe-set, knivbyggsats med slida · whiskyfat golv 389–479 · ismete EARLY 16,6 v |
| AF (H01/H02/H06, skyddet inför datumet) | ~30 PriceRunner-frågor + getcamping/watski/hjertmans | 3: Motorstödet till utombordaren (H06: VEVOR 364 under, Attwood 1 049 = 1,62×), Däckvaggorna 2-pack (0 träffar i formen, H08 flerköp), Luftvärmepumpens topphuv (LÅG, asymmetrisk: PriceRunner 0 mjuka huvar) | MC-avställning noll (allt kedjeform eller i katalogen); robotgarage 60–200 USD; styvt värmepumpstak → 1 299+; bunkglid + montering; pizzaugnshuv sortiment 20 (Ooni 511 < 1,6×); MC-hjulstöd Homcom 487; solcellsventil båt (håltagning); gasol/kula/stödben/ventiler = sett innan/K7 |
| AG (H07/H12, maskinen i höstjobben) | 13 objekt, ~27 PriceRunner-frågor | 2: Rännstaven till högtryckstvätten (faktura 1 490–3 300 kr/gång; H06: kopior 325 under, Kärcher 899 = 1,8×), Repsågen för höga grenar 135 cm (arborist 2 000–6 000/träd; PriceRunner 0 i formen) | **ankare utan Ali-listning:** oxalsyraförångaren (Varrox 1 867 = 2,5×, 0 träffar på sex fraser), robotklipparens vinterväska (Gardena nu 599, Worx 199 under; 5 fraser till utan listning), takmossaskrapa · **sortiment:** rännskopor 10+, robotserviceset, vägghängare, vedbärare, elektrisk kedjeslip (K0), avloppsslang 12+ · rännsug bara proffs 164–875 USD |

**rank.py:** 7 → 7 unika → 7 klarade grindarna → batch 7 (5 exploitation / 0 exploration / 2 säsong; exploration under minimum). Skyddsformer 1 av 7. En SAK-kollision (motorstödet mot Motorlåset K0236 — samma objektrad "Utombordare — kåpan…" + annat) löst med unikt objekt.

## Batchen (sida: publicerad 27/9 som obesvarade kort på dagens sida; ark `Leverantorsoffert-2026-09-26.xlsx` med inbäddade bilder, prisfälten tomma)

| # | Produkt | Slot | Objekt · form · arketyp | Pris · BE-CPA | Säsong | Ankare / golv | Största risken |
|---|---|---|---|---|---|---|---|
| 1 | Repsågen för höga grenar 135 cm (K0334) | exploit | NYTT trädets höga grenar · verktyg · D (H07) | 899 · 360–458 | lövfällning 2,7 v | arborist 2 000–6 000 (2,2×) / — | Fyndiq/Amazon olästa |
| 2 | Däckvaggorna under det uppställda hjulet, 2-pack (K0335) | exploit | husvagn/husbil — hjulen · annat (stöd) · B (H08) | 549 · 303–348 | uppställning 2,0 v | inget ankare / 0 träffar i formen | liknar uppkörningsramp (K0225 nej) — creativen måste visa hjulet i vila |
| 3 | Motorstödet till utombordaren på trailern (K0336) | exploit | NYTT utombordarens motorstöd · annat (stöd) · B (H06) | 649 · 294–358 | båtupptagning 2,0 v | Attwood 1 049 (1,62×) / VEVOR 364 | bultas på akterrullen |
| 4 | Luftvärmepumpens topphuv med remmar (K0337) | exploit ASYM | luftvärmepumpens utedel · huv · B (H01) | 299 · 227–240 | första snö norr 4,1 v | Skotte plåthus 990 (annan form) / 0 mjuka | bubbelfolie = K8 lågt; datum 4–8 v |
| 5 | Rännstaven till högtryckstvätten (K0338) | exploit ASYM | hängrännor · verktyg · D (H06) | 499 · 285–324 | lövfällning 2,7 v | Kärcher PC 20 899 (1,8×) / kopior 325 | kräver Kärcher-fäste — variant per märke |
| 6 | Läderplånbokssetet, 14 delar förstansade (K0339) | säsong | NYTT läderplånbokssetet · låda · G (H05) | 699 · 333–400 | fars dag 6,1 v | ingen svensk aktör säljer setet / verktyg VEVOR 684 | lädersort okänd (PU?) — kräv prov |
| 7 | Flugbindningssetet med städ, 6 delar (K0340) | säsong ASYM | NYTT flugbindningssetet · låda · F (H06) | 489 · 255–298 | fars dag 6,1 v | Loon Core 789 (1,61×) / flyangler 199 | 6 delar utan material; vattenstämpel i heron |

Alla 7 LIVE_VERIFIED 04:44–04:53 UTC, hero sedd, materialklass 1–2.

## Parkerade (`backlog.json`)
Jägarens styckset i låda (Outdoor Edge 780–1 226, ingen Ali-listning) · lockpipe-set · knivbyggsats med slida (Brisa) · oxalsyraförångaren (Varrox 1 867 = 2,5×, ingen listning) · takmossaskrapa (lucka i SE, ingen listning) · robotklipparens vinterväska (Worx 199 under — stängd) · tidigare: bilbana 1:43, RC-snöslunga, betesbåt, plinko, parkeringshus, kattens jaktmaskin, fyra-i-rad trä, kortgivare, snöskulptursäck, nyckelhålslampa, fenderskydd, hästhink, igelkott, isfiske.

## Metodfynd i dag
1. **Sessionen somnade mellan arkbygget och publiceringen** — batchen låg färdig i 24 timmar utan att Axel såg den. Ordningen ska vara publicera → STATUS, inte STATUS → publicera; och rutinen bör aldrig lämna en byggd batch opublicerad över ett turbyte.
2. **H05:s tredje vinnare (täljsetet 6,24) är ett hobbyset, inte en kalender** — men hobbyset som form är fackhandelns sortiment; luckan öppnar bara där handeln säljer delarna men inte setet (läder, flugbindning med städ).
3. **"Stöd" är en ny form som klarar grindarna** (motorstöd, däckvaggor): B_SKYDDA_DYRT utan att vara ett överdrag — formtaket slår inte, och objektet är detsamma som vinnarna (utombordare, husvagn).
4. **Tjänsten man slipper bär bara när verktyget fäster på en maskin ägaren redan har** (rännstaven på Kärchern) eller ersätter stegen (repsågen) — verktyg för jobb kedjan säljer i 10+ varianter faller varje gång (lins AG).
5. **Spabadskapellet (Axels ja) 0 köp på 2 075 kr** — H01 gäller inte objekt som redan har en egen lösning (lock) och fackhandelssortiment. Regel: "dyr sak ute" kräver också "ingen egen lösning".
6. Två nya verktyg: `katalog.py` (Shopify-dump som repo-skript i stället för scratchpad) och `butik_koppla.py` (butiksprodukt → koncept/launch-koppling/taggar i ett kommando).

## Tio kontrollfrågor (MASTERPROMPT §9)
1. Kattkojan: ingen djurlins i dag; kojan K0. Ja. 2. Taköverdraget 164 586 / 407 / 3,04 — H04 bär ingen rad i dag (max 899). Ja. 3. Kalendern 12 353 / 37; golfkalendern 3,25 — inga kalendrar sökta (12 i butiken). Ja. 4. Verktygen: två (repsågen H07, rännstaven H06/H07) med faktura-ankare utskrivet. Ja. 5. Verktyg levererat: två, medvetet. Ja. 6. Deadline per rad: 7 av 7 NOW (2,0–6,1 v). Ja. 7. Ankare per rad: 5 mätta med URL, 2 "ingen svensk aktör i formen" (däckvaggor, läderset) med kollade källor. Ja. 8. Hero per rad: alla 7 sedda; vattenstämpel (flugbindning), bubbelfolie (värmepumpshuv) anmärkta. Ja. 9. K0 på SAK: katalog-live 09-26 (248), koncept.py sok, kontot; en kollision löst. Ja. 10. Taggar + per_kriterium + koncept-id K0334–K0340; LEARNING_STATE omräknad FÖRE sökningen. Ja.

## Definition of done (2026-09-26)
- [x] 0A 11 svar inlästa (2/0/9), 11 butiksprodukter kopplade (butik_koppla.py)
- [x] 0B Metas facit (`facit/snapshots/2026-09-26.json`); täljset + golfkalender vinnare, spabadskapell förlorare; RC-bilar taggade
- [x] 0C LEARNING_STATE omskriven och läst; prediktion vs verklighet (1 av 13; klicken 6 av 11) kommenterad
- [x] 0D SASONG.md; bara NOW-fönster
- [x] Discovery 3 linser (AE/AF/AG), 5/0/2 — exploration under minimum
- [x] Varje rad LIVE_VERIFIED med UTC-stämpel, hero sedd
- [x] Golvet läst med URL per rad; materialklass; ekonomi som intervall, BE-CPA ≥ 190
- [x] Batch 7 (< 10, motiverat: 4 bra slår 12 svaga), ingen utfyllnad
- [x] Ark byggt med bilder (prisfälten tomma) — **sida publicerad först 27/9** (sessionen somnade)
- [x] koncept.json bär K0334–K0340
- [x] STATUS.md + LEARNING_STATE-raden + RUTIN-KVITTO; committat och pushat (27/9)
- [ ] Discord-rapport 26/9 — ❌ skickades inte (sessionen somnade); ingår i 27/9:s rapport
