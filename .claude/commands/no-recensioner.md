# /no-recensioner — importera norska produktrecensioner till Judge.me

Kör efter att **Daglig NO-videobatch** meddelat i Discord vilka produkter som
lanserats i Norge. Videobatchen översätter annonserna men rör medvetet inte
REVIEWS-arken (beslut 2026-08-29, `translate-no.md` Fas 3) — den här rutinen
tar den biten.

**Bara Bäverbutiken/Norge.** Rör aldrig den svenska butikens recensioner.

## Fas 0 — Vad har videobatchen sagt?

```bash
node tools/discord-read.mjs --grep "Norge"
```

Meddelandet börjar med `translation till Norge av nya produkter` och listar
produkterna. Kommer inget nytt: rapportera "inga nya produkter" och sluta —
kör inte om gamla produkter.

Får du inga produktnamn ur meddelandet: **gissa inte.** Fråga Axel.

## Fas 1 — Hitta arket och den norska produkten

Per produkt i meddelandet:

1. Leta upp den **svenska** produktmappen i Drive-huvudmappen
   `1-vbYhYgTEv7zYptW5rGmgKAITmAz4l1X` (`python3 tools/drive-ls.py <mapp-id>`).
2. Ta arket som heter `<Produkt>_REVIEWS` / `_Reviews` / `_REVIEW` — stavningen
   varierar mellan mappar, så matcha skiftlägesokänsligt på "review".
   **Saknas arket: hoppa över produkten och rapportera den.** Skriv aldrig egna
   recensioner.
3. Slå upp produktens norska handle i `https://beverbutikken.no/products.json`
   (publik feed, ingen token). Finns produkten inte där är den inte lanserad
   ännu — hoppa över och rapportera.
4. Lägg till produkten i `market-expansion/no/reviews/build/sources.json`.

## Fas 2 — Översätt

Alla nya strängar i arket ska in i `build/translations.no.json`
(svensk text → norsk bokmål) och alla nya recensentnamn i `build/names.no.json`
(svenskt namn → norskt; `-sson` blir `-sen`).

Naturlig bokmål som en kund faktiskt skriver — inte svorsk. Bygget vägrar
importera en rad vars text eller namn saknas i kartorna, så inget slinker
igenom oöversatt.

## Fas 3 — Bygg

```bash
python3 market-expansion/no/reviews/build/make-no-reviews.py          # alla
python3 market-expansion/no/reviews/build/make-no-reviews.py --bara <id>
```

Skriptet översätter text, byter namn + e-post (`example.com`), sätter det
norska handlet, byter ort till norsk och nollställer `product_id`,
`ip_address` och `metaobject_handle`. Rader utan giltigt betyg eller med
okänd text/namn väljs bort och listas — **fyll aldrig i ett betyg själv.**

Läs bortvalslistan innan du går vidare. Är hela produkten bortvald är arket
trasigt, inte skriptet.

## Fas 4 — Importera

```bash
node tools/judgeme-import.mjs market-expansion/no/reviews/output/<id>.no.csv \
  --product-handle <no-handle> --store-url https://beverbutikken.no \
  --shop-domain "$JUDGEME_NO_SHOP_DOMAIN" --token-env JUDGEME_NO_API_TOKEN --dry
```

**Kör alltid `--dry` först** och läs raderna. Ser de rätt ut: kör om utan `--dry`.

⚠️ **Judge.me-tokens är per butik.** `JUDGEME_API_TOKEN` är den SVENSKA butikens
och ger `Failed to authenticate` mot den norska. Saknas `JUDGEME_NO_API_TOKEN`:
bygg CSV:erna klart, lämna dem i `output/`, och skriv i rapporten att importen
väntar på tokenen. Kör aldrig mot den svenska butiken i stället.

## Fas 5 — Rapportera

```bash
node tools/notify-discord.mjs "<rapporten>"
```

Rapporten är kort: per produkt antal importerade recensioner, bortvalda rader
med orsak, överhoppade produkter med orsak. Misslyckas skicket: nämn det på en
rad och fortsätt.

Committa `sources.json`, `translations.no.json`, `names.no.json`, `output/` och
läsmärket i `tools/state/`, och pusha.

## Definition of done

- [ ] Discord läst, produktlistan hämtad ur meddelandet — inte gissad
- [ ] Varje produkt: ark hittat eller överhoppning rapporterad
- [ ] Varje produkt: norskt handle verifierat mot beverbutikken.no
- [ ] Alla nya strängar och namn inlagda i kartorna
- [ ] Bygget kört, bortvalslistan läst och redovisad
- [ ] `--dry` granskad före skarp import
- [ ] Importen körd, eller blockeringen skriven i rapporten
- [ ] Rapport skickad i Discord
- [ ] Allt committat och pushat
