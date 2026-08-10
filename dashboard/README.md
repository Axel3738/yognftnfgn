# Redigerarpanel

Dashboard över redigerarnas output, ledtider, revisionsgrad och faktisk
belastning. Kopplad till Slack för lägesrapport och personliga knuffar.

```bash
cd dashboard
node cli.mjs seed --force     # demodata så du ser hur den beter sig
node cli.mjs build            # → dist/dashboard.html
node cli.mjs stats            # samma siffror i terminalen
node test.mjs                 # 25 tester
```

Öppna `dist/dashboard.html`. Inga beroenden, ingen server, inga CDN:er — en
enda fil som funkar offline och går att maila eller lägga på en statisk host.

---

## Vad den faktiskt mäter

Fem frågor, fem mätetal. Alla tider räknas i **arbetstid**, inte kalendertid.

| Frågan du ställde | Mätetal | Definition |
|---|---|---|
| Vad producerar de per dag? | **Leveranser** + **per aktiv dag** | Varje inlämning räknas, även omgjorda rundor |
| Hur lång tid tar en task? | **Median ledtid** + **p90** | Tilldelad → första leverans |
| Hur lång tid tar revisioner? | **Median revisionstid** | Ändringsbegäran → nästa inlämning |
| Hur noggranna är de? | **Revisionsgrad** + **omgjort-andel** | Andel tasks som fick minst en ändringsbegäran / andel av alla inlämningar som var omgörningar |
| Jobbar de egentligen? | **Pickup**, **beläggning**, **aktiva dagar**, **öppna tasks** | Se nedan |

### Arbetstid, inte kalendertid

Det här är den viktigaste designbesluten i hela verktyget, och den vanligaste
anledningen till att såna här paneler ljuger.

En task som lämnas ut **fredag 16:45** och levereras **måndag 09:15** tog
**1h 30m** — inte 64 timmar. Räknar man kalendertid ser alla ut som sölkorvar
över helger, alla ser snabba ut på tisdagar, och den som får sina tasks på
eftermiddagen straffas systematiskt. Arbetsfönstret sätts i `config.json`
(default 09:00–18:00, mån–fre, lunch 12:00–13:00, Europe/Stockholm) och
sommartid hanteras korrekt.

### "Jobbar de egentligen?" — vad siffrorna kan och inte kan svara på

Fyra signaler, i ordning efter hur mycket de är värda:

1. **Pickup** — tilldelad → påbörjad. Hur länge en task ligger orörd innan
   någon ens öppnar den. Den här är hård och svår att bortförklara.
2. **Leveranser per aktiv dag** — hur mycket som kommer ut de dagar de
   levererar något alls.
3. **Aktiva dagar** — hur många dagar i perioden det kom ut något.
4. **Beläggning** — uppskattad handpåläggningstid delat med tillgänglig
   arbetstid.

Beläggning är **en uppskattning, inte en tidrapport**. Den summerar
påbörjad→levererad för varje task och kan bli över 100% om någon jobbar på
flera tasks parallellt (vilket alla gör). Använd den som en grov indikation,
aldrig som bevis. Panelen märker den med `*` av just det skälet.

Det som **inte** går att få ut av en task-logg: om någon satt och surfade,
hur svår en enskild task var, eller om långsamhet beror på lathet eller på en
usel brief. Panelen mäter genomströmning — inte människor.

### Revisionsgrad ≠ omgjort-andel

Två olika saker som ofta blandas ihop:

- **Revisionsgrad** räknas *per task*: hur ofta något behöver göras om alls.
- **Omgjort-andel** räknas *per inlämning*: hur stor del av allt arbete som är
  omgörning.

En redigerare kan ha låg revisionsgrad men hög omgjort-andel (få tasks går
fel, men de som gör det går riktigt fel).

---

## Koppla in riktig data

Datan är en append-only händelselogg i `data/events.jsonl`. Allt annat härleds
därifrån, så det spelar ingen roll var händelserna kommer ifrån.

### Alternativ 1 — Notion (rekommenderat)

Notions API ger bara nuläget, inte statushistorik. Lösningen är en poller som
jämför mot förra körningen och bokför varje statusändring.

1. Skapa en Notion-integration, dela task-databasen med den.
2. `export NOTION_TOKEN=secret_...`
3. Fyll i `config.json` → `notion.databaseId` och kolumnnamnen i
   `propertyMap` / `statusMap`.
4. Testa: `node cli.mjs ingest notion --dry-run`
5. Kör skarpt: `node cli.mjs ingest notion`

Kör den **var 15:e minut** via cron. Ju oftare den kör, desto exaktare
tidsstämplar. Kör den sällan och tidsstämplarna blir trubbiga — aldrig fel,
bara grovkorniga.

