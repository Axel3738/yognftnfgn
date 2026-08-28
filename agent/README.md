# `agent/` — dagens rond på annonskontot

Det här är den automatiska versionen av Bäverpanelens dagliga runda.
Den läser Meta, räknar ut vad panelens regler säger, och lämnar ett förslag.

**Den ändrar ingenting själv.** Varje ändring kräver att Axel säger ja.

## Så körs den

Skriv `/rond` i Claude Code. Kommandot ligger i `.claude/commands/rond.md`
och beskriver hela flödet steg för steg.

Vill du bara se om koden funkar, utan att hämta ny data:

```bash
node agent/rond.mjs          # rapport i terminalen
node agent/rond.mjs --json   # samma sak som maskindata
npm test                     # 44 tester, ska vara gröna
```

## Filerna

| Fil | Vad |
|---|---|
| `besked.mjs` | Beslutsmotorn. All matematik. Inga API-anrop, inget Claude. |
| `logg.mjs` | Läser och skriver budgetloggen. Räknar dagar sedan ändring och back-dagar i rad. |
| `rond.mjs` | Kör ihop det: kontroller, dom per kampanj, färdig rapport. |
| `produktkarta.json` | Vilka kampanjer som är test respektive drift. Sanningskällan. |
| `budgetlogg.jsonl` | Minnet. En rad per beslut, aldrig redigerad i efterhand. |
| `kontodata.json` | Dagens siffror ur Meta. Skrivs om varje rond, ligger inte i git. |
| `test/` | Testerna. |

## Varför koden räknar och inte Claude

Tre regler i CLAUDE.md finns för att en tidigare chatt gjorde fel:
ingen dom under 300 kr spend eller 3 köp, aldrig ranka på en enda siffra,
och hitta aldrig på data. Ligger räkningen i kod blir svaret detsamma varje
gång och går att testa. Claudes jobb är att hämta rätt siffror och lämna
dem oförändrade — inte att bedöma dem.

## Spärrarna

- **Bara ett konto.** Ronden vägrar köra mot annat än MagiBorsten
  `1867947880635861`. Grillkliniken stoppas med ett felmeddelande.
- **Ingen dom utan break-even.** Står det `BE ROAS TBC` i kampanjnamnet
  säger ronden det rakt ut i stället för att gissa.
- **Ingen dom under grinden.** Under 300 kr spend eller 3 köp på tre dagar
  rörs ingenting.
- **Högst en ändring var tredje dag** per kampanj, räknat ur budgetloggen.
- **Aldrig mer än 20 % åt gången.** Avrundningen till jämna 50 kr går nedåt
  vid höjning och uppåt vid sänkning, så steget aldrig blir större.
  (Bäverpanelens egen avrundning bryter mot den regeln: 605 → 750 kr är +24 %.)
- **Golv 500 kr, tak 4 000 kr.**
- **Orimliga siffror ger ingen dom.** ROAS utanför 0–15 flaggas i stället.
- **⚠ nära zongräns.** Ligger vinsten inom 3 procentenheter från en gräns
  flaggas raden — ROAS för de senaste dygnen revideras uppåt i efterhand.

## Det som inte är avgjort

- **Vilket break-even som gäller.** Ronden läser talet ur kampanjnamnet,
  eftersom det är det enda som följer med kampanjen. `products/products.json`
  har andra tal för sina sex produkter — de kampanjerna är pausade i Meta och
  berör därför inte ronden idag. Skulle de startas om måste talen jämkas.
- **Om momsen är avdragen** i break-even-talen. Står ingenstans. Är den inte
  det ser lönsamma produkter sämre ut än de är.
- **Om ronden någon gång ska få ändra själv.** Idag: nej.
