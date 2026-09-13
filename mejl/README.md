# Bäverbutikens mejl — kundnotiser + "köp igen → gratisprodukt"

Bäverbutikens åtta kundmejl (orderbekräftelse, leverans, återbetalning …) i
butikens stil, med erbjudandet **den som handlat en gång får välja en
gratisprodukt vid nästa köp**, följt av **en till av det kunden köpte + tre
produkter som passar ihop med det** (vägen till 299 kr). Byggt 2026-09-12 på
Axels uppdrag ("fixa upsell på mejlet"), omgjort 2026-09-13 efter hans
feedback (se "v3" nedan).

Noll beroenden. Kör från repo-roten:

```bash
npm run mejl                    # = node mejl/bygg.mjs — hämtar produkter ur Shopify, bygger allt
node mejl/bygg.mjs --offline    # bygger på förra körningens mejl/produkter.json
node mejl/kollektion.mjs        # skapar/synkar kollektionen "Din gratisprodukt" (idempotent)
node --test mejl/test/*.test.mjs
```

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
| Struktur och HTML | `mejl/mallar.mjs` | huvudsessionen |
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

## Erbjudandet — så funkar mekaniken

1. Kunden lägger första ordern → Shopify räknar `number_of_orders = 1`.
2. Orderbekräftelsen (och leveransmejlen) visar koden **TACKIGEN**, de fyra
   gratisprodukterna och komplementen. Knappen går till
   `baverbutiken.se/discount/TACKIGEN?redirect=/collections/din-gratisprodukt`
   — Shopify lägger på koden i kundens varukorg och öppnar kollektionen.
3. Rabattkoden är en **Köp X få Y**: minst 299 kr i korgen (ur kollektionen
   "Alla produkter") → 1 produkt ur kollektionen "Din gratisprodukt" gratis.
   Berättigade: segmentet "Kunder som har gjort inköp minst en gång"
   (`number_of_orders >= 1`). En gång per kund. Kombineras inte med andra
   koder. **Det är inte en automatisk rabatt** — koden måste ligga på (det
   gör knappen), och i kassan kollar Shopify e-posten kunden skriver in mot
   kundregistret: ingen inloggning krävs (Shopify help, "identified when
   they check out using a valid email address or phone number", läst
   2026-09-13), men e-posten måste vara samma som vid första köpet.
4. Gratisprodukterna (Axels val kan bytas i `konfig.json`): Bäverlampa Pro
   199 kr, Bävertratt 149 kr, Kepslampa 300 lumen 169 kr, Digital
   däckdjupsmätare 169 kr. Billiga, i lager, passar butikens kunder (bil,
   garage, båt). "Värde upp till 199 kr" i mejlet följer av det dyraste.
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
  är ombyggda och **inte inklistrade än** — `konfig.json → lage.inklistrade_aldre`.
  De fem andra är oförändrade i sak.
- **Spin-the-wheel** (Axels idé 2026-09-13) är utrett, inte byggt: temat är
  Impulse 5.0.0 (Online Store 2.0) så en sektion + page-template går att
  lägga till via `write_themes`; ca 7–8 h. Största haken: koden är "1 ur
  kollektionen" — vilken som helst av de fyra blir gratis, så hjulet är
  teater, och rabatten dras först i kassan efter e-post (inte i varukorgen).
  Ett äldre skrapkort-popup finns i det opublicerade temat "Live + skrapkort
  2026-08-23" (`sections/skrapkort.liquid`) och kan återanvändas som mönster.

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
