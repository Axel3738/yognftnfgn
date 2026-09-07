# /temu – Lägg upp en Temu-produkt på Bäverbutiken.se

**Argument:** en Temu-produktlänk. Flera länkar går bra – kör dem en i taget.

Butiken är **Bäverbutiken.se** (SEK). Rör aldrig Grillkliniken här.

---

## Innan du börjar: vad som går och inte går

Verifierat 2026-08-12. Läs det här innan du lovar något.

| | Läge |
|---|---|
| Titel + beskrivningstext + goods-id från länken | ✅ automatiskt (`node temu/hamta.mjs`) |
| Produktbilder, pris, varianter från Temu | ❌ **går inte** – Temu renderar sidan med JS och API:et kräver inloggning + anti-bot-token |
| Ladda ner bilder när du väl har URL:erna | ✅ Temus CDN (`img.kwcdn.com`) är nåbart |
| Bygga animerad GIF | ✅ `node temu/gif.mjs` |
| Skapa/uppdatera produkt i Shopify | ✅ Shopify MCP |

Chromium/Playwright hjälper **inte** – webbläsaren har inget nät i den här miljön
(ERR_CONNECTION_RESET även mot example.com).

**Konsekvens:** bilder, pris och varianter måste komma från Axel. Fråga en gång,
samlat, och kör sedan klart hela vägen utan fler avbrott.

---

## Steg

### 1. Läs länken
```bash
node temu/hamta.mjs "<temu-länk>"
```
Ger `goods_id`, `sku` (`TEMU-<id>`), rå titel och rå beskrivning. Den råa titeln är
maskinöversatt nyckelordssoppa – den ska **aldrig** användas som produktnamn.

### 2. Be om det som saknas (en gång, samlat)
Be Axel om, för den här produkten:
- **Bilderna** – enklast: högerklicka på Temu-bilderna → "Kopiera bildadress",
  klistra in 3–6 URL:er. Uppladdade filer eller Shopify Files går lika bra.
- **Priset** i butiken (SEK).
- **Varianterna** – färg/storlek som ska säljas, och vilka som ska bort.

Har han redan gett det i meddelandet: hoppa över och kör.

### 3. Skriv produktnamnet
Svenskt, säljande, mönstret i butiken: `Produkt – Egenskap & Egenskap`.
Exempel: `Gräsklippartäcke 600D Oxford – med Dragsko`.
Max ~60 tecken. Aldrig Temus råa titel.

### 4. Bygg GIF:erna
```bash
# flera bilder → korsfadeat bildspel (bäst)
node temu/gif.mjs --ut=temu/tmp/<slug>.gif bild1.jpg bild2.jpg bild3.jpg

# bara en bild → långsam inzoomning, blir automatiskt
node temu/gif.mjs --ut=temu/tmp/<slug>.gif bild.jpg
```
Skriv i leveransen om det blev bildspel eller inzoomning. Blir det stillbild ska
det stå rakt ut – låtsas aldrig att en stillbild är en GIF.

### 5. Ladda upp GIF:en till Shopify
GIF:en ligger lokalt och måste till Shopifys CDN först. Tre steg:

1. `stagedUploadsCreate` (GraphQL) med `resource: FILE`, `mimeType: "image/gif"`,
   `httpMethod: POST`, `fileSize` i bytes. Flera filer i **ett** anrop.
2. POST filen till den returnerade URL:en – alla `parameters` som formulärfält,
   filen sist som `file`. Svar 201 = ok.
3. `fileCreate` med `originalSource: <resourceUrl>`, `contentType: IMAGE`, `alt`.
4. Vänta ~20 s, hämta `image.url` när `fileStatus` är `READY`.

Shopify behåller animationen – `mimeType` ska vara `image/gif` efteråt. Kolla det.

### 6. Skriv beskrivningen – exakt den här ordningen
Axels format. Sju block, inga avvikelser:

1. `<h3>` + `<p>` – **det emotionella problemet**. Ingen produkt nämns. Ska kännas igen.
2. **GIF**
3. `<h3>` + `<p>` – **lösningen**, alltså produkten
4. **GIF eller bild**
5. `<h3>Funktioner</h3>` + `<ul>` med 4–5 punkter — **utfallet i fetstil först, specen som
   bevis efteråt:** `<li><strong>Utfall</strong> – bevis/spec</li>`. Kör och?-testet på varje
   punkt (se CLAUDE.md, "Produktcopy på Bäverbutiken").
6. **Bild**
7. `<h3>Vår garanti</h3>` + `<p>` – 30 dagar, Klarna, **"smidig leverans"** (aldrig
   hastighetslöfte), 🦫

