# worldwide/ — Bäverbutiken i hela världen som **Beaver Store** (beaverstoreco.com)

Axels order 2026-09-30 (`/goal`): "fixa bäverbutiken till world fucking wide … runna upp
alla produkter som gått bra … topp 5–10 ads från varje produkt … aktiverar markets för alla
länder … anpassat hela hemsidan med priser, språk, logotyp … Beaverstoreco.com … svenskt
varumärke-vinkeln … en widget för alla marknader som inte är Sverige att det är free shipping
till deras country". Judge.me:s automatiska översättning slår Axel på själv.

**Samma Shopify-butik som baverbutiken.se** (`4snrw0-mg`), en ny marknad **Worldwide** med
egen domän och engelska. Samma pixel (Bäverbutiken.se `1554276343018184`) — köpen ÄR
Bäverbutikens. Sverige, NO, DK och FI rörs aldrig härifrån.

## Läget 2026-09-30 eftermiddag (mätt)

| Del | Läge |
|---|---|
| Urvalet | 16 produkter med vinstbidrag ≥ 5 000 kr i MagiBorsten (hela livstiden, `urval.json`), 92 annonser: ≥ 300 kr, ≥ 3 köp, positivt vinstbidrag, max 10 per produkt. Axelbältet och solcellslampan är UNDER tröskeln och byggs inte |
| Marknaden | **Worldwide ACTIVE** i Shopify: 37 länder, bas USD, lokala valutor (18 i kassan), prislista +25 % (`Beaver Store Worldwide`), fraktzonen "Worldwide (free shipping)" 0 kr — länderna flyttade ur zonerna EU och Internationell, Sverige/NO/DK/FI orörda. Mätt: täckningen 1 129 kr i Sverige = 145 USD / 127,95 EUR / 109 GBP |
| Domänen | **beaverstoreco.com kopplad till Worldwide** (egen webbnärvaro, standardspråk en + de/fr/es/it/nl/pl/pt-PT) — omdirigerar inte längre till baverbutiken.se. baverbutiken.se är fortfarande primär. ⚠️ Från containerns amerikanska IP skickar Shopifys geo-omdirigering nu baverbutiken.se → beaverstoreco.com; en svensk IP får Sverige (`kundvy.mjs --sverige` läser med `?country=SE`) |
| Språken | **Åtta språk, 265 ✅ / 0 ❌ per språk** i `granska.mjs` (hela katalogen, kollektioner, sidor, policyer, menyer, temat). Engelskan skriven av sessionen + sonnet, de sju andra översatta från engelskan av sonnet-agenter mot `oversattning/REGLER-SPRAK.md`. Sidfotens länkar (Användarvillkor, Ångra köp …) och "Garanti för säker frakt"/"Blanda & Spara" lades till efter första kundkontrollen; berättelsen säger inte längre "(Bäverbutiken in Swedish)" |
| Temat | **v3 i det publicerade temat `210420334941`** (13 filer, tillbakalästa; originalen i `tema/original/`). Världsläget: loggan Beaver Store, fri frakt till kundens land, "A Swedish brand", förtroendeband och recensionsband på kundens språk (`snippets/bw-t.liquid` ur `tema/sprak.json`, 25 nycklar × 8 språk), titeln Beaver Store. Svenska sidan kontrollerad orörd |
| Kaching + Judge.me | Apparna gick inte att översätta i admin (Cowork 2026-09-30: Kachings språkväljare har bara SV). **Temat byter deras svenska texter i världsläget** (`snippets/bw-appord.liquid` ur `tema/appord.json`, v5) — sett på tyska produktsidan: "1 Stück", "Am beliebtesten", "14 Tage Rückgaberecht". Ny svensk text i ett Kaching-erbjudande ⇒ lägg raden i `appord.json` och kör patchen. Judge.me:s automatiska översättning av recensionerna är Axels |
| Annonserna i Meta | **16 kampanjer, 151 annonser, 1 000 kr/dag per kampanj.** ✅ **ALLA 16 KAMPANJER ACTIVE sedan 2026-10-01 00:01–00:16 svensk tid**, tillbakalästa: kampanj, adset och alla 151 annonser ACTIVE. Före dess stod annonser och annonsgrupper ACTIVE och kampanjerna PAUSED till 00:01, när sessionens schemalagda väckning slog på dem (`trig_01SCkRkBq19CHjnSoUBZ145p`, `bygg.mjs --aktivera --bara-kampanj --skarpt`). Så blev det eftersom Meta vägrar en ny starttid på adset som redan "startat", och ett adset startar när det skapas. Axels order var: "aktivera alla kampanjer och schemalägg dem till 00.01 imorgon". Antal annonser per kampanj: Båtmotor 12, MC 12, Fiskespö 11, Motorhölje 11, IBC 11, Kamera 11, Termoskydd 11, Sotar 11, Säte 10, Tofflor 10, Bälteslip 10, Damasker 9, Taköverdrag 7, Täljset 5, Golfkalender 5, Värmesulor 5. De sista har inte fler annonser som klarar granskningen: kronor inbrända i filmen, förstapersonsrecensioner, jul- eller fars dag-deadlines och påhittad brådska stryks alltid |
| Videoannonser | ElevenLabs (Pro), rösten "CJ - Young Swedish Male", bandläget, `rostkoll.py` och **`annonser/textkoll.py` (OCR över HELA filmen)** som sista grind. 43 videor granskade och uppladdade. **Hoppade:** alla fem takskyddsvideor (klipp ur Specialised Covers video — samma sekvens som fällde KD-2026-001, ett nytt konto ska inte bära dem), fyra med kronor/butiksnamn/svensk checklista inbränt (`Batmotor_SP_1_H5`, `Batmotor_CS_5_H1`, `Taljset_PD_1_H4`) och `Seatcover_PD_1_3_H1` (röstkollen; kopian används). `Batmotor_UG_1_H1` och `Batmotor_FM_1_H1` fick en stillbild av produkten i stället för den svenska slutbilden (BÄVERBUTIKEN, 579 kr) |
| Meta | 16 kampanjer i **Magiborsten UK `1107817401910319`**, prefix `BEAVERSTORE_WW_`, **1 000 kr/dag per kampanj**, allt PAUSED. Sidan `1305042582683792` heter Beaver Store (Cowork 2026-09-30; Facebook kan granska namnet i upp till 3 dagar). Id:n: `node worldwide/annonser/bygg.mjs --lage` |

