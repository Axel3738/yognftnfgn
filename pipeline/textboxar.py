#!/usr/bin/env python3
"""textboxar.py — hittar inbrända texter som står i en RUTA (vit, mörk eller färgad), bild för bild.

Byggt 2026-09-28 för Matstrumpors egna videor (haikuh3, haikuh2, s001h1, 012v2), som ska göras
om på elva språk med egen röst i stället för HeyGens videoöversättning (Axels order samma dag:
"alla videos som inte är Nathalie och Sofie" med egen ElevenLabs/HeyGen). De videorna bär
texten i rutor — vit ruta med svart text, halvgenomskinlig mörk ruta med vit text, orange ruta
med vit text — och inte som vit text med svart kontur (det är textrutor.py:s fall, UGC:n).

Metoden (OpenCV + numpy): per bild görs en mask per stil (ljus, mörk, orange). Sammanhängande
områden som är nästan rektangulära (fyllnadsgrad ≥ 0,8 efter att hålen fyllts), lagom stora och
som har text i sig (en andel pixlar i motsatt ljushet) blir rutor. Rutorna följs över tiden
(samma stil, överlapp ≥ 0,5) och blir segment med start, slut, ruta och stil.

  python3 pipeline/textboxar.py <video.mp4> [--fps=10] [--json=ut.json] [--rita=ut.png]

JSON: {"w","h","fps","segment":[{"a","b","ruta":[x0,y0,x1,y1],"stil","farg":[r,g,b]}]}
"""
import json, os, subprocess, sys

import cv2
import numpy as np

STILAR = ('ljus', 'mork', 'orange')


def bilder(path, fps):
    """Läser videon som RGB-bilder med ffmpeg (samma som textrutor.py)."""
    import shutil
    ff = shutil.which('ffmpeg')
    r = subprocess.run([ff, '-hide_banner', '-i', path], capture_output=True, text=True)
    import re
    m = re.search(r'Video:.*?(\d{3,5})x(\d{3,5})', r.stderr)
    w, h = int(m[1]), int(m[2])
    p = subprocess.Popen([ff, '-nostdin', '-v', 'error', '-i', path, '-vf', f'fps={fps}', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'],
                         stdout=subprocess.PIPE)
    n = w * h * 3
    i = 0
    while True:
        b = p.stdout.read(n)
        if len(b) < n: break
        yield i / fps, np.frombuffer(b, np.uint8).reshape(h, w, 3)
        i += 1
    p.wait()


def masker(rgb):
    hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV)
    H, S, V = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    return {
        'ljus': (V >= 228) & (S <= 45),
        # halvgenomskinlig mörk ruta: bara ljusheten — mättnaden är instabil vid låg ljushet och en
        # mörk ruta över en brun tröja fick S 140–180 (mätt haikuh3 16 s)
        'mork': (V <= 75),
        # Matstrumpors orange (#F68A28-ish): OpenCV-hue 6–22 av 180, mycket mättad och ljus.
        # S ≥ 180 och V ≥ 225 skiljer rutan från ett trägolv i samma kulör (S ~100–120, mätt 012v2)
        'orange': (H >= 6) & (H <= 22) & (S >= 180) & (V >= 225),
    }


