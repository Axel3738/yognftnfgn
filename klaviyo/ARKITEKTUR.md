# Klaviyo-motorn: kontraktet mellan delarna

Skrivet 2026-09-24 av huvudsessionen innan bygget. Varje del (klient, byggare,
uppladdare, rapport, innehåll, SOP:er) följer exakt de format som står här. Ändras
ett format: ändra här först, sedan koden.

Källor för allt om Klaviyos API: OpenAPI-specen `2026-07-15`
(https://raw.githubusercontent.com/klaviyo/openapi/main/openapi/stable.json, läst
2026-09-24) och developers.klaviyo.com. Inget är provat mot ett riktigt konto än,
för ingen nyckel fanns 2026-09-24. Allt som bara går att mäta med nyckel står under
"Obekräftat" längst ner, och `kolla.mjs` mäter det först av allt.

## Järnregler (sitter i koden, inte bara här)

1. **Allt skapas som utkast.** Mallar, segment, kampanjer (status Draft, ingen
   send-job) och flöden (`status: draft` på varje action). Motorn skickar aldrig
   och sätter aldrig `live`. Ett utskick är Axels beslut, eller VA:ns klick efter
   hans ok. `ladda-upp.mjs` kör `--torr` som standard; skarpt kräver `--skarpt`.
2. **Samtycke:** varje segment som en KAMPANJ får gå till måste innehålla
   villkoret `profile-marketing-consent` med `consent_status.subscription =
   "subscribed"`. Samma villkor ligger i varje marknadsflödes `profile_filter`.
   Uppladdaren vägrar ett kampanjsegment utan villkoret. Skäl: marknadsföringslagen
   19 §, och `"any"` släpper in de som aldrig prenumererat (mätt i specen).
3. **Idempotens:** allt slås upp på exakt namn innan det skapas. Finns namnet:
   hoppa över (mallar och kampanjer i utkastläge får uppdateras med `--uppdatera`).
   Dygnstak: flöden och segment 100/dygn, bilder 100/dygn, rapporter 225/dygn.
4. **Mallar utan avregistrering stoppas.** Varje mall måste bära `{% unsubscribe %}`
   (eller `{% unsubscribe_link %}`) och `{{ organization.full_address }}` i sidfoten.
   MFL 20 § kräver en adress för avregistrering i varje reklammejl.
5. **Metriker slås upp på namn i kontot, aldrig hårdkodat id.** Kassametriken kan
   heta `Started Checkout` eller `Checkout Started`; båda namnen provas. Mer än en
   träff eller ingen träff = stopp med orsak.
6. **Priset kommer ur Shopify vid varje bygge.** Innehållsfilerna bär aldrig ett
   pris i klartext. En siffra med "kr" i copyn som inte är produktens pris eller
   jämförpris just nu stoppar bygget (samma idé som `/notionkorning`s prisspärr).
7. **Copyn följer `docs/copy-regler.md`.** Inga tankstreck (—, –) i kundtext.
   "14 dagars ångerrätt", aldrig "30 dagars öppet köp", aldrig "garanti" ensamt.
   Leverans skrivs "5-10 arbetsdagar". Ingen Grillkliniken/Mastern/SnarkLös. Ingen
   falsk brådska ("bara idag", "sista chansen", "priset går upp") utan riktig orsak
   i `taggar.urgency`.
8. **Butiker blandas aldrig.** Allt är per brand (`brands/<id>.json`). Nyckeln för
   Bäverbutiken heter `KLAVIYO_API_KEY_BAVERBUTIKEN`; motorn tar aldrig en annan
   brands nyckel, och `kolla.mjs` kontrollerar att kontots `public_api_key` är
   brandets `public_id` (`QZ4jLG`) innan något skrivs.
9. **Noll npm-beroenden.** Node ≥20, ESM, inbyggd `fetch`. Klienten tar
   `fetchFn` i konstruktorn så testerna kan köra mot en falsk Klaviyo utan nät.

## Filerna

