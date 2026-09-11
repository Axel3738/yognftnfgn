# Creative DNA — TackleBay, Fiskespöhållare 4-Pack

Skapad 2026-09-11 av `/notionscalercs setup tacklebay/fiskespohallare-4-pack`
(körning nr 1 — setup, ingen briefrond).
**Senast uppdaterad 2026-09-12 — körning nr 2, första briefronden (KALLSTART).**
Nyckel `tacklebay/fiskespohallare-4-pack`, brand **TackleBay**, tacklebay.se.

⚠️ **All prestandadata under "Vad som är bevisat" är ÄRVD från Bäverbutiken.**
TackleBays egen kampanj startade 2026-09-10 och hade vid avläsningen 2026-09-11
**177 kr, 0 köp, 0 av 23 annonser över grinden** (≥ 300 kr OCH ≥ 3 köp). Första
briefronden blir en **KALLSTART**: ingen feedback-loop, ingen dom över en enda
TackleBay-annons.

Källa för allt ärvt: Meta Graph 2026-09-11, `date_preset: maximum`, konto
MagiBorsten `1867947880635861` (Bäverbutiken — **LÄSES bara**), prefix
`Rodholder`, kampanj `Fiskespöhållaren | BE ROAS 1.50 | Launch 2026-08-18`.
Rådata: `factory/skalning.mjs tacklebay/fiskespohallare-4-pack --dagar 90 --arv --marknad SE --json`.

---

## Produkten och kunden

Klämma som låser runt ett ihopfällt spö i två steg (första sektionen, sedan
andra låset), hög-elastisk svamp inuti, fyra i ett set, 289 kr. Håller
spökroppen och linan stilla **under transport** — bil, båt, stuga.

**Kunden:** sport- och fritidsfiskare 30–65 som kör till vattnet med spön i
bilen eller båten. Säger "spö" och "drag", vet vad en ny topp kostar.

**Grundkonflikten:** det som går sönder händer på vägen dit, inte vid vattnet.

⚠️ **Källans produkttext är fel och får inte ärvas** (`factory/produkter/
tacklebay-spohallaren.yaml`, rättad 2026-09-09 mot leverantörens bilder):
Bäverbutiken skriver "monteras på vägg eller i båten". Produkten är en
transportklämma — ingen skruv, ingen vägg. Ärvda briefer säger ändå "Båt, bil,
garage, vägg" (`Rodholder_PD_40_H1`, 2026-09-10). **TackleBay-copy nämner
aldrig väggmontering.**

---

## Vad som är bevisat (ÄRVT — 73 annonser, 20 149 kr, 85 köp, ROAS 1,84)

Signifikansgrinden (≥ 300 kr OCH ≥ 3 köp) passeras av **fem** annonser. De
övriga 68 är oprövade, inte dåliga.

### De fem bedömbara, dömda mot TackleBays linjer (BE-CPA 294 kr · BE-ROAS 1,49 — Axels tal 2026-09-11)

| Ärvd annons | Format | Spend | Köp | CPA | ROAS | Vinstbidrag `(294 − CPA) × köp` | Mot BE-ROAS 1,49 | Hook 3 s | Hold | CTR |
|---|---|--:|--:|--:|--:|--:|---|--:|--:|--:|
| `Rodholder_PD_15_H1` | video | 9 268 kr | 39 | 238 kr | 1,94 | **+2 184 kr** | ✅ över | **52,0 %** | 16,4 % | 2,63 % |
| `Rodholder_PD_6_1` | **bild** | 2 801 kr | 20 | **140 kr** | **3,02** | **+3 080 kr** | ✅ över | — | — | 1,53 % |
| `Rodholder_PD_16_H1` | video | 2 651 kr | 10 | 265 kr | 1,52 | +290 kr | ✅ strax över | 30,6 % | 23,3 % | 2,12 % |
| `Rodholder_PD_11_H2` | video | 1 922 kr | 6 | 320 kr | 1,49 | −156 kr | = break-even | 33,4 % | 15,5 % | 2,23 % |
| `Rodholder_SO_4_1` | bild | 808 kr | 3 | 269 kr | 1,44 | +75 kr (prel., 3 köp) | ❌ strax under | — | — | 2,88 % |