## Beslut sessionen fattade (ändra i konfigen om de är fel)

- **Butiksnamnet utomlands är Beaver Store** (domänen), och loggan är Bäverbutikens egen bäver
  med "BEAVER STORE" (`tema/logga/`). Ingen annons nämner butiken (CLAUDE.md), sista raden i varje
  annonstext är "A Swedish brand." (CaraShell-/Matstrumpor-principen).
- **Länderna: 37** (`konfig.json`): US, CA, GB, IE, AU, NZ, EU utom SE/DK/FI, CH, AE, HK, IL, JP,
  KR, MY, SG. Norge, Danmark och Finland har egna Bäverbutiker och ligger aldrig här (testat).
- **Priserna: USD som basvaluta, lokala valutor på, +25 %** (Axels svar 2026-09-30,
  `prisjustering_procent: 25` — prislista USD med procentpåslag på Shopifys omräkning).
- **Budgeten: 1 000 kr/dag per kampanj** (Axels svar 2026-09-30, tolkat per kampanj som
  Matstrumpor utomlands) — satt och tillbakaläst på alla 16 med `annonser/budget.mjs`, alla PAUSED.
  Aktivering kräver ändå Axels ord efter granskning.
- **Videorna:** ElevenLabs uppgraderat av Axel; renderade med `node worldwide/annonser/video.mjs --skarpt --del k/n`.
- **Språken utöver engelska: de, fr, es, it, nl, pl, pt-PT** (Axels "allt språk … till alla marknader", sessionens val av språk efter länderna i marknaden).
- **Facebook-sidan döps om till Beaver Store** (Axels svar, Cowork steg 6).
- **Frakten: en zon "Worldwide (free shipping)", 0 kr, "5–10 business days"** — samma löfte som
  i Sverige. Länderna flyttas ur sina gamla zoner.
- **Taköverdraget och termoskyddet annonseras inte i CaraShells länder** (US, GB, CA, AU, NZ,
  NO, DK, FI) — två butiker ska inte bjuda mot varandra i samma auktion. **Axels beslut A 2026-09-30 kväll.**
