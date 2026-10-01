# Batch-log — Täljsetet 30 Delar (6 knivar och 6 järn)

Breakthrough-frekvens: 1/16 (6 %) (etikett.mjs --frekvens 2026-10-01)

Kampanj `120250349169940291` (MagiBorsten SE), launch 2026-09-24 02:15.
Budget 1 000 → **2 000 kr/dag** (SKALA ×2 2026-09-26 05:54: ROAS 6,37 =
260 % av target; 25/9 VANTA_KONSEKVENT efter ett dygn över target).
Break-even 1,52 ur prissheetet, pris 869 kr / jämförpris 1 139 kr. Minnet
skapades 2026-09-26 av /rond-auto.

## Batch 0 — produkttestet (Product test center, Annabelle/Josh, launch 2026-09-24)

16 annonser, Drive `1IBXKtwHEdjFsTTAtNuIMoJ_ESTO8CmSP` (12 mp4 "Täljset 30
delar_…", 4 png, 4 adcopy-dokument, `Täljset 30 delar_REVIEW`, undermapp
`Assets`). Notion-raden "10 Täljset 30 delar"
`3d9270ab-908c-8100-8655-e5e1f21d2a58` (Status Ads review, Ansvarig
Annabelle Gonzales). Manus/VO: inte transkriberade (ingen ffmpeg) — okända.
Adcopy-dokumenten = live-copyn: PD "Alltid velat prova tälja, men inte vetat
vilka verktyg du behöver?" / G "Vad ger man mannen som redan har allt? …
presenten som blir en hobby" / CS "🚨 REA … Handla nu innan priset går upp
igen" / SP "⭐⭐⭐⭐⭐ Bra set med många verktyg. Knivarna känns bra i handen."
(importrad). Siffror t.o.m. 2026-09-26 06:20 UTC (maximum, 7d_click).

| Annons | Format | Status | Spend | Köp | ROAS | Not |
|---|---|---|---|---|---|---|
| `Taljset_PD_1` | video (25 s) | ACTIVE | 1 038 kr | 4 | 4,41 | top spender, 55 % av spend, CVR 1,3 % (4/302 LPV), thumbnail: unboxing |
| `Taljset_PD_2` | video | ACTIVE | 72 kr | 0 | — | 15 LPV, 1 ATC, 0 köp |
| `Taljset_PD_3` | video (24 s) | ACTIVE | 709 kr | 6 | 7,36 | **högst vinstbidrag**, CVR 3,0 % (6/198 LPV), thumbnail: järnet i handen |
| `Taljset_PD_2_1` | bild | ACTIVE | 8 kr | 1 | 108,35 | 1 köp på 3 klick — för tidigt |
| `Taljset_CS_1` | video | ACTIVE | 1,42 kr | 0 | — | copyn bär "innan priset går upp igen" |
| `Taljset_CS_2` | video | ACTIVE | 9 kr | 0 | — | samma |
| `Taljset_CS_3` | video | ACTIVE | 6 kr | 0 | — | samma |
| `Taljset_CS_2_1` | bild | ACTIVE | 2,59 kr | 0 | — | samma |
| `Taljset_G_1` | video | ACTIVE | 0,21 kr | 0 | — | |
| `Taljset_G_2` | video | ACTIVE | 2 kr | 0 | — | |
| `Taljset_G_3` | video | ACTIVE | 0 | 0 | — | ingen leverans |
| `Taljset_G_2_1` | bild | ACTIVE | 0 | 0 | — | ingen leverans |
| `Taljset_SP_1` | video | ACTIVE | 24 kr | 1 | 35,92 | 1 köp på 5 klick — för tidigt; copyn citerar importraden Anders Nilsson |
| `Taljset_SP_2` | video | ACTIVE | 0,99 kr | 0 | — | samma citat |
| `Taljset_SP_3` | video | ACTIVE | 7 kr | 0 | — | samma citat |
| `Taljset_SP_2_1` | bild | ACTIVE | 0,10 kr | 0 | — | samma citat |

