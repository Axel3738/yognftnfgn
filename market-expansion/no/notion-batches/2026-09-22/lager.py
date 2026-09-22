#!/usr/bin/env python3
"""Bygger de norska PNG-lagren för Takovertrekk-batchen 2026-09-22.

Två sorters lager:
  1. Röd prisgrafik — vit fet text med tjock röd kontur och mjuk mörk skugga,
     ritad i exakt samma ruta som den svenska satt (rutorna handmätta ur
     källvideorna, se `RUTOR` nedan).
  2. Slutkortet — den svenska produktkortstexten och BÄVERBUTIKEN-logotypen
     målas över och ersätts med norsk text. Logotypen tas bort helt:
     butikens namn får aldrig stå i en annons (Axels beslut 2026-09-18), och
     de här annonserna speglas dessutom till CaraShell.

Alla mått är i källans pixlar (720 × 1280).

  python3 lager.py
"""
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HÄR = os.path.dirname(os.path.abspath(__file__))
UT = os.path.join(HÄR, 'lager')
os.makedirs(UT, exist_ok=True)

W, H = 720, 1280
FET = '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'
NORMAL = '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf'
RÖD = (237, 28, 36)
VIT = (255, 255, 255)


def font(px, fet=True):
    return ImageFont.truetype(FET if fet else NORMAL, px)


def passa(text, bredd, start, fet=True, minsta=20):
    """Största fontstorleken där texten ryms i `bredd`."""
    px = start
    while px > minsta:
        f = font(px, fet)
        if ImageDraw.Draw(Image.new('RGB', (1, 1))).textlength(text, font=f) <= bredd:
            return f
        px -= 2
    return font(minsta, fet)


def rod_rubrik(rader, rect, fil, radavstand=1.06):
    """Vit fet text med röd kontur + mörk glow, centrerad i rect [x0,y0,x1,y1]."""
    x0, y0, x1, y1 = rect
    bredd, hojd = x1 - x0, y1 - y0
    lager = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(lager)

    # varje rad får sin egen storlek: tar hela bredden men aldrig mer än radhöjden
    tak = int(hojd / (len(rader) * radavstand))
    fonter, hojder = [], []
    for r in rader:
        f = passa(r['text'], bredd * r.get('bredd', 0.94), tak, True)
        # storleksvikt per rad (prisraden är störst)
        if r.get('vikt', 1.0) != 1.0:
            f = font(max(20, int(f.size * r['vikt'])), True)
        fonter.append(f)
        hojder.append(f.size * radavstand)

    tot = sum(hojder)
    y = y0 + (hojd - tot) / 2
    for r, f, h in zip(rader, fonter, hojder):
        t = r['text']
        bw = d.textlength(t, font=f)
        x = x0 + (bredd - bw) / 2
        kontur = max(6, int(f.size * 0.11))
        d.text((x, y), t, font=f, fill=VIT, stroke_width=kontur, stroke_fill=RÖD)
        if r.get('struken'):
            mitt = y + f.size * 0.60
            d.line([(x - 8, mitt), (x + bw + 8, mitt)], fill=RÖD, width=max(5, int(f.size * 0.08)))
        y += h

    # mjuk mörk glow bakom allt (som källan)
    glow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    y = y0 + (hojd - tot) / 2
    for r, f, h in zip(rader, fonter, hojder):
        bw = gd.textlength(r['text'], font=f)
        gd.text((x0 + (bredd - bw) / 2, y), r['text'], font=f, fill=(0, 0, 0, 170),
                stroke_width=max(8, int(f.size * 0.15)), stroke_fill=(0, 0, 0, 170))
        y += h
    glow = glow.filter(ImageFilter.GaussianBlur(9))
    ut = Image.alpha_composite(glow, lager)
    ut.save(os.path.join(UT, fil))
    return fil


# --------------------------------------------------- slutkortet (samma i sju videor)

