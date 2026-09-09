# OPS Factory

Två konfigfiler beskriver en butik. Resten byggs av EN kedja (`ops.mjs`).
Kontraktet för kedjan — vilken modul som äger vad, exporterna, körordningen —
står i **`factory/KEDJAN.md`**. Rutinen i prosa står i **`factory/PROCESS.md`**.
Den som kör följer **`.claude/commands/ny-ops.md`**.

| Fil | Vad den äger |
|---|---|
| `butiker/<id>.yaml` | Butiken: brand, bolagsnamn, orgnr, adress, supportmail, land, huvudmarknad, valuta, frakt, returvillkor, policydata, `branding:`, `startsida:`, `marknader:`, `markorer_sv:`, `kollektion:`, `judgeme:` |
| `produkter/<id>.yaml` | Produkten: namn, pris, inköp, media, vinkel, målgrupp, problem, benefits, features, `offer:` (paket A/B, bonusprodukt, tillägg), recensioner (med datum), FAQ, leverantör, `kalla:` (källannonserna), `meta:` |

Butiksfilen skrivs **en gång**. Varje ny produkt ärver den — `butik.mjs`
väver ihop dem (`sammanfoga`) innan något byggs. Fraktzonerna härleds ur
butiksfilen (`frakt.mjs`): huvudmarknaden först, fri frakt globalt som default,
express bara på huvudmarknaden — samma konfig ger zonerna i kassan och
fraktraderna på sidan. Noll beroenden — bara Node ≥20.

## Så används det

```bash
node factory/ops.mjs factory/butiker/<butik>.yaml factory/produkter/<p1>.yaml [<p2>.yaml …] --dry-run   # visa allt, rör inget
node factory/ops.mjs factory/butiker/<butik>.yaml factory/produkter/<p1>.yaml [<p2>.yaml …]             # bygg i Shopify
```

`--dry-run` validerar (kritiska fel → ❌ exit 1; ⚠️ stoppar inte), visar
marginal, break-even-ROAS och break-even-CPA, beskriver varje steg utan
nätverk och skriver förhandsvisning + plan + policyer + `qa-checklista.md` till
`factory/output/<produkt>/` och `CHECKLISTA.md` till `factory/output/<butik>/`.
Kör aldrig `validera.mjs` fristående på bara produktfilen — den saknar
butiksfälten och stoppar falskt.

Flaggor: `--resume` (hoppa över gröna steg) · `--igen <steg[,steg]>` (kör om
exakt de stegen) · `--launch` (produkterna ACTIVE + publicerade — vägrar om
QA inte är helt grön för butiken OCH varje produkt; skriver ut temat VA:n ska
publicera) · `--store-ready` (slutsteget: recensioner, pixel + CAPI, Discord).

Flera produktfiler = en flerproduktsbutik (kollektion på startsidan, en
menyrad per produkt, QA per produkt). Motorn stoppar om två produkter delar
`creative_prefix`.

Stegen (0–20) är KEDJAN.md:s tabell: anslutning → tema-upload → brand → tema
→ avbrandning → logga → produkt → metafält → lagerpolicy → bonus → paket →
kollektion → startsida → sidor/policyer/meny/frakt/huvudmarknad →
källskanning → recensioner → marknad → översättning → QA → checklista →
slutrapport. Varje steg är idempotent och bokförs i
`factory/state/<butik>--_butik.json` respektive `<butik>--<produkt>.json`
(gitignorerade, aldrig hemligheter). Ett steg som bara kan göras för hand
rapporteras 🖐 och räknas aldrig som klart. QA körs alltid färskt och hämtar
RIKTIG HTML — utan HTML är den röd.

Gamla formen fungerar fortfarande: `node factory/ops.mjs BUILD <produkt.yaml>`
/ `LAUNCH <produkt.yaml>` (`--butik <id>` när flera butiksfiler finns).

Tokens: kedjans steg 0 (`token.mjs`) mintar en Admin-token ur butikens egen
app (`SHOPIFY_SHOP` + `SHOPIFY_CLIENT_ID` + `SHOPIFY_CLIENT_SECRET` i miljön)
och skriver `factory/.env`. Aldrig i git. Mallen: `.env.example`.

### Front end

**Visuell bas sedan 2026-09-05: Axels CRO-tema** (Dawn 15.4 + ms-komponenterna
från matstrumpor-cro-v5, `tema/ops-tema.zip`). OPS-sektionerna renderas med
temats ms-klasser och designtokens. Köpblock, gallery och sticky ATC ägs av
temat — fabriken bygger aldrig egna. Fabriksägda filer (`TEMAFILER`, bl.a.
`assets/ms-paket.js`) skrivs över i varje butik.

