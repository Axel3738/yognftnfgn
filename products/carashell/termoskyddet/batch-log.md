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

## 2026-09-16 — `/ops-leverans carashell/termoskyddet` (första leveransrundan)

- Kön: 0 rader i hubben "Termoskyddet" (`3dd270ab-…`) — varken `To be Reviewed`
  eller `Creative strat review`; hubben är helt tom (0 rader totalt). Inget laddades upp.
- SE-kampanjen `CARASHELL_SE_Termoskydd Husbil 211 × 171 cm | BE-ROAS 1.61 |
  2026-09-16` (`120249115376140172`) står nu **ACTIVE** med 4 ACTIVE adsets
  (SP/CS/PD/G) — var PAUSED vid bygget i förmiddags. Ärvd länk
  `https://carashell.se/products/termoskyddet` ur `CaraShellFront_G_3`.
  Rundan kan alltså leverera så fort något hamnar i `To be Reviewed`.
- Pris ur butiken: 559 SEK (jämförpris 932).
- Nästa: nattvakten 00:57 producerar första briefronden (7 st, ingen redigerare).
  Rader når leveransrundan först när en redigerare levererar eller `/ops-bild` körs.

## 2026-09-16 — `/ops-oversatt carashell/termoskyddet` (första NO-körningen)

- Kön: 0 rader i `SE-ACTIVE to be translated` — hubben "Termoskyddet" är fortfarande
  tom. Inget översatt, inget renderat (0 HeyGen-credits), inget uppladdat, ingen
  Notion-rad rörd.
- NO-kampanjen `CARASHELL_NO_Termoskydd Husbil 211 × 171 cm | BE-ROAS 1.61 |
  2026-09-16` (`120249115382210172`, MagiBorsten DK) är **ACTIVE** med 4 ACTIVE adsets
  (SP/CS/PD/G). Ärvd länk `https://carashell.se/nb/products/termoskyddet?country=NO`
  ur `CaraShellFront_NO_G_3`. Rutinen kan alltså leverera så fort en rad når kön.
- Butiken redo för NO: 548 NOK läst på den norska sidan (= `ekonomi.marknadspriser`).
  ⚠️ `/nb/products/termoskyddet.json` utan `?country=NO` svarar 559/932 — det är
  Shopifys basvaluta, inte ett norskt pris; läs alltid med `?country=NO`.
- Meta rate-limitade fyra gånger i rad (30 → 240 s) under läsningen av kontot —
  körningen tog ~10 min i stället för sekunder. Inte ett fel, bara långsamt.
- Discord: rapport i `#annons-uppladdning` på "CaraShell — OPS" (meddelande
  `1549788313140076604`), ingen ping.
- Batch: `market-expansion/ops/carashell/2026-09-16-no-termoskyddet/` (jobb.json).

## 2026-09-16 17:15 — `/ops-oversatt carashell/termoskyddet --marknad US` (första schemalagda US-körningen)

- Rutinen `trig_01C9Dfcm5k9wuxPDaQaRNF1r` (plats 7 = 17:15, fast session
  `session_01Ngpv9kMqf3BM8onpTbMdCt`) fyrade 15:15 UTC — sedd i `list_triggers`
  samma körning, `last_run` SUCCEEDED.
- Kön: 0 rader i `SE-ACTIVE to be translated`, 0 rader i `Approved` (eftersläpningskollen
  för marknad tillagd i efterhand). Hubben "Termoskyddet" är fortfarande helt tom
  (0 rader i alla statusar, mätt via `databases/<id>/query`). Inget översatt, inget
  renderat (0 HeyGen-credits), inget uppladdat, ingen Notion-rad rörd.
- US-kampanjen `CARASHELL_US_Termoskydd Husbil 211 × 171 cm | BE-ROAS 1.61 | 2026-09-16`
  (`120251442339640435`, Magiborsten UK) är **PAUSED utan spend** (nybyggd) med 4 ACTIVE
  adsets (SP/PD/G/CS). Kön hittar den nu på namnets bas (`PAUSAD_TOM`) och skulle ha
  laddat upp i den — kampanjens status rörs aldrig av rutinen.
- ⚠️ **Kampanjen bär redan 16 annonser** (`CaraShellFront_US_*`: 12 videor + 4 bilder,
  alla ACTIVE, effective_status CAMPAIGN_PAUSED, länk `https://carashell.com/products/termoskyddet`,
  copy med $99) skapade 11:00–12:29 UTC i dag — efter förmiddagens körning som såg
  0 annonser. Ingen commit i repot (`git log --all`) beskriver uppladdningen; de speglar
  SE-kampanjens 16 annonser precis som takskyddets US-spegling (`d87ec56`). Inget spenderar
  förrän Axel slår på kampanjen.
- Butiken redo för US: 99 USD läst på `carashell.com/products/termoskyddet?country=US`.
- Ärvd länk ur `CaraShellFront_US_G_3`: `https://carashell.com/products/termoskyddet`.
- Discord: rapport i `#annons-uppladdning` på "CaraShell — OPS" (meddelande
  `1549802219279486996`), ping till Axel under ACTION NEEDED (slå på kampanjen om US-testet
  ska starta).
- Batch: `market-expansion/ops/carashell/2026-09-16-us-termoskyddet/` (jobb.json,
  jobb-approved.json, discord-jobb.json + köloggarna).

---

## LP lagerrensning 2026-09-16 kväll — samma sida i två butiker

**CaraShell:** https://carashell.se/pages/termoskydd-husbil-211-171-cm-lagerrensning —
byggd av en annan session samma dag (`/lagerrensning https://carashell.se/products/termoskyddet`,
commit `64ebdc22` på grenen `claude/dreamy-carson-rejnmn`, inte på `main` när
det här skrevs). Obrandad, "Anders på lagret", pris **559 / 932 kr**, 14 dagars
ångerrätt ("Om det inte känns rätt"), punkt 1–4 kie-bilder på Bäverbutikens CDN,
punkt 5 produktbild 2 (husbilen i tallskogen), lyckas produktbild 1 (skyddet
med måtten). Filerna: `listicle/output/lagerrensning/termoskyddet/` på den grenen.

**Bäverbutiken:** https://baverbutiken.se/pages/termoskydd-husbil-211-171-cm-lagerrensning —
Axels fråga ("gör samma sak för denna"), byggd i den här sessionen: samma copy
och samma bilder (cachen träffade på prompten — noll nya kie-credits; Bäverbutikens
produktsida har samma tre bilder i samma ordning), knapparna till
`/products/termoskydd-husbil-211-171-cm-utvandigt-och-morklaggande`, pris 559 / 932 kr
avläst ur Bäverbutikens `/products/<handle>.json`. Varje faktapåstående i copyn
står ordagrant på Bäverbutikens sida (imma på insidan, trettio grader, klockan
fyra, rastplatsen, 211/171/90 cm, flikarna i dörrkarmen, två minuter på utsidan).
Två ställen omskrivna: fraktmeningen i lyckas-blocket (fri frakt inom Sverige,
5–10 arbetsdagar, **30 dagars öppet köp**) och riskfritt-blocket (mallens
"Därför kan du testa helt riskfritt." — Bäverbutiken lovar pengarna tillbaka
inom 30 dagar, CaraShell gör det inte). Temafilerna fanns redan på "UTKAST utan
popup 2026-08-28". Läst tillbaka som kund utan header/footer/meny. Filerna:
`listicle/output/lagerrensning/termoskydd-husbil-211-171-cm-utvandigt-och-morklaggande/`.

Regeln, som för takskyddet: en produkt i två butiker får två sidor med varsin
produktlänk. OPS-kontots annonser pekar på CaraShell-sidan, MagiBorstens på
Bäverbutikens — aldrig korsvis, då bokförs köpen på fel pixel.

