# FAS 2 — kluster `ved-eldstad` (ved · braskamin · eldstad · skorsten)

Datum: **2026-09-04.** Råfil: `fas2/ved-eldstad.json` — **50 listningar, 48 nya**
(två är redan kända: `601101098895206`, `601099610710547`).
Uteslutet enligt uppdraget: vedställsöverdrag och tändvedsklyv i gjutjärn (andra agenter),
klyvkon till borrmaskin, kedjeslip, hopfällbar såg, ståltrådsborste, USB-värmedyna.

## ⚠️ Läs först — vad som inte gick att verifiera

| Källa | Status 2026-09-04 | Konsekvens |
|---|---|---|
| Temu-listningens innehåll (bilder, video, pris) | Blockerad (DATAVAGAR.md avsnitt 4) | **Gate 5 MATERIAL är `BLOCKED_SOURCE` på samtliga 50 listningar. Ingen kandidat kan bli Tier A.** Aldrig FAIL, aldrig PASS. |
| `temu.com/se/g-<id>.html` | Ger svensk titel på ~4 av 10 försök, resten bara Temu-skalet | Svensk titel verifierad på fem listningar; de står ordagrant i JSON:en. |
| Seznam-produktdata | Fungerar, men indexerar inte mina målsidor | Pris/betyg finns bara för **närliggande** produkter, märkta `us-proxy`. |
| Ett enda skarpt SE-pris | Rekommendationskarusellen på `g-601099603802865`: **436,75 kr** (3 rec) och **493,90 kr** (3 rec) för vedklyvsöverdrag | Det talet fäller den bästa listningen på ekonomi. Se B1. |
| Publiksiffror | SCB:s energistatistiksida svarar 404, Seznam gav ingen siffra | `owner_class_size = null` överallt. **Ingen siffra är påhittad.** |
| WebSearch | Budgeten (200/session) tog slut efter 48 sökningar | Resten kördes mot Seznam via curl/WebFetch. |

---

## (a) Objektuniversumet jag jobbade från

Byggt från ÄGARE → OBJEKT → BEFINTLIG FRIKTION i september–oktober. Utökat på tre håll som
saknades i `objektuniversum.md` avsnitt 5: **maskinerna som gör veden**, **stockarna före kapning**
och **kalldraget ur den kalla eldstaden**.

| Objekt (ägt, i bruk sep–okt) | Vad ägaren behöver | Sökt |
|---|---|---|
| **Hydrauliska vedklyven** | skydda mot höstregn, samla upp klyvd ved | ja — nytt objekt, aldrig sökt förut |
| **Stockarna + motorsågen** | lyfta stocken ur gräset, vända den, kapa utan att såga i marken | ja — nytt objekt |
| **Huggkubben** | hålla vedträet still, slippa böja sig | ja — **noll Temu-listningar** utanför den uteslutna Kindling-Cracker-formen |
| **Den kalla öppna spisen** | täppa till kalldraget | ja — nytt objekt |
| Utekaminen/eldkorgen på altanen | skydda mot regn, skydda trallen | ja |
| Skorstenen | huv/fågelskydd | ja |
| Askan | hink med lock, asksug | hylla kontrollerad först → fälld, ingen Temu-budget lagd |
| Vedtraven / vedboden | beslag, säck, bärare, säckställ | hylla kontrollerad först → fälld |
| Kaminen inne | gnistgaller, fläkt, termometer, packning, glasrengöring | fälld (Biltema har en egen hylla **Eldstäder och kaminer › Brastillbehör**) |
| Vedhandskar, fuktmätare, sotningsset | — | fällda på passform / presens (fuktmätare och sotningsset redan i förra körningen) |

**Klustrets grundlag, mätt idag:** allt som hör till kaminen *inne* är hyllat i Sverige.
Biltema, Jula och Clas Ohlson har alla en färdig brastillbehörsavdelning. Det som *inte* är hyllat
ligger utomhus, kring maskinerna och stockarna — och det är där de tre överlevarna finns.

## (b) Sökfraserna

