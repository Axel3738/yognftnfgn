# Kaching Bundles – Byggmall för Beverbutikken (NO)

**Syfte:** Återskapa Bäverbutikens (SE) Kaching Bundles-mängdrabatter i norska butiken
**Beverbutikken** (`1acuam-s5.myshopify.com`, valuta **NOK**) för 16 produkter.
Kaching saknar API – allt byggs manuellt i appens admin. Denna mall är gjord för copy-paste,
fält för fält.

> ## ⚠️ Viktig status: SE-analysen kunde inte genomföras från denna miljö
>
> Denna session körs i en sandlåda där **all utgående webbtrafik är blockerad av
> nätverkspolicyn** (verifierat: `baverbutiken.se` ger 403 "policy denial" via egress-proxyn,
> samma för alla externa domäner och archive.org; WebFetch svarar `EGRESS_BLOCKED`).
> De 16 svenska produktsidorna gick därför **inte** att läsa, och de faktiska
> SE-inställningarna (antal tiers, rabattsatser, badge-texter, färger) kunde inte extraheras.
>
> **Konsekvens:** Alla fält märkta **⚠️ SE** nedan måste fyllas i från den svenska butiken.
> Snabbaste sättet: öppna **Kaching Bundles-admin i SE-butiken** (Shopify admin → Appar →
> Kaching Bundles → Deals) – där listas alla deals med exakta tiers, rabatter, texter och
> designinställningar på ett ställe. Alternativ: öppna respektive SE-produktsida och läs av
> widgeten visuellt (tiers/badges/texter) – men färg-hex och interna inställningar syns bara i appen.
>
> Som fallback innehåller mallen en **standardstege** (1 / 2 / 3 st med −10 % / −20 %) med
> färdigräknade NOK-priser, tydligt märkt som förslag. Ersätt den med SE-värdena när de hämtats.

**Verifierat mot norska butiken via Shopify Admin API (2026-08-07):** alla 16 produkter finns,
är `ACTIVE`, och handles/GID/priser/varianter nedan är hämtade live – inte antagna.

---

## 1. Att läsa av i SE-butiken (checklista per deal)

Fyll i detta formulär per produkt innan du bygger (eller ha Kaching-admin öppen i annan flik):

| Fält | Var i Kaching (SE) |
|---|---|
| Antal tiers/bars | Deal → Bars |
| Kvantitet per tier | Bar → Quantity |
| Rabatttyp + värde per tier | Bar → Discount (Percentage / Fixed / Specific price) |
| Förvald tier | Bar → "Selected by default" |
| Bar-titel per tier | Bar → Title (t.ex. "2 st") |
| Undertext per tier | Bar → Subtitle (t.ex. "Du sparar 70 kr") |
| Badge/label per tier | Bar → Label (t.ex. "Mest populär") |
| Widget-rubrik | Deal/design → Block title (t.ex. "Köp fler, spara mer") |
| Färger (hex) | Settings → Design: primär/highlight, badge-bakgrund, badge-text, ram, radie |
| Variantväljare på/av | Deal → "Let customers choose variants" |

**OBS rabatttyp:** Procentrabatter kan kopieras rakt av SE→NO. **Fasta belopp eller
"specific price" i SEK måste räknas om till NOK** – kopiera inte siffran rakt av.

---

## 2. Designinställningar (globala i Kaching, ställs in en gång)

| Kaching-fält | Värde |
|---|---|
| Primär-/highlightfärg | ⚠️ SE – kopiera hex från SE-appens Design-inställningar |
| Badge-bakgrund / badge-text | ⚠️ SE |
| Ram/border + hörnradie | ⚠️ SE |
| Visa pris per styck | ⚠️ SE (rekommenderat: PÅ) |
| Visa "du sparar" | ⚠️ SE (rekommenderat: PÅ) |

---

## 3. Norsk textbank (copy-paste)

Standardtexter för widgetens fält, på norska (bokmål). Justera mot SE-motsvarigheten när den lästs av:

| Fält | Norsk text |
|---|---|
| Widget-rubrik | `Kjøp flere – spar mer!` |
| Bar-titel, 1 st | `1 stk` |
| Bar-titel, 2 st | `2 stk` |
| Bar-titel, 3 st | `3 stk` |
| Undertext (besparing) | `Du sparer {beløp} kr` |
| Undertext (standard) | `Standardpris` |
| Badge 1 | `Mest populær` |
| Badge 2 | `Best verdi` |
| Badge (alternativ) | `Bestselger` |
| Pris per styck-etikett | `{pris} kr/stk` |
| Totalt-etikett | `Totalt` |
| Ord. pris-etikett | `Førpris` |
| Fraktargument (om SE har det) | `Gratis frakt` |

