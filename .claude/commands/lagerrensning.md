# /lagerrensning – Kopiera lagerrensnings-sidan (listicle) till en ny produkt, direkt in i butiken

Argument: `$ARGUMENTS` — länken till produktsidan på Bäverbutiken, **eller
flera länkar** (en per rad eller med mellanslag) — då byggs en sida per
länk, i tur och ordning, i samma session (se "Flera produkter" nedan).
Sökfrågor i länken (`?_pos=1&_psq=…`) är ofarliga: motorn läser bara
handlen. Valfritt
`--butik <id>` (standard: Bäverbutiken när länken är baverbutiken.se; annars
ett OPS-id som `carashell` — då slås butikens egen produkthandle upp ur
`factory/produkter/`), `--torr` (visa planen, bygg inget, rör inte butiken),
`--igen <plats>` (generera om en bild), `--gempages` (dessutom en
`.gempages`-fil att importera i GemPages — tillval), `--brand baverbutiken`
(brandad sida — BARA om Axel ber om det), `--lank <länk>` (knapparnas länk
om den inte går att härleda), `--opublicerad` (sidan skapas dold),
**`--marknad <KOD>`** (samma sida på en annan marknad i samma butik, t.ex.
`--marknad US` för carashell.com — se "Samma sida på en annan marknad").

```
/lagerrensning https://baverbutiken.se/products/axelbalte-for-trimmer-justerbart-nylonbalte
/lagerrensning https://baverbutiken.se/products/strandtofflor-for-herr-halkfria-tradgardsskor --torr
/lagerrensning https://baverbutiken.se/products/satesoverdrag-for-akgrasklippare-slittaligt-600d-oxford --igen punkt2
/lagerrensning https://baverbutiken.se/products/takoverdrag-husvagn-6-5-3-m-skyddar-den-dyraste-ytan --butik carashell
```

CONNECTORS: inga. Allt går via `KIE_API_KEY` (bilder), butikens
Shopify-nycklar (`SHOPIFY_SHOP_SE` + `SHOPIFY_CLIENT_ID_SE`/`_SECRET_SE` för
Bäverbutiken — appen "Bäver uppladdare" med `write_themes` + `write_content`
sedan 2026-09-16; OPS-butikernas egna nycklar via `factory/butiker/<id>.yaml`)
och publika HTTPS-anrop. Använd ALDRIG `mcp__Notion__*` eller `mcp__Shopify__*`.

