# Dolda pärlor och ovanliga bets — jakt v23 (2026-09-05)

Uppdrag: produkter som ingen svensk annonsör kör, som svensk handel inte hyllat, och som ändå
träffar Bäverbutikens kund i en Q4-friktion. Spekulativt tillåtet — men varje förslag bär en
namngiven anledning och en namngiven största risk. Metod: `docs/temu-vinnar-dna.md` avsnitt 12,
datavägar enligt `v22/DATAVAGAR.md`. Temu.com rördes aldrig direkt — bara Seznam-utdrag och två
WebFetch mot Temus egna söksidor (sekventiellt, aldrig parallellt).

**Resultat i en mening:** de sju riktningarna i uppdraget är till största delen Biltemas, Julas
och Clas Ohlsons hemmaplan (mörker, kyla, bilvinter, stängsel) eller kranskyddsfällan (frost,
isfri damm) — men **tre koncept överlever strukturellt**: solcellslampan på flaggstångstoppen
(listning + pris + ankare på plats), bilspöhållaren (koncept starkt, listning för billig) och
utombordarens bärsele (koncept starkt, ingen listning finns). Ingen är TEST NOW.

---

## 1. Sökfraser

**Temu-listningsjakt — WebSearch `site:temu.com` (26 fraser):**
outboard motor carrier strap lifting harness carry handle · outboard motor carrying handle
portable boat motor lift strap sling · tractor seat cover waterproof universal heavy duty ·
trampoline weather cover round rain protection winter · trampoline cover waterproof 12ft 14ft
protective cover rain dust leaves · trampoline rain cover round frame protective winter storage
cover 366 cm · tire lifting strap wheel carrier handle heavy tyre lift helper · magnetic fishing
rod holder car roof suction rod carrier vehicle · flagpole solar light top mount flag pole led
downlight · dog house door flap weatherproof kennel door curtain · pet kennel door PVC curtain
strips outdoor dog house wind proof door cover · 12V heated dog bed pad car truck · pond de-icer
floating heater winter fish pond · electric fence tester voltage livestock · rechargeable hand
warmer power bank 10000mah · heated vest men usb 5v battery · heated insoles rechargeable remote
control · 12V heated seat cushion car truck tractor · folding firewood cart log carrier wheels
canvas · solar flagpole christmas tree lights string outdoor · chicken coop light solar powered
timer automatic poultry lamp.

**Temu-pris — Seznam `site:temu.com` (16 fraser):** solar flag pole light 176 led downlight ·
176 led solar flag pole light 880 lumen 6800mah · solar flag pole light 176 led brightest 15 to
25 ft · fishing rod holder car magnetic suction vehicle · suction cup fishing rod holder car
window 4 rod · 4 rod suction cup fishing rod holder bracket no drill car truck · magnetic fishing
rod mount carrier suv hood truck · car fishing rod holder suv roof rack inside 5 rod straps ·
trampoline cover waterproof protective rain · trampoline weather cover 6ft heavy duty ·
trampoline rain cover waterproof tarp 12ft 14ft · dog house door cover waterproof windproof pet
door curtain (×3 varianter) · chicken coop light solar timer · utility trailer cover tarp
waterproof flatbed trailer.

**Temus egna söksidor — WebFetch (2, sekventiellt):**
`trampoline-covers-5020130946938-s.html` · `flag-poles-lights-5030012710240-s.html` (34 listningar
med pris).

