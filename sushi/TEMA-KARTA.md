# Matstrumpor-temat → engelsk butik: kartan

Källa: **Matstrumpor.se** (`1r46tp-qx.myshopify.com`), live-tema
**"Matstrumpor CRO v4"** (`gid://shopify/OnlineStoreTheme/205547536723`),
Dawn-baserat (themeStoreId 887). CDN-sökväg för assets: `/cdn/shop/t/8/assets/`.

Kartlagt 2026-08-25 genom att jämföra butikens filträd mot Dawn @258f00f.

## Vad som faktiskt är eget bygge

| Kategori | Antal | Kommentar |
|---|---|---|
| Identiska med Dawn | 75 | hämtas gratis ur `Shopify/dawn` — behöver aldrig kopieras |
| Egna filer (finns ej i Dawn) | 43 | 36 `ms-*` + 7 kundkonto-sektioner från äldre Dawn |
| Ändrade mot Dawn | 26 | mest versionsskillnad; verkligt ändrade: `templates/index.json`, `product.json`, `config/settings_data.json`, `header/footer-group.json` |
| Egna assets | 7 | `ms-cro.css` (28 KB), `ms-cro.js` (23 KB), `ms-paket.js` (14 KB), `ms-paket.css`, `ms-ab.js`, `ms-tema.css`, `ms-cro-nytt.css` (oanvänd) |

**Alla 192 assets är nedladdade** till `assets-nedladdade/` — Dawn-filerna i
källform ur GitHub-klonen, `ms-*.css` i källform via Admin API. (CDN-versionerna
är minifierade och duger inte att arbeta vidare på.)

## CRO-bygget — vad varje egen del gör

- **`ms-paket`** — paketnivåer (1/2/4-pack) i köpblocket. Läser **metaobjektet
  `ms_paketniva`**, inte hårdkodade nivåer. Har en ärlighetsspärr: rabatterat
  pris visas bara om nivån har både totalpris OCH rabattkod, annars fullpris.
  Stöder BOGO och gratisgåva med värde.
- **`ms-cro.css`** — hela designlagret, prefix `.ms-`. Räknar i `em` (inte `rem`)
  eftersom Dawn sätter `html{font-size:62.5%}` — annars blir all text 40 % för liten.
- **`ms-tema.css`** — ENDA filen som rör Dawns egna klasser (köpknapp, pris, footer).
  Byts bastemat ut är det den här som skrivs om.
- **`ms-sticky-atc`** — skickar klicket vidare till temats riktiga köpknapp,
  bygger inget eget köpflöde.
- **`ms-stock-urgency`** — visar verkligt lagersaldo, eller bara en textrad.
  Hittar aldrig på en siffra.
- **`ms-size-guide`** — `<dialog>`, funkar utan JS.
- **`ms-skrapkort`** (19 KB), `ms-cookies`, `ms-compare`, `ms-review-slider`,
  `ms-marquee`, `ms-usp-bar`, `ms-video`, `ms-faq`, `ms-guarantee`, `ms-ab*` (A/B-test).

## Följer INTE med temafilerna (måste byggas i nya butiken)

1. **Metaobjektet `ms_paketniva`** — definition + en post per paketnivå.
   Utan det renderar `ms-paket` ingenting.
2. **Apparna** — Judge.me (recensioner) och Klaviyo ligger som app-blocks i
   `settings_data.json` och `templates/product.json`. Installeras separat.
3. **Produkter, sidor, menyer, policies** — butiksinnehåll, inte tema.
4. ⚠️ **Recensionerna på startsidan** (Wide Pia, Jonas, Gittan, Annika) är
   riktiga svenska kunders omdömen om den svenska butiken. De får INTE
   översättas och återanvändas — det vore påhittade omdömen. Sektionen lämnas
   tom tills den engelska butiken har egna.

## Text som ska översättas

