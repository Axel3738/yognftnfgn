# Kluster `djur` — FAS 2 (hund, katt, häst, höns)

Körd 2026-09-04. **Läget som styrde körningen:**

- `temu.com` är blockerat för containern. Bilder och video går inte att se, och `WebFetch` på
  `/se/g-<id>.html` ger numera bara Temus generiska startsidetitel — inte den svenska produkttiteln.
  **Gate 5 (MATERIAL) är därför `BLOCKED_SOURCE` på samtliga listningar.** Aldrig FAIL, aldrig PASS.
- **WebSearch-budgeten tog slut efter 8 fraser** (200/200 för hela sessionen). Resterande 26 sökfraser
  kördes via `search.seznam.cz` enligt DATAVAGAR avsnitt 2, som också gav pris i USD och antal
  recensioner. Priser är avskrivna exakt ur sökutdraget och märkta `seznam-snippet`.
- **Hyllan (gate 3) kördes FÖRST**, före varje Temu-sökning, på ägarens svenska ord via PriceRunner
  (fungerar via curl, indexerar Jula, Rusta, Clas Ohlson, Granngården, vidaXL, fackhandeln — men
  **inte Biltema**). Granngårdens egen sök är JS-driven och gick inte att läsa ur HTML.
- **Ingen siffra är gissad.** Där källan saknas står `null` / `UNKNOWN`.

---

## (a) Objektuniversumet jag jobbade från

Basen kom med uppdraget. Kolumnen längst till höger är den enda som avgör om objektet är värt en
sökning: **finns friktionen hos ägaren just den här månaden?**

| Ägaren har | Skydda / fästa / bära / öppna / torka / förvara | Friktion sep–okt 2026 |
|---|---|---|
| **Hundgården / rastgården** ute | tak, vindsida, botten, vattenplats | regnet står rakt in, botten blir lera, vårens presenning har blåst av |
| **Hunden i bilen** | baksäte, bagageutrymme, dörrsida, insteget | älgjakten i oktober, blöt och lerig hund varje dag |
| **Den äldre jakthunden** | rampen upp i bakluckan, lyftet | hunden tar sats och missar; ägaren lyfter 35 kg |
| **Hundburen** | överdrag mot drag och regn | kalla nätter |
| **Kopplet i mörkret** | reflex, lampa, löplina | mörkt 17:30 i oktober |
| **Hundens tassar** | rengöring, salt, lera | varje promenad |
| **Hönsgården (walk-in)** | tak, vindsida, nät, foderplats | regn, storm, gården ska vinterbonas nu |
| **Hönshuset** | luckan, ljuset, drag, värpredet | mörkret kommer, värpningen faller |
| **Foderförvaringen** | råttsäkert lock | råttorna söker sig in i september |
| **Hönsvattnet** | frostfrihet | ⚠️ skadan ligger i november–februari, inte nu |
| **Hagens grind** | stödhjul, lås, gångjärn | marken är sörja, grinden har satt sig och släpar |
| **Hästen i hagen / hästtäcket / stallet** | torkning, hö, vatten, box | blöta täcken, lerig hage |
| **Fågelbordet** | ekorrskydd, tak, stolpe | matningen startar i oktober |
| **Utekatten / kattluckan** | koja, lucka | kalla nätter |

**Avgjort i systemet sedan tidigare och därför inte föreslaget här:** isolerad utekattkoja i Oxford,
hopfällbar isolerad hundkoja, hårdbottnad baksätesförlängare, torkrock för hund (fälld — Rusta 39,90 kr
i samma form), automatisk hönslucka (fälld), uppvärmd hönsvattenautomat (fälld).

---

## (b) Sökfraserna

**Temu-listningsjakt — 34 fraser.**

*WebSearch, `site:temu.com` (8, innan budgeten tog slut):*
dog ramp for car SUV folding pet · kennel cover waterproof outdoor dog run roof tarp ·
horse blanket rack stable dryer hanger · chicken coop winter cover windbreak insulation panel ·
chicken run cover tarp waterproof elastic cords walk-in pen · farm gate wheel adjustable support heavy duty ·
dog crate cover oxford waterproof outdoor kennel · dog car bumper protector tailgate cover scratch pet