**Svenska hyllan — WebSearch på ägarens svenska ord (17) + WebFetch produktsidor (7):**
flaggstångsbelysning solcell jula clas biltema flaggstångsexperten · solcellslampa flaggstång
topp amazon.se · Brubaker flaggstång solcellslampa 26 LED amazon.se · ljusgran flaggstång solcell
· spöhållare bil magnet biltak · spöhållare bil sugkopp amazon.se fyndiq · Amazon.se
fiskespöhållare bil magnet · studsmatta överdrag regnskydd jula rusta biltema · väderskydd
studsmatta berg exit 366 427 · Rusta väderskydd till studsmatta · hundkoja dörr plastdörr flärp
kerbl · dörrgardin hundkoja PVC kerbl zooplus · Ferplast dörrgardin utomhushundkojor ·
stängselprovare granngården biltema jula · handvärmare uppladdningsbar clas jula biltema kjell ·
värmeväst jula biltema amazon värmesulor · isfri damm isfrihållare oase icefree · flakkapell
släpvagn biltema jula · vedvagn hopfällbar vedsäck på hjul · sätesvärmare 12V biltema · hönshus
belysning solcell timer granngården.
WebFetch: clasohlson.com Northlight flaggstångsbelysning (699 kr, 230 V, ej i lager) ·
flaggmax.se LED Max (849 kr, solcell, toppmonterad, slutsåld) · flaggstangsexperten.se solcell
(404) · sportfiskeprylar.se Stoxdal (499 kr, slutsåld) · guidelineflyfish.com spöhållare
(Vac-Rac 1 699–2 999 kr) · biltema.se stängselprovare (403) · jula.se släpkapell (403) ·
pricerunner.se belysning flaggstång (tomt svar).

**Publik (5):** antal flaggstänger i Sverige · antal studsmattor i Sverige · Trafikanalys
släpvagnar i trafik 2024 (PDF oläsbar) · Båtlivsundersökningen 2025 utombordare · (personbilar
4 977 791 ur Trafikanalys-titel).

**Meta Ad Library SE, ACTIVE (7 termer):** flaggstångsbelysning (0) · flaggstång (5 — stänger
och flaggor, 0 belysning) · spöhållare bil (0) · spöhållare (11 — Bäverbutikens egen
båtspöhållare, Olssons Fiske, JBmarin, Fiskejournalen; 0 på bilformen) · studsmatta skydd (0) ·
studsmatta (34 — hela studsmattor; 0 överdrag) · hundkoja (1, irrelevant).

**Dubblettkontroll:** 30 nya goods-id mot `kanda-goods-id.txt`, `dataset.json`, `koncept.json`,
`v22/fas2/*.json` — **0 dubbletter** bland de id som bär ett koncept. Ett id
(601100057690236, hönshuslampan) står redan i `djur.json` men var där feltolkat som
rovdjursskrämma — ombedömt, märkt.

---

## 2. Tratten