| Var | Vad |
|---|---|
| `templates/index.json` | hero, marquee, berättelse, statement, FAQ, garanti, UGC-rubriker |
| `templates/product.json` | 6 FAQ-frågor, trygghetsrad, leveransbesked, sticky-knapp |
| `sections/header-group.json` | 3 announcement-rader |
| `sections/footer-group.json` | rubriker + företagsblocket (bolagsuppgifter!) |
| `config/settings_data.json` | `brand_description`, sociala länkar |
| `ms-*.liquid` | hårdkodade standardvärden: "30 dagars öppet köp", "Storleksguide", "Köp nu", "Beräknad leverans", "Endast X kvar i lager", "Gratis på köpet", "värde", "Välj paket", "Stäng", "arbetsdagar" |
| `locales/` | byt butiksspråk till `en.default.json` (finns redan i Dawn) |

CSS/JS behöver **ingen** översättning — svenskan där är kodkommentarer.

---

## Sushi Socks-butiken — läget 2026-08-26

Butik: `ud9jb9-jb.myshopify.com` (trial). Temat uppladdat av Axel som
**"theme-export-matstrumpor-se-matstrumpor-cro-v4"** (utkast).

### Gjort via API

| Vad | Status |
|---|---|
| `templates/index.json` | ✅ engelsk, sushi-spetsad copy, recensionssektionen borttagen |
| `templates/product.json` | ✅ engelsk, 6 FAQ-frågor, Judge.me-blocken borttagna (appen finns inte här) |
| `sections/header-group.json` | ✅ engelska announcements + landväljare på |
| `sections/footer-group.json` | ✅ engelska rubriker + STONEBITE ECOM AB och support@sushisock.com |
| 7 × `snippets/ms-*.liquid` | ✅ alla kundsynliga strängar på engelska |
| Metaobjekt `ms_paketniva` | ✅ skapat som "Bundle tier", 13 fält, storefront-läsbart |
| Marknader | ✅ US (USD), UK (GBP), AU (AUD), NZ (NZD), CA (CAD) — alla aktiva |
| Butiksspråk | ✅ engelska var redan primärt |

**Uppladdningsmetoden som fungerar** (och sparar enormt med kontext):
`stagedUploadsCreate` med `resource: FILE` → `PUT` filen med curl → resourceUrl är
publikt läsbar → `themeFilesUpsert` med `body: { type: URL, value: <resourceUrl> }`.
Filinnehållet behöver aldrig passera GraphQL-anropet.
⚠️ `themeFilesUpsert` returnerar tom `upsertedThemeFiles`-lista även när det
lyckas — verifiera med en `files`-query på `size`/`updatedAt` i stället.

### Kvar — kräver klick i adminen (API:t tillåter det inte)

1. **Butiksnamnet** står som "My Store" → ändra till **Sushi Sock**
   (Inställningar → Butiksuppgifter). Shopify har ingen `shopUpdate`-mutation
   för namnet, så det går inte via API.
1b. **Domänen `sushisock.com`** (Axels val 2026-08-26, kollad ledig mot Verisigns
   RDAP) — köps under Inställningar → Domäner.
2. **Butiksvalutan är SEK** → ändra till **USD**. Går bara innan första ordern.
3. ~~Sverige som primär marknad~~ ✅ **LÖST via API 2026-08-27.** Primärmarknaden
   kan inte bytas via API (`MarketUpdateInput` saknar `primary`), men den kunde
   döpas om till **"Rest of world"** och få `baseCurrency: USD`. Primärmarknaden
   är automatiskt fallback för alla omatchade besökare, så ingen ser SEK längre.
   `applicationLevel: ALL` stöds INTE för regioner — men behövs inte.
   Prisavrundning påslagen på alla sex marknaderna.
4. **Publicera temat** (Shopify blockerar temapublicering via API).
5. **Apparna**: Judge.me och Klaviyo om de ska med.

### Produkten — inlagd 2026-08-27

**Sushi Socks – 5 Pairs in a Takeaway Box** (`sushi-socks`,
`gid://shopify/Product/16120859820357`). ACTIVE, publicerad på alla tre kanaler.

- **9 produktbilder**, alla READY. Hämtade direkt från matstrumpor.se:s publika
  CDN (`/products.json` ger hela produkten inkl. bild-URL:er utan inloggning) och
  lagda som `originalSource` — ingen omvägen via nedladdning behövdes.
