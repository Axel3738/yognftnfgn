#!/usr/bin/env python3
"""Generator for Motorhoolje batch #6 briefs. Run from products/motorholjet/batch-06/."""
import os

LP = "https://baverbutiken.se/products/marin-motorholje-420d-universellt-skydd"

# ---------------------------------------------------------------- shared blocks

COPYGATE = """## ⚠️ COPY GATE — read this before you build anything

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
"""

RULES = """## Hard rules — breaking any one makes the ad unusable

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
"""

CTR_NOTE = """> **Do not optimise this for clicks.** Across all twelve judgeable ads in this account the ads
> that buy the cheapest, most abundant clicks convert the worst. The four lowest-CTR ads convert
> roughly twice as well as everything else. A version of this ad that gets *fewer* clicks but a
> higher add-to-cart rate is a better ad.
"""

DECAY_NOTE = """> **What this account actually struggles with is decay, not quality.** Nine ads were re-measured
> on 2026-08-09 against their 2026-08-06 figures. **Every single one returned less profit per krona
> than three days earlier — except `PD_1_H3`, which held flat while taking another 2 972 kr.**
> The ads that looked best at 700 kr of spend (1 400 kr profit per 1 000 kr) collapsed as soon as
> they were pushed. So a strong early number is not a win here. Surviving spend is the win.
"""

# what the account auto-fills, per angle prefix, verified 2026-08-09
INHERITED = {
    "PD": ("""> Regn, sol och salt sliter på din motor varje dag ⛵
> Det här höljet skyddar mot väder och rost.
> Universell passform — passar de flesta utombordare.
> Enkelt att sätta på och ta av.
> Skydda din motor redan idag 👇""",
           "Skydda din motor – år efter år",
           "Not banned, but it is the block with the account's **worst click quality**. Replace it."),
    "SP": ("""> Båtägare pratar om det här höljet just nu 🌊
> Sitter kvar även i storm och blåst.
> Håller motorn helt torr och skyddad.
> Hundratals nöjda kunder redan.
> Se varför själv 👇""",
           "Motorskyddet båtägare litar på",
           "**Contains a banned claim** — \"Hundratals nöjda kunder redan.\" We have zero verified reviews. This one must not be left in place."),
    "SO": ("""> Din motor kostar för mycket för att lämnas oskyddad ⚓
> Skydda den mot regn, sol, salt och rost.
> Universell passform, enkel att sätta på.
> Just nu till kampanjpris.
> Beställ innan lagret tar slut 👇""",
           "Skydda din motor – innan vintern",
           "**Contains two banned claims** — the winter deadline in August, and \"Beställ innan lagret tar slut\". This one must not be left in place."),
}

# the copy cards we want, per angle
CARDS = {
    "PD": ("""> Är din utombordare en av de större på bryggan?
> Det här höljet är gjort för att sitta som gjutet — inte "passar de flesta".
> 420D Oxfordtyg och dragsko runt hela kanten håller regn och salt ute.
> På och av på sekunder.
> Hitta din storlek och skydda den. 👇""", "Gjord för större motorer"),
    "SP": ("""> Din utombordare står ute i alla väder.
> Sol bleker plasten. Salt och damm sätter sig i varje skarv.
> Motorhölje i 420D Oxfordtyg, vattenavvisande, med dragsko runt hela kanten.
> På och av på några sekunder — ingen risk att glömma täcka den.
> 30 dagars nöjd-kund-garanti.
> Beställ ditt motorhölje idag.""", "Skydd som sitter kvar, i alla väder"),
    "SO": ("""> Vi beställde för mycket motorhölje i 420D Oxfordtyg.
> Nu säljer vi ut till 299 kr istället för 367 kr.
> Vattenavvisande skydd mot regn, sol och damm.
> Dragsko runt hela kanten för tät passform.
> På och av på några sekunder.
> Så länge lagret räcker – beställ ditt hölje nu.""", "299 kr istället för 367 kr"),
}


def inherited_block(angle):
    body, title, note = INHERITED[angle]
    return f"""### What the account will fill in if nobody intervenes

Primary text:

{body}

Headline: `{title}`

{note}
"""


def copy_card(angle):
    body, title = CARDS[angle]
    return f"""## COPY CARD — paste this into Ads Manager exactly

**Primary text:**

{body}

**Headline:** `{title}`

**CTA:** `Handla nu` · **Destination:** {LP}
"""


CAPTIONS = """Captions are **mandatory, burned in, Swedish, word for word** matching the spoken lines. Not
auto-generated, not paraphrased. Most of this audience watches on mute. Keep captions inside the
middle 80 % of the frame vertically — Meta's UI covers the bottom ~14 % of a 9:16."""

EDIT_DIR = """## Editing direction

- Cut on the line, not after it. No dead air between sentences.
- Never hold a static frame longer than ~2 s in the first 10 seconds.
- No logo card, no title card, no intro. The product is in the first frame.
- No zoom punches, no whoosh SFX, no trending audio.
- **Product on screen before second 4. No exceptions.**
"""

STATIC_FMT = f"""| | |
|---|---|
| Format | Static, **1:1 (1080×1080)** and **4:5 (1080×1350)**, JPG, sRGB, under 2 MB |
| Production level | **Simple** |
| CTA button | Handla nu |
| Landing page | {LP} |

Set the 4:5 layout separately. Never letterbox the square — text gets cropped and the ad dies.
Keep all text inside the middle 80 % of the frame. The headline must be readable at thumbnail
size: minimum ~60 px cap height on a 1080 px canvas."""


def write(folder, name, text):
    d = os.path.join(folder, name)
    os.makedirs(d, exist_ok=True)
    with open(os.path.join(d, "brief.md"), "w") as f:
        f.write(text)


def static(name, angle, tags, typ, why, hypothesis, kept, changed, design,
           table, kpi, learn, adset, extra=""):
    return f"""# {name}

**VARIABELTAGGAR:** {tags}
*(Läses av nästa `/cs` för att gruppera vinstbidrag per variabelvärde. Ändra dem inte utan att ändra creativen.)*

**Type:** {typ}

---

{COPYGATE}
{inherited_block(angle)}
---

## 1. Why this ad exists (from the 2026-08-09 teardown)

{why}

**Hypothesis:** {hypothesis}

**Kept:** {kept}

**Changed (isolated variable):** {changed}

{CTR_NOTE}
{DECAY_NOTE}
---

## 2. Format

{STATIC_FMT}

**Ad set:** {adset}

---

## 3. Design brief

{design}
{extra}
---

## 4. Text on the image (Swedish word-for-word, do not re-translate)

{table}

---

{copy_card(angle)}
---

{RULES}
---

## 5. Primary KPI

{kpi}

## 6. What we learn regardless of outcome

{learn}
"""


def video(name, angle, tags, typ, why, hypothesis, kept, changed, fmt, script,
          shots, overlays, kpi, learn, adset, extra=""):
    return f"""# {name}

**VARIABELTAGGAR:** {tags}
*(Läses av nästa `/cs` för att gruppera vinstbidrag per variabelvärde. Ändra dem inte utan att ändra creativen.)*

**Type:** {typ}

---

{COPYGATE}
{inherited_block(angle)}
---

## 1. Why this ad exists (from the 2026-08-09 teardown)

{why}

**Hypothesis:** {hypothesis}

**Kept:** {kept}

**Changed (isolated variable):** {changed}

{CTR_NOTE}
{DECAY_NOTE}
---

## 2. Format

{fmt}

{CAPTIONS}

**CTA:** Handla nu · **Landing page:** {LP} · **Ad set:** {adset}

---

## 3. Script — record these lines word for word

Do not rephrase, do not translate the right column yourself, do not "fix" the Swedish. If
something looks like a typo, ask before changing it.

{script}

---

## 4. Shot list

{shots}

---

## 5. On-screen text overlays

{overlays}

---

{EDIT_DIR}
{extra}
---

{copy_card(angle)}
---

{RULES}
---

## 6. Primary KPI

{kpi}

## 7. What we learn regardless of outcome

{learn}
"""


