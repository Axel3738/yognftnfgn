# AdventLane (kalender) — batch-logg

OPS-butik nr 5, nischbutik för adventskalendrar. Första produkten är
Racingkalendern, byggd på Bäverbutikens identiska produkt. Ingen egen annons
har körts ännu. Det som står här är **ärvd historik**: de brand-swappade
annonserna bär med sig sitt bevisade DNA från källbutiken.

Källa: Meta Graph 2026-09-10, `date_preset: maximum`, båda källkontona.
Rådata: `factory/output/adventskalender-racingbilar/kallannonser.json`.

---

## Batch #0 (ärvd) — Bäverbutiken SE, launch 2026-09-08

Kampanj `Adventskalendern Racingbilar | BE ROAS 1.62 | Launch 2026-09-08`
(`120250134672020291`, MagiBorsten `1867947880635861`), ACTIVE. 16 annonser
(12 video + 4 bild), alla ACTIVE i fyra adsets (PD, GT, CS, SP).
**2 342 kr spend, 12 köp, CPA 195 kr** — efter två dygn.

Break-even-CPA 308 kr (499 − 191). Bara annonser över grinden (300 kr eller
3 köp) får en dom.

| Annons | Vinkel | Format | Spend | Köp | ROAS | CPA | Vinstbidrag `(308 − CPA) × köp` |
|---|---|---|--:|--:|--:|--:|--:|
| `PD_2_1` | choklad vs bilar | bild | 1 136 | 7 | 4,22 | 162 | **+1 022 kr** |
| `GT_1_H1` | gåvogivaren | video | 478 | 2 | 2,82 | 239 | +138 kr (2 köp — indikation) |
| `PD_2_H1` | choklad vs bilar | video | 475 | 3 | 3,89 | 158 | +450 kr |

Övriga 13 annonser: 0–57 kr spend, 0 köp. Ingen dom.

Hypoteserna bakom de fyra vinklarna (ur källcopyn):
- **PD** — konflikten chokladkalender (10 sekunder) vs bilar (hela december). **Bevisad.**
- **GT** — gåvogivaren: "han älskar bilar", "se blicken när han öppnar". Indikation.
- **CS** — rabatt 649→499 med brådska ("bara idag", "slut innan jul"). Under grinden. Brådskan följer inte med till AdventLane.
- **SP** — femstjärnigt kundcitat. Under grinden. Citatet var påhittat; ersatt med riktiga recensioner.

## Batch #0 NO (ärvd) — Magiborsten NO, launch 2026-09-09

Kampanj `Adventskalender NO | BE-ROAS 1,62 | 2026-09-09` (`120252140554000233`,
Magiborsten NO `1050941584152547`, NOK), 16 annonser ACTIVE, 1 200 NOK/dag.
Toppar: `SP_3` video 487 NOK / 2 köp (ROAS 2,53), `SP_2_1` bild 315 NOK / 3 köp
(ROAS 4,35), `G_2_1` bild 156 NOK / 0. Valutor summeras aldrig med SE.

## Batch #1 — AdventLane SE (byggd 2026-09-10 av `/ny-annonser`, PAUSED)

Axels regel 2026-09-10: HELA källkampanjen kopieras, bara felaktiga ytor
ändras, allt PAUSED tills han skriver "Launch: adventlane" med butiken live.

Kampanj `ADVENTLANERACING_SE_Racingkalendern | BE-ROAS 1,62 | 2026-09-10`
(`120249031845500172`, MagiBorsten DK `915422744950975`, SEK, 1000 kr/dag CBO,
PAUSED). Länk `https://adventlane.se/products/adventskalender-racingbilar`
(domänen inte kopplad än). Sida `1304279782771044`, pixel `1013287061762227`.

