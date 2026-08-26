# SOP-06: Produkttest-pipeline (Bäverbutiken)

**Ägare:** Managern (körning) + Axel (produktval tills det delegerats).
**Källa:** "Product testing document" (v1 var en PDF med Loom-länkar — detta är
den versionerade textversionen; Loomarna länkas nedan tills innehållet är
transkriberat).

Bäverbutiken är en general store: vi launchar många billiga produkter, testar med
en första ads-batch, och skalar det som visar köpsignal. Allt sker i ad account
**MagiBorsten `1867947880635861`**.

## Källor (source of truth)

| Vad | Var |
|-----|-----|
| **Product sheet** (alla produkter: SKU, handle, status, kostnader, footage, konkurrenter, ad-idéer, "Ads to do", "Finished ads") | [Supplier Quotation Sheet](https://docs.google.com/spreadsheets/d/1-3WhCbzNRqEEsjoH_JLWU4D1sjVPNSuAM5xMtnH0Pxs/edit?usp=sharing) |
| **Drive** (en mapp per produkt) | [Produktmappar](https://drive.google.com/drive/folders/16rA1SxQRevd9FNb8fnh4vRsukmVPEm4e?usp=sharing) |
| Process-Looms (pt 1–3 + uppdateringar) | [Doc med länkar](https://docs.google.com/document/d/1kxQ1Lson9VcgxhkpRF-MPsFxtS4e28MWQxd9ppk6h8k/edit) · [Pt 2](https://www.loom.com/share/4adbc75d62d14c2d8058fa8c2ae2f57f) · [Uppdaterad process](https://www.loom.com/share/a8782ddb97fb4ca1b7e2866206b45d2e) |
| "2 extra ads"-regeln | [Loom](https://www.loom.com/share/89a9657095db40469f7083002f46ffff) |
| "How it should look" | [Loom](https://www.loom.com/share/d1ffc5e2403141bf82b58409d736ebfe) |
| "What product is next?" | [Loom](https://www.loom.com/share/a8782ddb97fb4ca1b7e2866206b45d2e) |

## Regler

1. **Drive-mappens namn = SKU + referensnamn på slutet.**
   Exempel: `TEMU-601100461940399 Lastnät`. Alltid — det är så redigerare och
   Claude hittar rätt material utan att kunna svenska produktnamn utantill.
2. **Varje produkttest får 2 extra ads utöver allt annat** — se
   "De 2 extra adsen" nedan. De räknas in i kvoten men får aldrig strykas för
   att batchen "redan är stor", och de ersätter aldrig en planerad annons.
3. **Product sheetets kolumner "AD ideas", "Ads to do:" och "Finished ads" hålls
   uppdaterade** — det är testköns minne. En produkt utan ifylld "Ads to do" är
   inte redo att launchas.
4. **När en testprodukt visar köpsignal** (håller target-CPA efter ≥300 kr spend
   / 3 köp): flytta produkten till winners-mappen i Drive, registrera den i
   `products/products.json` (`/ny-produkt` gör det), och kör därefter batch-loopen (SOP-01)
   var 3:e dag som för alla aktiva produkter.
5. **När ett test dödas:** pausa kampanjen, sätt status i products.json till
   `"pausad"`, skriv en rad i product sheetets Note-kolumn om varför (så vi inte
   testar om samma produkt utan ny hypotes).

## Flödet för en ny testprodukt

1. Välj nästa produkt — kör **`/produkt jaga <nisch>`** för att hitta kandidater och **`/produkt <namn>`** för att döma av en. Kriterierna står i `docs/os/PRODUKTKRITERIER.md`; minnet i `products/kandidater.json`. Endast produkter med domen `GO` går vidare till steg 2.
2. Kontrollera i product sheetet: kostnader ifyllda, footage-länk finns,
   "Ads to do" ifylld. Saknas något → fixa först.
3. Skapa/kontrollera Drive-mappen (`SKU Referensnamn`), lägg allt material i
   `Batch #1`.
4. Skriv `/ny-produkt Produktnamn <budget>` i en ny Claude Code-session — Claude
   bygger första testbatchen (research-driven, ingen performance-data finns ju än)
   + de 2 extra adsen, och registrerar produkten i kvotsystemet.
5. Launcha, logga med `/logga`, och låt dagliga check-inen (`/checkin`) ta över.

## De 2 extra adsen (transkriberat från Loomen 2026-08-05)

Utöver alla planerade annonser ska varje produkttest **alltid** ha dessa två.
De ligger ovanpå batchen — de tar aldrig en plats från en planerad annons.

### Extra #1 — Rå leverantörsvideo ("Temu-rippen")

- Ladda ner en av leverantörens egna produktvideor (Temu/AliExpress-listningen)
  **exakt som den är**: originalmusiken kvar, **ingen voiceover, ingen pålagd
  text, ingen redigering**. Den enda "produktionen" är nedladdning + export i
  rätt format.
- Klassificeras **alltid som PD** (product demo) i namngivningen, eftersom det är
  ren produktdemo med musik. Exempel: `Enginecover_PD_7_H1`.
- Poängen: den är gratis att producera och råa leverantörsklipp presterar ofta
  förvånansvärt bra — ingen anledning att inte ha den i varje test.

### Extra #2 — Ren produktbild utan text

- En statisk bild som visar produkten exakt som den är, **helt utan text-overlay**
  — bara produkten (och gärna vad den gör/används till).
- Tas normalt direkt från leverantörens/butikens produktbilder.
- Klassificeras som **PD** med variantsiffra, t.ex. `Enginecover_PD_8_1`.

**Regel för briefen:** båda får en minimal brief (källfil/länk + exportformat +
annonsnamn). Ingen copy-produktion behövs — och därför ingen sonnet-subagent.
Skriv i briefen uttryckligen "NO text overlay, NO voiceover, use as-is" så att
en redigerare inte "hjälper till" och lägger på text.

## ⚠️ Luckor som fortfarande är fast i Loom-video

Claude kan inte se Loom-videor. Titta på dem och klistra in vad de säger i en
session ("här är vad Loomen säger: … uppdatera SOP-06"), så skrivs de in här.

- [x] Exakt vilka de "2 extra adsen" är — **klart 2026-08-05**, se ovan
- [ ] Processtegen i pt 1–3 som inte täcks av stegen ovan
- [x] Kriterierna i "What product is next?" — **klart 2026-08-26**, se `docs/os/PRODUKTKRITERIER.md` (sex grindar + poängmodell, körs med `/produkt`)
