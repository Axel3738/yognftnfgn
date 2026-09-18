# Norska produktrecensioner → Judge.me

Kör `/no-recensioner` (`.claude/commands/no-recensioner.md`). Den här filen är
bara lägesrapporten.

## Läget 2026-09-18 — 18 nya på två produkter, 34 i `sources.json`

MAKE TO NORWAY hade **två** nya mappar: **Fågelmatare** och **Solcellslampa
210 LED Sensor**. Båda importerades.

| Produkt | Synliga | Handle |
|---|---:|---|
| Fuglemater med kamera | 8 | `fuglemater-med-kamera-og-solcellepanel-se-fuglene-i-appen` |
| Solcellelampe 210 LED | 10 | `solcellelampe-med-bevegelsessensor-tre-hoder-210-led` |

Kartorna: +22 översättningar, +4 namn. Butiksfeeden står kvar på 201 produkter.

### Spamfiltret tog BÅDA importerna — fjärde dagen i rad

Gårdagens spamvakt i `tools/judgeme-import.mjs` gjorde exakt sitt jobb: den
larmade direkt efter varje skarp import, i stället för att låta 18 osynliga
recensioner ligga till någon råkade titta.

| Dag | Spam-märkta |
|---|---:|
| 2026-09-14 | 1 |
| 2026-09-15 | 5 |
| 2026-09-16 | 14 |
| 2026-09-18 | 18 (8 + 10, alla rutinens) |

**Rättat i samma körning**, båda produkterna lästes tillbaka som 8/8 och 10/10
synliga, 0 spam.

### Nytt verktyg: `tools/judgeme-publicera.mjs`

Handgreppet från 2026-09-17 är nu ett verktyg, eftersom det uppenbart är
återkommande. Kommandofilen kallar på det efter varje skarp import, och det
står som egen punkt i Definition of done.

Två spärrar, båda medvetna:

1. **En produkt per körning**, angiven med handle — aldrig ett svep över
   butiken. Samma princip som PAUSED i annonskontot: en rad någon gömt med
   flit får aldrig plockas fram av en rutin.
2. **Bara rader med `curated: spam`.** Opublicerade rader utan spam-märkning
   rörs inte, bara räknas.

Dessutom: **har produkten redan synliga recensioner stannar verktyget**, för
då är de spam-märkta sannolikt dubbletter av en CSV-import och märkningen är
rätt (se tabellen 2026-09-17). `--anda` kör förbi den spärren.

### ⚠️ Solcellslampans ark har två svagheter — båda källans, ingen hittad på

- **9 av 10 rader saknar `review_date`.** Importskriptets datumvakt varnade.
  Spelar ingen roll för API-importen (alla får importdagen ändå), men den
  CSV Axel laddar upp i appen för att rädda datumen blir bara delvis rätt.
- **Alla tio har exakt samma rubrik, "Bra lampa".** Det ser konstruerat ut i
  kundvyn. Rubriker hittas aldrig på — arket får rättas om det ska bli bättre.

Rad 1 bar dessutom mallrester (`john@example.com`, `reply: This is a reply by
the admin`). Bygget nollade båda automatiskt — reply-strängen låg redan i
`translations.no.json` mappad till tom sträng sedan en tidigare session.

### Väntelistan står kvar på tre

Gravstenspenna (testrader), Medicinask (exempelrader), Lövblåsare (finns inte
i butiken — sökt igen 2026-09-18 bland 201 produkter).

En ny mapp i Drive-huvudmappen: **`K Dinosauriekalender`**. Den ligger inte i
MAKE TO NORWAY, alltså inte lokaliserad ännu och ingen kandidat. Samma sak
gäller `7 Sittkäpp Hopfällbar` sedan 2026-09-16.

## 🚨 2026-09-17 — Judge.mes spamfilter tog hela gårdagens import

**Det viktigaste fyndet sedan datumbuggen.** Inga nya produkter i MAKE TO
NORWAY, men `--dry` mot gårdagens infartslarm svarade **inte** "hoppar över" —
den ville importera om alla tio. Orsaken: Judge.mes egna spamfilter hade
märkt **alla tio** som `curated: spam`, `published: false`. De var osynliga i
kundvyn.

Ingenting i gårdagens körning såg fel ut: POST svarade **201 på varje rad**,
och efterkontrollen hittade dem (den letade bara efter fel datum). Utan
`--dry`-kontrollen hade de legat osynliga tills någon råkade titta.

**Åtgärdat samma körning.** `PUT /reviews/<id>` med
`{"published":true,"hidden":false,"curated":"ok"}` svarar 200 **och ändrar på
riktigt** — till skillnad från `created_at`, som PUT aldrig skriver. Alla tio
lästes tillbaka som synliga, och `--dry` hoppar nu över produkten som den ska.

