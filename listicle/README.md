# listicle/ — listicle-landningssidor för en produkt, direkt in i butiken

Motorn bakom `/lagerrensning`, `/vi-testade`, `/anledningar` och `/listiclar`
(`.claude/commands/`). Tar GemPages-exporten av **Motorhölje – Lagerrensning
(listicle)** (`baverbutiken.se/pages/motorholje-lagerrensning`) som mall och
bygger samma sida för en annan produkt och ett annat koncept: samma struktur
(hero, fem eller sju numrerade punkter, "lyckas", "ärlig", "riskfritt"), ny
copy, produktens riktiga pris, nya bilder. **Leveransen är en sida i
butiken** — `/pages/<slug>-<koncept>` med en egen sidmall utan header, footer
eller meny (Axels beslut 2026-09-16: inga GemPages-kostnader per butik).
`.gempages`-filen (GemPages → Pages → Import page) finns kvar som tillval
(`--gempages`). Mappen hette `lagerrensning/` tills 2026-09-16 — konceptet
kom först, motorn blev gemensam. Noll npm-beroenden.

```
node listicle/bygg.mjs <produktlänk> --underlag [--koncept id] [--punkter n]   # produktfakta → output/<koncept>/<handle>/underlag.json
node listicle/bygg.mjs <produktlänk> --torr [--koncept id]                     # planen, inget nät mot kie/Shopify, butiken orörd
node listicle/bygg.mjs <produktlänk> [--koncept id] [--punkter 7] [--butik id] # skarpt: bilder → CDN, sidan → butiken, förhandsvisning
node listicle/bygg.mjs <produktlänk> --gempages                                # dessutom .gempages-filen
node listicle/bygg.mjs <produktlänk> --utan-publicering                        # bara filerna, rör inte butiken
node listicle/bygg.mjs <produktlänk> --igen punkt2                             # generera om en kie-bild
node listicle/forhandsvisning.mjs <handle> [--koncept id]                      # bara skärmdumparna igen
node listicle/bygg.mjs --kolla <fil.gempages>                                  # läs en fil: texter, länkar, bilder, checksummor
node listicle/bygg.mjs --exempel                                               # mallens copy som JSON (mall/exempel-copy.json)
npm test                                                                       # inkluderar listicle/test/
```

Indata per produkt och koncept (skrivs av sessionen enligt kommandot):
`output/<koncept>/<handle>/copy.json` (texten, form = `mall/exempel-copy.json`,
5 eller 7 punkter) och `bildplan.json` (en post per bildplats). Utdata:
`<slug>-<suffix>.html` (förhandsvisningens underlag, inline CSS),
`<slug>-<suffix>.sida.html` (exakt det som ligger i butikens sida),
`plan.json` (kvittot: adress, tema, kontroll), `bilder.json` (cache över
genererade bilder), ev. `<slug>-<suffix>.gempages`. `bilder/` och
`forhandsvisning/` är gitignorerade.

## Koncepten (`koncept/<id>.json`)

| Koncept | Kommando | Handle | Punkter | Författarrad (obrandad) | Rubrikkontroll |
|---|---|---|---|---|---|
| `lagerrensning` | `/lagerrensning` | `<slug>-lagerrensning` | 5 | Anders på lagret | priset + jämförpriset |
| `vi-testade` | `/vi-testade` | `<slug>-vi-testade` | 5 | Anders, som testade den själv | perioden (dagar/vecka/vinter/säsong …) |
| `anledningar` | `/anledningar` | `<slug>-5-anledningar` / `-7-` | 5 eller 7 | Anders på lagret | antalet (5/fem, 7/sju) |

Copy-strategin per koncept står i kommandofilen, inte i koden. Motorn
kontrollerar formen: exakt rätt antal punkter, numrerade "1." …, priser bara
ur produktsidan, inga procent, inget butiksnamn på en obrandad sida.

**Sju punkter** klonar mallens sektioner för punkt 4 (bild till höger) och
5 (bild till vänster) till punkt 6 och 7: nya sektions-id:n, nya cid:n, nya
uids på varje element, Phosphor-ikonerna 6 och 7 (light, hämtade 2026-09-16),
inskjutna efter punkt 5 i `sectionPosition`. Checksummorna räknas om för alla
sektioner. HTML-versionen loopar över punkterna och alternerar bildsidan.

