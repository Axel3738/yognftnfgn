# Omdubb i batch — hjälpskripten från `/ny-annonser termoskyddet` (2026-09-16)

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
