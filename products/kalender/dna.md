# Creative DNA — AdventLane (Adventskalender Racingbilar)

Skapad 2026-09-11 av `/notionscalercs setup kalender` (körning nr 1 — setup, ingen brief).
Butiks-id `kalender` (nischbutik för adventskalendrar), produkt-id
`adventskalender-racingbilar`, registernyckel `kalender/adventskalender-racingbilar`,
brand **AdventLane**, adventlane.se (Shopify `ikf0tu-5e`).

⚠️ **All prestandadata under "Vad som är bevisat" är ÄRVD från Bäverbutiken.**
AdventLanes egna kampanjer skapades 2026-09-10 och hade vid avläsning 2026-09-11
(≈ 1 dygn) **372 kr, 0 köp** (SE). **0 av 15 annonser har passerat
signifikansgrinden** (≥ 300 kr OCH ≥ 3 köp). Första briefdagen blir en
**KALLSTART**: ingen feedback-loop, ingen dom över en enda AdventLane-annons.

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

Pris 499 kr · inköp **191 kr (HÄRLEDD, inte kvitterad)** · TB 308 kr ·
**BE-ROAS 1,62 · BE-CPA 308 kr · target-ROAS 2,72 · target-CPA 183 kr**,
räknat UTAN moms (`moms_antagen: false`, Axels regel 2026-09-09).

⚠️ Inköpspriset är räknat bakåt ur källkampanjens namn ("BE ROAS 1.62" ⇒
499 − 499/1,62 = 191 kr). Axel bekräftar mot Temu-kvittot innan talet får
döma en annons hårt. Tills dess: kill-beslut mot 308 kr är rätt linje att
använda, men skriv alltid ut att linjen är härledd.

⚠️ Temu-länken i produktfilen svarar "This item was discontinued" (mätt
2026-09-10). Inköpskanalen är alltså öppen — det är en ägarfråga, inte en
creative-fråga, men en annons som skalar mot en produkt som inte går att köpa
in är bortkastad spend.

---

## Vad som är bevisat (ÄRVT från källan, läst 2026-09-11)

Källa: Bäverbutiken, konto `1867947880635861` (LÄSES bara), kampanj
`Adventskalendern Racingbilar | BE ROAS 1.62 | Launch 2026-09-08`
(`120250134672020291`), prefix `Adventskalender_`, period hela livstiden
(2026-09-08 → 2026-09-11, ≈ 3 dygn). **16 annonser, 3 147 kr, 16 köp,
ROAS 3,21, verklig AOV 632 kr** (över 499 kr — paketen säljer).
Rådata: `factory/output/adventskalender-racingbilar/kallannonser.json`.

Signifikansgrinden (≥ 300 kr OCH ≥ 3 köp) passeras av **två** annonser.
Vinstbidrag = (BE-CPA 308 − CPA) × köp, mot AdventLanes linje.

| Ärvd annons | Typ | Spend | Köp | CPA | ROAS | Vinstbidrag | Hook 3 s | Hold | CTR | CPC | CVR | Dom |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| `Adventskalender_PD_2_1` | bild | 1 376 kr | 8 | 172 kr | 3,85 | **1 088 kr** | — | — | 4,49 % | 3,8 kr | 2,22 % | **vinnare, top spender = benchmark** |
| `Adventskalender_PD_2_H1` | video | 898 kr | 6 | 150 kr | 3,85 | **950 kr** | 28,7 % | 28,1 % | 2,87 % | 7,4 kr | 4,92 % | **vinnare** |
| `Adventskalender_GT_1_H1` | video | 594 kr | 2 | 297 kr | 2,27 | — | 32,0 % | 20,2 % | 2,33 % | 7,2 kr | 2,44 % | för tidigt (2 köp) — CPA snuddar vid BE |
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
  ⚠️ **NO-erbjudandet (`_NO_CS_1/2/3`, `_NO_CS_2_1`) säger "579 kr → 439 kr i dag",
  "Begrenset lager, prisen gjelder ikke lenge", "Bestill før den er utsolgt".**
  Butikskonfigen säger att /nb tar betalt i **SEK** (`marknader[0].valuta: SEK`,
  NOK inte påslaget) — då stämmer inte annonsens pris med sidan, och brådskan
  är falsk. Kundvyn är lösenordsskyddad och kunde inte läsas 2026-09-11
  (`SHOPIFY_STOREFRONT_PASSWORD_IKF0TU_5E` saknas i miljön). Se rotorsak 3.
- Båda kampanjerna: CBO 1 000 kr/dag, skapade 2026-09-10 13:18 resp. 13:30.
- Saknas i OPS SE mot källan: `SP_2_1` (bild). Skälet står inte i repot.

Bedömbara: **0**. Kallstart tills ≥ 1 annons passerar grinden.

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
3. **NO-annonserna lovar troligen ett pris sidan inte har.** `_NO_CS_*` säger
   439 kr (mot 579 kr). Enligt `kalender.yaml` tar /nb betalt i SEK 499 tills
   NOK-paketnivåer finns i Shopify ("NOK-paketnivåer krävs före norska
   annonser"). Stämmer det ser kunden 439 i annonsen och 499 i kassan.
   **Inte verifierat i kundvyn** (lösenordsskyddad, lösenordet saknas i miljön)
   — Axel eller VA:n öppnar /nb och läser priset. Dessutom falsk brådska ("i dag",
   "begrenset lager") som SE-brandet förbjuder. **Beslut om paus av NO-CS-adsetet
   är Axels** — PAUSED med spend är ett beslut, rutinen rör det inte.
   Marknadsfiltret i ronden är SE, så NO-kampanjen döms inte av nattvakten men
   spenderar (≈ 445 kr första dygnet) och syns bara i "bortfiltrerade".
4. **Ingen commission utgår på den här butiken i dag.** Kontot står i
   `UTLANDSKA_KONTON` i `commission/berakning.mjs` (känt, Uppdrag D i `factory/FAS2.md`).
5. **SE-kampanjens copy är inte läst ur kontot än** (Metas rate limit 2026-09-11
   stoppade läsningen). Punkt 1–3 under "Vad AdventLane måste ändra" är därför
   krav, inte verifierade fakta, för SE. Första briefdagen läser copyn först.
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
