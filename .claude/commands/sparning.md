# /sparning [butik] – Skanningarna in i Shopify + kundens spårningssida (varje timme)

Argumentet är butiks-id:t i `sparning/butiker.json` (`node sparning/butik.mjs`
listar dem). **Utan argument = Bäverbutiken**, precis som förut. En rutin per
butik (Axels order 2026-09-20 kväll: samma system i alla Shopify-butiker):

| Butik | Kommando | Sida |
|---|---|---|
| Bäverbutiken (standard) | `/sparning` | https://baverbutiken.se/pages/spara |
| CaraShell | `/sparning carashell` | https://carashell.se/pages/spara |
| Beverbutikken (NO) | `/sparning beverbutikken` | https://beverbutikken.no/pages/spor |
| Bæverbutiken (DK) | `/sparning baeverbutiken` | https://baeverbutiken.dk/pages/spor |
| Majavakauppa (FI) | `/sparning majavakauppa` | https://majavakauppa.fi/pages/seuranta |
| Matstrumpor | `/sparning matstrumpor` | https://matstrumpor.se/pages/spara |

Rutinen gör två saker i en körning:

1. Skriver fraktbolagens skanningar in i Shopify som fulfillment-event, så
   orderstatussidans tidslinje fylls och notiserna "Ute för leverans" och
   "Levererad" går ut — på butikens språk (`sparning/sprak/<kod>.json`).
2. Bygger om **kundens spårningssida** (tabellen ovan), som visar de fem
   skedena på butikens språk med bävernummer. Shopifys egen orderstatussida
   kan bara rita tre streck med datum — det var därför sidan byggdes (Axels
   beslut 2026-09-19).

Läs `sparning/README.md` först om något är oklart — den bär hela bakgrunden.

Kör från repo-roten, i ordning, utan att fråga. `<butik>` nedan är
argumentet; för Bäverbutiken utelämnas `--butik` helt.

0. `git pull --rebase origin main`
   Rutinens session lever kvar mellan körningarna — utan pull kör den
   förra veckans kod och ser aldrig en rättad ordbok eller språkfil.
   Misslyckas pullen (konflikt): `git rebase --abort`, skriv det i
   rapporten och fortsätt med den kod som finns.
1. `node sparning/kor.mjs --butik <butik> --kolla`
   Exit 1 ⇒ stanna. Skriv exakt vad som saknas (nyckel eller rättighet)
   som rapport, rör inget annat. Saknar appen `read_orders`,
   `write_fulfillments` eller `write_content` är det Axels klick i Dev
   Dashboard (Cowork-prompten i `sparning/cowork/<butik>.md`) — inte något
   rutinen kan lösa.
2. `node sparning/kor.mjs --butik <butik>`
   Rundan: läser skickade ordrar, registrerar nya nummer hos 17TRACK,
   hämtar status, skriver fulfillment-event, bygger och publicerar
   spårningssidan. Visa utskriften.
   Sista raden ska säga att sidan lästs tillbaka **publikt** med ett känt
   spårningsnummer i kundens data — det är trippelkollen. Står det inte
   där gick sidan inte upp, och det ska stå i rapporten.
   ⚠️ Står det att meningar saknar översättning: lägg in dem i
   `sparning/sprak/<kod>.json` (svensk mening → butikens språk) och committa
   med lagefilen. En mening utan översättning når kunden på svenska.
2b. **Bara en butik som bär `mejl_sprak` i `sparning/butiker.json`
   (Matstrumpor sedan 2026-09-29):**
   `node mejl/notis-oversattning.mjs <butik> --skarpt --om-inaktuell`
   Fraktmejlen på kundens språk ligger som Shopifys egna översättningar av
   de tre fraktnotiserna. När någon klistrar om den svenska huvudmallen i
   admin märks de `outdated` — då registrerar skriptet dem igen och läser
   tillbaka. Stämmer allt redan gör det ingenting och skriver ingen fil.
   Skrev det: committa `mejl/output/butiker/<butik>/oversattningar/lage.json`
   med lagefilen i steg 3. Exit 1 = ett språk stämde inte vid
   tillbakaläsningen — skriv det överst i rapporten. Vägrar det för att
   "huvudmallen i Shopify är inte vår": rör ingenting, skriv det i rapporten.
   Säger det "Språk i butiken utan egna fraktmejl": ett nytt språk har
   publicerats (fler marknader kommer) och får Shopifys standardmejl tills
   `mejl/sprak/<kod>.json` + en rad i `mejl_sprak` finns — skriv språken i
   rapporten, bygg inte språkfilen i rutinen (den skrivs av sonnet och granskas).
3. Committa och pusha minnet. Lagefilen är `sparning/lage.json` för
   Bäverbutiken, annars `sparning/butiker/<butik>/lage.json` (+ butikens
   `konfig.json` med bokföringen). Flera rutiner pushar till `main` varje
   timme, så hämta först:
   `git pull --rebase origin main && git add <lagefil> <konfigfil> && git commit -m "sparning <butik>: <datum> — <N> event, <M> registrerade" && git push origin main`
   Lagefilen ÄR minnet. Pushas den inte registreras allt om nästa timme
   och 17TRACK-kvoten bränns. Nekas pushen: skriv det som första rad i
   rapporten.
   ⚠️ Committa ALDRIG `sparning/output/` eller `sparning/butiker/*/output/`
   — där ligger sidkroppen och paketlistan med alla skanningar (~1,2 MB per
   körning). Mapparna är gitignorerade; håll dem så.
4. Står det att fraser saknas i `sparning/fraser.json`: lägg in dem med
   svensk text i ordboken (och samma mening i `sparning/sprak/nb.json`,
   `da.json`, `fi.json`) och committa dem med lagefilen. Det är så
   ordboken växer — annars får kunden en generell mening i tysthet.
   Hitta inte på vad en fras betyder; kan den inte tolkas, lämna den och
   skriv det i rapporten.
5. Rapport, kort, på svenska:
   - butik, ordrar lästa, paket som följs, nya registrerade, event skrivna, fel
   - paket och skanningar på sidan, sidans storlek, om trippelkollen gick
   - 17TRACK-avvisningar med nummer och orsak, om några
   - fraser som saknades i ordboken, meningar som saknade översättning
   - om lagefilen pushades

Aldrig: skapa ordrar, ändra fulfillments, skicka mejl, röra andra butiker
än argumentets, röra temafiler. Skriptet skriver ENBART
`fulfillmentEventCreate` och `pageCreate`/`pageUpdate` på den egna sidan
(och i steg 2b `translationsRegister` på butikens tre egna fraktnotiser).

## DEFINITION OF DONE

- [ ] `--kolla` grön (eller rapporten säger exakt vad som saknas)
- [ ] Rundan körd, utskriften visad
- [ ] Spårningssidan publicerad och tillbakaläst i kundens vy (eller orsaken skriven)
- [ ] Steg 2b körd för en butik med `mejl_sprak` (eller: butiken har inga)
- [ ] Lagefilen committad och pushad till `main`, `output/` inte med
- [ ] Nya fraser inlagda i ordboken och språkfilerna, eller orsaken skriven
- [ ] Rapporten har siffrorna ovan
