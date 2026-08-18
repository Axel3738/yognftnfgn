# Launch 1 — GreatGrill MX · testkampanj

**Skapad:** 2026-08-17 · **Budget:** 2 000 kr/dag · **Status:** färdig att klickas in i Ads Manager.
⚠️ **Jag har ingen Meta-koppling i den här sessionen** (bara Shopify, Notion, Drive, Higgsfield, GitHub). Den här filen är en exakt bygglista — någon med kontoåtkomst klickar in den.

---

## 0. VERIFIERA FÖRE DU RÖR NÅGOT (5 min — det här är pengarna)

CLAUDE.md: *"Två verksamheter. Blanda dem aldrig. Fel annonskonto kostar riktiga pengar."*

- [ ] **Annonskonto-ID.** "Snark Mexico" är INTE SnarkLös `1346450049878358` (SEK, Grillkliniken Sverige) och INTE MagiBorsten `1867947880635861` (Bäverbutiken). Skriv ner det faktiska MX-konto-ID:t här: `________________`
- [ ] **Valuta på kontot:** SEK eller MXN? Avgör budgetsiffrorna nedan.
- [ ] **Pixel.** Måste vara den pixel som ligger installerad på **laclinicadelasador.mx** — aldrig Bäverbutikens `1554276343018184`, aldrig Grillklinikens. Fel pixel = köpen bokförs på fel verksamhet och all analys blir fel, utan felmeddelande. Pixel-ID: `________________`
- [ ] **Testköp gjort** så att Purchase-eventet faktiskt triggar (annars optimerar Meta mot ingenting).
- [ ] **Facebook-sida** kopplad = La Clínica del Asador (inte Grilltips/Bryn/svenska sidor).
- [ ] **Domänverifiering + Aggregated Event Measurement** för laclinicadelasador.mx.

---

## 1. Budget

Angivet: **2 000 kr/dag**. Fördelat på 6 adsets = **333 kr/adset/dag** (≈ 600 MXN vid 1,79 MXN/SEK).

Är kontot i MXN och du menade 2 000 **MXN**/dag: kör då bara **3 adsets** (AS1, AS2, AS6) à 667 MXN — sex adsets på den budgeten svälter ihjäl varandra och ger ingen läsbar data.

---

## 2. Kampanjnivå

| Fält | Värde |
|---|---|
| Namn | `CLIN_SALES_20260817` |
| Mål | Försäljning (Sales) |
| Kampanjbudget (CBO) | **AV** — budget ligger på adset-nivå (CLAUDE.md regel 11: tester i ABO, aldrig i skalnings-CBO) |
| Advantage+ shopping | AV |
| Attribution | 7 dagar klick / 1 dag visning |

## 3. Adset-nivå (6 st, identiska inställningar)

| Fält | Värde |
|---|---|
| Budget | 333 kr/dag per adset |
| Optimering | **Purchase** (inte Landing Page Views, inte ATC) |
| Land | Mexiko |
| Ålder | 25–65 |
| Kön | Alla (esposa/esposo-vinklarna riktas mot kvinnor) |
| Målgrupp | **Broad** — inga intressen, ingen LAL (nytt konto, ingen pixeldata att bygga på) |
| Placeringar | Advantage+ (alla) |
| Schema | Starta imorgon 00:00 lokal tid, inget slutdatum |

**Adset-namn** (konventionen `{audience}_{placement}_{optimization}` + konceptsuffix eftersom ett koncept per adset):

| # | Adset-namn | Innehåll |
|---|---|---|
| AS1 | `broad_advplus_purchase_c2familia` | Koncept 2, 3 hooks |
| AS2 | `broad_advplus_purchase_c6top3` | Koncept 6, 3 hooks |
| AS3 | `broad_advplus_purchase_c1foilstop` | Koncept 1, 3 hooks |
| AS4 | `broad_advplus_purchase_c7dinero` | Koncept 7, 3 hooks |
| AS5 | `broad_advplus_purchase_c8sazon` | Koncept 8, 3 hooks |
| AS6 | `broad_advplus_purchase_statics` | 6 bildannonser |

