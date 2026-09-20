# /rond-auto – Ronden som ändrar själv (körs varje dag)

> ## ⛔ LÄS DETTA FÖRST
>
> **Använd aldrig verktyget `Artifact`, och kör aldrig `agent/dashboard.mjs`
> i en schemalagd körning.**
>
> Dashboard-sidan är delad PUBLIKT, och en publik sida kräver ett godkännande
> vid varje ompublicering. Ingen kan trycka på det klockan 05:30 — ronden blir
> stående och Axel får rutan i ansiktet, gång på gång. Det hände fem gånger på
> en morgon.
>
> **Minnet sparas i stället genom att du committar och pushar.** Pushen ÄR
> minnet. Går den igenom är du klar. Går den inte igenom har du enligt
> kärnreglerna inte ändrat något alls, och då finns det inget minne att rädda —
> rapportera bara att pushen nekades.
>
> `Artifact` är dessutom spärrat i `.claude/settings.json` på den här grenen.
> Försöker du ändå får du ett blankt nej, inte en godkännanderuta. Det är med
> flit.

Automatläget av `/rond`. **Axels stående beslut 2026-08-29:** ronden får skala
upp, skala ner och stänga av enligt reglerna, utan att fråga per rad.

**Tolkningsregel (Axel 2026-08-30, omskriven 2026-09-10):** när körordern
(trigger-prompten) säger "utför bara det som står i plan.atgarder" syftar det
på BUDGETÄNDRINGARNA i Meta. **Annonsbehoven i steg 4b och startskotten i
steg 4d är fortfarande obligatoriska** — alla förstabatcher, alla förfallna
brief-rundor och alla larm, utan tak. En körning som lämnar förfallna behov
utan åtgärd och utan redovisning är INTE klar. *(Körningen 2026-08-30 hoppade
över hela kön på den meningen — det var fel tolkning. Briefhalvan togs bort
2026-09-10 och lades tillbaka 2026-09-13 på Axels order; startskottet är kvar.)*

Ronden KÖRS varje dag, men varje produkts BUDGET ändras högst var tredje dag —
utom snabbspåret: en produkt i skalningszonen med ROAS ≥ 3 får höjas 20 %
redan dagen efter förra höjningen. Sänkningar väntar alltid sina tre dagar.
**Avstängning av en testprodukt som går back väntar ALDRIG** — passerad
1 500 kr och under break-even går den trappan samma morgon (Axel 2026-09-02).
Allt det räknar `agent/besked.mjs` ut — inte du.

Gäller **bara Bäverbutiken / MagiBorsten `1867947880635861`**. Grillkliniken
(SnarkLös `1346450049878358`) rörs aldrig.

**All matematik görs av `agent/besked.mjs` och `agent/rond.mjs`. Du räknar
ALDRIG själv, avrundar aldrig själv, och hittar aldrig på ett tal som inte står
i planen.** Din uppgift: hämta siffror, kör skriptet, utför planen exakt,
verifiera varje skrivning, logga, uppdatera dashboarden.

## 0. Förberedelse

- Checka ut grenen `claude/daily-agent-discussion-uos5df` och dra senaste:
  `git pull origin claude/daily-agent-discussion-uos5df` — budgetloggen är
  minnet, en gammal kopia gör att kadensspärren räknar fel.
  Saknas repot helt i containern: klona läskopian
  `https://github.com/Axel3738/yognftnfgn.git` och checka ut grenen.
  (De schemalagda körningarna har bara läsrättighet — det är förväntat.)
- **MINNET ÄR GIT — inget annat.** Budgetloggen i repot är sanningen.
  `git pull` ovan är hela synken; det finns ingen dashboard att läsa in och
  ingen artefakt att hämta minnet ur. Misslyckas `git pull`: **avbryt** — kör
  aldrig ronden på en gammal logg.
- **Efter VARJE genomförd Meta-ändring** skrivs loggraden lokalt och
  **committas + pushas direkt**. Går pushen igenom är minnet sparat och du är
  klar med den raden. Nekas pushen: gör inga fler ändringar och larma i svaret
  — en Meta-ändring utan sparad loggrad gör kadensspärren blind och nästa
  körning ändrar igen.
- **Ändrar du `agent/produktkarta.json`: committa den i samma push.**
- Finns inte Meta-verktygen (`mcp__ADsmanagaer__*`): **avbryt allt**, säg det
  rakt ut och gör ingenting annat. Ingen rapport på ingenting.

## 1. Hämta läget ur Meta — TVÅ marknader

Ronden kör **Sverige och Norge**, ett konto i taget. Norge är samma
verksamhet (business MagiBorsten), eget annonskonto, SEK.

| Marknad | Konto | Datafil |
|---|---|---|
| SE | `1867947880635861` MagiBorsten | `agent/kontodata.json` |
| NO | `1050941584152547` Magiborsten NO | `agent/kontodata-no.json` |

⚠️ Blanda dem ALDRIG. Kontot `1418612340124566` heter också "Norge" men
tillhör Matstrumpor.se — en annan verksamhet. Rör det aldrig. Kontospärren i
`agent/rond.mjs` stoppar båda felen, men den ska inte behöva.

Gör de tre anropen nedan **en gång per konto**, med `ad_account_id` satt till
marknadens konto och filtrering på `campaign.effective_status IN ["ACTIVE"]`:

1. `date_preset: "last_3d"` — `fields: ["id","name","effective_status","daily_budget","amount_spent","purchase_roas","omni_purchase","created_time"]`
2. `date_preset: "maximum"` — samma fält (ger `spend_total`)
3. `date_preset: "last_14d"` + `time_increment: "1"` — dygnsserien (varje dygn: datum, roas OCH spend ur `amount_spent`)

**Alla tre anropen med `action_attribution_windows: ["7d_click"]`** (Axels
beslut 2026-09-20). Mätt samma dag: kontonivån skiljer 1,7 % (SE) och 0 %
(NO), men Fiskespöhållaren visade ROAS 2,01 med visningsköp inräknade och
1,64 på klick — 18,6 % — mot break-even 1,50; IBC 7,1 %, Båtmotorskyddet
5,4 %. Läser du `purchase_roas`/`omni_purchase` ur svaret: ta värdet för
fönstret `7d_click`, inte `value`. Skriv `"attribution": "7d_click"` överst i
kontodatafilen — `rond.mjs` varnar när fältet saknas eller säger något annat.
Tar MCP-verktyget inte parametern: kör `ads_get_field_context`, skriv i
rapporten att attributionen är kontots standard, och gissa aldrig ett tal.

Fältnamnen är exakta. Använd **aldrig** `omni_purchase_values` (buggig, se
CLAUDE.md). Skriv siffrorna **ordagrant** till `agent/kontodata.json` i samma
format som `/rond` beskriver. Saknas ett värde: `null`, aldrig 0, aldrig gissat.

Skriv SE till `agent/kontodata.json` och NO till `agent/kontodata-no.json`.
Sätt `ad_account_id` och `ad_account_namn` i varje fil till det konto datan
faktiskt kommer från — kontrollen läser dem och avbryter vid minsta glapp.

Aktiv kampanj som saknas i `agent/produktkarta.json`: lägg till den som
`"lage": "test"` med motivering. Gissa aldrig break-even — utan tal i
kampanjnamnet eller kostnadsblock får den domen SAKNAR_BREAK_EVEN, och det är
rätt.
⚠️ **Ändrar du produktkartan: committa och pusha den i samma push som
loggraden.** Kartan har försvunnit två gånger för att ändringen låg kvar bara
i containern (2026-08-30: 11 nya kampanjer fick läggas in igen för hand).

