#!/usr/bin/env python3
"""Bygger overrides.json för de fem bilder vars text INTE ligger i en platta.

⚠️ Varför manuella rutor behövs i just de här: i fars dag-mallen (FD_6) och i
Täljsetets BOF-mall står rubrik, underrad, pris och bottenrad DIREKT på bar vit
botten. `oversatt-bild.py --analys` hittar bara text som ligger på en platta, så
den tog i stället husbilens fönster och hjul för plattor (FD_6_1: sju "former",
varav en riktig). Det är samma fynd som 2026-09-24 och 2026-09-26 — automatiken
har inget att matcha mot, och den som litar på dess utdata lämnar rubriken
svensk. `matt/matrader.py` mäter i stället mörk text rad för rad över hela
bredden, och varje rad här har sin egen uppmätta ruta.

De två PD_10-bilderna detekteras rätt (fem riktiga former var) och har inga
överstyrningar alls.

Per rad kalibreras, aldrig gissas:
  * `storlek` + `fet` — den svenska raden renderas i Liberation Sans i varje
    storlek 18..120 i båda vikterna, och den kombination väljs vars bläckbredd
    och bläckhöjd ligger närmast mätningen.
  * `farg` — medianen av de 15 % mörkaste pixlarna i rutan, alltså textens egen
    färg, inte en gissad svart.
  * `ink_topp` — radens uppmätta y0, så den norska texten börjar på exakt samma
    höjd. Utan den centrerar `rita_box` i rutan och lägger texten för lågt
    (mätt 2026-09-30: 13 px).

⛔ **Badgen rörs inte.** "Fars dag-rea" heter likadant på norska, så raden byts
inte — och en badge som inte behöver bytas ska inte ritas om. Ritas den om
fylls pillrets ljusa rundade hörn med badgefärgen och den blir en rektangel
(fällan från 2026-09-30 och 2026-10-01).

⚠️ **CTA-knappen ritas alltid om som en egen pill**, aldrig genom detektorn:
`sudda()` fyller formens ljusa pixlar med knappfärgen, och de rundade hörnen ÄR
ljusa. Pillen breddas symmetriskt om den norska texten behöver mer plats —
aldrig smalare, så den svenska alltid täcks helt.

  python3 market-expansion/no/notion-batches/2026-10-03/bygg-overrides.py
"""
import json
import os

import numpy as np
from PIL import Image, ImageDraw, ImageFont

B = os.path.dirname(os.path.abspath(__file__))
FET = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
NORMAL = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"

# Bilderna vars text står på bar botten. Form-id ur se-texter.json → postindex i
# den form `oversatt-bild.py` ser. Badgen utelämnas med flit (texten är lika).
MANUELLA = {
    "Takoverdrag_FD_6_1": ["rubrik1", "rubrik2", "rubrik3", "underrad", "pris", "botten"],
    "Takoverdrag_FD_6_2": ["rubrik1", "underrad", "pris", "botten"],
    "Takoverdrag_FD_6_3": ["rubrik1", "rubrik2", "underrad", "pris", "botten"],
    "Takoverdrag_FD_6_4": ["rubrik1", "rubrik2", "underrad1", "underrad2", "pris", "botten"],
    "Taljset_BOF_2_1": ["rubrik1", "rubrik2", "underrad1", "underrad2", "pris"],
}
# CTA-knappen: bild → (form-id, pillfärg). Ritas som pill, inte som textruta.
KNAPPAR = {"Taljset_BOF_2_1": ("knapp", [24, 72, 120])}

# ⚠️ Underrader och bottenrader är ALDRIG feta i de här mallarna — det syns i
# bilden. Bredd/höjd-sökningen väljer ändå FET ibland, för mätrutan klipper
# nedhänget i "g" och "p" och en fet text i mindre storlek får då samma bläck
# (mätt i dag: FD_6_1 underrad FET 30px avvikelse 0,061 och FD_6_4 underrad1
# FET 29px avvikelse 0,223, medan systerraderna i samma mall kalibrerades till
# normal 32px). Samma fälla som de fyra raderna 2026-10-01. Vikten låses
# därför här, och bara storleken söks.
LAST_NORMAL = ("underrad", "botten")

_matare = ImageDraw.Draw(Image.new("RGB", (8, 8)))


def blackmatt(text, fet, storlek):
    """Bläckets bredd och höjd i px — samma mått som mätningen i bilden."""
    f = ImageFont.truetype(FET if fet else NORMAL, storlek)
    bb = f.getbbox(text)
    return bb[2] - bb[0], bb[3] - bb[1]


