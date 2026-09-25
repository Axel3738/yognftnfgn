# Flödesresearch: Bäverbutikens Klaviyo-flöden (2026-09-24)

Skriven för att Evolve saknar innehåll om flödesstruktur (`SVAR.md`, svar 2–8).
Allt nedan har en källa. **Alla siffror från källorna är EXTERNA riktmärken**, i
dollar och mest amerikanska konton. De är inte vår data och får inte citeras som
det. Våra egna tal (75 ordrar/dag, AOV 741 kr, 3,3 % återköp, 6 186 med
samtycke) kommer ur uppdraget och `BRIEFER.md`.

Källor lästa 2026-09-24. Datum per källa står där det gick att läsa.

---

## (a) Flödestyperna

### Övergiven kassa (Started Checkout)

| Mejl | Tidpunkt | Uppgift | Rabatt | Format | Källa |
|---|---|---|---|---|---|
| 1 | 2–4 h efter påbörjad kassa (Klaviyos förbyggda flöde: 4 h) | Påminnelse, bara de övergivna produkterna, knapp tillbaka till kassan | Nej. "we don't encourage you to include a coupon in the first email" | Dynamiskt produktblock | [Klaviyo Help: abandoned cart flow](https://help.klaviyo.com/hc/en-us/articles/115002779411) |
| 2 | 20–48 h efter mejl 1 | Uppföljning, uppmuntra frågor | Om alls: sist, eller bara till förstagångsköpare | Designat | samma |
| Antal | 2–3 mejl | "2–3 abandoned cart messages … leads to optimal performance" | | | samma |
| Split | Förstagångsköpare / tidigare kund; incitament bara till de som inte köpt | | | | samma |
| Exempel-sekvens | 3 mejl: påminnelse 2–4 h, uppföljning 24 h, sista 48 h | | Rabatt i mejl 2 i exemplet, "Discounts aren't mandatory" | | [Klaviyo blog: abandoned cart benchmarks (maj 2024)](https://www.klaviyo.com/blog/abandoned-cart-benchmarks) |

Externa riktmärken (Klaviyo, 143 000 flöden, 2023): RPR i snitt **$3,65**, topp 10 %
$28,89. Öppning 50,5 %, klick 6,25 %, konvertering 3,33 %. Bransch, snitt-RPR:
Automotive ~$10, Hardware & Home Improvement ~$10, Home & Garden ~$6
([källa](https://www.klaviyo.com/blog/abandoned-cart-benchmarks)).
Flera mejl gav 69 % fler ordrar än ett enda (Chase Dimond, citerad av
[Klaviyo, apr 2025](https://www.klaviyo.com/blog/abandoned-cart-email)).

### Övergiven varukorg (Added to Cart), eget flöde

| Mejl | Tidpunkt | Uppgift | Rabatt | Format | Källa |
|---|---|---|---|---|---|
| – | Ej angivet av Klaviyo | Mjukare än kassaflödet: den som lagt i varukorgen men inte börjat kassan | Ej angivet | Mall finns i flödesbiblioteket | [Klaviyo Help: Added to Cart flow](https://help.klaviyo.com/hc/en-us/articles/35510464880027) |
| Krav | Klaviyos app embed på + "Track behavioral events" | | | | samma |
| Överlapp | Filter "Started Checkout zero times since starting this flow" | | | | [Klaviyo Community](https://community.klaviyo.com/marketing-30/abandoned-cart-vs-checkout-started-1790) (forum, inte Klaviyos dokumentation) |

Kassaflödet drar ungefär dubbelt så mycket intäkt som varukorgsflödet, enligt ett
forumsvar ([Klaviyo Community](https://community.klaviyo.com/marketing-30/abandoned-cart-flow-vs-abandoned-checkout-flow-performance-comparison-4178)). Anekdot, inte mätning.

### Välkomst

| Mejl | Tidpunkt | Uppgift | Rabatt | Format | Källa |
|---|---|---|---|---|---|
| 1 | Direkt | Presentera butiken, samla preferenser | Klaviyo föreslår incitamentet i första mejlet, bara på grenen för icke-köpare | Designat; text-only nämns som alternativ för ett personligt mejl om företagets historia | [Klaviyo Help: welcome series](https://help.klaviyo.com/hc/en-us/articles/115002775172), [text-only](https://help.klaviyo.com/hc/en-us/articles/12415384810651) |
| 2 | +3 dagar | Sociala medier (Klaviyos exempel) | | | samma |
| 3 | +4 dagar | Storsäljarna | | | samma |
| Split | "Has Placed Order at least once over all time" (egen gren med förstaköpserbjudande) och "since starting this flow" (ge inte rabatt i onödan) | | | | samma |

Externa riktmärken (Klaviyo, jan 2025): RPR **$2,65**, orderfrekvens topp 10 %
10,53 % ([källa](https://www.klaviyo.com/blog/top-email-automation-examples)).

### Webbhistorik (Viewed Product)

| Mejl | Tidpunkt | Uppgift | Rabatt | Format | Källa |
|---|---|---|---|---|---|
| 1 | Minst 1 h efter besöket | Produkten personen tittade på | Förstagångsbesökare: kan; tidigare kunder: nej | Dynamiskt produktblock | [Klaviyo Help: browse abandonment](https://help.klaviyo.com/hc/en-us/articles/115002775252) |
| Antal | "Minimum 3 emails" + 1 SMS | Utbildning/villkor före rabatt | Varning: rabattord kan ge skräppost | | [Klaviyo blog, jun 2022](https://www.klaviyo.com/blog/browse-abandonment-email) |
| Filter | Inte köpt, inte påbörjat kassa, inte lagt i varukorg sedan start; inte i flödet senaste 30 dagarna | | | | [Klaviyo Help](https://help.klaviyo.com/hc/en-us/articles/115002775252) |

**Krav som styr allt för oss:** Viewed Product spåras bara för *identifierade*
besökare, det vill säga de som fyllt i ett formulär, påbörjat en kassa eller klickat
i ett mejl ([Klaviyo Help](https://help.klaviyo.com/hc/en-us/articles/115002775252), [cookies](https://help.klaviyo.com/hc/en-us/articles/360034666712)).
Externa riktmärken: konvertering 0,96 % ([Klaviyo 2022](https://www.klaviyo.com/blog/browse-abandonment-email)), RPR $1,07 (sekundär källa, [BS&Co](https://bsandco.us/blog-post/klaviyo-flow-benchmarks), inte verifierad hos Klaviyo).

### Efter köp / korsförsäljning

| Mejl | Tidpunkt | Uppgift | Rabatt | Format | Källa |
|---|---|---|---|---|---|
| Transaktionellt | Direkt, **eget flöde** | Bara orderbekräftelse, ingen marknadsföring | – | – | [Klaviyo Help: post-purchase](https://help.klaviyo.com/hc/en-us/articles/360028872611) |
| Tack | Direkt (ingen fördröjning rekommenderas) | Relation; olika text för första- och återkommande köpare ("Placed Order equals 1 over all time") | – | – | samma |
| Instruktion | Före leverans (valfri) | Hur produkten används | – | – | samma |
| Recension | Efter leverans *och* användning | | – | – | samma, [Klaviyo blog, sep 2025](https://www.klaviyo.com/blog/post-purchase-emails) |
| Korsförsäljning | Klaviyos förbyggda flöde: **14 dagar efter Fulfilled Order**; bloggen: **2–4 veckor efter leverans** | Kompletterande produkter, produktflöde per kategori | Expertråd i samma artikel: tidsbegränsad kod för andra köpet inom 30 dagar | Produktflöde | [Klaviyo Help: cross-sell](https://help.klaviyo.com/hc/en-us/articles/115002775212), [Klaviyo blog](https://www.klaviyo.com/blog/post-purchase-emails) |
| Tidsregel | "well timed to your shipping window … not too early … or after the product arrives" | | | | [Klaviyo Help](https://help.klaviyo.com/hc/en-us/articles/360028872611) |

Externa riktmärken: efter köp-mejl har ~17 % högre öppning än andra automationer;
högst RPR i automotive, sporting goods och hardware/home improvement ([Klaviyo, sep 2025](https://www.klaviyo.com/blog/post-purchase-emails)).
Omnisend 2025: orderbekräftelse 53,99 % öppning, $1,60 per mejl; råd "minst 80 %
transaktionellt, högst 20 % reklam" ([Omnisend](https://www.omnisend.com/blog/order-confirmation-email-automation-conversions/)).
Parts Avatar (bildelar): 84 % av Klaviyo-intäkten från flöden; produktrekommendationer
efter köp löpande i stället för månadsvis gav ~3x klick ([Klaviyo case](https://www.klaviyo.com/customers/case-studies/parts-avatar)).

### Vinback

| Mejl | Tidpunkt | Uppgift | Rabatt | Format | Källa |
|---|---|---|---|---|---|
| Fördröjning | "a little longer than your business's average buying cycle"; Academy-exempel 75 d (test mot 55 d) | | | | [Klaviyo Help: winback](https://help.klaviyo.com/hc/en-us/articles/115002775192), [Academy](https://academy.klaviyo.com/en-us/quick-guides/anatomy-of-a-flow-winback) |
| 1 | – | 3–6 storsäljare eller nyheter + incitament | Ja, tidsbegränsat; kronor vid högt ordervärde, liten procent annars; unik kod | Designat | samma |
| 2 | – | Påminnelse om incitamentet, andra produkter | | | samma |
| 3 | – | "Last chance", tydlig avregistrering | | | samma |
| Filter | "Placed Order zero times since starting this flow" | | | | [Klaviyo Help](https://help.klaviyo.com/hc/en-us/articles/115002775192) |

Externt riktmärke: vinback RPR $0,84 ([Klaviyo, Q4 2016-data](https://www.klaviyo.com/marketing-resources/ecommerce-benchmarks), gammalt).

### Sunset

| Mejl | Tidpunkt | Uppgift | Rabatt | Format | Källa |
|---|---|---|---|---|---|
| Segment | Profil minst 180 d gammal, fått ≥ 5 mejl senaste 72 veckorna, noll öppningar/klick/besök/köp | | | | [Klaviyo Help: sunset](https://help.klaviyo.com/hc/en-us/articles/360017518492) |
| Mejl | **Högst tre** | Fråga om de vill ha mejlen | Nej | **Ren text**, personligt, tydlig avregistrering | samma |
| Karens | 3 d efter sista mejlet (7–10 d för den som skickar sällan) | Sätt profilegenskap, undertryck | | | samma |
| Filter | Den som öppnar/klickar lämnar flödet | | | | samma |

### Flöden totalt (externt)

Flöden står för ~41 % av e-postintäkten på 5,3 % av utskicken; orderfrekvens i
flöden: Home & Garden 2,17 %, Hardware 1,96 %, Sporting goods 1,79 %, Automotive
1,7 % ([Klaviyo benchmarks 2026](https://www.klaviyo.com/products/email-marketing/benchmarks)).
Omnisend: välkomst, varukorg och webbhistorik = 87 % av alla automatiserade ordrar
([Omnisend](https://www.omnisend.com/blog/email-marketing-statistics/)).

---

## (b) Byggordning

**Vad källorna säger:**
- Klaviyo Academy: först välkomst, övergiven varukorg, vinback; sedan minst två till
  (webbhistorik, efter köp, korsförsäljning) ([Academy](https://academy.klaviyo.com/en-us/best-practices/best-practices-for-flows)).
- Intäkt per mottagare (Klaviyo): kassa $3,65 > välkomst $2,65 > webbhistorik (~$1,07, sekundärkälla) > vinback $0,84.
- En byrå: kassa, välkomst, efter köp, webbhistorik, vinback, VIP, sunset ([1Digital](https://www.1digitalagency.com/blog/the-7-essential-klaviyo-flows-every-shopify-store-needs-with-revenue-benchmarks-70284/); siffrorna där saknar källa).

**För oss ändras ordningen av en sak källorna själva säger:** välkomst, webbhistorik
och varukorg når bara *identifierade* profiler. Kontot har inga formulär (mätt
2026-09-24), så nya besökare från Meta-annonsen blir identifierade först när de
påbörjar kassan. Intäkt = RPR × mottagare, och mottagarna saknas för tre av flödena
tills en popup finns.

| Ordning | Flöde | Skäl |
|---|---|---|
| 1 | F02 Övergiven kassa | Högst RPR hos Klaviyo, och det enda flödet som når nya icke-köpare utan formulär (kassan identifierar). Kräver att Shopifys egen notis stängs. |
| 2 | F04 Efter köp (ombyggt, se c) | ~75 ordrar/dag ger volym direkt; erbjudandet TACKIGEN finns redan. |
| 3 | F05 Vinback | Klaviyo Academys tredje basflöde; mottagarna finns redan (8 367 kunder). |
| 4 | F06 Sunset | Ingen intäkt, men skyddar leveransen för allt annat ([Klaviyo](https://help.klaviyo.com/hc/en-us/articles/360017518492)). Behövs först när profiler fått ≥ 5 mejl. |
| 5 | F01 Välkomst | Näst högst RPR, men noll mottagare utan popup. Bygg när popupen (Axels beslut) är på. |
| 6 | F03 Webbhistorik + nytt Added to Cart | Når bara identifierade besökare. Värt först när popup och mejlklick byggt upp identifierade besökare. |

---

## (c) Ändringar i våra flöden

### F04 Efter köp: bygg om (viktigast)

1. **Erbjudandet kommer för sent.** TACKIGEN "gäller till orderdatum + 7 dagar"
   (`mejl/konfig.json` → `giltig_dagar: 7`), men F04 E1 går ut dag 20. Då säger
   Shopify-mejlen att erbjudandet gått ut, och Klaviyo erbjuder det igen. Flytta
   erbjudandepåminnelsen innanför 7 dagar (t.ex. dag 3–5), eller gör F04 E1 till
   ett eget, nytt erbjudande. Belägg: vår egen konfig; Evolve (Ankit P):
   korsförsäljning 0–3 dagar om erbjudandet är starkt (`SVAR.md`); Klaviyo-experten:
   andra köpet inom 30 dagar med tidsbegränsad kod ([Klaviyo](https://www.klaviyo.com/blog/post-purchase-emails)).
   ⚠️ Klaviyos egen standard säger tvärtom 14 dagar efter Fulfilled Order ([Klaviyo Help](https://help.klaviyo.com/hc/en-us/articles/115002775212)). Källorna är oense, så det blir ett test (se d).
2. **Dela på första- och återkommande köpare** ("Placed Order equals 1 over all
   time"), som Klaviyo säger ([Help](https://help.klaviyo.com/hc/en-us/articles/360028872611)).
3. **Lägg till filtret "Placed Order zero times since starting this flow"** före
   korsförsäljningsmejlen, så ett nytt köp inte ger mejl om det förra ([Klaviyo Help](https://help.klaviyo.com/hc/en-us/articles/115002775212)).
4. **"Kom allt fram?" dag 20 kan stå kvar**, men med Fulfilled Order som
   utlösare i stället för Placed Order, eftersom Klaviyo pekar på den för att den
   ligger närmare leveransen ([Klaviyo Help](https://help.klaviyo.com/hc/en-us/articles/115002775212)).
5. **Produktraden ska visa komplement till det kunden köpte, inte tre fasta
   storsäljare.** Klaviyo: produktflöden per kategori/kollektion
   ([Help](https://help.klaviyo.com/hc/en-us/articles/115002775212)); Evolve:
   "sälj det som kompletterar" (`SVAR.md` fråga 3). Komplementkartan finns redan
   i `mejl/konfig.json` (`per_handle`), men co-purchase-datan är tunn
   (`mejl/README.md`: 96 % av ordrarna har en enda produkt).

### Nytt: "Paketet är på väg" (ett mejl, inte en serie)

- **Shopify skickar redan hela vänta-kedjan:** orderbekräftelse,
  leveransbekräftelse med beräknad leverans, leveransuppdatering, ute för
  leverans, levererad (`mejl/README.md`), plus spårningssidan. Klaviyo säger att
  transaktionella mejl ska ligga i eget flöde utan marknadsföring
  ([Help](https://help.klaviyo.com/hc/en-us/articles/360028872611)). En Klaviyo-serie
  som upprepar det dubblerar bara.
- **Det som saknas är ett mänskligt mejl mitt i väntan.** Klaviyo lägger
  "instruktion" före leveransen ([Help](https://help.klaviyo.com/hc/en-us/articles/360028872611))
  och nämner WISMO som skäl för proaktiv kommunikation ([blog](https://www.klaviyo.com/blog/post-purchase-emails)).
  Förslag: ett mejl ~dag 3 efter Fulfilled Order, **ren text från Axel**: varför
  det tar 5–10 arbetsdagar, att spårningen står stilla en stund (normalt, SOP 02),
  länken till spårningssidan, och ett användningstips för produkten. Ingen
  produktrad.
- ⚠️ Det når bara kunder med samtycke (flödet filtrerar på samtycke), inte alla
  köpare.
- **Mät det på egen data:** autosvarets logg räknar WISMO-mejl per butik
  (`kundtjanst/autosvar/`). Jämför andelen WISMO före och efter. De externa
  påståendena (50–80 % färre WISMO-ärenden) kommer från leverantörer av
  spårningsverktyg och är inte oberoende ([exempel](https://www.shippypro.com/blog/en/how-to-reduce-wismo-tickets-in-ecommerce-the-complete-guide)).

### "Lägg till i samma paket" (0–18 h)

- Löftet ligger redan i orderbekräftelsen, räknat ur ordertiden
  (`mejl/konfig.json` → `samma_paket_timmar: 18`). Ett Klaviyo-mejl måste gå ut
  inom de 18 timmarna för att inte ljuga, alltså några timmar efter köpet.
- Belägg: Evolve (Ankit P) för 0–3 dagar; Omnisend: håll orderbekräftelsen till
  högst 20 % reklam ([Omnisend](https://www.omnisend.com/blog/order-confirmation-email-automation-conversions/)).
  Klaviyo har inget om att lägga till i samma försändelse.
- ⚠️ `mejl/README.md`: "Löftet är logistik: lagret måste faktiskt slå ihop två
  ordrar." Bygg inte mejlet innan det är bekräftat.

### F02 Övergiven kassa

1. **Mejl 1 från 1 h till 2–4 h** (Klaviyos standard 4 h), eller A/B 1 h mot 4 h
   ([Help](https://help.klaviyo.com/hc/en-us/articles/115002779411)).
2. **Split kund / icke-kund** på "Placed Order at least once over all time"
   ([Help](https://help.klaviyo.com/hc/en-us/articles/115002779411)).
3. Ingen rabatt i mejl 1 stämmer med Klaviyo. Om E3 ska ha rabatt är Axels beslut.
4. Riktmärket för leverans står kvar: E1 under 35 % öppning = leveransproblem
   (Billy, `SVAR.md`). Klaviyos snitt är 50,5 %.

### F03 Webbhistorik + nytt flöde Added to Cart

- Klaviyo vill ha minst 3 mejl i webbhistorik ([blog](https://www.klaviyo.com/blog/browse-abandonment-email)); vi har 2. Låt det vara tills volymen finns (b).
- Lägg filtret "Added to Cart zero times since starting this flow" när varukorgsflödet byggs ([Help](https://help.klaviyo.com/hc/en-us/articles/115002775252)).
- Added to Cart: kräver app embed + "Track behavioral events" ([Help](https://help.klaviyo.com/hc/en-us/articles/35510464880027)), och filtret "Started Checkout zero times" så det inte krockar med F02.

### F01 Välkomst

- Tidpunkterna (direkt, +2, +3) ligger nära Klaviyos (direkt, +3, +4). Ingen ändring behövs.
- Klaviyo lägger incitamentet i mejl 1 på grenen för icke-köpare ([Help](https://help.klaviyo.com/hc/en-us/articles/115002775172)). Vi har ingen välkomstrabatt. Axels beslut.
- E1 kan vara ren text från Axel, som Klaviyo föreslår för en välkomsthälsning om företagets historia ([Help](https://help.klaviyo.com/hc/en-us/articles/12415384810651)).

### F05 Vinback

- 75 dagar matchar Klaviyo Academys exempel; test 55 mot 75 dagar är Klaviyos eget förslag ([Academy](https://academy.klaviyo.com/en-us/quick-guides/anatomy-of-a-flow-winback)).
- Lägg till filtret "Placed Order zero times since starting this flow" ([Help](https://help.klaviyo.com/hc/en-us/articles/115002775192)). Vårt `ej_kopt_sedan_start` kan vara samma sak; kontrollera.
- Klaviyo: tre mejl, tidsbegränsat incitament, sista mejlet "last chance". Vi har två, med hjulet. Ett tredje mejl kan läggas till senare.

### F06 Sunset

- Stämmer med Klaviyo (180 d, ≥ 5 mejl, högst 3 mejl). Två ändringar: **ren text**
  ([Help](https://help.klaviyo.com/hc/en-us/articles/360017518492)), och
  **karens 7–10 dagar** efter E2 innan profilen märks och undertrycks, eftersom vi
  skickar två kampanjer i veckan ("7–10 days for less frequent senders", samma källa).

### Ren text eller designat mejl

| Flöde | Format | Belägg |
|---|---|---|
| Sunset | Ren text | Klaviyo: rekommenderar ren text ([Help](https://help.klaviyo.com/hc/en-us/articles/360017518492)) |
| Välkomst E1, "Paketet är på väg", ursäkter | Ren text från Axel | Klaviyo: text-only för välkomst med företagets historia och ursäkter, "often see higher click rates", bäst undertecknat av en person ([Help](https://help.klaviyo.com/hc/en-us/articles/12415384810651)) |
| Kassa, varukorg, webbhistorik, korsförsäljning, vinback | Designat med produktblock | Klaviyo: dynamiska produktblock i kassaflödet ([Help](https://help.klaviyo.com/hc/en-us/articles/115002779411)); HubSpot själv förbehåller: "ecommerce companies may have completely different results because users expect only HTML-rich emails" ([HubSpot](https://blog.hubspot.com/marketing/plain-text-vs-html-emails-data)) |

HubSpots test (2014, HubSpots kundbas, inte e-handel): HTML med bilder gav 21 % lägre
klickfrekvens och 51 % färre klick än ren text ([HubSpot](https://blog.hubspot.com/marketing/plain-text-vs-html-emails-data)).
Det är den enda mätningen som hittades, och den är inte från e-handel.

---

## (d) Det som inte gick att belägga

- **Riktiga flöden från jämförbara, nordiska butiker: EJ BELAGT.** Milled.com
  svarar 403 på maskinläsning (sök och enskilda mejl). Really Good Emails visar
  bara ämnesraden, inte innehållet (Mammuts "Welcome to the Mammut family",
  Outdoor Voices "OV — WELCOME", båda designade, utan synlig rabatt). Ingen
  nordisk outdoor-, båt- eller campingbutik med publicerat flöde hittades. Enda
  jämförbara fallet, [Boat Outfitters](https://www.klaviyo.com/customers/case-studies/boat-outfitters)
  (63–67 % av Klaviyo-intäkten från flöden), beskriver inte flödena. Nästa steg
  enligt Evolve: prenumerera själv och läs i en webbläsare.
- **Mejlens längd per flödestyp:** ingen källa med mätning.
- **RPR för efter köp-flöden:** inget Klaviyo-tal hittat. Ett tal i en sökträff
  ($0,80–2,50) stämde inte med källan; byrån 1Digital anger $2–5 utan källa.
- **Hur "vänta på paketet"-mejl påverkar återköp:** ingen oberoende mätning.
  WISMO-minskningen kommer från verktygsleverantörer.
- **Korsförsäljning 0–3 dagar mot 14 dagar:** källorna är oense (Evolve mot
  Klaviyos standard). Ingen mätning på nischköpare med 3 % återköp.
- **Klaviyos benchmarkrapport 2025 (PDF)** gick inte att läsa här (ingen
  PDF-läsare i containern). Flödessiffror per typ och bransch kan finnas där.
- **Webbhistorik-RPR $1,07** finns bara i sekundärkällor, inte hos Klaviyo.
