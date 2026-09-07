#!/usr/bin/env python3
# Mäter ordcaption-pillens ruta per källvideo (vitt piller, mörk text, centrerat nederst)
# → pill-matt.json. Samma metod som 2026-09-05-video2: komponenter med min(rgb)>235,
# 45≤h≤140, 120≤w≤640, y i 450–1150, centrerad ±120 px, fyllnad ≥0,55, mörk text inuti;
# median över alla frames (10 fps) per video.
import json, os, subprocess, sys, glob, numpy as np
from PIL import Image
from scipy import ndimage
import imageio_ffmpeg
B = os.path.dirname(os.path.abspath(__file__)); FF = imageio_ffmpeg.get_ffmpeg_exe()
ut = {}
for mp4 in sorted(glob.glob(f'{B}/*/up/*.mp4')):
    slug = mp4.split('/')[-3]; name = os.path.basename(mp4)[:-4]; key = f'{slug}_{name}'
    d = f'{B}/frames/_pill_{name}'; os.makedirs(d, exist_ok=True)
    subprocess.run([FF, '-v', 'error', '-y', '-i', mp4, '-vf', 'fps=10', f'{d}/f%04d.png'], check=True)
    boxes = []
    for f in sorted(glob.glob(f'{d}/*.png')):
        a = np.asarray(Image.open(f).convert('RGB')).astype(int); H, W = a.shape[:2]
        m = a.min(axis=2) > 235
        lab, n = ndimage.label(m)
        for sl in ndimage.find_objects(lab):
            y0, y1, x0, x1 = sl[0].start, sl[0].stop, sl[1].start, sl[1].stop
            h, w = y1 - y0, x1 - x0
            if not (45 <= h <= 140 and 120 <= w <= 640 and 450 <= y0 and y1 <= 1150): continue
            if abs((x0 + x1) / 2 - W / 2) > 120: continue
            comp = lab[sl] == lab[sl].max() if False else (lab[sl] > 0)
            if comp.mean() < 0.55: continue
            inner = a[y0:y1, x0:x1].max(axis=2)
            if (inner < 80).mean() < 0.02: continue   # ska finnas mörk text
            boxes.append((y0, y1, x0, x1))
    if boxes:
        b = np.array(boxes)
        ut[key] = {'y0': int(np.median(b[:, 0])), 'y1': int(np.median(b[:, 1])), 'x0': int(np.median(b[:, 2])), 'x1': int(np.median(b[:, 3])), 'andel': round(len(boxes) / len(glob.glob(f'{d}/*.png')), 2), 'n': len(boxes)}
    else:
        ut[key] = None
    print(key, ut[key])
json.dump(ut, open(f'{B}/pill-matt.json', 'w'), indent=1)
