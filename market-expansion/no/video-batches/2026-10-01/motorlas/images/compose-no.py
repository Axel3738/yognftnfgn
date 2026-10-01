# Norsk tekst på Motorlås-bildene. CS på original (toppen fylles radvis), GT/PD/SP på kie-rensade plattor (rester lagas med PIL).
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np, os
S=os.path.dirname(os.path.abspath(__file__))
B='/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'; R='/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf'
F=lambda s,b=True: ImageFont.truetype(B if b else R,s)
os.makedirs(f'{S}/final',exist_ok=True)
def shadowtext(im,xy,s,font,fill,anchor='mm',sh=(0,0,0),blur=6,alpha=170):
    L=Image.new('RGBA',im.size,(0,0,0,0)); d=ImageDraw.Draw(L); d.text((xy[0]+2,xy[1]+3),s,font=font,fill=sh+(alpha,),anchor=anchor)
    L=L.filter(ImageFilter.GaussianBlur(blur)); im.alpha_composite(L); ImageDraw.Draw(im).text(xy,s,font=font,fill=fill,anchor=anchor)
def vfill(im,y0,y1,pad=6):
    a=np.array(im.convert('RGB')).astype(float); top=a[y0-pad:y0-pad+2].mean(0); bot=a[y1+pad-2:y1+pad].mean(0)
    for y in range(y0,y1+1):
        t=(y-y0)/(y1-y0); a[y]=top*(1-t)+bot*t
    return Image.fromarray(a.astype('uint8')).convert(im.mode if im.mode!='RGBA' else 'RGB')

# CS
im=Image.open(f'{S}/src/CS.png').convert('RGB'); im=vfill(im,0,330,pad=0) if False else im
a=np.array(im).astype(float)
for y in range(0,330): a[y]=a[y,8:24].mean(0)
im=Image.fromarray(a.astype('uint8')); d=ImageDraw.Draw(im)
f1=F(124); f2=F(86); w1=d.textlength('1079 kr',font=f1); w2=d.textlength('1409 kr',font=f2); gap=34
x=(1024-(w1+gap+w2))/2
d.text((x,92),'1079 kr',font=f1,fill=(20,84,180),anchor='lm')
x0=x+w1+gap; d.text((x0,96),'1409 kr',font=f2,fill=(214,20,20),anchor='lm'); d.line([x0-4,100,x0+w2+4,100],fill=(214,20,20),width=8)
d.text((512,200),'SPAR 330 KR',font=F(96),fill=(214,20,20),anchor='mm')
d.text((512,282),'30 dagers åpent kjøp',font=F(52,False),fill=(20,20,20),anchor='mm')
im.save(f'{S}/final/motorlas_CS_2_1_NO.png')

# GT
im=Image.open(f'{S}/clean/GT.png').convert('RGB'); im=vfill(im,38,112)
# stray glyph near (355,876): kopiera trä från 45 px under
im.paste(im.crop((335,925,380,965)),(335,860))
im=im.convert('RGBA')
for t,y in [('DEN PERFEKTE GAVEN TIL',68),('HAM SOM ELSKER BÅTEN SIN',130)]:
    ImageDraw.Draw(im).text((512,y),t,font=F(58),fill=(20,16,10),anchor='mm')
shadowtext(im,(512,872),'Se ansiktet hans når han forstår hva det er',F(34,False),'white')
d=ImageDraw.Draw(im); d.rounded_rectangle([316,908,708,984],radius=12,fill=(250,240,220))
d.text((512,946),'Gi bort tryggheten',font=F(36),fill=(30,30,30),anchor='mm')
im.convert('RGB').save(f'{S}/final/motorlas_GT_2_1_NO.png')

# PD
im=Image.open(f'{S}/clean/PD.png').convert('RGBA'); d=ImageDraw.Draw(im)
for t,y in [('LÅS FESTSKRUENE –',100),('STOPP',168),('MOTORTYVERIET',236)]:
    d.text((58,y),t,font=F(64),fill=(10,10,10),anchor='lm')
im.convert('RGB').save(f'{S}/final/motorlas_PD_2_1_NO.png')

# SP
im=Image.open(f'{S}/clean/SP.png').convert('RGB'); im=vfill(im,172,246,pad=4).convert('RGBA'); d=ImageDraw.Draw(im)
for t,y in [('Festskruene går ikke an å skru',80),('løs uten nøkkelen',148)]:
    d.text((512,y),t,font=F(58),fill='white',anchor='mm')
d.text((512,842),'30 dagers åpent kjøp',font=F(46),fill='white',anchor='mm')
d.text((512,923),'Beskytt motoren din',font=F(50),fill=(40,34,20),anchor='mm')
im.convert('RGB').save(f'{S}/final/motorlas_SP_2_1_NO.png')
