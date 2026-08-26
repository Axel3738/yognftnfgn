# Rodholder_CS_4_1 — "We never run sales" (honest anti-urgency)

**Objection this kills:** *Is this one of those fake countdown sales — should I wait for a better price?*

**Variable tags:** vinkel=trovärdighet · hook-typ=påstående · format=text-tung static · proof=inget (policy-påstående) · offer=pris syns · visuell stil=grafik+produkt · textmängd=rubrik+underrubrik+footer

**Type:** Static · **Production:** low (b020 format) · **Tier 1 — this is the replacement for our unverifiable urgency ads**

---

## Why this ad exists — read this before designing it

The `CS` ad set is the **most efficient in the account**: CPA 121 SEK, ROAS 3.47,
**1.39 SEK of profit per SEK spent** — nearly 3× the no-offer ads (0.50 SEK).
Urgency framing works on this product.

The problem is what our urgency currently says. The live `CS_1` copy claims
"40 % RABATT", "IDAG ENDAST", "Vi rensar lagret", "Få kvar i lager", "Priset går
tillbaka till ordinarie imorgon" and "Fri frakt på alla ordrar över 300kr".
There is **no compare-at price on the product page** (removed on Axel's decision
2026-08-21), the ad has run continuously since 18 August, and at 289 SEK the
300 SEK shipping threshold is not reached. None of it stands up.

**The strategic bet of this ad:** take the mechanic that works — a reason to act —
and make it true by inverting it. In a feed saturated with countdown timers and
fake discounts, *"we never run sales"* is both honest and differentiating.
A competitor running a sale literally cannot sign this line.

## Design

- b020 static format (the account's best-performing static layout, ROAS 2.53 —
  see `pipeline/b020-format.mjs`).
- Headline top, large. Subhead below it. Product photo centre. Footer strip.
- **The product photo must show the corrected job:** the clamp closed around the
  two halves of a rod, or four clamps as a pack. **No wall, no mounting, nothing
  screwed to anything.**
- Deliberately calm design. No countdown graphics, no flame icons, no red
  "SALE" badge — the whole point is that this ad looks different from the ads
  around it. Restraint is the creative.
- Export 1:1 and 1080×1350.

## Text (Swedish verbatim — use the ⭐ line)

| Element | Swedish (use this) | English meaning |
|---|---|---|
| Headline ⭐ | Vi kör aldrig rea. | We never run sales. |
| Subhead ⭐ | 289 kr. Hela året. Ingen räkning att göra. | 289 kr. All year. No math to do. |
| Footer ⭐ | 4-pack, 289 kr. Fast pris. | 4-pack, 289 kr. Fixed price. |

Alternatives: Headline "Samma pris i augusti som i december." / "Inget klipp att vänta på. Bara ett pris." · Subhead "Priset står stilla — till skillnad från spödelarna utan klämma." / "Ingen countdown. Ingen falsk klocka." · Footer "289 kr idag, 289 kr i morgon." / "Ett pris att lita på."

**Three-question test (⭐ lines):** Headline ❌✅✅ (a pricing policy has no physical object to picture, but it is verifiable and no discounting competitor can claim it) · Subhead ✅✅✅ · Footer ✅✅✅. No line failed 3/3.

⛔ **This ad must not contain a single scarcity or discount word.** That is its
entire premise. If any version of it says "limited", "while stocks last" or shows
a struck-through price, it has been broken.

## Body (primary text)

Use the shared primary text from `../README.md`, or **Alternative 2 (value-led)**.

## KPI & learning

Primary KPI: profit contribution. Diagnosis: CPA and purchase-per-click **against
`CS_1_H1`'s 126 SEK / 4.49 %** — the ad it is designed to replace.
**We learn regardless:** whether the CS ad set's advantage came from urgency
*pressure* or simply from having a clear reason to buy. If this holds, the account
can drop every unverifiable claim without losing money — which is the single most
valuable thing we could learn this month.
