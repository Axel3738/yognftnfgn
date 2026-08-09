# Enginecover_SO_18_C1

**VARIABELTAGGAR:** vinkel=`offer/överlager` · hook-typ=`påstående` · format=`karusell 4 kort` · proof=`demo` · offer-i-creativen=`pris syns på sista kortet` · visuell stil=`kollage/sekvens` · textmängd=`rubrik+en rad per kort` · talare=`ingen`
*(Läses av nästa `/cs` för att gruppera vinstbidrag per variabelvärde. Ändra dem inte utan att ändra creativen.)*

**Type:** **Carousel, 4 cards**, offer angle. Third attempt at getting the format into the account at all.

---

## ⚠️ COPY GATE — read this before you build anything

**Three batches in a row have gone live with copy nobody briefed.** Verified again in the account
on 2026-08-09: every ad in this campaign — including the three batch-#5 videos that launched on
7 August — runs one of exactly **three** primary-text blocks left over from batch #1. Not one ad
has ever run the text its brief specified.

We now know the mechanism. Ads Manager is auto-filling the primary text and headline from a saved
copy preset keyed to the **angle prefix in the ad name** (`PD_`, `SP_`, `SO_`). Nobody is being
careless ad by ad — the template is doing it, silently, every time.

So this brief does two things:

1. It tells you **what text this ad will run if nobody intervenes** — see "What the account will
   fill in" below.
2. It gives you a **COPY CARD** further down. Paste the primary text and the headline from that
   card, character for character. Do not retype. Do not accept the pre-filled text.

**After the ad is live, open it and read the primary text back against the card.** Two minutes for
the whole batch.

**Why this batch survives even if that fails:** the isolated variable in every ad here is the
*image or the footage*, never the words. If the whole batch inherits the same wrong block, the
ads still differ only by what we intended to test, and the comparison still reads. That is
deliberate. It is not permission to skip the copy card.

### What the account will fill in if nobody intervenes

Primary text:

> Din motor kostar för mycket för att lämnas oskyddad ⚓
> Skydda den mot regn, sol, salt och rost.
> Universell passform, enkel att sätta på.
> Just nu till kampanjpris.
> Beställ innan lagret tar slut 👇

Headline: `Skydda din motor – innan vintern`

**Contains two banned claims** — the winter deadline in August, and "Beställ innan lagret tar slut". This one must not be left in place.

---

## 1. Why this ad exists (from the 2026-08-09 teardown)

The carousel format has been briefed twice and has never once run. Both previous attempts were
uploaded as single images. So this is not a retry of a failed idea — it is a first attempt at an
untested one.

**Why the offer angle carries it:** SO is the block with the most judgeable ads (five) and therefore
the most reliable baseline to compare a new format against. And a sequence is a natural fit for an
offer: problem, mechanism, ease, price. One ad doing four ads' work.

**Hypothesis:** A four-card sequence beats a single static in the same block on profit per 1 000 kr, because it can carry problem, mechanism, ease and offer without cramming them into one frame.

**Kept:** The SO copy block, the black cover, the CTA, the landing page.

**Changed (isolated variable):** **The format** — four cards instead of one frame.

> **Do not optimise this for clicks.** Across all twelve judgeable ads in this account the ads
> that buy the cheapest, most abundant clicks convert the worst. The four lowest-CTR ads convert
> roughly twice as well as everything else. A version of this ad that gets *fewer* clicks but a
> higher add-to-cart rate is a better ad.

> **What this account actually struggles with is decay, not quality.** Nine ads were re-measured
> on 2026-08-09 against their 2026-08-06 figures. **Every single one returned less profit per krona
> than three days earlier — except `PD_1_H3`, which held flat while taking another 2 972 kr.**
> The ads that looked best at 700 kr of spend (1 400 kr profit per 1 000 kr) collapsed as soon as
> they were pushed. So a strong early number is not a win here. Surviving spend is the win.

---

## 2. Format

| | |
|---|---|
| Format | Static, **1:1 (1080×1080)** and **4:5 (1080×1350)**, JPG, sRGB, under 2 MB |
| Production level | **Simple** |
| CTA button | Handla nu |
| Landing page | https://baverbutiken.se/products/marin-motorholje-420d-universellt-skydd |

Set the 4:5 layout separately. Never letterbox the square — text gets cropped and the ad dies.
Keep all text inside the middle 80 % of the frame. The headline must be readable at thumbnail
size: minimum ~60 px cap height on a 1080 px canvas.

