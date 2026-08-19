# /rapport – Ta emot en slutrapport från Slack

> **Innan du frågar användaren något:** fråga dig själv om det finns ett sätt att
> ta reda på svaret som du inte provat än — repo + git-historik, Drive, Notion,
> Meta, Shopify, product sheetet. Fråga bara när svaret kräver ägaren (pris,
> rabatt, target-CPA). Den som kör kan vara helt icke-teknisk: en fråga i taget,
> enkel svenska utan fackord, och ge alltid ett rekommenderat svar att säga ja till.

**Var rapporterna kommer ifrån:** `#bäver-scaling-products` i Stonebite
(`C0BNJC83DMF`), en per redigerare per dag, senast 21:30. Claude kan läsa kanalen
själv — kör `slack_read_channel` istället för att be managern klistra in.
Kommandot funkar ändå med inklistrad text om Slack skulle strula.

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
