# Batch-log — Golf Adventskalendern (24 golftillbehör)

Breakthrough-frekvens: 1/15 (7 %) (etikett.mjs --frekvens 2026-10-01)

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

## Batch #1 — förstabatchen (2026-09-27, Axels beslut "NU")

**Varför nu:** batchen skulle ha väntat på dag 7-etiketten (2026-10-01).
Axel svarade 2026-09-27: **"1. NU"** — ägarens override. CS-KLART punkt 6
löstes med en **preliminär lärdom** `L-120250349281960291`
(Golfkalender_PD_1) skriven för hand ur Metas livstidsdata i `lardomar.md` —
märkt PRELIMINÄR, **ersätts av dag 7-lärdomen 2026-10-01 under samma id.**
Ingen etikett är satt; inget här är en dom.

**Data 2026-09-27 07:30 UTC (maximum, 7d_click):** kampanj 3 278 kr, 14 köp,
ROAS 3,05, CPA 234 kr, AOV 714 kr → break-even-CPA 452 kr (1,58).
`PD_1` 2 969 kr (91 %) / 13 köp / ROAS 3,05 / CPA 228 kr / hold 12 % /
CVR 3,3 % — vinstbidrag (452 − 228) × 13 = 2 912 kr. Systrarna `PD_2` 4 kr
och `PD_3` 14 kr med samma text: videon är variabeln. Budget 1 400 kr/dag
(SKALA +20 % 2026-09-27 05:54).

**Feedback-rad:** hubben skapades i dag (dubblett av MALL) — ingen "Brief
review"-rad. Rapporterat. Termoskyddets senaste regler tillämpades ändå.
**Annonsidéer:** 0 rader "Ny" för produkten. **Kvot:** produkten finns inte i
`products.json` (rond-produkt) — 18 briefer ≥ varje kvot i skriptet.

**Kundspråk:** ingen svensk VoC hittades för golfkalendrar (sökningen
2026-09-27 gav bara Amazon/Etsy-listningar; kampanjen har 1 kommentar, en
vän-tagg). Spärren noterar därför "15 nya koncept, 0 med kalla=voc" — det är
sant och står kvar. Referenserna i PTC-raden (@golf.calendar på TikTok) är
nästa VoC-källa när någon kan läsa kommentarerna.

### Briefer (18 st, alla ✅ i tools/briefgranskning.mjs från main 67d5c89, 0 av 18 stoppade; 1 rondnot: 0/15 voc, se ovan)

| Brief | Typ | Variabel | Hypotes | KPI | Källa |
|---|---|---|---|---|---|
| `Golfkalender_PD_1_H4` | I, it 1 på PD_1 | öppningen: lucka 1 öppnas, peggen i handen | luckan slår chokladraden som första bild | CPA mot 452 kr, hold | egen-data |
| `Golfkalender_PD_1_H5` | I, it 2 | längre problemdel: bagen tömmer sig | problem-medveten öppning matar samma kropp | CPA, hold | egen-data + sidan |
| `Golfkalender_PD_1_H6` | I, it 3 | in media res: sidofacket fullt först | resultatet håller bättre | hold, CPA | egen-data |
| `Golfkalender_SO_1_H1` | N | SO: bagen tömmer sig, kalendern fyller på | golfaren själv köper på påfyllningen | CPA | backlog/sidan |
| `Golfkalender_GT_4_H1` | N | GT: presentkortet i lådan mot paketet | presentköparen som egen avatar | CPA | sidans rad |
| `Golfkalender_PD_4_H1` | N | konfliktform: choklad mot golf i split | att visa konflikten slår att säga den | CPA | Racingbilar PD_2_1 (n=1) |
| `Golfkalender_PD_5_H1` | N | ritualen dag för dag | nedräkningen som jump cuts | hold | Racingbilar FM_1_H1 (obevisad) |
| `Golfkalender_OB_1_H1` | N | OB: vad ligger bakom luckorna | full öppenhet låser upp den tveksamma | CVR | sidans FAQ (1 kommentar, inte voc) |
| `Golfkalender_SP_4_H1` | N | SP som situation utan citat | uppackningen säljer utan recension | CPA | sidans rad |
| `Golfkalender_PD_4_1` | N, statisk | innehållet runt kartongen | validerar PD som bild (PD_2_1 för tidig) | CPA | backlog |
| `Golfkalender_SO_1_1` | N, statisk | choklad mot golf (split) | konflikten utan rörelse | CPA | backlog |
| `Golfkalender_LI_1_1` | N, statisk | sex saker bakom luckorna | listan som bild | CPA | backlog |
| `Golfkalender_CS_4_1` | N, statisk | pris utan brådska | ankaret utan "innan priset går upp" | CPA | backlog |
| `Golfkalender_OB_1_1` | N, statisk | presentkortet i lådan mot bagen | fel present som risk | CPA | sidans rad |
| `Golfkalender_GT_4_1` | N, statisk | inslagen kartong mot bagen | presentvinkeln utan rörelse | CPA | backlog |
| `Golfkalender_BOF_1_1` | N, BOF | pris till den som redan klickat | — retargeting | CPA | — |
| `Golfkalender_BOF_2_1` | N, BOF | 14 dagars ångerrätt + färdigfylld | — retargeting | CPA | sidan |
| `Golfkalender_OB_2_1` | N, OB | vem är den för (vuxna och tonåringar) | — retargeting | CPA | sidan |

