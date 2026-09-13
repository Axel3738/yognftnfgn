import numpy as np
from PIL import Image

def load(path):
    return np.array(Image.open(path).convert('RGB')).astype(int)

def report(name, a, y0, y1, x0, x1, kind='white', test=None):
    if kind == 'white':
        reg = a[y0:y1, x0:x1]
        m = (reg[:, :, 0] > 200) & (reg[:, :, 1] > 200) & (reg[:, :, 2] > 200)
    elif kind == 'dark':
        reg = a[y0:y1, x0:x1]
        m = (reg[:, :, 0] < 90) & (reg[:, :, 1] < 90) & (reg[:, :, 2] < 90)
    else:
        reg = a[y0:y1, x0:x1]
        m = test(reg[:, :, 0], reg[:, :, 1], reg[:, :, 2])
    rows = np.where(m.sum(axis=1) >= 3)[0]
    if len(rows) == 0:
        print(f'{name}: inga träffar')
        return
    r0, r1 = int(rows.min()) + y0, int(rows.max()) + y0
    sub = m[rows.min():rows.max() + 1]
    ccols = np.where(sub.sum(axis=0) >= 2)[0]
    c0, c1 = (int(ccols.min()) + x0, int(ccols.max()) + x0) if len(ccols) else (x0, x1)
    W = a.shape[1]
    print(f'{name}: y[{r0}-{r1}] ({r0/W:.3f}-{r1/W:.3f}) x[{c0}-{c1}] ({c0/W:.3f}-{c1/W:.3f}) center_y={((r0+r1)/2)/W:.3f}')

K = 'bilder-kalla/'

print('--- CS ---')
a = load(K + 'staketstolpsbygel_CS_2_1.png')
report('line1', a, 20, 130, 0, 1024, 'white')
report('line2', a, 150, 220, 0, 1024, 'white')

print('--- GT ---')
a = load(K + 'staketstolpsbygel_GT_2_1.png')
report('line1', a, 50, 115, 0, 1024, 'white')
report('line2', a, 150, 230, 0, 1024, 'white')
report('sub', a, 840, 890, 0, 1024, 'white')
report('button', a, 895, 980, 0, 1024, kind='color', test=lambda r, g, b: (r > 170) & (g < 90) & (b < 90))
report('button_text', a, 900, 970, 0, 1024, 'white')

print('--- PD ---')
a = load(K + 'staketstolpsbygel_PD_2_1.png')
report('banner', a, 0, 260, 0, 1024, kind='color', test=lambda r, g, b: (b > 150) & (b > r))
report('line1', a, 45, 120, 0, 1024, 'white')
report('line2', a, 150, 220, 0, 1024, 'white')

print('--- SP ---')
a = load(K + 'staketstolpsbygel_SP_2_1.png')
report('stars', a, 30, 100, 0, 1024, kind='color', test=lambda r, g, b: (r > 200) & (g > 200) & (b > 200))
report('quote1', a, 100, 155, 0, 1024, 'white')
report('quote2', a, 155, 210, 0, 1024, 'white')
report('attrib', a, 225, 270, 0, 1024, 'white')
report('bottom_text', a, 860, 905, 0, 1024, 'white')
report('button', a, 905, 990, 0, 1024, kind='dark')
