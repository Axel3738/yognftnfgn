# Rodholder — Image Ads Batch #2 (2026-08-21) — GLOBAL RULES

Read this first. Every rule applies to EVERY static brief in this folder. Each brief is self-contained.

## Product & offer (source of truth)

- Product: **Fiskespöhållare 4-Pack** (fishing rod holder clamps, 4-pack). Landing page: https://baverbutiken.se/products/fiskespohallare-4-pack-kraftig-forvaring
- Price: **289 kr for the 4-pack — the ONLY price allowed.** Per-clamp framing allowed exactly as written in briefs (72 kr-style lines come verbatim from the Swedish column).
- ❌ FORBIDDEN anywhere on the image: **149 kr, 148,75 kr, any "% RABATT" / discount claim, countdowns, "rea"**. See `reference-assets/DO_NOT_REUSE_*` for what NOT to copy.
- "Fri frakt" only with threshold: **"Fri frakt över 300 kr"**.
- Allowed trust: "30 dagars nöjd-kund-garanti", "Betala sen med Klarna".

## Hard production rules

1. **Product visible and recognizable at feed size.** The orange clamp is the eye-catcher — keep it large, in focus, high contrast.
2. **No AI-generated humans.** No invented customer photos. (The old SP static broke this rule — it is in DO_NOT_REUSE.)
3. **Swedish text word-for-word from the brief's "Swedish (use this)" column.** Spelling traps: *Fiskespöhållare*, *trassliga*, *ihopfällda*, *spön*, *förrådet*, *väggen*.
4. Text hierarchy per brief: headline biggest, subline smaller, footer/CTA smallest. Max text amount = what the brief specifies — do not add lines.
5. One-second test: the message must land at scroll speed, in feed, on a phone.
6. **Export: 1:1 (1080×1080) AND 1080×1350 (4:5)** per ad.
7. Naming: exact ad name from the brief folder, e.g. `Rodholder_PD_7_1`.

## reference-assets/

- `PRODUCT_*` — real product/landing-page images. Use these for product truth (shape, color, mounting holes). The product is ORANGE — do not recolor.
- `PD_2_1_style-reference_never-got-spend.png` — layout style reference (photoreal scene + short bold headline). Composition is good; it has no performance data.
- `GT_2_1_style-reference_caution-ai-product-shapes.png` — layout reference ONLY; the AI product renders are off-model, never trace them.
- `DO_NOT_REUSE_CS_2_1_false-40pct-discount-claim.png` — false discount claim. Never reuse the claim or the layout's price mechanics.
- `DO_NOT_REUSE_SO_2_1_old-price-149kr-burned-in.png` — old price burned in. Never reuse.
- `DO_NOT_REUSE_SP_2_1_ai-person-unverified-quote.png` — AI person + unverifiable quote. Never reuse.

## Delivery checklist per ad

- [ ] Product large and in focus, orange, correct shape (check PRODUCT_* refs)
- [ ] All text verbatim from brief, spelled exactly
- [ ] 289 kr correct; no forbidden numbers/claims
- [ ] Both exports (1:1 + 1080×1350)
- [ ] Readable at thumbnail size
