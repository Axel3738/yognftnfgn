#!/usr/bin/env python3
"""Generator for Motorhoolje batch #7 briefs. Run from products/motorholjet/batch-07/."""
import os

LP = "https://baverbutiken.se/products/marin-motorholje-420d-universellt-skydd"
IMG, VID = "image-ads-briefs", "video-ads-briefs"

# ---------------------------------------------------------------- shared blocks

MARGIN = """## 🔴 READ THIS FIRST — the campaign is now losing money on new spend

Measured in the account on 2026-08-12:

| Window | Spend | Purchases | CPA | Against break-even 236 kr |
|---|---|---|---|---|
| Lifetime | 54 788 kr | 275 | 199 kr | profitable |
| Last 7 days | 36 186 kr | 151 | 240 kr | at the line |
| **Last 3 days** | **13 084 kr** | **45** | **291 kr** | **55 kr lost per order** |

The last three days destroyed roughly **2 400 kr** of contribution. Frequency is **2,83** lifetime
and **1,89 in three days** — the prospecting pool is being hit hard and repeatedly.

**What that means for this brief:** more creatives alone will not fix this. Every ad in the account
fell in efficiency between 09 and 12 August, including `Motorhölje_PD_1_H3`, which had never
declined before. When everything drops at once while frequency climbs, the likeliest cause is the
**audience**, not the creative. This batch is built on that reading: it widens who the ads can
reach, and it iterates the three highest-efficiency ads we own, which have never been iterated.

Do not launch any of it into the existing CBO alongside `PD_1_H3` without reading section 2 first.
"""

STRUCTURE = """## 🔴 Launch structure — this has now failed three times

`Motorhölje_PD_1_H3` takes **42 % of campaign spend**. Every new creative dropped into the same
CBO gets starved:

- **Batch #2:** 16 of 17 statics got under 30 kr each. Unjudgeable.
- **Batch #5 statics** (launched 9 Aug): `SP_12_1` got **5,70 kr**, `SP_12_2` **5,52 kr**,
  `SP_12_3` **159,76 kr**. That was supposed to be a three-way image test with identical copy —
  a 29× budget gap between arms makes it unreadable. `SO_14_1` got 3,06 kr. `PD_17_1` got 3,73 kr.
- **Batch #6** (18 briefs, 9 Aug): never built.

**So: launch this batch in a separate ABO test campaign with an equal daily budget per ad set**,
not into the CBO. Roughly 100–150 kr per ad per day for 3 days gets each creative past the
300 kr / 3 purchase gate where it can actually be judged. Anything less and we spend the money and
learn nothing, for the fourth time.

If that is not possible, launch **fewer ads with more budget each** rather than all of them starved.
Six judged creatives beat eighteen unjudgeable ones.
"""

COPYGATE = """## ⚠️ COPY GATE

Ads Manager has been auto-filling primary text from a saved preset keyed to the **angle prefix in
the ad name** (`PD_`, `SP_`, `SO_`). Every ad in batches #1–#4 ran copy nobody briefed because of it.

**Possible good news:** the batch-#5 statics launched on 9 August are named
`Enginecover_SP_12_1_creative 2026-08-09-…` instead of carrying the old copy-block prefix, which
suggests they were built fresh rather than duplicated. **We cannot confirm it** — those creatives
are built from page posts, so the body and headline are not readable from the account. Treat the
copy problem as unresolved until someone reads one back in Ads Manager.

Paste the primary text and headline from the COPY CARD below, character for character. **After the
ad is live, open it and read it back against the card.**
"""

CTR_NOTE = """> **Do not optimise this for clicks.** Across fifteen judgeable ads, the ads that buy the
> cheapest, most abundant clicks convert the worst. Fewer clicks with a higher add-to-cart rate is
> a better ad.
"""

DECAY_NOTE = """> **No verdict before 300 kr spend and 3 purchases, and no "winner" call before 2 000 kr.**
> Five times now an ad has looked excellent under 800 kr and collapsed when pushed —
> `Enginecover_SP_5_H1` went from 1 405 kr profit per 1 000 down to **−75**. A strong first
> reading is a hypothesis, not a win.
"""

INHERITED = {
    "PD": ("""> Regn, sol och salt sliter på din motor varje dag ⛵
> Det här höljet skyddar mot väder och rost.
> Universell passform — passar de flesta utombordare.
> Enkelt att sätta på och ta av.
> Skydda din motor redan idag 👇""", "Skydda din motor – år efter år",
           "Not banned, but it is the block with the account's **worst click quality** (2,4 % of clicks buy)."),
    "SP": ("""> Båtägare pratar om det här höljet just nu 🌊
> Sitter kvar även i storm och blåst.
> Håller motorn helt torr och skyddad.
> Hundratals nöjda kunder redan.
> Se varför själv 👇""", "Motorskyddet båtägare litar på",
           "**Contains a banned claim** — \"Hundratals nöjda kunder redan.\" We have zero verified reviews."),
    "SO": ("""> Din motor kostar för mycket för att lämnas oskyddad ⚓
> Skydda den mot regn, sol, salt och rost.
> Universell passform, enkel att sätta på.
> Just nu till kampanjpris.
> Beställ innan lagret tar slut 👇""", "Skydda din motor – innan vintern",
           "**Contains two banned claims** — the winter deadline in August, and \"Beställ innan lagret tar slut\". It is live on `SO_4_H1`, the account's most efficient ad, right now."),
}

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

RULES = """## Hard rules — breaking any one makes the ad unusable

- **Price is exactly 299 kr, ordinary price exactly 367 kr.** Never another number, never a
  percentage other than 19 %.
- **Never claim a customer count, rating or review count**, and never imply that other people have
  bought it. We have zero verified reviews.
- **Never reference winter, cold or autumn.** It is August, boating season.
- **Never write "innan lagret tar slut".** The only permitted urgency phrase is
  **"så länge lagret räcker"**.
- **Water-repellent, never waterproof.** "Vattenavvisande", never "vattentät".
- **Universal fit, never tailored.** Never "formsytt" or "skräddarsytt".
- **No absolute durability claims.** "Blåser aldrig av", "håller för alltid" and similar are out —
  we cannot back them. Describe the mechanism instead.
- **No invented testimonial, name, star rating or quote attributed to a person.**
- **Do not put a figure on what an engine costs.** "Dyr motor" is the ceiling.
- **Size ranges exactly as they exist in the store:** 6 - 18 hk · 20 - 30 hk · 40 - 60 hk ·
  60 - 90 hk · 100 - 150 hk · 175 - 250 hk. Never round, merge or invent one.
- **Nobody rinses their outboard after every trip.**
- **Black cover only.** Mint green and green have sold zero units.

**Spelling traps:** motorhölje · utombordare · hk · 6–250 hk (en dash) · 420D Oxfordtyg ·
Bäverbutiken. Å, Ä and Ö must render — check the font before you set a single word.
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

Set the 4:5 layout separately. Never letterbox the square. Keep all text inside the middle 80 % of
the frame. The headline must be readable at thumbnail size: minimum ~60 px cap height on 1080 px."""


def inherited(angle):
    body, title, note = INHERITED[angle]
    return f"""### What the account will fill in if nobody intervenes

{body}

Headline: `{title}`

{note}
"""


def card(angle):
    body, title = CARDS[angle]
    return f"""## COPY CARD — paste this into Ads Manager exactly

**Primary text:**

{body}

**Headline:** `{title}`

**CTA:** `Handla nu` · **Destination:** {LP}
"""


def write(folder, name, text):
    d = os.path.join(folder, name)
    os.makedirs(d, exist_ok=True)
    open(os.path.join(d, "brief.md"), "w").write(text)


def static(name, angle, tags, typ, why, hyp, kept, changed, design, table, kpi, learn, adset):
    return f"""# {name}

**VARIABELTAGGAR:** {tags}
*(Läses av nästa `/cs` för att gruppera vinstbidrag per variabelvärde. Ändra dem inte utan att ändra creativen.)*

**Type:** {typ}

---

{MARGIN}
---

{STRUCTURE}
---

{COPYGATE}
{inherited(angle)}
---

## 1. Why this ad exists (from the 2026-08-12 teardown)

{why}

**Hypothesis:** {hyp}

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

---

## 4. Text on the image (Swedish word-for-word, do not re-translate)

{table}

---

{card(angle)}
---

{RULES}
---

## 5. Primary KPI

{kpi}

## 6. What we learn regardless of outcome

{learn}
"""


