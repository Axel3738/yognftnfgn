# /commission — redigerarnas commission på annonsspenden

Kör **var tredje dag** (den 1, 4, 7 … 28) plus **alltid månadens sista dag**.
Uppdraget i en mening: **ta reda på vilka redigerare som står som Ansvarig på
godkända rader i Notion, leta rätt på deras annonser i samtliga annonskonton,
och räkna ut 0,4 % av spenden de dragit in under månaden.**

Argument: `$ARGUMENTS` — normalt tomt. `--manad YYYY-MM` = räkna om en gången
månad i efterhand. `--torr` = räkna och visa, skriv ingen rapportfil.

## Noll godkännanden — rutinen ska aldrig fråga om lov

Repots `.claude/settings.json` står på `defaultMode: dontAsk` och listar allt
kommandot rör. Fråga aldrig om lov, och avbryt aldrig för att invänta ett
godkännande.

**Ta REST-vägen i första hand.** Finns env-variabeln `NOTION_TOKEN`:

```bash
node commission/run.mjs --rutin
```

Skriptet läser då hubbarna själv via Notions REST-API och behöver **inga
`mcp__*`-verktyg alls** — alltså ingenting som kan utlösa en godkännanderuta.
Hubbarna hämtas ur `products/products.json` plus en REST-sökning, så de
arkiverade hubbarna kommer med.

Saknas `NOTION_TOKEN` faller rutinen tillbaka på Notion-MCP:n (steg 1 nedan).
Skriv då en rad i rapporten om att nyckeln saknas — det är den enda kvarvarande
orsaken till att rutinen kan behöva ett klick.

## ⚠️ Leverera ALLTID siffror

Kommandot räknar varje gång det körs, vilken dag som helst. Kalendern avgör
bara om körningen sparas som rapport och räknas som slutavräkning. Svara
aldrig Axel — eller rutinloggen — med "ingen körning i dag" och inget mer.
Skicka aldrig `--rutin` i en handkörning.

**Månadens sista körning är slutavräkningen — det är den summan som betalas ut.**
Körningarna däremellan är lägeskoll: samma månad, färre dagar mätta.

## Reglerna (Axels beslut 2026-08-30)

1. **Perioden är kalendermånaden.** Spend från den 1:a till och med körningsdagen.
   En creative som godkändes i juli och fortsätter spendera i augusti ger
   commission båda månaderna — det är spenden som räknas, inte godkännandedatumet.
2. **Bara redigerare får utbetalning** (`role: "editor"` i `dashboard/data/team.json`).
   Rader på Axel, på managern, eller helt utan Ansvarig redovisas separat: spenden
   syns i rapporten, men den betalas inte ut.
3. **ENDAST svenska annonser räknas** (Axels beslut 2026-08-31). Två spärrar,
   båda i `commission/berakning.mjs`:
   - Marknadskontona ger aldrig commission: Magiborsten NO, DK, FI, UK,
     Snark mexico, SNarklös FI, Norge, Finland DK och NYC Grill.
   - En annons med marknadskod i namnet (`NO_Trimmerbelt_PD_3_H1`,
     `Fiskespöhållare_SP_2_1_UK`) räknas inte, inte ens i ett svenskt konto.
   Konceptkoderna i namnkonventionen (`CS GT PD SP SO CI UG`) är vinklar, inte
   länder, och får aldrig filtrera bort en svensk annons.
   `--alla-marknader` stänger av filtret för en engångsjämförelse.
4. **Satsen är 0,4 %** av spenden. Den står som `SATS` i `commission/berakning.mjs`
   och ändras inte utan att Axel säger det.

## ⚠️ Rutinen är läs-bara

Den ändrar ingen status i Notion, pausar och aktiverar ingenting i Meta, och
laddar inte upp något. En utbetalningsrutin ska aldrig kunna röra annonskontot.
Ser du dig själv skriva mot Meta eller Notion i det här kommandot: avbryt.

## Alla annonskonton, inte bara MagiBorsten

Redigerarna jobbar även på produkter utanför det här OS:et, och creativesen
översätts till NO, DK, FI och UK. Därför läses **varje annonskonto token:en når**
(14 stycken 2026-08-30), inte bara Bäverbutikens.

Det här är läsning, inte skrivning — regeln om att aldrig blanda verksamheterna
gäller fortfarande allt som *ändrar* något. En annons får bara spend tillräknad
om dess namn står som godkänd rad i en av **Bäverbutikens** creative hubs, så
Grillklinikens och Matstrupors annonser kan aldrig ge utbetalning.

