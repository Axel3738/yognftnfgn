# /lagerrensning – Kopiera lagerrensnings-sidan (listicle) till en ny produkt

Argument: `$ARGUMENTS` — länken till produktsidan på Bäverbutiken. Valfritt
`--torr` (visa planen, bygg inget), `--igen <plats>` (generera om en bild),
`--brand baverbutiken` (brandad sida — BARA om Axel ber om det) och
`--lank <produktlänk i en annan butik>` (knapparna dit, egen fil).

```
/lagerrensning https://baverbutiken.se/products/axelbalte-for-trimmer-justerbart-nylonbalte
/lagerrensning https://baverbutiken.se/products/strandtofflor-for-herr-halkfria-tradgardsskor --torr
/lagerrensning https://baverbutiken.se/products/satesoverdrag-for-akgrasklippare-slittaligt-600d-oxford --igen punkt2
/lagerrensning https://baverbutiken.se/products/axelbalte-for-trimmer-justerbart-nylonbalte --lank https://heimguard.se/products/axelbalte
```

CONNECTORS: inga. Allt går via `KIE_API_KEY` (bilder), `SHOPIFY_SHOP_SE` +
`SHOPIFY_CLIENT_ID_SE`/`SHOPIFY_CLIENT_SECRET_SE` (eller `_SE_BAVER_SE`) och
publika HTTPS-anrop. Använd ALDRIG `mcp__Notion__*` eller `mcp__Shopify__*`.

**Vad kommandot gör, i en mening:** tar motorhöljets lagerrensningssida
(`baverbutiken.se/pages/motorholje-lagerrensning`, GemPages-exporten i
`lagerrensning/mall/`) och gör exakt samma sida för en annan produkt — samma
struktur, samma Anders, samma lagerbild — med ny copy, produktens riktiga
pris och jämförpris, nya bilder (produktsidans egna, annars kie.ai) — och
lämnar **en `.gempages`-fil som Axel importerar i GemPages** (Pages → Import
page). GemPages tar bara sådana filer, inte HTML (Axel 2026-09-16). Filen får
nya sid-id:n så importen aldrig rör motorhöljets riktiga sida. **Sidan är
obrandad som standard** (Axels beslut 2026-09-16 kväll: "jag hade verkligen
uppskattat om listiclen är obrandad så att den funkar om en annan sida skulle
publicera den också och köra samma produkt") — ingen logga, "Anders på
lagret", bara "OBS: Detta är reklam." i sidfoten, inget butiksnamn i copyn.
En HTML-version byggs bredvid — den är bara underlaget för skärmdumparna som
sessionen tittar på. Motorn är `lagerrensning/bygg.mjs`, formatet står i
`lagerrensning/README.md`.

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
   2026-09-16) byts aldrig — de är sidans, inte produktens.
4b. **Obrandad som standard — brand bara på Axels begäran.** Mallen bär
   Bäverbutiken på tre ställen (författarraden, loggan, kontaktraden i
   sidfoten); alla tre styrs av brandprofilen, och utan `--brand` är de
   neutrala. Copyn nämner **aldrig** butikens namn: skriv "vi", "hos oss",
   "vårt lager" — motorn stoppar "Bäverbutiken" i en obrandad copy. Knapparna
   pekar på produktsidan i källbutiken; ska filen in i en annan butik körs
   bygget om med `--lank https://<butik>/products/<handle>` (egen fil med
   butikens namn som suffix, copyn och bilderna återanvänds, noll credits).
   `--brand baverbutiken` (`lagerrensning/brand/baverbutiken.json`) ger exakt
   mallens brandade sida — använd det bara när Axel säger det. Nytt brand =
   ny fil i `lagerrensning/brand/` (namn, författare, support, domän, logga).
5. **Sessionen tittar på bilderna OCH på sidan, aldrig Axel** (Axels beslut
   2026-09-13). Bygget tar skärmdumpar av HTML:en (desktop + mobil) utan nät
   i webbläsaren — läs dem med Read-verktyget innan något levereras.
