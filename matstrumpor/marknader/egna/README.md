# `matstrumpor/marknader/egna/` — Matstrumpors egna videor på elva språk, med egen röst

Axels order 2026-09-28: **"alla videos som inte är Nathalie och Sofie"** görs med egen
ElevenLabs/HeyGen, **aldrig med HeyGens videoöversättning** (den är till för riktiga personer,
se `../heygen/`). Katarina lämnar aldrig Sverige.

## Vilka videor (`kallor.json`)

De svenska videor utöver Nathalie, Sofie och Katarina som har minst 300 kr och 3 köp (CLAUDE.md:
ingen dom under det). Alla fyra låg under break-even i Sverige, så utomlands är de test. De andra
77 videorna sålde för lite för att bedömas och väntar tills de visat något i Sverige.

| Video | Vad | Röst | Annons (nnn) |
|---|---|---|---|
| `012v2` | sju AI-bilder med orange textrutor (bluffpizza, fyra sorter) | ingen | `…_sushi_gift_anim_004_v1` |
| `haikuh3` | klipp + svensk AI-kvinnoröst: "efter jag gav dem till min mamma fattade jag tre grejer" | ElevenLabs | `…_sushi_gift_ugc_005_v1` |
| `haikuh2` | samma, omvänd psykologi: "Tre anledningar att inte köpa sushistrumpor" | ElevenLabs | `…_sushi_gift_ugc_006_v1` |
| `s001h1` | AI-personer + produktklipp, hon berättar varför hon startade företaget | ElevenLabs | `…_sushi_gift_ugc_007_v1` |

Alla tre röstvideorna har **samma svenska AI-kvinnoröst** (mediantonhöjd 198–200 Hz, mätt med
`pipeline/lyssna.py`). ElevenLabs dubbning klonar den, så rösten låter likadan på alla språk.

## Flödet

1. **Källorna:** `node matstrumpor/marknader/egna/hamta.mjs` → `kalla/<video>.mp4`. Videorna ägs av
   sidan i en annan Business Manager; annonsens förhandsvisning bär mp4:an (se filens huvud).
2. **Texterna:**
   - `<video>.manus.json` är det svenska talet mening för mening med tider (Whisper medium, rättat
     för hand). `"stryk": true` = butikens adress, som inte sägs.
   - `bildtexter.sv.json` innehåller inledningsrutan, rubrikerna ETT/TVÅ/TRE, knappen och etiketten.
   - `<KOD>/<video>.json` är den lokaliserade texten per marknad: ett segment per svensk mening,
     samma tider. Den skrivs av en sonnet-skribent mot `LOKALISERA.md`, döms av en skeptisk infödd
     granskare (högst tre rundor) och `node kolla-egna.mjs <KOD> <video>` (exit 0).
   - `<KOD>/012v2.json` innehåller de sju bildtexterna.
3. **012v2 (ingen röst):** `python3 matstrumpor/marknader/egna/rendera-012v2.py <KOD>` →
   `../annonser/klar/<KOD>_012v2.mp4`. Samma sju orange rutor ritas med ny text och täcker de svenska helt.
   Kontrollera sedan varje bildruta: `python3 matstrumpor/marknader/egna/kolla-012v2.py <KOD> …`
   (svensk text synlig eller två av våra rutor samtidigt ⇒ ❌, exit 1).
4. **Röstvideorna, textlagret:** `python3 matstrumpor/marknader/egna/textlager.py <KOD> <video>`
   → `ut/<KOD>_<video>.text.mp4`. Alla svenska texter byts, originalljudet ligger kvar. Tar ~2,5 min per video.
