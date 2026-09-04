# Kluster JAKT (jakt · höstfiske · jakthund · friluft) — produktjakt V2, 2026-09-04

**Status: provisorisk.** Temu blockerade IP:n 01:00–01:15 UTC (tomt skal utan JSON-LD för alla goods-id) och WebSearch-budgeten tog slut mitt i klustret. Enligt koordinatorns besked är därför Temu-fälten (pris, betyg, recensioner, bilder, video) `null` i `jakt.json`, `video_checked: false`, material = "UNKNOWN — ej hämtad" och tier är satt på gate 1–3 + 6–8. Svenska hyllan är verifierad live via **Pricerunner** (indexerar Jula m.fl.) och **Hylte Jakt & Lantman** (fackhandel) — Biltema, Jula, Clas Ohlson och Rusta svarade 403/404 direkt, så "big-box ej verifierat" står där det gäller. Materialgaten och priset görs centralt när blocket släppt.

## (a) Objektuniversumet

| Ägt objekt | Vad ägaren behöver | Kandidat funnen |
|---|---|---|
| **Handkikaren** (1 500–30 000 kr, i nackrem hela passet) | bära utan nacksmärta, regnskydd på linser | kikarsele/bröstväska ✅, linslock+regnskydd |
| **Jakttornet / passet** (jaktlagets, står ute hela hösten) | sitta varmt/torrt/mjukt, tak mot regn, stöd för bössan | tornsits med rem ✅, jaktparaply ✅, värmesits USB, fönsterstödsäck |
| **Geväret** (bara tillbehör utan vapenfunktion) | vila stadigt vid skott | sandsäck/skjutstöd (fackhandel har det), kolvskydd ✗ |
| **Kikarsiktet** | regn/repor | neoprenskydd (Mjoelner 224 kr finns → ✗) |
| **Åtelkameran** (2–5 st per jägare, sitter ute) | fästa rakt, byta batteri, skydda | trädfäste 1/4-20 (5etta 149 kr finns), solpanelsfäste |
| **Jakthunden** | torka, synas, skyddas, åka bil | torkrock (Siccaro-ankare, storlekar), reflexväst (62 kr ✗), bilhängmatta (Trixie 224 ✗), tassar ✗ |
| **Viltet** (undvik) | dra ut | viltsläde (jaktpulka 499 finns ✗) |
| **Vadarstövlar** (höstfiske) | torka/hänga | vadarhängare (ingen hylla, men plastgalge-pris) |
| **Sittplatsen** (friluft, universell) | isolera, sitta | sittunderlag ✗, trebensstol ✗, stolsryggsäck ✗ (allt finns hos 5etta/Hylte) |

Inte sökta (WebSearch-budgeten slut): gäddspöförvaring, isborr, pannlampa (jämförelsehandlad), termos, GPS-halsband (jämförelsehandlat), hundbur bil, solpanel åtelkamera, ATV-vapenställ.

## (b) Sökfraser

WebSearch `site:temu.com …`: binoculars harness strap chest · hunting seat cushion tree stand insulated · shooting rest tripod hunting blind rifle rest · trail camera mount tree bracket strap · hunting dog vest protection orange reflective · dog drying coat towel robe after swim · rifle scope cover neoprene protective lens cap · game sled deer drag sled hunting · backpack stool hunting folding seat chair · wader hanger boot dryer hanging rack · hunting umbrella tree stand blind rain cover · shooting sticks tripod hunting rest telescopic · dog car seat cover trunk hammock waterproof back seat · binocular rain guard objective lens cover · heated seat cushion outdoor usb rechargeable hunting · rifle sling neoprene padded gun sling swivels (0 Temu-träffar) · trail camera security box lock steel case (0) · dog boots paw protection hunting dog leg · fishing rod holder wall garage storage rack rods (0) · rifle scope cover neoprene scope coat · foam sitting pad folding outdoor insulated seat mat · gun rest window hunting blind tower rail rest (0). Åtta till avvisades (budget slut).
WebFetch Temu-listsidor: `shooting-rest-s.html` (40 produkter, gav fönsterstödsäck 601099536908795 + kulledsstöd 601102189720371), `hunting-dog-vest-5030161644324-s.html` (38 produkter).
Svenska hyllan (`raw/jakt/shelf.py`, Pricerunner + Hylte): kikarsele · jaktparaply · skjutstöd · skjutstöd fönster · sittdyna jakt · jakttorn · jakttornsdyna · sittunderlag · jaktstol · stolsryggsäck · åtelkamera fäste · torkrock hund · torkrock hund siccaro · hundväst jakt · hundskydd bil baksäte · viltsläde · vadarstövlar hängare · kikarsikte skydd neopren · linsskydd kikare · kikarrem · värmedyna uppladdningsbar.

## (c) Tratten

