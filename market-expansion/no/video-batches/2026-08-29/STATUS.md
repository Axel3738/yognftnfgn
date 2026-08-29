# NO-videobatch 2026-08-29 — status

Källa: Drive-mappen `1z6oJt1dTu1kwXU-s1_RQkwIRFar3zeOw` (Josh), 47 annonsvideor.
Rutin: `/translate-no` (`.claude/commands/translate-no.md`). Manifest: `batch.json`.

| Produkt (slug) | Videor | Norsk sida | Pris NOK | BE-ROAS | Läge |
|---|---|---|---|---|---|
| Kranskydd Frost 420D (`kranskydd`) | 12 | ✅ kranbeskyttelse-frost-420d-… | 219 (før 285) | 1,63 | Väntar på HeyGen-krediter |
| IBC-tanköverdrag (`ibc`) | 11 (CS_1_H1 saknas i Drive) | ✅ ibc-tanktrekk-1000-l-… | 439 (før 571) | 1,63 | Väntar på HeyGen-krediter |
| Cykelshorts Herr (`cykelshorts`) | 12 | ❌ finns inte på beverbutikken.no | — | — | Kan inte launchas ännu |
| Bälteslipmaskin Mini 3-i-1 (`balteslip`) | 12 | ❌ finns inte på beverbutikken.no | — | — | Kan inte launchas ännu |

**Blockerare 2026-08-29:** HeyGens `api`-kvot slut (11 → 2 efter 47 failade
proofread-sessioner). Behov: ~14 kredit-minuter för de två launchbara produkterna,
~22 för alla fyra (tumregel ~1 kredit/videominut — verifiera mot verklig förbrukning
efter första videon och avbryt om det drar mer).

**Vid omkörning** (krediter påfyllda): kör `/translate-no` — allt state ligger i
`batch.json.state.json` (skapas vid körning), failade sessioner återskapas automatiskt.
Launchkonfigar: `pipeline/waves/no-kranskydd-video.config.mjs` + `no-ibc-video.config.mjs`
(uppdatera launchdatumet i kampanjnamnen). Norsk adcopy: `adcopy-no.json` (subagent
sonnet, tre-frågorstestet redovisat i sessionen 2026-08-29).

COGS-källor: batch-sheet #3 (kranskydd "Anti freeze cover for water tap", 7,8 EUR ex
tax NO) och #4 (IBC "Water tank cover", 15,63 EUR ex tax NO). EUR/NOK 10,86 (2026-08-29).