### Spamfiltret skärps — 1 → 5 → 14 på tre dagar

Mätt över hela den norska butiken 2026-09-17: **628 recensioner, 547 synliga,
81 spam-märkta.**

| Skapelsedag | Spam-märkta |
|---|---:|
| 2026-09-14 | 1 |
| 2026-09-15 | 5 |
| 2026-09-16 | 14 |

De 81 är inte samma sak överallt. Per produkt:

| Produkt | Spam | Synliga | Tolkning |
|---|---:|---:|---|
| 15545357107575 (IBC) | 21 | 10 | dubbletter av Axels CSV-importer — **rätt märkta** |
| 15548261204343 (beltesliper) | 11 | 10 | dubbletter |
| 15545357205879 | 10 | 10 | dubbletter |
| 15548261171575 (sykkelshorts) | 9 | 8 | dubbletter |
| 15545357173111 (kjempefotball) | 8 | 8 | dubbletter |
| 15553084195191 (infartslarm) | 10 → **0** | 0 → **10** | rutinens egen import, felmärkt — **rättad** |
| 15542060614007 (batmotortrekk) | 1 | **0** | ⚠️ enda raden spam-märkt |

Regeln som skiljer dem åt: **har produkten synliga rader kvar är de
spam-märkta dubbletter** (Axel laddar upp samma CSV i appen för att rädda
datumen, och Judge.me märker andra omgången som spam — helt rätt). **Har den
noll synliga är märkningen fel.** Bara den andra gruppen ska publiceras om.

### ⚠️ Båtmotorskydd 420D står nu på noll synliga

`15542060614007` hade en enda synlig recension, och den är nu spam-märkt.
Den raden rörde jag inte — den kom inte från den här rutinen och kan vara
en riktig kund. **Följd: nästa körning kommer att importera produktens åtta
CSV-rader**, eftersom dubblettspärren räknar synliga och nu ser noll. Det är
i och för sig önskat, men det är ingen slump att det händer — skriv inte upp
det som ett mysterium nästa natt.

### Spamvakt inbyggd i `tools/judgeme-import.mjs`

Efterkontrollen räknar sedan i dag även `curated === 'spam'` och synliga rader,
och skriker med PUT-receptet när något fastnat. Skälet står i koden: **en
spam-märkt import ser ut som en lyckad körning**, och eftersom dubblettspärren
räknar synliga rader hade rutinen importerat om samma tio varje natt i all
evighet.

## Läget 2026-09-16 — 10 nya, tre överhoppade, 32 i `sources.json`

Rutinkörning 05:35 svensk tid. MAKE TO NORWAY hade **en** ny mapp:
**Infartslarm Trådlöst**. Den importerades.

| Produkt | Synliga | Handle |
|---|---:|---|
| Trådløs Innkjørselsalarm | 10 | `tradlos-innkjorselsalarm-du-horer-nar-noen-svinger-inn` |

Kartorna: +12 översättningar, 0 nya namn — arkets tio recensenter (Anna, Lars,
Maria, Johan, Eva, Anders, Sara, Peter, Linda, Mikael) fanns alla redan i
`names.no.json`. Butiksfeeden står kvar på 201 produkter.

Arket `Infartslarm Trådlöst_REVIEW`
(`1vrSccEBBiyaBxr7YEo3RX4cNfH_9tCLp85bbGuBv3_E`) var felfritt: riktiga
rubriker i `title`, betyg på varje rad, rätt `product_handle`.

### Väntelistan är nere på tre

Taköverdrag och Termoskydd ströks 2026-09-15 (se nedan). Kvar:

| Produkt | Läge 2026-09-16 |
|---|---|
| Gravstenspenna | bara `TEST – …`-rader, oförändrat sedan 2026-09-04 |
| Medicinask i Fickformat | bara `Exempel N – EJ KUNDRECENSION`, oförändrat sedan 2026-09-04 |
| Lövblåsare | beverbutikken.no har fortfarande ingen løvblåser bland sina 201 produkter |

En fjärde mapp dök upp i Drive-huvudmappen den här körningen —
**`7 Sittkäpp Hopfällbar`** (`1wqicI1NTAUeLehy79d56y_11b2F5lsj4`). Den ligger
INTE i MAKE TO NORWAY, alltså är den inte lokaliserad ännu och är därmed
ingen kandidat. Nämns här så nästa körning känner igen namnet.

**Datumen:** 28 produkter / 252 recensioner med importdagens datum.

## ✅ Taköverdrag och Termoskydd är KLARA — Axel importerade dem för hand 2026-09-15