def video(name, angle, tags, typ, why, hyp, kept, changed, fmt, script, shots, overlays, kpi, learn, adset):
    return f"""# {name}

**VARIABELTAGGAR:** {tags}
*(Läses av nästa `/cs` för att gruppera vinstbidrag per variabelvärde. Ändra dem inte utan att ändra creativen.)*

**Type:** {typ}

---

{MARGIN}
---

{STRUCTURE}
---

{COPYGATE}
{inherited(angle)}
---

## 1. Why this ad exists (from the 2026-08-12 teardown)

{why}

**Hypothesis:** {hyp}

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

Do not rephrase, do not translate the right column yourself, do not "fix" the Swedish. If something
looks like a typo, ask before changing it.

{script}

---

## 4. Shot list

{shots}

---

## 5. On-screen text overlays

{overlays}

---

{EDIT_DIR}
---

{card(angle)}
---

{RULES}
---

## 6. Primary KPI

{kpi}

## 7. What we learn regardless of outcome

{learn}
"""


# =============================================================== A. SO_21 fleet — iterate the best ad in the account

SO4_WHY = """**`Enginecover_SO_4_H1` is the most efficient ad this account has ever run and nobody has ever
touched it.**

It became judgeable this week: **434 kr of spend, 5 purchases, CPA 86,75 kr, 1 721 kr of profit per
1 000 kr spent.** That is the best number in the account by a wide margin — `Motorhölje_PD_1_H3`,
which takes 42 % of the budget, returns 340.

It has **0,8 % of spend.**

It is a short video in the offer angle from batch #3, and it has never been iterated once. Four
ads in this batch fix that. Each changes exactly one thing, so whatever comes back is readable.

**One honest limitation:** `SO_4_H1`'s original script was never written down — batch #3 was
briefed outside this system and the video cannot be viewed from the analysis environment. The
script below is a **new script in the same angle and length class**, not a reproduction. If the
original script exists somewhere, use it instead and tell us — that would turn this from a
reconstruction into a true controlled iteration."""

SO4_KPI = """**Profit per 1 000 kr against `SO_4_H1`'s 1 721** — and against each other. All four must run in
the same ad set with equal budget. No verdict before 300 kr and 3 purchases; no winner call before
2 000 kr."""

write(VID, "Enginecover_SO_21_H1", video(
    "Enginecover_SO_21_H1", "SO",
    "vinkel=`offer/överlager` · hook-typ=`påstående` · format=`video 20 s, voiceover+broll` · proof=`inget (produktclaim)` · offer-i-creativen=`pris nämns (299 mot 367)` · talare=`röst utan ansikte`",
    "Video in the offer angle. **Base of the SO_21 fleet** — four iterations of the account's most efficient ad.",
    SO4_WHY + """

**What this one isolates:** the footage. Same angle, same length class, new material. If it lands
near `SO_4_H1`, the performance belongs to the angle and we can print more. If it does not, it
belonged to that specific file.""",
    "A new video in the offer angle at the same length reproduces SO_4_H1's efficiency, which would make the account's best result repeatable instead of a one-off.",
    "The offer angle, the 299/367 price proof, the black cover, the length class.",
    "**The footage** — new material, nothing reused from SO_4_H1.",
    """| | |
|---|---|
| Length | **20 seconds.** |
| Ratios | 9:16 (1080×1920) **and** 4:5 (1080×1350), each re-framed properly |
| Codec | H.264 MP4, 30 fps, under 100 MB, audio −14 LUFS |
| Voice | Voiceover, no face. Plain and direct, never announcer-style. |
| Footage | New. Jetty or marina, daylight, a larger outboard. |
| Colour | Black cover only |
| Production level | Medium |""",
    """| Time | Swedish (use this) | English meaning |
|---|---|---|
| 0–4 s | Vi beställde för många motorhöljen – nu säljer vi ut dem till underpris. | We ordered too many engine covers – now we're selling them at a low price. |
| 4–8 s | 420D Oxfordtyg, vattenavvisande, med dragsko runt hela kanten. | 420D Oxford fabric, water-repellent, with a drawstring around the entire edge. |
| 8–12 s | På och av på några sekunder, redo vid bryggan mellan turerna. | On and off in seconds, ready at the dock between trips. |
| 12–16 s | Ordinarie pris 367 kr – nu 299 kr, en rabatt på 19 %. | Regular price 367 kr – now 299 kr, a 19 % discount. |
| 16–20 s | Beställ på Bäverbutiken.se, så länge lagret räcker. | Order at Bäverbutiken.se, while stock lasts. |""",
    """| Time | Shot |
|---|---|
| 0–4 s | The folded cover held up beside the uncovered outboard. **Product in frame at 0,0 s.** |
| 4–8 s | Close on the 420D weave and the drawstring edge. |
| 8–12 s | Cover on and off in one motion at the jetty. Honest speed, no speed-ramp. |
| 12–16 s | The covered engine, wide, with the price on screen. |
| 16–20 s | End on the covered engine. |""",
    """Max four.

| Time | Swedish (use this) | English meaning |
|---|---|---|
| 4–8 s | 420D Oxfordtyg | 420D Oxford fabric |
| 8–12 s | På och av på sekunder | On and off in seconds |
| 12–16 s | 299 kr istället för 367 kr | 299 kr instead of 367 kr |
| 16–20 s | Så länge lagret räcker | While stock lasts |""",
    SO4_KPI,
    "Whether the account's best result is a property of the offer angle or of one particular file. Everything else in this fleet depends on that answer.",
    "Motorhölje SO Batch 7 (ABO) — all four SO_21 variants, equal budget"))

write(VID, "Enginecover_SO_21_H2", video(
    "Enginecover_SO_21_H2", "SO",
    "vinkel=`offer/överlager` · hook-typ=`siffra/pris` · format=`video 20 s, voiceover+broll` · proof=`inget (produktclaim)` · offer-i-creativen=`pris nämns (299 mot 367)` · talare=`röst utan ansikte`",
    "Video in the offer angle. **Hook variant of `SO_21_H1`** — the opening line is the only difference.",
    SO4_WHY + """

**What this one isolates:** the opening line, and nothing else. This is the account's first clean
hook test. Every previous attempt was contaminated — the batch-#4 hook variants inherited different
copy blocks, and `SP_13_H1`'s three openings were paused before any of them reached the gate.

**Deliver two files**, one per opening below. Everything from 00:04 onward must be identical to
`SO_21_H1` — same footage, same voice take, same overlays, same cut. If anything else differs the
comparison is dead.""",
    "A price-forward opening beats the overstock-explanation opening, because the number does the stopping work in a feed.",
    "**Everything from second 4 onward, byte-identical to `SO_21_H1`.**",
    "**The first four seconds only.**",
    """| | |
|---|---|
| Length | **20 seconds.** |
| Deliverables | **2 files**, one per opening line below |
| Ratios | 9:16 (1080×1920) **and** 4:5 (1080×1350) |
| Codec | H.264 MP4, 30 fps, under 100 MB, audio −14 LUFS |
| Voice | Same voice and same take as `SO_21_H1` |
| Footage | **Identical to `SO_21_H1` from 00:04 onward.** |
| Colour | Black cover only |
| Production level | Simple — this is an edit, not a shoot |""",
    """**Openings (0–4 s) — one file each:**

| Swedish (use this) | English meaning |
|---|---|
| 367 kr blev 299 kr – vi beställde för mycket motorhölje. | 367 kr became 299 kr – we ordered too much engine cover stock. |
| Lagret är fullt av motorhöljen vi måste sälja – 299 kr just nu. | The warehouse is full of engine covers we need to sell – 299 kr right now. |

**Everything from 00:04 onward is `SO_21_H1`'s script, unchanged:**

| Time | Swedish (use this) | English meaning |
|---|---|---|
| 4–8 s | 420D Oxfordtyg, vattenavvisande, med dragsko runt hela kanten. | 420D Oxford fabric, water-repellent, with a drawstring around the entire edge. |
| 8–12 s | På och av på några sekunder, redo vid bryggan mellan turerna. | On and off in seconds, ready at the dock between trips. |
| 12–16 s | Ordinarie pris 367 kr – nu 299 kr, en rabatt på 19 %. | Regular price 367 kr – now 299 kr, a 19 % discount. |
| 16–20 s | Beställ på Bäverbutiken.se, så länge lagret räcker. | Order at Bäverbutiken.se, while stock lasts. |""",
    """Identical to `SO_21_H1` from 00:04. For 0–4 s: the covered engine with the price on screen, so
the opening line and the visual say the same thing.""",
    """Identical to `SO_21_H1`. Do not add or move an overlay — that would make it a second variable.""",
    """**Profit per 1 000 kr against `SO_21_H1`**, same ad set, equal budget. Hook rate is diagnosis
only: in this account the ad with the worst hook has returned among the most profit per krona.""",
    "Whether the opening four seconds move money in this account at all. Three previous hook tests were contaminated and none of them answered it.",
    "Motorhölje SO Batch 7 (ABO) — all four SO_21 variants, equal budget"))

