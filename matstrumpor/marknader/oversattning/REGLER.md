# Översättningsregler — Matstrumpor.se → nb / da / fi / en

Du översätter en svensk Shopify-butik (matstrumpor.se: strumpor som ser ut som mat — sushi,
pizza, hamburgare, donuts — i presentförpackning) till ett nytt språk för en ny marknad.
Källan är en JSON-fil `nyckel → svensk text`. Du levererar en JSON-fil med **EXAKT samma
nycklar**, varje värde på målspråket. Inget annat i filen.

## Marknaderna

| locale | marknad | valuta kunden betalar i | fraktrad | leveranstid |
|---|---|---|---|---|
| nb | Norge | NOK | Fri frakt til Norge | 5–10 virkedager |
| da | Danmark (marknaden "Europa": DK + FI) | DKK | Fri fragt til Danmark | 5–10 hverdage |
| fi | Finland (marknaden "Europa") | EUR | Ilmainen toimitus Suomeen | 5–10 arkipäivää |
| en | USA, UK, Australien, Kanada, Nya Zeeland — EN sida för fem länder | USD, GBP, AUD, CAD, NZD (kassan visar kundens) | Free shipping | 5–10 business days |

## Järnregler (varje brott är ett fel som stoppar leveransen)

1. **Samma nycklar, inga fler, inga färre.** Varje värde är en sträng. Tomt värde ("") är
   tillåtet BARA för nycklarna `liquid.ms-sista-dag.fars_dag` och `liquid.ms-sista-dag.jul` — de
   ska vara "" på alla fyra språken (löftet "framme till fars dag/jul" är mätt bara för Sverige;
   Danmarks fars dag är dessutom i juni). Allt annat får aldrig vara tomt.
2. **HTML, Liquid och länkar orörda.** Samma taggar i samma ordning (`<p>`, `<h3>`, `<strong>`,
   `<img …>`, `<a href=…>`, `<ul><li>`), samma attribut (`href`, `src`, `alt` får översättas,
   `class`, `data-*`, `dir`, `style` orörda). `{{ … }}` och `{% … %}` skrivs av tecken för tecken.
   Adresser, e-post (`kundsupport@matstrumpor.se`), URL:er, org.nr `559576-2401`, produkthandles
   och `shopify://…` ändras aldrig. Listor med `|` (t.ex. `a|b|c`) och prefix `ikon:` (t.ex.
   `truck:Fri frakt i Sverige|refresh:30 dagars öppet köp`) behåller exakt antal delar och prefix.
3. **Marknadens sanning, inte ordagrant.** "Fri frakt i Sverige" / "i hela Sverige" / "inom
   Sverige" / "till Sverige" ⇒ fraktraden i tabellen. "5–10 arbetsdagar" ⇒ leveranstiden i
   tabellen. "Alla priser anges i SEK" / "i svenska kronor" ⇒ marknadens valuta (nb NOK, da DKK,
   fi EUR; en: "in the currency shown at checkout"). **Inga SEK-belopp och inget "kr" i
   översättningen** — undantag: option-värdet `150,00 kr` (presentkortets valör, tekniskt) skrivs
   identiskt, och org.nr/adress.
4. **Aldrig ett nytt löfte.** Du får inte lägga till "gratis retur", "pengarna tillbaka",
   "snabb leverans", "express", garantier, rabatter eller siffror som inte står i källan.
   Du får inte heller ta bort ett villkor. Substansen i policyer och villkor är juridik:
   "svensk lag", "Distansavtalslagen", "ARN", "Konsumentverket", "EU:s tvistlösningsplattform",
   "14 dagars ångerrätt", "30 dagars retur från mottagandet" står kvar med SAMMA innebörd —
   du byter språk, aldrig regel. Skriv "under Swedish law" / "norsk oversettelse av svensk lov"
   i den formen som är naturlig, men aldrig lokal lag i stället.
5. **Siffror är siffror.** 30 dagar, 14 dagar, 5–10, 3 700, 1–2, 36–44, 2 par, 3 par, 4 par,
   5 par — samma tal på målspråket. Tusentalsavgränsare får följa språket (en: 3,700).
6. **Förbjudet i varje fil:** "Sjöhed", "Harestad", "sushisock", "Bäverbutiken", "baverbutiken".
   Adressen är STONEBITE ECOM AB, Stenkolsgatan 1B, 417 07 Göteborg, Sverige/Sweden/Norge…
   (landet översätts, gatan inte).
7. **Varumärket:** "Matstrumpor" och "Matstrumpor.se" skrivs alltid exakt så, på alla språk.
   Bolaget STONEBITE ECOM AB likaså.
8. **Produktnamn — använd ordlistan nedan, konsekvent i hela filen.** Bindestrecksformen
   "Sushi-Strumpor" är svensk typografi; på målspråket skrivs namnet naturligt.
9. **Option-värden:** `5 - Par` ⇒ nb `5 par`, da `5 par`, fi `5 paria`, en `5 pairs`;
   `3 - Par` på samma sätt. Talet MÅSTE stå först (temat läser första ordet som antal).
   `One Size` ⇒ nb `Én størrelse`, da `Én størrelse`, fi `Yksi koko`, en `One size`.
   Option-NAMN `Par` ⇒ nb `Par`, da `Par`, fi `Parit`, en `Pairs`; `Storlek` ⇒ `Størrelse` /
   `Størrelse` / `Koko` / `Size`; `Valörer` ⇒ `Verdi` / `Værdi` / `Arvo` / `Denomination`.
