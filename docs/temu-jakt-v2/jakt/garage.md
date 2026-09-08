# Kluster `garage` — garage/verkstad, bil på landet, vinterdäck, dragkrok, elbil

Datum 2026-09-04, 01:00–01:25 UTC. **Driftläge:** WebSearch-budgeten var slut (200/200) när klustret startade; Brave svarade 429/captcha efter första frågan; Temu blockerade vår IP (temu-ld.py `blocked: true` tre gånger, även via WebFetch). Enligt koordinatorns beslut 01:10 är **alla Temu-fält null, material = UNKNOWN och tiers provisoriska** (gate 1–3 + 6–8). Listningar hittades i stället via Temus egna US-SEO-kategorisidor (`…-s.html`, server-renderade, gav goods-id + USD-pris + antal recensioner) och Yahoo (via WebFetch). Hyllkontroller: Yahoo med svenska ord; sidorna själva är inte öppnade — allt är "ur sökutdrag". Ad Library: inte kollad.

## (a) Objektuniversumet

| Objekt (ägt, ute/synligt?) | Vad ägaren behöver i sep–okt | Sökt? |
|---|---|---|
| **Elbilen + laddboxen** (>600 000 laddbara, står på uppfarten/carporten) | skydda laddhandtaget/porten mot regn–snö–is *(NU)*, hänga kabeln (holster, vinda), skydda laddboxen (latent), förvara kabeln i bagaget | ja — 5 sökningar |
| **Takboxen** (tas av i oktober, 3–8 tkr, 2 m lång) | förvara i garagetaket (hiss), på väggen (fäste) | ja — 2 |
| **Dragkrokscykelhållaren** (tas av i oktober, 3–10 tkr) | vägghållare i garaget | ja — 1 (bara kategorisidor) |
| **Vinterdäcken/sommardäcken** (4 M bilar byter okt–nov) | förvara (ställ, krokar, väskor, stapelfodral), märka, byta (hylsor, hjullyft), transportera | ja — 5 |
| **Dragkroken** (50 mm kula) | kulskydd, humor-kulskydd; *allt med "2-inch receiver" är USA och faller i gate 1* | ja — 2 |
| **Garaget/carporten** | krokar (stege/kärra), takhiss, oljematta på golvet, väggkuddar mot bildörren, LED utan el, parkeringsstopp | ja — 5 |
| **Verkstadsbänken** | magnetlist, verktygstavla, skruvstädsbackar, arbetslampa | ja — 1 (sidan blockerad) |
| **Bilen på landet** (frost, batteri, hund) | vindrutefrostskydd, batteriladdare, hundgaller — *undvik-listan (Biltema/Jula samma form), inte sökt vidare* | nej (medvetet) |

## (b) Sökfraser som kördes

Brave (curl, 01:01 — enda lyckade): `site:temu.com tire rack wall mount wheel hanger garage storage` → 15 goods-id. Brave via WebFetch (01:05): `site:temu.com EV charging cable holder wall mount` → 20 goods-id. Därefter 429 på alla 22 köade fraser (`raw/garage/q1.txt`).
Yahoo via WebFetch (`site:temu.com …`): `EV charging plug cover rain protection charging handle` · `garage floor oil mat parking pad absorbent` · `tire storage bag wheel tote seasonal tires` · `trailer hitch tow ball cover towbar` · `wheel position tags tire marking labels seasonal` · `garage wall bumper car door protector parking` · `ceiling hoist roof box storage garage pulley` (503) · `lug wrench wheel bolt socket tire change tool` (503) · `tire rack wall mount wheel storage garage` (503) · `magnetic tool holder workbench wrench organizer` · `roof box hoist ceiling lift storage garage` · `hitch bike rack wall mount storage hanger` · `wheel lift dolly tire changing helper lifting aid` · `EV charging cable retractable reel wall mount type 2` · `type 2 ev charger holder with rain cover outdoor` · `roof rack crossbar wall storage holder bracket garage`.
Temu SEO-sidor (WebFetch): `ev-charger-rain-cover-5040250364386-s` (29 produkter) · `ev-charger-port-cover-5040280139279-s` (39) · `oil-mat-for-garage-5040016889123-s` (36) · `tire-storage-bags-5030230050054-s` (39) · `tow-hitch-cover-5030244245711-s` (40) · `trailer-hitch-accessories-5030240335103-s` (36) · `garage-wall-protectors-5030007292160-s` (38) · `nz/roof-rack-storage-5030269292159-s` (30) · blockerade: `tire-bag`, `magnetic-tool-holder`, `garage-ceiling-storage`, `tire-dolly`, `tire-changing-tools`, `ev-charger-hanger`, `ev-cable-holder`.
Hyllan (Yahoo, svenska): `regnskydd laddhandtag elbil laddport skydd biltema jula clas ohlson` · `laddport regnskydd elbil skydd laddhandtag regn köpa` · `däcköverdrag 4 däck däckväska biltema jula` · `takboxhiss biltema` · `takboxlyft takbox lyft garage jula thule multilift pris` · `laddkabelvinda vägg elbil kabelvinda laddkabel typ 2 biltema jula` · `hjullyft däckbyte hjuldolly lyfthjälp hjul biltema jula` · `vägghållare cykelhållare dragkrok förvaring vägg garage biltema jula thule`.

