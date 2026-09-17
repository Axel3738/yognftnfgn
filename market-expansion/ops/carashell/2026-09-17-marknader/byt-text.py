#!/usr/bin/env python3
"""byt-text.py — byter EN textrad i en färdig annonsbild, utan att röra något annat.

Bakgrunden: takskyddets US-annonser kopierades till UK/CA/AU/NZ med amerikanska
priser inbrända i bilden. Basfotona (utan text) finns inte kvar, och bilderna är
byggda av två olika textmotorer (factory/bild-text.py och bildannonser/text.py),
så hela textlagret går inte att rita om från spec. Det här verktyget gör i stället
det minsta möjliga ingreppet: suddar EN rad och skriver dit en ny med samma stil.

    python3 byt-text.py --in a.png --ut b.png --spec regioner.json [--qa qa.png]

regioner.json = [{ "region": [x0,y0,x1,y1], "text": "NZ$355 → NZ$444",
                   "just": "auto|vanster|center|hoger",   (standard: auto)
                   "fet": true|false|null,                 (null = mät)
                   "bakgrund": [r,g,b]|null,               (null = mät)
                   "farg": [r,g,b]|null,                   (null = mät)
                   "storlek": <px>|null,                   (null = mät)
                   "genomstruken": false }]

Allt som är null MÄTS ur bilden i den angivna regionen:
  bakgrund  = vanligaste färgen (bilden är byggd med enfärgade plattor/band)
  färg      = medianen av de pixlar som avviker mest från bakgrunden (texten)
  storlek   = textens verkliga versalhöjd → fontstorlek via LiberationSans-mått
  justering = var textens bbox sitter i regionen (vänster/center/höger)

Regionen ska omsluta HELA raden med lite luft; verktyget hittar textens exakta
bbox inuti den och fyller bara den. Kör alltid med --qa och TITTA på bilden.

Beroenden: pillow, numpy.
"""
import argparse, json, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont

FET = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
NORMAL = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
for f in (FET, NORMAL):
    if not Path(f).exists():
        sys.exit(f"typsnitt saknas: {f}")


