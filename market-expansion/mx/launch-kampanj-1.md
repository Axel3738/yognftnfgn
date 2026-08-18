# Launch 1 — GreatGrill MX · CBO-testkampanj

**Byggd skarpt i Meta 2026-08-18.** Kampanjen ligger **PAUSED** — allt annat är ACTIVE,
så du slår på *en* switch (kampanjnivån) och alla 62 annonser går live samtidigt.
Ingenting spenderar en krona innan dess.

| | |
|---|---|
| Kampanj | `CLIN_GG_SALES_20260818` · ID `120252844116050349` |
| Budget | **CBO 2 000 kr/dag** på kampanjnivån *(Axels beslut 2026-08-18)* |
| Struktur | **Ett adset per annons (koncept).** Båda destinationerna ligger inne i samma adset. *(Axels beslut 2026-08-18)* |
| Omfattning | 10 adsets · 62 annonser · 31 creatives × 2 destinationer |
| Annonskonto | `act_918424617391896` "Snark mexico" · **SEK** · Mexico/General · STONEBITE ECOM AB |
| Sida | La Clínica del Asador `1334949959694822` |
| Pixel | `776922878287560` + Purchase |
| Målgrupp | Broad Mexiko, 25–65, Advantage+ placeringar och Advantage audience |
| Attribution | 7 dagar klick / 1 dag visning |
| Byggskript | `build-kampanj-1.py` + `build-kampanj-1-state.json` (resumebart) |

---

## Så är det strukturerat

```
KAMPANJ  CLIN_GG_SALES_20260818                    CBO 2 000 kr/dag
│
├─ GG - 01 foilstop          6 annonser  = 3 hooks × 2 destinationer
│     ├─ GG_01_H1_pain_ugc_foilstop_PROD        → produktsidan
│     ├─ GG_01_H1_pain_ugc_foilstop_LIST8       → /pages/8
│     ├─ GG_01_H2_pain_ugc_vaporadentro_PROD    → produktsidan
│     ├─ GG_01_H2_pain_ugc_vaporadentro_LIST8   → /pages/8
│     ├─ GG_01_H3_pain_ugc_cebollita_PROD       → produktsidan
│     └─ GG_01_H3_pain_ugc_cebollita_LIST8      → /pages/8
├─ GG - 02 familia           6 annonser
├─ GG - 03 crudoquemado ⭐   6 annonser
├─ GG - 04 plancha           6 annonser
├─ GG - 05 quickrec          6 annonser
├─ GG - 06 top3              6 annonser
├─ GG - 07 dinero            6 annonser
├─ GG - 08 sazon             6 annonser
├─ GG - 09 esposa            2 annonser  (ensam creative, ingen hook-trio)
└─ GG - BILDANNONSER        12 annonser  = 6 bilder × 2 destinationer
```

**Ett adset = en annons (ett koncept).** Konceptets alla hookvarianter ligger inne i
adsetet, och varje hookvariant finns i två versioner: en mot produktsidan och en mot
konceptets listicle. Destinationstestet sker alltså **inuti** adsetet, annons mot annons,
mot samma publik och i samma auktion.

**Därför står destinationen i annonsnamnet.** Eftersom båda versionerna delar adset kan
adsetnamnet inte bära destinationen längre — suffixet `_PROD` eller `_LIST<N>` gör det.

```
GG_02_H2_pain_ugc_alvapor_LIST8
│  │  │  │    │   │        └ destination: /pages/8   (_PROD = produktsidan)
│  │  │  │    │   └ hook
│  │  │  │    └ format
│  │  │  └ vinkel
│  │  └ hook-variant A/B/C = H1/H2/H3
│  └ annonsnummer = redigerarnas filnummer = Google-dokumentet
└ GreatGrill
```

**UTM sköter sig själv.** Länken innehåller Metas makron
`&utm_content={{ad.name}}&utm_term={{adset.name}}` — Meta fyller i namnen automatiskt,
så i Shopify ser du både vilken annons och vilken sida ordern kom från, utan att någon
behöver hålla en lista uppdaterad för hand.

---

## Adseten i detalj

### `GG - 01 foilstop`  ·  adset-ID `120252844706260349`

Destinationer i detta adset: **produktsidan** och **`/pages/8`** — *Deja de envolver tus camarones en aluminio*

