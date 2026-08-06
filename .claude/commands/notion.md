# /notion – Ladda upp batchens briefer till Notion

Argument: `$ARGUMENTS` — produktens Notion-sida + (valfritt) länk till en befintlig
Drive-mapp. **Får du ingen mapplänk: skapa strukturen själv, fråga inte.**
Exempel: `/notion Boat cover 420D, https://drive.google.com/...`

Drive-strukturen (skapas av dig, inte av managern):

```
Batch #N/                      ← under samma förälder som förra batchen → delningen ärvs
  01_<annonsnamn>/  brief_<annonsnamn>.md
  02_<annonsnamn>/  brief_<annonsnamn>.md
  ...
  reference-assets/            ← vinnarbilder + ev. "do_not_repeat"-exempel
```

Lägg sedan upp batchen på produktens Notion-sida, **exakt enligt
`docs/os/NOTION-FORMAT.md`:**

- Ett item per annons i Pending Approval-vyn — aldrig flera annonser i samma item.
- Namn = annonsnamnet exakt (naming-strukturen), t.ex. `Enginecover_SP_6_H1`.
- Status **Draft**, tag **`Video - Pending Approval`** (även för bildannonser).
- **Itemets innehåll = bara Drive-länken till annonsens egen mapp. Ingen
  brieftext i Notion** — briefen ligger i mappen, tillsammans med assets.
  Format: `📁 [<annonsnamn> – brief + assets](<mapplänk>)`.
- Produkt + Batch ifyllt; Deadline och Ansvarig redigerare lämnas tomma.

Om Notion-MCP:n inte är ansluten: följ regeln i NOTION-FORMAT.md (säg det, lista
items som skulle skapats, låtsas aldrig).

## DEFINITION OF DONE
- [ ] Antal items = antal briefer i batchen (skriv båda talen)
- [ ] Drive-mapp skapad per annons + brief uppladdad i rätt mapp
- [ ] Alla i Draft + tag Video - Pending Approval
- [ ] Varje item innehåller bara sin Drive-länk (ingen brieftext)
- [ ] Item-namn = annonsnamn exakt
- [ ] Tabell annons → mapplänk visad för stickprov
