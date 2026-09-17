#!/usr/bin/env python3
"""lager.py — textlagret för Sushi-Strumpors batch #3 (samma tanke som
factory/bild-text.py, men i vinnarbildens stil: vit fet rubrik med skugga direkt
på fotot, mindre underrad, röd pill-badge med versaler — exakt som
MATSTRUMP_sushi_offer_static_d3_v1, kontots bästa bild).

    python3 lager.py --bas <foto.png> --ut <mapp> --namn <annonsnamn> --spec '<json>'

spec: {"rubrik": "...", "underrad": "...", "badge": "KÖP 1 – FÅ 1 GRATIS",
       "siffra": "2 576" (valfri, jättestor överst), "etikett": "OBS: INTE SUSHI" (valfri,
       roterad röd etikett mitt i bilden), "badge_pos": "nere-mitten"|"nere-hoger"|"nere-vanster",
       "textfarg": "#FFFFFF", "skugga": true}
Skriver <mapp>/<namn>_4x5.png (1080×1350) och <mapp>/<namn>_1x1.png (1080×1080).
Typsnitt: DejaVu Sans Bold — å/ä/ö garanterat.
"""
import argparse, json, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

FET = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
NORMAL = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
ROD = (200, 16, 46, 255)


def font(storlek, fet=True):
    return ImageFont.truetype(FET if fet else NORMAL, max(10, int(storlek)))


def radbryt(draw, text, f, maxb):
    ord_, rader, rad = text.split(), [], ""
    for o in ord_:
        prov = (rad + " " + o).strip()
        if draw.textlength(prov, font=f) <= maxb or not rad:
            rad = prov
        else:
            rader.append(rad); rad = o
    if rad: rader.append(rad)
    return rader


def passa(draw, text, storlek, maxb, maxrader, minst):
    while storlek > minst:
        f = font(storlek); rader = radbryt(draw, text, f, maxb)
        if len(rader) <= maxrader and all(draw.textlength(r, font=f) <= maxb for r in rader):
            return f, rader
        storlek -= 4
    f = font(minst); return f, radbryt(draw, text, f, maxb)


def skuggtext(bild, xy, text, f, farg, ankare="ma", skugga=True):
    """Text med mjuk mörk skugga (läsbar på ljus och mörk bakgrund)."""
    if skugga:
        lager = Image.new("RGBA", bild.size, (0, 0, 0, 0))
        d = ImageDraw.Draw(lager)
        d.text((xy[0] + 3, xy[1] + 5), text, font=f, fill=(0, 0, 0, 200), anchor=ankare)
        lager = lager.filter(ImageFilter.GaussianBlur(6))
        bild.alpha_composite(lager)
    ImageDraw.Draw(bild).text(xy, text, font=f, fill=farg, anchor=ankare)


def pill(bild, text, f, cx, cy, bak=ROD, farg=(255, 255, 255, 255), padx=None, pady=None):
    d = ImageDraw.Draw(bild)
    b = d.textbbox((0, 0), text, font=f)
    tw, th = b[2] - b[0], b[3] - b[1]
    padx = padx or int(th * 1.1); pady = pady or int(th * 0.55)
    w, h = tw + 2 * padx, th + 2 * pady
    lager = Image.new("RGBA", bild.size, (0, 0, 0, 0)); ld = ImageDraw.Draw(lager)
    ld.rounded_rectangle((cx - w / 2 + 4, cy - h / 2 + 6, cx + w / 2 + 4, cy + h / 2 + 6), radius=h / 2, fill=(0, 0, 0, 120))
    lager = lager.filter(ImageFilter.GaussianBlur(5)); bild.alpha_composite(lager)
    d = ImageDraw.Draw(bild)
    d.rounded_rectangle((cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2), radius=h / 2, fill=bak)
    d.text((cx, cy - b[1] / 2 - th / 2 + th / 2), text, font=f, fill=farg, anchor="mm")
    return h


