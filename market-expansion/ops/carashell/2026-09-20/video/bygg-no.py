#!/usr/bin/env python3
"""bygg-no.py — lagren och konfigen för den norska PD_5_H1 (NO-runda 2026-09-20).

Källan bär tre sorters svensk text som HeyGen inte rör, eftersom HeyGen bara
översätter ljudet:
  1. ordcaptions i vitt piller nederst  → `no-precis.py` suddar pillret per frame
     och lägger den norska cuen i samma ruta
  2. inga röda pop-texter i just den här videon (mätt i US-rundan 2026-09-18:
     `rod: []`), så ingen förbehandling behövs
  3. ett slutkort som är en skärmdump av den SVENSKA produktsidan — butikens
     domän, `1 469,00 kr → 1 129,00 kr` och "16 recensioner" → byts mot ett
     norskt kort som PNG-lager

Måtten är US-rundans, mätta på samma källfil: W 1080, captions cy 1420,
zon 1320–1650, x 75–1005, slutkortet från 36,4 s, produktbilden i källans
slutkort på y 587–1098, x 91–990.

Butikens namn och domän står aldrig i kortet (Axels beslut 2026-09-18) —
produkten, priset och länken pekar ut butiken ändå.

    python3 market-expansion/ops/carashell/2026-09-20/video/bygg-no.py
"""
import json
import os
import subprocess
import sys

from PIL import Image, ImageDraw, ImageFont

HÄR = os.path.dirname(os.path.abspath(__file__))
FET = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
NORMAL = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
STJARNA = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
KÄLLA = os.path.join(HÄR, "carashell", "up", "PD_5_H1.mp4")
SLUT_FRÅN = 36.4
os.makedirs(os.path.join(HÄR, "lager"), exist_ok=True)
os.makedirs(os.path.join(HÄR, "cap"), exist_ok=True)


def produktbilden_ur_kallan(ut):
    """Klipper produktbilden ur källans egna slutkort — samma ruta som US-rundan
    mätte (y 587–1098, x 91–990). Bilden är produktens, inte butikens."""
    ram = os.path.join(HÄR, "lager", "kalla-slutkort.png")
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-ss", "37.2", "-i", KÄLLA,
                    "-frames:v", "1", ram, "-y"], check=True)
    Image.open(ram).convert("RGBA").crop((91, 587, 990, 1098)).save(ut)


def slutkort(W, H, produktbild, ut):
    """Norskt slutkort: vit bakgrund, blå badge, produktbilden ur källans slutkort,
    norsk titel, stjärnor + 16 anmeldelser, 1 382,50 kr överstruket + 1 106 kr +
    Salg, fotrad. Priserna är produktfilens `ekonomi.marknadspriser` NOK och
    ingenting annat."""
    sk = W / 720
    im = Image.new("RGBA", (W, H), (255, 255, 255, 255))
    d = ImageDraw.Draw(im)
    f = ImageFont.truetype(NORMAL, int(40 * sk))
    t = "14 DAGERS ANGRERETT"
    w = f.getlength(t)
    bw, bh = w + 60 * sk, 72 * sk
    bx = (W - bw) / 2
    by = 250 * sk
    d.rounded_rectangle([bx, by, bx + bw, by + bh], radius=int(10 * sk), fill=(44, 95, 138, 255))
    d.text((W / 2 - w / 2, by + bh / 2 - f.getmetrics()[0] * 0.72 / 2 - 4 * sk), t,
           font=f, fill=(255, 255, 255, 255))
    p = Image.open(produktbild).convert("RGBA")
    mål_b = int(600 * sk)
    p = p.resize((mål_b, int(p.height * mål_b / p.width)))
    im.alpha_composite(p, (int((W - p.width) / 2), int(400 * sk)))
    y = int(400 * sk) + p.height + int(50 * sk)
    f = ImageFont.truetype(FET, int(34 * sk))
    for rad in ["Taktrekk for campingvogn", "& bobil · 6,5 × 3 m"]:
        d.text((int(60 * sk), y), rad, font=f, fill=(20, 22, 26, 255))
        y += int(44 * sk)
    y += int(14 * sk)
    fs = ImageFont.truetype(STJARNA, int(24 * sk))
    d.text((int(60 * sk), y), "★★★★★", font=fs, fill=(33, 150, 83, 255))
    fr = ImageFont.truetype(NORMAL, int(22 * sk))
    d.text((int(60 * sk) + fs.getlength("★★★★★") + 12 * sk, y + 2 * sk),
           "16 anmeldelser · 5,0 i snitt", font=fr, fill=(70, 74, 80, 255))
    y += int(48 * sk)
    fj = ImageFont.truetype(NORMAL, int(26 * sk))
    t = "1 382,50 kr"
    d.text((int(60 * sk), y + 8 * sk), t, font=fj, fill=(130, 134, 140, 255))
    wj = fj.getlength(t)
    ym = y + 8 * sk + fj.getmetrics()[0] * 0.5
    d.line([(int(60 * sk), ym), (int(60 * sk) + wj, ym)], fill=(130, 134, 140, 255),
           width=max(2, int(2 * sk)))
    fp = ImageFont.truetype(FET, int(38 * sk))
    d.text((int(60 * sk) + wj + 18 * sk, y), "1 106 kr", font=fp, fill=(20, 22, 26, 255))
    xs = int(60 * sk) + wj + 18 * sk + fp.getlength("1 106 kr") + 18 * sk
    fb = ImageFont.truetype(FET, int(18 * sk))
    d.rounded_rectangle([xs, y + 8 * sk, xs + fb.getlength("Salg") + 20 * sk, y + 8 * sk + 30 * sk],
                        radius=int(4 * sk), fill=(20, 22, 26, 255))
    d.text((xs + 10 * sk, y + 12 * sk), "Salg", font=fb, fill=(255, 255, 255, 255))
    y += int(66 * sk)
    ff = ImageFont.truetype(NORMAL, int(19 * sk))
    d.text((int(60 * sk), y), "Fri frakt til Sverige og Norge · 5–10 arbeidsdager",
           font=ff, fill=(90, 94, 100, 255))
    im.save(ut)


produkt = os.path.join(HÄR, "lager", "produkt-1080.png")
produktbilden_ur_kallan(produkt)
slutkort(1080, 1920, produkt, os.path.join(HÄR, "lager", "slutkort-1080.png"))

K = {
    "in": "../render/carashell_PD_5_H1.mp4",
    "ut": "../../no/CaraShellRoof_NO_PD_5_H1.mp4",
    "srt": "../srt-ratt/carashell_PD_5_H1.srt",
    "captions": {"zon": [1320, 1650], "max_chars": 34, "font_px": 45, "standard_cy": 1420,
                 "x0": 75, "x1": 1005, "bredd_max": 930,
                 "av": [[SLUT_FRÅN, 999]]},
    "lager": [{"png": "../lager/slutkort-1080.png", "t": [SLUT_FRÅN, 999]}],
    "qa": "qa-PD_5_H1",
}
with open(os.path.join(HÄR, "cap", "PD_5_H1.json"), "w") as f:
    json.dump(K, f, indent=1, ensure_ascii=False)
print("skrev lager/slutkort-1080.png och cap/PD_5_H1.json")
