#!/usr/bin/env python3
"""Genererar Majavakauppa-wordmark (PNG, transparent) i temats designspråk:
kraftig versal text + röd accent (.FI), i stil med Anton-typsnittet.
Svart variant för ljus botten, vit för svart header/sidfot, plain + favicon."""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "output" / "logo"
OUT.mkdir(parents=True, exist_ok=True)

RED = (221, 29, 29, 255)  # temats accentfärg #dd1d1d

def load_font(size):
    for name in ("DejaVuSans-Bold.ttf", "DejaVuSansCondensed-Bold.ttf"):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    raise SystemExit("ingen TTF hittad")

def render(text_main, text_suffix, fname, fill, scale=1.0):
    size = int(220 * scale)
    f = load_font(size)
    fs = load_font(int(size * 0.42))
    tmp = Image.new("RGBA", (10, 10))
    d = ImageDraw.Draw(tmp)
    b1 = d.textbbox((0, 0), text_main, font=f)
    w1, h1 = b1[2], b1[3] - b1[1]
    w2 = d.textbbox((0, 0), text_suffix, font=fs)[2] if text_suffix else 0
    pad = int(size * 0.12)
    W = w1 + (int(size * 0.10) + w2 if text_suffix else 0) + pad * 2
    H = h1 + pad * 2
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.text((pad, pad - b1[1]), text_main, font=f, fill=fill)
    if text_suffix:
        bs = d.textbbox((0, 0), text_suffix, font=fs)
        y = pad - b1[1] + h1 - (bs[3] - bs[1])
        d.text((pad + w1 + int(size * 0.10), y + bs[1] * -1 - bs[1]), text_suffix,
               font=fs, fill=RED)
    img.save(OUT / fname)
    print(fname, img.size)

SVART = (0, 0, 0, 255)
VIT = (255, 255, 255, 255)

render("MAJAVAKAUPPA", ".FI", "majavakauppa-logo.png", SVART)
render("MAJAVAKAUPPA", ".FI", "majavakauppa-logo-white.png", VIT)
render("MAJAVAKAUPPA", "", "majavakauppa-logo-plain.png", SVART)

# Kvadratisk favicon: "B" på röd platta
size = 512
img = Image.new("RGBA", (size, size), RED)
d = ImageDraw.Draw(img)
f = load_font(380)
b = d.textbbox((0, 0), "B", font=f)
d.text(((size - (b[2] - b[0])) / 2 - b[0], (size - (b[3] - b[1])) / 2 - b[1]), "B",
       font=f, fill=VIT)
img.save(OUT / "majavakauppa-favicon.png")
print("majavakauppa-favicon.png", img.size)
