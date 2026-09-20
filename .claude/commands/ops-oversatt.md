# /ops-oversatt – Översättning till EN marknad för EN OPS-butik (NO 15:40, US 16:40 varje dag)

Argument: `$ARGUMENTS` — butikens nyckel i OPS-registret, valfritt
`--marknad NO|US` (standard NO). `--torr` = allt utom rendering och uppladdning.

```
/ops-oversatt hemvakten                  # Norge (standard)
/ops-oversatt carashell --marknad US     # USA
```

CONNECTORS: inga. Nycklar: `NOTION_TOKEN`, `META_ACCESS_TOKEN`,
`HEYGEN_API_KEY`, `KIE_API_KEY` (reserv för bildtext), `DISCORD_BOT_TOKEN`.
Använd ALDRIG `mcp__Notion__*` eller Higgsfield-MCP:n — bilderna översätts
med `pipeline/oversatt-bild.py` (0 krediter), videor med HeyGen via
`pipeline/translate-batch.mjs`.

**Vad rutinen gör:** tar raderna i **SE-ACTIVE to be translated** i butikens
hub (dit `/ops-leverans` lade dem), översätter till marknadens språk, laddar
upp **LIVE** i butikens kampanj för marknaden (`<PREFIX>_<KOD>_…`, ett adset
per koncept) och flyttar raden till **Approved** när alla butikens
annonsmarknader bär annonsen. Detta är `/oversatt` pekad mot OPS (Axels
beslut 2026-09-11). Byggs av `/notionscalercs setup <butik>`.

**Marknaden styr allt — läs den ur `factory/opsmarknader.mjs`, aldrig ur minnet:**

| | NO | US |
|---|---|---|
| Konto | MagiBorsten DK `915422744950975` | **Magiborsten UK `1107817401910319`** (Axels beslut 2026-09-16, kontovaluta SEK) |
| Kampanj | `<PREFIX>_NO_…` | `<PREFIX>_US_…` |
| Länk | `/nb/products/<handle>?country=NO` | `/en/products/<handle>?country=US` — ⚠️ har marknaden en EGEN domän i Shopify Markets (CaraShell: `carashell.com`, mätt 2026-09-16 — `.se/en/…?country=US` svarar 301 dit) ska annonsen peka på den domänen direkt (`--lank`), och priskollen läsas där; kön känner inte domänen än (`factory/FAS2.md`, US-rundan för termoskyddet) |
| HeyGen | Norwegian Bokmål (Norway) | English (United States) |
| Språk i copy | bokmål | amerikansk engelska |
| Pris | `ekonomi.marknadspriser` NOK, annars utan pris | `ekonomi.marknadspriser` USD, annars utan pris |
| Tid | 15:40 + 5 min × plats | 16:40 + 5 min × plats |

Kön (`tools/ops-leveranskon.mjs`) skriver ut konto, länk, valuta och
HeyGen-språk för marknaden — använd de fälten, skriv aldrig ett kontonummer
för hand.

## Järnregler (samma som `/oversatt` — läs den filen, den är facit för fas 3–4)

1. **Rendera aldrig före proofread.** Rendering drar HeyGen-credits.
2. **Skanna källvideon efter inbränd svensk text** — HeyGen översätter bara ljudet.
2b. **Slutkortet** (`factory/bildbrand.mjs`, 2026-09-20). Kön granskar de
   sista 3 sekunderna av varje video som ska laddas upp. `slutkort.blockerar`
   ⇒ ladda inte upp raden (slutkortet namnger en butik — ingen omdubbning
   rör BILDEN, varken HeyGen eller ElevenLabs-vägen, så ett svenskt slutkort
   med logga följer med rakt in i marknaden).
   `slutkort-utan-brand` och `okand` laddas upp men **namnges i rapporten**:
   ett slutkort på svenska är fel språk i Danmark även utan butiksnamn.
   Inget som redan är live rörs.
