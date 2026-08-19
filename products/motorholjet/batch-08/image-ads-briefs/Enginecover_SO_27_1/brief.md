# Enginecover_SO_27_1

**VARIABELTAGGAR:** vinkel=`offer/överlager` · hook-typ=`påstående` · format=`statisk` · proof=`demo` · offer-i-creativen=`pris syns i underrad` · visuell stil=`innehållsrik miljöbild` · textmängd=`rubrik+underrad` · talare=`ingen`
*(Läses av nästa `/cs` för att gruppera vinstbidrag per variabelvärde. Ändra dem inte utan att ändra creativen.)*

**Type:** Static in the offer angle, **content-rich**. Runs against `SO_27_2`, which is the stripped-back version of the same idea.

---

## Läget i kontot 2026-08-19 — det vände

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
stor del att förlorarna fortfarande låg och drog ner snittet.

---

## 🔴 Launchstrukturen — fjärde misslyckandet i rad

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
gå att ge dem riktig budget.

---

## ⚠️ COPY GATE

Två saker gäller fortfarande:

**1.** `Enginecover_SO_4_H1` kör rubriken `Skydda din motor – innan vintern` och raden
`Beställ innan lagret tar slut 👇`. Båda är förbjudna. Den är kontots **näst mest effektiva
annons** (CPA 107,76 kr, 1 190 kr vinst per 1 000). Byt texten, pausa inte annonsen. Detta har
stått här fem körningar i rad.

**2.** Batch #6:s statiska är byggda på sidoinlägg, så `body` och `title` går **inte** att läsa ur
kontot. Vi vet alltså inte vilken copy de kört. Öppna en av dem i Ads Manager och läs tillbaka.

Paste-a primärtexten och rubriken från copy-cardet nedan, tecken för tecken, och **läs tillbaka
efter launch**.

---

## 1. Why this ad exists (from the 2026-08-19 teardown)

**`Enginecover_SO_5_1` är kontots näst största vinstkälla och har aldrig itererats.**

51 köp, 9 703 kr spend, CPA 190,25 kr, **2 333 kr i vinstbidrag**. Bara `PD_1_H3` ligger högre. Och
den är **statisk** — ingen annan statisk annons i kontot är i närheten.

Den tog dessutom 3 845 kr till den här veckan och gick **upp** från 168 till 240 kr vinst per
1 000. Den skalar.

**Vi vet inte varför.** `*.fbcdn.net` blockeras av gatewayen, verifierat fem körningar i rad, så
bilden går inte att granska. Vi kan inte kopiera det som fungerar, bara testa runt det.

De här två testar den enda hypotes vi kan formulera utan att se bilden: **är en skalbar statisk en
bild med mycket att titta på, eller en med nästan ingenting?** `SO_5_1` har CTR 2,08 % och 2,5 % köp
per klick — mitt emellan kontots ytterligheter, vilket är förenligt med båda.

**Den här är den innehållsrika.** Hypotesen bakom den är att en statisk som ska bära volym behöver
tåla att ses många gånger, och att en bild med flera saker att landa på slits långsammare.

**Hypothesis:** A content-rich image scales better than a stripped-back one, because there is more for the eye to find on the second and third impression.

**Kept:** The SO copy block, the black cover, the CTA, the landing page, the ad set.

**Changed (isolated variable):** **How much is in the frame** — many elements instead of one.

> **Klickkvalitet: fortfarande den bästa prediktorn vi har, men inte längre utan undantag.**
> Av de fyra lägsta CTR-annonserna konverterar två utmärkt (`SO_4_H1` 10,8 %, `PD_8_1` 5,5 %) och
> två dåligt (`SO_17_1` 2,8 %, `PD_16_H1` 1,8 %). Låg CTR verkar nödvändigt men inte tillräckligt.
> Optimera ändå aldrig för klick.

> **Ingen dom under 300 kr och 3 köp. Ingen vinnare under 2 000 kr.**

---

## 2. Format

| | |
|---|---|
| Format | Static, **1:1 (1080×1080)** and **4:5 (1080×1350)**, JPG, sRGB, under 2 MB |
| Production level | **Simple** |
| CTA button | Handla nu |
| Landing page | https://baverbutiken.se/products/marin-motorholje-420d-universellt-skydd |

Set the 4:5 layout separately. Never letterbox the square. Keep all text inside the middle 80 %
of the frame. Headline readable at thumbnail size: minimum ~60 px cap height on 1080 px.

**Ad set:** Motorhölje SO Batch 8 (ABO) — equal budget with SO_27_2

---

## 3. Design brief

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
| Underrad | Vattenavvisande 420D Oxfordtyg med dragsko – nu 299 kr istället för 367 kr | Water-repellent 420D Oxford fabric with drawstring, now 299 kr instead of 367 kr |

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
Bäverbutiken. Å, Ä och Ö must render.

---

## Primary KPI

**Vinst per 1 000 kr mot `SO_27_2`, och båda mot `SO_5_1`:s 240.** Samma adset, lika budget.
Läs av vid 2 000 kr, inte tidigare — det är först där frågan om skalbarhet blir meningsfull.

## What we learn regardless of outcome

Whether a scalable static is a busy image or a quiet one. We cannot see the one that already scales, so this is the only way to ask.
