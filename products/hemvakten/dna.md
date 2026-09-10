# Creative DNA — HeimGuard (övervakningskameran)

Skapad 2026-09-08 av `/ny-annonser` (körning nr 1).
**Senast uppdaterad 2026-09-11 av `/notionscalercs hemvakten` — körning nr 2, första briefdagen.**
Butiks-id `hemvakten`, brand **HeimGuard**, heimguard.se.

⚠️ **All prestandadata under "Vad som är bevisat" är ÄRVD från Bäverbutiken.**
HeimGuards egen kampanj har körts 2026-09-08 → 2026-09-10 (3 dygn): **4 207 kr,
5 köp, ROAS 1,65** mot break-even 1,49. **0 av 38 annonser har passerat
signifikansgrinden** (≥ 300 kr OCH ≥ 3 köp) — körning nr 2 är en **KALLSTART**:
ingen feedback-loop, ingen dom över en enda HeimGuard-annons. Se avsnittet
"Körning nr 2" längst ned.

---

## Produkten och kunden

Övervakningskamera, dubbellins PTZ, 355° panorering, AI-persondetektering som
skiljer människor från djur och grenar, direktnotis i mobilen, utomhus året om.

**Kunden:** villa- och radhusägare 35–65 som hör ljud på tomten om natten och
hellre kollar mobilen än går ut. Trötta på kameror som larmar på katter och grenar.

**Grundkonflikten:** att inte veta är värre än att veta. Produkten byter ovisshet
mot bild.

---

## Vad som är bevisat (ärvt från källan, 23 798 kr spend, 60 köp)

| Vinkel | Kod | Spend i källan | Dom |
|---|---|---:|---|
| Social proof — kundernas omdöme | SP | 14 005 kr | **Bevisad.** Bär 59 % av spenden. `SP_2` ensam: 13 338 kr, ROAS 2,89, 34 köp. |
| Erbjudandet — 799 mot 1 000 kr | CS | 8 735 kr | **Bevisad.** `CS_3`: ROAS 3,44 på 5 010 kr — högst av alla. |
| Problem/lösning — ljudet på tomten | PD | 368 kr | Otestad. Under grinden. |
| Listan — fem funktioner samtidigt | LI | 291 kr | Otestad. |
| Jämförelse — fast kamera mot PTZ | CO | 164 kr | Otestad. |
| Garanti/trygghet | BOF | 86 kr | Otestad. |
| Auktoritet — teknikern visar | AU | 72 kr | Otestad. |
| Present | G | 52 kr | Otestad. |
| Notisen | RI | 27 kr | Otestad. |

**Mönster 1 — två vinklar bär allt.** SP och CS står för 96 % av källans spend.
De sju andra har aldrig fått chansen. Det är inte samma sak som att de är dåliga,
och en `/cs` som dömer ut dem på nuvarande data bryter mot analysmetoden.

**Mönster 2 — samma copy, olika creative, olika utfall.** `CS_2` och `CS_3` har
IDENTISK copy. ROAS 2,34 mot 3,44. Skillnaden ligger i videon, inte i texten.
Slutsatser om copy får inte dras ur den skillnaden.

**Mönster 3 — bildversionerna av vinnarna har inte replikerat.** `SP_2_1`
(bild, samma copy som SP_2) fick 295 kr och 1 köp; `CS_2_1` fick 388 kr och 0 köp.
För tunt för en dom, men det är den första frågan att ställa när data finns.

---

## Vad HeimGuard ändrade, och varför det gör datan icke-jämförbar

1. **Social proofen byttes.** Källan skrev "Tusentals nöjda hushåll i Sverige har
   redan bytt ut sina gamla system" och ett kundcitat ingen kund sagt. HeimGuard
   är en ny butik med tio recensioner och kan inte påstå något av det. Copyn
   bygger nu på de tio riktiga femstjärniga omdömena.
   ⚠️ Detta ändrar den bevisade toppannonsens bärande rad. Behandla `SP`-utfallet
   hos HeimGuard som en **ny hypotes**, inte som en fortsättning på källans.