```
klaviyo/
  ARKITEKTUR.md            detta kontrakt
  README.md                för Axel och nästa session (svenska)
  brands/<id>.json         brandets inställningar (baverbutiken, matstrumpor; se nedan)
  klient.mjs               KlaviyoKlient: headers, paginering, 429, fel
  metriker.mjs             slå upp metrik-id på namn
  segment.mjs              segment som kod → Klaviyo-definition, samtyckesspärr; kategorierna per brand
  mallar.mjs               e-post-HTML ur block (byggstenar), Klaviyo-mallspråk; sidhuvud/rubrik per brand
  validera.mjs             kontroller på varje byggt mejl (copy, pris, taggar)
  produkter.mjs            produktdata ur brandets Shopify-modul + cache; reservfil bara för brandet som har en
  shopify-butik.mjs        Shopify-modul för butiker i sparning/butiker.json (Matstrumpor), samma form som mejl/shopify.mjs
  recensioner.mjs          riktiga Judge.me-recensioner för citatblock: API (Bäverbutiken) eller widget (Matstrumpor)
  bygg.mjs                 CLI: innehåll + produkter → output/<brand>/ (html, text, galleri)
  gallerier.mjs            CLI: kampanj-, flödes- och mallgalleriet (+ index.html) för Axel, telefonram per mejl
  bilder.mjs               bilderna i gallerierna: hämtas en gång, cachas, ligger en gång per sida som data-URI (artifact-visaren blockerar CDN-bilder)
  kolla.mjs                CLI: nyckel, konto, inventering (--profiler räknar samtycket) → konto/<brand>/lage.json
  ladda-upp.mjs            CLI: segment, mallar, kampanjer, flöden → Klaviyo (utkast)
  sla-pa.mjs               CLI: namngivna flöden → live, bara på Axels ord, --ja, --brand
  schemalagg.mjs           CLI: namngivna kampanjer → send-job, bara på Axels ord, --ja, --brand
  rapport.mjs              CLI: kampanj- och flödesrapporter → logg/<brand>/
  innehall/<brand>/
    BRIEFER.md             huvudsessionens briefer (strategi) — copyn skrivs ur dem
    kampanjer/<id>.json    en fil per kampanj
    floden/<id>.json       en fil per flöde
  logg/<brand>/
    kampanjlogg.md         hypotes → utfall → lärdom per utskick (feedbackloopen)
    utfall.jsonl           rådata ur rapport.mjs (en rad per utskick och körning)
  konto/<brand>/lage.json  senaste inventeringen av kontot (skrivs av kolla.mjs)
  sop/                     VA-SOP:er på engelska + README.md på svenska
  test/*.test.mjs          node:test, falsk fetch, inget nät
  output/                  gitignorerad: byggda mejl, gallerierna och bildcachen (output/<brand>/bilder/)
```

## `brands/<id>.json`

```json
{
  "id": "baverbutiken",
  "namn": "Bäverbutiken",
  "public_id": "QZ4jLG",
  "nyckel_env": ["KLAVIYO_API_KEY_BAVERBUTIKEN"],
  "shopify": { "modul": "mejl/shopify.mjs" },
  "butik_url": "https://baverbutiken.se",
  "avsandare": { "from_email": "kundsupport@baverbutiken.se", "from_label": "Bäverbutiken", "reply_to_email": "kundsupport@baverbutiken.se" },
  "stil_fran": "mejl/konfig.json#butik",
  "sprak": "sv",
  "tidszon": "Europe/Stockholm",
  "leverans_text": "5-10 arbetsdagar",
  "leverans_p90_dygn": 20,
  "angerratt_text": "14 dagars ångerrätt",
  "returfonster_fran": "kundtjanst/brands/baverbutiken.yaml#tvister.returfonster_dagar",
  "sparningssida": "https://baverbutiken.se/pages/spara",
  "erbjudande_fran": "mejl/konfig.json#erbjudande",
  "utm": { "utm_source": "klaviyo", "utm_medium": "email" }
}
```