## Butiken (`butik.mjs`)

Tre steg via Admin GraphQL (API 2025-07), token mintad med client credentials:

1. **Temafilerna, en gång per butik**, på det publicerade temat (role MAIN):
   `layout/listicle.liquid` (ren layout: `content_for_header` kvar så
   Shopifys pixlar och integritetsval följer med — mätt 2026-09-16 på
   Bäverbutiken: `web-pixels-manager`, Facebook-pixeln och trekkie finns i
   sidhuvudet; INGEN `{% section 'header' %}`/footer, temats CSS/JS laddas
   inte), `templates/page.listicle.liquid` (`{% layout 'listicle' %}` +
   `{{ page.content }}`) och `assets/listicle.css` (html.mjs CSS +
   body-nollställning). Källorna ligger i `tema/`. Skrivs bara när de saknas
   eller ändrats, läses tillbaka och jämförs. Filerna gör ingenting förrän en
   sida använder mallen. Fungerar på Impulse (Bäverbutiken) och Dawn-forken
   (OPS-butikerna) lika — `{% layout %}` är Liquid, inte tema.
2. **Sidan:** `pageCreate`/`pageUpdate` med `templateSuffix: "listicle"`,
   handle `<slug>-<suffix>`, body = listiclens HTML utan `<style>`. Finns
   handlen uppdateras sidan (samma adress). Publicerad direkt; `--opublicerad`
   för ett utkast.
3. **Trippelkollen:** sidan läses som kund (`factory/kundvy-kor.mjs`, med
   storefront-lösenord om butiken är stängd): HTTP 200, `class="lr"` finns,
   inga `id="shopify-section-…"` (= inga temasektioner), ingen `<header>`,
   ingen `<nav>`, bara vår egen `<footer>`, `listicle.css` laddad. Faller
   den räknas sidan inte som publicerad.

Butiker: `baverbutiken` (nycklarna `SHOPIFY_*_SE`, appen "Bäver uppladdare"
— `write_themes` + `write_content` tillagda av Axel 2026-09-16, samma app som
`mejl/`) och OPS-butikerna (`factory/butiker/<id>.yaml` → domänen → suffixet i
miljön, samma uppslag som `factory/token.mjs`; storefront-lösenordet från
samma suffix). Fabrikens `anslut` används inte — dess spärrar finns för att
stoppa ett nytt BYGGE på en live-butik, och en landningssida ska in i just
live-butiken. Knapparna länkar relativt (`/products/<handle>`); för en
OPS-butik slås handlen upp ur `factory/produkter/<x>.yaml` (`kalla.produkt_handle`
→ `produkt.id`), annars `--lank`.

Första skarpa publiceringarna 2026-09-16: axelbältets lagerrensning på
Bäverbutiken (tema "UTKAST utan popup 2026-08-28", Impulse) —
https://baverbutiken.se/pages/axelbalte-for-trimmer-lagerrensning — och
takskyddets på CaraShell (tema "CaraShell – CRO v1", Dawn-fork) —
https://carashell.se/pages/takoverdrag-husvagn-husbil-6-5-3-m-lagerrensning.
Båda lästa tillbaka utan header/footer/meny, pixelskripten på plats.
Bilderna ligger på Bäverbutikens CDN oavsett butik (publika URL:er).

Produktlänken får vara OPS-butikens egen produktsida
(`carashell.se/products/takskyddet` med `--butik carashell`): produkten läses
därifrån, `hittaDna` hittar minnet i `products/<butik>/<produkt>/dna.md`, och
knapparna blir `/products/<handle>` direkt. Copyn får då inte heller nämna
källbutikens namn (`butiksOrd` ur länken — "hos CaraShell" stoppas).

## Marknader — samma sida på ett annat språk (`--marknad US`)

Axels fråga 2026-09-16 kväll: CaraShells två lagerrensningssidor "för
carashell.com" — USA-marknaden. Det är **samma Shopify-butik** (Shopify
Markets: egen domän, engelska, USD), så sidan dupliceras inte. Den svenska
sidan får en **översättning** (Shopifys Translations API, `title` +
`body_html` på locale `en`), och marknadens domän visar den. Samma handle,
två språk.

