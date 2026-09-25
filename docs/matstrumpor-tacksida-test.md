# Tack-sidan: test av tilläggserbjudande (struktur, 2026-09-25)

Axels idé: samma erbjudande, ännu mer rabatterat, direkt efter köpet. Målet är
att en tiondel av köparna lägger till fler lådor, och på sikt att en tiondel
kommer tillbaka. Räkningen bygger på `docs/matstrumpor-ekonomi.md`.

## Vad siffrorna säger innan testet

Basordern Köp 1 Få 1 à 399 kr har TB 225 kr (break-even-ROAS 1,78, max-CPA 225 kr).
Om 10 % tar tillägget:

| Tillägg på tack-sidan | +intäkt | max-CPA | Break-even-ROAS |
|---|---|---|---|
| +2 lådor för 279 kr (30 % på BOGO) | +7,0 % | 236 kr | 1,81 |
| +2 lådor för 349 kr | +8,7 % | 243 kr | 1,79 |
| +1 låda för 199 kr | +5,0 % | 236 kr | 1,77 |
| +1 låda för 249 kr | +6,2 % | 241 kr | 1,76 |

Två saker att ha klart för sig. **Ett tillägg med lägre marginal än basen höjer
ROAS-talet fast kronorna ökar** — 279 kr för två lådor är 2,51 i egen ratio mot
basens 1,78. Mät därför tack-sidan på max-CPA i kronor (TB per order), inte på
break-even-ROAS. Och **tillägget går i samma paket**: ingen ny tull, marginell
frakt. Kostar tilläggslådan 60 kr i stället för 80 blir 279-varianten neutral
på ROAS och ger +15 kr per order. Agentens pris per extra låda i samma paket är
alltså det tal som avgör hur djup rabatten får vara.

## Evolve-botens svar (2026-09-25), kondenserat

Samma produkt slår kompletterande produkter post-purchase. AfterSell på nuvarande
plan, Shopify Payments krävs (229 av 239 ordrar har det), show-up 50–60 %.
Rabattdjup: börja på 20 %, testa 15 mot 30; framingen väger lika tungt som
procenten, och en sann, tidsbunden anledning höjer LTV i stället för att urholka.
Upsell 1 ska vara 50–70 % av ordervärdet (200–280 kr vid 399), upsell 2 30–50 %
(120–200 kr). Kill/scale räknas om på blandad marginal, CPA eller ROAS kvittar
bara det kommer ur marginalen. Ingen i källorna vet om tilläggets intäkt går in i
Metas köpvärde. Minst 1 500 exponeringar per test, en variabel i taget, tratten
testas varje vecka. Om återaktivering av julköpare fanns inget.

## Testet, slutgiltig design

**Erbjudandet:** två lådor till, i samma paket, ett klick på samma kort. Det är
"ett Köp 1 Få 1 till", samma struktur som duplicerar rakt av till andra marknader.
**A = 319 kr** (20 % på 399, botens startpunkt). **B = 279 kr** (30 %, Axels
idé). Samma text, bara priset. Inte +1 låda (samma produkt i samma paketstorlek
är renare, och 199 kr ligger i botten av upsell 1-spannet). Inte 349 kr (87 %
av ordervärdet, över spannet).

| Arm | TB per tillägg (låda 80 kr) | Ratio | TB per tillägg (låda 60 kr) | Ratio |
|---|---|---|---|---|
| A 319 kr | 150 kr | 2,13 | 190 kr | 1,68 |
| B 279 kr | 111 kr | 2,51 | 151 kr | 1,84 |

B måste konvertera **35 % bättre** än A för att ge lika många kronor (26 % om
tilläggslådan kostar 60 kr). Tar 10 % av de exponerade tillägget ger A +15 kr
och B +11 kr per exponerad order. Med show-up 55 % är det 5,5 % av alla ordrar,
alltså +4 % intäkt, inte +7 %. Sju procent kräver 10 % av alla ordrar.

**Mekanik.** AfterSell, post-purchase, appens egen 50/50-delning. ~30
exponeringar per dag på dagens 55 ordrar. 1 500 exponeringar (botens golv) är
~7 veckor i dagens takt; 400 per arm räcker för att skilja 10 % från 5 % och
tar ~4 veckor. Snabbare när julen drar igång. Ingen dom under 25 tillköp per arm.

**Mått.** Andel som tar tillägget per arm. TB i kronor per exponerad order (det
som avgör). Avbokningar och återbetalningar på ordrar med tillägg, från dag 1.
Metas köpvärde mot Shopify per dag under dag 1–3: skiljer sig talen med
tilläggens intäkt går de inte in i pixeln, och då styrs kontot på CPA.

**Kontoregler under testet.** Max-CPA = TB per order inklusive tillägg
= 225 kr + andel × TB per tillägg. Vid 10 % tillköp: **240 kr (A)** eller
**236 kr (B)**. Kill under max-CPA, rangordning på (max-CPA − CPA) × köp som
vanligt. Break-even-ROAS blir missvisande så länge pixeln inte ser tillägget.

**Ärlighet.** Priset på sidan är priset som dras. Ingen nedräkning. Visas en
gång. Anledningen är sann: bara i den här ordern, innan paketet packas.

**Innan appen slås på.** Agentens pris för extra lådor i samma paket (action
item 1 i ekonomidokumentet). Vid 80 kr per låda är B:s ratio 2,51 mot basens
1,78, alltså ett rent kronbeslut; vid 60 kr är A nästan neutral på ROAS.