Första körningen skapar en baslinje från `created_time` / `last_edited_time`,
så du har något att titta på direkt. Riktiga ledtider börjar samlas från och
med körning två.

### Alternativ 2 — CSV

Två format, det detekterar självt vilket du gav det:

```csv
task_id,editor,event,ts,round,reason,due,title,type,brand
T-1001,marcus,assigned,2026-08-01T09:00:00+02:00,,,2026-08-02T17:00:00+02:00,Mastern_PD_3,video,Mastern
T-1001,marcus,delivered,2026-08-01T13:30:00+02:00,1,,,,,
```

```csv
task_id,editor,title,type,assigned_at,started_at,delivered_at,revision_requested_at,revision_delivered_at,approved_at,due_at
```

```bash
node cli.mjs ingest csv historik.csv --dry-run
node cli.mjs ingest csv historik.csv
```

### Alternativ 3 — för hand

```bash
node cli.mjs log T-1042 assigned --editor marcus --title "Mastern hook-cut" --due 2026-08-12T17:00:00+02:00
node cli.mjs log T-1042 started  --editor marcus
node cli.mjs log T-1042 delivered --editor marcus --round 1
node cli.mjs log T-1042 revision_requested --editor marcus --reason "Fel logga"
node cli.mjs log T-1042 approved --editor marcus
```

Ingest är idempotent — samma händelse två gånger blir en. Polla hur ofta du vill.

### Rensa demodatan

```bash
node cli.mjs purge-demo
```

---

## Slack

Två lägen, inga npm-beroenden:

| Vad | Kräver | Kan |
|---|---|---|
| Incoming webhook | `SLACK_WEBHOOK_URL` | posta i en kanal |
| Bot-token | `SLACK_BOT_TOKEN` (`xoxb-…`) | posta i valfri kanal **och** DM:a enskilda |

```bash
node cli.mjs slack digest --dry-run              # se exakt vad som skulle skickas
node cli.mjs slack digest --url https://.../panel
node cli.mjs slack nudge --dry-run               # personliga knuffar
node cli.mjs slack nudge
```

**Digest** (till kanalen): läget i stort, en rad per redigerare, och listan
över det som står still. **Nudge** (DM): bara till den som faktiskt har något
liggande, med en rad coaching om revisionsgraden eller pickup-tiden ligger
över målet.

För DM krävs scopes `chat:write` och `im:write`, och slack-id per person i
`data/editors.json`. Saknas id:t hoppas personen över med en varning i stället
för att krascha.

Ingenting skickas utan att du ber om det. `--dry-run` skriver ut JSON:en.

### Schemalägg

```cron
*/15 8-18 * * 1-5  cd /sökväg/dashboard && node cli.mjs ingest notion
0 8 * * 1-5        cd /sökväg/dashboard && node cli.mjs build && node cli.mjs slack digest
0 14 * * 1-5       cd /sökväg/dashboard && node cli.mjs slack nudge
```

---

## Konfiguration

Allt i `config.json`:

- `workday` — arbetsfönster, dagar, lunch, tidszon
- `targets` — vad som räknas som bra (mållinjerna i diagrammen)
- `thresholds` — när något blir gult respektive rött, och när en task räknas
  som stillastående
- `periods` — vilka perioder som förberäknas (växlas i webbläsaren)
- `notion` — databas-id och kolumnmappning

Tröskelvärdena är **absoluta, inte relativa**. Den sämsta i gruppen blir inte
röd för att den är sämst — den blir röd när den passerar en gräns du satt.
Annars är alltid någon röd, och panelen blir ett mobbningsverktyg i stället
för ett styrverktyg.

---

## Filer

| Fil | Vad |
|---|---|
| `cli.mjs` | Alla kommandon |
| `src/time.mjs` | Arbetstidsmatematiken — DST, helger, lunch |
| `src/store.mjs` | Händelselogg + veckning till tasks |
| `src/metrics.mjs` | Alla nyckeltal |
| `src/render.mjs` | Dashboarden (en självständig HTML-fil) |
| `src/slack.mjs` | Block Kit + utskick |
| `src/ingest/notion.mjs` | Notion-poller med statusdiff |
| `src/ingest/csv.mjs` | CSV-import |
| `src/seed.mjs` | Demodatagenerator |
| `test.mjs` | 25 tester, tyngdpunkt på tidsmatematiken |

## Design

Diagrammen följer en validerad palett: färgordningen är kontrollerad för
färgblindhet (deuteran/protan/tritan) i både ljust och mörkt läge, status bärs
alltid av ikon **och** text — aldrig färg ensam, varje diagram har tabellvy,
och panelen följer systemets tema.
