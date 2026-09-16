# lagerrensning/ — kopiera lagerrensnings-sidan till en ny produkt

Motorn bakom `/lagerrensning` (`.claude/commands/lagerrensning.md`). Tar
GemPages-exporten av **Motorhölje – Lagerrensning (listicle)**
(`baverbutiken.se/pages/motorholje-lagerrensning`) och skriver samma sida för
en annan produkt: samma struktur, ny copy, produktens riktiga pris, nya bilder.
**Leveransen är `.gempages`-filen** (`<slug>-lagerrensning.gempages`) som Axel
importerar i GemPages (Pages → Import page) — GemPages tar bara sådana filer,
inte HTML (Axel 2026-09-16, efter en kort omväg via "klistra in HTML"). Filen
får **nya sid- och sektions-id:n** som standard så importen aldrig krockar med
motorhöljets riktiga sida. **Sidan är obrandad som standard** (se nedan).
HTML-versionen (`<slug>-lagerrensning.html`, samma sida, scopad CSS) byggs
bredvid — den är underlaget för förhandsvisningens skärmdumpar, inte en
leverans. Noll npm-beroenden.

```
node lagerrensning/bygg.mjs <produktlänk> --underlag         # produktfakta → output/<handle>/underlag.json
node lagerrensning/bygg.mjs <produktlänk> --torr             # planen, inget nät mot kie/Shopify
node lagerrensning/bygg.mjs <produktlänk>                    # skarpt: bilder → Shopify CDN, .html + .gempages skrivna, förhandsvisning
node lagerrensning/bygg.mjs <produktlänk> --igen punkt2      # generera om en kie-bild
node lagerrensning/bygg.mjs <produktlänk> --brand baverbutiken                       # brandad sida (logga, "Anders från Bäverbutiken", kundsupport-raden)
node lagerrensning/bygg.mjs <produktlänk> --lank https://<butik>/products/<handle>   # samma sida för en annan butik: knapparna dit, egen fil
node lagerrensning/forhandsvisning.mjs <handle>               # bara skärmdumparna igen (desktop.png + mobil.png)
node lagerrensning/bygg.mjs --kolla <fil.gempages>           # läs en fil: texter, länkar, bilder, checksummor
node lagerrensning/bygg.mjs --exempel                        # mallens copy som JSON (mall/exempel-copy.json)
npm test                                                     # inkluderar lagerrensning/test/
```

Indata per produkt (skrivs av sessionen enligt kommandot):
`output/<handle>/copy.json` (texten, form = `mall/exempel-copy.json`) och
`output/<handle>/bildplan.json` (en post per bildplats). Utdata:
`output/<handle>/<slug>-lagerrensning.gempages` + `plan.json` (kvittot) +
`bilder.json` (cache över genererade bilder). Mappen `bilder/` (lokala kopior
av kie-bilderna, för granskning) är gitignorerad.

## Filerna

| Fil | Vad |
|---|---|
| `mall/motorholje-lagerrensning.gempages` | Axels export 2026-09-16, orörd. Facit för formatet |
| `mall/sida.json` | Sidan ur exporten (`1_631451887748514611.json`), orörd |
| `mall/manifest.json` | Exportens manifest — skrivs tillbaka som det är |
| `mall/platser.json` | Platskartan: vilka element (sektion `cid` + element `uid`) som byts, textform per plats, bildernas roller, de fasta raderna (datum, författare, sidfot) |
| `brand/<id>.json` | Brandprofiler (`baverbutiken.json` = exakt det mallen bär). Utan `--brand` är sidan obrandad |
| `mall/exempel-copy.json` | Mallens copy i copy.json-form — formexemplet subagenten får |
| `gempages.mjs` | Ren logik: läs/skriv sidan, applicera copy + bilder, checksummor, zip |
| `zip.mjs` | Minimal zip-skrivare/läsare (deflate) |
| `produkt.mjs` | Produkten ur `/products/<handle>.json` — pris, jämförpris, bilder, beskrivning |
| `bilder.mjs` | Bildplanen → färdiga URL:er (produktbild / url / kie / mall), cache, `--igen` |
| `shopify.mjs` | Genererade bilder in på Shopifys CDN: Innehåll → Filer, annars DRAFT-produkten `lp-bildarkiv` |
| `html.mjs` | Sidan som HTML (scopad CSS under `.lr`, Anton/Inter via Google Fonts, samma mått och färger som exporten) — för förhandsvisningen |
| `forhandsvisning.mjs` | Lokal kopia med nedladdade bilder + typsnitt, skärmdumpar via headless Chrome (`/opt/pw-browsers/chromium-*/chrome-linux/chrome`) |
| `bygg.mjs` | CLI:t som knyter ihop allt |

