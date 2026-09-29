# Norsk text på de fyra rensade bildannonsplattorna (Fas 3.2), Maskinhyllan 2026-09-29.
# Fakta ur beverbutikken.no: 1139 kr (før 1489 = 23 % rabatt), fri frakt over 300 kr, 30 dagers åpent kjøp.
import os
from PIL import Image, ImageDraw, ImageFont
B='/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'; R='/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf'
S=os.path.dirname(os.path.dirname(os.path.abspath(__file__))); W=1024
def F(s,b=True): return ImageFont.truetype(B if b else R,int(s))
def txt(d,xy,s,size,fill,maxw=0.9,anchor='mm',bold=True,stroke=0,sf=None):
    size*=W; f=F(size,bold)
    while d.textlength(s,font=f)>maxw*W and size>10: size-=1; f=F(size,bold)
    d.text((xy[0]*W,xy[1]*W),s,font=f,fill=fill,anchor=anchor,stroke_width=stroke,stroke_fill=sf)
def rr(d,b,c,r=0.03): d.rounded_rectangle([x*W for x in b],radius=r*W,fill=c)
def load(k):
    im=Image.open(f'{S}/images/clean/{k}.png').convert('RGB'); return im,ImageDraw.Draw(im)
WHITE=(255,255,255); BLACK=(15,15,15); RED=(200,30,35); NAVY=(28,52,104); YEL=(250,200,20)
# CS
im,d=load('CS')
rr(d,(0.02,0.02,0.20,0.085),RED,0.015); txt(d,(0.11,0.053),'TILBUD',0.036,WHITE,0.16)
txt(d,(0.60,0.075),'23 % RABATT – I DAG',0.066,BLACK,0.74,stroke=3,sf=WHITE)
txt(d,(0.60,0.155),'Fri frakt · 30 dagers åpent kjøp',0.040,BLACK,0.74,stroke=2,sf=WHITE)
rr(d,(0.22,0.895,0.78,0.960),RED,0.03); txt(d,(0.50,0.928),'Bestill før tilbudet er over',0.034,WHITE,0.52)
im.save(f'{S}/images/no/maskinhyllan_CS_2_1_NO.png')
# GT
im,d=load('GT')
txt(d,(0.50,0.08),'Den perfekte gaven til ham',0.050,WHITE,0.92,stroke=3,sf=BLACK)
txt(d,(0.50,0.145),'Se ansiktet hans når han åpner den',0.046,WHITE,0.92,stroke=3,sf=BLACK)
rr(d,(0.25,0.890,0.76,0.955),RED,0.032); txt(d,(0.505,0.9225),'Gi bort glede – bestill i dag',0.032,WHITE,0.47)
im.save(f'{S}/images/no/maskinhyllan_GT_2_1_NO.png')
# PD
im,d=load('PD')
txt(d,(0.50,0.105),'Rotete garasje? Fire verktøy,',0.056,NAVY,0.90)
txt(d,(0.50,0.175),'én hylle – endelig orden.',0.056,NAVY,0.90)
im.save(f'{S}/images/no/maskinhyllan_PD_2_1_NO.png')
# SP
im,d=load('SP')
txt(d,(0.50,0.745),'Endelig orden i garasjen.',0.052,WHITE,0.90,stroke=3,sf=BLACK)
txt(d,(0.50,0.815),'Fire maskiner på veggen – benken ledig igjen.',0.034,WHITE,0.90,stroke=2,sf=BLACK)
txt(d,(0.50,0.865),'30 dagers åpent kjøp – handle trygt',0.030,WHITE,0.90,stroke=2,sf=BLACK)
rr(d,(0.36,0.905,0.64,0.965),YEL,0.012); txt(d,(0.50,0.935),'Bestill nå',0.036,BLACK,0.25)
im.save(f'{S}/images/no/maskinhyllan_SP_2_1_NO.png')
print('ok')
