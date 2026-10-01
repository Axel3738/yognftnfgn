#!/usr/bin/env python3
"""Bygger no-precis-konfigen för Täljsetets nio norska videor, 2026-09-30.

Källvideorna bär TVÅ inbrända svenska element, och båda måste bort innan
annonserna går live i Norge:

  1. Ordcaptions — ett vitt piller med svart karaoketext, centrerat nederst.
     Mätt i en 720x1280-ruta: pillret y 840..903 (höjd ~64), x 221..498.
     no-precis.py hittar det PER FRAME själv; här sätts bara sökfönstret.

  2. Slutkortet "869 kr / ordinarie 1 139 kr" — vit fet text med mjuk skugga,
     rad 1 y 212..277 och rad 2 y 300..361, båda centrerade kring x 360.
     Det TONAR IN, så tiderna i matt/slutkort-tider.json är satta ~0,8 s före
     den första helt läsbara rutan och gäller till videons slut. Tiderna är
     avlästa i ett kontaktark över de sista 6 sekunderna per video — den
     automatiska detektorn provades först och dög inte (ljust trä och himmel
     gav samma signal som vit text).

Slutkortet suddas med två blur-rutor, en per rad, och den norska texten läggs
som ett PNG-lager (lager/slutkort-no.png, byggt med versalhöjd 66 resp. 62 px
= svenskans, centrerat på samma x och med samma bläcktopp).

⚠️ Tiderna är mätta i KÄLLVIDEON. HeyGen behåller längden vid dubbning, men
skriptet kontrollerar det ändå per video och säger till om längden glidit —
en förskjuten blur-ruta lämnar svensk text synlig.

  python3 market-expansion/no/notion-batches/2026-09-30/lager.py
"""
import json, os, re, subprocess, sys

B = os.path.dirname(os.path.abspath(__file__))
TIDER = json.load(open(f'{B}/matt/slutkort-tider.json', encoding='utf-8'))['videor']

# ⚠️ Slutkortstexten ligger också på OLIKA höjd i olika videor — samma fälla som
# pillret. Mätt 2026-09-30 i en ruta mitt i slutkortsfönstret per video:
# SP_4_H1 rad 1 y 212..275 och rad 2 y 299..366, men GT_4_H1 ligger ~20 px lägre
# (rad 2 slutar y 385). Första versionen hade två rutor som slutade vid y 374,
# och då gick det att LÄSA "ordinarie 1 139 kr" under den norska texten i
# GT_4_H1 — fångat i QA, inte av något skript.
#
# Därför EN ruta som spänner hela det uppmätta intervallet i båda led:
# rad 1 börjar tidigast y 212, rad 2 slutar senast y 385, texten är som bredast
# x 72..679. Marginal för skuggan och de mjuka kanterna.
BLUR_PRIS = [46, 196, 692, 398]

# ⚠️ Pillret ligger på OLIKA höjd i olika videor — mätt 2026-09-30 i sex rutor per
# källa: PD_1_H4 y 786..852, GT_4_H1 807..871, OB_1_H1 821..887, PD_1_H5 826..894,
# SP_4_H1 836..903, PD_4_H1 845..917. Första körningen hade zon [815, 935] och
# missade PD_1_H4 helt (pillret hittat i 98 av 441 frames) — svenska ordcaptions
# som "bladskydd," och "träbit och" stod kvar i den norska videon, fångat i QA.
# Fönstret spänner därför hela intervallet, med marginal.
CAPTIONS = {
    'zon': [775, 935],         # pillrets sökfönster i y, mätt över alla nio
    'x0': 0, 'x1': 720, 'bredd_max': 700,
    'h_min': 45, 'h_max': 85,  # pillrets höjd, mätt 65..73
    'standard_cy': 855,        # mitten av det uppmätta intervallet, bara reserv
    'max_chars': 30, 'font_px': 27,
    'pad_x': 6, 'pad_y': 6,
}


def ffbin():
    import shutil
    p = shutil.which('ffmpeg')
    if p:
        return p
    import imageio_ffmpeg
    return imageio_ffmpeg.get_ffmpeg_exe()


def langd(ff, path):
    r = subprocess.run([ff, '-hide_banner', '-i', path], capture_output=True, text=True)
    m = re.search(r'Duration: (\d+):(\d+):(\d+\.\d+)', r.stderr)
    if not m:
        sys.exit(f'kunde inte läsa längden på {path}')
    return int(m[1]) * 3600 + int(m[2]) * 60 + float(m[3])


def main():
    ff = ffbin()
    os.makedirs(f'{B}/konfig', exist_ok=True)
    os.makedirs(f'{B}/no', exist_ok=True)
    os.makedirs(f'{B}/qa', exist_ok=True)
    skrivna, varningar = [], []
    for namn, t in TIDER.items():
        # download skriver <slug>_<namn>.mp4, inte <namn>.mp4
        inn = f'{B}/no-video/spikkesett_{namn}.mp4'
        kalla = f'{B}/spikkesett/up/{namn}.mp4'
        if not os.path.exists(inn):
            varningar.append(f'{namn}: den renderade filen saknas, hoppad')
            continue
        d_ny, d_kalla = langd(ff, inn), langd(ff, kalla)
        if abs(d_ny - d_kalla) > 0.35:
            varningar.append(f'{namn}: renderad {d_ny:.2f}s mot källans {d_kalla:.2f}s '
                             f'— slutkortstiderna är mätta i källan och kan ligga fel')
        fran, till = t['fran'], min(t['till'], d_ny) + 0.3
        k = {
            'in': inn,
            'ut': f'{B}/no/{namn}.mp4',
            'srt': f'{B}/srt-no/spikkesett_{namn}.srt',
            # ⚠️ Inget "av"-fönster. Första versionen stängde av captions under
            # slutkortet, och då lämnades den svenska "handskarna," kvar i PD_1_H4:
            # "av" hoppar över HELA caption-steget, alltså också suddningen. Och de
            # två elementen krockar ändå aldrig — slutkortet ligger y 212..378,
            # pillret y 786..917.
            'captions': dict(CAPTIONS),
            'blur': [{'rect': BLUR_PRIS, 't': [fran, till]}],
            'lager': [{'png': f'{B}/lager/slutkort-no.png', 't': [fran, till]}],
            'qa': f'{B}/qa',
        }
        f = f'{B}/konfig/{namn}.json'
        json.dump(k, open(f, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        skrivna.append(f)
        print(f'✓ {namn}  slutkort {fran}–{till:.2f}s  (video {d_ny:.2f}s)')
    for v in varningar:
        print(f'⚠️  {v}')
    print(f'\n{len(skrivna)} konfigar i {B}/konfig/')


if __name__ == '__main__':
    main()