6. **Shopify rörs bara för att lägga bilder på CDN:et.** Med `write_files`:
   Innehåll → Filer. Utan (appen "Bäver uppladdare" saknar det, mätt
   2026-09-16): DRAFT-produkten `lp-bildarkiv` bär bilderna — kunden ser den
   aldrig. Motorn väljer själv och säger vilket. Produkten, priset och sidorna
   rörs aldrig. **GemPages har inget API** — importen är Axels klick.
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

## Gör i ordning

`IDAG` = dagens datum (YYYY-MM-DD). Utdata: `lagerrensning/output/<handle>/`.

### 0. Finns sidan redan?
GemPages har inget API, så sessionen kan inte se vilka sidor som finns. Axel
bygger sådana här sidor för hand också (axelbältets sida
`axelbalte-trimmer-listicle` fanns sedan 2026-08-16 när kommandot testades
på just den produkten 2026-09-16). Skriv i rapporten att importen skapar en
NY sida, och be Axel hoppa över importen om produkten redan har en. Säger
Axel i kommandot att sidan finns: bygg ändå (copyn och bilderna är värdet),
men skriv det överst i rapporten.

### 1. Underlag
```
node lagerrensning/bygg.mjs <länk> --underlag
```
Skriver `underlag.json` (titel, pris, jämförpris, varianter, bilder med index,
beskrivningen som ren text, sökväg till `products/<id>/dna.md` om produkten har
minne). Läs den, läs `dna.md` (avsnitten BEHÅLL ALLTID / VAD BUTIKSDATAN SÄGER
/ Winning DNA) och `docs/copy-regler.md`. **Fakta som får användas är bara det
som står där.** Inga påhittade recensioner, siffror, studier eller kunder.
Ett betyg (Judge.me) skrivs aldrig in — det ändras varje vecka och sidan
ligger i månader (axelbältets DNA sa 4,75/8, sidan visade 4,50/12 samma dag).

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
Formen är `lagerrensning/mall/exempel-copy.json` (samma nycklar, ungefär
samma längder: rubriker ≤ 120 tecken, punkttexter 400–900 tecken, knappar
≤ 60). **Läs också `lagerrensning/mall/exempel-copy-axelbalte.json`** — Axels
egen anpassning av samma sida till axelbältet (byggd för hand 2026-08-16).
Den visar hur punkterna byter tema utan att byta form: "Det gör inte ont
medan du trimmar", "Du har redan egna knep, och de hjälper nästan", "Sista
biten blir aldrig klar den här helgen", "Den billiga remmen du redan provat",
och att riskfritt-blocket får heta "Om det inte känns rätt" när det passar
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
`lagerrensning/output/<handle>/copy.json`.

