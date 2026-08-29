# /rond-auto – Ronden som ändrar själv (körs varje dag)

Automatläget av `/rond`. **Axels stående beslut 2026-08-29:** ronden får skala
upp, skala ner och stänga av enligt reglerna, utan att fråga per rad.

Ronden KÖRS varje dag, men varje produkt ÄNDRAS högst var tredje dag —
utom snabbspåret: en produkt i skalningszonen med ROAS ≥ 3 får höjas 20 %
redan dagen efter förra höjningen. Sänkningar och avstängningar väntar alltid
sina tre dagar. Allt det räknar `agent/besked.mjs` ut — inte du.

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
- **SYNKA MINNET — obligatoriskt:** dashboarden bär den färskaste
  budgetloggen inbäddad som JSON, eftersom schemalagda körningar inte kan
  pusha till git. Läs dashboarden med `Artifact` `action: "read"` på
  `https://claude.ai/code/artifact/33962d72-94ff-4657-9c5a-71f584a837a0`
  (svaret sparas som HTML-fil), kör sedan
  `node agent/minne.mjs <sparad-html-fil>` — den synkar både budgetloggen och
  filutkorgen (minnesfiler från tidigare batchkörningar). Misslyckas synken:
  **avbryt** — kör aldrig ronden på repots möjligen gamla logg.
- **Minnesregeln ersätter push-kravet:** efter VARJE genomförd Meta-ändring
  skrivs loggraden lokalt, `node agent/dashboard.mjs` körs om och dashboarden
  **publiceras om på samma URL** (det är så minnet sparas). Misslyckas
  ompubliceringen efter en genomförd ändring: gör inga fler ändringar och
  larma högt. Git-push görs i slutet OM den fungerar (den gör det i
  interaktiva sessioner) — men den är inte längre ett stoppvillkor.
- Finns inte Meta-verktygen (`mcp__ADsmanagaer__*`): **avbryt allt**, säg det
  rakt ut och gör ingenting annat. Ingen rapport på ingenting.

## 1. Hämta läget ur Meta

Tre anrop till `mcp__ADsmanagaer__ads_get_ad_entities`, alla med
`ad_account_id: "1867947880635861"` och filtrering på
`campaign.effective_status IN ["ACTIVE"]`:

1. `date_preset: "last_3d"` — `fields: ["id","name","effective_status","daily_budget","amount_spent","purchase_roas","omni_purchase","created_time"]`
2. `date_preset: "maximum"` — samma fält (ger `spend_total`)
3. `date_preset: "last_14d"` + `time_increment: "1"` — dygnsserien (varje dygn: datum, roas OCH spend ur `amount_spent`)

Fältnamnen är exakta. Använd **aldrig** `omni_purchase_values` (buggig, se
CLAUDE.md). Skriv siffrorna **ordagrant** till `agent/kontodata.json` i samma
format som `/rond` beskriver. Saknas ett värde: `null`, aldrig 0, aldrig gissat.

Aktiv kampanj som saknas i `agent/produktkarta.json`: lägg till den som
`"lage": "test"` med motivering. Gissa aldrig break-even — utan tal i
kampanjnamnet eller kostnadsblock får den domen SAKNAR_BREAK_EVEN, och det är
rätt.

## 2. Räkna

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
   (`genomford: true`), kör `node agent/dashboard.mjs` och publicera om
   dashboarden på samma URL. Misslyckas ompubliceringen: **avbryt resten av
   körningen och larma** — en Meta-ändring utan sparad loggrad gör
   kadensspärren blind och nästa körning ändrar igen.

**`typ: "paus_kampanj"`** — stäng av:
1. `ads_update_entity` med `fields: {"status": "PAUSED"}`.
2. Verifiera: läs tillbaka, `effective_status` ska vara PAUSED.
3. Logga med kod `STANG_AV`, `genomford: true`.

**`typ: "trappa"`** — produkten går back; pausa det minsta trasiga först.
Läs `agent/budgetlogg.jsonl` och avgör steget med `senasteRadMedKod(logg, id,
["TRAPPA_STEG_1","TRAPPA_STEG_2"], { maxAlderDagar: 14, idag })` (finns i
`agent/logg.mjs`) — trapprader äldre än 14 dagar hör till en tidigare cykel
och räknas inte:

- **Inget tidigare steg → STEG 1:** hämta kampanjens annonser (`level: "ad"`,
  `date_preset: "last_3d"`, filtrering `campaign.id`). Finns EN aktiv annons
  med ≥50 % av kampanjens 3-dagarsspend och 0 köp: pausa **bara den annonsen**
  (`entity_type: "ad"`, `fields: {"status":"PAUSED"}`), verifiera, logga
  `TRAPPA_STEG_1`. Finns ingen sådan annons: logga ändå `TRAPPA_STEG_1` med
  motiveringen "ingen dominant annons att pausa" och **stanna där för idag** —
  steg 2 får tas tidigast om 2 dagar. Trappan tar ALDRIG mer än ett steg per dag.
- **STEG 1 taget → STEG 2:** bara om **minst 2 dagar** gått sedan
  `TRAPPA_STEG_1`-raden OCH dygnen EFTER pausdatumet (ur dygnsserien i
  `kontodata.json`) fortfarande ligger under break-even — pausen ska hinna
  synas i siffrorna innan nästa steg tas. Blev det bättre: gör ingenting,
  produkten läker. Annars: hämta annonsgrupperna (`level: "adset"`). Är EN
  grupp under break-even medan minst en annan ligger över: pausa den gruppen
  (`entity_type: "ad_set"`), verifiera, logga `TRAPPA_STEG_2`. Ser alla lika
  dåliga ut: hela produkten går back — pausa kampanjen, logga `TRAPPA_STEG_3`.
- **STEG 2 taget → STEG 3:** samma väntregel (2 dagar + dygnen efter pausen
  under break-even). Står förlusten kvar: pausa kampanjen, logga
  `TRAPPA_STEG_3`.

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
sen rundorna med äldst batch först). Kör **upp till TVÅ poster per morgon**,
uppifrån — resten av listan rapporteras och ligger kvar till imorgon.
(Två per morgon räcker för att hinna alla produkter i en 3-dagarscykel så
länge produkterna är ≤6 — blir de fler: säg till Axel att cykeln inte går ihop.)

- Behov `forsta_batch` → följ `.claude/commands/forsta-batch.md` i sin helhet
  (analys → briefer → Drive → Notion). Strategin görs FÖRST, sedan läggs
  annonserna i produktens Notion-hub — det är där Jasper och redigerarna ser
  dem, via det vanliga veckoflödet. **Rutinen skriver briefer — den gör aldrig
  själva annonserna. Redigerarna gör annonserna.**
- Behov `brief_runda` (och `ersatt`/`mata_vinnare` på en produkt som redan har
  minne i `products/<id>/`) → följ `.claude/commands/cs.md`. Står det ett
  "Fokus:" i orsaken styr det rundans inriktning.
  **Saknar produkten minnesfiler** (ingen `products/<id>/dna.md`, inte heller i
  `git log --all` — händer när batchen är historisk, gjord före systemet) →
  kör `.claude/commands/forsta-batch.md`-flödet i stället, det bygger minnet
  från noll. Logga ändå `CS_BATCH_KLAR` (produkten HAR redan haft en batch).
- **Rundans storlek = `rundaAntal`** i behovsraden (halva veckokvoten,
  avrundad uppåt — två rundor per vecka ≈ veckokvoten). För `forsta_batch`
  gäller i stället hela veckokvoten (`veckokvot` i utfallet).