- **Kontot:** Magiborsten UK (Bäverbutikens gamla utlandskonto, SEK) — inte MagiBorsten, där
  `/notionkorning` väljer kampanj på annonsprefix och kunde ha lagt svenska annonser i en
  worldwide-kampanj. **Sidan:** BeaverShop `1305042582683792` (Axels gamla UK-sida).
- **Singapore annonseras inte** — Meta kräver deklarationen `SINGAPORE_UNIVERSAL` (mätt).
- **Placeringar:** Facebook-flödet + Instagram-flödet (Axels USA-regel 2026-09-27).
- **Rösten i videorna:** "CJ - Young Swedish Male" (engelska med svensk brytning, finns på
  ElevenLabs-kontot) för vinkeln "A Swedish brand". Alternativet är amerikanska "Chris".

## Körordningen efter Cowork

```bash
node worldwide/bygg.mjs --kolla                 # ✅ appen har alla scopes
node worldwide/bygg.mjs --alla                  # torrt: hela planen
node worldwide/bygg.mjs --alla --skarpt         # marknad → språk → frakt → översättningar → domän → publicera → kontroll
node worldwide/kundvy.mjs                       # beaverstoreco.com som kund i alla 37 länder
node worldwide/kundvy.mjs --sverige             # baverbutiken.se som svensk kund är orörd
node worldwide/annonser/bygg.mjs --skarpt       # kampanjer/annonser som saknas (PAUSED)
node worldwide/annonser/video.mjs --skarpt      # videorna, när ElevenLabs-kvoten räcker
node worldwide/annonser/fyll-urval.mjs <insikter.json> [--spenders] --skarpt   # fyll produkterna till tio annonser
node worldwide/annonser/bygg.mjs --aktivera --skarpt   # kräver budget_beslut; start_time ur konto.json → start (eller --start)
```

## Om marknaden inte går att skapa

`marketCreate` kan vägra av två skäl som inte är kod: planens tak på antal marknader, eller att
ett land redan ligger i en annan marknad som inte får ändras. `bygg.mjs` flyttar länder ur andra
marknader (aldrig ur primärmarknaden Sverige) och skriver varje flytt i torrkörningen — **läs
torrkörningen innan `--skarpt`**. En marknad som blir tom sätts DRAFT, aldrig raderas. Säger
Shopify att planen inte räcker är det Axels beslut (uppgradering kostar pengar).

## Filerna

| Fil | Vad |
|---|---|
| `konfig.json` | Marknaden: länder, valuta, domän, frakt, appens krävda scopes |
| `urval.json` | Vinnarprodukterna och deras topp-annonser (MagiBorsten, vinstbidrag) |
| `bygg.mjs` | Shopify-stegen, torrt som standard, allt läses tillbaka |
| `kundvy.mjs` | Läser sajten som kund per land (språk, valuta, logga, fri frakt, svenska rader) |
| `oversattning/` | Källtexterna (`kalla/`), engelskan (`en/`), reglerna, `granska.mjs` |
| `tema/` | `patch.mjs`, snippets (`bw-lage`, `bw-land`), loggan, originalen |
| `annonser/` | `bygg.mjs` (Meta), `bildrita.mjs` + `zonrita.py` (bilderna), `video.mjs` (videorna), `copy-en.json`, `bildtext.json`, `media.json`, `konto.json`, reglerna |
| `cowork/1-app-och-doman.txt` | Axels enda klickrunda: appens rättigheter, domänen, Kachings engelska |
| `granskning/` | Kundgranskningen 2026-10-01: `kund.mjs` (Chromium som kund per land och språk, kassan utan att betala), `matris.mjs` (HTTP, alla länder × språk), `annonser.mjs`, `ordrar.mjs`, `tackning.mjs`, `temanycklar.mjs`, `temafil-sync.mjs`; rapporten `2026-10-01.md` |
| `cowork/3-granskningen.txt` | Granskningens klick: färgnamnen i Translate & Adapt, Judge.me-översättningen, kundkontroll från svensk IP |
| `test/worldwide.test.mjs` | Temat, frakten, konfigen, granskningen, annonserna (i `npm test`) |

## Granskningen som kund 2026-10-01 (dagen annonserna gick live)

Hela rapporten med tabellen: `granskning/2026-10-01.md`. Det viktigaste för nästa session:

- **Temats världsläge byter apparnas svenska i sidan** (`tema/appord.json` → `snippets/bw-appord.liquid`,
  version a4): Kachings paketväljare, Judge.me-rutans knappar och rubriker, korgens rabattrader,
  färgvärden kopplade till Shopifys färgkategori (`varden`) och Kachings "X - inte tillgängligt".
  Texterna jämförs med enkla mellanslag — Kaching sparar ibland två ("1x  MC-Kapell 218×118 cm").
  Ny svensk text i ett Kaching-erbjudande ⇒ en rad i `appord.json` + `tema/patch.mjs --tema <gid>
  --skarpt`. Kundernas egna recensioner byts aldrig. Trust Badges-raden (Klarna/Swish, svenska) och
  korgens "Popular picks" med Shopifys platshållarprodukter döljs i världsläget.
- **Temat når inte kassan.** Kachings rabattnamn ("2 ST", "2X SKYDDSHÖLJE") och färgnamnen kopplade
  till färgkategorin står kvar på svenska i kassan och mejlen; färgerna rättas i Translate & Adapt
  (`cowork/3-granskningen.txt`), rabattnamnen är Axels beslut (byter man dem ändras Sverige också).
- **Temats språkfiler tappar registreringar i snabb följd** (mätt 2026-10-01: 262 nycklar i tre
  omgångar à 100 — den första hamnade aldrig i `locales/it.json`, fast API:t svarade OK).
  `granskning/temafil-sync.mjs --sprak <l> --skarpt` läser filen och registrerar om det som saknas;
  `bygg.mjs` pausar 12 s mellan omgångarna.
- **Shopifys kassa spärrar efter ~18 kassor i rad från samma IP** ("Deine Verbindung muss
  verifiziert werden") och släppte inte på flera timmar. Kör kassorna glest, högst ett par åt
  gången. Fraktsättets namn går att läsa som kund utan kassan: `/<språk>/cart/shipping_rates.json`
  → `presentment_name`.
- **Butiken stryper vid fler än två webbläsare** (429 och Cloudflares "Just a moment"): kör högst två
  `kund.mjs` samtidigt och aldrig matrisen bredvid.

## Lärdomar (mätta)

- **Tio per produkt** (Axel 2026-09-30 kväll: "top 10 annonser per produkt" + "ta topp fem spenders,
  förutom vinnarna"): `annonser/fyll-urval.mjs` fyller först med annonser med köp (vinstbidrag), sedan
  med `--spenders` (mest spend, ≥ 100 kr) och till sist `--spenders --min-spend 1` (Axels "vi får testat lite mer än en eller tre annonser per produkt"). Unik film/bild, aldrig Specialised Covers klipp, aldrig
  karusell. Ungefär var femte faller i granskningen (kronor/svenska inbränt, kundcitat, jul).
- **Påståenden som inte går att belägga stryks ur manus** ("eight out of eight reviews", "discounted
  today only") — de gäller Bäverbutikens svenska sida, inte Beaver Store.

- **Bildmodellen ritar aldrig text** — kie nano-banana-edit gav "23% RABATT – TOAY" och lämnade
  "1469 kr" kvar. OCR-mätning + suddning + vektortext (`factory/bildmarknad-*.py`) block för
  block gör det, och varje bild mäts med OCR igen efteråt.
- **OCR delar rubriker i ordfragment** — rad-för-rad-ersättning lämnade "en" och "på" kvar.
  `zonrita.py` parar fragment med block och ritar blockets engelska en gång.
- **Butikens retur är 14 dagar**, inte "30 dagars öppet köp" som flera svenska annonser säger.
  All engelska säger 14.
- **Meta stryper kontot (kod 17, subkod 2446079 "för många API-anrop från annonskontot")** —
  bygget backade av 24 gånger och tog 50 minuter för 16 kampanjer. Läs inte kontot medan det
  bygger; varje läsning förlänger spärren. `bygg.mjs` skriver stdout först när den är klar
  (proxyomstarten i `tools/meta-lib.mjs`) — läs kontot efteråt, inte loggen under tiden.
- **Dubbningens ljudspår tog aldrig slut** (Motorhölje_PD_1_H3): ffmpeg kodade tyst ljud i 25
  min. `pipeline/omdubb/elevenlabs-omdubb.mjs` har sedan dess `-t` = planerad längd.
- **Karaoke-rutor i källan:** `--rutor` lämnade kanter med svenska bokstäver som kontrollen inte
  såg. Worldwide-videorna körs därför i bandläget (hela bredden suddas).
