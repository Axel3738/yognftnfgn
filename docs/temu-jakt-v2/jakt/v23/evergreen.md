# Evergreen ägare/objekt-produkter — bil, släp, garage, verktyg, hus/tomt, hund (v23, 2026-09-05)

**Uppdrag:** tillbehör till något kunden redan äger och använder året runt, där friktionen inte är säsongsbunden.
Förebilder i kontot: spöklämman (289 kr, 307 köp), PTZ-kameran (799 kr, 61 % köper 2–3), bälteslipen (909 kr).
**Metod:** `JAKT-INSTRUKTION.md` + `docs/temu-vinnar-dna.md` avsnitt 12 (eliminationsordning) + `v22/DATAVAGAR.md`.
temu.com:s produktsidor rördes inte; priser kommer ur Seznam-snippets (curl) och Temus egna serverrenderade
söksidor via WebFetch (2 lyckade anrop, tredje gav bara "Temu" = strypt). Hyllan via WebSearch + WebFetch på
butikssidor. **Sökbudgeten (200 WebSearch) tog slut i slutfasen** — tre publiktal (hundar, Makita-ägare,
högtryckstvättar) står därför som UNKNOWN i stället för gissade.

---

## Huvudfyndet: evergreen bil/släp/garage är Biltemas, Julas och Clas hylla — och där kedjan saknar formen ligger Fyndiq/Amazon/fackhandeln under vårt pris

18 koncept prövades med hyllkontroll. **0 klarade alla gater. 15 föll på hyllan eller negativa rymden,
2 saknar Temu-listning, 1 (kopplingskameran) har rätt struktur men bara för dyra listningar synliga.**

Det bekräftar v22 (garage/fordon 0 av 30) från en ny vinkel: den här gången söktes inte säsongsprodukter utan
just det som används året runt — och det är exakt det kedjorna lagerhåller. Kontots evergreen-vinnare
(spöklämma, PTZ, bälteslip) vann inte för att de var evergreen, utan för att formen saknades i Sverige
(klämman), var billigast för en synlig spec (två linser), eller kostade > 500 kr (bandslipen). Ingen av
uppdragets sju riktningar gav en form som svensk handel saknar **och** som Temu säljer under 35 USD.

Tre lärdomar som är nya mot v22:
1. **Tech-formen är den enda som överlevde hyllan** (kopplingskamera: Biltema har bara kablade monitorkit).
   Men Temus synliga listningar ligger 90–221 USD — formen är prissatt för USA-pickuper. Den billiga
   720p-varianten (601099523116633) finns men är opris. Verifiera den före allt annat.
2. **Fackhandelsankaret kan ligga UNDER 2,4×-priset även när kedjan saknar formen** — underredestvätten:
   Biltema har bara en böjd lans, men Autodude (679) och Bilvårdsbutiken (749) säljer exakt hjulformen.
   Ett Temu-pris på 25 USD kräver 626–734 kr → inget ankarläge. Samma mönster som bildörrsteget (289/375).
3. **Uppdragets egna listor är kontrollerade och fällda:** nackstödshängare (Jula 99,90 / CDON 89),
   gap filler (Biltema + Fyndiq 123–188), bakluckeljus (Fyndiq 186–330, Biltema magnetlist), däcktrycks-TPMS
   (Biltema + Tirepulse), nyckelskåp (Clas 299), hundbälte ISOFIX (Rukka 149, Biltema), motorsågshållare
   (Fyndiq 244), Makita-väggfäste (Fyndiq 260), borrmaskinshölster (CDON 119), trådlösa magnetlyktor
   (Biltema 2000046997). Ingen kräver fler sökningar.

---

## Objektuniversum — vad som söktes och varför resten ströks

