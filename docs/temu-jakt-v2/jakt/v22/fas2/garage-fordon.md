# Kluster `garage-fordon` — garaget, bilen, däcken, uppfarten

Datum **2026-09-04**. Fas 2, V2.1-systemet oförändrat.

**Driftläge.** Temu-blocket ligger kvar precis som `DATAVAGAR.md` beskriver: `WebFetch`
på `temu.com/se/g-<id>.html` gav Temus generiska landningssida, inget pris och inga
bilder. **Gate 5 MATERIAL är därför `BLOCKED_SOURCE` på samtliga 44 listningar — aldrig
FAIL, aldrig PASS.** Priser, betyg och recensionsantal är avskrivna ur Seznams sökutdrag
(`source: "seznam-snippet"`), ekonomin räknad på US-proxy enligt DATAVAGAR §6.
WebSearch-budgeten (200/200) tog slut efter tolv frågor; resten av hyllkontrollen kördes
med `WebFetch` mot Yahoo och mot butikernas egna produktsidor. `pricerunner.se` returnerar
tom sida (JS-renderad) och `biltema.se` svarar 403 — båda noterade, ingen gissning gjord.

**Resultat i en mening: klustret är tomt. 0 Tier A, 0 Tier B.** Två strukturella skäl,
båda mätta i den här körningen och inte hämtade ur minnet — de står under tratten.

---

## (a) Objektuniversumet

Presens = finns friktionen hos ägaren i september–oktober 2026, utan att annonsen skapar den.

| Ägt objekt | Står ute / kroppsligt? | Vad ägaren behöver nu | Presens sep–okt | Utfall |
|---|---|---|---|---|
| Bilen (taket, takräcket) | ja | nå taket när takboxen ska av | **ja** | C — hyllan |
| Vinter-/sommardäcken | nej (förvaras inne) | förvara, märka, transportera | ja | ELIM — gate 1 + hyllan |
| Hjulnavet vid däckbytet | ja | hänga och centrera hjulet | **ja (okt–nov)** | C — variant + ekonomi |
| Domkraften, pallbockarna | ja | lyfta säkert på grus | ja | ELIM — Biltemas/Julas kärnhylla |
| Bilens tröskel/lyftpunkt | ja | skydda mot domkraften | ja | ELIM — SKU per bilmodell |
| Bilen som står ute | ja | skydda mot löv, kåda, väta | ja | ELIM — Jula Hamron bilöverdrag/toppkapell |
| Vindrutan | ja | frostskydd | **nej — november** | C, kranskyddsfällan |
| Torkarbladen | ja | frysa fast | **nej — november** | ELIM — presens |
| Backspegeln | ja | frost, insyn | **nej — november** | ELIM — presens |
| Strålkastarna (matta) | ja | polera upp | delvis (nyttan märks i mörkret) | ELIM — kit + förbrukning |
| Bilbatteriet | ja | underhållsladdning vid avställning | nej (skadan i april) | ELIM — presens + Biltema |
| Motorvärmaren och sladden | ja | hänga sladden, hålla den ur pölen | **ja** | ELIM — Biltema/Jula kabelhållare |
| Elbilen + laddbox/laddkabel | ja | skydda porten, hänga kabeln | ja | **redan avgjort — föreslås ej** |
| Laddkabeln i bagaget | nej | förvaringsväska | ja | ELIM — gate 1 + Kjell & Company |
| Takboxen | nej (förvaras inne) | ner från taket, upp i taket | **ja** | **hissen redan avgjord**; väggfäste ELIM gate 1 |
| Takräcket / lasthållaren | ja | av eller kvar | ja | ELIM — förvaras inne |
| Dragkroken (50 mm kula) | ja | kulskydd | delvis (want) | ELIM — avgjort i V2 |
| Bagageutrymmet | nej | skydda mot lera och väta | ja | ELIM — ekonomi + kedjorna |
| Bilens bakre lastkant | ja | skydda lacken vid lastning | delvis (repor byggs långsamt) | C — ekonomi |
| Bilmattorna | nej | blöta och leriga | ja | **redan avgjort — föreslås ej** |
| Garageporten | ja (utsidan) | täta mot drag och regn | ja | ELIM — Jula Hard Head bottenlist |
| Garagegolvet | nej | oljedropp, slask | ja | ELIM — > 1 000 kr, tung frakt |
| Verktygsväggen | nej | ordning | nej | ELIM — gate 1 + magnethylla avgjord |
| Cykeln som ska in | nej | hänga | ja | ELIM — gate 1 (DNA: cykel i garage 0/9) |
| Uppfarten | ja | markera kanten inför plogen | **nej — februari** | ELIM — presens |
| Uppfarten (parkering) | nej (i garaget) | hjulstopp | nej (latent) | ELIM — gate 1 + presens |
| Bilen som står still på tomten | ja | möss i motorrummet | skadan osynlig | C — presens |
| Bilnyckeln / stöldskydd | nej | rattlås, låsbultar | ja | ELIM — Biltema/Jula |

