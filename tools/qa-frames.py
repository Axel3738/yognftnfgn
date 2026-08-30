#!/usr/bin/env python3
# qa-frames.py — plockar isär en levererad creative så att den GÅR att granska
# mot sin brief. Utan det här steget blir brief-kontrollen en gissning.
#
#   python3 tools/qa-frames.py <fil.mp4|bild.jpg> [--ut <mapp>] [--tathet 1.5]
#
# Video: tata frames genom hookens forsta 3 sekunder (0,0 / 0,5 / 1,0 …) och
# sedan var {tathet} sekund. Hooken avgor om annonsen fungerar, sa den granskas
# hardare an resten. Bild: skalas till lasbar storlek och kopieras.
#
# Skriver en index.txt med tidsstampel per frame och en sammanfattning pa stdout.
# Ingen dom fattas har - skriptet gor bara materialet lasbart.

import argparse, json, os, shutil, subprocess, sys
from pathlib import Path

VIDEO = {'.mp4', '.mov', '.m4v', '.webm'}
BILD = {'.jpg', '.jpeg', '.png', '.webp'}
HOOK_SEK = 3.0          # de forsta sekunderna avgor allt
HOOK_STEG = 0.5
MAX_FRAMES = 60


def ffmpeg_bin():
    for namn in ('ffmpeg', 'ffprobe'):
        if shutil.which(namn):
            return shutil.which('ffmpeg'), shutil.which('ffprobe')
    try:
        import imageio_ffmpeg
        exe = imageio_ffmpeg.get_ffmpeg_exe()
        return exe, None      # ffprobe saknas: langden las ur ffmpeg i stallet
    except ImportError:
        sys.exit('✗ Varken ffmpeg eller imageio-ffmpeg finns. Kor: pip install imageio-ffmpeg')


def videolangd(ffmpeg, ffprobe, fil):
    if ffprobe:
        r = subprocess.run([ffprobe, '-v', 'error', '-show_entries', 'format=duration',
                            '-of', 'json', str(fil)], capture_output=True, text=True)
        try:
            return float(json.loads(r.stdout)['format']['duration'])
        except Exception:
            pass
    # Fallback: ffmpeg skriver "Duration: HH:MM:SS.ss" pa stderr.
    r = subprocess.run([ffmpeg, '-i', str(fil)], capture_output=True, text=True)
    for rad in r.stderr.splitlines():
        if 'Duration:' in rad:
            t = rad.split('Duration:')[1].split(',')[0].strip()
            h, m, s = t.split(':')
            return int(h) * 3600 + int(m) * 60 + float(s)
    sys.exit(f'✗ Kunde inte lasa langden pa {fil}')


def upplosning(ffmpeg, fil):
    r = subprocess.run([ffmpeg, '-i', str(fil)], capture_output=True, text=True)
    for rad in r.stderr.splitlines():
        if 'Video:' in rad:
            for bit in rad.split(','):
                bit = bit.strip().split(' ')[0]
                if 'x' in bit and bit.replace('x', '').isdigit():
                    return bit
    return 'okand'


def tidpunkter(langd, tathet):
    ut, t = [], 0.0
    while t < min(HOOK_SEK, langd):
        ut.append(round(t, 2)); t += HOOK_STEG
    t = HOOK_SEK
    while t < langd:
        ut.append(round(t, 2)); t += tathet
    if langd > 0.5:
        ut.append(round(langd - 0.2, 2))     # sista bilden: CTA och pris bor synas
    ut = sorted(set(ut))
    if len(ut) > MAX_FRAMES:                  # gles ut mitten, behall hooken
        hook = [t for t in ut if t <= HOOK_SEK]
        resten = [t for t in ut if t > HOOK_SEK]
        steg = max(1, len(resten) // (MAX_FRAMES - len(hook)))
        ut = hook + resten[::steg]
    return ut


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('fil')
    ap.add_argument('--ut', default=None)
    ap.add_argument('--tathet', type=float, default=1.5)
    a = ap.parse_args()

    fil = Path(a.fil)
    if not fil.exists():
        sys.exit(f'✗ Filen finns inte: {fil}')
    ut = Path(a.ut or fil.parent / f'{fil.stem}_qa')
    ut.mkdir(parents=True, exist_ok=True)

    andelse = fil.suffix.lower()
    rader = []

    if andelse in BILD:
        from PIL import Image
        im = Image.open(fil)
        b, h = im.size
        if max(im.size) > 1600:
            im.thumbnail((1600, 1600))
        mal = ut / f'{fil.stem}.jpg'
        im.convert('RGB').save(mal, quality=92)
        rader.append(f'{mal.name}\tstillbild\t{b}x{h}')
        print(f'Bild {fil.name} — {b}x{h}')
        print(f'  1 fil att granska i {ut}')

    elif andelse in VIDEO:
        ffmpeg, ffprobe = ffmpeg_bin()
        langd = videolangd(ffmpeg, ffprobe, fil)
        upp = upplosning(ffmpeg, fil)
        punkter = tidpunkter(langd, a.tathet)
        for i, t in enumerate(punkter, 1):
            mal = ut / f'frame_{i:03d}.jpg'
            r = subprocess.run([ffmpeg, '-y', '-ss', str(t), '-i', str(fil),
                                '-frames:v', '1', '-q:v', '3', str(mal)],
                               capture_output=True, text=True)
            if mal.exists():
                markning = 'HOOK' if t <= HOOK_SEK else ''
                rader.append(f'{mal.name}\t{t:.2f}s\t{markning}')
        print(f'Video {fil.name} — {langd:.1f}s, {upp}')
        print(f'  {len(rader)} frames i {ut} ({sum(1 for r in rader if "HOOK" in r)} i hooken)')
    else:
        sys.exit(f'✗ Okand filtyp: {andelse}')

    (ut / 'index.txt').write_text('\n'.join(rader) + '\n', encoding='utf-8')
    print(f'  index: {ut / "index.txt"}')
    print('\nLAS VARJE FRAME innan du domer creativen. Ingen uppladdning utan det.')


if __name__ == '__main__':
    main()