## 2. Räkna — en gång per marknad

```bash
node agent/rond.mjs --json                                 # Sverige
node agent/rond.mjs --data agent/kontodata-no.json --json  # Norge
```

Behandla marknaderna som två separata ronder: egen plan, egna spärrar, egen
kontospärr. Norska break-even står i kampanjnamnet med bindestreck och komma
(`| BE-ROAS 1,63 |`) — parsern läser båda skrivsätten sedan 2026-08-31.

Är den ena marknadens plan spärrad påverkar det inte den andra. Rapportera
dem var för sig i svaret, med rubrik per marknad.

```bash
node agent/rond.mjs --json > /tmp/rond-utfall.json
```

Avbryter skriptet (`RONDEN AVBRÖTS`): gör ingenting mot Meta, gå till steg 6
och rapportera felet.

Läs `plan` ur utfallet:
- **`plan.sparrad: true`** → GÖR INGA ÄNDRINGAR ALLS. Kontospärren har slagit
  till, vilket betyder att något är trasigt. Gå till steg 5–6 och larma.
- Annars: `plan.atgarder` är HELA listan. Inget utanför den får röras.

## 3. Utför planen — en åtgärd i taget, verifiera varje

För varje åtgärd i `plan.atgarder`:

**`typ: "budget"`** — ändra dagsbudgeten:
1. `mcp__ADsmanagaer__ads_update_entity` med `entity_type: "campaign"`,
   `entity_id` = kampanj-id, `fields: {"daily_budget": <till_ore>}`.
   ⚠️ **API:t tar ÖRE.** Använd `till_ore` ur planen, ordagrant. 1 200 kr =
   `120000`. Skriv aldrig `till_sek` i det fältet.
   ⚠️ **Verktyget TVINGAR kampanjen till PAUSED vid budgetändring**
   (`status_forced_to_paused: true` i svaret — bekräftat i skarp drift
   2026-08-29). Sätt den OMEDELBART tillbaka: nytt anrop till
   `ads_update_entity` med `fields: {"status": "ACTIVE"}` innan något annat
   görs. Går det inte att återaktivera: larma direkt i svaret och på
   dashboarden — en pausad vinnare förlorar pengar varje timme.
2. **Verifiera:** läs tillbaka kampanjen (`ads_get_ad_entities`) och
   kontrollera BÅDE att `daily_budget` visar exakt `till_sek` kronor OCH att
   `effective_status` är `ACTIVE` igen. Visar den 100× för mycket eller för lite: **återställ
   omedelbart till gamla budgeten (gamla kronor × 100 = öre), avbryt HELA
   körningen och larma.**
3. **Spara minnet DIREKT** — innan nästa åtgärd: skriv loggraden
   (`genomford: true`), committa och pusha. Nekas pushen: **avbryt resten av
   körningen och larma** — en Meta-ändring utan sparad loggrad gör
   kadensspärren blind och nästa körning ändrar igen. Publicera ingenting.

**`typ: "paus_kampanj"`** — stäng av:
1. `ads_update_entity` med `fields: {"status": "PAUSED"}`.
2. Verifiera: läs tillbaka, `effective_status` ska vara PAUSED.
3. Logga med kod `STANG_AV`, `genomford: true`.

**Startas en kampanj om igen** — av Axel, eller för att en avstängning visade
sig vara fel — ska det loggas med kod `ATERAKTIVERA`, `genomford: true`. Utan
den raden tror ronden att kampanjen fortfarande är död och skjuter aldrig ett
startskott för den, hur bra den än går
(`arAvstangd` i `agent/rond.mjs` läser exakt de två koderna). Använd
`ads_activate_entity` — `ads_update_entity` med `{"status":"ACTIVE"}` svarar
`status_forced_to_paused: true` och ändrar ingenting.

**`typ: "trappa"`** — produkten har passerat 1 500 kr och går back.

**Axels beslut 2026-09-01 — den gamla femdagarstrappan är avskaffad.** Den lät
en förlorare bränna budget i fem dygn medan den gick steg för steg. Nu finns
bara två utgångar, och båda avgörs samma morgon:

Under 1 500 kr total spend rörs kampanjen inte alls — den domen heter
`VANTA_TROSKEL` och den ligger kvar oförändrad. Trappan börjar först efter det.

**Livstidsspärren går FÖRE trappan (Axels larm 2026-09-04).** Ligger kampanjens
**livstids-ROAS** över break-even har den tjänat pengar totalt, och då stänger
en tredagarsdipp inte av den. Motorn ger då `SANK` med `nyBudget: 500` i stället
för `trappa` — kapa budgeten hela vägen till golvet 500 kr och läs om i morgon.
Spärren är inte ett frikort: den håller högst **fem back-dygn i rad**, och bara
så länge livstiden fortfarande ligger över break-even. Varje förlustdygn äter på
livstidsmarginalen, så spärren tar slut av sig själv — sen står det `trappa` i
planen igen och kampanjen stängs av. Du räknar aldrig det här själv; det står
färdigt i `plan.atgarder`. *(Kranskydd Frost 420D stängdes av 2026-09-03 med
7 417 kr spend, 28 köp och livstids-ROAS 1,59 mot break-even 1,49 — plus 4,4 % —
på en tredagarsdipp till 1,35. Startades om 2026-09-04.)*

🛑 **SPENDTJUVSSPÄRREN GÅR FÖRE AVSTÄNGNINGEN. Hoppa den aldrig.**

Hämta kampanjens annonser (`level: "ad"`, `date_preset: "last_3d"`, filtrering
på `campaign.id`, fälten `amount_spent`, `omni_purchase`, `purchase_roas`,
`effective_status`), skriv dem **ordagrant** till en jobbfil och låt koden döma:

```json
{
  "kampanj_id": "...", "kampanj_namn": "...",
  "break_even": 1.62,
  "spend_3d": "4 319,97 kr (SEK)",
  "raddningar_14d": 0,
  "agarbeslut_idag": false,
  "annonser": [{ "id": "...", "namn": "...", "spend": "3 316,26 kr (SEK)",
                 "kop": 5, "roas": "0.752354", "status": "ACTIVE",
                 "roas_livstid": 1.405326 }]
}
```

```bash
node agent/spendtjuv.mjs --jobb <fil.json> --json
```

- `raddningar_14d` = antal `TRAPPA_FORLANGNING`-rader för kampanjen de senaste
  14 dagarna (`senasteRadMedKod` i `agent/logg.mjs`).
- `agarbeslut_idag` = `true` om det finns en `ATERAKTIVERA`-rad med **dagens
  datum**, alltså om Axel själv startat om kampanjen i dag.
- `roas_livstid` per annons = samma annons hämtad med `date_preset: "maximum"`.
  **Hämta alltid den också** — ett extra Meta-anrop per kampanj i trappan.
  Talet dömer ingenting, men märker en tjuv som *trött vinnare* så leveransen
  kan säga "mata ersättarna" i stället för "creativen var dålig".

**Du räknar aldrig själv vilken annons som är tjuven** — talen står i utfallet.

Utfallet ger en av fyra domar:

- **`PAUSA_TJUVAR`** — några få annonser åt spenden under break-even medan
  resten av kampanjen ligger över den. Pausa **bara** de annonser som står i
  `tjuvar` (`entity_type: "ad"`, `fields: {"status":"PAUSED"}`), verifiera med
  en tillbakaläsning per annons, låt kampanjen stå kvar ACTIVE, och logga
  `TRAPPA_FORLANGNING` med tjuvarnas namn och `rest`-siffrorna i motiveringen.
  Redovisa `raddade` i leveransen — det är annonserna som hade dött med
  kampanjen.
- **`INGEN_TJUV`** — förlusten sitter i hela kampanjen, ingen enskild annons
  bär den. Pausa **hela kampanjen** (`entity_type: "campaign"`), verifiera,
  logga `STANG_AV` med utfallets motivering.
- **`STANG_AV`** — tjuvar finns, men kärnan som blir kvar går inte att rädda
  (för tunn, fortfarande under break-even, för många tjuvar, eller taket på
  tre räddningar per 14 dagar nått). Pausa hela kampanjen, verifiera, logga
  `STANG_AV` med utfallets motivering.
- **`ROR_INGENTING`** — ägarskyddet har slagit till: Axel startade om kampanjen
  i dag och det finns inga tjuvar att pausa. Rör ingenting, logga
  `VANTA_AGARBESLUT` (`genomford: false`) och läs om i morgon.

⚠️ **Ägarskyddet.** Har ägaren startat om kampanjen i dag stänger ronden
ALDRIG av den samma dygn — att slå på en kampanj är ett beslut precis som att
pausa en är det. Blödningen stoppas ändå genom att tjuvarna pausas. Koden
sätter `agarskydd: true` i utfallet när det inträffat; säg det i leveransen.

**Varför spärren finns (Axels larm 2026-09-14):** den gamla potentialkollen
krävde en spendtjuv med **noll köp**. Samma morgon stängdes Övervakningskameran
och Adventskalendern Racingbilar av — i båda fallen åt två–tre annonser 89 % av
spenden på ROAS långt under break-even, men de hade köp, så kollen föll och
kampanjerna dog. Utan tjuvarna låg resten på ROAS 3,62 respektive 2,03, alltså
tydligt över break-even. Axel startade om båda för hand och skrev: *"detta vill
jag förhindra från att det händer igen innan vi dödar grejer."* Trösklarna står
som konstanter högst upp i `agent/spendtjuv.mjs` — ändra dem där, aldrig här.

⚠️ Ligger kampanjens ROAS under break-even utan att vara i trappan (domarna
`HALVERA` och `SANK`): kör spärren ändå, men **utför ingenting** — redovisa
tjuvarna i leveransen så Axel ser blödningen innan den blir en avstängning.
I en kampanj som går back pausar bara trappan annonser.

### 3b. Spendtjuven i GRÖNA kampanjer (Axels beslut 2026-09-20 — förslagets 2.3)

Spärren körs numera på **alla aktiva kampanjer som går plus** (domarna
`LAT_VARA`, `SKALA`, `VANTA_KADENS`, `MANUELL`, `MANUELL_SANK`) med
≥ 1 000 kr spend på 3 dygn — Taköverdraget inräknat. Bakgrund: en tjuv på
10 % av 16 000 kr/dag dränerar ~1 600 kr om dagen under break-even och var
osynlig för ronden, för spärren gick bara i trappan.

Per sådan kampanj: hämta annonserna (`level: "ad"`, `date_preset: "last_3d"`,
filtrering på `campaign.id`, fälten `amount_spent`, `omni_purchase`,
`purchase_roas`, `effective_status`, `created_time`; dessutom
`date_preset: "maximum"` för `roas_livstid`). Skriv en jobbfil med
`"lage": "gron"` — **en namngiven lista, aldrig ett mönstersvep**:

```json
{
  "lage": "gron", "idag": "<IDAG>",
  "kampanj_id": "...", "kampanj_namn": "...",
  "break_even": 1.63, "break_even_cpa": 693,
  "spend_3d": "48 000,00 kr (SEK)",
  "annonser": [{ "id": "...", "namn": "...", "spend": "6 000,00 kr (SEK)", "kop": 5,
                 "roas": "0.90", "status": "ACTIVE", "roas_livstid": 1.1,
                 "alder_dagar": 12, "etikett": "BREAKTHROUGH", "etikett_datum": "2026-09-20",
                 "spend_7d": "9 000,00 kr (SEK)", "roas_7d": "0.95", "backdagar_i_rad": 2 }]
}
```

- `break_even_cpa` = AOV ÷ break-even-ROAS, där AOV = livstidens
  `amount_spent × purchase_roas ÷ omni_purchase` för kampanjen. Saknas den
  kan annonser med 0 köp inte dömas — skriptet säger det, och det står i
  leveransen.
- `alder_dagar` ur `created_time`. `etikett` + `etikett_datum` ur senaste
  `ETIKETT`-raden för annonsen i budgetloggen (steg 3c). `spend_7d`/`roas_7d`
  (last_7d) och `backdagar_i_rad` (dygnsserien på annonsnivå) behövs bara för
  annonser med etiketten BREAKTHROUGH — de avgör om nåden bryts.

```bash
node agent/spendtjuv.mjs --jobb <fil.json> --json
```

**Grinden i grönt läge (Axels ord):** ≥ 300 kr OCH ≥ 10 % av spenden OCH
≥ 500 kr dränering, och antingen **≥ 3 köp under break-even × 0,9** eller
**0 köp över 3 × break-even-CPA**. En annons med 1–2 köp under break-even är
brus i en grön kampanj och pausas inte här. *(Trappan behåller den gamla
grinden — Övervakningskamerans tjuvar 2026-09-14 hade 1–2 köp, och med den
nya grinden hade kampanjen dött igen.)*

Domarna:
- **`TJUV_I_GRON`** — pausa **exakt de annonser som står i `tjuvar`**
  (`entity_type: "ad"`, `fields: {"status":"PAUSED"}`), verifiera med en
  tillbakaläsning per annons, rör inte kampanjen, logga en rad per annons
  med kod `TJUV_PAUSAD` (`genomford: true`, `annons_id`, `annons_namn`,
  `spend`, `roas`, `dranering`, `orsak` — aldrig `ny_budget`). Orsaken
  (`TROTT_VINNARE` / `NOLL_KOP` / `UNDER_BE`) går in i leveransen och i
  batch-log.md som utfall, så nästa brief angriper rätt sak. Räddningstaket
  3/14 d förbrukas inte.
- **`INGEN_TJUV`** — ingenting rörs.
- **`ROR_INGENTING`** — fler än fem tjuvar i en kampanj som går plus stämmer
  inte; kontrollera datan, rör ingenting.
- **`vantar`** (nåd eller ung annons) — pausas inte i dag; logga
  `VANTA_BREAKTHROUGH` (`genomford: false`) med `vantar_orsak`, och skriv det
  i leveransen. Nåden gäller BARA annonser med etiketten BREAKTHROUGH ≤ 14
  dygn gammal och livstids-ROAS över break-even, och bryts vid ≥ 3 ×
  break-even-CPA i 7-dygnsdränering eller 5 back-dygn i rad (Evolve: en
  breakthrough får ha en dålig vecka, men inte två).

Pausas en annons med etiketten BREAKTHROUGH eller SPEND_WINNER: posta i
`--kanal larm` (engelska) `"<namn> paused as thief (<orsak>), lifetime ROAS
X — consider re-enabling"`. Ronden startar aldrig något pausat själv.

