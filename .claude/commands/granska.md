# /granska – Beta av review-kön

> **Innan du frågar användaren något:** fråga dig själv om det finns ett sätt att
> ta reda på svaret som du inte provat än — repo + git-historik, Drive, Notion,
> Meta, Shopify, product sheetet. Fråga bara när svaret kräver ägaren (pris,
> rabatt, target-CPA). Den som kör kan vara helt icke-teknisk: en fråga i taget,
> enkel svenska utan fackord, och ge alltid ett rekommenderat svar att säga ja till.

Argument: `$ARGUMENTS` — valfritt task-ID.
Exempel: `/granska` · `/granska AXE-009`

En task blir aldrig godkänd bara för att redigeraren säger att den är klar.

## Gör följande

### 1. Visa kön
`node dashboard/cli.mjs review-queue` — äldsta leverans först.

### 2. Per task, gå igenom checklistan på riktigt
- Öppna leveranslänken och kontrollera det som går att kontrollera.
- Är en obligatorisk punkt obesvarad: **fråga redigeraren i Slack** med checklistans
  formulerade fråga (`question`-fältet), t.ex. *"Which hook did you use for each version?"*.
  Godkänn den aldrig åt dem.
- Finns tidigare feedback på tasken: kontrollera att den faktiskt är implementerad.
  Återkommande missad feedback är ett mönster som ska upp i redigerarens KPI-vy.

Bocka av: `node dashboard/cli.mjs check <id> --as anna --key <nyckel> --pass|--fail [--answer "..."]`

### 3. Besluta

**Godkänn** (bara när alla obligatoriska punkter är gröna):
```
node dashboard/cli.mjs approve <id> --as anna
```

**Skicka tillbaka** (feedback är obligatorisk):
```
node dashboard/cli.mjs changes <id> --as anna --feedback "..."
```
Skriv feedback som går att agera på: vad, var i filen, och vad som ska bli i stället.
"Ser inte bra ut" skapar bara ännu en revisionsrunda.

**Override** — bara när du kontrollerat manuellt och checklistan har fel:
```
node dashboard/cli.mjs approve <id> --as anna --override "skäl, minst 10 tecken"
```
Varje override hamnar i audit-loggen med sin motivering.

### 4. Efteråt
- `node dashboard/build.mjs`
- Skriv Slack-utkast till varje berörd redigerare (godkänt / ändringar krävs med feedbacken).
- Rapportera till managern: antal godkända, antal tillbakaskickade, och om något
  mönster upprepas (samma redigerare, samma checklistpunkt, samma produkt).

## DEFINITION OF DONE
- [ ] Varje task i kön behandlad eller uttryckligen bordlagd med skäl
- [ ] Inga obligatoriska punkter godkända åt redigeraren utan svar
- [ ] All tillbakaskickad feedback är konkret och åtgärdbar
- [ ] Overrides motiverade i loggen
- [ ] Dashboarden ombyggd, Slack-utkast skrivna
