# Voiceover — ElevenLabs

Fristående verktyg som genererar voiceover-klipp (mp3) med ElevenLabs.
**Ingen koppling till ad-pipelinen** — egen mapp, egen `package.json`.

**Default: rösten `Svensk Martin` + modellen `eleven_v3`** (mest uttrycksfull,
70+ språk, förstår audio-tags som `[paus]`, `[allvarligt]`, `[viskar]` mitt i texten).

## Setup
```bash
cd voiceover
export ELEVENLABS_API_KEY="din_key"   # alias XI_API_KEY funkar också
```
Nyckel skapas på elevenlabs.io → Profile → API Keys. Inga npm-beroenden — verktyget
använder inbyggda `fetch`, så ingen `npm install` behövs.

Röst-ID:t för `Svensk Martin` slås upp automatiskt på namn — inget att hårdkoda.
(Vill du tvinga ett specifikt ID: `export ELEVEN_VOICE_ID="..."`.)

## Kör
```bash
npm run voices                            # lista rösterna på ditt konto (namn + id)
npm run vo:dry                            # förhandsgranska ALLA manus + teckenantal UTAN API
npm run vo                                # skarpt: genererar mp3 för alla annonser
node vo.mjs --ad=B_authority_specsheet    # bara en annons (matchar på delsträng)
node vo.mjs --only=H1                      # bara klipp vars filnamn matchar (t.ex. alla H1)
node vo.mjs --text="Hej [glad] där" --name=test   # engångsklipp utan manus-fil
```
Output speglar mappstrukturen: `output/<annons>/<klipp>.mp3` + ett `output/_manifest.json`.

## Struktur — en mapp per annons
Varje `.txt` är ett klipp; filnamnet blir mp3-namnet. Hooksen heter `H1`, `H2`… och
brödtexten `body`. Texten är **svenska verbatim ur creative-briefen** (round 2).
```
scripts/
├── C1_220_discovery-authority/   H1–H10  body   ← "vem uppfann den här / grillproffs"
├── C2_221_wire-brush-2026/       H1–H8   body   ← "använder du fortfarande stålborste 2026?"
├── C4_223_villain/               H1–H12  body   ← skurk-borsten monolog + SafeCore-hjälte
├── C5_224_social-proof/          H1–H11  body   ← "din granne använder redan den här"
├── C6_225_hack-reveal/           H1–H10  body   ← "knepet som förändrade allt"
├── C7_226_torture-test/          H1–H8   body   ← "vi smutsade ner med flit → blänkande rent"
└── C8_227_wrong-tool/            H1–H10  body   ← "du har använt fel borste hela tiden"
```
Annonserna är creatives #1–#8 ur PDF:en. **Creative #3 (222) är utelämnad** (var
text-on-screen utan VO). C7 kördes med en egen röst (annan än övrigas Martin).

| Fil | Vad |
|-----|-----|
| `elevenlabs.mjs` | Tunn wrapper mot ElevenLabs TTS → mp3-Buffer. Slår upp röst-ID på namn. |
| `vo.mjs` | Runner: går igenom `scripts/<annons>/*.txt`, sparar MP3:er. |
| `scripts/<annons>/*.txt` | Ett klipp per fil — själva manuset (det som läses upp). |

## Att lägga till / ändra
Skapa en mapp under `scripts/` för annonsen och lägg `.txt`-filer i den (`H1.txt`,
`body.txt` osv). Innehållet är svenskan som läses upp; audio-tags i `[hakparentes]`
(`[paus]`, `[allvarligt]`, `[glad]`) färgar leveransen men läses inte upp. Max ~3000
tecken per klipp (eleven_v3).
