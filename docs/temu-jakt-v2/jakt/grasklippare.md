# Kluster `grasklippare` — åkgräsklippare, trädgårdstraktor, robotgräsklippare, gräsklippare, jordfräs, lövblås, vertikalskärare

**Datum:** 2026-09-04. **Filter:** `docs/temu-vinnar-dna.md` avsnitt 12 (eliminationsordning) + negativ rymd (avsnitt 6).
**Redan testat i klustret:** sätesöverdrag åkgräsklippare (vinnare), gräsklippartäcke (förlorare — klipparen står i förrådet), kedjeslip (förlorare).

## ⚠️ Datalägen som styr läsningen

| Källa | Status 2026-09-04 | Konsekvens |
|---|---|---|
| Temu-listningar (`temu-ld.py`) | **Blockerade för vår IP** från ca kl 01:10 UTC: alla anrop ger tomt skal utan JSON-LD, även efter 100 s paus, 20 s glesning och skriptets inbyggda retry (0/25/60 s). En enda listning lästes innan blockeringen (robotknivarna, 601099599310345: 170,17 kr, 4,8★, 118 rec). | **Pris, betyg, recensioner, hero och video = null för 27 av 28** (koordinatorns besked: sluta hämta, hämtning + materialgate körs centralt när blocket släppt). Gate 4 (material) och gate 5 (ekonomi) är inte körda på någon överlevare. **Alla tiers är provisoriska** — satta på gate 1–3 + 6–8 enligt koordinatorns instruktion; `tier_note` i JSON säger detsamma. |
| WebSearch | Sessionens budget (200) tog slut efter 20 Temu-sökningar — innan en enda svensk hyllsökning hann köras. | Hyllan (gate 3) är kontrollerad via **Pricerunner** (curl, fungerade) i stället för de fyra kedjornas egna sajter. |
| Jula / Biltema / Rusta / Clas Ohlson | Jula 403, Biltema 403, Rusta 404 på sök, Clas Ohlson-sök gav bara en kategorilänk. | Där jag skriver "Biltema/Jula säljer" utan pris är det **kategorikunskap, inte mätt** — markerat "EJ verifierat" i JSON. Pricerunner täcker Jula, Clas Ohlson och fackhandel men inte Biltema/Rusta. |

Allt nedan som är siffror kommer ur Pricerunner-sökutdrag (URL = `pricerunner.se/results?q=<fras>`) eller ur den enda lästa Temu-listningen. Inget är gissat; det som saknas står som UNKNOWN.

---

## (a) Objektuniversumet

Bara objekt som **står ute eller används kroppsligt** i september–oktober. Allt som "förrådet löser gratis" (gräsklipparen, jordfräsen, vertikalskäraren — körs 1–2 ggr/år och står inne) är struket i steg 0.

| Objekt (ägt, ute) | Skydda | Fästa / dra | Rengöra / underhålla | Organisera / förvara | Nå / transportera | Bekvämare | Säkra |
|---|---|---|---|---|---|---|---|
| **Robotgräsklippare** (står ute till oktober, sedan vinterförvaring) | tak/garage över robot + laddstation ✔ sökt · skyddsfolie kaross (ej hittat) | **hjulpiggar/slirskydd** ✔ sökt · kantklippning (ej hittat) | knivbyte (förbrukning) ✔ · rengöringsborste (ej sökt) | vinterväska/box (ej hittat på Temu, bara garage) | — | — | GPS-tracker (bara generiska) ✔ · gränskabel-skarv ✔ (förbrukning) |
| **Åkgräsklippare / trädgårdstraktor** (används sep–okt; snöblad nov–mars) | säte ✔ (klart) · ratt (ej hittat på Temu) · täcke (förlorare, struket) | **snöblad** ✔ · dragkrok ✔ · tippkärra ✔ · gräsmattesop/lövuppsamlare ✔ · snökedjor (bara bilkedjor på Temu — **lucka**) | knivslip (borrtillsats) ✔ · lyft/domkraft ✔ · däcktätning (ej sökt) | batteriladdare ✔ | — | armstöd/mugghållare (bara golfbil) | — |
| **Lövblås** (handhållen/batteri, används varje vecka i okt) | — | **hängrännerensar-sats** ✔ · lövuppsamlingstratt (ej hittat) | — | vägghållare ✔ (inomhus, struket) | — | axelsele ✔ (Echo-reservdel) | — |
| **Hängränna** (på huset, full i oktober) | — | via lövblåsen ✔ | lövskopa ✔ | — | — | — | — |
| **Löven på tomten** (universellt) | — | — | lövplockare/skopor ✔ | trädgårdssäck (förlorare, struket) | — | — | — |