**Objekt jag lade till utöver uppdragets lista:** hjulnavet som eget objekt (skilt från
däcket), bilens lyftpunkt/tröskel, bilens bakre lastkant, bilen som står still vid
fritidshuset, och motorvärmarsladden som eget objekt skilt från motorvärmaren.

---

## (b) Sökfraserna

**Temu-listningar — 22 fraser.** Två via WebSearch innan budgeten tog slut, resten via
Seznam enligt DATAVAGAR §2 (`search.seznam.cz/?q=site%3Atemu.com+…`, parser i
`scratchpad/gf/sez.py`).

`site:temu.com` + …
car door step folding roof access latch hook pedal ·
wheel hanger alignment guide pin stud tire change tool ·
car door step roof access latch ·
car door step aluminum folding 200kg roof ·
wheel hanger alignment guide pin tire change ·
wheel alignment pin M14 tire change guide bolt ·
car jack pad rubber lifting point protector ·
tire storage cover outdoor waterproof wheel stack ·
rear bumper protector mat trunk loading scratch ·
rear bumper protection pad loading mat magnetic tailgate cover ·
car boot loading protector flap trunk edge guard heavy duty ·
ground protection mat mud grass driveway vehicle track ·
car windshield cover magnetic frost snow outdoor ·
outdoor extension cord holder wall hook cable storage garden ·
car battery maintainer solar trickle charger 12v ·
ultrasonic rodent repellent car engine compartment mouse ·
headlight restoration kit lens polish car ·
car snow brush ice scraper telescopic winter ·
car trunk cargo liner boot mat waterproof dog ·
garage parking assist stopper wheel guide ·
tire lifting strap wheel carrier handle lift heavy ·
wheel dolly tire lift jack helper tire change aid

**Svenska hyllan — 16 kontroller, på ägarens svenska ord, körda FÖRE Temu-jakten.**

WebSearch: `monteringsstift styrpinne hjulbyte bil biltema jula clas ohlson` ·
`domkraftsplatta underlägg domkraft grus biltema jula` ·
`motorvärmarsladd hållare krok kabelhållare vägg biltema jula` ·
`bilkapell halvtäcke bilöverdrag biltema jula rusta pris` ·
`bildörrsteg fotsteg bil tak nå biltaket dörrkrok stege biltema jula` ·
`laddkabelväska elbil förvaringsväska laddkabel typ 2 biltema jula clas ohlson kjell` ·
`gnagarskydd möss bil motorrum sommarbil skydd mot möss biltema jula` ·
`bilavfuktare återanvändbar avfuktare bil imma rutor biltema clas ohlson rusta`

WebFetch (prissatta produktsidor): `smartasaker.se/sv/steg-till-bildorren` = **375 kr** ·
`taktaltarna.se/products/hjalpsteg-till-bil` = **289 kr** ·
`thansen.se … styrpinne-for-dackbyte-m12x1-50` = **89,95 kr** ·
`carlevel.se/collections/lastskydd-stotfangarskydd` = **599–1 499 kr** ·
Yahoo `stötfångarskydd lastkantskydd baklucka bil biltema jula pris` ·
Yahoo `hjulstege biltema pris fotsteg bildörr biltaket` ·
`pricerunner.se/search` (hjulstege / styrpinne däckbyte / fotsteg bildörr — tom sida) ·
`biltema.se/…/hjulstege-2000034150` (HTTP 403).

