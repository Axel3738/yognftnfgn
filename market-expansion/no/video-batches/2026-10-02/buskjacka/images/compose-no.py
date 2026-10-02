# Norsk tekst på Buskjakkens tre bildannonser (kie-rensade plattor + PIL). Bara belagda fakta (379/499 kr, 2-pk 120 × 180 cm, vind og kulde, glidelås, 30 dagers åpent kjøp).
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os
S=os.path.dirname(os.path.abspath(__file__))
B='/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'; R='/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf'
F=lambda s,b=True: ImageFont.truetype(B if b else R,s)
os.makedirs(f'{S}/final',exist_ok=True)
DARK=(20,20,20); RED=(200,24,24)
# CS (C1) — rabatt
im=Image.open(f'{S}/clean/CS.png').convert('RGB'); d=ImageDraw.Draw(im)
d.rectangle([0,0,1024,318],fill=(245,245,245))
d.text((512,62),'24 % RABATT',font=F(84),fill=DARK,anchor='mm')
d.text((512,150),'NÅ 379 KR',font=F(104),fill=DARK,anchor='mm')
t='FØR 499 KR'; f=F(60); w=d.textlength(t,font=f); d.text((512,238),t,font=f,fill=(90,90,90),anchor='mm'); d.line([512-w/2-6,240,512+w/2+6,240],fill=RED,width=7)
d.text((512,296),'2 JAKKER I PAKKEN – 30 DAGERS ÅPENT KJØP',font=F(36),fill=DARK,anchor='mm')
im.save(f'{S}/final/buskjakke_CS_2_1_NO.png')
# G — gave
im=Image.open(f'{S}/clean/G.png').convert('RGBA')
d=ImageDraw.Draw(im)
for i,t in enumerate(['DEN PERFEKTE GAVEN','TIL DEN SOM ELSKER','HAGEN SIN']): d.text((512,84+i*76),t,font=F(64),fill=(70,34,20),anchor='mm')
d.text((512,330),'Å, hvordan visste du det?',font=F(44,False),fill=(70,34,20),anchor='mm')
im.convert('RGB').save(f'{S}/final/buskjakke_G_2_1_NO.png')
# PD — demo
im=Image.open(f'{S}/clean/PD.png').convert('RGB'); d=ImageDraw.Draw(im)
pc=im.getpixel((500,300)); d.rectangle([0,0,1024,440],fill=pc)
for i,t in enumerate(['SKJERM BUSKENE','MOT VIND OG KULDE']): d.text((512,120+i*88),t,font=F(76),fill=(30,45,55),anchor='mm')
d.text((512,340),'Buskjakke 2-pk · 120 × 180 cm',font=F(46,False),fill=(30,45,55),anchor='mm')
im.save(f'{S}/final/buskjakke_PD_2_1_NO.png')
