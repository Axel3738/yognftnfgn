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
| `kor.mjs` | Rundan. `--torr` läser utan att registrera eller skriva, `--kolla` testar bara nyckel + rättigheter, `--dagar N` fönstret bakåt (14), `--max N` tak på registreringar per körning (150, nyast först), `--ingen-sida` hoppar över spårningssidan |
| `17track.mjs` | Klienten: `/register`, `/gettrackinfo`, `/stoptrack`. Header `17token`, 40 nummer per anrop, 3 anrop/s, väntar vid 429 |
| `status.mjs` | Ren logik: bolagskoder, status → Shopify-status, svenska meddelanden, `tolka()` och `planera()` |
| `steg.mjs` | Vilket av kundens fem skeden en skanning hör till. Ordboken avgör, platsen lyfter till "i landet", och skedet backar aldrig |
| `kontroll.mjs` | **Spärren:** Axels fyra krav, mätta mot fraktbolagets rådata. Publiceringen vägrar lägga upp en sida som fallerar |
| `uppacka.mjs` | **Kontraktet:** dataformatet på spårningssidan och uppackaren. Körs både i Node och i kundens webbläsare — `sida.mjs` bäddar in filen med `export ` bortstrippat, så formatet kan aldrig tolkas olika på de två ställena |
| `sprak.mjs` + `fraser.json` | Fraktbolagens texter till svenska. 78 ordboksnycklar avlästa ur riktig data; okända fraser faller på en generell mening ur `sub_status` och loggas av rundan |
| `paketdata.mjs` | 17TRACK-svar → händelselista → det komprimerade formatet. Slår ihop dubbletter inom samma minut, tak 120 skanningar, fönster 45 dagar |
| `sida.mjs` | Kundens sida: HTML, CSS och JS i en Shopify-sidkropp. Samma mönster som lyckohjulet — inga temafiler, inga externa resurser |
| `publicera.mjs` | Sidan till Shopify. `--torr` bygger bara filerna, `--paket <fil>` läser paketen ur rundans lista i stället för ur minnet. Trippelkollen sist: API, publik vy, känt nummer i kundens data |
| `konfig.json` | Sidans handle, titel, fönster och bokförda publiceringar |
| `lage.json` | Minnet: registrerade nummer, senast skrivna status, leveransdatum. **Committas av rutinen** — utan filen registreras allt om och kvoten bränns. Bär **inga** skanningar, se nedan |
| `test/` | 115 tester utan nät, varav 14 för Axels fyra krav |

```bash
node --test sparning/test/*.test.mjs
node sparning/kor.mjs --kolla
node sparning/kor.mjs --torr
node sparning/kor.mjs
node sparning/publicera.mjs --torr   # bara sidan, ur paketminnet
```

## Sammanfattningsvyn (Axels krav 2026-09-19)

Sidan visade varje enskild logistikhändelse — terminal, land, transportstatus —
och blev rörig: ett paket har i snitt nio skanningar, som mest 29. Standardvyn
är nu **fem punkter**:

> Beställning mottagen → Paketet är på väg → Ankommit till Sverige →
> Ute för leverans → Levererat

Hela historiken finns kvar bakom **"Visa fullständig transporthistorik"**, med
ort OCH land på varje rad ("Rozenburg, Nederländerna"). Ingen skanning tas
bort, inget datum räknas om — de fem punkterna är en ren gruppering av rader
som redan finns.

**Så avgörs skedet** (`steg.mjs`), i den ordningen:
1. Har frasen ett skede i tabellen — det gäller. Alla 78 ordboksnycklar är
   klassificerade.
2. Annars: ligger skanningen i mottagarlandet är den minst "Ankommit".
3. Annars: ärv skedet från skanningen före. Skedet backar aldrig.

⚠️ **Fraktbolagets statuskod duger inte som grund.** Mätt 2026-09-19 på 1 873
skanningar: 1 507 av dem (80 %) bär `sub_status` "InTransit_Other", och
`OutForDelivery` förekom inte en enda gång. Koden kan inte skilja Shenzhen från
Umeå. Ordboken kan.

⚠️ **PostNords förhandsavisering ljuger om Sverige.** "Vi har fått en
beställning på en leverans och väntar på paketet" bär platsen SWEDEN men
skickas innan paketet lämnat Kina — 20 fall av 20. Utan undantaget i
`FORHANDSAVI` hade var fjärde paket visat "Ankommit till Sverige" dag ett.

⚠️ **"Ute för leverans" saknas oftast.** Bara 13 av 204 paket hade någon
utkörningssignal. Skedet står därför grått tills det faktiskt händer — de fem
punkterna visas alltid, så kunden ser både var paketet är och vad som återstår.

