# /koncept – Släng in en idé eller swipe till kommande batch

Argument: `$ARGUMENTS` — produkt-id + idén. Skriv `AKUT` sist om briefen ska göras direkt i stället för att vänta på nästa batch.
Exempel:
- `/koncept motorholjet hörde en kund säga att höljet räddade motorn i vinterförvaringen – testimonial-vinkel`
- `/koncept strandtofflorna swipe på denna: [länk/beskrivning av annonsen] AKUT`

## Gör följande

1. **Logga idén** i `products/<id>/backlog.md` med: datum, typ (`koncept` / `swipe`), beskrivning, källa/länk, status `väntar`. Skapa filen om den saknas.
2. **Om det är en swipe:** försök hämta och beskriva referensannonsen (Ad Library-länk går att slå upp; bild kan jag granska om den klistras in; annan länk — hämta sidan). Extrahera mekanismen (hook, struktur, proof, offer) — vi kopierar aldrig rakt av, vi tar mekaniken. Skriv extraktionen i backlog-posten så den överlever till nästa batch.
3. **Om `AKUT`:** bygg briefen nu — hypotes, isolerad variabel, komplett brief enligt leveransformatet (engelska, Swedish/English-tabell, naming med nästa lediga AD-ID i MagiBorsten-kontot). **Copyn/voiceovern skrivs av en subagent med `model: "sonnet"`** (strategin stannar hos huvudmodellen). Lägg i Notion som Draft – Pending approval, markera backlog-posten `[brief klar]`.
4. **Annars:** gör INGET mer — nästa `/cs` plockar upp den automatiskt. Bekräfta bara med backloggens aktuella innehåll som tabell.
5. Committa och pusha backlog-ändringen.

## DEFINITION OF DONE

- [ ] Idén loggad i backlog.md med typ, källa och status
- [ ] Swipe: mekanismen extraherad och nedskriven (inte bara länken)
- [ ] AKUT: brief levererad + Notion-item skapat, copy via sonnet-subagent
- [ ] Ej AKUT: ingen brief byggd — bara loggad + backloggen visad
- [ ] Pushad till repot