IMG = "image-ads-briefs"
VID = "video-ads-briefs"

# =============================================================== A. IMAGE TEST (SO block)

SO16_WHY = """**This is the experiment the account has been unable to run for three weeks.**

The SO copy block runs, character for character identical, on **five judgeable ads**. Their return
spans **38 kr to 1 278 kr of profit per 1 000 kr spent** — a 34-fold spread with the words held
constant. Nothing else in this account varies by 34×. The image is the single biggest lever we
have and we have never once tested images against each other deliberately.

We also still cannot see our own images: `*.fbcdn.net` is blocked from the analysis environment
(403, verified three runs running). So we cannot reverse-engineer why `Motorhölje_SO_2` returns
645 and `Enginecover_SO_8_1` returns 38. We have to run the test forward instead.

Four images. One copy block. Same ad set. Nothing else moves."""

SO16_KPI = """**Profit per 1 000 kr spent, head-to-head against the other three SO_16 variants.**
They must run in the **same ad set with comparable budget** or the comparison means nothing.
Do not judge any of them before **300 kr spend and 3 purchases** — that gate has been wrong twice
in this account. Secondary: purchases per click, where the account average is 2,5 %."""

SO16_LEARN = """Which visual direction our buyers respond to, with the words removed as an explanation.
That answer transfers to every image we ever make for this product, in every angle. We currently
have no idea — and the spread it explains is worth more than any single ad in the account."""

SO16_KEPT = "The SO copy block, the black cover, the CTA, the landing page, the ad set."

_so16 = [
    ("Enginecover_SO_16_1", "textfri produktbild + rubrik", "**wide**",
     """**Wide, engine in situ.** The black cover fitted on an outboard, boat and open water behind it,
shot in daylight from roughly the angle a person standing on the jetty would see. The setting does
the work — a real engine in a real place, never a studio cut-out. Product fills at least a third of
the frame. Prefer a **larger** outboard: sales concentrate at 40 hk and up.""",
     """| Element | Swedish (use this) | English meaning |
|---|---|---|
| Rubrik | Skydda motorn vid bryggan | Protect the motor at the dock |
| Underrad | Vattenavvisande motorhölje i 420D Oxfordtyg | Water-repellent motor cover in 420D Oxford fabric |"""),
    ("Enginecover_SO_16_2", "makro/detalj", "**close-up on fabric**",
     """**Macro on the material.** Fill the frame with the 420D Oxford weave and the drawstring edge, a
hand in shot for scale. No wide context at all, no boat, no water. This variant asks whether
material detail earns more trust than setting does.""",
     """| Element | Swedish (use this) | English meaning |
|---|---|---|
| Rubrik | 420D Oxfordtyg – tåligt material | 420D Oxford fabric – durable material |
| Underrad | Dragsko runt hela kanten för tät passform | Drawstring around the entire edge for a snug fit |"""),
    ("Enginecover_SO_16_3", "split/före-efter", "**split, with/without**",
     """**Split frame.** Left half: the same outboard uncovered, sun on bare plastic. Right half: the same
outboard with the cover fitted. Same engine, same location, same light, same camera position —
shoot both halves in one session or the comparison reads as a trick. A clean vertical divider, no
arrows, no red circles.""",
     """| Element | Swedish (use this) | English meaning |
|---|---|---|
| Rubrik | Skillnaden är tydlig | The difference is clear |
| Etikett vänster | Oskyddad | Unprotected |
| Etikett höger | Skyddad med hölje | Protected with cover |"""),
    ("Enginecover_SO_16_4", "textfri produktbild + rubrik", "**product on white**",
     """**Pure product shot.** The folded cover and the cover fitted on a bare outboard, on a clean white
background. No boat, no water, no location, no lifestyle. This is the control: it removes context
entirely, so if it wins we learn that the scene was never doing any work.""",
     """| Element | Swedish (use this) | English meaning |
|---|---|---|
| Rubrik | Motorhölje 420D | 420D motor cover |
| Underrad | Universellt skydd för utombordare, 6–250 hk | Universal protection for outboard motors, 6–250 hp |"""),
]

for nm, stil, short, design, table in _so16:
    write(IMG, nm, static(
        nm, "SO",
        f"vinkel=`offer/överlager` · hook-typ=`påstående` · format=`statisk` · proof=`inget (produktclaim)` · offer-i-creativen=`ingen offer` · visuell stil=`{stil}` · textmängd=`rubrik+underrad` · talare=`ingen`",
        f"Static in the offer angle, {short}. One of **four** that run identical copy and differ only in the image.",
        SO16_WHY,
        "If the image is the dominant variable, these four separate clearly on profit per krona even though every word is identical. Whichever wins tells us what our buyers actually respond to visually.",
        SO16_KEPT,
        f"**The image only.** This variant is the {short.strip('*')}. Copy, headline, CTA, landing page and ad set are identical across SO_16_1 through SO_16_4. **If any of those differ, the four-way test is void.**",
        design, table, SO16_KPI, SO16_LEARN,
        "Motorhölje SO Batch 6 — all four SO_16 variants in this ad set, nothing else in it"))

# SO_17_1 — price proof isolation
write(IMG, "Enginecover_SO_17_1", static(
    "Enginecover_SO_17_1", "SO",
    "vinkel=`offer/överlager` · hook-typ=`siffra/pris` · format=`statisk` · proof=`inget (produktclaim)` · offer-i-creativen=`pris syns i bild` · visuell stil=`grafik+produkt` · textmängd=`rubrik+pris+underrad` · talare=`ingen`",
    "Static in the offer angle. **Price-proof isolation** against `SO_16_1`, which is the same image without the price.",
    """**Third attempt at the same question.** Whether showing 367 → 299 inside the image earns anything
has been briefed twice and measured zero times. `SO_8_1`/`SO_8_2` was meant to isolate it in batch
#4; both ads inherited the same copy and the pair collapsed to 909 kr and 11 kr of spend. Batch #5
re-briefed it as `SO_14_1`/`SO_14_2` and neither was ever built.

So this time the control is not a new image — it is `SO_16_1`, which is already in this batch and
already in this ad set. **This ad must use the exact same photograph as `SO_16_1`.** Only the price
block is added. That is the whole test.

It matters because the offer angle carries 24 % of judgeable spend at a CPA of 179 kr against a
break-even of 236, and we do not know whether the discount is doing any of that work.""",
    "Showing the price in the image lifts purchases per click above SO_16_1's. If it does not, we stop putting price blocks in images and reclaim the space for the mechanism.",
    "**The photograph, exactly as in SO_16_1.** Same file, same crop, same headline, same copy block, same ad set.",
    "**The price block only** — 367 kr struck through, 299 kr beside it, plus the stock line.",
    """**Identical to `Enginecover_SO_16_1`** — use the same exported photograph, do not re-shoot and do not
re-crop. Add a price block in the lower third: `367 kr` struck through, `299 kr` set larger next to
it. Keep it clean and typographic. No starburst, no red badge, no "REA" sticker — those read as
dropshipping and this account sells to people protecting an expensive engine.""",
    """| Element | Swedish (use this) | English meaning |
|---|---|---|
| Rubrik | Skydda motorn vid bryggan | Protect the motor at the dock |
| Prisrad | ~~367 kr~~ 299 kr | 367 kr struck through, 299 kr |
| Underrad | Så länge lagret räcker | While stock lasts |""",
    """**Purchases per click against `SO_16_1`**, which is the same image without the price. Both must sit
in the same ad set on comparable budget. No verdict under 300 kr spend and 3 purchases — that is
exactly what killed this test the last two times.""",
    """Whether price proof in the image is worth the space it takes, on the third attempt. A null result is
a real result here: it frees the lower third of every offer image we make.""",
    "Motorhölje SO Batch 6 — same ad set as the SO_16 four, so SO_16_1 is a live control"))

