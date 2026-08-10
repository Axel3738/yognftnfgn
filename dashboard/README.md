# Redigerar-dashboard

Mäter vad redigerarna faktiskt levererar, hur lång tid det tar, hur ofta det
måste göras om — och var tiden egentligen tar vägen. Plus Slack-utskick så att
det som ligger still faktiskt blir gjort.

```bash
cd dashboard
node edash.mjs seed        # realistisk demodata (60 dagar, 5 redigerare)
node edash.mjs serve       # → http://localhost:4173
```

Inga npm-beroenden. Node 20+ räcker.

---

## Vad den svarar på

| Fråga | Metrik i dashboarden |
|---|---|
| Hur mycket levererar var och en per dag? | **Output-poäng** (komplexitetsviktade) per dag och per aktiv dag |
| Hur lång tid tar en task? | **Median + p90 till första leverans**, i arbetstimmar |
| Hur snabbt fixas revisions? | **Revisionsvändning** (median + p90) |
| Hur noggranna är de? | **Rätt första gången** och **omgörningsgrad**, uppdelat på eget fel vs vårt |
| Jobbar de faktiskt? | **Loggad tid mot kapacitet** + **egen tid vs väntetid** per task |
| Vad ligger och skräpar just nu? | **Kön** — försenat, liggande revisions, och det som väntar på oss |

### Tre saker den gör annorlunda än en vanlig tasklista

**1. Arbetstid, inte väggklocka.** En task som lämnas över fredag 16:30 och är
klar måndag 09:30 räknas som **1 timme**, inte 65. Nätter, helger och röda dagar
räknas bort (`config.json` → `workday`, `holidays`). Utan det mäter man när i
veckan någon råkade få jobbet.

**2. Bollen.** Varje task-period tillhör antingen redigeraren eller oss. "Tog
fyra dagar" betyder inget om tre av dem var vi som inte tittade på leveransen.
Dashboarden visar båda — och säger till när **vi** är flaskhalsen.

**3. Rättvis omgörningsgrad.** En revision som beror på otydlig brief, ändrat
scope eller att beställaren ändrade sig räknas **inte** mot redigeraren
(`revisionReasons` i configen). Annars mäter man hur ostabila beställarna är och
skickar räkningen till redigeraren. Kolumnen *Omgörning (egna)* är den som är
personlig; *Omgörning totalt* är processens.

Dessutom: **median och p90, aldrig medelvärde** (ett monsterjobb ska inte döma ut
någon), och allt med för litet underlag flaggas istället för att presenteras som
sanning.

---

## Datamodell

Allt bygger på en append-only händelselogg, `data/events.jsonl` — en rad per
händelse. Inget skrivs över, så varje siffra går att spåra tillbaka till
råhändelser. Filen går att läsa med `tail` och versionera.

```jsonl
{"type":"task_created","ts":"2026-08-03T07:00:00Z","taskId":"T-0042","title":"GRILL_mastern_pain_comparison_investering_v1","kind":"static","complexity":"M"}
{"type":"task_assigned","ts":"2026-08-03T07:10:00Z","taskId":"T-0042","editorId":"ed_lina","dueAt":"2026-08-04T15:00:00Z"}
{"type":"task_delivered","ts":"2026-08-03T11:30:00Z","taskId":"T-0042"}
{"type":"revision_requested","ts":"2026-08-03T13:00:00Z","taskId":"T-0042","reason":"quality"}
{"type":"task_delivered","ts":"2026-08-03T15:00:00Z","taskId":"T-0042"}
{"type":"task_approved","ts":"2026-08-04T08:00:00Z","taskId":"T-0042"}
```

Se hela schemat med `node edash.mjs types`. Kortversion:

| Event | Vad det betyder |
|---|---|
| `editor_added` | Redigerare + Slack-id + kapacitet (timmar/dag) |
| `task_created` | Brief finns. `complexity` S/M/L/XL styr viktningen |
| `task_assigned` | **Klockan startar här** |
| `task_started` | Frivilligt — utan den går kötid inte att skilja från arbetstid |
| `task_delivered` | Inskickad för granskning (runda räknas automatiskt) |
| `revision_requested` | `reason`: `quality`, `technical`, `brief`, `scope-change`, `preference` |
| `task_approved` / `task_cancelled` | Klar respektive nedlagd |
| `work_logged` | Faktiska minuter. Utan detta går "jobbar de?" inte att besvara |

**Saknad `reason` räknas som redigerarens fel.** Det är medvetet — annars kan man
tvätta bort all rework genom att slarva med fältet. `node edash.mjs validate`
listar dem.

### Få in data

```bash
# 1. Manuellt / från skript
node edash.mjs log task_assigned taskId=T-0042 editorId=ed_lina
node edash.mjs log revision_requested taskId=T-0042 reason=brief notes="fel format i briefen"
node edash.mjs log work_logged editorId=ed_lina minutes=95 taskId=T-0042

# 2. Import från annat system (Notion, ClickUp, Trello, kalkylark …)
node edash.mjs import export.csv      # kolumnrubrikerna = fältnamnen, kräver "type"

# 3. HTTP-ingest (automation, Zapier, Make, egna skript)
curl -X POST localhost:4173/api/events \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $INGEST_TOKEN" \
  -d '{"type":"task_delivered","taskId":"T-0042"}'
```

