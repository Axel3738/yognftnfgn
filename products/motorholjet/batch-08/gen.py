# -*- coding: utf-8 -*-
import os
LP = "https://baverbutiken.se/products/marin-motorholje-420d-universellt-skydd"
IMG, VID = "image-ads-briefs", "video-ads-briefs"

STATE = """## Läget i kontot 2026-08-19 — det vände

| Fönster | Spend | Köp | CPA | Mot break-even 236 kr |
|---|---|---|---|---|
| Livstid | 64 064 kr (dömbara) | 339 | 189 kr | lönsam |
| **Senaste 7 dygnen** | **+12 490 kr** | **+71** | **176 kr** | **60 kr vinst per order** |
| Senaste 3 dygnen | 7 270 kr | 33 | 220 kr | 16 kr vinst per order |

Förra veckan låg marginalen på **291 kr** och kampanjen förlorade pengar. Nu ligger den på 176.
Vinstbidraget gick från 11 675 kr till **15 940 kr**.

**Vad som faktiskt fixade det:** fem förlustannonser pausades och dagsbudgeten halverades från
4 000 till 2 000 kr. Det var inte en ny creative som räddade kontot. Det var att sluta betala för
de dåliga.

**Och det rev sönder förra veckans slutsats.** Jag skrev att ingenting överlever skala. Den här
veckan tog `PD_1_H3` ytterligare 4 612 kr och gick **upp** från 340 till 383 kr vinst per 1 000,
och `SO_5_1` tog 3 845 kr till och gick **upp** från 168 till 240. Nedgången jag mätte var till
stor del att förlorarna fortfarande låg och drog ner snittet."""

STRUCTURE = """## 🔴 Launchstrukturen — fjärde misslyckandet i rad

Batch #6:s femvägs bildtest launchades 11 augusti. Så här fördelades budgeten mellan de fem
armarna som skulle ha lika mycket:

| Annons | Spend | Läge |
|---|---|---|
| `SO_16_1` | 735 kr | dömbar |
| `SO_16_4` | 452 kr | 2 köp, under grinden |
| `SO_16_2` | 303 kr | 0 köp |
| `SO_16_3` | **24 kr** | svält |
| `SO_16_5` | **5 kr** | svält |

147 gångers skillnad mellan armarna. Testet går inte att läsa. Samma sak hände batch #2 och
batch #5. **Det är fjärde gången samma strukturfel förstör samma sorts test.**

Videorna i batch #6 svalt likadant: `SP_16_H1` fick 118 kr fördelat på fyra öppningar,
`SP_17_H1` 17 kr, `PD_21_H1` 64 kr, `SP_18_1` 30 öre.

**Launcha den här batchen i en separat ABO-kampanj med lika dagsbudget per annons.** Cirka
100 kr per annons per dygn i tre dygn räcker för att passera 300 kr. Går det inte: **launcha
färre annonser med mer budget var.** Det är nio creatives här, inte arton, just för att det ska
gå att ge dem riktig budget."""

COPYGATE = """## ⚠️ COPY GATE

Två saker gäller fortfarande:

**1.** `Enginecover_SO_4_H1` kör rubriken `Skydda din motor – innan vintern` och raden
`Beställ innan lagret tar slut 👇`. Båda är förbjudna. Den är kontots **näst mest effektiva
annons** (CPA 107,76 kr, 1 190 kr vinst per 1 000). Byt texten, pausa inte annonsen. Detta har
stått här fem körningar i rad.

**2.** Batch #6:s statiska är byggda på sidoinlägg, så `body` och `title` går **inte** att läsa ur
kontot. Vi vet alltså inte vilken copy de kört. Öppna en av dem i Ads Manager och läs tillbaka.

Paste-a primärtexten och rubriken från copy-cardet nedan, tecken för tecken, och **läs tillbaka
efter launch**."""

CTR = """> **Klickkvalitet: fortfarande den bästa prediktorn vi har, men inte längre utan undantag.**
> Av de fyra lägsta CTR-annonserna konverterar två utmärkt (`SO_4_H1` 10,8 %, `PD_8_1` 5,5 %) och
> två dåligt (`SO_17_1` 2,8 %, `PD_16_H1` 1,8 %). Låg CTR verkar nödvändigt men inte tillräckligt.
> Optimera ändå aldrig för klick."""