- **Engelsk copy** skriven ur den svenska: samma vinkel (rolig i kväll, på
  fötterna i morgon), men utan hastighetslöfte och utan "Fri frakt i Sverige".
- **Varianter:** `SUSHI-SOCKS-5` (5 pairs) och `SUSHI-SOCKS-3` (3 pairs),
  moms av, CONTINUE, vikt satt.
- **Samling** `all-socks` skapad, produkten i den.
- **Startsidan** kopplad till produkten och samlingen.

⚠️ **Priserna är provisoriska.** Butiksvalutan är fortfarande SEK, så jag satte
426 / 331 SEK — vilket med marknadernas prisavrundning landar kring $45 / $35.
Exakta priser sätts när butiksvalutan bytts till USD och CWD-kostnaden finns.

⚠️ **Temat duplicerades.** Shopify blockerar filskrivning mot det publicerade
temat, så startsidans produktkoppling ligger i **"Sushi Sock EN v2"** (utkast).
Det är det temat som ska publiceras. Dupliceringen är asynkron — `processing: true`
tills den är klar, och en upsert som körs innan dess skrivs över.

### Kvar för mig när det är gjort

- Paketnivåerna som `bundle_tier`-poster + riktiga rabattkoder i kassan
- Priser per marknad enligt 3×-regeln (kräver CWD-kostnad för US/UK/AU/NZ/CA)
- Fraktzoner per marknad

---

## Läget 2026-08-28 — allt komplett inför publicering

Allt tema-arbete ligger nu i **"Sushi Sock EN v3"** (`205209043269`). Axel
publicerade v2 innan bilderna var inne, och API:t får inte skriva till ett
publicerat tema — därför duplicerades v2 → v3 och ALLA ändringar nedan ligger
där. **Det Axel ser på sajten är v2 tills han publicerar v3.**

### Produkterna (5 st, alla ACTIVE på alla 3 kanaler, USD efter valutabytet 2026-08-28)

| Handle | Pris | Jämförpris | SKU |
|---|---|---|---|
| `sushi-socks` | $44.99 (5 par) / $34.99 (3 par) | – | SUSHI-SOCKS-5/3 |
| `burger-socks` | $33.99 | $56.99 | BURGER-SOCKS-2 |
| `pizza-socks` | $49.99 | $66.99 | PIZZA-SOCKS-4 |
| `donut-socks` | $33.99 | $56.99 | DONUT-SOCKS-3 |
| `wooden-chopsticks` | $5.99 | – | CHOPSTICKS-1 |

Sockprodukterna ligger i All socks; ätpinnarna är gratisprodukten i stegarna
och ligger utanför samlingen. Copy och bilder speglar matstrumpor.se
(publika `/products.json` + CDN). Priserna sattes om från de provisoriska
SEK-talen samma minut som Axel bytte butiksvalutan till USD — Shopify räknar
INTE om siffror vid valutabyte (426 kr hade blivit $426).

### Paketstegarna ("kashingbanden" — ms-paket, inte Kaching-appen)

Spegel av Matstrumpors live-stege (avläst ur renderade produktsidor):
2 nivåer × 4 produkter = **8 `ms_paketniva`-poster** + **8 riktiga BxGy-koder**.

- Nivå 1 (förvald, "Most popular"): *Buy 1 – Get 1 FREE* + 2 par ätpinnar.
  Kod `<PRODUKT>-K1F1`: buys 1 av produkten → 3 billigaste av {produkt, ätpinnar} 100 % av.
- Nivå 2 ("Best value"): *Buy 2 – Get 2 FREE* + 4 par. Kod `<PRODUKT>-K2F2`:
  buys 2 → 6 st 100 % av.
- Prefixen: SUSHI, BURGER, PIZZA, DONUT. Ärlighetsspärren i ms-paket kräver att
  koden finns i kassan — det gör alla åtta nu.

### Popuperna + översättningarna (i v3)

- **Skrapkortet (e-postpopupen)** fanns i Matstrumpors footer-grupp men hade
  fallit bort ur den översatta — återinsatt på engelska med kod **CLUB10**
  (riktig 10 %-kod skapad). `sections/ms-skrapkort.liquid` helt översatt
  (inkl. canvas-texten "SCRATCH HERE" i JS).
