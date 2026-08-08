# BeaverShop UK — status

Butik: **BeaverShop** (`1wucum-x0.myshopify.com`, domän `beavershop.co.uk`), plan Basic.
Källa: Bäverbutiken (SE). Playbook: `market-expansion/PLAYBOOK.md`.

---

## 🔴 KVAR FÖR AXEL — en enda knapp

**Publicera temat.** Allt UK-arbete ligger i temat **"BeaverShop UK (arbetskopia)"**
(id `188488778108`). Shopify-API:t vägrar publicera teman av säkerhetsskäl, så det måste
göras manuellt: Online Store → Themes → arbetskopian → **Publish**.

Tills dess visar butiken det importerade Norge-temat med de nya engelska produkterna i.

Övrigt kvar (inget blockerar försäljning, men bör göras): frakt, betalning, VAT-registrering,
privacy policy. Se listan längst ned.

---

## 💱 Valuta och marknad — löst

Butikens grundvaluta är fortfarande **SEK** (Shopify tillåter inte byte via API), men det
spelar ingen roll längre. Lösningen är en egen UK-marknad:

| Marknad | Region | Valuta | Växelkurs |
|---|---|---|---|
| United Kingdom (`uk`) | GB | **GBP** | fast 1:1, avrundning av |
| Sverige (`se`, primär) | SE | SEK | — |

Eftersom priserna redan är inlagda som pundbelopp ger 1:1-kursen exakt rätt siffra.
Verifierat: Beaver Lamp Pro visas som **£14.99** (ord. £22.99) för en brittisk besökare.
Momsstrategin är satt till **priser inklusive moms**, som brittisk praxis kräver.

Om du senare byter butikens grundvaluta till GBP i admin fungerar allt likadant — 1:1 mot
GBP är fortfarande 1:1.

---

## ✅ Produkter (134 st) — LIVE

Alla 134 produkter översatta till brittisk engelska och inlagda via `productSet` — **noll fel**.
Bilder, varianter, priser, SKU:er, taggar och SEO följde med. Loggar per chunk i
`output/push-results/chunk-*.log.jsonl`, källdata i `output/catalog.uk.json`.

- Status: **ACTIVE** — alla 134, noll fel
- Kanal: alla 134 publicerade till **Webbshop** — detta var fällan som gjorde
  produkterna osynliga i Norge
- Priser i GBP via UK-marknaden
- **Fortsätt sälja när lagret är slut**: verifierat på **alla 282 varianter** (`CONTINUE`,
  noll undantag). 98 varianter har lagersaldo 0 men är ändå säljbara tack vare detta —
  inga lagersaldon har rörts.

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

1. **Publicera temat** (arbetskopian) — spärrat för API, se överst
2. **Frakt**: fraktzoner och priser för Storbritannien
3. **Betalning**: kortbetalning och Klarna för UK
4. **Moms**: brittisk VAT-registrering och momsinställningar
   (marknaden är redan satt till priser inklusive moms)
5. **Privacy policy**: generera Shopifys mall på engelska i Settings → Policies —
   sidfoten länkar redan dit
6. **Juridisk slutgranskning** av sidtexterna (flaggor i `output/build-report.md`)
7. Valfritt: radera de 9 tomma svenska kollektionerna

## ✅ Gammalt svenskt innehåll avstängt

Butiken var tidigare trädgårdsbutiken "Trevlig Trädgård". Följande är nu avstängt:

- **14 svenska produkter** → DRAFT (Vattenslangshållare, Soldriven Utelampa, Trädgårds-Kit,
  Snigelfällan, Rotvännen, GlowPath m.fl.). Ordrarna i historiken (23 st, senast 2025-08-05)
  påverkas inte — produkterna finns kvar, de visas bara inte.
- **13 svenska sidor** → avpublicerade, inklusive de svenska juridiska sidorna
  (Integritetspolicy, Fraktpolicy, Retur & återbetalningspolicy, Garanti policy) som annars
  hade legat kvar parallellt med de nya brittiska.

**Kvar:** 9 gamla svenska kollektioner (Vatten & Tillbehör, Trädgårdsbelysning, Krukor & Mer,
Växtbelysning, Bevattningssystem, Verktyg & Redskap, Markis, Träskjul, Alla Produkter).
Avpublicering av kollektioner är spärrad i verktygslagret, så de ligger kvar — men de är
**tomma** (alla deras produkter är utkast nu) och länkas inte från någon meny. Radera dem
i admin om du vill städa helt.

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
