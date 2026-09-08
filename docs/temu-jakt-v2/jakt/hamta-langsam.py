#!/usr/bin/env python3
# hamta-langsam.py — samma kö som hamta-ko.py --us men EN förfrågan per intervall, aldrig avbrott.
# Temu stryper IP:n efter ~10 anrop på fem minuter (mätt 2026-09-04 07:22–07:27 UTC); en förfrågan
# var fjärde minut är tanken att hålla sig under den gränsen. Blockerat svar ⇒ vänta 10 min och
# försök samma id igen; fyra blockerade i rad ⇒ vänta 30 min. Loggar till stdout (hamta-langsam.log).
#   python3 hamta-langsam.py [--paus 240] [--max 60]
import json, glob, os, sys, time, subprocess, argparse, datetime
H = os.path.dirname(os.path.abspath(__file__))
ap = argparse.ArgumentParser(); ap.add_argument("--paus", type=float, default=240); ap.add_argument("--max", type=int, default=60)
ap.add_argument("--visa", action="store_true", help="visa kön och avsluta utan att hämta")
# --burst N: hämta högst N och avsluta; avsluta direkt vid första block. Temu ger ~8 anrop per timme
# (mätt 2026-09-04: 10 på 5 min → block ~80 min; 8 på 14 min → block > 45 min). Bakgrundsprocesser dör
# när sessionens container somnar, så kön körs i korta skurar i aktiva turer i stället.
ap.add_argument("--burst", type=int, default=0); a = ap.parse_args()
# V2.1: koncept som fällts (concept_status FAIL i dataset.json) får ingen hämtbudget
try:
    FAIL_IDS = {str(r.get("goods_id")) for r in json.load(open(os.path.join(H, "dataset.json"), encoding="utf-8"))["candidates"] if r.get("concept_status") == "FAIL"}
except Exception: FAIL_IDS = set()
def now(): return datetime.datetime.utcnow().strftime("%H:%M:%S")
def fyll(r, d):
    r["temu_us"] = {"title": d.get("title"), "price_usd": d.get("price_sek") if d.get("currency") == "USD" else None,
                    "currency": d.get("currency"), "rating": d.get("rating"), "review_count": d.get("review_count"),
                    "review_dates": d.get("review_dates"), "category_path": d.get("category_path"), "images": d.get("images"),
                    "image_descriptions": d.get("image_descriptions"), "video_url": d.get("video_url"), "video_file": d.get("video_file"),
                    "fetched": d.get("fetched")}
    r["temu_market"] = "us"; r["title_temu"] = d.get("title"); r["rating"] = d.get("rating"); r["review_count"] = d.get("review_count")
    r["image_count"] = len(d.get("images") or []); r["hero_url"] = (d.get("images") or [None])[0]
    r["video_url"] = d.get("video_url"); r["video_file"] = d.get("video_file"); r["temu_fetched"] = d.get("fetched")
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
            if not gid.isdigit() or r.get("temu_us"): continue
            if gid in FAIL_IDS: continue          # V2.1: ingen hämtning på fällda koncept
            if tier.startswith("A"): pri = 0
            elif "NÄRMAST" in tier: pri = 1
            elif tier.startswith("B"): pri = 2
            elif tier.startswith("C"): pri = 4
            else: continue
            # cache: rå-svar som redan finns och inte är blockerat begärs aldrig om — raden fylls ur filen
            rawf = os.path.join(H, "raw", "us", f"{gid}.json")
            if os.path.exists(rawf):
                try:
                    d = json.load(open(rawf, encoding="utf-8"))
                    if not d.get("blocked"):
                        fyll(r, d); json.dump(data, open(f, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
                        print(f"{now()} {gid} fylld ur cache", flush=True); continue
                except Exception: pass
            queue.append((gid, r, f, pri))
    # prio.txt: id som ska hämtas FÖRST (V2.2:s TEST IF VERIFIED — material saknas), prioritet 0
    pf = os.path.join(H, "prio.txt")
    if os.path.exists(pf):
        for line in open(pf, encoding="utf-8"):
            pid = line.split()[0] if line.strip() and not line.startswith("#") else ""
            if not pid.isdigit(): continue
            rawf = os.path.join(H, "raw", "us", f"{pid}.json")
            if os.path.exists(rawf):
                try:
                    if not json.load(open(rawf, encoding="utf-8")).get("blocked"): continue
                except Exception: pass
            queue.append((pid, {"tier": "PRIO", "_alt": True}, None, 0))
    # alternativa listningar (alt/*.json) för koncept som fällts på en listning: prioritet strax efter A
    for f in sorted(glob.glob(os.path.join(H, "alt", "*.json"))):
        try: alt = json.load(open(f, encoding="utf-8"))
        except Exception: continue
        for l in alt.get("listings") or []:
            aid = str(l.get("goods_id") or "")
            if not aid.isdigit(): continue
            rawf = os.path.join(H, "raw", "us", f"{aid}.json")
            if os.path.exists(rawf):
                try:
                    if not json.load(open(rawf, encoding="utf-8")).get("blocked"): continue
                except Exception: pass
            queue.append((aid, {"tier": "ALT", "_alt": True}, None, 1))
    queue.sort(key=lambda q: q[3])
    seen = set(); q2 = []
    for q in queue:
        if q[0] in seen: continue
        seen.add(q[0]); q2.append(q[:3])
    return files, q2[: a.max]
files, queue = lasa()
print(f"{now()} kö: {len(queue)} listningar, paus {a.paus}s", flush=True)
if a.visa:
    for gid, r, f in queue: print("  ", gid, (r.get("tier") or "")[:20], os.path.basename(f) if f else "alt")
    sys.exit(0)
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
        if a.burst:
            print(f"{now()} [{i+1}/{len(queue)}] {gid} BLOCKERAD — skuren avbryts (hämtade {i})", flush=True); break
        vila = 1800 if streak >= 4 else 600
        print(f"{now()} [{i+1}/{len(queue)}] {gid} BLOCKERAD (#{streak}) — vilar {vila}s", flush=True)
        time.sleep(vila); continue
    streak = 0
    fyll(r, d)
    if f: json.dump(files[f], open(f, "w", encoding="utf-8"), ensure_ascii=False, indent=1)   # alt-listningar bor bara i raw/us
    print(f"{now()} [{i+1}/{len(queue)}] {gid} {str(d.get('title'))[:50]} · {d.get('price_sek')} {d.get('currency') or ''} · ★{d.get('rating')} ({d.get('review_count')}) · video={'ja' if d.get('video_url') else 'nej'}", flush=True)
    i += 1
    if a.burst and i >= a.burst:
        print(f"{now()} skur klar ({i} hämtade), {len(queue) - i} kvar i kön", flush=True); break
    time.sleep(a.paus)
print(f"{now()} klart", flush=True)
