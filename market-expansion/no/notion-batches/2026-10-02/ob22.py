#!/usr/bin/env python3
"""Slutkortet i Takovertrekk_NO_OB_22_H1 — den enda videon som gick HeyGen-vägen.

`pratar-i-bild.py` dömde den OKAND (ansikte i 18 % av bildrutorna, men för liten
yta för att vara ett talande ansikte), och järnregeln säger att osäkerhet går
till HeyGen: krediter kostar pengar en gång, fel läppsynk syns i varje visning.

Tre saker i slutkortet måste bort, och bara en av dem är en översättning:

  1. ⛔ **Loggan "BÄVERBUTIKEN"** ligger inbränd i slutkortet (svart band
     y 240..400, x 85..640). Butikens namn står aldrig i en annons — regeln
     gäller också den svenska versionen, som kör live just nu. Här målas bandet
     över med sidans egen färg [251,251,251], uppmätt runt om på alla fyra
     sidor. De tre systervideorna OB_17/18/19 har redan ett BLURRAT band på
     exakt samma plats: där har redigeraren suddat loggan själv, och den rörs
     inte.
  2. ⛔ **"★★★★★ 10 recensioner"** är ett svenskt betyg med antal. Det går inte
     att verifiera i Norge och stryks enligt regeln om oberättigade claims.
  3. Prisraderna "1 129 kronor, spara 340 / kronor, 23 procent rabatt." blir de
     norska.

⚠️ **Prisraderna och det vita kortet är TVÅ olika tider — inte ett slutkort.**
Första bygget la loggöverstrykningen i samma fönster som prisraderna och ritade
därför en vit rektangel rakt över FOTOT i fyra sekunder (mätt i kontaktarket
2026-10-02). Prisraderna tänds 10,25 s, i ett hårt klipp mot ett foto; det vita
kortet med loggan kommer först 14,5 s. Båda är mätta: prisplattans ljusandel i
rutan hoppar 0,26 → 0,62 på en bildruta, och bildens medelljus 180 → 222.

⚠️ **Pillret är TVÅRADIGT, 167–170 px högt.** Standardtaket `h_max` 85–95 är
mätt på Carl Vicentes enradiga mall; här fångade det bara den undre raden, så
den ÖVRE svenska raden stod kvar ("Överdraget viks ihop", "det tänkt att
användas"). Mät pillret i den här videon innan du rör zonen.

  python3 market-expansion/no/notion-batches/2026-10-02/ob22.py
"""
import json
import os
import re
import subprocess

import numpy as np
from PIL import Image, ImageDraw, ImageFont

B = os.path.dirname(os.path.abspath(__file__))
FET = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
NAMN = "Takovertrekk_NO_OB_22_H1"
SIDFARG = (251, 251, 251)

try:
    import imageio_ffmpeg
    FF = imageio_ffmpeg.get_ffmpeg_exe()
except Exception:
    FF = "ffmpeg"

# Uppmätt i den renderade filen, sista bildrutan.
LOGGA = [85, 235, 645, 400]          # x0, y0, x1, y1
STJARNOR = [40, 900, 700, 955]
RADER = [(887, 922, 86, 632, "1 129 kronor, spara 340", "1 189 kroner, spar 360"),
         (983, 1018, 49, 671, "kronor, 23 procent rabatt.", "kroner, 23 prosent rabatt.")]
# Prisradens egen ljusa platta, mätt per bildruta (fps 10): andelen pixlar > 200
# i rutan under rad 1. Hårt klipp, inget intoning.
PLATTA = (887, 36, 86, 546)          # y, h, x, bredd


def langd(p):
    r = subprocess.run([FF, "-hide_banner", "-i", p], capture_output=True, text=True)
    m = re.search(r"Duration: (\d+):(\d+):(\d+\.\d+)", r.stderr)
    return int(m[1]) * 3600 + int(m[2]) * 60 + float(m[3])


def prisrad_fran(p, fps=10):
    """Första sekunden då prisplattan ligger i bild (ljusandel hoppar)."""
    y, h, x, w = PLATTA
    r = subprocess.run([FF, "-hide_banner", "-loglevel", "error", "-i", p,
                        "-vf", f"fps={fps},crop={w}:{h}:{x}:{y}", "-f", "rawvideo",
                        "-pix_fmt", "gray", "-"], capture_output=True)
    b = np.frombuffer(r.stdout, dtype=np.uint8)
    n = len(b) // (w * h)
    fr = b[:n * w * h].reshape(n, h, w).astype(int)
    lj = (fr > 200).mean(axis=(1, 2))
    i = n - 1
    while i > 0 and lj[i - 1] > 0.45:
        i -= 1
    return round(i / fps - 0.05, 2)


