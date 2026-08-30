#!/usr/bin/env python3
# Regex-verifierare för morgonbatchen (damasker + jattefotboll). Körs tills allt är grönt.
# Priser: damasker 309 (ordinær 515), jattefotboll 299 (ordinær 389).
import re, sys, glob, os

DIR = os.path.join(os.path.dirname(__file__), 'srt-fixed')
FEL = []

GEMENSAMT = [
    (r'\bkronor\b', 'svenska "kronor"'),
    (r'\b(bara|bare|endast) ?i ?dag\b', 'endast-idag-löfte'),
    (r'\bär\b|\boch\b|\bocks[åa]\b|\bhär\b|\bfrån\b|\bvälj\b|\bidag\b|\bjust nu\b|\bordinarie\b|\brejäl\b', 'trolig svenska'),
    (r'hundra\w*\b|\bfemhundra|\btrehundra|\bfyrahundra', 'svenskt sifferord'),
    (r'\bmaske(ne|rna)\b', 'förvanskat "damaskerna"'),
    (r'\bfri frakt\b(?![^\n]*over 300)', 'fri frakt-claim utan gräns'),
    (r'\bgaranti\b', 'garanti-claim (ska vara åpent kjøp)'),
]
PER_SLUG = {
    'damasker': [
        (r'\b(506|389|402|379|493)\b', 'fel belopp för damasker (rätt: 309/515)'),
        (r'åttini|syttini|nittitre|og seks\b|femhundre', 'fel prisord för damasker (rätt: tre hundre og ni / fem hundre og femten)'),
    ],
    'jattefotboll': [
        (r'\b(493|379|506|515|309)\b', 'fel belopp för fotbollen (rätt: 299/389)'),
        (r'syttini|nittitre|femhundre|femten', 'fel prisord för fotbollen (rätt: to hundre og nittini / tre hundre og åttini)'),
    ],
}

files = sorted(glob.glob(DIR + '/damasker_*.srt') + glob.glob(DIR + '/jattefotboll_*.srt'))
files = [f for f in files if not f.endswith(('.orig.srt', '.cover.srt'))]
for f in files:
    text = open(f, encoding='utf-8').read()
    if '\x00' in text: FEL.append((os.path.basename(f), 'NULLBYTE', ''))
    lines = [l for l in text.split('\n') if not re.match(r'^\d+$', l) and '-->' not in l]
    body = '\n'.join(lines)
    slug = os.path.basename(f).split('_')[0]
    for pat, why in GEMENSAMT + PER_SLUG[slug]:
        for m in re.finditer(pat, body, re.I):
            s = max(0, m.start() - 30)
            FEL.append((os.path.basename(f), why, body[s:m.end() + 30].replace('\n', ' ')))

if FEL:
    for f, why, ctx in FEL: print(f'❌ {f}: {why} → …{ctx}…')
    sys.exit(1)
print(f'✅ {len(files)} filer gröna.')