**Hyllan först (gate 3), 20 svenska WebSearch-fraser — körda INNAN någon Temu-sökning:**
vändhake stockvändare timmerhake jula biltema pris · askhink med lock askskyffel kamin jula biltema clas ohlson ·
skorstenshuv fågelskydd skorsten regnhuv köpa pris · klyvring huggkubbe säkerhetsring vedklyvning däck på huggkubben ·
bärsele för ved vedbärare rem axelrem bära ved jula biltema · spjällpropp öppen spis kalldrag skorstensballong stoppa draget ·
kapstöd vedställ för motorsåg kapa ved sågbock jula biltema pris · "timberjack" OR "vändhake med stödben" stocklyft kapa ved jula pris ·
vedklyvningsring klyvring stål huggkubb köpa Sverige · "vedklyv" överdrag skydd amazon.se fyndiq vevor pricerunner log splitter cover ·
brasvantar vedhandskar läder långa biltema jula clas ohlson pris · säckhållare säckställ vedsäck trädgårdssäck hållare jula biltema rusta ·
överdrag kapell till vedklyv skydda vedklyven presenning köpa · gnistgaller gnistskydd öppen spis braskamin biltema jula rusta pris ·
vedklyv uppsamlingsbord log catcher tillbehör hydraulisk vedklyv Sverige · eldkorg utekamin gnistskydd lock trallskydd värmesköld altan trädäck köpa ·
askdammsugare asksug biltema jula clas ohlson pris kamin aska · grillmatta eldkorgsmatta skydd trall biltema jula rusta bauhaus pris ·
sågbock med motorsågshållare jula biltema pris kapa ved stockar · utekamin chiminea överdrag skydd eldkorg kapell biltema jula rusta bauhaus

**Temu-listningsjakt (gate 4), 12 WebSearch-fraser, alla `site:temu.com`:**
log splitter cover waterproof outdoor machine · firewood splitting ring chopping block log holder steel ·
log lifter timber jack cant hook lifting tongs · firewood carrying strap sling log carrier shoulder ·
chainsaw log holder sawhorse firewood cutting stand rack · fire pit heat shield deck protector fireproof mat under ·
chimney draft stopper fireplace plug damper draught excluder · log splitter log catcher table tray hydraulic accessory ·
wood stove pipe heat deflector shield chimney flue · chimney cap bird guard stainless steel rain cover flue ·
chiminea cover outdoor fireplace cover waterproof patio heater · firewood stacking strap bundle holder log carrier band

**Seznam (pris/betyg + extra recall), 22 fraser** via `sez.py` och curl — bl.a.
log splitter cover waterproof oxford · cant hook log lifter timberjack heavy duty · log lifting tongs timber claw hook ·
firewood tongs log grabber · magnetic fireplace draft stopper vent cover · chiminea cover waterproof outdoor fireplace ·
fire pit mat deck protector fireproof · chimney cap bird guard stainless · log splitter cover 15 ton storage cover machine ·
sawhorse with chainsaw holder log cutting · wheelbarrow extension sides mesh garden · log roller lifting tool forestry logging steel ·
firewood rack bracket kit 2x4 outdoor log storage · chimney cowl rain cap stove pipe 100mm ·
fireplace blanket insulation stop heat loss chimney · firewood moisture wood stove accessories outdoor ·
firewood log rack ground base · firewood tongs log grabber.

**Sökt men noll Temu-listningar:** ren hållarring till huggkubb (bara klyvkon och Kindling-Cracker-formen,
båda uteslutna) · uppsamlingsbord till hydraulisk vedklyv (bara maskiner) · vedställsöverdrag med
markförankring · skottkärreförhöjning för ved.

## (c) Tratten

**KONCEPT-TRATTEN** (16 formulerade koncept)

| Gate | Kvar | Föll här |
|---|---|---|
| Koncept formulerade | 16 | — |
| 1 OBJEKT | 14 | 2 — campingkaminens rökrör (fel objekt), vedhandskar (personlig passform) |
| 2 PRESENS | 14 | 0 hårda fall; skorstenshuven märkt OSÄKER (osynlig, långsam skada) |
| **3 SVENSKA HYLLAN** | **7** | **7 — askhink/asksug, gnistgaller, eldkorgsmatta, sågbock med motorsågshållare, vedbärare/vedsäck/säckhållare, vedställsbeslag, vedtång/eldgaffel** |
| 4 LISTNINGSJAKT | 5 | 2 gav noll listningar (klyvring till huggkubb, uppsamlingsbord till vedklyv) |
| 5 MATERIAL | 5 | 0 — **ej mätbar, källan blockerad** |
| 6 EKONOMI | 5 | 0 koncept (1 listning föll: vedklyvsöverdraget → `ALTERNATIVE_LISTING_REQUIRED`) |
| 7 VARIANT | 4 | 1 — skorstenshuven (100–130 mm är inget ägaren kan utantill) |
| 8 HOOK | 4 | 0 |
| 9 PUBLIK | 4 | 0 hårda fall, 3 med `owner_class_size = null` |
| **Tier A** | **0** | kräver material-PASS på sett underlag — omöjligt i dag |
| **Tier B** | **2 koncept / 3 listningar** | vedklyvsöverdrag · stocklyft/vändhake |
| Tier C | 4 koncept / 22 listningar | |
| ELIM | 6 koncept / 25 listningar | |