Objekt som är **ute men saknade i Temu-sökningarna** (luckor för nästa jakt): traktorspecifika snökedjor, rattöverdrag åkgräsklippare, robotklipparens kaross-skyddsfolie, kantklippningsguide för robot, lövblåsens uppsamlingstratt/"leaf funnel" för säck.

## (b) Sökfraserna (WebSearch `site:temu.com …`, 20 st — därefter tog budgeten slut)

riding lawn mower snow plow blade · robot lawn mower garage roof canopy · robot mower wheel spikes anti-slip cover · robot mower boundary wire connector repair kit · lawn tractor dump cart trailer · lawn mower blade sharpener drill attachment · riding mower hitch receiver tow · leaf blower gutter cleaning attachment kit · tow behind lawn sweeper leaf collector · lawn tractor tire chains snow · riding mower steering wheel cover · robot mower blades titanium replacement automower · robot mower charging station cover rain protection · robot lawn mower winter storage cover bag · lawn mower lift jack riding mower maintenance · backpack leaf blower harness shoulder strap · riding mower armrest cup holder accessory · lawn tractor battery maintainer trickle charger 12v · robot mower gps tracker anti theft · leaf scoops hand rakes grabber

Inga träffar på Temu för: rattöverdrag åkgräsklippare (bara bil), traktorsnökedjor (bara bil), robot-GPS (bara generiska), armstöd (bara golfbil).

**Hyllan (Pricerunner, curl):** robotgräsklippare garage · robotgräsklippare tak · hjulpiggar robotgräsklippare · slirskydd robotgräsklippare · piggar robotgräsklippare hjul · snöblad åkgräsklippare · snökedjor åkgräsklippare · tippkärra åkgräsklippare · lövuppsamlare åkgräsklippare · lyft åkgräsklippare · dragkrok åkgräsklippare · knivslip gräsklippare · hängrännerensare · takrengöringsset lövblås · kabelskarv robotgräsklippare · rattskydd åkgräsklippare · robotgräsklippare skyddstak universal.

## (c) Tratten

| Steg | Kvar | Föll | Vad som föll |
|---|---|---|---|
| Råkandidater (listningar) | 28 | — | |
| 1 OBJEKT | 22 | 6 | knivar (förbrukning), kabelskarv (förbrukning), knivslip (klipparen inne), bilkedjor (fel objekt), Echo-remmar (reservdel/oklart ägande), vägghållare (inomhus) |
| 2 PRESENS | 18 | 4 | 3 dragkrokar (latent — kräver kärra först), batteriladdare (skadan i april) |
| 3 HYLLAN | 6 | 12 | 6 robotgarage (universalgarage 399–906 kr masshandlat), 2 tippkärror, 2 gräsmattesopar, lyft, lövplockare |
| 4 MATERIAL | 6 (ej hämtad) | 0 | **ej körd — Temu blockerat; körs centralt** |
| 5 EKONOMI | 6 (ej hämtad) | 0 | ej körd — inget Temu-pris |
| 6 VARIANT | 5 | 1 | snöblad (fäste per chassi + montering) |
| 7 HOOK | 5 | 0 | |
| 8 PUBLIK | 5 | 0 | |
| **Tier A (prov.)** | **0** | | ingen överlevare klarar gate 1–3 + 6–8 utan OSÄKER (variant resp. hylla) |
| **Tier B (prov.)** | **5** (2 produktidéer) | | hängrännesats till lövblås ×2 listningar · hjulpiggar robot ×3 listningar |
| **Tier C (prov.)** | 1 | | snöblad (lärorik) |

