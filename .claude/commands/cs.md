# /cs – Återkommande creative strategy på senaste annonserna

Argument: `$ARGUMENTS` — produkt-id (från `products/products.json`), och valfritt egna idéer/instruktioner efter produkt-id:t.
Exempel: `/cs motorholjet` eller `/cs motorholjet testa en vinkel mot båtägare, och gör en variant av vinnaren med äldre man`.

## Så här ser arbetsflödet ut (viktigt — anta inget annat)

1. Produkten launchas med ~12 annonser (Axels egen process).
2. Går produkten bra öppnar Axel en Claude Code-chatt och gör **den första
   riktiga CS-rundan där** — briefarna från den rundan ligger alltså i
   **den här chattens historik**.
3. `/cs` körs sedan **i samma chatt**, om och om igen: analysera det som
   launchats, leverera nya briefer baserat på faktisk data.

**Därför:** briefarna du behöver för att förstå vad varje annons ÄR finns
normalt redan här i chatten. Läs chatthistoriken först — det är den primära
källan. Bygg aldrig en analys på gissningar när materialet står längre upp.

## Gör följande, hela kedjan utan att invänta godkännande

### 1. Läs läget
- **Chatthistoriken:** hitta briefarna/manusen från de senaste CS-rundorna i
  denna chatt — vilka annonser byggdes, med vilken hypotes, vilken vinkel,
  vilket manus, vilken designbrief. Detta är underlaget för creative-teardownet.
- Produktens rad i `products/products.json` (ad account = **MagiBorsten 1867947880635861**, kampanjer, budget, target-CPA, break-even-CPA).
- `products/<id>/dna.md`, `batch-log.md`, `backlog.md` om de finns — de är
  komplement till chatten, inte ersättning för den.
- **`products/<id>/invandningar.md` — invändningsmatrisen** (Axels beslut
  2026-09-22, förlagan är Taköverdragets): vilka invändningar kunderna
  faktiskt har (kommentarer + supportmejl, antal och andel) och vilka format
  som redan svarar. Finns den inte, eller är den äldre än rundan: bygg/uppdatera
  den FÖRST — `node tools/invandningsmatris.mjs --produkt <id> --konto SE
  --kampanj <kampanj-id> --ord "<produktord,produktord>"` (kommentarerna via
  `tools/annonskommentarer.mjs`, mejlen via `kundtjanst/mail.mjs`, formaten ur
  kontots annonsnamn). Läs täckningsraden: **tomma rutor är nästa brief.**
- Kör `node pipeline/quota.mjs` — kvoten bestämmer batchstorleken.

### 1b. Saknas underlaget helt? (varken i chatten eller i `products/<id>/`)

Gäller bara när `/cs` körs i en **ny** chatt utan CS-historik. Kör då en
upphämtning först — hoppa aldrig över det och bygg aldrig en batch på tom historik:

- Hämta **alla** annonser för produkten i MagiBorsten (hela livstiden) med spend,
  köp, CPA, ROAS, CTR, hook rate, hold + creatives (copy, rubrik, format,
  bild-/video-ID). Granska de statiska bilderna visuellt.
- Gruppera i batcher efter launchdatum och namngivning, skriv `batch-log.md`
  retroaktivt. **Hypoteser som inte loggades i förväg skrivs
  `hypotes: ej loggad (retroaktiv rekonstruktion)`** — gissa aldrig vad någon
  tänkte. Utfallen är däremot riktig data.
- Videomanus går inte att läsa ur kontot: lista vilka videor som saknar manus
  och be om dem i EN samlad fråga i slutet, i stället för att gissa.
- Bygg `dna.md` av det, skapa tom `backlog.md`, och säg i svaret att upphämtning
  kördes och för hur många annonser.

### 1c. Skriv alltid tillbaka till repot

Oavsett var underlaget kom ifrån: efter analysen ska `products/<id>/dna.md` och
`batch-log.md` vara uppdaterade med vad chatten kom fram till. Chatten är bekväm
men kan tappas bort — repot är minnet som överlever.

### 2. Feedbackloop på senaste annonserna (detta är poängen med kommandot)

