# /ny-produkt – Första testbatchen för ny produkt (innan performance-data finns)

> **Innan du frågar användaren något:** fråga dig själv om det finns ett sätt att
> ta reda på svaret som du inte provat än — repo + git-historik, Drive, Notion,
> Meta, Shopify, product sheetet. Fråga bara när svaret kräver ägaren (pris,
> rabatt, target-CPA). Den som kör kan vara helt icke-teknisk: en fråga i taget,
> enkel svenska utan fackord, och ge alltid ett rekommenderat svar att säga ja till.

Argument: `$ARGUMENTS` — produktnamn + startbudget + ev. target-CPA.
Exempel: `/ny-produkt Lastnät 500 kr/dag target 250`

Används vid steg 4 i `docs/os/SOP-06-produkttest.md`. Finns redan performance-data är det `/forsta-batch` som gäller. Ad account: **MagiBorsten `1867947880635861`**.

Gör i ordning, utan att invänta godkännande:

1. **Research:** produktsidan via Shopify (pris, varianter), raden i product sheetet (kostnader, Note, AD ideas, konkurrentlänk — länk i SOP-06), Meta Ad Library på svenska söktermer. Allt är hypotes — markera det.
2. **Första testbatchen:** 6 statiska (demo, problem/lösning, social proof-stil, offer, listicle, jämförelse) + 2 videokoncept. Leveransformat, naming och arbetsregler enligt `.claude/commands/forsta-batch.md`. Priser = produktsidans pris.
   **Copy/voiceover via subagent med `model: "sonnet"`** (`"haiku"` för bulkvarianter); strategi i huvudsessionen.
3. **De 2 extra adsen — OVANPÅ batchen, stryks aldrig** (full spec i `docs/os/SOP-06-produkttest.md`, avsnittet "De 2 extra adsen"):
   - **Rå leverantörsvideo:** ladda ner en av leverantörens produktvideor som den är — originalmusik, **ingen voiceover, ingen text, ingen redigering**. Namnges som **PD** med hook-ID.
   - **Ren produktbild utan text:** produkten exakt som den är, **ingen text-overlay**. Namnges som **PD** med variantsiffra.
   - Minimal brief för båda (källfil/länk + exportformat + annonsnamn) med raden "NO text overlay, NO voiceover, use as-is". Ingen copy-produktion → ingen subagent behövs.
4. **Registrera:** lägg till produkten i `products/products.json` (id-slug, brand "Bäverbutiken", ad_account_id, kampanj-ID när den finns, budget, target-CPA — saknas target-CPA: fråga ägaren, det är ett ägarbeslut; cycle_start = launchdagen). Skapa `products/<id>/` (dna.md med research-hypoteserna, batch-log.md, backlog.md). Kör `node pipeline/quota.mjs`.
5. **Product sheetet:** fyll i "Ads to do:" med batchens annonsnamn.
6. Committa och pusha.

## DEFINITION OF DONE
- [ ] Research med källor — inga påhittade insikter
- [ ] 8 koncept, alla med hypotes och isolerad variabel
- [ ] De 2 extra adsen med — rå leverantörsvideo (PD) + textfri produktbild (PD), båda märkta "use as-is"
- [ ] Copy via sonnet/haiku-subagent
- [ ] Briefer engelska + Swedish/English-tabeller, zip-paketerade
- [ ] Naming: lediga AD-ID:n avlästa i MagiBorsten
- [ ] products.json + products/<id>/ skapade, kvot visad
- [ ] "Ads to do:" uppdaterad i sheetet
- [ ] Pushad