write(VID, "Enginecover_SO_21_H3", video(
    "Enginecover_SO_21_H3", "SO",
    "vinkel=`offer/överlager` · hook-typ=`påstående` · format=`video 10 s, voiceover+broll` · proof=`inget (produktclaim)` · offer-i-creativen=`pris nämns (299 mot 367)` · talare=`röst utan ansikte`",
    "Video in the offer angle. **10 seconds** — the shortest cut this account has ever run.",
    SO4_WHY + """

**What this one isolates:** length. The three most efficient ads in the account are all short
(`SO_4_H1` 1 721, `PD_EXTRA` 1 351, `SO_1_H2` 1 259), and the least efficient of the profitable
ones is the long one (`PD_1_H3` 340, 42 % of spend). That is suggestive, not proven — the short
ones also have far less spend, which is exactly the trap that has caught us five times.

Ten seconds tests the edge of it. Cut from the same shoot as `SO_21_H1` so footage is not a
competing explanation.""",
    "A 10-second cut holds or beats the 20-second version's profit per krona, which would make the shortest format the default for this product.",
    "The offer angle, the price proof, **the same shoot as `SO_21_H1`**, the same voice.",
    "**The length only** — 10 s against 20 s.",
    """| | |
|---|---|
| Length | **10 seconds.** Do not run over. |
| Ratios | 9:16 (1080×1920) **and** 4:5 (1080×1350) |
| Codec | H.264 MP4, 30 fps, under 100 MB, audio −14 LUFS |
| Voice | **Same voice as `SO_21_H1`** — if the voice changes, the length test is contaminated. |
| Footage | **Same shoot as `SO_21_H1`.** |
| Colour | Black cover only |
| Production level | Simple |""",
    """| Time | Swedish (use this) | English meaning |
|---|---|---|
| 0–3 s | Vi beställde för många motorhöljen. | We ordered too many engine covers. |
| 3–7 s | 420D Oxfordtyg – nu 299 kr istället för 367 kr. | 420D Oxford fabric – now 299 kr instead of 367 kr. |
| 7–10 s | Bäverbutiken.se, så länge lagret räcker. | Bäverbutiken.se, while stock lasts. |""",
    """| Time | Shot |
|---|---|
| 0–3 s | The folded cover beside the uncovered outboard. **Product at 0,0 s.** |
| 3–7 s | Cover going on in one motion, then close on the drawstring. Price on screen. |
| 7–10 s | End on the covered engine. |""",
    """Max two over 10 seconds.

| Time | Swedish (use this) | English meaning |
|---|---|---|
| 3–7 s | 299 kr istället för 367 kr | 299 kr instead of 367 kr |
| 7–10 s | Så länge lagret räcker | While stock lasts |""",
    SO4_KPI,
    "Whether short is genuinely better here or whether the short ads just look good because they have never been given money. Same shoot as SO_21_H1 makes this the cleanest length read available.",
    "Motorhölje SO Batch 7 (ABO) — all four SO_21 variants, equal budget"))

write(VID, "Enginecover_SO_21_H4", video(
    "Enginecover_SO_21_H4", "SO",
    "vinkel=`offer/överlager` · hook-typ=`påstående` · format=`video 20 s, creator-UGC` · proof=`egen erfarenhet` · offer-i-creativen=`pris nämns (299 mot 367)` · talare=`creator i bild`",
    "Video in the offer angle with **a person on camera** — a combination this account has never run.",
    SO4_WHY + """

**What this one isolates:** the speaker. Every offer-angle ad we have ever run is a voiceover over
product footage. Every ad with a face is in the social-proof angle. Nobody has put a real person in
front of the offer.

That matters now because of the audience problem: a face changes who Meta shows an ad to. With
frequency at 2,83 and the prospecting pool saturating, a creative that reaches a different slice of
people is worth as much as one that converts better.""",
    "An offer delivered by a person on camera reaches a different audience than the voiceover version and lands within range of it on profit per krona.",
    "The offer angle, the price proof, the black cover, the length.",
    "**A person on camera** instead of a voiceover over product footage.",
    """| | |
|---|---|
| Length | **20 seconds.** |
| Ratios | 9:16 (1080×1920) **and** 4:5 (1080×1350) |
| Codec | H.264 MP4, 30 fps, under 100 MB, audio −14 LUFS |
| Sound | The person's real voice, on location. No studio VO, no music over dialogue. |
| Casting | Swedish-speaking, roughly 35–65, plausibly a boat owner. Ordinary clothes, no branded gear, no presenter energy. |
| Camera | Handheld. Phone quality is correct and preferred. |
| Colour | Black cover only |
| Production level | Medium |""",
    """| Time | Swedish (use this) | English meaning |
|---|---|---|
| 0–4 s | Jag hittade motorhöljet på Bäverbutiken för 299 kr istället för 367. | I found the engine cover at Bäverbutiken for 299 kr instead of 367. |
| 4–8 s | 420D Oxfordtyg, vattenavvisande, dragsko runt hela kanten. | 420D Oxford fabric, water-repellent, drawstring around the entire edge. |
| 8–12 s | Jag har den på och av på några sekunder vid bryggan. | I get it on and off in seconds at the dock. |
| 12–16 s | Priset är nere i 299 kr just nu, så länge lagret räcker. | The price is down to 299 kr right now, while stock lasts. |
| 16–20 s | Leta upp din storlek på Bäverbutiken.se. | Find your size at Bäverbutiken.se. |

**The speaker talks about their own purchase only.** Not one word about other customers, ratings or
how many have been sold.""",
    """| Time | Shot |
|---|---|
| 0–4 s | Person at the jetty holding the folded cover, outboard behind them. **Product in frame from the first frame.** |
| 4–8 s | They fit the cover while talking. |
| 8–12 s | Cover off and back on in one motion. Honest speed. |
| 12–16 s | Close on the drawstring, price on screen. |
| 16–20 s | Direct to camera. End on the covered motor. |""",
    """Max four.

| Time | Swedish (use this) | English meaning |
|---|---|---|
| 4–8 s | 420D Oxfordtyg | 420D Oxford fabric |
| 8–12 s | På och av på sekunder | On and off in seconds |
| 12–16 s | 299 kr istället för 367 kr | 299 kr instead of 367 kr |
| 16–20 s | Så länge lagret räcker | While stock lasts |""",
    SO4_KPI + " Watch reach and frequency as well: the point of this one is partly to find new people.",
    "Whether a face changes who the offer reaches. With the prospecting pool saturating, that is worth as much as a conversion gain.",
    "Motorhölje SO Batch 7 (ABO) — all four SO_21 variants, equal budget"))

# =============================================================== B. SP_19 fleet

SP_WHY = """**`Motorhölje_SP_1_H1` is the account's most reliable ad and it has never been iterated either.**

21 purchases, 2 749 kr of spend, CPA 131 kr, **803 kr of profit per 1 000 kr** and 19 % of all
profit. It is the only ad besides `PD_1_H3` with more than 20 purchases behind it, which makes it
the most trustworthy number we have — and unlike everything else, it has fallen only gently
(1 063 → 960 → 803 over three measurements).

The social-proof block it belongs to converts **4,4 % of clicks** against the product-demo block's
2,4 %. But the block rests on two ads, and the other one (`Enginecover_SP_5_H1`) collapsed to
**−75 kr per 1 000** and has now been paused.

So the block needs more ads before anything can be concluded from it. These three are the cheapest
way to get them."""

