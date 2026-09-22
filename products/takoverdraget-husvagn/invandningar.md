# Invändningsmatris — Taköverdraget för Husvagn

Vilka invändningar kunderna faktiskt har, och vilka av dem vi har svarat på.
**Tomma rutor är nästa brief.** Den här filen är produktminne — den läses innan
en briefrond och uppdateras efter (`node tools/invandningsmatris.mjs`).

Mätt 2026-09-22. Källa: 29 kommentarer på `Takoverdrag_SP_4_H1` (34 142 kr, kampanjens största annons), 45 dagar, via `tools/annonskommentarer.mjs`. Formaten lästa ur kontot: 64 annonser i kampanjen, 2 med vinkelkoden OB.

⚠️ Supportmejlen är INTE med: mejlen kan inte läsas — saknar KUNDTJANST_MAIL_PASS_BAVERBUTIKEN. Kör om i en container som har nyckeln: `node kundtjanst/mail.mjs sok "husvagn,taköverdrag,takoverdrag,husbil"`.

## Vad kunderna invänder

29 poster i källorna (29 kommentarer, 0 mejl). Andelen räknas på alla poster.

| Invändning | Antal | Andel | Kommentarer | Mejl |
|---|---|---|---|---|
| **Fukt / mögel / ventilation** | **11** | 38 % | 11 | 0 |
| Önskemål | 2 | 7 % | 2 | 0 |
| Skepsis / kritik | 1 | 3 % | 1 | 0 |
| Fungerar det | 1 | 3 % | 1 | 0 |

Ordagrant, de tyngsta (kundnamn och adresser aldrig):

> Man ställer alltid en vagn vid förvaring med lutning bakåt eller framåt. Taktäckning förstör husvagnen självdrag via takluckorna. Rekommenderas ej.
> Ställ vagn på en RIKTIG Vinterförvaring så slipper man all tyngd av snön. Att täcka så där Välkomnar du Kondens och fukt
> Skulle vara ännu bättre om det fans lösa sidor att dra fast för även vita sidor å fönster tar mycket stryk efter en lång vinter. Jag vet‼️ efter många år med va
> Hans Lindman Va min kommentar svårt att förstå. Takskyddet ser lätt ut att få på men jag tycker att man skyddar vagnen för lite. Jag har heltält men det är väld
> Skräp
> Blåser det inte sönder?? Har haft flera, nåde heltäckande och taktöckande som bara blåser sönder....

## Matrisen

| Invändning | Video-svar | Statisk | Demo | Jämförelse |
|---|---|---|---|---|
| **Fukt / kondens / självdrag** (38 %) | `OB_4_H1` briefad, ej live | ⬜ | ⬜ | ⬜ |
| Önskemål (7 %) | ⬜ | ⬜ | ⬜ | ⬜ |
| Blåser sönder (3 %) | `Takoverdrag_OB_1_H1` live | ⬜ | ⬜ | ⬜ |
| Vattentätt | `OB_3_H1` briefad, väntar film | ⬜ | ⬜ | ⬜ |
| Förvaring | `Takoverdrag_OB_2_H1` live | ⬜ | ⬜ | ⬜ |
| Täcker för lite | ⬜ | ⬜ | ⬜ | ⬜ |

**Täckning:** fukt 0 av 4 format (+1 briefad) (38 %) · önskemål 0 av 4 format (7 %) · blåser 1 av 4 format (3 %) · vattentätt 0 av 4 format (+1 briefad) · förvaring 1 av 4 format · täcker 0 av 4 format.

## Varför det här är produktens viktigaste lucka

Kampanjen hade 34 annonser när matrisen skrevs, fördelade på vinkel:
SP 6 · CS 8 · PD 6 · GT 7 · BOF 3 · RI 1 · UG 1 · CO 2 · LI 1 · TR 1 — och
**noll OB**. De två OB-annonser som fanns låg i listicle-kampanjen och pekade på
listicle-sidan; de kopierades in i huvudkampanjen 2026-09-22.

38 % av allt kunderna säger emot handlar om fukt. Trettiofyra annonser svarade
inte på det med en enda rad.

Det förklarar CPA-kurvan bättre än "creative fatigue" gör. CPA gick 147 → 466 kr
mellan 12 och 21 september medan dagsspenden femdubblades — Meta gick till
kallare husvagnsägare, och deras första tanke är *"då möglar taket"*. Vi betalade
för trafik som stoppades av en invändning vi aldrig bemött.

## Mekanismen som svarar på fukt-invändningen

Står redan på produktsidan och behöver inte hittas på: **remmar på fyra sidor som
hakas i en krok i nederkanten, inte ett heltäckande överdrag.** Sidorna står
öppna, luften rör sig, takluckornas självdrag fungerar. Det går att visa på film.

⚠️ Säg aldrig "dragsko" — produktsidan har noll träffar på ordet (mätt
2026-09-22). Och aldrig "vattentät" som ett blankt påstående; sidan säger att
regnet rinner av den silverbelagda 210D-väven.

## Evolve-testet som matrisen är svaret på

Kursen skiljer creative fatigue från marknadsmättnad så här: lansera en färsk
batch i samma marknad. Funkar den var annonserna slitna. Floppar allt trots
kvalitet är köparpoolen slut, och då hjälper inga fler annonser — då är det ny
produkt eller nytt land som gäller.

**Fukt-raden är det testet.** Den är inte en batch till på samma tema; den är
första gången vi svarar på produktens största invändning. Går den inte hem är
Sverige verkligen mätt.