```bash
node listicle/bygg.mjs https://carashell.se/products/takskyddet --butik carashell --marknad US --underlag
node listicle/bygg.mjs https://carashell.se/products/takskyddet --butik carashell --marknad US --torr
node listicle/bygg.mjs https://carashell.se/products/takskyddet --butik carashell --marknad US
```

- **Marknaden** läses ur `factory/butiker/<id>.yaml` → `butik.marknader`
  (`land`, `locale`, `valuta`, `doman`) — samma rad `/ny-marknad` skrev
  (`marknadForButik` i `butik.mjs`). Bäverbutiken har inga marknader.
- **Produkten** läses från marknadens egen adress
  (`https://carashell.com/products/takskyddet?country=US` → `$199` / `$249`
  i USD, engelsk titel och text — `factory/opsmarknader.mjs` `lankFor`).
  Svarar den adressen med samma tal som den svenska sidan i en annan valuta
  stoppar bygget: domänen är inte kopplad till marknaden.
- **Copyn** ligger i `copy.<locale>.json` i samma handle-mapp som den svenska
  (`output/lagerrensning/takskyddet/copy.en.json`), skriven av
  huvudsessionen mot marknadens produktsida (dess garanti, frakt, enheter).
  Bildplanen och bildcachen (`bilder.json`) delas — noll nya credits;
  `bildplan.<locale>.json` om marknaden behöver egna bilder.
- **Språklagret `sprak.mjs`** byter de fasta texterna (By / Last updated /
  Summary: / "Note: this is an advertisement."), valutan i prisspärren
  (`$199` läses som pris; `1 129 kr` är ingen prisrad på en dollarsida),
  period-/antalsorden i rubrikkontrollerna och de förbjudna fraserna
  ("before stock runs out", "last chance" → "while stock lasts"). Konceptets
  engelska sidnamn, sidtitel och författare står i `koncept/<id>.json` →
  `sprak.en` (saknas språket stoppar bygget). Ny marknad med nytt språk = en
  rad i `SPRAK` + `VALUTOR`, inga if-satser.
- **Knapparna** är marknadens produktlänk med `?country=` — aldrig relativa
  på en marknad, då tappar kunden marknaden (DryTrek 2026-09-10).
- **Publiceringen** (`publiceraMarknad`): den svenska sidan MÅSTE finnas
  (samma handle, mallen `page.listicle`). `oversattSida` hämtar
  `translatableResource`-digest för `title` och `body_html`, registrerar med
  `translationsRegister` (kräver `write_translations` — fabrikens app har
  det) och läser tillbaka lika. Sedan läses sidan som kund på **marknadens
  domän** (`https://carashell.com/pages/<handle>?country=US`): listiclen,
  ingen header/footer, **den engelska hero-rubriken finns och den svenska
  finns inte** (`granskaPublikSida` `maste`/`farInte`).
- **Filer:** `underlag.en.json`, `copy.en.json`, `<slug>-<suffix>.en.html`,
  `.en.sida.html`, `plan.en.json`, `forhandsvisning-en/` (gitignorerad).
- ⚠️ Ändras den svenska sidan (ny copy → `pageUpdate`) märker Shopify
  översättningen som `outdated` men visar den fortfarande. Kör marknaden
  igen efter en svensk ändring så texterna följs åt.
- ⚠️ **Containern går ut på nätet från USA** (mätt 2026-09-16,
  api.country.is → US). Shopify skickar då en besökare på carashell.se
  vidare (302) till carashell.com — som visar den engelska översättningen.
  Därför läser den svenska kontrollen alltid `?country=SE` och kräver den
  svenska rubriken (`HUVUDLAND` i `butik.mjs`). Läser du en svensk sida
  själv härifrån: lägg på `?country=SE`, annars ser du engelska och tror
  att den svenska sidan är borta. Det är den inte.

Första körningen 2026-09-16: takskyddet och termoskyddet →
https://carashell.com/pages/takoverdrag-husvagn-husbil-6-5-3-m-lagerrensning?country=US
och https://carashell.com/pages/termoskydd-husbil-211-171-cm-lagerrensning?country=US.

### Länder inom en marknad (`--marknad US --land GB`) och prisplatserna

Axels fråga 2026-09-17: samma listicle "för UK, Kanada, Australien och Nya
Zeeland". I Shopify är de inte egna marknader — marknaden **USA** täcker
US, GB, CA, AU och NZ på carashell.com med lokal valuta och **automatisk
kursomräkning** (mätt 2026-09-17 med `markets`-frågan: en marknad,
`localCurrencies: true`). Två följder:

- **En översättning kan inte skilja länderna åt** (den är per språk och
  marknad), så ett land får en **egen sida**: `<handle>-gb`, `-ca`, `-au`,
  `-nz`, engelska i sidans grundspråk, läst av kunden på
  `https://carashell.com/pages/<handle>-gb?country=GB`. Landet, valutan och
  det engelska namnet kommer ur `factory/lander.mjs` (`landForMarknad`).
  Copyn heter `copy.<locale>-<CC>.json` (`copy.en-GB.json`), filerna
  `<handle>.en-GB.html` osv., skärmdumparna `forhandsvisning-en-GB/`.
- **Priset rör sig varje dag** (Axels skärmdump sa NZ$354, sidan NZ$355
  några timmar senare). Därför skrivs priset i copyn som **prisplatser**,
  `[[PRIS]]` och `[[JAMFORPRIS]]`, som **butiken byter vid varje visning**
  i besökarens valuta: `templates/page.listicle.liquid` läser handlen ur
  listiclens rot (`<div class="lr" data-lp-produkt="takskyddet">`), slår
  upp `all_products[handle]` och byter platserna med
  `money_without_trailing_zeros` — exakt det pris produktsidan visar samma
  sekund. `layout/listicle.liquid` gör samma sak i meta-beskrivningen
  (Shopify härleder den ur innehållet, så platserna följde med dit — mätt
  vid första körningen). Motorn byter platserna själv bara där ingen
  Liquid finns: förhandsvisningen och `.gempages`-filen. `granskaCopy`
  räknar platserna som produktens pris och stoppar `[[JAMFORPRIS]]` när
  produktsidan saknar jämförpris; tillbakaläsningen kräver dagens pris i
  hero-rubriken och att ingen `[[`-plats syns.
- Samma sida sedd **utan** `?country=` visar besökarens eget lands pris
  (från USA: $199 på UK-sidan). Annonslänken bär därför alltid `?country=`.
- **Handlen är stabil:** `plan.json` i handle-mappen bär sidans handle, och
  en ny körning återanvänder den även när produkttiteln (och slugen)
  ändrats — takskyddet hette "6,5 × 3 m" när sidan byggdes och "5,5–13,5 m"
  dagen efter. `--handle <x>` sätter den uttryckligen.
- Dollarvalutorna (USD, CAD, AUD, NZD) skrivs alla som `$` — så visar
  Shopify dem på carashell.com — och läses med eller utan landsbokstav.

Första körningen 2026-09-17, takskyddet: `…-lagerrensning-gb?country=GB`,
`-ca?country=CA`, `-au?country=AU`, `-nz?country=NZ` på carashell.com. GB
och AU/NZ säger caravan, damp check (GB), inga månadsnamn (södra halvklotet);
CA är US-copyn med Kanada.

### Ett nytt språk (finska, `--marknad FI`)

Finland blev CaraShells tredje marknad 2026-09-18 (carashell.se/fi, EUR,
ingen egen domän) och listiclen följde samma dag. Ett nytt språk är tre
saker, inga fler:

1. **En rad i `SPRAK`** (`sprak.mjs`): de fasta texterna (`av`,
   `sammanfattning`, `reklam`, `lagret`, `punkt`), `datumrad`, orden
   spärrarna letar efter (`periodOrd`, `antalOrd`, `forbjudna`) och
   `franOrd` (se nedan). Finskans datum är sitt eget format —
   `finsktDatum` ger "18. syyskuuta 2026".
2. **`sprak.<locale>` i varje koncept** (`koncept/*.json`): sidnamn,
   sidtitel, författarrad, ärlig- och riskfritt-rubrik. Saknas språket
   stoppar bygget.
3. **Copyn**, `copy.fi.json`, skriven mot marknadens egen produktsida.
   ⚠️ Den finska texten är skriven av sessionen och **ingen finsktalande
   har läst den** — varje fackterm är däremot hämtad ordagrant ur butikens
   egen finska produktsida (kattoluukku, sauma, tiiviste, kosteustesti,
   kiristyshihna, korin reuna), så orden är butikens även när idiomen är
   motorns. Det står i copyns `lasbarhetstest`.

