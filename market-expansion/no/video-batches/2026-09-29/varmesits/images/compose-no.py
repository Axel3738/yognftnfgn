# Ritar norsk text på Kie-rensade plattor (Fas 3.2). Värmesits → Varmesete, 2026-09-29.
from PIL import Image, ImageDraw, ImageFont
import numpy as np
B='/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'
R='/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf'
F=lambda p,s: ImageFont.truetype(p,s)
def laga_linje(im,y0,y1,x0,x1):
    a=np.array(im).copy(); h=y1-y0+1
    for k,y in enumerate(range(y0-2,y1+3)):
        t=(k+1)/(h+5); a[y,x0-6:x1+7]=(a[y0-5,x0-6:x1+7]*(1-t)+a[y1+5,x0-6:x1+7]*t).astype(a.dtype)
    return Image.fromarray(a)
def mitt(d,y,txt,font,fill,W=1024):
    w=d.textlength(txt,font=font); d.text(((W-w)/2,y),txt,font=font,fill=fill); return w
def spar(im,k): im.convert('RGB').save(f'varmesits_{k}_2_1_NO.png')

# CS
im=Image.open('clean/CS.png').convert('RGB'); im=laga_linje(im,307,314,360,680); d=ImageDraw.Draw(im)
mitt(d,95,'23 % RABATT NÅ',F(B,78),(20,20,20))
f=F(B,46); a='939 kr'; b='  719 kr – du sparer 220 kr'
wa=d.textlength(a,font=f); wb=d.textlength(b,font=f); x=(1024-wa-wb)/2; y=205
d.text((x,y),a,font=f,fill=(20,20,20)); d.line((x,y+27,x+wa,y+27),fill=(20,20,20),width=4); d.text((x+wa,y),b,font=f,fill=(20,20,20))
# badge nere till höger: 30 dagers åpent kjøp
bx0,by0,bx1,by1=770,880,1010,1000; d.rounded_rectangle((bx0,by0,bx1,by1),radius=10,fill=(255,255,255))
fb=F(B,30)
for i,t in enumerate(['30 DAGERS','ÅPENT KJØP']):
    w=d.textlength(t,font=fb); d.text((bx0+(bx1-bx0-w)/2,by0+18+i*42),t,font=fb,fill=(200,20,20))
spar(im,'CS')

# G
im=Image.open('clean/G.png').convert('RGB'); d=ImageDraw.Draw(im); fh=F(B,44)
t1a,t1b='JULEGAVEN HAN ','FAKTISK'; w=d.textlength(t1a+t1b,font=fh); x=(1024-w)/2-40
d.text((x,70),t1a,font=fh,fill=(255,255,255)); d.text((x+d.textlength(t1a,font=fh),70),t1b,font=fh,fill=(214,178,94))
ww=d.textlength('KOMMER TIL Å BRUKE',font=fh); d.text(((1024-ww)/2-40,128),'KOMMER TIL Å BRUKE',font=fh,fill=(214,178,94))
fr=F(R,38); mitt(d,780,'Han blir varm. Og han vet at det',fr,(255,255,255)); mitt(d,828,'var du som tenkte på ham.',fr,(255,255,255))
d.rounded_rectangle((330,900,694,980),radius=40,fill=(214,178,94)); fbt=F(B,34); mitt(d,921,'GI BORT VARME',fbt,(30,50,30))
spar(im,'G')

# PD: rita över källtexten med vit bakgrund (plattan var ren vit)
im=Image.open('clean/PD.png').convert('RGB'); d=ImageDraw.Draw(im); d.rectangle((0,95,1024,340),fill=(254,254,254))
fp=F(B,62)
mitt(d,120,'SLUTT Å FRYSE PÅ TRIBUNEN.',fp,(15,35,70)); mitt(d,200,'FÅ VARME RETT I STOLEN.',fp,(15,35,70))
d.rectangle((70,296,954,301),fill=(232,110,40))
spar(im,'PD')

# SP: inget påhittat citat, inga stjärnor — sanna fakta + garanti
im=Image.open('clean/SP.png').convert('RGB'); im=laga_linje(im,924,929,362,661); d=ImageDraw.Draw(im)
mitt(d,95,'Sitt varmt i timevis ute.',F(B,64),(20,20,20))
mitt(d,190,'4 varmesoner · 3 varmenivåer · USB',F(R,42),(40,40,40))
mitt(d,880,'30 dagers åpent kjøp – pengene tilbake.',F(R,32),(30,30,30))
d.rounded_rectangle((382,930,642,990),radius=30,fill=(232,110,40)); mitt(d,942,'KJØP NÅ',F(B,34),(255,255,255))
spar(im,'SP')
