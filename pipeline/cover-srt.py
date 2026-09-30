#!/usr/bin/env python3
"""Gör en cover-SRT av en HeyGen-SRT: delar långa block i cues om max ~2 rader
(38 tecken) och gör tidslinjen lucklös så att en ogenomskinlig caption-platta
täcker inbrända källcaptions utan att blinka bort. Används med burn --style=cover.

  python3 cover-srt.py in.srt            # skriver in-cover.srt
  python3 cover-srt.py in.srt --max=38
"""
import re, sys

MAX = 38
args = [a for a in sys.argv[1:] if not a.startswith('--')]
for a in sys.argv[1:]:
    if a.startswith('--max='): MAX = int(a.split('=')[1])
if not args:
    sys.exit(__doc__)

def parse_ts(t):
    h, m, s = t.split(':'); s, ms = s.split(',')
    return int(h)*3600 + int(m)*60 + int(s) + int(ms)/1000

def fmt_ts(x):
    h = int(x//3600); m = int(x % 3600//60); s = int(x % 60); ms = int(round((x-int(x))*1000))
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"

# Japanska och kinesiska (2026-09-30, Matstrumpor i Japan och Taiwan): inga mellanslag att bryta
# på, och ett tecken är ungefär dubbelt så brett som en latinsk bokstav. Utan det här blev en hel
# mening EN cue som libass inte kan radbryta — texten sprack ut över bildens kant. En CJK-cue får
# därför högst MAX // 2 tecken (17 vid standard 34: en rad i 720 och 1080 i bredd) och delas vid
# 。！？ först, sedan vid 、，, och en lång sats hårt — aldrig så att en ny rad börjar med skiljetecken.
CJK = re.compile(r'[぀-ヿ㐀-鿿豈-﫿ｦ-ﾟ]')
SLUT_CJK = '。！？!?'
PAUS_CJK = '、，,；;：:'
BORJAR_EJ = SLUT_CJK + PAUS_CJK + '」』）)・ー…〜ゃゅょっぁぃぅぇぉャュョッァィゥェォ'

def ar_cjk(text):
    return len(CJK.findall(text)) >= max(2, len(text.replace(' ', '')) // 3)

def chunk_cjk(text, maxc):
    text = re.sub(r'\s+', '', text)
    satser, cur = [], ''
    for i, t in enumerate(text):
        cur += t
        nasta = text[i + 1] if i + 1 < len(text) else ''
        if (t in SLUT_CJK or t in PAUS_CJK) and nasta not in BORJAR_EJ:
            satser.append(cur); cur = ''
    if cur: satser.append(cur)
    pieces, cur = [], ''
    for s in satser:
        while len(s) > maxc:
            k = maxc
            while k > 1 and s[k] in BORJAR_EJ: k -= 1
            if cur: pieces.append(cur); cur = ''
            pieces.append(s[:k]); s = s[k:]
        if cur and len(cur) + len(s) > maxc:
            pieces.append(cur); cur = s
        else:
            cur += s
    if cur: pieces.append(cur)
    return pieces

def chunk(text):
    if ar_cjk(text):
        return chunk_cjk(text, max(8, MAX // 2))
    sents = [s.strip() for s in re.findall(r'[^.!?]+[.!?]?\s*', text) if s.strip()]
    pieces, cur = [], ''
    for s in sents:
        if len(s) > MAX:
            if cur: pieces.append(cur); cur = ''
            seg = ''
            for w in s.split():
                if seg and len(seg)+1+len(w) > MAX:
                    pieces.append(seg); seg = w
                else:
                    seg = f'{seg} {w}'.strip()
            if seg: pieces.append(seg)
        elif cur and len(cur)+1+len(s) <= MAX:
            cur = f'{cur} {s}'
        else:
            if cur: pieces.append(cur)
            cur = s
    if cur: pieces.append(cur)
    return pieces

for path in args:
    blocks = re.split(r'\n\n+', open(path).read().strip())
    cues = []
    for b in blocks:
        lines = b.strip().split('\n')
        a, e = (parse_ts(x) for x in lines[1].split(' --> '))
        parts = chunk(' '.join(lines[2:]))
        total = sum(len(p) for p in parts)
        t = a
        for p in parts:
            dur = (e - a) * len(p) / total
            cues.append((t, t + dur, p)); t += dur
    out = []
    for i, (a, e, p) in enumerate(cues):
        e2 = cues[i+1][0] if i+1 < len(cues) else e + 0.6
        out.append(f"{i+1}\n{fmt_ts(a)} --> {fmt_ts(e2)}\n{p}")
    dest = path.replace('.srt', '-cover.srt')
    open(dest, 'w').write('\n\n'.join(out) + '\n')
    print(f'✓ {dest}')