Sätt `INGEST_TOKEN` i miljön för att kräva token på POST. Utan den är endpointen
öppen — kör då bara lokalt.

---

## Slack

Två lägen:

| Läge | Sätt | Kan |
|---|---|---|
| Incoming webhook | `SLACK_WEBHOOK_URL` | posta i **en** kanal |
| Bot-token | `SLACK_BOT_TOKEN` (+ `SLACK_CHANNEL`) | posta i valfri kanal **och DM:a redigerare** |

DM-påminnelser kräver bot-token med `chat:write` och `im:write`, plus att varje
redigerare har `slackUserId` satt.

```bash
node edash.mjs slack daily  --dry     # skriv ut exakt vad som skulle skickas
node edash.mjs slack daily            # kö, försenat, liggande revisions, vad som väntar på oss
node edash.mjs slack weekly           # veckans scoreboard per redigerare + trend
node edash.mjs slack nudge            # personlig DM till var och en som har något liggande
```

Sätt `DASHBOARD_URL` så länkas dashboarden i varje utskick.

Trösklarna för vad som räknas som "ligger still" sitter i `config.json` under
`slack` (`revisionWaitingHours`, `stalledHours`).

### Schemalägg

```cron
# Dagligt läge 08:30, veckorapport fredag 15:00, påminnelser 13:00
30 8 * * 1-5  cd /sökväg/dashboard && SLACK_BOT_TOKEN=… node edash.mjs slack daily
0 15 * * 5    cd /sökväg/dashboard && SLACK_BOT_TOKEN=… node edash.mjs slack weekly
0 13 * * 1-5  cd /sökväg/dashboard && SLACK_BOT_TOKEN=… node edash.mjs slack nudge
```

Ett färdigt GitHub Actions-schema ligger i
[`.github/workflows/slack-digest.yml.example`](../.github/workflows/slack-digest.yml.example)
— döp om det till `.yml` och lägg in `SLACK_BOT_TOKEN` som repo-secret.

---

## Kommandon

```
serve [--port 4173]              starta dashboarden
seed [--days 60] [--force]       realistisk demodata
log <typ> nyckel=värde ...       logga ett event
import <fil.jsonl|json|csv>      importera från annat system
report [--days 30] [--from --to] textrapport i terminalen
slack daily|weekly|nudge [--dry] skicka till Slack
validate                         kontrollera loggen + datakvalitet
types                            visa eventschemat
```

Gemensamma flaggor: `--store <fil>` `--config <fil>` `--brand` `--kind` `--editor`.

## API

| Endpoint | Vad |
|---|---|
| `GET /api/report?from=&to=&kind=&brand=` | Hela rapporten som JSON |
| `GET /api/editor/:id?from=&to=` | En redigerares tasks med alla ledtider |
| `GET /api/events?limit=` | Råloggen, senaste först |
| `POST /api/events` | Lägg till event (se ingest ovan) |
| `GET /api/health` | Antal event + antal trasiga rader |

## Konfiguration (`config.json`)

| Nyckel | Vad |
|---|---|
| `timezone`, `workday`, `holidays` | Definierar arbetstiden all ledtid mäts i |
| `complexityWeights` | Hur mycket en S/M/L/XL-task är värd i output-poäng |
| `targets` | Mål som visas mot utfallet |
| `minSample` | Under så många bedömda tasks flaggas siffrorna som osäkra |
| `revisionReasons` | Vilka orsaker som räknas mot redigeraren (`attributable`) |
| `slack` | Kanal och trösklar för påminnelser |

## Tester

```bash
node --test
```

Täcker arbetstidsmatten (helger, röda dagar, sommartid), metrikdefinitionerna,
eventvalideringen och Slack-meddelandena.

## Läs siffrorna rätt

- **Jämför aldrig två redigerare på en enda siffra.** Snabb + hög omgörningsgrad
  och långsam + noll omgörningar kan landa på samma verkliga leveranstakt.
  Punktdiagrammet "fart mot träffsäkerhet" finns just därför.
- **Litet underlag är brus.** Under `minSample` bedömda tasks flaggar
  dashboarden det själv — läs det som en indikation, inte ett facit.
- **Utnyttjandegrad kräver tidsloggning.** Utan `work_logged` går frågan "jobbar
  de egentligen?" inte att besvara — då säger dashboarden det istället för att
  gissa. Det närmaste svaret utan tidsloggning är *egen tid vs väntetid* per
  task, som visar om en task ligger orörd eller faktiskt bearbetas.
- **Kolla vad som väntar på oss innan du pratar om hastighet.** I demodatan är
  runt halva ledtiden vår egen granskningstid. Det är vanligt.
