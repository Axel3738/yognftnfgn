#!/usr/bin/env python3
"""Pillermått per RENDERAD video — zon, höjd och bredd till captions-blocket.

Zonen måste mätas per video (lärdom 2026-09-16: med fel zon hittades pillret i
160 av 786 frames och den svenska texten låg kvar på varannan cue), och höjden
likaså (lärdom 2026-09-22: samma mall finns i en hög variant).
"""
import sys, os, glob, subprocess, tempfile, re
import numpy as np
from PIL import Image
from importlib import util as _u
P = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../pipeline/no-precis.py')
spec = _u.spec_from_file_location('npx', P); mod = _u.module_from_spec(spec); spec.loader.exec_module(mod)

for v in sorted(sys.argv[1:]):
    with tempfile.TemporaryDirectory() as td:
        subprocess.run(['ffmpeg','-v','error','-i',v,'-vf','fps=5','-q:v','2',os.path.join(td,'f%05d.jpg')],check=True)
        filer = sorted(glob.glob(os.path.join(td,'*.jpg')))
        boxar=[]
        for p in filer:
            g=np.array(Image.open(p).convert('L'))
            b=mod.hitta_piller(g,(int(g.shape[0]*0.55),g.shape[0]-4),x0=0,x1=g.shape[1],
                               h_min=55,h_max=120,skala=g.shape[1]/720,bredd_max=g.shape[1])
            if b: boxar.append(b)
        if not boxar: print('%-26s INGET PILLER' % os.path.basename(v)); continue
        a=np.array(boxar); h=a[:,3]-a[:,1]; cy=(a[:,1]+a[:,3])//2
        print('%-26s %3d/%3d frames · h %d-%d (median %d) · y %d-%d · cy median %d · b %d-%d · cx median %d'
              % (os.path.basename(v)[:-4], len(boxar), len(filer), h.min(), h.max(), int(np.median(h)),
                 a[:,1].min(), a[:,3].max(), int(np.median(cy)), (a[:,2]-a[:,0]).min(), (a[:,2]-a[:,0]).max(),
                 int(np.median((a[:,0]+a[:,2])//2))))