Ett koncept per adset = hooken är enda variabeln inom adsetet. Blanda aldrig koncept i samma adset — då går hook-läsningen förlorad.

---

## 4. Annonsnivå — 21 annonser

**Destination för ALLA:** produktsidan. Listicle-versionerna kan inte launchas än — GemPages-sidorna är inte byggda. Destinationstestet startar när URL:erna finns (se `testmatris.md`).

**Bas-URL:** `https://laclinicadelasador.mx/products/roterande-grillkorg-i-rostfritt-stal-perfekt-for-gronsaker-kott-tillbehor`
**Lägg på UTM per annons:** `?utm_source=fb&utm_medium=paid&utm_campaign=clin_mx_2026q3&utm_content=<ANNONSNAMNET>`

### AS1 — `broad_advplus_purchase_c2familia`
| Din fil | Annonsnamn i Meta |
|---|---|
| `2 HOOK A.mp4` | `clin_greatgrill_pain_ugc_familia_v1_pdp` |
| `2 HOOK B.mp4` | `clin_greatgrill_pain_ugc_alvapor_v1_pdp` |
| `2 HOOK C.mp4` | `clin_greatgrill_pain_ugc_esposa_v1_pdp` |

### AS2 — `broad_advplus_purchase_c6top3`
| Din fil | Annonsnamn i Meta |
|---|---|
| `Ad 6 H1 v2.mp4` | `clin_greatgrill_curiosity_comparison_top3_v1_pdp` |
| `Ad 6 H2 v2.mp4` | `clin_greatgrill_curiosity_comparison_dosdetres_v1_pdp` |
| `Ad 6 H3 v2.mp4` | `clin_greatgrill_fomo_comparison_antesdecomprar_v1_pdp` |

### AS3 — `broad_advplus_purchase_c1foilstop`
| Din fil | Annonsnamn i Meta |
|---|---|
| `1 HOOK A.mp4` | `clin_greatgrill_pain_ugc_foilstop_v1_pdp` |
| `1 HOOK B.mp4` | `clin_greatgrill_pain_ugc_vaporadentro_v1_pdp` |
| `1 HOOK C.mp4` | `clin_greatgrill_pain_ugc_cebollita_v1_pdp` |

### AS4 — `broad_advplus_purchase_c7dinero`
| Din fil | Annonsnamn i Meta |
|---|---|
| `7 H1.mp4` | `clin_greatgrill_pain_ugc_dinero_v1_pdp` |
| `7 H2.mp4` | `clin_greatgrill_pain_ugc_diezpesos_v1_pdp` |
| `7 H3.mp4` | `clin_greatgrill_pain_ugc_asadorcome_v1_pdp` |

### AS5 — `broad_advplus_purchase_c8sazon`
| Din fil | Annonsnamn i Meta |
|---|---|
| `8 HOOK A.mp4` | `clin_greatgrill_curiosity_ugc_sazon_v1_pdp` |
| `8 HOOK B.mp4` | `clin_greatgrill_curiosity_ugc_miraparrilla_v1_pdp` |
| `8 HOOK C.mp4` | `clin_greatgrill_curiosity_ugc_fuegosabor_v1_pdp` |

### AS6 — `broad_advplus_purchase_statics`
Alla 6 PNG:er ur `market-expansion/mx/ads/` — annonsnamn = filnamnet utan `.png`, plus `_pdp`:
`..._pain_beforeafter_crudoquemado_v1_pdp` · `..._benefit_collage_features_v1_pdp` · `..._identity_lifestyle_3idiomas_v1_pdp` · `..._benefit_product_medidas_v1_pdp` · `..._offer_comparison_nogira_v1_pdp` · `..._social_ugc_esposo_v1_pdp`

---

## 5. Hålls tillbaka till våg 2

