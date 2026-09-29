# Norsk text på Täljsetets fyra bildannonser. CS ritas på originalet (texten låg på slät
# krämbakgrund, kie krympte produkten), G/PD/SP på kie-rensade plattor.
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os
S=os.path.dirname(os.path.abspath(__file__))
B='/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'; R='/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf'
F=lambda s,b=True: ImageFont.truetype(B if b else R,s)
os.makedirs(f'{S}/final',exist_ok=True)
def shadowtext(im,xy,s,font,fill,anchor='mm',sh=(0,0,0),blur=6,alpha=170):
    L=Image.new('RGBA',im.size,(0,0,0,0)); d=ImageDraw.Draw(L); d.text((xy[0]+2,xy[1]+3),s,font=font,fill=sh+(alpha,),anchor=anchor)
    L=L.filter(ImageFilter.GaussianBlur(blur)); im.alpha_composite(L); ImageDraw.Draw(im).text(xy,s,font=font,fill=fill,anchor=anchor)

# CS — pris
im=Image.open(f'{S}/src/CS.png').convert('RGBA'); d=ImageDraw.Draw(im)
bg=im.getpixel((40,40))
d.rectangle([0,0,1024,262],fill=bg); d.rectangle([0,262,548,440],fill=bg)
d.ellipse([532,262,640,370],fill=bg)
ink=(40,38,36)
d.text((72,92),'SPAR 320 KR PÅ',font=F(86),fill=ink,anchor='lm')
d.text((72,200),'SPIKKESETTET',font=F(86),fill=ink,anchor='lm')
f=F(44,False); d.text((72,318),'1 359 kr',font=f,fill=(120,120,120),anchor='lm'); w=d.textlength('1 359 kr',font=f)
d.line([70,320,72+w+2,320],fill=(120,120,120),width=4)
d.text((72+w+24,318),'1 039 kr',font=F(64),fill=(214,40,40),anchor='lm'); w2=d.textlength('1 039 kr',font=F(64))
cx=72+w+24+w2+58; d.ellipse([cx-44,278,cx+44,366],fill=(214,40,40)); d.text((cx,322),'-24 %',font=F(27),fill='white',anchor='mm')
d.text((72,410),'6 kniver, 6 jern og hansker',font=F(32,False),fill=ink,anchor='lm')
im.convert('RGB').save(f'{S}/final/taljset_CS_2_1_NO.png')

# G — gave
im=Image.open(f'{S}/clean/G.png').convert('RGBA')
shadowtext(im,(512,78),'Den perfekte gaven til',F(62),'white')
shadowtext(im,(512,150),'mannen som har alt.',F(62),'white')
shadowtext(im,(512,212),'Se ansiktet hans når han pakker den opp.',F(32,False),'white')
d=ImageDraw.Draw(im); bw=d.textlength('Finn gaven',font=F(32))+80
d.rounded_rectangle([512-bw/2,250,512+bw/2,314],radius=12,fill=(122,72,52)); d.text((512,282),'Finn gaven',font=F(32),fill='white',anchor='mm')
im.convert('RGB').save(f'{S}/final/taljset_G_2_1_NO.png')

# PD — ett sett
im=Image.open(f'{S}/clean/PD.png').convert('RGBA'); d=ImageDraw.Draw(im)
d.text((512,88),'Slutt å kjøpe spikkeverktøy ett og ett.',font=F(46,False),fill=(15,15,15),anchor='mm')
d.text((512,152),'Få alle 30 i ett sett.',font=F(54),fill=(15,15,15),anchor='mm')
im.convert('RGB').save(f'{S}/final/taljset_PD_2_1_NO.png')

# SP — ingen påhittad kundrecension (originalet hade ett "Verifierad kund"-citat): produktfakta i stället
im=Image.open(f'{S}/clean/SP.png').convert('RGBA')
y=150
for s,f in [('Har du alltid villet',F(48)),('prøve å spikke?',F(48))]: shadowtext(im,(70,y),s,f,'white','lm'); y+=60
y+=20
for s in ['6 kniver, 6 jern, hansker','og en trebit å øve på,','alt i én veske.']: shadowtext(im,(70,y),s,F(36,False),'white','lm'); y+=46
y+=20; shadowtext(im,(70,y),'30 dagers åpent kjøp',F(36),'white','lm')
im.convert('RGB').save(f'{S}/final/taljset_SP_2_1_NO.png')
