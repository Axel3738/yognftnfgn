# /skalningskungen – Creative strategy och skalning för EN OPS-butik

Argument: `$ARGUMENTS` — butiken (butiks-id, produkt-id eller brandnamn ur
`factory/produkter/register.json`), och valfritt egna idéer/instruktioner efter
butiksnamnet.
Exempel: `/skalningskungen hemvakten` eller
`/skalningskungen HeimGuard testa en vinkel mot villaägare med hund`.

Det här är `/cs` för OPS-fabriken. **Samma analysmetod, samma copy-regler, samma
kvot-tänk — men en annan verksamhet.** En instans per OPS-butik.

---

## De fem sakerna som skiljer detta från `/cs` (läs innan du gör något)

| | `/cs` (Bäverbutiken) | `/skalningskungen` (OPS) |
|---|---|---|
| Annonskonto | MagiBorsten `1867947880635861` — ett konto = en verksamhet | **MagiBorsten DK `915422744950975` — DELAT** av alla OPS-butiker OCH Bäverbutikens danska kampanjer |
| Produktregister | `products/products.json` | **`factory/produkter/register.json`** — OPS-produkter står ALDRIG i products.json |
| Ekonomi | Axels COGS-beräkning 2026-08-05, utan moms | **`factory/produkter/<id>.yaml`, räknad MED moms** |
| Produktminne | `products/<id>/` | **`factory/minne/<butik>/`** |
| Kanal | Slack `#bäver-scaling-products` | Butikens egen **Discord**: `#creative-strategy` och `#ads-to-do` |

⚠️ **Kontot är delat. Detta är kommandots farligaste punkt.**
Avläst 2026-09-08 innehöll `915422744950975` sex kampanjer — samtliga
Bäverbutikens danska (Motorhöljet DK, Axelbältet DK, Sätesöverdraget DK,
Strandtofflorna DK, Tofflorna DK, Fiskespöhållaren DK), 69 annonser, noll
OPS-kampanjer. Läser du kontot utan brandprefixfilter rangordnar du en annan
verksamhets annonser mot den här butikens break-even. **Varje avläsning går
genom `node factory/skalning.mjs <butik>`, som filtrerar och redovisar vad den
slängde.** Hämtar du data på annat sätt: filtrera själv på butikens prefix ur
registret, och skriv i svaret hur många rader som filtrerades bort.

⚠️ **Rör aldrig Bäverbutikens DK-kampanjer i kontot.** De är PAUSED med spend =
avvecklade med flit. PAUSED med spend > 0 är ett BESLUT, aldrig ett fel att rätta.

---

## Gör följande, hela kedjan utan att invänta godkännande

### 1. Läs läget

```bash
node factory/register.mjs <butik>     # konto, prefix, break-even, target, kvotläge
node factory/skalning.mjs <butik>     # ANALYSMETOD steg 0–6 ur det delade kontot
```

- **Registret** (`factory/produkter/register.json`): butik, brand, prefix,
  annonskonto, kampanj, Notion-hub, dagsbudget, cykel, launches.
- **Produktfilen** (`factory/produkter/<id>.yaml`): pris, inköp, vinklar,
  erbjudande, paketnivåer och **ekonomiblocket** (break-even + target).
- **Butiksfilen** (`factory/butiker/<butik>.yaml`): branding, tonalitet,
  garantier — och **momsen**, som är det som gör ekonomin till en annan än
  Bäverbutikens.
- `factory/minne/<butik>/dna.md`, `batch-log.md`, `backlog.md` om de finns.
- **Chatthistoriken** om `/skalningskungen` körts i samma chatt tidigare —
  briefarna där är primärkällan för creative-teardownet, precis som i `/cs`.

#### 1a. AOV-grinden — gör detta FÖRE all rangordning

Ekonomiblocket är räknat på styckpriset så länge butiken saknar
försäljningsdata. Varje OPS-butik har **förvalt flerpack**, så verklig AOV blir
högre — och då är break-even fel åt det generösa hållet.

`skalning.mjs` skriver ut verklig AOV (intäkt / köp, minst 10 köp) och larmar
vid >10 % avvikelse. Larmar den, sätt **båda** talen i produktfilen:

1. `ekonomi.aov_sek` = den uppmätta AOV:n.
2. `ekonomi.varukostnad_per_order` = varukostnaden för en **sådan** order.
   ⚠️ Detta tal går INTE att räkna ut ur ordervärdet, och verktyget vägrar
   räkna utan det. Paketen är rabatterade (HeimGuard −16 till −37 %) och bär
   en gratis bonusprodukt, så antalet varor växer snabbare än intäkten — en
   proportionell gissning underskattar COGS och gör kill-linjen för generös.
   Ta antalet ur produktfilens `offer.bundle` och multiplicera med
   paketets styckinköp (`ekonomi`-kommentaren bär inköpspriset per paketnivå).
   Räkna med bonusproduktens inköpspris också om den ingår gratis.
3. Kör `node factory/ekonomi.mjs factory/produkter/<id>.yaml` och klistra in
   de nya talen.
4. **Först därefter** får någon annons dömas.

#### 1a-2. Pixelkontrollen — en gång, vid första ordern

Hela ekonomin antar att Metas purchase value är **bruttot kunden betalade
(inkl. moms)**. Ingen har mätt det. Vid första ordern: jämför en Meta-rads
purchase value mot samma orders totalbelopp i Shopify.

- Samma belopp → antagandet håller, skriv in datumet i `dna.md`.
- Meta ~20 % lägre → pixeln skickar ex moms. Säg det rakt ut och stanna:
  break-even-ROAS ska då räknas på nettot, och talen i produktfilen är fel.

Hitta aldrig på en AOV. Finns ingen försäljningsdata: säg det rakt ut, använd
styckpriset och skriv i rapporten att linjerna är preliminära.

#### 1b. Saknas underlaget helt? (varken chatt eller `factory/minne/<butik>/`)

Kör upphämtning först — hoppa aldrig över det, bygg aldrig en batch på tom
historik:

- Hämta **alla** butikens annonser (hela livstiden:
  `node factory/skalning.mjs <butik> --sedan <butikens första launchdag>`) med
  spend, köp, CPA, ROAS, CTR, hook rate, hold + creatives. Granska de statiska
  bilderna visuellt.
- Gruppera i batcher efter launchdatum och namngivning, skriv `batch-log.md`
  retroaktivt. **Hypoteser som inte loggades i förväg skrivs
  `hypotes: ej loggad (retroaktiv rekonstruktion)`** — gissa aldrig vad någon
  tänkte. Utfallen är riktig data.
- **Ärvd historik (specifikt för OPS):** butikens annonser är ofta
  brand-swappade Bäverbutiksvinnare (FAS2 uppdrag A/A2). Då finns hypotesen och
  utfallet redan i `products/<källprodukt>/batch-log.md` och `dna.md`. Skriv in
  den ärvda historiken i butikens `batch-log.md` med källa och datum — annars
  ser första körningen ett dussin annonser utan hypoteser och lär sig ingenting.
  Märk varje ärvd rad `ÄRVD FRÅN <produkt> — utfallet gällde Bäverbutikens
  publik, pris och sida`. Den är en stark hypotes, aldrig ett bevis här.
- Bygg `dna.md` av det, skapa tom `backlog.md`, och säg i svaret att upphämtning
  kördes och för hur många annonser.

#### 1c. Skriv alltid tillbaka till repot

Efter analysen ska `factory/minne/<butik>/dna.md` och `batch-log.md` vara
uppdaterade. Chatten kan tappas bort — repot är minnet som överlever.

### 2. Feedbackloop på senaste annonserna (detta är poängen med kommandot)

**Följ `docs/os/ANALYSMETOD.md` steg för steg — läs den nu, korta inte ner den.**
Den är **oförändrad och obligatorisk** här: metoden är produktagnostisk. Enda
Bäverbutiksspecifika delen är nivåtabellen (rad 100–109) — den gäller INTE
OPS-butiker. Butikens linjer står i `factory/produkter/<id>.yaml`.

Kraven, kort:

- Hela **butikens** annonsuppsättning hämtad, sorterad på spend, prefixfiltrerad,
  med antalet bortfiltrerade rader redovisat.
- **Färsk dagsbudget läses ur kontot samtidigt** — ändra `daily_budget_sek` i
  `factory/produkter/register.json` om den rört sig, före kvoträkningen.
