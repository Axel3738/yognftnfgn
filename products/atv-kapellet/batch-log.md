# Batch-log — ATV-Kapellet 3XL 256 × 110 × 120 cm

Breakthrough-frekvens: 1/11 (9 %) (etikett.mjs --frekvens 2026-09-29)

Kampanj `120250320718080291` (MagiBorsten SE), launch 2026-09-22 02:30.
Budget 1 000 → **1 500 kr/dag** (SKALA 2026-09-24 05:20: ROAS 3,83 = 157 %
av target, ×1,5). Break-even 1,52 ur prissheetet, pris 579 kr / jämförpris
759 kr. Minnet skapades 2026-09-24 av /rond-auto.

## Batch 0 — produkttestet (Product test center, Josh, launch 2026-09-22)

16 annonser, Drive `ATV-Kapell` (`1g8zYtpAlok3lXvwpR0eLhIl9uGmMvLwp`).
Siffror t.o.m. 2026-09-24 05:55 UTC (maximum, kontots standardattribution).

| Annons | Format | Status | Spend | Köp | ROAS | Not |
|---|---|---|---|---|---|---|
| `ATVKapell_PD_1_H1` | video | ACTIVE | 1 409 kr | 11 | 5,67 | top spender, 71 % av spend, CVR 6,4 % (11/172 LPV) |
| `ATVKapell_PD_1_H2` | video | ACTIVE | 26 kr | 0 | — | |
| `ATVKapell_PD_1_H3` | video | ACTIVE | 393 kr | 0 | — | 44 LPV, 0 köp |
| `ATVKapell_PD_2_1` | bild | ACTIVE | 15 kr | 0 | — | |
| `ATVKapell_CS_1_H1` | video | ACTIVE | 13 kr | 0 | — | |
| `ATVKapell_CS_1_H2` | video | ACTIVE | 15 kr | 0 | — | |
| `ATVKapell_CS_1_H3` | video | ACTIVE | 40 kr | 0 | — | |
| `ATVKapell_CS_2_1` | bild | ACTIVE | 13 kr | 0 | — | |
| `ATVKapell_G_1_H1` | video | ACTIVE | 9 kr | 0 | — | |
| `ATVKapell_G_1_H2` | video | ACTIVE | 30 kr | 0 | — | |
| `ATVKapell_G_1_H3` | video | ACTIVE | 29 kr | 0 | — | |
| `ATVKapell_G_2_1` | bild | PAUSED | 0 | 0 | — | pausad sedan launch, inte av ronden |
| `ATVKapell_SP_1_H1` | video | PAUSED | 0 | 0 | — | pausad sedan launch, inte av ronden (SP-copyn i Drive bär platshållaren "[Riktigt kundcitat]" — gissning: därför) |
| `ATVKapell_SP_1_H2` | video | PAUSED | 0 | 0 | — | samma |
| `ATVKapell_SP_1_H3` | video | PAUSED | 0 | 0 | — | samma |
| `ATVKapell_SP_2_1` | bild | PAUSED | 0 | 0 | — | samma |

Upptagna AD-ID:n: CS 1–2, PD 1–2, G 1–2, SP 1–2. Nästa lediga: CS_3, PD_3,
G_3, SP_3, SO_1, OB_1.

## Förstabatchen — VÄNTAR (2026-09-24)

`annonsbehov` sa `forsta_batch` (1 975 kr, 39,9 % vinst) båda körningarna
2026-09-24. Batchen skrevs inte, av en regel som inte går att gå runt:
**varje brief måste peka på en lärdom** (`lardom=L-…`, CS-KLART punkt 6,
`agent/lardom.mjs --brief` avbryter annars), lärdomar skrivs bara för
etiketterade annonser, och etiketten sätts dag 7 på annonsens egen första
vecka. Annonserna är två dygn gamla — `--skelett --kampanj 120250320718080291`
gav 0 skelett. Enda undantaget (invändningsbrief `invandning=`, `kalla=voc`)
kräver ett kommentarskluster ≥ 3; kampanjen har 1 kommentar.