5. **Röstvideorna, rösten:** `node matstrumpor/marknader/egna/dubba.mjs <KOD> <video>` →
   `../annonser/klar/<KOD>_<video>.mp4`. Så fungerar det (vägen som bar 2026-09-29, se Läget):
   - ElevenLabs text-till-tal, ett anrop per segment med vår granskade text, med en klon av källans
     röst (`RÖST` i skriptet).
   - Klippet läggs där den svenska meningen började. Är det för långt görs det om snabbare
     (speed ≤ 1,2) och pressas sedan med atempo (≤ 1,15).
   - Bakgrunden är källans eget ljud utan röst (demucs `htdemucs`, `no_vocals`), och talet läggs på
     källans talnivå.
   - Ljudet läggs på textlagret och tonas ut de sista 0,28 s, som källorna.
   - Klippen cachas i `ut/tts/`, så en omkörning med samma text kostar inga tecken.
   - Kräver `ELEVENLABS_API_KEY`, `pip install demucs` (torch CPU) och ffmpeg.
   - ⚠️ `dubba.mjs` lägger filen i `klar/` innan QA körts. En video med ❌ ska tas bort därifrån.
   - Två spärrar:
     - Ändras texten efter dubbningen görs en ny dubbning (`text_sha`), och ett textlager
       byggt på en äldre text stoppar sammanfogningen.
     - Bara en text med `"granskad": true` blir annonsfil. Ett utkast stannar i `ut/`.
6. **QA före uppladdning:**
   - Kör `python3 pipeline/lyssna.py <klar.mp4> ut/<KOD>_<video>.srt kalla/<video>.mp4 <språkkod>`.
     Kraven: rätt språk, ordtäckning ≥ 0,6 och tonhöjd inom ~25 % av källan.
   - Kör `python3 pipeline/rostkoll.py --kalla kalla/<video>.mp4 --ny ut/<KOD>_<video>.mp4 --srt ut/<KOD>_<video>.srt`.
     ❌ betyder att videon inte laddas upp.
   - Titta på QA-bilderna. Inget svenskt ord får synas.
7. **Upp i kontot:** kör `python3 matstrumpor/marknader/egna/lagg-till.py <video> <nnn> <format> <KOD…>`.
   Den lägger annonsen i `../annonser/<KOD>.json` (WW bär de engelska filerna). Kör sedan
   `node matstrumpor/marknader/annonser/bygg.mjs --marknad <KOD> --skarpt`.
   ⛔ **PAUSED, aldrig `--aktivera`.** Axel granskar först.

## Språkkoder

NO nb (`no` hos ElevenLabs), DK da, FI fi, US en (även WW), DE de, FR fr, NL nl, ES es, IT it,
PL pl, PT pt (Portugal), och sedan 2026-09-30 JP ja och TW zh (mandarin, texten i traditionell skrift).

**Japanska och kinesiska (JP, TW):** manusen skrivs och granskas enligt `LOKALISERA.md` → "Japanska och
kinesiska" (kanji-siffror, aldrig talet fyra, "Sverige" en gång i Japan och aldrig スウェーデン製).
`kolla-egna.mjs` mäter talet i tecken per sekund (`TECKEN_PER_S`: JP 7,5 varning / 9 stopp, TW 5,5 / 6,5)
och bildtextens bredd med full bredd per tecken. `textlager.py`, `rendera-012v2.py` och `d3/rita.py`
ritar med Noto Sans CJK JP/TC Bold (`pipeline/cjk.py` hämtar typsnittet första gången), radbryter
tecken för tecken med kinsoku (ingen rad börjar med 、。！？ eller litet kana), och `dubba.mjs` läser
med `ja` resp. `zh`. Den japanska granskaren fällde 17 rader i röstvideorna första gången:
undertexten måste säga samma sak som rubriken som syns samtidigt (その一、… under rubriken その一：…),
och ett kort får aldrig börja med っ efter en delning vid ？.

**Rösten på japanska och mandarin — mätt replik för replik, inte på hela filen (2026-09-30).**
Röstkollen var grön och helfilslyssningen gav 0,80–0,83, men Whisper medium på varje replik för sig
(`seglyssna`: klippet ur videon, täckning i tecken-bigram) visade att produktordet inte gick fram:
- **Japanska:** 靴下 hördes som "ガックザ", 母 som 目 och 五足 som 無年. Felet var **kanji-läsningen,
  inte rösten**: fyra röster (klonen, Kyoko, Fumi, Rina) läste samma kanji fel, men med uttalet i
  hiragana hördes klonen 0,87 i snitt och 靴下 rätt. Varje japanskt segment bär därför fältet
  **`las`** (samma mening, de svåra orden i hiragana, skrivet av skribenten); `dubba.mjs` läser
  `las`, undertexten och textlagret visar `text`. Klonen behålls.
