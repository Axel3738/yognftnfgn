import sys
from PIL import Image
n=sys.argv[1]
ims=[Image.open(f'final/NO_tribuneponcho_{n}.mp4.qa-{i}.png') for i in (1,2,3)]
w,h=ims[0].size
ims=[im.crop((0,int(h*0.55),w,int(h*0.8))).resize((w//2,int(h*0.25)//2)) for im in ims]
o=Image.new('RGB',(ims[0].width,ims[0].height*3))
for i,im in enumerate(ims): o.paste(im,(0,i*im.height))
o.save(f'qa/{n}.jpg')
