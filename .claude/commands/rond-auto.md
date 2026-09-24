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
på BUDGETÄNDRINGARNA i Meta. **Annonsbehoven i steg 4b är fortfarande
obligatoriska** — alla förstabatcher och alla förfallna brief-rundor, utan tak.
En körning som lämnar förfallna behov utan åtgärd och utan redovisning är INTE
klar. *(Körningen 2026-08-30 hoppade över hela kön på den meningen — det var
fel tolkning. Briefhalvan togs bort 2026-09-10 och lades tillbaka 2026-09-13
på Axels order. Startskottet i steg 4d är AVSTÄNGT sedan 2026-09-24 — Axel
bygger inga fler OPS-butiker utom vid extrema undantag.)*

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
3. `date_preset: "last_14d"` + `time_increment: "1"` — dygnsserien. Varje dygn i `dygn`: `datum`, `roas` (7d_click), `spend` ur `amount_spent`, **`kop`** (omni_purchase `7d_click`), **`kop_visning`** (omni_purchase `1d_view`) och **`cpa`** (`cost_per_action_type → omni_purchase`, `7d_click`). De tre sista är nya sedan 2026-09-22: CPA-trenden, klickandelen och "konsekvent över target" räknas ur dem (`agent/trend.mjs`). Kör därför det här anropet med `action_attribution_windows: ["7d_click", "1d_view"]` och fälten `actions`, `cost_per_action_type`, `purchase_roas`, `spend`. ⚠️ Två saker som ser ut som saknade tal men är mätta nollor: **Meta utelämnar hela `omni_purchase`-raden ett dygn utan köp ⇒ `kop: 0`, `cpa: null`** (spend utan köp = oändlig CPA, en stigning), och **utelämnar nyckeln `1d_view` när visningsköpen är 0 ⇒ `kop_visning: 0`**. Bara ett dygn som helt saknar `actions`/`spend` skrivs `null`. Utan dygnsserie fäller motorn `VANTA_KONSEKVENT` (ingen höjning) och rapporten varnar per kampanj. Kampanjfältet `kop_3d_visning` (köp 1d_view senaste 3 dygnen ur anrop 1) är reservväg för klickandelen om dygnsserien saknar visningstal.
4. *(bara i surf-läget, `--surf`)* `date_preset: "today"` och `"yesterday"` — `spend_idag`, `roas_idag`, `kop_idag`, `spend_igar` per kampanj, och `timme` (annonskontots lokala timme vid hämtningen) överst i filen.

**Anrop 1 och 2 med `action_attribution_windows: ["7d_click"]`; anrop 3
(dygnsserien) med `["7d_click", "1d_view"]`, se ovan** (Axels
beslut 2026-09-20). Mätt samma dag: kontonivån skiljer 1,7 % (SE) och 0 %
(NO), men Fiskespöhållaren visade ROAS 2,01 med visningsköp inräknade och
1,64 på klick — 18,6 % — mot break-even 1,50; IBC 7,1 %, Båtmotorskyddet
5,4 %. Läser du `purchase_roas`/`omni_purchase` ur svaret: ta värdet för
fönstret `7d_click`, inte `value`. Skriv `"attribution": "7d_click"` överst i
kontodatafilen — `rond.mjs` varnar när fältet saknas eller säger något annat.
Tar MCP-verktyget inte parametern: kör `ads_get_field_context`, skriv i
rapporten att attributionen är kontots standard, och gissa aldrig ett tal.

**Hämta OCKSÅ visningstalet (Axels beslut 2026-09-21).** Kör anrop 1 med
`action_attribution_windows: ["7d_click", "1d_view"]` i stället — svaret bär
då BÅDA: `value` är Metas deduplicerade total *inklusive* visningsköp och
`7d_click` bara klicken. Skriv `roas_3d` ur `7d_click` som förut, och lägg
till **`roas_3d_visning` ur `value`** på varje kampanj. Domen räknas aldrig på
visningstalet — det används bara av `visningsvarning()` i `agent/rond.mjs`,
som larmar när över 5 % av ROAS:en kommer från visningsköp OCH kampanjen
ligger inom 15 % från break-even (mätt på båda talen, eller när de står på var
sin sida om den). Saknas fältet: ingen varning, aldrig en gissning.
*(Mätt 2026-09-21, 30 dygn: SE-kontot uppblåst 2,8 %, NO 0,0 % — men
Vandringskängor 22 %, Skoreparationslapparna 10,8 %, IBC 7,5 %,
Övervakningskameran 6,9 %, Båtmotorskyddet 6,0 %. Vandringskängor låg 1,61 med
visningsköp och 1,32 utan, mot break-even 1,60: domen vänder. Zonen mäts på
båda talen just därför — på klick-ROAS ensamt ligger den 17,5 % ifrån och hade
missats.)*

Fältnamnen är exakta. Använd **aldrig** `omni_purchase_values` (buggig, se
CLAUDE.md). Skriv siffrorna **ordagrant** till `agent/kontodata.json` i samma
format som `/rond` beskriver. Saknas ett värde: `null`, aldrig 0, aldrig gissat.

Skriv SE till `agent/kontodata.json` och NO till `agent/kontodata-no.json`.
Sätt `ad_account_id` och `ad_account_namn` i varje fil till det konto datan
faktiskt kommer från — kontrollen läser dem och avbryter vid minsta glapp.

