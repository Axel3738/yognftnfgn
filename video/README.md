# Video-pipeline — Higgsfield-rörelse + brända captions

Genererar korta video-annonser (9:16, 1080×1920) för Reels/Stories. Speglar
static-pipelinen: modellen renderar **rörelsen**, vi bränner **skarpa captions** ovanpå
med ffmpeg. Manus-tänket bor i [`../docs/creative-strategy.md`](../docs/creative-strategy.md).

**Två steg:**
1. Higgsfield genererar ett klipp per shot (image2video / text2video) — ingen text i bild.
2. `compose.mjs` (ffmpeg) klistrar ihop shots, bränner captions (`.ass`) + endcard.

## Setup
```bash
cd video
npm install                 # för live-generering (dry behöver inga deps)
export HF_API_KEY="..."     # samma nycklar som static-pipelinen
export HF_SECRET="..."
# ffmpeg + ffprobe måste finnas i PATH för live-stitch
```

## Kör
```bash
npm run dry                 # bygg storyboard + captions + shot-prompts (0 kr, 0 API)
npm run gen                 # skarpt: Higgsfield-klipp + ffmpeg-stitch
node run.mjs --only=specsheet --dry
```
Allt hamnar i `output/wave-XX/`:

| Fil | Vad |
|-----|-----|
| `<name>.storyboard.md` | Läsbar storyboard — beats, shots, timing. **Granska den här först.** |
| `<name>.captions.ass` | Brännbar brand-undertext |
| `<name>.shots.json` | Shot-prompts (mata till Higgsfield) |
| `<name>.mp4` | Färdig annons (endast live) |
| `_manifest.json` | Körningens resultat |

## Struktur
| Fil | Vad |
|-----|-----|
| `waves/wave-01.mjs` | Vågens koncept: premise + shots (beat/prompt/motion/caption) + endcard |
| `storyboard.mjs` | Bygger storyboard, `.ass`-captions och endcard (0 API) |
| `higgsfield-video.mjs` | Anropar Higgsfields video-endpoint per shot → video-URL |
| `compose.mjs` | ffmpeg: stitch + bränn captions + endcard |
| `brand.mjs` | Video-canvas + caption-stil (färger delas med static-pipelinen) |
| `run.mjs` | Orchestrator |

## Arbetsflödet
1. `npm run dry` → öppna `storyboard.md`, läs manuset, rätta captions i `wave-01.mjs`.
2. Nöjd? `npm run gen` → Higgsfield + ffmpeg bygger `.mp4`.
3. Ladda upp till SnarkLös som **PAUSED** ad, döp enligt namnkonventionen, logga hypotesen
   i `docs/ad-tracker.md`.
4. När datan kommer: skär per `angle`/`hook`, verdict → skala / iterera / döda.

## ⚠️ Innan live
- **Higgsfield video-endpoint:** bekräfta exakt endpoint + fältnamn i `higgsfield-video.mjs`
  mot din dashboard (kan sättas via `HF_T2V_ENDPOINT` / `HF_I2V_ENDPOINT`).
- **Materialfrågan (koncept A):** lås inte "river inte emaljen"-claimet förrän Masterns
  huvudmaterial är verifierat (se `docs/bof-concepts.md`).
- Vill du animera en befintlig Soul-still istället för text2video? Sätt `startFrameUrl`
  på shoten → wrappern kör image2video.
