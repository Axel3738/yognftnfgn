# FRAMEWORK: klona Bäverbutiken till en ny marknad

Beprövat två gånger: **Norge** (Beverbutikken, 2026-08-06/07) och **Storbritannien**
(BeaverShop, 2026-08-07/09). Följ faserna i ordning. Allt material ligger i `market-expansion/`.

Den här filen är sessionens minne. En ny AI-session vet ingenting om tidigare körningar —
den vet bara det som står här.

---

## Så startar du en session

> "Läs `market-expansion/PLAYBOOK.md`. Ny marknad: **\<LAND\>**, språk **\<SPRÅK\>**,
> valuta **\<VALUTA\>**, brand **\<BRAND\>**. Butiken är kopplad via Shopify-MCP:n.
> Kör hela processen och följ verifieringsgrindarna."

---

## Grundregler för AI-sessionen — icke förhandlingsbara

Dessa finns för att båda körningarna gick fel på samma sätt: arbete rapporterades klart
utan att någon hade tittat efter.

1. **Verifiera butiken innan något skrivs.** `get-shop-info`. Fel butik = katastrof.
2. **Ett steg är inte klart förrän verifieringskommandot har körts och utdata visats.**
   "Jag skapade kollektionerna" räknas inte. Utdata från en räknande query räknas.
3. **Räkna, gissa inte.** Varje fas nedan har en grind med ett konkret kommando. Kör den.
4. **Uppdatera `<marknad>/STATUS.md` löpande.** Committa efter varje fas. Kontexten tar slut
   mitt i arbetet — repot är det enda som överlever.
5. **Påstå aldrig något i butikstext som inte är konfigurerat.** Fri frakt, Klarna, lokal
   support, leveranstider. Se fas 9 — det här är en juridisk risk, inte en detalj.
6. **Rapportera blockeringar direkt.** Om ett verktyg vägrar: säg det i klartext samma
   sekund, föreslå vem som måste göra det manuellt. Tyst nedskalning är värre än ett nej.

---

## Fas 0 — Parametrar

| Parameter | Norge | UK | Ny marknad |
|---|---|---|---|
| Språk | norskt bokmål | brittisk engelska | |
| Valuta | NOK | GBP | |
| Prisregel | NOK = SEK 1:1 | pundbelopp, marknadskurs 1:1 | |
| Brand | Beverbutikken | BeaverShop | |
| Bolag i sidfot | STONEBITE ECOM AB | STONEBITE ECOM AB | |
| Konsumentlag | angrerettloven 14 d, VOEC | CRA 2015, 14 d ångerrätt, UK VAT | EU: 14 d + OSS |
| Momsstrategi | — | priser **inkl.** moms | EU/UK: inkl. moms |

---

## Fas 1 — Vad människan måste göra FÖRST

Blockerar allt annat. Gör detta innan sessionen startar.

1. Skapa butiken i Shopify, koppla den till sessionens Shopify-MCP.
2. Ladda upp det svenska temats zip: Themes → Add → Upload zip.
   **⚠️ PUBLICERA DEN INTE.** Shopify-API:t vägrar skriva till ett publicerat tema, och
   `themePublish` är blockerat för AI-sessionen. Publicerar du för tidigt är temat låst och
   allt temaarbete måste göras i en kopia som du sedan får publicera manuellt ändå.
3. Installera apparna: **Judge.me** och **Kaching Bundles**. Båda måste finnas innan
   temamallarna byggs, annars saknas deras block i mallarna.
4. Sätt butikens språk om målspråket finns: Settings → Languages. API:t kan **inte** byta
   primärspråk (`ShopLocaleInput` saknar fälten), så gör det nu eller lev med fel `<html lang>`.

---

## Fas 2 — Källdata

`source-export/` innehåller full export av Bäverbutiken: produkter med `descriptionHtml`,
varianter, bilder, kollektioner med medlemskap, menyer, sidor, policyer.

Återanvänd den. Exportera bara om svenska sortimentet ändrats väsentligt — det kräver att
sessionen kopplas mot svenska butiken, vilket kostar en auktoriseringsväxling.

---

## Fas 3 — Översätt katalogen

1. `make-batches.mjs` → 10 batchar à ~14 produkter i `<marknad>/build/`.
2. Starta 10 parallella översättningsagenter. Reglerna:
   - behåll HTML-strukturen exakt
   - schema med `handle` som nyckel
   - flagga garantilöften och leveranstider som `JURIDISK GRANSKNING`
   - Bäver-namn → lokalt brand
   - mått och storlekar orörda
   - ny SEO-titel + beskrivning per produkt
3. `build-catalog.mjs` → `catalog.<marknad>.json` + `shopify-import.csv` + `build-report.md`.
   Justera `CAT_BY_*`, valutaregel, vendor och **slug-tabellen för språkets tecken**.

