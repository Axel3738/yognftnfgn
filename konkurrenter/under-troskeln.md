# Under Axels tröskel: bevisade kopior som inte blev ärenden

Här står kopior som är mätta och bevisade men ligger under `konfig.json → trosklar.annons`.
Tröskeln är minst 10 kopierande annonser live, eller över 10 000 i räckvidd på en annons.
`--rapport` skapar inget ärende för dem. Axels ord, `--rapport --tvinga`, gör dem till
ärenden. Skriv datum, sida, vad som mättes och Axels svar. Dataflödena i `output/` är
gitignorerade, så kommandot för att läsa om sidan står med.

## 2026-10-01: MatSokker i Norge (Matstrumpor)

- **Sidan och butiken:** Facebook-sidan MatSokker `1338643506004296` och butiken
  matsokker.shop. Shopify-butiken skapades 2026-09-30 kl 18:02 CEST och har temat
  "Shrine PRO", inte vårt. E-posten är matsokker@hotmail.com. Produkterna är "Sushi
  sokker" för 399 NOK och "Ekte trepinner (2 par)" för 100 NOK. Sidan påstår 4,9 av 5
  på 8 792 recensioner, men butiken var en dag gammal.
- **Hur den hittades:** sessionen sökte på `sushisokker` (NO) i annonsbiblioteket, efter
  Axels "kolla för matstrumpor.se".
- **Annonserna:** 9 aktiva, alla startade 2026-09-30, 6 filmer och 3 bilder.
  `node konkurrenter/kor.mjs --hamta --annonser-sida 1338643506004296 --land NO` gav
  STARK: 7 av 9 annonsbilder är identiska eller mycket lika våra (dHash). Det blev ingen
  text-träff, eftersom texten är översatt.
- **Vad som är vårt, sett av sessionen:**
  - Bildannonserna är våra svenska `036` (julstrumpan), `d3` (Köp 2 – få 2, pyramiden) och
    `d4` (Ser ut som mat), med norsk text.
  - Filmerna är våra svenska UGC-annonser med norska undertexter: "Det här är den perfekta
    balansen mellan praktiskt och oväntat" (troligen Katarinas), "Om du ska ge bort en
    present snart", "Jag gav min mamma den ultimata oväntade presenten" och "Jag trodde
    faktiskt det här var äkta sushi".
  - Annonstexten är vår `043` ("Ingen jublar åt tvättmedel. Ingen sparar en skämtpryl. …"),
    översatt ord för ord ("Ingen sparer på en spøk").
- **Det är ingen läcka.** Deras undertexter och texter är egna översättningar från
  svenskan, inte våra norska filer. Våra NO-kampanjer har 0 visningar, och ordvalen
  skiljer sig från våra norska versioner. Ett exempel är "Dette er den perfekte
  balansen", där vår egen version har "Det er liksom".
- **Tröskeln:** 7 kopierande annonser live, alltså färre än 10. Räckvidden syns inte
  utanför EU, så inget ärende skapades. Frågan A (anmäl) eller B (vänta) ligger hos Axel.
- ⛔ **Katarinas UGC får aldrig lämna Sverige** (Axel 2026-09-27). Här körs den troligen
  i Norge av någon annan.
- **Sverige samma dag:** sökorden sushistrumpor och sushi strumpor gav 143 träffar i sex
  datumfönster. Alla var våra (68 olika annonser). Produktfraserna för sushi-strumpor (sv)
  gav inga träffar utanför matstrumpor.se. Andra säljer liknande sushistrumpor (Fyndiq,
  CDON, Roliga Prylar), men inte med våra texter eller bilder.