**Ej körda, och varför:** Ad Library SE på "fotsteg bildörr", "styrpinne däckbyte" och
"stötfångarskydd"; Biltema/Jula-pris på parkeringsstopp, bagagerumsmatta och rattlås;
Rusta och Clas Ohlson på lastkantskydd. Alla tre föll ändå på en tidigare gate — men
`shelf` står som `PENDING_VERIFICATION` i JSON där kedjekontrollen inte gjordes.

---

## (c) Tratten

### Koncept-tratten (30 prövade koncept, eliminationsordning, stopp vid första FAIL)

| Gate | Kvar | Föll | Vilka |
|---|---|---|---|
| Råkoncept ur objektuniversumet | 30 | — | |
| 1 OBJEKT | 21 | 9 | garagegolvsmatta, strålkastarkit, parkeringsstopp, laddkabelväska, bilavfuktare, däckförvaring, takboxens väggfäste, verktygsvägg, cykelkrok — alla förvaras inomhus, är kit eller förbrukning |
| 2 PRESENS | 14 | 7 | vindrutetäcke, isskrapa/snöborste, torkarbladsskydd, spegelskydd, reflexstolpar uppfart, gnagarskydd motorrum, solcells-underhållsladdare |
| 3 HYLLAN | 5 | 9 | **bildörrsteg**, styrpinne, sladdkrok, domkraft/pallbockar, bilkapell, hjuldolly, garageportslist, kulskydd dragkrok, rattlås/låsbultar |
| 4 MATERIAL | 5 | 0 | **BLOCKED_SOURCE på alla — tekniskt fel, inte kommersiellt** |
| 5 EKONOMI | 1 | 4 | lastkantskydd, bagagerumsskydd, domkraftsgummi, domkraftsplatta grus |
| 6 VARIANT | 1 | 0 | |
| 7 HOOK | 1 | 0 | |
| 8 PUBLIK | 1 | 0 | |
| **Konceptöverlevare** | **1** | | däcklyftrem för hjulet — **men noll Temu-listningar finns** → `ALTERNATIVE_LISTING_REQUIRED` |

**Tier: A 0 · B 0 · C 5 · ELIM 24 · ALTERNATIVE_LISTING_REQUIRED 1.**

### Listnings-tratten

| Steg | Antal |
|---|---|
| Koncept som fick Temu-budget | 13 |
| Listningar funna | **44** (42 nya, 2 redan i `kanda-goods-id.txt`: 601100124647313, 607351507675233) |
| Listningar hämtade från temu.com | **0** — blockerad |
| Material PASS | **0** (44 × `BLOCKED_SOURCE`) |
| Ekonomi räknad på US-proxy | 10 |
| Ekonomi PASS | 6 |
| Bästa listning vald (material + ekonomi PASS på samma listning) | **0** |

### Varför klustret är tomt — två mätta skäl

1. **Bil och garage är Biltemas och Julas kärnhylla, och de har hela varugruppen.**
   Nio av trettio koncept dog på hyllan, och det är den enskilt största fällaren precis
   som i nio av tolv V2-kluster. Där kedjorna saknar formen finns i stället en svensk
   nischbutik med **lågt** pris — Taktältarna 289 kr, SmartaSaker 375 kr, Thansen
   89,95 kr. Det är samma lärdom som poolens water wand (255 kr) och jaktens kikarrem
   (149 kr): ett lågt fackhandelsankare dödar lika säkert som en kedja, eftersom
   DNA-undantaget kräver ett ankare **≥ 1,6× över** vårt pris.
2. **Klustrets naturliga produkter ligger i november–februari.** Sju koncept föll på
   presens, och alla utom två är frost- eller snöprodukter. Kranskydd Frost 420D
   (ROAS 1,59 mot break-even 1,49, pausad) är facit: samma tyg, samma ägare, fel månad.

