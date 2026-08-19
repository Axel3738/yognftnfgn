# SOP-08: Körschema — ny produktbatch, från start till Notion

**Ersätter Google-dokumentet "Sop creative strategy new product".** Prompterna
som förr klistrades in från Google Docs är nu kommandon i repot — de uppdateras
varje gång vi lär oss något, så klistra **aldrig** in gamla prompts igen.

**För dig som kör:** du behöver inte kunna något tekniskt. Du skriver korta
kommandon som börjar med `/`, och Claude gör resten. Claude ska bara ställa
frågor när ett beslut kräver ägaren (pris, rabatt, target-CPA). Frågar den
något annat — svara: *"Ta reda på det själv först."*

---

## Stegen

### Steg 1 — Starta analysen
Öppna en **ny** Claude Code-session (modell: Fable, high). Skriv:

```
/forsta-batch <produktnamn>
```

Exempel: `/forsta-batch Lastnät`

*(Undantag: har produkten aldrig haft annonser och saknar data helt — skriv i
stället `/ny-produkt <produktnamn> <dagsbudget>`, se SOP-06.)*

Claude hittar själv landningssidan, kampanjen i Meta och raden i product
sheetet. **Fortsätt med steg 2 medan Claude jobbar.**

### Steg 2 — Ordna Drive-mappen
Gå till [produktmapparna i Drive](https://drive.google.com/drive/folders/16rA1SxQRevd9FNb8fnh4vRsukmVPEm4e)
och hitta produktens mapp. *(Är produkten en vinnare: flytta mappen till
winners-mappen.)*

Skapa två undermappar: **`Batch #1`** och **`Batch #2`**. Lägg allt befintligt
material (bilder, videor, filer) i `Batch #1`.

### Steg 3 — Ladda ner det Claude gjorde
När Claude är klar levererar den två zip-filer (video-briefer + bild-briefer).
Ladda ner, packa upp, och lägg allt i `Batch #2` — en mapp per annons, som i
[Loom-exemplet](https://www.loom.com/share/9c82d1c1d90a45b68616a3f4bfd0ffd3).

### Steg 4 — Kontrollera checklistan
Claude ska ha avslutat med en **"Definition of done"-checklista** med ✅/❌.

- Allt ✅ → gå vidare.
- Något ❌ → skriv: *"Fixa punkterna som är ❌ i din checklista."* Upprepa
  tills allt är ✅.

*(Det här ersätter gamla steg 5, "Claude kommer göra fel" — nu rättar den sig
mot sin egen lista i stället för att du ska upptäcka felen.)*

### Steg 5 — Ladda upp till Notion
Dela `Batch #2`-mappen som **Redigerare** (högerklicka → Dela → Alla med
länken → Redigerare) och kopiera länken. Skriv sedan **i samma chatt**:

```
/notion <produktens Notion-hub>, <länken till Batch #2>
```

Exempel: `/notion Boat cover 420D, https://drive.google.com/...`

Claude skapar ett item per annons (Draft, Pending Approval) med briefen
inklistrad **och en länk till just den annonsens brief-fil**. Kontrollera
checklistan igen som i steg 4.

### Steg 6 — Tracking-sheetet
Skriv i samma chatt:

```
/sheet <produkt-id>
```

Exempel: `/sheet lastnat`. Claude fyller i tracking-sheetet för produktens
alla annonser och skickar en färdig xlsx-fil. Kontrollera checklistan.

### Steg 7 — Dela sheetet
Importera xlsx-filen till Google Sheets, dela så att **alla med länken är
Redigerare**, och klistra in länken i produktens Notion-hub.

---

## Om något strular

- **Claude säger att Notion/Meta/Slack/Shopify inte svarar** → connectorn är
  inte kopplad i sessionen. Claude ska då säga exakt vad den skulle ha gjort —
  den får aldrig låtsas att det är gjort.
- **404 i Notion** = hubben är inte inbjuden till integrationen — inte att
  databasen saknas. (`•••` → Connections på hubbens sida.)
- **Fungerar något inte efter två försök:** ta en skärmdump och skicka till
  Axel. Godkänn aldrig en leverans där checklistan har ❌ kvar.
