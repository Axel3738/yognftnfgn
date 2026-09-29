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
4. **Röstvideorna, textlagret:** `python3 matstrumpor/marknader/egna/textlager.py <KOD> <video>`
   → `ut/<KOD>_<video>.text.mp4`. Alla svenska texter byts, originalljudet ligger kvar. Tar ~2,5 min per video.
5. **Röstvideorna, rösten:** `node matstrumpor/marknader/egna/dubba.mjs <KOD> <video>` →
   `../annonser/klar/<KOD>_<video>.mp4`. Så fungerar det:
   - ElevenLabs dubbning i manuellt läge får vår granskade text per segment, i samma tidsfönster.
   - Rösten klonas ur källan och musiken behålls.
   - Dubbens ljud läggs på textlagret.
   - Kräver `ELEVENLABS_API_KEY`. Den syns bara i en session som startats efter att nyckeln lades in.
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
PL pl, PT pt (Portugal).

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
- **"Matstrumpor.se" i slutet** av haiku-videorna sägs inte och suddas bort. Rutan ersätts inte.
- Poppins (OFL, `pipeline/fonts/`) täcker alla elva språkens tecken (kontrollerat med fontTools).
