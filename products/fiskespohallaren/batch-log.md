# Batch-log — Fiskespöhållaren (SE)

Breakthrough-frekvens: 0/104 (0 %) (uppdaterad 2026-09-21, backfill av hela bakkatalogen)

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

**Utfall (avläst 2026-09-10, körning nr 3):** FORTFARANDE inte launchade i
Meta (kontrollerat: inget av de 9 namnen finns i kampanjen, `date_preset:
maximum`). Läget i Notion-hubben (kontrollerat rad för rad, 2026-09-10):

| Annons | Status |
|---|---|
| `Rodholder_PD_31_H1` (batch #3) | To be Reviewed — levererad, väntar på `/notionkorning` |
| `Rodholder_CS_4_H1` (batch #3) | To be Reviewed — levererad, väntar på `/notionkorning` |
| `Rodholder_GT_4_H1` (batch #3) | To be Reviewed — levererad, väntar på `/notionkorning` |
| `Rodholder_PD_32_1` (batch #3) | Draft — ej påbörjad |
| `Rodholder_SO_5_1` (batch #3) | Draft — ej påbörjad. Prisblockeringen är löst (289 kr bekräftat, se dna.md) men raden är inte uppdaterad |
| `Rodholder_GA_1_1` (batch #3) | Draft — ej påbörjad |
| `Rodholder_JF_1_1` (batch #3) | Draft — ej påbörjad |
| `Rodholder_SP_3_1` (batch #3) | Draft — ej påbörjad |
| `Rodholder_SP_4_1` (batch #3) | Draft — ej påbörjad |
| `Rodholder_SP_5_H1` (batch #4) | To be Reviewed — levererad, väntar på `/notionkorning` |
| `Rodholder_PD_34_H1` (batch #4) | To be Reviewed — levererad, väntar på `/notionkorning` |
| `Rodholder_CS_5_H1` (batch #4) | To be Reviewed — levererad, väntar på `/notionkorning` |
| `Rodholder_PD_35_1` (batch #4) | Draft — ej påbörjad |
| `Rodholder_SO_6_1` (batch #4) | Draft — ej påbörjad |
| `Rodholder_JF_2_1` (batch #4) | Draft — ej påbörjad |
| `Rodholder_TR_1_1` (batch #4) | Draft — ej påbörjad |
| `Rodholder_SP_6_1` (batch #4) | Draft — ej påbörjad |
| `Rodholder_SP_7_1` (batch #4) | Draft — ej påbörjad |

**Ingen av batch #3:s eller batch #4:s hypoteser kan alltså stämmas av än.**
6 av 18 briefer är levererade av redigerarna och väntar på
`/notionkorning`-uppladdning; 12 av 18 är inte påbörjade. Det här är inte ett
kreativt fynd utan ett kapacitets-/leveransfynd — se `backlog.md`.

---

## Batch #5 — 2026-09-10 (denna körning, `/rond-auto` → `/cs`, 4-dagarsrundan,
`rundaAntal: 6` + 3 BOF + 2 recensioner = 11 briefer totalt)

**Strategi:** medvetet konservativ, byggd nästan uteslutande på bevisade
PD/CS-strukturer plus två direkta repliker av den bevisade static-formeln
(`PD_6_1`). Ingen ny, obevisad vinkel (GT/SP/JF/TR/SO) läggs till — 18
briefer väntar redan i kön (se ovan), och att lägga till fler obevisade
vinklar innan de befintliga ens granskats hjälper varken datan eller
redigerarnas arbetsbelastning. De tre BOF-bilderna är nya ANGLES
(Klarna/värde-stack/hållbarhet) men på redan bevisat, prisoberoende
underlag — inte nya kreativa hypoteser om vad som säljer.

| Annons | Format | Koncept | Hypotes | Isolerad variabel |
|---|---|---|---|---|
| `Rodholder_PD_36_H1` | Video | PD (demo) | `PD_1_H1` (benchmark) visar utmattningstecken (frequency 1,82, högst i gruppen, lägst vinst/krona av topp-5-video) medan `PD_EXTRA` (…564380291) är kampanjens mest lönsamma annons — en helt ny öppningsrad på den senares struktur testar om fräschhet återställer prestandan utan att röra resten av manuset | Ny hook/öppningsrad, allt annat i den bevisade PD-strukturen oförändrat |
| `Rodholder_PD_37_H1` | Video | PD (demo) | Ingen levande video säger priset högt/i bild — bara vår bäst presterande static (`PD_6_1`) gör det. Nu när 289 kr är bekräftat: testa samma explicithet i video | Pris (289 kr) nämnt explicit vid ca 8 s, inte bara implicit på slutkortet |
| `Rodholder_CS_6_H1` | Video | CS (brådska) | CS-mönstret är bevisat i video (`CS_1_H1`, +9 784 kr) men alltid text-only urgency hittills. Testar TALAD urgency (voiceover). Undviker medvetet den äldre "40 % rabatt"-framingen — inget jämförpris finns i Shopify | Leveranskanal för urgency: röst (VO), inte bara text/caption |
| `Rodholder_PD_40_H1` | Video | PD (demo) | Alla nuvarande topp-videor visar produkten inom ~3 s. Testar en LÄNGRE pain-first cold open (produkt visas först vid sek 6–10) — en sekvenserings-variabel ingen tidigare batch isolerat | Pacing: fördröjd produktreveal, samma budskap |
| `Rodholder_PD_38_1` | Static | PD (demo, format-transfer) | Andra oberoende repliken av `PD_6_1`s vinnarformel (enkel bild, minimal text, pris synligt) i NY miljö (bagageutrymme) — flyttar hypotesen från n=1 mot bevisad om den också vinner | Miljö/kontext (bagageutrymme), samma minimalistiska formel |
| `Rodholder_PD_41_1` | Static | PD (demo, format-transfer) | Tredje oberoende repliken av samma formel, NY miljö (garage/vägghängning) | Miljö/kontext (garage), samma minimalistiska formel |
| `Rodholder_KL_1_1` | Static, BOF | Klarna | Klarna är ett bekräftat äkta, prisoberoende erbjudande som aldrig fått en egen dedikerad creative — bara nämnts i löptext i andra annonser | — |
| `Rodholder_SO_7_1` | Static, BOF | Värde-stack | Ingen befintlig creative visar hela erbjudandepaketet (pris + garanti + frakt + Klarna) samlat. Går att bygga nu utan BLOCKER eftersom priset är bekräftat | — |
| `Rodholder_JF_3_1` | Static, BOF | Invändning: hållbarhet | JF har hittills täckt kompatibilitet (`JF_1_1`) och DIY-jämförelse (`JF_2_1`) — hållbarhet/kvalitet ("håller den ihop i vågor och gupp?") är en tredje, otestad invändning | — |
| `Rodholder_SP_8_1` | Static, review | Recension (Fredrik) | Riktig recension, ordagrant citat — tredje paret recensenter (Anders/Peter användes batch #3, Johan/Mikael batch #4) | — |
| `Rodholder_SP_9_1` | Static, review | Recension (Lars) | Riktig recension, ordagrant citat | — |

**Prisstatus:** LÖST denna körning — 289 kr bekräftat mot Shopifys publika
JSON (`compare_at_price` tomt, inget jämförpris möjligt) OCH mot två levande
annonser som redan visar priset. Alla nya annonser i batch #5 skriver ut
289 kr rakt av, ingen döljer det längre, ingen fabricerar en rabatt.

Notion: alla 11 laddade som `Draft` i hubben "Fish rod holder"
(`collection://3c3270ab-908c-8356-ad6c-87ff779e647d`), Typ "Video - Pending
Approval" resp. "Image - Pending Approval". Verifierat genom att läsa
tillbaka `Rodholder_PD_36_H1` med `notion-fetch` — hela briefen (hook,
tre-frågorstabell, script/shot-list, rules) står i sidans innehåll.

Drive: batchmapp `Batch #5` skapad i produktens Drive-rotmapp
(`10WK2ZKvDzCTMNf7RC6N2KkRs2UqqAhMv` — samma mapp som Batch #4 ligger i;
`agent/produktkarta.json`s `drive_senaste_batchmapp_id` pekade dit),
id `1XPU_lz8ThC41FNloMyr-ug5ZdLqeeb8K`, länkad i varje brief.

⚠️ **Drive-mapp-inkonsekvens upptäckt, inte löst:** batch #3:s brief
(`batch-log.md` ovan) anger produktmappen som `14-_uqZQnj4j_R-PqdUwZzZc2DPAenkhy`
("..._pausad"), medan batch #1, #4 och nu #5 alla ligger under
`10WK2ZKvDzCTMNf7RC6N2KkRs2UqqAhMv` (samma mapp som recensions-kalkylbladet
faktiskt ligger i, verifierat 2026-09-10). Troligen skrev batch #3-sessionen
fel produktmapps-ID. Rättas inte retroaktivt av den här körningen — nämns så
en framtida session inte blir förvirrad av att två ID:n cirkulerar.

⚠️ **Modellpolicy-avvikelse (tredje gången i rad):** inget Agent/Task-verktyg
med `model`-parameter hittades i den här sessionens verktygslåda (sökt via
ToolSearch på "agent subagent task spawn sonnet haiku model" — inga träffar
utöver `TaskStop`/generella verktyg utan modellparameter). All svensk copy i
denna batch skrevs därför av huvudsessionen själv, med tre-frågorstestet
kört rad för rad som substitut (redovisat i varje brief). Samma begränsning
som batch #4 (2026-09-06) och konsekvent nog för att vara en miljöbegränsning
i den schemalagda `/rond-auto`-miljön snarare än ett enskilt undantag.

**Utfall:** ej avläst ännu (annonserna är briefer, inte launchade — nästa
`/cs`-körning läser av dessa OCH de fortfarande olästa batch #3/#4 när
redigerarna levererat och de gått live).

---

## Batch #6 — 2026-09-15 (`/rond-auto` steg 4b, `brief_runda`, `rundaAntal: 4` + 3 BOF)

**Kampanjstatus före batchen:** ACTIVE (läst direkt före). Domen i dag är
`VANTA_KADENS` — budgeten rörs inte (750 kr/dag). 3-dagars-ROAS är 1,35 mot
break-even 1,50, alltså **under break-even**, medan livstiden ligger på 2,17.

### Feedbackloop — livstid avläst 2026-09-15 (`date_preset: maximum`)

Kampanjen: 75 308,73 kr spend, 377 köp, ROAS 2,17. Vinstbidrag räknas
`spend × (ROAS − 1,50)` (AOV skiljer sig mellan annonser och priset har inget
jämförpris att räkna emot):

| Annons | Format | Spend | Köp | CPA | ROAS | **Vinstbidrag** |
|---|---|---|---|---|---|---|
| `Fiskespöhållare_CS_1_H1` | video | 6 977 | 51 | 137 | 3,16 | **11 610 kr** |
| `Fiskespöhållare_PD_EXTRA` (top spender = benchmark) | video | 15 714 | 79 | 199 | 2,13 | 9 978 kr |
| `Fiskespöhållare_PD_EXTRA` (tredje varianten) | video | 4 709 | 33 | 143 | 2,85 | 6 381 kr |
| `Fiskespöhållare_PD_1_H1` | video | 15 296 | 61 | 251 | 1,85 | 5 369 kr |
| `Rodholder_PD_6_1` | statisk | 3 213 | 20 | 161 | 2,63 | 3 627 kr |
| `Fiskespöhållare_CS_1_H3` | video | 442 | 8 | **55** | 7,84 | 2 804 kr |
| `Rodholder_PD_16_H1` | video | 2 974 | 11 | 270 | 1,47 | **−80 kr** |

**Två fynd styr batchen.**

1. **CS-vinkeln är produktens starkaste per krona** — `CS_1_H1` ger mest
   vinstbidrag i hela kampanjen och `CS_1_H3` har kampanjens lägsta CPA
   (55 kr på 8 köp, alltså bedömbar). Men CS-annonsernas kraft ligger i
   "40 % RABATT – IDAG ENDAST", och **Shopify har inget `compare_at_price`
   för produkten** (omkontrollerat live 2026-09-15: pris 289 kr,
   `compare_at_price` tomt). Rabatten går alltså inte att belägga. Rundan
   flyttar därför över CS-vinkelns *energi och tempo* till argument som håller.
2. `PD_16_H1` har passerat under break-even (ROAS 1,47) — första gången en
   PD-video gör det. Den är inte en kandidat att kopiera.

⚠️ **Integritetsflaggan står kvar och är nu omkontrollerad:** `CS_1_H1` och
`CS_2_1` kör rabattpåståenden utan jämförpris i butiken. De rörs inte (de
lever och `CS_1_H1` är kampanjens bästa annons), men Axel bör känna till det —
det är andra gången det skrivs ner.

### ⚠️ Recensionsfyndet — inga review-bilder i den här batchen

Judge.me lästes om 2026-09-15 med produktens egna id (1968785816). **7 av 8
recensioner har `source: "wizard"` och `verified: "not-yet"`** — seedade. Den
enda organiska (`source: "web"`) är **1 stjärna** och lyder
"220:- för 8 på Fyndiq.se" (reviewer "Fyndiq.se"), alltså en prisjämförelse mot
en konkurrent, inte en produktröst.

Review-bilder kan därför inte byggas. Batchen har 0 i stället för 2.
⚠️ Konsekvens bakåt: `Rodholder_SP_3_1` och `SP_4_1` från batch #3 bygger på
wizard-citat.

### Batchen — 7 briefer (3 video + 1 statisk i rundan, 3 BOF-bilder)

| Annons | Format | Hypotes | Isolerad variabel |
|---|---|---|---|
| `Rodholder_PD_35_H1` | video | CS_1_H3:s tempo i sekund 0, men med trasselsmärtan visad i stället för ett erbjudande | argumentet byts, tempot låst |
| `Rodholder_PD_39_H1` | video | Värdeargument utan rabatt: 289 kr delat på fyra klämmor, visat som räknestycke | värde utan rabatt |
| `Rodholder_GT_5_H1` | video | Gåvovinkeln har aldrig fått budget (0 bedömbara på en månad) — eget nytt material | helt nytt manus |
| `Rodholder_PD_37_1` | statisk | PD_6_1 bevisar att statiskt bär PD-budskapet — andra oberoende vinkel, före/efter i samma bild | ny visuell vinkel |
| `Rodholder_SO_8_1` | statisk, BOF | 289 kr för 4-pack, värdet byggt på styckpriset — ingen procent, inget jämförpris | — |
| `Rodholder_GA_2_1` | statisk, BOF | 30 dagars garanti, fri frakt över 300 kr, Klarna | — |
| `Rodholder_JF_4_1` | statisk, BOF | "passar de mina spön?" | — |

**Modellpolicy följd:** all svensk copy skriven av en sonnet-subagent.

> ⚠️ **Namnkrock 2026-09-15:** flera av batchens föreslagna AD-ID:n var redan
> upptagna av rader som låg i hubben (inte i Meta-kontot — där fanns de inte).
> Raderna ovan bär de omdöpta, lediga namnen. **Lärdom:** läs av upptagna AD-ID:n
> i BÅDE annonskontot och Notion-hubben innan du numrerar — hubben innehåller
> briefer som aldrig nått kontot, och de äger sitt nummer ändå.

---

## Feedbackloop + batch #6 — 2026-09-18 (`/rond-auto` steg 4b, brief-runda)

**Läget i kampanjen (livstid, avläst 2026-09-18 ur MagiBorsten 1867947880635861):**
78 823 kr spend · 394 köp · livstids-ROAS 2,17 mot break-even 1,50. Dagsbudget 1 800 kr (oförändrad denna körning — VANTA_KADENS, ändrad för nyligen).

**Datakvalitet:** `amount_spent × purchase_roas` summerat per annons stämmer mot
kampanjens egen intäkt inom avrundning; annonsurvalet täcker 98 % av kampanjens
spend. `omni_purchase_values` användes INTE (känd bugg, CLAUDE.md). Inga trasiga rader.

**Signifikansgrind (ANALYSMETOD steg 2c):** 14 annonser bedömbara (≥300 kr OCH ≥3 köp). För tidigt, ingen dom: Fiskespöhållare_CS_1_H3 (377 kr/2 köp), Rodholder_PD_7_1 (354 kr/1 köp), Fiskespöhållare_PD_1_H2 (304 kr/1 köp).

**Vinstbidrag — rangordnat på vinst, inte på ROAS eller CPA.**
Break-even-CPA räknas per annons på dess EGEN AOV (`intäkt/köp ÷ break-even-ROAS`),
aldrig på en blandad siffra:

| Annons | Status | Spend | Spend% | Köp | CPA | BE-CPA | ROAS | **Vinstbidrag** |
|---|---|---|---|---|---|---|---|---|
| Fiskespöhållare_CS_1_H1 | ACTIVE | 7 380 | 10 % | 52 | 142 | 287 | 3,04 | **+7 560 kr (21 %)** |
| Fiskespöhållare_PD_EXTRA (…564380291) | ACTIVE | 17 141 | 22 % | 86 | 199 | 280 | 2,10 | +6 901 kr (20 %) |
| Fiskespöhållare_PD_EXTRA (…856844270291) | PAUSED | 9 159 | 12 % | 51 | 180 | 288 | 2,40 | +5 518 kr |
| Fiskespöhållare_PD_EXTRA (…857099190291) | ACTIVE | 5 029 | 7 % | 34 | 148 | 270 | 2,74 | +4 158 kr |
| Fiskespöhållare_PD_1_H1 (top spender = benchmark) | ACTIVE | 16 026 | 21 % | 62 | 258 | 313 | 1,81 | +3 351 kr |
| Rodholder_PD_15_H1 | PAUSED | 9 268 | 12 % | 39 | 238 | 308 | 1,94 | +2 728 kr |
| Rodholder_PD_6_1 (bäst statisk) | ACTIVE | 3 366 | 4 % | 21 | 160 | 284 | 2,66 | +2 594 kr |
| Fiskespöhållare_CS_1_H3 | ACTIVE | 505 | 1 % | 8 | 63 | 289 | 6,87 | +1 808 kr |
| Rodholder_PD_16_H1 | ACTIVE | 3 119 | 4 % | 13 | 240 | 267 | 1,67 | +354 kr |
| Rodholder_CS_3_1 | ACTIVE | 797 | 1 % | 4 | 199 | 276 | 2,08 | +309 kr |
| Rodholder_SO_3_H1 | ACTIVE | 441 | 1 % | 3 | 147 | 225 | 2,30 | +235 kr |
| Rodholder_PD_11_H2 | PAUSED | 1 922 | 2 % | 6 | 320 | 317 | 1,49 | −19 kr |
| Rodholder_SO_4_1 | PAUSED | 808 | 1 % | 3 | 269 | 259 | 1,44 | −30 kr |
| Fiskespöhållare_CS_2_1 | PAUSED | 907 | 1 % | 3 | 302 | 218 | 1,08 | −253 kr |

Summa vinstbidrag i urvalet: **+35 215 kr**.

**Mönster (data skild från hypotes):**
1. **BEVISAD — erbjudandevinkeln (CS) är produktens starkaste per krona.**
   CS_1_H1 gör +7 560 kr på bara 10 % av spenden; hela CS-koden står för
   +9 424 kr på fyra annonser. Instruktion till batchen: två nya CS-executions
   i video (`Rodholder_PD_60_H1` öppnar på priset, `Rodholder_CS_9_H1` visar vad
   289 kr köper).
2. **BEVISAD — PD-demon bär volymen.** PD-koden står för +25 586 kr över
   åtta bedömbara annonser, och de tre PD_EXTRA-varianterna ensamma för
   +16 577 kr. Instruktion: behåll PD-strukturen, variera bara öppningen.
3. **BEVISAD — top spendern är benchmark, inte kandidat.** PD_1_H1 tar 21 % av
   spenden på kampanjens lägsta ROAS bland de stora (1,81) men ligger ändå
   +3 351 kr över break-even. Den döms inte mot de små annonserna.
4. **HYPOTES — det ärliga jämförpriset är nytt bränsle.** Jämförpriset 482 kr
   finns numera i Shopify (satt 2026-09-15), så "spara 193 kr / 40 %" går att
   säga ärligt för första gången. Det var förbjudet i batch #3–#5.
   ⚠️ Formatetiketterna (video/statisk) går inte att lita på för de äldsta
   annonserna — PD_EXTRA-raderna saknar `_H`-suffix trots att de är video.
   Ingen video-mot-statisk-slutsats dras därför denna körning.

**Priset avläst live 2026-09-18** ur butikens produkt-JSON: 289 kr, jämförpris 482 kr → spara 193 kr = 40 %. Bekräftat i `variants[0]`.

### Batch #6 — 9 (4 video + 2 statiska i rundan, 3 BOF-bilder, 0 review-bilder) briefer, alla i Notion som Draft

| Annons | Format | Hypotes | Isolerad variabel |
|---|---|---|---|
| `Rodholder_PD_60_H1` | video | PD-strukturen växer om den öppnar på det ärliga priset i stället för problemet | öppningen |
| `Rodholder_PD_61_H1` | video | samma film, men hooken är problemet (spöspetsar som hakar i varandra) | hooken, allt annat låst mot PD_60 |
| `Rodholder_CS_9_H1` | video | "det här får du för 289 kr" — räkna fram alla fyra klämmorna i bild | beviset |
| `Rodholder_GT_6_H1` | video | ordlös före/efter i 30 s; GT har aldrig fått riktig spend | formatet |
| `Rodholder_PD_62_1` | statisk | PD_6_1:s minimalistiska formel med det nya, ärliga prisblocket | erbjudandet |
| `Rodholder_SO_10_1` | statisk | samma layout, rubriken bär problemet i stället för priset | rubrikvinkeln |
| `Rodholder_BOF_1_1` | statisk, BOF | 289 kr mot 482 kr, spara 193 kr | — |
| `Rodholder_BOF_2_1` | statisk, BOF | 30 dagars nöjd-kund-garanti, fri frakt inom Sverige, Klarna | — |
| `Rodholder_BOF_3_1` | statisk, BOF | räkneinvändningen: fyra klämmor räcker till fyra spön, 1:1 i bild | — |

**Inga review-bilder.** Produkten har 8 recensioner men bara en organisk, och
den är 1 stjärna. Recensionsregeln i den här filen gäller: review-bilder byggs
bara på riktiga kundcitat.

**Modellpolicy följd (CLAUDE.md regel 6):** all svensk copy skriven av en
sonnet-subagent som fick DNA, hypotes, hook, formatkrav och `docs/copy-regler.md`.
Strategi, analys, namngivning och briefstruktur gjordes av huvudsessionen.
Tre-frågorstestet står i varje brief, rad för rad.

**Rättat av huvudsessionen efter subagenten:**
- `Rodholder_BOF_2_1` påstod först "fri frakt över 300 kr". Produktsidans egen
  rad säger **"Fri Frakt inom Sverige"** utan beloppsgräns (butikens toppbanner
  bär däremot "FRI FRAKT – På ordrar över 300kr", så påståendet var inte falskt,
  bara en annan och snävare formulering). Alla briefer i dagens rond använder nu
  produktsidans egen ovillkorliga rad.
- Tre `Why`-rader bar tal subagenten räknat själv (+9 784 kr, +39 824 kr, "1,69",
  "ROAS 2,98"). Ersatta med den här körningens verifierade siffror.

## Etiketter dag 7 (2026-09-21)

Etiketten är ingen dom (dom kräver 300 kr och 3 köp, kolumnen Bedömbar). Räknad på annonsens egna första vecka, backfillad 2026-09-21 ur Meta. Rådata: ETIKETT-raderna i agent/budgetlogg.jsonl.

| Annons | Batch | Typ | Etikett (7 d) | Andel | Spend | Köp | ROAS ad / kampanj | Bedömbar | Playbook |
|---|---|---|---|---|---|---|---|---|---|
| Rodholder_PD_25_H2 | — | okänd | **INGEN_LEVERANS** | — | 0 kr | 0 | 0,00 / 1,90 | nej | hooken föll — logga och släpp, aldrig ABO |
| Rodholder_PD_30_H2 | — | okänd | **INGEN_LEVERANS** | — | 1 kr | 0 | 0,00 / 1,90 | nej | hooken föll — logga och släpp, aldrig ABO |
| Rodholder_PD_30_H1 | — | okänd | **INGEN_LEVERANS** | — | 9 kr | 0 | 0,00 / 1,90 | nej | hooken föll — logga och släpp, aldrig ABO |
| Rodholder_PD_29_H2 | — | okänd | **LOSER** | 0 % | 21 kr | 0 | 0,00 / 1,90 | nej | släpp |
| Rodholder_PD_29_H1 | — | okänd | **INGEN_LEVERANS** | — | 3 kr | 0 | 0,00 / 1,90 | nej | hooken föll — logga och släpp, aldrig ABO |
| Rodholder_PD_28_H2 | — | okänd | **INGEN_LEVERANS** | — | 2 kr | 0 | 0,00 / 1,90 | nej | hooken föll — logga och släpp, aldrig ABO |
| Rodholder_PD_28_H1 | — | okänd | **INGEN_LEVERANS** | — | 0 kr | 0 | 0,00 / 1,90 | nej | hooken föll — logga och släpp, aldrig ABO |
| Rodholder_PD_27_H2 | — | okänd | **INGEN_LEVERANS** | — | 8 kr | 0 | 0,00 / 1,90 | nej | hooken föll — logga och släpp, aldrig ABO |
| Rodholder_PD_27_H1 | — | okänd | **INGEN_LEVERANS** | — | 7 kr | 0 | 0,00 / 1,90 | nej | hooken föll — logga och släpp, aldrig ABO |
| Rodholder_PD_26_H2 | — | okänd | **INGEN_LEVERANS** | — | 1 kr | 0 | 0,00 / 1,90 | nej | hooken föll — logga och släpp, aldrig ABO |
| Rodholder_PD_26_H1 | — | okänd | **INGEN_LEVERANS** | — | 0 kr | 0 | 0,00 / 1,90 | nej | hooken föll — logga och släpp, aldrig ABO |
| Rodholder_PD_25_H1 | — | okänd | **INGEN_LEVERANS** | — | 2 kr | 0 | 0,00 / 1,90 | nej | hooken föll — logga och släpp, aldrig ABO |
| Rodholder_PD_22_H2 | — | okänd | **INGEN_LEVERANS** | — | 3 kr | 0 | 0,00 / 1,90 | nej | hooken föll — logga och släpp, aldrig ABO |
| Rodholder_PD_22_H1 | — | okänd | **INGEN_LEVERANS** | — | 8 kr | 0 | 0,00 / 1,90 | nej | hooken föll — logga och släpp, aldrig ABO |
| Rodholder_PD_19_H2 | — | okänd | **INGEN_LEVERANS** | — | 4 kr | 0 | 0,00 / 1,90 | nej | hooken föll — logga och släpp, aldrig ABO |
| Rodholder_PD_19_H1 | — | okänd | **INGEN_LEVERANS** | — | 4 kr | 0 | 0,00 / 1,90 | nej | hooken föll — logga och släpp, aldrig ABO |
| Rodholder_PD_17_H2 | — | okänd | **LOSER** | 0 % | 10 kr | 0 | 0,00 / 1,90 | nej | släpp |
| Fiskespöhållare_GT_1_H3 | — | okänd | **LOSER** | 0 % | 16 kr | 0 | 0,00 / 2,85 | nej | släpp |
| Fiskespöhållare_SP_1_H2 | — | okänd | **INGEN_LEVERANS** | — | 1 kr | 0 | 0,00 / 2,85 | nej | hooken föll — logga och släpp, aldrig ABO |
| Fiskespöhållare_SP_2_1 | — | okänd | **INGEN_LEVERANS** | — | 0 kr | 0 | 0,00 / 2,85 | nej | hooken föll — logga och släpp, aldrig ABO |
| Fiskespöhållare_SP_1_H3 | — | okänd | **INGEN_LEVERANS** | — | 9 kr | 0 | 0,00 / 2,85 | nej | hooken föll — logga och släpp, aldrig ABO |
| Fiskespöhållare_CS_2_1 | 6 | okänd | **LOSER** | 2 % | 471 kr | 1 | 0,72 / 2,85 | nej | släpp |
| Fiskespöhållare_SO_1_H3 | — | okänd | **INGEN_LEVERANS** | — | 1 kr | 0 | 0,00 / 2,85 | nej | hooken föll — logga och släpp, aldrig ABO |
| ZZ_GAMMAL_Fiskespöhållare_SO_2_1 (fel pris) | — | okänd | **KPI_WINNER** | 0 % | 11 kr | 1 | 46,22 / 2,85 | nej | 3 nya hookar, allt annat lika — den säljer men får inte spend |
| ZZ_GAMMAL_Fiskespöhållare_SO_1_H2 (fel pris) | — | okänd | **INGEN_LEVERANS** | — | 7 kr | 0 | 0,00 / 2,85 | nej | hooken föll — logga och släpp, aldrig ABO |
| ZZ_GAMMAL_Fiskespöhållare_SO_1_H1 (fel pris) | — | okänd | **LOSER** | 0 % | 12 kr | 0 | 0,00 / 2,85 | nej | släpp |
| Fiskespöhållare_SP_1_H1 | — | okänd | **INGEN_LEVERANS** | — | 2 kr | 0 | 0,00 / 2,85 | nej | hooken föll — logga och släpp, aldrig ABO |
| Fiskespöhållare_PD_EXTRA | — | okänd | **LOSER** | 13 % | 3687 kr | 21 | 2,38 / 2,85 | ja | släpp |
| Fiskespöhållare_GT_1_H2 | — | okänd | **INGEN_LEVERANS** | — | 6 kr | 0 | 0,00 / 2,85 | nej | hooken föll — logga och släpp, aldrig ABO |
| Fiskespöhållare_CS_1_H1 | 6 | okänd | **KPI_WINNER** | 10 % | 2797 kr | 26 | 3,83 / 2,85 | ja | 3 nya hookar, allt annat lika — den säljer men får inte spend |
| Fiskespöhållare_PD_1_H3 | — | okänd | **LOSER** | 0 % | 15 kr | 0 | 0,00 / 2,85 | nej | släpp |
| Fiskespöhållare_PD_1_H2 | 6 | okänd | **LOSER** | 0 % | 87 kr | 0 | 0,00 / 2,85 | nej | släpp |
| Fiskespöhållare_GT_1_H1 | — | okänd | **INGEN_LEVERANS** | — | 5 kr | 0 | 0,00 / 2,85 | nej | hooken föll — logga och släpp, aldrig ABO |
| Fiskespöhållare_PD_1_H1 | 6 | okänd | **LOSER** | 14 % | 4162 kr | 22 | 2,52 / 2,85 | ja | släpp |
| Fiskespöhållare_CS_1_H2 | — | okänd | **LOSER** | 0 % | 84 kr | 0 | 0,00 / 2,85 | nej | släpp |
| Fiskespöhållare_PD_2_1 | — | okänd | **LOSER** | 0 % | 16 kr | 0 | 0,00 / 2,85 | nej | släpp |
| Fiskespöhållare_CS_1_H3 | 6 | okänd | **KPI_WINNER** | 0 % | 42 kr | 1 | 7,95 / 2,85 | nej | 3 nya hookar, allt annat lika — den säljer men får inte spend |
| Fiskespöhållare_GT_2_1 | — | okänd | **INGEN_LEVERANS** | — | 0 kr | 0 | 0,00 / 2,85 | nej | hooken föll — logga och släpp, aldrig ABO |
| Fiskespöhållare_SO_1_H3 | — | okänd | **INGEN_LEVERANS** | — | 3 kr | 0 | 0,00 / 2,54 | nej | hooken föll — logga och släpp, aldrig ABO |
| Fiskespöhållare_SO_1_H2 | — | okänd | **INGEN_LEVERANS** | — | 1 kr | 0 | 0,00 / 2,54 | nej | hooken föll — logga och släpp, aldrig ABO |
| Fiskespöhållare_PD_EXTRA | — | okänd | **KPI_WINNER** | 22 % | 8308 kr | 49 | 2,57 / 2,54 | ja | 3 nya hookar, allt annat lika — den säljer men får inte spend |
| Fiskespöhållare_SO_2_1 | — | okänd | **INGEN_LEVERANS** | — | 1 kr | 0 | 0,00 / 2,54 | nej | hooken föll — logga och släpp, aldrig ABO |
| Fiskespöhållare_SO_1_H3 | — | okänd | **LOSER** | 0 % | 24 kr | 0 | 0,00 / 2,54 | nej | släpp |
| Fiskespöhållare_GT_1_H3 | — | okänd | **INGEN_LEVERANS** | — | 2 kr | 0 | 0,00 / 2,54 | nej | hooken föll — logga och släpp, aldrig ABO |
| Fiskespöhållare_SP_1_H3 | — | okänd | **LOSER** | 0 % | 11 kr | 0 | 0,00 / 2,54 | nej | släpp |
| Fiskespöhållare_PD_EXTRA | — | okänd | **KPI_WINNER** | 10 % | 3828 kr | 29 | 3,16 / 2,54 | ja | 3 nya hookar, allt annat lika — den säljer men får inte spend |
| Fiskespöhållare_SO_1_H1 | — | okänd | **INGEN_LEVERANS** | — | 1 kr | 0 | 0,00 / 2,54 | nej | hooken föll — logga och släpp, aldrig ABO |
| Fiskespöhållare_CS_1_H3 | 6 | okänd | **KPI_WINNER** | 1 % | 383 kr | 8 | 9,07 / 2,54 | ja | 3 nya hookar, allt annat lika — den säljer men får inte spend |
| Rodholder_PD_15_H1 | 2 | okänd | **KPI_WINNER** | 21 % | 9268 kr | 39 | 1,94 / 1,88 | ja | 3 nya hookar, allt annat lika — den säljer men får inte spend |
| Rodholder_PD_9_H1 | — | okänd | **LOSER** | 0 % | 13 kr | 0 | 0,00 / 1,88 | nej | släpp |
| Rodholder_PD_16_H1 | 2 | okänd | **LOSER** | 4 % | 1585 kr | 7 | 1,69 / 1,88 | ja | släpp |
| Rodholder_PD_10_1 | — | okänd | **LOSER** | 0 % | 17 kr | 0 | 0,00 / 1,88 | nej | släpp |
| Rodholder_PD_17_H1 | — | okänd | **LOSER** | 0 % | 74 kr | 0 | 0,00 / 1,88 | nej | släpp |
| Rodholder_SO_4_1 | 2 | okänd | **LOSER** | 3 % | 808 kr | 3 | 1,44 / 1,52 | ja (prel.) | släpp |
| Rodholder_PD_11_H2 | 2 | okänd | **LOSER** | 6 % | 1922 kr | 6 | 1,49 / 1,52 | ja | släpp |
| Rodholder_GT_3_H1 | — | okänd | **LOSER** | 0 % | 20 kr | 0 | 0,00 / 1,52 | nej | släpp |
| Rodholder_PD_3_H2_H2 | — | okänd | **LOSER** | 0 % | 27 kr | 0 | 0,00 / 1,52 | nej | släpp |
| Rodholder_PD_16_H2 | — | okänd | **LOSER** | 0 % | 83 kr | 0 | 0,00 / 1,52 | nej | släpp |
| Rodholder_PD_18_H2 | — | okänd | **INGEN_LEVERANS** | — | 3 kr | 0 | 0,00 / 1,52 | nej | hooken föll — logga och släpp, aldrig ABO |
| Rodholder_PD_4_H1 | — | okänd | **LOSER** | 0 % | 15 kr | 0 | 0,00 / 1,52 | nej | släpp |
| Rodholder_PD_15_H2 | — | okänd | **INGEN_LEVERANS** | — | 9 kr | 0 | 0,00 / 1,52 | nej | hooken föll — logga och släpp, aldrig ABO |
| Rodholder_PD_18_H1 | — | okänd | **INGEN_LEVERANS** | — | 1 kr | 0 | 0,00 / 1,52 | nej | hooken föll — logga och släpp, aldrig ABO |
| Rodholder_PD_3_H2_H1 | — | okänd | **LOSER** | 0 % | 12 kr | 0 | 0,00 / 1,52 | nej | släpp |
| Rodholder_PD_6_1 | 2 | okänd | **KPI_WINNER** | 4 % | 1317 kr | 9 | 2,73 / 1,52 | ja | 3 nya hookar, allt annat lika — den säljer men får inte spend |
| Rodholder_PD_7_1 | 6 | okänd | **KPI_WINNER** | 1 % | 296 kr | 1 | 1,66 / 1,52 | nej | 3 nya hookar, allt annat lika — den säljer men får inte spend |
| Rodholder_CS_3_1 | 6 | okänd | **LOSER** | 1 % | 438 kr | 1 | 0,77 / 1,52 | nej | släpp |
| Rodholder_PD_13_H1 | — | okänd | **INGEN_LEVERANS** | — | 4 kr | 0 | 0,00 / 1,52 | nej | hooken föll — logga och släpp, aldrig ABO |
| Rodholder_SO_3_H1 | 6 | okänd | **KPI_WINNER** | 1 % | 162 kr | 2 | 4,18 / 1,52 | nej | 3 nya hookar, allt annat lika — den säljer men får inte spend |
| Rodholder_PD_11_H1 | — | okänd | **LOSER** | 0 % | 10 kr | 0 | 0,00 / 1,52 | nej | släpp |
| Rodholder_PD_12_H1 | — | okänd | **LOSER** | 0 % | 14 kr | 0 | 0,00 / 1,52 | nej | släpp |
| Rodholder_PD_8_H2_H2 | — | okänd | **LOSER** | 0 % | 17 kr | 0 | 0,00 / 1,52 | nej | släpp |
| Rodholder_PD_8_H1 | — | okänd | **LOSER** | 0 % | 10 kr | 0 | 0,00 / 1,52 | nej | släpp |
| Rodholder_PD_8_H2_H1 | — | okänd | **INGEN_LEVERANS** | — | 5 kr | 0 | 0,00 / 1,52 | nej | hooken föll — logga och släpp, aldrig ABO |
| Rodholder_PD_3_H2 | — | okänd | **LOSER** | 0 % | 117 kr | 0 | 0,00 / 1,52 | nej | släpp |
| Rodholder_PD_3_H1 | — | okänd | **LOSER** | 0 % | 17 kr | 0 | 0,00 / 1,52 | nej | släpp |
| Rodholder_REA_V08 | — | okänd | **INGEN_LEVERANS** | — | 6 kr | 0 | 0,00 / 1,46 | nej | hooken föll — logga och släpp, aldrig ABO |
| Rodholder_REA_V10 | — | okänd | **INGEN_LEVERANS** | — | 4 kr | 0 | 0,00 / 1,46 | nej | hooken föll — logga och släpp, aldrig ABO |
| Rodholder_REA_V09 | — | okänd | **LOSER** | 0 % | 76 kr | 0 | 0,00 / 1,46 | nej | släpp |
| Rodholder_REA_V05 | — | okänd | **INGEN_LEVERANS** | — | 1 kr | 0 | 0,00 / 1,46 | nej | hooken föll — logga och släpp, aldrig ABO |
| Rodholder_REA_V01 | — | okänd | **LOSER** | 0 % | 17 kr | 0 | 0,00 / 1,46 | nej | släpp |
| Rodholder_REA_V07 | — | okänd | **INGEN_LEVERANS** | — | 4 kr | 0 | 0,00 / 1,46 | nej | hooken föll — logga och släpp, aldrig ABO |
| Rodholder_REA_V04 | — | okänd | **INGEN_LEVERANS** | — | 9 kr | 0 | 0,00 / 1,46 | nej | hooken föll — logga och släpp, aldrig ABO |
| Rodholder_REA_V06 | — | okänd | **INGEN_LEVERANS** | — | 2 kr | 0 | 0,00 / 1,46 | nej | hooken föll — logga och släpp, aldrig ABO |
| Rodholder_REA_V03 | — | okänd | **INGEN_LEVERANS** | — | 1 kr | 0 | 0,00 / 1,46 | nej | hooken föll — logga och släpp, aldrig ABO |
| Rodholder_REA_V02 | — | okänd | **LOSER** | 0 % | 17 kr | 0 | 0,00 / 1,46 | nej | släpp |
| Rodholder_PROD_V10 | — | okänd | **INGEN_LEVERANS** | — | 9 kr | 0 | 0,00 / 1,46 | nej | hooken föll — logga och släpp, aldrig ABO |
| Rodholder_PROD_V07 | — | okänd | **LOSER** | 0 % | 79 kr | 0 | 0,00 / 1,46 | nej | släpp |
| Rodholder_PROD_V09 | — | okänd | **INGEN_LEVERANS** | — | 2 kr | 0 | 0,00 / 1,46 | nej | hooken föll — logga och släpp, aldrig ABO |
| Rodholder_PROD_V06 | — | okänd | **INGEN_LEVERANS** | — | 8 kr | 0 | 0,00 / 1,46 | nej | hooken föll — logga och släpp, aldrig ABO |
| Rodholder_PROD_V04 | — | okänd | **INGEN_LEVERANS** | — | 8 kr | 0 | 0,00 / 1,46 | nej | hooken föll — logga och släpp, aldrig ABO |
| Rodholder_PROD_V01 | — | okänd | **INGEN_LEVERANS** | — | 5 kr | 0 | 0,00 / 1,46 | nej | hooken föll — logga och släpp, aldrig ABO |
| Rodholder_PROD_V08 | — | okänd | **LOSER** | 0 % | 13 kr | 0 | 0,00 / 1,46 | nej | släpp |
| Rodholder_PROD_V05 | — | okänd | **INGEN_LEVERANS** | — | 2 kr | 0 | 0,00 / 1,46 | nej | hooken föll — logga och släpp, aldrig ABO |
| Rodholder_PROD_V03 | — | okänd | **INGEN_LEVERANS** | — | 6 kr | 0 | 0,00 / 1,46 | nej | hooken föll — logga och släpp, aldrig ABO |
| Rodholder_PROD_V02 | — | okänd | **INGEN_LEVERANS** | — | 4 kr | 0 | 0,00 / 1,46 | nej | hooken föll — logga och släpp, aldrig ABO |
| Rodholder_PD_23_H2 | — | okänd | **INGEN_LEVERANS** | — | 3 kr | 0 | 0,00 / 1,46 | nej | hooken föll — logga och släpp, aldrig ABO |
| Rodholder_PD_23_H1 | — | okänd | **KPI_WINNER** | 1 % | 166 kr | 1 | 1,87 / 1,46 | nej | 3 nya hookar, allt annat lika — den säljer men får inte spend |
| Rodholder_PD_21_H2 | — | okänd | **LOSER** | 0 % | 12 kr | 0 | 0,00 / 1,46 | nej | släpp |
| Rodholder_PD_13_H2_H1 | — | okänd | **LOSER** | 0 % | 28 kr | 0 | 0,00 / 1,46 | nej | släpp |
| Rodholder_PD_5_H1 | — | okänd | **INGEN_LEVERANS** | — | 7 kr | 0 | 0,00 / 1,46 | nej | hooken föll — logga och släpp, aldrig ABO |
| Rodholder_PD_21_H1 | — | okänd | **INGEN_LEVERANS** | — | 2 kr | 0 | 0,00 / 1,46 | nej | hooken föll — logga och släpp, aldrig ABO |
| Rodholder_PD_13_H2_H2 | — | okänd | **LOSER** | 0 % | 60 kr | 0 | 0,00 / 1,46 | nej | släpp |
| Rodholder_PD_12_H2_H1 | — | okänd | **INGEN_LEVERANS** | — | 2 kr | 0 | 0,00 / 1,46 | nej | hooken föll — logga och släpp, aldrig ABO |
| Rodholder_PD_12_H2_H2 | — | okänd | **INGEN_LEVERANS** | — | 2 kr | 0 | 0,00 / 1,46 | nej | hooken föll — logga och släpp, aldrig ABO |

## Feedbackloop + batch #7 — 2026-09-21 (`/rond-auto` steg 4b, brief-runda)

**Läget i kampanjen (livstid, avläst 2026-09-21 ur MagiBorsten 1867947880635861):**
83 787 kr spend · 414 köp · livstids-ROAS 2,16 mot break-even 1,50 · AOV 437 kr ⇒
BE-CPA 291 kr. Dagsbudget 1 800 kr (oförändrad — VANTA_KADENS).
**Dagens åtgärd på annonsnivå:** `Fiskespöhållare_PD_EXTRA` (…564380291) pausad
som spendtjuv i grön kampanj (3 d: 1 948 kr / 5 köp / ROAS 0,86; livstid 19 110 kr /
91 köp / CPA 210 / ROAS 1,98; dag-7-etikett LOSER) — en trött vinnare, dess
demokropp lever vidare i PD_63/PD_64.

**Vinstbidrag (livstid, aktiva annonser, ≥300 kr + ≥3 köp; BE-CPA per annons på egen AOV):**

| Annons | Spend | Spend% | Köp | CPA | ROAS | **Vinstbidrag** |
|---|---|---|---|---|---|---|
| Fiskespöhållare_CS_1_H1 | 7 804 | 13 % | 55 | 142 | 3,07 | **+8 205 kr** |
| Fiskespöhållare_PD_EXTRA (…564380291, pausad i dag) | 19 110 | 31 % | 91 | 210 | 1,98 | +7 377 kr |
| Fiskespöhållare_PD_EXTRA (2026-08-19) | 6 006 | 10 % | 37 | 162 | 2,70 | +4 763 kr |
| Fiskespöhållare_PD_1_H1 (top spender = benchmark) | 16 638 | 27 % | 67 | 248 | 1,90 | +2 863 kr |
| Rodholder_PD_6_1 (bäst statisk) | 3 675 | 6 % | 21 | 175 | 2,43 | +2 438 kr |
| Fiskespöhållare_CS_1_H3 | 546 | 1 % | 8 | 68 | 6,35 | +1 782 kr |
| Rodholder_PD_16_H1 | 3 427 | 6 % | 15 | 228 | 1,72 | +939 kr |
| Rodholder_SO_3_H1 | 489 | 1 % | 4 | 122 | 2,76 | +675 kr |
| Rodholder_CS_3_1 | 911 | 1 % | 4 | 228 | 1,82 | +253 kr |

**Mönster:** (1) BEVISAD — CS-erbjudandet är starkast per krona (CS_1_H1 +8 205 kr
på 13 % av spenden), (2) BEVISAD — PD-demon bär volymen men den största
PD_EXTRA-varianten har tröttnat (3 back-dygn under 1,50), (3) BEVISAD — top spendern
PD_1_H1 är benchmark, inte kandidat. Priset avläst live: 289 kr / 482 kr (spara 193 kr, 40 %).

### Batch #7 — 4 videobriefer (rundan), 0 BOF, 0 review — alla i Notion som Draft (hub Fish rod holder)

| Annons | Format | Hypotes | Isolerad variabel | Källa |
|---|---|---|---|---|
| `Rodholder_PD_63_H1` | video | PD_EXTRA:s demokropp, men de två första sekunderna ordlösa | öppningen (ordlös/talad) | förälder PD_EXTRA |
| `Rodholder_PD_64_H1` | video | UGC-talare i egen båt, ingen voiceover | talaren (creator/VO) | dna "Testa kontrollerat" + gissning |
| `Rodholder_CS_10_H1` | video | öppnar på 482 kr överstruket → 289 kr, "det här får du" | rabatten visad (överstrykning + 40 %) | förälder CS_1_H1 |
| `Rodholder_JF_6_H1` | video | gummiband glider av, klämman sitter kvar (konflikt typ A) | vinkeln (jämförelse) | copy-regler + gissning |

**0 BOF-bilder** (inga KPI_WINNER bland BOF-etiketterna, regel 2026-09-20). **0 review-bilder**
(ingen riktig kundrecension att citera). **Hubben saknar Feedback-rad** — reglerna hämtade
ur Brief review 2026-09-18 i Belt/Boat/Termo. **Annonsidéer:** inga rader för produkten.
Copy av sonnet-subagent (regel 6), tre-frågorstest per rad.
⚠️ Regitabell + komponenttaggar (rond-auto 2.9/2.12, `f1bbba1` 06:04 UTC samma morgon) saknas —
kravet kom efter att subagenten fått sin brief, och spärren `--manifest` finns inte på `main`.