*Seznam, `site:temu.com` (26):*
chicken coop tarp cover winter · dog ramp for car folding · gate wheel farm fence ·
dog tie out stake ground anchor · feed storage bin galvanized rodent proof · dog kennel roof cover shade ·
hay net slow feeder horse · automatic water trough float valve livestock · dog ramp car SUV foldable ·
chicken coop run cover waterproof tarp · dog crate cover oxford waterproof outdoor ·
gate wheel fence heavy duty caster u-bolt · horse blanket rack wall mounted stable ·
dog car door protector anti scratch · dog bumper protector car boot ·
chicken coop cover rainproof fabric fencing poultry · chicken run netting cover roof hawk ·
dog kennel cover tarp waterproof outdoor run · chicken coop light solar timer winter laying ·
dog wash hose attachment sprayer brush · heated pet water bowl outdoor winter ·
chicken coop tarp cover elastic bungee winter walk-in · poultry pen cover waterproof windproof shade cloth ·
dog run cover roof panel outdoor kennel shade · chicken coop windbreak panel winter shelter ·
chicken coop cover winter durable tarp elastic cords rope large pen

**Hyllan (gate 3) — på ägarens svenska ord, körd före Temu:**
PriceRunner: hundramp · hundramp bil · bagagerumsskydd hund · bakluckeskydd hund · hundbur överdrag ·
hundgård tak · hundgård tak presenning · hundgård presenning · hönsgård tak · hönshus presenning ·
hönsnät · vindnät · skuggväv · presenning 3x4 · rävskrämma · hästtäcke torkställ · hinkhållare häst ·
jordspett hund · grindhjul · grindstöd hjul · rundbalsskydd · balpresenning.
WebSearch: grindhjul grind stödhjul jula biltema granngården kellfri.
Granngården: hönsgård, regnskydd höns, vindskydd hönsgård, hundgård tak (JS-sök, ej läsbar).

---

## (c) Tratten

**LISTNINGS-TRATTEN**

| Steg | Föll | Kvar |
|---|---|---|
| Råkandidater (unika goods-id) | — | **83** |
| — varav redan kända (`kanda-goods-id.txt`) | 8 märkta `already_known` | 83 |
| Gate 1 OBJEKT (hela hönsgårdar/hundgårdar/kojor, inomhusbädd, smådjursbur) | 20 | 63 |
| Gate 2 PRESENS (frost i hagen = november; jordspett är inte höstbundet) | 2 | 61 |
| Gate 3 HYLLAN (buröverdrag, bagagerumsskydd, djurskrämma, hönsnät, kantlister, fodertunna) | 15 | 46 |
| Redan avgjorda koncept i systemet (automatisk hönslucka × 3) | 3 | 43 |
| Gate 5 MATERIAL | **ej körbar — `BLOCKED_SOURCE`** | 43 |
| Gate 6 EKONOMI (< 199 kr, eller landad > 420 kr) | 11 | 32 |
| Gate 9 PUBLIK (hästutrustning — köparen är kvinna) | 5 | **27** |

27 överlevare = **1 Tier A · 9 Tier B · 17 Tier C**, fördelade på **fyra produktkoncept**.

**KONCEPT-TRATTEN**

26 produktkoncept formulerade → 15 bar egen gate-körning → gate 1 fällde 3 (hela gårdar, inomhusbädd,
smådjursbur) → gate 2 fällde 2 (vattenkopp med flottör, jordspett) → gate 3 fällde 5 (buröverdrag,
bagagerumsskydd, djurskrämma, hönsnät mot hök, fodertunna) → gate 9 fällde 2 (hästtäckesställ, höhäck) →
**4 koncept kvar**, varav 2 med ekonomi PASS på en verklig listning och 2 med
`ALTERNATIVE_LISTING_REQUIRED`.

Ekonomiutfall över alla 83: **12 PASS · 28 FAIL · 43 UNKNOWN** (inget pris i sökutdraget).

---

## (d) Fältmall — Tier A och B

