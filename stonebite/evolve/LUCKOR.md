# Luckorna på baksidan: vad vi saknar och hur Claude bygger det

Skrivet 2026-09-26, mot snapshoten byggd 2026-09-26 08:06 UTC.
Underlaget för frågorna i `stonebite/evolve/FRAGOR.md`.
Uppdateras när Evolve-boten svarat (svaren i `stonebite/evolve/SVAR.md`).

## De fem viktigaste luckorna

1. Ingen riktig vinst per butik och dag (efter varukostnad, frakt, avgifter och återbetalningar).
2. Inga mål och ingen ägare per tal: ett scorecard saknas både för dig och per roll.
3. Ingen larmar när en butiks försäljning faller eller en datakälla dör tyst.
4. Missarna mäts inte: ingen logg över vad som gick fel, när och vad det kostade.
5. Teamet ser pengar men inte arbete: ingen gemensam kö, inga gemensamma mål, inga synliga vinster.

Två spärrar gäller allt nedan. Redigerare ser aldrig spend, ROAS eller satsen.
Valutor summeras aldrig ihop.

**Var koden körs avgör vad den kan läsa.** `hamta.mjs`, `larm.mjs` och bonusmotorn körs i
rutinen `/stonebite` på claude.ai och läser repot och snapshoten, aldrig Railway-volymen.
Allt som bygger på det folk skriver in på sajten (`data/*.jsonl` på volymen) måste räknas av
servern vid sidvisning, eller av en barnprocess på Railway som `autosvar-vakt.mjs`.
Snapshoten väger 776 kB och committas varje timme, så den får bara bära aggregat per produkt,
dag och person, aldrig rader per order eller per annons. Ett storlekstest (under 1 MB) ska in
i `stonebite/test` med första utökningen.

---

## Talen i frågorna, och var de kommer ifrån

| Tal i frågan | Källa |
|---|---|
| ~17 ärenden per 100 ordrar, två tredjedelar obesvarade, median ~17 h på de besvarade | `kundtjanst/historik/baverbutiken.jsonl`: 30 dagar t.o.m. 2026-09-14, före autosvaret (293 ärenden, 195 obesvarade, 1 756 ordrar, 17,3 h) |
| ~7 av 10 ärenden är "var är ordern" eller "ej levererad" | samma rad: 122 + 86 av 293 |
| "Not received" är vanligaste tvistorsaken | `kundtjanst/sop/README.md` |
| Inquiries vinns nästan alltid, chargebacks oftast inte | CLAUDE.md, tvisthandboken (29 av 29, 1 av 4) |
| 2 av ~1 300 recensioner nämnde teamet | snapshoten 2026-09-26: `recensioner` 1 343, 2 med namn |
| ~70 produkter i testtrappan, 8 testade, 4 skalade | snapshoten: `produkttest` 72 / 8 / 4 |
| 6 redigerare (2 även produkttest), 1 Head of support som också är VA, en driftchef | `bonus/personer.json` |
| En UGC-outreach-person | CLAUDE.md, "Människorna och kanalerna" |
| Redigerarna får en liten andel av spenden | CLAUDE.md: 0,4 % (`commission/berakning.mjs` `SATS`) |
| Fast belopp per produkt som når ad review | CLAUDE.md, bonus: $15 per färdig produkt |
| Dussintals produkter | CLAUDE.md: 46 annonsprefix, 63 kampanjer (2026-08-30) |
| ~20 aktiva schemalagda jobb | `stonebite/rutiner.json`: 41 poster, 20 avstängda (2026-09-26) |
| Leveranslöftet 5–10 arbetsdagar | `factory/butiker/*.yaml` → `frakt.leveranstid` |

---

## Luckorna

