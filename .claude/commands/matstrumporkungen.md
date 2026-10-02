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
| Facit | `matstrumpor/konfig.json`, `docs/os/ANALYSMETOD.md`, `docs/os/CS-KLART.md`, **`docs/os/evolve/ITERATIONS-PLAYBOOK.md`** (Evolves utfall, felkatalog och iterationer, läst ur kursen 2026-10-01) |
| Arkivet | `products/matstrumpor/arkiv.md` (committas) + `arkiv.json` (gitignorerad), byggt av koden varje rond (`--arkiv`) ur loggen + `matstrumpor/arkiv/matningar.jsonl` |

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

0. **Repot, Trustpilot och kördagen.**
   ```bash
   git pull --rebase origin main
   node matstrumpor/trustpilot.mjs --skarpt
   node matstrumpor/kor.mjs --kordag
   ```
   Rutinens session lever kvar mellan körningarna — utan pull kör den förra
   veckans kod och ser aldrig en rättad konfig. Misslyckas pullen (konflikt):
   `git rebase --abort`, skriv det i rapporten och fortsätt med den kod som
   finns.
   **Trustpilot körs VARJE dag, före kördagsfrågan** (Axels beställning
   2026-09-29: betyget och omdömena på matstrumpor.se). Skriptet läser
   betyget och de senaste omdömena från Trustpilot, skriver dem i butikens
   metafält `matstrumpor.trustpilot` (bara när något ändrats) och skriver
   `matstrumpor/trustpilot/data.json`. Ändrades filen: committa och pusha den
   direkt (`git add matstrumpor/trustpilot/data.json && git commit -m
   "Trustpilot Matstrumpor <datum>: <poäng> av 5, <antal> omdömen" && git push
   origin main`), oavsett om det blir rond. Felar skriptet: skriv orsaken som
   en rad, rör inget annat och fortsätt — sajten visar då förra värdet.
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
   node matstrumpor/kor.mjs --dom-alla --json --logga
   node matstrumpor/kor.mjs --arkiv
   ```
   `--hamta` läser **Sverige och varje utlandskampanj** ur
   `matstrumpor/marknader/annonser/lage.json` (14 st 2026-10-01; före det
   läste ronden bara Sverige och utlandet fick aldrig en etikett). En fil per
   kampanj: `output/avlasning-<datum>.json` (SE) och
   `output/avlasning-<datum>-<KOD>.json`. Per kampanj: alla annonser med
   `7d_click` i **14 dagar** (domarna), **annonsens egna första vecka
   `[D0, D0+6]`** och **vecka 2 och 3** (omprövningen), kampanjens dagserie
   (veckan FÖRE annonsen = W0) och budgethistoriken ur aktivitetsloggen.
   **D0 = max(annonsen skapad, kampanjens första spenddag)**: utlandets
   annonser byggdes PAUSED 27–30/9 och kampanjerna startar 2/10, så utan det
   hade alla 112 fått INGEN_LEVERANS den 8/10. En kampanj som inte spenderat
   ger en rad, ingen etikett. Kontot och kampanjnamnet kontrolleras innan
   något läses — fel konto avbryter. Varje avläsning lägger dessutom en rad
   per annons med spend i **`matstrumpor/arkiv/matningar.jsonl`** (committas:
   det är arkivets minne, Metas tal dör annars med containern).
   **Videomåtten ur `value`, aldrig `7d_click`** (mätt 2026-10-01: med
   attributionsfönster bär raden en `7d_click`-nyckel som inte är visningar):
   `hook_rate` = 3-sekundersvisningar (`actions:video_view`) / impressions,
   `hold_rate` = ThruPlay / impressions, `hook_till_hold` = ThruPlay /
   3-sekundersvisningar — Evolves definitioner. Före 2026-10-01 var hook rate
   videostarter/impressions (~0,93 på allt) och hold rate thruplay/videostarter;
   lärdomar skrivna före dess bär de gamla talen.
   Reserven, BARA i en interaktiv session om token-vägen felar: hämta samma
   fält med `mcp__Adsmanager__ads_get_ad_entities` och skriv jobbfilen för
   hand i samma format (`{ datum, kampanj: { spend_sek, roas, budget_d0,
   budget_d7 }, annonser: [{ namn, spend_sek, kop, roas, d0 }] }`).
   Ut ur `--dom-alla` kommer per kampanj: vinstbidragstabellen (bara Sverige —
   ranking på `(break-even-CPA − CPA) × köp`, **aldrig på ROAS eller CPA
   ensamt**; utlandet saknar break-even per marknad, `cogs.json`), "för
   tidigt"-högen, benchmarken, etiketterna (vecka 1 + uppgraderingar vecka
   2–3), de unga och **hit rate** = (breakthrough + spend winner) / alla
   etiketterade, med och utan INGEN_LEVERANS i nämnaren. `--logga` skriver
   ETIKETT-raderna i loggen (koden, aldrig för hand, aldrig dubbelt — den läser
   loggen först). `--json` skriver `output/dom-<datum>[-<KOD>].json`.
   `--arkiv` bygger om **`products/matstrumpor/arkiv.md` + `arkiv.json`**:
   varje test med typ (IDEA/ITER/IMIT), kedja förälder → iterationer, varianter
   per löpnummer, koncepten mot taket, och vinstbidrag + hit rate per typ,
   kreatör, vinkel, format, marknad och playbook-iteration. Läs den innan
   du briefar — det är Evolves "Ad Roadmap".

   Regler som ingen bedömning får runda:
   - **Ingen dom under 300 kr spend eller 3 köp.**
   - **Benchmarken dödas aldrig** — annonsen som bär > 30 % av vinsten (går
     ingen plus: > 30 % av spenden, då riktmärke men inte skyddad). Top
     spendern är riktmärke, inte en kandidat att döma mot småannonser.
   - **Kill mäts mot break-even**, aldrig mot en target-nivå.
   - **PAUSED med spend är ett beslut** och aktiveras aldrig.
   - **Etiketten för vecka 1 skrivs en gång** (`{kod:"ETIKETT", datum,
     annons, marknad, etikett, vecka, bedombar, andel, tillvaxt, fonster,
     spend_sek, kop, roas, orsak}`) och skrivs aldrig om. **Vecka 2 och 3 får
     UPPGRADERA** (Evolve: en KPI winner kan bli breakthrough vecka 2–3), aldrig
     sänka, och bara när uppgraderingen bär: spend winner/breakthrough, eller
     över grinden 300 kr / 3 köp (mätt 2026-10-01: utan grinden blev tio
     annonser KPI winner på ett köp för 18–117 kr). Raden bär
     `uppgradering_fran`.
   - **Breakthrough kräver att kampanjens SPEND växte ≥ 10 % mot veckan före
     annonsen** (Evolves mått), inte att budgeten höjdes. Står
     `yttre_handelse` på raden höjde någon budgeten för hand i fönstret: säg i
     lärdomen om annonsen bar höjningen eller bara åkte med (Nathalie 23/9:
     1 000 → 10 000 kr samma dag — spenden växte ändå +30 % veckan innan).

3. **Lärdomen — och den här är inte valfri.**
   *(CS-KLART punkt 1–5: ingen annons är klar förrän lärdomen är skriven.)*
   ```bash
   node matstrumpor/kor.mjs --status
   ```
   För varje etiketterad annons utan lärdom, i ordningen breakthroughs →
   bedömbara → resten, skriv en lärdom i `products/matstrumpor/lardomar.md`:
   - batchnummer, utfall, annonsens spend OCH kampanjens spend i samma fönster
   - **alla hookar ordagrant** med hook rate, hold rate och hook→hold
     (jobbfilen: `hook_rate` = 3 s-visningar/impressions, `hold_rate` =
     ThruPlay/impressions, `hook_till_hold` = ThruPlay/3 s-visningar; Nathalies
     vinnare 2026-10-01: 0,47 / 0,15 / 0,31 — hookens TEXT hämtas ur briefen i
     hubben, `node tools/notion-klara.mjs --brief <page-id>`)
   - **felet ur felkatalogen** (`FEL` i `matstrumpor/lardom.mjs`, 1–14 ur
     `docs/os/evolve/ITERATIONS-PLAYBOOK.md` avsnitt 3): vilket nummer, och
     vilket mått som visar det. Utfallet avgör vilka fel som ens är möjliga
     (`PLAYBOOK_PER_UTFALL`): en loser kan ha fel 1–8, en spend winner 2.5,
     7, 9–12, en breakthrough 2, 13, 14.
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

   Per utfall — iterationerna ur `PLAYBOOK_PER_UTFALL` / `ITERATIONER`
   (`matstrumpor/lardom.mjs`, ordagrant ur Evolves playbook):
   - **Breakthrough** → alltid, alla tre typerna (ITER + IDEA + IMIT). De två
     första iterationerna: **längre problemdel (`manus-5`)** och **en
     medvetandenivå upp eller ner (`manus-6`)**, sedan nya hookar (`manus-4`),
     format (`format-1`, `format-2`, `format-11`, `format-12`). Aldrig en ren
     kopia. Stäng aldrig av den för att ROAS sjunker när den skalas.
   - **Spend winner** → diagnosen på konverteringsgraden och hook→hold, sedan
     manuset. Lägg till det som saknas (`manus-1`, `manus-3`, `manus-7`) —
     bygg inte om hela annonsen. Fällan: hooken kan vara rotorsaken.
   - **KPI winner / loser** → hitta felet i UTFÖRANDET (fel 1–8). Iterera bara
     om idén kom ur research; en imitation som förlorat itereras aldrig.
   **Taket per koncept** (`konceptStatus`, `--status` och arkivet): tre försök
   MED UTFALL (en etikett) utan att nå förälderns nivå ⇒ släpp, om källan är
   svag. Briefer utan etikett räknas inte — då väntar konceptet
   (`VANTA_UTFALL`) och nya iterationer på samma koncept briefas inte förrän
   de första tre har fått sitt utfall.

6. **Briefarna.** Format och regler som `/cs`:
   - **På engelska** (redigerarna är engelsktalande), svenska manusrader i
     tabellen `Swedish (use this) | English meaning`.
   - Regi rad för rad i varje videobrief (`docs/os/BRIEF-REGI.md`); spärren
     `node tools/briefgranskning.mjs --rad <brief.md>` före Notion — exit 1 =
     ingen rad.
   - Tre-frågorstestet på varje svensk rad; en rad med ❌ går inte ut.
   - Butikens namn står aldrig i en annons (Axels beslut 2026-09-18).
   - Taggraden: `typ=N|IM|I · koncept · parent · iteration · lardom · kalla ·
     avatar · awareness · begar · mekanism · tro · urgency · hook-mekanik`,
     och på varje **typ=I** dessutom **`playbook=<manus-N|format-N>`** (vilken
     rad ur `ITERATIONER`) och gärna `fel=<nr>` (vilket fel ur katalogen den
     rättar). **Iterationsnumret räknas ur loggen**, aldrig ur briefens egen
     siffra.
   - **Namnen byggs med namnmotorn, aldrig för hand** — och namnet bär kedjan
     (Evolves `ITER#N_BATCH#ORIG`, `docs/os/evolve/ITERATIONS-PLAYBOOK.md`
     avsnitt 9), så att den syns i Ads Manager:
     ```bash
     node matstrumpor/kor.mjs --namn <vinkel> <format> <antal>                       # ny idé (IDEA)
     node matstrumpor/kor.mjs --namn <vinkel> <format> <antal> --iter <förälder>     # iteration: _i<N>p<förälder>
     node matstrumpor/kor.mjs --namn <vinkel> <format> <antal> --im                  # imitation av en annan brands annons: _im
     node matstrumpor/kor.mjs --namn <vinkel> <format> 1 --iter nat --hookar 3       # tre hookvarianter: _h1 _h2 _h3
     ```
     `<förälder>` är löpnumret (`54`) eller ett alias ur `konfig.namn.alias`
     för Axels egna uppladdningar (`nat` = Nathalie, `sof1`, `sof2`, `kat1`,
     `kat2`). Iterationsnumret räknas ur namnen OCH BRIEF-raderna. Julmaterial
     får vinkeln `jul` — det är den som styr adsetet vid uppladdningen.
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
   - **Föreslår ronden UGC** (en riktig kreatör i bild, `format-2`): skriv
     beställningen enligt `docs/os/CS-KLART.md` punkt 21 och **bifoga alltid
     Nathalies manus som video A** — `products/matstrumpor/ugc/NATHALIE-MANUS.md`
     (Axels order 2026-10-01: "Jag ger gärna Nathalies manus till nya kreatörer,
     PÅMINN MIG BARA"). Varje ny kreatör gör tre videor: kopian, en iteration
     och en till ur briefpaketet. Mönstret är
     `products/matstrumpor/ugc/2026-10-briefer.md`. ⛔ **Axel pratar själv med
     kreatörerna** (hans beslut 2026-10-01 kväll: ingen VA, inte Lovely) —
     rapportens uppgift till Axel är meddelandet till kreatören i ett kodblock,
     från honom själv, utan pris eller villkor (`factory/ugc/villkor.md`).
     ⛔ **Bara sushi i varje brief** (samma kväll: "vi ska inte marknadsföra de
     andra produkterna heller, bara sushi") — pizza-, burgar- och donutlådan
     står aldrig i en rad och syns aldrig i bild.
   - Logga varje brief: `{kod:"BRIEF", annons, koncept, typ, brieftyp, parent, lardom, iteration, playbook, kalla, brief}` — `brief` är sökvägen till brief.md, så arkivet läser VARIABELTAGGAR därifrån.

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
   git add matstrumpor/logg.jsonl matstrumpor/konfig.json matstrumpor/arkiv products/matstrumpor
   git commit -m "matstrumporkungen: <datum> — <N> etiketter, <M> lärdomar, <K> briefer, <F> förslag"
   git push origin main
   ```
   `ROND_KLAR` är det `--kordag` räknar nästa rond från — glöms den går
   ronden igen i morgon. Committa aldrig `matstrumpor/output/`. Minnet är
   filerna, aldrig chatten. Nekas pushen: skriv det som första rad i
   rapporten.

9. **Rapportera.** Två listor: "Gjort av mig" / "Väntar på en människa".
   Rapporten ska alltid innehålla: **breakthrough-frekvensen och hit rate som
   bråk och procent** ("2 av 14, alltså 14 %"), per marknad som har spenderat,
   hur många lärdomar som skrevs, hur många briefer som byggde på en lärdom,
   och koncepten som nått taket (ur arkivet). Tipstabellen (steg 7) står med i
   sin helhet. Axels uppgifter sist, numrerade.

---

## DEFINITION OF DONE

- [ ] Repot pullat och `--kordag` kontrollerad (exit 0, eller `nu` som argument)
- [ ] `ad_account_id` verifierat = `730973156224390`
- [ ] Båda momslinjerna utskrivna; antagandet sagt rakt ut
- [ ] Avläsningen gjord med `--hamta` (token) för Sverige OCH utlandet — eller reserven namngiven och skälet utskrivet; kampanjer som inte gick att läsa namngivna
- [ ] Vinstbidragstabellen visad — ranking på vinst, aldrig ROAS/CPA ensamt
- [ ] "För tidigt"-högen utanför rankingen; benchmarken utpekad och orörd
- [ ] Etikett på varje annons som fyllt sju dygn (på dess egen första vecka, D0 = max(skapad, kampanjens start)); uppgraderingar vecka 2–3 loggade av `--dom-alla --logga`; `yttre_handelse` bedömd i lärdomen; frekvens + hit rate som bråk + procent; unga annonser namngivna utan etikett
- [ ] Arkivet ombyggt (`--arkiv`) och `matstrumpor/arkiv/matningar.jsonl` + `products/matstrumpor/arkiv.md` committade
- [ ] **Lärdom skriven för varje etiketterad annons som saknade en** — med hookar ordagrant, hypotes märkt (gissning) och konkreta nästa annonser
- [ ] Brieftaket räknat: briefer ≤ lärdomar sedan förra ronden
- [ ] Mixen ur etiketterna (80/20), inte ur en tabell
- [ ] Varje brief bär taggraden och pekar på sin lärdom; iterationsnumret ur loggen; typ=I bär `playbook=`
- [ ] Felet ur felkatalogen namngivet i varje lärdom; iterationerna ur `PLAYBOOK_PER_UTFALL`, inget koncept över taket
- [ ] Namnen byggda med `--namn` (iterationer med `--iter`, imitationer med `--im`); julmaterial har vinkeln `jul`
- [ ] Copyn skriven av subagent med `model: "sonnet"` + copy-reglerna
- [ ] Briefraderna skapade via `tools/notion-brief.mjs` (NOTION_TOKEN), aldrig via MCP
- [ ] **Noll budgetändringar, noll pausningar, noll aktiveringar** — tipsen är en lista, inte en handling
- [ ] Tipsen sorterade på kronor, med siffran bakom varje rad
- [ ] Inget PAUSED aktiverat
- [ ] `ROND_KLAR` loggad; `logg.jsonl` + `products/matstrumpor/` committat och pushat till `main`
- [ ] Rapport i två listor; Axels uppgifter sist, numrerade
