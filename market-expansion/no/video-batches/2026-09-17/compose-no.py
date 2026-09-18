# Norsk text på de 8 rensade bildannonsplattorna (Fas 3.2, /translate-no,
# batch 2026-09-17, Fågelmatare + Solcellslampa).
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
RED = (200, 40, 40)
RED_BOX = (210, 30, 30)
YELLOW = (245, 205, 60)
GREEN = (70, 140, 60)
GRAY_BOX = (235, 235, 232, 235)

# ───────────────────────── fagelmatare ─────────────────────────

# CS: rött badge upptill vänster, vit prisbox (jämförpris struket + kampanjpris),
# gul box med "snart utsolgt", liten rad under.
im, d, _ = load('fagelmatare_CS_2_1')
rrect(d, (0.055, 0.093, 0.645, 0.140), RED_BOX, radius=0.010)
text(d, (0.070, 0.117), '580 KR RABATT – I DAG', 0.036, WHITE, anchor='lm', max_w_frac=0.56)
rrect(d, (0.055, 0.160, 0.500, 0.222), WHITE, radius=0.010)
text(d, (0.075, 0.191), '2499 kr', 0.036, BLACK, anchor='lm', bold=True, max_w_frac=0.16)
d.line([(0.078 * W, 0.191 * W), (0.190 * W, 0.191 * W)], fill=RED, width=3)
text(d, (0.205, 0.191), '1919 kr', 0.046, BLACK, anchor='lm', bold=True, max_w_frac=0.28)
rrect(d, (0.055, 0.242, 0.500, 0.318), YELLOW, radius=0.010)
text(d, (0.070, 0.264), 'Snart utsolgt – bestill', 0.033, BLACK, anchor='lm', max_w_frac=0.42)
text(d, (0.070, 0.298), 'før den er tom!', 0.033, BLACK, anchor='lm', max_w_frac=0.42)
text(d, (0.055, 0.352), 'Gjelder kun i dag', 0.028, WHITE, anchor='lm', bold=False,
     stroke=0.0016, sfill=DARKSTROKE)
save(im, 'NO_fagelmatare_CS_2_1')

# GT: gyllen/vit rubrik upptill, subtext, röd knapp nedtill.
im, d, _ = load('fagelmatare_GT_2_1')
text(d, (0.055, 0.078), 'DEN PERFEKTE GAVEN', 0.050, WHITE, anchor='lm',
     stroke=0.0024, sfill=DARKSTROKE, max_w_frac=0.90)
text(d, (0.055, 0.138), 'TIL FUGLEELSKEREN', 0.050, WHITE, anchor='lm',
     stroke=0.0024, sfill=DARKSTROKE, max_w_frac=0.90)
text(d, (0.055, 0.205), 'Se gleden når de oppdager', 0.034, WHITE, anchor='lm',
     bold=False, stroke=0.0016, sfill=DARKSTROKE, max_w_frac=0.80)
text(d, (0.055, 0.243), 'sin første fugl i appen.', 0.034, WHITE, anchor='lm',
     bold=False, stroke=0.0016, sfill=DARKSTROKE, max_w_frac=0.80)
rrect(d, (0.318, 0.848, 0.682, 0.925), RED_BOX, radius=0.05)
text(d, (0.5, 0.886), 'GI BORT GLEDE', 0.033, WHITE, max_w_frac=0.32)
save(im, 'NO_fagelmatare_GT_2_1')

# PD: svart fet rubrik upptill, understext.
im, d, _ = load('fagelmatare_PD_2_1')
text(d, (0.055, 0.082), 'SLUTT Å GÅ GLIPP AV', 0.050, BLACK, anchor='lm', max_w_frac=0.90)
text(d, (0.055, 0.140), 'FUGLENE — SE DEM LIVE', 0.050, BLACK, anchor='lm', max_w_frac=0.90)
text(d, (0.055, 0.192), 'Kamera + solcellepanel. Ingen lading nødvendig.', 0.028, BLACK,
     anchor='lm', bold=False, max_w_frac=0.85)
save(im, 'NO_fagelmatare_PD_2_1')

# SP: stjärnor, citat, attribution, garanti, badge + grön knapp nedtill höger.
im, d, _ = load('fagelmatare_SP_2_1')
stars(d, 0.145, 0.070, 5, 0.026, 0.062, GOLD)
text(d, (0.055, 0.138), '"Jeg ser flere fugler nå enn i', 0.033, BLACK, anchor='lm', max_w_frac=0.85)
text(d, (0.055, 0.176), 'hele fjor – helt fantastisk!"', 0.033, BLACK, anchor='lm', max_w_frac=0.85)
text(d, (0.055, 0.220), '– Verifisert kunde, 62 år', 0.026, BLACK, anchor='lm', bold=False)
text(d, (0.055, 0.792), '30 dagers åpent kjøp', 0.032, BLACK, anchor='lm')
rrect(d, (0.735, 0.822, 0.945, 0.882), WHITE, radius=0.05)
text(d, (0.775, 0.852), '5', 0.032, BLACK, anchor='mm', max_w_frac=0.10)
stars(d, 0.878, 0.852, 5, 0.014, 0.032, GOLD)
rrect(d, (0.720, 0.895, 0.945, 0.955), GREEN, radius=0.05)
text(d, (0.833, 0.925), 'BESTILL NÅ', 0.030, WHITE, max_w_frac=0.40)
save(im, 'NO_fagelmatare_SP_2_1')

