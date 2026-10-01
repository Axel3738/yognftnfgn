# collage.py — före/efter per förslag, en bild per sida (mobil), + publiceringskopior (jpg) för förslagssidan.
#   python3 matstrumpor/ugc-loopar/collage.py   (kräver Pillow; läser output/skarmar/, skriver output/)
from PIL import Image, ImageDraw, ImageFont
import os
G = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'output')
S = os.path.join(G, 'skarmar')
UT = os.path.join(G, 'sida', 'bilder')
os.makedirs(UT, exist_ok=True)
F = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
fstor = ImageFont.truetype(F, 34)
fliten = ImageFont.truetype(F, 26)
ORANGE = (221, 130, 29)

FORSLAG = {
    'start': [('1-hero', '1. Toppbilden'), ('2-band', '2. Loop-bandet'), ('3-berattelse', '3. Berättelsen'), ('4-somdeanvands', '4. Som de används')],
    'produkt': [('5-kopruta', '5. Under köpknappen'), ('6-beskrivning', '6. Beskrivningen'), ('7-morkt-block', '7. Mörka blocket')],
}

# Publiceringskopior: mobil 780 bred (2x), dator 1440 bred
for f in sorted(os.listdir(S)):
    if not f.endswith('.png') or 'hela' in f:
        continue
    im = Image.open(os.path.join(S, f)).convert('RGB')
    if im.size[0] > 1500:
        im = im.resize((1440, im.size[1] * 1440 // im.size[0]), Image.LANCZOS)
    im.save(os.path.join(UT, f.replace('.png', '.jpg')), quality=80, optimize=True)

# Collage per sida: varje förslag = en rad med NU | FÖRSLAG (mobil, 390 px per kolumn)
for sida, lista in FORSLAG.items():
    rader = []
    for nyckel, rubrik in lista:
        a = Image.open(os.path.join(S, f'{nyckel}-fore-390.png')).convert('RGB')
        b = Image.open(os.path.join(S, f'{nyckel}-efter-390.png')).convert('RGB')
        W = 520
        a = a.resize((W, a.size[1] * W // a.size[0]), Image.LANCZOS)
        b = b.resize((W, b.size[1] * W // b.size[0]), Image.LANCZOS)
        h = max(a.size[1], b.size[1])
        rad = Image.new('RGB', (W * 2 + 60, h + 130), (250, 246, 240))
        d = ImageDraw.Draw(rad)
        d.text((20, 18), rubrik, font=fstor, fill=(18, 18, 18))
        d.text((20, 70), {'2-band': 'NU (inget band i dag)', '7-morkt-block': 'NU (blocket finns inte)'}.get(nyckel, 'NU'), font=fliten, fill=(110, 100, 90))
        d.text((W + 40, 70), 'FÖRSLAG (rör sig på sajten)', font=fliten, fill=ORANGE)
        rad.paste(a, (20, 110))
        rad.paste(b, (W + 40, 110))
        d.rectangle([W + 38, 108, W + 40 + W + 1, 110 + b.size[1] + 1], outline=ORANGE, width=3)
        rader.append(rad)
    H = sum(r.size[1] for r in rader)
    ut = Image.new('RGB', (rader[0].size[0], H), (250, 246, 240))
    y = 0
    for r in rader:
        ut.paste(r, (0, y))
        y += r.size[1]
    namn = {'start': 'forslag-startsidan.jpg', 'produkt': 'forslag-produktsidan.jpg'}[sida]
    ut.save(os.path.join(G, namn), quality=82, optimize=True)
    print(namn, ut.size)
