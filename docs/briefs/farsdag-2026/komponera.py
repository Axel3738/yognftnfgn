#!/usr/bin/env python3
"""Fars dag-bilderna för de fyra hubbar bildrutinen inte läste 2026-09-28
(Solcellslampa, Golfkalender, Taljset, Rodholder). Ramverket nivå 1/2:
produktens riktiga foto, texten som vektortext ordagrant ur briefens Design
brief. Ingen bildmodell.

    FD_BILDMAPP=<mapp> [FD_VAR=2_2] python3 komponera.py [Namn …]

Produktfotot ligger som <mapp>/<Namn>.jpg (briefens Assets-länk, produktsidans
eget foto). Fiskespöhållaren är <mapp>/rod_orange.png: EN orange hållare
utklippt ur produktsidans foto "Fyra färgalternativ", ritad fyra gånger (ett
4-pack är en färg, och alla andra foton bär en människa eller inbränd text).
FD_VAR=2_2 bygger rubrikvarianten ur <Namn>_FD_2_2/brief.md."""
import json, os, re, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

REPO = Path(__file__).parent
MAPP = Path(os.environ.get('FD_BILDMAPP', REPO / 'bilder'))
FET = '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'
NORM = '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf'
BG = (241, 237, 230)
MORK = (20, 18, 16)
GRA = (74, 68, 62)
ROD = (200, 16, 46)
VAR = os.environ.get('FD_VAR', '2_1')  # 2_2 = rubrikvarianten


def las_design(namn):
    md = (REPO / f'{namn}_FD_{VAR}' / 'brief.md').read_text(encoding='utf-8')
    rader = {}
    for r in md.split('## Design brief', 1)[1].split('**Assets:**', 1)[0].splitlines():
        c = [x.strip() for x in r.strip().strip('|').split('|')]
        if len(c) == 4 and c[2] not in ('—', 'Swedish (use this)', '---'):
            rader[c[0]] = c[2]
    return rader


def font(p, s):
    return ImageFont.truetype(p, s)


def bryt(text, f, maxb, d):
    ord_, rader, rad = text.split(), [], ''
    for o in ord_:
        t = f'{rad} {o}'.strip()
        if d.textlength(t, font=f) <= maxb:
            rad = t
        else:
            rader.append(rad); rad = o
    rader.append(rad)
    return rader


def passa(text, p, s, maxb, maxr, d, minsta=24):
    while s >= minsta:
        f = font(p, s); r = bryt(text, f, maxb, d)
        if len(r) <= maxr:
            return f, r
        s -= 2
    f = font(p, minsta)
    return f, bryt(text, f, maxb, d)


def rubrikrader(text, f, maxb, d):
    # Ramverket steg 3.4: bryt vid kolon, annars där raderna blir jämnast — aldrig ett ensamt ord.
    if ':' in text:
        a, b = text.split(':', 1)
        rader = [a + ':', b.strip()]
        if all(d.textlength(r, font=f) <= maxb for r in rader):
            return rader
    ord_ = text.split()
    bast = None
    for i in range(1, len(ord_)):
        rader = [' '.join(ord_[:i]), ' '.join(ord_[i:])]
        w = [d.textlength(r, font=f) for r in rader]
        if max(w) <= maxb and (bast is None or max(w) < bast[0]):
            bast = (max(w), rader)
    return bast[1] if bast else bryt(text, f, maxb, d)


def jamna(text, f, maxb, d):
    ord_ = text.split()
    bast = None
    for i in range(1, len(ord_)):
        rader = [' '.join(ord_[:i]), ' '.join(ord_[i:])]
        w = [d.textlength(r, font=f) for r in rader]
        if max(w) <= maxb and (bast is None or max(w) < bast[0]):
            bast = (max(w), rader)
    return bast[1] if bast else bryt(text, f, maxb, d)


def rh(f):
    b = f.getbbox('ÅjgÄ')
    return int((b[3] - b[1]) * 1.32)