GATE = """> **Ingen dom under 300 kr och 3 köp. Ingen vinnare under 2 000 kr.**

---

## 🟢 Vad de granskade bilderna visade (2026-08-19)

Kontots statiska annonser gick äntligen att granska visuellt. Fem av dem är avlästa. Det ändrade
en slutsats som stod i den första versionen av den här briefen:

| Prisets roll i bilden | Annons | kr/1 000 |
|---|---|---|
| Litet, i hörnet, produktbevis dominerar | `PD_8_1` | **+425** |
| Stort men balanserat mot fem produkter + fördelar | `SO_5_1` | **+240** |
| Ensam hjälte, enormt och rött | `SO_8_1` | **−405** |
| Rött, men en storlekstabell äter bilden | `PD_6_1` | **−332** |

**Det är inte "pris i bild" som förlorar. Det är pris som ensam hjälte.** Pris som en detalj bland
produktbevis är förenligt med kontots två bästa statiska.

**Och: sortiment slår enskild packshot.** De två annonser som visar **fem höljen i färg** är båda
klart positiva. De två som visar **ett enda objekt mot tom bakgrund** är kontots två sämsta.
Fem av fem dömbara följer mönstret.

**Alla fem är studio mot vit botten.** Kontot har aldrig kört en statisk fotad utomhus."""

CARD_SO = """## COPY CARD — paste this into Ads Manager exactly

**Primary text:**

> Vi beställde för mycket motorhölje i 420D Oxfordtyg.
> Nu säljer vi ut till 299 kr istället för 367 kr.
> Vattenavvisande skydd mot regn, sol och damm.
> Dragsko runt hela kanten för tät passform.
> På och av på några sekunder.
> Så länge lagret räcker – beställ ditt hölje nu.

**Headline:** `299 kr istället för 367 kr`

**CTA:** `Handla nu` · **Destination:** """ + LP

RULES = """## Hard rules — breaking any one makes the ad unusable

- **Price is exactly 299 kr, ordinary price exactly 367 kr.** Never another number, never a
  percentage other than 19 %.
- **Never claim a customer count, rating or review count.** We have zero verified reviews.
- **Never reference winter, cold or autumn.** It is August, boating season.
- **Never write "innan lagret tar slut".** Only **"så länge lagret räcker"** is permitted.
- **Water-repellent, never waterproof.** **Universal fit, never tailored.**
- **No absolute durability claims.** Describe the mechanism instead.
- **No invented testimonial, name, star rating or quote.**
- **Do not put a figure on what an engine costs.**
- **Size ranges exactly as in the store:** 6 - 18 hk · 20 - 30 hk · 40 - 60 hk · 60 - 90 hk ·
  100 - 150 hk · 175 - 250 hk.
- **Black cover only.**

**Spelling traps:** motorhölje · utombordare · hk · 6–250 hk (en dash) · 420D Oxfordtyg ·
Bäverbutiken. Å, Ä och Ö must render."""

STATIC_FMT = """| | |
|---|---|
| Format | Static, **1:1 (1080×1080)** and **4:5 (1080×1350)**, JPG, sRGB, under 2 MB |
| Production level | **Simple** |
| CTA button | Handla nu |
| Landing page | """ + LP + """ |

Set the 4:5 layout separately. Never letterbox the square. Keep all text inside the middle 80 %
of the frame. Headline readable at thumbnail size: minimum ~60 px cap height on 1080 px."""

def write(folder, name, text):
    d = os.path.join(folder, name); os.makedirs(d, exist_ok=True)
    open(os.path.join(d, "brief.md"), "w").write(text)

def brief(name, tags, typ, why, hyp, kept, changed, fmt, body, kpi, learn, adset, extra=""):
    return f"""# {name}

**VARIABELTAGGAR:** {tags}
*(Läses av nästa `/cs` för att gruppera vinstbidrag per variabelvärde. Ändra dem inte utan att ändra creativen.)*

**Type:** {typ}

---

{STATE}

---

{STRUCTURE}

---

{COPYGATE}

---

## 1. Why this ad exists (from the 2026-08-19 teardown)

{why}

**Hypothesis:** {hyp}

**Kept:** {kept}

**Changed (isolated variable):** {changed}

{CTR}

{GATE}

---

## 2. Format

{fmt}

**Ad set:** {adset}

---

{body}

---

{CARD_SO}

---

{RULES}

---

## Primary KPI

{kpi}

## What we learn regardless of outcome

{learn}
{extra}"""