Valfria fält per brand (införda 2026-09-25 med Matstrumpor, `brands/matstrumpor.json`).
Saknas de gäller Bäverbutikens beteende, så Bäverbutiken är oförändrad:

| Fält | Vad | Matstrumpor |
|---|---|---|
| `shopify.butik` | butikens id i `sparning/butiker.json` när modulen är `klaviyo/shopify-butik.mjs` (modulens `hamtaProdukter()` får hela `shopify`-objektet) | `matstrumpor` |
| `shopify.reserv` | reservfil med produktdata när varken Shopify eller cachen svarar. Utan fältet finns ingen reserv (utom Bäverbutikens `mejl/produkter.json`) — ett annat brands produkter används aldrig | ingen |
| `recensioner` | `{ kalla: "judgeme-api" }` (standard, delade `JUDGEME_*`-variabler), `{ kalla: "judgeme-widget", shop_domain }` (widgetens publika JSON, en fråga per produkt) eller `{ kalla: "ingen" }` | widget, `1r46tp-qx.myshopify.com` |
| `kategorier` | `{ namn: [ord…] }` för `SEG_kategori_<namn>`; utan fältet gäller `KATEGORIER` i segment.mjs (Bäverbutikens ord) | sushi, pizza, hamburgare, donut |
| `lista_nyhetsbrev` | namnet på prenumerantlistan (skapas om den saknas); standard `LISTA_nyhetsbrev` | `Email List` (Shopify-synkens lista) |
| `break_even_roas` | vinstbidraget i `rapport.mjs` = konverteringsvärde ÷ talet | 1,498 (utan moms) |
| `metrik_val` | vilket id som gäller när ett metriknamn finns två gånger | `Viewed Product: R9yPAm` |
| `erbjudande_fran: null` | brandet har inget erbjudande-block | null |

Stilen (`stil_fran`) får bära `sidhuvud_farg`, `rubrik_versaler` och `rubrik_fet`,
samma nycklar som `mejl/mallar.mjs`: Matstrumpor har vitt sidhuvud med linje under
(orange logga på transparent) och fet rubrik i gemener.

## Innehållsformatet (ett mejl)

Samma form i kampanjer och i flödessteg. Priser, bilder och länkar pekar på
produktens **handle**; byggaren hämtar resten ur Shopify.

```json
{
  "id": "k01-takoverdrag-vinterforvaring",
  "namn": "MAIL_20260929_Takoverdrag_PD_1_uppvarmning_problem_taket-du-aldrig-kollar_v1",
  "memo": "Hypotes: vad testas och varför det ska slå det vi har nu (Evolve: intent). Aldrig tomt.",
  "taggar": {
    "typ": "I",                       "_typ": "N=nytt koncept, I=iteration av annonsvinnare, IM=imitation, M=mejlspecifikt, S=säsong",
    "kalla": "egen-data",             "_kalla": "egen-data | winning-line | voc | swipe | gissning",
    "kalla_ref": "products/carashell/takskyddet/dna.md:56-58",
    "lardom": null,
    "avatar": "husvagnsägaren som ställer av för vintern",
    "begar": "slippa läckor och fukt över vintern",
    "awareness": "problem",           "_awareness": "unaware | problem | solution | product | promo",
    "urgency": "sasong",              "_urgency": "sasong | lager | pris | konsekvens | ingen",
    "confidence": "medium",           "_confidence": "high | medium | low (low = gissning)",
    "prefix": "Takoverdrag",
    "kod": "PD"
  },
  "amnesrader": [
    { "text": "…", "begar": "…" },
    { "text": "…", "begar": "…" },
    { "text": "…", "begar": "…" }
  ],
  "forhandstext": "…",
  "block": [
    { "typ": "hero", "rubrik": "…", "text": "…", "bild": "produkt:<handle>", "knapp": { "text": "…", "lank": "produkt:<handle>" } },
    { "typ": "text", "rubrik": null, "text": "…" },
    { "typ": "punkter", "rubrik": "…", "punkter": ["…", "…", "…"] },
    { "typ": "produkt", "handle": "<handle>", "text": "…", "knapp": "…" },
    { "typ": "produktrad", "rubrik": "…", "handles": ["<h1>", "<h2>", "<h3>"] },
    { "typ": "citat", "handle": "<handle>", "antal": 2 },
    { "typ": "knapp", "text": "…", "lank": "produkt:<handle> | kollektion:<handle> | sida:<path> | url:https://…" },
    { "typ": "grundare", "text": "…" },
    { "typ": "fakta" },
    { "typ": "erbjudande", "text": "…" },
    { "typ": "dynamisk", "kalla": "checkout_rader | visad_produkt | order_rader" }
  ],
  "tretest": [
    { "rad": "ämnesrad A", "visualisera": true, "falsifiera": true, "ingen_annan": true }
  ]
}
```

