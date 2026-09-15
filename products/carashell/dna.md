# Creative DNA — CaraShell (taköverdraget)

Skapad 2026-09-12 av `/notionscalercs setup carashell` (körning nr 1).
Butiks-id `carashell`, nyckel `carashell/takskyddet`, brand **CaraShell**, carashell.se.
Annonskonto: **MagiBorsten DK `915422744950975`** (det delade OPS-kontot).

⚠️ **All prestandadata under "Vad som är bevisat" är ÄRVD från Bäverbutiken.**
CaraShells egen kampanj `CARASHELL_SE_Taköverdraget` startade 2026-09-11 och har
per 2026-09-12 **314 kr spend och 0 köp på 16 annonser**. **0 av 16 har passerat
signifikansgrinden** (≥ 300 kr OCH ≥ 3 köp) — butiken är en **KALLSTART**:
ingen feedback-loop, ingen dom över en enda CaraShell-annons ännu.

⚠️ **En produkt i dag.** Kommer produkt nr 2 (butiken bär nischen, inte
produkten — se `factory/butiker/carashell.yaml`) ska minnet delas per
produktnyckel, `products/carashell/<produkt>/`, precis som TackleBay
(`products/tacklebay/README.md`).

---

## Produkten och kunden

Taköverdrag för husvagn och husbil, 6,5 × 3 m. Täcker takytan, kanten hänger
30–40 cm ner över sidorna, elastiska spännband med plastkrokar hakar under
karossens kant. En person sätter på det själv.

**Kunden:** husvagns- och husbilsägare som ställer undan ekipaget över vintern
och inte går upp på taket förrän i vår. Källtexten säger "husvagn", bilderna
visar en husbil — produkten passar båda, och copyn säger båda.

**Grundkonflikten:** taket är den yta du aldrig ser, och den som kostar mest att
laga. Skadan upptäcks först när fukttestet görs på våren — då är den redan gjord.

⚠️ **Aldrig påstå:** förvaringspåse, dragsko, vikt eller exakta vagnlängder.
Källtexten nämner påse och dragsko, leverantörens bilder visar dem inte
(`factory/produkter/takskyddet.yaml`). Källans PD-annons påstår båda — CaraShells
version gör det inte, och ska inte börja.

---

## Vad som är bevisat (ÄRVT — källa: Bäverbutiken, avläst 2026-09-12)

Konto `1867947880635861` (**LÄSES bara**), prefix `Takoverdrag`, hela livstiden.
Källkampanj: `Taköverdraget för Husvagn 6,5 × 3 m | BE ROAS 1.63 | Launch 2026-09-09`.
**16 annonser · 8 611 kr spend · 53 köp · samlad ROAS 7,04 · verklig AOV 1 144 kr.**
6 bedömbara, 10 under grinden. Dömda mot CaraShells linje (BE-CPA 693 kr).

### Per vinkel (ÄRVD, hela livstiden)

| Vinkel | Kod | Spend | Köp | CPA | Andel spend | Dom |
|---|---|---:|---:|---:|---:|---|
| Problemet — taket du aldrig kollar | PD | 3 623 kr | 16 | **226 kr** | 42 % | **Bevisad.** Bär mest spend och flest köp. |
| Erbjudandet — 23 % rabatt | CS | 1 439 kr | 14 | **103 kr** | 17 % | **Bevisad.** Bästa CPA av alla fyra. |
| Presenten — "han älskar husvagnen" | GT | 1 561 kr | 14 | **111 kr** | 18 % | **Bevisad.** En enda annons (`GT_2_H1`) bär 14 av 14 köp. |
| Social proof — kundernas omdöme | SP | 1 986 kr | 9 | **221 kr** | 23 % | **Bevisad.** Nästan allt ligger i bildversionen. |

Alla fyra ligger under break-even-CPA 693 kr. **Ingen vinkel är utdömd** — det
skiljer CaraShell från HeimGuard och DryTrek, där en eller två vinklar bar allt.

### Toppannonserna (ÄRVD, rangordnade på vinstbidrag mot CaraShells linje)

