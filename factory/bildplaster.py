#!/usr/bin/env python3
"""bildplaster.py — byter ut en textrad i en färdig bildannons, i sin egen ruta.

Bildannonserna från källbutiken är panelbyggda: texten ligger på plana ytor.
Då går en rad att byta utan att generera om bilden — måla rutan i panelens
egen färg och rita den nya raden i samma storlek och läge.

    python3 factory/bildplaster.py <konfig.json>

konfig.json:
  {"in": "...jpg", "ut": "...jpg",
   "plaster": [
     {"ruta": [x0,y0,x1,y1],          # från factory/brand-text.py:s "ruta"
      "fyll": "auto",                  # eller [r,g,b]. auto = sampla utanför rutan
      "text": "Ny rad",                # utelämna för att bara sudda
      "font_px": 54,                   # utelämna = härled ur rutans höjd
      "farg": [17,17,17],              # textfärg
      "fet": true,                     # default true
      "centrera": true},               # false = vänsterställ i rutan
     ...]}

Rutorna FÖRSTORAS med några pixlar innan de målas — OCR:ens ruta ligger tajt
runt glyferna och lämnar annars kantrester av den gamla texten.
"""
import json
import sys

from PIL import Image, ImageDraw, ImageFont

FET = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
NORMAL = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
MARGINAL = 6


def sampla(im, ruta):
    """Panelens färg: medianen av pixlarna precis utanför rutan."""
    x0, y0, x1, y1 = ruta
    px = im.load()
    W, H = im.size
    prov = []
    for x in range(max(0, x0 - 12), min(W, x1 + 12), 3):
        for y in (max(0, y0 - 10), min(H - 1, y1 + 10)):
            prov.append(px[x, y])
    if not prov:
        return (255, 255, 255)
    prov.sort(key=lambda p: sum(p))
    return prov[len(prov) // 2]


def passa(rita, text, font_fil, mal_bredd, mal_hojd):
    """Största fontstorleken som får plats i rutan."""
    storlek = max(10, int(mal_hojd * 1.25))
    while storlek > 8:
        f = ImageFont.truetype(font_fil, storlek)
        bb = rita.textbbox((0, 0), text, font=f)
        if bb[2] - bb[0] <= mal_bredd and bb[3] - bb[1] <= mal_hojd:
            return f, bb
        storlek -= 1
    f = ImageFont.truetype(font_fil, 10)
    return f, rita.textbbox((0, 0), text, font=f)


def plastra(konfig):
    im = Image.open(konfig["in"]).convert("RGB")
    rita = ImageDraw.Draw(im)
    for p in konfig["plaster"]:
        x0, y0, x1, y1 = p["ruta"]
        fyll = p.get("fyll", "auto")
        if fyll == "auto":
            fyll = sampla(im, (x0, y0, x1, y1))
        fyll = tuple(fyll)
        rita.rectangle((x0 - MARGINAL, y0 - MARGINAL, x1 + MARGINAL, y1 + MARGINAL), fill=fyll)
        text = p.get("text")
        if not text:
            continue
        font_fil = FET if p.get("fet", True) else NORMAL
        if p.get("font_px"):
            font = ImageFont.truetype(font_fil, p["font_px"])
            bb = rita.textbbox((0, 0), text, font=font)
        else:
            font, bb = passa(rita, text, font_fil, x1 - x0, y1 - y0)
        bredd, hojd = bb[2] - bb[0], bb[3] - bb[1]
        tx = x0 + ((x1 - x0) - bredd) // 2 - bb[0] if p.get("centrera", True) else x0 - bb[0]
        ty = y0 + ((y1 - y0) - hojd) // 2 - bb[1]
        # "kontur": [bredd, [r,g,b]] — vit text med svart kontur direkt på ett
        # foto är källbutikens egen stil på flera annonser. Utan konturen byter
        # rutan utseende och sticker ut mot resten av bilden.
        kontur = p.get("kontur")
        extra = {}
        if kontur:
            extra = {"stroke_width": kontur[0], "stroke_fill": tuple(kontur[1])}
        rita.text((tx, ty), text, font=font, fill=tuple(p.get("farg", (17, 17, 17))), **extra)
    im.save(konfig["ut"], quality=95)
    return konfig["ut"]


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("Användning: bildplaster.py <konfig.json>")
    with open(sys.argv[1], encoding="utf-8") as fh:
        print(plastra(json.load(fh)))
