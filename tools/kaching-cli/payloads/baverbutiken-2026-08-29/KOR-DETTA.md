# Kör detta — Nya produkter Baverbutiken, launchbatch 2026-08-29

Butik: **baverbutiken** · 14 bundles · genererad 2026-08-29

Kör allt från mappen `tools/kaching-cli/`. Har du inte loggat in på den här datorn förut:

```bash
npm install
node kaching.mjs login
node kaching.mjs blocks --store baverbutiken
```

## 1. Granska först (rör inget i butiken)

```bash
for f in payloads/baverbutiken-2026-08-29/*.json; do node validate-payload.mjs "$f" | grep -q '^FEL' && echo "FEL i $f"; done; echo "granskning klar"
```

## 2. Skapa bundlarna

Varje `create` läser tillbaka det den skrev och rapporterar avvikelser automatiskt.
Vill du se dem som utkast först: lägg till `--draft`.

```bash
node kaching.mjs create --store baverbutiken --file payloads/baverbutiken-2026-08-29/magnethylla-for-tvattmaskin-och-kylskap-forvaring-utan-borr.json
node kaching.mjs create --store baverbutiken --file payloads/baverbutiken-2026-08-29/palsborste-till-dyson-dammsugare-borsta-och-sug-i-samma-drag.json
node kaching.mjs create --store baverbutiken --file payloads/baverbutiken-2026-08-29/3d-sandbild-20-cm-nytt-landskap-varje-gang-du-vander-den.json
node kaching.mjs create --store baverbutiken --file payloads/baverbutiken-2026-08-29/veckodosett-21-fack-morgon-middag-och-kvall-i-sju-dagar.json
node kaching.mjs create --store baverbutiken --file payloads/baverbutiken-2026-08-29/medicinask-i-fickformat-7-fack-med-tatslutande-lock.json
node kaching.mjs create --store baverbutiken --file payloads/baverbutiken-2026-08-29/somnadskit-104-delar-allt-i-ett-fodral.json
node kaching.mjs create --store baverbutiken --file payloads/baverbutiken-2026-08-29/motocentric-bakvaska-37-l-hjalmen-gar-i-vaskan.json
node kaching.mjs create --store baverbutiken --file payloads/baverbutiken-2026-08-29/magnetplattor-i-storformat-byggset-i-lada-med-handtag.json
node kaching.mjs create --store baverbutiken --file payloads/baverbutiken-2026-08-29/kasta-fanga-set-4-korgar-och-bollar-pa-lina.json
node kaching.mjs create --store baverbutiken --file payloads/baverbutiken-2026-08-29/glasspints-med-lock-2-pack-gor-glassen-direkt-i-burken.json
node kaching.mjs create --store baverbutiken --file payloads/baverbutiken-2026-08-29/luffarschack-i-tra-klassikern-som-ligger-framme.json
node kaching.mjs create --store baverbutiken --file payloads/baverbutiken-2026-08-29/bankhylla-med-utdragbar-korg-dubbel-yta-pa-samma-bank.json
node kaching.mjs create --store baverbutiken --file payloads/baverbutiken-2026-08-29/diskstall-i-tva-vaningar-hela-diskens-torkyta-pa-42-cm.json
node kaching.mjs create --store baverbutiken --file payloads/baverbutiken-2026-08-29/arbetslampa-for-makita-batteri-15-led-med-usb-uttag.json
```

## Vad som byggs

| Produkt | Stege | Nivåer |
|---|---|---|
| Magnethylla för Tvättmaskin och Kylskåp | Standardstege | 1 st ord. · 2 st −15 % · 3 st −20 % |
| Pälsborste till Dyson-dammsugare | Standardstege | 1 st ord. · 2 st −15 % · 3 st −20 % |
| 3D-sandbild 20 cm | Standardstege | 1 st ord. · 2 st −15 % · 3 st −20 % |
| Veckodosett 21 Fack | Standardstege | 1 st ord. · 2 st −15 % · 3 st −20 % |
| Medicinask i Fickformat | Standardstege | 1 st ord. · 2 st −15 % · 3 st −20 % |
| Sömnadskit 104 Delar | Standardstege | 1 st ord. · 2 st −15 % · 3 st −20 % |
| Motocentric Bakväska 37 L | Standardstege | 1 st ord. · 2 st −15 % · 3 st −20 % |
| Magnetplattor i Storformat | Standardstege | 1 st ord. · 2 st −15 % · 3 st −20 % |
| Kasta & Fånga-set | Standardstege | 1 st ord. · 2 st −15 % · 3 st −20 % |
| Glasspints med Lock 2-pack | Standardstege | 1 st ord. · 2 st −15 % · 3 st −20 % |
| Luffarschack i Trä | Standardstege | 1 st ord. · 2 st −15 % · 3 st −20 % |
| Bänkhylla med Utdragbar Korg | Standardstege | 1 st ord. · 2 st −15 % · 3 st −20 % |
| Diskställ i Två Våningar | Standardstege | 1 st ord. · 2 st −15 % · 3 st −20 % |
| Arbetslampa för Makita-batteri | Standardstege | 1 st ord. · 2 st −15 % · 3 st −20 % |
