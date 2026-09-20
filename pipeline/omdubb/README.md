# Omdubb i batch — hjälpskripten från `/ny-annonser termoskyddet` (2026-09-16)

## Inbränd text: `inbrand.mjs` (2026-09-20)

Omdubbningen byter RÖST och slutkort. Den rör inte en enda pixel i bilden — och
mätt med OCR på den färdiga `CaraShellRoof_DK_CO_101_H1` stod källans svenska
kvar i BILDEN: ordcaptions i pillret nederst hela filmen, `1129 KR` + `1 469 KR`
vid 17–19 s och `FRI FRAKT` + `30 DAGARS ÖPPET KÖP` vid 19–22 s. Tre fel
samtidigt: fel **språk**, fel **pris** (1 129 kr är svenskt; danskt är 819 kr.)
och fel **villkor** — "30 dagars öppet köp" är KÄLLBUTIKENS löfte, och butiken
annonsen går till har 14 dages fortrydelsesret.

```
node pipeline/omdubb/inbrand.mjs --kalla=<mp4> --ut=<mp4> --marknad=DK \
     --produkt=factory/produkter/takskyddet.yaml \
     --butik=factory/butiker/carashell.yaml [--till=22.91] [--torr]
```

I kedjan: `marknadsvideo.mjs --inbrand` kör det som **steg 0, före klippningen**.

⚠️ **Ordningen är inte valfri.** `elevenlabs-omdubb.mjs` tempo-anpassar varje
videosegment (70–135 %), så en tid mätt i källan stämmer inte i den dubbade
filen. Fixas pixlarna först rider de med genom omtajmningen.

**Tre program, tre jobb** — mätning, dom och pixlar är medvetet åtskilda:

| Fil | Gör |
|---|---|
| `inbrand-mat.py` | MÄTER. OCR per bildruta (rapidocr) + röda pixlar (porterad `rodtext.py`) + pillerpixlar (porterad `piller.py`). Dömer ingenting. |
| `inbrand.mjs` | DÖMER. Klass, överlägg-eller-filmad, roll, marknadens text, brandspärr, efterkontroll. Rena funktioner, testade. |
| `inbrand-rita.py` | RITAR. Suddar pillerbandet, lägger platta + text i pop-blocken, muxar om videon. |

**Varför tre mätningar och inte bara OCR:**
- OCR säger VAD det står, men läste den överstrukna jämförprisraden som
  `149`, `14C9 KR`, `Teer` och `TUUT` i fyra bildrutor i rad. En platta som
  bara täckt det OCR läste säkert hade lämnat `1 469 KR` kvar i bild.
- Röda pixlar säger VAR pop-texten sitter och hur länge — oberoende av språk
  och av OCR. Den fångar dessutom att texten **skalas in**: blocket börjar på
  y 236 medan OCR:ens ruta börjar på y 328.
- Pillerpixlar hittar ordcaptionens vita platta oavsett vad som står i den.
  ⚠️ Pillrets **x** går inte att mäta i pixlar i den här källan — den nedre
  panelen är en drönarbild med vit husvagn och mörk mark, så både "vita
  kolumner" och "mörka kolumner" spänner hela bildbredden. x kommer därför ur
  OCR-raderna i bandet, y ur pixlarna.

**Tre gränser, alla mätta 2026-09-20 på CaraShellRoof_CO_101_H1 (720×1280):**
ordcaption h 0,030–0,041 av bildhöjden, pop-text h 0,061–0,155 ⇒ gränsen 0,055.
Ett överlägg står still (drift 1–5 px) medan FILMAD text följer kameran
("Jayco" på husvagnen 9 px, "PRO-TEC" på väggen 13 px) ⇒ gränsen 8 px.

**Texten som läggs tillbaka är marknadens sanning, inte en översättning.**
Priset matchas på SIFFRORNA mot produktfilens basvalutapris och ersätts med
`ekonomi.marknadspriser`; villkorsraden blir butikens egna villkor ur
butiksfilen. `30 DAGARS ÖPPET KÖP` blir alltså `14 DAGES FORTRYDELSESRET` —
aldrig "30 dages returret". Texterna hämtas ur `factory/slutkort.py --json-text`,
så slutkortet och den inbrända texten kan inte säga olika saker.

**Suddningen — tre försök, två förkastade efter att bildrutorna tittats på:**
1. blurra pillret på plats → pillret ÄR en ljus platta, en oskarp ljus platta
   är fortfarande en ljus platta (`no-captions.py`s huvud har facit);
2. klistra in en blurrad remsa underifrån → bandet låg över husvagnens vita tak
   medan remsan var gräs; lappen syntes mer än texten den dolde;
