# NO-videobatch 2026-09-19 — rutinen `/translate-no`

## Fas 0 — Inventering

LAUNCHED (`1-vbYhYgTEv7zYptW5rGmgKAITmAz4l1X`) listad: 14 produktmappar (WINNERS,
LOSERS, MAKE TO NORWAY exkluderade som mappar, inte kandidater). MAKE TO NORWAY
listad rekursivt inkl. undermappen WINNERS (37 + 3 NO-mappar vid start).
Kampanjlistan i `act_1050941584152547` läst (44 kampanjer, oavsett status).

Fem NYA produktmappar sedan 2026-09-18: 10 Snöskyffel utan batteri,
8 Vedklyvborr Ø32 mm, Biltvättborste Teleskop, Fodrade Inomhustofflor,
K Gör din egen-kalender. Plus K Dinosauriekalender (kvarstående i kö sedan
2026-09-17, blockerad då — omprövad idag eftersom kandidatlistan alltid
räknas om från grunden).

| Produktmapp | NO-mapp | Kampanj i NO-kontot | Dom |
|---|---|---|---|
| 10 Snöskyffel utan batteri | ❌ | ❌ | **blockerad** — finns inte på beverbutikken.no (hela produktkatalogen, 202 produkter, genomsökt). Problemrapport skickad. |
| 8 Vedklyvborr Ø32 mm | ✅ (byggd idag) | ✅ (byggd idag) | **körd** |
| Biltvättborste Teleskop | ❌ | ❌ | **blockerad** — oversize i batch-sheet #8 (NORWAY-kolumnen tom, "OVERSIZE" på Qty 1), samma strukturella orsak som Sittkäpp Hopfällbar. Problemrapport skickad. |
| Fodrade Inomhustofflor | ✅ (byggd idag) | ✅ (byggd idag) | **körd** |
| K Gör din egen-kalender | ❌ | ❌ | ej kontrollerad denna natt — kön full efter tre körda kandidater (bokstavsordning). Kvar till nästa natt. |
| K Dinosauriekalender | ✅ (byggd idag) | ✅ (byggd idag) | **körd** — norsk produktsida ("Dinosaur Adventskalender – 24 Dinosaurer") tillkommen sedan 2026-09-18, blockeringen löst av sig själv |
| 7 Sittkäpp Hopfällbar | ❌ | ❌ | **blockerad, oförändrat** — samma strukturella orsak sedan 2026-09-16 (batch-sheet #7, "too large to deliver at all"). Ingen ny problemrapport. |

**Tre produkter körda i natt (max per körning, bokstavsordning bland de
körbara kandidaterna): Vedklyvborr, Fodrade Inomhustofflor, Dinosauriekalender.**
Snöskyffel och Biltvättborste hoppade med problemrapport. Sittkäpp kvarstår
blockerad utan ny rapport. Gör din egen-kalender oprövad, står i kö.

## Kvot

HeyGen-kvot vid start: 3 920 api-krediter. Efter proofread (35 videor):
3 385 (535 förbrukade). Efter rendering: 2 558 (827 förbrukade).
**Totalt förbrukat: 1 362 krediter för 35 proofreads + 34 renderingar** (en
video, dinosauriekalender PD_1_H2, strök ur batchen — se nedan).

## Fas 1 — Proofread + lokalisering

35 videor (12 vedklyvborr + 11 inomhustofflor [källmappen saknar PD_1_H1] +
12 dinosauriekalender), alla proofreads klara utan fel.

**Sonnet-lokalisering, tre parallella subagenter (en per produkt):**
- **Vedklyvborr:** "i hela Sverige" → "i hele Norge" i SP-konceptet (HeyGen
  hade glömt byta marknad). Falsk "fri frakt"-claim struken ur ADCOPY:n
  (299 kr ligger under butikens 300 kr-gräns). Overifierat kundcitat mjukat.
- **Inomhustofflor:** inga sakfel i källan, bara språklig konsekvens.
  Overifierat kundcitat mjukat.
- **Dinosauriekalender:** HeyGen hade behållit svenska SEK-priser rakt av
  (529/399 kr i stället för de norska 599/449 kr) och nämnde
  "Bäverbutiken.se"/"bebebutiken.se" upprepade gånger i CS/G/PD/SP-filerna
  — allt rättat. "Fri frakt til Sverige og Norge" → "fri frakt" (ren
  norsk-marknads-annons, ska inte nämna Sverige).
  **PD_1_H2 kunde inte lokaliseras** — både käll-SRT och HeyGens
  maskinöversättning var nonsens/icke-tal på flera språk. Struken ur
  manifestet, ingen video renderad eller launchad för den. 11 av 12
  dinosauriekalender-videor i denna batch.

Alla 34 SRT-korrigeringar applicerade i HeyGen och verifierade — 0 mismatch
(den kända CDN-lagg-buggen slog inte till denna gång).

## Prispolicy (Axels beslut 2026-08-29)

Två claim-mismatchar hittade och åtgärdade **innan** launch:
- **Vedklyvborr:** CS-konceptets "50 % RABATT" stämde inte mot butiken
  (299/389 = 23 %) → jämförpris höjt 389 → 598 kr
  (`shopify-fix-compareat.mjs --market NO --rabatt 50`). Video-audions egna
  "30 %"-claim är en sann underdrift av den nya 50 %-rabatten, rörd inte.
- **Fodrade Inomhustofflor:** samma mönster, CS "50 % RABATT" mot 429/559
  (23 %) → jämförpris höjt 559 → 858 kr.
- **Dinosauriekalender:** "25 % rabatt" stämde redan (599/449 = 25,04 %) —
  ingen justering.
- **Fri frakt:** butikens gräns är 300 kr (verifierat mot
  `/pages/retur-og-angrerett` — samma sida gav facit för "30 dagers åpent
  kjøp", som ersatte källans felaktiga "14 dagars öppet köp" i
  dinosauriekalenderns bildannons). Vedklyvborr (299 kr) ligger under
  gränsen → ingen fri frakt-claim. Inomhustofflor (429 kr) och
  dinosauriekalender (449 kr) ligger över → claim OK där den förekom.

## Fas 2 — Captions + röstkoll

✅ 34/34 `pipeline/no-captions.py` i Beltesliper-stilen. Två flaggades av
bandkontrollen vid första försöket (dinosauriekalender CS_1_H2/H3 — dubbla
textrutor, svensk text kvar ovanför standardbandet i en mörk scen) och
kördes om med `--band=1250:1550`, grönt vid andra försöket. Samtliga 34 QA-
bilder (10/50/90 %) och slutkortssvepet (sista sekunden × alla 34) lästa
manuellt: ingen svensk text, ingen butiksdomän kvar, rätta priser.

✅ 34/34 `pipeline/rostkoll.py` mot sina svenska källor — inga mätbara fel
(ffprobe-shimmen från `pipeline/omdubb/` installerad i containern, dör med
den). Grönt betyder inga mätbara fel, inte "godkänd" — ingen bokstavlig
avlyssning gjord denna körning (miljön saknar ljuduppspelning), men
volym/längd/SRT-kontrollerna gav 0 avvikelser på alla 34.

## Fas 3 — Launch i Magiborsten NO

Tre kampanjer, alla ACTIVE, CBO 1000 kr/dag, dubblettspärr kontrollerad
(ingen befintlig kampanj för något av namnen):

- **Vedkløyverbor NO | BE-ROAS 1,61 | 2026-09-19** (`120252299552200233`) —
  4 adsets (CS/GT/PD/SP), 12 videoannonser + 4 bildannonser = 16 annonser.
- **Innetøfler NO | BE-ROAS 1,62 | 2026-09-19** (`120252299606860233`) —
  4 adsets, 11 videoannonser (PD saknar H1) + 4 bildannonser = 15 annonser.
- **Dinosaur Adventskalender NO | BE-ROAS 1,46 | 2026-09-19**
  (`120252299777560233`) — 4 adsets (CS/G/PD/SP), 11 videoannonser
  (PD saknar H2) + 4 bildannonser = 15 annonser.

**46 annonser totalt, alla ACTIVE**, verifierade i realtid av launch-
skriptets egen kvittenslogg (API-dubbelkoll på adset-nivå gick inte,
kontot hårt rate-limitat i flera minuter efter varje launch — samma
mönster som tidigare körningar).

**BE-ROAS:** Vedklyvborr 299/(299−10,53 EUR×10,8095)=1,61. Inomhustofflor
429/(429−15,21 EUR×10,8095)=1,62. Dinosauriekalender 449/(449−13,02 EUR×
10,8095)=1,46. Dagskurs EUR→NOK 10,809524 (`open.er-api.com`, avläst vid
körstart).

**Verktygsfel rättat under körningen:** `no-video-launch.mjs` frågade
`advideos` med `limit=500`, vilket Meta avvisade med "Please reduce the
amount of data you're asking for" (kontot har ackumulerat för många videor
över flera veckors körningar). Sänkt till `limit=100`, verifierat med curl
att den frågan går igenom. `no-image-ads.mjs` hade en regex
(`/_\d+$/`) som inte matchade annonsnamn med H-suffix
(`Produkt_NO_K_1_H1`) — skriptet trodde bildannonsen redan fanns och
skapade den aldrig. Fixat till `/_\d+(_H\d+)?$/`, verifierat mot ett redan
launchat konto (batcher utan H-suffix, t.ex. Fågelmatare, klarade sig;
batcher med H-suffix hade fel). Båda fixarna committade.

