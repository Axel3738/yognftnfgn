# Batch-logg — CaraShell (termoskyddet)

En rad per batch: vad som launchades, vilken hypotes varje annons bar, och vad
utfallet blev. **Hypotesen skrivs när batchen launchas, utfallet när den lästs
av.** Saknas en hypotes skrivs `hypotes: ej loggad` — den hittas aldrig på i
efterhand.

Nyckel `carashell/termoskyddet` · konto **MagiBorsten DK `915422744950975`** ·
prefix `CaraShellFront` · hub: byggs av `/notionscalercs setup carashell/termoskyddet`.

---

## Batch #1 — 2026-09-16, byggd av `/ops-produkt carashell` steg 7 (= `/ny-annonser`), PAUSED

Byggd som kopia av Bäverbutikens källkampanj, inte som ett eget koncepttest.
**Inte launchad** — står PAUSED tills Axel skriver "Launch: CARASHELL_SE_Termoskydd
Husbil 211 × 171 cm" (och/eller NO).

| Marknad | Kampanj | Id | Struktur |
|---|---|---|---|
| SE | `CARASHELL_SE_Termoskydd Husbil 211 × 171 cm \| BE-ROAS 1.61 \| 2026-09-16` | `120249115376140172` | första bygget ABO 2 × 500 kr, 5 annonser → **samma kväll CBO 1 000 kr/dag, 4 adsets, 16 annonser** (omgång 2 nedan) |
| NO | `CARASHELL_NO_Termoskydd Husbil 211 × 171 cm \| BE-ROAS 1.61 \| 2026-09-16` | `120249115382210172` | samma: ABO 5 annonser → **CBO 1 000 kr/dag, 4 adsets, 16 annonser** |

| Annons | Typ | Vinkel | Vad den bär | Ärvd förälder (källans utfall) | Ändrat |
|---|---|---|---|---|---|
| `CaraShellFront_PD_1` | video | PD | "Så här skyddar du husbilen på tre sekunder" + mekanik (211 × 171, fästs på utsidan, sval/varm/mörkt, kolla måtten) | `Termoskydd_PD_1` (6 kr, 0 köp) | sista repliken "från Bäverbutiken" bortklippt vid 16,00 s |
| `CaraShellFront_PD_2` | video | PD | "Produkten alla husbilsägare borde ha" + samma mekanik | `Termoskydd_PD_2` (33 kr, 0 köp) | bortklippt vid 16,24 s |
| `CaraShellFront_PD_3` | video | PD | "Sol, kyla, insyn. Ett skydd löser allt." + samma mekanik | `Termoskydd_PD_3` (5 kr, 0 köp) | bortklippt vid 17,14 s |
| `CaraShellFront_PD_2_1` | bild | PD | "SLUT PÅ HETTA I HUSBILEN – MÖRKLÄGGER OCH KYLER PÅ SEKUNDER" | `Termoskydd_PD_2_1` (2 kr, 0 köp) | orörd |
| `CaraShellFront_G_2_1` | bild | G | "DEN PERFEKTA PRESENTEN TILL HUSBILSÄGAREN" | `Termoskydd_G_2_1` (7 kr, 0 köp) | orörd |
| `CaraShellFront_NO_PD_1/2/3` | video | PD | norska tvillingarna | `Frontrutetrekk_NO_PD_*` (4–13 NOK, 0 köp) | sista repliken "fra Beverbutikken" bortklippt vid 16,05 / 16,40 / 17,30 s |
| `CaraShellFront_NO_PD_2_1`, `_NO_G_2_1` | bild | PD, G | norska tvillingarna | 13 resp. 1 NOK, 0 köp | orörda |

Copy per vinkel: kopierad ordagrant ur källan (`factory/annonscopy/termoskyddet-se.json`,
`-no.json`), bara länken bytt.

