#!/usr/bin/env python3
"""rendera-012v2.py <KOD> — 012v2 (AI-bilder, ingen röst) på marknadens språk: samma sju orange rutor,
ny text ur <KOD>/012v2.json ({"texter": [sju strängar, \\n = radbrytning]}) och loggan i sista scenen
bortmålad (pipeline/logga.py), inget annat ändrat.
Skriver annonser/klar/<KOD>_012v2.mp4 + QA-bilder. Rutorna: 012v2.boxar.json (pipeline/textboxar.py)."""
import json, os, subprocess, sys
HAR = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HAR, '../../..'))
kod = sys.argv[1].upper()
texter = json.load(open(os.path.join(HAR, kod, '012v2.json')))['texter']
b = json.load(open(os.path.join(HAR, '012v2.boxar.json')))
assert len(b['segment']) == 7 and len(texter) == 7, 'sju rutor och sju texter'
sv_rader = [2, 2, 2, 1, 2, 1, 2]           # radantal i de svenska rutorna (avläst i bild 2026-09-29)
plan = []
for s, text, n in zip(b['segment'], texter, sv_rader):
    x0, y0, x1, y1 = s['ruta']
    plan.append({'a': s['a'], 'b': s['b'], 'text': text, 'mitt': [(x0 + x1) / 2, (y0 + y1) / 2], 'min': [x1 - x0 + 4, y1 - y0 + 4],
                 'max_bredd': 660, 'font_px': int((y1 - y0) / n * 0.70), 'farg': [255, 255, 255], 'bakgrund': [246, 132, 38, 255],
                 'radie': 6, 'pad': [14, 4], 'radavstand': 1.0})
ut = os.path.join(HAR, '../annonser/klar', f'{kod}_012v2.mp4')
os.makedirs(os.path.dirname(ut), exist_ok=True)
pf = os.path.join(HAR, 'ut', f'{kod}_012v2.plan.json'); os.makedirs(os.path.dirname(pf), exist_ok=True)
kalla = os.path.join(HAR, 'kalla', '012v2.mp4')
# Sista scenen (12,0 s → slut, stillastående) har loggan "MATSTRUMPOR.SE" på väggen — butikens namn och
# adress står aldrig i en annons. Lappen är samma för alla språk och byggs en gång ur källan.
LOGGA = {'a': 12.0, 'b': 99, 'sek': 12.4, 'ruta': [160, 10, 580, 262]}
lappfil = os.path.join(HAR, 'ut', '012v2.logga.png')
if not os.path.exists(lappfil):
    r = subprocess.run(['python3', os.path.join(REPO, 'pipeline/logga.py'), kalla, str(LOGGA['sek']),
                        ','.join(map(str, LOGGA['ruta'])), lappfil], capture_output=True, text=True)
    print(r.stdout.strip() or r.stderr[-600:])
    if r.returncode: sys.exit(r.returncode)
bilder = [{'a': LOGGA['a'], 'b': LOGGA['b'], 'fil': lappfil, 'x': LOGGA['ruta'][0], 'y': LOGGA['ruta'][1]}]
json.dump({'video': kalla, 'ut': ut, 'font': os.path.join(REPO, 'pipeline/fonts/Poppins-SemiBold.ttf'), 'bilder': bilder, 'texter': plan},
          open(pf, 'w'), ensure_ascii=False, indent=1)
r = subprocess.run(['python3', os.path.join(REPO, 'pipeline/textbyte.py'), pf], capture_output=True, text=True)
print(r.stdout.strip() or r.stderr[-600:]); sys.exit(r.returncode)
