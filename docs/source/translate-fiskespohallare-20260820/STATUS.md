# PAUSAD /translate-körning — Fiskespöhållare → NO + DK + FI + UK

**Datum:** 2026-08-20 · **Status: ⏸ PAUSAD — HeyGens api-kreditpott är slut.**
Axel valde att pausa i stället för att fylla på. Allt state ligger i den här mappen.

## Beställningen (bekräftad av Axel i sessionen)

- **Källa:** Drive-mapp `1zEovRrHm4PHJVuKYLVQmbIDGK7B9Rmia` — 15 videoannonser för
  **Fiskespöhållare** (ny produkt, finns inte i `products/products.json`).
  5 koncept × 3 hooks: `CS/GT/PD/SO/SP_1_H1–H3`, 1080×1920, 27–39 s, 16–31 MB.
  Fil-ID:n för nedladdning: `files.json` (mönster:
  `https://drive.usercontent.google.com/download?id=<ID>&export=download&confirm=t`).
- **Marknader:** NO (Norwegian Bokmål (Norway)) · DK (Danish (Denmark)) ·
  FI (Finnish (Finland)) · UK (English (UK)) → **60 översättningar.**
- **Priser: stryk alla belopp** — skriv om till rabattbudskap utan siffror.
  (Källtranskripten verkar redan sakna belopp: CS säger bara "rabatterat pris".
  Verifiera per video när transkripten finns.)
- **Produktnamn per marknad (Axels besked, normativa):**
  NO **Fiskestangholder** · DK **Fiskestangsholder** · FI **Kalastusvapateline** ·
  UK **Fishing Rod Holder**.

## Vad som är gjort

1. Alla 15 källvideor nedladdade och uppladdade till HeyGen som assets —
   asset-URL:erna står i `sessions.json` under `assets` och kan återanvändas
   direkt i nya `proofreadCreate`-anrop (ingen ny upload behövs om de inte hunnit
   städas bort hos HeyGen).
2. 60 proofread-sessioner skapades. **5 hann transkriberas** innan krediterna tog
   slut (NO/DK/FI/UK_CS_1_H1 + UK_CS_1_H2) — deras översatta SRT:er + svenska
   original ligger i `srt/`. **Övriga 55 failade** med
   `Insufficient credit. This operation requires 'api' credits` och måste skapas
   OM med nya `proofreadCreate` (id:n i `sessions.json` med `srt_done: "failed"`
   är döda).
3. **Järnregel 2-skanningen är gjord: ALLA 15 videor har inbrända svenska
   captions** (vit rundad platta, svart fet text, ord-för-ord genom hela klippet,
   t.ex. "rabatterat pris.", "som alltid"). Leverans kräver alltså blur-cover av
   caption-bandet + inbrända lokaliserade captions (`localize.mjs burn
   --style=cover` + `pipeline/cover-srt.py`) på samtliga 60 filer.
   Grov bandgeometri per video: `bands.json` (y0/y1 i 1080×1920-skala,
   ⚠️ bruset från vita bakgrunder gör vissa band för breda — mät om snävare,
   plattan ligger typiskt kring y ≈ 1280–1460).

## Kreditekonomin (uppmätt, inte gissad)

- Kvot före körningen: `remaining_quota` (api) **85** · efter 5 transkriberingar: **11**
  → **~15 api-credits per video×språk bara för proofread-transkriberingen.**
- `plan_credit: 1019` kan INTE användas av API:t — potten `api` är separat.
- Rendering drar mer än proofread (tidigare batcher: ~356 enheter för 8
  video-renderingar inkl. proofread). Uppskattning för hela beställningen:
  **~2 500–3 000 api-credits.** Fyll på innan återupptag.

## Så återupptas körningen

1. Verifiera kvoten: `cd pipeline && node localize.mjs check` (kräver `HEYGEN_API_KEY`;
   Node-anrop körs med `NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt`).
2. Ladda ner källvideorna igen via `files.json` (scratchpaden är borta).
3. Skapa nya proofread-sessioner för de 55 som saknar SRT — återanvänd
   asset-URL:erna i `sessions.json`. De 5 färdiga SRT:erna i `srt/` behöver INTE
   köras om (såvida inte HeyGens sessioner hunnit gå ut — de 4 CS_1_H1/H2-id:n
   med `srt_done: true` kan testas med `proofreadStatus` först).
4. Följ sedan `.claude/skills/translate/SKILL.md` från steg 4 (lokalisera →
   verifiera → rendera → blur-cover + captions → leverera → logga).
   Kom ihåg: "Fri frakt" och "Trettio dagars öppet köp" i källtalet är
   marknadsvillkor — bekräfta med Axel att de gäller NO/DK/FI/UK innan de behålls.
