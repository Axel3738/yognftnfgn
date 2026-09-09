# /skalningskungen – Skalningsronden för EN butik, var tredje dag

Argument: `$ARGUMENTS` — butikens nyckel ur registret (`butik/produkt`, eller
bara produkt-id om det är entydigt) + ev. egna idéer efter nyckeln.
Exempel: `/skalningskungen tankguard` · `/skalningskungen tacklebay/fiskespohallare-4-pack`
· `/skalningskungen hemvakten testa en vinkel mot villaägare`

En rond, en butik. Kör aldrig flera butiker i samma körning — en rond skriver i
butikens minne och i butikens Notion-hub, och en blandad körning gör båda
oläsbara.

Kravspec: `factory/SKALNINGSKUNGEN.md` (vad) · `factory/TRAPPAN.md` (när) ·
`docs/os/ANALYSMETOD.md` (hur data läses — obligatorisk, kortas aldrig ner).

**Regel: ronden rör ALDRIG en status i annonskontot.** PAUSED med spend är ett
beslut, aldrig ett fel att rätta. `factory/skalning.mjs` gör inga skrivande
Graph-anrop, och den här rutinen lägger inte till några.

Gör i ordning, utan att invänta godkännande mellan stegen:

1. **Slå upp butiken och kolla att det är kördag.**
   `node factory/register.mjs <nyckel> --idag <YYYY-MM-DD>`
   Registret upptäcks ur `factory/butiker/*.yaml` + `factory/produkter/*.yaml`
   + `factory/state/` + `products/products.json` — det finns ingen handskriven
   lista, och en ny OPS-butik dyker upp av sig själv när den byggts.
   Står posten som "Ny i registret": kör `node factory/register.mjs skriv-in`
   först, annars får butiken en ny kördag varje gång.
   Regel: är det inte kördag och kommandot kördes av rutinen — rapportera
   "inte kördag, nästa <datum>" och sluta. Kör Axel det för hand gäller hans
   ord, kör ändå.

2. **Läs butikens minne innan något bedöms.**
   `factory/minne/<butik>/dna.md`, `batch-log.md`, `backlog.md` om de finns.
   Saknas mappen är butiken inte briefad ännu — leta i `git log --all` innan du
   drar slutsatsen (axelbältets minne låg på en gren i veckor medan CLAUDE.md
   sa att produkten var obriefad). Är den ärvd från Bäverbutiken står det
   överst i filen varifrån och vilket datum.

3. **Kör avläsningen.**
   `node factory/skalning.mjs <nyckel> --dagar 14`
   Den läser butikens annonser ur kontot, filtrerar på produktens prefix,
   kör ANALYSMETOD steg 0–7 och klassificerar varje bedömbar annons.
   Regel: filtret är spärren, inte en bekvämlighet — kontot delas av alla
   OPS-butiker och Bäverbutikens DK-kampanjer. Visa alltid raden om vad som
   slängdes; en tom lista betyder felstavat prefix, inte noll annonser.
   Regel: momsbeslutet är öppet (`factory/BESLUT-VANTAR.md` punkt 1), så
   break-even visas alltid på båda linjerna. En annons som ligger mellan dem
   får domen `beror_pa_moms` — ingen kill, inget skalningsbeslut på den.

4. **Läge TEST (Bäverbutiken) slutar här.**
   Rapportera tröskelläget. Passerades den: klistra in startskottet ordagrant
   som skriptet skrev det, och skriv en rad i produktens `batch-log.md`.
   Regel: **inga briefer i läge TEST.** Det är hela poängen med att
   Bäverbutiken är testbädd (`factory/TRAPPAN.md`). Gå inte vidare till steg 5.

5. **Creative-teardown (ANALYSMETOD steg 6b — tyngst vägande).**
   Skriptet klarar steg 0–7 utan 6b; det här steget är ditt.
   Ladda ner och granska varje bedömbar **bildannons** visuellt. Läs varje
   bedömbar **videos** manus ur vår egen brief (butikens minne eller
   Notion-itemet) — transkribera aldrig på gissning. Tagga variablerna
   (vinkel, hook-typ, format, proof, offer, visuell stil, textmängd, talare),
   gruppera vinstbidraget per variabelvärde, peka ut minst 3 mönster märkta
   bevisad/hypotes, och översätt vart och ett till en instruktion i nästa brief.
   Regel: en analys som stannar vid tabeller är bokföring, inte creative
   strategy. Saknas manusen: lista vilka videor det gäller i EN samlad fråga.

