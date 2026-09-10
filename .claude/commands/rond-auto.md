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
på BUDGETÄNDRINGARNA i Meta. **Startskotten i steg 4b är fortfarande
obligatoriska** — varje `forsta_batch`-behov ska ge ett larm, utan tak. En
körning som lämnar ett passerat test utan larm och utan redovisning är INTE
klar. *(Körningen 2026-08-30 hoppade över hela kön på den meningen — det var
fel tolkning. Regeln gällde då brief-rundorna; de finns inte längre, men
samma tolkning gäller startskotten.)*

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

**Förlängningen ges en gång, och den gäller ett HELT dygn.** Finns redan en
`TRAPPA_FORLANGNING`-rad för kampanjen de senaste 14 dagarna
(`senasteRadMedKod(logg, id, ["TRAPPA_FORLANGNING"], { maxAlderDagar: 14,
idag })` i `agent/logg.mjs`):
- är raden **från i dag** → rör inte kampanjen, logga `VANTA_FORLANGNING`
  (`genomford: false`). Dygnet har inte gått. *(2026-09-02: Badshorts och
  Plyschtofflorna fick förlängning på morgonen och stängdes av av samma dags
  körning några timmar senare — det var fel. Ett dygn är ett dygn.)*
- är raden **från ett tidigare datum** och kampanjen fortfarande går back →
  stäng av hela kampanjen, ingen ny förlängning.
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

## 4b. Startskottet (Axels beslut 2026-09-10 — ersätter hela annonshalvan)

**Ronden gör inga briefer längre.** Fram till 2026-09-10 byggde den en hel
creative-batch och en ny Notion-hub varje gång en produkt passerade testet,
och en brief-runda var tredje dag därefter. Allt det är borttaget.

I stället gör den **en enda sak**: postar ett startskott i Discord-kanalen
`#ops-startskott` när en produkt klarat testet. Meddelandet säger att
produkten ska få en egen OPS-butik, och bär det färdiga `/ny-ops`-kommandot.

> **Axels ord 2026-09-10:** *"Istället för att göra nya briefs och såna grejer
> ska vi inte göra det alls. Vi skickar bara ett Discord-meddelande. Det är
> det enda som den behöver göra istället för att göra en massa creative
> strategy och göra nya Notion-grejsmojser och sånt."*

**Vad rutinen därför ALDRIG gör längre:**
- Skriver briefer. Varken förstabatcher eller 3-dagarsrundor.
- Skapar Notion-hubbar. Duplicerar aldrig `Creative hub MALL`.
- Skapar Notion-items, Drive-mappar eller minnesfiler i `products/<id>/`.
- Kör `/forsta-batch` eller `/cs`.
- Loggar `FORSTA_BATCH_KLAR` eller `CS_BATCH_KLAR`.

Kvällens bildannons-rutin (`/bildannonser`, 20:00) och leveransrundan
(`/notionkorning`, 13:20) är egna rutiner och berörs inte. De rullar vidare.

### Så här körs det

`annonsbehov` i `agent/rond.mjs` räknas som förut — matematiken är orörd.
Skillnaden är vad du gör med den:

| Behov | Vad ronden gör nu |
|---|---|
| `forsta_batch` | **Startskott** — posta larmet, logga `OPS_STARTSKOTT` |
| `brief_runda` | **Ingenting.** Nämn den inte ens i rapporten. |
| `ersatt` | **Ingenting.** |
| `mata_vinnare` | **Ingenting.** |

`forsta_batch` betyder att produkten passerat **1 500 kr total spend OCH
minst 20 % vinst** (`FORSTA_BATCH_SPEND_SEK` / `FORSTA_BATCH_VINST_PROCENT`
i `agent/rond.mjs`). Rör aldrig de talen — de är Axels och de är testade.

⚠️ **BARA SVERIGE.** `annonsbehov` är tomt för NO-körningen och ska så vara.
En norsk kampanj utlöser aldrig ett startskott — norska annonser är svenska
annonser översatta i ett eget flöde.

För varje `forsta_batch`-behov, i ordning:

1. **Har startskottet redan gått?** `startskottHarGatt(logg, kampanj_id)` i
   `agent/startskott.mjs` läser budgetloggen. Är den `true`: hoppa över
   produkten helt och nämn den inte. Ett larm som kommer varje morgon slutar
   folk läsa.