3. **`python3 pipeline/rostkoll.py` på varje renderad video.** ❌ laddas inte upp.
4. **Priset kommer ur produktfilen eller inte alls.** `ekonomi.marknadspriser`
   för marknadens valuta (NOK 1 106 / USD …) är facit för all copy, dubb och
   captions — aldrig SEK-talet, aldrig ett omräknat tal. Saknas raden skrivs
   copyn **utan pris**, och en SE-bild med inbränt pris översätts med priset
   kvar i SEK och "kr" — aldrig ett påhittat pris. (AdventLane 2026-09-12:
   439 / 579 NOK ur Shopify; CaraShell NOK ur `marknadspriser`.)
5. **Rätt kampanj i rätt konto.** Marknadskoden i namnet, marknadens kampanj,
   marknadens konto. Uppladdaren (`tools/ops-till-meta.mjs`) stoppar allt annat.
6. **Discord på engelska** i butikens server, kanal `#annons-uppladdning`,
   med marknadens flagga och rubrik (`jobb.marknad`). Axel pingas bara under
   `🔴 ACTION NEEDED`.
7. **Butiken måste vara redo för marknaden.** Kön läser priset på MARKNADENS
   sida (`/en/products/<handle>.json` för US). Svarar den inte finns
   språket inte i butiken än (`/ny-marknad` inte körd) — då hålls kön: inget
   renderas, inget laddas upp, rapporten säger `store not ready for US:
   <skäl>`. En live-annons mot en sida som inte finns är spend rakt ner.
8. **Flera marknader delar kön.** Raden flyttas till `Approved` bara när
   VARJE marknad i butikens `annonsmarknader` (register.json) bär annonsen
   (`flytta_till_approved` i kön). Annars stannar den — nästa marknads rutin
   ska hitta den. En marknad som ägaren pausat blockerar flytten tills han
   antingen slår på kampanjen eller tar bort marknaden:
   `node factory/register.mjs annonsmarknader <nyckel> NO`.

## Gör i ordning

Färsk `main`; `IDAG` som i `/ops-leverans`; `M` = marknaden (NO/US). Batchmapp:
`market-expansion/ops/<butik>/<IDAG>-<m>/` (`-no` / `-us`) — media (mp4, jpg,
png, srt) är gitignoretat där, JSON-filerna committas.

### 1. Kön
```
node tools/ops-leveranskon.mjs <nyckel> --marknad <M> --status "SE-ACTIVE to be translated" --json --ut <batch>/se > <batch>/jobb.json
```
Kräver exakt en kampanj för marknaden i marknadens konto: ACTIVE, eller
**PAUSED utan spend** (nybyggd — en ägare pausar inget som aldrig spenderat).
Kön hittar den på kampanjnamnets bas (`kampanjbasFor`,
`CARASHELL_US_Taköverdrag …`) även när den är tom; mätt 2026-09-16 före
rättningen: kön sa "ingen US-kampanj" om en färdigbyggd `--tom`-kampanj, för
den hade inga annonser att kännas igen på. Fyra olika lägen, och de får
**inte** rapporteras likadant (rättat 2026-09-13 efter att HeimGuard fick fel
råd):

| Läge | Rapportera | Rör |
|---|---|---|
| Ingen kampanj för marknaden i kontot | `no <M> campaign — run: node factory/kampanj.mjs <produkt> --marknad <M> --tom` | inget |
| Kampanjen finns men är **PAUSED med spend** | `<M> paused by owner since <tid>, N rows held` + vad pausen kostar/ger | inget |
| Kampanjen finns, PAUSED **utan** spend (nybyggd) | **annonserna laddas upp i den** — `<M> campaign is PAUSED (never run): N ads uploaded, nothing spends until the owner switches it on` under ACTION NEEDED | annonserna; kampanjen och dess status rörs ALDRIG |
| Flera ACTIVE, eller flera PAUSED utan spend | lista namnen, be om besked | inget |

