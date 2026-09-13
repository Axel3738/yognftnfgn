# Norsk text på de 4 rensade bildannonsplattorna (Fas 3.2, /translate-no,
# batch 2026-09-13, Staketstolpsbygel → Gjerdestolpebøyle). Positionerna är
# MÄTTA ur källbildernas svenska text med numpy (se measure.py).
import os
from PIL import Image, ImageDraw, ImageFont

S = os.path.dirname(os.path.abspath(__file__))
BOLD = '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'
REG = '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf'
W = 1024

IN = f'{S}/img-clean'
OUT = f'{S}/bilder-no'
os.makedirs(OUT, exist_ok=True)


def F(size, bold=True):
    return ImageFont.truetype(BOLD if bold else REG, int(size))


def fit(d, text, size_frac, max_w_frac, bold=True, min_frac=None):
    size = size_frac * W
    min_size = (min_frac or size_frac * 0.55) * W
    f = F(size, bold)
    while d.textlength(text, font=f) > max_w_frac * W and size > min_size:
        size -= 1
        f = F(size, bold)
    return f


def text(d, xy, s, size_frac, fill, anchor='mm', bold=True, stroke=0.0,
         sfill=None, max_w_frac=0.90, min_frac=None):
    f = fit(d, s, size_frac, max_w_frac, bold, min_frac)
    d.text((xy[0] * W, xy[1] * W), s, font=f, fill=fill, anchor=anchor,
           stroke_width=int(stroke * W), stroke_fill=sfill)
    return f


def rrect(d, box, color, radius=0.028, outline=None, width=0):
    d.rounded_rectangle([box[0] * W, box[1] * W, box[2] * W, box[3] * W],
                         radius=radius * W, fill=color,
                         outline=outline, width=int(width * W) if width else 0)


def stars(d, cx, cy, n, r, gap, color):
    import math
    cx, cy, r, gap = cx * W, cy * W, r * W, gap * W
    x0 = cx - (n - 1) * gap / 2
    for i in range(n):
        sx = x0 + i * gap
        pts = []
        for k in range(10):
            ang = -math.pi / 2 + k * math.pi / 5
            rad = r if k % 2 == 0 else r * 0.42
            pts.append((sx + rad * math.cos(ang), cy + rad * math.sin(ang)))
        d.polygon(pts, fill=color)


def load(name):
    im = Image.open(f'{IN}/{name}.png').convert('RGB')
    return im, ImageDraw.Draw(im), im.size[0]


def save(im, out_name):
    im.save(f'{OUT}/{out_name}.png')
    print('sparad:', out_name)


WHITE = (255, 255, 255)
DARKSTROKE = (20, 15, 10)

# ───────────────────────── staketstolpsbygel ─────────────────────────

# CS: clearance sale. Vit fet rubrik + underrubrik direkt på trästaketet.
im, d, _ = load('staketstolpsbygel_CS_2_1')
text(d, (0.5, 0.083), '30 % RABATT – I DAG', 0.058, WHITE, stroke=0.0028, sfill=DARKSTROKE)
text(d, (0.5, 0.184), 'Nesten utsolgt – ikke vent for lenge', 0.036, WHITE,
     stroke=0.0020, sfill=DARKSTROKE, max_w_frac=0.90)
save(im, 'NO_staketstolpsbygel_CS_2_1')

# GT: gåva. Vit fet rubrik upptill, underrubrik + röd knapp nedtill.
im, d, _ = load('staketstolpsbygel_GT_2_1')
text(d, (0.5, 0.091), 'Den perfekte', 0.058, WHITE, stroke=0.0028, sfill=DARKSTROKE)
text(d, (0.5, 0.185), 'gaven til pappa.', 0.058, WHITE, stroke=0.0028, sfill=DARKSTROKE)
text(d, (0.5, 0.846), 'Se ansiktet hans når han åpner den.', 0.032, WHITE,
     bold=False, stroke=0.0018, sfill=DARKSTROKE, max_w_frac=0.85)
rrect(d, (0.348, 0.892, 0.651, 0.956), (200, 40, 40), radius=0.03)
text(d, (0.4995, 0.926), 'Gi bort gleden', 0.032, WHITE, max_w_frac=0.42)
save(im, 'NO_staketstolpsbygel_GT_2_1')

# PD: produktdemo, mot den blå himlen upptill.
im, d, _ = load('staketstolpsbygel_PD_2_1')
text(d, (0.5, 0.097), 'SKJEVT GJERDE?', 0.058, WHITE, stroke=0.0028, sfill=DARKSTROKE)
text(d, (0.5, 0.184), 'IKKE LENGER.', 0.058, WHITE, stroke=0.0028, sfill=DARKSTROKE)
save(im, 'NO_staketstolpsbygel_PD_2_1')

# SP: social proof. Stjärnor + citat + attribution upptill, claim + svart knapp nedtill.
im, d, _ = load('staketstolpsbygel_SP_2_1')
stars(d, 0.5, 0.062, 5, 0.032, 0.078, WHITE)
text(d, (0.5, 0.129), 'Jeg var ferdig med hele gjerdet på en', 0.036, WHITE,
     stroke=0.0018, sfill=DARKSTROKE, max_w_frac=0.90)
text(d, (0.5, 0.177), 'ettermiddag – uten å grave et eneste hull!', 0.036, WHITE,
     stroke=0.0018, sfill=DARKSTROKE, max_w_frac=0.90)
text(d, (0.5, 0.234), '– Verifisert kunde, 52 år', 0.028, WHITE,
     bold=False, stroke=0.0014, sfill=DARKSTROKE)
text(d, (0.5, 0.861), '30 dagers åpent kjøp', 0.030, WHITE, bold=False,
     stroke=0.0015, sfill=DARKSTROKE)
rrect(d, (0.347, 0.890, 0.652, 0.959), (20, 20, 20), radius=0.03)
text(d, (0.4995, 0.9245), 'Handle nå', 0.032, WHITE, max_w_frac=0.40)
save(im, 'NO_staketstolpsbygel_SP_2_1')

print('KLART:', sorted(os.listdir(OUT)))