Vad som följer med (16 av 16, `se-byggplan.json`):
- **12 orörda** (bara länken bytt): PD_1/2/3_H1, GT_1/2/3_H1, CS_1/2/3_H1,
  PD_2_1, GT_2_1, CS_2_1. Priset 649→499 är identiskt. CS-brådskan ("bara
  idag", "begränsat lager") står kvar — den är en anmärkning, inte ett fel.
- **4 ändrade (SP):** copyraderna "30 dagars öppet köp" → "14 dagars
  ångerrätt", det påhittade citatet + "Verifierad kund, 34 år" → Johans
  riktiga recension ("Sonen längtar till varje dag", en av 10 femstjärniga),
  headline likaså. SP_2_1 fick bildens band omskrivet på samma sätt
  (`output/…/bildfix/AdventLaneRacing_SP_2_1.jpg`). Talet i SP-videorna orört.

Läge 2026-09-10 11:20: 12 videor uppladdade, kampanj + adsets GT/PD skapade,
noll annonser — `adcreatives` svarade (#200), Axels användare saknade roll på
sidan. **Axel gav rollen 14:20, och 14:45 låg alla 16 annonser uppe, PAUSED**
(4 adsets PD/GT/CS/SP). Räkningen `rakning.mjs kalender`: **KLART, exit 0**,
16 av 16. Tillbakaläst (`kampanjkoll.mjs --vantat 16`): PAUSED på alla
nivåer, sida 1304279782771044, länken rätt, 1000 kr/dag.
Meta slog i annonskontots anropsgräns (fel 17, "User request limit reached")
efter ~40 uppladdningar — skripten väntar och försöker om själva; hela bygget
tog 2,5 timme av den anledningen.

## Batch #1 NO — AdventLane NO (byggd 2026-09-10, PAUSED)

Kampanj `ADVENTLANERACING_NO_Racingkalendern | BE-ROAS 1,62 | 2026-09-10`
(`120249031977180172`, samma konto, 1000 kr/dag CBO, PAUSED, geo NO). Länk
`https://adventlane.se/nb/products/adventskalender-racingbilar`.

Norska halvan läst ur Magiborsten NO (`brand-detektor-no.md`, 12 transkript
via HeyGen proofread + OCR på 700 frames). 16 av 16 dömda.

**Axels prisbeslut 14:30 (skärmdump ur källans NO-marknad):** 439 kr, jämför
579, paket 746,30 / 1 053,60 NOK — samma som Bäverbutiken NO. Står i
produktfilen (`priser_marknad.NO`). Det gjorde annonsernas "579 → 439 kr"
till RÄTT pris: de 4 CS-annonserna som väntat på NOK-nivå byggs orörda, och
de 9 videoannonser som redan skapats med "439 kr" struket ur beskrivningen
raderades (PAUSED, 0 spend, egna) och byggdes om med copyn ordagrant.

`no-byggplan.json`: **16 av 16 byggs, 0 väntar.** Enda ändringen i copyn:
"30 dagers åpent kjøp" → "14 dagers angrerett". SP_2_1 fick bildens band
omskrivet (Johans recension på bokmål, `bildfix/AdventLaneRacing_NO_SP_2_1.jpg`).

Läge 15:50: **16 av 16 uppe, PAUSED**, 4 adsets SP/G/PD/CS. Räkningen KLART,
exit 0. Tillbakaläst: PAUSED på alla nivåer, sida och länk (`/nb/…`) rätt.

## Launch 2026-09-10 17:24 — båda kampanjerna ACTIVE

Axel: "Launch Adventlane" (16:5x). Kontroller före (steg 11b), alla mätta:
- Butiken live: adventlane.se svarar 200 utan `/password`, produkt-JSON
  `available: true`, pris 49900 öre. Domänen kopplad, butiken döpt AdventLane.
- Pixeln 1013287061762227 avfyrad 17:10 (WeTracked ligger i temat).
- NOK: Axel slog på NOK på Norge-marknaden; fabriken satte katalog + prislista
  med fast 439 kr (jämför 579) via API, tillbakaläst `contextualPricing NO`.
Verkställt 17:24: SE `120249031845500172` och NO `120249031977180172` —
kampanj ACTIVE, 4 adsets ACTIVE, 16 annonser ACTIVE vardera, 1000 kr/dag
CBO per kampanj. Metas annonsgranskning pågår därefter (effective_status).

Nästa avläsning: `/skalningskungen kalender` var tredje dag. Break-even-CPA
SE 308 kr (499 − 191). NO räknas i NOK (439 − inköp i NOK), aldrig ihop med SE.