Det som återstår i klustret i september–oktober — däckbytet och takboxen — är just de två
jobb där svensk handel har flest SKU:er.

---

## (d) Fältmall — de tre koncept som kom längst

Ingen nådde Tier A eller B. Mallen är ändå fullständig, så att besluten går att granska.

### 1. Bildörrsteg till biltaket — **Tier C, fälld på gate 3 HYLLAN**

- **PRODUCT:** Car Door Step Hook, Heavy-Duty Roof Access Pedal, anti-slip aluminium, glaskross
- **TEMU LINK:** https://www.temu.com/se/g-605899959666497.html
  (syskon: 601102106167407 · 601101933205557 · 606574269573553 · 601099588745704 + sex utan pris)
- **OBJECT / OWNER:** Bilen och biltaket. Villaägare 45–70 med takräcke och takbox.
- **EXISTING FRICTION:** Takboxen ska av i oktober efter semestern och han når inte upp;
  taket ska tvättas av löv och kåda. Fotograferbart på vilken svensk uppfart som helst just nu.
- **OLD WAY:** Kliva på däcket eller tröskeln, släpa fram trädgårdsstegen, be grannen — improvisation.
- **PRODUCT'S ROLE:** Hakas i dörrens låsbygel på två sekunder, bär 150–200 kg, fälls ihop.
- **WHY THE AD DOES NOT NEED TO CREATE DEMAND:** Han gör bytet den här månaden ändå.
  Säsongsväxling på ett ägt objekt, exakt motorhölje → båtmotorskydd-logiken.
- **TEMU MATERIAL:** `BLOCKED_SOURCE`. Titlarna antyder en ≤ 3 s-demo (någon kliver upp
  och når taket) — indicium, inte sett.
- **0–3 SECOND PROOF:** UNKNOWN.
- **SWEDISH SHELF STATUS:** **FAIL.** Ingen av de fyra kedjorna säljer formen — Biltemas
  *Hjulstege* (2000034150) hakas på hjulet, alltså en annan form. Men **Taktältarna säljer
  exakt samma aluminiumsteg för 289 kr och SmartaSaker för 375 kr**, plus 24.se,
  Långholmen Kajak, Proled, Transportstyling och Amazon.se (PHATRIP). Ankaret ligger
  alltså **under** vårt tänkta pris i stället för 1,6× över det.
- **TEMU PRICE:** $10 · betyg 4,7 / 94 % · 99+ recensioner (seznam-snippet).
- **PLAUSIBLE SWEDISH PRICE:** 349 kr.
- **ECONOMIC ROOM:** landad 104–122 kr · uppslag 2,85–3,34× · BE-CPA 227 kr → **PASS**.
  ($5-listningen ger BE-CPA 288 kr, $20-listningen 354 kr vid 599 kr. Ekonomin är alltså
  klustrets bästa — den räddar bara ingenting när hyllan redan fällt konceptet.)
- **VARIANT FRICTION:** En variant. Risk: nyare bilar utan traditionell låsbygel i B-stolpen.
- **≤ 7-ORDS ÄGARFRÅGA:** "Når du inte upp till biltaket?" (6 ord)
- **WINNER-STRUCTURE MATCH:** 64 / 100
- **TOP 3 REASONS:** (1) ägarpresens 2/2 i oktober; (2) leverantörsmaterialet är sannolikt
  färdig annons; (3) objektet är omisskännligt i flödet och publiken är kontots egen.
- **BIGGEST REASON IT COULD FAIL:** Det gjorde det redan — 289 kr hos en svensk butik
  som kunden hittar på första googlingen.
- **CONFIDENCE:** HIGH (två prissatta svenska produktsidor lästa).

### 2. Hjulmonteringsstift (styrpinne) — **Tier C, fälld på gate 3 + 6 + 7**

