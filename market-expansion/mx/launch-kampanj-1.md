# Launch 1 — GreatGrill MX · testkampanj

**Skapad:** 2026-08-17 · **Byggd i Meta:** 2026-08-18 · **Budget:** 2 000 kr/dag
**Status: BYGGD OCH KLAR I ADS MANAGER — kampanjen ligger PAUSED.**

Kampanjen är byggd via Marketing API mot **Snark mexico `act_918424617391896`**.
Adsets och annonser är ACTIVE, **kampanjen är PAUSED** — Axel slår på *en* switch
(kampanjnivån) så går allting live samtidigt. Inget spenderas innan dess.

| | |
|---|---|
| Kampanj-ID | `120252843641270349` |
| Annonskonto | `act_918424617391896` "Snark mexico" · **SEK** · tidszon Mexico/General |
| Sida | La Clínica del Asador `1334949959694822` |
| Pixel | `776922878287560` (se varningen i avsnitt 0) |
| Byggskript | `market-expansion/mx/build-kampanj-1.py` (resumebart) |

---

## 0. VERIFIERING — GJORD 2026-08-18

- [x] **Annonskonto verifierat via API:** `{"name":"Snark mexico","currency":"SEK","account_status":1,"timezone_name":"Mexico/General","business_name":"STONEBITE ECOM AB"}`. Det är alltså **inte** SnarkLös `1346450049878358` och **inte** MagiBorsten `1867947880635861`. ✅
- [x] **Valuta: SEK.** 2 000 kr/dag = 6 adsets à 333 kr, precis som specat. ✅
- [x] **Facebook-sida:** La Clínica del Asador `1334949959694822` — samma sida som kontots redan live-körande MX-kampanj använder. ✅
- [x] **Pixel: `776922878287560`.** ⚠️ Den heter "Grillkliniken" och ägs av businessen SnarkLös. Det är den **enda** pixeln på kontot, och den är redan den som den live-körande kampanjen "Grillborsten MX" optimerar mot. Den fyrar från grillkliniken.se, grillklinikken.no **och** laclinicadelasador.mx — signalen delas alltså över tre länder. Sista fyrning 2026-08-18 01:58, så MX-events landar. **Det finns inget alternativ på kontot i dag** — vill du separera MX-signalen krävs en ny pixel på laclinicadelasador.mx, och då börjar inlärningen om från noll.
- [ ] **Testköp** så Purchase-eventet bevisligen triggar från MX-sidan innan du slår på. *(Axel)*
- [ ] **Domänverifiering + Aggregated Event Measurement** för laclinicadelasador.mx. *(Axel)*

---

## 1. Budget

**2 000 kr/dag**, fördelat på 6 adsets à **333 kr/dag** (33 300 öre). Kampanjbudget (CBO) är AV
— budgeten ligger på adsetnivå enligt CLAUDE.md regel 11. **Budgetdelning mellan adsets är
avstängd** (`is_adset_budget_sharing_enabled: false`) — annars lånar adseten av varandra och
lika-budget-testet går inte att läsa.

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
| Schema | Inget start-/slutdatum satt — adseten startar i samma sekund som kampanjen slås på |
| Budgetdelning | AV (`is_adset_budget_sharing_enabled: false`) |
| Status i Meta | **ACTIVE** (spärren ligger på kampanjnivån) |

**Adset-namn** (konventionen `{audience}_{placement}_{optimization}` + konceptsuffix eftersom ett koncept per adset):

| # | Adset-namn | Innehåll | Adset-ID i Meta |
|---|---|---|---|
| AS1 | `broad_advplus_purchase_c2familia` | Koncept 2, 3 hooks | `120252843642550349` |
| AS2 | `broad_advplus_purchase_c6top3` | Koncept 6, 3 hooks | `120252843659650349` |
| AS3 | `broad_advplus_purchase_c1foilstop` | Koncept 1, 3 hooks | `120252843663580349` |
| AS4 | `broad_advplus_purchase_c7dinero` | Koncept 7, 3 hooks | `120252843669480349` |
| AS5 | `broad_advplus_purchase_c8sazon` | Koncept 8, 3 hooks | `120252843674940349` |
| AS6 | `broad_advplus_purchase_statics` | 6 bildannonser | `120252843680760349` |

Ett koncept per adset = hooken är enda variabeln inom adsetet. Blanda aldrig koncept i samma adset — då går hook-läsningen förlorad.

---

## 4. Annonsnivå — 21 annonser

**Destination för ALLA:** produktsidan. Listicle-versionerna kan inte launchas än — GemPages-sidorna är inte byggda. Destinationstestet startar när URL:erna finns (se `testmatris.md`).

**Bas-URL:** `https://laclinicadelasador.mx/products/roterande-grillkorg-i-rostfritt-stal-perfekt-for-gronsaker-kott-tillbehor`
**Lägg på UTM per annons:** `?utm_source=fb&utm_medium=paid&utm_campaign=clin_mx_2026q3&utm_content=<ANNONSNAMNET>`

