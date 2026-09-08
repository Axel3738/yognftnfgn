# Research: "Tips när en metrik lackar" (StonePNL)

Datum: 2026-09-08. Underlag för regelmotorn som visar ett kort tips i StonePNL när en
metrik faller under/över ett tröskelvärde.

## Läs det här först — om källorna

- Allt sifferunderlag kommer ur **30 webbsökningar (engelska)**. Proxyn blockerade
  **samtliga 26 försök att hämta primärsidorna** (WebFetch → `EGRESS_BLOCKED`), så varje
  tal är läst ur sökmotorns utdrag av sidan, inte ur sidan själv. Där utdraget i sin tur
  citerar en primärrapport (NRF, Triple Whale, Klaviyo, Bluecore, Metrilo, Shopify,
  Spiegel/Northwestern) anges primärrapporten som källa och mellanledet i parentes.
- Blockerade domäner (kan inte verifieras härifrån): triplewhale.com, shopify.com,
  apps.shopify.com, klaviyo.com, yotpo.com, rivo.io, postscript.io, getrecharge.com,
  bluecore.com, blog.smile.io, metrilo.com, spiegel.medill.northwestern.edu,
  digitalcommerce360.com, globenewswire.com, prnewswire.com, prweb.com, businesswire.com,
  postnord.se, postnord.com, eightx.co, opensend.com, levelcfo.com, finaloop.com,
  attnagency.com, richpanel.com, redstagfulfillment.com, trueprofit.io, farabiulder.com,
  claimlane.com, darkroomagency.com, bsandco.us, ecommercefastlane.com, mobiloud.com,
  dataanalyticsstack.com, easyappsecom.com, growthsuite.net, barilliance.com,
  hubspot.com, helpscout.com, sender.net.
- **Klassning av varje tal:**
  - `[data]` = grundare-/dataleverantör som räknat på egen kunddata eller stor panel
    (NRF, Triple Whale, Klaviyo, Bluecore, Metrilo, Shopify, Recharge, Smile.io, Postscript,
    Spiegel Research Center).
  - `[leverantör]` = app-/byråblogg som ger råd och riktvärden utan redovisad metod
    (Rivo, TrueProfit, Growth Suite, Eightx, ATTN Agency, Richpanel m.fl.).
  - `[åsikt]` = tal som cirkulerar utan spårbar primärkälla. Används bara som stöd,
    aldrig som tröskel.
- Regel för trösklarna nedan: **bara `[data]`-tal får bestämma en tröskel.**
  `[leverantör]`-tal får bara nyansera texten.
- App-prisuppgifter: bara sådana som stod i sökutdragen. "Gratisnivå" utan belopp
  betyder att det stod att en gratisplan finns, inte vad den rymmer.

Fältnamn i villkoren nedan följer det appen räknar: `repeat_rate`, `customers`,
`ltv_30/60/90/180`, `aov`, `cpa_new`, `max_cpa`, `gross_margin`, `refund_rate`,
`fixed_share`, `mer` (annonskostnad / omsättning), `orders`, `days`.

---

## 1. Återköpsgrad (andel kunder med ≥ 2 ordrar)

### Benchmark (med källa)

| Tal | Källa | Typ |
|---|---|---|
| 28,2 % snitt; spann 9,9 % (lyx) – 65,2 % (livsmedel) | Metrilo, egen kunddata (via Rivo/Opensend-utdrag) | [data] |
| 16,5 % snitt 2023 hos 100+ retailers; hälsa/skönhet 21,5 %, sport 21,2 %, kläder 20,2 % | Bluecore 2024 Customer Growth Benchmark Report (via GlobeNewswire-utdrag) | [data] |
| ~30 % snittretention; "bra" 20–40 % | Shopify blog "average customer retention rate by industry" (utdrag) | [data]/[leverantör] |
| 18,8 % över 156 000 kunder | BS&Co, egen kundportfölj (utdrag) | [data], liten panel |
| Kategoririktvärden: konsumtionsvaror 35–45 %, skönhet 30–40 %, kläder 25–32 %, hem/elektronik 12–25 % | Rivo, TrueProfit (utdrag) | [leverantör] |
| Hälften av alla återköp sker inom 30 dagar; median tid till 2:a köp 15–35 dagar | BS&Co / Finsi (utdrag) | [leverantör] |
| 27 % chans till 2:a köp, 45 % till 3:e, 54 % till 4:e | Cirkulerar (Intempt, Sender, Finsi) utan primärkälla | [åsikt] — använd inte |

Tolkning för dropshipping/one-product-stores: dessa ligger normalt i botten av spannet
(hem/elektronik-typ, 12–25 %). Bluecores 16,5 % är därför en rimlig larmgräns, inte
Metrilos 28 %.

### Regel

- **Varning:** `repeat_rate < 0.15 AND customers >= 200`
- **Info:** `0.15 <= repeat_rate < 0.20 AND customers >= 200`
- **Bra:** `repeat_rate >= 0.25` (visa grön etikett, inget tips)
- Under 200 kunder: visa inget — en handfull återköp flyttar procenten flera enheter.

### Åtgärder

