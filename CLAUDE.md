# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Det här är Axels arbetsrepo. Du läser den här filen först, varje session.
`main` är default-branch och den enda som gäller — den här filen bor där.

Den som kör sessionen är oftast **Axel själv, och han är inte utvecklare.**
Förklara enkelt, kör klart uppgiften, och lämna aldrig över halvfärdigt arbete
med en instruktion om vad han "bara behöver göra själv". Svara på svenska.

Vidare läsning i ordning: `HANDOFF.md` (vad som är byggt, vad som återstår,
vilka connectors som måste kopplas) → `docs/os/ACTIONPLAN.md`.

---

## Två verksamheter. Blanda dem aldrig.

Det här är det farligaste misstaget i repot — fel annonskonto kostar riktiga pengar.

| | **Bäverbutiken** | **Grillkliniken** |
|---|---|---|
| Sajt | bäverbutiken.se (Shopify general store) | grillkliniken.se |
| Ad account | MagiBorsten `1867947880635861` (SEK) | SnarkLös `1346450049878358` (SEK) |
| Produkter | 6 st, se `products/products.json` | Mastern (elgrillborste, 999 kr) |
| Styrs av | slash-kommandona nedan | `pipeline/waves/` + `docs/` (legacy) |
| Sida / pixel | `678639638662543` / `1554276343018184` | står inte i `main` — läs den ur en SnarkLös-vågkonfig |

Kontonamnet är aldrig samma som brandnamnet. Kolla `ad_account_id` innan du rör
något i Meta. Övriga konton finns men används inte: Matstrumpor.se
`730973156224390` (⚠️ UNSETTLED).

**Kopiera aldrig `page`/`pixel` mellan verksamheterna.** Fel pixel betyder att köpen
bokförs på fel verksamhet och att all analys blir fel — och det syns inte som ett
felmeddelande, bara som konstig data.

**Creative Strategy OS:et är bara Bäverbutiken.** Grillkliniken/Mastern-materialet
i `docs/` och `pipeline/` (utom `pipeline/quota.mjs`) är legacy referens och ska
inte röras utan att Axel ber om det.

---

## Regler för varje session

1. **Följ kommandot bokstavligt.** Kommandona i `.claude/commands/` är versionerade
   och testade. Hoppa aldrig över steg, korta aldrig ner leveransformatet, och
   invänta inte godkännande mellan faser om kommandot säger åt dig att köra klart.
2. **Avsluta alltid med kommandots "Definition of done"-checklista** — punkt för
   punkt, ✅/❌. Är något ❌: fixa det, eller skriv exakt varför det inte gick.
3. **Hitta aldrig på data.** Ingen dom över en annons under 300 kr spend eller
   3 köp. Saknas data: säg det rakt ut och leverera resten. Alla siffror kommer ur
   Notion, Meta, Shopify eller `products/products.json` — aldrig ur huvudet.
4. **Analysmetoden är obligatorisk.** Ska annonser bedömas: följ
   `docs/os/ANALYSMETOD.md` till punkt och pricka och bocka av dess checklista i
   svaret. **Enmetriks-domar är förbjudna** — rangordna alltid på vinstbidrag
   `(break-even-CPA − CPA) × köp`, aldrig på ROAS eller CPA ensamt. Top spendern är
   benchmark, inte en kandidat att döma mot småannonser. Kill-beslut mäts mot
   `break_even_roas` (eller `break_even_cpa_sek`), aldrig mot target-nivån.
   *(Regeln finns för att en tidigare chatt dömde ut top spendern för låg ROAS —
   den stod för ~50 % av all vinst.)*
5. **Brief-kvoten är mål nr 1.** Varje session som launchar/loggar creatives kör
   `node pipeline/quota.mjs` och visar plus/minus-läget. Loggning:
   `node pipeline/quota.mjs log <produkt-id> <antal> [YYYY-MM-DD]`.
6. **Modellpolicy:** all slutgiltig ad copy, svenska manusrader och voiceovers
   skrivs av en subagent via Agent-verktyget med `model: "sonnet"` (eller `"haiku"`
   för bulkvarianter) — subagenten får DNA + hypotes + hook + formatkrav **+
   `docs/copy-regler.md`** och skriver bara text. Varje levererad rad ska klara
   tre-frågorstestet i copy-reglerna (visualisera / falsifiera / ingen annan kan
   säga det) och testet redovisas i leveransen. Strategi, analys, klassificering
   och briefstruktur görs alltid av huvudsessionen. Aldrig tvärtom.
7. **Produktminnet ligger i repot, inte i chatten:** `products/<id>/dna.md`
   (Creative DNA), `products/<id>/batch-log.md` (batcher + hypoteser + utfall),
   `products/<id>/backlog.md` (koncept som väntar). Läs dem innan du agerar,
   uppdatera dem efter, committa och pusha.
