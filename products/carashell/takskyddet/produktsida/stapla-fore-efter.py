# Före/efter: fe-1-bar överst, fe-2-med underst, vardera mittbeskuren till 2:1,
# tunn vit skiljelinje, 1024×1024. Ingen text.
from PIL import Image
import os
UT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'gen')
W = 1024; GAP = 12; H = (W - GAP) // 2
def panel(fil):
    im = Image.open(os.path.join(UT, fil)).convert('RGB')
    im = im.resize((W, W)) if im.size != (W, W) else im
    # beskär till W×H med lite förskjutning uppåt så taket får plats
    top = int(W * 0.26)
    return im.crop((0, top, W, top + H))
ut = Image.new('RGB', (W, W), (255, 255, 255))
ut.paste(panel('fe-1-bar.png'), (0, 0))
ut.paste(panel('fe-2-med.png'), (0, H + GAP))
ut.save(os.path.join(UT, 'fore-efter-husvagn.png'), optimize=True)
print('skrev fore-efter-husvagn.png', ut.size)
