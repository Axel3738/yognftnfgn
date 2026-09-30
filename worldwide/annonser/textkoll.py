#!/usr/bin/env python3
"""textkoll.py — läser en färdig worldwide-video med OCR (2 bilder/s) och stoppar på svensk text,
kronor och butikens namn — var som helst i bilden, hela videon.

    python3 worldwide/annonser/textkoll.py <video.mp4> [<video.mp4> …] [--fps=2] [--json]

Varför: no-captions.py kontrollerar bara bandet kring undertexterna och QA-bilderna tas på
10/50/90 %. Batmotor_SP_1_H5 (2026-09-30) hade en svensk checklista mitt i bilden och en
slutskärm med Bäverbutikens app och "579 kronor" de sista sekunderna — sådant syns bara om
hela videon läses. Exit 1 om någon video har ett fynd.
"""
import json
import re
import subprocess
import sys

import numpy as np
from rapidocr_onnxruntime import RapidOCR

SVENSKA = re.compile(
    r"\b(och|att|för|med|på|till|från|din|ditt|dina|nu|idag|köp|köpa|fri|frakt|dagar|dagars|kr|kronor|rabatt|"
    r"beställ|spara|inga|ingen|enkel|enkelt|som|är|inte|slut|handla|storlek|passar|alla|skydd|skyddar|"
    r"kraftigt|kraftig|tyg|sätta|ta|av|öppet|ångerrätt|svensk|sverige|vinter|regn|båt|jul|pappa)\b|[åäöÅÄÖ]",
    re.I)
BUTIK = re.compile(r"b[äa]ver|baverbutiken|magiborsten|carashell|\.se\b", re.I)
KRONOR = re.compile(r"\d\s?kr\b|kronor|\bsek\b", re.I)


def bilder(path, fps):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", path], capture_output=True, text=True)
    m = re.search(r"Video:.*?(\d{3,5})x(\d{3,5})", r.stderr)
    w, h = int(m[1]), int(m[2])
    p = subprocess.Popen(["ffmpeg", "-nostdin", "-v", "error", "-i", path, "-vf", f"fps={fps}", "-f", "rawvideo",
                          "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
    n, i = w * h * 3, 0
    while True:
        b = p.stdout.read(n)
        if len(b) < n:
            break
        yield i / fps, np.frombuffer(b, np.uint8).reshape(h, w, 3)
        i += 1
    p.wait()


def kolla(path, fps, ocr):
    fynd = []
    for t, bild in bilder(path, fps):
        res, _ = ocr(bild)
        for _box, text, konf in res or []:
            if float(konf) < 0.6:
                continue
            varfor = [n for n, rx in (("butik", BUTIK), ("kronor", KRONOR), ("svenska", SVENSKA)) if rx.search(text)]
            if varfor:
                fynd.append({"t": round(t, 1), "text": text, "varfor": varfor})
    return fynd


def main():
    a = sys.argv[1:]
    fps = float(next((x.split("=")[1] for x in a if x.startswith("--fps=")), 2))
    filer = [x for x in a if not x.startswith("--")]
    ocr = RapidOCR()
    ut, fel = {}, 0
    for f in filer:
        fy = kolla(f, fps, ocr)
        ut[f] = fy
        if fy:
            fel += 1
        if "--json" not in a:
            print(("❌ " if fy else "✅ ") + f + ("" if not fy else ":"))
            for x in fy[:8]:
                print(f"     {x['t']:>5}s  {x['text']!r}  ({', '.join(x['varfor'])})")
    if "--json" in a:
        print(json.dumps(ut, ensure_ascii=False))
    sys.exit(1 if fel else 0)


if __name__ == "__main__":
    main()
