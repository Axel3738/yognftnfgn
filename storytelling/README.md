# `storytelling/` — Bäverbutikens historia på sajten

Axels beställning 2026-09-27: "storytelling om hur jag startade Bäverbutiken",
på startsidan och i footern, "en tanke bakom Bäverbutiken", plus fler
Judge.me-widgetar på startsidan. Bäverbutiken är i hans ord ett mini-Biltema
på nätet, fast med bra och roliga produkter (konkurrentens namn står aldrig på
sajten — texten säger "den där järnhandeln du gillar att gå runt i").

## Vad som ligger i butiken (tema Impulse 5.0.0, Archetype)

| Var | Vad | Fil i repot |
|---|---|---|
| Startsidan, under heron | **Förtroenderaden**: snittbetyg + antal recensioner (ur Judge.me:s fält `shop.metafields.judgeme.all_reviews_rating/count`), fri frakt, Klarna, svenskt företag | `tema/sections/bb-fortroende.liquid` |
| Startsidan, efter Bästsäljare | **Vår historia**: svart band med bild, "Det började med en koppling", signatur, knapp till Om oss, tidslinjen Bäverkopplingen → Bävertratten → Bäverlampan → "240+ prylar" (räknas ur samlingen Alla produkter), tre punkter "Så tänker vi" | `tema/sections/bb-historia.liquid` |
| Startsidan, efter historien | **Kunderna har ordet**: Judge.me:s recensionskarusell, snittbetyget och medaljerna | `tema/sections/bb-recensioner.liquid` |
| Sidfoten | Kolumnen **Om Bäverbutiken** (historien i tre meningar + "Läs vår historia"), företagsblocket med kontorsadressen, kolumnbredder 20/32/28/20 | `innehall.mjs` → `byggFooter` |
| `/pages/om-oss` | Hela historien: historiebandet med bävern, "Varför en bäver?", "Vad du kan räkna med", "Vilka vi är", förtroenderaden, recensionerna | `tema/templates/page.om-oss.json` + `innehall.mjs` → `OM_OSS` |

Texten bor i `innehall.mjs` (startsidan, sidfoten, Om oss) och i
`tema/templates/page.om-oss.json`. Ändras något i temaredigeraren skriver nästa
körning av `publicera.mjs` tillbaka repots version — för in ändringen här också.

## Så körs det

```bash
node --test storytelling/test/*.test.mjs        # 10 tester utan nät (mot kopior av temats filer)
node storytelling/publicera.mjs --torr           # visar vad som skulle skrivas, till arbetstemat
node storytelling/publicera.mjs                  # skriver sektioner, startsida, sidfot, sidan om-oss
node storytelling/publicera.mjs --publicera      # publicerar arbetstemat, läser tillbaka livesidan
node storytelling/skarmdump.mjs "https://baverbutiken.se/?country=SE" /tmp/x --sektioner bb-historia
```

Arbetsordningen är Axels egen (han duplicerar temat och publicerar utkastet):
`themeDuplicate` av det publicerade temat → allt skrivs till kopian
(`ARBETSTEMA` i `innehall.mjs`, "Story + recensioner 2026-09-27") →
förhandsvisning med `preview_theme_id` + skärmdumpar → `themePublish`. Det
gamla temat ("UTKAST utan popup 2026-08-28") ligger kvar opublicerat som
backup: publicera det igen i Shopify så är allt som förut. Skriptet skriver
aldrig tyst till det publicerade temat — bara till ett namngivet tema, och
`--publicera` vägrar om kundvyn i arbetstemat saknar markörer.

Varje fil läses tillbaka efter skrivningen (JSON jämförs tolkat och med
nycklarna sorterade, Liquid exakt). Loggen: `logg.jsonl`.

## Lärdomar (mätta 2026-09-27)

- **Miljön på claude6-kontot bär appens hemlighet som
  `SHOPIFY_SECRET_ID_SE_BAVER_SE`**, inte `SHOPIFY_CLIENT_SECRET_SE_BAVER_SE`
  som `mejl/shopify.mjs` och `listicle/butik.mjs` läser. Då paras det nya
  app-id:t ihop med den gamla appens hemlighet och Shopify svarar
  `400 Oauth error invalid_request`. `lagaMiljo()` i `publicera.mjs` kopierar
  över namnet; rätt fix är att döpa om variabeln i Environments.
- **Shopify kan svara med den gamla filen sekunden efter `themeFilesUpsert`**
  (settings_data.json) — tillbakaläsningen gör upp till fem försök.
- **Judge.me:** app-embedden `judgeme_core` fanns redan i temat, och butikens
  siffror ligger i shop-metafält (`all_reviews_count` 964, `all_reviews_rating`
  4.86, `featured_carousel`, `medals`, `verified_badge`). Karusellen visar det
  som Judge.me-adminen säger under Reviews Carousel → Review curation: läget
  var "senaste recensionerna" (fyra Lövsilarna-recensioner i rad). Därför är
  **15 riktiga, varierade 5-stjärniga recensioner markerade som featured**
  via API:t (`PUT /api/v1/reviews/<id>` med `featured: true`, tillbakalästa;
  listan i `featured.json`, verifierade köpare först, en per produkt) — de
  syns när Axel byter karusellens läge till "Choose reviews manually".
  Att featurea är reversibelt (`featured: false`).
- **Liquids `products_count` räknar det kunden kan se**: samlingen Alla
  produkter har 254 produkter i admin men visar 240+ på sajten. Texten säger
  därför "över 200 prylar", inte 250.
- **Bilderna** är genererade med kie.ai (`google/nano-banana`, garaget; och
  `nano-banana-edit` med loggan som referens, bävern) och uppladdade till
  Shopify → Innehåll → Filer som `baverbutiken-historia.jpg` och
  `baverbutiken-om-oss.jpg` (`bilder.json`). Ett riktigt foto på Axels garage
  eller arbetsbänk vore bättre storytelling — byts i temaredigeraren
  (sektionen Vår historia → Bild).
- **Meningen "efter Sveriges flitigaste byggare"** (varför bäver) är
  berättelsens egen — resten är mätt: Bäverkopplingen (2026-02-13),
  Bäverlampa Pro (2026-03-03), Bävertratten (2026-04-02), Stonebite Ecom AB i
  Göteborg, 964 recensioner, snitt 4,86.
- **Norilå**, sajten Axel ville ha som förebild, hittades inte (norila.se
  svarar inte, sökningarna ger inget) — bygget följer klassisk DTC-storytelling
  (ursprung → varför → vad du kan räkna med → vem) tills länken kommer.
- Menyerna kräver `write_online_store_navigation` som appen saknar — länken
  "Om oss" i huvudmenyn är Axels klick (Navigation → Main menu).