Säljtexten ligger i **metafält** (`opf`-namespace), aldrig i beskrivningen.
Sju block i fast ordning (Axels beslut 2026-09-05): **1 problem/emotion →
2 gif → 3 lösningen → 4 gif/bild → 5 funktioner → 6 bild → 7 garanti** —
sedan Judge.me-widgeten (i temats Appyta, aldrig egen styling) och FAQ:n.
Saknas ett metafält renderas sektionen inte alls.

Köpvillkoren (`policyer.mjs`) byggs ur produktfilen + svensk lag (14 dagars
ångerrätt, 3 års reklamationsrätt). Saknas företagsuppgifter skrivs `[FYLL I]`
och QA stoppar på det. ⚠️ Branschstandard, inte juridisk rådgivning.

## Modulerna

Kedjans moduler (ägartabellen i KEDJAN.md) — en modul per funktion:

| Modul | Vad | CLI |
|---|---|---|
| `ops.mjs` | Stegmotorn — hela kedjan, `STEG` = KEDJAN.md | se ovan |
| `state.mjs` | State per nivå, `arbetstemaId`, slutrapportens två listor | — |
| `token.mjs` | Steg 0: token ur butikens app, tre spärrar, `.env` | `node factory/token.mjs --butik <id> [--kolla] [--torr]` |
| `tema-upload.mjs` | Steg 1: `tema/ops-tema.zip` → UNPUBLISHED-tema, idempotent på namn | `node factory/tema-upload.mjs factory/butiker/<butik>.yaml [--torr]` |
| `shopify.mjs` | Admin GraphQL-klienten: produkt, sidor, meny, kollektion, teman, frakt, metafält | — |
| `filer.mjs` | Bilder → `shopify://shop_images/<lagrat namn.ext>`, idempotent på filnamn | `node factory/filer.mjs <url-eller-fil> …` |
| `logga.mjs` | Steg 5: logga + favicon in i temat, tillbakaläst på värde | `node factory/logga.mjs <logga.png> [--favicon <fil>] [--bredd 140] [--tema <id>]` |
| `logga-generera.mjs` | Tre runda loggvarianter (valfritt verktyg, **sharp**, säger ifrån utan) | `node factory/logga-generera.mjs factory/butiker/<butik>.yaml [--ut <mapp>]` |
| `bildtext.mjs` | Vektortext på bild, [SV]/[NO] (valfritt verktyg, **sharp**) | `node factory/bildtext.mjs <in> <ut> --spec <json>` |
| `branding.mjs` | Steg 2: brand-CSS, settings-patch (`cart_type: drawer`), `STJARNFARG` | — |
| `tema.mjs` | Steg 3: opf-sektioner, `TEMAFILER`, produktmall (A/B-block, tilläggs-kryssruta), header-group, `rensaSettings`, gallerifilter, `patchaMsPaket`, korg-upsell | — |
| `avbranda.mjs` | Steg 4: källsektioner + källtext bort ur temat | `node factory/avbranda.mjs <butik-id> [--torr] [--tema <id>]` |
| `kallskanning.mjs` / `kallskanning-kor.mjs` | Steg 14: skanning (ren logik) / hämta ALLA temafiler paginerat | `node factory/kallskanning.mjs <butik-id> [--tema <id>]` (exit 1 vid träff) |
| `build-store.mjs` | Produktplanen ur filen (ACTIVE, CONTINUE, tracked false), `produktHandle` | `node factory/build-store.mjs <produkt.yaml> [--dry-run]` (äldre enproduktsväg) |
| `metafalt.mjs` | Steg 7: säljinnehållet som `opf`-metafält | — |
| `lagerpolicy.mjs` | Steg 8: CONTINUE + tracked false, tillbakaläst | `node factory/lagerpolicy.mjs <produkt-handle> [--torr]` |
| `bonus.mjs` | Steg 9: Q4-bonusprodukten som egen produkt, id:n tillbaka i filen | `node factory/bonus.mjs factory/produkter/<id>.yaml [--torr]` |
| `paket.mjs` | Steg 10: `ms_paketniva`-metaobjekt + rabattkoder på öret, valutaspärr, mitten förvald | `node factory/paket.mjs <butik.yaml> <produkt.yaml> [--torr] [--tvinga] [--stada]` |
| `startsida.mjs` | Steg 12: `templates/index.json` + sidfotens bolagsblock ur `butik.startsida` | — |
| `meny.mjs` | Steg 13: huvudmenyns rader (ren logik) | — |
| `policyer.mjs` / `frakt.mjs` | Steg 13: villkor + kontaktsida / fraktplan och skillnad mot butiken | — |
| `judgeme.mjs` + `tools/judgeme-import.mjs` | Steg 15: app-CSV med originaldatum, husets CSV, API-import (`--krav-datum` opt-in, `--mejlsuffix`) | `node tools/judgeme-import.mjs <csv> --product-id <id>` |
| `marknad.mjs` | Steg 16–17: marknad + locale + webPresence, translationsRegister på ALLT (värdematchning) | `node factory/marknad.mjs <butik-id> [--locale nb] [--torr]` |
| `oversattning.mjs` / `oversattning-granska.mjs` | Underlag `output/<butik>/oversattning-sv.json` + läsning av `oversattning-<locale>.json` / täckning per resurstyp (läs-bar) | `node factory/oversattning.mjs <butik.yaml> <produkt.yaml …>` / `node factory/oversattning-granska.mjs <locale> [--allt]` |
| `kundvy-kor.mjs` / `kundvy.mjs` | Steg 18: riktig HTML (lösenord, locale, 429-paus) / kontrollerna på HTML (brand, logga, hero, meny, struktur, markörer ur `butik.markorer_sv`) | `node factory/kundvy-kor.mjs <butik-id> <produkt-id> [--losenord …] [--fil …]` |
| `trippelkoll.mjs` | Steg 18: hela butiken tillbakaläst ur API mot yaml | `node factory/trippelkoll.mjs <butik-id> <produkt-id> …` |
| `kontroll.mjs` / `tema-qa.mjs` | Launch-punkterna (ren logik) / empty-state-QA av sektionerna | — |
| `checklista.mjs` | Steg 19: VA:ns checklista, EN fil per butik (engelska) | — |
| `store-ready.mjs` | Slutsteget: recensioner via API om token, pixel + CAPI, Discord | `node factory/store-ready.mjs <butik-id> [--torr] [--guild <id>]` |
| `meta-setup.mjs` | Pixel i OPS-kontot (fallback på företaget), CAPI-användare | `node factory/meta-setup.mjs factory/produkter/<id>.yaml [--torr]` |
| `discord.mjs` | Kanalerna i servern VA:n skapat, redigerare ur standby | `node factory/discord.mjs factory/butiker/<butik>.yaml --guild <id> [--ikon <logga>]` |
| `validera.mjs`, `butik.mjs`, `yaml.mjs`, `env.mjs`, `launch-input.mjs`, `sida.mjs` | Konfig: validering, sammanvävning, YAML-läsare, `.env`, `LAUNCH-INPUT.yaml`, förhandsvisningens sidmall | — |

