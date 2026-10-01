# Norsk text på de fyra rensade bildannonsplattorna (Fas 3.2), Rullknivslipen 2026-09-29.
# Fakta ur beverbutikken.no: 519 kr (før 679 = 23 % rabatt), fri frakt over 300 kr, 30 dagers åpent kjøp,
# magnetisk blokk merket 20°, rull med to diamantskiver, svart eske.
import os
from PIL import Image, ImageDraw, ImageFont
B='/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'; R='/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf'
S=os.path.dirname(os.path.dirname(os.path.abspath(__file__))); W=1024
def F(s,b=True): return ImageFont.truetype(B if b else R,int(s))
def txt(d,xy,s,size,fill,maxw=0.9,anchor='mm',bold=True,stroke=0,sf=None):
    size*=W; f=F(size,bold)
    while d.textlength(s,font=f)>maxw*W and size>10: size-=1; f=F(size,bold)
    d.text((xy[0]*W,xy[1]*W),s,font=f,fill=fill,anchor=anchor,stroke_width=stroke,stroke_fill=sf)
    return d.textlength(s,font=f)/W
def rr(d,b,c,r=0.03): d.rounded_rectangle([x*W for x in b],radius=r*W,fill=c)
def load(k):
    im=Image.open(f'{S}/images/clean/{k}.png').convert('RGB').resize((W,W)); return im,ImageDraw.Draw(im)
WHITE=(255,255,255); BLACK=(15,15,15); RED=(226,60,30); GREY=(110,110,110); BROWN=(139,69,40); DARK=(60,55,50); CREAM=(250,243,225)
# CS
im,d=load('CS')
txt(d,(0.50,0.08),'23 % RABATT',0.080,RED,0.9)
txt(d,(0.33,0.155),'519 kr',0.060,BLACK,0.3)
wid=txt(d,(0.62,0.155),'før 679 kr',0.046,GREY,0.4)
d.line([((0.62-wid/2+0.07)*W,0.157*W),((0.62+wid/2)*W,0.157*W)],fill=GREY,width=4)
rr(d,(0.18,0.885,0.82,0.955),CREAM,0.01); txt(d,(0.50,0.92),'Fri frakt · 30 dagers åpent kjøp',0.040,BLACK,0.60)
im.save(f'{S}/images/no/rullknivslipen_CS_2_1_NO.png')
# GT
im,d=load('GT')
txt(d,(0.50,0.07),'Den perfekte gaven',0.066,DARK,0.9,bold=False)
txt(d,(0.50,0.135),'til ham',0.066,DARK,0.9,bold=False)
txt(d,(0.50,0.80),'Se ansiktet hans når han åpner den',0.040,WHITE,0.9,bold=False,stroke=2,sf=(90,70,50))
rr(d,(0.25,0.875,0.75,0.945),(248,242,235),0.035); txt(d,(0.50,0.91),'GI EN GAVE HAN BRUKER',0.034,DARK,0.46)
im.save(f'{S}/images/no/rullknivslipen_GT_2_1_NO.png')
# PD
im,d=load('PD')
txt(d,(0.50,0.09),'SLUTT Å GJETTE VINKELEN –',0.058,DARK,0.9)
txt(d,(0.50,0.155),'FÅ SKARP KNIV',0.058,DARK,0.9)
txt(d,(0.50,0.22),'HVER GANG',0.058,DARK,0.9)
im.save(f'{S}/images/no/rullknivslipen_PD_2_1_NO.png')
# SP
im,d=load('SP')
txt(d,(0.72,0.30),'Vinkelen er allerede satt:',0.036,BLACK,0.44)
txt(d,(0.72,0.345),'magnetisk blokk merket 20°',0.030,BLACK,0.44,bold=False)
txt(d,(0.72,0.385),'og to diamantskiver på rullen.',0.030,BLACK,0.44,bold=False)
txt(d,(0.72,0.44),'30 dagers åpent kjøp',0.030,BLACK,0.44)
rr(d,(0.80,0.92,0.96,0.97),BROWN,0.006); txt(d,(0.88,0.945),'KJØP NÅ',0.032,WHITE,0.14)
im.save(f'{S}/images/no/rullknivslipen_SP_2_1_NO.png')
print('ok')