write(VID, "Enginecover_SP_19_H1", video(
    "Enginecover_SP_19_H1", "SP",
    "vinkel=`social proof/tillit` · hook-typ=`påstående` · format=`video 20 s, voiceover+broll` · proof=`egen erfarenhet` · offer-i-creativen=`pris nämns (299 mot 367)` · talare=`röst utan ansikte`",
    "Video in the social-proof angle, first person, no face. **Base of the SP_19 fleet.**",
    SP_WHY + """

**What this one isolates:** the footage. Same angle and structure as `SP_1_H1`, new material, no
face. If it lands near 800 kr per 1 000, the angle is reproducible.

**Honest limitation:** `SP_1_H1`'s original script was never recorded in this system — batch #1
predates it and the video cannot be viewed from the analysis environment. The script below is a
new script in the same angle, not a reproduction. If the original exists, use it instead.""",
    "A new first-person video in the social-proof angle reproduces SP_1_H1's efficiency, which would confirm the block is a copy asset rather than one lucky file.",
    "The social-proof angle, first person, the mechanism claims, the black cover.",
    "**The footage** — new material, and no face on camera.",
    """| | |
|---|---|
| Length | **20 seconds.** |
| Ratios | 9:16 (1080×1920) **and** 4:5 (1080×1350) |
| Codec | H.264 MP4, 30 fps, under 100 MB, audio −14 LUFS |
| Voice | **A real person telling their own story — one boat owner to another. Never announcer-style.** The words are first person and must sound it. |
| Footage | New product b-roll. Favour a larger outboard. **No face on camera.** |
| Colour | Black cover only |
| Production level | Medium |""",
    """| Time | Swedish (use this) | English meaning |
|---|---|---|
| 0–4 s | Jag lämnar motorn vid bryggan mellan turerna, så den behöver skydd. | I leave the motor at the dock between trips, so it needs protection. |
| 4–8 s | Mitt motorhölje är 420D Oxfordtyg, vattenavvisande, med dragsko runt hela kanten. | My engine cover is 420D Oxford fabric, water-repellent, with a drawstring around the entire edge. |
| 8–12 s | Jag får den på och av på några sekunder, inget krångel. | I get it on and off in seconds, no hassle. |
| 12–16 s | Jag hittade den på Bäverbutiken för 299 kr istället för 367. | I found it at Bäverbutiken for 299 kr instead of 367. |
| 16–20 s | Bäverbutiken.se, så länge lagret räcker. | Bäverbutiken.se, while stock lasts. |""",
    """| Time | Shot |
|---|---|
| 0–4 s | The uncovered outboard at the jetty. **Product at 0,0 s.** |
| 4–8 s | Hands working the fabric, then the drawstring edge. |
| 8–12 s | Cover off and back on in one motion. |
| 12–16 s | The covered engine, wide, price on screen. |
| 16–20 s | End on the covered engine. |""",
    """Max four.

| Time | Swedish (use this) | English meaning |
|---|---|---|
| 4–8 s | 420D Oxfordtyg | 420D Oxford fabric |
| 8–12 s | På och av på sekunder | On and off in seconds |
| 12–16 s | 299 kr istället för 367 kr | 299 kr instead of 367 kr |
| 16–20 s | 30 dagars nöjd-kund-garanti | 30-day satisfaction guarantee |""",
    """**Purchases per click against the SP block's 4,4 %**, then profit per 1 000 kr against `SP_1_H1`'s
803. Equal budget with `SP_19_H2` and `SP_19_H3`. No winner call before 2 000 kr.""",
    "Whether the social-proof block is reproducible. It currently rests on one working ad and one that collapsed — a third data point is worth more than any new concept.",
    "Motorhölje SP Batch 7 (ABO) — all three SP_19 variants, equal budget"))

write(VID, "Enginecover_SP_19_H2", video(
    "Enginecover_SP_19_H2", "SP",
    "vinkel=`social proof/tillit` · hook-typ=`påstående` · format=`video 20 s, voiceover+broll` · proof=`egen erfarenhet` · offer-i-creativen=`pris nämns (299 mot 367)` · talare=`röst utan ansikte`",
    "Video in the social-proof angle. **Hook variant of `SP_19_H1`** — the opening line is the only difference.",
    SP_WHY + """

**What this one isolates:** the opening line. Deliver **two files**, one per opening below.
Everything from 00:04 onward must be identical to `SP_19_H1` — same footage, same voice take, same
overlays. If anything else differs the comparison is dead.""",
    "A worry-led opening beats the situation-led opening in the social-proof angle, because it names the feeling before the fact.",
    "**Everything from second 4 onward, byte-identical to `SP_19_H1`.**",
    "**The first four seconds only.**",
    """| | |
|---|---|
| Length | **20 seconds.** |
| Deliverables | **2 files**, one per opening line below |
| Ratios | 9:16 (1080×1920) **and** 4:5 (1080×1350) |
| Codec | H.264 MP4, 30 fps, under 100 MB, audio −14 LUFS |
| Voice | Same voice and same take as `SP_19_H1` |
| Footage | **Identical to `SP_19_H1` from 00:04 onward.** |
| Production level | Simple — this is an edit, not a shoot |""",
    """**Openings (0–4 s) — one file each:**

| Swedish (use this) | English meaning |
|---|---|
| Jag ville sluta oroa mig för motorn vid bryggan. | I wanted to stop worrying about the motor at the dock. |
| Mellan turerna står min utombordare ute – då vill jag att den är skyddad. | Between trips my outboard sits outside – that's when I want it protected. |

**Everything from 00:04 onward is `SP_19_H1`'s script, unchanged:**

| Time | Swedish (use this) | English meaning |
|---|---|---|
| 4–8 s | Mitt motorhölje är 420D Oxfordtyg, vattenavvisande, med dragsko runt hela kanten. | My engine cover is 420D Oxford fabric, water-repellent, with a drawstring around the entire edge. |
| 8–12 s | Jag får den på och av på några sekunder, inget krångel. | I get it on and off in seconds, no hassle. |
| 12–16 s | Jag hittade den på Bäverbutiken för 299 kr istället för 367. | I found it at Bäverbutiken for 299 kr instead of 367. |
| 16–20 s | Bäverbutiken.se, så länge lagret räcker. | Bäverbutiken.se, while stock lasts. |""",
    "Identical to `SP_19_H1` from 00:04. For 0–4 s: the uncovered outboard at the jetty, same as the base cut.",
    "Identical to `SP_19_H1`. Do not add or move an overlay.",
    """**Profit per 1 000 kr against `SP_19_H1`**, same ad set, equal budget. Hook rate is diagnosis only.""",
    "Whether the opening four seconds matter in the block with the account's best click quality. Together with SO_21_H2 this gives us a hook read in two different angles at once.",
    "Motorhölje SP Batch 7 (ABO) — all three SP_19 variants, equal budget"))

write(VID, "Enginecover_SP_19_H3", video(
    "Enginecover_SP_19_H3", "SP",
    "vinkel=`social proof/tillit` · hook-typ=`påstående` · format=`video 10 s, voiceover+broll` · proof=`egen erfarenhet` · offer-i-creativen=`ingen offer` · talare=`röst utan ansikte`",
    "Video in the social-proof angle, **10 seconds**. Length test inside the SP block.",
    SP_WHY + """

**What this one isolates:** length, inside the social-proof block. `SO_21_H3` does the same thing
in the offer block. Running both means whatever we learn about length is not an artefact of one
angle.""",
    "A 10-second cut holds the social-proof block's click quality, which would make the block cheap enough to produce at the volume it has never reached.",
    "The social-proof angle, first person, **the same shoot as `SP_19_H1`**, the same voice.",
    "**The length only** — 10 s against 20 s.",
    """| | |
|---|---|
| Length | **10 seconds.** Do not run over. |
| Ratios | 9:16 (1080×1920) **and** 4:5 (1080×1350) |
| Codec | H.264 MP4, 30 fps, under 100 MB, audio −14 LUFS |
| Voice | **Same voice as `SP_19_H1`.** |
| Footage | **Same shoot as `SP_19_H1`.** |
| Production level | Simple |""",
    """| Time | Swedish (use this) | English meaning |
|---|---|---|
| 0–3 s | Motorn står ute vid bryggan mellan turerna. | The motor sits outside at the dock between trips. |
| 3–7 s | Mitt motorhölje, 420D Oxfordtyg, skyddar den – på på några sekunder. | My engine cover, 420D Oxford fabric, protects it – on in seconds. |
| 7–10 s | Jag hittade den på Bäverbutiken.se. | I found it at Bäverbutiken.se. |""",
    """| Time | Shot |
|---|---|
| 0–3 s | The uncovered outboard at the jetty. **Product at 0,0 s.** |
| 3–7 s | Cover going on in one motion, then close on the drawstring. |
| 7–10 s | End on the covered engine. |""",
    """Max two over 10 seconds.

| Time | Swedish (use this) | English meaning |
|---|---|---|
| 3–7 s | 420D Oxfordtyg | 420D Oxford fabric |
| 7–10 s | 30 dagars nöjd-kund-garanti | 30-day satisfaction guarantee |""",
    """**Purchases per click against the SP block's 4,4 %**, then profit per 1 000 kr against `SP_19_H1`.
Same ad set, equal budget.""",
    "Whether length behaves the same way in two different angles. One angle alone would not tell us that.",
    "Motorhölje SP Batch 7 (ABO) — all three SP_19 variants, equal budget"))

