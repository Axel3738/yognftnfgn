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
   brandets `public_id` (`TMFt7M`) innan något skrivs.
9. **Noll npm-beroenden.** Node ≥20, ESM, inbyggd `fetch`. Klienten tar
   `fetchFn` i konstruktorn så testerna kan köra mot en falsk Klaviyo utan nät.

## Filerna

```
klaviyo/
  ARKITEKTUR.md            detta kontrakt
  README.md                för Axel och nästa session (svenska)
  brands/baverbutiken.json brandets inställningar (se nedan)
  klient.mjs               KlaviyoKlient: headers, paginering, 429, fel
  metriker.mjs             slå upp metrik-id på namn
  segment.mjs              segment som kod → Klaviyo-definition, samtyckesspärr
  mallar.mjs               e-post-HTML ur block (byggstenar), Klaviyo-mallspråk
  validera.mjs             kontroller på varje byggt mejl (copy, pris, taggar)
  produkter.mjs            produktdata ur Shopify (återanvänder mejl/shopify.mjs) + cache
  recensioner.mjs          riktiga Judge.me-recensioner för citatblock (valfritt)
  bygg.mjs                 CLI: innehåll + produkter → output/<brand>/ (html, text, galleri)
  kolla.mjs                CLI: nyckel, konto, inventering → konto/<brand>/lage.json
  ladda-upp.mjs            CLI: segment, mallar, kampanjer, flöden → Klaviyo (utkast)
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
  output/                  gitignorerad: byggda mejl och galleriet
```

## `brands/<id>.json`

```json
{
  "id": "baverbutiken",
  "namn": "Bäverbutiken",
  "public_id": "TMFt7M",
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

## Obekräftat (mäts av `kolla.mjs --prov` första gången nyckeln finns)

1. `editor_type: "CODE"` på revision 2026-07-15.
2. Om `accept: application/json` godtas eller om `application/vnd.api+json` krävs
   (klienten skickar det senare).
3. Kassametrikens namn i kontot.
4. Om `template_id` i ett flöde kopieras eller länkas.
5. Vad `measurement: "sum"` summerar (VIP-segment väntar tills det är mätt).
6. Formen på `send_strategy` i 2026-07-15 (felsvaret vid första kampanjen avgör).
7. Händelsevariablerna i flödesmallarna (`event.extra.line_items` m.fl.):
   kontrolleras med `POST /api/template-render` mot en riktig händelse.
