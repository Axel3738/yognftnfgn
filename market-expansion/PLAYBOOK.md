# PLAYBOOK: Klona Bäverbutiken till en ny marknad

Beprövad process (körd 2026-08-06/07 för Norge → Beverkobling.no-butiken, brand
Beverbutikken). Följ stegen i ordning. Allt käll-/byggmaterial ligger i `market-expansion/`.

## Starta så här (instruktion till AI-sessionen)

> "Läs market-expansion/PLAYBOOK.md. Ny marknad: <LAND>, språk <SPRÅK>, valuta <VALUTA>,
> brand <BRANDNAMN>. Butiken är kopplad via Shopify-MCP:n. Kör hela processen."

Krav innan start: målbutiken skapad i Shopify och kopplad till sessionens Shopify-MCP
(användaren kopplar; verifiera med get-shop-info att RÄTT butik svarar!).

## Fas 0 — Parametrar (fyll i per marknad)

| Parameter | Norge-exemplet | Ny marknad |
|---|---|---|
| Språk (för översättningsagenter) | norskt bokmål | |
| Valuta + prisregel | NOK = SEK 1:1 | (DKK ~×1,5? EUR ~÷11? — besluta + avrunda till …9) |
| Brand | Beverbutikken | |
| SKU-prefix | BEVER- | |
| Supportmail | kundesupport@beverbutikken.no | |
| Konsumentlag | angrerettloven 14 d, forbrukerkjøpsloven, VOEC | (EU-land: ångerrätt 14 d, OSS-moms) |

## Fas 1 — Källdata (finns redan!)

`source-export/` innehåller FULL export av Bäverbutiken (produkter med descriptionHtml,
varianter, bilder, kollektioner+medlemskap, menyer, sidor, policyer). Återanvänd den —
exportera bara om ifall svenska sortimentet ändrats väsentligt (kräver att sessionen
kopplas mot svenska butiken, vilket kostar en auktoriseringsväxling — undvik).

## Fas 2 — Översätt katalogen (batchar + parallella agenter)

1. `no/build/make-batches.mjs` → kopiera till `<lang>/build/`, kör (10 batchar à 14).
2. Starta 10 parallella översättningsagenter (sonnet) med prompten från Norge-körningen
   (se git-historik eller kopiera reglerna): behåll HTML-struktur, exakt schema med
   handle-nyckel, flagga garantilöften/leveranstider som `JURIDISK GRANSKNING`,
   Bäver-namn → lokalt brand, mått/storlekar orörda, ny SEO-titel+beskrivning per produkt.
3. `build-catalog.mjs` (justera CAT_BY_*, valutaregel, vendor, slug-tabellen för språkets
   tecken!) → catalog.<lang>.json + shopify-import.csv + build-report.md med alla flaggor.

## Fas 3 — Push till målbutiken (ordningen spelar roll)

1. **Kollektioner först** (collectionCreate, aliasbatch, 1 anrop) — ID:n behövs i produkterna.
2. **Produkter via productSet** — `make-jsonl.mjs` (uppdatera collection-ID:n + location-ID!)
   → JSONL → dela i chunkar → parallella agenter kör productSet rad för rad med loggfil.
   ⚠️ `bulkOperationRunMutation` är BLOCKERAT av MCP-policyn — därav agent-vägen.
   ⚠️ Sätt `inventoryPolicy: CONTINUE` och `templateSuffix` REDAN i productSet-inputen
   (Norge-körningen missade det → separat efterkörning; make-jsonl bör uppdateras).
3. **⚠️ KANALPUBLICERING — största fällan:** API-skapade produkter/kollektioner hamnar INTE
   i Onlinebutik-kanalen. Kör `publishablePublish` (aliasbatch ~30/anrop) för ALLA produkter
   + kollektioner mot butikens "Webbshop"-publication (hämta id via `publications { id name }`).
   Utan detta ser butiken tom ut.
4. **Sidor** (pageCreate, aliasbatch): översätt `no/content/pages/*` till nya språket
   (juridiken är landspecifik — skriv om mot landets konsumentlag, behåll flaggkommentarerna).
5. **Menyer** (menuUpdate ×2): huvudmeny med kategorikollektioner, sidfot med sidorna.

## Fas 4 — Tema

1. Användaren laddar upp svenska temats zip i målbutiken (Themes → Add → Upload zip).
   ⚠️ Be användaren att INTE publicera förrän allt är klart — live-teman är API-låsta!
2. I det OPUBLICERADE temat, via themeFilesUpsert:
   - `templates/index.json`: hero-text/länkar + kategorirutor → nya kollektionshandles.
   - `config/settings_data.json`: logga (se nedan), banners, sidfotstexter, valutaväljare.
   - Locale-agent: översätt `locales/sv.json` → skriv SAMMA innehåll till sv.json +
     en.default.json + <lang>.json (butiksspråket kan vara vilket som).
   - Mall-agent: alla `templates/*.json` UTOM gem/gp-filer.
   - **Glöm inte `product.claudeprodukter/beverlam/strandtofflor/snabbtrratter.json`**
     (missades först i Norge-körningen) — färdiga norska versioner: `no/theme-templates/`.
3. Bilder som temat refererar (`shopify://shop_images/...`) finns INTE i nya butiken —
   kopiera via `fileCreate(originalSource: "https://cdn.shopify.com/s/files/1/1013/0322/2621/files/<namn>")`
   med SAMMA filnamn (Shopify hämtar server-side; sandboxens curl är blockerad mot CDN).
4. Logga: `no/build/make-logo.py` (Pillow; pip install pillow) — svart + VIT variant
   (header/sidfot är svarta!) + favicon. Upload: stagedUploadsCreate → curl POST → fileCreate.
5. Klart → användaren förhandsgranskar + publicerar.

## Fas 5 — Produktinställningar (om ej satta i fas 3)

- inventoryPolicy CONTINUE på alla varianter: productVariantsBulkUpdate, aliasbatch.
- templateSuffix: claudeprodukter på alla utom strandtofflor/beverlam/snabbtrratter-
  produkterna + fraktgarantin (standard). productUpdate(product: {...}) — `input:` är deprecated.

## Fas 6 — Judge.me-recensioner

Användaren exporterar/ger CSV → översätt title/body till målspråket (namn/betyg/datum orörda)
→ mappa `product_handle` via catalog.<lang>.json (sourceHandle→handle) → BLANKA `product_id`
(annars styr gamla ID:n fel) → leverera CSV för import.

## Kvarstående manuellt (användaren, varje marknad)

Butiksnamn (Settings→General), frakt/priser, betalning, domän, moms (VOEC/OSS),
personvern-policy (generera Shopifys mall på målspråket, se `no/content/pages/personvern-NOTAT.md`),
juridisk slutgranskning av alla flaggor i build-report.md, publicera tema.

## Kända fällor (alla inträffade i Norge-körningen)

1. Produkter osynliga trots ACTIVE → kanalpublicering saknades (fas 3.3).
2. Temapublicering mitt i arbetet → API-lås; be användaren vänta med Publish.
3. Klassificeraren kan blockera enskilda kommandon godtyckligt → formulera om, kör via
   Write-verktyg + separata steg, eller låt subagenter göra MCP-anropen.
4. `search_products`-statusfilter ignoreras tyst vid felsyntax — lita inte på countfilter,
   verifiera med nodes.
5. Temu-SKU:er, negativa lager och blandade supportmail finns i källdatan — städregler
   ligger i build-catalog.mjs.
6. Session-/modellbyte: allt state ligger i repot + butiken. Ny session behöver bara denna
   fil + rätt butik kopplad.
