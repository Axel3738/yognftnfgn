import sys
from PIL import Image
ims=[Image.open(f'{sys.argv[1]}.qa-{i}.png') for i in (1,2,3)]
w,h=ims[0].size; s=360/w
out=Image.new('RGB',(360*3,int(h*s)))
for i,im in enumerate(ims): out.paste(im.convert('RGB').resize((360,int(h*s))),(360*i,0))
out.save(sys.argv[2])
