# /translate-no [Drive-länk] — norsk videobatch: Drive → HeyGen → captions → Meta NO

Rutinen som tar Drive-mappen **LAUNCHED** (en undermapp per launchad svensk produkt),
dubbar videoannonserna till norska via HeyGen, lägger diskreta norska captions över
eventuell inbränd text, levererar i chatten och launchar i **Magiborsten NO**
(`act_1050941584152547`, ⚠️ valuta **SEK**). Körs som Routine 04:15 svensk tid
varje dag, och på Axels kommando. Utan argument: LAUNCHED-mappen nedan.

**Discord (Axels beslut 2026-09-02):** rutinen pratar i två kanaler, och pingar
**Axel** (`confident_otter_25993`) + **ECOM CHADKING** (`ecom_chadking`) i båda.
Adresserna står i `market-expansion/no/discord.json`, skriptet är
`pipeline/discord-brief.mjs`:

| Kanal | När | Kommando |
|---|---|---|
| `#translation-till-norge-av-nya-produkter` | Efter VARJE körning (Fas 4) | `node pipeline/discord-brief.mjs "<brief>"` |
| `#problems-no` | Så fort en produkt inte går att köra (Fas 0) | `node pipeline/discord-brief.mjs --problem "<vad som saknas>"` |

Meddelandena skrivs i **Axels läsformat** — samma som svaren i chatten: en mening
per rad, max 10 ord per rad, inga filnamn, inga kommandon, ingen teknik, inget
"vad jag gjorde". Rad 1 = resultatet, börjar med ✅ eller ⚠️.

Läs först: `.claude/skills/translate/SKILL.md` (järnreglerna + alla HeyGen-fallgropar)
och `docs/temu-launch-flow.md` (kampanjstruktur, BE-ROAS, prispolicy). Kör alla faser
klart utan att invänta godkännande; stanna bara vid ägarbeslut eller ❌ nedan.

## Fas 0 — Inventera och verifiera (gratis, alltid komplett)

**Drive-ramverket (Axels struktur 2026-08-30, källan bytt 2026-09-02):**
- Källa: **LAUNCHED** (`1-vbYhYgTEv7zYptW5rGmgKAITmAz4l1X`) — en undermapp per
  launchad svensk produkt, direkt i mappen. **Alla produkter i Sverige ska testas
  i Norge** — rutinen tar varje produktmapp här.
- Tre undermappar i LAUNCHED är **inte** produkter och listas aldrig som kandidater:
  - **WINNERS** (`1752El3Ehbew06Oey1RK-VPNGHIVQjeiI`) — redan gjorda till Norge
    (Axels besked 2026-09-02). Rörs inte.
  - **LOSERS** — produkter som floppat i Sverige. Körs inte till Norge.
  - **MAKE TO NORWAY** — målet, se nedan.
- Mål: **MAKE TO NORWAY** (`1z6oJt1dTu1kwXU-s1_RQkwIRFar3zeOw`) — rutinen skapar
  en norsk dubblettmapp **`NO <källmappens namn>`** per produkt och lägger ALLT
  där (videor, bilder, adcopy-docs). Prefixet `NO ` är obligatoriskt.
- **Inga mappar flyttas någonsin** — källmappen i LAUNCHED rörs inte.
  Dubblettspärr i Drive: finns `NO <namn>` redan i MAKE TO NORWAY **eller i någon
  av dess undermappar** (mätt 2026-09-02: tre NO-mappar ligger i
  `MAKE TO NORWAY/WINNERS`) är produkten behandlad → hoppa (komplettera bara om
  mappen är halvfärdig). Lista därför MAKE TO NORWAY rekursivt.
  (Samma ramverk återanvänds per marknad senare: `DK <namn>`, `UK <namn>` osv.)
- **Kandidat** = produktmapp i LAUNCHED som saknar `NO <namn>`-mapp OCH saknar
  kampanj med produktnamnet i `act_1050941584152547` (oavsett status).
