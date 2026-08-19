# /notion – Ladda upp batchens briefer till Notion

> **Innan du frågar användaren något:** fråga dig själv om det finns ett sätt att
> ta reda på svaret som du inte provat än — repo + git-historik, Drive, Notion,
> Meta, Shopify, product sheetet. Fråga bara när svaret kräver ägaren (pris,
> rabatt, target-CPA). Den som kör kan vara helt icke-teknisk: en fråga i taget,
> enkel svenska utan fackord, och ge alltid ett rekommenderat svar att säga ja till.

Argument: `$ARGUMENTS` — produktens Notion-sida + länk till Drive-mappen "Batch #X" (delad som editor).
Exempel: `/notion Boat cover 420D, https://drive.google.com/...`

Ladda upp alla briefer i den angivna batch-mappen till produktens Notion-sida,
**exakt enligt `docs/os/NOTION-FORMAT.md`:**

- Ett item per annons i Pending Approval-vyn — aldrig flera annonser i samma item.
- Namn = annonsnamnet exakt (naming-strukturen), t.ex. `Enginecover_SP_6_H1`.
- Status **Draft**, tag **`Video - Pending Approval`** (även för bildannonser).
- Briefen tillgänglig i itemet: hela briefen inklistrad som sidinnehåll + länk.
- **Länken i varje item går till just DEN annonsens brief-fil i Drive** — aldrig
  bara mapplänken, aldrig samma länk i flera items. Öppna Drive-mappen, matcha
  varje brief-fil mot sitt item på annonsnamnet, och verifiera att varje länk
  pekar på rätt fil innan du skriver in den.
- Produkt + Batch ifyllt; Deadline och Ansvarig redigerare lämnas tomma.

Hitta rätt själv innan du frågar:

- Hittar du inte databasen på det angivna namnet: sök i Notion på produktnamnet
  (svenskt OCH engelskt) och på "creative hub" innan du frågar användaren.
- **404 från en hub betyder "inte inbjuden", inte "databasen saknas"** — säg det
  och be användaren bjuda in integrationen (`•••` → Connections), gissa aldrig.
- Är Drive-länken inte delad som editor: säg exakt hur den delas
  (högerklicka → Dela → Alla med länken → Redigerare) i stället för att stanna.

Om Notion-MCP:n inte är ansluten: följ regeln i NOTION-FORMAT.md (säg det, lista
items som skulle skapats, låtsas aldrig).

## DEFINITION OF DONE
- [ ] Antal items = antal briefer i mappen (skriv båda talen)
- [ ] Alla i Draft + tag Video - Pending Approval
- [ ] Briefen läsbar INNE i varje item (inte bara en länk)
- [ ] **Varje item länkar till sin egen brief-fil** — visa 3 stickprov: itemnamn → länkad fil
- [ ] Item-namn = annonsnamn exakt
- [ ] Lista över skapade items visad för stickprov
