# Norsk text på de 4 rensade bildannonsplattorna (Fas 3.2, /translate-no,
# batch 2026-09-16, Infartslarm Trådlöst -> Trådløs Innkjørselsalarm).
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
TAN = (222, 199, 138)
BROWN = (60, 35, 15)
BLUE = (30, 90, 210)

# ───────────────────────── infartslarm ─────────────────────────

# CS: clearance sale. Vit fet rubrik upptill, vit rad nedtill, röd/orange bakgrund.
im, d, _ = load('infartslarm_CS_2_1')
text(d, (0.5, 0.083), '50 % RABATT — I DAG', 0.058, WHITE, stroke=0.0028, sfill=DARKSTROKE)
text(d, (0.5, 0.905), 'Kun noen få igjen på lager!', 0.052, WHITE,
     stroke=0.0026, sfill=DARKSTROKE, max_w_frac=0.90)
save(im, 'NO_infartslarm_CS_2_1')

# G: gåve. Gyllen fet rubrik upptill (2 rader), vit underrubrik, tan knapp nedtill.
im, d, _ = load('infartslarm_G_2_1')
text(d, (0.5, 0.068), 'DEN PERFEKTE GAVEN', 0.052, GOLD, stroke=0.0022, sfill=DARKSTROKE)
text(d, (0.5, 0.128), 'TIL MAMMA & PAPPA', 0.052, GOLD, stroke=0.0022, sfill=DARKSTROKE)
text(d, (0.5, 0.201), 'Se gleden deres hver gang', 0.036, WHITE,
     bold=False, stroke=0.0018, sfill=DARKSTROKE, max_w_frac=0.85)
text(d, (0.5, 0.243), 'bilen svinger inn.', 0.036, WHITE,
     bold=False, stroke=0.0018, sfill=DARKSTROKE, max_w_frac=0.85)
rrect(d, (0.24, 0.868, 0.76, 0.945), TAN, radius=0.05)
text(d, (0.5, 0.906), '[ GI TRYGGHET SOM GAVE ]', 0.030, BROWN, max_w_frac=0.46)
save(im, 'NO_infartslarm_G_2_1')

# PD: produktdemo, svart fet rubrik på ljus bakgrund.
im, d, _ = load('infartslarm_PD_2_1')
text(d, (0.5, 0.093), 'HØR NÅR NOEN KJØRER INN —', 0.052, BLACK, max_w_frac=0.92)
text(d, (0.5, 0.155), 'UTEN Å SJEKKE VINDUET', 0.052, BLACK, max_w_frac=0.92)
save(im, 'NO_infartslarm_PD_2_1')

# SP: social proof. Gyllene stjärnor, svart citat + attribution, svart garantirad, blå knapp.
im, d, _ = load('infartslarm_SP_2_1')
stars(d, 0.5, 0.078, 5, 0.028, 0.068, GOLD)
text(d, (0.5, 0.148), '"Jeg slapp endelig å stå og kikke', 0.037, BLACK, max_w_frac=0.88)
text(d, (0.5, 0.192), 'i vinduet hele tiden. Beste kjøpet i år!"', 0.037, BLACK, max_w_frac=0.90)
text(d, (0.5, 0.238), '- Verifisert kunde, 58 år', 0.030, BLACK, bold=False)
text(d, (0.5, 0.802), '30 dagers åpent kjøp', 0.036, BLACK)
rrect(d, (0.335, 0.856, 0.665, 0.92), BLUE, radius=0.05)
text(d, (0.5, 0.888), '[ BESTILL NÅ ]', 0.032, WHITE, max_w_frac=0.42)
save(im, 'NO_infartslarm_SP_2_1')