Marknadens länk byggs ur **butiksfilen**, inte ur
`factory/opsmarknader.mjs` — den tabellen är annonsmarknaderna (vilket
konto en kampanj hamnar i) och känner bara SE, NO och US. Finland finns i
butiken utan att vara en annonsmarknad, och en listicle ska kunna byggas
för varje marknad butiken säljer i.

### Prisstegen: "från" är inte kosmetika

Takskyddet fick **nio priser per marknad** 2026-09-18 (SEK 1 129–2 239,
EUR 126,90–251,90, USD 199–389, GBP 152–297): priset följer längden.
Priset butiken skriver in i `[[PRIS]]` är produktens **lägsta** — precis
det produktsidan visar överst — så en rubrik som säger "ditt för 1 129 kr"
lovar ett pris som bara gäller de två minsta storlekarna.

`granskaCopy` stoppar därför bygget när produkten har flera priser och
`hero.rubrik` nämner priset utan språkets `franOrd` ("från", "from",
"alkaen"), och varnar för övriga textplatser. Ärlig-blockets sista stycke
är platsen där prisstegen förklaras — "Priset följer längden: storlekarna
är nio, och siffran här är den kortastes."

## Obrandad som standard (Axels beslut 2026-09-16)

"Jag hade verkligen uppskattat om listiclen är obrandad så att den funkar om
en annan sida skulle publicera den också och köra samma produkt." Mallen bär
Bäverbutiken på tre ställen, och alla tre styrs av brandprofilen:

| Plats | Obrandad (standard) | `--brand baverbutiken` |
|---|---|---|
| Författarraden i hero (`g5knyehVEx`) | "Av **Anders på lagret.**" (konceptet kan ha en egen: vi-testade = "Anders, som testade den själv") | "Av **Anders från Bäverbutiken.**" |
| Loggan + strecket i sidfoten (`gwJwnj2Az7`, `gnjSBAEvhs`) | dolda via `advanced.d` (GemPages egen visa/dölj) / utelämnade i HTML | visas, mallens logga |
| Kontaktraden (`gePKcDJ1a3`) | "OBS: Detta är reklam." | mejl + Bäverbutiken.se + reklammärkningen |

Lagerbilden i ärlig-blocket visar anonyma kartonger (tittad 2026-09-16) och
byts inte. Copyn får inte nämna en känd butik när sidan är obrandad —
`granskaCopy` stoppar namnet och domänen (även utan å/ä/ö); skriv "vi",
"hos oss". Ett nytt brand = en ny fil i `brand/` med `namn`, `forfattare`
(valfri), `support`, `doman` och `logga` `{ src, width, height }`.

## Filerna

| Fil | Vad |
|---|---|
| `mall/motorholje-lagerrensning.gempages` | Axels export 2026-09-16, orörd. Facit för formatet |
| `mall/sida.json` | Sidan ur exporten (`1_631451887748514611.json`), orörd |
| `mall/manifest.json` | Exportens manifest — skrivs tillbaka som det är |
| `mall/platser.json` | Platskartan: vilka element (sektion `cid` + element `uid`) som byts, textform per plats, bildernas roller, de fasta raderna |
| `mall/exempel-copy.json`, `mall/exempel-copy-axelbalte.json` | Mallens copy och Axels egen axelbältescopy i copy.json-form — formexemplen |
| `koncept/<id>.json` | De tre koncepten (sidnamn, handle-suffix, punktantal, författarrad, rubrikkontroller) |
| `brand/<id>.json` | Brandprofiler (`baverbutiken.json` = exakt det mallen bär). Utan `--brand` är sidan obrandad |
| `tema/layout.liquid`, `tema/page.liquid` | Temafilerna som skrivs i butiken (CSS:en genereras ur `html.mjs`) |
| `gempages.mjs` | Ren logik: läs/skriv sidan, koncept, 5/7 punkter (sektionskloning), copy + bilder, brand, checksummor |
| `zip.mjs` | Minimal zip-skrivare/läsare (deflate) |
| `produkt.mjs` | Produkten ur `/products/<handle>.json` — pris, jämförpris, bilder, beskrivning |
| `bilder.mjs` | Bildplanen → färdiga URL:er (produktbild / url / kie / mall), cache, `--igen` |
| `shopify.mjs` | Genererade bilder in på Bäverbutikens CDN: Innehåll → Filer, annars DRAFT-produkten `lp-bildarkiv` |
| `butik.mjs` | Sidan in i butiken: temafiler, sida, trippelkoll (se ovan) |
| `html.mjs` | Sidan som HTML (scopad CSS under `.lr`, Anton/Inter, samma mått och färger som exporten) — sidans body och förhandsvisningens underlag |
| `forhandsvisning.mjs` | Lokal kopia med nedladdade bilder + typsnitt, skärmdumpar via Playwright/headless Chrome |
| `bygg.mjs` | CLI:t som knyter ihop allt |

