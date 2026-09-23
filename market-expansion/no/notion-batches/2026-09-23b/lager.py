#!/usr/bin/env python3
"""Norska PNG-lager för Feiesett-batchen 2026-09-23b.

Fem av sex videor slutar med ett inbränt slutkort "Beställ / 459 kr." — svensk
text OCH svenskt pris. Norge kostar 389 kr, så kortet måste byggas om, inte
bara översättas. UG_1_H1 har inget kort (bara ordcaption-pillret, som
no-precis.py byter själv).

Mallen är mätt ur källorna med rutnät (ark/*_rut.png), inte gissad: vit fet
text med mörk skugga nedåt-höger, två rader, centrerad i rutan.

⚠️ Borsten passerar FRAMFÖR den svenska texten i flera av videorna. Ett platt
PNG-lager hamnar ovanpå borsten i stället för under. Det är en kosmetisk
skillnad på ~1,6 s och priset är det som måste vara rätt — men skriv aldrig
om det som att lagringen är identisk med källan.

  python3 lager.py
"""
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HÄR = os.path.dirname(os.path.abspath(__file__))
UT = os.path.join(HÄR, 'lager')
os.makedirs(UT, exist_ok=True)

W, H = 720, 1280
FET = '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'
VIT = (255, 255, 255)
SKUGGA = (60, 58, 56)


def font(px):
    return ImageFont.truetype(FET, px)


def passa(text, bredd, start, minsta=20):
    d = ImageDraw.Draw(Image.new('RGB', (1, 1)))
    px = start
    while px > minsta:
        if d.textlength(text, font=font(px)) <= bredd:
            return font(px)
        px -= 2
    return font(minsta)


def slutkort(rader, rect, fil, radavstand=1.04):
    """Vit fet text med mörk skugga, centrerad i rect (samma plats som svenskan)."""
    x0, y0, x1, y1 = rect
    bredd, hojd = x1 - x0, y1 - y0
    lager = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(lager)

    tak = int(hojd / (len(rader) * radavstand))
    fonter = [passa(r, bredd * 0.98, tak) for r in rader]
    hojder = [f.size * radavstand for f in fonter]
    tot = sum(hojder)

    # skugga först, mjukad — källan har en tydlig mörk kant nedåt-höger
    skugga = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(skugga)
    y = y0 + (hojd - tot) / 2
    for r, f, h in zip(rader, fonter, hojder):
        bw = sd.textlength(r, font=f)
        sd.text((x0 + (bredd - bw) / 2 + 7, y + 7), r, font=f, fill=(*SKUGGA, 235),
                stroke_width=max(3, int(f.size * 0.05)), stroke_fill=(*SKUGGA, 235))
        y += h
    skugga = skugga.filter(ImageFilter.GaussianBlur(3))

    y = y0 + (hojd - tot) / 2
    for r, f, h in zip(rader, fonter, hojder):
        bw = d.textlength(r, font=f)
        d.text((x0 + (bredd - bw) / 2, y), r, font=f, fill=VIT,
               stroke_width=max(2, int(f.size * 0.035)), stroke_fill=(245, 245, 245))
        y += h

    Image.alpha_composite(skugga, lager).save(os.path.join(UT, fil))
    return fil


KORT = ['Bestill', '389 kr.']

# Rutan är mätt på glyfraderna i källan, inte ögonmått: rad 1 y 236–299,
# rad 2 y 350–408, vänsterkant x 207 — identiskt i alla fem videorna.
RUTA = [205, 228, 500, 416]

RUTOR = {k: dict(fil=f'{k}_kort.png', rect=RUTA)
         for k in ['PD_2_H1', 'PD_3_H1', 'CS_2_H1', 'PD_4_H1', 'PD_5_H1']}

if __name__ == '__main__':
    for namn, j in RUTOR.items():
        slutkort(KORT, j['rect'], j['fil'])
        print('✓', j['fil'])
