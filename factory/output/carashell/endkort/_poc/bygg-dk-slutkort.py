#!/usr/bin/env python3
"""bygg-dk-slutkort.py — BEVIS-PÅ-KONCEPT (2026-09-20), inte produktionskod.

Visar att ett Bäverbutiken-slutkort går att byta mot ett neutralt danskt kort
UTAN att röra resten av videon: ett helskärms-PNG läggs som lager över exakt
den tid det gamla kortet syns. Ljudet rörs inte, längden ändras inte, inget
annat i filmen rörs.

Produktbilden klipps ur KÄLLANS eget slutkort (samma bild, ingen ny generering).
Texten är dansk; priserna och recensionsantalet står som PLATSHÅLLARE — de
ska läsas live ur butiken, aldrig gissas.

    python3 bygg-dk-slutkort.py <kalla-slutkort.png> <ut.png>
"""
import sys, os
from PIL import Image, ImageDraw, ImageFont

FET = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
NORMAL = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
STJARNA = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

# CaraShells palett ur factory/butiker/carashell.yaml
GRAFIT = (34, 40, 46, 255)
REGNBLA = (31, 111, 142, 255)
GRA = (110, 114, 120, 255)
VIT = (255, 255, 255, 255)
GRON = (33, 150, 83, 255)

# Mätt 2026-09-20 i Bäverbutikens 720×1280-slutkort:
# svart logobalk y 250–389 x 113–606, produktbilden y 468–809 x 61–659,
# den svenska titeln börjar y 860 — klipps BORT, annars följer den med.
PRODUKT_RUTA = (45, 440, 675, 820)


def bygg(kalla, ut, W=720, H=1280):
    sk = W / 720
    im = Image.new("RGBA", (W, H), VIT)
    d = ImageDraw.Draw(im)

    # 1. badge — ett LÖFTE, aldrig butikens namn eller domän
    #    (Axels regel 2026-09-18; samma lösning som US-kortet i bygg-cap.py)
    f = ImageFont.truetype(NORMAL, int(34 * sk))
    t = "14 DAGES FORTRYDELSESRET"
    w = f.getlength(t); bw, bh = w + 56 * sk, 66 * sk
    bx, by = (W - bw) / 2, 250 * sk
    d.rounded_rectangle([bx, by, bx + bw, by + bh], radius=int(10 * sk), fill=REGNBLA)
    d.text((W / 2 - w / 2, by + bh / 2 - f.getmetrics()[0] * 0.72 / 2 - 3 * sk), t, font=f, fill=VIT)

    # 2. produktbilden ur källans eget slutkort
    p = Image.open(kalla).convert("RGBA").crop(PRODUKT_RUTA)
    mal = int(600 * sk); p = p.resize((mal, int(p.height * mal / p.width)))
    im.alpha_composite(p, (int((W - p.width) / 2), int(420 * sk)))
    y = int(420 * sk) + p.height + int(40 * sk)

    # 3. dansk titel (ur factory/output/carashell/oversattning-da.json)
    f = ImageFont.truetype(FET, int(34 * sk))
    for rad in ["Tagbetræk campingvogn &", "autocamper 6,5 × 3 m"]:
        d.text((int(60 * sk), y), rad, font=f, fill=GRAFIT); y += int(44 * sk)
    y += int(12 * sk)

    # 4. stjärnor + recensioner — PLATSHÅLLARE, läses live ur DK-butiken
    fs = ImageFont.truetype(STJARNA, int(24 * sk))
    d.text((int(60 * sk), y), "★★★★★", font=fs, fill=GRON)
    fr = ImageFont.truetype(NORMAL, int(22 * sk))
    d.text((int(60 * sk) + fs.getlength("★★★★★") + 12 * sk, y + 2 * sk),
           "[ANTAL] anmeldelser", font=fr, fill=GRA)
    y += int(46 * sk)

    # 5. pris — DKK ur factory/produkter/takskyddet.yaml (Axels beslut 2026-09-20,
    #    819 / 1 069 kr för 6,5 × 3 m). Aldrig gissat, aldrig omräknat här.
    fj = ImageFont.truetype(NORMAL, int(26 * sk))
    t = "1.069 kr"; d.text((int(60 * sk), y + 8 * sk), t, font=fj, fill=GRA)
    wj = fj.getlength(t); ym = y + 8 * sk + fj.getmetrics()[0] * 0.5
    d.line([(int(60 * sk), ym), (int(60 * sk) + wj, ym)], fill=GRA, width=max(2, int(2 * sk)))
    fp = ImageFont.truetype(FET, int(38 * sk))
    d.text((int(60 * sk) + wj + 18 * sk, y), "819 kr", font=fp, fill=GRAFIT)
    y += int(62 * sk)

    # 6. bottenrad — bara det butiken faktiskt lovar i DK
    ff = ImageFont.truetype(NORMAL, int(19 * sk))
    d.text((int(60 * sk), y), "[FRAGTVILKÅR] · 14 dages fortrydelsesret", font=ff, fill=GRA)

    im.convert("RGB").save(ut)
    return ut


if __name__ == "__main__":
    print(bygg(sys.argv[1], sys.argv[2]))
