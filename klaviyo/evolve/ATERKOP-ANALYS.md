# Återköpsanalys: Damons metod på Bäverbutikens Shopify-data

**Mätt:** 2026-09-24 ~21:15 UTC. **Källa:** Shopify Admin GraphQL (API 2025-07) via
`mejl/shopify.mjs` (Bäverbutikens app `SHOPIFY_*_SE_BAVER_SE`), läs-bart. Inga
kundnamn eller e-postadresser i den här filen. Skripten ligger i sessionens
scratch-mapp, inte i repot.

**Metoden (Evolve, "Damon"):** ta kunderna med högst livstidsvärde och de som köpt
mer än en gång, mät tiden mellan köp 1 och köp 2 och se vad köp 2 innehöll jämfört
med köp 1. Det svaret ska styra efter-köp-flödet i Klaviyo: vad vi korsförsäljer
efter vilket köp, och när.

---

## 0. Vad datan räcker till (läs det här först)

| Mätt | Värde | Källa |
|---|---|---|
| Kunder totalt | 8 371 | `customers`, alla sidor |
| Kunder med `numberOfOrders` = 0 / 1 / 2 / 3 / 4 / 6 | 1 463 / 6 678 / 209 / 18 / 1 / 2 | samma |
| Kunder med 2+ ordrar (`orders_count:>1`) | **230** (2,7 % av alla, 3,3 % av dem med minst en order) | `customers(query:"orders_count:>1")` |
| Synliga ordrar | 3 737, äldst **2026-07-27 02:47 UTC**, nyast 2026-09-24 21:15 UTC | `orders`, alla sidor |
| Ordrar före 2026-07-20 | **0** (`ordersCount` = 0) | `ordersCount(query:"created_at:<2026-07-20")` |

**Fönstret är 60 dagar, precis som väntat.** Appen saknar `read_all_orders`, så
`orders` och `customer.orders` visar bara ordrar från de senaste 60 dagarna. Två
fält läcker ändå igenom äldre data, och analysen använder båda:

- **`customer.lastOrder`** returnerar kundens senaste order med innehåll och belopp,
  även när den är från mars (mätt: order #3123 från 2026-04-05 kom tillbaka med alla
  rader). För en kund med exakt två ordrar är det alltså köp 2.
- **`customer.amountSpent` − köp 2** ger värdet på köp 1 för tvåorderskunder.
- **`customer.createdAt`** används som datum för köp 1 när köp 1 är osynlig. Kontrollerat
  på de 79 kunder där båda ordrarna syns: skillnaden mellan kundens `createdAt` och köp 1
  är median 0 h, 74 av 79 inom en timme, men i ett fall 4 390 h (kund skapad långt före
  första köpet). Proxyn är bra, inte perfekt.

**Hur de 230 återköparna fördelar sig:**

| Grupp | Kunder | Vad vi vet |
|---|---|---|
| Alla ordrar synliga (köp 1 och köp 2 i fönstret) | **79** | Allt: innehåll, datum, belopp för båda |
| Delvis synliga (köp 1 före fönstret, senare köp i det) | 65 | Köp 2+ fullt; köp 1 bara belopp och ungefärligt datum |
| Inga synliga ordrar (alla före 2026-07-27) | 86 | Bara `lastOrder` + `amountSpent` + `createdAt` |

Två urval används nedan:
- **Strikt** = de 79 med båda ordrarna synliga. Innehållet i köp 1 och köp 2 är känt.
  **Skevt mot korta gap**: ett gap längre än ~58 dagar kan inte finnas här.
- **Utökat** = alla 209 med exakt två ordrar. Köp 2 är `lastOrder`, köp 1 är belopp +
  `createdAt`. Innehållet i köp 1 är okänt när köp 1 ligger före fönstret.

### Det viktigaste förbehållet: ordrar inom en timme är inte återköp

64 av de 209 tvåorderskunderna la köp 2 **inom en timme** efter köp 1.

