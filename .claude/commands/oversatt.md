# /oversatt [LAND] — Notion-kön → översätt → launch i marknadens kampanj

Rutinen som tar varje annons `/notionkorning` har laddat upp i Sverige (Notion-status
**`SE-ACTIVE to be translated`**), gör den norsk (bild: texten ritas om i samma former;
video: HeyGen-dubb + captions) och lägger den i produktens **befintliga** kampanj i
**Magiborsten NO** (`act_1050941584152547`, ⚠️ valuta SEK). Utan argument: alla
marknader med `aktiv: true` i `market-expansion/marknader.json` (i dag bara NO).
Körs som Routine 15:00 svensk tid och på Axels kommando.

Planen och alla uppmätta fakta: `docs/oversatt-rutin.md`. Läs den först.
Kör alla faser klart utan att invänta godkännande; stanna bara vid ❌ nedan.

**Discord:** samma kanaler som `/translate-no` — brief i
`#translation-till-norge-av-nya-produkter`, problem i `#problems-no`, ping Axel +
ECOM CHADKING (`market-expansion/no/discord.json`; andra marknader:
`pipeline/discord-brief.mjs --konfig=market-expansion/<land>/discord.json`).
Skriv i Axels läsformat: en mening per rad, max 10 ord, inga filnamn, ingen teknik.

## Regler som aldrig bryts

- **Bygg aldrig en kampanj här.** Saknas produktens NO-kampanj: rapportera (`/translate-no` bygger).
- **PAUSED med spend = avvecklad.** Inga nya annonser dit, raden ligger kvar i kön.
- **Fel konto = avbryt.** Kampanjens `account_id` måste vara marknadens (`marknader.json`).
- **Kontot är facit för dubbletter.** Finns målnamnet i målkontot är raden klar.
- **Ingen rad hoppas tyst.** Allt som inte kördes står i briefen med skäl.
- **Pris ur marknadens butik vid varje körning** (`products.json`), aldrig ur bilden.
  Rabattprocent/spar räknas om ur NO-pris och NO-jämförpris. Prispolicyn: säger
  annonsen en procent som butiken inte bär → höj jämförpriset
  (`tools/shopify-fix-compareat.mjs --market NO`), ändra aldrig claimen.
- **Claims som inte går att verifiera i Norge stryks:** svenska betyg/antal
  recensioner ("5,0 (8 recensioner)"), "fri frakt" under 300 kr, "inom Sverige".
  Citat ur svenska recensioner får översättas men attribueras till baverbutiken.se.
- **Modellpolicyn:** all norsk text (bildrader, copy) skrivs av en sonnet-subagent med
  `docs/copy-regler.md` + lokaliseringschecklistan; huvudsessionen verifierar claims.
- **Rendera aldrig video före proofread. Skanna alltid källvideon efter inbränd text.**
- **Allt föds PAUSED; aktivering rör bara annonsen + adset körningen själv skapade.**
  NO: ACTIVE (Axels beslut 2026-08-29) — bara när kampanjen är ACTIVE.
- **Aldrig `git add -A`** i batchmappen (`se/`, `no/`, `qa/`, mp4 är gitignorerade).

## Steg 0 — Miljö

```bash
pip install numpy pillow imageio-ffmpeg        # bildmotorn + captions (imageio-ffmpeg har libass)
node pipeline/localize.mjs check               # HeyGen details.api (bara om kön har video)
```
Env som krävs: `META_ACCESS_TOKEN`, `NOTION_TOKEN`, `KIE_API_KEY` (reserv för bild),
`HEYGEN_API_KEY` (video), `DISCORD_BOT_TOKEN`. Saknas `NOTION_TOKEN` men Notion-MCP:n
finns: läs kön med SQL (`Status = 'SE-ACTIVE to be translated'` i alla hubbar under
teamspacet Bäverbutiken, Typ ~ pending approval) till en JSON-fil och ge den till
kö-verktyget med `--rader`; statusbyten görs då med `notion-update-page`.

## Fas 1 — Kön (gratis, alltid komplett)

