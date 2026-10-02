# Bilaga till sajtgranskningen 2026-10-01

Mätdata bakom `SAJT-2026-10-01.md`, kopierad som granskarna skrev den. Sökvägar som `V2/…`, `matningar/…` och `bilder/…` pekar på granskningens arbetsfiler i sessionens scratchpad och finns inte i repot. Skripten för att pröva köpknappen igen ligger i `kontroll-2026-10-01/` (fynd S-001).

- **K-01** — köpknappen på långsamt mobilnät, andra prövningen (V2), med alla 31 körningar.
- **Spoks-länkarna** — andra prövningen (V3).
- **Kassan** — 25 vyer, betalsätten och fraktzonerna (granskare C).
- **Domänerna** — kampanjlänkarna, .no, .com, rötterna, mejlknappen, certifikaten och svarstiden från riktiga länder (granskare A).

## K-01: köpknappen på långsamt mobilnät (andra prövningen, V2)

Mätt 2026-10-01 18:18–18:39 UTC. Butiken stod utan last: 0 svar med 429 och ingen botutmaning på 31 körningar.
Chromium var i mobilläge (390 × 844, iPhone-UA), pixeln blockerad, och varje körning var en ny kund utan kakor.
Strypningen gjordes med CDP. Skriptet skrev aldrig något i kassan och tryckte aldrig betala.

- **A** = 150 ms, 1,6 Mbit/s ned, 750 kbit/s upp, CPU 4×. Det är samma profil som PageSpeed/Lighthouse använder för mobil, alltså ingen extremprofil.
- **B** = 100 ms, 4 Mbit/s ned, 3 Mbit/s upp, CPU 4×.
- **Vanlig kund:** väntar tills korten syns, läser i 3 s, väljer "Köp 2 – få 2", väntar 1 s och trycker köpknappen. När sidolådan öppnas trycker kunden "Kassa" efter cirka 2 s.
- **Snabb kund:** väljer "Köp 2 – få 2" och trycker köpknappen så fort den går att klicka.
- **Två banor parallellt:** SE+DK och DE+JP, 22 s mellan körningarna i varje bana. Maskinen hade 4 kärnor och en belastning på cirka 6. Därför gjordes tre kontrollkörningar ensamma (Z01–Z03, belastning cirka 2). De gav samma fönster (4464/4410 ms på A och 1787 ms på B) och samma utfall, så tiderna är inte uppblåsta av mina egna banor.

### Domen: K-01 BEKRÄFTAT 🔴

Men felet är ett annat än observationerna beskrev. Det är inte sidolådan eller en tom korg. Det är **köpknappen och paketvalet innan paketskriptet tagit över.**

| | A (PageSpeeds mobilprofil) | B (4 Mbit/s) |
|---|---|---|
| Fönster: knappen klickbar → paketskriptet kopplat | **4,3–4,9 s** (median 4,5 s) | 1,4–2,6 s (median 1,8 s) |
| Vanlig kund, "Köp 2 – få 2" | **10 av 10 fel**: valet nollställdes till "Köp 1 – få 1" (2 lådor i stället för 4) | 7 av 9 rätt i kassan. 2 av 9 (båda SE) tappade kortet i A/B-bytet (V2-01). 1 av de 7 (JP) visade fullpris ¥36,240 på korgsidan |
| Snabb kund | **8 av 8**: 1 låda till fullpris, ingen gratislåda, inga ätpinnar, ingen kod | **4 av 4**: samma |
| Tom korg | 0 av 31 | |
| Sidolådan med fullpris (öppen) | 0 av 14 lådor | |
| Kassaknappen i lådan → kassan | 14 av 14, kassan stämde med korgen i 29 av 29 | |
| Reservvägen (koden fäste inte → omladdning till korgsidan) | 1 av 10 (DK) | 2 av 7 (DE rätt, **JP fullpris på korgsidan**) |

#### Orsaken (live-temat `207180890451`, `assets/ms-paket.js` 2026-09-30T17:30:35Z)

1. **Köpknappen är inte låst.** `ms-paket.js` laddas med `defer` efter `global.js` och `ms-cro.js`, och körs alltså först när hela sidan tolkats. Paketskriptet laddades ned klart cirka 7,2 s in på A (X01: begäran 1,96 s → klar 7,23 s, kopplat 7,41 s). Korten och köpknappen kommer färdiga från servern och går att trycka från cirka 2,7 s. Formuläret har inget kvantitetsfält förrän skriptet lagt in det. Ett tryck går därför till temats vanliga `POST /cart/add` med 1 vara, och kunden hamnar på korgsidan med 1 låda till fullpris.
2. **Valet nollställs när skriptet kopplar sig.** Det är ett nytt fel och det inträffar varje gång. Den synliga kortgruppen och en alltid gömd kortgrupp (`sortval:b`, mixläget, som inte finns i A/B-inställningen) har samma radionamn, `ms-paket-template--32128053150035__main`. Vid `customElements.define` uppgraderas elementen i dokumentordning. Den gömda gruppen kommer först, och dess `connectedCallback` sätter `inputs[0].checked = true` utan att kolla `inaktiv()`. Det avmarkerar kundens SUSHI-K2F2, och den synliga gruppen faller tillbaka på sitt första kort, K1F1. **Bevisat med skriptet inhållet** tills valet gjorts, i SE, DE och JP (`aterstall-*.json`, bilderna `aterstall-DE-1-valt-K2F2.png` → `aterstall-DE-2-efter-skriptet.png`). Kunden ser markeringen hoppa tillbaka, och priset byter samtidigt format ("€89,80" → "44,90 €").
3. **Koden läggs före varorna.** Live-filen gör `fetch(discount/<kod>?redirect=cart.js)` och sedan `cart/add.js`. Fabrikens källa (`factory/tema/assets/ms-paket.js` rad 355–371) gör tvärtom, med mätningen "koden först → discount_codes [] … redirect". I 3 av 17 paketköp fäste koden inte, och `kontrollera()` skickade kunden till `<mapp>discount/<kod>?redirect=<mapp>cart`. I JP (Y14) saknade korgen ändå koden efter omladdningen: korgsidan visade 見積もり合計 ¥36,240 JPY, och kassan gav ¥15,960. Vid klicket gick tre anrop samtidigt: A/B-skriptets `POST <mapp>cart/update.js`, dess `sendBeacon('/cart/update.js')` och `discount/`. Under reservvägen gick dessutom en apps `GET <mapp>cart/update.js?attributes[host]…&attributes[auid]…` samtidigt (Y14: 3322–3870 ms mot discount 3108–3862 ms). Att samtidiga korgskrivningar tappar koden är en trolig orsak, men den är **inte bevisad**.

#### Hur stor andel av riktiga kunder?

Mekanismerna 1 och 2 inträffar varje gång för den som väljer eller trycker inom fönstret. Hur många riktiga kunder som gör det går inte att mäta härifrån. Det beror på hur fort de rullar ned till korten (de ligger under bilden och titeln på mobilen) och hur fort deras nät och telefon är. På PageSpeeds mobilprofil är fönstret 4,5 s, och en kund från en annons som vet vad den vill ha hinner välja på den tiden. På 4 Mbit/s är fönstret 1,8 s, och där klarade sig alla vanliga kunder utom i Sverige.

#### Förslag (byggarsessionen rättar efter Axels ok)

1. Lås köpknappen i HTML:en (`disabled` + `aria-busy`) och låt `kopplaKnapp()` låsa upp den.
2. Ge varje kortgrupp ett eget radionamn, och låt `connectedCallback` låta `checked` vara när elementet är `inaktiv()`.
3. Ta fabrikens ordning: varorna först, sedan koden, sedan lådan ur ett eget sektionsanrop.
4. Kör om `V2/kod/prova.mjs`, `aterstall.mjs` och `flip.mjs` på A och B efteråt.

### Nytt fynd V2-01 🟡: A/B-testet "paket" byter kort framför svenska kunder

En svensk kund som lottats till variant b (50/50, `{"id":"paket","weights":[50,50],"active":true}`) ser först variant a:s kort, "Köp 1 – Få 1 399 kr" och "Köp 2 – Få 2 798 kr". Vid DOMContentLoaded byts de mot b:s kort, med "2 lådor 499 kr" förvalt.