Bilder skrivs `<p><img src="..." alt="..." loading="lazy" style="max-width:100%;height:auto"></p>`.
GIF:en får `border-radius:8px`.

**Lägg aldrig in en tom HTML-kommentar som platshållare** (`<!-- GIF: ... -->`).
Den syns inte för kunden och ser ut som att jobbet är gjort. Har du ingen bild till
en plats: säg det i leveransen i stället.

Copy skrivs enligt `docs/copy-regler.md` (CLAUDE.md regel 6).

### 7. Skapa produkten
`create-product` med:
- `status: "ACTIVE"` – produkten ska vara live
- `vendor: "Bäverbutiken"`
- `productType` – t.ex. `Camping`, `Golf`, `Förvaring`
- `tags` – 4–5 svenska sökord
- `variants[].sku` = `TEMU-<goods_id>` (variant 2, 3 … = id+1, id+2 …)
- `variants[].inventoryItem.tracked: true`
- `options` måste anges när varianter anges (`['Title']` om bara en)

### 8. Sätt "fortsätt sälja när slut i lager" + moms AV + produktmallen
`create-product` kan **inte** sätta något av detta. Kör direkt efteråt:
```graphql
productVariantsBulkUpdate(productId: $id, variants: [{id: $vid, inventoryPolicy: CONTINUE, taxable: false}])
productUpdate(product: {id: $id, templateSuffix: "claudeprodukter"})
```
- `taxable: false` på **varje** variant — moms är avstängd på produktnivå i hela butiken
  (Axels beslut 2026-08-18).
- Utan `templateSuffix: "claudeprodukter"` renderas sidan med butikens standardmall — fel utseende.
Kontrollera att varje variant har `inventoryPolicy: CONTINUE`. Utan det slutar
produkten säljas så fort saldot tar slut – och saldot är påhittat ändå.

### 9. Kategori
Två saker, båda ska sättas:

**a) Kollektion** (det kunden ser i menyn). Befintliga:

| Kollektion | id |
|---|---|
| Trädgård & Utomhus | 714599956829 |
| Bil, Verktyg & Garage | 714600579421 |
| Camping & Friluft | 714601038173 |
| Lantbruk & Djur | 714603561309 |
| Båt & Marin | 714614538589 |
| Tillbehör & Övrigt | 714615161181 |
| Fordon & Belysning | 714616570205 |
| Golf & Sport | 720938402141 |
| Skor & Kläder | 720938434909 |
| Hem & Förvaring | 720938467677 |
| Elektronik & Mobil | 720938500445 |
| Bästsäljare | 720493445469 |

Passar produkten ingen av dem: **skapa en ny** med `create-collection`
(manuell, `sortOrder: BEST_SELLING`, kort svensk beskrivning). Tvinga aldrig in en
produkt i en kollektion den inte hör hemma i.

**b) Shopify-kategori** (taxonomin, används av Google/Meta-flöden) via
`productUpdate(product: {id, category: "gid://shopify/TaxonomyCategory/..."})`.
Sök rätt kategori med `taxonomy { categories(search: "...") }`.

### 10. Kontrollera i butiken
Hämta produkten igen och verifiera mot checklistan nedan. Rapportera på svenska.

---

## Definition of done

- [ ] Produktnamn på svenska, inte Temus råa titel
- [ ] `status: ACTIVE` + publicerad på alla försäljningskanaler
- [ ] Alla varianter har `inventoryPolicy: CONTINUE` och `taxable: false`
- [ ] Produktmall `claudeprodukter` satt (`templateSuffix`)
- [ ] Alla varianter finns med, SKU `TEMU-<id>` — varianterna från leverantörsofferten, inte Temu
- [ ] Beskrivningen följer alla sju blocken i rätt ordning
- [ ] Alla bullets klarar och?-testet — utfall i fetstil, spec som bevis
- [ ] "Smidig leverans" — inget hastighetslöfte någonstans
- [ ] Alla räkneord i copyn stämmer mot leverantörsspec/referensbilder
- [ ] Svensk korrläsning gjord (en/ett, direktöversättningar)
- [ ] Minst en **animerad** GIF ligger i beskrivningen (annars: skrivet varför)
- [ ] Inga tomma HTML-kommentarer kvar i beskrivningen
- [ ] Produktbilder uppladdade, första bilden är huvudbild — varje bild-URL svarar 200
- [ ] Ligger i minst en kollektion (ny skapad om ingen passade)
- [ ] Shopify-kategori satt
- [ ] Slutgranskning körd mot det som ligger skarpt; rapport i två högar (Fixat / Förslag)
- [ ] Länk till produkten i butiken redovisad