| Redigerarnas fil | Produktsida-versionen | Listicle-versionen |
|---|---|---|
| `1 HOOK A.mp4` | `GG_01_H1_pain_ugc_foilstop_PROD` | `GG_01_H1_pain_ugc_foilstop_LIST8` |
| `1 HOOK B.mp4` | `GG_01_H2_pain_ugc_vaporadentro_PROD` | `GG_01_H2_pain_ugc_vaporadentro_LIST8` |
| `1 HOOK C.mp4` | `GG_01_H3_pain_ugc_cebollita_PROD` | `GG_01_H3_pain_ugc_cebollita_LIST8` |

### `GG - 02 familia`  ·  adset-ID `120252844717710349`

Destinationer i detta adset: **produktsidan** och **`/pages/8`** — *Deja de envolver tus camarones en aluminio*

| Redigerarnas fil | Produktsida-versionen | Listicle-versionen |
|---|---|---|
| `2 HOOK A.mp4` | `GG_02_H1_pain_ugc_familia_PROD` | `GG_02_H1_pain_ugc_familia_LIST8` |
| `2 HOOK B.mp4` | `GG_02_H2_pain_ugc_alvapor_PROD` | `GG_02_H2_pain_ugc_alvapor_LIST8` |
| `2 HOOK C.mp4` | `GG_02_H3_pain_ugc_esposa_PROD` | `GG_02_H3_pain_ugc_esposa_LIST8` |

### `GG - 03 crudoquemado`  ·  adset-ID `120252844726770349`

Destinationer i detta adset: **produktsidan** och **`/pages/11`** — *Deja de quemar la mitad de la comida*

| Redigerarnas fil | Produktsida-versionen | Listicle-versionen |
|---|---|---|
| `3 …_crudoquemado_v1.mov` | `GG_03_H1_curiosity_ugc_crudoquemado_PROD` | `GG_03_H1_curiosity_ugc_crudoquemado_LIST11` |
| `3 …_otravez_v1.mov` | `GG_03_H2_curiosity_ugc_otravez_PROD` | `GG_03_H2_curiosity_ugc_otravez_LIST11` |
| `3 …_orgullo_v1.mov` | `GG_03_H3_curiosity_ugc_orgullo_PROD` | `GG_03_H3_curiosity_ugc_orgullo_LIST11` |

### `GG - 04 plancha`  ·  adset-ID `120252844735260349`

Destinationer i detta adset: **produktsidan** och **`/pages/22`** — *7 razones para dejar el hierro fundido*

| Redigerarnas fil | Produktsida-versionen | Listicle-versionen |
|---|---|---|
| `4 H1.mp4` | `GG_04_H1_pain_comparison_plancha_PROD` | `GG_04_H1_pain_comparison_plancha_LIST22` |
| `4 H2.mp4` | `GG_04_H2_pain_comparison_tallar_PROD` | `GG_04_H2_pain_comparison_tallar_LIST22` |
| `4 H3.mp4` | `GG_04_H3_pain_comparison_humopagado_PROD` | `GG_04_H3_pain_comparison_humopagado_LIST22` |

### `GG - 05 quickrec`  ·  adset-ID `120252844739660349`

Destinationer i detta adset: **produktsidan** och **`/pages/1`** — *7 razones para cambiar el aluminio*

| Redigerarnas fil | Produktsida-versionen | Listicle-versionen |
|---|---|---|
| `…_quickrec_v1.mov` | `GG_05_H1_benefit_ugc_quickrec_PROD` | `GG_05_H1_benefit_ugc_quickrec_LIST1` |
| `…_pov_v1.mov` | `GG_05_H2_benefit_ugc_pov_PROD` | `GG_05_H2_benefit_ugc_pov_LIST1` |
| `…_oferta_v1.mov` | `GG_05_H3_offer_ugc_oferta_PROD` | `GG_05_H3_offer_ugc_oferta_LIST1` |

### `GG - 06 top3`  ·  adset-ID `120252844745540349`

Destinationer i detta adset: **produktsidan** och **`/pages/8`** — *Deja de envolver tus camarones en aluminio*

| Redigerarnas fil | Produktsida-versionen | Listicle-versionen |
|---|---|---|
| `Ad 6 H1 v2.mp4` | `GG_06_H1_curiosity_comparison_top3_PROD` | `GG_06_H1_curiosity_comparison_top3_LIST8` |
| `Ad 6 H2 v2.mp4` | `GG_06_H2_curiosity_comparison_dosdetres_PROD` | `GG_06_H2_curiosity_comparison_dosdetres_LIST8` |
| `Ad 6 H3 v2.mp4` | `GG_06_H3_fomo_comparison_antesdecomprar_PROD` | `GG_06_H3_fomo_comparison_antesdecomprar_LIST8` |

### `GG - 07 dinero`  ·  adset-ID `120252844751310349`

Destinationer i detta adset: **produktsidan** och **`/pages/11`** — *Deja de quemar la mitad de la comida*

