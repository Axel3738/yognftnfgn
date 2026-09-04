# Batch-logg — Medicinasken i Fickformat

## Batch #0 — originalannonserna (launch 2026-09-02, före OS:et)
4 statiska annonser (PD_2_1, CS_2_1, SP_2_1, G_2_1) launchade i en
kampanj/ett adset, byggda ur fyra Drive-copydokument (`ADCOPY_PD/CS/SP/G`).
Livstidsutfall (avläst 2026-09-04, `maximum`): 2 025,32 kr spend, 2 köp,
ROAS 0,49 mot break-even 1,60. Kampanjen stängdes AV av `/rond-auto`s
huvudflöde tidigare samma dag (trappan). Se `dna.md` för full analys, inkl.
**två BLOCKER-fynd i källmaterialet**: en påhittad kundrecension
("Verifierad kund, 62 år" + "Tusentals nöjda kunder"/"Verifierade
recensioner" — produkten har 0 recensioner) i `SP_2_1`/`ADCOPY_SP`, och
fabricerad brådska ("Nästan slutsåld", fel jämförpris 376 kr i stället för
381 kr) i `CS_2_1`/`ADCOPY_CS`.

**Utöver de fyra launchade annonserna ligger 12 producerade videor oanvända
i produktens Drive-mapp** (PD/CS/SP/G × 1–3, alla från 2026-09-03) — aldrig
uppladdade, aldrig granskade av OS:et. Flaggat i `dna.md` och `backlog.md`,
inte briefat om i denna batch (video kan inte bedömas utan transkript, och
inget transkript är gjort).

## Batch #1 — 2026-09-04 (`/rond-auto` steg 4b, `ersatt`-behov, specialregel:
produkten saknade minnesfiler → `forsta-batch.md`-flödet körs, men loggas
`CS_BATCH_KLAR` inte `FORSTA_BATCH_KLAR` eftersom kampanjen redan haft spend
och fyra launchade annonser innan minnessystemet fanns)

**Kampanjen var redan PAUSAD av trappan när denna batch byggdes.** Den här
körningen har inte rört Meta-status. Ingen annons i kontot är bevisad —
kampanjnivån (0,49 ROAS mot 1,60) är det enda som nått signifikans.

15 briefer: 6 video + 6 statisk + 3 BOF + **0 review** (produkten har 0
recensioner — se dna.md; Drive-filen `..._REVIEW` är en icke-importerbar
exempelmall, inte kunddata, och används därför inte). Matchar
forsta-batch.md:s FAS 8/9-minimum minus review-serien, motiverat rakt ut.
`node pipeline/quota.mjs` känner inte produkten (bara i
`agent/produktkarta.json` som rond-produkt, inte i `products/products.json`)
— FAS 8/9-minimumet används som facit.

**Två hårda förbud i denna batch, direkt ur teardownen (se dna.md):** ingen
brief innehåller en påstådd kundrecension/stjärnbetyg/"tusentals kunder"
(0 riktiga recensioner finns), och ingen brief innehåller fabricerad
lagerknapphet eller brådska. Priset skrivs alltid 289 kr / jämförpris
**381 kr** (rättar källmaterialets 376 kr-fel).

