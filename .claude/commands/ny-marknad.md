# /ny-marknad – Lägg till en MARKNAD (land + språk + valuta) i en BEFINTLIG OPS-butik

Argument: `$ARGUMENTS` — butikens id, sedan landskoden (ISO, två bokstäver).
Valfritt: `--pris <tal>` och `--jamforpris <tal>` i marknadens valuta (per
produkt om butiken har flera: `--pris takskyddet=109,atv-kapell=89`),
`--leveranstid "8–14 arbetsdagar"`, `--locale <kod>` om inte landets
standardspråk ska gälla, `--i-fraktraden` om landet SKA nämnas i den svenska
fraktraden (standard för ett land utanför Norden: nej). `--torr` = visa allt,
skriv ingen fil, rör ingen butik.

```
/ny-marknad carashell US --pris 109 --jamforpris 139 --leveranstid "8–14 arbetsdagar"
/ny-marknad carashell US            # priset frågas då — det är ägarens beslut
/ny-marknad tacklebay DK
```

CONNECTORS: inga. Butiken nås via token i miljön (`SHOPIFY_SHOP_<BUTIK>` +
`SHOPIFY_CLIENT_ID/SECRET_<BUTIK>` + `SHOPIFY_STOREFRONT_PASSWORD`), precis
som `/ny-ops`. **Shopify-MCP:n är FÖRBJUDEN** — aldrig `get-shop-info`,
`switch-shop` eller något `mcp__*`-Shopify-verktyg; den pekar på en godtycklig
butik.

**Vad kommandot är, i en mening:** butiken finns och säljer i Sverige (+
Norge). Axel vill sälja samma sak i ett land till — USA först (husbils-
produkterna, 2026-09-16) — och det ska vara EN rad i butiksfilen plus en
körning, inte ett nytt bygge. Det här är Fas 4 i `factory/PROCESS.md`
("Marknader") körd i efterhand på en butik som redan är live.

**Vad det INTE är:** annonserna. USA-annonser är ett eget uppdrag med ett eget
beslut (vilket annonskonto), se steg 9. `/ops-oversatt` översätter bara till
norska och rörs inte av det här kommandot.

---

## Järnregler

1. **En marknadsrad utan bygge är en lögn.** Raden i `butik.marknader` skrivs
   och bygget körs i SAMMA session. Kan bygget inte köras (ingen token): skriv
   ingen rad, rapportera vad som saknas. Repot ska aldrig påstå en marknad
   som Shopify inte har.
2. **Priset i den nya valutan är ägarens beslut** (CLAUDE.md regel 12). Står
   det inte i argumenten: räkna ett FÖRSLAG ur dagskursen (ECB via
   `commission/valuta.mjs`, avrundat till x9), visa det, och ställ EN fråga
   med alternativ. Gissa aldrig in ett pris i produktfilen.
3. **Koden översätter aldrig själv.** Engelskan skrivs av en subagent
   (sonnet) till `output/<butik>/oversattning-<locale>.json` med EXAKT samma
   nycklar som sv-filen. Läckor i `oversatt`-rapporten = steget förblir 🖐.
4. **Alltid svensk lag, aldrig egna köplöften** (Axels beslut 2026-09-08) —
   även i den engelska policyn: "14-day right of withdrawal under Swedish
   law". Skriv aldrig "30-day money-back". Att USA-policyn refererar svensk
   lag och EU:s tvistplattform är en juridisk fråga som lämnas till Axel i
   rapporten — ändra inte substansen på egen hand.
5. **Ett land utanför Norden nämns inte i den svenska fraktraden** som
   standard (`i_fraktraden: false`): "Fri frakt – Sverige, Norge & USA" säger
   inget till en svensk kund, och — viktigare — den svenska källtexten
   ändras inte, så den norska filen matchar fortfarande och inget läcker på
   /nb. Den engelska sidan säger sitt ("Free shipping to the US") i sin egen
   fil. Vill Axel ha landet i raden: `--i-fraktraden`, och då ska den
   norska filen uppdateras i samma körning (steg 6 visar läckorna).
6. **Leveranstiden är marknadens egen.** USA från Sverige tar inte 5–10
   arbetsdagar. `leveranstid` på marknadsraden styr den engelska
   leveransraden på produktsidan (`tema.patchaKoprutan`); saknas den ärvs
   butikens och det är då ett falskt löfte till en amerikansk kund — en
   chargeback-signal (`kundtjanst/`). Fråga om den inte är given.
