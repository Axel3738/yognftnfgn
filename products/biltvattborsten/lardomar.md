# Lärdomar — Biltvättborsten med Teleskopskaft

En per etiketterad annons (docs/os/CS-KLART.md punkt 1–5). Skrivs av `node agent/lardom.mjs --skriv`; varje brief pekar på ett id här (`lardom=L-…`).

### Lärdom L-120250268493240291 — Biltvattborste_PD_1_H2 (SPEND_WINNER, etikett 2026-09-25)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | SPEND_WINNER |
| Fönster | 2026-09-18 – 2026-09-24 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 2 458 kr / 4 820 kr (51 %) |
| Köp | 5 |
| ROAS / CPA | 1,63 / 492 kr — kampanjens ROAS 1,16 |
| Konverteringsgrad | 3,0 % (5 köp / 167 LPV) |
| Hook rate / hold rate | 49 % / 16 % |
| Bedömbar | ja |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1: "Sluta sträcka dig över biltaket 🚗" · Rubrik: "Nå hela taket utan att sträcka dig" · Beskrivning: "Teleskopskaft + dubbelt borsthuvud för enklare biltvätt." · VO/bildhook: ej avläst — ffmpeg saknas i rutinens container och Metas thumbnail är 64 px; bara den live texten (Graph API, creative.body/title, 2026-09-25)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | bilägaren som tvättar själv och inte når taket (läst ur "Sluta sträcka dig över biltaket") | okänd |
| Vinkel | — (brief saknas i repot) | problem/lösning (PD): räckvidden — "utan stege eller kliv" | okänd |
| Medvetandenivå | — (brief saknas i repot) | problemmedveten | okänd |
| Mekanism | — (brief saknas i repot) | teleskopskaft (når hela bilen), dubbelt borsthuvud ("klar på halva tiden"), mjukt material som skonar lacken — sidans rader; 100 cm och 25 cm nämns inte | okänd |
| Tro | — (brief saknas i repot) | att man måste klättra/sträcka sig ⇒ "två fötter på marken, hela bilen ren" | okänd |
| Positionering | — (brief saknas i repot) | mot svamp + sträckning, inte mot en annan borste | okänd |
| Brådska | — (brief saknas i repot) | ingen ("Beställ din idag" utan deadline) | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Spend winner: läs FÖRST kommentarerna på annonsen (node tools/annonskommentarer.mjs --annons <id>) — vad invänder publiken mot? Sedan konverteringsgraden, sedan manuset. Saknas tro, brådska, insats eller funnel-kongruens? Lägg bara till den delen, bygg inte om hela annonsen.

**Hypotes (gissning):** Gissning: "Sluta sträcka dig över biltaket" bär spenden (51 %, hook rate 49 %) för att den pekar på en rörelse alla bilägare känner i ryggen, men ROAS 1,63 mot break-even 1,67 och konverteringsgrad 3,0 % på 799 kr säger att priset på sidan, inte hooken, stoppar köpet — kampanjen stängdes 2026-09-23 (STANG_AV, trappan) på precis det.

**Nästa annonser:**
- SLÄPP — kampanjen är avstängd (STANG_AV 2026-09-23); ingen brief till en kampanj som inte kör. Startar Axel om den (ATERAKTIVERA) är första iterationen `Biltvattborste_PD_1_H4`: samma hook, prisraden "799 kr (ord. 1 039 kr)" i klippet före CTA:n — annars är hooken utförd.

