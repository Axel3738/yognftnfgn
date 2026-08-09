# Sätesöverdragaren — Creative DNA

Produkt: Sätesöverdrag för Åkgräsklippare – Slittåligt 600D Oxford (baverbutiken.se)
Kampanj: "Sätesöverdragaren" `120249122415680291` · Konto: MagiBorsten `1867947880635861`
Pris: 649 kr (ord. 811 kr) · Break-even-CPA: **474 kr** · Target-CPA: **300 kr** · AOV (härledd): 697 kr
Senast uppdaterad: 2026-08-09 (efter `/cs`-runda 4, 20 dagars kontodata)

> Denna fil är produktens ackumulerade minne. Data och hypotes hålls isär enligt
> `docs/os/ANALYSMETOD.md`. Uppdateras vid varje `/cs`.

---

## Winning DNA (data — bevisad, ≥2 annonser ≥3 köp vardera med samma slutsats)

- **Format = rå leverantörsvideo med genomgående inbrända svenska captions.**
  `PD_1_3_H1` (68 köp, CPA 290 kr, vinstbidrag 12 501 kr — 92,1 % av allt
  vinstbidrag) och `PD_2_1_H1` (3 köp, CPA 422 kr, vinstbidrag 155 kr) är de enda
  bedömbara videoannonserna, båda lönsamma.
- **NYTT OCH VIKTIGT (runda 4): vinnaren tål skalning utan CPA-drift.** Spend gick
  15 000 → 19 730 kr på ett dygn (+4 746 kr) och köpen 52 → 68 (+16). **Marginell
  CPA på den nya spenden: 297 kr** mot livstids-CPA 290 kr — i praktiken oförändrad.
  Frekvens bara 1,81 och CPM har sjunkit till 102 kr. Ingen utmattning i sikte.
  → Instruktion: fortsätt mata budget. Det är inte "över target-CPA"-läge, det är
  en annons som fortfarande köper billigt vid högre volym.
- **NYTT (runda 4): prisankaret är BEVISAT och lika lönsamt per krona som vinnaren.**
  `SO_1_1_H1` passerade signifikansgränsen (5 köp, 1 454 kr). Vinstbidrag per
  spendkrona: **0,63 kr — identiskt med vinnarens 0,63 kr.** Skillnaden är bara
  att den fått 5,6 % av budgeten mot vinnarens 75 %. Detta flyttas härmed från
  hypotes till bevisad Winning DNA.
- **Produkten synlig direkt, ingen talare, ingen musikvideo-stil.** Båda bevisade
  videoannonserna är rena demos utan person i bild.

## Winning DNA (hypotes — starkt signal, men underliggande annonser < 3 köp)

- **CTR är prisankarets ENDA svaghet — och därmed kontots tydligaste
  outnyttjade hävstång.** `SO_1_1_H1` konverterar besökare till köp i **6,6 %**
  mot vinnarens 2,5 % (2,6× bättre), men dess CTR är 1,43 % mot vinnarens 2,76 %.
  Kedjan: låg CTR → få konverteringssignaler → CBO svälter den → 5,6 % av
  budgeten trots identisk lönsamhet per krona. **Fixas CTR utan att CVR tappar
  blir SO-spåret skalbart och kontot slutar hänga på en enda video.** Batch 5
  attackerar detta från två håll (`SO_5_1` = större typografi, `SO_6_1` = äkta
  miljöfoto i stället för studiografik).
- **Captions är den enskilt viktigaste variabeln i video**, ursprungligen bevisad
  i den rena A/B:n `PD_1_3_H1` (med captions, ROAS 2,50) vs `PD_1_1_H1` (identisk
  video utan captions, ROAS ~0,99). **`PD_1_1_H1` har nu stått still på exakt 2
  köp två dagar i rad** (1 302→1 313 kr spend, 0 nya köp) medan tvillingen gick
  49→52 köp på samma dygn. Fortfarande formellt under signifikansgränsen (2<3
  köp), men två raka nolldagar på en annons som i övrigt liknar en 52-köpare är
  stark nog anekdotisk evidens för manuell paus. Behandla captions som ett
  obligatoriskt produktionskrav, inte en variabel att testa om igen.

## Losing DNA (hypotes — konsekvent riktning, ingen enskild annons signifikant)