FAS2-modulerna (annonsfasen, `factory/FAS2.md` + `/ny-annonser`):

| Modul | Vad |
|---|---|
| `brand-detektor.mjs` + `brandord.mjs` + `brand-text.py` | Uppdrag A: vilka källannonser bär brandet (fyra ytor, fuzzy) |
| `villkorsskanning.mjs` | Sjätte ytan: källbutikens villkor i bild/ljud |
| `kallannonser.mjs` | Källannonserna ur SE + NO-kontot → `output/<id>/kallannonser.json` |
| `media-upload.mjs` / `media-grind.mjs` | Media upp i målkontot / grinden som dömer creativen |
| `kampanjkoll.mjs` | Trippelkollen för en OPS-kampanj mot vågkonfigen |
| `srt-fixa.mjs`, `bygg-tankguard*.mjs` | Rättade SRT:er / TankGuards engångsbyggen (butiksspecifika, rörs inte) |

Tester: `node --test factory/test/*.test.mjs` (inga nätverksanrop).

## Regler

- YAML-läsaren stödjer en delmängd: all text på **en rad**, citera text med
  `:` eller `#`. Inga flerradiga block. Tomma listor skrivs som mallen
  (nyckeln följd av `- ""`), aldrig `[]`.
- `meta.page_id`/`pixel_id` kopieras aldrig från en annan verksamhet.
- Noll npm-beroenden i `factory/` — `sharp` bara i `logga-generera.mjs` och
  `bildtext.mjs` (KEDJAN regel 5).
- Inga butiksspecifika hårdkodningar i kedjans moduler (KEDJAN regel 7).
