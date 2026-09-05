#!/usr/bin/env python3
"""lager.py — bygger PNG-lagren och konfigfilerna för Båtmotortrekk-videorna (720×1280)
och kör pipeline/no-precis.py per video.

Mått mätta ur källframes 2026-09-05 (frames/<video>/, 10 fps). Allt i källpixlar.
  python3 lager.py            # bygger lager + kör alla 7
  python3 lager.py SP_1_H4    # bara en
"""
import json, os, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont

HÄR = os.path.dirname(os.path.abspath(__file__))
ROT = os.path.abspath(os.path.join(HÄR, '..', '..', '..', '..'))
W, H = 720, 1280
F_BOLD = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
F_LIB_B = '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'
F_LIB_BI = '/usr/share/fonts/truetype/liberation/LiberationSans-BoldItalic.ttf'
F_LIB_R = '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf'
O = json.load(open(os.path.join(HÄR, 'oversatt-output.json')))['overlay']
# slutkortets första frame, mätt i RENDERINGEN (25 fps) 2026-09-05, minus 0,02 s så första framen täcks
ENDCARD = {'SP_1_H4': 9.98, 'PD_3_H1': 12.62, 'CS_3_H1': 12.36, 'TH_1_H1': 10.08, 'AU_1_H1': 10.78, 'FM_1_H1': 13.48, 'RV_1_H1': 10.90}
SLUT = {'SP_1_H4': 132, 'PD_3_H1': 158, 'CS_3_H1': 160, 'TH_1_H1': 138, 'AU_1_H1': 153, 'FM_1_H1': 169, 'RV_1_H1': 130}
os.makedirs(os.path.join(HÄR, 'lager'), exist_ok=True)


def cap_ratio(font_path):
    f = ImageFont.truetype(font_path, 100); b = f.getbbox('H'); return (b[3] - b[1]) / 100


def text_img(text, font_path, cap_px, color, condense=1.0, stroke=0, stroke_fill=None, max_w=None):
    """Text som RGBA-bild med kapitälhöjd cap_px (mätt på 'H'), ev. hoptryckt i bredd."""
    px = max(8, int(round(cap_px / cap_ratio(font_path))))
    f = ImageFont.truetype(font_path, px)
    b = f.getbbox(text, stroke_width=stroke)
    im = Image.new('RGBA', (b[2] - b[0] + 2 * stroke + 8, b[3] - b[1] + 2 * stroke + 8), (0, 0, 0, 0))
    ImageDraw.Draw(im).text((4 - b[0] + stroke, 4 - b[1] + stroke), text, font=f, fill=color, stroke_width=stroke, stroke_fill=stroke_fill)
    if condense != 1.0: im = im.resize((max(1, int(im.width * condense)), im.height), Image.LANCZOS)
    if max_w and im.width > max_w: im = im.resize((int(max_w), im.height), Image.LANCZOS)   # får aldrig sticka ut ur sin ruta
    return im


def lägg(base, im, x, cy, anchor='l'):
    """Klistra text-bilden med vertikalt centrum cy; anchor l = vänsterkant x, m = mittpunkt x, r = högerkant."""
    if anchor == 'm': x = x - im.width // 2
    elif anchor == 'r': x = x - im.width
    base.alpha_composite(im, (int(x), int(cy - im.height / 2)))


def ny(): return Image.new('RGBA', (W, H), (0, 0, 0, 0))


def fyll(base, rect, color):
    ImageDraw.Draw(base).rectangle(rect, fill=color + (255,))


def spara(im, namn):
    p = os.path.join(HÄR, 'lager', namn); im.save(p); return os.path.join('lager', namn)


def rad_bbox(a, y0, y1, x0, x1, tröskel=90):
    g = a[y0:y1, x0:x1].mean(axis=2); m = g < tröskel
    ys, xs = np.where(m)
    return (x0 + xs.min(), y0 + ys.min(), x0 + xs.max(), y0 + ys.max()) if len(ys) else None