**Följ `docs/os/ANALYSMETOD.md` steg för steg — läs den nu, korta inte ner den.**
Den är obligatorisk och finns för att enmetriks-domar (ROAS ensam, CPA ensam)
har dödat vinnare två gånger. Kortversion av kraven:

- Hämta **hela kampanjen** sorterad på spend, med de verifierade fältnamnen.
  Färsk daglig budget hämtas samtidigt — uppdatera products.json om den ändrats.
- Kör datakvalitetskontrollen (`spend × ROAS` vs `omni_purchase_values` — fältet
  är trasigt i detta konto) och flagga trasiga rader.
- Signifikansgrind först: <300 kr spend eller <3 köp = **"för tidigt", ingen dom,
  ingen plats i rankingen**.
- **Rangordna på vinstbidrag** `(break-even-CPA − CPA) × köp` — aldrig på ROAS
  eller CPA ensamt. Visa tabellen med spendandel och vinstandel.
- Kill-beslut mot **break-even-CPA**, skalningsbeslut mot **target-CPA**. Över
  target är aldrig i sig ett skäl att pausa.
- Top spendern är benchmark — alla andra jämförs mot den, inte tvärtom.
- Metrik-diagnos: var i kedjan varje bedömbar annons tappar (hook rate → hold →
  CTR → CVR → CPM).
- **Creative-teardown (steg 6b — tyngst vägande):** ladda ner och granska varje
  bedömbar bildannons visuellt, läs videomanusen ur våra egna briefer, tagga
  variablerna (vinkel, hook-typ, format, proof, offer, visuell stil, textmängd,
  talare) och gruppera vinstbidraget per variabelvärde. Peka ut minst 3 mönster,
  märk bevisad/hypotes, och översätt vart och ett till en instruktion i nästa
  brief. Hook/hold ensamt duger inte — bilder saknar dem helt.
- **Stäm av mot hypoteserna i batch-log.md:** för varje annons i förra batchen, skriv utfallet — höll hypotesen eller inte, och varför (data, inte tyckande).
- **Uppdatera `products/<id>/dna.md`:** flytta bekräftade mönster till Winning/Losing DNA, markera vad som fortfarande är hypotes. DNA-filen är produktens ackumulerade minne — skriv den så att nästa session förstår utan kontext.

### 3. Bygg nästa batch
- Antal = minst kvoten per 3-dagarscykel för produkten.
- Mix: iterationer på vinnarna (isolerad variabel per iteration) + nya koncept från Losing DNA-lärdomar + **alla väntande items i backlog.md** (markera dem `[använd i batch #N]`) + det jag skickade med i argumenten ovan.
- **Invändningsmatrisen går före (Axels beslut 2026-09-22).** En tom ruta i
  `products/<id>/invandningar.md` — en invändning som ingen annons svarar på i
  det formatet — tar en briefplats FÖRE ett nytt koncept ur en lärdom och före
  nästa iteration på en vinnare. **I funnelläge (dagsbudget över 10 000 kr) är
  det ett krav:** varje obesvarad invändning med minst 10 % av kommentarerna
  får en brief i rundan innan någon iteration byggs — annars optimerar rundan
  det som fungerar mot en publik som tar slut. Under 10 000 kr är det
  prioritetsordningen, inte ett stopp. **En fylld ruta fylls aldrig igen** —
  briefad räknas som fylld tills annonsen är live och dömd. Briefen taggas
  `invandning=<radens namn i matrisen>` (+ `ruta=demo|jamforelse` när formatet
  inte går att läsa ur namnet: `_H1` = video, `_1` = statisk), vinkelkoden är
  `OB`, `kalla=voc`, och den behöver ingen `lardom=` — invändningen är dess
  källa. Svaret på invändningen är produktens mekanism (står i matrisen och på
  produktsidan), aldrig ett påhittat påstående.