- **Mandarin:** klonen gjorde tonfel (襪子 wàzi hördes 蛙子, "groda"), 0,75. Den infödda rösten
  **Anna Su** (taiwanesisk mandarin, ElevenLabs röstbibliotek, `RÖSTER.TW`) med
  `eleven_turbo_v2_5` gav 0,92. eleven_v3 prövades och var sämre för båda språken (0,80–0,82 ja,
  0,81 zh) och bryr sig inte om farten.
- HeyGens japanska (Nathalie) låg på 0,91 replik för replik, med bara siffror och homofoner fel —
  facit för vad "bra" är med den här mätningen.
- **Efter omdubbningen (samma dag):** JP haikuh3 0,91, haikuh2 0,88, s001h1 0,83 (det lägsta är
  寿司ソックス skrivet med hiragana av Whisper, "すしそつくす"); TW 0,83 / 0,85 / 0,78 med 襪子 och
  uppmaningen rätt. Röstkollen ✅ på alla sex. Kvar som fel är homofoner (五足 → 誤則, ほこり → 誇り).
- Provlyssningens röster ligger kvar i ElevenLabs-kontot (Kyoko, Fumi och Rina på japanska, Chen på
  mandarin), oanvända. De tar 4 av kontots 160 röstplatser.

## Butikens logga i bild (mätt 2026-09-29)

Butikens namn och adress står aldrig i en annons (CLAUDE.md), inte heller i bild. Två av källorna
visar loggan "MATSTRUMPOR.SE" med sushifiguren:

- **012v2, sista scenen (12,0 s → slut).** Loggan sitter på väggen ovanför familjen, och scenen
  står still (medelskillnad ≤ 0,4 över scenen). `pipeline/logga.py` fyller loggans pixlar **lodrätt**
  mellan väggen ovanför och nedanför, så att fönsterkarmens lodräta kant står kvar. Fyllningen
  mjukas upp i sidled och får väggens brus. Resultatet läggs som en fast lapp över hela scenen
  (`rendera-012v2.py` → `bilder` i `textbyte.py`). `cv2.inpaint` lämnade en ljus skugga i loggans
  form och prövades bort. Färgen i lappen avviker 1,5 nivåer efter kodningen, vilket är vanligt
  kodbrus.
- **haikuh3 och haikuh2, slutkortet.** Klippet tonar ut till beige (klart i ruta 1504 resp. 1378).
  Loggan zoomar in från ruta 1505 resp. 1379, och knappen "BESTÄLL NU" kommer efter.
  `textlager.py` kopierar tom bakgrund ur samma ruta (y 300–524) över loggans yta (x 188–532,
  y 524–748) från första helt beige rutan. En fast RGB-färg gav en svag rektangel på den helt jämna
  ytan, men samma pixlar ur samma bild syns inte (`kopiera` i `textbyte.py`).
- s001h1 har ingen logga. Slutetiketten "Sushistrumpor" är produktens namn och byts som text.

## Lärdomar (mätta 2026-09-29)

- **Texten står i rutor, inte som vit text med kontur.** Därför finns `pipeline/textboxar.py`
  (vita, mörka och orange rutor) i stället för `textrutor.py` (UGC-stilen). Detektorn missar
  tre saker:
  - En **mörk halvgenomskinlig ruta över mörk bakgrund**. Därför täcker undertexten ett **fast
    fält** (`KONF[...]['under']['falt']`), och ingen storlek tas ur detektionen. Första försöket
    lät "Glöm … åkiga" sticka ut på sidorna.
  - **Staplade remsor** (inledningsrutorna). Rutan är uppmätt för hand i `KONF`.
  - **Orange laxbitar** tas för orange rutor. Orange används bara i knappbandet och i 012v2.
- **haikuh3 har ingen egen knapptext** i `bildtexter.sv.json`. Den tar samma marknads
  haikuh2-knapp ("BESTÄLL NU" → t.ex. "JETZT KAUFEN").
- **Avsnitten börjar på "Ett:", "Två:" och "Tre:" med kolon.** Utan kolonet tog haikuh2:s
  inledning "Tre anledningar att inte köpa …" första platsen, och varje rubrik hamnade ett avsnitt
  för sent. Den svenska "TRE: DU GÖR DEM GLADA" stod då kvar, mätt i NO 2026-09-29. En svensk
  rubrikruta som ingen ny rubrik täcker suddas nu alltid.