Aktiv kampanj som saknas i `agent/produktkarta.json`: lägg till den som
`"lage": "test"` med motivering, och slå upp produkten i Axels prissheet
(länk i kartans `kommentar`) för ett `kostnad`-block — se regelblocket
"Skalning mäts mot TARGET" nedan. Gissa aldrig break-even — utan tal i
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
`LAT_VARA`, `SKALA`, `VANTA_KADENS`, `CPA_STIGER`, `VISNING_AVVAKTA`,
`VANTA_KONSEKVENT`, `HOGZON_AVVAKTA`; historiskt `MANUELL`/`MANUELL_SANK`) med
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
och 3 köp, som står bredvid i fältet `bedombar`). Körs per konto, SE och NO
— **och för CaraShell-kampanjerna i OPS-kontona MagiBorsten DK
`915422744950975` och Magiborsten UK `1107817401910319`** (CS-KLART punkt
26, mätt 2026-09-21: 44 % av Taköverdragets spend ligger där). Bara
kampanjer vars namn matchar `CARASHELL` — aldrig OPS-butikernas övriga
kampanjer, och budgetronden rör ALDRIG de kontona
(`node agent/etikett-backfill.mjs --konto spegel` gör exakt det, dagligen
utan `--torr`, med `--cache` så torrt och skarpt inte hämtar två gånger).
Fälten `inline_link_clicks` och `landing_page_view` (i `actions`) hämtas
sedan 2026-09-21 för konverteringsgraden i lärdomen.

1. Per ACTIVE kampanj: hämta annonslistan (`level: "ad"`, fälten `id`,
   `name`, `created_time`, `effective_status`). Kandidater = annonser med
   `created_time` ≤ IDAG − 7 dygn som saknar `ETIKETT`-rad i
   `agent/budgetlogg.jsonl` (`annons_id`). Inga kandidater ⇒ hoppa kampanjen.
2. För varje D0 (skapelsedatum, svensk tid) i kampanjen: hämta insights på
   `level: "ad"` med `time_range: {"since": D0, "until": D0+6}`, fälten
   `amount_spent`, `omni_purchase`, `purchase_roas`, `impressions`,
   `video_view` (3 s — **ta `value`, inte `7d_click`-nyckeln**: under
   attributionsfönstret bär `video_view` bara de attribuerade spelningarna,
   mätt 2026-09-21 på IBC_PD_1_H1: 226 mot 23 298, hook rate 0,4 % i
   stället för 37 %; samma för `landing_page_view`),
   `video_thruplay_watched_actions`, `inline_link_clicks`, med
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
   **`utford_som_briefad`** (2.12, Axels beslut 2026-09-21): för varje
   BEDÖMBAR kandidat med brief i repot, läs den LIVE creativen (primärtext,
   rubrik, första frame via `tools/qa-frames.py`) mot briefens COPY CARD och
   hookrad och skriv `"utford_som_briefad": "ja"|"nej"` i jobbfilen; `nej` ⇒
   utfallet räknas inte in i variabeltabellen (motorhöljets copy-lärdomar i
   augusti byggde på text som aldrig kört). Ingen läsning ⇒ utelämna fältet,
   skriptet skriver `okänd`. Aldrig gissat.
   **Bakkatalogen är redan etiketterad** (`agent/etikett-backfill.mjs`,
   2026-09-21: 1 682 SE + 664 NO annonser, `backfill: true`) — kandidater är
   bara annonser utan ETIKETT-rad. Kör backfillen igen bara om loggen
   förlorat rader (`--torr` först).
4. Klistra in tabellen skriptet skriver under en rubrik
   `## Etiketter dag 7 (<IDAG>)` i `products/<id>/batch-log.md` (finns
   mappen), och skriv frekvensraden överst i filen:
   `Breakthrough-frekvens: 3/21 (14 %)` — alltid brutet tal, aldrig procent
   ensam, ingen procent alls under tio annonser. Rör inte dna.md.
