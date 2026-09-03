# `/oversatt <LAND>` — Notion-kön → översätt → launch i marknadens kampanj

**Status: PLAN (2026-09-03). Inget är byggt än.** Det här dokumentet är
underlaget för byggsessionen och blir sedan processdokumentationen för rutinen.

---

## Vad rutinen gör (tioåringsversionen)

Varje dag gör redigerarna nya svenska annonser. De laddas upp i Sverige av
`/notionkorning`, som sen lägger raden i Notion-hyllan **"SE-ACTIVE to be
translated"** — kön av annonser som väntar på att bli norska.

Den nya rutinen är en robot som varje dag:

1. Tittar på hyllan och plockar alla annonser som ligger där.
2. Kollar vilken produkt annonsen hör till och hittar produktens norska kampanj.
3. Gör annonsen norsk. Video: rösten dubbas till norska och all svensk text i
   bilden byts mot norsk. Bild: den svenska texten suddas bort och norsk text
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
| Fördelning | MC-Kapell 11 · Båtmotor 12 · Beltgrinder 8 · Kranskydd 8 · Övervakningskamera 6 | Alla fem har en NO-kampanj i kontot |
| `Magiborsten NO` (`act_1050941584152547`) | 24 kampanjer, valuta **SEK**, tidszon Oslo, 15 ACTIVE / 9 PAUSED | Kampanj finns → annonsen läggs till, ingen ny kampanj byggs |
| PAUSED med budget | Motorhöljet NO, Axelbältet NO, Sätesöverdraget NO, Strandtofflorna NO, Tofflorna NO, Fiskespöhållaren NO, Sykkelshorts NO, Gamasjer NO, Kjempefotball NO, Medisinboks NO | Dit laddar rutinen **aldrig** upp (PAUSED är ett beslut) — raden rapporteras som "väntar" |
| NO-annonsernas form (MC-Trekk NO) | adset `MC-Trekk NO - <K>`, annons `MCtrekk_NO_<K>_<n>` (video) / `MCtrekk_NO_<K>_2_1` (bild), page `879054088633562`, geo NO, länk beverbutikken.no, alla enhancements OPT_OUT, allt ACTIVE | Facit för hur nya annonser ska se ut |
| SE-källan (`MC-Kapell_RE_2_1`) | Finns i MagiBorsten SE, adset `RE \| Notionrunda 2026-09-02`, copy + rubrik + länk i creativen | Copy och länk hämtas ur SE-kontot, inte ur Notion |
| HeyGen api-kvot | **621 krediter** (~1/videominut, ~30/video) | Räcker till ~20 videor. Kön har 0 videor i dag, men Axel bör fylla på innan videor dyker upp |
| Kie.ai | 16 593 krediter, `KIE_API_KEY` satt | Bildmotorn är klar att köra |
| Meta | `META_ACCESS_TOKEN` når både SE och NO | ✅ |
| Notion | MCP finns i sessionen; `NOTION_TOKEN` saknas i env | Rutinen måste få Notion-connectorn kopplad ELLER `NOTION_TOKEN` (se "Rutinen") |
| Discord | `DISCORD_BOT_TOKEN` satt, kanaler i `market-expansion/no/discord.json` | ✅ `pipeline/discord-brief.mjs` fungerar |
| Notion-statusar i hubbarna | `SE-ACTIVE to be translated`, `To be translated`, `Translation in review`, `Translation archived` finns; fältet **`Translated url`** finns | Färdig översättning = `Translation in review` + `Translated url` ifylld |
| ⚠️ De fyra arkiverade skalningshubbarna (Beach crocs, Mower seat, Trimmer belt, Boat cover 420D) | Saknar statusen `SE-ACTIVE to be translated` | `/notionkorning` kan inte lägga deras rader i kön. Deras NO-kampanjer är dessutom PAUSED. Inget att bygga för nu — men Axel bör veta |

Alla tal ovan är mätta i sessionen 2026-09-03, inte hämtade ur minnet.

---

## Flödet, fas för fas

Rutinen heter `/oversatt <LAND>` (`.claude/commands/oversatt.md`). Utan argument:
alla marknader med `aktiv: true` i `market-expansion/marknader.json` (i dag bara NO).

