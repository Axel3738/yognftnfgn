# /mejl – Bygg och publicera Bäverbutikens kundmejl

Argument: `$ARGUMENTS` — tomt, eller `kollektion` (synka bara gratisprodukt-
kollektionen), eller `offline` (bygg utan Shopify).

Systemet: `mejl/README.md`. Erbjudandet "köp igen → välj en gratisprodukt"
ligger i `mejl/konfig.json`, texten i `mejl/copy.json`. Shopify har inget
API för notismallar — kedjan slutar i en sida Axel klistrar från.

## Gör följande, i ordning

### 1. Synka kollektionen
`node mejl/kollektion.mjs` — skapar/uppdaterar `/collections/din-gratisprodukt`
med produkterna i konfigen. Stoppar den på en handle som inte finns: rätta
konfigen, hitta aldrig på en produkt. Är argumentet `kollektion`: stanna här
och rapportera.

### 2. Bygg mallarna
`npm run mejl` (eller `node mejl/bygg.mjs --offline` vid `offline`). Läs
utskriften: gratisprodukterna och de tre dyraste. Är någon dyr produkt
uppenbart fel (t.ex. slut i lager, orimlig) — sätt `dyra_override` i
konfigen och bygg om. Kör `node --test mejl/test/*.test.mjs`; rött = fixa
innan något publiceras.

### 3. Titta på ett mejl
Öppna `mejl/output/forhandsvisning/orderbekraftelse.html` (skärmdump via
Chromium om det finns). Kontrollera: koden syns, fyra gratisprodukter, tre
dyra med pris, knappen pekar på `/discount/<kod>?redirect=/collections/…`.

### 4. Publicera sidan
Publicera `mejl/output/index.html` som Artifact (favicon ✉️, samma URL som
förra gången — leta med `action: "list"` efter "Bäverbutikens mejl" och
skicka `url`, annars blir det en ny länk). Skriv URL:en i `mejl/README.md`
under "Sidan" om den saknas.

### 5. Committa och pusha
`mejl/produkter.json` och `mejl/output/` committas — de är bevis på vad som
byggdes och gör `--offline` möjligt. Commit-meddelande på svenska.

## Leverans till Axel (kort, svenska)

- Vad som gjordes automatiskt (kollektionen, mallarna, sidan) — en rad var.
- Länken till sidan.
- **Hans uppgifter sist, numrerade**, exakt som på sidan: rabattkoden,
  åtta inklistringar, testmejlet, connectorn. Är rabattkoden redan skapad
  (fråga inte — kolla i Shopify om connectorn finns, annars säg att du inte
  kunde kolla) så stryks det steget.

## Definition of done
- [ ] Kollektionen finns och är publicerad, med rätt produkter
- [ ] `npm run mejl` grönt, testerna gröna
- [ ] Ett mejl tittat på (skärmdump eller fil öppnad)
- [ ] Sidan publicerad på samma URL som tidigare
- [ ] Committat och pushat
- [ ] Axels uppgifter står sist, numrerade