Uppladdaren får kampanjen ur kön: skicka `--kampanj <jobb.kampanj.id>` i
steg 5, så kan verktyget aldrig välja en annan kampanj än den kön dömde.

⚠️ **Föreslå ALDRIG `/ny-annonser` eller `--tom` för en kampanj ägaren själv
har pausat.** PAUSED med spend är hans beslut. Kön **hålls** i det läget:
ingen rad flyttas, ingen status ändras i Notion, inget renderas i HeyGen.
Raderna ligger kvar tills kampanjen är ACTIVE igen — se
`factory/PROCESS.md`, "Marknaden är pausad av ägaren".

**Marknad tillagd i efterhand (USA på CaraShell 2026-09-16):** rader som
redan flyttats till `Approved` när bara NO fanns kommer aldrig tillbaka i
`SE-ACTIVE to be translated`. Kör därför kön EN gång till med
`--status Approved` (utan `--ut` först): varje rad med `finns_i_meta: false`
för marknaden är eftersläpande och översätts precis som de andra (hämta
filen med `--ut` för just dem). Statusen rörs inte — raden är redan
Approved; kommentaren i steg 6 skrivs utan `--status`. Är kön tom i BÅDA
statusarna säger rapporten det, aldrig bara "0 rader".

Raden bär `mal_namn` (`HeimGuard_SP_2_1` → `HeimGuard_<M>_SP_2_1`), typ,
fil (`--ut` hämtade den ur Notion), `finns_i_meta` (redan uppe ⇒ bara
statusflytt), `klar_i` (de andra marknaderna) och `flytta_till_approved`.
`lank_standard` är marknadens länk när kampanjen inte har någon att ärva.

### 2. Texterna
Sonnet-subagent (Agent `model: "sonnet"` eller `tools/copy-agent.mjs`)
läser varje SE-bilds texter (`python3 pipeline/oversatt-bild.py --in <se.jpg> --analys`)
och briefens COPY CARD, och skriver marknadens språk (kön säger vilket:
`sprak`): bildtexter rad för rad (samma antal rader), primary text, headline,
description — pris bara enligt regel 4. Amerikansk engelska är inte brittisk:
"color", "tire", "$109", inga "kr". Claims som inte går att verifiera på
marknaden stryks (svenska betyg/antal recensioner, "inom Sverige").
Spara `<batch>/oversatt-output.json` (`sprak` = kons `locale`) och
`<batch>/adcopy-<M>.json` (`{ "<mal_namn>": {message, headline, description} }`).

### 3. Bilder — exakt `/oversatt` Fas 3
`python3 pipeline/oversatt-batch.py --batch <batch> [--bara <namn>]`, läs
varje `<mal_namn>.jpg.qa.png`, rätta `overrides.json` vid MISMATCH. Aldrig
leverera en bild med fel. (Utmappen heter `no/` av historiska skäl — den är
marknadens, oavsett kod.)

