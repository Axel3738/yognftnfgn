# Redigerardashboard

KPI- och arbetsdashboard för videoredigerarna. Ligger i samma repo som resten av
Creative Strategy OS och använder samma produktdata (`products/products.json`) och
samma kvotformel som `pipeline/quota.mjs`.

**Managern behöver inte läsa detta.** Hon använder `/plan`, `/dashboard`,
`/rapport` och `/granska` — se `docs/os/SOP-07-dashboard.md`.
Redigerarna: `docs/os/EDITOR-SOP.md`.

## Arkitekturbeslutet

Repot är inte en webbapp: markdown, JSON och rena Node-skript utan beroenden.
Dashboarden följer samma mönster i stället för att införa ett parallellt system:

| Beslut | Varför |
|--------|--------|
| **JSON-filer på disk**, ingen databas | Samma mönster som `products.json`. Går att läsa, diffa och backa i git. Inga migrations att köra. |
| **Genererad statisk HTML**, ingen server | Ingen som hostar eller deployar efter överlämningen. Filen öppnas direkt eller läggs i Drive. |
| **Ingen inloggning** | Fyra redigerare och en manager. Konton hade blivit en tröskel, inte ett skydd. Roller finns i datamodellen och styr vad kommandona tillåter. |
| **Slack via befintlig MCP**, ingen webhook-server | Claude läser och skriver Slack redan. En egen server hade krävt hosting, secrets och signaturverifiering — utan att lösa något ytterligare. |
| **Noll npm-beroenden** | Inget att uppdatera, inget som slutar fungera. Node 20+ räcker. |

Vad detta kostar: ingen realtid (kör `build.mjs` efter ändringar), ingen samtidig
redigering, och Slack-knappar blir Slack-meddelanden. Inget av det hindrar det
dagliga flödet.

## Kom igång

```bash
node dashboard/seed.mjs --force   # demodata: 4 redigerare, 33 tasks, 2 veckor
node dashboard/build.mjs          # bygger dashboard/index.html
npm test                          # 17 tester på de kritiska reglerna
```

### Var du faktiskt ser den

`dashboard/index.html` är incheckad i repot, så den går att öppna på tre sätt:

1. **Be Claude publicera den** — `/dashboard` bygger om och kan publicera den som
   en delbar länk. Enklast för managern, funkar på mobilen.
2. **Ladda ner från GitHub** — öppna filen i repot, tryck "Download raw file",
   dubbelklicka. Inget behöver installeras.
3. **Lokalt** — `node dashboard/build.mjs` och öppna filen.

Inga env-variabler krävs.

**Skarp start:** ersätt `dashboard/data/team.json` med de riktiga personerna,
töm `tasks.json`/`events.json`/`daily-plans.json`/`daily-reports.json` till
`{"tasks":[]}` osv, och börja lägga tasks med `/plan`.

## Datamodell

Allt ligger i `dashboard/data/`:

| Fil | Innehåll |
|-----|----------|
| `team.json` | Users + editor-profiler (dagsmål, arbetstider, skills, noteringar) |
| `tasks.json` | Tasks med checklista, feedbackhistorik och blocker-fält |
| `events.json` | Audit-logg, append-only: vem, vad, när, varifrån |
| `daily-plans.json` | Publicerad dagsplan per redigerare |
| `daily-reports.json` | Slutrapporter |

Produkter dupliceras inte — de läses från `products/products.json`.
**KPI:er lagras aldrig.** De räknas fram ur tasks + events vid varje anrop.

## Statusflödet

```
planned → in_progress → in_review → approved
             ↓  ↑           ↓
          blocked        changes → in_progress
```

Spärrar som är testade:
- En task kan **inte** hoppa från `in_progress` till `approved`.
- `in_review` kräver en **leveranslänk**.
- `approved` kräver att alla obligatoriska checklistpunkter är gröna — eller en
  override med motivering på minst 10 tecken, som loggas.
- `changes` kräver feedback och nollställer checklistan.
- En editor kan bara ändra sina egna tasks. Bara manager/admin får granska.

## Kommandon

```bash
node dashboard/cli.mjs status [--date D] [--from D --to D]
node dashboard/cli.mjs today <editor>
node dashboard/cli.mjs review-queue
node dashboard/cli.mjs new --title ".." --product .. --editor .. --type .. --brief <url> \
                          [--creatives 3] [--priority high] [--due D] --as anna
node dashboard/cli.mjs start   <id> --as <user>
node dashboard/cli.mjs block   <id> --as <user> --reason ".." [--needs ".."] [--owner anna]
node dashboard/cli.mjs deliver <id> --as <user> --link <url> --creatives 3 [--answers k=yes,k2=no]
node dashboard/cli.mjs check   <id> --as anna --key <nyckel> --pass|--fail
node dashboard/cli.mjs approve <id> --as anna [--override "skäl"]
node dashboard/cli.mjs changes <id> --as anna --feedback ".."
node dashboard/cli.mjs assign  <id> --as anna --to <editor>
node dashboard/cli.mjs due     <id> --as anna --date D
node dashboard/cli.mjs plan    <editor> --as anna [--notes ".."]
node dashboard/cli.mjs report  <editor> --message ".." [--creatives n]
node dashboard/cli.mjs kpi     <editor> [--from D --to D]
node dashboard/cli.mjs product <id>
node dashboard/cli.mjs history [<id>] [--limit 30]
node dashboard/cli.mjs export-csv tasks|events|kpi [--from D --to D]
```

Alla skrivande kommandon tar `--source dashboard|slack|ai|cli` så audit-loggen
visar varifrån ändringen kom.

## KPI:erna

Räknas per redigerare och period, alltid ur taskhistoriken:

- **Output:** tasks levererade/godkända, creatives levererade/godkända
- **Leveranssäkerhet:** on-time rate, sena tasks, snittförsening
- **Kvalitet:** first-pass approval rate, revision rate, snitt revisionsrundor
- **Kommunikation:** blockers rapporterade, slutrapporter inlämnade
- **Tid:** start → leverans, leverans → godkänd
- **Kontext:** öppna tasks, snitt creatives per task

Kontextraden är medvetet med i UI:t. En person som tar de svåraste briefarna får
fler revisioner, och KPI:erna ska inte läsas som en topplista.

## Produktkvoten

Samma formel som `pipeline/quota.mjs`, verifierad i testerna:

```
testandel = 20 %  (10 % vid dagsbudget ≥ 5 000 kr)
kvot per 3-dagarscykel = daglig budget × testandel ÷ target-CPA × 3
```

Dashboarden mäter mot **godkända** creatives — inte levererade.

## Tester

`npm test` — 17 tester som täcker statusövergångar, godkännanderegeln, override-
kravet, behörigheter, sena tasks, kvotformeln, KPI-beräkningar, datumfiltret,
levererad-vs-godkänd, utebliven slutrapport och Slack-idempotens.
Testerna kör mot en temporär katalog (`DASHBOARD_DATA_DIR`) och rör aldrig riktig data.

## Slack

Datamodellen är förberedd (`source`-fält på varje event, `slackUserId` på varje
user, idempotenskontroll i testerna). Själva utskicken görs av Claude via den
Slack-MCP som redan är kopplad — mallarna står i `docs/os/SOP-07-dashboard.md`.
Ingen egen Slack-app eller webhook-endpoint behövs.

## Vad som medvetet inte är byggt

Lönehantering, automatiska performance reviews, videofilanalys, Drive-integration,
prediktiv bemanning och redigerarjämförelser. Första versionen ska lösa en sak:
planera dagen → följ upp → ta emot → kontrollera → godkänn → uppdatera KPI:er.