## (c) Tratten

| Steg | Kvar | Föll |
|---|---|---|
| Råkandidater i JSON | 33 | — |
| Gate 1 OBJEKT | 26 | 7 (USA-receiver ×3, J1772 ×2, förbrukning ×2) |
| Gate 2 PRESENS | 24 | 2 (laddboxöverdrag, portlucka — behovet måste skapas) |
| Gate 3 HYLLAN | 15 | 9 (däckväskor, däckställ, krokar, typ 2-hållare, kulskydd) |
| Gate 4 MATERIAL | 15 | 0 — **UNKNOWN för alla** (Temu-block) |
| Gate 5 EKONOMI | 8 | 7 (oljemattor, väggkuddar, dyra magnetlock, skull-kulskydd) |
| Gate 6–8 | 8 | 0 fällda, 4 OSÄKER (magnet/alu, stapelhöjd, kabeldiameter) |
| Negativ rymd | 7 | 1 (PVC-kit) |
| **Tier** | **A 0 · B 4 · C 5 · ELIM 24** | |

Sett från vinnarstrukturen är det bara **två produktidéer** som överlever, med syskonlistningar: **(1) magnetiskt regnskydd för laddport + laddhandtag** och **(2) takhiss för takboxen**. Den tredje (laddkabelvinda) står i C tills priset är känt.

## (d) Tier B — fullständig mall

