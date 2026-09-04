# `/oversatt <LAND>` — Notion-kön → översätt → launch i marknadens kampanj

**Status: PLAN (2026-09-03). Inget är byggt än.** Det här dokumentet är
underlaget för byggsessionen och blir sedan processdokumentationen för rutinen.
Planen är granskad mot koden (sex kartläggningar + en luckgranskning
2026-09-03); varje "verifierat" nedan pekar på den granskningen.

---

## Vad rutinen gör (tioåringsversionen)

Varje dag gör redigerarna nya svenska annonser. De laddas upp i Sverige av
`/notionkorning`, som sen lägger raden i Notion-hyllan **"SE-ACTIVE to be
translated"** — kön av annonser som väntar på att bli norska.

Den nya rutinen är en robot som varje dag:

1. Tittar på hyllan och plockar alla annonser som ligger där.
2. Kollar vilken produkt annonsen hör till och hittar produktens norska kampanj.
3. Gör annonsen norsk. Video: rösten dubbas till norska och all svensk text i
   bilden byts mot norsk. Bild: den svenska texten tas bort och norsk text
   skrivs dit i stället. Priset blir det norska priset.
4. Skriver den lilla texten som står bredvid annonsen på norska också.
5. Lägger upp den färdiga norska annonsen i produktens norska kampanj, i rätt
   fack, så den börjar visas i Norge.
6. Skriver på Notion-raden att den är klar och skickar ett meddelande på
   Discord om vad som hände.

Norge först. Danmark, Finland och Storbritannien ska gå att slå på senare genom
att lägga till en rad i en lista — inte genom att bygga om roboten.

---

## Uppmätt läge 2026-09-03 (grunden för planen)

| Vad | Mätt | Betyder |
|---|---|---|
| Kön `SE-ACTIVE to be translated`, 8 aktiva hubbar | **45 rader, alla bild** (`Image - Pending Approval`), 0 videor | Första körningen är en ren bildkörning |
| Fördelning | MC-Kapell 11 · Båtmotor 12 · Beltgrinder 8 · Kranskydd 8 · Övervakningskamera 6 | Alla fem har en ACTIVE NO-kampanj i kontot |
| `Magiborsten NO` (`act_1050941584152547`) | 24 kampanjer, valuta **SEK**, tidszon Oslo, 15 ACTIVE / 9 PAUSED | Kampanj finns → annonsen läggs till, ingen ny kampanj byggs |
| PAUSED med budget | Motorhöljet NO, Axelbältet NO, Sätesöverdraget NO, Strandtofflorna NO, Tofflorna NO, Fiskespöhållaren NO, Sykkelshorts NO, Gamasjer NO, Kjempefotball NO, Medisinboks NO | Dit laddar rutinen **aldrig** upp (PAUSED med spend är ett beslut) — raden rapporteras som "väntar" |
| NO-annonsernas form (MC-Trekk NO) | adset `MC-Trekk NO - <K>`, annons `MCtrekk_NO_<K>_<n>` (video) / `MCtrekk_NO_<K>_2_1` (bild), page `879054088633562`, geo NO, länk beverbutikken.no, alla enhancements OPT_OUT + `inline_comment` OPT_IN, allt ACTIVE | Facit för hur nya annonser ska se ut |
| SE-källan (`MC-Kapell_RE_2_1`) | Finns i MagiBorsten SE, adset `RE \| Notionrunda 2026-09-02`, copy + rubrik + länk i creativen; bilden hämtbar via `image_hash` → `adimages.url` (verifierat: 1080×1350, 152 kB); video via `advideos` `source` | Copy, länk **och media** hämtas ur SE-kontot. Notion är kön och statusen, inte enda kopian längre |
| SE-prefix ↔ NO-prefix | `MC-Kapell` ↔ `MCtrekk`, `Kranskydd` ↔ `Kranbeskyttelse`, `Batmotor` ↔ `Båtmotortrekk` … | Går **inte** att härleda ur kontona — kräver en kopplingsfil (verifierat) |
| `tools/leveranskon.mjs` prefix-regex | `/^([A-Za-z]+)_/` ger `null` för `MC-Kapell_…` och hoppar raden **tyst** (verifierat) | Nya kön får inte ärva den — 11 av 45 rader skulle försvinna |
| HeyGen api-kvot | **621 krediter**. Körloggen visar ~80 krediter per videominut (23 videor = 1 127, 12 videor = 466), inte "1/min" som kodkommentaren säger | Räcker till ~12 videor. Kön har 0 videor i dag, men Axel bör fylla på innan videor dyker upp |
| Kie.ai | 16 593 krediter, `KIE_API_KEY` satt | Bildmotorn är klar att köra |
| Meta | `META_ACCESS_TOKEN` når både SE och NO | ✅ |
| Notion | MCP finns i sessionen; `NOTION_TOKEN` saknas i env | Kön, bilagan och statusbytet går via REST (`tools/notion-kalla.mjs`, `notion-fil.mjs`, `notion-aterkoppling.mjs`) och kräver nyckeln — se "Rutinen" |
| Python-beroenden | ffmpeg, numpy, pillow saknas i containern; `pip install numpy pillow imageio-ffmpeg` fungerar och imageio-ffmpeg:s binär har libass (testat 2026-09-03) | Rutinen installerar dem i steg 0, som `/notionkorning` redan gör |
| Discord | `DISCORD_BOT_TOKEN` satt, kanaler i `market-expansion/no/discord.json` | ✅ `pipeline/discord-brief.mjs` fungerar (sökvägen till discord.json är hårdkodad — blir parameter) |
| Notion-statusar i hubbarna | `SE-ACTIVE to be translated`, `To be translated`, `Translation in review`, `Translation archived` finns; URL-fältet **`Translated url`** finns men skrivs av inget verktyg än | Färdig översättning = `Translation in review` + `Translated url` ifylld |
| ⚠️ De fyra arkiverade skalningshubbarna (Beach crocs, Mower seat, Trimmer belt, Boat cover 420D) | Saknar statusen `SE-ACTIVE to be translated` | `/notionkorning` kan inte lägga deras rader i kön. Deras NO-kampanjer är dessutom PAUSED. Inget att bygga för nu — men Axel bör veta |

