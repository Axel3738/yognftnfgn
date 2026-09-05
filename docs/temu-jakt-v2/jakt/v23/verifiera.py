#!/usr/bin/env python3
"""Live-verifiering av EN Temu-listning: JSON-LD + hero + galleri + video + frames.

    python3 verifiera.py <goods-id> [--se]

Skriver till v23/material/<id>/: data.json, hero.jpg, g1..g3.jpg, video.mp4, f_01..f_04.jpg (0–3 s),
f_s08.jpg. Skriver aldrig om en redan hämtad rå-fil. Ett anrop mot temu.com per körning —
aldrig parallellt (hämtbudgeten är ~8/timme).
"""
import json, os, subprocess, sys, urllib.request, shutil

HERE = os.path.dirname(os.path.abspath(__file__))
JAKT = os.path.dirname(HERE)
LD = os.path.join(JAKT, "temu-ld.py")
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"


def ffmpeg():
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        return shutil.which("ffmpeg")


def dl(url, path):
    if os.path.exists(path) and os.path.getsize(path) > 0:
        return True
    try:
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=60) as r, open(path, "wb") as f:
            f.write(r.read())
        return os.path.getsize(path) > 0
    except Exception as e:
        print(f"  ! kunde inte hämta {url[:70]}: {e}")
        return False


def main():
    gid = sys.argv[1]
    se = "--se" in sys.argv
    out = os.path.join(HERE, "material", gid)
    os.makedirs(out, exist_ok=True)
    data_p = os.path.join(out, "data.json")
    url = f"https://www.temu.com/{'se/' if se else ''}g-{gid}.html"
    if not os.path.exists(data_p):
        r = subprocess.run([sys.executable, LD, "--en-gang", url, "--json", data_p],
                           capture_output=True, text=True, timeout=120)
        if not os.path.exists(data_p):
            print("FEL: ingen data", r.stderr[-300:]); sys.exit(1)
    d = json.load(open(data_p))
    if d.get("blocked"):
        print(f"{gid}: BLOCKERAD"); sys.exit(2)
    imgs = list(dict.fromkeys(d.get("images") or []))
    print(f"{gid}: LIVE | {d.get('price_sek')} {d.get('currency')} | ★{d.get('rating')} ({d.get('review_count')}) | "
          f"{len(imgs)} bilder | video={'ja' if d.get('video_url') else 'nej'}")
    print(f"  titel: {(d.get('title') or '')[:150]}")
    cat = d.get("category_path")
    if cat: print(f"  kategori: {' > '.join(cat)}")
    descs = list(dict.fromkeys(x for x in (d.get("image_descriptions") or []) if x))
    if len(descs) > 1:
        print(f"  varianter/bildtexter ({len(descs)}):")
        for x in descs[:10]: print(f"    - {str(x)[:110]}")
    if imgs:
        dl(imgs[0], os.path.join(out, "hero.jpg"))
        for i, u in enumerate(imgs[1:4], 1):
            dl(u, os.path.join(out, f"g{i}.jpg"))
    v = d.get("video_url")
    if v:
        vp = os.path.join(out, "video.mp4")
        if dl(v, vp):
            ff = ffmpeg()
            if ff:
                subprocess.run([ff, "-loglevel", "error", "-y", "-i", vp, "-vf", "fps=1.5,scale=480:-1",
                                "-frames:v", "4", os.path.join(out, "f_%02d.jpg")])
                subprocess.run([ff, "-loglevel", "error", "-y", "-ss", "8", "-i", vp, "-vf", "scale=480:-1",
                                "-frames:v", "1", os.path.join(out, "f_s08.jpg")])
                print("  frames: f_01..f_04 (0–2,7 s), f_s08")
    print(f"  → {out}")


if __name__ == "__main__":
    main()