4b. **Lärdomen — ingen annons är klar förrän den är skriven** (Axels
   definition av klart, `docs/os/CS-KLART.md` punkt 1–5, 2026-09-21).
   Varje etiketterad annons får en lärdom SAMMA morgon:
   ```bash
   node agent/lardom.mjs --skelett --konto SE --kampanj <id>     # skelett med datan ifylld → agent/utdata/lardom-skelett-<IDAG>-se.md
   # fyll varje [FYLL I] i filen: Utfört per komponent (läs den LIVE annonsen), hypotesen märkt gissning, Nästa annonser
   node agent/lardom.mjs --skriv agent/utdata/lardom-skelett-<IDAG>-se.md --torr   # spärren: alla fält, gissning, nästa annonser
   node agent/lardom.mjs --skriv agent/utdata/lardom-skelett-<IDAG>-se.md          # → products/<id>/lardomar.md + LARDOM-rad
   ```
   Skelettet bär batchnummer, utfall, annonsens och kampanjens spend i samma
   fönster, hookarna ordagrant med hook rate och hold rate, ROAS/CPA och
   konverteringsgraden (köp per landningssidevisning — därför hämtar
   etikettjobbet `inline_link_clicks` och `landing_page_view` sedan
   2026-09-21; backfillade rader saknar dem och skriver "okänd", aldrig 0).
   **Planerat mot utfört:** briefens taggar (avatar, vinkel, medvetandenivå,
   mekanism, tro, positionering, brådska) mot den live annonsen — stämde inte
   utförandet är det utförandet som föll, inte idén. **Hypotesen är alltid
   märkt gissning.** **Nästa annonser** är konkreta namn (typ, parent, vad
   som ändras) eller `SLÄPP` med skäl — en lärdom som inte slutar där är en
   dagbok. Diagnosordningen per utfall står i skelettet (breakthrough → tre
   iterationer i manuslistan; spend winner → kommentarerna först, sedan
   konverteringsgraden, sedan manuset, lägg bara till det som saknas; KPI
   winner → hook rate → hold rate → förbi hooken; loser → en lärdom, släpp,
   iterera bara ur research). Spärren vägrar tomma fält och hypoteser
   skrivna som fakta. Bedömbara annonser (≥ 300 kr, ≥ 3 köp) och varje
   BREAKTHROUGH skrivs alltid samma morgon; övriga (LOSER/INGEN_LEVERANS
   under 300 kr) får en kort lärdom i samma fil — observation, ingen dom.
   Ingen brief-runda får fler briefer än lärdomar skrivna sedan förra batchen
   (`brieftak` i `agent/lardom.mjs`, punkt 8) — skriv lärdomarna FÖRE
   briefsteget 4b, annars är rundan 0.
   **Undantag: annonser som en lärdom uttryckligen namngett under "Nästa
   annonser" är GRATIS mot taket** (Axels beslut 2026-09-21). `brieftak`
   returnerar `namngivna` och `tak_totalt`, och rundan mäts mot `tak_totalt`.
   Skälet: varje lärdom måste redan sluta med namngivna nästa annonser, så
   namnet bär redan tanken. Taket finns för att stoppa produktion UTAN tanke
   bakom — en hook-swap eller en 20 %-uppsnabbning som lärdomen föreskrivit
   ska inte konkurrera om kvoten med ett helt nytt koncept. En `SLÄPP`-rad ger
   aldrig en fri plats, även när den namnger annonsen den släpper.
   **Två regler till (Axels tillägg 2026-09-22, efter att rondens egen körning
   samma morgon visade hålet):**
   (a) **En brief som tar en namngiven plats måste HETA det namnet.** Mätt:
   Taköverdragets lärdom namngav tre annonser, taket vidgades 1 → 4, och fyra
   HELT ANDRA briefer skrevs i platserna. Undantaget blev en större kvot i
   stället för en riktad.
   (b) **Finns den namngivna annonsen redan — som BRIEF-rad, som Notion-rad
   eller som annons i kontot — stryks platsen.** Lärdomen är då utförd, och en
   plats till bygger en dubblett.
   Båda prövas av `provaBriefkvot()` i `agent/lardom.mjs`, som körs FÖRE första
   BRIEF-raden skrivs och avbryter med exit 1. Skicka kontots och hubbens
   befintliga annonsnamn med `--befintliga <namn,namn>` eller
   `--befintliga <fil.json>`. **Namnger lärdomarna platser och `--befintliga`
   saknas vägrar `--brief` att skriva** (sedan 2026-09-22 em) — regel (b) går
   inte att pröva utan namnen, och det var exakt så OB_2_H1 fick ett andra
   koncept. Kontots namn känner loggen själv (varje rad med `annons_namn`);
   Notion-hubbens måste läsas.
   **Taket är per batch, inte per anrop:** fria briefer som redan loggats sedan
   förra `*_KLAR`-raden räknas bort (`tak_kvar`). Två anrop med en fri var
   ger inte två.
   **Är det namngivna namnet upptaget** (Notion bär det med ett annat koncept)
   får briefen ett ledigt namn och `"plats": "<det namngivna>"` i manifestet —
   BRIEF-raden bär `plats`, och platsen räknas utförd utan att loggen skrivs
   om. Mätt 2026-09-22: `Takoverdrag_OB_4_H1` utför platsen `OB_2_H1`.
   `--brief` hoppar dessutom poster som redan har en BRIEF-rad, så manifestet
   kan köras om när en rad lagts till.
   ⚠️ **Lediga AD-ID:n läses ur kontot, Notion-hubben OCH produktens
   `batch-log.md`.** Mätt samma dag: `Takoverdrag_OB_2_H1` fanns bara i Notion,
   inte i kontot — och stod redan i batch-log.md (batch #3, förvaringspåsen) —
   och en brief fick därför ett namn som redan bar ett annat koncept.

   **Turordningen (Axels beslut 2026-09-21, i stället för ett briefgolv):**
   `--skelett` sorterar sedan dess kön själv — **kampanjer med en levande
   breakthrough först, i fallande ordning på oskriven spend**, och inom en
   kampanj breakthrough → bedömbar → resten. Arbeta uppifrån och ned och
   sluta när morgonen är slut; det som inte hanns med ligger kvar i kön i
   morgon. `--utan-turordning` ger den gamla rena spend-ordningen.
   Skälet: varje breakthrough utan lärdom blockerar upp till tre vidarebyggen
   på en annons som redan bevisat sig — den dyraste blockeringen i kön.
   Ett golv avvisades av Axel: "ett golv skulle ge briefer som inte pekar på
   någonting, och det är precis vad regeln finns för att stoppa."
   **Rapportera det FAKTISKA antalet skrivna lärdomar i leveransen**, aldrig
   en uppskattning — siffran är hela grunden för brieftaket nästa morgon.
   *(Utgångsläget 2026-09-21: 2 378 etiketterade annonser utan lärdom, varav
   bara 184 bedömbara; 41 av de 83 svenska kampanjerna hade inte EN enda
   bedömbar annons och kan alltså inte producera en lärdom alls.)*
5. Dag 14 och dag 28 efter etiketten: kör samma steg med `--uppgradering`
   för annonser som fick SPEND_WINNER eller KPI_WINNER — blir de
   BREAKTHROUGH nu skrivs `ETIKETT_UPPGRADERAD`. Ingen etikett ändras annars.
6. Leveransen får sektionen **"Labels today"** (annons, etikett, andel,
   bedömbar, playbook-läsning) och frekvensen per produkt och batch. Sätts en
   BREAKTHROUGH: posta i `--kanal larm` (engelska) `"Breakthrough: <namn> —
   <andel> % of campaign spend, budget <d0> → <d7> kr"` **och skriv blocket
   `## Komponentkarta <namn>` i produktens `dna.md`** (ANALYSMETOD 6b): HOOK /
   BRIDGE / HOLD / CTA med exakt rad ur briefen, valens, awareness, avatar,
   och **bärande komponent = hypotes** — det är den 2.5-iterationerna byggs
   på när den rundan finns. Saknar produkten brief i repot: skriv kartan ur
   den live creativen och märk raderna "läst ur annonsen, inte ur brief".

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

**Fatigue eller mättnad — testet som styr allt ovanför (Axels beslut
2026-09-22, ur kursen).** När CPA stiger är fixet nya creatives, inte budget.
Testet som skiljer creative fatigue från marknadsmättnad är att lansera en
färsk batch i samma marknad: funkar den var det fatigue; floppar allt trots
kvalitet är marknaden mätt, och nästa steg är ny produkt eller nytt land —
inte fler annonser. Ett pågående test står som en `FATIGUE_TEST`-rad i
budgetloggen (kampanj, de färska annonserna, kampanjens CPA/ROAS vid
start, kriteriet). **Så fort alla annonserna i raden har sina
`ETIKETT`-rader (dag 7):** jämför varje annons CPA mot kampanjens CPA vid
testets start. Minst en färsk annons under kampanjens start-CPA ⇒ svaret är
**fatigue** (fortsätt brieffa mot lärdomen). Alla över, trots att briefarna
klarade spärren ⇒ **mättnad**: skriv det som svar, brieffa inte fler annonser
på produkten, och lyft "ny produkt eller nytt land" till Axel. Svaret skrivs
som en `FATIGUE_TEST_SVAR`-rad + i produktens `batch-log.md` och `dna.md`.
Första testet: Taköverdraget, de fem briefarna från 2026-09-22 (OB_3_H1,
OB_4_H1, GT_11_H1, CS_2_H2, CS_2_H3) mot start-CPA 466 kr (21/9); 7-dygns
CPA 15–21/9 var 375 kr (79 524 kr / 212 köp). **Senaste `FATIGUE_TEST`-raden
per kampanj gäller; en rad med `rattar_foregaende: true` ersätter raden
före.** Tröskeln (466 = sämsta dygnet, 375 = 7-dygns, ~750 = break-even-CPA)
är en fråga till Axel — tills han svarat gäller 466 som raden säger.

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
- **Regi rad för rad i varje videobrief + komponenttaggar i varje brief
  (Axels beslut 2026-09-21, förslagets 2.9 och 2.12).** Videobriefen har
  regitabellen ur `docs/os/BRIEF-REGI.md` — en rad per manusrad: Time |
  Script line | Audio | On-screen text | Picture | Effect + length | Source |
  Reference | Latitude, plus raderna Assets / Reference ads / Editor latitude
  (MAY / MUST NOT). Källan är alltid ett av fem format; `OUR AD <namn>` kräver
  mm:ss — hämta videon ur Meta, kör `tools/qa-frames.py` 1 frame/s och läs av;
  går klippet inte att läsa skriv `DRIVE <id> [EDITOR PICKS: …]`, aldrig en
  påhittad sekund. Regin skriver DU (regel 6 gäller texten). Taggraden får
  `typ=N|M|I|S · koncept · parent · iteration · kalla · avatar · awareness ·
  begar · mekanism · urgency · hook-mekanik · confidence` (fasta listor,
  ANALYSMETOD 6b) och raden `Memo:`; avatarerna ur `dna.md` → `## Avatarer`
  (max 4, med källa — saknas listan skriver du den först); minst 1 av 5 nya
  koncept har `kalla=voc` (kommentarerna: `node tools/annonskommentarer.mjs
  --konto SE --kampanj <id> --ut products/<id>/kommentarer.md`, kluster ≥ 3
  ⇒ INVAND-variant, namngiven med vinkelkoden `OB` — aldrig `BOF`, som är
  funnelposition och inte går att skära ut ur datan, `docs/naming-convention.md`).
  **Spärren körs INNAN en enda Notion-rad skapas:**
  ```bash
  node tools/briefgranskning.mjs --manifest products/<id>/batch-NN/manifest.json --prefix <Prefix> --pris <pris> --jamforpris <jämförpris>
  ```
  Exit 1 ⇒ rätta och kör om; en stoppad brief går aldrig upp. Visa
  utskriften (regi x/y per video) i leveransen. Verktyget och dess importer
  ligger på `main` — kör det ur en färsk `main`-worktree, inte ur
  agent-grenens kopia: `git fetch origin main && git worktree add -f
  /tmp/main-sparr origin/main && node /tmp/main-sparr/tools/briefgranskning.mjs
  --manifest …` (inget nät, ingen NOTION_TOKEN behövs i det läget).
  **Mät från dag 1** (BRIEF-REGI.md → "Mät från dag 1"): i batch-log-tabellen
  per annons kolumnerna `rev` (antal läsningar i `In progress 2`, `okänd`
  tills raden lästs — Notion har ingen statushistorik) och `brief → live`
  (Notion `Skapad` → Metas `created_time`), så regitabellens effekt går att
  jämföra före/efter över ≥ 2 batcher.

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
- **Rundans storlek = `rundaAntal`** i behovsraden — budgeten ger golvet
  (dubbla veckokvoten, aldrig under fyra, `rundkvot` i `agent/rond.mjs`;
  Axel 2026-09-02: "jag tar hellre några briefs för mycket"), **men taket är
  antalet lärdomar skrivna sedan förra batchen** (`brieftak`, CS-KLART punkt
  8, Axels beslut 2026-09-21: "budgeten styr inte antalet"). `budgetAntal`
  och `brieftak` står bredvid i behovsraden; är `rundaAntal` 0 säger orsaken
  hur många etiketterade annonser som väntar på lärdom — skriv dem (3c 4b),
  kör `node agent/rond.mjs` om, och bygg sedan. För `forsta_batch` gäller
  hela veckokvoten (`veckokvot` i utfallet) — där finns ännu inga egna
  lärdomar, men de backfillade etiketterna ur produkttestet ska ha sina
  (`--skelett --kampanj <id>` först). Kvoten planar ut vid 3 000 kr/dag (4
  annonser i veckan, 8 per runda) — en budget på 16 000 kr ger inte fler
  briefer än en på 4 000. Det är med flit.
- **Mixen kommer ur etiketterna, inte ur en tabell** (`mix` i behovsraden,
  CS-KLART punkt 7): finns en levande breakthrough (etikett inom 28 dagar,
  inte tjuvpausad) är rundan 80 % vidarebyggen på den och 20 % nya vinklar;
  finns ingen är den 80 % nya vinklar. `annonskvot.nyaKoncept` gäller inte
  längre. En ny vinkel är en annan avatar, ett annat begär eller en annan
  känslomässig ingång — samma löfte med nya ord är en iteration (punkt 19;
  `lardom.mjs --brief` varnar när typ=N bär samma avatar, begär och
  mekanism som en tidigare brief).
- **Behov `vidarebygg`** (rang 0, samma morgon, CS-KLART punkt 9): en levande
  BREAKTHROUGH som inte fått tre iterationer inom 14 dagar från etiketten.
  Rundan ERSÄTTER dagens `brief_runda` för produkten: iterationerna i
  manuslistan — nya hookar (I1), längre problemdel (I2), in media res (I3),
  varje med `parent=<annonsen>` och `lardom=L-<annons_id>`; aldrig en ren
  kopia av top spendern. Logga `VIDAREBYGG_KLAR` (aldrig `ny_budget`) när
  raderna finns i Notion. Iterationerna räknas ur BRIEF-raderna, så
  `orsak` säger "1 av 3, deadline …" — inte ur minnet.
- **Varje brief pekar på sin lärdom och loggas** (punkt 6, 13, 14, 16):
  taggraden bär `lardom=L-<annons_id>` (id ur `products/<id>/lardomar.md`),
  `typ=N|IM|I` (ny / imiterad / iteration), `parent`, `koncept`, `avatar`,
  `awareness`, `begar`, `mekanism`, `tro`, `urgency`, `hook-mekanik`. INNAN
  Notion-raderna skapas:
  ```bash
  node agent/lardom.mjs --brief products/<id>/batch-NN/manifest.json --kampanj <id> --batch NN --torr   # stoppar brief utan lärdom, räknar iterationsnumret per koncept ur loggen
  node agent/lardom.mjs --brief products/<id>/batch-NN/manifest.json --kampanj <id> --batch NN          # BRIEF-rader
  ```
  En brief som inte kan peka på en lärdom skrivs inte. Iterationsnumret i
  raden är loggens (1 + tidigare briefer på konceptet) — säger briefen något
  annat vinner loggen, så "två eller trettio försök" alltid går att läsa.
  **Taket (punkt 18):** `node agent/lardom.mjs --status` listar koncept med
  ≥ 3 iterationer: alla med lärdom och ingen slår originalet ⇒ SLÄPP om
  forskningen bakom är svag (kalla utanför voc/swipe/egen-data/playbook/
  winning-line/feedback), fler försök om den är stark — men numret räknas.
- **Listicle-kampanjerna är ÄGARENS (Axels order 2026-09-22).** En kampanj
  vars namn matchar `listicle` / `lagerrensning` / `vi-testade` /
  `anledningar` (`agent/kampanjval.mjs`, samma mönster som leveransrundans
  spärr i `tools/lib/kampanjval.mjs`) får domen **`AGARENS`**: ingen
  höjning, ingen sänkning, ingen paus, inga briefer, ingen spendtjuv — och
  den står under `## 🛑 Ägarens kampanjer` i rapporten så det syns. Bakgrund:
  torrkörningen 2026-09-22 gav `Taköverdraget LISTICLE LAGERRENSNING` domen
  SKALA så fort break-even kom ur prissheetet (förut räddades den av att
  namnet saknade talet). Axel styr dem för hand.
- **Funnelläge över 10 000 kr/dag (Axels beslut 2026-09-22).** När en
  produkts dagsbudget passerar `FUNNEL_BUDGET_SEK` (`agent/invandningar.mjs`)
  slås fyra saker på för just den produkten:
  1. **Invändningsmatrisen** `products/<id>/invandningar.md` byggs och
     uppdateras av `node tools/invandningsmatris.mjs --produkt <id> --konto SE
     --kampanj <id> --ord "<produktord>"` (på `main`, ur samma
     main-worktree som briefgranskningen): kommentarerna på kampanjens
     största annons via `tools/annonskommentarer.mjs`, supportmejlen via
     `kundtjanst/mail.mjs` (kräver `KUNDTJANST_MAIL_PASS_BAVERBUTIKEN`;
     saknas den står det i filen), formaten ur kontots annonsnamn (`_H1`
     video, `_1` statisk; demo/jämförelse ur briefens `ruta=`). Förlagan är
     Taköverdragets. Kör den FÖRE varje brief-runda på en funnelprodukt —
     saknas filen säger behovsraden och rapporten det.
  2. **Tomma rutor före lärdomar i briefsteget.** En obesvarad invändning
     med minst 10 % av kommentarerna tar en briefplats FÖRE nästa iteration
     på en vinnare: `lardom.mjs --brief` stoppar ett manifest med iterationer
     eller nya koncept men utan en enda brief på en tom ruta (under 10 000 kr
     är det en varning, prioritetsordningen). Briefen taggas
     `invandning=<radens namn>` (+ `ruta=demo|jamforelse` när formatet inte
     står i namnet), vinkelkod `OB`, `kalla=voc` — den behöver ingen
     `lardom=` och är FRI mot brieftaket, som en namngiven plats. **En fylld
     ruta fylls aldrig igen** (briefad räknas som fylld). `--budget <kr>`
     ger dagsbudgeten; annars läses den ur morgonens `kontodata*.json`.
     Det är hela poängen: annars optimerar rutinen det som fungerar mot en
     publik som tar slut.
  3. **Täckningen i morgonrapporten** per funnelprodukt (`## 🧱
     Invändningstäckning`): "fukt 0 av 4 format (38 %)". Live räknas som
     svar; "+1 briefad" står bredvid.
  4. **Varning i höjningsdomen, aldrig spärr:** saknar en invändning över
     25 % varje svar skrivs det ut i `SKALA`-domen — höj ändå.
  **Kopplingen till CPA-regeln:** stigande CPA + tomma rutor ⇒ bygg rutorna
  (står i rapporten och behovsraden); stigande CPA + full matris ⇒ marknaden
  är mätt — nytt land eller ny produkt, inte fler annonser. Mätt 2026-09-22
  på Taköverdraget (16 000 kr/dag): 11 av 29 kommentarer (38 %) om fukt och
  mögel, noll av 34 annonser svarade, CPA 147 → 466 kr.
- **Motorn har INGET tak (Axels beslut 2026-09-22, ur Evolve).** Både
  `TAK_SEK` 10 000 (2026-09-21) och idén om "10 % över 15 000" är kastade:
  spendnivå, frekvens och marknadsstorlek är alla förkastade som tak ("Never
  by spend", "Frequency doesn't determine", ett svenskt varumärke som gör
  100k-dagar). Den manuella zonen (2026-09-19–22, `MANUELL`/`MANUELL_SANK`)
  finns inte längre — 16 000 kr/dag döms som vilken budget som helst.
  **Högzonens tre spärrar gäller hela vägen upp, utan slut** (över 4 000 kr,
  `TAK_UTAN_VINNARE`, alla tre Axels formulering 2026-09-21):
  1. **Vinnarspärren.** Kampanjen måste bära en etiketterad `BREAKTHROUGH`
     eller `SPEND_WINNER` inom 28 dygn (`harLevandeVinnare` i
     `agent/lardom.mjs`, räknad ur budgetloggen och skickad in som
     `rad.harVinnare`). Saknas den är taket 4 000 och domen blir `LAT_VARA`
     med skälet utskrivet. Fältet måste vara **exakt `true`** — ett
     `undefined` öppnar aldrig taket. ⚠️ Mätt i torrkörningen 2026-09-22:
     Taköverdraget (16 000 kr/dag) bär BARA `KPI_WINNER`/`LOSER`-etiketter —
     ingen levande vinnare — så spärren håller den still åt båda håll tills
     en annons etiketteras `BREAKTHROUGH` eller `SPEND_WINNER`.
  2. **20 % per rond.** Trappans ×1,5 och ×2 gäller bara upp till 4 000 kr
     (`HOGZON_MAX_FAKTOR`). Att dubbla en budget som redan ligger på 4 000 är
     ett hopp på 4 000 kr per dygn.
  3. **Ingen kapning.** Förlust i högzonen halverar aldrig och stänger aldrig
     av. En ensam förlustmorgon ger domen `HOGZON_AVVAKTA` och ingen ändring;
     **två förlustmorgnar i rad** ger `SANK` −20 %, aldrig under 4 000 i ett
     steg. Spärren gäller före test/drift-uppdelningen, så åtgärdstrappan kan
     inte stänga av en högzonskampanj för att produktkartan saknar raden.
  Rimlighetstaket för felparsning är 50 000 kr; över det är det fortfarande
  `ORIMLIG_DATA`.
- **CPA-trenden är motorns hälsomått (Axels beslut 2026-09-22).** Den enda
  signal kursen behåller, och den är marknadsoberoende. Läses ur dygnsserien
  (`cost_per_action_type → omni_purchase`, fönstret `7d_click`, per dygn, alltid
  **t.o.m. gårdagen** — dagens dygn är ofullständigt). **Stigande CPA tre
  dygn i rad ⇒ ingen höjning, oavsett ROAS** (`CPA_STIGER`). Sänks inte — den
  går fortfarande plus. Rapporteras ÖVERST i morgonrapporten (`## 🩺
  CPA-trend`): ⛔ = tre stigningar, höjning stoppad; 👀 = två, ett dygn till.
  Mätt i kontot 2026-09-22, Taköverdraget SE: CPA 150 → 171 → 147 → 323 →
  235 → 325 → 269 → 371 → 333 → 410 → 421 → 466 kr 10–21 september medan
  dagsspenden gick 1 352 → 15 990 kr; break-even-CPA ~750, marginalen 80 % →
  38 %. **När CPA stiger är fixet nya creatives, inte budget** — se
  fatigue-testet under 4b.
- **Skalning mäts mot TARGET, kill mot BREAK-EVEN (Axels beslut 2026-09-22).**
  **Target är alltid 25 % vinst av omsättningen** (Axels beslut 2026-09-22):
  `target_roas` i `agent/produktkarta.json` och `products/products.json`
  lämnas `null`, och motorn härleder target ur break-even
  (`targetRoas()` i `agent/besked.mjs`, t.ex. BE 1,52 ⇒ 2,46). Ett eget tal
  sätts bara om Axel säger ett. **Break-even kommer ur Axels prissheet**
  (länken står i produktkartans `kommentar`): produktkostnad + frakt i USD
  för 1 st till Sverige plus 2,9 EUR EU-avgift per order, som `kostnad`-block
  på kampanjens post — det blocket vinner över talet i kampanjnamnet. Ny
  aktiv kampanj: slå upp produkten i sheetet och skriv blocket (priset ur
  butiken samma dag); saknas produkten i sheetet gäller kampanjnamnet, och
  det står i `break_even_kalla`. Mätt 2026-09-22 på tolv aktiva SE-kampanjer:
  sheetet ger 1,51–1,55 där namnen sa 1,61–1,67. En break-even som sjunker
  kan aldrig ensam utlösa en sänkning (produktkartans
  `regel_andrad_break_even`). **Stegtrappan går på avståndet till target:**
  ROAS ≥ 200 % av target ⇒ dubbla · ≥ 150 % ⇒ ×1,5 · annars 20 % — och
  **alltid efter 48–72 timmar konsekvent**: dags-ROAS ska ha legat på eller
  över target minst två hela dygn i rad (`dagarOverTarget`, annars
  `VANTA_KONSEKVENT`). Snabbspåret (ROAS ≥ 3 ⇒ höjning igen redan nästa
  dag) är kvar på 24 timmar (Axel 2026-09-22: "24") — det är konsekvent-
  spärren, inte kadensen, som hindrar 1 000 → 2 000 → 4 000 på ett dygn
  mellan stegen. Raketspåret (ROAS ≥ 5 ⇒ ×1,8) är ersatt av trappan.
  Under target men över break-even: `LAT_VARA` — går plus, skalas inte.
  CLAUDE.md regel 4 är orörd: förlust, halvering, åtgärdstrappan och
  avstängning mäts fortfarande mot break-even, aldrig mot target.
- **Klickandelen (Axels beslut 2026-09-22, "Compare Attribution Settings"):**
  minst 60 % av köpen de senaste tre dygnen ska vara klickbaserade
  (`7d_click` mot `1d_view` i dygnsserien) innan en höjning. Är merparten
  visningsköp: `VISNING_AVVAKTA`, vänta ett dygn. Saknas visningstalet:
  ingen spärr, aldrig en gissning.
- **Surf-läget (Axels beslut 2026-09-22, peak/Black Friday) — ALDRIG
  automatiskt.** Axel slår på det: `agent/surf.json` `aktiv: true` +
  kampanj-id:n, och rutinen körs med `node agent/rond.mjs --surf` var sjätte
  timme (egen rutin via `/rutin`). Kontodatan bär då dessutom `spend_idag`,
  `roas_idag`, `kop_idag`, `spend_igar` per kampanj och `timme` (annonskontots
  lokala timme) överst. Domarna: `SURF_RESET` (första körningen efter
  annonskontots midnatt: budget = halva gårdagens faktiska spend),
  `SURF_DUBBLA` (fönstret över target ⇒ ×2), `SURF_SANK` (under break-even ⇒
  −20 %), `SURF_HALL`. CPA-spärren gäller där också. Utan `--surf` eller med
  `aktiv: false` döms allt som vanligt.
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

## 4e. UGC-förslaget (Axels beslut 2026-09-21 — CS-KLART punkt 20–22)

Varje morgon, efter lärdomarna (3c 4b) och före leveransen:

```bash
node agent/ugc.mjs --deadlines                 # säsongstopparna: sista beställningsdag, "för sent"-dag, larm
node agent/ugc.mjs --kandidater --utfall agent/utdata/rond-se-<IDAG>.json
```

**Deadlines (punkt 22):** ledtiden räknas baklänges från säsong — tre
veckors ledtid + två veckors test. Black Friday 2026-11-27 ⇒ sista
beställningsdag 2026-10-23, efter 2026-11-06 hinner videon inte bli live.
Tabellen `SASONGER` i `agent/ugc.mjs` (Jul 2026 står som antagande —
Axel bekräftar datumet). Står en topp på 🔴 LARM (≤ 14 dagar kvar, inget
`UGC_BESTALLD` loggat): posta larmet i `--kanal larm` med ping till Axel,
varje dag tills något är beställt eller det är för sent.

**Kandidater (punkt 20):** rutinen föreslår UGC BARA när alla tre villkor är
sanna, och skriptet visar dem ett i taget: (1) en bevisad vinnare —
BREAKTHROUGH eller SPEND_WINNER, bedömbar, etikett inom 42 dagar; (2)
produkten skalas sannolikt fortfarande om fyra veckor — skriptets bedömning
ur loggen (inte avstängd, inte sänkt på 14 dagar, skalad eller lönsam ≥ 20 %
med budget ≥ 1 000 kr, ingen säsong som tar slut inom sex veckor) — läs
skälen och döm själv, det är en sannolikhet, ingen garanti; (3) det som
saknas är tro, auktoritet eller tillit — läst ur vinnarens lärdom
(komponentavvikelse `tro`, eller hypotesen/nästa annonser nämner
tro/auktoritet/tillit). Utan lärdom är villkor 3 okänt ⇒ inget förslag.
Går bristen att lösa med befintligt material (ny hook, längre problemdel,
proof ur recensioner) ska det lösas så — då är svaret nej på villkor 3
även om ordet "tro" står i lärdomen. Kostnaden (~3 000 kr) är sällan
hindret; tiden (tre veckor) är det.

**Beställningen (punkt 21):** för varje ✅ FÖRESLÅ skriver du en JSON
(fälten i `BESTALLNING_FALT`: produkt, kampanj_id, vinnare {namn, etikett,
spend, roas, hook}, komponenter {avatar, vinkel, mekanism, tro, urgency},
manus [{sv, en}] ur vinnarens brief, pa_kameran [], deadline = i dag + 21
dagar eller säsongens sista dag om den är tidigare, antal, och vid antal > 1
`iteration_andring` och `viral_referens`) och kör
```bash
node agent/ugc.mjs --bestallning agent/utdata/ugc-<produkt>-<IDAG>.json
```
Meddelandet är på engelska och går som egen post i `--kanal uppgifter`
adresserat till Lovely (hon sköter hela produktionen: kreatör, frakt av
produkten, inspelning, revision). Flera videor ⇒ Evolve-receptet i
meddelandet: en ordagrann kopia av vinnaren, en iteration, en imitation av
en viral annons. Logga sedan `node agent/ugc.mjs --forslag --kampanj <id>
--annons <vinnaren>` så förslaget inte upprepas varje morgon. **När Axel
eller VA:n bekräftat att beställningen gått** loggas
`node agent/ugc.mjs --bestalld --kampanj <id> --antal N --deadline
YYYY-MM-DD [--sasong "Black Friday 2026"]` — det är den raden som tystar
larmet. Rutinen beställer aldrig själv; den skriver beställningen.

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

## 4d. Startskottet — ⛔ AVSTÄNGT sedan 2026-09-24

**Axels beslut 2026-09-24:** *"Jag ska sluta bygga OPS-butiker hela tiden nu,
pga att det är mycket mer stressmoment. Inga mer OPS förutom vid extrema
undantag."* Ronden postar därför **inga startskott** och skriver inga
`OPS_STARTSKOTT`-rader. `startskottsbehov` i `agent/startskott.mjs` returnerar
tomt (`STARTSKOTT_AV`), och CLI:t vägrar posta utan `--undantag`. Ett extremt
undantag är Axels ord i chatten, aldrig rondens dom — då kör en människa
`node agent/startskott.mjs --jobb <fil.json> --undantag` för hand. Steg 4d
hoppas över i varje körning, utan rad i leveransen. Briefhalvan (4b–4c) är
oförändrad: produkter som klarar testet får sin förstabatch på Bäverbutiken
som vanligt. Sista startskottet som gick ut var ATV-Kapellet 2026-09-24 —
Axels svar på det var det här beslutet.

Texten nedan beskriver hur startskottet fungerade och gäller bara vid ett
uttryckligt undantag.

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

Nya koder sedan 2026-09-20: `MANUELL_SANK` (budgetändring, bär `ny_budget`;
fälls inte längre sedan 2026-09-22 — historisk), `TJUV_PAUSAD` och
`VANTA_BREAKTHROUGH` (annonsnivå, steg 3b), `ETIKETT` och
`ETIKETT_UPPGRADERAD` (steg 3c, skrivs av `agent/etikett.mjs`). De fyra sista
får **aldrig** bära `ny_budget` — `skrivRad` vägrar, för kadensspärren skulle
annars frysa kampanjen i tre dygn. Sedan 2026-09-22: `CPA_STIGER`,
`VISNING_AVVAKTA`, `VANTA_KONSEKVENT` (håll-domar, ingen loggrad med
`ny_budget`), `SURF_RESET`/`SURF_DUBBLA`/`SURF_SANK` (budgetändringar i
surf-läget, bär `ny_budget`), `FATIGUE_TEST` och `FATIGUE_TEST_SVAR` (4b).

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
till imorgon. Startskott finns inte längre (4d avstängt 2026-09-24) — skriv
ingenting om dem. Inga bibelsvar.

**Creative strategy-raderna är obligatoriska i varje rond** (CS-KLART punkt
15–16) — klistra in utskriften av:
```bash
node agent/lardom.mjs --status
```
Den ger breakthrough-frekvensen per produkt som bråk OCH procent ("3/21
(14 %)", aldrig procent ensam), hur många lärdomar som skrevs i dag, hur
många etiketterade annonser som saknar lärdom, hur många briefer som
skrevs och hur många av dem som pekar på en lärdom, vidarebyggen med
deadline, och koncept vid taket. Samma rader på engelska i Discord.

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
  misslyckad verifiering efter en Meta-skrivning, varje `SANK` i högzonen
  (över 4 000 kr) och varje `CPA_STIGER` på en kampanj över 4 000 kr (fixet
  är nya creatives — Axel ska se det), en pausad tjuv med etiketten BREAKTHROUGH
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
- [ ] Dygnsserien bär `kop`, `kop_visning` och `cpa` per dygn; `## 🩺 CPA-trend` läst överst i rapporten och varje ⛔ nämnd i leveransen
- [ ] Varje `SKALA` över 4 000 kr har `harVinnare: true` — annars är det en bugg, inte en dom
- [ ] Ingen `SKALA` på en kampanj med `CPA_STIGER`, klickandel < 60 % eller färre än två dygn över target — spärrarna står i domen, inte i huvudet
- [ ] `--surf` ALDRIG använt om inte `agent/surf.json` säger `aktiv: true` — och då bara på kampanjerna i listan
- [ ] `roas_3d_visning` satt på varje kampanj, och visningsköpsvarningen läst i rapporten
- [ ] Etiketter dag 7 satta för alla annonser ≥ 7 dygn utan etikett (båda kontona), tabellen i batch-log.md, frekvensen i leveransen — eller "utan etikett" listade vid strypning
- [ ] **Lärdom skriven för varje etiketterad annons** (`lardom.mjs --skriv` grön, LARDOM-rader, `products/<id>/lardomar.md` pushad) — eller exakt vilka som saknas och varför
- [ ] Ingen brief-runda större än brieftaket; varje brief med `lardom=` + taggarna, `lardom.mjs --brief` grön INNAN Notion, BRIEF-rader loggade; vidarebyggen körda för varje levande breakthrough (VIDAREBYGG_KLAR)
- [ ] **Funnelläge (> 10 000 kr/dag):** `products/<id>/invandningar.md` byggd/uppdaterad FÖRE rundan (`tools/invandningsmatris.mjs` på main), täckningsraden läst i `## 🧱 Invändningstäckning`, varje obesvarad invändning ≥ 10 % har en brief med `invandning=` i rundan (fri mot taket), ingen fylld ruta briefad igen
- [ ] Ingen listicle-/lagerrensningskampanj rörd: alla med domen `AGARENS` står under `## 🛑 Ägarens kampanjer` och har ingen åtgärd i planen
- [ ] `lardom.mjs --status` i leveransen: frekvens som bråk + procent, lärdomar i dag, briefer på lärdom, koncept vid taket
- [ ] `ugc.mjs --deadlines` körd (larm postat om 🔴), `ugc.mjs --kandidater` körd; varje ✅ FÖRESLÅ har fått ett färdigt beställningsmeddelande till Lovely i `--kanal uppgifter` och en `UGC_FORSLAG`-rad — eller villkoret som föll utskrivet
- [ ] Etiketter + lärdomar även för CaraShell-kampanjerna i DK/UK-kontona (`--konto spegel`), för Taköverdraget och Termoskyddet speglas (CS-KLART punkt 26)
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
- [ ] Inget startskott postat och ingen `OPS_STARTSKOTT`-rad skriven (4d avstängt
      2026-09-24 — bara ett uttryckligt undantag från Axel, med `--undantag`, får köra det)
- [ ] Alla loggrader skrivna och pushade efter varje ändring (= minnet sparat)
- [ ] Ingen artefakt publicerad och `agent/dashboard.mjs` inte körd
- [ ] Kort svar till Axel enligt svarsformatet i CLAUDE.md regel 14