**USA-versionen på carashell.com, 2026-09-16 sent på kvällen:**
**https://carashell.com/pages/termoskydd-husbil-211-171-cm-lagerrensning?country=US**
— samma sida med en engelsk översättning (`--marknad US`), inte en ny sida.
Copyn `copy.en.json` mot den engelska produktsidan: **$99 / $124** (USD ur
carashell.com), "windshield thermal cover", 86 °F i stället för trettio grader
(sidans egen siffra), four a.m., rest area, flaps clip into the door frame,
90-day guarantee, free shipping to the US. Samma bilder, noll credits.
Knapparna → `https://carashell.com/products/termoskyddet?country=US`. Läst
tillbaka på carashell.com på engelska; carashell.se `?country=SE` svenska.
Den svenska CaraShell-sidans filer ligger nu också på `main`-grenen härifrån
(hämtade från `claude/dreamy-carson-rejnmn`, samma innehåll).

---

## Batch #2 — 2026-09-17, nattvakten `/notionscalercs carashell/termoskyddet` körning nr 1 (första briefronden) — KALLSTART

**Läget vid avläsningen (Meta, last_14d, SE):** kampanjen `CARASHELL_SE_Termoskydd
Husbil 211 × 171 cm` ACTIVE, CBO 1 000 kr/dag, 636 kr / 2 köp / ROAS 1,76 på 3 dygn
(launch 2026-09-16 12:20). 16 annonser, **0 bedömbara** (grinden 300 kr OCH 3 köp),
högst spend `G_2_1` 232 kr / 0 köp, `CS_2_1` 96 kr / 2 köp. Ingen feedback-loop
— ingen annons i batch #1 har ett utfall att skriva. **Budgetronden: 0 ändringar**
(kampanjen "för tidigt", ingen annons kill-kandidat, inget pausat, inget aktiverat).
⚠️ Pixeln delas med takskyddet och CaraShell har inga Shopify-nycklar i rutinens
miljö (`SHOPIFY_*_CARASHELL` saknas) — köp per produkt gick INTE att läsa ur
Shopify. Det spelade ingen roll i natt (ingen dom fälldes), men det måste finnas
före första domen.

**Ronden:** 7 briefer (ingen redigerare ⇒ 7, inte 21). Alla ur backloggen — 2 videor
+ 5 bilder. Bilderna genererade samma natt (kie.ai, 5 st, textlager `bild-text.py`),
tittade och godkända ⇒ `To be Reviewed` → live 14:15 via `/ops-leverans`.
Videorna ligger i `Draft` tills en redigerare finns. Copy: A/B fable/sonnet
(registrets `copy_modell: ab`, standard), varannan brief, via Agent-verktyget
(Agent fanns — inte API-vägen), tre-frågorstestet i varje brief.

| Annons | Typ | Vinkel | Hypotes | Isolerad variabel / förälder | Källa | copy_model |
|---|---|---|---|---|---|---|
| `CaraShellFront_CS_4_H1` | video | CS | Vinnarraden FÖRST, priset sedan, slår CS_2:s prisöppning på CPA | ordningen · förälder `CaraShellFront_CS_2` (ärvd CS_2 550 kr/8 köp) | winning line (dna mönster 1+4), backlog #1 | fable |
| `CaraShellFront_CS_4_1` | bild | CS | Raden läses, inte tittas — bär som static med priskort | formatet mot CS_4_H1; rubriken mot `CS_2_1` | ärvd SP_2_1 (bild, bäst CPC), backlog #1 | sonnet |
| `CaraShellFront_PD_4_H1` | video | PD | Imman på insidan + varför gardinen inte hjälper ⇒ första PD som passerar grinden under BE | scenen · ingen förälder (PD_1–3 är mekanik) | butikens huvudvinkel, konflikt typ A, backlog #4 — **hypotes** | fable |
| `CaraShellFront_PD_4_1` | bild | PD | Rubriken bär konflikten själv, CTR ≥ 4 %, inget pris | formatet mot PD_4_H1 | backlog #4 + takskyddets mönster 6 | sonnet |
| `CaraShellFront_PD_5_1` | bild | PD | Insynsscenen (rastplatsen) är mer omedelbar än imman | scenen mot PD_4_1 | "mörkt när du sover" (ärvd) + källsidans tredje scen — **gissning** | fable |
| `CaraShellFront_G_4_1` | bild | G | Konkret morgon i present-raden slår "perfekta presenten" | rubriken · förälder `G_2_1` (7 kr, 0 köp) | backlog #6 — **gissning** | sonnet |
| `CaraShellFront_CS_5_1` | bild | CS | Två-produktsparet lyfter CTR utan att sänka CVR | rubriken mot CS_4_1 | backlog #7 (sortimentet) — **gissning** | fable |

Namn lästa ur kontot (analys-JSON) + hubben (0 rader före): CS/PD/G/SP 1–3 upptagna ⇒ 4 och 5.
Notion: 7 rader skapade i "Termoskyddet" (`3dd270ab-908c-8018-a927-c2e551f7de8a`), url per rad i
`factory/output/carashell/termoskyddet/bild-2026-09-17.json` + Discord-jobbet.

**Bildgranskningen (sessionen, lätta checklistan):** 5 av 5 godkända. `CS_4_1` fick
textlagret omgjort på samma foto (0 nya credits): rabattchipen "40 % under jämförpris"
höggs av vid kanten — nu "−40 %", samma fakta. `PD_4_1`:s copy rättad från "immat"
till "imman" (grammatik, inte omskrivning). Två små huvudsessionsval, båda inskrivna
i respektive brief.

**Två saker rutinen lärde sig, rättade i samma commit:**
1. `factory/output/carashell/` delades av takskyddet och termoskyddet — samma
   `budgetrond-<datum>.json`, `insights-<datum>.json`, `analys-<datum>.json`, och
   `ops-bild --namn` läste takskyddets analysfil som termoskyddets kontonamn.
   Ny `utmapp(post)` i `register.mjs`: andra produkten skriver i
   `factory/output/carashell/termoskyddet/`, huvudprodukten som förut.
2. Ingen Shopify-nyckel för CaraShell i rutinens miljö ⇒ pixelns delning kan inte
   läsas isär. Står under Axels uppgifter.

**Att läsa av 2026-09-20 (nästa briefdag):** (1) passerar någon annons grinden — då
första riktiga feedback-loopen; (2) bild mot video inom CS (CS_4_1 mot CS_4_H1 finns
bara om videon gjorts — utan redigerare är bildhälften det enda som får data);
(3) A/B-ställningen fable/sonnet: 4 fable / 3 sonnet i den här ronden, 0 bedömbara.

## 2026-09-17 — `/ops-leverans carashell/termoskyddet` — batch #2 live (5 bildannonser)

- Kön: 5 bildrader i `To be Reviewed` (nattvaktens briefrond 16→17/9, bilder genererade
  23:16 UTC). Alla fem gick live i `CARASHELL_SE_Termoskydd Husbil 211 × 171 cm`
  (`120249115376140172`, CBO 1 000 kr/dag), befintliga adsets, inget nytt skapat:
  - `CaraShellFront_CS_5_1` — tvåproduktsraden (tak + termo), adset CS, ad `120249137080570172`
  - `CaraShellFront_CS_4_1` — "Svalt på sommaren, varmt på vintern", 559/932/−40 %, adset CS, ad `120249137196990172`
  - `CaraShellFront_G_4_1` — presenten "en morgon utan imma", 559/932, adset G, ad `120249137085810172`
  - `CaraShellFront_PD_5_1` — rastplatsen, utan pris, adset PD, ad `120249137109590172`
  - `CaraShellFront_PD_4_1` — imma trots gardinen, utan pris, adset PD, ad `120249137190450172`
- Pris: 559 kr på varje annons med pris = butikens 559 (läst live), jämförpris 932, −40 % exakt.
- Tillbakaläst: 3/5 ACTIVE/ACTIVE, 2 ACTIVE/IN_PROCESS (Metas granskning minuter efter uppladdning).
- Anmärkning (ingen stopp): PD_5_1 och CS_4_1 har ett vitt band mellan foto och bottenrad —
  fotot fyllde inte canvasen. Kosmetiskt, till nästa version av textlagret (`factory/bild-text.py`).
