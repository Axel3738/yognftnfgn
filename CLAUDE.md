# CLAUDE.md

## Vad detta repo är

Annonsfabrik för videoannonser. Viktigast: **videolokaliserings-pipelinen** — mp4-annonser
översätts/dubbas till nya marknader via HeyGen (röstklon + lip-sync) och levereras i chatten.

## Videoöversättning: använd skillen `/translate`

När användaren vill översätta/lokalisera videoannonser (Drive-länk eller uppladdade mp4:or
+ marknader + priser): kör skillen **translate** (`.claude/skills/translate/SKILL.md`).
Den innehåller hela flödet, järnreglerna och alla kända HeyGen-fallgropar.

Fullständig processdokumentation + körlogg för alla batcher: `docs/video-localization.md`.

## Järnreglerna (gäller alltid)

1. **Rendera ALDRIG före proofread** — rendering drar HeyGen-credits, proofread är gratis.
2. **Skanna ALLTID källvideon efter inbränd svensk text före leverans** — HeyGen översätter
   bara ljudet. Inbränd text måste täckas och ersättas med lokaliserade captions.
3. Captions är **opt-in** — leverera utan captions om inte användaren bett om dem
   (undantag: när inbränd text måste täckas). Max 2 rader per caption.
4. Förstör aldrig videokvalitet i onödan — komprimera bara så mycket som 30 MiB-gränsen
   kräver (crf 23–26).

## Teknik

- HeyGen-klient: `pipeline/heygen.mjs` · CLI: `pipeline/localize.mjs` · caption-cues:
  `pipeline/cover-srt.py`
- Kräver env-variabeln `HEYGEN_API_KEY` (läggs in i Claude-environmentets inställningar).
- Node behöver `NODE_USE_ENV_PROXY=1` + `NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt`
  i den här sandlådan (localize.mjs fixar det själv).
- Spara alltid HeyGen-session-ID:n till disk direkt — containrar kan starta om.

## Namngivning

Leveranser: `{MARKNAD}_{Kampanj}_{Variant}.mp4` (NO_/DK_/FI_/UK_/AU_/MX_/NL_).
Övrig namnkonvention: `docs/naming-convention.md`.
