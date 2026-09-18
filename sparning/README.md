# Spårning — skanningarna in i Shopify, så orderstatussidan blir vår tracker

Axels beslut 2026-09-18: bygg eget i stället för en spårningsapp, eftersom
samma lösning ska köra på fem butiker och apparna tar betalt per butik.

## Vad det gör

Varje timme:

1. Läser skickade ordrar ur Shopify (senaste 14 dagarna) och plockar
   spårningsnumren (YunExpress, 4PX, …).
2. Registrerar nya nummer hos **17TRACK** (kostar kvot, en gång per paket)
   och hämtar senaste status för de öppna.
3. Skriver statusen in i Shopify som **fulfillment-event** med svenskt
   meddelande: Bekräftad → På väg → Ute för leverans → Levererat (plus
   avvikelser). Ett event per steg, aldrig bakåt, aldrig dubbelt.

Det ger tre saker på en gång, utan egen server och utan app:

- **Shopifys orderstatussida** (den Axel såg: "det är ju som vår egen
  tracker") får en riktig tidslinje med platser i stället för bara "På väg".
  Mejlens knapp "Spåra paketet" går redan dit (v7).
- Notiserna **Ute för leverans** och **Levererad** börjar gå ut — de
  triggas av just de här eventen. Levererad-mejlet bär gåvan (TACKIGEN).
- Mätningen får leveranstider: `deliveredAt` fylls i, så
  `mejl/matning.mjs` och kundtjänstrapporten kan räkna verklig frakttid.

Varför inte fraktbolagen direkt: YunExpress svarar 405 utanför sin sajt och
4PX har stängt sitt öppna gränssnitt ("kontakta oss för openApi"), mätt
2026-09-18. 17TRACK är den enda källan som täcker båda utan avtal.

## Filer

| Fil | Vad |
|---|---|
| `kor.mjs` | Rundan. `--torr` läser utan att registrera eller skriva, `--kolla` testar bara nyckel + rättigheter, `--dagar N` fönstret bakåt (14), `--max N` tak på registreringar per körning (150, nyast först) |
| `17track.mjs` | Klienten: `/register`, `/gettrackinfo`, `/stoptrack`. Header `17token`, 40 nummer per anrop, 3 anrop/s, väntar vid 429 |
| `status.mjs` | Ren logik: bolagskoder, status → Shopify-status, svenska meddelanden, `tolka()` och `planera()` |
| `lage.json` | Minnet: registrerade nummer, senast skrivna status, leveransdatum. **Committas av rutinen** — utan filen registreras allt om och kvoten bränns |
| `test/status.test.mjs` | 8 tester utan nät |

```bash
node --test sparning/test/*.test.mjs
node sparning/kor.mjs --kolla
node sparning/kor.mjs --torr
node sparning/kor.mjs
```

## Nycklar och rättigheter

- `TRACK17_API_KEY` i Environments på claude.ai. Kontot skapades 2026-09-18
  (axel.odhner@stonebite.org, admin.17track.net), 200 gratis paket i
  startkvoten, därefter köps kvot per paket ("Buy more" i deras panel).
  ⚠️ En nyckel som läggs in på claude.ai syns först i en **ny** container.
- Shopify-appen "bäver email" (`SHOPIFY_CLIENT_ID_SE_BAVER_SE`) saknade
  `write_fulfillments` vid bygget (16 rättigheter, ingen för fulfillments).
  `fulfillmentEventCreate` kräver `read_fulfillments` + `write_fulfillments`.
  `kor.mjs --kolla` säger det i klartext tills det är löst.

## Statusmappning

| 17TRACK | Shopify | Kunden ser |
|---|---|---|
| InfoReceived | CONFIRMED | Fraktbolaget har tagit emot uppgifterna om paketet. |
| InTransit | IN_TRANSIT | Paketet är på väg (plats). |
| AvailableForPickup | READY_FOR_PICKUP | Paketet finns att hämta hos ombudet (plats). |
| OutForDelivery | OUT_FOR_DELIVERY | Paketet är ute för leverans i dag. |
| DeliveryFailure | ATTEMPTED_DELIVERY | Leverans försöktes utan att lyckas. Ett nytt försök följer. |
| Delivered | DELIVERED | Paketet är levererat (plats). |
| Exception | FAILURE | Ett problem uppstod med leveransen. Mejla kundsupport… |
| Expired, NotFound | – | inget skrivs |

Bolagskoder (17TRACK): YunExpress `190008`, 4PX `190094`, PostNord Sverige
`19241`. Okänt bolag registreras utan kod — 17TRACK gissar ur numret.

## Fler butiker

`kor.mjs` går mot den butik `mejl/shopify.mjs` läser ur miljön
(`SHOPIFY_CLIENT_ID_SE_BAVER_SE` + secret + `SHOPIFY_SHOP_SE`). För nästa
butik: en `--butik`-flagga som väljer nyckelpar och egen lagefil per butik.
Samma 17TRACK-konto och nyckel för alla — kvoten räknas per paket, inte
per butik. Inte byggt än; Bäverbutiken först.

## Rutinen

`/sparning` (`.claude/commands/sparning.md`), varje timme, fast session med
repot som källa (annars kan `lage.json` inte pushas — se CLAUDE.md om
rutiner). Byggs med `/rutin /sparning <tid>` när nyckeln syns i en ny
container och Shopify-appen fått rättigheterna. Kommandofilen måste ligga
på `main` — rutinen klonar `main`.

## Logg

- **2026-09-18:** byggd. Inte körd skarpt: nyckeln fanns inte i containern
  (ny container krävs) och appen saknar `write_fulfillments`. Testerna gröna,
  `--torr` läste ordrarna: 2 682 ordrar på 45 dagar, 2 607 paket utan
  leveransevent — därför taket 150 registreringar per körning och fönstret
  14 dagar. ⚠️ Kvoten: ~87 paket om dagen ⇒ ~2 600 i månaden. 200 gratis
  räcker två dagar; köp kvot i 17TRACK-panelen ("Buy more") innan rutinen
  slås på, annars stannar registreringen och bara redan registrerade paket
  följs.