- **UGC/talare-drivet innehåll ("SP"-spåret) har noll bekräftade köp i hela
  kontots historia**, trots sju annonser och tre batcher. Runda 4: `SP_2_1_H1`
  nu **486 kr spend, fortfarande 0 köp** (högst CTR i kontot, 6,43 %, men p50/plays
  bara 6,7 % — klassiskt nyfikenhetsklick på för lång video). Summerar man hela
  SP-spåret: ca **656 kr spend, 0 köp** över sju annonser. Ingen enskild annons
  har nått 3 köp så formellt finns ingen dom, men riktningen är entydig över tre
  batcher och 20 dagar. `SP_3_1_H1` har dessutom nu status **WITH_ISSUES** i
  Meta (se kvalitetskontroll-loggen).
- **Lång video (79–146 s) utan cutdown konverterar inte**, trots hög hook/CTR
  (`SP_2_1_H1`: hook enligt ANALYSMETOD-formeln 93 %, CTR 6,7 %, p50/plays bara
  10 %, 0 köp på 442 kr). Regel 9: hög CTR utan CVR är nyfikenhetsklick, inte en
  vinnare.

## Behåll alltid
- Captions i alla videor, ord för ord från brief, vit text/svart kant.
- Produkt synlig < 1 sekund i video, dominant i bild.
- Pris exakt 649 kr / ord. 811 kr — äkta genomstrykning, aldrig ordet "överstruket"
  utskrivet (se Kvalitetskontroll-loggen nedan).
- Rå/dokumentär videostil framför polerad reklamstil.

## Testa kontrollerat (en variabel i taget)
- Persuasion-mekanism: demo (bevisad) vs pris-anker (starkt hypotes) vs
  mekanism/prevention (obevisat, `PD_7_H1` för tidigt) vs identity/gift (helt
  otestat — batch 3).
- Format: video vs statisk vs karusell (karusell aldrig testad).
- Längd: 38 s (bevisad bas) vs 15 s cutdown (`PD_5_H1`, för tidigt).

## Undvik
- Video utan captions.
- Lång UGC (>45 s) utan cutdown.
- **Fabricerade testimonials.** Se Kvalitetskontroll-loggen — inträffat två gånger
  i kontot (`SP_3_1_H1` och `SP_6_1`).

## Strukturell observation (runda 4) — viktigare än enskilda creatives

**CBO svälter allt nytt.** 24 annonser delar 1 500 kr/dag. Batch 2 + 3 (15
annonser) har tillsammans fått ca **1 100 kr av 26 180 kr = 4,2 % av spenden**
över flera dagar. Vid den takten når de flesta aldrig 300 kr/3 köp — de kan
alltså varken bevisa eller motbevisa sina hypoteser. Det är inte creativens fel,
det är budgetstrukturens. Fler briefer löser inte detta ensamt.

**Tre möjliga strukturåtgärder (ägarbeslut, ej Claudes):**
1. Höj dagsbudgeten så testandelen räcker till fler samtidiga annonser.
2. Pausa de svältande/underpresterande så budgeten koncentreras på färre tester.
3. Separat test-adset med egen budget, skilt från det som skalar vinnaren.

## Ännu obevisat
- Om riktig (verifierad) kundröst konverterar bättre än opersonlig demo —
  kräver Judge.me-export innan det går att testa på riktigt.
- Om mekanism/prevention-vinkeln (`PD_7_H1`) expanderar publiken utöver de med
  redan spruckna säten.
- Karusellformat.
- Identity/gift-vinkel (batch 3, `SO_3_1`).

---

## Kvalitetskontroll-loggen (löpande, viktigt att inte tappa bort)