| Lucka | Vad vi har i dag | Datakälla | Hur Claude bygger | Storlek |
|---|---|---|---|---|
| **Riktig vinst per butik och dag** | "Kvar efter reklam", som själv säger att det inte är vinst (`vy/oversikt.mjs:204`). COGS bara i StonePNL. | Delvis. Shopify ger `line_items`, `refunds`, frakt. COGS för CaraShell och Matstrumpor saknas. | Fler fält i `kallor/shopify.mjs`, aggregerat per produkt och dag. Ny `stonebite/kostnader.json`. `bidragPerDag` i `berakna.mjs`. Saknad COGS visas som "delvis" med orsak. Bara ägare och chef. | L |
| **MER per verksamhet, och spend i fel valuta** | Bara Metas ROAS. Spend grupperas per kontovaluta (`data.mjs:189–209`), och alla konton står i SEK, så NO-, FI-, UK- och DK-kontonas spend dras från de svenska butikernas omsättning. Matstrumpors konto saknas i snapshoten. | Finns (Meta + Shopify). | Matcha spend mot butik via `varumarken.json`. Kort "MER 7 d" per varumärke. Kurs och datum synliga. | S |
| **Portfölj: vilka produkter bär vinsten** | Vinstbidrag per kampanj (`vy/annonser.mjs`). ROAS-kortet färgas mot 2,0/1,5, inte mot break-even (`vy/oversikt.mjs:198`). | Delvis. Spend per prefix finns. Omsättning per produkt kräver `line_items`. | Vinstbidrag per produkt i `berakna.mjs`. Portföljtabell. ROAS-kortet mot break-even. | M |
| **Larm till ägaren** | `larm.mjs` pingar VA:n (eskalering 2 h, tvist 3 d). Skalningskungen pingar dig om OPS-larmet, nattvakten pingar under vissa villkor, budgetronderna dödar och sänker under break-even. Inget larm för försäljningsfall, död datakälla eller chargeback-ratio. | Finns i snapshoten. | Nya regler i `larm.mjs` (läser bara snapshoten), trösklar i `stonebite/larm-agare.json`. En ping per ärende. Aldrig belopp i en kanal VA:n läser. | S |
| **Missloggen: vad gick fel och vad kostade det** | Inget. Incidenterna står bara som text i CLAUDE.md. | Saknas. Skrivs in av ägare och chef, delvis av larmen själva. | `stonebite/incidenter.mjs` + `data/incidenter.jsonl` på volymen (servern läser). Fält: vad, var, upptäckt, kostnad i kronor, orsak, åtgärd, ägare. Tidslinje och "kostnad per månad" på Översikt. | M |
| **Veckoscorecard med mål och ägare** | Veckojämförelse (`berakna.mjs:109–118`). Inga mål. Snapshoten har bara 30 dagar. | Delvis. Talen finns, målen sätter du. | `stonebite/scorecard.json` + ett aggregat per vecka i repot. Vy med 13 veckor. En anställd ser bara sina egna tal utan ekonomi. | M |
| **Kassaflöde och utbetalningar** | Inget. Banken läggs in för hand i kalendern. | Delvis. Kräver rättigheten `read_shopify_payments_payouts`. Bank saknas helt. | `hamtaUtbetalningar` i `kallor/shopify.mjs`, Metas `balance`/`spend_cap`. Vy `kassa`, bara ägare. | L |
| **nCAC, nya mot återkommande kunder** | Inget. Återköp bara som engångsanalys (`klaviyo/evolve/ATERKOP-ANALYS*.md`). | Delvis. Kräver kunddata-behörighet i apparna. | `customer.orders_count` i hämtningen, bara räknetal i snapshoten. | M |
| **Plan och prognos (Q4)** | Inget mot plan. Bara förra veckan. | Utfall finns. Planen sätter du. | `stonebite/plan.json`, pacing i `berakna.mjs`, flik "Plan". | M |
| **Scorecard per roll på Min sida** | Min sida visar bara pengar (`vy/team.mjs:106–168`). KPI-kod i `dashboard/lib/kpi.mjs`, datan död sedan 2026-08-06. | Delvis. Målen saknas. | `scorecard(snapshot, person, vecka)` i `berakna.mjs`. Kort på `/app/mig`. Under 5 underlag = "osäkert". | M |
| **Kundtjänst per VA, inte per butik** | Mått per butik (`kundtjanst/arenden.mjs`). Veckorapporten avstängd sedan 2026-09-15 (`stonebite/rutiner.json:17`). | Delvis. Brevlådorna läses. Kräver signatur per VA eller bock på sajten. | Fältet `svaradAv` i `arenden.mjs` (körs i rutinen). Bocken på sajten räknas av servern. | M |
| **Arbetskö med SLA och tilldelning** | Kalenderraden ägs av den som skrev den (`server.mjs:500–508`). | Finns (tvister, botsvar, eskalering, kalender). | Fältet `ansvarig` i `kalender.mjs`. `/app/ko` för VA och support_chef, räknad av servern. SLA-ping från en barnprocess på Railway, inte från `larm.mjs`. | M |
| **Leverans: fastnade och förlorade paket** | Bara totaler (`vy/drift.mjs:505–552`). Bugg: "Senaste rundan" visar "okänt" (`drift.mjs:509/516/547`). | Delvis. `senast` i `lage.json` är rutinens kontrolltid, inte senaste skanning. | Steg 1: lista FAILURE-paket och paket utan skanning 7 dagar efter registrering. Steg 2: `sparning/kor.mjs` sparar senaste skanningsdatum, sedan "fastnade". Rätta buggen. | M |
| **Kontaktorsaker per 100 ordrar över tid** | Bara senaste rapportens topp 8. Åldern syns (`drift.mjs:446`) men utan varningsfärg. Historiken har bara 1–2 rader per butik. | Finns i autosvarets logg. | Aggregera autosvarets logg per dag och orsak. Kurva. Varningsfärg när rapporten är gammal. | M |
| **Creative-dashboard och träffsäkerhet** | Meta bara per konto och kampanj (`kallor/meta.mjs`). Hook och hold räknas i `factory/skalning.mjs` men når inte sajten. | Finns (Meta + `commission/koppling.mjs`). | `kallor/creatives.mjs` som återanvänder `skalning.mjs`, aggregat per redigerare och vecka. Ägaren ser allt. Redigeraren ser egna procent, aldrig kronor. Test mot läckor. | L |
| **Ledtid, revisioner, first-pass per redigerare** | Koden finns, datan står still. Medel i stället för median (`kpi.mjs:59–60`). Fel tidszon i `team.json`. | Finns i Notion. Kräver "Read comments". | `kallor/notion.mjs`. Arbetstid i Manila-tid. Tomt, aldrig noll. | M |
| **EOD som data** | Mall i Slack (`docs/os/EDITOR-SOP.md:90–120`). `daily-reports.json` tom. | Saknas. Skrivs av teamet. | `stonebite/eod.mjs` + `data/eod.jsonl` på volymen. Formulär på Min sida. Blockers till "Kräver dig i dag". Allt räknat av servern. | S |
| **QA av svar och CSAT** | Inget. Botens svar syns som kort. | Delvis. Rubriken måste godkännas. | `stonebite/qa.mjs`, `/app/qa` för support_chef, räknat av servern. Betygslänk i svaren. Ingen poängsätter sig själv. | M |
| **Tvister på sajten: ratio och utfall** | Brådskande tvister syns. Tvistgraden 0,11 % finns i snapshoten men ritas inte. | Finns (Shopify varje timme). Klarna saknas. | Ratio, vinstgrad per typ och andel i tid ur `hamtaAllaTvister`. Mätare mot 0,9 %. | S |
| **Återbetalningar och 1–3★ per produkt** | Refunds hämtas inte (`kallor/shopify.mjs:275`). Judge.me bara två butiker (`bonus/kallor.mjs:25–28`). | Delvis. Fler Judge.me-nycklar behövs. | Refunds + `line_items`, aggregat per produkt. Kö "1–3★ att följa upp". Under 20 ordrar = ingen procent. | M |
| **Produkttestets ekonomi** | Antal och steg (`vy/produkter.mjs`). `serPengar` räknas men används aldrig. | Delvis. Notion saknar statushistorik. | Logga status per dag framåt. Koppla produkt till kampanj via prefix. Kronor bara för ägare och chef. | M |
| **Bonus som driver beteende** | Bra motor (`bonus/motor.mjs`). Produkttest betalas (i september Josh $330, Annabelle $270). Men VA:n och Head of support står på $0: recensionsbonusen ger inget, och veckomåtten står still eftersom veckorapporten är avstängd. | Delvis. Beloppen är ditt beslut. | Nya uppdrag (SLA, QA, uppföljt inom 48 h) i `regler.json`, räknade där datan finns. Judge.me för alla butiker. | S |
| **Teamtavla: arbete, inte bara pengar** | Redigerarna ser en topplista med allas commission i USD. support_chef ser teamets bonus. Ingen ser dagens kö, vem som äger vad eller veckans vinster. | Finns. | Sida "Teamet i dag" utan kronor: kö, ägare, team-SLA, veckans vinster (ny vinnare, vunnen tvist). Räknad av servern. | M |
| **Onboarding och SOP-kvitto** | 40 vardags-SOP:er i `kundtjanst/va-sop` och 13 i tvisthandboken. Ingen kvittens. | Saknas. Ingen nyckel behövs. | `stonebite/utbildning.mjs` + `data/kvitto.jsonl`. "Ändrat sedan du läste" på Min sida. | S |

