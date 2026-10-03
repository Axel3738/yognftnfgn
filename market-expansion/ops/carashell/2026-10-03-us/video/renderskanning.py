#!/usr/bin/env python3
"""kallskanning.py — OCR:ar KÄLLVIDEORNA (4 fps) och listar varje svensk textrad med tid
och ruta. Underlaget för cap/*.json: vilka pop-texter och slutkort som måste bytas."""
import subprocess, os, glob, tempfile, re, json
from rapidocr_onnxruntime import RapidOCR
ocr = RapidOCR()
HÄR = os.path.dirname(os.path.abspath(__file__))
SVENSKT = re.compile(r"[åäöÅÄÖ]|\b(och|att|det|som|för|med|inte|hela|den|ett|är|kr|kronor|"
                     r"betyg|dragsko|rem|remmar|taket|husvagn|husbil|jag|en|på|bara|"
                     r"recensioner|vintersäsong|påse|väv|krok|pris|ord)\b", re.I)
rapport = {}
for f in sorted(glob.glob(os.path.join(HÄR, "render", "carashell_*.mp4"))):
    n = os.path.basename(f)[:-4]
    rader = []
    with tempfile.TemporaryDirectory() as tmp:
        subprocess.run(["ffmpeg","-v","error","-y","-i",f,"-vf","fps=4",os.path.join(tmp,"f%04d.png")], check=True)
        for p in sorted(glob.glob(os.path.join(tmp,"*.png"))):
            t = (int(os.path.basename(p)[1:5]) - 1) / 4
            res, _ = ocr(p)
            for box, txt, conf in (res or []):
                if conf < 0.5: continue
                if SVENSKT.search(txt):
                    xs=[pt[0] for pt in box]; ys=[pt[1] for pt in box]
                    rader.append({"t": t, "txt": txt, "box": [round(min(xs)),round(min(ys)),round(max(xs)),round(max(ys))]})
    # slå ihop samma text i följd
    ihop=[]
    for r in rader:
        if ihop and ihop[-1]["txt"]==r["txt"] and r["t"]-ihop[-1]["t1"]<=0.6:
            ihop[-1]["t1"]=r["t"]
            b=ihop[-1]["box"]; ihop[-1]["box"]=[min(b[0],r["box"][0]),min(b[1],r["box"][1]),max(b[2],r["box"][2]),max(b[3],r["box"][3])]
        else:
            ihop.append({"txt":r["txt"],"t0":r["t"],"t1":r["t"],"box":r["box"]})
    rapport[n]=ihop
    print("=====",n)
    for r in ihop: print(f"  {r['t0']:6.2f}–{r['t1']:6.2f}  {str(r['box']):24s} {r['txt']}")
json.dump(rapport, open(os.path.join(HÄR,"renderskanning.json"),"w"), ensure_ascii=False, indent=1)