# =============================================================== B. IMAGE TEST (PD block)

PD19_WHY = """**The product-demo block is where the money is and where the leak is.** It carries **64 % of
judgeable spend** and produces **59 % of the profit**, entirely on the back of one ad
(`Motorhölje_PD_1_H3`, 116 purchases). But it converts clicks worse than anything else we run, and
that has now held across five judgeable ads and both formats.

Two attempts to fix it by rewriting the body never reached the account — `PD_16_1` and `PD_17_1`
were briefed in batch #5 and never built, and `PD_16_H1`, which did launch on 7 August, inherited
the old PD block instead of the rewrite. It has spent 683 kr for **zero purchases**. That is below
the judging gate and gets no verdict, but it is not a reason to think the rewrite failed — the
rewrite never ran.

So these two attack the same problem from the image side, where the copy preset cannot interfere."""

write(IMG, "Enginecover_PD_19_1", static(
    "Enginecover_PD_19_1", "PD",
    "vinkel=`problem/lösning + kvalificering (storlek)` · hook-typ=`fråga` · format=`statisk` · proof=`demo` · offer-i-creativen=`ingen offer` · visuell stil=`grafik+produkt` · textmängd=`rubrik+lista` · talare=`ingen`",
    "Static in the product-demo angle. **Size-finder grid.** Fourth attempt at the size-qualification idea, first one on an image.",
    PD19_WHY + """

**This variant qualifies on size, visually.** Store data says sales concentrate at **40 hk and up**
while the ads speak to a generic "båtägare". A grid that makes the reader look for their own engine
does the qualifying before the click, which is exactly where the PD block leaks.""",
    "Making the reader find their own hk band before clicking raises purchases per click above the PD block's 2,4 %, by filtering out people whose engine we cannot fit well.",
    "The PD angle, the black cover, the CTA, the landing page.",
    "**The image becomes a size finder** instead of a demo photograph.",
    """**A six-cell grid on a clean background**, one cell per size band, each cell showing the band label
and the covered engine at the right relative scale. Bands, exactly and in this order:
`6 - 18 hk` · `20 - 30 hk` · `40 - 60 hk` · `60 - 90 hk` · `100 - 150 hk` · `175 - 250 hk`.

Give the three larger bands visual weight — larger cells or heavier type — because that is where
the buyers are. Do not invent, merge or round a band. The grid must stay readable at thumbnail
size: if six cells cannot be read small, drop to a 2×3 layout with bigger type rather than shrinking
the labels.""",
    """| Element | Swedish (use this) | English meaning |
|---|---|---|
| Rubrik | Hitta din storlek | Find your size |
| Uppmaning | Leta upp din motors hk nedan | Look up your motor's hp below |""",
    """**Purchases per click against the PD block's 2,4 %.** **Expect CTR to fall — that is the intended
trade, not a failure.** Secondary: profit per 1 000 kr against `PD_19_2`, which is the same block
with a different image.""",
    """Whether the PD block's click-quality problem can be fixed from the image side when the copy cannot be
changed. If a picture can qualify the reader, that transfers to the 64 % of spend this block carries.""",
    "Motorhölje PD Batch 6 — same ad set as PD_19_2"))

write(IMG, "Enginecover_PD_19_2", static(
    "Enginecover_PD_19_2", "PD",
    "vinkel=`problem/lösning + kvalificering (värde)` · hook-typ=`påstående` · format=`statisk` · proof=`demo` · offer-i-creativen=`pris syns` · visuell stil=`grafik+produkt` · textmängd=`rubrik+underrad` · talare=`ingen`",
    "Static in the product-demo angle. **Value framing.** Runs against `PD_19_1` in the same ad set — same copy block, different image idea.",
    PD19_WHY + """

**This variant qualifies on value instead of size.** Same leak, different door: it puts the engine
and the cover in one frame so the size of the thing being protected does the arguing.""",
    "Framing the cover against the engine it protects raises purchases per click above the PD block's 2,4 %, by making the price feel small before the click rather than after it.",
    "The PD angle, the black cover, the CTA, the landing page, the ad set.",
    "**The image only** — value framing instead of the size grid in PD_19_1.",
    """**The engine dominates, the cover is small.** A larger outboard fills most of the frame, shot low so
it reads as substantial. The folded cover sits beside or below it, clearly smaller. The composition
should make one thought obvious without a word of explanation: the small thing protects the big
thing.

**Hard constraint:** no number, badge or graphic anywhere that suggests what the engine is worth. We
do not have that figure and will not imply one. The only price permitted in the frame is the 299 kr
in the subline.""",
    """| Element | Swedish (use this) | English meaning |
|---|---|---|
| Rubrik | En stor investering förtjänar skydd | A big investment deserves protection |
| Underrad | Skydda den för 299 kr | Protect it for 299 kr |""",
    """**Purchases per click against the PD block's 2,4 %**, then profit per 1 000 kr head-to-head against
`PD_19_1`. Same ad set, comparable budget. **Expect CTR to fall.**""",
    """Which of the two qualifying moves — size or value — the PD audience actually responds to. Both target
the same measured weakness, so whichever wins tells us how to write the block when we finally can.""",
    "Motorhölje PD Batch 6 — same ad set as PD_19_1"))

# =============================================================== C. CAROUSELS

CAROUSEL_WARN = """> **This must be built as a real carousel — one image file per card.** Three ads named `_C1` were
> delivered in batch #4 and all three went into the account as `object_type: SHARE` with a single
> `image_hash` and no `child_attachments`. They were single images wearing a carousel's name, and
> the format has therefore **still never been tested** in this account after two attempts.
> **After launch, check `child_attachments` in the account before anyone draws a conclusion.**
"""

