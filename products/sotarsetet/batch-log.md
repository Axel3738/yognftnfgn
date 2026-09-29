# Batch-log — Sotarsetet med Böjliga Stänger

Breakthrough-frekvens: 2/11 (18 %) — `node agent/etikett.mjs --frekvens` 2026-09-26 (spend winners 0, KPI winners 1, losers 2, ej levererade 6).

## Batch #1 — 2026-09-19 (Joshs testbatch, före OS:et)

11 annonser launchade 2026-09-19 i kampanj `120250284693380291`, 1 800 kr/dag:
`Sotarset_PD_1_H1–H3`, `G_1_H1–H3`, `CS_1_H1–H3`, `SP_1_H1–H3` (CS_1_H1 syns
inte bland de aktiva 2026-09-21). Utfall efter två dygn: se `dna.md` —
PD_1_H2 + PD_1_H3 bär 95 % av spenden och 23 av 25 köp.
⚠️ SP-annonserna påstår fem stjärnor + "30 dagars öppet köp", CS-annonserna
"lagret är begränsat" / "fri frakt över 300 kr" — inget av det står på sidan.
Live-regeln 2026-09-15: de rörs inte, men anmärkningen går till redigeraren.

## Startskott — 2026-09-21

`OPS_STARTSKOTT` loggat och postat i `#ops-startskott`: 3 058 kr, 25 köp,
CPA 122 kr mot BE-CPA 307, ROAS 4,04, 39,1 % vinst. Inget OPS-konto bär
produkten ännu (`915422744950975` avläst: ingen SOTARSET-kampanj).
Budget samma morgon 1 800 → 2 150 kr (SKALA, verifierad).

## Batch #2 — 2026-09-21 (`/rond-auto` steg 4b, `forsta_batch`, första OS-batchen)

Hub: **Chimney sweep set creative hub** (db `3e2270ab-908c-8171-bbae-fff6adedbe5a`,
datakälla `collection://af6270ab-908c-8256-879b-07429bfd3596`), dubblett av
MALL Creative hub MALL, skapad och omdöpt i samma körning. 14 rader i Draft,
verifierade med notion-fetch (PD_6_1) + SQL. Drive: Joshs produktmapp
`1lJZewCo50svHhA9Cob47VdVVf85EZd9D` (ingen ny batchmapp).

**Läget som batchen byggdes på:** två bedömbara annonser (PD_1_H2 +2 410 kr,
PD_1_H3 +1 714 kr), resten utsvultna. Break-even-CPA 307 kr på AOV 495 kr.
Priset avläst live: 459 kr / 599 kr.

| Annons | Format | Hypotes | Isolerad variabel | Källa |
|---|---|---|---|---|
| `Sotarset_PD_2_H1` | video | räckvidden bakom kaminen/torktumlaren är en egen smärta | vinkeln (räckvidd) | sidraden + PD_1_H2 |
| `Sotarset_PD_3_H1` | video | stel stång fastnar i kröken, böjlig går igenom (konflikt typ A) | vinkeln (jämförelse) | sidraden + copy-regler |
| `Sotarset_PD_4_H1` | video, **villkorad** | riktigt sot på tidningspapper som bevis — bara med äkta material | beviset | PD_1_H2 + gissning |
| `Sotarset_UG_1_H1` | video | UGC-talare vid kaminen, ingen voiceover | formatet (talare) | gissning |
| `Sotarset_PD_5_H1` | video | räknad uppbyggnad 1…9 → 3,69 m, "bygg bara den längd du behöver" | hooken | sidraden + gissning |
| `Sotarset_CS_2_H1` | video | ärligt erbjudande 599 → 459 utan brådska; CS_1 fick aldrig spend | erbjudandet | gissning + sidpriset |
| `Sotarset_PD_1_H4` | video | PD_1_H2:s kropp, nya 0–3 s: borsten kommer ut svart | första 3 sekunderna | förälder PD_1_H2 |
| `Sotarset_PD_1_H5` | video | PD_1_H2:s kropp, nya 0–3 s: stången böjer genom kröken | första 3 sekunderna | förälder PD_1_H2 |
| `Sotarset_PD_2_1` | bild | räckviddsvinkeln validerad billigt som statisk | vinkeln | sidraden |
| `Sotarset_PD_3_1` | bild | stel/böjlig som tvådelad bild | vinkeln | sidraden |
| `Sotarset_PD_4_1` | bild, **villkorad** | sotet på tidningen som foto — bara äkta | beviset | gissning |
| `Sotarset_CS_2_1` | bild | 459 kr med 599 struket, inget annat | erbjudandet | sidpriset |
| `Sotarset_G_2_1` | bild | gåva till honom med kamin — G-videorna svalt | vinkeln (gåva) | befintlig G-copy |
| `Sotarset_PD_6_1` | bild | "Det här får du" — spec-lista på riktigt foto med nio stänger | vinkeln (spec) | sidans Funktioner |

