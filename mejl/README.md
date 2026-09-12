# Bäverbutikens mejl — kundnotiser + "köp igen → gratisprodukt"

Bäverbutikens åtta kundmejl (orderbekräftelse, leverans, återbetalning …) i
butikens stil, med erbjudandet **den som handlat en gång får välja en
gratisprodukt vid nästa köp**, bredvid butikens tre dyraste produkter.
Byggt 2026-09-12 på Axels uppdrag ("fixa upsell på mejlet").

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
https://claude.ai/code/artifact/dc8ed75c-a95b-4d3d-9452-78b608fa06a4

## Hur det hänger ihop

| Del | Var | Vem |
|---|---|---|
| Erbjudandet (kod, minsta köp, gratisprodukter, hur många dyra) | `mejl/konfig.json` | ändras i filen, aldrig i mallarna |
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
   gratisprodukterna och de tre dyraste produkterna. Knappen går till
   `baverbutiken.se/discount/TACKIGEN?redirect=/collections/din-gratisprodukt`
   — Shopify lägger på koden i kundens session och öppnar kollektionen.
3. Rabattkoden är en **Köp X få Y**: minst 299 kr i korgen → 1 produkt ur
   kollektionen "Din gratisprodukt" gratis. Berättigade: segmentet
   "Kunder som har köpt minst en gång" (`number_of_orders > 0`). En gång per
   kund. Kombineras inte med andra koder.
4. Gratisprodukterna (Axels val kan bytas i `konfig.json`): Bäverlampa Pro
   199 kr, Bävertratt 149 kr, Kepslampa 300 lumen 169 kr, Digital
   däckdjupsmätare 169 kr. Billiga, i lager, passar butikens kunder (bil,
   garage, båt). "Värde upp till 199 kr" i mejlet följer av det dyraste.
5. De tre dyraste = högsta pris bland aktiva, publicerade produkter med bild
   och lager > 0 (`dyra_krav_lager`). Vill Axel styra listan: `dyra_override`
   med handles. Mätt 2026-09-12: LED Garagebelysning 14-pack 3 349 kr, LED
   Ljuslist 2 379 kr, Varningsljusramp 38" 2 299 kr.

⚠️ **Priserna i mejlet är inbakade vid bygget**, inte levande. Ändras ett
pris eller byts en gratisprodukt: kör `/mejl` igen och klistra in på nytt.

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

## Axels klick (står också på sidan)

1. Rabatter → Skapa rabatt → Köp X få Y → kod `TACKIGEN`, minst 299 kr,
   får 1 ur kollektionen "Din gratisprodukt" gratis, segment "Kunder som har
   köpt minst en gång", en användning per kund → Spara.
2. Inställningar → Notiser → Kundnotiser → (mallen) → Redigera kod → byt
   ämnesrad + hela HTML-rutan → Spara. Åtta gånger.
3. Skicka testmejl på Orderbekräftelse och kolla att koden och knappen funkar.
4. claude.ai → Inställningar → Connectors → Shopify → Anslut igen.

## Lärdomar

- Den gamla orderbekräftelsen (testmejl #9999, 2026-08-25) låg bara i
  Shopify — ingen källa i repot. Den är återskapad här ur det renderade
  mejlet, med samma struktur (tidslinje, order, grundarhälsning, FAQ) och
  nyhetsbrevsblocket utbytt mot erbjudandet. Nu ligger källan i repot.
- Shopifys money-filter följer butikens format ("299 kr"). Skriv aldrig
  egna kronor i Liquid-läget — bara `| money`.
- `{{ line | img_url: 'compact_cropped' }}` ger 160 px-bilder som funkar i
  alla mejlklienter; `featuredImage.url` ur API:t är fullstor och används
  bara för erbjudandets produkter (fasta `width`/`height` i taggen).