| Riktning | Objekt | Idé | Utfall | Grund |
|---|---|---|---|---|
| Bilen | dragkrok + släp | magnetisk kopplingskamera (telefon) | **rank 1** | kedjan saknar formen; Amazon.se har den (pris oläst) |
| Bilen | hjulet vid däckbytet | däcklyftrem | **rank 2** | ingen hylla, ingen listning |
| Bilen | bagagerum | organizer med lock | FAIL | Jula 199 |
| Bilen | bagagerum | LED-list sensor magnet | FAIL | Fyndiq 186–330, Biltema |
| Bilen | nackstöd | kasskrok | FAIL | Jula 99,90, CDON 89 |
| Bilen | säte/konsol | gap filler | FAIL | Biltema + Fyndiq 123–188 |
| Bilen | däck | TPMS solcell | FAIL | Biltema, latent, montering |
| Bilen | däck | digital tryckmätare | ej sökt | Biltema-commodity; katalogen har däckdjupsmätare |
| Bilen | solskydd | visir-organizer | ej sökt | < 100 kr commodity (Fyndiq-klass) |
| Bilen | laddkabel/garage | kabelhållare | ej sökt | avgjort FAIL i v22 garage (EV-hållare ×5) |
| Bilen | underrede | underredestvätt på hjul | **rank 3** | kedjan saknar formen, fackhandel 679–749 = under ankarnivå |
| Släpvagnen | koppling/backning | solcells-backkamera m. monitor | **rank 4** | ekonomi: 101–221 USD |
| Släpvagnen | baklyktor | trådlösa magnetlyktor | FAIL | Biltema 2000046997 samma form |
| Släpvagnen | baklyktor | lyktskydd/galler | FAIL | Nettotrailer 173, ingen listning |
| Släpvagnen | koppling | kulskydd / kopplingslås / hjullås / stödhjulslås | ej sökt igen | v22 husvagn: Jula 99–199, Clas 269, Biltema — 19 fällda |
| Släpvagnen | reflexskylt | hållare | ej sökt | Biltema-commodity |
| Släpvagnen | last | lastsäkring | ej sökt | lastnät + självupprullande spännrem finns i katalogen |
| Garaget | vägg | Makita-batterihållare | FAIL | Fyndiq 260 (6-pack) |
| Garaget | vägg | motorsågshållare stål | FAIL | Fyndiq 244, Tradera 49–59 |
| Garaget | vägg | magnetisk verktygshållare, hylsnyckelhållare | ej sökt | Biltemas kärnhylla (v22 garage: verktygsvägg ELIM gate 1) |
| Garaget | golv | knäskydd/arbetsmatta | ej sökt | Biltema-commodity, kroppsburen PPE-lik |
| Garaget | tak/vägg | kabeltrumma, luftslangsvinda | ej sökt | Biltema/Jula automatvindor 499–999 |
| Verktygen | skruvdragare | bälteshölster | FAIL | CDON 119, Jula |
| Verktygen | borr | borrslip | FAIL | Jula 269; Drill-Doctor-formen 45 USD över taket |
| Verktygen | vinkelslip/borrmaskin | skyddsfodral, måttbandhållare, mobilhållare bänk | ej sökt | < 199-klass, inomhus |
| Huset/tomten | dörr | nyckelskåp kodlås | FAIL | Clas 299 |
| Huset/tomten | brevlåda, husnummer | skylt/reflex | ej sökt | mailbox-stickers FAIL i v22 tomt; solcells-husnummer redan PENDING i hus-klustret |
| Huset/tomten | grind | grindhjul | ej sökt | redan WATCH #8 i slutrapporten |
| Hunden | bil | bagagerumsskydd m. stötfångarflärp | **rank 6** | Trixie 499, Biltema |
| Hunden | bil | ISOFIX-bälte | FAIL | Rukka 149, Biltema, Jula |
| Hunden | bil | matskål, hårborttagare | ej sökt | < 100 kr commodity |
| Hunden | dörr | koppelhållare | ej sökt | inomhus, < 100 kr |
| Båten året runt | reling/batteri/plotter | fenderhållare, batteriboxrem, plotterskydd | ej sökt | Biltema (fender, rem); plotterskydd säljs per tum = variantfälla; `batch1/hostfiske.md` visar heltäckande fackhandel |

---

## Sökfraser

**Svenska hyllan (WebSearch, 26 st):** kopplingskamera släpvagn trådlös magnetisk · trådlös ljusramp släpvagn
magnet biltema jula · batterihållare vägg Makita 18V · bagagerumsbelysning LED magnetisk rörelsesensor ·
hölster skruvdragare bälte · undervagnsspolare Kärcher · motorsågshållare vägg · bagagerumsorganiserare
biltema jula · stötfångarskydd hund bil · hundbälte bil isofix · däcktrycksövervakning TPMS solcell ·
lyktskydd släpvagn biltema · nyckelskåp utomhus kodlås · biltema "Trådlösa baklyktor med magnetfäste" ·
borrslip biltema jula drill doctor · "undervagnsspolare" OR "underredesspolare" · nackstödshängare biltema jula ·
gap filler mittkonsol fyndiq biltema · jula bagagerumslåda hamron 619292 · kopplingskamera husvagn kama fritid ·
biltema backkamera trådlös · antal släpvagnar i trafik Trafikanalys · MHCABSR hitch kamera amazon.se ·
Biltema TPMS "däcktryck" · Biltema "Underspolningsrör" · underredestvätt amazon.se fyndiq.

