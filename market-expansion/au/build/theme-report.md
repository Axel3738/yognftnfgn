# The BBQ Clinic (AU) — temarapport

Datum: 2026-08-17
Butik: Grillklinikken.dk (`xr15w4-cz.myshopify.com`)
Mål-tema: `bbq-clinic-au-dev` — `gid://shopify/OnlineStoreTheme/198538887551` (UNPUBLISHED)
MAIN-temat (194575565183) har inte rörts.

## Del 1 — Uppladdade loggor (Files)

Alla tre laddades upp via stagedUploadsCreate (201) + fileCreate och har status READY. Filnamnen i Files matchar exakt de referenser som används i temat (ingen namnkollision/suffix).

| Fil | MediaImage-ID | CDN-URL |
|---|---|---|
| bbqclinic-logo-black.png | gid://shopify/MediaImage/72233988784511 | https://cdn.shopify.com/s/files/1/0908/7769/0239/files/bbqclinic-logo-black.png |
| bbqclinic-logo-white.png | gid://shopify/MediaImage/72233988817279 | https://cdn.shopify.com/s/files/1/0908/7769/0239/files/bbqclinic-logo-white.png |
| bbqclinic-favicon.png | gid://shopify/MediaImage/72233988850047 | https://cdn.shopify.com/s/files/1/0908/7769/0239/files/bbqclinic-favicon.png |

Alt-texter: "The BBQ Clinic logo (black)" / "(white)" / "The BBQ Clinic favicon".

## Del 2 — Översatta + upsertade temafiler (11 st)

Alla upserts gick igenom utan userErrors. Verifiering per fil: giltig JSON, 0 svenska strängvärden (åäö-fritt + ordlista), struktur oförändrad utom strängvärden/handles. 10 av 11 filer verifierade byte-exakt via checksumMd5 mot lokalt verifierade original; settings_data.json normaliserades av Shopify (pretty-print + auto-genererad kommentarheader) och verifierades i stället genom att hämta tillbaka body och granska innehållet.

1. **config/settings_data.json**
   - Announcement bar: "FRI FRAKT" → "FREE SHIPPING AUSTRALIA-WIDE" / "On every order, no minimum spend" (fraktlöftet sant — AU-zonen är konfigurerad)
   - Klarna-annonsen (disabled) → "BUY NOW, PAY LATER" (fortsatt disabled)
   - "30 dagars öppet köp" → "30-day returns / Order and try it risk-free"
   - Header-logga, footer-logga och `checkout_logo_image` → `shopify://shop_images/bbqclinic-logo-black.png` (header/footer/checkout har vit bakgrund; white-varianten behövdes inte men finns uppladdad)
   - `favicon` (fanns inte satt tidigare) → `shopify://shop_images/bbqclinic-favicon.png`
   - Footer: "BODYSHAPER CLUB" → "THE BBQ CLINIC CLUB"; företagsblocket → "The BBQ Clinic is owned and operated by STONEBITE ECOM AB"
2. **templates/index.json** — hero, rich-text, trust-block översatta; `grillredskap` → `bbq-tools`, `forkladen` → `aprons`, `om-oss` → `about-us`
3. **templates/collection.json** — "Vår-rea" → "Spring Sale" (20% off / Applies storewide), trust-block, "Kontakta oss" → "Contact us", `om-oss` → `about-us`
4. **templates/product.json** — sales points + "Du kanske också gillar" → "You may also like"; frakt: "Free shipping Australia-wide (5-7 business days)"
5. **templates/product.grill-golf-kit.json** — d:o ("aluminium foil", "flavour" — AU-stavning)
6. **templates/product.mastern.json** — d:o (5-9 business days)
7. **templates/product.borst-polerhuvud.json** — d:o
8-11. **templates/cart.json, 404.json, password.json, search.json** — var redan engelska; upsertade oförändrade (bekräftade utan svenska).

Kvarvarande svenska strängvärden i de 11 filerna: **0**.

## App-block

- **GemPages script-embed** (`shopify://apps//blocks/embed-gp-script-head/...`) i settings_data → **strippades automatiskt av Shopify** vid upsert (blocket saknas i den sparade filen). Övriga embeds (Judge.me, Kaching Bundles, Klaviyo) accepterades och ligger kvar.
- Judge.me- och Conversion Bear-block i produktmallarna accepterades utan valideringsfel och behölls som de är.

## ÅTGÄRD KRÄVS (Axel)

1. **Butiksspråk:** Temat serveras på butikens språk (danska/svenska är primärspråk). `locales/en.default.json` finns i temat, men **English måste aktiveras i Settings → Languages** (och kopplas till AU-marknaden/publiceras) för att temats hårdkodade locale-strängar ska visas på engelska. Utan detta visas knappar/systemtexter på butikens primärspråk trots översättningarna ovan.
2. **Kollektioner/sidor:** Kollektionshandles `bbq-tools`, `aprons`, `knives-chopping-boards` samt sidan `about-us` måste finnas i butiken — mallarna pekar nu på dem. (`knives-chopping-boards` refererades inte i någon av de 11 filerna, ingen ändring behövdes.)

## Noteringar / avvägningar

- **Produkthandles behölls** (låg utanför uppdraget): featured products på startsidan pekar på `elektrisk-grillborste` och `stekbord`; produktmallarna heter fortsatt `product.grill-golf-kit/.mastern/.borst-polerhuvud`. Om AU-produkterna får engelska handles behöver dessa uppdateras och mallarna tilldelas.
- **Klarna togs bort** ur betalmetodlistan i trust-texterna ("PayPal, Apple Pay, Google Pay, VISA and Mastercard") — okänt om Klarna är aktiverat för AU; lägg tillbaka vid behov.
- "Spring Sale"-promon i collection.json är en direktöversättning av "Vår-rea" — kontrollera att kampanjen är aktuell för AU (vår = sep-nov).
- Bildreferenser (hero-bilder m.m.) pekar på befintliga delade filer i butikens Files — oförändrat.
- GP-/GemPages-malfilerna (page.gp-template-*) ingick inte i uppdraget och har inte rörts.
