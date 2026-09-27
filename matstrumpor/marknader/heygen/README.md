# Norge — annonsspåret, körordningen

Axel 2026-09-27: Norge först, **1 000 kr/dag**, kampanj `MATSTRUMP_NO_SALES` i kontot
"nya kungen" (`730973156224390`, SEK — samma konto som Sverige, som US/UK/AU i augusti).
Landningssidan är `https://matstrumpor.se/nb/products/sushi-strumpor?country=NO` (norska,
NOK, fri frakt — byggd samma dag, se `../README.md`). Regeln för materialet, Axels ord
samma dag: **UGC-videor översätts med HeyGens dyraste version** (full videoöversättning,
röstklon + lip-sync — aldrig audio only); **egna HeyGen-avatarvideor översätts inte utan görs
om direkt på norska i HeyGen.** De fyra källorna här är alla UGC.

| Fil | Vad |
|---|---|
| `kallor.json` | De fyra svenska UGC-annonsernas video-id i kontot + varför just de |
| `norge.json` | HeyGen-batchens manifest (`translate-batch.mjs`, marknad NO) |
| `annonser.json` | Norsk annonstext (sonnet mot `docs/copy-regler.md`) + videofil per annons |
| `upp.mjs` | Kampanj + adset + annonser i kontot via token, PAUSED; `--aktivera` slår på bara det |
| `kampanj.json` | Skrivs av `upp.mjs` efter tillbakaläsning (id:n, status) |

## Två klick innan något går att köra (mätt 2026-09-27)

1. **Meta-skrivrätt.** `META_ACCESS_TOKEN` läser kontot men `Permissions error … rollen
   Annonsör eller högre … ads_management`. Axel: Business Manager → kontot "nya kungen" →
   systemanvändaren/partnern (SnarkLös, "API LONG TERM") → **Hantera kampanjer**.
   Alternativ: kör steg 6 via Adsmanager-MCP:n i en session Axel startar (som `/matstrumpor`).
2. **HeyGen api-krediter.** Proofread svarade `Insufficient credit. This operation requires
   'api' credits` medan kvoten sa `api: 6`. Axel: app.heygen.com → Settings → Subscriptions &
   API → köp API-krediter. Tumregel ur körloggen: ~1 kredit per påbörjad videominut, fyra
   videor à ~30 s ⇒ räkna med minst 4–8.

## Körordningen (en session, ~1–2 h)

Miljö för alla node-steg: `NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt`.
ffmpeg/ffprobe finns inte i containern: `pip install imageio-ffmpeg numpy pillow` ger ffmpeg
(symlänka `imageio_ffmpeg.get_ffmpeg_exe()` till `/usr/local/bin/ffmpeg`); ffprobe hämtas ur
johnvansickle.com:s statiska tarball (`ffmpeg-release-amd64-static.tar.xz`). apt fungerar inte.

1. **Hämta källvideorna** ur kontot (de ligger inte i repot):
   `GET https://graph.facebook.com/v21.0/<video_id>?fields=source&access_token=…` per rad i
   `kallor.json`, spara som `<batchmapp>/matstrumpor/up/<namn>.mp4` (≤ 32 MB, alla är 5–8 MB).
   Kopiera `norge.json` till `<batchmapp>/norge.json`.
2. **Proofread (0 krediter när kontot har api-krediter):**
   `node pipeline/translate-batch.mjs status --manifest=<batchmapp>/norge.json --marknad=NO`
   `node pipeline/translate-batch.mjs proofread --manifest=<batchmapp>/norge.json --marknad=NO`
   → `<batchmapp>/srt-orig/matstrumpor_<namn>.srt` (norska) + `.orig.srt` (svenska).
3. **Lokalisera SRT:erna** — en sonnet-subagent per fil mot `.claude/skills/translate/SKILL.md`
   § Lokalisera transkripten och `docs/copy-regler.md`: samma blockantal och timecodes, ordlistan
   (Sushi-sokker, "Kjøp 1 – Få 1", 5 par), inga priser (sidan visar NOK), "sålde slut i
   november" behålls (sant, Axel bekräftade 2026-09-24), ingen svenska kvar. Spara i
   `<batchmapp>/srt-fixed/`. Kör regex-checklistan (kr/SEK/svenska tecken) tills grönt.
4. **Rendera (enda betalsteget):**
   `node pipeline/translate-batch.mjs apply --manifest=… --marknad=NO --srtdir=<batchmapp>/srt-fixed`
   `node pipeline/translate-batch.mjs render --manifest=… --marknad=NO` (Nathalie först om
   krediterna är knappa: `--bara=matstrumpor` gäller slug, så kör hellre render på alla och
   låt kvotvakten stoppa)
   `node pipeline/translate-batch.mjs download --manifest=… --marknad=NO --out=<batchmapp>/final`
5. **QA, båda obligatoriska:**
   - Röst: `python3 pipeline/rostkoll.py --mapp <batchmapp>/final --kallmapp <batchmapp>/matstrumpor/up --srtmapp <batchmapp>/srt-fixed`
     — en ❌ levereras inte; lyssna själv på Nathalie (bär mest spend).
   - Inbränd text: alla fyra källorna har **svenska captions inbrända** ("captions" i
     annonsnamnen). `python3 pipeline/no-captions.py <final/x.mp4> <srt-fixed/x.srt> <klar/NO_x.mp4>`
     mäter bandet, suddar det och bränner norska captions (max 2 rader); titta på de tre
     QA-bilderna `<out>.qa-N.png` innan något laddas upp. Exit 3 ⇒ större `--band`.
6. **Upp i kontot:** lägg de klara filerna som `annonser.json` pekar på (`klar/NO_<namn>.mp4`
   relativt den här mappen, eller ändra `video`), sedan
   `node matstrumpor/marknader/norge/upp.mjs --torr` → `--skarpt` (allt PAUSED, tillbakaläst) →
   kontrollera länk `/nb/…?country=NO`, sida `820358954504320`, texten → `--skarpt --aktivera`.
   Axels budget är given (1 000 kr/dag); aktiveringen väntar inte på ett nytt ok.
7. **Logga:** `products/matstrumpor/batch-log.md` (Norge-batch #1: annonsnamn, video-id,
   annons-id, HeyGen-krediter före/efter), `docs/video-localization.md` körloggen, och
   etikettera dag 7 som vanligt — Norge har ingen break-even förrän `cogs.json` → `norden`
   fyllts (leverantörsfrågan i `../LEVERANTOR-FRAGA.md`).

## Namn

Annonser: `MATSTRUMP_NO_sushi_<vinkel>_ugc_<nnn>_v1` (`gift` för Nathalie/Sofie, `jul` för
Sofie H2 när den tas). Adset: `MATSTRUMP_NO_ugc`. Kampanj: `MATSTRUMP_NO_SALES`. Nästa land
får samma mönster med sin landskod — det är det `/matstrumpor-marknader`-rutinen ska
generalisera (planen i `../README.md`).
