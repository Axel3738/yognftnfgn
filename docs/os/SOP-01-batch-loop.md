# SOP-01: Första batchen efter produktlaunch (+ produktens chatt)

**Ägare:** Managern. **När:** EN gång per produkt — efter att produkten launchats
med original-adsen (SOP-06) och samlat data, när det är dags för första riktiga
iterations-batchen.

**Syftet är dubbelt:** (1) bygga Batch #2 utifrån verklig data, och (2) skapa
**produktens Claude-chatt** som sedan används för allt löpande arbete med produkten
— framför allt creative strategy. Chatten är hemmabasen, men allt minne (Creative
DNA, batch-logg, idé-backlog) skrivs till `products/<id>/` i repot, så om chatten
tappas bort går inget förlorat — en ny session läser upp läget själv.

## Steg

**1. Starta produkt-chatten.**
Ny Claude Code-session i detta repo (Fable 5 high). Skriv:
```
/forsta-batch Produktnamn
```
Claude slår själv upp landningssida, kampanj och product sheet-raden, och kör hela
analysen + bygger brieferna. → *Fortsätt med steg 2 medan Claude jobbar.*

**2. Ordna Drive-mappen.**
[Produktmapparna i Drive](https://drive.google.com/drive/folders/16rA1SxQRevd9FNb8fnh4vRsukmVPEm4e?usp=sharing).
Vinnare? Flytta produktmappen till winners-mappen. Skapa `Batch #1` och `Batch #2`,
lägg allt befintligt material i `Batch #1`.

**3. Granska mot checklistan.**
Claudes svar ska sluta med "Definition of done", allt ✅. Något ❌?
Svara: *"Checklistan är inte uppfylld. Fixa punkt X."* Ladda inte ner något innan
den är grön.

**4. Ladda upp till Drive.**
Ladda ner rapport + zip-filer, packa upp i `Batch #2`-mappen
([exempel-Loom](https://www.loom.com/share/9c82d1c1d90a45b68616a3f4bfd0ffd3)).
Dela mappen som editor.

**5. Notion.** I samma chatt:
```
/notion Databasens namn, [länk till Batch #2-mappen]
```

**6. Tracking-sheet.** I samma chatt:
```
/sheet produkt-id
```
Importera xlsx-filen till Google Sheets, dela som editor, länka i produktens Notion.

**7. Logga när annonserna launchas.**
```
/logga produkt-id antal
```
Batchen räknas mot kvoten först när annonserna är live i Ads Manager.

## Efter detta: det löpande arbetet i produkt-chatten

| Vad du vill | Skriv |
|-------------|-------|
| Ny CS-runda på senaste annonserna (var 3:e dag) | `/cs produkt-id` + ev. egna idéer |
| Slänga in ett koncept eller en swipe till nästa batch | `/koncept produkt-id idén...` (`AKUT` sist om den ska göras direkt) |
| Daglig koll | `/checkin produkt-id` |

Strular Claude: `docs/os/SOP-05-nar-claude-inte-lyssnar.md`.
