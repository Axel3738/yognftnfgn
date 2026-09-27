# konkurrenter/ — Konkurrentdödaren

Motorn bakom `/konkurrentdodaren` (Axels beställning 2026-09-27:
"Konkurrentdödar-rutinen. Den skickar ut ett mail automatiskt … Detta måste
jag granska först för att se om dom rippat"). Noll npm-beroenden.

**Hittar kopior av våra produktsidor och annonser, lägger fram bevisen så att
Axel kan döma på en minut, och skickar ett varningsbrev — bara efter hans ja.**

```bash
node konkurrenter/kor.mjs --kolla                       # nycklar, butiker, brevlådor, Ad Library, Chromium
node konkurrenter/kor.mjs --fraser                      # dagens produkter + fraserna att söka → output/<datum>.fraser.json
node konkurrenter/kor.mjs --hamta [--kandidater <fil>]  # hämta kandidaterna, jämför text + bilder → output/<datum>.json
node konkurrenter/kor.mjs --hamta --url <adress> [--produkt <handle>]   # Axels egen misstanke
node konkurrenter/kor.mjs --rapport --torr              # visa rapporten, skriv inget
node konkurrenter/kor.mjs --rapport --discord           # ärenden, filer, läge, sida, Discord
node konkurrenter/kor.mjs --skicka KD-2026-001 [--ja] [--till adress] [--sprak sv|en] [--utkast] [--paminnelse]
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
5. **Ärenden** (`arenden.mjs`): `arenden.jsonl`, en rad per ändring, senaste
   raden per id vinner. `ny → skickad` går BARA med `av: 'axel'` — rutinen
   kan inte skicka. Samma domän + samma produkt = samma ärende; ett avfärdat
   föds inte om; ett åtgärdat som dyker upp igen blir ett nytt ärende med
   hänvisning.
6. **Brevet** (`brev.mjs`): svenska till svenska sidor (.se eller `lang=sv`),
   engelska till alla andra. Bara mätta bevis i bevislistan. Lagrummen:
   URL 1, 2, 49 a och 54 §§; MFL 5, 8 och 14 §§; Patent- och
   marknadsdomstolen. Frist 48 h, påminnelse 24 h. Aldrig VD:ns namn.
7. **Sändningen** (`skicka.mjs` → `kundtjanst/brevlada.mjs skickaNytt`):
   från verksamhetens supportbrevlåda på Loopia, samma väg som autosvaret.
   Spärrar: `--ja`, `KONKURRENTER_INGEN_SANDNING=1`, status, mottagare,
   egna domäner, brevlådan i miljön.
8. **Rapport och sida** (`rapport.mjs`, `sida.mjs`): svensk rapport med
   Axels uppgifter sist, engelsk Discord-post i `#copycats` bara när något
   är nytt, och granskningssidan (`output/sida.html`, publiceras som
   artifact på länken i `sida.json`) med bevisen sida vid sida, skärmdumpen
   och kommandot att kopiera.

## Filer

| Fil | Committas | Vad |
|---|---|---|
| `konfig.json` | ✅ | Verksamheter, avsändare, egna domäner, trösklar, Discord — facit |
| `arenden.jsonl` | ✅ | Ärendeloggen (kvittot på varje brev) |
| `arenden/<id>.md`, `arenden/<id>/skarmdump.jpg`, `arenden/<id>/miniatyrer.json` | ✅ | Bevisen per ärende |
| `lage.json` | ✅ | När varje produkt kollades senast (rotationen), senaste körning |
| `sida.json` | ✅ | Granskningssidans artifact-länk: https://claude.ai/artifact/6JenXfVagtgw2THL8Q4y4v (publiceras om på samma länk varje körning) |
| `output/` | ❌ | Rådata, kandidater, bildcache, skärmdumpar, sidan — dör med containern |

## Läget vid bygget (mätt 2026-09-27)

- Butikerna: Bäverbutiken 248 produkter, CaraShell 4, Matstrumpor 5 — alla
  läsbara publikt. OPS-butikernas `body_html` är 25 ord (texten ligger i
  temat) ⇒ "för lite text att söka på"; källan är ändå Bäverbutikens sida,
  som speglas.
- Brevlådor i den här miljön: bara `KUNDTJANST_MAIL_PASS_BAVERBUTIKEN`.
  CaraShell och Matstrumpor kan visa brevet men inte skicka härifrån förrän
  deras lösenord ligger i Environments (finns på Railway för autosvaret).
- **Ad Library:** `(#10) 2332002 Application does not have permission` med
  `META_ACCESS_TOKEN`; webbversionen ger 403 "Client challenge" i headless
  Chromium. Axels klick: https://www.facebook.com/ID (identitet) och
  https://www.facebook.com/ads/library/api ("Kom igång"). Koden slår på
  källan själv när svaret blir 200.
- Meta: OPS-kontot svarar "(#1) Please reduce the amount of data" på
  200 annonser med breda fält — därför 50 per sida, smala fält och
  halvering vid felet (`korpus.mjs hamtaAnnonssidor`).
- Chromium: finns (Playwright i `/opt/node22/lib/node_modules/playwright`),
  3 bilder hashade på 440 ms, skärmdump 1280 × 2200 JPEG ≈ 200 kB.

## Regler som sitter i koden

- Rutinen skickar aldrig ett brev; `overgang(ny → skickad)` kräver `av: 'axel'`.
- Ett brev per ärende; påminnelsen bara efter ett skickat brev; eskalering bara människan.
- Mottagaren får aldrig vara en av våra domäner; utan mottagare skickas inget.
- Bevislistan i brevet skrivs ur mätningarna, aldrig fritt.
- Egna domäner (konfig + `sparning/butiker.json` + `kommentarer/konfig.json` +
  fabrikens filer) blir aldrig kandidater; marknadsplatser och sociala nätverk
  ignoreras.
- 23 tester utan nät: `node --test konkurrenter/test/*.test.mjs` (ingår i `npm test`).