# ================= A. PRISBEVIS UT UR BILDEN (4 statiska) =================

PRIS_WHY = """**Prisbevis i bild fick äntligen ett läsbart svar, och det var negativt.**

Frågan har briefats fyra gånger och mätts noll. Den här veckan gick två annonser med **samma
fotografi** över signifikansgrinden samtidigt:

| Annons | Nedre tredjedel | Spend | Köp | CPA | kr/1 000 |
|---|---|---|---|---|---|
| `Enginecover_SO_16_1` | inget pris | 735 kr | 3 | 245,16 | **−37** |
| `Enginecover_SO_17_1` | `367 kr` överstruket, `299 kr` bredvid | 1 095 kr | 4 | 273,80 | **−138** |

Bilden med pris presterade sämre. Båda ligger under break-even, så ingen av dem tjänar pengar —
men riktningen är tydlig och det är första gången testet över huvud taget gick att läsa.

**Det är 3 respektive 4 köp.** Tunt. Behandla det som en första riktning, inte som bevisat.

De här fyra tar reda på vad den nedre tredjedelen ska bära i stället. **Alla fyra använder exakt
samma fotografi som `SO_16_1` och `SO_17_1`.** Rubriken är identisk. Det enda som skiljer dem är
raden längst ner."""

PRIS_KPI = """**Köp per klick, alla fyra mot varandra och mot `SO_16_1`:s 3,3 %.** De **måste** ligga i samma
adset med lika budget. Fyra tidigare bildtester har dött på ojämn budget — se strukturvarningen."""

PRIS_KEPT = """**Fotografiet, exakt som i `SO_16_1`.** Samma exporterade fil, samma beskärning, samma rubrik
`Skydda motorn vid bryggan`, samma copy-block, samma adset."""

_pris = [
 ("Enginecover_SO_26_1", "mekanik", "**a mechanism line**",
  "Vattenavvisande 420D Oxfordtyg – dragsko håller höljet på plats.",
  "Water-repellent 420D Oxford fabric – a drawstring holds the cover in place.",
  "Mechanism beats price in the lower third, because the doubt that stops the purchase is about whether the thing works, not about what it costs."),
 ("Enginecover_SO_26_2", "garanti", "**a guarantee line**",
  "30 dagars nöjd-kund-garanti på ditt motorhölje.",
  "30-day satisfaction guarantee on your motor cover.",
  "Risk reversal beats price in the lower third, because the hesitation is about fit rather than money."),
 ("Enginecover_SO_26_3", "storlek", "**a size line**",
  "Finns i storlekar för utombordare 6–250 hk.",
  "Available in sizes for outboard motors 6–250 hp.",
  "Answering the fit question in the lower third beats price, because size is the one thing a buyer cannot check from the image."),
 ("Enginecover_SO_26_4", "inget", "**nothing at all**",
  "TOMT — ingen text i nedre tredjedelen.",
  "Empty. No text in the lower third at all.",
  "An empty lower third beats all three filled versions, because the photograph carries more without a caption competing with it."),
]

