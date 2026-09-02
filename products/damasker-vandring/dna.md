# Creative DNA — Damasker Vandring

Skapad 2026-09-02 av `/forsta-batch` (körning nr 1, flaggad av `agent/rond.mjs`
som `forsta_batch`-behov samma dag). Datakälla: MagiBorsten `1867947880635861`,
kampanj `120250009391470291` ("Damasker Vandring | BE ROAS 1.60 | Launch
2026-08-29"), livstid 2026-08-29 → 2026-09-02 (`date_preset: maximum`).

## Produktfakta (verifierade mot Shopify 2026-09-02)
- **Damasker Vandring – Håller Snö, Väta & Grus Ute**
  (`damasker-vandring-haller-sno-vata-grus-ute`), Bäverbutiken.
- **Pris 389 kr, jämförpris 649 kr — verifierat äkta i Shopify
  (`compareAtPrice` satt på alla 18 färgvarianter).** Spara 260 kr (40,06 %,
  avrundas "40 %"). Till skillnad från Kranskydd Frost 420D:s falska
  "23 % rabatt" är CS-vinkelns "40% RABATT"-påstående i kontots befintliga
  annons (`Damasker_CS_1`) **korrekt** — ingen BLOCKER här.
- Mått 44 cm högt skydd, 43 cm omkrets, en storlek som justeras efter benet,
  100 % polyester. Fäste: krok i snörningen, rem under foten, kardborre runt
  benet. 18 färger (gul, neongrön, orange, svart, grå, marinblå, blå, ljusblå,
  röd, lila, rosa, brun, vit, olivgrön, kamouflage grön/svart, blå/neongrön,
  cerise/neongrön).
- 30 dagars öppet köp, Klarna. Fri frakt-tröskeln (>300 kr sitewide, verifierad
  i andra produkters dna-filer) gäller — 389 kr kvalar.
- ⚠️ **`totalInventory: 0` och FLERA färgvarianter negativa i Shopify**
  (t.ex. orange -14, röd -8, gul -3) — oversåld på flera färger samtidigt.
  Inte en creative-fråga, men en leveransrisk — flaggas till Axel, rörs inte
  här.
- Break-even-ROAS **1,60×** (ur kampanjnamnet). Break-even-CPA (enstyck)
  389/1,60 ≈ **243 kr**. Shopify-korskoll (60 dagar): 18 ordrar, 12 059 kr
  gross sales → AOV ≈ 670 kr, klart över styckpriset 389 kr — de flesta
  ordrar innehåller fler än ett par eller ett tillägg. Använd ROAS 1,60
  direkt för kill-beslut (AOV-oberoende, ANALYSMETOD steg 3), inte
  enstycks-CPA:n.

## Datakvalitet
16 köp i Meta (livstid), 18 ordrar i Shopify på produkten senaste 60 dagarna
— normal attributionsskillnad, inget datafel. `amount_spent × purchase_roas`
använd genomgående (inte `omni_purchase_values`, känd 100×-bugg på andra
produkter). Ad Library-sök ("damasker vandring", "benskydd vandring",
"gamacher") gav 0 konkurrenter i Sverige — bara kontots egna 3 annonser kom
upp på "damasker vandring". Nischen verkar obevakad.

⚠️ **Två recensionskällor hittade i Drive — INGEN är verifierad riktig:**
1. `Damasker Vandring_REVIEW` (Google Sheet, Joshs produktmapp): ett
   Judge.me-bulkimport-schema (`title,body,rating,review_date,reviewer_name,
   reviewer_email,product_id,product_handle,reply,picture_urls`) med endast
   `title`, `body` och `reviewer_name` ifyllda — **rating, datum, e-post,
   product_id är tomma.** Ett ofärdigt, aldrig importerat utkast.
2. `Damasker Vandring_SP_2_1.png` (samma mapp): en bild med ett inbränt citat
   ("Helt torra strumpor... Verifierad kund, 47 år — Pocekova") och Google
   Vision-etiketter som "Rain pants, Wellington boot, Gore-Tex" — mönstret
   matchar en TEMU-leverantörs marknadsföringsbild, inte en riktig
   Bäverbutiken-kund (produkten är sourcad från TEMU, SKU-prefix
   `TEMU-601101617191068`).

**Live-kontroll 2026-09-02 (WebFetch av produktsidan): "No reviews".** Ingen
recension är publicerad. **Båda Drive-filerna är därför flaggade som
opålitliga och har INTE använts som källa till någon rad i denna batch** —
i stället för en påhittad/overifierad testimonial-static byggdes
`Damasker_HL_1_1`: ett tydligt märkt "PRODUKTLÖFTET" (inte ett kundcitat).
**Om Axel kan bekräfta att recensionerna i sheetet är riktiga och importera
dem till Judge.me: nästa batch kan bygga en äkta review-static.**

## Siffrorna (bedömbara annonser, ≥300 kr + ≥3 köp; BE-ROAS 1,60)

| Annons | Format | Vinkel | Spend | Andel spend | Köp | CPA | ROAS | **Vinstbidrag*** |
|---|---|---|---|---|---|---|---|---|
| **Damasker_PD_1** (benchmark/top spender) | video | demo/problem | 2 162 kr | 62,8 % | **14** | 154 kr | **3,96** | **≈+3 187 kr** |

*Vinstbidrag = intäkt/1,60 − spend (ROAS-baserad, AOV-oberoende — se
ANALYSMETOD steg 4). Kampanjens totala vinstbidrag är **≈+2 396 kr**; PD_1
ensam bidrar med ≈3 187 kr — **mer än 100 % av kampanjens totala vinst**,
vilket betyder att resten av kontot (SP/CS/G-svansen) tillsammans är en
nettoförlust som PD_1 täcker upp för. PD_1 bär 14 av 16 köp (87,5 %).

**För tidigt (ingen dom, redovisas ändå för mönstret):**

| Annons | Format | Vinkel | Spend | Köp | ROAS | Vinstbidrag | Kommentar |
|---|---|---|---|---|---|---|---|
| Damasker_SP_2 | video | social proof/testimonial | 438 kr | 1 | 0,89 | −195 kr | Under BE men <3 köp — kan inte dömas än |
| Damasker_SP_3 | video | social proof/testimonial (samma copy) | 340 kr | 1 | 1,14 | −97 kr | Samma mönster som SP_2 |
| Damasker_PD_2 | video | demo/problem (samma copy som PD_1) | 247 kr | 0 | – | −247 kr | Precis under tröskeln, bevakas |
| Damasker_CS_1 | video | äkta rabatt 40 % | 44 kr | 0 | – | −44 kr | Högst CTR i svansen (4,59 %) men för lite spend |
| Damasker_PD_3, SP_1, CS_2/3/2_1, G_1/2/3/2_1, PD_2_1 | – | – | 0–42 kr vardera | 0 | – | – | CBO-svält, aldrig fått en chans (≈187 kr totalt) |

## Winning DNA
1. **PD (demo/problem)-vinkeln är produktens bevisade angle** — inte SP
   (social proof), vilket är motsatsen till mönstret hos Kranskydd Frost
   420D (där SP vann). **Varje produkt har sin egen vinnare — vinklar
   överförs inte automatiskt mellan produkter.** PD_1: öppningsfråga
   ("Trött på snö, väta och grus i skorna?") + 4 konkreta ✅-punkter +
   SHOP_NOW. 14 köp, CPA 154 kr, 62,8 % av spenden, bär hela kampanjens
   vinst.
2. **PD har lägst CPM i kontot (107 kr) mot 150–252 kr för SP** — algoritmen
   hittar tydligen en billigare, bredare publik på PD:s copy än på SP:s.
3. **Konkreta specifikationer slår vag social proof.** PD:s fyra punkter är
   verifierbara fakta (håller snö ute, stoppar regn, skyddar mot grus,
   10 sekunders montering). SP:s "Älskade av tusentals vandrare" är ett
   opreciserat påstående som inte klarar tre-frågorstestets
   falsifierbarhets-fråga lika bra — matchar den svagare ROAS:en.

## Losing/rotorsaker (hypotes, ej bevisad — för lite data per enskild annons)
- **SP (social proof/testimonial) har ok CTR (2,3–3,2 %) men svag ROAS och
  högre CPM än PD.** Hypotes: "tusentals vandrare"-påståendet är
  ospecificerat och obestyrkt (ingen riktig recension finns att luta det
  emot, se datakvalitet ovan) — annonsen lovar bekräftelse men levererar
  ingen konkret bekräftelse. Isolerad variabel att testa: byt det vaga
  social-proof-löftet mot PD:s verifierbara fakta i samma format (se
  `Damasker_HL_1_1` i denna batch — en ärlig produktlöftes-static i stället
  för en påhittad kundröst).
- **G (gåva/present) fick i praktiken ingen spend** (4 annonser, ≈14 kr av
  3 440 kr totalt). För lite data för att döma copyn — matchar mer troligt
  samma CBO-svält-mönster som setts hos andra produkter (Kranskydd, IBC)
  än ett angle-problem. Till skillnad från Kranskydds rena julvinkel är
  G-copyn här redan bredare ("jul, födelsedag eller bara en tanke") — inte
  lika säsongskänslig, så ingen paus rekommenderas, bara mer spend nästa
  runda om budget tillåter.
- **CS (rabatt) är INTE en BLOCKER här** (till skillnad från Kranskydd och
  Bälteslipmaskinen) — 40 %-påståendet stämmer exakt mot Shopifys
  `compareAtPrice`. Bara för lite spend (44 kr) för att döma. Nästa
  iteration (`Damasker_CS_4_H1`/`_CS_5_1` i denna batch) visar matematiken
  visuellt i stället för att bara påstå procenten.

## Behåll alltid / Testa kontrollerat / Undvik / Obevisat
- **Behåll:** PD:s fyra konkreta ✅-punkter (snö/regn/grus/10 sekunder) ·
  389 kr / jämförpris 649 kr exakt, aldrig andra tal · 30 dagars öppet köp
  som garantirad · SHOP_NOW.
- **Testa kontrollerat:** PD:s fakta i nya format (demo, before/after,
  jämförelse mot dyra kängor) och nya mekanismer (UGC, auktoritet,
  cost-of-inaction, myth-busting) — se FAS 7–9 i batch-log · CS med synlig
  prismatematik i stället för procent-påstående.
- **Undvik:** fabricerade kundcitat/recensioner (ingen riktig recension
  finns, se datakvalitet) · påhittade leveranstider eller lagerstatus
  (flera färger är oversålda — nämn aldrig "i lager" per färg) · att anta
  att SP (social proof) fungerar bara för att det gjorde det för Kranskydd
  — den här produktens egen data säger PD.
- **Obevisat:** allt i FAS 7–9 tills nästa avläsning — bara PD_1 har
  passerat signifikansgrinden i denna körning.

## Luckor (fyll före nästa körning)
- Videoinnehåll (rörelse, röst, exakt hook-bildruta) kunde inte öppnas
  härifrån — hela teardownet bygger på copy/thumbnail-nivå. Be Axel/
  redigerarna om transkript för PD_1 (vinnare) och SP_2/SP_3 (svagare)
  till nästa `/cs`-körning.
- Recensioner: se datakvalitet ovan — två opålitliga källor hittade, ingen
  använd. Fråga till Axel: är `Damasker Vandring_REVIEW`-sheetet riktiga
  recensioner som väntar på import, eller ett oanvänt/övergivet utkast?
- Inventarie negativ på 5+ färger — inte undersökt vidare (utanför
  creative-scope), men bör flaggas till Axel: leveransrisk som kan skada
  ROAS oavsett creative.
- Konkurrenter: 0 träffar i Meta Ad Library — obevakad nisch, ingen
  konkurrentanalys möjlig i denna körning.

## Namnkonvention — samma observerade diskrepans som tidigare produkter
Kontots faktiska annonsnamn (`Damasker_PD_1`, `Damasker_SP_2` osv.) och
`.claude/commands/forsta-batch.md`:s NAMING-sektion använder
`Produkt_KONCEPT_ID_VARIANT` (tvåbokstavskoncept), inte
`docs/naming-convention.md`:s `ANGLE_FORMAT_HOOK`-schema. Denna batch följer
den faktiskt använda konventionen, med nya koncept-koder för nya vinklar:
`UG` (UGC/identity), `AU` (auktoritet), `CI` (cost of inaction/konflikt),
`CO` (jämförelse), `MB` (myth-busting/nyfikenhet), `LI` (listicle),
`HL` (produktlöftes-static, ersätter en fabricerad testimonial), `BOF_N`
(bottom-of-funnel-statics). Flaggas här som tidigare — Axel bör bestämma
vilket dokument som är facit.