# =============================================================== C. Reels-native

REELS_WHY = """**Frequency is 2,83 lifetime and 1,89 over three days, and the campaign has crossed break-even.**
The prospecting pool is saturating. The cheapest way to reach different people is to give Meta
creative that belongs in a placement we have never made for.

Everything this account has ever run is a produced ad re-framed to 9:16. Nothing has been built
Reels-first: shot vertically, paced like organic content, opening mid-thought instead of with a
proposition. That is a genuinely different creative shape and it tends to be distributed to a
different audience."""

write(VID, "Enginecover_SP_20_H1", video(
    "Enginecover_SP_20_H1", "SP",
    "vinkel=`social proof/tillit` · hook-typ=`påstående` · format=`video 25 s, reels-native` · proof=`egen erfarenhet` · offer-i-creativen=`pris nämns (299 mot 367)` · talare=`creator i bild`",
    "**Reels-native** video in the social-proof angle. Built vertical-first, paced like organic content.",
    REELS_WHY + """

**Why the social-proof angle carries it:** Reels rewards a person talking to camera, and the
social-proof block is the one built around a person's own account of using the thing. It also has
the account's best click quality (4,4 %), so if the placement works we want it attached to the
copy that converts.""",
    "A Reels-native cut reaches a materially different audience than our re-framed ads — visible as lower frequency at comparable spend — without giving up the social-proof block's click quality.",
    "The social-proof angle, first person, the mechanism claims, the black cover.",
    "**The whole creative shape** — shot vertically, paced as organic, opening mid-thought.",
    """| | |
|---|---|
| Length | **25 seconds.** |
| Ratios | **9:16 (1080×1920) only.** Do not deliver a 4:5 — this one is placement-specific by design. |
| Codec | H.264 MP4, 30 fps, under 100 MB, audio −14 LUFS |
| Sound | Real voice, on location, phone mic is fine. No music bed under the dialogue. |
| Camera | **Shot vertically on a phone, handheld, by the speaker.** Not a landscape shoot cropped. |
| Look | Unpolished on purpose. Available light, background clutter is fine — rope, fenders, a wet jetty. No colour grade, no retouching. |
| Colour | Black cover only |
| Production level | **Simple** |""",
    """| Time | Swedish (use this) | English meaning |
|---|---|---|
| 0–4 s | Okej, jag måste bara visa er det här. | Okay, I just have to show you this. |
| 4–9 s | Min utombordare står ute vid bryggan mellan turerna, och jag var så trött på att den bara stod där oskyddad. | My outboard sits outside at the dock between trips, and I was so tired of it just sitting there unprotected. |
| 9–13 s | Så jag skaffade ett motorhölje, 420D Oxfordtyg, vattenavvisande. | So I got an engine cover, 420D Oxford fabric, water-repellent. |
| 13–17 s | Dragsko runt hela kanten, och jag får den på och av på typ några sekunder. | Drawstring around the entire edge, and I get it on and off in like seconds. |
| 17–21 s | Hittade den på Bäverbutiken för 299 kr istället för 367. | Found it at Bäverbutiken for 299 kr instead of 367. |
| 21–25 s | Länken finns där, kolla in den. | The link's right there, check it out. |

**The speaker talks about their own purchase only.** Nothing about other customers or how many have
been sold.""",
    """| Time | Shot |
|---|---|
| 0–4 s | Speaker holding the phone, cover in the other hand, outboard behind. **Product in frame at 0,0 s.** |
| 4–9 s | Pan to the uncovered engine, still talking. |
| 9–13 s | Close on the fabric, phone held close. |
| 13–17 s | Cover on and off, filmed one-handed. Honest speed. |
| 17–21 s | Back to the speaker. |
| 21–25 s | End on the covered engine. |""",
    """**Maximum two, and set them as if typed on a phone** — plain sans, no branded lower third.

| Time | Swedish (use this) | English meaning |
|---|---|---|
| 9–13 s | 420D Oxfordtyg | 420D Oxford fabric |
| 17–21 s | 299 kr istället för 367 kr | 299 kr instead of 367 kr |""",
    """**Frequency and reach at equal spend, against `SP_19_H1`** — that is the point of this ad. Then
purchases per click against the SP block's 4,4 %. A Reels cut that reaches new people at a slightly
worse CPA is still a win right now; one that just re-reaches the same pool is not.""",
    "Whether a different creative shape buys us a different audience. With frequency at 2,83 and the campaign under water, that question is worth more than another conversion-rate test.",
    "Motorhölje SP Batch 7 (ABO)"))

write(VID, "Enginecover_PD_25_H1", video(
    "Enginecover_PD_25_H1", "PD",
    "vinkel=`problem/lösning` · hook-typ=`påstående` · format=`video 25 s, reels-native` · proof=`demo` · offer-i-creativen=`ingen offer` · talare=`röst utan ansikte`",
    "**Reels-native** video in the product-demo angle. How-to shape rather than ad shape.",
    REELS_WHY + """

**Why the product-demo angle also gets one:** the PD block carries **64 % of judgeable spend** and
has the account's worst click quality (2,4 %). A how-to framing — "this is how you protect it" —
is the one shape that reads as content rather than advertising, and it is the block that most needs
a different kind of attention.""",
    "A Reels-native how-to reaches a different audience than our re-framed demo videos and lifts the PD block's purchases per click above 2,4 %, because the viewer arrives having already learned something.",
    "The PD angle, the mechanism claims, the size range, the black cover.",
    "**The whole creative shape** — vertical-first, how-to framing, organic pacing.",
    """| | |
|---|---|
| Length | **25 seconds.** |
| Ratios | **9:16 (1080×1920) only.** |
| Codec | H.264 MP4, 30 fps, under 100 MB, audio −14 LUFS |
| Voice | Voiceover, no face. Plain and instructional, never announcer-style. |
| Camera | **Shot vertically, handheld.** Not a landscape shoot cropped. |
| Look | Unpolished. Available light, real jetty, no colour grade. |
| Colour | Black cover only |
| Production level | **Simple** |""",
    """| Time | Swedish (use this) | English meaning |
|---|---|---|
| 0–4 s | Så här skyddar du utombordaren mellan turerna. | This is how you protect the outboard between trips. |
| 4–9 s | Det här är motorhöljet, 420D Oxfordtyg, vattenavvisande material. | This is the engine cover, 420D Oxford fabric, water-repellent material. |
| 9–13 s | Dragsko går runt hela kanten så det sluter tätt om motorn. | A drawstring runs around the entire edge so it closes snugly around the motor. |
| 13–17 s | Du drar den över, drar åt dragskon, och klart – på några sekunder. | You pull it over, tighten the drawstring, and done – in seconds. |
| 17–21 s | Finns i storlekar från 6–18 hk upp till 175–250 hk. | Available in sizes from 6–18 hk up to 175–250 hk. |
| 21–25 s | Bäverbutiken.se – länken finns här. | Bäverbutiken.se – the link is here. |""",
    """| Time | Shot |
|---|---|
| 0–4 s | The uncovered outboard, filmed from standing height. **Product at 0,0 s.** |
| 4–9 s | The folded cover held up to camera, then close on the weave. |
| 9–13 s | The drawstring edge, followed all the way round. |
| 13–17 s | The cover pulled over and tightened, in one unbroken take. **No cut here** — the point is that it really is that fast. |
| 17–21 s | The covered engine, wide. |
| 21–25 s | End on the covered engine. |""",
    """**Maximum three, plain and typed-looking.**

| Time | Swedish (use this) | English meaning |
|---|---|---|
| 4–9 s | 420D Oxfordtyg | 420D Oxford fabric |
| 13–17 s | På och av på sekunder | On and off in seconds |
| 17–21 s | Passar 6–250 hk | Fits 6–250 hk |""",
    """**Frequency and reach at equal spend, against the PD block's other videos.** Then purchases per
click against the block's 2,4 %.""",
    "Whether a how-to shape fixes the click quality of the block that carries two thirds of the budget, and whether it reaches anyone new.",
    "Motorhölje PD Batch 7 (ABO)"))