Inga review-bilder, ingen testimonial-static (importrader). `RI_1_H1`
(sista beställningsdag i copy) står kvar i backloggen som BLOCKER tills Axel
sagt ja till ett datum. Tre BOF-bilder = `BOF_1_1`, `BOF_2_1`, `OB_2_1`.

**Testplan:** nytt test-ABO med lika budget per annons (regel 11). Tier 1:
PD_1_H4/H5/H6 + PD_4_H1 + PD_4_1 + CS_4_1. Tier 2: SO_1_H1, GT_4_H1, PD_5_H1,
OB_1_H1, SO_1_1, LI_1_1, OB_1_1, GT_4_1. Tier 3 (retargeting): BOF_1_1,
BOF_2_1, OB_2_1, SP_4_H1. Ingen dom under 300 kr / 3 köp; kill när CPA >
452 kr efter ≥ 500 kr spend. Säsong: batchen måste vara live med marginal
före 2026-11-17 (adventsbruk), kampanjen stängs 2026-12-10. Gör innan spend:
priset läses live (549/719), inga barn, inga datumrader, "greenlagare" inte
"pitchgaffel".

**Copy:** sonnet, `batch-01/copy-sonnet.md` — 151 svenska rader i
tre-frågorstestet, alla ❌ på "kan konkurrent signera". Regi:
`batch-01/regi.json`. Manifest: `batch-01/manifest.json`. Drive: `Batch #1`
(`1R_WB7zHj5tPAN91wfX9UoMFp-kYke9KG`) inuti Joshs produktmapp, en undermapp
per annons. Notion: **Golf advent calendar creative hub**
(`3e8270ab-908c-817b-9e74-efe7a636609e`, dubblett av MALL, omdöpt) — raderna i
`batch-01/notion-rader.json`.

**Vid dag 7 (2026-10-01):** skriv den riktiga lärdomen för PD_1 med
`lardom.mjs --skriv` (samma id — ersätt det preliminära blocket i
`lardomar.md`, LARDOM-raden 2026-09-27 är märkt `preliminar: true`) och logga
launchen med `/logga`.


## Fars dag omgång 4 — extra BOF-batch (2026-09-29 kväll, Axels order samma kväll)

Axel: "gör en till extra batch för fars dag för alla produkter och gärna dubbelt så mycket bildads och sedan normal kvantitet videos så att vi pushar extra mycket BOF fars dag annonser". Invändningen som batchen svarar på: **"vad finns i luckorna?"** (svar ur sidan: 24 luckor med golfbollar, peggar, bollmarkeringar, greenlagare med spegel, klubbrengöringsborste och golfhandduk). Förälder Golfkalender_PD_1 (lärdom L-120250349281960291). Alla sju klarade spärren (regi 4/4, 0 fel), ligger som `Draft` i Golf advent calendar creative hub. Loggkod `FARSDAG_BATCH_KLAR`. Batch-loggen för hela omgången: `docs/briefs/farsdag-2026/README-bof.md`.

