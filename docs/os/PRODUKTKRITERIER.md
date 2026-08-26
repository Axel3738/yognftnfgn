# Produktkriterier — hur en Bäverbutik-produkt väljs

**Normativ.** Fyller luckan "Kriterierna i *What product is next?*" i `docs/os/SOP-06-produkttest.md`.
Körs av `/produkt` (se `.claude/commands/produkt.md`). Minnet ligger i `products/kandidater.json`.

Gäller **bara Bäverbutiken** (MagiBorsten `1867947880635861`). Grillkliniken har inget produktval.

---

## Vad Bäverbutiken är

En general store **riktad mot män**. Det är hela affärsiden: det finns hundratals
svenska general stores som dropshippar, men nästan inga som konsekvent riktar sig
mot män. Varje produktval ska försvara den positionen.

Kontots bevisade nischer (från `products/products.json` + produktminnena):

| Nisch | Bevis |
|---|---|
| Bil & garage | motorhöljet, sätesöverdragaren |
| Båt & sjö | motorhöljet (båtkapell) |
| Kropp/hållning för män | axelbältet |
| Utomhus/sommar | strandtofflorna |
| Verkstad & förvaring | väggfästet |
| Fiske, jakt, grill, ved, snö, husbil, EDC, snickeri | **obrutna** — högst prioritet i jakten |