---

## (d) Tier B — två produktidéer, fem listningar

### B1. Hängrännerensar-sats till lövblås (universal, teleskophals ~3,3 m)

- **PRODUCT:** Universal gutter-cleaning attachment for leaf blowers — böjd teleskopslang + stödbåge + 4 adaptrar, ägaren blåser ur hängrännan stående på marken.
- **TEMU URL:** https://www.temu.com/se/g-601103248788835.html (även 601103296007046, samma form med stödstruktur och "fits most blower brands"). Svensk titel/pris/betyg: **UNKNOWN (blockerad)**.
- **OBJECT / OWNER:** Lövblåsen (batteri/bensin) som redan hänger i garaget och används varje helg i oktober; hängrännan på huset. Man 45–70, villa/fritidshus.
- **EXISTING FRICTION:** Rännan är full av löv och barr i september–oktober. Vatten rinner över kanten, sedan isproppar. Han vet det — han ser det varje gång det regnar.
- **OLD WAY:** Stege + handskar + hink (fallrisk, 55+), eller "tar det i vår". Gutter-rensning från stegen är det klassiska fallolycksscenariot i åldersgruppen.
- **PRODUCT'S ROLE:** Samma lövblås, ny räckvidd: rännan blåses ren från marken på fem minuter utan stege.
- **WHY THE AD DOES NOT NEED TO CREATE DEMAND:** Rännan är full nu. Objektet (lövblåsen) är ägt. Lösningen förstås i en stillbild: man på marken, böjt rör upp i rännan, löv som yr.
- **TEMU MATERIAL:** **EJ SEDD** — listningen blockerad. Enligt titelstrukturen finns galleribilder med produkten i bruk; om det finns video är okänt. Måste öppnas innan beslut.
- **0–3 SECOND PROOF:** Ej verifierad. Krav vid granskning: man + blås + ränna i bild sekund 0, löv yr före sekund 3.
- **SWEDISH SHELF STATUS:** Pricerunner: ingen universalsats. Bara märkesbundna: **Einhell Gutter kit 3433559, 359 kr** (passar Einhell) och **Stihl Takrengöringsset BG 56/86, SHE 71, 745 kr**. Jula/Biltema ej nåbara (403) — kategorin "hängrännerensare" gav noll relevanta träffar på Pricerunner (bara slangvindor). Hyllfrånvaro ≈ 1–2.
- **TEMU PRICE:** UNKNOWN. (Amerikanska listningar i sökutdragen anger inget pris.)
- **PLAUSIBLE SWEDISH PRICE:** 449–499 kr under Stihl-ankaret 745 (1,5–1,66×). Sätts först när Temu-priset är känt.
- **ECONOMIC ROOM:** Kan inte räknas. Villkor: Temu-pris ≤ 125 kr → landad ≈ 190 → 449 ger 2,4× och BE-CPA 259. Är Temu-priset > 140 kr faller 449 under 2,4×.
- **VARIANT FRICTION:** OSÄKER. "Passar de flesta" via adaptrar — ägaren kan inte sitt munstycksmått. Svenska storsäljare (Ryobi, Bosch, Husqvarna, Stihl batteri) måste testas fysiskt mot adaptrarna före launch. Detta är den variabel som fällde tofflorna (passform) i vinnaranalysen.
- **≤7 WORD OWNERSHIP HOOK:** "Har du en lövblås? Slipp stegen." (6 ord) — alt. "Rensar du hängrännan från stegen?" (5 ord).
- **WINNER-STRUCTURE MATCH:** 68/100 (ägt objekt ute ✔, presens 2 ✔, hyllfrånvaro 1–2 ✔, ägarfråga ✔, publik ✔, säsong ✔ (≥ 6 veckor: löv till mitten av november) · material ? · pris ? · variant ✗/?).
- **TOP 3 REASONS:** (1) Starkast tänkbara presens i klustret — problemet syns från gatan i oktober och löser sig inte "i förrådet". (2) Rädsla/förlust-komponent (fall från stege, 55+) utan att annonsen behöver agitera. (3) Ankare 745 kr i fackhandel, ingen universalprodukt i kedjorna.
- **BIGGEST REASON IT COULD FAIL:** Passar inte ägarens blås (adapter-passform) → returer och 1★; eller Temu-materialet visar bara ett rör i studio utan ränna.
- **CONFIDENCE:** LOW (material och pris osedda).