⚠️ **NYC Grill-kontot är i USD.** Valutor summeras aldrig ihop — rapporten
redovisar dem var för sig. Ser du "1234.00 SEK + 56.00 USD" är det meningen.

## Förutsättningar — kontrollera dem FÖRST

**1. Repot.** Den schemalagda sessionen startar ibland utan repo.

⚠️ **Kör ett kommando per anrop. Aldrig `&&`, `||` eller `;`.**
Behörighetslistan i `.claude/settings.json` matchar på kommandots första ord
(`Bash(git:*)`, `Bash(ls:*)`). Ett sammansatt kommando matchar ingen regel och
utlöser en godkännanderuta — det var därför rutinen bad om lov varje körning.

```bash
ls /home/user/yognftnfgn/.claude/commands/commission.md
```
```bash
git clone https://github.com/Axel3738/yognftnfgn.git /home/user/yognftnfgn
```
(bara om `ls` inte hittade filen)
```bash
git -C /home/user/yognftnfgn checkout main
```
```bash
git -C /home/user/yognftnfgn pull
```

Samma regel gäller resten av körningen: `node commission/run.mjs --rutin` körs
som ett eget anrop, inte hopkopplat med `cd` eller något annat.

**2. `META_ACCESS_TOKEN`** (`ads_read` räcker). Saknas den finns ingen spend att
läsa — rapportera det och gör inget annat.

**3. Notion.** Två vägar, i den här ordningen:
- Har du `mcp__Notion__*`-verktyg: kör steg 1 nedan och skriv jobbfilen.
  **Det är den säkra vägen** — bara den kan filtrera på teamspacet.
- Saknas MCP:n men `NOTION_TOKEN` finns i miljön: hoppa över steg 1 och kör
  `node commission/run.mjs` rakt av. Skriptet söker då upp hubbarna via REST och
  märker rapporten "inte teamspace-verifierad". Kontrollera hubblistan under
  **Källor** i rapporten innan du betalar ut något.
- Saknas båda: rapportera det. Räkna aldrig commission på gissade rader.

## Så kopplas en annons till en person

Två steg, i den ordningen. Logiken bor i `commission/koppling.mjs`.

1. **Hubbraden, per annons.** Annonsen matchas mot en rad i en creative hub som
   har någon i `Ansvarig`. Två namnsystem finns i kontona:
   - Bäverbutiken: `Enginecover_PD_22_H1` — raden heter likadant.
   - Grillkliniken/Matstrumpor: annonsen `235 H1`, raden `235`. Löpnumret först
     i namnet är kopplingen.
   Rader som handlar om att **översätta** en creative (`129 to norwegian`,
   `Translation 115`) ärver aldrig den svenska spenden om en riktig rad finns.
2. **Produkten, per kampanj.** Hittas ingen hubbrad matchas kampanjnamnet mot
   produkten i `commission/produkter.json` (ur Notion-databasen *Product test
   center SE BÄVER*), och spenden går till produktens ägare. Är två produkter
   lika troliga kopplas annonsen inte alls — hellre okopplat än fel person.

⚠️ **Filtrera ALDRIG hubbraderna på Typ eller Status.** En rad med `Ansvarig` är
gjord av någon oavsett var i flödet den står. *(Incident 2026-08-31: filtret
`Typ = "… Pending Approval" AND Status = "Approved"` dolde hela Masterns
produktion, som ligger som `Video - Approved`. Rapporten blev 33,74 kr i stället
för drygt 2 200 kr, och tre av fem redigerare fick noll.)*

⚠️ **Hubbarna står i `commission/hubbar.json`** — 12 svenska över tre
verksamheter. En sökning i Bäverbutikens teamspace hittar bara 2 av dem.

## Steg 1 — Läs raderna ur alla hubbar (MCP-vägen)

Hubbarna hittas dynamiskt, precis som i `/bildannonser`, så nya produkter kommer
med av sig själva:

- Sök med `teamspace_id = 3a9270ab-908c-81a8-a48c-004222d195e7` (**teamspacet
  Bäverbutiken**) efter databaser vars titel slutar på `creative hub`.
- Uteslut `Creative hub MALL`.
- ⚠️ **Lägg ALLTID till hubbarna ur `products/products.json` ovanpå sökträffarna.**
  De fyra skalningsprodukternas hubbar är **arkiverade** i Notion och syns inte i
  en vanlig sökning. 2026-08-31 hittade rutinen därför bara Belt grinder och
  Kranskydd Frost, läste noll godkända rader och rapporterade **0 kr som augustis
  slutavräkning** — fyra redigerare hade blivit utan betalt.
  `commission/run.mjs` avbryter numera om en hubb ur `products.json` saknas, och
  om körningen hittar noll godkända rader. Gå aldrig runt de spärrarna.