| Creative | Varför |
|---|---|
| Koncept 4 plancha (`4 H1/H2/H3.mp4`) | Klar men nedprioriterad — går in när en förlorare killas |
| Koncept 5 quickrec (3 × `.mov`) | Samma |
| Ad 9 esposa (`9.mp4`) | Ensam creative, ingen hook-trio — vänta tills den kan fylla ett eget adset |
| Koncept 3 crudoquemado ⭐ | **Ej klar hos redigerarna.** Detta är repots prioritet 1 (bäst research-stöd) — in i egen adset så fort den levereras |
| Ad 10 porfinsesienta, Ad 11 trompo | Ej klara |

---

## 6. Avläsning och kill (CLAUDE.md regel 3 + ANALYSMETOD)

- **Ingen dom före 300 kr spend eller 3 köp per annons.** Vid 333 kr/adset/dag och 3 annonser/adset tar det ~3 dagar innan första annonsen är dömbar.
- **Dag 1–2:** rör ingenting. Titta bara att leveransen igång och att Purchase-eventet trackar.
- **Dag 3:** första hook-läsningen på tidiga signaler (CTR, CPC, hook-rate/3s-views, ATC) — men inga kill-beslut på köp än.
- **Dag 4–5:** kill mot **break-even** (BE-ROAS 1,45–1,55 beroende på bundlenivå, bidrag 417–813 MXN/order). Aldrig mot target.
- **Rangordna på vinstbidrag** `(break-even-CPA − CPA) × köp` — aldrig ROAS eller CPA ensamt. Top spendern är benchmark, inte en kandidat att döma mot småannonser.
- Meta-fältnamn vid uthämtning: `amount_spent`, `actions:omni_purchase`, `cost_per_omni_purchase`, `purchase_roas`. `omni_purchase_values` är buggig — korskolla mot `amount_spent × purchase_roas`.

## 7. Efter launch

- [ ] Logga launchade creatives: `node pipeline/quota.mjs log greatgrill 21`
- [ ] När GemPages-sidorna är live: spegla AS1–AS6 med `_lst<N>`-destinationer (se `testmatris.md`)
- [ ] Fyll i verkligt konto-ID och pixel-ID överst i den här filen så nästa session vet

---

## 4b. Annonstexter (primary text / headline / description / CTA)

En text per **koncept** — delas av konceptets 3 hooks (hooken varierar videon, inte captionen). Skriven av copy-subagent (sonnet) per modellpolicyn, tre-frågorstestet redovisat i agentens leverans. Klistra in ordagrant, översätt inte tillbaka.

### AS1 — familia
```
Esta canasta fue lo único que me hizo dejar el aluminio en la carne asada.

Antes mis camarones salían crudos por dentro o quemados por fuera — nunca esas rayas de asador de verdad.

Ahora nomás le echo todo, cierro, giro — y sale parejo cada vez.

Directo al lavavajillas, con garantía de por vida.

Compré dos con el paquete: una para mí, otra de regalo para mi esposa. Ya nunca asamos sin ella.

Hasta 42% de descuento + envío gratis a todo México. 4.8 estrellas y más de 240 reseñas.
```
**Headline:** `Un regalo que usan los dos` · **Description:** `Ideal para regalo, 2 pack` · **CTA:** Comprar

### AS2 — top3
```
Aluminio, tapetes o canasta giratoria: probamos los tres para asar camarones y verduras chicas.

#1 el aluminio: no se cae nada, pero bloquea el calor y la flama.

#2 los tapetes: es como cocinar en un sartén, pero afuera.

#3 la canasta giratoria de acero inoxidable: la flama llega directo a la comida y nada se cae por el asador.

Directo al lavavajillas.

Hasta 42% de descuento + envío gratis a todo México + garantía de por vida.
```
**Headline:** `El #3 sí le da sabor de verdad` · **Description:** `Top 3 para asar comida chica` · **CTA:** Comprar