3. **grannarna över och under speglas in, tonas i varandra och smetas LODRÄTT**
   (nedskalning i höjdled). Lodrätt, för att en vanlig gaussisk blur drog in
   bilden i de svarta letterbox-stolparna så de blev olivgrå. Bandet går över
   hela bredden — Axels facit (`Beltesliper_NO_PD_3`): en suddad ruta som svävar
   läses som ett fel, ett band kant i kant som en designad remsa.

**Efterkontrollen mäter, den tror inte.** Resultatet OCR:as igen och varje rad
med en svensk markör som vi inte själva skrivit rapporteras med tid och ruta.
Markörlistan innehåller bara ord som danskan/norskan INTE har (`och`/`og`,
`kronor`/`kroner`, `dagars`/`dages`, `öppet köp`/`åbent køb`) plus butikens
`markorer_sv` — annars hade marknadens egen text larmat. Exit 4 = svensk text
kvar eller rad utan ersättning; en sådan video rapporteras aldrig som klar.

**`--cue` lägger marknadens ordcaption i pillrets ruta** (vit platta, svart fet
text — Beltesliper-facit) och är bara giltig för videor som INTE dubbas om.
⚠️ Bandet suddas ändå över HELA spannet: läggs bara cue-rutorna ut glimtar
källans svenska fram i luckorna mellan två SRT-cues (0,24 s räckte för fyra
bildrutor svensk text — efterkontrollen hittade dem).

**Sidofynd, rättat samma dag:** `slutkortskoll.py` säger när kortet STÅR STILL,
och kortet skalas in några bildrutor innan dess (22,91 s enligt detektorn,
läsbart redan 22,67 s). Den färdiga danska videon blinkade därför förbi HELA
Bäverbutikens slutkort — logga, svensk flagga, 1 129 kr — i 0,34 s vid 18,3 s.
`marknadsvideo.mjs` klipper sedan dess `SLUTKORTSMARGINAL` (0,4 s) tidigare,
men aldrig in i talet.

Tester: `pipeline/test/inbrand.test.mjs` (17 rena + 2 end-to-end mot riktig
ffmpeg/OCR, inklusive en mutation där suddrutan flyttas bort från pillret och
efterkontrollen SKA larma).


## ElevenLabs-vägen (den som gäller sedan 2026-09-16 kväll)

Axel dömde ut HeyGens klonröst och valde ElevenLabs. `elevenlabs-omdubb.mjs` gör hela
jobbet per video, utan HeyGen och utan krediter:

```
node pipeline/omdubb/elevenlabs-omdubb.mjs --kalla=<källa.mp4> --srt=<manus.srt> \
     --ut=<ut.mp4> --rost="Martin - Warm, Confident and Relatable" [--modell=eleven_v3] [--torr]
```

- Manuset är en SRT med källans cue-tider (HeyGens `-ny.srt` duger — bara texten och
  starttiderna används). Siffror skrivs med bokstäver; **norska tal med mellanrum och
  bindestreck** (`hundre og sytti-en`, `to hundre og elleve`) — sammanskrivet lästes fel.
- En mp3 per cue via `voiceover/elevenlabs.mjs`, cache i `<utmapp>/vo/<namn>/<i>.mp3`.
  Radera en cue-fil för att generera om bara den. Tystnad i början/slutet klipps,
  luckor ≥ 0,3 s inne i repliken kläms till ≈ 0,35 s.
- **Repliken styr klipplängden:** varje segment blir replik + 0,25 s (0,6 s sist),
  och källfilmen fördelas om mellan segmenten inom 70–135 % — ett för kort klipp lånar
  bildrutor av grannen. Rösten snabbas max 12 %. Källans ljud kastas (ingen musik).
- Skriver `<ut>.srt` (nya tider, till `no-captions.py`) och `<ut>.tidslinje.json`.
  Kör `--torr` först och läs tabellen: en ⚠️-rad betyder att manuset är för långt
  för filmen.
