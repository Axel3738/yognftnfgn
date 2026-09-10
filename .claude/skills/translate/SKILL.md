---
name: translate
description: Översätt och lokalisera mp4-videoannonser till nya marknader via HeyGen (röstklon + lip-sync). Använd ALLTID denna skill när användaren vill översätta, dubba eller lokalisera videoannonser — även om de bara klistrar in en Drive-länk eller laddar upp mp4:or och nämner ett land/språk. Triggas av "/translate", "översätt till norska/danska/finska/engelska/…", "kör dessa till <marknad>", "duplicera annonserna till <land>". Hanterar hela kedjan Drive-länk → proofread → lokalisering → rendering → leverans i chatten.
---

# /translate — videoannonser till nya marknader

Du får: en Drive-länk (eller uppladdade mp4:or), en lista marknader, och priser per marknad.
Du levererar: färdiga dubbade videor per marknad, zippade i chatten.

Fråga med AskUserQuestion om något av detta saknas: **marknader** och **priser**
(eller beskedet att priser ska strykas/ersättas med t.ex. "23 % rabatt").

## Tre järnregler (brutna = pengar eller förtroende förlorat)

1. **Rendera ALDRIG före proofread.** Rendering drar HeyGen-credits, proofread är gratis.
   Transkriptet ska vara lokaliserat, verifierat och godkänt INNAN generate anropas.
2. **Skanna ALLTID källvideon efter inbränd text före leverans.** HeyGen översätter bara
   ljudet — svensk text i bild följer med oöversatt. Hittas text: täck och ersätt med
   lokaliserade captions. Annars levereras inga captions (captions är opt-in).
3. **Kör ALLTID röstkollen på varje renderad video före leverans** (Axels regel
   2026-09-08: ingen video går ut med keff röst). Proofread läser TEXTEN och säger
   ingenting om hur rösten låter.

   ```bash
   python3 pipeline/rostkoll.py --mapp final/ --kallmapp original/ --srtmapp srt-fixed/
   ```

   Gratis, bara ffmpeg lokalt. Fångar tyst spår, längddrift mot källan, avhugget
   slut och tappat tal. **En video med ❌ levereras inte** — rendera om den i
   HeyGens UI eller stryk den ur batchen. Ladda aldrig upp den ändå.

   ⚠️ **Grönt betyder "inga mätbara fel", inte "godkänd".** ffmpeg hör inte
   skillnad på tal och musik, så bara det som går att mäta mäts. Lyssna själv på
   minst den video som ska bära mest spend, och redovisa i leveransen att du gjort det.

   ⚠️ **Är källan nästan bara musik ska videon inte översättas alls** — HeyGen har
   ingen röst att klona och hittar på en. Det var därför `PD_EXTRA` hoppades över
   i motorhöljesbatchen. Röstkollen flaggar det när källvideon anges.
3. **Lyssna på varje renderad video innan den levereras. En keff röst går aldrig ut.**
   (Axels besked 2026-09-08.)

### Röstkontrollen (regel 3)

⚠️ **Det går INTE att välja röst.** `/v2/video_translate` klonar källans röst
automatiskt — det finns ingen röstparameter i anropet (verifierat i
`pipeline/heygen.mjs` 2026-09-08). En dålig röst kan alltså inte förebyggas med
en inställning. Den kan bara **fångas genom att någon lyssnar**.

Lyssna på tre ställen i varje renderad fil — hooken (0–3 s), mitten och slutet:

| Vad du lyssnar efter | Hur det låter när det är fel |
|---|---|
| Fel kön eller fel tonläge | rösten byter person mot källvideon |
| Robotljud / metalliskt | knastrande konsonanter, platt melodi |
| Fel brytning | svenskt uttal i en norsk dubb, engelsk accent i en svensk |
| Uppskruvat tempo | rösten hetsar för att hinna med bildens timing |
| Klippt eller överstyrt ljud | orden kapas i början eller slutet av en cue |
| Läppsynk som glider | munnen rör sig ur takt sent i filmen |

Låter något av det fel: **leverera inte filen.** Skapa en NY proofread-session för
just den videon och rendera om (samma sessions-ID går inte att köra om — den är
låst). Håller rösten inte andra gången heller: lämna videon som väntande med
orsak i rapporten, och säg det rakt ut. Hellre en video mindre än en annons som
låter som en robot under ett nytt varumärke.

Redovisa alltid i leveransen hur många filer som lyssnats igenom och hur många som
renderats om. "QA grön" utan röstraden räknas inte som QA.

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
   Bara "Norwegian" eller "Swedish (Sweden)"-varianter som inte står i listan avvisas
   med `Invalid language` — hämta listan i stället för att gissa.
   **Spara alla session-ID:n till en JSON-fil på disk DIREKT** — containern kan starta om.
   - `failed — No speaker is detected in the video`: **videon innehåller inget tal.**
     Det är ett svar, inte ett fel — ren b-roll utan voiceover finns och är en fullt
     giltig annons. Dubba den inte; leverera källan som den är.
     Samma anrop är också det billigaste sättet att svara på frågan "säger den här
     videon källbutikens namn?" när ett transkript saknas: ingen röst = inget att säga.
     *(Mätt 2026-09-09 på `IBC_PD_Extra` — en dom på "talet är oläst" höll annonsen
     pausad i ett dygn innan någon frågade om det fanns något tal alls.)*
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
   2026-09-02 (`Beltesliper_NO_PD_3`): ett utsuddat band över hela bredden exakt
   där källremsan satt (blurrad kopia av intilliggande bildinnehåll — inte
   källtexten suddad på plats), och ovanpå en tajt ruta med vit bakgrund och
   svart fet text mitt i bandet, max 2 rader, inget av källtexten synligt.
   Skriptet mäter bandet, väljer remsa utan text (under, annars ovanför, annars
   hård blur på plats), gör cover-SRT:n gapless, kontrollerar att ingen text
   sticker ut och sparar QA-bilder som ska tittas på före leverans.
   Motexemplet `Overvåkingskamera_NO_CS_1` (svensk text kvar bakom plattan, norsk
   text i egen ruta under) kom av att bandet mättes fel — därför är QA-bilderna
   obligatoriska. Vill användaren ha en annan stil för en annan marknad:
   `--band=Y0:Y1`/`--font-px`/`--blur` i första hand, egen ffmpeg-kedja i sista.
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
