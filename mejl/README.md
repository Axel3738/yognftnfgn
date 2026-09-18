# Bäverbutikens mejl — kundnotiser + "köp igen → gratisprodukt"

Bäverbutikens åtta kundmejl (orderbekräftelse, leverans, återbetalning …) i
butikens stil **plus lyckohjulet på sajten**. Den som handlat en gång får
snurra ett hjul på https://baverbutiken.se/pages/din-gratisprodukt och vinna
en av tio produkter, som blir gratis vid nästa köp på minst 299 kr. Under
hjulet: **en till av det kunden köpte + tre som passar ihop med det**
(vägen till 299 kr). Byggt 2026-09-12 på Axels uppdrag ("fixa upsell på
mejlet"), omgjort 2026-09-13 två gånger efter hans feedback — först
komplement i stället för dyraste produkter (v3), sedan hjulet (v4).

Noll beroenden. Kör från repo-roten:

```bash
npm run mejl                        # = node mejl/bygg.mjs — hämtar produkter ur Shopify, bygger mejlen
node mejl/bygg.mjs --offline        # bygger på förra körningens mejl/produkter.json
node mejl/kollektion.mjs            # synkar kollektionen "Din gratisprodukt" = hjulets tio vinster
node mejl/hjul-publicera.mjs        # bygger OCH publicerar hjulsidan, med trippelkoll mot kundens vy
node mejl/hjul-publicera.mjs --offline   # bara filerna, inget till Shopify
node --test mejl/test/*.test.mjs
```

⚠️ **Kör alltid `kollektion.mjs` när vinstlistan ändras.** Hjulet kan bara
ge bort det rabattkoden täcker: kollektionen "Din gratisprodukt" är
rabattens Y-sida. Står en vinst inte i kollektionen blir den inte gratis i
kassan, och hjulets löfte blir falskt.

Kommandot för Axel: **`/mejl`** (`.claude/commands/mejl.md`) — bygger,
publicerar sidan och ger honom klickschemat.

**Sidan** (publicera alltid om mot samma URL med `url`-parametern):
https://claude.ai/code/artifact/0f835351-629b-4763-a4d5-31868d9ddf52
— publicerad 2026-09-13 från kontot `claude5@stonebite.org`. ⚠️ Den
första sidan, https://claude.ai/code/artifact/dc8ed75c-a95b-4d3d-9452-78b608fa06a4
(2026-09-12), ligger på Axels andra Claude-konto och går inte att
uppdatera härifrån (mätt 2026-09-13: "artifact not found" vid läsning,
finns inte i kontots lista). Använd länken ovan; den gamla visar v2.

## Hur det hänger ihop

| Del | Var | Vem |
|---|---|---|
| Erbjudandet (kod, minsta köp, gratisprodukter, 7 dagar, 18 timmar) | `mejl/konfig.json` | ändras i filen, aldrig i mallarna |
| Komplementkartan (vad som visas bredvid "en till") | `mejl/konfig.json → komplement` | kurerad för hand, se nedan |
| All kundtext | `mejl/copy.json` | Sonnet-subagent enligt `docs/copy-regler.md` (CLAUDE.md regel 6) |
| Struktur och HTML i mejlen | `mejl/mallar.mjs` | huvudsessionen |
| Hjulsidan (HTML, CSS, JS) | `mejl/hjul.mjs` | huvudsessionen |
| Publicering av hjulsidan | `mejl/hjul-publicera.mjs` | skriptet, med trippelkoll |
| Produkter, priser, bilder, länkar | Shopify via `mejl/shopify.mjs` | hämtas vid varje bygge |
| Kollektionen `/collections/din-gratisprodukt` | Shopify | `mejl/kollektion.mjs` |
| **Rabattkoden `TACKIGEN`** | Shopify admin → Rabatter | **Axel för hand** (se nedan) |
| **Mallarna i Shopify** | Inställningar → Notiser | **Axel klistrar in** (se nedan) |
| Sidan han klistrar från | `mejl/output/index.html` → Artifact | `/mejl` publicerar |

Varje mall byggs i två lägen ur samma kod: `liquid` (det som klistras in i
Shopify) och `exempel` (samma mejl med exempeldata, för att titta på). Därför
kan förhandsvisningen aldrig visa något annat än det som skickas.

### Mallarna

| Fil | Notis i Shopify | Erbjudandet med? |
|---|---|---|
| `orderbekraftelse` | Orderbekräftelse / Order confirmation | ✅ |
| `fraktbekraftelse` | Leveransbekräftelse / Shipping confirmation | ✅ |
| `fraktuppdatering` | Leveransuppdatering / Shipping update | – |
| `ute_for_leverans` | Ute för leverans / Out for delivery | – |
| `levererad` | Levererad / Delivered | ✅ |
| `overgiven_kassa` | Övergiven kassa / Abandoned checkout | – (ingen kund än) |
| `aterbetalning` | Återbetalning / Refund notification | – |
| `avbruten_order` | Order annullerad / Order cancelled | – |

Ämnesraden är ett eget fält i Shopify och ligger i `<mall>.amne.txt`.

## Lyckohjulet (v4, Axels beslut 2026-09-13)

**https://baverbutiken.se/pages/din-gratisprodukt** — publicerad 2026-09-13,
sid-id `gid://shopify/Page/728819564893`, mall `page.full-width`.

Axel ville ha exklusivitetskänslan: "som en goodie bag", inte en kupong.
Därför snurr i stället för en lista att välja ur. Flödet:

1. Mejlets knapp går till hjulet, med `?produkt=<handle på det kunden köpte>`.
   **Ingen rabattkod i länken** — `/discount/…?redirect=` med en egen
   frågesträng inuti redirect är odokumenterat, och hjulets kassaknapp
   lägger på koden ändå.
2. Kunden snurrar. Vinnaren lottas i webbläsaren bland vinster som är i
   lager (`crypto.getRandomValues`), hjulet roterar dit och stannar.
3. Vinsten sparas i `localStorage` (`bb_gratishjul`) — kommer kunden
   tillbaka visas samma vinst, inget nytt snurr. Det är **per webbläsare**,
   inte per kund: inkognito ger ett nytt snurr. Den riktiga spärren är
   rabattkoden, som bara går en gång per kund.
4. "Lägg i korgen" kör `/cart/add.js` med line item-property `_gratishjul`,
   så vinsten går att se på orderraden i admin utan app.
5. Under vinsten: "En till" av produkten ur `?produkt=` plus tre komplement
   ur samma karta som mejlet. Okänd produkt ⇒ storsäljarna.
6. Korgstatus läses ur `/cart.js` och räknar **exklusive vinsten**: "du har
   X i korgen, Y kvar". "Till kassan" går till
   `/discount/TACKIGEN?redirect=%2Fcheckout`.

### Det här är hjulet inte

- ⚠️ **Hjulet är upplevelse, inte kontroll.** Rabatten är "1 ur kollektionen
  Din gratisprodukt", så vilken som helst av de tio blir gratis i kassan.
  Kunden kan byta ut vinsten. Ekonomisk exponering: max 279 kr per order,
  samma som dyraste vinsten. Vill Axel ha bindande vinst krävs tio
  produktspecifika koder, och då måste mejlen bära rätt kod per kund.
- ⚠️ **Rabatten syns först i kassan**, efter att kunden fyllt i sin e-post
  (segmentet `number_of_orders >= 1`). I varukorgen står vinsten kvar till
  fullt pris. Sidan säger det rakt ut — lova aldrig "0 kr i varukorgen".
- ⚠️ **Bara produkter med EN variant kan ligga på hjulet.** Kunden ska
  slippa välja storlek på något hen inte bett om. `hjul-publicera.mjs`
  stoppar körningen om en vinst har flera varianter. Bävertratten (5
  varianter) åkte ut av det skälet.

### Sidan är en Shopify-sida, inte en temafil

Allt ligger inline i sidkroppen: HTML, `<style>` avgränsad till `#bb-hjul`,
och `<script>`. Shopify strippar inte script ur sidkroppen (verifierat mot
den publika sidan 2026-09-13). Fördelen är att sidan överlever temabyten och
GemPages. Priset är att Liquid **inte** renderas i `page.content`, så
produkterna bakas in vid bygget och uppdateras levande i webbläsaren ur
`/collections/din-gratisprodukt/products.json`.

Sidkroppen är 53 kB. Kartan och katalogen komprimeras precis som i mejlen:
katalogen är en array, kartan pekar med index, bildernas CDN-prefix skrivs
en gång. Utan det blev sidan 90 kB.

⚠️ **Öppna aldrig sidan i Shopifys WYSIWYG-redigerare och spara.** Den kan
omforma HTML och bryta skriptet. Ändringar görs i `mejl/hjul.mjs` och
publiceras om med `node mejl/hjul-publicera.mjs`.

## Erbjudandet — så funkar mekaniken

1. Kunden lägger första ordern → Shopify räknar `number_of_orders = 1`.
2. Orderbekräftelsen (och leveransmejlen) visar koden **TACKIGEN**, hjulets
   tio vinster som en bildrad och komplementen. Knappen går till
   `baverbutiken.se/pages/din-gratisprodukt?produkt=<det kunden köpte>`.
3. Rabattkoden är en **Köp X få Y**: minst 299 kr i korgen (ur kollektionen
   "Alla produkter") → 1 produkt ur kollektionen "Din gratisprodukt" gratis.
   Berättigade: segmentet "Kunder som har gjort inköp minst en gång"
   (`number_of_orders >= 1`). En gång per kund. Kombineras inte med andra
   koder. **Det är inte en automatisk rabatt** — koden måste ligga på (det
   gör knappen), och i kassan kollar Shopify e-posten kunden skriver in mot
   kundregistret: ingen inloggning krävs (Shopify help, "identified when
   they check out using a valid email address or phone number", läst
   2026-09-13), men e-posten måste vara samma som vid första köpet.
4. Vinsterna på hjulet (`konfig.json → erbjudande.gratisprodukter`, tio
   stycken 169–279 kr): Bäverlampa Pro, Kepslampa 300 lumen, Digital
   däckdjupsmätare, Nano Coating Vax, Solcellslampa COB, Fickkedjesåg,
   Magnetfiskesats, Hopfällbar såg, 3D Snickarvinkel, Nödregnjacka. Alla
   med en variant, i lager, breda i tilltal (bil, garage, båt, friluft).
   "Värde upp till 279 kr" i mejlet följer av det dyraste. Storsäljarna är
   medvetet **inte** med — de är det kunden ska köpa för att nå 299 kr.
5. **Komplementen (v3, 2026-09-13):** under gratisprodukterna fyra kort —
   "En till" av produkten kunden köpte (Liquid: `line | img_url`,
   `line.title`, `line.price`) + tre ur kartan `konfig.json → komplement`.
   Kartan slås upp på `line.product.handle` (reserv: `line.product.title`)
   i en `case`-sats som bakas in i mallen, eftersom notis-Liquid inte når
   butikens produkter (`all_products`/`collections` finns inte där, mätt
   mot docs + forum 2026-09-13). Okänd produkt ⇒ storsäljarna under
   rubriken "Populärast just nu". Kartan är kurerad för hand: co-purchase-
   datan är för tunn (2 686 ordrar 16/7–13/9, 96 % med en enda produkt,
   enda starka paret axelbälte ↔ ståltrådsborsthuvuden med 25 ordrar).
   Ordning: `per_handle` → första kollektion i `per_kollektion` → `fallback`.
   Gratisprodukter, produkter utan bild och slutsålda (lagerpolicy DENY)
   visas aldrig. De tre dyraste produkterna (v2) är borta — Axel 2026-09-13:
   "inte attraktiva, liten TAM".
6. **7 dagar, räknat från orderdagen** (`giltig_dagar`, Axels beslut
   2026-09-13, var 30). Liquid utgår från `created_at`, så orderbekräftelsen,
   fraktmejlet och leveransmejlet visar samma sista dag. Före v3 räknades
   det från `'now'` = utskickstiden, så varje senare mejl sköt fram datumet.
   Har dagen passerat när ett mejl skickas döljs den röda raden.
7. **Samma paket inom 18 timmar** (`samma_paket_timmar`, Axels idé
   2026-09-13): raden "Beställ före kl HH:MM den D månad så skickas allt i
   ett paket, inte två" räknas ur ordertiden och döljs när tiden gått. ⚠️
   Löftet är logistik: lagret måste faktiskt slå ihop två ordrar. Sätt 0 för
   att ta bort raden.

⚠️ **Priserna i mejlet är inbakade vid bygget**, inte levande. Ändras ett
pris eller byts en gratisprodukt: kör `/mejl` igen och klistra in på nytt.

⚠️ **Mallarna med erbjudandet är ~80–90 kB** (kartan + katalogen). Shopifys
gräns för notismallar är inte dokumenterad; `bygg.mjs` stoppar över 100 kB.
Går inklistringen inte att spara: krymp `per_handle` i konfigen.

⚠️ **Inte verifierat mot en riktig Shopify-rendering ännu** (2026-09-13):
att `line.product.handle` finns i notis-Liquid (används i riktiga mallar på
GitHub, men `line.product.type` är testat tomt av en handlare aug 2026 —
därför titeln som reserv), och i vilken tidszon `date: '%H:%M'` skriver
klockslaget. Båda syns i testmejlet: rätt komplement för testorderns produkt
= handle funkar; "Populärast just nu" = det gjorde det inte. Klockslaget ska
vara ordertiden + 18 h svensk tid.

## Varför två steg är manuella

- **Shopify har inget API för notismallarna.** Inte i Admin GraphQL, inte i
  REST. Enda vägen är Inställningar → Notiser → Redigera kod. Därför slutar
  kedjan i en sida med kopiera-knappar i stället för ett API-anrop.
- **Rabattkoden kräver `write_discounts`**, och appen "Bäver uppladdare"
  (client credentials, `SHOPIFY_CLIENT_ID_SE`) har bara produkter, lager och
  publiceringar (mätt 2026-09-12). Shopify-MCP:n i sessionen hade dessutom
  gått ut ("requires re-authorization"). Två vägar framåt, båda Axels klick:
  koppla om Shopify-connectorn på claude.ai (då kan nästa session skapa
  rabatten själv), eller ge appen Discounts-behörighet i Shopify admin →
  Appar → Utveckla appar → Bäver uppladdare → Konfiguration.

## De andra kundnotiserna (Shopifys egna)

Shopify har ett tjugotal kundnotiser i sektioner: Orderhantering,
Orderundantag (Order ändrad, Orderfaktura, Order återbetalad, Order
annullerad), Betalningar, Returer, Frakt, **Lokal leverans**, **Lokal
upphämtning**, Kundkonton. Vi har egna mallar för åtta. Resten är Shopifys
standardmallar och ser ut därefter.

**Fixet är inte att bygga tjugo mallar till.** Under Inställningar →
Notiser → Kundnotiser finns **Anpassa e-postmall**, som sätter logga och
accentfärg på **alla** standardmallar på en gång (docs:
help.shopify.com/en/manual/fulfillment/setup/notifications/customizing-notification-template,
läst 2026-09-13). Våra åtta bär egen HTML och påverkas inte. Datumet bokförs
i `konfig.json → lage.mallbranding`; sidan säger att det återstår tills dess.

⚠️ **Lokal leverans och lokal upphämtning kan inte skickas i den här
butiken** (mätt 2026-09-13): alla 2 719 ordrar har fraktsättet "Fri Frakt",
och appen saknar `read_shipping` så fraktprofilerna går inte att läsa —
ordrarna är beviset. De tre mejlen under Lokal leverans syns i admin men går
aldrig ut. Bygg inga egna mallar för dem.

⚠️ **Kontomejlen kan däremot skickas:** 159 av 2 000 slumpade kunder har
`state: ENABLED`, alltså ett riktigt kundkonto. Presentkortsprodukterna är
båda `DRAFT`, så presentkortsmejlet är vilande tills någon utfärdar ett för
hand.

Vill Axel ha full husstil på fler än åtta: bygg dem i omgångar, sorterade
efter hur ofta de faktiskt skickas, och räkna en inklistring per mall.
**Hela listan i Bäverbutikens admin**, avskriven av Cowork 2026-09-13
(sidan heter **Kundaviseringar**, inte Kundnotiser; listan finns inte i
något API). Våra åtta i fetstil.

- Orderhantering: **Orderbekräftelse**, Faktura för orderutkast, **Leveransbekräftelse**
- Lokal upphämtning: Klar för lokal upphämtning, Upphämtad av kund
- Lokal leverans (alla på, kan inte skickas): Order ute för lokal leverans, Order lokalt levererad, Missad lokal leverans av order
- Presentkort: Nytt presentkort, Presentkortskvitto
- Värdecheck: Värdecheck utfärdad
- Orderundantag: Orderfaktura, Order redigerad, **Order annullerad**, Betalningskvitto för order, **Orderåterbetalning**, Orderlänk
- Betalningar: Betalningsfel, Fel med väntande betalning, Väntande betalning lyckades, Betalningspåminnelse
- Kassasystem: Övergiven betalning i kassasystemet, E-post från kassasystem till kund, Kvitto från kassasystem och mobil, Byteskvitto från kassasystem, Returkvitto
- Leveransuppdateringar: **Leveransuppdatering**, **Ute för leverans**, **Levererad**
- Returer och annulleringar: Retur skapad, Retursedel skapad på ordernivå, Returförfrågan godkänd, Returförfrågan avvisad, Förfrågan mottagen, Annulleringsförfrågan nekad
- Konton och kundkampanjer: Inbjudan till kundkonto, Välkomstmeddelande för kundkonto, Återställning av lösenord för kundkonto, tre om betalningsmetod, två om B2B, Kontakta kund, Bekräftelse på ändring av kunds e-postadress
- Dubbel bekräftelse för marknadsföring: Bekräftelse för marknadsföring till kund
- Shopify Messaging (installerad — **Övergiven kassa** ligger där, inte under aviseringarna)
- Återmarknadsföring med Shop: Påminnelse om varukorg, Åter i lager, Prissänkning, Avbrutet surfande

Logga och accentfärg på alla standardmallar sattes 2026-09-13 via
**Anpassa e-postmallar** (`konfig.json → lage.mallbranding_gjort`).

### Fallgropar i Shopifys notissystem (docs-läsning 2026-09-13)

- ⚠️ **Övergiven kassa: opta ALDRIG in i den nya automationen.** Shopify:
  "Activating the new abandoned checkout automation is a permanent change.
  You can't change back." Den nya bygger man i Shopify Emails dra-och-släpp,
  inte i Liquid — vår mall dör i samma sekund och går inte att få tillbaka.
  Butiken ser redan ut att vara flyttad (mallen finns inte under Notiser,
  mätt 2026-09-12), så `overgiven_kassa.liquid` är troligen redan vilande.
- **"Återställ till standard" raderar hela brödtexten** men rör inte logga
  och accentfärg. Det finns ingen ångra utöver "Föregående version".
- **Shopify kräver ibland handpatchar i anpassade mallar.** Hela
  `/manual/taxes/shopify-tax/notifications/`-serien finns för att
  "Not all customized templates can be updated automatically" — nio mallar
  behövde ändras för hand vid en skatteomläggning. En egen mall missar
  sådana fixar tyst.
- **`pickup_instructions` överskriver mallen** om upphämtning någonsin slås
  på: "This field replaces any customizations that you have in the
  `email_body` variable in the Ready for pickup notification template."
- **SMS-notiserna går inte att redigera alls**, och där krävs `order.`-
  prefixet som notismallarna förbjuder.
- **Shop-appens notiser kan varken stängas av eller ändras** av butiken.
- Shopifys stödda klienter inkluderar Outlook 2007 ⇒ tabeller och inline-
  stilar, aldrig flexbox eller grid. Redigeraren inlinear `<style>` i
  `<head>` automatiskt och behåller media queries.

### Mallens storlek är inte mejlets storlek

Källan är 87 kB för orderbekräftelsen, men det är **Liquid**: case-satsen
med komplementkartan renderas bort vid utskick. Det färdiga mejlet är
25 kB (mätt 2026-09-13 på `output/forhandsvisning/orderbekraftelse.html`,
som byggs ur samma kod). Gmail klipper vid ~102 kB, så marginalen är stor.
Shopify dokumenterar **ingen** storleksgräns för notismallar.

## Leveranstiden (v6, Axels beslut 2026-09-18: "fixa det")

Mätt 2026-09-17: alla 22 senaste leveranser gick med YunExpress/4PX från
lagret utomlands, ingen från svenskt lager, och **inga leveransevent kommer
tillbaka** — 0 av 500 ordrar sedan 15 juni har `inTransitAt` eller
`deliveredAt`. Därför går "Ute för leverans" och "Levererad" aldrig ut, och
fraktmejlet går inom två timmar från ordern medan paketet tar veckor. I den
tystnaden föds klagomålen.

Beslut: lova **7–14 dagar** (`konfig.frakt.leverans_dagar_min/max`) och
räkna datumet i mejlet i stället för att läsa det från fraktbolaget:

- `leveransLiquid()` i `mallar.mjs` sätter `lev_fran_datum`–`lev_till_datum`
  ur `'now'` vid utskick. Fraktmejlet räknar från skickdagen; orderbekräftelsen
  lägger på packtiden (`packas_dagar`) först.
- Fraktmejlet har rutan **Beräknad leverans** med datumspannet och raden om
  de tysta dagarna (spårningen står still 2–4 dagar tills paketet checkats
  in på flyget). Orderbekräftelsens tidslinje och FAQ säger samma sak.
- Copyn skriven av en Sonnet-subagent 2026-09-18 enligt copy-reglerna,
  tre-frågorstestet redovisat i körningen. Det gamla löftet ("1–2 arbetsdagar
  från svenskt lager, 5–10 från utländskt") är borta ur alla mallar — testet
  faller om det kommer tillbaka.

**Kvar:** de tidsstyrda mejlen mellan "på väg" och framme (dag 3, 7, 12) och
recensionsmejlet. De kräver en avsändare som går på klocka — Shopify Flow +
Shopify Email i admin (klick, ingen API), eller en egen rutin med en
mejltjänst över HTTPS (IMAP/SMTP går inte från claude.ai). Inte byggt.

**Inklistring 2026-09-18 (Cowork, två körningar):** alla tre
erbjudandemallarna har v6, verifierade efter omladdning och identiska med
källfilerna; testmejlet skickat från Orderbekräftelse. Andra körningen:
urklippet gav 139 tecken från en annan app på mall 3, och Cmd+A slutade
fungera i källfliken — Cowork hämtade då filen direkt i Shopify-sidan och
jämförde tecken för tecken. Metoden står nu i prompten som reserv. Lärdom: teckenantalen i prompten var byte (`wc -c`), inte tecken —
Shopifys redigerare räknar tecken, så 85 293 byte är 84 152 tecken. Prompten
anger nu tecken och kollar per mall vad som redan sitter.

## Mäta om det gör något

```bash
node mejl/matning.mjs                 # sedan koden skapades
node mejl/matning.mjs --fran 2026-09-14
```

Läs-bara mot Shopify. Skriver `mejl/matning.json` och skriver ut fyra tal,
från hårdast till mjukast:

1. **Ordrar med koden** — kunden fick gåvan. Det enda som bevisar köp.
2. **Ordrar via hjulet** — orderraden bär egenskapen `_gratishjul`, satt av
   hjulsidan när vinsten läggs i korgen. Fångar köp där koden föll bort.
3. **Ordrar som kom från mejlet** — Shopify sparar kundresan per order:
   landningssida + UTM. Mejlens länkar bär `utm_source=mejl`,
   `utm_medium=<mall>`, `utm_campaign=tackigen` sedan 2026-09-17, så talet
   går att dela per mall. Klick utan köp syns i admin: Analys → Rapporter →
   "Sessioner efter UTM-kampanj" (kampanj `tackigen`).
4. **Återköp per månad** — grundlinjen. Andel av månadens ordrar från någon
   som handlat förut (per e-post, sedan årsskiftet). Stiger den efter
   launch gör erbjudandet jobbet.

Nämnaren är antalet ordrar sedan startdatumet — varje order ger en
orderbekräftelse med erbjudandet. **Öppningar, klick utan köp och antal
snurr går inte att mäta härifrån:** Shopifys notiser saknar spårning och
hjulet har ingen server att rapportera till. Klicken finns bara i
Shopify-admins UTM-rapport.

Första mätningen 2026-09-17 (koden skapad 12/9, hjulmejlet uppe sedan
14/9): 434 ordrar sedan start, **0 med koden, 0 via hjulet, 0 från mejlet.**
Mätningen är inte blind — 80 av de 100 senaste ordrarna bär en kundresa
(Facebook, Instagram, Google). Grundlinjen för återköp: juli 2 %, augusti
2 %, september 3,5 % (38 av 1 093). Med 7 dagars giltighet och den takten
väntas under en återköpsorder per dygn totalt, så nollan efter tre dagar
säger "för tidigt", inte "trasigt". Nästa avläsning: efter 21/9, när första
batchens fönster stängt.

## Hela kedjan som testmejl

⚠️ **Knappen "Följ din order" ger 404 i testmejl** ("The checkout page
you're looking for does not exist", Axel 2026-09-18). Den går till
`{{ order_status_url }}`, Shopifys egen orderstatussida — samma länk som
Shopifys standardmall använder. Testmejlets order är påhittad och har ingen
kassa, därför finns sidan inte. För riktiga ordrar finns den (tre färska
ordrar har `statusPageUrl` via API 2026-09-18; sidan går inte att hämta från
containern, Shopify svarar 400/406/429 på allt som inte är en riktig
webbläsare). Verifiera i admin: öppna en order → "Visa orderstatussida".

`mejl/COWORK-TESTMEJL.md` är prompten som får Cowork att skicka testmejl på
alla sju mallarna i kundens ordning (Axels önskan 2026-09-18: se allt på
telefonen). Sökord i Gmail som hittar alla: `kundsupport@baverbutiken.se`
(adressen står i varje malls sidfot). Övergiven kassa ingår inte — den
ligger inte under Notiser.

## Inklistringen via Cowork

`mejl/COWORK-PROMPT.md` är den färdiga prompten till Cowork (Claude i
Chrome) för steg 2 nedan: den hämtar mallarna som råtext från GitHub (repot
är publikt), klistrar in dem i admin och verifierar efter omladdning.
Kopiera allt under linjen i den filen. ⚠️ Länkarna i prompten pekar på en
gren — byt till `main` när grenen mergats, och uppdatera tecknantalen om
mallarna byggts om.

## Axels klick (står också på sidan)

1. Rabatter → Skapa rabatt → Köp X få Y → kod `TACKIGEN`, minst 299 kr,
   får 1 ur kollektionen "Din gratisprodukt" gratis, segment "Kunder som har
   köpt minst en gång", en användning per kund → Spara.
2. Inställningar → Notiser → Kundnotiser → (mallen) → Redigera kod → byt
   ämnesrad + hela HTML-rutan → Spara. Åtta gånger.
3. Skicka testmejl på Orderbekräftelse och kolla att koden och knappen funkar.
4. claude.ai → Inställningar → Connectors → Shopify → Anslut igen.

## Läget i Shopify (2026-09-12)

Gjort av Cowork (Claude i Chrome) i Axels inloggade admin, kvällen 2026-09-12,
bokfört i `konfig.json → lage`:

- Rabattkoden **TACKIGEN** skapad och aktiv. Shopify tillåter inte "Alla
  produkter" som köpvillkor i Köp X få Y — en automatisk kollektion **Alla
  produkter** (pris > 0, 213 produkter) skapades och används som villkor.
- 7 av 8 mallar inklistrade och verifierade efter omladdning. **Övergiven
  kassa** finns inte under Notiser i butiken (Shopify Email sköter den).
- Testmejl skickat på Orderbekräftelse.
- Nya appen **"bäver email"** verifierad 2026-09-12 sent på kvällen med
  `node mejl/nyckelkoll.mjs`: 16 behörigheter, rabatter/ordrar/kunder/sidor/
  teman/filer alla ✅ (`mejl/NYCKELKOLL.md`). Rabattkoden TACKIGEN läst via
  API:t: ACTIVE, en gång per kund, segment `number_of_orders >= 1`, köp
  ≥ 299 kr ur "Alla produkter" → 1 ur "Din gratisprodukt" gratis, 0 användningar.
- Kvar: ett riktigt köptest med koden. Shopify-connectorn på claude.ai är
  numera valfri — nyckeln räcker för allt skripten behöver.
- **2026-09-13 (v3):** rabatten läst via API: ACTIVE, inget slutdatum,
  0 användningar, en gång per kund, segment `number_of_orders >= 1`. Butiken
  har kundkonton som valfria (`NEW_CUSTOMER_ACCOUNTS`, inloggning krävs inte
  i kassan). De tre erbjudandemallarna (orderbekräftelse, frakt, levererad)
  är ombyggda **och inklistrade av Cowork samma dag**, verifierade efter
  omladdning: alla fyra kontrollsträngarna på plats, teckenantal 85 596 /
  78 808 / 78 012 (ett mindre än källan — Shopifys redigerare tar inte med
  filens avslutande radbrytning). Ämnesraderna stod redan rätt. De fem andra
  mallarna är oförändrade i sak.
  ⚠️ **Testmejlet på v3 är inte skickat** — Cowork tappade Chrome-kopplingen
  precis innan klicket. Det är det enda som visar om
  `line.product.handle` finns i notis-Liquid och vilken tidszon
  `date: '%H:%M'` skriver klockslaget i.
- **Spin-the-wheel** (Axels idé 2026-09-13) är utrett, inte byggt: temat är
  Impulse 5.0.0 (Online Store 2.0) så en sektion + page-template går att
  lägga till via `write_themes`; ca 7–8 h. Största haken: koden är "1 ur
  kollektionen" — vilken som helst av de fyra blir gratis, så hjulet är
  teater, och rabatten dras först i kassan efter e-post (inte i varukorgen).
  Ett äldre skrapkort-popup finns i det opublicerade temat "Live + skrapkort
  2026-08-23" (`sections/skrapkort.liquid`) och kan återanvändas som mönster.
- **2026-09-14 (v5), byggd ur Gmail-PDF:en av v4-testmejlet.** Fyra fel
  rättade i `mallar.mjs`: (1) rubriken över komplementen skrevs i Liquid
  *innan* `komp_okand` räknats, så kunden såg fallback-rubriken fast
  produkterna var rätt — `samla`-blocket ligger nu före rubriken; (2) ett
  289 kr-förslag stod under "en av de här räcker till 299 kr" —
  `komplement.min_pris: "erbjudande"` filtrerar katalogen på
  `minsta_kop_sek`, och fallback-listan är bytt till sex produkter ≥ 299 kr;
  (3) klockslaget "Beställ före kl" stod en timme fel — `date: '%s'` på
  `created_at` räknar i UTC medan `'%H'` skriver butikens tid, så mallen
  mäter skillnaden själv och lägger på den (`tz_skift`); (4) mallen var inte
  mobilanpassad — `<style>` med media query ≤ 480 px (`bb-kort` två i bredd,
  `bb-vinst` tre i bredd, knappen full bredd, mindre rubrik). Teckenantal
  83 256 / 76 460 / 75 650 (efter UTM-länkarna 2026-09-17). Kollektionssidans text är omskriven till
  hjulflödet (länk till hjulet, 299 kr-regeln, "samma e-postadress") och
  uppdaterad i Shopify samma dag. **Inte inklistrad ännu** — Cowork-prompten
  är uppdaterad (kontrollsträngen är `tz_skift`; steg A är borttaget, redan
  gjort). De fem mallarna utan erbjudande fick också mobil-CSS:en i bygget
  men behöver inte klistras om — skillnaden är bara marginaler på mobil.
  **Kundklagomålet 2026-09-14** ("wants to use TACKIGEN but can't add to
  cart"): koden läst via API samma dag — ACTIVE, 0 användningar,
  kollektionen 10 köpbara produkter, `/cart/add.js` svarar 200. Koden är
  hel. Troligaste orsak: bara vinsten i korgen (kräver ≥ 299 kr annat), eller
  annan e-post än ordern. Kundens exakta ord saknas.

## Nycklarna

`mejl/shopify.mjs` mintar en token via client credentials. Två appar kan
finnas i Environments samtidigt:

| Variabel | App | Behörigheter |
|---|---|---|
| `SHOPIFY_CLIENT_ID_SE_BAVER_SE` + `SHOPIFY_CLIENT_SECRET_SE_BAVER_SE` | "bäver email", skapad av Axel 2026-09-12, 16 behörigheter (grön i `nyckelkoll` 2026-09-13) | produkter, lager, publiceringar, rabatter, ordrar (läs), kunder (läs), sidor, teman, filer |
| `SHOPIFY_CLIENT_ID_SE` + `SHOPIFY_CLIENT_SECRET_SE` | "Bäver uppladdare" (gammal) | bara produkter, lager, publiceringar |

Nya namnet vinner när det finns. `SHOPIFY_SHOP_SE` är butiken för båda.
Testa vilken som gäller: `node mejl/nyckelkoll.mjs`.

## Lärdomar

- **Enkla citattecken i Liquid-filter.** Texten HTML-eskapas på väg in i
  mallen, så `default: "x"` blev `default: &quot;x&quot;` i fyra mallar och
  fick rättas för hand vid inklistringen 2026-09-12. Nu `'x'` + ett test
  som letar `&quot;` inuti `{{ }}`/`{% %}`.
- **Cowork kan inte klicka inuti Artifact-sidans ram** (sandlådad iframe).
  Bockarna "Inklistrad" sätts därför ur `konfig.json → lage.inklistrade`
  vid bygget — den som klistrar in skriver datumet där, inte på sidan.
- **Axels dator är en Mac: Ctrl+A/C/V är Shopify-kortkommandon där.** De
  öppnade dialogerna "Lägg till produktserie" och "Lägg till sida" mitt i
  inklistringen 2026-09-13. Prompten säger Cmd sedan dess.
- **Urklippet är inte att lita på vid många inklistringar i rad.** Två av
  tre mallar fick fel innehåll i urklippet 2026-09-13 (förra mallen, och en
  gång ett telefonnummer från en annan app). Kontrollen "rätt teckenantal
  och rätt textbitar FÖRE sparning" fångade båda — den ska aldrig strykas
  ur prompten.
- **Shopifys redigerare visar ett tecken mindre än källfilen.** Filens
  avslutande radbrytning följer inte med. Ett tecken = rätt, mer = fel.

- Den gamla orderbekräftelsen (testmejl #9999, 2026-08-25) låg bara i
  Shopify — ingen källa i repot. Den är återskapad här ur det renderade
  mejlet, med samma struktur (tidslinje, order, grundarhälsning, FAQ) och
  nyhetsbrevsblocket utbytt mot erbjudandet. Nu ligger källan i repot.
- Shopifys money-filter följer butikens format ("299 kr"). Skriv aldrig
  egna kronor i Liquid-läget för orderns belopp — bara `| money`.
  Katalogens priser (komplementen) är inbakade text, som gratisprodukternas.
- **`'now'` i Liquid är utskickstiden, inte ordertiden.** Ett datum som ska
  vara samma i alla mejl om en order räknas ur `created_at`.
- **Strängar som JÄMFÖRS i Liquid får inte HTML-eskapas.** `when 'Trädgård
  &amp; Uteplats'` matchar aldrig titeln "Trädgård & Uteplats". Bara det som
  skrivs ut eskapas (`liquidStrang` vs `liquidNyckel` i `mallar.mjs`).
- **Kartan pratar i nummer.** Handles är ~50 tecken och nämns många gånger;
  med löpnummer i kartan och handeln i katalogposten gick orderbekräftelsen
  från 132 kB till 87 kB. Produkter med samma lista delar en `when`-gren.
- **Shopify-CDN:n tar `_240x240` före filändelsen** (159 kB → 26 kB per
  bild). `featuredImage.url` ur API:t är originalet.
- `{{ line | img_url: 'compact_cropped' }}` ger 160 px-bilder som funkar i
  alla mejlklienter; `featuredImage.url` ur API:t är fullstor och används
  bara för erbjudandets produkter (fasta `width`/`height` i taggen).
