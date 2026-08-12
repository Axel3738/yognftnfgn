# Enginecover_SO_17_1

**VARIABELTAGGAR:** vinkel=`offer/överlager` · hook-typ=`siffra/pris` · format=`statisk` · proof=`inget (produktclaim)` · offer-i-creativen=`pris syns i bild` · visuell stil=`grafik+produkt` · textmängd=`rubrik+pris+underrad` · talare=`ingen`
*(Läses av nästa `/cs` för att gruppera vinstbidrag per variabelvärde. Ändra dem inte utan att ändra creativen.)*

**Type:** Static in the offer angle. **Price-proof isolation** against `SO_16_1`, which is the same image without the price.

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

**Third attempt at the same question.** Whether showing 367 → 299 inside the image earns anything
has been briefed twice and measured zero times. `SO_8_1`/`SO_8_2` was meant to isolate it in batch
#4; both ads inherited the same copy and the pair collapsed to 909 kr and 11 kr of spend. Batch #5
re-briefed it as `SO_14_1`/`SO_14_2` and neither was ever built.

So this time the control is not a new image — it is `SO_16_1`, which is already in this batch and
already in this ad set. **This ad must use the exact same photograph as `SO_16_1`.** Only the price
block is added. That is the whole test.

It matters because the offer angle carries 24 % of judgeable spend at a CPA of 179 kr against a
break-even of 236, and we do not know whether the discount is doing any of that work.

**Hypothesis:** Showing the price in the image lifts purchases per click above SO_16_1's. If it does not, we stop putting price blocks in images and reclaim the space for the mechanism.

**Kept:** **The photograph, exactly as in SO_16_1.** Same file, same crop, same headline, same copy block, same ad set.

**Changed (isolated variable):** **The price block only** — 367 kr struck through, 299 kr beside it, plus the stock line.

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

**Ad set:** Motorhölje SO Batch 6 — same ad set as the SO_16 four, so SO_16_1 is a live control

---

## 3. Design brief

**Identical to `Enginecover_SO_16_1`** — use the same exported photograph, do not re-shoot and do not
re-crop. Add a price block in the lower third: `367 kr` struck through, `299 kr` set larger next to
it. Keep it clean and typographic. No starburst, no red badge, no "REA" sticker — those read as
dropshipping and this account sells to people protecting an expensive engine.

---

## 4. Text on the image (Swedish word-for-word, do not re-translate)

| Element | Swedish (use this) | English meaning |
|---|---|---|
| Rubrik | Skydda motorn vid bryggan | Protect the motor at the dock |
| Prisrad | ~~367 kr~~ 299 kr | 367 kr struck through, 299 kr |
| Underrad | Så länge lagret räcker | While stock lasts |

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

**Purchases per click against `SO_16_1`**, which is the same image without the price. Both must sit
in the same ad set on comparable budget. No verdict under 300 kr spend and 3 purchases — that is
exactly what killed this test the last two times.

## 6. What we learn regardless of outcome

Whether price proof in the image is worth the space it takes, on the third attempt. A null result is
a real result here: it frees the lower third of every offer image we make.
