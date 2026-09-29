#!/usr/bin/env python3
"""textrutor.py — hittar de inbrända textraderna i en video, ruta för ruta och tid för tid.

Byggt 2026-09-28 efter Axels dom på no-captions.py:s band: "Kan du göra så att det suddiga
inte är så himla stort? Det tar upp för mycket av skärmen vilket är onödigt." Bandet täckte
hela bredden och tre rader hela videon, även när den svenska texten var en kort rad eller
inte syntes alls. Här mäts i stället VAR texten står och NÄR, så att bara den rutan suddas.

Metoden (inga beroenden utöver ffmpeg + numpy): inbränd UGC-text är vit med svart kontur.
Ett "streck" är en kort vit horisontell löpa (≤ 12 px) med nästan svart på båda sidor inom
3 px — ett bokstavsstreck med kontur. En sushirulle eller en vit tröja har långa vita löpor
och faller bort. En textrad har minst fem streck; närliggande textrader blir ett block, och
bara ett block som står centrerat räknas (inbränd caption). Blocket följs över tiden
(10 bilder/s): samma ruta i flera bilder i rad blir ett segment med start, slut och ruta.

  python3 pipeline/textrutor.py <video.mp4> [--zon=Y0:Y1] [--fps=10] [--json=ut.json] [--rita=ut.png]

  --zon    höjdintervallet där källtexten kan stå (standard: 55–85 % av höjden)
  --rita   ritar rutorna på en bild per segment (kontaktark) — TITTA på den

Används av no-captions.py --rutor. Skriver JSON: {"w","h","fps","segment":[{"a","b","ruta":[x0,y0,x1,y1]}]}.
"""
import json, os, shutil, subprocess, sys

import numpy as np


def ffmpeg_bin():
    p = shutil.which('ffmpeg')
    if p: return p
    import imageio_ffmpeg
    return imageio_ffmpeg.get_ffmpeg_exe()


def matt(ff, path):
    import re
    r = subprocess.run([ff, '-hide_banner', '-i', path], capture_output=True, text=True)
    m = re.search(r'Video:.*?(\d{3,5})x(\d{3,5})', r.stderr)
    d = re.search(r'Duration: (\d+):(\d+):(\d+\.\d+)', r.stderr)
    return int(m[1]), int(m[2]), int(d[1]) * 3600 + int(d[2]) * 60 + float(d[3])


def streck_i_rad(vit, svart, maxlen=12, flank=3):
    """Korta vita löpor med svart på BÅDA sidor inom `flank` px — ett bokstavsstreck med kontur.
    Returnerar (antal streck per rad, mask över streckens pixlar)."""
    h, w = vit.shape
    antal = np.zeros(h, dtype=np.int32)
    mask = np.zeros_like(vit)
    for y in range(h):
        rad = vit[y]
        if not rad.any(): continue
        d = np.diff(np.concatenate(([0], rad.astype(np.int8), [0])))
        starts = np.where(d == 1)[0]; slut = np.where(d == -1)[0]
        sv = svart[y]
        for a, e in zip(starts, slut):
            if e - a > maxlen: continue
            if sv[max(0, a - flank):a].any() and sv[e:min(w, e + flank)].any():
                antal[y] += 1; mask[y, a:e] = True
    return antal, mask


