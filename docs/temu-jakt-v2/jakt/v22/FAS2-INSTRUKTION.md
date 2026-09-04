# FAS 2 — ny produktjakt, klusteragent (V2.1-systemet oförändrat)

Du jagar NYA Temu-listningar åt **Bäverbutiken** (Sverige, Meta Ads, köpare **man 45–70 med
småhus/fritidshus**). Du kör det empiriska vinnarfingeravtrycket som ett **eliminationsfilter**.
Du designar inte om något. Du hittar inte på något.

## Läs först (obligatoriskt, i ordning)

1. `/home/user/yognftnfgn/docs/temu-jakt-v2/jakt/v22/DATAVAGAR.md` — vilka datavägar som fungerar
   nu när temu.com är blockerat. **Följ den exakt.** Rör aldrig `temu-ld.py`.
2. `/home/user/yognftnfgn/docs/temu-vinnar-dna.md` avsnitt **12** (fingeravtrycket, eliminationsordningen),
   **6** (negativ rymd), **4** (mönster i tre ordningar), **9** (latenta variabler).
3. `/home/user/yognftnfgn/docs/temu-jakt-v2/jakt/PIPELINE-V2.1.md` — gate-ordning, koncept/listning, statusmodell.
4. `/home/user/yognftnfgn/docs/temu-jakt-v2/jakt/objektuniversum.md` — **avsnitt 5** för ditt kluster:
   objekt som söktes men gav noll träffar, och objekt som aldrig söktes. Det är din prioriterade yta.

## Vad du letar efter

> En Temu-listning vars **eget material redan är en färdig svensk Meta-annons**, riktad mot en ägare
> som **redan lever med problemet den här månaden**, i en form som **svensk handel inte har hyllat**.

Inte "wow". Inte nyhet. Inte mekanism. Sök från **ÄGARE → OBJEKT → BEFINTLIG FRIKTION**, aldrig från
"vad är trendigt". Dagens datum: **2026-09-04**.

## Gate-ordningen — kör i ordning, stanna vid FAIL

1. **OBJEKT** — fäster på / används med / skyddar något ägaren **redan har**, och det står utomhus,
   används kroppsligt, eller är universellt.
   FAIL direkt: mode, personlig passform, kit, förbrukningsvara, lek/spel, "N-i-1", och allt som
   ägaren förvarar inomhus när det inte används.
2. **PRESENS** — friktionen finns hos ägaren i **september–oktober 2026**, utan att annonsen skapar den.
   Testet: *kan det fotograferas i en svensk trädgård/hamn/garage den här månaden?*
   FAIL: framtida skada (frost i november), osynlig långsam skada, "märks på kvällen",
   och allt där < 6 veckor av säsongen återstår.
3. **SVENSKA HYLLAN** — Biltema / Jula / Clas Ohlson / Rusta säljer **inte samma form och spec**.
   Sök på **ägarens svenska ord**, inte på en översättning av Temu-titeln.
   Marketplace räknas som hylla (PriceRunner, Amazon.se, Fyndiq, VEVOR) — kunden googlar.
   UNDANTAG: ok ändå om ett **synligt märkesankare ≥ 1,6× vårt tänkta pris** finns och vår produkt
   ser ut som ankaret (Crocs, Husqvarna, Kjell-mönstret).
   **Detta är den största fällaren — 179 av 374 avslag förra körningen. Kör den FÖRE Temu-sökningen.**
4. **LISTNING** — först nu söker du Temu-listningar för koncept som klarat 1–3.
5. **MATERIAL** — leverantörsvideo som visar produkten i bruk ≤ 3 s, ingen inbränd utländsk text,
   samma fysiska produkt; eller en textfri hero i kontext som kan stå som annons.
   ⚠️ Bilderna går **inte** att se nu (se DATAVAGAR.md avsnitt 4). Sätt `BLOCKED_SOURCE`, aldrig FAIL,
   aldrig PASS. Skriv vad titeln och sökutdraget antyder, och märk det som indicium.
