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
- Antal = `rundaAntal` ur ronden (dubbla veckokvoten, minst fyra) — Axel
  2026-09-02: hellre några för mycket, redigerarna är många. Minst två
  tredjedelar video, högst två statiska. BOF-bildserier är parkerade.
- Mix: iterationer på vinnarna (isolerad variabel per iteration) + nya koncept från Losing DNA-lärdomar + **alla väntande items i backlog.md** (markera dem `[använd i batch #N]`) + det jag skickade med i argumenten ovan.
- **Varje brief taggar sina variabler** (vinkel, hook-typ, format, proof, offer,
  visuell stil, textmängd, talare) i en rad högst upp — utan taggar kan nästa
  `/cs` inte gruppera vinstbidrag per variabel och lärandet dör.
- Varje annons: brief enligt **BRIEFMALLEN** i `.claude/commands/forsta-batch.md`
  (LEVERANSFORMAT) — enkel, kort, samma rubriker varje gång, engelska,
  `Swedish (use this) | English meaning`-tabeller, och tre-frågorstabellen
  på varje svensk rad. Hypotes och "vad vi lär oss" skrivs i `batch-log.md`,
  inte i briefen. Naming enligt strukturen, upptagna AD-ID:n avlästa i kontot.

### 4. Modellpolicy (obligatorisk)
- **All slutgiltig ad copy, alla svenska manusrader och voiceovers skrivs av en subagent via Agent-verktyget med `model: "sonnet"`** (eller `"haiku"` för bulkvarianter av samma line). Skicka subagenten: produktens DNA, hypotesen, hooken och formatkraven — den skriver bara text, inga strategibeslut.
- Strategi, analys, klassificering och briefstruktur görs av huvudsessionen (Fable/Opus). Aldrig tvärtom.

### 5. Leverera och logga
- Rapport: kort feedbackloop-sammanfattning (vad lärde vi oss), sedan batchen.
- Zip-paketera brieferna (video + image) som i forsta-batch-kommandot.
- Lägg batchen i Notion exakt enligt `docs/os/NOTION-FORMAT.md`: ett item per annons, namn = annonsnamnet, status Draft, tag `Video - Pending Approval` (även bilder), briefen inklistrad i itemet + Drive-länk.
- Skriv batchen i `products/<id>/batch-log.md` med datum + hypotes + **variabeltaggar** per annons (utfallet fylls i av nästa `/cs`).
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
- [ ] dna.md + batch-log.md uppdaterade i repot (inte bara i chatten) och pushade
