# /ny-produkt – Första testbatchen för ny produkt (innan performance-data finns)

Argument: `$ARGUMENTS` — produktnamn + startbudget + ev. target-CPA.
Exempel: `/ny-produkt Lastnät 500 kr/dag target 250`

Används vid steg 4 i `docs/os/SOP-06-produkttest.md`. Finns redan performance-data är det `/forsta-batch` som gäller. Ad account: **MagiBorsten `1867947880635861`**.

Gör i ordning, utan att invänta godkännande:

1. **Produktunderlaget FÖRST — innan ett enda koncept skrivs** (Evolve, Axels
   beslut 2026-09-21). Två filer per produkt:
   ```bash
   node tools/produktunderlag.mjs --skapa <id> --sida <produktsidans url>
   # fyll varje [FYLL I] i products/<id>/produkt.md och products/<id>/avatar.md
   node tools/produktunderlag.mjs --granska <id>
   ```
   `produkt.md` bär Evolves produktförståelse (företaget, produkten, fysiska
   och funktionella detaljer, **mekanismen**, benefits/advantages/claims var
   för sig, use cases). `avatar.md` bär varför-kedjan (kärnbegäret efter 3–5
   "varför", smärtpunkter, vad de tror om marknaden och om sitt eget problem,
   invändningar, identitet, tre sub-avatarer). Verktyget fyller i det som går
   att läsa maskinellt ur produktsidan; resten skriver sessionen.
   **Mekanismen är ett hårt stopp** — exit 1, och då skrivs INGEN brief. Övriga
   fält ger anmärkning och batchen får ändå gå ut.
   *(Skälet till att bara mekanismen stoppar: mätt 2026-09-21 på 68 av
   Bäverbutikens produktsidor — 31 döda produkter och 37 levande — förklarar
   noll av 68 varför produkten fungerar, och ingen annan sida-signal skilde
   döda från levande. Mätningen är OBESVARAD, inte negativ: produktsidorna
   skriver vi själva efter produktvalet, så den visar att underlaget aldrig
   fanns — inte att det saknar värde.)*
   Filerna är produktens stabila minne och skrivs ALDRIG om av en `/cs`-körning.
   `dna.md` är prestandaminnet och är en annan sak.
2. **Research:** produktsidan via Shopify (pris, varianter), raden i product sheetet (kostnader, Note, AD ideas, konkurrentlänk — länk i SOP-06), Meta Ad Library på svenska söktermer. Allt är hypotes — markera det.
3. **Första testbatchen:** 6 statiska (demo, problem/lösning, social proof-stil, offer, listicle, jämförelse) + 2 videokoncept. Leveransformat, naming och arbetsregler enligt `.claude/commands/forsta-batch.md`. Priser = produktsidans pris.
   **Copy/voiceover via subagent med `model: "sonnet"`** (`"haiku"` för bulkvarianter); strategi i huvudsessionen.
   **Hard rule i varje brief: annonsen nämner aldrig butikens namn** (Axels beslut 2026-09-18, `docs/copy-regler.md`) — annonserna speglas till OPS-butikerna och ska gå att återanvända utan att göras om.
4. **De 2 extra adsen — OVANPÅ batchen, stryks aldrig** (full spec i `docs/os/SOP-06-produkttest.md`, avsnittet "De 2 extra adsen"):
   - **Rå leverantörsvideo:** ladda ner en av leverantörens produktvideor som den är — originalmusik, **ingen voiceover, ingen text, ingen redigering**. Namnges som **PD** med hook-ID.
   - **Ren produktbild utan text:** produkten exakt som den är, **ingen text-overlay**. Namnges som **PD** med variantsiffra.
   - Minimal brief för båda (källfil/länk + exportformat + annonsnamn) med raden "NO text overlay, NO voiceover, use as-is". Ingen copy-produktion → ingen subagent behövs.
5. **Registrera:** lägg till produkten i `products/products.json` (id-slug, brand "Bäverbutiken", ad_account_id, kampanj-ID när den finns, budget, target-CPA — saknas target-CPA: fråga ägaren, det är ett ägarbeslut; cycle_start = launchdagen). Skapa `products/<id>/` (dna.md med research-hypoteserna, batch-log.md, backlog.md). Kör `node pipeline/quota.mjs`.
6. **Product sheetet:** fyll i "Ads to do:" med batchens annonsnamn.
7. Committa och pusha.

## DEFINITION OF DONE
- [ ] `products/<id>/produkt.md` + `avatar.md` skapade och granskade — `--granska` gav exit 0
- [ ] Mekanismen ifylld (hårt stopp; utan den skrevs ingen brief)
- [ ] Research med källor — inga påhittade insikter
- [ ] 8 koncept, alla med hypotes och isolerad variabel
- [ ] De 2 extra adsen med — rå leverantörsvideo (PD) + textfri produktbild (PD), båda märkta "use as-is"
- [ ] Copy via sonnet/haiku-subagent
- [ ] Briefer engelska + Swedish/English-tabeller, zip-paketerade
- [ ] Naming: lediga AD-ID:n avlästa i MagiBorsten
- [ ] products.json + products/<id>/ skapade, kvot visad
- [ ] "Ads to do:" uppdaterad i sheetet
- [ ] Pushad
