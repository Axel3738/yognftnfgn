# Spoks: Bäverbutikens mejl i Spoks i stället för Klaviyo

Axels order 2026-09-25/26: "bygg i spoks". Samma innehåll som Klaviyo
(`klaviyo/innehall/baverbutiken/`), konverterat till Spoks-block av
`konvertera.mjs` och uppladdat via Spoks-MCP:n. Det finns inget publikt Spoks-API,
så uppladdningen görs av en session, inte av ett skript.

```bash
node klaviyo/spoks/konvertera.mjs   # innehall → baverbutiken/payload/*.json + plan.json
```

Workspace: Bäverbutiken `f716ae36-68ae-4f1c-a45e-96c35d5637a0` (Shopify 4snrw0-mg).

## Läget 2026-09-26 (mätt med get_flows / draft_campaign)

Allt är INAKTIVT. Spoks-MCP:n kan inte slå på flöden, aktivera mejlsteg eller
skicka kampanjer. Det görs bara i appen, av Axel.

| Flöde | Spoks-id | Startar på | Väntan |
|---|---|---|---|
| F01 Välkomst | `b8165fed-50a2-42e4-a275-494433d3f7f0` | ny kontakt, subscribed | 1 min, 2 d, 3 d |
| F02 Övergiven kassa | `df764d97-2fb0-4469-8675-6337edcb7b1b` | checkout, inget köp sedan | 3 h, 1 d, 2 d |
| F03 Webbhistorik | `f9001da7-60cb-4742-bd5a-8d4397cfb0e6` | produktvisning | 4 h, 1 d |
| F04 Efter köp | `786d2580-b0e1-4e98-bc3d-404c435db62a` | order skapad | 3 d, 16 d |
| F05 Vinna tillbaka | `d27ea9f1-a609-425a-a7f5-8d900fecc366` | order, inget köp sedan | 120 d, 14 d |
| F07 Motorhölje → båtmotorskydd | `84cd7589-d549-4ad7-ab9d-c711384a4396` | order med Marin Motorhölje | 21 d, 7 d (hoppar den som redan köpt båtmotorskyddet) |
| F08–F13 Tips (bälteslip, taköverdrag, termoskydd, båtmotorskydd, IBC, sätesöverdrag) | `c7dc0fb1…`, `de6d925c…`, `e09a5094…`, `a94ef839…`, `74c973b4…`, `f6186338…` | order med produkten | 14 d |
| F14 Recension Trustpilot | `23d2710c-1a33-44c3-bb25-df1f691b6161` | order skapad (max var 90:e dag) | 16 d, 18:00 |
| Dubblett, tom | `e2ff6c1d-f0fa-4659-bb97-2c9d8fdb8c46` | heter "RADERA dubblett (tom)" | raderas i appen |

Flödena F01–F13 fanns redan: Spoks importerade dem själv från Klaviyo med
innehållet. Sessionen rättade det importen missade: tipsflödena och F07 hade
ingen trigger alls, väntan 12 dagar i stället för 14, och F07 filtrerade på
"totalt antal ordrar" i stället för om kunden redan köpt båtmotorskyddet.

Kampanjerna K01–K22 ligger som utkast (Spoks: status draft, avregistreringslänk på).

## Klaviyo avstängt 2026-09-26

`node klaviyo/stang-av.mjs --ja`: 13 flöden till draft, K01 återkallad till utkast. Inget raderat.
Spoks: plan Paid (inget månadstak), avsändaradress ej satt vid mätningen.

## Skillnader mot Klaviyo (Spoks kan inte)

- **Inget ordernummer i mejlet.** Spoks personalisering har bara kontaktfält,
  så F04:s knapp går till spårningssidan och kunden skriver numret själv.
- **Ingen "Fulfilled Order"-trigger.** F04, tipsflödena och F14 startar på
  *order skapad* med väntan räknad från köpet (F04 3 dagar, F14 16 dagar).
- **Inget orderradsblock.** "Det här fick du hem" i F14 utgår.
- **Ingen segmenttrigger.** F06 Sunset finns inte i Spoks. Den som inte öppnat
  på länge får fortfarande kampanjer tills Spoks egen suppression tar dem.
- Anonyma recensenter står som "Verifierad kund", aldrig "Anonymous".
