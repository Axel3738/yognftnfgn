# Värmesits 45 × 90 cm → Varmesete NO (2026-09-29)

**Läge: klar för launch, inget launchat.** Bara `--dry` körd (enligt uppdraget).

- Norsk sida: https://beverbutikken.no/products/varmesete-45-90-cm-4-varmesoner-usb-drevet — 719 NOK, før 939 NOK (23 %, spar 220).
- COGS NO: 25,76 EUR (batch-sheet #10, NORWAY-blocket, Qty 1, räknat på 45×90) × 10,8367 (open.er-api, 2026-09-29) = 279,15 NOK ⇒ **BE-ROAS 1,63**.
- Kampanj (konfig): `Varmesete NO | BE-ROAS 1,63 | 2026-09-29`, `pipeline/waves/no-varmesits-video.config.mjs`, 4 adsets (PD/SP/CS/G), allt ACTIVE, CBO 1000 kr/dag. Dubblettkoll: ingen varmesete-kampanj i act_1050941584152547.
- Videor: 11 av 11 klara i `final/` (CS_1_H1–H3, G_1_H1–H3, PD_2, PD_3, SP_1_H1–H3). Röst ElevenLabs "Martin - Clear and Comforting" (eleven_v3) på alla, eftersom alla källtalare är män (~100–110 Hz). Ingen HeyGen.
- Captions: `no-captions.py --band=1190:1300` (den automatiska mätningen missade källans ordcaptions på y≈1210–1280). QA-bilderna är lästa, ingen svensk text syns. Slutkortssvepet är rent (inga slutkort).
- Röstkoll: ✅ på alla 11 (omtajmade 8–29 % längre).
- ElevenLabs: 55 unika repliker, 2 266 tecken (identiska repliker återanvändes mellan H1/H2/H3). Kontot 66 697 → 70 696 använda under körningen (då körde även andra agenter).
- Bilder: 4 st (`images/varmesits_<K>_2_1_NO.png`), Kie-rensade och med PIL-text. Jag har tittat på alla fyra.
- Drive: `MAKE TO NORWAY/NO 10 Värmesits 45 × 90 cm` (1L2mzuU9JodZCRawlVMvXIIibDnjllMsi). Där ligger 11 videor, 4 bilder och 4 ADCOPY_NO_<K>.txt.

## Rättelser mot källan
- CS: "bara i dag", "lagret är nästan slut" och "nästan slutsåld" är obelagda. De är ersatta med sant pris och sann rabatt, "30 dagers åpent kjøp" och "Ikke sitt og frys en dag til". Badgen "Nästan slutsåld" i bilden är ersatt med "30 dagers åpent kjøp".
- Priserna 779/599/180 SEK är bytta mot 939/719/220 NOK.
- SP_1_H2: "Svenskar har redan skaffat…" är ändrat till "Mange har allerede skaffet seg dette…".
- SP_1_H3: "Sen läste jag recensionerna" är ändrat till "Så prøvde jeg det selv". "Det de skriver är ungefär samma sak" är ändrat till "Og grunnen er ganske enkel".
- SP-adcopyn och SP-bilden: källans platshållarcitat ("[Äkta kundcitat]", "Verifierad kund, [ålder] år") och stjärnorna är borttagna. De är ersatta med fakta och garantin.
- PD-adcopyn: "powerbank (følger ikke med)" är tillagt, som det står på produktsidan.

## Öppet
- `no-image-ads.mjs --dry` kan inte bli grön än. Den kräver att kampanjen finns, alltså att `no-video-launch.mjs` körts skarpt först.
- Agent-verktyget var avstängt. Därför skrev huvudsessionen den norska copyn själv, inte en sonnet-subagent.
- "Brettes sammen / får plass i sekken" (PD) kommer från källvideon och den svenska copyn. Den står inte på den norska produktsidan.
- Undermappen "Test 2 – handväskan (powerbank-vinkeln)" är tom i Drive, så det blev inget eget koncept.
- Omdubben kastar källans musik, så videorna har bara röst.
