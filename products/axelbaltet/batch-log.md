# Batch-logg – Axelbältet (axelbaltet)

Kampanj 120249192013870291 · MagiBorsten 1867947880635861 · Target-CPA 185 kr · **Break-even-CPA 326 kr** (kill mäts mot break-even).

## Batch #1 – 2026-07-22 (13 annonser, lanserade av teamet före OS:et)

3 adsets (PD/SO/SF) × video-hooks + statics. Utfall per 2026-08-05 (två mätperioder):

| Annons | Hypotes (rekonstruerad) | Utfall |
|---|---|---|
| SO_1_H2 (video 25s, säsong+offer) | Offer-close + kort video konverterar | ✅→❌ Vann period 1 (CPA 180, ROAS 3,26), **fatigade period 2 (CPA 328, ROAS 1,80)**. Lärdom: vinnarvideor dör på ~10 dagar – rotera. |
| PD_1_H1 (video 40s, smärtfråga) | Smärt-hook fångar problem aware | ⚠️ Hög hook (47,8 %) men CPA 243→247, över target. Stabil men för dyr. Tappar sista tredjedelen av videon. |
| SO_2_1 (statisk 20 % rabatt) | Rabatt som hook bär en statisk | ✅✅ CPA 170→155, ROAS 3,51→3,64. **Bevisad vinnare.** |
| SF_1_H1/H2/H3, SO_1_H1/H3, PD_1_H2/H3, PD_2_1, SF_2_1 | Hook-/koncepttester | ❌ Ingen dom – CBO gav <300 kr styck. PD_2_1+SF_2_1 = DO_NOT_REUSE (AI-artefakter/fabricerat citat). SO_1_H1 nu 294 kr utan köp – nära förlorargräns. |
| PD_2_2 (native produktbild) | – | Osäker: 1 köp/44 kr totalt, ROAS ~11. Intressant riktning. |

## Batch #2 – 2026-07-29 (9 statics, lanserade av teamet från Claude-briefer 28/7)

| Annons | Hypotes | Utfall 2026-08-05 |
|---|---|---|
| SO_2_4 (vinnarstatisk i 4:5) | Lägre CPM → lägre CPA | ❌ **Falsifierad**: CPM 94 kr (lägst) men CPA 442 kr, ROAS 1,15 på 2 210 kr. Pausad av teamet. Billig räckvidd ≠ köpare. |
| SO_6_1 (säsongsurgency) | Tidsfönster-framing slår lager-scarcity | ❌ **Förlorare**: CPA 568 kr, ROAS 1,05 på 568 kr. Pausad 2026-08-05 (kill-regel: >500 kr och CPA >3× target). |
| SO_2_3 (kronor-anchor) | Kronor slår procent | ⏳ OTESTAD – bara 32 kr (CBO svälte den). Ej falsifierad. |
| SO_2_2 (buren av person) | Kontext ökar begriplighet | ⏳ Osäker – 21 kr, men CTR 7,46 % (bästa tidiga signalen i batchen). |
| PD_4_1 (annoterad demo) | Feature-tydlighet | ⏳ Osäker – 254 kr, 0 köp, CTR 1,26 % (svag signal). |
| SP_5_1 (äkta betyg) | Ärlig social proof bär statisk | ⏳ Osäker – 90 kr. |
| PD_5_1, SO_7_1, PD_6_1 | – | ⏳ Osäkra – 19–45 kr styck. |

**Strukturlärdom bekräftad två gånger: CBO svälter nya tester. Nästa batch behöver egen testcell (ABO) eller min-budget.**

## Batch #3 – 2026-08-05 (denna /cs-körning) – 8 briefer

**Två korrigeringar gjorda 2026-08-05 efter första leveransen:**
1. **Pris:** ägaren höjde priset 509 → **599 kr** (jämförpris 678 kr, spara 79 kr = 11,65 %). All copy skrevs om av sonnet-subagent. 509 kr / 636 kr / "20 %" är nu förbjudna siffror.
2. **Namnstruktur:** korrigerad till `PRODUKTNAMN_KONCEPT_ADID_ADVARIANT_HID` (t.ex. `Trimmerbelt_SO_1_1_H4`). De sex videorna bytte namn; de två statiska var redan korrekta.