| Steg | Kvar | Föll | Vad som fällde |
|---|---|---|---|
| Råkoncept övervägda ur de sju riktningarna + egna tillägg | ~65 | — | |
| Redan prövat (KATALOG, slutrapport §3–4, koncept.json, v22-kluster) | 43 | 22 | flaggstångslina/-knapar, däckförvaring/-ställ/-märkning, brevlådelås/-dekal, trampolinförankring, robotgarage, batteriladdare, motorvärmarsladdhållare, reflexsele hund, vedbärare/vedkärra, kaminfläkt, regntunnenät, slanghållare, saltspridare, vindrutetäcke, snöskoterkapell, gasoltubsskydd, hönsvattenautomat, husnummerlampa, torkrock, hinkfälla, USB-värmedyna, eldosa |
| 1 OBJEKT / negativ rymd utan sökning | 26 | 17 | rörelsestyrd solcellslampa, magnetlampa motorhuv, kepslampa (finns), LED-hundkoppel, reflexstolpar (feb), stöveltork, kupévärmare, isskrapa (dec), snöskyffel (dec), fälgborste, slangvinda, stuprörsutkastare, traktorsätesöverdrag (nära katalogvariant), ATV-muffar (nära katalogvariant), reflexdekal sopkärl (nära katalogvariant), fågelmatare, paketbox (> 1 000 kr) |
| Sökta kandidater med fullständiga fält | **15** | 11 | (se nedan) |
| 2 PRESENS | 14 | 1 | isfri damm (skadan i jan–feb) |
| 3 SVENSKA HYLLAN | 6 | 8 | släpkapell (Biltema+Jula), elstängselprovare (Biltema+Granngården), handvärmare (Clas+Biltema+Jula), värmeväst (Jula), värmesulor (Jula), sätesvärmare (Jula 199), ljusgran (Clas/Bygghemma 625–2 995), hundkojedörr (Ferplast/Kerbl — FAIL-indikation) |
| 4 LISTNING FINNS | 4 | 2 | utombordarsele (0 listningar, 3 fraser), hjullyftrem (0 listningar, 4:e försöket) → `ALTERNATIVE_LISTING_REQUIRED`, inte FAIL |
| 5 MATERIAL | — | — | `BLOCKED_SOURCE` på samtliga (temu.com ej rört) |
| 6 EKONOMI (pris läst) | 4 | 0 | flaggstångslampa PASS (2,77–3,25×) · spöhållare PASS på $5 men listningen för billig · studsmatta PASS på söksidepris utan goods_id · hönslampa PASS |
| 7–9 VARIANT / HOOK / PUBLIK | 2 | 2 | studsmatta (publik: barnfamilj + fot-mått) · hönslampa (publik 35–70 k hushåll < golv) → WATCH |
| **Överlevare** | **2 + 1 utan listning** | | flaggstångslampa (TEST IF VERIFIED) · bilspöhållare (ALTERNATIVE_LISTING_REQUIRED + golv) · utombordarsele (ALTERNATIVE_LISTING_REQUIRED) |

Listningstratten: 30 goods-id funna · 0 dubbletter · pris läst på 5 (Seznam) + 34 titlar med pris
utan id (Temu-söksida) · material 0 (BLOCKED_SOURCE) · ekonomi PASS 4.

---

## 3. Topp 6 — full mall

### 1. Solcellsdriven flaggstångsbelysning, toppmonterad — `605583893712528` — **TEST IF VERIFIED**