def kalibrera(text, bredd_px, hojd_px, vikter=(True, False)):
    """Storleken och vikten vars bläck ligger närmast den uppmätta rutan."""
    bast = None
    for fet in vikter:
        for st in range(18, 121):
            w, h = blackmatt(text, fet, st)
            fel = abs(w - bredd_px) / max(bredd_px, 1) * 2 + abs(h - hojd_px) / max(hojd_px, 1)
            if bast is None or fel < bast[0]:
                bast = (fel, fet, st, w, h)
    return bast


def textfarg(im, box):
    """Textens egen färg: medianen av de 15 % mörkaste pixlarna i rutan."""
    x0, y0, x1, y1 = box
    ruta = np.asarray(im.convert("RGB"))[y0:y1 + 1, x0:x1 + 1].reshape(-1, 3)
    ljus = ruta.mean(axis=1)
    n = max(1, int(len(ljus) * 0.15))
    idx = np.argsort(ljus)[:n]
    return [int(v) for v in np.median(ruta[idx], axis=0)]


def ruta_bredd(se_px, no_px):
    """`rita_box` räknar maxbredd som rutan minus 6 % i varje kant. Rutan måste
    rymma norskan med den marginalen OCH täcka hela den svenska raden."""
    return max(se_px + 100, int(no_px / 0.88) + 24)


def main():
    se = json.load(open(f"{B}/se-texter.json", encoding="utf-8"))["bilder"]
    no = json.load(open(f"{B}/oversatt-output.json", encoding="utf-8"))["bilder"]

    ut = {}
    for namn, formider in MANUELLA.items():
        im = Image.open(f"{B}/se/{namn}.jpg")
        former = {f["id"]: f for f in se[namn]["former"]}
        rutor = {}
        for i, fid in enumerate(formider):
            f = former[fid]
            x0, y0, x1, y1 = f["box"]
            svtext = f["rader"][0]
            notext = no[namn][fid]["rader"][0]
            vikter = (False,) if fid.startswith(LAST_NORMAL) else (True, False)
            fel, fet, st, w, h = kalibrera(svtext, x1 - x0 + 1, y1 - y0 + 1, vikter)
            now, _ = blackmatt(notext, fet, st)
            bredd = ruta_bredd(x1 - x0 + 1, now)
            mitt = (x0 + x1) // 2
            rutor[str(i)] = [{
                "box": [max(0, mitt - bredd // 2), y0 - 6, min(1080, mitt + bredd // 2), y1 + 6],
                "fet": fet, "storlek": st, "farg": textfarg(im, f["box"]),
                "ink_topp": y0, "post": 0,
            }]
            print(f"  {namn:22} {fid:10} {'FET' if fet else 'normal':6} {st:3}px "
                  f"avvikelse {fel:.3f}  sv {x1-x0+1}px → no {now}px")
        if namn in KNAPPAR:
            fid, farg = KNAPPAR[namn]
            f = former[fid]
            x0, y0, x1, y1 = f["box"]
            svtext, notext = f["rader"][0], no[namn][fid]["rader"][0]
            # Knapptexten är fet och vit — kalibrera mot TEXTENS bläck, inte
            # mot pillret. Texthöjden mäts som pillhöjden minus luften runt om.
            fel, _, st, w, h = kalibrera(svtext, int((x1 - x0) * 0.62), int((y1 - y0) * 0.28))
            now, _ = blackmatt(notext, True, st)
            bredd = max(x1 - x0 + 1, int(now / 0.72))
            mitt = (x0 + x1) // 2
            px0, px1 = max(0, mitt - bredd // 2), min(1080, mitt + bredd // 2)
            rutor[str(len(formider))] = [{
                "box": [px0, y0, px1, y1], "fyll": "mork", "fyllfarg": farg,
                "radie": (y1 - y0) // 2, "alfa": 255, "fet": True, "storlek": st,
                "farg": [255, 255, 255], "ink_topp": y0 + (y1 - y0 - h) // 2, "post": 0,
            }]
            print(f"  {namn:22} {fid:10} PILL   {st:3}px  pill {px0}..{px1}")
        ut[namn] = {"box_for_form": rutor}

    json.dump(ut, open(f"{B}/overrides.json", "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    print(f"\noverrides.json: {len(ut)} bilder, "
          f"{sum(len(v['box_for_form']) for v in ut.values())} rutor")


if __name__ == "__main__":
    main()