```bash
node tools/oversattningskon.mjs --marknad NO --dry            # visa
node tools/oversattningskon.mjs --marknad NO [--rader <fil>]  # skriv jobbfilen
```
Skriver `market-expansion/no/notion-batches/<datum>/jobb.json`. Per rad: SE-annonsen
(exakt namn i MagiBorsten SE → copy, `image_hash`/`video_id`), koppling via
`market-expansion/no/produkter.json` (SE-prefix → NO-prefix, adset-prefix,
kampanj-id, länk), kampanjens fyra utfall live, dubblett mot målkontot (läst en
gång), NO-pris + jämförpris ur `beverbutikken.no/products.json`, målnamn
`<NOprefix>_NO_<K>_<nr>[_<rest>]`. K (vinkeln) tas ALLTID ur SE-namnets fält 2.
Max 40 bilder + 12 videor per körning; resten listas som kö.
**Saknar ett prefix koppling:** problemmeddelande "⚠️ <prefix> saknar norsk
kampanj/koppling. Lägg till raden i produktlistan." — hoppa, kör resten.

## Fas 2 — Texterna (sonnet-subagent)

1. Hämta SE-bilderna: `se.media.url` ur jobbfilen → `<batch>/se/<namn>.jpg`.
2. **Läs varje bild** och skriv `se-texter.json`: per bild formerna uppifrån och ned
   (`platta`/`band`/`knapp`/`etikett`/`badge`), varje forms synliga rader ordagrant,
   `block` = radindex som är EN radbruten mening, `stryk_del` för överstruket pris,
   `varning` för claims som inte gäller i Norge. Bilden är facit — Notion-briefen
   och `Feedback`-fältet är stöd (bilden avviker ibland från briefen).
3. Bygg `oversatt-input.json` (jobb + se-texter + verifierade NO-fakta per produkt:
   pris, jämförpris, spar, %, fri frakt ≥ 300 kr, antal anmeldelser på NO-sidan,
   mått/material ur NO-produktsidan) och kör subagenten (`model: "sonnet"`) med
   prompten i `docs/oversatt-rutin.md`-mönstret: norska texter per form
   (`texter: [{rader, text, stryk?}]`), copy (message/headline/description),
   `andringar`, `hoppa`. Utdata `oversatt-output.json`.
4. Läs `andringar` — varje struken/ändrad claim ska vara motiverad av ett faktum.

## Fas 3 — Bilderna (0 krediter)

```bash
python3 pipeline/oversatt-bild.py --in <se.jpg> --analys        # formerna + raderna
python3 pipeline/oversatt-batch.py --batch market-expansion/no/notion-batches/<datum> [--bara <namn>]
```
Batchdrivaren matchar SE-formerna mot detekterade former (samma antal rader, i
ordning), suddar texten inuti formen (fyller med formens egen färg rad för rad) och
ritar den norska texten i samma ruta med samma stil (fet/normal, färg, storlek,
justering). `MISMATCH` = detektorn hittade inte formen (platta över ett rörigt foto,
badge med text på fotot): skriv en manuell ruta i `overrides.json`
(`box_for_form`, `box` + `post` + stil) — aldrig en gissad koordinat utan att titta.
BOF-mallens fraktrad ("Fri frakt inom Sverige"/"Klarna – betala sen") är **vit text
direkt på fotot** vid y ≈ 1098–1125 utan platta — detektorn hittar den aldrig; ruta
`[33,1086,1047,1132]`, `storlek 30`, `fet`, `farg [255,255,255]`, `"textljus": true`
(mätt 2026-09-05 på tre bilder). Halvgenomskinlig topplatta över foto/pratbubbla
(IBC_CO_1_1, IBC_BOF_2_1, Overvakningskamera_BOF_3_1) hittas inte heller — rutor per
post, textraderna mäts ur bilden.
Kie (`google/nano-banana-edit`, `bildannonser/kie.mjs`) är reserv för text direkt på
fotot, exakt som `/translate-no` Fas 3.2.

**QA — läs varje `<målnamn>.jpg.qa.png` (SE | NO sida vid sida):** stavning,
siffror, inget svenskt kvar, texten inne i sin ruta, ✓-bockar kvar, streck rätt.
Fel → rätta texten/overriden och kör om `--bara`. Aldrig leverera en bild med fel.

## Fas 4 — Video (exakt `/translate-no` Fas 1–2)

