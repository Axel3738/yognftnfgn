#!/usr/bin/env python3
"""Norsk prisplatta för IBC_PD_8_H2 (2026-09-25).

Videon slutar med TVÅ inbrända plattor, 8,62 s → slut (13,63 s):

  övre  y 873-961, x  30-689   "489 kr – jämförpris 636 kr."   ← SVENSKT PRIS
  nedre y 962-1053, x 156-590  "Fri frakt."                    ← identisk på norska

Bara den övre byggs om. Norge kostar 439 kr (ord. 586 kr), avläst live på
beverbutikken.no samma dag — en ren översättning hade lämnat kvar ett pris som
inte finns i butiken. Den nedre plattan rörs INTE: texten är ordagrant densamma
på norska, och det som inte behöver byggas om ska inte byggas om.

Måtten är mätta i källan (matt/f110.png), inte gissade: plattans ruta, dess
färg (248,249,252), textens bläckhöjd 50 px (y 895-944) och den nästan svarta
texten (0,0,5). Rutan behålls i sin helhet fast den norska texten är kortare —
en smalare platta hade lämnat suddet synligt i kanterna.

  python3 lager.py
"""
import os
from PIL import Image, ImageDraw, ImageFont

HÄR = os.path.dirname(os.path.abspath(__file__))
UT = os.path.join(HÄR, 'lager')
os.makedirs(UT, exist_ok=True)

W, H = 720, 1280
FET = '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'

RUTA = [30, 873, 689, 961]      # samma ruta som svenskan
PLATTA = (248, 249, 252, 255)
TEXT = (0, 0, 5, 255)
RADIE = 8
BLÄCK_H = 50                    # svenskans bläckhöjd, inkl. nedhäng
BLÄCK_CY = 919.5                # mitten av svenskans bläck (y 895-944)

TEXTRAD = '439 kr – førpris 586 kr.'


def bläckbox(text, px):
    """Textens faktiska bläck, inte fontens nominella mått (nedhäng skiljer per sträng)."""
    d = ImageDraw.Draw(Image.new('L', (1, 1)))
    return d.textbbox((0, 0), text, font=ImageFont.truetype(FET, px))


def passa(text, mål_h, bredd_max):
    """Störst storlek vars bläckhöjd ≤ mål_h och bredd ryms i rutan."""
    vald = 20
    for px in range(20, 120):
        x0, y0, x1, y1 = bläckbox(text, px)
        if (y1 - y0) > mål_h or (x1 - x0) > bredd_max:
            break
        vald = px
    return vald


def bygg(fil):
    lager = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(lager)
    d.rounded_rectangle(RUTA, radius=RADIE, fill=PLATTA)

    px = passa(TEXTRAD, BLÄCK_H, (RUTA[2] - RUTA[0]) - 22)
    f = ImageFont.truetype(FET, px)
    x0, y0, x1, y1 = bläckbox(TEXTRAD, px)
    cx = (RUTA[0] + RUTA[2]) / 2
    # rita från bläckets mitt, inte från fontens ruta — annars glider raden uppåt
    d.text((cx - (x0 + x1) / 2, BLÄCK_CY - (y0 + y1) / 2), TEXTRAD, font=f, fill=TEXT)

    lager.save(fil)
    print(f'{os.path.basename(fil)}: "{TEXTRAD}" {px} px, bläck {x1 - x0}×{y1 - y0}')


if __name__ == '__main__':
    bygg(os.path.join(UT, 'PD_8_H2_pris.png'))
