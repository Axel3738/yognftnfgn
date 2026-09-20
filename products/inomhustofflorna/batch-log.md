# Batch-logg — Inomhustofflorna i Kamouflage

## Batch #1 (förstabatch) — 2026-09-20 (`/rond-auto` steg 4b)

**Trigger:** `annonsbehov` flaggade `forsta_batch`: 1 912 kr total spend
(över 1 500 kr) och 24,3 % vinst av omsättningen (över 20 %). Kampanjen
kontrollerad **ACTIVE** direkt före batchen.

**Underlag:** livstidsdata ur Meta 2026-09-20 — 1 912 kr, 8 köp, ROAS 2,58,
intäkt 4 939 kr. AOV 617 kr → break-even-CPA 383 kr. En bedömbar annons
(SP_1_H2, 8 köp, +2 195 kr — bär alla köp). Se `dna.md`.

**Feedback-rad i hubben:** ingen hub fanns före i dag — ingen `Brief review`
att följa. **Annonsidéer:** inga rader för Inomhustofflorna (alla fem
"Ny"-rader gäller Taköverdraget).

**Ny Notion-hub skapad i samma steg:** *Indoor slippers creative hub*
(`3e1270ab-908c-8131-a121-fe435a4e22aa`,
`collection://63a270ab-908c-8215-a509-87aeee113477`), duplicerad ur
**MALL Creative hub MALL**. Inskriven i `agent/produktkarta.json`.
⚠️ Åtkomsten ärvs från mallen och går inte att sätta via API:t.

### Briefer i denna batch — 17 st (6 video, 6 statiska, 3 BOF, 2 recension)

| Annons | Format | Variabeltaggar | Hypotes | Källa |
|---|---|---|---|---|
| Inomhustofflor_SP_3_H1 | Video | Angle: social proof · Hook: skeptiker · Format: närbild → demo · Proof: ordagrant citat (Thomas Berg) · Offer: pris i slutet | Vinnarens struktur, beviset bytt till ett riktigt citat | SP_1_H2 + Judge.me |
| Inomhustofflor_SP_3_H2 | Video | Samma, Proof: DEMO (remmen i trappan) | Isolerar bevistyp mot SP_3_H1 | SP_1_H2 |
| Inomhustofflor_PD_3_H1 | Video | Angle: pain · Hook: sidans kaffe-rad · Format: demo | Sidans öppningsrad som videohook | Produktsidan |
| Inomhustofflor_CS_3_H1 | Video | Angle: pris · Hook: 489/978, halva priset | Prisankaret på video (den statiska fick 0 köp på 385 kr) | Playbook |
| Inomhustofflor_GT_3_H1 | Video | Angle: gåva · Hook: mannen med uttrampad häl | Gåva näst starkast i kontot, konkret mottagare | Playbook + sidan |
| Inomhustofflor_CO_1_H1 | Video | Angle: konflikt · Format: gammal toffla vs hälrem i trappan | Sidans egen före/efter | Produktsidan |
| Inomhustofflor_PD_4_1 | Statisk | Plysch häl till tå + rem | Demo som bild | Produktsidan |
| Inomhustofflor_CS_4_1 | Statisk | 489/978/halva priset | Pris som bild | CS-vinkeln |
| Inomhustofflor_CO_2_1 | Statisk | Uttrampad häl vs hälrem | Konflikt som bild | Produktsidan |
| Inomhustofflor_LI_1_1 | Statisk | Listicle, bara fakta | Noll adjektiv | Produktsidan |
| Inomhustofflor_OB_1_1 | Statisk | "Finns den i 47?" | Storleksinvändning | Produktsidan |
| Inomhustofflor_TR_1_1 | Statisk | "Inte för snön." | Begränsningen först — ingen konkurrent signerar | Låsta fakta |
| Inomhustofflor_BOF_1_1 | BOF | Bara priset | — | — |
| Inomhustofflor_BOF_2_1 | BOF | 30 dagar + Klarna | Riskavlastning | Produktsidan |
| Inomhustofflor_BOF_3_1 | BOF | 40–47, khaki/svart | Storlek och färg | Produktsidan |
| Inomhustofflor_RV_1_1 | Recension | Thomas Berg, 5★, ordagrant | — | Judge.me 2026-09-20 |
| Inomhustofflor_RV_2_1 | Recension | Mats Johansson, 5★, ordagrant | — | Judge.me 2026-09-20 |

**Numrering:** upptagna AD-ID i kontot — SP 1–2, PD 1–2, CS 1–2, GT 1–2.
Nya: SP 3, PD 3–4, CS 3–4, GT 3; CO, LI, OB, TR, BOF, RV nya koncept-ID.

**Kvot:** produkten spåras inte av `pipeline/quota.mjs`; förstabatchens
storlek följer `forsta-batch.md`, rondens veckokvot var 2.

**Ingen Drive-mapp skapad.** Produktens befintliga mapp (Joshs,
`1fl1ACX8Q25KnwKUUwPuu9H1pIaTMiZJ-`) länkas i varje brief.

**Modellpolicy:** följd — sonnet-subagent skrev copyn och körde
tre-frågorstestet; huvudsessionen gjorde analys, hypoteser, namn och struktur.

### ⚠️ Samma dag gick OPS-startskottet

1 912 kr spend, 8 köp, CPA 239 kr mot break-even-CPA 383 kr, ROAS 2,58,
24,3 % vinst. Loggat `OPS_STARTSKOTT`. Källänken ur Notion-radens Landing
page, kontrollerad 200.

### Kvalitetsflaggor på LIVE-annonser (rörs inte, flaggade till Axel)
- `SP_1_H2`: citat som inte finns bland recensionerna, "många köper ett par till".
- `PD_1_H2`: "funkar även utanför dörren" mot inomhusregeln.
