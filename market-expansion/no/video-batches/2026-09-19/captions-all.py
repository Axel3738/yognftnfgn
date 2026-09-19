# Kör pipeline/no-captions.py på alla renderade videor (Fas 2, /translate-no).
# out/<slug>_<K>_<n>.mp4 + srt-fixed/<slug>_<K>_<n>.srt -> final/<slug>/NO_<slug>_<K>_<n>.mp4
import os, subprocess, sys
from concurrent.futures import ThreadPoolExecutor

BASE = os.path.dirname(os.path.abspath(__file__))
SKRIPT = os.path.join(BASE, '..', '..', '..', '..', 'pipeline', 'no-captions.py')
REND = os.path.join(BASE, 'out')
SRT = os.path.join(BASE, 'srt-fixed')
FINAL = os.path.join(BASE, 'final')

jobb = []
for fn in sorted(os.listdir(REND)):
    if not fn.endswith('.mp4'):
        continue
    key = fn[:-4]
    slug = key.split('_')[0]
    out_dir = os.path.join(FINAL, slug)
    os.makedirs(out_dir, exist_ok=True)
    out = os.path.join(out_dir, f'NO_{key}.mp4')
    if os.path.exists(out) and os.path.getsize(out) > 100000:
        print('finns redan', out)
        continue
    jobb.append((key, os.path.join(REND, fn), os.path.join(SRT, key + '.srt'), out))


def kor(j):
    key, video, srt, out = j
    r = subprocess.run([sys.executable, SKRIPT, video, srt, out],
                       capture_output=True, text=True)
    tail = (r.stdout + r.stderr).strip().splitlines()[-3:]
    return key, r.returncode, ' | '.join(tail)


with ThreadPoolExecutor(max_workers=4) as ex:
    for key, rc, msg in ex.map(kor, jobb):
        print(f'{key}: exit {rc} — {msg}', flush=True)
