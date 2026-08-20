# SOP-04: Daglig check-in — grönmarkera varje produkt, varje dag

**Ägare:** Managern. **Frekvens:** Varje morgon (vardagar), en körning per aktiv produkt.
**Tid:** ~5–10 min per produkt.

## Varför

Detta är ryggraden som gör att feedbacken ALLTID blir gjord: en enda daglig rutin
som tvingar fram (1) kvotläget, (2) kvalitetskontroll av allt redigerarna levererat,
(3) performance-larm och (4) UGC-deadlines. En dag är inte klar förrän den är ✅.

## Rutinen

1. Öppna en ny Claude Code-session i detta repo.
2. Skriv `/checkin produkt-id` (produkt-id:n står i `products/products.json`).
3. Claude gör jobbet: kvot, Slack-genomgång med kontrollfrågor, Notion-uppdatering,
   performance-larm, UGC-koll — och slutar med en sammanfattningstabell.
4. Managern gör bara två saker:
   - **Godkänner Slack-utkasten** för underkända leveranser (Claude skriver dem,
     managern trycker skicka — så tonen alltid är kontrollerad).
   - **Agerar på eskaleringar:** kill-kandidater och skalnings-kandidater skickas
     till ägaren (fram till att ägaren delegerat det beslutet).

## Grön dag = allt detta stämmer

- Kvotläget 0 eller plus (eller en konkret ikappkörningsplan för idag)
- Inga "klar"-rapporter i Slack utan körd kontrollfrågelista
- Inga obesvarade underkännanden äldre än 1 dag
- Inga UGC-deadlines passerade utan åtgärd

## Kontrollfrågorna (samma lista som i `/checkin`-kommandot — ändra HÄR om reglerna ändras, och uppdatera `.claude/commands/checkin.md`)

1. Filnamn följer naming-strukturen exakt
2. Exportformat kompletta (video 9:16 + 4:5 · bild 1:1 + 1080×1350)
3. Svenska texter ord-för-ord från briefen
4. Pris i annons = pris på landningssidan
5. Produkt i bild före sekund 4 (video)

## Om en dag missas

Kör P4 nästa morgon som vanligt — prompten tittar bakåt sedan senaste körningen.
Missas 2+ dagar i rad: säg till ägaren, det är ett bemanningsproblem, inte en detalj.
