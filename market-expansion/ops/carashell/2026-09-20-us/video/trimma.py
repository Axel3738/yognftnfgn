#!/usr/bin/env python3
"""trimma.py — klipper us/CaraShellRoof_US_<n>.mp4 till ljudspårets längd (paddningen i
forbehandla.py ger ett videospår som är längre än ljudet efter no-precis). -c copy, klipp
på utnivå; rapporterar frames före/efter.
    python3 trimma.py [--bara <n>]
"""
import os, subprocess, sys, shutil
HÄR=os.path.dirname(os.path.abspath(__file__)); US=os.path.join(HÄR,"..","us")
bara=sys.argv[sys.argv.index("--bara")+1] if "--bara" in sys.argv else None
def probe(f,sel,ent):
    return subprocess.run(["ffprobe","-v","error","-select_streams",sel,"-show_entries",ent,"-of","csv=p=0",f],capture_output=True,text=True).stdout.strip().split("\n")[0]
for n in ["OB_101_H1","PD_107_H1","RI_103_H1","PD_106_H1"]:
    if bara and n!=bara: continue
    f=os.path.join(US,f"CaraShellRoof_US_{n}.mp4"); a=float(probe(f,"a","stream=duration")); v=float(probe(f,"v","stream=duration"))
    if v<=a+0.05: print(n,"video",v,"ljud",a,"— ingen trimning"); continue
    tmp=f+".trim.mp4"
    r=subprocess.run(["ffmpeg","-y","-nostdin","-v","error","-i",f,"-t",f"{a:.3f}","-c","copy","-movflags","+faststart",tmp],capture_output=True,text=True)
    if r.returncode: print(n,"FEL",r.stderr[-200:]); continue
    shutil.move(tmp,f); print(n,"video",v,"→",probe(f,"v","stream=duration"),"ljud",a)