- **Varje brief taggar sina variabler** (vinkel, hook-typ, format, proof, offer,
  visuell stil, textmängd, talare) i en rad högst upp — utan taggar kan nästa
  `/cs` inte gruppera vinstbidrag per variabel och lärandet dör.
  **Plus komponenttaggarna** (Axels beslut 2026-09-21, ANALYSMETOD 6b:
  `typ=N|IM|I|M|S · koncept · parent · iteration · kalla · avatar · awareness ·
  begar · mekanism · tro · urgency · hook-mekanik · confidence · lardom`,
  fasta listor) och raden `Memo:` — en mening om varför annonsen slår
  nuvarande nivå. Avatarerna kommer ur listan **Avatarer** i `dna.md` (max 4,
  med citat/butiksdata som källa — saknas listan skrivs den i den här
  körningen). Minst 1 av 5 nya koncept har `kalla=voc`.
- **Varje brief pekar på lärdomen den bygger på** (`lardom=L-<annons_id>` ur
  `products/<id>/lardomar.md`, `docs/os/CS-KLART.md` punkt 6). Kan den inte
  peka på en, skrivs den inte. Lärdomarna skrivs FÖRE batchen — en per
  etiketterad annons i förra batchen (steg 2), med `agent/lardom.mjs` på
  rutinens gren när körningen är rond-auto, annars för hand i samma format
  (skelettet i `lardom.mjs --skelett`): batch, utfall, spend annons/kampanj i
  samma fönster, hookar ordagrant med hook/hold rate, ROAS/CPA,
  konverteringsgrad, planerat mot utfört per komponent, hypotes märkt
  gissning, konkreta nästa annonser. **Antalet briefer i rundan överstiger
  aldrig antalet lärdomar skrivna sedan förra batchen** (punkt 8) — budgeten
  ger golvet, lärdomarna taket. **Mixen kommer ur etiketterna** (punkt 7):
  levande breakthrough ⇒ 80 % vidarebyggen på den (tre iterationer inom 14
  dagar: nya hookar → längre problemdel → in media res), annars 80 % nya
  vinklar. En ny vinkel = annan avatar, annat begär eller annan känslomässig
  ingång; samma löfte med nya ord är en iteration (punkt 19).
- Varje annons: hypotes, vad som behålls/ändras, format, exakt hook, komplett brief enligt leveransformatet i `.claude/commands/forsta-batch.md` (engelska briefer, `Swedish (use this) | English meaning`-tabeller, naming-strukturen, upptagna AD-ID:n avlästa i kontot).
- **Varje videobrief har regitabellen** (`docs/os/BRIEF-REGI.md`, Axels beslut
  2026-09-21): en rad per manusrad — Time | Script line | Audio | On-screen
  text | Picture | Effect + length | Source | Reference | Latitude — plus
  raderna Assets, Reference ads och Editor latitude (MAY / MUST NOT). Källan
  är alltid ett av fem format; `OUR AD` utan mm:ss är ett fel (hämta videon,
  `tools/qa-frames.py`, läs av). Regin skrivs av huvudsessionen. **Spärren
  körs på varje egen brief INNAN Notion-raden skapas:**
  `node tools/briefgranskning.mjs --rad <brief.md> --prefix <Prefix> --pris <pris> --jamforpris <jämförpris>`
  (eller `--manifest <manifest.json>`) — exit 1 ⇒ rätta, skapa ingen rad.
- **Hard rule i varje brief (Axels beslut 2026-09-18): annonsen nämner aldrig butikens namn** — inte "Bäverbutiken" i copy, bild, voiceover eller som domän. Färdiga annonser speglas till OPS-butikerna (`/ops-spegla`: Taköverdraget och Termoskyddet → CaraShell), och en creative som säger vilken butik den är stoppas där. Produkten, priset och länken bär butiken.

### 4. Modellpolicy (obligatorisk)
- **All slutgiltig ad copy, alla svenska manusrader och voiceovers skrivs av en subagent via Agent-verktyget med `model: "sonnet"`** (eller `"haiku"` för bulkvarianter av samma line). Skicka subagenten: produktens DNA, hypotesen, hooken och formatkraven — den skriver bara text, inga strategibeslut.
- Strategi, analys, klassificering och briefstruktur görs av huvudsessionen (Fable/Opus). Aldrig tvärtom.