- **50 av dem är från mars–april** (utanför fönstret). Deras köp 2 är nästan bara
  Bäverlampa Pro (38), Bävertratt (17) och Bäverkoppling (10), och köp 2 har medianvärdet
  **99 kr**. Det ser ut som en efter-köp-uppsäljning som skapade en separat order, men
  källan går inte att läsa (ordern är för gammal för `nodes`). Det är en gissning, inte en
  mätning.
- **14 är i fönstret** (strikt urval), alla `sourceName: web` på båda ordrarna. Det är
  kunder som la en order till i samma besök: 5 köpte samma produkt igen, 9 en annan.

De här ordrarna räknas separat och **ingår inte** i tid-mellan-köp nedan. Utan det
urvalet blir medianen för det utökade urvalet 18 dagar i stället för 35, och bilden
skulle bli fel.

---

## 1. Tiden mellan köp 1 och köp 2

| Urval | n | p25 | median | p75 | p90 | ≤ 18 h | ≤ 3 d | ≤ 30 d |
|---|---|---|---|---|---|---|---|---|
| Strikt, alla | 79 | 2,5 d | 13,8 d | 24,2 d | 34,4 d | 16 | 20 | 65 |
| **Strikt, mer än 1 h** | **65** | **9,2 d** | **18,3 d** | **28,0 d** | **35,0 d** | **2** | **6** | **51** |
| Utökat (n=2), mer än 1 h | 145 | 16,7 d | 34,9 d | 141,8 d | 182,2 d | – | 6 | 63 |

Fördelningen i hinkar:

| Gap | Strikt >1 h (n=65) | Utökat >1 h (n=145) |
|---|---|---|
| 1–18 h | 2 | 2 |
| 18 h – 3 d | 4 | 4 |
| 3–7 d | 7 | 9 |
| 7–14 d | 15 | 17 |
| 14–30 d | **23** | **31** |
| 30–60 d | 14 | 29 |
| 60–120 d | – (kan inte synas) | 6 |
| > 120 d | – (kan inte synas) | **47** |

**Vad det betyder:**
- **Löftet "samma paket inom 18 timmar"**: 16 av 79 i strikt urval la köp 2 inom 18 h,
  men **14 av dem inom första timmen**. Det är samma besök, alltså före något efter-köp-mejl
  hunnit göra nytta. Mellan 1 och 18 timmar: **2 av 79**. Datan ger inget stöd för att
  18-timmarsfönstret driver återköp. Under 3 dagar (över 1 h): 6 av 65.
- **Huvudtoppen ligger på 7–30 dagar** (38 av 65 i strikt urval). Leveranslöftet är 7–14
  kalenderdagar (median 10,1 dygn till leverans, `sparning/sida.mjs` 2026-09-22), så köp 2
  kommer typiskt **någon vecka efter att paketet kommit fram**.
- **En andra topp på 4–7 månader**: 47 kunder skapades feb–apr 2026 och köpte igen i
  aug–sep. De syns bara i det utökade urvalet. Deras köp 2 är bredare (se punkt 2).
  Det kan vara säsong, men ett år data finns inte, så det går inte att avgöra.

---

## 2. Vad köp 2 innehöll jämfört med köp 1

Tilläggsraden `garanti-for-saker-frakt` (fraktgaranti) räknas inte som produkt.

### Samma produkt eller en annan? (strikt, mer än 1 h, n=65)

| Utfall | Kunder |
|---|---|
| Bara samma produkt igen | 13 (Fiskespöhållaren 4, Motorhöljet 3, Strandtofflorna 2, 4 andra med 1 var) |
| Helt annan produkt | **50** |
| Blandat (samma + ny) | 2 |

### Produktpar köp 1 → köp 2 (strikt, mer än 1 h)

