# Enginecover_PD_19_2

**VARIABELTAGGAR:** vinkel=`problem/lösning + kvalificering (värde)` · hook-typ=`påstående` · format=`statisk` · proof=`demo` · offer-i-creativen=`pris syns` · visuell stil=`grafik+produkt` · textmängd=`rubrik+underrad` · talare=`ingen`
*(Läses av nästa `/cs` för att gruppera vinstbidrag per variabelvärde. Ändra dem inte utan att ändra creativen.)*

**Type:** Static in the product-demo angle. **Value framing.** Runs against `PD_19_1` in the same ad set — same copy block, different image idea.

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

**The product-demo block is where the money is and where the leak is.** It carries **64 % of
judgeable spend** and produces **59 % of the profit**, entirely on the back of one ad
(`Motorhölje_PD_1_H3`, 116 purchases). But it converts clicks worse than anything else we run, and
that has now held across five judgeable ads and both formats.

Two attempts to fix it by rewriting the body never reached the account — `PD_16_1` and `PD_17_1`
were briefed in batch #5 and never built, and `PD_16_H1`, which did launch on 7 August, inherited
the old PD block instead of the rewrite. It has spent 683 kr for **zero purchases**. That is below
the judging gate and gets no verdict, but it is not a reason to think the rewrite failed — the
rewrite never ran.

So these two attack the same problem from the image side, where the copy preset cannot interfere.

**This variant qualifies on value instead of size.** Same leak, different door: it puts the engine
and the cover in one frame so the size of the thing being protected does the arguing.

**Hypothesis:** Framing the cover against the engine it protects raises purchases per click above the PD block's 2,4 %, by making the price feel small before the click rather than after it.

**Kept:** The PD angle, the black cover, the CTA, the landing page, the ad set.

**Changed (isolated variable):** **The image only** — value framing instead of the size grid in PD_19_1.

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

**Ad set:** Motorhölje PD Batch 6 — same ad set as PD_19_1

---

## 3. Design brief

**The engine dominates, the cover is small.** A larger outboard fills most of the frame, shot low so
it reads as substantial. The folded cover sits beside or below it, clearly smaller. The composition
should make one thought obvious without a word of explanation: the small thing protects the big
thing.

**Hard constraint:** no number, badge or graphic anywhere that suggests what the engine is worth. We
do not have that figure and will not imply one. The only price permitted in the frame is the 299 kr
in the subline.

---

## 4. Text on the image (Swedish word-for-word, do not re-translate)

| Element | Swedish (use this) | English meaning |
|---|---|---|
| Rubrik | En stor investering förtjänar skydd | A big investment deserves protection |
| Underrad | Skydda den för 299 kr | Protect it for 299 kr |

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

**Purchases per click against the PD block's 2,4 %**, then profit per 1 000 kr head-to-head against
`PD_19_1`. Same ad set, comparable budget. **Expect CTR to fall.**

## 6. What we learn regardless of outcome

Which of the two qualifying moves — size or value — the PD audience actually responds to. Both target
the same measured weakness, so whichever wins tells us how to write the block when we finally can.