write(IMG, "Enginecover_SO_18_C1", static(
    "Enginecover_SO_18_C1", "SO",
    "vinkel=`offer/överlager` · hook-typ=`påstående` · format=`karusell 4 kort` · proof=`demo` · offer-i-creativen=`pris syns på sista kortet` · visuell stil=`kollage/sekvens` · textmängd=`rubrik+en rad per kort` · talare=`ingen`",
    "**Carousel, 4 cards**, offer angle. Third attempt at getting the format into the account at all.",
    """The carousel format has been briefed twice and has never once run. Both previous attempts were
uploaded as single images. So this is not a retry of a failed idea — it is a first attempt at an
untested one.

**Why the offer angle carries it:** SO is the block with the most judgeable ads (five) and therefore
the most reliable baseline to compare a new format against. And a sequence is a natural fit for an
offer: problem, mechanism, ease, price. One ad doing four ads' work.""",
    "A four-card sequence beats a single static in the same block on profit per 1 000 kr, because it can carry problem, mechanism, ease and offer without cramming them into one frame.",
    "The SO copy block, the black cover, the CTA, the landing page.",
    "**The format** — four cards instead of one frame.",
    """Four cards, **1:1 (1080×1080)**, one image file per card, JPG under 2 MB each. Each card must stand
alone if it is the only one seen — most people never swipe. Consistent light and colour across all
four so it reads as one ad, not four.

| Card | Image |
|---|---|
| 1 | The uncovered outboard at the jetty, weather visible. The problem, stated visually. |
| 2 | Macro on the 420D weave and the drawstring edge. |
| 3 | The cover going on — hands in frame, mid-motion, honest speed. |
| 4 | The covered engine, clean, with the price block: `367 kr` struck through, `299 kr` beside it. |

Card 4 is the only card that may show a price.""",
    """| Element | Swedish (use this) | English meaning |
|---|---|---|
| Rubrik | Så skyddar du din utombordare | How to protect your outboard motor |
| Kort 1 | Motorn står ute vid bryggan, oskyddad | The motor stands outside at the dock, unprotected |
| Kort 2 | 420D Oxfordtyg med dragsko runt hela kanten | 420D Oxford fabric with a drawstring around the entire edge |
| Kort 3 | På och av på några sekunder | On and off in seconds |
| Kort 4 | 299 kr istället för 367 kr – 30 dagars garanti | 299 kr instead of 367 kr – 30-day guarantee |""",
    """**Profit per 1 000 kr against the SO_16 statics**, which run the same copy block in the same campaign.
Secondary, and only as diagnosis: card-by-card drop-off, to see whether anyone swipes at all.""",
    """Whether the carousel format is worth building for this product — a question that is two attempts old and
still completely unanswered.""",
    "Motorhölje SO Batch 6", extra="\n" + CAROUSEL_WARN))

write(IMG, "Enginecover_PD_20_C1", static(
    "Enginecover_PD_20_C1", "PD",
    "vinkel=`problem/lösning + kvalificering (storlek)` · hook-typ=`fråga` · format=`karusell 5 kort` · proof=`demo` · offer-i-creativen=`ingen offer` · visuell stil=`kollage/sekvens` · textmängd=`rubrik+en rad per kort` · talare=`ingen`",
    "**Carousel, 5 cards**, product-demo angle. The size-finder as a swipeable sequence — the natural home for the idea.",
    """Size qualification has been attempted three times and measured zero times: `PD_6_1` got 28 kr,
`PD_13_1`/`PD_13_2` inherited identical copy so the pair measured nothing, and `PD_18_C1` was
briefed in batch #5 and never built.

The carousel is the format the idea actually wants. A grid in one frame has to shrink six bands
into a thumbnail; a sequence gives each band its own card at full size. And the PD block — 64 % of
judgeable spend, worst click quality of the three — is where qualifying pays most.

`PD_19_1` in this batch runs the same idea as a single image, in the same campaign. That gives us
the size-finder in two formats at once.""",
    "A card per size band lifts purchases per click above the PD block's 2,4 %, and beats the single-frame grid in PD_19_1, because each band gets room to be read.",
    "The PD angle, the size bands exactly as the store lists them, the black cover.",
    "**The format** — five cards instead of one frame.",
    """Five cards, **1:1 (1080×1080)**, one image file per card. Consistent light and colour across all five.

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
faking scale in post.""",
    """| Element | Swedish (use this) | English meaning |
|---|---|---|
| Rubrik | Vilken storlek har din motor? | What size is your motor? |
| Kort 1 | Hitta rätt hölje för din utombordare | Find the right cover for your outboard motor |
| Kort 2 | 60–90 hk | 60–90 hp |
| Kort 3 | 100–150 hk | 100–150 hp |
| Kort 4 | 175–250 hk | 175–250 hp |
| Kort 5 | Hitta din storlek och beställ nu | Find your size and order now |""",
    """**Purchases per click against the PD block's 2,4 %**, then head-to-head against `PD_19_1`, which runs
the same idea as a single image. **Expect CTR to fall.**""",
    """Whether size qualification works at all — on the fourth attempt — and whether the carousel adds anything
over a single frame carrying the same idea. Two open questions answered by one ad.""",
    "Motorhölje PD Batch 6 — same ad set as PD_19_1 and PD_19_2", extra="\n" + CAROUSEL_WARN))

# =============================================================== D. DECAY TEST (video)

DECAY_WHY = """**This is the most important question in the account and nothing currently answers it.**

Nine ads were re-measured on 2026-08-09 against their 2026-08-06 numbers. Every one of them returned
**less** profit per krona than three days earlier — except `Motorhölje_PD_1_H3`, which took another
2 972 kr and held flat. The ads that looked best on small spend fell hardest:
`Enginecover_SP_5_H1` went from 1 405 kr per 1 000 down to **77** while taking 1 505 kr more;
`Enginecover_PD_6_C1` went from 341 to **−242** and is now the only ad in the account losing money.

So the account has exactly **one** asset that survives scale, and it is a long product-demo video
carrying 42 % of all spend. If it fatigues we have nothing behind it. Everything else we have tried
to scale has collapsed within days.

**We do not know why it survives.** Our best guess is breadth: a long, varied demo gives Meta more
to work with across a wider audience, so it exhausts its pocket slower. That is a hypothesis, not a
finding — `PD_1_H3` holds 21,2 % of viewers to the halfway mark, which is good but not the account's
best. These two videos test it directly."""

write(VID, "Enginecover_PD_21_H1", video(
    "Enginecover_PD_21_H1", "PD",
    "vinkel=`problem/lösning` · hook-typ=`påstående` · format=`video 20 s, voiceover+broll` · proof=`demo` · offer-i-creativen=`ingen offer` · talare=`röst utan ansikte`",
    "Video in the product-demo angle. **Sibling of `PD_1_H3`** — same structure, new footage. Tests whether the account's only scale-proof asset is the format or the file.",
    DECAY_WHY + """

**What this one isolates:** `PD_21_H1` copies `PD_1_H3`'s structure exactly — same beats, same
order, same length class — but is shot on **different footage, a different boat and a different
location**. If it also resists decay, the durability lives in the *format* and we can print more of
them. If it decays like everything else, the durability was that particular file, and the strategy
becomes protecting `PD_1_H3` rather than replacing it.""",
    "A structural copy of PD_1_H3 on new footage holds its profit per 1 000 kr past 2 000 kr of spend, where every other ad in this account has fallen.",
    "**PD_1_H3's structure and beat order**: problem → mechanism → friction-remover → CTA. And the PD copy block.",
    "**The footage** — different boat, different location, different engine. Nothing else.",
    """| | |
|---|---|
| Length | **20 seconds.** |
| Ratios | 9:16 (1080×1920) **and** 4:5 (1080×1350), each re-framed properly |
| Codec | H.264 MP4, 30 fps, under 100 MB, audio −14 LUFS |
| Voice | Voiceover, no face. Plain and direct, never announcer-style. |
| Footage | **New. Do not reuse any frame from PD_1_H3.** Different boat, different jetty, larger outboard. |
| Colour | Black cover only |
| Production level | Medium |""",
    """| Time | Swedish (use this) | English meaning |
|---|---|---|
| 0–4 s | Motorn står ute vid bryggan, oskyddad mellan varje tur. | The engine sits out at the dock, unprotected between trips. |
| 4–8 s | Det här motorhöljet är i 420D Oxfordtyg, vattenavvisande och slitstarkt. | This engine cover is made of 420D Oxford fabric, water-repellent and durable. |
| 8–12 s | Dragsko runt hela kanten håller det på plats, oavsett väder. | A drawstring around the whole edge keeps it in place, whatever the weather. |
| 12–16 s | På och av på några sekunder, varje gång du lägger till. | On and off in a few seconds, every time you dock. |
| 16–20 s | Skydda din utombordare – beställ på baverbutiken.se. | Protect your outboard – order at baverbutiken.se. |""",
    """| Time | Shot |
|---|---|
| 0–4 s | The uncovered outboard at the jetty, weather on it. **Product in frame at 0,0 s.** |
| 4–8 s | Close on the fabric, hands working the material. |
| 8–12 s | The drawstring being pulled tight around the whole edge. |
| 12–16 s | Cover off and back on in one motion. Honest speed — no speed-ramp. |
| 16–20 s | End on the covered engine, water behind. |""",
    """Max four.

| Time | Swedish (use this) | English meaning |
|---|---|---|
| 4–8 s | 420D Oxfordtyg | 420D Oxford fabric |
| 8–12 s | Dragsko runt hela kanten | Drawstring all the way round |
| 12–16 s | På och av på sekunder | On and off in seconds |
| 16–20 s | Passar 6–250 hk | Fits 6–250 hp |""",
    """**Profit per 1 000 kr at 2 000 kr of spend and again at 4 000 kr.** The number that matters is not the
first reading — it is whether the second reading is lower. `PD_1_H3` sits at 431 and holds.
No verdict before 300 kr and 3 purchases.""",
    """Whether the one thing in this account that survives scale is reproducible. That single answer decides
whether the next three months are about making more long demos or about protecting the one we have.""",
    "Motorhölje PD Batch 6"))