### 3c. Etiketten dag 7 + breakthrough-frekvensen (Axels beslut 2026-09-20 — förslagets 2.4)

Varje annons får en etikett när den är sju dygn gammal, räknad på **annonsens
egna första vecka** — aldrig `last_7d`. Etiketten beskriver vad Meta gjorde;
den är **ingen dom** (dom, kill, skalning och DNA kräver fortfarande 300 kr
och 3 köp, som står bredvid i fältet `bedombar`). Körs per konto, SE och NO.

1. Per ACTIVE kampanj: hämta annonslistan (`level: "ad"`, fälten `id`,
   `name`, `created_time`, `effective_status`). Kandidater = annonser med
   `created_time` ≤ IDAG − 7 dygn som saknar `ETIKETT`-rad i
   `agent/budgetlogg.jsonl` (`annons_id`). Inga kandidater ⇒ hoppa kampanjen.
2. För varje D0 (skapelsedatum, svensk tid) i kampanjen: hämta insights på
   `level: "ad"` med `time_range: {"since": D0, "until": D0+6}`, fälten
   `amount_spent`, `omni_purchase`, `purchase_roas`, `impressions`,
   `video_view` (3 s), `video_thruplay_watched_actions`, med
   `action_attribution_windows: ["7d_click"]` — och kampanjen i **samma**
   `time_range` (`level: "campaign"`: `amount_spent`, `purchase_roas`).
   Annonser med samma D0 delar anrop. Stryper Meta (kod 17): lista
   kandidaterna som "utan etikett" i leveransen och ta dem i morgon.
3. Skriv en jobbfil per kampanj och kör:
   ```bash
   node agent/etikett.mjs --jobb <fil.json>          # skriver ETIKETT-rader i budgetloggen
   node agent/etikett.mjs --frekvens                 # breakthrough-frekvensen ur loggen
   ```
   Formatet står överst i `agent/etikett.mjs`. `batch` och `typ` läses ur
   produktens `batch-log.md` (`## Batch #N`-rubriken som bär annonsnamnet);
   hittas inget: `batch: null`, `typ: "okänd"` — aldrig gissat. Budgeten
   dag 0/dag 7 läser skriptet själv ur budgetloggen (`gammal_budget`); ange
   `budget_d0`/`budget_d7` bara om du läst dem i Ads Manager.
4. Klistra in tabellen skriptet skriver under en rubrik
   `## Etiketter dag 7 (<IDAG>)` i `products/<id>/batch-log.md` (finns
   mappen), och skriv frekvensraden överst i filen:
   `Breakthrough-frekvens: 3/21 (14 %)` — alltid brutet tal, aldrig procent
   ensam, ingen procent alls under tio annonser. Rör inte dna.md.
5. Dag 14 och dag 28 efter etiketten: kör samma steg med `--uppgradering`
   för annonser som fick SPEND_WINNER eller KPI_WINNER — blir de
   BREAKTHROUGH nu skrivs `ETIKETT_UPPGRADERAD`. Ingen etikett ändras annars.
6. Leveransen får sektionen **"Labels today"** (annons, etikett, andel,
   bedömbar, playbook-läsning) och frekvensen per produkt och batch. Sätts en
   BREAKTHROUGH: posta i `--kanal larm` (engelska) `"Breakthrough: <namn> —
   <andel> % of campaign spend, budget <d0> → <d7> kr"`.

Committa och pusha `agent/budgetlogg.jsonl` + batch-log-filerna i samma push
som rondens loggrader. Notion-fältet `Outcome` och registret
`products/<id>/annonser.jsonl` byggs i nästa steg (Axels A på namnet) — skriv
inga etiketter i Notion förrän det finns.

**En förlängning gäller ett HELT dygn.** Finns en `TRAPPA_FORLANGNING`-rad för
kampanjen **från i dag** (`senasteRadMedKod(logg, id, ["TRAPPA_FORLANGNING"],
{ maxAlderDagar: 14, idag })` i `agent/logg.mjs`): rör inte kampanjen, logga
`VANTA_FORLANGNING` (`genomford: false`). Dygnet har inte gått. *(2026-09-02:
Badshorts och Plyschtofflorna fick förlängning på morgonen och stängdes av av
samma dags körning några timmar senare — det var fel.)*

Är raden från ett tidigare datum kör du spärren igen som vanligt: hittar den
nya tjuvar och en kärna över break-even får kampanjen leva vidare. **Taket är
tre räddningar per 14 dagar** och räknas av koden (`MAX_RADDNINGAR_14D` i
`agent/spendtjuv.mjs`) — nya tjuvar varje dygn är ett kampanjproblem, och då
faller domen tillbaka till `STANG_AV`. Har kampanjen vänt över break-even
faller hela trappan bort av sig själv — då står det inte längre `trappa`
i planen.

De gamla koderna `TRAPPA_STEG_1/2/3` skrivs aldrig mer. De ligger kvar i
budgetloggen som historik och ska läsas, inte återanvändas.

`plan.uppskjutna` utförs INTE — logga varje med kod `UPPSKJUTEN_GRANS`,
`genomford: false`, och orsaken som motivering.

## 4. Vad du ALDRIG gör

- Aldrig en ändring som inte står i `plan.atgarder`.
- Aldrig `pipeline/meta.mjs` (defaultar till fel konto).
- Aldrig fortsätta efter en misslyckad verifiering — återställ och avbryt.
- Aldrig starta något som är pausat. Ronden stänger av; den startar aldrig på.
- Aldrig röra priser, texter, creatives, målgrupper eller andra konton.

## 4b. Annonsbatcherna (Axels beslut 2026-08-29: rutinen kör dem själv, var tredje dag)

Det här är rutinens andra jobb, lika viktigt som budgetarna: **varje produkt
med en batch ska få sin nya brief-runda var tredje dag.** `annonsbehov` i
utfallet listar allt som är förfallet, färdigsorterat (första batchen först,
sen rundorna med äldst batch först).

⚠️ **BARA SVERIGE.** `annonsbehov` är tomt för NO-körningen och ska så vara.
De norska annonserna är de svenska annonserna översatta i ett eget flöde
(`/translate-no`) — Norge behöver aldrig egna briefer, egen Notion-hub eller
eget produktminne. I NO-kontot gör ronden **bara** budget upp och ner.
*(Axels besked 2026-09-01. Innan spärren byggde rutinen två norska hubbar och
lät dem äta tre av sex briefplatser på tre morgnar.)*

**Så många körs per morgon (Axels beslut 2026-09-01):**

1. **Alla `forsta_batch` — inget tak.** Kör dem först och kör dem alla. En
   produkt får en förstabatch exakt en gång, så kön tar slut av sig själv.
   Det är här pengarna finns: en produkt som passerat 1 500 kr på ≥20 % vinst
   står och väntar på material den redan förtjänat.
2. **Sedan alla `brief_runda` — inget tak heller**, äldst först. Axels
   besked 2026-09-02: "jag tar hellre några briefs för mycket, jag har ett
   överflöd av redigerare." Hinner körningen inte hela kön: det som inte
   fick sin `*_KLAR`-rad flaggas igen imorgon (det är så kön är byggd) —
   lista i svaret exakt vilka som blev kvar.

*(Taket hette tidigare två poster totalt, sedan två rundor. Bägge var
räknade för sex produkter; kontot hade 17 aktiva kampanjer den 1 september
och Soptunneklistermärkena stod 12 dagar utan runda.)*

