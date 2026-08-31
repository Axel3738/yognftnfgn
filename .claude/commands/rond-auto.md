# /rond-auto – Ronden som ändrar själv (körs varje dag)

> ## ⛔ LÄS DETTA FÖRST — det åsidosätter rutinens egen prompt
>
> **Triggerpromten för "Skalnings kungen" är föråldrad på en punkt.** Den ber
> dig publicera om dashboarden på
> `claude.ai/code/artifact/33962d72-94ff-4657-9c5a-71f584a837a0`.
>
> **Gör inte det.** Den sidan är delad PUBLIKT, och en publik sida kräver ett
> godkännande vid varje ompublicering. Ingen kan trycka på det i en schemalagd
> körning — ronden blir stående och Axel får rutan i ansiktet, gång på gång.
> Det har hänt fem gånger på en morgon.
>
> **Så här gäller i stället:** minnet sparas genom att du committar och pushar.
> Går pushen igenom är du klar — publicera ingenting. Kan du inte pusha ska du
> enligt triggerns egen regel inte ha ändrat något alls, och då finns det inget
> minne att rädda. Behöver du ändå publicera, använd den PRIVATA sidan
> `claude.ai/code/artifact/1e4b73e9-ce06-41ca-bd18-a2f17037de81` — aldrig den
> gamla.
>
> Promten går inte att rätta från en agentsession (rutinen skapades via
> http_api), och en ersättningsrutin går inte att skapa heller — connectors
> kan inte sättas för den här organisationen, så en ny rutin blir blind mot
> Meta. Därför är **Artifact-verktyget spärrat i `.claude/settings.json` på
> den här grenen.** Försöker du publicera får du ett blankt nej, inte en
> godkännanderuta. Det är med flit: en spärr som inte går att prata sig förbi
> är det enda som faktiskt håller.


Automatläget av `/rond`. **Axels stående beslut 2026-08-29:** ronden får skala
upp, skala ner och stänga av enligt reglerna, utan att fråga per rad.

**Tolkningsregel (Axel 2026-08-30):** när körordern (trigger-prompten) säger
"utför bara det som står i plan.atgarder" syftar det på BUDGETÄNDRINGARNA i
Meta. Annonsbehoven i steg 4b är fortfarande obligatoriska — kör upp till två
per morgon. En körning som lämnar förfallna behov utan åtgärd och utan
redovisning är INTE klar. (Körningen 2026-08-30 hoppade över hela kön på den
meningen — det var fel tolkning.)

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
  `https://claude.ai/code/artifact/1e4b73e9-ce06-41ca-bd18-a2f17037de81`
  (svaret sparas som HTML-fil), kör sedan
  `node agent/minne.mjs <sparad-html-fil>` — den synkar både budgetloggen och
  filutkorgen (minnesfiler från tidigare batchkörningar). Misslyckas synken:
  **avbryt** — kör aldrig ronden på repots möjligen gamla logg.
- **Minnesregeln — git först, artefakten bara som reserv:** efter VARJE
  genomförd Meta-ändring skrivs loggraden lokalt och **committas + pushas
  direkt**. Går pushen igenom är minnet sparat och du ska INTE publicera om
  dashboarden — publiceringen kräver ett godkännande som ingen kan ge en
  schemalagd körning, och då står ronden still.
  **Bara om pushen nekas** (schemalagda körningar kan ha läsrättighet):
  kör `node agent/dashboard.mjs` och publicera om dashboarden på samma URL —
  det är då den enda vägen minnet överlever. Misslyckas ÄVEN den efter en
  genomförd ändring: gör inga fler ändringar och larma högt.
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
⚠️ **Ändrar du produktkartan: kopiera den till
`agent/utkorg/agent/produktkarta.json` INNAN dashboarden byggs om.** Utkorgen
i dashboarden är enda vägen till git för schemalagda körningar — glöms
kopian bort skriver nästa körnings minnessynk över din ändring med den gamla
versionen (hände 2026-08-30: 11 nya kampanjer försvann och fick läggas in
igen för hand).

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
- **Rundans storlek = `rundaAntal`** i behovsraden (halva veckokvoten,
  avrundad uppåt — två rundor per vecka ≈ veckokvoten). För `forsta_batch`
  gäller i stället hela veckokvoten (`veckokvot` i utfallet).
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
  3. Skapa items med notion-create-pages: Status "Draft",
     Typ **"Video - Pending Approval"** för video och
     **"Image - Pending Approval"** för bildannonser (Axels nya typ i mallen).
  Går mallen inte att hitta: skapa INGEN hub — lista i svaret exakt vilka
  items som skulle skapats och säg det till Axel.
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