- **Max 3 produkter per körning**, i bokstavsordning. Resten står i kö till nästa
  natt och listas i briefen ("i kö: …"). Tre produkter är ~36 videor och
  ~1 100 HeyGen-krediter — mer än så per natt går inte att QA:a ordentligt.

1. Lista LAUNCHED. En undermapp = en produkt (minus de tre ovan). Annonsvideor =
   `*_<KONCEPT>_<nr>[_H<n>].mp4` (CS/PD/SP/G/GT).
   `*_Extra`, PNG:er (utom `*_<vinkel>_2_1.png`-bildannonserna, se Fas 3.2),
   ADCOPY-docs och REVIEW-sheets är inte annonsvideor.
2. Bygg/uppdatera batchmanifestet `market-expansion/no/video-batches/<datum>/batch.json`
   (format: se befintlig batch). Ladda ner videorna, komprimera >31 MB till crf 24–26.
3. **Norsk produktsida per produkt:** sök `https://beverbutikken.no/products.json`
   (paginera). Finns produkten inte → produkten översätts INTE och launchas INTE.
   **Skicka ett problemmeddelande direkt** (Axels beslut 2026-09-02):
   ```bash
   node pipeline/discord-brief.mjs --problem "⚠️ <Produkt> saknas på beverbutikken.no.
   Lägg upp produkten i norska butiken.
   Sen tar rutinen den nästa natt."
   ```
   Ett meddelande per produkt, i Axels läsformat, med pingarna på (default).
   Fortsätt sedan med nästa kandidat — ett problem stoppar aldrig resten.
   Notera pris + jämförpris (NOK) ur variants.
