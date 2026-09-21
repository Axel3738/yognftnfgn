# Norsk text på de 12 rensade bildannonsplattorna (Fas 3.2, /translate-no,
# batch 2026-09-19, Vedklyvborr + Fôrede Innetøfler + Dinosaur Adventskalender).
# Positionerna är avlästa visuellt ur källbildernas svenska text.
import os
from PIL import Image, ImageDraw, ImageFont
import math

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


def checkmark(d, cx, cy, size, color, width_frac=0.012):
    """✓ som två linjer — glyfen saknas i Liberation Sans."""
    cx, cy, size = cx * W, cy * W, size * W
    w = max(2, int(width_frac * W))
    d.line([(cx - size * 0.5, cy), (cx - size * 0.12, cy + size * 0.42)],
           fill=color, width=w, joint='curve')
    d.line([(cx - size * 0.12, cy + size * 0.42), (cx + size * 0.55, cy - size * 0.38)],
           fill=color, width=w, joint='curve')


def stars(d, cx, cy, n, r, gap, color):
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
BLACK = (20, 15, 10)
DARKSTROKE = (20, 15, 10)
GOLD = (222, 184, 118)
RED_BOX = (200, 40, 40)
ORANGE = (232, 130, 40)
GREEN_BOX = (74, 124, 66)
BROWN_BOX = (120, 82, 56)
GRAY_OLIVE = (60, 66, 40)

# ───────────────────────── vedklyvborr ─────────────────────────

# CS: rött taggigt märke upptill vänster (redan format i bilden), rubrik höger,
# subtext, orange knapp.
im, d, _ = load('vedklyvborr_CS_2_1')
d.ellipse([0.010 * W, 0.045 * W, 0.300 * W, 0.320 * W], fill=RED_BOX)
text(d, (0.155, 0.135), '50 %', 0.075, WHITE, bold=True, max_w_frac=0.22)
text(d, (0.155, 0.225), 'RABATT –', 0.030, WHITE, bold=True, max_w_frac=0.22)
text(d, (0.155, 0.263), 'I DAG', 0.030, WHITE, bold=True, max_w_frac=0.22)
text(d, (0.655, 0.108), '50 % RABATT –', 0.058, BLACK, anchor='mm', max_w_frac=0.46)
text(d, (0.655, 0.178), 'I DAG', 0.058, BLACK, anchor='mm', max_w_frac=0.46)
text(d, (0.655, 0.270), 'Få igjen på lager – bestill', 0.036, BLACK, anchor='mm', max_w_frac=0.46)
text(d, (0.655, 0.308), 'før den er tom!', 0.036, BLACK, anchor='mm', max_w_frac=0.46)
rrect(d, (0.415, 0.385, 0.895, 0.448), ORANGE, radius=0.032)
text(d, (0.655, 0.417), 'FÅ TILBUDET', 0.032, WHITE, max_w_frac=0.42)
save(im, 'NO_vedklyvborr_CS_2_1')

# GT: rubrik uppe höger (2 rader), subtext, gyllen knapp, gaveetikett-text.
im, d, _ = load('vedklyvborr_GT_2_1')
text(d, (0.94, 0.088), 'DEN PERFEKTE', 0.048, WHITE, anchor='rm', max_w_frac=0.55)
text(d, (0.94, 0.148), 'GAVEN TIL PAPPA', 0.048, WHITE, anchor='rm', max_w_frac=0.55)
text(d, (0.94, 0.208), 'Se gleden når han åpner gaven –', 0.026, WHITE, anchor='rm',
     bold=False, max_w_frac=0.55)
text(d, (0.94, 0.240), 'og slipper å hugge ved for hånd.', 0.026, WHITE, anchor='rm',
     bold=False, max_w_frac=0.55)
