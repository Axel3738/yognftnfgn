# /ops-oversatt – Norge för EN OPS-butik (15:40 varje dag)

Argument: `$ARGUMENTS` — butikens nyckel i OPS-registret. `--torr` = allt
utom rendering och uppladdning.

```
/ops-oversatt hemvakten
```

CONNECTORS: inga. Nycklar: `NOTION_TOKEN`, `META_ACCESS_TOKEN`,
`HEYGEN_API_KEY`, `KIE_API_KEY` (reserv för bildtext), `DISCORD_BOT_TOKEN`.
Använd ALDRIG `mcp__Notion__*` eller Higgsfield-MCP:n — bilderna översätts
med `pipeline/oversatt-bild.py` (0 krediter), videor med HeyGen via
`pipeline/translate-batch.mjs`.

**Vad rutinen gör:** tar raderna i **SE-ACTIVE to be translated** i butikens
hub (dit `/ops-leverans` lade dem), översätter till norska, laddar upp
**LIVE** i butikens **NO-kampanj** (`<PREFIX>_NO_…`, SAMMA konto
`915422744950975`, ett adset per koncept) och flyttar raden till
**Approved** — samma slutstatus som Bäverbutikens Norge-flöde (Axels beslut
2026-09-05: går annonsen live står raden som Approved). Detta är
`/oversatt NO` pekad mot OPS (Axels beslut 2026-09-11). Byggs av
`/notionscalercs setup <butik>`.

## Järnregler (samma som `/oversatt` — läs den filen, den är facit för fas 3–4)

1. **Rendera aldrig före proofread.** Rendering drar HeyGen-credits.
2. **Skanna källvideon efter inbränd svensk text** — HeyGen översätter bara ljudet.
3. **`python3 pipeline/rostkoll.py` på varje renderad video.** ❌ laddas inte upp.
4. **Norska priser finns inte — utom där produktfilen säger annat.** Har
   `factory/produkter/<id>.yaml` fältet `no_pris_nok` (AdventLane: 439 / 579 NOK,
   Axels besked ur Shopify 2026-09-12) är DET priset facit för all norsk copy,
   dubb och captions — aldrig SEK-talet. Saknas fältet gäller resten av punkten:
   OPS-butikerna tar SEK-pris även på `/nb`
   (`factory/butiker/*.yaml`, NOK ej påslaget). Norsk copy skrivs **utan
   pris**, precis som TankGuards NO-kampanj. En SE-bild med inbränt pris
   översätts med priset kvar i SEK och "kr" — aldrig ett påhittat NOK-pris.
5. **Rätt kampanj.** `_NO_` i namnet, NO-kampanjen i kontot. Uppladdaren
   stoppar allt annat.
6. **Discord på engelska** i butikens server, kanal `#annons-uppladdning`.
   Axel pingas bara under `🔴 ACTION NEEDED`.

## Gör i ordning

Färsk `main`; `IDAG` som i `/ops-leverans`. Batchmapp:
`market-expansion/ops/<butik>/<IDAG>/` — media (mp4, jpg, png, srt) är
gitignorerat där, JSON-filerna committas.

### 1. Kön
```
node tools/ops-leveranskon.mjs <nyckel> --marknad NO --status "SE-ACTIVE to be translated" --json --ut <batch>/se > <batch>/jobb.json
```
Kräver exakt en ACTIVE NO-kampanj. Saknas den: rapportera "no NO campaign
— run /ny-annonser <butik>" under ACTION NEEDED, rör inget, avsluta med DoD.
Raden bär `mal_namn` (`HeimGuard_SP_2_1` → `HeimGuard_NO_SP_2_1`), typ,
fil (`--ut` hämtade den ur Notion) och `finns_i_meta` (redan uppe i NO ⇒
bara statusflytt).