Upptagna AD-ID:n: PD 1–3, CS 1–3, G 1–3, SP 1–3 (video), PD_2_1, CS_2_1,
G_2_1, SP_2_1 (bild). Nästa lediga: PD_4, CS_4, GT_4, SP_4, SO_1, OB_1;
iterationer på vinnaren `PD_1_H4`–`H6`.

## Förstabatchen — VÄNTAR (2026-09-26)

`annonsbehov` sa `forsta_batch` (1 872 kr, 50,1 % vinst) i dagens körning.
Batchen skrevs inte, av en regel som inte går att gå runt: **varje brief
måste peka på en lärdom** (`lardom=L-…`, CS-KLART punkt 6,
`agent/lardom.mjs --brief` avbryter annars), lärdomar skrivs bara för
etiketterade annonser, och etiketten sätts dag 7 på annonsens egen första
vecka. Annonserna är två dygn gamla — `node agent/lardom.mjs --skelett
--kampanj 120250349169940291` gav 0 skelett 2026-09-26. Enda undantaget
(invändningsbrief `invandning=`, `kalla=voc`) kräver ett kommentarskluster
≥ 3; kampanjen har 0 kommentarer.

**Första möjliga dag: 2026-10-01** (etiketter dag 7 → lärdomar → briefer,
i samma morgonrond). Tills dess står behovet kvar i kön varje morgon, med
flit — ingen `FORSTA_BATCH_KLAR`-rad är skriven. Analysen (FAS 0–6) och
konceptkandidaterna finns i `dna.md` och `backlog.md`, så briefsteget kan
gå direkt den morgonen. Den morgonen avgör lärdomen vilken av `PD_1` (top
spender) och `PD_3` (högst vinstbidrag) som är föräldern för iterationerna.