- Datakvalitetskontrollen körd (`spend × ROAS` vs `omni_purchase_values`) och
  trasiga rader flaggade. Intäkt räknas alltid som `spend × ROAS`.
- Signifikansgrind först: <300 kr spend eller <3 köp = **"för tidigt", ingen dom,
  ingen plats i rankingen**.
- **Rangordna på vinstbidrag** `(break-even-CPA − CPA) × köp` — aldrig på ROAS
  eller CPA ensamt. Visa tabellen med spendandel och vinstandel.
- Kill-beslut mot **break-even**, skalningsbeslut mot **target**. Över target är
  aldrig i sig ett skäl att pausa.
- Top spendern är benchmark — alla andra jämförs mot den, inte tvärtom.
- Metrik-diagnos: var i kedjan varje bedömbar annons tappar.
- **Creative-teardown (steg 6b — tyngst vägande):** granska varje bedömbar
  bildannons visuellt, läs videomanusen ur våra egna briefer, tagga variablerna
  (vinkel, hook-typ, format, proof, offer, visuell stil, textmängd, talare) och
  gruppera vinstbidraget per variabelvärde. Peka ut minst 3 mönster, märk
  bevisad/hypotes, översätt vart och ett till en briefinstruktion.
  `skalning.mjs` gör steg 0–6 — **steg 6b går inte att skripta** och är ditt jobb.
- **Stäm av mot hypoteserna i `batch-log.md`:** varje annons i förra batchen får
  sitt utfall — höll hypotesen eller inte, och varför (data, inte tyckande).
- **Uppdatera `factory/minne/<butik>/dna.md`:** flytta bekräftade mönster till
  Winning/Losing DNA, markera vad som fortfarande är hypotes.

⚠️ **Ärvda mönster bevisas om från noll.** Ett mönster som är BEVISAT i
Bäverbutikens DNA är en **hypotes** i den här butiken tills det har ≥2 annonser
med ≥3 köp vardera i det här kontot. Annat brand, annat pris, annan sida.

### 3. Bygg nästa batch

- Antal = minst kvoten (`node factory/register.mjs <butik>`). Har butiken inte
  startat sin cykel: sätt batchstorleken efter dagsbudget/target-CPA och skriv
  varför.
- Mix: iterationer på vinnarna (isolerad variabel per iteration) + nya koncept
  från Losing DNA-lärdomar + **alla väntande items i `backlog.md`** (markera dem
  `[använd i batch #N]`) + det som skickades med i argumenten.
- **Varje brief taggar sina variabler** (vinkel, hook-typ, format, proof, offer,
  visuell stil, textmängd, talare) i en rad högst upp — utan taggar kan nästa
  körning inte gruppera vinstbidrag per variabel och lärandet dör.
- Varje annons: hypotes, vad som behålls/ändras, format, exakt hook, komplett
  brief enligt leveransformatet i `.claude/commands/forsta-batch.md` (engelska
  briefer, `Swedish (use this) | English meaning`-tabeller, naming enligt
  `docs/naming-convention.md`, upptagna AD-ID:n avlästa i kontot).
- **Namnet MÅSTE börja med butikens prefix** ur registret (`HEIMGUARD_…`).
  Ett namn utan prefix blir osynligt för nästa avläsning — och syns aldrig som
  ett fel, bara som en butik vars annonser "försvann".
- Priset hämtas från butikens produktsida vid varje körning, aldrig ur en äldre
  brief. Paketpriserna står i produktfilens `offer.bundle`.
- Vinklar som pekar ut folkgrupper som hotet körs ALDRIG (Meta fäller dem och
  det bryter mot brandets tonalitet). Otrygghet som känsla är ok.

### 4. Modellpolicy (obligatorisk)

- **All slutgiltig ad copy, alla svenska manusrader och voiceovers skrivs av en
  subagent via Agent-verktyget med `model: "sonnet"`** (eller `"haiku"` för
  bulkvarianter). Subagenten får butikens DNA + hypotesen + hooken +
  formatkraven + `docs/copy-regler.md` + **butiksfilens `branding.tonalitet`** —
  den skriver bara text, inga strategibeslut. Varje rad ska klara
  tre-frågorstestet, och testet redovisas i leveransen.
