#!/usr/bin/env python3
"""Bränner norska captions över de inbrända svenska i renderade HeyGen-videor.

Per video: (1) täck käll-captionsbandet med intilliggande bildinnehåll
(remsan under bandet, lätt blur — INTE ren sudd) — käll-captionsen syns ~100 %
av speltiden i den här batchen (uppmätt i textscan.json), så täckningen ligger
hela videon; (2) bränn en tajt vit platta med svart norsk text mitt i bandet
(gapless cover-SRT så svenskt aldrig blinkar fram). MarginV/FontSize är i
ASS-skala (PlayResY 288), bandet mäts i källpixlar (1080×1920).

  python3 burn-captions.py <slug>            # alla videor för produkten
  python3 burn-captions.py <slug> <key>      # en video, t.ex. kranskydd SP_1_H1
Kräver: out/<slug>_<namn>.mp4 (renderade), srt-fixed/, textscan.json (från skanningen).
"""
import json, os, re, subprocess, sys

BASE = os.path.dirname(os.path.abspath(__file__))
SCAN = json.load(open(os.path.join(BASE, 'textscan.json')))

def cover_srt(src, dst, maxlen=34):
    r = subprocess.run(['python3', '/home/user/yognftnfgn/pipeline/cover-srt.py', src, f'--max={maxlen}'], capture_output=True, text=True)
    made = src.replace('.srt', '-cover.srt')
    if r.returncode != 0 or not os.path.exists(made):
        sys.exit(f'cover-srt fail: {r.stderr}')
    os.replace(made, dst)

def burn(slug, name):
    key = f'{slug}_{name}'
    src = os.path.join(BASE, 'out', key + '.mp4')
    fixed = os.path.join(BASE, 'srt-fixed', key + '.srt')
    final_dir = os.path.join(BASE, 'final', slug); os.makedirs(final_dir, exist_ok=True)
    out = os.path.join(final_dir, f'NO_{key}.mp4')
    # captions-bandet: föredra band som börjar i standardzonen; ljusa scener kan
    # dränka profilen (bälteslipen) — då används batchens standardband.
    bands = [b for b in SCAN[key]['bands'] if 1250 < b['y0'] < 1600]
    if bands:
        y0 = min(b['y0'] for b in bands) - 8
        y1 = max(b['y1'] for b in bands) + 8
    else:
        y0, y1 = 1388, 1496
    H = SCAN[key]['h']; h = y1 - y0
    cov = os.path.join(BASE, 'srt-fixed', key + '.cover.srt')
    cover_srt(fixed, cov)
    # ASS-skala: platta mitt i bandet. En cover-rad ≈ FontSize*1,5 ASS-enheter hög.
    fs = 8
    margin_v = round((H - y1) * 288 / H) + round((h * 288 / H - fs * 1.5) / 2)
    style = (f"FontName=Liberation Sans,Bold=1,FontSize={fs},PrimaryColour=&H00000000,"
             f"OutlineColour=&H00FFFFFF,BackColour=&H00FFFFFF,BorderStyle=4,Outline=2,"
             f"Shadow=0,MarginV={margin_v},MarginL=30,MarginR=30,Alignment=2,WrapStyle=1")
    srt_esc = cov.replace(':', '\\:').replace("'", "\\'")
    vf = (f"split[a][b];[b]crop=iw:{h}:0:{y1 + 4},boxblur=6:2[strip];"
          f"[a][strip]overlay=0:{y0}[cv];"
          f"[cv]subtitles={srt_esc}:force_style='{style}'")
    r = subprocess.run(['ffmpeg', '-nostdin', '-y', '-v', 'error', '-i', src,
                        '-filter_complex', vf, '-c:v', 'libx264', '-crf', '20', '-preset', 'medium',
                        '-c:a', 'copy', out], stdin=subprocess.DEVNULL)
    if r.returncode != 0: sys.exit(f'ffmpeg fail: {key}')
    print('✓', out)

slug = sys.argv[1]
only = sys.argv[2] if len(sys.argv) > 2 else None
names = [k.split(f'{slug}_', 1)[1] for k in SCAN if k.startswith(slug + '_')]
for n in sorted(names):
    if only and n != only: continue
    if not os.path.exists(os.path.join(BASE, 'out', f'{slug}_{n}.mp4')):
        print(f'· hoppar {n} (ingen renderad fil ännu)'); continue
    burn(slug, n)
