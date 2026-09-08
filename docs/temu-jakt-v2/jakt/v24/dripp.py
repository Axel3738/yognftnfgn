#!/usr/bin/env python3
"""Droppmatning av Temu-hämtningar: EN hämtning per intervall ur kön ko.txt, aldrig skurar.

    python3 dripp.py [--intervall 540] [--max 40]

Mätt 2026-09-08: skur om 8 gav block efter 2 (07:38–07:39) — budgeten är ett glidande fönster som delas
med andra sessioner på samma IP, inte "8 per timme sedan fritt". Droppet håller sig under det.
ko.txt: ett goods-id per rad (kommentarer med #). Redan LIVE-verifierade id hoppas över. Vid BLOCKED
väntas 15 min och samma id försöks igen; tre BLOCKED i rad → 30 min. Loggar en rad per hämtning.
"""
import datetime
import json
import os
import subprocess
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
KO = os.path.join(HERE, "ko.txt")
VER = os.path.join(HERE, "verifiera-live.py")


def now():
    return datetime.datetime.now(datetime.timezone.utc).strftime("%H:%M:%S")


def verified(gid):
    p = os.path.join(HERE, "live", gid, "data.json")
    if not os.path.exists(p):
        return False
    try:
        d = json.load(open(p))
        return d.get("verdict") in ("LIVE", "GONE", "NO_PRICE", "OUT_OF_STOCK", "NO_IMAGE")
    except Exception:
        return False


def next_id():
    if not os.path.exists(KO):
        return None
    for line in open(KO, encoding="utf-8"):
        s = line.split("#")[0].strip()
        if s.isdigit() and not verified(s):
            return s
    return None


def main():
    intervall = float(sys.argv[sys.argv.index("--intervall") + 1]) if "--intervall" in sys.argv else 540
    mx = int(sys.argv[sys.argv.index("--max") + 1]) if "--max" in sys.argv else 40
    done = 0
    streak = 0
    while done < mx:
        gid = next_id()
        if not gid:
            print(f"{now()} kön tom — klart", flush=True)
            return
        r = subprocess.run([sys.executable, VER, gid], capture_output=True, text=True, timeout=180)
        line = (r.stdout.strip().splitlines() or ["?"])[0]
        print(line, flush=True)
        if "BLOCKED" in line:
            streak += 1
            vila = 1800 if streak >= 3 else 900
            print(f"{now()} BLOCKED #{streak} — vilar {vila // 60} min", flush=True)
            time.sleep(vila)
            continue
        streak = 0
        done += 1
        time.sleep(intervall)
    print(f"{now()} max {mx} nådd", flush=True)


if __name__ == "__main__":
    main()
