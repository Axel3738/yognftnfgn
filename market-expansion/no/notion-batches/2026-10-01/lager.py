#!/usr/bin/env python3
"""Bygger slutkorts-PNG och no-precis-konfig för Takovertrekk-videorna, 2026-10-01.

Källvideorna bär TVÅ inbrända svenska element:

  1. Ordcaptions — ett vitt piller med svart text nederst. `no-precis.py` hittar
     det per frame själv; här sätts bara sökfönstret, och texten kommer ur den
     norska SRT:n.

  2. Ett slutkort med svenska priser, i SEX olika utformningar (A-G nedan).

⚠️ Starttiderna lästes först av för hand i kontaktark, och TVÅ av dem var för
sena: OB_7_H1 fick 10,8 s fast kortet syns från 9,25, så två sekunder svenskt
pris stod kvar i den färdiga videon (fångat i kontaktarket, inte av något
skript). När y-bandet väl är känt går första förekomsten att mäta: samma
konturtest som för raderna, körd på den dubbade videon i 4 bilder/s inom bandet,
ger den sista sammanhängande sviten. Mätt så: 11,50 · 11,00 · 11,75 · 12,00 ·
10,00 · 10,00 · 15,75 · 9,25 · 12,75 s. Tiderna nedan ligger 0,4 s före den
mätta. Mät om när en video byts — en avläsning med ögat i ett kontaktark är
bara sekundprecis, och kortet tonar in.

⚠️ Slutkortets RADER mäts däremot maskinellt, och det måttet är tillförlitligt:
texten är ljus MED mörk kontur, så en ljus pixel med en mörk granne inom 4 px
är nästan bara text. Första försöket letade bara efter ljusa pixlar med hög
kontrast och fyllde hela zonen med himmel.

⛔ Takovertrekk_NO_OB_22_H1 byggs INTE här. Dess slutkort bär Bäverbutikens
logga i bild, och butikens namn får aldrig stå i en annons (Axels beslut
2026-09-18). Den behöver loggan bortmålad och ett tvåradigt caption-piller, och
hanteras för sig.

⚠️ Takovertrekk_NO_OB_14_H1 såg först ut att ha ett slutkort som FÖLJER MED
kameran: tre mätningar gav y 760, 478 och 498, mot högst 2 px drift i de andra.
Det var fel. Mätningen läste hela bilden, och efter 13 s kommer en buske med
hårda ljusdagrar in i rutan som ger samma signal som text med kontur. En riktad
mätning i y 740..1000 ger y 761..811, 837..894 och 919..976 vid BÅDE 12,0 och
14,45 s — kortet står still, det ligger bara i nedre halvan i stället för den
övre, under `rader_i`:s ytak. Därför ligger dess rutor i MATT_OVERSTYR.
Lärdomen är densamma som i går: en mätning som spänner mer än det den ska mäta
säger mer om bakgrunden än om texten.

⛔ Takovertrekk_NO_CS_2_H2 har inget tal alls — bara musik och inbränd text, så
HeyGen svarade "No speaker is detected" och den får ingen dubbning. Den
hanteras också för sig, med enbart textlager.

  python3 market-expansion/no/notion-batches/2026-10-01/lager.py
"""
import json
import os
import re
import shutil
import subprocess
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFont

B = os.path.dirname(os.path.abspath(__file__))
FET = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"

# Slutkortets grupp per video (texterna i matt/no-slutkort.json) och starttiden,
# avläst i kontaktark över de sista sekunderna. Tiden är satt strax före den
# första helt läsbara rutan; kortet ligger kvar till videons slut.
VIDEOR = {
    "Takovertrekk_NO_FD_1_H1": ("A", 11.0),
    "Takovertrekk_NO_FD_1_H2": ("A", 10.6),
    "Takovertrekk_NO_FD_1_H3": ("A", 11.3),
    "Takovertrekk_NO_OB_11_H1": ("B", 11.3),
    "Takovertrekk_NO_OB_13_H1": ("C", 9.5),
    "Takovertrekk_NO_OB_14_H1": ("C", 9.6),
    "Takovertrekk_NO_OB_6_H1": ("F", 15.3),
    "Takovertrekk_NO_OB_7_H1": ("G", 8.8),
    "Takovertrekk_NO_OB_9_H1": ("D", 11.9),
    "Takovertrekk_NO_CS_2_H3": (None, None),   # inget slutkort, bara captions
}

