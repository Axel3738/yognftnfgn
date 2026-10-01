# /enkat — köparenkätens svar in i enkätmappen (Matstrumpor, varje timme)

Rutinen för köparenkäten (`enkat/README.md`, Axels beslut A 2026-10-01: bara
Matstrumpor, ingen belöning). Den flyttar svaren ur kundtjänstens inkorg så att
Mechile slipper dem, och låter orderärenden stå kvar flaggade hos henne.

## Steg

1. `node enkat/las.mjs --skarpt`
   - Hittar Shopifys kontaktnotiser med markören `ENKAT-v1` på de tre senaste
     sidorna i kundsupport@matstrumpor.se.
   - Flyttar dem till `INBOX.ENKAT`. Ett svar som bär ett orderärende flaggas och
     stannar i inkorgen.
2. Skriv en rad i rapporten: antal svar, flyttade, orderärenden.
3. **Committa ALDRIG `enkat/output/`** (gitignorerad, svaren är persondata).
   Rutinen committar ingenting alls.

## Regler

- Läser och flyttar bara. Svarar aldrig, raderar aldrig, rör inga andra mejl.
- Felar inloggningen (403/sessionsfel): kör om en gång, sedan rapportera felet.
- Ingen Discord, ingen Slack. Axel läser svaren när han ber om det:
  `node enkat/las.mjs --mapp INBOX.ENKAT --sidor 10` (strukna svar i
  `enkat/output/`).

## Definition of done

- [ ] `las.mjs --skarpt` körd utan fel
- [ ] Rapportraden skriven
- [ ] Inget committat