| Fält | |
|---|---|
| **PRODUCT** | Solcellslampa som skruvas på flaggstångens topp och lyser nedåt över vimpel/flagga och stång, skymning→gryning, IP65, 26 LED (136-LED-variant finns). |
| **TEMU** | https://www.temu.com/se/g-605583893712528.html — **$13 · ★4,9 (98 %) · 99+ rec** (seznam-snippet). Temus söksida: samma 26-LED-titel $13,26; 136-LED $18,69–25,64; 36-LED $8,69–17,30 (temu-sok-sida, MEDIUM). Alt: 601099527860543 / 601099526401943 (176 LED, pris oläst). |
| **OBJECT / OWNER** | Flaggstången — tomtens högsta och dyraste dekorobjekt. Villa-/fritidshusägare 45–70. "Flera hundra tusen flaggstänger" (flaggstang.se) — UPPSKATTNING 400–700 k. |
| **EXISTING FRICTION** | Från oktober är det mörkt kl 16–17; flaggan ska ned vid solnedgång om den inte är belyst, vimpeln syns inte. Stången står svart till mars. Want, inte skada — presens 1 av 2 (som klistermärkena). |
| **OLD WAY** | Ingen belysning, eller 230 V-spot med nedgrävd kabel och elektriker. |
| **WHY IT MATCHES** | Ägt objekt ute året runt ✓ · universellt (alla stänger ser lika ut) ✓ · ingen kedja i formen ✓ · fackhandelsankare i exakt form (Flaggmax LED Max 849 kr) = 1,89× vid 449 ✓ · en SKU ✓ · ägarfråga 5 ord ✓ · publik 45–70 småhus ✓. |
| **TEMU MATERIAL** | `BLOCKED_SOURCE`. Titlarna antyder amerikanska hero-bilder (stjärnbanér, 15–25 ft aluminiumstång) — måste sannolikt ersättas med svensk vimpel. |
| **0–3 S** | Svart stång i skymning → tänd topp som lyser ned över vimpeln. Ingen text behövs. |
| **SWEDISH SHELF** | **PENDING_VERIFICATION med PASS-indikation.** Kedjor: Clas Ohlson har bara 230 V-ljusslingan (Northlight 699, ej i lager); Biltema/Jula/Rusta: ingen toppmonterad solcellslampa sedd. Fackhandel: **Flaggmax LED Max solcell 849 kr (ord. 999), slutsåld** = ankaret; Flaggstångs-Experten "flaggbelysning utan sladdar" finns (404 på sidan). **Marketplace-golv FINNS men är oläst:** Amazon.se Brubaker 26 LED ("passar skruvtopp 4,5–8 m", pris dolt), Lixada 42 LED, generisk 2 000 mAh. |
| **TEMU PRICE** | $13,26 |
| **SWEDISH PRICE** | **449 kr** (26 LED). 136-LED vid 599 ger 2,62–3,07× men ankaret blir bara 1,42× — därför 26-LED/449. |
| **ECONOMICS** | Landad **138–162 kr** → **2,77–3,25×** · **BE-CPA 287–311** · PASS i båda ändarna (us-proxy). |
| **VARIANT FRICTION** | En SKU — men **passformen mot svensk stångtopp är oprövad** (knopp på gängad tapp, toppdiameter). Provexemplar krävs. |
| **HOOK** | "Står flaggstången mörk i höst?" (5 ord) |
| **DNA** | **66 / 100** |
| **Q4** | Q4 NOW (mörkret) + BLACK WEEK/GIFT (advent förstärker). |
| **AD LIBRARY SE** | "flaggstångsbelysning" 0 · "flaggstång" 5 (stänger/flaggor) → **0 på formen**. WHITE SPACE med bevisad efterfrågan (Flaggmax slutsåld, Clas slutsåld, PriceRunner 50 modeller i kategorin). |
| **CONFIDENCE** | LOW–MEDIUM |
| **BIGGEST RISK** | Passformen: passar den inte svenska stängers topp är returgraden dödlig. Näst: svensk decembersol (5–6 h) → lampan slocknar 22 i stället för gryning; och Amazon.se-golvet (Brubaker) kan ligga under 400 kr. |
| **NÄSTA ÅTGÄRD** | (1) Läs Brubaker/Lixada-priset på Amazon.se (lägg i kundvagn). (2) Beställ prov, sätt på en 8 m glasfiberstång, mät lystid i november. (3) Hämta materialet när Temu svarar. Sedan `/ny-produkt` vid 449 kr med Flaggmax 849 i bild. |

### 2. Bilspöhållare (sugkopp, 4 spön) — `601105758637623` — **ALTERNATIVE_LISTING_REQUIRED + VERIFY GOLV**