write(VID, "Enginecover_PD_22_H1", video(
    "Enginecover_PD_22_H1", "PD",
    "vinkel=`problem/lösning` · hook-typ=`påstående` · format=`video 35 s, voiceover+broll` · proof=`demo` · offer-i-creativen=`pris nämns (299) i sista raden` · talare=`röst utan ansikte`",
    "Video in the product-demo angle. **35 seconds** — the long end. Runs against `PD_21_H1` to isolate length from footage.",
    DECAY_WHY + """

**What this one isolates:** length. `PD_21_H1` in this batch is 20 seconds on new footage;
`PD_22_H1` is the **same beats stretched to 35 seconds** with three extra ideas — fit, sizes, and
the guarantee — that the short cut has no room for. Running them together separates "long demos
last" from "that particular video lasts".

If the 35-second cut decays more slowly than the 20-second cut, breadth is the mechanism and we know
what to build. If it decays the same or faster, length is not the answer and we stop guessing.""",
    "More content per ad slows decay. The 35-second cut holds its profit per 1 000 kr better than the 20-second cut over the same spend.",
    "The PD block, the beat order, the black cover, the new footage from the same shoot as PD_21_H1.",
    "**The length only** — 35 s against PD_21_H1's 20 s, three additional beats. Shoot both in the same session, on the same boat, so footage is not a competing explanation.",
    """| | |
|---|---|
| Length | **35 seconds.** |
| Ratios | 9:16 (1080×1920) **and** 4:5 (1080×1350) |
| Codec | H.264 MP4, 30 fps, under 100 MB, audio −14 LUFS |
| Voice | Voiceover, no face. Same voice as `PD_21_H1` — if the voice changes, the length test is contaminated. |
| Footage | **Same shoot as `PD_21_H1`**, same boat, same location, same engine. |
| Colour | Black cover only |
| Production level | Medium |""",
    """| Time | Swedish (use this) | English meaning |
|---|---|---|
| 0–4 s | Motorn står ute vid bryggan, oskyddad mellan varje tur. | The engine sits out at the dock, unprotected between trips. |
| 4–9 s | Det här motorhöljet är i 420D Oxfordtyg, vattenavvisande och slitstarkt. | This engine cover is made of 420D Oxford fabric, water-repellent and durable. |
| 9–14 s | Universell passform som sluter tätt runt motorn. | Universal fit that closes tightly around the engine. |
| 14–19 s | Dragsko runt hela kanten – sitter kvar även om det blåser. | A drawstring around the whole edge – stays put even when it's windy. |
| 19–24 s | På och av på några sekunder, varje gång du lägger till. | On and off in a few seconds, every time you dock. |
| 24–28 s | Finns i storlekar från 6 hk upp till 250 hk. | Available in sizes from 6 hp up to 250 hp. |
| 28–32 s | Och du får 30 dagars nöjd-kund-garanti. | And you get a 30-day satisfaction guarantee. |
| 32–35 s | Just nu 299 kr på baverbutiken.se. | Right now 299 SEK at baverbutiken.se. |""",
    """| Time | Shot |
|---|---|
| 0–4 s | The uncovered outboard at the jetty. **Product in frame at 0,0 s.** |
| 4–9 s | Close on the 420D weave. |
| 9–14 s | The cover being drawn down over the engine, the fit closing up. |
| 14–19 s | The drawstring pulled tight; wind visibly in the frame if possible. |
| 19–24 s | Cover off and back on in one motion, honest speed. |
| 24–28 s | Two different engine sizes, cut back to back, both covered. |
| 28–32 s | The covered engine, wide, at the jetty. |
| 32–35 s | End card: covered engine, price on screen. |""",
    """Max five over 35 seconds.

| Time | Swedish (use this) | English meaning |
|---|---|---|
| 4–9 s | 420D Oxfordtyg | 420D Oxford fabric |
| 14–19 s | Dragsko runt hela kanten | Drawstring all the way round |
| 19–24 s | På och av på sekunder | On and off in seconds |
| 24–28 s | Passar 6–250 hk | Fits 6–250 hp |
| 28–32 s | 30 dagars nöjd-kund-garanti | 30-day satisfaction guarantee |""",
    """**Profit per 1 000 kr at 2 000 kr and again at 4 000 kr, head-to-head against `PD_21_H1`.** The
comparison is the point — a single reading tells us nothing. Secondary: hold to the halfway mark
against `PD_1_H3`'s 21,2 %.""",
    """Whether length is the mechanism behind the account's only durable asset. Either answer changes what we
build next, and neither is currently known.""",
    "Motorhölje PD Batch 6 — same ad set as PD_21_H1"))

# =============================================================== E. SP AT BREADTH

SP_WHY = """**The social-proof block was the account's best asset three days ago and it is now the account's
clearest cautionary tale.**

On 2026-08-06 it returned 1 145 kr of profit per 1 000 kr on 11 % of spend, and the recommendation
coming out of that run was to scale it. Since then `Enginecover_SP_5_H1` took another 1 505 kr and
bought **three** purchases with it. Its lifetime profit fell from 1 405 kr per 1 000 to **77**. The
block as a whole halved, from 1 145 to **550**.

That is not a reason to abandon it — 550 is still the best of the three blocks, ahead of SO's 318
and PD's 309. It is a reason to stop concluding anything from two ads. The block has exactly **two**
judgeable ads, one of which collapsed the moment it was pushed. We need more of them before the
number means anything.

The two videos briefed to answer this in batch #5 — `SP_13_H1` and `SP_15_H1` — did launch on
7 August and then sat in an ad set that was **paused at 718 kr and 2 purchases**, well below the
300 kr / 3 purchase gate. Neither has been read. Both are still open questions."""

