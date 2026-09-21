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

> Ordern är mottagen → Paketet är på väg → Hos fraktbolaget →
> Ute för leverans → Levererat

(Så sedan 2026-09-20 kväll; hette först *Beställningen är registrerad →
Internationell transport → Ankommit till Sverige → …*.) Under varje nådd
punkt står ett delsteg som säger var paketet faktiskt är (`delsteg.mjs`).

⚠️ **"Mer information" med hela historiken är BORTA** (Axels beslut
2026-09-20 kväll, B: "bort med mer information") — den räknade upp Kina och
Nederländerna rad för rad, tvärtemot bävernumrets syfte. Ingen skanning tas
bort ur *datan*: sidans datablock bär fortfarande varje rad med ort och
land, och `kontroll.mjs` mäter det. Bara vyn är fem punkter.

### Ingen utländsk geografi i standardvyn (Axels krav 2026-09-20)

Kunden ska se leveransens milstolpar, inte logistiken. Tre regler:

1. **Ort visas bara från "Ankommit till Sverige" och uppåt** (`ortFor` i
   `uppacka.mjs`). Allt före det är utlandet. Mätt på den publicerade datan
   2026-09-20: 683 av 1 194 ortsrader föll bort — 604 "Kina", 67 "Hongqiao"
   och 12 "Sverige" som satt på PostNords förhandsavisering.
   ⚠️ **Filtrera aldrig på landet ensamt.** `landFor()` känner bara de orter
   som mätts, så både `LULEÅ PAKETTERMINAL LULEÅ` och `Hongqiao` ger `null`:
   en landsregel hade tystat svenska utlämningsställen och ändå släppt igenom
   det kinesiska terminalnamnet. Skedet är facit, landet är en extra spärr.
2. **Svenska orter är kvar.** `Levererat · ICA nära Gällö` är den enda raden
   på sidan som kräver något av kunden — den får aldrig bli bara "Levererat".
3. **Ingressen behåller fraktbolagets text, men tappar orten.** Den är det
   ENDA som rör sig under den internationella sträckan (4–9 dygn, och 544 av
   1 055 paket låg där 2026-09-19). Görs den statisk är sidan byte-identisk i
   en vecka för varannan kund, och då mejlar de kundtjänst. Det aktiva skedet
   bär dessutom "Senaste skanning &lt;tid&gt;" av samma skäl.

**Krav 5 i `kontroll.mjs`** mäter det i stället för att lita på filtret, och
`publicera.mjs` vägrar publicera en sida som fäller det. Fyra ordboksfraser
skrevs om samma dag: de påstod "mottagarlandet" men bars av skanningar i
Nederländerna (importtullen klareras där), och utan orten i vyn hade kunden
läst "Klart i tullen i mottagarlandet" ovanför ett grått "Ankommit till
Sverige" — 7 riktiga paket låg så när det mättes.

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
- **Kunden ser ett bävernummer, aldrig fraktbolagets** (Axels beslut
  2026-09-20: "maska med ett eget bävernummer så de inte ser YT nr").
  `BB-` + de åtta första hexsiffrorna i SHA-256 av spårningsnumret
  (`bavernummer.mjs`). Det **genereras inte per order och lagras ingenstans
  — det räknas** på tre ställen med samma svar: bygget skriver det i sidans
  data, Shopifys mejlmall räknar det med Liquid-filtret `sha256`
  (`BAVER_LIQUID` i `mejl/mallar.mjs`, mejltestet kör kedjan mot Node), och
  kundtjänst räknar det med `node sparning/baver.mjs <ordernummer | YT… |
  BB-…>` som slår i `lage.json` (order ↔ spårningsnummer, 60 dagar) och
  skriver ut kundens länk. Utan terminal: klistra in fraktbolagets nummer
  från ordern i Shopify direkt i sökfältet på sidan — den tar båda och visar
  bävernumret. Maskering, inte sekretess: sidkällan bär spårningsnumren.
- **Sista biten i Sverige** (`sistabiten.mjs`): 17TRACK:s `misc_info` bär
  ombudets namn och EGET nummer (PostNord `UJ…SE`, CityMail, Early Bird,
  Instabee). Rutan "Hämta ditt paket" med länk visas **bara** när paketet
  ligger för upphämtning (`READY_FOR_PICKUP`) — innan dess avslöjar en
  CityMail-sökning avsändarlandet.
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