# ⚠️ Pillret ligger på olika höjd i olika videor — samma fälla som 2026-09-30,
# då zonen [815, 935] missade PD_1_H4 helt och svenska ordcaptions stod kvar i
# den norska videon. Fönstret spänner hela det uppmätta intervallet, med
# marginal, och slutkortet ligger alltid högre upp så de krockar aldrig.
CAPTIONS = {
    "zon": [700, 1010], "x0": 0, "x1": 720, "bredd_max": 700,
    "h_min": 42, "h_max": 90, "standard_cy": 855,
    "max_chars": 30, "font_px": 27, "pad_x": 6, "pad_y": 6,
}


# ⚠️ CS_2_H3 har sitt piller LÄGRE än alla andra: uppmätt y 997..1059 mot
# 793..896 i OB_11 och 829..896 i FD_1_H2. Med den gemensamma zonen hittade
# no-precis det i 8 av 713 rutor, och nästan hela videons svenska ordcaptions
# stod kvar. Det är samma fälla som 2026-09-30 (PD_1_H4, 98 av 441), och den
# går inte att mäta bort i förväg: en zon som spänner alla videor fångar
# slutkortens ljusa text i stället. Därför en egen zon där pillret avviker,
# och kontroll i kontaktarket efteråt.
ZON_OVERSTYR = {"Takovertrekk_NO_CS_2_H3": [950, 1110]}


def ffbin():
    return shutil.which("ffmpeg") or __import__("imageio_ffmpeg").get_ffmpeg_exe()


def langd(ff, path):
    r = subprocess.run([ff, "-hide_banner", "-i", path], capture_output=True, text=True)
    m = re.search(r"Duration: (\d+):(\d+):(\d+\.\d+)", r.stderr)
    if not m:
        sys.exit(f"kunde inte läsa längden på {path}")
    return int(m[1]) * 3600 + int(m[2]) * 60 + float(m[3])


def sista_ruta(ff, path, t):
    tmp = f"{B}/matt/_sista.png"
    subprocess.run([ff, "-y", "-hide_banner", "-loglevel", "error", "-ss", f"{t:.2f}",
                    "-i", path, "-frames:v", "1", "-vf", "scale=720:1280", tmp], check=True)
    a = np.asarray(Image.open(tmp).convert("RGB")).astype(np.int32)
    os.remove(tmp)
    return a


def rader_i(a, antal):
    """Slutkortets rader: ljus pixel med mörk granne inom 4 px (texten har kontur)."""
    g = a.mean(axis=2)
    ljus, mork = g > 210, g < 105
    nb = np.zeros_like(mork)
    for d in range(1, 5):
        nb[:-d] |= mork[d:]; nb[d:] |= mork[:-d]
        nb[:, :-d] |= mork[:, d:]; nb[:, d:] |= mork[:, :-d]
    m = ljus & nb
    m[700:] = False                       # ordpillret räknas aldrig som slutkort
    rows = np.where(m.sum(axis=1) > 18)[0]
    grupper = []
    i = 0
    while i < len(rows):
        j = i
        while j + 1 < len(rows) and rows[j + 1] - rows[j] <= 14:
            j += 1
        seg = rows[i:j + 1]
        if seg.max() - seg.min() + 1 >= 25:          # en rad är minst 25 px hög
            kol = np.where(m[seg.min():seg.max() + 1].sum(axis=0) > 0)[0]
            grupper.append([int(seg.min()), int(seg.max()), int(kol.min()), int(kol.max())])
        i = j + 1
    # de `antal` högsta raderna i följd med jämnt radavstånd = slutkortet
    if len(grupper) < antal:
        return None
    bast, fel = None, None
    for s in range(len(grupper) - antal + 1):
        d = grupper[s:s + antal]
        if antal == 1:
            f = 0
        else:
            avst = [d[k + 1][0] - d[k][0] for k in range(antal - 1)]
            f = max(avst) - min(avst)
        if fel is None or f < fel:
            fel, bast = f, d
    return bast


# Två rutor som den maskinella radläsningen tog fel på, mätta för hand i
# sista rutan: FD_1_H3 fick en extra "rad" av lövverket bakom husbilen, så
# bbox:en sträckte sig till y 563 i stället för 417 som i H1 och H2.
MATT_OVERSTYR = {
    "Takovertrekk_NO_FD_1_H3": [[322, 361, 120, 500], [377, 417, 87, 640]],
    # FD_1_H1 och H2 har samma kort som H3; deras automatiska mätning drog ut
    # till x 719 på lövverket bakom husbilen och gav en onödigt bred blur-ruta.
    "Takovertrekk_NO_FD_1_H1": [[322, 361, 120, 500], [377, 417, 87, 640]],
    "Takovertrekk_NO_FD_1_H2": [[322, 361, 120, 501], [378, 417, 96, 640]],
    # OB_14 ligger i nedre halvan, under rader_i:s ytak. Mätt i y 740..1000;
    # x för rad 1 tagen ur OB_13, som har exakt samma kort 481 px högre upp.
    "Takovertrekk_NO_OB_14_H1": [[761, 811, 184, 536], [837, 894, 115, 614],
                                 [919, 976, 110, 617]],
}


