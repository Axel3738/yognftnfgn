#!/usr/bin/env python3
"""no-captions.py — bränner norska captions i Beltesliper-stilen (Axels facit 2026-09-02).

Facit = Beltesliper_NO_PD_3: ett UTSUDDAT band över hela bredden, exakt där den
svenska textremsan satt, och ovanpå det en textruta med VIT bakgrund och SVART
fet text, mitt i bandet. Inget av det svenska syns, ingen andra ruta.
Motexempel = Overvåkingskamera_NO_CS_1: svensk text kvar bakom en halvgenomskinlig
platta, norsk text i en egen ruta under — så får det ALDRIG se ut.

  python3 pipeline/no-captions.py <in.mp4> <in.srt> <out.mp4> [--band=Y0:Y1] [--font-px=46]
                                  [--max-chars=34] [--blur=12] [--no-check] [--rutor] [--font=NAMN]

  --font     typsnittet; utan flaggan väljs det ur SRT:ns skrift (japanska ⇒ Noto Sans CJK JP,
             kinesiska ⇒ Noto Sans CJK TC, båda feta och hämtade av pipeline/cjk.py; annars
             Liberation Sans). Japanska och kinesiska cues får högst hälften så många tecken
             (cover-srt.py), eftersom tecknen är dubbelt så breda.

  --rutor    (2026-09-28, Axel: "det suddiga tar upp för mycket av skärmen") sudda BARA rutan
             där källtexten står, och bara medan den står där — pipeline/textrutor.py mäter.
             Ersätter bandet över hela bredden. Mellanfilen mäts igen: källtext kvar = exit 3.

  <in.mp4>   den renderade (dubbade) videon från HeyGen
  <in.srt>   den lokaliserade, verifierade norska SRT:n
  --band     bandets övre/nedre kant i källpixlar. Utan flaggan mäts bandet i videon
             (2 fps, ljusa textrader i zonen 1250–1650); hittas inget: 1388:1500.
             Talen gäller 1080×1920 och skalas om efter källans höjd (720×1280 ⇒ 833–1100,
             standard 925:1000); --font-px är 46 vid 1080 i bredd och skalas likadant.

Bandet suddas genom att en remsa intilliggande bildinnehåll (under bandet, annars
ovanför) blurras och läggs över bandet hela videon — INTE genom att sudda den
svenska texten på plats (då blir det en vit smet som blinkar). Innehåller båda
grannremsorna text blurras bandet på plats i stället, hårt.

Gör efteråt en kontroll av resultatet: skannar 60 px ovanför och under bandet efter
textrader (svensk text som sticker ut) och sparar tre QA-bilder <out>.qa-N.png
(10/50/90 % in i videon) som ska TITTAS på innan leverans. Exit 3 = kontrollen
hittade text utanför bandet → kör om med större band (--band).

Beroenden: ffmpeg med libass (systemets, annars imageio-ffmpeg:s binär), numpy.
"""
import os, re, shutil, subprocess, sys, tempfile

HÄR = os.path.dirname(os.path.abspath(__file__))
STANDARDBAND = (1388, 1500)   # mätt i Temu-källorna 2026-08-29..30 (y 1396–1490 + marginal)
ZON = (1250, 1650)            # var källcaptions brukar sitta i 1080×1920
MARGINAL = 8                  # px ovanför/under uppmätt text
RUTA_PADDING = 14             # px vit ruta runt texten


def ffmpeg_bin():
    p = shutil.which('ffmpeg')
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


def band_ur_profil(frac, H, h0):
    skala = h0 / H
    band = []; y = 0
    while y < H:
        if frac[y] > 0.25:
            y0 = y
            while y < H and frac[y] > 0.10: y += 1
            band.append((int(y0 * skala), int(y * skala)))
        else:
            y += 1
    return band


def text_i(frac, H, h0, lo, hi):
    """Finns textrader i pixelintervallet lo..hi?"""
    if frac is None: return False
    skala = h0 / H
    r0, r1 = max(0, int(lo / skala)), min(H, int(hi / skala))
    return r1 > r0 and float(frac[r0:r1].max()) > 0.25


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


