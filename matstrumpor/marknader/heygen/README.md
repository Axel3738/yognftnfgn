# HeyGen-batcherna — Matstrumpors UGC till tretton språk

Axels regler 2026-09-27: **UGC-videor (riktiga människor) översätts med HeyGens dyraste
version** (full videoöversättning, röstklon + lip-sync i läget `precision` — aldrig audio only,
aldrig `speed`); **egna HeyGen-avatarvideor översätts inte utan görs om direkt på målspråket i
HeyGen**; ⛔ **Katarinas UGC får inte köras i andra marknader — översätts aldrig.** Källorna här
är därför Nathalie (vinnaren: 29 av 44 köp 17–26/9), Sofie H1 och Sofie H2 (jul) — alla Axels
egna UGC. Tretton språk: NO, DK, FI, US (engelska, även WW), DE, FR, NL, ES, IT, PL, PT och sedan
2026-09-30 JP (japanska, HeyGens `Japanese (Japan)`) och TW (taiwanesisk mandarin med traditionell
skrift, `Chinese (Taiwanese Mandarin, Traditional)`). Japan och Taiwan: se "Japanska och kinesiska"
nedan och `LOKALISERA.md`.

| Fil | Vad |
|---|---|
| `kallor.json` | Video-id i kontot för varje källa, varför, och Katarina-spärren |
| `<KOD>.json` | Manifest per marknad för `pipeline/translate-batch.mjs` (samma tre videor, olika språk). WW använder US-videorna |
| `LOKALISERA.md` | Instruktionen till skribenten och granskaren: manuset, reglerna, ordlistan per språk |
| `kolla-srt.mjs` | Maskinkontrollen av en lokaliserad SRT (block, tidskoder, butiksnamn, domän, valuta, siffror, tankstreck, Sverige, svenska ord, språket, längd per block) |
| `srt/<KOD>/` | De SRT:er som faktiskt renderades — facit för vad varje video säger |
| `../annonser/<KOD>.json` | Copy per marknad + vilken fil varje annons ska bära (`klar/<KOD>_<namn>.mp4`) |

## ⛔ Läget `speed` gick först (2026-09-28) — rättat

`pipeline/heygen.mjs` skickade fram till 2026-09-28 inget läge till HeyGen, och då blev det
HeyGens standard `speed`. 24 av Matstrumpors videor (åtta marknader) hann renderas så innan det
upptäcktes. Alla 33 gjordes om i `precision`; `precision` är sedan dess standard i repot
(`--mode=speed` måste skrivas ut). Speed-renderingarna används inte.

## Körordningen per marknad

Miljö: `NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt` på alla node-steg
(`translate-batch.mjs` gör det själv). ffmpeg/ffprobe saknas i containern:
`pip install imageio-ffmpeg numpy pillow` + symlänk `imageio_ffmpeg.get_ffmpeg_exe()` →
`/usr/local/bin/ffmpeg`; ffprobe ur johnvansickle.com:s statiska tarball. apt fungerar inte här.
`pipeline/lyssna.py` kräver `pip install faster-whisper`.

1. **Källorna** ur kontot (ligger inte i repot):
   `GET https://graph.facebook.com/v21.0/<video_id>?fields=source` per rad i `kallor.json` →
   `<batch>/matstrumpor/up/<namn>.mp4`. Kopiera `<KOD>.json` till `<batch>/<KOD>/<KOD>.json`.
2. **Proofread (precision):** `node pipeline/translate-batch.mjs proofread --manifest=<batch>/<KOD>/<KOD>.json --marknad=<KOD>`
   → `srt-orig/matstrumpor_<namn>.srt` + `.orig.srt` (HeyGens svenska transkript av samma block).
   Precision drar krediter redan här. En session kan fastna i `processing` — de flesta blir
   klara på några minuter.
