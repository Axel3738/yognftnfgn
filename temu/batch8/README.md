# Batch 8 — offert "9" (2026-09-11)

Offert: https://docs.google.com/spreadsheets/d/1JT9sfbbrFnbBr2FE8iR36Z5xdvZDL7rQrGzIKIIQ6iE
Axel: *"Dessa ska upp på bäverbutiken. Både svenska och norska."*

**9 rader i arket, 7 med quote, 6 byggda** (SE + NO, biltvättborsten bara SE).

| id | SE | NO | Läge |
|---|---|---|---|
| sotarset | 459 | 389 | ✅ |
| vedborr | 369 | 299 | ✅ |
| tofflor (16 varianter: 2 färger × 40–47) | 489 | 429 | ✅ — **inomhustofflor**, Axels beslut |
| solcellslampa (210 LED, EN lampa) | 589 | 559 | ✅ |
| bilborste (100 cm) | 829 | — | ✅ bara SE — CWD: OVERSIZE till Norge |
| fonsterlarm | 449 | 389 | ✅ |
| hangrannerensare | (419) | (339) | ⛔ ingen bild, AliExpress blockerat, ACME-gänga |
| båtkapellstång | — | — | ⛔ ingen quote |

## Filerna
- `fakta.mjs` — låsta fakta, SKU, verifierade kategori-GID. **Facit för all copy.**
- `priser.mjs` — prismatrisen ur CSV:n (explicita radindex — arket har undertitelrader).
- `bilder-<id>.mjs` — rensar leverantörsbilden, bygger hero/detalj/fakta SV+NO.
- `copy.json` — färdig copy per produkt och språk (byggd av Sonnet-skribenter,
  faktagranskad och norskkorrläst, 58 rättningar + larmets bullet 1/3 omskrivna).
- `skapa.mjs <se|no> [--skarp] [id]` — skapar produkten med 5 bilder, beskrivning i
  7-blocksordningen, varianter, cogs, publicering.

## Lärdomar
- **Offertarkets xlsx-export numrerar om bilderna mellan exporter** (`image4.png`
  blev `image4.jpg` osv.). Mappa alltid via `xl/drawings/drawing1.xml` + rels till
  rad/kolumn, aldrig på filnamn.
- **Två bilder på två olika lampor i samma rad:** måttbilden (14,1 cm panel) visade
  74-LED-varianten, CWD offererade 210-LED. Måtten användes inte.
- **Temu-länkarna i arket bär `top_gallery_url`** — huvudbilden går att hämta
  därifrån även när själva Temu-sidan svarar med tomt skal.
- **AliExpress är blockerat från molnet på alla vägar** (curl 5 URL-former × 2 UA,
  WebFetch → cookie-loop, headless Chrome i Higgsfields sandbox → CAPTCHA-slider).
  `alicdn.com` svarar dock — en bild-URL eller skärmdump från Axel räcker.
- **Containeromstart raderar `/tmp` och kan byta HEAD** — pushade skript räddade
  batchen. AI-bilder/videor går att hämta igen via Higgsfields `show_generations`
  (CDN-URL:erna lever kvar).
- `temu/package.json` ändras av `npm i` (sharp 0.35.3 → 0.35.4) — återställ, committa inte.
