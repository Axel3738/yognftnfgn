# /cs – Återkommande creative strategy på senaste annonserna

Argument: `$ARGUMENTS` — produkt-id (från `products/products.json`), och valfritt egna idéer/instruktioner efter produkt-id:t.
Exempel: `/cs motorholjet` eller `/cs motorholjet testa en vinkel mot båtägare, och gör en variant av vinnaren med äldre man`.

Detta är kärnloopen: körs återkommande (normalt var 3:e dag per produkt) i produktens chatt eller en ny session — allt minne ligger i `products/<id>/`, inte i chatten.

## Gör följande, hela kedjan utan att invänta godkännande

### 1. Läs läget
- Produktens rad i `products/products.json` (ad account = **MagiBorsten 1867947880635861**, kampanjer, budget, target-CPA).
- `products/<id>/dna.md` (Creative DNA), `products/<id>/batch-log.md` (tidigare batcher + hypoteser), `products/<id>/backlog.md` (väntande koncept/swipes). Saknas filerna: skapa dem nu.
- Kör `node pipeline/quota.mjs` — kvoten bestämmer batchstorleken.

### 2. Feedbackloop på senaste annonserna (detta är poängen med kommandot)
- Hämta performance från Ads Manager för alla annonser sedan senaste batch-loggen: spend, köp, CPA, ROAS, CTR, hook rate, hold. Färsk daglig budget hämtas samtidigt — uppdatera products.json om den ändrats.
- Klassificera: Bevisad vinnare / Lovande / Osäker (<300 kr spend eller <3 köp — ingen dom) / Förlorare.
- **Stäm av mot hypoteserna i batch-log.md:** för varje annons i förra batchen, skriv utfallet — höll hypotesen eller inte, och varför (data, inte tyckande).
- **Uppdatera `products/<id>/dna.md`:** flytta bekräftade mönster till Winning/Losing DNA, markera vad som fortfarande är hypotes. DNA-filen är produktens ackumulerade minne — skriv den så att nästa session förstår utan kontext.

### 3. Bygg nästa batch
- Antal = minst kvoten per 3-dagarscykel för produkten.
- Mix: iterationer på vinnarna (isolerad variabel per iteration) + nya koncept från Losing DNA-lärdomar + **alla väntande items i backlog.md** (markera dem `[använd i batch #N]`) + det jag skickade med i argumenten ovan.
- Varje annons: hypotes, vad som behålls/ändras, format, exakt hook, komplett brief enligt leveransformatet i `.claude/commands/forsta-batch.md` (engelska briefer, `Swedish (use this) | English meaning`-tabeller, naming-strukturen, upptagna AD-ID:n avlästa i kontot).

### 4. Modellpolicy (obligatorisk)
- **All slutgiltig ad copy, alla svenska manusrader och voiceovers skrivs av en subagent via Agent-verktyget med `model: "sonnet"`** (eller `"haiku"` för bulkvarianter av samma line). Skicka subagenten: produktens DNA, hypotesen, hooken och formatkraven — den skriver bara text, inga strategibeslut.
- Strategi, analys, klassificering och briefstruktur görs av huvudsessionen (Fable/Opus). Aldrig tvärtom.

### 5. Leverera och logga
- Rapport: kort feedbackloop-sammanfattning (vad lärde vi oss), sedan batchen.
- Zip-paketera brieferna (video + image) som i forsta-batch-kommandot.
- Lägg batchen i Notion som Draft – Pending approval (om Notion-MCP saknas i sessionen: säg det och leverera resten).
- Skriv batchen i `products/<id>/batch-log.md` med datum + hypotes per annons.
- Committa och pusha alla ändringar i `products/`.

## DEFINITION OF DONE (markera ✅/❌ sist)

- [ ] Feedbackloop körd: varje annons i förra batchen har fått sitt utfall loggat i batch-log.md
- [ ] dna.md uppdaterad (data skild från hypotes)
- [ ] Backlog-items inkluderade och markerade som använda
- [ ] Batchstorlek ≥ kvoten (quota-output visad)
- [ ] Copy/voiceover skriven av sonnet/haiku-subagent, strategi av huvudmodellen
- [ ] Briefer på engelska, naming korrekt, zip-paketerade
- [ ] Batch-log + ev. budgetändring committad och pushad
