# Norsk text på Bänkhylla-bildernas rensade plattor. Samma teknik som
# market-expansion/no/video-batches/2026-09-03/medicinask/compose-no.py.
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
    d.rounded_rectangle([box[0]*W, box[1]*W, box[2]*W, box[3]*W], radius=0.045*W, fill=color)

def load(name):
    im = Image.open(f'{S}/{name}_clean.png').convert('RGB')
    return im, ImageDraw.Draw(im), im.size[0]

out = f'{S}/final'; os.makedirs(out, exist_ok=True)

# ── CS: svart rubrik uppe till vänster, pris (struket/nytt), begrenset lager, knapp ──
im, d, W = load('CS_2_1')
text(d, (.07, .105), '23 % RABATT', .052, (17,17,17), anchor='lm')
text(d, (.07, .195), '– I DAG', .052, (17,17,17), anchor='lm')
text(d, (.07, .295), '1221 kr', .040, (140,140,140), anchor='lm')
d.line([(.073*W, .285*W), (.225*W, .285*W)], fill=(140,140,140), width=int(.005*W))
text(d, (.245, .295), '939 kr', .052, (17,17,17), anchor='lm')
text(d, (.07, .375), 'Begrenset lager –', .034, (17,17,17), anchor='lm')
text(d, (.07, .425), 'utsolgt snart', .034, (17,17,17), anchor='lm')
button(d, (.07, .865, .50, .935), (196,154,102), W)
text(d, (.285, .900), 'Kjøp før den er tom', .028, 'white')
im.save(f'{out}/Benkehylle_NO_CS_2_1.png')

# ── G: hvit rubrik/underrubrik øverst, knapp nederst ──
im, d, W = load('G_2_1')
text(d, (.5, .085), 'Den perfekte gaven til mamma', .048, 'white', stroke=.0015, sfill=(0,0,0))
text(d, (.5, .150), 'Se ansiktet hennes når kjøkkenet', .033, 'white', stroke=.0012, sfill=(0,0,0))
text(d, (.5, .190), 'endelig får plass til alt', .033, 'white', stroke=.0012, sfill=(0,0,0))
button(d, (.305, .885, .695, .955), (196,154,102), W)
text(d, (.5, .920), 'Gi henne mer plass', .030, 'white')
im.save(f'{out}/Benkehylle_NO_G_2_1.png')

# ── SP: sitat + attribusjon øverst (hvit), claim + knapp nederst ──
im, d, W = load('SP_2_1')
text(d, (.5, .075), '"Endelig ser jeg benken min igjen.', .040, 'white', stroke=.0015, sfill=(0,0,0))
text(d, (.5, .130), 'Beste kjøpet jeg har gjort til kjøkkenet i år!"', .040, 'white', stroke=.0015, sfill=(0,0,0))
text(d, (.5, .190), '– Verifisert kunde, 42 år', .028, 'white', bold=False, stroke=.0012, sfill=(0,0,0))
text(d, (.5, .250), '30 dagers åpent kjøp – pengene tilbake ved misnøye', .026, 'white', stroke=.0012, sfill=(0,0,0))
button(d, (.40, .925, .60, .975), (196,154,102), W)
text(d, (.5, .950), 'Handle nå', .026, 'white')
im.save(f'{out}/Benkehylle_NO_SP_2_1.png')

print('klart:', sorted(os.listdir(out)))