## Fler butiker (Axels order 2026-09-20 kväll: "lägg in spårningssystemet i alla")

Registret är **`sparning/butiker.json`** — en post per butik: namn, url,
myshopify-domän, nycklarnas namn (`env_suffix` ⇒ `SHOPIFY_CLIENT_ID_<suffix>`
+ secret; `ops: true` ⇒ fabrikens nycklar via `listicle/butik.mjs`), språk,
mottagarland, support, bävernumrets prefix, sidans handle/titel,
leveranslöfte och om erbjudandet (lyckohjulet) ska visas. `node
sparning/butik.mjs` listar. Hemligheterna ligger aldrig i filen.

```bash
node sparning/kor.mjs --butik carashell --kolla     # nycklar + rättigheter
node sparning/kor.mjs --butik carashell             # rundan + sidan
node sparning/publicera.mjs --butik beverbutikken --torr --paket <fil>
node sparning/baver.mjs --butik carashell "#1030"   # kundtjänst
```

- **Bäverbutiken är standard** (`standard: true`) och bär sina filer i
  `sparning/` som förut — rutinen på `main` rör inget. De andra får
  `sparning/butiker/<id>/lage.json` + `konfig.json` (committas) och
  `output/` (gitignorerad).
- **Samma 17TRACK-konto och `TRACK17_API_KEY` för alla** — kvoten räknas per
  paket, inte per butik. CaraShells första runda registrerade 141 paket.
- **Språket** (`sparning/oversatt.mjs` + `sparning/sprak/nb.json`, `da.json`,
  `fi.json`): hela kedjan byggs och KONTROLLERAS på svenska, och i sista
  ledet byts varje mening — frasordboken, skedena, delskedena,
  statusetiketterna, rubrikerna, sidans texter och Shopify-meddelandena —
  mot butikens språk ur EN tabell (svensk mening → översatt). En mening
  utan översättning står kvar på svenska och räknas i rapporten. Testet
  `butiker.test.mjs` läser alla meningar ur källfilerna och kräver en
  översättning i varje fil. ⚠️ Översättningarna är sessionens (2026-09-20),
  inte en modersmålstalares — finskan är osäkrast. Rätta i JSON-filen.
  ⚠️ Sidans datumNYCKLAR (`datumStr`) är alltid sv-SE — `nb-NO` gav
  "20.9.2026", `dagenFore()` kastade och varje norskt uppslag blev "Vi
  finner ikke det nummeret" (mätt 2026-09-20). Bara det som visas
  formateras med butikens locale.
- **Prefixet** följer butiken (`data.bp`): CaraShell `CS-…`, Bäver-butikerna
  `BB-…`. Hexsiffrorna är samma; sidan slår upp med butikens prefix (mätt
  live på carashell.se innan det rättades: CS-nummer gav "hittar inte").
- **Mottagarlandet** styr steg- och kontrollogiken (`byggData`/`kontrollera`
  får `mottagarland` ur registret). Den norska torrkörningen på
  Bäverbutikens paket fällde 7 av 1 104 på krav 4 — rätt, de var svenska.
- **Supportadressen** läses ur registret, annars ur Shopifys
  `shop.contactEmail` — aldrig en annan butiks. Majavakauppas är okänd.
- **Erbjudandet** (lyckohjulet) bara där `erbjudande: true` — Bäverbutiken.

**Läget per butik 2026-09-20 kväll** (`scratchpad/scopes-alla.mjs`, token +
`currentAppInstallation.accessScopes` per butik):