- **Hur länge:** på A utan annan last syns a:s kort 2,4–8,4 s (6 s). Med annan last syns de 3,9–15,1 s (A) och 4,6–12,0 s (B).
- **Utfall i mina körningar:** båda vanliga svenska kunderna på B (X05, X13) tappade kortet de skulle välja.
- **Orsaken:** `ms-ab.js` är ett synkront skript tidigt i HTML:en (tecken 36 706, korten vid 244 969). Det kör `applyVisibility()` innan korten finns, och igen först vid DOMContentLoaded.
- **Var:** bara Sverige, för DE, DK och JP har inget paket-test i sidan. Det stoppar inte fredagens kampanjer.
- **Förslag:** CSS på `html[data-ms-ab-paket]`, som skriptet sätter direkt när det körs.
- **Fråga till Axel:** ska pristestet 399 mot 499 kr för två lådor fortsätta?

### Observationerna

| Id | Dom | Ny färg | Varför |
|---|---|---|---|
| B1a-08 | BEKRÄFTAT | 🔴 | Köpknappen före skriptet: 1 låda till fullpris i 12 av 12. Fullpris innan koden satt: 1 gång (JP-korgsidan). Ingår i K-01 |
| B2-04 | BEKRÄFTAT | 🔴 | DE 3 av 3 och alla språk 12 av 12: en låda till 44,90 € utan gratislåda. Ingår i K-01 |
| B1b-09 | SÄNKT | 🟡 | Reservvägen finns (3 av 17), men kassaknappen i lådan gick till kassan 14 av 14 och korgen tömdes aldrig. Kassan stämde i 29 av 29 |
| B1b-10 | BEKRÄFTAT | 🔴 | Bekräftat. "Någon sekund" stämmer inte på PageSpeeds mobilprofil (4,3–4,9 s). Ingår i K-01 |
| B3-17 | STRUKET | – | Ingen tom korg på 31 körningar utan last. IT inte mätt på nytt (samma kod) |
| C-10 | BEKRÄFTAT | 🟡 | Samma sak i JP: korgsidan fullpris ¥36,240, kassan ¥15,960. PT inte mätt på nytt |
| B4-kim | STRUKET | – | JP 8 körningar utan last, ingen tom korg |

### Kan inte mätas härifrån

- **Andelen riktiga kunder som väljer eller trycker inom fönstret:** kräver data från riktiga besök (Shopify-analys, ordrar med 1 låda utan kod från mobil).
- **Varför koden inte fäster ibland:** de samtidiga korgskrivningarna är troliga men inte bevisade. Shopifys sida syns inte härifrån.
- **IT och PT:** prövades inte på nytt. Samma kod och samma fönster gäller troligen alla språk.

### Tabellen: körning × utfall (31 körningar)

Tider i ms från sidans start (sidans egen klocka). Fönster = knappen klickbar → paketskriptet kopplat. "–" betyder inte uppmätt, för skriptet hade inte kopplat sig före klicket.

