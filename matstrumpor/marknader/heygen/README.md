# HeyGen-batcherna — Matstrumpors UGC till norska, engelska, danska, finska

Axels regler 2026-09-27: **UGC-videor (riktiga människor) översätts med HeyGens dyraste
version** (full videoöversättning, röstklon + lip-sync — aldrig audio only); **egna
HeyGen-avatarvideor översätts inte utan görs om direkt på målspråket i HeyGen**; ⛔ **Katarinas
UGC får inte köras i andra marknader — översätts aldrig.** Källorna här är därför Nathalie
(vinnaren: 29 av 44 köp 17–26/9), Sofie H1 och Sofie H2 (jul) — alla Axels egna UGC.

| Fil | Vad |
|---|---|
| `kallor.json` | Video-id i kontot för varje källa, varför, och Katarina-spärren |
| `NO.json`, `US.json`, `DK.json`, `FI.json` | Manifest per marknad för `pipeline/translate-batch.mjs` (samma tre videor, olika språk). Worldwide-kampanjen använder US-videorna (engelska) |
| `../annonser/<KOD>.json` | Copy per marknad + vilken fil varje annons ska bära (`klar/<KOD>_<namn>.mp4`) |

## ⛔ Stoppet (mätt 2026-09-27, två gånger)

Varje proofread-session svarar `Insufficient credit. This operation requires 'api' credits`,
medan `/v2/user/remaining_quota` säger `api: 6, plan_credit: 2000` före och efter (ingen
kredit dras). Samma mönster som 2026-08-29 (47 sessioner). **Studiokrediterna (2 000) är inte
API-krediter.** Axel köper API-krediter på app.heygen.com → Settings → Subscriptions & API.
Tumregel ur körloggen: ~1 kredit per påbörjad videominut; tre videor à ~25–30 s per språk,
fyra språk ⇒ räkna med 12–20 krediter för allt. Failade sessioner återskapas av sig själva
vid nästa `proofread`.

## Körordningen per marknad (NO först — den har budget)

Miljö: `NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt` på alla node-steg.
ffmpeg/ffprobe saknas i containern: `pip install imageio-ffmpeg numpy pillow` + symlänk
`imageio_ffmpeg.get_ffmpeg_exe()` → `/usr/local/bin/ffmpeg`; ffprobe ur johnvansickle.com:s
statiska tarball (`ffmpeg-release-amd64-static.tar.xz`). apt fungerar inte här.

1. **Källorna** ur kontot (ligger inte i repot):
   `GET https://graph.facebook.com/v21.0/<video_id>?fields=source` per rad i `kallor.json` →
   `<batch>/matstrumpor/up/<namn>.mp4`. Kopiera `<KOD>.json` till `<batch>/<KOD>.json`.
2. **Proofread:** `node pipeline/translate-batch.mjs status --manifest=<batch>/<KOD>.json --marknad=<KOD>`
   sedan `… proofread …` → `<batch>/srt-orig/matstrumpor_<namn>.srt` + `.orig.srt`.
3. **Lokalisera** en sonnet-subagent per SRT mot `.claude/skills/translate/SKILL.md` §4 och
   `docs/copy-regler.md`: samma blockantal/timecodes, marknadens ordlista (Sushi-sokker / Sushi
   Socks / Sushi-sokker (da) / Sushisukat; "Kjøp 1 – Få 1" osv.), inga priser, "sålde slut i
   november" behålls (sant), ingen svenska kvar. Till `<batch>/srt-fixed/`. Regex-koll tills grönt.
4. **Rendera (enda betalsteget):** `apply --srtdir=<batch>/srt-fixed` → `render` → `download --out=<batch>/final`.
5. **QA:** `python3 pipeline/rostkoll.py --mapp <batch>/final --kallmapp <batch>/matstrumpor/up --srtmapp <batch>/srt-fixed`
   (❌ = levereras inte; lyssna själv på Nathalie), och **inbränd text** — alla tre källorna har
   svenska captions inbrända: `python3 pipeline/no-captions.py <final/x.mp4> <srt-fixed/x.srt> <klar/<KOD>_x.mp4>`
   och titta på QA-bilderna `<out>.qa-N.png`. Exit 3 ⇒ större `--band`.
6. **Upp i kontot:** lägg filerna i `matstrumpor/marknader/annonser/klar/` som `<KOD>.json`
   pekar på, sedan `node matstrumpor/marknader/annonser/bygg.mjs --marknad <KOD> --torr` →
   `--skarpt` (PAUSED, tillbakaläst) → för NO: `--skarpt --aktivera` (Axels budget är given).
   DK/FI/US/WW aktiveras aldrig utan Axels budget — `bygg.mjs` vägrar på platshållaren.
7. **Logga:** `products/matstrumpor/batch-log.md` + `docs/video-localization.md`; etikett dag 7.

## USA: "alla nya ads vi inte hade innan" (Axel 2026-09-27)

Den gamla US-kampanjen (`MATSTRUMP_SALES_US_20260828`, PAUSED) hade 49 annonser (38 video,
11 bild) från augusti. I SE-kampanjen finns **63 annonser skapade efter 28/8** — de är av fyra
slag och bara det första går genom HeyGen:

| Slag | Exempel (namn i kontot) | Väg till engelska |
|---|---|---|
| Riktig person som pratar (UGC) | `09-17 Nathalie captions musik`, `Sofie H1/H2` | HeyGen dyraste (den här batchen, `US.json`) |
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
