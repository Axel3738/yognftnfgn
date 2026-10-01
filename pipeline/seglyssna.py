#!/usr/bin/env python3
"""seglyssna.py — lyssnar replik för replik. Varje SRT-cue klipps ur videon och transkriberas för sig
med Whisper medium, och täckningen räknas mot manusraden. Utskriften visar de svagaste replikerna.

Varför (mätt 2026-09-30): helfilsmåttet i lyssna.py gav japanska haikuh3 0,80 och röstkollen var
grön, men replik för replik hördes produktordet 靴下 som "ガックザ" och 母 som 目. Ett ord som inte
går fram försvinner i ett snitt över hela filen. Facit för "bra" med det här måttet: HeyGens japanska
(Nathalie) 0,91, där bara siffror och homofoner skilde.

  python3 pipeline/seglyssna.py <video> <srt> <språk> [antal=6] [--json ut.json] [--modell large-v3]

--modell väljer Whisper-modellen (standard medium). Danska mäts med large-v3 (2026-09-30): medium hörde
"sokker" som "sukker" även från fyra infödda danska röster, så den kunde inte skilja en röst som säger
fel från en som säger rätt; large-v3 hörde klonen som svenska "socker" och två infödda som "sokker".

Täckningen räknas i tecken-bigram för ja/zh (inga mellanslag) och i ord för andra språk. Kinesiska
görs om till traditionell skrift (opencc s2twp), och siffror skrivna med kanji/hanzi (十一月, 五足)
görs om till arabiska på båda sidor, eftersom Whisper skriver 11月. Kräver faster-whisper, modellen
"medium" (laddas ner första gången) och ffmpeg.
"""
import json, os, re, subprocess, sys, tempfile
from faster_whisper import WhisperModel

SIFFRA = {'〇': 0, '零': 0, '一': 1, '二': 2, '両': 2, '兩': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9}


def arabiska(t):
    """十一月 → 11月, 五足 → 5足, 二十 → 20 (tal upp till 99; allt annat lämnas)."""
    def tal(m):
        s = m.group(0)
        if '十' in s:
            fore, _, efter = s.partition('十')
            return str((SIFFRA.get(fore, 1) if fore else 1) * 10 + (SIFFRA.get(efter, 0) if efter else 0))
        return ''.join(str(SIFFRA[c]) for c in s)
    return re.sub(r'[一二三四五六七八九〇零両兩]?十[一二三四五六七八九]?|[一二三四五六七八九〇零]+', tal, t)


def ts(t):
    h, m, s = t.split(':'); s, ms = s.split(',')
    return int(h) * 3600 + int(m) * 60 + int(s) + int(ms) / 1000


def cues(srt):
    ut = []
    for b in re.split(r'\n\s*\n', open(srt, encoding='utf-8').read().strip()):
        r = b.strip().split('\n')
        if len(r) < 3 or '-->' not in r[1]:
            continue
        a, e = (ts(x.strip()) for x in r[1].split('-->'))
        ut.append((int(r[0]), a, e, ' '.join(r[2:])))
    return ut


def main():
    flaggor_med_varde = {'--json', '--modell'}
    args, hoppa = [], False
    for a in sys.argv[1:]:
        if hoppa: hoppa = False; continue
        if a in flaggor_med_varde: hoppa = True; continue
        if not a.startswith('--'): args.append(a)
    if len(args) < 3:
        sys.exit(__doc__)
    video, srt, sprak = args[:3]
    antal = int(args[3]) if len(args) > 3 else 6
    jsonut = sys.argv[sys.argv.index('--json') + 1] if '--json' in sys.argv else None
    cjk = sprak in ('ja', 'zh')
    trad = lambda t: t
    if sprak == 'zh':
        try:
            from opencc import OpenCC
            trad = OpenCC('s2twp').convert
        except Exception:
            pass

    def enheter(t):
        if cjk:
            t = arabiska(trad(re.sub(r'[\s、。，,．.！!？?：:；;「」『』（）()…・〜~\-—–"\'“”]', '', t)))
            return {t[i:i + 2] for i in range(len(t) - 1)} if len(t) > 1 else {t}
        return set(re.findall(r"[\w']+", t.lower()))

    modellnamn = sys.argv[sys.argv.index('--modell') + 1] if '--modell' in sys.argv else 'medium'
    modell = WhisperModel(modellnamn, device='cpu', compute_type='int8')
    rader = []
    with tempfile.TemporaryDirectory() as d:
        for nr, a, e, text in cues(srt):
            wav = os.path.join(d, f'{nr}.wav')
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{max(0, a - 0.15):.2f}', '-to', f'{e + 0.15:.2f}', '-i', video,
                            '-ac', '1', '-ar', '16000', wav], check=True)
            seg, _ = modell.transcribe(wav, language=sprak, beam_size=5, condition_on_previous_text=False)
            hort = ''.join(s.text for s in seg).strip()
            m, h = enheter(text), enheter(hort)
            rader.append({'nr': nr, 'tackning': round(len(m & h) / len(m), 2) if m else 1.0, 'manus': text, 'hort': hort})
    snitt = sum(x['tackning'] for x in rader) / len(rader)
    print(f'{os.path.basename(video)}: {len(rader)} repliker, snitt {snitt:.2f}, lägst {min(x["tackning"] for x in rader):.2f}')
    for x in sorted(rader, key=lambda x: x['tackning'])[:antal]:
        print(f"  #{x['nr']:>2} {x['tackning']:.2f}  manus: {x['manus']}  |  hört: {x['hort']}")
    if jsonut:
        json.dump({'fil': os.path.basename(video), 'sprak': sprak, 'snitt': round(snitt, 3), 'repliker': rader},
                  open(jsonut, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