| Butik | Kopplad | Appens rättigheter | Sida |
|---|---|---|---|
| Bäverbutiken | ✅ | ✅ | live sedan 2026-09-19 |
| CaraShell | ✅ (fabrikens app "Factory", 154 scopes) | ✅ | **live 2026-09-20: https://carashell.se/pages/spara** — 141 registrerade, 138 event, 140 paket på sidan, CS-nummer. **Mejl + meny klara samma kväll**; mejlen bytta till den hela SVENSKA mallen 22:33 (Cowork, verifierat tecken för tecken — `cowork/carashell.md` → Utfall 2). **Den fyrspråkiga mallen (sv/nb/en/fi) inne 2026-09-21 05:44–05:56 UTC** — Coworks klassificerare stoppade skript i auto-läge (Utfall 3 + 4), så Axel klistrade in själv och Cowork verifierade mot servern (41 115 / 24 402 / 24 394, sha256 lika; tredje filen hamnade först i `local_out_for_delivery`, återställd — rätt id är `shipment_out_for_delivery`). Avsändaren hello@carashell.com Autentiserad, testmejl OK (engelskt: Shopifys testorder har engelskt land). **Klart.** |
| Beverbutikken NO | ✅ (`_NO`) | ✅ sedan 2026-09-20 kväll (Cowork steg 0: version `bever-no-produkter-claude-4`, 13 rättigheter). Meny klar (Hovedmeny + Bunntekstmeny, Cowork samma kväll); **fraktmejlen är de nya hela mallarna sedan 2026-09-20 20:58 UTC** (Cowork, verifierat mot EmailTemplate-API: 10 436 / 6 240 / 6 243 tecken, testmejl med en knapp **Spor pakken** → `?nummer=BB-…`). ⚠️ Avsändaren i Shopify är Beverbutikken@gmail.com — Gmail godtas inte, mejlen går från `store+…@shopifyemail.com`; Axel bytte till **support@beverbutikken.no** och verifierade den samma kväll (registret uppdaterat; mallarna ombyggda med den adressen i sidfoten — 10 426 / 6 230 / 6 233 tecken — **inne på servern 2026-09-21 ~01:30, testmejl från support@**, `cowork/beverbutikken.md`). **Klart.** | **live 2026-09-20 21:50 CEST: https://beverbutikken.no/pages/spor** — 430 ordrar/14 d, 438 paket, 150 registrerade (taket; 288 tas av timrutinen), 145 event, 145 paket på sidan. Timrutin `trig_01JqE4TDfLVwpJEHhECGyQFL` (:32). Mejl + meny: `cowork/beverbutikken.md` steg A–C |
| Bæverbutiken DK | ✅ (`_DK`, appen "DK claudeprodukter" installerad av Axel 2026-09-20 sen kväll, 13 rättigheter) | ✅ | **live 2026-09-20 22:31 CEST: https://baeverbutiken.dk/pages/spor** — 1 order/14 d, 1 registrerat, 0 skanningar än: publicerad TOM som första sida (regeln "första publiceringen får vara tom" i `publicera.mjs`, så mejl och meny har någonstans att landa). Timrutin `trig_01Xjx5pUdre9Uw3LJiBy9Nzs` (:48). **Mejl + meny klara 2026-09-21 ~01:25** (Cowork: 10 432 / 6 228 / 6 236 tecken verifierade mot servern, Spor pakken i Huvudmeny + Sidfotsmeny, testmejl OK; avsändare kundesupport@ Autentiserad) — `cowork/baeverbutiken.md`. **Klart.** |
| Majavakauppa FI | ✅ (`_FI`) | ✅ sedan 2026-09-20 kväll (Cowork steg 0: version `fi-claudeprodukter-4`, 13 rättigheter) | **live 2026-09-20 21:48 CEST: https://majavakauppa.fi/pages/seuranta** — 7 ordrar/14 d, 7 registrerade, 5 event, 5 paket på sidan. Support **`asiakaspalvelu@majavakauppa.fi`** (Axels beslut B 2026-09-21 efter Coworks avläsning; en tidigare körning hade läst asiakastuki@). Timrutin `trig_016yuCdWwbFPgA2ntJcLGUED` (:40). Meny klar (Main + Footer menu, Cowork samma kväll); **fraktmejlen inne 2026-09-21 ~01:30** (Cowork: 10 601 / 6 235 / 6 243 tecken verifierade mot servern, testmejl med knappen Seuraa pakettia). **Ombyggda med asiakaspalvelu@ och inne på servern 2026-09-21 07:34** (10 607 / 6 241 / 6 249 tecken, testmejl OK) — `cowork/majavakauppa.md`. **Klart.** |
| BeaverShop UK | ✅ (`_UK`) | ❌ saknar samma tre | inte beställd av Axel; går att lägga till i registret (engelska saknas i `sprak/`) |
| Matstrumpor.se | ✅ (`_1r46tp_qx`, fabrikens app "Fabriken", 154 rättigheter) | ✅ alla fyra | **live 2026-09-21 09:36 UTC: https://matstrumpor.se/pages/spara** — 59 ordrar/14 d, 59 registrerade, 48 paket med skanningar, 640 händelser, 48 event, 0 fel, 0 okända fraser, 73 kB. Trippelkollen grön, sedd i Chromium på 390 + 1280 px. Sidan bär butikens eget brand (orange #dd821d, sushi-loggan) och prefixet `MS-`. Timrutin på :56. **Inget steg 0 behövdes** — nycklarna fanns redan (⚠️ `SHOPIFY_SHOP_1r46tp_qx` i Environments bär domänen med understreck; registret är facit). Mejl + meny: `sparning/cowork/matstrumpor.md` |

