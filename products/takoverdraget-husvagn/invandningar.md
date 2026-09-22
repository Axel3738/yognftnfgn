# Invändningsmatris — Taköverdraget för Husvagn

Vilka invändningar kunderna faktiskt har, och vilka av dem vi har svarat på.
**Tomma rutor är nästa brief.** Den här filen är produktminne — den läses innan
en briefrond och uppdateras efter.

Mätt 2026-09-22. Källa: 29 kommentarer på `Takoverdrag_SP_4_H1` (33 481 kr,
kampanjens största annons), 45 dagar, via `tools/annonskommentarer.mjs`.

⚠️ **Supportmejlen är INTE med.** `KUNDTJANST_MAIL_PASS_BAVERBUTIKEN` saknades i
containern vid mätningen. Den källan kan lägga till invändningar som inte syns i
kommentarerna — kunder som mejlar före köp gör det sällan offentligt. Kör om med
`node kundtjanst/mail.mjs sok "husvagn"` i en container som har nyckeln.

## Vad kunderna invänder

| Invändning | Antal | Andel |
|---|---|---|
| **Fukt, mögel, kondens, ventilation** | **11** | **38 %** |
| Täcker för lite (väggar och fönster tar stryk) | 2 | 7 % |
| Blåser det inte sönder? | 1 | 3 % |
| "Skräp" | 1 | 3 % |

Ordagrant, de tyngsta:

> "Taktäckning förstör husvagnens självdrag via takluckorna. Rekommenderas ej."
> "Att täcka så där välkomnar du kondens och fukt."
> "Taket torkar inte om man stänger in fukt."
> "Blåser det inte sönder?? Har haft flera, både heltäckande och taktäckande som bara blåser sönder."

## Matrisen

| Invändning | Video-svar | Statisk | Demo | Jämförelse |
|---|---|---|---|---|
| **Fukt / kondens / självdrag** (38 %) | `OB_4_H1` briefad, ej live | ⬜ | ⬜ | ⬜ |
| Blåser sönder | `OB_1_H1` live | ⬜ | ⬜ | ⬜ |
| Vattentätt | `OB_3_H1` briefad, väntar film | ⬜ | ⬜ | ⬜ |
| Förvaring | `OB_2_H1` live | ⬜ | ⬜ | ⬜ |
| Täcker för lite | ⬜ | ⬜ | ⬜ | ⬜ |

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
