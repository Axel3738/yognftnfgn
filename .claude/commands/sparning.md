# /sparning – Skanningarna in i Shopify (varje timme)

Rutinen som gör Shopifys orderstatussida till Bäverbutikens egen tracker och
får notiserna "Ute för leverans" och "Levererad" att gå ut. Läs
`sparning/README.md` först om något är oklart — den bär hela bakgrunden.

Kör från repo-roten, i ordning, utan att fråga:

1. `node sparning/kor.mjs --kolla`
   Exit 1 ⇒ stanna. Skriv exakt vad som saknas (nyckel eller rättighet)
   som rapport, rör inget annat.
2. `node sparning/kor.mjs`
   Rundan: läser skickade ordrar, registrerar nya nummer hos 17TRACK,
   hämtar status, skriver fulfillment-event i Shopify. Visa utskriften.
3. `git add sparning/lage.json && git commit -m "sparning: <datum> — <N> event, <M> registrerade" && git push origin main`
   Lagefilen ÄR minnet. Pushas den inte registreras allt om nästa timme
   och 17TRACK-kvoten bränns. Nekas pushen: skriv det som första rad i
   rapporten.
4. Rapport, kort, på svenska:
   - ordrar lästa, paket som följs, nya registrerade, event skrivna, fel
   - 17TRACK-avvisningar med nummer och orsak, om några
   - om `lage.json` pushades

Aldrig: skapa ordrar, ändra fulfillments, skicka mejl, röra andra butiker.
Skriptet skriver ENBART `fulfillmentEventCreate`.

## DEFINITION OF DONE

- [ ] `--kolla` grön (eller rapporten säger exakt vad som saknas)
- [ ] Rundan körd, utskriften visad
- [ ] `sparning/lage.json` committad och pushad till `main`
- [ ] Rapporten har siffrorna ovan