- **PRODUCT:** 4 st styrpinnar M12x1,25 / M12x1,5 / M14x1,25 / M14x1,5 för däckbyte
- **TEMU LINK:** https://www.temu.com/se/g-601099580856152.html
  (syskon: 601099519333198 · 601099597196695 · 601099516729546 · 601099537008204 · 601099572766116)
- **OBJECT / OWNER:** Hjulnavet och de fyra vinterhjulen. Han byter själv på uppfarten.
- **EXISTING FRICTION:** Däckbytet sker i oktober–november; han håller ett 20–25 kg hjul
  i luften med knäet och ska träffa bulthålen samtidigt. Kroppslig, årlig, konkret.
- **OLD WAY:** Knäet under hjulet och peta in första bulten — ren improvisation.
- **PRODUCT'S ROLE:** Skruvas i ett gänghål; hjulet hängs på och centreras av sig självt.
- **WHY THE AD DOES NOT NEED TO CREATE DEMAND:** Han har gjort det trettio höstar i rad.
- **TEMU MATERIAL:** `BLOCKED_SOURCE`. Titlarna är rena spec-titlar, ingen antydan om video.
- **SWEDISH SHELF STATUS:** **FAIL på ankarpriset, inte på kedjorna.** Biltema och Jula
  saknar dem (forumbelägg: folk svarvar egna av gängstång). Men **Thansen säljer
  "Styrpinne för däckbyte M12x1,50" för 89,95 kr** och Motonet har M14x1,5.
- **TEMU PRICE:** UNKNOWN (Seznam gav inget pris på just dessa id).
- **PLAUSIBLE SWEDISH PRICE:** går inte att sätta ≥ 300 kr mot ett 90-kronorsankare.
- **ECONOMIC ROOM:** **FAIL.** BE-CPA ≥ 190 kr är omöjligt.
- **VARIANT FRICTION:** **FAIL.** Gängan är M12x1,25 / M12x1,5 / M14x1,25 / M14x1,5 och
  ägaren kan den inte utantill. Det är exakt DNA:ts farliga variant — motsatsen till
  motorhöljets hästkrafter, som han kan.
- **≤ 7-ORDS ÄGARFRÅGA:** "Byter du hjulen själv i höst?" (6 ord)
- **WINNER-STRUCTURE MATCH:** 52 / 100
- **BIGGEST REASON IT COULD FAIL:** 90-kronorsankaret och gängvalet, i den ordningen.
- **CONFIDENCE:** HIGH (ankarpriset läst på produktsidan).

### 3. Lastkantskydd för bakre stötfångaren — **Tier C, fälld på gate 5 EKONOMI**

- **PRODUCT:** Universal Car Bumper Guard Strip / Rear Bumper Protection (de listningar som finns)
- **TEMU LINK:** https://www.temu.com/se/g-606583044070656.html
  (syskon: 601099518905378 · 601103783622808)
- **OBJECT / OWNER:** Bilens bakre stötfångare och lastkant. Han kör löv, ved, grus och
  återvinning på hösten.
- **EXISTING FRICTION:** Säckar och ved dras över kanten i oktober; kanten är lerig och repad.
- **OLD WAY:** En filt eller en kartongbit över stötfångaren — improvisation.
- **PRODUCT'S ROLE:** En flärp som kastas över kanten före lastning.
- **TEMU MATERIAL:** `BLOCKED_SOURCE`. Titlarna säger "sticker", "strip", "tape" — det är
  dekor, inte lastskydd i bruk. Svagt indicium.
- **SWEDISH SHELF STATUS:** `PENDING_VERIFICATION`. Kedjorna ej kontrollerade (budget slut).
  Sju svenska nischbutiker säljer "lastskydd/stötfångarskydd": **Carlevel 599–1 499 kr**,
  SC Styling, LastaTungt, Bilia, Mekster, Hova, Transport Styling. Ankaret finns och är
  högt — **men det är modellanpassad rostfri plåt, och vår produkt skulle inte se ut som
  ankaret**, vilket är DNA-undantagets uttryckliga villkor.
