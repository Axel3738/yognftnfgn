#!/usr/bin/env python3
"""no-captions.py — bränner norska captions i Beltesliper-stilen (Axels facit 2026-09-02).

Facit = Beltesliper_NO_PD_3: ETT heltäckande, helsvart band över hela bredden,
exakt där den svenska textremsan satt, med vit fet text mitt i bandet.
Inget av det svenska syns, ingen suddig kopia, ingen andra ruta.
Motexempel = Overvåkingskamera_NO_CS_1: svensk text kvar bakom en halvgenomskinlig
platta, norsk text i en egen ruta under — så får det ALDRIG se ut.

  python3 pipeline/no-captions.py <in.mp4> <in.srt> <out.mp4> [--band=Y0:Y1] [--band-when=always|cues]
                                  [--font-px=46] [--max-chars=34] [--no-check]

  <in.mp4>   den renderade (dubbade) videon från HeyGen
  <in.srt>   den lokaliserade, verifierade norska SRT:n
  --band     bandets övre/nedre kant i källpixlar. Utan flaggan mäts bandet i videon
             (2 fps, ljusa textrader i zonen 1250–1650); hittas inget: 1388:1500.
  --band-when always (default): bandet ligger hela videon — källcaptions syns nästan
             hela tiden i Temu-materialet, och ett tomt svart band är alltid bättre
             än en svensk rad som blinkar fram. cues: bara medan en cue visas.

Gör efteråt en kontroll av resultatet: skannar 60 px ovanför och under bandet efter
textrader (svensk text som sticker ut) och sparar tre QA-bilder <out>.qa-N.png
(10/50/90 % in i videon) som ska TITTAS på innan leverans. Exit 3 = kontrollen
hittade text utanför bandet → kör om med större band (--band).

Beroenden: ffmpeg med libass (systemets, annars imageio-ffmpeg:s binär), numpy.
"""
import json, os, re, shutil, subprocess, sys, tempfile

HÄR = os.path.dirname(os.path.abspath(__file__))
STANDARDBAND = (1388, 1500)   # mätt i Temu-källorna 2026-08-29..30 (y 1396–1490 + marginal)
ZON = (1250, 1650)            # var källcaptions brukar sitta i 1080×1920
MARGINAL = 8                  # px ovanför/under uppmätt text


def ffmpeg_bin():
    for namn in ('ffmpeg',):
        p = shutil.which(namn)
        if p: return p
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        sys.exit('ffmpeg saknas (installera ffmpeg eller `pip install imageio-ffmpeg`).')


def ffprobe_dim(ff, path):
    """Bredd, höjd och längd (s) via ffmpeg -i (ffprobe följer inte alltid med binären)."""
    r = subprocess.run([ff, '-hide_banner', '-i', path], capture_output=True, text=True)
    m = re.search(r'Video:.*?(\d{3,5})x(\d{3,5})', r.stderr)
    d = re.search(r'Duration: (\d+):(\d+):(\d+\.\d+)', r.stderr)
    if not m or not d: sys.exit(f'kunde inte läsa videons mått: {path}')
    dur = int(d[1]) * 3600 + int(d[2]) * 60 + float(d[3])
    return int(m[1]), int(m[2]), dur


