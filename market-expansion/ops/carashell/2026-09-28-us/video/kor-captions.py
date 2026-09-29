#!/usr/bin/env python3
"""kor-captions.py — engelska ordcaptions på alla 12 renderade US-videor (US-runda 2026-09-18).
Kör pipeline/no-precis.py per konfig i cap/ (in = video/render/carashell_<n>.mp4,
ut = us/CaraShellRoof_US_<n>.mp4) och skriver resultat-captions.json.
    python3 market-expansion/ops/carashell/2026-09-18-us/video/kor-captions.py [--bara <n>]
"""
import glob, json, os, subprocess, sys
HÄR = os.path.dirname(os.path.abspath(__file__))
ROT = os.path.abspath(os.path.join(HÄR, "..", "..", "..", "..", ".."))
bara = sys.argv[sys.argv.index('--bara') + 1] if '--bara' in sys.argv else None
ut = {}
for k in sorted(glob.glob(os.path.join(HÄR, 'cap', '*.json'))):
    n = os.path.basename(k)[:-5]
    if bara and n != bara: continue
    K = json.load(open(k))
    inn = os.path.join(HÄR, 'cap', K['in'])
    if not os.path.exists(inn): ut[n] = {'status': 'SAKNAS', 'in': inn}; print(n, 'render saknas'); continue
    r = subprocess.run([sys.executable, os.path.join(ROT, 'pipeline', 'no-precis.py'), k], capture_output=True, text=True, stdin=subprocess.DEVNULL)
    sista = (r.stdout.strip().split('\n')[-3:] if r.stdout.strip() else []) + ([r.stderr.strip().split('\n')[-1]] if r.returncode else [])
    ut[n] = {'status': 'OK' if r.returncode == 0 else 'FEL', 'exit': r.returncode, 'logg': sista}
    print(n, ut[n]['status'], ' | '.join(sista))
json.dump(ut, open(os.path.join(HÄR, 'resultat-captions.json'), 'w'), indent=1, ensure_ascii=False)
sys.exit(1 if any(v['status'] != 'OK' for v in ut.values()) else 0)
