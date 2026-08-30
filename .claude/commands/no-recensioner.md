# /no-recensioner — importera norska produktrecensioner till Judge.me

Kör efter **Daglig NO-videobatch**. Videobatchen översätter annonserna men rör
medvetet inte REVIEWS-arken (beslut 2026-08-29, `translate-no.md` Fas 3) — den
här rutinen tar den biten.

**Bara Bäverbutiken/Norge.** Rör aldrig den svenska butikens recensioner.

Ingen Discord-avläsning behövs. Vilka produkter som är nya framgår av Drive och
av Judge.me självt: dubblettspärren i importskriptet är minnet.

## Fas 1 — Vilka produkter är aktuella?

Kandidater = undermapparna i Drive-mappen **MAKE TO NORWAY**
(`1z6oJt1dTu1kwXU-s1_RQkwIRFar3zeOw`), alltså produkter videobatchen redan
lokaliserat:

```bash
python3 tools/drive-ls.py 1z6oJt1dTu1kwXU-s1_RQkwIRFar3zeOw
```

Redan importerade produkter behöver inte sorteras bort för hand — spärren i
Fas 4 hoppar över dem.

## Fas 2 — Hitta arket och den norska produkten

Per produkt som inte redan står i `market-expansion/no/reviews/build/sources.json`:

1. Leta upp den **svenska** produktmappen i Drive-huvudmappen
   `1-vbYhYgTEv7zYptW5rGmgKAITmAz4l1X` (`python3 tools/drive-ls.py <mapp-id>`).
2. Ta arket som heter `<Produkt>_REVIEWS` / `_Reviews` / `_REVIEW` — stavningen
   varierar, matcha skiftlägesokänsligt på "review".
   **Saknas arket: hoppa över produkten och rapportera den.** Skriv aldrig egna
   recensioner.
3. Slå upp produktens norska handle i `https://beverbutikken.no/products.json`
   (publik feed, ingen token). Finns produkten inte där är den inte lanserad
   ännu — hoppa över och rapportera.
4. Lägg till produkten i `sources.json`.

## Fas 3 — Översätt och bygg

Nya strängar in i `build/translations.no.json` (svensk text → norsk bokmål),
nya recensentnamn in i `build/names.no.json` (`-sson` blir `-sen`). Naturlig
bokmål som en kund faktiskt skriver — inte svorsk.

```bash
python3 market-expansion/no/reviews/build/make-no-reviews.py          # alla
python3 market-expansion/no/reviews/build/make-no-reviews.py --bara <id>
```

Bygget vägrar rader vars text eller namn saknas i kartorna, så inget slinker
igenom oöversatt. Det byter också namn + e-post (`example.com`), sätter det
norska handlet, byter ort till norsk och nollställer `product_id`,
`ip_address` och `metaobject_handle`.

Rader utan giltigt betyg väljs bort och listas — **fyll aldrig i ett betyg
själv.** Är hela produkten bortvald är källarket trasigt, inte skriptet:
rapportera det till Axel och gå vidare.

## Fas 4 — Importera

```bash
node tools/judgeme-import.mjs market-expansion/no/reviews/output/<id>.no.csv \
  --product-handle <no-handle> --store-url https://beverbutikken.no \
  --shop-domain "$JUDGEME_NO_SHOP_DOMAIN" --token-env JUDGEME_NO_API_TOKEN --dry
```

**Kör alltid `--dry` först** och läs raderna. Ser de rätt ut: kör om utan `--dry`.

Skriptet kollar själv om produkten redan har recensioner och hoppar i så fall
över den — Judge.me har ingen egen dubblettspärr, och en andra körning skulle
ge produkten allt i dubbel upplaga. Vill man ändå lägga på en påbyggnadsbatch:
`--anda`, men bara på Axels uttryckliga begäran.

⚠️ **Judge.me-tokens är per butik.** `JUDGEME_API_TOKEN` är den SVENSKA butikens
och ger `Failed to authenticate` mot den norska. Saknas `JUDGEME_NO_API_TOKEN`:
bygg CSV:erna klart, lämna dem i `output/`, och skriv i rapporten att importen
väntar på tokenen. Kör aldrig mot den svenska butiken i stället.

## Fas 5 — Rapportera

```bash
node tools/notify-discord.mjs "<rapporten>"
```

Kort rapport: per produkt antal importerade recensioner, överhoppade (redan
importerade eller trasigt ark) med orsak. Inget nytt att göra = en rad.
Misslyckas skicket: nämn det på en rad och fortsätt.

Committa `sources.json`, kartorna och `output/`, och pusha.

## Definition of done

- [ ] MAKE TO NORWAY läst, kandidaterna listade
- [ ] Varje produkt: ark hittat eller överhoppning rapporterad
- [ ] Varje produkt: norskt handle verifierat mot beverbutikken.no
- [ ] Alla nya strängar och namn inlagda i kartorna
- [ ] Bygget kört, bortvalslistan läst och redovisad
- [ ] `--dry` granskad före skarp import
- [ ] Importen körd, eller blockeringen skriven i rapporten
- [ ] Rapport skickad i Discord
- [ ] Allt committat och pushat
