# /skalningskungen – Budgetronden + OPS-larmet, var tredje dag

Argument: `$ARGUMENTS` — butikens nyckel ur registret (`butik/produkt`, eller
bara produkt-id om det är entydigt). Utan argument: alla produkter som har
kördag i dag. Exempel: `/skalningskungen` · `/skalningskungen tankguard`
· `/skalningskungen motorholjet`

**Uppdraget smalnade 2026-09-10 (Axels beslut).** Skalningskungen gör EXAKT
två saker, och ingenting annat:

1. **Döda, skala eller ändra budget** på annonserna vi kör — Bäverbutiken
   (MagiBorsten `1867947880635861`) och OPS-butikerna (MagiBorsten DK
   `915422744950975`).
2. **Larma när en produkt ska bli OPS** — ett produkttest som går väldigt
   bra, eller en produkt som inte fått egen butik än och går bra. Larmet
   är ETT Discord-meddelande med ping till Axel. Inte en Notion-sida, inte
   en brief, inte en butik.

**Det den INTE gör längre:** creative strategy, teardown, hypoteser,
kadens, briefer, Notion-items. Vill Axel ha nya annonser till en butik
säger han det själv (`/cs`-familjen). Ronden bygger aldrig "ett helt nytt
skit" — den dömer siffror och skickar ett larm.

**Läget `larm` — bara larmet, inga budgetar** (Axels beslut 2026-09-10: den
gamla budgetrutinen "Skalnings kungen" på hans andra konto litar han på och
den rörs inte; larmet körs separat). `/skalningskungen larm` gör steg 1, 2
och 5 — läser kontot, dömer tröskeln, skickar larmet — och **hoppar över
steg 3–4 helt**. I det läget görs NOLL skrivande Graph-anrop: ingen budget,
ingen status, ingenting. Rutinen "Skalningskungen larm" (fast session,
07:45 svensk tid) kör exakt så. Rapporten säger "läge larm — inga budgetar
rörda" på första raden.

Kravspec: `factory/SKALNINGSKUNGEN.md` · `docs/os/ANALYSMETOD.md` (hur data
läses — obligatorisk, kortas aldrig ner) · `factory/TRAPPAN.md` (när en
produkt hör hemma var).

⚠️ **Rutinen på claude.ai heter "Skalnings kungen"** och kör dagligen 07:30
svensk tid. Den här filen är dess prompt. Uppdateras filen på `main`
uppdateras rutinen — den klonar `main` varje körning.

---

Gör i ordning, utan att invänta godkännande mellan stegen:

1. **Kördag och konto.** `node factory/register.mjs <nyckel> --idag <YYYY-MM-DD>`
   (utan nyckel: `node factory/register.mjs --idag <datum>` listar dagens).
   Registret upptäcks ur `factory/butiker/*.yaml`, `factory/produkter/*.yaml`,
   `factory/state/` och `products/products.json` — ingen handskriven lista.
   Regel: läge TEST = Bäverbutikens konto, läge SKALA = OPS-kontot.
   Kontrollera `ad_account_id`, aldrig kontonamnet — fyra konton heter
   nästan samma sak, och fel konto kostar riktiga pengar.

2. **Avläsningen.** `node factory/skalning.mjs <nyckel> --dagar 14`
   Filtrerar på produktens prefix, kör ANALYSMETOD steg 0–7, klassificerar
   varje bedömbar annons. Visa alltid raden om vad som slängdes — en tom
   lista betyder felstavat prefix, inte noll annonser. Break-even visas på
   båda momslinjerna tills `ekonomi.moms_antagen` säger vilken som gäller;
   en annons mellan linjerna får `beror_pa_moms` och rörs inte.
   Regel: **ingen dom under 300 kr spend eller 3 köp.** Top spendern är
   benchmark, inte en kandidat att döma mot småannonser. Ranking på
   vinstbidrag `(break-even-CPA − CPA) × köp`, aldrig på ROAS eller CPA ensamt.

3. **Budgetbesluten — en tabell FÖRE någon skrivning.** *(Hoppas över i läge `larm`.)*
   En rad per kampanj/adset: nuvarande dagsbudget, föreslagen, varför.
   Spärrarna, som ingen bedömning får runda:
   - **Kadensspärren:** rör aldrig något som ändrats de senaste 3 dygnen.
     Loggen är `factory/budgetlogg.jsonl` (en rad per ändring med
     `datum`, `ad_account_id`, `kampanj_id`, `ny_budget`, `motivering`,
     `genomford`). Saknas loggen: läs `updated_time` ur kontot.
   - **Skala:** max **+20 %** per rond, och bara när annonsen ligger över
     break-even med ≥ 3 köp de senaste 7 dagarna.
   - **Sänk:** max **−30 %** per rond när CPA ligger över break-even men
     under 1,5 × break-even.
   - **Döda:** bara mot **break-even** (`break_even_cpa_sek` /
     `break_even_roas`), aldrig mot target-nivån, och aldrig en annons som
     står för > 30 % av produktens vinstbidrag — den är benchmarken.
   - **PAUSED med spend är ett beslut.** Aktivera ALDRIG något som är
     pausat, oavsett hur namnet ser ut (incident 2026-08-29/30).
   - **Test-ABO:n rörs inte** (regel 11): nya tester har lika budget per
     annons tills testet är läst; budgetändringar gäller skalningens CBO.
   - **Fler än 3 ändringar i ett konto i samma rond:** lista dem och
     invänta Axels ok. Under det: kör.

