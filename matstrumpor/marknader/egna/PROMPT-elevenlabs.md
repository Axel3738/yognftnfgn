# Uppdrag: Matstrumpors tre röstvideor på elva språk med ElevenLabs — upp i Meta PAUSED

Skrivet 2026-09-29 av sessionen som byggde verktygen. Den sessionen såg aldrig nyckeln
`ELEVENLABS_API_KEY` (den las in i miljön efter att containern startat). Därför görs rösten här.
Läs `matstrumpor/marknader/egna/README.md` först. Där står hela flödet, och den här filen
bygger på den.

**Axels order (2026-09-28):** "alla videos som inte är Nathalie och Sofie" görs med egen röst
(ElevenLabs), aldrig med HeyGens videoöversättning. De tre videorna är `haikuh3`, `haikuh2` och
`s001h1`: svensk AI-kvinnoröst plus klipp. De ska ut till elva marknader: NO DK FI US DE FR NL ES
IT PL PT. WW bär de engelska filerna. Texterna skrivs av en sonnet-skribent och döms av en skeptisk
infödd granskare i den andra sessionen. De hamnar i `egna/<KOD>/<video>.json` på `main` allteftersom
de blir godkända. **Bara filer med `"granskad": true` är färdiga.** Övriga är utkast (DE haikuh3
ligger som utkast för piloten). **Skriv inte om texterna.** Är en text fel, skriv det i rapporten.
Hämta nya texter med `git pull --rebase origin main`. Är inte alla 33 granskade när du kommit till
steg 4: gör de som finns, vänta sedan med Monitor och en until-loop (`git fetch origin main` var
tionde minut, aldrig en sömnkedja) tills alla 33 är granskade, i högst tre timmar. Rapportera
sedan de som saknas.

## Järnregler

