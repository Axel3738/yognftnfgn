from PIL import Image,ImageDraw,ImageFont,ImageFilter
import os,shutil
L='/usr/share/fonts/truetype/liberation/'
N=L+'LiberationSansNarrow-Bold.ttf' if os.path.exists(L+'LiberationSansNarrow-Bold.ttf') else L+'LiberationSans-Bold.ttf'
B=L+'LiberationSans-Bold.ttf'
def fit(d,t,font,maxw,start):
    s=start
    while d.textlength(t,font=ImageFont.truetype(font,s))>maxw: s-=2
    return ImageFont.truetype(font,s)
# CS: vit panel till vänster
im=Image.open('src/CS.png').convert('RGB'); d=ImageDraw.Draw(im)
d.rectangle([0,0,302,1024],fill=(255,255,255))
x=38; W=250; y=330
for t,sz,col in [('23 %',110,(0,0,0)),('RABATT',80,(0,0,0))]:
    f=fit(d,t,N,W,sz); d.text((x,y),t,font=f,fill=col); y+=f.size+8
y+=30
f=fit(d,'NÅ 619 KR',N,W,64); d.text((x,y),'NÅ 619 KR',font=f,fill=(190,20,30)); y+=f.size+14
f2=ImageFont.truetype(N,f.size-14); t='FØR 809 KR'; d.text((x,y),t,font=f2,fill=(90,90,90))
w=d.textlength(t,font=f2); d.line([x,y+f2.size*0.55,x+w,y+f2.size*0.55],fill=(90,90,90),width=4)
im.save('no/golfkalender_CS_2_1_NO.png')
# PD: text nere till vänster på rensad platta
im=Image.open('clean/PD.png').convert('RGB')
sh=Image.new('RGBA',im.size,(0,0,0,0)); ds=ImageDraw.Draw(sh)
f=ImageFont.truetype(B,50); lines=['24 luker med','golftilbehør']; y=860
for t in lines: ds.text((52,y+3),t,font=f,fill=(0,0,0,150)); y+=62
sh=sh.filter(ImageFilter.GaussianBlur(3)); im=Image.alpha_composite(im.convert('RGBA'),sh)
d=ImageDraw.Draw(im); y=860
for t in lines: d.text((50,y),t,font=f,fill=(255,255,255)); y+=62
im.convert('RGB').save('no/golfkalender_PD_2_1_NO.png')
# G, SP: ingen svensk text i bild — oförändrade
for k in ['G','SP']: Image.open(f'src/{k}.png').convert('RGB').save(f'no/golfkalender_{k}_2_1_NO.png')
