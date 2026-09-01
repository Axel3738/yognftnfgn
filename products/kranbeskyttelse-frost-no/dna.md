# Creative DNA — Kranbeskyttelse Frost NO (norska marknaden)

Skapad 2026-09-01 av `/forsta-batch` (körning nr 1, NORSK marknad — utlöst av
`agent/rond.mjs`-flaggan `forsta_batch`: kampanjen har passerat 1 500 kr spend
OCH minst 20 % vinst utan att någonsin fått en riktig creative-batch).
Datakälla: Magiborsten NO `1050941584152547`, kampanj `120251996272390233`
("Kranbeskyttelse Frost NO | BE-ROAS 1,63 | 2026-08-29"), avläst 2026-09-01,
`date_preset: maximum`: **2 861,42 kr spenderat, ROAS 3,65, 39 köp.**

⚠️ **Detta är samma fysiska produkt som svenska "Kranskydd Frost 420D"**
(kampanj `120249975043720291`, break-even-ROAS 1,49, eget minne i
`products/kranskydd-frost-420d/`) — men **egen NO-produkt, eget minne**, precis
som Fiskespöhållaren NO. Blanda aldrig ihop siffrorna mellan marknaderna.
Denna batch återanvänder SE-produktens grundinsikt (frost/vinterskydd för
utekran) men bygger sin egen DNA på NO-kontots FAKTISKA utfall — som visar sig
vara nästan **spegelvänt** mot SE (se rotorsak nedan).

## Produktfakta
- **Kranbeskyttelse Frost 420D** (norsk översättning av SE-produkten
  "Kranskydd Frost 420D – Skyddar Utekranen i Vinter"), Bäverbutikken.
- 22 × 14 cm, isolerande fôr, 420D Oxford-stoff utenpå, dragsnor, montering på
  10 sekunder uten verktøy. "30 dagers åpent kjøp" bekräftad i annonstexten
  (samma policy som SE, ingen anledning att tro den skiljer sig per marknad).
- ⚠️ **Pris kunde INTE verifieras.** `mcp__Shopify__*` gav
  "requires re-authorization (token expired)" på både `get-shop-info` och
  `search_products` — samma blockering som drabbade Fiskespöhållaren NO
  2026-08-31. Ingen levande sida kunde läsas. **Ingen av de 16 annonserna i
  kontot nämner ett pris** — PD- och SP-copyn (den enda som spenderat på
  riktigt) är prisfri, så det finns ingen etablerad prissiffra att bryta mot.
  Nya briefer i denna batch skriver **inget pris** tills Axel bekräftar
  beverbutikken.nos faktiska pris.
- Break-even-ROAS **1,63×** (ur kampanjnamnet). AOV okänd (Shopify nere) —
  vinstbidrag nedan räknas ROAS-baserat (`intäkt/1,63 − spend`, AOV-oberoende,
  se ANALYSMETOD steg 4), inte CPA-baserat.

## Datakvalitet
- Meta: `amount_spent × purchase_roas` på PD_1_H1 (2 656,18 kr × 3,929843 =
  10 440,6 kr) — `omni_purchase_values` kontrollerades inte separat (fältet är
  känt buggigt i kontofamiljen, se CLAUDE.md); revenue är räknad via
  `spend × ROAS`, aldrig via `omni_purchase_values`.
- Summan av alla 16 annonsraders `amount_spent` (2 858,76 kr) matchar
  kampanjnivåns 2 861,42 kr inom normal avrundning/valutakonvertering.
- Shopify (beverbutikken.no): **inte nåbar** denna körning (token expired) —
  samma problem som Fiskespöhållaren NO. Ingen försäljning kunde
  korsvalideras mot Meta.
- Meta Ad Library: inte kontrollerad denna körning (tidsprioritering: den
  enda verkliga signalen i kontot — PD_1_H1 — är redan starkt bevisad och
  konkurrentresearch tillför mindre värde än att åtgärda BLOCKER + ge SP en
  chans). Lucka, inte ett nekat försök — fyll vid nästa `/cs`.
- Video: kunde inte öppnas (bara creative-copy via API, ingen
  transkribering av ljud/rörelse). Bedömningen bygger på primärtext +
  rubrik, inte ett rad-för-rad-manus av vad som faktiskt syns/hörs.