def skanna(ff, path, w0, h0):
    """Andel frames per rad (2 fps, 270 px bred gråskala) som ser ut som ljus text.
    Radkriteriet ur translate-skillen: 40 < vita pixlar < 240 vid 270 px bredd."""
    import numpy as np
    W = 270
    H = round(h0 * W / w0)
    p = subprocess.run([ff, '-nostdin', '-v', 'error', '-i', path, '-vf', f'fps=2,scale={W}:-1',
                        '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], capture_output=True)
    n = len(p.stdout) // (W * H)
    if n == 0: return None, H
    frames = np.frombuffer(p.stdout[:n * W * H], dtype=np.uint8).reshape(n, H, W)
    vita = (frames > 230).sum(axis=2)
    textig = (vita > 40) & (vita < 240)
    return textig.mean(axis=0), H


def hitta_band(ff, path, w0, h0):
    frac, H = skanna(ff, path, w0, h0)
    if frac is None: return STANDARDBAND, 'standard (tom skanning)'
    skala = h0 / H
    band = []; y = 0
    while y < H:
        if frac[y] > 0.25:
            y0 = y
            while y < H and frac[y] > 0.10: y += 1
            band.append((int(y0 * skala), int(y * skala)))
        else:
            y += 1
    i_zon = [b for b in band if ZON[0] < b[0] < ZON[1]]
    if not i_zon: return STANDARDBAND, 'standard (ingen text i zonen)'
    y0 = min(b[0] for b in i_zon) - MARGINAL
    y1 = max(b[1] for b in i_zon) + MARGINAL
    return (y0, y1), f'uppmätt {y0}:{y1}'


def parse_ts(t):
    h, m, s = t.split(':'); s, ms = s.split(',')
    return int(h) * 3600 + int(m) * 60 + int(s) + int(ms) / 1000


def ass_ts(x):
    h = int(x // 3600); m = int(x % 3600 // 60); s = x % 60
    return f'{h:d}:{m:02d}:{s:05.2f}'


def cover_srt(src, max_chars):
    """Gapless cover-SRT via pipeline/cover-srt.py (max 2 rader, cues utan luckor)."""
    tmp = tempfile.mkdtemp(prefix='no-captions-')
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


def skriv_ass(cues, path, w, h, band, font_px):
    """ASS med PlayRes = videons mått, så Fontsize och \\pos är i riktiga pixlar.
    \\an5 + \\pos centrerar textblocket (1 eller 2 rader) mitt i bandet."""
    cy = (band[0] + band[1]) / 2
    marg = 40
    huvud = (
        '[Script Info]\nScriptType: v4.00+\n'
        f'PlayResX: {w}\nPlayResY: {h}\nWrapStyle: 0\nScaledBorderAndShadow: yes\n\n'
        '[V4+ Styles]\n'
        'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, '
        'Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, '
        'Alignment, MarginL, MarginR, MarginV, Encoding\n'
        f'Style: NO,Liberation Sans,{font_px},&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,'
        f'-1,0,0,0,100,100,0,0,1,0,0,5,{marg},{marg},0,1\n\n'
        '[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n'
    )
    rader = []
    for a, e, text in cues:
        text = text.replace('\\', '').replace('{', '(').replace('}', ')')
        rader.append(f'Dialogue: 0,{ass_ts(a)},{ass_ts(e)},NO,,0,0,0,,{{\\an5\\pos({w / 2:.0f},{cy:.0f})}}{text}')
    open(path, 'w', encoding='utf-8').write(huvud + '\n'.join(rader) + '\n')


def kontrollera(ff, out, w0, h0, band):
    """Textrader 60 px ovanför/under bandet i RESULTATET = svenskt som sticker ut."""
    frac, H = skanna(ff, out, w0, h0)
    if frac is None: return []
    skala = h0 / H
    fel = []
    for namn, lo, hi in (('ovanför', band[0] - 60, band[0] - 2), ('under', band[1] + 2, band[1] + 60)):
        r0, r1 = max(0, int(lo / skala)), min(H, int(hi / skala))
        if r1 > r0 and float(frac[r0:r1].max()) > 0.25:
            fel.append(f'text {namn} bandet (rad {int(r0 * skala)}–{int(r1 * skala)}, {frac[r0:r1].max():.0%} av frames)')
    return fel


def qa_bilder(ff, out, dur):
    bilder = []
    for i, andel in enumerate((0.1, 0.5, 0.9), 1):
        png = f'{out}.qa-{i}.png'
        subprocess.run([ff, '-nostdin', '-v', 'error', '-y', '-ss', f'{dur * andel:.2f}', '-i', out,
                        '-frames:v', '1', '-vf', 'scale=360:-1', png], stdin=subprocess.DEVNULL)
        if os.path.exists(png): bilder.append(png)
    return bilder


def main():
    pos = [a for a in sys.argv[1:] if not a.startswith('--')]
    flag = {a.split('=')[0]: (a.split('=', 1)[1] if '=' in a else True) for a in sys.argv[1:] if a.startswith('--')}
    if len(pos) != 3: sys.exit(__doc__)
    src, srt, out = pos
    font_px = int(flag.get('--font-px', 46))
    max_chars = int(flag.get('--max-chars', 34))
    band_when = flag.get('--band-when', 'always')
    ff = ffmpeg_bin()
    w0, h0, dur = ffprobe_dim(ff, src)

    if '--band' in flag:
        y0, y1 = (int(x) for x in str(flag['--band']).split(':')); källa = 'flagga'
    else:
        (y0, y1), källa = hitta_band(ff, src, w0, h0)
    # bandet måste rymma två rader text med luft
    behov = int(2 * font_px * 1.25 + 24)
    if y1 - y0 < behov:
        mitt = (y0 + y1) // 2; y0, y1 = mitt - behov // 2, mitt + behov // 2
        källa += f', höjt till {y0}:{y1} för två rader'
    y0 = max(0, y0); y1 = min(h0, y1)
    band = (y0, y1)

    cues, tmp = cover_srt(srt, max_chars)
    if not cues: sys.exit('SRT:n gav inga cues.')
    ass = os.path.join(tmp, 'no.ass'); skriv_ass(cues, ass, w0, h0, band, font_px)

    box = f'drawbox=x=0:y={y0}:w=iw:h={y1 - y0}:color=black:t=fill'
    if band_when == 'cues':
        box += ":enable='" + '+'.join(f'between(t,{a:.3f},{e:.3f})' for a, e, _ in cues) + "'"
    ass_esc = ass.replace('\\', '\\\\').replace(':', '\\:').replace("'", "\\'")
    vf = f"{box},subtitles={ass_esc}"
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    r = subprocess.run([ff, '-nostdin', '-y', '-v', 'error', '-i', src, '-vf', vf,
                        '-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-c:a', 'copy', out],
                       stdin=subprocess.DEVNULL)
    if r.returncode != 0: sys.exit(f'ffmpeg misslyckades: {src}')
    print(f'✓ {out}  band {y0}:{y1} ({källa}), {len(cues)} cues, band {band_when}')

    if '--no-check' in flag:
        return
    bilder = qa_bilder(ff, out, dur)
    print('  QA-bilder att titta på: ' + ', '.join(os.path.basename(b) for b in bilder))
    fel = kontrollera(ff, out, w0, h0, band)
    if fel:
        print('  ❌ ' + '; '.join(fel) + ' — kör om med större --band', file=sys.stderr)
        sys.exit(3)
    print('  ✓ ingen text utanför bandet')


if __name__ == '__main__':
    main()