write(VID, "Enginecover_PD_26_H1", video(
    "Enginecover_PD_26_H1", "PD",
    "vinkel=`problem/lösning` · hook-typ=`påstående` · format=`video 10 s, voiceover+broll` · proof=`demo` · offer-i-creativen=`ingen offer` · talare=`röst utan ansikte`",
    "**10 seconds**, product-demo angle. Cut from `Motorhölje_PD_1_H3`'s existing footage — no shoot required.",
    """**`Motorhölje_PD_1_H3` has started to decay for the first time.**

It takes 42 % of campaign spend and produces 63 % of the profit — 123 purchases, more than five
times any other ad. Until this week it was the one thing in the account whose efficiency did not
fall with volume: 417 → 431 kr of profit per 1 000 across two measurements.

It is now at **340**, having taken another 2 538 kr. Its CPA moved from 164,90 to 176,14.

That is not a crisis — it is still the most profitable ad we own by a factor of three in absolute
terms — but it removes the one exception we were building strategy around. **We now have zero ads
that resist decay.**

The cheapest possible response is to refresh the asset rather than replace it. This is a 10-second
cut assembled from `PD_1_H3`'s **existing footage**, with a new voiceover. No shoot, no new
material, an hour of editing. If a re-cut buys back efficiency on the account's volume driver, that
is the highest-return hour of work available.""",
    "Re-cutting the volume driver short restores part of its lost efficiency, because the decay is partly wear on one specific execution rather than on the underlying footage.",
    "**`PD_1_H3`'s footage.** Nothing new is shot.",
    "**The length and the edit** — 10 s assembled from existing material, new voiceover.",
    """| | |
|---|---|
| Length | **10 seconds.** |
| Ratios | 9:16 (1080×1920) **and** 4:5 (1080×1350) |
| Codec | H.264 MP4, 30 fps, under 100 MB, audio −14 LUFS |
| Voice | Voiceover, no face. New take. |
| Footage | **`Motorhölje_PD_1_H3`, existing material only. Do not shoot anything.** |
| Colour | Black cover only |
| Production level | **Simple — this is an edit** |

Pick the three strongest moments in `PD_1_H3`: the uncovered engine, the drawstring being pulled
tight, and the cover going on. Nothing else fits in ten seconds.""",
    """| Time | Swedish (use this) | English meaning |
|---|---|---|
| 0–3 s | Motorhölje i 420D Oxfordtyg, vattenavvisande. | Engine cover in 420D Oxford fabric, water-repellent. |
| 3–7 s | Dragsko runt hela kanten – på och av på några sekunder. | Drawstring around the entire edge – on and off in seconds. |
| 7–10 s | Bäverbutiken.se. | Bäverbutiken.se. |""",
    """| Time | Shot (all from `PD_1_H3`) |
|---|---|
| 0–3 s | The uncovered outboard. **Product at 0,0 s.** |
| 3–7 s | Drawstring pulled tight, then the cover going on. |
| 7–10 s | End on the covered engine. |""",
    """Max two over 10 seconds.

| Time | Swedish (use this) | English meaning |
|---|---|---|
| 3–7 s | Dragsko runt hela kanten | Drawstring all the way round |
| 7–10 s | Passar 6–250 hk | Fits 6–250 hk |""",
    """**Profit per 1 000 kr against `PD_1_H3`'s current 340** — not against its old 431. Run it in the
same ad set as `PD_1_H3` so they compete on the same audience. **Do not pause `PD_1_H3` to make
room.** It is 63 % of the profit and nothing here replaces it yet.""",
    "Whether decay on our one volume asset is fixable by re-cutting, which costs an hour, or whether it needs replacing, which costs a shoot. That is the difference between a cheap problem and an expensive one.",
    "Motorhölje PD — the existing ad set, alongside `PD_1_H3`"))

# =============================================================== D. Audience-widening statics

AUD_WHY = """**Frequency is 2,83 lifetime, 1,89 over three days, and the campaign is now 55 kr above break-even
per order.** Every ad fell in efficiency at once between 09 and 12 August. When everything drops
together while frequency climbs, the cause is more likely the **audience** than the creative.

Every ad this account has ever run pictures the same person: an owner with an outboard on a jetty.
Meta finds people partly from what the creative depicts, so a different situation in the frame is a
lever on who gets reached — not just on who converts."""

write(IMG, "Enginecover_SO_22_1", static(
    "Enginecover_SO_22_1", "SO",
    "vinkel=`offer/överlager + situation (transport)` · hook-typ=`påstående` · format=`statisk` · proof=`demo` · offer-i-creativen=`ingen offer` · visuell stil=`textfri produktbild + rubrik` · textmängd=`rubrik+underrad` · talare=`ingen`",
    "Static in the offer angle. **New situation: the boat on a trailer.** Audience-widening test.",
    AUD_WHY + """

**This one pictures road transport.** A boat on a trailer is a different scene, a different set of
interests, and a use case the product genuinely serves — a cover keeps road grime and rain off the
engine on the way to the water. Nothing in the account has ever shown it.""",
    "A trailer scene reaches people our jetty creatives do not, visible as lower frequency at comparable spend, without hurting conversion.",
    "The SO copy block, the black cover, the CTA, the landing page.",
    "**The situation in the picture** — road transport instead of a jetty.",
    """**The boat on its trailer, cover fitted, ready to tow.** Shot beside a car or on a slipway ramp,
daylight. The trailer and tow hitch must be clearly readable so the scene is unmistakable. The
covered engine is the subject — it should fill a good third of the frame even though the whole rig
is visible.

Do not show the boat moving on a road. A static shot of a rig ready to leave says the same thing
without implying anything we cannot support about high-speed durability.""",
    """| Element | Swedish (use this) | English meaning |
|---|---|---|
| Rubrik | Skydda motorn även på vägen | Protect the engine on the road too |
| Underrad | Motorhölje 420D håller utombordaren skyddad ända fram | Motor cover 420D keeps the outboard protected all the way there |""",
    """**Frequency and reach at equal spend, against the jetty creatives in the same ad set.** That is the
point of this ad. Then profit per 1 000 kr. No verdict before 300 kr and 3 purchases.""",
    "Whether the situation in the picture changes who Meta reaches. If it does, we have a cheap lever on the saturation problem and can build a scene library instead of more variations of one scene.",
    "Motorhölje SO Batch 7 (ABO) — equal budget with SO_22_2"))

write(IMG, "Enginecover_SO_22_2", static(
    "Enginecover_SO_22_2", "SO",
    "vinkel=`offer/överlager + situation (hamn)` · hook-typ=`fråga` · format=`statisk` · proof=`demo` · offer-i-creativen=`ingen offer` · visuell stil=`textfri produktbild + rubrik` · textmängd=`rubrik+underrad` · talare=`ingen`",
    "Static in the offer angle. **New situation: the marina row.** Audience-widening test, runs against SO_22_1.",
    AUD_WHY + """

**This one pictures the marina.** A row of moored boats is a scene our creatives have never used,
and it carries the argument without a word: the engine sits there, day after day, whether or not
anyone is using it.""",
    "A marina scene reaches people our close-up jetty creatives do not, and the row of boats makes the everyday exposure obvious without a claim.",
    "The SO copy block, the black cover, the CTA, the landing page, the ad set.",
    "**The situation in the picture** — a marina row instead of a single engine at a jetty.",
    """**A row of moored boats in a small marina**, shot along the row so several boats are visible.
One boat in the foreground has the black cover fitted on its outboard, in focus and unmistakable.
The rest of the row is context, softer.

**The other boats must not be arranged to look like they also have covers.** The composition should
say "this is where your engine spends its week", not "everyone else already bought one" — we have
no basis for the second claim and it must not be implied visually either.""",
    """| Element | Swedish (use this) | English meaning |
|---|---|---|
| Rubrik | Din motor står ute – skyddad? | Your engine sits outside – protected? |
| Underrad | Vattenavvisande motorhölje i 420D Oxfordtyg, på på sekunder | Water-repellent motor cover in 420D Oxford fabric, on in seconds |""",
    """**Frequency and reach at equal spend, against `SO_22_1` and the jetty creatives.** Then profit per
1 000 kr. No verdict before 300 kr and 3 purchases.""",
    "Which of two unfamiliar scenes moves reach more, and whether scene changes buy audience at all. Both target the same constraint from different sides.",
    "Motorhölje SO Batch 7 (ABO) — equal budget with SO_22_1"))

