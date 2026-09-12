# Creative DNA — AdventLane (Adventskalender Racingbilar)

Skapad 2026-09-11 av `/notionscalercs setup kalender` (körning nr 1 — setup, ingen brief).
**Senast uppdaterad 2026-09-12, körning nr 2 — första briefdagen (KALLSTART, batch #2).**
Butiks-id `kalender` (nischbutik för adventskalendrar), produkt-id
`adventskalender-racingbilar`, registernyckel `kalender/adventskalender-racingbilar`,
brand **AdventLane**, adventlane.se (Shopify `ikf0tu-5e`).

⚠️ **All prestandadata under "Vad som är bevisat" är ÄRVD från Bäverbutiken.**
AdventLanes egna kampanjer skapades 2026-09-10. Avläsning 2026-09-12 (14d, SE):
**1 126 kr, 2 köp, ROAS 0,89, intäkt 998 kr** (2 × 499 kr — ingen paketorder än).
**0 av 16 annonser har passerat signifikansgrinden** (≥ 300 kr OCH ≥ 3 köp).
Första briefdagen (2026-09-12) blev därför en **KALLSTART**: ingen feedback-loop,
ingen dom över en enda AdventLane-annons — batch #2 byggdes helt ur ärvd DNA.

⚠️ **Säsongsprodukt.** Kalendern säljer fram till 24 december och är död därefter.
Varje dygn utan test är ett dygn mindre av säsongen — men grinden gäller ändå.

---

## Produkten och kunden

Adventskalender med 24 numrerade luckor och en liten racingbil bakom varje,
alla olika i färg och dekor (startnummer, rutmönster, flammor). Hjulen rullar.
CE- och CPC-märkt, små delar, från 3 år. Pris **499 kr** (jämförpris 649 kr),
2-pack −15 % (förvald), 3-pack −20 %. Fri frakt Sverige och Norge, 14 dagars
ångerrätt. Leverans 5–10 arbetsdagar.

**Kunden:** en vuxen (förälder eller mor-/farförälder, 28–65) som köper till ett
barn 3–10 år. Har haft chokladkalendrar och tröttnat på att inget finns kvar.
Säger "lucka", "julkalender", "alternativ till godis".

**Grundkonflikten:** det som öppnas är uppätet före frukost — det här står kvar
den 24:e. Tre av tio källrecensioner säger självmant "ett alternativ till godis".

Facit för brand och ton: `factory/butiker/kalender.yaml` (branding) och
`factory/output/kalender/BRAND.md`. Tonen är varm, konkret, lugn: **inga
utropstecken, ingen hype, ingen nedräkning, aldrig "SISTA CHANSEN".**

---

## Ekonomin (`factory/produkter/adventskalender-racingbilar.yaml`)

Pris 499 kr · **COGS 142,27 kr per styck + 3 EUR tull per order (KVITTERAT av
Axel 2026-09-11)**, tullen = 33,60 kr med ECB-kursen 11,1995 (2026-09-10) ·
TB 323 kr · **BE-ROAS 1,54 · BE-CPA 323 kr · target-ROAS 2,52 · target-CPA 198 kr**,
räknat UTAN moms (`moms_antagen: false`, Axels regel 2026-09-09).

*(Till 2026-09-11 stod här 191 kr, räknat bakåt ur källkampanjens namn
"BE ROAS 1.62". Kampanjnamnen i kontot bär fortfarande 1,62 — namnet är en
etikett, inte facit. Döm mot 1,54 / 323 kr.)*

⚠️ Temu-länken i produktfilen svarar "This item was discontinued" (mätt
2026-09-10). Inköpskanalen är alltså öppen — det är en ägarfråga, inte en
creative-fråga, men en annons som skalar mot en produkt som inte går att köpa
in är bortkastad spend.

---

## Vad som är bevisat (ÄRVT från källan, läst 2026-09-11, uppdaterat 2026-09-12)

Källa: Bäverbutiken, konto `1867947880635861` (LÄSES bara), kampanj
`Adventskalendern Racingbilar | BE ROAS 1.62 | Launch 2026-09-08`
(`120250134672020291`), prefix `Adventskalender_`, period hela livstiden
(2026-09-08 → 2026-09-11, ≈ 3 dygn). **16 annonser, 3 147 kr, 16 köp,
ROAS 3,21, verklig AOV 632 kr** (över 499 kr — paketen säljer).
Rådata: `factory/output/adventskalender-racingbilar/kallannonser.json`.

**Uppdaterad avläsning 2026-09-12 (livstid t.o.m. ≈ 4 dygn, `--arv`):
4 384 kr, 19 köp, ROAS 2,65, AOV 611 kr.** Regressionen ANALYSMETOD steg 5
varnar för syns redan: PD_2_H1 CPA 150 → 191 kr (ROAS 3,85 → 2,89), PD_2_1
CPA 172 → 192 kr (ROAS 3,85 → 3,44). Båda fortfarande klart under BE-CPA 323.
`GT_1_H1` gled från 297 till **408 kr CPA (2 köp)** — nu ÖVER break-even,
fortfarande under grinden. Tabellen nedan är 2026-09-11-läsningen; kolumnen
"2026-09-12" är den nya.

| Ärvd annons (2026-09-12) | Spend | Köp | CPA | ROAS | Vinstbidrag | Hook | Hold | CTR | CVR |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `Adventskalender_PD_2_H1` | 1 715 kr | 9 | 191 kr | 2,89 | **1 192 kr** | 27,5 % | 27,8 % | 2,91 % | 3,80 % |
| `Adventskalender_PD_2_1` | 1 539 kr | 8 | 192 kr | 3,44 | **1 045 kr** | — | — | 4,37 % | 2,05 % |
| `Adventskalender_GT_1_H1` | 816 kr | 2 | 408 kr | 1,65 | — (för tidigt) | 31,1 % | 20,9 % | 2,64 % | 1,53 % |

Signifikansgrinden (≥ 300 kr OCH ≥ 3 köp) passeras av **två** annonser.
Vinstbidrag = (BE-CPA 323 − CPA) × köp, mot AdventLanes linje (kvitterad 2026-09-11).

| Ärvd annons | Typ | Spend | Köp | CPA | ROAS | Vinstbidrag | Hook 3 s | Hold | CTR | CPC | CVR | Dom |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| `Adventskalender_PD_2_1` | bild | 1 376 kr | 8 | 172 kr | 3,85 | **1 208 kr** | — | — | 4,49 % | 3,8 kr | 2,22 % | **vinnare, top spender = benchmark** |
| `Adventskalender_PD_2_H1` | video | 898 kr | 6 | 150 kr | 3,85 | **1 038 kr** | 28,7 % | 28,1 % | 2,87 % | 7,4 kr | 4,92 % | **vinnare** |
| `Adventskalender_GT_1_H1` | video | 594 kr | 2 | 297 kr | 2,27 | — | 32,0 % | 20,2 % | 2,33 % | 7,2 kr | 2,44 % | för tidigt (2 köp) — CPA 26 kr under BE 323 |
| 13 annonser under 60 kr | — | 279 kr | 0 | — | — | — | — | — | — | — | — | ingen data |

### Vinklarna i källan (samma copy per vinkel, olika creative)

| Kod | Vinkel | Hook-rad (primary text) | Spend | Köp | Dom |
|---|---|---|---:|---:|---|
| **PD** | Chokladkonflikten | "Chokladen är uppäten på 10 sekunder 🍫 / Den här adventskalendern håller hela december." Rubrik: *"Choklad: 10 sek. Bilarna: hela december."* | 2 322 kr (74 %) | 14 | **Bevisad.** Båda vinnarna. |
| **GT** | Presenten / "han älskar bilar" | "Han älskar bilar mer än något annat 🚗 / Ge honom en ny bil att upptäcka varje morgon fram till jul." Rubrik: *"24 bilar bakom 24 luckor i jul"* | 709 kr | 2 | Bevaka — under grinden på köp. |
| **CS** | Erbjudandet | "23% rabatt – bara idag 🎄 / 649 kr → 499 kr … Begränsat lager – slut innan jul" | 70 kr | 0 | Otestad. **Får inte köras som den är** (se nedan). |
| **SP** | Social proof | "⭐⭐⭐⭐⭐ 'Han sprang ut ur sängen varje morgon för att öppna en lucka!' – Verifierad kund, 34 år … 30 dagars öppet köp" | 45 kr | 0 | Otestad. **Får inte köras som den är** (se nedan). |

**Mönster 1 — problemvinkeln bär allt (bevisad, ärvd).** PD står för 74 % av
spenden och 14 av 16 köp. Hooken är en tidsjämförelse ("10 sekunder" mot
"hela december"), inte en produktbeskrivning. Det är samma konflikt som
butikens hela brand är byggt på (`BRAND.md`).

**Mönster 2 — bilden slår videon på spend, videon på konvertering (bevisad,
ärvd, 2 annonser).** `PD_2_1` (bild) och `PD_2_H1` (video) har IDENTISK copy.
Bilden tog 1 376 kr med CTR 4,49 % och CVR 2,22 %; videon 898 kr med CTR 2,87 %
men CVR 4,92 %. Samma ROAS (3,85). ⚠️ Detta är **motsatsen** till HeimGuard
och TankGuard, där bild aldrig replikerade. Kopiera inte deras "video först"-
regel hit — här är formatfrågan öppen och ska testas, inte antas.

**Mönster 3 — presentvinkeln (GT) hämtar klick men konverterar sämre
(hypotes).** `GT_1_H1` har källans bästa hook rate (32,0 %) men CVR 2,44 % och
CPA 297 kr, nära break-even. 2 köp — ingen dom. Hypotes: "han älskar bilar"
träffar rätt person men saknar skälet att köpa *nu*.

**Mönster 4 — CS och SP har aldrig fått pengar (45–70 kr).** De är inte
dåliga, de är otestade. Men de får inte köras som de står (nästa avsnitt).

---

## Vad AdventLane måste ändra i det ärvda materialet — och varför datan blir icke-jämförbar

1. **Erbjudandecopyn (CS) är falsk brådska.** "bara idag", "Begränsat lager –
   slut innan jul", "Köp innan den tar slut" krockar med brandets tonläge
   (inga utropstecken, ingen nedräkning) och är osant: 499 kr är butikens
   stående pris. Jämförpriset 649 kr får stå, brådskan inte.
2. **Social proofen (SP) bygger på ett citat ingen kund sagt.** "Han sprang ut
   ur sängen varje morgon … Verifierad kund, 34 år" finns inte bland de tio
   riktiga recensionerna. AdventLane har tio femstjärniga omdömen att citera
   ordagrant ("Sonen längtar till varje dag", "Hon tycker det är spännande
   att öppna varje lucka", "ett bra alternativ till godis").
3. **"30 dagars öppet köp – nöjd eller pengarna tillbaka" (SP) är fel villkor.**
   AdventLane har 14 dagars ångerrätt enligt lag, inget eget köplöfte
   (`factory/butiker/kalender.yaml` retur). Källsidan lovar 30 dagar — det
   följer inte med.
4. **"Ge honom"** i PD och GT låser målgruppen till pojkar. Brandet får inte
   låsas vid barn eller bilar (nästa kalender kan rikta sig till någon annan),
   men för DEN HÄR produkten är det den bevisade raden. Behåll den i
   varianter av vinnaren; testa könsneutral form som EN isolerad variabel.
5. **Priset rördes inte.** 499 / 649 kr är identiskt i båda butikerna.

⚠️ Vad som faktiskt ändrades i OPS-kampanjens copy när den byggdes 2026-09-10
**finns inte loggat i repot** (ingen `byggda-annonser.json` eller
`brand-detektor.md` för kalender). Läs copyn ur kontot innan någon ärvd
annons dupliceras — anta inte att punkt 1–3 redan är rättade.

---

## AdventLanes egna kampanjer (data, läst 2026-09-11 — INGEN dom)

Konto **MagiBorsten DK `915422744950975`** (OPS-kontot, delat — filtreras på
prefix `AdventLaneRacing`). Kampanjer skapade 2026-09-10:

- `ADVENTLANERACING_SE_Racingkalendern | BE-ROAS 1,62 | 2026-09-10` — 15 annonser
  i 4 adsets (PD, GT, CS, SP). **372 kr, 0 köp** efter ≈ 1 dygn.
  `PD_1_H1` tog 61 % (226 kr, hook 23,3 %, hold 23,4 %, CTR 3,79 %, 31 länkklick,
  0 köp). Källans vinnare `PD_2_1` har fått **0 kr**, `PD_2_H1` **2 kr** —
  Metas fördelning har inte gett vinnarna chansen än.
- `ADVENTLANERACING_NO_Racingkalendern | BE-ROAS 1,62 | 2026-09-10` — 16 annonser
  (13 med spend), ≈ 445 kr, 0 köp. Copyn är **kalenderns egen, på norska**
  (verifierad ur kontot 2026-09-11: "24 ekte biler, ikke sjokolade",
  "Julegaven med 24 biler i en eske", länk adventlane.se/nb/…). Annonsnamnen
  (`_NO_G_1`, `_NO_SP_1`, `_NO_PD_2`) följer källans norska namnmönster, inte
  SE-kampanjens `_H1`-form — se rotorsak 2.
  **Priset i Norge är 439 kr, i Sverige 499 kr (Axels besked 2026-09-11)** —
  NO-annonsernas "579 kr → 439 kr" är alltså rätt pris. ⚠️ `kalender.yaml`
  säger fortfarande `marknader[0].valuta: SEK` — konfigen släpar efter kontot,
  se backlog. NO-CS-copyn bär "i dag", "begrenset lager", "før den er utsolgt":
  brådska som SE-brandet förbjuder. **Axels beslut 2026-09-11: pausas inte.**
- Båda kampanjerna: CBO 1 000 kr/dag, skapade 2026-09-10 13:18 resp. 13:30.
- Saknas i OPS SE mot källan: `SP_2_1` (bild). Skälet står inte i repot.

Bedömbara: **0**. Kallstart tills ≥ 1 annons passerar grinden.

### Avläsning 2026-09-12 (körning nr 2, 14d, SE — data, ingen dom)

Facebook-sidan är publicerad: **alla 16 SE-annonser ACTIVE/ACTIVE** (Metas
pauser från 2026-09-11 är borta — inte körningens verk). Spend 3d/7d/14d
1 126 kr, 2 köp, ROAS 0,89.

| Annons | Spend | Köp | CPA | ROAS | Hook | Hold | CTR | CVR | CPM |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `AdventLaneRacing_PD_1_H1` | **837 kr (74 %)** | 2 | 419 kr | 1,19 | 20,9 % | 23,5 % | 3,69 % | 1,20 % | 186 kr |
| `AdventLaneRacing_GT_1_H1` | 89 kr | 0 | — | — | 30,1 % | 22,0 % | 3,23 % | 0 | 152 kr |
| `AdventLaneRacing_GT_3_H1` | 61 kr | 0 | — | — | 24,0 % | 16,4 % | 2,61 % | 0 | 132 kr |
| 13 annonser ≤ 28 kr | 139 kr | 0 | — | — | — | — | — | — | — |

**Beslut ur `factory/budgetbeslut.mjs` (ny annons-regeln, Axel 2026-09-10):**
`PD_1_H1` pausas — 837 kr ≥ 3 × target-CPA (594 kr), CPA 419 kr över BE 323 kr.
Rotorsak, inte dom: CBO:n gav 74 % av spenden till den annons som i källan
fick 45 kr och 0 köp, medan källans två vinnare `PD_2_1`/`PD_2_H1` fick 9 resp.
4 kr här. Pausen är det som ger vinnarna chansen. Första försöket 2026-09-12
föll på en bugg i `tools/meta-lib.mjs` (`pausa()` läste `daily_budget` på en
annons → Meta 400); rättad samma natt, se rotorsak 8.

---

## Rotorsaker och fallgropar för nästa körning

1. **Kontot bär flera verksamheter.** `915422744950975` har AdventLane, HeimGuard,
   TankGuard, DryTrek, TackleBay och Bäverbutikens danska kampanjer (298 annonser
   2026-09-11, 15 är kalenderns SE). Varje uppslag filtreras på `AdventLaneRacing`.
2. **`factory/kallannonser.mjs` har DryTreks norska mönster som DEFAULT**
   (`kalla.no_kampanjmonster ?? 'gamasj|damask'`, rad 163). Kalenderns produktfil
   saknar fältet, så `kallannonser.mjs adventskalender-racingbilar` listar
   DryTreks Gamasjer-annonser som "källa NO" (mätt 2026-09-11: 16 annonser,
   0 ACTIVE). NO-kampanjen i kontot fick rätt copy ändå (verifierad), men
   namnmönstret följde damaskernas. Sätt `kalla.no_kampanjmonster` i
   produktfilen innan `/ny-annonser` eller `kallannonser.mjs` körs igen för
   någon kalender — annars läses fel produkts norska historik som arv.
3. **Norge har eget pris: 439 kr** (Axel 2026-09-11; Sverige 499 kr). Ett
   setup-fynd 2026-09-11 kallade NO-annonsernas 439 kr "fel pris" utifrån
   `kalender.yaml` (`valuta: SEK`) — det var fel; kontot och Axel är facit.
   Läs aldrig norskt pris ur butikskonfigen, läs det ur kontot eller fråga.
   **Avgjort 2026-09-12 (Axel: "439 i Shopify"):** Norge-marknaden har NOK som
   basvaluta och ett fast pris **439 NOK, jämförpris 579 NOK** i prislistan
   "Norge NOK" — läst ur Admin-API:t och verifierat som norsk kund
   (`Shopify.currency = NOK`, 439,00 / 579,00 kr). NO-annonsernas "579 kr → 439 kr"
   stämmer alltså mot sidan. `kalender.yaml` säger nu `valuta: NOK`, produktfilen
   `no_pris_nok: 439`. ⚠️ Paketnivåerna visar SEK-tal i norska vyn (848,30 kr
   för 2 st bredvid 878 = 2 × 439) — NOK-paketnivåer är ett obyggt steg.
   NO-CS-copyns brådska ("i dag", "begrenset lager") strider mot brandets ton,
   men **Axel beslutade 2026-09-11 att inget pausas.** Marknadsfiltret i ronden
   är SE, så NO-kampanjen döms inte av nattvakten men spenderar (≈ 445 kr
   första dygnet) och syns bara i "bortfiltrerade".
4. **Ingen commission utgår på den här butiken i dag.** Kontot står i
   `UTLANDSKA_KONTON` i `commission/berakning.mjs` (känt, Uppdrag D i `factory/FAS2.md`).
5. **SE-kampanjens copy läst ur kontot 2026-09-11 13:40 (`/ops-leverans`):**
   PD och GT = källans ordagrant (inkl. "Ge honom"); **CS oförändrad med "23%
   rabatt – bara idag" + "Begränsat lager – slut innan jul"** (punkt 1 ovan är
   alltså INTE rättad); SP rättad (riktig recension "Sonen längtar till varje
   dag" – Johan, 14 dagars ångerrätt — punkt 2–3 klara). Länk adventlane.se.
7. **Facebook-sidan `1304279782771044` (AdventLane) var OPUBLICERAD 2026-09-11.**
   Meta pausade 10/16 SE- och 7/16 NO-annonser 08:00–08:35 CEST med HARD_ERROR
   2446095 "Sidan har inte publicerats". Sidan saknas i `me/accounts` för
   `META_ACCESS_TOKEN` och `page_id` är tomt i produktfilen — den skapades
   utanför repot. Tills sidan är publicerad kan INGEN annons för butiken
   leverera, och `/ops-leverans` laddar inte upp (ärver samma sida). Metas
   pauser är inte körningens egna: de återaktiveras av Axel eller på hans
   order, aldrig av en rutin på eget bevåg. Spend-datan 2026-09-11 → tills
   sidan är uppe är därför inte jämförbar (annonserna levererade inte).
   **Löst: sidan publicerad 2026-09-12** (`is_published: true` 11:41 UTC; alla annonser ACTIVE igen).
   **Löst 2026-09-12:** alla 16 SE-annonser ACTIVE/ACTIVE vid nattvaktens
   läsning — sidan är publicerad (av Axel, utanför repot).
8. **`pausa()` i `tools/meta-lib.mjs` läste budgetfält på en annons** (mätt
   2026-09-12): tillbakaläsningen FÖRE skrivningen bad om `daily_budget`, Meta
   svarade 400 "(#100) Tried accessing nonexisting field", och PD_1_H1 låg
   kvar ACTIVE medan loggraden sa `genomford: false`. Rättad: `lasStatus()` med
   `STATUSFÄLT` (utan budgetfält), test i `tools/test/meta-lib.test.mjs`.
   Samma bugg låg latent för HeimGuard/TankGuard/DryTrek — ingen av dem hade
   nått en annonspaus än.
9. **Hubben bär Bäverbutikens 20 briefer för samma produkt** (`Adventskalender_`-
   prefix, PD_4–7, CO, BF, RI, RV, TR, LI, UG, AU, FM, CS_4 — 5 In progress,
   4 To be Reviewed, 11 Draft-bilder). De gjordes av Bäverbutikens team före
   flytten och levereras via `/ops-leverans` i OPS-kontot. Läs hubben INNAN
   nya koncept väljs, annars dubbleras de — batch #2 fick fyra backlog-idéer
   strukna av det skälet. AD-ID:n måste läsas ur BÅDA prefixen.
10. **CBO:n i SE-kampanjen belönar fel annons.** 74 % till PD_1_H1 (0 köp på
   45 kr i källan) och 13 kr totalt till källans båda vinnare. Ett nytt test-
   ABO med lika budget (regel 11 i CLAUDE.md) hade gett vinnarna data på ett
   dygn. Nattvakten pausar bara; strukturen är Axels beslut — se rapporten.
   **Axels beslut 2026-09-12: B — CBO:n står kvar** nu när PD_1_H1 är pausad.
   Inget test-ABO byggs. Nästa avläsning visar om Meta flyttar spenden till
   PD_2_1 / PD_2_H1 utan strukturändring.
11. **Nästa briefdag är redan i morgon (sön 2026-09-13)** enligt kadensen
   sön + ons. Ingen av batch #2:s sju annonser har data då. Briefdag utan
   bedömbar annons = ny kallstart-rond — kvoten fylls, men lärdomen är noll
   tills något passerar grinden. Sänk inte kadensen i koden; säg det i rapporten.
6. **Bonusprodukten i Q4-ramverket är inte vald** (`offer.bonus_produkt` tomt;
   state: `bonus.klar: false`). Paketen körs utan gratisdel — säg aldrig "bonus"
   i copy förrän Axel valt en.

---

## Copy-modell A/B (Axels beslut 2026-09-10)

Registret säger `copy_modell: ab`: varannan brief `copy_model: fable`, varannan
`copy_model: sonnet`, taggen i `VARIABELTAGGAR:`. Ställning: **0 bedömbara
annonser per modell** — ingen brief skriven än. Avgörs automatiskt när båda
modellerna har ≥ 5 bedömbara annonser och en vinner med ≥ 20 % marginal.

---

## Körning nr 1 — 2026-09-11, setup (`/notionscalercs setup kalender`)

Ingen brief, ingen budgetändring. Minnet skrevs ur ärvd historik + kontot.
Hubb: Racing Car Advent Calendar creative hub `3d7270ab-908c-81b2-ad69-cf7404a62c4e`
(0 briefrader vid setup — bara mallen). Redigerare: ingen tilldelad →
briefronden begränsas till 7 per rond. Första briefdag enligt registret:
söndag 2026-09-13 (briefdagar sön + ons).

---

## Körning nr 2 — 2026-09-12, första briefdagen (`/notionscalercs kalender/adventskalender-racingbilar`)

- **Budgetrond:** kampanjen under grinden (1 126 kr, 2 köp) — ingen budgetändring.
  En annonspaus beslutad (`PD_1_H1`, ny annons-regeln), första försöket föll på
  buggen i rotorsak 8, omkört efter rättning — utfallet står i batch-log.md.
- **Analys:** 0 bedömbara ⇒ KALLSTART. Ärvd historik uppdaterad (tabellen ovan).
- **Batch #2:** 7 briefer (4 video, 3 bild) i hubben som Draft, alla nya koncept
  ur ärvd DNA + backlog; 2 märkta gissning (MR_1, FF_1). Hypoteser i batch-log.md.
- **Winning DNA (oförändrad, ärvd):** PD-vinkeln bär allt; bild och video lika på
  ROAS, bilden skalar, videon konverterar. **Losing DNA (ny, OPS-data, 2 köp —
  preliminär):** `PD_1_H1` — 74 % av spenden, CPA 419 kr; i källan 45 kr/0 köp.
  Hypotes: CBO:ns fördelning, inte creativen, är förklaringen. Bekräftas när
  PD_2_x får spend efter pausen.
- **Nästa körning:** sön 2026-09-13 är briefdag enligt kadens — troligen ny
  kallstart (rotorsak 11). Döm inget under grinden.
