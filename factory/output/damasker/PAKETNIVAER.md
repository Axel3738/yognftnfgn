# DryTrek — paketnivåer A/B

Källans nivåer är LÄSTA, inte gissade: `kalla-kaching-paket.json` i den här
mappen är Kaching-widgetens egen konfig, ordagrant ur källsidans HTML
(`<script class="kaching-bundles-deal-block-settings">`, avläst 2026-09-09).

Pris 389 kr/par, jämförpris 649 kr. `useProductCompareAtPrice: true`,
`priceRounding: false` — inga ören avrundas bort.

## Paket A — källans nivåer (kontroll)

Exakt vad Bäverbutiken kör i dag. Rabatterna är procent på radtotalen.

| Nivå | Antal | Rabatt | Kassapris | Per par | Badge |
|---|---|---|---|---|---|
| A1 | 1 par | 0 % | 389,00 kr | 389,00 kr | — |
| **A2** | **2 par** | **15 %** | **661,30 kr** | **330,65 kr** | **Mest populär ◀ förvald** |
| A3 | 3 par | 20 % | 933,60 kr | 311,20 kr | — |

Källan har redan mitten förvald (`preselectedDealBarId: "st2b"`), vilket
stämmer med fabriksregeln ⌈n/2⌉ = 2. Ändra inte.

## Paket B — testoffer (Q4-ramverket)

Testar "köp mer, få mer" mot "köp mer, betala mindre": grundare rabatt,
men bonusprodukten gratis. Bonusen är reflexband (149 kr), vald för att
produktsidan redan säljer "syns i terrängen" — bonusen förstärker ett
löfte sidan gör, i stället för att införa ett nytt.

Antalsregeln (Axel 2026-09-08): gratis-antalet följer paketantalet.

| Nivå | Antal | Rabatt | Kassapris | Per par | Bonus |
|---|---|---|---|---|---|
| B1 | 1 par | 0 % | 389,00 kr | 389,00 kr | Kryssruta: reflexband 149 kr (fullpris) |
| **B2** | **2 par** | **10 %** | **700,20 kr** | **350,10 kr** | **2 reflexband gratis (värde 298 kr) ◀ förvald** |
| B3 | 3 par | 15 % | 991,95 kr | 330,65 kr | 3 reflexband gratis (värde 447 kr) |

Nivå 1:s kryssruta är ALLTID fullpris. Rabatteras den blir "värde 298 kr"
på nivå 2 en lögn, och hela paketstegen tappar trovärdighet.

## Att göra när butiken finns

1. Metaobjekten `ms_paketniva` skapas med translatable-capability PÅ
   från start — annars går de inte att översätta till nb i efterhand.
2. Rabattkoderna räknas så kassapriset stämmer på öret, inklusive
   bonusens värde.
3. NOK-nivåer räknas om separat innan norska annonser. SEK-belopp räknar
   fel i NOK.

## Öppen fråga

Bonusprodukten är **vald men inte sourcad**. `offer.bonus_produkt.handle`
i produktfilen är tom, och utan den kan `byggKorgUpsell` inte rita
korg-upsellen. Leverantör och inköpspris på reflexbanden saknas i repot.
