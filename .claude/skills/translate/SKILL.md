---
name: translate
description: Översätt och lokalisera mp4-videoannonser till nya marknader via HeyGen (röstklon + lip-sync). Använd ALLTID denna skill när användaren vill översätta, dubba eller lokalisera videoannonser — även om de bara klistrar in en Drive-länk eller laddar upp mp4:or och nämner ett land/språk. Triggas av "/translate", "översätt till norska/danska/finska/engelska/…", "kör dessa till <marknad>", "duplicera annonserna till <land>". Hanterar hela kedjan Drive-länk → proofread → lokalisering → rendering → leverans i chatten.
---

# /translate — videoannonser till nya marknader

Du får: en Drive-länk (eller uppladdade mp4:or), en lista marknader, och priser per marknad.
Du levererar: färdiga dubbade videor per marknad, zippade i chatten.

Fråga med AskUserQuestion om något av detta saknas: **marknader** och **priser**
(eller beskedet att priser ska strykas/ersättas med t.ex. "23 % rabatt").

## Två järnregler (brutna = pengar eller förtroende förlorat)

1. **Rendera ALDRIG före proofread.** Rendering drar HeyGen-credits, proofread är gratis.
   Transkriptet ska vara lokaliserat, verifierat och godkänt INNAN generate anropas.
2. **Skanna ALLTID källvideon efter inbränd text före leverans.** HeyGen översätter bara
   ljudet — svensk text i bild följer med oöversatt. Hittas text: täck och ersätt med
   lokaliserade captions. Annars levereras inga captions (captions är opt-in).

## Miljö

- `HEYGEN_API_KEY` måste finnas som env-variabel (läggs in i environment-inställningarna).
- Node-anrop körs med `NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt`
  (annars 403 genom egress-proxyn). `pipeline/localize.mjs` gör detta själv.
- API-klient: `pipeline/heygen.mjs` (uploadAsset, proofreadCreate/Status/GetSrt/UploadSrt/
  Generate, getTranslateStatus, checkQuota). CLI: `pipeline/localize.mjs`.

## Flödet

1. **Hämta filerna.** Drive-mapp utan API:
   lista: `https://drive.google.com/embeddedfolderview?id=<ID>#list` (regex på flip-entry),
   ladda ner: `https://drive.usercontent.google.com/download?id=<ID>&export=download&confirm=t`.
   Filer >32 MB: komprimera med libx264 crf 23–28 före HeyGen-upload (32 MB-gräns).
2. **Kolla kvoten** (`checkQuota`) och rapportera den till användaren före och efter.
3. **Proofread-fas (0 credits).** En session per video × marknad via `proofreadCreate`.
   Språknamn måste matcha HeyGens lista exakt (`listTargetLanguages`), t.ex.
   "Norwegian Bokmål (Norway)", "Danish (Denmark)", "Finnish (Finland)", "English (UK)",
   "English (Australia)", "Spanish (Mexico)", "Dutch (Netherlands)".
   **Spara alla session-ID:n till en JSON-fil på disk DIREKT** — containern kan starta om.
4. **Lokalisera transkripten.** Läs varje SRT och rätta enligt checklistan i
   `docs/video-localization.md` (§Lokaliseringschecklista). Kortversion:
   - Varumärken/produktnamn enligt marknadens namn (fråga användaren om okänt).
   - Priser → användarens siffror; utan priser: skriv om till rabattbudskap utan belopp.
   - Kalkeringar och påhittade ord ("Snap-dry", "Ergotøfler") → idiomatiska ord.
   - Meningsflippar, USA-stavning i UK/AU, kvarvarande svenska, ordföljdsfel.
   - Samma produktterm genom hela batchen (t.ex. fi: alltid "tossut").
   - Påståenden måste stämma ("40 % rabatt" får inte motsäga priserna).
   - Behåll EXAKT samma blockantal och timecodes — annars vägrar HeyGen SRT:n.
   - Ungefär samma textlängd per block, för läppsynkens skull.
5. **Verifiera automatiskt.** Bygg en regex-checklista per marknad (belopp, valuta,
   svenska tecken, förbjudna ord) och kör tills alla filer är gröna.
   Undanta timecode-rader från skanningen (annars false positives som "00:00:22,400").
6. **Rendera (enda betalsteget).** Per session: ladda upp rättad SRT (`proofreadUploadSrt`),
   verifiera att den slog igenom (hämta live-SRT med no-cache, jämför, upp till 8×8 s —
   CDN:en laggar), sedan `proofreadGenerate`. Spara render-ID:n till disk direkt.
   - **Känd HeyGen-bugg:** ibland svarar SRT-uppladdningen 200 men persisteras aldrig
     (sessionen är låst). Retry hjälper INTE → skapa en NY proofread-session för den
     videon, lokalisera det färska transkriptet, rendera därifrån.
   - Status: använd v3 (`getTranslateStatus`) — v2 ljuger ("pending moderation" fast klar).
   - Fastnar en video i moderationskön: polla i bakgrunden, leverera resten direkt.
7. **Järnregel 2:** skanna källvideon (2 bilder/sek, hitta ljusa textplattor via
   numpy: rader där 40 < vita pixlar < 240 vid 270 px bredd). Hittas inbränd text:
   bränn lokaliserade captions med **`pipeline/no-captions.py`** — Axels facit
   2026-09-02 (`Beltesliper_NO_PD_3`): ett helsvart band över hela bredden exakt
   där källremsan satt, vit fet text mitt i, max 2 rader, inget av källtexten
   synligt. Skriptet mäter bandet, gör cover-SRT:n gapless, kontrollerar att
   ingen text sticker ut och sparar QA-bilder som ska tittas på före leverans.
   Den äldre tekniken (crop + blur-kopia av bandet + vit platta med svart text)
   gav genomskinliga plattor med svensk text kvar (`Overvåkingskamera_NO_CS_1`)
   och används inte längre. Vill användaren ha en annan stil för en annan
   marknad: `--band=Y0:Y1`/`--font-px` i första hand, egen ffmpeg-kedja i sista.
   ffmpeg i loopar: alltid `-nostdin` och `</dev/null`.
8. **Leverera.** Döp om till `{MARKNAD}_{namn}.mp4` (NO_/DK_/FI_/UK_/AU_/MX_/NL_).
   Zippa ≤30 MiB per zip (chattens gräns), `zip -0`. Filer >30 MiB: komprimera crf 23–26,
   aldrig hårdare än nödvändigt — kvaliteten får inte förstöras.
   Skicka med SendUserFile, ange innehållet per zip i bildtexten.
9. **Logga.** Ny rad i körloggen i `docs/video-localization.md`, committa och pusha.

## Rapportera alltid till användaren

- Vilka rättelser som gjordes i transkripten (kort, med exempel).
- Egna beslut som kräver godkännande (uppskattade belopp, omskrivna påståenden).
- Kvot före/efter.
