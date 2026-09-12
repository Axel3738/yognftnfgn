# Norsk text på de 11 rensade bildannonsplattorna (Fas 3.2, /translate-no,
# batch 2026-09-12). Positionerna är MÄTTA ur källbildernas svenska text med
# numpy (se measure.py), inte gissade. Samma teknik som
# market-expansion/no/video-batches/2026-09-10/palsborste-images/compose-no.py.
import math
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
    """Autokrymper fontstorlek tills raden ryms inom max_w_frac * W."""
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


def checkmark(d, cx, cy, size, color, width_frac=0.012):
    """✓ som två linjer — glyfen saknas i Liberation Sans."""
    cx, cy, size = cx * W, cy * W, size * W
    w = max(2, int(width_frac * W))
    d.line([(cx - size * 0.5, cy), (cx - size * 0.12, cy + size * 0.42)],
           fill=color, width=w, joint='curve')
    d.line([(cx - size * 0.12, cy + size * 0.42), (cx + size * 0.55, cy - size * 0.38)],
           fill=color, width=w, joint='curve')


def shield_check(d, cx, cy, size, shield_color, check_color):
    """Enkel sköld (rundad polygon) med kryss/check inuti, i stil med
    solcellslarm/termoskydd-badgen. cx/cy/size är fraktioner av W."""
    cx_px, cy_px, h = cx * W, cy * W, size * W
    w = h * 0.86
    pts = [
        (cx_px, cy_px - h * 0.5), (cx_px + w * 0.5, cy_px - h * 0.34),
        (cx_px + w * 0.5, cy_px + h * 0.05), (cx_px, cy_px + h * 0.5),
        (cx_px - w * 0.5, cy_px + h * 0.05), (cx_px - w * 0.5, cy_px - h * 0.34),
    ]
    d.polygon(pts, fill=shield_color)
    checkmark(d, cx, cy - size * 0.04, size * 0.5, check_color, width_frac=0.010)


def load(name):
    im = Image.open(f'{IN}/{name}.png').convert('RGB')
    return im, ImageDraw.Draw(im), im.size[0]


def save(im, out_name):
    im.save(f'{OUT}/{out_name}.png')
    print('sparad:', out_name)


WHITE = (255, 255, 255)
DARKSTROKE = (20, 15, 10)


# ───────────────────────── jetvifte ─────────────────────────

# G: gåva. Vitt fet rubrik + underrubrik upptill, blå knapp nedtill.
im, d, _ = load('jetvifte_G_2_1')
text(d, (0.5, 0.085), 'DEN PERFEKTE GAVEN TIL', 0.058, WHITE, stroke=0.0028, sfill=DARKSTROKE)
text(d, (0.5, 0.142), 'HAM SOM ALLEREDE HAR ALT', 0.058, WHITE, stroke=0.0028, sfill=DARKSTROKE)
text(d, (0.5, 0.206), 'Se ansiktet hans når han åpner den', 0.034, WHITE,
     bold=False, stroke=0.002, sfill=DARKSTROKE, max_w_frac=0.80)
rrect(d, (0.289, 0.869, 0.717, 0.966), (33, 99, 161), radius=0.03)
text(d, (0.503, 0.917), 'Bestill gaven i dag →', 0.033, WHITE, max_w_frac=0.40)
save(im, 'NO_jetvifte_G_2_1')

# PD: produktdemo, garage. Vit fet rubrik upptill.
im, d, _ = load('jetvifte_PD_2_1')
text(d, (0.5, 0.075), 'SLUTT PÅ STØV I GARASJEN', 0.058, WHITE, stroke=0.0028, sfill=DARKSTROKE)
text(d, (0.5, 0.139), '– PÅ 10 SEKUNDER', 0.058, WHITE, stroke=0.0028, sfill=DARKSTROKE)
save(im, 'NO_jetvifte_PD_2_1')

# SP: social proof. Citat + attribution + stjärnor upptill, claim + CTA nedtill.
im, d, _ = load('jetvifte_SP_2_1')
text(d, (0.5, 0.093), '«Jeg er imponert over kraften –', 0.040, WHITE,
     stroke=0.0022, sfill=DARKSTROKE, max_w_frac=0.92)
text(d, (0.5, 0.142), 'funker rett med Makita-batteriene mine!»', 0.040, WHITE,
     stroke=0.0022, sfill=DARKSTROKE, max_w_frac=0.92)