def block_i_bild(rgb, y_off, min_streck=5):
    """Textblocket i en bild: rader med ≥ min_streck konturerade streck, sammanhängande
    (luckor ≤ 12 px), centrerat i bredd. None om inget textblock finns."""
    mn = rgb.min(axis=2); mx = rgb.max(axis=2)
    vit = (mn >= 215) & ((mx - mn) < 40)
    svart = mx <= 60
    antal, mask = streck_i_rad(vit, svart)
    ja = np.where(antal >= min_streck)[0]
    if len(ja) < 6: return None, mask
    grupper, g = [], [ja[0]]
    for y in ja[1:]:
        if y - g[-1] <= 12: g.append(y)
        else: grupper.append(g); g = [y]
    grupper.append(g)
    kandidater = []
    w = rgb.shape[1]
    for gr in grupper:
        y0, y1 = gr[0], gr[-1]
        if y1 - y0 < 12 or len(gr) < 6: continue
        kol = mask[y0:y1 + 1].sum(axis=0)
        xs = np.where(kol > 0)[0]
        if len(xs) < 20: continue
        vikter = np.repeat(xs, kol[xs])
        x0, x1 = int(np.percentile(vikter, 1)), int(np.percentile(vikter, 99))
        mitt = (x0 + x1) / 2
        if abs(mitt - w / 2) > w * 0.12: continue      # inbränd caption står centrerad
        if x1 - x0 < w * 0.12: continue                 # för smalt för en textrad
        kandidater.append({'poang': float(antal[y0:y1 + 1].sum()), 'ruta': [x0, int(y0 + y_off), x1, int(y1 + y_off)]})
    if not kandidater: return None, mask
    # Raderna i en caption med två eller tre rader: slå ihop block som står tätt under
    # varandra (lucka ≤ 26 px) och är centrerade kring samma mitt.
    kandidater.sort(key=lambda k: k['ruta'][1])
    kluster = [dict(kandidater[0], ruta=list(kandidater[0]['ruta']))]
    for k in kandidater[1:]:
        c = kluster[-1]; r = k['ruta']; cr = c['ruta']
        if r[1] - cr[3] <= 26 and abs((r[0] + r[2]) / 2 - (cr[0] + cr[2]) / 2) < w * 0.1:
            c['ruta'] = [min(cr[0], r[0]), cr[1], max(cr[2], r[2]), max(cr[3], r[3])]; c['poang'] += k['poang']
        else:
            kluster.append(dict(k, ruta=list(r)))
    bast = max(kluster, key=lambda k: k['poang'])['ruta']
    # En kort rad under eller över ("igen", "donut i egna") har för få streck för att bli en
    # egen textrad. Följ blocket: rader med ≥ 2 streck inom blockets bredd, högst 34 px bort,
    # som bildar en sammanhängande rad (≥ 6 pixelrader) räknas till blocket. Mätt 2026-09-28:
    # utan detta tittade två korta andrarader fram under captionrutan i Nathalies video.
    x0, y0, x1, y1 = bast[0], bast[1] - y_off, bast[2], bast[3] - y_off
    def rad_ok(y):
        # Streck inom blockets bredd (± 60 px) räknas; brus längre ut (ett snöre, en kant) gör inget.
        if y < 0 or y >= len(antal) or antal[y] < 2: return False
        rad = mask[y, max(0, x0 - 60):x1 + 60]
        d = np.diff(np.concatenate(([0], rad.astype(np.int8), [0])))
        return int((d == 1).sum()) >= 2
    for riktning in (1, -1):
        y = (y1 if riktning == 1 else y0) + riktning; lucka = 0; lopa = []
        while 0 <= y < len(antal) and lucka <= 26 and abs(y - (y1 if riktning == 1 else y0)) <= 34 + len(lopa):
            if rad_ok(y): lopa.append(y); lucka = 0
            else: lucka += 1
            y += riktning
        if len(lopa) >= 6:
            if riktning == 1: y1 = max(lopa)
            else: y0 = min(lopa)
            v0 = max(0, x0 - 60)
            kol = mask[min(lopa):max(lopa) + 1, v0:x1 + 60].sum(axis=0); xs = np.where(kol > 0)[0] + v0
            if len(xs): x0 = min(x0, int(xs.min())); x1 = max(x1, int(xs.max()))
    return [x0, int(y0 + y_off), x1, int(y1 + y_off)], mask


def iou(a, b):
    ix = max(0, min(a[2], b[2]) - max(a[0], b[0])); iy = max(0, min(a[3], b[3]) - max(a[1], b[1]))
    inter = ix * iy
    u = (a[2] - a[0]) * (a[3] - a[1]) + (b[2] - b[0]) * (b[3] - b[1]) - inter
    return inter / u if u else 0


def byte(m1, m2, ruta, y_off):
    """Andel av strecken i rutan som skiljer två bilder åt (0 = samma text, 1 = helt ny)."""
    x0, y0, x1, y1 = ruta
    a = m1[y0 - y_off:y1 - y_off + 1, x0:x1 + 1]; b = m2[y0 - y_off:y1 - y_off + 1, x0:x1 + 1]
    union = (a | b).sum()
    return float((a ^ b).sum()) / union if union else 0.0


def segmentera(rutor, fps, w, h, marg, y_off):
    """rutor: lista (t, ruta|None, streckmask) → ett segment per inbränd caption.
    Ny caption när rutan flyttar sig (IoU ≤ 0,75) ELLER när texten i rutan byts (mer än hälften
    av strecken nya) — annars slogs tre texter i rad med samma storlek ihop till en stor ruta
    som stod kvar även när den svenska raden var kort. Enstaka missade bilder (≤ 2) räknas som träff."""
    seg = []
    cur = None; miss = 0
    for t, r, m in rutor:
        if r is None:
            if cur:
                miss += 1
                if miss > 2: seg.append(cur); cur = None; miss = 0
            continue
        samma = cur and iou(cur['ruta'], r) > 0.75 and byte(cur['mask'], m, cur['ruta'], y_off) < 0.55
        if samma:
            c = cur['ruta']; cur['ruta'] = [min(c[0], r[0]), min(c[1], r[1]), max(c[2], r[2]), max(c[3], r[3])]
            cur['b'] = t; cur['n'] += 1; cur['mask'] = m; miss = 0
        else:
            if cur: seg.append(cur)
            cur = {'a': t, 'b': t, 'ruta': list(r), 'n': 1, 'mask': m}; miss = 0
    if cur: seg.append(cur)
    ut = []
    for s in seg:
        if s['n'] < 3: continue          # under 0,3 s = brus, inte en caption
        x0, y0, x1, y1 = s['ruta']
        ut.append({'a': round(max(0, s['a'] - 0.5 / fps), 3), 'b': round(s['b'] + 1.5 / fps, 3),
                   'ruta': [max(0, x0 - marg), max(0, y0 - marg), min(w, x1 + marg), min(h, y1 + marg)]})
    return ut


