# Försvenskade skördebilder — grillöverdraget (Grillkliniken)

Slutversionerna som ligger i produkten (gid://shopify/Product/15651270558020).

**Metoden (lärdom 2026-08-29):** nano-banana (KIE AI) får ALDRIG stava svenska —
den skrev "OAVASTET ÄRSESTID", "Regnproof", "REUR SEASONS". Rätt flöde:

1. KIE används bara för att **ta bort** utländsk text (inpainting är pålitligt)
   eller när originaletiketterna kan behållas orörda.
2. Svensk text ritas som **skarp SVG-vektortext med sharp** ovanpå
   (samma filosofi som pipeline/compose.mjs). Text på slät yta (vit/enfärgad)
   behöver ingen KIE alls — täck med rektangel i samplad färg och rita om.
3. Text på texturerad yta: klona en bit ren textur från samma bild över ordet,
   rita sedan texten (se 02).

Skript från körningen: KIE-anrop = createTask/recordInfo mot api.kie.ai med
model "google/nano-banana-edit" (nyckel: KIE_API_KEY). GIF:ar ur skördvideon:
ffmpeg palettegen/paletteuse, 400 px, 8 fps, <4 MB.

| Fil | Original | Svensk text |
|---|---|---|
| 01-sv.jpg | 01.jpg | SKYDDA DIN GRILL / OAVSETT ÅRSTID (KIE tog bort engelskan, sharp ritade) |
| 02-sv-slutlig.jpg | 02.jpg | Tål snö / UV-skydd / Vindtät / Regntät (KIE bytte 3, sharp lagade 4:e) |
| 06-sv.jpg | 06.jpg | UV-TÅLIG FÄRG, Vårt håller färgen / Andra bleknar till grått (bara sharp) |
| 08-sv.jpg | 08.jpg | ETT SKYDD FÖR ALLA ÅRSTIDER + VÅR/SOMMAR/HÖST/VINTER (bara sharp) |

Ej använda ur skörden: 05 (måttbild, dubblett av egen storleksguide),
07 (Wide Application, dubblett av 03), 11 (Temu-storlekstabell, egen guide är
facit), 13 (främmande användarfoto).
