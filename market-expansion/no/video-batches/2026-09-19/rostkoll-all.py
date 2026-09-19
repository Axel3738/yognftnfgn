# Kör pipeline/rostkoll.py på alla levererade videor mot sina svenska källor (Fas 2, /translate-no).
import os, subprocess, sys, json

BASE = os.path.dirname(os.path.abspath(__file__))
SKRIPT = os.path.join(BASE, '..', '..', '..', '..', 'pipeline', 'rostkoll.py')
FINAL = os.path.join(BASE, 'final')
SRT = os.path.join(BASE, 'srt-fixed')

resultat = {}
trasiga = 0
total = 0
for slug in sorted(os.listdir(FINAL)):
    slugdir = os.path.join(FINAL, slug)
    if not os.path.isdir(slugdir):
        continue
    for fn in sorted(os.listdir(slugdir)):
        if not fn.endswith('.mp4') or '.qa-' in fn:
            continue
        key = fn[3:-4] if fn.startswith('NO_') else fn[:-4]  # NO_<slug>_<K> -> <slug>_<K>
        ny = os.path.join(slugdir, fn)
        kalla = os.path.join(BASE, slug, 'up', key[len(slug) + 1:] + '.mp4')
        srt = os.path.join(SRT, key + '.srt')
        total += 1
        r = subprocess.run([sys.executable, SKRIPT, '--ny', ny, '--kalla', kalla, '--srt', srt],
                            capture_output=True, text=True)
        ok = r.returncode == 0
        if not ok:
            trasiga += 1
        print(f"{key}: exit {r.returncode}", flush=True)
        tail = (r.stdout + r.stderr).strip()
        print(tail, flush=True)
        resultat[key] = {'exit': r.returncode, 'output': tail}

print(f"\n{total - trasiga} av {total} klarade rostkollen.")
with open(os.path.join(BASE, 'rostkoll-resultat.json'), 'w') as f:
    json.dump(resultat, f, ensure_ascii=False, indent=1)