| Ärvd annons | Typ | Spend | Köp | CPA | ROAS | Vinstbidrag | Hook 3s | Hold | CTR | CPC |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `Takoverdrag_GT_2_H1` | video | 1 500 kr | 14 | 107 kr | 10,54 | **8 202 kr** | 50,7 % | 25,3 % | 4,67 % | 2,99 kr |
| `Takoverdrag_CS_2_H1` | video | 730 kr | 9 | 81 kr | 13,91 | **5 507 kr** | 48,4 % | 23,4 % | 3,33 % | 4,94 kr |
| `Takoverdrag_SP_2_1` | **bild** | 1 656 kr | 8 | 207 kr | 5,45 | **3 888 kr** | — | — | 10,85 % | 0,94 kr |
| `Takoverdrag_PD_2_H1` | video | 2 450 kr | 9 | 272 kr | 4,15 | **3 787 kr** | 54,8 % | 51,8 % | 6,45 % | 1,86 kr |
| `Takoverdrag_PD_2_1` | **bild** | 484 kr | 4 | 121 kr | 9,32 | 2 288 kr (prel.) | — | — | 6,49 % | 1,72 kr |
| `Takoverdrag_PD_1_H1` | video | 468 kr | 3 | 156 kr | 7,23 | 1 611 kr (prel.) | 51,1 % | 41,7 % | 7,73 % | 1,35 kr |

Under grinden (ingen dom): `SP_2_H1` 269 kr/1 köp · `CS_2_1` 241 kr/3 ·
`CS_3_H1` 235 kr/0 · `CS_1_H1` 233 kr/2 · `PD_3_H1` 221 kr/0 · `GT_1_H1` 35/0 ·
`SP_3_H1` 35/0 · `SP_1_H1` 26/0 · `GT_3_H1` 23/0 · `GT_2_1` 3/0.

---

## Mönstren

**Mönster 1 — de billigaste vinklarna fick minst pengar (BEVISAD, ärvd).**
CS (103 kr CPA) och GT (111 kr) tillsammans: 35 % av spenden, 28 av 53 köp.
PD (226 kr) ensam: 42 % av spenden. Det är Metas CBO-fördelning, **inte en dom**
över CS och GT — de har aldrig fått volymen. Första frågan när CaraShells egen
data finns: håller CS och GT sin CPA när de får mer budget?

**Mönster 2 — en enda annons bär hela GT-vinkeln (HYPOTES).**
`GT_2_H1` står för 14 av GT:s 14 köp på 1 500 av 1 561 kr. De tre andra
GT-annonserna fick 61 kr tillsammans. Vinkelns CPA är alltså **en annons CPA**,
inte vinkelns. Läs GT som "den här creativen funkar", inte som "presentvinkeln
funkar" — förrän en andra GT-annons har spenderat.

**Mönster 3 — bilderna replikerar här (BEVISAD, ärvd, 2 annonser).**
`SP_2_1` (bild) tog 8 köp på 1 656 kr medan videoversionen `SP_2_H1` fick 1 köp
på 269 kr; `PD_2_1` (bild) gav 4 köp på 484 kr med CPA 121 mot videons 272 kr.
Bild har lägst CPC av allt (0,94 kr) och högst CTR (10,85 %).
⚠️ Detta är motsatsen till HeimGuard, där bildversionerna av vinnarna inte
replikerade (`products/hemvakten/dna.md` mönster 3). Produkten är visuell och
statisk — ett tak med ett överdrag på — vilket är den troliga förklaringen.
Bild ska ha en rejäl andel av CaraShells batcher.

**Mönster 4 — hook-raten skiljer ingenting, hold ljuger (BEVISAD, ärvd).**
Alla videor ligger på hook 42–55 %. `PD_2_H1` har högst hold av alla (51,8 %)
och näst sämst CPA av vinnarna (272 kr); `GT_2_H1` har hold 25,3 % och bäst CPA
(107 kr). **Använd aldrig hold som urvalskriterium på den här produkten** —
det är ett diagnosmått för var tittaren tappar, inte ett köpmått.

**Mönster 5 — CTR och CPA går isär (HYPOTES).**
`SP_2_1` har högst CTR (10,85 %) och lägst CVR (0,45 %); `CS_2_H1` har lägst CTR
(3,33 %) och högst CVR (6,08 %). Rabattvinkeln hämtar färre klick men rätt
klick. Det talar för att CS-trafiken är köpnära och SP-trafiken nyfiken.

---