- Strategi, analys, klassificering och briefstruktur görs av huvudsessionen.
  Aldrig tvärtom.

### 5. Leverera och logga

- Rapport: kort feedbackloop-sammanfattning (vad lärde vi oss), sedan batchen.
- Zip-paketera brieferna (video + image) som i `/forsta-batch`.
- Lägg batchen i butikens Notion-hub enligt `docs/os/NOTION-FORMAT.md`.
  ⚠️ Saknar registret en hub (`notion.database_id` tom): lägg INTE briefarna i
  en Bäverbutikshub. Leverera dem i chatten + Discord och skriv att hubben
  saknas.
- Logga launchade creatives:
  `node factory/register.mjs log <butik> <antal> [YYYY-MM-DD]`
  (första loggningen startar cykeln och sätter status `aktiv`).
- Skriv batchen i `factory/minne/<butik>/batch-log.md` med datum + hypotes +
  **variabeltaggar** per annons (utfallet fylls i av nästa körning).
- Committa och pusha `factory/minne/`, `factory/produkter/` och registret.

### 6. Launchreglerna (ärvs oförändrade)

- **Nya tester launchas i ett separat test-ABO med lika budget per annons.**
  CBO används för skalning av bevisade vinnare — aldrig för tester
  (Axels beslut 2026-08-12). Undantaget för `/notionkorning` gäller INTE här.
- **Allt föds PAUSED.** Aktivering gäller bara det körningen själv skapat.
- Sätt status **explicit på alla tre nivåer** (kampanj, adset, annons).
- Länken får ALDRIG gissas — avbryt hellre än att falla tillbaka på startsidan.
- Butikens egen `page_id` och `pixel_id` ur produktfilen. **Kopiera aldrig
  page/pixel från Bäverbutiken** — fel pixel bokför köpen på fel verksamhet och
  syns inte som ett fel, bara som konstig data.
- ⛔ **STOPPREGEL: tomt `page_id` eller tomt `pixel_id` = launcha inte.**
  Fråga Axel. **Hämta ALDRIG en sida eller pixel ur det delade kontot** — de
  som ligger där är Bäverbutikens (sidan `1324465810740336`, pixeln
  `1554276343018184` byggde dess danska kampanjer). Per 2026-09-08 är
  HeimGuards båda fält tomma; sidan väntar på Metas verifiering.
- Kör `node factory/validera.mjs factory/produkter/<produkt-id>.yaml` före
  uppladdning och åtgärda varje launch-blockerande varning först.

## DEFINITION OF DONE (markera ✅/❌ sist)

- [ ] Butiken uppslagen i `factory/produkter/register.json`, konto verifierat som
      `915422744950975`
- [ ] **Brandprefixfiltret redovisat:** hur många rader i kontot som var butikens
      och hur många som filtrerades bort
- [ ] AOV-grinden körd: verklig AOV avläst, ekonomiblocket omräknat vid >10 %
      avvikelse — eller "ingen försäljningsdata" skrivet rakt ut
- [ ] **ANALYSMETOD.md:s snabbchecklista avbockad punkt för punkt i svaret**
- [ ] Vinstbidragstabellen visad — ranking på vinst, inte på ROAS/CPA
- [ ] Kill-beslut mätta mot butikens break-even ur `factory/produkter/<id>.yaml`
      (aldrig mot Bäverbutikens tal, aldrig mot target)
- [ ] Creative-teardown gjort: bilder visuellt granskade, variabeltabell visad,
      ≥3 mönster utpekade och översatta till briefinstruktioner
- [ ] Ärvda mönster märkta som hypotes tills de bevisats i DETTA konto
- [ ] Feedbackloop körd: varje annons i förra batchen har fått sitt utfall i
      `batch-log.md`
- [ ] `dna.md` uppdaterad (data skild från hypotes)
- [ ] Backlog-items inkluderade och markerade som använda
- [ ] Batchstorlek ≥ kvoten (kvotläget visat)
- [ ] Alla annonsnamn börjar med butikens prefix
- [ ] Copy/voiceover skriven av sonnet/haiku-subagent, strategi av huvudmodellen
- [ ] Briefer på engelska, naming korrekt, zip-paketerade
- [ ] `factory/minne/<butik>/` uppdaterad i repot (inte bara i chatten) och pushad
