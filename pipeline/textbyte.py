#!/usr/bin/env python3
"""textbyte.py — byter inbrända textrutor mot nya på ett annat språk, i samma stil och på samma plats.

Byggt 2026-09-28 för Matstrumpors egna videor (se textboxar.py). En ny ruta ritas med minst den
gamla rutans bredd och höjd, centrerad där den gamla stod, så att den gamla täcks helt av en ny
ruta i samma färg — ingen suddning behövs för solida rutor. Rutor som ska bort utan att ersättas
på samma ställe (t.ex. undertexter som får ny tajming efter en ny röst) suddas i stället, bara
rutan och bara medan den syns.

  python3 pipeline/textbyte.py <plan.json>

plan.json:
  {"video": "in.mp4", "ut": "ut.mp4", "font": "pipeline/fonts/Poppins-Bold.ttf",
   "sudda": [{"a": 0.0, "b": 2.0, "ruta": [x0, y0, x1, y1]}],
   "texter": [{"a": 0.0, "b": 2.0, "text": "…", "mitt": [cx, cy], "min": [w, h], "max_bredd": 600,
               "font_px": 38, "farg": [255,255,255], "bakgrund": [246,132,38,255], "radie": 10, "pad": [18, 8]}]}

Skriver ut.mp4 (libx264 crf 18, ljudet kopieras) och ut.qa-N.png (en bild mitt i varje text).
"""
import json, os, shutil, subprocess, sys, tempfile

from PIL import Image, ImageDraw, ImageFont


def radbryt(text, font, max_bredd):
    """Bryter på ord så att varje rad får plats i max_bredd px. Ett ord som ensamt är för brett står själv."""
    rader, rad = [], ''
    for ord_ in text.split():
        prov = (rad + ' ' + ord_).strip()
        if font.getlength(prov) <= max_bredd or not rad: rad = prov
        else: rader.append(rad); rad = ord_
    if rad: rader.append(rad)
    return rader


def rita_ruta(t, fontfil):
    """En RGBA-bild med rutan och texten. Returnerar (bild, bredd, höjd)."""
    font = ImageFont.truetype(fontfil, t['font_px'])
    padx, pady = t.get('pad', [18, 8])
    maxb = t.get('max_bredd', 600) - 2 * padx
    rader = []
    for stycke in t['text'].split('\n'): rader += radbryt(stycke, font, maxb)
    asc, desc = font.getmetrics()
    radh = int((asc + desc) * t.get('radavstand', 1.05))
    textb = max(int(font.getlength(r)) for r in rader)
    w = max(textb + 2 * padx, int(t.get('min', [0, 0])[0]))
    h = max(radh * len(rader) + 2 * pady, int(t.get('min', [0, 0])[1]))
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    bg = t.get('bakgrund', [255, 255, 255, 255])
    d.rounded_rectangle([0, 0, w - 1, h - 1], radius=t.get('radie', 10), fill=tuple(bg))
    y0 = (h - radh * len(rader)) // 2
    for i, r in enumerate(rader):
        x = (w - font.getlength(r)) / 2
        d.text((x, y0 + i * radh), r, font=font, fill=tuple(t.get('farg', [0, 0, 0])))
    return im, w, h, rader


def kor(plan):
    ff = shutil.which('ffmpeg')
    tmp = tempfile.mkdtemp(prefix='textbyte-')
    inputs = ['-i', plan['video']]
    filt, senaste, n = [], '[0:v]', 1
    # 1) sudda gamla rutor (bara rutan, bara medan den syns)
    for i, s in enumerate(plan.get('sudda', [])):
        x0, y0, x1, y1 = s['ruta']
        x0, y0 = max(0, x0 - 6), max(0, y0 - 6)
        w, h = x1 - x0 + 12, y1 - y0 + 12
        # boxblur tål högst halva sidan i luma och en fjärdedel i chroma (yuv420) — annars vägrar ffmpeg
        lr = max(2, min(min(w, h) // 3, min(w, h) // 2 - 1)); cr = max(1, min(lr // 2, min(w, h) // 4 - 1))
        filt.append(f"{senaste}split[bas{i}][kalla{i}];[kalla{i}]crop={w}:{h}:{x0}:{y0},"
                    f"boxblur=luma_radius={lr}:luma_power=3:chroma_radius={cr}:chroma_power=3[bl{i}];"
                    f"[bas{i}][bl{i}]overlay={x0}:{y0}:enable='between(t,{s['a']:.2f},{s['b']:.2f})'[s{i}]")
        senaste = f'[s{i}]'
    # 2) nya rutor
    qa = []
    for i, t in enumerate(plan['texter']):
        im, w, h, rader = rita_ruta(t, plan['font'])
        f = os.path.join(tmp, f't{i}.png'); im.save(f)
        cx, cy = t['mitt']
        x, y = int(round(cx - w / 2)), int(round(cy - h / 2))
        inputs += ['-loop', '1', '-i', f]
        filt.append(f"{senaste}[{n}:v]overlay={x}:{y}:shortest=1:enable='between(t,{t['a']:.2f},{t['b']:.2f})'[t{i}]")
        senaste = f'[t{i}]'; n += 1
        qa.append(((t['a'] + t['b']) / 2, rader))
    cmd = [ff, '-nostdin', '-y', '-v', 'error'] + inputs + ['-filter_complex', ';'.join(filt), '-map', senaste, '-map', '0:a?',
           '-c:v', 'libx264', '-crf', '18', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'copy', '-movflags', '+faststart', plan['ut']]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode: sys.exit(f'ffmpeg: {r.stderr[-800:]}')
    for k, (t, rader) in enumerate(qa, 1):
        subprocess.run([ff, '-nostdin', '-v', 'error', '-y', '-ss', f'{t:.2f}', '-i', plan['ut'], '-frames:v', '1', f"{plan['ut']}.qa-{k}.png"])
    shutil.rmtree(tmp, ignore_errors=True)
    return qa


if __name__ == '__main__':
    plan = json.load(open(sys.argv[1]))
    for t, rader in kor(plan): print(f'{t:5.1f} s: ' + ' / '.join(rader))
