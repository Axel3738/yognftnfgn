# Bäverbutiken – Creative Strategy OS

Detta repo är operativsystemet för **Bäverbutikens** creative strategy
(bäverbutiken.se, general store på Shopify). Den som kör sessionen är oftast
**managern (icke-teknisk)** som använder slash-kommandona i `.claude/commands/`.
Ditt jobb är att följa dem exakt.

**Detta OS gäller ENDAST Bäverbutiken — ad account MagiBorsten `1867947880635861`
(SEK).** Mastern/Grillkliniken/SnarkLös är en helt separat verksamhet och ingår
inte; äldre Mastern-material i `docs/` och `pipeline/` (utom `pipeline/quota.mjs`)
är legacy och används inte här.

## Regler för varje session

1. **Följ kommandot bokstavligt.** Kommandona i `.claude/commands/` är
   versionerade och testade. Hoppa aldrig över steg, korta aldrig ner
   leveransformatet, och invänta inte godkännande mellan faser om kommandot
   säger åt dig att köra klart.
2. **Avsluta alltid med kommandots "Definition of done"-checklista** — punkt för
   punkt, ✅/❌. Är något ❌: fixa det, eller skriv exakt varför det inte gick.
3. **Hitta aldrig på data.** Ingen dom över en annons under 300 kr spend eller
   3 köp. Saknas data: säg det rakt ut och leverera resten.
3b. **Analysmetoden är obligatorisk.** Ska annonser bedömas: följ
   `docs/os/ANALYSMETOD.md` till punkt och pricka och bocka av dess checklista i
   svaret. **Enmetriks-domar är förbjudna** — rangordna alltid på vinstbidrag
   `(break-even-CPA − CPA) × köp`, aldrig på ROAS eller CPA ensamt. Top spendern
   är benchmark, inte en kandidat att döma mot småannonser. Kill-beslut mäts mot
   `break_even_cpa_sek`, aldrig mot `target_cpa_sek`.
4. **Brief-kvoten är mål nr 1.** Varje session som launchar/loggar creatives kör
   `node pipeline/quota.mjs` och visar plus/minus-läget. Loggning:
   `node pipeline/quota.mjs log <produkt-id> <antal>`.
5. **Modellpolicy:** all slutgiltig ad copy, svenska manusrader och voiceovers
   skrivs av en subagent via Agent-verktyget med `model: "sonnet"` (eller
   `"haiku"` för bulkvarianter) — subagenten får DNA + hypotes + hook +
   formatkrav och skriver bara text. Strategi, analys, klassificering och
   briefstruktur görs alltid av huvudsessionen (Fable/Opus). Aldrig tvärtom.
6. **Produktminnet ligger i repot, inte i chatten:** `products/<id>/dna.md`
   (Creative DNA), `products/<id>/batch-log.md` (batcher + hypoteser + utfall),
   `products/<id>/backlog.md` (koncept/swipes som väntar). Läs dem innan du
   agerar, uppdatera dem efter, committa och pusha.
7. **Namngivning:** `docs/naming-convention.md` + naming-strukturen i
   `.claude/commands/forsta-batch.md`. Läs av upptagna AD-ID:n i kontot innan
   du numrerar.
8. **Briefer på engelska** (redigerarna är engelsktalande), svenska manusrader i
   tabell `Swedish (use this) | English meaning`. SOP:er och svar till managern
   på svenska.
9. **Fråga bara när ett beslut kräver ägaren** (prisändring, rabatt i Shopify,
   ny target-CPA). Allt annat: kör.
10. **Om användaren skriver ett `/kommando` som klienten inte känner igen** (eller
    skriver t.ex. "kör /cs motorholjet" som vanlig text): läs motsvarande fil i
    `.claude/commands/` och följ den exakt, med texten efter kommandonamnet som
    argument. Kommandona är filer — de fungerar även när klienten inte
    registrerat dem.

## Kommandona (managerns gränssnitt)

| Kommando | Vad |
|----------|-----|
| `/ny-produkt <namn> <budget>` | Första testbatchen för ny produkt (ingen data än) — SOP-06 |
| `/forsta-batch <namn>` | Första riktiga batchen efter launch; skapar produktens chatt + minnesfiler — SOP-01 |
| `/cs <id> [egna idéer]` | **Kärnloopen:** CS på senaste annonserna, feedbackloop, nästa batch enligt kvoten |
| `/koncept <id> <idé> [AKUT]` | Släng in koncept/swipe i backloggen (AKUT = bygg briefen nu) |
| `/checkin <id>` | Daglig check-in: kvot, Slack-kontroll, grönmarkering, larm |
| `/logga <id> <antal>` | Launch-avstämning: kvot + Notion-sync + tracking-sheet |
| `/notion <db>, <mapplänk>` | Ladda upp batchens briefer till Notion |
| `/sheet <id>` | Fyll i tracking-sheetet (xlsx) |
| `/ugc <id> <ny info>` | Uppdatera UGC-plan och deadlines |

## Var saker finns

| Vad | Var |
|-----|-----|
| Actionplan + bottlenecks | `docs/os/ACTIONPLAN.md` |
| SOP: första batchen + produkt-chatten | `docs/os/SOP-01-batch-loop.md` |
| SOP: brief-kvoten (mål nr 1) | `docs/os/SOP-02-brief-quota.md` |
| SOP: UGC-pipeline och deadlines | `docs/os/SOP-03-ugc-pipeline.md` |
| SOP: daglig check-in / grönmarkering | `docs/os/SOP-04-daily-checkin.md` |
| SOP: när Claude inte lyssnar | `docs/os/SOP-05-nar-claude-inte-lyssnar.md` |
| SOP: produkttest-pipeline | `docs/os/SOP-06-produkttest.md` |
| **Analysmetoden (obligatorisk vid all bedömning)** | **`docs/os/ANALYSMETOD.md`** |
| Notion-formatet för briefer (exakt spec) | `docs/os/NOTION-FORMAT.md` |
| Produkt-konfig + launch-logg | `products/products.json` |
| Produktminne (DNA, batch-logg, backlog) | `products/<id>/` |
| Kvot-skriptet | `pipeline/quota.mjs` |

- **Team:** filippinska videoredigerare + VA (engelska), en UGC-outreach-ansvarig,
  managern kör Claude-sessionerna.
