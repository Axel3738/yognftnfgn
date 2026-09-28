#!/usr/bin/env python3
"""passa.py — mäter den engelska raden mot rutan INNAN rendering: bryter som
_passa/_bryt i oversatt-bild.py och säger KRYMPER om den inte får plats på
kalibrerad storlek. En rad som krymper blir mindre text än den svenska."""
import json, pathlib
from PIL import ImageFont, ImageDraw, Image
H=pathlib.Path(__file__).parent
FET="/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
REG="/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
d=ImageDraw.Draw(Image.new("RGB",(10,10)))
ROLLER=[("0","rubrik",3),("1","underrad",2),("2","etikett",1),("3","pris",1),("4","knapp",1)]
c=json.loads((H/"bilder-copy.json").read_text(encoding="utf-8"))
ov=json.loads((H/"bilder/overrides.json").read_text(encoding="utf-8"))
fel=0
for namn in [k for k in c if not k.startswith("_")]:
    print("===",namn,"===")
    boxar=ov[namn]["box_for_form"]
    for k,roll,maxr in ROLLER:
        b=boxar[k][0]; x0,y0,x1,y1=b["box"]; w=x1-x0
        maxb=w-2*max(16,int(w*0.06))
        f=ImageFont.truetype(FET if b.get("fet") else REG, b["storlek"])
        txt=c[namn][roll]; rader=[]; cur=""
        for o in txt.split():
            t=(cur+" "+o).strip()
            if d.textlength(t,font=f)<=maxb: cur=t
            else:
                if cur: rader.append(cur)
                cur=o
        if cur: rader.append(cur)
        br=[round(d.textlength(r,font=f)) for r in rader]
        ok = len(rader)<=maxr and max(br)<=maxb
        if not ok: fel+=1
        print(f"  {roll:9s} storlek {b['storlek']:3d} maxbredd {maxb:4d} → {len(rader)} rad(er) (tak {maxr}) {br}  {'OK' if ok else 'KRYMPER'}")
        for r in rader: print("             |",r)
raise SystemExit(1 if fel else 0)