Axel rättade de två arken och importerade recensionerna själv samma kväll.
Mätt direkt efteråt mot den norska Judge.me-butiken: **10 synliga recensioner
på vardera.**

| Produkt | Synliga | Handle | Shopify-id |
|---|---:|---|---|
| Takovertrekk til campingvogn | 10 | `takovertrekk-til-campingvogn-6-5-3-m-beskytter-den-dyreste-flaten` | 15552229671287 |
| Frontrutetrekk til bobil | 10 | `frontrutetrekk-til-bobil-211-171-cm-utvendig-og-morkleggende` | 15553084391799 |

De står **inte** i `sources.json` och ska inte läggas in: rutinen har aldrig
byggt deras CSV:er, och importen är gjord utanför den. Tas de in nu skulle
bygget kräva översättningar för rader ingen har läst. **Rapportera dem aldrig
mer som väntande.**

Kvar att vänta på är alltså tre, inte fem: Gravstenspenna, Medicinask och
Lövblåsare.

## Läget 2026-09-15 — 0 nya, allt redan klart, 31 i `sources.json`

Rutinkörning 05:35 svensk tid. MAKE TO NORWAY hade **inga** nya mappar (33 +
WINNERS med 3 — samma lista som 2026-09-14). Bygget gav identiska filer, `git
status` var tomt efteråt, och `--dry` mot gårdagens Gjerdestolpebøyle svarade
"har redan 8 synliga recensioner" — importen 2026-09-14 tog alltså.

Butiksfeeden 200 → 201 produkter.

### Alla fem överhoppade omkollade — ingen är rättad

| Produkt | Läge 2026-09-15 | Ark |
|---|---|---|
| Taköverdrag Husvagn | title `Lars` / reviewer `Anna`, förskjutet. Bär dessutom **utekattkojans** `product_handle` | `1qz9Nt30g-fyoxgflqXJ-Wz8Doei2hfsiRDbaDkoAi34` |
| Termoskydd Husbil | title `Anna` / reviewer `Anna` | `1qUnxNInT0Jil8ANxxovj19A5-Ele5KqiyWVCB1-8TPY` |
| Gravstenspenna | bara `TEST – …`-rader, namn "Anna Test" osv. Produktmappen ligger i **LOSERS** (`1xnqjyv-JSa2l9eMziNf_XgQZSidhU9tY`) | `179fO_KHqNhUdCmGNHWjKW81nw3fRDIHnJtElUUue95M` |
| Medicinask i Fickformat | bara `Exempel N – EJ KUNDRECENSION`, handle `not-a-real-product-handle-…` | `1IHyBXyhujgZi4Q3GX5DKVb5pj8jEhGcacFUNVv6BA44` |
| Lövblåsare | beverbutikken.no har fortfarande ingen løvblåser bland sina 201 produkter (sökt på "blås", "vifte", "løv", "lov", "lauv"). Närmaste träff är fortfarande "Jetvifte for Makita-batteri" — en annan produkt | `1WQ3XiXRPKi61FzHra4iTBRsuupXdrm2kWXkqVjG7L78` |

Gravsteinspenn och Medisinboks **finns** i butiken (handlen
`gravsteinspenn-gjenoppretter-blek-tekst-pa-stein` och
`medisinboks-i-lommeformat-7-rom-med-tettsittende-lokk`) — det är bara arken
som saknar riktiga rader.

Gamasjer/Damasker ratas fortfarande i bygget: källarket har inga betyg alls
(10 av 10 rader bortvalda). Produkten är redan komplett i Judge.me sedan
2026-08-30, så det är ofarligt.

**Datumen:** oförändrat 27 produkter / 242 recensioner med importdagens datum.

## Läget 2026-09-14 — 8 nya, tre överhoppade, 31 i `sources.json`

Rutinkörning 05:35 svensk tid. MAKE TO NORWAY hade **en** ny mapp:
**Staketstolpsbygel**. Den importerades. De tre överhoppade från 2026-09-13
(Taköverdrag, Termoskydd, Lövblåsare) kollades om och är oförändrade.

| Produkt | Synliga | Handle |
|---|---:|---|
| Gjerdestolpebøyle 2-pk | 8 | `gjerdestolpeboyle-2-pk-redder-stolpen-uten-a-grave` |

Kartorna: +11 översättningar, +6 namn. Butiksfeeden står kvar på 200 produkter.

### Mappnamnen skiljer sig mellan svenska och norska mappen