4. **Skriv budgeten — och läs tillbaka.** *(Hoppas över i läge `larm`.)*
   All Graph-skrivning går genom `tools/meta-lib.mjs` (saknas en
   budgetfunktion där: lägg till EN, `uppdateraBudget`, med tillbakaläsning
   — bygg aldrig egna anrop utanför lagret). Efter varje ändring: läs
   `daily_budget` igen och visa gammalt → nytt. Meta tvångspausar ibland
   vid budgetändring — sätt då ACTIVE igen **enbart på exakt det du själv
   nyss ändrade**, verifierat med tillbakaläsning.
   Skriv loggraden i `factory/budgetlogg.jsonl` för varje ändring, även
   misslyckade (`genomford: false` + felet).

5. **OPS-larmet.** Passerar en produkt i läge TEST tröskeln (`troskelkoll`,
   `1 500 kr spend OCH ≥ 20 % vinst` — nivån är ett öppet ägarbeslut,
   överstyrs per butik i `register.json`), eller går en produkt utan egen
   butik tydligt bra: bygg jobbfilen ur avläsningen och kör
   ```
   node factory/startskott.mjs --jobb <fil.json> --discord
   ```
   Det postar **"KLAR FÖR OPS: <produkt>"** + siffrorna + `/ny-ops <länk>`
   i kanalen `#ops-startskott` på Discord-servern Bäverbutiken och pingar
   serverns ägare. Boten hittar servern, skapar kanalen om den saknas och
   hittar ägaren själv — ingen människa skapar något (Axel 2026-09-10).
   Regel: larmet är idempotent — en gång per kampanj (`startskottHarGatt`),
   inte varje rond. Faller Discord-steget (token saknas, boten inte i
   servern): larmet står ändå i rapporten, med felet — aldrig tyst.
   Skriv en rad i produktens `batch-log.md`. Sen är produkten Axels: ronden
   bygger aldrig butiken.

6. **Logga och pusha.** `factory/budgetlogg.jsonl`,
   `factory/produkter/register.json`, `batch-log.md`. Committa och pusha.
   Regel: en rutin som inte pushar har inte lärt sig något.

7. **Rapportera i två listor:** "Gjort av mig" (varje budgetändring, gammalt
   → nytt, tillbakaläst) / "Väntar på en människa" (larm, ändringar över
   spärren). Axels uppgifter sist, numrerade, en mening per rad. Har inget
   ändrats: säg det i en rad — inget larm är också ett resultat.

---

## Prompten till rutinen (klistra in i Routines-vyn om den saknas)

```
/skalningskungen larm
```

Det räcker — kommandofilen är prompten. Utan `larm` gör ronden budgetarna
också; det läget är INTE schemalagt någonstans (Axels beslut 2026-09-10 —
den gamla budgetrutinen på hans andra konto gäller tills han säger annat). Rutinen ska vara bunden till en
**fast session** med repot som källa och `main` som utgren (`create_session`
med `source_url` + `outcome_branch`, sen `create_trigger` med
`persistent_session_id`), annars kan den inte pusha loggen. Kör
`list_triggers` FÖRST — en dubblett skapades 2026-09-08 och fick raderas.
Cron står i UTC: 07:30 CEST = `30 5 * * *`, 07:30 CET = `30 6 * * *`.

Miljön rutinen behöver: `META_ACCESS_TOKEN` och `DISCORD_BOT_TOKEN`.
Valfri överstyrning: `DISCORD_STARTSKOTT_SERVER` (annan server),
`DISCORD_STARTSKOTT_KANAL` (annat kanalnamn), `DISCORD_AXEL_ID` (pinga
någon annan än serverägaren).

---

## DEFINITION OF DONE

- [ ] Kördagen kontrollerad; rätt konto verifierat på `ad_account_id`
- [ ] Prefixfiltret visat, med antalet bortfiltrerade rader
- [ ] **ANALYSMETOD.md:s snabbchecklista avbockad punkt för punkt**
- [ ] Break-even på båda momslinjerna, antagandet utskrivet
- [ ] Vinstbidragstabellen visad — ranking på vinst, aldrig ROAS/CPA ensamt
- [ ] Signifikansgrinden: "för tidigt"-högen utanför rankingen
- [ ] Budgettabellen visad FÖRE skrivning; varje ändring inom spärrarna
- [ ] Varje ändring tillbakaläst: gammalt → nytt; loggrad skriven
- [ ] Inget PAUSED aktiverat; test-ABO orört
- [ ] OPS-larm skickat till Discord om tröskeln passerats — annars
      "tröskeln inte passerad" med siffror; aldrig två larm för samma kampanj
- [ ] **Noll briefer, noll Notion-items, noll creative strategy**
- [ ] `budgetlogg.jsonl` + `register.json` + `batch-log.md` pushade
- [ ] Slutrapport i två listor; Axels uppgifter sist, numrerade