## Fas 3.2 — Bildannonserna

12 källbilder (4 per produkt) rensade med Kie AI (`nano-banana-edit`).
Två misslyckades vid första försöket (inomhustofflor CS + GT) — CS löstes
med en omkörning, GT misslyckades även på andra försöket och löstes
manuellt med en blur-patch över textbandet (samma teknik som tidigare
batcher, `fix-g.py`-mönstret). Norsk text ritad med PIL
(`compose-no.py`), alla 12 granskade visuellt efter komposition — en
spacing-bugg (stjärnor som kolliderade med text i inomhustofflor-SP) och
en saknad ✅-glyf (Liberation Sans saknar den, ersatt med en ritad
bock-ikon) hittades och rättades innan launch. 12/12 bildannonser ACTIVE.

## Drive-leverans

Tre nya mappar skapade av rutinen själv (Drive-connectorn) i MAKE TO
NORWAY: **NO Vedklyvborr** (`1guQIP8fp9eVJeEa4Y4cn4Y9kBhxRGVQl`),
**NO Fodrade Inomhustofflor** (`1GTXSdz9fRSpe4N5l8WoVwv_juJn1sg4x`),
**NO Dinosauriekalender** (`1_7i8GMGd7MONpl7JEhrmjIfNd-QSDTZ0`). Alla
videor + bildannonser + adcopy-txt uppladdade via `drive-push.mjs`
(Apps Script-brevlådan): 20 + 19 + 19 = 58 filer, 0 fel.