def rita(bas, spec, W, H):
    bild = bas.convert("RGBA").resize((W, H), Image.LANCZOS)
    d = ImageDraw.Draw(bild)
    farg = tuple(int(spec.get("textfarg", "#FFFFFF").lstrip("#")[i:i + 2], 16) for i in (0, 2, 4)) + (255,)
    skugga = spec.get("skugga", True)
    marg = int(W * 0.06); y = int(H * float(spec.get("text_y", 0.055)))
    if spec.get("siffra"):
        f = font(W * 0.30)
        skuggtext(bild, (W / 2, y), spec["siffra"], f, farg, ankare="ma", skugga=skugga)
        y += int(W * 0.30 * 1.05)
    if spec.get("rubrik"):
        f, rader = passa(d, spec["rubrik"], W * float(spec.get("rubrik_max", 0.085)), W - 2 * marg, 3, W * 0.05)
        for r in rader:
            skuggtext(bild, (W / 2, y), r, f, farg, ankare="ma", skugga=skugga)
            y += int(f.size * 1.18)
        y += int(W * 0.012)
    if spec.get("underrad"):
        f, rader = passa(d, spec["underrad"], W * 0.040, W - 2 * marg, 2, W * 0.03)
        for r in rader:
            skuggtext(bild, (W / 2, y), r, f, farg, ankare="ma", skugga=skugga)
            y += int(f.size * 1.25)
    if spec.get("etikett"):
        # roterad röd etikett mitt i bilden (038)
        f = font(W * 0.075); b = d.textbbox((0, 0), spec["etikett"], font=f)
        tw, th = b[2] - b[0], b[3] - b[1]; ew, eh = tw + int(W * 0.08), th + int(W * 0.05)
        et = Image.new("RGBA", (ew, eh), ROD); ImageDraw.Draw(et).text((ew / 2, eh / 2 - b[1] / 2 - th / 2 + th / 2), spec["etikett"], font=f, fill=(255, 255, 255, 255), anchor="mm")
        et = et.rotate(-12, expand=True, resample=Image.BICUBIC)
        sk = Image.new("RGBA", et.size, (0, 0, 0, 0)); sk.paste((0, 0, 0, 140), mask=et.split()[3]); sk = sk.filter(ImageFilter.GaussianBlur(8))
        cx, cy = W // 2, int(H * spec.get("etikett_y", 0.50))
        bild.alpha_composite(sk, (cx - et.width // 2 + 6, cy - et.height // 2 + 10))
        bild.alpha_composite(et, (cx - et.width // 2, cy - et.height // 2))
    if spec.get("badge"):
        f = font(W * 0.046); pos = spec.get("badge_pos", "nere-mitten")
        cy = H - int(H * 0.075)
        cx = {"nere-mitten": W / 2, "nere-hoger": W - int(W * 0.30), "nere-vanster": int(W * 0.30)}[pos]
        pill(bild, spec["badge"], f, cx, cy)
    return bild.convert("RGB")


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--bas", required=True); p.add_argument("--ut", required=True)
    p.add_argument("--namn", required=True); p.add_argument("--spec", required=True)
    a = p.parse_args()
    spec = json.loads(a.spec); os.makedirs(a.ut, exist_ok=True)
    bas = Image.open(a.bas)
    # 4:5 — beskär basen till 4:5 (centrerat) om den inte redan är det
    bw, bh = bas.size
    mål = 4 / 5
    if abs(bw / bh - mål) > 0.01:
        if bw / bh > mål:  # för bred
            nb = int(bh * mål); bas45 = bas.crop(((bw - nb) // 2, 0, (bw - nb) // 2 + nb, bh))
        else:
            nh = int(bw / mål); bas45 = bas.crop((0, (bh - nh) // 2, bw, (bh - nh) // 2 + nh))
    else:
        bas45 = bas
    rita(bas45, spec, 1080, 1350).save(f"{a.ut}/{a.namn}_4x5.png", optimize=True)
    # 1:1 — centrerad kvadrat ur basen
    bw, bh = bas.size; s = min(bw, bh)
    bas11 = bas.crop(((bw - s) // 2, (bh - s) // 2, (bw - s) // 2 + s, (bh - s) // 2 + s))
    rita(bas11, spec, 1080, 1080).save(f"{a.ut}/{a.namn}_1x1.png", optimize=True)
    print("ok", a.namn)


if __name__ == "__main__":
    main()