Kvot: 7 per 3-dagarscykel → batch = 8. Copy skriven av sonnet-subagent (modellpolicy).
Briefer: Drive-mappen **"Batch #3 – KORRIGERAD 599 kr"** (https://drive.google.com/drive/folders/1Q8zldJ5mBD_LKrPRPxZ4wXLDfHBXBj8w).

| Annons | Typ | Hypotes | Isolerad variabel |
|---|---|---|---|
| Trimmerbelt_SO_1_1_H4 | Video 25s | Ny hook återställer den fatigade vinnaren (CPA 328 → under 185) | Endast hook (H4 på SO ad 1) |
| Trimmerbelt_SO_1_2_H2 | Video 15s | Kortare → p100 ≥ 10 % → CPA −15 % | Endast längd (variant 2, samma hook) |
| Trimmerbelt_SO_1_3_H2 | Video 25s | 678→599-endcard slår vagt "specialpris" på LPV→köp | Endast close (variant 3, samma hook) |
| Trimmerbelt_PD_3_1_H1 | Video 20s | Mekanismdemo closar problem aware-trafiken som PD ad 1 fångar men tappar | Ny persuasion-mekanism |
| Trimmerbelt_SP_3_1_H1 | UGC 25–27s | Skeptiker-ram + äkta 4,75/5 öppnar social proof-spåret | Ny persuasion-mekanism |
| Trimmerbelt_SP_4_1_H1 | Video 30s | Identitet/självständighet + kvinnlig creator når segment vi missar | Ny målgruppsram |
| Trimmerbelt_SO_2_5 | Statisk | Vinnarstatiskans budskap i ny formulering förlänger livslängden — OCH rättar det felaktiga 20 %-claimet | Endast textformulering (variant 5) |
| Trimmerbelt_PD_2_3 | Statisk | Native foto utan overlay skalar när copyn bär säljet | Overlay vs native (variant 3) |

## Åtgärder och öppna punkter 2026-08-05

- ✅ SO_6_1 pausad (kill-regel: 568 kr spend, CPA 568 kr, ROAS 1,05).
- ⚠️ **KRITISKT – ägarbeslut krävs:** live-vinnaren SO ad 2 variant 1 har **"FÅ 20 % RABATT IDAG" inbränt i bilden**. Efter prishöjningen är det ett falskt claim mot produktsidan (verklig besparing 79 kr = 11,65 %). Den är kontots bästa annons (CPA 155 kr) — att pausa kostar intäkt, att låta gå är en offer-integritetsrisk. Rekommendation: producera SO_2_5 omgående och byt.
- ⚠️ Två creatives skapade i kontot 2026-07-29 har fel pris inbränt och får INTE launchas: creative 2178753102691194 ("636 kr → 509 kr") och 1324700059732480 ("FÅ 20 % RABATT"). Samma gäller de 6 statiska PNG:erna som genererades 29/7.
- ⚠️ Target-CPA i products.json (185 kr) är satt utifrån det gamla priset 509 kr. Högre pris = högre tillåten CPA. **Ägaren sätter target-CPA, inte Claude** — behöver räknas om.
- Rekommenderat: egen ABO-testcell (~600 kr/dag) för batch #3, annars svälter CBO den (7/13 i batch 1 och 6/9 i batch 2 fick <300 kr).
- Notion-upload ej gjord: Notion-MCP:n är inte auktoriserad i sessionen.

Launch ej loggad ännu – kör `/logga axelbaltet <antal>` när teamet launchat.

---

## Feedbackloop 2026-08-05 (/cs nr 2, enligt ANALYSMETOD.md) — utfall på batch #1 och #2

Livstidsdata, hela kampanjen sorterad på spend. Break-even 326 kr.

**Bedömbara (≥300 kr spend OCH ≥3 köp) — rangordnade på vinstbidrag:**

| Annons | Spend | Andel spend | Köp | CPA | ROAS | Vinstbidrag | Andel vinst |
|---|---|---|---|---|---|---|---|
| Axelbälte_PD_1_H1 | 8 084 kr | 32 % | 34 | 238 kr | 2,44 | **+3 000 kr** | 54 % |
| Axelbälte_SO_1_H2 | 10 289 kr | 41 % | 37 | 278 kr | 2,09 | +1 773 kr | 32 % |
| Axelbälte_SO_2_1 | 2 245 kr | 9 % | 11 | 204 kr | 2,81 | +1 341 kr | 24 % |
| Trimmerbelt_SO_2_4 | 2 210 kr | 9 % | 5 | 442 kr | 1,15 | −580 kr | −10 % |

Netto bedömbara: **+5 534 kr** på 91 % av spenden.

**För tidigt (ingen dom):** SO_6_1 (570 kr/1 köp) · SF_1_H1 (482 kr/1 köp) ·
SO_1_H1 (313 kr/0 köp) · PD_4_1 (287 kr/0 köp) · PD_2_2 (119 kr/2 köp) ·
SP_5_1, PD_1_H3, SO_7_1, PD_1_H2, PD_6_1, SO_1_H3, SO_2_2, PD_5_1, SF_1_H2,
SF_1_H3, SF_2_1, PD_2_1, SO_2_3 (alla < 300 kr eller < 3 köp).

**Datakvalitet:** `omni_purchase_values` var 100× för lågt på 4 rader
(SO_2_4, SO_6_1, SF_1_H1, PD_2_2) — intäkt räknad som `spend × ROAS` för dessa.
CPA-fältet stämde mot `spend / köp` på samtliga rader.

### Hypotesavstämning

| Annons | Hypotes | Höll den? |
|---|---|---|
| PD_1_H1 (smärt-fråga, 40s) | Smärt-hook fångar problem aware | ✅ **Ja, starkare än trott.** Störst vinstbidrag i kampanjen. Min förra dom ("för dyr, över target") var fel — den byggde på target-CPA i stället för break-even. |
| SO_1_H2 (säsong+offer, 25s) | Offer-close + kort video konverterar | ⚠️ Delvis. Lönsam livstid (+1 773 kr) men CPA har passerat break-even i senaste 7-dagarsfönstret (230 → 328 kr). Rotation, inte kill. |
| SO_2_1 (statisk rabatt) | Rabatt som hook bär en statisk | ✅ Ja — och den är mest vinsteffektiv per krona (597 kr/1 000 kr). Trend förbättras (336 → 155 kr CPA). |
| SO_2_4 (samma statisk, 4:5) | Lägre CPM → lägre CPA | ❌ **Falsifierad.** Lägst CPM i kontot (94 kr) men CVR 1,41 % mot vinnarens 2,94 %. Orsaken hittad i visuell granskning: produkten beskuren, kroken bortklippt, platt gradient. |
| SO_6_1 (säsongsurgency) | Tidsfönster slår lager-scarcity | ⚠️ **Ingen dom möjlig** — 1 köp. Pausningen står (570 kr spend, CPA över break-even) men vinkeln är varken bevisad eller falsifierad. Rättat i dna.md. |

### Variabeltabell (vinstbidrag grupperat)

| Variabelvärde | Annonser | Spend | Vinstbidrag | Vinst/1 000 kr |
|---|---|---|---|---|
| Vinkel: problem/lösning (smärta) | 1 | 8 084 kr | +3 000 kr | 371 kr |
| Vinkel: bekvämlighet/säsong | 1 | 10 289 kr | +1 773 kr | 172 kr |
| Vinkel: pris/deal | 2 | 4 455 kr | +761 kr | 171 kr |
| Format: video (voiceover+broll) | 2 | 18 373 kr | +4 773 kr | 260 kr |
| Format: statisk offer-grafik | 2 | 4 455 kr | +761 kr | 171 kr |
| Visuell stil: hel produkt + fotobakgrund | 1 | 2 245 kr | +1 341 kr | **597 kr** |
| Visuell stil: beskuren produkt + gradient | 1 | 2 210 kr | −580 kr | −262 kr |
| Offer i creativen: pris/rabatt syns | 2 | 4 455 kr | +761 kr | 171 kr |
| Offer i creativen: ingen offer | 2 | 18 373 kr | +4 773 kr | 260 kr |

### Mönster

1. **BEVISAD** (2 annonser, 11 + 5 köp) — *Inom statics avgör den visuella
   utförandet, inte budskapet.* Identisk copy/vinkel/erbjudande gav +1 341 kr
   respektive −580 kr. Skillnad: hel vs beskuren produkt, foto- vs gradientbakgrund.
   → **Briefinstruktion:** varje statisk visar hela produkten inkl. höftplatta och
   metallkrok, ≥50 % av ytan, fotografisk trädgårdsbakgrund. Inskrivet som
   "PROVEN LAYOUT" i batch #4:s README.
2. **BEVISAD** (2 annonser, 37 + 34 köp) — *Video bär volymen, statics bär
   effektiviteten.* Video = 73 % av spend och 86 % av vinsten; statics = högsta
   vinst per krona men bara 9 % av spenden.
   → **Briefinstruktion:** fortsätt bygga video för skala, men ge statics en egen
   budgetcell så effektiviteten får verka.
3. **HYPOTES** (1 annons per värde) — *Smärtvinkel slår säsongsvinkel på vinst per
   krona* (371 mot 172 kr), trots att säsongsvideon håller kvar tittarna bättre
   (hold 13,5 % mot 11,7 %). Hold förutsäger alltså inte vinst.
   → **Briefinstruktion:** batch #4 lägger tre av fyra videor på smärtvinkeln.
4. **HYPOTES** — *Längd är otestat.* "Kort slår lång" var byggt på retention i ett
   veckofönster; livstidsvinsten säger tvärtom. → batch #4 `PD_1_3_H1` isolerar det.

## Batch #4 – 2026-08-05 – 7 briefer (kvot 7)

Copy skriven av sonnet-subagent (modellpolicy). Alla priser 599/678/79 kr.

| Annons | Typ | Hypotes | Isolerad variabel | Variabeltaggar |
|---|---|---|---|---|
| Trimmerbelt_PD_1_1_H4 | Video 40s | Ny hook roterar vinstledaren innan fatigue | Endast hook | smärta · påstående(tid) · video · demo · ingen offer · röst utan ansikte |
| Trimmerbelt_PD_1_1_H5 | Video 40s | Andra hooken — rotationsbänk | Endast hook | smärta · påstående(avbrutet jobb) · video · demo · ingen offer · röst utan ansikte |
| Trimmerbelt_PD_1_2_H1 | Video 40s | Vinstledaren + pris-endcard (ingen video har idag offer) | Endast close | smärta · fråga · video · demo · **pris syns** · röst utan ansikte |
| Trimmerbelt_PD_1_3_H1 | Video 25s | Rent längdtest på vinstledaren | Endast längd | smärta · fråga · video 25s · demo · pris syns · röst utan ansikte |
| Trimmerbelt_PD_2_4 | Statisk | Smärtvinkeln i det vinnande statiska formatet (aldrig korsat) | Vinkel i bevisat format | smärta · fråga · statisk · inget proof · ingen offer · hel produkt+foto |
| Trimmerbelt_SO_2_6 | Statisk | Kronor-anchor 678→599 slår procent; retirerar det falska 20 %-claimet | Offer-framing | pris/deal · siffra · statisk · inget proof · pris syns · hel produkt+foto |
| Trimmerbelt_PD_7_1 | Statisk | Kompatibilitets-invändningen konverterar klickare som bouncar | Ny vinkel | invändning · fråga · statisk · demo(krok) · ingen offer · hel produkt+foto |

Backlog-item **kompatibilitets-creative** `[använd i batch #4]`.

**Notion:** 7 items skapade i databasen "Trimmer belt creative hub"
(collection 2f1270ab-908c-820a-9a08-07b73d53710b), alla Status `Draft`,
Typ `Video - Pending Approval`, hela briefen inklistrad i itemet.
Drive-mapp för batchen: https://drive.google.com/drive/folders/1nj5crmX0cPglQFO20C2RbHglJUXRGbbF
(skapad, ej fylld — brieferna ligger i Notion och som zip i chatten).

## Åtgärder och öppna punkter 2026-08-05 (uppdaterad)

- ✅ SO_6_1 pausad — kill-regeln uppfylld (570 kr spend, CPA över break-even 326).
  Men **ingen kreativ slutsats** om säsongsvinkeln (1 köp).
- ⚠️ **SF_1_H1: 482 kr, 1 köp, CPA 482 kr.** Över break-even men **under
  500-kronorströskeln** i kill-regeln → pausas inte nu. Bevaka i nästa /checkin.
- ⚠️ **KRITISKT (ägarbeslut):** live-vinnaren SO ad 2 variant 1 har
  "FÅ 20 % RABATT IDAG" inbränt — falskt sedan prishöjningen. Ersätts av
  batch #3:s `SO_2_5` eller batch #4:s `SO_2_6`. Prioritera produktion.
- ⚠️ Creatives 2178753102691194 och 1324700059732480 har fel pris inbränt —
  får INTE launchas.
- ⚠️ **Target-CPA 185 kr är räknad på det gamla priset 509 kr.** Break-even 326 kr
  likaså. Båda behöver räknas om på 599 kr — **ägarbeslut**.
- ⚠️ **Batch #3 är felviktad** mot SO-rotation (3 videor) trots att PD är
  vinstledaren. Kör batch #4 först om produktionskapaciteten är begränsad.
- Rekommenderat: egen ABO-testcell (~600 kr/dag) — CBO har svält nya tester tre
  batcher i rad.

---

## Feedbackloop 2026-08-06 (/cs nr 3, enligt ANALYSMETOD.md)

Hela kampanjen hämtad sorterad på spend. Budget verifierad: 2 000 kr/dag (oförändrad).
Break-even 326 kr. Kampanjtotal livstid: **26 913 kr spend · 91+ köp**.

**Datakvalitet:** `omni_purchase_values` fortsatt 100× för lågt på samma 4 rader
(SO_2_4, SO_6_1, SF_1_H1, PD_2_2) — intäkt räknad som `amount_spent × purchase_roas`.
CPA-fältet stämde mot `spend / köp` på samtliga rader. SO_2_6:s rad kontrollräknad
och ren (61,33 × 13,85 = 849,7 ≈ 849,71).

**Bedömbara (≥300 kr spend OCH ≥3 köp) — rangordnade på vinstbidrag:**

| Annons | Spend | Andel spend | Köp | CPA | Vinstbidrag | Andel vinst | Vinst/1 000 kr |
|---|---|---|---|---|---|---|---|
| Axelbälte_PD_1_H1 | 8 774 kr | 36 % | 39 | 225 kr | **+3 940 kr** | **65 %** | 449 kr |
| Axelbälte_SO_1_H2 | 10 892 kr | 45 % | 38 | 287 kr | +1 496 kr | 25 % | 137 kr |
| Axelbälte_SO_2_1 | 2 365 kr | 10 % | 11 | 215 kr | +1 221 kr | 20 % | 516 kr |
| Trimmerbelt_SO_2_4 (pausad) | 2 210 kr | 9 % | 5 | 442 kr | −580 kr | −10 % | −262 kr |

Netto bedömbara: **+6 077 kr** (upp från +5 534 kr vid /cs nr 2).

**Marginalutveckling sedan /cs nr 2 — det viktigaste fyndet denna körning:**

| Annons | Δ spend | Δ köp | **Marginal-CPA** | Tolkning |
|---|---|---|---|---|
| PD_1_H1 | +690 kr | +5 | **138 kr** | Accelererar — långt under target 185, ska skalas |
| SO_1_H2 | +603 kr | +1 | **602 kr** | Avtar — nästan 2× break-even på marginalen |
| SO_2_1 | +120 kr | 0 | – | För lite ny spend för dom |

Livstids-CPA döljer detta: SO_1_H2 ser fortfarande lönsam ut livstid (+1 496 kr)
men **varje ny krona i den förlorar pengar**. PD_1_H1 gör tvärtom.
→ Slutsats: flytta budget från SO ad 1 till PD ad 1 och dess iterationer.

**För tidigt (ingen dom):** de 6 annonser som launchades 2026-08-05 20:49–20:53
(Trimmerbelt_SO_2_6, SO_4_H1, SO_3_H2, PD_3_H1, PD_2_4, SP_4_H1) ligger samtliga
under signifikansgrinden. Loggade i kvoten (−7 → **−1**).

### Hypotesavstämning – batch #4

| Annons | Hypotes | Utfall |
|---|---|---|
| PD_2_4 (smärta i vinnande statiskt format) | Vinkel × format-korsning lönsam | ⏳ För tidigt. Visuellt granskad: **följer briefen** (smärtrubrik, hel produkt, fotobakgrund, vit CTA-pill). |
| SO_2_6 (kronor-anchor, ersätter 20 %-claimet) | Kronor slår procent | ⏳ För tidigt. Visuellt granskad: rätt pris (678→599 / "Spara 79 kr – fri frakt idag"), hel produkt, fotobakgrund — **men prisblocket överlappar selens remmar**. Rättas av `SO_2_7`. |
| PD_1_1_H4 / H5 / PD_1_2_H1 / PD_1_3_H1 | Hook-, offer- och längdtester på vinstledaren | ❌ **Ej launchade.** Teamet launchade i stället SO_4_H1, SO_3_H2, PD_3_H1, SP_4_H1 från batch #3. De fyra rena PD-testerna står kvar. |

### KRITISKT FYND – copyn matchar inte briefen

Creatives på de 6 nya annonserna kontrollerade mot brieferna: **primärtexten är
återanvänd batch-#1-copy, inte den briefade copyn.** Konsekvens: copytesterna
(pris-framing, smärtvinkel i text, kompatibilitets-invändning) **kör inte** — vi
betalar för trafiken men mäter ingenting. Kreativen är rätt, texten är fel.
→ Åtgärd: regel 6 i batch #5:s globala regler, versalt i varje brief:
*"Use the primary text and headline exactly as written in this brief."*
→ Åtgärd till teamet: uppdatera primärtexten på de 6 live-annonserna nu.

### Mönster (denna körning)

1. **BEVISAD** — *Livstids-CPA döljer fatigue; marginal-CPA visar den.* PD 138 kr
   vs SO 602 kr på senaste ~600 kr styck. → **Briefinstruktion:** batch #5 bygger
   på PD-spåret, inte SO-spåret; SO får bara en creative (`SO_2_7`, en ren fix).
2. **BEVISAD** — *Vinstmotorn är ETT enda asset.* PD_1_H1 = 65 % av nettovinsten
   och den enda annonsen med sjunkande marginal-CPA. Det är en
   koncentrationsrisk. → **Briefinstruktion:** batch #5 öppnar `PD_8` — samma
   vinkel, helt annat utförande (UGC första person i stället för voiceover+b-roll),
   med hook-bänk H1/H2. Håller vinkeln, byter exekvering.
3. **BEVISAD** — *Briefad copy når inte kontot.* Se ovan. → **Briefinstruktion:**
   copy-låsningsregeln i varje brief.
4. **HYPOTES** — *Text ovanpå produkten sänker läsbarheten.* SO_2_6:s prisblock
   ligger över remmarna; vinnaren SO_2_1 har text i fri yta. → `SO_2_7` isolerar
   enbart textplacering.

## Batch #5 – 2026-08-06 – 7 briefer (kvot 7)

Copy skriven av sonnet-subagent (modellpolicy). Alla priser 599/678/79 kr,
maskinkontrollerade mot förbjudna siffror (509/636/"20 %") — 0 träffar.
2 video + 5 bild (varav 1 karusell).

| Annons | Typ | Hypotes | Isolerad variabel | Variabeltaggar |
|---|---|---|---|---|
| Trimmerbelt_PD_8_1_H1 | UGC-video | Smärtvinkeln bär i ett helt annat utförande → vinkeln är drivaren, inte PD_1:s footage | Exekvering (vinkel konstant) | smärta · fråga · UGC-tal · demo · pris syns · creator man 45–65 |
| Trimmerbelt_PD_8_1_H2 | UGC-video | "Dagen efter"-hook når samma publik bredare | Endast hook (sek 3–30 identiska) | smärta · påstående (dagen efter) · UGC-tal · demo · pris syns · creator man 45–65 |
| Trimmerbelt_PD_2_5 | Statisk | Smärthook som kvalificerar + pris som closar slår varje halva för sig | Pris tillagt på smärtstatiskan | smärta · fråga · statisk · inget proof · pris syns · hel produkt+foto |
| Trimmerbelt_SO_2_7 | Statisk | Pristext i fri yta höjer läsbarheten → CVR mot vinnarens 2,94 % | Endast textplacering | pris/deal · siffra · statisk · inget proof · pris syns · hel produkt+foto |
| Trimmerbelt_PD_9_1 | Statisk | Kostnaden formulerad som kvällen efter når köpare som inte upplever själva jobbet som smärtsamt | Tidsram för smärtan | konsekvens · fråga · statisk · inget proof · ingen offer · hel produkt+foto |
| Trimmerbelt_PD_10_1 | Statisk | Mekanismen visad som diagram closar den som måste förstå *varför* | Mekanism visad vs uttalad | mekanism/utbildning · påstående · statisk+pilar · demo (diagram) · ingen offer · hel produkt+foto |
| Trimmerbelt_PD_11_1 | Karusell | Beprövad copystruktur i tre kort slår samma struktur pressad i en bild | Format (nytt i kontot) | smärta · fråga · **karusell** · demo · pris syns (kort 3) · hel produkt+foto |

Backlog: inga väntande items togs in — de tre kvarvarande är blockerade
(Judge.me-texter, bundle-pris = ägarbeslut, kvinnlig creator väntar på SP_4-utfall).

**Notion:** 7 items skapade i "Trimmer belt creative hub"
(data source 2f1270ab-908c-820a-9a08-07b73d53710b), Status `Draft`,
Typ `Video - Pending Approval`, hela briefen inklistrad.

## Åtgärder och öppna punkter 2026-08-06

- 🔴 **Copyn på de 6 live-annonserna matchar inte brieferna** — copytesterna kör
  inte. Uppdatera primärtext + rubrik enligt respektive brief. Högsta prioritet.
- 🔴 **Flytta budget från SO ad 1 till PD ad 1.** Marginal-CPA 602 vs 138 kr.
- 🟡 **SO_2_6:s prisblock överlappar remmarna** — `SO_2_7` är fixen.
- 🟡 **De fyra PD_1-testerna från batch #4 är fortfarande inte launchade** —
  det var de enda rena variabeltesterna på vinstledaren.
- ✅ SO_2_1:s falska "20 %"-claim: `SO_2_6` är nu live med korrekt pris, så
  SO_2_1 kan pausas utan att lämna offer-spåret tomt. **Ägarbeslut.**
- ⚠️ **Target-CPA 185 kr och break-even 326 kr är båda räknade på gamla priset
  509 kr.** Vid 599 kr är båda för lågt satta — hela vinstbidragstabellen är
  alltså konservativ. **Ägaren räknar om.**
- Rekommenderat (fjärde gången): egen ABO-testcell ~600 kr/dag.

---

## Feedbackloop 2026-08-09 (/cs nr 4, enligt ANALYSMETOD.md)

Hela kampanjen hämtad sorterad på spend. Budget verifierad: **2 000 kr/dag (oförändrad, CBO)**.
Break-even 326 kr. Kampanjtotal livstid: **33 334 kr spend · 115 köp · CPA 290 kr · ROAS 2,00 · frekvens 3,00**.
Pris omverifierat i Shopify samma dag: 599 kr / jämförpris 678 kr → spara 79 kr (11,65 %). Oförändrat.

**Datakvalitet:** `omni_purchase_values` fortsatt trasigt på samma rader (SO_2_4, SO_6_1, SF_1_H1,
PD_2_2) — intäkt räknad som `amount_spent × purchase_roas`. CPA stämde mot `spend / köp` på alla rader.

**6 nya annonser launchade 2026-08-09 07:26** i en ny adset `Axelbälte PD Batch 4` — de fyra
PD_1-tester som saknades från batch #4 (`PD_1_1_H4`, `PD_1_1_H5`, `PD_1_2_H1`, `PD_1_3_H1`),
plus `PD_7_1` och `PD_8_1_H2` (den första från batch #5). Loggade: kvot −8 → **−2**.

### Vinstbidrag (bedömbara: ≥300 kr spend OCH ≥3 köp)

| Annons | Spend | Andel spend | Köp | CPA | Vinstbidrag | Andel vinst | Vinst/1 000 kr |
|---|---|---|---|---|---|---|---|
| Axelbälte_PD_1_H1 | 11 748 kr | 40 % | 46 | 255 kr | **+3 249 kr** | **57 %** | 277 kr |
| Axelbälte_SO_1_H2 | 11 944 kr | 41 % | 41 | 291 kr | +1 421 kr | 25 % | 119 kr |
| Axelbälte_SO_2_1 | 2 504 kr | 9 % | 12 | 209 kr | +1 408 kr | 25 % | **562 kr** |
| Trimmerbelt_PD_3_H1 (NY) | 827 kr | 3 % | 3 | 276 kr | +151 kr | 3 % | 183 kr |
| Trimmerbelt_SO_2_4 (pausad) | 2 210 kr | 8 % | 5 | 442 kr | −580 kr | −10 % | −262 kr |

Netto bedömbara: **+5 649 kr**.

### KORRIGERING av /cs nr 3

/cs nr 3 rapporterade PD_1_H1 marginal-CPA **138 kr** ("accelererar") och SO_1_H2 **602 kr**
("avtar"), och rekommenderade att flytta budget SO → PD. **Med tre dygn mer data vänder bilden:**

| Annons | Δ spend sedan /cs nr 3 | Δ köp | Marginal-CPA |
|---|---|---|---|
| PD_1_H1 | +2 974 kr | +7 | **425 kr** (över break-even) |
| SO_1_H2 | +1 052 kr | +3 | **351 kr** (över break-even) |
| SO_2_1 | +139 kr | +1 | 139 kr — under grinden, ingen dom |

**Varför förra mätningen blev fel:** de två snapshotsen låg mindre än ett dygn isär, och köp
attribueras bakåt i tiden efter att ett snapshot tagits. Sena köp från den äldre perioden
hamnar då i det nya fönstret och gör det senaste dygnet konstlat billigt.
**Metodregel härefter: marginal-CPA räknas bara mellan snapshots med ≥3 dygns mellanrum och
≥5 inkrementella köp.** Signifikansgrinden gäller deltat, inte bara livstiden.

**Vad som faktiskt gäller:** båda videovinnarna ligger nu **över break-even på marginalen**
och kampanjfrekvensen har gått 2,72 → **3,00**. Kampanjen fatigar. Rotation är inte längre en
förbättring utan ett krav.

### Creative-teardown (visuell granskning i Ads Manager 2026-08-09)

**Det största fyndet i hela loggen: vinnaren är äkta UGC, inte en producerad video.**
Granskning av `PD_1_H1` visar rå mobilfilm — en verklig man i ett verkligt garage med verktyg
och en cykel i bakgrunden, inbränd svensk undertext i vit rundad ruta ("Det här bältet").
Ingen studio, ingen färgläggning. Tidigare loggar beskrev den som "40 s video med voiceover
och b-roll" — det var fel, och det är därför ingen brief hittills har bett om äkta UGC.

**Samtliga videor producerade efter den är AI-genererade.** Och där finns nu data på båda sidor:

| Visuell stil | Annons | Utfall |
|---|---|---|
| Äkta människa, mobilfilmat | PD_1_H1 | **+3 249 kr = 57 % av all vinst**, 277 kr/1 000 kr |
| AI **utan ansikte** (händer, produkt, trädgård) | PD_3_H1 | CPA 276 kr, **lönsam**, CVR 3,23 % (näst högst i kontot), p100 7,3 % |
| AI **med ansikte** | PD_2_1, SF_2_1 | Båda dödade (artefakter, fabricerat citat) |
| AI med ansikte (nya) | PD_1_2_H1, PD_8_1_H2 | För tidigt — men bryter mot mönstret ovan |

`PD_8_1_H2` briefades i batch #5 som **äkta kvinnlig/manlig creator, mobilfilmat**. Det som
producerades är en AI-genererad man som sitter på en säng. Briefen följdes inte på den punkt
som betyder mest.

### Variabelgruppering (vinstbidrag per variabelvärde)

| Variabel | Värde | Spend | Vinst | Vinst/1 000 kr |
|---|---|---|---|---|
| Format | Video | 24 519 kr | +4 821 kr | 197 kr |
| Format | **Statisk (hel produkt + foto)** | 2 504 kr | +1 408 kr | **562 kr** |
| Format | Statisk (beskuren + gradient) | 2 210 kr | −580 kr | −262 kr |
| Vinkel | **Smärta/problem** | 12 574 kr | +3 400 kr | **270 kr** |
| Vinkel | Säsong/offer | 16 658 kr | +2 249 kr | 135 kr |
| Visuell stil | Äkta UGC | 11 748 kr | +3 249 kr | 277 kr |
| Visuell stil | AI utan ansikte | 827 kr | +151 kr | 183 kr |
| Visuell stil | Studio/produktvideo | 11 944 kr | +1 421 kr | 119 kr |

Smärta ger **dubbla** vinsten per krona mot säsong/offer. Statics i rätt layout ger **tre gånger**
video — och får 14 % av spenden.

### Metrik-diagnos (var i kedjan varje bedömbar annons tappar)

| Annons | CTR | Hook rate | Hold (thruplay) | p100 | CVR (köp/klick) | CPM |
|---|---|---|---|---|---|---|
| PD_1_H1 | 2,46 % | 95,6 % | 16,0 % | 2,2 % | 2,76 % | 129 kr |
| SO_1_H2 | 2,04 % | 95,1 % | 11,4 % | 5,4 % | 2,79 % | 126 kr |
| SO_2_1 | 2,07 % | – | – | – | **3,85 %** | 127 kr |
| PD_3_H1 | 2,31 % | 95,8 % | 10,0 % | **7,3 %** | 3,23 % | 127 kr |
| SO_2_4 | 1,52 % | – | – | – | 1,85 % | 94 kr |

PD_1_H1 och SO_1_H2 har **identisk CVR** — skillnaden mellan dem sitter helt i övre tratten
(CTR 2,46 vs 2,04 %). SO_2_4 tappar i båda ändar trots kontots lägsta CPM.

### Copyfyndet, preciserat

Alla 12 annonser från 2026-08-05 och 2026-08-09 kontrollerade mot brieferna. Kontot kör exakt
**två primärtexter**, tilldelade efter koncept: block A (alla PD-annonser) och block B (alla
SO-statics). Ingen briefad copyvariant har någonsin nått kontot.

Det har en nyttig sidoeffekt: video-interna variabler (hook, längd, offer i filmen) har testats
mot en perfekt kontrollerad copykonstant. Och en dyr: **efter 33 334 kr spend och 115 köp har
kontot aldrig kört ett enda copytest.** Batch #6 kör det (`PD_1_4_H1`, oförändrad vinnarvideo).

### Hypotesavstämning – batch #4 och #5

| Annons | Hypotes | Utfall |
|---|---|---|
| PD_3_H1 | Mekanismvideo bär | ✅ **Håller.** 827 kr, 3 köp, CPA 276, +151 kr. Näst högst CVR, högst p100. Skalas i batch #6 (`PD_3_2_H1`). |
| PD_1_1_H4 / H5 / PD_1_2_H1 / PD_1_3_H1 | Hook-, offer- och längdtest på vinstledaren | ⏳ Launchade 2026-08-09, alla < 80 kr. För tidigt. Men samtliga är **AI-producerade** — hook- och längdtesterna körs, medan "äkta UGC"-egenskapen som vann tappats bort. |
| PD_7_1 | Kompatibilitets-invändningen | ⏳ 101 kr. För tidigt. Copyn i kontot är block A, inte den briefade kompatibilitetscopyn → **invändningen testas inte i text**. |
| PD_2_4 | Smärta i vinnande statiskt format | ⏳ 199 kr, 0 köp. För tidigt. |
| SO_2_6 | Kronor slår procent | ⏳ 585 kr, 2 köp. Under grinden. Prisblocket överlappar fortfarande remmarna. |
| PD_8_1_H2 (batch #5) | Smärtvinkeln bär i äkta UGC-utförande | ❌ **Testas inte.** Producerad som AI-man på en säng, inte som äkta creator. Hypotesen står kvar obesvarad → byggs om i batch #6 (`PD_12_1_H1/H2`). |
| PD_8_1_H1, PD_2_5, SO_2_7, PD_9_1, PD_10_1, PD_11_1 | (batch #5) | ⏳ Briefade, ej launchade. |

## Batch #6 – 2026-08-09 – 7 briefer (kvot 7)

Copy skriven av sonnet-subagent (modellpolicy). Priser maskinkontrollerade: 0 felaktiga claims.
4 video + 3 bild.

| Annons | Typ | Hypotes | Isolerad variabel | Variabeltaggar |
|---|---|---|---|---|
| Trimmerbelt_PD_12_1_H1 | Äkta UGC-video | Drivaren i PD_1_H1 är äktheten i utförandet, inte den specifika filmen | Talang (ny person, nytt kön) | smärta · påstående · äkta UGC · demo · ingen offer · rått telefonfilmat · **kvinnlig creator 45–65** |
| Trimmerbelt_PD_12_1_H2 | Äkta UGC-video | "Dagen efter" når samma köpare genom en annan dörr | Endast hook | smärta · påstående (dagen efter) · äkta UGC · demo · ingen offer · kvinnlig creator |
| Trimmerbelt_PD_3_2_H1 | AI-video utan ansikte | Den ansiktslösa mekanismnärbilden är en repeterbar produktionsbana | Hook + mekanismbetoning | mekanism · påstående · voiceover+närbild · demo · ingen offer · **AI utan ansikte** |
| Trimmerbelt_PD_1_4_H1 | Copytest | Primärtext är en materiell CVR-spak | **Endast primärtext** (filmen oförändrad) | smärta · fråga · video (oförändrad) · betyg · ingen offer · äkta UGC |
| Trimmerbelt_SO_2_8 | Statisk | Effektiviteten i SO_2_1 sitter i layouten och offerns placering, inte i rabattens storlek | Claimet (falska 20 % → sanna 79 kr) | pris/deal · siffra · statisk · inget proof · pris syns · hel produkt+foto |
| Trimmerbelt_PD_13_1 | Statisk | Smärtvinkeln i den vinnande layouten slår offer-vinkeln i samma layout | Vinkel på den effektivaste ytan | smärta · fråga · statisk · betyg i copy · ingen offer · hel produkt+foto |
| Trimmerbelt_PD_14_1 | Statisk | Produkt buren besvarar passforms-invändningen och lyfter CVR över produkt-ensam | Produkt ensam → produkt buren | invändning/passform · påstående · statisk · demo · ingen offer · **AI utan ansikte** |

Backlog: **kvinnlig creator-UGC** togs in `[använd i batch #6]` i `PD_12_1_H1/H2`. Övriga två
items är fortsatt blockerade (Judge.me-texter, bundle-pris = ägarbeslut).

**Notion:** 7 items i "Trimmer belt creative hub", Status `Draft`, Typ `Video - Pending Approval`,
hela briefen inklistrad.

## Åtgärder och öppna punkter 2026-08-09

- 🔴 **`SO_2_1` kör fortfarande "FÅ 20% RABATT IDAG"** vid 599 kr (verklig rabatt 79 kr = 11,65 %).
  Flaggat i tre /cs-körningar i rad, fortfarande live och fortfarande kontots effektivaste
  annons. `SO_2_8` är den ärliga ersättaren — pausa `SO_2_1` när den är live. **Ägarbeslut.**
- 🔴 **Äkta UGC måste tillbaka i produktionen.** 57 % av vinsten kommer från en enda rå mobilfilm;
  allt som producerats sedan dess är AI. `PD_12_1` är den bygget.
- 🔴 **Regel till teamet: AI-genererade ansikten är förbjudna.** AI utan ansikte fungerar
  (`PD_3_H1`); AI med ansikte har dött två gånger och två nya är just launchade.
- 🟡 **Copyn i kontot måste matcha briefen.** Aldrig ett copytest på 33 334 kr spend.
- 🟡 **Statics är underfinansierade** — 562 kr vinst per 1 000 kr, 14 % av spenden. Egen ABO-cell
  ~600 kr/dag (rekommenderat fjärde gången).
- ⚠️ **Target-CPA 185 och break-even 326 är fortfarande räknade på gamla priset 509 kr.**
  Vid 599 kr är båda för lågt satta → alla vinstsiffror ovan är konservativa. **Ägaren räknar om.**

---

## Feedbackloop 2026-08-12 (/cs nr 5, enligt ANALYSMETOD.md)

Hela kampanjen sorterad på spend. Budget verifierad: **2 000 kr/dag (oförändrad, CBO)**.
Kampanjtotal livstid: **37 459 kr spend · 127 köp · CPA 295 kr · ROAS 1,98 · frekvens 3,09**.

**Datakvalitet:** `omni_purchase_values` fortsatt trasigt på SO_2_4, SO_6_1, SF_1_H1, PD_2_2 —
intäkt räknad som `amount_spent × purchase_roas`. CPA stämde mot `spend / köp` på alla rader.

**4 nya annonser launchade 2026-08-09 19:46** (batch #5:s statics: `PD_2_5`, `SO_2_7`, `PD_9_1`,
`PD_10_1`) i två nya adsets. Loggade: kvot −9 → **−5**.

### Vinstbidrag (bedömbara: ≥300 kr spend OCH ≥3 köp)

| Annons | Spend | Andel spend | Köp | CPA | Vinstbidrag | Andel vinst | Vinst/1 000 kr |
|---|---|---|---|---|---|---|---|
| Axelbälte_PD_1_H1 | 13 805 kr | 42 % | 53 | 260 kr | **+3 473 kr** | **62 %** | 252 kr |
| Axelbälte_SO_1_H2 | 12 602 kr | 38 % | 43 | 293 kr | +1 416 kr | 25 % | 112 kr |
| Axelbälte_SO_2_1 | 2 706 kr | 8 % | 12 | 225 kr | +1 206 kr | 21 % | **446 kr** |
| Trimmerbelt_SO_2_6 (NY) | 831 kr | 3 % | 3 | 277 kr | +147 kr | 3 % | 177 kr |
| Trimmerbelt_PD_3_H1 | 1 004 kr | 3 % | 3 | 335 kr | **−26 kr** | −0,5 % | −26 kr |
| Trimmerbelt_SO_2_4 (pausad) | 2 210 kr | 7 % | 5 | 442 kr | −580 kr | −10 % | −262 kr |

Netto bedömbara: **+5 636 kr**.

### Marginal-CPA (första mätningen enligt den nya regeln: ≥3 dygn, ≥5 inkrementella köp)

| Annons | Δ spend | Δ köp | Marginal-CPA | Giltig? |
|---|---|---|---|---|
| PD_1_H1 | +2 057 kr | +7 | **294 kr** | ✅ passerar båda kraven |
| SO_1_H2 | +657 kr | +2 | (329 kr) | ❌ under 5 köp — ingen dom |
| SO_2_1 | +202 kr | 0 | – | ❌ under grinden |

PD_1_H1 har alltså **återhämtat sig** från marginal-CPA 425 kr till 294 kr — under break-even 326,
men bara med 32 kr marginal per order på 7 köp. Rätt beskrivning är **"pendlar runt break-even"**,
inte "accelererar" och inte "döende". Med 7 köp är osäkerheten fortfarande stor; regeln fångar
riktningen, inte precisionen.

### KORRIGERING: "AI utan ansikte fungerar" var för tidigt sagt

/cs nr 4 flyttade detta till **WINNING DNA som bevisad** på grundval av `PD_3_H1`:
827 kr, 3 köp, CPA 276 kr, +151 kr. Tre dygn senare: **1 004 kr, fortfarande 3 köp,
CPA 335 kr, −26 kr.** Noll köp på 178 kr ny spend. Vinstbidraget har gått från plus till minus.

Slutsatsen byggde på **exakt 3 köp** — signifikansgrindens absoluta minimum. En dom där är
skör, och den föll. Nedgraderad till HYPOTES i dna.md.

**Konsekvens för batch #6:** `PD_3_2_H1` och `PD_14_1` skrevs som "skala en bevisad bana".
De är fortfarande värda att köra — frågan är öppen och båda är billiga — men de **testar en
hypotes, de skalar inte ett bevis**. Formuleringen i brieferna är för stark.

**Metodregel tillagd:** en annons som precis passerat grinden (3–4 köp) får en **preliminär**
dom som ska omprövas nästa körning innan den skrivs in i WINNING/LOSING DNA. Samma försiktighet
gäller `SO_2_6` nedan.

### Creative-teardown — statiskproduktionen fungerar nu

De fyra statics som launchades 2026-08-09 laddades ner i full upplösning och granskades:

| Annons | Följer briefen? | Iakttagelse |
|---|---|---|
| `SO_2_7` | ✅ **Exakt** | 678 kr överstruket → 599 kr, "Spara 79 kr – fri frakt ingår", "Handla nu" i vit text. Hel produkt, fotografisk bokeh, **all text i fri yta** — precis den fix som briefades mot SO_2_6:s överlapp. |
| `PD_2_5` | ✅ Exakt | "Ont i axlarna igen?" + mekanismrad + 599 kr, hel produkt, fotobakgrund, text i fri yta. |
| `PD_9_1` | ✅ Exakt | "Fortfarande öm i axlarna till kvällen?" mot kvällsljus-bakgrund. Rätt tidsram, rätt layout. |
| `PD_10_1` | ✅ Exakt | Mekanismdiagram med två orange pilar, "Vikten flyttas – inte armarna". Endast hårfina pillinjer korsar produkten. |

**Detta är första gången i kontots historia att briefad creative nått kontot oförändrad.**
Alla fyra använder samma urklippta produktbild på olika bakgrunder — konsekvent och korrekt.

⚠️ **Primärtexten kunde inte läsas** för dessa fyra: creativen är av typen `SHARE` (page-post),
och `body`/`title` returneras inte av API:t för den typen. Ingen slutsats dras om copyn — den
får kontrolleras manuellt i Ads Manager.

### Metrik-diagnos

| Annons | CTR | Hook rate | Hold (thruplay) | p100 | CVR (köp/klick) | CPM | Frekvens |
|---|---|---|---|---|---|---|---|
| PD_1_H1 | 2,34 % | 95,7 % | 16,3 % | 2,3 % | 2,69 % | 124 kr | 1,63 |
| SO_1_H2 | 2,03 % | 95,0 % | 11,3 % | 5,4 % | 2,77 % | 126 kr | 2,00 |
| SO_2_1 | 2,03 % | – | – | – | 3,40 % | 125 kr | 2,16 |
| SO_2_6 | **1,30 %** | – | – | – | **4,55 %** | 116 kr | 2,60 |
| PD_3_H1 | 2,35 % | 95,2 % | 10,1 % | 7,5 % | 2,48 % | 126 kr | 1,33 |
| SO_2_4 | 1,52 % | – | – | – | 1,85 % | 94 kr | 1,81 |

**Nytt mönster:** `SO_2_6` har kontots **lägsta CTR (1,30 %)** och **högsta CVR (4,55 %)**.
Pris överst i bilden stöter bort nästan alla och konverterar nästan alla som blir kvar.
`PD_3_H1`:s CVR har samtidigt fallit 3,23 → 2,48 % — hela dess tidigare försprång var brus.

### Variabelgruppering (vinstbidrag per variabelvärde)

| Variabel | Värde | Spend | Vinst | Vinst/1 000 kr |
|---|---|---|---|---|
| Format | Statisk (hel produkt + foto) | 3 537 kr | +1 353 kr | **383 kr** |
| Format | Video | 27 411 kr | +4 863 kr | 177 kr |
| Format | Statisk (beskuren + gradient) | 2 210 kr | −580 kr | −262 kr |
| Vinkel | Smärta/problem | 14 809 kr | +3 447 kr | 233 kr |
| Vinkel | Säsong/offer | 18 349 kr | +2 189 kr | 119 kr |
| Visuell stil | Äkta UGC | 13 805 kr | +3 473 kr | 252 kr |
| Visuell stil | Studio/produktvideo | 12 602 kr | +1 416 kr | 112 kr |
| Visuell stil | AI utan ansikte | 1 004 kr | −26 kr | −26 kr |

Statics i rätt layout: **383 kr/1 000 kr mot videons 177**. Smärta slår säsong ~2:1. Båda
mönstren har nu hållit i tre körningar i rad och är de stabilaste i kontot.

### Hypotesavstämning

| Annons | Hypotes | Utfall |
|---|---|---|
| SO_2_6 | Kronor slår procent | ⚠️ **Preliminärt ja.** 831 kr, 3 köp, CPA 277, +147 kr. Men exakt 3 köp — omprövas nästa körning. Notera den extrema funnelformen (CTR 1,30 / CVR 4,55). |
| PD_3_H1 | Mekanismvideo bär | ❌ **Föll.** +151 kr → −26 kr på tre dygn, 0 nya köp på 178 kr. Se korrigeringen ovan. |
| PD_2_5, SO_2_7, PD_9_1, PD_10_1 | (batch #5-statics) | ⏳ 26–82 kr styck. För tidigt. Men **alla fyra byggda exakt enligt brief** — produktionsledet är löst. |
| PD_1_1_H4 / H5 / PD_1_2_H1 / PD_1_3_H1 | Hook-, offer- och längdtest | ⏳ 11–120 kr. För tidigt. PD_1_2_H1 har 1 köp på 103 kr — under grinden. |
| PD_7_1 | Kompatibilitets-invändningen | ⏳ 130 kr, 0 köp. Och copyn i kontot är fortfarande block A → **invändningen testas inte i text**. Byggs om som statisk i batch #7 (`PD_7_2`). |
| PD_2_4 | Smärta i vinnande statiskt format | ⏳ 321 kr, 0 köp. Passerat spendgrinden men inte köpgrinden. Bevakas. |
| PD_8_1_H2 | Smärtvinkeln i äkta UGC | ❌ Testas inte — producerad som AI. Byggs om i batch #6 (`PD_12_1`), ännu ej producerad. |
| PD_4_1 | Annoterad demo | ⏳ 557 kr, 2 köp, CPA 278. Närmast grinden av alla obedömda, och bäst CPA bland dem. Itereras i batch #7 (`PD_17_1`). |
| Batch #6 (7 briefer) | – | ⏳ Ingen launchad ännu. |

### Mönster (denna körning)

1. **BEVISAD** — *Statisk i den beprövade layouten är kontots effektivaste yta.* 383 kr/1 000 kr
   mot videons 177, tredje körningen i rad. → **Briefinstruktion:** batch #7 är 6 av 7 statics.
2. **BEVISAD** — *Statiskproduktionen är löst; videoproduktionen är det inte.* Fyra statics
   levererade exakt enligt brief; den enda briefade äkta UGC-videon producerades som AI.
   → **Briefinstruktion:** lägg volymen där utförandet är pålitligt medan videokön rensas.
3. **HYPOTES** — *Pris överst filtrerar hårt men kvalificerar.* CTR 1,30 / CVR 4,55 på SO_2_6.
   → `SO_2_9` lägger en kort smärtrad ovanför priset för att köpa klicket utan att tappa CVR.
4. **HYPOTES** — *Publiken mättas.* Frekvens 2,72 → 3,00 → 3,09, båda videovinnarna nära
   break-even på marginalen. → `PD_16_1` byter målgruppsram (röjsåg, hel arbetsdag) i stället
   för att lägga fler hooks på en mättad publik.

## Batch #7 – 2026-08-12 – 7 briefer (kvot 7)

Copy skriven av sonnet-subagent. Priser maskinkontrollerade: 0 felaktiga claims.
**6 bild + 1 video** (videon kräver noll produktion).

| Annons | Typ | Hypotes | Isolerad variabel | Variabeltaggar |
|---|---|---|---|---|
| Trimmerbelt_SP_6_1 | Statisk | Social proof fungerar som kvalificerare, inte som hook | Prooftyp (betyg vs inget) | social proof · siffra · statisk · **äkta betyg** · ingen offer · hel produkt+foto |
| Trimmerbelt_PD_15_1 | Statisk | Kontrast förmedlar mekanismen snabbare än en rubrik kan påstå den | Jämförelselayout vs enskilt objekt | smärta (jämförelse) · kontrast · jämförelsestatisk · demo · ingen offer · delad bild |
| Trimmerbelt_PD_7_2 | Statisk | Kompatibilitet är en blockerare, inte en hook — höjer CVR utan CTR | Invändningen uttalad i creativen | invändning · fråga · statisk · demo (krok) · ingen offer · hel produkt+foto |
| Trimmerbelt_PD_16_1 | Statisk | Ny målgruppsram når publik som nuvarande set inte når | Målgruppsram | uthållighet/arbetsdag · fråga · statisk · demo · ingen offer · hel produkt+foto |
| Trimmerbelt_SO_2_9 | Statisk | En smärtrad ovanför priset köper klicket utan att tappa kvalificeringen | En tillagd rad | pris+smärta · fråga→siffra · statisk · inget proof · pris syns · hel produkt+foto |
| Trimmerbelt_PD_17_1 | Statisk | Featuretydlighet konverterar den som fattat nyttan men inte kan föreställa sig föremålet | Delar utpekade vs produkt oannoterad | produkt/feature · påstående · annoterad statisk · demo · ingen offer · hel produkt+foto |
| Trimmerbelt_PD_1_5_H1 | Video (0 produktion) | Pris först i texten kvalificerar läsaren före tittandet | **Endast primärtext** | pris i text · fråga (oförändrad) · video (oförändrad) · offer först · äkta UGC |

Backlog: **Judge.me-citatstatiken delvis upplåst** — det verifierade snittbetyget (4,75/5,
8 recensioner) kräver ingen export och används i `SP_6_1` `[delvis använd i batch #7]`.
Citatstatiken med recensionstexter är fortfarande blockerad. Bundle-vinkeln fortsatt ägarbeslut.

**Notion:** 7 items i "Trimmer belt creative hub", Status `Draft`, Typ `Video - Pending Approval`.

## Åtgärder och öppna punkter 2026-08-12

- 🔴 **Produktionskön är nu flaskhalsen, inte briefandet.** Obyggt/olaunchat: batch #5:s
  `PD_8_1_H1` och `PD_11_1`, hela batch #6 (7 st), hela batch #7 (7 st) = **16 briefer i kö**.
  Prioritetsordning: (1) `PD_12_1_H1/H2` äkta creator-UGC — kontots största hål,
  (2) `PD_1_4_H1` + `PD_1_5_H1` copytesterna — fem minuters bygge var,
  (3) batch #7:s statics — produktionsledet som bevisligen fungerar.
- 🔴 **`SO_2_1` kör fortfarande "FÅ 20% RABATT IDAG"** vid 599 kr. Fjärde körningen i rad.
  `SO_2_7` är nu **live med korrekt pris i identisk layout** — ersättaren finns, så det finns
  inget kvar som talar för att låta det felaktiga claimet ligga kvar. **Ägarbeslut.**
- 🟡 **Bevaka `PD_2_4`** (321 kr, 0 köp) och **`PD_4_1`** (557 kr, 2 köp, CPA 278) — båda
  strax under grinden, PD_4_1 med den bästa CPA:n bland obedömda.
- 🟡 **Frekvens 3,09 och stigande.** `PD_16_1` är motmedlet; om det når ny publik ska vinkeln
  byggas i video också.
- ⚠️ **Target-CPA 185 och break-even 326 är fortfarande räknade på gamla priset 509 kr.**
  Alla vinstsiffror ovan är därmed konservativa. **Ägaren räknar om.**

---

## Listicle 2026-08-13 — `axelbalte-trimmer-listicle`

Byggd enligt `docs/os/LISTICLE-FRAMEWORK.md` (branch `claude/meta-creative-strategist-os-mtkaqu`)
genom att klona **Motorhölje – Lagerrensning**-sidans GemPages-export. Struktur, CSS, spacing och
sektionsordning orörda; all text och alla produktbilder bytta 1:1. Copy skriven av sonnet-subagent.

**Vinkelval:** H1 leder med **problemet**, inte med ett erbjudande. Motorhöljets H1 bar en
lagerrensning; för axelbältet finns ingen verifierad lagerorsak, och smärtvinkeln ger dessutom
~2× vinst per krona mot säsong/offer i annonsdatan. Priset ligger i stället i dek, sammanfattning,
knappar och ärlighetssektionen.

**De fem punkterna (rollordningen från frameworket, oförändrad):**

| # | Roll | Axelbältets version |
|---|---|---|
| 1 | Förnekelse | Det gör inte ont medan du trimmar |
| 2 | Falsk lösning A | Du har redan egna knep, och de hjälper nästan |
| 3 | Oåterkallelighet | Sista biten blir aldrig klar den här helgen |
| 4 | Ackumulerad kostnad | Det kostar dig inte en eftermiddag, det kostar dig hela säsongen (det här missar nästan alla) |
| 5 | Falsk lösning B | Den billiga remmen du redan provat |

Punkt 3 är omtolkad medvetet: motorhöljets oåterkallelighet var fysisk (blekt gelcoat går inte att
polera tillbaka). För en kropp vore motsvarande ett **medicinskt claim**, vilket är förbjudet.
Det oåterkalleliga är i stället **arbetet du inte hann göra** — gräset hinner växa igen.

**Ärlighetssektionen: ingen påhittad orsak.** Motorhöljet hade ett äkta överlager. Det har vi inte
verifierat här, så sidan påstår ingen lagerrensning, ingen utförsäljning och inget parti som tar
slut. Den säger i stället rakt ut att det inte finns någon nedräkningsklocka och ingen påhittad
rabattprocent, att 678 kr är ordinarie pris och 599 kr är priset nu. Den enda brådskan är
kalenderfaktumet att trimningssäsongen har några veckor kvar.

**Bilder:** Anders profilbild och Bäverbutikens logotyp behållna. Sju bilder bytta: fyra
Shopify-produktfoton plus tre av batch #5:s statics (kvällsbilden, mekanismdiagrammet och
prisbilden 678→599), uppladdade till Shopify-CDN så sidan får permanenta URL:er.

**Verifieringsgrindar (alla gröna):** 27/27 textnycklar träffade · 0 tankstreck i löptext ·
0 kvarlevor av källproduktens ord (motorhölje, kåpa, utombordare, båtägare, Oxford, brygga,
299/367 kr) · 0 förbjudna priser (509/636/"20 %") · produktlänken bytt på 8 ställen ·
alla 7 nya bilder använda.

**Kvar att göra (ägare/manager):**
- Polish-passet i GemPages efter import (frameworkets Del 4): typsnitt Anton/Inter, bild under
  rubrik och CTA efter text i varje punkt, egen bild i ärlighetssektionen, vit footer.
- Peka annonser hit. Enligt frameworket: *annonsens löfte = sidans första mening.* Sidans första
  mening är smärtvinkeln, alltså är det **PD-blocket** som ska peka hit, inte SO-blocket.
- Mätning: klick→köp för de annonser som pekar hit, mot samma annonser mot produktsidan.
  Samma grind som annonser: 300 kr spend och 3 köp innan dom.
- **Om det finns en äkta orsak till priset** (överlager, säsongsavslut, leverantörsparti) räcker
  det med en mening från ägaren, så byts ärlighetssektionen ut. Den hittas aldrig på av Claude.

---

## Swipe 2026-08-13 — `Trimmerbelt_SO_8_1` (Bryn grillkorg)

Ägaren skickade in ett vinnande svenskt manus från en annan kategori (grillkorg) för swipe.
Strukturen bruten ner i **12 beats** och applicerad rakt av på axelbältet. Copy av sonnet-subagent.

**Modellens spine:** ett erbjudande legitimerat av ett skäl. Överlager → 40 % rabatt →
livstidsgaranti → så länge lagret räcker. Allt annat i annonsen hänger på den öppningen.

**Fyra av modellens bärande claim kunde inte användas:**

| Modellen | Vi | Varför utbytt |
|---|---|---|
| "Vi råkade beställa alldeles för många" | Overifierat | Ingen bekräftad överlagersituation |
| "40 % rabatt" | Falskt | Verklig skillnad 678 → 599 kr = 11,65 % |
| "Livstidsgaranti" | Falskt | Vi har 30 dagars öppet köp |
| "Bara så länge lagret räcker" | Overifierat | Lagerscarcity vi inte kan stå för |
| "Tusentals grillkvällar" | Overifierat | Inga hållbarhetstester att citera |

Enda tillåtna brådskan i manuset: **kalenderfaktumet** att trimningssäsongen har några veckor kvar.

**De 12 beatsen:** hook · insider-intro · offer stack · hyperspecifik smärta · mekanism · payoff ·
namnge fienden · enkelhetsdemo · byggnad och passform · invändningsdödare · proof · identitets-callback
och close. Beat 4 är den som oftast slarvas bort i en swipe: modellen säger inte "mat faller genom
gallret" utan "du har sett räkor försvinna ner genom gallret". En bild, sinnlig, omedelbart
igenkännbar. Vår motsvarighet: mannen mitt på gräsmattan som sätter ner trimmern för att skaka ut armen.

**Hook-bänk (samma body, olika första 5 sekunder):**

| Hook | Ram |
|---|---|
| H1 | Offer först (speglar modellen): priset, sedan varför du vill ha ett innan säsongen är slut |
| H2 | Smärta först: axeln som ger vika innan gräsmattan är klar |
| H3 | Fienden först: byter du hand hela tiden är det inte armarna det är fel på |

**Två frågor annonsen besvarar som inget i kontot besvarat:**
1. Fungerar en **offer-ledd video** överhuvudtaget? Alla videor hittills leder med smärta; offer
   finns bara i statics, där det ger kontots högsta CVR.
2. Slår en **namngiven säljare till kamera** en anonym voiceover?

**Produktionsregel inskriven i briefen:** mobilfilmat, äkta människa, inga AI-ansikten. Kontots
vinstledare är rå mobilfilm och samtliga AI-ansiktsvideor har antingen dödats eller inte levererat.

**Blockerad uppgradering:** finns en äkta orsak till priset (parti beställt för stort, leverantörslot,
verkligt säsongsavslut) blir beat 1 och 3 modellens riktiga ryggrad och annonsen blir väsentligt
starkare. Den meningen skrivs inte av Claude. Kräver ett faktum från ägaren.

---

## 2026-08-13 (kväll) — lagerutförsäljningen bekräftad, två leveranser uppdaterade

Ägaren bekräftade att Bäverbutiken kör en **verklig lagerutförsäljning**: målet är att sälja ned
befintligt lager och nuvarande priser är faktiska nedsatta priser. Det låser upp reason-why-vinkeln
som både swipen och listiclen saknade, och som var det enda som höll dem tillbaka.

**Gränsen ägaren satte, inskriven i dna.md:** ingen rabattprocent för denna produkt. ~25 % är ett
generellt snitt över butiken som varierar per produkt, och axelbältets eget underlag är 599/678,
alltså 79 kr. Kronor, aldrig procent. Inga påhittade lagernivåer, slutdatum eller ordinariepriser.

### `Trimmerbelt_SO_8_1` — modellens ryggrad återställd

Beat 1 och beat 3 bär nu skälet, precis som i förlagan. Alla tre hooks omskrivna så att
lagerutförsäljningen finns i de första fem sekunderna. Beat 12 avslutar på utförsäljningen i stället
för på kalendern. Två captions tillagda. Primärtext och rubrik öppnar nu på utförsäljningen.

**H1 är det egentliga testet:** skälet först, erbjudandet faller ut ur det. Ingen video i kontot har
någonsin lett med ett erbjudande, och de offer-ledda staticsen ger kontots högsta CVR (4,55 %).
H2 och H3 är kontroller.

Beats 4 till 11 (smärta, mekanism, fienden, enkelhet, byggnad, invändning, proof) är **oförändrade** —
de hängde aldrig på erbjudandet.

### Listiclen — ärlighetssektionen har äntligen ett skäl

- **Dek** bär nu skälet, precis som motorhöljets dek gjorde. Det var den strukturella lucka som
  uppstod när jag byggde utan bekräftad orsak.
- **Sammanfattningen** öppnar på lagerutförsäljningen.
- **Ärlighetssektionen** säger nu det den ska säga: vi säljer ut lagret, det är hela anledningen.
  Fortfarande ärlig åt andra hållet (678 kr är vad det kostar i vanliga fall) och fortfarande
  ingen procentsats och ingen nedräkning.
- **Hero-CTA** → "Visa lagerutförsäljningen → 599 kr". **Slut-CTA** → "så långt lagret räcker".
- H1 är kvar **smärtledd**. Smärta ger ~2× vinst per krona mot säsong/offer i annonsdatan, och
  frameworkets slot 1 tillåter antingen problemet eller erbjudandet. Vill du att `SO_8` ska peka på
  en sida vars första mening matchar annonsens löfte är en offer-ledd H1-variant ett litet byte.

Verifieringsgrindarna kördes om på listiclen efter ändringen: 27/27 textnycklar, 0 tankstreck,
0 kvarlevor, 0 förbjudna priser.

---

## 2026-08-13 (sent) — orsaken bekräftad och priserna rättade

Två korrigeringar från ägaren, båda förstahandsuppgifter, båda styrande.

**1. Orsaken är specifik, inte generisk.** Inte "en utförsäljning pågår" utan **"vi råkade beställa
för många"**. Det är en starkare och mer mänsklig vinkel än en rea, och det är förlagans egen vinkel.
Hela berättelsekedjan är nu: vi råkade beställa för många → lagret blev större än planerat → vi
behöver sälja ned det → därför lagerutförsäljning → därför nedsatt pris just nu.

**2. Jämförpriset rättat i Shopify: 678 → 789 kr.** Verklig nedsättning är alltså **190 kr**, inte
79 kr. Produktsidan är källan för exakta prisclaims, och den säger nu 599/789.

### `Trimmerbelt_SO_8_1` — omskriven kring misstaget

Alla tre hooks bär nu misstaget; de skiljer sig bara i vad de öppnar på (misstaget, smärtan, eller
tittarens eget knep). Beat 3 och beat 12 omskrivna med 599/789/190. Nya captions. Primärtext och
rubrik öppnar på misstaget.

**Leveransanvisning inskriven i briefen:** det här är ett erkännande, inte ett utrop. Anders ska säga
det som man berättar för en granne att man beställde för mycket ved. Torrt, inte ursäktande, inte
uppspelt. I samma sekund det spelas som en säljreplik försvinner det som gör priset trovärdigt.

Beats 4 till 11 oförändrade. De hängde aldrig på erbjudandet.

### Listiclen — berättelsen bär från första skärmen

- **H1** är nu berättelsen: "Vi beställde av misstag för många axelbälten till trimmers och röjsågar,
  så nu säljer vi ut lagret till ett nedsatt pris." Tidigare smärtledd; ägaren instruerade uttryckligen
  att sidan ska bära samma historia som annonsen från första skärmen, så att annons och sida inte
  berättar två olika saker.
- **Dek** förklarar varför priset är lägre just nu.
- **Sammanfattningen** öppnar på misstaget och de nya priserna.
- **Ärlighetssektionen** säger det rakt ut: vi beställde fler än vi behövde, nu har vi mer i lager än
  planerat, så vi säljer det vi redan har billigare. Det är hela anledningen.
- **Alla åtta CTA:er** omskrivna och konsekventa med berättelsen.
- De fem punkternas brödtext är **oförändrad**. Berättelsen ramar sidan, punkterna gör övertygandet,
  och de var aldrig beroende av erbjudandet.

Grindarna kördes om med 678 kr och 79 kr tillagda som förbjudna siffror: 27/27 nycklar, 0 tankstreck,
0 kvarlevor, 0 förbjudna priser.

### Materialskuld som uppstod av priskorrigeringen

`SO_2_6` och `SO_2_7` är **live med 678 kr inbränt i bilden** och underskattar nu erbjudandet med
111 kr. Samma gäller varje brief i batch #6 och #7 som bär ett pris. De behöver göras om mot
599/789/190 innan något mer produceras från dem.

**Flaggan på `SO_2_1` är stängd.** "FÅ 20% RABATT IDAG" har flaggats som falskt claim i fyra
körningar i rad. Vid 789 → 599 kr är den verkliga nedsättningen större än 20 %, så annonsen lovar
mindre än kunden får. Inte längre ett compliance-problem.
