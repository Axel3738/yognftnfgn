#!/usr/bin/env python3
"""slutkort.py — det AMERIKANSKA slutkortet som ersätter källans BÄVERBUTIKEN-kort.
Källkortet (mätt 2026-09-28 på OB_103/OB_104) bär fyra saker som inte får följa med:
butikens logga och namn, "10 recensioner", kr-priser och "Finns i lager - Begränsat
antal" (påhittad brådska). Produktbilden är det enda som återanvänds.

⚠️ RECENSIONSRADEN ÄR BORTTAGEN 2026-09-28. Kortet bar "16 reviews · 5.0 average"
i rundorna 2026-09-20 och 2026-09-23. Butiken publicerar visserligen den siffran
(Judge.me på carashell.com: reviewCount 16, ratingValue 5.00, mätt samma dag), men
ALLA sju briefer i dagens runda säger "No customer quotes, no reviews (the product
has only seeded reviews)" — och samma dag stryks betyget ur CS_109:s tal och täcks
över i PD_110:s och CO_105:s inbrända bild. Att låta samma påstående stå kvar på
slutkortet i samma annonser hade varit inkonsekvent. Redan live-lagda annonser rörs
aldrig i efterhand; det här gäller nya.
"""
from PIL import Image, ImageDraw, ImageFont
import os
HÄR = os.path.dirname(os.path.abspath(__file__))
FET = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
NORMAL = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"

def slutkort(W, H, produktbild, ut):
    sk = W / 720
    im = Image.new("RGBA", (W, H), (255, 255, 255, 255)); d = ImageDraw.Draw(im)
    f = ImageFont.truetype(NORMAL, int(40 * sk)); t = "90-DAY GUARANTEE"; w = f.getlength(t)
    bw, bh = w + 60 * sk, 72 * sk; bx = (W - bw) / 2; by = 250 * sk
    d.rounded_rectangle([bx, by, bx + bw, by + bh], radius=int(10 * sk), fill=(44, 95, 138, 255))
    d.text((W/2 - w/2, by + bh/2 - f.getmetrics()[0]*0.72/2 - 4*sk), t, font=f, fill=(255,255,255,255))
    p = Image.open(produktbild).convert("RGBA")
    mål = int(600 * sk); p = p.resize((mål, int(p.height * mål / p.width)))
    im.alpha_composite(p, (int((W - p.width)/2), int(430 * sk)))
    y = int(430 * sk) + p.height + int(60 * sk)
    f = ImageFont.truetype(FET, int(34 * sk))
    for rad in ["Roof Cover for Travel Trailers", "& Motorhomes · 21 × 10 ft"]:
        d.text((int(60*sk), y), rad, font=f, fill=(20,22,26,255)); y += int(44*sk)
    y += int(24 * sk)
    fj = ImageFont.truetype(NORMAL, int(26*sk)); t = "$249"
    d.text((int(60*sk), y + 8*sk), t, font=fj, fill=(130,134,140,255))
    wj = fj.getlength(t); ym = y + 8*sk + fj.getmetrics()[0]*0.5
    d.line([(int(60*sk), ym), (int(60*sk)+wj, ym)], fill=(130,134,140,255), width=max(2,int(2*sk)))
    fp = ImageFont.truetype(FET, int(38*sk))
    d.text((int(60*sk)+wj+18*sk, y), "$199", font=fp, fill=(20,22,26,255))
    xs = int(60*sk)+wj+18*sk+fp.getlength("$199")+18*sk
    fb = ImageFont.truetype(FET, int(18*sk))
    d.rounded_rectangle([xs, y+8*sk, xs+fb.getlength("Sale")+20*sk, y+8*sk+30*sk], radius=int(4*sk), fill=(20,22,26,255))
    d.text((xs+10*sk, y+12*sk), "Sale", font=fb, fill=(255,255,255,255))
    y += int(66 * sk)
    ff = ImageFont.truetype(NORMAL, int(19*sk))
    d.text((int(60*sk), y), "Free shipping to the US · 90-day guarantee · 5–10 business days",
           font=ff, fill=(90,94,100,255))
    im.save(ut)

if __name__ == "__main__":
    slutkort(720, 1280, os.path.join(HÄR, "lager", "produkt-720.png"),
             os.path.join(HÄR, "lager", "slutkort-720.png"))
    print("lager/slutkort-720.png skrivet")
