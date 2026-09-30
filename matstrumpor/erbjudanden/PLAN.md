# Matstrumpor — erbjudandetester inför Q4 (2026-09-30)

Axels order: "testa nya offers på matstrumpor innan q4 … så bra revenue som möjligt"
och "testa att sälja 1 pack sushistrumpor, 2 pack och 4 pack osv".

Allt nedan är mätt samma dag: Shopify (`data/baslinje-2026-09-30.md`, 482 ordrar/30 d),
Meta (`node matstrumpor/kor.mjs --hamta`, 14 d) och räknaren
`node matstrumpor/erbjudanden/ekonomi.mjs`.

## Läget i tre tal

| | |
|---|---|
| Ordrar som är exakt 2 lådor för 399 kr | **87 %** (4 lådor 7 %, 1 låda 4 %) |
| Kvar per 2-lådsorder före reklam (Shopifys Cost per item 80,23 kr/låda + tull 32,70 kr/paket) | **206 kr** |
| Reklamkostnad per köp, 14 d (71 565 kr / 353 köp, ROAS 2,09) | **203 kr** |

Snittordern (434 kr, 2,12 lådor) lämnar ~231 kr före reklam. Efter reklam blir det
**~28 kr per order**. Kortavgift och frakt till kund är inte mätta och drar mer.
Varje krona i ordervärdet är alltså nästan ren vinst.

⚠️ Sessionen räknar på Shopifys 80,23 kr/låda, inte konfigens 120,92 kr för 2 lådor
(Axels siffra 21/9). Shopifys tal är nyare (27/9) och stämmer med den andra sessionens
"80 kr per låda". Säger Axel annat: ändra `matstrumpor/konfig.json`.

## Varför fler lådor per paket är hävstången

Tullen (2,9 EUR) är per paket, inte per låda. Varje extra låda i samma paket kostar
bara 80 kr.

| Paket | Pris | Kvar före reklam |
|---|---:|---:|
| 1 låda | 299 kr | 186 kr |
| 1 låda | 399 kr | 286 kr |
| 2 lådor (Köp 1 – få 1) | 399 kr | 206 kr |
| 4 lådor | 699 kr | 345 kr |
| 4 lådor (Köp 2 – få 2) | 798 kr | 444 kr |
| 6 lådor | 1 099 kr | 585 kr |

## Test 1 — Pakettrappan på produktsidan (Axels test, först)

Temat har redan ett eget A/B-system (`assets/ms-ab.js`, som körde `sortval` 18–29/9)
och paketnivåerna är metaobjekt (`ms_paketniva`). Ingen app behövs.

- **A:** som i dag — Köp 1 – få 1 (399 kr, förvald) och Köp 2 – få 2 (798 kr).
- **B:** Axels val av trappa (frågan står i chatten). Rekommendation: lägg bara till
  **1 låda 299 kr** ovanför, allt annat lika. I dag kostar 1 låda lika mycket som 2,
  så ingen köper en. En synlig enkel-låda gör 2-paketet till det smarta valet.
- **Delning:** 50/50 per besökare, stämpeln `AB paket` på ordern.
- **Mäts på:** kronor kvar före reklam per besökare. Inte ordrar, inte AOV ensamt.
- **Tid:** ~100 köp per variant = 3–4 dagar i dagens takt. Klart långt före 24/10.
- ⚠️ Slås av i rätt ordning: A-nivåerna tillbaka till "alla" först, sedan testet av.
  Annars står produktsidan utan paket.

## Test 2 — Ta betalt för frakten på 2 lådor (senare, inte i december)

29 kr frakt på 2 lådor, fri på 4. Ger +29 kr per order men måste inte tappa mer än
~12 % av köpen. Testas efter test 1, med samma A/B-system. Axels beslut.

## Test 3 — Erbjudandet efter köpet (AfterSell) — vänta

Mätt: **59 % betalar med Klarna, 10 % Apple Pay.** Shopifys one-click-sida visas inte
för dem. Bara **~25 % av ordrarna** kan se AfterSell-erbjudandet. Vid 10 % som tackar
ja blir det ~4 kr per order i snitt, mot 35 $/mån. Pakettrappan når alla. Vänta med
AfterSell tills test 1 är avläst.

## Det som inte är ett test men ger mest

Leverantörspriset. 80 → 65 kr per låda ger +30 kr per 2-lådsorder, alltså mer än
dubbelt dagens vinst efter reklam. Fråga också om pris per 4 och 6 lådor i ett paket.

## Status

- ✅ Räknaren `ekonomi.mjs` (15 tester), baslinjen, kundvyn.
- ✅ A/B-avläsningen `matstrumpor/ab/analys.mjs` på main (26 tester).
- ❌ Verktyget som slår på pakettestet: inte byggt — agenterna stoppades av
  kontots utgiftsgräns 2026-09-30. Byggs när Axel valt trappan.
- ❌ Meta per annons och webbresearch (lag, branschtal): stoppade av samma gräns.
