# NO-videobatch 2026-09-13 — rutinen `/translate-no`

## Fas 0 — Inventering

LAUNCHED (`1-vbYhYgTEv7zYptW5rGmgKAITmAz4l1X`) listad, WINNERS/LOSERS/MAKE TO
NORWAY exkluderade. 7 produktmappar i LAUNCHED: Lövblåsare, Isolerad
Utekattkoja, Taköverdrag Husvagn, Solcellslarm 2-pack, Stegstöd 2-pack,
Termoskydd Husbil, Staketstolpslagare. MAKE TO NORWAY listad rekursivt (inkl.
WINNERS-undermappen) — 6 av 7 redan täckta (`NO <namn>`-mapp finns). Enda
kandidat: **Staketstolpslagare** (produktnamn på beverbutikken.se:
"Staketstolpsbygel 2-pack – Räddar Två Stolpar Utan Att Gräva"). Ingen
kampanj med produktnamnet fanns i act_1050941584152547 (40 kampanjer
kontrollerade). 12 annonsvideor (CS/GT/PD/SP × H1/H2/H3) + 4 bildannonser
(`*_2_1`) + 4 ADCOPY-docs i källmappen — produkten är klar.

**Norsk produktsida:** `gjerdestolpeboyle-2-pk-redder-stolpen-uten-a-grave`
— "Gjerdestolpebøyle 2-pk – Redder To Stolper uten å Grave", 1179 kr
(jämförpris 1539 kr vid avläsning).

**COGS:** batch-sheet #6 (`1zGcVdwHVdvTD3t894FdFw--9fL8B5v5oMH5kK2XWM-I`),
raden "Staketstolps-reparationsbygel med markspett", NORWAY-blockets Qty 1
Total ex. tax = 42,10 EUR. ECB-dagskurs 2026-09-13: 10,778132 NOK/EUR →
453,76 kr. BE-ROAS = 1179/(1179−453,76) = **1,63**.

**Prispolicy:** källvideornas CS-koncept hävdar "30 % rabatt", men
1179/1539 = 23,4 % — under claimen. Jämförpriset höjt i Shopify NO
(`tools/shopify-fix-compareat.mjs --market NO --product-id 15552229933431
--rabatt 30`) 1539 → **1685 kr**, claimen ändrades aldrig. Samma logik
tillämpad på bildannonsernas "30 % RABATT"-claim (samma pris, samma fix).

**Kvot:** 8 786 api-krediter vid start — gott om marginal för 1 produkt.

## Fas 1 — Proofread + lokalisering

12/12 proofread-sessioner klara (4 misslyckades första försöket, fångades av
omkörning enligt kommandots regel). Norska manus skrivna av copy-subagent
(sonnet): produktnamn rättat "Staketstolpslagaren" → "Gjerdestolpebøylen"
(inte direktöversatt), geo-referenser bortgeneraliserade ("svenska
hemmafixare" → "hjemmefiksere", "Tusentals svenska hem" → "Tusenvis av
hjem"). Regexgrind grön: inga SEK-belopp, inga svenska ord, timecodes
identiska med originalen på alla 12. En stray `</content>`-rad som
subagenten skrivit i alla 12 filer städades bort före apply. SRT verifierad
persisterad på HeyGen (apply) 12/12.

## Fas 2 — Rendering + captions

12/12 renderade och nedladdade (176 krediter, 8 786 → 8 497 efter render +
proofread). Källskanning bekräftade inbränd svensk text i alla 12
(y≈1300–1392 i 1080×1920) → alla fick captions. `no-captions.py`: 12/12
✓ ingen text utanför bandet, band automatiskt uppmätt och höjt för
tvårads-cues (1263:1429 / 1215:1381). 36 QA-bilder granskade — inget
svenskt synligt i någon. Slutkortssvep: 12/12 rena, ingen svensk
domän/pris. Röstkollen (`pipeline/rostkoll.py`): 12/12 gröna (endast
informativa noter om replikslut, inget avhugget).

## Fas 3 — Launch i Magiborsten NO

Kampanj **"Gjerdestolpebøyle NO | BE-ROAS 1,63 | 2026-09-13"**
(`120252216935950233`), CBO 1000 kr/dag, ACTIVE — API-verifierad.
4 adsets (CS/GT/PD/SP), alla ACTIVE — API-verifierad. 12 videoannonser
ACTIVE/ACTIVE — API-verifierad (kontot rate-limitat, Meta-fel 17, under
PD- och SP-adsetens skapande; inbyggd backoff löste det).

## Fas 3.2 — Bildannonser

4 bildannonser (CS/GT/PD/SP). Kie AI (`google/nano-banana-edit`) rensade
svensk text — GT och PD behövde ett andra pass (första passet lämnade
kvar rubriktexten på GT, la till felaktiga vita "piller" i stället för ren
bakgrund på PD). Norsk text ritad deterministiskt med PIL på positioner
uppmätta ur källbilderna med numpy (`measure.py`). Alla 4 QA:ade visuellt
mot originalen. Laddade in i respektive koncepts befintliga adset —
`no-image-ads.mjs`s adName-regex (`/_\d+$/`) matchade inte våra
H-suffixade videonamn (`..._1_H1`) och rapporterade falskt "finns redan";
skrev ett fristående `image-ads-upload.mjs` i batchmappen med korrekt
`<Produkt>_NO_<K>_2_1`-namn i stället för att ändra det delade skriptet.
4/4 skapade ACTIVE — API-verifierad (PENDING_REVIEW/IN_PROCESS, normalt
för nya annonser).

**Kontoverifiering, alla 16 annonser:** 12 video ACTIVE/ACTIVE, 4 bild
ACTIVE/(PENDING_REVIEW|IN_PROCESS).

## Fas 3.5 — Drive-leverans

Ny mapp **"NO Staketstolpsbygel"** (`1erzepjQGbb0ea5uLqEl5QgjH6xZcoNTo`)
skapad i MAKE TO NORWAY med Drive-connectorn. Uppladdat: 12 videor,
4 bildannonser, 4 ADCOPY-txt (`drive-push.mjs`, Apps Script-brevlådan).

## Krediter

Före: 8 786 api-krediter. Efter: 8 497. **Förbrukat: 289** (~113 på 12
proofreads + omkörning, 176 på 12 renderingar).

## Kö

Inga fler kandidater — 6 av 7 produktmappar i LAUNCHED redan täckta, den
sjunde (Staketstolpslagare) körd i natt. Ingen kö till nästa natt.