| Redigerarnas fil | Produktsida-versionen | Listicle-versionen |
|---|---|---|
| `7 H1.mp4` | `GG_07_H1_pain_ugc_dinero_PROD` | `GG_07_H1_pain_ugc_dinero_LIST11` |
| `7 H2.mp4` | `GG_07_H2_pain_ugc_diezpesos_PROD` | `GG_07_H2_pain_ugc_diezpesos_LIST11` |
| `7 H3.mp4` | `GG_07_H3_pain_ugc_asadorcome_PROD` | `GG_07_H3_pain_ugc_asadorcome_LIST11` |

### `GG - 08 sazon`  ·  adset-ID `120252844757560349`

Destinationer i detta adset: **produktsidan** och **`/pages/13`** — *Una canasta reemplaza diez brochetas*

| Redigerarnas fil | Produktsida-versionen | Listicle-versionen |
|---|---|---|
| `8 HOOK A.mp4` | `GG_08_H1_curiosity_ugc_sazon_PROD` | `GG_08_H1_curiosity_ugc_sazon_LIST13` |
| `8 HOOK B.mp4` | `GG_08_H2_curiosity_ugc_miraparrilla_PROD` | `GG_08_H2_curiosity_ugc_miraparrilla_LIST13` |
| `8 HOOK C.mp4` | `GG_08_H3_curiosity_ugc_fuegosabor_PROD` | `GG_08_H3_curiosity_ugc_fuegosabor_LIST13` |

### `GG - 09 esposa`  ·  adset-ID `120252844762470349`

Destinationer i detta adset: **produktsidan** och **`/pages/8`** — *Deja de envolver tus camarones en aluminio*

| Redigerarnas fil | Produktsida-versionen | Listicle-versionen |
|---|---|---|
| `9.mp4` | `GG_09_H1_social_ugc_esposa_PROD` | `GG_09_H1_social_ugc_esposa_LIST8` |

### `GG - BILDANNONSER`  ·  adset-ID `120252844764250349`

Här har varje bild sin **egen** listicle enligt `testmatris.md`, eftersom destinationen sitter på annonsen och inte på adsetet.

| Bild | Produktsida-versionen | Listicle-versionen | Landar på |
|---|---|---|---|
| B1 crudoquemado | `GG_B1_pain_beforeafter_crudoquemado_PROD` | `GG_B1_pain_beforeafter_crudoquemado_LIST11` | `/pages/11` |
| B2 features | `GG_B2_benefit_collage_features_PROD` | `GG_B2_benefit_collage_features_LIST1` | `/pages/1` |
| B3 3idiomas | `GG_B3_identity_lifestyle_3idiomas_PROD` | `GG_B3_identity_lifestyle_3idiomas_LIST11` | `/pages/11` |
| B4 medidas | `GG_B4_benefit_product_medidas_PROD` | `GG_B4_benefit_product_medidas_LIST1` | `/pages/1` |
| B5 nogira | `GG_B5_offer_comparison_nogira_PROD` | `GG_B5_offer_comparison_nogira_LIST1` | `/pages/1` |
| B6 esposo | `GG_B6_social_ugc_esposo_PROD` | `GG_B6_social_ugc_esposo_LIST8` | `/pages/8` |

---

## Landningssidorna

| Sida | Rubrik | Används av |
|---|---|---|
| produktsidan | — | alla `_PROD`-annonser |
| `/pages/1` | *7 razones para cambiar el aluminio* | koncept 5 · bild B2, B4, B5 |
| `/pages/8` | *Deja de envolver tus camarones en aluminio* | koncept 1, 2, 6, 9 · bild B6 |
| `/pages/11` | *Deja de quemar la mitad de la comida* | koncept 3, 7 · bild B1, B3 |
| `/pages/13` | *Una canasta reemplaza diez brochetas* | koncept 8 |
| `/pages/22` | *7 razones para dejar el hierro fundido* | koncept 4 |

Alla fem verifierade 2026-08-18: svarar 200 och är publika. Shopifys preview-nycklar
(`?_ab=0&key=…`) används **inte** — de kan sluta gälla mitt i en kampanj.

---

## Vad som INTE är med

| Creative | Varför |
|---|---|
| Ad 10 porfinsesienta | Ej klar hos redigerarna |
| Ad 11 trompo | Ej klar hos redigerarna |

Allt annat som är levererat ligger inne. Koncept 3 ⭐ (repots prioritet 1, bäst
research-stöd) levererades 2026-08-18 och är med från start.

---

## ⚠️ Budgeten räcker inte till 10 adsets