- **Cookie-bannern** engelsk: både settings i footer-group.json och defaults i
  `sections/ms-cookies.liquid`.
- `ms-usp-bar`, `ms-marquee`, `ms-faq-section`, `ms-guarantee-section`:
  schema/defaults engelska (renderade värden var redan engelska via index.json).
- `settings_data.json`: engelsk brand_description, tömda sociala länkar
  (pekade på Matstrumpors FB/IG), favicon (maskoten, `sushi-favicon.png`).
- EJ översatta (används inte av något aktivt template): `blocks/ms-*.liquid`,
  `sections/ms-reviews`, `ms-review-slider`, `ms-compare`, `ms-video`,
  `ms-bundle-products`, `ms-app-slot`, `snippets/ms-faq`, `ms-sales-points`,
  `ms-bundle-*`. Tas när/om de aktiveras.

### Bilderna

- 6 sektionsbilder till Files med **samma filnamn** som `shop_images`-
  referenserna (hero `hf_20260225_…`, `matstrumpor_61_dorrmattan`, UGC 52/62/63,
  gamla loggan) → referenserna löser utan template-ändringar. Alla READY.
- `templates/index.json` i v3 har bildreferenserna inlagda (hero, trygghet,
  UGC g1–g3) — de saknades helt i den första översättningen, därför var
  startsidan bildlös.
- **Loggan:** Matstrumpors original är brandat "MATSTRUMPOR.SE" och kunde inte
  återanvändas. Jag byggde en Sushi Sock-lockup (maskot + Mochiy Pop One), men
  Axel laddade samtidigt upp en egen **`sushisock_logo_916.png`** (SUSHISOCK.COM
  i bågen, samma stil som originalet) — **den är inkopplad** som logga +
  brand_image. Min `sushi-sock-logo.png` och gamla `Namnlos_design_…` ligger
  oanvända kvar i Files.

### Kvar för Axel (klick i adminen)

1. **Publicera "Sushi Sock EN v3"** — annars syns inget av ovanstående.
2. Butiksnamn "My Store" → **Sushi Sock**.
3. Köp **sushisock.com** — UTAN s på slutet (sushisocks.com är tagen, verifierat
   mot RDAP 2026-08-28).
4. ~~Butiksvaluta~~ ✅ USD bytt av Axel 2026-08-28.
5. Shopify Payments + uppgradera trialen.
6. ⚠️ **Fraktzonerna: temat lovar "Free shipping on every order"** (announcement
   bar, USP-rad, FAQ, trygghetsblock). Frakten måste sättas till fri i alla fem
   marknaderna innan lansering — annars ljuger sajten.
7. Judge.me/Klaviyo om de ska med.

### Kvar för mig

- Priser finjusteras när CWD-kostnaden för US/UK/AU/NZ/CA finns (dagens USD-tal
  är samma prispunkter som de provisoriska SEK-talen siktade på).
- Fraktzoner via API om Axel vill.

---

## Marknadsgranskningen 2026-08-28 (eftermiddag) — butiken är LIVE

Sedan förmiddagen har Axel: publicerat v3, köpt och kopplat **sushisock.com**,
bytt butiksnamnet till "sushisock.com", bytt valutan till USD — och **redigerat
startsidan i temaredigeraren** (14:30 UTC): tog bort sortiment- och
statement-sektionerna + cookie-bannern, bytte mejlen till hello@sushisock.com,
länkade hero-knappen till /collections/all.

**Rotorsaken till hans raderingar:** samlingen `all-socks` var aldrig publicerad
på försäljningskanalerna → `/collections/all-socks` gav 404 och "The whole set"
såg trasig ut. ⚠️ **Lärdom: en samling som skapas via API måste också
`publishablePublish`:as, precis som produkter.** Fixat — samlingen ligger nu på
alla tre kanalerna och URL:en svarar 200.

**"Sushi Sock EN v4"** (`205244858693`) = Axels redigerade v3 + sortiment,
statement och cookie-bannern återinsatta (hans mejl och länkar behållna).
Skrivning mot publicerat tema är blockerad, därför ny dubblett. **Axel
publicerar v4.** Om cookie-bannern togs bort med flit: säg till, så tas den ur.