- **Undertextfältet suddas inte under meningar som står i övre rutan eller på etiketten**
  (s001h1: "Ser ut som sushi, är strumpor." och "Sushistrumpor."). Där fanns ingen svensk text i
  fältet, och suddningen blev en grå rektangel mitt i bilden.
- **Butikens adress efter sista meningen** ("Matstrumpor.se", struken) täcks av att sista
  undertexten står kvar tills slutkortet är helt beige. Suddad syntes den som en grå ruta.
- **Inledningen är fet och så stor som ryms** (Poppins Bold, 44 → 28 px, högst tre rader i
  rutan): originalets inledning är stor fet text och bär annonsens första sekund. Mätt: 30–36 px
  på alla elva språk.
- **"Matstrumpor.se" i slutet** av haiku-videorna sägs inte och suddas bort. Rutan ersätts inte.
- Poppins (OFL, `pipeline/fonts/`) täcker alla elva europeiska språkens tecken (kontrollerat med fontTools).
  Japanska och kinesiska ritas med Noto Sans CJK (se Språkkoder).

## Läget (2026-09-29): 33 av 33 uppladdade PAUSED som annons 005–007

**Vägen som bar: text-till-tal med klonad röst, inte dubbning.**

- `POST /v1/dubbing` med `mode=manual` kräver `dubbing_studio=true`. Det ger bara ett studio-projekt:
  - status `dubbed` och vår text i transkriptet,
  - men `GET /audio/<språk>` svarar 404 "There is no dubbing for language".
- Rendering via `/v1/dubbing/resource` svarar 403 "closed-beta" för kontot.
- Automatiskt läge översätter själv och får inte användas.
- Försöket (pilot DE haikuh3, id `ZVSEy74PxnJS7KzXnuax`) kostade ~2 590 tecken. Det finns kvar som
  studio-projekt i kontot.

**Rösten:** en ny instant-klon, **"Matstrumpor AI-kvinna (klon ur annonserna)"**
`lRBvixWrjVcBSKxchtgC`. Den är gjord ur demucs-isolerat tal från alla tre källorna.

- Modellen är `eleven_multilingual_v2` för tio språk.
- Norskan finns inte i v2 och tas av `eleven_turbo_v2_5` med `language_code: no`.
  - `eleven_v3` prövades först: Whisper hörde svenska (0,96), ordtäckningen var 0,43, och v3
    följer inte farten (11 av 18 meningar gick över fönstret).
- Kontots övriga röster (premade, bibliotek, egna kloner som "Gamla 70 årig sushi" och
  "Lisa UGC") används inte.

**Kostnad:** kontot är Creator, 100 017 tecken per månad. Förbrukat:

- före jobbet: 16 641
- efter: 56 757
- alltså ~40 100 tecken, varav:
  - ~2 590 till det misslyckade dubbningsförsöket,
  - ~1 400 till v3-provet för norskan,
  - resten till text-till-tal, i snitt ~1 100 per video. Norskan kostar hälften per tecken.

**Två rättningar efter första QA:** PL och PT s001h1 fick ❌ i rostkoll ("hinner inte tala klart").

- Sista meningen fick ta tiden till 0,15 s före slutet.
- `-shortest` kapade ljudets tysta svans vid bildens slut. Källorna tonar ut till −64/−89 dB.
- Rättat: sista meningen slutar senast 0,35 s före slutet, och ljudet tonas ut på bildens sista
  0,28 s. Därefter var alla gröna.

**Texterna ändrades efter bygget en gång:** NO haikuh2 och NO s001h1 ("norskan likriktad",
`8a6922d`). Båda byggdes om. Före uppladdning kontrollerades alla 33 mot `main`: textens sha =
`text_sha` i `ut/<KOD>_<video>.dub.json` och `"granskad": true`.

**QA per video** (Whisper small: hört språk + sannolikhet, ordtäckning, mediantonhöjd dub/källa i Hz,
rostkoll). Alla 33 är dessutom tittade på i bild: 8 rutor + slutkortet, inget svenskt ord, ingen
logga, knappen på marknadens språk.