**Undantag — bilder med textlagret (`factory/bild-text.py`):** en OPS-bild
vars text lades på som vektortext ur briefens "Exact text" (CaraShell batch
#2, alla `/ops-bild`-bilder sedan 2026-09-15) översätts INTE med OCR-vägen.
Rita om från det rena basfotot med marknadens spec: subagenten skriver
`<batch>/textlager-<m>.json` (samma typ-lista och ordning som SE-specen —
`se-texter.json` ur briefens tabell), och `ops-bild.laggTextlager` lägger
den på basfotot. Basfotot finns i Notion-raden (första bilagan innan
textversionen bytts in) eller som `image_hash` i den gamla Meta-creativen
(`act_<konto>/adimages?hashes=[…]` ger `url`). Mall:
`market-expansion/ops/carashell/2026-09-16-us/rendera.mjs`. Titta på varje
färdig bild innan uppladdning — samma lätta granskning som `/ops-bild`.

### 4. Video — exakt `/oversatt` Fas 4
`translate-batch.mjs … --lang="<heygen_sprak ur kön>" --marknad=<M>`.
Proofread → SRT lokaliseras av subagenten (samma blockantal/timecodes) →
apply → render → download → `no-precis.py`/`no-captions.py` bara om källan
har inbränd text (skripten är språkoberoende trots namnet) → `rostkoll.py`.
Tom `.orig.srt` = inget tal = ingen render.

### 5. Uppladdning — live i marknadens kampanj
```
node tools/ops-till-meta.mjs <nyckel> --marknad <M> --kampanj <jobb.kampanj.id> --namn <mal_namn> --fil <batch>/no/<fil> --primar "<message>" --rubrik "<headline>" [--beskrivning "<text>"] --torr
node tools/ops-till-meta.mjs <nyckel> --marknad <M> --kampanj <jobb.kampanj.id> --namn <mal_namn> --fil <batch>/no/<fil> --primar "<message>" --rubrik "<headline>" [--beskrivning "<text>"] --json
```
Länken ärvs ur kampanjens befintliga annonser; en tom kampanj (första
US-annonsen) får marknadens standardlänk och produktfilens sida — det står i
utskriften. Tillbakaläs ACTIVE/ACTIVE.

### 6. Notion
```
node tools/notion-aterkoppling.mjs <page-id> --kommentar "<M> ✅ <mal_namn> live in <kampanj> (adset <KONCEPT>), ad <id>" --egenskap "Translated url=https://www.facebook.com/adsmanager/manage/ads?act=<konto>&selected_ad_ids=<id>" [--status Approved]
```
`--status Approved` BARA när radens `flytta_till_approved` är sant (regel 8);
annars kommentar utan statusbyte. Saknar hubben fältet `Translated url`
avbryter verktyget — kör då om utan `--egenskap` och skriv länken i
kommentaren. Hoppad rad: kommentar med skälet, status orörd. ⚠️ Känd lucka:
den översatta filen läggs inte in i Notion-sidan (REST-uppladdning av filer
är inte byggd) — säg det i rapporten så Axel granskar i Ads Manager.

### 7. Rapport, logg, push
Discord-jobb (läge `oversatt`, `marknad: "<M>"`): `gjort` = en rad per annons
(SE-namn → målnamn, kampanj, adset), `varningar` = röstkoll-anmärkningar och
hoppade rader med skäl, `action_axel` = det som kräver honom. HeyGen-saldo
före → efter i `gjort`. `node tools/discord-rapport.mjs --jobb <fil>`.
Committa `<batch>/jobb.json`, `oversatt-output.json`, `adcopy-<M>.json`,
`overrides.json` — aldrig media. Rad i `products/<butik>/batch-log.md`.
Pusha till `main`.

## DEFINITION OF DONE

- [ ] Färsk `main`; marknadens kampanj hittad i marknadens konto (exakt en ACTIVE, eller exakt en PAUSED utan spend som då INTE slås på) eller stoppet redovisat med rätt läge
- [ ] Butiken redo för marknaden (priset läst på marknadens sida) — annars kön hållen och rapporterad
- [ ] Varje rad i kön redovisad: översatt + uppladdad / hoppad med skäl / redan uppe
- [ ] Bilder: QA-bild läst per bild, inget svenskt kvar, siffror rätt
- [ ] Video: proofread före render, källvideo skannad efter inbränd text, röstkoll grön
- [ ] Copy utan pris eller med priset ur `ekonomi.marknadspriser`; inget påhittat belopp någonstans
- [ ] Uppladdning torrkörd först, skarp sedan, tillbakaläst ACTIVE/ACTIVE; ett adset per koncept; rätt konto
- [ ] Rader flyttade till `Approved` BARA när alla annonsmarknader bär annonsen; annars kommentar
- [ ] Discord-rapport på engelska i `#annons-uppladdning` med marknadens flagga; ping bara under ACTION NEEDED
- [ ] Batchfiler committade (aldrig media), batch-log, push till `main`
- [ ] Slutrapport i två listor; Axels uppgifter sist, numrerade