# Typsnittet följer skriften (2026-09-30, Japan och Taiwan): Liberation Sans saknar japanska och
# kinesiska tecken, och libass fallback valde då ett typsnitt per tecken — ojämn text. Kana ⇒
# IPAGothic, kinesiska tecken utan kana ⇒ WenQuanYi Zen Hei (båda finns i containern, fc-list).
CJK_TECKEN = re.compile(r'[\u3040-\u30ff\u3400-\u9fff\uf900-\ufaff]')
KANA_TECKEN = re.compile(r'[\u3040-\u30ff]')


def typsnitt_for(text, flag=None):
    """Fet Noto Sans CJK (JP/TC) hämtas och registreras av cjk.py; går det inte används
    IPAGothic/WenQuanYi, som finns i containern men bara i normal vikt."""
    if flag and flag.get('--font'): return str(flag['--font'])
    if len(CJK_TECKEN.findall(text)) < 4: return 'Liberation Sans'
    lang = 'ja' if KANA_TECKEN.search(text) else 'zh'
    try:
        sys.path.insert(0, HÄR)
        import cjk
        return cjk.typsnittsnamn(lang)
    except Exception as e:
        print(f'  (Noto Sans CJK gick inte att hämta: {e} — reservtypsnitt)', file=sys.stderr)
        return 'IPAGothic' if lang == 'ja' else 'WenQuanYi Zen Hei'


