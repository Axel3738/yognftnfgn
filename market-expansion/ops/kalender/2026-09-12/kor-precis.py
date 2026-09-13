#!/usr/bin/env python3
"""kor-precis.py — norska captions exakt där de svenska satt, för AdventLane-batchen 2026-09-12.

Alla sju källvideor har BARA ordcaptions inbrända (vitt piller, svart karaoke-text,
Carl Vicentes mall) — inga prisplattor, inga slutkort (kontaktark lästa 2026-09-12).
Pillret mätt i källan (1080×1920): y 1147–1352, x 150–930, höjd 105–127 px.
Skriptet läser renderingens verkliga mått och skalar zonen därefter, bygger en
no-precis-konfig per video och kör pipeline/no-precis.py.

    python3 market-expansion/ops/kalender/2026-09-12/kor-precis.py [NAMN …]
"""
import json, os, re, subprocess, sys, shutil

HÄR = os.path.dirname(os.path.abspath(__file__))
ROT = os.path.abspath(os.path.join(HÄR, '..', '..', '..', '..'))
NAMN = ['PD_8_H1', 'SY_1_H1', 'MR_1_H1', 'PD_4_H1', 'PD_6_H1', 'AU_1_H1', 'FM_1_H1']


def ffmpeg_bin():
    p = shutil.which('ffmpeg')
    if p: return p
    import imageio_ffmpeg
    return imageio_ffmpeg.get_ffmpeg_exe()


def matt(ff, path):
    r = subprocess.run([ff, '-hide_banner', '-i', path], capture_output=True, text=True)
    m = re.search(r'Video:.*?(\d{3,5})x(\d{3,5})', r.stderr)
    return int(m[1]), int(m[2])


def main():
    ff = ffmpeg_bin()
    valda = sys.argv[1:] or NAMN
    os.makedirs(os.path.join(HÄR, 'no'), exist_ok=True)
    os.makedirs(os.path.join(HÄR, 'konfig'), exist_ok=True)
    for n in valda:
        inn = os.path.join(HÄR, 'out', f'adventlane_AdventLaneRacing_{n}.mp4')
        if not os.path.exists(inn): print(f'✗ {n}: saknar {inn}'); continue
        W, H = matt(ff, inn)
        # zonen = 0,58–0,73 av höjden (mätt 1147–1352 av 1920 i källan, med marginal)
        K = {
            'in': inn,
            'ut': os.path.join(HÄR, 'no', f'AdventLaneRacing_NO_{n}.mp4'),
            'srt': os.path.join(HÄR, 'srt-fix', f'adventlane_AdventLaneRacing_{n}.srt'),
            'captions': {'zon': [int(0.58 * H), int(0.73 * H)], 'max_chars': 26, 'font_px': int(round(30 * W / 720)),
                         'standard_cy': int(0.652 * H), 'pad_x': int(round(14 * W / 720)), 'pad_y': int(round(16 * W / 720))},
            'blur': [], 'lager': [], 'qa': os.path.join(HÄR, 'qa'),
        }
        kf = os.path.join(HÄR, 'konfig', f'{n}.json')
        json.dump(K, open(kf, 'w'), indent=1)
        print(f'▶ {n}: {W}x{H} zon {K["captions"]["zon"]} font {K["captions"]["font_px"]}')
        r = subprocess.run([sys.executable, os.path.join(ROT, 'pipeline', 'no-precis.py'), kf], stdin=subprocess.DEVNULL)
        if r.returncode != 0: print(f'✗ {n}: no-precis exit {r.returncode}')


if __name__ == '__main__':
    main()
