# /notion – Ladda upp batchens briefer till Notion

Argument: `$ARGUMENTS` — produktens Notion-sida + länk till Drive-mappen "Batch #X" (delad som editor).
Exempel: `/notion Boat cover 420D, https://drive.google.com/...`

Ladda upp alla briefer i den angivna batch-mappen till produktens Notion-sida,
**exakt enligt `docs/os/NOTION-FORMAT.md`:**

- Ett item per annons i Pending Approval-vyn — aldrig flera annonser i samma item.
- Namn = annonsnamnet exakt (naming-strukturen), t.ex. `Enginecover_SP_6_H1`.
- Status **Draft**, tag **`Video - Pending Approval`** (även för bildannonser).
- Briefen tillgänglig i itemet: hela briefen inklistrad som sidinnehåll + länk
  till brief-filen i Drive.
- Produkt + Batch ifyllt; Deadline och Ansvarig redigerare lämnas tomma.

Om Notion-MCP:n inte är ansluten: följ regeln i NOTION-FORMAT.md (säg det, lista
items som skulle skapats, låtsas aldrig).

## DEFINITION OF DONE
- [ ] Antal items = antal briefer i mappen (skriv båda talen)
- [ ] Alla i Draft + tag Video - Pending Approval
- [ ] Briefen läsbar INNE i varje item (inte bara en länk)
- [ ] Item-namn = annonsnamn exakt
- [ ] Lista över skapade items visad för stickprov