## Siffrorna (bedömbara annonser, ≥300 kr spend OCH ≥3 köp; BE-ROAS 1,63)

Vinstbidrag = `intäkt/1,63 − spend` (ROAS-baserad, AOV-oberoende, ANALYSMETOD
steg 4 — samma korrekta formel som `products/kranskydd-frost-420d/dna.md`,
INTE `spend × (ROAS−BE)` som `fiskespohallaren-no/dna.md` av misstag använde;
de två är inte matematiskt ekvivalenta, se uträkning nedan).

| Annons | Format | Vinkel | Spend | Andel spend | Köp | ROAS | **Vinstbidrag** |
|---|---|---|---|---|---|---|---|
| **Kranbeskyttelse_NO_PD_1_H1** (benchmark/top spender) | video | pain/demo — frostsprengt rørledning | 2 656,18 kr | 92,9 % | **39** | **3,93** | **+3 749 kr** |

Kampanjens totala vinstbidrag: **+3 543 kr**. PD_1_H1 bidrar med **106 %** av
totalen — övriga 15 annonser drar sammanlagt ned den med ca 207 kr (spend utan
mätbar intäkt), exakt samma mönster som i både SE Kranskydd (SP_1_H3: 129 %)
och Fiskespöhållaren NO (NO_PD_1_H3: 172 %). **Detta konto koncentrerar
konsekvent nästan all spend och all vinst till EN annons** — ett mönster värt
att känna igen över hela Bäverbutikens NO-portfölj.

**För tidigt (ingen dom, redovisas ändå för mönstret i steg 6b):**

| Annons | Format | Vinkel | Spend | Köp | Kommentar |
|---|---|---|---|---|---|
| Kranbeskyttelse_NO_PD_1_H2 | video | pain/demo (samma manus som H1) | 73,27 kr | 0 | Aldrig fått en chans — Meta koncentrerade spend till H1 |
| Kranbeskyttelse_NO_PD_1_H3 | video | pain/demo (samma manus) | 44,39 kr | 0 | Samma som ovan |
| Kranbeskyttelse_NO_SP_1_H3 | video | social proof/testimonial | 31,35 kr | 0 | SE:s VINNANDE vinkel — men i NO aldrig testad på riktigt |
| Kranbeskyttelse_NO_CS_1_H1 | video | rea/rabatt (23 %, samma BLOCKER som SE) | 13,14 kr | 0 | — |
| Kranbeskyttelse_NO_SP_1_H1 | video | social proof/testimonial | 13,55 kr | 0 | — |
| Kranbeskyttelse_NO_CS_1_H3 | video | rea/rabatt | 8,53 kr | 0 | — |
| Kranbeskyttelse_NO_PD_2_1 | static | pain/demo | 5,53 kr | 0 | — |
| Kranbeskyttelse_NO_CS_1_H2 | video | rea/rabatt | 5,85 kr | 0 | — |
| Kranbeskyttelse_NO_GT_1_H1/H2/H3, GT_2_1, SP_1_H2, SP_2_1, CS_2_1 | – | gåva / social proof / rea | 0,15–1,97 kr vardera | 0 | CBO-svält, aldrig fått en chans |

## Rotorsak — vad som faktiskt driver resultatet (och varför det är SPEGELVÄNT mot SE)

**Samma översatta copy-familjer som i SE, men helt annat utfall.** SE:s
vinnare var **SP** (social proof/testimonial, +629 kr vinstbidrag, 129 % av
totalen) medan SE:s **PD (pain/demo) gick back** (ROAS 0,77–0,94, under
break-even på båda mätbara varianterna). I NO är det tvärtom: **PD_1_H1 bär
hela kampanjen** (+3 749 kr) medan **SP aldrig fick en riktig chans** (47,96 kr
total spend över 4 annonser — inte en förlorare, bara obevisad).

Två möjliga förklaringar, ingen bevisad än:
1. **Marknadsskillnad** — norska köpare reagerar starkare på det konkreta
   skräckscenariot (sprukket rør) än svenska köpare gjorde, eller omvänt
   svagare på testimonial-formatet.
