# Konceptbasen — vår egen "Gro" för bildannonser

Axels beställning 2026-10-03: "alla Bäverbutikens bilder … bygger på väldigt
likartade koncept. Det är bara texten och produktbilderna som skiljer sig …
vi behöver fixa vår egen typ av Gro och ha vår egen static ad-bas med massa
olika bottom-of-funnel-koncept."

## Varför den finns (mätt 2026-10-03 i MagiBorsten)

| | |
|---|---|
| Aktiva bildannonser | 353 (av 903 aktiva annonser) |
| Spend 30 dagar | 110 898 kr / 323 köp (video: 458 741 kr) |
| De fyra största bildernas andel | 59 % |
| Bilder under 300 kr | 315 av 353 |
| Bedömbara (≥ 300 kr och ≥ 3 köp) | 16 |
| Vinklar | PD 60, FD 89, BOF 48, CS 38, SP 15, OB 10 … |

Vinklarna varierar. Layouten gör det inte: rubrik i topp, produkten i mitten,
priset i botten, knapp. Orsaken är inte kie.ai och inte en enskild rutin:

1. **Briefformatet är mallen.** Bildbriefens Script/shot list har fem rader —
   `Headline`, `Sub-line`, `Badge`, `Bottom band`, `CTA` — och fars dag-batchen
   skrev det rakt ut: "Bildannonsen (static) har: rubrik, underrad, märket,
   prisbandet, och en rad längst ner". 89 FD-bilder blev samma bild.
2. **Rutinens prompt är mallen.** `/bildannonser` steg 3 bygger prompten själv
   och ber alltid om "lugna ytor i topp och botten där texten ska ligga".
3. **Ingen hade en lista att välja ur.** Repot kände till sex statiska koncept
   (`forsta-batch.md`), åtta format (`naming-convention.md`) och fem visuella
   stilar (`ANALYSMETOD.md`), men inget av dem beskrev en bild som gick att
   rendera, och ingen rutin läste dem.

De två bilder som faktiskt skalar är de "fula": reabannern
(`Takoverdrag_CS_2_1`, ROAS 4,77) och ett riktigt foto med kundcitat
(`Takoverdrag_SP_2_1`, ROAS 3,50). Båda är koncept i basen.

## Vad som ligger här

- **`koncept.json`** — 20 koncept, 16 renderbara i dag. Varje koncept bär:
  källa (Evolve-mall, Evolves BFCM-dokument eller en mätt vinnare i kontot),
  funnel, vilka vinkelkoder det passar, hur det ser ut, vad briefen måste
  bära (`kraver`), ett engelskt promptskelett för kie.ai och ett blockskelett
  för `text.py`. Fyra koncept har `status: "tillagg"` — de behöver en ny zon
  i `text.py` (rutnät, ringar, chips, mobilram) och väljs inte förrän den
  finns.
- **`logg.jsonl`** — minnet: vilket koncept varje bild fick. Skrivs av
  `--logga` i rutinen, committas, och styr rotationen.
- **`../koncept.mjs`** — väljaren. `--lista`, `--valj`, `--kontroll`, `--logga`.

Källorna står i `docs/os/evolve/STATICS.md` (mallarna, BFCM-typerna, Evolves
egen prompt och vad som INTE lästes).

## Så används den

**I briefen (Skalnings kungen, `/cs`, `/forsta-batch`):** en bildbrief får raden
`Koncept: K07` när skrivaren vill ha ett visst koncept, och Script/shot list
bär då de rader konceptet kräver (`kraver`). Saknas raden väljer rutinen.

**I rutinen (`/bildannonser` steg 3):**

```bash
node bildannonser/koncept.mjs --valj --vinkel CS --produkt Takoverdrag \
  --scen "on a caravan in a Swedish garden in October" \
  --produkt-beskrivning "black 210D caravan roof cover with straps"
```

ger konceptet, orsaken (vinkeln, hur många gånger produkten fått det, vilka
som är spärrade), promptskelettet och blocken. Rutinen fyller `text` i varje
block **ordagrant ur briefen**, precis som förut. Jobbfilen får fältet
`koncept` (och `koncept_kalla: "brief"` när briefen bad om det). Före
rendering:

```bash
node bildannonser/koncept.mjs --kontroll --jobb <jobb.json>   # exit 1 = rendera inte
node bildannonser/koncept.mjs --logga --jobb <jobb.json>      # efter lyckad körning
```

**Rotationen:** en produkt får aldrig samma koncept som de tre senaste
gångerna, och aldrig samma koncept två gånger i samma körning (om inte briefen
uttryckligen ber om det). Det minst använda konceptet för produkten vinner.

## Järnregler som inte ändras av basen

- Raderna är briefens. Basen ger layout och bild, aldrig ett ord copy.
- Priset läses live, rea bara med `REA BESLUTAD AV ÄGAREN`, butikens namn
  står aldrig i bild, inga påhittade citat (K02 och K08 kräver en riktig
  recension), bara tal som står på produktsidan.
- Produkten ritas aldrig fritt — referensfotot med i varje anrop.
- Ett nytt koncept får bara läggas in med en källa: en Evolve-mall, ett
  BFCM-exempel, en vinnare i kontot eller en swipe i `docs/swipes/`. Gissningar
  märks som gissningar.

## Chadbots svar är inskrivet (2026-10-03, `docs/os/evolve/STATICS.md`)

- Varje koncept bär `evolve_namn` (Evolves eget mallnamn) och `prioritet`:
  **hog** = smärtpunkt (K07), offer (K12, K01, K18), de två us-vs-them (K13,
  K15), stickern på vinnaren (K16) och problemet i bild (K21); **lag** = de
  narrativa (K04 Stealing Credibility, K05 Solution Exaggeration, K08
  Accidental Ideal Outcome), som boten dömde som slöseri på en lågprisprodukt.
  Väljaren tar hog först och tar aldrig ett lågt koncept utan `Koncept:` i
  briefen.
- **Ett koncept är en vinkel.** Rotationen är layouten; vinkeln kommer ur
  briefen, och tre rubriker på samma layout är tre koncept bara om de bär tre
  olika vinklar. Det står i `regler_fran_chadbot` i basen.
- **K21 Problemet i bild** är nytt: scenen rubriken påstår, ingen produkt i
  scenen, produkten som litet utklipp. Botens svar på "hur får man kongruens
  på ett svart överdrag": generera problemet, inte produkten.
- Säsong: vinnarna med rea-sticker (K16) plus några nya rea-bilder, aldrig ny
  creative från noll.

## Nästa steg (inte gjort)

1. De fyra `tillagg`-koncepten kräver zoner i `text.py`: `rutnat-2x2` (K04),
   `ringar-3x3` (K10), `chips` (K11), `anteckning` (K20). K04 och K10 har låg
   prioritet, så K11 och K20 går först om någon bygger.
2. Briefskrivaren på rutinens gren (`rond-auto.md`, `claude/daily-agent-discussion-uos5df`)
   ska be om `Koncept:` per bildrad och skriva de rader konceptet kräver.
   Tills dess väljer rutinen själv och tar de rader som finns.
3. Läs av efter två veckor: vinstbidrag per koncept ur `logg.jsonl` × kontot.
   Koncept utan leverans efter sju dygn är ett utfall att logga, inte ett fel
   (CLAUDE.md regel 11).
4. Namnkonventionen rörs inte: konceptet lever i `logg.jsonl`. Vill Axel ha
   det i annonsnamnet är det en fråga till Evolve-communityn, inte till boten.
