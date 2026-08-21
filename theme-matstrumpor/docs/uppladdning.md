# Uppladdning till matstrumpor.se

Inget här rör den publicerade butiken.

## Kortversionen

```bash
npm run tema:grind              # måste vara grön
node theme-matstrumpor/tools/atkomst.mjs   # visar vad appen får göra
npm run tema:upp -- teman       # lista temana i butiken
npm run tema:upp -- allt        # steg 2–7 i en körning
```

`allt` duplicerar bastemat, laddar upp filerna, kopplar in dem, bygger
produktmallen och skriver ut förhandslänken. Kopian blir alltid opublicerad.

## Steg 0 — kom in i butiken

Shopify-MCP:n dör med jämna mellanrum (`token expired`, och efter ett
`switch-shop` går den inte att laga i en icke-interaktiv session). **Gå inte via
MCP:n.** Nycklarna finns i environmentet:

```
SHOPIFY_SHOP_MATSTRUMPOR · SHOPIFY_CLIENT_ID_MATSTRUMPOR · SHOPIFY_CLIENT_SECRET_MATSTRUMPOR
```

`shopify/token.mjs` växlar dem mot en färsk Admin-token via `client_credentials`
(giltig 24 h) och `theme-matstrumpor/tools/shopify.mjs` gör anropen.

```bash
npm run tema:shop     # verifierar kopplingen och visar butiken
```

Domänen måste vara **matstrumpor.se**. Är den något annat: **stanna**. Fel butik
ger tal som ser rimliga ut men kommer från fel verksamhet. Spärren sitter också i
koden — `kontrolleraButik()` avbryter på fel primärdomän — men kontrollera ändå.

## Körningen 2026-08-21 — temat ligger uppe

### Andra passet: temat var byggt, men det SÅG inte byggt ut

Första passet laddade upp filerna korrekt och sidan renderade. Den såg ändå
fel ut, av tre skäl som inte syns i någon kod:

1. **All vår text var ~40 % för liten.** `ms-cro.css` räknade i `rem`, men Dawn
   (och Shrine, och de flesta OS 2.0-teman) sätter `html { font-size: 62.5% }`.
   1rem = 10px, alltså renderades 14px-text som 8,75px. Tokens räknar nu i `em`
   och ärver temats brödtextstorlek i stället. **Detta är den viktigaste raden i
   hela filen** — den går inte att upptäcka utan att titta på en riktig sida.
2. **Dubbla kontroller i köprutan.** Dawns variantväljare låg kvar bredvid
   paketkorten, plus dubbel antalsväljare. Paketväljaren *är* variantväljaren;
   Dawns är borttagna ur mallen.
3. **Hela temat var omålad Dawn** — engelsk annonsrad, Dawns typsnitt, Dawns
   svartvita knappar. Nu satt via `config/settings_data.json`.

### Vad som styr utseendet nu

| Fil | Vad |
|---|---|
| `config/settings_data.json` | Märkets palett och typsnitt: accent `#dd821d`, text `#121212`, knapptext `#fdfbf7`, typsnitt `mochiy_pop_p_one_n4` — samma som live-sajten. Rundade hörn, kundvagnslåda, svenska. |
| `assets/ms-tema.css` | **Enda stället där vi rör basetemats egna klasser.** Gör köpknappen fylld i stället för Dawns vita sekundärknapp, förstorar priset, luftar köprutan. Byts bastemat är det den här filen som skrivs om — inte konverteringslagret. Liten med flit, så den går att justera utan att ladda upp 20 KB CSS igen. |
| `templates/product.json` | Köprutan. Referens i repot: `templates/product.dawn.json`. |
| `templates/index.json` | Startsidan. Referens: `templates/index.dawn.json`. |
| `sections/header-group.json` | Roterande svensk annonsrad i accentfärg. |
| `sections/footer-group.json` | Svensk sidfot, utan land- och språkväljare. |

### Så granskas resultatet utan webbläsare

Chromium i den här miljön når inte ut på nätet, men `curl` gör det.

```bash
python3 tools/spegla.py "https://matstrumpor.se/?preview_theme_id=<id>" /tmp/m
node tools/skott.mjs "file:///tmp/m/sida.html" hem.png 2100
```

`spegla.py` hämtar sidan och allt den refererar med curl, skriver om länkarna
till lokala filer och renderar från `file://`. ⚠️ Kakburken är inte valfri —
utan `-c/-b` får du det **publicerade** temat i stället, och det ser ut att
fungera. (Hände 2026-08-21: en hel granskning gjordes på fel tema.)

## Körningen 2026-08-21 — detaljer

| | |
|---|---|
| Tema | **Matstrumpor CRO**, id `205400768851`, **OPUBLICERAT** |
| Bastema | Dawn (`184707088723`, opublicerat, themeStoreId 887) |
| Förhandslänk | `https://matstrumpor.se/?preview_theme_id=205400768851` |
| Uppladdat | 31 ms-filer + `layout/theme.liquid` + `templates/product.json` |
| Verifierat | Varje fil byte-jämförd mot originalet, och produktsidan hämtad skarpt |