| Annons | Typ | Hook / rubrik | Notion |
|---|---|---|---|
| Golfkalender_FD_3_H1 | video 13 s, BOF-omklipp | Bakom luckorna: golfbollar, peggar, greenlagare och klubbborste. | https://www.notion.so/3ea270ab908c8116ac44d03f47479315 |
| Golfkalender_FD_3_H2 | video 13 s, BOF-omklipp | 549 kr, ord. 719 kr. Golfkalender till fars dag. | https://www.notion.so/3ea270ab908c818698c8f76a2f9d56b8 |
| Golfkalender_FD_3_H3 | video 13 s, BOF-omklipp | Beställ senast 19 oktober: golfkalendern till fars dag. | https://www.notion.so/3ea270ab908c811db60aff414dd91ff0 |
| Golfkalender_FD_4_1 | bild, BOF | Luckorna är fyllda med golfbollar och peggar | https://www.notion.so/3ea270ab908c813597d5d0ab675496d3 |
| Golfkalender_FD_4_2 | bild, BOF | 549 kr till fars dag. Ord. 719 kr. | https://www.notion.so/3ea270ab908c81f88fafe1b0e4a0deb0 |
| Golfkalender_FD_4_3 | bild, BOF | Beställ senast 19 oktober, golfkalender till fars dag | https://www.notion.so/3ea270ab908c81c8b424ff4ff73d5b0c |
| Golfkalender_FD_4_4 | bild, BOF | Golfhandduk, klubbrengöringsborste, greenlagare med spegel | https://www.notion.so/3ea270ab908c8174aec9d02928d5d4ed |

Mätning (ANALYSMETOD): ingen dom under 300 kr / 3 köp. H1 mot H2 mot H3 = vilken öppning (invändning, pris, sista dag) den produktmedvetna tittaren behöver; FD_4_1–4 mot varandra = budskapet i textrutan; hela batchen mot FD_1/FD_2 (presentvinkeln, kall publik). Etikett dag 7, lärdom, sedan dna.md.

## Etiketter dag 7 (2026-10-01) — Golf Adventskalendern

Ur `agent/etikett-backfill.mjs` 2026-10-01 (MagiBorsten SE, annonsens egna första vecka 2026-09-24–2026-09-30, 7d_click). Lärdom per annons i `lardomar.md` (LARDOM-rader samma morgon). Breakthrough-frekvens: 1/15 (7 %) (etikett.mjs --frekvens 2026-10-01).