6. **EKONOMI** — kalibreringen står i DATAVAGAR.md avsnitt 6. Krav: svenskt pris ≥ 2,4 × landad kostnad
   OCH ≥ 300 kr. > 500 kr har aldrig förlorat. BE-CPA = pris − landad ≥ 190 kr.
   FAIL: landad > 420 kr (2,4× hamnar över 1 000 kr-taket) eller < 199 kr utan hävstång.
7. **VARIANT** — en variant, eller en parameter ägaren kan **utantill** (hk, liter, tum, kattens storlek).
   FAIL/OSÄKER: skostorlek, mått ägaren måste ta, "passar de flesta", SKU per maskinmodell.
8. **HOOK** — skriv **en ägarfråga på ≤ 7 ord på svenska** som bara ägaren svarar ja på
   ("Har du en IBC-tank i trädgården?"). Går det inte naturligt = negativt bevis, ned en klass.
9. **PUBLIK** — ägarklassen ≥ ~100 000 svenska hushåll (leta upp ett riktigt tal), objektet
   omisskännligt i ett Meta-flöde, passar man 45–70 småhus/fritidshus.

Därefter **negativ rymd** (DNA avsnitt 6): behovet måste skapas · personligt/passform · oklart ägande ·
inomhus-commodity · montering/app/inlärning · abstrakt eller fördröjd payoff · kräver förklaring ·
svensk mass-commoditisering · < 199 kr eller > 1 000 kr · köpt fungerande old way ∧ jämförelsehandlad ∧ < 300 kr.

## Dubbletter

`/home/user/yognftnfgn/docs/temu-jakt-v2/jakt/v22/kanda-goods-id.txt` innehåller de 518 goods-id som
redan är genomgångna. Ett id som står där är **inte nytt** — hoppa över det, eller markera
`already_known: true` om det ändå är relevant. Läs också vilka produktkategorier kontot redan testat
(`objektuniversum.md` + listan i `instruktion.md`) så du inte föreslår något som redan körts.

## Regler

- Minst **20 råkandidater**, minst **8–15 sökfraser**. Recall först, avslagsdisciplin sedan.
- Ingen siffra utan källa. Saknas den: `null` eller `"UNKNOWN"`. **Hitta aldrig på pris, betyg eller ägarantal.**
- Konfidens (HIGH / MEDIUM / LOW) på varje påstående som bär ett beslut.
- Ett tekniskt fel (blockerad källa) blir **aldrig** ett kommersiellt fel.
- Skilj PRODUKTKONCEPT från LISTNING. En svag listning fäller aldrig ett starkt koncept.

## Leverans

`/home/user/yognftnfgn/docs/temu-jakt-v2/jakt/v22/fas2/<kluster>.json` — en array, ett objekt per listning:

```
{kluster, goods_id, url, title, already_known, concept, object, owner_owns, friction, old_way,
 price_usd, price_source, rating, review_count, sold, variants,
 swedish_shelf{verdict, chain_same_form, anchor_name, anchor_price_sek, anchor_url, searches[]},
 economics{landed_low_sek, landed_high_sek, se_price_sek, multiple_low, multiple_high, be_cpa, verdict},
 gates{object, presence, shelf, material, economics, variant, hook, audience},
 hook_sv, audience{owner_class_size, source, verdict},
 material{status, indication}, negative_space_flags[],
 eliminated_at, winner_dna_match_0_100, category_novelty_0_100,
 tier, main_risk, confidence, sources[]}
```

`/home/user/yognftnfgn/docs/temu-jakt-v2/jakt/v22/fas2/<kluster>.md` — på svenska:
(a) objektuniversumet du jobbade från, (b) alla sökfraser, (c) tratten med antal per gate,
(d) full fältmall för varje Tier A och B, (e) 2–3 lärorika Tier C-avslag.

Sista chattsvaret: max 30 rader — tratten på en rad, sedan dina **topp 3** med
PRODUCT / TEMU LINK / OBJECT / FRICTION / SHELF / PRICE / ECONOMICS / DNA-MATCH / RISK / STATUS.
