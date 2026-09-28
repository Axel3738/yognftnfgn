# Solcellslampa_FD_2_1 — Father's Day sale static: gift headline, sale badge, price band, order deadline

**Make:** A static built on the product photo: a Father's Day gift headline and sub-line in a white text box on top, a red "Fars dag-rea" badge in the top corner, a price band with the sale price and the compare-at price, and the order deadline (19 October) as the bottom line. Sweden only.
**Format:** Static 4:5 (1080×1350) + 1:1 (1080×1080)
**Why:** Axel's order 2026-09-28: one Father's Day sale batch on every product we scale and brief in Notion ("fars dag-rea … fars dag den åttonde november"); the sale is today's compare-at price (Axel, same day). The product's best video ranked on profit contribution is Solcellslampa_PD_3 (Meta ad 120250253967570291), the product demo that opens on an older man with the remote beside the lamp on a pole ("210 lampor, tre huvuden") — the product's top spender: 9 887 kr, 25 purchases, ROAS 2.13, CPA 395 kr against break-even CPA 518 kr (30-day AOV 839 kr ÷ BE ROAS 1.62 in the campaign name), profit contribution 3 114 kr (MagiBorsten, last 30 days, read 2026-09-28). Solcellslampa_PD_3 is itself the top spender. Father's Day is Sunday 8 November; the last order day for delivery in time is 19 October (delivery p90 20 days, klaviyo/brands/baverbutiken.json). The static is made by the image routine (/bildannonser, 20:00) from the product photo, so it can be live days before the video recuts.
**VARIABELTAGGAR:** typ=N · koncept=fars-dag-rea-2026 · iteration=0 · kalla=axel · avatar=den-som-letar-present-till-en-pappa-med-mork-uppfart · awareness=promo · begar=trygghet · mekanism=rorelsesensor-tander-tre-huvuden-utan-kabel · tro=att-en-utelampa-kraver-elektriker · urgency=sasong · hook-mekanik=none · confidence=medium · lardom=L-120250253967570291 · vinkel=FD · hook-typ=fars-dag-present · format=static · proof=produkten-i-bild · offer=pris · visual=produktfoto · text=overlay · speaker=none · copy_model=sonnet
**Memo:** Job of this image: carry the Father's Day reason and the real deadline on the product photo alone, so the season can be read against the product's statics without a video.
**Landing page:** https://baverbutiken.se/products/solcellslampa-med-rorelsesensor-tre-huvuden-210-led
**Price:** 589 kr (compare-at 775 kr; one variant). Read live 2026-09-28 (baverbutiken.se product JSON).
**AI content:** image only
**Isolated variable:** the Father's Day message (headline, badge, deadline) on the product photo.
**Deadline:** seasonal — the ad stops making sense after 19 October.

## Hook
| # | Swedish (use this) | English meaning |
|---|---|---|
| H1 (use this) | En present till fars dag: ingen elektriker. | A Father's Day gift: no electrician needed. |

## Three-question test — every Swedish line
| Line | Visualize? | Falsifiable? | Competitor-signable? | Verdict |
|---|---|---|---|---|
| En present till fars dag: ingen elektriker. | ✅ | ✅ | ❌ | Keep |
| Solcellsladdat, väggmonterat, tre huvuden med 210 lysdioder som lyser upp mörkret. | ✅ | ✅ | ❌ | Keep |
| Fars dag-rea | ✅ | ✅ | ❌ | Keep — offer fact (this product's own price and deadline, the owner's sale), not a claim line — session verdict |
| 589 kr, ord. 775 kr | ✅ | ✅ | ❌ | Keep — offer fact (this product's own price and deadline, the owner's sale), not a claim line — session verdict |
| Beställ senast 19 oktober | ✅ | ✅ | ❌ | Keep — offer fact (this product's own price and deadline, the owner's sale), not a claim line — session verdict |
| Fars dag: pappa slapp ringa en elektriker. Tre huvuden med 210 lysdioder tänds automatiskt när han kommer hem i mörkret. Fars dag-rea: 589 kr, ord. 775 kr. Beställ senast 19 oktober. | ✅ | ✅ | ❌ | Keep |
| Present till fars dag utan elektriker | ✅ | ✅ | ❌ | Keep |
| Fars dag-rea: 589 kr, ord. 775 kr | ✅ | ✅ | ❌ | Keep — offer fact (this product's own price and deadline, the owner's sale), not a claim line — session verdict |