| Köp 1 | Köp 2 | Antal | Gap | Kommentar |
|---|---|---|---|---|
| **Marin Motorhölje 420D** (348 kr) | **Båtmotorskydd 420D heltäckande** (579 kr) | **12** | 16,7–41,2 d, median ~28 d | Uppgradering: köp 1 kostade 348 kr i 11 av 12 fall, köp 2 579 kr. Ingen av köp 1-ordrarna var återbetald. |
| Marin Motorhölje 420D | Fiskespöhållare 4-pack | 2 | | |
| Marin Motorhölje 420D | Övervakningskamera | 2 | | |
| Strandtofflor herr | Sätesöverdrag åkgräsklippare | 2 | | |
| Strandtofflor herr | Bälteslipmaskin mini | 2 | | |
| Fiskespöhållare 4-pack | Sotarset | 2 | | |
| Taköverdrag husvagn | Termoskydd husbil | 2 | | +1 åt andra hållet inom 1 h |
| Alla andra par | | 1 var (31 par) | | För få för att dra slutsatser |

Per första produkt (strikt, mer än 1 h):

| Köp 1-produkt | Återköpare | Samma igen | Vanligaste köp 2 |
|---|---|---|---|
| Marin Motorhölje 420D | 21 | 3 | Båtmotorskydd 420D (12) |
| Fiskespöhållare 4-pack | 11 | 4 | Sotarset (2), sedan spritt |
| Strandtofflor herr | 10 | 2 | Sätesöverdrag (2), Bälteslip (2), sedan spritt |
| Sätesöverdrag åkgräsklippare | 4 | 1 | spritt |
| Axelbälte trimmer | 3 | 1 | Taköverdrag (1), Ståltrådsborsthuvuden (1) |

**Hur stor andel av alla köpare kommer tillbaka?** Kohort: kunder vars första order
lades 2026-07-27 – 2026-08-25 (minst 30 dagars uppföljning), n = 1 432. **34 köpte igen
inom 30 dagar (över 1 h): 2,4 %.**

| Köp 1-produkt (≥ 40 förstagångsköpare) | Köpare | Köpte igen ≤ 30 d | Andel |
|---|---|---|---|
| Marin Motorhölje 420D | 503 | 16 | 3,2 % |
| Fiskespöhållare 4-pack | 201 | 6 | 3,0 % |
| Strandtofflor herr | 191 | 6 | 3,1 % |
| Sätesöverdrag åkgräsklippare | 162 | 2 | 1,2 % |
| Axelbälte trimmer | 134 | 2 | 1,5 % |
| Skoreparationslappar | 40 | 0 | 0 % |

### Kategorimatris köp 1 → köp 2 (strikt, mer än 1 h, n=65 kunder; en kund kan ge flera celler)

Kategorierna sattes efter produktens handle. **båt/marint** omfattar även motor-, bil- och
tanktillbehör (Bävertratt, Bäverkoppling, ATV/MC-kapell); **hus/hem/säkerhet** omfattar
även skor, kläder och handverktyg (Strandtofflor, Bälteslip, Sotarset).

| köp 1 ↓ / köp 2 → | båt/marint | trädgård/trimmer | hus/hem/säk. | fiske | husvagn/husbil | jakt/vandring | kalender/present |
|---|---|---|---|---|---|---|---|
| **båt/marint** | **16** | 3 | 3 | 2 | – | – | – |
| **trädgård/trimmer** | 2 | **4** | 1 | – | 1 | – | – |
| **hus/hem/säk.** | 3 | 2 | **12** | 1 | 2 | 1 | – |
| **fiske** | 1 | 1 | 5 | **4** | – | – | – |
| **husvagn/husbil** | 1 | – | – | – | **2** | – | – |
| **kalender/present** | – | – | – | – | – | – | 1 |

Köpare stannar mest i **samma kategori** (båt → båt 16, varav 12 är Motorhölje → Båtmotorskydd;
hus/hem → hus/hem 12). Utanför det är fiske → hus/hem (5) störst, och de fem köpen är
fem olika produkter. Husvagn → båt (1) är Taköverdrag → ATV-kapell.

### Köp 2 i det utökade urvalet (n=145 över 1 h; köp 1:s innehåll okänt för de flesta)

