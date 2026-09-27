# `storytelling/` — Bäverbutikens historia på sajten

Axels beställning 2026-09-27: "storytelling om hur jag startade Bäverbutiken",
på startsidan och i footern, "en tanke bakom Bäverbutiken", plus fler
Judge.me-widgetar på startsidan. Förebilden är **Norillo** (norillo.se):
hero med "Sverige sedan 2024, över 75 000 kunder", recensionskarusell med
verifierade kunder, USP-rad (svensk kundtjänst, fri frakt över 299, 365 dagars
retur, svar inom 24 h), bästsäljare, tidslinjen "Vår resa" (2023 idén → 2024
lansering → 2024–2025 Skandinavien), kategorier, nyhetsbrev och en footer med
hela historien i kortform. Bäverbutiken är i Axels ord ett mini-Biltema på
nätet, fast med bra och roliga produkter (konkurrentens namn står aldrig på
sajten — texten säger "den där järnhandeln du gillar att gå runt i").

Andra ordern samma dag: "visa recensioner från olika produkter och jag vill
lowkey ha typ allt detta på min startsida" ⇒ v2: hela historien på startsidan
och egna recensionskort från olika produkter.

## Vad som ligger i butiken (tema Impulse 5.0.0, Archetype)

| Var | Vad | Fil i repot |
|---|---|---|
| Startsidan, under heron | **Förtroenderaden**: snittbetyg + antal recensioner (ur Judge.me:s fält `shop.metafields.judgeme.all_reviews_rating/count`), fri frakt, Klarna, svenskt företag | `tema/sections/bb-fortroende.liquid` |
| Startsidan, efter Bästsäljare | **Kunderna har ordet**: 12 kort med riktiga 5-stjärniga recensioner från 12 OLIKA produkter (produktbild + länk live ur butiken, "Verifierat köp" bara när Judge.me säger det), Judge.me:s snittrad och medaljer. Judge.me:s egen karusell finns som val (av) | `tema/sections/bb-recensioner.liquid` + `recensioner.mjs` → `recensioner.json` |
| Startsidan, efter recensionerna | **Vår historia** (svart band): garaget, hela berättelsen "Det började med en koppling", signatur, knapp "Mer om oss", tidslinjen Bäverkopplingen → Bäverlampan → Bävertratten → "240+ prylar" (räknas ur samlingen Alla produkter) | `tema/sections/bb-historia.liquid` |
| Startsidan, efter historien | **Varför en bäver** (ljust band): bävern, "Bävern bygger. Vi också.", fyra numrerade punkter "Vad du kan räkna med", "Vilka vi är" med mejladressen | `tema/sections/bb-varfor.liquid` |
| Sidfoten | Kolumnen **Om Bäverbutiken** (historien i tre meningar + "Läs vår historia"), företagsblocket med kontorsadressen, kolumnbredder 20/32/28/20 | `innehall.mjs` → `byggFooter` |
| `/pages/om-oss` | Samma sektioner utan knappar: historien, varför en bäver, förtroenderaden, recensionerna | `innehall.mjs` → `byggOmOssMall` (mallen `page.om-oss.json` genereras) |

All text bor i `innehall.mjs`. Ändras något i temaredigeraren skriver nästa
körning av `publicera.mjs` tillbaka repots version — för in ändringen här också.

## Så körs det

```bash
node --test storytelling/test/*.test.mjs        # 13 tester utan nät (mot kopior av temats filer)
node storytelling/recensioner.mjs --torr         # visar urvalet ur Judge.me
node storytelling/recensioner.mjs                # väljer 12, skriver recensioner.json, synkar "featured" i Judge.me
node storytelling/publicera.mjs --torr           # visar vad som skulle skrivas, till arbetstemat
node storytelling/publicera.mjs --duplicera      # skapar arbetskopian ur det publicerade temat om den saknas, skriver allt
node storytelling/publicera.mjs --publicera      # publicerar arbetstemat, läser tillbaka livesidan
node storytelling/skarmdump.mjs "https://baverbutiken.se/?country=SE" /tmp/x --sektioner bb-historia
```

Arbetsordningen är Axels egen (han duplicerar temat och publicerar utkastet):
`themeDuplicate` av det publicerade temat (`--duplicera`, namnet `ARBETSTEMA` i
`innehall.mjs`) → allt skrivs till kopian → förhandsvisning med
`preview_theme_id` + skärmdumpar → `themePublish`. Det förra temat ligger
kvar opublicerat som backup: publicera det igen i Shopify så är allt som
förut. Skriptet skriver aldrig tyst till det publicerade temat — bara till ett
namngivet tema, och `--publicera` vägrar om kundvyn i arbetstemat saknar
markörer. Varje fil läses tillbaka (JSON tolkat med nycklarna sorterade,
Liquid exakt). Loggen: `logg.jsonl`.

**Nya recensioner på startsidan** = `node storytelling/recensioner.mjs` och
sedan `publicera.mjs --duplicera --publicera` (gärna en gång i månaden;
ingen rutin byggd — Axels beslut).

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
  4.86, `featured_carousel`, `medals`, `verified_badge`). Judge.me:s egen
  karusell visar det adminen säger under Reviews Carousel → Review curation:
  läget var "senaste recensionerna" (fyra Lövsilarna i rad). Därför är korten
  våra egna, valda av `recensioner.mjs` (verifierade köpare först, en per
  produkt, aldrig text som klagar på leveranstiden, namn som förnamn +
  initial) och samma tolv är "featured" i Judge.me via API:t
  (`PUT /api/v1/reviews/<id>` med `featured: true`, reversibelt). Av 964
  publicerade recensioner är 48 verifierade köpare; 485 är importerade
  ("wizard") — därför visas "Verifierat köp" bara där Judge.me säger det.
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
  Göteborg, 964 recensioner, snitt 4,86. Tidslinjen och texten följer den
  ordningen (lampan före tratten).
- Menyerna kräver `write_online_store_navigation` som appen saknar — länken
  "Om oss" i huvudmenyn är Axels klick (Navigation → Main menu).
- Första versionen (samma dag) hade "Så tänker vi" i det svarta bandet OCH
  "Vad du kan räkna med" i det ljusa — samma sak två gånger. Bara tidslinjen
  ligger kvar i det svarta bandet.