*Avläst igen 2026-09-12 (`skalning.mjs --arv`, date_preset maximum) — källkampanjen
spenderar fortfarande: `PD_6_1` 2 941 kr / 20 köp / CPA 147 kr / ROAS 2,87
(+2 939 kr) · `PD_15_H1` oförändrad (+2 198 kr) · `PD_16_H1` 2 769 kr / 10 /
277 kr / 1,46 (+171 kr) · `SO_4_1` oförändrad (+74 kr) · `PD_11_H2` −158 kr,
klassad förlorare av skriptet på 6 köp — preliminärt (ANALYSMETOD 2c).
Ordningen håller; inga trasiga rader (`spend × ROAS` mot `values`).*

**Två vinnare, en på gränsen, två i brus.** `PD_6_1` bär 55 % av det ärvda
vinstbidraget på 13 % av spenden; `PD_15_H1` är volymen. `PD_11_H2` och
`SO_4_1` hamnar på var sin sida om noll beroende på linje — det är per-annons-AOV
som skiljer (linjen räknar med 437 kr per order, en enskild annons kan sälja
fler singlar). Ingen av dem är en förlorare på den här datan.

*(Historik: setup-versionen 2026-09-11 morgon räknade mot BE-CPA 173 kr på
styckpris 289 och gissad COGS 116 kr, vilket gjorde `PD_15_H1` till −2 521 kr.
Axels besked samma dag rättade båda talen — se "Ekonomin".)*

### Mönster 1 — PD (produktdemo) är hela kontot. **Bevisad.**

| Vinkel | Annonser | Spend | Köp | CPA |
|---|--:|--:|--:|--:|
| PD — demo | 49 | 18 001 kr | 77 | 234 kr |
| SO — social proof | 2 | 1 143 kr | 5 | 229 kr |
| CS — erbjudande | 1 | 647 kr | 2 | 323 kr |
| PROD — produktbild | 10 | 194 kr | 1 | — |
| REA — rea | 10 | 142 kr | 0 | — |
| GT — garanti/trygghet | 1 | 23 kr | 0 | — |

PD står för 89 % av spenden och 91 % av köpen. Alla fem bedömbara utom `SO_4_1`
är demo. **Top spendern `PD_15_H1` är benchmark, inte en kandidat att döma
småannonser mot** (ANALYSMETOD steg 5).

### Mönster 2 — Demon som stillbild konverterar. **Bevisad (en annons, 20 köp).**

`PD_6_1`:s egen hypotes (brief 2026-08-21): *"demo-vinkeln äger 87 % av
vinstbidraget men har bara körts som video — konverterar den som statisk?"*
**Svar: ja.** ROAS 3,02 på 2 801 kr, CPA 140 kr — bäst i hela kontot på båda
linjerna. Formatlinjen totalt: video 48 annonser / 15 204 kr / 58 köp (CPA
262 kr) mot bild 25 / 4 945 kr / 27 köp (CPA 183 kr). ⚠️ Bildsnittet bärs av
`PD_6_1` ensam — det är ett bevis för DEN bilden, inte för bild i allmänhet.

Bildens text (facit, ordagrant): **"Ett klick. Spöet stängt."** /
"Hårdplast och skumgummi håller spöet säkert stängt." / "4-pack 289 kr – beställ
idag". Macro på klämman stängd runt ett ihopfällt spö, brygga/båtkant, produkten
störst i bild, ingen rabatt.

### Mönster 3 — Skaka-testet stoppar scrollen bäst. **Bevisad som hook, inte som hold.**

