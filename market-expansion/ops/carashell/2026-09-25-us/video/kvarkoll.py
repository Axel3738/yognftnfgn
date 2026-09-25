#!/usr/bin/env python3
"""kvarkoll.py — hittar frames där det SVENSKA pillret står kvar i den färdiga videon.
Jämför källan (up/<n>.mp4) med utfilen (us/CaraShellRoof_US_<n>.mp4) frame för frame (5 fps):
där källan har ett piller (vitt band med mörk text i nedre halvan) och utfilens samma ruta
fortfarande har samma mörka textpixlar (> 60 % överlapp) är pillret orört = svenska kvar.
    python3 kvarkoll.py <n>   → JSON med tidsfönster + pillrets ruta
"""
import sys, subprocess, numpy as np, json, os
HÄR=os.path.dirname(os.path.abspath(__file__)); n=sys.argv[1]
def läs(f,fps=5):
    W,H=[int(x) for x in subprocess.run(["ffprobe","-v","error","-select_streams","v","-show_entries","stream=width,height","-of","csv=p=0",f],capture_output=True,text=True).stdout.strip().split(",")]
    p=subprocess.run(["ffmpeg","-v","error","-i",f,"-vf",f"fps={fps},scale={W}:{H}","-f","rawvideo","-pix_fmt","gray","-"],capture_output=True)
    raw=np.frombuffer(p.stdout,dtype=np.uint8); k=len(raw)//(W*H); return raw[:k*W*H].reshape(k,H,W).astype(int),W,H
a,W,H=läs(os.path.join(HÄR,"carashell","up",n+".mp4")); b,W2,H2=läs(os.path.join(HÄR,"..","us",f"CaraShellRoof_US_{n}.mp4"))
if (W2,H2)!=(W,H):  # utfilen kan ha annan storlek — skala källan
    from PIL import Image
    a=np.stack([np.asarray(Image.fromarray(f.astype(np.uint8)).resize((W2,H2))).astype(int) for f in a]); W,H=W2,H2
k=min(len(a),len(b)); kvar=[]
for i in range(k):
    g=a[i]; lo=H//2
    white=(g[lo:]>235); dark=(g[lo:]<60)
    rows=np.nonzero((white.sum(axis=1)>120)&(dark.sum(axis=1)>3))[0]
    if len(rows)<20: continue
    y0,y1=rows[0]+lo,rows[-1]+lo
    if y1-y0>140: continue
    cols=np.nonzero((g[y0:y1+1]>235).any(axis=0))[0]; x0,x1=cols.min(),cols.max()
    ta=(a[i][y0:y1+1,x0:x1+1]<60); tb=(b[i][y0:y1+1,x0:x1+1]<60)
    if ta.sum()>30 and (ta&tb).sum()/ta.sum()>0.6: kvar.append((i/5,[int(x0),int(y0),int(x1),int(y1)]))
seg=[]
for t,box in kvar:
    if seg and t-seg[-1]["t"][1]<=0.41: seg[-1]["t"][1]=t; seg[-1]["box"]=[min(seg[-1]["box"][0],box[0]),min(seg[-1]["box"][1],box[1]),max(seg[-1]["box"][2],box[2]),max(seg[-1]["box"][3],box[3])]
    else: seg.append({"t":[t,t],"box":box})
print(json.dumps({"n":n,"frames":k,"kvar":seg}))
