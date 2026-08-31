# Batch-logg — Fiskespöhållaren NO (Fiskestangholder 4-pakning)

## Batch #1 — 2026-08-31 (`/forsta-batch`, första riktiga batchen för NO-marknaden)

**Varför:** `agent/rond.mjs` flaggade `forsta_batch`-behov 2026-08-31 —
kampanjen har spenderat >10 000 kr sedan start (2026-08-20) och ligger över
break-even (ROAS 2,28 mot BE 1,36) men har aldrig fått en riktig CS-analys.
NO är en helt ny marknad utan eget CS-system.

**Analys:** se `dna.md`. Nyckelfynd: 92,9 % av spendet har koncentrerats till
EN annons (NO_PD_1, alla tre varianter) trots 11 dagars körning — resten av
kontots 20 annonser har för lite data för dom. Den viktigaste lärdomen: exakt
samma manus presterar helt olika beroende på om miljön är äkta utomhus
(ROAS 2,62) eller iscensatt inomhus (ROAS 1,24, under break-even).

**Kritiskt fynd — pris:** tre motstridiga prisuppgifter i omlopp för samma
produkt (149 / 269 / 289 kr). Ingen kunde verifieras mot en levande sida
(Shopify-åtkomst till beverbutikken.no var nere hela sessionen). Alla nya
briefer i denna batch är medvetet prisfria tills Axel bekräftar.

**Levererat:** 12 nya briefer (6 video + 6 static), varav 11 produktionsklara
och 1 blockerad (recensionscitat saknas, se nedan).

| Annons | Typ | Hypotes | Status |
|---|---|---|---|
| Rodholder_NO_PD_3_H1 | video | Samma vinnande manus, ny äkta miljö (bilbagage) | Klar |
| Rodholder_NO_PD_3_H2 | video | Samma manus, snabbare payoff (macro-öppning) | Klar |
| Rodholder_NO_PD_3_H3 | video | Samma miljö/format som vinnaren, benefit-first vinkel | Klar |
| Rodholder_NO_CS_3_H1 | video | Risk-reversal (Klarna+garanti) utan pris — ersätter den prisosäkra CS_1-gruppen | Klar |
| Rodholder_NO_GT_3_H1 | video | Återanvänder det enda lovande manuset (GT), ny gåva-visuell | Klar |
| Rodholder_NO_SP_3_H1 | video | Äkta UGC-talking-head i stället för underpresterande citat-kort | Klar |
| Rodholder_NO_PD_4_1 | static | Textfri ren produktbild | Klar |
| Rodholder_NO_CO_1_1 | static | Före/efter-jämförelse (floket vs organiserat) | Klar |
| Rodholder_NO_SO_3_1 | static | Kundcitat-collage | **BLOCKERAD — inget verifierat norskt kundcitat tillgängligt** |
| Rodholder_NO_LI_1_1 | static | Listicle, 5 skäl | Klar (en rad flaggad som overifierad produktspec) |
| Rodholder_NO_OF_1_1 | static | Risk-reversal-badge (Klarna+garanti), ingen prissiffra | Klar |
| Rodholder_NO_RI_1_1 | static | Cost-of-inaction/loss-aversion, ingen påhittad statistik | Klar |

**Notion:** ny hub "Fish rod holder NO creative hub" duplicerad från
"Creative hub MALL" (ingen NO-hub existerade), id
`3cd270ab-908c-818f-9059-f333f67559a4`. Alla 12 items skapade som
`Draft` / `Video - Pending Approval` respektive `Image - Pending Approval`.

**Drive:** ingen produktmapp för denna produkt hittades i `MAKE TO NORWAY`
(kontrollerad — 7 andra NO-produkter har mappar där, denna saknas). Ingen
mapp skapades (regeln: skapa aldrig i BÄVER/Products, det är lanseringskön).
Zip-filerna levererades i chatten i stället. Skulle behövts: en mapp
`MAKE TO NORWAY/NO Fiskestangholder 4-pakning` (eller motsvarande SKU-namn)
med undermapp `Batch #1`.

**Kvot:** `node pipeline/quota.mjs` visar bara de 6 SE-skalningsprodukterna i
`products/products.json` — Fiskespöhållaren NO ingår inte i det systemet
(testprodukt, inte en av de fyra skalningsprodukterna). Batchstorleken (12)
följer i stället forsta-batch.md:s egen struktur (FAS 7: 3 + FAS 8: 3 +
FAS 9: 6).

**Modellpolicy — avvikelse:** ingen Agent-/subagent-verktyg med
modellparameter (`model: "sonnet"`) fanns tillgängligt i den här sessionens
verktygslåda. Copyn i denna batch skrevs därför av huvudsessionen direkt,
med docs/copy-regler.md:s tre-frågorstest kört explicit på varje rad i varje
brief (se briefernas egna tabeller). Flaggat som en avvikelse från regel 6,
inte en genväg — nästa körning med tillgång till Agent-verktyget bör
återgå till subagent-flödet.