| Körning | UTC | Land | Kund | Nät | Knapp klickbar (ms) | Skriptet kopplat (ms) | Fönster (ms) | Valt (ms) | Köpklick (ms) | Valt kort vid köpklick | Sidolåda | Kassan | Korgen till sist | Utfall |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| X03-SE-F-A | 18:21:26 | SE | snabb kund | A | 2863 | – | – | 3654 | 3885 | SUSHI-K2F2 | ingen låda: temats vanliga formulär, POST /cart/add → korgsidan | kassan: 399,00 kr | 1 st, 39900 SEK, ingen kod | EN LÅDA, fullpris, ingen gratislåda, inga ätpinnar |
| X07-SE-F-B | 18:26:16 | SE | snabb kund | B | 2273 | – | – | 3106 | 3349 | SUSHI-K2F2 | ingen låda: temats vanliga formulär, POST /cart/add → korgsidan | kassan: 399,00 kr | 1 st, 39900 SEK, ingen kod | EN LÅDA, fullpris, ingen gratislåda, inga ätpinnar |
| X11-SE-F-A | 18:30:49 | SE | snabb kund | A | 3128 | – | – | 4078 | 4369 | SUSHI-K2F2 | ingen låda: temats vanliga formulär, POST /cart/add → korgsidan | kassan: 399,00 kr | 1 st, 39900 SEK, ingen kod | EN LÅDA, fullpris, ingen gratislåda, inga ätpinnar |
| X01-SE-N-A | 18:18:59 | SE | vanlig kund | A | 2734 | 7409 | 4675 | 6327 | 7624 | SUSHI-K1F1 | 399 SEK efter 3443 ms | kassan: 898,00 kr → 399,00 kr | 4 st, 39900 SEK, SUSHI-K1F1 | VALET NOLLSTÄLLT: fick "Köp 1 – få 1" (2 lådor + 2 ätpinnar) |
| X05-SE-N-B | 18:23:50 | SE | vanlig kund | B | – | – | – | – | – | – | - | - | 0 st, 0 SEK, ingen kod | kortet "Köp 2 – få 2" försvann (A/B-bytet i Sverige) |
| X09-SE-N-A | 18:28:04 | SE | vanlig kund | A | 3247 | 8167 | 4920 | 7181 | 9176 | SUSHI-K1F1 | 399 SEK efter 5314 ms | kassan: 898,00 kr → 399,00 kr | 4 st, 39900 SEK, SUSHI-K1F1 | VALET NOLLSTÄLLT: fick "Köp 1 – få 1" (2 lådor + 2 ätpinnar) |
| X13-SE-N-B | 18:33:17 | SE | vanlig kund | B | – | – | – | – | – | – | - | - | 0 st, 0 SEK, ingen kod | kortet "Köp 2 – få 2" försvann (A/B-bytet i Sverige) |
| X04-DK-F-A | 18:22:37 | DK | snabb kund | A | 2669 | – | – | 3400 | 3687 | SUSHI-K2F2 | ingen låda: temats vanliga formulär, POST /cart/add → korgsidan | kassan: 343,00 kr. | 1 st, 34300 DKK, ingen kod | EN LÅDA, fullpris, ingen gratislåda, inga ätpinnar |
| X08-DK-F-B | 18:27:08 | DK | snabb kund | B | 2259 | – | – | 3217 | 3738 | SUSHI-K2F2 | ingen låda: temats vanliga formulär, POST /cart/add → korgsidan | kassan: 343,00 kr. | 1 st, 34300 DKK, ingen kod | EN LÅDA, fullpris, ingen gratislåda, inga ätpinnar |
| X12-DK-F-A | 18:32:03 | DK | snabb kund | A | 3494 | – | – | 4592 | 4857 | SUSHI-K2F2 | ingen låda: temats vanliga formulär, POST /cart/add → korgsidan | kassan: 343,00 kr. | 1 st, 34300 DKK, ingen kod | EN LÅDA, fullpris, ingen gratislåda, inga ätpinnar |
| X02-DK-N-A | 18:20:13 | DK | vanlig kund | A | 2803 | – | – | 5962 | 7371 | SUSHI-K2F2 | 343,00 DKK efter 4284 ms | kassan: 776,00 kr. → 343,00 kr. | 4 st, 34300 DKK, SUSHI-K1F1 | VALET NOLLSTÄLLT: fick "Köp 1 – få 1" (2 lådor + 2 ätpinnar) |
| X06-DK-N-B | 18:25:19 | DK | vanlig kund | B | 2925 | 5488 | 2563 | 6489 | 8514 | SUSHI-K2F2 | 686,00 DKK efter 4463 ms | kassan: 1.552,00 kr. → 686,00 kr. | 8 st, 68600 DKK, SUSHI-K2F2 | RÄTT ("Köp 2 – få 2", 4 lådor + 4 ätpinnar) |
| X10-DK-N-A | 18:29:23 | DK | vanlig kund | A | 4056 | 8974 | 4918 | 8192 | 9476 | SUSHI-K1F1 | reservvägen: koden fäste inte, omladdning till /da/cart, korgsidan 343,00 DKK (rätt för K1F1) | kassan: 776,00 kr. → 343,00 kr. | 4 st, 34300 DKK, SUSHI-K1F1 | VALET NOLLSTÄLLT: fick "Köp 1 – få 1" (2 lådor + 2 ätpinnar) |
| X14-DK-N-B | 18:34:48 | DK | vanlig kund | B | 2933 | 4613 | 1680 | 7291 | 8492 | SUSHI-K2F2 | 686,00 DKK efter 2742 ms | kassan: 1.552,00 kr. → 686,00 kr. | 8 st, 68600 DKK, SUSHI-K2F2 | RÄTT ("Köp 2 – få 2", 4 lådor + 4 ätpinnar) |
| Y03-DE-F-A | 18:21:37 | DE | snabb kund | A | 2926 | – | – | 4043 | 4340 | SUSHI-K2F2 | ingen låda: temats vanliga formulär, POST /cart/add → korgsidan | kassan: 44,90 € | 1 st, 4490 EUR, ingen kod | EN LÅDA, fullpris, ingen gratislåda, inga ätpinnar |
| Y07-DE-F-B | 18:25:50 | DE | snabb kund | B | 2931 | – | – | 3541 | 3746 | SUSHI-K2F2 | ingen låda: temats vanliga formulär, POST /cart/add → korgsidan | kassan: 44,90 € | 1 st, 4490 EUR, ingen kod | EN LÅDA, fullpris, ingen gratislåda, inga ätpinnar |
| Y11-DE-F-A | 18:30:18 | DE | snabb kund | A | 7492 | – | – | 9006 | 9345 | SUSHI-K2F2 | ingen låda: temats vanliga formulär, POST /cart/add → korgsidan | kassan: 44,90 € | 1 st, 4490 EUR, ingen kod | EN LÅDA, fullpris, ingen gratislåda, inga ätpinnar |
| Y01-DE-N-A | 18:19:10 | DE | vanlig kund | A | 2902 | 7469 | 4567 | 6487 | 7969 | SUSHI-K1F1 | €44,90 EUR efter 3171 ms | kassan: 101,60 € → 44,90 € | 4 st, 4490 EUR, SUSHI-K1F1 | VALET NOLLSTÄLLT: fick "Köp 1 – få 1" (2 lådor + 2 ätpinnar) |
| Y05-DE-N-B | 18:24:00 | DE | vanlig kund | B | 2932 | 4977 | 2045 | 7740 | 8998 | SUSHI-K2F2 | €89,80 EUR efter 3110 ms | kassan: 203,20 € → 89,80 € | 8 st, 8980 EUR, SUSHI-K2F2 | RÄTT ("Köp 2 – få 2", 4 lådor + 4 ätpinnar) |
| Y09-DE-N-A | 18:27:39 | DE | vanlig kund | A | 3149 | 7641 | 4492 | 6537 | 7905 | SUSHI-K1F1 | €44,90 EUR efter 3738 ms | kassan: 101,60 € → 44,90 € | 4 st, 4490 EUR, SUSHI-K1F1 | VALET NOLLSTÄLLT: fick "Köp 1 – få 1" (2 lådor + 2 ätpinnar) |
| Y13-DE-N-B | 18:33:01 | DE | vanlig kund | B | 2343 | 4503 | 2160 | 6909 | 8279 | SUSHI-K2F2 | reservvägen: koden fäste inte, omladdning till /de/cart, korgsidan €89,80 (rätt) | kassan: 203,20 € → 89,80 € | 8 st, 8980 EUR, SUSHI-K2F2 | RÄTT ("Köp 2 – få 2", 4 lådor + 4 ätpinnar) |
| Z01-DE-N-A | 18:36:17 | DE | vanlig kund | A | 3069 | 7533 | 4464 | 6584 | 7805 | SUSHI-K1F1 | €44,90 EUR efter 3219 ms | kassan: 101,60 € → 44,90 € | 4 st, 4490 EUR, SUSHI-K1F1 | VALET NOLLSTÄLLT: fick "Köp 1 – få 1" (2 lådor + 2 ätpinnar) |
| Z02-DE-N-B | 18:37:29 | DE | vanlig kund | B | 3606 | 5393 | 1787 | 7869 | 9063 | SUSHI-K2F2 | €89,80 EUR efter 3162 ms | kassan: 203,20 € → 89,80 € | 8 st, 8980 EUR, SUSHI-K2F2 | RÄTT ("Köp 2 – få 2", 4 lådor + 4 ätpinnar) |
| Y04-JP-F-A | 18:22:49 | JP | snabb kund | A | 2929 | – | – | 3850 | 4132 | SUSHI-K2F2 | ingen låda: temats vanliga formulär, POST /cart/add → korgsidan | kassan: ￥7,980 | 1 st, 798000 JPY, ingen kod | EN LÅDA, fullpris, ingen gratislåda, inga ätpinnar |
| Y08-JP-F-B | 18:26:45 | JP | snabb kund | B | 2373 | – | – | 3383 | 3609 | SUSHI-K2F2 | ingen låda: temats vanliga formulär, POST /cart/add → korgsidan | kassan: ￥7,980 | 1 st, 798000 JPY, ingen kod | EN LÅDA, fullpris, ingen gratislåda, inga ätpinnar |
| Y12-JP-F-A | 18:31:45 | JP | snabb kund | A | 2673 | – | – | 3576 | 3788 | SUSHI-K2F2 | ingen låda: temats vanliga formulär, POST /cart/add → korgsidan | kassan: ￥7,980 | 1 st, 798000 JPY, ingen kod | EN LÅDA, fullpris, ingen gratislåda, inga ätpinnar |
| Y02-JP-N-A | 18:20:24 | JP | vanlig kund | A | 3457 | 7744 | 4287 | 7112 | 8333 | SUSHI-K1F1 | ¥7,980 JPY efter 3787 ms | kassan: ￥18,120 → ￥7,980 | 4 st, 798000 JPY, SUSHI-K1F1 | VALET NOLLSTÄLLT: fick "Köp 1 – få 1" (2 lådor + 2 ätpinnar) |
| Y06-JP-N-B | 18:24:54 | JP | vanlig kund | B | 2994 | 4399 | 1405 | 7407 | 8617 | SUSHI-K2F2 | ¥15,960 JPY efter 2913 ms | kassan: ￥36,240 → ￥15,960 | 8 st, 1596000 JPY, SUSHI-K2F2 | RÄTT ("Köp 2 – få 2", 4 lådor + 4 ätpinnar) |
| Y10-JP-N-A | 18:28:59 | JP | vanlig kund | A | 3684 | 7965 | 4281 | 7833 | 9003 | SUSHI-K1F1 | ¥7,980 JPY efter 4462 ms | kassan: ￥18,120 → ￥7,980 | 4 st, 798000 JPY, SUSHI-K1F1 | VALET NOLLSTÄLLT: fick "Köp 1 – få 1" (2 lådor + 2 ätpinnar) |
| Y14-JP-N-B | 18:34:07 | JP | vanlig kund | B | 2379 | 4209 | 1830 | 7254 | 8445 | SUSHI-K2F2 | reservvägen: koden fäste inte, omladdning till /ja/cart, KORGSIDAN ¥36,240 = FULLPRIS (cart.js utan kod) | kassan: ￥36,240 → ￥15,960 | 8 st, 1596000 JPY, SUSHI-K2F2 | RÄTT i kassan, men korgsidan visade fullpris ¥36,240 |
| Z03-JP-N-A | 18:38:21 | JP | vanlig kund | A | 2537 | 6947 | 4410 | 6096 | 7270 | SUSHI-K1F1 | ¥7,980 JPY efter 4322 ms | kassan: ￥18,120 → ￥7,980 | 4 st, 798000 JPY, SUSHI-K1F1 | VALET NOLLSTÄLLT: fick "Köp 1 – få 1" (2 lådor + 2 ätpinnar) |

## Spoks-länkarna (andra prövningen, V3)

Läs-bart. Gmail bara läst, Spoks bara läst. Shopify bara `query`. Ingen kassa, ingen korg och
inget formulär. Allt skrivet ligger i `$SP/V3/`. Klockslag i UTC.

### Domen

| Fynd | Dom | Färg | Varför (kort) |
|---|---|---|---|
| M-01 | **BEKRÄFTAT** | 🔴 | Produktlänkarna på /nb och /en går 302 till den svenska produktsidan från NO, US, GB, CA, JP och NZ. Det gäller nio nya nät, Spoks verkliga länkform, Chromium och en norsk landkaka. |
| M-02 | **BEKRÄFTAT** | 🔴 | Länkarna på da, fi, de, fr, nl, es, it, pl och pt ger rätt språk men landet SE och SEK. Kunden ser Sveriges pris (299/369 kr, under golvet) och namnet Matstrumpor.se. Det gäller 12 Europaländer, även Android, dator-Chrome och engelska Accept-Language. |

Jag lyckades inte motbevisa något av dem. Båda försvinner när länken bär `?country=<land>`.

### 1. Är länkarna live i den formen?

- **Spoks live-innehåll gick inte att läsa direkt.** `spoks_kolla` (18:12) säger att
  `SPOKS_API_KEY_MATSTRUMPOR` saknas, och Spoks-connectorn finns inte i sessionen. Gmail har bara
  tre Spoks-utskick från Matstrumpor (27/9, 29/9 och 1/10), alla svenska till Axel.