| Åtgärd | Varför / effekt | Källa | Insats | Typ-app |
|---|---|---|---|---|
| Post-purchase-mejlflöde (tack → användartips → återköpserbjudande dag 20–30) | Klaviyo-flöden ger ~41 % av mejlintäkten från 5,3 % av utskicken; RPR 1,94 USD mot 0,11 USD för kampanjer; post-purchase har högst öppningsgrad av alla flöden (51,3 %, 58 % på första mejlet) | Klaviyo Benchmark Report 2025/2026, 183 000+ varumärken (via Darkroom/Geysera-utdrag) [data] | Låg | Shopify Email (gratis ≤ 10 000 mejl/mån), Omnisend (gratis 250 kontakter), Klaviyo (gratis ≤ 250 profiler, ~150 USD/mån vid 10 000) |
| Win-back-flöde till kunder utan köp på 60–90 dagar | Flödeskonvertering 2–5 %, toppkvartil 5–10 %; 4-stegs eskalering 14,7 % kumulativ reaktivering | Eightx (utdrag) [leverantör]; Klaviyo-benchmark via Digital Applied (utdrag) [data, sekundärt] | Låg | Samma mejlverktyg som ovan |
| Lojalitetsprogram (poäng + belöning på 2:a köpet) | Kunder som löser in Smile-belöningar har 56 % högre återköpsgrad, 3,3× köpfrekvens, 16 % högre AOV; Yotpo-kund gick 15 % → 55 % återköp; snitt-ROI 5,3× enligt Yotpo | Smile.io, egen nätverksdata (utdrag) [data]; Yotpo Loyalty Benchmarks (utdrag) [data/leverantör] | Medel | Smile.io (gratisnivå finns), Yotpo Loyalty, Rivo |
| SMS-lista + påfyllnings-/återköpspåminnelse | Övergivna kundvagns-SMS 3,45 USD/meddelande; tresteg återvinner 29 % mot 11 % för ett; 4,2× intäkt/prenumerant för varumärken med ≥ 5 kampanjtyper (Attentive); håll 4–6 SMS/mån | Klaviyo SMS-benchmark, Attentive (utdrag) [data]; Postscript 2025 SMS Commerce Report uppger 71 USD/meddelande (utdrag, låter högt — verifiera) | Medel | Klaviyo SMS, Postscript, Omnisend (60 SMS/mån gratis) |
| Kort i paketet med QR-kod + rabatt på nästa köp | 8–15 % inlösen på rabattkort, 12–18 % QR-skanning, 30–40 % fler recensioner om kortet ber om det | Ecommerce Fastlane, Lawton Connect (utdrag) — inga redovisade paneler | [leverantör]/[åsikt] | Låg | Ingen app; tryckeri. Loggas som COGS |
| Svarstid i kundtjänst < 1 h | 68 % av kunder som får svar inom en timme uppger att de blir mer benägna att köpa igen (Satmetrix); 93 % gör återköp hos företag med utmärkt support (HubSpot 2025); 89 % (Salesforce) | Satmetrix / HubSpot / Salesforce, alla via Desk365/eDesk-utdrag [data, konsumentenkäter] | Medel | Gorgias (spårar köp inom 7 dagar efter supportkontakt), Shopify Inbox (gratis) |
| Prenumeration på förbrukningsvara | En prenumerant är värd ~3× en engångskund; 45 % kvar efter 6 mån, 33 % efter 12; skip/pausa/byt sänker churn 32 % | Recharge State of Subscription Commerce + Subscriber Trends (utdrag) [data] | Hög | Recharge, Appstle, Shopify Subscriptions (gratis) |

---

## 2. LTV per kohort (30/60/90/180 dagar)

### Benchmark (med källa)

Det finns **inga öppna, spårbara LTV-tal per dag-kohort** i det som gick att nå.
Det som finns:

| Tal | Källa | Typ |
|---|---|---|
| Rimlig LTV:CAC ≥ 3:1 | Shopify blog "customer acquisition cost by industry" (utdrag) | [data]/[leverantör] |
| DTC-realistiskt 1,5:1 – 3:1 när LTV räknas på täckningsbidrag; intäkts-LTV överdriver 30–65 % | Eightx (utdrag) | [åsikt], välmotiverad |
| CAC-payback < 90 dagar = utmärkt, 90–180 dagar = normalt för sund DTC | Eightx / Finsi (utdrag) | [leverantör] |
| ~168 USD år 1, ~480 USD över 3 år per kund | bestforecommerce.com (utdrag), okänd primärkälla | [åsikt] — använd inte |
| Prenumerationsbolag: +12 % LTV, +11 % AOV år/år | Recharge (via Swell-utdrag) | [data] |
| Bundle-kunder 2,7× LTV mot enstyckskunder | Skailama/Growth Suite (utdrag) | [leverantör] |
| Lifetimely: kunder ser i snitt +12 % LTV med verktyget | Lifetimely (via ATTN-utdrag) | [leverantör] |

Slutsats: **jämför LTV mot butikens egen CPA och AOV**, inte mot ett externt tal.
Det är också det enda som är ärligt för en one-product-store.

### Regel

- **Kritisk:** `ltv_90 < cpa_new AND cohort_customers >= 100` — kohorten har inte betalat
  sin egen anskaffning efter 90 dagar.
- **Varning:** `ltv_180 < 1.5 * cpa_new AND cohort_customers >= 100`
- **Info ("ingen andra order"):** `ltv_60 < 1.05 * aov AND cohort_customers >= 100` —
  60-dagars-LTV är i praktiken första ordern.
- Om `ltv_*` räknas på intäkt: visa "räknat på intäkt, inte täckningsbidrag" som
  understext (Eightx-poängen ovan).

### Åtgärder

| Åtgärd | Varför / effekt | Källa | Insats | Typ-app |
|---|---|---|---|---|
| Sätt ett andra-köps-erbjudande i post-purchase-flödet dag 14–30 | Halva återköpsvolymen sker inom 30 dagar; median 15–35 dagar — fönstret stängs snabbt | BS&Co / Finsi (utdrag) [leverantör]; Klaviyo-flödesdata [data] | Låg | Klaviyo, Omnisend, Shopify Email |
| Bundle/flerpack som standardval | Bundle-kunder rapporteras ha 2,7× LTV; bundles höjer AOV 20–35 % | Skailama, Growth Suite (utdrag) [leverantör] | Medel | Shopify Bundles (gratis, Shopifys egen), Kaching Bundles, Fly Bundles |
| Prenumeration / "prenumerera och spara" | Prenumerant ≈ 3× engångskund; 45 %/33 % kvar efter 6/12 mån | Recharge (utdrag) [data] | Hög | Recharge, Appstle, Shopify Subscriptions |
| Korsförsäljning via rekommendationer (PDP, kundvagn, mejl) | Rekommendationsklick ≈ 7 % av trafiken, ≈ 26 % av intäkten (Salesforce); upp till 31 % av intäkten (Barilliance) | Salesforce, Barilliance (utdrag) [data/leverantör] | Låg–Medel | Shopify Search & Discovery (gratis), Rebuy, LimeSpot |
| Lojalitetspoäng med utgångsdatum | Belöningsinlösare: 3,3× köpfrekvens, 16 % högre AOV | Smile.io (utdrag) [data] | Medel | Smile.io, Yotpo, Rivo |
| Ny produkt till befintliga kunder (mejl först, annons sen) | Mejl-CAC 8–15 USD mot 318 USD blended | Shopify Global Commerce Report 2026 + Shopify blog (via Ringly/ValueAdd-utdrag) [data] | Hög | Mejlverktyg + sortiment |

---

## 3. AOV (snittordervärde)

### Benchmark (med källa)