Statusfördelning på koncepten: 2 `ALTERNATIVE_LISTING_REQUIRED`/levande, 2 `PENDING_VERIFICATION`,
2 `OSÄKER`, 7 `FAIL` (hyllan), 2 utan listning, 1 `FAIL` (objekt).

**LISTNINGS-TRATTEN**

| Steg | Antal |
|---|---|
| Råkandidater (listningar) | **50** (48 nya) |
| Ligger i koncept som klarade gate 1–3 | 18 |
| Hämtade (innehåll sett) | **0 — blockerat** |
| Material PASS | 0 |
| Ekonomi PASS | 0 (1 FAIL på läst SE-pris, 17 UNKNOWN/PENDING) |
| Bästa listning vald | 0 |

---

## (d) Tier B — fullständig fältmall

### B1. Överdrag till den hydrauliska vedklyven — `601099603802865` (+ `601099589782206`)

- **PRODUCT:** Formsytt vattentätt oxfordöverdrag till hydraulisk vedklyv, 83 × 45 × 39 tum, för klyvar 15–45 ton. Systerlistning `601099589782206`: 210,82 × 114,3 cm med stängningsrem.
- **TEMU LINK:** https://www.temu.com/g-601099603802865.html · https://www.temu.com/g-601099589782206.html
- **OBJECT/OWNER:** Vedklyven som står ute eller under carporten hela klyvsäsongen. Ägaren: man 45–70, småhus eller fritidshus, har betalat 4 000–20 000 kr för maskinen. Hävstång mot ägd sak: **> 10×**, samma tal som motorhöljet och sätesöverdraget.
- **EXISTING FRICTION:** Veden klyvs just nu. Maskinen står kvar mellan passen, höstregnet går ner i motor och hydraulik, rosten sätter sig på klyvbalken. Går att fotografera i vilken svensk trädgård som helst den här månaden.
- **OLD WAY:** Presenning med stenar på, eller ingenting. **Improvisation** — samma old way som bar vinnare 1 (motorhöljet) och 10 (IBC-överdraget).
- **PRODUCT'S ROLE:** Träs över maskinen, remmen dras åt, sitter kvar i höstvinden.
- **WHY THE AD DOES NOT NEED TO CREATE DEMAND:** Ägaren har redan erkänt problemet genom att lägga en presenning där. Annonsen pekar bara på ägaren.
- **TEMU MATERIAL:** `BLOCKED_SOURCE`. Titeln beskriver ett formsytt oxfordöverdrag med angivna mått och stängningsrem — samma materialfamilj där 7 av 9 vinnare fick sin annons gratis. **Indicium, inte bevis.**
- **0–3 SECOND PROOF:** Ej sedd. Önskat: klyven i regnet → överdraget dras på → remmen spänns.
- **SWEDISH SHELF STATUS:** **PASS.** Bauhaus, Jula, Granngården och Biltema säljer vedklyvar och generella presenningar — **ingen kedja säljer ett formsytt vedklyvsöverdrag.** PriceRunners "vedklyvare" (32 produkter) är maskiner; Fyndiq har manuella klyvar; Amazon.se-noden heter "Log Splitters". Två sökningar, ur sökutdrag.
- **TEMU PRICE:** Listningens eget pris `UNKNOWN`. **Samma produktform på SE-Temu 2026-09-04: 436,75 kr och 493,90 kr** (rekommendationskarusellen på listningens egen SE-sida, 3 recensioner vardera).
- **PLAUSIBLE SWEDISH PRICE:** 799–899 kr vore rätt läge mot maskinvärdet — men se nedan.
- **ECONOMIC ROOM:** **FAIL på det lästa priset.** Landad = 437–494 × 1,5 = **655–741 kr**. Kravet 2,4× ger 1 573–1 778 kr, alltså långt över 1 000-kronorstaket, och DATAVAGAR stoppar allt över 420 kr landat. → `ALTERNATIVE_LISTING_REQUIRED`: konceptet håller, listningen gör det inte. Sök överdrag till **liten el-klyv (5–7 ton)** — mindre tygyta, rimligen under 200 kr på Temu.
- **VARIANT FRICTION:** Låg. Parametern är **ton** — ägaren vet sin klyvs tonnage utantill, precis som hk och liter. Ägarkunskap 2.
- **≤7 WORD OWNERSHIP HOOK:** **"Står vedklyven ute i regnet?"** (5 ord)
- **WINNER-STRUCTURE MATCH:** **76/100.** Kluster 1 (B ∧ C2 ∧ E) uppfyllt: problemet finns nu · ägd sak ute · ingen kedja i formen. Kluster 3 (pris > 500) möjligt. Faller på kluster 2 bara för att materialet inte går att se.
- **TOP 3 REASONS:** (1) Exakt motorhöljets struktur — oxfordskydd på en dyr maskin som står ute, i säsong. (2) Hyllan är verifierat tom, både i kedjorna och på marketplace. (3) Varianten är ett tal ägaren kan utantill, och hooken skriver sig själv.
- **BIGGEST REASON IT COULD FAIL:** Ekonomin på de listningar som finns — och att en del ägare rullar in klyven i garaget, vilket är den enda DNA-avvikelsen mot motorhöljet (vinnarna har objekt som *står ute*).
- **CONFIDENCE:** MEDIUM. Gate 1–3 och 7–8 säkra, gate 5 blockerad, gate 6 fälld på ett läst tal, gate 9 utan siffra.