8. **Namngivning:** `docs/naming-convention.md` är normativ. Annonsnamnen kodar
   angle/format/hook så datan går att skära per variabel — bryter du mot den går
   analysen inte att göra. Läs av upptagna AD-ID:n i kontot innan du numrerar.
9. **Briefer på engelska** (redigerarna är engelsktalande), svenska manusrader i
   tabell `Swedish (use this) | English meaning`. SOP:er och svar till Axel på
   svenska.
10. **En task är aldrig klar för att någon säger det.** Levererat och godkänt är
    två olika saker. Godkännande kräver grön checklista (eller override med
    skriven motivering), och bara godkända creatives räknas mot kvoten.
11. **Nya tester launchas i ett separat test-ABO med lika budget per annons.**
    CBO används för skalning av bevisade vinnare — aldrig för tester. *(Axels beslut
    2026-08-12. Mönster 5 i motorhöljets DNA, märkt `BEVISAD — tredje gången`: tre
    batcher svalt ihjäl bredvid `PD_1_H3` som tar 42 % av spenden. Batch #2 fick 16
    av 17 annonser under 30 kr; batch #5:s trevägstest med identisk copy gav
    5,70 / 5,52 / 159,76 kr. Läggs nya creatives i skalningens CBO blir datan
    oläsbar och kvoten meningslös.)*
12. **Fråga bara när ett beslut kräver ägaren** (prisändring, rabatt i Shopify, ny
    target-CPA). Allt annat: kör.
13. **Om Axel skriver ett `/kommando` som klienten inte känner igen** (eller skriver
    "kör /cs motorholjet" som vanlig text): läs motsvarande fil i
    `.claude/commands/` och följ den exakt, med texten efter kommandonamnet som
    argument. Kommandona är filer — de fungerar även när klienten inte
    registrerat dem.
14. **Korta svar.** Inga bibelsvar. Axel har sagt det två gånger.
15. **Fråga aldrig Axel om något du kan ta reda på själv.** Innan en fråga skickas:
    försök hämta uppgiften, och fråga bara om försöket misslyckas — då med beskedet
    vad du provat. Axel ska aldrig behöva leta upp något som ligger i ett API, en
    HTML-sida eller en fil du redan har åtkomst till.
    *(2026-08-19: jag bad honom leta upp butikens `myshopify.com`-adress. Den låg i
    butikens egen HTML och tog en sekund att hämta — `curl -sL <butiksdomän> |
    grep -oE '[a-z0-9-]+\.myshopify\.com'`. Samma uppgift finns också i
    `shop { myshopifyDomain }` via Shopify-connectorn. Han fick leta i onödan.)*
    Ordningen är alltid: **försök själv → misslyckas → fråga med exakt en fråga.**
16. **Ett fel = en ny regel.** Missar du något, eller säger Axel "så här vill jag ha
    det", skriv in det här i samma svar. Reglerna är produkten — nästa session vet
    ingenting utom det som står skrivet.

---

## Kommandona (Axels gränssnitt)

14 filer i `.claude/commands/`. Detta är produkten — resten är stödsystem.

| Kommando | Vad |
|----------|-----|
| `/ny-produkt <namn> <budget>` | Första testbatchen för ny produkt (ingen data än) — SOP-06 |
| `/forsta-batch <namn>` | Full CS-analys från noll i en NY chatt |
| `/cs <id> [egna idéer]` | **Kärnloopen:** CS på senaste annonserna, feedbackloop, nästa batch |
| `/koncept <id> <idé> [AKUT]` | Släng in koncept i backloggen (AKUT = bygg briefen nu) |
| `/checkin <id>` | Daglig check-in: kvot, Slack-kontroll, grönmarkering, larm |
| `/logga <id> <antal>` | Launch-avstämning: kvot + Notion-sync + tracking-sheet |
| `/notion <db>, <mapplänk>` | Ladda upp batchens briefer till Notion |
| `/sheet <id>` | Fyll i tracking-sheetet (xlsx) |
| `/ugc <id> <ny info>` | Uppdatera UGC-plan och deadlines |
| `/plan [datum]` | **Redigerarna:** lägg dagens plan, skapa tasks, morgonmeddelanden |
| `/dashboard [datum]` | Bygg och läs redigerardashboarden |
| `/rapport <namn>: <text>` | Tolka en slutrapport från Slack (bekräftas innan den sparas) |
| `/granska [id]` | Beta av review-kön: checklista → godkänn eller skicka tillbaka |
| `/produktbatch <offertlänk> <nr>` | **Bäverbutiken:** hela batchflödet offert → 5 butiker → Notion → bildpaket |

---

## Kommandon i terminalen

Roten är ett eget npm-projekt (Node ≥20, **noll externa beroenden** — inget att
installera för OS:et). Kör dessa **från repo-roten**:

```bash
npm run quota      # node pipeline/quota.mjs      — brief-kvoten (mål nr 1)
npm run dash       # node dashboard/build.mjs     — bygger dashboard/index.html
npm run status     # node dashboard/cli.mjs status
npm run review     # node dashboard/cli.mjs review-queue
npm run seed       # node dashboard/seed.mjs --force  (⚠️ skriver över testdata)
npm test           # node --test dashboard/test/*.test.mjs — 17 tester, ska vara gröna
```

Enskilt test: `node --test --test-name-pattern "<del av testnamnet>" dashboard/test/rules.test.mjs`

Notion-import (kräver `NOTION_TOKEN`): `node dashboard/notion-import.mjs`

Det finns ingen linter och ingen byggkedja i OS:et — `npm test` är hela grinden.

---

## Var saker finns

| Vad | Var |
|-----|-----|
| **Creative strategy: insikt → manus (hjärnan i video-pipelinen)** | **`docs/creative-strategy.md`** |
| **Copy-reglerna (obligatoriska för varje rad som skrivs)** | **`docs/copy-regler.md`** |
| **Analysmetoden (obligatorisk vid all bedömning)** | **`docs/os/ANALYSMETOD.md`** |
| Playbook — vinklar/hooks/format som bevisats över tid | `docs/playbook.md` |
| Hook-regeln (visuellt) | `docs/hook-visual-rule-2026-08-04.md` |
| Avatar-research + VoC (Reddit) | `docs/avatar-research-*.md`, `docs/voc-reddit-*.md` |
| Swipes från konkurrenter | `docs/swipes/` |
| TOF-idébank | `docs/tof-idea-bank.md` |
| Actionplan + bottlenecks | `docs/os/ACTIONPLAN.md` |
| SOP 01–07 (batch-loop, kvot, UGC, check-in, "när Claude inte lyssnar", produkttest, dashboard) | `docs/os/SOP-0*.md` |
| Editor SOP (engelska, till redigerarna) | `docs/os/EDITOR-SOP.md` |
| Notion-formatet för briefer (exakt spec + statustabell) | `docs/os/NOTION-FORMAT.md` |
| Produkt-konfig + launch-logg | `products/products.json` |
| Produktminne per produkt | `products/<id>/` |
| Kvot-skriptet | `pipeline/quota.mjs` |
| Namnkonventionen | `docs/naming-convention.md` |
| Punchline-bank + vinnande lines | `docs/winning-lines.md` |
| Ad-tracker (hypotes → utfall → lärdom) | `docs/ad-tracker.md` |
| Färdiga briefer + rådata från kontot | `docs/briefs/`, `docs/source/` |
| Grillklinikens COGS, marginaler och moms (legacy) | `docs/grillkliniken-ekonomi.md` |

### Produkterna (`products/products.json`)

Sex produkter, alla på MagiBorsten. `scaling: true` = ingår i redigerardashboarden
och har en egen Notion creative hub. `scaling: false` = testprodukt, utanför
redigerarnas arbetsflöde.

| id | Skalar | Dagsbudget | Break-even-ROAS |
|---|---|---|---|
| `motorholjet` | ✅ | 2 000 kr | 1,63 |
| `axelbaltet` | ✅ | 2 000 kr | 1,72 |
| `satesoverdragaren` | ✅ | 1 500 kr | 1,47 |
| `strandtofflorna` | ✅ | 1 000 kr | 1,70 |
| `ai-glasogon` | ❌ | 1 000 kr | 1,34 |
| `vaggfastet` | ❌ | 500 kr | 2,00 |

Break-even-talen kommer ur Axels COGS-beräkning 2026-08-05 och är verkliga.
Dagsbudgetarna ändras ofta — **läs alltid `products.json`, citera aldrig tabellen
ovan ur minnet.** Motorhöljet sänktes 6 000 → 2 000 kr/dag 2026-08-12.
Under 5 000 kr/dag växlar kvotens testandel från 10 % till 20 %, så kvoten hoppar
när en budget passerar den gränsen.

⚠️ **Tre tal går inte att lita på ännu:**
- `satesoverdragaren.target_cpa_sek: 300` är en **gissning** från en tidigare chatt.
- `axelbaltet`: `products.json` säger break-even-CPA **299 kr**, `products/axelbaltet/dna.md`
  säger **326 kr**. Kill-beslut mäts mot break-even — fråga Axel vilken som gäller.
  Båda är dessutom räknade på gamla priset 509 kr och är för lågt satta vid 599 kr.
- **Bäverbutikens momsläge står ingenstans i repot.** Fråga Axel, gissa inte.
  Grillkliniken säljer *utan* moms — marginalen räknas rakt på priset (Mastern:
  999 kr, inte 799 kr netto). Drar du reflexmässigt av 25 % ser lönsamma annonser
  ut att gå med förlust.

Alla `launches[]` i `products.json` är tomma. Kvotskriptet visar därför ett
minusläge som speglar utebliven loggning, inte utebliven produktion — logga med
`node pipeline/quota.mjs log <id> <antal>` så blir siffran sann.