Alla tal ovan är mätta i sessionen 2026-09-03, inte hämtade ur minnet.

---

## Flödet, fas för fas

Rutinen heter `/oversatt <LAND>` (`.claude/commands/oversatt.md`). Utan argument:
alla marknader med `aktiv: true` i `market-expansion/marknader.json` (i dag bara NO).

### Fas 0 — Inventera (gratis, alltid komplett)

`tools/oversattningskon.mjs --marknad NO [--dry]` gör allt nedan och skriver en
jobbfil. `--dry` visar per rad: rad → SE-annons → NO-kampanj/adset → målnamn →
kör/hoppa/varför.

1. **Läs kön.** Alla databaser vars titel slutar på `creative hub` i teamspacet
   Bäverbutiken (inkl. arkiverade via `products.json`-golvet i
   `notion-kalla.mjs`), rader med `Status = SE-ACTIVE to be translated` och fil
   i `Filer och media`. Filtrera på **inkludering**: `Typ` matchar
   `/pending approval/i`. (`notion-kalla.mjs` får status + Typ som parametrar —
   i dag är `To be Reviewed` en modulkonstant.)
2. **Hitta SE-annonsen.** Radens `Namn` (allt före ett ev. ` – suffix`) slås upp
   **exakt** mot alla annonsnamn i MagiBorsten SE (`act_1867947880635861`), läst
   EN gång med `name,creative{object_story_spec}`. Därifrån: primärtext, rubrik,
   beskrivning, länk, `image_hash`/`video_id`, annons-id. Prefix = allt före
   första `_` (bindestreck och å/ä/ö tillåtna), vinkel **K = fält 2** i
   SE-namnet (`MC-Kapell_RE_2_1` → `RE`), nummer = fält 3, hook = ev. `H<n>`.
   Finns annonsen inte i SE-kontot → raden är inte launchad i Sverige →
   rapportera ("inte uppe i Sverige"), hoppa. Det är teamspace-skyddet i det
   här flödet: bara annonser som finns i Bäverbutikens SE-konto går vidare.
   **Ingen rad hoppas tyst** — varje överhoppad rad står i briefen med skäl.
