# Notion-formatet för briefer — gäller ALLA produkter, alltid likadant

Varje produkt har en egen Notion-sida (samma mall för alla produkter, t.ex.
"Boat cover 420D") med flikarna **Guidelines & SOPs** och **Pending Approval**.
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
