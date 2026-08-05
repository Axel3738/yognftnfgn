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

Kvot: 7 per 3-dagarscykel → batch = 8. Copy skriven av sonnet-subagent (modellpolicy). Briefer: `briefs/batch-3/` (zip levererad i chatten).

| Annons | Typ | Hypotes | Isolerad variabel |
|---|---|---|---|
| Trimmerbelt_SO_2_5 | Statisk (rotation av vinnaren) | Vinnarstatiskans budskap i ny formulering ("SPARA 20 % NU") förlänger vinnarens livslängd innan fatigue | Endast text-formulering |
| Trimmerbelt_PD_2_3 | Statisk (native foto i gräs) | PD_2_2-signalen (ROAS ~11 på 44 kr): native utan overlay skalar när copyn bär säljet | Overlay vs native (variant 3 på AD-ID PD_2) |
| Trimmerbelt_SO_3_H1 | Video (ny hook på fatigad vinnare) | Rotation: ny hook ("En klick – och armen slutar skaka") återställer vinnarens CPA < 185 | Endast 0–3 s |
| Trimmerbelt_SO_3_H2 | Video 15s cutdown | Kortare → p100 ≥ 10 % → CPA −15 % | Endast längd |
| Trimmerbelt_SO_4_H1 | Video (pris-anchor close) | 636→509-endcard slår "specialpris" på LPV→köp | Endast close |
| Trimmerbelt_PD_3_H1 | Video mekanismdemo 20s | Demonstration closar problem aware-trafiken som PD_1_H1 fångar men tappar | Ny persuasion-mekanism |
| Trimmerbelt_SP_3_H1 | UGC 25–27s skeptiker | Skepsis-ram + äkta 4,75/5 öppnar social proof-spåret som aldrig fått budget | Ny persuasion-mekanism |
| Trimmerbelt_SP_4_H1 | Video story 60+ | Identitet/självständighet + kvinnlig creator når segment nuvarande ads missar | Ny målgruppsram |

Åtgärder utförda i kontot 2026-08-05: SO_6_1 pausad (kill-regel). Rekommenderat till manager: pausa även PD_2_1 + SF_2_1 (DO_NOT_REUSE, dryper fortfarande några kr), och ge batch #3 en egen ABO-testcell (~600 kr/dag) så CBO inte svälter den.
Launch ej loggad ännu – kör `/logga axelbaltet <antal>` när teamet launchat.
