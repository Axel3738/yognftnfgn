# Batch-log — Fiskespöhållaren (SE)

Retroaktivt rekonstruerad 2026-09-03 (ingen `products/fiskespohallaren/`
fanns innan — batch #1 och #2 är historiska, gjorda före minnessystemet).
Hypoteser för dessa två skrivs `hypotes: ej loggad (retroaktiv
rekonstruktion)` där de inte gick att återskapa ur Drive/Meta — gissa aldrig
vad någon tänkte, utfallen nedan är riktig data.

---

## Batch #1 — ~2026-08-12 (Drive: "batch #1", `10WK2ZKvDzCTMNf7RC6N2KkRs2UqqAhMv`)

Prefix `Fiskespöhållare_`. Innehöll PD_1(H1/H2/H3), PD_2_1, PD_EXTRA (video,
3 separata ad-ID:n under identiskt namn), CS_1(H1/H2/H3), CS_2_1, SO_1
(H1/H2/H3 + tre `ZZ_GAMMAL_..._(fel pris)`-varianter, redan pausade av
tidigare process), SO_2_1, SP_1(H1/H2/H3), SP_2_1, GT_1(H1/H2/H3), GT_2_1.
Ad-copy-dokument funna i Drive (`copy`-mappen): PD/CS/SO/SP/GT_Adcopy_1.

hypotes: ej loggad (retroaktiv rekonstruktion)

**Utfall (livstid, 2026-09-03):**
- `PD_1_H1`: 10 034 kr spend, 46 köp, ROAS 2,13 — TOP SPENDER, benchmark.
- `PD_EXTRA` (3 ad-ID:n, samma namn/manus): 9 159 + 4 219 + 9 130 kr spend,
  51+31+41=123 köp totalt — den enskilt starkaste kreativen i kontot,
  relanserad flera gånger.
- `CS_1_H1`: 5 490 kr, 40 köp, ROAS 3,15 — **högst vinstbidrag i hela
  kampanjen** (+9 055 kr).
- `CS_1_H3`: 423+327 kr på två ad-ID:n, ROAS 8,20 resp 2,07 — hög kvot, låg
  spend, regression-varning.
- `CS_2_1` (static): 907 kr, 3 köp, ROAS 1,08 — **sämsta bedömbara annons i
  hela kampanjen** (−380 kr vinstbidrag). Enda static-brådske-testet, och
  det förlorade.
- `SP_1/2`, `GT_1/2`: samtliga under 300 kr livstidsspend — **aldrig
  bedömbara**, trots tre veckor i kontot.
- `SO_1/2` (levande varianter): under 300 kr eller under 3 köp — för tidigt.
  `ZZ_GAMMAL`-varianterna (fel pris) pausade, korrekt beslut, rör ej.

---

## Batch #2 — ~2026-08-20/21 (Drive: "Batch #2"-mapp skapad 2026-08-21,
tom idag — se anmärkning nedan; "Content"-mapp med rått källmaterial
skapad samma dag)

Prefix växlar till `Rodholder_`. Detta är den batch som `/rond-auto` flaggade
som "14 dagar sedan" (2026-08-20/21 → 2026-09-03 ≈ 14 dygn, matchar).
Mycket stor batch: `PD_3`–`PD_30` (i H1/H2/H2_H1/H2_H2-undervarianter),
`PROD_V01`–`V10`, `REA_V01`–`V10`, `SO_3`, `SO_4`, `CS_3`, `GT_3` — över 50
nya annonsvarianter i en och samma kampanj.

hypotes: ej loggad (retroaktiv rekonstruktion)