3. **Lokalisera:** en skribent (sonnet) per video skriver `srt-fixed/` mot `LOKALISERA.md`,
   en skeptisk infödd granskare dömer, skribenten rättar — högst tre rundor, sedan dömer en
   människa eller en ny granskare. Maskinkontrollen (`kolla-srt.mjs <KOD> <namn>`) ska ge exit 0.
4. **Nya block?** En text som godkänts mot en annan session hamnar i fel tidsfönster om den
   laddas upp rakt av. `node pipeline/srt-block.mjs justera <godkänd> <nya srt-orig> <ut>` flyttar
   den när de nya gränserna är en delmängd av de gamla; annars fördelar en agent texten på de
   nya blocken och `node pipeline/srt-block.mjs jamfor <godkänd> <ny>` visar att inget ord ändrats.
5. **Rendera (dyraste steget):** `apply --srtdir=<batch>/<KOD>/srt-fixed` → `render` → `download --out=<batch>/<KOD>/final`.
6. **QA:** `python3 pipeline/rostkoll.py --mapp final --kallmapp <källorna> --srtmapp srt-fixed`
   (❌ = levereras inte), `python3 pipeline/lyssna.py <final.mp4> <srt> <källa.mp4> <språkkod>`
   (språket som hörs, ordtäckning, röstens tonhöjd mot källans), och **inbränd text** — alla
   tre källorna har svenska captions inbrända:
   `python3 pipeline/no-captions.py <final/x.mp4> <srt-fixed/x.srt> <klar/<KOD>_x.mp4> --rutor`
   suddar bara rutan runt den svenska raden medan den syns (Axel 2026-09-28: "Kan du göra så att
   det suddiga inte är så himla stort?") och bränner in marknadens text. Exit 3 = källtext kvar.
   Titta på QA-bilderna `<out>.qa-N.png`.
7. **Upp i kontot:** `node matstrumpor/marknader/annonser/bygg.mjs --marknad <KOD> --skarpt --byt-video`
   skapar annonserna PAUSED, eller byter videon i dem som redan finns (ny creative, samma annons,
   tillbakaläst; `annonser/videor.json` minns vilken fil varje annons bär). ⛔ `--aktivera` vägrar
   så länge budgetbeslutet i `marknader.json` bär "tills Axel granskat" — Axel granskar alla
   annonser först (2026-09-27).
8. **Logga:** `products/matstrumpor/batch-log.md` + `docs/video-localization.md`; etikett dag 7.

## Rendera om en video med rättad text (mätt 2026-09-30)

Granskningen hörde enskilda repliker fel (G-B05: DK "livret" som "Sliurad", NL "teken" som
"keuken", FI "sushi" som "susi") och fällde några kalker. Elva videor renderades om **i samma
proofread-session**, utan ny proofread:

1. Rättad SRT i `<batch>/<KOD>/srt-fixed/` (den gamla kopieras till `srt-fixed.fore-<datum>/`),
   `kolla-srt.mjs` med `HEYGEN_BATCH=<batch>` ska ge ✅. Samma block och samma tider — bara texten.
2. I `<KOD>.json.state.json`: spara `renderId` som `renderId_fore_<datum>` och ta bort `renderId`,
   `srtApplied` och `downloaded` på just de posterna (apply hoppar över allt som har ett `renderId`).
   Kopiera den gamla filen i `final/` till `final.fore-<datum>/`.
3. `apply` → `render` → `download` som vanligt. HeyGen tog den nya texten i den gamla sessionen
   (DK Nathalie: render startad 19:12, nedladdad 19:16). En omrendering drog ~42 API-enheter
   (≈ 0,70 USD), ingen ny proofread.
4. QA ny mot gammal: `seglyssna.py` på båda med sina SRT:er, röstkollen, sedan `no-captions.py
   --rutor` till `annonser/klar/` och `bygg.mjs --byt-video`.

**Utfallet 2026-09-30/10-01: elva omrenderingar, alla godkända och bytta i de pausade annonserna.**
Ny mot gammal med `seglyssna.py` på båda filerna och deras egna SRT:er (Whisper medium; danska med
large-v3), röstkollen ✅ på alla elva. Ett lägre snitt i den nya filen är inte i sig ett fel: siffror
(`Ti` → "10") och sammansättningar räknas som miss, så raden som ändrades är den som avgör.

| Video | Ny / gammal | Det som avgjorde |
|---|---|---|
| DK Nathalie | 0,84 / 0,87 | "De bliver brugt år efter år" hörs rätt (gamla raden hördes "den bruges af og til"). "yndlingsret" hörs "yndlingsfat" med sammanhang i large-v3, samma betydelse; gamla "livret" hördes rätt först med sammanhang |
| ES Nathalie | 0,98 / 0,98 | inget fel |
| FI Nathalie | 0,89 / 0,83 | Whisper skriver aldrig š, så "suši" står som "susi" i båda |
| FI Sofie H1 / H2 | 0,87 / 0,89 · 0,89 / 0,80 | samma š-sak; H2 bättre |
| IT Nathalie | 0,93 / 0,95 | den nya öppningen hörs rätt |
| NL Nathalie | 0,91 / 0,95 | öppningen: large-v3 hör nya "Dit is je seintje" som "Dit is Jezijnje", gamla "Dit is je teken" som "Dit is je cake" — nu hörs nästan rätt ord |
| NO Nathalie / Sofie H1 | 0,89 / 0,89 · 0,86 / 0,79 | "minst ti personer" hörs rätt (gamla "typ ti" hördes "jeg sier jeg modererede") |
| FR Nathalie | 0,99 / 0,97 | inget fel |
| JP Sofie H1 | 0,90 / 0,94 | large-v3 med sammanhang: nya "全部で5足" rätt, gamla "五足入り" hördes "不足入り" (brist) |

Kostnad: elva omrenderingar à ~42–45 API-enheter. Plånboken stod på 8 531 enheter (≈ 142 USD)
efter omgången, mätt med `translate-batch.mjs status`. ⚠️ FR och NO Sofie H1 låg i HeyGens
moderationskö i över en timme; `download` med `timeout 3000` gav upp, och en ny `download`
morgonen efter hämtade båda.

## USA: "alla nya ads vi inte hade innan" (Axel 2026-09-27)

Den gamla US-kampanjen (`MATSTRUMP_SALES_US_20260828`, PAUSED) hade 49 annonser (38 video,
11 bild) från augusti. I SE-kampanjen finns **63 annonser skapade efter 28/8** — de är av fyra
slag och bara det första går genom HeyGen:

| Slag | Exempel (namn i kontot) | Väg till engelska |
|---|---|---|
| Riktig person som pratar (UGC) | `09-17 Nathalie captions musik`, `Sofie H1/H2` | HeyGen precision (den här batchen, `US.json`) |
| Kreatörsklipp av okänd person (t.ex. kille i bil, `045h1`) | `MATSTRUMP_sushi_gift_ugc_045h1–h3` | ⚠️ Rättigheterna okända — fråga Axel innan de lämnar Sverige (jfr Katarina) |
| B-roll + inbränd svensk text, ingen röst | `047h1` (köpcentrum), `048h1` (händer + låda), `050`, `051` | Ingen HeyGen: byt den inbrända texten mot engelska (`no-captions.py`-vägen med översatt text) |
| AI-genererad person / avatar | `012`, `s`-serien, `haiku*` | Görs om direkt på engelska i HeyGen (Axels regel) — och de är döda koncept i SE (dna.md), så bara om Axel vill |
| Statiska bilder från `/bildannonser` | `029`–`038` | Kie-generering på nytt med engelsk text ur samma prompt i hubben — kostar kie-credits, egen körning |

Mätt på fem tumnaglar 2026-09-27 (045h1 kille i bil, 047h1 köpcentrum, 050 låda, 048h1 händer,
012 AI-man). Resten är klassade på namnet — kontrollera tumnageln innan en video skickas till
HeyGen.

## Namn

Annonser: `MATSTRUMP_<KOD>_sushi_<vinkel>_ugc_<nnn>_v1` (`gift`, `jul`). Adset:
`MATSTRUMP_<KOD>_ugc`. Kampanj: `MATSTRUMP_<KOD>_SALES`. Klara filer: `annonser/klar/<KOD>_<namn>.mp4`.

## Japanska och kinesiska (JP, TW — 2026-09-30)

Samma kedja som de andra språken (proofread → sonnet-skribent → infödd granskare → skribenten
rättar → `translate-batch.mjs render` i `precision` → `download` → `rostkoll.py` →
`no-captions.py --rutor` → `lyssna.py`), med fem skillnader som sitter i verktygen:

- **Skriften:** `pipeline/sprak.mjs` → `kollaCjk` räknar kana och han-tecken i stället för
  funktionsord, och `kolla-srt.mjs` stoppar siffror med full bredd, valutor, butiksnamnet i katakana,
  Sverige/Norden utom EN gång i Japan (Axel: "i Japan speciellt kan vi trycka på att det är ett
  svenskt varumärke"; aldrig スウェーデン製), frakt/garanti och **talet fyra** (四 = 死 i båda
  språken; en present säger aldrig fyra). Taiwan får aldrig förenklade tecken (`BARA_FORENKLAD`).
- **Undertexterna:** `pipeline/cover-srt.py` ger en CJK-cue högst `MAX // 2` tecken (17 vid 34),
  delar vid 。！？ först och sedan vid 、，, och låter aldrig en rad börja med skiljetecken eller litet
  kana (kinsoku). En sats som bara är tre tecken för lång får stå kvar hellre än att en svans blir en
  egen cue.
- **Typsnittet:** `pipeline/cjk.py` hämtar Noto Sans CJK JP/TC Bold (notofonts via jsdelivr) till
  `~/.fonts` första gången; `no-captions.py`, `textbyte.py`, `textlager.py` och `d3/rita.py` väljer
  typsnitt per text. Liberation Sans och Poppins saknar tecknen och ger tomma rutor.
- **Lyssningen:** `pipeline/lyssna.py` mäter täckningen i tecken-bigram (inga ord att dela på) och
  gör om Whispers förenklade kinesiska till traditionell med opencc `s2twp` innan jämförelsen.
  Täckningen blir lägre än för latinska språk (0,72–0,89 mot 0,94–1,0): Whisper skriver homofoner
  (買衣送衣 för 買一送一, 勘配 för 完売), inte fel i rösten.
- **Talet:** japanskan läses högst cirka 7 tecken/s och mandarinen cirka 5 tecken/s i samma
  tidsfönster som svenskan (`egna/kolla-egna.mjs` → `TECKEN_PER_S`).

| Marknad | Video | Hörs som | Täckning | Röstkoll |
|---|---|---|---|---|
| TW | nathalie | zh 0.99 | 0.77 | ✅ |
| TW | sofie_h1 | zh 1.0 | 0.87 | ✅ |
| TW | sofie_h2 | zh 1.0 | 0.89 | ✅ |
| JP | nathalie | ja 0.99 | 0.89 | ✅ |
| JP | sofie_h1 | ja 1.0 | 0.89 | ✅ |
| JP | sofie_h2 | ja 1.0 | 0.93 | ✅ |

Replik för replik (`pipeline/seglyssna.py`, Whisper medium på varje replik för sig): JP nathalie
0,91 (bara siffror och homofoner skilde, 完売 hördes 販売), TW nathalie 0,81 (聖誕 hördes 震盪,
筷子 蓋子). UGC:n behåller HeyGens röst: Axels regel är HeyGens dyraste läge för riktiga människor,
och rösten måste följa läpparna.

