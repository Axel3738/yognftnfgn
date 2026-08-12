# Image Ad Briefs – Seatcover (Sätesöverdrag för Åkgräsklippare)

Global rules for ALL static ads in this package. Each ad has its own folder with a self-contained `brief.md`. Reference files (the actual existing ads) are in `reference-assets/` — read the file names before reusing anything.

## Product facts (single source of truth — never improvise)
- Seat cover for riding lawn mowers, 600D Oxford, water-repellent, padded inside, adjustable straps, fits most riding mowers/garden tractors, on in under 60 seconds without tools.
- Colors: 4 (Grå / Svart / Grön / Ljusgrå).
- **Price: 649 kr. Original price: 811 kr.** Exactly these numbers everywhere. A crossed-out 811 must be a REAL strikethrough line drawn over the digits.
- Free shipping in Sweden. Klarna. 30-day money-back guarantee ("30 dagars nöjd-kund-garanti" / "30 dagars öppet köp").
- Landing page: https://baverbutiken.se/products/satesoverdrag-for-akgrasklippare-slittaligt-600d-oxford

## Hard rules
1. Product clearly visible and dominant in every image.
2. All Swedish on-image text word-for-word from the "Swedish (use this)" column of each brief. Never re-translate or paraphrase.
3. **Known failure modes from this account — check every export against these:**
   - AI image generators rendering meta-instructions as text. A shipped ad literally displayed the word "**överstruket**" ("strikethrough") next to the price. Proof every word in the image.
   - AI-garbled Swedish glyphs (broken å/ä/ö, doubled letters). Zoom to 200% and read every line.
   - Fabricated testimonials: never invent quotes, star-ratings, "Verifierad kund", ages, or review counts. Only real, documented reviews may be quoted (one brief is blocked pending the review export).
4. Spelling traps: "sätesöverdrag", "åkgräsklippare", "vadderad", "nöjd-kund-garanti", "öppet köp".
5. Export formats: **1:1 (1080×1080) AND 4:5 (1080×1350)** for every ad.
6. Naming: exported file = folder's ad name exactly (e.g. `Seatcover_SO_1_2`). Never reuse an AD ID; a new version of an existing static takes the next variant digit on the same AD ID.
7. Keep text within inner 90% safe area; min body size ~28px at 1080w.

## reference-assets/
| File | Status |
|---|---|
| `DO_NOT_REUSE_Seatcover_SO_1_1_offer-static_811-text-bug.jpg` | **Best-performing static in the account (3 purchases, CPA 281 kr, ROAS 2.77) BUT contains the "överstruket" text bug. Use ONLY as layout reference for Seatcover_SO_1_2. Never publish.** |
| `DO_NOT_REUSE_Seatcover_SP_3_1_fake-testimonial.jpg` | Fabricated AI testimonial ("Verifierad kund, 54 år") + garbled glyphs. Banned. Kept only so you can see what NOT to do. |
| `REFERENCE_unused-PD-static_torrt-och-skont.jpg` | Clean unused product static (yellow mower, headline layout). Good tone/typography reference. May be reused as base imagery. |

## KPI context
- The offer static's strength was conversion (LPV→purchase 6.1%, double the video winner) at low CTR — statics here work as qualifiers, not clickbait. Judge new statics on CPA after 500 kr, not on CTR.
