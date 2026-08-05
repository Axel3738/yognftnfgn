# /notion – Ladda upp batchens briefer till Notion

Argument: `$ARGUMENTS` — Notion-databasens namn + länk till Drive-mappen "Batch #X" (delad som editor).
Exempel: `/notion Bäverbutiken Creative Tasks, https://drive.google.com/...`

Ladda upp alla briefer i den angivna batch-mappen till Notion-databasen:

- Ett item per brief/skript, döpt exakt som annonsnamnet (naming-strukturen).
- Status: **Draft – Pending approval** på alla.
- Egenskaper: Produkt, Batch-nummer, Typ (Video/Bild), Koncept (PD/SP/SO), Deadline (tom – sätts senare), Ansvarig redigerare (tom).
- I varje item: länk till just den briefen i Drive (editor-behörighet).

Om Notion-MCP:n inte är ansluten i sessionen: säg det direkt i stället för att låtsas.

## DEFINITION OF DONE

- [ ] Antal items = antal briefer i mappen (skriv båda talen)
- [ ] Alla i Draft – Pending approval
- [ ] Varje item länkar till SIN brief (inte mappen)
- [ ] Item-namn = annonsnamn exakt
- [ ] Lista över skapade items visad för stickprov
