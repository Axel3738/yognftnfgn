# Creative DNA — Adventskalender Racingbilar

Skapad 2026-09-10 av `/forsta-batch` (körning nr 1, automatisk rutinkörning via
`/rond-auto` steg 4b, behov `forsta_batch`). Datakälla: MagiBorsten
`1867947880635861`, kampanj `120250134672020291` ("Adventskalendern Racingbilar
| BE ROAS 1.62 | Launch 2026-09-08"), livstid 2026-09-08 → 2026-09-10 (hämtat
`date_preset: maximum`, kampanjen är bara ~2 dygn gammal).

**Trigger:** passerade 1 500 kr testtröskel med ~36 % vinstmarginal enligt
morgonens `/rond-auto`-körning 2026-09-10, och hade aldrig fått en riktig
brief-runda (produkten saknades helt i `products/`).

## Produktfakta (verifierade 2026-09-10)

- **Adventskalender Racingbilar – 24 Bilar Bakom 24 Luckor**
  (`adventskalender-racingbilar-24-bilar-bakom-24-luckor`), baverbutiken.se.
  Verifierat via publik Shopify storefront-JSON (MCP:n `Shopify` var nere,
  "requires re-authorization (token expired)" — löst utan den).
- **Pris 499 kr, jämförpris 649 kr → 150 kr / 23,1 % rabatt** (variant-id
  65843913654621, SKU `TEMU-601099694788256`). Matchar exakt de "Locked
  numbers" som stod i produktsidan i Notion ("Product test center SE BÄVER").
- 24 luckor, 24 unika bilar (olika färg/modell), hjul som rullar på riktigt.
  Kommer i en färdig presentkartong. **Innehåller små delar — inte lämplig
  för barn under 3 år** (exakt produktsidetext, se kvalitetsflaggor nedan för
  en live-annons som har fel siffra).
- Garanti: **30 dagars öppet köp, pengarna tillbaka**, trygg betalning med
  Klarna. Ingen fri frakt-text på produktsidan — hitta aldrig på en sådan
  claim.
- Säsong: landningssidan byggdes om 2026-09-07 (riktiga Temu-produktbilder +
  GIF). Måste ligga live gott om tid före december.
- **10 recensioner, samtliga 5 stjärnor** (Drive-CSV "Adventskalender
  Racingbilar_REVIEW", `1XUVLVvwkTvcyH4GqF-v5D7AAPfWELM0h6bJNt3IHO24").
  ⚠️ **Datakvalitet:** `product_handle`-kolumnen i filen pekar fel
  (`veckodosett-21-fack-...` på alla 10 rader) — troligen ett kopieringsfel
  vid recensionsimporten. Title/body/reviewer-innehållet handlar obevisligen
  om DENNA produkt (nämner bilar, adventskalender, luckor) så citaten
  används som riktiga, men flaggan är skriven här så nästa körning inte blir
  lurad av kolumnen.
- Break-even-ROAS **1,62×** (ur kampanjnamnet). Break-even-CPA = 499 / 1,62 =
  **307,90 kr**. Ingen `target_roas` satt än — produkten finns inte i
  `products/products.json` (bara de fyra skalningsprodukterna + `vaggfastet`/
  `ai-glasogon` gör det; rond-produkter lever i `agent/produktkarta.json`).
- Meta Ad Library, svenska sökningar: "adventskalender bilar" gav bara våra
  3 egna annonser. "adventskalender leksaker" gav 2 konkurrenter, se FAS 6.

## Datakvalitet (2026-09-10, batch #1)

Kampanjen är ~2 dygn gammal. Summan av alla 16 annonsers `amount_spent`
(1 991,70 kr) och `omni_purchase` (11) stämmer exakt mot kampanjnivån.
Stickprov `amount_spent × purchase_roas` mot `omni_purchase_values` för de tre
största annonserna (PD_2_1, GT_1_H1, PD_2_H1) stämde inom öret — inga trasiga
rader. `omni_purchase_values` användes ändå inte som primär källa (känd bugg
i kontot generellt).

Funnel (kampanjnivå, maximum): LPV 259 → ATC 19 (7,3 %) → IC 11 (57,9 %) →
Köp 11 (100 % av IC). Ingen läcka i kassan — enda svaga länken är LPV→ATC,
normalt/förväntat 2 dygn efter launch.