| Fält | |
|---|---|
| **PRODUCT** | Spöhållare med sugkoppar för bilruta/tak, 4 riggade spön utanpå bilen mellan fiskeplatserna. |
| **TEMU** | https://www.temu.com/se/g-601105758637623.html — **$5 · ★4,4 (88 %) · 53 rec** (seznam-snippet). Alt (pris oläst): 601100966945729 (heavy duty 4-rod), 601099664597992 (magnet motorhuv), 601102617340021 (invändig takrem, 5 spön), 601099516061976, 601100543830067. |
| **OBJECT / OWNER** | Bilen + spöna. Bilburen gäddfiskare 35–65. ~1,6 M sportfiskare (JAKT-INSTRUKTION / Naturvårdsverket-SCB); bilburen andel ej mätt. |
| **EXISTING FRICTION** | Sep–nov är gäddans högsäsong och den är bilburen: riggade spön i baksätet trasslar, topparna knäcks i dörren. Presens 2 av 2. |
| **OLD WAY** | Baksätet nedfällt, spöfodral (riggen isär), spöt ut genom fönstret. |
| **WHY IT MATCHES** | **Kontots egen bevisning:** båtspöhållaren sålde 1,49 enheter/order och kontots aktiva annons heter "Aldrig mer trassliga fiskespön". Samma köpare, samma payoff, annat objekt. Fackhandelsankare i exakt sugkoppsform: **Guideline Vac-Rac 1 699–2 999 kr**. |
| **TEMU MATERIAL** | `BLOCKED_SOURCE`. |
| **0–3 S** | Spön trycks fast på rutan, bilen rullar. |
| **SWEDISH SHELF** | **PENDING_VERIFICATION.** Kedjor: ingen bilform (Biltema har båtspöhållare). Ankare: Guideline Vac-Rac Standard 1 699 / Locking 1 799 / Professional 2 999 (guidelineflyfish.com); Stoxdal magnetisk 499 (slutsåld); Amazon.se magnetisk 449. **Golv oläst:** Fyndiq (två sugkoppslistningar), Amazon.se (B0CRRN8JR9, B0CKJ3MHB4), MyTrendyPhone — sannolikt 150–300 kr. **Golvet avgör.** |
| **TEMU PRICE** | $5 (för billigt för sitt eget pris — se risk) |
| **SWEDISH PRICE** | 349 kr på $5-listningen; **399 kr på en $10–15-listning** (rekommenderat). |
| **ECONOMICS** | $5: landad 52–61 → 5,7–6,7× · BE-CPA 288–297 · PASS. $12-listning: landad 125–147 → 2,7–3,2× vid 399. |
| **VARIANT FRICTION** | En SKU. Välj sugkopp, inte magnet (aluminiumhuvar). |
| **HOOK** | "Ligger spöna löst i bilen?" (5 ord) |
| **DNA** | **70 / 100** (koncept) |
| **Q4** | Q4 NOW (gädda) + GIFT (jul till fiskaren). |
| **AD LIBRARY SE** | "spöhållare bil" 0 · "spöhållare" 11 (vår egen båthållare, Olssons Fiske generisk, Fiskejournalen katalog) → **0 på bilformen.** |
| **CONFIDENCE** | MEDIUM koncept · LOW listning · LOW golv |
| **BIGGEST RISK** | Marketplace-golvet (Fyndiq/Amazon sugkopp ~150–300 kr) — samma fälla som tog 4 av 7 i förra passet. Näst: sugkoppar i minusgrader släpper, och 4,4/88 % på en 5-dollarshållare med 12 000 kr spön på taket är fel signal. |
| **NÄSTA ÅTGÄRD** | (1) Läs Fyndiq/Amazon-priserna. (2) Hitta $10–15-listning ≥ ★4,7 med riktig bil i video. (3) Kyltest av sugkopparna. Sedan `/ny-produkt` 399 kr, Vac-Rac 1 699 i bild. |

### 3. Bärsele/bärhandtag för utombordare — **ingen listning** — **ALTERNATIVE_LISTING_REQUIRED**

