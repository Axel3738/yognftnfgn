#!/usr/bin/env python3
"""Byter BARA rubriken i en färdig bildannons (FD_2_1 → FD_2_2).

Rubriken är den isolerade variabeln: badge, underrad, foto, prisband och
bottenrad står kvar pixel för pixel. Den gamla rubriken tvättas bort med
inpaint (bara de mörka textpixlarna, inom rubrikens rader), den nya skrivs med
samma typsnitt (Liberation Sans Bold, bildannonser/text.py), samma färg och
samma radstart.

    python3 byt-rubrik.py <in.jpg> <ut.jpg> "<gammal rubrik>" "<ny rubrik>"
"""
import sys
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFont

FET = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
FARG = (20, 18, 16)  # #141210, text.py rubrik
MARGINAL = 64


def bryt(text, f, maxb, d):
    ord_, rader, rad = text.split(), [], ""
    for o in ord_:
        prov = (rad + " " + o).strip()
        if d.textlength(prov, font=f) <= maxb or not rad:
            rad = prov
        else:
            rader.append(rad)
            rad = o
    rader.append(rad)
    return rader


def jamna(text, f, maxb, d):
    """Två rader så jämna som möjligt (samma princip som komponera.py)."""
    ord_ = text.split()
    bast = None
    for i in range(1, len(ord_)):
        a, b = " ".join(ord_[:i]), " ".join(ord_[i:])
        la, lb = d.textlength(a, font=f), d.textlength(b, font=f)
        if max(la, lb) > maxb:
            continue
        # bryt helst efter kolon
        straff = abs(la - lb) - (400 if a.endswith(":") else 0)
        if bast is None or straff < bast[0]:
            bast = (straff, [a, b])
    return bast[1] if bast else None


def rubrikband(a, W, H):
    """Rubrikens textrader: de feta, mörka banden överst (inom rutans x)."""
    lum = (a[..., 0] * 299 + a[..., 1] * 587 + a[..., 2] * 114) // 1000
    mork = lum < 60
    mork[:, : int(W * 0.035)] = False
    mork[:, int(W * 0.965):] = False
    # börja under den röda badgen (fotot ovanför rutan är mörkt i vissa bilder)
    rod = (a[..., 0] > 150) & (a[..., 1] < 80) & (a[..., 2] < 80)
    rodrader = np.where(rod[: int(H * 0.3)].sum(1) > 20)[0]
    start = int(rodrader.max()) + 8 if len(rodrader) else 0
    mork[:start] = False
    topp = mork[: int(H * 0.5)]
    rader = topp.sum(1)
    band, inne = [], False
    for y, c in enumerate(rader):
        if c > 3 and not inne:
            s, inne = y, True
        if c <= 3 and inne:
            band.append((s, y))
            inne = False
    # rubrikrader är FETA: mät streckbredden (median av mörka löplängder per rad).
    # Liberation Bold 50–60 px ger 6–9 px, underradens Regular 32 px ger 3–4 px.
    def streck(s, e):
        langder = []
        for rad in topp[s:e]:
            d = np.diff(np.concatenate(([0], rad.astype(np.int8), [0])))
            b, sl = np.where(d == 1)[0], np.where(d == -1)[0]
            langder.extend((sl - b).tolist())
        return float(np.median(langder)) if langder else 0
    feta = [(s, e) for s, e in band if e - s > 20 and streck(s, e) >= 5]
    return feta, mork


def main(inn, ut, gammal, ny):
    im = Image.open(inn).convert("RGB")
    W, H = im.size
    a = np.asarray(im).astype(int)
    band, mork = rubrikband(a, W, H)
    # rubriken = de första 1–2 höga banden som ligger tätt (radavstånd < 1,6 × höjd)
    rub = [band[0]]
    for b in band[1:3]:
        if b[0] - rub[-1][1] < (rub[-1][1] - rub[-1][0]) * 1.2:
            rub.append(b)
        else:
            break
    y0, y1 = rub[0][0], rub[-1][1]
    tonh = rub[0][1] - rub[0][0]

    # typsnittsstorlek: den som ger samma bredd på gamla rubrikens första rad
    d = ImageDraw.Draw(im)
    kol = np.where(mork[rub[0][0]:rub[0][1]].any(0))[0]
    bredd = kol.max() - kol.min()
    maxb = W - 2 * MARGINAL
    # text.py: radhöjd = höjden av "Åjg" × 1,45 — storleken ur radavståndet
    storlek, bast = 60, 1e9
    if len(rub) > 1:
        radavst = rub[1][0] - rub[0][0]
        for s in range(30, 110):
            f = ImageFont.truetype(FET, s)
            bb = f.getbbox("Åjg")
            diff = abs(int((bb[3] - bb[1]) * 1.45) - radavst)
            if diff < bast:
                bast, storlek = diff, s
    else:
        for s in range(30, 110):
            f = ImageFont.truetype(FET, s)
            diff = abs(d.textlength(gammal, font=f) - bredd)
            if diff < bast:
                bast, storlek = diff, s
        bb = ImageFont.truetype(FET, storlek).getbbox("Åjg")
        radavst = int((bb[3] - bb[1]) * 1.45)

    # tvätta bort den gamla rubriken: mörka pixlar i rubrikens rader, utvidgade
    mask = np.zeros((H, W), np.uint8)
    mask[y0 - 6 : y1 + 8] = mork[y0 - 6 : y1 + 8].astype(np.uint8) * 255
    mask = cv2.dilate(mask, np.ones((7, 7), np.uint8))
    bgr = cv2.cvtColor(np.asarray(im), cv2.COLOR_RGB2BGR)
    tvatt = cv2.inpaint(bgr, mask, 6, cv2.INPAINT_TELEA)
    im = Image.fromarray(cv2.cvtColor(tvatt, cv2.COLOR_BGR2RGB))
    d = ImageDraw.Draw(im)

    # nya rubriken: samma storlek, krymp bara om den inte får plats på två rader
    s = storlek
    while True:
        f = ImageFont.truetype(FET, s)
        if d.textlength(ny, font=f) <= maxb:
            rader = [ny]
        else:
            rader = jamna(ny, f, maxb, d)
        if rader and len(rader) <= 2:
            break
        s -= 2
    # radernas topp: första radens topp som förut; en rad centreras i de gamlas yta
    bb = d.textbbox((0, 0), "ÅÄÖFarsdg", font=f)
    glyftopp = bb[1]
    if len(rader) == 1 and len(rub) == 2:
        starty = y0 + (y1 - y0 - tonh) // 2
    else:
        starty = y0
    for i, rad in enumerate(rader):
        lb = d.textlength(rad, font=f)
        x = (W - lb) / 2
        # textbbox för "F" börjar vid kapitälhöjden; justera så versalen hamnar där den gamla började
        fb = d.textbbox((0, 0), rad, font=f)
        y = starty + i * radavst - fb[1]
        d.text((x, y), rad, font=f, fill=FARG)
    im.save(ut, quality=92)
    print(f"{inn}: {len(rub)} rader {y0}-{y1}, storlek {storlek}→{s}, radavstånd {radavst}, nya rader {rader}")


if __name__ == "__main__":
    main(*sys.argv[1:5])
