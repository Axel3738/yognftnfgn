# image-ads-briefs — Sushi-Strumpor batch #3 (2026-09-17)

Ten image ads, one folder each, every brief self-contained. Build in Tier order.

| Tier | Ad name | Folder | One line |
|---|---|---|---|
| 1 | `MATSTRUMP_sushi_curiosity_product_029_v1` | `029-enladan/` | The single box — the twist on one box |
| 1 | `MATSTRUMP_sushi_curiosity_beforeafter_030_v1` | `030-utrullad/` | Unrolled — the twist as a still image |
| 1 | `MATSTRUMP_sushi_pain_lifestyle_031_v1` | `031-rolig-anvands/` | Fun tonight, worn tomorrow — the position as a picture |
| 1 | `MATSTRUMP_sushi_conflict_comparison_032_v1` | `032-anti-presentkort/` | The gift card — conflict angle |
| 1 | `MATSTRUMP_sushi_offer_product_035_v1` | `035-fyra-lador/` | Four boxes — near iteration of the account's best image |
| 1 | `MATSTRUMP_sushi_curiosity_product_037_v1` | `037-textfri-kontroll/` | Text-free control — the product photo as-is |
| 1 | `MATSTRUMP_sushi_curiosity_product_038_v1` | `038-obs-etiketten/` | The warning label — "OBS: INTE SUSHI" |
| 2 | `MATSTRUMP_sushi_social_textheavy_033_v1` | `033-beviset/` | The proof — one real number (Christmas allowed) |
| 2 | `MATSTRUMP_sushi_identity_product_034_v1` | `034-extra-lax/` | Extra salmon — the recipient's habit, aimed at the giver |
| 2 | `MATSTRUMP_sushi_gift_product_036_v1` | `036-julstrumpan/` | The Christmas stocking — last year's winning line as a still (Christmas allowed) |

## Global rules (repeated in every brief — read once, then never break them)

- **Correct price and offer only.** 399 kr / 798 kr where the brief says so. The offer is written exactly **KÖP 1 – FÅ 1 GRATIS** (or **KÖP 2 – FÅ 2 GRATIS** in 035). Never "299 kr", never "3-par 369 kr", never a percentage, never "rea".
- **The product must be the real product** — same box, same five sock designs, wooden chopsticks. Product photos in `reference-assets/product-photos/`.
- **Product fills at least half the frame. No people, no faces** (031: adult feet only).
- **Swedish text word for word from the brief, set as real typography** (never rendered by an image model — the 2026-08-27 set proved models misspell å/ä/ö). Poppins Bold or equal, white with soft shadow, red pill badge.
- **No size, no material claims, no invented quotes, no "lurad".** Christmas only in 033 and 036.
- **Export 4:5 (1080×1350) and 1:1 (1080×1080).** File name = ad name.
- **AI scene allowed, product true to photo, AI use reported** (Meta AI disclosure ON).

## Spelling traps

`Köp 1 – Få 1` (en dash) · `sushilåda` · `ätpinnar` · `förklädda` · `byrålåda` · `julstrumpan` · `dubbeltitt` · `presentkort`

## reference-assets/

- `winners/WINNER_d3_…` — the account's best image right now (CPA 252, 15 purchases). Layout to learn from; 035 reuses its base picture.
- `winners/DO_NOT_REUSE_old-price-50pct_…` — last year's two best statics. **Layout reference only**: they carry "50 %" and the old 299 kr price and must never be re-uploaded.
- `winners/DO_NOT_REUSE_LOSER_fiskbil…` — a person with a small product: worst static of last year (CPA 273). This is what NOT to do.
- `winners/VIDEO-WINNER-FRAME_…` — frames from the two best videos ever; 030 copies the unrolled-sock frame as a still.
- `winners/DO_NOT_COPY_LOSER-FRAME_haikuh3…` — the current top spender's frame (story hook, ROAS 0.93). Not a reference.
- `product-photos/pdp_01–09` — the real product from matstrumpor.se. 037 uses `pdp_03.jpg` as-is.
- `bogo-2026-08-27/` — the ready-made BOGO set (D1–D4 finals + P1–P6 bases). D1, D2, D4 are re-launched as-is (see LAUNCH.md); 035 reuses P3.
