# BeaverShop UK — status

Butik: **BeaverShop** (`1wucum-x0.myshopify.com`, domän `beavershop.co.uk`), plan Basic.
Källa: Bäverbutiken (SE). Playbook: `market-expansion/PLAYBOOK.md`.

---

## 🔴 STOPPKLOSS — måste fixas av Axel innan något aktiveras

Butiken står på **svenska kronor** och har **bara marknaden Sverige**:

| Inställning | Nu | Ska vara |
|---|---|---|
| Valuta (Settings → Store defaults) | SEK, format `{{amount_no_decimals}} kr` | GBP, `£{{amount}}` |
| Marknad (Settings → Markets) | Sverige (primär) | United Kingdom |

Produktpriserna är inlagda i **pund** (2,99–257,99). Med nuvarande valutainställning skulle
en produkt på 26,99 £ visas som **"27 kr"** — och brittiska kunder kan inte checka ut alls
eftersom Storbritannien inte är ett försäljningsområde.

**Därför ligger alla 134 produkter kvar som DRAFT.** De är kanalpublicerade till Webbshop,
så de tänds direkt när de aktiveras. Aktivera dem INTE innan valuta och marknad är rätt.

När det är gjort: säg till, så sätter jag alla 134 till ACTIVE i en körning.

---

## ✅ Produkter (134 st)

Alla 134 produkter översatta till brittisk engelska och inlagda via `productSet` — **noll fel**.
Bilder, varianter, priser, SKU:er, taggar och SEO följde med. Loggar per chunk i
`output/push-results/chunk-*.log.jsonl`, källdata i `output/catalog.uk.json`.

- Status: **DRAFT** (medvetet, se stoppklossen ovan) — inget syns för kunder
- Kanal: alla 134 kopplade till **Webbshop**, noll fel — detta var fällan som gjorde
  produkterna osynliga i Norge. Verifierat med `resourcePublicationsV2(onlyPublished: false)`;
  `isPublished` står kvar som `false` så länge produkten är DRAFT, vilket är väntat.
- Priser i GBP, hämtade från källbutiken

## ✅ Kollektioner (8 st)

| Kollektion | Handle | Produkter |
|---|---|---|
| Camping & Outdoor Life | `camping-outdoor-life` | 30 |
| Car, Tools & Garage | `car-tools-garage` | 26 |
| Garden & Outdoors | `garden-outdoors` | 21 |
| Accessories & More | `accessories-more` | 20 |
| Vehicles & Lighting | `vehicles-lighting` | 20 |
| Boat & Marine | `boat-marine` | 11 |
| Farming & Animals | `farming-animals` | 5 |
| Home page (Bestsellers) | `frontpage-beavershop` | 8 (handplockade reapriser) |

Samtliga är publicerade till Webbshop-kanalen.

1 produkt ligger medvetet utanför kategorierna: `guarantee-for-secure-shipping`
(fraktgaranti-upsell, ska inte vara browsbar). Mappning: `build/collection-map.json`.

## ✅ Sidor och menyer

Sex sidor på brittisk engelska, skrivna mot **brittisk konsumentlag** (inte översatt norsk text):
About us, FAQ, Shipping, Returns, Terms, Contact. Alla publicerade.

- Huvudmeny: Home, de 7 kategorierna, All products, Contact us
- Sidfot: Search, About BeaverShop, FAQ, Shipping, Returns, Terms, Privacy policy, Contact

## ✅ Logotyp

`beavershop-logo.png` (svart), `-white.png` (vit, för svart header/sidfot),
`-plain.png`, `-favicon.png` — uppladdade till Files. Källskript: `build/make-logo.py`.

---

## 🎨 Tema

Axel importerade Norge-temat (Impulse) och det ligger nu som **publicerat** i butiken.
**Shopify-API:t vägrar skriva till ett publicerat tema**, så jag har gjort en arbetskopia:

> **"BeaverShop UK (arbetskopia)"** — id `188488778108`, opublicerad

Allt arbete är gjort i arbetskopian. Det publicerade temat är orört och fortfarande norskt.