- Notion: alla fem → `SE-ACTIVE to be translated`. NO-rutinen 16:15 och US-rutinen 17:15 tar dem.
- Discord `#annons-uppladdning` (CaraShell — OPS): meddelande `1550123118687944789`.
- Meta rate limit slog till på rad 3 (30 s + 60 s väntan) — uppladdaren backade själv, inget förlorat.
- Läsregel för utvärderingen: delad pixel med takskyddet, och CS_5_1 visar takskyddet i bild —
  köp per produkt i Shopify före dom. Ingen dom före 300 kr / 3 köp per annons.

## 2026-09-17 — `/ops-oversatt carashell/termoskyddet` (NO) — batch #2 live i Norge (5 bildannonser)

- Kön: 5 bildrader i `SE-ACTIVE to be translated` (leveransrundans batch #2 samma dag). Alla
  fem översatta till bokmål och **live** i `CARASHELL_NO_Termoskydd Husbil 211 × 171 cm`
  (`120249115382210172`, MagiBorsten DK), befintliga adsets, inget nytt skapat:
  - `CaraShellFront_NO_CS_4_1` — adset CS, ad `120249139476950172`, priskort 548 / 685 kr / −20 %
  - `CaraShellFront_NO_CS_5_1` — adset CS, ad `120249138960400172`, chip "Termotrekket 548 kr"
  - `CaraShellFront_NO_G_4_1` — adset G, ad `120249138996830172`, 548 / 685 kr
  - `CaraShellFront_NO_PD_4_1` — adset PD, ad `120249139126570172`, utan pris
  - `CaraShellFront_NO_PD_5_1` — adset PD, ad `120249139118320172`, utan pris
- Länk ärvd ur `CaraShellFront_NO_G_3`: `https://carashell.se/nb/products/termoskyddet?country=NO`.
  Tillbakaläst ACTIVE/IN_PROCESS på alla fem (Metas granskning).
- **Bildvägen:** basfotona fanns kvar bakom kie.ai-länkarna i
  `factory/output/carashell/termoskyddet/bild-2026-09-17.json` (svarade 14:18 UTC) ⇒ det
  norska textlagret ritades rent med `factory/bild-text.py` på originalfotot — samma band,
  priskort och typsnitt som SE, ingen suddning. Skriptet: `<batch>/oversatt-no.py`.
  Lärdom: planfilen i `factory/output/` är basfotots enda spår — committa den alltid
  (nattvakten gjorde det i dag; takskyddets US-runda 16/9 fick suddvägen för att den saknades).
- Pris ur `ekonomi.marknadspriser`: 548 NOK, jämförpris 685 ⇒ −20 % (inte SE:s −40 %).
  Läst live på `/nb/products/termoskyddet?country=NO` = 548.
- Copy: Sonnet-subagent (`textlager-no.json`, `adcopy-NO.json`, tre-frågorstestet i
  `oversatt-output.json`). Huvudsessionen rättade tre saker: PD_4_1:s bildrubrik hade
  kortats mot Ads Managers 40-teckensgräns (återställd till hela raden), "normalpris" →
  "sammenligningspris", CS_5_1:s rubrik "for vinter" → "for vinteren". Johans svenska
  recension struken ur PD_5_1:s norska copy (går inte att verifiera i Norge).
- Notion: kommentar + `Translated url` på alla fem; **status orörd** (`flytta_till_approved`
  falskt — US-rutinen 17:15 ska hitta dem). Kända luckan: de norska filerna ligger inte i
  Notion-raden.
- Discord `#annons-uppladdning` (CaraShell — OPS), ingen ping. Meta rate-limitade under
  uppladdningen — fem annonser tog ~12 min.
- Anmärkning: CS_4_1, PD_4_1, PD_5_1 bär samma vita band som SE-originalen (basfotot fyller
  inte canvasen). Kosmetiskt, till nästa version av textlagret.
- Läsregel: samma som SE — delad pixel med takskyddet, ingen dom före 300 kr / 3 köp.

## 2026-09-17 — `/ops-oversatt carashell/termoskyddet --marknad US` — batch #2 live i USA (5 bildannonser)

- Kön: 5 bildrader i `SE-ACTIVE to be translated` (NO klar på alla, `flytta_till_approved`
  sant). `Approved`-kön kollad för eftersläpande rader: 0. Alla fem översatta till amerikansk
  engelska och **live** i `CARASHELL_US_Termoskydd Husbil 211 × 171 cm` (`120251442339640435`,
  Magiborsten UK — kampanjen **ACTIVE** sedan Axel slog på den; 16 speglade annonser låg där
  redan), befintliga adsets, inget nytt skapat:
  - `CaraShellFront_US_CS_4_1` — adset CS, ad `120251466053980435`, priskort $99 / $124 / −20%
  - `CaraShellFront_US_CS_5_1` — adset CS, ad `120251465899090435`, chip "Thermal cover $99"
  - `CaraShellFront_US_G_4_1` — adset G, ad `120251465907780435`, $99 / $124
  - `CaraShellFront_US_PD_4_1` — adset PD, ad `120251466048000435`, utan pris
  - `CaraShellFront_US_PD_5_1` — adset PD, ad `120251465920930435`, utan pris
- Länk ärvd ur `CaraShellFront_US_G_3`: `https://carashell.com/products/termoskyddet` (US-domänen).
  Tillbakaläst: 3/5 ACTIVE/ACTIVE, 2 ACTIVE/IN_PROCESS (Metas granskning).
- **Bildvägen:** samma som NO samma dag — basfotona (kie.ai-länkarna i
  `bas/urls.txt`, svarade 15:18 UTC) + det engelska textlagret ritat rent med
  `factory/bild-text.py`. Skriptet `<batch>/oversatt-us.py` är NO-skriptets med US-namn och en
  hårdare spärr (SE/NO-priser, nordiska bokstäver, `kr`, brittisk stavning). Utmapp `us/`.
- Pris ur `ekonomi.marknadspriser`: 99 USD, jämförpris 124 ⇒ −20 % (inte SE:s −40 %). Läst live
  på `carashell.com/products/termoskyddet?country=US` = $99 / $124. Måttet tum först på bilden
  (83 × 67 in), cm i parentes i primärtexten. Villkorsraden ur US-sidan: "Free shipping ·
  5–10 business days · 90-day guarantee" (90-dagarsgarantin är Axels US-undantag, inte
  14 dagars ångerrätt). Taköverdragets US-pris $199 i CS_5_1:s primärtext.
- Copy: Sonnet-subagent (`textlager-us.json`, `adcopy-US.json`, tre-frågorstestet i
  `adcopy-US.json`). Huvudsessionen rättade: "at four" → "at 4 a.m." (G_4_1, PD_5_1),
  PD_5_1:s Ads Manager-rubrik "… front outside" → "… front from outside" (39 tecken), dubbla
  punkter efter "a.m.", och en felaktig not (SE:s −40 % var rätt för 559/932). Johans svenska
  recension struken ur PD_5_1 (går inte att verifiera i USA). Kvarvarande ❌ i tre-frågorstestet:
  CS_4_1:s och G_4_1:s rubriker samt PD_5_1:s öppning och rubrik faller på "ingen annan kan säga
  det" — ärvt från SE-raderna, som spenderar; inte ändrat.
- Notion: kommentar + `Translated url` på alla fem, **status → Approved** (NO + US bär annonsen).
  Kända luckan: US-filerna ligger inte i Notion-raden.
- Discord `#annons-uppladdning` (CaraShell — OPS): meddelande `1550168790082392225`, ingen ping.
  Meta rate-limitade under uppladdningen — fem annonser tog ~11 min (11:26→11:36 UTC + väntan).
- Anmärkning: CS_4_1 och PD_5_1 bär samma vita band som SE-originalen. Kosmetiskt, till nästa
  version av textlagret. Pillow saknades i containern (`pip install pillow`) — det installeras
  inte av repot.
- Läsregel: delad pixel med takskyddet, kampanjen delar konto med takskyddets US-kampanj —
  ingen dom före 300 kr / 3 köp per annons.

## 2026-09-18 — nattvakten körning nr 2 (ingen briefdag): −30 % och en paus