### 4. Bildplan
Ladda ner produktbilderna (`underlag.json` → `bilder[].src`) och TITTA på dem.
Per plats i `lagerrensning/mall/platser.json` → `bilder` (`roll` säger vad
bilden ska visa): välj `{ "kalla": "produkt", "index": N }` när en produktbild
bär rollen, annars `{ "kalla": "kie", "prompt": "…", "referenser": ["<produktbild-url>"], "format": "1:1" }`.
Prompten på engelska: motiv, miljö, ljus, "photo-realistic, no text, no people,
no faces, no logos". `lyckas` ska visa hela produkten/varianterna på ljus
bakgrund — nästan alltid en produktbild. `arlig` behålls (`{ "kalla": "mall" }`
behöver inte skrivas). Skriv `lagerrensning/output/<handle>/bildplan.json`:
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
node lagerrensning/bygg.mjs <länk> --torr
```
Läs varje ❌ (pris, procent, HTML, saknad plats) och ⚠. Rätta copy/bildplan
tills det bara finns ⚠ du kan stå för.

### 6. Skarpt
```
node lagerrensning/bygg.mjs <länk>
```
kie genererar → bilderna hämtas till `output/<handle>/bilder/` (gitignorerat)
och läggs på Shopifys CDN → **`.gempages`-filen** `<slug>-lagerrensning.gempages`
skrivs med nya id:n och **läses tillbaka med omräknade checksummor**
(trippelkollen är inbyggd; ett fel = ingen fil) → HTML-versionen skrivs →
**förhandsvisningen** byggs offline (`output/<handle>/forhandsvisning/`:
lokala bilder + typsnitt, `desktop.png` 1280 px och `mobil.png` 390 px plus
ett utsnitt per del, via Playwright). Kör aldrig skarpt två gånger för att
"vara säker" — cachen i `bilder.json` återanvänder genererade bilder,
`--igen <plats>` byter en. Bara filerna igen efter en copyändring: kör om
utan `--igen`, det kostar inga credits.

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
  (`lagerrensning/html.mjs`), inte Axels problem.
- `--kolla <fil.gempages>` visar rätt pris i alla knappar, ingen text som
  nämner motorhöljet och inget butiksnamn i texterna (bara i knapparnas länk).

### 8. Logga, committa, leverera
- Har produkten `products/<id>/batch-log.md`: en rad "LP lagerrensning byggd
  `IDAG`, fil `lagerrensning/output/<handle>/<slug>-lagerrensning.gempages`".
- Commit + push: `lagerrensning/output/<handle>/` (underlag, copy, bildplan,
  bilder.json, plan.json, .gempages, .html). Aldrig `bilder/` eller
  `forhandsvisning/`. Svenskt commit-meddelande.
- Skicka **`.gempages`-filen** till Axel i chatten (SendUserFile).

## Rapport till Axel (kort, svenska)
- Produkten, priset och jämförpriset som sidan bär, datumraden.
- Obrandad (standard) eller vilket brand — och att knapparna pekar på
  källbutiken: vill han köra filen i en annan butik behöver sessionen den
  butikens produktlänk (`--lank`), inget mer.
- Bilderna: vilka platser fick produktbilder, vilka kie, var de ligger (Filer
  eller `lp-bildarkiv`).
- Copyn: fem rubriker, läsbarhetstestet (vad som skrevs om, osäkraste raden),
  tre-frågorstestet (antal rader, antal ❌ och varför).
- `.gempages`-filen (i chatten) och sidans blivande adress.

**Axels uppgifter, sist, numrerade** (GemPages saknar API):
1. Ladda ner `<slug>-lagerrensning.gempages` från chatten.
2. GemPages → **Pages** → knappen **Import page** uppe till höger → **Add file** → välj filen → **Import**. Sidan hamnar som Draft med namnet "<Produkt> – Lagerrensning (listicle)".
3. Öppna sidan, scrolla igenom en gång, klicka **Publish**.
4. Kontrollera att adressen blev `/pages/<slug>-lagerrensning` (Page settings), annars sätt den.
5. Peka annonserna på `https://baverbutiken.se/pages/<slug>-lagerrensning`.
6. (Bara om samma sida ska in i en annan butik:) skicka den butikens produktlänk, så byggs en fil med knapparna dit.

Avvisar GemPages filen: klistra in felmeddelandet i nästa session. Första
knappen att prova är `--behall-idn` (mallens ursprungliga id:n i stället för
nya), och HTML-versionen bredvid filen visar exakt vad sidan skulle innehålla.

## DEFINITION OF DONE
- [ ] Underlag hämtat ur butiken; pris och jämförpris lästa där, aldrig ur minnet; inget betyg i copyn
- [ ] Fem teman satta med fakta per punkt
- [ ] Copy skriven av huvudsessionen; läsbarhetstestet gjort på varje stycke och redovisat; tre-frågorstestet redovisat, ❌ bara med motivering
- [ ] Sidan obrandad (inget butiksnamn i copyn, ingen logga) — eller `--brand` för att Axel bad om det, sagt i rapporten
- [ ] Bildplan med alla sex platser; produktbilder där de passar, kie annars; inga människor/text
- [ ] `--torr` utan ❌ före skarp körning
- [ ] Skarp körning: bilder på Shopifys CDN, `.gempages` skriven med nya id:n och läst tillbaka med rätt checksummor, HTML-versionen skriven
- [ ] Varje kie-bild tittad på; skärmdumparna desktop + mobil tittade på; `--kolla` visar rätt priser
- [ ] batch-log uppdaterad om produkten har minne; committat och pushat; `.gempages`-filen skickad i chatten
- [ ] Rapport + Axels klick sist, numrerade
