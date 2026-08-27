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
