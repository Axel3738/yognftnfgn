# Image ads — Batch #4 — Marine Engine Cover (Bäverbutiken)

11 briefs. Each folder is self-contained: you can produce any one of them without
reading any other file. Read this README once, then work from the brief.

| Folder | Format | One-line job |
|---|---|---|
| `Enginecover_SO_8_1` | Static 1:1 + 4:5 | Offer static **with** the real numbers (367 → 299) |
| `Enginecover_SO_8_2` | Static 1:1 + 4:5 | Same offer, **no numbers shown** — the control half |
| `Enginecover_SP_8_1` | Static 1:1 + 4:5 | The best-converting copy as a static for the first time |
| `Enginecover_SP_8_2` | Static 1:1 + 4:5 | Same angle as a quote-card layout |
| `Enginecover_PD_13_1` | Static 1:1 + 4:5 | The volume copy as a static for the first time |
| `Enginecover_PD_13_2` | Static 1:1 + 4:5 | Same, plus one qualifying line |
| `Enginecover_PD_6_1` | Static 1:1 + 4:5 | Size guide — all six engine ranges in one image |
| `Enginecover_PD_14_1` | Static 1:1 + 4:5 | Tarp versus fitted cover, split image |
| `Enginecover_PD_6_C1` | **Carousel, 7 cards** | Size finder, one card per engine range |
| `Enginecover_SO_9_C1` | **Carousel, 4 cards** | The whole offer argument, card by card |
| `Enginecover_PD_15_C1` | **Carousel, 5 cards** | One objection per card |

Carousels have never been run in this account. Card dimensions are in each brief.

---

## Global rules — these apply to every image in this folder

**1. Price is exactly 299 kr, compare-at exactly 367 kr.**
Never write another number, never write a percentage that is not 19 %, never
invent "was 499". The landing page says 299 / 367 and the ad must match it
exactly. If a brief tells you to show numbers, show these two and nothing else.
Several briefs deliberately show **no** price — follow the brief, do not add one.

**2. The product must be visible in the image. Always.**
No pure text cards, no pure graphic cards. Even on a quote-card layout the cover
is in frame. On carousels the product is on every single card, including card 1.

**3. Swedish text is copied word for word from the brief.**
Every brief has a table `Swedish (use this) | English meaning`. Set the left
column. Never translate the right column yourself, never "improve" the Swedish,
never fix what looks like a typo — ask instead. Common traps:

| Correct | Wrong |
|---|---|
| motorhölje | motorhölge, motorhölj |
| utombordare | utombordaren (when it should be indefinite) |
| hästkrafter / hk | HK, Hk |
| 6–250 hk (en dash) | 6-250 hk (hyphen) |
| 420D Oxfordtyg | 420d oxford, 420D-oxford |
| Bäverbutiken | Baverbutiken, Bäverbutiket |

Å, Ä and Ö must render. Check the font has them before you set a single headline.

**4. Banned claims — never put these in an image, in any wording.**
- "Hundratals nöjda kunder" or any customer count. We have no reviews to back it.
- "innan vintern", "innan kylan", any winter deadline. It is August.
- "innan lagret tar slut" as a hard deadline.
- Any invented testimonial, name, star rating or review quote.
- Any percentage or price other than 299 / 367 / 19 %.

The only urgency we are allowed to use is **"så länge lagret räcker"** and only
where a brief explicitly asks for it.

**5. Exports.** Every static ships as **1:1 (1080×1080)** and **4:5 (1080×1350)**,
JPG, sRGB, under 2 MB. Carousel cards ship as **1:1 (1080×1080)** only, one file
per card, named `<AdName>_card1.jpg`, `_card2.jpg` and so on in reading order.
Never crop text off between the two ratios — set the 4:5 layout separately, do
not just letterbox the square.

**6. Safe area.** Keep all text inside the middle 80 % of the frame. Meta's UI
covers the bottom ~14 % in feed placements and the top ~10 % in some surfaces.

**7. Colour.** Use the **black** cover in all imagery unless a brief says
otherwise. Black is the overwhelming majority of actual sales; mint green and
green have sold zero units and must not be the hero.

**8. Legibility beats design.** The headline must be readable at thumbnail size
on a phone. If you have to zoom to read it, it is too small. Minimum ~60 px cap
height on a 1080 px canvas for the main headline.

**9. Deliver, then stop.** Do not add extra variants, extra text, badges,
starbursts or "limited time" flashes that the brief does not ask for. Each brief
is one controlled test — an extra element you added makes the result unreadable.

---

## Reference assets

`reference-assets/` is **not included in this zip**: the ad images live behind
Facebook's CDN, which this environment cannot reach, so nothing could be
downloaded and packaged without inventing it. Pull the existing statics from Ads
Manager yourself if you want them as reference. The one existing static worth
looking at is **`Motorhölje_SO_2`** — it is the account's most profitable creative
per krona spent and the only proven static we have.

Do **not** reuse any creative that carries a winter deadline or a customer-count
claim. Those are retired.
