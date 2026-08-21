# Kontorsjakt Hisingen / Kungälv

Sökning efter kontorslokal till 8–12 personer, e-handel utan lagerbehov.
Hämtat **2026-08-21**. Annonser blir inaktuella snabbt — kolla `hamtad_datum` på objektet innan du ringer.

## Vad som finns här

| Fil | Vad |
|---|---|
| `objekt.json` | **Resultatet.** 132 objekt, poängsatta och sorterade på matchpoäng |
| `parametrar.json` | Dina kriterier. Ändra här och kör om poängsättningen |
| `rattelser.json` | Manuella rättelser som ska överleva en omkörning |
| `raa.json` | Rådatan från insamlingen, inklusive objekt som inte kunde bekräftas |
| `kallor.md` | Varje källa jag sökt i, vad den gav, och direktlänkar till det jag inte kom in på |
| `manuella-lankar.json` | Objektvisions kategorisidor — sajten går inte att läsa maskinellt |
| `poang.js` | Räknar matchpoäng och bygger `objekt.json` |
| `verifiera.js` | Hämtar varje annons på riktigt och kontrollerar adress och yta |
| `kallor.js` | Bygger `kallor.md` |

Swipe-appen (`swipe.html` + `bygg.js`) byggs när du godkänt datan.

## Så kör du om det

Från repo-roten, i den här ordningen:

```bash
node kontorssokning/poang.js       # raa.json + parametrar.json -> objekt.json
node kontorssokning/verifiera.js   # kollar varje annons mot verkligheten
node kontorssokning/kallor.js      # bygger om kallor.md
```

Vill du bara ändra ett kriterium — säg att budgeten sätts till 30 000 kr/mån —
räcker det att ändra `parametrar.json` och köra `poang.js`. Allt räknas om.

Granskningen tar ungefär en minut. Den hämtar 132 sidor med curl, fyra i taget,
med en paus emellan för att inte belasta värdarna.

## Hur poängen räknas

Vikterna kommer ur uppdraget och summerar till 100:

| Kriterium | Ideal | Vikt |
|---|---|---:|
| Yta | ≥ 150 kvm | 25 |
| Antal kontorsrum | ≥ 5 rum | 25 |
| Öppen yta | ja, gärna ≥ 40 kvm | 20 |
| Geografi | nivå 1 full, nivå 2 halv, nivå 3 kvarts | 15 |
| Hyra inom budget | ja | 10 |
| Tillträde | matchar önskemålet | 5 |

**Framgår något inte av annonsen ges halv poäng och fältet flaggas i `okanda_falt`.**
Ingen uppgift räknas fram — saknas hyran står den som `null`, inte som en gissning.

Eftersom ingen budgetgräns är satt får alla objekt full poäng på hyra. Sätt
`budget.max_kr_man` eller `budget.max_kr_kvm_ar` i `parametrar.json` om du vill
att hyran ska börja skilja objekten åt.

## Granskningen — skyddet mot påhittad data

`verifiera.js` hämtar varje objekts käll-URL och kontrollerar tre saker mot sidans
faktiska text: att annonsen svarar, att adressen står där, och att ytan står där.
Fältet `granskning.lage` på varje objekt säger hur det gick:

| Läge | Betyder |
|---|---|
| `bekraftad` | Annonsen lever, adress och yta stämmer |
| `delvis_bekraftad` | En av två stämmer — läs noteringen |
| `avviker` | Sidan lever men uppgifterna stämmer inte. **Ring inte utan att kolla själv** |
| `borttagen` | Annonsen svarar 404 — avpublicerad |
| `ej_kontrollerbar` | Sajten blockerar automatisk hämtning. Säger ingenting om objektet |

Just nu är **alla 132 objekt `bekraftad`**.

Två sajter bryter automatisk hämtning och granskas manuellt i stället — de ligger
i `rattelser.json` med datum: Palmung Mellin (bryter TLS-anslutningen) och
Objektvision (bot-skydd, se nedan).

## Objektvision

Sveriges största marknadsplats, och den enda källa jag inte kunde läsa.
Varje URL — även detaljsidorna i deras egen sitemap — omdirigeras till en
bot-utmaning på `/clearance`, som dessutom är spärrad i deras robots.txt.
Den går alltså inte att läsa utan att kringgå skyddet.

Deras nio kategorisidor med annonsantal ligger i `manuella-lankar.json` och i
`kallor.md`. Öppna dem i webbläsaren — där släpps du in. Störst är
*Kontorslokaler Hisingen* med 319 annonser.

## Områdesnivåer

Varje objekt är märkt med `niva`:

- **1** — Hisingen, Göteborg (93 objekt)
- **2** — Kungälvs kommun (30 objekt)
- **3** — E6-korridoren: Backebol, Gamlestaden, Marieholm, Angered, Nödinge/Ale, Surte (9 objekt)

Nivå 3 skulle enligt uppdraget bara tas med om nivå 1–2 blev tunt. Det blev det
inte, så de nio är med enbart för att du ska kunna välja själv — de är avbockade
som standard när appen byggs.

`restid_kungalv_min_uppskattad` är min grova uppskattning av körtid från Kungälv
centrum per område. Den kommer **inte** ur någon annons och påverkar inte poängen.
