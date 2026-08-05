# Batch-logg – Axelbältet (axelbaltet)

Kampanj 120249192013870291 · MagiBorsten 1867947880635861 · Target-CPA 185 kr.

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