2 000 kr/dag delat på 10 adsets är 200 kr per adset i snitt — och CBO delar inte jämnt,
den koncentrerar. Regel 3 i CLAUDE.md: ingen dom under **300 kr spend eller 3 köp**.
Med 62 annonser i kampanjen når merparten aldrig dömbart läge; de kommer se ut som
förlorare utan att ha testats.

**Räknat rakt av:** 62 annonser × 300 kr = **18 600 kr** innan hela matrisen är avläsbar.
På 2 000 kr/dag är det nio dagar *om* pengarna fördelades jämnt — vilket CBO inte gör.

**Tre vägar:**

1. **Höj till 5 000 kr/dag.** Hela matrisen dömbar på ungefär en vecka.
2. **Behåll 2 000 kr och pausa adsets.** Kör 3–4 koncept först (förslag: 03 crudoquemado,
   02 familia, 06 top3 — de tre med starkast stöd i `voc-research.md`), pausa resten.
3. **Sätt minimibelopp per adset** i Ads Manager. Det är CBO:ns enda motmedel mot att
   ett adset äter allt.

---

## Avläsning och kill (CLAUDE.md regel 3 + `docs/os/ANALYSMETOD.md`)

- **Ingen dom före 300 kr spend eller 3 köp per annons.** Ett adset som fick 90 kr
  förlorade inte — det fick aldrig chansen. Notera det som *ej testat*.
- **Dag 1–2:** rör ingenting. Kontrollera bara att leveransen går och att Purchase-eventet
  trackar.
- **Dag 3:** hook-läsning på tidiga signaler (CTR, CPC, 3s-views, ATC) — inga kill-beslut
  på köp än.
- **Dag 4–5:** kill mot **break-even** (BE-ROAS 1,45–1,55 beroende på bundlenivå, bidrag
  417–813 MXN/order). Aldrig mot target.
- **Rangordna på vinstbidrag** `(break-even-CPA − CPA) × köp` — aldrig ROAS eller CPA
  ensamt. Top spendern är benchmark, inte en kandidat att döma mot småannonser.
- **Destinationsläsningen** görs genom att summera alla `_PROD` mot alla `_LIST*` inom
  samma adset. Jämför aldrig över adsetgränser — då blandar du in konceptskillnaden.
- Fältnamn: `amount_spent`, `actions:omni_purchase`, `cost_per_omni_purchase`,
  `purchase_roas`. `omni_purchase_values` är buggig — korskolla mot
  `amount_spent × purchase_roas`.

---

## Kvar innan du slår på

- [ ] **Testköp** på laclinicadelasador.mx så Purchase-eventet bevisligen triggar.
      Utan det optimerar Meta mot ingenting. *(Axel)*
- [ ] **Domänverifiering + Aggregated Event Measurement** för laclinicadelasador.mx. *(Axel)*
- [ ] **Pixelbeslut.** `776922878287560` heter "Grillkliniken", ägs av businessen SnarkLös
      och fyrar från grillkliniken.se, grillklinikken.no **och** laclinicadelasador.mx —
      signalen delas över tre länder. Det är den enda pixeln på kontot och den som din
      redan live-körande "Grillborsten MX" använder, så den är vald. Egen MX-pixel ger
      renare data men startar inlärningen från noll. *(Axel)*
- [ ] **Budgetbeslut** enligt de tre vägarna ovan. *(Axel)*
- [ ] **Slå på kampanjen.**

---

## Annonstexter

En text per **koncept** — delas av konceptets hookvarianter och av båda destinationerna,
eftersom hooken varierar videon och inte captionen. Texterna ligger i `build-kampanj-1.py`
och är inne i Meta. Källa för formuleringarna: `voc-research.md`.

Koncept 3-texten skrevs 2026-08-18 av copy-subagent (sonnet) enligt modellpolicyn i
CLAUDE.md regel 6, med `docs/copy-regler.md` som krav. Tre-frågorstestet redovisat 3/3 på
varje bärande rad.

⚠️ **"Directo al lavavajillas"** står i koncept 1, 2, 4, 5, 6, 7, 8 och bildannonserna.
Axel har påpekat att diskmaskin är ovanligt i Mexiko (samma invändning gav han på
listicle-bilderna). Videornas voiceover säger samma sak, så texten är inte ändrad
ensidigt. **Koncept 3 använder redan `se enjuaga en segundos` i stället** — jämför de två
i avläsningen, det är ett gratis A/B-test på den frasen.

**Ad 9 esposa** använder tills vidare koncept 2:s text (samma fru/present-vinkel). Egen
copy skrivs när den ska skalas.