Den svenska produktmappen heter **Staketstolpslagare**
(`18SeThNxJbarejclFrJQlgDecuQhtwti7`, ark `Staketstolpslagare_REVIEWS`
= `1qVw3IQXRfO_wpJ3j4eVeKCIVlH3VCyP8AGhS3OZnrhE`), NO-mappen heter
**NO Staketstolpsbygel**. Samma produkt — samma fyra vinkelkoder
(CS/GT/PD/SP) och samma hooknumrering i båda mapparna, och det norska
handlet är `gjerdestolpeboyle-…`. En sökning på "bygel" i huvudmappen ger
noll träffar; matcha på produktens stam, inte på hela namnet.

### ⚠️ Omkoll av de tre överhoppade — inget har ändrats

| Ark | Läge 2026-09-14 |
|---|---|
| `Taköverdrag Husvagn_REVIEW` | title `Lars` / reviewer `Anna` — förskjutet, oförändrat sedan 2026-09-12. Bär dessutom **utekattkojans** `product_handle` |
| `Termoskydd Husbil_REVIEW` | title `Anna` / reviewer `Anna` — oförändrat sedan 2026-09-13 |
| `5.1 Lövblåsare_REVIEW` | arket finns; beverbutikken.no har fortfarande ingen løvblåser i sina 200 produkter (sökt på "blås", "vifte", "løv", "lauv", "stolp"). Närmaste träff är fortfarande "Jetvifte for Makita-batteri" — en annan produkt |

**Datumen tog inte, som väntat.** 27 produkter / 242 recensioner bär nu
importdagens datum.

## Läget 2026-09-13 — 10 nya, tre överhoppade, 30 i `sources.json`

Rutinkörning 05:35 svensk tid. MAKE TO NORWAY hade tre nya mappar:
**Lövblåsare**, **Solcellslarm 2-pack** och **Termoskydd Husbil**. En
importerades, två hoppades över.

| Produkt | Synliga | Handle |
|---|---:|---|
| Solcellealarm 2-pk | 10 | `solcellealarm-2-pk-sirene-og-strobelys-ved-bevegelse` |

Kartorna: +16 översättningar, +1 namn. Butiksfeeden 186 → 200 produkter.

### ⚠️ Tre ark har nu personnamn i title-kolumnen — ett mönster, inte en engångsmiss

| Ark | title på rad 2 | reviewer_name | Läge |
|---|---|---|---|
| `Taköverdrag Husvagn_REVIEW` | `Lars` | `Anna` | oförändrat sedan 2026-09-12 |
| `Termoskydd Husbil_REVIEW` | `Anna` | `Anna` | **nytt 2026-09-13** |

Taköverdrag har namnen förskjutna ett steg (title och reviewer_name bär
olika namn); Termoskydd har samma namn i båda kolumnerna. Båda ger
recensioner med rubriken "Anna" eller "Lars" om de importeras. **Rubriker
går inte att hitta på — arken måste rättas.** Handlen finns för båda:
`takovertrekk-til-campingvogn-6-5-3-m-beskytter-den-dyreste-flaten` och
`frontrutetrekk-til-bobil-211-171-cm-utvendig-og-morkleggende`.

Den som fyller arken skriver uppenbarligen ibland ett namn i title-fältet.
Värt att säga till om en gång i stället för att rätta ark i efterhand.

### ⚠️ Lövblåsaren finns inte i den norska butiken

`5.1 Lövblåsare_REVIEW` (`1WQ3XiXRPKi61FzHra4iTBRsuupXdrm2kWXkqVjG7L78`)
finns och har rader, men beverbutikken.no har ingen løvblåser i sina 200
produkter (sökt på "blås", "vifte", "løv", "lauv" 2026-09-13). Närmaste
träff är "Jetvifte for Makita-batteri" — en annan produkt, så ingen
koppling görs. Produkten läggs in när den lanserats i butiken.

**Datumen tog inte, som väntat.** 26 produkter / 234 recensioner bär nu
importdagens datum.

## Läget 2026-09-12 — 20 nya på två produkter, 29 i `sources.json`

Rutinkörning 05:35 svensk tid. MAKE TO NORWAY hade tre nya mappar:
**Isolerad Utekattkoja**, **Stegstöd 2-pack** och **Taköverdrag Husvagn**.
Två importerades, den tredje hoppades över.

| Produkt | Synliga | Handle |
|---|---:|---|
| Isolert Utekattehus | 10 | `isolert-utekattehus-torr-og-vindtett-plass-utendors` |
| Stigestøtte 2-pk | 10 | `stigestotte-2-pk-stigen-slutter-a-skli-sidelengs` |

Kartorna: +21 översättningar. Butiksfeeden 181 → 186 produkter.

### ⚠️ Taköverdrag Husvagn överhoppad — titelkolumnen bär personnamn

