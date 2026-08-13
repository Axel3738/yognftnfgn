# Grillkliniken — källexport (2026-08-13)

Komplett ögonblicksbild av `grillkliniken.se` (Shop 94701748548, SEK, plan Shopify),
tagen inför Mexiko-kloningen. Allt hämtat via Admin API (bulkOperationRunQuery där det gick).

## Filer

| Fil | Innehåll |
|---|---|
| `products.bulk.jsonl` | 42 produkter (36 ACTIVE, 6 UNLISTED), 56 varianter, 92 produktbilder, 75 metafältrader — titel, descriptionHtml, SEO, options, priser, lager, vikt, inköpspris |
| `collections.bulk.jsonl` | 4 kollektioner (Startsida, Förkläden, Grillredskap, Knivar & Skärbrädor) med produktmedlemskap |
| `pages.bulk.jsonl` | 43 sidor — 6 med innehåll (Om Oss, Integritetspolicy, Retur, Frakt, Användarvillkor, Garanti), 37 GemPages-referenser |
| `files.bulk.jsonl` | 230 filer i Files-sektionen (loggor, herobilder, annonsbilder) med CDN-URL:er |
| `images/` | **Alla 228 unika bilder nedladdade som binärer** (296 MB), `manifest.json` mappar URL → lokal fil |
| `theme/` | Live-temat (Impulse, id 183618928964) fil för fil — ~464 filer inkl. ~230 GemPages-sektioner |
| `menus.json` | Huvudmeny, sidfot, kundkonto-meny |
| `shipping.json` | Fraktprofil: SE Postnord 61 kr + fri ≥1 kr, EU/Internationell 299 kr. **MX saknas!** |
| `shop-info.json` | Butiksdata, teman, marknader, policies, noteringar |

## Viktigt att veta inför Mexiko-kloningen

1. **Temat är Impulse** — samma familj som Bäverbutiken → hela PLAYBOOK.md:s temafas gäller rakt av.
2. **GemPages-landningssidorna** (37 st, bl.a. "Brynis", "#1–#12"-vinklarna, "Vi testade i 30 dagar"):
   själva sidorna är tomma skal — innehållet ligger i `theme/sections/gp-section-*.liquid`
   (~230 filer) + `theme/templates/page.gp-template-*.json`. De KAN kopieras till nytt tema
   via themeFilesUpsert, men GemPages-appens redigerare i nya butiken känner inte igen dem
   (app-datat följer inte med) — de blir statiska kopior som fungerar men inte kan redigeras i GemPages.
3. **Checkout-policiernas texter** = samma som sidorna (retur/villkor) + Shopifys mall (integritet).
   Finns i `pages.bulk.jsonl`.
4. **Specialmallar:** `grill-golf-kit` (32 produkter), `mastern` (2), `borst-polerhuvud` (1).
   Kolla variant_picker-blocket i dem (PLAYBOOK fälla 21) innan lansering.
5. **Källdatan är ren:** 0 externa CDN-bilder i beskrivningarna (ingen Temu-fälla här).
6. **Användarvillkoren lovar "alltid fri frakt"** och org-nr-fältet innehåller ett personnummer
   (060504-1276) + "kundsupport@gmail.com" (fel domän?) — flaggas inför MX-sidorna.
7. Butiken säljer redan internationellt (EU + 14 länder à 299 kr frakt) men INTE till Mexiko.