⚠️ **Tvetydiga fraser är medvetet neutrala.** Importtullen klareras i
Nederländerna och "destination airport" är Amsterdam för ett paket som ska till
Umeå. Att klassa dem som ankomst hade daterat steget dagar för tidigt, så de
lyfts bara av platsen.

## Kontrollen

```bash
node --test sparning/test/kontroll.test.mjs
```

Fyra krav, ett test per krav, körda mot **riktig rådata** ur butikens egna
paket (`test/fixturer/riktiga-paket.json`: sju paket, 78 skanningar, valda så
att varje läge finns med). `publicera.mjs` kör samma kontroll före varje
publicering och **vägrar lägga upp en sida som fallerar**.

| Krav | Vad som mäts |
|---|---|
| 1 | Varje distinkt skanning i fraktbolagets data finns i historiken |
| 2 | Varje land i rådatan går att LÄSA i historiken |
| 3 | Varje nått skede pekar på en riktig skanning, och skedena är daterade i ordning |
| 4 | "Ankommit till Sverige" kräver en fysisk skanning — förhandsavisering duger inte |

Fyra av testerna går åt andra hållet: de **manipulerar datan så att den ljuger**
och kräver att kontrollen fäller den. En kontroll som aldrig kan bli röd bevisar
ingenting.

Kontrollen har redan betalat sig. Den hittade tre fel som ingen letade efter:
tiderna avrundades uppåt så en skanning 10:14:30 blev 10:15 (578 av 1 851
rader), ihopslagningen tog bort äkta skanningar en timme isär, och
publiceringen tappade landet när den läste rundans lista (158 av 1 055 paket).

## Kundens spårningssida

**https://baverbutiken.se/pages/spara** (Axels beslut 2026-09-19, valt ur två
alternativ: "jag vet inte helst en egen spårningssida skulle jag säga alltså B").

Shopifys orderstatussida kan bara rita tre streck med datum — Bekräftad, På
väg, Levererad — utan orter och utan historik, hur mycket rutinen än skriver
in i den. Det var det Axel såg: "den visar inga detaljer". Egna sidan visar
hela kedjan: "17 sep 23:28 · Paketet är levererat i din brevlåda · Umeå",
hela vägen tillbaka till avsändaren i Kina.

- Kunden kommer från leveransmejlets knapp med `?nummer=…` och slipper skriva
  något. Utan nummer i adressen finns ett sökfält.
- **Uppslaget går på spårningsnummer, aldrig på ordernummer.** Ordernummer är
  sekventiella och lätta att gissa; då hade vem som helst kunnat skriva 6500
  och se var någon annans paket är. Datan bär bara spårningsnummer, status,
  fraktbolag, skanningstexter och orter — inga namn, inga adresser.
