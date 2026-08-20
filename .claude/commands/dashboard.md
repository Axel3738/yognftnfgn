# /dashboard – Synka Notion, bygg dashboarden, publicera

Argument: `$ARGUMENTS` — valfritt datum eller period.

**Kör detta varje gång managern vill se aktuellt läge.** Dashboarden uppdateras
inte av sig själv — den byggs om av detta kommando.

## Gör följande

### 1. Synka Notion (alltid först)
För varje produkt med `scaling: true` i `products/products.json`, kör en
Notion-fråga mot dess `notion.collection_id`:

```sql
SELECT "Namn","Status","Typ","Ansvarig","Prioritet","Feedback",url,createdTime
FROM "collection://<collection_id>"
WHERE "Typ" LIKE '%Approval%' OR "Typ" LIKE '%Approved%'
```

Multi-source i en fråga kräver Enterprise — kör **en fråga per produkt**.
Skriv resultatet till `dashboard/data/notion-raw.json` i formatet:

```json
{ "syncedAt": "<ISO>", "items": { "<produkt-id>": [
  { "namn": "...", "status": "...", "typ": "...", "ansvarig": ["<notion-user-id>"],
    "prioritet": null, "feedback": null, "url": "...", "createdTime": "..." } ] } }
```

Kör sedan `node dashboard/notion-import.mjs`.

### 2. Bygg och visa
- `node dashboard/build.mjs` (lägg till `--date` / `--from` / `--to` vid behov)
- `node dashboard/cli.mjs status` — visa outputen

### 3. Sammanfatta för managern, i denna ordning
- Vad kräver hennes uppmärksamhet nu (blockers → sena → review-kön).
- Hur många annonser som är kvar att göra per produkt.
- Vilka produkter som ligger under creative-målet.
- Hur många som saknar Ansvarig i Notion.
- **En rad: vad hon ska göra härnäst.**

### 4. Publicera
Publicera `dashboard/index.html` som Artifact — **samma URL varje gång** så
managerns bokmärke fungerar. Committa och pusha den ombyggda filen.

Hitta aldrig på siffror. Allt kommer ur Notion, `dashboard/data/` och `products/products.json`.

## DEFINITION OF DONE
- [ ] Notion synkad (en fråga per skalningsprodukt, kommandot kört)
- [ ] `notion-import.mjs` och `build.mjs` körda
- [ ] Statusoutput visad
- [ ] Sammanfattning med blockers först + en konkret nästa-åtgärd
- [ ] Publicerad på samma URL, pushad