| Tal | Källa | Typ |
|---|---|---|
| Shopify globalt 85–92 USD (slutet av 2024); högpresterare ≥ 109 USD; topp > 120 USD | Red Stag Fulfillment / Propel Commerce, hänvisar till Shopify-data (utdrag) | [leverantör], sekundär |
| Lyx/smycken > 300 USD; kläder 40–170 USD; skönhet 15–90 USD | Eevy / Red Stag (utdrag) | [leverantör] |
| Shogun: anonymiserad data från tusentals Shopify-butiker (tal ej i utdraget) | getshogun.com/benchmarks | [data], ej läst |

För StonePNL är extern AOV ointressant — **AOV ska mätas mot butikens egen break-even
per order** (COGS + frakt + CPA). Tipset visas när ordern inte bär sin egen annons.

### Regel

- **Kritisk:** `aov * gross_margin < cpa_new AND orders >= 50` — täckningsbidraget på en
  snittorder räcker inte till att köpa kunden.
- **Varning:** `share_single_item_orders > 0.85 AND orders >= 100` — nästan alla ordrar
  är ett styck; det finns ingen korg att höja.
- **Info:** `free_shipping_threshold IS NULL OR free_shipping_threshold < aov` — tröskeln
  driver inget.

### Åtgärder

| Åtgärd | Varför / effekt | Källa | Insats | Typ-app |
|---|---|---|---|---|
| Fri-frakt-tröskel 15–25 % över nuvarande AOV | AOV +12–24 % i snitt; bästa fall +15–30 % med 5–10 % lägre konvertering → +5–15 % nettointäkt; 58 % av kunder lägger till vara för att nå gränsen; starkast effekt 5–15 USD under gränsen | Growth Suite, Digital Applied, Ryder (utdrag) [leverantör]; 93 % "agerar för fri frakt" cirkulerar utan källa [åsikt] | Låg | Shopify Shipping-inställningar (gratis) + fraktbar i kassan (t.ex. Essential Free Shipping Bar) |
| Flerpack / bundle med rabatt (2-pack, 3-pack) | Bundles +20–35 % AOV på Shopify; Flex Bundles-ordrar 82,7 % högre AOV; case: Elizabeth Mott 19 → 44,56 USD | Growth Suite, Skailama, Flex Bundles (utdrag) [leverantör] | Låg–Medel | Shopify Bundles (gratis), Kaching, Fly Bundles |
| Post-purchase-upsell (erbjudande efter betalning, ett klick) | Konverterar 3–8 %; ReConvert rapporterar +5,6 % AOV; AfterSell-case 8–15 % konvertering och +15 % AOV; relevant erbjudande konverterar 3–5× bättre än generiskt | ReConvert, AfterSell, Qikify (utdrag) [leverantör, casedata] | Låg | ReConvert, AfterSell (Rokt), Checkout Champ |
| Rekommendationer i kundvagn/PDP | ≈ 26 % av intäkten från 7 % av trafiken | Salesforce (utdrag) [data] | Låg | Shopify Search & Discovery (gratis), Rebuy |
| Kvantitetsrabatt på produktsidan | Samma mekanik som bundle; rapporterat spann 20–30 % | Growth Suite (utdrag) [leverantör] | Låg | Kaching Bundles, Fly Bundles |
| Lojalitetskupong i stället för rak rabatt | Smile-kuponger ger 16 % högre AOV än andra kuponger | Smile.io (utdrag) [data] | Medel | Smile.io |

---

## 4. CPA per ny kund vs max-CPA

### Benchmark (med källa)

| Tal | Källa | Typ |
|---|---|---|
| Blended CAC 274 → 318 USD (+16,1 %) över 4,8 miljoner handlare; median-ROAS 2,04 | Shopify Global Commerce Report 2026 (via Ringly/ValueAdd-utdrag) | [data] |
| CAC per bransch: konst/underhållning 21 USD, livsmedel 53 USD, elektronik ~377 USD | Shopify blog "CAC by industry" (utdrag) | [data] |
| E-handel snitt 68–84 USD, +60 % på fem år | LoyaltyLion / Userpilot (utdrag) | [leverantör] |
| Meta-CPM rekord 22,98 USD Q4 2025; Google Shopping-CPC +33,7 % 2025 | Ringly-utdrag, okänd primärkälla | [åsikt] |
| Mejl-CAC 8–15 USD, ROI 45:1 i retail | Shopify blog (via Ringly-utdrag) | [data]/[leverantör] |
| LTV:CAC ≥ 3:1 | Shopify (utdrag) | [data] |

Appen har redan `max_cpa` (break-even) — det är den enda benchmark som gäller.

### Regel

- **Kritisk:** `cpa_new > max_cpa` mätt på `days >= 7 AND new_customers >= 30`
- **Varning:** `cpa_new > 0.85 * max_cpa` under samma fönster
- **Info:** `cpa_new <= max_cpa AND ltv_90 > 1.5 * cpa_new` → "Du har utrymme att höja
  budgeten" (visa bara när LTV-kohorten har ≥ 100 kunder).
- Räkna alltid mot break-even, aldrig mot ett target — samma princip som i
  `docs/os/ANALYSMETOD.md`.

### Åtgärder

| Åtgärd | Varför / effekt | Källa | Insats | Typ-app |
|---|---|---|---|---|
| Fler och synligare recensioner på produktsidan | Sidor med 5 recensioner konverterar 270 % bättre än utan; +190 % för billiga, +380 % för dyra varor; "verified buyer" +15 %; optimalt snitt 4,2–4,5 stjärnor | Spiegel Research Center (Northwestern) + PowerReviews (utdrag) [data] | Låg | Judge.me (gratisnivå), Loox, Yotpo Reviews |
| Höj AOV på första ordern (bundle som standard) | Samma CPA, större första order → lägre CPA i förhållande till TB; bundles +20–35 % AOV | Growth Suite/Skailama (utdrag) [leverantör] | Låg–Medel | Shopify Bundles |
| Flytta återköpen till mejl/SMS så annonsbudgeten bara köper nya kunder | Mejl-CAC 8–15 USD; flöden 18× RPR mot kampanjer | Shopify blog, Klaviyo (utdrag) [data] | Låg | Klaviyo, Omnisend, Shopify Email |
| Räkna om max-CPA på 90-dagars-LTV i stället för första ordern | Payback < 90 dagar = utmärkt; 90–180 normalt | Eightx/Finsi (utdrag) [leverantör] | Låg | StonePNL själv (visa `ltv_90` bredvid `max_cpa`) |
| Referral-program (kund bjuder in kund) | Ingen siffra i det som gick att nå — märk som gissning | — | [åsikt] | Medel | Smile.io, Yotpo, ReferralCandy |
| Testa nya creatives i separat test-ABO | Repots egen regel 11 (Axels beslut 2026-08-12) | CLAUDE.md | [grundare] | Medel | Meta Ads |

