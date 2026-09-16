# /lagerrensning – Kopiera lagerrensnings-sidan (listicle) till en ny produkt

Argument: `$ARGUMENTS` — länken till produktsidan på Bäverbutiken. Valfritt
`--torr` (visa planen, bygg inget) och `--igen <plats>` (generera om en bild).

```
/lagerrensning https://baverbutiken.se/products/axelbalte-for-trimmer-justerbart-nylonbalte
/lagerrensning https://baverbutiken.se/products/strandtofflor-for-herr-halkfria-tradgardsskor --torr
/lagerrensning https://baverbutiken.se/products/satesoverdrag-for-akgrasklippare-slittaligt-600d-oxford --igen punkt2
```

CONNECTORS: inga. Allt går via `KIE_API_KEY` (bilder), `SHOPIFY_SHOP_SE` +
`SHOPIFY_CLIENT_ID_SE`/`SHOPIFY_CLIENT_SECRET_SE` (eller `_SE_BAVER_SE`) och
publika HTTPS-anrop. Använd ALDRIG `mcp__Notion__*` eller `mcp__Shopify__*`.

**Vad kommandot gör, i en mening:** tar motorhöljets lagerrensningssida
(`baverbutiken.se/pages/motorholje-lagerrensning`, GemPages-exporten i
`lagerrensning/mall/`) och gör exakt samma sida för en annan produkt — samma
struktur, samma Anders, samma lagerbild och logga — med ny copy, produktens
riktiga pris och jämförpris, nya bilder (produktsidans egna, annars kie.ai) —
och lämnar en `.gempages`-fil som Axel importerar med ett klick. Motorn är
`lagerrensning/bygg.mjs`, formatet står i `lagerrensning/README.md`.

## Järnregler

1. **Strukturen kopieras, texten skrivs om.** Åtta block i fast ordning: hero
   (rubrik + ingress + knapp + sammanfattning), fem numrerade punkter (rubrik +
   text + knapp), "Så vad gör de som lyckas?", "Jag ska vara ärlig:", "Därför kan
   du testa helt riskfritt." Antalet punkter är alltid fem. Ingen mening ur
   motorhöljets copy får återanvändas — bara formen.
2. **Priset kommer från produktsidan, vid varje körning.** Motorn läser
   `/products/<handle>.json` själv och **vägrar** varje pris i copyn som inte är
   produktens pris eller jämförpris, varje procentsats och frasen "innan lagret
   tar slut" (bara "så länge lagret räcker"). Saknar produkten jämförpris finns
   inget "istället för" — skriv copyn utan, eller be Axel sätta compare-at.
3. **Copy via subagent** (regel 6 i CLAUDE.md): Agent-verktyget med
   `model: "sonnet"`, `docs/copy-regler.md` i prompten, tre-frågorstestet
   redovisat i `tre_fragor`. Vilka fem teman punkterna bär bestämmer
   huvudsessionen (steg 2) — subagenten skriver bara text.
4. **Bilder:** produktsidans egna bilder först (de ligger redan på Shopifys
   CDN), kie.ai bara där ingen passar rollen. Inga människor eller ansikten
   (hook-visual-regeln 2026-08-04), ingen text/pris/logga i genererade bilder.
   Författarfotot (Anders), lagerbilden och loggan byts aldrig — de är
   Bäverbutikens, inte produktens.
5. **Sessionen tittar på bilderna, aldrig Axel** (Axels beslut 2026-09-13).
   En bild blir aldrig ACTION NEEDED.
6. **Shopify rörs bara för att lägga bilder på CDN:et.** Med `write_files`:
   Innehåll → Filer. Utan (appen "Bäver uppladdare" saknar det, mätt
   2026-09-16): DRAFT-produkten `lp-bildarkiv` bär bilderna — kunden ser den
   aldrig. Motorn väljer själv och säger vilket. Produkten, priset och sidorna
   rörs aldrig. **GemPages har inget import-API** — importen är Axels klick.
7. Kör klart utan att fråga. Axels uppgifter sist, numrerade.

## Gör i ordning

`IDAG` = dagens datum (YYYY-MM-DD). Utdata: `lagerrensning/output/<handle>/`.

### 1. Underlag
```
node lagerrensning/bygg.mjs <länk> --underlag
```
Skriver `underlag.json` (titel, pris, jämförpris, varianter, bilder med index,
beskrivningen som ren text, sökväg till `products/<id>/dna.md` om produkten har
minne). Läs den, läs `dna.md` (avsnitten BEHÅLL ALLTID / VAD BUTIKSDATAN SÄGER
/ Winning DNA) och `docs/copy-regler.md`. **Fakta som får användas är bara det
som står där.** Inga påhittade recensioner, siffror, studier eller kunder.

### 2. Strategi — de fem punkternas teman (huvudsessionen)
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
numrerade "1. …". Skriv temalistan med, per punkt, vilka fakta den får luta
sig på. Det är subagentens uppdrag — inte en färdig text.

