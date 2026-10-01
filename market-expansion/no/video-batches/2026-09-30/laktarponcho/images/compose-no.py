# Norsk tekst på Tribuneponchoens fire bildannonser (kie-rensade plattor i clean/).
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np, cv2, os
S=os.path.dirname(os.path.abspath(__file__))
B='/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'; R='/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf'
F=lambda s,b=True: ImageFont.truetype(B if b else R,s)
os.makedirs(f'{S}/final',exist_ok=True)
def shadowtext(im,xy,s,font,fill,anchor='mm',blur=6,alpha=170):
    L=Image.new('RGBA',im.size,(0,0,0,0)); d=ImageDraw.Draw(L); d.text((xy[0]+2,xy[1]+3),s,font=font,fill=(0,0,0,alpha),anchor=anchor)
    L=L.filter(ImageFilter.GaussianBlur(blur)); im.alpha_composite(L); ImageDraw.Draw(im).text(xy,s,font=font,fill=fill,anchor=anchor)
# CS
im=Image.open(f'{S}/clean/CS.png').convert('RGB'); a=np.array(im).astype(float)
top,bot=52,158
for y in range(top+1,bot):
    t=(y-top)/(bot-top); a[y]=a[top]*(1-t)+a[bot]*t
im=Image.fromarray(a.astype('uint8')).convert('RGBA'); d=ImageDraw.Draw(im)
ink=(20,20,20)
d.text((512,105),'SPAR 210 KR',font=F(104),fill=ink,anchor='mm')
d.text((512,238),'TRIBUNEPONCHO MED VARME',font=F(60),fill=ink,anchor='mm')
d.text((512,308),'3 varmenivåer via USB',font=F(38,False),fill=ink,anchor='mm')
f1=F(44,False); f2=F(64); t1='889 kr'; t2='679 kr'
w1=d.textlength(t1,font=f1); w2=d.textlength(t2,font=f2); pad=34; gap=26; wt=w1+gap+w2+2*pad
x0=512-wt/2
d.rounded_rectangle([x0,336,x0+wt,414],radius=39,fill='white')
d.text((x0+pad,376),t1,font=f1,fill=(110,110,110),anchor='lm'); d.line([x0+pad-2,378,x0+pad+w1+2,378],fill=(110,110,110),width=4)
d.text((x0+pad+w1+gap,376),t2,font=f2,fill=(15,15,15),anchor='lm')
im.convert('RGB').save(f'{S}/final/tribuneponcho_CS_2_1_NO.png')
# G — rensa kvarglömd svensk rad med inpaint
im=Image.open(f'{S}/clean/G.png').convert('RGB'); a=np.array(im)
m=np.zeros(a.shape[:2],np.uint8)
reg=a[235:310,100:940]; g=reg.min(axis=2)
m[235:310,100:940]=((g>215)).astype(np.uint8)*255
m=cv2.dilate(m,np.ones((9,9),np.uint8),iterations=2)
a=cv2.inpaint(a,m,7,cv2.INPAINT_TELEA)
im=Image.fromarray(a).convert('RGBA')
shadowtext(im,(512,80),'Den perfekte gaven til',F(64),'white')
shadowtext(im,(512,152),'den som alltid fryser.',F(64),'white')
d=ImageDraw.Draw(im); bw=d.textlength('Finn gaven',font=F(32))+80
d.rounded_rectangle([512-bw/2,930,512+bw/2,994],radius=32,fill=(200,45,45)); d.text((512,962),'Finn gaven',font=F(32),fill='white',anchor='mm')
im.convert('RGB').save(f'{S}/final/tribuneponcho_G_2_1_NO.png')
# PD — ljus himmel: mörk text
im=Image.open(f'{S}/clean/PD.png').convert('RGBA'); d=ImageDraw.Draw(im); ink=(20,20,20)
for i,t in enumerate(['Slutt å fryse','på tribunen.','Hold deg varm','med hendene fri.']): d.text((68,100+i*68),t,font=F(54),fill=ink,anchor='lm')
d.text((68,392),'3 varmenivåer via USB',font=F(36,False),fill=ink,anchor='lm')
im.convert('RGB').save(f'{S}/final/tribuneponcho_PD_2_1_NO.png')
# SP — ta bort svart cirkel (kie-artefakt), ingen påhittad recension
im=Image.open(f'{S}/clean/SP.png').convert('RGB')
a=np.array(im)[:,:,::-1].copy(); src=a.copy(); m=np.zeros(a.shape[:2],np.uint8); cv2.circle(m,(895,551),56,255,-1)
sp=np.roll(src,(-110,-25),axis=(0,1)); out=cv2.seamlessClone(sp,a,m,(895,551),cv2.NORMAL_CLONE); im=Image.fromarray(out[:,:,::-1])
im=im.convert('RGBA')
y=140
for s in ['Fryser du på','tribunen?']: shadowtext(im,(70,y),s,F(64),'white','lm'); y+=76
y+=16
for s in ['3 varmenivåer du styrer selv,','drevet via USB fra en powerbank.','Powerbank følger ikke med.']: shadowtext(im,(70,y),s,F(34,False),'white','lm'); y+=46
y+=20; shadowtext(im,(70,y),'30 dagers åpent kjøp',F(36),'white','lm')
im.convert('RGB').save(f'{S}/final/tribuneponcho_SP_2_1_NO.png')