---

## 5. Bruttomarginal (1 − COGS-andel)

### Benchmark (med källa)

| Tal | Källa | Typ |
|---|---|---|
| E-handel snitt ~45 % bruttomarginal 2024 | Opensend "product margin statistics" (utdrag), primärkälla ej synlig | [leverantör] |
| Typisk e-handel 55–70 % brutto, 33–51 % täckningsbidrag, 18–26 % netto | TrueProfit, Ask Luca (utdrag) | [leverantör] |
| Dropshipping: mål 65–70 % brutto, 15–25 % netto (TrueProfit) **mot** 30–40 % brutto, ~20 % netto (Do Dropshipping) | Två leverantörsbloggar, motsäger varandra | [leverantör] |
| Sunda riktvärden 40–60 % brutto beroende på kategori; rörelsemarginal 5–15 % | ATTN Agency / Level CFO 2026 (utdrag) | [leverantör] |
| Median-ROAS 2,04 "täcker knappt COGS, frakt och overhead" | Shopify Global Commerce Report 2026 (utdrag) | [data] |

Inget `[data]`-tal för bruttomarginal gick att nå. Tröskeln nedan härleds i stället
**aritmetiskt ur två `[data]`-tal**: median-MER 41 % (Triple Whale) + fasta kostnader.
Med 41 % till annons och ~10 % fast måste bruttomarginalen vara ≥ ~55 % för att något
ska bli kvar. Det är en härledning, inte ett uppmätt riktvärde — skriv det så.

### Regel

- **Kritisk:** `gross_margin < 0.35 AND orders >= 30`
- **Varning:** `gross_margin < 0.50 AND orders >= 30`
- **Info (kombinerad):** `gross_margin - mer - fixed_share < 0.10` → "Mindre än 10 %
  blir kvar efter annons och fasta kostnader" (bäst av alla tips i appen — det är hela
  P&L:en i en rad).

### Åtgärder

| Åtgärd | Varför / effekt | Källa | Typ | Insats | Typ-app |
|---|---|---|---|---|---|
| Omförhandla inköpspris / större MOQ när volymen är bevisad | Sänker COGS direkt; ingen siffra i underlaget | — | [åsikt] | Medel | Ingen |
| Sälj flerpack — frakt och plock delas på fler enheter | Bundles +20–35 % AOV; fraktkostnaden är i stor del fast per paket | Growth Suite (utdrag) | [leverantör] | Låg | Shopify Bundles |
| Höj priset i steg och mät konverteringen (A/B) | Axelbältet 509 → 599 kr 2026-08-05 utan larm i data | Repots egen historik (CLAUDE.md) | [grundare] | Låg | Shopify prissättning; ägarbeslut (regel 12) |
| Skär i rabattdjupet: lojalitetspoäng i stället för rak procent | Smile-kuponger: +16 % AOV mot andra kuponger | Smile.io (utdrag) | [data] | Låg | Smile.io |
| Ta bort SKU:er med negativt täckningsbidrag | StonePNL visar TB per produkt — sortera stigande | Appens egna data | [grundare] | Låg | StonePNL |
| Byt fraktlösning / 3PL för lägre kostnad per paket | Ingen siffra i underlaget | — | [åsikt] | Hög | — |

---

## 6. Återbetalningsandel (refunds / intäkt eller returnerade ordrar / ordrar)

### Benchmark (med källa)

| Tal | Källa | Typ |
|---|---|---|
| Online-returer 19,3 % 2025 (17,6 % 2024); all detaljhandel 15,8 % = 849,9 mdr USD | NRF 2025 Retail Returns Landscape (via Digital Commerce 360 / Richpanel-utdrag) | [data] |
| Kategorier: kläder 20–40 %, skor 17–30 %, elektronik 8–15 %, skönhet 4–12 % | Richpanel m.fl. (utdrag) | [leverantör] |
| Loop Returns: 13,8 milj. returer hos 4 000+ handlare ligger bakom flera av branschsiffrorna | via Claimlane-utdrag | [data], ej läst |
| Sverige: nära en tredjedel har returnerat nyligen; 54 % av 18–29-åringar mot 17 % av 50–64; > 60 % av returerna digitala | PostNord E-barometern 2024 (utdrag) | [data], konsumentandel — inte orderandel |

Ingen svensk **orderbaserad** returgrad hittades i det som gick att nå.

### Regel

- **Kritisk:** `refund_rate > 0.20 AND orders >= 50`
- **Varning:** `refund_rate > 0.10 AND orders >= 50` (icke-kläder; appen känner inte
  kategori, så 10 % är golvet där ett tips fortfarande är rimligt för alla branscher)
- **Info:** `refund_rate` stigande > 3 procentenheter mot föregående 30 dagar med
  `orders >= 100` → "Kolla senaste leveransbatchen / leverantören".

### Åtgärder

| Åtgärd | Varför / effekt | Källa | Typ | Insats | Typ-app |
|---|---|---|---|---|---|
| Storleksguide skriven ur egna returorsaker; "går liten — ta en storlek större" på PDP | AI-/fit-verktyg rapporteras sänka storleksrelaterade returer 20–50 % (upp till 64 %) | Claimlane, Fit Analytics, YourSizer (utdrag) | [leverantör] | Låg (text) / Hög (verktyg) | Kiwi Size Chart, Fit Analytics |
| Erbjud byte eller tillgodo i stället för återbetalning | Behåller försäljningen; dämpar bedrägliga returer | Claimlane, med Loop Returns-data i botten (utdrag) | [leverantör] | Medel | Loop Returns, ReturnZap, Shopify egen returportal (gratis) |
| Sätt förväntan om leveranstid i orderbekräftelsen (dropshipping-specifikt) | Ingen siffra i underlaget; grundat i att "expectation gaps" driver returer (NRF-kontext) | NRF via Richpanel (utdrag) | [åsikt] | Låg | Shopify Email, Klaviyo |
| Anpassad förpackning / insert med bruksanvisning | 26 % fler återköp, 15 % färre returer, 40 % fler sociala omnämnanden — utan redovisad panel | Launch My Store (utdrag) | [åsikt] | Låg | Tryckeri |
| Analysera returorsaker per SKU månadsvis | Rätt startpunkt för alla andra åtgärder | Claimlane (utdrag) | [leverantör] | Låg | Shopify Returns-rapport, Loop |
| Recensioner med foto från riktiga kunder på PDP | Ökar träffsäkerheten i förväntan; konverteringseffekt enligt Spiegel | Spiegel/PowerReviews (utdrag) | [data] (konvertering, ej returer) | Låg | Judge.me, Loox |