### AS3 — foilstop
```
Cierras el paquete de aluminio y adentro pasa esto: se hace vapor, no fuego.

Tus camarones y verduras se cuecen al vapor — sin rayas de asador, sin sabor ahumado.

Con la canasta giratoria de acero inoxidable, la flama llega directo a la comida y nada se cae por el asador.

Le echas todo, cierras, giras. Directo al lavavajillas al terminar.

Hasta 42% de descuento + envío gratis a todo México + garantía de por vida. 4.8 estrellas y más de 240 reseñas.
```
**Headline:** `Nada de vapor. Puro sabor a asador.` · **Description:** `Rayas de asador de verdad` · **CTA:** Comprar ahora

### AS4 — dinero
```
El verano pasado tiré comida por el asador — como dos mil pesos, calculando de volada.

La mitad de mis verduras y camarones se me caían directo a las brasas, y lo demás se pegaba o se quemaba.

El aluminio y los tapetes no resolvieron nada — nunca esas rayas de asador de verdad.

Con la canasta giratoria nada se cae, y la comida tiene contacto directo con la flama. Nomás le echas, giras, y directo al lavavajillas.

Cómprala una vez y ahorra en cada carne asada. Hasta 42% de descuento + garantía de por vida.
```
**Headline:** `Deja de tirar dinero al asador` · **Description:** `Nada se cae. Nunca más.` · **CTA:** Comprar ahora

### AS5 — sazon
```
Si sazonas tus brochetas, estás tirando tu sazón a la basura.

En cuanto las volteas, la mitad se raspa contra el asador — ese sabor se va a las brasas, no a tu comida.

En la canasta giratoria todo va junto en un solo lugar: sazonas una vez y el sazón se queda en la comida.

Los agujeros son tan chicos que nada se te cae.

Desatornillas el mango en dos segundos — directo al lavavajillas.

Hasta 42% de descuento + envío gratis a todo México + garantía de por vida.
```
**Headline:** `Una sazonada. Sabor real.` · **Description:** `Tu sazón, no las brasas` · **CTA:** Más información

### AS6 — statics (samma text under alla 6 bilder)
```
Cierre seguro, acero inoxidable y gira 360° — nada se te cae por el asador.

Le echas todo, cierras la tapa, la giras. Rayas de asador de verdad, sin aluminio y sin tapetes que bloqueen el fuego.

Mango desmontable, malla fina, se enjuaga en un minuto — o directo al lavavajillas.

Sirve para gas, carbón o pellets. Garantía de por vida.

Hasta 42% de descuento + envío gratis a todo México. 4.8 estrellas y más de 240 reseñas.
```
**Headline:** `Gira 360°. Nada se cae.` · **Description:** `Envío gratis a México` · **CTA:** Comprar ahora

### Färdigskrivet men parkerat (våg 2)

**plancha** (koncept 4): *"Cocinaste 20 minutos. Vas a tallar la plancha otros 10. / Una plancha cerrada bloquea el fuego por completo — los jugos se quedan ahí, nada agarra humo. / La canasta giratoria es de acero inoxidable, tan ligera que la levantas con una mano. / La malla abierta deja pasar la flama y el humo — pero los agujeros son tan chicos que nada se te cae. / Desatornillas el mango y va directo al lavavajillas. / Hasta 42% de descuento + garantía de por vida. 4.8 estrellas y más de 240 reseñas."*
Headline: `Más ligera. Más limpia. Más sabor.` · Description: `Se levanta con una mano` · CTA: Más información

**quickrec** (koncept 5): *"Muchos todavía usan aluminio como si no hubiera nada mejor. Sí lo hay. / Te recomiendo la canasta giratoria: le echas camarones, verduras, todo lo chico para el asador — y salen rayas de asador de verdad, cada vez. / Directo al lavavajillas al terminar. / Hasta 42% de descuento + envío gratis a todo México + garantía de por vida."*
Headline: `Sí hay algo mejor que el aluminio` · Description: `Rayas de verdad, cada vez` · CTA: Comprar ahora

**Saknas ännu:** annonstext för koncept 3 (crudoquemado), 9 (esposa), 10 (porfinsesienta), 11 (trompo) — skrivs när de creativesen är klara.
