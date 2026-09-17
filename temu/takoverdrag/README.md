# Taköverdrag husvagn/husbil — nio storlekar (2026-09-17)

Produkten kom med batch 6 och ligger bara i **SE** (inte NO).
Handle: `takoverdrag-husvagn-6-5-3-m-skyddar-den-dyraste-ytan`

Axel 2026-09-17, efter leverantörens svar: *"Vi måste fixa på hemsidan för taköverdraget
så det funkar för Sverige … Ser du alla storleks varianter okej? Vi måste lägga in dom."*

## Läget

**Klart och live:** sidan är omskriven med leverantörens fem nya uppgifter —
silverbelagd 210D-oxfordväv, remmar på fyra sidor à 2,5 m, justerbar längd, krok i
nederkant, och **två förstärkta 10,5 m-spännremmar som ingår**. Sidan hade dessutom
ingen meta-beskrivning alls; den finns nu.

**Väntar på CWD:** de nio storleksvarianterna. Se nedan.

## Varför varianterna inte är skapade

CWD-offerten (arket *Claude_products_filled 1*, 2026-09-05) prissatte **bara 6,5 × 3 m** —
variantrutan säger ordagrant `[210D] Black/silver, 5*3m, 6.5*3m(quote based on this size)`.
De åtta andra längderna har alltså inget inköpspris.

Att skala fram dem själv vore en gissning, inte en beräkning, av tre skäl:
1. **Frakten är 18,75 av 36,17 USD** — mer än halva landade kostnaden.
2. **Samma ark visar att just den här produkten slår i "overweight" redan vid qty 3**
   till Sverige. Ett 3 × 13,5 m-överdrag är 40,5 m² tyg; att frakten skulle skala linjärt
   dit är inget man kan anta.
3. CLAUDE.md: *"COGS sätts från offertens landade kostnad × valutakurs — aldrig ur priset"*.
   Påhittade inköpspriser gör varje vinstrapport i `pnl-app` fel, vilket redan hänt en gång
   (2026-08-30, 669 varianter utan cogs).

`varianter.mjs` vägrar därför köra skarpt så länge någon storlek saknar siffra.

Prisförfrågan att skicka: **`<scratchpad>/tak/CWD-FORFRAGAN.md`** — de nio raderna plus två
frågor: vid vilken längd paketet blir oversize till Sverige, och om de två 10,5 m-remmarna
följer med alla längder.

## Räkningen är avstämd
Formeln är verifierad mot det som ligger live, så priserna blir rätt direkt när siffrorna kommer:

| | Offert | Uträknat | Live |
|---|---|---|---|
| 6,5 × 3 m | 17,42 + 18,75 = 36,17 USD | 1129 / 1469 kr, cogs 342,52 | 1129 / 1469, cogs 342,52 ✅ |

`pris = nio((landat + 2,9 €-avgiften) × 3 × 9,4698)` · `jämför = nio(pris × 1,3)` ·
`cogs = landat × 9,4698` (utan avgiften).

## Så här blir det klart

```bash
# 1. fyll i LANDAT_USD överst i varianter.mjs med CWD:s svar
node temu/takoverdrag/varianter.mjs              # visar prisstegen, skapar inget
node temu/takoverdrag/varianter.mjs --skarp      # skapar de nio varianterna

# 2. byt sidan till nio-storleksversionen (lägger in storlekstabellen)
node temu/takoverdrag/bilder-storlekstabell.mjs
node temu/takoverdrag/sida.mjs --nio --skarp
```

`sida.mjs --nio` kontrollerar att varianterna finns och vägrar annars: en sida som lovar
nio längder men bara säljer en är ett löfte butiken inte kan hålla.

## Filerna
- `fakta.mjs` — de nio längderna, leverantörens fem nya uppgifter, den enda offererade raden
- `copy.json` — två uppsättningar: `enStorlek` (live i dag) och `nioStorlekar` (väntar)
- `sida.mjs [--nio] [--skarp]` — skriver om produktsidan
- `varianter.mjs [--skarp]` — skapar storleksvarianterna, spärrad utan riktiga inköpspriser
- `bilder-storlekstabell.mjs` — infografiken med de nio längderna, skarp text ur fakta.mjs

## Två saker att veta
- **"Vattentät" skrivs aldrig ut**, trots att leverantören säger *"waterproof and
  sun-resistant"*. Vi säljer på konstruktionen i stället: silverskiktet och 210D-väven är
  belagda fakta, täthet är ett absolut löfte. Samma linje som spakapellet i batch 9.
- **Den gamla bulleten "Vattnet blir aldrig stående kring takluckorna" är borta.** "Aldrig"
  om ett utfall är förbjudet i CLAUDE.md och hade legat live sedan batch 6.