- **Spoks behåller vår adress och lägger bara till en fråga.** Det syns i det riktiga utskicket
  16:01 ("Recensionerna säger att mottagaren blev glad"), där alla länkar är
  `link.matstrumpor.se/t/…`. Jag följde tre av dem med curl utan att gå vidare (18:14:02–18:14:27):

| Länk i mejlet | Slutadress (302) |
|---|---|
| Bilden (vår egen länk) | `https://matstrumpor.se/products/sushi-strumpor?utm_source=spoks&utm_campaign=…&utm_content=image&utm_medium=email&_spkscid=<kontakt>&_spksv=1.0` |
| "Följ det hela vägen" (vår egen länk) | `https://matstrumpor.se/pages/spara?utm_…&utm_content=text…` |
| Spoks eget produktblock (katalogen) | `https://1r46tp-qx.myshopify.com/products/sushi-strumpor?utm_…&utm_content=product…` |

- **Vår adress på de andra språken** står i koden: `klaviyo/spoks-paket.mjs` rad 119 och
  156–167 (bild + titel + knapp till `<bas>/products/<handle>`), och `klaviyo/spoks-sprak.mjs`
  rad 274 (bas = `https://matstrumpor.se/<mapp>`, ur `butik_url`). README:n säger att alla 156
  flödesmejl lästes tillbaka lika med filerna 29/9, och uppladdningsloggarna visar ingen senare
  uppladdning.
- **Därför mätte jag den adress kunden faktiskt når:** `/<mapp>/products/<handle>?utm_…&_spkscid=…&_spksv=1.0`.
  Kontakt-id:t var påhittat (nollor).

### 2. M-01 mätt om (Globalping, nät som M inte använde för de här adresserna)

| Tid | Kund i (nät) | Adress på .se | Svar |
|---|---|---|---|
| 18:16:41 | NO Oslo (Telia) | /nb/products/hamburger-strumpor?utm… | **302 → .se/products/hamburger-strumpor?utm…** |
| 18:16:47 | NO Stjørdal (NTE) | /nb/products/donut-strumpor | **302 → .se/products/donut-strumpor** |
| 18:21:12 | NO Stjørdal (NTE), webbvy-UA | /nb/products/sushi-strumpor?utm… | **302 → svenska** |
| 18:16:58 | US Chicago (Comcast) | /en/products/hamburger-strumpor?utm… | **302 → svenska** |
| 18:17:04 | US Chicago (AT&T), dator-Chrome | /en/products/donut-strumpor | **302 → svenska** |
| 18:17:09 | GB Cheltenham (Virgin Media) | /en/products/donut-strumpor?utm… | **302 → svenska** |
| 18:17:15 | GB London (BT), dator-Chrome | /en/products/sushi-strumpor?utm… | **302 → svenska** |
| 18:17:20 | CA Montreal (Bell) | /en/products/hamburger-strumpor?utm… | **302 → svenska** |
| 18:17:26 | JP Tokyo (KDDI) | /en/products/sushi-strumpor?utm… | **302 → svenska** |
| 18:17:31 | NZ Auckland (Mercury), ny | /en/products/sushi-strumpor?utm… | **302 → svenska** |
| 18:16:53 | NO (NTE), slutsidan | /products/hamburger-strumpor?utm… | 200 **sv** · NO · NOK 349,00 |
| 18:17:37 | US Boston (Comcast), slutsidan | /products/hamburger-strumpor?utm… | 200 **sv** · US · USD 39.99 |

- Shopify ser kundens land i alla svar (`server-timing country;desc="NO"` och så vidare).
- **I Chromium från containern** (USA, ny besökare, Metas pixel blockerad) hände samma sak.
  Klockan 18:17:57 gick `/en/products/sushi-strumpor` med 302 till sidan i sv · US · USD 54.99. Klockan
  18:18:22 gav samma test med utm-frågan sv · US · USD 39.99.
- **En norsk kund med landkakan** `localization=NO` (18:18:31) skickades också vidare med 302. Sidan
  stod på svenska med NOK 349,00. Annonsraden högst upp sa "Fri frakt i hela Sverige", och sidan visade
  "Storlek" och "Passar strl 36–44" (`bilder/C3-se-nb-hamburger-kaka-NO.png`). Den amerikanska kunden
  såg samma annonsrad.

### 3. M-02 mätt om (Globalping, alla 200, inga omdirigeringar)

| Tid | Kund i (nät) | Mapp | Svar: språk · land · valuta · og:price · titel |
|---|---|---|---|
| 18:17:48 | DE Berlin (Deutsche Telekom) | /de hamburgare | de · **SE · SEK 299** · "… – Matstrumpor.se" |
| 18:17:54 | DE Düsseldorf (Vodafone), dator-Chrome, en-US | /de sushi | de · **SE · SEK 369** |
| 18:21:17 | DE Düsseldorf (Vodafone), Android-Chrome | /de sushi | de · **SE · SEK 369** |
| 18:18:00 | FR Paris (Free) | /fr donut | fr · **SE · SEK 299** |
| 18:18:05 | FR Paris (Bouygues), dator-Chrome, en-GB | /fr sushi | fr · **SE · SEK 369** |
| 18:18:11 | NL Amsterdam (KPN) | /nl hamburgare | nl · **SE · SEK 299** |
| 18:18:16 | NL Amsterdam (Odido), dator-Chrome, en-US | /nl sushi | nl · **SE · SEK 369** |
| 18:18:22 | PL Warszawa (Orange) | /pl donut | pl · **SE · SEK 299** |
| 18:18:27 | PL Łódź (Netia), dator-Chrome, en-US | /pl sushi | pl · **SE · SEK 369** |
| 18:18:33 | DE (Vodafone) | /de kollektionen | de · **SE · SEK** |
| 18:18:38 | DE Hamburg (Telekom) | /de/pages/spara | de · **SE · SEK** |
| 18:18:44 | AT Güssing (kabelplus) | /de sushi | de · **SE · SEK 369** |
| 18:18:49 | BE Mechelen (Proximus) | /nl sushi | nl · **SE · SEK 369** |
| 18:18:55 | DK Skjern (TDC) | /da sushi | da · **SE · SEK 369** |
| 18:19:00 | FI Helsingfors (LIVI) | /fi sushi | fi · **SE · SEK 369** |
| 18:19:06 | ES Cartagena (AIRE, samma nät som M) | /es sushi | es · **SE · SEK 369** |
| 18:19:11 | IT Milano (Dimensione, samma nät som M) | /it sushi | it · **SE · SEK 369** |
| 18:19:17 | PT Lissabon (Vodafone, samma nät som M) | /pt sushi | pt-PT · **SE · SEK 369** |
| 18:17:42 | IE Cork (Vodafone), engelska mejl | /en sushi | en · **SE · SEK 369** · "Sushi Socks – Matstrumpor.se" |

- Kakorna är `localization=SE` (path `/<mapp>`) och `cart_currency=SEK`, och content-language är
  `<språk>-SE`. Shopify ser kundens land (`server-timing country;desc="DE"` och så vidare).
- **Priset:** 369 kr = 32,55 € och 299 kr = 26,37 € (kurs 0,088204). Europas pris är 39,90 € och
  31,90 €, och golvet (Sverige + 20 %) är 39,06 € och 31,65 €. Kunden ser alltså ett pris under golvet.
- **Det kunden ser** (Chromium 18:18:38, `.se/de/products/sushi-strumpor?country=SE`, alltså samma land
  som Shopify ger en tysk kund) står i `bilder/C4-se-de-sushi-SE.png`:
  - loggan **MATSTRUMPOR.SE** och säljarraden **MATSTRUMPOR.SE**, som enligt briefen är förbjudna utanför Sverige;
  - priset "399 kr";
  - landväljaren "Land/Region Schweden | SEK kr".
- **IE** (engelska mejl, Europa-marknaden) får samma sak. Irland har ingen kampanj, så det är bara information.

### 4. Kommer kunden ändå rätt?

- **Ingen "fel land"-ruta.** Sidan har inget geoskript och inget `browsing_context_suggestions`
  (Chromium 18:18:38). Kunden får alltså ingen fråga om landet.
- **Landväljaren rättar om kunden själv byter land.** Den listar 38 länder, bland dem "Deutschland EUR €".
  Klockan 18:19:24 valde jag Deutschland, vilket skickar POST `/de/localization` (tillåtet: "välja land").
  Samma sida kom då tillbaka i de · DE · EUR · 39,90 € med titeln "… – Matstrumpor". Kunden måste alltså
  själv se "Schweden | SEK" och byta.
- **Kassan för en Europa-kund som kommer via länken** gick inte att se. Det kräver en adress.

### 5. Varför (bara förklaring)