def vanligaste_farg(rut):
    """Vanligaste färgen i en ruta (bakgrunden på en enfärgad platta)."""
    px = rut.reshape(-1, 3)
    # kvantisera lätt så JPEG-brus inte splittrar samma färg
    q = (px // 4 * 4).astype(np.int32)
    nycklar = q[:, 0] * 65536 + q[:, 1] * 256 + q[:, 2]
    v, n = np.unique(nycklar, return_counts=True)
    top = v[np.argmax(n)]
    mask = nycklar == top
    return tuple(int(x) for x in px[mask].mean(axis=0).round())


def textmask(rut, bak, troskel=60):
    """Pixlar som avviker tydligt från bakgrunden = texten."""
    d = np.abs(rut.astype(np.int32) - np.array(bak, dtype=np.int32)).sum(axis=2)
    return d > troskel


def mat_rad(rut, bak):
    """bbox, färg och versalhöjd för texten i rutan. None om ingen text hittas."""
    m = textmask(rut, bak)
    if m.sum() < 8:
        return None
    ys, xs = np.where(m)
    y0, y1, x0, x1 = int(ys.min()), int(ys.max()), int(xs.min()), int(xs.max())
    # textfärgen: medianen av de 40 % mest avvikande pixlarna (kärnan, inte kanten)
    d = np.abs(rut.astype(np.int32) - np.array(bak, dtype=np.int32)).sum(axis=2)
    grans = np.quantile(d[m], 0.6)
    karna = m & (d >= grans)
    farg = tuple(int(x) for x in np.median(rut[karna], axis=0).round())
    return {"bbox": (x0, y0, x1, y1), "farg": farg, "hojd": y1 - y0 + 1}


def font_for_hojd(hojd, fet, prov="ABC199"):
    """Fontstorlek vars versalhöjd matchar den uppmätta texthöjden."""
    vag = FET if fet else NORMAL
    lo, hi = 6, 400
    while lo < hi:
        mid = (lo + hi + 1) // 2
        f = ImageFont.truetype(vag, mid)
        b = f.getbbox(prov)
        if (b[3] - b[1]) <= hojd:
            lo = mid
        else:
            hi = mid - 1
    return ImageFont.truetype(vag, lo)


def ar_fet(rut, bak):
    """Grov fet-detektor: andel textpixlar av bboxens area. Fet text är tätare."""
    m = textmask(rut, bak)
    if m.sum() < 8:
        return True
    ys, xs = np.where(m)
    area = (ys.max() - ys.min() + 1) * (xs.max() - xs.min() + 1)
    return (m.sum() / max(area, 1)) > 0.20


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--in", dest="inn", required=True)
    p.add_argument("--ut", required=True)
    p.add_argument("--spec", required=True)
    p.add_argument("--qa")
    p.add_argument("--json", action="store_true")
    a = p.parse_args()

    im = Image.open(a.inn).convert("RGB")
    fore = im.copy()
    arr = np.array(im)
    d = ImageDraw.Draw(im)
    spec = json.loads(Path(a.spec).read_text(encoding="utf-8"))
    rapport = []

    for i, r in enumerate(spec):
        x0, y0, x1, y1 = r["region"]
        rut = arr[y0:y1, x0:x1]
        bak = tuple(r["bakgrund"]) if r.get("bakgrund") else vanligaste_farg(rut)
        matt = mat_rad(rut, bak)
        if matt is None:
            rapport.append({"i": i, "status": "FEL", "skal": "ingen text i regionen", "region": r["region"]})
            continue
        bx0, by0, bx1, by1 = matt["bbox"]
        farg = tuple(r["farg"]) if r.get("farg") else matt["farg"]
        fet = r["fet"] if r.get("fet") is not None else ar_fet(rut, bak)
        hojd = r.get("storlek") or matt["hojd"]
        font = font_for_hojd(hojd, fet)
        # Marknadspriserna är bredare än de amerikanska ("NZ$355" mot "$199"), och en
        # rad som spränger sin platta är ett värre fel än en rad som är en aning mindre.
        # Krymp bara när raden inte ryms i REGIONEN (som ska vara plattans insida),
        # aldrig mot originaltextens bredd — då krympte varje rad i onödan.
        maxbredd = (x1 - x0) - r.get("marginal", 8)
        krympt = False
        while font.size > 8:
            b = font.getbbox(r["text"])
            if (b[2] - b[0]) <= maxbredd:
                break
            font = ImageFont.truetype(FET if fet else NORMAL, font.size - 1)
            krympt = True

        # justering: var satt originalet i regionen?
        just = r.get("just", "auto")
        if just == "auto":
            vanster_luft, hoger_luft = bx0, (x1 - x0) - bx1
            just = "center" if abs(vanster_luft - hoger_luft) <= max(6, (x1 - x0) * 0.05) else ("vanster" if vanster_luft < hoger_luft else "hoger")

        # sudda: fyll HELA regionen med bakgrunden (plattan är enfärgad)
        d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=bak)

        # rita den nya texten på originalets baslinje
        ny = r["text"]
        b = font.getbbox(ny)
        bredd = b[2] - b[0]
        if just == "center":
            nx = x0 + ((x1 - x0) - bredd) // 2 - b[0]
        elif just == "hoger":
            nx = x1 - bredd - b[0] - ((x1 - x0) - bx1)
        else:
            nx = x0 + bx0 - b[0]
        ny_y = y0 + by0 - b[1]
        d.text((nx, ny_y), ny, font=font, fill=farg)
        # Överstrykning: hela raden, eller bara de första N tecknen (ett jämförpris
        # som står först på en rad med två priser — "NZ$444 NZ$355").
        stryk = r.get("genomstruken")
        if stryk:
            n_tecken = r.get("genomstruken_tecken")
            del_text = ny[:n_tecken] if n_tecken else ny
            db = font.getbbox(del_text)
            mitt = ny_y + b[1] + (b[3] - b[1]) // 2
            tj = max(2, font.size // 14)
            d.line([(nx + b[0], mitt), (nx + db[2], mitt)], fill=farg, width=tj)
        rapport.append({"i": i, "status": "OK", "text": ny, "bakgrund": list(bak), "farg": list(farg),
                        "fet": bool(fet), "hojd": int(hojd), "storlek_px": font.size, "just": just,
                        "krympt": bool(krympt), "bbox_original": [int(bx0), int(by0), int(bx1), int(by1)],
                        "bredd_fore": int(bx1 - bx0 + 1), "bredd_efter": int(bredd)})

    im.save(a.ut)
    if a.qa:
        q = Image.new("RGB", (fore.width * 2 + 12, fore.height), "white")
        q.paste(fore, (0, 0)); q.paste(im, (fore.width + 12, 0))
        q.save(a.qa)
    fel = [x for x in rapport if x["status"] != "OK"]
    if a.json:
        print(json.dumps({"fil": a.ut, "rader": rapport, "fel": len(fel)}))
    else:
        for x in rapport:
            print(f"  {x['i']}: {x['status']} " + (f"\"{x.get('text','')}\" {x.get('storlek_px','')}px {'fet' if x.get('fet') else 'normal'} {x.get('just','')} bak={x.get('bakgrund')} färg={x.get('farg')} bredd {x.get('bredd_fore')}→{x.get('bredd_efter')}" if x["status"] == "OK" else x.get("skal", "")))
    sys.exit(1 if fel else 0)


if __name__ == "__main__":
    main()
