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

Inga kalendrar, inga hönsprodukter, inga LÅG-rader. Golvet läses FÖRE ali.py i alla tre linser.

## Steg 1–4 — tre linser, 6 kandidater → 6 klarade grindarna → batch 6

| Lins | Sökt | Levererat | Strukna (skäl) |
|---|---|---|---|
| AB (H03/H12, tjänsten man slipper utanför kaminen) | 13 tjänster golvlästa före ali.py, ~15 fraser, 6 produktsidor | 2: Värmepumpstvätten (påse+spruta+borstar; servicebesök 1 500–2 500 kr, Ali-sats 799 mot ankare 1 900 = 2,38×), Hjulvagnen för vinterhjulen (däckhotell 1 000–1 500/säsong; Biltema 2 195 som golv OCH ankare = 1,69×) | **kedjan/fackhandeln har formen:** impelleravdragare (Båtaccenten 134), magnetisk fönsterputs (CDON 299), takfogtejp (Biltema ~100), radiatoravluftning (< 150), avloppsrens (Biltema PRO), snörake (Jula), hjulmonteringspinne (Biltema ~60) · **ingen Ali-listning:** råttspärr, stubbfräs (bara carving-skivor), takpannekrok · **förlorarform:** teleskopisk fönsterputs (= biltvättborsten REAL_LOSER) · **payoff syns inte på 3 s:** kopparband mot mossa · kedjeformer enligt ordern: momentnyckel, OBD, batteriladdare, mössfälla, fuktmätare |
| AC (H01/H02/H08, samma ägare som ATV-kapellet) | 25 fraser, 11 produktsidor (8 LIVE, 3 BLOCKED), 14 svenska sidor (ATVhuset ×7, Hylte ×3, Jaktia, zoo.se, P.Lindberg) | **0 av linsen**; huvudsessionen lyfte 1: ATV-vindrutan (H06-test, se nedan) | **ATVhuset täcker hela ATV-ägaren billigt:** 128 sadelöverdrag (universal 399), 25 vindrutor (universal 995), 19 gevärsfästen (från 470), 16 redskapsfästen (par 199/239), ryggstöd 690, syntetlina 379–449 · **jakt/hund:** torktäcke (Topline 269/Rukka 329), viltsäck styckvis 159–449 + Amazon.se har Ali-6-packet, åtelspridare/åtelbelysning (Genzo 595/995 ankare, ingen Ali-leverantör på 6 fraser), vapenfodral (Kolpin 1 490, Ali > 100 USD) · **skoter:** tunnelväska 399, sadelöverdrag/kälkekapell/skidglid utan Ali-form · släp/ved: kedja eller standardutrustning · burtäcke LÅG |
| AD (H02/H05/H09, hårda datum utan kalender) | 22 fraser, 12 produktsidor, 12 heron sedda, golvet läst före ali.py | 3: Kaninburens vinterhuv (första frost 3,0 v; ingen svensk kedja i formen — Teddytassen 89 är en plastskiva), Kikarbröstväskan (älgjakt 2,0 v + fars dag; Mystery Ranch 995 = 1,66×), Fiskedragsbyggsatsen (fars dag 6,4 v; ingen boxad byggsats i svensk handel) | **golv i exakt form:** fönsterfågelmatare (Vivara 139,90), robotklipparhuv (Grimsholm 99), pizzaugnshuv (Bauhaus 133/269 — Ooni 499–549 finns, H06-kandidat), enkel kikarsele (Vortex 349) · **ankare utan listning → backlog:** robotklipparens vinterväska (Gardena 689/Worx 639), knivbyggsatsen (Karesuando 1 145, Casström 615/989) · **övrigt:** isfrihållare (dammvärmaren täcker), hundkojans dörrflik (8 USD), övernattningsholk, markishylsa, propellerväska (för dyr), kylventilens vintertäckning (sett innan), skruvsorterare (struktur), kalendrar/höns (order) |

**H06-beslutet i huvudsessionen:** lins AC fällde två rader ENBART på golvregeln ("golv i exakt form under vårt pris = struken") — och båda har exakt ATV-kapellets struktur, som blev REAL_WINNER i dag (Jula 399 under vårt 579, Polaris-ankare 3 045, 11 köp / ROAS 4,07). H06 säger just detta: golv under oss dödar inte när ankaret ≥ 1,2× är synligt. Huvudsessionen lyfte **ATV-vindrutan** som märkt H06-exploration (golv ATVhuset 995 mot vårt 1 199, ankare Moose 2 755 = 2,3×, H04-prisband, samma ägare och datum som kapellet). **ATV-sätesöverdraget** lyftes INTE: ankare 1,49×, BE-CPA 199–245, 128 varianter hos ATVhuset — där är golvet hela marknaden, inte en enskild kopia. Utfallet på vindrutan avgör om golvregeln ska få ett H06-undantag.

