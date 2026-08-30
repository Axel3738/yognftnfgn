#!/usr/bin/env python3
"""Morgonbatchens captions (damasker + jattefotboll): källorna har en vit
enradspill ~y1390-1505 i alla 24 videor (verifierat i frames 2026-08-30);
textscannens band smetas ut av snö/sand, så bandet är FAST här i stället
för scan-styrt. Samma teknik som burn-captions.py i övrigt.

  python3 burn-captions-3.py <slug> [<namn>]
"""
import os, subprocess, sys

BASE = os.path.dirname(os.path.abspath(__file__))
Y0, Y1, H = 1388, 1500, 1920

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
    h = Y1 - Y0
    cov = os.path.join(BASE, 'srt-fixed', key + '.cover.srt')
    cover_srt(fixed, cov)
    fs = 8
    margin_v = round((H - Y1) * 288 / H) + round((h * 288 / H - fs * 1.5) / 2)
    style = (f"FontName=Liberation Sans,Bold=1,FontSize={fs},PrimaryColour=&H00000000,"
             f"OutlineColour=&H00FFFFFF,BackColour=&H00FFFFFF,BorderStyle=4,Outline=2,"
             f"Shadow=0,MarginV={margin_v},MarginL=30,MarginR=30,Alignment=2,WrapStyle=1")
    srt_esc = cov.replace(':', '\\:').replace("'", "\\'")
    vf = (f"split[a][b];[b]crop=iw:{h}:0:{Y1 + 4},boxblur=6:2[strip];"
          f"[a][strip]overlay=0:{Y0}[cv];"
          f"[cv]subtitles={srt_esc}:force_style='{style}'")
    r = subprocess.run(['ffmpeg', '-nostdin', '-y', '-v', 'error', '-i', src,
                        '-filter_complex', vf, '-c:v', 'libx264', '-crf', '20', '-preset', 'medium',
                        '-c:a', 'copy', out], stdin=subprocess.DEVNULL)
    if r.returncode != 0: sys.exit(f'ffmpeg fail: {key}')
    print('✓', out)

slug = sys.argv[1]
only = sys.argv[2] if len(sys.argv) > 2 else None
names = sorted({f[len(slug) + 1:-4] for f in os.listdir(os.path.join(BASE, 'out'))
                if f.startswith(slug + '_') and f.endswith('.mp4')})
for n in names:
    if only and n != only: continue
    burn(slug, n)
