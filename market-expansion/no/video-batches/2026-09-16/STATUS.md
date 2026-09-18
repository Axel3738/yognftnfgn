# NO-videobatch 2026-09-16 — rutinen `/translate-no`

## Fas 0 — Inventering

LAUNCHED (`1-vbYhYgTEv7zYptW5rGmgKAITmAz4l1X`) listad, WINNERS/LOSERS/MAKE TO
NORWAY exkluderade. 9 produktmappar i LAUNCHED. MAKE TO NORWAY listad
rekursivt (inkl. WINNERS-undermappen) — 7 av 9 redan täckta (`NO <namn>`-mapp
finns). Två kandidater utan NO-mapp OCH utan kampanj i
act_1050941584152547 (41 kampanjer kontrollerade):

- **Infartslarm Trådlöst** — 12 annonsvideor (CS/G/PD/SP × 1/2/3) + 4
  bildannonser + 4 ADCOPY-docs. Klar.
- **Sittkäpp Hopfällbar** — klar i Drive, men **saknar Norge-frakt i
  batch-sheet #7** (leverantörens rad säger "Too large to deliver at all"
  för NORWAY Qty 1). Ingen kostnad går att räkna → ingen BE-ROAS, ingen
  launch. Problemmeddelande skickat till `#problems-no`. Kvar i kön.

**Norsk produktsida (Infartslarm):**
`tradlos-innkjorselsalarm-du-horer-nar-noen-svinger-inn` — "Trådløs
Innkjørselsalarm – Du Hører Når Noen Svinger Inn", 429 kr (jämförpris
559 kr vid avläsning).

**COGS:** batch-sheet #7 (`1H7qeSjmba5a5OXkVKC6fHQNYH0Zp7TP7irR5MI0JUGI`),
raden "Trådlöst infartslarm med rörelsesensor", NORWAY-blockets Qty 1
Total ex. tax = 15,02 EUR. ECB-dagskurs 2026-09-16: 10,784912 NOK/EUR →
161,99 kr. BE-ROAS = 429/(429−161,99) = **1,61**.

**Prispolicy:** CS-konceptets ADCOPY hävdar "50% RABATT", men 429/559 =
23,3 % — långt under claimen. Jämförpriset höjt i Shopify NO
(`tools/shopify-fix-compareat.mjs --market NO --product-id 15553084195191
--rabatt 50`) 559 → **858 kr**, claimen ändrades aldrig.

**Kvot:** 8 096 api-krediter vid start.

## Fas 1 — Proofread + lokalisering

12/12 proofread-sessioner klara. Norska manus skrivna av copy-subagent
(sonnet): produktnamn standardiserat till "trådløs innkjørselsalarm"
(HeyGen hade fyra olika varianter), "oppkjørsel" konsekvent för uppfart.
Regexgrind grön: inga SEK-belopp, inga svenska ord, timecodes identiska
med originalen. SRT verifierad persisterad på HeyGen (apply) 12/12.

Norsk adcopy (4 koncept) skriven av separat copy-subagent, verifierad mot
butiken: 429/858 kr (50 % — nu sant efter prisfixen), 38 ringsignaler,
1 sensor + 1 mottaker, 30 dagers åpent kjøp. SP-konceptets påhittade
kundcitat/stjärnbetyg (produkten har noll anmeldelser på norska sidan)
byttes mot den verifierade garantin som förtroendeelement i **ad-texten**
(Meta-copyn) — bildannonsens SP-platta behöll dock stjärnor+citat som en
direktöversatt kreativ (samma mönster som tidigare batchers SP-koncept).

## Fas 2 — Rendering + captions

