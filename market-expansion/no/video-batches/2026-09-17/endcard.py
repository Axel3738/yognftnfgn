# Slutkortssvep (Fas 2 steg 3, /translate-no): sista sekunden ur varje färdig video,
# så svensk butiksdomän/pris i slutkortet upptäcks före leverans.
import os, subprocess, imageio_ffmpeg

FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
BASE = os.path.dirname(os.path.abspath(__file__))
FINAL = os.path.join(BASE, 'final')
OUT = os.path.join(BASE, 'endcard-check')
os.makedirs(OUT, exist_ok=True)


def langd(path):
    r = subprocess.run([FFMPEG, '-i', path], capture_output=True, text=True)
    for rad in r.stderr.splitlines():
        if 'Duration:' in rad:
            t = rad.split('Duration:')[1].split(',')[0].strip()
            h, m, s = t.split(':')
            return int(h) * 3600 + int(m) * 60 + float(s)
    return None


for slug in sorted(os.listdir(FINAL)):
    d = os.path.join(FINAL, slug)
    if not os.path.isdir(d):
        continue
    for fn in sorted(os.listdir(d)):
        if not fn.endswith('.mp4'):
            continue
        path = os.path.join(d, fn)
        dur = langd(path)
        if dur is None:
            print('kunde inte läsa längd', fn)
            continue
        ts = max(0, dur - 0.4)
        out = os.path.join(OUT, fn[:-4] + '_slut.png')
        subprocess.run([FFMPEG, '-y', '-ss', f'{ts:.2f}', '-i', path,
                        '-frames:v', '1', '-vf', 'scale=360:-1', out],
                       capture_output=True)
        print('slutkort', fn, f'{dur:.1f}s')
