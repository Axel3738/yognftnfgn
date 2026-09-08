# OPS Factory

Två konfigfiler beskriver en butik. Resten byggs automatiskt.

| Fil | Vad den äger |
|---|---|
| `butiker/<id>.yaml` | Butiken: brand, bolagsnamn, orgnr, adress, supportmail, land, huvudmarknad, valuta, frakt, returvillkor, policydata, basgarantier |
| `produkter/<id>.yaml` | Produkten: namn, pris, inköp, media, vinkel, målgrupp, problem, benefits, features, erbjudande, recensioner, FAQ, leverantör, Meta |

Butiksfilen skrivs **en gång**. Varje ny produkt ärver den — bolagsuppgifter,
frakt, returvillkor och köpvillkor följer med utan att skrivas in igen.
`butik.mjs` väver ihop dem (`sammanfoga`) innan något byggs, så resten av
fabriken aldrig behöver veta om delningen.

Fraktzonerna härleds ur butiksfilen (`frakt.mjs`): huvudmarknaden först,
fri frakt globalt som default, express bara på huvudmarknaden. Samma konfig
ger både zonerna i kassan och fraktraderna på sidan — de kan inte säga olika.



En produktfil per vinnande produkt är source of truth för allt som byggs sen
(butik, produktsida, recensioner, annonser). Noll beroenden — bara Node ≥20.

## Så används det

1. Kopiera `produkt-mall.yaml` till `produkter/<id>.yaml` och fyll i.
2. Validera:

```bash
node factory/ops.mjs factory/butiker/<butik>.yaml factory/produkter/<id>.yaml --dry-run
```

(ops.mjs sammanfogar butik + produkt — kör aldrig validera.mjs fristående
på bara produktfilen: den saknar butiksfälten och stoppar falskt.)

Kritiska fält som saknas → ❌ och exit 1, systemet stoppar direkt.
Varningar (⚠️) stoppar inte, men ska vara ifyllda före launch.
Grön validering visar även täckningsbidrag, break-even-ROAS/CPA och
target-ROAS/CPA. **Talen räknas MED butikens moms** (`moms_i_pris` +
`moms_procent` i butikskonfigen) sedan 2026-09-08 — se `ekonomi.mjs`.
⚠️ Bäverbutikens break-even-tal gäller aldrig här: den säljer utan moms, och
samma pris och inköp ger då ~40 % generösare kill-linje.

Exempel med allt ifyllt: `produkter/dummyprodukten.yaml`.

## Steg 2 — bygg butiken ur filen

```bash
node factory/ops.mjs factory/butiker/<butik>.yaml factory/produkter/<id>.yaml --dry-run   # visa allt, rör inget
node factory/ops.mjs factory/butiker/<butik>.yaml factory/produkter/<id>.yaml             # skapa i Shopify
```

(`build-store.mjs` är den äldre enprodukts-vägen — den validerar produktfilen
ensam och stoppar falskt på mall-baserade filer utan butiksfält.)

- Validerar först — kritiska fel stoppar bygget.
- Bygger one-product-sidan ur den återanvändbara mallen i `sida.mjs`:
  hero → problem/lösning → benefits → reviews → offer → FAQ → shipping →
  garanti (+ sticky add-to-cart i förhandsvisningen; köpknappen ägs av
  temat och kopplas i steg 3).
- Skriver alltid `factory/output/<id>/forhandsvisning.html` + `plan.json`
  (gitignorerade) så du kan granska sidan lokalt.
- Skarpt läge skapar produkten via Shopify Admin GraphQL API (`productSet`):
  titel, pris, jämförpris, varianter, bilder, beskrivning, SEO — som **DRAFT**.
  Ingenting publiceras live. Samma fil igen uppdaterar samma produkt (handle).
- All sidtext kommer ur produktfilen — inget hittas på. Ad copy skrivs
  fortfarande i de befintliga annonsflödena (regel 6 i CLAUDE.md).

Tokens: kopiera `.env.example` till `factory/.env` och fyll i. Aldrig i git.

## Kommandot — hela butiken i ett svep

```bash
node factory/ops.mjs factory/butiker/<butik>.yaml factory/produkter/<produkt>.yaml
```

Flaggor: `--dry-run` (visa allt, rör inget) · `--resume` (hoppa över gröna steg)
· `--launch` (publicera — vägrar om QA inte är helt grön).

Stegen i ordning: produkt (DRAFT) → metafält → OPS-temat → sidor →
policyfält → sidfotsmeny → fraktzoner → huvudmarknadskontroll → QA.
Varje steg är idempotent (omkörning ger inga dubbletter) och skriver sitt
resultat till `factory/state/<butik>--<produkt>.json` (gitignorerad, aldrig
hemligheter — allt filtreras genom `rensaHemligheter`). Ett steg som bara kan
göras för hand rapporteras som 🖐 och räknas inte som klart.

Gamla formen fungerar fortfarande:

```bash
node factory/ops.mjs BUILD  factory/produkter/<id>.yaml   # bygg allt säkert, review-läge
node factory/ops.mjs LAUNCH factory/produkter/<id>.yaml   # gå live (kräver allt grönt)
```

