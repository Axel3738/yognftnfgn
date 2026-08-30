# Norsk text på morgonbatchens rensade plattor (damasker + jattefotboll).
# Samma teknik som compose-no.py; formuleringarna följer adcopy-no-3.json (sonnet-subagent).
from PIL import Image, ImageDraw, ImageFont
import math, os
S = os.path.dirname(os.path.abspath(__file__))
SCRATCH = '/tmp/claude-0/-home-user-yognftnfgn/20f4ad07-0ad8-5cb4-91e8-4cd7205f3083/scratchpad/no-batch'
BOLD = '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'
REG  = '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf'

def F(size, bold=True): return ImageFont.truetype(BOLD if bold else REG, int(size))

def text(d, xy, s, size, fill, anchor='mm', bold=True, stroke=0, sfill=None, W=1024):
    d.text((xy[0]*W, xy[1]*W), s, font=F(size*W, bold), fill=fill, anchor=anchor,
           stroke_width=int(stroke*W), stroke_fill=sfill)

def button(d, box, color, W):
    d.rounded_rectangle([box[0]*W, box[1]*W, box[2]*W, box[3]*W], radius=0.028*W, fill=color)

def star(d, cx, cy, r, fill):  # ★ ritas som polygon — glyfen saknas i Liberation
    pts = []
    for i in range(10):
        a = math.pi/2 + i*math.pi/5
        rr = r if i % 2 == 0 else r*0.42
        pts.append((cx + rr*math.cos(a), cy - rr*math.sin(a)))
    d.polygon(pts, fill=fill)

def load(name):
    im = Image.open(f'{SCRATCH}/img-clean/{name}.png').convert('RGB')
    return im, ImageDraw.Draw(im), im.size[0]

out = f'{S}/img-no-final'; os.makedirs(out, exist_ok=True)

# ── damasker_PD: svart versalrubrik på vita bandet ──
im, d, W = load('damasker_PD_2_1')
text(d, (.5, .14), 'SNØ I SKOENE? IKKE NÅ LENGER.', .058, (17,17,17))
im.save(f'{out}/damasker_PD_2_1_NO.png')

# ── damasker_SP: citat uppe vänster, måla om bottenremsan (svensk text kvar) ──
im, d, W = load('damasker_SP_2_1')
text(d, (.06, .075), '« Helt tørre sokker – selv i', .042, 'white', anchor='lm', stroke=.002, sfill=(40,35,25))
text(d, (.06, .135), 'regn og leire. Kan ikke tro', .042, 'white', anchor='lm', stroke=.002, sfill=(40,35,25))
text(d, (.06, .195), 'at jeg ventet så lenge', .042, 'white', anchor='lm', stroke=.002, sfill=(40,35,25))
text(d, (.06, .255), 'med å kjøpe dem! »', .042, 'white', anchor='lm', stroke=.002, sfill=(40,35,25))
text(d, (.06, .325), '– Verifisert kunde, 47 år', .030, 'white', anchor='lm', bold=False, stroke=.0018, sfill=(40,35,25))
d.rectangle([0, .893*W, W, W], fill=(240,235,224))
text(d, (.05, .945), '30 dagers åpent kjøp', .036, (25,20,15), anchor='lm')
button(d, (.72, .912, .965, .978), (92,62,44), W)
text(d, (.8425, .945), 'Kjøp nå', .032, 'white')
im.save(f'{out}/damasker_SP_2_1_NO.png')

# ── damasker_CS: mörk rubrik topp (utan dagslöfte), brun knapp botten ──
im, d, W = load('damasker_CS_2_1')
text(d, (.5, .085), '40 % RABATT', .075, (58,42,26))
text(d, (.5, .165), 'Snart utsolgt – få igjen på lager', .038, (58,42,26))
button(d, (.24, .893, .76, .962), (160,118,66), W)
text(d, (.5, .9275), 'Kjøp før de er utsolgt', .036, 'white')
im.save(f'{out}/damasker_CS_2_1_NO.png')

