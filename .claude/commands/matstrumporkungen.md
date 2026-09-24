# /matstrumporkungen – Skalningskungen i liten skala, bara för Matstrumpor

Argument: `$ARGUMENTS` — normalt inget. `nu` tvingar en rond även om det inte
är kördag (Axel för hand). Exempel: `/matstrumporkungen` · `/matstrumporkungen nu`

## ⛔ DEN HÄR RONDEN SKALAR ALDRIG

**Axels beslut 2026-09-21: "jag vill inte att claude ska skala på matstrumpor
utan det är jag som gör det, claude får gärna ge mig tips."**

Ronden gör **noll skrivande Graph-anrop på budget och status**. Ingen höjning,
ingen sänkning, ingen paus, ingen aktivering — inte ens inom spärrarna, inte
ens när siffrorna är tydliga. Den läser, dömer och **föreslår**. Axel trycker
på knappen. `matstrumpor/meta.mjs` har inga skrivfunktioner alls — det som
inte finns kan inte köras av misstag.

Det enda som skriver i Meta för Matstrumpor är `/matstrumpor`: nya annonser i
rätt adset. Allt den här ronden gör i Meta är att läsa.

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
| Rutin | **07:00 svensk tid varje dag** — `kor.mjs --kordag` avgör om det är rond (var tredje dag från förra rondens `ROND_KLAR`). Byggd 2026-09-22 |
| Budget | **Axel skalar själv.** Ronden föreslår, rör aldrig en budget |
| Minne | `products/matstrumpor/` + `matstrumpor/logg.jsonl` |
| Facit | `matstrumpor/konfig.json`, `docs/os/ANALYSMETOD.md`, `docs/os/CS-KLART.md` |

**CONNECTORS: inga.** Rutinen behöver inga MCP-connectors: Meta läses via
`META_ACCESS_TOKEN` (`kor.mjs --hamta`), Notion via `NOTION_TOKEN`
(`tools/notion-brief.mjs`, `tools/notion-klara.mjs`), Shopify via fabrikens
nycklar (`--aov`). Ingen godkännanderuta, ingen som klickar.
⚠️ Åtkomsten till kontot gavs 2026-09-22 (mätt: `GET act_730973156224390`
→ `nya kungen`); till och med 2026-09-21 nekades token:en och ronden läste
via `mcp__Adsmanager__*`. Den vägen är nu bara en RESERV i en interaktiv
session: felar `--hamta` med `(#200)` igen, säg det rakt ut i rapporten —
en rutin utan MCP kan då inte läsa kontot och ska sluta där, inte gissa.

**Momsen är besvarad** (Axel 2026-09-21: "Matstrumpor utan moms",
`ekonomi.moms_antagen: false`) ⇒ break-even **1,498** / break-even-CPA
**308,48 kr**. Båda linjerna (1,50 utan / 2,14 med) skrivs ändå ut i varje
rond, med antagandet utskrivet. Ändras beskedet: sätt `true` i konfigen,
räkna aldrig om i huvudet.

---

## Ronden, i ordning

Ett kommando per Bash-anrop, kedja aldrig med skaloperatorer —
behörighetsreglerna matchar på första ordet.

0. **Repot och kördagen.**
   ```bash
   git pull --rebase origin main
   node matstrumpor/kor.mjs --kordag
   ```
   Rutinens session lever kvar mellan körningarna — utan pull kör den förra
   veckans kod och ser aldrig en rättad konfig. Misslyckas pullen (konflikt):
   `git rebase --abort`, skriv det i rapporten och fortsätt med den kod som
   finns.
   `--kordag`: **exit 0 = rond i dag. Exit 2 = ingen rond:** skriv EN rad
   ("Ingen rond i dag — nästa <datum>") och sluta. Inga anrop, ingen rapport.
   Kadensen (`kadens.rond_var_n_dag` i konfigen) räknas från förra rondens
   `ROND_KLAR` i loggen — inte från ett kalenderrutnät, så en missad morgon
   ger rond nästa morgon i stället för tre dagar senare. Skrev Axel `nu` som
   argument körs ronden oavsett vad `--kordag` säger.

1. **Ekonomin först.**
   ```bash
   node matstrumpor/kor.mjs --ekonomi
   ```
   Skriv ut båda linjerna i svaret, alltid, med antagandet utskrivet.
   Har priset eller AOV ändrats: `node matstrumpor/kor.mjs --aov` och skriv
   in det nya talet i konfigen (med datum och antal ordrar i kommentaren).