`query` mot Shopify 18:16:55: närvaron **matstrumpor.se ligger i marknaderna no, eu, en, jp och tw**
(standard sv plus 13 språk), och Sverige-marknaden har ingen egen närvaro. Shopify ger ändå
Europa-besökare landet SE på .se när länken saknar `?country=`, och i NO, US, GB, CA, JP och NZ gör
Shopify 302 från språkmappens produktsida till roten. Samma mönster som A-01 och A-06.

### 6. Motprovet visar vägen till rättningen

**Samma .se-adress med `?country=<land>` blir rätt.** Mätt med utm-frågan:

| Tid | Kund i | Adress | Svar |
|---|---|---|---|
| 18:20:49 | NO (Telia) | .se/nb/products/sushi-strumpor?country=NO&utm… | 200 nb · NO · NOK 429,00 |
| 18:20:55 | US (Comcast) | .se/en/…?country=US | 200 en · US · USD 54.99 |
| 18:21:01 | DE (Telekom) | .se/de/…?country=DE | 200 de · DE · EUR 39,90 · "– Matstrumpor" |
| 18:21:06 | JP (NTT) | .se/en/…?country=JP | 200 en · JP · JPY 7 080 |

**Förslaget** (utförs aldrig av granskaren, byggarsessionen rättar efter Axels ok):

1. Ge varje Spoks-länk `?country=<ISO>`. Domänen kan vara .se eller .com, båda fungerar med land.
2. Ett språk täcker flera länder, så ett sändsteg per språk räcker inte. Engelska går till US, GB, CA,
   NZ, IE och reservländerna, tyska till DE, AT och CH, nederländska till NL och BE, franska till FR och LU.
   Det säkra är ett sändsteg per land. Spoks kontaktfält `country` är ett engelskt namn och inte en
   ISO-kod, så en sammanslagningstagg i länken måste provas först.
3. Ladda upp, läs tillbaka och mät om från NO, US, JP, DE, AT och BE.

### Vilka mejl träffas först

Detta är ur `klaviyo/innehall/matstrumpor/floden/*.json` och hjälper beslutet om tidpunkten. Själva
annonsernas länkar påverkas inte (A1).

| Flöde | När efter utlösaren | Bär |
|---|---|---|
| F01 Välkomst E1 (klubben, ej köpt) | direkt | produktkort sushi, kollektionen, produktrad |
| F01 E2 | 2 dygn | produkt, produktrad |
| F03 Webbhistorik E2 (känd kontakt) | 1 dygn 4 h | produktrad (E1 bara Spoks dynamiska block) |
| F04 Efter köp E1 | 3 dygn | bara spårningsknappen (M-02: land SE i Europa, språket rätt) |
| F04 E2 | 16 dygn | produktrad |
| F07 | 21 dygn | produkt, produktrad |
| F05 | 90 dygn | produktrad, produkt |

Från första natten är det alltså F01 (nya klubbmedlemmar utomlands) och F03 som visar fel sida.
Köparna nås av produktlänkarna först efter 16 dygn.

### Observation utanför M-01/M-02 (gäller M-04)

**Spoks egna produktblock** (katalogkortet i de svenska utskicken, troligen också F02:s och F03:s
dynamiska block) länkar till `1r46tp-qx.myshopify.com/products/<handle>`.

| Tid | Kund i | Svar |
|---|---|---|
| 18:25 | NO (Telia) | 200 **sv** · NO · NOK 429,00 |
| 18:25 | DE (Telekom) | 200 **sv** · DE · EUR 39,90 |

Svaret är svensk text, men landet och valutan är rätt.

### Kan inte mätas härifrån

- Spoks live-innehåll på nb/en/de … (ingen nyckel, ingen connector, inga sådana utskick i Gmail).
  Formen bevisas av koden, uppladdningskontrollen och ett riktigt utskick.
- Kassan för en Europa-kund som kommer via länken: om Sverige och SEK är förvalt och vad som
  händer med priset när kunden väljer sitt land. Det kräver en adress.

### Förbrukat och sidoeffekter

- **Globalping: 37 prober** i serie, 18:16:41–18:25 UTC. Lägsta `X-RateLimit-Remaining` var 224 av 250.
  Inga 429 från Globalping och inga 429 från Shopify (`matningar/gp/kvot.jsonl`).
- **Chromium:** sex sidladdningar och ett landbyte (POST `/de/localization`). Metas pixel fick 0 anrop.
  - Spoks webbpixel (`events.spoks.com`) blockerades också: 8 avbrutna anrop i C1–C4, och samma block
    gällde vid landbytet.
  - Inget kontakt-id skickades i Chromium, så inget flöde kan starta.
  - Googles annonstagg (google.com/rmkt, doubleclick) var inte blockerad och fick sidvisningarna.
  - Ett första försök med C2 avbröts av mitt eget block innan det nådde butiken.
- **Spoks-spårningslänkar:** tre GET mot `link.matstrumpor.se` (18:14). De bokförs som klick för Axels
  kontakt på utskicket 1/10, enligt uppdragets tillåtelse.
- **Shopify:** en `query` (marknader och närvaror). Meta: inget.
- **Gmail:** två sökningar och en läsning.
- **Inget skrivet** utanför `$SP/V3/`. Ingen git.

Filer: `dom.json`, `matningar/V3-tabell.json` (alla prober), `matningar/gp/*.json` (rådata),
`matningar/kund-chromium-*.json`, `matningar/valjare-DE.json`, `matningar/marknader.json`,
`matningar/spoks-sparlank-*.hdr`, `bilder/C1…C5*.png`. Skript: `gp.mjs`, `kor.mjs`, `kund.mjs`,
`valjare.mjs`, `marknader.mjs`.

## Kassan i 25 vyer (granskare C, 16:33–18:03 UTC)

### Tabell: land × kassa

Mätt i Chromium (desktop 1280 × 900) med landet satt med `?country=` på produktsidan och webbläsarens språk = landets språk. Summan jämförs med paketväljarens pris på samma sida. "Skatt/tull" = Shopifys egna rader i kassans slutläge, utan adress (rapporteras bara, ändra aldrig skatteinställningarna). Skärmdump per land: `bilder/kassa-<LAND>.png`, rådata `matningar/kassa-<LAND>.json`.

