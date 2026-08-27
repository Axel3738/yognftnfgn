# Annonsdoktrin — Bäverbutiken

Underlaget bakom **Bäverdoktrinen**: hur många annonser som ska köras per produkt
vid vilken budget, hur högt en produkt får skalas, när den ska lämnas ifred på hög
ROAS, och vilka UGC-kreatörer som behövs för att det ska gå ihop.

Framtaget genom en fan-out över elva agenter: tre oberoende modeller (spendtrappa,
kreativ mättnad, portföljrisk), en domarpanel med operatörs- och ekonomlins, och
två adversariella granskningar som fick i uppgift att såga resultatet. Allt räknat
mot butikens **riktiga** katalog via vinstappen — 119 produkter med inköpspris,
medianpris 329 kr, median-täckningsbidrag 54 %.

## Tesen

Axels egen formulering: *"vi behöver ligga på lite lägre skala på alla produkter för
att kunna chilla på en högre ROAS."* Uträkningen ger honom rätt, och med marginal:

| ROAS | Kvar per 100 kr annonsspend |
|---|---|
| 2,0× | 8 kr |
| 3,0× | 62 kr |

Samma 9 000 kr/dag i budget: **en** produkt maxad ger −251 kr/dag, **arton** produkter
à 500 kr/dag ger +7 524 kr/dag. Marginalkronan på en ny produkt (55 kr per hundralapp
vid 400 kr/dag) slår alltid marginalkronan på en befintlig (0 kr per hundralapp när
den går 2 200 → 3 000 kr/dag).

## Filerna

| Fil | Innehåll |
|---|---|
| `volym-och-skalning.md` | Volymtrappan, taket, chill-villkoren, veckorutinen, snabbreferens |
| [`../ugc-creators.md`](../ugc-creators.md) | 12 kreatörsarketyper, 6 batch-roller, sourcing, ersättning, avtal, briefmall, kvalitetströskel, register |
| `katalogsegment.md` | Katalogen delad i castbara inspelningssegment med rekvisitakrav |
| `granskning-ekonomi.md` | Adversariell granskning: moms, kassaflöde, tull, UGC-kostnad, returer |
| `granskning-meta-mekanik.md` | Adversariell granskning: learning phase, ASC vs ABO, creatives per adset, frekvens |
| `namnkonvention-luckor.md` | Vad som saknas i `../naming-convention.md` för UGC-video |

## Två saker som måste avgöras innan systemet körs

**1. Momsfrågan.** Vinstappen räknar break-even på hela ordersumman, men 20 % av den
är moms. Räknas den bort går medianproduktens break-even från 1,85× till 2,36×
(tullen avdragsgill) eller 2,93× (ej avdragsgill). Det är skillnaden mellan att halva
katalogen är annonserbar och att fem produkter är det.

> Frågan till bokföringen: *redovisar butiken utgående moms på svenska
> konsumentordrar, och dras ingående moms av på de 27,50 kronorna i tull?*

Appen ska inte ändras — Axels regel om att strunta i momsen står kvar. Men
**annonsbesluten** måste tas på det momsjusterade talet, och därför uttrycks varje
regel i dokumenten som multiplar av break-even-CPA i stället för fasta kronbelopp.
Systemet fungerar oavsett svaret; bara kronbeloppen flyttar sig.

**2. Momsfloaten är inte fri kassa.** Vid 4 000 kr/dag i spend byggs ~92 000 kr upp
över ett kvartal som tillhör Skatteverket. Kassataket ska räknas på
`bank − ackumulerad utgående moms + ingående moms − 60 dagars fasta kostnader`.

## Största hävstången är inte skalning

Post-purchase-upsell: **+78 % netto vid 10 % attach, +156 % vid 20 %** — noll extra
annonskronor, noll extra tull, noll extra rörelsekapital. Tullen på 27,50 kr per
*order* (inte per styck) gör varje höjning av snittordern mer värd än en höjning av
budgeten, och det är den enda hävstången som blir bättre ju mer som säljs.

## Vad som är antaget

ROAS-avmattningskurvan är modellerad, inte mätt — den flyttar chill-bandets kanter
men inte dess existens. Returgrad 6 %, träffkvot 1 av 5 creatives och fasta kostnader
är antaganden som var och en går att avgöra på under en halvtimme; se sista avsnittet
i `volym-och-skalning.md` för listan och falsifieringstestet per rad.

Kreatörsrollerna är castingunderlag. **Inga personer, priser eller kontaktvägar är
verifierade** — prisnivåerna är marknadsriktmärken att förhandla emot.