for nm, tagv, short, sv, en, hyp in _pris:
    is_empty = tagv == "inget"
    tbl = (f"""| Element | Swedish (use this) | English meaning |
|---|---|---|
| Rubrik | Skydda motorn vid bryggan | Protect the motor at the dock |
| Nedre tredjedel | {sv} | {en} |""" if not is_empty else """| Element | Swedish (use this) | English meaning |
|---|---|---|
| Rubrik | Skydda motorn vid bryggan | Protect the motor at the dock |
| Nedre tredjedel | *(ingenting)* | *(nothing)* |

**Detta är kontrollen.** Nedre tredjedelen ska vara helt tom. Inget pris, ingen badge, ingen rad,
ingen logotyp. Om något hamnar där är testet dött.""")
    write(IMG, nm, brief(
        nm,
        f"vinkel=`offer/överlager` · hook-typ=`påstående` · format=`statisk` · proof=`inget (produktclaim)` · offer-i-creativen=`{('inget pris i bild' if tagv!='inget' else 'ingen offer')}` · visuell stil=`textfri produktbild + rubrik` · textmängd=`{('rubrik' if is_empty else 'rubrik+underrad')}` · talare=`ingen` · nedre-tredjedel=`{tagv}`",
        f"Static in the offer angle. Lower third carries {short}. One of **four** that share one photograph and differ only in that line.",
        PRIS_WHY, hyp, PRIS_KEPT,
        f"**The lower third only** — {short} where the price block used to be.",
        STATIC_FMT,
        f"""## 3. Design brief

**Use the exported file from `Enginecover_SO_16_1`.** Do not re-shoot, do not re-crop, do not
re-grade. The black cover fitted on an outboard at a jetty, boat and water behind, daylight.

{'Set the line below in the lower third, clean and typographic. No badge, no starburst, no box.' if not is_empty else 'Leave the lower third empty.'}

---

## 4. Text on the image (Swedish word-for-word, do not re-translate)

{tbl}""",
        PRIS_KPI,
        "What the most valuable real estate in an offer image should carry. Four attempts have been made to answer the price half of this question and only one produced a reading.",
        "Motorhölje SO Batch 8 (ABO) — all four SO_26 variants, equal budget"))

# ================= B. SO_5_1-ITERATIONER (2 statiska) =================

VOL_WHY = """**`Enginecover_SO_5_1` är kontots näst största vinstkälla och har aldrig itererats.**

51 köp, 9 703 kr spend, CPA 190,25 kr, **2 333 kr i vinstbidrag**. Bara `PD_1_H3` ligger högre. Och
den är **statisk** — ingen annan statisk annons i kontot är i närheten.

Den tog dessutom 3 845 kr till den här veckan och gick **upp** från 168 till 240 kr vinst per
1 000. Den skalar.

**Och nu vet vi hur den ser ut.** `*.fbcdn.net` är fortfarande spärrad, men `ads_get_ad_preview`
renderar bilden serverside — femte försöket, första gången det gick. `SO_5_1` visar **fem höljen i
rad i olika färger** (oliv, grå, grön, blå, svart) på vita utombordare mot vit botten, rubrik
*Marint motorhölje i 420D*, ett stort prisblock, tre ikonfördelar och en garantibadge.

`PD_8_1` — kontots mest effektiva statiska per krona, **+425 kr per 1 000** — visar **samma
femfärgs-lineup** med fyra utpekningslinjer och priset litet i hörnet.

Och de två sämsta, `SO_8_1` (−405) och `PD_6_1` (−332), visar båda **ett enda objekt mot tom
bakgrund**. Fem av fem dömbara statiska följer mönstret.

**Därför är frågan inte längre "mycket eller lite i bild".** Den är utagerad: avskalad enskild
packshot förlorar, och vi behöver inte betala för att lära oss det igen. Den öppna frågan är i
stället: **slår en miljöbild vid bryggan den beprövade sortimentsbilden?** Kontot har aldrig kört
en enda statisk fotad utomhus."""