| Land | Kassans språk | Valuta | Summa (sidan → kassan) | Rabatt | Förvalt land | Logga | Flik | Express | Betalsätt (* = förvalt) | Skatt/tull | Fel |
|---|---|---|---|---|---|---|---|---|---|---|---|
| NO | ✅ nb-no | ✅ NOK | ✅ 938 kr → 938,00 kr | ✅ SUSHI-K2F2 | ✅ Norge | ✅ Matstrumpor | Utsjekking - Matstrumpor.se | Shop Pay | Kredittkort*, Klarna, PayPal (VISA/MAESTRO/MASTERCARD/AMEX/UNIONPAY) — saknas: Vipps | ingen | inga |
| NO-no | ✅ nb-no | ✅ NOK | ✅ 938 kr → 938,00 kr | ✅ SUSHI-K2F2 | ✅ Norge | ✅ Matstrumpor | Utsjekking - Matstrumpor.se | Shop Pay | Kredittkort*, Klarna, PayPal (VISA/MAESTRO/MASTERCARD/AMEX/UNIONPAY) — saknas: Vipps | ingen | inga |
| DK | ✅ da-dk | ✅ DKK | ✅ 686 kr. → 686,00 kr. | ✅ SUSHI-K2F2 | ✅ Danmark | ✅ Matstrumpor | Betalingsproces - Matstrumpor.se | Shop Pay | Kreditkort*, Klarna, PayPal, MobilePay (VISA/MAESTRO/MASTERCARD/AMEX/UNIONPAY) | ingen | inga |
| FI | ✅ fi-fi | ✅ EUR | ✅ 89,80 € → 89,80 € | ✅ SUSHI-K2F2 | ✅ Suomi | ✅ Matstrumpor | Kassa - Matstrumpor.se | Shop Pay | Korttimaksu*, PayPal, Klarna, MobilePay (VISA/MAESTRO/MASTERCARD/AMEX/UNIONPAY) — saknas: nätbank | ingen | inga |
| US | ✅ en-us | ✅ USD | ✅ $138 → $138.00 | ✅ SUSHI-K2F2 | ✅ United States | ✅ Matstrumpor | Checkout - Matstrumpor.se | Shop Pay | Credit card*, PayPal (VISA/MAESTRO/MASTERCARD/AMEX/UNIONPAY) | ingen | inga |
| GB | ✅ en-gb | ✅ GBP | ✅ £108 → £108.00 | ✅ SUSHI-K2F2 | ✅ United Kingdom | ✅ Matstrumpor | Checkout - Matstrumpor.se | Shop Pay | Credit card*, Klarna, PayPal (VISA/MAESTRO/MASTERCARD/AMEX/UNIONPAY) | ingen | inga |
| CA | ✅ en-ca | ✅ CAD | ✅ CA$202 → $202.00 | ✅ SUSHI-K2F2 | ✅ Canada | ✅ Matstrumpor | Checkout - Matstrumpor.se | Shop Pay | Credit card*, PayPal (VISA/MAESTRO/MASTERCARD/AMEX/UNIONPAY) | raden "Taxes" utan belopp medan kassan laddade | inga |
| NZ | ✅ en-nz | ✅ NZD | ✅ NZ$252 → $252.00 | ✅ SUSHI-K2F2 | ✅ New Zealand | ✅ Matstrumpor | Checkout - Matstrumpor.se | Shop Pay | Credit card*, PayPal (VISA/MAESTRO/MASTERCARD/AMEX/UNIONPAY) | ingen | inga |
| AU | ✅ en-au | ✅ AUD | ✅ A$204 → $204.00 | ✅ SUSHI-K2F2 | ✅ Australia | ✅ Matstrumpor | Checkout - Matstrumpor.se | Shop Pay | Credit card*, PayPal (VISA/MAESTRO/MASTERCARD/AMEX/UNIONPAY) | ingen | inga |
| DE | ✅ de-de | ✅ EUR | ✅ 89,80 € → 89,80 € | ✅ SUSHI-K2F2 | ✅ Deutschland | ✅ Matstrumpor | Checkout - Matstrumpor.se | Shop Pay | Kreditkarte*, PayPal, Klarna (VISA/MAESTRO/MASTERCARD/AMEX/UNIONPAY) | ingen | inga |
| AT | ✅ de-at | ✅ EUR | ✅ 89,80 € → € 89,80 | ✅ SUSHI-K2F2 | ✅ Österreich | ✅ Matstrumpor | Checkout - Matstrumpor.se | Shop Pay | Kreditkarte*, PayPal, Klarna (VISA/MAESTRO/MASTERCARD/AMEX/UNIONPAY) — saknas: EPS | ingen | inga |
| CH | ✅ de-ch | ✅ CHF | ✅ 86 CHF → CHF 86.00 | ✅ SUSHI-K2F2 | ✅ Schweiz | ✅ Matstrumpor | Checkout - Matstrumpor.se | Shop Pay | Kreditkarte*, PayPal, Klarna, TWINT (VISA/MAESTRO/MASTERCARD/AMEX/UNIONPAY) | ingen | inga |
| FR | ✅ fr-fr | ✅ EUR | ✅ 89,80 € → 89,80 € | ✅ SUSHI-K2F2 | ✅ France | ✅ Matstrumpor | Paiement - Matstrumpor.se | Shop Pay | Carte de crédit*, PayPal, Klarna (VISA/MAESTRO/MASTERCARD/AMEX/UNIONPAY) | ingen | inga |
| BE | ✅ fr-be | ✅ EUR | ✅ 89,80 € → 89,80 € | ✅ SUSHI-K2F2 | ✅ Belgique | ✅ Matstrumpor | Paiement - Matstrumpor.se | Shop Pay | Bancontact*, Carte de crédit, PayPal, Klarna (VISA/MAESTRO/MASTERCARD/AMEX/UNIONPAY) | raden "Taxes" utan belopp medan kassan laddade | inga |
| LU | ✅ fr-lu | ✅ EUR | ✅ 89,80 € → 89,80 € | ✅ SUSHI-K2F2 | ✅ Luxembourg | ✅ Matstrumpor | Paiement - Matstrumpor.se | Shop Pay | Carte de crédit*, PayPal (VISA/MAESTRO/MASTERCARD/AMEX/UNIONPAY) | ingen | inga |
| NL | ✅ nl-nl | ✅ EUR | ✅ € 89,80 → € 89,80 | ✅ SUSHI-K2F2 | ✅ Nederland | ✅ Matstrumpor | Checkout - Matstrumpor.se | Shop Pay | iDEAL \| Wero*, Klarna, Creditcard, PayPal (VISA/MAESTRO/MASTERCARD/AMEX/UNIONPAY) | ingen | inga |
| ES | ✅ es-es | ✅ EUR | ✅ 89,80 € → 89,80 € | ✅ SUSHI-K2F2 | ✅ España | ✅ Matstrumpor | Pantalla de pago - Matstrumpor.se | Shop Pay | Tarjeta de crédito*, PayPal, Klarna (VISA/MAESTRO/MASTERCARD/AMEX/UNIONPAY) | ingen | inga |
| IT | ✅ it-it | ✅ EUR | ✅ 89,80 € → 89,80 € | ✅ SUSHI-K2F2 | ✅ Italia | ✅ Matstrumpor | Check-out - Matstrumpor.se | Shop Pay | Carta di credito*, PayPal, Klarna (VISA/MAESTRO/MASTERCARD/AMEX/UNIONPAY) | ingen | inga |
| PL | ✅ pl-pl | ✅ PLN | ✅ 402 zł → 402,00 zł | ✅ SUSHI-K2F2 | ✅ Polska | ✅ Matstrumpor | Realizacja zakupu - Matstrumpor.se | Shop Pay | Karta kredytowa*, PayPal, BLIK, Klarna (VISA/MAESTRO/MASTERCARD/AMEX/UNIONPAY) — saknas: Przelewy24 | ingen | rubrikerna blandar typsnitt (C-09) |
| PT | ✅ pt-pt | ✅ EUR | ✅ 89,80 € → 89,80 € | ✅ SUSHI-K2F2 | ✅ Portugal | ✅ Matstrumpor | Finalização da compra - Matstrumpor.se | Shop Pay | Cartão de crédito*, PayPal, Klarna (VISA/MAESTRO/MASTERCARD/AMEX/UNIONPAY) — saknas: MB WAY, Multibanco | ingen | inga |
| JP | ✅ ja-jp | ✅ JPY | ✅ ￥15,960 → ￥15,960 | ✅ SUSHI-K2F2 | ✅ 日本 | ✅ Matstrumpor | お支払い - Matstrumpor.se | Shop Pay | クレジットカード*, PayPal (VISA/MAESTRO/MASTERCARD/AMEX/UNIONPAY) — saknas: JCB, konbini, PayPay | ingen | inga |
| SE | ✅ sv-se | ✅ SEK | ✅ 798 kr → 798,00 kr | ✅ SUSHI-K2F2 | ✅ Sverige | ✅ Matstrumpor | Utcheckningskassa - Matstrumpor.se | Shop Pay | Kontokort*, PayPal, Klarna (VISA/MAESTRO/MASTERCARD/AMEX/UNIONPAY) — saknas: Swish | ingen | inga |
| IE | ✅ en-ie | ✅ EUR | ✅ €89.80 → €89.80 | ✅ SUSHI-K2F2 | ✅ Ireland | ✅ Matstrumpor | Checkout - Matstrumpor.se | Shop Pay | Credit card*, PayPal, Klarna (VISA/MAESTRO/MASTERCARD/AMEX/UNIONPAY) | ingen | inga |
| CZ | 🟡 en-cz, men produktnamnen svenska med tjeckisk webbläsare (C-15) | ✅ CZK | ✅ CZK 2,242 → Kč 2,242.00 | ✅ SUSHI-K2F2 | ✅ Czechia | ✅ Matstrumpor | Checkout - Matstrumpor.se | Shop Pay | Credit card*, PayPal, Klarna (VISA/MAESTRO/MASTERCARD/AMEX/UNIONPAY) | ingen | inga |
| TW | ✅ zh-hant | ✅ TWD | ✅ $3,380 → $3,380.00 | ✅ SUSHI-K2F2 | ✅ 台灣 | ✅ Matstrumpor | 結帳 - Matstrumpor.se | Shop Pay | 信用卡*, PayPal (VISA/MAESTRO/MASTERCARD/AMEX/UNIONPAY) | ingen | inget tull-ID-fält (känt stopp), "OR" på engelska |

\* = förvalt betalsätt. Kortmärkena är de synliga (Visa, Maestro, Mastercard) plus de två bakom "+2" (Amex, UnionPay), lästa genom att hovra (inget klick).