12/12 renderade och nedladdade (8 096 → 7 936 efter första rendering).
**SP_2 fick avhugget slut vid röstkollen** (-1,5 dB mot -21,6 dB median —
rösten hann inte tala klart): en helt ny proofread-session skapades
(samma videokälla), ny norsk lokalisering skriven för sessionens nya
segmentering (8 block i stället för 9), omrenderad och omcaptad. Andra
försöket landade nära gränsen (-17,5 mot -21,6 dB, 4,1 dB över tröskeln på
3 dB) — audio var kvantitativt klar/tyst men filen slutade 3 ms för tidigt
mot SRT:ns sluttid. Paddad med `tpad`/`apad` 0,3 s (samma fix som tidigare
batchers "avklingat"-fall) → grön. Total kvotförbrukning för SP_2:s
ombygge: ~160 krediter (ny proofread + 2 renderingar).

`no-captions.py`: 12/12 ✓ ingen text utanför bandet, band 1547:1713
(automatiskt höjt för tvårads-cues). 36 QA-bilder granskade av
huvudsessionen — inget svenskt synligt i någon. Slutkortssvep (grid av alla
12 sista bildrutor): rent, ingen svensk domän/pris. Röstkollen: 12/12
gröna efter SP_2-fixen.

**Fas 3.2 (bildannonser):** Kie AI (`google/nano-banana-edit`) rensade
svensk text på 3/4 bilder direkt. **G_2_1 misslyckades två gånger** (samma
bild kom tillbaka oförändrad, trots två olika promptvarianter) — löst
manuellt med en Python-patch (`fix-g.py`): textfria bakgrundsremsor ur
bilden själv, blurrade och blendade över rubrik/underrubrik/knapp-zonerna.
Norsk text ritad deterministiskt med PIL (`compose-no.py`), samma stil som
originalet (gyllene rubrik, vit underrubrik, tan/blå knappar).

## Fas 3 — Launch i Magiborsten NO

Kampanj **"Infartslarm NO | BE-ROAS 1,61 | 2026-09-16"**
(`120252251748460233`), CBO 1000 kr/dag, ACTIVE — API-verifierad direkt
efter launch. 4 adsets (CS/G/PD/SP), alla ACTIVE, 12 videoannonser, alla
ACTIVE — bekräftat av launchskriptets egen kvittenslogg (varje annons
loggad `✓ annons (ACTIVE)` efter Metas svar). En sen dubbelkoll av
adsets/annonser via ett fristående API-anrop kunde INTE göras — kontot var
hårt rate-limitat (fel 17) i flera minuter efter launchen, även efter tre
omförsök med stigande väntetid. Kampanjnivån verifierades ändå separat
(GET på kampanj-ID gav `status: ACTIVE, daily_budget: 100000`).
Dubblettspärren kontrollerad före launch (41 kampanjer, ingen med
"Infartslarm" i namnet). Kontot rate-limitades hårt under hela launchen
(Meta-fel 17 på nästan varje adset, upp till 6 omförsök) — inget ovanligt
för kontot vid täta körningar, se `no-image-ads.mjs`-varningen i CLAUDE.md.

**Fas 3.2 launchades INTE denna körning** — bildannonserna är komponerade
och levererade (Drive + chatt) men `no-image-ads.mjs` kördes inte in i
adseten pga tidsbudget och den hårda rate-limiten kvar i kontot efter
videolaunchen. Görs av nästa körning eller på Axels kommando.

## Fas 3.5 — Drive-leverans

Mapp **"NO Infartslarm Trådlöst"** skapad i MAKE TO NORWAY
(`18rqW2wu-IUICein5MxDYKFBU2Ea-ymVS`) via Drive-connectorn. Alla 12 videor
+ 4 bildannonser + 4 ADCOPY-docs uppladdade via `drive-push.mjs`
(Apps Script-brevlådan) — 20 filer totalt.

## Fas 4 — Leverans, logg, brief

Levererat i chatten som 4 zip:ar (en per koncept, 23–30 MB vardera, alla
≤30 MiB). Kvot: 8 096 → 7 631 krediter (465 förbrukade).

Definition of done: se `docs/video-localization.md`-loggen för denna dag.