- Hämta varje hubbs `collection://`-URL med `fetch` på databas-id:t.

Per hubb, en fråga:

```sql
SELECT url, "Namn", "Typ", "Status", "Ansvarig"
FROM "collection://<hubbens-id>"
WHERE "Ansvarig" IS NOT NULL
```

`Typ LIKE '%Pending Approval%'` är **inkludering**, aldrig uteslutning — SOP,
Guideline, Feedback och `Winning Creative` är dokumentation och ska aldrig ge
utbetalning. `Approved` är enda statusen som räknas.

Skriv resultatet till `commission/jobb/<datum>.json`:

```json
{
  "teamspace": "3a9270ab-908c-81a8-a48c-004222d195e7",
  "hubbar": [
    { "id": "<db-id>", "namn": "Trimmer belt creative hub",
      "rader": [
        { "namn": "Trimmerbelt_PD_3_H1 – VIDEO: Mechanism demo",
          "status": "Approved", "typ": "Video - Pending Approval",
          "ansvariga": ["50fdc7d9-a491-45b9-bac4-5315788a616b"],
          "url": "https://app.notion.com/…" }
      ] }
  ]
}
```

`ansvariga` är rena Notion-användar-id:n — strippa `user://`-prefixet SQL:en
lämnar. Raden ska med **även när `ansvariga` är tom** (`[]`): spend på rader utan
Ansvarig är pengar ingen får, och det är en av de viktigaste siffrorna i
rapporten.

⚠️ **`Ansvarig` är personfältet — inte `Skapad av`.** Bildannons-rutinen skapar
rader i Axels namn; det är den som satts som Ansvarig som gjort jobbet.

## Steg 2 — Räkna

```bash
node commission/run.mjs --rutin --jobb commission/jobb/<datum>.json
```

`--rutin` styr bara om rapportfilen SPARAS: på en icke-kördag räknas siffrorna
ändå och skrivs ut, men ingen fil läggs i `commission/korningar/`. Kommandot
avslutar sig aldrig utan siffror — svara aldrig Axel med "ingen körning i dag".
**Kör Axel kommandot för hand: lämna bort `--rutin`**, då sparas rapporten också.

Efterhandskörning av en gången månad: lägg till `--manad 2026-07`.
Vill du bara se siffrorna utan att skriva rapportfil: `--torr`.

Skriptet gör resten: läser spend per annons ur alla annonskonton, matchar
annonsnamnen mot de godkända raderna, delar spenden lika mellan flera Ansvariga
på samma rad, och skriver
`commission/korningar/<YYYY-MM>/<datum>.md` + `.json`.

**Så matchas en annons mot en rad** (detaljerna bor i `commission/berakning.mjs`):
1. Annonsnamnet plockas ur Notion-titeln som *första ordet*, för titlarna bär
   ofta briefens beskrivning efter namnet — `Trimmerbelt_SP_3_H1 – VIDEO: UGC
   proof-led` är annonsen `Trimmerbelt_SP_3_H1`.
2. Exakt namnmatchning vinner alltid.
3. Annars matchas namnet utan marknadskod (`SE NO DK FI UK DE NL US`), så
   `NO_Trimmerbelt_PD_3_H1` hittar sin svenska rad. Konceptkoderna i
   namnkonventionen (`CS GT PD SP SO CI UG`) stryks aldrig.
4. Står samma annonsnamn som godkänt i två hubbar med **olika** Ansvarig går det
   inte att veta vems pengarna är: raden flaggas som namnkonflikt och betalas
   inte ut förrän Axel rett ut den.

## Steg 3 — Uppdatera leaderboarden

Topplistan är sidan redigerarna själva öppnar:
**https://claude.ai/code/artifact/77145ba8-a1cc-4791-9757-0715a8d97ff8**

`run.mjs` skriver `commission/leaderboard.json` **varje körning**, också de dagar
ingen rapport ska sparas — en topplista som står stilla två dygn är värdelös.
Lägg upp den nya datan på sidan:

```
Artifact  action: write_db  db_op: set
  url:        https://claude.ai/code/artifact/77145ba8-a1cc-4791-9757-0715a8d97ff8
  collection: leaderboard
  doc_id:     aktuell
  file_path:  commission/leaderboard.json
```

Sidan lyssnar på det dokumentet och ritar om sig direkt. Du behöver aldrig
publicera om själva sidan; bara datan byts.