**Korgen (bara för jämförelsen med kassan; korgen granskas av B):** i alla 25 vyer innehöll korgen 4 lådor (2 betalda + 2 gratis) och 4 par ätpinnar à 0, med koden …-K2F2, i marknadens valuta. Undantaget är ett av tre försök i PT där korgsidan visade €203,20 utan rabatt, medan kassan ändå gav €89,80 (C-10, gick inte att återskapa). Korgen hamnade i kundens språkmapp i alla fall då temat tog reservvägen till korgsidan (/nb/cart, /da/cart, /fi/cart, /fr/cart, /it/cart, /nl/cart, /pt-pt/cart, matstrumpor.no/cart).

### Betalsätten jämfört med landets vanligaste

Kolumnen "Vanligt i landet" är **kunskap, inte mätning**. Kolumnen "I kassan" är mätt.

| Land | Vanligt i landet (kunskap) | I kassan (mätt) | Saknas → 🔵 Axel |
|---|---|---|---|
| NO (.com/nb och .no) | Vipps, kort, Klarna | kort, Klarna, PayPal | Vipps (C-01) |
| DK | MobilePay, Dankort/kort | kort, Klarna, PayPal, MobilePay | – |
| FI | MobilePay, nätbank, kort, Klarna | kort, PayPal, Klarna, MobilePay | nätbank (C-06) |
| DE | PayPal, Klarna, kauf auf Rechnung, kort | kort, PayPal, Klarna | – (Rechnung via Klarna) |
| AT | EPS, Klarna, kort | kort, PayPal, Klarna | EPS (C-02) |
| CH | TWINT, kort | kort, PayPal, Klarna, TWINT | – |
| FR | CB/kort, PayPal | kort, PayPal, Klarna | – |
| BE | Bancontact, kort | **Bancontact (förvalt)**, kort, PayPal, Klarna | – |
| LU | kort, PayPal, Payconiq | kort, PayPal | – (ingen Klarna i LU) |
| NL | iDEAL, kort | **iDEAL \| Wero (förvalt)**, Klarna, kort, PayPal | – |
| ES | kort, PayPal, Bizum | kort, PayPal, Klarna | Bizum (bara info) |
| IT | kort, PayPal, Satispay | kort, PayPal, Klarna | Satispay (bara info) |
| PL | BLIK, Przelewy24, kort | kort, PayPal, BLIK, Klarna | Przelewy24 (C-03) |
| PT | MB WAY, Multibanco, kort | kort, PayPal, Klarna | MB WAY, Multibanco (C-04) |
| JP | JCB-kort, konbini, PayPay | kort (Visa, Maestro, Mastercard, Amex, UnionPay), PayPal | JCB, konbini, PayPay (C-05) |
| SE | Swish, Klarna, kort | kort, PayPal, Klarna | Swish (C-13) — har aldrig funnits |
| US, CA, NZ, AU | kort, PayPal, Apple Pay, Google Pay | kort, PayPal | – (Apple/Google Pay kan inte mätas) |
| GB, IE, CZ | kort, PayPal, Apple Pay | kort, Klarna, PayPal | – |
| TW (inte lanserad) | kort, LINE Pay, konbini | kort, PayPal | – (känt stopp) |

Expressraden: bara **Shop Pay** ritades i Chromium, i alla 25 vyer. PayPal och Google Pay som expressknappar ritades inte (i AT, CH, FR, LU, ES, IT, PL och JP fanns tre platser men bara Shop Pay fylldes, `matningar/express-montage.png`). Apple Pay syns aldrig i Chromium. API:t säger att Shop Pay, Apple Pay och Google Pay stöds, och de svenska ordrarna visar att Apple Pay (69) och Google Pay (11) används.

Betalsätten gick inte att läsa via Admin API (inget fält för lokala betalsätt, `matningar/betal-api.json`). Om ett saknat betalsätt GÅR att slå på syns bara i Shopify admin → Inställningar → Betalningar, och det är Axels klick.

### Fraktzonerna (query deliveryProfiles, 16:33 UTC)

En profil ("General profile"), en plats (Stenkolsgatan 1B, SE). Alla 38 marknadsländer ligger i en zon med en aktiv sats för 0 kr:

| Zon | Länder | Sats |
|---|---|---|
| Sverige | SE | "Fri Frakt" 0 kr |
| Norden (Norge) | NO | "Fri frakt" 0 kr |
| Europa (EU + Island, Liechtenstein, Schweiz) | 29 länder = Europa-marknaden exakt | "Fri frakt" 0 kr |
| Engelska marknader (US, UK, AU, CA, NZ) | AU, CA, GB, NZ, US | "Free shipping" 0 kr |
| Japan och Taiwan | JP, TW | "Fri frakt" 0 kr |
| Internationell | AE, HK, IL, KR, MY, SG | "Standard" 299 kr (länderna finns inte i någon marknad, kassan erbjuder dem inte — C-12) |

Satsernas namn är översatta till alla 13 utlandsspråk (`matningar/fraktnamn.json`). Utan adress visar kassan "ange leveransadress" på kundens språk; i Taiwan är "免運費 免費" förvalt redan utan adress.

### Taiwan (bara titta)

Kassan är på traditionell kinesiska, TWD $3,380.00 = paketväljaren, 台灣 förvalt, kort och PayPal. Det finns inget fält för tull-ID (身分證字號 / National ID) och inget telefonfält. Shopify visar sitt extra ID-fält först efter en komplett adress, så att fältet saknas här bevisar inte att det är avslaget. Avdelaren mellan Shop Pay och kontaktuppgifterna står på engelska, "OR". Känt stopp (C-14).

## Domänerna från riktiga länder (granskare A, 16:30–17:05 UTC)

### A1 Kampanjlänkarna (Meta GET 16:31–16:33 UTC, geokoll 16:34:53–16:35:51 UTC)

| Kampanj | Länk i Meta (alla 8 annonser) | = marknader.json | Mätt från | Svar |
|---|---|---|---|---|
| NO | .com/nb/products/sushi-strumpor?country=NO | ja | NO (Lyse) | 200 nb NO NOK 429 |
| NOB | matstrumpor.no/products/sushi-strumpor?country=NO | ja | NO (Lyse) | 200 nb NO NOK 429 |
| DK | .com/da/…?country=DK | ja | DK (M247) | 200 da DK DKK 305 |
| FI | .com/fi/…?country=FI | ja | FI (Hetzner) | 200 fi FI EUR 39,90 |
| US | .com/products/sushi-strumpor?country=US | ja | US (Oracle) | 200 en US USD 54,99 |
| WW | .com/products/sushi-strumpor (utan land) | ja | GB, CA, NZ | 200 en, GB GBP 43 · CA CAD 80 · NZ NZD 101 |
| DE | .com/de/…**?country=DE** | **nej** (filen utan land, A-03) | DE ×2, AT ×2, CH ×2 | alla 200 de, **land DE**, EUR 39,90 |
| FR | .com/fr/…**?country=FR** | **nej** (filen utan land, A-03) | FR ×2, BE, LU | 200 fr, **land FR**, EUR 39,90 (BE EDIS och LU FranTech: 429) |
| NL | .com/nl/…?country=NL | ja | NL (Oracle) | 200 nl NL EUR 39,90 |
| ES | .com/es/…?country=ES | ja | ES (IONOS) | 200 es ES EUR 39,90 |
| IT | .com/it/…?country=IT | ja | IT (Akamai) | 200 it IT EUR 39,90 |
| PL | .com/pl/…?country=PL | ja | PL (OVH) | 200 pl PL PLN 179 |
| PT | .com/pt-pt/…?country=PT | ja | PT (MEO) | 200 pt-PT PT EUR 39,90 |
| JP | .com/ja/…?country=JP | ja | JP (Oracle) | 200 ja JP JPY 7 080 (1 645 ms) |

- Ingen annons har `asset_feed_spec` eller `url_tags` (inga UTM-taggar; känt sedan 2026-09-29).
- NO och NOB: 007 står PAUSED (hall_av), de andra sju ACTIVE. Alla kampanjer PAUSED till 00:01.
- og:price är 3-parets pris och ligger över golvet (Sverige + 20 %) i alla valutor ovan.
- **Meta-läget för DE/FR:** ett adset per kampanj. DE-adset 120251750243010023 har länderna CH, AT, DE.
  FR-adset 120251750244800023 har BE, LU, FR. Platstyper: home, recent, frequently_in. Inga adset per land.
- WW-adset 120251749614670023: NZ, CA, GB, inga `issues_info` (Australien borta, som planerat).
- Svenska kampanjen MATSTRUMP_SALES_20260826 (ACTIVE): fem ACTIVE annonser länkar till
  `https://matstrumpor.se/products/sushi-strumpor` (se F).
