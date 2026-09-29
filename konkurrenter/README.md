# konkurrenter/ — Konkurrentdödaren

Motorn bakom `/konkurrentdodaren` (Axels beställning 2026-09-27:
"Konkurrentdödar-rutinen. Den skickar ut ett mail automatiskt … Detta måste
jag granska först för att se om dom rippat"; 2026-09-29: "skicka från
Stonebite-mailen … vi skickar med en färdig faktura", och ett ärende ur
konkurrentens annonser även när hans sajt är ren). Noll npm-beroenden.

**Hittar kopior av våra produktsidor och annonser, lägger fram bevisen så att
Axel kan döma på en minut, och skickar ett varningsbrev med faktura — bara
efter hans ja, från bolagets egen mejl.**

```bash
node konkurrenter/kor.mjs --kolla                       # nycklar, butiker, avsändare, faktura, Ad Library, Chromium
node konkurrenter/kor.mjs --fraser                      # dagens produkter + fraserna att söka → output/<datum>.fraser.json
node konkurrenter/kor.mjs --hamta [--kandidater <fil>]  # hämta kandidaterna, jämför text + bilder → output/<datum>.json
node konkurrenter/kor.mjs --hamta --url <adress> [--produkt <handle>]   # Axels egen misstanke (en sida)
node konkurrenter/kor.mjs --hamta --annonser <fil.json>                 # Axels lista på konkurrentens annonser (annonsfall.mjs)
node konkurrenter/kor.mjs --rapport --torr              # visa rapporten, skriv inget
node konkurrenter/kor.mjs --rapport --discord           # ärenden, filer, läge, sida, Discord
node konkurrenter/kor.mjs --skicka KD-2026-001 [--till adress] [--sprak sv|en] [--kopare "Bolag AB, adress"] [--utan-faktura] [--paminnelse]
                                                        # SÄNDPAKETET: brev.txt + brev.json + faktura-<nr>.pdf i arenden/<id>/ — skickar inget
node konkurrenter/kor.mjs --skickad KD-2026-001 [--till adress] [--paminnelse]   # kvittot när brevet gått ut via Gmail
node konkurrenter/kor.mjs --faktura KD-2026-001 [--kopare …] [--cpm 98] [--land GB] [--ny-faktura]   # bara fakturan (CPM mäts ur Meta om --cpm saknas)
node konkurrenter/kor.mjs --skicka KD-2026-001 --via loopia --ja        # RESERV: skicka direkt från butikens kundtjänstbrevlåda
node konkurrenter/kor.mjs --avfarda KD-2026-001 "ingen kopia"
node konkurrenter/kor.mjs --foljupp                     # är kopian borta efter brevet?
node konkurrenter/kor.mjs --lista
```

## Flödet

1. **Korpus** (`korpus.mjs`): varje verksamhets butiker läses via den publika
   `/products.json` (ingen nyckel), de annonser som visas just nu via Meta
   (`META_ACCESS_TOKEN`, delade konton filtreras på kampanjprefix). Dagens
   produkter: annonserade + `bevaka` först, sedan rotation (aldrig kollad,
   äldst kollad; tak i `konfig.json` → `sok`). Två **fingeravtryck** per
   produkt: meningar på 7–16 ord utan siffror och utan butiksnamn.
2. **Sök** (`sok.mjs` + sessionen): fraserna söks inom citattecken av
   **sessionens WebSearch** (steg 2 i kommandot) och skrivs till
   `output/<datum>.kandidater.json`. Bing finns kvar som `--bing` men svarar
   en container med slumpsidor (mätt 2026-09-27: "baverbutiken" → Texas
   Longhorns, kartsajter); DuckDuckGo (bot-utmaning), Google (tom sida),
   Brave (429), Ecosia/Mojeek (403) spärrar. **Ad Library-API:t** frågas
   varje körning och svarar "saknar behörighet" tills token:ens ägare
   bekräftat sin identitet hos Meta (se nedan).
