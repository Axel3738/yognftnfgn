#!/usr/bin/env python3
"""Norska PNG-lager för Takovertrekk-batchen 2026-09-23.

Samma mall som 2026-09-22: vit fet text med tjock röd kontur och mjuk mörk
skugga, ritad i exakt samma ruta som den svenska satt. Rutorna är mätta ur
källvideorna (kontaktark med rutnät), inte gissade.

`5,0/5` och `19,5 m²` rörs aldrig — de är språkneutrala och står kvar i
källan. Bara prisraderna byts: 1 129 → 1 189, 1 469 → 1 549.

  python3 lager.py
"""
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HÄR = os.path.dirname(os.path.abspath(__file__))
UT = os.path.join(HÄR, 'lager')
os.makedirs(UT, exist_ok=True)

W, H = 720, 1280
FET = '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'
RÖD = (237, 28, 36)
VIT = (255, 255, 255)


def font(px):
    return ImageFont.truetype(FET, px)


def passa(text, bredd, start, minsta=20):
    px = start
    d = ImageDraw.Draw(Image.new('RGB', (1, 1)))
    while px > minsta:
        if d.textlength(text, font=font(px)) <= bredd:
            return font(px)
        px -= 2
    return font(minsta)


def rod_rubrik(rader, rect, fil, radavstand=1.06):
    x0, y0, x1, y1 = rect
    bredd, hojd = x1 - x0, y1 - y0
    lager = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(lager)

    tak = int(hojd / (len(rader) * radavstand))
    fonter, hojder = [], []
    for r in rader:
        f = passa(r['text'], bredd * r.get('bredd', 0.94), tak)
        if r.get('vikt', 1.0) != 1.0:
            f = font(max(20, int(f.size * r['vikt'])))
        fonter.append(f)
        hojder.append(f.size * radavstand)

    tot = sum(hojder)

    glow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    y = y0 + (hojd - tot) / 2
    for r, f, h in zip(rader, fonter, hojder):
        bw = gd.textlength(r['text'], font=f)
        gd.text((x0 + (bredd - bw) / 2, y), r['text'], font=f, fill=(0, 0, 0, 170),
                stroke_width=max(8, int(f.size * 0.15)), stroke_fill=(0, 0, 0, 170))
        y += h
    glow = glow.filter(ImageFilter.GaussianBlur(9))

    y = y0 + (hojd - tot) / 2
    for r, f, h in zip(rader, fonter, hojder):
        t = r['text']
        bw = d.textlength(t, font=f)
        x = x0 + (bredd - bw) / 2
        d.text((x, y), t, font=f, fill=VIT,
               stroke_width=max(6, int(f.size * 0.11)), stroke_fill=RÖD)
        if r.get('struken'):
            mitt = y + f.size * 0.60
            d.line([(x - 8, mitt), (x + bw + 8, mitt)], fill=RÖD, width=max(5, int(f.size * 0.08)))
        y += h

    Image.alpha_composite(glow, lager).save(os.path.join(UT, fil))
    return fil


PRIS_RABATT = [{'text': '1 189 kr', 'vikt': 1.0},
               {'text': '1 549 KR', 'vikt': 0.55, 'struken': True}]
PRIS_BETYG = [{'text': '1 189 kr', 'vikt': 1.0},
              {'text': '5,0/5', 'vikt': 0.52}]

RUTOR = {
    'CO_5_H1':  [dict(fil='CO_5_H1_pris.png',   rect=[90, 290, 625, 575], rader=PRIS_BETYG)],
    'PD_10_H1': [dict(fil='PD_10_H1_pris.png',  rect=[90, 295, 625, 580], rader=PRIS_BETYG)],
    'OB_4_H1':  [dict(fil='OB_4_H1_pris.png',   rect=[90, 270, 625, 550], rader=PRIS_RABATT)],
    'OB_3_H1':  [dict(fil='OB_3_H1_pris.png',   rect=[90, 280, 625, 560], rader=PRIS_RABATT)],
    'GT_11_H1': [dict(fil='GT_11_H1_str1.png',  rect=[85, 370, 655, 500],
                      rader=[{'text': '5,5 til 13,5 m', 'vikt': 1.0}]),
                 dict(fil='GT_11_H1_str2.png',  rect=[85, 455, 655, 565],
                      rader=[{'text': '5,5 til 13,5 m', 'vikt': 1.0}]),
                 dict(fil='GT_11_H1_pris.png',  rect=[90, 270, 625, 550], rader=PRIS_RABATT)],
    'CS_9_H1':  [dict(fil='CS_9_H1_pris.png',   rect=[85, 265, 645, 525],
                      rader=[{'text': '1 189 kr/', 'vikt': 1.0},
                             {'text': '19,5 m² ·', 'vikt': 0.62}])],
}

if __name__ == '__main__':
    for namn, jobb in RUTOR.items():
        for j in jobb:
            rod_rubrik(j['rader'], j['rect'], j['fil'])
            print('✓', j['fil'])