### Människorna och kanalerna

Slack-workspace: **stonebite**. Team: filippinska videoredigerare + VA (engelska),
en UGC-outreach-ansvarig. Full tabell med Slack-ID:n finns i `HANDOFF.md`.

| Kanal | ID | Vad |
|---|---|---|
| `#bäver-scaling-products` | `C0BNJC83DMF` | De 4 skalningsprodukterna + dagsrapporter före 21:30 |
| `#video-editors` | `C0BGQBGDZBQ` | Hela redigerarteamet, även produkter utanför detta OS |

⚠️ **Annabelle Gonzales heter "Anna" i Slack. Hon är INTE Anna Odhner** (managern
som ska ta över systemet). Två olika personer — och den ena ska godkänna den
andras arbete.

⚠️ Fel Slack-workspace ger **tyst noll träffar**, inte ett felmeddelande.
Verifiera med en sökning på "bäver" — får du inget svar sitter du på fel workspace.

⚠️ **Redigerarna sitter i Asia/Manila (UTC+8), inte i Stockholm.**
`dashboard/data/team.json` säger `Europe/Stockholm` på Josh, Annabelle, Gilz och
Carl — det är fel och ska inte litas på. Räkna deadlines, morgonmeddelanden och
arbetstidsledtider i Manila-tid. 02–06 UTC i Notion-kommentarerna är förmiddag hos
dem, inte natt.

---

## Så lär sig systemet (läs det här innan du briefar något)

Minnet ligger i **filer**, aldrig i chatten. En ny session vet ingenting utom det
som står skrivet. Därför är det inte valfritt att uppdatera dem.

**Tre nivåer, från långsammast till snabbast:**

| Nivå | Fil | Ändras när |
|---|---|---|
| Vad som funkar generellt | `docs/playbook.md`, `docs/creative-strategy.md` | En vinkel bevisats i ≥2 tester |
| Vad som funkar för *den här produkten* | `products/<id>/dna.md` | Varje `/cs`-körning |
| Vad som hände i varje batch | `products/<id>/batch-log.md` | Varje launch och varje avläsning |
| Idéer som väntar | `products/<id>/backlog.md` | När ett koncept dyker upp eller plockas |

Fyra produkter har eget minne i dag: `motorholjet`, `satesoverdragaren`,
`strandtofflorna` och `axelbaltet`. Saknar en produkt `dna.md` **och** träff i
`git log --all` är den inte briefad ännu — skapa den med `/ny-produkt` i stället för
att gissa. Kolla alltid historiken först: axelbältets minne (7 batcher, 5
`/cs`-körningar, 37 459 kr spend, 127 köp) låg kvar på en gren i veckor medan
CLAUDE.md sa att produkten var obriefad.

**Regeln som gör att det faktiskt lär sig:** ett koncept får aldrig födas ur tomma
intet. Det ska kunna peka på en av tre källor — en playbook-vinnare, en winning line
som redan spenderat pengar bra, eller en konkurrent-signal ur `docs/swipes/`. Kan det
inte det är det en gissning, och då ska det märkas som en gissning.

`dna.md` är den viktigaste filen i hela repot. Den bär inte bara siffror utan
**rotorsaker** — t.ex. varför kontots copy inte matchar briefarna. Läs den först,
uppdatera den sist, och skriv ut datum + vilken körning i ordningen det var.

---

## Verktygsmapparna

`pipeline/`, `video/`, `voiceover/` och `pnl-app/` har **egen `package.json`** — kör
alltid deras kommandon inifrån mappen. `dashboard/` och `schema/` har det inte; de
körs från roten via npm-scripten ovan. Allt är ESM (`.mjs`) om inget annat sägs.

### `dashboard/` — redigerarpanelen
Spårningslagret. Notion är sanningen för *vad* som finns; dashboarden lägger på
*vem, när, hur mycket*.

```bash
node dashboard/notion-import.mjs   # Notion-rader → tasks (kräver NOTION_TOKEN)
node dashboard/build.mjs           # bygger dashboard/index.html
node dashboard/cli.mjs status      # läget i terminalen
```
`index.html` är självbärande — inga CDN:er, funkar offline, går att mejla.
`cli.mjs` har ~18 underkommandon (status, today, review-queue, new, deliver,
approve, kpi, export-csv …) — hela listan står som kommentar högst upp i filen.
**`cli.mjs` har ingen `build`** — HTML:en byggs av `build.mjs`.
Logiken bor i `lib/kpi.mjs`, `lib/model.mjs`, `lib/store.mjs`; datan i `data/*.json`.

### `pipeline/` — bildannonser
Två steg, för att bildmodeller är dåliga på text: Higgsfield Soul genererar en
fotorealistisk bas med medvetet mörk tomyta → `compose.mjs` lägger rubrik/badge/
footer som skarp vektortext ovanpå med `sharp`.

