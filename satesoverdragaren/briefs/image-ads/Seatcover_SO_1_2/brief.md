# Seatcover_SO_1_2 — Fixed offer static (replaces the "överstruket" bug version)

**Type:** Corrected version of the account's best-converting static (`Seatcover_SO_1_1`, CPA 281 kr, ROAS 2.77, LPV→purchase 6.1%). Same AD ID, next variant digit (1→2) so the fix reads as a clean A/B in Ads Manager.
**Format:** Static · 1:1 (1080×1080) + 4:5 (1080×1350)
**Production level:** Simple (rebuild of existing layout)
**Primary KPI:** CPA (target ≤ 281 kr)

## Hypothesis
`SO_1_1` converts best in the account **despite** a glaring text bug (the word "överstruket" printed in the image instead of an actual strikethrough). Removing the bug removes a credibility leak at zero message risk. Isolated variable: **the bug fix** — layout, message and offer stay identical.

## Layout reference
`reference-assets/DO_NOT_REUSE_Seatcover_SO_1_1_offer-static_811-text-bug.jpg` — copy its composition exactly: light grey studio background, two covers (black behind, grey/yellow front) angled bottom-right, price block top-left, corner ribbon top-right, CTA chip bottom-right.

## Exact on-image text
| Position | Swedish (use this) | English meaning | Styling |
|---|---|---|---|
| Top-left, line 1 | 811 kr | 811 kr | Red or grey digits with a REAL diagonal strikethrough line drawn across. No other words on this line. |
| Top-left, line 2 | NU 649 KR | NOW 649 KR | Largest text, yellow (#F5C518-ish, match reference) |
| Top-left, line 3 | FRI FRAKT · BETALA MED KLARNA | FREE SHIPPING · PAY WITH KLARNA | Black caps |
| Top-left, line 4 | 30 DAGARS ÖPPET KÖP | 30-DAY RETURNS | Black caps |
| Top-right ribbon | BEGRÄNSAT ANTAL I LAGER | LIMITED STOCK | Diagonal corner ribbon, black on yellow |
| Bottom-right chip | TA DITT NU | GET YOURS NOW | Button-style chip, dark bg, white text |

**QA checklist before export:** the word "överstruket" must appear NOWHERE; every å/ä/ö correct; digits exactly 811 / 649.

## Design brief
- Product photography: reuse the exact product images from the reference (two covers, front one grey with yellow panel). No AI re-generation of the product.
- Keep negative space top-left for the price block; don't crowd the ribbon.
- 4:5 version: extend background vertically, keep all text blocks in the same relative positions.

## Ad copy (unchanged from SO_1_1)
| Field | Swedish (use this) | English meaning |
|---|---|---|
| Primary text | Ett nytt originalsäte kostar tusenlappar. Det behöver det inte göra. 💸 Sätesöverdrag i kraftigt 600D Oxford – just nu 649 kr istället för 811 kr. ✅ Vattenavvisande utsida, vadderad insida ✅ Justerbara remmar som sitter kvar ✅ Fri frakt inom Sverige – betala sen med Klarna ✅ 30 dagars öppet köp. Begränsat antal i lager. 👉 Ta ditt via länken innan färgerna tar slut. | A new original seat costs thousands. It doesn't have to. 600D Oxford seat cover – now 649 kr instead of 811 kr. Water-repellent outside, padded inside, straps that stay put, free shipping + Klarna, 30-day returns. Limited stock. Get yours via the link before the colors sell out. |
| Headline | Rädda sätet – slipp byta hela dynan | Save the seat – skip replacing the whole cushion |

## CTA
Button: **Handla nu** (SHOP_NOW).

## What we learn regardless of outcome
If CPA ≤ 281 kr → confirms the offer static as the account's conversion workhorse with a clean asset; scale and build SO_1_3 (color-variant test) next. If CPA notably better → quantifies what sloppy AI text costs; hard-gate all future AI statics through the QA checklist. If worse (unlikely) → the difference is delivery noise; re-judge at 3+ purchases.