## Vad CaraShell ändrade mot källan — och varför datan inte är rakt jämförbar

Avläst i båda kontona 2026-09-12.

1. **PD: mekanismen rättades.** Källan: "Spänns fast med rem och dragsko" +
   "Ryms i egen förvaringspåse". CaraShell: "elastiska spännband som hakar under
   karossens kant" + "Täcker hela taket – kanten hänger ner 30–40 cm över
   sidorna". Källans två påståenden går inte att se i bilderna och är därför
   borttagna. ⚠️ Bärande raden i den mest spenderade ärvda annonsen är alltså
   **utbytt** — behandla PD-utfallet hos CaraShell som en ny hypotes.
2. **SP: social proofen byttes mot riktiga omdömen.** Källan: "Ångrar att jag
   inte köpte det här förra vintern" + "fler och fler husvagnsägare". CaraShell:
   "Passar bra och skyddar taket mot väder." – Lars, "Ett av 16 omdömen – alla
   fem stjärnor". Butiken är ny och har 16 recensioner, inte "fler och fler".
3. **SP: garantin rättades.** "30 dagars öppet köp" → "14 dagars ångerrätt
   enligt svensk lag" — butikens faktiska villkor.
4. **CS: lagerbristen ströks, rabatten står kvar.** Källans "Lagret är begränsat
   och priset gäller bara ett tag till" är borttagen och ersatt av betalsätt,
   ångerrätt och leveranstid. ⚠️ **Men "🔥 23% RABATT … – IDAG 🔥" står kvar**,
   och 1 129 kr är butikens stående pris (jämförpris 1 469 kr). Det är samma
   falska brådska som togs bort hos HeimGuard. **Öppen fråga till nästa
   briefdag:** ska CS skrivas om utan "IDAG", och isolerar det variabeln?
5. **GT: oförändrad, ordagrant från källan.** Det gör GT till den renaste
   jämförelsen mellan butikerna — och den enda vinkel där ärvd data får läsas
   som en fortsättning snarare än som riktning.
6. **Priset rördes inte.** 1 129 / 1 469 kr i båda butikerna.

---

## Ekonomin

Pris **1 129 kr** · jämförpris 1 469 kr · inköp **436 kr** ⇒ TB 693 kr ·
**BE-ROAS 1,63 · BE-CPA 693 kr · target-ROAS 2,75 · target-CPA 411 kr**,
räknat **UTAN moms** (`moms_antagen: false` i `factory/produkter/takskyddet.yaml`)
— den linjen dömer `factory/budgetrond.mjs`.

⚠️ **Inköpspriset 436 kr är HÄRLETT, inte kvitterat.** Det är baklängesräknat ur
källkampanjens namn ("BE ROAS 1.63"). Stämmer det inte mot Temu-kvittot flyttar
sig break-even, och varje kill-beslut med det. Axels kontroll.

⚠️ **Kampanjnamnet i OPS-kontot säger "BE-ROAS 1,51", produktfilen 1,63.**
Namnet är bara en etikett — yaml-filen är facit och den som räknas mot. Skillnaden
är ändå värd att rätta nästa gång kampanjen döps om, så ingen läser fel linje.

---

## Nuläget i CaraShells eget konto (2026-09-12)

`CARASHELL_SE_Taköverdraget | BE-ROAS 1,51 | 2026-09-11` — ACTIVE, CBO
1 000 kr/dag, 4 adsets (PD, SP, GT, CS), 16 annonser (12 video + 4 bild).
**314 kr spend, 0 köp på 3 dygn.** Under grinden på både spend och köp ⇒
budgetronden rör ingenting och ska inte göra det.
`CARASHELL_NO_Takovertrekket | BE-ROAS 1,51 | 2026-09-11` finns i samma konto
(9 annonser) och körs med `--marknad NO`.

Spend per annons i CaraShell så här långt: `PD_2_H1` 114 kr · `PD_1_H1` 46 ·
`SP_2_H1` 46 · `SP_3_H1` 29 · `PD_3_H1` 22 · `GT_1_H1` 18 · `CS_1_H1` 13 ·
resten under 10 kr. CBO:n har alltså börjat med PD — samma vinkel som fick mest
i källan, och samma risk som mönster 1 beskriver.

---

## Mönstren ur CaraShells EGEN data (avläst 2026-09-14, körning nr 2)

