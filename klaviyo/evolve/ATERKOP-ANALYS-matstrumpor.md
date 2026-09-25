# Återköpsanalys: Damons metod på Matstrumpors Shopify-data

**Mätt:** 2026-09-25 ~12:00 UTC. **Källa:** Shopify Admin GraphQL (API 2025-07) via
`sparning/butik.mjs` (butiken `matstrumpor`, appen "Fabriken",
`SHOPIFY_CLIENT_ID/SECRET_1r46tp_qx`), läs-bart. Appen har `read_all_orders`, så till
skillnad från Bäverbutikens analys (60 dagars fönster) är det här **hela historiken**:
3 916 ordrar från 2025-08-04 till 2026-09-25, varav 5 annullerade (räknas bort).
Inga kundnamn eller e-postadresser i den här filen; kunder räknas på Shopifys kund-id.
Skripten ligger i sessionens scratch-mapp, inte i repot.

**Metoden (Evolve, "Damon"):** ta kunderna med högst livstidsvärde och de som köpt
mer än en gång, mät tiden mellan köp 1 och köp 2 och se vad köp 2 innehöll jämfört
med köp 1. Svaret ska styra efter-köp-, återköps- och vinback-flödena i Klaviyo.

Samma metod som `ATERKOP-ANALYS.md` (Bäverbutiken) så talen går att lägga bredvid
varandra. Där det skiljer sig är det datan som skiljer, inte metoden.

---

## 0. Vad datan säger om butiken (läs det här först)

| Mätt | Värde | Källa |
|---|---|---|
| Ordrar (ej annullerade) | **3 911**, 3 899 betalda, 8 återbetalade, 3 delvis | `orders`, alla 16 sidor |
| Kunder med minst en order | **3 776** | kund-id per order |
| Kunder totalt i Shopify | 4 362 · SUBSCRIBED **2 892** · NOT_SUBSCRIBED 1 165 · UNSUBSCRIBED 81 · utan samtyckesfält 224 | `customers`, `emailMarketingConsent.marketingState` |
| I Klaviyo (UV6Rqg) samma dag | 4 357 profiler · subscribed **2 890** · unsubscribed 81 · aldrig 1 386 | `node klaviyo/kolla.mjs --brand matstrumpor --profiler` |
| Omsättning hela perioden | 1 405 324 kr | `totalPriceSet` |
| AOV senaste 30 d | **449 kr** (224 ordrar) | orders-query |
| Kunder med 2+ ordrar | **119** (3,2 % av köparna) | fördelning 1: 3 657 · 2: 109 · 3: 7 · 4–6: 3 |

### Säsongen är hela affären

| Månad | Ordrar | Omsättning | AOV |
|---|---:|---:|---:|
| 2025-08 | 132 | 26 784 kr | 203 kr |
| 2025-09 | 4 | 1 005 kr | 251 kr |
| 2025-10 | 134 | 27 223 kr | 203 kr |
| 2025-11 | 52 | 10 848 kr | 209 kr |
| **2025-12** | **1 613** | **589 675 kr** | 366 kr |
| 2026-01 | 799 | 287 597 kr | 360 kr |
| 2026-02 | 655 | 243 981 kr | 372 kr |
| 2026-03 | 280 | 110 154 kr | 393 kr |
| 2026-04 | 6 | 2 494 kr | 416 kr |
| 2026-05 | 6 | 2 394 kr | 399 kr |
| 2026-06 | 1 | 599 kr | 599 kr |
| 2026-07 | 2 | 798 kr | 399 kr |
| 2026-08 | 30 | 13 077 kr | 436 kr |
| 2026-09 (till 25/9) | 197 | 88 695 kr | 450 kr |

**86 % av alla ordrar lades december till mars.** November 2025 hade bara 52 ordrar,
och det stämmer med Axels besked 2026-09-24 att sushilådan tog slut i november 2025.
April till juli är butiken i praktiken stängd. Det här är en present- och
julstrumpeprodukt, och e-posten ska planeras därefter: hösten är uppvärmning,
november–december är säsongen, januari–februari är eftersäsongen (799 + 655 ordrar
förra året, alltså inte död).

### Vad som köps

| Senaste 60 d | Enheter | Orderrader |
|---|---:|---:|
| Sushi-Strumpor | 460 | 413 |
| Äkta ätpinnar i trä (ingår i paketen, olistad produkt à 50 kr) | 473 | 219 |
| Donut-strumpor | 22 | 21 |
| Pizza-Strumpor | 13 | 13 |
| Hamburgare-Strumpor | 5 | 5 |

