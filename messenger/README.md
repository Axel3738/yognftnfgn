# messenger/ — Messenger-svararen

Axels beställning 2026-09-28: "den ska ungefär vara som rutinen med
kommentarsvararen, bara att den går igenom alla Messenger DM som vi får på alla
profiler varje dag och bara svarar kunderna. Det är många som kan vara sura,
som försöker kontakta oss och säger att vi inte svarar på mailen."

Noll npm-beroenden. Kommandot heter `/messenger`.

```bash
node messenger/kor.mjs --kolla                 # vilka sidor går att läsa (exit 3 = ingen)
node messenger/kor.mjs --torr                  # bedöm, visa svaren — skickar inget, skriver inget
node messenger/kor.mjs --skarpt --discord      # rutinen: skickar, loggar, rapporterar
node --test messenger/test/*.test.mjs          # 13 tester, utan nät
```

## ⛔ Läget 2026-09-28: byggd, men kan inte läsa en enda DM ännu

Mätt samma dag på alla 15 sidor `META_ACCESS_TOKEN` når:
`(#200) Requires permission: pages_messaging`. Token:en har
`pages_read_engagement`, `pages_manage_engagement` m.fl. (därför fungerar
kommentarerna), men **inte `pages_messaging`**, och utan den går inkorgen
varken att läsa eller svara i. Majavakauppa (`1317870104733246`) ger dessutom
ingen sidtoken alls (samma som i kommentarerna).

### Rättigheten

Lösningen är en **egen token för Messenger**, `META_ACCESS_TOKEN_MESSENGER`,
med `pages_messaging` (+ `instagram_basic`, `instagram_manage_messages` för
Instagram). Huvudnyckeln `META_ACCESS_TOKEN` rörs INTE: alla annonsrutiner
hänger på den, och en ny token med fel rättigheter hade stoppat dem.
`kor.mjs` provar den nya token:en först och de gamla som reserv.

Klicken står i svaret till Axel 2026-09-28 och i Axels uppgifter nedan.
⚠️ **Osäkert tills det provats:** Meta kan kräva att appen har
Messenger-användningsfallet tillagt och "Advanced Access" (App Review) för
`pages_messaging` innan en sida får svara personer som inte har en roll i
appen. Svarar `--kolla` ✅ men första skarpa svaret ger ett behörighetsfel är
det det — då står felet i loggen och i Discord, och ingen kund har fått
något halvt.

## Flödet

1. **Sidorna** (`meta.mjs`): `me/accounts` för varje token → sidtoken per
   sida. Messenger alltid, Instagram när sidan har ett kopplat IG-konto.
2. **Konversationerna** rörda senaste 72 h, meddelandena inbäddade. En
   konversation väntar när kunden skrev sist (`bedom.mjs lage`). Alla kundens
   obesvarade meddelanden läses ihop.
3. **Butiken** ur `konfig.json → sidor`: sida → kundtjänstens brandfil
   (språk, signatur, Shopify, Discord). En sida utan rad får aldrig ett
   automatiskt svar.
4. **Bedömningen är mejl-autosvarets** (`kundtjanst/autosvar/hinkar.mjs`):
   - **ENKEL** (var är min order, adressbyte, leveranstid, öppettider,
     retur, företagsuppgifter) ⇒ svar med fakta ur Shopify + 17TRACK.
   - **ARG** ⇒ den lugnande raden direkt ("eskalerat … svar inom 48 timmar")
     OCH till VA:n.
   - **SVÅR** (återbetalning, reklamation, byte, tvistord, bilaga …) ⇒ bara VA:n.
5. **Det som skiljer en DM från ett mejl** (`bedom.mjs`):
   - **Vi vet inte vem kunden är.** Ett mejl har en avsändare som ordern måste
     matcha; en DM har ingen. Skriver kunden sin e-post i chatten används den
     — orderns e-post måste vara just den. Annars frågar svaret efter
     ordernummer OCH e-post (`dm_order`), och kundens nästa meddelande med
     dem får det riktiga svaret. Aldrig en annan kunds order.
   - **24-timmarsfönstret:** Meta låter en sida svara bara inom 24 h från
     kundens senaste meddelande. Äldre ⇒ VA:n. Därför går rutinen varje
     timme, inte en gång om dagen (sessionens beslut 2026-09-28 — en daglig
     körning hade missat varje DM som skrevs strax efter förra körningen).
     `HUMAN_AGENT`-taggen (7 dagar) är för människor och används aldrig.
   - **Bilagor** (bild, röstmeddelande) läses inte ⇒ VA:n.
6. **Spärrarna:** VA:n skrev i konversationen senaste 14 dagarna ⇒ kunden är
   hennes. Max två automatiska svar per konversation och 14 dagar, varav
   bara ett riktigt (det andra får bara vara frågan om ordernummer).
   Löftesspärren (`harForbjudet`) och tankstreck stoppar svaret. Tak 30 svar
   per körning. Långa svar delas under Metas 2 000 tecken.
7. **Loggen** `logg/<ÅÅÅÅ-MM>.jsonl` (committas): en rad per väntande DM,
   kunden som hash, texten maskerad och kapad till 160 tecken. Ett
   kundmeddelande som hanterats bedöms aldrig igen.
8. **Discord** (`--discord`, engelska): per butik i dess `#customer-service`;
   Matstrumpor (ingen server) i Bäverbutikens. Bara när något hänt. Varje
   DM till VA:n står med länk till sidans inkorg i Meta Business Suite.

## Filer

| Fil | Vad |
|---|---|
| `konfig.json` | Sida → butik, fönstren, taken — facit |
| `meta.mjs` | Sidor, konversationer, skicka |
| `bedom.mjs` | Ren logik: läget, DM → "mejl", minnet, DM-texterna, delningen |
| `kor.mjs` | Körningen + CLI + Discord |
| `logg/` | Minnet (committas) |
| `test/` | 13 tester utan nät |