write(IMG, "Enginecover_PD_24_1", static(
    "Enginecover_PD_24_1", "PD",
    "vinkel=`problem/lösning + situation (ny båtägare)` · hook-typ=`fråga` · format=`statisk` · proof=`demo` · offer-i-creativen=`ingen offer` · visuell stil=`textfri produktbild + rubrik` · textmängd=`rubrik+underrad` · talare=`ingen`",
    "Static in the product-demo angle. **New audience: someone who has just bought a boat.**",
    AUD_WHY + """

**This one speaks to a new owner.** It is the clearest example of a group our creatives never
address, and it is a group with an obvious reason to buy: they are actively kitting out a boat and
have not yet decided what it needs. It also sidesteps the saturation problem entirely — new owners
arrive continuously.""",
    "Addressing new boat owners reaches a distinct audience with a live buying intent, producing lower frequency and a better purchases-per-click rate than the PD block's 2,4 %.",
    "The PD angle, the mechanism claims, the black cover.",
    "**Who the ad talks to** — a new owner rather than a generic owner.",
    """**A visibly new setup.** A clean boat, an outboard that looks recently mounted, the folded cover
sitting on the seat or the dock beside it as if just delivered. Daylight, jetty or driveway.

The read should be "this is the thing you buy next", so the cover is present but not yet fitted.
That is the one composition in this batch where the product may be *off* the engine — everywhere
else it is fitted.""",
    """| Element | Swedish (use this) | English meaning |
|---|---|---|
| Rubrik | Nyköpt båt? Börja här | Just bought a boat? Start here |
| Underrad | Ett motorhölje är det första du bör skaffa till utombordaren | A motor cover is the first thing you should get for the outboard |""",
    """**Purchases per click against the PD block's 2,4 %**, plus frequency and reach against the other
PD creatives. No verdict before 300 kr and 3 purchases.""",
    "Whether a named audience outperforms a generic one. If it does, the same move opens several more groups and gives us a route out of one saturating pool.",
    "Motorhölje PD Batch 7 (ABO) — equal budget with PD_24_2 and PD_24_3"))

# =============================================================== E. Objection statics

OBJ_WHY = """**The product-demo block carries 64 % of judgeable spend and converts 2,4 % of its clicks, against
the social-proof block's 4,4 %.** That gap has now held across six judgeable ads and both formats.

Two attempts to fix it by rewriting the body never ran. A third, `PD_16_H1`, launched on 7 August
with the old copy block inherited and became judgeable this week at **−397 kr per 1 000** — a real
loss, but not a test of the rewrite, because the rewrite never reached the account.

And a fourth idea, size qualification, now has a verdict: `Enginecover_PD_6_1` became judgeable at
**2 470 kr, 7 purchases, CPA 353 kr, −331 kr per 1 000**. That was the size-guide static. It is the
clearest evidence we have that qualifying on size in the image does not work.

So these two attack the block from the one direction nobody has tried: **answering the objection
that stops the purchase**, rather than re-explaining the product or filtering the audience."""

write(IMG, "Enginecover_PD_24_2", static(
    "Enginecover_PD_24_2", "PD",
    "vinkel=`problem/lösning + invändning (fäste)` · hook-typ=`påstående` · format=`statisk` · proof=`demo` · offer-i-creativen=`ingen offer` · visuell stil=`makro/detalj` · textmängd=`rubrik+underrad+mekanikrad` · talare=`ingen`",
    "Static in the product-demo angle. **Answers the objection \"it will blow off\".**",
    OBJ_WHY + """

**This one answers the fastening objection.** A cover that sits on an engine in wind and on the
water raises an obvious doubt, and nothing we run addresses it. The drawstring is the answer and it
is a visible, physical mechanism — the kind of proof that does not require a review.""",
    "Answering the fastening objection in the image lifts purchases per click above the PD block's 2,4 %, because the doubt that stops the purchase is removed before the click rather than after it.",
    "The PD angle, the black cover, the CTA, the landing page, the ad set.",
    "**The job the image does** — answering one objection instead of demonstrating the product.",
    """**Macro on the drawstring, pulled tight.** A hand drawing the cord so the fabric visibly gathers
and closes around the engine's lower edge. Shallow depth of field, the cord and the gathered fabric
sharp, the rest falling off. Shot outdoors in daylight, ideally with visible wind in the background
so the claim and the scene agree.

The mechanism must be legible at thumbnail size. If the cord cannot be seen small, get closer.""",
    """| Element | Swedish (use this) | English meaning |
|---|---|---|
| Rubrik | Sitter kvar när det blåser | Stays put when it's windy |
| Underrad | Dragsko runt hela kanten håller höljet på plats | A drawstring around the entire edge keeps the cover in place |
| Mekanikrad | Dra åt dragskon runt hela kanten – höljet sluter tätt om motorn | Tighten the drawstring around the entire edge – the cover closes snugly around the motor |

**Note on the headline:** it says *sitter kvar när det blåser*, not *blåser aldrig av*. We cannot
support an absolute. Describe the mechanism, never promise the outcome.""",
    """**Purchases per click against the PD block's 2,4 %.** Head-to-head against `PD_24_3`, which
answers a different objection with the same block. **Expect CTR to fall** — a qualifying, doubt-
answering ad should buy fewer and better clicks.""",
    "Whether objection-answering beats product-explaining in the block that carries the budget. Four attempts to fix this block from other directions have now failed or never run.",
    "Motorhölje PD Batch 7 (ABO) — equal budget with PD_24_1 and PD_24_3"))

write(IMG, "Enginecover_PD_24_3", static(
    "Enginecover_PD_24_3", "PD",
    "vinkel=`problem/lösning + invändning (material)` · hook-typ=`påstående` · format=`statisk` · proof=`demo` · offer-i-creativen=`ingen offer` · visuell stil=`makro/detalj` · textmängd=`rubrik+underrad+mekanikrad` · talare=`ingen`",
    "Static in the product-demo angle. **Answers the objection \"is 420D actually any good\".**",
    OBJ_WHY + """

**This one answers the material objection.** "420D Oxfordtyg" appears in every ad we run and has
never once been explained. To a buyer it is a specification with no meaning attached — and at
299 kr the unspoken worry is that it is thin.""",
    "Explaining what the fabric is lifts purchases per click above the PD block's 2,4 %, because the price makes buyers doubt the material and nothing we run currently answers that.",
    "The PD angle, the black cover, the CTA, the landing page, the ad set.",
    "**The job the image does** — answering the material objection instead of demonstrating the product.",
    """**Macro on the weave.** The fabric filling the frame, lit from a low angle so the texture of the
tight Oxford weave reads clearly. Water beading on the surface if it can be shot honestly —
sprayed water on a real cover is fine; a composited effect is not.

A hand in frame for scale, gripping or flexing the fabric so its weight is visible. No callout
lines, no exploded diagram, no fake cross-section.""",
    """| Element | Swedish (use this) | English meaning |
|---|---|---|
| Rubrik | Tyget som tål väder och vind | The fabric that stands up to the weather |
| Underrad | 420D Oxfordtyg – tätvävt och vattenavvisande | 420D Oxford fabric – tightly woven and water-repellent |
| Mekanikrad | Tätvävt material gjort för utomhusbruk, inte ett tunt överdrag | Tightly woven material made for outdoor use, not a thin cover |

**Water-repellent, never waterproof.** The beading in the picture must not be captioned as
"vattentät".""",
    """**Purchases per click against the PD block's 2,4 %.** Head-to-head against `PD_24_2`, which answers
a different objection. **Expect CTR to fall.**""",
    "Which objection actually stops the purchase — fastening or material. Running both in one ad set answers that in one pass, and the answer is a copy instruction for every PD ad after it.",
    "Motorhölje PD Batch 7 (ABO) — equal budget with PD_24_1 and PD_24_2"))

