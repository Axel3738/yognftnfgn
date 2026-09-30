# worldwide/ — Bäverbutiken i hela världen som **Beaver Store** (beaverstoreco.com)

Axels order 2026-09-30 (`/goal`): "fixa bäverbutiken till world fucking wide … runna upp
alla produkter som gått bra … topp 5–10 ads från varje produkt … aktiverar markets för alla
länder … anpassat hela hemsidan med priser, språk, logotyp … Beaverstoreco.com … svenskt
varumärke-vinkeln … en widget för alla marknader som inte är Sverige att det är free shipping
till deras country". Judge.me:s automatiska översättning slår Axel på själv.

**Samma Shopify-butik som baverbutiken.se** (`4snrw0-mg`), en ny marknad **Worldwide** med
egen domän och engelska. Samma pixel (Bäverbutiken.se `1554276343018184`) — köpen ÄR
Bäverbutikens. Sverige, NO, DK och FI rörs aldrig härifrån.

## Läget 2026-09-30 (mätt)

| Del | Läge |
|---|---|
| Urvalet | 16 produkter med vinstbidrag ≥ 5 000 kr i MagiBorsten (hela livstiden, `urval.json`), 92 annonser: ≥ 300 kr, ≥ 3 köp, positivt vinstbidrag, max 10 per produkt. Axelbältet och solcellslampan är UNDER tröskeln och byggs inte |
| Sajtens engelska | 248 produkter + kollektioner, sidor, policyer, menyer, temats texter i `oversattning/en/` — **248 ✅ / 0 ❌** i `granska.mjs` (siffrorna samma som svenskan, inga kronor, inget "30 dagar" — butikens retur är 14 dagar) |
| Temat | **Patchat i det publicerade temat `210420334941`** (12 filer, originalen i `tema/original/`). Världsläget tar bara på engelska eller på beaverstoreco.com: loggan Beaver Store, annonsraden "🇺🇸 Free shipping to the United States" + "🇸🇪 A Swedish brand", produktsidans fri frakt-rad till kundens land, engelska förtroende- och recensionsband, "Beaver Store" i titel/og/sidfot. Den svenska sidan mätt ordagrant oförändrad (0 diff) |
| Domänen | beaverstoreco.com registrerad 2026-09-30 05:38 UTC hos Loopia, DNS pekar redan på Shopify (A 23.227.38.65, www → shops.myshopify.com), **kopplad i Bäverbutikens Shopify** (API: `shop.domains`). Certifikatet var inte utfärdat ~07:00 UTC (crt.sh 0 certifikat, TLS-handskakningen fel) — Shopify utfärdar själv |
| Shopify: marknad, språk, frakt, översättningar | ⛔ **Väntar på appens rättigheter.** "Bäver uppladdare" (`SHOPIFY_*_SE`) saknar markets/translations/locales/shipping — `cowork/1-app-och-doman.txt` lägger till dem. Sedan: `node worldwide/bygg.mjs --alla --skarpt` |
| Bildannonser | 25 engelska bilder i `annonser/klar/` (OCR-mätta, suddade, omritade med `bildrita.mjs` + `zonrita.py`, tittade på av sessionen), 7 hoppade (fars dag, "verifierad kund"-citat, text som inte går att flytta) |
| Videoannonser | Svenska transkript (Whisper lokalt) i `annonser/transkript/`, engelska manus för 47 videor i `annonser/manus-en/` (sonnet mot `REGLER-VIDEO.md`, samma cues och tider; 9 hoppade av copyn, 4 utan röst i källan). **En provvideo renderad:** `Motorhölje_PD_1_H3` (röst "CJ - Young Swedish Male", bandläget, röstkollen ✅, bilderna tittade på, rösten inte lyssnad på). `Batmotor_SP_1_H5` stoppades rätt: källan har en svensk checklista i bild som bara textbyte kan ta. **Resten väntar på ElevenLabs:** 10 387 tecken kvar till 23 okt (Creator), 46 videor behöver ~17 300, och `/translate-no` drar varje natt från samma konto |
| Meta | **16 kampanjer, 16 adset, 26 annonser (25 bilder + 1 video), alla PAUSED och tillbakalästa** i **Magiborsten UK `1107817401910319`** (`annonser/konto.json`), prefix `BEAVERSTORE_WW_`, CBO, platshållarbudget 300 kr/dag som `--aktivera` vägrar tills Axel sagt en budget. Fem kampanjer (IBC, damasker, täljset, golfkalendern, värmesulorna) har bara videoannonser och står tomma tills videorna finns. Id:n: `node worldwide/annonser/bygg.mjs --lage` |

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
- **Videorna:** Axel uppgraderar ElevenLabs, sedan `node worldwide/annonser/video.mjs --skarpt`.
- **Facebook-sidan döps om till Beaver Store** (Axels svar, Cowork steg 6).
- **Frakten: en zon "Worldwide (free shipping)", 0 kr, "5–10 business days"** — samma löfte som
  i Sverige. Länderna flyttas ur sina gamla zoner.
- **Taköverdraget och termoskyddet annonseras inte i CaraShells länder** (US, GB, CA, AU, NZ,
  NO, DK, FI) — två butiker ska inte bjuda mot varandra i samma auktion. Fråga nedan.
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
node worldwide/annonser/bygg.mjs --aktivera --skarpt   # först när konto.json → budget_beslut är Axels
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
| `test/worldwide.test.mjs` | Temat, frakten, konfigen, granskningen, annonserna (i `npm test`) |

## Lärdomar (mätta)

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