write(IMG, "Enginecover_SO_27_1", brief(
    "Enginecover_SO_27_1",
    "vinkel=`offer/överlager` · hook-typ=`påstående` · format=`statisk` · proof=`demo` · offer-i-creativen=`pris syns i underrad` · visuell stil=`innehållsrik miljöbild` · textmängd=`rubrik+underrad` · talare=`ingen`",
    "Static in the offer angle, **environment shot**. Runs against `SO_27_2`, the proven studio line-up. The account has never run an outdoor static.",
    VOL_WHY + """

**Den här är miljöbilden — kontots första.** Hypotesen är att en riktig bruksmiljö gör produkten
begriplig på ett sätt en studiobild inte kan, och att den därför tål att ses många gånger.""",
    "An environment shot at the dock scales better than the proven studio line-up, because seeing the cover in use answers more doubts than seeing it on white.",
    "The SO copy block, the black cover, the CTA, the landing page, the ad set.",
    "**Where the photograph is taken** — a real dock instead of a white studio.",
    STATIC_FMT,
    """## 3. Design brief

**Mycket i bilden.** Höljet monterat på utombordaren, båten under, bryggan, vattnet, och väder i
luften — moln, ljus som bryter fram, kanske regnvått trä. Ögat ska ha flera saker att landa på och
hitta något nytt vid andra anblicken.

Produkten är fortfarande motivet och ska fylla minst en tredjedel av bilden. Detta är inte en
landskapsbild med ett hölje i.

---

## 4. Text on the image (Swedish word-for-word, do not re-translate)

| Element | Swedish (use this) | English meaning |
|---|---|---|
| Rubrik | Motorn skyddad. Bryggan väntar. | Motor protected. The dock awaits. |
| Underrad | Vattenavvisande 420D Oxfordtyg med dragsko – nu 299 kr istället för 367 kr | Water-repellent 420D Oxford fabric with drawstring, now 299 kr instead of 367 kr |""",
    """**Vinst per 1 000 kr mot `SO_27_2`, och båda mot `SO_5_1`:s 240.** Samma adset, lika budget.
Läs av vid 2 000 kr, inte tidigare — det är först där frågan om skalbarhet blir meningsfull.""",
    "Whether the account's static ceiling is set by the studio look. Every judgeable static we have is shot on white; this is the first test outside it.",
    "Motorhölje SO Batch 8 (ABO) — equal budget with SO_27_2"))

write(IMG, "Enginecover_SO_27_2", brief(
    "Enginecover_SO_27_2",
    "vinkel=`offer/överlager` · hook-typ=`påstående` · format=`statisk` · proof=`demo` · offer-i-creativen=`pris litet i hörnet` · visuell stil=`sortimentsbild studio` · textmängd=`rubrik+underrad+utpekningar` · talare=`ingen`",
    "Static in the offer angle, **the proven studio line-up**. First deliberate iteration of `SO_5_1`/`PD_8_1`. Runs against `SO_27_1` in the same ad set.",
    VOL_WHY + """

**Den här är sortimentsbilden.** Den är kontots första medvetna iteration på den form som redan
tjänar pengar. `SO_5_1` och `PD_8_1` har aldrig itererats trots att de tillsammans står för 2 685
kr i vinstbidrag — den här rättar det. Den ändrar en sak mot `PD_8_1`: **bredden är budskapet, inte
priset.**""",
    "Leading with the range rather than the price lifts the proven line-up further, because the doubt the picture answers is whether one exists for my motor.",
    "The SO copy block, the black cover, the CTA, the landing page, the ad set.",
    "**What the line-up is sold on** — the range instead of the price.",
    STATIC_FMT,
    """## 3. Design brief

**Kopiera `PD_8_1`:s uppställning.** Fem höljen i rad — oliv, grå, grön, blå, svart — monterade på
vita utombordare mot vit studiobotten, precis som kontots två bäst presterande statiska. Samma
ordning, samma ljus, samma beskärning.

**Fyra utpekningslinjer** som i `PD_8_1`, med tunna streck ut till varsin bubbla:
*Dragsko – sitter stadigt* · *Kraftigt 420D Oxfordtyg* · *Passar 6–250 hk* ·
*Skyddar mot sol, regn och salt*.

**Priset litet i nedre högra hörnet**, som i `PD_8_1`. Inget stort prisblock, ingen röd siffra,
ingen överstruken jämförelse. `SO_8_1` gör det och ligger på −405 kr per 1 000.

---

## 4. Text on the image (Swedish word-for-word, do not re-translate)

| Element | Swedish (use this) | English meaning |
|---|---|---|
| Rubrik | Fem färger. Sex storlekar. | Five colours. Six sizes. |
| Underrad | Hitta din färg och din storlek – 6–250 hk | Find your colour and your size – 6–250 hp |
| Hörnet | 299 kr | 299 kr |""",
    """**Vinst per 1 000 kr mot `SO_27_1`, och båda mot `PD_8_1`:s 425 — inte mot `SO_5_1`:s 240.**
`PD_8_1` är den form den här kopierar, så den är rätt måttstock. Samma adset, lika budget.
Läs av vid 2 000 kr.""",
    "Whether the account's best static form gets better when the range leads instead of the price. Either way it is the first iteration of a proven winner.",
    "Motorhölje SO Batch 8 (ABO) — equal budget with SO_27_1"))
