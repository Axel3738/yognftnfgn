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
