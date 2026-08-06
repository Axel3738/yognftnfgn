# Ny marknad — projektunderlag

Underlag för att bygga upp en komplett Shopify-butik för en ny marknad, med utgångspunkt
i en befintlig butik. Skapat 2026-08-06 utifrån en läs-inventering av den Shopify-butik
som är kopplad till sessionen: **Bäverbutiken.se**.

**Status: GROVJOBB PÅGÅR.** Beslut: källa = Bäverbutiken.se, mål = **beverkobling.no**
(Norge, bokmål, NOK). Se `BESLUT.md`. Full export klar (`source-export/`), norsk katalog
och norskt butiksinnehåll byggs i `no/`. Inga ändringar har gjorts i källbutiken —
allt är läsning, och inget publiceras i målbutiken utan uttryckligt GO.

| Fil | Innehåll |
|-----|----------|
| `01-information-och-atkomst.md` | All information och åtkomst som behövs innan implementering |
| `02-inventering-baverbutiken.md` | Inventering av den befintliga butiken (nuläge, brister, observationer) |
| `03-projektplan.md` | Projektplan i faser, med beroenden och beslutspunkter |
| `04-automatisering-vs-manuellt.md` | Vad som kan automatiseras vs vad som kräver manuell kontroll |
| `05-lanseringschecklista.md` | Checklista före lansering |
| `06-ansvarsfordelning.md` | Ansvarsfördelning mellan dig och Claude |
| `07-fragor-att-besvara.md` | Frågorna som definierar projektet — besvaras först |

## Arbetsprinciper (fasta)

1. **Ingen oåterkallelig ändring utan säkerhetskopia/export först** (produkt-CSV,
   temaexport, kopior av policytexter och sidor).
2. **Ingen publicering av butik och inga köp** utan uttryckligt godkännande.
3. Juridiskt känsligt innehåll (policyer, produktpåståenden, prismarknadsföring)
   markeras `[JURIDISK GRANSKNING]` och slutgranskas externt.
4. Inget innehåll kopieras rakt av från tredje part (bilder, texter, varumärken)
   utan dokumenterad rättighet.