def mat(path, zon=None, fps=10, marg=14):
    ff = ffmpeg_bin()
    w, h, dur = matt(ff, path)
    z0, z1 = zon or (int(h * 0.55), int(h * 0.85))
    zh = z1 - z0
    p = subprocess.run([ff, '-nostdin', '-v', 'error', '-i', path, '-vf', f'fps={fps},crop={w}:{zh}:0:{z0}',
                        '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True)
    n = len(p.stdout) // (w * zh * 3)
    bilder = np.frombuffer(p.stdout[:n * w * zh * 3], dtype=np.uint8).reshape(n, zh, w, 3).astype(np.int16)
    rutor = []
    for i in range(n):
        r, m = block_i_bild(bilder[i], z0)
        rutor.append((i / fps, r, m))
    return {'w': w, 'h': h, 'fps': fps, 'dur': dur, 'zon': [z0, z1], 'segment': segmentera(rutor, fps, w, h, marg, z0)}


def blinkar(path, zon=None, fps=10, min_bilder=2):
    """Efterkontroll: varje följd av ≥ min_bilder bilder där ett textblock syns. Används på en
    video där källtexten ska vara borta — ett segment kräver 3 bilder, en blinkning bara 2."""
    ff = ffmpeg_bin()
    w, h, dur = matt(ff, path)
    z0, z1 = zon or (int(h * 0.55), int(h * 0.85))
    zh = z1 - z0
    p = subprocess.run([ff, '-nostdin', '-v', 'error', '-i', path, '-vf', f'fps={fps},crop={w}:{zh}:0:{z0}',
                        '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True)
    n = len(p.stdout) // (w * zh * 3)
    bilder = np.frombuffer(p.stdout[:n * w * zh * 3], dtype=np.uint8).reshape(n, zh, w, 3).astype(np.int16)
    ut, lopa = [], []
    for i in range(n + 1):
        r = block_i_bild(bilder[i], z0)[0] if i < n else None
        if r: lopa.append((i / fps, r)); continue
        if len(lopa) >= min_bilder:
            rs = [x[1] for x in lopa]
            ut.append({'a': lopa[0][0], 'b': lopa[-1][0], 'ruta': [min(r[0] for r in rs), min(r[1] for r in rs), max(r[2] for r in rs), max(r[3] for r in rs)]})
        lopa = []
    return ut


def rita(path, res, ut):
    """Kontaktark: en bild mitt i varje segment med rutan ritad i rött."""
    from PIL import Image, ImageDraw
    ff = ffmpeg_bin()
    bilder = []
    for s in res['segment']:
        t = (s['a'] + s['b']) / 2
        p = subprocess.run([ff, '-nostdin', '-v', 'error', '-ss', f'{t:.2f}', '-i', path, '-frames:v', '1',
                            '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True)
        im = Image.frombytes('RGB', (res['w'], res['h']), p.stdout[:res['w'] * res['h'] * 3])
        d = ImageDraw.Draw(im); d.rectangle(s['ruta'], outline=(255, 0, 0), width=3)
        d.text((10, 10), f"{s['a']:.1f}-{s['b']:.1f}s", fill=(255, 0, 0))
        bilder.append(im.resize((res['w'] // 3, res['h'] // 3)))
    if not bilder: return
    k = 6; rader = (len(bilder) + k - 1) // k
    bw, bh = bilder[0].size
    ark = Image.new('RGB', (bw * min(k, len(bilder)), bh * rader), 'white')
    for i, b in enumerate(bilder): ark.paste(b, ((i % k) * bw, (i // k) * bh))
    ark.save(ut)


def main():
    pos = [a for a in sys.argv[1:] if not a.startswith('--')]
    flag = {a.split('=')[0]: (a.split('=', 1)[1] if '=' in a else True) for a in sys.argv[1:] if a.startswith('--')}
    if len(pos) != 1: sys.exit(__doc__)
    zon = tuple(int(x) for x in flag['--zon'].split(':')) if '--zon' in flag else None
    res = mat(pos[0], zon, int(flag.get('--fps', 10)))
    if '--json' in flag: open(flag['--json'], 'w').write(json.dumps(res, indent=1))
    if '--rita' in flag: rita(pos[0], res, flag['--rita'])
    for s in res['segment']:
        x0, y0, x1, y1 = s['ruta']
        print(f"{s['a']:6.2f}–{s['b']:6.2f} s  ruta x {x0}–{x1} y {y0}–{y1}  ({x1 - x0}×{y1 - y0})")
    tackt = sum((s['b'] - s['a']) * (s['ruta'][2] - s['ruta'][0]) * (s['ruta'][3] - s['ruta'][1]) for s in res['segment'])
    print(f"{len(res['segment'])} segment · suddad yta i snitt {100 * tackt / (res['dur'] * res['w'] * res['h']):.1f} % av bilden")


if __name__ == '__main__':
    main()
