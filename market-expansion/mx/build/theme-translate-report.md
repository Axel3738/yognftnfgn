# Tema-lokalisering es-MX — GrillForge Co (grillforgeco.com)

Datum: 2026-08-13
Mål-tema: `gid://shopify/OnlineStoreTheme/196491477332` (UNPUBLISHED, "theme-export-grillkliniken-se-wetransfer-theme"). MAIN-temat rördes aldrig.
Metod: `themeFilesUpsert` (validerad via `validate_graphql_codeblocks`), 5 batchar, 0 `userErrors`.

## Filer översatta + upsertade (11 st)

| Fil | Bas | Ersatta textvärden |
|---|---|---|
| config/settings_data.json | AKTUELL version från mål-temat (app-strippning bevarad: endast Judge.me kvar i `blocks`) | 26 |
| templates/index.json | referens | 15 |
| templates/product.json | AKTUELL version från mål-temat (conversion-bear-block borttaget, bevarat) | 5 |
| templates/product.grill-golf-kit.json | referens | 5 |
| templates/product.mastern.json | AKTUELL version från mål-temat | 5 |
| templates/product.borst-polerhuvud.json | AKTUELL version från mål-temat | 3 |
| templates/collection.json | referens | 9 |
| templates/cart.json | referens | 1 |
| templates/404.json | referens | 1 |
| templates/search.json | referens (ingen text) | 0 |
| templates/password.json | referens | 3 |

Lokala kopior: översatta filer i `mx/build/theme-es/`, bas-snapshots i `mx/build/theme-es-base/`, byggskript med strukturdiff i scratchpad (`build_theme_es.py`).

## Verifiering (efter upsert, body hämtad från mål-temat per fil)

- **(a) Kvarvarande svenska strängar: 0** i samtliga 11 bearbetade filer (regex `[åäö]` + svensk ordlista mot alla strängvärden). Kvar finns endast icke-kundsynliga identifierare: produkthandles `elektrisk-grillborste` och `stekbord` (verifierade som faktiska handles i MX-butiken via products.mx.jsonl) samt bildfilnamn (`Namnlos_design_*.png` m.fl.) — dessa är referenser, inte text.
- **(b) JSON giltig**: alla filer accepterades av Shopify och returneras korrekt serialiserade.
- **(c) Strukturdiff**: python-skript jämförde nyckelstruktur, listlängder och alla icke-strängvärden mellan bas och översättning — identiskt; endast strängvärden (text + handles) ändrade. Nycklar, section-ID:n, färger, fonter, boolean/nummer orörda.

## Genomförda byten

- Kollektionshandles: `grillredskap`→`herramientas-para-asador` (2 länkar i index), `forkladen`→`delantales` (featured collection i index). `knivar-bestick`→`cuchillos-y-tablas` fanns med som regel men förekom inte i de bearbetade filerna.
- Sidhandle: `shopify://pages/om-oss`→`shopify://pages/sobre-nosotros` (index + collection; verifierad mot pages-report: sidan finns, gid://shopify/Page/711806648660).
- Varumärke: "Grillkliniken" → "GrillForge Co" (footer-företagsblock). Footer-nyhetsbrevets titel "BODYSHAPER CLUB" (kvarleva från annan butik) → "GRILLFORGE CLUB".
- Fraktlöften: announcement bar = "ENVÍO GRATIS A TODO MÉXICO"; trust-sektioner (index/collection) = "envío gratis a todo México"; produktmallarnas frakt-sales points = "Envío gratis a todo México, entrega en 7–14 días hábiles" (ersätter "5–7/5–9 arbetsdagar inom Sverige").
- Även engelska default-strängar i aktiva/kundsynliga lägen översattes (Quick view→"Vista rápida", Popular picks→"Productos populares", password-sidan, disablade nyhetsbrevspopup/footer-promos). Disablade engelska demo-sektioner (testimonials, map, "About your brand" osv.) lämnades på engelska (visas ej).
- `presets` i settings_data lämnades ordagrant orörda (renderas aldrig för kund).

## Loggafyndet: INGEN GrillForge-logga hittades — FLAGGAS

Sökt i butikens filbibliotek (`files`-query, media_type:IMAGE; sökningar på "grillforge", "forge", "logo", "filename:grill*"). Ingen fil matchar en GrillForge-logga. Därför behölls:
- Header/footer-logga: `shopify://shop_images/Namnlos_design_-_2025-09-20T122619.433.png` (Grillklinikens logga)
- Checkout-logga: `shopify://shop_images/Skarmavbild_2023-05-07_kl._07.25.12-removebg-preview.png`

**Åtgärd krävs**: ladda upp en GrillForge Co-logga och byt i temainställningarna (header-logo-block `1524770014057`, footer `1494301487048`, `checkout_logo_image`).

## Övriga noteringar / avvikelser

1. **Klarna**: Klarna finns inte i Mexiko. I trust-texten (index/collection) togs "Klarna" bort ur betalmetodslistan (PayPal, Apple Pay, Google Pay, VISA, Mastercard kvarstår). Den *disablade* announcement-blocken "FÅ FÖRST, BETALA SEN - KLARNA" översattes ordagrant ("RECIBE PRIMERO, PAGA DESPUÉS - KLARNA") men är fortsatt avstängd — aktivera ej utan att Klarna/motsvarande (t.ex. Kueski Pay) finns.
2. **"30 dagars öppet köp"** översattes som "30 días de devolución" — bekräfta att returpolicyn för MX faktiskt ger 30 dagar.
3. **Featured products på startsidan** pekar på handles `elektrisk-grillborste` och `stekbord`; båda finns i MX-butiken (spanska titlar), så de fungerar — men handles är fortsatt svenska (SEO-kosmetik, ej blockerande).
4. Footer-företagsblocket behåller "STONEBITE ECOM AB, Org nr 5595762401" (juridisk fakta) med spansk kringtext ("No. de registro (Org nr)").
5. Kampanjblocket i collection.json ("Vår-rea" → "Rebajas de primavera", 20 % vid köp av 2+) översattes som det stod — verifiera att motsvarande rabatt finns i MX innan publicering.
6. Slideshow-rubriken "NYtt sortiment..." hade skrivfel i originalet; översatt korrekt ("Nueva línea de herramientas para asador").
