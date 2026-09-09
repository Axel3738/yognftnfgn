#!/usr/bin/env python3
"""rostkoll.py — mäter om en omdubbad video har jämnt taltempo.

En molnsession kan inte lyssna (CLAUDE.md järnregel 3). Men det Axel hörde —
"den saktar ner och sen speedar upp hela tiden" — går att MÄTA: rösten pressas
in i varje cues tidsfönster, så en cue med för mycket text får onaturligt lite
tystnad och nästa får onaturligt mycket.

    python3 factory/rostkoll.py <video.mp4> <cue.srt>

För varje cue mäts hur stor andel av fönstret som är tal. Ett normalt tempo
lämnar luft: 60–95 % tal. Ligger en cue på 100 % är repliken för lång för sin
tid, och ligger den under 35 % står rösten still och väntar.

Ersätter inte att någon lyssnar. Den fångar det mätbara felet innan en människa
behöver lägga tid på det.
"""
import re
import subprocess
import sys

# ⚠️ FÖRSTA VERSIONEN MÄTTE FEL SAK. Andelen tal per cue skiljer inte en bra
# fil från en dålig: den trasiga CS_1_H2 fick "jämnt tempo" på den mätningen och
# den rättade fick en varning. Tystnad säger ingenting — HeyGen fyller ut.
#
# Det Axel hörde är TEMPOT: tecken per sekund inom varje cue. En cue som fick
# för mycket text läses fort, nästa som fick för lite läses långsamt, och örat
# hör svängningen. Måttet är alltså SPRIDNINGEN mellan cues, inte nivån.
#
# Uppmätt på CS_1_H2 (NO): den trasiga versionen svängde 6,5–28,8 tecken/s
# (4,4×), den rättade 12,9–19,0 (1,5×).
SPRIDNING_TAK = 2.2    # över detta hörs det som att rösten rusar och bromsar
TEMPO_TAK = 24         # tecken/s: över detta är enskilda cues för snabba
TEMPO_GOLV = 7         # under detta står rösten och drar ut på orden


def cues(srt):
    ut = []
    for blk in open(srt, encoding='utf-8').read().replace('\r', '').strip().split('\n\n'):
        rad = blk.split('\n')
        if len(rad) < 3 or '-->' not in rad[1]:
            continue

        def s(v):
            h, m, rest = v.split(':')
            ss, ms = rest.split(',')
            return int(h) * 3600 + int(m) * 60 + int(ss) + int(ms) / 1000
        a, b = [x.strip() for x in rad[1].split('-->')]
        ut.append((s(a), s(b), ' '.join(rad[2:]).strip()))
    return ut


def tystnader(video, tröskel='-32dB', minlängd=0.18):
    """[(start, slut)] för varje tystnad i filen, enligt ffmpeg."""
    r = subprocess.run(
        ['ffmpeg', '-hide_banner', '-i', video, '-af',
         f'silencedetect=noise={tröskel}:d={minlängd}', '-f', 'null', '-'],
        capture_output=True, text=True)
    ut, start = [], None
    for rad in r.stderr.splitlines():
        m = re.search(r'silence_start: ([\d.]+)', rad)
        if m:
            start = float(m.group(1))
        m = re.search(r'silence_end: ([\d.]+)', rad)
        if m and start is not None:
            ut.append((start, float(m.group(1))))
            start = None
    return ut


def talandel(t0, t1, tyst):
    """Hur stor del av fönstret [t0,t1] som INTE är tystnad."""
    total = max(0.01, t1 - t0)
    stilla = sum(max(0, min(t1, b) - max(t0, a)) for a, b in tyst)
    return max(0.0, 1 - stilla / total)


def main(video, srt):
    c = cues(srt)
    tyst = tystnader(video)
    problem, tempon = [], []
    for i, (t0, t1, text) in enumerate(c, 1):
        sek = max(0.01, t1 - t0)
        tempo = len(text) / sek
        tempon.append(tempo)
        flagga = '  '
        if tempo > TEMPO_TAK:
            flagga = '❌'
            problem.append(f'cue {i}: {tempo:.1f} tecken/s — för snabbt')
        elif tempo < TEMPO_GOLV:
            flagga = '⚠️'
            problem.append(f'cue {i}: {tempo:.1f} tecken/s — för långsamt')
        print(f'{flagga} #{i:2}  {sek:5.2f}s  {tempo:5.1f} tecken/s  '
              f'tal {talandel(t0, t1, tyst) * 100:5.1f}%  "{text[:48]}"')
    spridning = max(tempon) / max(0.01, min(tempon))
    print()
    print(f'Tempo: {min(tempon):.1f}–{max(tempon):.1f} tecken/s. '
          f'Spridning {spridning:.2f}× (tak {SPRIDNING_TAK}×).')
    if spridning > SPRIDNING_TAK:
        problem.insert(0, f'spridningen är {spridning:.2f}× — rösten rusar och bromsar hörbart')
    if problem:
        print('⛔ ' + f'{len(problem)} problem:')
        for p in problem:
            print('   ' + p)
        return 1
    print('✅ Jämnt taltempo. Kvar: någon måste ändå lyssna på rösten själv.')
    return 0


if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit('Användning: rostkoll.py <video.mp4> <cue.srt>')
    sys.exit(main(sys.argv[1], sys.argv[2]))