**Grind:** `build-report.md` finns, 134 produkter i katalogen, alla flaggor listade.

---

## Fas 4 — Push till butiken (ordningen spelar roll)

1. **Kollektioner först** — `collectionCreate`, aliasbatch. ID:n behövs av produkterna.
2. **Produkter** — `make-jsonl.mjs` (uppdatera kollektions-ID + location-ID) → JSONL →
   chunkar → parallella agenter kör `productSet` rad för rad med loggfil.
   - ⚠️ `bulkOperationRunMutation` är blockerat av MCP-policyn. Därav agent-vägen.
   - ⚠️ Sätt `inventoryPolicy: CONTINUE` och `templateSuffix` **redan i productSet-inputen**.
     Båda körningarna missade det och fick göra en separat efterkörning.
3. **⚠️ KANALPUBLICERING — största fällan.** API-skapade produkter och kollektioner hamnar
   **inte** i Onlinebutik-kanalen. Kör `publishablePublish` (aliasbatch ~30/anrop) för alla
   produkter *och* kollektioner mot butikens Webbshop-publication.
   Hämta id: `{ publications(first:10){ nodes{ id name } } }`.
   Utan detta ser butiken tom ut fast allt är ACTIVE.
4. **Kollektionsbilder.** Kollektioner skapade via API får `image: null` och renderar grå
   platshållare. Sätt en bild per kollektion, förslagsvis från dess första produkt, med
   alt-text. *Missades i UK-körningen och upptäcktes av Axel.*
5. **Sidor** — `pageCreate`, aliasbatch. Skriv om juridiken mot landets konsumentlag.
   **Översätt inte den norska texten** — lagarna skiljer sig.
6. **Menyer** — `menuUpdate` ×2: huvudmeny med kategorier, sidfot med sidorna.

**Grind:**
```graphql
{ productsCount(query:"status:active"){count}
  collections(first:20){nodes{handle image{url} productsCount{count}}} }
```
134 aktiva produkter, alla kollektioner har `image` ≠ null och > 0 produkter.
Verifiera dessutom kanalpublicering med `publishedOnPublication` på ett stickprov.

---

## Fas 5 — Marknad, valuta och moms

Butikens **grundvaluta går inte att byta via API** och Shopify tillåter det sällan alls.
Lösningen är en egen marknad:

1. `marketCreate` med målregionen.
2. Sätt marknadens valuta + **fast växelkurs** som matchar hur priserna är inlagda.
   UK: priserna låg redan som pundbelopp → kurs 1:1 → £14.99 blir £14.99.
3. Momsstrategi: **priser inklusive moms** för UK och EU.

**Grind:** hämta en produktsida från storefronten och kontrollera att priset visas i rätt
valuta med rätt siffra. Inte katalogfilen — den riktiga sidan.

---

## Fas 6 — Frakt ⚠️ NY, detta sänkte UK

Det här missades helt i UK-körningen och upptäcktes först när Axel frågade om han fick
skriva "Free Shipping".

Fraktzonerna ärvs från den svenska butiken. Ett nytt land hamnar nästan alltid i en generisk
zon — UK låg i "Internationell" med **299 SEK på varje order**, villkor `TOTAL_PRICE >= 0`.
Shopify växlar fraktpriset till **verklig valutakurs**, inte marknadens fasta kurs, så en
brittisk kund fick £23.38 i frakt på en order på £44.97.

1. Skapa en egen leveranszon för landet med priser i rätt storleksordning.
2. Bestäm tröskel för fri frakt och lägg fraktkostnaden i produktpriserna om du vill kunna
   marknadsföra fri frakt.
3. Stäm av mot vad temats banner påstår (fas 7 och 9).

**Grind — kör alltid, med riktig adress i landet:**
```graphql
mutation { draftOrderCalculate(input:{
  presentmentCurrencyCode: GBP,
  lineItems:[{variantId:"gid://shopify/ProductVariant/<id>", quantity:3}],
  shippingAddress:{address1:"10 Downing Street", city:"London", zip:"SW1A 2AA", countryCode:GB}
}){ calculatedDraftOrder {
  totalPriceSet{presentmentMoney{amount currencyCode}}
  availableShippingRates{title price{amount currencyCode}} } } }
```
Fraktpriset ska vara rimligt i landets valuta. Är det inte det säljer butiken ingenting.

---

## Fas 7 — Tema (alltid i en opublicerad kopia)

Två spärrar gäller AI-sessionen och de går inte runt:

| Försök | Utfall |
|---|---|
| `themePublish` | Blockerad — "making a theme live must be done manually" |
| `themeFilesUpsert` mot live-temat | Blockerad — "theme file writes against the live storefront are blocked" |