7. **PAUSED med spend är ett beslut.** Kommandot rör aldrig ett annonskonto.
8. Kör klart utan att fråga mellan stegen (utom regel 2 och 6 — ETT
   frågetillfälle, före bygget). Rapportera "Gjort av mig" / "Väntar på en
   människa". Axels uppgifter sist, numrerade.

---

## Gör i ordning

Färsk `main` först: `git fetch origin main && git checkout main && git reset --hard origin/main`.

### 1. Landet, språket, valutan
`factory/lander.mjs` är facit: `node -e "import('./factory/lander.mjs').then(l=>console.log(l.landsnamnSv('US'),l.standardLocale('US'),l.lokalValuta('US')))"`.
Okänt land (svaret är koden i versaler, locale null) ⇒ lägg till raden i
`lander.mjs` FÖRST (namn sv/en, språk, valuta, locale) — det är hela poängen
med att tabellen finns på ett ställe.

### 2. Frågorna — en gång, före bygget
Saknas `--pris`: förslag = SEK-pris × dagskurs, avrundat till närmaste x9
(1 129 kr ≈ 109 USD vid 10,4). Saknas `--leveranstid`: föreslå ur källans
leverantör om det står i produktfilen, annars fråga. EN fråga, med alternativ.
Svaret skrivs in — inget i repot bär ett pris Axel inte sett.

### 3. Butiksfilen och produktfilerna (utan att pusha än)
`factory/butiker/<butik>.yaml` → `butik.marknader`, en rad till:
```yaml
    - land: US
      locale: en
      valuta: SEK              # USD först när admin slagit på den (steg 8)
      leveranstid: "8–14 arbetsdagar"
      i_fraktraden: false      # nämns inte i den svenska fraktraden (regel 5)
```
Varje produktfil → `ekonomi.marknadspriser`, en rad till:
```yaml
    - valuta: USD
      pris: 109
      jamforpris: 139
```
`butik.markorer_sv` ska bära butikens svenska ord — de skannas på /en också.
Sedan `node factory/validera.mjs factory/produkter/<id>.yaml` per produkt.

### 4. Torrt först
```
node factory/ops.mjs factory/butiker/<butik>.yaml <ALLA produktfiler> --resume --igen marknad,tema,oversatt,prislista,recensioner --dry-run
```
ALLA produktfiler (järnregel 1 i `/ops-produkt`: startsidan och menyn byggs
ur körningens produkter). Läs: `marknad` ska lista det nya landet, `tema` ska
säga "en Liquid-gren per marknadsspråk (nb, en)", `prislista` ska visa
USD-raden, `oversatt` ska säga "🖐 en: oversattning-en.json saknas".

### 5. Underlaget och den engelska filen
```
node factory/oversattning.mjs factory/butiker/<butik>.yaml <ALLA produktfiler>
```
skriver `output/<butik>/oversattning-sv.json`. En **subagent med
`model: "sonnet"`** får sv-filen + `docs/copy-regler.md` + butikens BRAND.md +
marknadsraden (leveranstid, fri frakt) och skriver
`output/<butik>/oversattning-en.json`:
- EXAKT samma nycklar, samma form (JSON-strängar inuti list-/faq-fält behålls
  som JSON-strängar, `[…]` och `{"fraga":…,"svar":…}` — översätt inuti).
- Frakt- och leveransrader säger MARKNADENS sanning: "Free shipping to the
  US", "8–14 business days" — inte en översättning av "Sverige & Norge".
  `liquid.trust.0` och `liquid.delivery.dagar` likaså.
- Inga SEK-belopp i engelsk text. Står ett belopp i svenskan (fraktpolicyn,
  köpvillkoren "Alla priser anges i SEK"): skriv "in USD" och beloppet ur
  `ekonomi.marknadspriser`, eller stryk siffran.
- Juridiken: "under Swedish law" / "the Swedish Distance Contracts Act" —
  substansen orörd (regel 4). Meningen om EU:s tvistplattform översätts som
  den är; rapporten flaggar den till Axel.
- `recension.*`-raderna: naturlig amerikansk engelska, samma betyg, samma
  namn (namnet får stå kvar — ett svenskt namn på en amerikansk sida är
  ärligare än ett påhittat).
- `tema.default.*`-nycklarna är redan engelska: skriv samma värde.
- Tre-frågorstestet ur copy-reglerna på hero, statement och problem-rubriken,
  redovisat i leveransen.

