# CaraShellFront_CS_4_1 — the winning line as a static, with the price card

**VARIABELTAGGAR:** vinkel=`erbjudandet (CS)` · hook-typ=`tre-scenersraden (svalt/varmt/mörkt)` · format=`statisk, enkel canvas` · proof=`inget` · offer-i-creativen=`559 + jämförpris 932 + 40 %` · visuell stil=`husbil exteriör, skyddet på` · textmängd=`rubrik+underrad+priskort+bottenrad` · talare=`ingen` · copy_model=`sonnet`
*(Read by the next `/notionscalercs` run to group profit contribution per variable value. Do not change them without changing the creative.)*

**Type:** Static image · **Batch:** #2 (2026-09-17) · **Copy written by:** sonnet (A/B test Fable vs Sonnet — do not rewrite the Swedish lines)
**Parent:** `CaraShellFront_CS_4_H1` (same line, same offer, video). Second comparison: the existing image `CaraShellFront_CS_2_1`, which leads with "40 % under jämförpris" (inherited `Termoskydd_CS_2_1`: 471 kr, 2 purchases — under the gate).
**Isolated variable: the format** against CS_4_H1; **the headline** (scene line vs percentage) against CS_2_1.
**Source:** winning line (see CS_4_H1) + inherited pattern 3 in dna.md: the one static in the source campaign (`SP_2_1`) had the best CPC (2,19 kr) and CTR (7,04 %) of the whole account.

## 1. Why this ad exists
Images beat video on CPC in the inherited data and cost nothing to make. If the three-scene line works as a still with a price card, CS becomes an image-first angle for this product and the video slot is freed.

## 2. Hypothesis
The line is read, not watched, so it carries in static. If CS_4_1 lands at or under CS_4_H1's CPA once both are judgeable, statics take over the offer angle.

**Hook idea:** Svalt på sommaren, varmt på vintern, mörkt när du sover.

## 3. Format
| | |
|---|---|
| Deliverables | 4:5 (1080×1350) **and** 1:1 (1080×1080). PNG or JPG, under 30 MB. |
| Photo | Exterior, the cover fitted on a motorhome's windscreen and side windows, daylight, campsite or pitch. Clean top area for the headline, right third for the price block, bottom strip for the terms. |
| Layout | Headline top, sub-line under it, price block (559 kr large, 932 kr struck, "40 % under jämförpris"), one line of terms at the bottom. |
| Text | Swedish, word for word from the table. Å/Ä/Ö must render. Drawn by the text layer (`factory/bild-text.py`), never by the image model. |

## 4. Exact text (Swedish word for word, do not re-translate)
| Element | Swedish (use this) | English meaning |
|---|---|---|
| Headline (top) | Svalt på sommaren, varmt på vintern, mörkt när du sover. | Cool in summer, warm in winter, dark when you sleep. |
| Sub-line | Utanpå rutan, 211 × 171 cm – klart på två minuter. | On the outside of the glass, 211 × 171 cm – done in two minutes. |
| Price | 559 kr | 559 kr |
| Compare price (struck-through) | 932 kr | 932 kr |
| Discount | −40 % | −40 % |
| Bottom line | Fri frakt · 5–10 arbetsdagar · 14 dagars ångerrätt | Free shipping · 5–10 working days · 14 days' right of return |

