# Matstrumpor — ekonomi och break-even

Verifierat 2026-09-25 ur Shopify (matstrumpor.se, `1r46tp-qx`) och Meta-kontot
`nya kungen` (730973156224390). Ersätter "COGS saknas"-varningen i
`docs/matstrumpor-dna.md`. Kör om siffrorna med `theme-matstrumpor/tools/ekonomi.mjs`.

## Kostnadsstrukturen (källa per rad)

| Post | Värde | Källa |
|---|---|---|
| Sushi 5-par, inköp per låda | 80,23 kr | Shopify, kostnad per artikel på varianten |
| Sushi 3-par, inköp per låda | 67,51 kr | Shopify |
| Två lådor levererade till Sverige | 12,3 USD + 2,7 EUR tull ≈ 157 kr | Axel 2026-09-17 (`docs/matstrumpor-influencers-q4-2026-09-17.md`) |
| Pizza / hamburgare / donut | **saknar inköpspris** i Shopify | antas = sushi 5-par i skriptet |
| Ätpinnar (gåva, ~2,1 par per order) | **okänt** | ingår kanske i 157 kr — fråga Axel |
| Utfrakt | ingår i lådpriset: alla ordrar skickas med **YunExpress** | fulfillments i Shopify |
| Frakt kunden betalar | 0 kr på 239 av 239 ordrar | Shopify |
| Betalavgift | ~2,7 % + 3 kr (antagande, Shopify Payments 229 av 239 ordrar, PayPal 10) | ej verifierat |
| Moms | **0 kr på alla ordrar** — butiken tar inte ut moms | Shopify |
| Returer/återbetalningar | 0 kr på 241 ordrar, 90 dagar | Shopify |
| Shopify-plan | Grow (inte Plus) | Shopify |

Shopifys 80,23 kr per låda och Axels 157 kr för två lådor är samma tal. Eftersom
allt skickas med YunExpress är lådpriset alltså **landat: produkt + frakt till
kunden + tull.** Det finns ingen separat fraktkostnad att jaga.

## Break-even-ROAS

Break-even-ROAS = intäkt / (intäkt − lådor − betalavgift). Räknat på de 239
ordrarna 2026-08-26 → 09-25 (107 198 kr, snittorder 449 kr):

| Nivå | Ordrar | TB per order | Break-even |
|---|---|---|---|
| Alla ordrar (blandat) | 239 | 258 kr | **1,74** |
| Köp 1 Få 1, sushi 5-par 399 kr | 193 | 231–234 kr | 1,74–1,78 |
| Köp 2 Få 2, 798 kr | 26 | 453–459 kr | 1,75–1,76 |
| Donut Köp 1 Få 1, 299 kr | 7 | 183 kr | 1,95 (om lådan kostar som sushi) |

Axels "typ 1,7" stämmer alltså — **på två villkor**: att ingen moms ska
redovisas på försäljningen, och att ätpinnarna ingår i lådpriset. Ska 25 % moms
betalas på 399 kr är break-even **2,75**. Kostar pinnarna 5–10 kr per par utöver
lådan är den 1,86–1,95. Båda frågorna är Axels att svara på — gissa inte.

Alla BOGO-nivåer har samma break-even, för rabatten är 50 % på varje nivå och
lådpriset är per låda. Att flytta mixen mot Köp 2 Få 2 sänker därför **inte**
break-even i sig — bara om fyra lådor i ett paket kostar mindre än 2 × två lådor.

## Vad som krävs för 1,5 utan att röra 399-lappen

| Åtgärd (Köp 1 Få 1 à 399 kr) | TB/order | Break-even |
|---|---|---|
| I dag | 225 kr | 1,78 |
| Lådan −10 kr (70 kr) | 245 kr | 1,63 |
| Lådan −20 kr (60 kr) | 265 kr | 1,51 |
| Fraktavgift 29 kr | 253 kr | 1,69 |
| Fraktavgift 49 kr | 272 kr | 1,64 |
| Lådan −10 kr + frakt 39 kr | 283 kr | 1,55 |
| Lådan −15 kr + frakt 29 kr | 283 kr | 1,51 |
| Tillval i kassan +149 kr som kostar 20 kr | 350 kr | 1,57 |
| Pris 449 kr (referens) | 273 kr | 1,64 |
| Pris 499 kr (referens) | 322 kr | 1,55 |

Lådpriset som **ensamt** ger 1,50 är 59,6 kr, alltså −26 %. Inte ens 499 kr når
1,5 på egen hand. Vägen dit är en kombination: förhandlat lådpris **plus** en
intäkt per order som inte kostar en låda (fraktavgift eller betalt tillval).

## Meta-kontot i samma fönster

| Period | Spend | Köp | Intäkt (Meta) | ROAS | CPA |
|---|---|---|---|---|---|
| 30 dagar (08-26 → 09-24) | 71 411 kr | 210 | 97 437 kr | 1,36 | 340 kr |
| 7 dagar (09-18 → 09-24) | 20 662 kr | 99 | 43 778 kr | 2,12 | 209 kr |
| 2026-09-23 | 3 684 kr | 28 | 12 103 kr | 3,29 | 132 kr |
| 2026-09-24 | 11 471 kr | 57 | 25 491 kr | 2,22 | 201 kr |

Budgeten gick från ~1 000 kr/dag till 11 471 kr den 24 september. Det dygnet
gav Shopify 59 ordrar och 26 184 kr; TB ~15 300 kr minus annons 11 471 kr =
**~3 800 kr kvar** före pinnar, moms och fasta kostnader. 30-dagarsfönstret som
helhet ligger under break-even (1,36 mot 1,74). UK/AU/US-kampanjerna låg på
0,76–1,07 i samma fönster.

## Öppna frågor till Axel (ändrar talen ovan)

1. Ska moms redovisas på försäljningen? Shopify tar inte ut någon.
2. Vad kostar ätpinnarna, och ingår de i 12,3 USD-priset?
3. Vad kostar pizza-, hamburgare- och donutlådan? Lägg in som kostnad per artikel i Shopify.
4. Vad tar agenten för fyra lådor i **ett** paket? Är det mindre än 2 × 12,3 USD sjunker Köp 2 Få 2:s break-even under Köp 1 Få 1:s.
5. Hanteras reklamationer utanför Shopify (ersättningslådor via mejl)? Shopify visar noll returer på 90 dagar.

## Åtkomst

Appen under `SHOPIFY_*_MATSTRUMPOR` har bara produkter öppna. Ordrar och
rapporter kräver appen `1r46tp_qx`, och `SHOPIFY_SHOP_1r46tp_qx` saknades i
environmentet 2026-09-25 (bara id och hemlighet fanns). Kör därför:

```bash
SHOPIFY_SHOP_MATSTRUMPOR= SHOPIFY_SHOP_1r46tp_qx=1r46tp-qx.myshopify.com node theme-matstrumpor/tools/ekonomi.mjs
```
