# Testmatris GreatGrill MX: creative × destination

**Datum:** 2026-08-17 · **Beslut:** Axel vill köra varje annons i två versioner — en mot produktsidan (PDP) och en mot en advertorial (listicle).
**Namnkonvention (uppdaterad 2026-08-18):** annonsen heter `GG_{nr}_{H1|H2|H3}_{angle}_{format}_{hook}`
och **destinationen står i adset-namnet** — `GG PRODUKTSIDA - 02 familia` respektive
`GG LISTICLE 8 - 02 familia`. Samma creative har alltså samma annonsnamn i båda versionerna;
det är det som gör att adset kan ställas mot adset. `_pdp`/`_lst<N>`-suffixen i tabellerna
nedan är den gamla skrivningen och läses nu som *vilket adset annonsen ska ligga i*.
Byggd kampanj: se `launch-kampanj-1.md`.

## URL:er (fylls i av Axel när GemPages-sidorna är byggda)

| Kod | Sida | URL |
|---|---|---|
| `pdp` | Produktsidan | https://laclinicadelasador.mx/products/roterande-grillkorg-i-rostfritt-stal-perfekt-for-gronsaker-kott-tillbehor |
| `lst8` | Artikel 8 — anti-aluminio | *(fylls i)* |
| `lst1` | Artikel 1 — 7 razones | *(fylls i)* |
| `lst11` | Artikel 11 — frustration | *(fylls i)* |
| `lst22` | Artikel 22 — hierro fundido | *(fylls i)* |
| `lst13` | Artikel 13 — brochetas | *(fylls i)* |

**UTM på varje länk** (annars syns destinationsskillnaden bara i Meta, inte i Shopify):
`?utm_source=fb&utm_medium=paid&utm_campaign=clin_mx_2026q3&utm_content={hela_annonsnamnet}`

---

## Matrisen — 33 creatives × 2 destinationer = 66 annonser

### Video våg 1 (8 koncept × 3 hooks = 24 creatives)

| # | Creative (basnamn) | PDP-version | Listicle-version |
|---|---|---|---|
| 1A | `..._pain_ugc_foilstop_v1` | `_pdp` | `_lst8` |
| 1B | `..._pain_ugc_vaporadentro_v1` | `_pdp` | `_lst8` |
| 1C | `..._pain_ugc_cebollita_v1` | `_pdp` | `_lst8` |
| 2A | `..._pain_ugc_familia_v1` | `_pdp` | `_lst8` |
| 2B | `..._pain_ugc_alvapor_v1` | `_pdp` | `_lst8` |
| 2C | `..._pain_ugc_esposa_v1` | `_pdp` | `_lst8` |
| 3A | `..._curiosity_ugc_crudoquemado_v1` ⭐ | `_pdp` | `_lst11` |
| 3B | `..._curiosity_ugc_otravez_v1` ⭐ | `_pdp` | `_lst11` |
| 3C | `..._curiosity_ugc_orgullo_v1` | `_pdp` | `_lst11` |
| 4A | `..._pain_comparison_plancha_v1` | `_pdp` | `_lst22` |
| 4B | `..._pain_comparison_tallar_v1` | `_pdp` | `_lst22` |
| 4C | `..._pain_comparison_humopagado_v1` | `_pdp` | `_lst22` |
| 5A | `..._benefit_ugc_quickrec_v1` | `_pdp` | `_lst1` |
| 5B | `..._benefit_ugc_pov_v1` | `_pdp` | `_lst1` |
| 5C | `..._offer_ugc_oferta_v1` | `_pdp` | `_lst1` |
| 6A | `..._curiosity_comparison_top3_v1` | `_pdp` | `_lst8` |
| 6B | `..._curiosity_comparison_dosdetres_v1` | `_pdp` | `_lst8` |
| 6C | `..._fomo_comparison_antesdecomprar_v1` | `_pdp` | `_lst8` |
| 7A | `..._pain_ugc_dinero_v1` | `_pdp` | `_lst11` |
| 7B | `..._pain_ugc_diezpesos_v1` | `_pdp` | `_lst11` |
| 7C | `..._pain_ugc_asadorcome_v1` | `_pdp` | `_lst11` |
| 8A | `..._curiosity_ugc_sazon_v1` | `_pdp` | `_lst13` |
| 8B | `..._curiosity_ugc_miraparrilla_v1` | `_pdp` | `_lst13` |
| 8C | `..._curiosity_ugc_fuegosabor_v1` | `_pdp` | `_lst13` |

