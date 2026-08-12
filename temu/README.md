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
- `curl` mot produktsidan, mobilsidan (`m.temu.com`) och `?_bg_fs=1` → 0 bilder, 0 pris
- Temus API-endpoints (`/api/oak/…`, `/api/poppy/…`, `/api/oakstar/…`) → 403
- **Playwright/Chromium** → går inte att använda alls i den här miljön: webbläsaren
  når inget över nätet (`ERR_CONNECTION_RESET` även mot `example.com`, med och utan
  proxy). `curl` fungerar däremot, så det är webbläsaren som är avskuren.

Däremot: **Temus CDN (`img.kwcdn.com`, `aimg.kwcdn.com`) är nåbart.** Har man bara
bild-URL:erna går de att hämta och ladda upp utan problem.

Slutsatsen är alltså inte "det går inte" utan: *bilder, pris och varianter måste
komma från Axel, resten sköter systemet.*

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
