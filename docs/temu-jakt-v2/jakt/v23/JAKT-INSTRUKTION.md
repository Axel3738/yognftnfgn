# Q4-portfölj för Bäverbutiken — jaktinstruktion (2026-09-05)

Du letar produkter att **testa på Baverbutiken.se under de kommande 120 dagarna** (sep–dec 2026).
Butiken är en svensk general store med tydlig manlig profil: bil/verktyg/garage, båt & marin,
camping & friluft, fordon & belysning, lantbruk & djur, trädgård & utomhus. Kund: man 35+,
villa/landsbygd, garage, bil, båt, jakt, fiske, camping, maskiner, DIY. Median 349 kr,
p25 259, p75 519 kr. **Ny produkt ska kännas kommersiellt trovärdig bredvid katalogen** —
läs `KATALOG.md` i den här mappen först. Butiken ska INTE bli en slumpmässig prylbutik.

## Läs först
1. `KATALOG.md` (samma mapp) — de 173 produkter som redan finns. Föreslå aldrig något som redan
   ligger där eller är en nära variant av det.
2. `/home/user/yognftnfgn/docs/temu-jakt-v2/jakt/v22/DATAVAGAR.md` — datavägar. **Rör INTE temu.com
   direkt** (`temu-ld.py`, curl, WebFetch på produktsidor): huvudsessionen håller hämtbudgeten
   centralt (~8 anrop/timme). Du levererar goods-id, huvudsessionen verifierar dem live.
3. `/home/user/yognftnfgn/docs/temu-vinnar-dna.md` avsnitt 12 + 6 — fingeravtrycket och negativa rymden.
   **Använd det som bevis, inte som fängelse.** Den här portföljen ska också rymma arketyper som
   vinner av andra skäl: hobbyidentitet, present, bundle-värde, deadline, säsongsförberedelse.
4. `/home/user/yognftnfgn/docs/temu-jakt-slutrapport.md` avsnitt 3–4 — vad som redan är prövat och
   fällt. Föreslå inte igen.
5. `/home/user/yognftnfgn/docs/temu-jakt-v2/jakt/v22/kanda-goods-id.txt` — 518 redan kända id.

## Q4-lagret (obligatoriskt per kandidat)
Relevans i Sverige sep–dec · säsongsstart/-slut · **akut NU?** · vinterförberedelse · mörker/kyla/
regn · jaktsäsong · ved/värme · fordonsvinterställning · båtupptagning · fastighetsunderhåll ·
presentpotential · hobbyidentitet · juldeadline. Etikett: **Q4 NOW · OCTOBER · BLACK WEEK / GIFT · EVERGREEN**.

⚠️ **Kranskyddsfällan:** en produkt vars skada inträffar i nov–feb (frost, snö, is) men säljs i
september faller — butiken testade Kranskydd Frost, ROAS 1,59 mot break-even 1,49, pausad. Det
gäller praktiska problemlösare. **Presenter har en annan klocka:** de köps i nov–dec till jul, så
där är deadline-logiken rätt i stället.

## Vad du gör per kandidat
1. **Hitta listningen:** WebSearch `site:temu.com <engelska ord>` → goods-id + titel.
2. **Pris/betyg:** Seznam-snippet (DATAVAGAR avsnitt 2) eller Temus `-s.html`-sökresultatsida via
   WebFetch (avsnitt 2b). Märk källa. Hitta aldrig på ett tal.
3. **Svenska hyllan — hårt:** sök det **billigaste** svenska priset först (PriceRunner, Fyndiq,
   Amazon.se, CDON, vidaXL, Jula, Biltema, Clas, Rusta, Bauhaus, fackhandel). Marketplace räknas
   som hylla. Notera golv OCH ankare med pris + URL. Fyra av sju fällda högpoängare i förra passet
   föll på marketplace-golvet, inte på kedjan.
4. **Ekonomi:** SE-Temu ≈ USD × 6,96–8,16; landad ≈ × 1,5; svenskt pris ≥ 2,4× landad och ≥ 300 kr;
   > 500 kr har aldrig förlorat; landad > 420 kr = över 1 000 kr-taket = FAIL. Räkna båda ändarna.
5. **Publik:** riktigt tal för ägarklassen (SCB, Trafikanalys, Naturvårdsverket, Jordbruksverket,
   branschorgan). Fingeravtryckets golv är ~100 000 hushåll för problemlösare; presenter mäts på
   köparens klass i stället (t.ex. 271 000 jaktkort, ~1,6 M sportfiskare).
6. **Meta-potential:** vad syns i sekund 0–3? Kan hooken skrivas som ägarfråga ≤ 7 ord? För
   presenter: syns "jag vet vad du gillar" i en stillbild?
7. **Varianter:** en parameter ägaren kan utantill, eller en SKU. Tum/fot = varning.

## Regler
- Minst 12 kandidater med fullständiga fält, varav du rangordnar dina **topp 6**.
- **Skilj PRODUKTKONCEPT från LISTNING.** Ett starkt koncept med dålig listning → sök en bättre listning, fäll inte konceptet.
- Konfidens HIGH/MEDIUM/LOW per bärande påstående. `UNKNOWN` hellre än gissning.
- Diversifiera: max 2 produkter från samma smala kategori i din topp 6.

## Leverans
`/home/user/yognftnfgn/docs/temu-jakt-v2/jakt/v23/<uppdrag>.json` — array, ett objekt per kandidat:
```
{uppdrag, rank, product_name, concept, goods_id, temu_url, alt_goods_ids[], price_usd, price_source,
 rating, review_count, category, q4_label, season_start, season_end, urgency_now,
 owner_customer, friction_or_motive, why_baverbutiken, why_meta, hook_sv, visual_0_3s_expected,
 swedish_shelf{floor_name, floor_price_sek, floor_url, anchor_name, anchor_price_sek, anchor_url, verdict},
 economics{landed_low, landed_high, se_price, multiple_low, multiple_high, be_cpa, verdict},
 audience{size, source, verdict}, variants, winner_dna_match_0_100, archetype, confidence, main_risk,
 status_suggestion, sources[]}
```
`/home/user/yognftnfgn/docs/temu-jakt-v2/jakt/v23/<uppdrag>.md` — svensk sammanfattning: sökfraser,
tratt, topp 6 i full mall, 3 lärorika avslag.
Sista chattsvaret: max 30 rader, topp 6 med PRODUCT / TEMU goods-id / PRICE / SHELF / ECONOMICS / Q4 / DNA / RISK / STATUS.