### Video våg 2 (3 creatives)

| # | Creative | PDP | Listicle |
|---|---|---|---|
| 9 | `..._social_ugc_esposa_v1` | `_pdp` | `_lst8` |
| 10 | `..._identity_ugc_porfinsesienta_v1` | `_pdp` | `_lst11` |
| 11 | `..._curiosity_ugc_trompo_v1` | `_pdp` | `_lst8` (slutar på "fuego directo, no vapor" = artikel 8:s tes) |

### Bildannonser (6 creatives, färdiga filer i `ads/`)

| # | Creative | PDP | Listicle |
|---|---|---|---|
| B1 | `..._pain_beforeafter_crudoquemado_v1` | `_pdp` | `_lst11` |
| B2 | `..._benefit_collage_features_v1` | `_pdp` | `_lst1` |
| B3 | `..._identity_lifestyle_3idiomas_v1` | `_pdp` | `_lst11` |
| B4 | `..._benefit_product_medidas_v1` | `_pdp` | `_lst1` |
| B5 | `..._offer_comparison_nogira_v1` | `_pdp` | `_lst1` |
| B6 | `..._social_ugc_esposo_v1` | `_pdp` | `_lst8` |

---

## ⚠️ Volymen kostar — läs innan launch

66 annonser. Enligt CLAUDE.md regel 3 får ingen annons dömas under **300 kr spend (~540 MXN) eller 3 köp**. Full matris till första avläsning = **~35 000 MXN i testspend**. Break-even-bidraget är 443–617 MXN per order, så det motsvarar ~60–80 ordrar bara för att få läsa av testet.

**Rekommenderad fasning (samma svar, en bråkdel av pengarna):**

**Fas 1 — destinationstestet, isolerat.** Två speglade test-ABO:n med *samma* 9 creatives (koncept 3, 2 och 6 × 3 hooks):
- ABO A: alla 9 → PDP
- ABO B: alla 9 → listicle (enligt mappningen ovan)
- Lika budget per annons, 18 annonser totalt, ~9 700 MXN till avläsning.
- Läser du adset mot adset får du destinationssvaret rent; läser du annons mot annons får du creative-svaret inom varje sida.

**Fas 2 — applicera vinnaren.** Vinnande destination blir standard för resten av biblioteket. Kör då creative-testet brett med bara EN destination per annons (33 annonser i stället för 66).

Motivet: destinationseffekten är en **generell** variabel — den gäller alla creatives ungefär lika. Man behöver inte betala för att mäta samma sak 33 gånger. Creative-effekten däremot är unik per annons och måste mätas per annons.

Kör Axel ändå hela matrisen direkt: det är hans beslut, och strukturen ovan är korrekt namngiven för det. Men budgeten måste då planeras för ~35 000 MXN innan första kill-beslutet är statistiskt försvarbart.

## Launch-struktur (gäller båda vägarna)

- Nya tester i **separat test-ABO med lika budget per annons** (CLAUDE.md regel 11). Aldrig i skalningens CBO.
- Ett koncept per ABO (3 hooks tillsammans) — blanda inte koncept i samma adset.
- Kill mot **break-even** (1,45–1,55 beroende på bundlenivå), aldrig mot target.
- Rangordna på **vinstbidrag** `(break-even-CPA − CPA) × köp`, aldrig ROAS eller CPA ensamt.
