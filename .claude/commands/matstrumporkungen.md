# /matstrumporkungen – Skalningskungen i liten skala, bara för Matstrumpor

Argument: `$ARGUMENTS` — inget (full rond) eller `--larm` (läs och döm, rör
inga budgetar). Exempel: `/matstrumporkungen` · `/matstrumporkungen --larm`

Samma hjärna som Bäverbutikens **"Skalnings kungen"** (`/rond-auto`,
`agent/`-motorn), nedskalad till **en produkt, en kampanj, 6 briefer per
rond**. Det den ärver är ordningen — etikett → lärdom → brief — inte
volymen.

| | |
|---|---|
| Konto | **"nya kungen" `730973156224390`** — aldrig MagiBorsten |
| Kampanj | `MATSTRUMP_SALES_20260826` `120251217860260023`, CBO |
| Hub | `Matstrumpor creative hub` `3a7270ab-908c-80d2-9f35-e73e51e457ff` |
| Kadens | **6 briefer per rond, var tredje dag** (Axels beslut 2026-09-21) |
| Minne | `products/matstrumpor/` + `matstrumpor/logg.jsonl` |
| Facit | `matstrumpor/konfig.json`, `docs/os/ANALYSMETOD.md`, `docs/os/CS-KLART.md` |

⚠️ **Meta läses och skrivs via Adsmanager-MCP:n** — `META_ACCESS_TOKEN` nekas
på kontot (mätt 2026-09-21). Saknas `mcp__Adsmanager__*`: avbryt, rapportera,
gör ingenting.

⚠️ **Momsfrågan är öppen.** Break-even är **1,50 utan moms** och **2,14 med
moms** (AOV 462,10 kr uppmätt på 110 ordrar, kostnad 120,92 kr + 2,9 EUR
tull). En annons vars ROAS hamnar MELLAN linjerna får domen `BEROR_PA_MOMS`
och rörs inte. Sätt `ekonomi.moms_antagen` i konfigen när Axel svarat.

---

## Ronden, i ordning

1. **Ekonomin först.**
   ```bash
   node matstrumpor/kor.mjs --ekonomi
   ```
   Skriv ut båda linjerna i svaret, alltid, med antagandet utskrivet.
   Har priset eller AOV ändrats: `node matstrumpor/kor.mjs --aov` och skriv
   in det nya talet i konfigen (med datum och antal ordrar i kommentaren).

2. **Avläsningen.** Hämta kampanjen och alla annonser ur Meta med
   `mcp__Adsmanager__ads_get_ad_entities`, `7d_click`, två fönster:
   **14 dagar** (domarna) och **annonsens egna första vecka** (etiketten).
   Fält: `amount_spent`, `omni_purchase`, `purchase_roas`,
   `cost_per_omni_purchase`, `impressions`, `video_play_actions`,
   `video_thruplay_watched_actions`, `inline_link_clicks`,
   `omni_landing_page_view`, `created_time`, `effective_status`.
   Skriv siffrorna ORDAGRANT i en jobbfil — räkna aldrig i huvudet:
   ```json
   { "datum": "ÅÅÅÅ-MM-DD",
     "kampanj": { "spend_sek": 0, "roas": 0, "budget_d0": 1000, "budget_d7": 1000 },
     "annonser": [ { "namn": "…", "spend_sek": 0, "kop": 0, "roas": 0, "d0": "ÅÅÅÅ-MM-DD" } ] }
   ```
   ```bash
   node matstrumpor/kor.mjs --dom <jobbfil.json>
   ```
   Ut kommer vinstbidragstabellen (ranking på `(break-even-CPA − CPA) × köp`,
   **aldrig på ROAS eller CPA ensamt**), "för tidigt"-högen utanför
   rankingen, benchmarken, och etiketten per annons med
   breakthrough-frekvensen som bråk.

   Regler som ingen bedömning får runda:
   - **Ingen dom under 300 kr spend eller 3 köp.**
   - **Benchmarken dödas aldrig** — annonsen som bär > 30 % av vinsten (går
     ingen plus: > 30 % av spenden). Top spendern är riktmärke, inte en
     kandidat att döma mot småannonser.
   - **Kill mäts mot break-even**, aldrig mot en target-nivå.
   - **PAUSED med spend är ett beslut** och aktiveras aldrig.