**Ingen chatt-zip denna körning** — 34 videor blev 30 separata zip-filer
(561 MB totalt, gränsen 30 MiB/zip gör att nästan varje video blir sin
egen zip). Det är en obevakad nattrutin utan mottagare i chatten just nu;
Drive-mapparna ovan är den fulla, varaktiga leveransen. Samma avvägning
som tidigare batcher med stora leveranser.

## Definition of done

- [x] LAUNCHED listad; WINNERS, LOSERS och MAKE TO NORWAY exkluderade; kandidater = utan NO-mapp OCH utan kampanj; 3 körda, kön listad (Gör din egen-kalender)
- [x] Alla annonsvideor i produktmapparna inventerade; icke-annonser exkluderade
- [x] Norsk produktsida + NOK-pris verifierade för varje launchad produkt
- [x] Varje produkt som inte gick att köra: problemmeddelande i `#problems-no` med ping (Snöskyffel, Biltvättborste)
- [x] Norge-COGS läst ur NORWAY-blocket i rätt batch-sheet (#8, #8, Kalenderkungen), utan tull
- [x] Kvot räckte — rapporterad före/efter (3 920 → 2 558)
- [x] Proofread FÖRE rendering på varje video; alla SRT-rättelser redovisade
- [x] Copy/SRT-rader skrivna av sonnet-subagent (tre parallella)
- [x] Inbränd svensk text skannad; captions diskret över befintligt band, max 2 rader
- [x] Slutkortssvep gjort (alla 34)
- [ ] Levererat i chatten som zip ≤30 MiB — **hoppat, se motivering ovan (obevakad rutin, 561 MB/30 zip)**
- [x] Kampanj per produkt i act_1050941584152547: CBO 1000 kr/dag, adset per koncept, enhancements OPT_OUT, ACTIVE, BE-ROAS + datum i namnet, dubblettspärren körd
- [x] Körloggen uppdaterad, allt committat och pushat
- [x] Discord-brief skickad i `#translation-till-norge-av-nya-produkter`, i Axels läsformat, med ping