SE last_14d: **1 694 kr / 4 köp / ROAS 1,32** på två dygn mot break-even 1,61 —
vinst −13,6 %. Regeln "vinst < 16 % → −30 %": **CBO 1 000 → 700 kr/dag**, tillbakaläst.
**`G_2_1` (ärvd presentbild) PAUSAD**: 721 kr, 2 köp, CPA 361 kr över BE 347 kr —
ny annons-regeln (≥ 3 × target-CPA utan vinst). Två loggrader i `budgetlogg.jsonl`.
Batch #2:s fem bilder live sedan 14:15: `CS_4_1` 250 kr / 0 köp, övriga < 20 kr —
för tidigt. `CS_2_1` bär 2 av 4 köp (156 kr). ⚠️ Pixeln delad, ingen Shopify-nyckel:
köpen gick inte att dela per produkt — ändringarna följer regelboken på pixelns tal.
Nästa briefdag 2026-09-20.

---

## USA-runda 2026-09-16 (`/ny-annonser carashell/termoskyddet` + Axels tillägg "fixa alla till engelska och lägg in dom i den amerikanska kampanjen, i Magiborsten UK") — hela SE-kampanjen på amerikansk engelska

**Källan var Meta, inte Notion.** Hubben "Termoskyddet" har 0 rader (SE-annonserna
byggdes av `/ny-annonser` direkt ur Bäverbutikens kampanj), så `/ops-oversatt … --marknad
US` hade inget att läsa. Kön blev SE-kampanjen `120249115376140172` i OPS-kontot: 16
annonser (12 videor + 4 bilder), alla ACTIVE. Målet: `CARASHELL_US_Termoskydd Husbil
211 × 171 cm | BE-ROAS 1.61 | 2026-09-16` (`120251442339640435`) i **Magiborsten UK
`1107817401910319`**, byggd tom och PAUSED av den andra sessionen kl 12:03, CBO 1 000
kr/dag, adseten `CARASHELL_US_CS/G/PD/SP` (geo US, pixel `28589207184025756`).
Batchen: `market-expansion/ops/carashell/2026-09-16-us-termoskyddet/` (JSON + skripten
committade, media dör med containern). `register.mjs annonsmarknader carashell/termoskyddet
NO,US` inskrivet.

**Butiken som amerikansk kund:** `carashell.com/products/termoskyddet` (USA-marknadens
egen domän — `carashell.se/en/…?country=US` svarar 301 dit) ger 200, titel "Windshield
Thermal Cover for Motorhome 211 × 171 cm (83 × 67 in)", **$99.00 / jämförpris $124.00**.
Annonserna länkar dit direkt.

**Texterna** (Sonnet-subagent ur `docs/copy-regler.md`, produktfilen, butiksfilen och de
12 svenska manusen; en revisionsrunda): 12 engelska manus med SE-videons cue-tider och
samma cue-antal, copy per vinkel, bildtexter per bild. Tre-frågorstestet ✅ på alla
rubriker utom G (falsifierbarheten svag — samma som svenskan). Struket: "5,0 av 5 –
10 omdömen" (US-antalet overifierat — sidan visar "20 reviews" men Judge.me-importen
är VA:ns klick), alla emoji, "right of withdrawal" (EU-juridik → "14-day return window").
Pris bara där svenskan hade pris (CS): "$99, compare at $124". Recensionerna citeras
med förnamn (Sofia, Per, Lars, Karin) — riktiga rader ur källans Judge.me.

**Videorna:** `dubba.mjs` → `pipeline/omdubb/elevenlabs-omdubb.mjs` med ElevenLabs
**"Chris - Charming, Down-to-Earth"** (amerikansk, eleven_v3), källa = OPS-kontots
SE-videor (Bäverbutikens original ger `(#10) permission` på `source`), repliken styr
klipplängden, engelska captions i bandet 940:1084 (CS_3 880:1084), `rostkoll.py
--omtajmad` ✅ 12/12, uttalet mätt med Scribe per cue: "CaraShell" skrivs **"Cara Shell"**
och "Per" **"Pair"** i VO-manuset (captions behåller skriftformen), och `rost-brand.mjs`
genererade om varje brand-/Per-cue tills Scribe hörde rätt (SP_3 tog fyra försök).
Engelskan är 15–20 % kortare än svenskan ⇒ videorna 13–19 s, klippen upp till 135 %
(G_3 två segment 137/142 %). PD-videornas "text ovanför bandet" ögonlästes som det
silvriga täcket, inte text (`qa/pd-remsor.png`).

**Bilderna:** kie.ai `nano-banana-edit` tog bort källtexten ur tre foton (CS/SP delar
foto), `rendera.mjs` lade textlagret (`factory/bild-text.py`): CS_2_1 "$99 instead of
$124" + priskort $99/~~$124~~/−20 % + "Free shipping · 14-day returns"; SP_2_1 Sofias
citat + ★★★★★; PD_2_1 "No more hot cab, dark in seconds"; G_2_1 "The RV gift they'll
actually use". QA-bilder tittade på: ingen svenska, rätt siffror.

**Kostnad:** 0 HeyGen-krediter · 3 kie.ai-redigeringar · ElevenLabs ≈ 6 000 tecken
(inkl. omgenererade cues; kontot 46 924 → 53 245 av 100 022) · Scribe ~40 anrop.

**Meta:** `ladda-upp.mjs` → `tools/ops-till-meta.mjs … --marknad US --kampanj
120251442339640435 --lank https://carashell.com/products/termoskyddet`, en annons i
taget (Metas anropstak i UK-kontot: 8 min för första, sedan 30 s, sedan 7–8 min igen).
Kampanjen rörs aldrig — den står PAUSED tills Axel slår på den; annonserna ACTIVE inuti.

**hypotes (USA-rundan):** samma 16 creatives som SE, samma vinklar, ny marknad och nytt
pris ($99 ≈ 1,72× SE-priset i kurs). Frågan är inte "vilken vinkel" utan **"köper en
amerikansk husbilsägare ett 83 × 67-tums skydd från en svensk butik för $99 med
5–10 dagars frakt?"** — CS bär priset, PD bär mekaniken, SP bär namngivna citat. Första
avläsning tidigast vid 300 kr spend eller 3 köp per annons (regel 3), och köpen läses ur
Shopify per produkt (pixeln är delad med takskyddet).

### Räkningen (US) — `node market-expansion/ops/carashell/2026-09-16-us-termoskyddet/tabell.mjs`

# Räkningen — CaraShell termoskyddet, marknad US (2026-09-16)

Kampanj **CARASHELL_US_Termoskydd Husbil 211 × 171 cm | BE-ROAS 1.61 | 2026-09-16** (120251442339640435) i konto 1107817401910319 · PAUSED/PAUSED · CBO 1000 kr/dag · LOWEST_COST_WITHOUT_CAP

Adsets: CARASHELL_US_SP (PAUSED, geo US, pixel 28589207184025756) · CARASHELL_US_PD (PAUSED, geo US, pixel 28589207184025756) · CARASHELL_US_G (PAUSED, geo US, pixel 28589207184025756) · CARASHELL_US_CS (PAUSED, geo US, pixel 28589207184025756)

**16 av 16 källannonser uppe och ACTIVE** — KLART

