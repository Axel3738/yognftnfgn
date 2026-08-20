# Image ads — Batch #5 — Marine Engine Cover (Bäverbutiken)

11 briefs. Each folder is self-contained. Read this README once, then work from the brief.

| Folder | Format | One-line job |
|---|---|---|
| `Enginecover_SP_12_1` | Static | Social-proof copy, **wide** image |
| `Enginecover_SP_12_2` | Static | Same copy, **close-up on fabric** |
| `Enginecover_SP_12_3` | Static | Same copy, **cover on / cover off** |
| `Enginecover_SP_14_1` | Static | Social-proof angle as a quote-card |
| `Enginecover_PD_16_1` | Static | **Rewritten** product-demo body, qualifies on size |
| `Enginecover_PD_17_1` | Static | Second rewrite, qualifies on engine value |
| `Enginecover_SO_14_1` | Static | Offer **with** 367 → 299 on the image |
| `Enginecover_SO_14_2` | Static | Same offer, **no numbers** — the control |
| `Enginecover_SO_15_1` | Static | Offer, photo-led environmental direction |
| `Enginecover_SO_13_C1` | **Carousel, 4 cards** | The offer argument card by card |
| `Enginecover_PD_18_C1` | **Carousel, 5 cards** | Size finder, one card per engine group |

## Read this before anything else

**Two things went wrong in batch #4 and both are on us to prevent here.**

**1. Every ad went live with the wrong text.** All 17 inherited an old copy block instead of the
one their brief specified. Three are still running claims we have banned. Every brief in this
batch has a section called **COPY CARD — paste this into Ads Manager exactly**. That is the only
place the text comes from. After the ad is live, open it and read the text back against the card.

**2. The carousels were not carousels.** All three shipped as single images. `SO_13_C1` and
`PD_18_C1` must be built with the Carousel format, one image file per card. After launch, confirm
you can actually swipe the cards.

## Three tests in here depend on things being identical

- **SP_12_1 / SP_12_2 / SP_12_3** run the same copy, headline and CTA. **Only the image differs.**
  If anything else differs, the three-way image test is void.
- **SO_14_1 / SO_14_2** are identical except that the numbers are on one image and not the other.
- **PD_16_1 / PD_17_1** must look like siblings — same photo family, same callout layout — so the
  only variable is the qualifying axis in the copy.

---

## Global rules — every image in this folder

**1. Price is exactly 299 kr, compare-at exactly 367 kr.** Never another number, never a
percentage other than 19 %. Some briefs deliberately show **no** price — follow the brief, do not
add one.

**2. The product is visible in every image.** No pure text cards, no pure graphic cards. On
carousels the cover is on every card, including card 1.

**3. Swedish text is copied word for word from the brief.** Never translate the right column
yourself, never "improve" the Swedish, never fix what looks like a typo — ask instead.

| Correct | Wrong |
|---|---|
| motorhölje | motorhölge, motorhölj |
| utombordare | utombordaren (when it should be indefinite) |
| hästkrafter / hk | HK, Hk |
| 6–250 hk (en dash) | 6-250 hk (hyphen) |
| 420D Oxfordtyg | 420d oxford, 420D-oxford |
| Bäverbutiken | Baverbutiken, Bäverbutiket |

Å, Ä and Ö must render. Check the font before you set a single headline.

**4. Banned — never in an image, in any wording.**
- Any customer count, rating or review number. No "Hundratals nöjda kunder". We have zero reviews.
- "innan vintern", "innan kylan", any winter or autumn deadline. It is August.
- "innan lagret tar slut". The only permitted urgency is **"så länge lagret räcker"**, and only
  where a brief already contains it.
- Any invented testimonial, name, star rating or review quote.
- Any price or percentage other than 299 / 367 / 19 %.
- "vattentät" — it is **vattenavvisande**.

**5. Exports.** Statics ship as **1:1 (1080×1080)** and **4:5 (1080×1350)**, JPG, sRGB, under
2 MB. Carousel cards ship as **1:1 only**, one file per card, named `<AdName>_card1.jpg` and so on
in reading order. Set the 4:5 layout separately — never letterbox the square.

**6. Safe area.** All text inside the middle 80 % of the frame.

**7. Colour.** Black cover in all imagery. Mint green and green have sold zero units.

**8. Legibility beats design.** The headline must be readable at thumbnail size on a phone.
Minimum ~60 px cap height on a 1080 px canvas.

**9. Do not optimise for clicks.** Across all nine judgeable ads in this account, the ads that buy
the cheapest clicks convert the worst. Fewer clicks with a higher add-to-cart rate is a better ad.

**10. Deliver, then stop.** No extra variants, no added badges, starbursts or "limited time"
flashes. Each brief is one controlled test — anything you add on your own makes the result
unreadable.

## Reference assets

`reference-assets/` is **not included**: the existing ad images sit behind Facebook's CDN, which
this environment cannot reach, so nothing could be packaged without inventing it. Pull them from
Ads Manager yourself. The two worth looking at are **`Motorhölje_SO_2`** and
**`Enginecover_SO_5_1`** — they run character-for-character identical copy and return 971 versus
246 kr of profit per 1 000 kr spent. Whatever differs between those two images is the most
valuable unknown we have.
