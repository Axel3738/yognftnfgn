# TankGuard — Creative DNA

**Skapad 2026-09-08** av `/ny-annonser tankguard` (körning nr 1).
**Senast uppdaterad 2026-09-12 av `/notionscalercs tankguard` — körning nr 2,
första briefdagen.** OPS-butik nr 2. De 40 ärvda annonserna körde 2026-09-09 →
09-11 (2 017 kr, 1 köp) och kampanjen är pausad. **0 annonser över
signifikansgrinden** (≥ 300 kr OCH ≥ 3 köp) — körning nr 2 är en **KALLSTART**:
ingen feedback-loop, hela batch #1 är nya koncept ur ärvd DNA. Se "Körning nr 2"
längst ned. Avsnitten "Vad som är bevisat" och "Vad som ändras" är fortfarande
**ärvda** från Bäverbutikens IBC-tanköverdrag, samma produkt.

Underlag: Meta Graph 2026-09-08 (`date_preset: maximum`) på två konton,
34 svenska + 33 norska annonser. Rådata `factory/output/tankguard/kallannonser.json`,
utfall `products/tankguard/batch-log.md`.

---

## Produkten och kunden

**Produkten:** IBC-tanköverdrag för 1000-literstank. 210D Oxford-tyg, blixtlås,
öppning upptill så locket går att nå utan att ta av hela överdraget.
Mått 120 × 100 × 116 cm. Sitter på under två minuter.

**Kunden:** villa- och trädgårdsägare med regnvattentank på tomten. Inte en
prylköpare — någon som redan har ett problem och har levt med det en säsong
eller flera.

**Problemet, i den ordning kunden känner det:**
1. Vattnet blir grönt av alger. Syns direkt, luktar, går inte att vattna med.
2. Skrubbningen. Den är det verkliga arbetet, och den återkommer varje sommar.
3. Plasten blir spröd av UV. Långsam, osynlig, men det är den som kostar tanken.

**Mekaniken som säljer:** tyget tar UV-strålningen i stället för plasten, och
utan ljus kommer algerna aldrig igång. Det är en fysisk orsakskedja kunden kan
se framför sig — inte en produktegenskap.

---

## Vad som är bevisat

Signifikansgrinden är 300 kr spend eller 3 köp (`docs/os/ANALYSMETOD.md`).
Under den finns ingen dom, bara frånvaro av data.

### 1. Video slår bild — och det är inte nära

| Marknad | Annonser med köp | Varav video | Varav bild |
|---|--:|--:|--:|
| SE | 4 | 4 | 0 |
| NO | 4 | 3 | 1 |

Tjugo svenska bildannonser har tillsammans 0 köp, och den dyraste av dem
(`PD_2_1`, 362 kr) är den enda bildannonsen över grinden — den fick sin chans och
tog inga köp. Norges enda bildköp (`PD_5_1`) ligger på 12 kr spend, långt under
grinden, och betyder ingenting.

**Vad det styr:** TankGuards första riktiga batch ska vara video. Bildannonserna
är billiga att brand-swappa och kan följa med, men de ska inte bära budgeten.

### 2. PD-vinkeln (produktdemo) är arbetshästen

`PD_1_H1` ensam: **16 997 kr, 77 köp, ROAS 2,92** i Sverige — 87 % av
kampanjens spend och 90 % av köpen. `PD_1_H2` och `PD_1_H3` är samma manus med
annan hook.

Hooken som bär den: **"Trött på grönt, algfyllt regnvatten? 💧"** — problemet
ordagrant, i kundens egna ord, i första meningen. Sedan mekaniken, sedan tre
bockar, sedan CTA. Ingen rabatt, ingen brådska, ingen social proof.

⚠️ **PD_1_H1 är benchmark, inte en kandidat att döma småannonser mot**
(ANALYSMETOD). Att den tar 87 % av spenden är ett skalningsfaktum, inte ett bevis
för att de andra är dåliga.

### 3. Samma annons vinner inte på båda marknaderna

