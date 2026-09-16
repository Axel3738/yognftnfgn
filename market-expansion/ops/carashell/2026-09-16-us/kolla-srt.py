#!/usr/bin/env python3
"""kolla-srt.py — regexgrinden för de amerikanska SRT:erna (translate-skillens steg 5).
Samma blockantal och EXAKT samma timecodes som .orig.srt, inga kronor/SEK-tal,
inga å/ä/ö, inga svenska-bara påståenden. Timecode-rader undantas från skanningen.
    python3 market-expansion/ops/carashell/2026-09-16-us/kolla-srt.py
"""
import re, sys, os, glob
HÄR = os.path.dirname(os.path.abspath(__file__))
ORIG = os.path.join(HÄR, 'video', 'srt-orig'); US = os.path.join(HÄR, 'video', 'srt-us')
TID = re.compile(r'^\d\d:\d\d:\d\d,\d\d\d --> \d\d:\d\d:\d\d,\d\d\d$')
FÖRBJUDET = [
    (r'\bkr\b|kronor|krona|SEK', 'kronor'),
    (r'\b1[ ,.]?129\b|\b1[ ,.]?469\b|\b23\s?%', 'svenskt pris'),
    (r'[åäöÅÄÖ]', 'svenska tecken'),
    (r'Swedish law|in Sweden|Norway|Sverige|Norge|withdrawal', 'svensk-bara claim'),
    (r'\b(colour|tyre|metre)s?\b', 'brittisk stavning'),
]
def block(txt):
    ut = []
    for b in re.split(r'\n\s*\n', txt.strip()):
        rader = [r for r in b.strip().split('\n') if r.strip()]
        if len(rader) < 2: continue
        ut.append((rader[0].strip(), rader[1].strip(), ' '.join(rader[2:]).strip()))
    return ut
fel = 0
for o in sorted(glob.glob(os.path.join(ORIG, '*.orig.srt'))):
    key = os.path.basename(o)[:-len('.orig.srt')]
    u = os.path.join(US, key + '.srt')
    if not os.path.exists(u): print(f'✗ {key}: saknas'); fel += 1; continue
    bo, bu = block(open(o, encoding='utf-8').read()), block(open(u, encoding='utf-8').read())
    problem = []
    if len(bo) != len(bu): problem.append(f'blockantal {len(bu)} ≠ {len(bo)}')
    for (n1, t1, x1), (n2, t2, x2) in zip(bo, bu):
        if t1 != t2: problem.append(f'timecode block {n1}: {t2} ≠ {t1}')
        if not TID.match(t2): problem.append(f'ogiltig timecode block {n2}')
        if not x2: problem.append(f'tom text block {n2}')
        for rx, namn in FÖRBJUDET:
            if re.search(rx, x2, flags=re.I): problem.append(f'{namn} i block {n2}: "{x2[:60]}"')
        if x1 and x2 and (len(x2) > len(x1) * 1.35 or len(x2) < len(x1) * 0.55): problem.append(f'längd block {n2}: {len(x2)} tecken mot {len(x1)} svenska')
    if problem: fel += 1; print(f'✗ {key}: ' + ' | '.join(problem))
    else: print(f'✓ {key}: {len(bu)} block')
sys.exit(1 if fel else 0)