### B1. Magnetiskt regnskydd för elbilens laddport och laddhandtag
- **PRODUCT:** 1pc Car Charging Magnetic Cover — Electric Outdoor EV Charger Plug (syskon: 601099874504144 "Universal Car Charging Magnetic Cover", 6 rec.)
- **TEMU URL:** https://www.temu.com/se/g-601099579267397.html (US-SEO: $9,17, 7 recensioner; SEK-pris, betyg, bilder, video: **ej hämtade**)
- **OBJECT/OWNER:** Elbilen som står ute på uppfarten/i carporten och laddar över natten; ägaren har laddbox och Typ 2-handtag i porten.
- **EXISTING FRICTION:** Regn rinner in i porten och över handtaget varje natt i september–oktober; löv och snöslask i porten; från oktober is som gör att handtaget sitter fast eller att luckan fryser.
- **OLD WAY:** Ingenting — eller en plastpåse/handduk över handtaget (improvisation, precis som presenningen på utombordaren).
- **PRODUCT'S ROLE:** En magnetisk huv som läggs över port + isatt handtag på 2 sekunder och tas av med en hand på morgonen.
- **WHY THE AD DOES NOT NEED TO CREATE DEMAND:** Ägaren ser det blöta handtaget varje kväll just nu; hooken pekar bara på honom. Höst = i säsong, och den blir starkare ju närmare frosten (ingen risk att säsongen tar slut — den börjar).
- **TEMU MATERIAL:** UNKNOWN — ej hämtad (block). Måste verifieras: video ska visa huven på en bil ute, inte i studio.
- **0–3 SECOND PROOF:** UNKNOWN.
- **SWEDISH SHELF STATUS:** Biltema, Jula, Clas Ohlson, Rusta: inga träffar i två Yahoo-sökningar (ur sökutdrag). Fyndiq listar flera kopior ("EV Laddportsskydd … med Magnetisk Fastning") → hyllfrånvaro 1 av 2 (bara marketplace). Ad Library ej kollad.
- **TEMU PRICE:** $9,17 (US-SEO). SEK: ej hämtat.
- **PLAUSIBLE SWEDISH PRICE:** 349 kr (uppskattning: 9,17 × 9,5 × 1,5 ≈ 131 kr landad; 349/131 = 2,7×).
- **ECONOMIC ROOM:** BE-CPA ≈ 218 kr (uppskattning). Under 300-gränsen för fri frakt → flerköp svagt (en port per bil); två-bilshushåll är enda skälet. Ligger i "< 500 kr"-bandet där DNA kräver kostnad ≤ 100–130 **och** gratis leverantörsmaterial — därför står materialgaten mellan B och A.
- **VARIANT FRICTION:** En variant. Risk: magneten fäster inte på aluminiumkaross (vissa Audi/Jaguar/Polestar-paneler); ägaren vet det inte alltid. Lös på produktsidan, aldrig i annonsen.
- **≤7 WORD OWNERSHIP HOOK:** "Laddar du elbilen ute i regnet?" (6 ord)
- **WINNER-STRUCTURE MATCH:** 72
- **TOP 3 REASONS:** (1) Ägarpresens 2/2 — problemet syns på uppfarten i kväll. (2) Ny kategori i svenskt flöde: elbilsägaren har aldrig fått den här annonsen, och kontot har aldrig sålt till honom (600 000+ hushåll, huvudsakligen villa). (3) Objektet är omisskännligt i bild (laddhandtag i port) → CPM-proxy låg.
- **BIGGEST REASON IT COULD FAIL:** Materialet + Fyndiq-kopior: om leverantörsvideon är en hand som smäller dit en flärp i studio finns ingen annons, och en 99-kronorskopia i flödet gör 349 kr omöjligt.
- **CONFIDENCE:** MEDIUM (material ej verifierad, kurs uppskattad, Ad Library ej kollad).

### B2. Syskon: Universal Car Charging Magnetic Cover — 601099874504144
Samma produktklass, $14,55, 6 recensioner → landad ≈ 207 kr, SE-pris ≈ 499 kr, BE-CPA ≈ 292 (uppskattning). Dyrare inköp ger bättre BE-CPA men 499 kr för en flärp kräver att den ser ut som ett Thule-tillbehör. Välj den av B1/B2 vars video är bäst när Temu-hämtningen är gjord. Structure match 70, confidence MEDIUM.

### B3. Takhiss för takboxen i garagetaket
- **PRODUCT:** Heavy duty stainless lift, overhead ceiling-mounted hoist with pulley system, 100 lb (syskon: 606866444784512 "Garage Ceiling Lift Storage Hanger 45 lbs" — finns redan på temu.com/se-en)
- **TEMU URL:** https://www.temu.com/se/g-601099714039172.html (pris, betyg, bilder, video: **ej hämtade**)
- **OBJECT/OWNER:** Takboxen (Thule/Calix/Biltema, 15–25 kg, 2 m) som ägaren tar av bilen i oktober–november. Garagetaket är ägt.
- **EXISTING FRICTION:** Boxen står på garagegolvet eller lutad mot väggen hela vintern, tar en halv bilplats, repas, och behöver två personer för att lyftas.
- **OLD WAY:** Golvet, två bockar, snöre i takbjälken (improvisation) — eller Thule Multilift i fackhandel.
- **PRODUCT'S ROLE:** Fyra krokar/remmar + block: dra i linan, boxen åker upp i taket och hänger ovanför bilen.
- **WHY THE AD DOES NOT NEED TO CREATE DEMAND:** Alla takboxägare gör exakt det här bytet i oktober och har redan problemet "var ska den stå". Säsongsväxlings-logiken från motorhölje → båtmotorskydd: samma ägare, nästa fas.
- **TEMU MATERIAL:** UNKNOWN — ej hämtad. Kritiskt: videon måste visa lyftet (dra i linan), inte monteringen.
- **0–3 SECOND PROOF:** UNKNOWN.
- **SWEDISH SHELF STATUS:** Yahoo "takboxhiss biltema" → "We did not find results". Thule Multilift säljs via takbox.se/thansen.se (fackhandel) → hyllfrånvaro 1. Märkesankaret finns men priset kunde inte läsas ur utdraget — ≥ 1,6× **ej verifierat**.
- **TEMU PRICE:** ej hämtat (NZ-SEO-sidan listade inte hissen).
- **PLAUSIBLE SWEDISH PRICE:** Okänt tills Temu-priset finns; produktklassen ligger normalt i 500–900 kr-bandet ("> 500 kr har aldrig förlorat") om landad kostnad ≤ 350.
- **ECONOMIC ROOM:** Okänt. Flerköpsskäl: samma hushåll har cykel/kajak — andra hissen är rimlig.
- **VARIANT FRICTION:** En variant per kapacitet (45 lb ≈ 20 kg / 100 lb ≈ 45 kg); ägaren vet ungefär boxens vikt. 20 kg-varianten ligger nära takboxens vikt — måste anges.
- **≤7 WORD OWNERSHIP HOOK:** "Står takboxen i vägen i garaget?" (6 ord)
- **WINNER-STRUCTURE MATCH:** 62
- **TOP 3 REASONS:** (1) Säsongsväxling på ett dyrt ägt objekt (hävstång ≥ 10×). (2) Ingen kedja säljer formen; ankaret Thule finns. (3) Takboxen är omisskännlig i flödet och ägaren är exakt kontots 45–70 villa/fritidshus.
- **BIGGEST REASON IT COULD FAIL:** Montering i tak (skruv i bjälke + block) — 30 % av förlorarna kräver montering, och en video som visar skruvande är förklaring. Pris okänt.
- **CONFIDENCE:** LOW (pris, material och ankarpris saknas).