| Marknad | Video | Språk | Ordtäckning | Tonhöjd | rostkoll |
|---|---|---|---|---|---|
| NO | haikuh3 | no 0.86 | 0.92 | 208 / 200 | ✅ |
| NO | haikuh2 | no 0.73 | 0.88 | 205 / 198 | ✅ |
| NO | s001h1 | no 0.83 | 0.9 | 219 / 200 | ✅ |
| DK | haikuh3 | da 0.91 | 0.94 | 213 / 200 | ✅ |
| DK | haikuh2 | da 0.97 | 0.92 | 219 / 198 | ✅ |
| DK | s001h1 | da 0.92 | 0.96 | 190 / 200 | ✅ |
| FI | haikuh3 | fi 0.99 | 0.94 | 211 / 200 | ✅ |
| FI | haikuh2 | fi 0.95 | 0.92 | 205 / 198 | ✅ |
| FI | s001h1 | fi 0.96 | 0.94 | 186 / 200 | ✅ |
| US | haikuh3 | en 0.99 | 1.0 | 203 / 200 | ✅ |
| US | haikuh2 | en 0.98 | 1.0 | 216 / 198 | ✅ |
| US | s001h1 | en 0.99 | 1.0 | 216 / 200 | ✅ |
| DE | haikuh3 | de 0.99 | 0.97 | 229 / 200 | ✅ |
| DE | haikuh2 | de 0.99 | 0.97 | 211 / 198 | ✅ |
| DE | s001h1 | de 1.0 | 1.0 | 216 / 200 | ✅ |
| FR | haikuh3 | fr 1.0 | 0.98 | 235 / 200 | ✅ |
| FR | haikuh2 | fr 1.0 | 0.97 | 239 / 198 | ✅ |
| FR | s001h1 | fr 1.0 | 0.97 | 216 / 200 | ✅ |
| NL | haikuh3 | nl 1.0 | 0.95 | 225 / 200 | ✅ |
| NL | haikuh2 | nl 0.99 | 0.97 | 213 / 198 | ✅ |
| NL | s001h1 | nl 0.99 | 0.97 | 216 / 200 | ✅ |
| ES | haikuh3 | es 1.0 | 1.0 | 222 / 200 | ✅ |
| ES | haikuh2 | es 0.99 | 1.0 | 225 / 198 | ✅ |
| ES | s001h1 | es 1.0 | 0.98 | 203 / 200 | ✅ |
| IT | haikuh3 | it 1.0 | 0.98 | 222 / 200 | ✅ |
| IT | haikuh2 | it 1.0 | 0.99 | 216 / 198 | ✅ |
| IT | s001h1 | it 1.0 | 0.99 | 208 / 200 | ✅ |
| PL | haikuh3 | pl 1.0 | 0.99 | 205 / 200 | ✅ |
| PL | haikuh2 | pl 0.99 | 0.98 | 203 / 198 | ✅ |
| PL | s001h1 | pl 1.0 | 1.0 | 216 / 200 | ✅ |
| PT | haikuh3 | pt 0.99 | 0.97 | 222 / 200 | ✅ |
| PT | haikuh2 | pt 0.97 | 0.94 | 219 / 198 | ✅ |
| PT | s001h1 | pt 0.99 | 0.97 | 219 / 200 | ✅ |

Whisper small stavar fel på produktord och hör ibland ett kort ord fel. DE haikuh3 "Kein Geschenk"
lästes som "Das ist ein Geschenk", men Whisper medium på klippet hörde rätt. Norskan hörs som `no`
med lägre säkerhet (0,73–0,86): klonen är svensk, och Whisper blandar ihop språken.

## Granskningen 2026-09-30: 004 och röstvideorna 005–007

**004 (012v2), alla tretton språk.** Granskningen (G-B04) såg två rutor samtidigt vid varje byte och
källans svenska ruta en bildruta vid 6,08 s. Två fel, båda rättade:

