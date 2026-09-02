# Backlog — Kranbeskyttelse Frost NO (norska marknaden)

Koncept som väntar, ännu inte briefade. Varje idé ska kunna peka på en källa
(playbook-vinnare, winning line, eller konkurrent-signal) — annars är den en
gissning och ska märkas som det.

## Väntar på data/åtkomst
- **Prisbärande annonser (alla vinklar).** Blockerat tills Axel bekräftar
  beverbutikken.nos faktiska pris för Kranbeskyttelse Frost 420D — Shopify
  var oåtkomlig hela Batch #1-sessionen (token expired, samma problem som
  drabbade Fiskespöhållaren NO 2026-08-31). När priset är bekräftat: bygg om
  `Kranbeskyttelse_NO_CI_1_H1` och `Kranbeskyttelse_NO_CI_1_1` med en riktig
  prisrad om Axel vill det, och avgör om CS-vinkeln (rabatt) kan återupplivas
  ärligt med en riktig rabattkod i Shopify.
- **Konkurrentsökning (Meta Ad Library, norska sökord).** Tidsprioriterat
  bort denna körning — se `dna.md` datakvalitet. Sök "kranbeskyttelse",
  "frostbeskyttelse kran", "utekran vinter" i Norge innan nästa `/cs`.
- **Videoinnehåll (rörelse, röst) för PD_1_H1.** Analysen bygger bara på
  primärtext/rubrik via Meta API — be Axel/redigerarna om ett riktigt
  transkript till nästa `/cs`-körning för ett äkta rad-för-rad-teardown.

## Öppen fråga som styr nästa batch
- **Är SP en svag vinkel i NO, eller fick den bara aldrig en chans?**
  `Kranbeskyttelse_NO_UG_1_H1` i denna batch är det första riktiga försöket
  att svara på detta. Om den ADSes riktig spend (≥300 kr) nästa körning:
  jämför direkt mot PD_1_H1 i `dna.md`-formatet. Om den aldrig får spend
  (samma CBO-svält som drabbat SP hittills): nästa steg är ett eget test-ABO
  med öronmärkt budget till just SP, inte fler SP-annonser i samma pool.

## Idéer från SE (samma fysiska produkt, delvis testade i NO)
- SE:s bevisade SP-struktur (citat → ✅×3 → garanti → SHOP_NOW) — redan
  live i NO som `Kranbeskyttelse_NO_SP_1_H1/H2/H3` men aldrig fått spend.
  `UG_1_H1` i denna batch testar samma underliggande vinkel i ett starkare
  format i stället för att bara ge SP:s befintliga text-citat-kort mer tid.
- SE:s "cost of inaction"-lösning på CS-blockeraren (`Kranskydd_CI_1_H1/1`)
  — redan speglad i denna batch (`Kranbeskyttelse_NO_CI_1_H1/1`). Om den
  presterar bra i NO: samma mönster är värt att sprida till fler produkter
  med en trasig rabatt-vinkel.
- SE:s obevisade before/after-split-idé (`products/kranskydd-frost-420d/dna.md`,
  "Testa kontrollerat") — speglad här som `Kranbeskyttelse_NO_PD_4_1`. Delad,
  fortfarande obevisad hypotes i båda marknaderna — vinner den i NO, testa
  den även i SE och vice versa.

## Format som inte testats alls än
- Riktig UGC-video från en verklig norsk kund (inte skådespelare) —
  `Kranbeskyttelse_NO_UG_1_H1` i Batch #1 är en modell/skådespelare-baserad
  approximation. Om Axel har en riktig UGC-kreatör för NO-marknaden:
  prioritera en äkta insamling före nästa batch.
- GT (gåva/jul) — pausad till november, samma säsongslogik som SE. Testa
  inte om förrän november 2026.
