#!/usr/bin/env python3
# Regexgrind för klistremerker-batchen. Körs tills allt är grönt.
import re, sys, glob, os
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'srt-fixed')
O = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'srt-orig')
REGLER = [
    (r'\bkronor\b', 'svenska "kronor"'),
    (r'\b(bara|bare|kun|endast) ?i ?dag\b', 'dagslöfte'),
    (r'\bär\b|\boch\b|\bocks[åa]\b|\bhär\b|\bfrån\b|\bidag\b|\bjust nu\b|\bordinarie\b', 'trolig svenska'),
    (r'\b(svensk\w*|norsk\w*|sverige|norge)\b', 'geo-referens'),
    (r'søppelbøtte|søppelkasse|\bsøpla\b|søppelbøtta', 'fel produktord (ska vara søppeldunk)'),
    (r'\bfri frakt\b', 'fri frakt-claim'),
    (r'\bgaranti\b', 'garanti-claim'),
    (r'nitti ni|ett hundre', 'fel prisord (hundre og nittini)'),
    (r'\b(259|398|289|219)\b', 'fel belopp (rätt: 199)'),
]
fel = 0; n = 0
for f in sorted(glob.glob(D + '/stickers_*.srt')):
    n += 1; t = open(f, encoding='utf-8').read()
    if '\x00' in t: print('❌', os.path.basename(f), 'NULLBYTE'); fel += 1
    body = '\n'.join(l for l in t.split('\n') if not re.match(r'^\d+$', l) and '-->' not in l)
    for pat, why in REGLER:
        for m in re.finditer(pat, body, re.I):
            print(f'❌ {os.path.basename(f)}: {why} → …{body[max(0,m.start()-30):m.end()+30]}…'.replace('\n',' ')); fel += 1
    o = os.path.join(O, os.path.basename(f))
    tc = lambda s: [l for l in open(s, encoding='utf-8').read().split('\n') if '-->' in l]
    if tc(o) != tc(f): print('❌', os.path.basename(f), 'timecodes avviker från originalet'); fel += 1
if n != 12: print(f'❌ {n} filer, förväntade 12'); fel += 1
sys.exit(1 if fel else print(f'✅ {n} filer gröna.') or 0)
