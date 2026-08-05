# Mastern — vinnande vs förlorande variabler

Källa: kampanjen **Mastern** (`120242897371730074`), SnarkLös, senaste 90 dagarna.
Kampanjsnitt: **1 453 846 kr spend · ROAS 1,78 · CTR 3,15 % · 2 574 köp · CPA 565 kr**

---

## Det rena experimentet: B-serien

Fem statics (`video_play_actions = null`) delar **exakt samma body-copy och samma headline**
("Rent galler på minuter — utan ett enda borststrå"). Enda variabeln är **bilden**. Det gör
detta till det mest tolkningsbara testet i hela kontot.

| Ad | ROAS | CTR | Spend | Vad bilden gör | Rabattens yta |
|----|------|-----|-------|----------------|---------------|
| **B61** | **2,92** | 1,57 % | 4 568 kr | "HELA KITET INGÅR" — knolling, varje del namngiven | liten badge |
| **B71** | 2,64 | 2,28 % | 4 155 kr | Staplade lådor + handskriven "vi beställde för många"-tag, feature-ikoner syns | ~20 % |
| **B020** | 2,53 | **1,41 %** | 6 842 kr | **Vinkel-annons:** "Dom flesta rengör med lökfolie eller en borste som tappar strån" — split gammal borste/lösa trådar vs Mastern. **Ingen rabatt. 999 kr öppet.** | 0 % |
| **B69** | 2,45 | 1,73 % | 8 022 kr | Knolling premium slate + "HELA KITET – 40 % RABATT" + urgency | ~30 % |
| **B66** | **1,74** | 2,37 % | **34 291 kr** | "40 % RABATT" gigantiskt, brush-stroke, rörig komposition | ~40 % |

### Tre slutsatser som faller ut direkt

**1. Rabattens yta äter ROAS.** Perfekt monotont samband: ju större del av bildytan som är
rabatt-skrik, desto lägre ROAS. B61 (badge) 2,92 → B66 (40 % av ytan) 1,74. Samma copy,
samma produkt, samma erbjudande — bara olika visuell hierarki. −40 % ROAS.

**2. Hög CTR är en varningssignal, inte ett mål.** Vinnarna ligger på CTR 1,41–1,73 %.
Bland videorna är sambandet brutalt:

| Ad | CTR | ROAS |
|----|-----|------|
| 123 H2 | 6,32 % | **0 köp** |
| 191 CARLA H4 | 7,01 % | 0,57 |
| 101 H3 (variant) | 5,27 % | 0,77 |
| B020 | 1,41 % | 2,53 |
| Gril 10 (DPA) | 1,79 % | 2,61 |

Rabatt- och nyfikenhetsskrik drar in fyndjägare och nyfikna. De klickar och köper inte.
Låg CTR + hög ROAS = annonsen **kvalificerar** — den avskräcker fel folk innan klicket.

**3. Allokeringsmissen.** Den sämsta staticen (B66, 1,74) fick **34 291 kr** — 5× mer än de
fyra bättre (2,45–2,92) som fick 4–8k var. Att flytta budget från B66 till B61/B71/B020
är gratis ROAS, ingen ny produktion krävs.

---

## Videosidan — de tre jobben

| Ad | Vinkel | Spend | ROAS |
|----|--------|-------|------|
| **049** | **Trust / anti-scam** | 72 174 kr | **2,42** |
| 088 | Förstörd grillkväll / smak | 58 332 kr | 2,32 |
| 235 H3 | (ny) | 47 040 kr | 2,25 |
| 101 H3 | Farfar / smak | 55 407 kr | 2,15 |
| **128 H3** | **Skydda investeringen** | 69 098 kr | 2,00 |
| 110 H2 | Grilltekniker | 69 979 kr | 1,95 |
| 117 | — | 45 513 kr | 1,78 |
| **145 H2** | **Ren mekanism ("tre anledningar")** | 32 108 kr | **1,36** |
| 191 H6 L | — | 13 726 kr | 1,09 |

**Rättelse till teorin:** "grillen går sönder" (128 H3) ligger på ROAS 2,00 — över snittet
och den skalar (69k spend), men den är **inte** kontots högsta. Högst ROAS i skala är
**049 = trygghet/anti-scam (2,42)**, följt av **088 = smak (2,32)**.

Ren mekanism utan känsla (145: "tre anledningar varför varenda grillborste misslyckas")
är sämst av de stora — 1,36. Mekanism är bevis, inte krok.

---

## Modellen: tre jobb, inte en vinkel

Datan + ringlistan pekar på att ett köp av en 999-kr-borste kräver tre olika saker, och att
de bästa annonserna gör flera av dem:

| Jobb | Vad den löser | Bevis |
|------|---------------|-------|
| **1. Dörren** — frustration, "provat allt", frikännande | Får rätt person att stanna. Anklaga aldrig — de *har* redan försökt. | B020 (2,53, lägst CTR), 088 (2,32) |
| **2. Rättfärdigandet** — investeringen dör | Flyttar jämförelsen från "999 kr vs hundralappsborste" till "999 kr vs grill för 15 000" | 128 H3 (2,00 @ 69k), "Dan i Täby" i ringlistan |
| **3. Låset** — trygghet | Dödar "är det här en scam / får jag vad jag ser?" — avgörande för svensk publik och en okänd 999-kr-pryl | **049 (2,42 @ 72k — högst i skala)** |

Smak/stekyta och borststrån är **tillåtelser** — sekundära bevis som tystar sista tvivlet.
Inte krokar i sig.

---

## Den största outnyttjade möjligheten

**Ingen enda static kör investerings-vinkeln.** Alla fem B-statics är antingen rabatt
(B61/B66/B69/B71) eller borststrån/tid (B020). "Grillen dör av inbränt fett" finns bara i
video (128 H3).

Samtidigt är B020 — den enda staticen med en riktig vinkel och **utan rabatt, med öppet
pris** — nästan bäst i klassen (2,53) med lägst CTR av alla. Formeln funkar. Vinkeln som
enligt ringlistan rättfärdigar priset har aldrig testats i den formeln.

---

## Vad vi slutar med
- **Jaga CTR.** 123 H2 (6,32 %, noll köp) och CARLA (7,01 %, 0,57) är varnande exempel.
- **Rabatt-först statics.** B66-estetiken kostar ~40 % ROAS mot B61.
- **Rena mekanism-annonser.** 145 H2 = 1,36.