```bash
cd pipeline && npm install
export HF_API_KEY="..." HF_SECRET="..."
npm run dry                      # förhandsgranska layout utan Higgsfield
node run.mjs --wave=01 --limit=2 # skarpt
```
Ny annons = ett objekt i `waves/wave-XX.mjs`. Färger/typsnitt/canvas ändras på ett
ställe: `brand.mjs`.

**Vid sidan av vågsystemet ligger fyra fristående engångsskript** som *inte* läser
`brand.mjs` och hårdkodar egen layout: `b020-format.mjs` (kontots bäst presterande
format, ROAS 2,53 — värt att utgå från), `swipe.mjs`, `swipe2.mjs`, `grab.mjs`.
Ändrar du brandkittet slår det alltså inte igenom där.
⚠️ `swipe.mjs` och `swipe2.mjs` importerar `axios` utan att det står i
`package.json` — det funkar bara på en lyckträff. Deklarera det om du rör dem.

### `video/` — videoannonser (9:16 för Reels/Stories)
Speglar bild-pipelinen: modellen renderar **rörelsen**, vi bränner **skarpa
captions** ovanpå med ffmpeg. Manus-tänket bor i `docs/creative-strategy.md` — läs
det först, koden är bara verktyget.

```bash
cd video && npm install
export HF_API_KEY="..." HF_SECRET="..."   # samma nycklar som pipeline/
node run.mjs --dry                        # storyboard utan att generera
```
Kräver `ffmpeg` + `ffprobe` i PATH för skarp körning (`compose.mjs` kollar det och
felar tydligt). Ett koncept = ett objekt i `video/waves/wave-XX.mjs`, och det ska
peka på sin källa i en kommentar.

### `voiceover/` — ElevenLabs
Fristående, **inga npm-beroenden** (använder inbyggda `fetch`).
```bash
cd voiceover
export ELEVENLABS_API_KEY="..."
npm run vo:dry                   # se alla manus + teckenantal utan att bränna API
npm run vo                       # generera mp3
npm run voices                   # lista tillgängliga röster
```
Default: rösten `Svensk Martin` + modellen `eleven_v3` (förstår taggar som
`[paus]`, `[viskar]` mitt i texten). Manus ligger i `voiceover/scripts/<annons>/`.

### `market-expansion/` — nya marknader (DK, NO, UK)
Rena arbetsdokument, ingen kod. Börja i `market-expansion/README.md` och
`BESLUT.md`. Batcherna ligger i `<land>/batches/`.

### `pnl-app/` — P&L som Shopify-app
Riktig applikation, inte ett skript: Remix + Prisma + Docker, kopplad till både
Shopify och Meta. Visar täckningsbidrag per produkt. TypeScript, inte `.mjs`.
```bash
cd pnl-app && npm install
npm run setup       # prisma generate && prisma migrate deploy
npm run dev         # Shopify CLI app dev
npm run typecheck   # tsc --noEmit
npm run build
```
Setup och tokens: `pnl-app/README.md` + `pnl-app/docs/meta-token.md`.

### Övrigt
| Mapp/fil | Vad |
|---|---|
| `pipeline/ads.mjs`, `meta.mjs` | Laddar upp creatives till Meta som **PAUSED** |
| `pipeline/batch.mjs`, `multi-batch.mjs`, `uk-wave.mjs`, `mastern-batch.mjs` | ⚠️ Laddar **inte** upp som PAUSED — se regeln under "Saker som är lätta att göra fel" |
| `pipeline/waves/*.config.mjs` | Vågkonfig per marknad — `se-`, `dk-`, `no-`, `uk-` |
| `pipeline/localize.mjs`, `heygen.mjs`, `veed.mjs`, `cover-srt.py` | Översätter färdiga videoannonser till nya språk (`docs/video-localization.md`) |
| `schema/generate.mjs` | Genererar arbetsschema som `.ics` |
| `whop-downloader/` | Python-verktyg, laddar ner kursmaterial |

---

## Produktcopy på Bäverbutiken (butikens playbook)

Källa: Jespers Slopevault-playbook, anpassad till Bäverbutiken 2026-08-18. Gäller varje
produktsida som skapas eller ändras. `/temu`-kommandot bär mekaniken — det här är reglerna.

**Rösten:** underdriv produkten, överdriv igenkänningen av problemet. Sälj lättnaden, inte
miraklet — "varför har jag inte redan detta?" slår "wow, vilken innovation". Problemblocket
skrivs mot rädslan/irritationen *innan* förlusten, inte efter ("pirret när mobilen glider",
inte "du tappade den").

**Förbjudna ord:** revolutionerande, ultimat, game-changer, måste-ha, oumbärlig, magisk,
"aldrig mer …", "total trygghet". Inga absoluta löften — "stoppar/håller/dämpar", aldrig
"aldrig"/"alltid" om utfall. Varje påstående ska vara bokstavligt sant för produkten.