**BUILD** validerar, kör connection-check, skapar/uppdaterar produkten som
DRAFT, bygger sidan och skriver `forhandsvisning.html`, `plan.json` och
`qa-checklista.md` till `factory/output/<id>/`. Publicerar aldrig något.
Utan tokens körs allt lokalt och Shopify-steget hoppas över.

### Front end

**Visuell bas sedan 2026-09-05: Axels CRO-tema** (Dawn 15.4 + ms-komponenterna
från matstrumpor-cro-v5 — spacing, typografi, kort, knappar, paketväljare,
sticky ATC). OPS-sektionerna renderas med temats ms-klasser och designtokens.
Köpblock, gallery och sticky ATC ägs av temat (main-product, ms-paket,
ms-sticky-atc) — fabriken bygger aldrig egna.

Säljtexten ligger inte i produktbeskrivningen utan i **metafält** (`opf`-namespace).
Beskrivningen följer ALLTID sju block i samma ordning (Axels beslut 2026-09-05):
**1 problem/emotion → 2 gif → 3 lösningen → 4 gif/bild → 5 funktioner →
6 bild → 7 garanti** — sedan Judge.me-widgeten och FAQ:n. Texterna för block
1/3 står i produktfilens `beskrivning:`, median i `media:` (`gif_problem` och
`media_losning` är kritiska för launch, `bild_lifestyle` valfri och döljs utan).

**Recensionerna ägs av Judge.me** — ingen egen sektion. BUILD skriver
`output/<id>/judgeme-import.csv` (husets kolumnformat) som importeras med
`node tools/judgeme-import.mjs <csv> --product-id <id>`; widgetens plats i
templaten lämnas fri. Live-temat rörs aldrig — Shopify blockerar dessutom
skrivningar mot det.

Varför metafält: nästa produkt får samma sida utan att någon rör Liquid-koden.
Saknas ett metafält renderas sektionen inte alls, så temat behöver inga villkor.

BUILD skriver också butikens köpvillkor ur produktfilen — retur, frakt och
köpvillkor plus kontaktsidan (`policyer.mjs`). Texterna bygger på det som står i
filen (leveranstid, fraktpris, garanti) och på svensk lag (14 dagars ångerrätt,
3 års reklamationsrätt). Saknas företagsuppgifter skrivs `[FYLL I]` i stället
för gissningar, och LAUNCH stoppar på både `[FYLL I]` och exempeluppgifter.
⚠️ Villkoren är branschstandard, inte juridisk rådgivning — läs igenom dem.

**LAUNCH** verifierar tretton punkter (`kontroll.mjs`): produkt, priser, varianter,
bilder, copy, reviews, frakt, guarantee, tracking, theme, domän, villkor, checkout.
Ett kritiskt fel = STOPP och inget publiceras. Allt grönt = produkten sätts
ACTIVE och publiceras i Online Store-kanalen. LAUNCH rör aldrig annonskontot.

## Filerna

| Fil | Vad |
|---|---|
| `produkt-mall.yaml` | Tom mall med alla fält och förklaringar |
| `produkter/dummyprodukten.yaml` | Ifyllt exempel (dummy, ingen riktig produkt) |
| `validera.mjs` | Valideringen — CLI + exporterad `validera()` |
| `ekonomi.mjs` | Skalningsekonomin: break-even/target räknat med butikens moms. CLI skriver ekonomiblocket |
| `produkter/register.json` | **OPS-produktregistret** — butik ↔ produkt ↔ konto ↔ prefix ↔ kampanj ↔ budget. Aldrig `products/products.json` |
| `register.mjs` | Uppslagningen i registret + kontospärren + kvotläget |
| `skalning.mjs` | ANALYSMETOD steg 0–6 ur det DELADE annonskontot, filtrerat på brandprefix |
| `minne/<butik>/` | Produktminnet per OPS-butik: `dna.md`, `batch-log.md`, `backlog.md` |
| `yaml.mjs` | Minimal YAML-läsare (noll beroenden) |
| `ops.mjs` | Stegmotorn — hela kedjan konfig → butik |
| `butik.mjs` | Butikskonfigen + sammanvävningen med produktfilen |
| `frakt.mjs` | Fraktplan och skillnadsberäkning mot butiken |
| `state.mjs` | Körstate för `--resume`, aldrig hemligheter |
| `kontroll.mjs` | LAUNCH-verifieringens punkter |
| `policyer.mjs` | Retur-, frakt- och köpvillkor ur produktfilen |
| `metafalt.mjs` | Säljinnehållet som Shopify-metafält (namespace `opf`) |
| `tema.mjs` | Front end: Liquid-sektionerna som läser metafälten |
| `build-store.mjs` | Byggmotorn — fil → plan → dry-run eller Shopify |
| `sida.mjs` | Återanvändbar sidmall (sektionerna) |
| `shopify.mjs` | Admin GraphQL-klienten (officiella API:t) |
| `env.mjs` | Läser `factory/.env` |
| `.env.example` | Variablerna som ska fyllas i |
| `test/` | Tester: `node --test factory/test/*.test.mjs` |

## Regler

- YAML-läsaren stödjer en delmängd: all text på **en rad**, citera text med
  `:` eller `#`. Inga flerradiga block.
- `meta.page_id`/`pixel_id` kopieras aldrig från en annan verksamhet.
