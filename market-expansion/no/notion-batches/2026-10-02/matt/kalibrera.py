#!/usr/bin/env python3
"""Kalibrerar fontstorlek, fetstil och färg per uppmätt textblock.

Varje block i blocken.json bär den svenska texten och den uppmätta rutan
(y0,y1,x0,x1). Skriptet renderar den svenska texten i Liberation Sans, normal
och fet, i varje storlek 20..110 och väljer den kombination vars bläckbredd och
bläckhöjd ligger närmast mätningen. Då ärver den norska texten exakt den
svenska textens storlek i stället för en gissning.

Färgen är medianen av de 15 % mörkaste pixlarna i rutan — textens egen färg,
inte bakgrundens.
"""
import json, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont

FET = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
NORMAL = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"


def ink(text, fet, storlek):
    f = ImageFont.truetype(FET if fet else NORMAL, storlek)
    im = Image.new("L", (2200, 260), 255)
    ImageDraw.Draw(im).text((20, 40), text, font=f, fill=0)
    a = np.asarray(im)
    ys, xs = np.where(a < 128)
    if not len(ys):
        return 0, 0
    return xs.max() - xs.min() + 1, ys.max() - ys.min() + 1


def main(bildmapp, blockfil):
    blocken = json.load(open(blockfil, encoding="utf-8"))
    ut = {}
    for namn, block in blocken.items():
        a = np.asarray(Image.open(f"{bildmapp}/{namn}.jpg").convert("RGB")).astype(np.int32)
        rader = []
        for b in block:
            y0, y1, x0, x1 = b["matt"]
            ruta = a[y0:y1 + 1, x0:x1 + 1].reshape(-1, 3)
            s = ruta.sum(axis=1)
            grans = np.percentile(s, 15)
            farg = [int(v) for v in np.median(ruta[s <= grans], axis=0)]
            mb, mh = x1 - x0 + 1, y1 - y0 + 1
            bast = None
            for fet in (False, True):
                for st in range(18, 115):
                    w, h = ink(b["se"], fet, st)
                    if not w:
                        continue
                    # bredden väger tyngst: den skiljer storlekarna åt tydligast
                    fel = abs(w - mb) / mb * 2 + abs(h - mh) / mh
                    if bast is None or fel < bast[0]:
                        bast = (fel, fet, st, w, h)
            _, fet, st, w, h = bast
            rader.append({"se": b["se"], "matt": b["matt"], "fet": bool(fet),
                          "storlek": int(st), "farg": [int(x) for x in farg],
                          "ink": [int(w), int(h)], "avvik": [int(w - mb), int(h - mh)]})
        ut[namn] = rader
        print(f"=== {namn} ===")
        for r in rader:
            print(f"  {'FET ' if r['fet'] else 'norm'} {r['storlek']:3d}px färg {r['farg']} "
                  f"avvik b{r['avvik'][0]:+4d} h{r['avvik'][1]:+3d}  «{r['se'][:48]}»")
    json.dump(ut, open(sys.argv[3], "w", encoding="utf-8"), ensure_ascii=False, indent=1)


main(sys.argv[1], sys.argv[2])
