#!/usr/bin/env python3
"""Bygger de norska PNG-lagren för Takovertrekk-batchen 2026-09-28.

Fyra videor bär inbrända RÖDA grafiker som HeyGen inte rör (den dubbar bara
ljudet). Två mallar, båda mätta i renderingen 2026-09-28 och bit-stilla efter
en inanimering på ~0,4 s:

  210D-VÄV   x 54-628  y 282-505   (SP_4_H2/H3/H4)  → "210D-VEV"
  prisgrafik x 123-605 y 343-617   (SP_4_H2/H3/H4)  → 1 189 KR / 1 549 KR struken
  prisgrafik x 130-589 y 333-566   (CS_12_H1)       → 1 189 kr / 5,0/5

Inget slutkort i den här batchen: de fyra videorna slutar på den röda
prisgrafiken över husvagnen, inte på ett vitt produktkort.

Betyget 5,0/5 är kontrollerat live mot beverbutikken.no samma dag
(ratingValue 5.00, reviewCount 10) — siffran får stå kvar.

Alla mått är i videons pixlar (720 × 1280).

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
    # 210D-VÄV → 210D-VEV. Samma ruta i alla tre SP-videorna (mätt i renderingen).
    'SP_4_H2_vev': dict(fil='SP_4_H2_vev.png', rect=[54, 282, 628, 505],
                        rader=[{'text': '210D-VEV', 'vikt': 1.0}]),
    'SP_4_H3_vev': dict(fil='SP_4_H3_vev.png', rect=[54, 282, 628, 505],
                        rader=[{'text': '210D-VEV', 'vikt': 1.0}]),
    'SP_4_H4_vev': dict(fil='SP_4_H4_vev.png', rect=[54, 282, 628, 505],
                        rader=[{'text': '210D-VEV', 'vikt': 1.0}]),
    # prisgrafiken: svenska 1129 KR / 1 469 KR struken → norska 1 189 / 1 549
    'SP_4_H2_pris': dict(fil='SP_4_H2_pris.png', rect=[123, 343, 605, 617],
                         rader=[{'text': '1 189 KR', 'vikt': 1.0},
                                {'text': '1 549 KR', 'vikt': 0.55, 'struken': True}]),
    'SP_4_H3_pris': dict(fil='SP_4_H3_pris.png', rect=[123, 343, 605, 617],
                         rader=[{'text': '1 189 KR', 'vikt': 1.0},
                                {'text': '1 549 KR', 'vikt': 0.55, 'struken': True}]),
    'SP_4_H4_pris': dict(fil='SP_4_H4_pris.png', rect=[123, 343, 605, 617],
                         rader=[{'text': '1 189 KR', 'vikt': 1.0},
                                {'text': '1 549 KR', 'vikt': 0.55, 'struken': True}]),
    # CS_12_H1: svenska "1 129 kr" + "5,0/5"
    'CS_12_H1_pris': dict(fil='CS_12_H1_pris.png', rect=[130, 333, 589, 566],
                          rader=[{'text': '1 189 kr', 'vikt': 1.0},
                                 {'text': '5,0/5', 'vikt': 0.52}]),
    # UG_2_H1: svenska "1 129 kr. / Ord. 1 469 kr." (mätt 14,5-20,5 s, stilla
    # från 14,9). Ingen struken rad här — källan skriver "Ord." framför.
    'UG_2_H1_pris': dict(fil='UG_2_H1_pris.png', rect=[152, 228, 564, 390],
                         rader=[{'text': '1 189 kr.', 'vikt': 1.0},
                                {'text': 'Ord. 1 549 kr.', 'vikt': 0.52}]),
}

if __name__ == '__main__':
    for namn, j in RUTOR.items():
        rod_rubrik(j['rader'], j['rect'], j['fil'])
        print('✓', j['fil'])