### Fas 0 — Inventera (gratis, alltid komplett)

1. **Läs kön.** Alla databaser vars titel slutar på `creative hub` i teamspacet
   Bäverbutiken (inkl. arkiverade), rader med `Status = SE-ACTIVE to be translated`
   och fil i `Filer och media`. Filtrera på **inkludering**: `Typ` ∈
   {`Video - Pending Approval`, `Image - Pending Approval`}.
2. **Hitta SE-annonsen.** Slå upp radens `Namn` exakt i MagiBorsten SE
   (`act_1867947880635861`). Därifrån: primärtext, rubrik, beskrivning, länk,
   annons-id. Finns den inte → raden är inte launchad i Sverige än → hoppa,
   rapportera ("inte uppe i Sverige").
3. **Koppla till marknadens kampanj.** Prefixet i namnet (`MC-Kapell`) slås upp i
   `market-expansion/<land>/produkter.json`:
   ```json
   { "MC-Kapell": { "prefix": "MCtrekk", "kampanj": "MC-Trekk NO", "campaign_id": "120252050710680233",
                    "link": "https://beverbutikken.no/products/mc-trekk-220-120-regn-stov-uv" } }
   ```
   Saknas prefixet → problemmeddelande i marknadens problemkanal
   ("⚠️ MC-Kapell saknar norsk koppling. Lägg till raden i produktlistan."),
   hoppa. Kampanjen verifieras **i kontot** varje körning: finns den, är den
   ACTIVE? PAUSED med spend → hoppa + rapportera "väntar, kampanjen är pausad".
   Aldrig aktivera något.
4. **Dubblettspärr:** målannonsnamnet (`MCtrekk_NO_RE_2_1`) finns redan i
   målkontot → klar sedan tidigare, hoppa tyst. Kontot är facit, ingen egen
   statusfil.
5. **Pris i marknaden.** Produktens sida i marknadens butik
   (`https://beverbutikken.no/products.json`, paginerat) → pris + jämförpris.
   Saknas produkten → hoppa + problemmeddelande. Prispolicyn från `/translate-no`
   gäller: säger annonsen "40 %" måste jämförpriset i butiken bära det — höj
   jämförpriset, ändra aldrig claimen.
6. **Kvot.** Video i kön → `node pipeline/localize.mjs check`; räcker inte
   `details.api` → videoraderna väntar, bildraderna körs ändå. Kie-saldo kollas
   (`/api/v1/chat/credit`).
7. **Max per körning:** 40 bilder + 12 videor, äldst först. Resten listas som kö
   i briefen.

### Fas 1 — Copy (sonnet-subagent, modellpolicyn)