### 5. Leverera och logga
- Rapport: kort feedbackloop-sammanfattning (vad lärde vi oss), sedan batchen.
- Zip-paketera brieferna (video + image) som i forsta-batch-kommandot.
- Lägg batchen i Notion exakt enligt `docs/os/NOTION-FORMAT.md`: ett item per annons, namn = annonsnamnet, status Draft, tag `Video - Pending Approval` (även bilder), briefen inklistrad i itemet + Drive-länk.
- Skriv batchen i `products/<id>/batch-log.md` med datum + hypotes + **variabeltaggar** per annons (utfallet fylls i av nästa `/cs`) — och kolumnerna **rev** (antal läsningar i `In progress 2`, `okänd` tills raden lästs) och **brief → live (dagar)** (Notion `Skapad` → Metas `created_time`), så regitabellens effekt går att mäta (BRIEF-REGI.md → "Mät från dag 1").
- **Kommentarerna på top spendern:** `node tools/annonskommentarer.mjs --konto SE --kampanj <id>` skriver `products/<id>/kommentarer.md` (senaste 30 d, kluster per tema). Ett kluster med ≥ 3 kommentarer om samma invändning ⇒ en INVAND-variant i batchen (`kalla=voc`). **Vinkelkoden i annonsnamnet är `OB`, aldrig `BOF`** (Axels beslut 2026-09-21: BOF är funnelposition, och med BOF går invändningsannonserna inte att skära ut ur datan — `docs/naming-convention.md`).
- **Invändningsmatrisen uppdateras efter varje rond, som dna.md** (Axels
  beslut 2026-09-22): kör `node tools/invandningsmatris.mjs --produkt <id>
  --konto SE --kampanj <id> --ord "…"` igen när brieferna ligger i Notion —
  briefer med `invandning=` fyller sina rutor som "briefad, ej live", kontots
  OB-annonser får status live/pausad, räkningen skrivs om, och allt du själv
  skrivit under matrisen (mekanismen, lärdomen bakom luckan) står kvar.
  Täckningsraden ("fukt 0 av 4 format (38 %)") går in i rapporten.
- Committa och pusha alla ändringar i `products/`.

## DEFINITION OF DONE (markera ✅/❌ sist)

- [ ] Chatthistorikens briefer lästa och använda i teardownet — eller upphämtning (1b)
      körd och redovisad om chatten saknade dem
- [ ] **ANALYSMETOD.md:s snabbchecklista avbockad punkt för punkt i svaret**
- [ ] Vinstbidragstabellen visad — ranking på vinst, inte på ROAS/CPA
- [ ] Creative-teardown gjort: bilder visuellt granskade, variabeltabell visad,
      ≥3 mönster utpekade och översatta till briefinstruktioner
- [ ] Feedbackloop körd: varje annons i förra batchen har fått sitt utfall loggat i batch-log.md
- [ ] dna.md uppdaterad (data skild från hypotes)
- [ ] Backlog-items inkluderade och markerade som använda
- [ ] Batchstorlek ≥ kvoten (quota-output visad)
- [ ] Copy/voiceover skriven av sonnet/haiku-subagent, strategi av huvudmodellen
- [ ] Briefer på engelska, naming korrekt, zip-paketerade
- [ ] Varje videobrief: regitabell enligt `docs/os/BRIEF-REGI.md`; varje brief: komponenttaggar + `tro` + `Memo:` + `lardom=L-…`; `node tools/briefgranskning.mjs --rad/--manifest` grön INNAN Notion-raderna skapades (utskriften visad)
- [ ] Lärdom skriven för varje etiketterad annons i förra batchen (`products/<id>/lardomar.md`), briefer ≤ lärdomar, mixen ur etiketterna redovisad (levande breakthrough ja/nej ⇒ 80/20 åt vilket håll)
- [ ] `kommentarer.md` uppdaterad för top spendern; kluster ≥ 3 ⇒ INVAND-variant i batchen, namngiven med vinkelkoden `OB`
- [ ] `invandningar.md` läst FÖRE batchen och uppdaterad EFTER (`tools/invandningsmatris.mjs`): tomma rutor briefade före iterationer (i funnelläge > 10 000 kr/dag: varje obesvarad invändning ≥ 10 % har en brief), ingen fylld ruta briefad igen, täckningsraden i rapporten
- [ ] dna.md + batch-log.md uppdaterade i repot (inte bara i chatten) och pushade