| Annons | SE | NO |
|---|---|---|
| `PD_1_H1` | 16 997 kr, 77 köp, **ROAS 2,92** | 807 kr, 1 köp, **ROAS 0,95** |
| `PD_1_H2` | 310 kr, 0 köp | 3 945 kr, 18 köp, **ROAS 2,44** |
| `CS_1_H3` | 589 kr, 3 köp, ROAS 3,65 | 4 614 kr, 20 köp, **ROAS 2,37** |

Sveriges vinnare är Norges förlorare, och tvärtom. Samma produkt, samma manus,
samma vinkel — motsatt utfall på topplaceringen.

**Vad det styr:** ta aldrig med den svenska rangordningen in i den norska
kampanjen. Låt varje marknad hitta sin egen vinnare. Det är också skälet till att
Norge fördelar sig friskare (två annonser delar volymen) än Sverige (en tar allt).

### 4. Rabattvinkeln håller högst ROAS på båda marknaderna

`CS_1_H3` är den ROAS-starkaste annonsen med volym i båda kontona (3,65 i SE,
2,37 i NO på 20 köp). Vinkeln är ren rabatt.

⚠️ **Och den går inte att ärva rakt av.** Källbutikens rabatt (23 % mot 636 kr)
finns inte hos TankGuard — se nedan.

---

## Vad som ÄNDRAS när annonserna blir TankGuards

Det här är skillnaden mellan att kopiera en annons och att ärva en.

**Erbjudandet är ett annat.** Bäverbutiken säljer 489 kr mot jämförpriset 636 kr,
alltså 23 % på ett enstyck. TankGuard säljer 489 kr och lägger rabatten i
paketnivåerna: 2-pack och 3-pack med Kranskydd Frost 420D gratis på köpet.
⚠️ **Mätt 2026-09-12 (körning nr 2), live på tankguard.se:** produktsidan visar
numera **jämförpris 636 kr** på enstycket (`compare_at_price` i produkt-JSON:en)
— tvärtemot vad som stod här 2026-09-08. Och **paketpriserna A/B-testas på
sidan** (A: 831/1 159 kr, B: 799/1 099 kr, `paket:` i produktfilen), så en
annons som säger "2 för 799 kr" är falsk för hälften av besökarna. Regel från
batch #1: annonsen säger **489 kr** och "köp 2, få 2 kranskydd på köpet" —
**aldrig ett paketpris i kronor, aldrig 636 kr** (förbjudet i all ny copy,
CLAUDE.md).

Det gör tre saker med DNA:t:
1. **Rabattvinkeln byter mekanik.** Från "spara på ett" till "spara på flera". Den
   är fortfarande sann och fortfarande stark — men den är inte samma annons.
2. **En ny vinkel öppnar sig som källbutiken aldrig testat:** flerpacket. Kunder
   med två tankar finns (norska `CS_3_1` nämner redan 300 kr-gränsen), och
   gratisbonusen är säsongsrätt — kranskydd inför vintern, tanköverdrag inför
   samma vinter. Det är samma köpögonblick.
3. **Social proof kan inte ärvas — men butiken har nu egna siffror.** Fyra
   RV-annonser citerar namngivna Bäverbutiks-kunder, och SP-blocket säger
   "hundratals trädgårdsägare" — fortfarande förbjudet. **Mätt 2026-09-12 live:**
   tankguard.se visar **16 recensioner, snitt 4,81** (Judge.me-widgeten; de tio
   svenska + sex översatta, importerade 2026-09-09). Det är vad en annons får
   säga: "16 recensioner", och ett citat ordagrant med förnamn — inget annat.

---

## Kvarstående okänt