### B2. Stocklyft / vändhake med stödben — `601099592756087`

- **PRODUCT:** 51 tums timberjack: vändhake med stödben som lyfter stocken från marken och håller den still under kapning. Alternativ: `601100230171489` (48/59 tum, för stockar upp till 32 tums diameter), `601099589337024`, `601099573408021`.
- **TEMU LINK:** https://www.temu.com/g-601099592756087.html
- **OBJECT/OWNER:** Stockarna på marken och motorsågen. Ägaren: man 45–70 med tomt eller skogsskifte som kapar sin egen ved.
- **EXISTING FRICTION:** Kapningen sker nu. Stocken ligger i gräset, svärdet går i marken och kedjan blir slö på tre snitt, sista biten måste rullas för hand och ryggen tar smällen. Fotograferbart i vilken svensk vedbacke som helst i september.
- **OLD WAY:** Bända med en planka eller ett järnspett, eller lyfta stocken för hand. **Improvisation.**
- **PRODUCT'S ROLE:** Haken griper, spaken lyfter, stödbenet håller stocken i luften — hela snittet går utan att svärdet rör marken.
- **WHY THE AD DOES NOT NEED TO CREATE DEMAND:** Alla som kapar egen ved har sågat i jorden. Smärtan (ryggen, kedjan) är redan inträffad.
- **TEMU MATERIAL:** `BLOCKED_SOURCE`. Kategorin är bland de mest demonstrerbara som finns — stocken lyfts från marken i ett enda drag. Om leverantörsvideon existerar är den sannolikt hela annonsen. **Indicium.**
- **0–3 SECOND PROOF:** Ej sedd.
- **SWEDISH SHELF STATUS:** `PENDING_VERIFICATION`. Jula har **brytjärn med vändhake** (Oregon) i kategorin avverkningsverktyg; riktiga vändhakar finns bara i sågverksfackhandeln (Bamseprodukter, Wood-Mizer). **Ingen kedja säljer en timberjack med stödben** — enda svenska träffen är ett skogsforum-inlägg om Aleko LM201 till 99 USD i USA. Två sökningar, ur sökutdrag.
- **TEMU PRICE:** `UNKNOWN` — Seznam indexerar inte listningen.
- **PLAUSIBLE SWEDISH PRICE:** 599–799 kr, om landad kostnad håller sig under 300 kr.
- **ECONOMIC ROOM:** `UNKNOWN`. Riskfaktorn är fysisk: 4–6 kg stål, 130 cm långt. Frakten kan äta hela uppslaget, precis som på tändvedsklyven i gjutjärn.
- **VARIANT FRICTION:** Låg–medel. En eller två längder (48/59 tum); ägaren vet ungefär hur grova sina stockar är.
- **≤7 WORD OWNERSHIP HOOK:** **"Sågar du i marken när du kapar?"** (7 ord)
- **WINNER-STRUCTURE MATCH:** **64/100.** Kroppslig användning + befintlig smärta + tom hylla. Dras ned av okänd ekonomi, smalare ägarklass och att flera listningar marknadsförs som "5-i-1" — en uttrycklig FAIL-signal i den negativa rymden.
- **TOP 3 REASONS:** (1) Daglig, kroppslig, fotograferbar friktion i exakt den här månaden. (2) Kategorin är helt ny i svenskt Meta-flöde. (3) Payoffen är en synlig handling — stocken lyfts — som inte behöver förklaras.
- **BIGGEST REASON IT COULD FAIL:** Frakten på tungt stål, och att ägarklassen (de som kapar egna stockar) kan vara för smal. Hyllan behöver dessutom en fjärde kedjesökning innan tier sätts skarpt.
- **CONFIDENCE:** LOW.