## Siffrorna 2026-09-10 (signifikansgrind: ≥300 kr OCH ≥3 köp; BE-ROAS 1,62,
BE-CPA 307,90 kr)

Bara **1 av 16 annonser** är bedömbar — väntat läge 2 dygn efter launch, inte
ett larm.

| Annons | Format | Spend | Andel spend | Köp | CPA | ROAS | **Vinstbidrag** |
|---|---|---|---|---|---|---|---|
| **Adventskalender_PD_2_1** | Statisk | 1 033,05 kr | 51,9 % | 7 | 147,58 kr | 4,646 | **+1 122,24 kr (63,6 % av köpen)** |

*Vinstbidrag = (307,90 − CPA) × köp. Enda bedömbara raden — ingen
jämförelsetabell möjlig ännu.*

**Preliminärt, ej dömbart (ANALYSMETOD 2c — bara 2 köp, kan inte skrivas in i
Winning/Losing DNA förrän det överlever nästa körning):**
- `Adventskalender_GT_1_H1` (video): 397,93 kr, 2 köp, CPA 198,97 kr,
  ROAS 3,386. Lovande riktning men för få köp för en dom.
- `Adventskalender_PD_2_H1` (video): 342,67 kr, 2 köp, CPA 171,34 kr,
  ROAS 2,912. Samma sak.

**För tidigt (0 köp, <300 kr spend):** `GT_2_1`, `GT_2_H1`, `CS_2_1`,
`PD_1_H1`, `SP_2_1`, `PD_3_H1`, `GT_3_H1`, `CS_3_H1`, `SP_1_H1`, `CS_1_H1`,
`CS_2_H1`, `SP_3_H1`, `SP_2_H1`.

## FAS 3 — Djupanalys av PD_2_1 (bedömbar vinnare)

Statisk, granskad visuellt (`ads_get_ad_preview`). Headline: "CHOKLADEN
FÖRSVINNER PÅ 10 SEKUNDER – DEN HÄR BLIR KVAR HELA DECEMBER". Bild: kalender-
boxen med alla 24 bilarna uppradade framför på ett köksbord, varmt fönsterljus,
julgransljus i bakgrunden — full scen, produkt + kontext i en bild. Mekanism:
konflikt (copy-regler "konflikt driver allt") — ställer produkten mot
kategorin den ersätter (choklad). Konkret, falsifierbart, inga adjektiv.
Kundcitat bekräftar samma vinkel oberoende ("bra alternativ till godis").

## FAS 6b — Variabelmönster (hypotes, för tidigt data för "bevisad")

1. **HYPOTES (n=1, kan inte bli bevisad förrän ≥2 annonser med ≥3 köp
   vardera):** choklad-vs-leksak-konflikten konverterar starkt (PD_2_1,
   ROAS 4,65, 7 köp — långt över break-even). Bekräftas oberoende av
   recensionerna ("bra alternativ till godis"). → Batch #1 bygger tre
   format-varianter av exakt samma budskap (PD_4_H1/PD_5_H1/PD_6_H1).
2. **HYPOTES:** full produktscen (produkt+miljö i en bild) kan hålla
   uppmärksamheten bättre än tät hand-närbild. Grundat i låg hold-rate på de
   två preliminära videorna (GT_1_H1 9,6 %, PD_2_H1 10,6 %) mot den starka
   helscens-statiska bilden — olika format så inte en ren jämförelse,
   markerad hypotes. → PD_5_H1 testar helscenen som rörlig bild.