| SE-annons | US-annons | Typ | Adset | Ad-ID | Status | Länk | Längd | Kontroller | Meta-issues |
|---|---|---|---|---|---|---|---|---|---|
| CaraShellFront_CS_1 | CaraShellFront_US_CS_1 | video | CARASHELL_US_CS | 120251443436740435 | ACTIVE/ADSET_PAUSED | carashell.com/products/termoskyddet | 13.11 s | röstkoll ✅ · captions ✅ · uttal ✅ | — |
| CaraShellFront_CS_2 | CaraShellFront_US_CS_2 | video | CARASHELL_US_CS | 120251443531840435 | ACTIVE/ADSET_PAUSED | carashell.com/products/termoskyddet | 14.98 s | röstkoll ✅ · captions ✅ · uttal ✅ | — |
| CaraShellFront_CS_2_1 | CaraShellFront_US_CS_2_1 | bild | CARASHELL_US_CS | 120251443248390435 | ACTIVE/ADSET_PAUSED | carashell.com/products/termoskyddet |  | textlager + QA-bild ✅ | — |
| CaraShellFront_CS_3 | CaraShellFront_US_CS_3 | video | CARASHELL_US_CS | 120251443625190435 | ACTIVE/ADSET_PAUSED | carashell.com/products/termoskyddet | 15.71 s | röstkoll ✅ · captions ✅ · uttal ✅ | — |
| CaraShellFront_G_1 | CaraShellFront_US_G_1 | video | CARASHELL_US_G | 120251444259630435 | ACTIVE/ADSET_PAUSED | carashell.com/products/termoskyddet | 13.4 s | röstkoll ✅ · captions ✅ · uttal ✅ | — |
| CaraShellFront_G_2 | CaraShellFront_US_G_2 | video | CARASHELL_US_G | 120251444265920435 | ACTIVE/ADSET_PAUSED | carashell.com/products/termoskyddet | 14.67 s | röstkoll ✅ · captions ✅ · uttal ✅ | — |
| CaraShellFront_G_2_1 | CaraShellFront_US_G_2_1 | bild | CARASHELL_US_G | 120251443349740435 | ACTIVE/ADSET_PAUSED | carashell.com/products/termoskyddet |  | textlager + QA-bild ✅ | — |
| CaraShellFront_G_3 | CaraShellFront_US_G_3 | video | CARASHELL_US_G | 120251444271420435 | ACTIVE/ADSET_PAUSED | carashell.com/products/termoskyddet | 16.51 s | röstkoll ✅ · captions ✅ · uttal ✅ | — |
| CaraShellFront_PD_1 | CaraShellFront_US_PD_1 | video | CARASHELL_US_PD | 120251444243830435 | ACTIVE/ADSET_PAUSED | carashell.com/products/termoskyddet | 15.7 s | röstkoll ✅ · captions ✅ (ögonläst) · uttal ✅ | — |
| CaraShellFront_PD_2 | CaraShellFront_US_PD_2 | video | CARASHELL_US_PD | 120251444250750435 | ACTIVE/ADSET_PAUSED | carashell.com/products/termoskyddet | 15.52 s | röstkoll ✅ · captions ✅ (ögonläst) · uttal ✅ | — |
| CaraShellFront_PD_2_1 | CaraShellFront_US_PD_2_1 | bild | CARASHELL_US_PD | 120251443264490435 | ACTIVE/ADSET_PAUSED | carashell.com/products/termoskyddet |  | textlager + QA-bild ✅ | — |
| CaraShellFront_PD_3 | CaraShellFront_US_PD_3 | video | CARASHELL_US_PD | 120251444255070435 | ACTIVE/ADSET_PAUSED | carashell.com/products/termoskyddet | 17.57 s | röstkoll ✅ · captions ✅ (ögonläst) · uttal ✅ | — |
| CaraShellFront_SP_1 | CaraShellFront_US_SP_1 | video | CARASHELL_US_SP | 120251443755000435 | ACTIVE/ADSET_PAUSED | carashell.com/products/termoskyddet | 18.16 s | röstkoll ✅ · captions ✅ · uttal ✅ | — |
| CaraShellFront_SP_2 | CaraShellFront_US_SP_2 | video | CARASHELL_US_SP | 120251444231170435 | ACTIVE/ADSET_PAUSED | carashell.com/products/termoskyddet | 18.92 s | röstkoll ✅ · captions ✅ · uttal ✅ | — |
| CaraShellFront_SP_2_1 | CaraShellFront_US_SP_2_1 | bild | CARASHELL_US_SP | 120251443254850435 | ACTIVE/ADSET_PAUSED | carashell.com/products/termoskyddet |  | textlager + QA-bild ✅ | — |
| CaraShellFront_SP_3 | CaraShellFront_US_SP_3 | video | CARASHELL_US_SP | 120251444237950435 | ACTIVE/ADSET_PAUSED | carashell.com/products/termoskyddet | 18.08 s | röstkoll ✅ · captions ✅ · uttal ✅ | — |

`effective_status` = `ADSET_PAUSED` för alla 16: adseten byggdes PAUSED av `kampanj.mjs --tom`
och uppladdaren rör aldrig ett adset den inte själv skapat. **Axels klick: slå på kampanjen
OCH de fyra adseten** (`CARASHELL_US_CS/G/PD/SP`) — annonserna är redan ACTIVE. Inga
`issues_info` på någon annons: pixeln är delad med UK-kontot (PROCESS.md punkt 17 avklarad).
De sju sista videorna laddades upp med `ladda-upp-snabb.mjs` (≈ 8 Graph-anrop per annons)
på 5 minuter, efter att `ops-till-meta` (≈ 20 anrop per annons) tagit 8–37 minuter per video
i Metas anropstak.

## 2026-09-18 — `/ops-leverans carashell/termoskyddet` — tom kö, SE-kampanjen pausad av en människa

