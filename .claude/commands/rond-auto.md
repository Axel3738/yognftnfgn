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

**Tolkningsregel (Axel 2026-08-30):** när körordern (trigger-prompten) säger
"utför bara det som står i plan.atgarder" syftar det på BUDGETÄNDRINGARNA i
Meta. Annonsbehoven i steg 4b är fortfarande obligatoriska — alla
förstabatcher och alla förfallna brief-rundor, utan tak (se 4b). En körning
som lämnar förfallna behov utan åtgärd och utan redovisning är INTE klar. (Körningen 2026-08-30 hoppade över hela kön på den
meningen — det var fel tolkning.)

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

**`typ: "trappa"`** — produkten har passerat 1 500 kr och går back.

**Axels beslut 2026-09-01 — den gamla femdagarstrappan är avskaffad.** Den lät
en förlorare bränna budget i fem dygn medan den gick steg för steg. Nu finns
bara två utgångar, och båda avgörs samma morgon:

Under 1 500 kr total spend rörs kampanjen inte alls — den domen heter
`VANTA_TROSKEL` och den ligger kvar oförändrad. Trappan börjar först efter det.

Hämta kampanjens annonser (`level: "ad"`, `date_preset: "last_3d"`, filtrering
på `campaign.id`, fälten `amount_spent`, `omni_purchase`, `purchase_roas`,
`effective_status`) och avgör:

- **POTENTIAL** = BÅDA sakerna är sanna samtidigt:
  1. minst en aktiv annons har ≥1 köp OCH `purchase_roas` ≥ kampanjens
     break-even, och
  2. minst en annan aktiv annons har tagit ≥40 % av kampanjens 3-dagarsspend
     med **noll** köp.

  Då: pausa **bara** spendtjuven (`entity_type: "ad"`,
  `fields: {"status":"PAUSED"}`), verifiera med en tillbakaläsning, låt
  kampanjen stå kvar ACTIVE, och logga `TRAPPA_FORLANGNING` med namnet på den
  pausade annonsen. Kampanjen får **ett** dygn till.
- **INGEN POTENTIAL** = ingen enda aktiv annons ligger över break-even, eller
  ingen enskild annons äter spenden. Då: pausa **hela kampanjen** i dag
  (`entity_type: "campaign"`, `fields: {"status":"PAUSED"}`), verifiera, logga
  `STANG_AV` med motiveringen att potentialkollen föll.

**Förlängningen ges en gång.** Finns redan en `TRAPPA_FORLANGNING`-rad för
kampanjen de senaste 14 dagarna (`senasteRadMedKod(logg, id,
["TRAPPA_FORLANGNING"], { maxAlderDagar: 14, idag })` i `agent/logg.mjs`) och
kampanjen fortfarande går back: stäng av hela kampanjen, ingen ny förlängning.
Har den däremot vänt över break-even faller domen bort av sig själv — då står
det inte längre `trappa` i planen.

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

**Batchens innehåll (Axel 2026-09-02):**
- **Fler videor.** Redigerarna är många — minst två tredjedelar av varje
  batch är video. Förstabatch: sex nya videokoncept + variationer på
  vinnarna + sex statiska. Brief-runda: `rundaAntal` annonser (dubbla
  veckokvoten, minst fyra), varav högst två statiska.
- **Statiska på samma nivå som förut.** Inte fler, inte färre.
- **BOF-bilder är parkerat.** Axel nämnde att bilder är billiga att göra och
  att BOF-bilder kanske ska prioriteras — beslutet är att vänta. Bygg inga
  BOF-bildserier förrän han säger till.
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
  3. **Kontrollera åtkomsten innan du skapar items** (Axels krav 2026-09-01):
     hubben ska ligga i teamspacet **Bäverbutiken** och vara öppen för hela
     teamspacet — alla medlemmar ska nå den utan att bjudas in personligen.
     Hämta hubben med notion-fetch och verifiera att föräldern är teamspacet,
     inte en privat sida eller Axels eget utrymme. Ligger den fel: flytta den
     till teamspacet med notion-move-pages och läs tillbaka. Går det inte att
     flytta — skapa INGA items, utan säg till Axel att hubben ligger privat.
     En hub som bara inbjudna når är osynlig för redigerarna, och då är
     brieferna skrivna i papperskorgen.
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
   dagens datum. **Committa och pusha filen.**
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

## 6. Leverans

Committa och pusha `agent/budgetlogg.jsonl` + `agent/produktkarta.json`
(om ändrad) till `claude/daily-agent-discussion-uos5df`.

**Gick pushen igenom: du är klar här.** Bygg INTE om dashboarden och
publicera ingen artefakt — se blocket högst upp i filen.

**Nekades pushen:** skriv i svaret att pushen nekades och vilka loggrader som
därmed inte sparades. Försök inte rädda dem någon annan väg.

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
- [ ] Tre Meta-anrop gjorda mot BÅDA kontona: SE `1867947880635861` och NO `1050941584152547`
- [ ] `kontodata.json` (SE) och `kontodata-no.json` (NO) skrivna ordagrant
- [ ] Ronden körd för båda marknaderna; `plan.sparrad` kontrollerad för var och en
- [ ] Varje åtgärd utförd med öre-fältet ur planen och verifierad med läsning
- [ ] Uppskjutna loggade som `UPPSKJUTEN_GRANS`
- [ ] Alla `forsta_batch` körda (inget tak) + högst två `brief_runda`, med
      *_KLAR-loggrad och minnesfiler pushade — eller exakt redovisat varför inte
- [ ] Inga briefer, hubbar eller minnesfiler skapade för NO — Norge är bara budget
- [ ] Varje ny Notion-hub verifierad att den ligger öppet i teamspacet Bäverbutiken
- [ ] Ett skapat Notion-item öppnat och kontrollerat: hela briefen står i sidan, ingen `.md`-länk
- [ ] Alla loggrader skrivna och pushade efter varje ändring (= minnet sparat)
- [ ] Ingen artefakt publicerad och `agent/dashboard.mjs` inte körd
- [ ] Notion-svepet kört: hubbar avlästa med `is_archived`, drafts hämtade,
      `agent/notion-uppgifter.json` omskriven med dagens datum och pushad
- [ ] Nya och nyss arkiverade hubbar redovisade i leveransen
- [ ] Kort svar till Axel enligt svarsformatet i CLAUDE.md regel 14