Bävertratt 24 · Båtmotorskydd 420D 16 · Marin Motorhölje 11 · Fiskespöhållare 11 ·
Taköverdrag 9 · Sätesöverdrag 9 · Bälteslip 8 · Strandtofflor 7 · IBC-överdrag 6 ·
Axelbälte 5 · Sotarset 5 · Övervakningskamera 5.
Bara de som återkom **efter mer än 30 dagar med köp 1 före fönstret** (n=69): Bävertratt 14,
Marin Motorhölje 8, Taköverdrag 7, Fiskespöhållare 5, Sätesöverdrag 5.
**Bävertratten (149 kr) är den vanligaste andra produkten** för kunder som kommer tillbaka
efter flera månader.

### Rabatter och gratisprodukterbjudandet

- Rabattkod på köp 2 (strikt, n=79): **1** (`VALKOMMEN10`). På köp 1: 0.
- Köp 2 med en produkt ur kollektionen `din-gratisprodukt` (erbjudandet `TACKIGEN`): **0 av 79**.
  Inget i fönstret visar att "köp igen, få en gratisprodukt" har drivit ett enda återköp.
  Antingen har erbjudandet inte nått kunderna än, eller så använde ingen det.

---

## 3. Ordervärde köp 2 mot köp 1

| Urval | n | Köp 1 median | Köp 2 median | Köp 2 högre / lika / lägre | Kvot (median) |
|---|---|---|---|---|---|
| Strikt, alla | 79 | 489 kr | 579 kr | 43 / 16 / 20 | 1,1 |
| **Strikt, mer än 1 h** | **65** | **459 kr** | **579 kr** | **39 / 11 / 15** | **1,3** |
| Strikt, gap > 14 d | 37 | 348 kr | 579 kr | 27 / 5 / 5 | 1,7 |
| Utökat, mer än 1 h (köp 1 = amountSpent − köp 2) | 145 | 338 kr | 579 kr | 97 / 13 / 35 | – |
| Utökat, inom 1 h | 64 | 299 kr | **99 kr** | – | – |

**Ett riktigt återköp är större än första ordern, inte mindre.** Det är inget litet
tillägg; kunden köper en fullprisprodukt (medianen 579 kr är exakt Båtmotorskyddets pris).
Bara ordrar inom första timmen är små.

Beloppen är ordersumman vid köpet (`totalPriceSet`). `amountSpent` räknar bort
återbetalningar, så köp 1-värdet i det utökade urvalet kan vara något för lågt.

---

## 4. Topp 100 kunder efter `amountSpent`

| Mått | Värde |
|---|---|
| Spann | 1 558 – 3 851 kr, median 1 918 kr |
| Summa | 193 726 kr = **5,8 %** av all `amountSpent` i butiken |
| Antal ordrar | **1 order: 76** · 2: 17 · 3: 4 · 4: 1 · 6: 2 |
| Med minst en synlig order | 98 |
| Köpt i mer än en kategori | 26 |
| Enorderskunderna: artiklar per order (median) / olika produkter (median) | 2 / 1 |

Produkter (antal toppkunder som köpt dem): **Taköverdrag husvagn 54** · Övervakningskamera 13 ·
Sätesöverdrag 7 · Båtmotorskydd 5 · Bälteslip 5 · Marin Motorhölje 4 · Bäverkoppling 4 ·
IBC-överdrag 4 · Fiskespöhållare 4 · Bävertratt 4 · Fågelmatare med kamera 3 · Sotarset 3 ·
Jumpstart 7-i-1 3 · Bäverlampa 3 · Termoskydd husbil 3.

Kategorier: husvagn/husbil 54 · hus/hem/säkerhet 32 · båt/marint 23 · trädgård/trimmer 21 ·
fiske 4 · jakt/vandring 2.

**Bäverbutikens mest värdefulla kunder är inte återköpare.** Tre av fyra har lagt en enda
order, typiskt två exemplar av samma produkt (median 2 artiklar, 1 produkt), och taköverdraget
(1 129 kr) är den vanligaste. Den delen av Damons metod
(högst livstidsvärde → vad köpte de sedan) ger alltså nästan inget här: det finns inget
"sedan" för 76 av 100. Det som stöds är att **taköverdragsköparen är butikens största
kund**, och att Termoskyddet husbil är det enda som följt efter i datan (2 + 1 kunder).