- Kön: 0 rader i `To be Reviewed` / `Creative strat review`. Hubben: 5 Approved (gårdagens
  batch #2, klara i NO + US) och 2 Draft-videor (inte levererade, ingen redigerare). Inget laddades upp.
- **SE-kampanjen `CARASHELL_SE_Termoskydd Husbil 211 × 171 cm` är PAUSED sedan 2026-09-18
  11:29 CEST** (`updated_time` ur Meta). Nattvakten 00:57 rörde inte statusen — den sänkte CBO
  1 000 → 700 kr och pausade `G_2_1` (budgetlogg). Pausen kom alltså senare, för hand.
  Livstid: 2 028 kr, 4 köp, ROAS 1,10 mot break-even 1,61. PAUSED med spend = beslut;
  leveransrundan laddar inte upp dit och aktiverar inget.
- Konsekvens: nya rader i `To be Reviewed` stannar där tills SE-kampanjen är ACTIVE igen
  (kön säger "ingen ACTIVE SE-kampanj"). NO-kampanjen berörs inte av den här rundan.

## 2026-09-18 — `/ops-oversatt carashell/termoskyddet` (NO) — tom kö

- Kön: 0 rader i `SE-ACTIVE to be translated` (gårdagens fem är `Approved`, live i NO + US).
  Inget översatt, inget uppladdat, ingen Notion-rad rörd, 0 HeyGen-credits.
- NO-kampanjen `CARASHELL_NO_Termoskydd Husbil 211 × 171 cm` (`120249115382210172`) ACTIVE,
  4 ACTIVE adsets; ärvd länk ur `CaraShellFront_NO_CS_4_1`. 548 NOK läst på `/nb`-sidan.
- SE-kampanjen är PAUSED för hand sedan 11:29 CEST (se leveransrundan samma dag) — nya rader
  når inte den här kön förrän den är ACTIVE igen. NO-kampanjen rörs inte av det.
- Discord `#annons-uppladdning`, ingen ping. Batch: `market-expansion/ops/carashell/2026-09-18-no-termoskyddet/`.

## 2026-09-18 — `/ops-spegla carashell/termoskyddet` — första schemalagda körningen, tom kö

- Källhub `BÄVER Termoskyddet för Husbil` (`c5a270ab-…`): 0 rader i `CaraShell SE ready to be active`,
  0 i `CaraShell EN ready to be active`, 0 i `Translation in review`, 0 i `Approved`
  (efterjusteringen `--fran` gav också noll). Båda statusstegen finns i hubben. Inget speglat,
  ingen Notion-rad rörd, inget uppladdat, ingen Discord-ping (tom kö).
- SE-kampanjen `CARASHELL_SE_Termoskydd Husbil 211 × 171 cm` fortfarande PAUSED med 2 043 kr spend
  (pausad för hand 11:29 CEST, se leveransrundan ovan) — speglingen skulle ha vägrat SE ändå.
  NO-kampanjen ACTIVE, 4 adsets. Pris SE 559 SEK / NO 548 NOK ur butiken.
- Rutinen `Speglingen: carashell/termoskyddet` (`trig_01GWEbTKYMKTfqUZfcucqN71`, fast session
  `session_017BEGfjEbMWUNPVhHFDxnxn`, cron `55 14 * * *` = 16:55 CEST) sedd i `list_triggers` på
  `claude5@stonebite.org` i den här körningen, enabled, nästa 2026-09-19 16:55.

## 2026-09-18 — `/ops-oversatt carashell/termoskyddet --marknad US` — tom kö, US pausad av ägaren

- Kön: 0 rader i `SE-ACTIVE to be translated`. `Approved`-kön: 5 rader (batch #2), alla
  redan uppe i US sedan 2026-09-17 (`finns_i_meta: true`) — inget eftersläpande.
- **US-kampanjen `CARASHELL_US_Termoskydd Husbil 211 × 171 cm` (`120251442339640435`,
  Magiborsten UK) är PAUSED sedan 2026-09-18 09:34 UTC (11:34 CEST)** med 1 977 kr spend,
  0 köp — pausad för hand, samma förmiddag som SE-kampanjen (11:29). Största spendarna:
  `US_PD_2` 989 kr, `US_PD_2_1` 450 kr, `US_CS_5_1` 185 kr, resten under 60 kr; 21 annonser
  ACTIVE/CAMPAIGN_PAUSED. Kopian `1 CARASHELL_US_… – kopia` (`120251451414990435`, skapad
  2026-09-16 22:21 CEST av någon annan än rutinerna) är PAUSED sedan 2026-09-17 15:25 CEST
  med 616 kr, 0 köp. Båda är PAUSED med spend = beslut; rutinen rör dem inte.
- Läge "US paused by owner": 0 rader hållna, inget renderat (0 HeyGen-credits), inget
  uppladdat, ingen Notion-rad rörd. Kommer rader i `SE-ACTIVE to be translated` hålls de
  där tills kampanjen är ACTIVE igen, eller tills US tas bort ur `annonsmarknader`.
- Pris ur butiken: $99 på `carashell.com/products/termoskyddet?country=US`.
- Discord `#annons-uppladdning` (CaraShell — OPS): meddelande `1550526534278717470`, ingen ping.
- Kommandofilen fick 2026-09-18 en not om egen domän (`carashell.com`) i länkraden, och
  `hamtaPris` exporteras nu ur `ops-leveranskon.mjs` — inget som ändrar den här rundan.

## 2026-09-19 — nattvakten körning nr 3 (ingen briefdag): kampanjen PAUSED, 0 ändringar

`CARASHELL_SE_Termoskydd Husbil 211 × 171 cm` står **PAUSED** (avstängd under 18/9 av
någon annan än rutinen — inte loggat här). Slutläsning: **2 058 kr / 4 köp / ROAS 1,08**
på tre dygn mot BE 1,61. `CS_4_1` nådde 506 kr / 0 köp före pausen; `CS_2_1` bär 2 av 4
köp (180 kr). Inget rört, inget aktiverat — PAUSED är ett beslut. **Briefronden pausad
av Axel 2026-09-18** ("CaraShell briefas inte längre själv — allt skapas i Bäverbutikens
teamspace och speglas hit, `/ops-spegla`"), så söndagens briefdag ger inga briefer.
Batch #2:s två videobriefer ligger kvar i Draft i hubben.

## 2026-09-19 — `/ops-leverans carashell/termoskyddet` — tom kö, oförändrat

- Kön: 0 rader i `To be Reviewed` / `Creative strat review`. Hubben oförändrad sedan igår
  (5 Approved, 2 Draft-videor). Inget laddades upp, inget rördes i kontot.
- SE-kampanjen står kvar PAUSED med samma `updated_time` som igår (2026-09-18 11:29 CEST) —
  ingen har rört den. Livstid 2 058 kr / 4 köp / ROAS 1,09 (eftersläpande attribution +30 kr).
- Nattvakten skrev ingen budgetloggrad för termoskyddet i natt (kampanjen pausad, inget att döma).
- Sedan 2026-09-18 briefas termoskyddet i Bäverbutikens hub och speglas hit av `/ops-spegla`
  (16:55) — den rutinen laddar upp direkt i SE-kampanjen när den är ACTIVE. Tom kö här är det
  väntade läget, inte ett fel.

## 2026-09-19 — `/ops-oversatt carashell/termoskyddet` (NO) — tom kö

- Kön: 0 rader i `SE-ACTIVE to be translated`. Inget översatt, inget renderat
  (0 HeyGen-credits), inget uppladdat, ingen Notion-rad rörd.
- NO-kampanjen `CARASHELL_NO_Termoskydd Husbil 211 × 171 cm` (`120249115382210172`,
  MagiBorsten DK) **ACTIVE** med 4 ACTIVE adsets; ärvd länk ur `CaraShellFront_NO_CS_4_1`
  (`https://carashell.se/nb/products/termoskyddet?country=NO`). 548 NOK läst på `/nb`-sidan.
- SE-kampanjen står kvar PAUSED av ägaren sedan 2026-09-18 11:29 CEST — inga nya rader når
  den här kön den vägen. Sedan 2026-09-18 briefas produkten dessutom i Bäverbutikens hub och
  speglas hit av `/ops-spegla` 16:55, som laddar upp direkt i SE-kampanjen. **Tom kö är det
  väntade läget**, inte ett fel.
- Discord `#annons-uppladdning` (CaraShell — OPS): meddelande `1550913337725026415`, ingen ping.
- Batch: `market-expansion/ops/carashell/2026-09-19-no-termoskyddet/`.

## 2026-09-19 — `/ops-oversatt carashell/termoskyddet --marknad US` — tom kö, US fortsatt pausad

- Kön: 0 rader i `SE-ACTIVE to be translated`. `Approved`-kön: 5 rader (batch #2), alla
  redan uppe i US — inget eftersläpande.
- **Oförändrat sedan gårdagens runda.** `CARASHELL_US_Termoskydd Husbil 211 × 171 cm`
  (`120251442339640435`) står kvar PAUSED med **samma `updated_time` som igår**
  (2026-09-18 09:34 UTC / 11:34 CEST) — ingen har rört den. Livstid 1 978 kr / 0 köp
  (+1,13 kr eftersläpande attribution sedan igår). Kopian `1 CARASHELL_US_… – kopia`
  (`120251451414990435`) PAUSED sedan 2026-09-17, 616 kr / 0 köp. Båda är PAUSED med
  spend = beslut; rutinen rör dem inte.
- Läge "US paused by owner": 0 rader hållna, inget renderat (0 HeyGen-credits), inget
  uppladdat, ingen Notion-rad rörd.
- Pris ur butiken: $99 på `carashell.com/products/termoskyddet?country=US`.
- Discord `#annons-uppladdning` (CaraShell — OPS): meddelande `1550913495669809304`, ingen ping.
- Batch: `market-expansion/ops/carashell/2026-09-19-us-termoskyddet/`.
## 2026-09-19 — `/ops-spegla carashell/termoskyddet` — kön tom, 21 rader blockerade av pausad SE-kampanj

- **Ordinarie kö: 0 rader** i `CaraShell SE ready to be active`, 0 i `CaraShell EN ready to be active`.
  Inget speglat, ingen Notion-rad rörd, inget uppladdat, ingen Discord-ping.
- **Efterjustering `--fran "Translation in review,Approved"`: 0 + 21 rader.** Torrkörningen gav
  **0 speglade / 21 hoppade / 0 fel** — samma skäl på varenda rad: *ingen ACTIVE SE-kampanj i butiken*.
  `CARASHELL_SE_Termoskydd Husbil 211 × 171 cm` är PAUSED med **2 058 kr** spend (pausad för hand
  2026-09-18 11:29 CEST). PAUSED med spend är ett beslut — speglingen laddar inte upp dit.
  Ingen rad stoppades på pris (559 kr i briefen = 559 kr i butiken) och ingen på brandnamn.
  Ingen av de 21 har NO-version (Translated url saknas), så NO-delen hade hoppats ändå.
- Skarp körning **inte** gjord: med 0 speglade i torrt är den bevisligen ett no-op — varje rad
  hoppas före första skrivningen (`ops-spegla.mjs` rad 772–787), och kommentarsgrenen kräver
  brand- eller prisstopp, vilket ingen rad har.
- ⚠️ **De 21 raderna står i `Approved`, inte i speglingssteget.** Mätt på alla 21 (`last_edited_time`):
  16 fick sin status 2026-09-19 06:32 UTC, 5 ändrades 16:54–16:57 UTC mitt under den här körningen.
  Ingen schemalagd rutin går de tiderna. Enligt CLAUDE.md ska Bäverbutikens `/oversatt NO` sätta
  `CaraShell SE ready to be active` på den här hubben, aldrig `Approved` — annars når raderna aldrig
  speglingens kö. Inget arbete är förlorat: `--fran "Approved"` fångar dem när SE-kampanjen är igång.
  **Orsaken funnen i commit `732359e`** ("/oversatt NO 2026-09-19: hela kön blockerad, 14 rader till
  Approved"): Bäverbutikens NO-kampanj `Frontrutetrekk til Bobil` är avvecklad (PAUSED, 4 495 kr spend),
  så den körningen översatte inte och flyttade raderna till `Approved` enligt den generella regeln
  2026-09-15 — utan att känna till speglingsundantaget. 5 av de 21 raderna kom den vägen 16:54–16:57 UTC.
  För en speglad hub är `Approved` fel även när NO är avvecklad: speglingen behöver bara den SVENSKA
  filen, och hoppar NO-delen av sig själv. `/oversatt NO` bör kolla `ops-spegla.mjs --kallor` innan den
  sätter status på en hub.
- NO-kampanjen `CARASHELL_NO_Termoskydd Husbil 211 × 171 cm` ACTIVE, 4 adsets. Pris 559 SEK / 548 NOK
  läst ur butiken. Rutin: `trig_01GWEbTKYMKTfqUZfcucqN71`, fyrade 14:55 UTC.

## 2026-09-20 — nattvakten körning nr 4 (briefdag, men briefronden pausad): båda marknaderna PAUSED

**SE** `CARASHELL_SE_Termoskydd…` PAUSED (sedan 18/9): 2 058 kr / 4 köp / ROAS 1,08 på 7 dygn
mot BE 1,61. **NO** `CARASHELL_NO_Termoskydd…` **också PAUSED** (torrkörd avläsning, inget
skrivet): 3 513 kr / 7 köp på 7 dygn, vinstbidrag **+267 kr**. Produkten spenderar alltså
ingenting på någon marknad. 0 ändringar, inget aktiverat.

⚠️ **Värt att veta innan något startas om:** `CaraShellFront_NO_CS_3` (video, norska) var
produktens ENDA bedömbara vinnare när marknaden stängdes — **774 kr, 3 köp, CPA 258 kr**
mot break-even 347 kr. `NO_PD_5_1` (609 kr/1 köp) och `NO_G_2_1` (354 kr/1 köp) låg under
grinden. Sverige hade ingen bedömbar annons alls. Startas NO om är CS_3 utgångspunkten,
inte de svenska bilderna.

Briefronden pausad sedan 2026-09-18 (Axels beslut: CaraShell briefas i Bäverbutikens
teamspace och speglas hit) — söndagens briefdag gav därför inga briefer. `kord` stämplad,
`brief-kord` INTE (pausen står tills vidare).

## 2026-09-20 — `/ops-leverans carashell/termoskyddet` — tom kö, tredje dagen i rad

- Kön: 0 rader i `To be Reviewed` / `Creative strat review`. CaraShells hub oförändrad
  (5 Approved, 2 Draft-videor). Inget laddades upp, inget rördes i kontot.
- SE-kampanjen kvar PAUSED med samma `updated_time` 2026-09-18 11:29 CEST — ingen har rört
  den på tre dygn. Livstid 2 058 kr / 4 köp / ROAS 1,09 mot break-even 1,61, oförändrat sedan igår.
- Bäverbutikens källhub (`c5a270ab-…`) bär 35 rader men ingen i `CaraShell SE ready to be active`,
  så speglingen 16:55 har inget att lämna hit heller.
- Briefarna skrivs i Bäverbutikens hub sedan 2026-09-18. Tom kö i den här rutinen är det väntade
  läget; den blir användbar igen först när en människa slår på SE-kampanjen.

## 2026-09-20 — `/ops-oversatt carashell/termoskyddet` (NO) — NO-kampanjen pausad av ägaren

- **Nytt läge sedan i går: `CARASHELL_NO_Termoskydd Husbil 211 × 171 cm`
  (`120249115382210172`) är PAUSED med spend.** `updated_time` 2026-09-19 20:07 CEST,
  21 annonser. Livstid ur Meta (`date_preset=maximum`): **3 515,44 kr / 7 köp /
  ROAS 1,14 / CPA 502 kr** mot break-even 1,61 — kampanjen gick med förlust, pausen
  stoppar den. PAUSED med spend = ett beslut; rutinen rör den aldrig och föreslår
  varken `/ny-annonser` eller `--tom`.
- Ingen rutin gjorde det: `factory/budgetlogg.jsonl` har inga NO-rader (senaste
  termoskydds-raderna är 2026-09-18 på SE), och nattvakten i natt (körning nr 4)
  rapporterade bara "båda marknaderna PAUSED, 0 ändringar". Alltså en människas paus.
- Kön: 0 rader i `SE-ACTIVE to be translated` ⇒ **0 rader hållna**. Inget översatt,
  inget renderat (0 HeyGen-credits), inget uppladdat, ingen Notion-rad rörd.
- Läge: **"NO paused by owner"** enligt kommandofilens tabell. Kommer rader in i kön
  hålls de där tills NO-kampanjen är ACTIVE igen eller NO tas bort ur `annonsmarknader`.
- Butiken är fortfarande redo för Norge: 548 NOK läst på `/nb`-sidan.
- Båda marknaderna är nu pausade för produkten: SE sedan 2026-09-18 11:29, NO sedan
  2026-09-19 20:07. Speglingen 16:55 laddar därför inte upp något heller.
- Discord `#annons-uppladdning` (CaraShell — OPS): meddelande `1551236149488656429`, ingen ping.
- Batch: `market-expansion/ops/carashell/2026-09-20-no-termoskyddet/`.

## 2026-09-20 — `/ops-spegla carashell/termoskyddet` — tom kö, NU ÄR BÅDA marknaderna pausade

- **Ordinarie kö: 0 rader** i `CaraShell SE ready to be active`, 0 i `CaraShell EN ready to be active`.
  Inget speglat, ingen Notion-rad rörd, inget uppladdat, ingen Discord-ping.
- ⚠️ **NO-kampanjen pausades i går kväll.** Mätt ur Meta (`updated_time`):
  `CARASHELL_NO_Termoskydd Husbil 211 × 171 cm` PAUSED **2026-09-19 20:07 CEST** med 3 515 kr spend;
  `CARASHELL_SE_…` PAUSED sedan 2026-09-18 11:29 CEST med 2 058 kr spend. Båda är PAUSED med spend,
  alltså avvecklade med flit — **termoskyddet spenderar ingenting alls i CaraShell just nu**, och
  speglingen har ingen kampanj att ladda upp till i någon marknad. Rör dem inte utan Axels ok.
- Ingen efterjustering körd i dag: med båda kampanjerna pausade hoppas varje rad före första
  skrivningen, och gårdagens torrkörning bevisade utfallet på 21 av exakt samma rader (0 speglade).
  En ny 27-radersrunda hade kostat en halvtimmes Meta-läsningar utan att ändra något.
- ⚠️ **Källhubben fylls på i fel status och växer:** 35 rader totalt — **27 `Approved`** (21 i går) och
  8 `Creative strat review`; noll i båda speglingsstegen. `/oversatt NO` fortsätter alltså sätta
  `Approved` i stället för `CaraShell SE ready to be active` (orsaken i går: commit `732359e`).
  Inget arbete är förlorat — `--fran "Approved"` fångar dem — men speglingens ordinarie kö kommer
  aldrig att se en enda rad så länge det pågår.
- Pris 559 SEK / 548 NOK läst ur butiken. Rutin `trig_01GWEbTKYMKTfqUZfcucqN71`, fyrade 14:55 UTC.

## 2026-09-20 — `/ops-oversatt carashell/termoskyddet --marknad US` — tom kö, alla tre marknaderna pausade

- Kön: 0 rader i `SE-ACTIVE to be translated`. `Approved`-kön: 5 rader, **0 saknas i US**.
- **Helt oförändrat sedan gårdagens runda:** `CARASHELL_US_Termoskydd Husbil 211 × 171 cm`
  (`120251442339640435`) PAUSED med samma `updated_time` (2026-09-18 09:34 UTC) och **exakt
  samma spend, 1 978,33 kr / 0 köp** — ingen eftersläpande attribution ens. Kopian
  (`120251451414990435`) PAUSED sedan 2026-09-17, 616 kr / 0 köp. Båda orörda.
- **Läget i stort:** SE pausad 18/9, NO pausad (avläst av nattvakten i natt), US pausad 18/9.
  Produkten spenderar ingenting på någon marknad. Den här rutinen har haft tom kö tre dygn
  i rad — det är väntat, inte ett fel.
- Läge "US paused by owner": 0 rader hållna, 0 HeyGen-credits, inget uppladdat, ingen Notion-rad rörd.
- Pris ur butiken: $99 på `carashell.com/products/termoskyddet?country=US`.
- Discord `#annons-uppladdning` (CaraShell — OPS): meddelande `1551251439307726912`, ingen ping.
- Batch: `market-expansion/ops/carashell/2026-09-20-us-termoskyddet/`.

## 2026-09-21 — nattvakten körning nr 5 (ingen briefdag): SE fortfarande PAUSED, 0 ändringar

SE PAUSED: 7d 2 058 kr / 4 köp, 3d nere på 355 kr / 0 köp när de pausade dygnen rullar in.
0 ändringar, inget aktiverat. **NO: också fortfarande PAUSED** — 3d 1 743 kr / 2 köp,
7d 3 516 kr / 7 köp (läs-bar torrkörning, inget skrivet). Kollen låg kvar i Metas rate
limit-kö när Discord-rapporten gick ut och rapporterades där som "ej kontrollerad"; den
blev klar strax efteråt och läget var oförändrat. Briefronden pausad sedan 18/9.
`kord` stämplad, `brief-kord` inte.

## 2026-09-21 — `/ops-leverans carashell/termoskyddet` — tom kö, oförändrat fjärde dagen

- Kön: 0 rader. Hubben oförändrad (5 Approved, 2 Draft-videor). Inget laddades upp,
  inget rördes i kontot.
- SE-kampanjen kvar PAUSED, `updated_time` fortfarande 2026-09-18 11:29 CEST. Livstid
  2 058 kr / 4 köp — exakt samma siffror som igår, alltså ingen eftersläpande attribution kvar.
- Kontot har vuxit från 659 till 730 annonser sedan igår (andra butikers körningar);
  ingenting av det rör den här produkten.

## 2026-09-21 — `/ops-oversatt carashell/termoskyddet` (NO) — oförändrat, NO fortsatt pausad

- Kön: 0 rader i `SE-ACTIVE to be translated`, 0 hållna. Inget översatt, inget renderat
  (0 HeyGen-credits), inget uppladdat, ingen Notion-rad rörd.
- NO-kampanjen `CARASHELL_NO_Termoskydd Husbil 211 × 171 cm` (`120249115382210172`) står
  kvar PAUSED med **samma `updated_time` 2026-09-19 20:07 CEST** — ingen har rört den.
  Livstid oförändrad: 3 515,88 kr / 7 köp / ROAS 1,14 mot break-even 1,61. Läge
  "NO paused by owner"; rutinen rör inget och föreslår ingen omstart.
- Butiken redo för Norge: 548 NOK läst på `/nb`-sidan.
- SE är också fortsatt pausad (sedan 2026-09-18), så varken leveransrundan eller
  speglingen fyller på kön.
- Discord `#annons-uppladdning` (CaraShell — OPS): meddelande `1551613933364842497`, ingen ping.
  Batch: `market-expansion/ops/carashell/2026-09-21-no-termoskyddet/`.

## 2026-09-21 — `/ops-spegla carashell/termoskyddet` — tom kö, oförändrat, men kön växer bakom stoppet

- **Ordinarie kö: 0 rader** i båda speglingsstegen. Inget speglat, inget uppladdat, ingen
  Notion-rad rörd, ingen Discord-ping.
- **Oförändrat sedan i går:** båda kampanjerna PAUSED med spend, alltså avvecklade.
  `CARASHELL_SE_…` 2 058 kr (sedan 2026-09-18 11:29 CEST), `CARASHELL_NO_…` 3 516 kr
  (sedan 2026-09-19 20:07 CEST). Ingen marknad tar emot annonser. Ingen efterjustering körd:
  utan ACTIVE kampanj hoppas varje rad före första skrivningen, bevisat på 21 rader 2026-09-19.
- ⚠️ **Källhubben växer medan stoppet står:** 42 rader (35 i går) — **27 `Approved` (oförändrat)**,
  8 `Creative strat review`, 4 `In progress`, 3 `Draft`. De sju nya ligger i tidiga steg, alltså
  **produceras nya creatives för en produkt vars båda marknader är avstängda**. De 27 Approved
  står fortfarande i fel status för en speglad hub (se 2026-09-19) och väntar på `--fran "Approved"`.
- Pris 559 SEK / 548 NOK läst ur butiken. Rutin `trig_01GWEbTKYMKTfqUZfcucqN71`, fyrade 14:55 UTC.

## 2026-09-21 — `/ops-oversatt carashell/termoskyddet --marknad US` — tom kö, fjärde dagen

- Kön: 0 rader i `SE-ACTIVE to be translated`. `Approved`-kön: 5 rader, 0 saknas i US.
- **Oförändrat tredje dygnet i rad:** US-kampanjen (`120251442339640435`) PAUSED med samma
  `updated_time` (2026-09-18 09:34 UTC) och **samma spend, 1 978,33 kr / 0 köp** — identiskt
  med 19/9 och 20/9, alltså ingen eftersläpande attribution kvar. Kopian
  (`120251451414990435`) PAUSED sedan 2026-09-17, 616,24 kr / 0 köp. Båda orörda.
- Alla tre marknaderna (SE, NO, US) är pausade av ägaren. Produkten spenderar ingenting.
- Läge "US paused by owner": 0 rader hållna, 0 HeyGen-credits, inget uppladdat, ingen
  Notion-rad rörd. Pris ur butiken: $99.
- ⚠️ **Mätt i den här körningen: Metas Graph API avvisar `?ids=<a>,<b>`** med "The ids query
  parameter is deprecated in v26.0+" — även på v21.0. Hämta ett objekt per anrop i stället.
  Inget skript i repot använder den vägen (enda träffen på `ids=` är en Ads Manager-LÄNK i
  `tools/test/ops-spegla.test.mjs`, inte ett API-anrop), så ingen kod behövde ändras.
- Discord `#annons-uppladdning` (CaraShell — OPS): meddelande `1551613933364842497`, ingen ping.
- Batch: `market-expansion/ops/carashell/2026-09-21-us-termoskyddet/`.

## 2026-09-22 — nattvakten körning nr 6: båda marknaderna fortfarande PAUSED, 0 ändringar

SE PAUSED och nu helt tyst: **3d 0 kr**, 7d 2 058 kr / 4 köp (eftersläpande fönster).
NO PAUSED (läs-bar torrkörning): 3d 1 088 kr / 0 köp, 7d 3 516 kr / 7 köp. 0 ändringar,
inget aktiverat. Briefdag enligt registret (ikappkörning efter 5 dygn) men **ronden är
pausad sedan 18/9** — inga briefer. `kord` stämplad, `brief-kord` inte.
Femte dygnet med produkten avstängd på båda marknaderna.
