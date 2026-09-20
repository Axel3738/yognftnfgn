#!/usr/bin/env python3
"""inbrand-rita.py — RITAR om den inbrända texten i en video enligt en plan.

    python3 pipeline/omdubb/inbrand-rita.py <plan.json>

Planen skrivs av `pipeline/omdubb/inbrand.mjs` — aldrig för hand. Den säger
exakt vad som ska hända och NÄR, i källans egen tidsaxel:

  {"in": "kalla.mp4", "ut": "ny.mp4", "W": 720, "H": 1280,
   "forbjudna": ["carashell", "baverbutiken", …],
   "atgarder": [
     {"typ": "sudda", "rect": [x0,y0,x1,y1], "t": [t0,t1]},
     {"typ": "pop",   "platta": [x0,y0,x1,y1], "t": [t0,t1],
      "rader": [{"text": "819 KR.", "box": [x0,y0,x1,y1], "stryk": false}]},
     {"typ": "cue",   "rect": [x0,y0,x1,y1], "t": [t0,t1], "text": "819 kroner."}]}

Två behandlingar, för att det är TVÅ sorters text (skillnaden är lyft ur
US-bygget 2026-09-18, `market-expansion/ops/carashell/2026-09-18-us/video/`):

  * **sudda** — ordcaption-pillret nederst. Rutan fylls med en BLURRAD REMSA
    AV GRANNINNEHÅLLET, inte med en blur av rutan själv. `pipeline/no-captions.py`
    har facit i sitt huvud: blurrar man pillret på plats blir det "en vit smet
    som blinkar", för pillret ÄR en vit platta — en oskarp vit platta är
    fortfarande en vit platta.
  * **pop** — den stora texten mitt i bild. Kraftig blur i rutan, en mörk
    halvgenomskinlig platta ovanpå, och marknadens text i samma stil som
    källan (vit fet versal med röd kant). `rodtext()` i US-bygget, bevisad på
    fem live-annonser.
  * **cue** — marknadens ordcaption på pillrets plats (vit rundad platta,
    svart fet text; Beltesliper-facit). Används BARA när videon inte ska
    dubbas om — dubbningen tempo-anpassar segmenten, så en cue som lagts in
    här hade glidit ur synk. Se `inbrand.mjs` → `--cue`.

Brandspärren körs FÖRE första pixeln: `factory/slutkort.py:granska_brandord()`
på varje rad som ska ritas. Butikens namn eller domän i en annons stoppar
körningen — filen skrivs hellre inte alls (Axels beslut 2026-09-18).

⚠️ `ffprobe -select_streams` används aldrig (shim i containern). Måtten läses
ur `ffmpeg -i`:s stderr.

Beroenden: ffmpeg, numpy, Pillow. Inga nätanrop, inga krediter.
"""

import json
import os
import re
import shutil
import subprocess
import sys

import numpy as np

ROT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROT, 'factory'))

FET = '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'
ROD = (214, 30, 30, 255)
PLATTA = (10, 12, 16, 215)
VIT = (255, 255, 255, 255)
SVART = (20, 22, 26, 255)
# Cap-höjden i Liberation Sans Bold är ~0,72 av teckenstorleken (samma
# konstant som factory/slutkort.py och bygg-cap.py räknar med).
CAP = 0.72


class Fel(Exception):
    pass


def ffmpeg_bin():
    p = shutil.which('ffmpeg')
    if p:
        return p
    import imageio_ffmpeg
    return imageio_ffmpeg.get_ffmpeg_exe()


def ffinfo(fil):
    r = subprocess.run([ffmpeg_bin(), '-hide_banner', '-i', fil], capture_output=True, text=True)
    txt = r.stderr or ''
    m = re.search(r'Video:.*?(\d{3,5})x(\d{3,5})', txt)
    f = re.search(r'(\d+(?:\.\d+)?)\s+fps', txt)
    d = re.search(r'Duration: (\d+):(\d+):(\d+\.?\d*)', txt)
    if not (m and f and d):
        raise Fel(f'Kunde inte läsa måtten ur ffmpeg -i {os.path.basename(fil)}')
    har_ljud = 'Audio:' in txt
    langd = int(d[1]) * 3600 + int(d[2]) * 60 + float(d[3])
    return int(m[1]), int(m[2]), float(f[1]), langd, har_ljud