3. **Lärdomen — och den här är inte valfri.**
   *(CS-KLART punkt 1–5: ingen annons är klar förrän lärdomen är skriven.)*
   ```bash
   node matstrumpor/kor.mjs --status
   ```
   För varje etiketterad annons utan lärdom, i ordningen breakthroughs →
   bedömbara → resten, skriv en lärdom i `products/matstrumpor/lardomar.md`:
   - batchnummer, utfall, annonsens spend OCH kampanjens spend i samma fönster
   - **alla hookar ordagrant** med hook rate och hold rate
   - ROAS eller CPA, och konverteringsgrad (saknas den: `okänd`, aldrig 0)
   - **planerat mot utfört per komponent** (avatar, vinkel, medvetandenivå,
     mekanism, tro, positionering, brådska) — stämde inte utförandet med
     briefen är det utförandet som föll, inte idén
   - en hypotes om VARFÖR, märkt **(gissning)**
   - och den slutar ALLTID med **konkreta nästa annonser**, med namn. Slutar
     den inte där är det en dagbok, inte ett system.
   Är annonsen en spend winner: **läs kommentarerna först**
   (`node tools/annonskommentarer.mjs --kampanj <id>`), sedan
   konverteringsgraden, sedan manuset. Kluster ≥ 3 invändningar ⇒ en brief
   som bemöter dem (`kalla=voc`).
   Logga varje skriven lärdom som `{kod:"LARDOM", annons, id:"L-<annons>"}`.

4. **Antalet briefer räknas — det bestäms inte.**
   `--status` ger brieftaket: **antalet briefer får aldrig överstiga antalet
   lärdomar skrivna sedan förra ronden.** Kadensen (6) är taket uppåt,
   lärdomarna är taket neråt. Är taket 0: skriv lärdomarna, kör om, bygg
   sedan. Budgeten styr aldrig antalet.

5. **Mixen kommer ur etiketterna.** Finns en levande breakthrough (≤ 28 dygn,
   inte tjuvpausad): **80 % vidarebyggen** på den, 20 % nya vinklar. Finns
   ingen: **80 % nya vinklar**. En ny vinkel är en annan avatar, ett annat
   begär eller en annan känslomässig ingång — samma löfte med nya ord är en
   iteration, inte en ny vinkel.

   Per utfall:
   - **Breakthrough** → tre iterationer inom 14 dagar: nya hookar (I1), längre
     problemdel (I2), in media res (I3). Aldrig en ren kopia.
   - **Spend winner** → diagnosen på konverteringsgraden, sedan manuset. Lägg
     till det som saknas (tro, brådska, insats, funnel-kongruens) — bygg inte
     om hela annonsen.
   - **KPI winner** → hook rate, sedan hold rate, sedan förbi hooken. Ingen
     spend på sju dagar = förlorare.
   - **Loser** → en lärdom, sedan släpp. Iterera bara om idén kom ur research.