⚠️ Alla fyra är **hypoteser**, inte bevis: 0 av 16 annonser har passerat
signifikansgrinden (≥ 300 kr OCH ≥ 3 köp). De är grupperade utfall över
2 435 kr och 8 köp — riktning, inte dom. `SP_2_1` ligger 3 kr från grinden.

**Mönster 6 — bild slår video 3,6× på CPA (HYPOTES, egen data).**
Bild: 531 kr, 4 köp, **CPA 133 kr**, vinstbidrag 2 241 kr — 72 % av allt
vinstbidrag på 22 % av spenden. Video: 1 904 kr, 4 köp, CPA 476 kr,
vinstbidrag 868 kr. Detta **bekräftar ärvd mönster 3 i CaraShells eget konto**
och är motsatsen till HeimGuard. Produkten är visuell och statisk — ett tak med
ett överdrag på — och det syns i datan.
→ **Instruktion:** majoriteten av varje batch ska vara bild. Batch #2 är 4 av 7.

**Mönster 7 — SP tog över från PD (HYPOTES, egen data).**
Hos CaraShell: SP 42 % av spenden, **5 av 8 köp**, CPA 204 kr, vinstbidrag
2 447 kr (79 % av totalen). PD 36 %, 2 köp, CPA 443 kr. I källan var ordningen
omvänd — PD störst med 16 köp, SP svagast av de bevisade (CPA 221 kr).
**Trolig rotorsak:** de två ändringarna mot källan drog åt olika håll. PD:s
bärande mekanismrad byttes ut (ändring 1) och tappade; SP fick riktiga omdömen
i stället för "fler och fler husvagnsägare" (ändring 2) och vann. Ändringen som
gjordes för sanningens skull gjorde annonsen starkare, inte svagare.
→ **Instruktion:** SP får flest briefer. PD-varianter bär den rättade
mekanismen och testas i bildformat.

**Mönster 8 — GT replikerade inte, men har aldrig fått chansen (HYPOTES).**
GT: 188 kr (8 % av spenden), **0 köp** på 4 annonser. I källan är `GT_2_H1`
bäst av allt (14–18 köp, vinstbidrag 8 202–10 135 kr); CaraShells `GT_2_H1`
fick 54 kr och 0 köp. ⚠️ **Detta är inte en dom** — 188 kr över fyra annonser
är långt under grinden. Frågan i ärvd mönster 2 (bar vinkeln eller creativen?)
är fortfarande obesvarad.
→ **Instruktion:** GT testas som bild i batch #2, och ska därefter till ett
eget test-ABO med lika budget om CBO:n fortsätter svälta den.

**Mönster 9 — CBO-svälten upprepar sig, tredje gången (BEVISAD).**
Ärvd mönster 1 sa det om källkontot. Nu i CaraShells eget: CS (14 %) och GT
(8 %) får tillsammans 22 % av spenden medan PD+SP tar 78 %. Samtidigt gav
`CS_1_H1` 1 köp på 110 kr — **CPA 110 kr, bäst av alla videor** — och fick ändå
aldrig mer än 110 kr. Metas CBO lägger pengarna där de redan ligger.
→ **Instruktion:** detta är exakt CLAUDE.md regel 11. Nya tester hör hemma i
eget test-ABO med lika budget per annons, aldrig i skalningens CBO.

**Mönster 4 står sig (hook/hold ljuger).** `PD_1_H1` har högst hook (54 %) och
hold (42 %) av alla videor — och **0 köp** på 266 kr. `SP_2_1` har ingen
videometrik alls och bäst CPA i hela kontot. Använd dem som diagnos av var
tittaren tappar, aldrig som urvalskriterium.

---

## Norge-runda 2026-09-14 (`/ops-oversatt carashell`) — tre fynd som gäller framåt

