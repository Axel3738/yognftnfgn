## USA-runda 20 — 2026-10-03 (`/ops-oversatt carashell/takskyddet --marknad US`)

**Sju nya videor i kön** (`SE-ACTIVE to be translated`), alla konceptet OB, alla
med inbränt svenskt pris i bild. `Approved` hade 74 rader och 0 eftersläpande i US.

### Nytt sedan i går: Australien är ett extra mål

Registret bär sedan 2026-10-03 `malkampanj.US.ocksa` → **AU**, Axels egen kampanj
`AU LISTICLE Taköverdrag CARASHELL` (`120251471312320435`). Varje ny rad ska
alltså upp två gånger: i US-målet och i AU-kampanjen under `_AU_`-namnet.

⛔ **AU-copyn bär inget pris.** US-copyn säger $199 (was $249) ur produktfilens
`marknadspriser`. Australien har **ingen AUD-rad** där, och sidan visar Shopifys
egen omräkning som rör sig: **A$292 (was A$366) den 3/10 mot A$286 den 17/9**
(läst live på `…-lagerrensning-au?country=AU`). Regel 4 i kommandofilen säger att
copyn då skrivs utan pris, så sonnet skrev ett eget `au`-block per video: samma
koncept, samma mekanism, inget belopp och ingen procent. **Videon är densamma och
säger "one hundred ninety-nine dollars" — för en australisk tittare är det inte
sidans pris.** Det är en fråga till Axel, inte något jag har rättat.

⛔ **Instagram-kontot går inte att ärva till AU.** Kampanjens befintliga annonser
bär `instagram_actor_id 17841421066812446`, och Meta vägrar skapa en annons med
det: `(#100) Param instagram_actor_id must be a valid Instagram account id`. Id:t
går inte heller att läsa med systemanvändarens token (kräver sidtoken). US-målets
annonser har ingen IG alls och fungerar, så AU-annonserna laddas upp med
`--ig ingen` — Meta serverar då Instagram via sidans egen identitet.

### ⛔ Fyndet: BÄVERBUTIKEN-loggan låg osuddad på ett slutkort

`CaraShellRoof_OB_122_H1`:s slutkort bär **Bäverbutikens logga med svensk flagga,
helt osuddad** (OCR 0,99, ruta `[290,292,564,348]`). Leveransköns slutkortskoll
dömde den **"ren"** — "slutet rör sig (största diff 101,54 > 6)" — och letade
alltså aldrig efter ett varumärke. Samma sak i 117 (loggplattan suddad av källan,
överkanten kvar skarp) och i 118 och 119 (den svenska raden "SKYDDAR DEN DYRASTE
YTAN" suddad till hälften, bokstävernas underkant syns).

Allt det är borttaget: loggan och raderna målas över med **kortets egen färg**
(mätt bredvid rutan: 251 respektive 253), inte med en blur — en blur blir en grå
fläck mitt i det vita kortet. **Lärdomen: en video utan slutkortsdom är inte
granskad. Titta på sista framen.**

### Den inbrända svenskan, två sorter

| | Videor | Vad | Hur |
|---|---|---|---|
| A | 111, 113, 114 | stor vit pristext i egen stil ovanför captionpillret | ritas om på engelska i samma stil, på en mörk rundad platta som täcker blurrutan |
| B | 117, 118, 119, 122 | röd pop-text som källan själv suddat för svagt, plus priset i captionpillret | hård blur på popen, captionbandet blurras och `fyll` tvingar fram den engelska plattan |

⚠️ **Tre mätfel som bara syntes i en frame:**
1. Pristexten i 113 startar **9,75 s**, inte 11,5 — raderna tonas in en i taget, och
   renderskanningen rapporterade den sista radens starttid. Blurren låg 1,75 s fel.
2. Den svenska priscaptionen i grupp B är **tvåradig, 154 px hög** — över `h_max`
   140, så pillerdetektorn hittade den aldrig. Höjd till 200 och zonen vidgad.
3. Den vita plattan som no-precis lägger över pillret **lät svenskan lysa igenom
   som ett läsbart spöke** (sett i en frame på 118: "1 129 kronor, spara 340" rakt
   igenom den vita rutan). `svenskkoll` gav 0 fynd på den — den mäter text, inte
   spöken. Rättat genom att blurra captionbandet hårt FÖRST och tvinga plattan med
   `fyll`.

### Kontrollerna

- `translate-batch.mjs status --marknad=US`: **✓ English (United States), precision** på alla sju.
- Källskanning (OCR 4 fps) före, renderskanning efter: alla prisrutor mätta på RENDERN.
- `svenskkoll`: **0 fynd på alla sju** efter rättningarna.
- `kvarkoll`: fyra träffar (111, 113, 114, 118) — **alla falska**, tittade i frames:
  ren engelsk caption eller bara bakgrund. Samma lärdom som 29/9.
- `rostkoll`: **grön på alla sju**.
- ⚠️ `ordkoll` kunde **inte** köras: `ELEVENLABS_API_KEY` saknas i den här miljön.
  Det är ingen godkännandestämpel — rösten är okontrollerad ord för ord.
- AI-raden (`--ai rost`) på alla sju; `-ai.mp4` är filen som laddas upp.
- HeyGen: plånboken 126,63 → 120,08 USD för sju precision-renderingar (0,94 st).
  Alla sju låg i moderationskö i cirka en timme — känt, inget att rädda.

### ⚠️ Mätt men inte ändrat: Australienkampanjen står utanför marknadsvakten

`malkampanjIdn()` i `factory/marknadskoll.mjs` läser `malkampanj.<marknad>.kampanj_id`
men **inte** `ocksa`. AU-kampanjen bär 4 169 kr/dag och 27 annonser och mäts alltså
inte alls — samma sorts blindfläck som rättades 2026-10-01, en ny plats.

Hans fyra AU-adsets (`AU_PD`, `AU_CS`, `AU_GT`, `AU_SP`) står på **Advantage+**,
alla 17 placeringar. Spend per placering, mätt 2026-10-03:

| | I går | I dag |
|---|---|---|
| Facebook-flödet | 2 306 kr, 5 köp | 1 584 kr, 1 köp |
| Instagram Stories | **762 kr, 0 köp** | **504 kr, 0 köp** |
| Facebook Reels | 512 kr, 1 köp | 511 kr, 0 köp |
| Instagram Reels | 106 kr, 2 köp | 98 kr, 0 köp |
| Audience Network m.m. | ~150 kr, 0 köp | ~150 kr, 0 köp |

Det är samma mönster som natten 26→27/9 i USA. **Adseten är Axels och rörs inte.**
