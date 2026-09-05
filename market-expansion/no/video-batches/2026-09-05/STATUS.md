# NO-videobatch 2026-09-05 — status

Rutin: `/translate-no` (`.claude/commands/translate-no.md`). Källa: Drive-mappen
LAUNCHED (`1-vbYhYgTEv7zYptW5rGmgKAITmAz4l1X`).

## Inventering (Fas 0)

20 produktmappar i LAUNCHED (exkl. WINNERS/LOSERS/MAKE TO NORWAY). Rekursiv
listning av MAKE TO NORWAY (inkl. undermappen WINNERS) + Meta-kontot
(`act_1050941584152547`, 28 kampanjer) visade att 17 av 20 redan var täckta.

**3 kandidater**, bokstavsordning: Bordtennisnät Infällbart, Diskställ i Två
Våningar, Veckodosett 21 Fack. Max 3/natt — ingen kö kvar efter denna körning.

## Resultat

| Produkt | Läge | Orsak |
|---|---|---|
| Bordtennisnät Infällbart | ⚠️ Överhoppad | Fortsatt ingen Norge-kostnad i batch-sheet #1–#5.1 (samma fynd som 2026-09-03/04). Problemmeddelande skickat till #problems-no. |
| Diskställ i Två Våningar | ✅ Launchad ACTIVE | Se nedan. |
| Veckodosett 21 Fack | ✅ Launchad ACTIVE | Se nedan. |

## Diskställ i Två Våningar → Oppvaskstativ NO

- **Pris:** 789 kr (før 1026 kr = 23 %, matchar den svenska annonsens eget
  påstående "23% RABATT" rakt av — ingen prisjustering behövdes).
- **COGS:** batch-sheet #5.1, "Two-tier dish rack", NORWAY-blockets Total ex.
  tax Qty 1 = 28,43 EUR × 10,805183 NOK/EUR (ECB-dagskurs) = 307,20 kr.
  BE-ROAS = 789/(789−307,20) = **1,64**.
- **Videor:** 12/12 proofread → SRT-lokalisering (sonnet-subagent) → HeyGen-
  render → captions. En rad ("Bästa 300-lappen jag spenderat på länge") var en
  svensk vardaglig sedelreferens, inte en exakt prisangivelse — omskriven till
  "Beste femhundrelappen jeg har brukt på lenge" (norsk sedel, behåller
  känslan). Inga andra SEK-belopp kvar, verifierat med regexgrind.
- **QA:** alla 12 videors QA-bilder (36 st) granskade — inget svenskt syns,
  bandet korrekt utsuddat, norsk text i egen ruta. Slutkortssvep gjort på alla
  12, inga svenska domäner/priser i bild.
- **Levererat:** 12 mp4 i chatten (5 zip ≤30 MiB). Drive: MAKE TO NORWAY →
  "NO Diskställ i Två Våningar" (ny mapp, skapad via Drive-connectorn): 12 mp4
  + 4 adcopy-txt uppladdade.
- **Launchad ACTIVE:** kampanj-ID 120252091155690233, "Oppvaskstativ NO |
  BE-ROAS 1,64 | 2026-09-05", CBO 1000 kr/dag. 4 adsets (CS/G/PD/SP), 3
  videoannonser vardera (12 totalt). Kontot var hårt rate-limitat (Meta-fel
  17) på PD- och SP-adseten — gick igenom med skriptets inbyggda backoff.
- Bildannonser (Fas 3.2) INTE körda denna natt — se anteckning i slutet
  (samma kända lucka som 2026-09-04).

## Veckodosett 21 Fack → Ukedosett NO

- **Pris:** 319 kr (før 415 kr = 23 %).
- ⚠️ **Faktafel hittat och rättat:** den svenska CS-bildannonsens ADCOPY-doc
  påstod "50% RABATT" — det stämmer inte med verklig prissättning i varken
  Sverige (389/506 SEK = 23 %) eller Norge (319/415 NOK = 23 %). Video-manusen
  för samma koncept angav redan korrekt 506/389 kr. Norsk copy skriven med
  verklig 23 % genomgående (video och Meta-adcopy), aldrig 50 %. Ingen
  Shopify-prisändring gjord — felet låg i marknadstexten, inte i priset.
- **COGS:** batch-sheet #5.1, "Weekly pill organizer, 21 compartments",
  NORWAY-blockets Total ex. tax Qty 1 = 11,37 EUR × 10,805183 = 122,86 kr.
  BE-ROAS = 319/(319−122,86) = **1,63**.
- **Videor:** 12/12 proofread → SRT-lokalisering (sonnet-subagent) → HeyGen-
  render → captions. Inga andra SEK-belopp eller svenska ord kvar, verifierat
  med regexgrind.
- **QA:** alla 12 videors QA-bilder (36 st) granskade — inget svenskt syns.
  Produkten har engelska veckodagsetiketter (MON/TUE/…) inbränt i den fysiska
  produktdesignen (Temu-tillverkarens etikett, inte en caption) — normalt,
  syns i alla marknader, ingen åtgärd. Slutkortssvep gjort, inga svenska
  domäner/priser i bild.
- **Levererat:** 12 mp4 i chatten (7 zip ≤30 MiB). Drive: MAKE TO NORWAY →
  "NO Veckodosett 21 Fack" (ny mapp): 12 mp4 + 4 adcopy-txt uppladdade.
- **Launchad ACTIVE:** kampanj-ID (se nedan, launch pågick vid skrivande —
  uppdateras när klar), "Ukedosett NO | BE-ROAS 1,63 | 2026-09-05", CBO
  1000 kr/dag, 4 adsets (CS/G/PD/SP), 12 videoannonser.
- Bildannonser (Fas 3.2) INTE körda denna natt.

## Bildannonser (Fas 3.2) — inte körda igen, KÄND LUCKA

Samma avvikelse som 2026-09-04: videobatchen (24 videor, två launchar) tog
hela tidsbudgeten. Diskställ har 4 st `*_2_1.png`-bildfiler i Drive-mappen,
Veckodosett har 3 st (CS/G/SP, ingen PD). Ingen av dem rensad/översatt än.
Bör tas igen i en kommande körning eller manuellt.

## Kvot

HeyGen: 20 581 → 19 937 (644 credits, 24 videor proofreadade + renderade,
inga misslyckade sessioner utom en transient 502 som återskapades automatiskt).