print("statiska klara")

# ================= C. BRYN-SWIPEN SOM VSL (3 video) =================

SWIPE_WHY = """**Det enda som bevisligen skalar i det här kontot är en kort offer-video.**

`Enginecover_SO_4_H1` gick den här veckan från 434 kr till **1 185 kr spend**, nästan tre gånger så
mycket, och behöll **1 190 kr vinst per 1 000 kr**. CPA gick från 86,75 till 107,76, alltså en mild
försämring vid nästan tredubblad volym. **Ingen annan annons i kontot har klarat en uppskalning.**
Fyra har kollapsat vid försök.

Dess profil är udda och värd att kopiera exakt: **CTR 1,24 %, hold 11,3 % — kontots sämsta — och
10,8 % köp per klick, kontots bästa med god marginal.** Den köper få, dyra, extremt kvalificerade
klick.

Den här batchen tar en **bevisat vinnande annons från en annan produkt** (Bryn grillkorg,
överlagerrea med insider-avsändare) och lägger den i exakt den formen. Hela nedbrytningen ligger i
`products/motorholjet/swipes/Bryn-overlager-VSL.md`.

**Tre mekanismer bär originalet, och alla tre är behållna:**

1. **Rabatten svävar aldrig fritt.** Den sitter fast i skälet (vi beställde för mycket) och
   villkoret (så länge lagret räcker).
2. **Avsändaren är en namngiven insider**, aldrig ett kundomdöme. Det kräver noll recensioner,
   vilket passar oss, vi har inga verifierade.
3. **Fienden är ett beteende**, inte en konkurrent: presenningen, sopsäcken, ingenting alls.

**Vad som inte gick att swipa:** originalets 40 % rabatt, fri frakt och livstidsgaranti. Vi har
19 %, ingen känd fraktförmån och 30 dagars nöjd-kund-garanti. Beat 3 är omskriven, inte kopierad."""

SCRIPT = """| # | Beat | Swedish (use this) | English meaning |
|---|---|---|---|
| 2 | Insidern | Jag heter Anders och jobbar i teamet på Bäverbutiken. | My name is Anders and I work on the Bäverbutiken team. |
| 3 | Erbjudandet + villkoret | Eftersom lagret är fullt säljer vi ut motorhöljet för 299 kr istället för 367 kr, alltså 19 procent ner, med 30 dagars nöjd-kund-garanti. Men bara så länge lagret räcker. | Since the warehouse is full we are selling off the cover for 299 kr instead of 367 kr, 19 percent down, with a 30-day satisfaction guarantee. But only while stock lasts. |
| 4 | Den kvalificerande minnesbilden | Om du någon gång har stått vid bryggan, dragit en presenning över motorn och sett den blåsa loss redan nästa dag, då är det här lösningen. | If you have ever stood at the dock, pulled a tarp over the engine and seen it blow loose the very next day, this is the solution. |
| 5 | Mekanismen | Motorhöljet har en dragsko som går runt hela kanten, så du drar åt och det sitter kvar tätt mot utombordaren. | The cover has a drawstring running around the entire edge, so you cinch it and it stays tight against the outboard. |
| 6 | Sinnlig nytta + fienden | Du får ett hölje i kraftigt 420D Oxfordtyg som ligger städat och snyggt över motorn, i stället för en fladdrande presenning eller en sopsäck som går sönder efter ett par veckor. | You get a cover in heavy 420D Oxford fabric that sits neat over the engine, instead of a flapping tarp or a bin bag that falls apart after a couple of weeks. |
| 7 | Enkelheten | Det tar några sekunder att dra på och några sekunder att dra av. Inget krångel med snören som ska knytas. | It takes seconds to put on and seconds to take off. No fiddling with cords to tie. |
| 8 | Hållbarhet | 420D Oxfordtyget är byggt för att hålla säsong efter säsong, och med universell passform hittar du rätt storlek oavsett om du kör 6 - 18 hk eller 175 - 250 hk. | The fabric is built to last season after season, and with a universal fit you find the right size whether you run 6 - 18 hk or 175 - 250 hk. |
| 9 | "Du vet redan"-stängningen | Om du fortsätter göra som du alltid har gjort vet du redan hur det slutar. | If you keep doing what you have always done, you already know how it ends. |
| 10 | Erbjudandet igen + CTA | 299 kr istället för 367 kr, så länge lagret räcker. Klicka nu och säkra ditt motorhölje på Bäverbutiken.se. | 299 kr instead of 367 kr, while stock lasts. Click now and secure your cover at Bäverbutiken.se. |"""

