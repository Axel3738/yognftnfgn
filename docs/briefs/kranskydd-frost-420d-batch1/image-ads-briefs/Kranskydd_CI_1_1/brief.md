# Kranskydd_CI_1_1 — IMAGE: honest season-urgency, replaces the broken CS/discount static

**VARIABELTAGGAR:** vinkel=`fomo` · hook-typ=`påstående` · format=`textheavy` · proof=`inget` · offer-i-creativen=`pris syns (309), ingen rabatt` · visuell stil=`text-tung` · textmängd=`rubrik+underrubrik` · talare=`ingen`

**Type:** Static, bold text-forward urgency ad — same visual weight class as
CS_2_1 ("23% RABATT – IDAG!") but with an honest, real claim instead of a
fabricated discount.
**Hypothesis:** CS_2_1's layout (big bold claim, isolated product, minimal
copy) is a good FORMAT — the problem is the CLAIM (a fake 23 % discount that
does not exist in Shopify; see dna.md BLOCKER). Keeping the same punchy
layout but replacing the lie with a true, weather-based urgency claim should
preserve whatever scroll-stopping power the format has without the
compliance risk.
**Isolated variable:** the claim itself (discount → season/timing), format
held constant.
**Kept:** bold all-caps headline style, isolated product on plain background,
minimal supporting text.
**Changed:** headline content — no percentage, no "rea", no fake scarcity.

**Format:** Static, 1:1 (1080×1080) + 4:5 (1080×1350) · **Production level:**
Simple (text-on-plain-background, same style as the existing CS_2_1 asset —
see `reference-assets/DO_NOT_REUSE_...` for what to avoid).
**Ad set:** Kranskydd test-ABO (new, separate from the scaling ad set)
**CTA:** Handla nu (SHOP_NOW)
**Landing page:** https://baverbutiken.se/products/kranskydd-frost-420d-skyddar-utekranen-i-vinter

## Why this ad exists (from the 2026-08-29 teardown)
CS_1_H1/H2/H3 and CS_2_1 claim "23% RABATT" and "vinterrean" — Shopify has
one flat price (309 kr), no compare-at price, no discount code. This is a
BLOCKER (ARBETSREGLER #7), not a performance note. This ad replaces that
angle's FORMAT (which may well have been part of why CS_1_H3 got its one
early purchase) with a true claim, so the account doesn't simply lose the
angle while the discount question is unresolved with Axel.

## Design brief
- Plain light background, product isolated and centered (same treatment as
  the existing CS_2_1 asset — reuse that composition, replace the text only).
- Bold black all-caps headline at top.
- Smaller supporting line at bottom, no discount percentage anywhere, no
  "lagret tar slut" (that claim is also false relative to Shopify's actual
  -17 oversold inventory — see dna.md — never reference stock levels here).

## Exact text (Swedish word-for-word — do not paraphrase)

| Element | Swedish (use this) | English meaning |
|---|---|---|
| Headline | KYLAN ÄR PÅ VÄG. | THE COLD IS COMING. |
| Subhead | Skydda kranen innan den fryser — 309 kr | Protect the tap before it freezes — 309 kr |
| Supporting line | Ingen rabatt. Bara rätt tajming. | No discount. Just the right timing. |
| CTA button | Handla nu → | Shop now → |

**Price integrity:** 309 kr stated exactly, explicitly framed as NOT a
discount (the supporting line exists specifically to prevent this reading as
another fake-sale ad). No percentage, no compare-at price, no stock-scarcity
claim.

## Primary KPI
CTR and thumb-stop rate vs. the account's existing bold-text statics
(CS_2_1's CTR was ~3,1% per Meta, though its LPV quality was the weakest in
similar past batches — watch LPV→ATC, not just CTR). Secondary: CPA vs.
322 kr break-even after ≥300 kr/3 purchases.

## What we learn regardless
Whether the bold-claim FORMAT itself was ever the reason CS ads got any
traction, independent of the (false) discount — the honest answer either
frees this format up for reuse elsewhere, or confirms it should retire with
the discount claim.