| Annons | Batch | Etikett (7 d) | Andel | Spend | Köp | ROAS ad / kampanj | Hook / hold | Bedömbar |
|---|---|---|---|---|---|---|---|---|
| Golfkalender_PD_1 | 1 | **BREAKTHROUGH** | 96 % | 11 083 kr | 53 | 3,22 / 3,17 | 29 % / 11 % | ja |
| Golfkalender_SP_3 | okänd | **KPI_WINNER** | 1 % | 144 kr | 1 | 6,48 / 3,17 | 25 % / 6 % | nej |
| Golfkalender_PD_2_1 | okänd | **LOSER** | 1 % | 88 kr | 0 | 0,00 / 3,17 | — | nej |
| Golfkalender_PD_3 | okänd | **LOSER** | 1 % | 61 kr | 0 | 0,00 / 3,17 | 28 % / 8 % | nej |
| Golfkalender_CS_2 | okänd | **LOSER** | 0 % | 44 kr | 0 | 0,00 / 3,17 | 30 % / 9 % | nej |
| Golfkalender_SP_2_1 | okänd | **LOSER** | 0 % | 23 kr | 0 | 0,00 / 3,17 | — | nej |
| Golfkalender_G_2 | okänd | **LOSER** | 0 % | 19 kr | 0 | 0,00 / 3,17 | 23 % / 6 % | nej |
| Golfkalender_SP_2 | okänd | **LOSER** | 0 % | 15 kr | 0 | 0,00 / 3,17 | 33 % / 9 % | nej |
| Golfkalender_CS_1 | okänd | **LOSER** | 0 % | 12 kr | 0 | 0,00 / 3,17 | 47 % / 13 % | nej |
| Golfkalender_PD_2 | okänd | **INGEN_LEVERANS** | — | 8 kr | 0 | 0,00 / 3,17 | 10 % / 3 % | nej |
| Golfkalender_SP_1 | okänd | **INGEN_LEVERANS** | — | 6 kr | 0 | 0,00 / 3,17 | 5 % / 5 % | nej |
| Golfkalender_G_2_1 | okänd | **INGEN_LEVERANS** | — | 4 kr | 0 | 0,00 / 3,17 | — | nej |
| Golfkalender_G_1 | okänd | **INGEN_LEVERANS** | — | 3 kr | 0 | 0,00 / 3,17 | — | nej |
| Golfkalender_G_3 | okänd | **INGEN_LEVERANS** | — | 2 kr | 0 | 0,00 / 3,17 | 9 % / — | nej |
| Golfkalender_CS_3 | okänd | **INGEN_LEVERANS** | — | 2 kr | 0 | 0,00 / 3,17 | 13 % / 13 % | nej |

## Batch #2 — 2026-10-02 (`/rond-auto` steg 4b, brief-runda: rundaAntal 8, mix 80 % vidarebyggen på Golfkalender_PD_1 / 20 % nya, fokus "mata vinnaren — skalats 4 gånger på en vecka")

**Läget (3 d, avläst 2026-10-02):** FOR_LITE_DATA (ROAS saknas i 3-dygnsfönstret efter gårdagens höjning 3 000 → 3 600 kr), CPA 👀 två stigande dygn (146 → 212 → 275 kr), spendtjuv grönt läge INGEN_TJUV. Dag 7-etiketten 2026-10-01: Golfkalender_PD_1 BREAKTHROUGH (96 %, 53 köp, ROAS 3,22, CPA 209 kr mot BE-CPA 426 kr), 14 lärdomar skrivna 2026-10-01 — alla pekar tillbaka på PD_1 (inga namngivna platser). Brieftak 14, rundan 8. Brief review 2026-09-29 (hubbens Feedback-rad) tillämpad: (1) varje fars dag-rad säger "24 luckor från 1 december", (2) en statisk säger varje fakta en gång, (3) marknadsraden "Sweden and Norway only". Kommentarer: 0 leads. Copy av sonnet (batch-02/copy-sonnet.md, 110 rader testade), spärren `briefgranskning.mjs` (main) 8/8 + 7/7 gröna, `lardom.mjs --brief` 8 BRIEF-rader (iterationsnumren ur loggen: pd-luckan-oppnas 4–7). Alla 15 i Notion (Golf advent calendar creative hub) som Draft, tillbakalästa block för block.