"Lyckas"-blocket = lösningen: vad de som lyckas gör + produkten med
produktsidans fakta (material, passform, garanti). "Ärlig"-blocket = varför
priset: överlager, `X kr istället för Y kr`, priset går tillbaka till Y när
partiet är slut. "Riskfritt" = 30 dagars garanti (står på produktsidan).

### 3. Copy via subagent (model `sonnet`)
Prompten till subagenten innehåller, i den här ordningen:
- produktfakta ur `underlag.json` (titel, `prisText`, `jamforprisText`,
  beskrivningen, varianter) + DNA-utdraget — **"use ONLY these facts"**
- temalistan från steg 2
- `lagerrensning/mall/exempel-copy.json` som **formexempel**: samma nycklar,
  samma ungefärliga längder (rubriker ≤ 120 tecken, punkttexter 400–900 tecken,
  knappar ≤ 60), men ny text — ingen mening får kopieras
- `docs/copy-regler.md` i sin helhet + hårda regler: svenska; bara priset och
  jämförpriset som siffror; inga procent; "så länge lagret räcker"; `**fet**` är
  den enda formateringen (ingen HTML); exakt 5 punkter; hero.rubrik ska bära
  både priset och jämförpriset; `tre_fragor` med en rad per rubrik, knapp och
  första mening i varje stycke (✅/❌ + skäl)
- var filen ska skrivas: `lagerrensning/output/<handle>/copy.json`

Subagenten skriver filen. Har den ❌ i testet: be den skriva om raden (max två
varv), sedan stryk raden till den bästa versionen och säg det i rapporten.

### 4. Bildplan (huvudsessionen)
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
och läggs på Shopifys CDN → sidan byggs → filen skrivs → **läses tillbaka och
varje checksumma räknas om** (trippelkollen är inbyggd; ett fel = ingen fil).
Kör aldrig skarpt två gånger för att "vara säker" — cachen i `bilder.json`
återanvänder genererade bilder, `--igen <plats>` byter en.

### 7. Titta — varje genererad bild, med Read-verktyget
Tre frågor (Axels beslut 2026-09-13, lätt kontroll): är det rätt produkt/miljö
för rollen? inga människor, ansikten, text, priser, påhittade loggor? ser den ut
som ett foto och inte som ett fel? Underkänd: skärp prompten i `bildplan.json`,
kör `--igen <plats>` **en** gång. Underkänd igen: byt till en produktbild och
säg det i rapporten. Kolla också att `--kolla <fil>` visar rätt pris i alla
knappar och att ingen text nämner motorhöljet.

### 8. Logga, committa, leverera
- Har produkten `products/<id>/batch-log.md`: en rad "LP lagerrensning byggd
  `IDAG`, fil `lagerrensning/output/<handle>/<slug>-lagerrensning.gempages`".
- Commit + push: `lagerrensning/output/<handle>/` (underlag, copy, bildplan,
  bilder.json, plan.json, .gempages). Aldrig `bilder/`. Svenskt commit-meddelande.
- Skicka `.gempages`-filen till Axel i chatten (SendUserFile).

## Rapport till Axel (kort, svenska)
- Produkten, priset och jämförpriset som sidan bär, datumraden.
- Bilderna: vilka platser fick produktbilder, vilka kie, var de ligger (Filer
  eller `lp-bildarkiv`).
- Copyn: fem rubriker, tre-frågorstestet (antal rader, antal ❌).
- Filen (länk i chatten) och sidans blivande adress `/pages/<handle>`.

**Axels uppgifter, sist, numrerade** (GemPages saknar API):
1. Öppna GemPages i Shopify-admin → **Pages** → knappen **Import page** uppe till höger.
2. **Add file** → välj `<slug>-lagerrensning.gempages` → **Import**. Sidan hamnar som Draft med namnet "<Produkt> – Lagerrensning (listicle)".
3. Öppna sidan, scrolla igenom en gång, klicka **Publish**.
4. Peka annonserna på `https://baverbutiken.se/pages/<handle>` (står i rapporten).

Går importen inte igenom: klistra felmeddelandet i nästa session. Första
knappen att prova är `--nya-idn` (nya sid- och sektions-id:n) — id:na är
annars motorhöljets, vilket GemPages normalt hanterar vid import.

## DEFINITION OF DONE
- [ ] Underlag hämtat ur butiken; pris och jämförpris lästa där, aldrig ur minnet
- [ ] Fem teman satta av huvudsessionen med fakta per punkt
- [ ] Copy skriven av sonnet-subagent; tre-frågorstestet redovisat; inga ❌ kvar utan motivering
- [ ] Bildplan med alla sex platser; produktbilder där de passar, kie annars; inga människor/text
- [ ] `--torr` utan ❌ före skarp körning
- [ ] Skarp körning: bilder på Shopifys CDN, `.gempages` skriven och läst tillbaka med rätt checksummor
- [ ] Varje kie-bild tittad på; `--kolla` visar rätt priser och ingen motorhölje-text
- [ ] batch-log uppdaterad om produkten har minne; committat och pushat; filen skickad i chatten
- [ ] Rapport + Axels fyra klick sist, numrerade
