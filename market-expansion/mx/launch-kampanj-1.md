# Launch 1 — GreatGrill MX · CBO-testkampanj

**Byggd skarpt i Meta 2026-08-18.** Kampanjen ligger **PAUSED** — allt annat är ACTIVE,
så du slår på *en* switch (kampanjnivån) och alla 42 annonser går live samtidigt.
Ingenting spenderar en krona innan dess.

| | |
|---|---|
| Kampanj | `CLIN_GG_SALES_20260818` · ID `120252844116050349` |
| Budgettyp | **CBO** — 2 000 kr/dag på kampanjnivån *(Axels beslut 2026-08-18)* |
| Annonskonto | `act_918424617391896` "Snark mexico" · **SEK** · Mexico/General · STONEBITE ECOM AB |
| Sida | La Clínica del Asador `1334949959694822` |
| Pixel | `776922878287560` + Purchase |
| Målgrupp | Broad Mexiko, 25–65, Advantage+ placeringar och Advantage audience |
| Attribution | 7 dagar klick / 1 dag visning |
| Byggskript | `build-kampanj-1.py` (produktsidan) + `build-listicle-adsets.py` (speglingen) |

---

## Destinationstestet är igång — 12 adsets, 42 annonser

Varje creative ligger i **två** adsets: ett mot produktsidan, ett mot en advertorial.
Samma annonsnamn i båda — enda skillnaden är sidan. Destinationen står i adset-namnet.

| Produktsida | Listicle-spegling | Landar på |
|---|---|---|
| `GG PRODUKTSIDA - 01 foilstop` | `GG LISTICLE 8 - 01 foilstop` | `/pages/8` — *Deja de envolver tus camarones en aluminio* |
| `GG PRODUKTSIDA - 02 familia` | `GG LISTICLE 8 - 02 familia` | `/pages/8` |
| `GG PRODUKTSIDA - 06 top3` | `GG LISTICLE 8 - 06 top3` | `/pages/8` |
| `GG PRODUKTSIDA - 07 dinero` | `GG LISTICLE 11 - 07 dinero` | `/pages/11` — *Deja de quemar la mitad de la comida* |
| `GG PRODUKTSIDA - 08 sazon` | `GG LISTICLE 13 - 08 sazon` | `/pages/13` — *Una canasta reemplaza diez brochetas* |
| `GG PRODUKTSIDA - BILDANNONSER` | `GG LISTICLE 1 - BILDANNONSER` | `/pages/1` — *7 razones para cambiar el aluminio* |

Alla produktsida-adsets pekar på
`https://laclinicadelasador.mx/products/roterande-grillkorg-i-rostfritt-stal-perfekt-for-gronsaker-kott-tillbehor`.

**`/pages/22`** (*7 razones para dejar el hierro fundido*) används inte ännu — den hör till
koncept 4 plancha, som ligger i våg 2.

Preview-nycklarna (`?_ab=0&key=…`) i Axels xlsx är **inte** använda. Det är Shopifys
förhandsgranskningslänkar; de kan sluta gälla och hör inte hemma i en annons. De rena
URL:erna svarar 200 och är publika — kontrollerat 2026-08-18.

### Adset-ID:n (listicle-sidan)

| Adset | ID |
|---|---|
| `GG LISTICLE 1 - BILDANNONSER` | `120252844324570349` |
| `GG LISTICLE 11 - 07 dinero` | `120252844316340349` |
| `GG LISTICLE 13 - 08 sazon` | `120252844320710349` |
| `GG LISTICLE 8 - 01 foilstop` | `120252844301770349` |
| `GG LISTICLE 8 - 02 familia` | `120252844309780349` |
| `GG LISTICLE 8 - 06 top3` | `120252844312920349` |

Byggt av `build-listicle-adsets.py` (resumebart). Speglingen läser produktsida-adsetets
annonser och skapar identiska kopior med bytt länk — så nya koncept speglas genom att
köra om skriptet.

---

## ⚠️ Budgeten räcker inte till 12 adsets

2 000 kr/dag delat på 12 adsets är i snitt 167 kr per adset — och CBO delar inte jämnt,
den koncentrerar. Regel 3 i CLAUDE.md säger att ingen annons får dömas under 300 kr spend
eller 3 köp. Med den här budgeten kommer merparten av de 42 annonserna aldrig upp i
dömbart läge; de kommer se ut som förlorare utan att ha testats.

**Två vägar, båda dugliga:**

1. **Höj till 4 000 kr/dag.** Då blir det ~333 kr per adset i snitt och hela matrisen är
   avläsbar på ungefär en vecka.
2. **Behåll 2 000 kr och pausa halva matrisen.** Kör destinationstestet på *ett* koncept
   först — förslagsvis 02 familia, eftersom det har flest hooks med stöd i
   `voc-research.md`. Pausa de övriga tio adseten. När destinationsfrågan är besvarad
   gäller svaret för hela biblioteket och du behöver aldrig betala för att mäta samma sak
   sex gånger.