## GemPages-formatet (mätt 2026-09-16 på exporten, testerna bevisar det)

- `.gempages` är en zip med `manifest.json`, `pages_info.zip` (→ `pages_info.json`)
  och `1_<sid-id>.zip` (→ `1_<sid-id>.json`, sidan). Zip i zip.
- Sidan har `pageSections[]`; varje sektions innehåll är en **JSON-sträng** i
  `component`, serialiserad av Go: nycklar i bytesordning, kompakt, `<` `>` `&`
  som `<` `>` `&`. `goJson()` skriver exakt så — alla tio
  sektioner går runt tecken för tecken.
- `checksum` = **sha256(themePageID + component)**. Räknas om för varje sektion
  vid bygget. Sidan läses tillbaka och kontrolleras innan filen godkänns.
- Id:n är 18-siffriga heltal (över 2^53). Läs sidan med `lasJson`, aldrig
  `JSON.parse` — annars rundas de och sektionsreferenserna går sönder.
- Varje listicle-punkt har **två** Image-element (desktop + mobil) med samma
  bild — platskartan byter båda.
- Sid-, sektions- och meta-id:n byts mot nya 18-siffriga som standard
  (`bytIdn`, checksummorna räknas efteråt). `--behall-idn` behåller dem.
- Bäverbutikens tema bär GemPages egna layouter (`layout/theme.gempages.blank.liquid`
  m.fl.) — samma knep som vår `layout/listicle.liquid`, fast utan appen.

## Förhandsvisningen

Containerns Chromium litar inte på proxyns certifikat (mätt 2026-09-16:
`ERR_CERT_AUTHORITY_INVALID` mot baverbutiken.se och cdn.shopify.com) och
TLS-kontrollen stängs aldrig av. Därför hämtar `forhandsvisning.mjs` bilder
och typsnitt med Nodes fetch (som litar på CA-bundlen), skriver en lokal kopia
av HTML:en i `output/<koncept>/<handle>/forhandsvisning/` och låter headless
Chrome rendera `file://` — desktop 1280 px och mobil 390 px. Mappen är
gitignorerad. Skärmdumparna är till för att sessionen ska titta, inte för Axel.

## Spärrarna

- Pris i copyn som inte är produktens pris/jämförpris → stopp.
- Procentsats i copyn → stopp (sidan lovar "ingen påhittad jätterabatt").
- HTML i copyn → stopp (`**fet**` är den enda formateringen).
- "innan lagret tar slut" → stopp (bara "så länge lagret räcker").
- Butiksnamn i copyn på en obrandad sida → stopp (skriv "vi"/"hos oss").
- Fel antal punkter för konceptet/körningen → stopp.
- Text- eller bildplats som saknas → stopp. `hero`/`sidfot` byts aldrig via
  bildplanen (loggan styrs av brandprofilen).
- Butiken: appen utan `write_themes`/`write_content` → stopp före första
  skrivningen; sidan som inte läses tillbaka utan header/footer → stopp.
- `.gempages` skrivs bara om den går att läsa tillbaka med rätt checksummor.

## Shopify-behörigheten för bilderna

Appen bakom `SHOPIFY_CLIENT_ID_SE` ("Bäver uppladdare") saknar `write_files`
(mätt 2026-09-16). Då hamnar genererade bilder som media på DRAFT-produkten
`lp-bildarkiv` ("Landningssidor – bildarkiv (rör ej)"). Produktmedia ligger
på samma CDN och är publika oavsett status; kunden ser aldrig en
DRAFT-produkt. **Radera aldrig den produkten** — då försvinner bilderna från
sidorna. Finns `SHOPIFY_CLIENT_ID_SE_BAVER_SE` (appen med alla scopes) i
miljön används Innehåll → Filer i stället, automatiskt.