- **Sushin är 92 % av strumpenheterna.** Pizza, hamburgare och donut är bisortiment.
- **190 av 227 ordrar (84 %) bär exakt 2 strumpprodukter**, 25 bär 4, 8 bär 1.
  Standardordern är alltså "Köp 1 – Få 1" (två lådor), och rabattkoderna bekräftar
  det: `SUSHI-K1F1` på 135 ordrar, `STRUMPOR-K1F1-P2` 40, `SUSHI-K2F2` 17,
  `STRUMPOR-K1F1-P1` 9. Erbjudandet lever i koderna, inte i priset (5-pack 399 kr,
  jämförpris 399 kr, alltså inget överstruket pris att "spara" mot).
- Källa: 3 840 ordrar `web`, 71 `shopify_draft_order`.

---

## 1. Tiden mellan köp 1 och köp 2

Av de 119 kunderna med 2+ ordrar la **75 sin andra order inom en timme** efter den
första, alltså i samma besök (samma mönster som Bäverbutikens 64 av 209). De räknas
inte som återköp. **Riktiga återköp (mer än 1 h): 44 kunder** av 3 776 = **1,2 %.**

| Urval | n | p25 | median | p75 | p90 |
|---|---:|---:|---:|---:|---:|
| Riktiga återköp (> 1 h), hela historiken | **44** | 2,3 d | **19,4 d** | 58,9 d | 120,2 d |

Fördelningen i hinkar (n = 44): 1–18 h: 5 · 18 h–3 d: 8 · 3–7 d: 0 · 7–14 d: 6 ·
14–30 d: 8 · 30–60 d: 6 · 60–120 d: 6 · 120–240 d: 4 · över 240 d: 1.

**När köp 2 lades:** dec 2025: 12 · jan: 8 · feb: 9 · mars: 9 · nov: 1 · aug: 2 · sep: 3.
**38 av 44 återköp (86 %) lades december–mars**, alltså i säsongen, oavsett när köp 1 lades.
Det är säsongen som utlöser köp 2, inte antalet dagar sedan köp 1.

Kohorter (första order i månad M → andel som köpte igen, mer än 1 h, inom N dygn; bara
kohorter gamla nog att mätas):

| Kohort | Kunder | 30 d | 60 d | 90 d | 180 d |
|---|---:|---:|---:|---:|---:|
| 2025-08 | 131 | 0,0 % | 0,0 % | 0,8 % | 2,3 % |
| 2025-10 | 133 | 0,0 % | 0,0 % | 0,0 % | 0,8 % |
| 2025-12 | 1 556 | 0,8 % | 1,0 % | 1,0 % | 1,2 % |
| 2026-01 | 771 | 0,9 % | 1,3 % | 1,3 % | 1,3 % |
| 2026-02 | 635 | 0,8 % | 0,8 % | 0,8 % | 0,8 % |
| 2026-03 | 264 | 0,8 % | 0,8 % | 0,8 % | 0,8 % |

**Cirka 1 % av köparna kommer tillbaka, nästan alla inom 30 dagar, och sedan händer
nästan inget.** Bäverbutiken hade 2,4 % inom 30 dagar och en andra topp efter 4–6
månader; den andra toppen finns inte här, eller så ligger den 12 månader bort (nästa
jul) och kan inte mätas förrän december 2026.

---

## 2. Vad köp 2 innehöll jämfört med köp 1

Ätpinnarna räknas inte som produkt.

| Utfall (n = 44) | Kunder |
|---|---:|
| **Bara samma produkt igen** | **38** (alla sushi → sushi) |
| Helt annan produkt | 5 |
| Blandat | 0 |
| Bara ätpinnar/annat utan strumpa | 1 |

Produktpar: sushi → sushi **38**, sushi → donut 1, sushi → pizza 0, sushi → hamburgare 0.

**Det finns inget korsförsäljningspar.** Den som kommer tillbaka köper samma
sushilåda en gång till, till en annan person. Det motsvarar Bäverbutikens
"motorhölje → båtmotorskydd" (12 av 21), fast här är svaret "en till av samma".

### Ordervärde köp 2 mot köp 1

| n = 44 | p25 | median | p75 | p90 |
|---|---:|---:|---:|---:|
| Köp 1 | 299 kr | 399 kr | 399 kr | 599 kr |
| Köp 2 | 299 kr | 399 kr | 399 kr | 599 kr |

