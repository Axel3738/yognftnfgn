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

---

## Tullen (verifierad 2026-09-25)

Sedan 1 juli 2026 tar EU ut en **fast tull på 3 euro per varuslag och försändelse**
på paket under 150 euro från länder utanför EU (rådets förordning (EU) 2026/382,
gäller till 1 juli 2028). Det är den "tull på 2,7–2,8 euro" som agenten
fakturerar, ca 30–33 kr per paket. Källor: [EU-kommissionen](https://taxation-customs.ec.europa.eu/news/guidance-and-legal-text-temporary-flat-fee-low-value-imports-which-will-apply-until-1-july-2028-2026-06-08_en),
[Avalara](https://www.avalara.com/blog/en/europe/2025/11/eu-end-150-customs-duty-exemption-2026.html),
[vatcalc](https://www.vatcalc.com/eu/eu-e3-levy-low-value-e-commerce-import-package-july-2026/).

Tre konsekvenser:

1. **Den går inte att förhandla bort** — den är lag, inte agentens påslag. Det
   som går att kontrollera är att agenten inte lägger marginal på den.
2. **Den är per paket, inte per låda.** Fyra lådor i ett paket betalar samma 3 euro
   som två. Köp 2 Få 2 bär alltså hälften så mycket tull per låda.
3. **Per varuslag.** Deklareras ätpinnarna som en egen varupost kan de utlösa
   ytterligare 3 euro per paket. Kontrollera agentens faktura.

Enda vägen runt den per paket är bulkimport till Sverige (vanlig tullsats på
fakturavärdet i stället för 3 euro per paket) plus svensk 3PL och inrikesfrakt.
Det är ett projekt för efter julen, men offerterna kan tas in nu.

## Vägen till 1,51 utan att röra 399 kr

En kostnadssänkning väger ~2,5× mer än en intäktsökning av samma storlek, för
intäkten höjer även täljaren. Vid 399 kr måste kostnaden per order ner från 174
till 135 kr (−39 kr) om allt tas på kostnadssidan.

| Kombination | Break-even |
|---|---|
| Lådan 80 → 60 kr, inget annat | 1,51 |
| Lådan 80 → 65 kr + 29 kr frakt på Köp 1 Få 1 | 1,51 |
| Lådan 80 → 70 kr + 39 kr frakt på Köp 1 Få 1 | 1,55 |
| Lådan 80 → 70 kr + 29 kr frakt + tillval "+1 låda 249 kr" som 10 % tar | ~1,54 |

Action items i ordning: (1) mejla agenten: uppdelning av 12,3 USD i produkt,
pack, frakt och tull; pris per **paket** med 2/3/4 lådor; volympris vid 5 000 /
10 000 / 20 000 lådor (fjolåret 15 000, nu ~130 lådor/dag); om ätpinnarna
deklareras separat. Mål: 65–70 kr per låda landat. (2) Fraktavgift 29–39 kr på
Köp 1 Få 1, fri frakt kvar på Köp 2 Få 2 — Shopify → Inställningar → Frakt.
(3) Ätpinnar: ett par per order i stället för ett per låda, om de kostar mer än
~3 kr paret. (4) Inköpspris på pizza/hamburgare/donut i Shopify. (5) Revisorn:
momsfrågan, se ovan. (6) Offert från en svensk 3PL för jämförelse efter jul.

## Återköp (12 månader bakåt, Shopify)

3 658 kunder, 3 792 ordrar. **118 kunder (3,2 %) köpte två gånger**, 98 av
återköpen kom inom sju dagar (kunden gick tillbaka och la en order till, med
nytt paket och ny tull), 17 inom 7–30 dagar, 19 senare. Av de senaste 30
dagarnas 239 ordrar kom 6 från kunder som fanns före 26 augusti. Basen från
förra julen: 1 617 ordrar i december, 799 i januari, 655 i februari.