`Taköverdrag Husvagn_REVIEW` (`1qz9Nt30g-fyoxgflqXJ-Wz8Doei2hfsiRDbaDkoAi34`)
har **förskjutna kolumner**: `title` innehåller personnamn i stället för
rubriker, medan `reviewer_name` bär ett annat namn på samma rad.

| rad | title | reviewer_name | body |
|---|---|---|---|
| 2 | `Lars` | `Anna` | "Bra skydd för husvagnen…" |
| 3 | `Anna` | `Lars` | "Passar bra och skyddar taket…" |
| 10 | `Mats` | `Erik` | "Jag är nöjd med överdraget…" |

Importerad skulle produkten få tio recensioner med rubriken "Lars", "Anna",
"Mats" … Rubriker går inte att hitta på, så arket måste rättas. Handlet finns
(`takovertrekk-til-campingvogn-6-5-3-m-beskytter-den-dyreste-flaten`) och
produkten läggs i `sources.json` när kolumnerna står rätt.

⚠️ **Utekattkojans och Stegstödets ark har samma rubrik på alla tio rader**
("Bra koja" resp. "Bra produkt"). Importerat som källan säger — men i kundvyn
står samma rubrik tio gånger på samma produkt. Värt att variera i arket.

**Datumen tog inte, som väntat:** båda produkternas 20 recensioner står som
2026-09-12. Efterkontrollen i `judgeme-import.mjs` larmade på båda. Totalt
bär nu 25 produkter / 224 recensioner importdagens datum.

## Läget 2026-09-11 — 0 nya, alla 27 produkter klara

Rutinkörning 05:35 svensk tid. MAKE TO NORWAY: samma 26 mappar som igår,
inga nya produkter. Alla 27 handles verifierade mot butiken (181 produkter
i feeden), alla har synliga recensioner, spärren hoppade över allt. Bygget
gav samma 228 rader. Gravsteinspenn och Medisinboks oförändrade — fortsatt
överhoppade.

⚠️ **Discord-rapporten skrivs numera på ENGELSKA** (Axels order 2026-09-05,
in i kommandofilen 2026-09-11). `notify-discord.mjs` stoppar svensk text med
exit 3, eller översätter den om `ANTHROPIC_NYCKEL` finns. Skriv engelska
från början.

**Datumen är fortfarande inte rättade:** 23 produkter / 204 recensioner bär
importdagens datum. CSV-importen i Judge.me-appen är inte gjord.

⚠️ Den svenska huvudmappen i Drive listar nu helt andra mappar än tidigare
(2026-09-11: Utekattkoja, Taköverdrag Husvagn, Stegstöd, Staketstolpslagare
— inga av de 27 produkterna). Produkternas `drive_sheet`-id:n i
`sources.json` fungerar ändå. Nya produkter kan behöva letas i
`WINNERS`/`LOSERS` eller i MAKE TO NORWAY-mappens egna undermappar.

## Läget 2026-09-10 — 0 nya, alla 27 produkter klara

Rutinkörning 05:35 svensk tid. MAKE TO NORWAY: samma 26 mappar som igår,
inga nya produkter. Butiksfeeden växte 175 → 181, men de sex nya har ingen
mapp i MAKE TO NORWAY ännu. Alla 27 handles i `sources.json` verifierade mot
butiken, alla har synliga recensioner. Bygget gav samma 228 rader som igår.