2. **Leveranskoncentration** — precis som i Fiskespöhållaren NO
   (92,9 % av spend till EN annons) kan Metas inlärningsfas ha låst fast sig
   vid PD_1_H1 tidigt och aldrig gett SP en ärlig budget-chans, oavsett
   vinkelns egentliga styrka i NO.

**Det går inte att skilja dessa åt med den data som finns.** Det är precis
därför denna batch både itererar på den bevisade vinnaren (PD) OCH ger SP en
genuin ny chans (UGC-format i stället för textcitat) — hypotesen testas
direkt i stället för att gissas.

## Winning DNA — behåll alltid
- Pain/demo-hooken "En sprukket vannledning oppdages alltid for sent" +
  snabb ✅×3-lista (isolerande fôr, tål snø/regn/is, 10 sekunders montering)
  + "Bestill i dag". Bevisat 39 köp, ROAS 3,93, bär 106 % av kampanjens vinst.
- Ingen prissiffra i vinnarannonsen — säkrast väg framåt tills priset är
  bekräftat (samma princip som Fiskespöhållaren NO).
- "30 dagers åpent kjøp" som garantirad — bekräftad policy, säker att bygga
  risk-reversal-vinklar kring.

## Losing/rotorsaker (hypotes, ej bevisad — för lite data per enskild annons)
- **CS (rea) är samma BLOCKER som i SE:** "23 % rabatt på Kranbeskyttelse
  Frost 420D" utan bekräftad rabattkod/jämförpris i butiken (Shopify oåtkomlig
  denna körning, men SE-systerprodukten har redan bevisat att denna
  produktfamilj saknar en riktig rabatt). Samma copy-dokument
  (`Kranskydd Frost 420D_CS_Adcopy`) har till och med en egen VA-notering:
  "Fri frakt-raden från svenska copyn är medvetet ersatt" — ingen fri
  frakt-siffra är bekräftad för NO heller. **Ingen ny CS-copy i denna batch.**
- **GT (gåva) fick i praktiken ingen spend** (4 annonser, 3,28 kr av
  2 861 kr — 0,11 %) — samma säsongsmässiga disharmoni som SE (julvinkel i
  september är tre månader för tidigt). **Pausas till november, testas inte
  om nu.**

## Behåll alltid / Testa kontrollerat / Undvik / Obevisat
- **Behåll:** PD-vinkelns struktur (skräckscenario → ✅×3 → "Bestill i dag") ·
  ingen prissiffra i copyn förrän Axel bekräftar · "30 dagers åpent kjøp".
- **Testa kontrollerat:** SP-vinkeln i ett STARKARE format (äkta UGC-talking
  head i stället för textcitat-kort) — isolerar om SE:s vinnande vinkel bara
  aldrig fick en chans i NO, eller om marknaden faktiskt föredrar PD ·
  PD-manuset format-överfört till statisk bild (samma playbook-mönster som
  Bälteslipmaskinen och SE Kranskydd: identisk copy kan prestera lika bra
  eller bättre statiskt) · en ny "cost of ignoring it"-vinkel utan påhittad
  kr-siffra som ersätter den blockerade CS-rean (samma lösning som SE).
- **Undvik:** rabatt-/rea-språk utan en riktig rabatt i Shopify · julvinkel
  utanför november–december · ett exakt pris i copyn innan Shopify-priset är
  bekräftat.
- **Obevisat:** allt utom PD_1_H1 — bara den annonsen har passerat
  signifikansgrinden i denna körning.

## Luckor (fyll före nästa körning)
- Priset på beverbutikken.no — Shopify-åtkomsten var nere hela sessionen.
  Bekräfta innan någon prisbärande copy skrivs.
- Videoinnehåll (rörelse, röst, exakt hook-bildruta) för PD_1_H1 — hela
  teardownet bygger på primärtext/rubrik, inte en verklig rad-för-rad-analys
  av vad som visas i bild.
- Meta Ad Library — ingen konkurrentsökning gjord denna körning (tidsprioriterat
  bort, se datakvalitet ovan).
- Recensioner/Judge.me för beverbutikken.no — inte kontrollerat.
