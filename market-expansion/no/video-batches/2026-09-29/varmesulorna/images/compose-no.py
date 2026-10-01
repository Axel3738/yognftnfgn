# Norsk text på de rensade plattorna (Fas 3.2), Värmesulorna 2026-09-29.
# Fakta ur beverbutikken.no: 799 kr (før 1039 = 23 %), 3 varmenivåer, fjernkontroll, 30 dagers åpent kjøp.
import os
from PIL import Image, ImageDraw, ImageFont
L='/usr/share/fonts/truetype/liberation/'; W=1024; S=os.path.dirname(os.path.abspath(__file__))
FB=L+'LiberationSans-Bold.ttf'; FR=L+'LiberationSans-Regular.ttf'; SR=L+'LiberationSerif-Regular.ttf'
def txt(d,xy,s,size,fill,maxw=0.9,font=FB,stroke=0,sf=None,anchor='mm'):
    size*=W; f=ImageFont.truetype(font,int(size))
    while d.textlength(s,font=f)>maxw*W and size>10: size-=1; f=ImageFont.truetype(font,int(size))
    d.text((xy[0]*W,xy[1]*W),s,font=f,fill=fill,anchor=anchor,stroke_width=stroke,stroke_fill=sf)
def rr(d,b,c,r=0.03,outline=None): d.rounded_rectangle([x*W for x in b],radius=r*W,fill=c,outline=outline)
def load(f):
    im=Image.open(f'{S}/clean/{f}').convert('RGB'); return im,ImageDraw.Draw(im)
WH=(255,255,255); BL=(25,25,25); DARK=(40,35,30); RED=(190,60,50)
os.makedirs(f'{S}/no',exist_ok=True)
# CS — rabatten är butikens riktiga (1039 → 799 = 23 %)
im,d=load('CS_v1.png')
txt(d,(0.5,0.085),'23 % RABATT',0.105,WH,0.88,stroke=4,sf=(120,0,0))
txt(d,(0.5,0.925),'Nå 799 kr – før 1039 kr',0.050,WH,0.86,stroke=2,sf=(120,0,0))
im.save(f'{S}/no/varmesulorna_CS_2_1_NO.png')
# G
im,d=load('G.png')
txt(d,(0.5,0.075),'Den perfekte julegaven til ham',0.050,DARK,0.88,font=SR)
txt(d,(0.5,0.135),'som alltid fryser på beina',0.050,DARK,0.88,font=SR)
txt(d,(0.5,0.19),'Se ansiktet hans når han skjønner at du løste det.',0.028,DARK,0.85,font=FR)
rr(d,(0.315,0.875,0.685,0.945),(250,248,244),0.02)
txt(d,(0.5,0.910),'GI BORT VARME',0.034,DARK,0.33,font=FR)
im.save(f'{S}/no/varmesulorna_G_2_1_NO.png')
# PD — "3 sekunder" är inte belagt på norska sidan ⇒ fjernkontrollen i stället
im,d=load('PD_fix.png')
txt(d,(0.5,0.075),'KALDE FØTTER ØDELEGGER DAGEN.',0.060,WH,0.92,stroke=3,sf=(40,70,120))
txt(d,(0.5,0.150),'VARME MED ETT TRYKK.',0.060,WH,0.92,stroke=3,sf=(40,70,120))
im.save(f'{S}/no/varmesulorna_PD_2_1_NO.png')
# SP — källans kundcitat ("Verifierad kund, 52 år") och stjärnor är inte belagda ⇒ produktfakta
im,d=load('SP.png')
rr(d,(0.585,0.31,0.955,0.70),(252,250,247),0.02)
txt(d,(0.77,0.37),'Varme føtter',0.040,BL,0.33)
txt(d,(0.77,0.415),'hele dagen',0.040,BL,0.33)
txt(d,(0.77,0.475),'3 varmenivåer',0.030,BL,0.33,font=FR)
txt(d,(0.77,0.515),'Styres med fjernkontroll',0.030,BL,0.33,font=FR)
txt(d,(0.77,0.575),'30 dagers åpent kjøp',0.024,(70,70,70),0.33,font=FR)
rr(d,(0.62,0.61,0.92,0.67),RED,0.008)
txt(d,(0.77,0.640),'BESTILL NÅ',0.030,WH,0.26)
im.save(f'{S}/no/varmesulorna_SP_2_1_NO.png')
print('ok')
