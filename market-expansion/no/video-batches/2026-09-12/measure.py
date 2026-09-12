"""Mäter exakta text-/banderollpositioner i källbilderna (svensk text) med numpy,
så den norska texten kan placeras pixel-exakt i stället för att gissas fram."""
import numpy as np
from PIL import Image

def load(path):
    return np.array(Image.open(path).convert('RGB')).astype(int)

def band(mask, axis_sum_min=3):
    """Ger (min,max) rad-index där mask har minst axis_sum_min träffar per rad."""
    rows = np.where(mask.sum(axis=1) >= axis_sum_min)[0]
    if len(rows) == 0:
        return None
    return int(rows.min()), int(rows.max())

def cols(mask, row0, row1, axis_sum_min=3):
    sub = mask[row0:row1+1]
    c = np.where(sub.sum(axis=0) >= axis_sum_min)[0]
    if len(c) == 0:
        return None
    return int(c.min()), int(c.max())

def white_mask(a, y0, y1, x0, x1, thresh=200):
    reg = a[y0:y1, x0:x1]
    m = (reg[:,:,0] > thresh) & (reg[:,:,1] > thresh) & (reg[:,:,2] > thresh)
    full = np.zeros(a.shape[:2], dtype=bool)
    full[y0:y1, x0:x1] = m
    return full

def dark_mask(a, y0, y1, x0, x1, thresh=90):
    reg = a[y0:y1, x0:x1]
    m = (reg[:,:,0] < thresh) & (reg[:,:,1] < thresh) & (reg[:,:,2] < thresh)
    full = np.zeros(a.shape[:2], dtype=bool)
    full[y0:y1, x0:x1] = m
    return full

def color_mask(a, y0, y1, x0, x1, test):
    reg = a[y0:y1, x0:x1]
    m = test(reg[:,:,0], reg[:,:,1], reg[:,:,2])
    full = np.zeros(a.shape[:2], dtype=bool)
    full[y0:y1, x0:x1] = m
    return full

def report(name, a, y0, y1, x0, x1, kind='white', test=None):
    if kind == 'white':
        m = white_mask(a, y0, y1, x0, x1)
    elif kind == 'dark':
        m = dark_mask(a, y0, y1, x0, x1)
    else:
        m = color_mask(a, y0, y1, x0, x1, test)
    rb = band(m[y0:y1+1] if False else m)
    # restrict band search to the given region only
    sub = m[y0:y1, :]
    rows = np.where(sub.sum(axis=1) >= 3)[0]
    if len(rows) == 0:
        print(f'{name}: inga träffar')
        return
    r0, r1 = int(rows.min())+y0, int(rows.max())+y0
    colsub = m[r0:r1+1, x0:x1]
    ccols = np.where(colsub.sum(axis=0) >= 2)[0]
    c0, c1 = (int(ccols.min())+x0, int(ccols.max())+x0) if len(ccols) else (x0, x1)
    W = a.shape[1]
    print(f'{name}: y[{r0}-{r1}] ({r0/W:.3f}-{r1/W:.3f}) x[{c0}-{c1}] ({c0/W:.3f}-{c1/W:.3f}) center_y={((r0+r1)/2)/W:.3f}')

K = 'bilder-kalla/'

print('--- jetvifte_G ---')
a = load(K+'jetvifte_G_2_1.png')
report('line1', a, 50,110, 0,1024, 'white')
report('line2', a, 110,165, 0,1024, 'white')
report('sub', a, 185,235, 0,1024, 'white')
report('button', a, 890,1000, 0,1024, kind='color', test=lambda r,g,b: (b>150)&(b>r)&(g<220))

print('--- jetvifte_PD ---')
a = load(K+'jetvifte_PD_2_1.png')
report('line1', a, 45,110, 0,1024, 'white')
report('line2', a, 110,170, 0,1024, 'white')