VFMT = """| | |
|---|---|
| Längd | **45 till 60 sekunder** |
| Ratios | 9:16 (1080×1920) **och** 4:5 (1080×1350), var för sig omframad |
| Codec | H.264 MP4, 30 fps, under 100 MB, ljud −14 LUFS |
| Talare | **Anders, i bild, rakt in i kameran.** Verklig röst på plats, ingen studio-VO, ingen musik under dialogen |
| Miljö | Brygga eller hamn i dagsljus. Handhållet. Telefonkvalitet är rätt och att föredra |
| Färg | Svart hölje |
| Produktionsnivå | Medium |

Undertexter är **obligatoriska, inbrända, svenska, ord för ord** mot det talade. Inte
autogenererade, inte omskrivna. Håll dem inom mittersta 80 % av bilden vertikalt."""

SHOTS = """## 4. Shot list

| Beat | Bild |
|---|---|
| 1–2 | Anders vid bryggan med det hopvikta höljet i handen, utombordaren bakom. **Produkten i bild från första rutan.** |
| 3 | Anders rakt in i kameran. Priset på skärmen. |
| 4 | Presenning som fladdrar eller ligger halvt avblåst bredvid motorn. |
| 5 | Närbild på dragskon som dras åt runt hela kanten. |
| 6 | Höljet på plats, städat och tätt. Klipp till presenningen igen som kontrast. |
| 7 | Av och på i en rörelse. Ärlig hastighet, ingen speed-ramp. |
| 8 | Närbild på tyget, sedan två olika motorstorlekar. |
| 9–10 | Anders rakt in i kameran. Sluta på den täckta motorn med priset på skärmen. |"""

OVERLAYS = """## 5. On-screen text overlays

Max fyra.

| Beat | Swedish (use this) | English meaning |
|---|---|---|
| 3 | 299 kr istället för 367 kr | 299 kr instead of 367 kr |
| 5 | Dragsko runt hela kanten | Drawstring all the way round |
| 7 | På och av på sekunder | On and off in seconds |
| 8 | 30 dagars nöjd-kund-garanti | 30-day satisfaction guarantee |"""

EDIT = """## 6. Editing direction

- Klipp på repliken, inte efter den. Ingen död luft mellan meningarna.
- Inget logotypkort, ingen titelruta, ingen intro. Produkten är i första rutan.
- Inga zoom-punchar, inga whoosh-effekter, ingen trendlåt.
- **Produkt i bild före sekund 4. Inga undantag.**"""

_hooks = [
 ("Enginecover_SO_25_H1", "överlagerbekännelse", "påstående",
  "Vi klantade oss och beställde alldeles för många motorhöljen till Bäverbutiken. Nu är lagret proppfullt och du får ett riktigt bra pris.",
  "We messed up and ordered far too many motor covers. Now the warehouse is packed and you get a really good price.",
  "**Originalets vinkel.** Erbjudandet presenteras som konsekvensen av vårt misstag, vilket är det som gör rabatten trovärdig.",
  "The overstock confession is what makes the discount credible, and reproduces the original ad's performance in our account."),
 ("Enginecover_SO_25_H2", "problem först", "fråga",
  "Om du någon gång har sett en presenning blåsa av motorn vid bryggan vet du precis hur irriterande det är.",
  "If you have ever seen a tarp blow off the engine at the dock, you know exactly how annoying that is.",
  "**Problemet först.** Öppnar i igenkänningen i stället för i erbjudandet, vilket kvalificerar publiken innan priset nämns.",
  "Opening in the problem qualifies the viewer before the offer arrives, and buys fewer but better clicks than the offer-led opening."),
 ("Enginecover_SO_25_H3", "siffran först", "siffra/pris",
  "299 kr. Det är vad ett motorhölje kostar hos Bäverbutiken just nu, 19 procent ner från 367 kr.",
  "299 kr. That is what a motor cover costs at Bäverbutiken right now, 19 percent down from 367 kr.",
  "**Siffran först.** Priset gör stoppjobbet, utan förklaring.",
  "A number does the stopping work on its own, which would make the confession framing unnecessary."),
]

