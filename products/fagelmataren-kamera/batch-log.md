# Batch-logg — Fågelmataren med Kamera

## Batch #1 (förstabatch) — 2026-09-19 (`/rond-auto` steg 4b)

**Trigger:** `annonsbehov` flaggade `forsta_batch`: produkten har passerat
1 500 kr total spend (2 025 kr) och ligger på 33,2 % vinst av omsättningen,
alltså över tröskeln 20 %. Kampanjen kontrollerad **ACTIVE** direkt före
batchen — budgeten höjdes dessutom 1 000 → 1 200 kr samma morgon av ronden.

**Underlag:** livstidsdata ur Meta 2026-09-19 — 2 025 kr spend, 3 köp,
ROAS 3,61, intäkt 7 300 kr. AOV 2 433 kr → break-even-CPA 1 475 kr, CPA 675 kr.

⚠️ **Ingen dom fälld på någon annons.** Grinden är 300 kr OCH 3 köp och ingen
av de 16 befintliga annonserna klarar båda. Batchen bygger därför på
produktsidans egna fakta och på kontots generella playbook (CS starkast,
GT näst) — **inte** på den här produktens data. Det är ett antagande och är
märkt som sådant i `dna.md`.

**Ny Notion-hub skapad i samma steg:** *Bird feeder with camera creative hub*
(`3e0270ab-908c-818b-9630-cd66fb6f7db6`,
`collection://2fa270ab-908c-82e9-9a4a-8763b56702bd`), duplicerad ur
**MALL Creative hub MALL** enligt `/rond-auto` steg 4b. Ärver engelska statusar
och Typ-alternativ. Inskriven i `agent/produktkarta.json`.
⚠️ Åtkomsten ärvs från mallen och går inte att sätta via API:t — säger
redigerarna att de inte ser hubben är det en fråga till Axel, ingen mätning
i verktyget kan avgöra det.

### Briefer i denna batch — 15 st (6 video, 6 statiska, 3 BOF-bilder)

| Annons | Format | Hypotes | Källa |
|---|---|---|---|
| Fagelmatare_PD_4_H1 | Video | Sidans egen öppningsrad ("du hör fåglarna men hinner aldrig fram") som hook, hela konflikten i ordning | Produktsidan |
| Fagelmatare_CS_4_H1 | Video | Prisankaret 1 659 mot 2 159 kr — 500 kr | Playbook: CS är kontots starkaste vinkel |
| Fagelmatare_GT_1_H1 | Video | Mottagaren som redan sitter vid fönstret | Playbook: GT näst starkast per spendkrona |
| Fagelmatare_OB_1_H1 | Video | "Måste jag dra ström dit?" — solcellspanelen visad | Sidans egen rad |
| Fagelmatare_CO_1_H1 | Video | Fienden är den vanliga fågelmataren kunden redan har | Sidans rad "du vet att de äter, bara inte vilka" |
| Fagelmatare_UG_1_H1 | Video | Upptäckten i jag-form, en tagning | Sidans artnamn (talgoxe, blåmes, domherre, nötväcka) |
| Fagelmatare_PD_5_1 | Statisk | Delad bild: sittrampen i verkligheten / i appen | Produktsidan |
| Fagelmatare_CS_5_1 | Statisk | Prisankaret som bild | CS-vinkeln |
| Fagelmatare_G_4_1 | Statisk | Funktionslista med callouts, noll adjektiv | Låsta fakta |
| Fagelmatare_OB_2_1 | Statisk | "Är den krånglig att koppla ihop?" — instruktionerna i förpackningen | Sidans egen rad |
| Fagelmatare_TR_1_1 | Statisk | **Leder med begränsningen:** den känner INTE igen arten åt dig | Låsta fakta + copy-reglerna |
| Fagelmatare_LI_1_1 | Statisk | Listicle på enbart belagda sidfakta | Produktsidan |
| Fagelmatare_BOF_1_1 | Statisk | BOF: bara siffran | CS-vinkeln |
| Fagelmatare_BOF_2_1 | Statisk | BOF: strömfrågan i en bild | Sidans egen rad |
| Fagelmatare_BOF_3_1 | Statisk | BOF: den genomskinliga foderbollen | Sidans egen rad |

**Inga review-bilder.** Produkten har noll recensioner (kontrollerat live
2026-09-19). Regeln är att citatet ska vara ordagrant eller inte finnas alls.

**Numrering:** upptagna AD-ID i kontot avlästa före batchen — CS 1–3, G 1–3,
PD 1–3, SP 1–3 (plus varianter `_1`). Nästa lediga blev CS 4, G 4, PD 4;
GT, OB, CO, UG, TR, LI och BOF är nya koncept-ID för produkten.

**Ingen Drive-mapp skapad** av den här körningen. Produktens befintliga mapp
länkas i varje brief (`1sI8BaGJ06W_FFDzBx_aTZ0L-0aWPmLdC`, från Notion-raden
"10 Fågelmatare med kamera" i Product test center). En `Batch #1`-undermapp
ska läggas INUTI den, aldrig i `BÄVER/Products`.

### ⚠️ Samma dag gick OPS-startskottet

Produkten klarade också startskottets tröskel och larmet postades i
`#ops-startskott`: 2 025 kr spend, 3 köp, CPA 675 kr mot break-even-CPA
1 475 kr, ROAS 3,61, 33,2 % vinst. Den ska alltså få både den här batchen
**och** en egen OPS-butik. Startskottet är loggat som `OPS_STARTSKOTT` och
går inte ut igen.

⚠️ **Tre köp är ett tunt underlag för en AOV.** CPA och break-even-CPA i
startskottet är räknade ur Metas egna tal (spend × ROAS / köp), inte gissade —
men med 3 köp rör sig AOV:n mycket på nästa order. Läs om siffran innan den
används till något större än larmet.