**Temu-listningar (WebSearch `site:temu.com`, 14 st):** magnetic wireless hitch camera trailer · wireless
magnetic trailer light kit LED rechargeable · makita battery holder wall mount 18v · car trunk light LED motion
sensor magnetic · drill holster belt cordless · undercarriage cleaner pressure washer karcher · chainsaw wall
mount holder · car bumper protector dog boot flap · tire lifting strap wheel carrier handle · wheel mounting
lever tool tire installation · `site:temu.com/se` dragkrok backkamera magnetisk · drill bit sharpener electric
portable · car seat gap filler organizer.

**Pris/betyg (Seznam via curl, 35 frågor):** samma kluster + "hitch camera", "easier hitching camera wifi",
"720p hitch camera rechargeable", "undercarriage cleaner 4000 psi", "under car washer water broom",
"magnetic towing lights wireless rechargeable", "trunk organizer collapsible", "battery holder for makita 18v",
"solar tpms", "seat gap filler", "chainsaw holder wall", "key lock box wall mount" m.fl. Utdrag med pris fanns
för 12 listningar; för de flesta id gav Seznam bara titel.

**Temus egna söksidor (WebFetch):** `search_result.html?search_key=magnetic wireless hitch camera` (14 rader
med USD-pris) · `magnetic-camera-wireless-5030041966275-s.html` (4 kameror 89,75–107,33 USD) ·
`search_result.html?search_key=hitch camera wifi 720p magnetic` → **"Temu" = strypt**.

**Publik:** Trafikanalys "Fordon 2024" + "Fordon i län och kommuner 2024" (PDF, textextraherade lokalt).

---

## Tratten

**Koncept-tratten**

| Steg | Kvar | Föll | Vilka |
|---|---|---|---|
| Objektuniversum (7 riktningar) | 45 idéer | — | |
| Prioriterat bort utan sökning (avgjort i v22/batch1 eller < 100-kronors-commodity) | 18 | 27 | se tabellen ovan, kolumn "ej sökt" |
| 0 OBJEKT/PRESENS | 18 | 0 | alla är ägda saker; tre har latent behov (TPMS, magnetlyktor, underredestvätt) och två förvaras inomhus (motorsåg, Makita) — märkta, inte fällda här |
| 2 HYLLAN (kedja + marketplace + fackhandel, billigaste priset först) | 3 | **15** | Biltema ×6 (magnetlyktor, TPMS, bagagelåda, gap filler, hundbälte, bakluckeljus), Jula ×3 (borrslip 269, bagagelåda 199, nackstöd 99,90), Clas (nyckelskåp 299), Fyndiq ×3 (motorsåg 244, Makita 260, bakluckeljus 186), CDON (hölster 119), Trixie/zooplus (bagageskydd 499), Nettotrailer (lyktskydd 173), fackhandel (underredestvätt 679–749 under ankarnivå) |
| 3 LISTNING FINNS | 2 | 1 | däcklyftrem: 0 listningar (5 sökningar totalt) |
| 4 MATERIAL | 2 | 0 | BLOCKED_SOURCE på alla — produktsidor hämtas inte i den här körningen |
| 5 EKONOMI på läst pris | 0 | 1 | kopplingskamera: de prissatta listningarna 89,75–221 USD → landad 937–2 032 kr; den billiga 720p-varianten är opris |
| **Överlevare med verifierat pris** | **0** | | |

**Listnings-tratten**

| Steg | Antal |
|---|---|
| Koncept som fick Temu-sökning | 16 |
| Listningar funna (goods-id) | 71 (1 redan känd: 605688298345002; 607351507675233 nämnd som referens, känd sedan v22) |
| Listningar med USD-pris ur snippet/söksida | 15 (kameror ×9, motorsåg $11, nyckelskåp $5, hundbälte $4, hölster $4, nackstöd $3, bagagelåda liten $4, borrslip bänk $45) |
| Ekonomi PASS på formel | 6 — men alla sex ligger under 199-kronorsutseendet och föll på hyllan (nyckelskåp, hundbälte, hölster, nackstöd, motorsågshållare, bagagelåda) |
| Ekonomi FAIL | 9 kameror (landad > 420) + borrslip 96 W |
| Bästa listning (material + ekonomi + hylla PASS) | **0** |

