#!/usr/bin/env python3
"""no-precis.py — norsk text exakt där den svenska satt, aldrig ett band över bilden.

Efterföljare till no-captions.py för videor med flera inbrända textelement
(Axels regel 2026-09-05: "sudda bara rutan där den svenska texten faktiskt sitter,
bara medan den syns"). Tre lager i EN ffmpeg-körning:

  1. Ordcaptions (pillret med vit text nederst): hittas PER FRAME i den renderade
     videon (ljusa textpixlar med mörk granne i zonen), och bara det pillret suddas
     (maskedmerge mot en per-frame-mask). Den norska texten läggs som ASS-cue med vit
     ruta/svart fet text (Beltesliper-facit), centrerad där pillret satt under cuen.
  2. Statiska suddrutor (`blur`): [x0,y0,x1,y1] + [t0,t1] — för text på foto/tyg.
  3. PNG-lager (`lager`): RGBA i full bildstorlek + [t0,t1] — vita/kräm plattor med
     norsk text (byggda med PIL av anropande skript), slutkort m.m.

  python3 pipeline/no-precis.py <konfig.json>

konfig.json:
  {"in": "...mp4", "ut": "...mp4", "srt": "norsk.srt",
   "captions": {"zon": [850, 1040], "max_chars": 34, "font_px": 30, "standard_cy": 992,
                "pad_x": 6, "pad_y": 6, "av": [[t0,t1], ...],       # "av" = inga captions då
                "tvinga": [[t0,t1], ...],                            # "tvinga" = caption även utan hittat piller (slutkort: vitt på vitt)
                "fyll": [{"rect": [x0,y0,x1,y1], "t": [t0,t1]}]},    # manuell vit pillerplatta (piller på vitt kollage), tvingar caption
   "blur": [{"rect": [x0,y0,x1,y1], "t": [t0,t1]}, ...],
   "lager": [{"png": "...png", "t": [t0,t1]}, ...],
   "qa": "mapp"}

Skriver <ut>, <ut>.ark.jpg (1 fps kontaktark) och <ut>.qa-N.png. Beroenden: ffmpeg
(imageio-ffmpeg:s binär duger), numpy, PIL.
"""
import json, os, re, shutil, subprocess, sys, tempfile
import numpy as np

HÄR = os.path.dirname(os.path.abspath(__file__))


def ffmpeg_bin():
    p = shutil.which('ffmpeg')
    if p: return p
    import imageio_ffmpeg
    return imageio_ffmpeg.get_ffmpeg_exe()


def ffinfo(ff, path):
    r = subprocess.run([ff, '-hide_banner', '-i', path], capture_output=True, text=True)
    m = re.search(r'Video:.*?(\d{3,5})x(\d{3,5})', r.stderr)
    f = re.search(r'(\d+(?:\.\d+)?) fps', r.stderr)
    d = re.search(r'Duration: (\d+):(\d+):(\d+\.\d+)', r.stderr)
    if not (m and f and d): sys.exit(f'kunde inte läsa {path}')
    dur = int(d[1]) * 3600 + int(d[2]) * 60 + float(d[3])
    return int(m[1]), int(m[2]), float(f[1]), dur


def parse_ts(t):
    h, m, s = t.split(':'); s, ms = s.split(',')
    return int(h) * 3600 + int(m) * 60 + int(s) + int(ms) / 1000