- Sidan är statisk. Rutinen bygger om den varje timme; den hämtar ingenting
  själv medan kunden tittar, och säger det ("nya skanningar läggs till varje
  timme").

⚠️ **Skanningarna sparas aldrig i `lage.json`.** 948 paket à ~9 skanningar
väger 0,7 MB, och filen committas varje timme — ett år hade gett 6,3 GB
git-historik (räknat 2026-09-19 på repots lagefil). Rundan har ändå redan
hämtat skanningarna, så den skriver dem till `output/paket.json`
(gitignorerad) och skickar filen till `publicera.mjs --paket`. Bygg aldrig in
dem i minnet "för att publiceringen ska kunna köras fristående".

⚠️ **Sidan bär fler paket än rundan skriver event för.** Orderfönstret är 14
dagar, men ett paket som varit på väg i tre veckor är precis det en kund vill
slå upp. Resten hämtas därför ur paketminnet (60 dagar) och läses bara —
inga event, ingen kvot. Att läsa är gratis hos 17TRACK; bara registreringen
kostar.

## Nycklar och rättigheter

- `TRACK17_API_KEY` i Environments på claude.ai. Kontot skapades 2026-09-18
  (axel.odhner@stonebite.org, admin.17track.net), 200 gratis paket i
  startkvoten, därefter köps kvot per paket ("Buy more" i deras panel).
  ⚠️ En nyckel som läggs in på claude.ai syns först i en **ny** container.
- Shopify-appen "bäver email" (`SHOPIFY_CLIENT_ID_SE_BAVER_SE`) saknade
  `write_fulfillments` vid bygget (16 rättigheter). Axel lade till
  `read_fulfillments` + `write_fulfillments` 2026-09-18 (18 rättigheter) —
  `fulfillmentEventCreate` kräver båda. `kor.mjs --kolla` säger det i
  klartext om det saknas igen (t.ex. i en ny butik).

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

`/sparning` (`.claude/commands/sparning.md`), varje timme kl :16, fast
session med repot som källa (annars kan `lage.json` inte pushas — se
CLAUDE.md om rutiner). **Byggd 2026-09-18 16:16 CEST på
`claude5@stonebite.org`:** trigger `trig_014rEkz1EjfRfUW6dZxnvm6Q`, fast
session `session_01To75UpfXYXGX5jcb9QYrdv`, cron `16 * * * *` (timvis —
påverkas inte av vinteromställningen), taggar `routine:sparning` +
`butik:baverbutiken`, inga connectors. Sedd i `list_triggers` samma körning.
Kommandofilen ligger på `main` — rutinen klonar `main`.

Stänga av: Routines-vyn på claude.ai → "Spårningen: skanningar in i Shopify
(varje timme)" → av. Ingen kvot bränns när den står still; redan skrivna
event i Shopify ligger kvar.

## Logg

- **2026-09-19 kväll, sammanfattningsvyn.** Axel: sidan "visar varje enskild
  logistikhändelse, terminal, land och transportstatus vilket gör sidan väldigt
  rörig". Standardvyn är nu fem punkter; historiken ligger bakom "Visa
  fullständig transporthistorik" med ort och land per rad.
  Kontrollen (`kontroll.mjs`, fyra krav, spärr i publiceringen) hittade **tre
  fel som ingen letade efter**: tidsavrundning uppåt (578 av 1 851 rader),
  ihopslagning som tog bort äkta skanningar, och ett tappat land i
  publiceringen (158 av 1 055 paket). Alla tre rättade.
  Publicerad skarpt: 1 055 paket, 11 223 skanningar, 279 kB, kontrollen grön,
  trippelkollen grön, sedd i Chromium på 390 och 1 280 px med historiken både
  fälld och öppen.

- **2026-09-19, spårningssidan live.** Axel: "den visar inga detaljer" om
  Shopifys orderstatussida — den kan inte visa mer, så butiken fick en egen.
  Byggd av fyra agenter parallellt (språk, dataformat, kundvy, publicering)
  med adversarisk granskning per del: **35 fel hittade och rättade före
  första körningen**, bland dem engelska som nådde kunden, en tidszonsbugg
  som läste 17TRACK:s `time_utc` som lokal tid, och en publicering som kunde
  lägga upp en tom sida. 101 tester utan nät.
  Första skarpa körningen: **1 055 paket, 11 206 skanningar, 202 kB sida**,
  trippelkollen grön (API, publik vy, känt nummer i kundens data). Sedd i
  Chromium på 390 px och 1280 px: levererat, på väg, okänt nummer och tomt
  sökfält — inga konsolfel, ingen vågrät scroll.
  Fraserna mättes på riktig data först: 204 paket, 1 873 skanningar, 75
  distinkta fraser (engelska, VERSALER och några redan svenska) och 92
  platser ("MALMO, SCHNER, SE" → Malmö). Rundans inlärningsloop fångade sex
  fraser till i den första riktiga körningen; de ligger nu i ordboken.
  Nästa steg som inte är gjort: `--butik` för de andra butikerna, och
  mejlets v10-knapp ska klistras in av Cowork.

- **2026-09-18 16:16 CEST:** rutinen byggd (se ovan).

- **2026-09-18 15:29 UTC, första skarpa rundan** (nyckeln syntes efter
  containeromstart, appen hade fått 18 rättigheter): 932 ordrar på 14
  dagar, 940 paket, 40 registrerade (tak), 30 event skrivna, 0 fel. 10 av
  40 hade "No tracking information at this time" — nyss skickade, 17TRACK
  har inte hunnit. Tillbakaläst ur Shopify: #7429 och #7404 bär CONFIRMED
  med svenskt meddelande. Alla 40 var InfoReceived (skickade samma dag).

- **2026-09-18:** byggd. Inte körd skarpt: nyckeln fanns inte i containern
  (ny container krävs) och appen saknar `write_fulfillments`. Testerna gröna,
  `--torr` läste ordrarna: 2 682 ordrar på 45 dagar, 2 607 paket utan
  leveransevent — därför taket 150 registreringar per körning och fönstret
  14 dagar. ⚠️ Kvoten: ~87 paket om dagen ⇒ ~2 600 i månaden. 200 gratis
  räcker två dagar; köp kvot i 17TRACK-panelen ("Buy more") innan rutinen
  slås på, annars stannar registreringen och bara redan registrerade paket
  följs.
