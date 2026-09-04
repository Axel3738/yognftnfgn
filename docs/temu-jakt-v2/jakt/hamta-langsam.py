#!/usr/bin/env python3
# hamta-langsam.py — samma kö som hamta-ko.py --us men EN förfrågan per intervall, aldrig avbrott.
# Temu stryper IP:n efter ~10 anrop på fem minuter (mätt 2026-09-04 07:22–07:27 UTC); en förfrågan
# var fjärde minut är tanken att hålla sig under den gränsen. Blockerat svar ⇒ vänta 10 min och
# försök samma id igen; fyra blockerade i rad ⇒ vänta 30 min. Loggar till stdout (hamta-langsam.log).
#   python3 hamta-langsam.py [--paus 240] [--max 60]
import json, glob, os, sys, time, subprocess, argparse, datetime
H = os.path.dirname(os.path.abspath(__file__))
ap = argparse.ArgumentParser(); ap.add_argument("--paus", type=float, default=240); ap.add_argument("--max", type=int, default=60); a = ap.parse_args()
def now(): return datetime.datetime.utcnow().strftime("%H:%M:%S")
def lasa():
    files = {}; queue = []
    for f in sorted(glob.glob(os.path.join(H, "*.json"))):
        if os.path.basename(f) == "dataset.json": continue
        try: data = json.load(open(f, encoding="utf-8"))
        except Exception: continue
        rows = (data.get("candidates") or data.get("kandidater")) if isinstance(data, dict) else data
        if not isinstance(rows, list): continue
        files[f] = data
        for r in rows:
            if not isinstance(r, dict): continue
            gid = str(r.get("goods_id") or ""); tier = (r.get("tier") or "").upper()
            if not gid.isdigit() or not tier.startswith(("A", "B")) or r.get("temu_us"): continue
            queue.append((gid, r, f))
    queue.sort(key=lambda q: 0 if (q[1].get("tier") or "").upper().startswith("A") else 1)
    seen = set(); q2 = []
    for q in queue:
        if q[0] in seen: continue
        seen.add(q[0]); q2.append(q)
    return files, q2[: a.max]
files, queue = lasa()
print(f"{now()} kö: {len(queue)} listningar, paus {a.paus}s", flush=True)
raw = os.path.join(H, "raw", "us"); vid = os.path.join(H, "video", "us"); os.makedirs(raw, exist_ok=True); os.makedirs(vid, exist_ok=True)
streak = 0; i = 0
while i < len(queue):
    gid, r, f = queue[i]
    out = os.path.join(raw, f"{gid}.json")
    cmd = ["python3", os.path.join(H, "temu-ld.py"), f"https://www.temu.com/g-{gid}.html", "--json", out, "--video", vid, "--en-gang"]
    try:
        res = subprocess.run(cmd, capture_output=True, text=True, timeout=400)
        d = json.loads(res.stdout) if res.stdout.strip().startswith("{") else {}
    except Exception as e:
        d = {"blocked": True, "error": str(e)[:100]}
    if d.get("blocked"):
        streak += 1
        vila = 1800 if streak >= 4 else 600
        print(f"{now()} [{i+1}/{len(queue)}] {gid} BLOCKERAD (#{streak}) — vilar {vila}s", flush=True)
        time.sleep(vila); continue
    streak = 0
    r["temu_us"] = {"title": d.get("title"), "price_usd": d.get("price_sek") if d.get("currency") == "USD" else None,
                    "currency": d.get("currency"), "rating": d.get("rating"), "review_count": d.get("review_count"),
                    "review_dates": d.get("review_dates"), "category_path": d.get("category_path"), "images": d.get("images"),
                    "image_descriptions": d.get("image_descriptions"), "video_url": d.get("video_url"), "video_file": d.get("video_file"),
                    "fetched": d.get("fetched")}
    r["temu_market"] = "us"; r["title_temu"] = d.get("title"); r["rating"] = d.get("rating"); r["review_count"] = d.get("review_count")
    r["image_count"] = len(d.get("images") or []); r["hero_url"] = (d.get("images") or [None])[0]
    r["video_url"] = d.get("video_url"); r["video_file"] = d.get("video_file"); r["temu_fetched"] = d.get("fetched")
    json.dump(files[f], open(f, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"{now()} [{i+1}/{len(queue)}] {gid} {str(d.get('title'))[:50]} · {d.get('price_sek')} {d.get('currency') or ''} · ★{d.get('rating')} ({d.get('review_count')}) · video={'ja' if d.get('video_url') else 'nej'}", flush=True)
    i += 1
    time.sleep(a.paus)
print(f"{now()} klart", flush=True)