⚠️ **Uppdatera aldrig sidan med siffror från en avbruten körning.** Avbryter
`run.mjs` på en nödbroms finns ingen ny `leaderboard.json`, och den gamla ska
stå kvar — hellre gårdagens sanna läge än dagens halva.

Går `write_db` inte igenom (verktyget saknas i den schemalagda sessionen):
skriv en rad om det i rapporten och gå vidare. Datan ligger kvar i repot och
läggs upp vid nästa körning; sidan märker själv ut när den inte fått ny data.

Sidmallen bor i `commission/leaderboard-sida.html`. Ska sidans utseende ändras:
kör `node commission/leaderboard.mjs` (bakar in datan i
`commission/leaderboard-publicerad.html`) och publicera om den filen mot samma
URL med `url`-parametern — annars blir det en ny sida med en ny länk.

## Steg 4 — Leverera

Skriv i svaret, i den här ordningen:

1. **Utbetalningstabellen** — redigerare, spend (exakt / översatt / totalt),
   commission. Summan sist.
2. **Är det slutavräkning?** Skriv rakt ut att det är månadens sista körning och
   att summan är den som ska betalas, eller att det är en lägeskoll mitt i månaden.
3. **Spend som inte betalas ut** — rader utan Ansvarig, rader på Axel/managern,
   okända Notion-användare, namnkonflikter. Varje post med belopp och orsak.
4. **Åtgärdslistan** — okända Notion-användare som ska in i
   `dashboard/data/team.json`, och hubbar/konton som inte gick att läsa.
5. Sökvägen till rapportfilen.

Committa rapportfilerna och pusha. De är kvittot på vad som betalades ut.

⚠️ **Går pushen inte igenom är körningen ändå klar.** Den schemalagda sessionen
saknar ibland push-behörighet till repot (git-proxyn svarar 403). Utbetalnings-
tabellen i svaret är leveransen; rapportfilen är kvittot. Skriv en rad om att
filen ligger kvar lokalt och gå vidare — behandla det aldrig som att körningen
misslyckades, och be aldrig Axel öppna en annan session för att pusha. Nästa
körning skriver samma fil igen.

## Vad som brukar gå fel

- **Alla får 0 kr.** Nästan alltid namnmatchningen: kolla att steg 1 tog med
  `Ansvarig`, och att annonsnamnet i Notion-titeln stämmer med kontot. Rapporten
  skriver ut hur många godkända rader som saknade spend — är den siffran nästan
  lika stor som antalet rader är något fel, inte lugnt.
- **En redigerare saknas helt.** Hon står som Ansvarig men saknar `notionUserId`
  i `dashboard/data/team.json`. Rapporten listar id:t under "Okända Ansvariga" —
  fyll i det, kör om. *(Läge 2026-08-30: Annabelle Gonzales och Gilz Bruce Biazon
  finns inte som användare i Notion alls och kan därför inte tilldelas rader.
  Två id:n står på godkända rader utan att finnas kvar i workspacet — fråga Axel
  vilka de är.)*
- **Mycket spend utan godkänd rad.** Normalt: kontot kör annonser för produkter
  som inte har någon creative hub, och gamla annonser från före hubbarna. Siffran
  står längst ner i rapporten som kvitto på att den setts, inte som ett larm.
- **`amount_spent` i insights.** Det heter `spend` där. `amount_spent` finns bara
  på kontot och ger `(#100) ... is not valid for fields param`.

## Definition of done

- [ ] Repo, `META_ACCESS_TOKEN` och Notion-vägen kontrollerade och redovisade
- [ ] Alla hubbar i teamspacet Bäverbutiken lästa — antalet skrivet i svaret
- [ ] Bara `Typ LIKE '%Pending Approval%'` + `Status = Approved` räknade
- [ ] Rader **utan** Ansvarig togs med i jobbfilen och redovisas som obetald spend
- [ ] Spend läst ur samtliga annonskonton — antalet skrivet i svaret
- [ ] Valutor redovisade var för sig, aldrig hopsummerade
- [ ] Endast svenska annonser räknade — antal och belopp bortfiltrerat redovisat
- [ ] Utbetalningstabellen levererad med exakt/översatt särredovisat
- [ ] Leaderboarden uppdaterad med dagens data (eller orsaken skriven i rapporten)
- [ ] Sagt rakt ut om körningen är slutavräkning eller lägeskoll
- [ ] Okända Ansvariga, namnkonflikter och olästa källor listade som åtgärder
- [ ] Ingenting skrivet mot Meta eller Notion
- [ ] Rapportfilen committad (pushad om sessionen har behörighet — annars en rad om det)