def typsnitt(storlek):
    from PIL import ImageFont
    if not os.path.exists(FET):
        raise Fel(f'TYPSNITT SAKNAS: {FET}. Installera Liberation Sans — text ritas '
                  'aldrig med ett annat typsnitt i tysthet.')
    return ImageFont.truetype(FET, max(6, int(storlek)))


def passa(text, maxbredd, maxhojd):
    """Största teckenstorlek som ryms i rutan. Höjden styr, bredden kapar."""
    s = max(8, int(maxhojd / CAP))
    f = typsnitt(s)
    while s > 8 and f.getlength(text) > maxbredd:
        s -= 2
        f = typsnitt(s)
    return f, s


def rita_rader(bild, rader, platta, sk):
    """Mörk platta + raderna i källans stil. bild: RGBA-PIL i full storlek."""
    from PIL import Image, ImageDraw
    lager = Image.new('RGBA', bild.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(lager)
    if platta:
        d.rounded_rectangle(platta, radius=max(8, int(28 * sk)), fill=PLATTA)
    for rad in rader:
        text = str(rad['text'])
        if not text:
            continue
        bx0, by0, bx1, by1 = rad['box']
        f, s = passa(text, (bx1 - bx0), (by1 - by0))
        w = f.getlength(text)
        asc, _ = f.getmetrics()
        x = (bx0 + bx1) / 2 - w / 2
        y = (by0 + by1) / 2 - asc * CAP / 2 - (asc - asc * CAP) * 0.15
        d.text((x, y), text, font=f, fill=VIT,
               stroke_width=max(3, int(s // 14)), stroke_fill=ROD)
        if rad.get('stryk'):
            ym = y + asc * CAP / 2
            d.line([(x - 10 * sk, ym), (x + w + 10 * sk, ym)], fill=ROD, width=max(4, int(s // 9)))
    bild.alpha_composite(lager)
    return bild


def rita_cue(bild, rect, text, sk):
    """Vit rundad platta med svart fet text — Beltesliper-facit (no-captions.py)."""
    from PIL import Image, ImageDraw
    x0, y0, x1, y1 = rect
    lager = Image.new('RGBA', bild.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(lager)
    inner_h = (y1 - y0) * 0.55
    f, _ = passa(text, (x1 - x0) * 0.94, inner_h)
    w = f.getlength(text)
    asc, _ = f.getmetrics()
    pad = max(8, int(10 * sk))
    px0 = max(0, (x0 + x1) / 2 - w / 2 - pad)
    px1 = min(bild.size[0], (x0 + x1) / 2 + w / 2 + pad)
    d.rounded_rectangle([px0, y0, px1, y1], radius=max(4, int(8 * sk)), fill=(255, 255, 255, 242))
    d.text(((x0 + x1) / 2 - w / 2, (y0 + y1) / 2 - asc * CAP / 2 - (asc - asc * CAP) * 0.15),
           text, font=f, fill=SVART)
    bild.alpha_composite(lager)
    return bild


def sudda(bild, rect, W, H):
    """Suddar rutan genom att SY IHOP grannarna över och under den.

    ⚠️ Tre försök, två förkastade efter att bildrutorna tittats på
    (2026-09-20, CaraShellRoof_CO_101_H1 vid 3,0 s):

      1. Blurra rutan på plats. Förkastad av `pipeline/no-captions.py`s huvud
         och av mätningen: pillret ÄR en ljus platta, och en oskarp ljus platta
         är fortfarande en ljus platta.
      2. Kopiera in en blurrad remsa UNDER rutan (no-captions.py:s bandmetod).
         Förkastad efter att bildrutan tittats på: bandet ligger över
         husvagnens vita tak medan remsan under är gräs, så lappen blev en
         grå-grön streckad rektangel med raka kanter — den syntes MER än
         texten den dolde.
      3. Den här: innehållet över rutan speglas ned, innehållet under speglas
         upp, de tonas in i varandra och blurras. Överkanten fortsätter alltså
         i överkantens färg och underkanten i underkantens, så det finns ingen
         kant att se. Sömmen smetas dessutom ut med en mjuk mask.
    """
    from PIL import Image, ImageDraw, ImageFilter
    x0, y0, x1, y1 = [int(v) for v in rect]
    h, b = y1 - y0, x1 - x0
    if h <= 0 or b <= 0:
        return bild

    def spegel(top, bot, vand):
        """Remsan utanför rutan, vänd så att raden närmast sömmen hamnar
        närmast sömmen. Saknas plats fylls det på med kanten själv."""
        top, bot = max(0, top), min(H, bot)
        bit = bild.crop((x0, top, x1, bot))
        if bit.height == 0:
            return None
        bit = bit.transpose(Image.FLIP_TOP_BOTTOM) if vand else bit
        if bit.height < h:                       # för nära bildkanten
            fyll = Image.new(bit.mode, (b, h))
            fyll.paste(bit.resize((b, h)), (0, 0))
            bit = fyll
        return bit.crop((0, 0, b, h))

    ovan = spegel(y0 - h, y0, True)              # sista raden ovanför → överst
    under = spegel(y1, y1 + h, True)             # första raden under → nederst
    if ovan is None and under is None:
        return bild
    if ovan is None:
        lapp = under
    elif under is None:
        lapp = ovan
    else:
        # linjär övertoning uppifrån och ned
        ramp = Image.linear_gradient('L').resize((b, h))
        lapp = Image.composite(under, ovan, ramp)
    # Suddningen görs LODRÄTT, inte åt alla håll. ⚠️ Mätt 2026-09-20: en
    # Gaussian med radie h/2,5 drog in bilden i de svarta letterbox-stolparna
    # (x < 62 och x > 657 i den här källan) så de blev olivgrå i bandet — ett
    # fel som syns direkt. Nedskalning i höjdled och upp igen smetar bara i
    # y-led, så varje kolumn behåller sin egen färg och stolparna förblir
    # svarta. Den lilla gaussen på slutet tar trappstegen.
    lapp = lapp.resize((b, max(2, h // 16)), Image.BILINEAR).resize((b, h), Image.BILINEAR)
    lapp = lapp.filter(ImageFilter.GaussianBlur(max(3, h // 12)))

    # Masken: helt täckande i mitten, mjuk ut mot kanterna. Rutan ritas ETT
    # fjäderdjup UTANFÖR lappen och blurras, så mitten blir kvar på 255 —
    # en blurrad ruta som ritats kant i kant hade släppt igenom texten
    # närmast kanten.
    fjader = max(4, h // 6)
    mask = Image.new('L', (b, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        [-fjader, -fjader, b - 1 + fjader, h - 1 + fjader],
        radius=max(2, min(b, h) // 5), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(fjader))
    bild.paste(lapp, (x0, y0), mask)
    return bild


def blurra(bild, rect):
    from PIL import ImageFilter
    x0, y0, x1, y1 = [int(v) for v in rect]
    if x1 <= x0 or y1 <= y0:
        return bild
    h = y1 - y0
    bild.paste(bild.crop((x0, y0, x1, y1)).filter(ImageFilter.GaussianBlur(max(10, h / 4))), (x0, y0))
    return bild


def granska(plan):
    """Brandspärren — samma funktion som slutkortet använder."""
    try:
        from slutkort import granska_brandord, forbjudna_ord, las_konfig, Fel as SlutkortsFel
    except ImportError as e:      # pragma: no cover
        raise Fel(f'Kunde inte läsa brandspärren ur factory/slutkort.py: {e}')
    # De förbjudna orden HÄRLEDS ur samma filer som slutkortets — aldrig ur en
    # lista i planen. Två sanningar hade tystnat på var sitt håll.
    forbjudna = list(plan.get('forbjudna') or [])
    if plan.get('produkt') and plan.get('butik'):
        try:
            forbjudna += forbjudna_ord(las_konfig(plan['produkt'], plan['butik'],
                                                  plan.get('marknad') or ''))
        except SlutkortsFel as e:
            raise Fel(str(e))
    texter = {}
    for i, a in enumerate(plan.get('atgarder') or []):
        for j, rad in enumerate(a.get('rader') or []):
            texter[f'åtgärd {i} rad {j}'] = str(rad.get('text') or '')
        if a.get('text'):
            texter[f'åtgärd {i}'] = str(a['text'])
    try:
        granska_brandord(texter, sorted(set(forbjudna)))
    except SlutkortsFel as e:
        raise Fel(str(e))
    return sorted(set(forbjudna))


def kor(plan):
    from PIL import Image
    inn, ut = plan['in'], plan['ut']
    W, H, fps, langd, har_ljud = ffinfo(inn)
    if plan.get('W') and (int(plan['W']) != W or int(plan['H']) != H):
        raise Fel(f'Planen är mätt på {plan["W"]}×{plan["H"]} men filen är {W}×{H}.')
    granska(plan)
    sk = W / 720.0
    atg = plan.get('atgarder') or []

    ff = ffmpeg_bin()
    las = subprocess.Popen([ff, '-v', 'error', '-i', inn, '-f', 'rawvideo',
                            '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
    skriv_argv = [ff, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24',
                  '-s', f'{W}x{H}', '-r', str(fps), '-i', '-']
    if har_ljud:
        skriv_argv += ['-i', inn, '-map', '0:v:0', '-map', '1:a:0', '-c:a', 'copy']
    skriv_argv += ['-c:v', 'libx264', '-preset', 'medium', '-crf', '18',
                   '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-shortest', ut]
    skriv = subprocess.Popen(skriv_argv, stdin=subprocess.PIPE)

    rad_bytes = W * H * 3
    i = 0
    rorda = 0
    try:
        while True:
            buf = las.stdout.read(rad_bytes)
            if not buf or len(buf) < rad_bytes:
                break
            t = i / fps
            aktiva = [a for a in atg if a['t'][0] <= t < a['t'][1]]
            if aktiva:
                bild = Image.frombytes('RGB', (W, H), buf).convert('RGBA')
                for a in aktiva:
                    if a['typ'] == 'sudda':
                        sudda(bild, a['rect'], W, H)
                    elif a['typ'] == 'cue':
                        # `sudda: false` när ett eget suddspann redan täcker
                        # rutan — då sparas en blur per bildruta.
                        if a.get('sudda', True):
                            sudda(bild, a['rect'], W, H)
                        rita_cue(bild, a['rect'], a.get('text') or '', sk)
                    elif a['typ'] == 'pop':
                        blurra(bild, a.get('platta') or a['rect'])
                        rita_rader(bild, a.get('rader') or [], a.get('platta'), sk)
                    else:
                        raise Fel(f'Okänd åtgärdstyp "{a["typ"]}" i planen.')
                skriv.stdin.write(bild.convert('RGB').tobytes())
                rorda += 1
            else:
                skriv.stdin.write(buf)
            i += 1
    finally:
        try:
            skriv.stdin.close()
        except BrokenPipeError:
            pass
        skriv.wait()
        las.stdout.close()
        las.wait()
    if skriv.returncode != 0:
        raise Fel(f'ffmpeg kunde inte skriva {ut} (kod {skriv.returncode}).')
    return {'ut': os.path.abspath(ut), 'rutor': i, 'rorda_rutor': rorda,
            'W': W, 'H': H, 'fps': fps, 'langd': round(langd, 3)}


def main():
    if len(sys.argv) != 2:
        sys.exit('Användning: inbrand-rita.py <plan.json>')
    with open(sys.argv[1], encoding='utf-8') as f:
        plan = json.load(f)
    try:
        json.dump(kor(plan), sys.stdout, ensure_ascii=False)
    except Fel as e:
        sys.exit(str(e))


if __name__ == '__main__':
    main()
