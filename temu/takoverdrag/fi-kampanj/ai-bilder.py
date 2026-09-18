#!/usr/bin/env python3
"""De fyra AI-genererade bildannonserna (SP_2_1, PD_2_1, GT_2_1, CS_2_1, 1024×1024): texten låg direkt på
fotot, så formdetektorn i oversatt-bild.py hittar den inte. Vägen 2026-09-18: kie.ai nano-banana-edit tar
bort ALL text (behåller fotot), sedan ritas den finska texten som vektortext här (PIL) på samma plats och i
samma stil som den svenska — aldrig AI-ritad text.

    python3 temu/takoverdrag/fi-kampanj/ai-bilder.py <fi-texter.json> <renmapp> <utmapp> [<semapp>]

Skriver <ut>/FI_<namn>.jpg + <ut>/FI_<namn>.qa.jpg (SE | FI sida vid sida) när <semapp> ges.
Måtten är mätta ur SE-bilderna 2026-09-18 (1024 px).
"""
import json, os, sys
from PIL import Image, ImageDraw, ImageFont

FET = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
NORM = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"


def font(p, s): return ImageFont.truetype(p, s)


def passa(text, p, bredd, start, minst=14):
    s = start
    while s > minst and font(p, s).getlength(text) > bredd: s -= 1
    return font(p, s)


def rader(namn, T, form):
    """Finska rader för form-index ur fi-texter.json (texter[].text i ordning)."""
    return [t['text'] for t in T[namn]['former'][form]['texter']]


def centrerat(d, cx, y, text, f, fill, stroke=0, stroke_fill=None):
    d.text((cx, y), text, font=f, fill=fill, anchor='ma', stroke_width=stroke, stroke_fill=stroke_fill)


def sp_2_1(im, T):
    d = ImageDraw.Draw(im)
    n = 'Takoverdrag_SP_2_1'
    box = rader(n, T, 0); knapp = rader(n, T, 1)[0]; foto = rader(n, T, 2)[0]
    # beige platta nederst (SE: y 709–1024, färg ~ (240,240,234)) — Kie lämnade fotot, plattan ritas om
    d.rectangle([0, 709, 1024, 1024], fill=(240, 240, 234))
    d.rounded_rectangle([64, 740, 960, 890], radius=14, fill=(226, 224, 210))
    y = 760
    for rad in box[:3]:
        f = passa(rad, FET if rad is box[0] or len(box) < 3 else NORM, 860, 34, 18)
        centrerat(d, 512, y, rad, f, (40, 36, 30))
        y += f.size + 12
    # grön knapp + liten text
    fk = passa(knapp, FET, 300, 24, 14)
    kb = fk.getlength(knapp) + 40
    d.rounded_rectangle([64, 924, 64 + kb, 984], radius=8, fill=(45, 90, 60))
    d.text((64 + kb / 2, 954), knapp, font=fk, fill=(255, 255, 255), anchor='mm')
    d.text((64 + kb + 26, 954), foto, font=passa(foto, NORM, 900 - kb, 24, 14), fill=(40, 36, 30), anchor='lm')


def pd_2_1(im, T):
    d = ImageDraw.Draw(im)
    r = rader('Takoverdrag_PD_2_1', T, 0)
    y = 58
    for rad in r[:3]:
        f = passa(rad.upper(), FET, 900, 50, 26)
        centrerat(d, 512, y, rad.upper(), f, (28, 34, 46), stroke=2, stroke_fill=(232, 238, 246))
        y += f.size + 14


def gt_2_1(im, T):
    d = ImageDraw.Draw(im)
    n = 'Takoverdrag_GT_2_1'
    rub = rader(n, T, 0); under = rader(n, T, 1)[0]; knapp = rader(n, T, 2)[0]
    y = 44
    for rad in rub[:2]:
        f = passa(rad.upper(), FET, 940, 54, 28)
        centrerat(d, 512, y, rad.upper(), f, (255, 255, 255), stroke=2, stroke_fill=(30, 30, 30))
        y += f.size + 8
    fu = passa(under, FET, 940, 27, 16)
    centrerat(d, 512, y + 6, under, fu, (240, 240, 240), stroke=1, stroke_fill=(30, 30, 30))
    fk = passa(knapp, NORM, 700, 24, 14)
    kb = fk.getlength(knapp) + 48
    d.rounded_rectangle([512 - kb / 2, 644, 512 + kb / 2, 690], radius=6, fill=(38, 34, 30))
    d.text((512, 667), knapp, font=fk, fill=(255, 255, 255), anchor='mm')


def cs_2_1(im, T):
    d = ImageDraw.Draw(im)
    n = 'Takoverdrag_CS_2_1'
    rub = rader(n, T, 0)[0]; pris = rader(n, T, 1)[0]; lager = rader(n, T, 2)[0]; knapp = rader(n, T, 3)[0]
    d.text((50, 46), rub.upper(), font=passa(rub.upper(), FET, 640, 62, 30), fill=(196, 30, 30))
    # "165,90 €  126,90 €" — jämförpriset överstruket grått, priset fett svart
    delar = pris.split('  ') if '  ' in pris else pris.split(' ', 2)[:2]
    jf, pr = (delar[0], delar[-1]) if len(delar) >= 2 else ('', pris)
    fj = font(FET, 36); fp = font(FET, 40)
    d.text((50, 128), jf, font=fj, fill=(120, 120, 120))
    bb = d.textbbox((50, 128), jf, font=fj)
    d.line([(bb[0], (bb[1] + bb[3]) / 2 + 2), (bb[2], (bb[1] + bb[3]) / 2 + 2)], fill=(120, 120, 120), width=3)
    d.text((bb[2] + 18, 124), pr, font=fp, fill=(20, 20, 20))
    d.text((50, 184), lager, font=passa(lager, NORM, 640, 24, 14), fill=(40, 40, 40))
    fk = passa(knapp, NORM, 400, 22, 14)
    kb = fk.getlength(knapp) + 36
    d.rounded_rectangle([50, 220, 50 + kb, 258], radius=6, outline=(80, 80, 80), width=2, fill=(252, 252, 252))
    d.text((50 + kb / 2, 239), knapp, font=fk, fill=(40, 40, 40), anchor='mm')


RIT = {'Takoverdrag_SP_2_1': sp_2_1, 'Takoverdrag_PD_2_1': pd_2_1, 'Takoverdrag_GT_2_1': gt_2_1, 'Takoverdrag_CS_2_1': cs_2_1}

if __name__ == '__main__':
    T = json.load(open(sys.argv[1], encoding='utf-8'))
    ren, ut = sys.argv[2], sys.argv[3]
    se = sys.argv[4] if len(sys.argv) > 4 else None
    os.makedirs(ut, exist_ok=True)
    for namn, fn in RIT.items():
        src = f'{ren}/{namn}.png'
        if not os.path.exists(src): print('SAKNAS (ingen ren bild):', namn); continue
        im = Image.open(src).convert('RGB').resize((1024, 1024))
        fn(im, T)
        p = f'{ut}/FI_{namn}.jpg'; im.save(p, quality=92)
        if se and os.path.exists(f'{se}/{namn}.jpg'):
            a = Image.open(f'{se}/{namn}.jpg').convert('RGB').resize((1024, 1024))
            qa = Image.new('RGB', (2048, 1024)); qa.paste(a, (0, 0)); qa.paste(im, (1024, 0)); qa.save(f'{ut}/FI_{namn}.qa.jpg', quality=80)
        print('OK', p)
