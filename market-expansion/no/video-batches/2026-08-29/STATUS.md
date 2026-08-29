# NO-videobatch 2026-08-29 — status

Källa: Drive-mappen `1z6oJt1dTu1kwXU-s1_RQkwIRFar3zeOw` (Josh), 47 annonsvideor.
Rutin: `/translate-no` (`.claude/commands/translate-no.md`). Manifest: `batch.json`.

| Produkt (slug) | Videor | Norsk sida | Pris NOK | BE-ROAS | Läge |
|---|---|---|---|---|---|
| Kranskydd Frost 420D (`kranskydd`) | 12 | ✅ kranbeskyttelse-frost-420d-… | 219 (før 285) | 1,63 | ✅ Översatt, levererad, launchad ACTIVE 2026-08-29 |
| IBC-tanköverdrag (`ibc`) | 11 (CS_1_H1 saknas i Drive) | ✅ ibc-tanktrekk-1000-l-… | 439 (før 586, höjt för 25 %-claim) | 1,63 | ✅ Översatt, levererad, launchad ACTIVE 2026-08-29 |
| Cykelshorts Herr (`cykelshorts`) | 12 | ❌ finns inte på beverbutikken.no | — | — | Kan inte launchas ännu |
| Bälteslipmaskin Mini 3-i-1 (`balteslip`) | 12 | ❌ finns inte på beverbutikken.no | — | — | Kan inte launchas ännu |

**Bildannonser klara 2026-08-29 (kvällen):** 8 st (4 per produkt) — Kie AI (`google/nano-banana-edit`)
raderade texten, PIL komponerade norsk text exakt (direktöversättning i bildmodell stavade fel
och förkastades). Levererade i chatten, uppladdade i NO-mapparna, inlagda ACTIVE i respektive
koncept-adset som `<Produkt>_NO_<K>_2_1`. Kampanjerna har nu 16 resp. 15 annonser.
Alla 23 videor + 8 bilder + 8 adcopy-docs ligger i Drive under NO/-mappen.

**API-verifierad 2026-08-29 17:30 UTC:** båda kampanjerna ACTIVE/ACTIVE, 4 adsets vardera ACTIVE, 12 + 11 annonser alla ACTIVE (effective_status), CBO 1000 kr/dag, alla annonslänkar → beverbutikken.no. Videouppladdning till NO-mapparna väntar fortfarande på Drive-brevlådans URL.

**Launch bekräftad 2026-08-29:** Kranbeskyttelse Frost NO (12 annonser) + IBC-tanktrekk NO
(11 annonser), båda ACTIVE, CBO 1000 kr/dag, adset per koncept, kampanj-ID
120251996272390233 resp. 120251996323340233. Drive: NO-mappar skapade med 8 norska
adcopy-docs; videouppladdning väntar på Drive-brevlådans URL från Axel
(tools/drive-brevlada.gs). REVIEWS-arken översätts inte (påhittade recensioner — beslut 2026-08-29).

**Löst 2026-08-29 (kvällen):** Axel fyllde wallet ($500). Hela batchen drog ~1 127 credits.

**Tidigare blockerare:** HeyGens `api`-kvot slut (11 → 2 efter 47 failade
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
