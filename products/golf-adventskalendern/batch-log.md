# Batch-log — Golf Adventskalendern (24 golftillbehör)

Breakthrough-frekvens: — (inga etiketter än, första dag 7 = 2026-10-01)

Kampanj `120250349257210291` (MagiBorsten SE), launch 2026-09-24 02:31.
Budget 1 000 → **1 200 kr/dag** (SKALA 2026-09-26 05:54: ROAS 3,28 = 126 %
av target, +20 %; 25/9 VANTA_KONSEKVENT efter ett dygn över target).
Break-even 1,58 ur prissheetet, pris 549 kr / jämförpris 719 kr. Minnet
skapades 2026-09-26 av /rond-auto.

## Batch 0 — produkttestet (Product test center, Josh, launch 2026-09-24)

16 annonser, Drive `1P8kp5K1MJZ_zwa6O5zdHRS9rQgD8L1-T` (12 mp4 med prefixet
"K Golfkalender_", 4 bilder, 4 adcopy-dokument, `Golfkalender_REVIEW`,
undermapp `Assets`). Notion-raden "K Golfkalender"
`3dd270ab-908c-812d-9e46-cd7f15662b13` (Status Ads review). Manus/VO: inte
transkriberade (ingen ffmpeg) — okända. Adcopy-dokumenten = live-copyn:
PD "Glöm chokladkalendern. Det här är för golfaren." / G "Vad köper man till
en golfare som redan har allt?" / CS "🚨 REA: 170 kr billigare … innan priset
går upp" / SP "⭐⭐⭐⭐⭐ Rolig adventskalender med små golftillbehör …" (importrad).
Siffror t.o.m. 2026-09-26 06:20 UTC (maximum, 7d_click).

| Annons | Format | Status | Spend | Köp | ROAS | Not |
|---|---|---|---|---|---|---|
| `Golfkalender_PD_1` | video (22 s) | ACTIVE | 1 936 kr | 9 | 3,54 | top spender, 89 % av spend, CVR 3,4 % (9/265 LPV), thruplay 12 % |
| `Golfkalender_PD_2` | video | ACTIVE | 0,72 kr | 0 | — | samma text som PD_1, annan video |
| `Golfkalender_PD_3` | video | ACTIVE | 11 kr | 0 | — | samma text som PD_1, annan video |
| `Golfkalender_PD_2_1` | bild | ACTIVE | 52 kr | 0 | — | 10 klick, 8 LPV, 0 köp |
| `Golfkalender_CS_1` | video | ACTIVE | 9 kr | 0 | — | copyn bär "innan priset går upp" |
| `Golfkalender_CS_2` | video | ACTIVE | 42 kr | 0 | — | 155 visningar, 0 klick |
| `Golfkalender_CS_3` | video | ACTIVE | 0,85 kr | 0 | — | |
| `Golfkalender_CS_2_1` | bild | PAUSED | 0 | 0 | — | pausad utan loggrad — inte av ronden (gissning: vid launch) |
| `Golfkalender_G_1` | video | ACTIVE | 2 kr | 0 | — | |
| `Golfkalender_G_2` | video | ACTIVE | 13 kr | 0 | — | 1 ATC |
| `Golfkalender_G_3` | video | ACTIVE | 1,50 kr | 0 | — | |
| `Golfkalender_G_2_1` | bild | ACTIVE | 0,48 kr | 0 | — | |
| `Golfkalender_SP_1` | video | ACTIVE | 5 kr | 0 | — | copyn citerar importraden Lars Andersson |
| `Golfkalender_SP_2` | video | ACTIVE | 14 kr | 0 | — | samma |
| `Golfkalender_SP_3` | video (17 s) | ACTIVE | 72 kr | 1 | 13,03 | 1 köp på 13 klick — för tidigt |
| `Golfkalender_SP_2_1` | bild | ACTIVE | 23 kr | 0 | — | samma citat |

Upptagna AD-ID:n: PD 1–3, CS 1–3, G 1–3, SP 1–3 (video), PD_2_1, CS_2_1,
G_2_1, SP_2_1 (bild). Nästa lediga: PD_4, CS_4, GT_4, SP_4, SO_1, OB_1;
iterationer på vinnaren `PD_1_H4`–`H6`.

## Förstabatchen — VÄNTAR (2026-09-26)

`annonsbehov` sa `forsta_batch` (2 160 kr, 32,9 % vinst) i dagens körning.
Batchen skrevs inte, av en regel som inte går att gå runt: **varje brief
måste peka på en lärdom** (`lardom=L-…`, CS-KLART punkt 6,
`agent/lardom.mjs --brief` avbryter annars), lärdomar skrivs bara för
etiketterade annonser, och etiketten sätts dag 7 på annonsens egen första
vecka. Annonserna är två dygn gamla — `node agent/lardom.mjs --skelett
--kampanj 120250349257210291` gav 0 skelett 2026-09-26. Enda undantaget
(invändningsbrief `invandning=`, `kalla=voc`) kräver ett kommentarskluster
≥ 3; kampanjen har 1 kommentar (en vän-tagg).

**Första möjliga dag: 2026-10-01** (etiketter dag 7 → lärdomar → briefer,
i samma morgonrond). Tills dess står behovet kvar i kön varje morgon, med
flit — ingen `FORSTA_BATCH_KLAR`-rad är skriven. Analysen (FAS 0–6) och
konceptkandidaterna finns i `dna.md` och `backlog.md`, så briefsteget kan
gå direkt den morgonen.

Kontroller gjorda 2026-09-26 inför batchen: kampanjen ACTIVE med
`daily_budget` 1 200 kr (läst live 06:20 UTC), Annonsidéer 0 rader "Ny"
(6 rader, alla Byggd), ingen Notion-hub (ingen Feedback-rad att läsa —
skapas ur MALL först när briefer finns, aldrig tom i förväg), Drive-mappen
är Joshs `1P8kp5K1MJZ_zwa6O5zdHRS9rQgD8L1-T` (Batch #1 läggs INUTI den).

Säsongsspärr: sista annonsdag för adventsbruk 2026-11-17, som julklapp
2026-12-10 (dna.md → Säsong). Batch #1 måste vara live med marginal före
17 nov för att hinna få egna etiketter.