6. **Stäm av mot förra rondens hypoteser** och uppdatera `dna.md` (Winning /
   Losing DNA, data skilt från hypotes) och `batch-log.md` (utfall per annons).
   Regel: domar på 3–4 köp är preliminära och skrivs inte in i DNA förrän de
   överlevt en rond till.

7. **Bygg rondens produktionsplan.**
   `node factory/kadens.mjs` — eller mata in klassificeringen och backloggen i
   `byggKadens({ antalPerDag, dagar, vinnare, koncept, redigerare })`.
   Axels takt: **7 videor per dag per butik = 21 per rond**, hälften nya
   koncept och hälften varianter. Udda antal går till varianthalvan.
   Regel: en variant utan namngiven förälder och namngiven variabel ÄR inget
   variant — den räknas som ett nytt koncept. Ett nytt koncept utan källa
   (playbook-vinnare, winning line eller swipe) märks `GISSNING` i leveransen.
   Regel: nämn aldrig en redigerare som inte står i registret. Står ingen där
   skriver du "ingen redigerare tilldelad" — `factory/redigerare/standby.md`
   har noll rader.

8. **Skriv brieferna.**
   Ett item per creative, enligt leveransformatet i
   `.claude/commands/forsta-batch.md`. Varje brief taggar sina variabler i en
   rad högst upp, annars kan nästa rond inte gruppera vinstbidrag per variabel
   och lärandet dör. Annonsnamnen följer `docs/naming-convention.md` —
   `kadens.mjs` ger namnet för varje variant; läs av upptagna namn i kontot
   innan du numrerar.
   Regel: **brieferna är på engelska** (redigerarna är engelsktalande), och
   svenska manusrader ligger i en tabell `Swedish (use this) | English meaning`.

9. **Modellpolicyn (obligatorisk).**
   All slutgiltig ad copy, alla svenska manusrader och alla voiceovers skrivs
   av en subagent via Agent-verktyget med `model: "sonnet"` (eller `"haiku"`
   för bulkvarianter av samma line). Subagenten får produktens DNA, hypotesen,
   hooken, formatkraven **och `docs/copy-regler.md`** — och skriver bara text.
   Strategi, analys, klassificering och briefstruktur görs av huvudsessionen.
   Regel: aldrig tvärtom. Varje levererad rad redovisas mot tre-frågorstestet
   (visualisera / falsifiera / ingen annan kan säga det) med ✅/❌ per cell.
   En rad med ❌ går inte ut.

10. **Lägg batchen i butikens egen Notion-hub** enligt
    `docs/os/NOTION-FORMAT.md`: ett item per annons, namn = annonsnamnet,
    status `Draft`, briefen inklistrad i itemet.
    Regel: hubben ligger i butikens eget teamspace och klonas ur
    `Creative hub MALL` — aldrig byggd från noll, då blir statusarna svenska.
    Saknas hub-id i registret: rapportera det som en väntande uppgift, skriv
    inte briefer till Bäverbutikens hub.

11. **Logga och pusha.**
    `node factory/register.mjs log <nyckel> <antal>` (launchade creatives) och
    stäm av kördagen. Committa `factory/minne/<butik>/`,
    `factory/produkter/register.json` och eventuella yaml-ändringar, och pusha.
    Regel: minnet ligger i repot, aldrig i chatten. En rutin som inte pushar
    har inte lärt sig något.

12. **Rapportera i två listor:** "Gjort av mig" / "Väntar på en människa".
    Ett steg där någon ska klicka står aldrig i den första. Axels egna
    uppgifter sist, numrerade, en mening per rad.

---

## Så får en ny butik sin egen rutin

Varje OPS-butik har en egen schemalagd körning. Två saker gör att det fungerar:

**1. Rutinen MÅSTE bindas till en fast session.**
En rutin som startar en ny session varje gång har inget repo som källa, får
aldrig något credential av proxyn, och kan därför inte pusha — allt den lärde
sig dör med containern. Det är mätt fyra gånger i repot (CLAUDE.md).