### A (villkorad av material) — Vinterhuv till hönsgården

> Tier A förutsätter normalt egen frame-granskning. Den går inte att göra nu. Håller materialet är detta
> en A; visar leverantörsvideon en tom studioduk är det en B.

- **PRODUCT:** Waterproof chicken coop / poultry run cover for winter — tear-resistant tarp fabric with
  elastic bungee cords and rope, for large walk-in pen
- **TEMU URL:** https://www.temu.com/se/g-601103333430208.html
  (syskon, tier B: 601099756170775 · 601099858645280 · 601105812919031 · 601101311897045 ·
  601099639534098 `already_known` · 606061826278697)
- **OBJECT/OWNER:** hönsgården som redan står på tomten. Ägaren äger gården — huven fästs på den.
- **EXISTING FRICTION:** september–oktober slår regnet rakt in i gården, botten blir sörja, hönsen står
  inne. Presenningen som snördes fast i våras har blåst av i första höststormen. Fotograferbart i en
  svensk trädgård i dag.
- **OLD WAY:** en lösspresenning med spännband och stenar. Den flaxar, samlar vatten och lossnar.
- **PRODUCT'S ROLE:** en formsydd huv med resårlina som dras över gården på en minut och sitter kvar.
- **WHY THE AD DOES NOT NEED TO CREATE DEMAND:** hösten gör jobbet. Frågan pekar bara på ägaren.
- **TEMU MATERIAL:** `BLOCKED_SOURCE`. Slugen säger "cover for winter", "with elastic bungee cords and
  rope", "tear resistant", "for large walk-in pen" — alltså en huv, inte en hel gård. Att dra en huv
  över en gård är en 3-sekunders handling med synlig payoff. **Indicium, inte sett.**
- **0–3 SECOND PROOF:** ej granskat.
- **SWEDISH SHELF STATUS:** PriceRunner "hönsgård tak" → 15 träffar, **alla hela hönsgårdar**
  2 377–15 558 kr (vidaXL). "hönshus presenning" → 0 relevanta. "hönsnät" → 110–557 kr, men det är
  nätet, inte en huv. "vindnät" 95–1 055 kr och "skuggväv" 177–1 055 kr är generella vävar på löpmeter.
  **Ingen svensk kanal säljer en formsydd hönsgårdshuv.** Biltema, Jula, Rusta och Clas Ohlson är inte
  direkt verifierade — `PENDING_VERIFICATION` på just lösspresenningen.
- **TEMU PRICE:** $27, 99+ recensioner (`seznam-snippet`).
- **PLAUSIBLE SWEDISH PRICE:** 799 kr.
- **ECONOMIC ROOM:** landad 282–331 kr · uppslag 2,42–2,83× · **BE-CPA 469 kr** · ekonomi **PASS**.
  Ligger i bandet över 500 kr, som aldrig har förlorat i kontot. Flerköp: nej.
- **VARIANT FRICTION:** **OSÄKER.** Gården mäts i fot i slugen, och ägaren kan inte sin gårds mått
  utantill. Det är kandidatens näst största risk.
- **≤7 WORD OWNERSHIP HOOK:** "Blåser presenningen av hönsgården?" (4 ord)
- **WINNER-STRUCTURE MATCH:** 82
- **TOP 3 REASONS:** (1) exakt samma kommersiella form som IBC-överdraget — en formsydd huv över ett
  ägt objekt som står ute, i en form ingen svensk kedja har hyllat; (2) ekonomin går ihop utan
  konstruktion: 799 kr mot 331 kr landat ger BE-CPA 469 kr; (3) hönsgården är omisskännlig i ett
  Meta-flöde och hobbyhönsägaren på landet är det enda djurobjektet i klustret där mannen köper lika
  ofta som kvinnan.
- **BIGGEST REASON IT COULD FAIL:** att formen i praktiken bara är "en presenning". Då är den
  mass-commoditiserad i varje bygghandel och ägaren har redan köpt en för 149 kr — negativa rymdens
  "köpt old way som fungerar ∧ jämförelsehandlad".
- **CONFIDENCE:** MEDIUM (LOW tills materialet och måtten är sedda).

