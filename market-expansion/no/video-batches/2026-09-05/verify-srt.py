#!/usr/bin/env python3
# Regexgrind för 2026-09-05-batchen (diskstall, veckodosett). Körs tills allt är grönt.
import re, sys, glob, os
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'srt-fixed')
O = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'srt-orig')

GEMENSAMMA = [
    (r'\bkronor\b', 'svenska "kronor"'),
    (r'\b(är|och|också|här|från|idag(?!\S)|just nu|ordinarie|väska|köp\b|kök\b)\b', 'trolig svenska ord'),
    (r'Bäverbutiken|Bawebutiken|Babe-?butik\w*|Spavebutiken|Bawe-?butik\w*', 'felstavat butiksnamn'),
    (r'\b(svensk\w*|Sverige)\b', 'geo-referens till Sverige (ska vara norsk kontext)'),
    (r'\bä\w*|\bö\w*', 'kvarvarande svensk å/ä/ö-stavning (kolla manuellt, kan vara falskt positiv)'),
]

PRODUKT_REGLER = {
    'diskstall': [
        (r'\b961\b|\b739\b', 'gammalt SEK-belopp kvar (ska vara 1026/789)'),
        (r'300-lappen', 'svensk sedelreferens kvar, ska vara omskriven'),
    ],
    'veckodosett': [
        (r'\b506\b|\b389\b', 'gammalt SEK-belopp kvar (ska vara 415/319)'),
        (r'femhundra|trehundraåttionio', 'gammalt SEK-belopp i ordform kvar'),
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
    o = os.path.join(O, base.replace('.srt', '.orig.srt'))
    tc = lambda s: [l for l in open(s, encoding='utf-8').read().split('\n') if '-->' in l]
    if not os.path.exists(o):
        print('❌', base, 'saknar källfil i srt-orig'); fel += 1
    elif tc(o) != tc(f):
        print('❌', base, 'timecodes avviker från källfilen'); fel += 1

if n != 24:
    print(f'❌ {n} filer, förväntade 24'); fel += 1

sys.exit(1 if fel else (print(f'✅ {n} filer, inga blockerande fel.') or 0))
