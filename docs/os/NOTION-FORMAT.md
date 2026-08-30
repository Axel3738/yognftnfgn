# Notion-formatet för briefer — gäller ALLA produkter, alltid likadant

Varje produkt har en egen Notion-databas med flikarna **Guidelines & SOPs**
och **Pending Approval**. Sök på produktnamnet i Notion för att hitta rätt
databas. Brieferna ligger som items i Pending Approval-vyn.

**Ny hub skapas ALDRIG från grunden:** duplicera den tomma mallen
**"Creative hub MALL"** (`3cc270ab-908c-8005-a50e-db6b1b179794`) — den bär
engelska statusar, alla vyer och teamspace-platsen. Full procedur i
`/rond-auto` steg 4b. **Allt som skrivs i Notion är på engelska** —
redigerarna läser inte svenska.

## Varje annons = ETT item, exakt så här

| Fält | Värde |
|------|-------|
| **Namn** | Annonsnamnet exakt enligt naming-strukturen, t.ex. `Enginecover_SP_6_H1` |
| **Status** | `Draft` |
| **Tag** | `Video - Pending Approval` för video, `Image - Pending Approval` för bild (Axels mall 2026-08-30). ⚠️ ÄLDRE hubbar saknar Image-typen — där används `Video - Pending Approval` för allt, precis som förr |
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
