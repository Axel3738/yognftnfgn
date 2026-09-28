#!/usr/bin/env python3
"""Mäter ordcaption-pillret per video innan no-precis.py körs.

Lärdomen i no-precis.py: pillerhöjden är INTE densamma i en batch — mät den,
annars hittas pillret bara i varannan frame och den svenska texten ligger kvar
under den norska. Skriptet kör hitta_piller med vitt öppna gränser på ett urval
frames och rapporterar vad som faktiskt finns i videon.
"""
import sys, os, glob, subprocess, tempfile
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../pipeline'))
from importlib import util as _u
spec = _u.spec_from_file_location('np_', os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../pipeline/no-precis.py'))
mod = _u.module_from_spec(spec); spec.loader.exec_module(mod)

for f in sorted(glob.glob(os.path.join(os.path.dirname(os.path.abspath(__file__)), '*/up/*.mp4'))):
    namn = os.path.basename(os.path.dirname(os.path.dirname(f))) + '_' + os.path.basename(f)[:-4]
    with tempfile.TemporaryDirectory() as td:
        subprocess.run(['ffmpeg','-v','error','-i',f,'-vf','fps=3','-q:v','2',os.path.join(td,'f%04d.jpg')], check=True)
        boxar = []
        for p in sorted(glob.glob(os.path.join(td,'*.jpg'))):
            g = np.array(Image.open(p).convert('L'))
            b = mod.hitta_piller(g, (int(g.shape[0]*0.55), g.shape[0]-4), x0=0, x1=g.shape[1],
                                 h_min=25, h_max=200, skala=g.shape[1]/720, bredd_max=g.shape[1])
            if b: boxar.append(b)
        if not boxar:
            print(f'{namn:26s} INGET PILLER HITTAT'); continue
        a = np.array(boxar)
        h = a[:,3]-a[:,1]; w = a[:,2]-a[:,0]; cy = (a[:,1]+a[:,3])//2; cx=(a[:,0]+a[:,2])//2
        n = len(sorted(glob.glob(os.path.join(td,'*.jpg'))))
        print(f'{namn:26s} piller i {len(boxar)}/{n} frames · h {h.min()}-{h.max()} (median {int(np.median(h))}) · '
              f'b {w.min()}-{w.max()} · cy {cy.min()}-{cy.max()} (median {int(np.median(cy))}) · cx median {int(np.median(cx))} · '
              f'y {a[:,1].min()}-{a[:,3].max()}')