rrect(d, (0.640, 0.268, 0.945, 0.335), GOLD, radius=0.05)
text(d, (0.793, 0.302), 'GI BORT GLEDEN', 0.030, BLACK, max_w_frac=0.28)
text(d, (0.398, 0.845), 'DEN PERFEKTE', 0.026, BLACK, max_w_frac=0.24)
text(d, (0.398, 0.875), 'GAVEN TIL PAPPA', 0.026, BLACK, max_w_frac=0.24)
save(im, 'NO_vedklyvborr_GT_2_1')

# PD: vit rubrik upptill vänster, 2 rader.
im, d, _ = load('vedklyvborr_PD_2_1')
text(d, (0.055, 0.088), 'SLUTT Å HOGGE VED –', 0.052, WHITE, anchor='lm', max_w_frac=0.90)
text(d, (0.055, 0.148), 'LA BORET GJØRE JOBBEN', 0.052, WHITE, anchor='lm', max_w_frac=0.90)
save(im, 'NO_vedklyvborr_PD_2_1')

# SP: stjärnor, citat (mjukat, ingen ålderattribution), grön check + 30 dagar, brun knapp.
im, d, _ = load('vedklyvborr_SP_2_1')
stars(d, 0.700, 0.302, 5, 0.024, 0.056, GOLD)
text(d, (0.605, 0.352), '"Et av de beste kjøpene jeg', 0.030, BLACK, anchor='lm', max_w_frac=0.42)
text(d, (0.605, 0.386), 'har gjort før vinteren –', 0.030, BLACK, anchor='lm', max_w_frac=0.42)
text(d, (0.605, 0.420), 'sparer rygg og tid!"', 0.030, BLACK, anchor='lm', max_w_frac=0.42)
text(d, (0.605, 0.456), '– Fornøyd kunde', 0.024, BLACK, anchor='lm', bold=False, max_w_frac=0.42)
checkmark(d, 0.615, 0.498, 0.022, GREEN_BOX, width_frac=0.008)
text(d, (0.645, 0.500), '30 dagers åpent kjøp', 0.028, BLACK, anchor='lm', max_w_frac=0.38)
rrect(d, (0.605, 0.548, 0.860, 0.610), BROWN_BOX, radius=0.05)
text(d, (0.733, 0.579), 'BESTILL NÅ', 0.028, WHITE, max_w_frac=0.30)
save(im, 'NO_vedklyvborr_SP_2_1')

# ───────────────────────── inomhustofflor ─────────────────────────

# CS: svart fet text på vit list upptill + nedtill.
im, d, _ = load('inomhustofflor_CS_2_1')
text(d, (0.5, 0.078), '50 % RABATT – I DAG', 0.058, BLACK, max_w_frac=0.90)
text(d, (0.5, 0.922), 'FÅ IGJEN PÅ LAGER – BESTILL NÅ', 0.048, BLACK, max_w_frac=0.90)
save(im, 'NO_inomhustofflor_CS_2_1')

# GT: gyllen rubrik upptill (på blurrad platta), rest av bilden intakt.
im, d, _ = load('inomhustofflor_GT_2_1')
text(d, (0.5, 0.088), 'Gaven han faktisk vil ha', 0.046, GOLD, max_w_frac=0.90,
     stroke=0.002, sfill=DARKSTROKE)
save(im, 'NO_inomhustofflor_GT_2_1')

# PD: svart fet text på vit list upptill.
im, d, _ = load('inomhustofflor_PD_2_1')
text(d, (0.5, 0.108), 'KALDE FØTTER? IKKE LENGER.', 0.052, BLACK, max_w_frac=0.90)
save(im, 'NO_inomhustofflor_PD_2_1')

