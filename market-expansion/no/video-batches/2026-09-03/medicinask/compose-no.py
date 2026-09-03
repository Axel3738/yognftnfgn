# Norsk text på Medicinask-plattornas rensade bilder. Samma teknik som
# market-expansion/no/video-batches/2026-08-29/compose-no-3.py.
from PIL import Image, ImageDraw, ImageFont
import math, os
S = os.path.dirname(os.path.abspath(__file__))
BOLD = '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'
REG  = '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf'

def F(size, bold=True): return ImageFont.truetype(BOLD if bold else REG, int(size))

def text(d, xy, s, size, fill, anchor='mm', bold=True, stroke=0, sfill=None, W=1024):
    d.text((xy[0]*W, xy[1]*W), s, font=F(size*W, bold), fill=fill, anchor=anchor,
           stroke_width=int(stroke*W), stroke_fill=sfill)

def button(d, box, color, W):
    d.rounded_rectangle([box[0]*W, box[1]*W, box[2]*W, box[3]*W], radius=0.028*W, fill=color)

def load(name):
    im = Image.open(f'{S}/img-clean/{name}.png').convert('RGB')
    return im, ImageDraw.Draw(im), im.size[0]

out = f'{S}/img-no-final'; os.makedirs(out, exist_ok=True)

# ── CS: röda bandet upptill (rabatt), pris i vita fältet, svart band nedtill ──
im, d, W = load('CS')
text(d, (.5, .065), '24 % RABATT – I DAG', .052, 'white')
text(d, (.30, .175), '219 kr', .052, (17,17,17))
# strecka 289 kr manuellt (linje över texten)
text(d, (.65, .175), '289 kr', .040, (140,140,140))
d.line([(.575*W, .168*W), (.735*W, .168*W)], fill=(140,140,140), width=int(.004*W))
text(d, (.5, .965), 'Nesten utsolgt – bestill før den er borte!', .028, 'white')
im.save(f'{out}/Medicinask_NO_CS_2_1.png')

# ── PD: mörk rubrik i det ljusa övre fältet ──
im, d, W = load('PD')
text(d, (.5, .085), 'Slutt å blande sammen', .055, (25,20,15), stroke=.0015, sfill='white')
text(d, (.5, .150), 'medisinene dine – få orden', .055, (25,20,15), stroke=.0015, sfill='white')
text(d, (.5, .215), 'på hele uken.', .055, (25,20,15), stroke=.0015, sfill='white')
im.save(f'{out}/Medicinask_NO_PD_2_1.png')

# ── SP: citat + attribution uppe, kort botten med claim + knapp ──
im, d, W = load('SP')
text(d, (.05, .075), '"Det beste kjøpet jeg har', .044, (25,20,15), anchor='lm', stroke=.0018, sfill='white')
text(d, (.05, .135), 'gjort i år – endelig orden', .044, (25,20,15), anchor='lm', stroke=.0018, sfill='white')
text(d, (.05, .195), 'på medisinene mine!"', .044, (25,20,15), anchor='lm', stroke=.0018, sfill='white')
text(d, (.05, .265), '– Verifisert kunde, 62 år', .030, (55,50,45), anchor='lm', bold=False, stroke=.0015, sfill='white')
d.rectangle([0, .875*W, W, W], fill=(245,240,230))
text(d, (.05, .925), '30 dagers åpent kjøp – ingen spørsmål.', .030, (25,20,15), anchor='lm')
button(d, (.72, .900, .965, .965), (150,110,60), W)
text(d, (.8425, .932), 'Bestill nå', .030, 'white')
im.save(f'{out}/Medicinask_NO_SP_2_1.png')

# ── G: ingen svensk text fanns, ingen norsk text läggs till ──
Image.open(f'{S}/img-clean/G.png').convert('RGB').save(f'{out}/Medicinask_NO_G_2_1.png')

print('klart:', sorted(os.listdir(out)))