2. **Läs kampanjens status.** Hämta den med `ads_get_ad_entities` direkt före
   larmet. Är `effective_status` något annat än `ACTIVE`: hoppa över, och
   skriv en rad i leveransen om varför. **Att ronden själv pausade kampanjen
   samma morgon är inget undantag** — en produkt som just stängdes av ska
   inte få en egen butik byggd.

3. **Hitta källänken.** Startskottet är värdelöst utan den — VA:n ska kunna
   klistra in `/ny-ops <länk>` utan att leta. Ta produktsidans URL på
   bäverbutiken.se. Hittar du den inte: posta larmet ändå, men skriv
   `KÄLLÄNK SAKNAS` i produktfältet och säg det i leveransen. **Gissa aldrig
   en URL.**

4. **Posta larmet.**

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

5. **Logga.** Skriv raden från `byggLoggrad` i `agent/budgetlogg.jsonl`
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

## 6. Leverans

Committa och pusha `agent/budgetlogg.jsonl` + `agent/produktkarta.json`
(om ändrad) till `claude/daily-agent-discussion-uos5df`.

**Gick pushen igenom: du är klar här.** Bygg INTE om dashboarden och
publicera ingen artefakt — se blocket högst upp i filen.

**Nekades pushen:** skriv i svaret att pushen nekades och vilka loggrader som
därmed inte sparades. Försök inte rädda dem någon annan väg.

Svara sedan kort på svenska: vad som ändrades (produkt, från → till), vad som
sköts upp och varför, om något larmade — och **vilka startskott som gick ut**
(produkt + siffrorna). Gick inget startskott: skriv ingenting om det.
Inga bibelsvar.

**Skicka samma korta rapport till Discord** (Axels order 2026-08-30) —
**på ENGELSKA.** Allt som postas som Bävern läses av det engelsktalande
teamet, så varje Discord-post skrivs på engelska även när svaret till Axel
här är på svenska. Produkt-, kanal- och kampanjnamn behåller sin svenska
stavning; belopp skrivs "1 200 SEK". Axels besked 2026-09-02.

```bash
node agent/discord-post.mjs --kanal ronden "Daily round <datum>" "<rapporten i Markdown, på engelska>"
```

⚠️ **ALLT som postas i Discord skrivs på ENGELSKA** — rubrik och brödtext, i
kanalerna `ronden` och `larm`. Redigerarna läser samma kanaler som Axel och
förstår inte svenska. Produktnamnen behålls som de heter i Meta (t.ex.
"Båtmotorskyddet 420D"), resten översätts: SKALA → "Scaled up", SANK →
"Scaled down", STÄNG AV → "Paused", uppskjuten → "Deferred". Svaret till Axel
i chatten är fortfarande på svenska. *(Axels order 2026-09-02 — samma dag
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
- `--kanal larm` när något kräver Axel: `STOR_SPEND_UTAN_KOP`, `plan.sparrad`,
  misslyckad verifiering efter en Meta-skrivning.

Startskotten postas **inte** härifrån — `agent/startskott.mjs` gör det själv
i steg 4b, i sin egen kanal och på svenska.

Misslyckas Discord-posten: nämn det i svaret men stoppa ingenting.

## DEFINITION OF DONE
- [ ] Färsk `git pull` innan något annat
- [ ] Tre Meta-anrop gjorda mot BÅDA kontona: SE `1867947880635861` och NO `1050941584152547`
- [ ] `kontodata.json` (SE) och `kontodata-no.json` (NO) skrivna ordagrant
- [ ] Ronden körd för båda marknaderna; `plan.sparrad` kontrollerad för var och en
- [ ] Varje åtgärd utförd med öre-fältet ur planen och verifierad med läsning
- [ ] Uppskjutna loggade som `UPPSKJUTEN_GRANS`
- [ ] Varje `forsta_batch`-behov har fått ett startskott i `#ops-startskott` —
      eller exakt redovisat varför inte (redan larmat, kampanjen inte ACTIVE,
      källänk saknas)
- [ ] Varje startskott loggat som `OPS_STARTSKOTT` och pushat
- [ ] **Inga briefer, inga Notion-hubbar, inga Notion-items, inga minnesfiler
      skapade** — varken för SE eller NO. Ronden gör inte det längre.
- [ ] Inga startskott för NO — Norge är bara budget
- [ ] Alla loggrader skrivna och pushade efter varje ändring (= minnet sparat)
- [ ] Ingen artefakt publicerad och `agent/dashboard.mjs` inte körd
- [ ] Kort svar till Axel enligt svarsformatet i CLAUDE.md regel 14