## Formatet (mätt 2026-09-16 på exporten, testerna bevisar det)

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
- Bilderna är URL:er (`cdn.shopify.com`), inte bundlade. GemPages visar vilken
  publik URL som helst — men kie.ai:s länkar är tillfälliga, därför läggs
  genererade bilder på Shopifys CDN innan de skrivs in i sidan.
- Varje listicle-punkt har **två** Image-element (desktop + mobil) med samma
  bild — platskartan byter båda.
- Sid-, sektions- och meta-id:n byts mot nya 18-siffriga som standard
  (`bytIdn`, checksummorna räknas efteråt) — mallens id:n tillhör motorhöljets
  riktiga sida i samma butik. `--behall-idn` behåller dem, bara för felsökning.
  GemPages importerar filen som en ny sida i Draft.

## Obrandad som standard (Axels beslut 2026-09-16)

"Jag hade verkligen uppskattat om listiclen är obrandad så att den funkar om
en annan sida skulle publicera den också och köra samma produkt." Mallen bär
Bäverbutiken på tre ställen, och alla tre styrs av brandprofilen:

| Plats | Obrandad (standard) | `--brand baverbutiken` |
|---|---|---|
| Författarraden i hero (`g5knyehVEx`) | "Av **Anders på lagret.**" | "Av **Anders från Bäverbutiken.**" |
| Loggan + strecket i sidfoten (`gwJwnj2Az7`, `gnjSBAEvhs`) | dolda via `advanced.d` (GemPages egen visa/dölj, samma som mobil-/desktopbilderna) | visas, mallens logga |
| Kontaktraden (`gePKcDJ1a3`) | "OBS: Detta är reklam." | mejl + Bäverbutiken.se + reklammärkningen |

Lagerbilden i ärlig-blocket visar anonyma kartonger (tittad 2026-09-16) och
byts inte. Copyn får inte nämna en känd butik när sidan är obrandad —
`granskaCopy` stoppar namnet och domänen (även utan å/ä/ö); skriv "vi",
"hos oss". Med `--brand` får copyn nämna det egna brandet.

Knapparna pekar alltid på produktsidan i källbutiken. För en annan butik:
`--lank https://<butik>/products/<handle>` — då heter filen
`<slug>-lagerrensning-<butikens-värd>.gempages` (källbutikens fil står kvar),
copyn och bilderna återanvänds (noll credits). Ett nytt brand = en ny fil i
`brand/` med `namn`, `forfattare` (valfri, annars "Anders från <namn>"),
`support`, `doman` och `logga` `{ src, width, height }` (alla valfria).

## Förhandsvisningen

Containerns Chromium litar inte på proxyns certifikat (mätt 2026-09-16:
`ERR_CERT_AUTHORITY_INVALID` mot baverbutiken.se och cdn.shopify.com) och
TLS-kontrollen stängs aldrig av. Därför hämtar `forhandsvisning.mjs` bilder
och typsnitt med Nodes fetch (som litar på CA-bundlen), skriver en lokal kopia
av HTML:en i `output/<handle>/forhandsvisning/` och låter headless Chrome
rendera `file://` — desktop 1280 px och mobil 390 px. Mappen är gitignorerad.
Skärmdumparna är till för att sessionen ska titta, inte för Axel.

## Spärrarna

- Pris i copyn som inte är produktens pris/jämförpris → stopp.
- Procentsats i copyn → stopp (sidan lovar "ingen påhittad jätterabatt").
- HTML i copyn → stopp (`**fet**` är den enda formateringen).
- "innan lagret tar slut" → stopp (bara "så länge lagret räcker").
- Butiksnamn i copyn på en obrandad sida → stopp (skriv "vi"/"hos oss").
- Text- eller bildplats som saknas → stopp. `hero`/`sidfot` byts aldrig via
  bildplanen (loggan styrs av brandprofilen).
- Filen skrivs bara om den går att läsa tillbaka med rätt checksummor.

## Shopify-behörigheten

Appen bakom `SHOPIFY_CLIENT_ID_SE` ("Bäver uppladdare") har write_products,
write_inventory, write_publications — **inte write_files** (mätt 2026-09-16).
Då hamnar genererade bilder som media på DRAFT-produkten `lp-bildarkiv`
("Landningssidor – bildarkiv (rör ej)"). Produktmedia ligger på samma CDN och
är publika oavsett status; kunden ser aldrig en DRAFT-produkt. **Radera aldrig
den produkten** — då försvinner bilderna från sidorna. Finns
`SHOPIFY_CLIENT_ID_SE_BAVER_SE` (appen med alla scopes) i miljön används
Innehåll → Filer i stället, automatiskt.
