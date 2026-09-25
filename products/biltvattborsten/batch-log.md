# Batch-logg — Biltvättborsten med Teleskopskaft

Breakthrough-frekvens: 0/15 (0 %) (etikett.mjs --frekvens 2026-09-25)

## Batch #1 (förstabatch) — 2026-09-20 (`/rond-auto` steg 4b)

**Trigger:** `annonsbehov` flaggade `forsta_batch`: 1 943 kr total spend
(över 1 500 kr) och 20,2 % vinst av omsättningen (över 20 %). Kampanjen
kontrollerad **ACTIVE** direkt före batchen (`ads_get_ad_entities`).

**Underlag:** livstidsdata ur Meta 2026-09-20 — 1 943 kr, 6 köp, ROAS 2,47,
intäkt 4 794 kr. AOV 799 kr → break-even-CPA 478 kr. En bedömbar annons
(PD_1_H2, 5 köp, +1 398 kr) — preliminär dom. Se `dna.md`.

**Feedback-rad i hubben:** produkten hade ingen hub före i dag, alltså ingen
`Brief review`-rad att följa. **Annonsidéer:** inga rader med Produkt =
Biltvättborsten (alla fem "Ny"-rader gäller Taköverdraget).

**Ny Notion-hub skapad i samma steg:** *Car wash brush creative hub*
(`3e1270ab-908c-810c-9d50-f14ab53b461f`,
`collection://905270ab-908c-8354-935d-071286e4e9b2`), duplicerad ur
**MALL Creative hub MALL** enligt `/rond-auto` steg 4b. Ärver engelska
statusar och Typ-alternativ. Inskriven i `agent/produktkarta.json`.
⚠️ Åtkomsten ärvs från mallen och går inte att sätta via API:t.

### Briefer i denna batch — 17 st (6 video, 6 statiska, 3 BOF, 2 recension)

| Annons | Format | Variabeltaggar | Hypotes | Källa |
|---|---|---|---|---|
| Biltvattborste_PD_3_H1 | Video | Angle: pain · Hook: sidans smärtrad · Format: POV-demo · Proof: 100 cm/25 cm/335 g · Offer: pris i slutet · Talare: röst | Vinnarens POV-demo + sidans egen ryggvärksrad som hook, utan takpåståendet | PD_1_H2 + produktsidan |
| Biltvattborste_PD_3_H2 | Video | Angle: konflikt · Hook: svampen sköljs var tionde sekund · Format: POV-demo | Isolerar hooken mot PD_3_H1 — allt efter hooken identiskt | PD_1_H2 + produktsidan |
| Biltvattborste_CS_3_H1 | Video | Angle: pris · Hook: 799/1 039/240 · Offer: pris i bild sek 4 | Prisankaret är kontots starkaste vinkel, otestat här | Playbook |
| Biltvattborste_G_2_H1 | Video | Angle: gåva · Hook: mottagaren | Gåva näst starkast i kontot; mottagaren = mannen som tvättar sin bil själv | Playbook |
| Biltvattborste_OB_1_H1 | Video | Angle: invändning/ärlighet · Proof: 100 cm mot personbil resp. SUV | Ärlig gräns = raden ingen konkurrent signerar, filtrerar returer | Låsta fakta |
| Biltvattborste_CO_1_H1 | Video | Angle: konflikt · Format: split hink+svamp vs borste | Sidans egen konflikt visualiserad | Produktsidan |
| Biltvattborste_PD_4_1 | Statisk | POV-foto, ryggvärksraden | Statisk tvilling till PD_3_H1 | PD_3_H1 |
| Biltvattborste_CS_4_1 | Statisk | Pris | Prisankaret som bild | CS-vinkeln |
| Biltvattborste_OB_2_1 | Statisk | 100 cm ärligt | Invändningen som bild | Låsta fakta |
| Biltvattborste_LI_1_1 | Statisk | Listicle, bara fakta | Noll adjektiv | Produktsidan |
| Biltvattborste_CO_2_1 | Statisk | Svamp vs borste | Konflikten som bild | Produktsidan |
| Biltvattborste_TR_1_1 | Statisk | 335 gram | Vikten som pekbart faktum | Produktsidan |
| Biltvattborste_BOF_1_1 | BOF | Bara priset | — | — |
| Biltvattborste_BOF_2_1 | BOF | 30 dagar + Klarna | Riskavlastning, ingen fraktclaim | Produktsidan |
| Biltvattborste_BOF_3_1 | BOF | "Räcker den till taket?" | Invändningen besvarad ärligt | Låsta fakta |
| Biltvattborste_RV_1_1 | Recension | Peter, 5★, ordagrant | — | Judge.me 2026-09-20 |
| Biltvattborste_RV_2_1 | Recension | Erik, 5★, ordagrant | — | Judge.me 2026-09-20 |

**Numrering:** upptagna AD-ID avlästa i kontot före batchen — PD 1–2, SP 1–2,
CS 1–2, G 1 (plus `_1`-varianter). Nya: PD 3–4, CS 3–4, G 2; OB, CO, LI, TR,
BOF, RV är nya koncept-ID för produkten.