# ───────────────────────── solcellslampa ─────────────────────────

# CS: mörk bakgrund, vit rubrik upptill, priser, vit rad nedtill.
im, d, _ = load('solcellslampa_CS_2_1')
text(d, (0.055, 0.098), '23% RABATT – I DAG', 0.062, WHITE, anchor='lm', max_w_frac=0.90)
text(d, (0.055, 0.822), '729 kr', 0.052, WHITE, anchor='lm', bold=True, max_w_frac=0.24)
d.line([(0.058 * W, 0.822 * W), (0.232 * W, 0.822 * W)], fill=(230, 230, 230), width=4)
text(d, (0.260, 0.822), '559 kr', 0.058, (225, 40, 40), anchor='lm', bold=True, max_w_frac=0.30)
text(d, (0.055, 0.905), 'Kun i dag – få igjen på lager', 0.038, WHITE, anchor='lm', max_w_frac=0.90)
save(im, 'NO_solcellslampa_CS_2_1')

# G: vit rubrik upptill (2 rader), subtext, vit knapp nedtill.
im, d, _ = load('solcellslampa_G_2_1')
text(d, (0.5, 0.078), 'Den perfekte gaven', 0.052, WHITE, max_w_frac=0.90)
text(d, (0.5, 0.138), 'til mannen som fikser alt.', 0.052, WHITE, max_w_frac=0.90)
text(d, (0.5, 0.198), 'Se hans min når han innser at oppkjørselen', 0.026, WHITE,
     bold=False, max_w_frac=0.85)
text(d, (0.5, 0.230), 'aldri blir mørk igjen.', 0.026, WHITE, bold=False, max_w_frac=0.85)
rrect(d, (0.315, 0.858, 0.685, 0.930), WHITE, radius=0.06)
text(d, (0.5, 0.894), 'Gi bort lyset i år', 0.032, BLACK, max_w_frac=0.42)
save(im, 'NO_solcellslampa_G_2_1')

# PD: vit rubrik upptill (2 rader), mörk bakgrund.
im, d, _ = load('solcellslampa_PD_2_1')
text(d, (0.055, 0.088), 'MØRK OPPKJØRSEL?', 0.054, WHITE, anchor='lm', max_w_frac=0.90)
text(d, (0.055, 0.148), 'IKKE LENGER.', 0.054, WHITE, anchor='lm', max_w_frac=0.90)
save(im, 'NO_solcellslampa_PD_2_1')

# SP: stjärnruta nedtill höger (grå semitransparent platta), vit knapp under.
im, d, _ = load('solcellslampa_SP_2_1')
im = im.convert('RGBA')
overlay = Image.new('RGBA', im.size, (0, 0, 0, 0))
od = ImageDraw.Draw(overlay)
od.rounded_rectangle([0.578 * W, 0.660 * W, 0.972 * W, 0.862 * W], radius=0.028 * W,
                      fill=(238, 238, 235, 235))
im = Image.alpha_composite(im, overlay).convert('RGB')
d = ImageDraw.Draw(im)
stars(d, 0.700, 0.698, 5, 0.020, 0.046, GOLD)
text(d, (0.605, 0.735), 'Sitat:', 0.024, BLACK, anchor='lm', max_w_frac=0.30)
text(d, (0.605, 0.766), '"Beste kjøpet jeg har gjort til', 0.023, BLACK, anchor='lm',
     bold=False, max_w_frac=0.36)
text(d, (0.605, 0.792), 'huset i år. Lyser opp alt!"', 0.023, BLACK, anchor='lm',
     bold=False, max_w_frac=0.36)
text(d, (0.605, 0.818), '– Verifisert kunde, 52 år', 0.020, BLACK, anchor='lm', bold=False)
text(d, (0.605, 0.844), '30 dagers åpent kjøp', 0.020, BLACK, anchor='lm', bold=False)
rrect(d, (0.780, 0.895, 0.965, 0.955), WHITE, radius=0.06)
text(d, (0.873, 0.925), 'Handle nå', 0.028, BLACK, max_w_frac=0.32)
save(im, 'NO_solcellslampa_SP_2_1')