**rank.py:** 6 → 6 unika → 6 klarade grindarna → batch 6 (2 exploitation / 1 exploration / 3 säsong; exploitation 3 under minimum, exploration 1 under). Skyddsformer 1 av 6. En SAK-kollision (fiskedragsbyggsatsen mot täljsetet K0243 — samma objektrad "Mannen själv / partnern" + låda) löstes med unikt objekt före rank. Hjulvagnen ASYM (verktyg med synlig payoff).

## Batchen (sida v24 = 6 nya + 14 obesvarade från 16/9 och 23/9; ark `Leverantorsoffert-2026-09-24.xlsx` med inbäddade bilder, prisfälten tomma)

| # | Produkt | Slot | Objekt · form · arketyp | Pris · BE-CPA | Säsong | Ankare / golv | Största risken |
|---|---|---|---|---|---|---|---|
| 1 | Värmepumpstvätten — påse, spruta, borstar (K0298) | exploit | NYTT luftvärmepumpens innerdel · verktyg · D (H07) | 799 · 451–515 | första frost 3,0 v | servicebesök 1 900 (2,38×) / — | objektet står inne; hero textad |
| 2 | Hjulvagnen — vinterhjulen upp på navet (K0299) | exploit ASYM | NYTT bilens vinterhjul, hjulbytet hemma · verktyg · D (H12) | 1 299 · 696–806 | första snö 8,1 v | Biltema 2 195 (1,69×) / 2 195 | under H12:s 2,4×; tung — frakten |
| 3 | Fiskedragsbyggsatsen — bygg egna spinnare (K0300) | säsong | NYTT hobbyfiskarens egna spinnare · låda · G (H05) | 599 · 279–337 | fars dag 6,4 v | ingen boxad byggsats i SE / — | lågt upplevt värde (småbitar i plastlåda) |
| 4 | ATV-vindrutan för passet (K0301) | explore | NYTT ATV-föraren på passet · annat · E (H06) | 1 199 · 267–436 | älgjakt syd 2,0 v | Moose 2 755 (2,3×) / **ATVhuset 995** | golv under oss i exakt form; akryl 91 cm fraktskada |
| 5 | Kaninburens vinterhuv (K0302) | säsong | kanin/marsvin i bur ute · huv · E (H09) | 699 · 381–438 | första frost 3,0 v | ingen svensk kedja i formen / Teddytassen 89 (plastskiva) | storleksval → returer; barnfamilj, inte 55+ |
| 6 | Kikarbröstväskan för älgpasset (K0303) | säsong | NYTT jaktkikaren på passet · sele · A (H02) | 599 · 385–424 | älgjakt syd 2,0 v | Mystery Ranch 995 (1,66×) / Vortex 349 (annan form) | "sett innan" hos erfarna jägare |

K0 mot `v3/katalog-live.txt` (237 aktiva), `koncept.py sok`, kontot. Alla 6 LIVE_VERIFIED 05:52–06:09 UTC, hero sedd, materialklass 1 (kaninhuven 2).

## Parkerade (`backlog.json`)

Robotklipparens vinterväska (Gardena 689/Worx 639 — Ali ger bara handjagarväskor; robotindockning 4,4 v) · Knivbyggsatsen (Karesuando 1 145, Casström 615/989 — Ali säljer blad/skaft separat; fars dag) · ATV-sätesöverdraget (H06 bara om vindrutan vinner) · Pizzaugnshuven (Ooni 499–549 ankare, Bauhaus 133/269 golv — H06) · tidigare: nyckelhålslampan, fenderskydd → mars, hästhink, igelkott v 42, isfiske v 2.

## Metodfynd i dag