**Köparen är en man som köper till sig själv.** Presentprodukter ("till honom som
har allt") är en annan affär med annan säsong och annan copy — de klassas som `VÄNTA`,
inte `GO`, om de inte klarar allt annat med marginal.

---

## Arbetsdelningen: Claude rangordnar, Axel godkänner

**Claude fäller aldrig ett slutgiltigt ja eller nej.** Uppgiften är att leverera en
*rangordnad lista* med research och poäng, så att Axel kan gå igenom den och säga ja
eller nej på magkänsla. Skriptet räknar därför fram en poäng — aldrig en dom.

Det finns en anledning: gränsen för vad som är "för känt" sitter i Axels huvud, inte i
en tabell. Han såg det själv — *"det är svårt för dig att veta"*. Systemet blir bättre
genom att hans domar sparas och läses, inte genom hårdare regler.

```bash
node pipeline/kandidater.mjs godkann <slug> "skäl"
node pipeline/kandidater.mjs neka    <slug> "skäl"
node pipeline/kandidater.mjs smak      # vad han faktiskt säger ja och nej till
```

**Skälet är obligatoriskt** — det är det enda systemet lär sig av. `smak` visar vilken
axel som faktiskt skiljer ja från nej, godkännandegrad per nisch, och hans egna ord.
**Kör `smak` innan varje ny lista** när det finns tre domar eller fler.

---

## Steg 1 — Två hårda stopp. Bara två.

Tidigare hade den här filen sex grindar, och de var för hårda. Axel:
*"för grejen är det ändå att få finnas i butiker."* En produkt får alltså finnas i
handeln — den får bara inte vara **svinkänd**. Det är numera en poängaxel, inte en grind.

Kvar som verkliga stopp är bara det som gör en produkt omöjlig att sälja över huvud taget:

### S1 — Frakt och regler
Litiumbatteri · CE-/elsäkerhetskrav · livsmedelskontakt · vapenlikt · ömtåligt i
postgång · leveranstid över tre veckor.

### S2 — Marginal
Går inte att sälja till minst 3× landed cost. Räkna break-even-ROAS som
`1 / (1 − landed cost / försäljningspris)` och jämför mot kontots spann i
`products/products.json` (1,34–2,00 idag).

⚠️ **Bäverbutikens momsläge står ingenstans i repot.** Fråga Axel innan du drar av
25 % — gör du det reflexmässigt ser lönsamma produkter ut att gå med förlust.

**Ett stopp kräver en källa.** Ingen källa, inget stopp (CLAUDE.md regel 3).

---

## Steg 2 — Sex poängaxlar, 0–5. Max 40.

Wow och kändhet väger dubbelt — det är de två Axel själv lyfte fram.

| Axel | Vikt | 0 | 5 |
|---|---|---|---|
| **Wow** | **×2** | "jaha" | "vad fan är det där" — man stannar tummen |
| **Kändhet** | **×2** | hyllvara målgruppen kan priset på | knappt sedd i Sverige |
| Problem | ×1 | konstruerat | gör ont, ofta, och mannen vet om det |
| Demo | ×1 | inget före/efter | före/efter filmar sig självt |
| Mansprodukt | ×1 | inte hans grej | han köper den till sig själv |
| Marginal | ×1 | break-even-ROAS ~2,0 | break-even-ROAS ≤1,4 |

### Kändhetsskalan — den nya, och den som ersatte ICA Maxi-grinden

| Poäng | Betyder | Exempel |
|---|---|---|
| **0** | Hyllvara i Biltema/Jula/Clas Ohlson, målgruppen kan priset | skruvutdragare (Jula 49,90), knivslip |
| **1–2** | Finns i bredhandeln, men få tänker på den | klyvkil, sågkedjeslip |
| **3** | Bara i specialistbutik eller på Amazon.se | — |
| **4** | I princip bara Temu/AliExpress | fiskeklämma |
| **5** | Knappt sedd i Sverige alls | — |

Så tas den fram, i den ordningen:

1. `WebSearch` på `pricerunner <svensk term>` — antalet står i träffens titel
   (`"Skruvutdragare • Jämför (97 produkter)"`). Högt antal = låg kändhetspoäng.
2. Direktsök hos Clas Ohlson, Kjell och XXL — de går att hämta.
3. Biltema, Jula, Rusta, Bauhaus blockerar direktanrop → täck med `WebSearch`.
4. Amazon.se räknas **inte** som bredhandel. Nästan varje dropshippingprodukt ligger
   där; räknades den som hyllvara skulle axeln bli meningslös. Den drar ner poängen
   bara om listningen ligger högt på den svenska sökterm kunden själv skriver.

**Poängen får inte hittas på.** Har ingen sett produktbilden sätts `wow` till `null` —
skriptet räknar då fram en indikativ poäng och skriver ut att wow saknas. Det är
bättre än en gissning.

---

## Dödzonen: nischer där kändheten alltid blir 0

Uppmätt 2026-08-26 med ett skarpt svep av ved/verktyg/garage. **Fem kandidater, alla med kändhet 0–1** — allihop fällda av Biltema eller Jula:

| Kandidat | Finns hos |
|---|---|
| Elektrisk sågkedjeslip | Jula 349 kr · Biltema Kedjeslipmaskin 130 W |
| Klyvkil / vedkil (även 4-vägs) | Jula (Meec Tools, rak + vriden) · Biltema · Clas Ohlson 4-vägskniv · PriceRunner: 22 produkter |
| Skruvutdragarsats | Jula 49,90 kr · Biltema · Bauhaus · Clas Ohlson · PriceRunner: 97 produkter |
| Fällkilar | Samma hylla som klyvkilen |
| Pickaroon / vedhake | Samma hylla |

**Mönstret, och det är riktningsgivande:** Biltema och Jula äger handverktyg,
vedbearbetning och bilverktyg i Sverige — till priser vi omöjligt kan konkurrera med
och som målgruppen kan utantill. Söker du i deras kärnsortiment letar du i en minerad
nisch.

Och åt andra hållet: **kontots alla vinnare ligger utanför det sortimentet** — båtkapell,
sätesöverdrag till åkgräsklippare, hållningsbälte, strandtofflor, väggfäste. Ingen av
dem finns på Biltemas hyllor.

**Regeln som följer:** innan en nisch sveps, fråga *"har Biltema en egen hyllsektion för
det här?"* Är svaret ja — byt nisch, eller leta specifikt efter det som ligger *bredvid*
hyllan. Det som är värt att svepa är produkter som löser ett mansproblem **utan** att
vara ett handverktyg.

## Steg 3 — Vad som loggas

Varje bedömd produkt skrivs till `products/kandidater.json` — **även nekade**.
Det är hela poängen: utan de nekade utvärderas samma produkt igen om tre månader,
och utan Axels skäl lär sig systemet ingenting.

`node pipeline/kandidater.mjs sok <term>` före varje ny bedömning.

## Vad Claude faktiskt kan och inte kan (verifierat 2026-08-26)

Ärlighet här avgör om systemet går att lita på. Testat i den här miljön:

| Källa | Läge | Vad vi får |
|---|---|---|
| **`temu.com/search_result.html?search_key=<term>` via WebFetch** | ✅ | **Enda källan till LEVANDE produktlänkar.** Be uttryckligen om href/URL — då kommer `-g-<id>.html` med. Utan `/se/` i sökvägen. Stryps efter ~9 anrop |
| `site:temu.com <term>` via WebSearch | ☠️ | **ANVÄND ALDRIG FÖR LÄNKAR.** Sökmotorns index är gammalt — länkarna leder till avpublicerade listningar som visar "Den här produkten är slutsåld". Brändes 2026-08-26, se nedan |
| `temu.com/se/search_result.html?search_key=<svensk term>` | ✅ | Renderar inte i WebFetch, men är en **säker länk att leverera**: alltid levande, alltid svenskt lager. Reservlösning när direktlänk inte hinns med |
| Temu efter ~10 anrop | ❌ | **Stryps hårt.** Svaret blir bara sidtiteln "Temu" och hade inte återhämtat sig efter en timme. Gäller även enskilda produktsidor |
| **Produktbilder från Temu** | ❌ | Går inte att hämta på någon testad väg. Sheetet får produktnamn i kolumn A i stället för bild |
| **WebSearch** | ✅ | Bärande verktyget för kändhetsaxeln och mättnadskollen |
| Clas Ohlson-, Kjell-, XXL-sök | ✅ | Direkt G1-kontroll |
| Temu-priser | ⚠️ | **Opålitliga.** Extraheringen blandar ihop rader — vi har sett en pennvässare på $495. Priset läser Axel av själv |
| Temu sold-count / omdömen | ❌ | Finns inte i det vi kan hämta. Ingen automatisk säljvolym-validering |
| AliExpress | ❌ | 503 |
| Meta Ad Library | ❌ | 403 — mättnadskollen får gå via WebSearch |
| Kickstarter, Reddit, TikTok Creative Center, Amazon.se, Jula, Biltema, Rusta, Bauhaus | ❌ | 403/503/tomt skal |
| Chromium/Playwright | ❌ | All utgående trafik från webbläsaren resettas i den här miljön |
| PriceRunner (direktanrop) | ❌ | Tomt — men antalet syns i WebSearch-träffens titel, se G1 ovan |

**Konsekvensen — arbetsfördelningen:**

- **Claude gör:** söktermerna, Temu-svepet, G1- och G2-sökningarna med källor,
  poängsättningen, loggen och dedupen.
- **Axel gör:** tittar på produktbilden och sätter wow-poängen, läser av det riktiga
  priset på Temu, tar det slutliga köpbeslutet.

Claude sätter aldrig en wow-poäng på en produkt vars bild ingen har sett — den lämnas
tom och domen hålls tillbaka tills Axel fyllt i den.

---

## ☠️ Länkfällan — läs den här innan du bygger ett quote-sheet

**2026-08-26 levererades 20 produkter där nästan varje länk visade "Den här produkten
är slutsåld".** Orsaken var inte tur eller lagerbrist. Länkarna var hämtade ur
sökmotorns index via `site:temu.com`, och det indexet är gammalt: två av träffarna hade
till och med "This item was discontinued" i titeln. Sheetet byggdes på ett arkiv i
stället för på lagret.

**Så här ser skillnaden ut i praktiken:**

| Källa | Typiskt goods-ID | Läge |
|---|---|---|
| `site:temu.com` (sökmotorindex) | `g-601099…` | Ofta avpublicerad |
| `search_result.html` (Temus egen katalog) | `g-606…`, `g-607…`, `g-610…` | Levande just nu |

⚠️ ID-numret ensamt är **inget bevis** — Temus levande katalog innehåller även
`601099…`-listningar. Det enda som räknas är att länken kom ur en **live-sökning**.

**Regeln:** en produktlänk som ska in i ett quote-sheet måste komma ur
`temu.com/search_result.html?search_key=<term>` hämtad med WebFetch, där prompten
uttryckligen ber om href/URL. Kom länken från en vanlig webbsökning är den obekräftad
och får inte levereras som direktlänk.

**Budgeten:** Temu stryper efter ungefär nio anrop och svarar sedan bara med sidtiteln
"Temu". Det räcker till 8–9 verifierade produkter per session. Behövs fler: leverera
resten som **svenska söklänkar** (`temu.com/se/search_result.html?search_key=<svensk
term>`) och markera i leveransen vilka rader som är verifierade och vilka som är
söklänkar. En söklänk går aldrig sönder — den är en ärlig reservlösning, inte ett fusk.

---

## Quote-sheetet

Leverantörsofferten byggs med `pipeline/quote-sheet.py`, som återskapar Axels mall exakt:

```bash
pip install openpyxl                                  # enda beroendet
python3 pipeline/quote-sheet.py produkter.json ut.xlsx
```

`produkter.json` är en lista med `{namn, temu_lank, bild, butikslank, leverantor_ref}`.
Bara `temu_lank` krävs; `bild` är en lokal fil (Temus bild-URL:er går inte att hämta,
så bilden måste sparas ner först).

**Mallens struktur** (avläst 2026-08-26): rubrik på rad 1–2, tvåradig kolumnrubrik på
3–4, sedan ett produktblock var fjärde rad — tre rader för kvantitet 1/2/3 plus en tom
mellanrad. Sverige ligger inline (`H`–`K`), följt av Norge, Finland, Danmark och UK i
egna sexkolumnersblock med var sin färg. **Gula celler fyller leverantören i**, gröna är
summor, och produktnamnet står inte i text — produkten identifieras av bilden i kolumn A
och Temu-länken i kolumn M.

Två medvetna avsteg från mallen, båda för att mallen är inkonsekvent i sig:
- **Radhöjd 45 pt i alla block.** Mallen växlar mellan 45, 22,5 och 15,75 — bara 45
  ger plats åt produktbilden.
- **Blocktonen växlar hela vägen ner.** Mallen växlar korrekt i block 1–7 och slutar
  sedan; de sista blocken hann aldrig formateras.

⚠️ LibreOffice kan inte öppna xlsx-filer i den här miljön, så filen går inte att
förhandsgranska eller räkna om här. Sheetet innehåller inga formler, så det spelar
ingen roll — men lägger någon in formler måste de verifieras på Axels dator.