# ------------------------------------------------------------------ slutkort
def slutkort(n):
    """Telefonens skärm (statisk efter klippet) → norsk version. Byggd ur sista källframen."""
    fr = Image.open(os.path.join(HÄR, 'frames', n, f'f{SLUT[n]:04d}.jpg')).convert('RGBA')
    a = np.asarray(fr.convert('RGB'), dtype=np.int16)
    out = ny()
    # telefonens kropp: mätt 2026-09-05 — ram x 156–564, topp ~125, botten ~1000, radie ~75
    mask = Image.new('L', (W, H), 0)
    ImageDraw.Draw(mask).rounded_rectangle((156, 122, 564, 1000), radius=78, fill=255)
    kropp = fr.copy(); kropp.putalpha(mask)
    out.alpha_composite(kropp)
    d = ImageDraw.Draw(out)
    # 1. logotypens ordmärke (vit text i den svarta headern y 256–351, ikon till vänster ≤ ~305)
    hdr = a[262:346, 308:520]; vit = hdr.min(axis=2) > 200
    ys, xs = np.where(vit)
    tx0, ty0, tx1, ty1 = 308 + xs.min(), 262 + ys.min(), 308 + xs.max(), 262 + ys.max()
    # den lilla svenska flaggan efter N (grön/gul/blå) täcks också
    fyll(out, (tx0 - 6, ty0 - 6, 500, ty1 + 6), (0, 0, 0))
    lägg(out, text_img('BEVERBUTIKKEN', F_BOLD, ty1 - ty0 - 2, (255, 255, 255), condense=0.70, max_w=498 - tx0), tx0, (ty0 + ty1) / 2)
    # 2. produkttiteln, två rader mörk text mellan headern och bilden (y 400–505)
    g = a[372:498, 175:545].mean(axis=2); dr = np.where((g < 90).sum(axis=1) > 2)[0] + 372
    seg = []
    for r in dr:
        if seg and r - seg[-1][1] <= 2: seg[-1][1] = r
        else: seg.append([r, r])
    seg = sorted(sorted(seg, key=lambda q: q[0] - q[1])[:2])          # de två högsta segmenten, i höjdordning
    if len(seg) < 2: seg = [[432, 452], [464, 484]]
    fyll(out, (170, min(int(dr.min()), seg[0][0]) - 8, 550, seg[1][1] + 8), (255, 255, 255))
    for (y0, y1), t in zip(seg, O['PRODUKTTITEL']):
        lägg(out, text_img(t, F_BOLD, max(14, y1 - y0 - 1), (20, 20, 20), condense=0.70, max_w=350), 360, (y0 + y1) / 2 + 1, 'm')
    # 3. röda element: badge (hög) / prisrad (låg) / strykstreck (tunn)
    s = a[730:900, 175:545]; röd = (s[:, :, 0] > 170) & (s[:, :, 1] < 90) & (s[:, :, 2] < 90)
    rows = röd.sum(axis=1); seg = []; y = 0
    while y < len(rows):
        if rows[y] > 3:
            y0 = y
            while y < len(rows) and rows[y] > 0: y += 1
            seg.append((730 + y0, 730 + y))
        else: y += 1
    # slå ihop segment som ligger < 6 px isär (strykstrecket är två tunna rader)
    ihop = []
    for sgm in seg:
        if ihop and sgm[0] - ihop[-1][1] < 6: ihop[-1] = (ihop[-1][0], sgm[1])
        else: ihop.append(sgm)
    print('  ', n, 'röda segment', ihop)
    for (y0, y1) in ihop:
        xs = np.where(röd[y0 - 730:y1 - 730].any(axis=0))[0]; x0, x1 = 175 + xs.min(), 175 + xs.max()
        h = y1 - y0
        if h > 45:      # badge
            fyll(out, (x0, y0, x1 + 1, y1), (228, 0, 1))
            lägg(out, text_img('30 DAGERS ÅPENT KJØP', F_BOLD, int(h * 0.48), (255, 255, 255), condense=0.72, max_w=x1 - x0 - 24), (x0 + x1) / 2, (y0 + y1) / 2, 'm')
        elif h > 12:    # pris "579 kr" i rött
            fyll(out, (x0 - 10, y0 - 4, x1 + 10, y1 + 4), (255, 255, 255))
            lägg(out, text_img('529 kr', F_LIB_B, h - 2, (210, 0, 0)), (x0 + x1) / 2, (y0 + y1) / 2, 'm')
        else:           # strykstreck över grått jämförpris
            gy = a[y0 - 22:y1 + 22, 250:470]; gg = gy.mean(axis=2)
            grå = (gg > 110) & (gg < 205) & ((gy.max(axis=2) - gy.min(axis=2)) < 25)
            gys, gxs = np.where(grå)
            if len(gys) < 20:
                print('   ⚠️ hittade inget grått jämförpris vid strecket', (y0, y1)); continue
            gy0, gy1 = y0 - 22 + gys.min(), y0 - 22 + gys.max()
            fyll(out, (min(250 + gxs.min(), x0) - 8, min(gy0, y0) - 4, max(250 + gxs.max(), x1) + 8, max(gy1, y1) + 4), (255, 255, 255))
            im = text_img('882 kr', F_LIB_B, (gy1 - gy0) - 2, (150, 150, 150))
            lägg(out, im, 360, (gy0 + gy1) / 2, 'm')
            cy = (gy0 + gy1) / 2; d.rectangle((360 - im.width // 2 - 2, cy - 1, 360 + im.width // 2 + 2, cy + 2), fill=(220, 0, 0, 255))
    # 4. ordcaption-pillret nederst på skärmen ligger i frame → vit platta (no-precis lägger norska cuen ovanpå)
    fyll(out, (170, 895, 550, 1000), (255, 255, 255))
    return spara(out, f'slutkort_{n}.png')


# ------------------------------------------------------------------ per video
def konfig(n):
    K = {'in': f'out/batmotortrekk_{n}.mp4', 'ut': f'final/Batmotortrekk_NO_{n}.mp4', 'srt': f'srt-fix/batmotortrekk_{n}.srt',
         'captions': {'zon': [850, 1040], 'max_chars': 34, 'font_px': 30, 'standard_cy': 992}, 'blur': [], 'lager': []}
    T = ENDCARD[n]
    K['captions']['tvinga'] = [[T, 99]]   # slutkortets piller är vitt på vit skärm — går inte att hitta, men ska ha norsk cue
    if n == 'SP_1_H4':
        # checklista: tre vita rutor x 132–588, textyta från x 210, ikonen/avdelaren kvar
        texter = [O['KRAFTIGT OXFORD-TYG'], O['HELTÄCKANDE PASSFORM'], O['ENKELT ATT SÄTTA PÅ OCH TA AV']]
        rutor = [(672, 775, 3.35), (795, 900, 4.75), (920, 1025, 6.15)]
        for (y0, y1, t0), tx in zip(rutor, texter):
            im = ny(); fyll(im, (210, y0 + 4, 584, y1 - 4), (255, 255, 255))
            if isinstance(tx, list):
                lägg(im, text_img(tx[0], F_BOLD, 30, (15, 15, 15), condense=0.72, max_w=360), 216, 952)
                lägg(im, text_img(tx[1], F_BOLD, 30, (15, 15, 15), condense=0.72, max_w=360), 216, 1000)
            else:
                lägg(im, text_img(tx, F_BOLD, 33, (15, 15, 15), condense=0.72, max_w=360), 216, (y0 + y1) / 2)
            K['lager'].append({'png': spara(im, f'SP_ruta_{y0}.png'), 't': [t0, 8.2]})
            K['blur'].append({'rect': [132, y0, 588, y1], 't': [t0 - 0.15, t0]})
        K['captions']['av'] = [[3.3, 8.2]]   # checklistscenen har inga ordcaptions
        # pillret "Åtta av åtta … recensioner fem" ligger på det vita recensionskollaget → går inte att hitta, mätt för hand
        K['captions']['fyll'] = [{'rect': [190, 898, 530, 970], 't': [0.05, 2.4]}]
    if n == 'AU_1_H1':
        im = ny(); fyll(im, (322, 650, 536, 728), (255, 255, 255))
        lägg(im, text_img(O['SNÖ'], F_BOLD, 40, (15, 15, 15), condense=0.72), 336, 688)
        K['lager'].append({'png': spara(im, 'AU_sno.png'), 't': [8.95, T]})
        K['blur'].append({'rect': [178, 640, 545, 735], 't': [8.8, 8.95]})
    if n == 'CS_3_H1':
        K['blur'].append({'rect': [150, 490, 565, 775], 't': [0.05, 3.1]})
        vit = (255, 255, 255); grå = (165, 165, 165); sv = (0, 0, 0)
        def pris(t, farg, cap, cy, streck=False):
            im = ny(); tim = text_img(t, F_LIB_BI, cap, farg, stroke=6, stroke_fill=sv); lägg(im, tim, 360, cy, 'm')
            if streck: ImageDraw.Draw(im).rectangle((360 - tim.width // 2 - 10, cy - 7, 360 + tim.width // 2 + 10, cy + 7), fill=(200, 0, 20, 255))
            return im
        K['lager'].append({'png': spara(pris('882 KR', vit, 66, 552), 'CS_882a.png'), 't': [0.1, 0.65]})
        K['lager'].append({'png': spara(pris('882 KR', vit, 66, 552, True), 'CS_882b.png'), 't': [0.65, 1.2]})
        K['lager'].append({'png': spara(pris('882 KR', grå, 66, 552, True), 'CS_882c.png'), 't': [1.2, 3.1]})
        K['lager'].append({'png': spara(pris('529', vit, 100, 692), 'CS_529a.png'), 't': [1.25, 1.65]})
        K['lager'].append({'png': spara(pris('529 KR', vit, 100, 692), 'CS_529b.png'), 't': [1.65, 3.1]})
    if n == 'TH_1_H1':
        K['blur'].append({'rect': [100, 622, 620, 704], 't': [6.45, T]})
        im = ny(); lägg(im, text_img(O['420D Oxford-tyg'].split(' ', 1)[1], F_BOLD, 52, (234, 95, 13), stroke=5, stroke_fill=(255, 255, 255)), 360, 662, 'm')
        K['lager'].append({'png': spara(im, 'TH_oxford.png'), 't': [6.45, T]})
        K['blur'].append({'rect': [372, 712, 580, 800], 't': [8.25, T]})
        im = ny(); lägg(im, text_img('529 kr', F_LIB_BI, 40, (250, 248, 252)), 478, 752, 'm')
        K['lager'].append({'png': spara(im, 'TH_529.png'), 't': [8.3, T]})
    if n == 'RV_1_H1':
        kräm = (253, 253, 241)
        b1 = O['BUBBLA_1']; b2 = ['God beskyttelse mot regn', 'og smuss. Jeg er fornøyd.']
        for namn, rader, t in (('RV_b1', b1, [0.05, 2.8]), ('RV_b2', b2, [3.0, 5.3])):
            im = ny(); fyll(im, (100, 588, 620, 702), kräm)
            lägg(im, text_img(rader[0], F_LIB_R, 27, (25, 25, 25)), 125, 621)
            lägg(im, text_img(rader[1], F_LIB_R, 27, (25, 25, 25)), 125, 666)
            K['lager'].append({'png': spara(im, namn + '.png'), 't': t})
        K['blur'].append({'rect': [80, 540, 640, 760], 't': [2.8, 3.0]})
        # "5,0 av 5 stjärnor." / "Åtta recensioner." ligger på recensionskollaget (vitt på vitt) → handmätt platta
        K['captions']['fyll'] = [{'rect': [190, 954, 530, 1026], 't': [5.8, 8.5]}]
    K['lager'].append({'png': slutkort(n), 't': [T, 99]})
    p = os.path.join(HÄR, f'k_{n}.json'); json.dump(K, open(p, 'w'), indent=1, ensure_ascii=False); return p


if __name__ == '__main__':
    vilka = sys.argv[1:] or list(ENDCARD)
    for n in vilka:
        k = konfig(n)
        if not os.path.exists(os.path.join(HÄR, 'out', f'batmotortrekk_{n}.mp4')):
            print(n, 'lager byggda, render saknas ännu'); continue
        subprocess.run([sys.executable, os.path.join(ROT, 'pipeline', 'no-precis.py'), k], check=True)
