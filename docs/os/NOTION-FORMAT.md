# Notion-formatet för briefer — gäller ALLA produkter, alltid likadant

Varje produkt har en egen Notion-databas (samma mall för alla produkter) med
flikarna **Guidelines & SOPs** och **Pending Approval**. Exempel som finns idag:
**"Boat cover 420D creative hub"** (Motorhöljet). Sök på produktnamnet i Notion
för att hitta rätt databas.
Brieferna ligger som items i Pending Approval-vyn.

## Varje annons = ETT item, exakt så här

| Fält | Värde |
|------|-------|
| **Namn** | Annonsnamnet exakt enligt naming-strukturen, t.ex. `Enginecover_SP_6_H1` |
| **Status** | `Draft` |
| **Tag** | `Video - Pending Approval` — **ALLTID denna tag, även för bildannonser** |
| **Innehåll** | Hela briefen ska vara tillgänglig inne i itemet: klistra in briefen som sidinnehåll OCH länka till brief-filen i Drive (editor-behörighet) |
| Produkt / Batch | Ifyllt |
| Deadline / Ansvarig redigerare | Lämnas tomt (sätts av managern) |

Ett item per annons — aldrig ett item per batch, aldrig flera annonser i samma item.

## Vad Notions statusar betyder (viktigt — gissa aldrig)

| Notion-status | Betyder | I dashboarden |
|---------------|---------|---------------|
| `Draft` | Brief finns, ingen har börjat | Planerad |
| `In progress` | Redigeraren gör **första versionen** | Pågår |
| `In progress 2` | Har varit inne, **fått revision** och görs om | Pågår + ↺ Revision (räknas i revision rate) |
| `Creative strat review` | Ligger hos CS för bedömning. **OPS-hubbar sedan 2026-09-13:** CS är leveransrundan `/ops-leverans` — en rad med butikens eget prefix och fil tas live därifrån utan att någon flyttar den (Axels beslut). Rader med Bäverbutikens prefix i den statusen är parkerade och rörs inte | Granskning |
| `To be Reviewed` / `In Review` | Väntar på managerns granskning | Granskning |
| `Approved` | Godkänd | Godkänd — räknas mot kvoten |

**`In progress 2` är inte "längre kommen än In progress".** Den är en omgörning —
annonsen underkändes en gång. Många sådana samtidigt är en kvalitetssignal, inte
en produktivitetssignal.

## Livscykeln för ett item

```
Draft + "Video - Pending Approval"   ← skapas av /cs, /ny-produkt, /forsta-batch, /koncept AKUT, /ugc
        ↓ redigeraren tar tasken och levererar (Slack)
/checkin kör kontrollfrågorna
        ↓ godkänd
Klar – Godkänd (grön)                ← enda statusbytet Claude gör, och bara via /checkin
```

Claude ändrar aldrig status åt andra hållet och raderar aldrig items — fel i ett
item rättas i itemet.

## Om Notion-MCP:n inte är ansluten i sessionen

**Finns `NOTION_TOKEN` i miljön går uppladdningen ändå** (2026-09-22):

```bash
node tools/notion-brief-upp.mjs <brief.md> --hub <database-id> [--typ video|bild] [--idag YYYY-MM-DD] [--ersatt] [--torr]
```

Exit 2 = namnet finns redan (utan `--ersatt`), exit 3 = tillbakaläsningen
skiljer sig från det som skickades (sidan finns men är ofullständig), exit 1 =
allt annat. `--idag` sätter `Skapad` (standard: dagens datum i Stockholm).

Den skriver raden exakt i formen ovan (Namn, `Draft`, Pending Approval-typen,
Landing page, Skapad) med HELA briefen som sidinnehåll — rubriker, tabeller
med kolumnhuvud, punkter, och **varje nyckelrad (`Why:`, `AI content:`,
`Reference ads:` …) som eget block**, för spärren läser Notion-texten med
radstart-ankrade uttryck (mätt 2026-09-22: ihopslagna rader gav tre
anmärkningar som filen inte hade) — och läser tillbaka kroppen efteråt:
stämmer inte blockräkningen skrivs FEL, aldrig "klart". Den **vägrar** om
namnet redan finns i hubben (exit 2): en brief som redan ligger i Notion är
utförd, och en rad till är en dubblett. Är briefen omskriven byter `--ersatt`
ut kroppen på raden som finns (samma id, Status, Ansvarig och kommentarer
kvar). Ansvarig och Prioritet sätts aldrig — de är managerns.

Saknas både MCP och token: säg det rakt ut, lista exakt vilka items som skulle
ha skapats (namn + innehåll), och leverera resten. Låtsas aldrig att
uppladdningen är gjord.
