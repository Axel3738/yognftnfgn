#!/usr/bin/env python3
"""transkribera.py — svenska transkript (yta 2, talet) för spöhållarens källvideor.

Repot har inga SRT:er för produkten (market-expansion saknar fiskespöhållaren,
mätt 2026-09-10), så talet transkriberas lokalt med faster-whisper (0 kr,
0 HeyGen-krediter). Filerna skrivs i samma form och på samma plats som
HeyGen-originalen, så brand-detektorn hittar dem via kalla.srt_slug:

    market-expansion/se/video-batches/2026-09-10-fiskespohallare/srt-orig/
        fiskespohallare_<rest>.orig.srt        (rest = PD_1_H1 …, gemener)

    python3 factory/output/fiskespohallare-4-pack/transkribera.py [--modell small]

Läser mp4:orna ur .scratch/brand-detektor/Rodholder/media/ (nedladdade av
brand-detektorn --hamta). Hoppar över filer som redan har ett transkript.
⚠️ Whisper hör fel på brandnamn precis som HeyGen — brandord.mjs fuzzy-pass
fångar Bäverbutiken/Bäberbutiken/Bawebutiken. Läs ändå transkripten med ögat
innan en dom `kräver-omdubb` blir en HeyGen-beställning.
"""
import sys, re
from pathlib import Path

ROT = Path(__file__).resolve().parents[3]
MEDIA = ROT / '.scratch' / 'brand-detektor' / 'Rodholder' / 'media'
UT = ROT / 'market-expansion' / 'se' / 'video-batches' / '2026-09-10-fiskespohallare' / 'srt-orig'
SLUG = 'fiskespohallare'
PREFIX = re.compile(r'^(Rodholder|Fiskespöhållare)_')

def srt_tid(s):
    h = int(s // 3600); m = int(s % 3600 // 60); sek = s % 60
    return f"{h:02d}:{m:02d}:{int(sek):02d},{int(round((sek - int(sek)) * 1000)):03d}"

def main():
    modell = 'small'
    if '--modell' in sys.argv:
        modell = sys.argv[sys.argv.index('--modell') + 1]
    from faster_whisper import WhisperModel
    UT.mkdir(parents=True, exist_ok=True)
    filer = sorted(MEDIA.glob('*.mp4'))
    if not filer:
        print(f'inga mp4 i {MEDIA} — kör brand-detektorn med --hamta först'); sys.exit(1)
    wm = WhisperModel(modell, device='cpu', compute_type='int8')
    gjorda = 0
    for fil in filer:
        rest = PREFIX.sub('', fil.stem)
        ut = UT / f'{SLUG}_{rest}.orig.srt'.lower()
        if ut.exists():
            continue
        segment, info = wm.transcribe(str(fil), language='sv', beam_size=5, vad_filter=True)
        rader = []
        for i, s in enumerate(segment, 1):
            rader.append(f"{i}\n{srt_tid(s.start)} --> {srt_tid(s.end)}\n{s.text.strip()}\n")
        ut.write_text('\n'.join(rader) if rader else '', encoding='utf-8')
        gjorda += 1
        print(f'  ✓ {fil.name} → {ut.name} ({len(rader)} repliker, {info.duration:.0f} s)')
    print(f'{gjorda} nya transkript i {UT.relative_to(ROT)}')

if __name__ == '__main__':
    main()