| Fält | |
|---|---|
| **PRODUCT** | Rem med handtag/axelsele runt en 2,5–20 hk utombordare (15–50 kg) för bärning brygga→bil→garage vid upptagningen. |
| **TEMU** | **Ingen listning på tre sökfraser.** Temu har bara motorkärra (601099606115605 — Kayoba-formen, ELIM i V2) och generiska flyttremmar. |
| **OBJECT / OWNER** | Kontots kärnobjekt: utombordaren. ~300 000 båtar med utombordare (`temu-vinnar-dna.md`); Båtlivsundersökningen 2025: ~1,5 M fritidsbåtar. |
| **EXISTING FRICTION** | Upptagningen är NU. Motorn bärs i famnen: rygg, propeller mot benet, olja ur om den lutas. Presens 2 av 2. |
| **OLD WAY** | Två man, en filt — eller låta motorn sitta kvar ute (det motorhöljet säljer på). |
| **WHY IT MATCHES** | Motorhöljets syskonprodukt i samma vecka: samma publik, kanal och säsong bevisade (~104 900 kr spend, ~523 köp). Kroppslig friktion (kontots bäst bevisade vinkel). Parametern (hk/vikt) kan ägaren utantill. |
| **SWEDISH SHELF** | PENDING — kedjorna säljer motorbock/motorkärra, ingen bärsele sedd i bat-klustret. |
| **ECONOMICS** | UNKNOWN (bör ligga $8–15 → landad 84–184 → klarar 399). |
| **HOOK** | "Bär du utombordaren i famnen?" (5 ord) |
| **DNA** | **68 / 100** (koncept) |
| **CONFIDENCE** | LOW |
| **BIGGEST RISK** | Att formen inte finns som konsumentprodukt av ett skäl: remmen löser inte att motorn måste bäras upprätt, och två man är "old way som funkar". |
| **NÄSTA ÅTGÄRD** | Sök när Temu svarar: "outboard motor carrying strap", "engine lifting sling small outboard", "boat motor tote strap". Noll på två försök till → backlog april 2027 (sjösättning). |

### 4. Väderskydd till studsmatta — `606235185274302` — **WATCH**

| Fält | |
|---|---|
| **PRODUCT** | Vattentätt överdrag med dräneringshål över hoppmatta + kantskydd, rund 305–427 cm. |
| **TEMU** | https://www.temu.com/se/g-606235185274302.html (id via Seznam, pris oläst). Temus söksida: "Trampoline Rain Cover, 8–15 ft, waterproof tarp" **$7,76** (MEDIUM, utan id). Alt 601101986595225: 6 ft, $20. |
| **OBJECT / OWNER** | Studsmattan — pappan 35–50 i barnfamiljens villa. Antal: **UNKNOWN** (ingen officiell siffra; Läkartidningen "lavinartad ökning"). |
| **FRICTION** | Löv och vatten på mattan i oktober; kantskyddet möglar. Presens 1,5 av 2 (skadan långsam). |
| **OLD WAY** | Presenning + spännband (blåser av), eller nedmontering. |
| **SHELF** | PENDING: Rusta säljer nät/stege/förankring — inget väderskydd sett; Biltema/Jula ej verifierade i butik. Fackhandel: **Salta 366 cm 729 kr / 427 cm 849 kr, EXIT Premium 1 299 kr**, Berg Basic, METIS. Marketplace oläst. |
| **ECONOMICS** | $7,76: landad 81–95 → 4,2–4,9× vid 399 · BE-CPA 304–318. Men 7,76 USD för 4 m är en tunn tarp; $20-klassen kräver 599 (2,44–2,87×). |
| **HOOK** | "Ligger löven på studsmattan?" (4 ord) |
| **DNA** | **55 / 100** |
| **AD LIBRARY SE** | "studsmatta skydd" 0 · "studsmatta" 34 (hela studsmattor) → 0 på formen. |
| **CONFIDENCE** | LOW |
| **BIGGEST RISK** | Publiken är barnfamiljen (55 % av förlorarna hade annan målgrupp) och presenningen är "köpt old way som funkar ∧ jämförelsehandlad". Näst: fot-mått, och Rusta/Biltema kan ha ett väderskydd i butik. |
| **NÄSTA ÅTGÄRD** | Kolla Rusta/Biltema/Jula i butik + Amazon.se-golvet; hämta listningen och läs tygvikten. Test bara om kedjan är tom och tyget ≥ 200 g/m². |

### 5. Hjullyftrem för vinterhjul — **ingen listning** — **ALTERNATIVE_LISTING_REQUIRED**

