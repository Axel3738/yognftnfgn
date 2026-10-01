# Värmesulorna → Varmesåler NO (2026-09-29)

**Status:** 12 av 12 videor klara, 4 bilder klara, Drive klart. Inget är launchat (bara --dry).

- Norsk produkt: "Varmesåler Med Fjernkontroll – Varme Føtter På Jaktposten", **799 kr** (før 1039 kr, −23 %).
- COGS: batch-sheet #12, NORWAY Qty 1 = **28,51 EUR** (16,62 + 11,89) × 10,8367 = 308,95 NOK ⇒ **BE-ROAS 1,63**.
- Kampanj: `Varmesåler NO | BE-ROAS 1,63 | 2026-09-29` (konfig `pipeline/waves/no-varmesulorna-video.config.mjs`), ingen dubblett i NO-kontot. Video-dry grönt.
- Röst: ElevenLabs "Martin - Clear and Comforting" (eleven_v3) på alla 12 — alla källtalare män (~93–105 Hz, även G). Ingen HeyGen.
- Kedja: Scribe (svenska) → srt-sv/ → claude-sonnet-5 via API (norska, tale + tekst) → regexgrind grön → srt-no/ → omdubb → no-captions → röstkoll ✅ på alla 12.
- Captions: auto-band för CS/SP/PD_1_H2–H3; `--band=1225:1400` för G ×3 och PD_1_H1 (källtexten sitter på 1250–1360). G_1_H2/H3 exit 3 = engelsk tryckt text på sålen ("Do not cut below this line"), ingen svenska — kontrollerat på helbildsark.
- ElevenLabs: 75 unika repliker, **3 003 TTS-tecken** (delad cache `tts-cache/`) + Scribe på 12 videor.
- Bilder: 4 st (`images/no/varmesulorna_<K>_2_1_NO.png`), kie nano-banana-edit + PIL. PD: kie lämnade en vit ruta på sålen — lagad med PIL.
- Drive: `NO 11 Värmesulorna` = 1QjsKwUnQiZ7-ig2pOwMD6d0GdBKXeXxx (12 mp4, 4 png, 4 ADCOPY-txt).

## Rättelser
- Svenska priser 869/1139 → 799/1039 NOK; "24 % RABATT" → 23 % (butikens riktiga).
- Borttaget (ej belagt): "Bara idag", "Lagret går snabbt", "Snart slutsålda", "Beställ innan de är slut", "Tusentals svenskar", "produkten alla pratar om", kundcitat "Verifierad kund, 52 år" + stjärnor (SP-bild), "Värm dem på 3 sekunder" (PD-bild → "Varme med ett trykk").
- Ersatt med: "Nå på salg", "Før vinteren kommer", "Spar 240 kr", "Bestill via lenken", "Jeg har frosset på beina hver eneste vinter".

## Öppet
- `no-image-ads.mjs --dry` stoppar på "kampanjen finns inte" — väntat, kräver att videokampanjen skapats först.
- Agent-verktyget fanns inte: sonnet kördes via API (samma väg som Täljset).