| Datum | Fynd | Åtgärd |
|---|---|---|
| 2026-07-30 | `SO_1_1_H1` hade AI-textbugg: ordet "överstruket" skrivet ut i bilden i stället för en riktig genomstrykningslinje. | Ersatt med `SO_1_2` (verifierad korrekt vid launch — riktig linje över 811 kr). |
| 2026-07-30 | `SP_3_1_H1` var en fabricerad AI-testimonial ("Verifierad kund, 54 år", påhittat citat, AI-ansikte). | Flaggad, rekommenderad pausad. Fortfarande live (8 kr spend). |
| **2026-08-05** | **`SP_6_1` (launchad 2026-08-04) är ÄNNU en fabricerad testimonial** — "Bättre än väntat, den är vadderad och har flera fickor." – JAKOB, verifierat köp, "En av 20 recensioner". Briefen för denna annons var uttryckligen märkt **BLOCKER: väntar på riktig Judge.me-export** — ingen sådan export har levererats i denna chatt. Namnet "Jakob" och citatet är påhittade. | **Rekommenderas pausad omgående.** Se rapportens åtgärdslista. Samma policyproblem som `SP_3_1_H1`, andra gången i kontot. |
| 2026-08-05 | `SP_4_H1`/`SP_5_H1` (batch 2, UGC-koncept) launchades med den **befintliga** kontocopyn ("Trodde jag skulle behöva byta hela sätet... Det är den vanligaste kommentaren vi får") snarare än ny brief-copy. Denna rad är en overifierad "vanligaste kommentar"-formulering, inte ett nytt påhitt, men har aldrig belagts mot en riktig recension. | Flaggad som stående overifierad claim. Inte lika akut som SP_6 (ingen namngiven falsk person), men bör bytas ut när recensionsdata finns. |
| 2026-08-05 | `PD_10_1` (listicle) launchades med exakt den känslomässiga 4-punktstexten ("Slipp den kalla, blöta känslan...") som levererades i chatten 2026-08-05 — bekräftar att produktionsteamet använder brieferna korrekt. | Ingen åtgärd, positiv kontrollpunkt. |
| 2026-08-05 | `SO_1_2` visuellt verifierad korrekt: riktig genomstrykningslinje över "811 kr", inget textfel. | Buggfixen fungerade. Pausa `SO_1_1_H1` till förmån för `SO_1_2` när den senare når signifikans. |
| **2026-08-06** | **`SP_6_1` och `SP_3_1_H1` (fabricerade testimonials) fortsatt LIVE och spenderande** ett dygn efter att paus rekommenderades i föregående `/cs`-runda. Ingen åtgärd har vidtagits. | **Andra gången detta flaggas utan åtgärd.** Eskalerat i rapporten till Axel — kräver ett svar/beslut, inte bara en flaggning i chatten. |
| **2026-08-09** | **`SP_3_1_H1` (fabricerad AI-testimonial) har nu status `WITH_ISSUES` i Meta** — dvs. Meta självt har flaggat annonsen, utöver vår egen policyflagg från 2026-07-30. `SP_6_1` (samma problem) är fortsatt ACTIVE. Båda har nu varit pausrekommenderade i 4 respektive 5 dagar utan åtgärd. | **Tredje gången detta eskaleras.** Meta har nu gjort en del av jobbet åt oss på SP_3. SP_6 ligger kvar och spenderar. |
| 2026-08-09 | **Datakvalitetskontrollen är REN denna runda.** Alla 6 rader med köp: `spend × ROAS` matchar `omni_purchase_values` på 0,00 % avvikelse. AOV-kontroll rimlig (649–765 kr). De 100×-fel jag rapporterade i runda 2 återfinns inte — antingen efterfyllt av Meta eller ett mätfel från min sida då. Ingen slutsats dras om orsaken. | Fältet användbart idag. Kontrollen körs ändå varje runda. |
| 2026-08-06 | Batch 3 (`PD_11_1`, `SO_3_1`, `PD_12_H1`) visuellt verifierad korrekt vid launch: rätt pris (649 kr) på alla tre, ingen konkurrentlogga i PD_11:s "tunt tyg"-panel, ingen påhittad gåvohögtid i SO_3, PD_12:s hook-bild matchar briefens "blöt/daggig säte-closeup". Kunde inte verifiera den bokstavliga "POV:"-textkortet i PD_12 från en enskild stillbild (video ej avspelad i sin helhet) — flaggat som osäkert, inte som fel. | Positiv kontrollpunkt, inga fel hittade. |

---

## Öppna frågor till Axel
1. **[Olöst sedan runda 2, eskalerad]** Pausa `SP_6_1` och `SP_3_1_H1` (fabricerade testimonials)? Frågades 2026-08-05, inget svar/åtgärd innan runda 3 (2026-08-06). Jag pausar inte annonser själv utan uttryckligt ok.
2. **[Nytt runda 3]** `PD_1_1_H1` (2 köp, oförändrat två dygn i rad, 1 313 kr spend) och `SP_2_1_H1` (0 köp, 442 kr spend) — pausa manuellt trots att signifikansgränsen formellt inte är nådd?
3. Judge.me-export (riktiga recensioner) — efterfrågades 2026-07-30, saknas fortfarande. Blockerar `SP_6_1` (redan launchad felaktigt) och framtida testimonial-briefer.
4. Bekräfta att `SP_4_H1`/`SP_5_H1`:s filmade person är en riktig kund/creator, inte återanvänt leverantörsmaterial — påverkar om "vanligaste kommentaren"-raden får fortsätta användas.
5. ~~**[Runda 3]** Fortsätta bygga varje runda oavsett kvotläge?~~ **BESVARAD 2026-08-06: JA.** Axel vill ha buffert med briefer till nästa analys. Kvoten är ett **golv, inte ett tak** — bygg alltid minst kvoten, mer när managern ber om det. Motivera aldrig bort en batch med hänvisning till att kvoten redan är uppfylld. Batch #4 (4 briefer) byggd efter detta besked.