write(VID, "Enginecover_SP_16_H1", video(
    "Enginecover_SP_16_H1", "SP",
    "vinkel=`social proof/tillit` · hook-typ=`påstående` · format=`video 20 s, creator-UGC` · proof=`egen erfarenhet` · offer-i-creativen=`pris nämns (299)` · talare=`creator i bild`",
    "Creator-led video in the social-proof angle, **new speaker**. Portability test — the third distinct person to carry this block.",
    SP_WHY + """

**What this one isolates:** the speaker. The block has worked with two people and collapsed with
one of them at scale. A third, unrelated creator tells us whether the angle travels or whether the
performance belonged to particular faces.""",
    "A third creator reproduces the block's conversion rate, confirming the angle is portable across people rather than tied to two specific performers.",
    "The social-proof angle, the mechanism claims, the guarantee, the black cover.",
    "**The speaker.** A creator who has not appeared in our ads before.",
    """| | |
|---|---|
| Length | **20 seconds.** Do not run over. |
| Deliverables | **3 files** — one per opening line, **identical from 00:04 onward** |
| Ratios | 9:16 (1080×1920) **and** 4:5 (1080×1350) |
| Codec | H.264 MP4, 30 fps, under 100 MB, audio −14 LUFS |
| Sound | The creator's real voice, on location. No studio VO, no music over dialogue. |
| Casting | Swedish-speaking, roughly 35–65, plausibly a boat owner. Ordinary clothes, no branded gear, no presenter energy. |
| Camera | Handheld. Phone quality is correct and preferred. Natural light. |
| Colour | Black cover only |
| Production level | Medium |""",
    """| Time | Swedish (use this) | English meaning |
|---|---|---|
| 0–4 s | Motorn min stod ute vid bryggan hela sommaren, helt oskyddad. | My engine sat out at the dock all summer, completely unprotected. |
| 4–8 s | Så jag skaffade det här motorhöljet från Bäverbutiken. | So I got this engine cover from Bäverbutiken. |
| 8–12 s | 420D Oxfordtyg, vattenavvisande, och dragskon gör att det sitter som en smäck. | 420D Oxford fabric, water-repellent, and the drawstring makes it fit perfectly. |
| 12–16 s | Tar typ tre sekunder att sätta på efter en tur. | Takes about three seconds to put on after a trip. |
| 16–20 s | Kostar 299 kr och du får 30 dagars nöjd-kund-garanti på baverbutiken.se. | Costs 299 SEK and you get a 30-day satisfaction guarantee at baverbutiken.se. |

### Three alternative openings (0–3 s) — shoot all three

Everything from 00:04 onward must be **identical** across the three cuts. If anything else differs,
the hook comparison is dead.

| Swedish (use this) | English meaning |
|---|---|
| Jag var trött på att motorn stod oskyddad vid bryggan. | I was tired of my engine sitting unprotected at the dock. |
| Efter varje tur slänger jag bara på det här – klart på sekunder. | After every trip I just throw this on – done in seconds. |
| Ville skydda motorn utan att krångla med presenningar. | I wanted to protect my engine without fussing with tarps. |""",
    """| Time | Shot |
|---|---|
| 0–4 s | Creator at the jetty holding the folded cover, the outboard behind them. **Product in frame from the first frame.** |
| 4–8 s | Creator fitting the cover, talking while doing it. |
| 8–12 s | Close on fabric and drawstring, creator's hands. |
| 12–16 s | Cover off and back on in one motion. Honest speed. |
| 16–20 s | Creator direct to camera. End on the covered motor. |""",
    """Max four.

| Time | Swedish (use this) | English meaning |
|---|---|---|
| 4–8 s | 420D Oxfordtyg | 420D Oxford fabric |
| 8–12 s | Vattenavvisande | Water-repellent |
| 12–16 s | På och av på sekunder | On and off in seconds |
| 16–20 s | 30 dagars nöjd-kund-garanti | 30-day satisfaction guarantee |""",
    """**Purchases per click, against the SP block's 4,4 %.** Then profit per 1 000 kr at 2 000 kr of spend —
not before. `SP_5_H1` looked like the account's best ad at 687 kr and was near the bottom by 2 192 kr.
**Do not call this one early.** Hook rate is diagnosis only: the ad with the account's worst hook
returns among the most profit per krona.""",
    """Whether the social-proof advantage lives in the words or in the person saying them. With `SP_13_H1`
unread in a paused ad set, this block still rests on two ads — and one of them broke.""",
    "Motorhölje SP Batch 6 — **not** the paused Batch 5 ad set"))

write(VID, "Enginecover_SP_17_H1", video(
    "Enginecover_SP_17_H1", "SP",
    "vinkel=`social proof/tillit` · hook-typ=`påstående` · format=`video 20 s, voiceover+broll` · proof=`egen erfarenhet` · offer-i-creativen=`pris nämns (299)` · talare=`röst utan ansikte`",
    "Video in the social-proof angle, **no face on camera**. Isolates the trust mechanism from the talking head.",
    SP_WHY + """

**What this one isolates:** whether the block needs a person on screen at all. Every SP ad we have
ever run puts a face in frame. If the same first-person account works as voice over product
footage, the block stops depending on creator availability — which is the practical reason it has
never grown past 11 % of spend.

Run it against `SP_16_H1`, which uses the same angle and the same claims **with** a face. Same
batch, same week, same block. That is as close to a clean read as this account allows.""",
    "First-person trust survives without a face on camera. SP_17_H1 lands within range of SP_16_H1 on purchases per click, which would make the block reproducible without booking creators.",
    "The social-proof angle, the first-person voice, the mechanism claims, the guarantee.",
    "**The speaker is removed from frame** — voice over product footage instead of a creator on camera.",
    """| | |
|---|---|
| Length | **20 seconds.** |
| Ratios | 9:16 (1080×1920) **and** 4:5 (1080×1350) |
| Codec | H.264 MP4, 30 fps, under 100 MB, audio −14 LUFS |
| Voice | **A real person telling their own story — one boat owner to another. Never announcer-style, never a read.** The words are first person and must sound it. |
| Footage | Product b-roll. Existing footage is fine. Favour a larger outboard. **No face on camera at any point.** |
| Colour | Black cover only |
| Production level | Medium |""",
    """| Time | Swedish (use this) | English meaning |
|---|---|---|
| 0–4 s | Motorn min stod ute vid bryggan mellan varje tur, helt oskyddad. | My engine sat out at the dock between every trip, completely unprotected. |
| 4–8 s | Då hittade jag det här motorhöljet på Bäverbutiken. | Then I found this engine cover at Bäverbutiken. |
| 8–12 s | 420D Oxfordtyg, vattenavvisande, med dragsko runt hela kanten. | 420D Oxford fabric, water-repellent, with a drawstring around the whole edge. |
| 12–16 s | På och av på några sekunder, varje gång. | On and off in a few seconds, every time. |
| 16–20 s | 299 kr, och du har 30 dagars nöjd-kund-garanti – baverbutiken.se. | 299 SEK, and you get a 30-day satisfaction guarantee – baverbutiken.se. |""",
    """| Time | Shot |
|---|---|
| 0–4 s | The uncovered outboard at the jetty. **Product in frame at 0,0 s.** |
| 4–8 s | The folded cover in hand, then the engine behind it. |
| 8–12 s | Macro: weave, then the drawstring edge pulled tight. |
| 12–16 s | Cover off and back on in one motion. |
| 16–20 s | The covered engine, wide. Price on screen only at the very end. |""",
    """Max four.

| Time | Swedish (use this) | English meaning |
|---|---|---|
| 4–8 s | 420D Oxfordtyg | 420D Oxford fabric |
| 8–12 s | Dragsko runt hela kanten | Drawstring all the way round |
| 12–16 s | På och av på sekunder | On and off in seconds |
| 16–20 s | 30 dagars nöjd-kund-garanti | 30-day satisfaction guarantee |""",
    """**Purchases per click head-to-head against `SP_16_H1`**, same block, same week. Both must reach 300 kr
and 3 purchases before either is judged.""",
    """Whether the social-proof block is a copy asset or a casting asset. If it works without a face, the block
can finally be produced at volume — which is the only way it ever gets past 11 % of spend.""",
    "Motorhölje SP Batch 6 — same ad set as SP_16_H1"))

