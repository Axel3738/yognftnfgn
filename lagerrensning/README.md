# lagerrensning/ — kopiera lagerrensnings-sidan till en ny produkt

Motorn bakom `/lagerrensning` (`.claude/commands/lagerrensning.md`). Tar
GemPages-exporten av **Motorhölje – Lagerrensning (listicle)**
(`baverbutiken.se/pages/motorholje-lagerrensning`) och skriver en ny
`.gempages`-fil för en annan produkt: samma struktur, ny copy, produktens
riktiga pris, nya bilder. Noll npm-beroenden.

```
node lagerrensning/bygg.mjs <produktlänk> --underlag         # produktfakta → output/<handle>/underlag.json
node lagerrensning/bygg.mjs <produktlänk> --torr             # planen, inget nät mot kie/Shopify
node lagerrensning/bygg.mjs <produktlänk>                    # skarpt: bilder → Shopify CDN, .gempages skriven + kollad
node lagerrensning/bygg.mjs <produktlänk> --igen punkt2      # generera om en kie-bild
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
| `mall/platser.json` | Platskartan: vilka element (sektion `cid` + element `uid`) som byts, textform per plats, bildernas roller |
| `mall/exempel-copy.json` | Mallens copy i copy.json-form — formexemplet subagenten får |
| `gempages.mjs` | Ren logik: läs/skriv sidan, applicera copy + bilder, checksummor, zip |
| `zip.mjs` | Minimal zip-skrivare/läsare (deflate) |
| `produkt.mjs` | Produkten ur `/products/<handle>.json` — pris, jämförpris, bilder, beskrivning |
| `bilder.mjs` | Bildplanen → färdiga URL:er (produktbild / url / kie / mall), cache, `--igen` |
| `shopify.mjs` | Genererade bilder in på Shopifys CDN: Innehåll → Filer, annars DRAFT-produkten `lp-bildarkiv` |
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
- Sid- och sektions-id:n behålls från mallen (samma butik). GemPages importerar
  en export som ny sida (Draft). Avvisas filen: `--nya-idn` ger nya id:n.

## Spärrarna

- Pris i copyn som inte är produktens pris/jämförpris → stopp.
- Procentsats i copyn → stopp (sidan lovar "ingen påhittad jätterabatt").
- HTML i copyn → stopp (`**fet**` är den enda formateringen).
- "innan lagret tar slut" → stopp (bara "så länge lagret räcker").
- Text- eller bildplats som saknas → stopp. `hero`/`sidfot` byts aldrig.
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