Mejlnivå, valfritt: `"format": "rentext"` = personligt mejl från Axel. Inget hero, inga
produktkort. Tillåtna block: `text`, `knapp` (högst en), `grundare`, `fakta`, `erbjudande`.
Byggaren ritar det som ett nästan omärkt mejl: logga liten eller ingen, brödtext, signatur.
Används där Klaviyo rekommenderar ren text (välkomst E1, efter köp E1, sunset).

Flödestrigger, valfritt: `"trigger": { "typ": "metrik", "metrik": ["Placed Order"],
"produkt_innehaller": ["Marin Motorhölje"] }` blir Klaviyos `trigger_filter`, en
`metric-property`-villkor på orderns produktnamn. Flödet startar bara för ordrar med den
produkten.

Regler för blocken:
- `text` får innehålla `{{fornamn}}` (byggaren gör om det till
  `{{ first_name|default:'' }}`) och radbrytningar `\n\n` (nytt stycke). Inget annat
  mallspråk i copyn; mallspråket är byggarens sak.
- `citat` hämtar RIKTIGA recensioner ur Judge.me för produkten (4–5 stjärnor, ordagrant,
  förnamn + initial). Finns inga: blocket försvinner och byggaren säger det. Copyn får
  aldrig hitta på en recension.
- `fakta` = butikens trygghetsrad: leverans, ångerrätt, spårningssida. Texten kommer
  ur brandfilen, aldrig ur copyn.
- `erbjudande` = det befintliga "köp igen → gratisprodukt"-erbjudandet (Axels beslut
  2026-09-13, `mejl/konfig.json → erbjudande`): minsta köp, en gratisprodukt, knapp
  till lyckohjulet `/pages/din-gratisprodukt`. Beloppet och villkoren renderas ur
  konfigen; copyn i `text` nämner aldrig ett belopp. Får bara användas mot köpare
  (erbjudandet gäller kunder med minst en order). Inga andra erbjudanden eller
  rabattkoder finns — nya är Axels beslut.
- `dynamisk` finns bara i flöden: `checkout_rader` (Checkout Started: produkterna i
  kassan + knapp tillbaka till kassan), `visad_produkt` (Viewed Product: bild, namn,
  pris, länk), `order_rader` (Placed Order: det kunden köpte).
- `tretest` redovisar copy-reglernas test för ämnesrader, förhandstext, rubriker och
  knappar. En rad med `false` stoppar bygget.

## Kampanjfil `innehall/<brand>/kampanjer/<id>.json`

Ett mejl (ovan) plus:

```json
{
  "planerad": "2026-09-29T18:00:00+02:00",
  "segment": ["SEG_uppvarmning_steg1"],
  "exkludera": ["SEG_oengagerade_180d"],
  "status_plan": "klar | utkast-skrivs-om-efter-lardom | kraver-axel",
  "kraver_axel": null
}
```

