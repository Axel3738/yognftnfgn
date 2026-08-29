# SOP-08 – Ny produktbatch, från start till Notion (v3)

Ersätter Axels dokument "SOP: Ny produktbatch v2" och det äldre
"Sop creative strategy new product". Prompterna är kommandon i repot
(`.claude/commands/`) och uppdateras varje gång vi lär oss något —
klistra aldrig in gamla Google Docs-prompter igen.

Du behöver inte kunna något tekniskt. Claude gör numera hela kedjan,
inklusive Drive och Notion. Claude ska bara fråga när ett beslut kräver
Axel (pris, rabatt, target-CPA). Frågar den något annat — svara:
"Ta reda på det själv först."

## Hela flödet är två steg

**Steg 1 — Starta.** Öppna en ny Claude Code-session (modell: Fable, high)
och skriv:

    /forsta-batch <produktnamn>

Exempel: `/forsta-batch Lastnät`.
Undantag: har produkten aldrig haft annonser och saknar data helt —
skriv i stället `/ny-produkt <produktnamn> <dagsbudget>`.

Claude hittar själv landningssidan, kampanjen i Meta och produktens
Drive-mapp. Den gör analysen, skriver brieferna, skapar `Batch #N` i
Drive-mappen, delar den, och laddar upp allt till produktens Notion-hub.

**Steg 2 — Kontrollera checklistan.** Claude avslutar med en
"Definition of done"-lista med ✅/❌.

- Allt ✅ → klart. Redigerarna kan börja.
- Något ❌ → skriv: "Fixa punkterna som är ❌ i din checklista."
  Upprepa tills allt är ✅. Godkänn aldrig en leverans med ❌ kvar.

## Det som utgått

- **100k-/tracking-sheetet per produkt** (gamla steg 6–7). Axels beslut
  2026-08-29: ronden och `agent/budgetlogg.jsonl` spårar utfallet.
  `/sheet` finns kvar som separat kommando vid behov.
- **Manuella Drive-steg.** Claude skapar och delar batch-mappen själv.
  (Är produkten en vinnare och mappen ska flyttas till winners-mappen —
  det gör fortfarande en människa.)

## Annonsbehovet (triggern)

Den dagliga ronden flaggar själv när en produkt behöver nya annonser —
t.ex. när åtgärdstrappan pausat material eller en vinnare skalats flera
gånger. Behovet syns på dashboarden och i rondens rapport.

## Om något strular

- Claude säger att Notion/Meta/Drive inte svarar → kopplingen är inte
  ansluten i sessionen. Claude ska säga exakt vad den skulle ha gjort —
  aldrig låtsas att det är gjort.
- 404 i Notion = hubben är inte inbjuden till integrationen, inte att
  databasen saknas (`•••` → Connections på hubbens sida).
- Fungerar något inte efter två försök: skärmdump till Axel.