Kontroller gjorda 2026-09-26 inför batchen: kampanjen ACTIVE med
`daily_budget` 2 000 kr (läst live 06:20 UTC), Annonsidéer 0 rader "Ny"
(6 rader, alla Byggd), ingen Notion-hub (ingen Feedback-rad att läsa —
skapas ur MALL först när briefer finns, aldrig tom i förväg), Drive-mappen
är Joshs `1IBXKtwHEdjFsTTAtNuIMoJ_ESTO8CmSP` (Batch #1 läggs INUTI den).

## Batch #1 — förstabatchen (2026-09-27, Axels beslut "NU")

**Varför nu:** batchen skulle ha väntat på dag 7-etiketterna (2026-10-01,
se avsnittet ovan). Axel svarade 2026-09-27 på frågan om Täljsetet och
Golfkalendern: **"1. NU"** — ägarens override av väntan. CS-KLART punkt 6
(varje brief pekar på en lärdom) löstes med en **preliminär lärdom**
`L-120250349207730291` (Taljset_PD_3) + `L-120250349195630291` (Taljset_PD_1,
benchmark) skrivna för hand ur Metas livstidsdata i `lardomar.md` — märkta
PRELIMINÄR och **ersätts av dag 7-lärdomen 2026-10-01 under samma id.**
Ingen etikett är satt; inget här är en dom.

**Data 2026-09-27 07:30 UTC (maximum, 7d_click):** kampanj 3 857 kr, 18 köp,
ROAS 4,34, CPA 214 kr, AOV 930 kr → break-even-CPA 612 kr (1,52).
`PD_1` 1 850 kr / 8 köp / ROAS 4,35 / CPA 231 kr / hold 17 % / CVR 1,8 %.
`PD_3` 1 781 kr / 8 köp / ROAS 3,90 / CPA 223 kr / hold 18 % / CVR 1,8 %.
Vinstbidrag (612 − CPA) × köp: PD_3 3 112 kr, PD_1 3 048 kr — jämnt; PD_3
valdes som förälder för iterationerna för att dess första bild (verktyget i
handen) konverterade dubbelt så bra som unboxingen dygn 1–2 (3,0 mot 1,3 %).
Dag 7-etiketten kan flytta föräldern till PD_1. Budget: 4 000 kr/dag (SKALA ×2
2026-09-27 05:54, ROAS 5,05 = 206 % av target).

**Feedback-rad:** hubben skapades i dag (dubblett av MALL) — ingen
"Brief review"-rad finns. Rapporterat. Termoskyddets senaste regler
(CPA alltid mot break-even i samma mening, hook aldrig en instruktion,
parentens Meta-annons-id i Why) tillämpades ändå i varje brief.

**Annonsidéer:** 0 rader "Ny" för produkten 2026-09-27.

**Kvot:** produkten finns inte i `products/products.json`, så
`pipeline/quota.mjs` visar ingen kvot för den (rond-produkt: `annonsbehov` i
produktkartan styr). 18 briefer ≥ varje kvot i skriptet (max 9/cykel).

### Briefer (18 st, alla ✅ i tools/briefgranskning.mjs från main 67d5c89, 0 av 18 stoppade, 0 rondfel)

| Brief | Typ | Variabel | Hypotes | KPI | Källa |
|---|---|---|---|---|---|
| `Taljset_PD_1_H4` | I, it 1 på PD_3 | öppningen: första snittet i övningsbiten, handsken på | snittet i träet slår verktyget i handen som första bild | CPA mot 612 kr, hold | egen-data |
| `Taljset_PD_1_H5` | I, it 2 | längre problemdel: kökslådan före väskan | problem-medveten öppning matar samma kropp fler köpare | CPA, hold | egen-data + sidan |
| `Taljset_PD_1_H6` | I, it 3 | in media res: den snittade biten först | resultatet håller bättre än verktyget/problemet | hold, CPA | egen-data |
| `Taljset_SO_1_H1` | N | vinkeln SO: fel kniv mot rätt verktyg | den som täljer med kökskniv köper på konflikten | CPA | **voc** (`docs/voc-forum-taljsetet-2026-09-27.md`) |
| `Taljset_OB_1_H1` | N | vinkeln OB: "är det inte farligt?" | handskarna först låser upp den tveksamma | CPA, CVR | sidan/backlog (0 kommentarer, inte voc) |
| `Taljset_GT_4_H1` | N | vinkeln GT: presenten som blir en hobby | presentköparen är en egen avatar | CPA | G-copyns rad, backlog |
| `Taljset_PD_4_H1` | N | demoform: väskan töms del för del | inventariet i sig är demot | CPA | backlog |
| `Taljset_PD_5_H1` | N | demoform: före/efter på övningsbiten | synlig förvandling slår väskan som bevis | hold, CPA | backlog |
| `Taljset_SP_4_H1` | N | SP som situation utan citat | lugnet på altanen säljer utan recension | CPA | SP-copyns rad utan citatet |
| `Taljset_PD_4_1` | N, statisk | formatet: 30 delar utlagda | validerar PD som bild (PD_2_1 för tidig) | CPA | backlog |
| `Taljset_SO_1_1` | N, statisk | formatet: lådan mot väskan (split) | konflikten bär utan rörelse? | CPA | backlog |
| `Taljset_LI_1_1` | N, statisk | listicle: sex saker i väskan | listan som bild | CPA | backlog |
| `Taljset_CS_4_1` | N, statisk | pris utan brådska | ankaret säljer utan "innan priset går upp" | CPA | backlog |
| `Taljset_OB_1_1` | N, statisk | blad + skydd + handske | säkerhetsinvändningen som bild | CPA | sidan |
| `Taljset_GT_4_1` | N, statisk | väskan halvt uppackad | presentvinkeln utan rörelse | CPA | G-copyns rad |
| `Taljset_BOF_1_1` | N, BOF | pris till den som redan klickat | — retargeting | CPA | — |
| `Taljset_BOF_2_1` | N, BOF | 14 dagars ångerrätt (sidans enda garantirad) | — retargeting | CPA | sidan |
| `Taljset_OB_2_1` | N, OB | nybörjarens tvivel → träbiten | "kan jag verkligen?" besvaras | CPA | sidan + voc-mönster 2 |

Inga review-bilder (importrader). Ingen testimonial-static av samma skäl —
redovisat. Tre BOF-bilder = `BOF_1_1`, `BOF_2_1` och `OB_2_1` (invändningen
heter OB enligt namnkonventionen, aldrig BOF).

**Testplan:** nytt test-ABO med lika budget per annons (regel 11), aldrig i
skalningskampanjen. Tier 1: PD_1_H4/H5/H6 + SO_1_H1 + PD_4_1 + CS_4_1.
Tier 2: OB_1_H1, GT_4_H1, PD_4_H1, PD_5_H1, SO_1_1, LI_1_1, OB_1_1, GT_4_1.
Tier 3 (retargeting): BOF_1_1, BOF_2_1, OB_2_1, SP_4_H1. Ingen dom under
300 kr / 3 köp; kill när CPA > 612 kr efter ≥ 500 kr spend. Gör innan spend:
priset läses live (869/1 139), handskarna syns i varje blad-klipp, inga
recensionsrader, inga barn.

**Copy:** sonnet, `batch-01/copy-sonnet.md` — 152 svenska rader i
tre-frågorstestet, alla ❌ på "kan konkurrent signera". Regi per rad:
`batch-01/regi.json`. Manifest: `batch-01/manifest.json`. Drive: `Batch #1`
(`1a5oI7rMmx3h7Os4NAwEeN0VYD6m0Dztr`) inuti Joshs produktmapp, en undermapp
per annons (id i manifestet). Notion: **Whittling set creative hub**
(`3e8270ab-908c-8156-bd42-e5fcbe833705`, dubblett av MALL, omdöpt) — raderna i
`batch-01/notion-rader.json`.

**Vid dag 7 (2026-10-01):** skriv de riktiga lärdomarna för PD_1/PD_3 med
`lardom.mjs --skriv` (samma id — ersätt de preliminära blocken i `lardomar.md`,
LARDOM-raderna 2026-09-27 är märkta `preliminar: true`), läs av om föräldern
ska vara PD_1 i stället, och logga launchen med `/logga`.


## Fars dag omgång 4 — extra BOF-batch (2026-09-29 kväll, Axels order samma kväll)

Axel: "gör en till extra batch för fars dag för alla produkter och gärna dubbelt så mycket bildads och sedan normal kvantitet videos så att vi pushar extra mycket BOF fars dag annonser". Invändningen som batchen svarar på: **"är det farligt att börja tälja?"** (svar ur sidan: 30 delar i väskan: 6 knivar, 6 järn, strop och skärskyddade handskar; allt i en väska). Förälder Taljset_PD_3 (lärdom L-120250349207730291). Alla sju klarade spärren (regi 4/4, 0 fel), ligger som `Draft` i Whittling set creative hub. Loggkod `FARSDAG_BATCH_KLAR`. Batch-loggen för hela omgången: `docs/briefs/farsdag-2026/README-bof.md`.

| Annons | Typ | Hook / rubrik | Notion |
|---|---|---|---|
| Taljset_FD_3_H1 | video 13 s, BOF-omklipp | Fars dag: knivar, järn, strop, handskar. Allt i väskan. | https://www.notion.so/3ea270ab908c81ee879ac63c2a8af07a |
| Taljset_FD_3_H2 | video 13 s, BOF-omklipp | Täljset 869 kr, ord. 1 139 kr. Fars dag. | https://www.notion.so/3ea270ab908c8110b600cbc054ff4a47 |
| Taljset_FD_3_H3 | video 13 s, BOF-omklipp | Beställ senast 19 oktober: täljset till fars dag. | https://www.notion.so/3ea270ab908c81769714df3327dda5ac |
| Taljset_FD_4_1 | bild, BOF | Skärskyddade handskar ingår i väskan | https://www.notion.so/3ea270ab908c8118ba76dfbf1d93a32f |
| Taljset_FD_4_2 | bild, BOF | 869 kr. Ord. 1 139 kr. Fars dag. | https://www.notion.so/3ea270ab908c813296c6c865c2059108 |
| Taljset_FD_4_3 | bild, BOF | Beställ senast 19 oktober, täljset till fars dag | https://www.notion.so/3ea270ab908c814a958fda8ee7108dd8 |
| Taljset_FD_4_4 | bild, BOF | 6 knivar och 6 järn för olika snitt | https://www.notion.so/3ea270ab908c8116bdd3ff8340a3cc3f |

Mätning (ANALYSMETOD): ingen dom under 300 kr / 3 köp. H1 mot H2 mot H3 = vilken öppning (invändning, pris, sista dag) den produktmedvetna tittaren behöver; FD_4_1–4 mot varandra = budskapet i textrutan; hela batchen mot FD_1/FD_2 (presentvinkeln, kall publik). Etikett dag 7, lärdom, sedan dna.md.

## Etiketter dag 7 (2026-10-01) — Täljsetet 30 Delar

Ur `agent/etikett-backfill.mjs` 2026-10-01 (MagiBorsten SE, annonsens egna första vecka 2026-09-24–2026-09-30, 7d_click). Lärdom per annons i `lardomar.md` (LARDOM-rader samma morgon). Breakthrough-frekvens: 1/16 (6 %) (etikett.mjs --frekvens 2026-10-01).

| Annons | Batch | Etikett (7 d) | Andel | Spend | Köp | ROAS ad / kampanj | Hook / hold | Bedömbar |
|---|---|---|---|---|---|---|---|---|
| Taljset_PD_1 | 1 | **BREAKTHROUGH** | 58 % | 10 251 kr | 31 | 2,82 / 2,98 | 41 % / 16 % | ja |
| Taljset_PD_3 | 1 | **KPI_WINNER** | 26 % | 4 597 kr | 18 | 3,40 / 2,98 | 44 % / 16 % | ja |
| Taljset_SP_1 | okänd | **KPI_WINNER** | 2 % | 436 kr | 2 | 3,99 / 2,98 | 26 % / 10 % | nej |
| Taljset_PD_2 | okänd | **LOSER** | 2 % | 277 kr | 0 | 0,00 / 2,98 | 27 % / 8 % | nej |
| Taljset_PD_2_1 | okänd | **KPI_WINNER** | 1 % | 200 kr | 2 | 8,70 / 2,98 | — | nej |
| Taljset_SP_3 | okänd | **LOSER** | 0 % | 76 kr | 0 | 0,00 / 2,98 | 43 % / 14 % | nej |
| Taljset_CS_2 | okänd | **LOSER** | 0 % | 11 kr | 0 | 0,00 / 2,98 | 71 % / 23 % | nej |
| Taljset_CS_3 | okänd | **INGEN_LEVERANS** | — | 6 kr | 0 | 0,00 / 2,98 | 71 % / 14 % | nej |
| Taljset_SP_2 | okänd | **INGEN_LEVERANS** | — | 4 kr | 0 | 0,00 / 2,98 | 13 % / — | nej |
| Taljset_CS_1 | okänd | **INGEN_LEVERANS** | — | 3 kr | 0 | 0,00 / 2,98 | 56 % / 22 % | nej |
| Taljset_G_2 | okänd | **INGEN_LEVERANS** | — | 3 kr | 0 | 0,00 / 2,98 | 25 % / 17 % | nej |
| Taljset_CS_2_1 | okänd | **INGEN_LEVERANS** | — | 3 kr | 0 | 0,00 / 2,98 | — | nej |
| Taljset_G_1 | okänd | **INGEN_LEVERANS** | — | 0 kr | 0 | 0,00 / 2,98 | — | nej |
| Taljset_SP_2_1 | okänd | **INGEN_LEVERANS** | — | 0 kr | 0 | 0,00 / 2,98 | — | nej |
| Taljset_G_3 | okänd | **INGEN_LEVERANS** | — | 0 kr | 0 | 0,00 / 2,98 | — | nej |
| Taljset_G_2_1 | okänd | **INGEN_LEVERANS** | — | 0 kr | 0 | 0,00 / 2,98 | — | nej |