`PD_15_H1` = "Skaka-testet" (brief batch #3 DEMO GRIND): spöt klämt, vänds
upp och ner, skakas — inget öppnar sig. Ingen text, ingen VO, produkten i bild
från sekund 0, 8–15 s. **Hook rate 52,0 %** — högst av allt med volym (nästa:
33,4 %). Men **hold 16,4 %** är lägst av de bedömbara videorna (`PD_16_H1`:
23,3 %). Filmen vinner de första tre sekunderna och tappar sedan. Det är
diagnosen av VAR den tappar — inte ett skäl att döda den.

### Mönster 4 — Winning line (primary text, bevisad — bar 85 köp)

Samma brödtext ligger under alla PD-vinnarna, ordagrant:

> Trassliga fiskespön i båten – igen? 🎣
> Den här lilla klämman löser det på 1 sekund.
> ✅ Håller ihopfällda spön säkert stängda
> ✅ Inga fler trassliga linor
> ✅ Passar alla spön
> Beställ ditt 4-pack idag och slipp trasslet för gott. 👇

Rubrik: **"Aldrig mer trassliga fiskespön"**. CTA SHOP NOW. Ingen rabatt,
ingen brådska, ingen social proof. Raden klarar tre-frågorstestet (visualisera:
ja · falsifiera: ja · ingen annan kan säga det: klämman är produktens särdrag).

### Otestat (ingen dom)

SO (2 annonser), CS (1), GT (1), REA (10 med 142 kr totalt), PROD (10 med
194 kr). REA- och PROD-serierna (`_V01`–`_V10`) är produktbilder utan vinkel och
har aldrig fått pengar — de är inte förlorare, de är oprövade.

---

## Vad TackleBay ändrade, och varför det gör datan icke-jämförbar

1. **Vinkeln bytte riktning.** Källan säljer "förvaring/ordning" och nämner
   väggmontering. TackleBay säljer **transportskadan** (leverantörens egna
   bilder: "förhindrar kollision eller trassel av spökroppen under transport").
   Winning line ovan är förenlig med det — "trassliga spön i båten" är transport.
   Men "vägg"/"garage"/"montera" stryks ur allt som ärvs.
2. **Social proof är tunnare.** Källan har 7 Judge.me-recensioner (alla 5 ★,
   korta: "stabil", "sparar plats", "spöna sitter bra"). TackleBay startar med
   samma sju. Inga "tusentals nöjda" — det finns inte.
3. **Priset är identiskt: 289 kr, inget jämförpris.** Källans briefer förbjuder
   149 kr / 148,75 kr / procentrabatter — regeln gäller här också.
4. **Bundles finns i båda butikerna** (2-pack −15 %, 3-pack −20 %). Det är
   därför AOV:n är 437 kr och inte 289.
5. **Länken** pekar på tacklebay.se/products/fiskespohallare-4-pack, aldrig
   bäverbutiken.se.
6. **Tonläget** (butikskonfigen): rak och torr, inga utropstecken, ingen hype.
   Emojis i winning line (🎣 ✅ 👇) är källans — pröva raden både med och utan
   innan de stryks; de har spenderat pengar bra.

---

## Ekonomin — AVGJORD 2026-09-11 (Axels besked)

Räknas **per order, på verklig snittorder** (Axel: "break even räknas på
produktens bundles osv"), UTAN moms (Axel 2026-09-09):

| | Tal | Källa |
|---|--:|---|
| Styckpris | 289 kr | produktsidan |
| Snittorder (AOV) | **437 kr** | Bäverbutikens Meta-data 2026-09-11, 85 köp — TackleBay har 0 köp än |
| Inköp per 4-pack | **62,78 kr** | Axel 2026-09-11 |
| Varukostnad per order | 109 kr | 1,73 enheter/order härlett ur paketnivåerna (−15 % / −20 %) |
| Övrigt per order | 34 kr | **3 EUR per order** (Axel 2026-09-11), ECB 11,1995 |
| **Täckningsbidrag** | **294 kr** | |
| **BE-ROAS / BE-CPA** | **1,49 / 294 kr** | `factory/ekonomi.mjs` |
| Target-ROAS / target-CPA | 2,37 / 185 kr | 25 % målmarginal |

Facit: `factory/produkter/tacklebay-spohallaren.yaml` (`aov_sek`,
`varukostnad_per_order`, `ovriga_kostnader_per_order`), och det är den linjen
`factory/budgetrond.mjs` dömer mot från och med natten 2026-09-11.

⚠️ **Kampanjnamnet i kontot säger `BE-ROAS 1,67`** — räknat på den gamla
gissningen. Namnet är en etikett, inte facit; döm aldrig mot det.
⚠️ **AOV:n är lånad från källan.** När TackleBay har ≥ 20 egna köp: räkna om
`aov_sek` ur butikens egen data och uppdatera enhetstalet.
⚠️ **Eurokursen står fast i filen** (11,20). Rör sig kursen mer än ~5 % ändras
break-even-CPA med ~2 kr — inte akut, men räkna om vid nästa `/cs`.

---

## Rotorsaker och fallgropar för nästa körning

- **Kampanjnamnet bär brandet, annonserna bär produkten.** Kampanjen heter
  `TACKLEBAY_SE_Spöhållaren | BE-ROAS 1,67 | 2026-09-10`, annonserna
  `TackleBayRod_…`. Kampanjfiltret i `budgetrond.mjs` läste bara kampanjnamnet
  och fann 0 av 16 kampanjer (mätt 2026-09-11 i setup) — lagat samma dag:
  kampanjen hittas nu via annonserna (`valjKampanjer`). Grannprodukten
  (`TackleBayKalender_`) släpps aldrig in via brandet.
- **Hubben `Fish rod holder` är delad historia.** 80 rader per 2026-09-11,
  varav Bäverbutikens redigerare fortfarande levererar dit (`Rodholder_PD_40_H1`
  i `To be Reviewed` 2026-09-10 med bäverbutiken.se som landningssida). Hubben
  är inskriven på TackleBay i OPS-registret, så Bäverbutikens rutiner hoppar
  över den. **Axels beslut 2026-09-11: "TackleBay tar dom"** — allt som
  levereras i hubben är TackleBays. Konsekvens: raderna i `To be Reviewed`
  ska brand-swappas (länk → tacklebay.se, inget "vägg" i tal/text) och upp i
  `TACKLEBAY_SE_Spöhållaren` — ingen rutin gör det i dag, se backloggen. **Upptagna AD-ID:n (båda namnrymderna):** PD ≤ 41, SO ≤ 7, SP ≤ 9,
  CS ≤ 6, GT ≤ 4, JF ≤ 3, KL 1, TR 1, GA 1 (hubben) + OPS-kontots
  `TackleBayRod_` PD 1/2/3/6/7/15/23, SP 1, CS 3, GT 2/3, PROD V01–V10, REA
  V02/V08. Nya TackleBay-namn numreras ovanför hubbens högsta per vinkel.
- **Källans tre största videor ligger INTE i TackleBays kampanj.** `PD_15_H1`
  (39 köp), `PD_16_H1` (10) och `PD_11_H2` (6) saknas; `PD_15_H2` finns.
  Skälet är inte loggat (`hypotes: ej loggad`) — troligen brand-detektorn
  (inbränd text/tal), men det är en gissning. Står i backloggen som arbete.
- **Kontot bär flera verksamheter.** `915422744950975` innehåller HeimGuard,
  TankGuard, DryTrek, AdventLane, TackleBay och Bäverbutikens danska kampanjer.
  Varje uppslag filtreras på `TackleBayRod` — annars döms en annan produkt.
- **Ingen commission utgår på den här butiken i dag** (kontot står i
  `UTLANDSKA_KONTON`, FAS2 uppdrag D). Känt, inte ett fel att rätta här.
- **Norska kampanjen** `TACKLEBAY_NO_Spöhållaren` (9 annonser) döms separat
  med `--marknad NO` — aldrig i samma tabell som SE.

---

## Körning nr 2 — 2026-09-12, första briefronden: KALLSTART

**Ingen feedback-loop — ingen bedömbar annons än.** Avläst ur Meta (OPS-kontot
`915422744950975`, prefix `TackleBayRod`, last_14d, `factory/budgetrond.mjs`
2026-09-12): **52 annonser, 768 kr, 1 köp, 6 348 visningar.** Kampanjen har
två dygn (180,99 kr 2026-09-10 · 586,90 kr / 1 köp 2026-09-11). Grinden
(≥ 300 kr OCH ≥ 3 köp) passeras av 0 annonser. Vinstbidrag: 0 kr. Ranking:
ingen. Budgetronden gjorde 0 ändringar (kampanjen 1 000 kr/dag, "för tidigt").

Metrik-diagnos på de största, **som pekare, aldrig som dom** (0 köp bakom var
och en):

| Annons | Spend | Köp | Hook 3 s | Hold p50 | CTR | CPC | CPM |
|---|--:|--:|--:|--:|--:|--:|--:|
| `TackleBayRod_B_PD_EXTRA` | 167 kr | 0 | 29,0 % | 16,4 % | 2,41 % | 5,37 kr | 130 kr |
| `TackleBayRod_PD_1_H1` | 126 kr | 0 | 30,2 % | 16,1 % | 1,25 % | 11,49 kr | 143 kr |
| `TackleBayRod_PD_1_H2` | 92 kr | 0 | 28,5 % | 17,4 % | 1,65 % | 6,55 kr | 108 kr |
| `TackleBayRod_SP_1_H3` | 83 kr | 0 | **39,0 %** | **31,9 %** | **3,11 %** | 4,60 kr | 143 kr |
| `TackleBayRod_PD_16_H2` | 61 kr | 0 | **49,4 %** | 17,6 % | 2,34 % | 3,61 kr | 85 kr |
| `TackleBayRod_PD_22_H1` | 14 kr | **1** | — | — | — | — | — |

Det enda köpet sitter på `PD_22_H1` för 14 kr — brus, ingen slutsats. Två
pekare att läsa igen när det finns pengar: `SP_1_H3` (bäst hold + CTR, som
i setup-avläsningen) och `PD_16_H2` (hook 49 % — samma familj som ärvda
`PD_16_H1`, bäst hold av källans videor).

**Hela batch #2 är därför nya koncept ur ärvd DNA + backloggen** (7 briefer,
ingen redigerare tilldelad ⇒ 7 i stället för kadensens 21): 3 varianter av de
två ärvda vinnarna (`PD_15_H1`, `PD_6_1`), 2 nya koncept med källa, 2 märkta
gissning. Se batch-log.md batch #2.

### Mönster → instruktion i batch #2 (ANALYSMETOD 6b, ärvda mönster)

| Mönster | Status | Instruktion i briefen |
|---|---|---|
| 1. PD/demo bär 91 % av köpen | **bevisad** (5 bedömbara, ärvda) | 5 av 7 briefer är demo; SO och CS märkta gissning |
| 2. Demon som stillbild konverterar | **bevisad för DEN bilden** (`PD_6_1`, 20 köp) | Två syskon isolerar var sin variabel: `PD_43_1` scen, `PD_44_1` rubrik — allt annat ordagrant |
| 3. Skaka-testet vinner hooken, tappar holden | **bevisad som hook** (52 %), hold-diagnos hypotes | `PD_42_H1`: samma 0–3 s, mitten byts mot mekanism-macro; KPI = hold > 16,4 % |
| 4. Winning line (85 köp) | **bevisad** | Ordagrann primary text + rubrik i alla tre varianterna; nya koncept skriver i samma register |

### Copy A/B Fable mot Sonnet — ställning 2026-09-12
Registret säger `copy_modell: ab`. Batch #2: **Fable 3** (`PD_42_H1`,
`PD_45_H1`, `SO_8_1`) · **Sonnet 3** (`PD_44_1`, `PD_46_H1`, `CS_7_1`) ·
**ärvd 1** (`PD_43_1` — varje rad ordagrann från vinnaren, ingen ny copy).
Bedömbara per modell: 0 / 0. Avgörs när båda har ≥ 5 bedömbara annonser.
Vägen: Agent-verktyget fanns i sessionen (`model: "fable"` resp. `"sonnet"`),
med exakt samma systemprompt och uppdragstext som `tools/copy-agent.mjs --torr`
skriver ut.

---

## TackleBays egen kampanj — läget 2026-09-11 (data, ingen dom)

`TACKLEBAY_SE_Spöhållaren | BE-ROAS 1,67 | 2026-09-10`, 4 adsets (PD, SP, CS,
GT), 23 annonser ACTIVE, 500 kr/dag. **177 kr, 0 köp.** Största: `PD_1_H1`
86 kr (hook 30,6 %, hold 15,6 %). `SP_1_H3` 11 kr med hook 43,1 % / hold 46,4 %
— brus på 11 kr, men det är första raden att titta på när det finns pengar.
Bedömbara: 0. Ingen ranking.