### B — Regn-/vinterhuv till hundgården (samma form, annan ägare)

- **PRODUCT:** Waterproof dog run / kennel cover, outdoor
- **TEMU URL:** https://www.temu.com/se/g-601099679566501.html
  (dyrare syskon: 601099955262126 $49 — ekonomi FAIL)
- **OBJECT/OWNER:** hundgården/rastgården på tomten. Gårdshunds- och jakthundsägaren äger den.
- **EXISTING FRICTION:** i oktober står hunden i regn i rastgården och botten blir lera.
- **OLD WAY:** presenning och spännband, eller ingenting.
- **PRODUCT'S ROLE:** tak och vindsida på gården, färdigt i en stillbild.
- **WHY THE AD DOES NOT NEED TO CREATE DEMAND:** rimfrost och regn på hundgården är bilden.
- **TEMU MATERIAL:** `BLOCKED_SOURCE`. Slug: "dog run cover roof panel outdoor kennel shade".
- **SWEDISH SHELF STATUS:** PriceRunner "hundgård tak presenning" → 20 träffar, **alla hela hundgårdar
  och kojor** 590–11 769 kr (vidaXL, Northio, tectake). Inget överdrag.
- **TEMU PRICE:** UNKNOWN på den valda listningen; syskonet ligger på $49 (landad 511–600 kr = FAIL).
- **PLAUSIBLE SWEDISH PRICE:** 499 kr.
- **ECONOMIC ROOM:** ej verifierat — `ALTERNATIVE_LISTING_REQUIRED`.
- **VARIANT FRICTION:** OSÄKER (hundgårdens mått).
- **≤7 WORD OWNERSHIP HOOK:** "Står hunden i regn i hundgården?" (6 ord)
- **WINNER-STRUCTURE MATCH:** 70
- **TOP 3 REASONS:** samma hyllfrånvaro som hönsgårdshuven; publiken är kontots kärna (gårdshund och
  jakthund på landet); ankaret (hela gården 2 000–11 000 kr) är synligt utan att vi sätter det själva.
- **BIGGEST REASON IT COULD FAIL:** de listningar som gick att prissätta är för dyra. Konceptet håller,
  listningen inte.
- **CONFIDENCE:** LOW

### B — Stödhjul till grinden

- **PRODUCT:** Heavy duty fence / farm gate wheel, adjustable U-bolt, anti-sagging caster
- **TEMU URL:** https://www.temu.com/se/g-601099594874458.html
  (fler: 601099553357643 · 601101540545415 · 601102414551615 · 601102415516530 · 601101084638345)
- **OBJECT/OWNER:** grinden till hagen, hundgården eller tomten. Fastighetsägaren äger grinden.
- **EXISTING FRICTION:** i oktober är marken sörja, grinden har satt sig och släpar — den lyfts för
  hand varje gång. Fotograferbart i dag.
- **OLD WAY:** lyfta grinden, klossa upp den med en sten, spänna en vajer diagonalt.
- **PRODUCT'S ROLE:** ett fjädrande hjul under grinden som bär upp den. Payoffen — grinden svänger
  fritt — är en 3-sekundersbild.
- **WHY THE AD DOES NOT NEED TO CREATE DEMAND:** en släpande grind är ett dagligt handgrepp.
- **TEMU MATERIAL:** `BLOCKED_SOURCE`. Slug: "600lb capacity, 8 inch rubber tire, anti-sagging".
- **SWEDISH SHELF STATUS:** Biltema har grind-/dörrstängarfjäder och transporthjul men **inte** ett
  grindstödhjul. PriceRunner indexerar inte lantbruksbeslag. Hästfackhandeln (Djurgårdens Ridsport)
  säljer "Stödhjul för grind kraftig/medium" — pris inte läst. `PENDING_VERIFICATION`.
- **TEMU PRICE:** UNKNOWN på de billiga varianterna; de två prissatta ligger på $45 och $85.
- **PLAUSIBLE SWEDISH PRICE:** 499 kr.
- **ECONOMIC ROOM:** $45 ger landad 470–551 kr och $85 ännu mer — **båda över 420 kr-stoppet**.
  `ALTERNATIVE_LISTING_REQUIRED` på en lättare variant.
