#!/usr/bin/env python3
"""matrader.py — mäter textrader i en bildannons: y-band där mörk (eller ljus) text
ligger, med x-utsträckning, för att skriva overrides.json utan att gissa.
    python3 matrader.py <bild.jpg> [--ljus]   (--ljus = ljus text på mörk bakgrund)
"""
import sys, numpy as np
from PIL import Image
f=sys.argv[1]; ljus='--ljus' in sys.argv
im=np.asarray(Image.open(f).convert('RGB')).astype(int); H,W,_=im.shape
s=im.sum(axis=2)
# textpixlar: mörka (<300) på ljus bakgrund, eller ljusa (>600) där lokal bakgrund är mörk
if ljus:
    mask=s>620
else:
    mask=s<330
# ignorera stora enfärgade block (foto): kräv att raden har < 60 % täckning
rows=mask.mean(axis=1)
band=[];y=0
while y<H:
    if 0.004<rows[y]<0.6:
        y0=y
        while y<H and 0.004<rows[y]<0.6: y+=1
        if y-y0>=8:
            xs=np.nonzero(mask[y0:y].any(axis=0))[0]
            cols=im[y0:y][mask[y0:y]]
            band.append((y0,y,int(xs.min()),int(xs.max()),[int(c) for c in np.median(cols,axis=0)]))
    y+=1
for y0,y1,x0,x1,c in band: print(f"y={y0}..{y1} h={y1-y0} x={x0}..{x1} textfärg={c}")