**Leverans — hård regel:** lova ALDRIG hastighet. Inget "snabb leverans", inga "24h", inga
dagsintervall. Skriv **"smidig leverans"**. *(Bytt på alla 25 egna produkter 2026-08-18.
Butikens ~75 äldre produkter är INTE kontrollerade — de kan ha hastighetslöften kvar.)*

**Bullets (Funktioner-listan):** 4–5 punkter, **utfallet i fetstil först**, specen efteråt
bara när den bevisar utfallet: `<li><strong>Utfall</strong> – bevis/spec</li>`.
**"Och?"-testet:** går det att svara "och?" på punkten är den en spec och skrivs om
("Silikonlina med clip" → **"Tappar du den stoppas fallet direkt"**). Kort nog för en rad på
mobil. Tillsammans ska punkterna täcka: smärtan/utfallet, differentieringen, "passar det
mig?" och varför den är värd pengarna.

**Räkna om alla räkneord:** varje siffra i copyn (delar, lägen, timmar, mått, färger) ska
stämma mot CWD-offerten och referensbilderna — leverantörers marknadsföring räknar upp sig.
*(Exempel: "260 delar" får aldrig illustreras med en bild märkt "173 pcs".)*

**Korrläsning:** läs all svensk copy som svensktalande före leverans — en/ett-genus,
ordföljd, direktöversättningar. Okorrläst svenska launchas inte.

**Slutgranskning (obligatorisk, utan att Axel ber om den):** granska det som ligger skarpt i
butiken, inte det du minns att du skrev — hämta `descriptionHtml` och läs. Kontrollera:
inga ärvda rester/platshållare (tomma HTML-kommentarer!), varje bild-URL svarar 200,
och?-testet på alla bullets, alla räkneord mot spec, korrläsningen. Rapportera i två högar:
**Fixat** (defekter — åtgärda direkt, redovisa) och **Förslag** (strategiska luckor — Axel väljer).

**Moms på produktnivå — AV (Axels beslut 2026-08-18):** "Charge tax" ska vara AVSTÄNGT på
varje produkt (`taxable: false` på varje variant, sätts efter `create-product`). Hela
butiken (~156 produkter, alla varianter) stängdes av 2026-08-18. Priserna är alltså satta
som slutpriser utan separat momsrad — ändra aldrig tillbaka utan Axels besked.

**Medvetet INTE kopierat från Slopevault:**
- *Recensionssektioner med valt snittbetyg* — inga påhittade omdömen, någonsin.
- *Temabygge via repo* (sektioner, Liquid, tema-push) — görs inte här ännu. Men produktmallen
  **`claudeprodukter`** ska sättas på varje ny produkt (`templateSuffix`, sätts efter
  `create-product`) — annars renderas sidan med fel mall.

---

## Produktbatch-flödet (Axels regel 2026-08-29)

**Vid varje ny produktbatch: leverera Cowork-prompten FÖRST, innan den egna
uppladdningen startar.** Axel kör bildskörden på sin dator parallellt medan
molnsessionen gör copy, priser och uppladdning. Prompten ska vara komplett
klistra-in-bar: git-instruktioner + `temu-bilder.mjs`-kommandon med ALLA
batchens Temu-URL:er och mappnamn (se `temu/kaching-cli/KÖR-BILDSKÖRD.md`).
Bakgrund: Temu blockerar molnmiljön (Chromium resettas, curl får tomt skal) men
`img.kwcdn.com` är öppet — skörden kräver Axels dator, allt annat gör molnet.
Skörden pushas till branchen → molnsessionen fyller gallerierna med bilder,
GIF:ar och video i efterhand.