Vanliga SE→NO-översättningar: *Mest populär → Mest populær · Bäst värde → Best verdi ·
Du sparar → Du sparer · Köp fler spara mer → Kjøp flere spar mer · st → stk ·
Ord. pris → Førpris · Erbjudande → Tilbud*

---

## 4. Standardstege (fallback tills SE-värdena hämtats)

**Förslag, ej SE-verifierat:** 3 bars — `1 stk` (0 %), `2 stk` (−10 %, förvald, badge
`Mest populær`), `3 stk` (−20 %, badge `Best verdi`). Procentrabatt, inte fast belopp
(fungerar även för produkter med olika variantpriser). Kaching räknar ut exakta priser själv;
ca-beloppen nedan är för undertexterna (`Du sparer … kr`).

---

## 5. De 16 dealsen (copy-paste-kort)

Alla handles, GID och priser verifierade live i Beverbutikken. "Variantväljare" = slå på
Kachings variantval per rad när produkten har fler varianter.

### 5.1 Marint Motortrekk 420D – Universell Beskyttelse
- **SE-källa:** `marin-motorholje-420d-universellt-skydd` — ⚠️ SE-tiers ej avlästa
- **NO-produkt:** `marint-motortrekk-420d-universell-beskyttelse` · `gid://shopify/Product/15525898682743`
- **Pris:** 299 kr · **Varianter:** 30 (färg × hk-storlek) → **Variantväljare: PÅ**
- Fallback: 2 stk −10 % ≈ 538 kr (`Du sparer 60 kr`) · 3 stk −20 % ≈ 718 kr (`Du sparer 179 kr`)

### 5.2 Beverkobling – ⚠️ DUBBLETT, välj rätt produkt
- **SE-källa:** `superkoppling`
- **✅ ANVÄND:** `beverkobling-slipp-kronglete-kabelsko` · `gid://shopify/Product/15525629165943`
  — skapad 2026-08-06 i samma batch som övriga 15, vendor `Beverbutikken`, SKU `BEVER-DIV-001`, 350 kr
- **❌ ANVÄND INTE:** `beverkobling-slipp-kjedelige-kabelsko` · `gid://shopify/Product/15447671505271`
  — gammal dublett från 2026-04-06, vendor `Beverkobling.no`, saknar SKU. **Båda är ACTIVE** –
  rekommendation: arkivera den gamla så att dealen inte hamnar på fel produkt och kunder inte
  landar på en sida utan bundle.
- **Pris:** 350 kr · **Varianter:** 1 → Variantväljare: AV
- Fallback: 2 stk −10 % = 630 kr (`Du sparer 70 kr`) · 3 stk −20 % = 840 kr (`Du sparer 210 kr`)

### 5.3 Bevertrakt – Fyll drivstoff raskt uten søl
- **SE-källa:** `bavertratt-tanka-utan-spill`
- **NO-produkt:** `bevertrakt-fyll-drivstoff-raskt-uten-sol` · `gid://shopify/Product/15525630148983`
- **Pris:** 149 kr · **Varianter:** 5 färger (Rød/Blå/Grønn/Hvit/Gul) → **Variantväljare: PÅ**
- Fallback: 2 stk −10 % ≈ 268 kr (`Du sparer 30 kr`) · 3 stk −20 % ≈ 358 kr (`Du sparer 89 kr`)

### 5.4 Seteovertrekk for Ridegressklipper – Slitesterkt 600D Oxford
- **SE-källa:** `satesoverdrag-for-akgrasklippare-slittaligt-600d-oxford`
- **NO-produkt:** `seteovertrekk-for-ridegressklipper-slitesterkt-600d-oxford` · `gid://shopify/Product/15525630378359`
- **Pris:** 649 kr · **Varianter:** 4 färger (Grå/Svart/Grønn/Lysegrå) → **Variantväljare: PÅ**
- OBS: förväxla inte med `gressklipperdeksel-600d-oxford-med-strammesnor` (maskinöverdrag, annan produkt)
- Fallback: 2 stk −10 % ≈ 1 168 kr (`Du sparer 130 kr`) · 3 stk −20 % ≈ 1 558 kr (`Du sparer 389 kr`)

