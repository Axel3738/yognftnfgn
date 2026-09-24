# E-post-SOP:erna — vad det här är

VA:ns handbok för e-postmarknadsföringen i Klaviyo. **Allt utom den här filen är
på engelska** — VA:n läser engelska, du läser svenska. Strategin bakom står i
`docs/os/EPOST-STRATEGI.md`, kommandot är `/klaviyo`.

Skriven 2026-09-24, innan första utskicket. Inget är provat mot Klaviyo-kontot
än (ingen API-nyckel fanns). Stämmer en klickväg inte när VA:n väl sitter i
Klaviyo: rätta filen, inte hennes minne.

---

## Filerna

| Fil | Vad den säger |
|---|---|
| `E00-START-HERE.md` | Vad systemet är, butikens värden (den ENDA sidan som ändras per butik), vad hon gör och aldrig gör, ordlistan |
| `E01-WEEKLY-LOOP.md` | Veckans loop: resultat → lärdom → koncept → copy → bygg → QA → ditt ok → schemaläggning, och vem som gör vilket steg nu och sen |
| `E02-BUILD-A-CAMPAIGN.md` | Öppna Claudes utkast, kolla segmentet, A/B med de tre ämnesraderna, testmejl, schemalägg |
| `E03-QA-BEFORE-SEND.md` | 24 punkter före varje utskick: pris mot produktsidan, länkar, bilder, mobil, avregistrering, inga tankstreck, inga "30 dagar", inga påhittade recensioner, rätt datum |
| `E04-READ-RESULTS.md` | Hur ett utskick läses dag 7, grinden (3 ordrar och 500 levererade), etiketterna, lärdomsmallen med exempel |
| `E05-FLOWS.md` | De sex flödena, att bara du slår på dem, Shopifys egen övergivna-kassa-notis, veckokollen |
| `E06-LIST-HEALTH.md` | Uppvärmningstrappan, larmgränserna (avreg 1 %, spam 0,3 %, studs 2 %), vad hon gör vid larm, sunset |
| `E07-ESCALATE.md` | När hon alltid frågar dig och hur (Discord, engelska, en fråga med alternativ) |

## Portabelt till nästa butik

Butikens värden står bara i E00, avsnitt 2. Matstrumpor = kopiera mappen, byt
tabellen i E00, klart. Hittar någon ett butiksvärde i E01–E07 hör det hemma i E00.

## Ordningen VA:n lär sig i

1. **E00** första dagen, hela.
2. **E03 QA** — hon granskar det Claude byggt. Kan inte skicka något av misstag.
3. **E02 schemaläggning** — först när QA gått rätt.
4. **E04 läsa resultat** — hon läser siffrorna, Claude skriver lärdomen.
5. **E05 flöden** och **E06 listhälsa** — den dagliga koll som kräver omdöme vid larm.

Strategi, koncept och copy flyttas inte till VA:n. Det är huvudsessionen och
Sonnet (CLAUDE.md regel 6).

## Arvids princip: när ett steg flyttas från Claude till VA:n

Ett steg flyttas **först när Claude gjort det rätt tre veckor i rad**: checklistan
grön, inget larm, i tid, och ingen rättelse från dig. Sedan gör VA:n steget två
veckor med Claude som kontroll. Först därefter är det hennes.

| Steg | Claude rätt veckor i rad | VA:n med kontroll | VA:ns eget |
|---|---|---|---|
| E03 QA | 0 | — | — |
| E02 A/B + schemaläggning | 0 | — | — |
| E04 läsa resultat | 0 | — | — |
| E05 flödeskoll | 0 | — | — |
| E06 listhälsa | 0 | — | — |

Tabellen uppdateras av `/klaviyo cs` varje måndag. En vecka med rättelse börjar
om räkningen på 0.

## Det du alltid gör själv

Godkänna varje utskick, slå på flöden, rabatter och erbjudanden, samtyckesgrunden,
sista beställningsdagarna. VA:n får inte göra något av det, och det står i E00.