def vitt_kort_fran(p, fps=10):
    """Första sekunden då hela bilden är det vita slutkortet."""
    r = subprocess.run([FF, "-hide_banner", "-loglevel", "error", "-i", p,
                        "-vf", f"fps={fps},scale=180:320", "-f", "rawvideo",
                        "-pix_fmt", "gray", "-"], capture_output=True)
    b = np.frombuffer(r.stdout, dtype=np.uint8)
    n = len(b) // (180 * 320)
    m = b[:n * 180 * 320].reshape(n, 320, 180).astype(int).mean(axis=(1, 2))
    i = n - 1
    while i > 0 and m[i - 1] > 195:
        i -= 1
    return round(i / fps - 0.1, 2)


def main():
    kalla = f"{B}/heygen/{NAMN}.mp4"
    L = langd(kalla)
    t_pris = prisrad_fran(kalla)
    t_kort = vitt_kort_fran(kalla)

    os.makedirs(f"{B}/lager", exist_ok=True)
    matare = ImageDraw.Draw(Image.new("RGB", (8, 8)))

    # lager 1: de norska prisraderna (från 10,25 s)
    pris = Image.new("RGBA", (720, 1280), (0, 0, 0, 0))
    dp = ImageDraw.Draw(pris)
    for (y0, y1, x0, x1, se, no) in RADER:
        bast = None
        for st in range(20, 90):
            f = ImageFont.truetype(FET, st)
            bb = matare.textbbox((0, 0), se, font=f)
            w, h = bb[2] - bb[0], bb[3] - bb[1]
            fel = abs(w - (x1 - x0 + 1)) / (x1 - x0 + 1) * 2 + abs(h - (y1 - y0 + 1)) / (y1 - y0 + 1)
            if bast is None or fel < bast[0]:
                bast = (fel, st)
        font = ImageFont.truetype(FET, bast[1])
        dp.text(((x0 + x1) / 2, y0 - font.getbbox(no)[1]), no, font=font,
                anchor="ma", fill=(17, 17, 17, 255))
    pris.save(f"{B}/lager/{NAMN}-pris.png")

    # lager 2: loggan och stjärnraden övermålade (bara på det vita kortet)
    kort = Image.new("RGBA", (720, 1280), (0, 0, 0, 0))
    dk = ImageDraw.Draw(kort)
    dk.rectangle(LOGGA, fill=SIDFARG + (255,))
    dk.rectangle(STJARNOR, fill=SIDFARG + (255,))
    kort.save(f"{B}/lager/{NAMN}-kort.png")

    konf = {
        "in": kalla,
        "ut": f"{B}/no-video-txt/{NAMN}.mp4",
        "srt": f"{B}/srt-fixed/takovertrekk_{NAMN}.srt",
        # pillret är tvåradigt: 167–170 px, inte 60–95 som i de dubbade videorna
        "captions": {"zon": [800, 1040], "x0": 0, "x1": 720, "bredd_max": 700,
                     "h_min": 50, "h_max": 190, "standard_cy": 920,
                     "max_chars": 30, "font_px": 27, "pad_x": 8, "pad_y": 8,
                     "av": [[t_pris, L + 0.3]],
                     # ⚠️ 8,3–9,2 s står pillret mot husbilens VITA sida: den vita
                     # ytan blir en enda sammanhängande grupp som är högre än h_max,
                     # och pillret hittas inte alls — "det tänkt att användas" låg
                     # kvar i 24 bildrutor. Rutan är pillret mätt 7,8–8,0 s.
                     "fyll": [{"rect": [60, 900, 660, 1005], "t": [8.28, 9.30]}]},
        "blur": [{"rect": [max(0, x0 - 14), max(0, y0 - 12), min(720, x1 + 14), min(1280, y1 + 14)],
                  "t": [t_pris, L + 0.3]} for (y0, y1, x0, x1, _, _) in RADER]
                # ⛔ den röda prisbubblan "1 129 kr" växer fram 14,3–14,7 s, strax
                # före det vita kortet. Den ligger på fotot, så den suddas — en vit
                # ruta hade synts. Mätt: röda pixlar y 286..461, x 130..589.
                + [{"rect": [110, 265, 610, 485], "t": [14.25, 14.72]}],
        # ⚠️ ORDNINGEN: kortet (loggan + stjärnraden övermålade) ritas FÖRE
        # prisraderna. Stjärnrutan y 900..955 överlappar prisrad 1 (y 887..922),
        # så med omvänd ordning målades den norska prisraden över med sidfärgen
        # och bara den suddade svenska skymtade igenom (mätt i kontaktarket).
        "lager": [{"png": f"{B}/lager/{NAMN}-kort.png", "t": [t_kort, L + 0.3]},
                  {"png": f"{B}/lager/{NAMN}-pris.png", "t": [t_pris, L + 0.3]}],
        "qa": f"{B}/qa",
    }
    os.makedirs(f"{B}/konfig-ob22", exist_ok=True)
    json.dump(konf, open(f"{B}/konfig-ob22/{NAMN}.json", "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    print(f"✓ {NAMN}: prisrader {t_pris:.2f}..{L:.2f} s, vitt kort {t_kort:.2f} s "
          f"(loggan övermålad, stjärnraden struken)")


if __name__ == "__main__":
    main()