### B2. Hjulpiggar / slirskydd till robotgräsklippare

- **PRODUCT:** Rostfria piggar (12–14 st) som skruvas i drivhjulen, eller gummi-slirskydd — roboten tar sig upp i blöta sluttningar.
- **TEMU URL:** https://www.temu.com/se/g-601099514177508.html (225 mm, Worx Landroid L), https://www.temu.com/se/g-601100183382557.html (Robomow-serier, metall), https://www.temu.com/se/g-601101022004142.html (Dreame A1, gummihjul). Pris/betyg/video: **UNKNOWN (blockerad)**.
- **OBJECT / OWNER:** Robotgräsklipparen som står ute på gräsmattan till oktober. Omisskännlig i flödet (CPM-proxy stark).
- **EXISTING FRICTION:** September–oktober = blött gräs + löv = roboten slirar, gräver spår och fastnar i slänten; "Fast"-notis i appen. Fotograferbart (hjulspår, roboten på tvären).
- **OLD WAY:** Går ut och lyfter loss den, klipper bara torra dagar, eller köper originalhjul 388–1 095 kr.
- **PRODUCT'S ROLE:** Tio minuters skruvande → grepp i blött gräs resten av säsongen.
- **WHY THE AD DOES NOT NEED TO CREATE DEMAND:** Ägaren har redan fått larmet. Frågan "Fastnar robotklipparen i blött gräs?" svarar bara robotägare med slänt ja på.
- **TEMU MATERIAL:** EJ SEDD. Kategorin brukar ha katalogfoton av piggar + ett hjul; video i bruk (robot i slänt) är okänt.
- **0–3 SECOND PROOF:** Ej verifierad.
- **SWEDISH SHELF STATUS:** Pricerunner: **Worx Landroid S/M Halkskydd Hjulskydd Spikar 353 kr**, **MTP TLDM-01 halkfria drivhjul Dreame 273 kr**, **Ise ersättningshjul med spikes Husqvarna 702 kr**, Stihl traktionshjul 484–615 kr. Alltså: formen finns i svensk e-handel/fackhandel (hyllfrånvaro 1), inte synligt hos de fyra kedjorna (ej verifierat mot Jula/Biltema). Ankare Ise 702 / Stihl 615.
- **TEMU PRICE:** UNKNOWN.
- **PLAUSIBLE SWEDISH PRICE:** 349 kr (under Worx-353 finns ingen ankarvinst; över 399 blir det Ise-nivå utan synlig skillnad). Smalt band.
- **ECONOMIC ROOM:** Kan inte räknas. Villkor: Temu-pris ≤ 95 kr → landad ≈ 145 → 349 ger 2,4× och BE-CPA 204. Flerköpsskäl: nej (två drivhjul ingår i ett set).
- **VARIANT FRICTION:** OSÄKER→negativ. Piggarna matchar hjulstorlek per märke (205/225/250 mm) — ägaren vet märket (Husqvarna/Gardena/Worx/Stiga), inte hjulmåttet. Kräver en listning per märke i butiken och att annonsen inte visar tabell. Husqvarna Automower är Sveriges vanligaste robot — **ingen Husqvarna-listning hittad på Temu i den här jakten** (bara Worx/Robomow/Dreame), vilket är ett verkligt hål: den största ägarklassen saknar produkt.
- **≤7 WORD OWNERSHIP HOOK:** "Fastnar robotklipparen i blött gräs?" (5 ord).
- **WINNER-STRUCTURE MATCH:** 60/100.
- **TOP 3 REASONS:** (1) Robotklippare = omisskännligt objekt ute, ägarklass ≥ 300 000 hushåll (uppskattning, ej mätt). (2) Presens 2 i exakt den här månaden. (3) Ingen av kedjorna syns i kategorin; ankare 615–702.
- **BIGGEST REASON IT COULD FAIL:** Märkessplittring — utan Husqvarna-variant når vi inte majoriteten; och Temu-priset kan vara så lågt att 349 kr ser ut som 5× mot Worx-353 hos konkurrent utan synlig skillnad. Dessutom monteringssteg (skruvar, roboten upp-och-ned).
- **CONFIDENCE:** LOW.

