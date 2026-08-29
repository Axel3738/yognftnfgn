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
npm test                     # 69 tester, ska vara gröna
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

- **Vilket break-even som gäller.** Ronden tar talet i tre steg: uträknat ur
  kostnadsblocket i `produktkarta.json` om det finns, annars ett fast tal där,
  annars talet i kampanjnamnet. `products/products.json` har andra tal för sina
  sex produkter — de kampanjerna är pausade i Meta och berör därför inte ronden
  idag. Skulle de startas om måste talen jämkas.
- **Bälteslipmaskinens nya break-even.** Inköpspriset höjdes till 40 USD
  2026-08-28, men det saknas besked om frakt och avgifter ovanpå. Break-even
  ligger någonstans mellan 1,73 och 2,06 — och det avgör om beskedet blir
  "låt vara" eller "sänk". Ronden kör vidare på det gamla talet 1,58 tills
  raden ur kostnadsarket finns.
- **Cykelshorts break-even bygger på 5 köp.** Räkna om vid 30+.
- **Om ronden någon gång ska få ändra själv.** Idag: nej.

## Så räknas break-even

```
break-even-ROAS = pris / (pris − kostnad per order)
```

Ingen moms — butiken säljer DDP till Sverige. Kostnaden per order läggs ihop av delar i USD, EUR och
kronor, med valutakurserna i `produktkarta.json`. Ändras ett inköpspris räcker
det att ändra ett tal där — ronden räknar om break-even själv.

Går produkten i flera prisnivåer (1-pack, 2-pack, 3-pack) är break-even olika
för varje nivå. Ronden använder ett blandat tal som utgår från den AOV Meta
faktiskt visar, och trappan sparas i `produktkarta.json` så det går att se hur
talet kom till.
