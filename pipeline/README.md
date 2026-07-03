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

## Att lägga till en ny annons
Lägg ett objekt i en `waves/wave-XX.mjs` med `name` (enligt namnkonventionen),
`basePrompt` (engelska, lämna mörk tomyta där texten ska ligga) och `overlay`
(`headline`, valfri `badge`, valfri `footer`, `position: 'top'|'bottom'`).

## Nästa steg (roadmap)
- Auto-push av godkända statics till SnarkLös-kontot som PAUSED ads (via ADsmanager).
- Hämta insights per ad-namn → skriv tillbaka resultat i `docs/ad-tracker.md`.
- Video-varianter via Higgsfields video-endpoints för before/after-demos.
