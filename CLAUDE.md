# CLAUDE.md

Det här är Axels arbetsrepo. Du läser den här filen först, varje session.

Den som kör sessionen är oftast **Axel själv, och han är inte utvecklare.**
Förklara enkelt, kör klart uppgiften, och lämna aldrig över halvfärdigt arbete
med en instruktion om vad han "bara behöver göra själv". Svara på svenska.

---

## Två verksamheter. Blanda dem aldrig.

Det här är det farligaste misstaget i repot — fel annonskonto kostar riktiga pengar.

| | **Bäverbutiken** | **Grillkliniken** |
|---|---|---|
| Sajt | bäverbutiken.se (Shopify general store) | grillkliniken.se |
| Ad account | MagiBorsten `1867947880635861` (SEK) | SnarkLös `1346450049878358` (SEK) |
| Produkter | flera, se `products/products.json` | Mastern (elgrillborste, 999 kr) |
| Styrs av | slash-kommandona nedan | `pipeline/waves/` + `docs/` |

Kontonamnet är aldrig samma som brandnamnet. Kolla `ad_account_id` innan du rör
något i Meta. Övriga konton finns men används inte: Matstrumpor.se
`730973156224390` (⚠️ UNSETTLED).

---

## Regler för varje session

1. **Följ kommandot bokstavligt.** Kommandona i `.claude/commands/` är versionerade
   och testade. Hoppa aldrig över steg, korta aldrig ner leveransformatet, och
   invänta inte godkännande mellan faser om kommandot säger åt dig att köra klart.
2. **Avsluta alltid med kommandots "Definition of done"-checklista** — punkt för
   punkt, ✅/❌. Är något ❌: fixa det, eller skriv exakt varför det inte gick.
3. **Hitta aldrig på data.** Ingen dom över en annons under 300 kr spend eller
   3 köp. Saknas data: säg det rakt ut och leverera resten.
4. **Analysmetoden är obligatorisk.** Ska annonser bedömas: följ
   `docs/os/ANALYSMETOD.md` till punkt och pricka och bocka av dess checklista i
   svaret. **Enmetriks-domar är förbjudna** — rangordna alltid på vinstbidrag
   `(break-even-CPA − CPA) × köp`, aldrig på ROAS eller CPA ensamt. Top spendern är
   benchmark, inte en kandidat att döma mot småannonser. Kill-beslut mäts mot
   `break_even_roas` (eller `break_even_cpa_sek`), aldrig mot target-nivån.
5. **Brief-kvoten är mål nr 1.** Varje session som launchar/loggar creatives kör
   `node pipeline/quota.mjs` och visar plus/minus-läget. Loggning:
   `node pipeline/quota.mjs log <produkt-id> <antal>`.
6. **Modellpolicy:** all slutgiltig ad copy, svenska manusrader och voiceovers
   skrivs av en subagent via Agent-verktyget med `model: "sonnet"` (eller `"haiku"`
   för bulkvarianter) — subagenten får DNA + hypotes + hook + formatkrav och
   skriver bara text. Strategi, analys, klassificering och briefstruktur görs
   alltid av huvudsessionen. Aldrig tvärtom.
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
11. **Fråga bara när ett beslut kräver ägaren** (prisändring, rabatt i Shopify, ny
    target-CPA). Allt annat: kör.
12. **Om Axel skriver ett `/kommando` som klienten inte känner igen** (eller skriver
    "kör /cs motorholjet" som vanlig text): läs motsvarande fil i
    `.claude/commands/` och följ den exakt, med texten efter kommandonamnet som
    argument. Kommandona är filer — de fungerar även när klienten inte
    registrerat dem.

---

## Kommandona (Axels gränssnitt)

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

---

## Var saker finns

| Vad | Var |
|-----|-----|
| **Creative strategy: insikt → manus (hjärnan i video-pipelinen)** | **`docs/creative-strategy.md`** |
| **Analysmetoden (obligatorisk vid all bedömning)** | **`docs/os/ANALYSMETOD.md`** |
| Playbook — vinklar/hooks/format som bevisats över tid | `docs/playbook.md` |
| Hook-regeln (visuellt) | `docs/hook-visual-rule-2026-08-04.md` |
| Avatar-research + VoC (Reddit) | `docs/avatar-research-*.md`, `docs/voc-reddit-*.md` |
| Swipes från konkurrenter | `docs/swipes/` |
| TOF-idébank | `docs/tof-idea-bank.md` |
| Actionplan + bottlenecks | `docs/os/ACTIONPLAN.md` |
| SOP 01–07 (batch-loop, kvot, UGC, check-in, produkttest, dashboard) | `docs/os/SOP-0*.md` |
| SOP: när Claude inte lyssnar | `docs/os/SOP-05-nar-claude-inte-lyssnar.md` |
| Editor SOP (engelska, till redigerarna) | `docs/os/EDITOR-SOP.md` |
| Notion-formatet för briefer (exakt spec) | `docs/os/NOTION-FORMAT.md` |
| Produkt-konfig + launch-logg | `products/products.json` |
| Produktminne per produkt | `products/<id>/` |
| Kvot-skriptet | `pipeline/quota.mjs` |
| Namnkonventionen | `docs/naming-convention.md` |
| Punchline-bank + vinnande lines | `docs/winning-lines.md` |
| Ad-tracker (hypotes → utfall → lärdom) | `docs/ad-tracker.md` |

