#!/usr/bin/env python3
# Regexgrind för 2026-09-04-batchen (magnetplattor, motocentric, palsborste). Körs tills allt är grönt.
import re, sys, glob, os
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'srt-fixed')
O = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'srt-orig')

GEMENSAMMA = [
    (r'\bkronor\b', 'svenska "kronor"'),
    (r'\b(är|och|också|här|från|idag(?!\S)|just nu|ordinarie|väska|plattor(?!na)|delar\b)\b', 'trolig svenska ord'),
    (r'Bäverbutiken|Bawebutiken|Babe-?butik\w*|Spavebutiken|Bawe-?butik\w*', 'felstavat butiksnamn'),
    (r'\b(svensk\w*|Sverige)\b', 'geo-referens till Sverige (ska vara norsk kontext)'),
    (r'\bä\w*|\bö\w*', 'kvarvarande svensk å/ä/ö-stavning (kolla manuellt, kan vara falskt positiv)'),
]

PRODUKT_REGLER = {
    'magnetplattor': [
        (r'\b610\b|\b469\b|\b460\b', 'gammalt SEK-belopp kvar (ska vara 682/409)'),
        (r'Magnetfliser', 'fel produktnamn (ska vara Magnetplater)'),
    ],
    'motocentric': [
        (r'\b1286\b|\b989\b|\b889\b', 'gammalt SEK-belopp kvar (ska vara 1364/1049)'),
        (r'toppboks', 'fel produktord (ska vara bakveske)'),
    ],
    'palsborste': [
        (r'\b701\b|\b539\b', 'gammalt SEK-belopp kvar (ska vara 623/479)'),
    ],
}

fel = 0; n = 0
for f in sorted(glob.glob(D + '/*.srt')):
    base = os.path.basename(f)
    slug = base.split('_')[0]
    n += 1
    t = open(f, encoding='utf-8').read()
    if '\x00' in t:
        print('❌', base, 'NULLBYTE'); fel += 1
    body = '\n'.join(l for l in t.split('\n') if not re.match(r'^\d+$', l) and '-->' not in l)
    for pat, why in GEMENSAMMA:
        for m in re.finditer(pat, body, re.I):
            snip = body[max(0, m.start()-30):m.end()+30].replace('\n', ' ')
            print(f'⚠️  {base}: {why} → …{snip}…')
    for pat, why in PRODUKT_REGLER.get(slug, []):
        for m in re.finditer(pat, body, re.I):
            snip = body[max(0, m.start()-30):m.end()+30].replace('\n', ' ')
            print(f'❌ {base}: {why} → …{snip}…'); fel += 1
    o = os.path.join(O, base)
    tc = lambda s: [l for l in open(s, encoding='utf-8').read().split('\n') if '-->' in l]
    if not os.path.exists(o):
        print('❌', base, 'saknar källfil i srt-orig'); fel += 1
    elif tc(o) != tc(f):
        print('❌', base, 'timecodes avviker från källfilen'); fel += 1

if n != 36:
    print(f'❌ {n} filer, förväntade 36'); fel += 1

sys.exit(1 if fel else (print(f'✅ {n} filer, inga blockerande fel.') or 0))