### 6. Skarpt
```
node factory/ops.mjs factory/butiker/<butik>.yaml <ALLA produktfiler> --resume --igen marknad,tema,oversatt,prislista,recensioner
```
Ordningen är med flit: **tema före oversatt** (custom_liquid-blocken får sin
en-gren när mallen SKRIVS, ur en-filen), **recensioner sist** (Judge.me-CSV:n
får sina engelska rader ur samma fil). Läs `oversatt`-raden: 0 läckor på /en,
annars komplettera en-filen och kör `--igen oversatt` igen. Med
`--i-fraktraden` visar samma rad läckor på /nb — då uppdateras nb-filen också.
`prislista` blir 🖐 tills USD är påslagen i admin (steg 8) — det är rätt, inte
ett fel.

### 7. Kundvyn på riktig HTML — och som amerikansk kund
```
node factory/kundvy-kor.mjs <butik> <handle>
```
läser `/`, `/products/<handle>` och samma på `/en`: struktur, köpknapp
("Add to cart"/"Buy now" räknas sedan 2026-09-16), inga svenska markörer.
**Valutan syns inte på /en** — /en byter språk, inte marknad. Läs som kund i
landet: `POST /localization` med `form_type=localization`, `_method=put`,
`country_code=US`, `language_code=en` (API-GRANSER.md), sedan GET
produktsidan: priset ska stå i USD och vara det ur produktfilen. Före steg 8
står det i SEK — skriv det så, aldrig "klart".
`sprakkoll.mjs` är byggd för bokmål och säger inget om engelskan — läs den
engelska produktsidan själv, hela vägen ner, en gång.

### 8. Klicken bara Axel kan göra (in i rapporten, i ordning)
1. **USD som marknadens valuta:** Inställningar → Marknader → USA → Valuta →
   USD → Spara. API:t kan inte (unified markets). Sedan
   `--igen prislista,paket` — prislistan får sina fasta USD-priser och
   paketnivåerna sin USD-rad i `fastpris_valutor`.
2. **Skatt:** Inställningar → Skatter och tullar → USA. Shopify räknar
   amerikansk sales tax per delstat först när det är påslaget; utan det
   säljs det utan skatt och risken är säljarens.
3. **Betalningar:** Inställningar → Betalningar → Shopify Payments → kolla att
   USD accepteras (den listas under "Valutor"/"Marknader").
4. **Frakten:** zonen "Internationell" täcker USA med butikens standardmetod
   (fri frakt när `frakt.fri_globalt: true`) — bekräfta att leverantören
   faktiskt skickar dit till det priset, annars sätt `frakt.fri_globalt:
   false` + `standardpris` och kör `--igen frakt`.

### 9. Annonserna — ett eget kommando, men säg hur
Annonskontot per marknad står i `factory/opsmarknader.mjs` (USA = Magiborsten
UK, Axels beslut 2026-09-16). Kampanjen byggs TOM av `/ny-annonser` steg 8b
(`node factory/kampanj.mjs <produkt> --marknad US --tom`) och fylls varje dag
av `/ops-oversatt <butik> --marknad US` (byggs av `/notionscalercs setup`).
Rapportera: finns kampanjen redan (kön säger det) står den PAUSED tills Axel
slår på den — och det ska han göra FÖRST när `/en`-sidan svarar (steg 7).

### 10. Minnet, rapporten, pushen
- `products/<butik>/dna.md`: en rad under "Marknader" med datum, valuta,
  pris, leveranstid och vad som är 🖐.
- `factory/PROCESS.md` → "Marknad utanför Norden" om något nytt bevisades.
- Commit + push till `main`. Rutinerna klonar `main`.

---

## DEFINITION OF DONE

- [ ] Landet finns i `factory/lander.mjs` (namn, språk, valuta, locale)
- [ ] Priset i den nya valutan kom från Axel (argument eller svar) — aldrig gissat
- [ ] Marknadsraden i butiksfilen och USD-raden i varje produktfil; `validera.mjs` grön
- [ ] `oversattning-<locale>.json` skriven av subagent, samma nycklar, marknadens frakt/leverans, inga SEK-belopp
- [ ] Bygget kört `--igen marknad,tema,oversatt,prislista,recensioner` med ALLA produktfiler; 0 läckor på /<locale>
- [ ] Kundvyn grön på `/` och `/<locale>`; produktsidan läst som kund i landet (POST /localization) — valutan rapporterad som den ÄR
- [ ] `prislista` grön ELLER 🖐 med klicket "USD som marknadens valuta" — aldrig tyst
- [ ] Inget rört i något annonskonto; annonsfrågan (konto + creatives) står som nästa beslut
- [ ] Juridikflaggan till Axel: policyn refererar svensk lag och EU-ODR för amerikanska kunder
- [ ] dna.md uppdaterad, commit + push till `main`
- [ ] Slutrapport i två listor; Axels klick sist, numrerade, i ordning
