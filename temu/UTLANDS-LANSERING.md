# Utlandslansering — komplett recept (NO/DK/FI/UK)

Självbärande instruktion. Kan klistras in i ett annat Claude-konto — allt som behövs
står här: regler, priser, SKU:er, bild-URL:er och steg. Skriven 2026-08-18 efter att
Norge och Danmark lanserats med exakt den här processen.

Svara Axel på svenska. Han är inte utvecklare. Kör klart — lämna aldrig över
halvfärdigt med "nu behöver du bara…".

---

## Butiksregistret

| Land | Butik | Valuta | Vendor | 🦫 i garantiblocket | Status |
|---|---|---|---|---|---|
| 🇸🇪 | bäverbutiken.se | SEK | Bäverbutiken | Ja | Huvudbutik, källan |
| 🇳🇴 | grillklinikken.no | NOK | Grillklinikken | **NEJ** | ✅ Lanserad 2026-08-18 |
| 🇩🇰 | bæverbutiken.dk | DKK | Bæverbutiken | Ja | ✅ Lanserad 2026-08-18 (⚠️ dubbletter, se nedan) |
| 🇫🇮 | majavakauppa.fi | EUR | Majavakauppa | Ja (*majava* = bäver) | ✅ Lanserad 2026-08-18 |
| 🇬🇧 | beavershop.co.uk (BeaverShop) | GBP | BeaverShop | Ja | ✅ Lanserad 2026-08-18 |

## Hårda regler

0. **INVENTERA FÖRST — före första `create-product`.** Butiken kan redan ha produkterna
   från en tidigare session eller ett annat Claude-konto. Lista hela katalogen
   (`products(first: 50, sortKey: TITLE)`, sidbläddra till `hasNextPage: false`) och
   sök på SKU-mönstret (`productVariants(query: "sku:TEMU-*")`) **innan** något skapas.
   Skapa bara det som saknas. *(Danmark fick 25 dubbletter 2026-08-18 för att det här
   steget hoppades över — Axel: "don't do any duplicates, that just happened in Danish".)*
   Finns produkten redan: rör den inte utom för att laga defekter (se regel 12).
1. **`get-shop-info` FÖRST — före varje skrivning.** Verifiera namn + valuta. Fel butik
   eller fel valuta: STOPPA och säg till Axel. Blanda ALDRIG ihop butikerna.
2. **Butiksbyte:** `switch-shop` släpper nuvarande token; Axel måste själv koppla nästa
   butik i Shopify-connectorn (claude.ai → Connectors → Shopify). Be honom, vänta, kör
   `get-shop-info` när han säger klar.
3. **Sist av allt: be Axel koppla tillbaka bäverbutiken.se.** Annars pekar nästa session
   mot fel butik.
4. **Vendor = butikens eget varumärke.** Grillklinikken-butiker får aldrig "Bäverbutiken"
   som vendor och aldrig 🦫 i copyn.
5. **Varje variant:** `inventoryPolicy: CONTINUE` + `taxable: false` (sätts med
   `productVariantsBulkUpdate` EFTER `create-product` — kan inte sättas vid skapandet).
6. **Publicera på ALLA butikens kanaler:** hämta `publications`, kör `publishablePublish`
   per produkt med alla publication-ID:n.
7. **Kategori:** taxonomi-GID:na är globala — använd exakt de som står i tabellen nedan,
   via `productUpdate(product: {id, category})`.
8. **Aldrig hastighetslöften.** "Smidig leverans" på landets språk: "smidig levering" (NO),
   "smidig levering" (DK), "sujuva toimitus" (FI), "smooth delivery" (UK). CWD-frakten är
   6–10 arbetsdagar (NO 8–10) — därför lovas ingen tid.
9. **Copy på landets språk, korrläst som infödd.** Samma 7-block som Sverige:
   (1) emotionellt problem utan produktnamn → (2) GIF → (3) lösningen → (4) bild →
   (5) Funktioner: 4–5 bullets med **utfallet i fetstil** – spec som bevis (och?-testet) →
   (6) ev. bild → (7) garanti: 30 dagars öppet köp, smidig leverans, Klarna (+🦫 endast
   bäver-butiker). Inga tomma HTML-kommentarer som platshållare — någonsin.
