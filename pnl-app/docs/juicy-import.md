# Juicy → StonePNL: flytta COGS på max 3 klick

> **Status 2026-09-08 (build ltv-v67): scenario A byggt** — kortet "Kommer du
> från Juicy?" överst på Kostnader-sidan (läge A vid ≥ 90 % täckning med
> "Ser rätt ut" → `ShopSettings.juicyCardDismissedAt`; läge B pekar på den
> befintliga dropzonen). Scenario B (Juicy-adapter) väntar fortfarande på en
> riktig exportfil från Axel — avsnitt 6.
>
> **Build ai-cogs-v70:** i väntan på exportfilen läser en AI av en skärmbild
> (eller inklistrad text) av Juicys kostnadstabell och mappar raderna mot
> butikens produkttitlar — kortet "Låt AI läsa av din gamla app" på
> Kostnader. Kräver `ANTHROPIC_API_KEY` på tjänsten. Se `CLAUDE.md`.

Research + design, 2026-09-07. Ingen kod är ändrad. Axels mål, i andemening:
*"alla som använder Juicy sedan tidigare ska på max 3 knapptryck få in sina
nuvarande COGS i vår app utan manuella grejer."*

Kort version: **det som redan ligger i Shopifys "Cost per item" läser vi i dag
med noll klick.** Det som bara Juicy känner till (flerpack, historik, landspris)
kräver Juicys egen exportfil — och den har ingen utanför Juicy sett ännu.
Bygg inget innan en riktig fil finns (avsnitt 6).

---

## 1. Vad som gick att ta reda på om Juicy

Nästan hela webben var blockerad av sessionens proxy (`EGRESS_BLOCKED`):
apps.shopify.com, juicy.fyi, help.easyapps.cloud, easyapps.cloud,
help.shopify.com, web.archive.org, r.jina.ai samt alla tredjepartsspeglar
(shopify-spy, pickyourapp, letsmetrix, storecensus, storeleads, shapps).
**Inga sidor lästes i sin helhet.** Allt nedan kommer ur sökmotorsnippets
(WebSearch) från de sidorna — de citerar sidornas egen text men är ofullständiga.
Källförteckning i avsnitt 8.

| Fråga | Svar | Säkerhet |
|---|---|---|
| Namn / leverantör | **Juicy Attribution & Profit** (`apps.shopify.com/juicy`, sajt `juicy.fyi`). Partner-sidan heter "Apps by Easyapps", slug `dagens-e-handel-sverige-ab` ⇒ bolaget är sannolikt **Dagens E-handel Sverige AB**. Support `support@easyapps.cloud`, hjälpcenter `help.easyapps.cloud`. Två personer: Daniel (grundare) och Dirk (utvecklare). | Namn/URL säkra. Bolagsnamnet härlett ur URL-sluggen, ej bekräftat på sidan. |
| Förväxlingsrisk | Partnern **"Juicy Apps"** (`partners/juicy-apps`: Juicy User Profile, Age Yard Box) är en **annan** utvecklare. **"Easy COGS"** är av BuschBytes, inte Easyapps. **"Easy Reports & Data Export"** är samma leverantör som Juicy men en annan app — snippets om "export any data to CSV" gäller den, inte Juicy. | Säker. |
| Pris | Free / Starter $29 / Advanced $49 per månad. Betyg 5,0, ~44 recensioner. | Snippet. |
| (a) Var COGS lagras | Juicys marknadsföring: *"quantity-based pricing (different cost per unit at volume)"*, *"country-specific costs (separate COGS per market)"*, *"historical margins preserved (old orders keep old costs)"*, *"effective date changes (update costs forward without breaking history)"*, *"import supplier costs"*. Inget av det ryms i Shopifys enda `InventoryItem.unitCost` ⇒ **Juicy har en egen kostnadsdatabas.** Om Juicy *dessutom* läser eller skriver Shopifys "Cost per item" hittades **ingen uppgift** — varken i snippets, i indexerade hjälpartiklar eller i listningens "Data access"-avsnitt (sidan blockerad). | Egen DB: säker slutsats. Shopify-synk: **okänt.** |
| (b) COGS-export | **Ingen träff alls** på export av kostnader från Juicy: inga hjälpartiklar (de indexerade handlar om UTM-parametrar och uppsägning), inga recensioner, ingen changelog. Kolumnlayouten är alltså **okänd** — den här filen gissar inte. | Okänt. |
| (c) Flerpack + daterade ändringar | Ja till båda, enligt juicy.fyi. Axel har själv visat Juicys tabell **"Enheter / Total kostnad"** (1 st 88,34 · 2 st 134,22 · 3 st 180,19 — CLAUDE.md, 2026-09-05), så stegen är *totalpris för antalet*, exakt vår `CostTier`-modell. Juicy har dessutom **landspecifik COGS**, som vi saknar (vi har en butik per land i stället). | Säker (skärmbild + snippet). |

