# Soptunneklistermärken — AI-genererade produktbilder

Genererade 2026-08-25 på Axels begäran: enkla, tydliga produktbilder av
tecknade ansikts-klistermärken på soptunnor, för annonstester.

- **Produktreferens:** Temu-produkten "4 st PVC tecknade klistermärken för
  soptunnor" (ansikten: skrattande blinkning, tunga ut, glatt flin, ledsen
  gråtande). Referensbilden ligger som `ref-temu.jpg`.
- **Verktyg:** Kie.ai, modellen `google/nano-banana-edit` (Temu-bilden som
  referens så ansiktena matchar produkten) samt en bild med `google/nano-banana`
  (ren text-till-bild, `00-test-fyra-tunnor.png` — emoji-stil, avviker från
  produktens ansikten).
- **Stil:** medvetet "AI-slop"-vänligt — bilderna ska visa produkten tydligt
  och vara roliga, inte se handgjorda ut. Format 1:1, PNG.

Produkten finns **inte** i `products/products.json` ännu — detta är bara
bildmaterial. Ska den testas på riktigt: kör `/ny-produkt`.