Källvideon ur SE-kontot (`advideos` `source`) → `<batch>/<slug>/up/<namn>.mp4`
(>32 MB: crf 24–26). Kvot: Σ videominuter × 80 × 1,2 ≤ `details.api`, annars
väntar videoraderna (bilderna körs ändå).
```bash
cd pipeline
node translate-batch.mjs proofread --manifest=<batch.json> --lang="Norwegian Bokmål (Norway)" --marknad=NO
# SRT lokaliseras av sonnet-subagenten (samma blockantal/timecodes), regexgrind grön
node translate-batch.mjs apply --manifest=… --srtdir=<rättade>
node translate-batch.mjs render --manifest=… && node translate-batch.mjs download --manifest=…
python3 pipeline/no-captions.py <render.mp4> <fixed.srt> <out.mp4>   # bara om källan har inbränd text
```
Tom `.orig.srt` = inget tal ⇒ ingen render. Läs QA-bilderna, slutkortssvep.

⚠️ **Captions får aldrig täcka bilden (Axel 2026-09-05: "du har täckt hela skärmen").**
`no-captions.py` suddar ett band över hela bredden HELA videon och höjer det till
två rader — på en 720×1280-video med både rubrik och ordcaptions blev det två
breda dimband och produkten syntes knappt. Regeln: sudda **bara rutan där den
svenska texten faktiskt sitter, bara medan den syns** (ffmpeg `crop` → `boxblur`
→ `overlay … enable='between(t,a,b)'` per ruta och tid, mätt ur bilden), och lägg
den norska texten med en ASS-fil (`\pos`, BorderStyle 3 för vit ruta/svart text,
vit fet med svart kant för rubriker). Facit: `Beltesliper_NO_PD_4_H1` v2 (rutor
600×135 @ 100,468 under tre rubrikcues; 380×90 @ 170,830 under ordcaptions
0,2–1,65 s). `no-captions.py` duger bara när källan har EN smal textremsa och
inget viktigt under den (Beltesliper_NO_PD_5_H1 godkänd av Axel samma dag).

**Verktyget för det är `pipeline/no-precis.py <konfig.json>`** (byggt 2026-09-05 på
Båtmotortrekk, 7 videor med ordcaptions + checklistor + pris i bild + pratbubblor +
telefonslutkort). Det hittar ordcaption-pillret PER FRAME i renderingen (vitt piller,
svart karaoke-text, centrerat nederst — Carl Vicentes mall), vitmålar bara det och
lägger den norska cuen där med vit ruta/svart text — bara under de frames där det
svenska pillret faktiskt syns (ingen lucklös förlängning). Övriga element: `blur`-rutor
med tid, och PNG-lager (PIL) med vit/kräm platta + norsk text i samma ruta som den
svenska. Slutkortets telefon byggs om ur sista framen (ordmärke, titel, badge, pris,
jämförpris). Facit: `market-expansion/no/notion-batches/2026-09-05-video-batmotor/lager.py`
(mått och tider per video, mätta ur `frames/`). Piller på vitt kollage (recensionskort)
går inte att hitta automatiskt — mät för hand och ge `captions.fyll`.

## Fas 5 — Launch i Magiborsten NO

```bash
node tools/notion-till-marknad.mjs --marknad NO --jobb <jobb.json> --media <batch>/no --copy <batch>/adcopy-NO.json --dry
node tools/notion-till-marknad.mjs --marknad NO --jobb <jobb.json> --media <batch>/no --copy <batch>/adcopy-NO.json --aktivera
```
`adcopy-NO.json` = `{ "<målnamn>": {message, headline, description} }` ur
`oversatt-output.json`. Verktyget: kontospärr, PAUSED-med-spend, dubblett, adset
`<adset_prefix> - <K>` (finns ej → klon av syskon, aldrig SE-fallback), sida ärvd ur
kampanjen, enhancements OPT_OUT + `inline_comment` OPT_IN, allt föds PAUSED,
`--aktivera` slår på annonsen (+ nytt adset) när kampanjen är ACTIVE. Sekventiellt,
1,5 s mellan anrop, backoff på fel 17. Resultatet (annons-id, adset-id, status)
skrivs tillbaka i `jobb.json`. Tillbakaläsning: status/effective_status.

