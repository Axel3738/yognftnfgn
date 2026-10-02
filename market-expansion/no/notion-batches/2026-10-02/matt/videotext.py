#!/usr/bin/env python3
"""Mäter var den inbrända texten sitter i varje video, och av vilket slag den är.

Två slag i den här batchen, och de kräver olika verktyg:

  1. **Ordcaptions i ett vitt piller** nederst. `no-precis.py` hittar pillret per
     bildruta själv och byter texten i det — det enda den behöver är y-zonen.
  2. **Ett slutblock UTAN piller**: vit fet text direkt på bilden (OB-videornas
     "1 129 kr (regular 1 469 kr), save 340 kr (23 %)." och FD-videornas
     "Fars dag-rea / Beställ senast 19 oktober."). Pillersökningen hittar det
     aldrig — det kräver en blur-ruta plus ett eget PNG-lager, med tider.

⚠️ Mätningen görs på den FÄRDIGDUBBADE videon, inte på källan. `elevenlabs-omdubb`
tempo-anpassar varje klipp, så källans tider stämmer inte i utfilen (mätt i den
här batchen: källorna 13,5–21,1 s blev 14,3–19,3 s, mellan −9 % och +28 %).
Rutorna i BILDEN flyttar sig däremot inte — bara tiderna.

  python3 .../matt/videotext.py <video.mp4> [...]
"""
import os
import subprocess
import sys

import numpy as np

try:
    import imageio_ffmpeg
    FF = imageio_ffmpeg.get_ffmpeg_exe()
except Exception:
    FF = "ffmpeg"

FPS = 5          # mättäthet; räcker för att se när ett block börjar och slutar
B, H = 720, 1280


def rutor(path, fps=FPS):
    p = subprocess.run([FF, "-hide_banner", "-loglevel", "error", "-i", path,
                        "-vf", f"fps={fps},scale={B}:{H}", "-f", "rawvideo",
                        "-pix_fmt", "rgb24", "-"], capture_output=True)
    buf = np.frombuffer(p.stdout, dtype=np.uint8)
    n = len(buf) // (B * H * 3)
    return buf[:n * B * H * 3].reshape(n, H, B, 3).astype(np.int32)


def band(mask, minh=8):
    """Sammanhängande y-band i en 1D-boolmask."""
    ut, i = [], 0
    while i < len(mask):
        if mask[i]:
            j = i
            while j + 1 < len(mask) and mask[j + 1]:
                j += 1
            if j - i + 1 >= minh:
                ut.append((i, j))
            i = j + 1
        else:
            i += 1
    return ut


def piller(fr):
    """Vitt piller med mörk text i: (y0, y1, x0, x1) eller None."""
    vit = fr.min(axis=2) > 205
    mork = fr.max(axis=2) < 110
    rad = vit.mean(axis=1)
    for (y0, y1) in band(rad > 0.25, 20):
        if y0 < 600:                       # pillret sitter alltid i nedre halvan
            continue
        if mork[y0:y1 + 1].sum() < 150:    # ett vitt fält utan text är inte ett piller
            continue
        kol = np.where(vit[y0:y1 + 1].any(axis=0))[0]
        return (y0, y1, int(kol[0]), int(kol[-1]))
    return None


def ljust_block(fr):
    """Vit FET text utan piller: ljusa pixlar med mörk kant runt, i grupper."""
    g = fr.mean(axis=2)
    ljus, mork = g > 212, g < 108
    nb = np.zeros_like(mork)
    for d in range(1, 5):
        nb[:-d] |= mork[d:]; nb[d:] |= mork[:-d]
        nb[:, :-d] |= mork[:, d:]; nb[:, d:] |= mork[:, :-d]
    m = ljus & nb
    rad = m.sum(axis=1)
    ut = []
    for (y0, y1) in band(rad > 12, 10):
        kol = np.where(m[y0:y1 + 1].any(axis=0))[0]
        if len(kol) > 40:
            ut.append((y0, y1, int(kol[0]), int(kol[-1])))
    return ut


def main():
    for path in sys.argv[1:]:
        fr = rutor(path)
        namn = os.path.basename(path)
        print(f"\n=== {namn}  {len(fr)} mätrutor à {1/FPS:.1f} s ===")
        pz, blk = [], {}
        for i, f in enumerate(fr):
            p = piller(f)
            if p:
                pz.append(p)
            for (y0, y1, x0, x1) in ljust_block(f):
                if p and not (y1 < p[0] - 8 or y0 > p[1] + 8):
                    continue                      # det är pillret, inte ett eget block
                nyckel = (y0 // 24, y1 // 24)
                blk.setdefault(nyckel, []).append((i / FPS, y0, y1, x0, x1))
        if pz:
            a = np.array(pz)
            print(f"  piller: y {a[:,0].min()}..{a[:,1].max()}  x {a[:,2].min()}..{a[:,3].max()}"
                  f"  i {len(pz)} av {len(fr)} rutor")
        else:
            print("  piller: HITTADES INTE")
        for nyckel, rader in sorted(blk.items()):
            if len(rader) < 3:
                continue
            t = [r[0] for r in rader]
            a = np.array([r[1:] for r in rader])
            print(f"  block utan piller: y {a[:,0].min()}..{a[:,1].max()} x {a[:,2].min()}..{a[:,3].max()}"
                  f"   t {min(t):.1f}..{max(t):.1f} s  ({len(rader)} rutor)")


if __name__ == "__main__":
    main()