---

## Topp 6 i full mall

### 1. Magnetisk trådlös kopplingskamera för släp/husvagn (telefon-app) — ALTERNATIVE_LISTING_REQUIRED + PENDING_VERIFICATION

| Fält | |
|---|---|
| **PRODUCT** | Batteridriven kamera med kraftig magnet som ställs på släpets dragbalk; bild via wifi till telefonen så kulan syns glida in under kopplingen |
| **TEMU** | Primär (opris): https://www.temu.com/ma-en/…-g-601099523116633.html (720p, 5G wifi, "easier hitching"). Alt: 601099520200892 (app, 5G, night, waterproof), 601099527243893 (ligger på **/se**: "Trendig 5G … Hitch Trådlös Backup Camera … DVR"). Prissatta i samma familj: 605857362316888 ≈ 89,93 USD (BSD + inspelning), 601101471448244 ≈ 89,75 USD (1080p 150°) — titelmatch mot Temus -s.html, konfidens MEDIUM |
| **OBJECT / OWNER** | Släpvagnen på uppfarten. 1 341 430 släpvagnar i trafik + ~349 000 avställda (Trafikanalys, Tabell 1, årsskiftet 2024/2025); husvagnar 283 840 (v22) |
| **FRICTION (evergreen)** | Varje koppling ensam: kliva ur, gissa, backa om. Old way = spegel/tennisboll/"vinka" — improvisation |
| **WHY IT FITS** | PTZ-kamerans struktur: tech med synlig hårdvaruskillnad (magnet + batteri + ingen kabel) mot kedjans kablade kit; objektet omisskännligt i flödet; pris naturligt 799 kr; flerköpsskäl svagt (en per dragbil) |
| **MATERIAL** | BLOCKED_SOURCE. Krav vid granskning: riktig bil + släp + telefon i bild inom 3 s, ingen inbränd text. Kameraprodukter på Temu har ofta renderade studiobilder — hög risk |
| **0–3 s** | Hand smäller kameran på dragbalken → telefonen visar kulan glida in |
| **SWEDISH SHELF** | Biltema: bara kablade "Backkamera med 4,3\"/7\" monitor" (2000057384/-85, pris ej läst 403). **Amazon.se: MHCABSR magnetisk hitch-kamera 720P för telefon = SAMMA FORM, pris ej läsbart (HTTP 500 ×2).** Fyndiq "Backkamera för dragkrok 3MP" fanns i träfflistan men sidan 404 (avlistad?). Ankare: Prylstaden 895 (ord. 1 495) 5" monitor; Camping4u RVC-50 1 995; Dometic 2 895–5 995. PriceRunner "trådlös backkamera" 379–3 498 (ur utdrag). **Verdict: PENDING — golvet (Amazon) är oläst** |
| **TEMU PRICE** | UNKNOWN på rätt listning. Familjen: 89,75–107,33 USD (telefon), 99,75–220,74 USD (monitor) |
| **SE PRICE** | 799 kr |
| **ECONOMICS** | Prissatta listningar: landad 937–1 314 kr → FAIL (> 420). Kräver listning ≤ 28 USD för 2,4× vid 799 (landad ≤ 343), absolut tak 35 USD (landad ≤ 428) |
| **VARIANTS** | En SKU. Kräver app + wifi-parning (30 % av förlorarna har montering/inlärning — kameravinnaren neutraliserade det med pris + rädsla, här saknas rädslan) |
| **HOOK** | "Kopplar du släpet ensam?" (4 ord) |
| **DNA** | 64/100 |
| **CONFIDENCE** | MEDIUM struktur/publik · LOW pris · UNKNOWN material |
| **BIGGEST RISK** | Amazon.se MHCABSR ≤ 600 kr → inget ankarläge alls. Näst: appen ser ut som förklaring |
| **NEXT** | (1) Läs Amazon.se-priset på B0C993S4R5 (annan väg än WebFetch). (2) Seznam/Temu-pris på 601099523116633 och 601099520200892. (3) Först då material. Under 28 USD + Amazon ≥ 1 200 kr → `/ny-produkt` vid 799 kr |

### 2. Däcklyftrem / hjullyfthjälp för däckbytet — ALTERNATIVE_LISTING_REQUIRED (koncept utan listning)