| Fält | |
|---|---|
| **PRODUCT** | Rem med handtag runt ett komplett hjul (20–25 kg) för bärning och lyft mot navet. |
| **TEMU** | Ingen listning (fjärde sökvägen sedan garage-fordon-klustret). Bara hjuldolly 500 lbs (601099646596011) och bogserremmar. |
| **OBJECT / OWNER** | Mannen 45–70 som byter hjul på uppfarten. 4 977 791 personbilar i trafik 2024 (Trafikanalys); självbytare ej mätt. |
| **FRICTION** | Däckbytet okt–nov: fyra hjul à 20–25 kg i famnen, två gånger om året. Presens 2 av 2. |
| **WHY** | Garage-fordon-klustrets enda strukturella överlevare: kroppslig payoff, improviserad old way, ingen känd hylla. |
| **HOOK** | "Lyfter du vinterhjulen med ryggen?" (5 ord) |
| **DNA** | **58 / 100** |
| **CONFIDENCE** | LOW |
| **BIGGEST RISK** | Formen finns inte för att den inte behövs (fälgen har grepp; Thansen-styrpinnen 89,95 kr löser navet) — och däcken förvaras inomhus. |
| **NÄSTA ÅTGÄRD** | En sista sökrunda ("tire carrying strap", "wheel lifting belt handle", "tyre tote handle"). Noll igen → FAIL strukturellt. |

### 6. Dörrgardin/vindflärp till hundkoja — `601099770975699` — **WATCH**

| Fält | |
|---|---|
| **PRODUCT** | PVC-lamellgardin eller vadderad flärp över kojans öppning mot regn och vind. |
| **TEMU** | https://www.temu.com/se/g-601099770975699.html (vadderad, "windproof warm"); alt 601099771115294 (PVC transparent), 601099544381502, 601101983710868. **Pris oläst** (tre Seznam-fraser utan utdrag). |
| **OBJECT / OWNER** | Gårds-/jakthundsägaren med utekoja. Hundar ~1 M (hundregistret, ej hämtat); andel i utekoja UNKNOWN. |
| **FRICTION** | Regn och vind rakt in i kojan i oktober. Presens 2 av 2. |
| **SHELF** | **FAIL-indikation:** Ferplast dörrgardin för utomhuskojor på Amazon.se (pris oläst); Kerbl 4-Season/Hendry levereras med köldridå. |
| **ECONOMICS** | UNKNOWN — PVC-remsor ($4–8, landad 42–98) bär inte 300 kr mot Ferplast; den vadderade flärpen kan bära 349 om den ligger $10–14. |
| **HOOK** | "Blåser det rakt in i hundkojan?" (6 ord) |
| **DNA** | **48 / 100** |
| **CONFIDENCE** | LOW |
| **BIGGEST RISK** | Priset: ett stycke PVC för 349 kr mot Ferplast och kojor som redan har gardin. Näst: öppningen måste mätas. |
| **NÄSTA ÅTGÄRD** | Läs Ferplast-pris och Temu-pris på flärpen; under $10 och Ferplast > 400 kr → test som andra produkt till hundgårdshuvens publik. Annars FAIL. |

**Övriga nio (rank 7–15, alla med fullständiga fält i JSON):** hönshuslampa solcell/timer (WATCH — ekonomi PASS $13, publik 35–70 k under golvet; id:t var feltolkat i djur.json) · ljusgran flaggstång solcell (FAIL hyllan 625–2 995 kr, ingen listning i rätt form) · släpkapell (FAIL Biltema+Jula) · isfri damm (FAIL presens + Oase i hela fackhandeln) · elstängselprovare (FAIL Biltema+Granngården) · handvärmare (FAIL Clas+Biltema+Jula) · värmeväst (FAIL Jula + personlig passform) · värmesulor (FAIL Jula + skostorlek) · sätesvärmare 12 V (FAIL Jula 199 kr + Biltema).

---

## 4. Tre lärorika avslag