- **TEMU PRICE:** $3 · 94 % · 25 recensioner.
- **ECONOMIC ROOM:** **FAIL.** Landad 31–37 kr på en dekorremsa; produkten hamnar under
  199-kronorsgolvet. Ett riktigt lastskydd i den formen fanns inte i någon av tre sökningar.
- **VARIANT FRICTION:** OSÄKER — svensk handel säljer per bilmodell.
- **≤ 7-ORDS ÄGARFRÅGA:** "Repar du lacken när du lastar?" (6 ord)
- **WINNER-STRUCTURE MATCH:** 48 / 100
- **BIGGEST REASON IT COULD FAIL:** Reporna byggs upp långsamt — payoffen är fördröjd och
  osynlig, vilket är samma presensproblem som fällde värmepumpens helöverdrag.
- **CONFIDENCE:** MEDIUM (ankare läst, kedjekontroll ej gjord).

---

## (e) Tre lärorika Tier C-avslag

1. **Magnetiskt vindrutetäcke i Oxford (601105753823134, $8, 88 %, 99+ rec.) — kranskyddsfällan
   i renodlad form.** Allt utom en sak är rätt: ekonomin är klustrets näst bästa (landad
   84–98 kr, uppslag 3,6–4,2×, BE-CPA 251 kr), objektet är ägt och står ute, hooken skriver
   sig själv, publiken är kontots egen, och tyget är samma 420D-familj som redan sålt.
   Men **skadan inträffar i november–februari**. Kontot har betalat för att lära sig det
   en gång: Kranskydd Frost 420D, ROAS 1,59 mot break-even 1,49, pausad. Lärdomen är att
   ekonomi och material aldrig får läsas före presens — i eliminationsordningen kommer
   presens på plats två av ett skäl.

2. **Bildörrsteget — hyllan behöver inte vara en kedja för att döda.** Biltema, Jula, Clas
   Ohlson och Rusta säljer inte formen, så gate 3 ser ut att vara grön ända tills man
   googlar ägarens egna ord. Då ligger produkten hos Taktältarna för 289 kr och SmartaSaker
   för 375 kr. DNA:ts undantag kräver ett **synligt märkesankare ≥ 1,6× vårt pris**, och
   här pekar ankaret åt fel håll. Lärdomen: hyllkontrollen är inte fyra sajtsökningar, den
   är "vad hittar kunden på första sidan när han googlar det svenska ordet".

3. **Gnagarskydd under motorhuven (601100248593423, $17, 2-pack, 12 V, blixt + vibration).**
   Frestande: Folksam har en egen sida om gnagarskador, mössen flyttar in när det blir kallt
   — alltså precis nu — och ekonomin håller (landad 178–208 kr, 499 kr ger BE-CPA 291 kr).
   Ändå tre punkter i den negativa rymden samtidigt: skadan är **osynlig** tills bilen inte
   startar, produkten kräver **12 V-inkoppling under huven** (montering fäller 30 % av
   kontots förlorare), och effekten måste **påstås** i stället för visas. Ägarpresens 0 av 2.
   Lärdomen: ett erkänt problem är inte samma sak som ett synligt problem.

---

## Vad som skulle behöva göras för att ändra domen

- **Hämta de fem bildörrstegs-listningarna med `temu-ld.py --video` när blocket släpper**
  och läsa 0–3 s. Det ändrar inte hyllan, men materialet är värt att arkivera: formen
  återkommer i andra kluster (kajak, takbox, husbil) där ankarläget kan se annorlunda ut.
- **Kolla Ad Library SE på "fotsteg bildörr" och "styrpinne däckbyte".** Noll annonsörer
  på en produkt som sju svenska butiker säljer vore en signal om att ingen har positionerat
  den — men det ändrar inte 289-kronorspriset.
- **Däcklyftrem för hjulet** är klustrets enda strukturella överlevare och saknar listning:
  två sökningar gav noll Temu-träffar. Om formen dyker upp har den kroppslig payoff
  (ryggen), improviserad old way ("bär i armarna", samma mönster som spöhållaren) och
  ingen känd svensk hylla. Status `ALTERNATIVE_LISTING_REQUIRED`.