def rutor_i_bild(rgb, min_h=0.018, max_h=0.30, min_w=0.06):
    """Returnerar [(x0,y0,x1,y1, stil, farg)] för rutor med text i."""
    h, w, _ = rgb.shape
    V = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV)[..., 2]
    ut = []
    for stil, m in masker(rgb).items():
        m8 = m.astype(np.uint8) * 255
        # stäng små glipor (text som delar rutan), men inte så mycket att rutor växer ihop
        karna = (5, 3) if stil == 'orange' else (9, 5)
        m8 = cv2.morphologyEx(m8, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_RECT, karna))
        kont, _ = cv2.findContours(m8, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        for k in kont:
            x, y, bw, bh = cv2.boundingRect(k)
            if bh < min_h * h or bh > max_h * h or bw < min_w * w or bw > 0.98 * w: continue
            fylld = cv2.contourArea(k) / float(bw * bh)
            # orange rader står ofta som staplade remsor av olika längd (012v2 0–2 s) — lägre krav
            if fylld < {'ljus': 0.80, 'mork': 0.75, 'orange': 0.60}[stil]: continue
            inne = V[y:y + bh, x:x + bw]
            ruta_m = m[y:y + bh, x:x + bw]
            # text = pixlar i motsatt ljushet inne i rutan (hålen i masken)
            if stil == 'ljus': text = (inne <= 110)
            elif stil == 'mork': text = (inne >= 190)
            else: text = (inne >= 235) & ~ruta_m
            andel = text.mean()
            if andel < 0.03 or andel > 0.55: continue
            # texten ska ligga inne i rutan, inte längs kanten (en vit tröja med mörka veck)
            rad_med_text = (text.mean(axis=1) > 0.02).sum()
            if rad_med_text < 0.25 * bh: continue
            farg = [int(c) for c in np.median(rgb[y:y + bh, x:x + bw][ruta_m], axis=0)] if ruta_m.any() else [0, 0, 0]
            ut.append((x, y, x + bw, y + bh, stil, farg))
    return ut


def iou(a, b):
    x0, y0 = max(a[0], b[0]), max(a[1], b[1]); x1, y1 = min(a[2], b[2]), min(a[3], b[3])
    if x1 <= x0 or y1 <= y0: return 0.0
    i = (x1 - x0) * (y1 - y0)
    return i / float((a[2] - a[0]) * (a[3] - a[1]) + (b[2] - b[0]) * (b[3] - b[1]) - i)


def mat(path, fps=10, min_bilder=2):
    segment, aktiva = [], []
    w = h = 0
    for t, rgb in bilder(path, fps):
        h, w, _ = rgb.shape
        nu = rutor_i_bild(rgb)
        nya_aktiva = []
        for r in nu:
            match = None
            for s in aktiva:
                if s['stil'] == r[4] and iou(s['sista'], r[:4]) >= 0.5: match = s; break
            if match:
                aktiva.remove(match)
                match['sista'] = r[:4]; match['b'] = t + 1 / fps; match['n'] += 1
                match['alla'].append(r[:4]); nya_aktiva.append(match)
            else:
                nya_aktiva.append({'a': t, 'b': t + 1 / fps, 'stil': r[4], 'farg': r[5], 'sista': r[:4], 'alla': [r[:4]], 'n': 1})
        segment += aktiva  # de som inte fortsatte är slut
        aktiva = nya_aktiva
    segment += aktiva
    ut = []
    for s in segment:
        if s['n'] < min_bilder: continue
        a = np.array(s['alla'])
        ruta = [int(a[:, 0].min()), int(a[:, 1].min()), int(a[:, 2].max()), int(a[:, 3].max())]
        ut.append({'a': round(s['a'], 2), 'b': round(s['b'], 2), 'ruta': ruta, 'stil': s['stil'], 'farg': s['farg']})
    ut.sort(key=lambda s: (s['a'], s['ruta'][1]))
    return {'w': w, 'h': h, 'fps': fps, 'segment': ut}


def rita(path, res, ut):
    """Ett kontaktark: en bild per segment (mitt i segmentet) med rutan inritad."""
    from PIL import Image, ImageDraw
    import shutil
    ff = shutil.which('ffmpeg')
    tum = []
    for s in res['segment'][:48]:
        t = (s['a'] + s['b']) / 2
        b = subprocess.run([ff, '-nostdin', '-v', 'error', '-ss', f'{t:.2f}', '-i', path, '-frames:v', '1', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True).stdout
        im = Image.frombytes('RGB', (res['w'], res['h']), b)
        d = ImageDraw.Draw(im)
        d.rectangle(s['ruta'], outline=(255, 0, 0), width=4)
        d.text((10, 10), f"{s['a']:.1f}-{s['b']:.1f} {s['stil']}", fill=(255, 0, 0))
        tum.append(im.resize((res['w'] // 4, res['h'] // 4)))
    if not tum: return
    k = 8; r = (len(tum) + k - 1) // k
    ark = Image.new('RGB', (k * tum[0].width, r * tum[0].height))
    for i, t in enumerate(tum): ark.paste(t, ((i % k) * t.width, (i // k) * t.height))
    ark.save(ut)


if __name__ == '__main__':
    arg = [a for a in sys.argv[1:] if not a.startswith('--')]
    flag = dict(a[2:].split('=', 1) for a in sys.argv[1:] if a.startswith('--') and '=' in a)
    res = mat(arg[0], fps=int(flag.get('fps', 10)))
    if 'json' in flag: open(flag['json'], 'w').write(json.dumps(res, indent=1))
    if 'rita' in flag: rita(arg[0], res, flag['rita'])
    for s in res['segment']: print(f"{s['a']:6.2f}-{s['b']:6.2f} {s['stil']:6} {s['ruta']} {s['farg']}")