### 5.5 Gjenbrukbar Hagesekk med Håndtak – Kraftig for Løv & Gress
- **SE-källa:** `ateranvandbar-tradgardssack-med-handtag-kraftig-for-lov-gras`
- **NO-produkt:** `gjenbrukbar-hagesekk-med-handtak-kraftig-for-lov-gress` · `gid://shopify/Product/15525899403639`
- **Pris:** 199–318 kr (varianter 60 L / 120 L / 300 L) → **Variantväljare: PÅ**
- **Måste vara %-rabatt** (variantpriserna skiljer sig – fast pris per tier blir fel)
- Fallback (60 L-basen): 2 stk −10 % ≈ 358 kr (`Du sparer 40 kr`) · 3 stk −20 % ≈ 478 kr (`Du sparer 119 kr`)

### 5.6 Skulderbelte for Trimmer – Justerbart Nylonbelte
- **SE-källa:** `axelbalte-for-trimmer-justerbart-nylonbalte`
- **NO-produkt:** `skulderbelte-for-trimmer-justerbart-nylonbelte` · `gid://shopify/Product/15525631066487`
- **Pris:** 599 kr · **Varianter:** 1 → Variantväljare: AV
- OBS: butiken har även `trimmersele-…` (299 kr) och `dobbel-skulderstropp-…` (579 kr) – detta är rätt
  produkt (exakt titelspegel av SE)
- Fallback: 2 stk −10 % ≈ 1 078 kr (`Du sparer 120 kr`) · 3 stk −20 % ≈ 1 438 kr (`Du sparer 359 kr`)

### 5.7 Herreshorts 3-Pack – Hurtigtørkende Treningsshorts
- **SE-källa:** `herrshorts-3-pack-snabbtorkande-traningsshorts`
- **NO-produkt:** `herreshorts-3-pack-hurtigtorkende-treningsshorts` · `gid://shopify/Product/15525629919607`
- **Pris:** 459 kr · **Varianter:** 5 storlekar (S–XXL) → **Variantväljare: PÅ**
- OBS: produkten är redan ett 3-pack – kontrollera i SE hur tiers är satta (1/2/3 *pack*, inte plagg)
- Fallback: 2 stk −10 % ≈ 826 kr (`Du sparer 92 kr`) · 3 stk −20 % ≈ 1 102 kr (`Du sparer 275 kr`)

### 5.8 Lastenett – Kraftig Tilhengernett for Sikker Transport
- **SE-källa:** `lastnat-kraftigt-slapvagnsnat-for-saker-transport`
- **NO-produkt:** `lastenett-kraftig-tilhengernett-for-sikker-transport` · `gid://shopify/Product/15525631263095`
- **Pris:** 399–499 kr (200×150 / 300×200 cm) → **Variantväljare: PÅ** · **Måste vara %-rabatt**
- Fallback (399-basen): 2 stk −10 % ≈ 718 kr (`Du sparer 80 kr`) · 3 stk −20 % ≈ 958 kr (`Du sparer 239 kr`)

### 5.9 Strandtøfler for Herre – Sklisikre Hagesko
- **SE-källa:** `strandtofflor-for-herr-halkfria-tradgardsskor`
- **NO-produkt:** `strandtofler-for-herre-sklisikre-hagesko` · `gid://shopify/Product/15525899665783`
- **Pris:** 349 kr · **Varianter:** 36 (storlek 36–47 × färg) → **Variantväljare: PÅ**
- Fallback: 2 stk −10 % ≈ 628 kr (`Du sparer 70 kr`) · 3 stk −20 % ≈ 838 kr (`Du sparer 209 kr`)

### 5.10 Oppblåsbart Liggeunderlag TPU – Ultralett Sovematte for Camping
- **SE-källa:** `uppblasbar-liggunderlag-tpu-ultralatt-sovdyna-for-camping`
- **NO-produkt:** `oppblasbart-liggeunderlag-tpu-ultralett-sovematte-for-camping` · `gid://shopify/Product/15525898453367`
- **Pris:** 709 kr · **Varianter:** 1 ("1 stk") → Variantväljare: AV
- Fallback: 2 stk −10 % ≈ 1 276 kr (`Du sparer 142 kr`) · 3 stk −20 % ≈ 1 702 kr (`Du sparer 425 kr`)

### 5.11 Golfkølle-børste med Vannspray – Bærbar Rengjøring
- **SE-källa:** `golfklubbsborste-med-vattenspray-portabel-rengoring`
- **NO-produkt:** `golfkolle-borste-med-vannspray-baerbar-rengjoring` · `gid://shopify/Product/15525897470327`
- **Pris:** 280 kr · **Varianter:** 1 → Variantväljare: AV
- Fallback: 2 stk −10 % = 504 kr (`Du sparer 56 kr`) · 3 stk −20 % = 672 kr (`Du sparer 168 kr`)

