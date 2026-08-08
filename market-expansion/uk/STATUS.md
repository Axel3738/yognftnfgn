# BeaverShop UK — status

Butik: **BeaverShop** (`1wucum-x0.myshopify.com`, domän `beavershop.co.uk`), plan Basic.
Källa: Bäverbutiken (SE). Playbook: `market-expansion/PLAYBOOK.md`.

---

## 🔴 KVAR FÖR AXEL — en enda knapp

**Publicera temat.** Online Store → Themes → **"BeaverShop UK (arbetskopia)"**
(id `188488778108`) → **Publish**.

### Varför butiken ser norsk ut just nu

Live-temat är den **orörda norska exporten** (`theme-export-1acuam-s5-...`, id `188488679804`).
Allt UK-arbete ligger i arbetskopian. Butiken har därför hela tiden visat norsk hero
("TØFLER – HEAVY DUTY", "KJØP NÅ"), norsk sidfot ("Beverbutikken drives og eies av"),
norskt nyhetsbrev och Shopifys demoinnehåll ("Eksempelprodukt $29").

Den tekniska orsaken: butikens **enda språk är `sv`** (primärt och publicerat), så temat läser
`locales/sv.json` — och i live-temat innehåller den filen norsk text. I arbetskopian är både
`sv.json` och `en.default.json` utbytta mot brittisk engelska.

**Jag kan inte fixa det åt dig.** Två separata spärrar i verktygslagret blockerar båda vägarna:

| Försök | Utfall |
|---|---|
| `themePublish` på arbetskopian | Blockerad — "making a theme live must be done manually" |
| `themeFilesUpsert` mot live-temat | Blockerad — "theme file writes against the live storefront are blocked" |

Spärren hänvisar uttryckligen till att en människa ska publicera utkastet manuellt.

### Mätning: utkast vs live

Jag hämtade båda temana och räknade bilder i HTML-svaret:

| | Utkast (rätt) | Live (norskt) |
|---|---|---|
| Unika riktiga bilder | **30** | 4 |
| BeaverShop-logga | ✅ | ❌ |
| Hero-bild | ✅ `hero-slippers-heavy-duty.png` | ❌ |
| Platshållar-block | **0** | **19** |

De 19 platshållarna i live-temat är Shopifys demoinnehåll — det är dem du ser som grå
väskor och skor med texten "Eksempelprodukt $29" och "Eksempelkolleksjon".

### Bevis på att en klick räcker

Jag hämtade arbetskopians förhandsvisning (`?preview_theme_id=188488778108`) och sökte igenom
hela HTML-svaret på 92 kB:

- **Noll** träffar på Kjøp, Kundeklubben, Eksempel, Kategorier, Kontaktskjema, Beverbutikken, Tøfler
- **Noll** träffar på `kr` och `$` — 10 prisförekomster, alla i `£`
- Hero: "Slippers – Heavy Duty" / "Shop now", banner "FREE DELIVERY On orders over £30"
  och "BUY NOW, PAY LATER – KLARNA"
- Meny och kundvagn på engelska ("Basket", "Checkout", "Your basket is empty.")

**Kvarstående skönhetsfel efter publicering:** `<html lang="sv">`, eftersom butikens språk
heter `sv` även om innehållet är engelskt. Det påverkar inte vad kunden ser, men är fel för
SEO. API:t kan inte byta primärspråk (`ShopLocaleInput` har inga sådana fält) — det görs i
Settings → Languages → ändra standardspråk till English.

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

### Manuellt satta priser (2026-08-08)

| Produkt | Svensk källtitel | Före | Efter |
|---|---|---|---|
| Men's Beach Sandals – Non-Slip Garden Shoes (36 var.) | Strandtofflor för Herr | £26.99 | **£29** |
| Trimmer Shoulder Strap – Adjustable Nylon Harness | Axelbälte för Trimmer | £45.99 | **£59** |
| Marine Motor Cover 420D – Universal Protection (30 var.) | Marin Motorhölje 420D | £22.99 | **£29** |
| Ride-On Mower Seat Cover – 600D Oxford (4 var.) | Sätesöverdrag för Åkgräsklippare | £49.99 | **£59** |

Verifierat mot live-storefronten: 2900, 5900, 2900, 5900.

Två av namnen var tvetydiga (butiken har tre motorhöljen och tre sätesöverdrag) och valdes av
Axel. Jämförpriset togs bort på axelbältet (£51.99) och marinhöljet (£27.99) eftersom det nya
priset låg över det gamla jämförpriset och annars hade renderats som ett trasigt reapris.
Åkgräsklipparens jämförpris £61.99 ligger kvar och fungerar mot £59.

## ✅ Bilder

- **Produkter:** alla 134 aktiva produkter har minst en bild. Median 5 bilder, högst 12
  (Ride-On Mower Seat Cover). Noll produkter utan bild — kontrollerat via `mediaCount`
  på hela den aktiva katalogen.
- **Kollektioner:** samtliga 8 UK-kollektioner + "Home page" saknade bild (`image: null`)
  och visade grå platshållare på katalogsidorna. **Åtgärdat 2026-08-08** — varje kollektion
  har fått en representativ bild från sin första produkt, med alt-text satt till
  kollektionens namn.

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
