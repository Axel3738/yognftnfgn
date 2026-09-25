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

## Så testas det

**Mekanik.** Shopify post-purchase-sida (efter betalning, före tack-sidan): ett
klick, dras på samma kort, läggs på samma order och går i samma paket. Kräver en
app (AfterSell, ReConvert eller Zipify OCU — alla har inbyggd A/B-delning och
gratis provperiod) och Shopify Payments, som 229 av 239 ordrar betalar med.
Utan app återstår en kod i orderbekräftelsen, och då blir det ett nytt paket
med ny tull — det testet är inte värt att köra.

**Hypotes.** Minst 10 % av Köp 1 Få 1-köparna lägger till fler lådor när
erbjudandet kommer direkt efter köpet. Grund: 98 kunder gjorde det på egen hand
inom sju dagar förra året, till fullpris.

**Armar.** A: +2 lådor för 279 kr (Axels idé). B: +2 lådor för 349 kr. Samma
sida, samma bild, bara priset skiljer. 349-armen behöver bara 62 % av 279-armens
andel för att ge lika många kronor — det är den frågan testet svarar på. Ett
1-låds-alternativ testas i omgång två, inte nu.

**Mått.** Andel som tar tillägget per arm, TB-tillskott per exponerad order i
kronor, avbokningar/återbetalningar på ordrar med tillägg. Baskonverteringen
kan inte påverkas eftersom sidan visas efter betalningen.

**Storlek.** 400–500 exponerade ordrar per arm för att skilja 10 % från 5 %
(2–3 veckor på ~60 ordrar/dag). Ingen dom under 25 tillköp per arm — samma
regel som `/abtest`.

**Beslut.** Den arm som ger flest kronor TB per exponerad order vinner, inte den
med högst andel. Under 5 % andel i båda armarna: erbjudandet är fel, inte priset
— testa +1 låda eller en annan sort (pizza till sushiköparen).

**Ärlighet.** Priset på sidan är priset som dras. Ingen nedräkning som startar
om. Erbjudandet visas en gång.

**Kopplat till break-even.** Ta agentens pris per extra låda i samma paket
innan appen slås på — det avgör om 279 kr ens är tillåtet.

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