```
create_session   source_url = repot, outcome_branch = main,
                 title = "Skalningskungen <butik>", tags = ["routine:skalningskungen-<butik>"]
create_trigger   persistent_session_id = <sessionens id>,
                 cron_expression = <daglig cron, se nedan>,
                 prompt = "/skalningskungen <nyckel>"
```
Kör `list_triggers` FÖRST — en dubblett skapades av misstag 2026-09-08 och
fick raderas.

**2. Cron är daglig; skriptet avgör om det är butikens dag.**
"Var tredje dag" går inte att uttrycka i cron över månadsskiften — samma
problem som `/commission` löste med daglig cron plus en kalenderspärr i
skriptet. Här sitter spärren i `arKordag()` i `factory/register.mjs`, och
steg 1 ovan är den.

**Så sprids butikerna över dygnen:** varje butik får ett `kordag_offset`
(0, 1 eller 2) och kör när `(dagnummer sedan 1970-01-01) % 3 === offset`.
Offseten tilldelas automatiskt som den **minst använda** — butik 1 får 0,
butik 2 får 1, butik 3 får 2, butik 4 börjar om på 0. Skälet till just den
regeln: alternativen var slump (kan lägga tre butiker på samma dag) eller
index i en sorterad lista (flyttar befintliga butiker när en ny tillkommer och
kan få dem att hoppa över en rond). Den minst använda offseten är både jämn
och stabil — en butik som fått sin dag behåller den för alltid.

Två undantag gör att ingen butik kan svälta: en butik som **aldrig körts** kör
direkt, och en butik som inte körts på **tre dygn** kör ändå (ikappkörning).

**Cron-tiden:** lägg butikerna på olika klockslag också, så två rutiner inte
läser samma konto samtidigt. Cron står i UTC och följer inte sommartid — räkna
alltid om från önskad svensk tid till UTC (CEST = UTC+2, CET = UTC+1).

**Connectors:** rutiner ärver inte sessionens MCP-connectors. Behöver rutinen
Notion måste connectorn kopplas på själva rutinen i Routines-vyn — annars går
den via `NOTION_TOKEN` och `tools/notion-klara.mjs`. Meta läses med
`META_ACCESS_TOKEN`, som `factory/skalning.mjs` redan gör.

---

## DEFINITION OF DONE

- [ ] Butiken uppslagen ur registret, kördagen kontrollerad och redovisad
- [ ] Rätt konto verifierat: läge SKALA = `915422744950975`, läge TEST = `1867947880635861`
- [ ] Prefixfiltret visat, med antalet bortfiltrerade rader och deras kampanjer
- [ ] **ANALYSMETOD.md:s snabbchecklista avbockad punkt för punkt i svaret**
- [ ] Break-even visad på BÅDA momslinjerna, antagandet utskrivet
- [ ] Vinstbidragstabellen visad — ranking på vinst, aldrig på ROAS eller CPA
- [ ] Signifikansgrinden: "för tidigt"-högen utpekad och utanför rankingen
- [ ] Top spendern behandlad som benchmark, inte som kandidat
- [ ] **Creative-teardown gjort**: bilder visuellt granskade, videomanus lästa,
      variabeltabell visad, ≥3 mönster märkta bevisad/hypotes och översatta
      till briefinstruktioner
- [ ] Läge TEST: tröskelläget rapporterat, startskott bara om tröskeln passerats,
      **noll briefer**
- [ ] Läge SKALA: kadensen visad (7/dag × 3 dagar), halvorna motiverade
- [ ] Varje variant pekar på namngiven förälder + namngiven variabel
- [ ] Varje nytt koncept pekar på en källa — annars märkt GISSNING
- [ ] Redigeraren namngiven ur registret, eller "ingen redigerare tilldelad"
- [ ] Copy/manus skrivna av sonnet/haiku-subagent, tre-frågorstestet redovisat
- [ ] Briefer på engelska, svenska manusrader i `Swedish (use this) | English meaning`
- [ ] Namngivningen följer `docs/naming-convention.md`, upptagna namn avlästa
- [ ] Batchen i butikens EGEN Notion-hub, status `Draft`
- [ ] Ingen status i annonskontot ändrad — noll skrivande Graph-anrop
- [ ] `dna.md` + `batch-log.md` + `register.json` uppdaterade i repot och pushade
- [ ] Slutrapport i två listor; Axels uppgifter sist, numrerade