**Vad kommandot gör, i en mening:** tar motorhöljets lagerrensningssida
(GemPages-exporten i `listicle/mall/`, `baverbutiken.se/pages/motorholje-lagerrensning`)
och gör exakt samma sida för en annan produkt — samma struktur, samma
Anders, samma lagerbild — med ny copy, produktens riktiga pris och
jämförpris, nya bilder (produktsidans egna, annars kie.ai) — och **lägger
upp den direkt i butiken som `/pages/<slug>-lagerrensning`, utan header,
footer eller meny** (Axels beslut 2026-09-16 kväll: "skippa GemPages-delen,
det är jättedyrt när jag ska installera GemPages på varje enda butik").
Motorn skriver tre temafiler en gång per butik (en ren layout, en sidmall,
sidans CSS), skapar sidan via API och läser den tillbaka som kund. **Sidan
är obrandad som standard** (samma dag: "jag hade verkligen uppskattat om
listiclen är obrandad så att den funkar om en annan sida skulle publicera
den också") — ingen logga, "Anders på lagret", bara "OBS: Detta är reklam."
i sidfoten, inget butiksnamn i copyn. Motorn är `listicle/bygg.mjs`,
formatet och butiksvägen står i `listicle/README.md`. Syskonen
`/vi-testade` och `/anledningar` (och `/listiclar` som kör alla tre) bygger
på samma motor med annat koncept.

## Järnregler

1. **Strukturen kopieras, texten skrivs om.** Åtta block i fast ordning: hero
   (rubrik + ingress + knapp + sammanfattning), fem numrerade punkter (rubrik +
   text + knapp), "Så vad gör de som lyckas?", "Jag ska vara ärlig:", "Därför kan
   du testa helt riskfritt." Antalet punkter är alltid fem. Ingen mening ur
   motorhöljets copy får återanvändas — bara formen. (Ärlig-blocket och
   riskfritt-blocket får ligga nära mallen: det är sidans premiss.)
2. **Priset kommer från produktsidan, vid varje körning.** Motorn läser
   `/products/<handle>.json` själv och **vägrar** varje pris i copyn som inte är
   produktens pris eller jämförpris, varje procentsats och frasen "innan lagret
   tar slut" (bara "så länge lagret räcker"). Saknar produkten jämförpris finns
   inget "istället för" — skriv copyn utan, eller be Axel sätta compare-at.
3. **Copyn skrivs av huvudsessionen (Fable), inte av en subagent** — Axels
   beslut 2026-09-16, ett uttryckligt undantag från regel 6 i CLAUDE.md: "jag
   tror vi ska använda oss av dig eller Fable att skriva copyn". Två test på
   varje rad: tre-frågorstestet i `docs/copy-regler.md` **och läsbarhetstestet
   nedan**. Axels återkommande klagomål är att texten inte låter naturlig och
   att övergångarna mellan meningarna hackar — läsbarheten går före allt annat.
4. **Bilder:** produktsidans egna bilder först (de ligger redan på Shopifys
   CDN), kie.ai bara där ingen passar rollen. Inga människor eller ansikten
   (hook-visual-regeln 2026-08-04), ingen text/pris/logga i genererade bilder.
   Författarfotot (Anders) och lagerbilden (anonyma kartonger, tittad
   2026-09-16) byts aldrig — de är sidans, inte produktens. Genererade
   bilder ligger på Bäverbutikens CDN även när sidan läggs i en annan butik
   (publika adresser, samma som OPS-produkternas egna bilder).
4b. **Obrandad som standard — brand bara på Axels begäran.** Mallen bär
   Bäverbutiken på tre ställen (författarraden, loggan, kontaktraden i
   sidfoten); alla tre styrs av brandprofilen, och utan `--brand` är de
   neutrala. Copyn nämner **aldrig** butikens namn: skriv "vi", "hos oss",
   "vårt lager" — motorn stoppar "Bäverbutiken" i en obrandad copy.
   Knapparna länkar relativt (`/products/<handle>`), så sidan funkar i
   vilken butik som helst. `--brand baverbutiken`
   (`listicle/brand/baverbutiken.json`) ger exakt mallens brandade sida —
   bara när Axel säger det. Nytt brand = ny fil i `listicle/brand/`.
5. **Sessionen tittar på bilderna OCH på sidan, aldrig Axel** (Axels beslut
   2026-09-13). Bygget tar skärmdumpar av HTML:en (desktop + mobil) utan nät
   i webbläsaren — läs dem med Read-verktyget. Den riktiga sidan läses
   dessutom tillbaka som kund av motorn (HTTP 200, listiclen finns, ingen
   header, ingen footer, ingen meny) — en sida som inte klarar det räknas
   inte som publicerad.
6. **Shopify rörs på tre sätt, aldrig fler:** (a) bilder på CDN:et
   (Innehåll → Filer med `write_files`, annars DRAFT-produkten `lp-bildarkiv`
   — kunden ser den aldrig); (b) **tre temafiler på det publicerade temat**,
   `layout/listicle.liquid`, `templates/page.listicle.liquid`,
   `assets/listicle.css` — skrivs bara när de saknas eller ändrats, gör
   ingenting förrän en sida använder mallen; (c) **sidan** `/pages/<slug>-
   lagerrensning` med mallen `page.listicle` — finns handlen redan
   uppdateras samma sida (samma adress, ny text). Produkten, priset,
   menyn och temats övriga filer rörs aldrig. Sidan publiceras direkt
   (kunden når den bara via länk); `--opublicerad` finns för ett utkast.
7. Kör klart utan att fråga. Axels uppgifter sist, numrerade.

## Läsbarhetstestet (obligatoriskt på varje stycke)

Läs stycket som om du läste det högt för Axel. Sedan, punkt för punkt:

1. **Varje mening tar vid där den förra slutade.** Samma subjekt, eller ett ord
   som pekar bakåt ("den", "det", "sen", "men", "så"). Måste läsaren backa för
   att förstå vad en mening syftar på: skriv om.
2. **Blanda meningslängd.** En kort mening får följa på en lång. Aldrig tre
   korta i rad (staccato), aldrig tre långa i rad (gröt).
3. **Max ett "Inte X. Y."-grepp per stycke**, och aldrig som stycket enda
   rytm. Inga tankstreck som lim mellan två halva meningar.
4. **Ett stycke är en tanke som rör sig framåt:** läget → vad som händer → vad
   det betyder för läsaren. Inga uppräkningar av fragment, inga listor
   förklädda till prosa.
5. **Orden är sådana Axel skulle säga på bryggan eller i trädgården:** "trött i
   armarna", inte "belastningen landar i kroppen". Ett ord som ingen säger
   högt byts.
6. **Läs hela sidan uppifrån och ner en sista gång.** Hero → punkt 1 → … →
   riskfritt ska hänga ihop som en berättelse av en person, inte som fem
   annonser efter varandra. Punkt 1 ska leda till punkt 2, och "lyckas"-blocket
   ska svara på punkterna.

Redovisa i copyn (`lasbarhetstest` i `copy.json`) och i rapporten: vilka
stycken som skrevs om, och vilken rad du är minst säker på.

## Flera produkter i samma kommando

Axel klistrar gärna in fem länkar på en gång (2026-09-16). Då gäller:

- **En produkt i taget, hela vägen** (steg 1–8) innan nästa börjar — copy,
  bildplan, torr, skarpt, titta, batch-log. Aldrig fem copyn först och fem
  publiceringar sen: stannar sessionen halvvägs ska det som är klart ligga
  uppe i butiken och i repot.
- **Committa och pusha efter varje produkt**, inte bara sist.
- Varje produkt får sin egen copy, skriven från sin egen produktsida och sitt
  eget DNA. Ingen mening får återanvändas mellan produkterna — det är fem
  olika sidor, inte en mall med bytta substantiv. Läs föregående produkts
  copy innan du skriver nästa så att rubrikgreppen inte upprepas.
- Stoppar en produkt (ingen jämförpris, bild som inte går att generera,
  butiken som avvisar): bygg klart de andra, rapportera stoppet med orsak.
- Rapporten är EN, med en rad per produkt (adress, rubrik, fem punktrubriker,
  bilder, testresultat) — och Axels lista sist bär alla adresserna.

## Samma sida på en annan marknad (`--marknad US`)

Axels fråga 2026-09-16 kväll: "gör en version som passar för carashell.com
— det är samma Shopify-butik, bara att vi kör markets och olika språk."
Marknaden är INTE en ny sida: **samma handle får en översättning på
marknadens språk** (Shopifys Translations API), och marknadens domän visar
den (carashell.com → engelska, USD). Stegen:

1. **Den svenska sidan först** (steg 0–8 nedan, utan `--marknad`). Motorn
   vägrar översätta en sida som inte finns.
2. `node listicle/bygg.mjs <svensk länk> --butik <id> --marknad US --underlag`
   → `underlag.en.json` med marknadens produkt: engelsk titel, engelsk
   beskrivning och **$-priser lästa ur carashell.com** (inte omräknade —
   USA-priset är Axels eget beslut per produkt).
3. **Läs marknadens produktsida i webbläsarform** (`underlag.en.json` →
   `marknad.lank`: FAQ, garanti, frakt, "what you get"). Fakta som får
   användas är bara det som står DÄR. USA-sidan lovar t.ex. 90 dagars
   garanti med "return or refund" och "Free shipping to the US", medan den
   svenska sidan har 14 dagars ångerrätt — riskfritt-blocket följer
   marknadens löfte. Mått i både cm och tum/fot, som sidan.
4. **Skriv copyn på marknadens språk** som `copy.en.json` i samma mapp:
   en amerikansk anpassning av den svenska (samma fem punkter, samma
   grepp), inte en ordagrann översättning. Läsbarhetstestet gäller — läs
   högt som en amerikan skulle säga det (windshield, cab, rest area, rig,
   moisture check, full-body cover). Priserna som `$199` / `$249`; inget
   butiksnamn (motorn stoppar källbutikens namn ur marknadslänken också);
   inga procent; "while stock lasts" (motorn stoppar "before stock runs
   out", "before it's gone", "last chance"). Tre-frågorstestet och
   `lasbarhetstest` redovisas som vanligt, på engelska. Systersidan i
   samma butik läses först så hero-greppen inte upprepas.
5. **Bilderna delas** med den svenska sidan (samma bildplan, samma cache —
   noll nya credits). Behöver marknaden egna bilder: `bildplan.en.json`.
6. `--torr`, sedan skarpt. Motorn registrerar `title` + `body_html` på
   locale `en` på den befintliga sidan, läser tillbaka lika, och läser
   sedan sidan som kund på **marknadens adress**
   (`https://carashell.com/pages/<handle>?country=US`): listiclen, ingen
   header/footer, **den engelska rubriken finns och den svenska finns
   inte**. Skärmdumparna ligger i `forhandsvisning-en/` — titta.
7. **Rapporten:** marknadens adress (med `?country=`), priserna i
   marknadens valuta, och vad som skiljer från den svenska (garanti,
   frakt, enheter, ord). Axels klick: annonserna för marknaden
   (Magiborsten UK för USA) pekar på marknadens adress — samma regel som
   produktlänkarna i `/ops-oversatt`.

⚠️ Containern går ut från USA, och carashell.se skickar amerikanska
besökare vidare till carashell.com. Läser du en svensk sida själv: lägg på
`?country=SE`. Motorns svenska kontroll gör det redan.
⚠️ Ändras den svenska copyn senare: kör marknaden igen, annars ligger en
gammal översättning kvar (Shopify märker den `outdated` men visar den).

## Gör i ordning

`IDAG` = dagens datum (YYYY-MM-DD). Utdata: `listicle/output/lagerrensning/<handle>/`.

### 0. Finns sidan redan?
Motorn slår upp handlen `<slug>-lagerrensning` i butiken: finns den
uppdateras sidan på samma adress (bra — annonserna pekar redan dit). Axel
bygger också sidor för hand i GemPages med egna adresser (axelbältets
`axelbalte-trimmer-listicle` sedan 2026-08-16) — de rörs inte. Skriv i
rapporten om sidan var ny eller uppdaterad; `--torr` säger vilket i förväg.

### 1. Underlag
```
node listicle/bygg.mjs <länk> --underlag
```
Skriver `underlag.json` (titel, pris, jämförpris, varianter, bilder med index,
beskrivningen som ren text, sökväg till `products/<id>/dna.md` om produkten har
minne, blivande adress). Läs den, läs `dna.md` (avsnitten BEHÅLL ALLTID / VAD
BUTIKSDATAN SÄGER / Winning DNA) och `docs/copy-regler.md`. **Fakta som får
användas är bara det som står där.** Inga påhittade recensioner, siffror,
studier eller kunder. Ett betyg (Judge.me) skrivs aldrig in — det ändras varje
vecka och sidan ligger i månader (axelbältets DNA sa 4,75/8, sidan visade
4,50/12 samma dag).

### 2. Strategi — de fem punkternas teman
Mallens skelett, per punkt. Anpassa temat till produkten, behåll formen:

| Punkt | Skelett (motorhöljet) | Vad punkten ska göra |
|---|---|---|
| 1 | "Din kåpa ser fin ut. Det gör den inte länge till." | Problemet smyger — det man skjuter upp utan att bestämma det |
| 2 | "En vaxning om året stoppar inte solen" | Den vanliga insatsen räcker inte mot det dagliga slitaget |
| 3 | "Glans går att bevara. Inte att polera tillbaka." | Det går att förebygga, inte att reparera i efterhand |
| 4 | "Värdet försvinner varje dag (det här missar nästan alla)" | Det dolda priset: kostnaden per dag/säsong, andrahandsvärde eller kropp |
| 5 | "Ett billigt hölje är dyrare än inget" | Det billiga alternativet: varför det inte löser problemet |

Passar ett skelett inte produkten (en toffel har inget andrahandsvärde): byt
till närmaste **sanna** fakta ur produktsidan/DNA — men behåll fem punkter,
numrerade "1. …". Skriv ner temana med, per punkt, vilka fakta den lutar sig på.

"Lyckas"-blocket = lösningen: vad de som lyckas gör + produkten med
produktsidans fakta (material, passform, garanti). "Ärlig"-blocket = varför
priset: överlager, `X kr istället för Y kr`, priset går tillbaka till Y när
partiet är slut. "Riskfritt" = 30 dagars garanti (står på produktsidan).

### 3. Copy — skriv den själv
Formen är `listicle/mall/exempel-copy.json` (samma nycklar, ungefär samma
längder: rubriker ≤ 120 tecken, punkttexter 400–900 tecken, knappar ≤ 60).
**Läs också `listicle/mall/exempel-copy-axelbalte.json`** — Axels egen
anpassning av samma sida till axelbältet (byggd för hand 2026-08-16). Den
visar hur punkterna byter tema utan att byta form: "Det gör inte ont medan
du trimmar", "Du har redan egna knep, och de hjälper nästan", "Sista biten
blir aldrig klar den här helgen", "Den billiga remmen du redan provat", och
att riskfritt-blocket får heta "Om det inte känns rätt" när det passar
bättre. Det är tonen som gäller: vardaglig, konkret, en person som pratar.
(Axels copy säger "Bäverbutikens axelbälte" — det gjorde man 2026-08-16; nu
skrivs "det här axelbältet".) Hårda regler: svenska med rätt å/ä/ö; bara
priset och jämförpriset som siffror; inga procent; "så länge lagret räcker";
`**fet**` är den enda formateringen (ingen HTML); exakt fem punkter;
hero.rubrik bär både priset och jämförpriset; inga betyg, inga påhittade
kunder; **inget butiksnamn** ("vi", "hos oss", "vårt lager").

Skriv först alla stycken rakt igenom som en text. Kör sedan läsbarhetstestet
på varje stycke och skriv om det som hakar — räkna med 20 varv, det är
normalt (`docs/copy-regler.md`). Kör sist tre-frågorstestet på varje rubrik,
varje knapp och första meningen i varje stycke; skriv `tre_fragor` med
✅/❌ + skäl. Rader du **måste** behålla (mallens fasta rubriker "Jag ska vara
ärlig:", "Därför kan du testa helt riskfritt.") får ha ❌ med den motiveringen.
Skriv `lasbarhetstest` (metod, omskrivna stycken, osäkraste raden). Spara som
`listicle/output/lagerrensning/<handle>/copy.json`.

### 4. Bildplan
Ladda ner produktbilderna (`underlag.json` → `bilder[].src`) och TITTA på dem.
Per plats i `listicle/mall/platser.json` → `bilder` (`roll` säger vad
bilden ska visa): välj `{ "kalla": "produkt", "index": N }` när en produktbild
bär rollen, annars `{ "kalla": "kie", "prompt": "…", "referenser": ["<produktbild-url>"], "format": "1:1" }`.
Prompten på engelska: motiv, miljö, ljus, "photo-realistic, no text, no people,
no faces, no logos". `lyckas` ska visa hela produkten/varianterna på ljus
bakgrund — nästan alltid en produktbild. `arlig` behålls (`{ "kalla": "mall" }`
behöver inte skrivas). Skriv `listicle/output/lagerrensning/<handle>/bildplan.json`:
```json
{ "bilder": {
  "punkt1": { "kalla": "kie", "prompt": "…", "referenser": ["https://cdn.shopify.com/…"], "format": "1:1" },
  "punkt2": { "kalla": "produkt", "index": 3 },
  "punkt3": …, "punkt4": …, "punkt5": …, "lyckas": { "kalla": "produkt", "index": 1 }
} }
```
Alla sex platser måste stå där. Vill du behålla motorhöljets bild på en plats
skriver du `{ "kalla": "mall" }` — motorn vägrar tystnad.

### 5. Torrkörning
```
node listicle/bygg.mjs <länk> --torr
```
Läs varje ❌ (pris, procent, HTML, butiksnamn, saknad plats) och ⚠. Rätta
copy/bildplan tills det bara finns ⚠ du kan stå för. Raden "Butik:" säger
vilken butik och vilken adress sidan får; "Sida: finns/finns inte" om
adressen redan är upptagen av en tidigare körning.

### 6. Skarpt — bilder, sida, butik
```
node listicle/bygg.mjs <länk>
```
kie genererar → bilderna hämtas till `output/lagerrensning/<handle>/bilder/`
(gitignorerat) och läggs på Shopifys CDN → `<slug>-lagerrensning.html`
(förhandsvisningens underlag) och `<slug>-lagerrensning.sida.html` (exakt
det som läggs i butiken) skrivs → **förhandsvisningen** byggs offline
(`forhandsvisning/`: `desktop.png` 1280 px, `mobil.png` 390 px, utsnitt) →
**butiken:** temafilerna kontrolleras/skrivs, sidan skapas eller
uppdateras med mallen `page.listicle`, och **sidan läses tillbaka som kund**
(ingen header, ingen footer, ingen meny, listiclen på plats). Först då
skrivs `plan.json` med adressen. Kör aldrig skarpt två gånger för att "vara
säker" — cachen i `bilder.json` återanvänder genererade bilder, `--igen
<plats>` byter en. En copyändring: kör om utan `--igen`, det kostar inga
credits och uppdaterar samma sida. `--gempages` skriver dessutom
`.gempages`-filen (nya id:n, läst tillbaka med checksummor) om Axel vill ha
den i GemPages.

### 7. Titta — bilderna och sidan, med Read-verktyget
- Varje genererad bild (`bilder/<plats>.png`), tre frågor: rätt produkt/miljö
  för rollen? inga människor, ansikten, text, priser, påhittade loggor? ser den
  ut som ett foto och inte som ett fel? Underkänd: skärp prompten i
  `bildplan.json`, `--igen <plats>` **en** gång. Underkänd igen: byt till en
  produktbild och säg det i rapporten.
- **Skärmdumparna** `forhandsvisning/desktop.png` och `mobil.png`: rubrikerna i
  Anton, orange knappar, bilderna på rätt plats (punkt 2 och 4 har bilden till
  höger på desktop), ingen text som hänger utanför, författarfotot runt,
  "Av Anders på lagret." i hero, sidfoten utan logga och med bara "OBS: Detta
  är reklam." (obrandad) — eller loggan + kundsupport-raden om `--brand`
  användes. Ser något fel ut är det HTML:en som ska rättas
  (`listicle/html.mjs`), inte Axels problem.
- Kontrollen av den riktiga sidan är inbyggd (raden "svarar som kund …" i
  utskriften). Vill du se den med egna ögon: hämta HTML:en med Nodes fetch
  (Chromium litar inte på proxyn) och rendera lokalt som förhandsvisningen.

### 8. Logga, committa, leverera
- Har produkten `products/<id>/batch-log.md`: en rad "LP lagerrensning
  byggd `IDAG`, live på `<adress>`".
- Commit + push: `listicle/output/lagerrensning/<handle>/` (underlag, copy,
  bildplan, bilder.json, plan.json, `.html`, `.sida.html`, ev. `.gempages`).
  Aldrig `bilder/` eller `forhandsvisning/`. Svenskt commit-meddelande.
- Leveransen är **adressen** i rapporten. Bara med `--gempages`: skicka även
  filen i chatten (SendUserFile).

## Rapport till Axel (kort, svenska)
- Produkten, priset och jämförpriset som sidan bär, datumraden.
- Butiken och adressen; ny sida eller uppdaterad; obrandad (standard) eller
  vilket brand.
- Bilderna: vilka platser fick produktbilder, vilka kie, var de ligger (Filer
  eller `lp-bildarkiv`).
- Copyn: fem rubriker, läsbarhetstestet (vad som skrevs om, osäkraste raden),
  tre-frågorstestet (antal rader, antal ❌ och varför).

**Axels uppgifter, sist, numrerade** (en rad per sida när det är flera):
1. Öppna `https://<butik>/pages/<slug>-lagerrensning` och läs igenom en gång.
2. Peka annonserna med lagerrensnings-vinkeln på den adressen.
3. (Bara med `--gempages`:) GemPages → **Pages** → **Import page** → **Add file** → filen → **Import** → **Publish**.

Stoppar motorn i butikssteget ("saknar write_themes + write_content"):
appens rättigheter — Axel lägger till dem i appens Access scopes och
installerar om appen. Stoppar tillbakaläsningen ("header/footer är kvar"):
temat använder inte mallen — läs `listicle/README.md` → "Butiken".

## DEFINITION OF DONE
- [ ] Underlag hämtat ur butiken; pris och jämförpris lästa där, aldrig ur minnet; inget betyg i copyn
- [ ] Fem teman satta med fakta per punkt
- [ ] Copy skriven av huvudsessionen; läsbarhetstestet gjort på varje stycke och redovisat; tre-frågorstestet redovisat, ❌ bara med motivering
- [ ] Sidan obrandad (inget butiksnamn i copyn, ingen logga) — eller `--brand` för att Axel bad om det, sagt i rapporten
- [ ] Bildplan med alla sex platser; produktbilder där de passar, kie annars; inga människor/text
- [ ] `--torr` utan ❌ före skarp körning
- [ ] Skarp körning: bilder på Shopifys CDN, sidan uppe i butiken med mallen `page.listicle` och läst tillbaka som kund utan header/footer/meny
- [ ] Varje kie-bild tittad på; skärmdumparna desktop + mobil tittade på
- [ ] batch-log uppdaterad om produkten har minne; committat och pushat
- [ ] Med `--marknad`: copyn på marknadens språk mot marknadens egen produktsida (priser i dess valuta, dess garanti/frakt); översättningen läst tillbaka på marknadens domän på rätt språk; skärmdumparna i `forhandsvisning-<locale>/` tittade på
- [ ] Rapport med adressen + Axels klick sist, numrerade
