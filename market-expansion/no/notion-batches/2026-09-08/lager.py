#!/usr/bin/env python3
"""lager.py — bygger PNG-lagren och konfigfilerna för Båtmotortrekk-videorna (720×1280)
och kör pipeline/no-precis.py per video. Kopia av 2026-09-05-video-batmotor/lager.py,
anpassad 2026-09-08: fem nya videor (UG_1, UG_2, SP_1_H5, SP_1_H6, CS_5), slutkortets
start mäts automatiskt i renderingen (vit telefonskärm) i stället för handkonstanter.
Grafiktider mätta ur källframes 10 fps 2026-09-08 (frames/_pill_<n>_batmotortrekk/).
  python3 lager.py            # bygger lager + kör alla 5
  python3 lager.py SP_1_H5    # bara en
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
import glob, subprocess as _sp
import imageio_ffmpeg
FF = imageio_ffmpeg.get_ffmpeg_exe()
# slutkortets första frame i RENDERINGEN (25 fps): telefonskärmens vita yta x 200–300, y 560–700
# (vänster om produktbilden) är > 98 % vit bara på slutkortet. Mätt automatiskt, minus 0,02 s.
def mät_slutkort(n):
    d = os.path.join(HÄR, 'frames', n); os.makedirs(d, exist_ok=True)
    if not glob.glob(os.path.join(d, 'f*.jpg')):
        _sp.run([FF, '-v', 'error', '-i', os.path.join(HÄR, 'out', f'batmotortrekk_{n}.mp4'), '-vf', 'fps=25', '-q:v', '2', os.path.join(d, 'f%04d.jpg')], check=True)
    fs = sorted(glob.glob(os.path.join(d, 'f*.jpg'))); first = None
    for i, f in enumerate(fs, 1):
        a = np.asarray(Image.open(f).convert('RGB'))[560:700, 200:300]
        if (a.min(axis=2) > 235).mean() > 0.98:
            if first is None: first = i
        elif first is not None and i - first < 5: first = None      # kort vit blixt räknas inte
    assert first, f'{n}: hittade inget slutkort'
    return max(0.0, (first - 1) / 25 - 0.02), len(fs)
ENDCARD, SLUT = {}, {}
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
    K = {'in': f'out/batmotortrekk_{n}.mp4', 'ut': f'no/Batmotortrekk_NO_{n}.mp4', 'srt': f'srt-fixed/batmotortrekk_{n}.srt',
         'captions': {'zon': [850, 1040], 'max_chars': 34, 'font_px': 30, 'standard_cy': 992}, 'blur': [], 'lager': []}
    T, SLUT[n] = mät_slutkort(n); ENDCARD[n] = T
    print('  ', n, 'slutkort från', T, 's')
    K['captions']['tvinga'] = [[T, 99]]   # slutkortets piller är vitt på vit skärm — går inte att hitta, men ska ha norsk cue
    if n in ('SP_1_H5', 'SP_1_H6'):
        # checklista (samma mall som SP_1_H4 2026-09-05, +9,15 s resp. +9,75 s): rutor x 132–588
        texter = [O['KRAFTIGT OXFORD-TYG'], O['HELTÄCKANDE PASSFORM'], O['ENKELT ATT SÄTTA PÅ OCH TA AV']]
        t1, slut = (12.5, 19.1) if n == 'SP_1_H5' else (13.1, 19.7)
        rutor = [(672, 775, t1), (795, 900, t1 + 1.4), (920, 1025, t1 + 2.8)]
        for (y0, y1, t0), tx in zip(rutor, texter):
            im = ny(); fyll(im, (210, y0 + 4, 584, y1 - 4), (255, 255, 255))
            if isinstance(tx, list):
                lägg(im, text_img(tx[0], F_BOLD, 30, (15, 15, 15), condense=0.72, max_w=360), 216, 952)
                lägg(im, text_img(tx[1], F_BOLD, 30, (15, 15, 15), condense=0.72, max_w=360), 216, 1000)
            else:
                lägg(im, text_img(tx, F_BOLD, 33, (15, 15, 15), condense=0.72, max_w=360), 216, (y0 + y1) / 2)
            K['lager'].append({'png': spara(im, f'{n}_ruta_{y0}.png'), 't': [t0, slut]})
            K['blur'].append({'rect': [132, y0, 588, y1], 't': [t0 - 0.15, t0]})
        K['captions']['av'] = [[t1 - 0.05, slut]]   # checklistscenen har inga ordcaptions
    if n == 'CS_5_H1':
        # prisgrafik 0–4,8 s (965 KR struket + 579 KR, samma läge som CS_3), sedan "40% RABATT" 4,9–8,0 s (y 600–760)
        K['blur'].append({'rect': [150, 490, 565, 775], 't': [0.05, 4.8]})
        K['blur'].append({'rect': [130, 610, 590, 760], 't': [4.85, 8.05]})
        vit = (255, 255, 255); grå = (165, 165, 165); sv = (0, 0, 0)
        def pris(t, farg, cap, cy, streck=False):
            im = ny(); tim = text_img(t, F_LIB_BI, cap, farg, stroke=6, stroke_fill=sv); lägg(im, tim, 360, cy, 'm')
            if streck: ImageDraw.Draw(im).rectangle((360 - tim.width // 2 - 10, cy - 7, 360 + tim.width // 2 + 10, cy + 7), fill=(200, 0, 20, 255))
            return im
        K['lager'].append({'png': spara(pris('882 KR', grå, 66, 552, True), 'CS5_882.png'), 't': [0.1, 4.8]})
        K['lager'].append({'png': spara(pris('529 KR', vit, 100, 692), 'CS5_529.png'), 't': [0.1, 4.8]})
        K['lager'].append({'png': spara(pris(O['40% RABATT'], vit, 64, 685), 'CS5_rabatt.png'), 't': [4.9, 8.0]})
    if n == 'UG_2_H1':
        # stor vit text till höger om telefonen: "8 / riktiga recensioner" 0,1–1,95 s, "5 / stjärnor" 2,0–3,5 s (x 440–712, y 470–810)
        # och "420D / Oxford-tyg" till vänster 8,0–10,8 s (x 30–380, y 620–800)
        vit = (255, 255, 255); sv = (0, 0, 0)
        def stor(rader, cx, cy0, cap0, cap1, namn):
            im = ny(); lägg(im, text_img(rader[0], F_BOLD, cap0, vit, stroke=4, stroke_fill=sv), cx, cy0, 'm')
            y = cy0 + cap0 * 0.9
            for rad in rader[1:]:
                lägg(im, text_img(rad, F_BOLD, cap1, vit, stroke=3, stroke_fill=sv, max_w=300), cx, y + cap1 * 0.8, 'm'); y += cap1 * 1.5
            return spara(im, namn)
        # SE-texten "riktiga recensioner" börjar vid x≈290 (över telefonens högerkant) och "5 stjärnor" vid x≈380 —
        # suddrutan måste börja vid 280, annars står "rik…/stjä…" kvar (mätt i första passet 2026-09-08)
        K['blur'].append({'rect': [290, 480, 645, 812], 't': [0.05, 3.55]})   # mätt: '8 riktiga recensioner' x 300–623 y 492–799, '5 stjärnor' x 300–630 y 495–783
        r8 = O['8 RIKTIGA RECENSIONER']; r5 = O['5 STJÄRNOR']
        K['lager'].append({'png': stor([r8[0], 'anmeldelser hos', 'baverbutiken.se'], 520, 525, 84, 28, 'UG2_8.png'), 't': [0.1, 1.95]})
        K['lager'].append({'png': stor(r5, 520, 525, 84, 36, 'UG2_5.png'), 't': [2.0, 3.5]})
        # "420D / Oxford-tyg" står x 100–440, y 700–870 (mätt i källframe t=9,5)
        K['blur'].append({'rect': [0, 675, 545, 960], 't': [7.95, 10.85]})   # mätt: x 11–527, y 687–949
        ox = O['420D OXFORD-TYG']
        im = ny(); lägg(im, text_img(ox[0], F_BOLD, 60, vit), 40, 745); lägg(im, text_img(ox[1], F_BOLD, 42, vit, max_w=440), 40, 860)
        K['lager'].append({'png': spara(im, 'UG2_oxford.png'), 't': [8.0, 10.8]})
    K['lager'].append({'png': slutkort(n), 't': [T, 99]})
    p = os.path.join(HÄR, f'k_{n}.json'); json.dump(K, open(p, 'w'), indent=1, ensure_ascii=False); return p


if __name__ == '__main__':
    vilka = sys.argv[1:] or ['UG_1_H1', 'UG_2_H1', 'SP_1_H5', 'SP_1_H6', 'CS_5_H1']
    for n in vilka:
        k = konfig(n)
        if not os.path.exists(os.path.join(HÄR, 'out', f'batmotortrekk_{n}.mp4')):
            print(n, 'lager byggda, render saknas ännu'); continue
        subprocess.run([sys.executable, os.path.join(ROT, 'pipeline', 'no-precis.py'), k], check=True)