---

## (e) Lärorika Tier C/ELIM-avslag

**C1. Universellt snöblad till åkgräsklippare (601099715207840) — Tier C.** Axel pekade ut det som höst/vinter-produkt, och ankaret är enormt (Husqvarna snöblad 7 990–18 900 kr, Stiga 5 990, Texas 2 734 på Pricerunner). Det faller ändå på tre ställen: (1) presens — snön ligger i november–december, inte i annonsmånaden (kranskyddsfällan: "skadan ligger i november, launch i augusti"); (2) variant — fästet ska passa ett chassi ägaren inte kan måtten på, med bultmontering; (3) ekonomi — ett stålblad med fäste väger 20–30 kg och kostar sannolikt > 1 000 kr landat (Temu-pris UNKNOWN). Det kan bli en produkt **i oktober–november om Temu-priset visar sig ≤ 400 kr** och fästet är ett universellt vajerfäste — då med hooken "Har du en trädgårdstraktor? Ploga med den." Fram tills dess är det en gissning.

**ELIM: Robotgräsklippargarage (6 listningar).** Perfekt på objekt, presens, hook och publik — och ändå ute i gate 3. Pricerunner visar att universalgarage/tak är masshandlat i Sverige: Worx 399, Herrselsam polykarbonat 636, tectake 709, Hyma 895, vidaXL 906, plus alla märkeshus 1 000–3 000. Vår Temu-produkt ser ut som 399–709-kronorsvaran, inte som Husqvarna-huset, så ankarundantaget gäller inte. Lärdomen är IBC-regeln baklänges: IBC-skalet vann för att ingen svensk kanal hade formen; robotgaraget förlorar samma jämförelse redan i Google.

**ELIM: Dragkrok till åkgräsklippare (3 listningar).** Ser ut som spöklämman (billig, fäster på ägt objekt, ankare Stiga 749 / Alpina 592) men saknar det spöklämman hade: ett problem som finns per tur. Kroken löser ingenting förrän kärran finns — behovet måste skapas i annonsen, och det är den vanligaste förlorarprofilen (55 % av kontrollgruppen). Plus bultmönster per chassi.

**ELIM: Knivslip som borrtillsats.** Exakt kedjeslipens struktur: objektet (gräsklipparen) står i förrådet, skadan (slö kniv) är osynlig, Pricerunner har samma form för 169–215 kr. Struken i gate 1 utan att titta på materialet — så ska filtret spara tid.

## Vad som krävs för att gå vidare (för koordinatorn)

1. **Kör `temu-ld.py --video` på fem ID:n när IP:n släpps** (≥ 5 min paus, ett i taget): 601103248788835, 601103296007046, 601099514177508, 601100183382557, 601099715207840. Gate 4 + 5 avgörs på 10 minuter när datan finns.
2. Jula- och Biltema-kontroll på "hängrännerensare lövblås" och "hjulpiggar robotgräsklippare" från en session med sökbudget kvar — det är de två hyllfrågorna som är obesvarade.
3. Sök Temu på **Husqvarna Automower**-piggar specifikt; utan den varianten är B2 halv.