---

## (e) Lärorika Tier C- och ELIM-avslag

**1. Askhinken och asksugen — hela objektet är hyllat, inte bara produkten.**
Objektet är perfekt: askan börjar samlas i oktober, ägaren ser den varje dag, old way är en gammal
zinkhink. Ändå död. Clas Ohlson har askhink 10 l **och lock som separat artikel**, Jula askhink 20 l,
jem&fix 8 l med skyffel och lock, Granngården Vastbo. Asksugen finns hos alla tre kedjorna
(Cocraft 800 W, Kärcher AD2, Meec 800 W 15 l, Biltema 15 l). Lärdomen är klustrets viktigaste:
**Biltema, Jula och Clas Ohlson har alla en färdig hylla som heter "brastillbehör".** Allt som hör till
kaminen *inne* är därmed jämförelsehandlat innan annonsen ens visas. Sök utomhus.

**2. Skorstenshuv med fågelskydd — perfekt ankare, omöjlig variant.**
Här finns undantagsregelns drömankare: svenska huvar kostar 1 000–4 000 kr, måttbeställda
3 000–8 000 kr, **från 3 600 kr med fågelskydd** — långt över 1,6× ett tänkt pris på 599 kr.
Ingen kedja säljer det. Ändå C: Temu-produkten är en 100–130 mm rökrörshuv, och **ägaren kan inte
sin rökrörsdiameter utantill** (ägarkunskap 0, samma fälla som eldstadsöverdraget 28–48 tum i förra
körningen). Dessutom ligger monteringen på taket. Lärdomen: ett starkt ankare räddar aldrig en
produkt som kunden måste mäta in — och "montering" väger tyngre när den sker fyra meter upp.

**3. Eldkorgsmattan — konceptet var redan hyllat under ett annat namn.**
Objekt, presens och hook är alla gröna: glöden bränner märken i trallen, det syns nu, och
"Bränner eldkorgen märken i trallen?" är en ren ägarfråga. Men Jula säljer **Grillmatta 80 × 120 cm**
(Burns & Barkles) som "placeras under grillen", och Bauhaus, Bygghemma och Rusta har samma form.
Lärdomen: sök på **ägarens svenska ord**, inte på produktens engelska. "Fire pit mat" hade sett
tomt ut i alla fyra kedjor — "grillmatta" fällde det på första sökningen.

**4. Magnetiskt eldstadsdragstopp — hyllfrånvaron är äkta, men payoffen syns inte.**
`601099539860017` finns på svenska Temu ("magnetisk eldstadsdragstopp inomhus skorstensvindskydd"),
ingen svensk kedja har något liknande, och kalldraget känns i soffan från september. Ändå bara C:
objektet är inomhus, kunden måste mäta spisöppningen, och **resultatet går inte att fotografera** —
drag syns inte. Det är samma svaghet som fällde fuktmätaren: symptomet ligger ett steg från det
ägaren ser.

## Nästa steg när Temu släpper (för koordinatorn)

1. Hämta i den här ordningen: **601099589782206**, **601099603802865** (vedklyvsöverdrag),
   **601099592756087**, **601100230171489** (stocklyft), sedan **601099539860017** och
   **601099532324656**. Dra frames 0–3,5 s och läs `image_descriptions` för SKU-listorna.
2. **Sök alternativ listning till B1** enligt PIPELINE-V2.1 §3: överdrag till *liten* el-vedklyv
   (5–7 ton). Konceptet lever bara om landad kostnad kommer under 420 kr.
3. Gör den fjärde kedjesökningen på **vändhake/timberjack** (Biltema svarade aldrig) innan B2
   sätts skarpt.
4. Skaffa ett riktigt publiktal för vedeldande svenska hushåll — ingen källa gick att nå idag,
   och tre av fyra överlevare står med `owner_class_size = null`.
