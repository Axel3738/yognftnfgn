#!/usr/bin/env python3
"""Live-verifiering av Temu-listningar på SE-sajten — den enda kanal som ger pris (mätt 2026-09-08:
WebFetch ger bara <title>, Ad Library 403; containerns egen hämtning som Googlebot ger JSON-LD).

    python3 verifiera-live.py <goods-id> [<goods-id> ...] [--paus 30] [--us]

Per id skrivs v24/live/<id>/data.json + hero.jpg (+ g1..g3.jpg). Rå-HTML sparas i scratchpad, aldrig i
repot. Ett anrop per id, seriellt — Temu stryper efter ~8–10 anrop per timme och IP. En blockerad
rå-fil skrivs ALDRIG som verifierad: `verified` blir False och orsaken står i `verdict`.

Verdict-värden:
  LIVE          JSON-LD Product med pris, bild och (om Temu skickar det) availability InStock
  BLOCKED       tomt skal / captcha — teknisk, säger inget om produkten
  GONE          404, eller omdirigerad bort från g-<id> (listningen borttagen)
  NO_PRICE      sidan finns men inget pris i JSON-LD
  OUT_OF_STOCK  availability ≠ InStock
"""
import datetime
import json
import os
import re
import sys
import urllib.error
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
SCRATCH = os.environ.get(
    "TEMU_SCRATCH",
    "/tmp/claude-0/-home-user-yognftnfgn/6004bb4f-7a35-57f0-8251-e1adf76e9ef8/scratchpad/temu-html",
)
UA_BOT = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
UA_WIN = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"


def now():
    return datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA_BOT, "Accept-Language": "sv-SE,sv;q=0.9"})
    try:
        with urllib.request.urlopen(req, timeout=40) as r:
            return r.status, r.read().decode("utf-8", "ignore"), r.geturl()
    except urllib.error.HTTPError as e:
        return e.code, "", url


def dl(url, path):
    if os.path.exists(path) and os.path.getsize(path) > 0:
        return True
    try:
        req = urllib.request.Request(url, headers={"User-Agent": UA_WIN})
        with urllib.request.urlopen(req, timeout=60) as r, open(path, "wb") as f:
            f.write(r.read())
        return os.path.getsize(path) > 0
    except Exception as e:
        print(f"  ! bild: {e}")
        return False


def parse(html):
    out = {"title": None, "category_path": None, "price": None, "currency": None, "availability": None,
           "rating": None, "review_count": None, "review_dates": [], "images": [], "video_url": None,
           "video_uploaded": None, "sku": None}
    mt = re.search(r"<title>([^<]*)</title>", html)
    out["title"] = mt.group(1).strip() if mt else None
    product = False
    for lm in re.finditer(r'<script type="application/ld\+json">(.*?)</script>', html, re.S):
        try:
            d = json.loads(lm.group(1))
        except Exception:
            continue
        typ = d.get("@type")
        if typ == "BreadcrumbList":
            out["category_path"] = [i.get("name") for i in d.get("itemListElement", [])][1:-1]
        elif typ == "Product":
            product = True
            out["title"] = d.get("name") or out["title"]
            out["sku"] = d.get("sku")
            for im in d.get("image") or []:
                if isinstance(im, dict):
                    out["images"].append(im.get("contentURL"))
                elif isinstance(im, str):
                    out["images"].append(im)
            off = d.get("offers") or {}
            if isinstance(off, list):
                off = off[0] if off else {}
            out["price"] = off.get("price") or off.get("lowPrice")
            out["currency"] = off.get("priceCurrency")
            av = off.get("availability")
            out["availability"] = av.split("/")[-1] if isinstance(av, str) else av
            ag = d.get("aggregateRating") or {}
            out["rating"] = ag.get("ratingValue")
            out["review_count"] = ag.get("reviewCount")
            for rv in d.get("review") or []:
                if rv.get("datePublished"):
                    out["review_dates"].append(rv["datePublished"])
        elif typ == "VideoObject":
            out["video_url"] = d.get("contentURL")
            out["video_uploaded"] = d.get("uploadDate")
    out["images"] = list(dict.fromkeys(u for u in out["images"] if u))
    return out, product


def verify(gid, us=False):
    url = f"https://www.temu.com/{'' if us else 'se/'}g-{gid}.html"
    outdir = os.path.join(HERE, "live", gid)
    os.makedirs(outdir, exist_ok=True)
    os.makedirs(SCRATCH, exist_ok=True)
    t = now()
    status, html, final = fetch(url)
    with open(os.path.join(SCRATCH, f"{gid}.html"), "w", encoding="utf-8") as f:
        f.write(html)
    d = {"goods_id": gid, "url": url, "final_url": final, "http_status": status, "fetched": t,
         "market": "us" if us else "se", "verified": False, "verdict": None}
    if status == 404 or (final and f"g-{gid}" not in final):
        d["verdict"] = "GONE"
    else:
        p, product = parse(html)
        d.update(p)
        captcha = "verify" in html[:2000].lower() and "<title>Temu</title>" in html
        if not product:
            d["verdict"] = "BLOCKED"
            d["captcha"] = captcha
        elif not d.get("price"):
            d["verdict"] = "NO_PRICE"
        elif d.get("availability") and d["availability"] != "InStock":
            d["verdict"] = "OUT_OF_STOCK"
        else:
            d["verdict"] = "LIVE"
    if d["verdict"] == "LIVE":
        d["hero_file"] = None
        if d["images"]:
            if dl(d["images"][0], os.path.join(outdir, "hero.jpg")):
                d["hero_file"] = "hero.jpg"
            for i, u in enumerate(d["images"][1:4], 1):
                dl(u, os.path.join(outdir, f"g{i}.jpg"))
        d["verified"] = bool(d["hero_file"])
        if not d["verified"]:
            d["verdict"] = "NO_IMAGE"
    if d["verdict"] == "BLOCKED":
        # En blockerad hämtning är ingen data — skriv inget i repot (bara i scratch), så att kvittot bara bär riktiga svar.
        bp = os.path.join(outdir, "data.json")
        if os.path.exists(bp):
            try:
                if json.load(open(bp)).get("verdict") == "BLOCKED":
                    os.remove(bp)
            except Exception:
                os.remove(bp)
        if not os.listdir(outdir):
            os.rmdir(outdir)
        with open(os.path.join(SCRATCH, f"{gid}.blocked.json"), "w", encoding="utf-8") as f:
            json.dump(d, f, ensure_ascii=False, indent=1)
    else:
        with open(os.path.join(outdir, "data.json"), "w", encoding="utf-8") as f:
            json.dump(d, f, ensure_ascii=False, indent=1)
    print(f"{t} {gid} {d['verdict']:12} {d.get('price')} {d.get('currency')} ★{d.get('rating')} "
          f"({d.get('review_count')}) bilder={len(d.get('images') or [])} video={'ja' if d.get('video_url') else 'nej'} "
          f"lager={d.get('availability')} | {(d.get('title') or '')[:70]}", flush=True)
    return d


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    us = "--us" in sys.argv
    paus = 30.0
    if "--paus" in sys.argv:
        paus = float(sys.argv[sys.argv.index("--paus") + 1])
        args = [a for a in args if a != sys.argv[sys.argv.index("--paus") + 1]]
    import time
    for i, gid in enumerate(args):
        if i:
            time.sleep(paus)
        d = verify(gid, us=us)
        if d["verdict"] == "BLOCKED":
            print("  BLOCKERAD — avbryter skuren (hämtbudgeten är slut, vänta 60–80 min)", flush=True)
            break


if __name__ == "__main__":
    main()
