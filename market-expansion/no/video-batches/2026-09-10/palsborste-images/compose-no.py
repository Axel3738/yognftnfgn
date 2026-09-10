# Norsk text på Pelsbørste-plattornas rensade bilder (G/PD/SP). Samma teknik
# som market-expansion/no/video-batches/2026-09-03/medicinask/compose-no.py.
from PIL import Image, ImageDraw, ImageFont
import os
S = os.path.dirname(os.path.abspath(__file__))
BOLD = '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'
REG  = '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf'

def F(size, bold=True): return ImageFont.truetype(BOLD if bold else REG, int(size))

def text(d, xy, s, size, fill, anchor='mm', bold=True, stroke=0, sfill=None, W=1024):
    d.text((xy[0]*W, xy[1]*W), s, font=F(size*W, bold), fill=fill, anchor=anchor,
           stroke_width=int(stroke*W), stroke_fill=sfill)

def button(d, box, color, W):
    d.rounded_rectangle([box[0]*W, box[1]*W, box[2]*W, box[3]*W], radius=0.028*W, fill=color)

def stars(d, cx, cy, n, r, gap, color, W):
    # ★-glyfen saknas i Liberation Sans — rita femuddiga stjärnor som polygoner i stället.
    import math
    cx, cy, r, gap = cx*W, cy*W, r*W, gap*W
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
    im = Image.open(f'{S}/img-clean/{name}.png').convert('RGB')
    return im, ImageDraw.Draw(im), im.size[0]

out = f'{S}/img-no-final'; os.makedirs(out, exist_ok=True)

# ── G: gåva. Mörk bakgrund upptill, vit rubrik i två rader + underrubrik, röd knapp nedtill ──
im, d, W = load('G')
d.rectangle([0, 0, W, .30*W], fill=(0, 0, 0, 0))  # ingen platta i originalet, texten stod direkt på fotot
text(d, (.5, .075), 'DEN PERFEKTE GAVEN', .062, 'white', stroke=.003, sfill=(20,15,10))
text(d, (.5, .140), 'TIL HAM', .062, 'white', stroke=.003, sfill=(20,15,10))
text(d, (.5, .225), 'Se ansiktet hans når pelsen forsvinner – ikke humøret.', .034, 'white',
     stroke=.0025, sfill=(20,15,10))
button(d, (.30, .905, .70, .965), (196,30,30), W)
text(d, (.5, .935), 'Gi bort gleden', .034, 'white')
im.save(f'{out}/Palsborste_NO_G_2_1_NO.png')

# ── PD: produktdemo, ljust rum. Svart fet rubrik + underrubrik upptill, vit outline ──
im, d, W = load('PD')
text(d, (.5, .075), 'PELS OVERALT? IKKE MER.', .056, (20,20,20), stroke=.0025, sfill='white')
text(d, (.5, .140), 'Børst og sug opp pelsen – i samme bevegelse.', .034, (20,20,20),
     bold=False, stroke=.0018, sfill='white')
im.save(f'{out}/Palsborste_NO_PD_2_1_NO.png')

# ── SP: social proof. Kie-rensningen tog bort hela den ljusa rutan (inte bara texten
# i den) — ritar en ny halvgenomskinlig ruta i samma läge som originalet innan texten. ──
im, d, W = load('SP')
box = Image.new('RGBA', im.size, (0, 0, 0, 0))
bd = ImageDraw.Draw(box)
bd.rounded_rectangle([.50*W, .045*W, .99*W, .51*W], radius=.03*W, fill=(255, 255, 255, 225))
im = Image.alpha_composite(im.convert('RGBA'), box).convert('RGB')
d = ImageDraw.Draw(im)
# stjärnor (originalet hade två uppsättningar; behåller layouten: en uppe vänster, en i rutan)
stars(d, .13, .085, 5, .022, .052, (235,190,60), W)
stars(d, .75, .135, 5, .020, .048, (235,190,60), W)
text(d, (.75, .200), '«Endelig slipper jeg å', .040, (25,20,15), anchor='mm',
     stroke=.0015, sfill='white')
text(d, (.75, .250), 'støvsuge etter hver', .040, (25,20,15), anchor='mm',
     stroke=.0015, sfill='white')
text(d, (.75, .300), 'børsting!»', .040, (25,20,15), anchor='mm',
     stroke=.0015, sfill='white')
text(d, (.75, .350), '– Verifisert kunde, 42 år', .028, (55,50,45), anchor='mm',
     bold=False, stroke=.0012, sfill='white')
text(d, (.75, .400), '30 dagers åpent kjøp', .028, (55,50,45), anchor='mm',
     bold=False, stroke=.0012, sfill='white')
button(d, (.615, .440, .885, .500), (255,255,255), W)
d.rounded_rectangle([.615*W, .440*W, .885*W, .500*W], radius=.028*W, outline=(25,20,15), width=int(.003*W))
text(d, (.75, .470), 'Bestill nå', .030, (25,20,15))
im.save(f'{out}/Palsborste_NO_SP_2_1_NO.png')

print('klart:', sorted(os.listdir(out)))