2. **Avläsningen.** Ur Meta via token, aldrig ur huvudet:
   ```bash
   node matstrumpor/kor.mjs --hamta
   node matstrumpor/kor.mjs --dom matstrumpor/output/avlasning-<datum>.json --json
   ```
   `--hamta` läser kampanjen och alla annonser med `7d_click` i två fönster —
   **14 dagar** (domarna) och **annonsens egna första vecka `[D0, D0+6]`**
   (etiketten) — plus kampanjens spend i samma fönster och budgethistoriken
   ur kontots aktivitetslogg (så etiketten ser om budgeten höjdes under
   veckan). Siffrorna skrivs ORDAGRANT till jobbfilen
   (`matstrumpor/output/`, gitignorerad): `amount_spent`, `omni_purchase`,
   `purchase_roas`, `cost_per_omni_purchase`, `impressions`,
   `video_play_actions`, `video_thruplay_watched_actions`,
   `inline_link_clicks`, `omni_landing_page_view`, `created_time`,
   `effective_status`. Kontot och kampanjnamnet kontrolleras mot konfigen
   innan något läses — fel konto avbryter.
   Reserven, BARA i en interaktiv session om token-vägen felar: hämta samma
   fält med `mcp__Adsmanager__ads_get_ad_entities` och skriv jobbfilen för
   hand i samma format (`{ datum, kampanj: { spend_sek, roas, budget_d0,
   budget_d7 }, annonser: [{ namn, spend_sek, kop, roas, d0 }] }`).
   Ut ur `--dom` kommer vinstbidragstabellen (ranking på `(break-even-CPA −
   CPA) × köp`, **aldrig på ROAS eller CPA ensamt**), "för tidigt"-högen
   utanför rankingen, benchmarken, etiketten per annons på dess egen första
   vecka med breakthrough-frekvensen som bråk, och listan på annonser vars
   första vecka inte är slut (ingen etikett än). `--json` skriver domen till
   `matstrumpor/output/dom-<datum>.json` — läs ETIKETT-raderna därifrån när
   du loggar, skriv aldrig av dem för hand.

   Regler som ingen bedömning får runda:
   - **Ingen dom under 300 kr spend eller 3 köp.**
   - **Benchmarken dödas aldrig** — annonsen som bär > 30 % av vinsten (går
     ingen plus: > 30 % av spenden, då riktmärke men inte skyddad). Top
     spendern är riktmärke, inte en kandidat att döma mot småannonser.
   - **Kill mäts mot break-even**, aldrig mot en target-nivå.
   - **PAUSED med spend är ett beslut** och aktiveras aldrig.
   - **Etiketten skrivs en gång** (`{kod:"ETIKETT", datum, annons, etikett,
     bedombar, andel, fonster, spend_sek, kop, roas, orsak}`) och ändras
     aldrig, utom uppgradering till BREAKTHROUGH. Annonser som redan har en
     ETIKETT-rad i loggen etiketteras inte om.

3. **Lärdomen — och den här är inte valfri.**
   *(CS-KLART punkt 1–5: ingen annons är klar förrän lärdomen är skriven.)*
   ```bash
   node matstrumpor/kor.mjs --status
   ```
   För varje etiketterad annons utan lärdom, i ordningen breakthroughs →
   bedömbara → resten, skriv en lärdom i `products/matstrumpor/lardomar.md`:
   - batchnummer, utfall, annonsens spend OCH kampanjens spend i samma fönster
   - **alla hookar ordagrant** med hook rate och hold rate (jobbfilen bär
     `hook_rate` = videostarter/visningar och `hold_rate` =
     thruplay/videostarter per annons — hookens TEXT hämtas ur briefen i
     hubben, `node tools/notion-klara.mjs --brief <page-id>`)
   - ROAS eller CPA, och konverteringsgrad (`konv_lpv` = köp per
     landningssidevisning; saknas den: `okänd`, aldrig 0)
   - **planerat mot utfört per komponent** (avatar, vinkel, medvetandenivå,
     mekanism, tro, positionering, brådska) — stämde inte utförandet med
     briefen är det utförandet som föll, inte idén
   - en hypotes om VARFÖR, märkt **(gissning)**
   - och den slutar ALLTID med **konkreta nästa annonser**, med namn. Slutar
     den inte där är det en dagbok, inte ett system.
   Är annonsen en spend winner: **läs kommentarerna först**
   (`node tools/annonskommentarer.mjs --konto 730973156224390 --kampanj <id> --sidtoken-env META_ACCESS_TOKEN_MATSTRUMPOR` — sidan ligger i Business Manager Matstrumpor.se, inte i SnarkLös där `META_ACCESS_TOKEN` hör hemma, så kommentarerna kräver den egna token:en; saknas den i miljön: säg det i rapporten och gå vidare), sedan
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
   - Regi rad för rad i varje videobrief (`docs/os/BRIEF-REGI.md`); spärren
     `node tools/briefgranskning.mjs --rad <brief.md>` före Notion — exit 1 =
     ingen rad.
   - Tre-frågorstestet på varje svensk rad; en rad med ❌ går inte ut.
   - Butikens namn står aldrig i en annons (Axels beslut 2026-09-18).
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
   - Raderna skapas i hubben **via REST, aldrig via MCP i rutinen**:
     ```bash
     node tools/notion-brief.mjs --hub 3a7270ab-908c-80d2-9f35-e73e51e457ff --namn <annonsnamn> --typ video|bild --brief <fil.md> --torr
     node tools/notion-brief.mjs --hub 3a7270ab-908c-80d2-9f35-e73e51e457ff --namn <annonsnamn> --typ video|bild --brief <fil.md> --json
     ```
     Typ `Video - Pending Approval` / `Image - Pending Approval`, Status
     `Draft`. **Hela briefen ligger i Notion-itemet** — aldrig en länk till
     en .md-fil. Finns raden redan hoppar verktyget över den och säger det.
   - Logga varje brief: `{kod:"BRIEF", annons, koncept, typ, parent, lardom, iteration}`.

