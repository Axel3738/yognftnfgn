# COGS (inköpspris) i de fem Bäver-butikerna

Bakgrund: 2026-08-30 upptäckte Axel att sålda enheter i NO saknade inköpspris.
Inventeringen visade en systemisk lucka: **669 varianter i alla fem butiker
saknade `inventoryItem.unitCost`** — utan den blir varje vinstrapport fel.

## Metoden (validerad, återanvänd den)

COGS = **landad kostnad i USD ur CWD-offerten × valutakurs**.
2,9 €-avgiften ingår INTE — den är per ORDER, inte per enhet
(`UTLANDS-LANSERING.md` rad 358).

Prioritetsordning för kostnadskällan:
1. **Offertens landsspecifika kostnad** (kolumner SE1/NO1/DK1/FI1/UK1, eller
   landsblocken NORWAY/FINLAND/DENMARK/UK). Exakt — använd alltid när den finns.
   OBS: varje produkt har tre rader (Qty 1/2/3). **Qty 1 är styckkostnaden**;
   Qty 2/3 är totaler för flera enheter och får aldrig användas som styckpris.
2. **SE-baskostnad × landfaktor** när offerten bara har ett pris
   (`baver produkter uppdaterad` är en SE-basoffert).

### Låsta kurser och faktorer
FX (USD→): SEK 9,4698 · NOK 9,2989 · DKK 6,3960 · EUR 0,856026 · GBP 0,73331
Landfaktor mot SE-kostnad (median ur 43 landsuppdelade offertrader):
**NO 1,133 · DK 1,148 · FI 1,272 · UK 0,952** — frakten skiljer per land.

### Validering (gör om den vid varje körning)
Planen reproducerade redan satta cogs med **median 0,3 % (NO) / 1,7 % (SE)**
avvikelse, 111 av 113 inom 5 %. Ligger en ny körning sämre än så är metoden fel
tillämpad.

⚠️ **Prisregelns invers duger INTE som källa.** 3×-regeln gäller bara 26 % av
katalogen (kvoten pris/kostnad spänner 0,3–37). Att räkna kostnad = pris/3 ger
grovt fel på äldre produkter.

⚠️ **FX-konvertering av en systerbutiks cogs duger inte heller** — median 12 %
fel mot faktisk landsspecifik kostnad, systematiskt för lågt (frakten dyrare).

## SKU-alias mellan butikerna
Butikerna har OLIKA SKU-scheman för samma produkt: SE använder `TEMU-<goodsid>`,
NO använder `BEVER-<KAT>-<nr>`, och DK/FI/UK har egna. Matchning måste därför gå
via produktnamn (översatt) eller via SE-katalogen som brygga — inte på SKU.
`cogs-alias.mjs` bär de verifierade NO-aliasen.

## Skripten
```bash
node temu/cogs/cogs-bygg-plan.mjs        # konsoliderar källor → cogs-plan.json
node temu/cogs/cogs-applicera.mjs <land> # torrkörning
node temu/cogs/cogs-applicera.mjs <land> --skarp
node temu/cogs/cogs-alias.mjs --skarp    # NO:s BEVER→TEMU-alias
node temu/cogs/cogs-slutkoll.mjs         # täckning per butik
```
Skripten rör ALDRIG en variant som redan har cogs.

## Öppna punkter (2026-08-30)
- **NO-priserna är satta 1:1 mot SEK** på minst 13 produkter (1869 NOK = 1869 SEK)
  trots regeln NO = ×1,13. Marginalen i NO är alltså sämre än prismodellen antar.
  Axel måste avgöra om priserna ska höjas.
- **Kastfångans NO-cogs (140,65) matchar inte offerten** (12,84 USD = 119,40).
  Någon satte ett annat värde tidigare — okänd källa.
- **Fem rader i `baver produkter uppdaterad` har beskrivningar som hör till andra
  produkter** (golfnätet beskrivs som "hockey shooting pad"). Kostnaden på de
  raderna får inte användas förrän de kontrollerats mot Temu. Golfnätet lämnades
  därför utan cogs.
- Kvar utan känd kostnad: SE 35, NO 13, DK 40, FI 78, UK 135 varianter. De flesta
  är äldre katalogprodukter vars kostnad inte finns i något ark — de behöver en
  ny offertförfrågan eller manuell uppgift från Axel.
- `Hagepakken` (0 kr) och `Presentkort`/`Blanda & Spara` är paket/tjänster och
  ska aldrig ha cogs.