6. **Briefarna.** Format och regler som `/cs`:
   - **På engelska** (redigerarna är engelsktalande), svenska manusrader i
     tabellen `Swedish (use this) | English meaning`.
   - Regi rad för rad i varje videobrief (`docs/os/BRIEF-REGI.md`).
   - Tre-frågorstestet på varje svensk rad; en rad med ❌ går inte ut.
   - Taggraden: `typ=N|IM|I · koncept · parent · iteration · lardom · kalla ·
     avatar · awareness · begar · mekanism · tro · urgency · hook-mekanik`.
     **Iterationsnumret räknas ur loggen**, aldrig ur briefens egen siffra.
   - **Namnen byggs med namnmotorn, aldrig för hand:**
     ```bash
     node matstrumpor/kor.mjs --namn <vinkel> <format> <antal>
     ```
     Julmaterial får vinkeln `jul` — det är den som styr adsetet vid
     uppladdningen.
   - **All slutgiltig copy och alla svenska manusrader skrivs av en subagent**
     (`model: "sonnet"`) som får DNA + hypotes + hook + formatkrav +
     `docs/copy-regler.md` (CLAUDE.md regel 6). Strategi, analys och
     briefstruktur gör du själv.
   - Raderna skapas i hubben med Typ `Video - Pending Approval` /
     `Image - Pending Approval`, Status `Draft`. **Hela briefen ligger i
     Notion-itemet** — aldrig en länk till en .md-fil.
   - Logga varje brief: `{kod:"BRIEF", annons, koncept, typ, parent, lardom, iteration}`.

7. **Budgetbesluten** *(hoppas över i läge `--larm`)*. En tabell FÖRE någon
   skrivning: nuvarande dagsbudget, föreslagen, varför. Spärrarna:
   - Rör aldrig något som ändrats de senaste 3 dygnen (loggen är facit).
   - Skala max **+20 %** per rond, och bara över break-even med ≥ 3 köp / 7 d.
   - Sänk max **−30 %** när CPA ligger mellan break-even och 1,5 × break-even.
   - Döda bara mot break-even, aldrig benchmarken.
   - Fler än 3 ändringar i ronden: lista dem och invänta Axels ok.
   Efter varje ändring: läs tillbaka `daily_budget`, visa gammalt → nytt,
   logga `{kod:"BUDGET", ...}` även när det misslyckades.

8. **Skriv minnet och pusha.** `products/matstrumpor/dna.md` (vad vi lärt oss
   om produkten), `batch-log.md` (batchen + hypoteserna + utfallet),
   `lardomar.md`, `matstrumpor/logg.jsonl`. Committa och pusha — minnet är
   filerna, aldrig chatten.

9. **Rapportera.** Två listor: "Gjort av mig" / "Väntar på en människa".
   Rapporten ska alltid innehålla: **breakthrough-frekvensen som bråk och
   procent** ("2 av 14, alltså 14 %"), hur många lärdomar som skrevs, och hur
   många briefer som byggde på en lärdom. Axels uppgifter sist, numrerade.

---

## DEFINITION OF DONE

- [ ] `ad_account_id` verifierat = `730973156224390`
- [ ] Båda momslinjerna utskrivna; antagandet sagt rakt ut
- [ ] Vinstbidragstabellen visad — ranking på vinst, aldrig ROAS/CPA ensamt
- [ ] "För tidigt"-högen utanför rankingen; benchmarken utpekad och orörd
- [ ] Etikett på varje annons som fyllt sju dygn; frekvensen som bråk + procent
- [ ] **Lärdom skriven för varje etiketterad annons som saknade en** — med hookar ordagrant, hypotes märkt (gissning) och konkreta nästa annonser
- [ ] Brieftaket räknat: briefer ≤ lärdomar sedan förra ronden
- [ ] Mixen ur etiketterna (80/20), inte ur en tabell
- [ ] Varje brief bär taggraden och pekar på sin lärdom; iterationsnumret ur loggen
- [ ] Namnen byggda med `--namn`; julmaterial har vinkeln `jul`
- [ ] Copyn skriven av subagent med `model: "sonnet"` + copy-reglerna
- [ ] Budgetändringar inom spärrarna, tillbakalästa, loggade (eller `--larm`: "inga budgetar rörda")
- [ ] Inget PAUSED aktiverat
- [ ] `logg.jsonl` + `products/matstrumpor/` committat och pushat
- [ ] Rapport i två listor; Axels uppgifter sist, numrerade