- Röster: SE `Martin - Warm, Confident and Relatable`, NO `Martin - Clear and
  Comforting` (norsk, finns på kontot; `cd voiceover && npm run voices` listar),
  **DK `Søren - Clear, Confident and Versatile`** (`xj6X4BCUsv9oxohm1E8o`).
  Dubba aldrig ett språk med ett annat språks röst.

  **Så valdes danskan (2026-09-20).** Axels besked: *"B, men jag kan inte danska
  så du får lösa allt. Men tänk på att generera med v3 modellen."* Ingen kan
  höra åt honom, så valet gjordes på det som går att MÄTA. Fem infödda danska
  röster ur ElevenLabs bibliotek — man, medelålders/ung, neutral dialekt (samma
  profil som svenskan och norskan) — lades till på kontot, fick läsa tre riktiga
  annonsrepliker (problem, lösning, pris) med `eleven_v3`, och ljudet
  transkriberades tillbaka med Scribe (`scribe_v1`, `language_code=da`).
  Avvikelsen mellan manus och transkript är felläsningen.

  | Röst | Ordfel | Tempo, tre repliker |
  |---|---|---|
  | **Søren** | **0 / 45** | 4,91 · 5,25 · 5,15 s |
  | Frederik - Confident, Warm, Crisp, Calm | 0 / 45 | 4,60 · **7,16** · 4,52 s |
  | Mads - Clear, Direct and Natural | 1 / 45 | — |
  | Noam - Enganging and Clear | 1 / 45 | — |
  | Mikael Lund - Explanatory & Informative | 1 / 45 | — |

  Mads och Noam tappade "og" i "otte hundrede **og** nitten kroner" — priset
  blir fel uppläst. Mikael Lund läste **"taglugen" som "tavlen"**, alltså
  produktens kärnord; diskad direkt.

  Tempot fällde avgörandet mellan de två felfria: omdubben klipper in repliken i
  filmens segment och får snabba upp max 12 %. Frederik tog 7,16 s på den mening
  Søren klarade på 5,25 — den skillnaden knuffar ut rader ur filmen. Søren är
  dessutom jämn över tre olika långa repliker.

  ⚠️ **Vad provet INTE säger:** om rösten låter säljande. Scribe mäter att
  rätt ord kommer ut, inte att de låter bra. Proven ligger kvar som mp3 om
  någon dansktalande ska döma; Frederik är den dokumenterade tvåan.
- Efteråt: `python3 pipeline/rostkoll.py --kalla <källa> --ny <ut> --srt <ut>.srt
  --kallsrt <manus.srt> --omtajmad` (längddriften är förväntad), Scribe-koll av
  uttalet (`POST /v1/speech-to-text`, `scribe_v1`, per cue-mp3 — se FAS2 2026-09-16
  kväll), sedan `no-captions.py <ut> <ut>.srt <ut.cap.mp4> --band=975:1065
  --font-px=31 --max-chars=30 </dev/null`.

Körd 2026-09-16 på termoskyddets 18 CS/G/SP-videor: `products/carashell/termoskyddet/
batch-log.md` omgång 3, lärdomarna i `factory/FAS2.md`.

## HeyGen-vägen (historik)

Skripten som körde 9 + 9 HeyGen-omdubbar (SE + NO) på en kväll. De är skrivna för
termoskyddet (prefixen `Termoskydd_` / `Frontrutetrekk_NO_` står hårdkodade) och
sparas här för att logiken inte ska dö med containern — nästa körning generaliserar
dem eller flyttar in stegen i `pipeline/localize.mjs`. Lärdomarna står i
`factory/FAS2.md` → "Samma dag, `/ny-annonser termoskyddet`".

Ordningen, per marknad:

1. **Proofread** (0 krediter, 5–6 min/video, kör SE och NO parallellt):
   `node localize.mjs proofread --file=<källa.mp4> --lang="Swedish (Sweden)" --title=<namn> --out=<mapp>`
   i en loop som skriver `=== <namn>` före varje video i en logg.
2. **`heygen-apply-render.mjs <SE|NO> <logg> <srt-mapp> <state.json>`** — läser loggen,
   tar det nya manuset (`<srt-mapp>/termoskydd_<vinkel>.srt`), fördelar meningarna på
   exakt HeyGens antal cues (apply-srt kräver samma antal), laddar upp och beställer
   rendering. Idempotent: hoppar det som redan har `vid` i state.
3. **`heygen-hamta.mjs <state.json> <utmapp>`** — pollar status i upp till 90 min
   (`failed` + "pending moderation" är en väntan) och laddar ner. Kör i bakgrunden.
4. **`heygen-efter.sh <state.json> <källmapp>`** — `rostkoll.py` + `no-captions.py`
   per hämtad fil, in i `factory/output/<produkt>/bildfix/`. Hoppar redan captionade.
   ⚠️ `</dev/null` på anropen i loopen är inte valfritt — utan det äter Python stdin
   och nästa namn tappar första tecknet.
5. **Villkorsgrep på `-ny.srt` FÖRE steg 2** — brand-detektorn skannar källan, inte
   det nya manuset: `grep -iE "retur|30 dag|öppet köp|tusen|idag|lager|garanti|Bäver"`.

`ffprobe-shim.py`: containern saknar `ffprobe`; `rostkoll.py` behöver bara längd och
"finns ljudspår". Lägg shimmen som `/usr/local/bin/ffprobe` (chmod +x) och länka
imageio-ffmpegs binär som `/usr/local/bin/ffmpeg`.