Det som **inte** kunde avgöras och som styr hela bygget:

1. Skriver Juicy "Cost per item" till Shopify? (Avgör om scenario A är gratis.)
2. Finns en exportknapp i Juicy, och hur ser filen ut? (Avgör om scenario B går att bygga.)
3. Är Juicys "kostnad" vara + frakt, bara vara, eller inkl. tull? (Avgör om siffrorna är jämförbara med våra.)

---

## 2. Vår egen import i dag (verifierat i koden)

- **Läsning:** `app/lib/shopify-data.server.ts` → `fetchVariantCosts` hämtar
  `productVariants { inventoryItem { unitCost } }` (250/sida, max 40 sidor);
  `loadCatalog` cachar 5 min i minne + 30 min i `CatalogCache`. Katalogen
  hämtar **inte SKU** i dag. P&L-motorn räknar på samma `unitCost`.
- **Skrivning:** `app/lib/cost-import.server.ts` → `importCostCsv`. Format
  `titel;variant;kostnad[;pris]`, kostnad `88.34|134.22|180.19` = totalpris för
  1|2|3 st. Matchning: produkttitel exakt på städad form (`norm`), variant exakt
  eller via ett enskilt alternativ (`6 - 18 hk` träffar `Svart / 6 - 18 hk`).
  Tom variant = alla. Första talet → `inventoryItemUpdate` (Shopify), resten →
  `CostTier` (ersätter variantens steg; rad utan `|` rör dem inte),
  `effectiveFrom` → `CostChange`. Omatchade rader listas som `skipped`, aldrig
  tyst. Tål tabbar, kommadecimaler, BOM.
- **UI:** `app/routes/app.costs.tsx` — DropZone + klistra-in-fält + datum +
  knappen "Write to Shopify"/"Skriv till Shopify". Banner "N variants are
  missing a cost" eller "All variants have a cost." Mallen byggs i webbläsaren.
- **Vår definition:** kostnad = vara + frakt, **utan tull** (tull per order i
  Inställningar), i **butikens valuta**. Shopifys egen definition av "Cost per
  item" är *exklusive* frakt (help.shopify.com-snippet) — samma fält, olika
  konvention. Juicys konvention är okänd (punkt 3 ovan).

**Nyckelinsikten stämmer:** om Juicy (eller handlaren själv, via Shopifys
bulk-editor/produkt-CSV) redan fyllt "Cost per item", så räknar StonePNL på de
kostnaderna **från första sidladdningen, utan import**. Då är "importen" bara
att *visa* handlaren att allt redan är på plats — plus erbjuda flerpack och
historik, som Shopify inte kan bära.

---

## 3. Tre scenarier — flöde, texter, insats

Ett gemensamt kort **"Kommer du från Juicy?"** överst på Kostnader-sidan
(ingen ny route). Vilket läge kortet visar avgörs av datan:

```
täckning = varianter med unitCost / alla varianter
täckning ≥ 90 %  → A  (redan klart)
annars           → B  (släpp Juicy-filen)   med C som reservtext i samma kort
```