**0 BOF-bilder** (regel 2026-09-20: produkten har inga BOF-etiketter alls).
**0 review-bilder** (de 10 recensionerna är seedade, se dna.md).

**Regler ur Brief review 2026-09-18** (Belt/Boat/Termo — den här hubben är ny
och har ingen egen Feedback-rad än): butiksnamnet aldrig i annonsen,
villkor bara från produktsidan, förälderns CPA + köp mot break-even-CPA.
**Annonsidéer:** inga rader för produkten.

**Modellpolicy följd (CLAUDE.md regel 6):** copy av sonnet-subagent med DNA-fakta,
hooks, formatkrav och `docs/copy-regler.md`; tre-frågorstestet står rad för rad
i varje brief. Strategi, urval och namn av huvudsessionen.

⚠️ **Saknas i den här batchen:** regitabellen (BRIEF-REGI) och komponenttaggarna
ur rond-auto 2.9/2.12 — kravet landade i kommandofilen 06:04 UTC samma
morgon (commit `f1bbba1`), efter att subagenten fått sin brief, och spärren
`tools/briefgranskning.mjs --manifest` finns inte på `main`. Nästa batch ska
bära dem.

**Mät från dag 1:** `rev` och `brief → live` per annons fylls i när raderna
lästs / annonserna gått live.

## Etiketter dag 7 (2026-09-26)

Ur `agent/utdata/etiketter-backfill-2026-09-26.md` (fönster 2026-09-19 – 2026-09-25, annonsens första vecka, 7d_click; kampanjens spend 16 433 kr, ROAS 2,88). Lärdom per rad i `lardomar.md` (11 LARDOM-rader skrivna samma dag).

| Annons | Batch | Typ | Etikett (7 d) | Andel | Spend | Köp | ROAS ad / kampanj | Bedömbar | Playbook |
|---|---|---|---|---|---|---|---|---|---|
| Sotarset_PD_1_H2 | — | okänd | **BREAKTHROUGH** | 53 % | 8744 kr | 48 | 2,92 / 2,88 | ja | 80 % vidarebygg på denna: I1 tre hookar → I2 problemdel → I3 in media res |
| Sotarset_PD_1_H3 | — | okänd | **BREAKTHROUGH** ⚠ nära 30 % | 30 % | 4894 kr | 26 | 2,59 / 2,88 | ja | 80 % vidarebygg på denna: I1 tre hookar → I2 problemdel → I3 in media res |
| Sotarset_PD_1_H1 | 1 | okänd | **LOSER** | 13 % | 2059 kr | 11 | 2,76 / 2,88 | ja | släpp |
| Sotarset_G_1_H2 | — | okänd | **KPI_WINNER** | 1 % | 196 kr | 3 | 7,03 / 2,88 | nej | 3 nya hookar, allt annat lika — den säljer men får inte spend |
| Sotarset_G_1_H3 | — | okänd | **LOSER** | 1 % | 111 kr | 0 | 0,00 / 2,88 | nej | släpp |
| Sotarset_CS_1_H2 | — | okänd | **INGEN_LEVERANS** | — | 6 kr | 0 | 0,00 / 2,88 | nej | hooken föll — logga och släpp, aldrig ABO |
| Sotarset_G_1_H1 | — | okänd | **INGEN_LEVERANS** | — | 6 kr | 0 | 0,00 / 2,88 | nej | hooken föll — logga och släpp, aldrig ABO |
| Sotarset_SP_1_H1 | — | okänd | **INGEN_LEVERANS** | — | 4 kr | 0 | 0,00 / 2,88 | nej | hooken föll — logga och släpp, aldrig ABO |
| Sotarset_SP_1_H3 | — | okänd | **INGEN_LEVERANS** | — | 3 kr | 0 | 0,00 / 2,88 | nej | hooken föll — logga och släpp, aldrig ABO |
| Sotarset_CS_1_H3 | — | okänd | **INGEN_LEVERANS** | — | 3 kr | 0 | 0,00 / 2,88 | nej | hooken föll — logga och släpp, aldrig ABO |
| Sotarset_SP_1_H2 | — | okänd | **INGEN_LEVERANS** | — | 0 kr | 0 | 0,00 / 2,88 | nej | hooken föll — logga och släpp, aldrig ABO |

