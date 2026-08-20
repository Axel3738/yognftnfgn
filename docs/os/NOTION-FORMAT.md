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
| `Creative strat review` | Ligger hos CS för bedömning | Granskning |
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

Säg det rakt ut, lista exakt vilka items som skulle ha skapats (namn + innehåll),
och leverera resten. Låtsas aldrig att uppladdningen är gjord.