**Första möjliga dag: 2026-09-29** (etiketter dag 7 → lärdomar → briefer,
i samma morgonrond). Tills dess står behovet kvar i kön varje morgon, med
flit — ingen `FORSTA_BATCH_KLAR`-rad är skriven. Analysen (FAS 0–6) och
konceptkandidaterna finns i `dna.md` och `backlog.md`, så briefsteget kan
gå direkt den morgonen.

Kontroller gjorda 2026-09-24 inför batchen: kampanjen ACTIVE (läst 05:55
UTC), Annonsidéer 0 rader "Ny", ingen Notion-hub (ingen Feedback-rad att
läsa — skapas ur MALL först när briefer finns, aldrig tom i förväg),
Drive-mappen är Joshs `ATV-Kapell` (Batch #1 läggs INUTI den).

**2026-09-25:** `forsta_batch` flaggat igen (3 391 kr, 29,1 % vinst, VANTA_KADENS efter höjningen 24/9 — CPA 👀 två stigningar 128 → 266 → 739 kr). Fortfarande 0 etiketter (annonserna 3 dygn), 0 lärdomar ⇒ inga briefer (samma regel som 24/9). Första möjliga dag oförändrad: 2026-09-29. Annonsidéer: 0 rader Ny.


**2026-09-28:** `forsta_batch` flaggat igen (8 138 kr, 20,9 % vinst, LAT_VARA 1 500 kr/dag, ROAS 3d 2,22). Fortfarande 0 etiketter (annonserna skapade 2026-09-22, sju dygn fyllda först 2026-09-29) ⇒ 0 lärdomar ⇒ inga briefer (regeln från 24/9). Kampanjen läst ACTIVE 05:53 UTC. Annonsidéer: 0 rader Ny för produkten. Första möjliga dag oförändrad: **2026-09-29** (etiketter dag 7 → lärdomar → förstabatch i samma rond).


## Etiketter dag 7 (2026-09-29) — ATV-Kapellet 3XL

Ur `agent/etikett-backfill.mjs` 2026-09-29 (annonsens egna första vecka 22–28 sep, 7d_click). Lärdom per annons i `lardomar.md` (11 LARDOM-rader samma morgon).

| Annons | Etikett (7 d) | Andel | Spend | Köp | ROAS ad / kampanj | Bedömbar | Playbook |
|---|---|---|---|---|---|---|---|
| ATVKapell_PD_1_H1 | **BREAKTHROUGH** | 77 % | 7 336 kr | 27 | 2,52 / 2,05 | ja | tre iterationer inom 14 dagar — byggda i dag (batch #1) |
| ATVKapell_PD_1_H3 | LOSER | 8 % | 770 kr | 1 | 0,75 / 2,05 | nej | släpp |
| ATVKapell_PD_1_H2 | LOSER | 4 % | 344 kr | 0 | 0,00 / 2,05 | nej | släpp |
| ATVKapell_CS_1_H1 | LOSER | 4 % | 336 kr | 1 | 1,72 / 2,05 | nej | släpp |
| ATVKapell_G_1_H3 | LOSER | 4 % | 336 kr | 0 | 0,00 / 2,05 | nej | släpp |
| ATVKapell_PD_2_1 | LOSER | 2 % | 195 kr | 0 | 0,00 / 2,05 | nej | släpp |
| ATVKapell_G_1_H1 | LOSER | 1 % | 100 kr | 0 | 0,00 / 2,05 | nej | släpp |
| ATVKapell_CS_1_H3 | LOSER | 1 % | 48 kr | 0 | 0,00 / 2,05 | nej | släpp |
| ATVKapell_G_1_H2 | LOSER | 0 % | 45 kr | 0 | 0,00 / 2,05 | nej | släpp |
| ATVKapell_CS_1_H2 | LOSER | 0 % | 35 kr | 0 | 0,00 / 2,05 | nej | släpp |
| ATVKapell_CS_2_1 | LOSER | 0 % | 18 kr | 0 | 0,00 / 2,05 | nej | släpp |

SP_1_H1–H3 och SP_2_1 pausades vid launch och fick aldrig spend (uteslutna: "aldrig aktiva"). Komponentkartan för PD_1_H1 står i `dna.md`.

## Batch #1 — vidarebygg på ATVKapell_PD_1_H1 (2026-09-29, `/rond-auto` steg 4b, rang 0)

**Läget (3 d, avläst 2026-09-29):** LAT_VARA 1 500 kr/dag, ROAS 3d 1,55 (2,2 % vinst mot break-even 1,52), livstid ROAS 2,20 / 9 563 kr. `annonsbehov` gav `vidarebygg` (rundaAntal 3, tak 14 = dagens 11 lärdomar + 3 namngivna platser) — `forsta_batch` flaggas inte längre (vinsten under 20 %), men breakthrough-iterationerna har rang 0 och byggs samma morgon. Kampanjen läst ACTIVE. Annonsidéer: 0 rader Ny för produkten. Ingen Feedback-rad (hubben är ny). Copy av sonnet-subagent mot `docs/copy-regler.md`; **bara sidans egna löften** (förälderns "vattentätt/UV/märkeslista" står inte på sidan och ärvs inte). Priset läst live: 579 / 759 kr.

### Batch #1 — 3 video, alla i Notion som Draft (ATV cover creative hub, `3ea270ab-908c-8157-a2a2-ca2cb28cb792`)

| Annons | Format | Typ | Parent · iteration (loggen) | Hypotes | Isolerad variabel | Källa | Lärdom | rev | brief → live | Notion |
|---|---|---|---|---|---|---|---|---|---|---|
| `ATVKapell_PD_1_H4` | video 20 s | I | PD_1_H1 · 1 | en deklarativ hook ur sidans egen scen (löv och damm på lacken) håller förälderns 36 % hook rate utan de obelagda materialpåståendena | hooken 0–3 s | egen-data | L-120250320728410291 | okänd | — | `3ea270ab908c810e874dd5cbf9677ce8` |
| `ATVKapell_PD_1_H5` | video 22 s | I | PD_1_H1 · 2 | tre problembilder (still, löv, damm) före kapellet lyfter hook rate över 36 % utan att hold (14 %) faller | problemdelen 0–7 s | egen-data | L-120250320728410291 | okänd | — | `3ea270ab908c81438d26c5816f438d9d` |
| `ATVKapell_PD_1_H6` | video 20 s | I | PD_1_H1 · 3 | resultatet först (kapellet av, ren lack, skräpet på tyget — förälderns demo i reverse) slår problemöppningen hos en publik som sett den en vecka | öppningsbilden (rad 1) | egen-data | L-120250320728410291 | okänd | — | `3ea270ab908c81ed953afb8c79d755ff` |

**Spärrarna:** `briefgranskning.mjs --manifest … --prefix ATVKapell --pris 579 --jamforpris 759` ⇒ exit 0 (regi 6/7/6, två "or/eller" i Picture rättade före andra körningen). `lardom.mjs --brief … --befintliga <kontots 16 namn>` ⇒ 3 BRIEF-rader, "11 fria + 3 namngivna". `VIDAREBYGG_KLAR` loggad. Källorna är `DRIVE 1-8-ycjS… [EDITOR PICKS: …]` — ffmpeg saknas, ingen påhittad sekund; H6:s öppning är förälderns demoklipp i reverse 3 s. `AI content: voice`. ⚠️ Hubben duplicerades ur MALL och syns inte för integrationen Bäverbutiken RUTINER (REST 404) — raderna skapades via Notion-MCP; ett item (PD_1_H4) öppnat och kontrollerat: hela briefen i sidan, ingen .md-länk.

**Upptagna AD-ID:n efter batch #1:** PD_1_H1–H6, PD_2_1, CS_1_H1–H3, CS_2_1, G_1_H1–H3, G_2_1, SP_1_H1–H3, SP_2_1. Nästa lediga: PD_3, CS_3, G_3, SP_3, SO_1, OB_1.