| Steg | Kvar |
|---|---|
| Råkandidater | 43 |
| Gate 1 OBJEKT | 41 (−2: kolvskydd = vapenfunktion, hundskor = passform) |
| Gate 2 PRESENS | 40 (−1: camo-kjol för amerikansk ladder stand) |
| Gate 3 HYLLAN | 24 (−16: sittunderlag, trebensstol, stolsryggsäck, hundbilskydd, reflexväst, skyddsväst, kikarsiktesskydd, viltsläde, rem-kikarsele utgången) |
| Gate 4 MATERIAL | **UNKNOWN för alla 24** (Temu-block) |
| Gate 5 EKONOMI | UNKNOWN (pris ej hämtat); 15 av 24 flaggade C på prisklass/fackhandelstak |
| Gate 6–8 VARIANT/HOOK/PUBLIK | 22 PASS, torkrock ✗ (storlek), vadarhängare OSÄKER (publik) |
| **Tier A (provisorisk)** | **1** — kikarsele/bröstväska |
| **Tier B (provisorisk)** | **8** — reservkikarsele, jaktparaply, 4 tornsitsar, 2 värmesitsar |
| Tier C | 15 |
| ELIM | 19 |

## (d) Tier A och B

### A — Kikarsele / bröstväska för kikare (provisorisk A)
- **PRODUCT:** Camo hunting chest pack with binocular harness, rangefinder pocket, rain cover
- **TEMU URL:** https://www.temu.com/se/g-601099566089885.html (reserv: g-601099523680456 — /se visade "Ej tillgänglig för köp" via WebFetch 01:05 UTC, kan vara SSR-skalet)
- **OBJECT/OWNER:** handkikaren; varje jägare på pass, plus fågelskådare
- **EXISTING FRICTION:** nackremmen skär efter timmar, kikaren slår mot bröstet i drevet, regn på okularen
- **OLD WAY:** originalremmen; kikaren i jackfickan
- **PRODUCT'S ROLE:** fördelar vikten på axlarna, håller kikaren still och torr på bröstet
- **WHY THE AD DOES NOT NEED TO CREATE DEMAND:** älgjakten pågår nu; smärtan är där varje passdag (jfr axelbältet — samma kroppsliga payoff)
- **TEMU MATERIAL:** UNKNOWN — ej hämtad
- **0–3 SECOND PROOF:** UNKNOWN — ej hämtad
- **SWEDISH SHELF STATUS:** bara fackhandel (Pricerunner + Hylte 2026-09-04): Max-On Kikarsele Pro **149 kr** (enkel rem), Vortex 390, Bushnell 495, Härkila Deer Stalker 1 295, Härkila AXIS 1 742–1 895, Leupold 1 995, Eberlestock 2 495. Ingen Biltema/Jula/CO/Rusta-träff (Jula indexeras i Pricerunner; Biltema ej verifierad).
- **TEMU PRICE:** null (ej hämtat)
- **PLAUSIBLE SWEDISH PRICE:** 349–449 kr om landad ≤ 150 kr (uppskattning, ej räknad)
- **ECONOMIC ROOM:** UNKNOWN tills Temu-priset finns. Ankaret Härkila 1 295 är 3× ett 449-pris.
- **VARIANT FRICTION:** ingen — en storlek, justerbar
- **≤7 WORD OWNERSHIP HOOK:** "Får du ont i nacken av kikaren?"
- **WINNER-STRUCTURE MATCH:** 72
- **TOP 3 REASONS:** (1) ägd sak värd ≥10× priset, kroppslig smärta i säsong; (2) ingen big-box-hylla, synligt märkesankare 3×; (3) camo + kikare är omisskännligt i flödet, 271 000 jaktkort
- **BIGGEST REASON IT COULD FAIL:** Max-On-remmen 149 kr — ser vår ut som en rem faller ankaret; och kroppslig payoff kan kräva UGC (axelbältets lärdom)
- **CONFIDENCE:** MEDIUM (material + pris ej sett)

### B — Jaktparaply för torn/pass
- **PRODUCT:** 58" heavy duty tree stand hunting umbrella, camo canopy, tool-free setup
- **TEMU URL:** https://www.temu.com/se/g-601103949421856.html
- **OBJECT/OWNER:** öppet jakttorn, stege, markpass — jaktlagets/ägarens
- **EXISTING FRICTION:** regnet i septemberpasset — blöt bössa, kikare, jägare
- **OLD WAY:** presenning, regnkläder, sitta hemma
- **PRODUCT'S ROLE:** spänns runt stam/stolpe, tak på 30 sekunder
- **WHY THE AD DOES NOT NEED TO CREATE DEMAND:** regnar det under älgjakten är problemet där; bilden av ett paraply i ett torn förklarar sig själv
- **TEMU MATERIAL / 0–3 s:** UNKNOWN — ej hämtad
- **SWEDISH SHELF STATUS:** ingen — Pricerunner "jaktparaply" ger bara vanliga paraplyer (Mil-Tec Woodland 276), Hylte noll (2026-09-04)
- **TEMU PRICE:** null · **PLAUSIBLE SWEDISH PRICE:** 499–699 (uppskattning) · **ECONOMIC ROOM:** UNKNOWN — stort paket, fraktrisk
- **VARIANT FRICTION:** ingen
- **HOOK:** "Regnar det in i jakttornet?"
- **MATCH:** 68 · **TOP 3:** ingen hylla alls, kategorinyhet i svenskt flöde, omisskännlig bild · **FAIL-RISK:** de flesta svenska torn har tak → publiken är öppna torn/stegar/markpass; montering; pris > 1 000 om landad > 400 · **CONFIDENCE:** MEDIUM