# ── damasker_G: vit rubrik på foto, vit knapp botten ──
im, d, W = load('damasker_G_2_1')
text(d, (.5, .085), 'Den perfekte gaven til', .052, 'white', stroke=.002, sfill=(70,50,30))
text(d, (.5, .15), 'ham som alltid er ute', .052, 'white', stroke=.002, sfill=(70,50,30))
text(d, (.5, .222), 'Se ansiktet hans når han åpner den', .031, 'white', bold=False, stroke=.0015, sfill=(70,50,30))
button(d, (.30, .895, .70, .958), (252,250,246), W)
text(d, (.5, .9265), 'Gi bort glede i dag', .031, (25,20,15))
im.save(f'{out}/damasker_G_2_1_NO.png')

# ── jattefotboll_PD: svart versalrubrik på vita toppfaden ──
im, d, W = load('jattefotboll_PD_2_1')
text(d, (.5, .075), 'LEI AV SKJERMTID?', .056, (17,17,17))
text(d, (.5, .148), 'DENNE FÅR UNGENE TIL Å LØPE', .053, (17,17,17))
text(d, (.5, .221), 'UT I HAGEN – HVER GANG.', .053, (17,17,17))
im.save(f'{out}/jattefotboll_PD_2_1_NO.png')

# ── jattefotboll_SP: opakt vitt kort nere vänster (täcker rest-pillen) ──
im, d, W = load('jattefotboll_SP_2_1')
d.rounded_rectangle([.045*W, .655*W, .475*W, .958*W], radius=.02*W, fill=(249,249,251))
for i in range(5):
    star(d, (.085 + i*.045)*W, .70*W, .019*W, (18,42,66))
text(d, (.07, .755), '«Ungene har lekt med den', .0265, (20,20,25), anchor='lm')
text(d, (.07, .795), 'hver dag siden den kom –', .0265, (20,20,25), anchor='lm')
text(d, (.07, .835), 'beste kjøpet i sommer!»', .0265, (20,20,25), anchor='lm')
text(d, (.07, .878), '– Verifisert kunde, 34 år', .023, (55,55,60), anchor='lm', bold=False)
text(d, (.07, .922), '30 dagers åpent kjøp', .0225, (20,20,25), anchor='lm')
text(d, (.325, .922), '[KJØP NÅ]', .0225, (18,42,66), anchor='lm')
im.save(f'{out}/jattefotboll_SP_2_1_NO.png')

# ── jattefotboll_CS: opakt vitt toppband (plattans band är genomskinligt), svart versalrad nere ──
im, d, W = load('jattefotboll_CS_2_1')
d.rectangle([0, 0, W, .205*W], fill=(250,250,250))
text(d, (.5, .052), '23 % RABATT', .06, (17,17,17))
text(d, (.5, .118), '389 kr → 299 kr', .045, (17,17,17))
text(d, (.5, .17), 'Bare noen få igjen på lager', .031, (35,35,35))
text(d, (.5, .978), '[BESTILL FØR DEN ER UTSOLGT]', .03, (17,17,17))
im.save(f'{out}/jattefotboll_CS_2_1_NO.png')

# ── jattefotboll_G: mörk rubrik på cremebandet, vit knapp över svarta pillen ──
im, d, W = load('jattefotboll_G_2_1')
text(d, (.5, .055), 'DEN PERFEKTE GAVEN TIL', .048, (25,20,15))
text(d, (.5, .115), 'FOTBALLGALE BARN', .048, (25,20,15))
text(d, (.5, .168), 'Se ansiktene deres lyse opp når de åpner den', .028, (60,55,50), bold=False)
button(d, (.33, .868, .67, .955), (252,250,246), W)
text(d, (.5, .9115), '[GI DEN PERFEKTE GAVEN]', .026, (25,20,15))
im.save(f'{out}/jattefotboll_G_2_1_NO.png')

print('klart:', sorted(os.listdir(out)))