| Fråga | Varför den inte går att svara på |
|---|---|
| Break-even | **Avgjort i registret:** UTAN moms (`ekonomi.moms_antagen: false`, Axels besked 2026-09-09) → BE-ROAS 1,46, BE-CPA 334 kr. ⚠️ Produktfilens fält `break_even_roas: 2.07` står kvar från med-moms-räkningen och motsäger flaggan — registret räknar själv och är facit, men fältet bör rättas. |
| Fraktvillkor, öppet köp, betalsätt | Står bara i butiksfilen. Elva svenska annonser lovar källbutikens villkor. |
| Verklig AOV | Paketnivåerna gör att 489 kr inte är AOV. Räkna ur Shopify när ordrar finns (1 köp per Meta t.o.m. 2026-09-11). |
| Vad WITH_ISSUES gäller | 17 av 40 annonser bär Metas flagga (2026-09-12). Insikts-API:t säger inte varför — det syns bara i Ads Manager. |
| Norska priser | TankGuard har inga NOK-nivåer i repot. Den norska halvan står stilla tills de finns. |

---

## Historik

| Datum | Körning | Vad som ändrades |
|---|---|---|
| 2026-09-08 | `/ny-annonser tankguard`, körning 1 | Filen skapad. Ärvt DNA från 67 källannonser i två konton. Erbjudandet inskrivet ur Axels skärmbild. Inga egna annonser launchade. |
| 2026-09-12 | `/notionscalercs tankguard`, körning 2 (första briefdagen) | Launch #1 avläst (2 017 kr, 1 köp, kampanj pausad, 0 bedömbara → KALLSTART). Jämförpris 636 kr och paket-A/B upptäckta live. 16 recensioner verifierade. Ärvd variabeltabell räknad mot BE-CPA 334. Batch #1: 7 briefer (4 fable / 3 sonnet) i hubben. |

---

## Körning nr 2 — 2026-09-12, första briefdagen (`/notionscalercs`)

### Vad TankGuards egen kampanj visar (data, 2026-09-09 → 2026-09-11)

Kampanj `TANKGUARD_SE_Tanköverdraget | 2026-09-08`, konto `915422744950975`,
40 annonser i 7 adsets, CBO 1 000 kr/dag. **Pausad 2026-09-11 16:02** — inte av
rutinen, ett beslut. Full tabell i `batch-log.md`, "Launch #1".

| | Spend | Köp | ROAS | Mot BE 1,46 |
|---|---:|---:|---:|---|
| Hela kampanjen, 3 dygn | 2 017 kr | 1 | 0,24 | långt under — men 1 köp är ingen dom |

**Bedömbara annonser: 0.** Ingen annons har ≥ 300 kr OCH ≥ 3 köp. Ingen dom,
ingen ranking, ingen feedback-loop. Hypoteser, aldrig domar:

- **GT (present) tog 77 % av spenden (1 561 kr) med 1 köp, CPA 629 kr.** GT-
  videorna har kampanjens bästa hook rates (H2 37,2 %, H3 31,8 %) men CPC 9–10 kr
  och CVR 0 på H2/H3. Hypotes: presentvinkeln stoppar scrollen men säljer inte
  — annonsen lovar en gåva, sidan säljer ett tankskydd till köparen själv.
- **PD_1_H1, den ärvda vinnaren (77 köp i källan), fick 29 kr och hook 20,5 %.**
  CBO:n gav den aldrig chansen. Ärvd hypotes 1 (PD bär TankGuard) är
  **obesvarad**, inte falsifierad.
- **17 annonser står WITH_ISSUES.** Metas flagga; orsaken syns bara i Ads
  Manager. Ingen rörs av rutinen.

### Ärvd variabeltabell (ÄRVD — Bäverbutiken SE, hela livstiden, dömd mot TankGuards BE-CPA 334 kr)

| Variabelvärde | Annonser | Spend | Köp | Vinstbidrag | Slutsats |
|---|---:|---:|---:|---:|---|
| Vinkel PD (produktdemo) | 9 | 18 281 kr | 81 | 9 634 kr | **bevisad** (PD_1_H1 ensam: 16 997 kr, 77 köp, +8 701 kr) |
| Vinkel CS (erbjudande) | 5 | 759 kr | 4 | 692 kr | **bevisad i NO** (CS_1_H3: 4 614 kr, 20 köp, +2 066 kr mot 334) — i SE bara 3 köp, hypotes |
| Format video | 14 | 18 639 kr | 86 | 10 326 kr | **bevisad** — alla köp i SE är video |
| Format bild | 20 | 929 kr | 0 | −929 kr | **hypotes**: bild replikerar inte (PD_2_1 362 kr / 0 är enda över grinden) |
| Vinkel SP (social proof) | 4 | 200 kr | 1 | – | otestad (SP_1_H3 89 kr / 1 köp) |
| Vinklar CO, BOF, GT, RV | 16 | 329 kr | 0 | – | otestade i källan; GT fick sin första riktiga spend först på TankGuard (ovan) |

