# Rodholder_SO_6_1 — "72 kr per clamp" (value framing)

**Objection this kills:** *Is 289 SEK worth it for a few plastic clips?*

**Variable tags:** vinkel=värde · hook-typ=siffra/pris · format=text-tung static · proof=siffra · offer=pris syns · visuell stil=grafik+produkt · textmängd=rubrik+underrubrik+footer

**Type:** Static · **Production:** low (b020 format) · **Tier 2**

---

## Why this ad exists

**Sources:** two.
1. **Backlog item** "värde-framing 72 kr/hållare", carried since 2026-08-21 and
   never tested. Marked `[ANVÄND I BATCH #5]` in `products/fiskespohallaren/backlog.md`.
2. **`Rodholder_PD_6_1`** — the account's only static with real data: 7.27 %
   purchase-per-click and 13.2 % ATC/LPV, both far above the video average. It
   shows a price. Statics that state the offer plainly convert well here.

The arithmetic is honest and does the work: 289 / 4 = 72.25 SEK per clamp. A
number the buyer can check reframes the purchase from "289 for clips" to "72 for
a clamp", and 4 clamps covering two rods makes the pack size feel purposeful
rather than arbitrary.

## Design

- b020 static format. Headline is the number — make it the largest element on the
  canvas. Subhead below. Product centre. Footer strip.
- Show **four clamps** clearly (the `Rodholder_PROD_V07` layout already does this
  well — a 2×2 grid of clamps). Reuse that composition if available.
- No wall, no mounting. Product only, or the clamp closed around two rod halves.
- Export 1:1 and 1080×1350.

## Text (Swedish verbatim — use the ⭐ line)

| Element | Swedish (use this) | English meaning |
|---|---|---|
| Headline ⭐ | 72 kr per klämma. | 72 kr per clamp. |
| Subhead ⭐ | 289 kr för fyra — räcker till två spön. | 289 kr for four — enough for two rods. |
| Footer ⭐ | 4-pack, 289 kr. 72 kr per klämma. | 4-pack, 289 kr. 72 kr per clamp. |

Alternatives: Headline "4 klämmor, 289 kr — cirka 72 kr styck." / "Fyra klämmor för 289 kr." · Subhead "Ett pack, två spön redo för resan." / "Fyra klämmor i förpackningen, inga sålda lösa." · Footer "289 kr. Fyra klämmor. Klart." / "Räcker till hela familjens spön."

**Three-question test (⭐ lines):** Headline ✅✅✅ · Subhead ✅✅✅ · Footer ✅✅✅. All three pass 3/3.

**Rounding note:** 289 / 4 = 72.25 SEK, written as "72 kr" in the copy. If Axel
prefers the exact figure, use `72,25 kr` — do not round *down* further, and never
write a lower per-unit price than the arithmetic supports.

## Body (primary text)

Shared primary text from `../README.md`, or **Alternative 2 (value-led)** which
opens on the same arithmetic.

## KPI & learning

Primary KPI: profit contribution. Diagnosis: ATC/LPV vs `PD_6_1`'s 13.2 %.
**We learn regardless:** whether per-unit value framing beats total-price framing
on this product — a finding that transfers to every multi-pack in the store.