def ass_ts(x):
    h = int(x // 3600); m = int(x % 3600 // 60); s = x % 60
    return f'{h:d}:{m:02d}:{s:05.2f}'


def läs_srt(path):
    cues = []
    for block in re.split(r'\n\n+', open(path, encoding='utf-8').read().strip()):
        rader = block.strip().split('\n')
        if len(rader) < 3: continue
        a, e = (parse_ts(x) for x in rader[1].split(' --> '))
        cues.append((a, e, ' '.join(rader[2:]).strip()))
    return cues


def chunka(text, max_chars):
    """Ordvis radbrytning till bitar ≤ max_chars (meningsgräns först, som cover-srt.py)."""
    sents = [x.strip() for x in re.findall(r'[^.!?]+[.!?]?\s*', text) if x.strip()]
    bitar, cur = [], ''
    for x in sents:
        if len(x) > max_chars:
            if cur: bitar.append(cur); cur = ''
            seg = ''
            for w in x.split():
                if seg and len(seg) + 1 + len(w) > max_chars: bitar.append(seg); seg = w
                else: seg = f'{seg} {w}'.strip()
            if seg: bitar.append(seg)
        elif cur and len(cur) + 1 + len(x) <= max_chars: cur = f'{cur} {x}'
        else:
            if cur: bitar.append(cur)
            cur = x
    if cur: bitar.append(cur)
    return bitar


def del_cues(srt, max_chars):
    """Varje SRT-block → bitar med proportionell tid INOM blockets egna tider (ingen lucklös
    förlängning — en norsk caption ska bara synas när det svenska pillret syns)."""
    ut = []
    for a, e, text in läs_srt(srt):
        bitar = chunka(text, max_chars); tot = sum(len(b) for b in bitar) or 1; t = a
        for b in bitar:
            d = (e - a) * len(b) / tot; ut.append((t, t + d, b)); t += d
    return ut


def dilatera(m, r):
    """Binär dilation r px (fyrkant) med skiftade maxima."""
    ut = m.copy()
    H, W = m.shape
    for dy in range(-r, r + 1):
        for dx in range(-r, r + 1):
            if dy == 0 and dx == 0: continue
            s = np.zeros_like(m)
            ys = slice(max(0, dy), H + min(0, dy)); yd = slice(max(0, -dy), H + min(0, -dy))
            xs = slice(max(0, dx), W + min(0, dx)); xd = slice(max(0, -dx), W + min(0, -dx))
            s[yd, xd] = m[ys, xs]
            ut |= s
    return ut


def lokal_spann(z, r=1):
    """max−min i (2r+1)² -fönster."""
    mx = z.copy(); mn = z.copy(); H, W = z.shape
    for dy in range(-r, r + 1):
        for dx in range(-r, r + 1):
            if dy == 0 and dx == 0: continue
            s = np.full_like(z, -1); t = np.full_like(z, 999)
            ys = slice(max(0, dy), H + min(0, dy)); yd = slice(max(0, -dy), H + min(0, -dy))
            xs = slice(max(0, dx), W + min(0, dx)); xd = slice(max(0, -dx), W + min(0, -dx))
            s[yd, xd] = z[ys, xs]; t[yd, xd] = z[ys, xs]
            mx = np.maximum(mx, s); mn = np.minimum(mn, t)
    return mx - mn


def hitta_piller(g, zon, x0=120, x1=600, pad_x=6, pad_y=6, h_min=40, h_max=85):
    """Ordcaption-pillret i en gråframe (Carl Vicentes mall 2026-09-05: VITT piller,
    svart/grå karaoke-text, centrerat nederst). Pillret hittas som en platt vit yta:
    per rad den längsta körningen av platta ljusa pixlar (luckor ≤ 40 px = glyfer),
    100–480 px bred och centrerad inom 360±60; sammanhängande sådana rader 40–85 px höga
    är pillret (checklistrutor/telefonskärm/pratbubblor är högre). Lägsta gruppen vinner.
    Returnerar [x0,y0,x1,y1] i bildpixlar eller None."""
    z = g[zon[0]:zon[1], x0:x1].astype(np.int16)
    platt = (z > 225) & (lokal_spann(z, 1) < 30)
    mitt = 360 - x0
    rader = []
    for y in range(z.shape[0]):
        kol = np.where(platt[y])[0]
        if len(kol) < 60: rader.append(None); continue
        bäst = None; s0 = kol[0]; p0 = kol[0]
        for x in kol[1:]:
            if x - p0 > 40:
                if bäst is None or p0 - s0 > bäst[1] - bäst[0]: bäst = (s0, p0)
                s0 = x
            p0 = x
        if bäst is None or p0 - s0 > bäst[1] - bäst[0]: bäst = (s0, p0)
        a, b = bäst
        rader.append((a, b) if 100 <= b - a <= 560 and abs((a + b) / 2 - mitt) <= 90 else None)
    # gruppera på radnärhet (luckor ≤ 45 px = textraderna, som inte är platta). Bredden =
    # yttersta kanterna i gruppen: står pillret mot vit båt/snö smälter kanten ihop med
    # bakgrunden, men att vitmåla vit bakgrund syns inte — därför är "för bred" ofarligt.
    grupper = []
    for y, r in enumerate(rader):
        if not r: continue
        g0 = grupper[-1] if grupper else None
        if g0 and y - g0[1] <= 45:
            grupper[-1] = (g0[0], y, min(g0[2], r[0]), max(g0[3], r[1]))
        else:
            grupper.append((y, y, r[0], r[1]))
    grupper = [gr for gr in grupper if h_min <= gr[1] - gr[0] <= h_max and gr[3] - gr[2] <= 560]
    if grupper:
        y0, y1, a, b = grupper[-1]
        return [x0 + int(a) - pad_x, zon[0] + y0 - pad_y, x0 + int(b) + pad_x, zon[0] + y1 + 1 + pad_y]
    # reserv: pillret står på vitt (recensionskort, snö) och smälter ihop med bakgrunden —
    # hitta i stället själva textraden (mörk text med ljus granne) och lägg pillrets marginal runt
    cand = (z < 90) & dilatera(z > 200, 2)
    rader2 = cand.sum(axis=1); ok = np.where(rader2 >= 4)[0]
    if len(ok) < 10: return None
    körn = []; start = ok[0]; prev = ok[0]
    for y in ok[1:]:
        if y - prev > 4: körn.append((start, prev)); start = y
        prev = y
    körn.append((start, prev))
    for y0, y1 in sorted(körn, key=lambda k: -k[0]):          # nedersta först
        if not (16 <= y1 - y0 <= 45): continue
        kol = np.where(cand[y0:y1 + 1].sum(axis=0) >= 1)[0]
        if len(kol) < 15: continue
        kl = []; s0 = kol[0]; p0 = kol[0]
        for x in kol[1:]:
            if x - p0 > 30: kl.append((s0, p0)); s0 = x
            p0 = x
        kl.append((s0, p0)); bx0, bx1 = max(kl, key=lambda k: k[1] - k[0])
        if not (50 <= bx1 - bx0 <= 480) or abs(x0 + (bx0 + bx1) / 2 - 360) > 60: continue
        runt = z[max(0, y0 - 14):y1 + 15, max(0, bx0 - 14):bx1 + 14]
        if runt.mean() < 170: continue                        # inte på ljus platta → inte ett piller
        return [x0 + bx0 - 16, zon[0] + y0 - 18, x0 + bx1 + 16, zon[0] + y1 + 18]
    return None


def main():
    if len(sys.argv) < 2: sys.exit(__doc__)
    K = json.load(open(sys.argv[1]))
    bas = os.path.dirname(os.path.abspath(sys.argv[1]))
    P = lambda p: p if os.path.isabs(p) else os.path.join(bas, p)
    ff = ffmpeg_bin()
    inn, ut = P(K['in']), P(K['ut'])
    W, H, fps, dur = ffinfo(ff, inn)
    C = K.get('captions') or {}
    zon = C.get('zon', [850, 1040]); pad_x = C.get('pad_x', 14); pad_y = C.get('pad_y', 16)
    av = C.get('av', [])

    # ---- pass 1: läs gråframes, hitta pillret per frame
    p = subprocess.Popen([ff, '-nostdin', '-v', 'error', '-i', inn, '-f', 'rawvideo', '-pix_fmt', 'gray', '-'],
                         stdout=subprocess.PIPE)
    boxar = []
    while True:
        buf = p.stdout.read(W * H)
        if len(buf) < W * H: break
        g = np.frombuffer(buf, dtype=np.uint8).reshape(H, W)
        t = len(boxar) / fps
        if K.get('srt') and not any(a <= t <= b for a, b in av):
            boxar.append(hitta_piller(g, zon, pad_x=pad_x, pad_y=pad_y))
        else:
            boxar.append(None)
    p.wait()
    N = len(boxar)
    # täpp enstaka luckor (≤3 frames) mellan två träffar
    for i in range(N):
        if boxar[i] is None:
            j = i
            while j < N and boxar[j] is None: j += 1
            if 0 < i and j < N and j - i <= 3:
                for k in range(i, j): boxar[k] = boxar[i - 1]
    träffar = sum(1 for b in boxar if b)
    print(f'{os.path.basename(inn)}: {N} frames @ {fps:g} fps, pillret hittat i {träffar} frames')

    # ---- pass 2: maskfil
    tmp = tempfile.mkdtemp(prefix='no-precis-')
    maskfil = os.path.join(tmp, 'mask.raw')        # statiska suddrutor → blur
    pillfil = os.path.join(tmp, 'piller.raw')      # ordcaption-pillret → vit platta (facit: vit ruta, svart text)
    statiska = [(b['rect'], b['t']) for b in K.get('blur', [])]
    fasta = [(b['rect'], b['t']) for b in C.get('fyll', [])]     # manuella pillerplattor (piller på vitt kollage)
    with open(maskfil, 'wb') as fh, open(pillfil, 'wb') as fp:
        for i, b in enumerate(boxar):
            m = np.zeros((H, W), dtype=np.uint8); q = np.zeros((H, W), dtype=np.uint8)
            t = i / fps
            if b:
                x0, y0, x1, y1 = (max(0, b[0]), max(0, b[1]), min(W, b[2]), min(H, b[3]))
                q[y0:y1, x0:x1] = 255
            for (x0, y0, x1, y1), (t0, t1) in statiska:
                if t0 <= t <= t1: m[y0:y1, x0:x1] = 255
            for (x0, y0, x1, y1), (t0, t1) in fasta:
                if t0 <= t <= t1: q[y0:y1, x0:x1] = 255
            fh.write(m.tobytes()); fp.write(q.tobytes())

    # ---- captions-ASS
    assfil = None
    if K.get('srt'):
        cues = del_cues(P(K['srt']), C.get('max_chars', 34))
        font_px = C.get('font_px', 30); padd = C.get('ruta_pad', 12)
        huvud = ('[Script Info]\nScriptType: v4.00+\n'
                 f'PlayResX: {W}\nPlayResY: {H}\nWrapStyle: 0\nScaledBorderAndShadow: yes\n\n'
                 '[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, '
                 'Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, '
                 'Alignment, MarginL, MarginR, MarginV, Encoding\n'
                 f'Style: NO,Liberation Sans,{font_px},&H00000000,&H00000000,&H00FFFFFF,&H00FFFFFF,'
                 f'-1,0,0,0,100,100,0,0,4,{padd},0,5,40,40,0,1\n\n'
                 '[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n')
        tvinga = C.get('tvinga', []) + [t for _, t in fasta]
        rader = []
        for k, (a, e, text) in enumerate(cues):
            i0, i1 = int(a * fps), max(int(a * fps) + 1, int(e * fps))
            # pillret tänds strax före och släcks strax efter talet: följ det (max till grann-cuen)
            lo = int(cues[k - 1][1] * fps) if k else 0
            hi = int(cues[k + 1][0] * fps) if k + 1 < len(cues) else N
            while i0 > lo and boxar[i0 - 1]: i0 -= 1
            while i1 < hi and boxar[i1]: i1 += 1
            iv = []
            for i in range(i0, min(i1, N)):
                if boxar[i]:
                    if iv and i - iv[-1][1] <= int(0.3 * fps): iv[-1][1] = i
                    else: iv.append([i, i])
            delar = [(s0 / fps, (s1 + 1) / fps) for s0, s1 in iv if s1 - s0 >= int(0.12 * fps)]
            for t0, t1 in tvinga:
                if a < t1 and e > t0: delar.append((max(a, t0), min(e, t1)))
            text = text.replace('\\', '').replace('{', '(').replace('}', ')')
            for s0, s1 in delar:
                cys = [(b[1] + b[3]) / 2 for b in boxar[int(s0 * fps):max(int(s0 * fps) + 1, int(s1 * fps))] if b]
                cy = float(np.median(cys)) if cys else C.get('standard_cy', 992)
                rader.append(f'Dialogue: 0,{ass_ts(s0)},{ass_ts(s1)},NO,,0,0,0,,{{\\an5\\pos({W / 2:.0f},{cy:.0f})}}{text}')
        assfil = os.path.join(tmp, 'captions.ass')
        open(assfil, 'w', encoding='utf-8').write(huvud + '\n'.join(rader) + '\n')
        print(f'  {len(rader)} norska caption-cues')

    # ---- ffmpeg
    cmd = [ff, '-y', '-nostdin', '-v', 'error', '-i', inn,
           '-f', 'rawvideo', '-pix_fmt', 'gray', '-video_size', f'{W}x{H}', '-framerate', f'{fps:g}', '-i', maskfil,
           '-f', 'rawvideo', '-pix_fmt', 'gray', '-video_size', f'{W}x{H}', '-framerate', f'{fps:g}', '-i', pillfil,
           '-f', 'lavfi', '-i', f'color=white:s={W}x{H}:r={fps:g}']
    lager = K.get('lager', [])
    for L in lager: cmd += ['-i', P(L['png'])]
    fc = ('[0:v]format=gbrp,split[a][b];[b]boxblur=14:3[bl];[1:v]format=gbrp[m];[2:v]format=gbrp[q];'
          '[3:v]format=gbrp[vit];[a][bl][m]maskedmerge[v00];[v00][vit][q]maskedmerge[v0]')
    cur = 'v0'
    for i, L in enumerate(lager):
        t0, t1 = L['t']
        fc += f";[{cur}][{i + 4}:v]overlay=0:0:format=rgb:enable='between(t,{t0},{t1})'[v{i + 1}]"
        cur = f'v{i + 1}'
    if assfil:
        fc += f';[{cur}]ass={assfil}[vs]'; cur = 'vs'
    fc += f';[{cur}]format=yuv420p[out]'
    os.makedirs(os.path.dirname(ut), exist_ok=True)
    cmd += ['-filter_complex', fc, '-map', '[out]', '-map', '0:a?', '-c:v', 'libx264', '-crf', '18', '-preset', 'medium',
            '-c:a', 'copy', '-shortest', '-movflags', '+faststart', ut]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0: sys.exit(f'ffmpeg: {r.stderr[-2000:]}')
    # ---- QA: kontaktark 1 fps + tre stillbilder
    subprocess.run([ff, '-y', '-nostdin', '-v', 'error', '-i', ut, '-vf', 'fps=1,scale=270:-1,tile=6x3', ut + '.ark.jpg'])
    for i, frac in enumerate((0.1, 0.5, 0.9), 1):
        subprocess.run([ff, '-y', '-nostdin', '-v', 'error', '-ss', f'{dur * frac:.2f}', '-i', ut, '-frames:v', '1', f'{ut}.qa-{i}.png'])
    json.dump({'frames': N, 'fps': fps, 'piller': [[int(v) for v in b] if b else None for b in boxar]}, open(ut + '.piller.json', 'w'))
    shutil.rmtree(tmp, ignore_errors=True)
    print('klart', ut)


if __name__ == '__main__':
    main()
