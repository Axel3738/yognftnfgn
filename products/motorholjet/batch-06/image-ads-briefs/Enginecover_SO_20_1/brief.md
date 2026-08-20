# Enginecover_SO_20_1

**VARIABELTAGGAR:** vinkel=`offer/överlager` · hook-typ=`påstående` · format=`statisk` · proof=`demo` · offer-i-creativen=`pris syns` · visuell stil=`råfoto/ostylat` · textmängd=`rubrik+underrad` · talare=`ingen`
*(Läses av nästa `/cs` för att gruppera vinstbidrag per variabelvärde. Ändra dem inte utan att ändra creativen.)*

**Type:** Static in the offer angle, **deliberately unstyled**. Tests production polish as a variable — something this account has never varied on purpose.

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

Every image in this account is a produced shot. Whether that is helping is unknown, and it is a
cheap thing to find out: platform-native, phone-shot creative routinely outperforms polished
creative because it does not read as an ad in the first place.

This matters here specifically because **the offer block's problem is credibility, not clarity.**
The SO block converts 2,1 % of clicks against the social-proof block's 4,4 %, and its copy makes an
overstock claim that a glossy studio image quietly contradicts.

**Hypothesis:** An unstyled, phone-quality photo outperforms the produced shots in the same block, because it reads as a real owner's picture rather than an advertisement.

**Kept:** The SO copy block, the black cover, the CTA, the landing page.

**Changed (isolated variable):** **Production polish** — everything else about the shot stays ordinary.

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

**Make it look like a boat owner's own phone photo.** Slightly off-centre framing, available light
including harsh sun if that is what the day gives, a little clutter in the background — rope, fenders,
a wet jetty. No studio lighting, no colour grade, no retouching, no drop shadow, no white sweep.

Shoot it on a phone. Do not fake this in post: an over-processed image with a filter applied reads
as a fake candid, which is worse than an honest studio shot. The product must still be unmistakably
the subject and the cover must still be black.

Set the on-image text in a plain, unstyled typeface — as if it were added afterwards, not designed in.

---

## 4. Text on the image (Swedish word-for-word, do not re-translate)

| Element | Swedish (use this) | English meaning |
|---|---|---|
| Rubrik | Så här ser motorhöljet ut på riktigt | This is what the engine cover actually looks like |
| Underrad | 420D Oxfordtyg, vattenavvisande, dragsko runt kanten – 299 kr | 420D Oxford fabric, water-repellent, drawstring edge – 299 kr |

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

**Profit per 1 000 kr against the SO_16 statics**, which run the same copy block in the same campaign
but are produced shots. No verdict before 300 kr and 3 purchases.

## 6. What we learn regardless of outcome

Whether production value is worth what it costs us in this account. If the phone photo wins, every future
static gets cheaper and faster — which is the actual bottleneck right now.