**Omgång två, efter vinnaren.** Downsell "+1 låda 179 kr" (upsell 2-spannet
120–200 kr) till dem som avböjer. Sedan 15 % mot vinnaren, sedan framing.

## Tio procent som kommer tillbaka

I dag: 3,2 % på tolv månader, 2,5 % av senaste månadens ordrar. Tre spår:

1. Tack-sidan fångar dem som i dag går tillbaka själva inom en vecka (98 st
   förra året) — samma paket, ingen ny tull.
2. Julbasen: ~3 000 kunder från december–februari. Klaviyo-utskick + Meta-
   målgrupp i november med en ny sort som skäl ("förra året sushi, i år pizza").
   10 % av 3 000 är 300 ordrar.
3. Presentkort (150 kr) som tillägg för den som har fler att ge till.

## Fråga till Evolve-boten (klistra in)

```
Context: Swedish DTC gift brand (sushi-box socks). Core offer is Buy 1 Get 1: 2 boxes for 399 SEK (~$37), free shipping, 84% of orders take exactly that, 11% take Buy 2 Get 2 (798 SEK). Landed COGS ~80 SEK/box incl. shipping from China via YunExpress and the new EU €3 flat duty per parcel. Break-even ROAS ~1.75, running 10k SEK/day at ROAS ~2.2, ~60 orders/day, 96% pay via Shopify Payments, not Shopify Plus. Repeat rate is 3% in 12 months; 80% of repeats happen within 7 days (customers come back and place a second full-price order).

I want a post-purchase (one-click, same order, same parcel) offer: the same 2 boxes at ~30% off (279 SEK). Questions:
1. What take rates do course members see on post-purchase "more of the same" offers for a gift product, and how does take rate move with discount depth (10% / 20% / 30%)? Is 30% needed or does 15% convert nearly as well?
2. Would you offer +1 box or +2 boxes post-purchase to a BOGO buyer? Any data on which lifts contribution more?
3. Since the add-on has lower margin than the base offer, it raises blended break-even ROAS while adding profit per order. How do you set kill/scale rules for the ad account in that situation — max CPA in currency instead of ROAS?
4. Which post-purchase app do members use on a non-Plus Shopify store with built-in A/B testing, and does the upsell revenue get included in the Meta purchase value event?
5. Any downside you've seen: refund rates on upsold orders, or customers learning to wait for the post-purchase deal?
6. For the repeat side: what's worked for gift brands to get last year's Christmas buyers (3,000 of them) to buy again — email/SMS timing, new-variant angle, gift cards?
```

## Texten på sidan (skriven 2026-09-25 enligt `docs/copy-regler.md`, alla fyra tester ✅)

`{{pris}}`/`{{rabatt}}` fylls med **319 kr / 20 %** i arm A och **279 kr / 30 %**
i arm B. Samma text i båda armarna. Rekommenderad variant är V2: givarvinkeln
står i rubriken och "dubbeltitt" är ett av VOC:ns tre kärndesires.

**V2 — Redo att ge bort** (kör denna)
Rubrik: *Två presenter till, redo att ge bort*
Underrad: *Två lådor till för {{pris}} kr i samma paket — så nästa dubbeltitt finns redan hemma. {{rabatt}} rabatt, bara i den här beställningen.*
Knapp: *Ja, lägg till – {{pris}} kr*
Avböj: *Nej tack, gå vidare*

**V1 — Lurar ögat** (reserv)
Rubrik: *Två lådor till för {{pris}} kr*
Underrad: *Fler lådor som lurar ögat, redo hemma. De kommer i samma paket, på samma kort — bara innan det packas. {{rabatt}} rabatt.*
Knapp: *Lägg till – {{pris}} kr* · Avböj: *Nej tack, fortsätt till bekräftelsen*

**V3 — Innan paketet packas** (reserv, framing-testet i omgång två)
Rubrik: *Två till att ge bort, innan paketet packas*
Underrad: *Två lådor till för {{pris}} kr, i samma paket och på samma kort — ett klick räcker. {{rabatt}} rabatt.*
Knapp: *Lägg till nu – {{pris}} kr* · Avböj: *Nej tack, till bekräftelsen*

⚠️ "Bara i den här beställningen" är sant bara så länge samma erbjudande inte
skickas i orderbekräftelsen eller ett Klaviyo-flöde efteråt. Gör det inte.

## Så sätts det upp i AfterSell (Axel, ~20 minuter)

1. Installera AfterSell från App Store, välj post-purchase (inte thank-you-page-widgeten).
2. Ny funnel: trigger = ordrar som innehåller Sushi-Strumpor. Erbjudande =
   Sushi-Strumpor 5-par, antal 2, pris 319 kr. Text enligt V2 med 319 kr / 20 %.
3. Duplicera funneln som arm B: pris 279 kr, text med 279 kr / 30 %. Slå på
   appens split test 50/50 mellan de två.
4. Visa en gång, ingen timer, ingen downsell i omgång ett.
5. Säg till när det är live, så jämför jag Metas köpvärde mot Shopify dag 1–3 och
   läser av testet efter 400 exponeringar per arm (`node theme-matstrumpor/tools/ekonomi.mjs`
   plus ordrarnas post-purchase-rader).
