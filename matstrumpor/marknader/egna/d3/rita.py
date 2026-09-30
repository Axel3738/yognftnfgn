#!/usr/bin/env python3
"""rita.py — bildannonsen D3 ("Köp 2 – få 2", staplade lådor) på ett nytt språk.

    python3 matstrumpor/marknader/egna/d3/rita.py <texter.json> <ut.jpg>

Samma bild som den svenska MATSTRUMP_sushi_offer_static_d3_v1 (26 köp i Sverige): den textfria
basen bas.png (kie.ai, grenen claude/sushi-strumpor-ad-swipes-y1d0ke, docs/briefs/sushi-bogo-
2026-08-27/D3-staplade-lador.png) och samma layout som originalets build-all.mjs + layout.mjs:
1080×1080, wordmark vit DejaVu Sans Bold max 68 px med baslinjen på y 112, underrubriken
#DCEEFB DejaVu Sans max 36 px på y 178, röd pill #B3261E 800×116 med mitten på y 292 och
vit text max 62 px. Storleken väljs som originalet (snittbredd 0,60 × storlek per tecken) och
krymps dessutom tills den UPPMÄTTA bredden ryms — ett långt ord på finska eller franska får
aldrig gå utanför pillen. Texten ritas som vektor i koden, bildmodellen ritar aldrig text.
"""
import json, os, sys
from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../pipeline'))
import cjk  # japanska/kinesiska: DejaVu saknar tecknen (Japan och Taiwan 2026-09-30)

S = 1080
FET = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
NORMAL = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
AVG = 0.60

def storlek(text, max_bredd, max_size, fontfil, min_size=20):
    """Originalets regel (snittbredd) först, sedan uppmätt bredd som tak. Ett japanskt/kinesiskt
    tecken är ungefär en hel storlek brett, inte 0,60 — det räknas som två tecken."""
    size = max_size
    n = sum(2 if cjk.CJK.match(c) else 1 for c in text)
    while size > min_size and n * size * AVG > max_bredd:
        size -= 1
    while size > min_size and ImageFont.truetype(fontfil, size).getlength(text) > max_bredd:
        size -= 1
    return size

def rad(draw, text, cx, baslinje, max_bredd, max_size, fontfil, fyll):
    fontfil = cjk.font_for(text, fontfil)
    size = storlek(text, max_bredd, max_size, fontfil)
    f = ImageFont.truetype(fontfil, size)
    draw.text((cx, baslinje), text, font=f, fill=fyll, anchor='ms')  # 'ms' = mitten, baslinje (som SVG text-anchor middle)
    return size

def rita(t, ut, bas='bas.png'):
    im = Image.open(bas).convert('RGB').resize((S, S), Image.LANCZOS)
    d = ImageDraw.Draw(im)
    rad(d, t['wordmark'], S / 2, 112, S - 150, 68, FET, '#ffffff')
    rad(d, t['underrubrik'], S / 2, 178, S - 260, 36, NORMAL, '#DCEEFB')
    cx, cy, bredd, hojd = S / 2, 292, 800, 116
    d.rounded_rectangle([cx - bredd / 2, cy - hojd / 2, cx + bredd / 2, cy + hojd / 2], radius=hojd / 2, fill='#B3261E')
    fet = cjk.font_for(t['banner'], FET)
    size = storlek(t['banner'], bredd - 60, 62, fet)
    d.text((cx, cy + size * 0.35), t['banner'], font=ImageFont.truetype(fet, size), fill='#ffffff', anchor='ms')
    im.save(ut, quality=92)
    return ut

if __name__ == '__main__':
    import os
    t = json.load(open(sys.argv[1]))
    bas = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'bas.png')
    print(rita(t, sys.argv[2], bas))
