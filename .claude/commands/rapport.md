# /rapport – Ta emot en slutrapport från Slack

**Var rapporterna kommer ifrån:** `#rapporter` i stonebite-workspacet, en per
redigerare per dag, senast 21:30. Managern kopierar meddelandet därifrån.
Så länge `slack.connected` är `false` i `dashboard/data/team.json` kan Claude inte
läsa kanalen själv — rapporten måste klistras in.

Argument: `$ARGUMENTS` — redigerarens namn + rapporttexten (klistra in Slack-meddelandet rakt av).
Exempel:
`/rapport maria: Today I finished the two hook iterations for Axelbältet and uploaded everything to Drive. AXE-008 is not done, I am missing the voice-over.`

## Gör följande

### 1. Tolka — men skriv ingenting än
Läs rapporten och matcha den mot redigerarens öppna tasks
(`node dashboard/cli.mjs today <editor>`). Föreslå:

| Task | Tolkning | Creatives | Åtgärd |
|------|----------|-----------|--------|

Regler för tolkningen:
- Matcha bara mot tasks som faktiskt är tilldelade personen.
- Är matchningen osäker: säg det och gissa inte.
- Nämns ett antal creatives utan task: fråga vilken task det gäller.

### 2. Bekräfta innan något sparas
Visa förslaget och fråga **"Stämmer detta?"**. Spara ingenting förrän managern svarat ja.
Detta är regeln som gör att AI:n aldrig skriver fel data i systemet.

### 3. Efter bekräftelse

Levererat arbete (aldrig direkt till godkänd — alltid till granskning):
```
node dashboard/cli.mjs deliver <id> --as <editor> --link <url> --creatives <n> --source slack
```
Blocker:
```
node dashboard/cli.mjs block <id> --as <editor> --reason "..." --needs "..." --owner anna --source slack
```
Själva rapporten:
```
node dashboard/cli.mjs report <editor> --message "<rapporten ordagrant>" --creatives <n> --source slack
```

Saknas leveranslänk för något som sägs vara klart: **fråga efter den**. Utan länk
kan tasken inte lämnas in — det är spärren mot falskt rapporterade färdiga tasks.

### 4. Avsluta
- `node dashboard/build.mjs`
- Säg vad som nu ligger i review-kön och vad som blockerar.

## DEFINITION OF DONE
- [ ] Tolkningen visad som tabell och bekräftad innan skrivning
- [ ] Inget gissat — osäkra matchningar frågade om
- [ ] Leveranser gick till granskning, inte till godkänd
- [ ] Blockers registrerade med vad som behövs och vem som ska agera
- [ ] Rapporten sparad ordagrant, dashboarden ombyggd
