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

### Koppla Meta (Ads Manager)
Krävs för att ladda upp ads och styra Ads Manager via `ads.mjs`:
```bash
export META_ACCESS_TOKEN="..."   # system user-token med ads_management + ads_read
export META_PAGE_ID="..."        # Facebook-sidan (Grillkliniken) annonserna postas som
export META_IG_ID="..."          # valfritt: Instagram-konto för placeringar
export META_ACCOUNT="magi"       # valfritt: default-konto (magi | snarklos)
```
Token skapas i Meta Business Suite → Företagsinställningar → Användare → Systemanvändare:
skapa/välj systemanvändare → tilldela ad-kontona (SnarkLös + MagiBorsten) och sidan →
"Generera token" med behörigheterna `ads_management`, `ads_read`, `pages_read_engagement`.
Lägg helst värdena som secrets i environmentet, inte i kod.

## Kör
```bash
npm run dry            # förhandsgranska layout/typografi UTAN Higgsfield (charcoal-bakgrund)
npm run gen            # skarpt: Higgsfield-bas + overlay
node run.mjs --wave=02 # välj våg
```
Output hamnar i `output/wave-XX/` + ett `_manifest.json`.

## Styr Ads Manager
Allt som skapas är **PAUSED** — inget spenderar förrän du aktiverar i Ads Manager (eller kör `resume`).
```bash
node ads.mjs verify                                    # testa token + åtkomst till båda kontona
node ads.mjs campaigns --account=magi                  # lista kampanjer på MagiBorsten
node ads.mjs create-campaign --account=magi --name=MAGI_SALES_20260807
node ads.mjs create-adset --account=magi --campaign=ID --name=SE_BOF --budget=200
node ads.mjs push --account=magi --wave=01 --adset=ID  # ladda upp vågens statics som PAUSED ads
node ads.mjs push --wave=01 --dry                      # förhandsgranska vad som skulle skickas
node ads.mjs pause --id=AD_ID · resume --id=AD_ID      # pausa/aktivera ad/adset/kampanj
node ads.mjs insights --account=magi --date=last_7d    # spend/CTR/CPC per ad-namn
```
Ad-copyn (primärtext/headline/länk) per annons läggs som `copy: { message, headline, link }`
på objektet i `waves/wave-XX.mjs`; `--message=`/`--headline=`/`--link=` skriver över.

## Struktur
| Fil | Vad |
|-----|-----|
| `waves/wave-01.mjs` | En vågs annonser: base-prompt + overlay-lines (från `docs/winning-lines.md`) |
| `higgsfield.mjs` | Anropar Soul text2image, returnerar bild-URL |
| `compose.mjs` | Lägger scrim + rubrik + badge + footer som SVG-text |
| `brand.mjs` | Färger, typsnitt, canvas-storlek — ändra här |
| `run.mjs` | Kör hela vågen, sparar PNG:er |
| `meta.mjs` | Wrapper runt Meta Marketing API (konton, upload, kampanj/adset/ad, insights) |
| `ads.mjs` | CLI mot Ads Manager — push, pause/resume, listor, insights |

## Att lägga till en ny annons
Lägg ett objekt i en `waves/wave-XX.mjs` med `name` (enligt namnkonventionen),
`basePrompt` (engelska, lämna mörk tomyta där texten ska ligga) och `overlay`
(`headline`, valfri `badge`, valfri `footer`, `position: 'top'|'bottom'`).

## Nästa steg (roadmap)
- ~~Auto-push av godkända statics som PAUSED ads~~ ✅ `ads.mjs push` (SnarkLös + MagiBorsten).
- Hämta insights per ad-namn → skriv tillbaka resultat i `docs/ad-tracker.md` (`ads.mjs insights` finns, auto-skrivningen återstår).
- Video-varianter via Higgsfields video-endpoints för before/after-demos.