---

## 7. Fasta kostnaders andel av omsättningen

### Benchmark (med källa)

| Tal | Källa | Typ |
|---|---|---|
| SaaS, löner, hyra, overhead 8–12 % av omsättningen för DTC i skala | Eightx (utdrag) | [leverantör] |
| Rörelsekostnader (opex) 25–40 % av omsättningen = sunt spann | ATTN Agency / Top Growth Marketing (utdrag) | [leverantör] |
| De flesta DTC-bolag < 10 MUSD ligger på 0–5 % marginal eller negativt | ATTN Agency 2026 (utdrag) | [leverantör] |
| Fasta marknadskostnader (byrå, kreativ produktion, team) +32 % 2025 för 5–25 MUSD-bolag medan ROAS föll ~9 % | ATTN Agency (utdrag) | [leverantör] |
| Under 5 MUSD: hög volatilitet — använd riktvärden som riktning, inte facit | Commerce Catalyst (utdrag) | [leverantör] |

Inget `[data]`-tal. Trösklarna nedan är satta så att de träffar när fasta kostnader
äter det som normalt är nettomarginalen (5–15 %).

### Regel

- **Kritisk:** `fixed_share > 0.25 AND days >= 30`
- **Varning:** `fixed_share > 0.15 AND days >= 30`
- **Info:** `fixed_share` ökade > 3 procentenheter mot föregående månad → "Ny fast kostnad
  eller fallande omsättning — vilket?"

### Åtgärder

| Åtgärd | Varför / effekt | Källa | Typ | Insats | Typ-app |
|---|---|---|---|---|---|
| App-revision: säg upp Shopify-appar utan mätbar intäkt | Appavgifter är den enda fasta kostnaden som går att kapa samma dag | — | [åsikt] | Låg | Shopify Admin → Apps |
| Slå ihop mejl + SMS + popup i ett verktyg | Klaviyo fakturerar sedan feb 2025 på alla aktiva profiler (även avregistrerade) — dubbla verktyg dubblar kostnaden | Digital Heroes / Dreamlit (utdrag) | [leverantör] | Låg | Klaviyo eller Omnisend, inte båda |
| Byt till gratisnivåer där volymen tillåter | Shopify Email gratis ≤ 10 000 mejl/mån, därefter 1 USD/1 000; Omnisend gratis 250 kontakter | Dreamlit, MercadoKit (utdrag) | [leverantör] | Låg | Shopify Email, Omnisend Free |
| Gör byråkostnad rörlig (procent av spend/vinst) | Fasta marknadskostnader steg 32 % 2025 medan ROAS föll | ATTN Agency (utdrag) | [leverantör] | Medel | — |
| Höj omsättningen med befintlig kostnadsbas (retention, AOV) | Fasta kostnader späds ut; se metrik 1–3 | — | [grundare] | Medel | — |

---

## 8. Annonskostnadsandel (MER = ad spend / omsättning)

### Benchmark (med källa)

| Tal | Källa | Typ |
|---|---|---|
| Median-MER 41 % 2025 (annons = 41 % av omsättningen); per bransch: bil 27 %, kläder 36 %, hälsa 51 %, husdjur 52 % | Triple Whale 2025 Ecommerce Benchmarks (utdrag) — obs Triple Whale visar MER inverterat, som andel | [data] |
| Median-ROAS 2,04 ⇔ ~49 % annonsandel | Shopify Global Commerce Report 2026 (utdrag) | [data] |
| Nya kunder vs blended: mät "new-customer MER" separat | Adsights / MHI (utdrag) | [leverantör] |

### Regel

Bäst är att relatera MER till marginalen, inte till branschen:

- **Kritisk:** `mer > gross_margin - fixed_share AND days >= 14` — annonserna äter mer än
  hela täckningsbidraget; butiken förlorar på varje krona omsättning.
- **Varning:** `mer > 0.40 AND days >= 14` (över Triple Whales median).
- **Info:** `mer < 0.25 AND cpa_new < max_cpa AND ltv_90 > 1.5 * cpa_new` → "Under
  branschmedian och lönsamt — utrymme att skala."

### Åtgärder

| Åtgärd | Varför / effekt | Källa | Typ | Insats | Typ-app |
|---|---|---|---|---|---|
| Flytta återköp till mejl/SMS så de inte köps med annons | Flöden 18× RPR mot kampanjer; mejl-CAC 8–15 USD | Klaviyo, Shopify blog (utdrag) | [data] | Låg | Klaviyo, Omnisend, Shopify Email |
| Höj AOV (bundle, fri-frakt-tröskel) — samma spend, mer omsättning | +12–35 % AOV i spannen ovan | Growth Suite m.fl. (utdrag) | [leverantör] | Låg | Shopify Bundles |
| Separera "ny kund"-MER från blended och styr budget på den | Blended MER döljer att återköp bär annonsen | Adsights / MHI (utdrag) | [leverantör] | Låg | StonePNL: visa `cpa_new` bredvid `mer` |
| Skala bara annonser med positivt vinstbidrag `(max_cpa − cpa) × köp` | Repots analysmetod; enmetriks-domar förbjudna | `docs/os/ANALYSMETOD.md` | [grundare] | Medel | Meta Ads |
| Recensioner på PDP höjer konvertering utan mer spend | +270 % konvertering vid 5 recensioner | Spiegel/PowerReviews (utdrag) | [data] | Låg | Judge.me |
| Lojalitet/SMS för återkommande intäkt utan annons | Smile: 3,3× köpfrekvens; Attentive: 4,2× intäkt/prenumerant | Smile.io, Attentive (utdrag) | [data] | Medel | Smile.io, Postscript |

---

## Regler att koda

Fält: `repeat_rate`, `customers`, `cohort_customers`, `ltv_60`, `ltv_90`, `ltv_180`,
`aov`, `share_single_item_orders`, `free_shipping_threshold`, `cpa_new`, `max_cpa`,
`new_customers`, `gross_margin`, `refund_rate`, `refund_rate_prev30`, `fixed_share`,
`fixed_share_prev_month`, `mer`, `orders`, `days`. Andelar är 0–1.
`severity`: `critical` | `warning` | `info` | `good`.

