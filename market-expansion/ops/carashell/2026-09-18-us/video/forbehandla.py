#!/usr/bin/env python3
"""forbehandla.py — kraftig blur i de rutor där källans röda pop-texter sitter, bara under
deras tidsfönster (forbehandla.json ur bygg-cap.py). no-precis.py:s egen blur (boxblur 14)
lämnar 150 px höga röda bokstäver som en rosa fläck; här boxblur 40 i tre pass, sedan
lägger no-precis den mörka plattan + den amerikanska texten ovanpå.
    python3 forbehandla.py [--bara <n>]
Läser video/render/carashell_<n>.mp4 → video/forbehandlad/carashell_<n>.mp4.
⚠️ Alla filer får dessutom 2,5 s klonad slutframe (tpad): no-precis.py:s ffmpeg-kommando
kör -shortest med råmask-strömmar och tappade exakt 50 frames (2 s) i slutet på ALLA åtta
videor (mätt 2026-09-18: render 643 frames → ut 593) — i PD_104_H1 låg "Ninety-day
guarantee." i de två sekunderna. Med paddningen tappas de klonade framesen i stället, och
trimma.py klipper utfilen till ljudets längd.
"""
import json, os, subprocess, sys, shutil
HÄR = os.path.dirname(os.path.abspath(__file__))
bara = sys.argv[sys.argv.index("--bara") + 1] if "--bara" in sys.argv else None
F = json.load(open(os.path.join(HÄR, "forbehandla.json")))
os.makedirs(os.path.join(HÄR, "forbehandlad"), exist_ok=True)
for n, rutor in F.items():
    if bara and n != bara: continue
    inn = os.path.join(HÄR, "render", f"carashell_{n}.mp4"); ut = os.path.join(HÄR, "forbehandlad", f"carashell_{n}.mp4")
    if not os.path.exists(inn): print(n, "render saknas"); continue
    fc = "[0:v]format=yuv420p[v0]"; cur = "v0"
    for i, r in enumerate(rutor):
        x0, y0, x1, y1 = r["rect"]; t0, t1 = r["t"]
        w, h = (x1 - x0) // 2 * 2, (y1 - y0) // 2 * 2
        fc += f";[{cur}]split[a{i}][b{i}];[b{i}]crop={w}:{h}:{x0}:{y0},boxblur=40:3[bl{i}];[a{i}][bl{i}]overlay={x0}:{y0}:enable='between(t,{t0},{t1})'[v{i+1}]"
        cur = f"v{i+1}"
    fc += f";[{cur}]tpad=stop_mode=clone:stop_duration=2.5[vp]"; cur = "vp"
    cmd = ["ffmpeg", "-y", "-nostdin", "-v", "error", "-i", inn, "-filter_complex", fc, "-map", f"[{cur}]", "-map", "0:a?", "-c:v", "libx264", "-crf", "18", "-preset", "veryfast", "-c:a", "copy", ut]
    r = subprocess.run(cmd, capture_output=True, text=True)
    print(n, "OK" if r.returncode == 0 else f"FEL {r.stderr[-300:]}")