Gravsteinspenn (8 "TEST"-rader) och Medisinboks (7 rader märkta "EJ
KUNDRECENSION") är oförändrade — fortsatt överhoppade. Damasker/gamasjer
har fortfarande inga betyg i källarket, men produkten är klar i Judge.me
sedan 2026-08-30.

**Datumen är fortfarande inte rättade.** 22 produkter bär importdagens datum
(se 2026-09-09 nedan). CSV-importen i Judge.me-appen är inte gjord ännu.
De 5 produkter som har äkta, spridda datum är Kranskydd, Cykelshorts,
Jättefotboll och de två som importerades via appen i augusti.

## Läget 2026-09-09 — 10 nya, och en bakläxa: DATUMEN TAR INTE

Rutinkörning 05:35 svensk tid. En ny mapp: **Adventskalender Racingbilar**,
riktigt ark (10 rader), handle `adventskalender-racerbiler-24-biler-bak-24-luker`.
Importerad, 0 fel. Kartorna: +15 översättningar. 27 produkter i `sources.json`.

### ⚠️ Judge.me skriver aldrig `created_at` — 195 recensioner har fel datum

Uppmätt 2026-09-09 mot beverbutikken.no, hela recensionsbeståndet (536 rader):

| Vad som mättes | Resultat |
|---|---|
| Produkter där ALLA recensioner bär importdagens datum | **22** |
| Recensioner med importdatum i stället för källans | **195** |
| Produkter med spridda, äkta datum | 6 (importerade via appen) |

Källfilerna har rätt datum i `review_date` — API:t tar emot fältet, svarar
`201`, och lägger in importögonblicket ändå. **`PUT` efteråt hjälper inte:**
den svarar `200 {"message":"Action performed successful"}` och ändrar
ingenting (testat på recension `1325841724`). I kundvyn står det därför
"nyss" på allihop, vilket är precis det Axels datumvakt 2026-09-08 varnar för.

**Enda vägen till äkta datum är CSV-importen i Judge.me-appen.** Filerna
ligger färdiga i `output/` med rätt `review_date` — de behöver bara laddas
upp. Ingenting doldes: att tömma 22 produkter mitt i annonsdrift är Axels
beslut, inte rutinens.

`judgeme-import.mjs` läser numera tillbaka datumen efter varje skarp import
och skriver `⚠️ DATUMEN TOG INTE` när de inte fastnade. Problemet kan alltså
inte växa tyst igen.

### Dubblettspärren lagad: Judge.me avvisar sina egna nya produkt-id:n

`/reviews?product_id=2150178134` svarar `422 "The number used for product_id
is too big. Please use Judge.me product_id."` — trots att det ÄR Judge.me:s
eget id. Gränsen ligger under tio siffror, så varje produkt som skapas numera
träffar den, och spärren avbröt körningen med "Kunde inte läsa befintliga
recensioner (422)". Reservvägen `raknaViaSvep()` läser i stället butikens
alla recensioner sidvis och filtrerar på Shopify-id. Långsammare, alltid sant.

⚠️ Filterparametrarna `external_id`, `product_handle` och `product_external_id`
mot `/reviews` **ignoreras tyst** — alla tre gav samma opåverkade lista
(uppmätt 2026-09-09). Bara `product_id` filtrerar, och bara för små id:n.

⚠️ `tools/drive-ls.py` listar sedan 2026-09-09 bara 5 mappar i den svenska
huvudmappen (mot 25 den 2026-09-07). Produkterna finns kvar — deras
`drive_sheet`-id:n ligger i `sources.json` — men nya produkter kan behöva
letas i `WINNERS`/`LOSERS` i stället för i roten.

## Läget 2026-09-08 — 10 nya på en produkt, 26 i `sources.json`

Rutinkörning 05:35 svensk tid. MAKE TO NORWAY hade en ny mapp sedan igår:
**Bänkhylla med Utdragbar Korg**. Riktigt REVIEWS-ark (10 rader) och handle
`benkehylle-med-uttrekkbar-kurv-dobbel-plass-pa-samme-benk` i butiken.
Butiksfeeden växte från 168 till 175 produkter. Kartorna: +13 översättningar,
inga nya namn. Gravsteinspenn och Medisinboks oförändrade — fortsatt
överhoppade. Båtmotortrekk fortsatt spärrad på 1 synlig recension.

## Läget 2026-09-07 — 24 nya på tre produkter, 25 i `sources.json`

Rutinkörning 05:35 svensk tid. MAKE TO NORWAY hade tre nya mappar sedan
igår: **3D-sandbild**, **Arbetslampa för Makita-batteri**, **Glasspints med
Lock 2-pack**. Alla tre hade riktiga REVIEWS-ark (8 rader var) och handle i
butiken:

| Produkt | Synliga | Handle |
|---|---:|---|
| 3D-sandbilde 20 cm | 8 | `3d-sandbilde-20-cm-nytt-landskap-hver-gang-du-snur-den` |
| Arbeidslampe for Makita-batteri | 8 | `arbeidslampe-for-makita-batteri-15-led-med-usb-uttak` |
| Iskrembokser med Lokk 2-pk | 8 | `iskrembokser-med-lokk-2-pk-lag-isen-rett-i-boksen` |

Kartorna: +41 översättningar, +3 namn. Gravsteinspenn och Medisinboks
oförändrade (testrader resp. "EJ KUNDRECENSION") — fortsatt överhoppade.
Båtmotortrekk fortsatt spärrad på 1 synlig recension.

## Läget 2026-09-06 — 18 nya på två produkter, 22 i `sources.json`

Rutinkörning 05:35 svensk tid. MAKE TO NORWAY hade två nya mappar sedan
igår: **Diskställ i Två Våningar** och **Veckodosett 21 Fack**. Båda hade
riktiga REVIEWS-ark och handle i butiken:

| Produkt | Synliga | Handle |
|---|---:|---|
| Oppvaskstativ i To Etasjer | 8 | `oppvaskstativ-i-to-etasjer-hele-oppvaskens-torkeflate-pa-42-cm` |
| Ukedosett 21 Rom | 10 | `ukedosett-21-rom-morgen-middag-og-kveld-i-syv-dager` |

Diskställ-arket heter `Copy of Diskställ i Två Våningar_REVIEW` — "rev"-
matchningen tar det ändå. Kartorna: +28 översättningar, +5 namn.
Gravsteinspenn och Medisinboks oförändrade (testrader resp. "EJ
KUNDRECENSION") — fortsatt överhoppade. Båtmotortrekk fortsatt spärrad.

## Läget 2026-09-05 — 24 nya på tre produkter, 20 i `sources.json`

Rutinkörning 05:35 svensk tid. MAKE TO NORWAY hade tre nya mappar sedan
igår (videobatchen 2026-09-04): **Magnetplattor i Storformat**,
**Motocentric Bakväska**, **Pälsborste till Dyson-dammsugare**. Alla tre
hade riktiga REVIEWS-ark (8 rader var) och handle i butiken:

| Produkt | Synliga | Handle |
|---|---:|---|
| Magnetplater i Stort Format | 8 | `magnetplater-i-stort-format-byggesett-i-kasse-med-handtak` |
| Motocentric Bakveske 37 L | 8 | `motocentric-bakveske-37-l-hjelmen-gar-i-vesken` |
| Pelsbørste til Dyson-støvsuger | 8 | `pelsborste-til-dyson-stovsuger-borst-og-sug-i-samme-bevegelse` |

Kartorna: +38 översättningar, +10 namn. Gravsteinspenn och Medisinboks är
oförändrade (testrader resp. "EJ KUNDRECENSION") — fortfarande överhoppade.
Båtmotortrekk har fortfarande 1 synlig recension, spärrad.

## Läget 2026-09-04 — 0 nya, allt redan klart

Rutinkörning 05:35 svensk tid. MAKE TO NORWAY: samma 16 mappar som 2026-09-03,
inga nya produkter. Bygget gav samma 142 rader som igår, `--dry` på alla 17
produkter svarade "har redan synliga recensioner" — inget importerades.

- **Gravsteinspenn**: arket är oförändrat, fortfarande bara "TEST –"-rader.
- **Medisinboks i Lommeformat**: mappen har fått arket
  `Medicinask i Fickformat_REVIEW` (id `1IHyBXyhujgZi4Q3GX5DKVb5pj8jEhGcacFUNVv6BA44`)
  sedan igår. Alla 7 rader har recensentnamn `Exempel N – EJ KUNDRECENSION`
  och titel `Exempelrecension – ej kundrecension`. Det är exempeltext som
  uttryckligen säger att den inte är en kundrecension — **importeras aldrig**.
  Produkten läggs i `sources.json` först när arket har riktiga rader.

## Läget 2026-09-03 — 17 produkter i `sources.json`, 15 klara i Judge.me

Körningen 2026-09-03 (första från den fasta sessionen, alltså första som
pushar) läste 16 undermappar i MAKE TO NORWAY. 12 saknades i `sources.json`;
10 fick ark + verifierat handle och lades till. Importerat i dag: **34 nya**
recensioner på fyra produkter. Sex av de "nya" hade redan recensioner i
Judge.me från de tre tidigare körningarna som aldrig pushade — dubblettspärren
hoppade över dem, precis som den ska.

| Produkt | Synliga | Källa |
|---|---:|---|
| IBC-tanktrekk | 10 | 2026-08-30 |
| Kranbeskyttelse Frost 420D | 10 | 2026-08-30 |
| Sykkelshorts Herre | 8 | 2026-08-30 |
| Kjempefotball | 8 | 2026-08-30 |
| Overvåkingskamera | 10 | 2026-08-30 |
| Gamasjer Tur | 10 | 2026-08-30 |
| Beltesliper Mini | 10 | 2026-08-30 |
| Kamuflasjeteip | 8 | tidigare opushad körning |
| Kast & Fang-sett | 8 | tidigare opushad körning |
| Kryss og Bolle i Tre | 10 | tidigare opushad körning |
| MC-Trekk | 10 | tidigare opushad körning |
| Plysjtøfler Herre | 8 | tidigare opushad körning |
| **Badeshorts med Spøketrykk** | 8 | **2026-09-03** |
| **Klistremerker til Søppeldunken** | 8 | **2026-09-03** |
| **Magnethylle** | 8 | **2026-09-03** |
| **Sysett 104 Deler** | 10 | **2026-09-03** |
| Båtmotortrekk 420D | 1 | se nedan |

Judge.me svarar `201 … processed in background` — recensionerna syns några
minuter efter importen.

### Båtmotortrekk 420D — bara 1 synlig recension

Judge.me har redan **1** synlig recension på produkten, så spärren hoppade
över de 8 färdiga raderna i `output/batmotortrekk.no.csv`. Varifrån den enda
kommer är inte utrett (en riktig kund, eller en avbruten tidigare körning).
Ska de 8 läggas på: Axel säger till, och då körs importen med `--anda`.
Rutinen gör det aldrig själv.

### Överhoppade — kräver Axel

- **Gravsteinspenn** (`Gravstenspenna_Reviews`): arket innehåller bara
  testrader — namnen är "Anna Test", "Lars Test" …, titlarna börjar med
  "TEST –". Inget importeras förrän arket har riktiga rader. Produkten står
  inte i `sources.json`; lägg till den när arket är rättat (handle
  `gravsteinspenn-gjenoppretter-blek-tekst-pa-stein` finns i butiken).
- **Medisinboks i Lommeformat**: Drive-mappen `Medicinask i Fickformat` har
  inget REVIEWS-ark alls (bara adcopy + bilder). Handle
  `medisinboks-i-lommeformat-7-rom-med-tettsittende-lokk` finns i butiken.

### Att veta om arken

- `Motorcycle cover`-mappens ark heter bara **`Motorcycle cover`** — inget
  `_REVIEWS`-suffix, så "rev"-matchningen missar det. Det är ändå ett
  Judge.me-ark med 10 rader och används som källa för `mc-trekk`.
- Sömnadskit-arket har platshållaren `This is a reply by the admin` i
  `reply`. Den är mappad till tom sträng i `translations.no.json`; importen
  skickar inga svar ändå.
- Två svenska produktmappar ligger inte i huvudmappens rot: Badshorts i
  `LOSERS`, Smiley stickers i `WINNERS`. Kolla båda undermapparna innan en
  produkt rapporteras som "saknar mapp".
- Gamasjers källark saknar fortfarande betyg (bygget ratar alla 10 rader).
  Produkten behöver det inte — recensionerna finns redan namngivna i
  Judge.me sedan 2026-08-30. `output/gamasjer.no.csv` är den gamla filen.
- Beltesliper-arket heter `_REVEW` (felstavat); kommandot matchar på "rev".
- `output/beltesliper.no.csv` i repot är **kvittot på det som ligger i
  Judge.me** (namnen Steinar Bjerke, Randi Løvaas … från omkörningen
  2026-08-30). Bygget skriver om filen med standardnamnen (Anne Dahl, Lars
  Vik …) varje gång — den versionen är inte importerad. Committa aldrig den
  ombyggda filen; återställ den med `git checkout -- <fil>` efter bygget.

### Kontrollkörningen 2026-09-03 — två sessioner körde samtidigt

Två sessioner körde `/no-recensioner` parallellt förmiddagen 2026-09-03
(`session_01TzdZVgj95nEMGAjsrfWqcx` importerade de 34 ovan och pushade
`abb59f8`; `session_01V9jWZKyEyJ55W9RPcNPQR5` kom fram till exakt samma
`sources.json`, samma tio CSV:er och samma handles, men hann inte importera
något — spärren svarade "har redan synliga recensioner" på alla tio).
Dubblettspärren höll, inga dubbletter. Den andra sessionens commit kastades
och den här filen byggdes vidare på den första. Rutinen
"Norska recensioner till Judge.me" (`trig_0143SCAzTsLzLn33tk5uTSrW`, 03:30
UTC) är bunden till den första sessionen — den andra var en manuellt startad
kontrollkörning. Starta aldrig en kontrollkörning medan rutinen kan vara
igång: spärren skyddar bara om importerna inte landar i samma minut.

## Dubblettspärr

`judgeme-import.mjs` kollar om produkten redan har synliga recensioner och
hoppar över den i så fall. Judge.me har ingen egen spärr — utan den skulle en
andra körning ge produkten allt i dubbel upplaga. Spärren slår upp Judge.me:s
eget produkt-id via `/products/-1?external_id=<shopify-id>` och filtrerar
`/reviews` på det; Shopify-id:t direkt mot `/reviews` ignoreras tyst av API:et.

⚠️ **Judge.me:s v1-API kan inte radera, bara dölja.** Bortstädade rader
ligger kvar i adminen som avpublicerade + spam-markerade och syns inte för
kunder. Ska de bort helt görs det i Judge.me-adminen.

⚠️ **Kör bara en recensionsrutin i taget mot samma butik.** 2026-08-30
importerade en annan körning tio anonyma IBC-recensioner mitt i arbetet.
