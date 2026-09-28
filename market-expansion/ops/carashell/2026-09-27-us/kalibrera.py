#!/usr/bin/env python3
"""kalibrera.py — Liberation Sans-storleken vars bläckbredd matchar den uppmätta
svenska raden. Per bild, aldrig avskriven från en annan batch."""
from PIL import ImageFont, ImageDraw, Image
FET="/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
REG="/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
d=ImageDraw.Draw(Image.new("RGB",(10,10)))
BILDER={
 "OB_108_1":[
  ("rubrik r1","Remmen hakar i en krok,",912,True),
  ("rubrik r2","inte i en knut du hoppas",888,True),
  ("underrad r1","Remmar på alla fyra sidor, 2,5 m och justerbara,",846,False),
  ("etikett FET","2 extra spännremmar (10,5 m) ingår",471,True),
  ("etikett norm","2 extra spännremmar (10,5 m) ingår",471,False),
  ("pris","1 129 kr (ord. 1 469 kr), spara 340 kr (23 %)",619,False),
  ("knapp","Beställ ditt taköverdrag",460,True)],
 "OB_110_1":[
  ("rubrik r1","Regnet rinner av vävens",892,True),
  ("rubrik r2","yta i stället för att bli",752,True),
  ("underrad r1","Silverbelagd 210D-oxfordväv, inte en tunn",737,False),
  ("etikett FET","Silverbelagd väv möter solen, inte taket.",455,True),
  ("pris","1 129 kr (ord. 1 469 kr), spara 340 kr (23 %)",619,False),
  ("knapp","Beställ ditt taköverdrag",460,True)],
}
for bild,rader in BILDER.items():
    print("===",bild,"===")
    for namn,txt,bredd,fet in rader:
        best=None
        for s in range(14,221):
            f=ImageFont.truetype(FET if fet else REG,s)
            w=d.textlength(txt,font=f); diff=abs(w-bredd)
            if best is None or diff<best[1]: best=(s,diff,w)
        print(f"  {namn:14s} mätt {bredd:4d} → storlek {best[0]:3d} (renderad {best[2]:.0f}, diff {best[1]:.0f}) {'FET' if fet else 'normal'}")