1. **Golvregeln och H06 säger emot varandra — och Meta gav H06 rätt i dag.** ATV-kapellet (golv Jula 399 < 579) blev REAL_WINNER; regeln "golv i exakt form under oss = struken" hade fällt den. Lins AC fällde 100 % på regeln. Lösning: golvet fäller när golvet ÄR marknaden (128 sadelöverdrag) — inte när en kopia ligger under ett synligt märkesankare ≥ 1,6×. Vindrutan är testet; sätesöverdraget är kontrollen som inte lyftes.
2. **"Tjänsten man slipper" utanför kaminen är tunn.** 13 tjänster → 2 rader. Kedjan täcker VVS/fönster/tak med förbrukningsvaror under 300 kr; det som finns kvar är maskin-/bilservice (värmepump, däckhotell) där ankaret är en faktura, inte en hylla.
3. **Två skyddsformer på maskinobjekt gick åt olika håll samma vecka** (ATV vann, snöslungan förlorade). Datumet (jakt NU vs snö 4–10 v) och objektvärdet (60–150 tkr vs 8–25 tkr) skiljer, inte formen. H02:s "2–12 v före" bör läsas som 2–6 v för väderdatum.
4. **Säsongsslotten fylldes för första gången på tre körningar** (3 rader) — genom hårda datum utan kalendrar: första frost, älgjakt, fars dag.
5. **Fackhandeln som helhet (ATVhuset) är ett annat golv än en kedja.** 128 varianter i en form betyder att ägaren redan köpt; en kedjas enda universalprodukt betyder att ägaren improviserar. rank.py/agentprotokollet bör skilja "golv = sortiment" från "golv = en kopia".
6. **Batch 6 utan LÅG** — 4 bra slår 12 svaga; 19 av 20 kort på sidan väntar ändå på svar (14 obesvarade sedan 16/9 och 23/9).

## Tio kontrollfrågor (MASTERPROMPT §9)

1. Kattkojan: ingen katt-/hundlins; kaninhuven är H09:s renaste test efter hönsgårdsdukens förlust (älskat djur i stället för höns). Ja.
2. Taköverdraget: 145 006 / 385 / 3,24 — H04 bär vindrutan (1 199) och hjulvagnen (1 299). Ja.
3. Adventskalendern: 12 353 / 37 / 1,75; dinosaurierna REAL_LOSER; inga kalendrar sökta. Ja.
4. Verktygen: två verktygsrader (värmepumpstvätten H07, hjulvagnen H12) — båda "tjänsten man slipper" med faktura-ankare. Ja.
5. Verktyg levererat: två, med hypotes och ankare utskrivna. Ja, medvetet.
6. Deadline per rad: 6 av 6 NOW (2,0–8,1 v). Ja.
7. Ankare per rad: 4 mätta med URL; kaninhuven och fiskedragsbyggsatsen "ingen svensk aktör i formen" med kollade källor. Ja.
8. Hero per rad: alla 6 sedda; värmepumpstvätten (textad) och kikarväskan (ingen kontext) anmärkta. Ja.
9. K0 på SAK: katalog-live 09-24 (237 aktiva, +22), koncept.py sok, kontot; en SAK-kollision löst före rank. Ja.
10. Taggar + per_kriterium + koncept-id (K0298–K0303); LEARNING_STATE omskriven FÖRE sökningen; LEARNING_STATE-raden skriven. Ja.

## Definition of done

- [x] 0A 0 nya svar (14 obesvarade från 16/9 + 23/9 följer med på dagens sida); inga nej att läsa
- [x] 0B Metas facit hämtat (`facit/snapshots/2026-09-24.json`); ATV-kapellet REAL_WINNER + snöslungekapellet REAL_LOSER lästa; 17 forskningsprodukter i butiken kopplade + taggade; 9 kampanjer taggade; utfall.json + koncept.json
- [x] 0C LEARNING_STATE.md omskriven och läst; prediktion vs verklighet (1 av 10, klicken 5 av 9) kommenterad; hypoteser.json: H06 får Meta-stöd (ATV-kapellet), H02 väderdatum 2–6 v noterat
- [x] 0D SASONG.md skriven; bara NOW-fönster jagade
- [x] Discovery ägare → objekt → friktion, 3 linser (AB/AC/AD), 2/1/3 — exploitation och exploration under minimum (AC gav 0 på golvregeln; motiverat ovan)
- [x] Varje rad LIVE_VERIFIED i dag med UTC-stämpel, hero sedd
- [x] Svenska golvet läst med URL per rad (läst FÖRE ali.py)
- [x] Materialklass per rad
- [x] Ekonomi som intervall, BE-CPA ≥ 190 på varje rad
- [x] Batch 6 (< 10, motiverat: 4 bra slår 12 svaga, 14 kort väntar på svar), per slot enligt rank.py, ingen utfyllnad, inga LÅG
- [x] Ark byggt med inbäddade bilder (prisfälten tomma) + sida publicerad mot samma URL, v24, downloads + db, med 14 obesvarade kort
- [x] koncept.json bär K0298–K0303
- [x] LEARNING_STATE-raden + STATUS.md + RUTIN-KVITTO.md; committat och pushat
- [x] Discord-rapport skickad
