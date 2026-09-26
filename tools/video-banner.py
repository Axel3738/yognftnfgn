#!/usr/bin/env python3
"""Bränner in en svart banner med vit text överst i en video eller bild (jpg/png).

Byggd 2026-09-26 för Grillklinikens fars dag-test ("Roliga duken": samma sex
videor, ett duplicerat adset med bannern "Farsdag 8 november"). Texten sätts
som skarp vektortext av Pillow, aldrig av en bildmodell, och ljudet kopieras
orört.

    python3 tools/video-banner.py <in.mp4> <ut.mp4> --text "Farsdag 8 november"
    python3 tools/video-banner.py <in.mp4> <ut.jpg> --text "..." --stillbild 1.0

Placering: i 9:16 (Reels/Stories) ligger bannern under appens översta
UI-remsa (16 % ned), i allt annat 6 % ned. Bredden följer texten.
Kräver ffmpeg (systemets eller imageio-ffmpeg) och Pillow.
"""
import argparse, json, os, shutil, subprocess, sys, tempfile
from PIL import Image, ImageDraw, ImageFont

TYPSNITT = [
    '/mnt/skills/examples/canvas-design/canvas-fonts/InstrumentSans-Bold.ttf',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
]

def ffmpeg():
    if shutil.which('ffmpeg'): return 'ffmpeg'
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        sys.exit('✗ ffmpeg saknas (pip install imageio-ffmpeg)')

def matt(ff, fil):
    ut = subprocess.run([ff, '-i', fil], capture_output=True, text=True).stderr
    import re
    m = re.search(r'Video:.*?(\d{2,5})x(\d{2,5})', ut)
    if not m: sys.exit(f'✗ hittar ingen videoström i {fil}')
    w, h = int(m.group(1)), int(m.group(2))
    rot = re.search(r'rotation of (-?\d+)', ut) or re.search(r'rotate\s*:\s*(-?\d+)', ut)
    if rot and abs(int(rot.group(1))) in (90, 270): w, h = h, w
    return w, h

def banner(w, h, text, yandel=None):
    """Returnerar (png-bild i videons storlek, genomskinlig utom bannern)."""
    lager = Image.new('RGBA', (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(lager)
    typs = next(t for t in TYPSNITT if os.path.exists(t))
    px = round(min(w * 0.058, h * 0.07))
    f = ImageFont.truetype(typs, px)
    while d.textlength(text, font=f) > w * 0.80: px -= 2; f = ImageFont.truetype(typs, px)
    tw = d.textlength(text, font=f); pad_x, pad_y = round(px * 0.9), round(px * 0.55)
    bw, bh = tw + 2 * pad_x, px + 2 * pad_y
    y = round(h * (yandel if yandel is not None else (0.16 if h / w > 1.6 else 0.06))); x = round((w - bw) / 2)
    d.rounded_rectangle([x, y, x + bw, y + bh], radius=round(bh * 0.18), fill=(0, 0, 0, 255))
    top = f.getbbox(text)[1]
    d.text((x + pad_x, y + pad_y - top * 0.5), text, font=f, fill=(255, 255, 255, 255))
    return lager

def main():
    a = argparse.ArgumentParser()
    a.add_argument('infil'); a.add_argument('utfil'); a.add_argument('--text', required=True)
    a.add_argument('--stillbild', type=float, default=None, help='sekund att ta en stillbild på (ger jpg)')
    a.add_argument('--y', type=float, default=None, help='bannerns överkant som andel av höjden (när videon har egen text där)')
    g = a.parse_args()
    if g.infil.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
        im = Image.open(g.infil).convert('RGBA'); w, h = im.size
        im.alpha_composite(banner(w, h, g.text, g.y))
        im = im.convert('RGB'); im.save(g.utfil, quality=95) if g.utfil.lower().endswith(('.jpg', '.jpeg')) else im.save(g.utfil)
        print(json.dumps({'ut': g.utfil, 'bredd': w, 'hojd': h, 'text': g.text}, ensure_ascii=False)); return
    ff = ffmpeg()
    w, h = matt(ff, g.infil)
    with tempfile.TemporaryDirectory() as tmp:
        png = os.path.join(tmp, 'banner.png'); banner(w, h, g.text, g.y).save(png)
        if g.stillbild is not None:
            cmd = [ff, '-loglevel', 'error', '-y', '-ss', str(g.stillbild), '-i', g.infil, '-i', png,
                   '-filter_complex', f'[0:v]scale={w}:{h}[v];[v][1:v]overlay=0:0', '-frames:v', '1', '-q:v', '2', g.utfil]
        else:
            cmd = [ff, '-loglevel', 'error', '-y', '-i', g.infil, '-i', png,
                   '-filter_complex', f'[0:v]scale={w}:{h}[v];[v][1:v]overlay=0:0,format=yuv420p',
                   '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-c:a', 'copy', '-movflags', '+faststart', g.utfil]
        r = subprocess.run(cmd, capture_output=True, text=True)
        if r.returncode: sys.exit('✗ ffmpeg: ' + r.stderr[-500:])
    print(json.dumps({'ut': g.utfil, 'bredd': w, 'hojd': h, 'text': g.text}, ensure_ascii=False))

if __name__ == '__main__':
    main()
