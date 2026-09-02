# NO-videobatch 2026-08-29 — status

Källa: Drive-mappen `1z6oJt1dTu1kwXU-s1_RQkwIRFar3zeOw` (Josh), 47 annonsvideor.
Rutin: `/translate-no` (`.claude/commands/translate-no.md`). Manifest: `batch.json`.

| Produkt (slug) | Videor | Norsk sida | Pris NOK | BE-ROAS | Läge |
|---|---|---|---|---|---|
| Kranskydd Frost 420D (`kranskydd`) | 12 | ✅ kranbeskyttelse-frost-420d-… | 219 (før 285) | 1,63 | ✅ Översatt, levererad, launchad ACTIVE 2026-08-29 |
| IBC-tanköverdrag (`ibc`) | 11 (CS_1_H1 saknas i Drive) | ✅ ibc-tanktrekk-1000-l-… | 439 (før 586, höjt för 25 %-claim) | 1,63 | ✅ Översatt, levererad, launchad ACTIVE 2026-08-29 |
| Cykelshorts Herr (`cykelshorts`) | 12 + 4 bilder | ✅ sykkelshorts-herre-… | 289 (før 379) | 1,41 | ✅ Launchad ACTIVE 2026-08-30 (natten) |
| Bälteslipmaskin Mini 3-i-1 (`balteslip`) | 12 + 4 bilder | ✅ beltesliper-mini-3-i-1-… | 1029 (før 1715, höjt för 40 %-claim) | 1,41 | ✅ Launchad ACTIVE 2026-08-30 (natten) |

**Bildannonser klara 2026-08-29 (kvällen):** 8 st (4 per produkt) — Kie AI (`google/nano-banana-edit`)
raderade texten, PIL komponerade norsk text exakt (direktöversättning i bildmodell stavade fel
och förkastades). Levererade i chatten, uppladdade i NO-mapparna, inlagda ACTIVE i respektive
koncept-adset som `<Produkt>_NO_<K>_2_1`. Kampanjerna har nu 16 resp. 15 annonser.
Alla 23 videor + 8 bilder + 8 adcopy-docs ligger i Drive under NO/-mappen.

**API-verifierad 2026-08-30 00:11 UTC:** nattbatchens tre kampanjer ACTIVE/ACTIVE, 4 adsets vardera, 16 annonser per kampanj (12 video + 4 bild) alla ACTIVE, CBO 1000 kr/dag, alla länkar → beverbutikken.no.

**Morgonbatch 2026-08-30 ✅ KLAR:** Damasker Vandring (`damasker` → Gamasjer Tur, 309 kr,
ordinær 515 höjd för 40 %-claim, BE-ROAS 1,64) + Jättefotboll (`jattefotboll` → Kjempefotball
60 cm, 299/389 = 23 % sant, BE-ROAS 1,65). 24 videor: proofread → SRT-lokalisering (två
sonnet-subagenter, verify-srt-3.py grön) → apply → rendering → captions (fast band 1388–1500,
burn-captions-3.py). 8 bildannonser (Kie + compose-no-3.py). Launchade ACTIVE 2026-08-30:
kampanj-ID 120251999873390233 (Gamasjer) / 120251999916430233 (Kjempefotball), CBO 1000 kr/dag,
4 adsets × 4 annonser (3 video + 1 bild) per kampanj. **API-verifierad:** båda ACTIVE/ACTIVE,
alla 32 annonser ACTIVE, alla länkar → beverbutikken.no. Levererat i chatten (8 zip ≤30 MiB +
8 png) och uppladdat i Drive: MAKE TO NORWAY → "NO Damasker Vandring"/"NO Jättefotboll"
(24 mp4 + 8 png + 8 adcopy-docs). Kvot 27 715 → 26 939 (~776 credits).

**Ombyggnad 2026-09-02 (Axels beslut):** källan är nu **LAUNCHED**
(`1-vbYhYgTEv7zYptW5rGmgKAITmAz4l1X`) — alla svenska produkter ska testas i Norge.
WINNERS (redan gjorda), LOSERS (floppar) och MAKE TO NORWAY listas inte som kandidater.
Max 3 produkter per natt. Diskord: brief i `#translation-till-norge-av-nya-produkter`,
problem (saknad norsk sida / saknad Norge-COGS) i `#problems-no`, båda pingar Axel +
ECOM CHADKING (`market-expansion/no/discord.json`). COGS-källa: Axels doc
`1BtFJj1A3J2ciZZS_f3lKU0cM0g5-ncWO7LFySuc3peo` (batch-sheets #1–#5.1, NORWAY-blocket,
ingen tull). Kandidater vid ombyggnaden: 13 produktmappar i LAUNCHED utan NO-mapp och
utan NO-kampanj (Medicinask, Badshorts, Bordtennisnät, Båtmotorskydd, Gravstenspenna,
Kamouflagetejp, Kasta & Fånga-set, Luffarschack, Magnethylla, Motorcycle cover,
Plyschtofflor, Smiley face stickers, Sömnadskit). Rutin-prompten ombunden till `main`
(den stod på en gren som låg 13 000 rader efter).

**Rutinkörning 2026-09-02 (04:15):** inga kandidater, oförändrat. 0 credits. Brief skickad.

**Rutinkörning 2026-09-01 (04:15):** inga kandidater — läget oförändrat mot 08-31.
Skoreparationslappar fortfarande stoppad: Norge-kolumnerna i batch-sheet #1 är tomma
(och radens ifyllda tal går inte ihop: 1,00 + 4,66 ≠ 8,56 — inte ens totalen är
verifierbar). 0 credits. Discord-brief skickad.

**Rutinkörning 2026-08-31 (04:15):** inga launchbara kandidater. 6 av 7 WINNERS-produkter
blockerade av dubblettspärren (kampanj finns redan i NO-kontot: Fiskespöhållaren ACTIVE;
Tofflorna/Motorhöljet/Strandtofflorna/Axelbältet/Sätesöverdraget PAUSED — Axels beslut krävs
för omstart). Skoreparationslappar har norsk sida (skoreparasjonslapper-…, 279 kr) men
**saknar Norge-COGS**: raden i batch-sheet #1 har tomma marknadskolumner, SE-kampanjen saknar
BE-ROAS i namnet — utan verifierad COGS ingen BE-ROAS, ingen launch (regel: hitta aldrig på).
⚠️ Norska jämförpriset (248,75) är dessutom LÄGRE än priset (279) — ska fixas vid launch.
0 credits brända. Discord-brief skickad.

**Drive-ramverk 2026-08-30 (Axels beslut):** källa = WINNERS-mappen, mål = `NO <namn>`-dubbletter
i MAKE TO NORWAY (f.d. huvudmappen), inga mappar flyttas. Inskrivet i `/translate-no` Fas 0 + 3.5.
Befintliga norska mappar NO-prefixade. Rutinen är ombunden till huvudsessionen (fresh-session-
triggern fick inget repo), kör 04:15 svensk tid dagligen.

**Nattbatch 2026-08-30:** Overvåkingskamera (`overvakningskamera`, 12 videor + 4 bilder, 899/1169 kr, BE-ROAS 1,40) tillagd och launchad ACTIVE tillsammans med Sykkelshorts + Beltesliper. Kampanj-ID: 120251998454160233 / 120251998498540233 / 120251998582640233. Kvar i huvudmappen för morgonrutinen: Damasker Vandring (= Gamasjer Tur, 309 kr) och Jättefotboll (= Kjempefotball, 299 kr).

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
