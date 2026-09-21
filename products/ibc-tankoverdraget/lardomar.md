# Lärdomar — IBC-Tanköverdraget

En per etiketterad annons (docs/os/CS-KLART.md punkt 1–5). Skrivs av `node agent/lardom.mjs --skriv`; varje brief pekar på ett id här (`lardom=L-…`).

### Lärdom L-120250005818370291 — IBC_PD_1_H1 (BREAKTHROUGH, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 0 — produkttestet före batch #1 (batch-log: 'upptagna ID:n PD_1/PD_2/PD_Extra' vid numreringen 2026-09-01) |
| Utfall | BREAKTHROUGH |
| Fönster | 2026-08-28 – 2026-09-03 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 7 739 kr / 8 911 kr (87 %) |
| Köp | 38 |
| ROAS / CPA | 3,07 / 204 kr — kampanjens ROAS 2,92 |
| Konverteringsgrad | 3,5 % (38 köp / 1103 LPV) |
| Hook rate / hold rate | 37 % / 15 % |
| Bedömbar | ja |

**Koncept:** PD produktdemo · **Typ:** N · **Parent:** — · **Iteration:** 0 · **Källa:** produkttestet (briefen ligger i Product test center i Notion, inte i repot) — planerat läst ur `products/ibc-tankoverdraget/dna.md` Winning DNA 1–3


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext, rad 1 (live 2026-09-21): "Trött på grönt, algfyllt regnvatten? 💧"
- Rubrik (live): "Klart vatten. Ingen alg. Enkelt." · beskrivning: "Passar standard 1000L IBC-tank."
- Första frame (thumbnail, läst 2026-09-21): en tom IBC-tank i en trädgård, ingen text, inget överdrag — produkten syns inte i första bilden
- VO/inbränd text i videon: okänd — manuset finns inte i repot och videon är inte transkriberad (produkttestets brief i Notion)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | villaägare med IBC-tank för regnvatten i trädgården | samma: trädgård, rabatter, tanken på gräsmattan i första bilden; copyn talar till 'din IBC-tank' | ja |
| Vinkel | PD — produktdemo utan pris, utan urgency (dna.md Winning DNA 1) | PD: problemfråga → mekanism → tre ✓ → CTA, inget pris, ingen brådska i copyn | ja |
| Medvetandenivå | problem — kunden har sett det gröna vattnet | problem: 'Trött på grönt, algfyllt regnvatten?' öppnar på symptomet, inte på produkten | ja |
| Mekanism | solljus/UV ger alger — överdraget blockerar ljuset (dna.md 2: mekanism kopplad till verifierbar spec) | 'blockerar solljus och UV helt — så vattnet hålls klart, och tanken slits inte ut' + 210D Oxford-tyg som spec | ja |
| Tro | ljus är orsaken till algerna, så ett tätt överdrag löser det | samma tro bärs av copyn; ingen extern auktoritet, inget bevis utöver spec:en | ja |
| Positionering | skyddet som håller vattnet klart och tanken hel (funktion, inte pris) | 'Klart vatten. Ingen alg. Enkelt.' — funktion; tankens livslängd som andra löfte | ja |
| Brådska | ingen (dna.md: inget pris/urgency i PD-annonser) | ingen brådska i copy eller rubrik ('Skydda din tank idag 👇' är en CTA, ingen deadline) | ja |
**Utförandet föll:** nej · utford_som_briefad: ja — copyn och första bilden matchar dna.md:s beskrivning av vinnaren; videons VO är inte kontrollerad (okänd)

**Diagnos:** Breakthrough: tre iterationer inom 14 dagar, börja i manuslistan (nya hookar → längre problemdel → in media res). Aldrig en ren kopia av top spendern.

**Hypotes (gissning):** annonsen vinner på problemmedvetenheten — varje IBC-ägare har sett grönt vatten, och en fråga om just det plus en spec man kan peka på (210D Oxford-tyg) gör demot trovärdigt utan pris eller brådska; att produkten inte syns i första bilden verkar inte ha kostat hook rate (37 %), vilket talar för att symptombilden (tanken) bär hooken.

**Nästa annonser:**
- `IBC_PD_12_H1` — typ I, parent IBC_PD_1_H1, iteration 1 av 3 (vidarebygg, deadline 2026-10-05): ny hook — in media res, närbild på grönt vatten i tanken sekund 0, sedan samma manus ordagrant. (PD_12 = nästa lediga PD-nummer per batch-log; läs av kontot före brief.)
- `IBC_PD_12_H2` — typ I, parent IBC_PD_1_H1, iteration 2 av 3: längre problemdel — 5 s på vad algerna gör (igensatt kran, tank som byts) innan mekanismen, resten oförändrat.
- `IBC_PD_12_H3` — typ I, parent IBC_PD_1_H1, iteration 3 av 3: PD_Extras makro-textur-öppning (dna.md hypotes 4, CPA 129 kr på n=1) i full längd — isolerar öppningsbilden från klipplängden.

UGC: ingen beställning ur den här lärdomen — det som saknas är inte tro/auktoritet/tillit (annonsen konverterar 3,5 % av landningssidevisningarna, 38 köp / 1 103 LPV läst 2026-09-21), så vidarebyggen först.