---

## Det här kan jag bygga direkt, utan att vänta på Evolve

1. Rätta två buggar: "okänt" på Leverans (`vy/drift.mjs:509/516/547`) och ROAS-kortet mot break-even i stället för 2,0 (`vy/oversikt.mjs:198`).
2. MER per verksamhet i rätt valuta: spend matchas per butik, inte per kontovaluta.
3. Leverans som arbetslista: FAILURE-paket och paket utan skanning sju dagar efter registrering.
4. Tvistratio och utfall på sajten, talen finns redan i Shopify-hämtningen.
5. Larm när en datakälla blir gammal, så ingen rapport står tyst i tolv dagar igen.

---

## Det här kräver Axel

1. Säg om veckorapporten ska slås på igen, eller om Claude ska räkna den ur autosvarets logg.
2. Skicka kostnadslistan (inköp och frakt per produkt) för CaraShell och Matstrumpor.
3. Sätt mål per tal på scorecardet och vem som äger varje tal.
4. Bestäm vem som får vilket larm och i vilken kanal.
5. Ge Shopify-apparna rättigheten `read_shopify_payments_payouts` om kassan ska synas.
6. Bestäm nya bonusbelopp för VA, redigerare och produkttest.
7. Skicka Judge.me-nycklar för CaraShell, Matstrumpor, DK och FI, eller säg att de inte har Judge.me.
8. Välj hur VA:ns svar kopplas till henne: fast signatur i mejlet eller en bock på sajten.
9. Säg om en betygslänk (CSAT) får stå i kundmejlen.
