# Ritar norsk text på de textrensade annonsplattorna (deterministisk PIL-komposition).
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

def load(name):
    im = Image.open(f'{S}/img-clean/{name}.png').convert('RGB')
    return im, ImageDraw.Draw(im), im.size[0]

out = f'{S}/img-no-final'; os.makedirs(out, exist_ok=True)

# ── kran_CS: grå bakgrund, svart fet text topp+botten ──
im, d, W = load('kran_CS')
text(d, (.5, .085), '23 % RABATT – I DAG!', .066, (17,17,17))
text(d, (.5, .915), 'LAGERET TAR SLUTT – BESTILL NÅ', .052, (17,17,17))
im.save(f'{out}/kranskydd_CS_2_1_NO.png')

# ── kran_PD: vit rubrik + underrubrik på foto ──
im, d, W = load('kran_PD')
text(d, (.5, .088), 'FROSSEN KRAN = SPRUKKET KRAN.', .0535, 'white', stroke=.002, sfill=(30,30,30))
text(d, (.5, .155), 'BESKYTT DEN FØR DET ER FOR SENT.', .034, 'white', stroke=.0015, sfill=(30,30,30))
im.save(f'{out}/kranskydd_PD_2_1_NO.png')

# ── kran_SP: täck svenska rester, rita citat + rader + knapp ──
im, d, W = load('kran_SP')
sky = im.getpixel((int(.15*W), int(.185*W)))
d.rectangle([.18*W, .155*W, .82*W, .215*W], fill=sky)          # bort med "– Verifierad kund"
d.rectangle([.05*W, .815*W, .95*W, .875*W], fill=(255,255,255)) # bort med "30 dagars öppet köp"
btn = im.getpixel((int(.34*W), int(.91*W)))
button(d, (.315, .878, .685, .947), btn, W)                     # måla om knappen (pilen ryker)
text(d, (.5, .068), '“Jeg slapp en sprukket kran i vinter takket være', .031, (17,17,17))
text(d, (.5, .112), 'denne. Sitter perfekt og føles veldig solid!”', .031, (17,17,17))
text(d, (.5, .185), '– Verifisert kunde, 58 år', .026, (40,40,40), bold=False)
text(d, (.5, .845), '30 dagers åpent kjøp – full refusjon', .031, (17,17,17))
text(d, (.5, .9125), 'Beskytt kranen din  →', .030, 'white')
im.save(f'{out}/kranskydd_SP_2_1_NO.png')

# ── kran_GT: vit rubrik/underrubrik, röd knapp ──
im, d, W = load('kran_GT')
text(d, (.5, .085), 'Den perfekte julegaven til', .047, 'white', stroke=.002, sfill=(60,40,20))
text(d, (.5, .142), 'ham som fikser alt hjemme', .047, 'white', stroke=.002, sfill=(60,40,20))
text(d, (.5, .215), 'Se ansiktet hans når han skjønner at du', .029, 'white', bold=False, stroke=.0015, sfill=(60,40,20))
text(d, (.5, .256), 'tenkte på det ingen andre gjorde', .029, 'white', bold=False, stroke=.0015, sfill=(60,40,20))
button(d, (.315, .878, .685, .947), (196,60,54), W)
text(d, (.5, .9125), 'Gi gaven  →', .032, 'white')
im.save(f'{out}/kranskydd_GT_2_1_NO.png')

# ── ibc_CS: vit panel till höger blir textkort ──
im, d, W = load('ibc_CS')
cx = .845
text(d, (cx, .265), '25 %', .085, (17,17,17))
text(d, (cx, .345), 'RABATT', .054, (17,17,17))
text(d, (cx, .415), '– I DAG', .054, (17,17,17))
text(d, (cx, .545), '439 kr', .058, (190,30,30))
text(d, (cx, .625), '586 kr', .046, (190,30,30))
w = d.textlength('586 kr', font=F(.046*W)); d.line([cx*W-w/2-6, .625*W, cx*W+w/2+6, .625*W], fill=(190,30,30), width=max(3,int(.005*W)))
text(d, (cx, .715), 'KUN FÅ IGJEN', .027, (190,30,30))
text(d, (cx, .752), 'PÅ LAGER', .027, (190,30,30))
button(d, (.735, .80, .955, .868), (38,140,70), W)
text(d, (cx, .834), 'HANDLE NÅ', .030, 'white')
im.save(f'{out}/ibc_CS_2_1_NO.png')

# ── ibc_PD: vit rubrik vänster ──
im, d, W = load('ibc_PD')
text(d, (.07, .105), 'ALGER I TANKEN?', .062, 'white', anchor='lm', stroke=.002, sfill=(30,50,30))
text(d, (.07, .195), 'IKKE NÅ LENGER.', .062, 'white', anchor='lm', stroke=.002, sfill=(30,50,30))
im.save(f'{out}/ibc_PD_2_1_NO.png')

# ── ibc_SP: citat i pratbubblan, rader + knapp under ──
im, d, W = load('ibc_SP')
bx = .8525
text(d, (bx, .112), '“Endelig klart vann i', .0225, (17,17,17))
text(d, (bx, .145), 'tanken — ingen alger', .0225, (17,17,17))
text(d, (bx, .178), 'hele sommeren!”', .0225, (17,17,17))
text(d, (bx, .272), '– Verifisert kunde, 52 år', .022, 'white', bold=False, stroke=.0015, sfill=(40,60,40))
text(d, (bx, .315), '✓ 30 dagers åpent kjøp', .022, 'white', stroke=.0015, sfill=(40,60,40))
button(d, (.75, .345, .955, .402), (38,140,70), W)
text(d, (bx, .3735), 'BESTILL NÅ', .026, 'white')
im.save(f'{out}/ibc_SP_2_1_NO.png')

# ── ibc_GT: vit rubrik vänster + grön knapp ──
im, d, W = load('ibc_GT')
text(d, (.06, .072), 'DEN PERFEKTE', .044, 'white', anchor='lm', stroke=.002, sfill=(40,60,30))
text(d, (.06, .128), 'GAVEN TIL', .044, 'white', anchor='lm', stroke=.002, sfill=(40,60,30))
text(d, (.06, .184), 'HAGEENTUSIASTEN', .044, 'white', anchor='lm', stroke=.002, sfill=(40,60,30))
text(d, (.06, .243), 'Se gleden når tanken endelig', .029, 'white', anchor='lm', bold=False, stroke=.0015, sfill=(40,60,30))
text(d, (.06, .283), 'er beskyttet', .029, 'white', anchor='lm', bold=False, stroke=.0015, sfill=(40,60,30))
button(d, (.06, .318, .47, .368), (38,140,70), W)
text(d, (.265, .343), 'GI BORT DENNE GAVEN', .0215, 'white')
im.save(f'{out}/ibc_GT_2_1_NO.png')

print('klart:', sorted(os.listdir(out)))
