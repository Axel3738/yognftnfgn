# NO-videobatch 2026-09-08 — status

Rutin: `/translate-no` (`.claude/commands/translate-no.md`). Källa: Drive-mappen
LAUNCHED (`1-vbYhYgTEv7zYptW5rGmgKAITmAz4l1X`).

## Inventering (Fas 0)

22 produktmappar i LAUNCHED (exkl. WINNERS/LOSERS/MAKE TO NORWAY). Rekursiv
listning av MAKE TO NORWAY (inkl. undermappen WINNERS, 3 st) + Meta-kontot
(`act_1050941584152547`, 32 kampanjer) visade att 19 av 22 redan var täckta.

**3 kandidater**, bokstavsordning: Adventskalender Racingbilar, Bordtennisnät
Infällbart, Bänkhylla med Utdragbar Korg. Adventskalender Racingbilar och
Bordtennisnät Infällbart saknar Norge-kostnad i batch-sheet #1–#5.1
(Bordtennisnät sjätte natten i rad) — båda överhoppade, problemmeddelanden
skickade. Bänkhylla med Utdragbar Korg hade COGS i batch-sheet #5.1 → körd.

## Resultat

| Produkt | Läge | Orsak |
|---|---|---|
| Adventskalender Racingbilar | ⚠️ Överhoppad | Ingen Norge-kostnad i batch-sheet #1–#5.1. Problemmeddelande skickat till #problems-no. |
| Bordtennisnät Infällbart | ⚠️ Överhoppad | Fortsatt ingen Norge-kostnad i batch-sheet #1–#5.1 (sjätte natten i rad). Problemmeddelande skickat till #problems-no. |
| Bänkhylla med Utdragbar Korg | ✅ Launchad ACTIVE | Se nedan. |

Ingen kö till i morgon — de två blockerade produkterna kvarstår tills COGS
fylls i (Axel-beslut, inte något rutinen kan lösa).

## Bänkhylla med Utdragbar Korg → Benkehylle NO

- **Pris:** 939 kr, jämförpris 1221 kr (23 % rabatt), verifierat mot
  beverbutikken.no. Fri frakt over 300 kr bekräftad mot butikens policy-sida.
- **COGS:** batch-sheet #5.1, "Countertop shelf with pull-out basket",
  NORWAY-blockets Total ex. tax Qty 1 = 33,83 EUR × 10,776557 NOK/EUR
  (ECB-dagskurs) = 364,57 kr. BE-ROAS = 939/(939−364,57) = **1,63**.
- **Videor:** 12/12 proofread → HeyGens maskinöversättning var norsk direkt,
  men CS_1/CS_2/CS_3 hade fel pris (849/1104, kopierat rakt av från det gamla
  svenska SEK-priset) — rättat till 939/1221 NOK via sonnet-subagent innan
  render, exakt samma radlängd för lip-sync. Övriga 9 filer (G/PD/SP) redan
  korrekta, ingen prisclaim i dem.
- **Captions:** Beltesliper-stilen, band 1447:1613 (uppmätt + höjt för två
  rader på 11/12, standardläge på 1 där ingen text hittades i zonen). Alla
  36 QA-bilder + slutkortssvep manuellt granskade — inget svenskt synligt,
  rätt norskt pris i CS-videorna.
- **Leverans:** 12 videor som 7 zip-filer i chatten (alla ≤30 MiB). Drive-mapp
  `NO Bänkhylla med Utdragbar Korg` skapad i MAKE TO NORWAY, alla 12 videor +
  4 ADCOPY-txt uppladdade via drive-push.
- **Bildannonser:** 3/3 (CS/G/SP — produkten hade ingen PD-bildannons i källan).
  Kie AI (`google/nano-banana-edit`) rensade svensk text, norsk text ritad med
  PIL (samma layout/positioner som originalen). Levererade i chatten, uppladdade
  till Drive-mappen, inlagda i respektive koncept-adset.
- **Launch:** Kampanj "Benkehylle NO | BE-ROAS 1,63 | 2026-09-08"
  (`120252123868510233`), CBO 1000 kr/dag, ACTIVE. 4 adsets (CS/G/PD/SP) ACTIVE.
  12 videoannonser + 3 bildannonser, alla ACTIVE. Verifierat i API:t.

## Kvot

HeyGen api-krediter: 18 679 → 18 544 (135 krediter för 12 videor, proofread +
render).