# =============================================================== F. RETARGETING

write(VID, "Enginecover_SO_19_H1", video(
    "Enginecover_SO_19_H1", "SO",
    "vinkel=`offer/påminnelse` · hook-typ=`fråga` · format=`video 15 s, voiceover+broll` · proof=`inget (produktclaim)` · offer-i-creativen=`pris syns (299 mot 367)` · talare=`röst utan ansikte`",
    "Short reminder video for **retargeting**. **BLOCKED — see section 0.** Second attempt; the first was briefed in batch #4 and launched into cold traffic instead.",
    """`Motorhölje_PD_1_H3` alone has produced roughly a hundred more add-to-carts than purchases. Nothing in
this account speaks to any of those people. **100 % of spend is cold prospecting** and there is still
no retargeting ad set.

This was already briefed once, as `SO_10_H1` in batch #4. It launched on 7 August — into a cold ad
set, because no retargeting ad set exists. It has 156 kr and zero purchases, which measures nothing
about retargeting at all.

So this brief exists in two parts: the creative below, and a blocker that has to be cleared before
the creative means anything.""",
    "A short reminder to people who have already seen the product page converts far above cold traffic, because the persuasion is already done and only the nudge is missing.",
    "The SO offer framing, the price proof, the black cover.",
    "**The audience** — warm instead of cold — and the length, 15 s instead of 20.",
    """| | |
|---|---|
| Length | **15 seconds.** Shorter than everything else we run — these people have already seen the pitch. |
| Ratios | 9:16 (1080×1920) **and** 4:5 (1080×1350) |
| Codec | H.264 MP4, 30 fps, under 100 MB, audio −14 LUFS |
| Voice | Voiceover, no face. Warm and matter-of-fact, like a reminder, not a pitch. |
| Footage | Existing product b-roll is fine. No new shoot needed. |
| Colour | Black cover only |
| Production level | **Simple** |""",
    """| Time | Swedish (use this) | English meaning |
|---|---|---|
| 0–4 s | Kommer du ihåg motorhöljet du kollade på? | Remember the engine cover you were looking at? |
| 4–8 s | 420D Oxfordtyg som skyddar din utombordare mellan turerna. | 420D Oxford fabric that protects your outboard between trips. |
| 8–12 s | Just nu 299 kr istället för 367 kr. | Right now 299 SEK instead of 367 SEK. |
| 12–15 s | Så länge lagret räcker – baverbutiken.se. | While stocks last – baverbutiken.se. |

**Do not add a line claiming the viewer put anything in their basket.** The audience is site
visitors; some of them never did, and being wrong about that reads as creepy rather than helpful.""",
    """| Time | Shot |
|---|---|
| 0–4 s | The covered engine, immediately recognisable as the product page hero. **Product at 0,0 s.** |
| 4–8 s | Macro on the fabric and drawstring. |
| 8–12 s | The price on screen: `367 kr` struck through, `299 kr` beside it. |
| 12–15 s | End on the covered engine at the jetty. |""",
    """Max three over 15 seconds.

| Time | Swedish (use this) | English meaning |
|---|---|---|
| 4–8 s | 420D Oxfordtyg | 420D Oxford fabric |
| 8–12 s | 299 kr istället för 367 kr | 299 kr instead of 367 kr |
| 12–15 s | Så länge lagret räcker | While stock lasts |""",
    """**CPA against the account's cold-traffic CPA of 187 kr.** A retargeting ad that does not beat cold
traffic by a wide margin is not doing its job. No verdict before 300 kr and 3 purchases.""",
    """Whether the ~100 abandoned carts per volume ad are recoverable. It is the largest untouched pool of
demand in the account and we have never once addressed it.""",
    "**Motorhölje Retargeting — this ad set does not exist yet. See section 0.**",
    extra="""
---

## 0. BLOCKER — do not launch this into a cold ad set

This creative is only worth building once a **retargeting ad set** exists, built on a site-visitor
or view-content audience from the pixel. Launching it to cold traffic is what happened to
`SO_10_H1` and it produced 156 kr of unreadable data.

**Order of work:** create the retargeting ad set first, then build this. If the ad set cannot be
created, leave this brief unbuilt and say so — do not launch it anyway.
"""))

print("done")

# =============================================================== G. EXTRA 4 (kvot 18)

write(IMG, "Enginecover_SO_16_5", static(
    "Enginecover_SO_16_5", "SO",
    "vinkel=`offer/överlager` · hook-typ=`påstående` · format=`statisk` · proof=`demo` · offer-i-creativen=`ingen offer` · visuell stil=`person i bild` · textmängd=`rubrik+underrad` · talare=`person i bild (stillbild)`",
    "Static in the offer angle, **person in frame**. Fifth arm of the SO_16 image test.",
    SO16_WHY + """

**What this fifth arm adds:** the other four are all product-only. This one puts a human in the
frame. Whether a person present in a *still* image changes anything has never been tested here —
every ad with a person in it has been video. It is the one visual variable that could plausibly
explain the 34× spread on its own.""",
    "A person in frame outperforms product-only images, because a still of someone using the product carries the same trust signal that makes the video block convert.",
    SO16_KEPT,
    "**The image only.** A person is present. Copy, headline, CTA, landing page and ad set are identical to SO_16_1 through SO_16_4.",
    """**Someone fitting the cover at the jetty.** Hands and upper body in frame, face partly visible —
this is not a portrait, the product is still the subject. Ordinary clothes, no branded gear, no
posing at the camera. Shot in daylight on a real jetty, mid-motion so it reads as use rather than
display. The outboard should be one of the larger sizes.

**Do not put a caption, name or quote on the person.** No invented testimonial, no attribution.""",
    """| Element | Swedish (use this) | English meaning |
|---|---|---|
| Rubrik | På med höljet, klart på sekunder | Cover on, done in seconds |
| Underrad | 420D Oxfordtyg med dragsko runt kanten – sitter kvar vid bryggan | 420D Oxford fabric with drawstring edge – stays put at the dock |""",
    SO16_KPI, SO16_LEARN,
    "Motorhölje SO Batch 6 — same ad set as SO_16_1 through SO_16_4"))

write(IMG, "Enginecover_SO_20_1", static(
    "Enginecover_SO_20_1", "SO",
    "vinkel=`offer/överlager` · hook-typ=`påstående` · format=`statisk` · proof=`demo` · offer-i-creativen=`pris syns` · visuell stil=`råfoto/ostylat` · textmängd=`rubrik+underrad` · talare=`ingen`",
    "Static in the offer angle, **deliberately unstyled**. Tests production polish as a variable — something this account has never varied on purpose.",
    """Every image in this account is a produced shot. Whether that is helping is unknown, and it is a
cheap thing to find out: platform-native, phone-shot creative routinely outperforms polished
creative because it does not read as an ad in the first place.

This matters here specifically because **the offer block's problem is credibility, not clarity.**
The SO block converts 2,1 % of clicks against the social-proof block's 4,4 %, and its copy makes an
overstock claim that a glossy studio image quietly contradicts.""",
    "An unstyled, phone-quality photo outperforms the produced shots in the same block, because it reads as a real owner's picture rather than an advertisement.",
    "The SO copy block, the black cover, the CTA, the landing page.",
    "**Production polish** — everything else about the shot stays ordinary.",
    """**Make it look like a boat owner's own phone photo.** Slightly off-centre framing, available light
including harsh sun if that is what the day gives, a little clutter in the background — rope, fenders,
a wet jetty. No studio lighting, no colour grade, no retouching, no drop shadow, no white sweep.

Shoot it on a phone. Do not fake this in post: an over-processed image with a filter applied reads
as a fake candid, which is worse than an honest studio shot. The product must still be unmistakably
the subject and the cover must still be black.

Set the on-image text in a plain, unstyled typeface — as if it were added afterwards, not designed in.""",
    """| Element | Swedish (use this) | English meaning |
|---|---|---|
| Rubrik | Så här ser motorhöljet ut på riktigt | This is what the engine cover actually looks like |
| Underrad | 420D Oxfordtyg, vattenavvisande, dragsko runt kanten – 299 kr | 420D Oxford fabric, water-repellent, drawstring edge – 299 kr |""",
    """**Profit per 1 000 kr against the SO_16 statics**, which run the same copy block in the same campaign
but are produced shots. No verdict before 300 kr and 3 purchases.""",
    """Whether production value is worth what it costs us in this account. If the phone photo wins, every future
static gets cheaper and faster — which is the actual bottleneck right now.""",
    "Motorhölje SO Batch 6"))

