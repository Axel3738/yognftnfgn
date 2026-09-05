#!/usr/bin/env python3
"""no-captions-precis.py — norska captions + utbytt inbränd grafik, ruta för ruta.

Regeln (Axel 2026-09-05, "du har täckt hela skärmen"): sudda BARA rutan där den
svenska texten faktiskt sitter, och bara medan den syns. Aldrig helbreddsband.
Det här skriptet gör det som en enda ffmpeg-körning styrd av en spec-fil:

  python3 pipeline/no-captions-precis.py <in.mp4> <in.srt> <spec.json> <out.mp4>

spec.json:
{
  "caption": {                       # ordcaption-pillen (finns i nästan alla frames)
    "band": [y0, y1], "x": [x0, x1], # pillens ruta i källpixlar (mätt, inte gissad)
    "storlek": 30, "max_tecken": 30  # norsk text: vit ruta, svart fet text, max 2 rader
  },
  "boxar": [                         # övrig grafik, en post per ruta och tidsintervall
    { "box": [x0, y0, x1, y1], "fran": 16.9, "till": 19.4,
      "fyll": [253, 181, 7],         # fyll rutan med en färg … (null = sudda på plats)
      "granne": "under",             # … eller "under"/"over": blurrad grannremsa (som no-captions.py)
      "text": "899 KR",              # eller "rader": ["Hva er", "dyrest"]
      "stil": { "storlek": 62, "fet": true, "farg": [20, 20, 20], "kant": null, "kantpx": 0,
                "justering": "mitt", "kursiv": false, "font": "Liberation Sans",
                "ruta": null, "stryk": false, "radavstand": 1.05, "dy": 0 } }
  ]
}
Captionpillen suddas hela videon (den ligger där hela tiden) men BARA i pillens egen
ruta (x-intervallet + 12 px, y + 8 px) — med en blurrad remsa av innehållet under
(annars ovanför), aldrig svensk text suddad på plats. Boxarna suddas/fylls bara
mellan `fran` och `till`. Texten läggs med en ASS-fil (\\pos, PlayRes = källmått).
Skriver <out>.qa-N.png: 10/50/90 % + mitten av varje box-intervall. LÄS DEM.
Beroenden: ffmpeg med libass (imageio-ffmpeg:s binär duger), numpy ej nödvändigt.
"""
import json, os, re, shutil, subprocess, sys, tempfile

HÄR = os.path.dirname(os.path.abspath(__file__))


def ffmpeg_bin():
    p = shutil.which('ffmpeg')
    if p: return p
    import imageio_ffmpeg
    return imageio_ffmpeg.get_ffmpeg_exe()


def ffprobe_dim(ff, path):
    r = subprocess.run([ff, '-hide_banner', '-i', path], capture_output=True, text=True)
    m = re.search(r'Video:.*?(\d{3,5})x(\d{3,5})', r.stderr)
    d = re.search(r'Duration: (\d+):(\d+):(\d+\.\d+)', r.stderr)
    if not m or not d: sys.exit(f'kunde inte läsa videons mått: {path}')
    return int(m[1]), int(m[2]), int(d[1]) * 3600 + int(d[2]) * 60 + float(d[3])


def parse_ts(t):
    h, m, s = t.split(':'); s, ms = s.split(',')
    return int(h) * 3600 + int(m) * 60 + int(s) + int(ms) / 1000


def ass_ts(x):
    x = max(0.0, x)
    return f'{int(x // 3600):d}:{int(x % 3600 // 60):02d}:{x % 60:05.2f}'


def ass_col(rgb, alpha=0):
    r, g, b = rgb
    return f'&H{alpha:02X}{b:02X}{g:02X}{r:02X}'


def cover_srt(src, max_chars):
    """Gapless cover-SRT via pipeline/cover-srt.py (max 2 rader, cues utan luckor)."""
    tmp = tempfile.mkdtemp(prefix='no-captions-precis-')
    kopia = os.path.join(tmp, 'in.srt'); shutil.copy(src, kopia)
    r = subprocess.run([sys.executable, os.path.join(HÄR, 'cover-srt.py'), kopia, f'--max={max_chars}'],
                       capture_output=True, text=True)
    made = kopia.replace('.srt', '-cover.srt')
    if r.returncode != 0 or not os.path.exists(made): sys.exit(f'cover-srt misslyckades: {r.stderr}')
    cues = []
    for block in re.split(r'\n\n+', open(made, encoding='utf-8').read().strip()):
        rader = block.strip().split('\n')
        if len(rader) < 3: continue
        a, e = (parse_ts(x) for x in rader[1].split(' --> '))
        cues.append((a, e, ' '.join(rader[2:]).strip()))
    return cues, tmp


