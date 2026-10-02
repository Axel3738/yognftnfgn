#!/usr/bin/env python3
"""Mäter textrader som ligger DIREKT på den vita sidan (inte i en platta).

Detektorn i oversatt-bild.py hittar bara plattor och knappar; i de flesta av
2026-10-01-bilderna står rubrik, underrad och pris på ren vit bakgrund och
hittas inte alls. Det här skriptet läser raderna själv: en rad räknas med bara
om radens bakgrund är nästan vit (percentil 90 > 235), så produktfotot aldrig
tolkas som text.

  python3 matt.py <bild.jpg> [...]
"""
import sys
import numpy as np
from PIL import Image

for path in sys.argv[1:]:
    im = Image.open(path).convert("RGB")
    a = np.asarray(im).astype(np.int32)
    H, W, _ = a.shape
    s = a.sum(axis=2)
    bak = np.percentile(s, 90, axis=1)          # radens ljusa bakgrund
    vit = bak > 235 * 3
    mork = (s < bak[:, None] - 150)             # bläck mot den bakgrunden
    antal = (mork & vit[:, None]).sum(axis=1)
    har = antal > 3

    rader, i = [], 0
    while i < H:
        if har[i]:
            j = i
            while j + 1 < H and (har[j + 1] or (j + 2 < H and har[j + 2])):
                j += 1
            kol = np.where((mork[i:j + 1] & vit[i:j + 1, None]).any(axis=0))[0]
            if len(kol) and (j - i) >= 8:
                tjock = (mork[i:j + 1] & vit[i:j + 1, None]).sum() / max(1, (j - i + 1) * (kol[-1] - kol[0] + 1))
                rader.append((i, j, int(kol[0]), int(kol[-1]), round(float(tjock), 3)))
            i = j + 1
        else:
            i += 1

    print(f"=== {path.split('/')[-1]} {W}x{H} ===")
    for (y0, y1, x0, x1, t) in rader:
        print(f"  y {y0:4d}..{y1:4d} h{y1-y0+1:3d}  x {x0:4d}..{x1:4d} b{x1-x0+1:4d}  täthet {t}")
