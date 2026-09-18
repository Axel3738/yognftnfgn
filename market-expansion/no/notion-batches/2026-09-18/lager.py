#!/usr/bin/env python3
"""Bygger norska textlager till Takovertrekk-videorna (720x1280).

Portad från 2026-09-16-batchen. Två sorters lager:
  hero()     — den röda grafiken (vit fet text, tjock röd kontur)
  slutkort() — slutkortets textblock på norska, med videons egen ram som botten

Mätt ur källvideorna 2026-09-18: pillerbandet ligger på y 905–995 i alla sju
videor, och grafiktexten "6,5 × 3 m" är identisk på norska och rörs inte.
"""
import subprocess, os
from PIL import Image, ImageDraw, ImageFont

B = 'market-expansion/no/notion-batches/2026-09-18'
UT = f'{B}/lager'
os.makedirs(UT, exist_ok=True)
FB = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
W, H = 720, 1280
ROD = (200, 24, 24)


def hero(text, box, storlek, namn, rad2=None, storlek2=None):
    """Vit fet text med tjock röd kontur, centrerad i box. rad2 hamnar under."""
    x0, y0, x1, y1 = box
    lager = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(lager)
    f = ImageFont.truetype(FB, storlek)
    cx = (x0 + x1) / 2
    cy = (y0 + y1) / 2 if rad2 is None else y0 + (y1 - y0) * 0.30
    d.text((cx, cy), text, font=f, fill=(255, 255, 255, 255), anchor='mm',
           stroke_width=max(6, storlek // 9), stroke_fill=ROD + (255,))
    if rad2:
        f2 = ImageFont.truetype(FB, storlek2 or int(storlek * 0.62))
        d.text((cx, y0 + (y1 - y0) * 0.78), rad2, font=f2, fill=(255, 255, 255, 255),
               anchor='mm', stroke_width=max(5, (storlek2 or storlek) // 10), stroke_fill=ROD + (255,))
    p = f'{UT}/{namn}.png'
    lager.save(p)
    return p


def slutkort(video, t, namn):
    """Slutkortets textblock på norska. Samma layout som 2026-09-16 — samma produkt,
    samma mall. Logotypen rörs inte; bara den svenska texten byts."""
    tmpf = f'/tmp/sk_{namn}.png'
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-ss', str(t), '-i', video,
                    '-frames:v', '1', tmpf, '-y'], check=True)
    lager = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(lager)
    d.rectangle([40, 846, 700, 1046], fill=(255, 255, 255, 255))
    ftit = ImageFont.truetype(FB, 25)
    d.text((85, 858), 'TAKOVERTREKK CAMPINGVOGN', font=ftit, fill=(17, 17, 17, 255))
    d.text((85, 888), '6,5 × 3 M – BESKYTTER TAKET', font=ftit, fill=(17, 17, 17, 255))
    d.text((85, 934), '★★★★★', font=ImageFont.truetype(FB, 17), fill=(26, 138, 116, 255))
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
    return p


if __name__ == '__main__':
    OUT = f'{B}/out'
    # Röda grafiktexter. Rutorna är mätta ur källvideorna 2026-09-18.
    hero('210D-VEV', [110, 380, 610, 494], 78, 'OB_1_vev')
    hero('1 189 KR', [120, 626, 600, 734], 78, 'OB_1_pris')
    hero('1 189 kr', [124, 380, 544, 490], 74, 'PD_6_pris')
    hero('1 189 kr', [130, 470, 600, 580], 74, 'PD_7_pris')
    hero('1 189 kr', [130, 470, 600, 680], 74, 'PD_7_pris_spar', rad2='Spar 360', storlek2=48)
    hero('1 189 kr', [130, 470, 600, 580], 74, 'RI_3_pris')
    hero('1 189 kr', [130, 470, 600, 680], 74, 'RI_3_pris_spar', rad2='Spar 360', storlek2=48)
    # Slutkort — ramen tas ur den renderade videon så bakgrunden stämmer exakt.
    slutkort(f'{OUT}/takovertrekk_OB_1_H1.mp4', 16.0, 'OB_1_slutkort')
    slutkort(f'{OUT}/takovertrekk_PD_6_H1.mp4', 14.0, 'PD_6_slutkort')
    slutkort(f'{OUT}/takovertrekk_PD_7_H1.mp4', 16.0, 'PD_7_slutkort')
    slutkort(f'{OUT}/takovertrekk_RI_3_H1.mp4', 15.5, 'RI_3_slutkort')
    print('lager klara:', len(os.listdir(UT)))