### 5.12 Lettvektsryggsekk – Turveske med Stavfeste
- **SE-källa:** `lattviktsryggsack-vandringsvaska-med-stavfaste`
- **NO-produkt:** `lettvektsryggsekk-turveske-med-stavfeste` · `gid://shopify/Product/15525629493623`
- **Pris:** 729 kr · **Varianter:** 6 färger (Blå/Grønn/Oransje/Svart/Rød …) → **Variantväljare: PÅ**
- Fallback: 2 stk −10 % ≈ 1 312 kr (`Du sparer 146 kr`) · 3 stk −20 % ≈ 1 750 kr (`Du sparer 437 kr`)

### 5.13 Skovaskepose med Glidelås – Blå, for Sneakers
- **SE-källa:** `skotvattpase-med-dragkedja-bla-for-sneakers`
- **✅ ANVÄND:** `skovaskepose-med-glidelas-bla-for-sneakers` · `gid://shopify/Product/15525630968183` — 359 kr,
  exakt titelspegel av SE-produkten
- **❌ FÖRVÄXLA INTE med:** `vaskepose-for-sko-beskytter-sneakers-i-maskinen` (169 kr) – en annan,
  billigare tvättpåse i samma butik
- **Varianter:** 1 → Variantväljare: AV
- Fallback: 2 stk −10 % ≈ 646 kr (`Du sparer 72 kr`) · 3 stk −20 % ≈ 862 kr (`Du sparer 215 kr`)

### 5.14 Veggfeste for Gresstrimmer – Kraftig Verktøyholder
- **SE-källa:** `vaggfaste-for-grastrimmer-kraftig-verktygshallare`
- **NO-produkt:** `veggfeste-for-gresstrimmer-kraftig-verktoyholder` · `gid://shopify/Product/15525897142647`
- **Pris:** 359 kr · **Varianter:** 1 → Variantväljare: AV
- Fallback: 2 stk −10 % ≈ 646 kr (`Du sparer 72 kr`) · 3 stk −20 % ≈ 862 kr (`Du sparer 215 kr`)

### 5.15 Antiskli-mattestoppere 24-pk – Holder Matten på Plass
- **SE-källa:** `anti-slip-mattdynor-24-pack-haller-mattan-pa-plats`
- **NO-produkt:** `antiskli-mattestoppere-24-pk-holder-matten-pa-plass` · `gid://shopify/Product/15525629886839`
- **Pris:** 249 kr · **Varianter:** 1 → Variantväljare: AV
- Fallback: 2 stk −10 % ≈ 448 kr (`Du sparer 50 kr`) · 3 stk −20 % ≈ 598 kr (`Du sparer 149 kr`)

### 5.16 Cargoshorts 3-Pakning – Avslappede Herreshorts med Lommer
- **SE-källa:** `cargoshorts-3-pack-avslappnade-herrshorts-med-fickor`
- **NO-produkt:** `cargoshorts-3-pakning-avslappede-herreshorts-med-lommer` · `gid://shopify/Product/15525629297015`
- **Pris:** 909 kr · **Varianter:** 6 storlekar (M–3XL) → **Variantväljare: PÅ**
- Fallback: 2 stk −10 % ≈ 1 636 kr (`Du sparer 182 kr`) · 3 stk −20 % ≈ 2 182 kr (`Du sparer 545 kr`)

---

## 6. Bygg-checklista i Kaching (NO-butiken)

1. ☐ Kontrollera att Kaching Bundles är installerad i Beverbutikken och att app-embed är PÅ i
   temat (Temainställningar → App embeds). *(Kunde inte verifieras via API – appläsning saknar behörighet.)*
2. ☐ Arkivera den gamla Beverkobling-dubbletten (`beverkobling-slipp-kjedelige-kabelsko`).
3. ☐ Hämta SE-värdena enligt sektion 1 (Kaching-admin i SE-butiken).
4. ☐ Ställ in global design (sektion 2) – kopiera hex-färgerna från SE.
5. ☐ Skapa 16 deals enligt korten i sektion 5: en deal per produkt, namnge internt
   `NO – {produkt} – mengderabatt`.
6. ☐ Procentrabatter: kopiera SE-procenten rakt av. Fasta SEK-belopp: räkna om till NOK.
7. ☐ Slå PÅ variantväljaren för de 9 produkterna med flera varianter (5.1, 5.3, 5.4, 5.5, 5.7, 5.8, 5.9, 5.12, 5.16).
8. ☐ Testa 3 produktsidor i NO-butiken (en enkelvariant, en flervariant, shorts-packen):
   widgeten syns, rätt NOK-priser, rabatten slår igenom i kassan.
9. ☐ Kontrollera att inga andra rabattappar/automatiska rabatter dubblar rabatten i kassan.
