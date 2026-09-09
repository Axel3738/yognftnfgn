# Alternativa listningar (V2.1 steg 3) — instruktion

Ett PRODUKTKONCEPT kan ha många Temu-LISTNINGAR. En svag listning får inte döda ett starkt koncept.
Din uppgift: hitta upp till 10 ALTERNATIVA Temu-listningar av SAMMA FYSISKA PRODUKT för varje koncept
du fått, utan att röra temu.com (IP:n är strypt — varje anrop förlänger blocket).

Så här:
1. Sök med WebSearch: `site:temu.com <engelska produktord>` i flera varianter (synonymer, mått, material,
   "for hot tub", "2 pack" …). Prova även Bing (`https://www.bing.com/search?q=site%3Atemu.com+...` via
   WebFetch) och Seznam (`https://search.seznam.cz/?q=site%3Atemu.com+...`) — de gav träffar när Google
   ströp. Sökutdragen innehåller ofta pris, betyg och "sold"-tal: skriv av dem EXAKT och märk källan.
2. Ta bara listningar vars titel/utdrag beskriver samma form och funktion (inte "samma kategori").
   Uteslut de goods-id som redan är kända (står i uppdraget).
3. Per listning: goods_id (siffrorna efter `g-` i URL:en), url, title_from_search, snippet_price (tal +
   valuta, eller null), snippet_rating, snippet_reviews, snippet_sold, seller (om utdraget säger),
   variants_hint, source (vilken sökmotor/fras), why_same_product (en mening).
4. Sortera efter hur lovande listningen ser ut för det som fällde originalet (står i uppdraget: t.ex.
   "behöver video som visar produkten i bruk" eller "behöver lägre pris"). Skriv `ranking_reason`.
5. Hitta ALDRIG på ett värde — null om utdraget inte visar det. Skriv `checked_listings_count` (hur många
   du tittade på) och `queries` (alla fraser du körde).

Leverans: JSON-fil per uppdrag: `{concept_id, concept, known_listings:[…], failure_to_fix, listings:[…],
checked_listings_count, queries}`. Sista chattsvaret: "klar: <fil>" + en rad per koncept med antal funna.