**Kvot:** `pipeline/quota.mjs` spårar inte produkten (finns inte i
`products/products.json`); förstabatchens storlek följer `forsta-batch.md`
(6 video + 6 statiska + 3 BOF + 2 review), rondens veckokvot var 2.

**Ingen Drive-mapp skapad.** Produktens befintliga mapp (Joshs,
`1qwAOtlYm68VnJ451QCDjlo0b28AmJkK_`) länkas i varje brief; `Batch #1`
läggs INUTI den, aldrig i `BÄVER/Products`.

**Modellpolicy:** följd — en sonnet-subagent skrev all copy och körde
tre-frågorstestet rad för rad; huvudsessionen gjorde analys, hypoteser,
namn och briefstruktur.

### ⚠️ Samma dag gick OPS-startskottet

1 943 kr spend, 6 köp, CPA 324 kr mot break-even-CPA 478 kr, ROAS 2,47,
20,2 % vinst. Loggat `OPS_STARTSKOTT`, går inte ut igen. Källänken kom ur
Notion-radens fält Landing page och svarade 200 vid kontroll.

### Kvalitetsflaggor på LIVE-annonser (rörs inte, flaggade till Axel)
- `PD_1_H2`: "hela taket"/"hela bilen" (100 cm-regeln), "halva tiden",
  "skonar lacken" — obelagda.
- `SP_1_H2`: "Hundratals nöjda bilägare" + citat som inte finns bland de 10
  recensionerna.

## Etiketter dag 7 (2026-09-25) — Biltvättborsten med Teleskopskaft

Etiketten är ingen dom (`bedombar` står bredvid). Annonsens egna första vecka, 7d_click. Källa: `agent/utdata/etiketter-backfill-2026-09-25.md`.

| Annons | Batch | Typ | Etikett (7 d) | Andel | Spend | Köp | ROAS ad / kampanj | Bedömbar | Playbook |
|---|---|---|---|---|---|---|---|---|---|
| Biltvattborste_PD_1_H2 | — | okänd | **SPEND_WINNER** | 51 % | 2458 kr | 5 | 1,63 / 1,16 | ja | KPI-fix: LP-byte, proof, kostnad-av-att-vänta — utförandet, inte idén |
| Biltvattborste_SP_1_H2 | — | okänd | **SPEND_WINNER** | 34 % | 1634 kr | 2 | 0,98 / 1,16 | nej | KPI-fix: LP-byte, proof, kostnad-av-att-vänta — utförandet, inte idén |
| Biltvattborste_CS_1_H3 | — | okänd | **LOSER** | 5 % | 249 kr | 0 | 0,00 / 1,16 | nej | släpp |
| Biltvattborste_SP_1_H3 | — | okänd | **LOSER** | 5 % | 229 kr | 0 | 0,00 / 1,16 | nej | släpp |
| Biltvattborste_PD_1_H3 | — | okänd | **LOSER** | 2 % | 84 kr | 0 | 0,00 / 1,16 | nej | släpp |
| Biltvattborste_PD_1_H1 | — | okänd | **LOSER** | 1 % | 51 kr | 0 | 0,00 / 1,16 | nej | släpp |
| Biltvattborste_SP_1_H1 | — | okänd | **LOSER** | 1 % | 35 kr | 0 | 0,00 / 1,16 | nej | släpp |
| Biltvattborste_CS_1_H2 | — | okänd | **LOSER** | 0 % | 19 kr | 0 | 0,00 / 1,16 | nej | släpp |
| Biltvattborste_SP_2_1 | — | okänd | **LOSER** | 0 % | 15 kr | 0 | 0,00 / 1,16 | nej | släpp |
| Biltvattborste_CS_1_H1 | — | okänd | **LOSER** | 0 % | 13 kr | 0 | 0,00 / 1,16 | nej | släpp |
| Biltvattborste_CS_2_1 | — | okänd | **LOSER** | 0 % | 10 kr | 0 | 0,00 / 1,16 | nej | släpp |
| Biltvattborste_G_1_H3 | — | okänd | **INGEN_LEVERANS** | — | 9 kr | 0 | 0,00 / 1,16 | nej | hooken föll — logga och släpp, aldrig ABO |
| Biltvattborste_PD_2_1 | — | okänd | **INGEN_LEVERANS** | — | 7 kr | 0 | 0,00 / 1,16 | nej | hooken föll — logga och släpp, aldrig ABO |
| Biltvattborste_G_1_H1 | — | okänd | **INGEN_LEVERANS** | — | 5 kr | 0 | 0,00 / 1,16 | nej | hooken föll — logga och släpp, aldrig ABO |
| Biltvattborste_G_1_H2 | — | okänd | **INGEN_LEVERANS** | — | 3 kr | 0 | 0,00 / 1,16 | nej | hooken föll — logga och släpp, aldrig ABO |