**AI-bilder (utan Cowork):** Higgsfield är kopplat i molnsessionen och används
när riktiga bilder saknas eller behöver kompletteras — MEN med ärlighetsramen
som redan gäller: AI används för miljö-/livsstilsbilder med en riktig
produktbild som referens, och märks alltid ("Livsstilsbilderna är AI-genererade
illustrationer" — samma mönster som matstrumpor-soffbilden och Bäver-UGC:n).
Produktens faktiska utseende (färg, detaljer, innehåll) ska alltid komma från
en riktig källbild — AI får aldrig vara enda källan till hur produkten ser ut.
AI-video → GIF görs också i molnet (Higgsfield + ffmpeg).

**Beskrivningens struktur (Axels regel 2026-08-29)** — gäller varje produktsida
som får skördebilder, i den här exakta ordningen:

1. Problemet / den emotionella delen (copy)
2. GIF
3. Lösningen (copy)
4. GIF eller bild — det som passar bäst
5. Funktioner (bullets enligt copy-reglerna)
6. Bild
7. Garanti

GIF:arna görs av skördens video med ffmpeg (palettegen/paletteuse, ~400 px,
8 fps, mål < 4 MB styck). Skördebilder med utländsk text görs om till svenska
med **KIE AI** (`KIE_API_KEY`) innan de används — och varje översatt bild
granskas visuellt: räkneord och mått på bilden ska stämma mot offerten, annars
används den inte. En–två produktbilder i galleriet räcker inte — galleriet ska
ha variation: rena foton, miljöbilder, detaljbilder, storleksguide och video.

---

## Utlandsbutikerna — lansering till NO/DK/FI/UK

Hela receptet med priser, SKU:er, bild-URL:er och färdiga steg ligger i
**`temu/UTLANDS-LANSERING.md`** — den är självbärande och kan klistras in i ett annat
Claude-konto. Det här är kortversionen:

**Butiksregistret (verifierat 2026-08-18):**

| Land | Butik | Valuta | Vendor | 🦫 i garantin |
|---|---|---|---|---|
| 🇸🇪 | bäverbutiken.se | SEK | Bäverbutiken | Ja |
| 🇳🇴 | beverbutikken.no | NOK | Beverbutikken | Ja |
| 🇩🇰 | bæverbutiken.dk | DKK | Bæverbutiken | Ja |
| 🇫🇮 | majavakauppa.fi | EUR | Majavakauppa | Ja (*majava* = bäver) |
| 🇬🇧 | beavershop.co.uk | GBP | BeaverShop | Ja |

⚠️ **Inventera butiken innan du skapar något.** Butikerna kan redan ha produkterna från ett
annat Claude-konto. Lista hela katalogen och sök på SKU-mönstret **först**, skapa bara det
som saknas. Danmark fick 25 dubbletter 2026-08-18 för att det steget hoppades över.
Och granska det som redan ligger där: finska butikens 12 första produkter hade tomma
svenska platshållarkommentarer, hastighetslöftet "Nopea toimitus" och 1 variant på
produkter som ska ha 7 respektive 18. Det är inte "någon annans jobb" — det ligger skarpt.

**Processen:** `switch-shop` släpper token → Axel kopplar nästa butik i connectorn →
**`get-shop-info` FÖRST, alltid** (fel butik = stopp) → skapa produkterna på landets språk →
varianter `CONTINUE` + `taxable: false` → publicera på ALLA kanaler → kategori (taxonomi-ID:na
är globala, samma GID i alla butiker) → verifiera bilder → nästa land. **Sist: koppla alltid
tillbaka bäverbutiken.se** — annars skriver nästa session mot fel butik.

**Priserna är kostnadsbaserade per land, inte valutakonverterade.** CWD-frakten skiljer
per land ($6,29 UK – $9,97 FI på tofflorna). Ankare: tofflorna 349 NOK / 229 DKK /
29,90 € / £22,99 (Axels beslut 2026-08-18) → faktor mot svenska priset: NO ×1,13,
DK ×0,74, FI ×0,097, UK ×0,074, avrundat till lokala prispunkter (NOK/DKK 9-slut,
EUR X,90, GBP X.99). Hela prismatrisen för alla 25 står i filen.

**Copy:** samma 7-blocksformat och bullet-regler som Sverige, skrivet på landets språk
(aldrig maskinöversatt rakt av — korrläs som infödd). Bilderna återanvänds från svenska
CDN:en (URL:erna i filen) — Shopify kopierar dem till landets egen CDN automatiskt.
Grillklinikken-butiker får ALDRIG bäver-emojin eller "Bäverbutiken" som vendor.

---

## Saker som är lätta att göra fel

- **"PAUSED" gäller bara `ads.mjs` och `meta.mjs`.** Verifierat i koden 2026-08-12:
  `batch.mjs:158` och `multi-batch.mjs:215` sätter adsetet PAUSED men **annonsen
  `ACTIVE`**. `uk-wave.mjs:171,222` sätter **båda ACTIVE** (bara kampanjen är PAUSED).
  `mastern-batch.mjs:130,159` har **ingen default alls** — saknas fältet i konfigen
  blir statusen `undefined`. Fem vågkonfigar sätter varken `adStatus` eller
  `adsetStatus`: `se-axelbalte-batch4`, `se-batch-20260809`, `uk-axelbalte`,
  `uk-beachslippers`, `uk-motorholje`. **Sätt båda fälten explicit i konfigen innan
  du kör** — annars börjar annonserna spendera i samma sekund som något släpps loss.
- **Priset hämtas från produktsidan vid varje körning**, aldrig ur en äldre brief
  eller creative. Axelbältet höjdes 2026-08-05 från 509 → 599 kr (jämförpris 678 kr
  = spara 79 kr, 11,65 %). **509 kr, 636 kr och "20 %" är förbjudna** i all ny copy.
  Två creatives har gammalt pris inbränt och får inte launchas: `2178753102691194`
  och `1324700059732480`.
- **Meta-fältnamnen är exakta:** `amount_spent`, `actions:omni_purchase`,
  `cost_per_omni_purchase`, `purchase_roas`. INTE `spend`/`purchases`.
  ⚠️ `omni_purchase_values` är buggig — den returnerade intäkt **100× för lågt på
  5 av 8 rader**. Korskolla alltid mot `amount_spent × purchase_roas`.
- **Notion-status `In progress 2` betyder REVISION** — annonsen underkändes och
  görs om. Det betyder INTE "längre kommen". Full tabell i `docs/os/NOTION-FORMAT.md`.
- **Notion-hubbarna rymmer mer än annonser.** Bara rader med Typ `… Pending Approval`
  är annonser. SOP, Guideline, Feedback och `Winning Creative` (arkiv) är
  dokumentation och räknas aldrig. Filtrera på Typ vid **varje** hubbläsning, inte
  bara i `/dashboard`, och filtrera på **inkludering** — aldrig uteslutning, då
  smyger nya stödsidor in i mätningen.
- **Kommentarer läses inte rakt av.** Ansvarigs kommentar = leverans. Någon annans
  räknas som ändringsbegäran bara om ≥15 tecken text återstår när `https?://`-länkar
  strippats **och** en leverans redan skett — annars gör Axels inklistrade
  annonslänkar att revisionsgraden ser ut att vara 83–100 %. Alla kommenterar inte:
  visa täckningsgrad per person bredvid siffrorna.
- **Notion-åtkomst ges per sida, inte per konto.** Varje hub måste bjudas in
  (`•••` → Connections; bjuder du in teamspacets toppsida ärver allt under den).
  **404 från en hub betyder "inte inbjuden", inte "databasen saknas".** Utan
  behörigheten "Read comments" finns inga äkta tider alls.
- **Notion har ingen statushistorik.** Det är den enda anledningen till att
  ledtider är svåra. `Godkänd datum` är ifyllt på 2 av 199 rader. **Hitta aldrig
  på en tidsstämpel för att fylla ett tomt fält** — hellre tomt än påhittat. De
  enda äkta tiderna är sidans `createdTime` och kommentarernas `datetime`.
- **Alla ledtider räknas i arbetstid, inte kalendertid.** En task som lämnas ut
  fredag 16:45 och levereras måndag 09:15 tog 1h 30m — inte 64 timmar.
- **Trösklarna är absoluta, inte relativa.** Den sämsta i gruppen ska inte bli röd
  bara för att den är sämst — då är alltid någon röd och panelen blir ett
  mobbningsverktyg i stället för ett styrverktyg.
- **Färgordningen i diagrammen är en färgblindhetsmekanism, inte dekoration.**
  Rotera den inte. Status bärs alltid av ikon **och** text, aldrig färg ensam.
- **Kaching-stegens första nivå får ALDRIG ha undertexten "Standard pris"** (Axels
  beslut 2026-08-29 — den låg i fallback-stegen och syntes på varje produkt).
  Rensas med `temu/kaching-cli/fixa-standardpris.mjs <butik>` på Axels dator
  (kräver inloggad Kaching-session). Sätt aldrig texten i nya stegar.
- **Notion-anropen stryps till ~3/s.** Ett par hundra sidor tar några minuter.
  Det är normalt, inte en hängning.
- **Språk:** allt i repot skrivs på svenska — kod, kommentarer, commit-meddelanden.
  Undantag: `basePrompt` i pipeline-vågorna är engelska (bildmodellen kräver det),
  och briefer till redigerarna är engelska.

---

## Connectors som måste vara kopplade

Följer **inte** med repot. Utan dem går det att bygga och testa koden, men inte att
hämta data: **Notion** (de 4 creative hub-databaserna), **Slack** (workspace
Stonebite), **Meta Ads** (MagiBorsten `1867947880635861`), **Shopify**
(bäverbutiken.se, för verklig AOV).

---

## Om repots grenar

Repot har ~28 grenar från tidigare sessioner. **`main` är default-branch och den
enda som gäller.** Om du behöver något som inte finns i trädet ligger det troligen
kvar på en gammal gren — leta med `git log --all --oneline -- <fil>` i stället för
att bygga om det från början.

**Fyra olika program delar mappnamnet `dashboard/`:**

| Gren | Vad |
|---|---|
| `main` | Redigerarpanelen — `build.mjs` + `cli.mjs` + `lib/` |
| `claude/initial-setup-87a4dh` | Grillklinikens händelsestyrda panel, 27 tester, GitHub Actions (dubblett på `…-fa9ngu`) |
| `claude/editor-performance-dashboard-kla86o` | `edash.mjs` — HTTP-server på port 4173, REST-API, `web/`, egen `config.json` |
| `claude/kostnader-produkter-jbxijn` | Kostnad/marginal-panel, data inbäddad som `DATA`-konstant, ingen build |

De går **inte** att slå ihop rakt av. Ska något återupplivas: hämta det till en
**egen mapp** — annars försvinner redigerarpanelen och nästa `/dashboard` skriver
över det du hämtade.
