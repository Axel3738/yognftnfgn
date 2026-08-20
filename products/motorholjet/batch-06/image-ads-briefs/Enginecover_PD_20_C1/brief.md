# Enginecover_PD_20_C1

**VARIABELTAGGAR:** vinkel=`problem/lösning + kvalificering (storlek)` · hook-typ=`fråga` · format=`karusell 5 kort` · proof=`demo` · offer-i-creativen=`ingen offer` · visuell stil=`kollage/sekvens` · textmängd=`rubrik+en rad per kort` · talare=`ingen`
*(Läses av nästa `/cs` för att gruppera vinstbidrag per variabelvärde. Ändra dem inte utan att ändra creativen.)*

**Type:** **Carousel, 5 cards**, product-demo angle. The size-finder as a swipeable sequence — the natural home for the idea.

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

> Regn, sol och salt sliter på din motor varje dag ⛵
> Det här höljet skyddar mot väder och rost.
> Universell passform — passar de flesta utombordare.
> Enkelt att sätta på och ta av.
> Skydda din motor redan idag 👇

Headline: `Skydda din motor – år efter år`

Not banned, but it is the block with the account's **worst click quality**. Replace it.

---

## 1. Why this ad exists (from the 2026-08-09 teardown)

Size qualification has been attempted three times and measured zero times: `PD_6_1` got 28 kr,
`PD_13_1`/`PD_13_2` inherited identical copy so the pair measured nothing, and `PD_18_C1` was
briefed in batch #5 and never built.

The carousel is the format the idea actually wants. A grid in one frame has to shrink six bands
into a thumbnail; a sequence gives each band its own card at full size. And the PD block — 64 % of
judgeable spend, worst click quality of the three — is where qualifying pays most.

`PD_19_1` in this batch runs the same idea as a single image, in the same campaign. That gives us
the size-finder in two formats at once.

**Hypothesis:** A card per size band lifts purchases per click above the PD block's 2,4 %, and beats the single-frame grid in PD_19_1, because each band gets room to be read.

**Kept:** The PD angle, the size bands exactly as the store lists them, the black cover.

**Changed (isolated variable):** **The format** — five cards instead of one frame.

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

**Ad set:** Motorhölje PD Batch 6 — same ad set as PD_19_1 and PD_19_2

---

## 3. Design brief

Five cards, **1:1 (1080×1080)**, one image file per card. Consistent light and colour across all five.

| Card | Image |
|---|---|
| 1 | An outboard at the jetty, shot so the size of the engine is the obvious subject. Opens the question. |
| 2 | The cover fitted on a 60 - 90 hk engine. |
| 3 | The cover fitted on a 100 - 150 hk engine. |
| 4 | The cover fitted on a 175 - 250 hk engine. |
| 5 | The full six-band list, clean and typographic, with the covered engine beside it. |

Cards 2–4 take the three **larger** bands because that is where sales concentrate. Card 5 must list
**all six** bands exactly as the store writes them — never a subset, never rounded, never merged.
If three separate engine sizes cannot be sourced for cards 2–4, say so before shooting rather than
faking scale in post.

> **This must be built as a real carousel — one image file per card.** Three ads named `_C1` were
> delivered in batch #4 and all three went into the account as `object_type: SHARE` with a single
> `image_hash` and no `child_attachments`. They were single images wearing a carousel's name, and
> the format has therefore **still never been tested** in this account after two attempts.
> **After launch, check `child_attachments` in the account before anyone draws a conclusion.**

---

## 4. Text on the image (Swedish word-for-word, do not re-translate)

| Element | Swedish (use this) | English meaning |
|---|---|---|
| Rubrik | Vilken storlek har din motor? | What size is your motor? |
| Kort 1 | Hitta rätt hölje för din utombordare | Find the right cover for your outboard motor |
| Kort 2 | 60–90 hk | 60–90 hp |
| Kort 3 | 100–150 hk | 100–150 hp |
| Kort 4 | 175–250 hk | 175–250 hp |
| Kort 5 | Hitta din storlek och beställ nu | Find your size and order now |

---

## COPY CARD — paste this into Ads Manager exactly

**Primary text:**

> Är din utombordare en av de större på bryggan?
> Det här höljet är gjort för att sitta som gjutet — inte "passar de flesta".
> 420D Oxfordtyg och dragsko runt hela kanten håller regn och salt ute.
> På och av på sekunder.
> Hitta din storlek och skydda den. 👇

**Headline:** `Gjord för större motorer`

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

**Purchases per click against the PD block's 2,4 %**, then head-to-head against `PD_19_1`, which runs
the same idea as a single image. **Expect CTR to fall.**

## 6. What we learn regardless of outcome

Whether size qualification works at all — on the fourth attempt — and whether the carousel adds anything
over a single frame carrying the same idea. Two open questions answered by one ad.