`planerad` blir kampanjens `send_strategy` (`static`, `is_local: false`), men motorn
startar aldrig ett send-job: kampanjen står som Draft tills någon trycker på
Schedule. `status_plan: utkast-skrivs-om-efter-lardom` betyder att kampanjen byggs
och laddas upp men ska skrivas om när de första utskickens lärdomar finns (Evolve:
inga fler nya koncept än skrivna lärdomar).

## Flödesfil `innehall/<brand>/floden/<id>.json`

```json
{
  "id": "f02-overgiven-kassa",
  "namn": "FLOW_checkout_overgiven_v1",
  "memo": "…",
  "trigger": { "typ": "metrik", "metrik": ["Started Checkout", "Checkout Started"] },
  "_trigger": "{typ:metrik, metrik:[namn…]} | {typ:lista, lista:'LISTA_nyhetsbrev'} | {typ:segment, segment:'SEG_…'}",
  "filter": ["samtycke", "ej_kopt_sedan_start", "ej_i_flodet_7d"],
  "ateintrade": { "varaktighet": 7, "enhet": "day" },
  "steg": [
    { "typ": "vanta", "enhet": "hours", "varde": 1 },
    { "typ": "mejl", "mejl": { "…ett mejl enligt formatet ovan…": "" } },
    { "typ": "vanta", "enhet": "days", "varde": 1 },
    { "typ": "mejl", "mejl": {} }
  ]
}
```

Filternycklarna översätts av `segment.mjs` till Klaviyos villkor:

| Nyckel | Klaviyo-villkor |
|---|---|
| `samtycke` | `profile-marketing-consent`, email, `can_receive_marketing: true`, `subscription: "subscribed"` |
| `ej_kopt_sedan_start` | `profile-metric` Placed Order, count `equals 0`, timeframe `flow-start` |
| `ej_checkout_sedan_start` | `profile-metric` kassametriken, count `equals 0`, `flow-start` |
| `ej_i_flodet_7d` / `_14d` / `_30d` | `profile-not-in-flow`, `in-the-last` N `day` |
| `kopt_minst_en_gang` | Placed Order count `>= 1`, `alltime` |
| `kundundantag` | `profile-marketing-consent`, `can_receive_marketing: true`, `subscription: "any"`: alla som kan ta emot reklam, aldrig avregistrerade. Ersätter `samtycke` BARA i flöden som triggas av Placed Order (MFL 19 § andra stycket, Axels beslut B 2026-09-25). Aldrig ihop med `samtycke`, aldrig i en kampanj. |

Flödena är linjära (vänta → mejl → vänta → mejl). Flödets filter prövas före varje
steg, så "har köpt sedan start" stoppar resten av flödet utan en split.

## Segmenten (`segment.mjs`, namn = det som syns i Klaviyo)

| Namn | Definition (grupperna AND, villkoren i en grupp OR) | Kampanj-ok |
|---|---|---|
| `SEG_samtycke` | samtycke | ja |
| `SEG_uppvarmning_steg1` | samtycke AND (Placed Order ≥1 senaste 30 d OR Active on Site ≥1 30 d OR Opened Email ≥1 30 d OR Clicked Email ≥1 30 d) | ja |
| `SEG_engagerade_60d` | samtycke AND (Opened/Clicked/Active on Site/Placed Order ≥1 senaste 60 d) | ja |
| `SEG_engagerade_90d` | samma, 90 d | ja |
| `SEG_kopare` | samtycke AND Placed Order ≥1 alltime | ja |
| `SEG_kopare_30d` | samtycke AND Placed Order ≥1 senaste 30 d | ja |
| `SEG_ej_kopt` | samtycke AND Placed Order =0 alltime | ja |
| `SEG_flerkopare` | samtycke AND Placed Order ≥2 alltime | ja |
| `SEG_vinback_90d` | samtycke AND Placed Order ≥1 alltime AND Placed Order =0 senaste 90 d | ja |
| `SEG_oengagerade_180d` | samtycke AND Received Email ≥5 alltime AND Opened =0 180 d AND Clicked =0 180 d | nej (bara exkludering + sunset) |
| `SEG_kategori_<namn>` | samtycke AND Ordered Product ≥1 alltime med produktfilter (se `segment.mjs`) | ja |

