# P7 – Ny testprodukt (första ads-batchen, Bäverbutiken)

**När:** En ny produkt ska börja testas (steg 4 i SOP-06). Används när det INTE
finns performance-data än — annars är det P1 som gäller.
**Hur:** Fyll i fälten, klistra in i en ny Claude Code-session i detta repo.

---

Vi ska börja testa en ny produkt för Bäverbutiken (bäverbutiken.se, ad account
MagiBorsten 1867947880635861).

**Produkt:** [PRODUKTNAMN från product sheetet]
**SKU / Drive-mapp:** [t.ex. TEMU-601100461940399 Lastnät]
**Startbudget:** [KR/DAG]
**Target-CPA:** [KR – fråga Axel om den inte är satt]

Gör följande, i ordning, utan att vänta på godkännande mellan stegen:

1. **Research:** Hämta produktsidan från Shopify (pris, varianter, beskrivning).
   Läs raden i product sheetet (kostnader, Note, AD ideas, konkurrentlänk).
   Sök Meta Ad Library på svenska söktermer i kategorin. Ingen performance-data
   finns – markera allt som hypotes.
2. **Första testbatchen:** 6 statiska koncept + 2 videokoncept med olika
   mekanismer (demo, problem/lösning, social proof-stil, offer, listicle,
   jämförelse). PLUS **de 2 extra adsen enligt SOP-06 regel 2** – stryk dem aldrig.
   Alla följer arbetsreglerna och leveransformatet i `prompts/P1-strategist-os.md`
   (engelska briefer, Swedish/English-tabeller, naming-struktur, zip-paketering).
   Priser i manus = priset på produktsidan, inget annat.
3. **Registrera i kvotsystemet:** lägg till produkten i `products/products.json`
   (id = slug, brand = "Bäverbutiken", ad_account_id, kampanj-ID när kampanjen
   finns, budget, target-CPA, cycle_start = launchdagen, status "aktiv").
   Kör `node pipeline/quota.mjs` och visa kvoten produkten får.
4. **Uppdatera product sheetet:** fyll i "Ads to do:" med batchens annonsnamn.
5. Committa och pusha ändringarna i repot.

## DEFINITION OF DONE

- [ ] Research redovisad med källor (Shopify, sheet, Ad Library) – inga påhittade insikter
- [ ] Minst 8 koncept + de 2 extra adsen, alla med hypotes och isolerad variabel
- [ ] Briefer på engelska med Swedish/English-tabeller, zip-paketerade
- [ ] Naming-strukturen följd, upptagna AD-ID:n avlästa i MagiBorsten-kontot
- [ ] Produkten registrerad i products.json + kvoten visad
- [ ] Product sheetets "Ads to do:" uppdaterad
- [ ] Ändringar pushade till repot
