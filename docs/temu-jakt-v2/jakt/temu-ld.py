#!/usr/bin/env python3
# temu-ld.py — läser en Temu-produktsida som Googlebot och plockar ut den server-
# renderade JSON-LD-datan (pris, betyg, antal recensioner, bilder, video, kategori).
#   python3 temu-ld.py <temu-url-eller-goods-id> [--json ut.json] [--video mapp]
# Skriver JSON till stdout. Hittar ALDRIG på fält: saknas de blir de null.
import sys, re, json, urllib.request, argparse, os, datetime
UA = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "sv-SE,sv;q=0.9"})
    with urllib.request.urlopen(req, timeout=40) as r:
        return r.read().decode("utf-8", "ignore"), r.geturl()
def main():
    ap = argparse.ArgumentParser(); ap.add_argument("target"); ap.add_argument("--json"); ap.add_argument("--video")
    ap.add_argument("--en-gang", action="store_true", help="ett enda anrop, ingen omförsöksloop (för långsam kö)")
    ap.add_argument("--fran-fil", help="parsa en redan sparad HTML-fil i stället för att hämta (cache)")
    a = ap.parse_args()
    t = a.target.strip()
    m = re.search(r"g-(\d{10,18})", t) or re.fullmatch(r"(\d{10,18})", t)
    gid = m.group(1) if m else None
    url = t if t.startswith("http") else f"https://www.temu.com/se/g-{gid}.html"
    # Temu svarar med ett tomt skal (<title>Temu</title>, ingen JSON-LD) när IP:n är
    # tillfälligt strypt. Försök tre gånger med växande paus innan vi ger upp.
    import time
    html = final = None
    if a.fran_fil:
        html, final = open(a.fran_fil, encoding="utf-8", errors="ignore").read(), url
    else:
      for attempt, pause in enumerate((0,) if a.en_gang else (0, 25, 60)):
        if pause: time.sleep(pause)
        html, final = fetch(url)
        if 'application/ld+json' in html and '"@type":"Product"' in html:
            break
    blocked = not ('application/ld+json' in html and '"@type":"Product"' in html)
    out = {"goods_id": gid, "url": url, "final_url": final, "fetched": datetime.datetime.utcnow().isoformat()+"Z",
           "blocked": blocked,
           "title": None, "category_path": None, "price_sek": None, "currency": None, "rating": None, "review_count": None,
           "review_dates": [], "images": [], "image_descriptions": [], "video_url": None, "video_uploaded": None,
           "og_description": None, "keywords": None, "captcha": "verify" in html[:2000].lower() and "<title>Temu</title>" in html}
    mt = re.search(r"<title>([^<]*)</title>", html); out["title"] = mt.group(1).strip() if mt else None
    mk = re.search(r'<meta name="keywords" content="([^"]*)"', html); out["keywords"] = mk.group(1) if mk else None
    md = re.search(r'<meta property="og:description" content="([^"]*)"', html); out["og_description"] = md.group(1) if md else None
    for lm in re.finditer(r'<script type="application/ld\+json">(.*?)</script>', html, re.S):
        try: d = json.loads(lm.group(1))
        except Exception: continue
        typ = d.get("@type")
        if typ == "BreadcrumbList":
            out["category_path"] = [i.get("name") for i in d.get("itemListElement", [])][1:-1]
        elif typ == "Product":
            out["title"] = d.get("name") or out["title"]
            imgs = d.get("image") or []
            for im in imgs:
                if isinstance(im, dict):
                    out["images"].append(im.get("contentURL")); out["image_descriptions"].append(im.get("description"))
                elif isinstance(im, str): out["images"].append(im)
            off = d.get("offers") or {}
            if isinstance(off, list): off = off[0] if off else {}
            out["price_sek"] = off.get("price") or off.get("lowPrice"); out["currency"] = off.get("priceCurrency")
            ag = d.get("aggregateRating") or {}
            out["rating"] = ag.get("ratingValue"); out["review_count"] = ag.get("reviewCount")
            for rv in d.get("review") or []:
                dp = rv.get("datePublished")
                if dp: out["review_dates"].append(dp)
        elif typ == "VideoObject":
            out["video_url"] = d.get("contentURL"); out["video_uploaded"] = d.get("uploadDate")
    # reservväg om Product-JSON saknar pris
    if out["price_sek"] is None:
        mp = re.search(r'"price":"([0-9.]+)"', html); out["price_sek"] = mp.group(1) if mp else None
    if a.video and out["video_url"]:
        os.makedirs(a.video, exist_ok=True)
        dst = os.path.join(a.video, f"{gid}.mp4")
        try:
            req = urllib.request.Request(out["video_url"], headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=120) as r, open(dst, "wb") as f: f.write(r.read())
            out["video_file"] = dst
        except Exception as e: out["video_file_error"] = str(e)[:200]
    s = json.dumps(out, ensure_ascii=False, indent=1)
    if a.json:
        with open(a.json, "w", encoding="utf-8") as f: f.write(s)
    print(s)
if __name__ == "__main__": main()