Mejlmallar och menylänk per butik är klick i admin utan API — mejlen byggs
hela av `node mejl/bygg-butik.mjs <id>` och Cowork-prompten ligger i
`mejl/output/butiker/<id>/COWORK-PROMPT.md` (Axels dom 2026-09-20 på den
lappade Shopify-mallen: "tvääär fula"); appens rättigheter (steg 0) står i
`sparning/cowork/<id>.md` (för NO/DK/FI även appens
rättigheter i Dev Dashboard, steg 0). När en butik fått rättigheterna:
`node sparning/kor.mjs --butik <id>` (publicerar sidan), sedan rutinen
(`/sparning <id>`, en per butik, fast session + cron på egen minut) och
därefter Cowork-prompten steg A–C.

**Brandet på sidan** följer butiken sedan 2026-09-20 sen kväll: Bäverbutiken
ur `mejl/konfig.json`, andra butiker ur `mejl/butiker/<id>.json` (samma
fil som deras fraktmejl) — färger, typsnitt och rubrikstil (`rubrik_versaler`,
`rubrik_fet` → `sida.mjs` `versaler`/`fet`). ⚠️ Före det spred `publicera.mjs`
Bäverbutikens mejlkonfig in för ALLA butiker, så CaraShells sida gick live
röd med Impact i versaler (Axel: "det är bäverbutikens branding ju, inte
carashells"). Rättat samma kväll, sidan ompublicerad regnblå med feta
gemener; NO/DK/FI har Bäverbutikens färger i sina brandfiler och ser
likadana ut som förut.

**Leveranslöftet 7–14 dagar mätt mot verkligheten 2026-09-20** (Shopify
`fulfillment.createdAt → deliveredAt`, `scratchpad/leveranstid.mjs`):
Bäverbutiken 133 levererade paket sedan rutinen började skriva event
(2026-09-18) — p25 10,0 / median 11,1 / p75 12,3 / p90 13,0 / max 14,0
dagar. Urvalet är bara två dygns leveranser (paket som levererades före
18/9 saknar `deliveredAt`, och de som ännu är på väg räknas inte), så
det är en lägsta nivå, inte hela bilden. 7–14 täcker p90. CaraShell och
NO har 0 resp. 1 levererat med datum — mät om efter två veckor innan
löftet ändras. Axels fråga samma kväll ("borde vi lägga på lite tid?"):
beslutet väntar på den mätningen.

⚠️ CaraShell säljer också till NO (/nb), US (carashell.com) och FI (/fi).
Sidan är EN Shopify-sida på svenska; översättningar av den per marknad
(Shopifys Translations API, som listiclarna) är inte byggda.

## Rutinen

`/sparning` (`.claude/commands/sparning.md`), varje timme kl :16, fast
session med repot som källa (annars kan `lage.json` inte pushas — se
CLAUDE.md om rutiner). **Byggd 2026-09-18 16:16 CEST på
`claude5@stonebite.org`:** trigger `trig_014rEkz1EjfRfUW6dZxnvm6Q`, fast
session `session_01To75UpfXYXGX5jcb9QYrdv`, cron `16 * * * *` (timvis —
påverkas inte av vinteromställningen), taggar `routine:sparning` +
`butik:baverbutiken`, inga connectors. Sedd i `list_triggers` samma körning.
Kommandofilen ligger på `main` — rutinen klonar `main`.

**En rutin per butik, egen minut** (så de sex pusharna inte krockar; varje
körning gör `git pull --rebase` först):

| Minut | Butik | Trigger | Fast session |
|---|---|---|---|
| :16 | Bäverbutiken | `trig_014rEkz1EjfRfUW6dZxnvm6Q` | `session_01To75UpfXYXGX5jcb9QYrdv` |
| :24 | CaraShell | `trig_01UAU1N6P4MpPmeLgKffprHo` | `session_01EZDDNdhgXgYFZ7p8DWf4BU` |
| :32 | Beverbutikken NO | `trig_01JqE4TDfLVwpJEHhECGyQFL` | `session_01YGSL1w5uQszYjieUqqc9iN` |
| :40 | Majavakauppa FI | `trig_016yuCdWwbFPgA2ntJcLGUED` | `session_019k52ns9p5muXHmQD532Hvd` |
| :48 | Bæverbutiken DK | `trig_01Xjx5pUdre9Uw3LJiBy9Nzs` | `session_01SLDa7FRSAf2964pHQ1mjVg` |
| :56 | **Matstrumpor** | **`trig_01LSdjZgepsWf761ocrFWAAo`** | **`session_017E57dcmd1Lf7PpJTBsoAUE`** |

Matstrumpors rutin byggd 2026-09-21 11:41 CEST på `claude5@stonebite.org`
efter att koden låg på `main`, sedd i `list_triggers` samma körning, första
körning 11:56 CEST. Alla sex ligger på samma konto.

Stänga av: Routines-vyn på claude.ai → "Spårningen: skanningar in i Shopify
(varje timme)" → av. Ingen kvot bränns när den står still; redan skrivna
event i Shopify ligger kvar.

## Logg

- **2026-09-20 sen kväll, alla butiker.** Axel: "implementera denna spårningsgrejen … till andra shopify butiker" — CaraShell, beverbutikken.no, baeverbutikken.dk, majavakauppa.fi, utan lyckohjulet. Byggt: registret `butiker.json`, `butik.mjs` (klient per butik), `oversatt.mjs` + `sprak/nb|da|fi.json` (146 meningar × 3 språk, täckningstest), `--butik` i kor/publicera/baver, prefix per butik, Shopify-meddelanden på butikens språk. Kopplingskollen (`scopes-alla.mjs`): CaraShell ✅ (Factory-appen), NO/FI svarar men saknar tre rättigheter, DK `app_not_installed`. **CaraShell live** 18:39 CEST (141 registrerade, 140 paket, CS-nummer) + timrutin `trig_01UAU1N6P4MpPmeLgKffprHo` 18:47. Två fel hittade av torrkörningen mot riktig data: locale-datumnycklar (norska uppslag fällde) och BB-prefixet i sidans uppslag (CS-nummer hittades inte live). Cowork-prompter i `cowork/<id>.md`. 155 spårningstester, 1 673 totalt. **Cowork körde CaraShell-prompten samma kväll:** tre fraktmallar pekar på `/pages/spara?nummer=CS-…` (verifierat mot servern: `tracking_url` 0, `sha256` 6), "Spåra paket" i Main + Footer menu, testmejl skickat. Stopp på vägen: hello@carashell.se var overifierad avsändare — verifierad under körningen. Öppet för Axel: Shopifys knapp "Spåra order med Shop" (`shop_app_tracking_url`) står kvar orörd. Butiken är därmed helt klar (Shop-knappen byts i ett eget Cowork-steg, `cowork/carashell-knapp.md`). **Steg 0 för NO/FI/DK kört av Cowork samma kväll:** NO och FI fick de fyra rättigheterna (nya appversioner `…-4`, "Uppdatera dataåtkomst" godkänd i admin); DK-appen fick rättigheterna men installationsklicket stoppades av Coworks eget filter — Axels klick. Lärdom: den nya Dev Dashboard har ingen "Protected customer data access"-sektion för custom apps — nivån är alltid tillgänglig, godkännanderutan i admin drar med "Känsliga uppgifter" och går inte att välja bort per fält. **NO + FI live 21:48–21:50 CEST** (`--kolla` grön för båda, torrkörning, skarpt): FI 7 paket / 5 event, NO 438 paket varav 150 registrerade (taket) / 145 event / 381 händelser på sidan; tre nya fraser i ordboken (`shipping label created`, `parcel electronic information received`, PostNord NO:s "the sender has notified us …") + översättningar i nb/da/fi. Timrutiner byggda 21:56 CEST på `claude5@stonebite.org`, sedda i `list_triggers`: NO `trig_01JqE4TDfLVwpJEHhECGyQFL` / session `session_01YGSL1w5uQszYjieUqqc9iN` (`32 * * * *`), FI `trig_016yuCdWwbFPgA2ntJcLGUED` / session `session_019k52ns9p5muXHmQD532Hvd` (`40 * * * *`). ⚠️ NO:s 288 oregistrerade paket tas i kapp på två timmar; 17TRACK-kvoten delas av alla butiker och NO ensam är ~430 paket per 14 dagar — läs "17TRACK avvisade N" i rapporten.

- **2026-09-20 kväll, bävernummer + sista biten + delsteg.** Fem beslut av
  Axel samma dag, alla live: (1) "Internationell transport" ersatt av
  delsteg som säger var paketet faktiskt är (`delsteg.mjs`: lämnat lagret,
  på flyget, genom tullen, hos fraktbolaget …) med paket-animation; (2)
  aldrig "på väg till Sverige" — och (3) inte "Framme i Sverige" heller,
  skedet heter **Hos fraktbolaget** (ett land i rubriken pekar ut det andra
  landet); (4) 17TRACK:s last-mile-data → "Hämta ditt paket" med ombudets
  nummer och länk, bara vid `READY_FOR_PICKUP`; (5) **bävernummer** i stället
  för YT-nummer, SHA-256 så mejlet (Liquid) räknar samma som sidan;
  beräknad leverans ur `mejl/konfig.json` (7–14 dagar från första
  skanningen) som popup, röd när den passerats. Kundtjänst:
  `sparning/baver.mjs`. Publiceringen tolkar sidans JavaScript före
  uppladdning (`provkorSkriptet`) sedan en syntaxmiss gick ut live. 143
  spårningstester + 35 mejltester. **Mejlmallarna v11 inklistrade av Cowork
  samma kväll 17:35 CEST, verifierade mot servern; "Spåra paket" i huvudmeny
  + sidfot** — `mejl/COWORK-PROMPT.md`. Grenen mergad till `main` 2026-09-20
  kväll (Axels order), så timrutinen bygger om sidan varje timme.
  **Senare samma kväll:** Axels dom "riktigt jävla bra" + två ändringar:
  (a) **"Mer information" bort** (beslut B — historiken räknade upp Kina
  rad för rad); (b) **upsell under paketet**: svart block "Vinn en
  gratisprodukt" med stor röd knapp **Få en gratisprodukt** →
  `/pages/din-gratisprodukt` (lyckohjulet), "Spåra ett annat nummer" liten
  under. Belopp och hjulets adress ur `mejl/konfig.json` (`erbjudande`,
  `hjul`) via `publicera.mjs` — ingen kod i länken, ingen andra sanning.
  Visas bara i träffvyn. Shopifys Liquid-kedja för bävernumret mätt mot
  Node på tre riktiga nummer (tillfällig temamall, raderad): identisk.
  ⚠️ Koden ligger på grenen `claude/fervent-bardeen-pzyuql`, inte på `main`
  (Axel: "inte merga än"). Timrutinen kör `main`, vars `kor.mjs` inte känner
  till sidan alls (mätt 2026-09-20: ingen `publicera` i `origin/main`) — den
  skriver bara event i Shopify. Sidan byggs alltså inte om av någon förrän
  grenen mergats; tills dess är den en ögonblicksbild från senaste
  handpubliceringen (`node sparning/kor.mjs --max 0`) och släpar efter
  timme för timme.

- **2026-09-20, städningen av standardvyn.** Axel: "only the major delivery
  milestones … no foreign terminal names or countries … one simple status
  such as International transport … keep the complete carrier history behind
  Mer information". Skedena heter nu *Beställningen är registrerad →
  Internationell transport → Ankommit till Sverige → Ute för leverans →
  Levererat*, orten visas bara från ankomsten och uppåt, knappen heter
  "Mer information", och krav 5 i `kontroll.mjs` gör regeln till en spärr i
  publiceringen. **Rådatan rördes inte** — samma format (v2), samma
  skanningar, samma tider, samma länder i historiken.
  Fyra fel som fanns redan innan hittades på vägen och rättades: fyra
  ordboksfraser påstod mottagarlandet fast skanningen skedde i Nederländerna
  (7 paket läste motsägande just då), krav 4 kollade aldrig att
  ankomststegets EGEN skanning skedde i Sverige, spårningens tester låg
  utanför `npm test`, och skedenas antal och etiketter var helt opinnade — en
  felaktig hopslagning 5→4 gav 115/115 grönt. Nu 127 tester, varav 11 nya i
  `test/standardvy.test.mjs`.
  ⚠️ Kvar att bestämma: om "Ute för leverans" ska vara en egen rad. Skedet
  saknas hos 191 av 204 paket och står då grått mitt i kedjan. Konstanten
  `UTKORNING_EGEN_RAD` i `sida.mjs` bär båda varianterna tills Axel valt.

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
