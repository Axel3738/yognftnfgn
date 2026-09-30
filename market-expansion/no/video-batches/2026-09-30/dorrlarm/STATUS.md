# Dörr- och Fönsterlarm 110 dB → Dør- og Vindusalarm NO (2026-09-30)

**Status:** 12 av 12 videor klara (rostkoll ✅), 4 bilder klara, Drive klart. Inget launchat (bara --dry, grönt).

- Norsk produkt: `dor-og-vindusalarm-110-db-tradlos-fjernkontroll`, **389 kr** (før 509 kr, 23,6 % ≈ "24 %").
- COGS: Norway Qty1 13,79 EUR × 10,8367 = 149,43 NOK ⇒ BE-ROAS 1,62 (räknat) / 1,63 (Axels uppgift, används i kampanjnamnet).
- Kampanj: `Dør- og Vindusalarm NO | BE-ROAS 1,63 | 2026-09-30`, konfig `pipeline/waves/no-dorrlarm-video.config.mjs`. Annonsnamn `DorLarm_NO_<K>_1_H<n>`.
- Röst: ElevenLabs "Martin - Clear and Comforting" på alla 12 (alla källtalare män, 95–110 Hz). Ingen HeyGen.
- Kedja: Scribe → sonnet-5 (API) → regexgrind → omdubb → no-captions (G och PD med --band=1225:1415, övriga standardband) → rostkoll. QA-bilder lästa: ingen svensk text kvar.
- ElevenLabs-tecken: ca 6 145 TTS-tecken (manus) + Scribe på 12 videor. Räknaren visade 78 505 före och 7 352 efter (verkar ha nollställts/bytt period), så mät om.
- Bilder: CS (PIL på original), G/SP (kie nano-banana-edit + PIL), PD (original + rubrikremsa från kie, eftersom kie tog bort fjärrkontrollens knappar).
- Drive: `NO 8 Dörr- och Fönsterlarm 110 dB` = 1J9DEvwKOpn6WGQvLy4Eu6nmNKVC9WHfJ (12 mp4, 4 png, 4 ADCOPY-txt).

## Rättelser
- Svenska priser 589/449 → 509/389 kr, "24 %" → "nesten/rundt 24 %", "under femhundra" → "under fire hundre".
- Bort/utbytt (ej belagt): "bara idag", "lagret begränsat/säljer snabbt", "sätt upp på fem minuter", "grannarna hör det", "tipsat fem vänner", "hundratals hem", kundcitat + stjärnor + "Verifierad kund, 47 år" (bild SP), "Få kvar i lager – slutar snart" (bild CS), "14 dagars öppet köp" (→ 30 dagers åpent kjøp).
- Bild CS: "-24% IDAG" → "-24 % RABATT" + "30 DAGERS ÅPENT KJØP".

## Öppet
- "I dag"/"Nå er det rea" i CS-videorna kommer från källan (prisen 389 kr är butikens nuvarande pris, ingen tidsgräns påstås).
- SP-videorna är förstapersons-berättelse ("kjøpt en til mamma") ur källmanuset; inte statistik men inte belagd.
- Omdubben kastar källans musik (bara röst). Kvar för huvudsessionen: Meta-launch, `no-image-ads.mjs`.