Rekommendationen är **nr 2** om budgeten är fast: destinationseffekten är en generell
variabel, creative-effekten är unik per annons. Det är bara den senare som måste mätas
per annons.

---

## Så läses annonsnamnet

```
GG_02_H2_pain_ugc_alvapor
│  │  │  │    │   └ hook (kroken som testas)
│  │  │  │    └ format
│  │  │  └ vinkel
│  │  └ hook-variant A/B/C = H1/H2/H3
│  └ annonsnummer (samma nummer som redigerarnas fil och Google-dokumentet)
└ GreatGrill
```
Bildannonserna heter `GG_B1`–`GG_B6` i stället för nummer + hook.
Ingen `_v1` och inget `_pdp` längre — versionen bumpas först när en v2 finns, och
destinationen står i adsetet.

---

## Adsets och annonser

### `GG PRODUKTSIDA - 01 foilstop`  ·  adset-ID `120252844116540349`

| Redigerarnas fil | Annonsnamn i Meta | Annons-ID |
|---|---|---|
| `1 HOOK A.mp4` | `GG_01_H1_pain_ugc_foilstop` | `120252844117170349` |
| `1 HOOK B.mp4` | `GG_01_H2_pain_ugc_vaporadentro` | `120252844117940349` |
| `1 HOOK C.mp4` | `GG_01_H3_pain_ugc_cebollita` | `120252844118390349` |

### `GG PRODUKTSIDA - 02 familia`  ·  adset-ID `120252844118970349`

| Redigerarnas fil | Annonsnamn i Meta | Annons-ID |
|---|---|---|
| `2 HOOK A.mp4` | `GG_02_H1_pain_ugc_familia` | `120252844121100349` |
| `2 HOOK B.mp4` | `GG_02_H2_pain_ugc_alvapor` | `120252844121860349` |
| `2 HOOK C.mp4` | `GG_02_H3_pain_ugc_esposa` | `120252844122290349` |

### `GG PRODUKTSIDA - 06 top3`  ·  adset-ID `120252844122910349`

| Redigerarnas fil | Annonsnamn i Meta | Annons-ID |
|---|---|---|
| `Ad 6 H1 v2.mp4` | `GG_06_H1_curiosity_comparison_top3` | `120252844123730349` |
| `Ad 6 H2 v2.mp4` | `GG_06_H2_curiosity_comparison_dosdetres` | `120252844124580349` |
| `Ad 6 H3 v2.mp4` | `GG_06_H3_fomo_comparison_antesdecomprar` | `120252844125240349` |

### `GG PRODUKTSIDA - 07 dinero`  ·  adset-ID `120252844125870349`

| Redigerarnas fil | Annonsnamn i Meta | Annons-ID |
|---|---|---|
| `7 H1.mp4` | `GG_07_H1_pain_ugc_dinero` | `120252844126530349` |
| `7 H2.mp4` | `GG_07_H2_pain_ugc_diezpesos` | `120252844127080349` |
| `7 H3.mp4` | `GG_07_H3_pain_ugc_asadorcome` | `120252844127520349` |

### `GG PRODUKTSIDA - 08 sazon`  ·  adset-ID `120252844128040349`

| Redigerarnas fil | Annonsnamn i Meta | Annons-ID |
|---|---|---|
| `8 HOOK A.mp4` | `GG_08_H1_curiosity_ugc_sazon` | `120252844128640349` |
| `8 HOOK B.mp4` | `GG_08_H2_curiosity_ugc_miraparrilla` | `120252844129380349` |
| `8 HOOK C.mp4` | `GG_08_H3_curiosity_ugc_fuegosabor` | `120252844130280349` |

### `GG PRODUKTSIDA - BILDANNONSER`  ·  adset-ID `120252844131320349`

| Redigerarnas fil | Annonsnamn i Meta | Annons-ID |
|---|---|---|
| `clin_greatgrill_pain_beforeafter_crudoquemado_v1.png` | `GG_B1_pain_beforeafter_crudoquemado` | `120252844132140349` |
| `clin_greatgrill_benefit_collage_features_v1.png` | `GG_B2_benefit_collage_features` | `120252844133440349` |
| `clin_greatgrill_identity_lifestyle_3idiomas_v1.png` | `GG_B3_identity_lifestyle_3idiomas` | `120252844134020349` |
| `clin_greatgrill_benefit_product_medidas_v1.png` | `GG_B4_benefit_product_medidas` | `120252844134900349` |
| `clin_greatgrill_offer_comparison_nogira_v1.png` | `GG_B5_offer_comparison_nogira` | `120252844136210349` |
| `clin_greatgrill_social_ugc_esposo_v1.png` | `GG_B6_social_ugc_esposo` | `120252844136770349` |

---

## ⚠️ CBO gör hook-testet svårare att läsa — så här kompenserar du

CLAUDE.md regel 11 säger att tester ska ligga i ABO med lika budget per annons.
Axel valde CBO 2026-08-18 ändå. Konsekvensen är konkret och den kommer:
**Meta ger inom ett dygn merparten av de 2 000 kr till ett eller två adsets.**
Motorhöljet är precis det mönstret — `PD_1_H3` tog 42 % av spenden och tre hela
batcher svalt ihjäl bredvid, vilket är själva anledningen till att regeln finns.