⚠️ **Drive-mappen "Batch #2" är tom** — de faktiska filerna för denna våg
gick antingen aldrig upp till Drive, eller ligger på en annan plats som
inte hittades i denna körning. Briefernas ordagranna manus för
`Rodholder_*`-serien kunde därför INTE läsas ur Drive denna gång (till
skillnad från batch #1, där `PD/CS/SO/SP/GT_Adcopy_1` fortfarande finns).
Teardownet för batch #2 bygger på namn + prestanda, inte på läst manus —
sägs rakt ut här enligt regel 3 i CLAUDE.md.

**Utfall (livstid, 2026-09-03):**
- `Rodholder_PD_15_H1`: 9 268 kr, 39 köp, ROAS 1,94 — andra största
  spendern i batchen. **PAUSAD av tidigare process, med spend > 0 — rör ej.**
- `Rodholder_PD_6_1` (static): 1 773 kr, 14 köp, ROAS 3,36 — bästa
  static-annonsen i hela produktens historia.
- `Rodholder_PD_16_H1`: 2 005 kr, 8 köp, ROAS 1,50 — exakt på break-even,
  varken vinnare eller förlorare.
- `Rodholder_PD_11_H2`: 1 922 kr, 6 köp, ROAS 1,49 — svagt negativ, PAUSAD,
  rör ej.
- `Rodholder_SO_4_1` (static): 808 kr, 3 köp, ROAS 1,44 — svagt negativ,
  PAUSAD, rör ej.
- **Resten (~45 annonser: `PD_3`–`PD_30`-övriga, samtliga `PROD_V`/`REA_V`,
  `CS_3`, `SO_3`, `GT_3`) ligger under 300 kr livstidsspend var** — Metas
  leverans koncentrerade budgeten till en handfull av de över 50 nya
  varianterna. Ingen dom möjlig på de övriga. Det här är rotorsaken till
  att GT och SP fortfarande är obevisade trots att de funnits i tre veckor.

**Lärdom för batch #3 (denna körning):** en så stor samtidig batch
(50+ varianter i en kampanj) gör att nästan ingenting blir bedömbart. Håll
batch #3 vid rundans avsedda storlek och isolera variabler medvetet, i
stället för att sprida budgeten över många nya idéer på en gång.

---

## Batch #3 — 2026-09-03 (denna körning, `/rond-auto` steg 4b, behov
`brief_runda`, `rundaAntal: 4`)

Byggd på mönstren i Creative-teardownet i `dna.md`. 4 kärnannonser (rundan)
+ 3 BOF-bilder + 2 recension-bilder = 9 briefer totalt.

| Annons | Format | Koncept | Hypotes | Isolerad variabel |
|---|---|---|---|---|
| `Rodholder_PD_31_H1` | Video | PD (demo) | Bevisat budskap ("klämman löser trasslet"), aldrig testat med en vassare, konkret första sekund i stället för generisk fråga | Ny hook/öppning, samma kärnbudskap |
| `Rodholder_CS_4_H1` | Video | CS (brådska/rabatt) | Bevisat i video (ROAS 3,15 på `CS_1_H1`), ny variant för att bekräfta mönstret innan det skrivs in som bevisat | Ny rubrik/urgency-vinkel, samma format (video) som vann |
| `Rodholder_GT_4_H1` | Video | GT (gåva) | Aldrig fått riktig budget (0 bedömbara annonser trots 3 veckor) — nytt, eget material ger konceptet en verklig chans i auktionen | Helt nytt manus, inte återanvänd gammal creative |
| `Rodholder_PD_32_1` | Static | PD (demo, format-transfer) | `PD_6_1` bevisar att static kan bära PD-budskapet (ROAS 3,36) — testar en andra, oberoende static-vinkel på samma koncept | Ny visuell vinkel på samma bevisade PD-budskap, static-format |
| `Rodholder_SO_5_1` | Static, BOF | Pris/erbjudande | BOF enligt Axels regel (bilder är billiga) | — pris BLOCKER, se nedan |
| `Rodholder_GA_1_1` | Static, BOF | Garanti/fri frakt | BOF, bygger på tre bekräftat äkta, prisoberoende erbjudanden | — |
| `Rodholder_JF_1_1` | Static, BOF | Jämförelse/invändning | BOF, adresserar "funkar det för alla spötyper?" | — |
| `Rodholder_SP_3_1` | Static, review | Recension (Anders) | Riktig recension, ordagrant citat | — |
| `Rodholder_SP_4_1` | Static, review | Recension (Peter) | Riktig recension, ordagrant citat | — |

⚠️ **BLOCKER:** `Rodholder_SO_5_1` (pris/erbjudande-bilden) kan inte
publiceras med ett exakt pris förrän Axel bekräftat vilken av de tre
motstridiga siffrorna (149/269/289 kr) som gäller i dag — se `dna.md`.
Briefen levereras med ett tydligt ifyllnadsfält i stället för ett gissat tal.

Notion: alla 9 laddade som `Draft` i hubben "Fish rod holder"
(`collection://3c3270ab-908c-8356-ad6c-87ff779e647d`), Typ "Video - Pending
Approval" resp. "Image - Pending Approval".

Drive: batchmapp `Batch #3` skapad i produktens befintliga mapp
(`14-_uqZQnj4j_R-PqdUwZzZc2DPAenkhy`) med en Drive-länk i varje Notion-item
som komplement — se länk i respektive brief.

**Utfall:** ej avläst ännu (annonserna är briefer, inte launchade — nästa
`/cs`-körning läser av dessa när redigerarna levererat och de gått live).