def slutkort(fil='slutkort_no.png'):
    """Vit platta över logotypen + norsk produkttext i stället för den svenska.

    Mätt ur källans sista frame: logotypen x 110–570 / y 243–380, textblocket
    x 82–600 / y 858–1030. Produktbilden (y 430–810) rörs inte.
    """
    lager = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(lager)
    # 1. logotypen bort
    d.rectangle([95, 230, 610, 395], fill=(255, 255, 255, 255))
    # 2. svenska textblocket bort
    d.rectangle([70, 850, 665, 1040], fill=(255, 255, 255, 255))

    # 3. norsk text i samma stil
    titel = ['TAKOVERTREKK CAMPINGVOGN 6,5 × 3 M –', 'BESKYTTER DEN DYRESTE FLATEN']
    ft = font(23, True)
    y = 866
    for rad in titel:
        d.text((85, y), rad, font=ft, fill=(26, 26, 26))
        y += 27

    # stjärnor + antal anmeldelser
    fs = font(17, True)
    x = 85
    for _ in range(5):
        d.text((x, 938), '★', font=font(19, True), fill=(38, 154, 146))
        x += 20
    d.text((x + 4, 940), '10 anmeldelser', font=fs, fill=(26, 26, 26))

    # priser: førpris överstruket, pris efter
    fp = font(18, True)
    fore = '1 549 kr'
    d.text((85, 963), fore, font=fp, fill=(90, 90, 90))
    bw = d.textlength(fore, font=fp)
    d.line([(83, 972), (85 + bw + 2, 972)], fill=(90, 90, 90), width=2)
    d.text((85 + bw + 18, 963), '1 189 kr', font=fp, fill=(26, 26, 26))

    # lagerraden
    d.ellipse([86, 1010, 96, 1020], fill=(80, 190, 90))
    d.text((112, 1006), 'På lager – Begrenset antall', font=font(16, True), fill=(26, 26, 26))

    lager.save(os.path.join(UT, fil))
    return fil


# --------------------------------------------------- de röda grafikerna per video

RUTOR = {
    'OB_2_H1': [dict(fil='OB_2_H1_pris.png', rect=[100, 125, 650, 335],
                     rader=[{'text': '1 189 kr.', 'vikt': 1.0},
                            {'text': 'får plass i en pose', 'vikt': 0.62}])],
    'TR_3_H1': [dict(fil='TR_3_H1_rubrik.png', rect=[45, 405, 640, 575],
                     rader=[{'text': 'Ikke hele', 'vikt': 1.0},
                            {'text': 'campingvognen.', 'vikt': 1.0}]),
                dict(fil='TR_3_H1_pris.png', rect=[95, 550, 635, 845],
                     rader=[{'text': '1 189 kr', 'vikt': 1.0},
                            {'text': '1 549 KR', 'vikt': 0.55, 'struken': True}])],
    'GT_10_H1': [dict(fil='GT_10_H1_pris.png', rect=[85, 285, 640, 480],
                      rader=[{'text': 'Ni størrelser', 'vikt': 1.0},
                             {'text': 'fra 1 189 kr.', 'vikt': 1.0}])],
    'CO_3_H1': [dict(fil='CO_3_H1_pris.png', rect=[105, 435, 630, 795],
                     rader=[{'text': '1 189 kr', 'vikt': 1.0},
                            {'text': 'Spar 360', 'vikt': 0.85},
                            {'text': '1 549 kr', 'vikt': 0.55, 'struken': True}])],
    'GT_7_H1': [dict(fil='GT_7_H1_pris.png', rect=[80, 300, 625, 595],
                     rader=[{'text': '1 189 kr', 'vikt': 1.0},
                            {'text': '5,0/5', 'vikt': 0.52}])],
    'RI_2_H1': [dict(fil='RI_2_H1_pris.png', rect=[110, 300, 625, 470],
                     rader=[{'text': '1 189 kr', 'vikt': 1.0}])],
    'GT_8_H1': [dict(fil='GT_8_H1_pris.png', rect=[110, 230, 615, 595],
                     rader=[{'text': '1 189 kr', 'vikt': 1.0},
                            {'text': '5,0/5', 'vikt': 0.52}])],
    'CS_8_H1': [dict(fil='CS_8_H1_pris1.png', rect=[105, 420, 620, 570],
                     rader=[{'text': '1 189 kr', 'vikt': 1.0}]),
                dict(fil='CS_8_H1_pris2.png', rect=[105, 300, 620, 580],
                     rader=[{'text': '1 189 kr', 'vikt': 1.0},
                            {'text': '1 549 KR', 'vikt': 0.55, 'struken': True}])],
    'CS_7_H1': [dict(fil='CS_7_H1_pris.png', rect=[50, 240, 670, 440],
                     rader=[{'text': '1 189 kroner.', 'vikt': 1.0},
                            {'text': '5,0/5', 'vikt': 0.62}])],
}

if __name__ == '__main__':
    for namn, jobb in RUTOR.items():
        for j in jobb:
            rod_rubrik(j['rader'], j['rect'], j['fil'])
            print('✓', j['fil'])
    print('✓', slutkort())