3. **Koppla till marknadens kampanj.** Prefixet slås upp i
   `market-expansion/<land>/produkter.json`:
   ```json
   { "MC-Kapell": { "no_prefix": "MCtrekk", "adset_prefix": "MC-Trekk NO",
                    "campaign_id": "120252050710680233",
                    "link": "https://beverbutikken.no/products/mc-trekk-220-120-regn-stov-uv" } }
   ```
   Kampanjen verifieras **i kontot** varje körning. Fyra utfall, samma som
   `/notionkorning`:

   | Utfall | Vad rutinen gör |
   |---|---|
   | Kampanj **ACTIVE** | Kör. Annonsen börjar spendera direkt. |
   | Kampanj **PAUSED, 0 kr spend** | Kör, men annonsen lämnas PAUSED. |
   | Kampanj **PAUSED med spend > 0** | **Avvecklad.** Kör inte. Raden ligger kvar i kön, rapporteras som "väntar". |
   | **Ingen kampanj** / prefix saknas i produkter.json | Kör inte. Bygg **aldrig** en kampanj här (BE-ROAS/COGS-kedjan bor i `/translate-no`). Problemmeddelande: "⚠️ MC-Kapell saknar norsk kampanj. Kör /translate-no på produkten eller lägg till raden i produktlistan." |

   Spend läses med `insights?date_preset=maximum`; fel ⇒ räknas som spend.
4. **Dubblettspärr:** målkontot läses **en gång** per körning (inte per rad —
   NO-kontot slår i rate limit, fel 17). Finns målnamnet (`MCtrekk_NO_RE_2_1`)
   redan → klar sedan tidigare, hoppa tyst. Kontot är facit, ingen egen statusfil.
5. **Pris i marknaden.** Produktens sida i marknadens butik
   (`https://beverbutikken.no/products.json`, paginerat, matcha på länkens
   handle) → pris + jämförpris. Saknas produkten → hoppa + problemmeddelande.
   Prispolicyn från `/translate-no` gäller: säger annonsen "40 %" måste
   jämförpriset i butiken bära det — höj jämförpriset
   (`tools/shopify-fix-compareat.mjs --market NO`), ändra aldrig claimen.
6. **Kvot.** Video i kön → behov = Σ videominuter (ur ffmpeg) × 80 × 1,2, mot
   `node pipeline/localize.mjs check` (`details.api`). Räcker det inte väntar
   videoraderna, bildraderna körs ändå. Kie-saldo kollas
   (`GET /api/v1/chat/credit`).
7. **Max per körning:** 40 bilder + 12 videor, äldst först. Resten listas som kö
   i briefen.
8. **Ut:** `market-expansion/<land>/notion-batches/<datum>/batch.json` (samma
   format som `video-batches/`, id = Notion-page-id) + `jobb.json` för bilderna.
   Committa så fort proofread är klar — inte i slutet.

### Fas 1 — Copy (sonnet-subagent, modellpolicyn)

En subagent per produkt får: SE-copyn ur kontot (primärtext/rubrik/beskrivning
per annons), marknadens pris + jämförpris, butiksdomän, fraktregel (NO: fri frakt
bara ≥ 300 kr), `docs/copy-regler.md` och lokaliseringschecklistan i
`docs/video-localization.md`. Den levererar norsk primärtext/rubrik/beskrivning
**per annons** och de norska ersättningstexterna för bild/caption, med
tre-frågorstestet redovisat. Huvudsessionen verifierar varje claim mot butiken
(pris, rabatt, frakt, "30 dagers åpent kjøp") innan något renderas.

Lagras i `<batchmapp>/adcopy-<land>.json` **nycklat per annonsnamn** (inte per
vinkel som vågkonfigarna). En ny annons i ett befintligt adset får sin egen
översatta copy — inte adsetets gamla — så varje annons bär sin vinkel som i SE.

### Fas 2 — Media

**Bild** (`pipeline/oversatt-bild.py` — samma process som `/bildannonser` bygger
bilderna med, fast baklänges):

