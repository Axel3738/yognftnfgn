#!/usr/bin/env python3
"""rodtext.py — hittar de stora röda (röd kant, vit fyllning) textöverläggen i en
källvideo: per frame (5 fps) räknas starkt röda pixlar; sammanhängande tidsfönster
med många röda pixlar rapporteras med tid och bbox. Dessutom slutkortet: frames vars
bakgrund är nästan helvit (Bäverbutikens/CaraShells slutkort).
    python3 rodtext.py <video.mp4>
"""
import sys, subprocess, numpy as np, json
f=sys.argv[1]
W,H=[int(x) for x in subprocess.run(["ffprobe","-v","error","-select_streams","v","-show_entries","stream=width,height","-of","csv=p=0",f],capture_output=True,text=True).stdout.strip().split(",")]
fps=5
p=subprocess.run(["ffmpeg","-v","error","-i",f,"-vf",f"fps={fps}","-f","rawvideo","-pix_fmt","rgb24","-"],capture_output=True)
raw=np.frombuffer(p.stdout,dtype=np.uint8); n=len(raw)//(W*H*3); fr=raw[:n*W*H*3].reshape(n,H,W,3).astype(int)
r,g,b=fr[...,0],fr[...,1],fr[...,2]
red=(r>170)&(g<80)&(b<80)
cnt=red.reshape(n,-1).sum(axis=1)
white=((r>235)&(g>235)&(b>235)).reshape(n,-1).mean(axis=1)
seg=[];i=0
while i<n:
    if cnt[i]>1500:
        j=i
        while j<n and cnt[j]>1500: j+=1
        m=red[i:j].any(axis=0); ys,xs=np.nonzero(m)
        seg.append({"t":[round(i/fps,2),round(j/fps,2)],"box":[int(xs.min()),int(ys.min()),int(xs.max()),int(ys.max())],"max_px":int(cnt[i:j].max())})
        i=j
    else: i+=1
slut=[i for i in range(n) if white[i]>0.6]
print(json.dumps({"W":W,"H":H,"dur":round(n/fps,2),"rod":seg,"slutkort_fran":round(slut[0]/fps,2) if slut else None,"slutkort_frames":len(slut)},ensure_ascii=False))