### A. Kostnaderna ligger redan i Shopify — 0 klick (1 för att bekräfta)

Flöde: installera → öppna Kostnader → kortet säger att allt finns → **klick 1
"Ser rätt ut"** stänger kortet. Valfritt klick 2: "Lägg till flerpack från
Juicy" scrollar till dropzonen (scenario B).

| Nyckel | EN | SV |
|---|---|---|
| titleA | Your costs are already here | Dina inköpspriser är redan här |
| bodyA | {have} of {total} variants have a cost in Shopify — StonePNL is already using them. Nothing to import. | {have} av {total} varianter har inköpspris i Shopify — StonePNL räknar redan på dem. Inget att importera. |
| noteA | Check that the cost is goods + shipping without duty. Duty is per order in Settings. | Kontrollera att kostnaden är vara + frakt utan tull. Tullen är per order i Inställningar. |
| ctaA | Looks right | Ser rätt ut |
| ctaA2 | Add bundle costs from Juicy | Lägg till flerpack från Juicy |

Insats: **0,5 dag.** Bannern "All variants have a cost" finns redan; det som
tillkommer är texterna, "Ser rätt ut"-knappen och ett `juicyBannerDismissedAt`
på `ShopSettings` (en SQL-migration). Kräver inget av Juicy.
Fungerar oavsett om det var Juicy eller handlaren själv som fyllde fältet.

### B. Juicy-exportfil finns — 3 klick

Flöde: **klick 1** Export i Juicy → **klick 2** släpp filen i dropzonen →
förhandsvisning (matchade / saknade / ersätts / valuta) visas direkt →
**klick 3 "Skriv till Shopify"**. Ingen mall, ingen redigering.

Bygget bakom:

- `detectFormat(text)` på rubrikraden: `stonepnl` | `juicy` | `shopify-csv`
  (Shopifys produkt-CSV har kolumnen **"Cost per item"** — nåbar för alla
  handlare, men den bär bara det Shopify redan har, så den ger inget utöver A)
  | `unknown` (→ dagens tolkning).
- `app/lib/juicy-import.server.ts`: en ren adapter Juicy-rad → vår interna rad
  `{ product, variant, sku?, cost, tiers[], effectiveFrom?, country?, currency? }`
  som sedan går genom **samma** `importCostCsv`-logik. Rubriker detekteras på
  **engelska och svenska** (Juicy har svenskt UI).
- Matchning i ordning: variant-ID om filen har det → **SKU** (lägg till `sku`
  i katalogfrågan + `CatalogCache`-payloaden, litet) → dagens titel+variant.
- Förhandsvisning före skrivning i samma kort — ingen extra klick.
- **Landspris:** välj raden vars land/valuta matchar butiken; saknas
  träff, ta Juicys standardrad. Annan valuta än butikens → räkna om med
  dagskurs ur `fx.server.ts` och visa kursen.
- **Flerpack:** `Enheter / Total kostnad` → `CostTier` rakt av. juicy.fyi
  skriver också *"different cost per unit at volume"*, så filen kan uttrycka
  steg som **styckpris** i stället för total: är värdet för n st **lägre** än
  värdet för 1 st är det styckpris → multiplicera med n. Visa vilken tolkning
  som gjordes.
- **Historik:** Juicys daterade ändringar → en `CostChange` per datum, senaste
  → `unitCost`. Har filen bara nuläget: skriv **ingen** `CostChange` (aldrig
  hitta på en tidsstämpel). Gör importen idempotent — samma fil två gånger får
  inte dubblera `CostChange` (dagens kod dubblerar; fixa i samma bygge).
- **Befintliga kostnader:** fyll tomma som standard, visa "N har redan ett
  pris och ersätts" i förhandsvisningen. Stegen: filen är sanningen (dagens regel).