**1. Konceptkoden heter GT i Sverige och G i Norge.** `CARASHELL_SE_Taköverdraget`
har adsetet `- GT` för presentvinkeln; `CARASHELL_NO_Takovertrekket` har `- G`
för exakt samma vinkel (kampanjen byggd av `/ny-annonser` ur källans norska
kampanj). `valjAdsetForKoncept` i `tools/meta-lib.mjs` matchar på suffix och ser
därför inte att `GT` och `G` är samma sak — den mekaniska namnöversättningen
`CaraShellRoof_GT_4_1` → `CaraShellRoof_NO_GT_4_1` hade skapat ett ANDRA
presentadset bredvid det som redan spenderar, och delat vinkelns budget i två i
en CBO.
→ **Instruktion:** presentannonser döps `CaraShellRoof_NO_G_<n>_<v>` i Norge,
aldrig `NO_GT`. Läs alltid NO-kampanjens egna adsetnamn innan du litar på den
mekaniska namnöversättningen. PD, SP och CS heter lika på båda marknaderna.

**2. De norska annonserna landar på en sida som visar SEK.** Mätt 2026-09-14:
`https://carashell.se/nb/products/takskyddet` svarar `"currencyCode":"SEK"` och
1 129,00 kr, medan samma URL med `?country=NO` svarar `"currencyCode":"NOK"` och
1 106,00 kr (jämförpris 1 382,50). NOK är alltså påslaget som Norges
marknadsvaluta (prislistan i `factory/produkter/takskyddet.yaml`), men
marknadsparametern måste stå i länken för att slå igenom. De nio ärvda
NO-annonserna (`NO_PD_1–3`, `NO_SP_1–3`, `NO_G_1–3`) saknar parametern och
skickar därför norska kunder till en SEK-sida. Samma fel som HeimGuard, se
`products/hemvakten/dna.md`.
→ **Instruktion:** varje ny NO-annons laddas upp med
`--lank https://carashell.se/nb/products/takskyddet?country=NO`. De fyra
annonserna från den här ronden har den; de nio äldre har den inte, och att göra
om deras creatives är Axels beslut.

**3. Norsk copy skrivs utan pris.** `factory/butiker/carashell.yaml` säger
`valuta: SEK` för NO medan `factory/produkter/takskyddet.yaml` bär en
NOK-prislista — filerna säger olika. Tills det är utrett gäller kommandots
grundregel: ingen prissiffra i norsk copy, precis som i alla nio ärvda
NO-annonser. CS-vinkeln (erbjudandet) bär därför villkoren — fri frakt SE/NO,
5–10 arbetsdagar, 14 dagars ångerrätt — i stället för prisfallet, och
**CS-annonsen i Norge kan inte läsas som ett pristest** även om den svenska
tvillingen är det.

---

## Körning nr 2 — 2026-09-14 (`/notionscalercs carashell`, briefrond nr 1)

Butikens **första riktiga rond** — de tre rutinerna som setup-körningen trodde
sig ha byggt existerar inte (se nedan), så ronden kördes för hand.

Gjort: budgetronden (kampanjen 1 000 → 1 200 kr, SNABB-regeln: vinst 34,4 %
och ROAS 3,71 på både 3 och 7 dagar), feedback-loopen ovan, batch #2 med
7 briefer, mönster 6–9 inskrivna.

⚠️ **Hub-id:t var fel och stoppade allt.** Registret pekade på
`3d9270ab-908c-819d-be0f-c6cb71320871`, som ligger i papperskorgen
(`in_trash: true`). Rättat till `3da270ab-908c-80c4-80d1-fbdb3fefd3b4`.
Notion svarar OK på `GET /databases/<id>` men 404 på `query`, med en text om
att dela databasen med integrationen — den läser som ett behörighetsfel och är
det inte. Läs fältet `in_trash`, inte feltexten.

⚠️ **Rutinerna saknas.** CLAUDE.md dokumenterade tre rutiner på Axels andra
konto; Axel kollade i Routines-vyn 2026-09-14 och såg inga. Det förklarar varför
butiken aldrig lämnat ett spår: noll budgetloggrader, ingen `kord`-stämpel,
ingen commit mellan 2026-09-12 och i dag.

---

## Körning nr 1 — 2026-09-12 (`/notionscalercs setup carashell`)

Det här är setup-körningen, inte en briefrond. Gjort: registret, Notion-hubben
(`CaraShell creative hub`), det här minnet ur ärvd historik, torrkörningarna och
de tre rutinerna. **Ingen brief skriven, ingen budget ändrad.**

Ingen feedback-loop går att göra: ingen CaraShell-annons är bedömbar.
Första riktiga briefronden blir en **kallstart ur ärvd DNA** enligt mönster 1–5.