- **Team:** filippinska videoredigerare + VA (engelska), en UGC-outreach-ansvarig.
- **Slack-workspace:** **stonebite** — en kanal per produkt för redigerarna, en för UGC.

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

**Regeln som gör att det faktiskt lär sig:** ett koncept får aldrig födas ur tomma
intet. Det ska kunna peka på en av tre källor — en playbook-vinnare, en winning line
som redan spenderat pengar bra, eller en konkurrent-signal ur `docs/swipes/`. Kan det
inte det är det en gissning, och då ska det märkas som en gissning.

`dna.md` är den viktigaste filen i hela repot. Den bär inte bara siffror utan
**rotorsaker** — t.ex. varför kontots copy inte matchar briefarna. Läs den först,
uppdatera den sist, och skriv ut datum + vilken körning i ordningen det var.

---

## De fyra verktygsmapparna

Varje mapp är ett eget litet projekt med egen `package.json`. Kör alltid
kommandon **inifrån mappen**. Allt är ESM (`.mjs`).

### `pipeline/` — bildannonser
Två steg, för att bildmodeller är dåliga på text: Higgsfield Soul genererar en
fotorealistisk bas med medvetet mörk tomyta → `compose.mjs` lägger rubrik/badge/
footer som skarp vektortext ovanpå med `sharp`.

```bash
npm install
npm run dry                      # förhandsgranska layout utan Higgsfield
node run.mjs --wave=01 --limit=2 # skarpt
```
Kräver `HF_API_KEY` + `HF_SECRET`. Ny annons = ett objekt i `waves/wave-XX.mjs`.
Färger/typsnitt/canvas ändras på ett ställe: `brand.mjs`.

**Vid sidan av vågsystemet ligger fyra fristående engångsskript** som *inte* läser
`brand.mjs` och hårdkodar egen layout: `b020-format.mjs` (kontots bäst presterande
format, ROAS 2,53 — värt att utgå från), `swipe.mjs`, `swipe2.mjs`, `grab.mjs`.
Ändrar du brandkittet slår det alltså inte igenom där.
⚠️ `swipe.mjs` och `swipe2.mjs` importerar `axios` utan att det står i
`package.json` — det funkar bara på en lyckträff. Deklarera det om du rör dem.

### `voiceover/` — ElevenLabs
Fristående, **inga npm-beroenden** (använder inbyggda `fetch`).
```bash
export ELEVENLABS_API_KEY="..."
npm run vo:dry                   # se alla manus + teckenantal utan att bränna API
npm run vo                       # generera mp3
```
Default: rösten `Svensk Martin` + modellen `eleven_v3` (förstår taggar som
`[paus]`, `[viskar]` mitt i texten). Manus ligger i `voiceover/scripts/<annons>/`.

### `dashboard/` — redigerarpanelen
```bash
node cli.mjs build
```
Bygger `index.html` — en självständig fil utan CDN:er som funkar offline och går
att mejla. Läser Notion via `notion-import.mjs`. Kräver `NOTION_TOKEN`.

### `market-expansion/` — nya marknader (DK m.fl.)
Rena arbetsdokument, ingen kod. Börja i `market-expansion/README.md` och
`BESLUT.md`. Batcherna ligger i `<land>/batches/`.

---

## Saker som är lätta att göra fel

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
- **Notion-anropen stryps till ~3/s.** Ett par hundra sidor tar några minuter.
  Det är normalt, inte en hängning.
- **Språk:** allt i repot skrivs på svenska — kod, kommentarer, commit-meddelanden.
  Undantag: `basePrompt` i pipeline-vågorna är engelska (bildmodellen kräver det),
  och briefer till redigerarna är engelska.

---

## Om repots grenar

Repot har ~26 grenar från tidigare sessioner och **`main` är den enda som gäller.**
Den här filen bor här. Om du behöver något som inte finns i trädet ligger det
troligen kvar på en gammal gren — leta med `git log --all --oneline -- <fil>` i
stället för att bygga om det från början.

En sak ligger medvetet kvar utanför `main`: grenen
`claude/initial-setup-87a4dh` innehåller en **andra, separat redigerarpanel** för
Grillkliniken (händelsestyrd, `dashboard/cli.mjs` + `src/`, med egen testsvit på
27 tester och ett GitHub Actions-flöde). Den har samma mappnamn som dashboarden i
`main` men är ett annat program — de går inte att slå ihop rakt av. Ska den
återupplivas: hämta den till en egen mapp, inte ovanpå den befintliga.
