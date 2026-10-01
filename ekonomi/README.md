# ekonomi/ — bättre koll på siffrorna (Evolve Finance)

Byggd 2026-10-01 efter Axels order: "gå igenom Evolve Finance så att du har all data, kolla
igenom min business och se vad jag saknar … och vad vi behöver göra".

| Fil | Vad |
|---|---|
| `LUCKOR.md` | **Börja här.** Vad som saknas per butik mot kursen, med september i siffror och vem som gör vad. |
| `evolve/FINANCE.md` | Hela Evolve Finance på svenska: contribution margin, LTV, barometrarna, kassaflödescykeln, Meta Billing, chargebacks. |
| `evolve/SUPPLY-CHAIN.md` | Evolve Supply Chain Program (Kanary), 15 lektioner — översikt + noter per lektion i `evolve/supply/`. |
| `evolve/OVRIGT.md` | Relevanta lektioner i andra Evolve-kurser: P&L, kundanskaffning, KPI-mål, ROAS-mål, Q4, Matedropshipping, Dubai-mastermindet. |
| `evolve/kalla/` | Källorna: lektionstexterna, undertexterna, bildspelens text, LTV-mallen, Melio-dokumentet. |
| `barometrar.mjs` + `berakna.mjs` | Kursens modul 1–4 på våra siffror (se nedan). |
| `konfig.json` | Verksamheter och annonskonton som inte står i `stonebite/varumarken.json`. |
| `rapporter/` | Körningarna, en per dag (`barometrar-<datum>.md` och `.json`). |
| `cowork/1-kassa-och-avgifter.txt` | Cowork LÄSER utbetalningsschema och avgifter i Shopify och hur Meta betalas (kort, gräns, månadsfaktura). Underlaget för kassakalendern (lucka 4). |

Lagret och leverantören har egna mappar: `lager/` och `leverantor/`.

## Barometrarna

```bash
node ekonomi/barometrar.mjs                          # alla verksamheter, skriver till skärmen
node ekonomi/barometrar.mjs --skriv                  # + ekonomi/rapporter/barometrar-<datum>.md/.json
node ekonomi/barometrar.mjs --verksamhet matstrumpor
node --test ekonomi/test/*.test.mjs
```

Läs-bart mot Shopify och Meta. Per verksamhet ur `stonebite/varumarken.json` (+ Norge och
Finland för sig, `konfig.json`):

| Tal | Hur | Kursen |
|---|---|---|
| Nettoomsättning | orderns nuvarande summa minus moms (återbetalt är avdraget), i kronor med ECB-kursen | |
| nCAC | all reklam i perioden ÷ **nya kunder i Shopify** samma period | modul 2: "aldrig ur Facebook" |
| Ny kund | kundens första order, och bara när vi ser minst 180 dagar bakåt (eller butiken öppnade inom fönstret) | |
| Bidrag före reklam | netto − varukostnad (Cost per item, Matstrumpors utland ur `matstrumpor/cogs.json`) − avgifter − tull | modul 1 |
| Kvar per ny kund | bidrag före reklam på första ordern − nCAC | modul 1: "första ordern bär reklamen" |
| Kohorter | per månad för första köpet: kronor och bidrag per kund, kumulativt, mot den månadens nCAC | modul 2: LTV-mallen |
| Stresstest | CAC +20 %, LTV −20 %, varukostnad +5 procentenheter | modul 3 |

Regler som sitter i koden:

- **En halv försäljning delas aldrig med hela reklamen.** Saknas en butik eller ett konto i
  verksamheten blir alla reklamtal tomma, med orsak (samma regel som MER på sajten).
- Saknad varukostnad räknas med butikens uppmätta procent och **täckningen skrivs ut**. Finns ingen
  kostnad alls blir bidraget tomt, aldrig noll.
- Avgifterna är uppmätta ur snapshoten (Shopify Payments, även avgifter i annan valuta). Saknas
  butiken där: antagna 3 % (kursens siffra), och det står i rapporten.
- Tullen 2,8 EUR per order (`stonebite/kostnader.json`), som på sajten.
- Matstrumpors annonser förra säsongen gick i SnarkLös (kampanjerna SUSHI…) — `konfig.json` →
  `extra_konton` räknar in dem, annars blir december 2025 utan reklam.
- Bäverbutiken SE kräver `SHOPIFY_*_BAVERBUTIKEN_EMAILSCRAPER` (finns i `/stonebite`-rutinens miljö).
  I en vanlig session svarar `SHOPIFY_*_SE` 403 och hela Bäverbutiken blir ofullständig.

## Mätt 2026-10-01

Se `LUCKOR.md` → "Läget". Kort: 68–194 kr kvar per ny kund efter reklam, nästan inget återköp,
varukostnad över 30 % i Norge och CaraShell, alla annonskonton betalas med kort.