---

## 5. Slutsats för efter-köp-flödet i Klaviyo

### Korsförsäljningar med stöd i datan

| Efter köp av | Erbjud | Stöd | Bedömning |
|---|---|---|---|
| **Marin Motorhölje 420D** | **Båtmotorskydd 420D heltäckande** | **12 av 21** återköpare med motorhöljet (strikt), gap 17–41 d | **Det enda paret med verkligt stöd.** Motorhöljet är också den största ingångsprodukten (503 förstagångsköpare på 30 dagar). |
| Taköverdrag husvagn | Termoskydd husbil | 2 (+1 åt andra hållet) | Svagt, men logiskt och stämmer med topp 100. Värt att testa, inte att räkna med. |
| Samma kategori (båt → båt, hus/hem → hus/hem) | Kategorins storsäljare | båt → båt 16 (12 av dem är paret ovan), hus/hem → hus/hem 12 | Stöder att rekommendationerna följer kategorin, inte butikens allmänna topplista. |
| Fiskespöhållaren, Strandtofflorna | Samma produkt igen | 4 resp. 2 | Litet stöd för ett "köp en till"-mejl. |
| Vilken produkt som helst → Bävertratten | Bävertratt (149 kr) | vanligaste köp 2 efter lång paus (14 av 69) | Rimlig produkt att sätta i ett win-back-mejl; innehållet i köp 1 är okänt för dem. |

Alla andra par har **1 kund var**. De stöder ingenting.

### Tidpunkt som datan stöder

| Mejl | När | Varför |
|---|---|---|
| Samma-paket / "lägg till innan vi packar" | **Inom första timmen** efter ordern (orderbekräftelsen eller tack-sidan), inte ett separat mejl på 18 h | 14 av 16 återköp under 18 h skedde inom 1 h; 1–18 h: 2 av 79. |
| **Första korsförsäljningen** | **Dag 10–14 efter ordern**, helst utlöst av "Levererad" + 3 dagar | p25 för riktiga återköp är 9 d, median 18 d; paketet kommer fram efter ~10 dygn. |
| Påminnelse / Motorhölje → Båtmotorskydd | **Dag 21–28** | Motorhölje → Båtmotorskydd låg på 17–41 d, median ~28 d; p75 för alla är 28 d. |
| Sista mejlet i flödet | ~dag 35–40 | p90 i strikt urval är 35 d (men fönstret kapar längre gap). |
| Win-back | 4–6 månader | 47 tvåorderskunder köpte igen efter mer än 120 d. Stödet är okontrollerat för säsong. |

Köp 2 är större än köp 1 (median 579 mot 459 kr), så mejlen bör föreslå fullprisprodukter.
Billiga tillägg som enda erbjudande stöds inte av datan.

### Ärlighet om urvalet

- **Litet:** 79 kunder med båda köpen synliga, 65 om samma-besök-ordrar räknas bort.
  Bara ett produktpar når över 3 kunder.
- **Skevt mot korta gap:** 60-dagarsfönstret gör att ett gap över ~58 dagar inte kan
  synas i det strikta urvalet. Medianen 18 d är därför en **underskattning**. Det utökade
  urvalet (median 35 d, p75 142 d) visar att en stor grupp kommer tillbaka efter månader.
- **Återköpsgraden är låg:** 2,4 % inom 30 dagar. Flödet påverkar alltså ett fåtal
  kunder per månad. Motorhöljet → Båtmotorskydd är det enda där en tydlig andel av
  återköparna gör samma sak.
- **Säsong:** hela fönstret är slutet av juli till slutet av september. Båt- och
  trädgårdsprodukterna säljer då; vinterprodukter (Termoskydd, Kranskydd, snöprodukter)
  har knappt hunnit få återköpare.
- **Mätningen blir bättre med `read_all_orders`.** Med den behörigheten på appen går
  analysen att köra om på hela historiken, och då försvinner både 60-dagarskapningen och
  `createdAt`-proxyn. Det är Axels klick i appens behörigheter i Shopify, inte något den här
  sessionen kan göra.