2. **Brådskan togs bort.** "🚨 Bara idag", "snart slut", "missa inte rean" krockar
   med brandets uttalade tonläge (saklig, lugn, inga utropstecken) — och var
   dessutom falskt: 799 kr är butikens stående pris.
3. **Fraktlöftet rättades.** Källan lovar fri frakt över 300 kr. HeimGuard har fri
   frakt utan gräns.
4. **Priset rördes inte.** 799 / 1 000 kr är identiskt i båda butikerna.

---

## Ekonomin — AVGJORD 2026-09-09 (Axels besked)

Pris 799 kr · inköp 261 kr · **TB 538 kr · BE-ROAS 1,49 · BE-CPA 538 kr ·
target-ROAS 2,36 / target-CPA 338 kr**, räknat **UTAN moms** — samma regel som
Bäverbutiken och Grillkliniken (`ekonomi.moms_antagen: false` i
`factory/produkter/overvakningskameran.yaml`). Den linjen gäller för kill-beslut.

⚠️ Kampanjnamnet i kontot säger fortfarande "BE-ROAS 2,11" (det gamla
med-moms-talet). Namnet är en etikett, inte facit — skripten läser produktfilen.

---

## Rotorsaker och fallgropar för nästa körning

- **Kontot bär flera verksamheter.** `915422744950975` innehåller både HeimGuards,
  TankGuards och Bäverbutikens danska kampanjer. Varje uppslag måste filtrera på
  `HEIMGUARD_` — annars läses en annan butiks annonser som om de vore samma produkt.
- **Ingen commission utgår på den här butiken i dag.** Kontot står i
  `UTLANDSKA_KONTON` i `commission/berakning.mjs`. Det är känt och ligger som
  Uppdrag D i `factory/FAS2.md`, inte som ett fel att rätta här.
- **Norska halvan är inte byggd.** Butiken tar betalt i SEK på /nb medan
  Bäverbutikens norska annonser är prissatta i NOK. Se batch-loggen.

---

## Körning nr 2 — 2026-09-11, första briefdagen (`/notionscalercs`)

### Vad HeimGuards egen kampanj visar (data, 2026-09-08 → 2026-09-10)

Kampanj `HEIMGUARD_SE_Övervakningskameran`, konto `915422744950975`, 38 annonser
i 9 adsets (CBO, 1 000 kr/dag, sänkt till 700 kr av budgetronden 2026-09-11).

| | Spend | Köp | ROAS | Mot BE 1,49 |
|---|---:|---:|---:|---|
| Hela kampanjen, 3 dygn | 4 207 kr | 5 | 1,65 | över break-even, under target 2,36 |

**Bedömbara annonser: 0.** Ingen annons har ≥ 300 kr OCH ≥ 3 köp. Ingen dom,
ingen ranking. Det som ändå går att se — märkt **hypotes**, aldrig dom:

- **`LI_1_1` (bild, listan) tog 49 % av spenden (2 045 kr) med 0 köp** och
  adsetet pausades 2026-09-10 19:04 (inte av rutinen — ett beslut, rörs aldrig).
  CTR 2,3 % men CVR 0. Hypotes: listicle-bilden köper klick som inte konverterar.
  Under grinden på köp, men 2 045 kr utan köp är 3,8 × break-even-CPA.
- **`PD_2` (video, nattljudet) har kampanjens bästa hook rate bland annonser med
  > 100 kr: 43,1 %** (ärvda SP_2: 34,0 %), 749 kr, 2 köp, CVR 1,5 %. Hypotes:
  problemöppningen "Ett ljud på tomten klockan tre" stoppar scrollen bäst.