| Fält | |
|---|---|
| **PRODUCT** | Rem/bygel med handtag som greppar hjulet så 20–25 kg lyfts med rak rygg och hängs på navet utan knä under däcket |
| **TEMU** | **Ingen listning.** Fem sökningar (tre i dag, två i v22) ger bara däckjärn, Jeep-reservhjulslyft, hydrauliska ramper |
| **OBJECT / OWNER** | 4 977 791 personbilar (Trafikanalys); ägaren 55+ som byter själv i okt–nov |
| **FRICTION** | Hjulet hålls med knäet medan bultarna ska träffa. Kroppslig, årlig, improviserad — axelbältets struktur på bilen |
| **SHELF** | Ingen känd i formen (v22: Biltemas hjuldolly hydraulisk 2000039919 är annan form; fackhandel hjullyft 1 500–3 000) |
| **Q4** | Q4 NOW (däckbyte okt–nov), sedan april — inte äkta evergreen, men ägaren har den i garaget året runt |
| **HOOK** | "Byter du hjulen själv i höst?" (6 ord) |
| **DNA** | 60/100 |
| **RISK** | Formen finns kanske inte som massprodukt — då är det en egen-produkt-idé, inte en Temu-fråga |
| **NEXT** | Sök "wheel lifting strap", "tire lift assist strap", "wheel hanger strap" när Temu svarar. Inget → parkera i backlog som egenproduktion |

### 3. Underredestvätt på hjul för högtryckstvätt — FAIL (ankarläge), lärorik

| Fält | |
|---|---|
| **PRODUCT** | Stålhuvud på hjul med 4×40°-munstycken + 3 förlängningsrör; rullas under bilen |
| **TEMU** | 601099532135433 (★4,8 / 96 %, 26 rec., opris); alt 601099521321459, 601099517314191, 601099595837503, 601103095826149, 601099662710594, 601099638369486 |
| **OBJECT / OWNER** | Högtryckstvätten + bilen som står ute. Publik UNKNOWN (andel hushåll med tvätt ej hämtad) |
| **FRICTION** | Salt under bilen nov–mars; man ligger inte på marken med lansen. Payoff (ingen rost) fördröjd och osynlig = kranskyddsfällans presens |
| **SHELF** | Biltema "Underspolningsrör" 2000032922 = böjd lans (annan form). **Autodude Dr Dirt 679 kr (ord. 849) och Bilvårdsbutiken Alpha 4X 749 kr = exakt hjulformen.** Fyndiq har lans-formen för Kärcher |
| **ECONOMICS** | Temu-pris UNKNOWN. 599 kr kräver landad ≤ 250 → ≤ 20–24 USD; 2 kg stål gör frakten osäker. Vid 25 USD krävs 626–734 kr — samma som fackhandeln → ankare ≈ 1,0× i stället för ≥ 1,6× |
| **VARIANTS** | Temu 1/4"-snabbkoppling vs Kärcher-bajonett → adapter måste ingå; tum i titlarna |
| **HOOK** | "Spolar du aldrig under bilen?" (5 ord) |
| **DNA** | 52/100 |
| **VERDICT** | FAIL — kedjan saknar formen men fackhandeln ligger under 2,4×-priset. Väcks bara av en listning ≤ 18 USD med bruksvideo, och även då är ankaret 1,36× |

### 4. Solcells-/batteridriven magnetisk backkamera med 5–7" monitor — FAIL (ekonomi, strukturell)

| Fält | |
|---|---|
| **TEMU** | 601101021099794 — **101 USD** · ★4,8 / 96 % (44); 601099817355866 — 121 USD · ★5,0 (28); 601099921384561 — 166 USD · ★4,5 (75); Temu-söksida 148,94 / 220,74 USD (7"), -s.html 99,75 USD (5") |
| **ECONOMICS** | Landad 1 054–2 032 kr → svenskt pris 2 500+ = över 1 000-kronorstaket. FAIL i hela formen |
| **SHELF** | Prylstaden 895 (ord. 1 495); Camping4u RVC-50 1 995; Dometic 2 895. Ankare finns — spelar ingen roll |
| **DNA** | 48/100 · **CONFIDENCE HIGH** på avslaget |

### 5. Trådlösa magnetiska LED-släplyktor, uppladdningsbara — FAIL (hylla)