- `pipeline/textbyte.py` tände en ruta med `between(t,a,b)`, som gäller båda ändpunkterna. Bildrutan
  på gränsen visade då både den gamla och den nya rutan. Nu `gte(t,a)*lt(t,b)`: en ruta slutar precis
  när nästa börjar. Det gäller också undertexterna i röstvideorna (`textlager.py` ritar med `textbyte.py`).
- Gränsen mellan ruta 3 och 4 stod på 6,1 s i `012v2.boxar.json` (mätt med 10 bilder/s), men källan
  byter på bildruta 152 = 6,08 s. Gränsen är nu 6,06 s, mätt bildruta för bildruta med orange-andelen i
  källans rutor. De andra gränserna ligger exakt på källans byten (bildruta 50/100/200/250/300).
- `kolla-012v2.py` jämför varje bildruta med källan. Den fångade det gamla felet (bildruta 152 +
  nio dubbla) och godkände alla tretton nya filer (354 bildrutor var, 0 fel).
- Nio rutor fick ny text (sonnet, fynden G-C-DA-04, en-03, es-04, it-08, NL-08, PT-11, JA-07), t.ex.
  DK "Fakepizzaen / er sokker.", US "In the sock drawer. / Never mixed up.", JP
  「寿司、ピザ、バーガー、ドーナツ／ひとり一つ、好きなのを選ぼう。」 (en sort var, inte ett par var).

**005–007: repliker och rubriker.** 45 ändringar i 22 filer (sonnet, `rost.ut.json` i sessionens
scratchpad; varje ändring bär sitt fynd). Exempel: DE "Du wirst zur Person …", NO "Det er gaven som
får deg til å se smart ut.", PL "Po pierwsze/Po drugie/Po trzecie" i tal och rubrik, TW 「第二：超值到誇張」.

**En replik om, inte hela videon:** `tagning: 2` på ett segment ger det segmentet ett nytt frö
(`froFor`, 1029 i stället för 29); resten av videon behåller sina klipp. `--om` byter fortfarande alla.
ES haikuh3 segment 19 ("Pincha ya…") fick tagning 2, eftersom rösten sa "allá".

