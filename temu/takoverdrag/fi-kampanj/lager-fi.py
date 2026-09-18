#!/usr/bin/env python3
"""Finska textlager (PNG 720×1280) till taköverdragets videor — samma mått som NO-facit
(`no-facit/lager.py`, mätt 2026-09-16), texterna ur `vo/grafik-fi.json` (sonnet-subagent).

    python3 temu/takoverdrag/fi-kampanj/lager-fi.py <grafik-fi.json> <utmapp> <källvideomapp>

Skriver pris/jämförpris/frifrakt/öppetköp/väv-lager + ett slutkort per Notionrunda-video
(CO_1, RI_1, SP_4, UG_1). Slutkortet: vit platta över det svenska textblocket, finsk titel,
belagt faktum i stället för stjärnor + "10 recensioner" (majavakauppa.fi har inga recensioner),
priser i euro, lagerrad — och Bäverbutikens ordmärke med svensk flagga byts mot MAJAVAKAUPPA.
"""
import json, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont

FB = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
W, H = 720, 1280
ROD = (200, 24, 24)


def hero(ut, text, box, storlek, vinkel=0, stryk=False, namn=''):
    """Vit fet text med tjock röd kontur, centrerad i box, ev. roterad (SE-videornas prisgrafik)."""
    x0, y0, x1, y1 = box
    # Passa in texten i rutan: finskan är längre än svenskan ("ILMAINEN TOIMITUS" klipptes 2026-09-18)
    while storlek > 24 and ImageFont.truetype(FB, storlek).getlength(text) + 2 * max(6, storlek // 9) > (x1 - x0):
        storlek -= 2
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
    p = f'{ut}/{namn}.png'
    lager.save(p)
    return p


def passa(text, font_path, max_bredd, start, minst=12):
    s = start
    while s > minst:
        f = ImageFont.truetype(font_path, s)
        if f.getlength(text) <= max_bredd:
            return f
        s -= 1
    return ImageFont.truetype(font_path, minst)


def slutkort(ut, G, namn):
    """Slutkortets textblock + ordmärke på finska. Måtten ur NO-facit (lager.py 2026-09-16)."""
    lager = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(lager)
    # Ordmärket "BÄVERBUTIKEN" + svensk flagga (svart platta ~[112,246,614,388]) → MAJAVAKAUPPA
    # Tomt `butik` = NEUTRALT slutkort (Axels beslut 2026-09-18: samma videor i A/B-testet Bäver vs CaraShell,
    # ingen logga alls) — plattan målas i kortets egen vita bakgrund i stället för svart med ordmärke.
    if G.get('butik'):
        d.rounded_rectangle([108, 242, 618, 392], radius=10, fill=(12, 12, 12, 255))
        fl = passa(G['butik'], FB, 470, 54)
        d.text((363, 317), G['butik'], font=fl, fill=(255, 255, 255, 255), anchor='mm')
    else:
        d.rectangle([100, 234, 626, 400], fill=(255, 255, 255, 255))
    # vit platta över hela det svenska textblocket
    d.rectangle([40, 846, 700, 1046], fill=(255, 255, 255, 255))
    ftit = ImageFont.truetype(FB, 25)
    rader = G['slutkort_titel'] if isinstance(G['slutkort_titel'], list) else G['slutkort_titel'].split('\n')
    y = 858
    for rad in rader[:2]:
        f = passa(rad, FB, 600, 25)
        d.text((85, y), rad, font=f, fill=(17, 17, 17, 255))
        y += 30
    d.text((85, 934), G['slutkort_fakta'], font=passa(G['slutkort_fakta'], FB, 600, 16), fill=(26, 138, 116, 255))
    fp = ImageFont.truetype(FB, 19)
    d.text((85, 962), G['jamforpris'], font=fp, fill=(90, 90, 90, 255))
    bb = d.textbbox((85, 962), G['jamforpris'], font=fp)
    d.line([(bb[0] - 2, (bb[1] + bb[3]) / 2), (bb[2] + 2, (bb[1] + bb[3]) / 2)], fill=(90, 90, 90, 255), width=2)
    d.text((bb[2] + 22, 962), G['pris'], font=fp, fill=(17, 17, 17, 255))
    d.ellipse([88, 1008, 100, 1020], fill=(60, 180, 90, 255))
    d.text((112, 1006), G['slutkort_lager'], font=passa(G['slutkort_lager'], FB, 560, 15), fill=(17, 17, 17, 255))
    p = f'{ut}/slutkort_{namn}.png'
    lager.save(p)
    return p


if __name__ == '__main__':
    gf, ut = sys.argv[1], sys.argv[2]
    os.makedirs(ut, exist_ok=True)
    G = json.load(open(gf, encoding='utf-8'))
    G.setdefault('butik', '')   # standard: neutralt slutkort utan logga
    print(hero(ut, G['pris'], [95, 330, 655, 500], 86, namn='pris'))
    print(hero(ut, G['jamforpris'], [195, 512, 530, 604], 52, stryk=True, namn='jamforpris'))
    print(hero(ut, G['frifrakt'], [90, 330, 655, 500], 86 if len(G['frifrakt']) <= 10 else 62, namn='frifrakt'))
    print(hero(ut, G['oppetkop'], [60, 508, 680, 606], 40 if len(G['oppetkop']) <= 22 else 32, namn='oppetkop'))
    print(hero(ut, G['vav'], [40, 275, 650, 530], 92 if len(G['vav']) <= 9 else 70, vinkel=5, namn='vav'))
    print(hero(ut, G['pris'], [45, 45, 700, 300], 92, vinkel=7, namn='pris_ug'))
    for k in ('CO_1_H1', 'RI_1_H1', 'SP_4_H1', 'UG_1_H1'):
        print(slutkort(ut, G, k))
