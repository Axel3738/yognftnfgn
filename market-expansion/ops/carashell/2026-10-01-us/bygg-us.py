#!/usr/bin/env python3
"""Amerikanska versioner av Takoverdrag_OB_15_1 och OB_21_1 (CaraShell US, 2026-10-01).

Återanvänder NO-rundans mätningar samma dag (market-expansion/no/notion-batches/
2026-10-01/texter/*.json + matt/knapp-stil.json): varje textrad är redan mätt i
den svenska bilden. Här byts bara texten (sonnet-subagent, US English) och rutan
breddas så den engelska raden ryms — aldrig smalare än den norska, som täcker
den svenska. Knappen ritas om ur källbilden som i knapp.py (rita_box gör
rektanglar av rundade pillar). Pris ur carashell.com 2026-10-01: 21 × 10 ft $199,
jämförpris $249.
"""
import json, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont
B = os.path.dirname(os.path.abspath(__file__))
ROT = os.path.abspath(os.path.join(B, "../../../.."))
NO = os.path.join(ROT, "market-expansion/no/notion-batches/2026-10-01")
FET = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
NORMAL = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
copy = json.load(open(f"{B}/adcopy-US.json", encoding="utf-8"))
knapp = json.load(open(f"{B}/knapp-stil.json", encoding="utf-8"))   # mätt i SE-bilden (NO-rundans matt/ committades inte)
PAR = {"Takoverdrag_OB_15_1": "CaraShellRoof_US_OB_115_1", "Takoverdrag_OB_21_1": "CaraShellRoof_US_OB_121_1"}
SE = {"Takoverdrag_OB_15_1": "CaraShellRoof_OB_115_1", "Takoverdrag_OB_21_1": "CaraShellRoof_OB_121_1"}
def bredd(t, fet, s):
    bb = ImageFont.truetype(FET if fet else NORMAL, s).getbbox(t); return bb[2] - bb[0]
os.makedirs(f"{B}/us", exist_ok=True)
for kall, mal in PAR.items():
    rutor = json.load(open(f"{NO}/texter/{kall}.json", encoding="utf-8"))
    rader = copy[mal]["bild"]
    text_rutor, ut = [r for r in rutor if "text" in r], []
    assert len(text_rutor) == len(rader) - 1, (kall, len(text_rutor), len(rader))
    for r, t in zip(text_rutor, rader[:-1]):
        x0, y0, x1, y1 = r["box"]; mitt = (x0 + x1) / 2
        br = max(x1 - x0, int(bredd(t, r["fet"], r["storlek"]) / 0.88) + 24)
        extra = {"utvidga": 6} if r["box"][1] > 900 else {}   # pris + jämförpris: svenska raden var bredare, spår blev kvar med 3 (OB_121_1)
        ut.append({**r, **extra, "box": [int(max(0, mitt - br / 2)), y0, int(min(1080, mitt + br / 2)), y1], "text": t})
    if kall == "Takoverdrag_OB_21_1":
        # Priset och jämförpriset står på helt vit bakgrund. Suddningen lämnade
        # svaga spår av de bredare svenska raderna; rent vitt först, runt
        # hjulskuggan (mätt: grå x 631..746 ned till y 990).
        VIT = {"fyll": "ljus", "fyllfarg": [255, 255, 255], "alfa": 255, "radie": 0}
        ut = [{**VIT, "box": [330, 958, 630, 994]}, {**VIT, "box": [330, 994, 760, 1045]},
              {**VIT, "box": [200, 1078, 880, 1140]}] + ut
    json.dump(ut, open(f"{B}/texter-{mal}.json", "w"), ensure_ascii=False, indent=1)
    src = f"{B}/se/{SE[kall]}/{SE[kall]}.jpg"; dst = f"{B}/us/{mal}.jpg"
    subprocess.run([sys.executable, f"{ROT}/pipeline/oversatt-bild.py", "--in", src, "--ut", dst, "--texter", f"{B}/texter-{mal}.json"], check=True)
    # knappen, som knapp.py
    k = knapp[kall]; text = rader[-1]
    bild = Image.open(dst).convert("RGB"); kalla = Image.open(src).convert("RGB")
    x0, y0, x1, y1 = k["pill"]; font = ImageFont.truetype(FET, k["storlek"]); bb = font.getbbox(text)
    inre = (x1 - x0 + 1 - k["se_textbredd"]) / 2
    br = max(x1 - x0 + 1, int(bb[2] - bb[0] + 2 * inre)); px0, px1 = k["mitt"] - br // 2, k["mitt"] + br - br // 2
    omr = (max(0, px0 - 6), max(0, y0 - 6), min(bild.width, px1 + 7), min(bild.height, y1 + 7))
    bild.paste(kalla.crop(omr), (omr[0], omr[1]))
    d = ImageDraw.Draw(bild); d.rounded_rectangle([px0, y0, px1, y1], radius=k["radie"], fill=(24, 72, 120))
    d.text((k["mitt"], k["ink_topp"] - bb[1]), text, font=font, fill=(255, 255, 255), anchor="ma")
    if kall == "Takoverdrag_OB_21_1":
        # "kr" i den svenska prisraden låg på hjulskuggans nedre kant; suddningen
        # lämnade ljusgrå prickar (232..252) där. Skuggan själv är ~225 och rörs inte.
        import numpy as np
        arr = np.asarray(bild).copy(); omr = arr[976:1002, 620:700]
        m = omr.mean(axis=2); omr[(m > 232) & (m < 253)] = 255
        arr[976:1002, 620:700] = omr; bild = Image.fromarray(arr)
    bild.save(dst, quality=95); print("✓", dst)
