# Swipe: Roy's Boys "Meet…" → "Möt Matstrumpor" (2026-08-25)

> **Källa:** Axels röstanteckning + skärmdumpar 2026-08-25 (uppladdad docx).
> Original: Roy's Boys (USA, karaktärsstrumpor/hattar), 15 s video i Ad Library.
> 8 referens-frames ur originalet: `docs/source/matstrumpor-roysboys-swipe/`
> (image1–8.png). Originallänken i docx:en är en tidsbegränsad CDN-länk och dör —
> frames är det beständiga referensmaterialet.

## Axels strategiska observation (viktigare än själva swipen)

Återkommande tema hos Roy's Boys — närmaste jämförbara brand vi hittat
(strumpor med igenkännbara motiv, samma impuls/present-köp):

- **Ingen av deras toppannonser har voiceover.** Toppvideorna är nästan tysta:
  "packa en order med oss" helt tyst, slideshows med knappt någon musik.
- **Bildannonser på bara strumporna är deras bästa annonser.**
- Lekfullt tema rakt igenom, inga effekter, inga hooks som skriker — bara
  produkten i vardagliga miljöer.

Detta ska vägas in i kommande batcher: vi har hittills byggt UGC-voiceover-tunga
script (001–007). Roy's Boys-signalen säger att tysta produktvideor och rena
bildannonser förtjänar en egen testgren.

## Mekanik-notis

Originalets mekanik: "möt varumärket"-stege utan voiceover. 8 korta shots
(~1–1,5 s styck), en kort textrad per shot som poppar upp, sedan 5 s ren b-roll
och end card med logga som fadear in. **Ingen CTA, inget pris — bara loggan.**
Rad 1 har skriveffekt (~1 s), resten poppar direkt. Textplaceringen vandrar
(nere → uppe → mitten) så ögat hålls igång. Strukturen i stegen:
intro (1) → parallellpar (2–3) → "för varje …"-trippel (4–6) → förpackningen (7)
→ present (8). Peppa Pig-shoten (5) gör igenkänningsjobbet — vår motsvarighet är
maten själv: alla känner igen sushi, pizza, hamburgare, donut.

Total längd: ~14 s (8 shots ≈ 8,5 s + 5 s outro + end card).

## Shotlista

Redigerarna filmar/genererar b-roll enligt samma princip som briefs 010–013:
kolumnen är inspiration, produktkorrekthet mot riktiga produktfoton på
matstrumpor.se är enda hårda regeln. Vardagliga svenska hem-miljöer, dagsljus,
ingen studio. Ingen voiceover; låg, nästan omärklig musik eller helt tyst.

| # | Duration | Text (se stege nedan) | Texteffekt/placering | Visuellt |
|---|---|---|---|---|
| 1 | 1,5 s | Rad 1 | Skriveffekt ~1 s, nedre delen | POV: händer håller upp sushilådan, vardagsmiljö, paket skymtar i bakgrunden |
| 2 | 1 s | Rad 2 | Poppar direkt, övre delen | Händer håller upp ett par strumpor från sidan in i bild; hemmamiljö med hyllor/detaljer bakom — familjärt, inte studio |
| 3 | 1 s | Rad 3 | Poppar direkt, nedre delen | B-roll: strumporna utlagda på ett vardagsbord, lådan under |
| 4 | 1 s | Rad 4 | Poppar direkt, mitten/nedre | B-roll: fler sorter (pizza, hamburgare) liggande på lådan |
| 5 | 1 s | Rad 5 | Poppar direkt, mitten/nedre | Sushistrumpan hålls upp mot kameran utomhus/trädgård — igenkänningsshoten: den ser ut som riktig sushi |
| 6 | 1 s | Rad 6 | Poppar direkt, mitten/nedre | B-roll: strumpor på bordet/lådan igen, helt vanlig vardag |
| 7 | 1 s | Rad 7 | Poppar direkt, mitten/nedre | Sushilådan i närbild — lådan ÄR presentförpackningen |
| 8 | 1 s | Rad 8 | Poppar direkt, övre delen | B-roll: alla fyra sorterna tillsammans (bästsäljar-shoten hos originalet) |
| 9 | 5 s | — | Ingen text | Blandad b-roll på produkterna |
| 10 | sista sekunden | — | — | End card: logga fadear in snabbt. **INGEN CTA, ENDAST LOGGA** |

## Copyn — tre stegvarianter

Skriven av Opus-subagent (Axels instruktion 2026-08-25: testa Opus för copyn;
Opus 3 specifikt är pensionerad ur API:t sedan januari 2026 och gick inte att
välja — senaste Opus användes). Axel tar beslutet och finslipar.

Alla tre stegar följer mekaniken: rad 1 = skriveffekt, rad 2–3 = parallellpar,
rad 4–6 = trippel med anafor, rad 7 = förpackningen, rad 8 = present.
Shot-kolumnen per stege ersätter shotlistans visuella kolumn när stegen väljs —
timing, texteffekt och placering följer alltid shotlistan ovan.

