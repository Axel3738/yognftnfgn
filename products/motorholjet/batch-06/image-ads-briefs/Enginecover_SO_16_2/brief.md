# Enginecover_SO_16_2

**VARIABELTAGGAR:** vinkel=`offer/överlager` · hook-typ=`påstående` · format=`statisk` · proof=`inget (produktclaim)` · offer-i-creativen=`ingen offer` · visuell stil=`makro/detalj` · textmängd=`rubrik+underrad` · talare=`ingen`
*(Läses av nästa `/cs` för att gruppera vinstbidrag per variabelvärde. Ändra dem inte utan att ändra creativen.)*

**Type:** Static in the offer angle, **close-up on fabric**. One of **four** that run identical copy and differ only in the image.

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

**This is the experiment the account has been unable to run for three weeks.**

The SO copy block runs, character for character identical, on **five judgeable ads**. Their return
spans **38 kr to 1 278 kr of profit per 1 000 kr spent** — a 34-fold spread with the words held
constant. Nothing else in this account varies by 34×. The image is the single biggest lever we
have and we have never once tested images against each other deliberately.

We also still cannot see our own images: `*.fbcdn.net` is blocked from the analysis environment
(403, verified three runs running). So we cannot reverse-engineer why `Motorhölje_SO_2` returns
645 and `Enginecover_SO_8_1` returns 38. We have to run the test forward instead.

Four images. One copy block. Same ad set. Nothing else moves.

**Hypothesis:** If the image is the dominant variable, these four separate clearly on profit per krona even though every word is identical. Whichever wins tells us what our buyers actually respond to visually.

**Kept:** The SO copy block, the black cover, the CTA, the landing page, the ad set.

**Changed (isolated variable):** **The image only.** This variant is the close-up on fabric. Copy, headline, CTA, landing page and ad set are identical across SO_16_1 through SO_16_4. **If any of those differ, the four-way test is void.**

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

**Ad set:** Motorhölje SO Batch 6 — all four SO_16 variants in this ad set, nothing else in it

---

## 3. Design brief

**Macro on the material.** Fill the frame with the 420D Oxford weave and the drawstring edge, a
hand in shot for scale. No wide context at all, no boat, no water. This variant asks whether
material detail earns more trust than setting does.

---

## 4. Text on the image (Swedish word-for-word, do not re-translate)

| Element | Swedish (use this) | English meaning |
|---|---|---|
| Rubrik | 420D Oxfordtyg – tåligt material | 420D Oxford fabric – durable material |
| Underrad | Dragsko runt hela kanten för tät passform | Drawstring around the entire edge for a snug fit |

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

**Profit per 1 000 kr spent, head-to-head against the other three SO_16 variants.**
They must run in the **same ad set with comparable budget** or the comparison means nothing.
Do not judge any of them before **300 kr spend and 3 purchases** — that gate has been wrong twice
in this account. Secondary: purchases per click, where the account average is 2,5 %.

## 6. What we learn regardless of outcome

Which visual direction our buyers respond to, with the words removed as an explanation.
That answer transfers to every image we ever make for this product, in every angle. We currently
have no idea — and the spread it explains is worth more than any single ad in the account.
