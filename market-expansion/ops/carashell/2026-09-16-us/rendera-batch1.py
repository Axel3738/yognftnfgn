#!/usr/bin/env python3
"""rendera-batch1.py — takskyddets fyra ärvda batch #1-bilder (_2_1) till amerikansk
engelska, deterministiskt i PIL (translate-images-skillens regel: håller modellen inte
layouten, komponera texten själv).

  CS_2_1  text på vit yta → vitmålas i exakt rutan på ORIGINALET, ny text ritas
  PD_2_1  text på himmel → Kie-rensat basfoto (bas-rensad/), ny text ritas
  GT_2_1  vit text på foto + halvgenomskinlig knapp → Kie-rensad topp komponeras på
          originalet, knappens text fylls med knappens egen färg rad för rad, ny text
  SP_2_1  crème-band med kort, grön knapp, grå rad → hela bandet byggs om

Texterna kommer ur textlager-us-batch1.json (sonnet-subagent). Skriver
us/<namn>_US.png + qa/batch1-<namn>.png (SE | US sida vid sida).
  python3 market-expansion/ops/carashell/2026-09-16-us/rendera-batch1.py
"""
import json, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont

HAR = os.path.dirname(os.path.abspath(__file__))
SE = os.path.join(HAR, 'se-bild'); BAS = os.path.join(HAR, 'bas-rensad'); UT = os.path.join(HAR, 'us'); QA = os.path.join(HAR, 'qa')
os.makedirs(UT, exist_ok=True); os.makedirs(QA, exist_ok=True)
T = json.load(open(os.path.join(HAR, 'textlager-us-batch1.json'), encoding='utf-8'))
FET = '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'
NORMAL = '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf'
TUNG = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
fel = []


def font(path, px):
    return ImageFont.truetype(path, px)


def passa(text, path, max_w, px, min_px=14):
    """Största storleken ≤ px vars bredd ryms i max_w."""
    while px > min_px:
        f = font(path, px)
        if f.getlength(text) <= max_w: return f
        px -= 1
    return font(path, min_px)


def rita(draw, xy, text, f, fill, anchor='la', skugga=None):
    if skugga:
        dx, dy, sf = skugga
        draw.text((xy[0] + dx, xy[1] + dy), text, font=f, fill=sf, anchor=anchor)
    draw.text(xy, text, font=f, fill=fill, anchor=anchor)


def spara(namn, im, se):
    ut = os.path.join(UT, f'{namn}_US.png'); im.save(ut)
    qa = Image.new('RGB', (2048 + 16, 1024), (255, 255, 255)); qa.paste(se, (0, 0)); qa.paste(im, (1024 + 16, 0))
    qa.save(os.path.join(QA, f'batch1-{namn}.png'))
    print('skrev', ut)


def kontroll_vit(a, x0, y0, x1, y1, namn):
    """Rutan som ska vitmålas får bara innehålla vitt eller text (mörkt/rött/grått) — aldrig orange form."""
    box = a[y0:y1, x0:x1].astype(int)
    orange = (box[:, :, 0] > 200) & (box[:, :, 1] > 60) & (box[:, :, 1] < 200) & (box[:, :, 2] < 120)
    if orange.sum() > 50: fel.append(f'{namn}: {int(orange.sum())} orange pixlar i vitrutan {x0},{y0},{x1},{y1} — rutan täcker en form')


# ---------------------------------------------------------------- CS_2_1
def cs():
    namn = 'CaraShellRoof_CS_2_1'; t = T[namn]
    se = Image.open(os.path.join(SE, f'{namn}.png')).convert('RGB'); a = np.array(se)
    im = se.copy(); d = ImageDraw.Draw(im)
    # rubrikens röda färg ur originalet
    rub = a[83:171, 60:910].astype(int); rm = (rub[:, :, 0] > 150) & (rub[:, :, 1] < 90) & (rub[:, :, 2] < 90)
    rod = tuple(int(v) for v in np.median(rub[rm], axis=0)) if rm.sum() else (190, 30, 25)
    for (x0, y0, x1, y1) in [(58, 78, 945, 178), (58, 178, 914, 298), (58, 298, 725, 354)]:
        kontroll_vit(a, x0, y0, x1, y1, namn)
        d.rectangle([x0, y0, x1, y1], fill=(255, 255, 255))
    # rubrik: versaler, tung, x=64, cap-topp y≈83, cap-höjd 87 → em ≈ 120, bredd ≤ 840
    f = passa(t['headline'].upper(), TUNG, 840, 112)
    rita(d, (64, 168), t['headline'].upper(), f, rod, anchor='ls')
    # prisrad: överstruket jämförpris grått + pris fett, baslinje y≈232
    fj = font(FET, 58); fp = font(FET, 62)
    x = 70
    rita(d, (x, 232), t['compare_price'], fj, (120, 120, 120), anchor='ls')
    w = fj.getlength(t['compare_price'])
    d.line([(x - 2, 232 - 20), (x + w + 2, 232 - 20)], fill=(120, 120, 120), width=6)
    rita(d, (x + w + 22, 232), t['price'], fp, (30, 30, 30), anchor='ls')
    # villkorsrad: grå normal, baslinje y≈282
    f = passa(t['terms'], NORMAL, 830, 32); rita(d, (70, 282), t['terms'], f, (95, 95, 95), anchor='ls')
    # cta: "( … )" med röda parenteser, baslinje y≈336
    f = font(NORMAL, 32); fr = font(NORMAL, 36)
    x = 70
    rita(d, (x, 336), '(', fr, rod, anchor='ls'); x += fr.getlength('( ')
    rita(d, (x, 336), t['cta'], f, (40, 40, 40), anchor='ls'); x += f.getlength(t['cta'] + ' ')
    rita(d, (x, 336), ')', fr, rod, anchor='ls')
    spara(namn, im, se)