Högre / lika / lägre: 17 / 17 / 10. **Köp 2 är lika stort som köp 1** (Bäverbutikens
köp 2 var större, 579 mot 459 kr). Det stämmer med "samma låda igen".

---

## 3. Topp 100 kunder efter köpsumma

| Mått | Värde |
|---|---|
| Spann | 698 – 3 194 kr, median 873 kr |
| Summa | 95 029 kr = **6,8 %** av all omsättning |
| Antal ordrar | 1 order: 41 · 2: 49 · 3: 7 · 4–6: 3 |

Till skillnad från Bäverbutiken (76 av 100 med en enda order) är **59 av Matstrumpors
100 största kunder återköpare**, för produkten är billig: ingen når topp 100 på en
order utan att köpa fyra lådor. Men även toppkunderna köper samma sak igen. Det finns
inget "sedan" att korsförsälja mot, bara "en till".

---

## 4. Leveranstiden (styr efter-köp-flödet och sista beställningsdagarna)

Mätt på de 71 paket som `sparning/butiker/matstrumpor/lage.json` markerar som
DELIVERED (av 204 registrerade), med orderdatum ur Shopify och leveranstid ur
Shopifys `fulfillments.deliveredAt` (som spårningsrutinen skriver ur 17TRACK:s
skanning):

| Sträcka | n | p25 | median | p75 | p90 | max |
|---|---:|---:|---:|---:|---:|---:|
| Order → skickad | 204 | 0,1 d | 0,4 d | 0,7 d | 0,8 d | 1,0 d |
| Order → levererad | 71 | 10,0 d | **11,4 d** | 13,1 d | **14,9 d** | 19,7 d |

⚠️ `lage.json`:s fält `senast` är rutinens kontrolltid, inte skanningens (60 av 71
levererade paket står på 2026-09-21, rutinens första körning). Räknat på det blir
p90 25,6 dygn, vilket är fel. **`leverans_p90_dygn` = 15** i brandfilen.

---

## 5. Slutsats för flödena i Klaviyo

| Fråga | Svar ur datan | Vad som byggs |
|---|---|---|
| Korsförsäljning efter köp? | Inget par har stöd (bästa: sushi → donut, 1 kund) | **Inga produktparsflöden** (Bäverbutikens F07-typ) och inga tipsflöden per produkt |
| Återköp? | 38 av 44 köpte samma sushilåda igen, median 19 d, 8 + 6 i 14–30 d | **F07 återköp = "en låda till, till nästa person"**, ETT mejl dag 21 efter Placed Order med sushi, de tre andra sorterna som alternativ |
| Efter köp? | Leverans median 11,4 d, p90 14,9 d, skickas samma dygn | **F04** E1 dag 3 efter Fulfilled Order (paketet är på väg, egen spårningslänk), E2 dag 16 (kom allt fram?) |
| Vinback? | Nästan inga återköp efter 60 d, men 86 % av återköpen sker dec–mars | **F05** 90 dagar efter köp (en höstköpare får det i december), och den riktiga vinbacken är **kampanjerna i november till alla köpare med samtycke** |
| Vilka produkter i mejlen? | Sushi 92 % av enheterna, 5-pack 399 kr utan jämförpris | Sushin är hero överallt; pizza/hamburgare/donut som "till nästa person"; **inga "spara"-ord om sushin** (jämförpris = pris) |
| Erbjudandet? | Köp 1 få 1 bär 135 av 227 ordrar, som rabattkod | Står på produktsidan, skrivs aldrig som siffra i copyn |

### Ärlighet om urvalet

- **44 riktiga återköpare** är ett litet urval, och 38 av dem gör samma sak. Det räcker
  för att säga att ingen korsförsäljning finns, inte för att säga exakt när ett
  återköpsmejl ska gå. Dag 21 är mitten av hinken 14–30 d där flest ligger.
- **Ett år data, en säsong.** Om julen 2026 upprepar julen 2025 vet vi först i januari.
  Kohorten december 2025 (1 556 kunder) är den som avgör: köper de igen i december
  2026 finns en årscykel, och då är novemberkampanjen till köparna butikens viktigaste mejl.
- **Mätningen körs om** med samma skript när säsongen är över (`/klaviyo cs`), och
  då jämförs december 2026 mot december 2025 per kohort.