### B4. Syskon: Garage Ceiling Lift Storage Hanger 45 lbs — 606866444784512
Samma som B3 med lägre kapacitet; hittad på `/se-en/`, vilket tyder på att den redan säljs mot Sverige. Structure match 60, confidence LOW.

## (e) Lärorika Tier C-avslag

1. **Dödskalle-kulskydd 50 mm (606422737766625, $9,24)** — klistermärke-strukturen finns här (universellt ägt objekt, ute, synligt bakom bilen, noll friktion, want) men två saker skiljer från soptunneklistermärkena: kostnaden (landad ~130 kr mot 80 → 199-kronorsformen ger BE-CPA ~70) och estetiken (skull träffar inte 55+). Kedjorna säljer släta kulskydd för en tia. Lärdom: undantagsklustret kräver *både* kostnad ≤ 80 kr och humor som passar 55+.
2. **Oljematta för garagegolvet (601099531606611, 525 rec., $29)** — bästa hooken i klustret ("Droppar bilen olja på garagegolvet?"), improviserad old way (kartong), problemet syns året runt. Faller ändå: landad ~420 kr → SE-pris ~1 000 kr för en gummimatta, fyra storlekar utan ägarkänd parameter, tung frakt, och bara läckande bilar. Lärdom: presens + hook räcker inte när ekonomin och storleksvalet är emot.
3. **Hjuldolly/hjullyft för däckbytet** — perfekt presens (oktober, 4 M bilar, tunga SUV-hjul, ägare 60+) och fackhandelsankare 1 500–3 000 kr, men Biltema säljer "Hjuldolly, hydraulisk" (2000039919) i samma form → gate 3 FAIL innan Temu-listningen ens hämtats (SEO-sidan blockerad). Lärdom: kolla hyllan *före* Temu.
4. **Laddkabelvinda på väggen (601103644234234)** — ligger kvar i C bara för att priset är okänt: ägarpresens (kabeln i slasket), ingen kedja säljer vinda (bara hållare), ankare Mavel EV-Reel. Risker: montering + kabelträdning kräver förklaring, "passar de flesta kablar" utan mått. Lyft till B om Temu-pris ≤ 350 kr landad och videon visar "dra ut – släpp – rullar in".

## Vad som måste göras centralt (när Temu-blocket släpper)
Hämta 601099579267397, 601099874504144, 601099714039172, 606866444784512 (+ 601103644234234) med `temu-ld.py --video`: SEK-pris, video, hero. Materialgaten avgör om B1/B2 blir Tier A. Kolla Ad Library SE för "laddport" och "takboxhiss".