| Nyckel | EN | SV |
|---|---|---|
| titleB | Coming from Juicy? | Kommer du från Juicy? |
| bodyB | Export your costs from Juicy and drop the file here. Titles, bundle costs and cost history come along. | Exportera dina kostnader från Juicy och släpp filen här. Titlar, flerpack och historik följer med. |
| detected | Juicy file recognised: {rows} rows | Juicy-fil igenkänd: {rows} rader |
| preview | {matched} variants matched · {unmatched} not found in this store · {replace} already have a cost and will be replaced | {matched} varianter matchade · {unmatched} finns inte i butiken · {replace} har redan ett pris och ersätts |
| fxNote | Costs in {cur} converted to {shopCur} at {rate} ({date}) | Kostnader i {cur} omräknade till {shopCur} med kurs {rate} ({date}) |
| tierNote | Bundle costs read as total per quantity | Flerpack tolkat som totalpris per antal |
| unmatched | Not found in this store: {names} | Fanns inte i butiken: {names} |
| cta | Write to Shopify *(finns)* | Skriv till Shopify *(finns)* |

Insats: **2–3 dagar** när filen finns (adapter + rubrikdetektor + tester på
riktiga filer från flera butiker + förhandsvisning + SKU i katalogen +
idempotens). **+1 dag** om Juicy exporterar XLSX i stället för CSV
(SheetJS/`xlsx` som nytt beroende). Blockerat tills en riktig fil finns.

### C. Varken export i Juicy eller kostnader i Shopify

Då går "3 klick, inget manuellt" **inte** att hålla — det finns ingen väg in i
Juicys databas (inget publikt API hittat). Bästa möjliga:

- **C1 — kopiera tabellen:** markera Juicys kostnadstabell, kopiera, klistra i
  vårt fält (klick 1–2), "Skriv till Shopify" (klick 3). Webbläsaren ger
  tabbseparerad text och `parseLine` splittar redan på tabb. Kräver att vi
  vet tabellens kolumner (samma blockering som B, men en skärmbild räcker).
  Insats **1 dag** efter skärmbild. Märkt som **gissning** tills tabellen setts.
- **C2 — mallen (finns):** ladda ner, fyll i, släpp tillbaka. Fler klick och
  manuellt — golvet, inte målet.
- Be handlaren mejla `support@easyapps.cloud` om en export är inget vi bygger.

| Nyckel | EN | SV |
|---|---|---|
| bodyC | No export in Juicy? Open Juicy's cost page, select the table, copy it and paste it below. | Saknar Juicy export? Öppna Juicys kostnadssida, markera tabellen, kopiera och klistra in nedan. |

---

## 4. Kantfall att hantera (alla scenarier)

- **Valuta:** butik och Juicy-kostnad kan skilja; Juicy kan ha ett pris per
  land. Aldrig summera valutor. Omräkning per dagskurs, kursen synlig.
- **Kostnadsdefinition:** Juicy kan ha tull inbakad eller frakt utanför.
  Fel här dubbelräknas tyst (tull ligger per order hos oss). Texten i A och
  förhandsvisningen i B säger uttryckligen "vara + frakt, utan tull".
- **Omdöpta produkter/varianter, översatta titlar:** matcha på ID/SKU före
  titel; det som inte matchar listas med namn, aldrig tyst (dagens `skipped`).
- **"Default Title"** = tom variant.
- **Flerpack:** total kontra styckpris (heuristiken ovan); Juicys steg är per
  orderrad, som våra. Separata "2-pack"-produkter i Shopify är egna varianter
  med eget styckpris, inte steg.
- **Historik:** bara datum som finns i filen. Idempotent import.
- **Ersätta eller fylla:** fyll tomma, visa vad som ersätts.
- **Stora kataloger:** katalogen tar max 10 000 varianter (40 × 250); en
  större fil ska varna, inte tystna.
- **Excel-mangling:** BOM, `,`-decimaler, tabbar — tolkas redan.
- **Ingen ny tabell** planeras ⇒ inget att lägga till i `shop/redact`. Läggs
  en importlogg till: glöm inte `webhooks.tsx`.