10. **Ton:** naturlig, varm, kort — copy som en infödd skulle skriva, inte skolöversättning.
    Korta meningar. Du till kunden (nb/da "du", fi "sinä"-form, en "you"). Skämtet i copyn
    ("de tror att det är sushi") ska fungera på målspråket. Rubrikers versalisering följer
    målspråket (en: Title Case bara där svenskan har versal på varje ord).
11. **Engelskan** är för fem länder samtidigt: inga amerikanska eller brittiska särord där ett
    neutralt finns (skriv "colourful"/"colorful" konsekvent — välj amerikansk stavning: color,
    favorite; det är USA-marknaden som är störst). Inga månadsnamn som antyder årstid
    (Australien har sommar i december). Ingen "Sweden" i fraktlöftet — bara "Free shipping".
12. Norska är **bokmål**. Danska och norska: kolla att du inte blandar (nb "gratis", da "gratis"
    men da "fragt", nb "frakt"; nb "kjøp", da "køb"; nb "sokker", da "sokker"; nb "til", da "til").
13. Menyraden `Ångra köp` (länk till kundkontot) ⇒ nb `Angre kjøp`, da `Fortryd køb`,
    fi `Peru ostos`, en `Cancel order`. `Spåra paket` ⇒ `Spor pakken` / `Spor pakken` /
    `Seuraa pakettia` / `Track your order`. `Kontakta`/`Kontakta Oss` ⇒ `Kontakt`/`Kontakt oss`,
    `Kontakt`/`Kontakt os`, `Yhteystiedot`/`Ota yhteyttä`, `Contact`/`Contact us`.
14. Paketnivåerna (`paket.*`): `Köp 1 – Få 1 GRATIS` ⇒ nb `Kjøp 1 – Få 1 GRATIS`, da
    `Køb 1 – Få 1 GRATIS`, fi `Osta 1 – Saat 1 ILMAISEKSI`, en `Buy 1 – Get 1 FREE`. Behåll
    tankstrecket och versalerna. `Mest Populär` ⇒ `Mest populær` / `Mest populær` / `Suosituin` /
    `Most popular`. `Äkta ätpinnar i trä (2 par)` ⇒ ordlistans namn + `(2 par)`/`(2 paria)`/`(2 pairs)`.
15. `liquid.*`-raderna är korta ord som sitter i temats kod: `Låda` (= en förpackning, "Box"),
    `gratis`, `par` (måttord efter ett tal), `värde` (som i "värde 50 kr" — nb `verdi`, da `værdi`,
    fi `arvo`, en `value`), `Gratis på köpet`, `Gratis per sushilåda`, `Välj paket`,
    `Populärast`, `Spara` (som i "Spara 20%"), `Slutsåld`, `billigare per` (som i "20 % billigare
    per par"), `st` (styck — nb `stk`, da `stk`, fi `kpl`, en `pcs`), `Egenskap`, `Ja`, `Nej`,
    `Verifierat köp`, `Trygg betalning`. Lika korta på målspråket.

## Ordlista (använd exakt)

| svenska | nb | da | fi | en |
|---|---|---|---|---|
| Sushi-Strumpor / Sushistrumpor | Sushisokker | Sushisokker | Sushisukat | Sushi Socks |
| Pizza-Strumpor | Pizzasokker | Pizzasokker | Pizzasukat | Pizza Socks |
| Hamburgare-Strumpor | Hamburgersokker | Burgersokker | Hampurilaissukat | Burger Socks |
| Donut-strumpor | Donutsokker | Donutsokker | Donitsisukat | Donut Socks |
| Äkta ätpinnar i trä | Ekte spisepinner i tre | Ægte spisepinde i træ | Aidot puiset syömäpuikot | Real wooden chopsticks |
| matstrumpor (gemen, som begrepp) | matsokker | madsokker | ruokasukat | food socks |
| Presentkort | Gavekort | Gavekort | Lahjakortti | Gift card |
| Alla Produkter | Alle produkter | Alle produkter | Kaikki tuotteet | All products |
| Strumporna (kollektion) | Sokkene | Sokkerne | Sukat | The socks |
| Startsida | Hjem | Forside | Etusivu | Home |
| 30 dagars öppet köp | 30 dagers åpent kjøp | 30 dages fortrydelsesret | 30 päivän palautusoikeus | 30-day returns |
| Levereras presentklart | Leveres klar som gave | Leveres klar som gave | Toimitetaan lahjavalmiina | Arrives gift-ready |
| Handla nu | Handle nå | Køb nu | Osta nyt | Shop now |
| Köp nu | Kjøp nå | Køb nu | Osta nyt | Buy now |
| Fri frakt (ensamt) | Fri frakt | Fri fragt | Ilmainen toimitus | Free shipping |
| Standard (fraktsätt) | Standard | Standard | Standard | Standard |
| Vanliga frågor | Vanlige spørsmål | Ofte stillede spørgsmål | Usein kysyttyä | FAQ |
| Kundtjänst / kundsupport | kundeservice | kundeservice | asiakaspalvelu | customer support |

## Leverans

Skriv målfilen med `Write` till exakt den sökväg du fått. Sedan: svara BARA med JSON
`{"fil": "<sökväg>", "nycklar": <antal>, "noteringar": ["<max fem korta rader om val du gjort som granskaren bör veta>"]}`.
Ingen annan text.