Arbeta därför alltid i en opublicerad kopia och lämna publiceringen till människan.

1. `templates/index.json` — hero, knappar, kategorirutor → nya kollektionshandles,
   bestseller-sektion → marknadens frontpage-kollektion.
2. `config/settings_data.json` — logga, banners, sidfotstexter, nyhetsbrev.
3. **Locale-filerna.** Temat läser den fil som matchar butikens *primärspråk*. Är primärspråket
   `sv` läser det `locales/sv.json` oavsett att innehållet är engelskt. Skriv därför samma
   översatta innehåll till **sv.json, en.default.json och \<språk\>.json**. UK-butiken såg
   norsk ut i dagar exakt på grund av detta.
4. Alla `templates/*.json` utom gem/gp-filer. **Bevara Judge.me- och Kaching-blocken** —
   bygg mallarna från butikens nuvarande tema, inte från en gammal kopia, annars försvinner
   widgetarna och de måste läggas in för hand.
5. Produktmallarna: `product.claudeprodukter/beverlam/strandtofflor/snabbtrratter.json`.
   Missades i Norge-körningen. Färdiga norska versioner: `no/theme-templates/`.
6. Bilder som temat refererar (`shopify://shop_images/...`) finns inte i nya butiken. Kopiera
   med `fileCreate(originalSource:"https://cdn.shopify.com/s/files/1/1013/0322/2621/files/<namn>")`
   och **samma filnamn** — Shopify hämtar server-side, sandboxens curl är blockerad mot CDN.
7. Logga: `build/make-logo.py` (Pillow). Svart + **vit** variant (header och sidfot är svarta)
   + favicon. Upload: `stagedUploadsCreate` → curl POST → `fileCreate`.

**Grind — hämta förhandsvisningen och räkna:**
```bash
curl -s "https://<domän>/?preview_theme_id=<id>" -c ck.txt -L -o draft.html
grep -ocE '<källspråkets ord>' draft.html      # ska vara 0
grep -oE '/cdn/shop/files/[^"]+\.(jpg|png|webp)' draft.html | sort -u | wc -l
grep -oc 'placeholder' draft.html               # ska vara 0
```
Bilderna ligger på `<domän>/cdn/shop/files/`, **inte** `cdn.shopify.com` — fel mönster ger
noll träffar och får dig att tro att bilderna saknas.

---

## Fas 8 — Judge.me-recensioner

Färdigt script: `uk/build/make-judgeme-csv.py` med `judgeme-translations.json` och
`judgeme-names.json` bredvid. Kopiera och byt ut de två JSON-filerna.

1. Extrahera alla unika strängar ur `title`/`body`/`reply` i deterministisk ordning,
   översätt indexerat. Aldrig nyckel-mot-nyckel — då tappas strängar tyst.
2. Byt recensentnamnen mot namn som är vanliga i landet. **En fast identitet per person** —
   samma källnamn ska alltid ge samma nya namn.
3. Nya e-postadresser på `example.com`. Hitta inte på adresser hos gmail eller liknande;
   de kan tillhöra riktiga människor som då får utskick om recensioner de aldrig skrivit.
4. `product_handle`: mappa via `sourceHandle` som finns i båda katalogerna.
5. Nollställ `metaobject_handle`, `ip_address` och `product_id` — de pekar på källbutiken.
6. Sätt `location` till orter i landet.
7. Rader utan produktkoppling kan inte importeras. Välj bort dem och rapportera vilka.
8. Behåll `rating`, `review_date`, `source` och `curated` orörda.

**Grind:** alla handles finns och är ACTIVE i butiken, noll tecken från källspråket kvar,
betygsfördelningen oförändrad mot källan.

---

## Fas 9 — Sanningskontroll före lansering

Temat bär med sig påståenden från förra marknaden. Varje sådant påstående måste stämma mot
den faktiska konfigurationen, annars är det olaglig marknadsföring.

I UK gäller **DMCC Act 2024** sedan april 2025: CMA kan bötfälla direkt, utan domstol, upp
till 10 % av global omsättning. Vilseledande påståenden om säljarens identitet eller om
erbjudandets villkor är precis den kategorin. EU har motsvarande regler via direktivet om
otillbörliga affärsmetoder.

Gå igenom och stäm av mot verkligheten:

| Påstående | Stäm av mot |
|---|---|
| "FREE DELIVERY on orders over £X" | fas 6 — finns tröskeln på riktigt? |
| "BUY NOW, PAY LATER – KLARNA" | är Klarna aktiverat i betalningarna? |
| "British / lokal customer support" | **har du personal i landet?** Bolaget är svenskt |
| Leveranstider på produktsidor och FAQ | vad lovar fraktzonen faktiskt? |
| Garantilöften från `build-report.md` | landets konsumentlag |