10. **Inga påhittade siffror.** Alla räkneord kommer ur tabellen nedan (de är verifierade
    mot CWD-offert och referensbilder).
11. **Verifiera efteråt:** hämta några produkter och kontrollera `featuredMedia` (bilderna
    kopieras asynkront till landets CDN — kolla att de landat), status ACTIVE och
    publikationsantal. Rapportera i två högar: Fixat / Förslag.
12. **Granska det som redan ligger i butiken, inte bara det du själv la in.** En tidigare
    session kan ha lämnat defekter. Sök efter dem så här — de går att hitta med API:et:
    - `products(query: "<hastighetsord på landets språk>")` — fulltextsök på beskrivningen.
      Hittade 12 produkter med "Nopea toimitus" i finska butiken 2026-08-18.
    - `variantsCount { count }` mot förväntat antal — **1 variant på en sko eller ett
      mobilskal betyder att kunden inte kan välja storlek/modell.** Laga med
      `productOptionUpdate` (döp om `Title`-optionen, lägg sedan till värdena i ett
      SEPARAT anrop — döpa om och lägga till i samma anrop failar tyst) och sätt därefter
      unika SKU:er, annars ärver alla nya varianter samma SKU.
    - `mediaCount { count }` = 1 och `<!-- GIF: … -->` i `descriptionHtml` — tomma
      platshållarkommentarer, ofta kvar på svenska mitt i landets copy.

## Prismetoden

Kostnadsbaserad per land — INTE valutakonvertering. CWD:s frakt skiljer per land
(tofflorna: SE $9,15 · NO $10,21 · DK $10,45 · FI $12,08 · UK $8,40 landad kostnad).
Ankarpriser satta av Axel 2026-08-18 på tofflorna: **349 NOK / 229 DKK / 29,90 € / £22,99**.
Det ger faktorer mot svenska priset som används på hela katalogen:

| Land | Faktor på SEK-priset | Avrundning |
|---|---|---|
| NO | ×1,13 | närmsta 9-slut (349, 789, 1029 …) |
| DK | ×0,74 | närmsta 9-slut (229, 519, 669 …) |
| FI | ×0,097 | närmsta X,90 (29,90, 67,90 …) |
| UK | ×0,074 | närmsta X.99 (22.99, 51.99 …) |

## Produkterna — allt som behövs per rad

Källa = svenska butiken. Bilderna ligger på `https://cdn.shopify.com/s/files/1/1013/0322/2621/files/`
(förkortas `CDN/` nedan) — de är publika och kan användas direkt som bild-URL i
`create-product`; Shopify kopierar dem till landets CDN. GIF:en läggs i beskrivningens
block 2, stillbilden i block 4. Titlar skrivs om på landets språk (norska och danska
versionerna finns redan live som facit i respektive butik).

**Varianter:** `EN` = en variant (`options: ['Title']`). Skor = `Storlek`-axel på landets
språk, ett pris för alla storlekar. SKU-mönstret är identiskt i alla butiker.