- ⛔ **Aldrig `--aktivera`.** Allt laddas upp PAUSED. Axel granskar annonserna först ("jag vill
  inte att du aktiverar kampanjerna i meta för ens jag har granskat alla").
- Katarinas UGC lämnar aldrig Sverige. Nathalies och Sofies videor rörs inte (de är klara, HeyGen
  precision).
- Butikens namn och adress (Matstrumpor, matstrumpor.se) står aldrig i en annons, varken i bild,
  text eller tal. Textlagret täcker slutkortets logga och suddar "Matstrumpor.se"-raden.
  Kontrollera det i QA-bilderna.
- Ingen video laddas upp med ❌ i QA.
- Commits på svenska, med attributionsraderna ur systemprompten. Aldrig ett modell-id i repot.

## Steg

0. **Nyckeln.** `env | grep -c ELEVENLABS_API_KEY` ska ge 1. Ger den 0: läs
   `read_documentation` med topic `environment.secrets`, stoppa och rapportera. Gissa aldrig.
1. **Kontot.** Läs `GET https://api.elevenlabs.io/v1/user/subscription` (plan, tecken/krediter
   kvar) och `GET /v1/voices` (namnen på alla röster i kontot). Axel frågade "vilka röster
   använder du?". Rösten i dubbningen klonas ur källans svenska AI-röst, och rapporten ska säga det
   och lista kontots röster. Kostar hela jobbet mer än kontot har (≈ 33 videor, ≈ 26 minuter tal):
   gör piloten i steg 3, räkna kostnaden per minut ur skillnaden före/efter, och stoppa före
   resten. Ett köp är Axels beslut.
2. **Källorna.** Installera det som saknas: `pip install faster-whisper opencv-python-headless`
   (Pillow, numpy och ffmpeg brukar finnas). Kör sedan `node matstrumpor/marknader/egna/hamta.mjs`.
   Den skriver `kalla/*.mp4` med `META_ACCESS_TOKEN`.
3. **Pilot DE haikuh3, en video hela vägen** (med utkastet om det ännu inte är granskat. Piloten
   prövar verktygen och laddas aldrig upp. När texten blir granskad gör `dubba.mjs` en ny
   dubbning av sig själv, eftersom `text_sha` ändras, och `textlager.py` måste köras om. Skriptet
   stoppar annars.):
   - `python3 matstrumpor/marknader/egna/textlager.py DE haikuh3` (≈ 2,5 min). Titta på
     `egna/ut/DE_haikuh3.text.mp4.qa-*.png` och en ruta ur slutkortet (sista sekunden). Kraven:
     inget svenskt ord, ingen logga, knappen på tyska.
   - `node matstrumpor/marknader/egna/dubba.mjs DE haikuh3`. Manuellt läge är "experimental" hos
     ElevenLabs, och skriptet är skrivet mot dokumentationen utan nyckel. Läs felet om det
     fallerar, läs dokumentationen (`https://elevenlabs.io/docs/api-reference/dubbing/create`) och
     rätta skriptet. Det som talas MÅSTE vara vår granskade text i samma tidsfönster, aldrig
     ElevenLabs egen översättning. Fungerar inte manuellt läge finns två vägar:
     - Dubbing Studio: skapa dubbningen, byt segmentens text och dubba och rendera om.
     - Text till tal per segment med en klon av källrösten, anpassad till fönstret, ovanpå
       källans bakgrundsljud.

     Skriv i README vilken väg som bar.
   - QA (från repots rot, `E=matstrumpor/marknader/egna`):
     - Kör `python3 pipeline/lyssna.py $E/ut/DE_haikuh3.mp4 $E/ut/DE_haikuh3.srt $E/kalla/haikuh3.mp4 de`.
       Kraven: språket de, ordtäckning ≥ 0,6 och tonhöjd inom ~25 % av källan.
     - Kör `python3 pipeline/rostkoll.py --kalla $E/kalla/haikuh3.mp4 --ny $E/ut/DE_haikuh3.mp4 --srt $E/ut/DE_haikuh3.srt`.
       Den ska ge inget ❌.
     - Lyssna på slutet i transkriptionen, så att inget sista ord är avhugget.
4. **Alla 33** (`haikuh3`, `haikuh2`, `s001h1` × NO DK FI US DE FR NL ES IT PL PT), bara
   granskade texter. `dubba.mjs` skriver `annonser/klar/` enbart för `"granskad": true`:
   - textlager.py, högst tre åt gången. haikuh3 lånar knapptexten ur samma marknads
     `haikuh2.json`, så bygg haikuh3 efter att haikuh2-texten är granskad.
   - dubba.mjs, en eller två åt gången.
   - Samma QA på varje video. Språkkoden till lyssna.py står i `dubba.mjs` `SPRAKKOD`, där
     Whisper hör norska som `no` eller `nn`.
   - En video med ❌ dubbas om (`--om`) en gång. Är den fortfarande ❌ laddas den inte upp, och
     rapporten säger varför.
5. **Annonserna** (klar-filerna ligger i `annonser/klar/<KOD>_<video>.mp4`):
   ```
   python3 matstrumpor/marknader/egna/lagg-till.py haikuh3 005 ugc NO DK FI US DE FR NL ES IT PL PT WW
   python3 matstrumpor/marknader/egna/lagg-till.py haikuh2 006 ugc NO DK FI US DE FR NL ES IT PL PT WW
   python3 matstrumpor/marknader/egna/lagg-till.py s001h1 007 ugc NO DK FI US DE FR NL ES IT PL PT WW
   ```
   Kör sedan, EN marknad i taget (Meta stryper, kod 17):
   `node matstrumpor/marknader/annonser/bygg.mjs --marknad <KOD> --skarpt`.
   Läs raden `tillbakaläst:`. Kampanj, adset och alla annonser ska stå PAUSED.
6. **Spara:**
   - Committa `annonser/*.json`, `annonser/lage.json`, `annonser/videor.json`, eventuella
     rättningar i skripten och ett avsnitt "Läget" i `egna/README.md`: vad som laddades upp,
     QA-talen per video, rösten, kostnaden och vilken väg dubbningen tog.
   - Skriv en rad i `products/matstrumpor/batch-log.md`.
   - Pusha, öppna en PR mot `main` och merga den när `npm test` är grön. Ett undantag: testet
     "nödbromsen: SPARNING_INGEN_PUBLICERING=1" är rött i containrar utan Bäverbutikens
     spårningsnyckel (`SHOPIFY_CLIENT_SECRET_SE_BAVER_SE`). Det var rött före det här jobbet
     (mätt 2026-09-29: 2480 av 2481) och är inte ditt.

## Rapporten (svenska, kort, Axel har dyslexi)

- Hur många av 33 som gick upp PAUSED, per video och marknad.
- Rösterna i kontot och vilken röst som används.
- Vad det kostade.
- Allt som stoppade.

Axels egna uppgifter står sist, numrerade, en mening per rad. Den enda som finns är att granska
och aktivera i Ads Manager när han vill.