| Annons | Format | Typ | Parent | Variabel | Hypotes | Förväntan | rev | brief → live | Notion |
|---|---|---|---|---|---|---|---|---|---|
| Golfkalender_PD_1_H7 | video 14 s | I | PD_1 | hooken VISAD: chokladkalendern åker ut ur bild, golfkartongen tar platsen (NEW FOOTAGE) | konflikten i bild slår konflikten i text | hook rate > 29 % | okänd | — | https://www.notion.so/3ed270ab908c81e69c3dcdc40c70bcc3 |
| Golfkalender_PD_1_H8 | video 14 s | I | PD_1 | inventariet först (innehållet på bordet som sekund 0) | HOLD-listan som öppning stoppar lika många men konverterar bättre | CVR ≥ 3,0 % | okänd | — | https://www.notion.so/3ed270ab908c81b0b962f5219e975368 |
| Golfkalender_PD_1_H9 | video 14 s | I | PD_1 | ingen VO — bara captions och musik | problemmedvetenheten bär utan röst | hook rate ≥ 29 %, CPA ≤ 209 kr | okänd | — | https://www.notion.so/3ed270ab908c81cfb86ce33e5533fbfb |
| Golfkalender_PD_6_H1 | video 10 s | I | PD_1 | klipplängden (samma hook, 10 s) | kort klipp ger lägre CPA (IBC PD_Extra-hypotesen) | CPA < 209 kr | okänd | — | https://www.notion.so/3ed270ab908c81b6b5ecc9dc2dbf7311 |
| Golfkalender_PD_1_1 | bild | I | PD_1 | vinnarens öppning som stillbild (kartongen + hookraden), prisband | formatöverföring: stillbilden bär konflikten | ≥ 300 kr och ROAS_7d ≥ 1,58 | okänd | — | https://www.notion.so/3ed270ab908c81f68bd1d944038cb368 |
| Golfkalender_GT_5_H1 | video 14 s | I | PD_1 | hooken till presentköparen: "Klubborna har han. Bagen tömmer sig i det tysta." | avatarn (partnern) på vinnarens kropp | CVR ≥ 3,0 % | okänd | — | https://www.notion.so/3ed270ab908c81f9a33ad16bdcf210ba |
| Golfkalender_GT_6_H1 | video 14 s | N | — | ett paket att slå in, inte 24 småpresenter (sidans rad) | ny vinkel: presentköparens krångel | ≥ 300 kr, 3 köp innan dom | okänd | — | https://www.notion.so/3ed270ab908c81148895cf731b0316ed |
| Golfkalender_PD_7_H1 | video 13 s | N | — | från lucka till bag: varje pryl hamnar i sidofacket (NEW FOOTAGE) | "allt kommer till användning på banan" som koncept | ≥ 300 kr, 3 köp innan dom | okänd | — | https://www.notion.so/3ed270ab908c81d1985df89da5454eeb |

**Fars dag-blocket omgång 5 (EXTRA, `agent/farsdag.json`):** invändningen **"han har redan allt i bagen"** → det som tar slut (bollar, peggar, markörer), luckorna öppnas från 1 december. FD_5_H1 (invändningen besvarad) / H2 (priset först) / H3 (sista dagen först) = omklipp av PD_1, rad 2–4 identiska; FD_6_1–4 = fyra statiska på samma foto, bara textrutan skiljer (regel 2: priset bara i bandet, datumet bara i bottenraden). Marknad: Sverige och Norge. Inga BRIEF-rader (utanför taket), loggat som FARSDAG_BATCH_KLAR.

| Annons | Typ | Hook / rubrik | Notion |
|---|---|---|---|
| Golfkalender_FD_5_H1 | video 13 s, BOF-omklipp | invändningen besvarad | https://www.notion.so/3ed270ab908c81f1abb6eddf4e9f2024 |
| Golfkalender_FD_5_H2 | video 13 s, BOF-omklipp | priset först | https://www.notion.so/3ed270ab908c8173aa55e7dbc9bdca36 |
| Golfkalender_FD_5_H3 | video 13 s, BOF-omklipp | sista dagen först | https://www.notion.so/3ed270ab908c811fb6e8c3efdd5c83b9 |
| Golfkalender_FD_6_1 | bild, BOF | invändningen | https://www.notion.so/3ed270ab908c81caa6acdb61f165d169 |
| Golfkalender_FD_6_2 | bild, BOF | priset först (rubriken utan talet) | https://www.notion.so/3ed270ab908c8155843ddfd6c3c7f155 |
| Golfkalender_FD_6_3 | bild, BOF | sista dagen (rubriken utan datumet) | https://www.notion.so/3ed270ab908c81a29bccd014982565f5 |
| Golfkalender_FD_6_4 | bild, BOF | vad han får | https://www.notion.so/3ed270ab908c81e3996ed94b4be8068d |

Mätning (ANALYSMETOD): ingen dom under 300 kr / 3 köp. Etikett dag 7, lärdom, sedan dna.md. ⚠️ Hubben bar redan 19 orörda drafts från batch #1 (09-27) när rundan byggdes — Axels regel "hellre några briefs för mycket".
