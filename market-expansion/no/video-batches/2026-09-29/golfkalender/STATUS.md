# Golfkalender → Golf Adventskalender NO (2026-09-29)

**Status:** 12 av 12 videor klara, 4 bilder klara, Drive klart. Inget är launchat (bara --dry).

- Norsk produkt: "Golf Adventskalender – 24 Golftilbehør", **619 kr** (før 809 kr, −23 %, spar 190 kr).
- COGS: Kalenderkungen Batch (149zfEDO…), rad "Golf advent calendar", NORWAY Qty 1 = **18,58 EUR** (9,08 + 9,50) × 10,8367 = 201,35 NOK ⇒ **BE-ROAS 1,48**.
- Kampanj: `Golfkalender NO | BE-ROAS 1,48 | 2026-09-29` (konfig `pipeline/waves/no-golfkalender-video.config.mjs`). Ingen kampanj med "golf" i NO-kontot. Video-dry grönt.
- Röst: ElevenLabs "Martin - Clear and Comforting" (eleven_v3) på alla 12 — alla källtalare män (~110–129 Hz). Ingen HeyGen.
- Kedja: Scribe (svenska) → srt-sv/ → claude-sonnet-5 via API (Agent-verktyget fanns inte) → regexgrind grön → srt-no/ → omdubb → no-captions → röstkoll ✅ på alla 12.
- Captions: band 1233:1399 på alla (SP×3 fick exit 3 med standardbandet, omkörda med --band). QA-bilder lästa: ingen svensk text, slutkorten rena.
- ElevenLabs: **2 728 TTS-tecken** (75 064 → 77 792 av 100 017) + Scribe på 12 videor.
- Bilder: CS (vit panel ommålad med PIL), PD (kie nano-banana-edit tog bort engelsk text, PIL "24 luker med golftilbehør"), G och SP oförändrade (ingen text i bild utom förpackningen).
- Drive: `NO K Golfkalender` = 18w_5Jy0K0b4rKpRpHQRJQN_pOsqba1ZD (12 mp4, 4 png, 4 ADCOPY-txt).
- Batch #1-undermappen: 18 undermappar, alla tomma (eller ej länkdelade) — inget att översätta.

## Rättelser
- Svenska priser 549/719/170 → 619/809/190 kr.
- Bild CS: "50 % RABATT – IDAG, BEGRÄNSAT ANTAL" (falskt) → "23 % RABATT, NÅ 619 KR, FØR 809 KR".
- Borttaget (ej belagt): "Erbjudandet gäller bara i dag", "Nästan slutsåld", "innan priset går upp", "innan den tar slut", "Nöjda kunder har redan beställt", "Många säger att det var den roligaste presenten", "blivit en favorit", "alla golfare pratar om", "det säger kunderna", "[X] golfare", kundcitat/stjärnor, "Julens roligaste golfgåva".
- "Poängräknare" finns inte i butikens innehållslista → "grooveverktøy"/"nøkkelringer". "Pitchgaffel" → "greenreparatør". "Golfbågen" (Scribe) → "golfbagen".
- Ersatt med: "Nå på salg", "Ferdig fylt, ingenting å fylle selv", "Golfballer, peger og et håndkle med klips", "Én eske å pakke inn, ikke 24 gaver", "for voksne og tenåringer som spiller golf".

## Öppet
- `no-image-ads.mjs --dry` stoppar på "kampanjen finns inte" — väntat, kräver att videokampanjen skapats först.
- Omdubben kastar källans musik (bara röst). G-videorna blev 27–36 % längre än källan (inga segment utanför 70–135 %).
- Videon visar gröna golfstrumpor som inte står i butikens innehållslista (bild ur källan, inget påstås i tal/text).
