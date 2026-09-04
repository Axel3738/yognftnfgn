#!/usr/bin/env python3
# hamta-ko.py — central, långsam Temu-hämtning för alla kandidater som överlevt gate 1–3.
# Läser hunt/*.json, väljer icke-eliminerade (eller eliminerade först i material/ekonomi),
# hämtar JSON-LD serieellt med paus, laddar ner video för de som har en, och fyller
# tillbaka pris/betyg/recensioner/bilder/video i kandidatobjekten (hunt/<kluster>.json).
#   python3 hamta-ko.py [--paus 20] [--max 60] [--bara-id id1,id2]
import json, glob, os, sys, time, subprocess, argparse
H = os.path.dirname(os.path.abspath(__file__))
ap = argparse.ArgumentParser(); ap.add_argument("--paus", type=float, default=20); ap.add_argument("--max", type=int, default=80)
ap.add_argument("--bara-id"); ap.add_argument("--video", action="store_true", default=True)
# --us: /se-sidan ger tomt skal (IP-block) men USA-sidan (utan landsprefix) serverar JSON-LD.
# Då sparas priset som price_usd och marknaden märks "us"; temu_price_sek lämnas null.
ap.add_argument("--us", action="store_true")
ap.add_argument("--aven-c", action="store_true", help="ta med Tier C också")
a = ap.parse_args()
EARLY = {"object", "presence", "shelf"}
queue = []
files = {}
for f in sorted(glob.glob(os.path.join(H, "*.json"))):
    if os.path.basename(f) in ("dataset.json",): continue
    try: data = json.load(open(f, encoding="utf-8"))
    except Exception: continue
    if isinstance(data, dict): data = data.get("candidates") or data.get("kandidater") or []
    if not isinstance(data, list): continue
    files[f] = data
    for r in data:
        if not isinstance(r, dict): continue
        gid = str(r.get("goods_id") or "")
        if not gid.isdigit(): continue
        elim = (r.get("eliminated_at") or "").lower()
        tier = (r.get("tier") or "").upper()
        if elim in EARLY and not tier.startswith(("A", "B")) and not (a.aven_c and tier.startswith("C")): continue
        if not a.aven_c and not tier.startswith(("A", "B")): continue
        if a.us and r.get("temu_us"): continue
        if not a.us and r.get("temu_price_sek") not in (None, "", "UNKNOWN") and r.get("video_url") is not None and r.get("video_checked"): continue
        queue.append((gid, r, f))
if a.bara_id:
    keep = set(a.bara_id.split(",")); queue = [q for q in queue if q[0] in keep]
# prioritera A/B först
queue.sort(key=lambda q: 0 if (q[1].get("tier") or "").upper().startswith("A") else 1 if (q[1].get("tier") or "").upper().startswith("B") else 2)
seen = set(); q2 = []
for q in queue:
    if q[0] in seen: continue
    seen.add(q[0]); q2.append(q)
queue = q2[: a.max]
print(f"kö: {len(queue)} listningar, paus {a.paus}s", flush=True)
raw = os.path.join(H, "raw", "us" if a.us else ""); os.makedirs(raw, exist_ok=True)
vid = os.path.join(H, "video", "us" if a.us else ""); os.makedirs(vid, exist_ok=True)
blocked_streak = 0
for i, (gid, r, f) in enumerate(queue):
    out = os.path.join(raw, f"{gid}.json")
    target = f"https://www.temu.com/g-{gid}.html" if a.us else gid
    cmd = ["python3", os.path.join(H, "temu-ld.py"), target, "--json", out] + (["--video", vid] if a.video else [])
    try:
        res = subprocess.run(cmd, capture_output=True, text=True, timeout=400)
        d = json.loads(res.stdout) if res.stdout.strip().startswith("{") else {}
    except Exception as e:
        d = {"blocked": True, "error": str(e)[:100]}
    if d.get("blocked"):
        blocked_streak += 1
        print(f"[{i+1}/{len(queue)}] {gid} BLOCKERAD", flush=True)
        if blocked_streak >= 3:
            print("tre blockerade i rad — avbryter, kör igen senare", flush=True); break
        time.sleep(a.paus * 3); continue
    blocked_streak = 0
    for k in ("title", "temu_price_sek", "rating", "review_count", "category_path", "video_url", "video_uploaded", "hero_url", "image_count", "review_dates"):
        pass
    if a.us:
        r["temu_us"] = {"title": d.get("title"), "price_usd": d.get("price_sek") if d.get("currency") == "USD" else None,
                        "currency": d.get("currency"), "rating": d.get("rating"), "review_count": d.get("review_count"),
                        "review_dates": d.get("review_dates"), "category_path": d.get("category_path"), "images": d.get("images"),
                        "image_descriptions": d.get("image_descriptions"), "video_url": d.get("video_url"), "video_file": d.get("video_file"),
                        "fetched": d.get("fetched")}
        r["temu_market"] = "us"; r["title_temu"] = d.get("title"); r["rating"] = d.get("rating"); r["review_count"] = d.get("review_count")
        r["image_count"] = len(d.get("images") or []); r["hero_url"] = (d.get("images") or [None])[0]
        r["video_url"] = d.get("video_url"); r["video_file"] = d.get("video_file"); r["temu_fetched"] = d.get("fetched")
    else:
        r["title_temu"] = d.get("title"); r["temu_price_sek"] = d.get("price_sek"); r["rating"] = d.get("rating")
        r["review_count"] = d.get("review_count"); r["review_dates"] = d.get("review_dates"); r["category_path"] = d.get("category_path")
        r["image_count"] = len(d.get("images") or []); r["hero_url"] = (d.get("images") or [None])[0]; r["images"] = d.get("images")
        r["variants_temu"] = d.get("image_descriptions"); r["video_url"] = d.get("video_url"); r["video_file"] = d.get("video_file")
        r["temu_fetched"] = d.get("fetched")
    print(f"[{i+1}/{len(queue)}] {gid} {str(d.get('title'))[:50]} · {d.get('price_sek')} {d.get('currency') or 'kr'} · ★{d.get('rating')} ({d.get('review_count')}) · video={'ja' if d.get('video_url') else 'nej'}", flush=True)
    json.dump(files[f], open(f, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    time.sleep(a.paus)
print("klart", flush=True)
