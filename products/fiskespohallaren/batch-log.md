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

**Utfall (avläst 2026-09-06, körning nr 2):** fortfarande INTE launchade.
Alla 9 items står `Status: Draft` i Notion (kontrollerat med
`notion-query-data-sources`), och ingen av de 9 ad-namnen finns i Meta-kontot
(kontrollerat med `campaign_id`-filtrering, `date_preset: maximum`).
Redigerarna har inte börjat producera batchen ännu. Ingen hypotes kan stämmas
av — flaggas till nästa `/cs`-körning i stället för att gissa ett utfall.

---

## Batch #4 — 2026-09-06 (denna körning, `/rond-auto` → `/cs`, 3-dagarsrundan,
`rundaAntal: 4` + 3 BOF + 2 recensioner = 9 briefer totalt)

Byggd på samma Winning/Losing DNA som batch #3 (ingen ny data att bygga på,
se "Feedbackloop 2026-09-06" i `dna.md` — batch #3 hann inte launchas).
Isolerade variabler valdes för att INTE krocka med batch #3:s ännu olästa
hypoteser (se tabellen: variabel skiljer sig från motsvarande batch #3-brief
där ett sådant finns).

| Annons | Format | Koncept | Hypotes | Isolerad variabel |
|---|---|---|---|---|
| `Rodholder_SP_5_H1` | Video | SP (social proof) | SP har aldrig fått video eller riktig budget (0 bedömbara på 3 veckor) — första video-testet ger konceptet en verklig chans | Talare/format: UGC-bekännelse i stället för anonym voiceover+broll |
| `Rodholder_PD_34_H1` | Video | PD (demo) | Bevisat budskap, aldrig testat med simultan split-screen-struktur i video (bara sekventiellt före/efter hittills) | Bevis-STRUKTUR: samtidig split-screen, inte hook-ordalydelse (skiljer sig från `PD_31_H1` i batch #3) |
| `Rodholder_CS_5_H1` | Video | CS (brådska) | Bevisat i video (`CS_1_H1`, +9 690 kr) men bara 3 bedömbara annonser totalt, alla voiceover+broll — testar om mönstret håller oberoende av format | Talare/format: UGC-bekännelse (skiljer sig från `CS_4_H1` i batch #3, som bara ändrade hook) |
| `Rodholder_PD_35_1` | Static | PD (demo, format-transfer) | Tredje, oberoende statiska datapunkten för PD-budskapet (`PD_6_1` bevisad vinnare, `PD_32_1` väntar) | Visuell stil: use-case-kollage (båt/bil/garage/tacklelåda), skiljer sig från `PD_32_1`:s split-jämförelse |
| `Rodholder_SO_6_1` | Static, BOF | Kvantitet/mångsidighet | BOF (Axel: bilder är billiga) — prisoberoende till skillnad från blockerade `SO_5_1` | — |
| `Rodholder_JF_2_1` | Static, BOF | Invändning: DIY-lösningar | BOF, adresserar "varför inte tejp/gummiband" — andra användningen av JF-koden (första var kompatibilitet, `JF_1_1`) | — |
| `Rodholder_TR_1_1` | Static, BOF | Trust/socialt bevis | Ny kod TR. "300+ sålda" sourcat ur Metas egna 324 verifierade köp i kampanjen (avläst 2026-09-06), avrundat NER för säkerhets skull | — |
| `Rodholder_SP_6_1` | Static, review | Recension (Johan) | Riktig recension, ordagrant citat — annan recensent än batch #3:s Anders/Peter | — |
| `Rodholder_SP_7_1` | Static, review | Recension (Mikael) | Riktig recension, ordagrant citat | — |

**Prisstatus:** oförändrad — fortfarande obekräftad (149/269/289 kr,
se `dna.md`). Ingen av batch #4:s 9 annonser skriver ut ett exakt pris.
`Rodholder_SO_5_1` (batch #3) kvarstår som den enda BLOCKER-briefen.

Notion: alla 9 laddade som `Draft` i hubben "Fish rod holder"
(`collection://3c3270ab-908c-8356-ad6c-87ff779e647d`), Typ "Video - Pending
Approval" resp. "Image - Pending Approval". Verifierat genom att läsa tillbaka
`Rodholder_SP_5_H1` med `notion-fetch` — hela briefen (inklusive tre-
frågorstabellen) står i sidans innehåll, inte bara som länk.

Drive: batchmapp `Batch #4` skapad i produktens befintliga mapp
(`10WK2ZKvDzCTMNf7RC6N2KkRs2UqqAhMv`), id `1PLBnIWhC_TwoTdRBij2hZQt-BYGoyfKg`,
länkad i varje brief.

⚠️ **Modellpolicy-avvikelse:** inget Agent/Task-verktyg för att spawna en
sonnet/haiku-subagent fanns tillgängligt i den här sessionens verktygslåda
(sökt via ToolSearch, inget träffat). All svensk copy i denna batch skrevs
därför av huvudsessionen själv, med tre-frågorstestet kört rad för rad som
substitut för den vanliga subagent-granskningen. Nästa körning: kontrollera
om Agent-verktyget finns tillgängligt då, och använd det om så — annars är
detta en känd begränsning i den schemalagda `/rond-auto`-miljön, inte ett
medvetet vals bort av regeln.

**Utfall:** ej avläst ännu (annonserna är briefer, inte launchade — nästa
`/cs`-körning läser av dessa OCH batch #3 när redigerarna levererat och de
gått live).
