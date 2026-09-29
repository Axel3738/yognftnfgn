# HeyGen-batcherna — Matstrumpors UGC till elva språk

Axels regler 2026-09-27: **UGC-videor (riktiga människor) översätts med HeyGens dyraste
version** (full videoöversättning, röstklon + lip-sync i läget `precision` — aldrig audio only,
aldrig `speed`); **egna HeyGen-avatarvideor översätts inte utan görs om direkt på målspråket i
HeyGen**; ⛔ **Katarinas UGC får inte köras i andra marknader — översätts aldrig.** Källorna här
är därför Nathalie (vinnaren: 29 av 44 köp 17–26/9), Sofie H1 och Sofie H2 (jul) — alla Axels
egna UGC. Elva språk: NO, DK, FI, US (engelska, även WW), DE, FR, NL, ES, IT, PL, PT.

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