### AS1 — `broad_advplus_purchase_c2familia`
| Din fil | Annonsnamn i Meta | Annons-ID |
|---|---|---|
| `2 HOOK A.mp4` | `clin_greatgrill_pain_ugc_familia_v1_pdp` | `120252843655500349` |
| `2 HOOK B.mp4` | `clin_greatgrill_pain_ugc_alvapor_v1_pdp` | `120252843656970349` |
| `2 HOOK C.mp4` | `clin_greatgrill_pain_ugc_esposa_v1_pdp` | `120252843659040349` |

### AS2 — `broad_advplus_purchase_c6top3`
| Din fil | Annonsnamn i Meta | Annons-ID |
|---|---|---|
| `Ad 6 H1 v2.mp4` | `clin_greatgrill_curiosity_comparison_top3_v1_pdp` | `120252843660850349` |
| `Ad 6 H2 v2.mp4` | `clin_greatgrill_curiosity_comparison_dosdetres_v1_pdp` | `120252843661440349` |
| `Ad 6 H3 v2.mp4` | `clin_greatgrill_fomo_comparison_antesdecomprar_v1_pdp` | `120252843663000349` |

### AS3 — `broad_advplus_purchase_c1foilstop`
| Din fil | Annonsnamn i Meta | Annons-ID |
|---|---|---|
| `1 HOOK A.mp4` | `clin_greatgrill_pain_ugc_foilstop_v1_pdp` | `120252843666590349` |
| `1 HOOK B.mp4` | `clin_greatgrill_pain_ugc_vaporadentro_v1_pdp` | `120252843667980349` |
| `1 HOOK C.mp4` | `clin_greatgrill_pain_ugc_cebollita_v1_pdp` | `120252843669180349` |

### AS4 — `broad_advplus_purchase_c7dinero`
| Din fil | Annonsnamn i Meta | Annons-ID |
|---|---|---|
| `7 H1.mp4` | `clin_greatgrill_pain_ugc_dinero_v1_pdp` | `120252843670730349` |
| `7 H2.mp4` | `clin_greatgrill_pain_ugc_diezpesos_v1_pdp` | `120252843672480349` |
| `7 H3.mp4` | `clin_greatgrill_pain_ugc_asadorcome_v1_pdp` | `120252843674440349` |

### AS5 — `broad_advplus_purchase_c8sazon`
| Din fil | Annonsnamn i Meta | Annons-ID |
|---|---|---|
| `8 HOOK A.mp4` | `clin_greatgrill_curiosity_ugc_sazon_v1_pdp` | `120252843676990349` |
| `8 HOOK B.mp4` | `clin_greatgrill_curiosity_ugc_miraparrilla_v1_pdp` | `120252843678300349` |
| `8 HOOK C.mp4` | `clin_greatgrill_curiosity_ugc_fuegosabor_v1_pdp` | `120252843680330349` |

### AS6 — `broad_advplus_purchase_statics`
| Din fil | Annonsnamn i Meta | Annons-ID |
|---|---|---|
| `clin_greatgrill_pain_beforeafter_crudoquemado_v1.png` | `clin_greatgrill_pain_beforeafter_crudoquemado_v1_pdp` | `120252843681540349` |
| `clin_greatgrill_benefit_collage_features_v1.png` | `clin_greatgrill_benefit_collage_features_v1_pdp` | `120252843682520349` |
| `clin_greatgrill_identity_lifestyle_3idiomas_v1.png` | `clin_greatgrill_identity_lifestyle_3idiomas_v1_pdp` | `120252843683760349` |
| `clin_greatgrill_benefit_product_medidas_v1.png` | `clin_greatgrill_benefit_product_medidas_v1_pdp` | `120252843684310349` |
| `clin_greatgrill_offer_comparison_nogira_v1.png` | `clin_greatgrill_offer_comparison_nogira_v1_pdp` | `120252843685660349` |
| `clin_greatgrill_social_ugc_esposo_v1.png` | `clin_greatgrill_social_ugc_esposo_v1_pdp` | `120252843686180349` |

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

- [x] ~~Logga i `pipeline/quota.mjs`~~ — **gäller inte GreatGrill.** Kvotskriptet läser `products/products.json`, som bara innehåller Bäverbutikens sex produkter. GreatGrill är Grillkliniken/SnarkLös-sidan av huset och ska enligt CLAUDE.md ("blanda dem aldrig") *inte* läggas in där. Launch-loggen för MX bor i den här filen.
- [ ] När GemPages-sidorna är live: spegla AS1–AS6 med `_lst<N>`-destinationer (se `testmatris.md`)
- [x] Konto-ID och pixel-ID ifyllda överst i den här filen 2026-08-18
- [ ] **Slå på kampanjen** — `120252843641270349` från PAUSED till ACTIVE. *(Axel)*

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