**Det lärdomarna namngav (vidarebyggen, deadline 2026-10-10):** `Sotarset_PD_1_H6` (I1 på H2: symptom-hook), `Sotarset_PD_7_H1` (I2 på H2: längre problemdel), `Sotarset_PD_8_H1` (I3 på H2: in media res), `Sotarset_PD_1_H7` (I1 på H3: kameran inne i röret), `Sotarset_PD_8_H2` (I3 på H3: H3:s öppning på PD_8-kroppen); I2 på H3 SLÄPPT som dubblett av PD_7_H1. PD_1_H4/H5 (hubben, batch #2) räknas som redan utförda iterationer på PD_1_H2. Alla åtta småannonser SLÄPPTA (INGEN_LEVERANS = Metas dom, aldrig ABO; G_1_H2 under 300 kr, gåvan lever i G_2_1).

⚠️ Läst ur de live annonserna 2026-09-26: alla tre PD-videor delar kropp (amerikansk torktumlarfilm, kartong "30 FEET", "Dryer Vent Cleaner"), captionen stavar produkten "sotarsätt", SP-copyn bär ⭐⭐⭐⭐⭐ + "30 dagars öppet köp", CS-copyn "lagret är begränsat" + "Fri frakt över 300 kr", G-beskrivningen "perfekt julklapp" — inget av det står på sidan. Live rörs inte (regeln 2026-09-15); inget av det går in i en ny brief. Voiceovern är fortfarande oläst (ingen transkribering) — den öppna frågan i `backlog.md` står kvar.

## Vidarebygg + batch #3 — 2026-09-26 (`/rond-auto` steg 4b, behov `vidarebygg`, ersätter dagens brief-runda)

Hub: **Chimney sweep set creative hub** (db `3e2270ab-908c-8171-bbae-fff6adedbe5a`, https://www.notion.so/3e2270ab908c8171bbaefff6adedbe5a). Kampanjen ACTIVE 3 050 kr/dag, läst live via Graph API innan en enda rad skapades. Behovsraden: rundaAntal 6, tak 11 lärdomar + 5 namngivna platser = 16, mix 80 % vidarebyggen / 20 % nya vinklar. Priset läst live: 459 kr / 599 kr. **6 rader i Draft, alla video, 0 bilder** (ingen bild hade ett jobb: vinklarna är iterationer på en bevisad kropp, ingen BOF-etikett, inga recensioner). Sex rader skapade via `tools/notion-brief-upp.mjs` (main-worktreen), varje kropp tillbakaläst blockräknat; `Sotarset_PD_8_H1` öppnad med notion-fetch — script, tre-frågorstest och regitabell står i sidan.

**Spärrarna (gröna före Notion):** `lardom.mjs --brief --torr`: 6/6 validerade, briefkvot 11 fria + 5 namngivna. `briefgranskning.mjs --manifest --prefix Sotarset --pris 459 --jamforpris 599`: regi **4/4, 6/6, 6/6, 4/4, 6/6, 5/5**, 0 fel, 0 anmärkningar efter att variabelraden kortats till en fras. BRIEF-rader: 6 (koncept `pd-1-kroppen` iteration 1–3, `pd-1-h3-oppningen` iteration 1–2, `torktumlaren-bakom` iteration 1).

| Annons | Format | Typ | Parent | Hypotes | Isolerad variabel | Källa | Lärdom | rev | brief → live |
|---|---|---|---|---|---|---|---|---|---|
| `Sotarset_PD_1_H6` | video | I (1 av 3 på H2) | PD_1_H2 | symptomet hemma (sotigt kaminglas) stoppar fler rätt personer än borsten i skorstenstoppen; kroppen orörd | öppningen 0–4 s | egen-data (etiketten) | L-120250284711040291 | okänd | okänd |
| `Sotarset_PD_7_H1` | video | I (2 av 3 på H2) | PD_1_H2 | 7 s problemdel inne i röret före stängerna lyfter hold rate över 21 % | problemdelens längd | egen-data | L-120250284711040291 | okänd | okänd |
| `Sotarset_PD_8_H1` | video | I (3 av 3 på H2) | PD_1_H2 | in media res — borsten inne i röret vid sekund 0 ger högre hook rate än 51 % utan uppbyggnad | ordningen | egen-data | L-120250284711040291 | okänd | okänd |
| `Sotarset_PD_1_H7` | video | I (1 av 3 på H3) | PD_1_H3 | kundens egen vy ett steg längre in (kameran inne i röret) håller H3:s 55 % / 4,0 % och tar mer volym | öppningen 0–4 s | egen-data | L-120250284712920291 | okänd | okänd |
| `Sotarset_PD_8_H2` | video | I (2 av 3 på H3 — I2 SLÄPPT) | PD_1_H3 | H3:s öppning på PD_8-kroppen; paret PD_8_H1/H2 svarar om H3:s hook slår H2:s på den nya kroppen | öppningsbilden (mot PD_8_H1) | egen-data | L-120250284712920291 | okänd | okänd |
| `Sotarset_PD_9_H1` | video | **N** | — | torktumlarägaren utan kamin är en egen avatar under BE-CPA 307 kr — sidans "för trångt bakom torktumlaren", begär slippa-krangel | avataren | backlog ("Torktumlarvinkeln ensam") + sidraden | L-120250284711040291 | okänd | okänd |

**Regler ur Brief review 2026-09-21 (hubbens Feedback-rad), följda:** (1) varje svensk rad bär något bara det här setet kan säga (nio stänger, böjen i kröken, 3,69 m, nylonborste 100 mm, "borstas loss, inte skrapas") — inga ✅ i Competitor-signable, ingen motivering bredvid; (2) regirad per manusrad med Audio · On-screen text · Picture · Effect · Source · Latitude; (3) VARIABELTAGGAR + `Memo:` + `AI content:` i varje brief, inga citat "från sidan" som inte står på sidan. **Annonsidéer:** 0 rader med Status Ny.

**Kroppen i iterationerna rörs inte** (komponentkartan: HOLD bär H2, HOOK bär H3): PD_1_H6/H7 och PD_7_H1 återanvänder den levererade masterfilen från 0:03, inklusive captionen "sotarsätt" — stavningen är en anmärkning till nästa kroppsversion, inte en variabel i den här. Källorna skrivs `DRIVE 1lJZewCo50svHhA9Cob47VdVVf85EZd9D [EDITOR PICKS: …]` — ffmpeg finns inte i containern, ingen sekund är påhittad.

⚠️ **Modellpolicy (regel 6) kunde INTE följas:** sessionen hade inget Agent-verktyg, ingen `ANTHROPIC_NYCKEL`/`ANTHROPIC_API_KEY` i miljön och ingen `ant`-profil — copyn (hookar, manusrader, primärtext, rubrik, beskrivning) är skriven av huvudsessionen och taggad `copy_model=fable`, inte sonnet. Tre-frågorstestet står rad för rad i varje brief ändå. Avvikelsen står i CS_BATCH_KLAR-raden.

**Mät från dag 1:** `rev` och `brief → live` fylls i när raderna lästs / annonserna gått live.

## Spendtjuv 2026-09-27 — Sotarset_PD_1_H1 pausad (TROTT_VINNARE)

Grönt läge (kampanjen LAT_VARA, 8 559 kr / 3 d, ROAS 1,89): `Sotarset_PD_1_H1` (etikett LOSER 2026-09-26, livstids-ROAS 1,89 över break-even 1,51) tog 1 847 kr på 3 dygn med 3 köp och ROAS 0,75, dränering 936 kr ⇒ pausad av ronden, kampanjen orörd. Orsak TROTT_VINNARE: annonsen tjänade pengar totalt men bär inte längre — utfallet till nästa brief är "mata ersättarna": batch #3:s vidarebyggen på PD_1_H2/PD_1_H3 (PD_1_H6, PD_7_H1, PD_8_H1, PD_1_H7, PD_8_H2, PD_9_H1) ligger i hubben, 4 redan i To be Reviewed 2026-09-27.

**2026-09-28 — vidarebygg VÄNTAR:** `annonsbehov` säger `vidarebygg` på Sotarset_PD_1_H3 (2 av 3 iterationer, deadline 2026-10-10) men brieftaket är 0 — 0 etiketterade annonser utan lärdom sedan batchen 2026-09-26 och de namngivna platserna (PD_1_H6, PD_7_H1, PD_8_H1, PD_1_H7, PD_8_H2) är redan utförda (i hubben: PD_1_H6 och PD_1_H7 Draft). Inga nya briefer i dag. Kampanjen LAT_VARA 3 050 kr/dag, ROAS 3d 1,85 (13,2 % vinst). **Norge:** Feiesett NO fick i dag två BREAKTHROUGH-etiketter — Sotarset_NO_PD_1_H2 (48 % av spenden, 31 köp, ROAS 3,80) och NO_PD_1_H3 (37 %, 22 köp, 3,21) — lärdomarna i `lardomar.md` (12 NO-rader, Feiesett NO delar minne med SE sedan i dag); vidarebyggena byggs på SE och översätts via `/translate-no`.

**2026-09-29 — vidarebygg INTE byggt:** `annonsbehov` gav `vidarebygg` för Sotarset_PD_1_H3 (2 av 3 iterationer, deadline 2026-10-10) men brieftak 0 — inga nya etiketter på Sotarsetet i dag (nästa annonser fyller sju dygn senare i veckan), och lärdomen bakom PD_1_H3 namnger inga öppna platser (PD_1_H6/PD_7_H1/PD_8_H1/PD_1_H7/PD_8_H2 är redan briefade). Kampanjen LAT_VARA 3 050 kr/dag (22,6 % vinst), spendtjuv INGEN_TJUV.


## Fars dag omgång 4 — extra BOF-batch (2026-09-29 kväll, Axels order samma kväll)

Axel: "gör en till extra batch för fars dag för alla produkter och gärna dubbelt så mycket bildads och sedan normal kvantitet videos så att vi pushar extra mycket BOF fars dag annonser". Invändningen som batchen svarar på: **"kan jag verkligen rensa själv?"** (svar ur sidan: nio böjliga stänger som skruvas ihop till 3,69 m, borsten 100 mm, drivs med borrmaskinen; når bakom kaminen). Förälder Sotarset_PD_1_H2 (lärdom L-120250284711040291). Alla sju klarade spärren (regi 4/4, 0 fel), ligger som `Draft` i Chimney sweep set creative hub. Loggkod `FARSDAG_BATCH_KLAR`. Batch-loggen för hela omgången: `docs/briefs/farsdag-2026/README-bof.md`.

| Annons | Typ | Hook / rubrik | Notion |
|---|---|---|---|
| Sotarset_FD_3_H1 | video 13 s, BOF-omklipp | Rensa själv mellan sotarens besök. Fars dag-present. | https://www.notion.so/3ea270ab908c81f4bb28f0563825a483 |
| Sotarset_FD_3_H2 | video 13 s, BOF-omklipp | 459 kr, ord. 599 kr: sotarset till fars dag. | https://www.notion.so/3ea270ab908c81429f3accf1621d0cd8 |
| Sotarset_FD_3_H3 | video 13 s, BOF-omklipp | Beställ senast 19 oktober: sotarset till fars dag. | https://www.notion.so/3ea270ab908c8117ae28d1258b43a550 |
| Sotarset_FD_4_1 | bild, BOF | Rensa själv mellan sotarens besök | https://www.notion.so/3ea270ab908c816a8f98d759ca607648 |
| Sotarset_FD_4_2 | bild, BOF | 459 kr till fars dag. Ord. 599 kr. | https://www.notion.so/3ea270ab908c818cbfc0e6e593b37499 |
| Sotarset_FD_4_3 | bild, BOF | Beställ senast 19 oktober: sotarset till fars dag. | https://www.notion.so/3ea270ab908c81edbdfcc4825c099305 |
| Sotarset_FD_4_4 | bild, BOF | 9 stänger à 41 cm. 3,69 meter. | https://www.notion.so/3ea270ab908c8188ab62ec376d700c53 |

Mätning (ANALYSMETOD): ingen dom under 300 kr / 3 köp. H1 mot H2 mot H3 = vilken öppning (invändning, pris, sista dag) den produktmedvetna tittaren behöver; FD_4_1–4 mot varandra = budskapet i textrutan; hela batchen mot FD_1/FD_2 (presentvinkeln, kall publik). Etikett dag 7, lärdom, sedan dna.md.
