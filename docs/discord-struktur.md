# Discord-strukturen — analys och målbild

Avläst mot Discords API 2026-08-30, innan teamet joinar.
Servern: **Bäverbutiken**, 4 medlemmar i dag.

---

## Vad som är fel i dag

| Problem | Varför det spelar roll |
|---|---|
| **Ingen roll har några rättigheter** | Rollerna är rent kosmetiska. Alla har i praktiken samma makt som `@everyone`. |
| **`CEO` ligger på position 1** | Under *Video editor*, *Product creators* och *Head of customer support*. Rollordningen är omvänd mot verkligheten. |
| **Alla kanaler är öppna för alla** | Ingen enda kanal har en skrivregel. Rutinernas rapporter drunknar i chatt, och ingen vet vilka kanaler som är "läs bara". |
| **`@everyone` har MENTION_EVERYONE** | Vem som helst kan pinga hela servern. Med ett växande team blir det brus, och folk stänger av notiser — då missar de uppgifterna. |
| **Bävern har ADMINISTRATOR** | Boten behöver bara hantera kanaler och roller. Administrator ger den rätt att kicka, banna och radera allt. |
| **Ingen check-in-kanal** | Det finns ingenstans där någon frågar hur det går, och ingenstans de vet att de får fråga om hjälp. |

### Spärren som måste lösas först

Botens roll **Bävern** ligger på position 1 — under alla teamroller.
Discords rollhierarki är absolut: en bot kan aldrig ändra en roll som ligger
på eller över dess egen position, **inte ens med Administrator**. Verifierat:
`PATCH /roles/<Video editor>` svarar `403 Missing Permissions`.

Axel måste dra **Bävern** överst i rollistan. Ett handgrepp, och sedan går
resten att göra automatiskt.

---

## Målbild

### Roller, uppifrån och ned

| # | Roll | Rättigheter | Vem |
|---|---|---|---|
| 1 | **CEO** | Administrator | Axel |
| 2 | **Bävern** | Hantera kanaler + hantera roller. Aldrig Administrator. | boten |
| 3 | **Head of customer support** | Hantera meddelanden, pinga @here | — |
| 4 | **Product creators** | Skriva, filer, trådar, reaktioner | Josh, Annabelle |
| 5 | **Video editor** | Skriva, filer, trådar, reaktioner | Jasper |
| 6 | **Customer support / VA** | Skriva, filer, trådar, reaktioner | — |
| 7 | `@everyone` | Läsa, reagera. **Ingen** MENTION_EVERYONE. | alla |

Poängen med hierarkin: den som ska godkänna någon annans arbete måste ligga
över den som utför det. I dag ligger CEO underst.

### Kanaler — tre sorter, tydligt åtskilda

**1. Infokanaler — bara Bävern skriver, teamet läser**

Rutinernas utdata. Ingen chatt får hamna här, annars scrollar dagens uppgift
bort. `@everyone` nekas SEND_MESSAGES; Bävern får den explicit.

- `#ads-to-edit` — nästa uppgifter. **Den viktigaste kanalen för teamet.**
- `#scaling` — dagliga rondens budgetbeslut
- `#new-products-coing-out` — nya produkter som börjat rulla
- `#nya-csv-för-nya-produktbatch-som-blivit-gjorda`
- `#monthly-comissions` — leaderboard

**2. Arbetskanaler — teamet skriver**

- `#general`
- `#translation-till-norge-av-nya-produkter`
- `#ai-image-ads`
- `#read-me` — låses till info; det är en instruktionskanal

**3. Nya kanaler som ska skapas**

- `#dagens-checkin` — Bävern frågar varje morgon (Manila-tid) hur det går.
  De svarar i tråd. Boten svarar tillbaka.
- `#fråga-bävern` — fritt att fråga vad som helst, dygnet runt. Här ligger
  tröskeln lägst: ingen ska behöva vänta på Axel för att komma vidare.

### Varför check-in-kanalen är värd mest

En redigerare som kör fast klockan 09:00 i Manila och inte vågar fråga
förlorar en hel dag innan Axel vaknar. En kanal där en bot *frågar först*
gör det normalt att svara — och den svarar direkt, på deras arbetstid.

---

## Ordningen bygget ska göras i

1. Axel drar **Bävern** överst i rollistan. *(bara detta är manuellt)*
2. Bävern: byt ADMINISTRATOR mot hantera kanaler + hantera roller.
3. `@everyone`: ta bort MENTION_EVERYONE.
4. CEO överst, Administrator.
5. Teamrollerna får sina rättigheter.
6. Infokanalerna låses: `@everyone` nekas skriva, Bävern tillåts.
7. `#dagens-checkin` och `#fråga-bävern` skapas.
8. Läs tillbaka allt och verifiera, kanal för kanal och roll för roll.

Steg 2–8 är automatiska och görs i en körning.