3. **Hämta** (`hamta.mjs`): sidan (Shopify-produkter via `.json`, kort
   `body_html` ⇒ sidans huvudtext), bilderna, e-post och org.nr på
   kontaktsidorna, plattform. Mottagaren väljs egen domän före gratismejl,
   kontakt/info/support före resten.
4. **Jämför** (`likhet.mjs`, `bild.mjs`): ordagranna sviter ≥ 8 ord (utan
   generiska fraser som "fri frakt"), täckning av våra 5-ordssekvenser, och
   dHash på bilderna i Chromium (stegvis nedskalning — original mot samma
   bild i 400 px ger avstånd 0–2, en annan bild 35). `sammanvag` ger
   styrkan: **stark** (kopierat stycke, ≥ 2 identiska bilder, eller 1 + text)
   eller **trolig**. Under tröskeln = inget ärende, men står i output-filen.
5. **Annonsfallet** (`annonsfall.mjs`, `--hamta --annonser <fil>`): när
   kopian sitter i konkurrentens ANNONSER och inte på hans sajt. Metas
   annonsbibliotek går inte att läsa härifrån, så Axel (eller sessionen)
   skriver ner annonserna — länk, text, rubrik, bilder/skärmdumpar (URL eller
   lokal fil) — i en JSON-fil (formatet står överst i `annonsfall.mjs`).
   Varje annons jämförs mot ALLA våra aktiva annonstexter (≥ 6 ord i följd)
   och produkttexter; deras bilder hashas mot våra annonsbilder (träffade
   produkters bilder först, sedan alla annonsbilder, aldrig hela katalogen).
   En rad per annons som matchar (`bevis.annonser`), två träffar = stark.
   Mätt 2026-09-29 på ett syntetiskt fall: 978 egna annonser + 257 produkter
   lästa, 2 av 3 annonser träffade (31 och 23 ord i följd), deras bild
   identisk med vår annonsbild. ⚠️ Bilderna tar tid första gången: 967 egna
   annonsbilder hashade på 274 s; `output/bildcache.json` gör nästa körning i
   samma container snabb. `--utan-bilder` hoppar bilderna.
6. **Ärenden** (`arenden.mjs`): `arenden.jsonl`, en rad per ändring, senaste
   raden per id vinner. `ny → skickad` går BARA med `av: 'axel'` — rutinen
   kan inte skicka. Samma domän + samma produkt = samma ärende; ett avfärdat
   föds inte om; ett åtgärdat som dyker upp igen blir ett nytt ärende med
   hänvisning.
7. **Brevet** (`brev.mjs`): svenska till svenska sidor (.se eller `lang=sv`),
   engelska till alla andra. Bara mätta bevis i bevislistan (per annons i
   annonsfallet; Axels lokala skärmdumpar står aldrig i brevet). Lagrummen:
   URL 1, 2, 49 a och 54 §§; MFL 5, 8 och 14 §§; Patent- och
   marknadsdomstolen. Frist 48 h, påminnelse 24 h. Aldrig VD:ns namn.
   Avsändaren är **bolaget** (`konfig.json` → `brev.avsandare`):
   Stonebite Ecom AB, `contact@stonebite.org`.
