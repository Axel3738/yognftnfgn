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

Första skarpa publiceringen 2026-09-16: axelbältets lagerrensning på
Bäverbutiken (tema "UTKAST utan popup 2026-08-28", Impulse) —
https://baverbutiken.se/pages/axelbalte-for-trimmer-lagerrensning, läst
tillbaka utan header/footer/meny, pixelskripten på plats. Bilderna ligger på
Bäverbutikens CDN oavsett butik (publika URL:er).

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
