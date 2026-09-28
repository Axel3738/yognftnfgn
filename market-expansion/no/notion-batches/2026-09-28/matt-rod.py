#!/usr/bin/env python3
"""Mäter de inbrända RÖDA grafikerna i en renderad video: fönster + ruta.

Lärdomen från 2026-09-22: ett sammanhängande rött område i TIDEN behöver inte
bära samma text (CS_8_H1 hade tre grafiker varav den mellersta var ett
materialpåstående, inte ett pris). Skriptet delar därför bara på luckor i tiden
och skriver ut rutan per delfönster — innehållet måste läsas av ett öga.
"""
import sys, os, glob, subprocess, tempfile, re
import numpy as np
from PIL import Image

FPS = 10.0
pat = re.compile(r"f(\d+)\.jpg$")

def matt(video):
    with tempfile.TemporaryDirectory() as td:
        subprocess.run(['ffmpeg','-v','error','-i',video,'-vf','fps=%g'%FPS,'-q:v','2',
                        os.path.join(td,'f%05d.jpg')], check=True)
        rader = []
        for p in sorted(glob.glob(os.path.join(td,'*.jpg'))):
            t = (int(pat.search(os.path.basename(p)).group(1)) - 1) / FPS
            a = np.array(Image.open(p).convert('RGB')).astype(int)
            r,g,b = a[...,0],a[...,1],a[...,2]
            rod = (r>140)&(g<95)&(b<95)&(r-g>70)&(r-b>70)
            if rod.sum() < 300: rader.append((t,None)); continue
            ys,xs = np.where(rod)
            rader.append((t,(int(xs.min()),int(ys.min()),int(xs.max()),int(ys.max()),int(rod.sum()))))
        # dela i fönster på luckor > 0.35 s
        fonster, cur = [], []
        for t,b in rader:
            if b is None:
                if cur and t - cur[-1][0] > 0.35: fonster.append(cur); cur=[]
                continue
            if cur and t - cur[-1][0] > 0.35: fonster.append(cur); cur=[]
            cur.append((t,b))
        if cur: fonster.append(cur)
        return fonster

for v in sys.argv[1:]:
    print('===', os.path.basename(v))
    for f in matt(v):
        if len(f) < 3: continue
        a = np.array([x[1] for x in f]); ts=[x[0] for x in f]
        # stabil del = efter att ytan slutat växa (pop-in)
        yta = a[:,4]; topp = yta.max()
        stabil = [t for t,y in zip(ts,yta) if y > topp*0.75]
        print('  t %.2f-%.2f s (stabil %.2f-%.2f) · ruta x %d-%d y %d-%d · yta %d-%d px' % (
            ts[0], ts[-1], min(stabil), max(stabil), a[:,0].min(), a[:,2].max(), a[:,1].min(), a[:,3].max(), yta.min(), topp))