### Verifierat per marknad (rätt sida, rätt valuta, rätt matematik)

| Land | Valuta | Sushi 3-par | Stege nivå 1 |
|---|---|---|---|
| US | USD | $34.99 | $44.99 (förr $101.96) |
| GB | GBP | £27 | £34 (förr £78) |
| AU | AUD | A$50 | ✓ |
| NZ | NZD | NZ$61 | ✓ |
| CA | CAD | C$50 | ✓ |
| SE/DE/övriga | USD (fallback via primär US) | $34.99 | ✓ |

- Alla 5 produktsidorna på engelska, noll svenska spår, stegen renderar överallt
  (ätpinnarna har medvetet ingen stege). Gåvovärdet konverteras per valuta.
- **Kassatest på riktigt** (cookie-jar, /cart/add.js + /discount/SUSHI-K1F1):
  2 lådor + 2 ätpinnar → totalpris $44.99, rabatt $56.97 — exakt widgetens löfte.
- Landväljaren listar exakt de 6 marknadsländerna.
- **Frakt: zonen "Internationell" (US/GB/AU/NZ/CA m.fl.) har Standard $0 = fri
  frakt** — löftet "Free shipping on every order" håller för alla målmarknader.
- Privacy policy finns och är på engelska; /pages/contact och
  /pages/data-sharing-opt-out svarar 200.

### Popup-besluten (Axel 2026-08-28 kväll)

- **Cookie-samtycket sköts av Shopifys inbyggda banner** (Inställningar →
  Kundintegritet), som är region-smart. Temats egen `ms-cookies` är helt
  BORTTAGEN ur v4:s footer-grupp — lägg aldrig tillbaka den utan att stänga av
  Shopifys, annars blir det dubbla banners.
- **Inga e-postpopups på engelska butiken** (alla länder, UK inkluderat):
  `ms_skrapkort` ligger kvar i footer-gruppen med alla inställningar men
  `visible: false` — slås på igen med kryssrutan i temaredigeraren.
  **Rabattkoden CLUB10 är inaktiverad** i kassan (status EXPIRED) — utan popup
  ska koden inte gå att använda. Återaktiveras i Rabatter om popupen slås på.
- Footerns inbyggda nyhetsbrevsfält ("Get the good stuff") är kvar — det är
  ett formulär i sidfoten, ingen popup.

### Kvarvarande smått (Axel)

1. **Publicera "Sushi Sock EN v4".**
2. **Policysidor saknas:** refund/terms/shipping — sajten lovar 30-day returns.
   Inställningar → Policyer → "Infoga mall" (engelska, en per policy).
3. Sverigezonens gamla fraktpriser (65/99 SEK) blev $65/$99 efter valutabytet —
   ta bort de betalda raderna (gratisraden finns kvar) eller ta bort SE-zonen.
4. Butiksnamnet är "sushisock.com" — funkar, men "Sushi Sock" blir snyggare i
   flikar/kvitton. Axels val.
5. Städa gamla teman (v2, exporten, extra v3-dubbletten `205207961925`, Horizon)
   — API:t får inte radera teman.
6. EU-fraktzonen (299) är död konfig — EU-länder ingår inte i någon marknad och
   kan inte checka ut. Ofarligt.

### Domänvalet 2026-08-26

`sushisocks.com` och `foodsocks.com` var båda tagna. Lediga alternativ som
kontrollerades mot `rdap.verisign.com` (auktoritativ för .com): sushisock.com,
sockshi.com, wearsushi.com, socksushi.com, makisocks.com, nigirisocks.com,
thesushisocks.com, getsushisocks.com, foodsox.com, munchsocks.com,
mealsocks.com, socksnack.com, sockmeal.com, funfoodsocks.com, rollsocks.com,
wasabisocks.com, sushitoes.com. **Axel valde `sushisock.com`.**

Kontrollmetod (går att köra igen): `curl -o /dev/null -w "%{http_code}"
https://rdap.verisign.com/com/v1/domain/<domän>` → 404 = ledig, 200 = tagen.
DNS-uppslag duger INTE — en registrerad domän kan sakna DNS-poster.
