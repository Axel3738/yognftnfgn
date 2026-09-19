# /sparning – Skanningarna in i Shopify + kundens spårningssida (varje timme)

Rutinen gör två saker i en körning:

1. Skriver fraktbolagens skanningar in i Shopify som fulfillment-event, så
   orderstatussidans tidslinje fylls och notiserna "Ute för leverans" och
   "Levererad" går ut.
2. Bygger om **kundens spårningssida**, https://baverbutiken.se/pages/spara,
   som visar hela kedjan på svenska med ort och tid. Shopifys egen
   orderstatussida kan bara rita tre streck med datum — det var därför sidan
   byggdes (Axels beslut 2026-09-19).

Läs `sparning/README.md` först om något är oklart — den bär hela bakgrunden.

Kör från repo-roten, i ordning, utan att fråga:

1. `node sparning/kor.mjs --kolla`
   Exit 1 ⇒ stanna. Skriv exakt vad som saknas (nyckel eller rättighet)
   som rapport, rör inget annat.
2. `node sparning/kor.mjs`
   Rundan: läser skickade ordrar, registrerar nya nummer hos 17TRACK,
   hämtar status, skriver fulfillment-event, bygger och publicerar
   spårningssidan. Visa utskriften.
   Sista raden ska säga att sidan lästs tillbaka **publikt** med ett känt
   spårningsnummer i kundens data — det är trippelkollen. Står det inte
   där gick sidan inte upp, och det ska stå i rapporten.
3. `git add sparning/lage.json && git commit -m "sparning: <datum> — <N> event, <M> registrerade" && git push origin main`
   Lagefilen ÄR minnet. Pushas den inte registreras allt om nästa timme
   och 17TRACK-kvoten bränns. Nekas pushen: skriv det som första rad i
   rapporten.
   ⚠️ Committa ALDRIG `sparning/output/` — där ligger sidkroppen och
   paketlistan med alla skanningar (~1,2 MB per körning). Mappen är
   gitignorerad; håll den så.
4. Står det att fraser saknas i `sparning/fraser.json`: lägg in dem med
   svensk text i ordboken och committa den med lagefilen. Det är så
   ordboken växer — annars får kunden en generell mening i tysthet.
   Hitta inte på vad en fras betyder; kan den inte tolkas, lämna den och
   skriv det i rapporten.
5. Rapport, kort, på svenska:
   - ordrar lästa, paket som följs, nya registrerade, event skrivna, fel
   - paket och skanningar på sidan, sidans storlek, om trippelkollen gick
   - 17TRACK-avvisningar med nummer och orsak, om några
   - fraser som saknades i ordboken
   - om `lage.json` pushades

Aldrig: skapa ordrar, ändra fulfillments, skicka mejl, röra andra butiker,
röra temafiler. Skriptet skriver ENBART `fulfillmentEventCreate` och
`pageCreate`/`pageUpdate` på den egna sidan.

## DEFINITION OF DONE

- [ ] `--kolla` grön (eller rapporten säger exakt vad som saknas)
- [ ] Rundan körd, utskriften visad
- [ ] Spårningssidan publicerad och tillbakaläst i kundens vy (eller orsaken skriven)
- [ ] `sparning/lage.json` committad och pushad till `main`, `output/` inte med
- [ ] Nya fraser inlagda i ordboken, eller orsaken skriven
- [ ] Rapporten har siffrorna ovan