text(d, (0.5, 0.199), '– Verifisert kunde, 47 år', 0.028, WHITE,
     bold=False, stroke=0.0015, sfill=DARKSTROKE)
stars(d, 0.5, 0.292, 5, 0.032, 0.078, (250, 225, 110))
text(d, (0.5, 0.886), '30 dagers åpent kjøp', 0.026, WHITE, bold=False, stroke=0.0013, sfill=DARKSTROKE)
text(d, (0.5, 0.928), 'Bestill nå →', 0.034, WHITE, stroke=0.0016, sfill=DARKSTROKE)
save(im, 'NO_jetvifte_SP_2_1')


# ───────────────────────── solcellslarm ─────────────────────────

# CS: rabattbanderoll + lagervarning.
im, d, _ = load('solcellslarm_CS_2_1')
d.polygon([(0, 0.079 * W), (0.72 * W, 0.079 * W), (0.68 * W, 0.263 * W), (0, 0.263 * W)],
          fill=(210, 32, 28))
text(d, (0.335, 0.128), '50 % RABATT –', 0.052, WHITE, max_w_frac=0.58)
text(d, (0.335, 0.199), 'KUN I DAG', 0.052, WHITE, max_w_frac=0.58)
text(d, (0.06, 0.303), 'Utsolgt når lageret tar slutt', 0.028, WHITE, anchor='lm', max_w_frac=0.85)
save(im, 'NO_solcellslarm_CS_2_1')

# G: gåva. Tre rader upptill, en rad nedtill.
im, d, _ = load('solcellslarm_G_2_1')
text(d, (0.5, 0.089), 'DEN PERFEKTE GAVEN TIL', 0.052, WHITE, stroke=0.0026, sfill=DARKSTROKE)
text(d, (0.5, 0.139), 'HAM SOM ALLTID BEKYMRER SEG', 0.052, WHITE, stroke=0.0026, sfill=DARKSTROKE)
text(d, (0.5, 0.195), 'FOR HUSET', 0.052, WHITE, stroke=0.0026, sfill=DARKSTROKE)
text(d, (0.5, 0.937), 'Se ansiktet hans når han skjønner at du faktisk lyttet', 0.028, WHITE,
     bold=False, stroke=0.0015, sfill=DARKSTROKE, max_w_frac=0.92)
save(im, 'NO_solcellslarm_G_2_1')

# PD: produktdemo, larm i trädgården.
im, d, _ = load('solcellslarm_PD_2_1')
text(d, (0.5, 0.088), 'UØNSKEDE GJESTER I HAGEN?', 0.052, WHITE, stroke=0.0026, sfill=DARKSTROKE)
text(d, (0.5, 0.136), 'ALARMEN SOM SKREMMER DEM', 0.052, WHITE, stroke=0.0026, sfill=DARKSTROKE)
text(d, (0.5, 0.195), 'BORT MED EN GANG.', 0.052, WHITE, stroke=0.0026, sfill=DARKSTROKE)
save(im, 'NO_solcellslarm_PD_2_1')

# SP: social proof. Ljus ruta med citat, grön check + claim, vit knapp.
im, d, _ = load('solcellslarm_SP_2_1')
box = Image.new('RGBA', im.size, (0, 0, 0, 0))
bd = ImageDraw.Draw(box)
bd.rounded_rectangle([0.014 * W, 0.034 * W, 0.634 * W, 0.317 * W], radius=0.035 * W,
                      fill=(245, 240, 230, 235))
im = Image.alpha_composite(im.convert('RGBA'), box).convert('RGB')
d = ImageDraw.Draw(im)
text(d, (0.053, 0.096), '«Endelig kan jeg sove trygt', 0.040, (35, 30, 25), anchor='lm', max_w_frac=0.55)
text(d, (0.053, 0.139), 'igjen – så fort noe beveger', 0.040, (35, 30, 25), anchor='lm', max_w_frac=0.55)
text(d, (0.053, 0.183), 'seg, høres det med en gang!»', 0.040, (35, 30, 25), anchor='lm', max_w_frac=0.55)
text(d, (0.053, 0.256), '– Verifisert kunde, 52 år', 0.030, (70, 65, 60), anchor='lm',
     bold=False, max_w_frac=0.55)