**Ad set:** Motorhölje SO Batch 6

---

## 3. Design brief

Four cards, **1:1 (1080×1080)**, one image file per card, JPG under 2 MB each. Each card must stand
alone if it is the only one seen — most people never swipe. Consistent light and colour across all
four so it reads as one ad, not four.

| Card | Image |
|---|---|
| 1 | The uncovered outboard at the jetty, weather visible. The problem, stated visually. |
| 2 | Macro on the 420D weave and the drawstring edge. |
| 3 | The cover going on — hands in frame, mid-motion, honest speed. |
| 4 | The covered engine, clean, with the price block: `367 kr` struck through, `299 kr` beside it. |

Card 4 is the only card that may show a price.

> **This must be built as a real carousel — one image file per card.** Three ads named `_C1` were
> delivered in batch #4 and all three went into the account as `object_type: SHARE` with a single
> `image_hash` and no `child_attachments`. They were single images wearing a carousel's name, and
> the format has therefore **still never been tested** in this account after two attempts.
> **After launch, check `child_attachments` in the account before anyone draws a conclusion.**

---

## 4. Text on the image (Swedish word-for-word, do not re-translate)

| Element | Swedish (use this) | English meaning |
|---|---|---|
| Rubrik | Så skyddar du din utombordare | How to protect your outboard motor |
| Kort 1 | Motorn står ute vid bryggan, oskyddad | The motor stands outside at the dock, unprotected |
| Kort 2 | 420D Oxfordtyg med dragsko runt hela kanten | 420D Oxford fabric with a drawstring around the entire edge |
| Kort 3 | På och av på några sekunder | On and off in seconds |
| Kort 4 | 299 kr istället för 367 kr – 30 dagars garanti | 299 kr instead of 367 kr – 30-day guarantee |

---

## COPY CARD — paste this into Ads Manager exactly

**Primary text:**

> Vi beställde för mycket motorhölje i 420D Oxfordtyg.
> Nu säljer vi ut till 299 kr istället för 367 kr.
> Vattenavvisande skydd mot regn, sol och damm.
> Dragsko runt hela kanten för tät passform.
> På och av på några sekunder.
> Så länge lagret räcker – beställ ditt hölje nu.

**Headline:** `299 kr istället för 367 kr`

**CTA:** `Handla nu` · **Destination:** https://baverbutiken.se/products/marin-motorholje-420d-universellt-skydd

---

## Hard rules — breaking any one makes the ad unusable

- **Price is exactly 299 kr, ordinary price exactly 367 kr.** Never another number, never a
  percentage other than 19 %.
- **Never claim a customer count, rating or review count.** No "hundratals nöjda kunder". We have
  zero verified reviews. That line is live on four ads right now and is being removed.
- **Never reference winter, cold or autumn.** No "innan vintern". It is August, boating season.
- **Never write "innan lagret tar slut".** The only permitted urgency phrase in this account is
  **"så länge lagret räcker"**, and only where the copy card already contains it.
- **Water-repellent, never waterproof.** "Vattenavvisande", never "vattentät".
- **Universal fit, never tailored.** "Universell passform" — never "formsytt" or "skräddarsytt".
- **No invented testimonial, name, star rating or quote attributed to a person.**
- **Do not put a figure on what an engine costs.** "Dyr motor" is the ceiling.
- **Size ranges exactly as they exist in the store:** 6 - 18 hk · 20 - 30 hk · 40 - 60 hk ·
  60 - 90 hk · 100 - 150 hk · 175 - 250 hk. Never round, merge or invent one.
- **Nobody rinses their outboard after every trip.** At most a wipe or a polish once a season.
- **Black cover only.** Mint green and green have sold zero units.

**Spelling traps:** motorhölje · utombordare · hk · 6–250 hk (en dash) · 420D Oxfordtyg ·
Bäverbutiken. Å, Ä and Ö must render — check the font before you set a single word.

---

## 5. Primary KPI

**Profit per 1 000 kr against the SO_16 statics**, which run the same copy block in the same campaign.
Secondary, and only as diagnosis: card-by-card drop-off, to see whether anyone swipes at all.

## 6. What we learn regardless of outcome

Whether the carousel format is worth building for this product — a question that is two attempts old and
still completely unanswered.
