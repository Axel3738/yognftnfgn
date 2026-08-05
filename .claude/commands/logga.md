# /logga – Logga launchade creatives: kvot + Notion-sync + tracking-sheet

Argument: `$ARGUMENTS` — produkt-id + antal (+ ev. datum).
Exempel: `/logga motorholjet 4`

En creative räknas när den är **live eller schemalagd i Ads Manager** — inte när
briefen är skriven. Detta kommando är avstämningen vid launch: kvoten uppdateras,
Notion ska stämma, tracking-sheetet ska stämma.

## Gör följande, i ordning

### 1. Verifiera mot Ads Manager
Kontrollera i MagiBorsten `1867947880635861` att annonserna faktiskt finns
(aktiva/schemalagda). Lista deras exakta namn och kontrollera naming-strukturen.

### 2. Logga kvoten
`node pipeline/quota.mjs log <produkt-id> <antal>` och sedan
`node pipeline/quota.mjs` — visa nya plus/minus-läget.

### 3. Notion-sync
För varje launchad annons: kontrollera att det finns ett item i produktens
Notion-sida enligt `docs/os/NOTION-FORMAT.md` (namn = annonsnamnet, status Draft,
tag `Video - Pending Approval` oavsett bild/video, briefen tillgänglig i itemet).
Saknas ett item → skapa det nu, med briefen inklistrad. Redovisa: X av Y annonser
hade redan item, Z skapades. Notion-MCP saknas → följ regeln i NOTION-FORMAT.md.

### 4. Tracking-sheet
- Lägg till en rad per launchad annons i `products/<id>/ads-tracker.csv` —
  samma kolumner som tracking-sheet-mallen (se `/sheet`). Saknas filen: skapa den
  med mallens kolumner. Detta är den källa som aldrig tappas bort.
- Generera en uppdaterad xlsx från CSV:n och ladda upp den till produktens
  Drive-mapp (döpt `ads-tracker-<datum>.xlsx`).
- Direktskrivning cell-för-cell i Google Sheetet kräver en Sheets-connector —
  finns den ansluten i sessionen: skriv raderna direkt i sheetet också. Annars:
  säg att xlsx:en behöver importeras (Arkiv → Importera → Ersätt) och var den ligger.

### 5. Committa och pusha
`products/products.json` + `products/<id>/ads-tracker.csv`
("Logga N creatives för <produkt>").

## DEFINITION OF DONE
- [ ] Annonserna verifierade i kontot (inte tagna på ordet)
- [ ] Kvoten loggad + nytt läge visat
- [ ] Notion: varje launchad annons har ett korrekt item (X fanns / Z skapade redovisat)
- [ ] ads-tracker.csv uppdaterad + xlsx uppladdad till Drive (eller Sheets-raderna skrivna direkt)
- [ ] Pushad
