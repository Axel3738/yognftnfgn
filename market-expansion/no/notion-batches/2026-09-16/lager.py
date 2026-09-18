#!/usr/bin/env python3
"""Bygger norska textlager till Takovertrekk-videorna (720x1280)."""
import subprocess, sys, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

B = 'market-expansion/no/notion-batches/2026-09-16'
UT = f'{B}/lager'
os.makedirs(UT, exist_ok=True)
FB = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
W, H = 720, 1280
ROD = (200, 24, 24)


def hero(text, box, storlek, vinkel=0, stryk=False, namn=''):
    """Vit fet text med tjock röd kontur, centrerad i box, ev. roterad."""
    x0, y0, x1, y1 = box
    f = ImageFont.truetype(FB, storlek)
    pad = storlek // 2 + 20
    tmp = Image.new('RGBA', (x1 - x0 + 2 * pad, y1 - y0 + 2 * pad), (0, 0, 0, 0))
    d = ImageDraw.Draw(tmp)
    cx, cy = tmp.width / 2, tmp.height / 2
    d.text((cx, cy), text, font=f, fill=(255, 255, 255, 255), anchor='mm',
           stroke_width=max(6, storlek // 9), stroke_fill=ROD + (255,))
    if stryk:
        bb = d.textbbox((cx, cy), text, font=f, anchor='mm')
        d.line([(bb[0] - 10, cy), (bb[2] + 10, cy)], fill=ROD + (255,), width=max(5, storlek // 11))
    if vinkel:
        tmp = tmp.rotate(vinkel, resample=Image.BICUBIC, expand=True)
    lager = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    lager.alpha_composite(tmp, (int((x0 + x1) / 2 - tmp.width / 2), int((y0 + y1) / 2 - tmp.height / 2)))
    p = f'{UT}/{namn}.png'
    lager.save(p)
    return p


def slutkort(video, t, namn):
    """Bygger om slutkortets textblock på norska, med videons egen ram som botten."""
    tmpf = f'/tmp/sk_{namn}.png'
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-ss', str(t), '-i', video,
                    '-frames:v', '1', tmpf, '-y'], check=True)
    ram = Image.open(tmpf).convert('RGB')
    lager = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(lager)
    # vit platta över hela det svenska textblocket
    d.rectangle([40, 846, 700, 1046], fill=(255, 255, 255, 255))
    ftit = ImageFont.truetype(FB, 25)
    d.text((85, 858), 'TAKOVERTREKK CAMPINGVOGN', font=ftit, fill=(17, 17, 17, 255))
    d.text((85, 888), '6,5 × 3 M – BESKYTTER TAKET', font=ftit, fill=(17, 17, 17, 255))
    fs = ImageFont.truetype(FB, 17)
    d.text((85, 934), '★★★★★', font=fs, fill=(26, 138, 116, 255))
    d.text((178, 936), '10 anmeldelser', font=ImageFont.truetype(FB, 15), fill=(26, 138, 116, 255))
    fp = ImageFont.truetype(FB, 19)
    d.text((85, 962), '1 549 kr', font=fp, fill=(90, 90, 90, 255))
    bb = d.textbbox((85, 962), '1 549 kr', font=fp)
    d.line([(bb[0] - 2, (bb[1] + bb[3]) / 2), (bb[2] + 2, (bb[1] + bb[3]) / 2)], fill=(90, 90, 90, 255), width=2)
    d.text((190, 962), '1 189 kr', font=fp, fill=(17, 17, 17, 255))
    d.ellipse([88, 1008, 100, 1020], fill=(60, 180, 90, 255))
    d.text((112, 1006), 'På lager – begrenset antall', font=ImageFont.truetype(FB, 15), fill=(17, 17, 17, 255))
    p = f'{UT}/{namn}.png'
    lager.save(p)
    os.remove(tmpf)
    return p


if __name__ == '__main__':
    print(hero('1 189 KR', [95, 330, 655, 500], 86, namn='pris_1189'))
    print(hero('1 549 KR', [195, 512, 530, 604], 52, stryk=True, namn='pris_1549'))
    print(hero('FRI FRAKT', [90, 330, 655, 500], 86, namn='frifrakt'))
    print(hero('30 DAGERS ÅPENT KJØP.', [60, 508, 680, 606], 40, namn='apentkjop'))
    print(hero('210D-VEV', [40, 275, 650, 530], 92, vinkel=5, namn='vev210'))
    print(hero('1 189 KR', [45, 45, 700, 300], 92, vinkel=7, namn='pris_1189_ug'))
    for k, t in [('CO_1_H1', 24.0), ('RI_1_H1', 29.8), ('SP_4_H1', 38.2), ('UG_1_H1', 25.4)]:
        print(slutkort(f'{B}/out/takovertrekk_{k}.mp4', t, f'slutkort_{k}'))
