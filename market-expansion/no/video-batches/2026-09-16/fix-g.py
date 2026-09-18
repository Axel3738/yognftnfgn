# Manuell textborttagning för infartslarm_G_2_1 — Kie AI (google/nano-banana-edit)
# lyckades inte ta bort den svenska texten trots två försök (samma bild kom
# tillbaka oförändrad). I stället: hämta en textfri bakgrundsremsa ur bilden
# själv, tona/blurra den och blenda den mjukt över exakt där den svenska
# texten satt, så att INGET av det svenska syns kvar.
import os
from PIL import Image, ImageFilter, ImageDraw

S = os.path.dirname(os.path.abspath(__file__))
im = Image.open(f'{S}/bilder-kalla/G_2_1.png').convert('RGB')
W, H = im.size


def feather_paste(base, patch, top, bottom, feather=40):
    # mask 255 = patchen syns fullt, 0 = originalet syns. Rampar NER mot 0
    # bara i de sista `feather` raderna (övergången mot orört original) —
    # resten av patchen ska stå kvar fullt (255) eftersom det är precis där
    # den svenska texten satt.
    mask = Image.new('L', (W, bottom - top), 255)
    d = ImageDraw.Draw(mask)
    for i in range(feather):
        a = int(255 * (1 - i / feather))
        d.line([(0, bottom - top - feather + i), (W, bottom - top - feather + i)], fill=a)
    base.paste(patch, (0, top), mask)


# Rubrik + underrubrik: text slutar runt y=295. Hämta en textfri remsa en bit
# LÄNGRE NER (y 340-400, gott om marginal under sista textraden) och stretcha
# den uppåt för att täcka hela rubrikzonen (0-360). Blenda bara i den nedre
# delen (330-360), som redan är textfri i originalet, så inget svenskt kan
# synas genom övergången.
strip = im.crop((0, 340, W, 400))
patch = strip.resize((W, 360), Image.LANCZOS)
patch = patch.filter(ImageFilter.GaussianBlur(14))
feather_paste(im, patch, 0, 360, feather=30)

# Knappen: y 800-985, x hela bredden. Hämta bordstexturen strax ovanför
# (y 745-800, ingen text där) och stretcha den ner över knappzonen, blendad
# mjukt i båda ändar.
strip2 = im.crop((0, 745, W, 800))
patch2 = strip2.resize((W, 185), Image.LANCZOS)
patch2 = patch2.filter(ImageFilter.GaussianBlur(3))
mask2 = Image.new('L', (W, 185), 255)
d2 = ImageDraw.Draw(mask2)
feather = 35
for i in range(feather):
    a = int(255 * i / feather)
    d2.line([(0, i), (W, i)], fill=a)
    d2.line([(0, 184 - i), (W, 184 - i)], fill=a)
im.paste(patch2, (0, 800), mask2)

im.save(f'{S}/img-clean/infartslarm_G_2_1.png')
print('sparad img-clean/infartslarm_G_2_1.png', im.size)