- Meta: 19 GET, högsta användning 43 % (`x-business-use-case-usage`, total_time). Ingen läsning efter 16:33 UTC.

### A2 matstrumpor.no från Norge (Lyse Tele, Haugesund, 16:36:21–16:36:55 UTC)

| Sida | Svar |
|---|---|
| `/` | 200 nb NO NOK |
| `/products/sushi-strumpor` | 200 nb NO NOK 429 |
| `/products/pizza-strumpor` | 200 nb NO NOK 519 |
| `/products/hamburger-strumpor` | 200 nb NO NOK 349 |
| `/products/donut-strumpor` | 200 nb NO NOK 349 |
| `/products/sushipinnar-i-akta-tra` | 200 nb NO NOK 59 |
| `/cart`, `/pages/contact`, `/policies/refund-policy`, `/pages/spara` | 200 nb NO NOK |

Ingen Location till .se eller .com. Kakorna: `localization=NO`, `cart_currency=NOK`.

### A4 Regeln om språkmapparna på .com, utan `?country=`, från mappens land (16:37:30–16:40:08 UTC)

| Sidtyp | de (DE) | nb · da · fi · fr · nl · es · it · pl · pt-pt · ja · zh-tw (eget land) |
|---|---|---|
| Produktsida (sushi, pizza, hamburgare, donut) | **302 → .com/products/<handle> (engelska)** | sushi: **302 → engelska** i alla elva |
| Presentkort | **302 → engelska** | **302 → engelska** i alla elva |
| Ätpinnarna (olistad) | **302 → engelska** | inte mätt |
| Startsidan `/de` | 200 de DE EUR | inte mätt |
| `/collections/all` | 200 de DE EUR | 200 på språket, eget land och valuta i alla elva |
| `/pages/spara` | 200 de DE EUR | 200 i alla tretton (A5) |
| `/cart`, `/policies/refund-policy`, `/pages/contact` | 200 de DE EUR | inte mätt |

- Med kakan `localization=<land>` blir det **samma 302** (DE, FR, JP prövat). Kakan når Shopify: med
  `localization=AT` blev `/de` land AT. Samma med Chrome-UA i stället för Facebook-appen.
- Samma beteende från containern (USA-IP) med kakan, så det går att pröva om i Chromium härifrån.
- Startsidan `/de` länkar till `/de/products/pizza-strumpor` osv. utan land: klicket ger engelska (A-01).
- Annonsens egen landningssida (`/de/products/sushi-strumpor?country=DE`, curl 17:03:50 UTC): menyvalet
  "Sushi-Socken" (sidhuvud, mobilmeny, sidfot), titelns länk och "Vollständige Details" pekar på
  `/de/products/sushi-strumpor` utan land, och dela-knappen kopierar `https://matstrumpor.com/de/products/sushi-strumpor`.
- På .eu och .se stannar `/de/products/sushi-strumpor` på tyska från DE (men land AT resp. SE och SEK).
  Felet hör alltså till .com-närvaron, som ligger i fem marknader (no, eu, en, jp, tw). På matstrumpor.no stannar
  produktsidorna på norska utan land (A2), så A/B-testet i Norge skiljer sig också här: A (.com/nb) ger engelska
  från andra produktsidan, B (.no) gör det inte.
- Inte orsaken: 0 URL-omdirigeringar; pizza-strumpor har bara title och body_html översatta till de.

### A3 Domänrötterna (16:43:50–16:48:07 UTC, Accept-Language på landets språk)

| Land | .com/ | .no/ | .se/ | .eu/ |
|---|---|---|---|---|
| SE | 302 → .se | 302 → .se | 200 sv SE SEK | 200 en **AT** EUR |
| NO | 200 en NO NOK | 200 nb NO NOK | 200 sv NO NOK | 302 → **myshopify** |
| DK | 200 en DK DKK | 302 → **myshopify** | 200 sv **SE SEK** | 200 en **AT** EUR |
| FI | 200 en FI EUR | → myshopify | 200 sv **SE SEK** | 200 en **AT** EUR |
| DE | 200 en DE EUR | → myshopify | 200 sv **SE SEK** | 200 en **AT** EUR |
| AT | 200 en AT EUR | → myshopify | – | – |
| CH | 200 en CH CHF | → myshopify | – | – |
| FR | 200 en FR EUR | → myshopify | 200 sv **SE SEK** | 200 en **AT** EUR |
| BE | 200 en BE EUR | → myshopify | – | – |
| NL | 200 en NL EUR | → myshopify | 200 sv **SE SEK** | 200 en **AT** EUR |
| ES | 200 en ES EUR | → myshopify | 200 sv **SE SEK** | 200 en **AT** EUR |
| IT | 200 en IT EUR | → myshopify | – | – |
| PL | 200 en PL PLN | → myshopify | 200 sv **SE SEK** | 200 en **AT** EUR |
| PT | 200 en PT EUR | → myshopify | – | – |
| GB | 200 en GB GBP | → myshopify | 200 sv GB GBP | → myshopify |
| IE | 200 en IE EUR | → myshopify | – | – |
| US | 200 en US USD | → myshopify | 200 sv US USD | → myshopify |
| CA | 200 en CA CAD | → myshopify | – | – |
| AU | 200 en AU AUD | → myshopify | – | – |
| NZ | 200 en NZ NZD | → myshopify | – | – |
| JP | 200 en JP JPY | → myshopify | 200 sv JP JPY | → myshopify |
| TW | 200 en TW TWD | → myshopify | – | – |

- "myshopify" = 302 till `https://1r46tp-qx.myshopify.com/?shpxid=…`, som svarar 200 på **svenska** med
  besökarens land och valuta (följd från DE: sv, DE, EUR; från US: sv, US, USD). Orsaken: myshopify-adressen
  ligger först bland webbnärvarorna i alla fem utlandsmarknaderna (`query markets` 16:56 UTC).
- Ingen slinga, inget 4xx eller 5xx. Trasigt: .no och .eu till myshopify (A-04, A-05), .eu ger alla AT
  (A-05), .se ger Europa-länder SE/SEK (A-06). Val: .com/ visar engelska med eget land (A-07), svensk text på .se.

### A5 Mejlens spårningsknapp (16:49:02–16:49:56 UTC)

`https://matstrumpor.com/<mapp>/pages/spara?nummer=MS-ZZ00ZZ00` från språkets land: **alla 13 ✅**, 200,
rätt språk, eget land och egen valuta. Titlar: nb/da "Spor pakken", fi "Seuraa pakettia", en "Track your order",
de "Paket verfolgen", fr "Suivre mon colis", nl "Pakket volgen", es "Seguir mi pedido", it "Traccia il pacco",
pl "Śledź paczkę", pt-PT "Seguir encomenda", ja "配送状況を確認", zh-TW "追蹤包裹" (G-D03:s rätta adress).

### A6 Certifikat och omdirigeringar (prob Telia Stockholm, 16:50:27–16:51:19 UTC)

| Domän | https://www. | http:// | http://www. | Certifikat (sett utifrån) |
|---|---|---|---|---|
| .se | 301 → https://matstrumpor.se/ | 301 → https | 301 → https://www. | ok, t.o.m. 2026-11-07 (www 2026-11-05) |
| .com | 301 → https://matstrumpor.com/ | 301 → https | 301 → https://www. | ok, t.o.m. 2026-12-28 |
| .no | 301 → https://matstrumpor.no/ | 301 → https | 301 → https://www. | ok, t.o.m. 2026-12-28 |
| .eu | 301 → https://matstrumpor.eu/ | 301 → https | 301 → https://www. | ok, t.o.m. 2026-12-27 |

Inget certifikat går ut inom 30 dagar (.se närmast, 37 dagar; Shopify förnyar själv). myshopify-adressen t.o.m. 2026-12-04.

### A7 Svarstiden (186 mätningar med tid)

Inget över 2 000 ms. Högst: JP 1 645 ms (Oracle Tokyo, kampanjlänken), NZ 1 385, AU 1 151, TW 979.
Europa och Norden 35–600 ms. Fil: `matningar/A7-svarstider.json`, `A7-per-land.json`.

### F Sverige (16:43:59 och 16:50:18 UTC)

- `https://matstrumpor.se/` från SE (Telia): 200, sv, SE, SEK.
- `https://matstrumpor.se/products/sushi-strumpor` från SE = länken i de ACTIVE svenska annonserna:
  200, sv, SE, SEK, og:price 369. Shopify: 5 par 399, 3 par 369. Titel "Sushi-Strumpor – Matstrumpor.se".
- .com och .no skickar en svensk till .se. Inget tecken på skada.