## Uppladdningens ordning (`ladda-upp.mjs`)

1. `kolla`: nyckel, `public_api_key === public_id`, metriker (id per namn).
2. Listor: `LISTA_nyhetsbrev` (om den saknas; single opt-in, samma som Shopify-synken).
3. Segment (max 15/min, 100/dygn).
4. Mallar: `TPL_<mejl-id>_v<N>`, `editor_type: "CODE"`, html + text.
5. Kampanjer: skapa (Draft) → hämta message-id → `campaign-message-assign-template`.
6. Flöden: `POST /api/flows` med definition, mejlens `template_id`, alla actions `draft`.
7. Skriv `konto/<brand>/lage.json` + en rad per skapat objekt i
   `konto/<brand>/uppladdat.jsonl` (namn → id, tid). Det är minnet mellan körningar.

## Rapporten (`rapport.mjs`)

- `POST /api/campaign-values-reports` och `/api/flow-values-reports`, ETT anrop per
  rapport med `group_by`, aldrig ett per kampanj (2 anrop/min, 225/dygn).
- Konverteringsmetrik: Placed Order (id ur `metriker.mjs`).
- Statistik: recipients, delivered, bounce_rate, opens_unique, open_rate,
  clicks_unique, click_rate, conversions, conversion_uniques, conversion_value,
  revenue_per_recipient, unsubscribes, unsubscribe_rate, spam_complaints,
  spam_complaint_rate.
- Dom per utskick enligt `docs/os/EPOST-STRATEGI.md` (grind, vinstbidrag, etikett).
  Öppningsgrad bär aldrig en dom ensam (Apples integritetsskydd blåser upp den).
- Skriver `logg/<brand>/utfall.jsonl` och föreslår lärdomsrader i
  `logg/<brand>/kampanjlogg.md` (huvudsessionen skriver lärdomen, inte skriptet).

## Obekräftat → mätt 2026-09-25 i kontot QZ4jLG

Mätt av huvudsessionen med `kolla.mjs --prov`, riktiga händelser (`GET /api/events`)
och tillbakaläsning efter den första skarpa uppladdningen. Kontot skapades samma
morgon (metrikerna 05:31 UTC), så Shopify-historiken kan fortfarande synkas.

1. ✅ `editor_type: "CODE"` godtas på 2026-07-15 (provmall `ShWbbK` skapad, renderad och borttagen).
2. ✅ `accept: application/json` godtas (`GET /api/accounts` svarade 200).
3. ✅ Kassametriken heter **`Checkout Started`** (`TnufKh`, Shopify). `Started Checkout` finns inte.
4. ✅ `template_id` i ett flöde **kopieras**: flödesmejlets mall (`XuiiSN`, namn `TPL_f06-sunset-e1_v1`)
   finns inte i mallbiblioteket. En ändrad mall slår alltså inte igenom i ett befintligt flöde; flödet
   måste byggas om (nytt `_v<N>`) eller mejlet redigeras i Klaviyo.
5. ⬜ `measurement: "sum"`: inte mätt. Inget VIP-segment byggs förrän det är mätt.
6. ✅ `send_strategy` `{ method: "static", datetime, options: { is_local: false } }` godtas: 14 kampanjer
   skapades och läses tillbaka som Draft med exakt den formen, `scheduled_at` tomt.
7. ✅ (via riktiga händelser, inte `template-render`) Placed Order och Checkout Started bär
   `$extra.line_items[]` med `title`, `quantity`, `line_price`, `product.title`, `product.images[0].src`;
   Checkout Started bär `$extra.responsive_checkout_url` och `checkout_url`. Viewed Product: inga
   händelser än i någon av de två metrikerna, alltså omätt.
