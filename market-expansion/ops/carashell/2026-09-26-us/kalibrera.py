#!/usr/bin/env python3
"""kalibrera.py — hittar den Liberation Sans-storlek vars bläckbredd matchar den
uppmätta svenska radens bredd. Aldrig en storlek avskriven från en annan batch:
den här bilden är 1080×1350 och har egen mall."""
from PIL import ImageFont, ImageDraw, Image
FET="/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
REG="/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
d=ImageDraw.Draw(Image.new("RGB",(10,10)))
RADER=[
 ("rubrik rad1","Vårt överdrag ligger bara",926,True),
 ("rubrik rad2","på taket, den dyraste",768,True),
 ("underrad r1","Taket är det du aldrig ser, och det som kostar mest att",950,False),
 ("pill","TAKÖVERDRAG, INTE HELTÄCKANDE",440,True),
 ("pris","1 129 kr (ord. 1 469 kr), spara 340 kr (23 %)",620,False),
 ("knapp","Beställ ditt taköverdrag",460,True),
]
for namn,txt,bredd,fet in RADER:
    best=None
    for s in range(14,221):
        f=ImageFont.truetype(FET if fet else REG,s)
        w=d.textlength(txt,font=f)
        diff=abs(w-bredd)
        if best is None or diff<best[1]: best=(s,diff,w)
    print(f"{namn:14s} mätt {bredd:4d} px → storlek {best[0]:3d} (renderad {best[2]:.0f}, diff {best[1]:.0f}) {'FET' if fet else 'normal'}")