```
[
 { id:"repeat_low", metric:"repeat_rate", condition:"repeat_rate < 0.15 && customers >= 200", severity:"warning",
   tip_en:"Fewer than 15% of customers buy twice. Add a post-purchase email flow with a day-20 reorder offer.",
   tip_sv:"Under 15 % köper igen. Lägg ett post-purchase-mejlflöde med återköpserbjudande dag 20.",
   source:"Bluecore 2024 (16.5% avg); Klaviyo Benchmark 2025/26 (flows RPR $1.94 vs $0.11)" },

 { id:"repeat_mid", metric:"repeat_rate", condition:"repeat_rate >= 0.15 && repeat_rate < 0.20 && customers >= 200", severity:"info",
   tip_en:"Repeat rate is below the 28% ecommerce average. A win-back email at day 60 typically converts 2–5%.",
   tip_sv:"Återköpsgraden ligger under snittet 28 %. Ett win-back-mejl dag 60 konverterar normalt 2–5 %.",
   source:"Metrilo (28.2%); Eightx win-back benchmarks" },

 { id:"repeat_good", metric:"repeat_rate", condition:"repeat_rate >= 0.25 && customers >= 200", severity:"good",
   tip_en:"Repeat rate is above average. Protect it: keep support replies under one hour.",
   tip_sv:"Återköpsgraden är över snittet. Skydda den: svara kundtjänst inom en timme.",
   source:"Metrilo 28.2%; Satmetrix (68% more likely to repeat if answered within 1h)" },

 { id:"ltv90_below_cpa", metric:"ltv_90", condition:"ltv_90 < cpa_new && cohort_customers >= 100", severity:"critical",
   tip_en:"Customers have not paid back their acquisition cost after 90 days. Add a second-order offer and cross-sell.",
   tip_sv:"Kunderna har inte betalat sin anskaffning efter 90 dagar. Lägg in andra-köps-erbjudande och korsförsäljning.",
   source:"Eightx/Finsi payback <90d excellent, 90–180d typical; Salesforce recs 26% of revenue" },

 { id:"ltv180_thin", metric:"ltv_180", condition:"ltv_180 < 1.5 * cpa_new && cohort_customers >= 100", severity:"warning",
   tip_en:"180-day LTV is under 1.5× CPA. Test a bundle or subscription; subscribers are worth ~3× one-time buyers.",
   tip_sv:"180-dagars-LTV under 1,5× CPA. Testa bundle eller prenumeration; prenumeranter är värda ~3× engångskunder.",
   source:"Shopify LTV:CAC 3:1; Recharge Subscriber Trends (3x)" },

 { id:"ltv60_flat", metric:"ltv_60", condition:"ltv_60 < 1.05 * aov && cohort_customers >= 100", severity:"info",
   tip_en:"No second orders within 60 days. Half of all repeat buys happen in 30 days—send the reorder offer earlier.",
   tip_sv:"Inga andra ordrar inom 60 dagar. Hälften av återköpen sker inom 30 dagar — skicka erbjudandet tidigare.",
   source:"BS&Co/Finsi time-to-second-purchase; Klaviyo post-purchase open rate 51%" },

 { id:"aov_below_breakeven", metric:"aov", condition:"aov * gross_margin < cpa_new && orders >= 50", severity:"critical",
   tip_en:"Gross profit per order is below CPA. Make a 2-pack the default offer; bundles lift AOV 20–35%.",
   tip_sv:"Bruttovinsten per order är lägre än CPA. Gör 2-pack till standard; bundles höjer AOV 20–35 %.",
   source:"Growth Suite/Skailama bundle data; Shopify Bundles (free)" },

 { id:"aov_single_item", metric:"share_single_item_orders", condition:"share_single_item_orders > 0.85 && orders >= 100", severity:"warning",
   tip_en:"Over 85% of orders are one item. Add a post-purchase upsell—they convert 3–8% with one click.",
   tip_sv:"Över 85 % av ordrarna är ett styck. Lägg en post-purchase-upsell — de konverterar 3–8 % med ett klick.",
   source:"ReConvert (+5.6% AOV), AfterSell cases, Qikify" },

 { id:"aov_no_threshold", metric:"free_shipping_threshold", condition:"free_shipping_threshold == null || free_shipping_threshold < aov", severity:"info",
   tip_en:"Set free shipping 15–25% above your AOV. Thresholds lift AOV 12–24% on average.",
   tip_sv:"Sätt fri frakt 15–25 % över ditt AOV. Trösklar höjer AOV 12–24 % i snitt.",
   source:"Growth Suite / Digital Applied / Ryder (vendor guidance)" },

 { id:"cpa_over_max", metric:"cpa_new", condition:"cpa_new > max_cpa && days >= 7 && new_customers >= 30", severity:"critical",
   tip_en:"You pay more per new customer than break-even. Pause ads below break-even; add reviews—5 reviews lift conversion 270%.",
   tip_sv:"Du betalar mer per ny kund än break-even. Pausa annonser under break-even; lägg till recensioner — 5 st höjer konvertering 270 %.",
   source:"Spiegel Research Center/PowerReviews; repo ANALYSMETOD (break-even, not target)" },

 { id:"cpa_near_max", metric:"cpa_new", condition:"cpa_new > 0.85 * max_cpa && cpa_new <= max_cpa && days >= 7 && new_customers >= 30", severity:"warning",
   tip_en:"CPA is within 15% of break-even. Move repeat buyers to email so ads only buy new customers.",
   tip_sv:"CPA ligger inom 15 % från break-even. Flytta återköpen till mejl så annonsen bara köper nya kunder.",
   source:"Shopify blog email CAC $8–15; Klaviyo flows 18x RPR" },

 { id:"cpa_headroom", metric:"cpa_new", condition:"cpa_new <= max_cpa && ltv_90 > 1.5 * cpa_new && cohort_customers >= 100", severity:"good",
   tip_en:"90-day LTV is 1.5× CPA. You have room to raise the budget on ads with positive profit contribution.",
   tip_sv:"90-dagars-LTV är 1,5× CPA. Du har utrymme att höja budgeten på annonser med positivt vinstbidrag.",
   source:"Eightx payback benchmarks; repo ANALYSMETOD" },

 { id:"margin_critical", metric:"gross_margin", condition:"gross_margin < 0.35 && orders >= 30", severity:"critical",
   tip_en:"Gross margin under 35% cannot fund ads at the 41% median MER. Renegotiate COGS or raise price.",
   tip_sv:"Bruttomarginal under 35 % bär inte annons vid median-MER 41 %. Omförhandla inköp eller höj priset.",
   source:"Derived from Triple Whale 2025 median MER 41%; ATTN/Level CFO 40–60% guidance" },

 { id:"margin_low", metric:"gross_margin", condition:"gross_margin >= 0.35 && gross_margin < 0.50 && orders >= 30", severity:"warning",
   tip_en:"Gross margin under 50%. Sell multipacks so shipping and pick cost spread over more units.",
   tip_sv:"Bruttomarginal under 50 %. Sälj flerpack så frakt och plock delas på fler enheter.",
   source:"Growth Suite bundle data; ecommerce avg ~45% (Opensend, secondary)" },

 { id:"margin_squeeze", metric:"gross_margin", condition:"gross_margin - mer - fixed_share < 0.10 && days >= 30", severity:"warning",
   tip_en:"Less than 10% is left after ads and fixed costs. Cut discount depth; use loyalty points instead.",
   tip_sv:"Under 10 % blir kvar efter annons och fasta kostnader. Minska rabattdjupet; använd lojalitetspoäng i stället.",
   source:"Smile.io (+16% AOV on loyalty coupons); Shopify median ROAS 2.04" },

 { id:"refund_critical", metric:"refund_rate", condition:"refund_rate > 0.20 && orders >= 50", severity:"critical",
   tip_en:"Refunds above 20%—higher than the 19% online average. Review return reasons per SKU and offer exchanges first.",
   tip_sv:"Återbetalningar över 20 % — högre än online-snittet 19 %. Gå igenom returorsaker per produkt och erbjud byte först.",
   source:"NRF 2025 Retail Returns Landscape (19.3% online); Claimlane/Loop Returns" },

 { id:"refund_high", metric:"refund_rate", condition:"refund_rate > 0.10 && refund_rate <= 0.20 && orders >= 50", severity:"warning",
   tip_en:"Refunds above 10%. Write the size/fit note from your own return data; fit tools cut fit returns 20–50%.",
   tip_sv:"Återbetalningar över 10 %. Skriv storleksrådet ur dina egna returer; fit-verktyg sänker passformsreturer 20–50 %.",
   source:"Claimlane / Fit Analytics (vendor); NRF category context" },

 { id:"refund_rising", metric:"refund_rate", condition:"refund_rate - refund_rate_prev30 > 0.03 && orders >= 100", severity:"info",
   tip_en:"Refund rate rose 3 points in 30 days. Check the latest supplier batch and delivery-time promise.",
   tip_sv:"Återbetalningsandelen steg 3 punkter på 30 dagar. Kolla senaste leverantörsbatchen och leveranslöftet.",
   source:"NRF (expectation gaps drive returns) — tactic is opinion" },

 { id:"fixed_critical", metric:"fixed_share", condition:"fixed_share > 0.25 && days >= 30", severity:"critical",
   tip_en:"Fixed costs eat 25%+ of revenue. Cancel apps without measurable revenue and merge email/SMS into one tool.",
   tip_sv:"Fasta kostnader tar 25 %+ av omsättningen. Säg upp appar utan mätbar intäkt och slå ihop mejl/SMS i ett verktyg.",
   source:"Eightx 8–12% at scale; ATTN opex 25–40% (vendor)" },

 { id:"fixed_high", metric:"fixed_share", condition:"fixed_share > 0.15 && fixed_share <= 0.25 && days >= 30", severity:"warning",
   tip_en:"Fixed costs above 15% of revenue. Shopify Email is free to 10,000 emails/month—check paid tools.",
   tip_sv:"Fasta kostnader över 15 % av omsättningen. Shopify Email är gratis upp till 10 000 mejl/mån — se över betalverktygen.",
   source:"Dreamlit/MercadoKit pricing (vendor); Eightx" },

 { id:"fixed_jump", metric:"fixed_share", condition:"fixed_share - fixed_share_prev_month > 0.03", severity:"info",
   tip_en:"Fixed-cost share jumped 3 points. New subscription, or falling revenue? Check both.",
   tip_sv:"Fasta kostnaders andel hoppade 3 punkter. Ny abonnemangskostnad eller fallande omsättning? Kolla båda.",
   source:"Internal logic" },

 { id:"mer_over_margin", metric:"mer", condition:"mer > gross_margin - fixed_share && days >= 14", severity:"critical",
   tip_en:"Ads cost more than your full contribution margin. Scale only ads with positive profit contribution.",
   tip_sv:"Annonserna kostar mer än hela täckningsbidraget. Skala bara annonser med positivt vinstbidrag.",
   source:"Repo ANALYSMETOD; Shopify median ROAS 2.04" },

 { id:"mer_above_median", metric:"mer", condition:"mer > 0.40 && mer <= gross_margin - fixed_share && days >= 14", severity:"warning",
   tip_en:"Ads take over 40% of revenue—above the 41% median. Grow email/SMS revenue; flows earn 18× per recipient.",
   tip_sv:"Annons tar över 40 % av omsättningen — över medianen 41 %. Öka mejl/SMS-intäkten; flöden ger 18× per mottagare.",
   source:"Triple Whale 2025 (median MER 41%); Klaviyo Benchmark" },

 { id:"mer_headroom", metric:"mer", condition:"mer < 0.25 && cpa_new < max_cpa && ltv_90 > 1.5 * cpa_new && cohort_customers >= 100", severity:"good",
   tip_en:"Ad share is well under the 41% median and profitable. Room to scale proven ads.",
   tip_sv:"Annonsandelen är långt under medianen 41 % och lönsam. Utrymme att skala bevisade annonser.",
   source:"Triple Whale 2025; repo rule 11 (scale winners in CBO)" }
]
```