| # | Produkt (SE-titel) | SKU-bas | Varianter | Kategori-GID (`gid://shopify/TaxonomyCategory/…`) | GIF (block 2) | Bild (block 4 + galleri) | SE kr | NO kr | DK kr | FI € | UK £ |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Tofflor Ergonomiska | TEMU-601100379316292-<strl>-<SO/HG> | 7 strl (36-37…48-49) × 2 färger (Svart/Orange, Vit/Grön) | aa-8-7 | CDN/temu-tofflor.gif | CDN/ce963fd939ae7017637863a3d0a0ec07.jpg + CDN/Namnlosdesign-2026-08-13T190843.822.png | 309 | 349 | 229 | 29,90 | 22.99 |
| 2 | Uteduschen | TEMU-601104547945861 | EN | sg-4-2 | CDN/temu-uteduschen.gif | CDN/01d1af10-a6a3-4693-8faf-efc4f5c3283b.jpg + CDN/01d1af10-…-e2edbc5014b1.jpg (extra, block 6) | 579 | 649 | 429 | 55,90 | 42.99 |
| 3 | Golfskoväska | TEMU-601099516487044 | EN | sg-4-7 | CDN/temu-golfskovaska.gif | CDN/b46d69054357183f5bb6199789be32f5.jpg | 309 | 349 | 229 | 29,90 | 22.99 |
| 4 | Magnetfiskesats 320lb | TEMU-601104677569375 | EN | sg-4-6 | CDN/temu-magnetfiskesats.gif | CDN/740baad3a413478fbd645c2618dec9e7-goods.jpg | 279 | 319 | 209 | 26,90 | 20.99 |
| 5 | Golfbollsplockare 80 cm | TEMU-601100286187971 | EN | sg-4-7 | CDN/temu-golfbollsplockare.gif | CDN/b05d773393119e15b8eab965e57dbd54_1741939977992.jpg | 309 | 349 | 229 | 29,90 | 22.99 |
| 6 | Fritidsskor Herr | TEMU-601102200064735 | EN | aa-8 | CDN/temu-fritidsskor.gif | CDN/b1d1d71d-c0b4-40d4-ad6d-a2a3c1d3cc73.jpg | 309 | 349 | 229 | 29,90 | 22.99 |
| 7 | Mobilskal Magnetiskt iPhone 12–17 | TEMU-601103799817572-<modell> | 18 modeller: 12/12P/12PM/13/13P/13PM/14/14P/14PM/15/15P/15PM/16/16E/16P/16PM/17/17A | el-4-8-4-2 | CDN/temu-mobilskal.gif | CDN/912694ed-892f-4142-b051-5b31980c0a2d.jpg | 219 | 249 | 159 | 20,90 | 15.99 |
| 8 | Surfplatteställ | TEMU-601102197280712 | EN | el-7-9-15-1-3 | CDN/temu-surfplattestall.gif | CDN/73c6e9cb-6221-4086-8e99-3c009a14c8ae.jpg | 279 | 319 | 209 | 26,90 | 20.99 |
| 9 | 14-i-1 Multiverktygshammare | TEMU-601101921250503 | EN | ha-15-38 | CDN/temu-multiverktygshammare.gif | CDN/3f2e2bf8-883d-41ef-87b9-47e26e53dc20.jpg | 349 | 399 | 259 | 33,90 | 25.99 |
| 10 | Gräsklippartäcke 600D | TEMU-605510862498229 | EN | hg-12-3-5 | CDN/temu-grasklippartacke.gif | CDN/5661b1e5a1d0413497069942ef7bf1ae-goods.jpg | 369 | 419 | 269 | 35,90 | 26.99 |
| 11 | Fiskespöhållare Båt 2-pack | TEMU-601099792244573 | EN | sg-4-6 | CDN/temu-fiskespohallare.gif | CDN/afa5554aaa164c7bbdbbb4264a12a532-goods.jpg | 269 | 299 | 199 | 25,90 | 19.99 |
| 12 | Hattgalge 8 kepsar | TEMU-605828169987760 | EN | fr-3-2-2 | CDN/temu-hattgalge.gif | CDN/d8dd15a8-ecc7-436d-9e8c-69d6daf2ada4.jpg | 179 | 199 | 129 | 16,90 | 12.99 |
| 13 | Övervakningskamera dubbellins PTZ | TEMU-601100938731214 | EN | co-2-5 | CDN/temu2-kamera.gif | CDN/temu2-kamera-1.webp + -2.webp + -3.webp (galleri; -1 block 4, -3 block 6) | 799 | 899 | 589 | 76,90 | 59.99 |
| 14 | Första Hjälpen-Kit 260 delar | TEMU-601099866212432 | EN | hb-1-8 | CDN/temu2-forstahjalpen.gif | CDN/temu2-forstahjalpen-1.webp | 309 | 349 | 229 | 29,90 | 22.99 |
| 15 | Stänkskärm MTB | TEMU-601100182464991 | EN | sg-4-4-2 | CDN/temu2-stankskarm.gif | CDN/temu2-stankskarm-1.webp + -2.webp + -3.webp (galleri; -1 block 4, -2 block 6) | 219 | 249 | 159 | 20,90 | 15.99 |
| 16 | Boxboll med Pannband | TEMU-601100409294093 | EN | sg-1-4-2 | **saknar bild/GIF — ren text tills Axel skickar bild** | — | 179 | 199 | 129 | 16,90 | 12.99 |
| 17 | Bordtennistränare | TEMU-601099969009037 | EN | sg-3-6 | CDN/temu2-pingis.gif | CDN/temu2-pingis.webp | 309 | 349 | 229 | 29,90 | 22.99 |
| 18 | Linupprullare Aluminium | TEMU-601099521158260 | EN | sg-4-6 | CDN/temu2-linupprullare.gif | CDN/temu2-linupprullare.webp | 249 | 279 | 179 | 23,90 | 18.99 |
| 19 | Mini Fiskespö Set | TEMU-601102632838913 | EN | sg-4-6-11-12 | CDN/temu2-fiskespo.gif | CDN/temu2-fiskespo-1.webp | 429 | 489 | 319 | 41,90 | 31.99 |
| 20 | Hopfällbar Såg | TEMU-601099520639890 | EN | ha-15-62 | CDN/temu2-sag.gif | CDN/temu2-sag.webp | 279 | 319 | 209 | 26,90 | 20.99 |
| 21 | Bälteslipmaskin Mini 3-i-1 | TEMU-601102681234291 | EN | ha-15-59 | CDN/temu2-balteslip.gif | CDN/temu2-balteslip.webp | 909 | 1029 | 669 | 87,90 | 67.99 |
| 22 | Sneakers Herr EVA | TEMU-601102199755631-<strl> | Strl 40–46 | aa-8 | CDN/temu2-sneakers.gif | CDN/temu2-sneakers-1.jpg | 699 | 789 | 519 | 67,90 | 51.99 |
| 23 | Vandringssneakers Herr | TEMU-601099705910254-<strl> | Strl 40–46 | aa-8 | CDN/temu2-vandringssneakers.gif | CDN/temu2-vandringssneakers-1.webp | 699 | 789 | 519 | 67,90 | 51.99 |
| 24 | Vandringskängor Herr | TEMU-601105032097489-<strl> | Strl 41–47 | aa-8-3 | CDN/temu2-kangor.gif | CDN/temu2-kangor-1.webp | 669 | 759 | 499 | 64,90 | 49.99 |
| 25 | Cykelshorts Herr | TEMU-601099538175267-<S…3XL> | S, M, L, XL, 2XL, 3XL | sg-4-4-4 | CDN/temu2-cykelshorts.gif | CDN/temu2-cykelshorts-1.webp + -2.webp (-2 = block 4) | 259 | 289 | 189 | 24,90 | 18.99 |

