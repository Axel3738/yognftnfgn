# Ad-pipeline — Higgsfield + textoverlay

Genererar färdiga bildannonser (4:5, 1080×1350) för Mastern.

**Två steg:** Higgsfield Soul genererar en fotorealistisk bas-bild (med tom yta) →
`compose.mjs` lägger punchlinen som knivskarp vektortext ovanpå. Modellen slipper rendera
text (som den är dålig på); lines:en blir pixelperfekta.

## Setup
```bash
cd pipeline
npm install
```

### Koppla Higgsfield (krävs för skarp generering)
Sätt nycklarna i miljön (helst som secrets i environmentet, inte i kod):
```bash
export HF_API_KEY="din_key_id"
export HF_SECRET="din_key_secret"
```
Nycklar skapas på cloud.higgsfield.ai → dashboard → API.

## Kör
```bash
npm run dry            # förhandsgranska layout/typografi UTAN Higgsfield (charcoal-bakgrund)
npm run gen            # skarpt: Higgsfield-bas + overlay
node run.mjs --wave=02 # välj våg
```
Output hamnar i `output/wave-XX/` + ett `_manifest.json`.

## Struktur
| Fil | Vad |
|-----|-----|
| `waves/wave-01.mjs` | En vågs annonser: base-prompt + overlay-lines (från `docs/winning-lines.md`) |
| `higgsfield.mjs` | Anropar Soul text2image, returnerar bild-URL |
| `compose.mjs` | Lägger scrim + rubrik + badge + footer som SVG-text |
| `brand.mjs` | Färger, typsnitt, canvas-storlek — ändra här |
| `run.mjs` | Kör hela vågen, sparar PNG:er |
| `voiceovers/vo-01.mjs` | En vågs voiceovers: `name` + `text` (manus från `docs/winning-lines.md`) |
| `elevenlabs.mjs` | Anropar ElevenLabs TTS, returnerar mp3-Buffer |
| `vo.mjs` | Kör hela voiceover-vågen, sparar MP3:er |

---

# Voiceover — ElevenLabs (röst + tal)

Genererar färdiga voiceover-klipp (mp3) för video-annonser. **Default: rösten
`Svensk Martin` + modellen `eleven_v3`** (mest uttrycksfull, 70+ språk, förstår
audio-tags som `[paus]`, `[allvarligt]`, `[viskar]` mitt i texten).

### Koppla ElevenLabs
Sätt nyckeln i miljön (helst som secret i environmentet, inte i kod):
```bash
export ELEVENLABS_API_KEY="din_key"   # alias XI_API_KEY funkar också
```
Nyckel skapas på elevenlabs.io → Profile → API Keys. Röst-ID:t för `Svensk Martin`
slås upp automatiskt på namn — inget att hårdkoda. (Vill du tvinga ett specifikt
ID: `export ELEVEN_VOICE_ID="..."`.)

### Kör
```bash
npm run voices                       # lista rösterna på ditt konto (namn + id)
npm run vo:dry                       # förhandsgranska manus + teckenantal UTAN API
npm run vo                           # skarpt: genererar mp3 för hela vågen
node vo.mjs --wave=01                # välj våg
node vo.mjs --only=VO-101            # bara klipp vars namn matchar
node vo.mjs --text="Hej [glad] Mastern" --name=test   # engångsklipp utan våg-fil
```
Output hamnar i `output/vo-XX/` + ett `_manifest.json`.

### Att lägga till en voiceover
Lägg ett objekt i en `voiceovers/vo-XX.mjs` med `name` (enligt namnkonventionen)
och `text` (svenska — det som ska läsas upp; audio-tags i `[hakparentes]` färgar
leveransen men läses inte upp). Valfritt `voice`/`model` per klipp om du vill
avvika från default. Max ~3000 tecken per klipp (eleven_v3).

## Att lägga till en ny annons
Lägg ett objekt i en `waves/wave-XX.mjs` med `name` (enligt namnkonventionen),
`basePrompt` (engelska, lämna mörk tomyta där texten ska ligga) och `overlay`
(`headline`, valfri `badge`, valfri `footer`, `position: 'top'|'bottom'`).

## Nästa steg (roadmap)
- Auto-push av godkända statics till SnarkLös-kontot som PAUSED ads (via ADsmanager).
- Hämta insights per ad-namn → skriv tillbaka resultat i `docs/ad-tracker.md`.
- Video-varianter via Higgsfields video-endpoints för before/after-demos.