| Fält | |
|---|---|
| **TEMU** | 602613789643197 (primär); alt 601103503518689, 606405826343499, 602934301542245, 601100782174999; 605688298345002 redan känt. USD UNKNOWN |
| **SHELF** | **Biltema "Trådlösa baklyktor med magnetfäste" 2000046997 = kedjan, samma form** (pris ej läst, 403). Jula ljusramp kablad 399. Ankare: Proled 1 249, Ljusakuten 1 595 — men vår lykta ser ut som Biltemas, inte som ankaret |
| **PRESENS** | Latent — behovet finns när lyktan slocknar |
| **DNA** | 44/100 · CONFIDENCE HIGH på hyllfallet |

### 6. Hund i bil: bagagerumsskydd med stötfångarflärp — FAIL (hylla)

| Fält | |
|---|---|
| **TEMU** | 601099623990583 (foldable trunk bumper protector, pet); alt 606583664779800, 601099606280873, 601099529709661; 607351507675233 känd sedan v22. USD UNKNOWN |
| **SHELF** | **Trixie skydd för bagageutrymmet med avtagbart stötfångarskydd 499 kr (zooplus) = samma form**; Biltema "Bagagerumsskydd och bag" 2000040024 + "Stötfångarskydd" 2000030810 (priser ej lästa) |
| **VARIANTS** | "Universal" utan cm — v22 slutrapport #20 hade samma anmärkning |
| **PUBLIK** | UNKNOWN i denna körning (uppdragets ~1 M hundar ej verifierat — sökbudgeten slut) |
| **DNA** | 45/100 · CONFIDENCE HIGH på hyllfallet |

---

## Tre lärorika avslag

1. **Borrslipen — bälteslipens logik fungerar inte när kedjan har formen under 300 kr.** Slöa borr är exakt
   "verktyg till verktyg han redan har", ankaret Drill Doctor 1 200–3 000 kr finns, och Temu har både en
   portabel (opris) och en Drill-Doctor-liknande 96 W-modell. Men Jula säljer formen för 269 kr, och den
   listning som *ser ut som ankaret* kostar 45 USD = landad 470–551 kr = över 420-taket. Båda ändarna faller
   samtidigt. Lärdom: bälteslipens undantag (pris > 500 + ingen kedja) är två villkor, inte ett — och
   "ser ut som ankaret" kostar på Temu lika mycket som ankaret gör i Sverige.

2. **Underredestvätten — hyllan kan vara tom hos kedjan och ändå fälla.** Biltema har bara en böjd lans, så
   gate 3 ser grön ut tills man googlar "underredestvätt": Autodude 679, Bilvårdsbutiken 749 i exakt
   hjulformen. Det är bildörrstegets mönster (Taktältarna 289) i en dyrare prisklass: ett fackhandelsankare
   är ett ankare bara om det ligger ≥ 1,6× över vårt pris — här ligger det *på* vårt pris. Dessutom två
   flaggor till: fördröjd osynlig payoff (rost om fem år) och Kärcher-bajonetten som kräver adapter.

3. **Kopplingskameran — rätt struktur, fel prisklass på det som syns.** Allt i fingeravtrycket stämmer
   (ägd sak ute, per-tur-friktion, synlig hårdvaruskillnad, 1,34 M släp, hook på 4 ord), men de nio
   listningar som gick att prissätta ligger 89,75–220,74 USD: Temus kamerahylla är byggd för amerikanska
   pickup- och hästtransportägare med 7"-monitorer. Den enda listningen i rätt klass (720p, telefon) är
   opris, och det svenska golvet (Amazon.se MHCABSR) gick inte att läsa. Lärdom: en tech-form ska
   prissättas på *rätt* listning innan den får poäng — och Amazon.se är hyllan för tech, inte Biltema.

---

## Vad som skulle ändra domen

- **Kopplingskameran:** ett Temu-pris ≤ 28 USD på 601099523116633/601099520200892 **och** Amazon.se-MHCABSR
  ≥ 1 200 kr. Två tal, båda oläsbara i dag (Seznam tomt, Temu strypt, Amazon 500). Sedan materialet.
- **Däcklyftremmen:** en enda Temu-listning i formen. Finns ingen är det egenproduktion.
- **Ingenting annat i de sju riktningarna** — resten är verifierade hyllfall med pris och URL i
  `evergreen.json`. Nästa evergreen-jakt bör inte gå på bil/släp/garage igen utan på **tech med synlig
  hårdvaruskillnad till ägt fordon/tomt** (kamerans arketyp) och på **objekt kedjan inte känner**
  (v22:s slutsats: husbilen, jakten, djuren) — inte på det Biltema har byggt sin affär på.
