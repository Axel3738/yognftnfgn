# temu/ – Temu → Bäverbutiken.se

Verktygen bakom `/temu`. Kommandot (`.claude/commands/temu.md`) är arbetsgången;
den här mappen är maskineriet.

Inga globala beroenden utöver mappens egna: `npm install` här inne först.

```bash
cd temu && npm install     # sharp + gifenc
```

---

## Vad som går att automatisera – och vad som inte gör det

Undersökt 2026-08-12. Det här är inte en gissning, det är testat.

**Temu lämnar inte ifrån sig produktdata.** Serversvaret på en produktlänk
innehåller bara og-taggarna: titel, en beskrivningstext och produkt-id. Allt
annat – bilder, pris, varianter, lager – hämtar webbläsaren efteråt från Temus
API, som svarar `NEED_LOGIN` / `request illegal` utan inloggning och giltig
anti-bot-token.

Testat och avfärdat:
- Produktsidan med tre User-Agents (desktop, mobil, Googlebot) → 0 träffar på
  `skuList`, `specName`, `specValue`, `skuId`. De ~47 CDN-länkarna i HTML:en är
  UI-ikoner och JS-buntar, inte produktbilder.
- **JSON-LD** (`application/ld+json`, strukturerad data för Google) → finns inte.
- Temus API med riktig cookie-session → `NEED_LOGIN` / `request illegal` / 403.
- **Playwright/Chromium** → går inte att använda alls i den här miljön: webbläsaren
  når inget över nätet (`ERR_CONNECTION_RESET` även mot `example.com`, med och utan
  proxy). `curl` fungerar däremot, så det är webbläsaren som är avskuren.

**Den enda väg som återstår:** `/api/oak/integration/render` svarar
`GOODS_NOT_EXIST` på fel `goods_id` men `NEED_LOGIN` på rätt. Endpointen fungerar
alltså och känner igen produkten – det som saknas är ett inloggat Temu-konto. Med
Axels Temu-cookies går varianter och bilder att hämta automatiskt.
Testverktyg: `api-test.mjs`, `varianter.mjs`.

⚠️ **Och även med inloggning: varianterna ska inte tas från Temu.** Temu är där
produkten hittades, CWD är leverantören som faktiskt levererar. Gräsklippartäcket
säger "en mängd färger" på Temu men `ONLY BLACK, MOQ 10PCS!` i CWD-offerten. Temu
ger produktidé och bilder; **CWD-offerten ger varianterna.** Se `VARIANTPLAN.md`.

Däremot: **Temus CDN (`img.kwcdn.com`, `aimg.kwcdn.com`) är nåbart.** Har man bara
bild-URL:erna går de att hämta och ladda upp utan problem.

### Genombrottet 2026-08-17: DuckDuckGos bildsök läcker kwcdn-URL:erna

Temu själva lämnar inte ut bilderna, men **DuckDuckGos bildsök har indexerat dem**
och exponerar originalens `img.kwcdn.com/product/fancy/...`-URL:er i sin JSON
(`duckduckgo.com/i.js`, kräver bara en vqd-token från förstasidan). Verktyget är
`bildjakt.mjs`. Bing/Yandex/Google/WebFetch/archive.org testades också — bara DDG
fungerade.

**Obligatoriskt efterarbete: träffarna är söktraffar, inte produktens egna bilder.**
Varje kandidat granskas visuellt (kontaktkarta → titta) innan den används, och regeln är:

- **Vitmärkta prylar** (kamera, verktyg, hållare): använd bilden om den bevisligen
  visar det beskrivningen lovar (dubbellins + 355°, kolfibervinge + buntband osv).
- **Utseendeprodukter** (skor, kläder): använd ALDRIG en söktraff — kunden får en
  synligt annan vara. Där krävs den exakta listningens bilder från Axel.
- **Märkesprodukter i träffarna** (Lerutwis, PROBEROS, VEVOR …): aldrig — fel
  varumärke på vår produktsida.
- Räkna-bara-fel: säger beskrivningen "260 delar" och bilden "173 pcs" är det fel bild.

Så slutsatsen numera: *pris och varianter måste komma från Axel (CWD-offerten);
bilder går ofta att hämta själv för vitmärkta prylar — med visuell verifiering —
men skor/kläder kräver fortfarande Axel.*

---

## `hamta.mjs` – läser Temu-länken

```bash
node temu/hamta.mjs "https://www.temu.com/se/....html"
```

