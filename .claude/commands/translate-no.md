# /translate-no [Drive-länk] — norsk videobatch: Drive → HeyGen → captions → Meta NO

Rutinen som tar en Drive-mapp med svenska videoannonser (en undermapp per produkt),
dubbar dem till norska via HeyGen, lägger diskreta norska captions över eventuell
inbränd text, levererar i chatten och launchar i **Magiborsten NO**
(`act_1050941584152547`, ⚠️ valuta **SEK**). Körs på Axels kommando — inte på schema.
Utan argument: senast kända batchmapp (se `market-expansion/no/video-batches/`).

Läs först: `.claude/skills/translate/SKILL.md` (järnreglerna + alla HeyGen-fallgropar)
och `docs/temu-launch-flow.md` (kampanjstruktur, BE-ROAS, prispolicy). Kör alla faser
klart utan att invänta godkännande; stanna bara vid ägarbeslut eller ❌ nedan.

## Fas 0 — Inventera och verifiera (gratis, alltid komplett)

1. Lista Drive-mappen (connector eller `embeddedfolderview`). En undermapp = en
   produkt. Annonsvideor = `*_<KONCEPT>_<nr>[_H<n>].mp4` (CS/PD/SP/G/GT).
   `*_Extra`, PNG:er, ADCOPY-docs och REVIEW-sheets är inte annonsvideor.
2. Bygg/uppdatera batchmanifestet `market-expansion/no/video-batches/<datum>/batch.json`
   (format: se befintlig batch). Ladda ner videorna, komprimera >31 MB till crf 24–26.
3. **Norsk produktsida per produkt:** sök `https://beverbutikken.no/products.json`
   (paginera). Finns produkten inte → produkten översätts INTE och launchas INTE;
   rapportera till Axel. Notera pris + jämförpris (NOK) ur variants.
4. **Kvot:** `node pipeline/localize.mjs check`. Det är `details.api` som räknas —
   proofread kräver api-krediter trots att den inte renderar (verifierat 2026-08-29:
   47 sessioner failade med "Insufficient credit. This operation requires 'api'
   credits" och brände ~9 krediter på köpet). Tumregel ur körloggen: **~1 kredit per
   påbörjad videominut**. Räcker inte kvoten: STANNA, be Axel fylla på, launcha inget.
5. COGS ur batch-sheeten (länkar i masterdokumentet, `docs/temu-launch-flow.md`).
   Norge = Total ex tax, INGEN tulladd. BE-ROAS = pris/(pris − COGS i NOK), utan moms.
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
2. **Järnregel 2:** skanna KÄLLVIDEON efter inbränd svensk text (2 fps, numpy-
   bandprofil). Standardstil (Axels beslut 2026-08-29): norska captions läggs
   **exakt över den befintliga textremsan, så diskret som möjligt** — tajt platta
   i samma mått som originalets band, max 2 rader, aldrig mer täckning än
   nödvändigt (`pipeline/cover-srt.py`; MarginV/FontSize är i ASS-skala, höjd 288).
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
5. Lägg in i produktens BEFINTLIGA koncept-adsets som `<Produkt>_NO_<K>_2_1`
   (link_data + image_hash, samma copy som konceptets videoannonser,
   enhancements OPT_OUT, status enligt beslut).

## Fas 3.5 — Drive-leverans (Axels krav 2026-08-29)

Färdiga videor + norska adcopy-docs ska in i Drive: i huvudmappen finns en mapp
**`NO`** (id `131yXc3gJKU1DKqoDwLci_UknTrBJXXT_`, Axels struktur 2026-08-29) och i
den en undermapp per produkt med **samma namn som källmappen**. Docs skapas via
Drive-connectorn (`create_file`, textContent → Google Doc). Videorna är för stora
för connectorn — de laddas upp med `node pipeline/drive-push.mjs
--folder=<mapp-id> final/<slug>/*.mp4`, som kräver env `DRIVE_UPLOAD_URL` +
`DRIVE_UPLOAD_KEY` (Apps Script-brevlådan, installation: `tools/drive-brevlada.gs`).
Saknas env-variablerna: be Axel installera brevlådan, leverera docs ändå.
REVIEWS-arken kopieras INTE: påhittade kundrecensioner översätts/publiceras inte
av rutinen (beslut 2026-08-29) — raden lämnas till Axel.

## Fas 4 — Logga och pusha

1. Ny rad i körloggen i `docs/video-localization.md` (kvot, rättelser, captions,
   leverans, launch). Uppdatera batchmappens filer. Committa + pusha.

## Definition of done

- [ ] Alla annonsvideor i Drive-mappen inventerade; icke-annonser exkluderade
- [ ] Norsk produktsida + NOK-pris verifierade för varje launchad produkt
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