for nm, hookname, hooktyp, sv, en, roll, hyp in _hooks:
    write(VID, nm, brief(
        nm,
        f"vinkel=`offer/överlager` · hook-typ=`{hooktyp}` · format=`video 45-60 s, creator-VSL` · proof=`insider, ingen kund` · offer-i-creativen=`pris nämns (299 mot 367)` · talare=`namngiven insider i bild` · hook=`{hookname}`",
        f"Creator-led offer VSL, swipe of a proven ad from another product. **Hook variant: {hookname}.**",
        SWIPE_WHY + f"""

**Vad den här varianten isolerar:** öppningen. {roll}

**Spela in alla tre varianterna i samma session.** Allt från beat 2 och framåt måste vara
**identiskt** mellan de tre filerna: samma tagning, samma klippning, samma overlays. Skiljer något
annat är hookjämförelsen död.

Kontot har aldrig fått ett rent hooktest. Tre försök har gjorts och alla tre var kontaminerade:
batch #4:s varianter ärvde olika copy-block, `SP_13_H1`:s tre öppningar pausades under grinden, och
`SP_16_H1`:s fyra öppningar fick 118 kr tillsammans.""",
        hyp,
        "**Allt från beat 2 och framåt**, byte-identiskt mellan de tre filerna. Och swipens tio beats i sin ordning.",
        "**Öppningen, beat 1, och ingenting annat.**",
        VFMT,
        f"""## 3. Script — record these lines word for word

Ändra inte formuleringarna, översätt inte högerkolumnen själv, "fixa" inte svenskan. Ser något ut
som ett stavfel: fråga innan du ändrar.

**Beat 1, öppningen. Detta är den enda raden som skiljer den här filen från de andra två:**

| Swedish (use this) | English meaning |
|---|---|
| {sv} | {en} |

**Beat 2 till 10, identiska i alla tre filerna:**

{SCRIPT}

**Anders talar om företaget och produkten, aldrig om andra kunder.** Inte ett ord om hur många som
köpt, betyg eller omdömen.

---

{SHOTS}

---

{OVERLAYS}

---

{EDIT}""",
        """**Köp per klick mot SO-blockets 2,4 % och mot `SO_4_H1`:s 10,8 %.** Sedan vinst per 1 000 kr mot
`SO_4_H1`:s 1 190. De tre hookarna mäts mot varandra i **samma adset med lika budget**.
Hook rate är diagnos, aldrig urvalskriterium: kontots sämsta hold tillhör dess bästa annons.""",
        "Om swipen bär, och vilken av de tre öppningarna som bär den. Det blir kontots första rena hooktest efter tre misslyckade försök.",
        "Motorhölje SO Batch 8 (ABO) — alla tre SO_25-varianter, lika budget"))
print("video klara")

# --- Efterjustering: SO_27_2 är en sortimentsbild, inte en svart packshot ---
import io as _io, os as _os
_p = _os.path.join(_os.path.dirname(_os.path.abspath(__file__)),
                   "image-ads-briefs", "Enginecover_SO_27_2", "brief.md")
_s = _io.open(_p, encoding="utf-8").read()
_old = "- **Black cover only.**"
_new = ("- **This ad is the one exception to the black-cover rule.** It shows the five-colour\n"
        "  line-up — olive, grey, green, blue, black — exactly as `PD_8_1` and `SO_5_1` do. Those\n"
        "  two are the account's best-performing statics and the range is the whole point of this\n"
        "  ad. Colours exactly as sold in the store, no invented colour.")
assert _old in _s
_io.open(_p, "w", encoding="utf-8").write(_s.replace(_old, _new, 1))
print("SO_27_2 färgregel justerad")