- **`SP_2`, den ärvda toppannonsen, har bara fått 34 kr på HeimGuard.** CBO:n
  har inte gett den chansen än. Hypotes 1 från batch #1 (håller SP med tio
  riktiga recensioner?) är alltså **obesvarad**, inte falsifierad.
- Spendfördelning per vinkel på HeimGuard: LI 2 045 · PD 847 · CS 636 · SP 229 ·
  BOF 162 · AU 149 · CO 102 · RI 27 · G 10 kr. Jämför källan: SP 15 662 · CS 12 556.
  Metas fördelning på HeimGuard är ännu inte en dom över något.

### Ärvd variabeltabell (ÄRVD — Bäverbutiken, hela livstiden, dömd mot HeimGuards BE-CPA 538 kr)

| Variabelvärde | Annonser | Spend | Köp | Vinstbidrag | Slutsats |
|---|---:|---:|---:|---:|---|
| Vinkel SP (social proof) | 13 | 15 662 kr | 40 | 5 055 kr | **bevisad** (SP_2 ensam: 14 851 kr, 37 köp) |
| Vinkel CS (erbjudande, pris i sek 0–3) | 7 | 12 556 kr | 29 | 2 710 kr | **bevisad** (CS_3 16 köp + CS_2 10 köp) |
| Format video (de tre bedömbara är alla video) | 3 | 26 129 kr | 63 | 7 765 kr | bevisad |
| Format bild av vinnarvinkel (SP_2_1, CS_2_1, CS_4_1) | 3 | 1 131 kr | 2 | — | **hypotes**: replikerar inte |
| Övriga vinklar (PD, LI, CO, BOF, AU, G, RI) | 19 | 1 250 kr | 3 | — | otestade, ingen dom |

### Tre mönster → instruktion i batch #2

1. **Bevisad (ärvd):** social proof i video bär allt (65 % av källans vinstbidrag).
   → Batch #2 kör SP_2:s film med två nya hooks (`SP_17_H1`/`H2`) och en
   bildversion (`SP_18_1`) — tre varianter, EN variabel var.
2. **Bevisad (ärvd):** pris i första 3 sekunderna konverterar (CS_3 ROAS 3,02).
   **Rotorsak upptäckt 2026-09-11:** CS_2/CS_3:s VOICEOVER säger "sista chansen",
   "priset går upp snart", "fri frakt över trehundra kronor" — falskt på HeimGuard
   (stående pris, fri frakt utan gräns). Brand-detektorn kollade bara brandnamnet
   i talet, inte påståendena. → `CS_11_H1`: samma film, ny VO utan brådska.
3. **Hypotes (ärvd + OPS):** bildversioner av vinnarna replikerar inte (295 kr/1 köp,
   388 kr/0), och HeimGuards `LI_1_1` bränner 2 045 kr utan köp. → Max 1 av 7 i
   batch #2 är bild, och den bär recensionsbeviset i stället för en funktionslista.
4. **Hypotes (OPS):** problemöppningen (`PD_2`, hook 43 %) stoppar bäst. → `SP_17_H2`
   öppnar SP-filmen med nattljudet; `TR_1_H1` bygger hela konceptet på det.

### Copy-modell A/B (Axels beslut 2026-09-10)

Registret säger `copy_modell: ab`. Batch #2: 4 briefer `copy_model: fable`
(SP_17_H1, SP_18_1, TR_1_H1, FD_1_H1), 3 `copy_model: sonnet` (SP_17_H2,
CS_11_H1, SR_1_H1). Ställning: **0 bedömbara annonser per modell** — avgörs
när båda har ≥ 5 bedömbara.

### Rotorsaker att bära vidare

- **Talet i de ärvda CS-videorna motsäger butiken** (se mönster 2). Innan fler
  ärvda videor skalas: läs SRT:n mot butikens villkor, inte bara mot brandnamnet.
- **`Fri frakt över 300 kr` och `bara idag` finns kvar i VO trots att copyn rättades.**
  Copy och tal måste rättas som par.