# SP: 5-stjärnig badge uppe höger, citat (mjukat), stjärnor+30 dagar, brun knapp.
im, d, _ = load('inomhustofflor_SP_2_1')
rrect(d, (0.755, 0.055, 0.975, 0.118), WHITE, radius=0.05)
stars(d, 0.865, 0.087, 5, 0.018, 0.040, GOLD)
text(d, (0.590, 0.660), 'Mange kunder sier de', 0.032, BLACK, anchor='lm', max_w_frac=0.40)
text(d, (0.590, 0.696), 'er noen av de beste tøflene', 0.032, BLACK, anchor='lm', max_w_frac=0.40)
text(d, (0.590, 0.732), 'de har hatt.', 0.032, BLACK, anchor='lm', max_w_frac=0.40)
stars(d, 0.660, 0.760, 5, 0.014, 0.032, GOLD)
text(d, (0.590, 0.792), '30 dagers åpent kjøp', 0.026, BLACK, anchor='lm', max_w_frac=0.42)
rrect(d, (0.590, 0.828, 0.960, 0.890), BROWN_BOX, radius=0.05)
text(d, (0.775, 0.859), 'Bestill nå', 0.030, WHITE, max_w_frac=0.32)
save(im, 'NO_inomhustofflor_SP_2_1')

# ───────────────────────── dinosauriekalender ─────────────────────────

# CS: vit banderoll upptill (tom form i bilden) + vit text nedtill på rosa bakgrund.
im, d, _ = load('dinosauriekalender_CS_2_1')
text(d, (0.5, 0.115), '25 % RABATT – I DAG', 0.048, RED_BOX, max_w_frac=0.62)
text(d, (0.5, 0.253), 'LAGERET TAR SNART SLUTT', 0.038, WHITE, max_w_frac=0.90)
save(im, 'NO_dinosauriekalender_CS_2_1')

# G: vit rubrik upptill (2 rader), subtext, grön knapp.
im, d, _ = load('dinosauriekalender_G_2_1')
text(d, (0.5, 0.070), 'DEN PERFEKTE JULEGAVEN TIL', 0.044, WHITE, max_w_frac=0.90)
text(d, (0.5, 0.128), 'DITT DINOSAURELSKENDE BARN', 0.044, WHITE, max_w_frac=0.90)
text(d, (0.5, 0.822), 'Se gleden hver morgen i desember', 0.034, WHITE, max_w_frac=0.90)
rrect(d, (0.318, 0.888, 0.682, 0.950), GREEN_BOX, radius=0.05)
text(d, (0.5, 0.919), 'GI BORT GLEDEN', 0.032, WHITE, max_w_frac=0.32)
save(im, 'NO_dinosauriekalender_G_2_1')

# PD: olivgrön fet text upptill (2 rader).
im, d, _ = load('dinosauriekalender_PD_2_1')
text(d, (0.055, 0.082), 'LEI AV EN TOM SJOKOLADEKALENDER?', 0.038, GRAY_OLIVE, anchor='lm', max_w_frac=0.90)
text(d, (0.055, 0.148), 'FÅ EN NY DINOSAUR HVER DAG', 0.044, GRAY_OLIVE, anchor='lm', max_w_frac=0.90)
save(im, 'NO_dinosauriekalender_PD_2_1')

# SP: citat (mjukat) upptill, grön prisbox nedtill höger.
im, d, _ = load('dinosauriekalender_SP_2_1')
text(d, (0.5, 0.078), '"Barna venter hver morgen på å', 0.034, WHITE, max_w_frac=0.90,
     stroke=0.0018, sfill=DARKSTROKE)
text(d, (0.5, 0.128), 'åpne neste luke – kjempegøy!"', 0.034, WHITE, max_w_frac=0.90,
     stroke=0.0018, sfill=DARKSTROKE)
text(d, (0.5, 0.178), '– Fornøyde foreldre', 0.026, WHITE, bold=False, max_w_frac=0.90,
     stroke=0.0016, sfill=DARKSTROKE)
rrect(d, (0.630, 0.855, 0.955, 0.905), GREEN_BOX, radius=0.05)
text(d, (0.793, 0.880), '30 dagers åpent kjøp', 0.024, WHITE, max_w_frac=0.30)
rrect(d, (0.630, 0.915, 0.955, 0.965), BROWN_BOX, radius=0.05)
text(d, (0.793, 0.940), 'BESTILL NÅ', 0.028, WHITE, max_w_frac=0.30)
save(im, 'NO_dinosauriekalender_SP_2_1')
