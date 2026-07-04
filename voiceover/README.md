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
brödtexten `body`.
```
scripts/
├── A_pain_ruinsgrill/        H1  H2  H3  body   ← "stålborsten förstör din grill"
├── B_authority_specsheet/    H1  H2  H3  body   ← "ingen marknadsföring, bara specen"
├── C_benefit_beforeafter/    H1  H2  H3  body   ← "90 sek: svart → skinande"
├── D_offer_garanti/          H1  H2  H3  body   ← "30 dagars öppet köp"
├── E_benefit_10sasonger/     H1  H2  H3  body   ← "byggd för 10 säsonger"
└── F_offer_bundle/           H1  H2  H3  body   ← "borste + polerhuvud på köpet"
```
Annonserna motsvarar koncepten A–F i `docs/ad-tracker.md` (G/legend hoppas över — TOF).

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
