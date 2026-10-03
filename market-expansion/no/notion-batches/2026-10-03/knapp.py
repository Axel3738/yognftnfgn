#!/usr/bin/env python3
"""Ritar om CTA-knapparna som riktiga pillar, efter att batchdrivaren kört.

⛔ **Knappen går aldrig genom `rita_box` med `fyll: "mork"`.** Mätt i dag på
`Takoverdrag_PD_10_2`: överstyrningen bar `radie: 53` på en 107 px hög ruta,
alltså en full pill, och ändå kom knappen ut som en REKTANGEL med ett par
pixlars hörnradie. Orsaken är densamma som 2026-09-30 och 2026-10-01: suddningen
körs före plattan och fyller formens LJUSA pixlar med knappfärgen, och pillrets
rundade hörn är just ljusa (den ljusa sidan runt om). Pillen ritas därför här,
från KÄLLBILDEN:

  1. knappens ruta kopieras tillbaka från den svenska bilden, så underlaget är
     exakt det foto som låg där,
  2. pillen ritas med uppmätt färg och radie = halva höjden,
  3. den norska texten sätts centrerad i kalibrerad storlek.

Pillen breddas symmetriskt om den norska texten behöver mer plats — aldrig
smalare, så den svenska alltid täcks helt.

  python3 market-expansion/no/notion-batches/2026-10-03/knapp.py
"""
import json
import os

import numpy as np
from PIL import Image, ImageDraw, ImageFont

B = os.path.dirname(os.path.abspath(__file__))
FET = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"

# bild → (svensk källa, målnamn, knappruta, pillfärg)
KNAPPAR = {
    "Takoverdrag_PD_10_2": ("Takovertrekk_NO_PD_10_2", [294, 1201, 787, 1308], [24, 72, 120]),
    "Takoverdrag_PD_10_3": ("Takovertrekk_NO_PD_10_3", [294, 1201, 787, 1308], [24, 72, 120]),
    "Taljset_BOF_2_1": ("Spikkesett_NO_BOF_2_1", [259, 1200, 820, 1308], [24, 72, 120]),
}
_matare = ImageDraw.Draw(Image.new("RGB", (8, 8)))


def kalibrera(text, bredd_px, hojd_px):
    """Fontstorleken vars feta bläck ligger närmast den uppmätta knapptexten."""
    bast = None
    for st in range(18, 80):
        f = ImageFont.truetype(FET, st)
        bb = f.getbbox(text)
        w, h = bb[2] - bb[0], bb[3] - bb[1]
        fel = abs(w - bredd_px) / max(bredd_px, 1) * 2 + abs(h - hojd_px) / max(hojd_px, 1)
        if bast is None or fel < bast[0]:
            bast = (fel, st, w, h)
    return bast


def main():
    se = json.load(open(f"{B}/se-texter-kalla.json", encoding="utf-8"))["bilder"]
    no = json.load(open(f"{B}/oversatt-output-kalla.json", encoding="utf-8"))["bilder"]

    for svnamn, (malnamn, rutan, farg) in KNAPPAR.items():
        kalla = Image.open(f"{B}/se/{svnamn}.jpg").convert("RGB")
        bild = Image.open(f"{B}/no/{malnamn}.jpg").convert("RGB")
        x0, y0, x1, y1 = rutan
        former = {f["id"]: f for f in se[svnamn]["former"]}
        svtext = former["knapp"]["rader"][0]
        notext = no[svnamn]["knapp"]["rader"][0]

        # Knapptextens egen bläckruta i den svenska bilden — mät, gissa inte.
        # ⚠️ Mätningen måste ske INUTI pillen. Första versionen läste hela
        # knapprutan, och då räknades det ljusa gruset runt om som text: höjden
        # blev 109 px i stället för 44, texten hamnade överst i pillen och
        # storleken blev fel. Insteget är så stort att pillens rundade ändar
        # aldrig kommer med.
        INSTEG_X, INSTEG_Y = 40, 16
        g = np.asarray(kalla.convert("L")).astype(int)[
            y0 + INSTEG_Y:y1 + 1 - INSTEG_Y, x0 + INSTEG_X:x1 + 1 - INSTEG_X]
        ljus = g > 200                      # vit text på mörk pill
        rader = np.nonzero(ljus.any(axis=1))[0]
        kol = np.nonzero(ljus.any(axis=0))[0]
        # ⚠️ Bredden är bläckets SPANN, inte antalet kolumner med bläck.
        # `len(kol)` hoppar över mellanrummen mellan orden: "Se alla nio
        # storlekar." mätte 300 px i stället för 403, och knapptexten
        # kalibrerades därför till 31 px när den skulle vara 40.
        th = int(rader[-1] - rader[0]) + 1
        tw = int(kol[-1] - kol[0]) + 1
        ink_y0 = y0 + INSTEG_Y + int(rader[0])   # absolut y där bläcket börjar
        fel, st, w, h = kalibrera(svtext, tw, th)
        font = ImageFont.truetype(FET, st)
        nb = font.getbbox(notext)
        now = nb[2] - nb[0]

        # 1. underlaget tillbaka från källbilden, med marginal för antialias
        m = 6
        bild.paste(kalla.crop((x0 - m, y0 - m, x1 + m, y1 + m)), (x0 - m, y0 - m))

        # 2. pillen, breddad bara om norskan behöver det
        bredd = max(x1 - x0, int(now / 0.72))
        mitt = (x0 + x1) // 2
        px0, px1 = mitt - bredd // 2, mitt + bredd // 2
        lager = Image.new("RGBA", bild.size, (0, 0, 0, 0))
        ImageDraw.Draw(lager).rounded_rectangle(
            [px0, y0, px1, y1], radius=(y1 - y0) // 2, fill=tuple(farg) + (255,))
        bild = Image.alpha_composite(bild.convert("RGBA"), lager).convert("RGB")

        # 3. texten, på samma bläckhöjd som den svenska
        d = ImageDraw.Draw(bild)
        d.text(((px0 + px1) / 2, ink_y0 - nb[1]), notext, font=font,
               anchor="ma", fill=(255, 255, 255))
        bild.save(f"{B}/no/{malnamn}.jpg", quality=92)
        print(f"  {malnamn:26} pill {px0}..{px1} radie {(y1-y0)//2}  text {st}px "
              f"(sv {tw}×{th} px @ y{ink_y0}, no {now} px, avvikelse {fel:.3f})")


if __name__ == "__main__":
    main()