4. **Kvot:** `node pipeline/localize.mjs check`. Det är `details.api` som räknas —
   proofread kräver api-krediter trots att den inte renderar (verifierat 2026-08-29:
   47 sessioner failade med "Insufficient credit. This operation requires 'api'
   credits" och brände ~9 krediter på köpet). Tumregel ur körloggen: **~1 kredit per
   påbörjad videominut**. Räcker inte kvoten: STANNA, be Axel fylla på, launcha inget.
5. **COGS ur batch-sheeten.** Axels COGS-dokument (2026-09-02):
   `https://docs.google.com/document/d/1BtFJj1A3J2ciZZS_f3lKU0cM0g5-ncWO7LFySuc3peo`
   — det listar batch-sheets **#1–#5.1** med alla produkter, även kommande.
   Både docet och sheeten är länkdelade och läses **utan connector** (verifierat
   2026-09-02, funkar i rutinen utan MCP):
   ```bash
   curl -sL "https://docs.google.com/document/d/1BtFJj1A3J2ciZZS_f3lKU0cM0g5-ncWO7LFySuc3peo/export?format=txt"
   curl -sL "https://docs.google.com/spreadsheets/d/<sheet-id>/export?format=csv"   # första fliken; fler flikar: &gid=<n>
   ```
   Sök produktens rad i varje sheet (matcha på Bäverbutiken-länken eller
   produktnamnet, aldrig på radnummer).
   Sheetens struktur (verifierad 2026-09-02): en rad per produkt och kvantitet,
   marknadsblock **SWEDEN / NORWAY / FINLAND / DENMARK / UK**, varje block med
   `Qty | Product cost | Shipping cost | Total ex. tax | Delivery time | Shipping method`
   i **EUR**. Norge-COGS = **NORWAY-blockets `Total ex. tax` för Qty 1** (produkt +
   norsk frakt). **INGEN tull, inget påslag** — Norge ligger utanför EU och hanteras
   utan tulladd (till skillnad från DK/FI som får +2,9 EUR).
   Saknas NORWAY-talen på raden (tomma celler, eller tal som inte går ihop):
   ingen BE-ROAS, ingen launch — problemmeddelande till `#problems-no`
   ("⚠️ <Produkt> saknar Norge-kostnad i batch-sheet #N. Fyll i NORWAY-kolumnerna.")
   och hoppa över. Hitta aldrig på en kostnad.
   BE-ROAS = pris/(pris − COGS i NOK), utan moms.
   Dagskurs EUR→NOK hämtas live (`open.er-api.com/v6/latest/EUR`), aldrig ur minnet.

## Fas 1 — Proofread + lokalisering (0 credits i rendering, kräver api-kvot)

1. `cd pipeline && node translate-batch.mjs proofread --manifest=<batch.json>`
   — laddar upp, skapar sessioner (`Norwegian Bokmål (Norway)`), hämtar SRT:er.
   State skrivs till `<batch.json>.state.json` löpande; failade sessioner
   återskapas automatiskt vid omkörning.
2. Lokalisera SRT:erna enligt checklistan i `docs/video-localization.md`.
   **Modellpolicyn gäller:** slutgiltiga norska rader skrivs av en subagent
   (`model: "sonnet"`) som får källtext + verifierade fakta (priser i NOK,
   claims mot butiken) + `docs/copy-regler.md`. Samma blockantal och timecodes
   som originalet, ungefär samma radlängd (läppsynk).
3. Verifiera med regex tills grönt: inga SEK-belopp, inga svenska tecken/ord,
   claims stämmer mot norska priser. Undanta timecode-rader.
4. `node translate-batch.mjs apply --manifest=… --srtdir=<rättade>` — verifierar
   att SRT:n persisterat (CDN-lagg upp till 8×8 s; persist-buggen ⇒ ny session).

## Fas 2 — Rendering + captions (ENDA betalsteget)

1. `node translate-batch.mjs render` följt av `download`. Status via v3-API:t
   (v2 ljuger om moderation). Fastnar något i moderering: leverera resten.
2. **Järnregel 2 + Beltesliper-stilen (Axels facit 2026-09-02).** Skanna
   KÄLLVIDEON efter inbränd svensk text (2 fps, numpy-bandprofil) och bränn
   captions med **`python3 pipeline/no-captions.py <render.mp4> <fixed.srt> <out.mp4>`**
   — det skriptet ÄR standarden, bygg inte egna varianter per batch.

   Så här ska det se ut (facit: `Beltesliper_NO_PD_3` — "jag blir glad bara av
   att kolla på dom captionsen"):
   - **Ett utsuddat band över hela bredden**, exakt där den svenska textremsan
     satt (uppmätt per video; standardband 1388–1500 när mätningen inte hittar
     något). Suddet är intilliggande bildinnehåll som blurrats — aldrig den
     svenska texten suddad på plats. Bandet ligger hela videon.
   - **En textruta med vit bakgrund och svart fet text** (Liberation Sans Bold,
     ~46 px) mitt i bandet, centrerad i höjd och sidled, max 2 rader. Rutan är
     tajt runt texten, inte över hela bredden.
   - **Ingenting av det svenska syns.** Inte en bokstav, inte en kontur.

   Så här får det ALDRIG se ut (motexempel: `Overvåkingskamera_NO_CS_1`):
   - svensk text kvar bakom en halvgenomskinlig platta eller synlig genom suddet,
   - en suddig kopia av det svenska bandet där texten fortfarande anas,
   - norsk text i en egen ruta ovanför eller under det svenska bandet,
   - två rutor i bild samtidigt, eller en helsvart platta.

   Skriptet skannar resultatet 60 px ovanför/under bandet och stannar med exit 3
   om svensk text sticker ut — kör då om med `--band=Y0:Y1` som täcker allt.
   Det sparar dessutom tre QA-bilder (`<out>.qa-1..3.png`, 10/50/90 %) per video:
   **läs varje QA-bild innan leverans.** Svensk text i någon av dem = underkänd,
   gör om. Källvideons remsa kan sitta olika i olika klipp — lita aldrig på att
   bandet från förra videon passar nästa.
   Video utan inbränd text får INGA captions (opt-in-regeln).
3. Slutkortssvep: sista sekunden × alla videor — svensk butiksdomän/pris i bild
   ska ersättas eller rapporteras.
4. Leverera: `NO_<slug>_<namn>.mp4` → `market-expansion/no/video-batches/<datum>/final/<slug>/`,
   zip ≤30 MiB (`zip -0`, komprimera aldrig hårdare än gränsen kräver),
   skicka i chatten med innehåll per zip. Rapportera kvot före/efter + alla rättelser.

## Fas 3 — Launch i Magiborsten NO

1. En vågkonfig per produkt: `pipeline/waves/no-<slug>-video.config.mjs`
   (mall: `no-kranskydd-video.config.mjs`). Norsk adcopy = översätt produktens
   ADCOPY-docs från Drive via copy-subagenten, verifiera varje claim mot
   beverbutikken.no (fri frakt bara ≥300 kr, "30 dagers åpent kjøp" är OK,
   rabattprocent mot compare_at — vid mismatch: höj jämförpriset enligt
   prispolicyn, ändra aldrig claimen). Kampanjnamn:
   `<Produkt> NO | BE-ROAS <x,xx> | <launchdatum>` — datumet = körningens datum.
2. **Dubblettspärr:** finns en kampanj med produktnamnet i kontot (oavsett status)
   → launcha inte om; komplettera bara halvbyggda (se `/launch` fas 0.5).
3. `node no-video-launch.mjs waves/no-<slug>-video.config.mjs --dry` → granska →
   kör skarpt. Struktur: CBO 1000 kr/dag, adset per koncept, alla enhancements
   OPT_OUT, statusar EXPLICIT i konfigen. Axels beslut 2026-08-29: **allt ACTIVE**.
4. Verifiera efteråt i API:t: kampanjstatus, adset-/annonsantal, att inga
   gamla videor med samma titel återanvänts av misstag (annonsnamnen är
   produktprefixade just därför).

## Fas 3.2 — Bildannonserna (`*_<vinkel>_2_1.png`, Axels krav 2026-08-29)

Varje produktmapp har ~4 bildannonser som ska med i kampanjen. Flöde (verifierat
2026-08-29 — **direktöversättning i bildmodell stavar fel, gör inte det**):
1. Läs varje bild, inventera all svensk text + verifiera claims mot norska butiken
   (samma prisregler som för video; rabattprocent i talet styr jämförpriset).
2. **Kie AI** (env `KIE_API_KEY`): `POST api.kie.ai/api/v1/jobs/createTask` med
   modell `google/nano-banana-edit` och prompten "Remove ALL text, letters and
   numbers … keep buttons as empty shapes" + originalets publika Drive-URL.
   Polla `GET /api/v1/jobs/recordInfo?taskId=`. (Higgsfield är fallback om Kie
   saknas — samma teknik.)
3. Rita norsk text deterministiskt med PIL på den rensade plattan
   (LiberationSans-Bold; ✓-tecken ritas med linjer — glyfen saknas i fonten;
   knappar målas som rounded rectangles). Exempel: `compose-no.py` i batchmappen.
4. QA varje bild visuellt (stavning, siffror, layout). Leverera i chatten,
   ladda upp till NO-mappen via drive-push (`mimeType=image/png`).
5. Lägg in i produktens BEFINTLIGA koncept-adsets:
   `node no-image-ads.mjs waves/no-<slug>-video.config.mjs --imgdir=<mapp> --slug=<slug> [--dry]`
   — skapar `<Produkt>_NO_<K>_2_1` (link_data + image_hash, samma copy som
   konceptets videoannonser, enhancements OPT_OUT, status ur konfigen). Idempotent.
   ⚠️ Kontots rate limit (Meta-fel 17) slår vid täta körningar — låt jobben gå
   sekventiellt med paus emellan, aldrig parallellt mot samma konto.

## Fas 3.5 — Drive-leverans (Axels krav 2026-08-29)

Färdiga videor + norska adcopy-docs ska in i Drive: i **MAKE TO NORWAY**
(`1z6oJt1dTu1kwXU-s1_RQkwIRFar3zeOw`) skapas mappen **`NO <källmappens namn>`**
per produkt (se ramverket i Fas 0 — gamla `NO`-wrappermappen finns inte längre).
Docs skapas via Drive-connectorn (`create_file`, textContent → Google Doc). Videorna är för stora
för connectorn — de laddas upp med `node pipeline/drive-push.mjs
--folder=<mapp-id> final/<slug>/*.mp4`, som kräver env `DRIVE_UPLOAD_URL` +
`DRIVE_UPLOAD_KEY` (Apps Script-brevlådan, installation: `tools/drive-brevlada.gs`).
Saknas env-variablerna: be Axel installera brevlådan, leverera docs ändå.
REVIEWS-arken kopieras INTE: påhittade kundrecensioner översätts/publiceras inte
av rutinen (beslut 2026-08-29) — raden lämnas till Axel.

## Fas 4 — Logga, pusha och briefa

1. Ny rad i körloggen i `docs/video-localization.md` (kvot, rättelser, captions,
   leverans, launch). Uppdatera batchmappens filer. Committa + pusha.
2. **Discord-brief (Axels krav 2026-08-30, kanal + format 2026-09-02) — skickas
   EFTER VARJE körning, även när inget behandlades:**
   `node pipeline/discord-brief.mjs "<text>"` → `#translation-till-norge-av-nya-produkter`,
   pingar Axel + ECOM CHADKING automatiskt.
   Skriv i **Axels läsformat**, exakt som svaren till honom i chatten:
   - Rad 1: resultatet, börjar med ✅ eller ⚠️, max 12 ord.
   - Sedan en rad per produkt: namn, vad som gjordes, pris, BE-ROAS.
   - Sedan en rad per överhoppad produkt: namn + varför.
   - Sista raden: kvot före → efter. Ingen teknik, inga filnamn, inga kommandon.
   - Krävs något av Axel: "Du ska göra 1 sak." + en rad per klick. Annars
     "Du behöver inte göra något."
   Exempel:
   ```
   ✅ 2 produkter klara i Norge i natt.
   Badshorts: 12 videor + 4 bilder. 299 kr. BE-ROAS 1,61. Aktiv.
   Gravstenspenna: 12 videor + 4 bilder. 189 kr. BE-ROAS 1,52. Aktiv.
   Hoppade över Medicinask: saknas i norska butiken.
   I kö till i morgon: Kamouflagetejp, Luffarschack, Magnethylla.
   Krediter: 26 900 → 25 750.
   Du behöver inte göra något.
   ```
   Ingen körning = en rad om det ("✅ Inga nya produkter i natt. Allt är redan
   gjort.") plus kön om den finns.

## Definition of done

- [ ] LAUNCHED listad; WINNERS, LOSERS och MAKE TO NORWAY exkluderade; kandidater =
      utan NO-mapp (rekursivt) OCH utan kampanj i NO-kontot; max 3 körda, kön listad
- [ ] Alla annonsvideor i produktmapparna inventerade; icke-annonser exkluderade
- [ ] Norsk produktsida + NOK-pris verifierade för varje launchad produkt
- [ ] Varje produkt som inte gick att köra: problemmeddelande i `#problems-no` med ping
- [ ] Norge-COGS läst ur NORWAY-blocket i rätt batch-sheet, utan tull
- [ ] Kvot räckte (eller stopp FÖRE proofread) — kvot rapporterad före/efter
- [ ] Proofread FÖRE rendering på varje video; alla SRT-rättelser redovisade
- [ ] Copy/SRT-rader skrivna av sonnet-subagent, tre-frågorstestet redovisat
- [ ] Inbränd svensk text skannad; captions diskret över befintligt band, max 2 rader
- [ ] Slutkortssvep gjort
- [ ] Levererat i chatten som zip ≤30 MiB
- [ ] Kampanj per produkt i act_1050941584152547: CBO 1000 kr/dag, adset per
      koncept, enhancements OPT_OUT, status enligt beslut (ACTIVE), BE-ROAS +
      datum i namnet, dubblettspärren körd
- [ ] Körloggen uppdaterad, allt committat och pushat
- [ ] Discord-brief skickad i `#translation-till-norge-av-nya-produkter`, i Axels
      läsformat, med ping — även när inget kördes