🛑 **STOPP — LÄS KAMPANJENS STATUS INNAN DU SKRIVER EN ENDA BRIEF.** Hämta
kampanjen med `ads_get_ad_entities` (`effective_status`) direkt före batchen.
Är den något annat än `ACTIVE`: hoppa över produkten, skapa INGEN Notion-hub,
skriv INGA briefer, logga INGEN `*_KLAR`-rad, och skriv en rad i leveransen om
att den hoppades över för att den är pausad.

**Att ronden själv pausade kampanjen samma morgon är inget undantag — det är
det vanligaste fallet.** En kampanj du stängde av i steg 3 får inte briefer i
steg 4b. Aldrig. Att bygga material till en kampanj som inte kör är slöseri med
redigerarnas tid, och det ser i Notion ut som arbete som betyder något.

`annonsbehov` filtrerar numera bort tre saker: domarna `STANG_AV` och
`ATGARDSTRAPPAN`, och varje kampanj vars senaste genomförda livscykelrad i
budgetloggen är `STANG_AV` (`arAvstangd` i `agent/rond.mjs`). Dyker en pausad
produkt ändå upp i behovslistan är loggen fel — fixa loggen, bygg inte batchen.

*(Två larm från Axel. 2026-09-02: Kranskydd Frost 420D var pausad och fick ändå
9 briefer. 2026-09-04: Medicinasken i Fickformat, Kasta & Fånga-settet och
Bordtennisnätet stängdes av på morgonen och fick 47 briefer och tre nya
Notion-hubbar av samma körning — via `ersatt`-behov som avstängningen själv
utlöste. Den kopplingen är borttagen: `ersatt` kommer numera bara från
`TRAPPA_FORLANGNING`, alltså när enskilda annonser pausats men kampanjen kör.)*

**Batchens innehåll (Axel 2026-09-02):**
- **Fler videor.** Redigerarna är många — minst två tredjedelar av varje
  batch är video. Förstabatch: sex nya videokoncept + variationer på
  vinnarna + sex statiska. Brief-runda: `rundaAntal` annonser (dubbla
  veckokvoten, minst fyra), varav högst två statiska.
- **Bilder bara med ett jobb** (Axels beslut 2026-09-20, ersätter "gör extra
  bara för att" från 2026-09-02 — han såg själv att det bara spammade
  bildannonser). En bildbrief skrivs när den har ett av tre jobb, och jobbet
  står i briefens första rad: **validera en ny vinkel** (billigare än video —
  videon byggs först när bilden är validerad: ≥ 300 kr och ROAS_7d ≥
  break-even), **svara på en invändning** (BOF: pris/garanti/jämförelse —
  bara om produktens senaste BOF-etiketter har minst en KPI_WINNER, annars
  0 BOF-bilder nästa batch), eller **variant på en vinnare** (en variabel).
  Review-bilder bara med **riktiga recensioner** ur produktsidan eller
  Judge.me — citatet ordagrant, aldrig omskrivet, aldrig påhittat.
  *(Sömnadskitet 2026-09-02: en review-bild gick ut med nonsenstext som
  "citat". Det får aldrig hända igen.)* En bild vars tagg redan bärs av en
  live-annons med ≥ 10 % av spenden är en dubblett och skrivs inte.
  Bilderna räknas inom `rundaAntal`, inte utöver.
- **Briefens format är mallen i `forsta-batch.md` (LEVERANSFORMAT).** Enkel,
  kort, samma struktur varje gång. Tre-frågorstabellen är obligatorisk på
  varje svensk rad — en rad med ett ❌ går inte ut.

- Behov `forsta_batch` → produkten har passerat 1 500 kr OCH ligger på minst
  **20 % vinst**. Under det flaggas ingenting: produkten chillar och prövas om
  nästa dygn. Bygg ALDRIG en batch för en produkt som inte står i listan.
  Följ `.claude/commands/forsta-batch.md` i sin helhet
  (analys → briefer → Drive → Notion). Strategin görs FÖRST, sedan läggs
  annonserna i produktens Notion-hub — det är där Jasper och redigerarna ser
  dem, via det vanliga veckoflödet. **Rutinen skriver briefer — den gör aldrig
  själva annonserna. Redigerarna gör annonserna.**
  ⚠️ Drive: batchmappen läggs i produktens BEFINTLIGA mapp (Joshs) — ALDRIG
  ny mapp i `BÄVER/Products`, det är lanseringskön. Exakt regel i
  forsta-batch.md punkt 5.
- Behov `brief_runda` (och `ersatt`/`mata_vinnare` på en produkt som redan har
  minne i `products/<id>/`) → följ `.claude/commands/cs.md`. Står det ett
  "Fokus:" i orsaken styr det rundans inriktning.
  **Saknar produkten minnesfiler** (ingen `products/<id>/dna.md`, inte heller i
  `git log --all` — händer när batchen är historisk, gjord före systemet) →
  kör `.claude/commands/forsta-batch.md`-flödet i stället, det bygger minnet
  från noll. Logga ändå `CS_BATCH_KLAR` (produkten HAR redan haft en batch).
  ⚠️ Den här specialregeln är INGEN väg runt statusspärren ovan. Saknade
  minnesfiler på en pausad kampanj betyder att produkten är död utan minne —
  inte att den ska få en förstabatch. Kolla status först, alltid.
- **Rundans storlek = `rundaAntal`** i behovsraden — dubbla veckokvoten,
  aldrig under fyra (`rundkvot` i `agent/rond.mjs`). Axel 2026-09-02: "jag tar
  hellre några briefs för mycket, jag har ett överflöd av redigerare." För
  `forsta_batch` gäller i stället hela veckokvoten (`veckokvot` i utfallet).
  Kvoten planar ut vid 3 000 kr/dag (4 annonser i veckan, 8 per runda) — en
  budget på 16 000 kr ger inte fler briefer än en på 4 000. Det är med flit.
- **Axels manuella zon (2026-09-19): budget över motorns tak 4 000 kr.**
  Motorn höjer aldrig dit, så en sådan budget har Axel satt själv
  (Taköverdraget: 16 000 kr/dag, fick tidigare `ORIMLIG_DATA` och ingen dom
  alls). Domen blir `MANUELL` (går plus, lämnas) eller — sedan 2026-09-20,
  Axels mjuka form — `MANUELL_SANK` (går back: **−20 % samma morgon**, jämna
  50 kr, aldrig under taket 4 000, aldrig paus, högst en gång per dygn; utförs
  som en vanlig `typ: "budget"`-åtgärd i steg 3 och postas dessutom i
  `--kanal larm` med ping till Axel). Under taket tar de vanliga reglerna
  över. *(Förslaget "kapa till 4 000 i ett steg" avvisades: 75 % på en morgon
  på en produkt som drar ~26 000 kr i vinst per dag kostar mer än det
  skyddar, och Evolve säger att en breakthrough får ha en dålig vecka.)*
  Briefrundan går som vanligt. Rimlighetstaket för felparsning är 50 000 kr;
  över det är det fortfarande `ORIMLIG_DATA`.
- **Hubben är den som står i `agent/produktkarta.json` (`notion_hub_id` +
  `notion_hub_datakalla`).** Finns den där: använd den, sök inte, skapa inte.
  Axel bygger hubbarna själv sedan 2026-09-13 och döper dem **"BÄVER <produkt>"**
  — de innehåller INTE orden "creative hub". Sex sådana är registrerade i
  kartan. En produkt som varken har hub i kartan eller hittas på namn får en
  hub enligt punkten nedan.