En subagent per produkt får: SE-copyn ur kontot (primärtext/rubrik/beskrivning),
marknadens pris + jämförpris, butiksdomän, fraktregel (NO: fri frakt bara ≥ 300 kr),
`docs/copy-regler.md` och lokaliseringschecklistan i `docs/video-localization.md`.
Den levererar norsk primärtext/rubrik/beskrivning **och** de norska
ersättningstexterna för bild/caption, med tre-frågorstestet redovisat.
Huvudsessionen verifierar varje claim mot butiken (pris, rabatt, frakt, "30
dagers åpent kjøp") innan något renderas.

Adset-copyn: en ny annons i ett **befintligt** adset (`MC-Trekk NO - PD`) får
sin egen översatta copy (samma som SE-annonsen hade, på norska) — inte
adsetets gamla copy. Så bär varje annons sin egen vinkel, precis som i SE.

### Fas 2 — Media

**Bild** (`pipeline/oversatt-bild.py`, samma teknik som `/translate-no` Fas 3.2):
1. Hämta Notion-bilagan (signerad URL, kortlivad — hämta vid körning, cacha aldrig).
   Läs bilden och inventera all svensk text (Claude läser bilden).
2. **Kie** `google/nano-banana-edit`: "Remove ALL text, letters and numbers …
   keep buttons as empty shapes, keep the cartoon faces/product exactly". Input är
   `image_urls` = en publik URL. Notions signerade URL är publik i ~1 h —
   räcker för Kie. Faller det: ladda upp bilden till Drive via
   `pipeline/drive-push.mjs` och ge Kie den länken.
3. **Textytor mäts, inte gissas:** diffa originalet mot Kie-plattan → mask →
   sammanhängande rutor = exakt där den svenska texten satt. Textfärg samplas ur
   originalets textpixlar. Ingen handmätning per bild — det är det som gör att
   det går att köra som rutin.
4. **PIL** ritar den norska texten i samma rutor (LiberationSans-Bold, storlek
   anpassad till rutans höjd, max 2 rader, ✓ ritas med linjer, knappar som
   rounded rectangles). Pris = marknadens pris.
5. QA: läs varje färdig bild. Stavning, siffror, layout, ingen svensk rest.
   Fel → gör om. Aldrig leverera en bild med fel.

**Video** (exakt `/translate-no` Fas 1–2, samma skript):
1. Batchmanifest `market-expansion/<land>/notion-batches/<datum>/batch.json`
   (samma format som `video-batches/`, men källan är Notion-bilagan i stället
   för Drive-id). Committa så fort proofread är klar.
2. `cd pipeline && node translate-batch.mjs proofread --manifest=… --lang="<marknadens HeyGen-språk>"`
3. SRT lokaliseras av sonnet-subagenten (samma blockantal/timecodes), regexgrind
   grön (inga SEK, inga svenska tecken, claims mot butiken).
4. `apply` → `render` → `download` (enda betalsteget, v3-status).
5. Skanna källvideon efter inbränd svensk text; hittas text →
   `python3 pipeline/no-captions.py <render> <fixed.srt> <out>` (Beltesliper-
   stilen: blurrat band + vit ruta, svart fet text, max 2 rader). Läs alla tre
   QA-bilder. Slutkortssvep sista sekunden. Video utan inbränd text får inga
   captions.

### Fas 3 — Launch i marknadens kampanj

`tools/notion-till-marknad.mjs` (byggs på `tools/notion-till-meta.mjs` + `pipeline/no-image-ads.mjs`):

1. Målkonto ur `marknader.json` — **spärr:** kampanjens `account_id` måste vara
   marknadens konto, annars avbryt ("fel annonskonto kostar riktiga pengar").
2. Adset = `<Kampanjprefix> - <K>` där K är vinkeln ur SE-namnet (`RE`). Finns
   det → använd. Finns det inte (nya SE-vinklar som RE/GA/OF/DE/OB/LI/CO/RI/SO/REV/BF/TR/RV
   saknas i NO-kampanjerna som bara har CS/G/PD/SP) → skapa adsetet som en
   klon av ett syskonadset (samma targeting, geo, optimering, pixel), status
   enligt marknadens beslut.
3. Annonsnamn: `<NOprefix>_NO_<K>_<nr>_1` (bild) / `<NOprefix>_NO_<K>_<nr>_H<h>`
   (video) — speglar SE-namnet så datan går att skära per vinkel/hook.
   Marknadskoden i namnet gör dessutom att `/commission` filtrerar bort dem
   (endast svenska annonser ger commission).
4. Creative: `link_data + image_hash` resp. `video_data`, norsk copy, marknadens
   länk, page ur `marknader.json`, alla enhancements `OPT_OUT`
   (`degrees_of_freedom_spec` kopieras ur `no-image-ads.mjs`).
5. Status: **ACTIVE** för NO (Axels beslut 2026-08-29 för hela NO-flödet). Andra
   marknader: `status` i `marknader.json`.
6. Rate limit (Meta-fel 17): sekventiellt med paus, aldrig parallellt mot samma
   konto. Idempotent på annonsnamn.
7. Verifiera med tillbakaläsning: annonsen finns, rätt adset, rätt status.

### Fas 4 — Notion + Discord + logg

1. Notion-raden: kommentar `NO ✅ MCtrekk_NO_RE_2_1 i "MC-Trekk NO" (adset RE), ad <id>`,
   `Translated url` = Meta-länken till annonsen. När raden är klar i **alla**
   aktiva marknader → `Status = Translation in review`. Fler marknader senare:
   raden ligger kvar i kön tills alla är klara; dubblettspärren i respektive
   konto gör att inget görs två gånger.
   Bild som inte gick att översätta (t.ex. text på ett ställe Kie förstör):
   kommentar på raden, status oförändrad, listas i briefen.
2. Discord-brief i marknadens kanal (NO: `#translation-till-norge-av-nya-produkter`,
   ping Axel + ECOM CHADKING) i Axels läsformat — även när inget kördes.
   Problem → marknadens problemkanal (`#problems-no`).
3. Körlogg: ny rad i `docs/video-localization.md` (video) och i
   `market-expansion/<land>/STATUS.md`. Committa + pusha.

---

## Marknadsparametrar — så duplicerar man till DK/FI/UK

`market-expansion/marknader.json` (ny, EN fil, rutinen läser den):

```json
{
  "NO": {
    "aktiv": true,
    "namn": "Norge",
    "act": "act_1050941584152547",
    "page": "879054088633562",
    "pixel": "1554276343018184",
    "land": "NO",
    "valuta": "NOK",
    "butik": "https://beverbutikken.no",
    "shopify_env": "SHOPIFY_SHOP_NO",
    "heygen_sprak": "Norwegian Bokmål (Norway)",
    "sprak": "norsk bokmål",
    "fri_frakt_fran": 300,
    "tull_eur": 0,
    "status": "ACTIVE",
    "produkter": "market-expansion/no/produkter.json",
    "discord": "market-expansion/no/discord.json"
  },
  "DK": { "aktiv": false, "heygen_sprak": "Danish (Denmark)", "tull_eur": 2.9, "...": "fylls i när butiken + kontot finns" },
  "FI": { "aktiv": false, "heygen_sprak": "Finnish (Finland)", "tull_eur": 2.9 },
  "UK": { "aktiv": false, "heygen_sprak": "English (UK)" }
}
```

Att slå på en ny marknad = (1) fyll i blocket, (2) skapa
`market-expansion/<land>/produkter.json` med prefix-kopplingarna, (3) skapa
`<land>/discord.json`, (4) `aktiv: true`. Ingen kod ändras. Allt som är
"norskt" i dag (`translate-batch.mjs --lang`, `no-captions.py`-stilen,
`NO_`-prefixet, kanalerna) läses ur blocket.

`market-expansion/no/produkter.json` seedas i byggsessionen ur NO-kontot +
vågkonfigarna (`pipeline/waves/no-*.config.mjs`) och verifieras mot SE-kontots
kampanjnamn. Nya produkter: rutinen larmar i problemkanalen tills raden finns.
Listan är en **koppling**, inte en produktlista — rutinen läser fortfarande hela
Notion-kön dynamiskt.

---

## Återanvänds rakt av / byggs nytt

| Återanvänds (rörs inte) | Byggs |
|---|---|
| `pipeline/translate-batch.mjs`, `localize.mjs`, `heygen.mjs` (HeyGen) | `.claude/commands/oversatt.md` — rutinen |
| `pipeline/no-captions.py` (captions-standarden) | `tools/oversattningskon.mjs` — läser kön, SE-uppslag, koppling, dubblettspärr, skriver jobbfil |
| `bildannonser/kie.mjs` (Kie-klienten, `image_urls`) | `pipeline/oversatt-bild.py` — Kie-rensning + diff-mätning + PIL |
| `tools/notion-fil.mjs` (bilaga → fil) | `tools/notion-till-marknad.mjs` — upp i befintlig kampanj/adset i målkontot, spärrar |
| `tools/notion-aterkoppling.mjs` (kommentar/status) | `market-expansion/marknader.json` + `no/produkter.json` |
| `pipeline/discord-brief.mjs` + `no/discord.json` | Körlogg-rad + `STATUS.md`-uppdatering |
| Prispolicy, BE-ROAS-logik, lokaliseringschecklista ur `/translate-no` | — |

---

## Regler som rutinen ärver (och aldrig bryter)

- **Rendera aldrig före proofread.** Proofread → lokalisera → verifiera → rendera.
- **Skanna alltid källvideon efter inbränd svensk text.** Captions bara där text fanns.
- **PAUSED är ett beslut.** Ingen kampanj, adset eller annons med spend > 0
  ändrar status. Rutinen aktiverar bara det den själv skapat.
- **Fel konto = avbryt.** Kampanjens `account_id` måste vara marknadens konto.
- **Hitta aldrig på pris eller kostnad.** Pris ur butiken vid varje körning.
- **Modellpolicyn.** All norsk copy/SRT/bildtext skrivs av sonnet-subagent med
  copy-reglerna; strategi och QA i huvudsessionen.
- **Namngivning.** Marknadskod i annonsnamnet, vinkel/nummer speglar SE.
- **Notion-bilagan är enda kopian.** Hämta vid körning, cacha aldrig signerade URL:er.
- **Aldrig `git add -A`** — leveransfiler hålls utanför repot (`deliver/` gitignorerad).

---

## Rutinen (Routine på claude.ai)

| Fält | Värde |
|---|---|
| Kommando | `/oversatt` (alla aktiva marknader) |
| Tid | 15:00 svensk tid = `0 13 * * *` (CEST). Efter `/notionkorning` 13:20 så dagens SE-launcher hinner med. Vinter: `0 14 * * *`. |
| Connectors | **Notion** måste kopplas på rutinen (eller `NOTION_TOKEN` i env — då går allt via REST utan MCP). Meta, HeyGen, Kie, Discord går via env-nycklar. |
| Env | `META_ACCESS_TOKEN`, `HEYGEN_API_KEY`, `KIE_API_KEY`, `DISCORD_BOT_TOKEN`, `NOTION_TOKEN` (rekommenderas) |
| Klonar | `main` — kommandofilen måste vara mergad till `main` innan rutinen fungerar |

---

## Frågor som avgör bygget (Axel)

1. **Nya vinklar i NO-kampanjen.** SE har nu vinklar (RE, GA, OF, DE …) som
   NO-kampanjerna saknar. Plan: skapa adsetet automatiskt i CBO:n. Alternativ:
   lägg alla nya i ett enda adset "NO - Notion". Planen väljer **eget adset per
   vinkel** (samma struktur som SE och NO redan har).
2. **HeyGen-kvoten är 621.** Fyll på innan videor hamnar i kön.

---

## Byggordning (nästa session)

1. `marknader.json` + `no/produkter.json` (seed ur kontot, verifiera mot SE).
2. `tools/oversattningskon.mjs` — `--dry` visar kön: rad → SE-annons → NO-kampanj/adset → målnamn → hoppa/kör.
3. `pipeline/oversatt-bild.py` — testa på 3 bilder ur kön (Kie + diff + PIL), QA i chatten.
4. `tools/notion-till-marknad.mjs` — `--dry` mot NO-kontot, sedan EN skarp bild, tillbakaläsning.
5. Videovägen: koppla `translate-batch.mjs` till Notion-källa + `--lang` ur marknadsblocket (testas när kön har en video och kvoten är påfylld).
6. `.claude/commands/oversatt.md` med faserna ovan + Definition of done.
7. Första skarpa körningen på hela bildkön (45), brief i Discord, Notion uppdaterat.
8. Merge till `main`, Routine 15:00 med Notion-connectorn kopplad.

## Definition of done (rutinen)

- [ ] Hela kön läst ur alla creative hubs (inkl. arkiverade), filtrerad på Typ (inkludering)
- [ ] Varje rad: SE-annons hittad, koppling till marknadens kampanj verifierad i kontot, PAUSED respekterad
- [ ] Dubblettspärr på annonsnamn i målkontot körd
- [ ] Pris + jämförpris ur marknadens butik vid körning; prispolicyn tillämpad
- [ ] Copy/SRT/bildtext av sonnet-subagent, tre-frågorstestet redovisat, claims verifierade
- [ ] Bild: Kie-rensning, diff-mätta textytor, PIL, QA per bild
- [ ] Video: proofread före render, captions bara över inbränd text, QA-bilder + slutkortssvep
- [ ] Upp i rätt kampanj/adset/konto, rätt namn, enhancements OPT_OUT, status enligt marknad, tillbakaläst
- [ ] Notion: kommentar + `Translated url`; `Translation in review` när alla aktiva marknader är klara
- [ ] Discord-brief i marknadens kanal i Axels läsformat, även vid tom kö; problem i problemkanalen
- [ ] Kvot/saldo före → efter rapporterat; kön listad
- [ ] Körlogg + STATUS uppdaterade, committat och pushat