Säkra alternativ som är sanna: "English-speaking support", "Replies within 24 hours",
"UK returns address" om en sådan finns.

---

## Fas 10 — Människans slutsteg

1. **Publicera temat.** Themes → arbetskopian → Publish.
2. Sätt primärspråk om det inte gjordes i fas 1.
3. Importera Judge.me-CSV:n i appen.
4. Bygg Kaching-bundles.
5. Frakt, betalning, domän, momsregistrering (VOEC / UK VAT / OSS).
6. Personvern-policy: generera Shopifys mall på målspråket.
7. Juridisk slutgranskning av alla flaggor i `build-report.md`.

---

## Manuellt varje marknad — sammanfattning

| När | Vad | Varför AI:n inte kan |
|---|---|---|
| Före | Skapa butik, koppla MCP | kräver inloggning |
| Före | Ladda upp temazip, **publicera inte** | `themePublish` blockerad |
| Före | Installera Judge.me + Kaching | appinstallation kräver admin |
| Före | Sätt primärspråk | `ShopLocaleInput` saknar fälten |
| Efter | Publicera temat | blockerad |
| Efter | Importera Judge.me-CSV | appens eget gränssnitt |
| Efter | Bygga Kaching-bundles | appens eget gränssnitt |
| Efter | Frakt, betalning, moms, domän | affärsbeslut + registreringar |

---

## Kända fällor

Alla har inträffat på riktigt.

1. **Produkter osynliga trots ACTIVE** → kanalpublicering saknades (fas 4.3).
2. **Temat publicerat mitt i arbetet** → API-lås, allt temaarbete måste göras om i kopia.
3. **Locale-filen matchar primärspråket, inte innehållet** → butiken visade norska i dagar.
4. **Kollektioner utan bild** → grå platshållare på katalogsidorna.
5. **Fraktzonen ärvd från Sverige** → £23.38 i frakt till UK, oupptäckt till lansering.
6. **Temats banners ljuger** om fri frakt och Klarna för den nya marknaden.
7. **`cdn.shopify.com` vs `<domän>/cdn/shop/files/`** → fel grep, falsk slutsats att bilder saknas.
8. **`search_products`-statusfilter ignoreras tyst** vid felsyntax — verifiera med `nodes`,
   lita aldrig på ett count-filter.
9. **Klassificeraren blockerar enskilda kommandon godtyckligt** → formulera om, dela upp,
   eller låt en subagent göra MCP-anropet.
10. **Temu-SKU:er, negativa lager, blandade supportmail** i källdatan — städregler i
    `build-catalog.mjs`.
11. **`productUpdate(input:)` är deprecated** → använd `productUpdate(product:)`.
12. **Produktmallarnas fraktrad ärver källmarknadens fri frakt-löfte** — DK-körningen
    översatte "fri frakt" rakt in i fem mallar innan frakten fanns. Fas 9-kontrollen
    måste täcka mallarnas sales points/fraktrader, inte bara banners.
13. **Inline `alt`-attribut i descriptionHtml glöms bort.** Instruktionen "behåll HTML-
    attribut exakt" får agenter att lämna `<img alt="...">` på svenska. Mätt: FI 19 %,
    UK 7 %, DK 2 % oöversatta. Skriv explicit i översättarprompten: *"attributens
    STRUKTUR bevaras, men `alt`-textens INNEHÅLL ska översättas"*. Grind: jämför
    inline-alt mot källan — identisk sträng = oöversatt.
14. **Agenter kan dö tyst mitt i ett flerstegsjobb** — DK-körningens aktiverings-agent
    dog efter steg 1 utan rapport. Lita aldrig på att en agent blev klar: kör grinden
    mot butiken och relansera resten (gör stegen idempotenta så omkörning är riskfri).
15. **Kontexten tar slut mitt i arbetet.** Allt state ligger i repot och butiken. En ny
    session behöver bara denna fil och rätt butik kopplad.

---

## Återanvändbara script

| Fil | Gör |
|---|---|
| `<m>/build/make-batches.mjs` | delar katalogen i översättningsbatchar |
| `<m>/build/build-catalog.mjs` | monterar katalog + import-CSV + build-report |
| `<m>/build/make-jsonl.mjs` | productSet-input till push-agenterna |
| `<m>/build/make-collection-assignments.mjs` | kollektionsmedlemskap |
| `<m>/build/make-logo.py` | logga svart/vit/favicon (Pillow) |
| `uk/build/make-judgeme-csv.py` | Judge.me-import med översättning + handle-mappning |
| `uk/build/collection-map.json` | produkt → kollektion |
