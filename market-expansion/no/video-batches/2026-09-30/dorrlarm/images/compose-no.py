# Norsk tekst på Dør- og Vindusalarmens fire bildannonser. CS ritas på originalet (slät bakgrund),
# G/SP på kie-rensade plattor, PD = original med bara rubrikremsan från kie-plattan (kie tog bort fjärrkontrollens knappar).
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os
S=os.path.dirname(os.path.abspath(__file__))
B='/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'; R='/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf'
F=lambda s,b=True: ImageFont.truetype(B if b else R,s)
os.makedirs(f'{S}/final',exist_ok=True)
def shadowtext(im,xy,s,font,fill,anchor='mm',sh=(0,0,0),blur=6,alpha=170):
    L=Image.new('RGBA',im.size,(0,0,0,0)); d=ImageDraw.Draw(L); d.text((xy[0]+2,xy[1]+3),s,font=font,fill=sh+(alpha,),anchor=anchor)
    L=L.filter(ImageFilter.GaussianBlur(blur)); im.alpha_composite(L); ImageDraw.Draw(im).text(xy,s,font=font,fill=fill,anchor=anchor)

# CS — pris (ingen "idag"/"få kvar i lager": inte belagt)
im=Image.open(f'{S}/src/CS.png').convert('RGB'); d=ImageDraw.Draw(im)
bg=im.getpixel((40,40)); d.rectangle([0,0,1024,268],fill=bg)
f1=F(120); f2=F(84); w1=d.textlength('389 kr',font=f1); w2=d.textlength('509 kr',font=f2); gap=30
x=(1024-(w1+gap+w2))/2
d.text((x,98),'389 kr',font=f1,fill=(20,84,180),anchor='lm')
x0=x+w1+gap; d.text((x0,100),'509 kr',font=f2,fill=(214,20,20),anchor='lm'); d.line([x0-4,104,x0+w2+4,104],fill=(214,20,20),width=8)
d.text((512,208),'-24 % RABATT',font=F(88),fill=(214,20,20),anchor='mm')
red=im.getpixel((60,960)); d.rectangle([44,934,980,1006],fill=red)
d.text((512,970),'30 DAGERS ÅPENT KJØP',font=F(56),fill='white',anchor='mm')
im.save(f'{S}/final/dorrlarm_CS_2_1_NO.png')

# G — gave
im=Image.open(f'{S}/clean/G.png').convert('RGBA')
shadowtext(im,(512,100),'DEN PERFEKTE GAVEN',F(70),'white')
shadowtext(im,(512,178),'TIL HAM',F(70),'white')
shadowtext(im,(512,232),'En liten alarm som sier: jeg vil at du skal være trygg.',F(32,False),'white')
d=ImageDraw.Draw(im); d.rounded_rectangle([312,276,712,348],radius=12,fill=(46,140,84))
d.text((512,312),'Bestill som gave',font=F(34),fill='white',anchor='mm')
im.convert('RGB').save(f'{S}/final/dorrlarm_G_2_1_NO.png')

# PD — original, rubrikremsan fra kie-platen
src=Image.open(f'{S}/src/PD.png').convert('RGB'); cl=Image.open(f'{S}/clean/PD.png').convert('RGB').resize(src.size)
Y=240; m=Image.new('L',src.size,0); md=ImageDraw.Draw(m); md.rectangle([0,0,1024,Y],fill=255)
for i in range(30): md.line([0,Y+i,1024,Y+i],fill=int(255*(1-i/30)))
im=Image.composite(cl,src,m).convert('RGBA'); d=ImageDraw.Draw(im)
d.text((512,88),'SLUTT Å LURE PÅ OM DØREN ER LUKKET',font=F(42),fill=(15,15,15),anchor='mm')
d.text((512,156),'HØR DET NÅR NOEN ÅPNER DEN',font=F(60),fill=(15,15,15),anchor='mm')
im.convert('RGB').save(f'{S}/final/dorrlarm_PD_2_1_NO.png')

# SP — ingen påhittad kundrecension: produktfakta på panelen
im=Image.open(f'{S}/clean/SP.png').convert('RGBA'); d=ImageDraw.Draw(im)
y=725
for t in ['Hør det med en gang','noen rører døren.']: d.text((500,y),t,font=F(40),fill='white',anchor='lm'); y+=50
y=845
for t in ['110 dB, høres i hele huset','Trådløs fjernkontroll','Ingen app, ingen elektriker']: d.text((500,y),t,font=F(29,False),fill='white',anchor='lm'); y+=40
d.text((500,980),'30 dagers åpent kjøp',font=F(31),fill=(120,200,255),anchor='lm')
im.convert('RGB').save(f'{S}/final/dorrlarm_SP_2_1_NO.png')