| Annons | Format | Hypotes | Källa |
|---|---|---|---|
| Medicinask_PD_4_H1 | video | Morgonrutin: fylla sju fack för veckan, boxen ÖPPEN (PD_2_1 visar bara stängd) | PD_2_1 (kampanjens starkaste signal, 82 % av spend/båda köpen) + ADCOPY_PD (ärlig, ej fabricerad) |
| Medicinask_PD_5_H1 | video | "Öppnas med en hand" — tummen släpper spärren, aldrig testad USP | produktsidan (WebFetch 2026-09-04) |
| Medicinask_PD_6_H1 | video | "Sju fack håller isär dagarna" — närbild på fyllning, kärnbudskapet i rörelse | produktsidan + PD_2_1:s textbudskap, nytt visuellt bevis |
| Medicinask_CS_4_H1 | video | Ärligt erbjudande: 289 kr / spara 92 kr (24 %) mot 381 kr, ingen fabricerad brådska | rättelse av CS_2_1/ADCOPY_CS:s BLOCKER-fynd (fel pris + påhittad knapphet) |
| Medicinask_SP_4_H1 | video | Fickstorlek bevisad i bild (bredvid en kortlek/mobil), inget påstått kundcitat | produktsidan ("mindre än en kortlek") + rättelse av SP_2_1/ADCOPY_SP:s BLOCKER-fynd (påhittad recension) |
| Medicinask_G_4_H1 | video | Genuin present-scen (inslagning), ingen "hon sa"-dialog påstådd som citat | ADCOPY_G (ärlig ad-narration, ej attribuerad som recension) + G_2_1 (brus-nivå CTR, ej bevis) |
| Medicinask_PD_7_1 | bild | Nära iteration av PD_2_1 — boxen öppen, sju fack synliga | PD_2_1 |
| Medicinask_PD_8_1 | bild | "Öppnas med en hand" närbild, statisk | produktsidan |
| Medicinask_PD_9_1 | bild | Färgval Vit/Grön sida vid sida, samma pris — aldrig testad variabel | produktsidan (variant-info) |
| Medicinask_CS_5_1 | bild | Ärligt erbjudande statisk, korrekt 381 kr-jämförpris | rättelse av CS_2_1:s prisfel |
| Medicinask_SP_5_1 | bild | Fickstorlek-jämförelse statisk, inget kundcitat | produktsidan, samma rättelse som SP_4_H1 |
| Medicinask_G_5_1 | bild | Presentförpackning statisk (två askar i presentask) | G_2_1 (samma visuella idé, redan i kontot, men ny bild) |
| Medicinask_BOF_1_1 | bild (BOF) | Pris/erbjudande: 289 kr, spara 92 kr (24 %), jämförpris 381 kr — korrekt siffra | produktsidan, rättar källmaterialets 376 kr-fel |
| Medicinask_BOF_2_1 | bild (BOF) | 30 dagars öppet köp som riskreducering | produktsidan + konkurrenten Plocker Butiken (samma garanti-mekanism i Ad Library) |
| Medicinask_BOF_3_1 | bild (BOF) | Tätslutande lock / håller tabletterna torra på resande fot — invändningshantering | produktsidan |

**0 review-bilder** — produkten har 0 recensioner (verifierat dubbelt: publik
produktsida + Drive-mappens "REVIEW"-fil är en icke-importerad exempelmall).
Byggs om en riktig recension tillkommer, aldrig innan.

**Datakälla för produktfakta:** `mcp__Shopify__*` var inte kopplad/tillgänglig
i den här sessionen — pris, USP:er och avsaknaden av recensioner hämtade via
`WebFetch` av den publika produktsidan 2026-09-04.

**Modellpolicy-avvikelse:** inget Agent/Task-verktyg för att spawna en
sonnet/haiku-subagent var tillgängligt i den här körningen (verifierat via
`ToolSearch` — samma avvikelse redan dokumenterad denna vecka för
Bordtennisnätet, Soptunneklistermärkena, Kranskydd Frost 420D,
Övervakningskameran och Damasker Vandring). All copy i denna batch är
därför skriven av huvudsessionen själv. Tre-frågorstestet
(`docs/copy-regler.md`) är kört rad för rad i varje brief, inline i
Notion-itemet — ingen rad med ❌ levererades.

Launch-regel: **separat test-ABO, lika budget per annons** (CLAUDE.md regel
11) gäller när/om dessa launchas — den här körningen levererar bara briefer
och rör inte Meta.

**Levererat 2026-09-04:**
- Notion: ny hub **"Medicine box creative hub"** (produkten saknade helt en
  creative hub — bred sökning på "Medicin", "Pill box", "Medicine box",
  "Seven Grid" och "creative hub" gav noll träffar), duplicerad från
  "Creative hub MALL", 15 items, Typ "Video - Pending Approval" (6) /
  "Image - Pending Approval" (9), Status Draft. Ett item öppnat och
  verifierat med `notion-fetch` innan `CS_BATCH_KLAR` loggades.
- Drive: `Batch #1`-mapp skapad i produktens befintliga mapp (Joshs,
  `LAUNCHED`-undermappen i `BÄVER/Products`), med en undermapp per annons
  (15 st).
- `agent/produktkarta.json`: Medicinasken-posten kompletterad med
  `notion_hub_id`, `notion_hub_datakalla`, `notion_hub_namn`,
  `drive_produktmapp_id`, `minne`.
- `agent/budgetlogg.jsonl`: rad `CS_BATCH_KLAR` loggad.