def produktbild(namn):
    if namn == 'Rodholder':
        t = Image.open(MAPP / 'rod_orange.png').convert('RGB')
        pad = 30
        g = Image.new('RGB', (t.width * 2 + pad, t.height * 2 + pad), 'white')
        for i in range(4):
            g.paste(t, ((i % 2) * (t.width + pad), (i // 2) * (t.height + pad)))
        return g
    im = Image.open(MAPP / f'{namn}.jpg').convert('RGB')
    # Beskär bort fotots vita marginal så produkten fyller kortet.
    b = im.convert('L').point(lambda v: 255 if v < 245 else 0).getbbox()
    m = 12
    return im.crop((max(0, b[0] - m), max(0, b[1] - m), min(im.width, b[2] + m), min(im.height, b[3] + m)))


def rita(namn, bredd, hojd):
    ds = las_design(namn)
    bild = Image.new('RGB', (bredd, hojd), BG)
    d = ImageDraw.Draw(bild)
    M = 40
    inner = bredd - 2 * M - 2 * 40
    kompakt = hojd <= bredd
    # Textrutan
    fr, rr = passa(ds['Headline'], FET, 52 if kompakt else 66, inner, 2, d)
    rr = rubrikrader(ds['Headline'], fr, inner, d)
    fs, rs = passa(ds['Sub-line'], NORM, 28 if kompakt else 34, inner, 2, d)
    if len(rs) == 2:
        rs = jamna(ds['Sub-line'], fs, inner, d)
    pad = 28 if kompakt else 36
    ruta_h = pad + rh(fr) * len(rr) + 12 + rh(fs) * len(rs) + pad - 6
    d.rounded_rectangle([M, M, bredd - M, M + ruta_h], radius=28, fill='white')
    y = M + pad
    for r in rr:
        d.text((bredd / 2, y), r, font=fr, fill=MORK, anchor='ma'); y += rh(fr)
    y += 12
    for r in rs:
        d.text((bredd / 2, y), r, font=fs, fill=GRA, anchor='ma'); y += rh(fs)
    # Prisbandet
    pris = ds['Price band']
    stor, liten = pris.split(', ', 1)
    fp = font(FET, 76 if kompakt else 96)
    fl = font(NORM, 36 if kompakt else 44)
    fb = font(FET, 34 if kompakt else 42)
    bp = 20 if kompakt else 28
    band_h = bp + rh(fp) + 8 + rh(fb) + bp
    band_y = hojd - M - band_h
    d.rounded_rectangle([M, band_y, bredd - M, hojd - M], radius=28, fill='white')
    wstor = d.textlength(stor + ',', font=fp)
    wlit = d.textlength(' ' + liten, font=fl)
    x0 = (bredd - wstor - wlit) / 2
    ytop = band_y + bp
    d.text((x0, ytop + rh(fp) * 0.78), stor + ',', font=fp, fill=MORK, anchor='ls')
    d.text((x0 + wstor, ytop + rh(fp) * 0.78), ' ' + liten, font=fl, fill=GRA, anchor='ls')
    d.text((bredd / 2, ytop + rh(fp) + 8), ds['Bottom line'], font=fb, fill=ROD, anchor='ma')
    # Produktkortet
    kort_y0 = M + ruta_h + 20
    kort_y1 = band_y - 20
    d.rounded_rectangle([M, kort_y0, bredd - M, kort_y1], radius=28, fill='white')
    fbad = font(FET, 36 if kompakt else 40)
    tb = ds['Badge']
    bw, bh = d.textlength(tb, font=fbad) + 48, rh(fbad) + 26
    bx, by = M + 22, kort_y0 + 22
    p = produktbild(namn)
    # Tre ramar: hela kortet, till höger om badgen, under badgen. Den som ger
    # störst produkt utan att badgen täcker något vinner.
    kx0, kx1, ky0, ky1 = M + 26, bredd - M - 26, kort_y0 + 22, kort_y1 - 22
    def placera(x0, y0, x1, y1):
        sk = min((x1 - x0) / p.width, (y1 - y0) / p.height)
        w, h = p.width * sk, p.height * sk
        px, py = x0 + (x1 - x0 - w) / 2, y0 + (y1 - y0 - h) / 2
        krock = px < bx + bw + 8 and py < by + bh + 8
        return sk, (int(px), int(py), int(w), int(h)), krock
    kandidater = [placera(kx0, ky0, kx1, ky1), placera(bx + bw + 16, ky0, kx1, ky1), placera(kx0, by + bh + 14, kx1, ky1)]
    sk, (px, py, pw, ph), _ = max((k for k in kandidater if not k[2]), key=lambda k: k[0])
    bild.paste(p.resize((pw, ph), Image.LANCZOS), (px, py))
    # Badgen, övre vänstra hörnet av produktkortet
    d.rounded_rectangle([bx, by, bx + bw, by + bh], radius=bh // 2, fill=ROD)
    d.text((bx + 24, by + 13), tb, font=fbad, fill='white')
    ut = MAPP / 'ut' / (f'{namn}_FD_{VAR}' + ('_1x1' if kompakt else '') + '.jpg')
    ut.parent.mkdir(exist_ok=True)
    for q in (92, 88, 84):
        bild.save(ut, 'JPEG', quality=q, subsampling=0, optimize=True)
        if ut.stat().st_size < 2 * 1024 * 1024:
            break
    return ut, [ds['Badge'], ds['Headline'], ds['Sub-line'], stor + ',', liten, ds['Bottom line']]


if __name__ == '__main__':
    specar = []
    for namn in sys.argv[1:] or ['Solcellslampa', 'Golfkalender', 'Taljset', 'Rodholder']:
        for b, h in ((1080, 1350), (1080, 1080)):
            ut, texter = rita(namn, b, h)
            print('✓', ut.name)
            specar.append({'bild': 'x', 'ut': f'{namn}_FD_{VAR}.png', 'block': [{'text': t} for t in texter]})
    (MAPP / 'textspec.json').write_text(json.dumps(specar, ensure_ascii=False, indent=1), encoding='utf-8')