Så här är SE-bilderna gjorda (verifierat i `bildannonser/text.py` + bilden
`MC-Kapell_RE_2_1` 2026-09-03): Kie genererar **fotot utan text**, sedan lägger
`text.py` på all text som vektortext i fasta zoner — vit platta (rubrik/citat/
pris-band), blå knapp (CTA), mörk etikett, badge. Texten står alltså **alltid på
en enfärgad form**, aldrig direkt på fotot. Det gör översättningen deterministisk.
Något generiskt skript finns inte i dag — bara handskrivna `compose-no.py` per
batch med handmätta koordinater (verifierat). Det är det som ska byggas:

1. Hämta källbilden. Primärt ur **Meta SE** (`image_hash` → `adimages.url`).
   Notion-bilagan är reserv (`tools/notion-fil.mjs`).
2. Inventera texten. Svenska strängarna står i Notion-briefen (tabellen
   *Script / shot list*: Headline, Sub-line, Bottom band, CTA — `tools/notion-klara.mjs --brief`)
   och Claude läser bilden som facit. Sonnet-subagenten levererar norska
   motsvarigheter med marknadens pris.
3. **Formerna mäts, inte gissas:** hitta varje enfärgad textform (platta, knapp,
   etikett, badge) som sammanhängande 2D-yta med en färg (prototyp 2026-09-03
   hittade plattorna radvis; byggs som connected components så pris-bandet som
   korsas av produkten också hittas); fyll den helt med sin egen färg (då är den
   svenska texten borta utan ett spår) och rita den norska texten i **samma
   ruta**, samma stil ur `text.py`:s `STILAR` (font, färg, storlek krymps tills
   det får plats, max samma antal rader). 0 krediter, pixelstabilt.
4. **Kie som reserv**, för bilder med text direkt på fotot (redigerarnas egna):
   `google/nano-banana-edit` "Remove ALL text … keep the product/faces exactly",
   input `image_urls` = publik URL. **Verifierad väg är Drive-URL**; Notions
   signerade URL (giltig ~1 h, Kie pollar max 5 min) är förstahandsval och
   `adimages.url` testas på EN bild i byggsessionen innan planen litar på den.
   Sedan diff original/platta → textrutor → samma PIL-steg.
5. QA: `<ut>.qa.png` per bild, läs varje. Stavning, siffror, layout, ingen
   svensk rest. Fel → gör om. Aldrig leverera en bild med fel.

**Video** (exakt `/translate-no` Fas 1–2, samma skript):
1. Kö-verktyget lägger källvideon (ur Meta SE `advideos`, reserv Notion) på
   `<batchmapp>/<slug>/up/<namn>.mp4` (>32 MB komprimeras med imageio-ffmpeg:s
   binär, crf 24–26). En batchmapp **per marknad** — state, `srt-orig/` och
   `out/` saknar språkdimension (verifierat).
2. `cd pipeline && node translate-batch.mjs proofread --manifest=… --lang="<heygen_sprak>" --marknad=NO`
   (titelprefixet `NO_` på rad 93 blir parameter).
3. **Tal-lösa videor:** tom `.orig.srt` efter proofread ⇒ "inget tal", ingen
   render (0 krediter), källvideon används som den är (+ captions om inbränd
   text). SRT lokaliseras av sonnet-subagenten (samma blockantal/timecodes),
   generisk regexgrind med marknadstabell (valuta, prisord, förbjudna claims,
   svenska tecken) grön.
4. `apply` → `render` → `download --max-min=<n>` (v3-status; moderation som
   inte släpper inom tidsgränsen återupptas nästa körning; `MISMATCH`-poster
   nollas automatiskt vid nästa proofread).
5. Skanna källvideon efter inbränd svensk text; hittas text →
   `python3 pipeline/no-captions.py <render> <fixed.srt> <out>` (Beltesliper-
   stilen: blurrat band + vit ruta, svart fet text, max 2 rader). Läs alla tre
   QA-bilder. Slutkortssvep sista sekunden. Video utan inbränd text får inga
   captions.

### Fas 3 — Launch i marknadens kampanj

`tools/notion-till-marknad.mjs --marknad NO` byggs ovanpå `tools/meta-lib.mjs`
(utbrutet ur `tools/notion-till-meta.mjs`, som i dag är en CLI utan exports och
låst till SE-kontot på tre ställen — verifierat):