3. **KVALITETSFLAGGOR (inte prestandavariabler, obligatoriskt att flagga per
   CLAUDE.md regel 8 — samtliga på redan LIVE-annonser, inte på denna batchs
   nya material):**
   - `CS_2_1` (27,09 kr spend, 0 köp) påstår "BEGRÄNSAT LAGER – SLUT INNAN
     JUL" / "KÖP INNAN DEN TAR SLUT" — påhittad brådska, ingen verifierad
     lagernivå. Förbjudet per CLAUDE.md regel 3. **Åtgärdat i denna batch:**
     `CS_4_1` ersätter med samma äkta rabatt (23 %, 649→499 kr) utan
     påhittad brådska — exakt samma fix-mönster som Båtmotorskyddets
     `CS_2_1`→`CS_4_1`.
   - `GT_2_1` (43,37 kr spend, 0 köp) har fel åldersgräns: "Not for children
     under 2 years" — produktsidan säger korrekt **3 år**. Samma bild
     stavar "small" som "smail". Live-annons, rörs inte av detta flöde —
     **flaggat till Axel**, inte rättad (utanför forsta-batch-mandatet att
     ändra befintliga annonser).
   - `SP_2_1` (24,49 kr spend, 0 köp) har citatet "Bästa kalendern vi köpt –
     han sprang ut ur sängen varje morgon för att öppna en lucka!" –
     "Verifierad kund, 34 år" — **detta citatet finns INTE** i de 10
     verifierade recensionerna (Drive-CSV). Ser påhittat ut — brott mot
     CLAUDE.md regel 3 (aldrig påhittad recensionstext). **Flaggat till
     Axel**, inte rättad (samma skäl som ovan). Denna batchs egna
     recensionsbilder (`RV_1_1`, `RV_2_1`) använder ENDAST verbatim citat ur
     den riktiga filen.

## FAS 6 — Konkurrentresearch (Meta Ad Library, SE)

- Familjebutiken Calimero: "Gör årets adventskalender lite ROLIGARE!" —
  positionerar leksakskalendern som tillägg/uppgradering, inte ersättning.
  Inte använd i denna batch — sparad i `backlog.md`.
- Okänd sida (Dumpling-tema): "Vilken liten Dumpling gömmer sig bakom nästa
  lucka?" — nyfikenhets-hook på VAD som gömmer sig bakom luckan. Lånad in i
  `AU_1_H1`/`CO_1_H1`:s öppningsscener (vilken bil/färg avslöjas).
- Internt lån: Båtmotorskyddets `FM_1_H1` (kontots bästa hook/hold-video,
  42,8 %/60,3 %) — säsongs-/ritual-mekanismen, transfererad hit som
  `FM_1_H1` (morgonrutinen, dag 1 → dag 24).

## Winning DNA
- Choklad-vs-leksak-konflikthooken (PD_2_1) — enda bevisade mönstret hittills,
  men bara på 7 köp (n=1 bedömbar annons). Skriv INTE in som "bevisad" förrän
  ≥2 bedömbara annonser bekräftar samma mönster.
- Full produktscen (box + alla 24 bilar + varm köksmiljö) — samma bild som
  bär den enda vinnaren.
- Exakt pris 499 kr / jämförpris 649 kr (23 %) — aldrig andra tal.
- Verbatim recensionscitat ur Drive-CSV:n, aldrig omskrivna eller påhittade.

## Losing DNA / kvalitetsflaggor (se FAS 6b ovan för full text)
- Påhittad brådska (`CS_2_1`) — åtgärdad i denna batch via `CS_4_1`.
- Fel åldersgräns + stavfel (`GT_2_1`) — flaggad, ej åtgärdad (live-annons).
- Misstänkt påhittat recensionscitat (`SP_2_1`) — flaggad, ej åtgärdad
  (live-annons).

## Obevisat / hypotes
- Full-scen video vs. tät hand-närbild (se FAS 6b punkt 2) — testas i
  `PD_5_H1`.
- Auktoritets-/kvalitetsvinkeln (`AU_1_H1`), UGC-format (`UG_1_H1`),
  familjeritual (`FM_1_H1`), jämförelse split-screen (`CO_1_H1`/`CO_2_1`),
  aggregerad social proof (`TR_1_H1`/`TR_2_1`), ärlig leveranstids-risk
  (`RI_1_H1`/`RI_1_1`) — samtliga helt nya, obeprövade mekanismer i batch #1.

## Modellpolicy-avvikelse

Inget Agent/Task-verktyg med `model`-parameter var tillgängligt i den här
körningen (verifierat via ToolSearch — bara MCP-verktyg och inbyggda
verktyg gick att hitta, inget subagent-verktyg med modellval). Huvudsessionen
skrev all svensk copy själv och körde tre-frågorstestet
(`docs/copy-regler.md`) explicit per rad i varje brief — samma dokumenterade
avvikelse som tidigare batcher (Kranskydd Frost 420D, Surveillance Camera,
IBC-Tanköverdraget, Fish rod holder NO, Båtmotorskyddet 420D m.fl.,
2026-08-29 → 2026-09-08).