Det publicerade temat (`theme-export-matstrumpor-se-shrine-2-01dec202`) rördes inte.

**Vägen in gick via MCP-connectorn, inte via env-nycklarna** — appen saknar
tema-scope (steg 0b). MCP:n tillåter `themeFilesUpsert` bara mot opublicerade
teman, vilket är exakt rätt spärr.

### Dawn tar inte emot temablock — våra block går in som `custom_liquid`

`sections/main-product.liquid` i Dawn listar `@app` men **inte `@theme`**, och
dess `{% case block.type %}` har ingen generisk gren. Läggs `blocks/ms-*` in där
renderas de inte alls — sidan blir tom, precis som steg 3 varnar för.

Lösningen är Dawns egen lucka: blocktypen `custom_liquid`, vars
`liquid`-inställning kör `{% render %}` utan problem (verifierat på riktig sida).
Varje ms-block blir alltså ett `custom_liquid` som renderar samma snippet med
samma standardvärden. Logiken bor fortfarande bara i `snippets/`.

`tools/mall.mjs` väljer väg automatiskt: temablock om sektionen har `@theme`,
annars `custom_liquid`, annars stannar den. Mallen som laddades upp ligger som
referens i `templates/product.dawn.json` — och testet i `tools/test/` kontrollerar
att skriptet återskapar exakt den.

### Tre buggar som Shopify hittade och som grinden nu fångar

Alla tre gjorde att filen **avvisades helt** — de hade aldrig gått att ladda upp:

| Fil | Fel | Rättning |
|---|---|---|
| `blocks/ms-stock.liquid` | `"default": ""` på en textinställning | nyckeln borttagen |
| `sections/ms-sticky-atc.liquid` | `"tag": null` — måste vara sträng | nyckeln borttagen (blir `div`) |
| `snippets/ms-head.liquid` | sträng över två rader i ett `{% liquid %}`-block | radbrytningen flyttad till ett eget `{% assign %}` |

`tools/liquid-check.mjs` har fått en regel per fel. Kör alltid `npm run tema:grind`
före uppladdning — den fångar dem nu innan Shopify gör det.

### Kvar att göra

- **`config/settings_schema.json` är inte ändrad.** Filen är 40 KB och skrevs
  inte av för hand. Utan den går A/B-testerna inte att slå på i temaredigeraren.
  Det spelar ingen roll i dag: utan inställningen blir `settings.ms_ab_tests`
  tom, motorn kör med `tests: []` och ligger stilla — vilket är samma läge som
  fragmentets standardvärde `# buybox` (avstängt) ger. `npm run tema:upp -- allt`
  gör ändringen automatiskt så fort appen har tema-scope.
- **Omdömessektionen ligger uppe men är inte inlagd i mallen.** Vi hittar inte på
  kundomdömen. Lägg in den i temaredigeraren när det finns riktiga, eller koppla
  in en recensionsapp via app-blocket.
- **Omdömen på startsidan.** Sektionen finns, men den är tom tills det finns
  riktiga omdömen att lägga in.

## Steg 0b — appen måste få röra teman

⚠️ **Detta stoppade körningen 2026-08-21.** Appen för matstrumpor.se har bara
`write_inventory, write_products, write_publications`. Tema-API:t svarar då:

```
[API] This action requires merchant approval for read_themes scope.
```

Det går inte att komma runt från den här sidan — scopet sitter på appen. Axel
öppnar det i adminen för matstrumpor.se:

> Inställningar → Appar och försäljningskanaler → Utveckla appar → appen
> → Konfiguration → Admin API-omfattning → kryssa i **read_themes** och
> **write_themes** → Spara → Installera om appen

Kryssa i **read_orders** och **read_reports** samtidigt — de behövs för steg 8
och för alla frågor om trafik och köp.

Kör `node theme-matstrumpor/tools/atkomst.mjs` efteråt: alla fyra raderna ska
vara gröna.

## Steg 1 — kontrollera bygget lokalt

```bash
npm run tema:grind
```

Både Liquid-kontrollen och de 41 testerna ska vara gröna. Ladda aldrig upp
med en röd grind — Shopify avvisar ogiltig schema-JSON, och då står temat
halvt uppladdat.

---

**Steg 2–7 körs av `npm run tema:upp -- allt`.** Beskrivningarna nedan står kvar
för att de förklarar *varför* ordningen ser ut som den gör — och för att kunna
göra stegen för hand den dagen skriptet inte räcker till.

---

## Steg 2 — hitta eller skapa ett bastema

```bash
npm run tema:upp -- teman
```

- Finns **Horizon** eller **Dawn** opublicerat → använd det.
- Finns det inte → be Axel lägga till Horizon gratis från Shopifys temabutik
  (ett klick), eller skapa ett från Dawns publika zip.