Norge (ÄRVD, BE-CPA 284 där): PD 4 958 kr / 21 köp, CS 4 905 kr / 20 köp — samma
två vinklar, omvänd ordning. Används bara som mönster, aldrig för budget.

**ÄRVD, läst live 2026-09-12** (`skalning.mjs --arv`, Bäverbutiken SE, hela
livstiden, 1 684 rader): de tre bedömbara källannonserna vinner fortfarande —
`IBC_PD_1_H1` **21 887 kr / 94 köp**, `IBC_PD_Extra` 1 214 kr / 7 köp,
`IBC_CS_1_H3` 655 kr / 3 köp. Källkampanjen skalar vidare medan TankGuards
kopia står pausad.

### Fyra mönster → instruktion i batch #1

1. **Bevisad (ärvd):** produktdemon med problemet i kundens ord bär allt (93 % av
   källans vinstbidrag). → `PD_7_H1` / `PD_7_H2`: samma film, två nya hooks
   (problemet vs orsaken), EN variabel var. Kontroll = originalöppningen.
2. **Bevisad (ärvd, NO) / hypotes (SE):** erbjudandevinkeln håller högst ROAS med
   volym. **Rotorsak:** källans rabatt (23 % mot 636 kr) finns inte här och 636 kr
   är förbjudet; paketpriserna A/B-testas på sidan. → `CS_6_H1`: bonusen
   (2 kranskydd) som erbjudande, aldrig ett paketpris.
3. **Hypotes (ärvd + OPS):** bild replikerar inte (0 köp på 20 bilder i källan;
   BOF_2_1 125 kr / 0 på TankGuard). → Max 1 av 7 i batch #1 är bild, och den
   bär före/efter-konflikten (`FE_1_1`), inte en funktionslista.
4. **Hypotes (OPS):** hög hook rate utan köp (GT 32–37 %, CVR 0) = öppningen
   lovar fel sak. → Varje ny hook i batch #1 öppnar med tanken/vattnet/vädret
   som köparen själv äger — ingen present, ingen tredje person. `SP_4_H1`,
   `UV_1_H1`, `PR_1_H1` testar tre nya öppningar med samma regel.

### Copy-modell A/B (Axels beslut 2026-09-10)

Registret säger `copy_modell: ab`. Batch #1: 4 briefer `copy_model: fable`
(PD_7_H1, CS_6_H1, SP_4_H1, FE_1_1), 3 `copy_model: sonnet` (PD_7_H2, PR_1_H1,
UV_1_H1). Väg: Agent-verktyget (`model: "fable"` / `"sonnet"`), samma system-
prompt som `tools/copy-agent.mjs`. Ställning: **0 bedömbara annonser per
modell** — avgörs när båda har ≥ 5 bedömbara.

### Rotorsaker att bära vidare

- **Kampanjen är pausad och 17 annonser är flaggade.** Batch #1:s briefer blir
  annonser först när någon i Ads Manager läser flaggan och sätter kampanjen
  ACTIVE igen — rutinen aktiverar aldrig. Står kampanjen pausad nästa briefdag
  är ronden fortfarande kallstart.
- **Sidan och annonsen säger olika pris.** Jämförpris 636 kr på sidan, paket-A/B
  på sidan, "2 för 799 kr" i de ärvda annonstexterna. Ägarbeslut (STATUS.md
  punkt 2) — tills det är fattat säger nya annonser bara 489 kr.
- **De ärvda mastrarna säger "Bäverbutiken" i ljud och slutkort.** Varje
  TankGuard-version måste dubbas om från `srt-se/` och få TankGuard-slutkortet
  — brief-regeln står i varje brief i batch #1.
