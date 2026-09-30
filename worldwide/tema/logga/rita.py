"""rita.py — loggan "BEAVER STORE" för worldwide, byggd ur Bäverbutikens egen logga.

Bävern med sladden, den svenska flaggan och det guldiga strecket klipps ur originalet
(Namnlos_design_44.png, 1920 × 1080, transparent). Bara ordet byts: "BÄVERBUTIKEN"
blir "BEAVER STORE" i Anton (OFL, google/fonts), vitt som originalet, lika brett och
lika högt. Samma arkformat och samma inramning som originalet, så temats
logobredd (270 px desktop, 170 px mobil) ger samma storlek i sidhuvudet.

    python3 worldwide/tema/logga/rita.py <original.png> <ut.png> [--text "BEAVER STORE"] [--mork]

--mork ritar ordet i mörkgrått (för ljus bakgrund, t.ex. kassan).
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

HAR = Path(__file__).resolve().parent
args = sys.argv[1:]
kalla, ut = args[0], args[1]
text = args[args.index('--text') + 1] if '--text' in args else 'BEAVER STORE'
mork = '--mork' in args

org = Image.open(kalla).convert('RGBA')
W, H = org.size
bild = Image.new('RGBA', (W, H), (0, 0, 0, 0))

# Bävern (vänster) och flaggan (höger uppe) klipps ut som de är.
baver = (80, 330, 640, 750)
flagga = (1660, 340, 1830, 455)
bild.alpha_composite(org.crop(baver), (baver[0], baver[1]))

# Ordet: samma höjd som originalets versaler (y 462–638) och bredd till flaggans högerkant.
x0, y0, x1, y1 = 655, 462, 1826, 638
font_fil = str(HAR / 'Anton-Regular.ttf')
storlek = 300
while True:
    f = ImageFont.truetype(font_fil, storlek)
    bb = f.getbbox(text)
    if bb[3] - bb[1] <= (y1 - y0) or storlek < 40:
        break
    storlek -= 2
f = ImageFont.truetype(font_fil, storlek)
bb = f.getbbox(text)
tw, th = bb[2] - bb[0], bb[3] - bb[1]
# Sträck i sidled till originalets bredd (Anton är smalare än originalets typsnitt).
lager = Image.new('RGBA', (tw + 4, th + 4), (0, 0, 0, 0))
d = ImageDraw.Draw(lager)
farg = (38, 38, 38, 255) if mork else (255, 255, 255, 255)
d.text((-bb[0] + 2, -bb[1] + 2), text, font=f, fill=farg)
malbredd = x1 - x0
lager = lager.resize((malbredd, th + 4), Image.LANCZOS)
bild.alpha_composite(lager, (x0, y0 - 2))

# Flaggan över ordet, som i originalet (klistras efter ordet så den ligger överst).
bild.alpha_composite(org.crop(flagga), (flagga[0], flagga[1]))

# Guldstrecket under ordets vänstra del, samma som originalet.
streck = (655, 660, 1158, 687)
bild.alpha_composite(org.crop(streck), (streck[0], streck[1]))

bild.save(ut)
print(f'{ut}: {W}×{H}, "{text}", Anton {storlek} px, bredd {malbredd} px')
