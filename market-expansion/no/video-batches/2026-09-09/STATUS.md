# NO-videobatch 2026-09-09 — status

Rutin: `/translate-no` (`.claude/skills/translate-no/SKILL.md`). Källa: Drive-mappen
LAUNCHED (`1-vbYhYgTEv7zYptW5rGmgKAITmAz4l1X`).

## Inventering (Fas 0)

⚠️ **LAUNCHED är kraftigt utrensad sedan 2026-09-07** (då den hade 20 produktmappar).
Mätt 2026-09-09 innehåller den bara 2 produktmappar plus de tre icke-produktmapparna
WINNERS / LOSERS / MAKE TO NORWAY: **Adventskalender Racingbilar** och **Pälsborste
till Dyson-dammsugare**. Pälsborste är redan täckt (mappen `NO Pälsborste till
Dyson-dammsugare` finns i MAKE TO NORWAY, kampanjen `Pelsbørste NO` launchades
2026-09-04) → ingen kandidat.

**1 kandidat:** Adventskalender Racingbilar — varken NO-mapp (MAKE TO NORWAY listad
rekursivt, inkl. undermappen WINNERS: 25 + 3 NO-mappar) eller kampanj i
`act_1050941584152547` (33 kampanjer kontrollerade). **Ingen kö efter denna körning.**

Innehåll i produktmappen: 12 annonsvideor (CS_1-3, G_1-3, PD_1-3, SP_1-3),
4 bildannonser (`*_2_1.png`), 4 ADCOPY-docs, 1 REVIEW-sheet. Komplett mapp.

## Fakta (Fas 0, verifierade)

- **Norsk sida:** ✅ `adventskalender-racerbiler-24-biler-bak-24-luker`
  — 439 kr (før 579 kr = 24,18 % rabatt).
- **COGS:** batch-sheet **#6** (`1zGcVdwHVdvTD3t894FdFw--9fL8B5v5oMH5kK2XWM-I`),
  raden "car racing calendar", NORWAY-blockets Total ex. tax Qty 1 = **15,69 EUR**
  × 10,739949 NOK/EUR (dagskurs 2026-09-09) = **168,51 kr**. Ingen tull.
  *(COGS-docet listar numera ett sjätte sheet utöver #1–#5.1 — produkten fanns bara där.)*
- **BE-ROAS:** 439/(439 − 168,51) = **1,62**.
- **Claim-koll:** CS-copyns svenska "23 % RABATT" är LÄGRE än butikens verkliga
  24,18 % → ingen jämförprisjustering behövdes (claimen underdriver rabatten).
  Norsk copy och bildannons säger 24 %, vilket 579→439 täcker med marginal.
- **Kvot:** api 16 818 → 16 460 krediter (12 videor, ~358 krediter).

## Fas 1–2 — proofread, lokalisering, rendering, captions

12 videor proofreadade (0 renderingskrediter), SRT:er hämtade. HeyGens
automatöversättning bar **svenska priser rakt av** (649→499) och ett felöversatt tal
("Sekstifire ni kroner"). Sonnet-subagent skrev om alla rader enligt modellpolicyn +
`docs/copy-regler.md`, med samma blockantal och tidskoder:

| Fil | Rättning |
|---|---|
| CS_1 | 649→579, 499→439 (två block) |
| CS_2 | "Sekstifire ni kroner" → "Fem hundre og syttini kroner"; 499 → "firehundre og trettini" |
| CS_3 | "spar hundre og femti" → "hundre og førti"; 649→579, 499→439 |
| G_1–G_3 | "kommer til å bli"/"blir glemt" → naturligare bokmål ("blir", "er glemt") |
| PD_1, PD_3 | "de tjueandre andre" → "de tjuetre andre" (felöversatt räkneord) |
| PD_2, SP_1–SP_3 | inga rättningar behövdes utöver kontroll |

Regexverifierat grönt: inga SEK-belopp, inga svenska tecken (ä/ö), inga gamla priser.
Alla 12 renderade, inga moderationsköer.

**Captions (Beltesliper-stilen):** källvideorna har inbränd svensk text med FEL pris
("Idag 649 blir") — järnregel 2 gäller. `pipeline/no-captions.py` mätte bandet per
video (1445–1613 beroende på klipp), suddade med remsa under bandet (blur 12) och la
vit ruta + svart fet text mitt i. Skriptets egen kontroll: "ingen text utanför bandet"
på alla 12. QA-bilderna lästa (CS_1 alla tre, G_1, PD_1, SP_1) — inget svenskt syns.

**Slutkortssvep:** sista sekunden av alla 12 granskad i montage — bara norska
captions, ingen svensk domän, inget SEK-pris. Den engelska texten på själva
produktkartongen ("ADVENT CALENDAR / 24 SURPRISES INSIDE") är tillverkarens
förpackning och lämnas som den är.

## Fas 3.2 — bildannonserna

4 st. Kie AI (`google/nano-banana-edit`) rensade texten; **CS-bilden rensades bara
till hälften** (det röda toppbandets text satt kvar) → det bandet målades över med
sin egen färg (207,8,7) i `compose-no.py` i stället för en ny Kie-körning.
Norsk text ritad med PIL (LiberationSans-Bold). Stjärnorna i SP ritas som polygoner —
emoji-glyfer saknas i fonten och blev tomma rutor först.

## Fas 3.5 — Drive

Mappen **`NO Adventskalender Racingbilar`** (`15cCTTxEDXNqDDfFu2LGB7XaYT8M-B8vC`)
skapad av rutinen i MAKE TO NORWAY med Drive-connectorn. 12 videor + 4 bildannonser
uppladdade med `drive-push.mjs`. Källmappen i LAUNCHED orörd.

## Fas 3 — launch

Kampanj **`Adventskalender NO | BE-ROAS 1,62 | 2026-09-09`** i act_1050941584152547.
CBO 1000 kr/dag, ett adset per koncept (CS/G/PD/SP), allt ACTIVE, enhancements OPT_OUT.
Norsk adcopy skriven av sonnet-subagent, tre-frågorstestet redovisat (alla fyra
headlines ✅/✅/✅). Konfig: `pipeline/waves/no-adventskalender-video.config.mjs`.
