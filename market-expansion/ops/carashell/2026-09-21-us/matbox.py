#!/usr/bin/env python3
"""matbox.py — mäter varje bilds former ur oversatt-bild.py --analys (textutskriften,
som bär y/x) + ljusa textrader (etiketten är vit text direkt på fotot och saknas i
analysen). Skriver matbox.json som underlag till overrides.json — inget gissat.
    python3 matbox.py
"""
import json, re, subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image
HAR = Path(__file__).resolve().parent
ROT = HAR.parents[3]
FORM = re.compile(r"form (\d+): (\w+)\s+y=(\d+)\.\.(\d+) x=(\d+)\.\.(\d+)(?: rader=(\d+))?(?: färg=\[([\d, ]+)\])?")
RAD = re.compile(r"rad (\d+): y=(\d+)\.\.(\d+) h=(\d+) x=(\d+)\.\.(\d+) (FET|normal) textfärg=\[([\d, ]+)\] (\w+)")

def analys(f):
    p = subprocess.run([sys.executable, str(ROT/"pipeline"/"oversatt-bild.py"), "--in", str(f), "--analys"],
                       capture_output=True, text=True)
    former, nu = [], None
    for rad in p.stdout.splitlines():
        m = FORM.search(rad)
        if m:
            nu = {"form": int(m.group(1)), "typ": m.group(2), "y": [int(m.group(3)), int(m.group(4))],
                  "x": [int(m.group(5)), int(m.group(6))], "rader": int(m.group(7) or 1),
                  "plattfarg": [int(x) for x in m.group(8).split(",")] if m.group(8) else None, "radlista": []}
            former.append(nu); continue
        m = RAD.search(rad)
        if m and nu is not None:
            nu["radlista"].append({"y": [int(m.group(2)), int(m.group(3))], "h": int(m.group(4)),
                                   "x": [int(m.group(5)), int(m.group(6))], "fet": m.group(7) == "FET",
                                   "textfarg": [int(x) for x in m.group(8).split(",")], "just": m.group(9)})
    return former

def ljusrader(f, y0=1050, y1=1200):
    im = np.asarray(Image.open(f).convert("RGB")).astype(int)
    H, W, _ = im.shape
    s = im.sum(axis=2); mask = s > 690
    ut, y = [], max(0, y0)
    while y < min(H, y1):
        if 0.004 < mask[y].mean() < 0.5:
            a = y
            while y < min(H, y1) and 0.004 < mask[y].mean() < 0.5: y += 1
            if y - a >= 10:
                xs = np.nonzero(mask[a:y].any(axis=0))[0]
                ut.append({"y": [a, y], "x": [int(xs.min()), int(xs.max())], "h": y - a})
        y += 1
    return ut

ut = {}
for f in sorted((HAR/"bilder"/"se").glob("*.jpg")):
    ut[f.stem] = {"former": analys(f), "etikettrader": ljusrader(f)}
    print("===", f.stem)
    for x in ut[f.stem]["former"]:
        print(f"  form {x['form']} {x['typ']} y={x['y']} x={x['x']} rader={x['rader']} platta={x['plattfarg']}")
        for i, r in enumerate(x["radlista"]):
            print(f"      rad {i} y={r['y']} x={r['x']} h={r['h']} {'FET' if r['fet'] else 'normal'} färg={r['textfarg']} {r['just']}")
    for r in ut[f.stem]["etikettrader"]:
        print(f"  ETIKETT (ljus text) y={r['y']} x={r['x']} h={r['h']}")
(HAR/"matbox.json").write_text(json.dumps(ut, indent=1, ensure_ascii=False), encoding="utf-8")
