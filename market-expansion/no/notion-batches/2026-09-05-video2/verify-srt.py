#!/usr/bin/env python3
# Regexgrind för 2026-09-05-video2 (kranbeskyttelse, overvakingskamera, ibc-tanktrekk, batmotortrekk). Körs tills allt är grönt.
import re, sys, glob, os
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'srt-fixed')
O = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'srt-orig')
GEMENSAMMA = [
    (r'\bkronor\b', 'svenska "kronor"'),
    (r'\b(är|och|också|här|från|idag(?!\S)|just nu|ordinarie|köp\b|kök\b|inte\b|garanti\w*)\b', 'trolig svenska / ogiltig claim (garanti)'),
    (r'Bäverbutiken|Bawebutiken|Babe-?butik\w*|Spavebutiken|Bawe-?butik\w*', 'felstavat butiksnamn'),
    (r'\b(svensk\w*|Sverige)\b', 'geo-referens till Sverige'),
    (r'\bä\w*|\bö\w*|\w+[äö]\w*', 'svensk å/ä/ö-stavning (kolla manuellt)'),
    (r'\b(309|579|799|489|636|965|1 ?000|909)\b', 'svenskt SEK-belopp kvar'),
    (r'trehundra|sjuhundra|femhundra|nittionio|sjuttionio', 'svenskt belopp i ordform kvar'),
    (r'\b360\b', 'fel gradtal (ska vara 355)'),
    (r'200 ?g\b', 'fel material (ska vara 210D)'),
]
fel = 0; n = 0
for f in sorted(glob.glob(D + '/*.srt')):
    base = os.path.basename(f); n += 1
    t = open(f, encoding='utf-8').read()
    body = '\n'.join(l for l in t.split('\n') if not re.match(r'^\d+$', l) and '-->' not in l)
    for pat, why in GEMENSAMMA:
        for m in re.finditer(pat, body, re.I):
            snip = body[max(0, m.start()-30):m.end()+30].replace('\n', ' ')
            print(f'⚠️  {base}: {why} → …{snip}…')
    o = os.path.join(O, base.replace('.srt', '.orig.srt'))
    tc = lambda s: [l for l in open(s, encoding='utf-8').read().split('\n') if '-->' in l]
    if not os.path.exists(o): print('❌', base, 'saknar källfil'); fel += 1
    elif tc(o) != tc(f): print('❌', base, 'timecodes avviker från källfilen'); fel += 1
    else:
        ob = [b for b in re.split(r'\n\n+', open(o, encoding='utf-8').read().strip()) if b.strip()]
        nb = [b for b in re.split(r'\n\n+', t.strip()) if b.strip()]
        for a, b in zip(ob, nb):
            la = len(' '.join(a.split('\n')[2:])); lb = len(' '.join(b.split('\n')[2:]))
            if lb > la * 1.25 + 10: print(f'⚠️  {base}: block {a.split(chr(10))[0]} är {lb} tecken mot svenskans {la} (läppsynk)')
if n != 12: print(f'❌ {n} filer, förväntade 12'); fel += 1
sys.exit(1 if fel else (print(f'✅ {n} filer, inga blockerande fel.') or 0))