Gjort i arbetskopian:
- **Startsida**: hero "Slippers – Heavy Duty" + "Shop now", 7 kategorirutor → brittiska
  kollektionshandles, "Bestsellers"-sektion → `frontpage-beavershop`, nyhetsbrev och
  kontaktformulär på engelska
- **Globala inställningar**: vit BeaverShop-logga i header, svart i kassan,
  banners "FREE DELIVERY / On orders over £30" och "BUY NOW, PAY LATER - KLARNA",
  "THE BEAVER CLUB" i sidfoten, firmatext STONEBITE ECOM AB, valutaväljare av
- **Språkfiler**: alla 551 nycklar översatta till brittisk engelska (basket, delivery,
  postcode, colour) och skrivna till både `sv.json` och `en.default.json` — butikens
  primärspråk är `sv`, så temat läser `sv.json`
- **Sidmallar**: 26 mallar genomgångna (produkt, kollektion, kundvagn, FAQ, 404, blogg,
  lösenord m.fl.), inklusive de specialmallar som missades i Norge-körningen
- **Hero-bild**: den norska gick inte att kopiera (404), så produktbilden på tofflorna
  används istället

**Återstår för Axel: förhandsgranska arbetskopian och klicka Publish.** Spärrat för API med flit.

---

## Kvar att göra manuellt

1. **Valuta → GBP och marknad → United Kingdom** (stoppklossen ovan) — därefter aktiverar jag produkterna
2. **Publicera temat** (arbetskopian) när du granskat det
3. **Frakt och betalning**: fraktzoner för UK, Klarna/kortbetalning
4. **Moms**: brittisk VAT-registrering och momsinställningar
5. **Personvern/Privacy policy**: generera Shopifys mall på engelska i Settings → Policies
6. **Butiksnamn** står redan som BeaverShop — inget att göra
7. **Juridisk slutgranskning** av sidtexterna (flaggor i `output/build-report.md`)

## ⚠️ 14 gamla svenska produkter ligger LIVE just nu

Butiken innehåller sedan tidigare 14 aktiva produkter på svenska från den gamla
trädgårdsbutiken (Vattenslangshållare, Soldriven Utelampa, Trädgårds-Kit, Snigelfällan m.fl.,
skapade mars–juni 2025). De är **ACTIVE och publicerade** — det är dessa, inte de nya, som
en besökare ser på `beavershop.co.uk` idag.

Butiken har 23 riktiga ordrar, den senaste 2025-08-05 (drygt ett år sedan) — den är alltså
i praktiken vilande, men jag har **inte rört** de gamla produkterna eftersom det är en
kundvänd ändring på en live-butik med orderhistorik.

**Rekommendation:** sätt dem till DRAFT eller arkivera dem när UK-sortimentet aktiveras.
Säg till så gör jag det i samma körning.

## Kända avvikelser

- Två skräpsträngar från källtemat (`© 2023 xoxo`, `© 2023 Hahahhaha`) rättade till BeaverShop
- Datumformat ändrat till brittisk ordning (`%d %b %Y`)
- Hela standardtemat (Impulse 5.0.0) är genomgående engelskt — all kundtext går via
  språknycklar. Liquid-skanning av 119 filer hittade **ingen** hårdkodad norsk text.
- **GemPages-rester**: 8 maskingenererade `sections/gp-section-*.liquid` innehåller svensk
  annonstext, e-postadressen `kundsupport@baverbutiken.se` och länkar till `baverbutiken.se`.
  De är medvetet orörda: filerna är märkta "SHOULD NOT modify", texten ligger i schema-defaults
  som skrivs över av mall-JSON, och **ingen sida i butiken använder dem idag**. Städa eller
  översätt via GemPages-editorn om de ska användas.
- Gamla svenska/norska rester (teman Dawn, Craft, shrine) — orörda, syns inte för kunder
- `templates/product.tradgards-kit.json` finns inte i det importerade temat (fanns i det svenska)
- `locales/nb.json` (norska) ligger kvar i temat — oanvänd, butiksspråket är `sv`
