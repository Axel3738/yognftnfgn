# Datakontraktet: tvisterna in i kundtjänst-dashboarden

Motsvarigheten till `kundtjanst/autosvar/DASHBOARD.md`, fast för tvistkollen.
Läs den här innan du bygger något som visar tvister.

⚠️ **Den stora skillnaden mot autosvaret: tvistkollen har ingen logg.**
`kundtjanst/tvistkoll.mjs` skriver ingenting, någonsin — inga filer, ingen
`.jsonl`, ingen push. Det är med flit (`.claude/commands/tvistkoll.md` steg 3):
historiken är veckorapportens jobb. Så det finns ingen fil att läsa. Datan
hämtas live ur Shopify, eller ur snapshoten.

---

## De två källorna

### 1. Snapshoten — allt som är öppet (använd den här som grund)

`stonebite/data/snapshot.json` → **`oppnaTvister[]`**, skriven av
`stonebite/hamta.mjs`. En rad per öppen tvist, över alla varumärken:

```json
{ "order": "#5584", "brand": "baverbutiken", "typ": "chargeback",
  "belopp": 348, "valuta": "SEK", "deadline": "2026-09-23",
  "initierad": "2026-09-10", "status": "needs response",
  "besvarad": false, "utfall": null, "oppen": true }
```

`typ` är `chargeback` eller `inquiry`. `status` är Shopifys, normaliserad.
`utfall` är `null` tills banken avgjort.

### 2. Tvistkollen — vad som brådskar just nu

```
node kundtjanst/tvistkoll.mjs --alla --torr --json
node kundtjanst/tvistkoll.mjs --brand <id> --torr --json --dagar 14
```

⚠️ **`--torr` är obligatoriskt från dashboarden.** Utan det postas larmet i
Discord, och då får VA:n samma larm två gånger. (Det hände 2026-09-21: samma
larm postades dubbelt för att `--discord` kördes en andra gång.)

Ett objekt per brand:

```json
{ "brand": "baverbutiken", "tillganglig": true, "orsak": null, "tvister": 50,
  "bradskande": [ { "order": "#5584", "typ": "chargeback",
    "orsak": "credit_not_processed", "belopp": 348, "valuta": "SEK",
    "deadline": "2026-09-23", "kvar": 1 } ] }
```

`kvar` = dagar till deadline. **`kvar < 0` = försenad, `kvar === 0` = går ut i
dag, och de är två olika saker** — en tvist som går ut i dag är fortfarande
vinnbar. Slå aldrig ihop dem. `tvister` är alla tvister 180 dagar bakåt, inte
antalet öppna.

---

## Vad sidan ska visa

Per varumärke:

1. **Chargebacks först, alltid.** Sortera `typ === 'chargeback'` överst, sedan
   `kvar` stigande, sedan belopp fallande. Ett chargeback är pengar som redan
   är tagna och en förlust är slutlig; en inquiry är bara en fråga från banken.
   Mätt på 50 tvister 2026-09-20: inquiries 29 av 29 avgjorda **vunna**,
   chargebacks **1 av 4** — alla förluster någonsin var chargebacks.
2. **Deadline med dagar kvar**, och "OVERDUE" / "DUE TODAY" som egna lägen.
3. **Summan pengar i risk per varumärke**, per valuta. Summera aldrig valutor.
4. **Brands som inte gick att läsa** — se regeln nedan.
5. En länk till handboken i Notion (`Start here`) per rad, inte en egen
   instruktion på sidan. Proceduren bor i SOP:erna, inte i gränssnittet.

---

## Regler

- **Ett varumärke som inte gick att läsa är OKÄNT, aldrig noll.** `tillganglig:
  false` bär `orsak` i klartext — visa den raden ordagrant. Mätt 2026-09-22:
  bara Bäverbutiken går att läsa. CaraShell, CatCabin, DryTrek, HeimGuard och
  TankGuard saknar Shopify-nycklar; TackleBay svarar `app_not_installed`. En
  nolla där hade sagt "inga tvister", och det är falskt.
- **Räkna aldrig om det tvistkollen redan räknat.** `kvar` kommer ur verktyget.
- **Säg aldrig "skicka in nu" som generell instruktion.** Bevis som blir bättre
  med tiden skickas in SIST: för "varan kom aldrig fram" tar paketet i median
  10 dygn medan evidensfristen är upp till 21, så en tvist utan
  leveransskanning i dag har oftast en på deadline-dagen. Mekanismen är
  Shopifys **Save** (aldrig "Submit now", som låser svaret). Sidan får gärna
  visa *"submit by"* = deadline − 1 dag, men aldrig "submit today".
- **Kundmejlet väntar däremot aldrig.** Om sidan skriver något om tidpunkt ska
  den skilja de två: svara kunden i dag, skicka in bevisen sist.
- **Gränssnittet på engelska** — VA:n läser det.
- **Inga runtime-capabilities på sidan.** VA:n har inget Claude-konto.
- **Ingen maskering behövs:** tvistdatan bär inga kundadresser och inga namn,
  bara ordernummer. Lägg aldrig till kunduppgifter i den.

---

## Rör inte

- **Kör aldrig `tvistkoll.mjs` utan `--torr`** från dashboarden — då postas
  larmet i Discord igen.
- **Kör aldrig `tvistfakta.mjs --registrera`.** Det registrerar paket hos
  17TRACK och kostar kvot ur en pott som delas av sex butikers spårningsrutin.
- **Skriv ingenting i Shopify.** Allt här är läs-bart. Att acceptera ett
  chargeback eller betala en återbetalning är VA:ns beslut i Shopify, aldrig
  sidans.
