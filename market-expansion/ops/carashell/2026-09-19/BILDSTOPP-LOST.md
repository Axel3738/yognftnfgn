# Bildöversättningen släppt 2026-09-19 — CaraShell takskyddet

Sex bilder som stod stilla sedan 2026-09-17 är översatta och uppladdade.
Det här är facit över vad som faktiskt var fel, eftersom två av de fyra
"felen" i `2026-09-17/BILDSTOPP.md` inte fanns.

## Rättelse av den 17:e och 18:e

Den 17:e skrev jag att `pipeline/oversatt-bild.py` inte suddar bort svensk
text på OPS-bilder. Den 18:e mätte jag och tog tillbaka det: suddningen
fungerar, mitt eget indata var fel. **I dag håller rättelsen.** Alla sex
bilderna gick igenom med verktyget som det är — inga glyfer ligger kvar.

Två av de fyra kvarvarande "verktygsfelen" var också fel ställda frågor:

| Påstått fel (17:e) | Vad det var |
|---|---|
| ★ saknas i Liberation Sans → tofu-rutor | Stjärnraden ska inte ritas om alls. Men `sudda()` suddar HELA formen så fort en enda rad i den listas — stjärnorna och "– Lars" försvann som bieffekt. `klipp_efter_rad` finns för precis det |
| Prisbrickan inuti den fullbreda remsan detekteras inte | Stämmer, men behöver ingen detektor: en `box` UTAN `fyll` suddar och ritar om just brickan, och `fyll_2d` målar lokalt så brickans två toner (237 över remsan, 254 i den) behålls |

## Två riktiga fel — båda rättade i verktyget

**1. `rita_box` kunde inte matcha ett band som redan finns i bilden.**
Fyllfärgen var hårdkodad till (248,248,248)/(10,14,18). OPS-mallens band är
[60,66,72]. Ny nyckel **`fyllfarg`: [r,g,b]** sätter plattans färg exakt.
Det löser också fullbreda rubriker över delade foton (`PD_6_1`): i stället
för att sudda mot en bakgrund som byter foto mitt i raden målas bandet om
ogenomskinligt i sin egen färg och rubriken ritas på det.

**2. 3 px utvidgning lämnar en läsbar gloria på stor fet text.**
Mätt på `PD_7_1`:s bottenband (31 px fet vit text på [60,66,72]): efter
suddningen hade rad 1087–1097 kvar **13 % kontrast på 10 % av pixlarna** —
synligt som en spökrad. Antialias-kanten ligger under tröskeln `summa > 450`
och nås inte av 3 px. Ny nyckel **`utvidga`** (standard 3) → 6 tar bort den:
max 4,8 % kontrast, 0 % av pixlarna över tröskeln.

## Regeln som föll ut av dagen

**Döm suddningen på mätning, aldrig på förhandsbilden.** Tre gånger i dag
visade förhandsbilden en spökrad. Två av dem mätte ≤ 4 % kontrast (0 pixlar
över tröskeln) och fanns inte i filen; en mätte 13 % och var verklig. Måttet
som skiljer dem:

```python
box = bild[y0:y1, x0:x1]; med = np.median(box.reshape(-1,3), axis=0)
d = np.abs(box - med).sum(axis=2)          # 0–765
# andel > 60 == 0 och max < 40  →  ingen spökrad
```

Det var samma felslut som den 17:e, och det kostade två dagars leverans.

## Vad som gäller per bild

| Annons | Grepp |
|---|---|
| `CS_6_1`, `CS_5_1` | former för band/rubrik + `box` utan `fyll` över prisbrickan |
| `SP_5_1`, `SP_7_1` | `klipp_efter_rad: 2` på citatkortet så stjärnraden står orörd, rad 2 ("– Lars") omlistad |
| `PD_7_1` | `box` med `utvidga: 6` på bottenbandet och vänsteretiketten (detektorn ser dem inte) |
| `PD_6_1` | `box` med `fyllfarg` + `alfa: 255` på topprubriken (delat foto), bottenbandet och vänsteretiketten |

Texterna ligger i `texter/<annons>.json` och går att köra om rakt av.