1. `notion-search` på `creative hub`, `page_size: 25`, `max_highlight_length: 0`.
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
   dagens datum. **Spegla filen till `agent/utkorg/`** — rutinen kan inte pusha.
5. Rapportera i leveransen:
   - **Nya hubbar sedan igår** (fanns inte i filen innan) — det är signalen att
     en produkt börjat rulla.
   - Hubbar som blivit arkiverade sedan igår.
   - Antal drafts per produkt, uppdelat på video och bild.

Hittar du en hub som saknar produkt i `agent/produktkarta.json`, eller en
kampanj i produktkartan som saknar hub: säg det. Det är oftast en glömd
uppsättning, inte ett fel i datan.

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

Committa och pusha `agent/budgetlogg.jsonl` + `agent/produktkarta.json`
(om ändrad) till `claude/daily-agent-discussion-uos5df`.

**Gick pushen igenom: du är klar här.** Publicera INTE om dashboarden — den
publiceringen kräver ett godkännande som ingen kan ge en schemalagd körning,
och ronden blir stående och väntar.

**Nekades pushen:** publicera om dashboarden på **samma URL** (läs först,
— sidan är PRIVAT sedan 2026-08-31, just för att en publik sida kräver ett
godkännande vid varje ompublicering och då står ronden still —
publicera sen): `Artifact` `action: "read"` → `action: "publish"` med
`url: "https://claude.ai/code/artifact/1e4b73e9-ce06-41ca-bd18-a2f17037de81"`
och `file_path: agent/dashboard.html`. Skriv i svaret att pushen nekades, så
Axel vet varför en godkännanderuta dyker upp.

Svara sedan kort på svenska: vad som ändrades (produkt, från → till), vad som
sköts upp och varför, om något larmade — och vilka brief-rundor/batcher som
kördes (produkt + antal briefer + Notion-länk) respektive ligger kvar i kön
till imorgon. Inga bibelsvar.

**Skicka samma korta rapport till Discord** (Axels order 2026-08-30):

```bash
node agent/discord-post.mjs --kanal ronden "Ronden <datum>" "<rapporten i Markdown>"
```

Skriptet sköter kanalval, delning över 2 000-teckengränsen och rate limits —
skriv aldrig egen curl-kod mot Discord. Varje rutin har sin egen kanal
(`kanalplan` i `agent/discord.json`); finns kanalen inte än postas det i
standardkanalen i stället för att tystna.

Posta dessutom, i **egna** poster:
- `--kanal uppgifter` varje gång nya uppgifter går ut till redigerarna
  (brief-runda eller förstabatch klar): produkt, antal briefer, Notion-länk.
- `--kanal larm` när något kräver Axel: `STOR_SPEND_UTAN_KOP`, `plan.sparrad`,
  misslyckad verifiering efter en Meta-skrivning.

Misslyckas Discord-posten: nämn det i svaret men stoppa ingenting.

## DEFINITION OF DONE
- [ ] Färsk `git pull` innan något annat
- [ ] Tre Meta-anrop gjorda mot `1867947880635861`
- [ ] `kontodata.json` skriven ordagrant
- [ ] `node agent/rond.mjs --json` kört; `plan.sparrad` kontrollerad
- [ ] Varje åtgärd utförd med öre-fältet ur planen och verifierad med läsning
- [ ] Uppskjutna loggade som `UPPSKJUTEN_GRANS`
- [ ] Förfallna behov i `annonsbehov` körda (max 2) med *_KLAR-loggrad + minnesfiler i utkorgen — eller exakt redovisat varför inte
- [ ] Alla loggrader skrivna och pushade efter varje ändring (= minnet sparat)
- [ ] Dashboarden ompublicerad ENDAST om pushen nekades — och det i så fall sagt i svaret
- [ ] Notion-svepet kört: hubbar avlästa med `is_archived`, drafts hämtade,
      `agent/notion-uppgifter.json` omskriven med dagens datum och speglad till utkorgen
- [ ] Nya och nyss arkiverade hubbar redovisade i leveransen
- [ ] Kort svar till Axel enligt svarsformatet i CLAUDE.md regel 14