def storlek_for(text, mb, mh):
    """Fontstorleken vars bläck ligger närmast den uppmätta svenska raden."""
    bast = None
    for st in range(24, 110):
        f = ImageFont.truetype(FET, st)
        bb = f.getbbox(text)
        w, h = bb[2] - bb[0], bb[3] - bb[1]
        if not w:
            continue
        fel = abs(w - mb) / mb * 2 + abs(h - mh) / mh
        if bast is None or fel < bast[0]:
            bast = (fel, st)
    return bast[1]


def main():
    ff = ffbin()
    slutkort = json.load(open(f"{B}/matt/no-slutkort.json", encoding="utf-8"))
    os.makedirs(f"{B}/konfig", exist_ok=True)
    os.makedirs(f"{B}/lager", exist_ok=True)
    os.makedirs(f"{B}/no-video-txt", exist_ok=True)
    os.makedirs(f"{B}/qa", exist_ok=True)

    for namn, (grupp, fran) in VIDEOR.items():
        inn = f"{B}/no-video/takovertrekk_{namn}.mp4"
        if not os.path.exists(inn):
            print(f"⚠️  {namn}: den renderade filen saknas, hoppad")
            continue
        L = langd(ff, inn)
        konf = {
            "in": inn,
            "ut": f"{B}/no-video-txt/{namn}.mp4",
            "srt": f"{B}/srt-no/takovertrekk_{namn}.srt",
            "captions": {**CAPTIONS, **({"zon": ZON_OVERSTYR[namn]}
                                        if namn in ZON_OVERSTYR else {})},
            "qa": f"{B}/qa",
        }

        if grupp:
            rader = slutkort[grupp]["rader"]
            matt = MATT_OVERSTYR.get(namn) or rader_i(sista_ruta(ff, inn, L - 0.15), len(rader))
            if matt is None:
                print(f"⚠️  {namn}: hittade inte {len(rader)} slutkortsrader, hoppad")
                continue
            # en PNG över hela bilden: varje norsk rad på den svenskas plats
            png = Image.new("RGBA", (720, 1280), (0, 0, 0, 0))
            d = ImageDraw.Draw(png)
            x0 = min(r[2] for r in matt); x1 = max(r[3] for r in matt)
            y0 = min(r[0] for r in matt); y1 = max(r[1] for r in matt)
            for (my0, my1, mx0, mx1), rad in zip(matt, rader):
                st = storlek_for(rad["se"], mx1 - mx0 + 1, my1 - my0 + 1)
                f = ImageFont.truetype(FET, st)
                bb = f.getbbox(rad["no"])
                mitt = (mx0 + mx1) / 2
                d.text((mitt, my0 - bb[1]), rad["no"], font=f, anchor="ma",
                       fill=(255, 255, 255, 255), stroke_width=max(2, st // 18),
                       stroke_fill=(0, 0, 0, 190))
            png.save(f"{B}/lager/{namn}.png")
            till = L + 0.3
            # ⚠️ EN blur-ruta per RAD, inte en ruta över hela kortet. Första
            # bygget gjorde det senare, och mot husbilstak och träd syntes det
            # suddade bandet tydligt som en rektangel i bilden (QA på FD_1_H1).
            # Per rad blir rutan liten nog att den norska texten täcker den.
            # Marginalen är 8 px i x och 6 i y: no-precis suddar med
            # boxblur=14:3, vilket gör ytan slätare än omgivningen, så varje
            # pixel utanför texten syns som en grå platta (QA på OB_13_H1 med
            # 20 px marginal). Mindre går inte — den svenska textens kontur och
            # skugga ligger 4-5 px utanför bläcket, och en ruta som slutar i
            # bläckkanten lämnar en läsbar svensk rand (GT_4_H1, 2026-09-30).
            konf["blur"] = [{"rect": [max(0, mx0 - 8), max(0, my0 - 6),
                                      min(720, mx1 + 8), min(1280, my1 + 7)],
                             "t": [fran, till]}
                            for (my0, my1, mx0, mx1) in matt]
            konf["lager"] = [{"png": f"{B}/lager/{namn}.png", "t": [fran, till]}]
            print(f"✓ {namn}  slutkort {fran}-{till:.2f}s  {len(rader)} rader "
                  f"y {y0}..{y1} x {x0}..{x1}")
        else:
            print(f"✓ {namn}  inget slutkort, bara captions  (video {L:.2f}s)")

        json.dump(konf, open(f"{B}/konfig/{namn}.json", "w", encoding="utf-8"),
                  ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