### Stege A — "Förväxlingen"
*Bär hela stegen på kontrasten mat/strumpa. Rad 2–3 speglar originalets
quality/design-par i formen "Ser ut … / Sitter …".*

| # | Rad | Ord | Shot |
|---|---|---|---|
| 1 | **Möt Matstrumpor…** | 2 | Skriveffekt över stängd sushilåda |
| 2 | **Ser ut som mat** | 4 | Sushibitarna i lådan, makro |
| 3 | **Sitter som strumpor** | 3 | Samma rulle vecklas ut på en fot |
| 4 | **Till varje sushifantast** | 3 | Sushilådan |
| 5 | **Till varje pizzafantast** | 3 | Pizzastrumpan |
| 6 | **Till resten: burgare, donut** | 4 | Burgare + donut sida vid sida |
| 7 | **Lådan? Också sushi.** | 3 | Locket på, lådan hel i bild |
| 8 | **Redan inslagen.** | 2 | Lådan räcks över |

**Tre-frågorstestet — Stege A**

| Rad | Visualisera | Falsifiera | Ingen annan kan säga det |
|---|---|---|---|
| 1 Möt Matstrumpor… | ✅ namnet är produkten (mat + strumpa) | ✅ butikens namn, sant/falskt | ✅ |
| 2 Ser ut som mat | ✅ maki i låda | ✅ gör de det eller inte | ✅ hela produktidén |
| 3 Sitter som strumpor | ✅ rullen blir en strumpa | ✅ det är strumpor | ✅ bara den som säljer båda i ett |
| 4 Till varje sushifantast | ✅ sushilådan | ✅ sorten finns | ✅ (strukturrad, se not) |
| 5 Till varje pizzafantast | ✅ pizzastrumpan | ✅ sorten finns | ✅ (strukturrad, se not) |
| 6 Till resten: burgare, donut | ✅ två produkter i bild | ✅ sortimentet är fyra | ✅ sortimentet är vårt |
| 7 Lådan? Också sushi. | ✅ lådan i bild | ✅ lådan ser ut som sushibox | ✅ ingen annan sockbox gör det |
| 8 Redan inslagen. | ✅ lådan räcks över hel | ✅ krävs presentpapper eller inte | ✅ förpackningen ÄR presenten |

*Not rad 4–5:* en generisk strumpfirma kan skriva "Till varje X-fantast", men
orden `sushifantast`/`pizzafantast` går bara att signera av den som säljer sushi
och pizza som strumpor — trippelns helhet (4–6) är därför Matstrumpor-specifik
och båda raderna passerar fråga 3 i sitt sammanhang.

### Stege B — "Ingen gissning"
*Kopplad till VOC: "jag vet inte vad jag ska köpa" + "fel ålder/fel storlek".
Rad 2–3 är par på anaforen "Ingen … att gissa", rad 4–6 på "känner alla igen" —
och rad 6 bryter mönstret som punchline. Det här är originalets "Every
character"-beat: igenkänningen ligger i själva maten.*

| # | Rad | Ord | Shot |
|---|---|---|---|
| 1 | **Möt Matstrumpor…** | 2 | Skriveffekt över de fyra sorterna |
| 2 | **Ingen storlek att gissa** | 4 | En strumpa dras på två olika fötter |
| 3 | **Ingen smak att gissa** | 4 | Fyra sorter i rad |
| 4 | **Sushi känner alla igen** | 4 | Sushilådan öppnas |
| 5 | **Pizza känner alla igen** | 4 | Pizzastrumpan viks ut |
| 6 | **Fötter har alla** | 3 | Fyra par fötter i olika strumpor |
| 7 | **Ligger i sushilådan** | 3 | Locket på plats |
| 8 | **Inget presentpapper behövs** | 3 | Lådan ställs på ett dukat bord |

**Tre-frågorstestet — Stege B**

| Rad | Visualisera | Falsifiera | Ingen annan kan säga det |
|---|---|---|---|
| 1 Möt Matstrumpor… | ✅ | ✅ | ✅ |
| 2 Ingen storlek att gissa | ✅ samma strumpa, två fötter | ✅ one size, sant/falskt | ❌ strukturrad — alla one size-märken kan skriva den; håller ihop paret med rad 3, vars innehåll (fyra matsorter) är vårt |
| 3 Ingen smak att gissa | ✅ fyra sorter uppradade | ✅ sortimentet är fyra kända rätter | ✅ bara den som säljer mat som strumpor |
| 4 Sushi känner alla igen | ✅ sushilådan | ✅ sushi är allmängods | ✅ (strukturrad i trippeln) |
| 5 Pizza känner alla igen | ✅ pizzastrumpan | ✅ pizza är allmängods | ✅ (strukturrad i trippeln) |
| 6 Fötter har alla | ✅ fyra par fötter | ✅ one size, unisex | ✅ landar bara som skämt när raderna före handlar om mat |
| 7 Ligger i sushilådan | ✅ lådan i bild | ✅ lådan är förpackningen | ✅ |
| 8 Inget presentpapper behövs | ✅ oinslagen låda på bord | ✅ behövs det eller inte | ✅ förpackningen ser redan ut som en present |