# ---------------------------------------------------------------- PD_2_1
def pd():
    namn = 'CaraShellRoof_PD_2_1'; t = T[namn]
    se = Image.open(os.path.join(SE, f'{namn}.png')).convert('RGB')
    im = Image.open(os.path.join(BAS, f'{namn}.png')).convert('RGB').resize((1024, 1024)); d = ImageDraw.Draw(im)
    rader = [r.upper() for r in t['lines']]
    if len(rader) != 3: fel.append(f'{namn}: {len(rader)} rader, väntade 3')
    f = min((passa(r, FET, 780, 60) for r in rader), key=lambda f: f.size)
    for r, cy in zip(rader, (135, 205, 275)):           # radernas mitt i originalet: 113–156, 184–226, 253–296
        rita(d, (512, cy), r, f, (16, 16, 16), anchor='mm')
    spara(namn, im, se)


# ---------------------------------------------------------------- GT_2_1
def gt():
    namn = 'CaraShellRoof_GT_2_1'; t = T[namn]
    se = Image.open(os.path.join(SE, f'{namn}.png')).convert('RGB')
    bas = Image.open(os.path.join(BAS, f'{namn}.png')).convert('RGB').resize((1024, 1024))
    im = se.copy(); im.paste(bas.crop((0, 0, 1024, 330)), (0, 0))   # Kie-rensad topp, originalets knapp kvar
    a = np.array(im)
    # knappens vita text → radens egen (icke-text) medianfärg
    x0, y0, x1, y1 = 239, 895, 786, 964
    b = a[y0:y1, x0:x1].astype(int); vit = b.min(axis=2) > 170
    fyll = tuple(int(v) for v in np.median(b[~vit], axis=0))
    im = Image.fromarray(a); d = ImageDraw.Draw(im)
    d.rounded_rectangle([x0 + 8, y0 + 7, x1 - 8, y1 - 7], radius=8, fill=fyll)   # inre platta, kantlinjen kvar
    rub = [r.upper() for r in t['headline']]
    f = min((passa(r, FET, 900, 62) for r in rub), key=lambda f: f.size)
    for r, cy in zip(rub, (98, 168)):                      # 76–120, 146–190
        rita(d, (512, cy), r, f, (255, 255, 255), anchor='mm', skugga=(2, 3, (40, 30, 20)))
    fs = passa(t['subline'], FET, 900, 36)
    rita(d, (512, 237), t['subline'], fs, (255, 255, 255), anchor='mm', skugga=(1, 1, (60, 50, 40)))
    fb = passa(t['button'], FET, 520, 32)
    rita(d, (512, 929), t['button'], fb, (255, 250, 240), anchor='mm')
    spara(namn, im, se)


# ---------------------------------------------------------------- SP_2_1
def sp():
    namn = 'CaraShellRoof_SP_2_1'; t = T[namn]
    se = Image.open(os.path.join(SE, f'{namn}.png')).convert('RGB'); a = np.array(se).astype(int)
    # grön knapp: mät rutan i originalet (y 925–1005, x 60–420)
    g = np.array([44, 83, 58]); sub = a[925:1005, 60:420]; m = abs(sub - g).sum(axis=2) < 40
    ys, xs = np.where(m)
    if len(ys) < 500: fel.append(f'{namn}: hittade inte den gröna knappen'); return
    kx0, ky0, kx1, ky1 = 60 + xs.min(), 925 + ys.min(), 60 + xs.max(), 925 + ys.max()
    gron = tuple(int(v) for v in np.median(sub[m], axis=0))
    im = se.copy(); d = ImageDraw.Draw(im)
    d.rectangle([0, 709, 1024, 1024], fill=(245, 241, 232))
    d.rounded_rectangle([70, 742, 953, 907], radius=18, fill=(233, 225, 212))
    citat = t['quote']
    fq = min((passa(r, NORMAL, 820, 44) for r in citat), key=lambda f: f.size)
    for r, cy in zip(citat, (796, 841)):                  # 776–817, 819–865
        rita(d, (512, cy), r, fq, (13, 7, 5), anchor='mm')
    fa = passa(t['attribution'], NORMAL, 700, 22); rita(d, (512, 884), t['attribution'], fa, (30, 23, 16), anchor='mm')
    d.rounded_rectangle([kx0, ky0, kx1, ky1], radius=12, fill=gron)
    fb = passa(t['button'], FET, (kx1 - kx0) - 24, 30)
    rita(d, ((kx0 + kx1) // 2, (ky0 + ky1) // 2), t['button'], fb, (255, 255, 255), anchor='mm')
    ft = passa(t['terms'], NORMAL, 1000 - (kx1 + 26), 30); rita(d, (kx1 + 26, (ky0 + ky1) // 2), t['terms'], ft, (70, 70, 68), anchor='lm')
    spara(namn, im, se)


for fn in (cs, pd, gt, sp):
    try: fn()
    except Exception as e: fel.append(f'{fn.__name__}: {e}')
if fel:
    print('FEL:\n  ' + '\n  '.join(fel)); sys.exit(1)
print('alla fyra ritade')