*(Main-session layout fix 2026-09-17, not a copy change: the subagent's chip text "40 % under jämförpris" was cut off at the canvas edge in the first render ("jämförp…"). The chip now carries "−40 %" — same fact, fits the chip; "40 % under jämförpris" stays in the COPY CARD. Text layer redone on the same photo, no new image credits.)*

## 5. Design brief
- The headline is the winning line, verbatim, three parts in one row — keep the commas, do not split it into three stacked lines.
- Price and struck compare price are a pair, the discount chip next to them. Nothing else on the canvas: no "IDAG", no flames, no stock line.
- The photo is the ground, the text is the ad. Product clearly visible: cover on the windscreen and both side windows.

## 7. COPY CARD (goes in Ads Manager, not in the creative)
**Primary text:**
> Svalt på sommaren, varmt på vintern, mörkt när du sover.
>
> Termoskyddet sitter utanpå rutan – glaset blir aldrig kallt inifrån, ingen imma att torka bort på morgonen. 211 × 171 cm, klart på två minuter.
>
> 559 kr (ord. 932 kr), 40 % under jämförpris. Fri frakt till Sverige och Norge, 14 dagars ångerrätt.

**Headline:** `Svalt på sommaren, varmt på vintern`
**Description:** `Utanpå rutan, 211 × 171 cm – klart på två minuter.`
**CTA button:** `Handla nu` (Shop Now)
**Destination:** https://carashell.se/products/termoskyddet

## 8. Three-question test (docs/copy-regler.md) — every delivered line
| Line | Visualise? | Falsifiable? | Only we can say it? |
|---|---|---|---|
| Svalt på sommaren, varmt på vintern, mörkt när du sover. (headline, locked line) | ✅ three sensations, "mörkt när du sover" is a picture | ✅ keeps cool/warm/dark or not | ✅ the cab and the cover's three effects, not a generic weather line |
| Utanpå rutan, 211 × 171 cm – klart på två minuter. (sub-line) | ✅ placement + size + time | ✅ measurable | ✅ exact to this product |
| Glaset blir aldrig kallt inifrån – ingen imma att vänta på. (alt) | ✅ the glass, the imma not appearing | ✅ the mechanism is measurable | ✅ outside mounting, the opposite of the curtain |
| Sidoflikarna kläms fast i dörrkarmen. Dörrarna förblir stängda. (alt) | ✅ flaps in the frame | ✅ true or false | ✅ this fastening |
| Mörkt i kupén, oavsett vad klockan är. (alt) | ✅ dark cab at any hour | ✅ blacks out or not | ✅ tied to covering the whole front |
| Svalt på sommaren, varmt på vintern (copy card headline) | ✅ sensations | ✅ measurable | ✅ part of the proven line |
| Termoskyddet sitter utanpå rutan – glaset blir aldrig kallt inifrån, ingen imma att torka bort på morgonen. 211 × 171 cm, klart på två minuter. (primary text) | ✅ a concrete morning | ✅ mechanism + size, testable | ✅ outside mounting |

Price, compare price, discount and the terms line are facts, not crafted claims, and are not tested.

**Rejected drafts:** "Bästa termoskyddet på marknaden." (adjective without a fact) · "Skydda din husbil i alla väder." (abstract) · "40 % rabatt idag!" (urgency) · "Håller huset varmt." (wrong object).

## 9. KPI
Judged against break-even CPA **347 kr** (never against target 207 kr). Read against `CS_4_H1` (format test) and `CS_2_1` (headline test). No verdict before 300 kr spend **and** 3 purchases. Shared pixel with the roof cover: read purchases per product in Shopify before judging.

## Hard rules
- Price **559 kr**, compare-at **932 kr**, **40 %**. No other numbers except 211 × 171 cm and the terms.
- **No urgency of any kind.**
- **Never claim:** material, weight, insulation value, storage bag, "tusentals", "verifierad kund", 30 days' return, free returns.
- Guarantee is **14 dagars ångerrätt enligt svensk lag**.
- No people, no faces, no logos drawn by the image model.

## IMAGE PROMPT
A clean photorealistic exterior photograph of a modern white motorhome parked on a quiet campsite pitch in bright, even daylight, seen from the front at a slight three-quarter angle. A dark grey thermal cover is fitted on the OUTSIDE of the windscreen and both front side windows, stretched taut and smooth, its side flaps tucked into the door frames, covering the whole front cab. Light gravel ground, a few pine trees far behind, pale sky. Product-forward commercial lighting, sharp detail on the fabric. Leave a large clear, uncluttered area across the top third of the frame for a headline, a clean area on the right third for a price block, and a clean strip along the bottom edge. No text, no people, no faces, no logos, no numbers, no price tags, no badges.

REFERENCE IMAGES:
- https://cdn.shopify.com/s/files/1/1013/0322/2621/files/b6-termoskydd-se.jpg

ASPECT: 4:5

END IMAGE PROMPT