- **Butiksgruppen:** fem butiker = fem Juicy-exporter; adaptern måste
  provköras på minst SE + en översatt butik innan den kallas klar (trippelkollen).

---

## 5. Byggordning

1. **A först** — fristående, 0,5 dag, ingen Juicy-input krävs, ger direkt
   det "smidiga övergångs"-intrycket för alla som redan har Cost per item.
2. **B** när en riktig Juicy-fil finns. Tester på filerna, inte på antaganden.
3. **C1** bara om Juicy visar sig sakna export.

---

## 6. Vad Axel måste ge oss innan något byggs

Axel har Juicy på Bäverbutiken själv (skärmbilden 2026-09-05), så allt nedan
kan komma från hans egen installation:

1. **En riktig Juicy-exportfil** från Kostnader/Produkter i Juicy — eller
   beskedet att knappen inte finns. (Viktigast. Avgör B.)
2. **Skärmbild av Juicys kostnadssida** med alla kolumner synliga
   (SKU? variant? land? enheter? datum?). Avgör C1 och matchningen.
3. **Skriver Juicy till Shopify?** Öppna en produkt i Shopify-admin och läs
   "Cost per item" på en variant vars pris bara satts i Juicy. Avgör om A är
   gratis för Juicy-användare eller bara för dem som fyllt fältet själva.
4. **Vad Juicys "kostnad" innehåller** (vara / + frakt / + tull).
5. **Beslut:** ska en Juicy-import ersätta befintliga priser eller bara fylla
   tomma? (Förslag: fylla, visa vad som skulle ersättas.)

Frågan till Axel, i hans format (en fråga, tre alternativ):

> Har Juicy en exportknapp på kostnadssidan?
> 1. Ja — jag skickar filen.
> 2. Nej — jag skickar en skärmbild av tabellen.
> 3. Vet inte — jag kollar.

---

## 7. Källor

Inget nedan lästes som fullständig sida — proxyn blockerade varje värd.
Uppgifterna kommer ur sökmotorns snippets av dessa URL:er (2026-09-07):

- https://apps.shopify.com/juicy — listningen ("Quantity-Based COGS", "This app needs access to the following data…", pris)
- https://apps.shopify.com/juicy/reviews — recensioner (betyg, "easy to set up")
- https://apps.shopify.com/partners/dagens-e-handel-sverige-ab — "Apps by Easyapps" (leverantören)
- https://apps.shopify.com/partners/juicy-apps — **annan** utvecklare, förväxlingsrisk
- https://apps.shopify.com/easy-reports — Easy Reports & Data Export, samma leverantör, annan app
- https://apps.shopify.com/easy-cogs — Easy COGS av BuschBytes, orelaterad
- https://juicy.fyi/ — COGS-funktioner (flerpack, land, historik, "import supplier costs")
- https://juicy.fyi/about — Daniel + Dirk
- https://juicy.fyi/compare/juicy-vs-triplewhale
- https://easyapps.cloud/ — "Easyapps – Juicy", support@easyapps.cloud
- https://help.easyapps.cloud/en/article/how-to-add-url-parameters-to-meta-facebook-ads-c5icnz/ (+ Google/Snapchat/Pinterest, "How do I cancel my subscription?") — de enda indexerade hjälpartiklarna; ingen om COGS
- https://help.shopify.com/csv/product_template.csv och https://help.shopify.com/en/manual/products/details/product-details-page — kolumnen "Cost per item", definition exklusive frakt
- https://www.storecensus.com/shopify-apps/juicy — betyg/recensionsantal
- Blockerade och olästa: shopify-spy.com, pickyourapp.com, letsmetrix.com, storeleads.app, shapps.io, techresolve.blog, digismoothie.com, reportpundit.com, zoko.io, logbase.io, highviewapps.com, help.useamp.com, web.archive.org, r.jina.ai, html.duckduckgo.com.
- Intern källa: `pnl-app/CLAUDE.md`, avsnittet "Flerpacks-COGS" (Axels skärmbild av Juicys "Enheter / Total kostnad").
