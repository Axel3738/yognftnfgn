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
npm run voices                       # lista rösterna på ditt konto (namn + id)
npm run vo:dry                       # förhandsgranska manus + teckenantal UTAN API
npm run vo                           # skarpt: genererar mp3 för hela vågen
node vo.mjs --wave=01                # välj manus-fil (scripts/vo-01.mjs)
node vo.mjs --only=VO-01             # bara klipp vars namn matchar
node vo.mjs --limit=2                # bara N första
node vo.mjs --text="Hej [glad] där" --name=test   # engångsklipp utan manus-fil
```
Output hamnar i `output/vo-XX/` + ett `_manifest.json`.

## Struktur
| Fil | Vad |
|-----|-----|
| `elevenlabs.mjs` | Tunn wrapper mot ElevenLabs TTS → mp3-Buffer. Slår upp röst-ID på namn. |
| `vo.mjs` | Runner: kör en manus-våg, sparar MP3:er. |
| `scripts/vo-01.mjs` | En manus-våg: `name` + `text` per klipp. |

## Att lägga till en voiceover
Lägg ett objekt i en `scripts/vo-XX.mjs` med `name` och `text` (svenska — det som
ska läsas upp; audio-tags i `[hakparentes]` färgar leveransen men läses inte upp).
Valfritt `voice`/`model` per klipp om du vill avvika från default. Max ~3000 tecken
per klipp (eleven_v3).
