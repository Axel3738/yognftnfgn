#!/usr/bin/env python3
"""svenskkoll.py — OCR:ar HELA den färdiga videon (4 fps) och larmar på svenska ord och
kr-priser. Ögat räcker inte: no-precis suddar pillret frame för frame, och missar den i
enstaka frames syns svenskan bara i just de framesen. Mätt 2026-09-23: CS_107 hade pillret
funnet i 265 av 620 frames — "och dragsko" och "Betyg" stod kvar i resten.
    python3 svenskkoll.py [namn …]
"""
import subprocess, sys, os, glob, tempfile, re, json
from rapidocr_onnxruntime import RapidOCR
ocr = RapidOCR()
HÄR = os.path.dirname(os.path.abspath(__file__))
US = os.path.join(HÄR, "..", "us")
SVENSKT = re.compile(
    r"[åäöÅÄÖ]|\b(och|att|det|som|för|med|inte|hela|den|ett|är|kr|kronor|betyg|dragsko|"
    r"rem|sp[aä]ra|st[öo]dben|redan|vav|v[aä]v|takl?uckorna|husvagn|husbil|taket|"
    r"vintersasong|forvaringspase|pase|finns|lager|begransat|recensioner|baverbutiken)\b",
    re.I)
namn = sys.argv[1:] or None
rapport = {}
for f in sorted(glob.glob(os.path.join(US, "CaraShellRoof_US_*.mp4"))):
    n = os.path.basename(f)[:-4].replace("CaraShellRoof_US_", "")
    if namn and n not in namn: continue
    dur = float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",f],
                               capture_output=True, text=True).stdout.strip())
    träffar = []
    with tempfile.TemporaryDirectory() as tmp:
        subprocess.run(["ffmpeg","-v","error","-y","-i",f,"-vf","fps=4",
                        os.path.join(tmp,"f%04d.png")], check=True)
        for p in sorted(glob.glob(os.path.join(tmp,"*.png"))):
            t = (int(os.path.basename(p)[1:5]) - 1) / 4
            r, _ = ocr(p)
            for box, txt, konf in (r or []):
                s = txt.strip()
                if konf > 0.55 and len(s) > 1 and SVENSKT.search(s):
                    träffar.append({"t": round(t,2), "text": s, "konf": round(float(konf),2)})
    rapport[n] = träffar
    print(f'{"✗" if träffar else "✓"} {n} ({dur:.1f}s): {len(träffar)} träffar')
    for x in träffar[:25]: print(f'    {x["t"]:6.2f}s  {x["text"]}')
json.dump(rapport, open(os.path.join(HÄR, "svenskkoll.json"), "w"), ensure_ascii=False, indent=1)
sys.exit(1 if any(rapport.values()) else 0)
