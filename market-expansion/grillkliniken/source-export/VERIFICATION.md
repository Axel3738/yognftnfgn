# Slutverifiering — Grillkliniken temaexport

- **Datum:** 2026-08-13
- **Tema:** `gid://shopify/OnlineStoreTheme/183618928964` (MAIN/live)
- **Katalog:** `market-expansion/grillkliniken/source-export/theme/`
- **Manifest:** 464 filer (filename + size + checksumMd5) hämtade i 2 sidor via Admin GraphQL (`themes(roles:[MAIN]) { files }`).

## Slutstatus

**464 av 464 filer är byte-exakta (MD5 matchar Shopifys `checksumMd5`). 0 semantiskt-identiska undantag. 0 saknade. 0 extra filer på disk.**

Även filstorlekarna på disk matchar API:ts `size` för samtliga 464 filer.

## MD5-svep före reparation

| Status | Antal |
|---|---|
| Match | 439 |
| Mismatch | 25 |
| Saknas | 0 |

Alla 25 mismatchar var JSON-filer lagrade i Shopifys "dekorerade" API-form (auto-genererad `/* ... */`-banner + pretty-print). `sections/gp-section-619570878011147057.liquid`, som misstänktes för dolt avskriftsfel, visade sig redan vara byte-exakt på disk (MD5 `ee99ce40510f4deda63de3f015a4fded`).

## Reparerade filer (25 st, alla nu byte-exakta)

Recept per fil: banner strippad, därefter den serialiseringsvariant vars MD5 matchade `checksumMd5`.
Varianter: `stripped` = serverat innehåll minus banner; `min_ascii` = `json.dumps(..., separators=(',',':'), ensure_ascii=True)`; `min_uni` = dito med `ensure_ascii=False`; `+go` = `<`, `>`, `&` ersatta med `<`, `>`, `&`; `+sl` = `/` escapat som `\/`.

| Fil | Variant |
|---|---|
| locales/es.json | stripped |
| locales/sv.json | min_uni |
| templates/article.json | min_ascii |
| templates/collection.collection-landing.json | min_ascii |
| templates/collection.json | min_uni+sl |
| templates/index.gem-backup-default.json | stripped |
| templates/page.about.json | min_ascii |
| templates/page.gp-template-617120899732079297.json | min_uni+go |
| templates/page.gp-template-619570877842850609.json | min_uni+go |
| templates/page.gp-template-620621395537167335.json | min_uni+go |
| templates/page.gp-template-621092885420311199.json | min_uni+go |
| templates/page.gp-template-621645129530213322.json | min_uni+go |
| templates/page.gp-template-621654614126625379.json | min_uni+go |
| templates/page.gp-template-623152569501352481.json | min_uni+go |
| templates/page.gp-template-623155472295265048.json | min_uni+go |
| templates/page.gp-template-625316677424251479.json | min_ascii |
| templates/page.gp-template-626533702947570475.json | min_ascii |
| templates/page.gp-template-626633374324228695.json | min_ascii |
| templates/page.gp-template-626648399864660651.json | min_ascii |
| templates/page.gp-template-627712796158591588.json | min_ascii |
| templates/page.gp-template-631303000391942918.json | min_uni+go |
| templates/page.json | min_ascii |
| templates/product.gem-1777361826-template.json | stripped |
| templates/product.grill-golf-kit.json | min_uni+sl |
| templates/product.preorder.json | min_ascii |

## Semantiskt-identiska undantag

**Inga.** De 5 GemPages-mallar som tidigare bedömdes omöjliga att rekonstruera byte-exakt
(`templates/page.gp-template-{619570877842850609, 621654614126625379, 631303000391942918, 621092885420311199, 623155472295265048}.json`)
kunde alla rekonstrueras byte-exakt med varianten `min_uni+go` (minifierad JSON, `ensure_ascii=False`, med `<` `>` `&` escapade som `<` `>` `&`). Nyckelordningen bevaras av `json.loads`/`json.dumps` (insättningsordning), så inget informationsbortfall förelåg.

## Metod

1. Fullt manifest (464 poster) hämtades i 2 GraphQL-sidor (`files(first: 250, after: ...)`) med `filename`, `size`, `checksumMd5`; sparat som scratchpad `checksums-final.json`. Manifestet validerades: 464 unika filnamn, alla checksummor 32 hex-tecken. Att samtliga 464 MD5 slutligen matchar utesluter i praktiken avskriftsfel i manifestet (kollisionssannolikhet ~2^-128 per fil).
2. MD5-svep: `hashlib.md5` på varje fil på disk jämfört mot `checksumMd5`.
3. Reparation: för varje mismatch strippades Shopifys auto-genererade kommentarbanner, varefter serialiseringsvarianter (raw/stripped/minifierad × ensure_ascii × Go-escaping × `\/`-escaping × ± trailing newline) provades tills MD5 matchade. Endast den byte-exakt matchande varianten skrevs till disk. Inga semantiska ändringar gjordes — alla reparationer är omserialiseringar av exakt samma JSON-innehåll.
4. Slutsvep bekräftade 464/464 MD5-match samt storleksmatch; resultat per fil i `verification-final.jsonl`.

## Maskinläsbart resultat

`verification-final.jsonl` — en rad per fil: `{"filename": ..., "md5_ok": true, "repaired": true?}`.
