#!/usr/bin/env python3
"""Genererar BeaverShop-wordmark (PNG, transparent) i temats designspråk:
kraftig versal text + röd accent, svart + vit variant + favicon."""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "output" / "logo"
OUT.mkdir(parents=True, exist_ok=True)

def load_font(size):
    for name in ("DejaVuSans-Bold.ttf", "DejaVuSansCondensed-Bold.ttf"):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    raise SystemExit("ingen TTF hittad")

def render(text_main, text_suffix, fname, color):
    size = 220
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
    d.text((pad, pad - b1[1]), text_main, font=f, fill=color)
    if text_suffix:
        bs = d.textbbox((0, 0), text_suffix, font=fs)
        y = pad - b1[1] + h1 - (bs[3] - bs[1])
        d.text((pad + w1 + int(size * 0.10), y + bs[1] * -1 - bs[1]), text_suffix,
               font=fs, fill=(221, 29, 29, 255))
    img.save(OUT / fname)
    print(fname, img.size)

BLACK = (0, 0, 0, 255)
WHITE = (255, 255, 255, 255)
render("BEAVERSHOP", ".CO.UK", "beavershop-logo.png", BLACK)
render("BEAVERSHOP", ".CO.UK", "beavershop-logo-white.png", WHITE)
render("BEAVERSHOP", "", "beavershop-logo-plain.png", BLACK)

# Kvadratisk favicon: "B" på röd platta
size = 512
img = Image.new("RGBA", (size, size), (221, 29, 29, 255))
d = ImageDraw.Draw(img)
f = load_font(380)
b = d.textbbox((0, 0), "B", font=f)
d.text(((size - (b[2] - b[0])) / 2 - b[0], (size - (b[3] - b[1])) / 2 - b[1]), "B",
       font=f, fill=WHITE)
img.save(OUT / "beavershop-favicon.png")
print("beavershop-favicon.png", img.size)
