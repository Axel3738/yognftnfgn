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
