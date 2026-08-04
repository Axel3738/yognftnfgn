# SOP-01: Batch-loopen — ny batch ads för en produkt

**Ägare:** Managern. **Frekvens:** Var gång kvoten (SOP-02) kräver en ny batch, normalt var 3:e dag per aktiv produkt.
**Tid:** ~30 min egen tid + Claude jobbar själv däremellan.

Detta är v2 av "Sop creative strategy new product" — samma flöde, men prompterna
ligger nu versionerade i `prompts/`-mappen i detta repo i stället för i Google Docs,
och varje prompt slutar med en checklista som Claude måste bocka av. Ändras en
prompt: ändra filen i repot, committa — då kör alla framtida sessioner den nya versionen.

## Steg

**1. Starta analysen.**
Öppna en ny Claude Code-session (Fable, high) i detta repo. Öppna `prompts/P1-strategist-os.md`,
fyll i produktnamn/URL/kampanjnamn/batch-nummer, klistra in. Claude kör hela kedjan själv.
→ *Fortsätt med steg 2 medan Claude jobbar.*

**2. Ordna Drive-mappen.**
Gå till produktmappen i Drive ([produktmappar](https://drive.google.com/drive/folders/16rA1SxQRevd9FNb8fnh4vRsukmVPEm4e?usp=sharing)).
Är produkten en vinnare: flytta den till winners-mappen. Skapa `Batch #1`, `Batch #2` osv.
Lägg allt befintligt material i `Batch #1`.

**3. Granska Claudes leverans mot checklistan.**
När Claude är klar ska svaret sluta med "Definition of done"-checklistan, allt ✅.
Något ❌ eller saknas? Svara: *"Checklistan i prompten är inte uppfylld. Fixa punkt X."*
Ladda INTE ner något förrän checklistan är grön.

**4. Ladda upp till Drive.**
Ladda ner rapport + zip-filer, packa upp och lägg i `Batch #2`-mappen
(exempel: [Loom](https://www.loom.com/share/9c82d1c1d90a45b68616a3f4bfd0ffd3)).
Dela mappen med editor-behörighet.

**5. Notion.**
Öppna `prompts/P2-notion-upload.md`, fyll i Notion-namn + Batch-mappens länk,
klistra in i SAMMA session. Kontrollera checklistan.

**6. Tracking-sheet.**
Klistra in `prompts/P3-tracking-sheet.md` i samma session. Importera den levererade
xlsx-filen till Google Sheets, dela som editor, lägg länken i produktens Notion.

**7. Logga kvoten.**
När annonserna sen faktiskt launchas i Ads Manager: kör `prompts/P5-quota-update.md`.
Batchen räknas inte förrän annonserna är live — briefer på hög är inte kvotuppfyllnad.

## Om Claude strular

Se `docs/os/SOP-05-nar-claude-inte-lyssnar.md`. Kortversionen: peka på prompten och
checklistan, be aldrig om "gör om allt" — be om den specifika punkten.