### B — Tornsits med spännremmar (4 listningar)
- **PRODUCT:** Adjustable hunting tree stand seat, thick foam, camo Oxford — g-601099667428425 (bäst enligt titel); g-601099904892660 / g-601099744439687 (dyna med rem); g-601103482843682 (dyna + överdrag)
- **OBJECT/OWNER:** tornets träbänk; jaktlaget
- **EXISTING FRICTION:** kall, blöt, hård bänk i timmar; skumdynan glider av
- **OLD WAY:** sittunderlag 49 kr, tidning, gammal kudde
- **PRODUCT'S ROLE:** vadderad sits som spänns fast och stannar kvar i tornet
- **WHY NO DEMAND CREATION:** första morgonpasset i oktober gör jobbet
- **MATERIAL / 0–3 s:** UNKNOWN
- **SHELF:** samma kategori (sittunderlag 5etta 49–69, Woolpower 99, Härkila 149) men inte formen; ankare Woodline Värmesittdyna 716 (Hylte), Hunter Heat 599 (Pricerunner). Big-box ej verifierat.
- **TEMU PRICE:** null · **PLAUSIBLE SE PRICE:** 349–449 · **ROOM:** UNKNOWN
- **VARIANT:** ingen · **HOOK:** "Kallt och hårt i jakttornet?" · **MATCH:** 60
- **TOP 3:** ägd plats i säsong, formen saknas på hyllan, videon (spänn fast → sätt dig) är en handling · **FAIL-RISK:** ser den ut som ett 49-kronors sittunderlag i annonsen vinner hyllan; "köpt old way som fungerar" · **CONFIDENCE:** MEDIUM

### B — Värmesits USB för torn/pass (2 listningar)
- **PRODUCT:** g-601099898313877 (Oxford, 3 lägen, hopfällbar) · g-601099772450298
- **OBJECT/OWNER:** sittplatsen i tornet + powerbanken jägaren har
- **FRICTION:** 0–5 °C i timmar · **OLD WAY:** fårskinn, värmepåsar · **ROLE:** värme på bänken
- **MATERIAL / 0–3 s:** UNKNOWN
- **SHELF:** USB-värmedyna är commodity 155–285 kr (Pricerunner); jaktversionen har ankare Hunter Heat 599 / Woodline 716 → OSÄKER, kräver Woodline-look
- **PRICE:** null · **PLAUSIBLE:** 449–549 · **ROOM:** UNKNOWN
- **VARIANT:** ingen (batteri ingår ej) · **HOOK:** "Fryser du om baken i jakttornet?" · **MATCH:** 52
- **TOP 3:** säsong, kroppslig payoff som syns direkt, ankare finns · **FAIL-RISK:** commodity-formen i samma flöde; kräver powerbank · **CONFIDENCE:** LOW

### B — Reservkikarsele g-601099523680456
Samma bedömning som Tier A; tier B enbart för att /se-sidan såg otillgänglig ut vid WebFetch. Verifiera centralt.

## (e) Lärorika Tier C-avslag

1. **Åtelkamerafäste (4 listningar, C).** Alla åtta gates ser gröna ut — ägd sak ute, säsong, 1/4-20-standard, "Hänger åtelkameran snett på trädet?" — men Hylte säljer exakt formen för **149 kr** (5etta Universal kamerafäste) och Flexifästet för 239. Fackhandelns pris blir vårt tak; enda vägen till ≥ 300 kr är ett 3-pack, och då konkurrerar vi med "köp tre hos Hylte". Lärdom: hyllgaten måste köras mot **fackhandeln**, inte bara Biltema/Jula — för jakt är Hylte/Widforss/Jaktia hyllan.
2. **Torkrock för hund (C).** Presens perfekt (blöt jakthund i bilen varje septemberdag), starkt ankare (Siccaro 645–1 849, Rukka 349–539) — men storlek efter **rygglängd** som ägaren måste mäta, och kategorin är redan jämförelsehandlad med märken som annonserar själva. Lärdom: ett ankare räddar hyllan, inte varianten.
3. **Skjutstöd/sandsäck (4 listningar, C).** Objekt + presens + hook fungerar ("Vilar du bössan på tornkanten?"), men (i) fackhandeln har formen (Caldwell 495, Champion 499, 5etta 165–749), (ii) Meta-policyrisk för vapentillbehör, (iii) en sandsäck bär inte 300 kr. Lärdom: "tillbehör till geväret" är rätt tanke men fel prisklass — det som kostar i jakt är optik, inte stöd.

**Nästa steg (centralt):** hämta Temu-data för de 9 A/B-listningarna (kikarsele 566089885 + 523680456, paraply 103949421856, tornsits 667428425 / 904892660 / 744439687 / 103482843682, värmesits 898313877 / 772450298), kör frames på videon, räkna ekonomin. Sedan avgörs om kikarselen håller A.