- **VARIANT FRICTION:** **PASS** — parametern är grindens rörprofil, som ägaren ser direkt.
- **≤7 WORD OWNERSHIP HOOK:** "Släpar grinden i leran?" (4 ord)
- **WINNER-STRUCTURE MATCH:** 74
- **TOP 3 REASONS:** rätt kön och rätt ålder utan omväg — grinden sköts av mannen på fastigheten;
  hooken är fyra ord och kan bara besvaras av någon som äger en grind; payoffen syns utan förklaring.
- **BIGGEST REASON IT COULD FAIL:** ståldelar är tunga, och montering (U-bygel + skruv) är en
  negativ-rymd-markör.
- **CONFIDENCE:** LOW

---

## (e) Lärorika Tier C-avslag

1. **Hundramp till bilens baklucka (606564203233641, $54 · 606389183296942, $69) — C, ekonomi,
   strukturellt.** Konceptet är nästan perfekt: ägt objekt (bilen + den åldrande jakthunden), presens i
   oktober (älgjakt, blöt hund), rätt publik, och hyllan går att passera på undantaget — svenska ramper
   ligger på 339–2 297 kr och ankarna 1 173–2 297 kr är 1,7–3,3× ett tänkt pris på 699 kr. Men landad
   kostnad blir 564–845 kr, alltså över 420 kr-stoppet, och 2,4× hamnar över 1 000 kr-taket.
   **Lärdomen är densamma som trampfoderautomaten gav förra körningen: vikt är en gate.** En hopfällbar
   aluminiumramp kan aldrig bli billig nog — felet är inbyggt i produkten, inte i listningen.
2. **Hundburöverdrag i Oxford (601099515706395, $14 m.fl.) — ELIM, hyllan.** Ekonomin är den bästa i
   hela klustret ($14 → landad 146–171 kr). Ändå död: Dogman säljer exakt samma form för 416–701 kr i
   svensk fackhandel. **Ankaret är produkten själv**, inte ett märkesankare på 1,6×, och undantaget
   gäller bara när vår produkt ser ut som ett dyrare märke. Bra ekonomi räddar aldrig en hyllad form.
3. **Nät över hönsgården mot hök (606030033447457, $15) — C, hyllan + presens.** Två fel på en gång:
   höken tar höns på våren när ungarna är små, inte i oktober, och nät i löpmeter är mass-commodity i
   Sverige (hönsnät 110–557 kr på PriceRunner). **Samma objekt som Tier A:n — men fel form och fel
   månad.** Det är skillnaden mellan att skydda gården mot vädret som är här nu och mot ett rovdjur som
   kommer om nio månader.
4. **Automatisk vattenkopp med flottör till hagen (605840853537677, $57) — ELIM, presens.** Fälls av
   exakt samma regel som den uppvärmda hönsvattenautomaten: skadan ligger i frostmånaderna, inte i
   september–oktober. **Frost är alltid en framtida skada i den här launchmånaden** — oavsett vilket
   djur den drabbar.

---

## Vad koordinatorn behöver göra centralt (i den här ordningen)

1. `temu-ld.py` på **601103333430208** när blocket släppt — pris, varianter (fotmått!), video.
   Sedan syskonen 601099756170775 · 601099858645280 · 601105812919031 · 601101311897045.
2. Materialgaten (frames 0–3 s) på samma: **dras huven över en riktig hönsgård i bild, eller ligger
   den vikt i studio?** Det avgör A eller B.
3. Fyra kedjesökningar på **"presenning"** hos Biltema, Jula, Rusta och Clas Ohlson. Det är den enda
   kvarvarande hyllrisken på Tier A:n.
4. Ett riktigt tal på **antal svenska hushåll med höns**. Gate 9 står som OSÄKER utan det, och det är
   den variabel som sänkte hela djur-klustret förra gången.
5. Alternativa listningar (`alt/`) på **stödhjul till grind** — en lättare variant under $25 — och på
   **hundgårdshuv** under $30.