8. **Fakturan** (`faktura.mjs`): skälig ersättning enligt 54 § URL, **en rad
   per mätt sak**. **Beloppet per annons = deras exponeringar × vår CPM ÷ 1000**
   (Axels beslut 2026-09-29: "räkna ut det utifrån antalet exponeringar och
   sen bara fakturera det som de har spenderat på annonserna") — alltså vad
   annonsutrymmet de fått med vårt material kostar i samma kanal och land.
   Exponeringarna läser Axel av i annonsbibliotekets EU-ruta ("Total reach")
   och skriver i annonsfilen (`exponeringar`/`reach`, tal eller "12,3 tn");
   **CPM:en gissas inte utan mäts** ur våra egna konton (`cpm.mjs`: Meta
   insights, `last_30d`, per verksamhet, delade konton på kampanjprefix,
   `cpm: false` på CaraShells US-konto). Mätt 2026-09-29: Bäverbutiken
   97,9 kr, CaraShell 141,5 kr, Matstrumpor 130,8 kr — reserven i konfig
   används bara när Meta inte svarar, `--cpm <kr>` vinner alltid. Annons utan
   tal, produkttext och lösa bilder går på schablontaxan (`faktura.taxa`,
   märkt "schablon"); `minst_per_annons` är 0 (Axels "bara"). **Moms:** 25 %
   till svenska köpare (Axels svar: B2B), 0 % med omvänd betalningsskyldighet
   till utländska näringsidkare (landet ur `--land`, annars domänen, annars
   brevets språk); momsreg.nr härleds ur org.nr. Nummer `F-<ärende>-<löpnr>`,
   10 dagar netto, dröjsmålsränta enligt räntelagen. HTML → PDF i Chromium
   (`page.pdf`, 2 s). **Utan bankgiro/IBAN i konfig vägrar den** — och ett
   IBAN som inte klarar kontrollsiffran (mod 97) stoppar också; Axels IBAN
   inlagt 2026-09-29 och kontrollerat. Köparen läses ur deras sida
   (bolagsnamn/org.nr) eller ges med `--kopare "Bolag AB, adress"`. Belopp
   skrivs med vanligt mellanslag (Intl:s U+202F blir en ruta i äldre
   mejlklienter). Fakturan följer bara med FÖRSTA brevet, aldrig påminnelsen.
9. **Sändningen** (`skicka.mjs`): två vägar.
   - **Gmail (standard, Axels beslut 2026-09-29):** `--skicka` bygger
     sändpaketet `arenden/<id>/brev.json` (till, från, ämne, text, bilagor)
     + `brev.txt` + `faktura-<nr>.pdf` och skriver `brev.paket` på ärendet —
     statusen rörs inte. Sessionen lägger paketet som UTKAST i
     Stonebite-Gmail via Gmail-connectorn (eller skickar därifrån på Axels
     `--direkt`), och `--skickad <id>` är kvittot: `registreraSkickat` flyttar
     ärendet till `skickad`/`pamind` och sätter fristen. Kvittot kräver en
     giltig adress och går aldrig två gånger (`skickad → skickad` är ingen
     tillåten övergång).
   - **Loopia (reserv):** `--via loopia --ja` skickar från verksamhetens
     supportbrevlåda direkt (`kundtjanst/brevlada.mjs skickaNytt`). Spärrar:
     `--ja`, `KONKURRENTER_INGEN_SANDNING=1`, status, mottagare, egna
     domäner, brevlådan i miljön.
10. **Rapport och sida** (`rapport.mjs`, `sida.mjs`): svensk rapport med
    Axels uppgifter sist, engelsk Discord-post i `#copycats` bara när något
    är nytt, och granskningssidan (`output/sida.html`, publiceras som
    artifact på länken i `sida.json`) med bevisen sida vid sida (per annons i
    annonsfallet), skärmdumpen, fakturabeloppet, Gmail-flödet i klartext och
    kommandona att kopiera (`skicka`, `skickad` när paketet är byggt,
    `avfarda`, `paminn`, `eskalera`).

## Filer

| Fil | Committas | Vad |
|---|---|---|
| `konfig.json` | ✅ | Verksamheter, avsändare (Gmail), faktura (beräkning, CPM-reserv, moms, IBAN, schablontaxa), egna domäner, trösklar, Discord — facit |
| `arenden.jsonl` | ✅ | Ärendeloggen (kvittot på varje brev och faktura) |
| `arenden/<id>.md`, `arenden/<id>/skarmdump.jpg`, `arenden/<id>/miniatyrer.json` | ✅ | Bevisen per ärende |
| `arenden/<id>/brev.txt`, `brev.json`, `faktura-<nr>.pdf` + `.html` | ✅ | Sändpaketet: exakt det som lades i Gmail |
| `lage.json` | ✅ | När varje produkt kollades senast (rotationen), senaste körning |
| `sida.json` | ✅ | Granskningssidans artifact-länk: https://claude.ai/artifact/6JenXfVagtgw2THL8Q4y4v (publiceras om på samma länk varje körning) |
| `output/` | ❌ | Rådata, kandidater, annonsfiler, bildcache, skärmdumpar, sidan — dör med containern |

`KONKURRENTER_DATA=<mapp>` flyttar arenden.jsonl, arenden/, lage.json och
output/ dit (tester och provkörningar — repot rörs inte).

## Läget vid bygget (mätt 2026-09-27, kompletterat 2026-09-29)

- Butikerna: Bäverbutiken 248 produkter, CaraShell 4, Matstrumpor 5 — alla
  läsbara publikt. OPS-butikernas `body_html` är 25 ord (texten ligger i
  temat) ⇒ "för lite text att söka på"; källan är ändå Bäverbutikens sida,
  som speglas.
- Avsändaren är Gmail — inga brevlådelösenord behövs. Reserven `--via
  loopia` fungerar bara för Bäverbutiken i den här miljön
  (`KUNDTJANST_MAIL_PASS_BAVERBUTIKEN`); CaraShells och Matstrumpors ligger
  på Railway för autosvaret.
- Fakturan: IBAN ifyllt 2026-09-29 (`--kolla` säger "kontrollsiffran
  stämmer"); bankgiro och BIC tomma. Moms 25 % SE / omvänd utomlands — om
  redovisningskonsulten säger skadestånd utan moms: `moms_procent: 0`.
- **Ad Library:** `(#10) 2332002 Application does not have permission` med
  `META_ACCESS_TOKEN`; webbversionen ger 403 "Client challenge" i headless
  Chromium. Det är ett EGET program hos Meta (Ad Library API), skilt från
  appen och systemanvändaren som läser annonskontona: det kräver att en
  fysisk person bekräftat sin identitet **och en användartoken från den
  personen** — enligt Metas dokumentation räcker inte systemanvändarens
  token ("API LONG TERM"). Axels klick: https://www.facebook.com/ID
  (identitet), https://www.facebook.com/ads/library/api ("Kom igång"), sedan
  en token ur https://developers.facebook.com/tools/explorer som
  `META_ACCESS_TOKEN_ADLIBRARY` i Environments (`sok.mjs adLibraryToken`
  provar den först). Koden slår på källan själv när svaret blir 200. Tills
  dess: annonsfallet ovan.
- Meta: OPS-kontot svarar "(#1) Please reduce the amount of data" på
  200 annonser med breda fält — därför 50 per sida, smala fält och
  halvering vid felet (`korpus.mjs hamtaAnnonssidor`).
- Chromium: finns (Playwright i `/opt/node22/lib/node_modules/playwright`),
  3 bilder hashade på 440 ms, skärmdump 1280 × 2200 JPEG ≈ 200 kB, faktura-PDF
  på 2,2 s.

## Regler som sitter i koden

- Rutinen skickar aldrig ett brev; `overgang(ny → skickad)` kräver `av: 'axel'`.
- Ett brev per ärende; påminnelsen bara efter ett skickat brev; eskalering bara människan.
- Mottagaren får aldrig vara en av våra domäner; utan mottagare skickas inget.
- Bevislistan i brevet och fakturaraderna skrivs ur mätningarna, aldrig fritt.
- Ingen faktura utan bankgiro/IBAN (och IBAN:et måste klara mod 97), utan köparnamn, utan rader, på 0 kr, eller med exponeringar utan CPM.
- CPM:en är mätt (Meta, egna konton, samma land), aldrig gissad; reserven i konfig bär sitt mätdatum.
- Egna domäner (konfig + `sparning/butiker.json` + `kommentarer/konfig.json` +
  fabrikens filer) blir aldrig kandidater; marknadsplatser och sociala nätverk
  ignoreras.
- 30 tester utan nät: `node --test konkurrenter/test/*.test.mjs` (ingår i `npm test`).
