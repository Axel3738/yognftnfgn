#!/usr/bin/env python3
# Minimal ffprobe-ersättare (ffprobe saknas i containern; ffmpeg finns via imageio-ffmpeg).
# Stöder exakt de två anrop pipeline/rostkoll.py gör.
import subprocess, sys, re, shutil
argv = sys.argv[1:]
fil = argv[-1]
ffm = shutil.which("ffmpeg") or "/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2"
r = subprocess.run([ffm, "-i", fil, "-hide_banner"], capture_output=True, text=True)
e = r.stderr
if "format=duration" in " ".join(argv):
    m = re.search(r"Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)", e)
    if m:
        h, mi, s = m.groups(); print(f"{int(h)*3600+int(mi)*60+float(s):.6f}")
elif "-select_streams" in argv:
    for i, ln in enumerate(re.findall(r"Stream #\d+:(\d+).*?: (Audio|Video)", e)):
        if ln[1] == "Audio": print(ln[0])