def skriv_ass(cues, path, w, h, band, font_px, font='Liberation Sans'):
    """ASS med PlayRes = videons mått, så Fontsize, Outline och \\pos är i riktiga pixlar.
    BorderStyle 4 = en vit ruta runt hela textblocket (Outline = padding), svart fet text.
    \\an5 + \\pos centrerar rutan (1 eller 2 rader) mitt i bandet."""
    cy = (band[0] + band[1]) / 2
    marg = 40
    huvud = (
        '[Script Info]\nScriptType: v4.00+\n'
        f'PlayResX: {w}\nPlayResY: {h}\nWrapStyle: 0\nScaledBorderAndShadow: yes\n\n'
        '[V4+ Styles]\n'
        'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, '
        'Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, '
        'Alignment, MarginL, MarginR, MarginV, Encoding\n'
        f'Style: NO,{font},{font_px},&H00000000,&H00000000,&H00FFFFFF,&H00FFFFFF,'
        f'-1,0,0,0,100,100,0,0,4,{RUTA_PADDING},0,5,{marg},{marg},0,1\n\n'
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


def rutlage(ff, src, srt, out, w0, h0, dur, font_px, max_chars, flag):
    """Axels dom 2026-09-28 på bandet: "Kan du göra så att det suddiga inte är så himla
    stort? Det tar upp för mycket av skärmen vilket är onödigt." Här suddas bara rutan där
    källtexten faktiskt står, och bara medan den står där (pipeline/textrutor.py mäter).

    Två pass: (1) bara suddet → mellanfil, som mäts igen — hittas källtext kvar är det exit 3;
    (2) captions ovanpå mellanfilen. Captionrutan står mitt i källtextens typiska höjd."""
    import importlib.util, json
    spec = importlib.util.spec_from_file_location('textrutor', os.path.join(HÄR, 'textrutor.py'))
    tr = importlib.util.module_from_spec(spec); spec.loader.exec_module(tr)
    res = tr.mat(src)
    seg = [dict(s) for s in res['segment']]
    if not seg: sys.exit('--rutor: ingen inbränd text hittades — kör utan --rutor eller med --band.')
    # Luft i tid, och vid varje byte står den gamla rutan kvar 0,25 s in i nästa (mätt
    # 2026-09-28: en tvåradstext syntes 0,2 s under rutan när den ersattes av en enradstext).
    for s in seg: s['a'] = max(0.0, s['a'] - 0.15); s['b'] = min(dur, s['b'] + 0.15)
    for i in range(len(seg) - 1):
        if seg[i + 1]['a'] - seg[i]['b'] < 0.5: seg[i]['b'] = min(dur, max(seg[i]['b'], seg[i + 1]['a'] + 0.25))
    blur = int(flag.get('--blur', 14))
    kedja, ingangar = [], []
    for i, s in enumerate(seg):
        x0, y0, x1, y1 = s['ruta']; w, h = x1 - x0, y1 - y0
        w -= w % 2; h -= h % 2
        if y1 + 4 + h <= h0: sy, varifran = y1 + 4, 'under'
        elif y0 - 4 - h >= 0: sy, varifran = y0 - 4 - h, 'ovanför'
        else: sy, varifran = y0, 'på plats'
        s['varifran'] = varifran
        # boxblur tål inte en radie större än halva rutan (kroma: en fjärdedel) — små rutor får mindre.
        lr = max(1, min(blur, h // 2 - 1, w // 2 - 1)); cr = max(1, min(blur, h // 4 - 1, w // 4 - 1))
        # Mjuka kanter: alfa rampar från 0 till 255 över de yttersta F px, så att rutan smälter
        # in i bilden i stället för att synas som en lapp. Marginalen runt texten (textrutor.py)
        # är större än F, så själva texten täcks alltid helt.
        F = 8
        kedja.append(f"[k{i}]crop={w}:{h}:{x0}:{sy},boxblur=luma_radius={lr}:luma_power=2:chroma_radius={cr}:chroma_power=2,"
                     f"format=yuva420p,geq=lum='p(X,Y)':cb='p(X,Y)':cr='p(X,Y)':a='255*min(1,min(min(X,W-1-X),min(Y,H-1-Y))/{F})'[s{i}]")
        ingangar.append((f's{i}', x0, y0, s['a'], s['b']))
    fg = f"[0:v]split={len(seg) + 1}[v0]" + ''.join(f'[k{i}]' for i in range(len(seg))) + ';' + ';'.join(kedja)
    for i, (namn, x, y, a, b) in enumerate(ingangar):
        fg += f";[v{i}][{namn}]overlay={x}:{y}:enable='between(t,{a:.3f},{b:.3f})'[v{i + 1}]"
    tmp = tempfile.mkdtemp(prefix='no-captions-rutor-')
    mellan = os.path.join(tmp, 'sudd.mp4')
    r = subprocess.run([ff, '-nostdin', '-y', '-v', 'error', '-i', src, '-filter_complex', fg, '-map', f'[v{len(seg)}]',
                        '-map', '0:a?', '-c:v', 'libx264', '-crf', '16', '-preset', 'medium', '-c:a', 'copy', mellan],
                       stdin=subprocess.DEVNULL)
    if r.returncode != 0: sys.exit(f'ffmpeg (sudd) misslyckades: {src}')
    # Efterkontrollen är strängare än mätningen: två bilder i rad (0,2 s) med text räcker.
    kvar = tr.blinkar(mellan)
    yta = sum((s['b'] - s['a']) * (s['ruta'][2] - s['ruta'][0]) * (s['ruta'][3] - s['ruta'][1]) for s in seg) / (dur * w0 * h0)
    # Captionrutan: mitt i källtextens höjd, viktat på hur länge varje ruta står.
    vikt = sum(s['b'] - s['a'] for s in seg)
    cy = sum(((s['ruta'][1] + s['ruta'][3]) / 2) * (s['b'] - s['a']) for s in seg) / vikt
    halv = int(font_px * 1.25 + RUTA_PADDING + 12)
    band = (int(cy - halv), int(cy + halv))
    cues, tmp2 = cover_srt(srt, max_chars)
    if not cues: sys.exit('SRT:n gav inga cues.')
    font = typsnitt_for(' '.join(c[2] for c in cues), flag)
    ass = os.path.join(tmp2, 'no.ass'); skriv_ass(cues, ass, w0, h0, band, font_px, font)
    ass_esc = ass.replace('\\', '\\\\').replace(':', '\\:').replace("'", "\\'")
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    r = subprocess.run([ff, '-nostdin', '-y', '-v', 'error', '-i', mellan, '-vf', f'subtitles={ass_esc}',
                        '-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-c:a', 'copy', out], stdin=subprocess.DEVNULL)
    if r.returncode != 0: sys.exit(f'ffmpeg (captions) misslyckades: {src}')
    json.dump({'segment': seg, 'kvar': kvar, 'yta': yta, 'band': band}, open(out + '.rutor.json', 'w'), indent=1)
    print(f'✓ {out}  {len(seg)} suddrutor (i snitt {100 * yta:.1f} % av bilden), captions kring y {int(cy)}, {len(cues)} cues, typsnitt {font}')
    if '--no-check' in flag: return
    bilder = qa_bilder(ff, out, dur)
    print('  QA-bilder att titta på: ' + ', '.join(os.path.basename(b) for b in bilder))
    if kvar:
        print('  ❌ källtext kvar efter suddet: ' + '; '.join(f"{k['a']:.1f}–{k['b']:.1f} s y {k['ruta'][1]}–{k['ruta'][3]}" for k in kvar), file=sys.stderr)
        sys.exit(3)
    print('  ✓ ingen källtext hittad efter suddet')


def main():
    pos = [a for a in sys.argv[1:] if not a.startswith('--')]
    flag = {a.split('=')[0]: (a.split('=', 1)[1] if '=' in a else True) for a in sys.argv[1:] if a.startswith('--')}
    if len(pos) != 3: sys.exit(__doc__)
    src, srt, out = pos
    ff = ffmpeg_bin()
    w0, h0, dur = ffprobe_dim(ff, src)
    # Konstanterna ovan är mätta i 1080×1920. En källa i annan upplösning (Matstrumpors
    # UGC är 720×1280, mätt 2026-09-28) skalas om — annars letade zonen 1250–1650 efter
    # text nedanför bildens kant och standardbandet 1388:1500 hamnade utanför bilden.
    ky, kx = h0 / 1920, w0 / 1080
    zon = (round(ZON[0] * ky), round(ZON[1] * ky))
    standardband = (round(STANDARDBAND[0] * ky), round(STANDARDBAND[1] * ky))
    marginal = max(4, round(MARGINAL * ky))
    font_px = int(flag.get('--font-px', round(46 * kx)))
    max_chars = int(flag.get('--max-chars', 34))
    blur = int(flag.get('--blur', 12))

    if '--rutor' in flag:
        return rutlage(ff, src, srt, out, w0, h0, dur, font_px, max_chars, flag)

    frac, H = skanna(ff, src, w0, h0)
    if '--band' in flag:
        y0, y1 = (int(x) for x in str(flag['--band']).split(':')); källa = 'flagga'
    else:
        i_zon = [b for b in band_ur_profil(frac, H, h0) if zon[0] < b[0] < zon[1]] if frac is not None else []
        if i_zon:
            y0 = min(b[0] for b in i_zon) - marginal; y1 = max(b[1] for b in i_zon) + marginal
            källa = f'uppmätt {y0}:{y1}'
        else:
            (y0, y1), källa = standardband, 'standard (ingen text i zonen)'
    # bandet måste rymma två rader text i vit ruta med luft
    behov = int(2 * font_px * 1.25 + 2 * RUTA_PADDING + 24)
    if y1 - y0 < behov:
        mitt = (y0 + y1) // 2; y0, y1 = mitt - behov // 2, mitt + behov // 2
        källa += f', höjt till {y0}:{y1} för två rader'
    y0 = max(0, y0); y1 = min(h0, y1)
    band = (y0, y1); h = y1 - y0

    # var tas den suddade remsan ifrån? Under bandet först, annars ovanför.
    # Innehåller båda text: blurra bandet på plats, hårt.
    if y1 + 4 + h <= h0 and not text_i(frac, H, h0, y1 + 4, y1 + 4 + h):
        remsa_y, remsa = y1 + 4, 'remsa under bandet'
    elif y0 - 4 - h >= 0 and not text_i(frac, H, h0, y0 - 4 - h, y0 - 4):
        remsa_y, remsa = y0 - 4 - h, 'remsa ovanför bandet'
    else:
        remsa_y, remsa, blur = y0, 'bandet självt (grannarna har text)', max(blur, 30)

    cues, tmp = cover_srt(srt, max_chars)
    if not cues: sys.exit('SRT:n gav inga cues.')
    font = typsnitt_for(' '.join(c[2] for c in cues), flag)
    ass = os.path.join(tmp, 'no.ass'); skriv_ass(cues, ass, w0, h0, band, font_px, font)

    ass_esc = ass.replace('\\', '\\\\').replace(':', '\\:').replace("'", "\\'")
    vf = (f"split[a][b];[b]crop=iw:{h}:0:{remsa_y},boxblur={blur}:{max(2, blur // 5)}[sudd];"
          f"[a][sudd]overlay=0:{y0}[band];[band]subtitles={ass_esc}")
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    r = subprocess.run([ff, '-nostdin', '-y', '-v', 'error', '-i', src, '-filter_complex', vf,
                        '-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-c:a', 'copy', out],
                       stdin=subprocess.DEVNULL)
    if r.returncode != 0: sys.exit(f'ffmpeg misslyckades: {src}')
    print(f'✓ {out}  band {y0}:{y1} ({källa}), sudd: {remsa} (blur {blur}), {len(cues)} cues')

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