Uteduschens extra-bild (rad 2): `CDN/01d1af10-a6a3-4693-8faf-efc4f5c3283b_19396558-e6ba-4b1f-b1bb-e2edbc5014b1.jpg`.
Bild-URL:erna funkar utan `?v=`-parametern.

## Steg per land (i exakt denna ordning)

1. `get-shop-info` → verifiera land + valuta mot registret. Fel → stopp.
2. Hämta `publications` (kanal-ID:n skiljer per butik).
3. `create-product` per produkt: titel + copy på landets språk, `status: ACTIVE`,
   vendor enligt registret, options + varianter + SKU:er + priser ur tabellen,
   `inventoryItem: {tracked: true}`, bilder ur tabellen (första = huvudbild).
4. `productVariantsBulkUpdate`: `inventoryPolicy: CONTINUE, taxable: false` på VARJE variant.
5. `publishablePublish` per produkt med butikens alla publication-ID:n.
6. `productUpdate` med kategori-GID ur tabellen.
7. Verifiera: `featuredMedia` satt (utom boxbollen), ACTIVE, publikationsantal = antal kanaler.
8. `switch-shop` → be Axel koppla nästa land.

## Definition of done per land

- [ ] `get-shop-info` visade rätt butik INNAN första skrivningen
- [ ] 25 produkter ACTIVE med copy på landets språk (24 med bild — boxbollen är känd bildlös)
- [ ] Alla varianter: rätt pris ur tabellen, SKU, CONTINUE, taxable false
- [ ] Publicerad på butikens alla kanaler
- [ ] Kategori satt på alla
- [ ] Bilder verifierade på landets CDN
- [ ] Rapport: Fixat / Förslag
- [ ] Nästa butik kopplad — eller bäverbutiken.se återkopplad om detta var sista landet