8. ✅ **Rättat:** fältet för `produkt_innehaller` heter **`Items`** på Placed Order (lista med hela
   produkttitlar, t.ex. `["Taköverdrag Husvagn – Skyddar Den Dyraste Ytan"]`). `ItemNames`, som motorn
   gissade, finns inte; F07 hade aldrig triggat. `ORDER_PRODUKTFALT = 'Items'`, test i `kolla.test.mjs`.
9. ✅ **Rättat:** Ordered Product bär produkttiteln i **`Name`**, inte `ProductName`
   (`PRODUKTNAMN_EGENSKAP = 'Name'` i `segment.mjs`). Kategorisegmenten byggdes med `Name`.
10. ✅ **Nytt:** `sample_values` på `metric-properties` kräver `additional-fields[metric-property]=sample_values`,
    annars 400. `kolla.mjs` skickar det.
11. ✅ **Nytt:** Klaviyo bearbetar **högst 5 nya segment åt gången** och svarar 400 "segment processing
    limit (5)" på det sjätte. `ladda-upp.mjs` väntar 30 s och försöker igen (högst 10 gånger), testat.
12. ⚠️ **Öppet:** `Viewed Product` finns två gånger (`V6gSUn` från API = Klaviyos onsite-skript,
    `WXk2Lf` från Shopify), båda med 0 händelser. Motorn väljer inte, så F03 Webbhistorik är INTE
    uppladdat. Avgörs när en av dem fått händelser (Analytics → Metrics), eller av Axel.
13. ⚠️ Kontot saknar postadress (`organization.full_address` blir tom i sidfoten, MFL 20 §) och
    standardavsändare. Mejlen bär `kundsupport@baverbutiken.se` själva; adressen fylls i under
    Settings → Brand (Axels klick) innan något skickas.
14. ✅ **Mätt 2026-09-25 i BÅDA kontona (QZ4jLG och UV6Rqg): `event.Price` på Viewed Product är TEXT
    med valuta** ("1,129 kr" respektive "299 kr"), skickad av Klaviyos onsite-skript. Det dynamiska
    blocket `visad_produkt` skrev `{{ event.Price|floatformat:0 }} kr`, som på en sådan sträng ger
    tomt och lämnar " kr". Rättat i `mallar.mjs`: priset skrivs som det kommer. ⚠️ Bäverbutikens
    live F03 (`YwY8V9`) bär den gamla mallen (flödesmallar kopieras) och behöver en ny version.

## Mätt 2026-09-25 i kontot UV6Rqg (Matstrumpor)

Kontot är skapat samma dag (alla 24 metriker 2026-09-25), Shopify-synken klar: 4 357
profiler (2 890 subscribed, 81 unsubscribed, 1 386 aldrig) mot Shopifys 4 362 kunder
(2 892 SUBSCRIBED). `Placed Order` bär `Items` (hela titlar, t.ex. `["Äkta ätpinnar i
trä","Sushi-Strumpor","Sushi-Strumpor"]`), `Fulfilled Order` bär `Items` och
`$extra.fulfillments[0].tracking_number` (`YT…`), `Ordered Product` bär `Name`
(`Sushi-Strumpor`) — samma som Bäverbutiken, så motorn behövde inga nya fältnamn.
`Viewed Product` finns två gånger: `R9yPAm` (API, 4 händelser) och `W55WbX` (Shopify,
0). `Checkout Started` (`SuebaZ`) finns. `Active on Site`: 0 händelser vid mätningen.
Listorna `Email List` (`VzTE9X`, double opt-in, 2 891 profiler) och `Preview List`;
nio av Klaviyos standardsegment; 0 flöden, 0 kampanjer, 0 mallar, 0 formulär.
Postadress saknas (landet står "United States"), avsändarmejl tomt.


⚠️ **Klaviyos API kan inte ändra ett befintligt flödes filter** (mätt 2026-09-25: `PATCH /api/flows/<id>` svarar 400 "'definition' is not a valid field" och kräver `status`). Ändrat filter = ny version av flödet (nytt namn), den gamla ligger kvar som utkast.