**hypotes (batch #1):** ⚠️ Alla fem annonser per marknad är sådana källan aldrig
gav budget (max 33 kr). Hypotesen är därför inte "de här funkar" utan **"får PD en
chans i ett ABO med lika budget, säljer produktmekaniken utan brådska?"** — det är
frågan källans CBO aldrig svarade på (dna.md mönster 2).

### Räkningen (`node factory/rakning.mjs termoskyddet`, 2026-09-16)

Se `factory/output/termoskyddet/rakningen.md`. **DELVIS KLART på båda marknaderna,
med flit:** 5 av 16 källannonser per marknad är uppe; de 11 andra är namngivna i
`factory/output/termoskyddet/uteslutna.json` med exakt vad som krävs —
9 videor med falskt tal (nytt manus + HeyGen-omdubb + ny captionbana) och 2
bildannonser med falska påståenden direkt på fotot (kie.ai + `bildannonser/text.py`).
⚠️ Källans köp sitter i just de uteslutna: CS_3 (21 köp), CS_2 (8), SP_2 (5),
SP_2_1 (4). Det som är uppe är oprövat.

### Omgång 2 samma kväll — `/ny-annonser termoskyddet`: hela källkampanjen uppe (2026-09-16)

Strukturen byttes till den låsta: **CBO 1 000 kr/dag per kampanj**, fyra adsets
utan egen budget (`_PD`, `_G`, `_CS`, `_SP`), 16 annonser per marknad, allt PAUSED.
`node factory/rakning.mjs termoskyddet` → **KLART på båda marknaderna, 16/16 + 16/16,
exit 0.** Trippelkoll tillbakaläst ur Meta: konto `915422744950975`, sida
`1381171778405935`, pixel `28589207184025756`, CBO 100000, inga adsetbudgetar, geo
SE resp. NO, länk `/products/termoskyddet` resp. `/nb/products/termoskyddet?country=NO`,
PAUSED på alla 32 annonser, 8 adsets och 2 kampanjer — 0 avvikelser.

| Annons | Typ | Vinkel | Vad den bär nu (nytt manus, HeyGen-röst) | Ärvd förälder | Ändrat |
|---|---|---|---|---|---|
| `CaraShellFront_CS_1` | video | CS | "Rutan hålls varm om skyddet sitter utanpå" · 559 kr · sval/varm/mörk · fri frakt · jämförpris 932 · "Från CaraShell" | `Termoskydd_CS_3`-familjen (CS_1 78 kr/0) | hela talet omdubbat, brådskan borta; sista repliken kortad efter röstkoll ❌ |
| `CaraShellFront_CS_2` | video | CS | "Nytt lägre pris. 559 kr" · sval/varm/mörk · fri frakt, 14 dagars ångerrätt | `Termoskydd_CS_2` (550 kr, 8 köp, ROAS 8,13) | omdubbat, "bara idag/lagret minskar" borta |
| `CaraShellFront_CS_3` | video | CS | "Kläms fast i dörrkarmen utan att öppna dörrarna" · 559 · jämförpris 932 · villkor | `Termoskydd_CS_3` (4 430 kr, 21 köp — källans topp) | omdubbat, "sista chansen" borta |
| `CaraShellFront_G_1/2/3` | video | G | presenthook / julklappshook + pris + sval/varm/mörk + villkor | `Termoskydd_G_*` (≤ 91 kr, 0 köp) | omdubbade, CS-manusets brådska borta |
| `CaraShellFront_SP_1/2/3` | video | SP | riktiga Judge.me-citat (Sofia, Per, Lars — ur `kalla-recensioner.json`) + "kolla måtten, 211 × 171" | `Termoskydd_SP_2` (755 kr, 5 köp) | vi-formens påhittade vittnesmål ersatt med namngivna citat; "tusentals" borta |
| `CaraShellFront_CS_2_1`, `_SP_2_1` | bild | CS, SP | rubrik + priskort 559/932 resp. citatkort | `Termoskydd_SP_2_1` (520 kr, 4 köp, CTR 7,04 %) | kie.ai tog bort källans text, `bild-text.py` lade butikens |
| `CaraShellFront_NO_CS_1–3`, `_NO_G_1–3`, `_NO_SP_1–3` | video | | bokmål, 548 / 685 kr, "gratis frakt", 14 dagers angrerett, "fra CaraShell" | `Frontrutetrekk_NO_*` (NO_CS_1 1 880 NOK/5 köp) | omdubbade; NO CS_2 omrenderad — första manuset sa "gratis retur" (butiken: kund betalar returfrakt) |
| `CaraShellFront_NO_CS_2_1`, `_NO_SP_2_1` | bild | | norsk text, 548 / 685 | 797 NOK/3 köp (SP_2_1) | som SE |

**hypotes (omgång 2):** källans köp satt i CS (79 % av spend) med falsk brådska.
Samma vinkel går nu med sanna villkor — **tappar CS när "bara idag" är borta är det
brådskan som sålde, inte erbjudandet.** SP med riktiga namn mot SP i vi-form: samma
fråga. PD har för första gången samma startläge som CS i en CBO.

Röstkoll: 19 av 19 renderingar gröna efter en omrendering (SE CS_1). ⚠️ Grönt är "inga
mätbara fel" — ingen människa har lyssnat. CS_3 och CS_2 (SE) bär källans köp och ska
lyssnas på före Launch.

### Omgång 3 samma dag — ElevenLabs-röst i stället för HeyGen-klonen (2026-09-16 kväll)

Axel lyssnade på HeyGen-rösten och dömde ut den: *"ElevenLabs är bättre — klipp,
snabbspola eller långsamma ner videoklippen något och klipp bort tomrum i voiceovern."*
De 18 CS/G/SP-videorna (9 SE + 9 NO) dubbades om med
`pipeline/omdubb/elevenlabs-omdubb.mjs`: samma 18 manus som HeyGen-omgången
(`factory/output/termoskyddet/omdubb/heygen-cues/*-ny.srt`, texten orörd — bara två
norska siffror omstavade, se nedan), en ElevenLabs-replik per cue, luckorna inne i
repliken ihopklämda, och **videon omtajmad per klipp (70–135 %) så repliken styr
klipplängden**. Ingen musik — källans ljud kastades. PD-videorna och bilderna rördes inte.

| | SE | NO |
|---|---|---|
| Röst (eleven_v3) | `Martin - Warm, Confident and Relatable` (repots "Svensk Martin") | `Martin - Clear and Comforting` (norsk, Oslo — fanns redan på kontot) |
| CS_1 / CS_2 / CS_3 | 16,5 / 17,5 / 19,1 s (källa 15,9 / 16,0 / 15,7) | 16,2 / 19,0 / 17,9 s (källa 16,2 / 16,2 / 16,0) |
| G_1 / G_2 / G_3 | 16,7 / 18,6 / 19,5 s (källa 15,3 / 15,4 / 16,2) | 14,4 / 17,1 / 17,5 s (källa 15,6 / 15,8 / 16,5) |
| SP_1 / SP_2 / SP_3 | 21,6 / 22,8 / 23,2 s (källa 16,4 / 16,9 / 16,7) | 20,3 / 21,8 / 22,8 s (källa 16,7 / 17,2 / 17,0) |

SP-videorna blev längst: manusen bär tre–fyra citat och ElevenLabs läser dem i
~14 tecken/s, så hela filmen går i 70–76 % även med ihopklämda luckor. CS/G ligger
16–19 s.

**Kontroller:** `rostkoll.py --omtajmad` grönt på 18 av 18 (längddriften är förväntad
och blir en notering). Varje cue transkriberades dessutom med ElevenLabs Scribe och
jämfördes med manuset — det fångade fyra riktiga feluttal som genererades om: SE CS_1
"Jämförpris" (hördes "jämför please") och "CaraShell" ("Karusell"), SE SP_1
"CaraShell" ("Carakell"), och i alla tre norska SP: "hundreogsyttien" lästes som 117
och "tohundreogelleve" en gång som 220 — omstavade till `hundre og sytti-en` /
`to hundre og elleve` i de tre `-ny.srt` (samma tal, säkert uttal). Captions med
`no-captions.py` (band 956:1084 automatiskt; SE CS_3 885:1084), QA-bilder tittade
på: ingen svensk/norsk text kvar utanför bandet.

**Meta:** de 18 gamla HeyGen-annonserna raderade (alla PAUSED, 0 kr spend, läst
före varje radering), 18 nya laddade upp och byggda i **samma** kampanjer.
`rakning.mjs` KLART 16/16 + 16/16, trippelkoll 0 avvikelser (konto
`915422744950975`, sida `1381171778405935`, pixel `28589207184025756`, CBO 1 000 kr,
alla 32 annonser PAUSED). ⚠️ Fortfarande ingen människa som lyssnat på alla —
CS_3 skickades till Axel i chatten, CS_2 ska också lyssnas på före Launch.

### LAUNCH SE — 2026-09-16 10:20 UTC (12:20 svensk tid)

Axel skrev **"Launch: CARASHELL_SE_Termoskydd Husbil 211 × 171 cm"** i sessionen
efter ElevenLabs-bytet. Kontroller före: butiken svarade 200 utan `/password`
(carashell.se/ och /products/termoskyddet), pixeln `28589207184025756` hade
`last_fired_time` 2026-09-16 02:58. Sedan sattes **kampanj `120249115376140172`,
4 adsets (`CARASHELL_SE_PD/G/CS/SP`) och 16 annonser ACTIVE** — namngiven lista,
alla PAUSED med 0 kr före, tillbakaläst ACTIVE på tre nivåer efter (8 annonser
`IN_PROCESS` = Metas granskning). CBO 1 000 kr/dag.

### LAUNCH NO — 2026-09-16 ~10:50 UTC (12:50 svensk tid)

Axel skrev **"Launch: CARASHELL_NO_Termoskydd Husbil 211 × 171 cm"** en halvtimme
senare. Kontroll före: `/nb/products/termoskyddet?country=NO` svarar 200 och visar
548 / 685 NOK med NOK-paketnivåer. Sedan **kampanj `120249115382210172`, 4 adsets
(`CARASHELL_NO_PD/G/CS/SP`, geo NO) och 16 annonser ACTIVE**, tillbakaläst ACTIVE på
tre nivåer. CBO 1 000 kr/dag (kontovaluta SEK). ⚠️ Meta rate-limitade kontot
("User request limit reached", code 17) mitt i — efter uppladdningar + SE-launch
samma förmiddag; aktiveringen väntade in gränsen (90 s × 5) och gick igenom.

Båda marknaderna live. Från och med nu: nattvakten (00:57) har något att döma,
leveransrundan (14:15) laddar upp i SE-kampanjen, NO-översättningen (16:15) i
NO-kampanjen. Första avläsning tidigast efter 300 kr spend eller 3 köp per
annons (regel 3).

### Att läsa av första briefdagen

1. Får PD köp alls när den slipper konkurrera med CS i en CBO?
2. Replikerar bilden (PD_2_1) som SP_2_1 gjorde i källan?
3. Prioritet i briefronden: ett **sant CS-manus** (pris/jämförpris/villkor, ingen
   brådska) och ett **SP-manus med riktigt citat** ur Judge.me-underlaget.

## 2026-09-16 — `/ops-oversatt carashell/termoskyddet --marknad US` (första US-körningen)

- Ingen US-kampanj fanns och `annonsmarknader` var SE,NO. Körningen skrev in NO,US i
  registret och byggde en TOM kampanj: `CARASHELL_US_Termoskydd Husbil 211 × 171 cm |
  BE-ROAS 1.61 | 2026-09-16` (`120251442339640435`, Magiborsten UK, CBO 1 000 kr/dag,
  PAUSED, adsets CS/G/PD/SP, 0 annonser). ⚠️ `kampanj.mjs --tom` hade återanvänt
  takskyddets US-kampanj (matchade på `CARASHELL_US_`) — rättat till produktens bas
  före bygget.
- Kön: 0 rader i `SE-ACTIVE to be translated`, 0 i `Approved` — hubben har inga rader
  alls än; de 16 SE-annonserna byggdes ur källan och går inte via hubben.
- **Läge: hållen** (PAUSED utan spend). Ingen US-rutin finns för den här nyckeln —
  `/notionscalercs setup carashell/termoskyddet` på claude5-kontot bygger 17:15-rutinen.