Ger JSON med `goods_id`, `sku` (`TEMU-<id>`), `ra_rubrik`, `ra_beskrivning` och
`temu_kategori`. Fältet `saknas` listar det som inte går att läsa ut.

`ra_rubrik` är maskinöversatt nyckelordssoppa ("ny hattgalge fantastisk
hattförvaring 1 galge kan") och ska aldrig bli produktnamn – den är underlag.

---

## `gif.mjs` – bygger GIF:en

Axel vill ha GIF i beskrivningen, inte stillbilder.

```bash
# Flera bilder → korsfadeat bildspel
node temu/gif.mjs --ut=temu/tmp/x.gif bild1.jpg bild2.jpg bild3.jpg

# En bild → långsam inzoomning (Ken Burns), väljs automatiskt
node temu/gif.mjs --ut=temu/tmp/x.gif bild.jpg

# URL:er funkar lika bra som filer
node temu/gif.mjs --ut=temu/tmp/x.gif "https://img.kwcdn.com/..." "https://..."
```

Flaggor: `--bredd`, `--hall` (ms per bild), `--overgang` (ms), `--farger`,
`--zoom` (inzoomning), `--kenburns=true` (tvinga inzoomning).

**Varför ren JS och inte ffmpeg:** den ffmpeg som följer med Playwright i den här
miljön är en minimal build – 13 filter, ingen `fps`, `xfade` eller `palettegen`,
och **ingen GIF-encoder alls**. Därför sharp + gifenc.

Storlek hålls nere med ett trick: en stillastående bild behöver bara *en* bildruta
med lång fördröjning. Bara övergångarna kostar rutor. Tre bilder blir ~15 rutor i
stället för ~60. Typisk GIF landar på 0,5–1,7 MB; över 4 MB skalas den ner
automatiskt.

---

## Ladda upp en GIF till Shopify

Shopify tar bara emot publika HTTPS-URL:er, så den lokala GIF:en måste upp först.
Det finns inget `upload-image`-verktyg i den här MCP-servern – kör GraphQL:

1. `stagedUploadsCreate` – `resource: FILE`, `mimeType: "image/gif"`,
   `httpMethod: POST`, `fileSize` i bytes. Flera filer i ett anrop.
2. POST till returnerad `url`: alla `parameters` som formulärfält, filen sist som
   `file`. 201 = ok.
3. `fileCreate` med `originalSource: <resourceUrl>`, `contentType: IMAGE`, `alt`.
4. Vänta ~20 s och läs `image.url` när `fileStatus` är `READY`.

Shopify behåller animationen (`mimeType` förblir `image/gif`) – verifiera ändå.

---

## Fällor

- **`create-product` kan inte sätta "fortsätt sälja när slut i lager".** Kör
  `productVariantsBulkUpdate` med `inventoryPolicy: CONTINUE` direkt efteråt,
  annars stannar försäljningen när det påhittade saldot tar slut.
- **Tomma HTML-kommentarer som platshållare** (`<!-- GIF: ... -->`) syns inte för
  kunden. Vågen från 2026-08-01 låg live i elva dagar med osynliga hål i
  beskrivningen där GIF:erna skulle vara. Lägg in riktigt innehåll eller skriv i
  leveransen att platsen saknar bild.
- **`options` är obligatoriskt** i `create-product` så fort `variants` anges.
- **Produkter hamnar inte automatiskt i någon kollektion.** Hela 2026-08-01-vågen
  låg utanför alla kollektioner och syntes därför inte i menyn.

---

## `lankar.mjs` – läser Temu-länkarna ur Axels xlsx-lista

```bash
node temu/lankar.mjs "Next_up_products.xlsx"
```
Ger `goods_id` + slug per produkt. Länkarna ligger som hyperlänkar i
`xl/worksheets/_rels/sheet1.xml.rels`, inte som celltext – de syns alltså inte om
man bara läser cellerna. Kolumnen "View product" är länkbärare.

## `varianter.mjs` / `analysera.mjs` / `api-test.mjs` – undersökningsverktyg

```bash
node temu/varianter.mjs <goods_id> [<goods_id> ...]   # og-taggar, JSON-LD, variantsignaler
node temu/analysera.mjs "<temu-länk>"                 # vad sidan lämnar ut totalt
node temu/api-test.mjs <goods_id>                     # testar 5 API-endpoints med cookie-session
```
Kör `api-test.mjs` igen den dag Temu-inloggning finns – då är det den snabbaste
vägen till varianter och bilder.
