# Batch 1 — kontrollerad jakt i ETT nytt kluster (V2.1-ordning + Sverige-viabilitet)

Du jagar produktkoncept åt Bäverbutiken (Sverige, Meta Ads, köpare man 45–70 med småhus/fritidshus).
Läs först, i ordning: `/home/user/yognftnfgn/docs/temu-vinnar-dna.md` avsnitt 4, 6, 7, 9 och 12 (facit),
`/home/user/yognftnfgn/docs/temu-jakt-v2/jakt/PIPELINE-V2.1.md` (gate-ordning, entiteter, statusar),
`/home/user/yognftnfgn/docs/temu-jakt-v2/jakt/SVERIGE-VIABILITET.md` (det nya lagret),
`/home/user/yognftnfgn/docs/temu-jakt-v2/jakt/v22/DATAVAGAR.md` avsnitt 1–2 (hur du hittar pris när Temu är blockerat)
och `/home/user/yognftnfgn/docs/temu-jakt-slutrapport.md` avsnitt 5 (vad två pass lärde — marketplace-golvet!).

## Hårda regler
- **Rör ALDRIG temu.com direkt** (ingen WebFetch/curl mot temu.com — IP:n är strypt och varje anrop förlänger blocket). Listningar hittas via `WebSearch: site:temu.com <engelska ord>`; pris/betyg via Seznam-utdrag (`curl -sS -A "Mozilla/5.0" "https://search.seznam.cz/?q=site%3Atemu.com+<ord>"` eller WebFetch på samma URL). Skriv av EXAKT och märk källan. Hitta aldrig på ett tal — skriv PENDING.
- **Ordningen är V2.1:** OBJEKT → PRESENS → **SVENSKA HYLLAN** → Temu-listningsjakt → material (BLOCKED_SOURCE nu) → ekonomi → variant → hook → publik. Hyllan kollas FÖRE Temu-sökningen, på ägarens **svenska** ord, och **det billigaste svenska priset först** (PriceRunner via `curl -sS -A "Mozilla/5.0" "https://www.pricerunner.se/search?q=<ord>"`, Fyndiq, vidaXL, CDON, Amazon.se via WebSearch) — ankaret hittas efter golvet, aldrig i stället för det. Ett tal som fäller får aldrig stå i en kommentar: det ska stå i `shelf_floor_sek`.
- **Uteslut kända goods-id:** `/home/user/yognftnfgn/docs/temu-jakt-v2/jakt/v22/kanda-goods-id.txt` (518) och alla id i `/home/user/yognftnfgn/docs/temu-jakt-v2/jakt/dataset.json` samt fas 2-filerna i `v22/fas2/*.json`. Kolla med grep innan du tar med ett id.
- **Ekonomi:** SE-Temu-pris ≈ USD × 6,96–8,16; landad ≈ SE-Temu × 1,5; krav: svenskt pris ≥ 2,4 × landad, ≥ 300 kr, BE-CPA ≥ 190, och ankaret ≥ 1,6 × vårt pris eller kedjan tom; stopp om landad > 420 kr.
- **Negativ rymd** (fäller): latent behov (skadan syns senare), sommarobjekt, personlig passform, kit/montering med inlärning, "N-i-1", inomhusförvarat objekt, < 199 kr, > 1 000 kr, kroppsnära/mode, PPE med certifieringskrav.
- **Sverige-viabilitet** för varje koncept: ägarpopulation (källa eller "uppskattning"), TAM-band, säsong + antal kommersiella månader, Meta-igenkänning 1–3, skalningstak, klass S/A/B/C, konkurrensklass WHITE SPACE / UNKNOWN / WARNING / KONKURRENS (n annonsörer) med belägg, och de tre efterfrågorna åtskilda (Temu-listning / underliggande marknad / Meta-potential).
- Budget: max ~120 WebSearch. Sikta på ~20 kvalificerade koncept (gate 1–3 PASS), leverera de **8 bästa** i full mall och resten i en kort tabell med avslagsorsak. Strukturell kvalitet före antal.

## Leverans
1. `batch1/<kluster>.json` — en array med ALLA prövade koncept (även fällda) enligt fälten: concept_id, concept, object, owner_owns, friction, old_way, season_months, presence, shelf {floor_sek, floor_source, anchor_name, anchor_sek, anchor_url, chain_same_form, verdict}, listings [{goods_id, url, title_from_search, price_usd, price_source, rating, reviews, sold}], economics {se_temu_est, landed_est, se_price, multiple, be_cpa, verdict}, variant, hook, audience, sweden {population, population_source, tam_band, season, months, recognition, ceiling_sek_day, class, competition_class, competition_evidence, temu_demand, market_demand, meta_potential}, dna_match, negative_space_flags, status (TEST/VERIFY/WATCH/REJECT), why_it_could_work, why_it_could_fail, sources.
2. `batch1/<kluster>.md` — objektuniversumet du utgick från, sökfraserna (körda), tratten, de 8 bästa i full mall (fälten ovan i läsbar form), avslagen i tabell.
3. Sista chattsvaret: "klar: batch1/<kluster>.json + .md" + en rad per levererad produkt: namn · goods_id · pris · DNA · Sverige-klass · status.