write(IMG, "Enginecover_SP_18_1", static(
    "Enginecover_SP_18_1", "SP",
    "vinkel=`social proof/tillit` · hook-typ=`påstående` · format=`statisk` · proof=`inget (produktclaim)` · offer-i-creativen=`ingen offer` · visuell stil=`textfri produktbild + rubrik` · textmängd=`rubrik+underrad+badge` · talare=`ingen`",
    "Static in the social-proof angle. **The SP block has only ever run as video** — this is the first time it is tested as an image.",
    SP_WHY + """

**What this one isolates:** the format. Both judgeable SP ads are videos with a person on camera.
Nobody knows whether the block's click quality is a property of the words or of the medium. A
static is also the cheapest possible way to add a third data point to a block that currently rests
on two — and one of those two collapsed.

`SP_17_H1` in this batch removes the face but keeps the video. This one removes the video too.""",
    "The social-proof block keeps its click-quality advantage as a static, which would make it producible without a shoot and finally let it grow past 11 % of spend.",
    "The SP copy block, the mechanism claims, the guarantee, the black cover.",
    "**The format** — static instead of video, and no person anywhere in the frame.",
    """**The cover fitted on an outboard, calm and unhurried.** Still water, soft daylight, a jetty or a
moored boat behind. The mood is reassurance rather than demonstration — this image has to carry a
trust angle without a person and without a quote, so the setting and the light do that work.

No person, no hands, no motion blur. Product fills at least a third of the frame. Set the guarantee
as a small badge, bottom corner, understated — not a starburst.""",
    """| Element | Swedish (use this) | English meaning |
|---|---|---|
| Rubrik | Skydd som håller utombordaren skyddad mellan turerna | Protection that keeps the outboard covered between trips |
| Underrad | 420D Oxfordtyg, vattenavvisande, dragsko runt hela kanten | 420D Oxford fabric, water-repellent, drawstring around the entire edge |
| Garantibadge | 30 dagars nöjd-kund-garanti | 30-day satisfaction guarantee |""",
    """**Purchases per click against the SP block's 4,4 %**, which is the account's best. Then profit per
1 000 kr — but not before 2 000 kr of spend. `SP_5_H1` looked like the account's best ad at 687 kr
and was near the bottom by 2 192 kr.""",
    """Whether the social-proof advantage survives without video. If it does, the block stops being limited by
creator availability, which is the only reason it has never grown.""",
    "Motorhölje SP Batch 6"))

write(VID, "Enginecover_PD_23_H1", video(
    "Enginecover_PD_23_H1", "PD",
    "vinkel=`problem/lösning` · hook-typ=`påstående` · format=`video 15 s, voiceover+broll` · proof=`demo` · offer-i-creativen=`pris nämns (299)` · talare=`röst utan ansikte`",
    "Video in the product-demo angle, **15 seconds — the short end**. Sibling of `Motorhölje_PD_EXTRA`, built so the short-demo format can be scale-tested without risking the original.",
    DECAY_WHY + """

**Why a second short demo rather than scaling the first:** `Motorhölje_PD_EXTRA` returns
**1 376 kr per 1 000 kr**, the highest in the account — on 795 kr of spend. It has never been
pushed. Four times now, an ad that looked like that under 800 kr has collapsed when it was given
money, so pushing PD_EXTRA is a real risk to the one high-efficiency asset we have.

A sibling solves that. Run this one up to 2 000 kr instead. If the short-demo format holds, we
scale both. If it decays like everything else, we have learned it for the price of a new ad rather
than by breaking the original.

Together with `PD_21_H1` (20 s) and `PD_22_H1` (35 s) this gives three lengths of the same demo in
one batch — the cleanest read on length this account has ever had.""",
    "The short-demo format keeps its efficiency past 2 000 kr of spend, which would make PD_EXTRA's number a property of the format rather than a small-sample artefact.",
    "PD_EXTRA's structure and pace: everything said, fast, nothing padded. And the PD copy block.",
    "**The footage** — new material, same shoot as `PD_21_H1` and `PD_22_H1` so length is the only thing separating the three.",
    """| | |
|---|---|
| Length | **15 seconds.** Do not run over — the whole point is that everything fits. |
| Ratios | 9:16 (1080×1920) **and** 4:5 (1080×1350) |
| Codec | H.264 MP4, 30 fps, under 100 MB, audio −14 LUFS |
| Voice | Voiceover, no face. **Same voice as `PD_21_H1` and `PD_22_H1`** — if the voice changes, the length comparison is contaminated. |
| Footage | **Same shoot as `PD_21_H1` and `PD_22_H1`.** Same boat, same jetty, same engine. |
| Colour | Black cover only |
| Production level | **Simple** |""",
    """| Time | Swedish (use this) | English meaning |
|---|---|---|
| 0–4 s | Utombordaren står ute vid bryggan – oskyddad mellan turerna. | The outboard sits at the dock – unprotected between trips. |
| 4–8 s | 420D Oxfordtyg, vattenavvisande, håller regn och smuts borta. | 420D Oxford fabric, water-repellent, keeps rain and grime out. |
| 8–12 s | Dragsko runt hela kanten – på och av på några sekunder. | Drawstring around the entire edge – on and off in seconds. |
| 12–15 s | 299 kr på baverbutiken.se – så länge lagret räcker. | 299 SEK at baverbutiken.se – while stocks last. |""",
    """| Time | Shot |
|---|---|
| 0–4 s | The uncovered outboard at the jetty. **Product in frame at 0,0 s.** |
| 4–8 s | Macro on the 420D weave, water beading or rain on it if the day allows. |
| 8–12 s | The drawstring pulled tight, then the cover off and back on in one motion. Honest speed. |
| 12–15 s | The covered engine, wide, price on screen. |""",
    """Max three over 15 seconds.

| Time | Swedish (use this) | English meaning |
|---|---|---|
| 4–8 s | 420D Oxfordtyg | 420D Oxford fabric |
| 8–12 s | På och av på sekunder | On and off in seconds |
| 12–15 s | Passar 6–250 hk | Fits 6–250 hp |""",
    """**Profit per 1 000 kr at 2 000 kr of spend**, against `PD_EXTRA`'s 1 376 at 795 kr and against
`PD_21_H1` (20 s) and `PD_22_H1` (35 s) from the same shoot. The first reading is not the answer —
whether it *holds* is.""",
    """Whether the account's most efficient format survives volume, learned without putting `PD_EXTRA` itself at
risk. And, alongside PD_21 and PD_22, whether length has anything to do with durability at all.""",
    "Motorhölje PD Batch 6 — same ad set as PD_21_H1 and PD_22_H1"))