## Fas 6 — Notion, Discord, logg

1. Per uppladdad rad: kommentar `NO ✅ <målnamn> i "<kampanj>" (adset <K>), ad <id>`,
   `Translated url` = `https://www.facebook.com/adsmanager/manage/ads?act=1050941584152547&selected_ad_ids=<id>`,
   status → **`Approved`** (Axels beslut 2026-09-05: annonserna går live direkt i
   Norge, alltså ska raden stå som Approved — inte `Translation in review`. Beslutet
   ersätter "ingen kod flyttar till Approved" för de här raderna; alla 64 rader som
   stod i `Translation in review` flyttades samma dag).
   **Den färdiga norska filen läggs dessutom in ÖVERST i radens sidinnehåll** (Axels
   beslut 2026-09-05: "lägg dom i itemet så jag bara kan skrolla ner och se den
   översatta bilden eller videon direkt") — rubrik `## 🇳🇴 Norsk version — <målnamn>
   (uppe i Magiborsten NO)` + bilden/videon. MCP: `notion-create-file-upload` →
   POST filen → `notion-update-page insert_content` med `position start` och
   **`![<målnamn>](file-upload://<id>)`** (video: `<video src="file-upload://<id>">`).
   ⚠️ `<image src=…/>` finns INTE i Notion-markdown — det blev bokstavlig text på
   18 rader 2026-09-05 och fick göras om. En uppladdning som inte fästs vid en
   sida raderas efter en stund: ladda upp och fäst i samma steg. REST: File Upload
   API + `PATCH blocks/<page>/children`. En länk till Meta räcker inte — Axel
   granskar i Notion, inte i Ads Manager. Varje hubb har fliken
   **`🇳🇴 Norsk granskning`** (board, Status = Translation in review) — skapa den
   (`notion-create-view`) i hubbar som saknar den; standardtavlan döljer kolumnen.
   REST: `node tools/notion-aterkoppling.mjs <page-id> --kommentar "…" --egenskap "Translated url=…" --status "Translation in review"`;
   MCP: `notion-create-comment` + `notion-update-page`. Rad som hoppades: kommentar
   med skälet, status oförändrad.
2. Discord-brief (även vid tom kö): rad 1 ✅/⚠️ + antal, en rad per produkt
   (antal bilder/videor, pris), en rad per hoppad rad med skäl, kön, Kie-/HeyGen-saldo
   före → efter. "Du behöver inte göra något." om inget krävs.
3. Körlogg: rad i `market-expansion/no/STATUS.md` (+ `docs/video-localization.md`
   vid video). Committa `jobb.json`, `se-texter.json`, `oversatt-output.json`,
   `overrides.json`, `resultat.json` — aldrig bilder/videor. Pusha.

## Ny marknad (DK/FI/UK)

Fyll i blocket i `market-expansion/marknader.json`, skapa `<land>/produkter.json`
(SE-prefix → kampanj i marknadens konto) och `<land>/discord.json`, sätt `aktiv: true`.
Ingen kod ändras: `--marknad DK` läser konto, sida, språk, valuta, fraktgräns,
DSA-fält och kanaler ur blocket.

## Definition of done

- [ ] Kön läst ur alla hubbar (Typ ~ pending approval), inget tyst hopp
- [ ] Varje rad: SE-annons exakt i SE-kontot, koppling + kampanjutfall live, dubblett mot målkontot
- [ ] NO-pris/jämförpris ur butiken; alla belopp/procent omräknade; oberättigade claims strukna och listade
- [ ] Texter av sonnet-subagent, `andringar` granskade
- [ ] Bild: formmätning, norsk text i samma ruta, QA-bild läst per bild
- [ ] Video: kvotkalkyl, proofread före render, captions bara över inbränd text, QA + slutkort
- [ ] Upp i rätt kampanj/adset/konto med rätt namn, OPT_OUT + inline_comment, status enligt marknad, tillbakaläst
- [ ] Notion: kommentar + `Translated url` + **`Approved`** + **norska filen inlagd överst på sidan**; hoppade rader kommenterade
- [ ] Discord-brief i Axels läsformat, med ping; problem i problemkanalen
- [ ] STATUS/körlogg uppdaterade, committat utan medier, pushat
