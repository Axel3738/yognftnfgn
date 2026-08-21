# Uppladdning till matstrumpor.se

Körs när Shopify-connectorn är auktoriserad mot **matstrumpor.se**. Inget här
rör den publicerade butiken.

## Steg 0 — verifiera butiken

```
get-shop-info  →  domain måste vara matstrumpor.se
```

Är den något annat: **stanna**. Fel butik ger tal som ser rimliga ut men
kommer från fel verksamhet.

## Steg 1 — kontrollera bygget lokalt

```bash
npm run tema:grind
```

Både Liquid-kontrollen och de 26 testerna ska vara gröna. Ladda aldrig upp
med en röd grind — Shopify avvisar ogiltig schema-JSON, och då står temat
halvt uppladdat.

## Steg 2 — hitta eller skapa ett bastema

```
themes(first: 20) { nodes { id name role themeStoreId } }
```

- Finns **Horizon** eller **Dawn** opublicerat → använd det.
- Finns det inte → be Axel lägga till Horizon gratis från Shopifys temabutik
  (ett klick), eller skapa ett från Dawns publika zip.

**Duplicera basetemat innan du rör det**, och döp kopian till
`Matstrumpor CRO`. Rör aldrig `role: MAIN`.

## Steg 3 — läs basetemats verkliga struktur

Det här steget går inte att hoppa över och går inte att gissa sig till.

```
theme(id: "...") { files(first: 250, filenames: ["sections/*", "blocks/*", "layout/*", "templates/product.json"]) { nodes { filename } } }
```

Läs `templates/product.json` och `layout/theme.liquid` i sin helhet. Du behöver
veta vad temats produktsektion **faktiskt heter** och vilka blocktyper den
tillåter. Horizon och Dawn skiljer sig här, och ett `product.json` som pekar på
en blocktyp som inte finns gör produktsidan tom.

Det är också därför inget färdigt `templates/product.json` ligger i repot: det
måste byggas mot det bastema som faktiskt används.

## Steg 4 — ladda upp filerna

`themeFilesUpsert` mot kopian, med allt ur:

```
assets/ms-cro.css   assets/ms-cro.js   assets/ms-ab.js
snippets/ms-*.liquid
blocks/ms-*.liquid
sections/ms-*.liquid
```

## Steg 5 — koppla in i temat

1. **`layout/theme.liquid`** — lägg `{% render 'ms-head' %}` precis före `</head>`.
   Läs filen, lägg till raden, skriv tillbaka hela filen. Skriv aldrig över den blint.
2. **`config/settings_schema.json`** — läs den, lägg till objektet ur
   `config/settings_schema.fragment.json` sist i listan, skriv tillbaka.
   Behåll `theme_info` först — Shopify kräver det.

## Steg 6 — bygg produktmallen

Ordningen i köpblocket, uppifrån och ner. Den är vald efter var ögat är och var
tvekan uppstår, inte efter vad som ser prydligt ut:

| # | Block | Varför där |
|---|---|---|
| 1 | temats titel + pris | oförändrat |
| 2 | `ms-points` | nyttan direkt under priset |
| 3 | `ms-bundle` | valet innan knappen, inte efter |
| 4 | temats köpknapp | oförändrad |
| 5 | `ms-trust` | direkt under knappen, där tvekan finns |
| 6 | `ms-delivery` | konkret datum |
| 7 | `ms-pay` | betalsätten |
| 8 | `ms-faq` | invändningarna |
| 9 | `ms-guarantee` | sista invändningen |

Sektioner under köpblocket: `ms-compare` → `ms-reviews` → `ms-faq-section`.
Lägg `ms-sticky-atc` sist i mallen.

## Steg 7 — leverera förhandslänken

```
https://matstrumpor.se/?preview_theme_id=<id>
```

Testa själv först: produktsidan, kundvagnen, kassan fram till betalsteget.
Kontrollera särskilt att paketväljaren byter variant på riktigt — lägg i
varukorgen och se att rätt variant hamnar där.

## Steg 8 — sätt igång A/B först när trafiken räcker

```bash
npm run tema:ab -- --planera --baslinje <konv> --trafik <besökare/dag>
```

⚠️ Annonskontot för Matstrumpor (`730973156224390`) är markerat **UNSETTLED** i
`CLAUDE.md`. Rullar inga annonser finns nästan ingen trafik, och då är A/B-test
fel verktyg — bygg förbättringen rakt av i stället. Kontrollera trafiken innan du
föreslår ett test.

## Publicera

Bara Axel bestämmer det. Publicera aldrig själv.