⚠️ **De europeiska röstvideorna fanns inte i den här containern.** De byggdes i ElevenLabs-sessionen
(PR #266) och varken klippen i `ut/tts/` eller filerna i `annonser/klar/` följde med. En ändrad text
bygger därför om hela videon (samma frö 29 ger nästan samma tagning som förut) och kostar ~1 000 tecken.

**Rösterna efter granskningen (2026-09-30 kväll), mätt med Whisper på provklipp med samma inställningar
som `dubba.mjs` (frö 29):**

- **Danska → den infödda rösten Freja** (`RÖSTER.DK`, ElevenLabs röstbibliotek, eleven_multilingual_v2).
  Granskningen (G-B02) hörde "sokker" som "sukker" sex av sex i 007; dess andra prövning strök fyndet,
  eftersom Whisper medium hör "sukker" även i referenserna. Det stämmer: medium hörde "sukker" från
  klonen OCH från fyra infödda röster. Bytet gjordes ändå, på large-v3-mätningen: Whisper large-v3 hörde klonen säga
  det svenska "socker", Freja "sokker" i fyra av fem repliker (i "…det er sokker" hör large-v3 "sukker"
  från alla röster — språkmodellen gissar på den vanliga frasen). `seglyssna.py --modell large-v3` för danska.
  Stavningsknep hjälpte inte: "såkker" gav "sukker", "sakker" gav "Saga".
- **Norska behåller klonen** (eleven_turbo_v2_5), prövat 2026-10-01 morgon. I den byggda 007 hörde large-v3
  avslöjandet "så skjønner man det er sokker" som "sukker". På lösa klipp (frö 29, med och utan "sushi" före
  i Whisper) hördes den infödda Celine "sokker" sex av sex, klonen fem av sex, Mia och Emma fyra av sex. Men
  i de MIXADE videorna var Celine inte bättre: 007 hördes "sukker" med båda rösterna, och 006 hördes
  "satt i to" med Celine men "sokker" med klonen. Celine kommer ut ~21 dB tystare än klonen och hamnar för
  nära musiken (förstärkningen stannar på taket); med förstärkning 8 hördes 006 rätt men 007 fortfarande
  "sukker", och begränsaren slog i 0 dB. Klonens 006 och 007 byggdes om ur cachen (0 tecken, samma filer som
  kvällen innan). Lärdom: lyssna på den mixade videon, aldrig bara på klippet.
- **Japanska 007 (s001h1) → den infödda rösten Kyoko** (`RÖSTER['JP/s001h1']`, per video). Granskningen
  (G-B01) hörde 靴下 som "kusushita" tre gånger (sänkt till 🔵 vid dess andra prövning: en av två repliker
  utan ledtråd). Katakana クツシタ i `las` hjälpte inte (fortfarande
  くすした), och デス/バメン gjorde det sämre ("ディエス"). Kyoko läser kanji fel (靴下 → がっか) men
  hiragana rätt i 3 av 4 produktrepliker, klonen i 1 av 3. Poängraden säger nu ソックス, som båda
  rösterna uttalar rätt varje gång. haikuh3 och haikuh2 behåller klonen (0,89 replik för replik).
- **USA/UK 007:** "I started this brand out of pure frustration." är borta (granskningen G-C-en-01:
  en AI-person påstår att hon grundat varumärket, FTC 16 CFR 465 / CPRs; andra prövningen gjorde det
  till en fråga till Axel, eftersom samma rad går i Sverige — sessionen valde den försiktiga vägen i
  USA/UK, där regeln är uttrycklig, och annonsen är PAUSED). Ny replik av sonnet: "I keep
  giving everyone the same candle." Övriga språk bär grundarraden som den svenska originalet.

**Ombyggda 2026-09-30 kväll, lyssnade replik för replik** (`seglyssna.py`, Whisper medium; danska och
norska med large-v3, i den mixade videon). "Snitt" är täckningen av manusets ord i det Whisper hör. Ett lågt tal är oftast siffror
(`Tre:` → "3.") eller sammansättningar (`Sushisokker` → "Sushi-sokker"); raderna nedan är de som betydde något.

| Video | Röst | Snitt | Det som hördes, och vad som gjordes |
|---|---|---|---|
| DE 005/006/007 | klonen | 0,98 / 0,97 / 0,97 | inget fel |
| DK 005/006/007 | Freja | 0,96 / 0,96 / 0,92 | large-v3 hör "sokker" i varje replik, också avslöjandet i 005, 006 och 007 ("Så opdager man, at det er sokker") |
| NO 006/007 | klonen | 0,92 / 0,85 | large-v3: 006 "Og så, vent, det er jo sokker" rätt; 007 slutpoängen rätt ("Ser ut som sushi, men er sokker. Sushi-sokker."), men avslöjandet "så skjønner man det er sokker" hörs "sukker" med båda rösterna (se ovan). En norsk lyssnare bör höra 007 innan Norge slås på |
| ES 005/006/007 | klonen | 0,96 / 0,96 / 1,00 | 006 replik 2 går 0,10 s in i nästa (slutet på "únicos"), lämnad |
| US 006/007 | klonen | 0,97 / 1,00 | **006 replik 6 "wait, it's socks" hördes "it sucks"** av medium och large-v3 i två tagningar (frö 29 och 1029) ⇒ syskonvideons godkända "they're socks", hörs rätt av båda |
| IT 006/007 | klonen | 0,98 / 0,99 | inget fel |
| PL 005/006 | klonen | 0,98 / 0,98 | inget fel |
| JP 005/006 | klonen | 0,89 / 0,89 | homofoner (ほこり → 誇り, 五足 → 誤則); 履いて hörs 生えて en gång i 005 |
| JP 007 | Kyoko | 0,86 | ソックス rätt i alla produktrepliker; replik 13 utan kommatecken i `las` (gick 0,38 s över fönstret) |
| TW 005/006/007 | Anna Su | 0,83 / 0,85 / 0,80 | Taiwan har ingen annonsgrupp än. large-v3 hör samma tonfel som medium (壽司 → 受死 "ta emot döden", 襪 → 挖, 獨一無二 → 豆乙无二): en infödd lyssnare eller en annan röst innan TW-kampanjen byggs |

WW bär USA:s filer. Alla filer bytta i de pausade annonserna med `bygg.mjs --byt-video` per marknad
(NOB får NO:s nya media med `--byt-text`, som jämför lånad media).