- **Rör inte `kundtjanst/korningar/` eller `kundtjanst/historik/`** — det är
  veckorapportens, och historiken är det som gör "återkommande" mätbart.

---

## Kända luckor (bygg inte runt dem, och hitta inte på)

1. **Domen går inte att läsa maskinellt än.** `kundtjanst/tvistfakta.mjs` ger
   `FIGHT / REFUND / WAIT / ESCALATE` med bevislista, men bara som text — den
   har inget `--json`. **Sidan ska därför INTE visa någon dom.** Vill du ha
   domen per rad på sidan: säg till, då lägger tvistkoll-sessionen till
   `--json` i `tvistfakta.mjs`. Gissa aldrig en dom ur reason-koden.
2. **`order` är ibland ett orderId, inte ett ordernummer.** Mätt 2026-09-22:
   `"order": "17666239660381"` i snapshoten, för att Shopify inte gav något
   namn på den tvisten. Visa det som det är; hitta inte på ett `#`-nummer.
3. **`besvarad` säger inte om VA:n skickat in bevis.** Shopify har ingen sådan
   flagga vi läser — `status: under_review` är det närmaste, och det betyder
   att något redan är inskickat. Skriv aldrig "obesvarad" om en `under_review`.

---

## ✅ Byggd 2026-09-22 (dashboard-sessionen)

Sektionen **Disputes now — all stores** i `kundtjanst/rapport-sida.html`,
datan ur `samlaTvister()` i `kundtjanst/dashboard.mjs`, körd av
`kundtjanst/rapportsida.mjs` vid varje bygge.

- **Källorna, exakt som kontraktet:** snapshotens `oppnaTvister[]` är basen
  (`oppen !== false`), tvistkollen körs av `rapportsida.mjs` självt som
  `node kundtjanst/tvistkoll.mjs --alla --torr --json` (`korTvistkoll`;
  argumenten är frysta i `TVISTKOLL_ARGS`, ett test bevisar att `--torr`
  alltid är med och `--discord` aldrig). Exit 1 med JSON på stdout godtas —
  det är "ingen butik läsbar", och då står alla butiker som okända med orsak.
  `--utan-tvistkoll` hoppar steget (sidan säger "urgency not read").
- **Tvistkollens tal vinner.** Matchning rad för rad på `order|deadline`;
  träff ⇒ `kvar`, `orsak` och ⚑ *urgent* är tvistkollens (`kvarFran:
  'tvistkoll'`). Rader tvistkollen såg men snapshoten inte har (nyare än
  hämtningen) läggs till med tvistkollens tal rakt av. Rader utan träff får
  `kvar` ur `dagarTill()` — **samma formel som `dagarKvar`** (ett test
  jämför dem) — märkta `kvarFran: 'sidan'`.
- **Lägen:** `forsenad` (kvar < 0, röd "OVERDUE · N days"), `idag` (kvar = 0,
  röd "due TODAY"), `bradskande` (≤ 3, gul), `kommande` (grå), `okand`
  (ingen deadline). Aldrig ihopslagna. `under_review` ⇒ grön "under review —
  evidence submitted", aldrig "obesvarad".
- **Ordning:** per butik chargeback först, sedan kvar stigande (`null` sist),
  sedan belopp fallande (`sorteraTvister`). Butikerna: de med öppna rader
  eller läst brådska överst (flest chargebacks, kortast kvar), sedan omätta
  (`tillganglig: null`), sist okända utan rader.
- **Pengar i risk per valuta**, aldrig summerat (`pengarIRisk: {SEK: …,
  USD: …}`).
- **Okänd butik = orsaken ordagrant**, aldrig noll. Lång orsak (Shopifys
  HTML-felsida på 900 tecken) visas som första raden + `<details>` "show the
  full reason" — allt HTML-escapat, inget klipps bort. Har snapshoten rader
  för en butik tvistkollen inte kunde läsa står raderna kvar med sidans
  dagar-kvar och rutan "Urgency was not read live for this store".
- **"Submit by" = deadline − 1 dag** (`skickaInSenast`). Ingen text säger
  "submit now"; foten säger *Reply to the customer today, submit evidence
  last* — testet letar efter både förbjudna och krävda fraser.
- **Handbokslänk per rad** ur `kundtjanst/handbok.json` (START HERE; för
  chargebacks dessutom *the first hour*), slagna upp via Notions API — byts
  sidorna i Notion: slå upp igen.
- **Ingen dom.** Inte FIGHT, REFUND, WAIT eller ESCALATE någonstans i mallen
  (testat). Sidan skriver ingenting i Shopify, kör aldrig `tvistfakta.mjs`,
  rör inte `korningar/` eller `historik/`.
- **Mätt vid bygget 2026-09-22 16:30 UTC:** snapshot 16:06 med 10 öppna
  tvister för Bäverbutiken (2 chargebacks, 5 försenade, 1 går ut i dag,
  4 545,20 SEK i risk). ⚠️ Dashboard-sessionens container saknade
  `SHOPIFY_CLIENT_ID_BAVERBUTIKEN_EMAILSCRAPER`, så tvistkollen fick 403
  (`read_shopify_payments_disputes`) på Bäverbutiken här — timrutinens
  container läste samma tvister utan fel. Sidan gjorde då det den ska:
  raderna ur snapshoten, 403-orsaken bredvid, brådskan räknad av sidan. Fem
  butiker utan Shopify-nycklar, TackleBay och CatCabin `app_not_installed`,
  Majavakauppa/NO/DK 403 på scopet — alla står med orsak.