1. **Kontospärr:** `campaign.account_id` (numeriskt) måste vara marknadens konto
   ur `marknader.json` (lagras utan `act_`), annars avbryt ("fel annonskonto
   kostar riktiga pengar"). Spärr 0 (PAUSED med spend) och dubblettspärren
   ärvs; dubblettkollen tar kö-verktygets kontolista i stället för att lista
   kontot per annons.
2. **Adset** = `<adset_prefix> - <K>` (`MC-Trekk NO - RE`). K kommer **alltid
   ur SE-namnet** (`--koncept` obligatorisk; en marknadskod som K = avbryt —
   dagens `konceptUrNamn` skulle ge "NO" och matcha vartenda NO-adset,
   verifierat). Finns adsetet → använd. Finns det inte (nya SE-vinklar RE/GA/OF/
   DE/OB/LI/CO/RI/SO/REV/BF/TR/RV saknas i NO-kampanjerna som har CS/G/PD/SP) →
   klona ett syskonadset: targeting, geo, `promoted_object` (pixel),
   `optimization_goal`, `billing_event`, `attribution_spec`, ingen egen budget
   (CBO). **Saknar mallen targeting → avbryt**, aldrig SE-fallback.
3. **Annonsnamn:** `<no_prefix>_NO_<K>_<nr>_1` (bild) / `<no_prefix>_NO_<K>_<nr>_H<h>`
   (video) — speglar SE-namnet så datan går att skära per vinkel/hook.
   `_NO_` i namnet håller annonsen utanför `/commission` (verifierat mot
   `berakning.mjs`).
4. **Creative:** `link_data + image_hash` resp. `video_data` (+ thumbnail-väntan),
   copy per annons ur `adcopy-<land>.json`, marknadens länk, page ärvd ur
   kampanjens egna annonser, `degrees_of_freedom_spec` = OPT_OUT-listan +
   `inline_comment` OPT_IN från `no-image-ads.mjs`, `dsa_beneficiary`/`dsa_payor`
   när marknadsblocket har dem (DK/FI kräver det, verifierat i `uk-wave.mjs`/
   `dk-motorholje.config.mjs`).
5. **Status:** allt föds PAUSED; `--aktivera` slår på annonsen + adset körningen
   själv skapade, enligt `status` i marknadsblocket (**NO: ACTIVE**, Axels
   beslut 2026-08-29). Kampanjen rörs aldrig.
6. Proxy-omstart (`NODE_USE_ENV_PROXY=1`), 1,5 s mellan anrop, backoff 5–60 s
   på fel 17, retry runt `advideos`/`adimages`. Sekventiellt, aldrig parallellt
   mot samma konto. Idempotent på annonsnamn.
7. Tillbakaläsning: annonsen finns, rätt adset, rätt status, rätt konto.

### Fas 4 — Notion + Discord + logg

1. Notion-raden (`tools/notion-aterkoppling.mjs`, utbyggd med
   `--egenskap "Translated url"=<url>`): kommentar
   `NO ✅ MCtrekk_NO_RE_2_1 i "MC-Trekk NO" (adset RE), ad <id>`, `Translated url`
   = Meta-länken till annonsen. **Status → `Translation in review`** när raden
   är klar i alla aktiva marknader (i dag: efter NO). När en andra marknad slås
   på läggs ett multi-select-fält `Klar i marknad` [NO, DK, FI, UK] till i
   hubbarna som rutinen bockar per marknad; statusen byts först när alla aktiva
   är bockade. Ingen kod flyttar någonsin till `Approved` — det är Axels
   granskning (och commission-grunden) och lämnas orörd.
   Bild som inte gick att översätta: kommentar på raden, status oförändrad,
   listas i briefen.
2. Discord-brief i marknadens kanal (`pipeline/discord-brief.mjs --konfig=<land>/discord.json`;
   NO: `#translation-till-norge-av-nya-produkter`, ping Axel + ECOM CHADKING) i
   Axels läsformat — även när inget kördes. Problem → marknadens problemkanal
   (`#problems-no`).
3. Körlogg: ny rad i `docs/video-localization.md` (video) och i
   `market-expansion/<land>/STATUS.md`. Committa + pusha. **Aldrig `git add -A`**
   i batchmappar (`up/`, `render/`, `final/*.mp4` är gitignorerade, men
   2026-09-03-mappen har ändå 15 mp4 committade — städas i byggsessionen).

---

## Marknadsparametrar — så duplicerar man till DK/FI/UK

`market-expansion/marknader.json` (ny, EN fil, allt marknadsspecifikt):

```json
{
  "NO": {
    "aktiv": true,
    "namn": "Norge",
    "kod": "NO",
    "act": "1050941584152547",
    "page": "879054088633562",
    "pixel": "1554276343018184",
    "land": "NO",
    "valuta": "NOK",
    "butik": "https://beverbutikken.no",
    "shopify_env": "NO",
    "heygen_sprak": "Norwegian Bokmål (Norway)",
    "sprak": "norsk bokmål",
    "fri_frakt_fran": 300,
    "tull_eur": 0,
    "dsa": null,
    "status": "ACTIVE",
    "produkter": "market-expansion/no/produkter.json",
    "discord": "market-expansion/no/discord.json"
  },
  "DK": { "aktiv": false, "kod": "DK", "act": "915422744950975", "heygen_sprak": "Danish (Denmark)", "tull_eur": 2.9, "dsa": { "beneficiary": "…", "payor": "…" }, "...": "fylls i när butiken är klar" },
  "FI": { "aktiv": false, "kod": "FI", "act": "1619718346388201", "heygen_sprak": "Finnish (Finland)", "tull_eur": 2.9 },
  "UK": { "aktiv": false, "kod": "UK", "act": "1107817401910319", "heygen_sprak": "English (UK)" }
}
```

(Konto-id:n för DK/FI/UK står i `commission/berakning.mjs`; sida, pixel, butik
och priser verifieras när marknaden slås på.)

Att slå på en ny marknad = (1) fyll i blocket, (2) skapa
`market-expansion/<land>/produkter.json` med prefix-kopplingarna, (3) skapa
`<land>/discord.json`, (4) `aktiv: true`. Ingen kod ändras. Allt som är
"norskt" i dag — `--lang`, titelprefixet `NO_`, `_NO_` i annonsnamn,
captions-stilen, discord-sökvägen, kanalerna — läses ur blocket.

`market-expansion/no/produkter.json` seedas i byggsessionen ur NO-kontot
(kampanjnamn, adsets `<X> NO - <K>`, annonsprefix `<X>_NO_`) och verifieras mot
SE-kontots kampanjnamn. Nya produkter: rutinen larmar i problemkanalen tills
raden finns. Listan är en **koppling**, inte en produktlista — rutinen läser
fortfarande hela Notion-kön dynamiskt.

---

## Återanvänds rakt av / byggs nytt

| Återanvänds (rörs inte, eller får en parameter) | Byggs |
|---|---|
| `pipeline/heygen.mjs`, `translate-batch.mjs` (får `--marknad`), `localize.mjs` | `.claude/commands/oversatt.md` — rutinen |
| `pipeline/no-captions.py` + `cover-srt.py` (captions-standarden) | `tools/oversattningskon.mjs` — kön, SE-uppslag, koppling, fyra utfall, dubblettspärr, kvotkalkyl, batch.json + adcopy |
| `bildannonser/kie.mjs` (Kie-klienten, `image_urls`), `bildannonser/text.py` (STILAR/fonter) | `pipeline/oversatt-bild.py` — formmätning + PIL, Kie som reserv |
| `tools/notion-kalla.mjs` (status + Typ blir parametrar), `notion-fil.mjs`, `notion-klara.mjs --brief` | `tools/meta-lib.mjs` — utbrutet ur `notion-till-meta.mjs` |
| `tools/notion-aterkoppling.mjs` (får `--egenskap`) | `tools/notion-till-marknad.mjs` — upp i befintlig kampanj/adset i målkontot, spärrar |
| `pipeline/discord-brief.mjs` (får `--konfig`) + `no/discord.json` | `market-expansion/marknader.json` + `no/produkter.json` |
| `tools/shopify-fix-compareat.mjs --market`, prispolicy, lokaliseringschecklista ur `/translate-no` | Generisk `verify-srt` med marknadstabell |
| Fyra-utfallslogiken + spend-läsningen ur `leveranskon.mjs` | Körlogg-rad + `STATUS.md`-uppdatering |

---

## Regler som rutinen ärver (och aldrig bryter)

- **Rendera aldrig före proofread.** Proofread → lokalisera → verifiera → rendera.
- **Skanna alltid källvideon efter inbränd svensk text.** Captions bara där text fanns.
- **PAUSED är ett beslut.** Ingen kampanj, adset eller annons med spend > 0
  ändrar status. Rutinen aktiverar bara det den själv skapat.
- **Fel konto = avbryt.** Kampanjens `account_id` måste vara marknadens konto.
- **Bygg aldrig en kampanj i den här rutinen.** Saknas NO-kampanj: rapportera.
- **Hitta aldrig på pris eller kostnad.** Pris ur butiken vid varje körning.
- **Modellpolicyn.** All norsk copy/SRT/bildtext skrivs av sonnet-subagent med
  copy-reglerna; strategi och QA i huvudsessionen.
- **Namngivning.** Marknadskod i annonsnamnet, vinkel/nummer speglar SE.
- **Ingen rad hoppas tyst.** Allt som inte kördes står i briefen med skäl.
- **Notion-bilagans signerade URL** hämtas vid körning, cachas aldrig.
- **Aldrig `git add -A`** — leveransfiler hålls utanför repot.

---

## Rutinen (Routine på claude.ai)

| Fält | Värde |
|---|---|
| Kommando | `/oversatt` (alla aktiva marknader) |
| Tid | 15:00 svensk tid = `0 13 * * *` (CEST). Efter `/notionkorning` 13:20 så dagens SE-launcher hinner med. Vinter: `0 14 * * *`. |
| Connectors | Inga krävs. Allt går via env-nycklar (REST), så rutinen är klickfri och inget MCP-godkännande kan stoppa den. |
| Env | `META_ACCESS_TOKEN`, `HEYGEN_API_KEY`, `KIE_API_KEY`, `DISCORD_BOT_TOKEN` finns. **`NOTION_TOKEN` saknas** i environmentet 2026-09-03 och krävs (kön, bilagan, kommentar + status går via REST). |
| Steg 0 i rutinen | `pip install numpy pillow imageio-ffmpeg` · `node pipeline/localize.mjs check` · Kie-saldo |
| Klonar | `main` — kommandofilen måste vara mergad till `main` innan rutinen fungerar |

---

## Det Axel behöver göra (en sak, inget annat)

1. **Fyll på HeyGen-krediter.** 621 räcker till ~12 videor. Bildkön (45) går
   utan HeyGen. Axels besked 2026-09-03: wallet har ≥ 250 USD att köpa
   krediter för — köpet görs i HeyGens webbgränssnitt, API:t kan inte köpa.

`NOTION_TOKEN`: Axels besked 2026-09-03 är att nyckeln redan är kopplad
överallt (rutinernas environment). Den saknades bara i just den här sessionens
container. Byggsessionen kontrollerar med `node tools/notion-kalla.mjs --hubbar`
innan den drar någon slutsats.

## Beslut planen tar åt Axel (säg till om något ska ändras)

- **Bilder får läggas i en befintlig aktiv NO-kampanj.** Regeln "inga videor =
  ingen launch" (2026-09-03, Medisinboks) gäller att **starta** en kampanj på
  bara bilder. Alla fem kampanjerna i dagens kö har redan 12 videor var.
- **Nya vinklar i NO-kampanjen** (RE, GA, OF, DE, OB, LI, CO, RI, SO, REV, BF,
  TR, RV — NO har bara CS/G/PD/SP): **ett adset per vinkel** i den befintliga
  CBO:n, klonat ur ett syskonadset — samma struktur som SE (`RE | Notionrunda …`)
  och NO redan har.
- **Status ACTIVE direkt** för NO (Axels beslut 2026-08-29 för hela NO-flödet).
- **Egen copy per annons** (översatt ur SE-annonsen), inte adsetets gamla copy.
- **Raden flyttas till `Translation in review`** när alla aktiva marknader är
  klara (i dag: efter NO); `Translated url` + kommentar sätts per marknad. Fler
  marknader → multi-select `Klar i marknad`. `Approved` rörs aldrig.
- **Saknas NO-kampanj:** rapportera, bygg aldrig. Produkter som bara finns i
  Notion + SE-kontot (utan Drive-mapp i LAUNCHED) blir inte kandidater i
  `/translate-no` heller — de listas i briefen tills Axel bestämmer.
- **Kampanjer som är PAUSED med spend** får inga nya annonser, raden rapporteras
  som "väntar" och ligger kvar i kön.

---

## Byggordning (nästa session)

1. `marknader.json` + `no/produkter.json` (seed ur NO-kontot, verifiera mot SE-kontots kampanjer).
2. `tools/meta-lib.mjs` ur `notion-till-meta.mjs` (api/alla/spend/uppladdning/adset-klon/aktivering) — `npm test` grönt.
3. `tools/oversattningskon.mjs --dry` på hela kön: 45 rader → SE-annons → NO-kampanj/adset → målnamn → kör/hoppa. Inga tysta hopp.
4. `pipeline/oversatt-bild.py` — testa på 3 bilder ur kön (formmätning + PIL), QA-bilder i chatten. Kie-reserven testad på EN bild med Notion-URL och `adimages.url`.
5. `tools/notion-till-marknad.mjs --dry` mot NO-kontot, sedan EN skarp bild, tillbakaläsning.
6. Videovägen: `translate-batch.mjs --marknad`, `up/`-hämtning ur Meta SE, tal-lös-detektion, `download --max-min`, generisk verify-srt. Rätta tumregeln "~1 kredit/min" i `translate-batch.mjs:84` och `translate-no.md` till ~80/min. (Testas skarpt när kön har en video och kvoten är påfylld.)
7. `notion-aterkoppling.mjs --egenskap`, `discord-brief.mjs --konfig`.
8. `.claude/commands/oversatt.md` med faserna ovan + Definition of done.
9. Första skarpa körningen på hela bildkön (45), brief i Discord, Notion uppdaterat.
10. Städa de 15 committade mp4:orna i `video-batches/2026-09-03`, merge till `main`, Routine 15:00.

## Definition of done (rutinen)

- [ ] Hela kön läst ur alla creative hubs (inkl. arkiverade), filtrerad på Typ (inkludering)
- [ ] Varje rad: SE-annons hittad exakt i SE-kontot, koppling till marknadens kampanj verifierad i kontot, fyra utfall tillämpade, inget tyst hopp
- [ ] Dubblettspärr på annonsnamn i målkontot körd (kontot läst en gång)
- [ ] Pris + jämförpris ur marknadens butik vid körning; prispolicyn tillämpad
- [ ] Copy/SRT/bildtext av sonnet-subagent per annons, tre-frågorstestet redovisat, claims verifierade
- [ ] Bild: formerna mätta, svensk text borta utan spår, norsk text i samma ruta, QA per bild
- [ ] Video: kvotkalkyl före proofread, proofread före render, tal-lösa videor orenderade, captions bara över inbränd text, QA-bilder + slutkortssvep
- [ ] Upp i rätt kampanj/adset/konto, K ur SE-namnet, rätt namn, OPT_OUT + inline_comment OPT_IN, status enligt marknad, tillbakaläst
- [ ] Notion: kommentar + `Translated url`; `Translation in review` när alla aktiva marknader är klara
- [ ] Discord-brief i marknadens kanal i Axels läsformat, även vid tom kö; problem i problemkanalen
- [ ] Kvot/saldo före → efter rapporterat; kön listad
- [ ] Körlogg + STATUS uppdaterade, committat och pushat utan leveransfiler

## Rutinen i drift (2026-09-04)

- Fast session: `session_01KFNtDdxzve3tvz84AViU28` (källa `Axel3738/yognftnfgn@main`, utgren `main`).
- Trigger: `trig_014ZMp7iEhxusDgJaYzMRyEu`, cron `0 13 * * *` (15:00 CEST), `persistent_session_id` → sessionen ovan.
- Första försöket (`create_trigger` med ny session varje gång) startade 2026-09-04 13:15 UTC i en tom container utan repo och raderades. Se varningen i CLAUDE.md under "Nattrutinerna".
- Varje körning börjar med `git fetch origin main && git checkout main && git reset --hard origin/main` — sessionen lever kvar mellan dagarna, så trädet måste synkas innan kommandot läses.
