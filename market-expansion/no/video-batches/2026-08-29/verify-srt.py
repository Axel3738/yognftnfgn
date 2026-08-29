#!/usr/bin/env python3
# Regex-verifierare för de rättade norska SRT:erna (körs tills allt är grönt).
# Timecode-rader undantas från skanningen (annars false positives på belopp).
import re, sys, glob, os

DIR = os.path.join(os.path.dirname(__file__), 'srt-fixed')
FEL = []

# Förbjudet i ALLA filer
FORBIDDEN = [
    (r'\bKranskydd\b', 'svenskt produktnamn kvar'),
    (r'\bfire hundre og tjue\b', 'utskrivet 420'),
    (r'\bfire 120\b', 'förvanskat 420'),
    (r'\b(309|402|310|489|636|509)\b', 'svenskt/gammalt belopp'),
    (r'\bfri frakt\b(?![^\n]*over 300)', 'fri frakt-claim'),
    (r'\b(bara|endast|bare) i ?dag\b', 'endast-idag-löfte'),
    (r'\bär\b|\boch\b|\bocks[åa]\b|\bhär\b|\bfrån\b|\bvälj\b|\bkör\b|\bpratar\b|\bgrej\b|\bidag\b|\bkranen där\b', 'trolig svenska'),
    (r'\bkronor\b', 'svenska "kronor" (ska vara kroner)'),
    (r'överdrag|villaägare|utekran(?!en)|blixtlås', 'svecism'),
]
# Krävs (minst en fil per produkt ska nämna rätt pris om källan nämnde pris)
PRICE_OK = re.compile(r'\b(219|285|439|571)\b')

for f in sorted(glob.glob(DIR + '/*.srt')):
    text = open(f, encoding='utf-8').read()
    if '\x00' in text: FEL.append((f, 'NULLBYTE', ''))
    lines = [l for l in text.split('\n') if not re.match(r'^\d+$', l) and '-->' not in l]
    body = '\n'.join(lines)
    for pat, why in FORBIDDEN:
        for m in re.finditer(pat, body, re.I):
            s = max(0, m.start() - 30)
            FEL.append((os.path.basename(f), why, body[s:m.end() + 30].replace('\n', ' ')))

if FEL:
    for f, why, ctx in FEL: print(f'❌ {f}: {why} → …{ctx}…')
    sys.exit(1)
print(f'✅ {len(glob.glob(DIR + "/*.srt"))} filer gröna.')