print('--- jetvifte_SP ---')
a = load(K+'jetvifte_SP_2_1.png')
report('quote1', a, 70,120, 0,1024, 'white')
report('quote2', a, 120,170, 0,1024, 'white')
report('attrib', a, 180,215, 0,1024, 'white')
report('stars', a, 260,340, 0,1024, kind='color', test=lambda r,g,b: (r>200)&(g>150)&(b<120))
report('bottom1', a, 895,925, 0,1024, 'white')
report('bottom2', a, 925,960, 0,1024, 'white')

print('--- solcellslarm_CS ---')
a = load(K+'solcellslarm_CS_2_1.png')
report('banner', a, 60,270, 0,1024, kind='color', test=lambda r,g,b: (r>170)&(g<70)&(b<70))
report('line1', a, 85,160, 0,900, 'white')
report('line2', a, 160,250, 0,900, 'white')
report('sub', a, 275,330, 0,1024, 'white')

print('--- solcellslarm_G ---')
a = load(K+'solcellslarm_G_2_1.png')
report('line1', a, 60,115, 0,1024, 'white')
report('line2', a, 115,170, 0,1024, 'white')
report('line3', a, 170,230, 0,1024, 'white')
report('bottom', a, 940,1010, 0,1024, 'white')

print('--- solcellslarm_PD ---')
a = load(K+'solcellslarm_PD_2_1.png')
report('line1', a, 45,110, 0,1024, 'white')
report('line2', a, 110,170, 0,1024, 'white')
report('line3', a, 170,230, 0,1024, 'white')

print('--- solcellslarm_SP ---')
a = load(K+'solcellslarm_SP_2_1.png')
report('box', a, 20,340, 0,650, kind='color', test=lambda r,g,b: (r>220)&(g>215)&(b>205)&(r<255)|( (r>245)&(g>245)&(b>240)) )
report('quote1', a, 75,120, 0,650, 'dark')
report('quote2', a, 120,165, 0,650, 'dark')
report('quote3', a, 165,210, 0,650, 'dark')
report('attrib', a, 225,270, 0,650, 'dark')
report('check_row', a, 340,400, 0,650, kind='color', test=lambda r,g,b: (g>140)&(r<120))
report('handla_button', a, 890,960, 380,650, 'dark')

print('--- termoskydd_CS ---')
a = load(K+'termoskydd_CS_2_1.png')
report('blue_banner', a, 0,130, 0,1024, kind='color', test=lambda r,g,b: (b>170)&(r<180)&(r>90))
report('blue_text', a, 10,110, 0,1024, 'white')
report('red_banner', a, 100,200, 0,1024, kind='color', test=lambda r,g,b: (r>150)&(g<70)&(b<70))
report('red_text', a, 115,190, 0,1024, 'white')

print('--- termoskydd_G ---')
a = load(K+'termoskydd_G_2_1.png')
report('line1', a, 690,745, 0,1024, 'dark')
report('line2', a, 745,800, 0,1024, 'dark')
report('sub', a, 830,880, 0,1024, 'dark')
report('button', a, 895,975, 0,1024, kind='color', test=lambda r,g,b: (r>130)&(r<200)&(g>95)&(g<170)&(b>50)&(b<130))

print('--- termoskydd_PD ---')
a = load(K+'termoskydd_PD_2_1.png')
report('line1', a, 45,110, 0,1024, 'white')
report('line2', a, 110,175, 0,1024, 'white')
report('line3', a, 175,240, 0,1024, 'white')

print('--- termoskydd_SP ---')
a = load(K+'termoskydd_SP_2_1.png')
report('darkbox', a, 0,400, 0,400, kind='color', test=lambda r,g,b: (r<70)&(g<70)&(b<70))
report('stars', a, 60,110, 0,400, 'white')
report('quote1', a, 115,155, 0,400, 'white')
report('quote2', a, 155,195, 0,400, 'white')
report('quote3', a, 195,235, 0,400, 'white')
report('quote4', a, 235,275, 0,400, 'white')
report('attrib', a, 285,320, 0,400, 'white')
report('badge', a, 340,400, 0,400, kind='color', test=lambda r,g,b: (g>110)&(r<100)&(b<110))