d.rectangle([0.099 * W, 0.341 * W, 0.130 * W, 0.372 * W], fill=(70, 178, 90))
checkmark(d, 0.1145, 0.356, 0.020, WHITE, width_frac=0.007)
text(d, (0.145, 0.356), '30 dagers åpent kjøp', 0.028, (30, 25, 20), anchor='lm', bold=False, max_w_frac=0.65)
rrect(d, (0.417, 0.897, 0.582, 0.946), WHITE, radius=0.05, outline=(90, 140, 100), width=0.004)
text(d, (0.4995, 0.9215), 'Handle nå', 0.030, (45, 120, 65), max_w_frac=0.36)
save(im, 'NO_solcellslarm_SP_2_1')


# ───────────────────────── termoskydd ─────────────────────────

# CS: blå + röd banderoll upptill.
im, d, _ = load('termoskydd_CS_2_1')
d.rectangle([0, 0, W, 0.136 * W], fill=(124, 161, 206))
text(d, (0.5, 0.063), '40 % RABATT – KUN I DAG', 0.056, WHITE, max_w_frac=0.94)
d.rectangle([0.135 * W, 0.120 * W, 0.866 * W, 0.180 * W], fill=(206, 49, 44))
text(d, (0.5, 0.150), 'Få igjen på lager – bestill før det er tomt!', 0.032, WHITE, max_w_frac=0.68)
save(im, 'NO_termoskydd_CS_2_1')

# G: gåva. Mörk fet rubrik + underrubrik + brun knapp, nedtill i snöscenen.
im, d, _ = load('termoskydd_G_2_1')
text(d, (0.5, 0.716), 'DEN PERFEKTE GAVEN', 0.052, (20, 20, 20), stroke=0.0015, sfill=WHITE)
text(d, (0.5, 0.771), 'TIL BOBILEIEREN', 0.052, (20, 20, 20), stroke=0.0015, sfill=WHITE)
text(d, (0.5, 0.845), 'Se gleden når de åpner den – en gave de faktisk kommer til å bruke.',
     0.028, (20, 20, 20), bold=False, stroke=0.0012, sfill=WHITE, max_w_frac=0.92)
rrect(d, (0.355, 0.893, 0.644, 0.949), (150, 123, 84), radius=0.03)
text(d, (0.4995, 0.921), 'Gi bort perfeksjon', 0.030, WHITE, max_w_frac=0.34)
save(im, 'NO_termoskydd_G_2_1')

# PD: produktdemo, sommarhetta.
im, d, _ = load('termoskydd_PD_2_1')
text(d, (0.5, 0.088), 'SLUTT PÅ VARME I BOBILEN', 0.054, WHITE, stroke=0.0026, sfill=DARKSTROKE)
text(d, (0.5, 0.139), '– MØRKLEGGER OG KJØLER', 0.054, WHITE, stroke=0.0026, sfill=DARKSTROKE)
text(d, (0.5, 0.202), 'PÅ SEKUNDER', 0.054, WHITE, stroke=0.0026, sfill=DARKSTROKE)
save(im, 'NO_termoskydd_PD_2_1')

# SP: social proof. Mörk ruta med stjärnor+citat, grön badge med skölde+check.
im, d, _ = load('termoskydd_SP_2_1')
stars(d, 0.195, 0.083, 5, 0.024, 0.058, WHITE)
text(d, (0.041, 0.131), 'Sover mye', 0.044, WHITE, anchor='lm', max_w_frac=0.33)
text(d, (0.041, 0.170), 'bedre nå –', 0.044, WHITE, anchor='lm', max_w_frac=0.33)
text(d, (0.041, 0.209), 'helt mørkt', 0.044, WHITE, anchor='lm', max_w_frac=0.33)
text(d, (0.041, 0.249), 'uansett vær!', 0.044, WHITE, anchor='lm', max_w_frac=0.33)
text(d, (0.041, 0.295), '– Verifisert kunde, 58 år', 0.028, (215, 210, 200), anchor='lm',
     bold=False, max_w_frac=0.33)
rrect(d, (0.039, 0.349, 0.375, 0.389), (61, 152, 82), radius=0.05)
shield_check(d, 0.062, 0.369, 0.026, WHITE, (61, 152, 82))
text(d, (0.098, 0.369), '30 dagers åpent kjøp', 0.026, WHITE, anchor='lm', max_w_frac=0.265)
save(im, 'NO_termoskydd_SP_2_1')

print('KLART:', sorted(os.listdir(OUT)))
