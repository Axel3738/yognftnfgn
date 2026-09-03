# Norsk text på klistremerker-plattorna. Samma teknik som 2026-08-29/compose-no-3.py.
# Rader från copy-subagenten (sonnet) 2026-09-03.
from PIL import Image, ImageDraw, ImageFont
import math, os
S = os.path.dirname(os.path.abspath(__file__))
BOLD = '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'
REG  = '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf'
def F(size, bold=True): return ImageFont.truetype(BOLD if bold else REG, int(size))
def text(d, xy, s, size, fill, anchor='mm', bold=True, stroke=0, sfill=None, W=1024):
    d.text((xy[0]*W, xy[1]*W), s, font=F(size*W, bold), fill=fill, anchor=anchor, stroke_width=int(stroke*W), stroke_fill=sfill)
def button(d, box, color, W, outline=None):
    d.rounded_rectangle([box[0]*W, box[1]*W, box[2]*W, box[3]*W], radius=0.035*W, fill=color, outline=outline, width=3)
def star(d, cx, cy, r, fill):
    pts = []
    for i in range(10):
        a = math.pi/2 + i*math.pi/5; rr = r if i % 2 == 0 else r*0.42
        pts.append((cx + rr*math.cos(a), cy - rr*math.sin(a)))
    d.polygon(pts, fill=fill)
def load(k):
    im = Image.open(f'{S}/img-clean/{k}.png').convert('RGB'); return im, ImageDraw.Draw(im), im.size[0]
out = f'{S}/img-no-final'; os.makedirs(out, exist_ok=True)
only = os.environ.get('ONLY', 'CS,G,PD,SP').split(',')

if 'CS' in only:
    im, d, W = load('CS')
    text(d, (.5, .09), '50 % RABATT – I DAG', .078, (17,17,17), stroke=.004, sfill='white')
    text(d, (.5, .18), 'Kun 199 kr – snart utsolgt', .058, (17,17,17), stroke=.004, sfill='white')
    im.save(f'{out}/Klistremerker_NO_CS_2_1.png')

if 'G' in only:
    im, d, W = load('G')
    text(d, (.5, .085), 'DEN PERFEKTE LILLE GAVEN', .054, (150,80,30))
    text(d, (.5, .15), 'TIL BARNEBARNA', .054, (150,80,30))
    text(d, (.5, .215), 'Se ansiktet deres lyse opp', .036, (40,30,20), bold=False)
    button(d, (.31, .915, .69, .975), (250,244,232), W, outline=(150,80,30))
    text(d, (.5, .945), 'GI BORT ET SMIL', .03, (150,80,30))
    im.save(f'{out}/Klistremerker_NO_G_2_1.png')

if 'PD' in only:
    im, d, W = load('PD')
    text(d, (.5, .12), 'KJEDELIG SØPPELDUNK?', .072, (17,17,17))
    text(d, (.5, .21), 'IKKE LENGER.', .072, (17,17,17))
    im.save(f'{out}/Klistremerker_NO_PD_2_1.png')

if 'SP' in only:
    im, d, W = load('SP')
    text(d, (.5, .055), '«Barna kaster søppelet helt selv nå', .045, (17,17,17))
    text(d, (.5, .11), '– årets beste kjøp!»', .045, (17,17,17))
    for i in range(5): star(d, (.235 + i*.042)*W, .168*W, .019*W, (245,180,30))
    text(d, (.455, .168), '– Verifisert kunde, 34 år', .03, (40,40,40), anchor='lm', bold=False)
    text(d, (.5, .895), '30 dagers åpent kjøp', .034, (17,17,17), bold=False)
    button(d, (.37, .935, .63, .985), (250,190,30), W)
    text(d, (.5, .96), 'BESTILL NÅ', .03, (17,17,17))
    im.save(f'{out}/Klistremerker_NO_SP_2_1.png')
print('klart:', sorted(os.listdir(out)))