7. **Tipsen till Axel — förslag, aldrig ändringar.**
   En tabell: rad, nuläge, vad jag skulle göra, och **varför i en mening**.
   Siffran bakom varje rad ska stå där, annars är det en åsikt.
   - **Kandidater att pausa:** bedömbar, under break-even, negativt
     vinstbidrag — med kronorna det kostar per 14 dagar.
   - **Kandidater att skala:** över break-even med ≥ 3 köp de senaste 7 dygnen.
     Skriv ut hur mycket (+20 % är motorns normalsteg) och vad det bygger på.
   - **Rör inte:** benchmarken, allt under grinden, allt som redan är pausat.
   Sortera på kronor, mest först. Är listan tom: säg det i en rad.
   **Utför ingenting av det här.** Ingen budgetändring, ingen paus, ingen
   aktivering — inte via token, inte via MCP — oavsett hur tydlig siffran
   är. Loggas som `{kod:"FORSLAG", …}` så nästa rond ser vad som föreslogs
   och vad Axel valde.

8. **Skriv minnet, stäng ronden, pusha.** `products/matstrumpor/dna.md` (vad
   vi lärt oss om produkten), `batch-log.md` (batchen + hypoteserna +
   utfallet), `lardomar.md`, `matstrumpor/logg.jsonl`. Sist:
   ```bash
   node matstrumpor/kor.mjs --rond-klar
   git pull --rebase origin main
   git add matstrumpor/logg.jsonl matstrumpor/konfig.json products/matstrumpor
   git commit -m "matstrumporkungen: <datum> — <N> etiketter, <M> lärdomar, <K> briefer, <F> förslag"
   git push origin main
   ```
   `ROND_KLAR` är det `--kordag` räknar nästa rond från — glöms den går
   ronden igen i morgon. Committa aldrig `matstrumpor/output/`. Minnet är
   filerna, aldrig chatten. Nekas pushen: skriv det som första rad i
   rapporten.

9. **Rapportera.** Två listor: "Gjort av mig" / "Väntar på en människa".
   Rapporten ska alltid innehålla: **breakthrough-frekvensen som bråk och
   procent** ("2 av 14, alltså 14 %"), hur många lärdomar som skrevs, och hur
   många briefer som byggde på en lärdom. Tipstabellen (steg 7) står med i
   sin helhet. Axels uppgifter sist, numrerade.

---

## DEFINITION OF DONE

- [ ] Repot pullat och `--kordag` kontrollerad (exit 0, eller `nu` som argument)
- [ ] `ad_account_id` verifierat = `730973156224390`
- [ ] Båda momslinjerna utskrivna; antagandet sagt rakt ut
- [ ] Avläsningen gjord med `--hamta` (token) — eller reserven namngiven och skälet utskrivet
- [ ] Vinstbidragstabellen visad — ranking på vinst, aldrig ROAS/CPA ensamt
- [ ] "För tidigt"-högen utanför rankingen; benchmarken utpekad och orörd
- [ ] Etikett på varje annons som fyllt sju dygn (på dess egen första vecka); frekvensen som bråk + procent; unga annonser namngivna utan etikett
- [ ] **Lärdom skriven för varje etiketterad annons som saknade en** — med hookar ordagrant, hypotes märkt (gissning) och konkreta nästa annonser
- [ ] Brieftaket räknat: briefer ≤ lärdomar sedan förra ronden
- [ ] Mixen ur etiketterna (80/20), inte ur en tabell
- [ ] Varje brief bär taggraden och pekar på sin lärdom; iterationsnumret ur loggen
- [ ] Namnen byggda med `--namn`; julmaterial har vinkeln `jul`
- [ ] Copyn skriven av subagent med `model: "sonnet"` + copy-reglerna
- [ ] Briefraderna skapade via `tools/notion-brief.mjs` (NOTION_TOKEN), aldrig via MCP
- [ ] **Noll budgetändringar, noll pausningar, noll aktiveringar** — tipsen är en lista, inte en handling
- [ ] Tipsen sorterade på kronor, med siffran bakom varje rad
- [ ] Inget PAUSED aktiverat
- [ ] `ROND_KLAR` loggad; `logg.jsonl` + `products/matstrumpor/` committat och pushat till `main`
- [ ] Rapport i två listor; Axels uppgifter sist, numrerade