Det betyder inte att kampanjen är fel. Det betyder att **avläsningen måste göras
annorlunda**:

- **Döm aldrig ett adset som fick under 300 kr.** Det förlorade inte — det fick
  aldrig chansen. Notera det som "ej testat", inte som förlorare.
- **Läs hooks bara inom det adset som faktiskt fick spend.** Jämför aldrig H1 i ett
  adset som fick 1 200 kr mot H1 i ett som fick 90 kr.
- **Vill du ha ett rent hook-svar:** flytta det svältande konceptet till en egen
  ABO-kampanj med 300 kr/dag och låt det gå tre dagar.
- Sätt gärna **minimibelopp per adset** i Ads Manager om du vill tvinga fram
  spridning — det är CBO:ns enda motmedel.

---

## Avläsning och kill (CLAUDE.md regel 3 + `docs/os/ANALYSMETOD.md`)

- **Ingen dom före 300 kr spend eller 3 köp per annons.**
- **Dag 1–2:** rör ingenting. Kontrollera bara att leveransen går och att
  Purchase-eventet trackar.
- **Dag 3:** första hook-läsningen på tidiga signaler (CTR, CPC, 3s-views, ATC) —
  inga kill-beslut på köp än.
- **Dag 4–5:** kill mot **break-even** (BE-ROAS 1,45–1,55 beroende på bundlenivå,
  bidrag 417–813 MXN/order). Aldrig mot target.
- **Rangordna på vinstbidrag** `(break-even-CPA − CPA) × köp` — aldrig ROAS eller CPA
  ensamt. Top spendern är benchmark, inte en kandidat att döma mot småannonser.
- Fältnamn vid uthämtning: `amount_spent`, `actions:omni_purchase`,
  `cost_per_omni_purchase`, `purchase_roas`. `omni_purchase_values` är buggig —
  korskolla mot `amount_spent × purchase_roas`.

---

## Hålls tillbaka till våg 2

| Creative | Varför |
|---|---|
| Koncept 4 plancha (`4 H1/H2/H3.mp4`) | Klar och uppladdad i mediabiblioteket — går in när en förlorare killas |
| Koncept 5 quickrec/pov/oferta (3 × `.mov`) | Samma |
| Ad 9 esposa (`9.mp4`) | Ensam creative, ingen hook-trio — vänta tills den kan fylla ett eget adset |
| Koncept 3 crudoquemado ⭐ | **Ej klar hos redigerarna.** Repots prioritet 1 (bäst research-stöd) — eget adset så fort den levereras |
| Ad 10 porfinsesienta, Ad 11 trompo | Ej klara |

Annonstext saknas ännu för koncept 3, 9, 10 och 11 — skrivs när creativesen är klara.

---

## Kvar innan du slår på

- [ ] **Testköp** på laclinicadelasador.mx så Purchase-eventet bevisligen triggar.
      Utan det optimerar Meta mot ingenting. *(Axel)*
- [ ] **Domänverifiering + Aggregated Event Measurement** för laclinicadelasador.mx. *(Axel)*
- [ ] **Pixelbeslut.** `776922878287560` heter "Grillkliniken", ägs av businessen
      SnarkLös och fyrar från grillkliniken.se, grillklinikken.no **och**
      laclinicadelasador.mx — signalen delas över tre länder. Det är den enda pixeln
      på kontot och den som din redan live-körande "Grillborsten MX" använder, så den
      är vald. Egen MX-pixel ger renare data men startar inlärningen från noll. *(Axel)*
- [ ] **Slå på kampanjen** `120252844116050349` — PAUSED → ACTIVE.

## Efter launch

- [x] Listicle-sidorna byggda och speglade som egna adsets 2026-08-18
- [x] ~~`node pipeline/quota.mjs log`~~ — gäller inte GreatGrill. Kvotskriptet läser
      `products/products.json`, som bara innehåller Bäverbutikens sex produkter.
      GreatGrill hör till Grillkliniken/SnarkLös och ska enligt CLAUDE.md ("blanda dem
      aldrig") inte in där. Launch-loggen för MX bor i den här filen.

---

## Annonstexter (primary text / headline / description / CTA)

En text per **koncept** — delas av konceptets tre hooks, eftersom hooken varierar
videon och inte captionen. Skriven av copy-subagent (sonnet) enligt modellpolicyn.
Texterna ligger inbyggda i `build-kampanj-1.py` och är redan inne i Meta.
Källan för formuleringarna är `voc-research.md`.

⚠️ **"Directo al lavavajillas" står i nästan varje text.** Axel har själv påpekat att
diskmaskin är ovanligt i Mexiko (samma invändning gav han på listicle-bilderna).
Videornas voiceover säger samma sak, så texten är inte ändrad ensidigt — men byt till
`se enjuaga en segundos` i captionsen om nästa avläsning visar svag CTR.
