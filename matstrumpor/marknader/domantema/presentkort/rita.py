#!/usr/bin/env python3
"""rita.py — presentkortets bild på ett annat språk än svenska.

    python3 matstrumpor/marknader/domantema/presentkort/rita.py [ut-mapp]

Den svenska bilden (BlackRedBowPremiumGiftCertificate_3.png) säger PRESENTKORT / MATSTRUMPOR.SE /
150 KR / GILTIG I 3 MÅNADER — svenska ord och svenska kronor, i "Alle produkter" på varje
språk. bas.png är samma bild med texten borttagen (pipeline/logga.py fyll_lodratt: papperet fylls
lodrätt mellan raden ovanför och under texten, med papperets brus). Här ritas ordet för
presentkort (butikens egen översättning av produktnamnet, output/underlag-<locale>.json →
produkt.presentkort.title), MATSTRUMPOR utan .SE och giltighetsraden. Beloppet ritas INTE: kortet
säljs i kundens valuta och priset står bredvid bilden. Temat byter bild per språk
(domantema.mjs → presentkort-<locale>.png).
"""
import json, os, sys
from PIL import Image, ImageDraw, ImageFont

HAR = os.path.dirname(os.path.abspath(__file__))
UNDERLAG = os.path.join(HAR, '..', '..', 'output')
FET = '/home/user/yognftnfgn/pipeline/fonts/Poppins-Bold.ttf'
HALV = '/home/user/yognftnfgn/pipeline/fonts/Poppins-SemiBold.ttf'
GILTIG = json.load(open(os.path.join(HAR, 'giltighet.json')))

def spärrad(d, text, cx, topp, fontfil, storlek, sparr_em, max_bredd, fyll='#ffffff'):
    """Versaler med luft mellan bokstäverna (som originalet), centrerat; krymper tills raden ryms."""
    while True:
        f = ImageFont.truetype(fontfil, storlek)
        sparr = storlek * sparr_em
        bredder = [f.getlength(c) for c in text]
        total = sum(bredder) + sparr * (len(text) - 1)
        if total <= max_bredd or storlek < 20: break
        storlek -= 2
    x = cx - total / 2
    for c, b in zip(text, bredder):
        d.text((x, topp), c, font=f, fill=fyll, anchor='ls')
        x += b + sparr
    return storlek

def rita(locale, ut):
    u = json.load(open(os.path.join(UNDERLAG, f'underlag-{locale}.json')))
    ord_ = u['produkt.presentkort.title'].upper()
    im = Image.open(os.path.join(HAR, 'bas.png')).convert('RGB')
    d = ImageDraw.Draw(im)
    W = im.width
    spärrad(d, ord_, W / 2, 148, FET, 118, 0.42, 1500)            # baslinje som PRESENTKORT (y 62–148)
    spärrad(d, 'MATSTRUMPOR', W / 2, 232, FET, 60, 0.50, 1100)     # som MATSTRUMPOR.SE (y 190–232), utan .SE
    spärrad(d, GILTIG[locale], W / 2, 1122, HALV, 50, 0.14, 1300)  # där beloppet stod
    im.save(ut, optimize=True)
    return ord_

if __name__ == '__main__':
    mapp = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HAR, 'ut')
    os.makedirs(mapp, exist_ok=True)
    for loc in GILTIG:
        if loc.startswith('_'): continue
        print(loc, rita(loc, os.path.join(mapp, f'presentkort-{loc}.png')), '|', GILTIG[loc])
