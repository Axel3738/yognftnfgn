#!/usr/bin/env python3
"""Lokaliserar Takovertrekk_NO_CS_2_H2 — videon utan tal.

⚠️ Den här videon gick ALDRIG genom HeyGen. Den har musik men ingen röst, så
proofread svarade "No speaker is detected in the video", och järnregeln säger
att en källa som är nästan bara musik inte ska översättas: HeyGen har ingen
röst att klona och hittar på en. Allt språk i den ligger i stället som inbränd
text, och det är det som byts här. Källan används alltså som den är, med
textlagret ovanpå.

Två element:

  1. Ordcaptions i ett vitt piller nederst (y 718..767, x 58..661). Texten byts
     sex gånger, och bytpunkterna är mätta i bläckmönstret inuti pillret, inte
     gissade: 4,0 · 8,0 · 12,0 · 16,0 · 21,0 s. Mätningen gjordes i 8 bilder per
     sekund och gav exakt samma tider som en avläsning i ett kontaktark.

  2. En stor röd prisruta uppe till vänster, vit fet text med röd kontur, som
     tonar in vid 16,25 s och ligger kvar till slutet. Rad 1 "1,129 kr." y
     155..253 x 134..581, rad 2 "1,469 kr." överstruken y 259..322 x 194..517.
     ⚠️ Talen står med engelskt tusentalskomma i källan ("1,129"); norskan
     skriver mellanslag.

  python3 market-expansion/no/notion-batches/2026-10-01/cs2h2.py
"""
import json
import os
import re
import shutil
import subprocess

import numpy as np
from PIL import Image, ImageDraw, ImageFont

B = os.path.dirname(os.path.abspath(__file__))
FET = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
NAMN = "Takovertrekk_NO_CS_2_H2"
KALLA = f"{B}/takovertrekk/up/{NAMN}.mp4"
ROD = (253, 0, 4)

# Pillrets sex texter och deras fönster, mätta i bläckmönstret inuti pillret.
CUES = [(0.0, 4.0), (4.0, 8.0), (8.0, 12.0), (12.0, 16.0), (16.0, 21.0), (21.0, None)]
# Prisrutans två rader: (y0, y1, x0, x1) för bläcket inklusive kontur.
PRIS = [(155, 253, 134, 581), (259, 322, 194, 517)]
PRIS_FRAN = 16.0          # tonar in 16,25; rutan tas 0,25 s tidigare med marginal


def ffbin():
    return shutil.which("ffmpeg") or __import__("imageio_ffmpeg").get_ffmpeg_exe()


def langd(ff, p):
    r = subprocess.run([ff, "-hide_banner", "-i", p], capture_output=True, text=True)
    m = re.search(r"Duration: (\d+):(\d+):(\d+\.\d+)", r.stderr)
    return int(m[1]) * 3600 + int(m[2]) * 60 + float(m[3])


def tid(s):
    h, rest = divmod(s, 3600)
    m, sek = divmod(rest, 60)
    return f"{int(h):02d}:{int(m):02d}:{sek:06.3f}".replace(".", ",")


def storlek_for(text, mb, mh):
    bast = None
    for st in range(40, 170):
        f = ImageFont.truetype(FET, st)
        bb = f.getbbox(text)
        w, h = bb[2] - bb[0], bb[3] - bb[1]
        if not w:
            continue
        fel = abs(w - mb) / mb * 2 + abs(h - mh) / mh
        if bast is None or fel < bast[0]:
            bast = (fel, st)
    return bast[1]


def main():
    ff = ffbin()
    rader = json.load(open(f"{B}/matt/no-cs2h2.json", encoding="utf-8"))["rader"]
    L = langd(ff, KALLA)

    # 1) SRT för pillret — de sex första raderna
    srt = []
    for i, ((a, b), rad) in enumerate(zip(CUES, rader[:6]), 1):
        srt.append(f"{i}\n{tid(a)} --> {tid(b if b is not None else L)}\n{rad['no']}\n")
    os.makedirs(f"{B}/srt-no", exist_ok=True)
    open(f"{B}/srt-no/takovertrekk_{NAMN}.srt", "w", encoding="utf-8").write("\n".join(srt))

    # 2) PNG-lager för prisrutan. Konturen är 9 px i källan, och rad 2 är
    #    överstruken — strecket ritas i samma röda som konturen, i textens mitt.
    png = Image.new("RGBA", (720, 1280), (0, 0, 0, 0))
    d = ImageDraw.Draw(png)
    for (y0, y1, x0, x1), rad in zip(PRIS, rader[6:8]):
        st = storlek_for(rad["se"], x1 - x0 + 1 - 18, y1 - y0 + 1 - 18)
        f = ImageFont.truetype(FET, st)
        bb = f.getbbox(rad["no"])
        mitt = (x0 + x1) / 2
        d.text((mitt, y0 + 9 - bb[1]), rad["no"], font=f, anchor="ma",
               fill=(255, 255, 255, 255), stroke_width=9, stroke_fill=ROD + (255,))
    # överstrykningen på rad 2
    (y0, y1, x0, x1) = PRIS[1]
    ym = (y0 + y1) // 2
    d.line([(x0 + 4, ym), (x1 - 4, ym)], fill=ROD + (255,), width=10)
    os.makedirs(f"{B}/lager", exist_ok=True)
    png.save(f"{B}/lager/{NAMN}.png")

    # 3) konfigen
    konf = {
        "in": KALLA,
        "ut": f"{B}/no-video-txt/{NAMN}.mp4",
        "srt": f"{B}/srt-no/takovertrekk_{NAMN}.srt",
        "captions": {"zon": [700, 1010], "x0": 0, "x1": 720, "bredd_max": 700,
                     "h_min": 42, "h_max": 90, "standard_cy": 742,
                     "max_chars": 30, "font_px": 27, "pad_x": 6, "pad_y": 6},
        "blur": [{"rect": [max(0, x0 - 14), max(0, y0 - 12), min(720, x1 + 14),
                           min(1280, y1 + 14)], "t": [PRIS_FRAN, L + 0.3]}
                 for (y0, y1, x0, x1) in PRIS],
        "lager": [{"png": f"{B}/lager/{NAMN}.png", "t": [PRIS_FRAN, L + 0.3]}],
        "qa": f"{B}/qa",
    }
    os.makedirs(f"{B}/konfig-cs2h2", exist_ok=True)
    json.dump(konf, open(f"{B}/konfig-cs2h2/{NAMN}.json", "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    print(f"✓ {NAMN}: 6 caption-cues, prisruta {PRIS_FRAN}-{L + 0.3:.2f}s")


if __name__ == "__main__":
    main()
