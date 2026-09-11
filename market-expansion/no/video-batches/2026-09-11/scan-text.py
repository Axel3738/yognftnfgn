import subprocess, sys, os, json, glob
import numpy as np

def scan(path):
    W = 270
    p = subprocess.run(['ffmpeg','-nostdin','-i',path,'-vf',f'fps=2,scale={W}:-1','-f','rawvideo','-pix_fmt','gray','-'],
                       capture_output=True)
    raw = p.stdout
    pr = subprocess.run(['ffprobe','-v','error','-select_streams','v:0','-show_entries','stream=width,height','-of','csv=p=0',path],capture_output=True,text=True)
    w0,h0 = map(int, pr.stdout.strip().split(','))
    H = round(h0 * W / w0)
    n = len(raw)//(W*H)
    if n == 0: return None
    frames = np.frombuffer(raw[:n*W*H], dtype=np.uint8).reshape(n,H,W)
    white = (frames > 230).sum(axis=2)
    textish = ((white > 40) & (white < 240))
    rowfrac = textish.mean(axis=0)
    bands=[]; y=0
    while y < H:
        if rowfrac[y] > 0.25:
            y0=y
            while y < H and rowfrac[y] > 0.10: y+=1
            bands.append((y0,y,float(rowfrac[y0:y].max())))
        else: y+=1
    scale = h0/H
    return {'h':h0,'w':w0,'frames':n,'bands':[{'y0':int(b[0]*scale),'y1':int(b[1]*scale),'peak':round(b[2],2)} for b in bands]}

BASE = os.path.dirname(os.path.abspath(__file__))
out={}
for f in sorted(glob.glob(BASE+'/*/up/*.mp4')):
    slug=f.split('/')[-3]; name=os.path.basename(f)[:-4]
    key = f'{slug}_{name}'
    out[key]=scan(f)
    bands = out[key]['bands'] if out[key] else None
    print(key, ':', json.dumps(bands))
json.dump(out, open(BASE+'/textscan.json','w'), indent=1)
