# /konkurrentdodaren — Konkurrentdödaren: hittar kopior av våra produktsidor och annonser, skriver varningsbrevet, skickar ALDRIG utan Axel

Argument: `$ARGUMENTS` — normalt tomt (rutinen, varje morgon). Axels egna verb:

```
/konkurrentdodaren                          rutinen: sök → jämför → ärenden → rapport → granskningssidan
/konkurrentdodaren --torr                   provkör: allt utom minne, Discord, artifact och push
/konkurrentdodaren kolla <url> [handle]     Axel klistrar in en misstänkt sida — jämförs mot allt vårt
/konkurrentdodaren skicka KD-2026-001 [--till adress] [--sprak sv|en]
                                            Axels godkännande: brevet går från butikens supportadress
/konkurrentdodaren avfarda KD-2026-001 "ingen kopia"
/konkurrentdodaren paminn KD-2026-001       påminnelsen (brev 2) när fristen gått ut och kopian ligger kvar
/konkurrentdodaren eskalera KD-2026-001 ["anmält till Meta"]
/konkurrentdodaren lista
```

Uppdraget i en mening: **hitta butiker och annonser som kopierat våra
produkttexter, bilder eller annonstexter, lägg fram bevisen så att Axel kan
döma på en minut, och skicka ett varningsbrev som biter — men bara efter att
han sagt ja.** (Axels beställning 2026-09-27: "Konkurrentdödar-rutinen. Den
skickar ut ett mail automatiskt … Detta måste jag granska först för att se om
dom rippat.")

⛔ **Rutinen skickar aldrig ett brev själv.** Ett ärende föds som `ny` och
lämnar det läget bara när Axel skriver `skicka` eller `avfarda`. Koden vägrar
`ny → skickad` från rutinen (`konkurrenter/arenden.mjs overgang`, testat), och
`kor.mjs --skicka` utan `--ja` visar bara brevet. Förslå aldrig att "skicka
ändå", och kör aldrig `--skicka … --ja` utan att Axel skrivit `skicka <id>`
i den här chatten.

⛔ **Blanda aldrig verksamheterna.** Brevet går från den verksamhets brevlåda
vars material kopierats (`konkurrenter/konfig.json` → `verksamheter.<namn>.avsandare`:
Bäverbutiken → `kundsupport@baverbutiken.se`, CaraShell → `hello@carashell.com`,
Matstrumpor → Matstrumpors brevlåda). Fel avsändare = fel bolagsnamn i
kundens ögon och svaret landar i fel inkorg.

⚠️ **Bevis, aldrig känsla.** Varje ärende bär mätta tal: ord i följd,
täckning, bildavstånd i bitar, skärmdump med tidsstämpel. Brevet räknar upp
bara det som mättes (`konkurrenter/brev.mjs bevisrader`). Skriv aldrig till en
konkurrent om något rutinen inte har bevis för, och lägg aldrig till egna
anklagelser i brevet.

⚠️ **Marknadsplatser och sociala nätverk (Amazon, Temu, AliExpress, Facebook …)
är inte konkurrenter här** — leverantörens egna bilder ligger lagligt där och
ett brev dit går ingenstans (`konfig.json` → `ignorera_domaner`).

CONNECTORS: inga. Meta läses med `META_ACCESS_TOKEN` (egna annonser +
Ad Library när Meta släpper in token:en), Discord med `DISCORD_BOT_TOKEN`,
brevlådorna med `KUNDTJANST_MAIL_PASS_<ID>`. Webbsökningen görs av
**sessionens WebSearch-verktyg** (steg 2) — Bing svarar en container med
slumpsidor (mätt 2026-09-27: "baverbutiken" gav Texas Longhorns), DuckDuckGo
och Google spärrar. Koppla ingen connector på rutinen.

Ett kommando per Bash-anrop — kedja aldrig med `&&`, `;` eller `|` utom där
steget skriver det.

## Rutinen (tomt argument eller `--torr`)

### 0. Senaste koden

`git pull --rebase origin main`. Konflikt: `git rebase --abort`, skriv det som
första rad till Axel och kör vidare på den kod som finns.

### 1. Fraserna

`node konkurrenter/kor.mjs --fraser`

Skriptet läser butikernas produkter (publika `/products.json`), de annonser
som visas just nu (Meta), väljer dagens produkter (annonserade först, sedan
rotation: aldrig kollad, äldst kollad) och skriver två fingeravtryck per
produkt — meningar på 7–16 ord utan siffror och utan butiksnamn — till
`konkurrenter/output/<datum>.fraser.json`. Läs utskriften: produkter "för
lite text" (OPS-butikernas texter ligger i temat, inte i `body_html`) hoppas
med orsak.

### 2. Sök — det här är sessionens jobb

För varje fras i filen (max 40 per körning, i filens ordning): kör
**WebSearch** med frasen inom citattecken, exakt som den står. Ta de
träffar som INTE är våra egna domäner (`konfig.json` → `egna_domaner` +
`sparning/butiker.json`) och inte marknadsplatser/sociala nätverk
(`ignorera_domaner`), högst 8 per fras. Skriv
`konkurrenter/output/<datum>.kandidater.json`:

```json
{ "datum": "<datum>", "kandidater": [ { "fras": "<frasen exakt som i fraser.json>", "url": "https://…", "titel": "<träffens titel>" } ] }
```

Frasen måste vara ordagrant densamma som i `fraser.json` — det är så
skriptet vet vilken produkt kandidaten ska jämföras med. En träff som
uppenbart är något annat (en dikt, en kommunsida) får ändå stå kvar:
likhetstalen sorterar bort den gratis, ett hopp du gör i huvudet kan missa
en kopia. Saknas WebSearch-verktyget i sessionen: skriv filen med tom lista
och raden `"orsak": "WebSearch saknas i sessionen"`, och skriv det som första
rad till Axel — Ad Library och Axels egna länkar körs ändå.

### 3. Hämta och jämför

`node konkurrenter/kor.mjs --hamta`

Skriptet hämtar varje kandidatsida (Shopify-produkter via `.json`), letar
e-post och org.nr på kontaktsidorna, jämför texten mot vår produkttext och
våra annonstexter (ordagranna sviter ≥ 8 ord, täckning av 5-ordssekvenser),
hashar bilderna i Chromium (dHash, ≤ 6 bitar = samma bild), tar skärmdump på
träffarna och frågar Ad Library (svarar "saknar behörighet" tills Axel
verifierat sig hos Meta). Skriver `konkurrenter/output/<datum>.json`. Rör
inte minnet. Mätt vid bygget 2026-09-27: en kandidat tar 3–8 s.

### 4. Rapport, ärenden, sida

1. `node konkurrenter/kor.mjs --rapport --torr` — läs den svenska rapporten.
2. Är `$ARGUMENTS` `--torr`: sluta här. Annars:
   `node konkurrenter/kor.mjs --rapport --discord`

Skriptet föder ärenden (`KD-<år>-<nnn>`) ur fynden — samma domän + samma
produkt är ett ärende, ett avfärdat föds inte om — skriver
`konkurrenter/arenden.jsonl`, `konkurrenter/arenden/<id>.md`,
`arenden/<id>/skarmdump.jpg` + `miniatyrer.json`, `konkurrenter/lage.json`,
bygger granskningssidan `konkurrenter/output/sida.html` och postar en
engelsk rad per verksamhet i Discord `#copycats` (bara när något är nytt;
Axel pingas). Exit 3 = svensk text stoppad, exit 4 = Discord svarade inte —
minnet är skrivet, säg det som första rad till Axel.

### 5. Uppföljning av skickade brev

`node konkurrenter/kor.mjs --foljupp`

Varje ärende med brev ute läses om: är kopian borta (sidan 404 eller under
tröskeln) blir ärendet `atgardad` av sig självt. Ligger den kvar efter
fristen står det i rapporten med kommandot `paminn`. Rutinen skickar aldrig
påminnelsen själv.

### 6. Publicera granskningssidan

Publicera `konkurrenter/output/sida.html` med Artifact-verktyget. Finns
`konkurrenter/sida.json` med en `url`: publicera om på den (samma länk varje
dag). Finns den inte: publicera nytt (`icon: "shield"`, `title`
"Konkurrentdödaren"), och skriv `{"url": "<länken>"}` till
`konkurrenter/sida.json`. Bilderna ligger som data-URI:er i filen — inga
externa bilder (artifact-visaren blockerar dem).

### 7. Spara

```
git pull --rebase origin main
git add konkurrenter/arenden.jsonl konkurrenter/arenden konkurrenter/lage.json konkurrenter/sida.json
git commit -m "konkurrentdodaren: <datum> — <N> nya, <Ö> öppna, <S> brev ute"
git push origin main
```

Aldrig `git add .`, aldrig `konkurrenter/output/` (gitignorerad: rådata,
bildcache, skärmdumpar, sidan). Nekad push: vänta 2, 4, 8, 16 s och försök
igen; går det ändå inte, skriv det som första rad till Axel.

### 8. Svar till Axel (svenska, kort)

Klistra in rapportens topp (vad som söktes, källorna) och de nya ärendena
(id, produkt, motpart, styrka, skälet, ett citat). Sist, numrerat: hans
uppgifter ur rapportens "Dina uppgifter" — skicka/avfärda per ärende med
kommandot, påminnelser, och Ad Library-verifieringen om den saknas. Finns
inget: "Inget för dig i dag."

## Axels verb

- **`kolla <url> [handle]`** → `node konkurrenter/kor.mjs --hamta --url <url> [--produkt <handle>]`,
  sedan steg 4 (`--rapport --torr`, `--rapport --discord`), 6 och 7. Utan
  handle jämförs sidan mot ALLA våra produkter; den som matchar bäst blir
  ärendet. Ingen träff över tröskeln: säg det, med talen (längsta svit, bilder).
- **`skicka <id> [--till adress] [--sprak sv|en]`** → först
  `node konkurrenter/kor.mjs --skicka <id> [--till …] [--sprak …]` (visar brevet
  och stoppen), sedan **`node konkurrenter/kor.mjs --skicka <id> --ja [--till …] [--sprak …]`**.
  Axels ord `skicka` i chatten ÄR godkännandet — fråga inte en gång till.
  Stoppar skriptet (ingen mottagare, egen domän, brevlådan saknas i miljön,
  ärendet inte `ny`): skriv exakt orsaken och vad Axel gör (t.ex. `--till`
  med adressen från deras sida). Efteråt: steg 6 och 7 (commit-rubrik
  `konkurrentdodaren: brev skickat <id>`).
- **`paminn <id>`** → `--skicka <id> --paminnelse`, sedan `--skicka <id> --paminnelse --ja`. Sedan steg 6 och 7.
- **`avfarda <id> "skäl"`** → `node konkurrenter/kor.mjs --avfarda <id> "<skäl>"`, steg 6 och 7.
- **`eskalera <id> ["not"]`** → `node konkurrenter/kor.mjs --eskalera <id> "<not>"`, steg 6 och 7.
- **`lista`** → `node konkurrenter/kor.mjs --lista`.

Ett brev till fel person är värre än inget brev: står mottagaren som "ingen
adress hittad" på sidan och Axel inte gett `--till`, skicka inte — be om
adressen.

## Definition of done

- [ ] `git pull --rebase origin main` kördes (eller konflikten står först i svaret)
- [ ] `kor.mjs --fraser` gav exit 0 och varje butik/konto är läst eller står med orsak
- [ ] WebSearch kördes på fraserna (eller `kandidater.json` bär orsaken till att den inte kunde köras)
- [ ] `kor.mjs --hamta` gav exit 0; Ad Library och bilder står som lästa eller med orsak
- [ ] `kor.mjs --rapport --discord` gav exit 0 (eller 3/4 står först i svaret), `--foljupp` kördes
- [ ] Granskningssidan publicerad på samma länk som `konkurrenter/sida.json` (eller länken sparad första gången)
- [ ] Inget brev skickades av rutinen; `--skicka … --ja` kördes bara på Axels `skicka <id>`
- [ ] Commit + push till main (arenden.jsonl, arenden/, lage.json, sida.json) — aldrig `output/`
- [ ] Svaret till Axel är på svenska, kort, och hans uppgifter står sist, numrerade
