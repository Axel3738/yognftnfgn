#!/usr/bin/env python3
"""Hittar slutblocket: vit FET text UTAN piller, som står STILL i bild.

`no-precis.py` byter texten i ordcaption-pillret. Slutblocket har inget piller
(texten ligger direkt på fotot) och hittas därför aldrig av pillersökningen — det
är precis det felet som höll tolv videor kvar i kön 2026-10-01. Det kräver en
blur-ruta plus ett eget PNG-lager, och då måste rutan och tiden mätas.

⚠️ Att bara leta "ljusa pixlar med mörk kant" ger skräp: solreflexer i lacken,
himlakanter och vita husbilssidor ser likadana ut för ett tröskeltest. Det som
skiljer slutblocket från allt annat är att det **står stilla**: samma rad, samma
bredd, bildruta efter bildruta. Därför kräver skriptet att raden finns i minst
`MIN_SEK` sekunder i följd på samma plats. Reflexer rör sig; text gör det inte.

⚠️ Mät på den FÄRDIGDUBBADE videon. `elevenlabs-omdubb` tempo-anpassar varje
klipp, så källans tider stämmer inte i utfilen.

  python3 .../matt/slutblock.py <video.mp4> [...] [--json <fil>]
"""
import json
import os
import subprocess
import sys

import numpy as np

try:
    import imageio_ffmpeg
    FF = imageio_ffmpeg.get_ffmpeg_exe()
except Exception:
    FF = "ffmpeg"

FPS = 5
BR, HO = 720, 1280
MIN_SEK = 1.0          # kortare än så är det en reflex, inte en textrad
TOL = 12               # px: hur mycket en rad får vandra och ändå räknas som samma


def rutor(path):
    p = subprocess.run([FF, "-hide_banner", "-loglevel", "error", "-i", path,
                        "-vf", f"fps={FPS},scale={BR}:{HO}", "-f", "rawvideo",
                        "-pix_fmt", "rgb24", "-"], capture_output=True)
    buf = np.frombuffer(p.stdout, dtype=np.uint8)
    n = len(buf) // (BR * HO * 3)
    return buf[:n * BR * HO * 3].reshape(n, HO, BR, 3).astype(np.int32)


def rader(fr):
    """Ljusa textrader med mörk kant (vit fet text med kontur) i en bildruta."""
    g = fr.mean(axis=2)
    ljus, mork = g > 212, g < 108
    nb = np.zeros_like(mork)
    for d in range(1, 5):
        nb[:-d] |= mork[d:]; nb[d:] |= mork[:-d]
        nb[:, :-d] |= mork[:, d:]; nb[:, d:] |= mork[:, :-d]
    m = ljus & nb
    antal = m.sum(axis=1)
    ut, i = [], 0
    while i < HO:
        if antal[i] > 12:
            j = i
            while j + 1 < HO and (antal[j + 1] > 12 or (j + 2 < HO and antal[j + 2] > 12)):
                j += 1
            kol = np.where(m[i:j + 1].any(axis=0))[0]
            if len(kol) > 60 and j - i >= 10:
                ut.append((i, j, int(kol[0]), int(kol[-1])))
            i = j + 1
        else:
            i += 1
    return ut


def main():
    argv = list(sys.argv[1:])
    utfil = None
    if "--json" in argv:
        k = argv.index("--json")
        utfil = argv[k + 1]
        del argv[k:k + 2]

    allt = {}
    for path in argv:
        fr = rutor(path)
        namn = os.path.basename(path).replace(".mp4", "")
        # spår: lista av (y0,y1,x0,x1,första_ruta,sista_ruta)
        spar = []
        for i, f in enumerate(fr):
            for (y0, y1, x0, x1) in rader(f):
                for s in spar:
                    if s["sist"] >= i - 1 and abs(s["y0"] - y0) <= TOL and abs(s["y1"] - y1) <= TOL:
                        s["sist"] = i
                        s["y0"] = min(s["y0"], y0); s["y1"] = max(s["y1"], y1)
                        s["x0"] = min(s["x0"], x0); s["x1"] = max(s["x1"], x1)
                        break
                else:
                    spar.append({"y0": y0, "y1": y1, "x0": x0, "x1": x1, "forst": i, "sist": i})
        stabila = [s for s in spar if (s["sist"] - s["forst"] + 1) / FPS >= MIN_SEK]
        print(f"\n=== {namn}  ({len(fr)/FPS:.1f} s) ===")
        for s in sorted(stabila, key=lambda s: (s["forst"], s["y0"])):
            print(f"  y {s['y0']:4d}..{s['y1']:4d}  x {s['x0']:4d}..{s['x1']:4d}"
                  f"   t {s['forst']/FPS:5.1f}..{(s['sist']+1)/FPS:5.1f} s")
        allt[namn] = [{"box": [s["y0"], s["y1"], s["x0"], s["x1"]],
                       "t": [round(s["forst"] / FPS, 2), round((s["sist"] + 1) / FPS, 2)]}
                      for s in sorted(stabila, key=lambda s: (s["forst"], s["y0"]))]
    if utfil:
        json.dump(allt, open(utfil, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        print(f"\nskrivet: {utfil}")


if __name__ == "__main__":
    main()
