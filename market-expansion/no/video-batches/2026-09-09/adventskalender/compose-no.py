# Norsk text på Adventskalenderns rensade bildannonser. Samma teknik som
# market-expansion/no/video-batches/2026-09-03/medicinask/compose-no.py.
from PIL import Image, ImageDraw, ImageFont
import os
S = os.path.dirname(os.path.abspath(__file__))
BOLD = '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'
REG = '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf'

def F(size, bold=True):
    return ImageFont.truetype(BOLD if bold else REG, int(size))

def text(d, xy, s, size, fill, anchor='mm', bold=True, stroke=0, sfill=None):
    d.text(xy, s, font=F(size, bold), fill=fill, anchor=anchor,
           stroke_width=int(stroke), stroke_fill=sfill)

def star(d, cx, cy, r, fill=(230, 180, 30)):
    import math
    pts = []
    for i in range(10):
        ang = -math.pi / 2 + i * math.pi / 5
        rad = r if i % 2 == 0 else r * 0.42
        pts.append((cx + rad * math.cos(ang), cy + rad * math.sin(ang)))
    d.polygon(pts, fill=fill)

def stars(d, x, y, n=5, r=13, gap=32):
    for i in range(n):
        star(d, x + i * gap, y, r)

def load(name):
    im = Image.open(f'{S}/img-clean-{name}.png').convert('RGB')
    return im, ImageDraw.Draw(im), im.size

out = f'{S}/img-no-final'
os.makedirs(out, exist_ok=True)

# ── CS: rött band upptill (Kie rensade inte det automatiskt — måla över) ──
im, d, (W, H) = load('CS_2_1')
d.rectangle([0, 0, W, 169], fill=(207, 8, 7))
text(d, (W / 2, 46), '24% RABATT – I DAG', 50, 'white')
text(d, (300, 112), '579 kr', 46, (235, 190, 190))
d.line([(228, 106), (372, 106)], fill=(235, 190, 190), width=4)
text(d, (330, 112), '→', 46, 'white', anchor='lm')
text(d, (400, 112), '439 kr', 46, 'white', anchor='lm')
text(d, (293, 1016), 'KJØP FØR DET ER TOMT', 30, (207, 8, 7))
im.save(f'{out}/Adventskalender_NO_CS_2_1.png')

# ── G: helt vitt fält upptill — rubrik, brödtext, ny knapp ──
im, d, (W, H) = load('G_2_1')
text(d, (W / 2, 55), 'DEN PERFEKTE JULEGAVEN TIL', 36, (20, 20, 20))
text(d, (W / 2, 100), 'BARNET SOM ELSKER BILER', 36, (20, 20, 20))
text(d, (W / 2, 155), 'Se blikket når han åpner den – og vet at', 24, (60, 60, 60))
text(d, (W / 2, 185), 'du fant den beste gaven i år.', 24, (60, 60, 60))
d.rounded_rectangle([228, 235, 668, 300], radius=18, fill=(139, 20, 20))
text(d, (W / 2, 267), 'GI BORT GLEDE I 24 DAGER', 28, 'white')
im.save(f'{out}/Adventskalender_NO_G_2_1.png')

# ── PD: mörk foto-bakgrund upptill — vit text med mörk kontur ──
im, d, (W, H) = load('PD_2_1')
text(d, (W / 2, 55), 'SJOKOLADEN FORSVINNER PÅ 10', 40, 'white', stroke=3, sfill=(20, 20, 20))
text(d, (W / 2, 105), 'SEKUNDER – DENNE BLIR VÆRENDE', 40, 'white', stroke=3, sfill=(20, 20, 20))
text(d, (W / 2, 155), 'HELE DESEMBER', 40, 'white', stroke=3, sfill=(20, 20, 20))
im.save(f'{out}/Adventskalender_NO_PD_2_1.png')

# ── SP: en sammanslagen ruta längst ner — stjärnor, citat, garanti, knapp ──
im, d, (W, H) = load('SP_2_1')
stars(d, 78, 865, r=12, gap=30)
text(d, (240, 865), '"Beste kalenderen vi har kjøpt –', 26, (25, 20, 15), anchor='lm')
text(d, (60, 898), 'han hoppet ut av sengen hver morgen for', 26, (25, 20, 15), anchor='lm')
text(d, (60, 931), 'å åpne en luke!" – Verifisert kunde, 34 år', 26, (25, 20, 15), anchor='lm')
text(d, (60, 975), 'Garanti: 30 dagers åpent kjøp – fornøyd', 24, (55, 45, 30), anchor='lm', bold=False)
text(d, (60, 1003), 'eller pengene tilbake', 24, (55, 45, 30), anchor='lm', bold=False)
d.rounded_rectangle([293, 1025, 603, 1080], radius=16, fill=(120, 80, 30))
text(d, (448, 1053), 'BESTILL NÅ', 26, 'white')
im.save(f'{out}/Adventskalender_NO_SP_2_1.png')

print('klart:', sorted(os.listdir(out)))