**1. Isfri damm — uppdragets egen fråga, och svaret är kranskyddet igen.** Uppdraget bad
uttryckligen "kolla Sverige" på isfri-produkter. Objektet är rätt (kärl ute, villaägare), hyllan
är rimlig (Oase 799–1 599 kr i fackhandel, inget i kedja), men fiskarna dör i februari och hålet
i isen syns i januari. Det går inte att fotografera i en svensk trädgård i oktober. Fingeravtrycket
har frost som uttrycklig eliminering i steg 1, och Kranskydd Frost (ROAS 1,59 mot 1,49) är facit.
*Lärdom: "vinterförberedelse" är bara en Q4-etikett om skadan syns före snön. Den enda
frostprodukten som klarar det är den vars skada är höstregn, inte is.*

**2. Hela riktningen "kyla utan el" faller på tre saker samtidigt.** Handvärmare, värmeväst,
värmesulor, sätesvärmare — alla har rätt friktion (jägaren i tornet i oktober), och alla föll
utan att en enda Temu-listning behövde prissättas: (a) Clas Ohlson, Biltema, Jula och Kjell har
formen i egna kategorier, (b) kläder och sulor är personlig passform (0 av 9 vinnare), och (c) inget
ägt objekt står i bild — annonsen måste förklara en produkt i stället för att peka på en sak
ägaren redan har. *Lärdom: "kyla" är kroppens friktion, inte objektets. Kontots vinnare skyddar
saker, inte människor — undantaget (axelbältet) är ett verktygstillbehör som råkar avlasta en
kropp.* Riktningen ska inte sökas igen utan ett ägt objekt i mitten.

**3. Hönshuslampan — rätt produkt, redan fälld på fel grund, och ändå under golvet.** Id
601100057690236 stod i `djur.json` som "solar predator deterrent" och ELIM:ades mot
rävskrämme-hyllan (132–599 kr). Titeln är en hönshuslampa med timer ($13, ★4,8, 99+), och
friktionen är den bästa i hela djur-klustret: värpningen upphör i oktober, det syns i äggkorgen
varje morgon, och ingen svensk kedja säljer formen. Ekonomin håller (2,51–2,93× vid 399).
Den faller ändå — på publiken (351 167 hobbyhöns → 35–70 k hushåll), precis som hönsgårdshuven.
*Två lärdomar: (a) ett auto-klassat koncept kan bära fel etikett — läs titeln, inte
konceptnamnet, innan ett id förkastas; (b) hönspubliken är en nisch som bara bär som andra
produkt mot en redan hittad köpare. Korrigera `djur.json`.*

---

## 5. Vad riktningarna lärde (för nästa "dolda pärlor"-jakt)

- **Mörkret:** allt som lyser är Biltema/Jula/Clas/Rusta — utom det som sitter på ett ovanligt
  ägt objekt (flaggstångstoppen). Sök "solcell + [udda objekt]", aldrig "solcell + lampa".
- **Bilen i vinter:** klustret är tomt två gånger i rad. Det enda som lever (hjullyftrem) finns
  inte att köpa. Lägg ned riktningen tills en listning dyker upp.
- **Gården:** stängsel, foder, salt, vatten är Granngårdens och Biltemas hemmaplan; hönsen är
  under golvet. Det som kan bära är tillbehör till **fordonen** på gården (traktor/ATV) — men
  Temus "tractor seat cover" är åkgräsklipparstorlek och en nära variant av katalogens vinnare.
- **Udda objekt med hög ägargrad** gav jaktens bästa fynd (flaggstången). Fortsätt där: objekt
  som *alla* har men ingen kedja kategoriserar — brygga, jordkällare, vedbod, sjöbod, postlåda på
  landsväg, grusuppfart.
- **Marketplace-golvet är oläst på båda överlevarna** (Amazon.se Brubaker; Fyndiq/Amazon
  sugkopp). Det är exakt den gate som fällde förra passets högpoängare — läs det före allt annat.

Saknat värde = UNKNOWN/PENDING, aldrig gissat. Varje siffra står med källa i
`dolda-parlor.json`.