- **Ny produkt utan Notion-hub:** bygg ALDRIG en hub från grunden och klona
  ALDRIG schemat via create-database — då blir statusarna svenska
  (Inte påbörjad/Pågår/Klar) och hubben hamnar utanför teamspacen. Fel båda
  gångerna det testades 2026-08-29. Gör i stället:
  1. Duplicera den TOMMA mallen med notion-duplicate-page — sök i Notion på
     **"Creative Hub mall TOM"** (Axel skapar den; ligger i
     Bäverbutiken-teamspacen). Dubbletten ärver engelska statusar (Draft,
     In progress, In progress 2, Approved …), alla vyer OCH teamspace-platsen.
  2. Dupliceringen är asynkron — vänta och hämta om tills databasen finns,
     döp sedan om via notion-update-data-source till
     "<Produktnamn på engelska> creative hub".
  3. Skapa items med notion-create-pages (Status "Draft",
     Typ "Video - Pending Approval").
  Finns mallen inte (sökningen ger noll): skapa INGEN hub — lista i svaret
  exakt vilka items som skulle skapats och be Axel skapa mallen (duplicera
  Creative Hub master utan innehåll, döp den "Creative Hub mall TOM").
  **ALLT som skrivs i Notion är på ENGELSKA** — itemnamn, statusar, innehåll,
  kommentarer. Redigerarna läser inte svenska.
  Anteckna hubbens id + Drive-mappens id i `agent/produktkarta.json`.
- När batchen är klar OCH uppladdad till Notion: skriv en loggrad med kod
  `FORSTA_BATCH_KLAR` (respektive `CS_BATCH_KLAR`), `genomford: true` —
  det är den raden som startar om 3-dagarsklockan.
- **Minnesfilerna** (`products/<id>/dna.md`, `batch-log.md`, `backlog.md`):
  skriv dem i arbetskopian som vanligt OCH kopiera dem till `agent/utkorg/`
  (samma relativa sökvägar) innan dashboarden byggs om — utkorgen bäddas in i
  dashboarden och synkas till git av nästa session med push-rättighet.
  En batch vars minnesfiler inte hamnat i utkorgen är INTE klar.
- Hinner en batch inte bli klar (avbrott, fel): logga ingenting med *_KLAR —
  då flaggas behovet igen imorgon och batchen görs om hel.

## 5. Logga

En rad per kampanj i `agent/budgetlogg.jsonl` via `skrivRad` i
`agent/logg.mjs` — även för LAT_VARA och väntande (`genomford: false` där
inget gjordes). Utförda ändringar: `genomford: true`,
`godkand_av: "auto — Axels stående beslut 2026-08-29"`. Fältformatet står i
`/rond` steg 5.

## 6. Dashboard + leverans

```bash
node agent/dashboard.mjs
```

Publicera om dashboarden på **samma URL** (läs först, publicera sen):
`Artifact` `action: "read"` → `action: "publish"` med
`url: "https://claude.ai/code/artifact/33962d72-94ff-4657-9c5a-71f584a837a0"`
och `file_path: agent/dashboard.html`.

Försök committa och pusha `agent/budgetlogg.jsonl` + `agent/produktkarta.json`
(om ändrad) till `claude/daily-agent-discussion-uos5df`. Nekas pushen är det
okej — minnet är redan sparat i dashboarden; nästa session med push-rättighet
synkar ikapp git.

Svara sedan kort på svenska: vad som ändrades (produkt, från → till), vad som
sköts upp och varför, om något larmade — och vilka brief-rundor/batcher som
kördes (produkt + antal briefer + Notion-länk) respektive ligger kvar i kön
till imorgon. Inga bibelsvar.

## DEFINITION OF DONE
- [ ] Färsk `git pull` innan något annat
- [ ] Tre Meta-anrop gjorda mot `1867947880635861`
- [ ] `kontodata.json` skriven ordagrant
- [ ] `node agent/rond.mjs --json` kört; `plan.sparrad` kontrollerad
- [ ] Varje åtgärd utförd med öre-fältet ur planen och verifierad med läsning
- [ ] Uppskjutna loggade som `UPPSKJUTEN_GRANS`
- [ ] Förfallna behov i `annonsbehov` körda (max 2) med *_KLAR-loggrad + minnesfiler i utkorgen — eller exakt redovisat varför inte
- [ ] Alla loggrader skrivna och dashboarden ompublicerad efter varje ändring (= minnet sparat); git-push försökt
- [ ] Dashboarden ombyggd och ompublicerad på samma URL
- [ ] Kort svar till Axel