Antal regler: **25** (8 metriker × 3 nivåer + `margin_squeeze`).

Prioritet när flera regler slår samtidigt: `critical` > `warning` > `info` > `good`; inom
samma nivå visas ordningen `cpa_new`, `mer`, `gross_margin`, `aov`, `refund_rate`,
`repeat_rate`, `ltv_*`, `fixed_share` (pengar som blöder nu före pengar som saknas
senare). Visa max ett tips per metrik och max tre totalt — Axels svarsregel gäller
även i appen.

---

## Källförteckning

Alla lästa som sökmotorutdrag 2026-09-08; primärsidorna blockerade av proxyn.

**[data] — dataleverantörer / primärrapporter**
1. Triple Whale, *2025 Ecommerce Benchmarks* — median-MER 41 %, per bransch 27–52 %. triplewhale.com/2025-ecommerce-benchmarks (blockerad; via farabiulder.com, eightx.co)
2. Shopify, *Global Commerce Report 2026* — CAC 274 → 318 USD, median-ROAS 2,04. (via ringly.io, valueaddvc.com)
3. Shopify blog, *Customer Acquisition Costs by Industry (2025)* — CAC per bransch, LTV:CAC 3:1. shopify.com/blog/customer-acquisition-cost-by-industry (blockerad)
4. Shopify blog, *Average Customer Retention Rates by Industry* — ~30 % snitt. shopify.com/blog/average-customer-retention-rate-by-industry (blockerad)
5. Klaviyo, *Benchmark Report 2025/2026* (183 000+ varumärken) — flöden 41 % av intäkt från 5,3 % sändningar, RPR 1,94 vs 0,11 USD, post-purchase öppning 51,3 %, abandoned cart RPR 3,65 USD, welcome 2,65 USD. klaviyo.com/marketing-resources/ecommerce-benchmarks + klaviyocms.wpengine.com/…/2025-Benchmark-Report_AMER.pdf (blockerade; via darkroomagency.com, geysera.com, bsandco.us)
6. Klaviyo, *SMS Marketing Benchmarks* — 3,45 USD/abandoned-cart-SMS, 29 % vs 11 % återvinning. klaviyo.com/products/sms-marketing/benchmarks (blockerad)
7. Bluecore, *2024 Customer Growth Benchmark Report* — 16,5 % återköp 2023, kategorier. globenewswire.com 2024-04-16 (blockerad)
8. Metrilo, *Repeat purchase rate for ecommerce brands* — 28,2 %, 9,9–65,2 %. metrilo.com/blog/repeat-purchase-rate (blockerad; via rivo.io, opensend.com)
9. NRF & Happy Returns, *2025 Retail Returns Landscape* — online 19,3 % (2025), 17,6 % (2024), 15,8 % totalt. digitalcommerce360.com 2025-10-24 (blockerad; via richpanel.com)
10. Recharge, *State of Subscription Commerce* + *Subscriber Trends* — prenumerant ≈ 3× engångskund, 45 %/33 % retention 6/12 mån, +12 % LTV. getrecharge.com, prnewswire.com (blockerade; via swell.is)
11. Smile.io, egen nätverksdata (1,1 mdr shoppare, 250 000 varumärken) — +56 % återköp, 3,3× frekvens, +16 % AOV. blog.smile.io (blockerad)
12. Spiegel Research Center (Northwestern) & PowerReviews, *How Online Reviews Influence Sales* — +270 % konvertering vid 5 recensioner, +190/+380 %, verified buyer +15 %, 4,2–4,5 stjärnor. spiegel.medill.northwestern.edu (blockerad; via adweek.com, eevy.ai)
13. Salesforce — rekommendationsklick 7 % av trafik, 26 % av intäkt. salesforce.com/commerce/product-recommendation-engine
14. Postscript, *2025 SMS Commerce Report* — "71 USD per meddelande, 45× ROI" (via launchmystore.io; verifiera). postscript.io/sms-benchmarks (blockerad)
15. Attentive — 4,2× intäkt/prenumerant vid ≥ 5 kampanjtyper. (via sakari.io-utdrag)
16. PostNord & HUI, *E-barometern 2024* — returbeteende Sverige. postnord.se (blockerad)
17. Satmetrix / HubSpot 2025 / Salesforce — kundtjänst-svarstid och återköp (68 %, 93 %, 89 %). (via desk365.io, edesk.com)
18. Loop Returns — 13,8 milj. returer, 4 000+ handlare. (via claimlane.com)