- **Ny produkt utan Notion-hub:** bygg ALDRIG en hub från grunden och klona
  ALDRIG schemat via create-database — då blir statusarna svenska
  (Inte påbörjad/Pågår/Klar) och hubben hamnar utanför teamspacen. Fel båda
  gångerna det testades 2026-08-29. Gör i stället:
  1. Duplicera den TOMMA mallen **"Creative hub MALL"**
     (id `3cc270ab-908c-8005-a50e-db6b1b179794`, Axels mall i
     Bäverbutiken-teamspacen) med notion-duplicate-page. Dubbletten ärver
     engelska statusar (Draft, In progress, In progress 2, Approved …), alla
     vyer OCH teamspace-platsen. Verifierat 2026-08-30.
  2. Dupliceringen är asynkron — vänta och hämta om tills databasen finns,
     döp sedan om via notion-update-data-source till
     "<Produktnamn på engelska> creative hub".
  3. **Åtkomsten ärvs från MALLEN — den går inte att sätta via API:t.**
     En dubblett hamnar där originalet ligger. Ligger `Creative hub MALL`
     privat blir VARJE ny hub privat, och redigerarna ser ingenting.
     Notion-MCP:n har inget verktyg för att dela en sida eller sätta
     behörigheter — det finns bara i Notions gränssnitt.
     ⚠️ **`<ancestor-path>` går INTE att använda för att avgöra det här**
     (Axels rättelse 2026-09-05). Ett tomt `<ancestor-path>` vid notion-fetch
     betyder INTE att hubben är privat — testat mot en hubb redigerarna
     garanterat redan jobbar i (rader i "Translation in review") och den gav
     samma tomma fält. Verktyget fyller uppenbarligen aldrig i fältet för
     databaser i det här workspacet, oavsett delning. Ett falskt larm gick ut
     till Discord 2026-09-05 på grund av detta.
     Misstänker du att en ny hubb ändå ligger privat (redigerarna säger de
     inte ser den, eller `Creative hub MALL` själv har flyttats/ändrats
     nyligen): fråga Axel rakt av i stället för att lita på ett Notion-fält.
     Skapa items som vanligt — arbetet ska aldrig hållas tillbaka på en
     ogrundad misstanke.
     *(Axels larm 2026-09-02 om privata hubbar var på riktigt då — problemet
     kan fortfarande finnas. Det är bara den här diagnosmetoden som är värdelös.)*
  4. Skapa items med notion-create-pages: Status "Draft",
     Typ **"Video - Pending Approval"** för video och
     **"Image - Pending Approval"** för bildannonser (Axels nya typ i mallen).
  Går mallen inte att hitta: skapa INGEN hub — lista i svaret exakt vilka
  items som skulle skapats och säg det till Axel.
  **HELA BRIEFEN SKA LIGGA I NOTION-ITEMET** (Axels besked 2026-09-02). Sidans
  innehåll ÄR briefen: hypotes, hook-tabell, shot list med svenska rader i
  `Swedish (use this) | English meaning`, creator/editing direction, CTA, KPI,
  globala regler — allt. Drive-länken till batchmappen är ett komplement som
  läggs överst, aldrig ersättningen. **Skriv ALDRIG "se brief.md i Drive" eller
  en länk till en .md-fil** — redigerarna kan inte öppna dem, och en Notion-sida
  med bara en länk är en tom brief. *(Hände 2026-08-31: alla 12 kamera-items
  innehöll tre rader och länken `http://brief.md`. Redigerarna stod stilla en
  hel dag och Axel fick "I can't access the links" i Slack.)*
  Innan `*_KLAR` loggas: öppna ETT av de skapade itemen med notion-fetch och
  kontrollera att shot list/design brief faktiskt står där. Saknas den är
  batchen inte klar.
  **ALLT som skrivs i Notion är på ENGELSKA** — itemnamn, statusar, innehåll,
  kommentarer. Redigerarna läser inte svenska.
  Anteckna hubbens id + Drive-mappens id i `agent/produktkarta.json`.
- När batchen är klar OCH uppladdad till Notion: skriv en loggrad med kod
  `FORSTA_BATCH_KLAR` (respektive `CS_BATCH_KLAR`), `genomford: true` —
  det är den raden som startar om 3-dagarsklockan.
- **Minnesfilerna** (`products/<id>/dna.md`, `batch-log.md`, `backlog.md`):
  skriv dem i arbetskopian som vanligt och **committa + pusha dem** i samma
  push som loggraden. En batch vars minnesfiler inte är pushade är INTE klar.
- Hinner en batch inte bli klar (avbrott, fel): logga ingenting med *_KLAR —
  då flaggas behovet igen imorgon och batchen görs om hel.

## 4c. Notion-svepet — vilka hubbar finns, och vad ska produceras

Körs **varje morgon**, före leveransen. Utan det här upptäcker varken du eller
Discord-boten att en ny produkt fått en creative hub, och arbetet blir osynligt.

0. **Sug forst Product test center SE BAVER**
   (`collection://d80270ab-908c-839b-9dcc-8721c5f29570`). Det ar dar NYA
   produkter bor, och sjalva produktsidan bar arbetet: voiceover-manus per
   koncept, hooks och Drive-lankar. Hamta allt med Status `Ads review`,
   `Ready to launch`, `In progress` och `Testing`. **Hoppa aldrig over det har
   steget** — en tidigare korning sa "det finns inget arbete" nar 18 produkter
   lag i Testing, for att den bara tittat i creative hubs.

1. `notion-search` på `creative hub` OCH på `BÄVER` (Axels nya hubbar heter
   "BÄVER <produkt>" och saknar orden creative hub — mätt 2026-09-13),
   `page_size: 25`, `max_highlight_length: 0`.
   ⚠️ Sok ocksa pa produktnamnen ur produktkartan. Hubben for fiskespohallaren
   heter bara "Fish rod holder" — en sokning pa "creative hub" missar den helt.
   Svaret innehåller `is_archived` per träff — **använd det fältet**, gissa
   aldrig utifrån namnet. Axel arkiverar allt som inte körs längre.
2. För varje hub som **inte** är arkiverad: `notion-fetch` på dess id och läs ut
   `collection://…`-URL:en ur `<data-source url="…">`.
   Hubbar som redan står i `agent/notion-uppgifter.json` har sin collection
   sparad — hoppa över hämtningen för dem.
3. Fråga varje collection:
   ```sql
   SELECT "Namn", "Typ", "Status", "Prioritet" FROM "collection://…"
   WHERE "Typ" IN ('Video - Pending Approval','Image - Pending Approval')
   ```
   **Filtrera på inkludering, aldrig på uteslutning.** Guideline, SOP, Feedback
   och `Winning Creative` är dokumentation och räknas aldrig som annonser —
   filtrerar du bort dem i stället smyger nya stödsidor in i mätningen.
4. Skriv om `agent/notion-uppgifter.json`: levande hubbar med collection-id,
   arkiverade hubbar, och alla rader med Status `Draft`. Sätt `uppdaterad` till
   dagens datum. **Committa och pusha filen.**
5. Rapportera i leveransen:
   - **Nya hubbar sedan igår** (fanns inte i filen innan) — det är signalen att
     en produkt börjat rulla.
   - Hubbar som blivit arkiverade sedan igår.
   - Antal drafts per produkt, uppdelat på video och bild.

