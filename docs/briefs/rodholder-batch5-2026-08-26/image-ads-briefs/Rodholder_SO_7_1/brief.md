# Rodholder_SO_7_1 — "30-day guarantee" (reassurance)

**Objection this kills:** *What if it doesn't work for my rod and I've wasted the money?*

**Variable tags:** vinkel=trygghet · hook-typ=påstående · format=text-tung static · proof=garanti · offer=pris syns · visuell stil=grafik+produkt · textmängd=rubrik+underrubrik+footer

**Type:** Static · **Production:** low (b020 format) · **Tier 2**

---

## Why this ad exists

**Source:** the `Rodholder_PROD_V01–V10` statics the team built on 2026-08-25.
Those ads pair each headline with the footer *"4-pack 289 kr – 30 dagars
nöjd-kund-garanti"*, while the parallel `REA_V01–V10` set uses
*"så långt lagret räcker"*. It is a clean isolated test — **reassurance vs
scarcity** — but neither set has received enough budget to produce a verdict
(109 SEK and 94 SEK respectively, zero purchases).

This ad makes reassurance the **headline** rather than the footer, so the variable
gets a fair test instead of living in small print.

It matters more than usual right now: the campaign is reaching a broader, colder
audience as budget scales (CPA 101 → 324 SEK over eight days, see
`batch-log.md` Avläsning #4). Colder traffic needs risk removed, not pressure applied.

## Design

- b020 static format. Headline top and large. Subhead below. Product centre.
  Footer strip.
- The guarantee is the message — give it visual weight. A simple badge or seal is
  fine; keep it calm and legible, not a loud starburst.
- Product only, or the clamp closed around two rod halves. **No wall, no mounting.**
- Export 1:1 and 1080×1350.

## Text (Swedish verbatim — use the ⭐ line)

| Element | Swedish (use this) | English meaning |
|---|---|---|
| Headline ⭐ | 30 dagars nöjd-kund-garanti. | 30-day satisfaction guarantee. |
| Subhead ⭐ | Testa den på ditt spö. Ångra dig inom 30 dagar. | Try it on your rod. Change your mind within 30 days. |
| Footer ⭐ | 289 kr. 30 dagars nöjd-kund-garanti. | 289 kr. 30-day satisfaction guarantee. |

Alternatives: Headline "30 dagar på dig att testa den." / "Håller den inte måttet: 30 dagars garanti." · Subhead "30 dagar räcker för att veta om den håller." / "Passar den inte som väntat — du har 30 dagar på dig." · Footer "4-pack, 289 kr. 30 dagars garanti." / "Testa den. Behåll den om den håller måttet."

**Three-question test (⭐ lines):** Headline ✅✅❌ (a 30-day guarantee is an industry-standard phrase — any competitor can sign it) · Subhead ✅✅✅ (tied to "ditt spö", which makes it specific to the fit worry) · Footer ✅✅❌. No line failed 3/3, and the subhead carries the uniqueness.

⚠️ **Wording check:** the verified term is **nöjd-kund-garanti** (satisfaction
guarantee), taken from the product page. Do not write "öppet köp", "fri retur" or
"pengarna tillbaka utan frågor" — those are different promises we have not verified.

## Body (primary text)

Shared primary text from `../README.md`.

## KPI & learning

Primary KPI: profit contribution. Diagnosis: purchase-per-click, and comparison
against the `REA` (scarcity) statics **once both have budget**.
**We learn regardless:** whether reassurance or urgency is the stronger closing
mechanic for this product — which decides what replaces the retired `CS_1` claims
across the whole account.