"Competitor-signable? ❌" is the good answer.

## Design brief
| Slot | Show | Swedish (use this) | English meaning |
|---|---|---|---|
| Photo | The product hero photo: the solar light with its three heads and the solar panel, no people. | — | — |
| Badge | red rounded badge, top-left corner, white bold | Fars dag-rea | Father's Day sale |
| Headline | white text box on top, black bold, two lines | En present till fars dag: ingen elektriker. | A Father's Day gift: no electrician needed. |
| Sub-line | same box, under the headline, regular weight | Solcellsladdat, väggmonterat, tre huvuden med 210 lysdioder som lyser upp mörkret. | Solar charged, wall mounted, three heads with 210 LEDs that light up the dark. |
| Price band | white band under the product: the sale price large, the compare-at price smaller beside it | 589 kr, ord. 775 kr | 589 kr, regular 775 kr |
| Bottom line | bold, bottom centre, on the band | Beställ senast 19 oktober | Order by 19 October |

**Assets:** product photo https://cdn.shopify.com/s/files/1/1013/0322/2621/files/b8-solcellslampa-hero-se.jpg?v=1789119730 (the landing page's own photo — send it as the reference image so the product is never redrawn freely).
**Reference:** none — the product has no static with 3 purchases; composition as the other FD_2_1 statics. Replicate: the price-band layout / Do not replicate: any discount headline, any "IDAG", any store name.
**Editor latitude:** MAY: line breaks inside the text box, font size so the headline fits on two lines, crop within the described photo. MUST NOT: change a Swedish line, the price, the dates, the photo's subject, add a store name, URL, logo or policy line, add any number not in the Rules, add a star, a quote or a person's face, change any field in VARIABELTAGGAR. Cannot build it from the product photo: comment on this row and leave it in Draft.

## Rules
- The ad never names the store: no store name, URL or logo in copy, picture, voice-over, captions or end card.
- Sweden only: this is a Father's Day ad (FD). It is never translated and never mirrored to another store — after the Swedish upload the translation routine moves the row straight to Approved (tools/lib/bara-sverige.mjs).
- The two dates are fixed and true: Father's Day is 8 November, the last order day is 19 October. Never change them, never add a delivery time in days, never add another deadline.
- The sale is the product page's own price against its compare-at price (the owner's decision 2026-09-28). Price is a swappable slot: read it live from the landing page before upload.
- No customer reviews, no star ratings, no quotes presented as a customer's, no "många har köpt".
- No invented urgency: no "idag", no "bara nu", no "få kvar i lager", no countdown — the only urgency is "Beställ senast 19 oktober".
- No free shipping, no Klarna, no "öppet köp", no guarantee — never a policy line.
- No dashes in any Swedish line (no "–", no "—").
- Only these numbers may appear in the ad: 589, 775, 210, 3, 1200, 8, 19. No other kronor amount, no percentage.
- The image model never renders the text: the lines are burned on afterwards, word for word from the Design brief.
- Export: 4:5 (1080×1350) + 1:1 (1080×1080), PNG or JPG.

## COPY CARD
**Primary text:** Fars dag: pappa slapp ringa en elektriker. Tre huvuden med 210 lysdioder tänds automatiskt när han kommer hem i mörkret. Fars dag-rea: 589 kr, ord. 775 kr. Beställ senast 19 oktober.
**Headline:** Present till fars dag utan elektriker
**Description:** Fars dag-rea: 589 kr, ord. 775 kr
**Price in the creative:** 589 kr, ord. 775 kr. Read live before upload; swappable slot.