**[leverantör] — app-/byråbloggar**
19. Rivo, *Repeat Purchase Rate: Complete Guide* — kategoririktvärden. rivo.io (blockerad)
20. TrueProfit — returning customer rate, dropshipping-marginaler. trueprofit.io (blockerad)
21. Eightx — win-back-benchmarks, LTV:CAC, payback, fasta kostnader 8–12 %. eightx.co (blockerad)
22. Growth Suite — fri-frakt-tröskel, bundles, kvantitetsrabatt. growthsuite.net (blockerad)
23. Digital Applied — fri frakt +15–30 %, win-back 14,7 %. digitalapplied.com
24. Skailama — bundles +20–35 % AOV, bundle-kunder 2,7× LTV. skailama.com
25. ReConvert / AfterSell / Qikify — post-purchase-upsell 3–8 %, +5,6 % AOV, cases. aftersell.com, qikify.com
26. Richpanel — returgrad per kategori. richpanel.com (blockerad)
27. Claimlane / Fit Analytics / YourSizer — storleksguider, 20–50 % (upp till 64 %). claimlane.com (blockerad), fitanalytics.com
28. ATTN Agency, *DTC Profitability Benchmarks 2026* — opex, marginaler, fasta marknadskostnader +32 %. attnagency.com (blockerad)
29. Level CFO, *Ecommerce & DTC Financial Benchmarks 2026* (PDF). levelcfo.com (blockerad)
30. Opensend — produktmarginal ~45 %, returstatistik. opensend.com (blockerad)
31. Red Stag Fulfillment / Propel Commerce / Eevy — AOV-riktvärden Shopify. redstagfulfillment.com (blockerad)
32. Dreamlit / MercadoKit / Digital Heroes — priser Shopify Email, Omnisend, Klaviyo.
33. BS&Co — 18,8 % återköp över 156 000 kunder; tid till 2:a köp. bsandco.us (blockerad)
34. Yotpo, *Loyalty Program Benchmarks Report* + case studies — 15 → 55 %, ROI 5,3×. yotpo.com (blockerad)
35. Lifetimely (via ATTN) — +12 % LTV, benchmarkfunktion. attnagency.com (blockerad)
36. LoyaltyLion / Userpilot — CAC 68–84 USD.

**[åsikt] — cirkulerande tal utan spårbar primärkälla (används inte som tröskel)**
37. "27 % / 45 % / 54 %" nästa-köps-sannolikhet (intempt.com, sender.net, finsi.ai)
38. Ecommerce Fastlane — "0,47 USD insert → 23 % högre återköp". ecommercefastlane.com (blockerad)
39. Launch My Store — förpackning +26 % återköp, −15 % returer. launchmystore.io
40. bestforecommerce.com — LTV 168 USD år 1 / 480 USD 3 år.

**Interna källor**
41. `CLAUDE.md` (regel 11 test-ABO, regel 12 ägarbeslut, prishistorik axelbältet)
42. `docs/os/ANALYSMETOD.md` (vinstbidrag, break-even i stället för target)