# =============================================================== F. Retargeting statics

RT_WHY = """**There is still no retargeting ad set, and the pool it would address keeps growing.**
`Motorhölje_PD_1_H3` alone has produced well over a hundred more add-to-carts than purchases.
100 % of the campaign's 54 788 kr has gone to cold prospecting.

That was already the largest untouched pool in the account. It matters more now: cold prospecting
has crossed break-even at 291 kr per order over three days, while these people have already read
the page and cost nothing to reach again.

`SO_10_H1` was briefed for this in batch #4 and launched on 7 August **into a cold ad set**, because
no retargeting ad set exists. It has 240 kr and zero purchases and measures nothing.

**Blocker:** these two are only worth building once a retargeting ad set exists, built on a
site-visitor or view-content audience from the pixel. **If it cannot be created, leave them unbuilt
and say so** — do not launch them cold. That mistake has already been made once."""

write(IMG, "Enginecover_SO_23_1", static(
    "Enginecover_SO_23_1", "SO",
    "vinkel=`offer/påminnelse` · hook-typ=`siffra/pris` · format=`statisk` · proof=`inget (produktclaim)` · offer-i-creativen=`pris syns (299 mot 367)` · visuell stil=`grafik+produkt` · textmängd=`rubrik+underrad+prisrad` · talare=`ingen`",
    "Static for **retargeting**. Price reminder. **BLOCKED until the retargeting ad set exists.**",
    RT_WHY + """

**This one is the price reminder.** The persuasion is already done for this audience — they have
read the page. What is missing is a reason to act now, and the 19 % discount is the only honest one
we have.""",
    "A price reminder to people who have already seen the product page converts far above the 291 kr cold CPA, because the argument is already made and only the nudge is missing.",
    "The SO offer framing, the price proof, the black cover.",
    "**The audience** — warm instead of cold.",
    """**The covered engine, framed as closely as possible to the product page's main image** so it is
instantly recognisable to someone who has already seen it. Clean, daylight, no new scene.

A price block in the lower third: `367 kr` struck through, `299 kr` set larger beside it. Clean and
typographic — no starburst, no red badge, no countdown.""",
    """| Element | Swedish (use this) | English meaning |
|---|---|---|
| Rubrik | Motorhöljet du tittade på | The engine cover you were looking at |
| Underrad | Motorhölje 420D i vattenavvisande Oxfordtyg – nu 299 kr | Motor cover 420D in water-repellent Oxford fabric – now 299 kr |
| Prisrad | 367 kr (struck through) 299 kr | 367 kr struck through, 299 kr |

**Do not write anything claiming the viewer put it in their basket.** The audience is site visitors
and many never did. Being wrong about that reads as surveillance rather than service.""",
    """**CPA against the cold-traffic CPA**, which is **291 kr over the last three days**. A retargeting
ad that does not beat that comfortably is not doing its job. No verdict before 300 kr and 3
purchases.""",
    "Whether the abandoned-cart pool is recoverable at all. It is the largest untouched demand in the account and cold traffic is now unprofitable, which makes this the highest-value open question we have.",
    "**Motorhölje Retargeting — this ad set does not exist yet. See section 1.**"))

write(IMG, "Enginecover_SO_23_2", static(
    "Enginecover_SO_23_2", "SO",
    "vinkel=`offer/påminnelse + riskavlastning` · hook-typ=`påstående` · format=`statisk` · proof=`inget (produktclaim)` · offer-i-creativen=`ingen offer` · visuell stil=`textfri produktbild + rubrik` · textmängd=`rubrik+underrad+badge` · talare=`ingen`",
    "Static for **retargeting**. Risk reversal. Runs against `SO_23_1`. **BLOCKED until the retargeting ad set exists.**",
    RT_WHY + """

**This one removes risk instead of cutting price.** The two most likely reasons a visitor left
without buying are price and doubt about fit. `SO_23_1` addresses the first. This addresses the
second, using the guarantee — which is the one piece of risk reversal we can state truthfully.

Running both means we learn *why* they left, not just whether they come back.""",
    "For visitors who did not buy, removing the risk converts better than repeating the discount, because the hesitation is about fit rather than price.",
    "The black cover, the CTA, the landing page, the audience.",
    "**The argument** — risk reversal instead of price.",
    """**The covered engine, calm and reassuring**, close to how the product page shows it. Daylight,
still water behind if possible.

The guarantee set as a small badge in a bottom corner — understated, not a starburst. **No price
anywhere in this image.** That is what separates it from `SO_23_1` and the separation is the test.""",
    """| Element | Swedish (use this) | English meaning |
|---|---|---|
| Rubrik | Prova helt riskfritt | Try it completely risk-free |
| Underrad | Passar inte utombordaren? Pengarna tillbaka inom 30 dagar | Doesn't fit the outboard? Money back within 30 days |
| Garantibadge | 30 dagars nöjd-kund-garanti | 30-day satisfaction guarantee |""",
    """**CPA against `SO_23_1`** in the same ad set with equal budget, and both against the 291 kr cold
CPA. No verdict before 300 kr and 3 purchases.""",
    "Whether the people who leave are stopped by price or by doubt. That answer changes the product page as much as it changes the ads.",
    "**Motorhölje Retargeting — this ad set does not exist yet. See section 1.**"))

# =============================================================== G. Offer static

write(IMG, "Enginecover_SO_24_1", static(
    "Enginecover_SO_24_1", "SO",
    "vinkel=`offer/överlager` · hook-typ=`påstående` · format=`statisk` · proof=`inget (produktclaim)` · offer-i-creativen=`pris syns (299 mot 367)` · visuell stil=`grafik+produkt` · textmängd=`rubrik+underrad+prisrad` · talare=`ingen`",
    "Static in the offer angle. **The image version of the account's most efficient ad's angle.**",
    """`Enginecover_SO_4_H1` is the most efficient ad in the account — **CPA 86,75 kr, 1 721 kr of profit
per 1 000 kr** on 434 kr of spend. It is a video.

The offer angle has five judgeable ads and they span **38 kr to 1 721 kr per 1 000** with the same
copy block. The two best are videos; the three worst are statics. That is suggestive but it is not
a format finding — `Motorhölje_SO_2` is a static at 532, comfortably profitable, and the spread
within statics is as wide as the spread between formats.

**What is missing is a static built on the overstock argument itself.** The existing offer statics
lead with protection and mention the price; none of them leads with the reason the price is low.
That reason is the whole strength of the angle and it has never carried an image.""",
    "An image that leads with the overstock reason performs closer to the offer videos than the existing offer statics do, because the reason is what makes the discount credible.",
    "The SO copy block, the black cover, the CTA, the landing page.",
    "**What the image leads with** — the reason for the discount, not the protection benefit.",
    """**Stacked product, plainly shot.** Several folded covers stacked or boxed, with one fitted on an
outboard beside them. The stack is the argument: it shows there are too many, which is exactly what
the copy says.

Daylight, plain background, nothing styled. The price block in the lower third: `367 kr` struck
through, `299 kr` larger beside it. Clean and typographic — no starburst, no red badge.

**The stack must be plausible.** A handful of covers, not a warehouse composite.""",
    """| Element | Swedish (use this) | English meaning |
|---|---|---|
| Rubrik | Vi beställde för mycket | We ordered too much |
| Underrad | Motorhölje 420D till utombordaren – så länge lagret räcker | Motor cover 420D for the outboard – while stock lasts |
| Prisrad | 367 kr (struck through) 299 kr | 367 kr struck through, 299 kr |""",
    """**Profit per 1 000 kr against `Motorhölje_SO_2`'s 532** — the best offer static we have — and
against the SO_21 videos in the same batch. No verdict before 300 kr and 3 purchases.""",
    "Whether the offer angle's strength survives the move to an image when the image leads with the reason rather than the benefit. That is the one version of the offer static we have never made.",
    "Motorhölje SO Batch 7 (ABO)"))

print("done")