Hittar du en hub som saknar produkt i `agent/produktkarta.json`, eller en
kampanj i produktkartan som saknar hub: säg det. Det är oftast en glömd
uppsättning, inte ett fel i datan.

## 4d. Startskottet (Axels beslut 2026-09-10, kvar sedan 2026-09-13 vid sidan av briefsen)

**Axel ångrade sig 2026-09-13: ronden gör BÅDE briefer (4b–4c) OCH startskott.**
Den 10:e togs briefhalvan bort; den 13:e lades den tillbaka, för Axel vill
fortsätta skala produkterna på Bäverbutiken med fler videoredigerare — och
samtidigt få larmet när en produkt förtjänar en egen OPS-butik.

Vid sidan av briefsen postar ronden **dessutom ett startskott** i
Discord-kanalen `#ops-startskott` när en produkt klarat testet. Meddelandet
säger att produkten ska få en egen OPS-butik och bär det färdiga
`/ny-ops`-kommandot. Startskottet ersätter inte batchen — produkten får båda.


### Så här körs det

Listan kommer från **`startskottsbehov(rader, { logg, marknad })`** i
`agent/startskott.mjs`. Den läser tröskeln direkt ur `agent/rond.mjs`:
**1 500 kr total spend OCH minst 20 % vinst** (`FORSTA_BATCH_SPEND_SEK` /
`FORSTA_BATCH_VINST_PROCENT`). Rör aldrig de talen — de är Axels och testade.

⚠️ **Använd INTE `annonsbehov` till det här.** `forsta_batch` ges bara till
produkter som ALDRIG haft en batch; den som redan fått en hamnar för alltid i
`brief_runda`. Byggde man larmet på `forsta_batch` skulle det bara utlösas för
splitternya produkter, medan de bevisade produkter som redan fick briefer
under det gamla systemet aldrig larmades alls. *(Mätt 2026-09-10: 45
SE-kampanjer i loggen, 14 med batch — bland dem Fiskespöhållaren,
Båtmotorskyddet 420D och MC-Kapellet.)*

⚠️ **BARA SVERIGE.** `startskottsbehov` returnerar tomt för NO och ska så
göra. En norsk kampanj utlöser aldrig en ny butik — norska annonser är svenska
annonser översatta i ett eget flöde.

`startskottsbehov` filtrerar redan bort fryst, avstängt, trappan och allt som
redan larmats (`OPS_STARTSKOTT`) eller redan har en butik (`OPS_FINNS_REDAN`).
Listan är sorterad med störst spend först.

För varje rad i listan, i ordning:

0. **Har produkten redan en OPS-butik?** Läs kampanjerna i OPS-kontot
   **MagiBorsten DK `915422744950975`** en gång per körning
   (`ads_get_ad_entities`, `level: "campaign"`, `date_preset: "maximum"`).
   OPS-kampanjerna heter `<BRAND>_SE_<produkt>` och `<BRAND>_NO_<produkt>`.
   Kända brands 2026-09-10: **HEIMGUARD** (Övervakningskameran),
   **TANKGUARD** (IBC-Tanköverdraget), **DRYTREK** (Damasker Vandring),
   **ADVENTLANERACING** (Adventskalendern Racingbilar).

   Ser du en OPS-kampanj för produkten: posta **inget** larm. Skriv i stället
   en `OPS_FINNS_REDAN`-rad i budgetloggen med brandet och OPS-kampanjens namn
   som motivering, och nämn det på en rad i leveransen. Då tystnar produkten
   för gott och nästa körning behöver inte läsa om det.

   ⚠️ **Är du osäker på om en kampanj hör till produkten: larma, tysta inte.**
   Ett larm för mycket kostar Axel tio sekunder. Ett larm som uteblir kostar en
   butik som aldrig byggs, och ingen märker det.

   ⚠️ **Kontot är INTE bara OPS.** Bäverbutikens gamla danska kampanjer ligger
   där också (`Motorhöljet DK`, `Strandtofflorna DK`, `Fiskespöhållaren DK` …).
   De saknar `<BRAND>_SE_`/`<BRAND>_NO_`-formen och är **inga** OPS-butiker.
   Läs formen på namnet, aldrig bara produktnamnet.

1. **Läs kampanjens status.** Hämta den med `ads_get_ad_entities` direkt före
   larmet. Är `effective_status` något annat än `ACTIVE`: hoppa över, och
   skriv en rad i leveransen om varför. **Att ronden själv pausade kampanjen
   samma morgon är inget undantag** — en produkt som just stängdes av ska
   inte få en egen butik byggd.

2. **Hitta källänken.** Startskottet är värdelöst utan den — VA:n ska kunna
   klistra in `/ny-ops <länk>` utan att leta. Ta produktsidans URL på
   bäverbutiken.se. Hittar du den inte: posta larmet ändå, men skriv
   `KÄLLÄNK SAKNAS` i produktfältet och säg det i leveransen. **Gissa aldrig
   en URL.**

3. **Posta larmet.**

   ```bash
   node agent/startskott.mjs --jobb <fil.json>
   ```

   Jobbfilen skrivs av dig ur rondens egna siffror och måste bära:
   `produkt`, `kampanj_id`, `kalla_url`, `spend_total`, `kop`, `cpa`,
   `break_even_cpa`, `roas`, `vinst_procent` — plus `datum`.
   **Skriptet vägrar om ett tal saknas.** Det är med flit: hellre inget larm
   än ett larm med ett påhittat tal. Hitta aldrig på ett värde för att komma
   förbi spärren; skriv i stället i leveransen vilket tal som fattades.

   Kör `--torr` först om du vill se meddelandet utan att posta.

4. **Logga.** Skriv raden från `byggLoggrad` i `agent/budgetlogg.jsonl`
   (kod `OPS_STARTSKOTT`, `genomford: true`), committa och pusha **direkt**.
   Nekas pushen: larma i svaret. Utan raden går larmet ut igen imorgon.

   ⚠️ Loggraden får aldrig bära `ny_budget`. `dagarSedanAndring` i
   `agent/logg.mjs` räknar varje genomförd rad med det fältet som en
   budgetändring, och då fryses kampanjen i tre dygn utan att någon rört
   budgeten. `byggLoggrad` utelämnar fältet — lägg inte till det.

### Provlarmet

Hela kedjan går att testa utan att vänta på en riktig produkt:

```bash
node agent/startskott.mjs --test --torr   # visa provlarmet, posta inget
node agent/startskott.mjs --test          # posta provlarmet skarpt
```

Provlarmets tal är påhittade och produktnamnet säger att det är ett test.
Kopiera dem aldrig in i en riktig körning.

## 5. Logga

En rad per kampanj i `agent/budgetlogg.jsonl` via `skrivRad` i
`agent/logg.mjs` — även för LAT_VARA och väntande (`genomford: false` där
inget gjordes). Utförda ändringar: `genomford: true`,
`godkand_av: "auto — Axels stående beslut 2026-08-29"`. Fältformatet står i
`/rond` steg 5.

Nya koder sedan 2026-09-20: `MANUELL_SANK` (budgetändring, bär `ny_budget`),
`TJUV_PAUSAD` och `VANTA_BREAKTHROUGH` (annonsnivå, steg 3b), `ETIKETT` och
`ETIKETT_UPPGRADERAD` (steg 3c, skrivs av `agent/etikett.mjs`). De fyra sista
får **aldrig** bära `ny_budget` — `skrivRad` vägrar, för kadensspärren skulle
annars frysa kampanjen i tre dygn.

