#!/usr/bin/env python3
"""piller.py — mäter ordcaption-pillret (vitt piller, mörk text, nederst) i källvideon:
per frame (2 fps) hittas rader i nedre halvan som är nästan vita över ≥ 120 px bredd
med mörka textpixlar inuti; rapporterar typiskt y-band och x-utsträckning.
    python3 piller.py <video.mp4>
"""
import sys, subprocess, numpy as np, json
f=sys.argv[1]
W,H=[int(x) for x in subprocess.run(["ffprobe","-v","error","-select_streams","v","-show_entries","stream=width,height","-of","csv=p=0",f],capture_output=True,text=True).stdout.strip().split(",")]
fps=2
p=subprocess.run(["ffmpeg","-v","error","-i",f,"-vf",f"fps={fps}","-f","rawvideo","-pix_fmt","gray","-"],capture_output=True)
raw=np.frombuffer(p.stdout,dtype=np.uint8); n=len(raw)//(W*H); fr=raw[:n*W*H].reshape(n,H,W).astype(int)
ys=[];xs0=[];xs1=[];hits=0
for i in range(n):
    g=fr[i]; lo=H//2
    white=(g[lo:]>235); dark=(g[lo:]<60)
    rows=np.nonzero((white.sum(axis=1)>120)&(dark.sum(axis=1)>3))[0]
    if len(rows)<20: continue
    # sammanhängande band
    y0=rows[0]; y1=rows[-1]
    if y1-y0>140: continue
    cols=np.nonzero(white[y0:y1+1].any(axis=0))[0]
    ys.append((lo+y0,lo+y1)); xs0.append(int(cols.min())); xs1.append(int(cols.max())); hits+=1
if hits:
    y0s=sorted(a for a,b in ys); y1s=sorted(b for a,b in ys)
    print(json.dumps({"W":W,"H":H,"frames":n,"med_piller":hits,"piller_y":[int(y0s[len(y0s)//2]),int(y1s[len(y1s)//2])],"y_min":int(y0s[0]),"y_max":int(y1s[-1]),"x_typ":[int(np.median(xs0)),int(np.median(xs1))]}))
else: print(json.dumps({"W":W,"H":H,"frames":n,"med_piller":0}))
