# /logga – Logga launchade creatives mot kvoten

Argument: `$ARGUMENTS` — produkt-id + antal (+ ev. datum).
Exempel: `/logga motorholjet 4`

En creative räknas när den är **live eller schemalagd i Ads Manager** — inte när briefen är skriven.

1. Verifiera i Ads Manager (MagiBorsten `1867947880635861`) att annonserna finns (aktiva/schemalagda). Lista namnen och kontrollera naming-strukturen.
2. `node pipeline/quota.mjs log <produkt-id> <antal>`
3. `node pipeline/quota.mjs` — visa nya plus/minus-läget.
4. Committa och pusha `products/products.json` ("Logga N creatives för <produkt>").

## DEFINITION OF DONE
- [ ] Annonserna verifierade i kontot
- [ ] Loggat i kvotskriptet
- [ ] Nytt läge visat
- [ ] Pushad