## 6. Leverans

Committa och pusha `agent/budgetlogg.jsonl` + `agent/produktkarta.json`
(om ändrad) till `claude/daily-agent-discussion-uos5df`.

**Gick pushen igenom: du är klar här.** Bygg INTE om dashboarden och
publicera ingen artefakt — se blocket högst upp i filen.

**Nekades pushen:** skriv i svaret att pushen nekades och vilka loggrader som
därmed inte sparades. Försök inte rädda dem någon annan väg.

Svara sedan kort på svenska: vad som ändrades (produkt, från → till), vad som
sköts upp och varför, om något larmade — vilka brief-rundor/batcher som
kördes (produkt + antal briefer + Notion-länk) respektive ligger kvar i kön
till imorgon — och **vilka startskott som gick ut** (produkt + siffrorna).
Gick inget startskott: skriv ingenting om det. Inga bibelsvar.

**Skicka samma korta rapport till Discord** (Axels order 2026-08-30) —
**på ENGELSKA.** Allt som postas som Bävern läses av det engelsktalande
teamet, så varje Discord-post skrivs på engelska även när svaret till Axel
här är på svenska. Produkt-, kanal- och kampanjnamn behåller sin svenska
stavning; belopp skrivs "1 200 SEK". Axels besked 2026-09-02.

```bash
node agent/discord-post.mjs --kanal ronden "Daily round <datum>" "<rapporten i Markdown, på engelska>"
```

⚠️ **ALLT som postas i Discord skrivs på ENGELSKA** — rubrik och brödtext, i
kanalerna `ronden`, `uppgifter` och `larm`. Redigerarna läser samma kanaler
som Axel och förstår inte svenska. Produktnamnen behålls som de heter i Meta
(t.ex. "Båtmotorskyddet 420D"), resten översätts: SKALA → "Scaled up", SANK →
"Scaled down", STÄNG AV → "Paused", uppskjuten → "Deferred", brief-runda →
"brief round", förstabatch → "first batch". Svaret till Axel i chatten är
fortfarande på svenska. *(Axels order 2026-09-02 — samma dag
postades rapporten på svenska och redigerarna kunde inte läsa den.)*

⚠️ **Ett enda undantag: `#ops-startskott` skrivs på SVENSKA.** Den kanalen
läses av Axel och VA:n, inte av redigerarna, och Axel skrev mallen själv på
svenska 2026-09-10. Texten byggs av `agent/startskott.mjs` — skriv den aldrig
för hand och översätt den aldrig.

Skriptet sköter kanalval, delning över 2 000-teckengränsen, rate limits och
**pingarna** (Axel 2026-09-02: varje post pingar personerna i `pinga` i
`agent/discord.json` — i dag confident_otter_25993 och ecom_chadking). Skriv
aldrig egen curl-kod mot Discord, och skriv aldrig "@namn" själv i texten —
det pingar ingen. Säger skriptet att ett namn inte gick att slå upp: nämn
det på en rad i svaret. Varje rutin har sin egen kanal
(`kanalplan` i `agent/discord.json`); finns kanalen inte än postas det i
standardkanalen i stället för att tystna.

Posta dessutom, i **egna** poster:
- `--kanal uppgifter` varje gång nya uppgifter går ut till redigerarna
  (brief-runda eller förstabatch klar): produkt, antal briefer, Notion-länk.
- `--kanal larm` när något kräver Axel: `STOR_SPEND_UTAN_KOP`, `plan.sparrad`,
  misslyckad verifiering efter en Meta-skrivning, varje `MANUELL_SANK`
  (sänkning i hans manuella zon), en pausad tjuv med etiketten BREAKTHROUGH
  eller SPEND_WINNER, och varje ny BREAKTHROUGH-etikett.

Startskotten postas **inte** härifrån — `agent/startskott.mjs` gör det själv
i steg 4d, i sin egen kanal och på svenska.

Misslyckas Discord-posten: nämn det i svaret men stoppa ingenting.

## DEFINITION OF DONE
- [ ] Färsk `git pull` innan något annat
- [ ] Tre Meta-anrop gjorda mot BÅDA kontona: SE `1867947880635861` och NO `1050941584152547`
- [ ] `kontodata.json` (SE) och `kontodata-no.json` (NO) skrivna ordagrant
- [ ] Ronden körd för båda marknaderna; `plan.sparrad` kontrollerad för var och en
- [ ] Varje åtgärd utförd med öre-fältet ur planen och verifierad med läsning
- [ ] Kontodatan hämtad med `action_attribution_windows: ["7d_click"]` och `attribution` skrivet — eller rapporterat varför inte
- [ ] Spendtjuven körd i grönt läge på alla plus-kampanjer ≥ 1 000 kr/3 d, mot en namngiven lista; tjuvar pausade en och en med tillbakaläsning, `TJUV_PAUSAD`/`VANTA_BREAKTHROUGH` loggade utan `ny_budget`
- [ ] `MANUELL_SANK` utförd högst en gång per kampanj och dygn, aldrig under 4 000 kr, larm postat
- [ ] Etiketter dag 7 satta för alla annonser ≥ 7 dygn utan etikett (båda kontona), tabellen i batch-log.md, frekvensen i leveransen — eller "utan etikett" listade vid strypning
- [ ] Uppskjutna loggade som `UPPSKJUTEN_GRANS`
- [ ] Alla `forsta_batch` körda (inget tak) + alla `brief_runda`, med
      *_KLAR-loggrad och minnesfiler pushade — eller exakt redovisat varför inte
- [ ] Briefer skrivna i hubben ur `produktkarta.json` (BÄVER-hubbarna) — ingen
      ny hub skapad för en produkt som redan har en i kartan
- [ ] Inga briefer, hubbar eller minnesfiler skapade för NO — Norge är bara budget
- [ ] Ingen dom om privat/delad hubb fälld på `ancestor-path` (trasig signal, se 4b) — misstanke går till Axel som en fråga, inte som ett påstående
- [ ] Ett skapat Notion-item öppnat och kontrollerat: hela briefen står i sidan, ingen `.md`-länk
- [ ] Notion-svepet kört: hubbar avlästa med `is_archived` (sök både "creative hub" och "BÄVER"),
      drafts hämtade, `agent/notion-uppgifter.json` omskriven med dagens datum och pushad
- [ ] Nya och nyss arkiverade hubbar redovisade i leveransen
- [ ] Startskottslistan hämtad ur `startskottsbehov` — inte ur `annonsbehov`
- [ ] OPS-kontot `915422744950975` avläst; produkter som redan har en butik
      tystade med `OPS_FINNS_REDAN` i stället för att larmas
- [ ] Varje rad i startskottslistan har fått ett larm i `#ops-startskott` — eller
      exakt redovisat varför inte (kampanjen inte ACTIVE, källänk saknas)
- [ ] Varje startskott loggat som `OPS_STARTSKOTT` och pushat
- [ ] Inga startskott för NO
- [ ] Alla loggrader skrivna och pushade efter varje ändring (= minnet sparat)
- [ ] Ingen artefakt publicerad och `agent/dashboard.mjs` inte körd
- [ ] Kort svar till Axel enligt svarsformatet i CLAUDE.md regel 14
