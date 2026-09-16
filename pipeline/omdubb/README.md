# Omdubb i batch — hjälpskripten från `/ny-annonser termoskyddet` (2026-09-16)

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
  Comforting` (norsk, finns på kontot; `cd voiceover && npm run voices` listar).
  Dubba aldrig norska med den svenska rösten.
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
