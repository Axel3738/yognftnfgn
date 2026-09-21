# Backend inför Q4 — Axels enkla sida

`backend-q4.html` är sidan Axel läser: hur ett paket går, vad som kan gå sönder
när volymen dubblas, och vilka svar vi väntar på (tre till Evolve-boten, tre
till agenten Canwangda). Skriven för grov dyslexi: stora bokstäver, korta rader,
ordlista sist. Inga påhittade siffror — allt är mätt i Shopify/Meta 2026-09-19.

**Publicerad länk (Axels konto, claude6):**
https://claude.ai/artifact/Kr3QcQb8HEnNzD5stWUZyp

## Uppdatera sidan

1. Redigera `backend-q4.html`. När ett svar kommer: fyll rutan `.svar` under
   rätt fråga, byt pillen från `vantar` ("Väntar på svar") till `klart`
   ("Svar klart"), och lägg en rad under "Uppdateringar" med datum.
2. Publicera om mot **samma** länk med Artifact-verktyget och `url`
   satt till länken ovan — utan `url` blir det en ny sida.
3. Committa och pusha.

Svaren som väntar (2026-09-21): Evolve A (lager hos agenten), B (december och
julgränsen), C (undvika hold hos Shopify Payments); Canwangda 1 (hanteringstid
i december), 2 (villkor för lager på hyllan), 3 (kapacitet per vecka).

Mätningarna sidan bygger på gjordes i sessionen 2026-09-19/21 (Shopify REST +
GraphQL, 17TRACK-läget i `sparning/lage.json`, Meta insights MagiBorsten):
order→fraktsedel 0,5 d median; fraktsedel→första skanning: 54 % oskannade vid
dag 4–5, 16 % vid dag 6–7; order→dörr: 54 % framme dag 14–15, p90 ≈ 23 d.
