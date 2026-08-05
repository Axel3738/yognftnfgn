# /cs – Återkommande creative strategy på senaste annonserna

Argument: `$ARGUMENTS` — produkt-id (från `products/products.json`), och valfritt egna idéer/instruktioner efter produkt-id:t.
Exempel: `/cs motorholjet` eller `/cs motorholjet testa en vinkel mot båtägare, och gör en variant av vinnaren med äldre man`.

Detta är kärnloopen: körs återkommande (normalt var 3:e dag per produkt) i produktens chatt eller en ny session — allt minne ligger i `products/<id>/`, inte i chatten.

## Gör följande, hela kedjan utan att invänta godkännande

### 1. Läs läget
- Produktens rad i `products/products.json` (ad account = **MagiBorsten 1867947880635861**, kampanjer, budget, target-CPA).
- `products/<id>/dna.md` (Creative DNA), `products/<id>/batch-log.md` (tidigare batcher + hypoteser), `products/<id>/backlog.md` (väntande koncept/swipes).
- Kör `node pipeline/quota.mjs` — kvoten bestämmer batchstorleken.

### 1b. Saknas minnesfilerna? Kör upphämtning FÖRST (engångsjobb per produkt)

Produkter som redan kört flera batcher innan OS:et fanns har inget `products/<id>/`.
Skapa det då från kontodatan innan du går vidare — hoppa aldrig över detta och
bygg aldrig en batch på tom historik:

- Hämta **alla** annonser för produkten i MagiBorsten (hela livstiden, inte bara
  senaste perioden) med spend, köp, CPA, ROAS, CTR, hook rate, hold + creatives
  (copy, rubrik, format, bild-/video-ID). Granska de statiska bilderna visuellt.
- Gruppera dem i batcher efter launchdatum och namngivning så gott det går, och
  skriv `batch-log.md` retroaktivt. **Markera tydligt att hypoteserna inte
  loggades i förväg** — skriv `hypotes: ej loggad (retroaktiv rekonstruktion)`
  i stället för att gissa vad någon tänkte. Utfallen är däremot riktig data.
- Bygg `dna.md` av det: Winning DNA / Losing DNA / obevisat, med data skild från
  hypotes. Detta blir produktens startminne.
- Skapa en tom `backlog.md`.
- Säg i svaret att upphämtning kördes och för hur många annonser.

Nästa `/cs` på produkten hoppar över detta steg och kör den vanliga loopen.

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
- Lägg batchen i Notion exakt enligt `docs/os/NOTION-FORMAT.md`: ett item per annons, namn = annonsnamnet, status Draft, tag `Video - Pending Approval` (även bilder), briefen inklistrad i itemet + Drive-länk.
- Skriv batchen i `products/<id>/batch-log.md` med datum + hypotes per annons.
- Committa och pusha alla ändringar i `products/`.

## DEFINITION OF DONE (markera ✅/❌ sist)

- [ ] Minnesfilerna fanns — eller upphämtning (1b) kördes och redovisades
- [ ] Feedbackloop körd: varje annons i förra batchen har fått sitt utfall loggat i batch-log.md
- [ ] dna.md uppdaterad (data skild från hypotes)
- [ ] Backlog-items inkluderade och markerade som använda
- [ ] Batchstorlek ≥ kvoten (quota-output visad)
- [ ] Copy/voiceover skriven av sonnet/haiku-subagent, strategi av huvudmodellen
- [ ] Briefer på engelska, naming korrekt, zip-paketerade
- [ ] Batch-log + ev. budgetändring committad och pushad
