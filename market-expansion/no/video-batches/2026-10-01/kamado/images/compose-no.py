# Norsk tekst på Kamadotrekkets fire bildannonser (kie-rensade plattor + PIL). Bara belagda fakta (629/819 kr, 600D, remmar, 30 dagers åpent kjøp).
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os
S=os.path.dirname(os.path.abspath(__file__))
B='/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'; R='/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf'
F=lambda s,b=True: ImageFont.truetype(B if b else R,s)
os.makedirs(f'{S}/final',exist_ok=True)
def shadowtext(im,xy,s,font,fill,anchor='mm',blur=6,alpha=190):
    L=Image.new('RGBA',im.size,(0,0,0,0)); d=ImageDraw.Draw(L); d.text((xy[0]+2,xy[1]+3),s,font=font,fill=(0,0,0,alpha),anchor=anchor)
    L=L.filter(ImageFilter.GaussianBlur(blur)); im.alpha_composite(L); ImageDraw.Draw(im).text(xy,s,font=font,fill=fill,anchor=anchor)
DARK=(20,20,20); RED=(200,24,24)
# CS (C1) — rabatt
im=Image.open(f'{S}/clean/CS.png').convert('RGB'); d=ImageDraw.Draw(im)
d.text((512,62),'190 KR RABATT',font=F(84),fill=DARK,anchor='mm')
d.text((512,150),'NÅ 629 KR',font=F(104),fill=DARK,anchor='mm')
t='FØR 819 KR'; f=F(60); w=d.textlength(t,font=f); d.text((512,238),t,font=f,fill=(90,90,90),anchor='mm'); d.line([512-w/2-6,240,512+w/2+6,240],fill=RED,width=7)
d.text((512,306),'30 DAGERS ÅPENT KJØP',font=F(42),fill=DARK,anchor='mm')
im.save(f'{S}/final/kamado_C1_2_1_NO.png')
# G — gave
im=Image.open(f'{S}/clean/G.png').convert('RGBA')
shadowtext(im,(512,92),'DEN PERFEKTE GAVEN',F(70),'white'); shadowtext(im,(512,170),'TIL GRILLELSKEREN',F(70),'white')
shadowtext(im,(512,232),'Kamadotrekk med oppbevaringspose',F(34,False),'white')
d=ImageDraw.Draw(im); d.rounded_rectangle([250,910,774,982],radius=14,fill='white'); d.text((512,946),'GI BORT ET KAMADOTREKK',font=F(31),fill=DARK,anchor='mm')
im.convert('RGB').save(f'{S}/final/kamado_G_2_1_NO.png')
# PD — regn
im=Image.open(f'{S}/clean/PD.png').convert('RGBA'); d=ImageDraw.Draw(im)
for i,t in enumerate(['BESKYTT','KAMADOEN','MOT REGN']): d.text((40,110+i*64),t,font=F(60),fill=DARK,anchor='lm')
for i,t in enumerate(['Regnet holdes unna','lokket og ventilen.']): d.text((40,340+i*40),t,font=F(32,False),fill=DARK,anchor='lm')
im.convert('RGB').save(f'{S}/final/kamado_PD_2_1_NO.png')
# SP — fakta på panelen
im=Image.open(f'{S}/clean/SP.png').convert('RGB'); d=ImageDraw.Draw(im); pc=im.getpixel((300,300))
d.rectangle([60,870,310,970],fill=pc)
y=140
for t in ['Har du en kamado','som står ute?']: d.text((50,y),t,font=F(50),fill=DARK,anchor='lm'); y+=64
y=360
for t in ['Fire spennremmer og snøring','holder trekket på plass i vind.','','Oppbevaringspose følger med.','','Sort 600D-stoff, 80 × 102 cm.']:
    d.text((50,y),t,font=F(31,False),fill=DARK,anchor='lm'); y+=44
d.rounded_rectangle([71,883,331,958],radius=12,fill=(30,30,30)); d.text((201,921),'BESTILL NÅ',font=F(30),fill='white',anchor='mm')
d.text((50,1000),'30 dagers åpent kjøp',font=F(28),fill=(60,60,60),anchor='lm')
im.save(f'{S}/final/kamado_SP_2_1_NO.png')