def boxblur(radie, kraft, bw, bh):
    """boxblur med radier som ffmpeg accepterar: luma ≤ min(w,h)/2−1, chroma (halv upplösning
    i yuv420) ≤ min(w,h)/4−1 — annars 'Invalid chroma_param radius' (mätt 2026-09-05)."""
    lr = max(1, min(radie, min(bw, bh) // 2 - 1))
    cr = max(1, min(radie, min(bw, bh) // 4 - 1))
    return f'boxblur=lr={lr}:lp={kraft}:cr={cr}:cp={kraft}'


def esc(text):
    return text.replace('\\', '').replace('{', '(').replace('}', ')')


def main():
    if len(sys.argv) != 5: sys.exit(__doc__)
    src, srt, specfil, out = sys.argv[1:]
    spec = json.load(open(specfil, encoding='utf-8'))
    ff = ffmpeg_bin()
    w, h, dur = ffprobe_dim(ff, src)

    filt = []
    styles = []
    events = []
    steg = 0
    cur = '[0:v]'

    # ---- captionpillen: blurrad grannremsa över pillens ruta, hela videon
    cap = spec.get('caption')
    if cap:
        y0, y1 = cap['band']; x0, x1 = cap['x']
        y0 -= 8; y1 += 8; x0 -= 12; x1 += 12
        y0, x0 = max(0, y0), max(0, x0); y1, x1 = min(h, y1), min(w, x1)
        bh, bw = y1 - y0, x1 - x0
        if y1 + 4 + bh <= h: ry = y1 + 4
        elif y0 - 4 - bh >= 0: ry = y0 - 4 - bh
        else: ry = y0
        storlek = int(cap.get('storlek', 30)); maxc = int(cap.get('max_tecken', 30))
        cues, tmp = cover_srt(srt, maxc)
        if not cues: sys.exit('SRT:n gav inga cues.')
        # Suddet ligger bara medan det talas (källans ordcaptions följer talet) — annars
        # står en tom suddad remsa kvar över slutkortet (mätt 2026-09-05, IBC/kamera).
        t0, t1 = max(0.0, cues[0][0] - 0.15), cues[-1][1] + 0.15
        filt.append(f'{cur}split=2[c{steg}a][c{steg}b];[c{steg}b]crop={bw}:{bh}:{x0}:{ry},{boxblur(14, 3, bw, bh)}[c{steg}s];'
                    f"[c{steg}a][c{steg}s]overlay={x0}:{y0}:enable='between(t,{t0:.2f},{t1:.2f})'[v{steg}]")
        cur = f'[v{steg}]'; steg += 1
        cy = (cap['band'][0] + cap['band'][1]) / 2
        styles.append(f'Style: CAP,Liberation Sans,{storlek},{ass_col((0, 0, 0))},{ass_col((0, 0, 0))},'
                      f'{ass_col((255, 255, 255))},{ass_col((255, 255, 255))},-1,0,0,0,100,100,0,0,4,12,0,5,40,40,0,1')
        for a, e, t in cues:
            events.append(f'Dialogue: 0,{ass_ts(a)},{ass_ts(e)},CAP,,0,0,0,,{{\\an5\\pos({w / 2:.0f},{cy:.0f})}}{esc(t)}')
    else:
        tmp = tempfile.mkdtemp(prefix='no-captions-precis-')

    # ---- boxarna: fyll eller sudda, bara mellan fran och till
    for i, b in enumerate(spec.get('boxar', [])):
        x0, y0, x1, y1 = [int(v) for v in b['box']]
        a, e = float(b['fran']), float(b['till'])
        en = f"enable='between(t,{a:.2f},{e:.2f})'"
        bw, bh = x1 - x0, y1 - y0
        if b.get('ingen_sudd'):
            pass                                   # bara text — rutan är redan fylld av en tidigare box
        elif b.get('fyll'):
            r, g, bl = b['fyll']
            filt.append(f'{cur}drawbox=x={x0}:y={y0}:w={bw}:h={bh}:color=0x{r:02X}{g:02X}{bl:02X}@1:t=fill:{en}[v{steg}]')
        else:
            gr = b.get('granne')
            if gr == 'under' and y1 + 4 + bh <= h: ry = y1 + 4
            elif gr == 'over' and y0 - 4 - bh >= 0: ry = y0 - 4 - bh
            else: ry = y0
            blur = 30 if ry == y0 else 14
            filt.append(f'{cur}split=2[b{i}a][b{i}b];[b{i}b]crop={bw}:{bh}:{x0}:{ry},{boxblur(blur, max(3, blur // 5), bw, bh)}[b{i}s];'
                        f'[b{i}a][b{i}s]overlay={x0}:{y0}:{en}[v{steg}]')
        if not b.get('ingen_sudd'):
            cur = f'[v{steg}]'; steg += 1
        rader = b.get('rader') or ([b['text']] if b.get('text') else [])
        if not rader: continue
        s = b.get('stil', {})
        storlek = int(s.get('storlek', 40)); fet = -1 if s.get('fet', True) else 0
        kursiv = -1 if s.get('kursiv') else 0
        farg = ass_col(s.get('farg', [20, 20, 20]))
        kant = s.get('kant'); kantpx = int(s.get('kantpx', 0)) if kant else 0
        ruta = s.get('ruta')
        if ruta: border, outline, back = 3, int(s.get('rutapx', 10)), ass_col(ruta)
        else: border, outline, back = 1, kantpx, ass_col(kant or [0, 0, 0])
        outcol = ass_col(kant) if kant else (ass_col(ruta) if ruta else ass_col([0, 0, 0]))
        just = s.get('justering', 'mitt')
        an = {'mitt': 5, 'vanster': 4, 'hoger': 6}[just]
        font = s.get('font', 'Liberation Sans')
        styles.append(f'Style: B{i},{font},{storlek},{farg},{farg},{outcol},{back},{fet},{kursiv},0,0,100,100,0,0,'
                      f'{border},{outline},0,{an},0,0,0,1')
        lh = storlek * float(s.get('radavstand', 1.1))
        cy = (y0 + y1) / 2 + float(s.get('dy', 0)) - lh * (len(rader) - 1) / 2
        cx = {'mitt': (x0 + x1) / 2, 'vanster': x0 + int(s.get('indrag', 12)), 'hoger': x1 - int(s.get('indrag', 12))}[just]
        for k, rad in enumerate(rader):
            tag = '{\\s1}' if s.get('stryk') else ''
            events.append(f'Dialogue: 1,{ass_ts(a)},{ass_ts(e)},B{i},,0,0,0,,{{\\an{an}\\pos({cx:.0f},{cy + k * lh:.0f})}}{tag}{esc(rad)}')

    ass = os.path.join(tmp, 'precis.ass')
    open(ass, 'w', encoding='utf-8').write(
        '[Script Info]\nScriptType: v4.00+\n' f'PlayResX: {w}\nPlayResY: {h}\nWrapStyle: 2\nScaledBorderAndShadow: yes\n\n'
        '[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, '
        'Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, '
        'Alignment, MarginL, MarginR, MarginV, Encoding\n' + '\n'.join(styles) +
        '\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n' + '\n'.join(events) + '\n')
    ass_esc = ass.replace('\\', '\\\\').replace(':', '\\:').replace("'", "\\'")
    filt.append(f'{cur}subtitles={ass_esc}[ut]')
    vf = ';'.join(filt)
    os.makedirs(os.path.dirname(os.path.abspath(out)) or '.', exist_ok=True)
    r = subprocess.run([ff, '-nostdin', '-y', '-v', 'error', '-i', src, '-filter_complex', vf, '-map', '[ut]', '-map', '0:a?',
                        '-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-c:a', 'copy', out],
                       stdin=subprocess.DEVNULL, capture_output=True, text=True)
    if r.returncode != 0: sys.exit(f'ffmpeg misslyckades: {r.stderr[-800:]}')
    shutil.copy(ass, out + '.ass')
    tider = [dur * 0.1, dur * 0.5, dur * 0.9] + [(float(b['fran']) + float(b['till'])) / 2 for b in spec.get('boxar', [])]
    qa = []
    for n, t in enumerate(tider, 1):
        png = f'{out}.qa-{n}.png'
        subprocess.run([ff, '-nostdin', '-v', 'error', '-y', '-ss', f'{t:.2f}', '-i', out, '-frames:v', '1', '-vf', 'scale=360:-1', png],
                       stdin=subprocess.DEVNULL)
        if os.path.exists(png): qa.append(os.path.basename(png))
    print(f'✓ {out}: caption {cap["band"] if cap else "–"}, {len(spec.get("boxar", []))} boxar, {len(events)} ASS-rader · QA: {", ".join(qa)}')


if __name__ == '__main__':
    main()
