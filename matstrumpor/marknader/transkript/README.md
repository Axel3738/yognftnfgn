# Transkript av Matstrumpors svenska videoannonser

Vad som sägs i varje video i SE-kampanjen `MATSTRUMP_SALES_20260826` (`120251217860260023`),
transkriberat lokalt 2026-09-27 med **faster-whisper** (`medium`, int8, CPU, `language=sv`,
VAD-filter) — noll HeyGen-krediter. Axels order (`/goal` 2026-09-27): "du ska transkribera alla
annonser". Källan var Metas `GET /<video_id>?fields=source` för varje videoannons i kampanjen;
skriptet ligger i sessionens scratchpad (`transkript/kor.py`), inte i repot.

| | Antal |
|---|---|
| Videoannonser i kampanjen (unika video-id:n) | 86 |
| Transkriberade (SRT här) | 69 |
| … varav med tal (≥ 5 s) | 58 |
| … varav nästan tysta — musik/text utan röst | 11 |
| Utan `source` från Meta (gick inte att hämta) | 17 |

**`register.json`** är facit: per video-id → annonsnamn, annons-id, status, skapad, längd,
SRT-fil, talad tid (`tal_s`) och raderna med tidkoder.

## Nästan tysta videor (ingen röst att översätta)

- MATSTRUMP_sushi_gift_ugc_052_v1 (12.933 s)
- MATSTRUMP_sushi_gift_ugc_050_v1 (9.683 s)
- MATSTRUMP_sushi_gift_lifestyle_051_v1 (7.2 s)
- MATSTRUMP_sushi_jul_ugc_046v1_v1 (28.166 s)
- MATSTRUMP_sushi_jul_ugc_046v2_v1 (22.4 s)
- MATSTRUMP_sushi_gift_ugc_010v2_v1 (9.96 s)
- MATSTRUMP_sushi_gift_ugc_011v2_v1 (7.616 s)
- MATSTRUMP_sushi_gift_ugc_meet_v1 (13.516 s)
- MATSTRUMP_sushi_gift_ugc_013_v1 (16.066 s)
- MATSTRUMP_sushi_gift_ugc_012v2_v1 (14.14 s)
- MATSTRUMP_sushi_gift_ugc_012_v1 (14.14 s)

En video utan tal ska ALDRIG genom HeyGens röstöversättning (HeyGen har ingen röst att klona och
hittar på en — järnregel 3 i `/translate`). Bilden/texten i dem är inbränd svenska: de görs om
per marknad med nya captions, inte dubbas.

## De 17 videor Meta inte lämnade ut

`GET /<video_id>?fields=source` svarade utan `source` (ingen felkod) för:
`1493413732820148`, `2248172075969858`, `1001117282985861`, `2060579945333155`, `1264861142355954`, `1588759059298585`, `2245996319570891`, `1069648619144221`, `1068653319210056`, `1098175246072041`, `2686778868386746`, `1430519309134174`, `1618866059835777`, `1593728122281460`, `1673746527058924`, `1050161474327075`, `885620961297394`.
Troligen videor som laddats upp av en annan användare/sida än token:ens (Meta lämnar bara ut
`source` till ägaren). Vägen runt: redigerarnas originalfiler i Matstrumpors Notion-hub
(`Filer och media` / Drive-länken på raden) eller Adsmanager-MCP:n i en session Axel startar.
Ingen av de tre videor som översätts först (Nathalie `1531210268763716`, Sofie H1
`2577232842703704`, Sofie H2 `28225249640488512`) saknas — de ligger i `heygen/kallor.json`.

## Så används de

- **HeyGen-kedjan** (`heygen/README.md`): HeyGen transkriberar själv i proofread-steget, men
  SRT:n här är det svenska facit att jämföra mot innan `apply` — hallucinerade ord i proofread
  syns direkt.
- **US "alla nya ads"**: klassificeringen i `heygen/README.md` (UGC → HeyGen, avatar → görs om,
  b-roll + text → nya captions, stillbild → kie) utgår från `tal_s` här: 0 s = ingen röst.
- **Copy per marknad** (`annonser/<KOD>.json`): manusraderna är råmaterialet för hooks på
  målspråket när fler än de tre första videorna ska ut.

⚠️ Whisper gissar ibland ord i musikpartier (VAD-filtret tar det mesta). Läs alltid raden mot
videon innan en SRT används som manus.
