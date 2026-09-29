#!/usr/bin/env python3
"""kort.py — det engelska kommentarskortet som ersätter källans svenska i OB_103.
Källan (mätt 2026-09-28) visar ett vitt kort med avatar, namnet "Lars" och frågan
"Är det vattentätt?" i 1,0–2,6 s. TVÅ saker måste bytas: frågan är svensk, och
briefens egen regel säger att kommentaren "is never attributed to a named person"
— källan bryter mot den. Det engelska kortet behåller avataren och frågan, utan namn.
"""
from PIL import Image, ImageDraw, ImageFont
import os
HÄR = os.path.dirname(os.path.abspath(__file__))
FET = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
NORMAL = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"

def kort(W=720, H=1280, ut=None):
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    x0, y0, x1, y1 = 148, 551, 624, 714
    d.rounded_rectangle([x0+4, y0+6, x1+4, y1+6], radius=78, fill=(0, 0, 0, 40))   # mjuk skugga
    d.rounded_rectangle([x0, y0, x1, y1], radius=78, fill=(255, 255, 255, 255))
    cx, cy, r = x0 + 62, (y0 + y1) / 2, 52                                          # avatar
    d.ellipse([cx-r, cy-r, cx+r, cy+r], fill=(214, 214, 214, 255))
    d.ellipse([cx-20, cy-26, cx+20, cy+14], fill=(140, 140, 140, 255))
    d.pieslice([cx-34, cy-4, cx+34, cy+62], 180, 360, fill=(140, 140, 140, 255))
    f = ImageFont.truetype(NORMAL, 42); t = "Is it waterproof?"
    d.text((x0 + 128, cy - f.getmetrics()[0] * 0.72 / 2 - 2), t, font=f, fill=(24, 26, 30, 255))
    im.save(ut or os.path.join(HÄR, "lager", "ob103-fraga.png"))

if __name__ == "__main__":
    kort(); print("lager/ob103-fraga.png skrivet")
