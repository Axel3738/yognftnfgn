#!/usr/bin/env python3
"""tidslinje.py — OCR:ar varje röd-fönster var 0,4 s så innehållsbytena inuti fönstret syns.
Utan det blir ett enda lager lagt över ett fönster som byter text (CS_108: 210D-väv → pris →
pris + jämförpris). Skriver tidslinje.json."""
import json, subprocess, tempfile, os, numpy as np
from PIL import Image
from rapidocr_onnxruntime import RapidOCR
ocr = RapidOCR()
m = json.load(open("matning.json"))
ut = {}
for n, v in m.items():
    f = f"carashell/up/{n}.mp4"
    ut[n] = []
    for i, (t0, t1) in enumerate(v["rod"]):
        rader = []
        t = t0
        with tempfile.TemporaryDirectory() as tmp:
            while t < t1:
                p = os.path.join(tmp, "f.png")
                subprocess.run(["ffmpeg","-v","error","-y","-ss",str(t),"-i",f,"-frames:v","1",p], check=True)
                im = np.array(Image.open(p).convert("RGB")).astype(int)
                r,g,b = im[...,0],im[...,1],im[...,2]
                rod = (r>170)&(g<80)&(b<80)
                box = None
                if rod.sum() > 1200:
                    ys,xs = np.nonzero(rod); box = [int(xs.min()),int(ys.min()),int(xs.max()),int(ys.max())]
                res,_ = ocr(p)
                txt = [x[1].strip() for x in (res or []) if x[2]>0.5 and box and
                       box[1]-30 <= (x[0][0][1]+x[0][2][1])/2 <= box[3]+30]
                rader.append({"t": round(t,1), "box": box, "text": " / ".join(txt)})
                t += 0.4
        ut[n].append({"fonster":[t0,t1], "prov": rader})
        print(f"== {n} fönster {i} [{t0}–{t1}]")
        for x in rader: print(f"   {x['t']:5.1f}s box={x['box']}  {x['text']}")
json.dump(ut, open("tidslinje.json","w"), ensure_ascii=False, indent=1)
