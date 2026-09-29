#!/usr/bin/env python3
"""pillerhojd.py — mäter ordcaption-pillrets HÖJD och y-läge per video, utan no-precis
h_min/h_max-taket. Samma mall förekommer i en låg och en hög variant, och taket 40–85
tappar den höga tyst (no-precis.py:s egen docstring). Kör på KÄLLAN.
    python3 pillerhojd.py <video.mp4> …
"""
import sys, subprocess, numpy as np, json
for f in sys.argv[1:]:
    W,H=[int(x) for x in subprocess.run(["ffprobe","-v","error","-select_streams","v",
        "-show_entries","stream=width,height","-of","csv=p=0",f],capture_output=True,text=True).stdout.strip().split(",")]
    fps=4
    p=subprocess.run(["ffmpeg","-v","error","-i",f,"-vf",f"fps={fps}","-f","rawvideo","-pix_fmt","gray","-"],capture_output=True)
    raw=np.frombuffer(p.stdout,dtype=np.uint8); n=len(raw)//(W*H); fr=raw[:n*W*H].reshape(n,H,W).astype(int)
    hojder=[]; y0s=[]; y1s=[]; x0s=[]; x1s=[]; tomma=0
    for i in range(n):
        g=fr[i]; lo=H//2
        white=(g[lo:]>228); dark=(g[lo:]<70)
        rader=np.nonzero((white.sum(axis=1)>90)&(dark.sum(axis=1)>2))[0]
        if len(rader)<10: tomma+=1; continue
        # gruppera rader med lucka ≤ 6
        grupper=[]; start=rader[0]; forra=rader[0]
        for r in rader[1:]:
            if r-forra>6: grupper.append((start,forra)); start=r
            forra=r
        grupper.append((start,forra))
        a,b=max(grupper,key=lambda g_:g_[1]-g_[0])
        if b-a<12: tomma+=1; continue
        cols=np.nonzero(white[a:b+1].any(axis=0))[0]
        hojder.append(b-a+1); y0s.append(lo+a); y1s.append(lo+b); x0s.append(int(cols.min())); x1s.append(int(cols.max()))
    if not hojder: print(f, "inget piller"); continue
    q=lambda v,p_: int(np.percentile(v,p_))
    print(json.dumps({"fil":f.split("/")[-1],"frames":n,"med_piller":len(hojder),"tomma":tomma,
        "hojd":[q(hojder,5),q(hojder,50),q(hojder,95)],
        "y0":[q(y0s,5),q(y0s,50),q(y0s,95)],"y1":[q(y1s,5),q(y1s,50),q(y1s,95)],
        "x":[q(x0s,5),q(x1s,95)]}))