**Duplicera basetemat innan du rör det**, och döp kopian till
`Matstrumpor CRO`. Rör aldrig `role: MAIN`.

## Steg 3 — läs basetemats verkliga struktur

Det här steget går inte att hoppa över och går inte att gissa sig till.

```bash
npm run tema:upp -- las <temaId>
```

Skriptet skriver ut vilken sektion som är produktsektionen, vilka blocktyper den
har, vad köpknappen heter — och om sektionen alls tar emot temablock. Gör den
inte det stannar bygget i steg 6 i stället för att lägga in block som inte
renderas.

Läs `templates/product.json` och `layout/theme.liquid` i sin helhet. Du behöver
veta vad temats produktsektion **faktiskt heter** och vilka blocktyper den
tillåter. Horizon och Dawn skiljer sig här, och ett `product.json` som pekar på
en blocktyp som inte finns gör produktsidan tom.

Det är också därför inget färdigt `templates/product.json` ligger i repot: det
måste byggas mot det bastema som faktiskt används.

## Steg 4 — ladda upp filerna

`themeFilesUpsert` mot kopian, med allt ur:

```
assets/ms-cro.css   assets/ms-cro.js   assets/ms-ab.js
snippets/ms-*.liquid
blocks/ms-*.liquid
sections/ms-*.liquid
```

## Steg 5 — koppla in i temat

1. **`layout/theme.liquid`** — lägg `{% render 'ms-head' %}` precis före `</head>`.
   Läs filen, lägg till raden, skriv tillbaka hela filen. Skriv aldrig över den blint.
2. **`config/settings_schema.json`** — läs den, lägg till objektet ur
   `config/settings_schema.fragment.json` sist i listan, skriv tillbaka.
   Behåll `theme_info` först — Shopify kräver det.

## Steg 6 — bygg produktmallen

Ordningen i köpblocket, uppifrån och ner. Den är vald efter var ögat är och var
tvekan uppstår, inte efter vad som ser prydligt ut:

| # | Block | Varför där |
|---|---|---|
| 1 | temats titel + pris | oförändrat |
| 2 | `ms-points` | nyttan direkt under priset |
| 3 | `ms-bundle` | valet innan knappen, inte efter |
| 4 | temats köpknapp | oförändrad |
| 5 | `ms-trust` | direkt under knappen, där tvekan finns |
| 6 | `ms-delivery` | konkret datum |
| 7 | `ms-pay` | betalsätten |
| 8 | `ms-faq` | invändningarna |
| 9 | `ms-guarantee` | sista invändningen |

Sektioner under köpblocket: `ms-compare` → `ms-reviews` → `ms-faq-section`.
Lägg `ms-sticky-atc` sist i mallen.

## Steg 7 — leverera förhandslänken

```
https://matstrumpor.se/?preview_theme_id=<id>
```

Testa själv först: produktsidan, kundvagnen, kassan fram till betalsteget.
Kontrollera särskilt att paketväljaren byter variant på riktigt — lägg i
varukorgen och se att rätt variant hamnar där.

## Steg 8 — sätt igång A/B först när trafiken räcker

```bash
npm run tema:ab -- --planera --baslinje <konv> --trafik <besökare/dag>
```

### Avläsning 2026-08-21: A/B-test är fel verktyg i den här butiken

Shopifys egna sessions och ordrar gick inte att läsa (`read_orders` och
`read_reports` saknas — se steg 0b), så siffrorna nedan kommer från Meta.
De pekar entydigt åt samma håll.

Annonskontot `730973156224390` ("nya kungen"), **hela sin livstid**:

| | |
|---|---|
| Kampanjer | 1 st — *"Ny Interaktion Kampanj med rekommenderade inställningar"* |
| Spend | 1 329,29 kr |
| Visningar / räckvidd | 11 319 / 5 339 |
| **Utgående klick** | **9** |
| Köp, ROAS, landningssidvisningar | inga alls |
| Pixel/dataset på kontot | **inget** |

Kampanjen är en **interaktionskampanj** — den är köpt för att samla reaktioner,
inte för att skicka folk till sajten. Nio klick på trettio dagar är noll trafik.
Och utan pixel finns ingen mätning ens om trafiken kom.

Vad planeraren säger vid 30 besökare/dag och 2 % konvertering:

```
Lyft   Per variant    Totalt   Dagar
+20 %       21106     42212    1408   ← för långt
+50 %        3823      7646     255   ← för långt
```

Även ett orimligt stort lyft på 50 % skulle ta **åtta månader** att bevisa. Ett
test som rullar så länge mäter säsong och prisändringar, inte varianten.

**Slutsats:** bygg förbättringen rakt av och låt den ligga. Starta inga tester
förrän butiken har trafik — grovt räknat behövs några hundra besökare per dag
innan ett test hinner bli klart inom sex veckor. Läs om trafiken innan du
föreslår ett test nästa gång; siffrorna ovan är från *ett* nedslag.

## Publicera

Bara Axel bestämmer det. Publicera aldrig själv.