### 2. Texterna
Sonnet-subagent (Agent `model: "sonnet"` eller `tools/copy-agent.mjs`)
läser varje SE-bilds texter (`python3 pipeline/oversatt-bild.py --in <se.jpg> --analys`)
och briefens COPY CARD, och skriver bokmål: bildtexter rad för rad (samma
antal rader), primary text, headline, description — **utan pris** (regel 4).
Spara `<batch>/oversatt-output.json` och `<batch>/adcopy-NO.json`
(`{ "<mal_namn>": {message, headline, description} }`).

### 3. Bilder — exakt `/oversatt` Fas 3
`python3 pipeline/oversatt-batch.py --batch <batch> [--bara <namn>]`, läs
varje `<mal_namn>.jpg.qa.png`, rätta `overrides.json` vid MISMATCH. Aldrig
leverera en bild med fel.

### 4. Video — exakt `/oversatt` Fas 4
Proofread → SRT lokaliseras av subagenten (samma blockantal/timecodes) →
apply → render → download → `no-precis.py`/`no-captions.py` bara om källan
har inbränd text → `rostkoll.py`. Tom `.orig.srt` = inget tal = ingen render.

### 5. Uppladdning — live i NO-kampanjen
```
node tools/ops-till-meta.mjs <nyckel> --marknad NO --namn <mal_namn> --fil <batch>/no/<fil> --primar "<message>" --rubrik "<headline>" [--beskrivning "<text>"] --torr
node tools/ops-till-meta.mjs <nyckel> --marknad NO --namn <mal_namn> --fil <batch>/no/<fil> --primar "<message>" --rubrik "<headline>" [--beskrivning "<text>"] --json
```
Länken ärvs ur NO-kampanjens befintliga annonser (`/nb`-sidan). Tillbakaläs
ACTIVE/ACTIVE.

### 6. Notion
```
node tools/notion-aterkoppling.mjs <page-id> --kommentar "NO ✅ <mal_namn> live in <kampanj> (adset <KONCEPT>), ad <id>" --egenskap "Translated url=https://www.facebook.com/adsmanager/manage/ads?act=915422744950975&selected_ad_ids=<id>" --status Approved
```
Saknar hubben fältet `Translated url` avbryter verktyget — kör då om utan
`--egenskap` och skriv länken i kommentaren. Hoppad rad: kommentar med
skälet, status orörd. ⚠️ Känd lucka: den norska filen läggs inte in i
Notion-sidan (REST-uppladdning av filer är inte byggd) — säg det i
rapporten så Axel granskar i Ads Manager.

### 7. Rapport, logg, push
Discord-jobb (läge `oversatt`): `gjort` = en rad per annons (SE-namn →
NO-namn, kampanj, adset), `varningar` = röstkoll-anmärkningar och hoppade
rader med skäl, `action_axel` = det som kräver honom. HeyGen-saldo före →
efter i `gjort`. `node tools/discord-rapport.mjs --jobb <fil>`.
Committa `<batch>/jobb.json`, `oversatt-output.json`, `adcopy-NO.json`,
`overrides.json` — aldrig media. Rad i `products/<butik>/batch-log.md`.
Pusha till `main`.

## DEFINITION OF DONE

- [ ] Färsk `main`; NO-kampanjen hittad (exakt en ACTIVE) eller stoppet redovisat
- [ ] Varje rad i kön redovisad: översatt + uppladdad / hoppad med skäl / redan uppe
- [ ] Bilder: QA-bild läst per bild, inget svenskt kvar, siffror rätt
- [ ] Video: proofread före render, källvideo skannad efter inbränd text, röstkoll grön
- [ ] Norsk copy utan pris; inget påhittat NOK-pris någonstans
- [ ] Uppladdning torrkörd först, skarp sedan, tillbakaläst ACTIVE/ACTIVE; ett adset per koncept
- [ ] Rader flyttade till `Approved` med kommentar (+ Translated url när fältet finns)
- [ ] Discord-rapport på engelska i `#annons-uppladdning`; ping bara under ACTION NEEDED
- [ ] Batchfiler committade (aldrig media), batch-log, push till `main`
- [ ] Slutrapport i två listor; Axels uppgifter sist, numrerade
