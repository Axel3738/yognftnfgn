#!/usr/bin/env python3
"""Räknar rutor med kvarstående SVENSK caption i de färdiga norska videorna.

`no-precis.py` hittar ordpillret per frame och byter texten i det. När den
INTE hittar pillret står den svenska texten kvar — och loggraden "pillret
hittat i 270 av 344 frames" går inte att läsa som ett fel, för i en tyst del
av videon finns inget piller alls.

Det här skriptet skiljer de två: det letar själv efter pillret i KÄLLAN
(ett ljust band med mörk text i), och jämför mot `piller.json`, som är de
rutor no-precis faktiskt bytte. Differensen är rutor där källan hade en
svensk caption som blev kvar.

⚠️ Måttet hittade två verkliga fel 2026-10-01: CS_2_H2 har TVÅ pillerstorlekar
(en stor fet och en liten), och no-precis bytte bara den lilla — den stora
svenska stod kvar i en tredjedel av videon. OB_11_H1 har en caption som tonar
in utan piller, grå text direkt på bilden, som inte går att byta alls.

  python3 market-expansion/no/notion-batches/2026-10-01/svenskkoll.py
"""
import glob
import json
import os
import shutil
import subprocess

import numpy as np

B = os.path.dirname(os.path.abspath(__file__))


def ffbin():
    return shutil.which("ffmpeg") or __import__("imageio_ffmpeg").get_ffmpeg_exe()


def rutor(ff, path, fps=5):
    p = subprocess.run([ff, "-hide_banner", "-loglevel", "error", "-i", path,
                        "-vf", f"fps={fps},scale=720:1280", "-f", "rawvideo",
                        "-pix_fmt", "rgb24", "-"], capture_output=True)
    buf = np.frombuffer(p.stdout, dtype=np.uint8)
    n = len(buf) // (720 * 1280 * 3)
    return buf[:n * 720 * 1280 * 3].reshape(n, 1280, 720, 3).astype(np.int32)


def har_piller(fr, zon):
    """Per ruta: finns ett ljust band med mörk text i inom zonen?"""
    y0, y1 = zon
    vit = (fr[:, y0:y1, :, :].min(axis=3) > 212)
    mork = (fr[:, y0:y1, :, :].max(axis=3) < 115)
    ut = []
    for i in range(len(fr)):
        rad = vit[i].mean(axis=1)
        kand = np.where(rad > 0.30)[0]
        hit = False
        k = 0
        while k < len(kand):
            j = k
            while j + 1 < len(kand) and kand[j + 1] - kand[j] <= 3:
                j += 1
            h = kand[j] - kand[k] + 1
            if 35 <= h <= 110 and mork[i, kand[k]:kand[j] + 1].sum() > 200:
                hit = True
                break
            k = j + 1
        ut.append(hit)
    return np.array(ut)


def main():
    ff = ffbin()
    print(f"{'video':34} {'källa':>7} {'bytta':>7} {'kvar':>6}  dom")
    for pj in sorted(glob.glob(f"{B}/no-video-txt/*.piller.json")):
        namn = os.path.basename(pj).replace(".mp4.piller.json", "")
        d = json.load(open(pj, encoding="utf-8"))
        bytta = np.array([p is not None for p in d["piller"]])
        konf = (f"{B}/konfig/{namn}.json" if os.path.exists(f"{B}/konfig/{namn}.json")
                else f"{B}/konfig-cs2h2/{namn}.json")
        zon = json.load(open(konf, encoding="utf-8"))["captions"]["zon"]
        kalla = json.load(open(konf, encoding="utf-8"))["in"]
        fr = rutor(ff, kalla)
        steg = max(1, round(d["fps"] / 5))
        bytt5 = bytta[::steg][:len(fr)]
        har = har_piller(fr, zon)[:len(bytt5)]
        kvar = int((har & ~bytt5).sum())
        tot = int(har.sum())
        dom = "✅" if kvar <= 2 else ("⚠️" if kvar <= 6 else "❌")
        print(f"{namn:34} {tot:7d} {int((har & bytt5).sum()):7d} {kvar:6d}  {dom}"
              f"  ({kvar / 5:.1f} s svensk text kvar)")


if __name__ == "__main__":
    main()