### Stege C — "Dubbeltitten"
*Säljer reaktionen (VOC: "reaktionen är målet — ögonblicket när paketet öppnas")
och att de används efteråt. Rad 4–6 är trippeln med anaforen "tittar två
gånger", som ekar i rad 8.*

| # | Rad | Ord | Shot |
|---|---|---|---|
| 1 | **Möt Matstrumpor…** | 2 | Skriveffekt över stängd låda |
| 2 | **Ett skratt först** | 3 | Locket åker av |
| 3 | **Ett par sen** | 3 | Samma strumpor på fötter, vanlig dag |
| 4 | **Mormor tittar två gånger** | 4 | Äldre händer håller sushilådan |
| 5 | **Tonåringen tittar två gånger** | 4 | Tonåring lyfter en donutstrumpa |
| 6 | **Alla tittar två gånger** | 4 | Snabbklipp: flera par händer |
| 7 | **Förpackningen är halva poängen** | 4 | Lådan sluts, hel i bild |
| 8 | **Presenten öppnas två gånger** | 4 | Lådan öppnas → strumporna rullas ut |

**Tre-frågorstestet — Stege C**

| Rad | Visualisera | Falsifiera | Ingen annan kan säga det |
|---|---|---|---|
| 1 Möt Matstrumpor… | ✅ | ✅ | ✅ |
| 2 Ett skratt först | ✅ locket åker av | ✅ reaktionen sker eller inte | ❌ strukturrad — vilken skämtpryl som helst kan signera den; blir vår i paret med rad 3 (skämtet som också bärs) |
| 3 Ett par sen | ✅ strumporna på fötterna | ✅ de används eller inte | ✅ ingen annan skämtpresent hamnar på fötterna |
| 4 Mormor tittar två gånger | ✅ händer + låda | ✅ dubbeltitten sker eller inte | ✅ kräver att produkten ser ut som mat |
| 5 Tonåringen tittar två gånger | ✅ donutstrumpan lyfts | ✅ samma | ✅ samma |
| 6 Alla tittar två gånger | ✅ snabbklipp | ✅ samma | ✅ trippelns helhet är förväxlingen |
| 7 Förpackningen är halva poängen | ✅ sushilådan hel i bild | ✅ lådan är presentförpackningen | ✅ ingen annan strumpask är en matlåda |
| 8 Presenten öppnas två gånger | ✅ låda → strumpor | ✅ två avslöjanden, räknebart | ✅ bara när både låda och innehåll ser ut som mat |

### Subagentens rekommendation (Axel tar beslutet)

**Stege A är starkast.** Den är den enda där varje rad är otänkbar för en annan
strumpfirma — "Ser ut som mat / Sitter som strumpor" gör hela produktlöftet på
sju ord, och "Redan inslagen." landar presenten utan att låta som en CTA. Den
har dessutom lägst ordantal per rad (2–4), vilket är det som avgör i en
14-sekundersvideo utan voiceover.

Stege C är tvåan och den bästa att testa mot A: den säljer reaktionen som VOC:en
pekar ut som köpmotivet. Stege B är svagast — två av dess rader är strukturrader
som vilken one size-strumpa som helst kan signera.

**QA av huvudsessionen:** inga priser, ingen CTA, inga påhittade fakta. One
size/unisex verifierat mot temats säljpunkter ("En storlek passas alla"-raden i
`theme-matstrumpor/README.md`). Rad 7–8 om lådan gäller sushiboxen — samma
verifierade påstående som i fotbollsbok-swipen. Två ❌ på fråga 3 (B2, C2) är
markerade strukturrader; går stegen ut ska raden ses över eller motiveras.

## Namnförslag enligt konventionen

`MATSTRUMP_alla_benefit_lifestyle_motmatstrumpor_v1`

- `alla` — alla fyra sorterna visas; `benefit` — närmast för en möt-varumärket-
  stege (kvalitet/design/bredd), ingen ren brand-vinkel finns i vokabulären.
- `lifestyle` — riktiga videoshots i vardagsmiljö (inte `slideshow`, som är
  stillbilder med musik).
- Läs av upptagna namn i kontot `730973156224390` före numrering (regel 8).
  ⚠️ Kontot stod som UNSETTLED i CLAUDE.md — verifiera betalstatus före launch.

## Anteckningar

- Ingen voiceover och ingen CTA är **medvetna val** — det är själva swipen.
  Lägg inte till dem "för säkerhets skull".
- Rad 5 är shoten som bär hela videon (originalets Peppa Pig-ögonblick):
  sushistrumpan ska i första sekunden kunna misstas för riktig sushi.
- Inga priser i copyn: originalet har inga, och då slipper vi också
  prisverifieringen åldras i videon.
