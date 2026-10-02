#!/usr/bin/env python3
"""Bygger norska slutkort + no-precis-konfig för de elva dubbade Takovertrekk-videorna.

Varje video har TVÅ sorters inbränd svensk text, och bara den ena klarar sig själv:

  * **Ordcaptions i ett vitt piller** nederst. `no-precis.py` hittar pillret per
    bildruta och byter texten i det. Den behöver bara y-zonen.
  * **Ett slutblock UTAN piller** — vit fet text direkt på fotot, eller svart text
    på ett vitt slutkort. Pillersökningen hittar det aldrig. ⛔ Det var exakt det
    här som höll tolv videor kvar i kön 2026-10-01: körningen såg "pillret hittat
    i N av M rutor" och trodde att resten var tystnad. Slutblocket kräver en
    blur-ruta och ett eget PNG-lager, med uppmätta rutor och tider.

Fem slutkortsfamiljer i batchen, alla uppmätta i den FÄRDIGDUBBADE videon
(`elevenlabs-omdubb` tempo-anpassar klippen, så källans tider stämmer inte):

  A  FD_1_H1/H2/H3   vit fet text med skugga över fotot, 2 rader
  B  FD_3_H1/H2      svart kort: röd rubrik + 2 ljusa rader under produktbilden
  C  OB_11_H1        vit fet text, 2 rader (den svenska säger "regular/save" på
                     ENGELSKA — källans eget slarv, rättas till norska)
  D  OB_13/OB_14     vit fet text, 3 rader (olika höjd i de två)
  E  OB_17/18/19     vitt kort, svart text, 2 rader

⚠️ Loggan är redan bortsuddad i källan på E-korten (ett blurrat svart band högst
upp). Rör den inte — den är inte läsbar, och att måla över den igen skulle bara
flytta problemet.

  python3 market-expansion/no/notion-batches/2026-10-02/lager.py
"""
import json
import os
import re
import subprocess

import numpy as np
from PIL import Image, ImageDraw, ImageFont

B = os.path.dirname(os.path.abspath(__file__))
FET = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"

try:
    import imageio_ffmpeg
    FF = imageio_ffmpeg.get_ffmpeg_exe()
except Exception:
    FF = "ffmpeg"

# Pillrets zon per video, mätt i den dubbade filen. Captionpillret vandrar en
# aning mellan videorna, så zonen är generös men slutar över slutkortets rader.
CAPTIONS = {"x0": 0, "x1": 720, "bredd_max": 700, "h_min": 36, "h_max": 95,
            "max_chars": 30, "font_px": 27, "pad_x": 6, "pad_y": 6}

# (y0, y1, x0, x1, svensk text, norsk text, vit_text) per rad i slutblocket.
VIT, SVART, ROD = (255, 255, 255), (17, 17, 17), (230, 36, 30)
FAMILJER = {
    "A": {"zon": [780, 1060], "rader": [
        (322, 361, 119, 523, "Fars dag-rea", "Farsdagssalg", VIT),
        (375, 417, 88, 719, "Beställ senast 19 oktober.", "Bestill senest 19. oktober.", VIT)]},
    "B": {"zon": [780, 1060], "rader": [
        (268, 342, 118, 602, "Fars dag-rea", "Farsdagssalg", ROD),
        (903, 947, 152, 568, "1 129 kr, ord. 1 469 kr", "1 189 kr, ord. 1 549 kr", VIT),
        (952, 999, 98, 622, "/ Beställ senast 19 oktober", "/ Bestill senest 19. oktober", VIT)]},
    "C": {"zon": [790, 900], "rader": [
        (324, 359, 88, 623, "1 129 kr (regular 1 469 kr),", "1 189 kr (ord. 1 549 kr),", VIT),
        (384, 419, 150, 568, "save 340 kr (23 %).", "spar 360 kr (23 %).", VIT)]},
    "D13": {"zon": [800, 900], "rader": [
        (279, 329, 185, 536, "1 129 kronor", "1 189 kroner", VIT),
        (363, 411, 115, 614, "spara 340 kronor", "spar 360 kroner", VIT),
        (445, 494, 110, 617, "23 procent rabatt", "23 prosent rabatt", VIT)]},
    "D14": {"zon": [800, 900], "rader": [
        (757, 815, 180, 540, "1 129 kronor", "1 189 kroner", VIT),
        (845, 894, 105, 670, "spara 340 kronor", "spar 360 kroner", VIT),
        (919, 977, 110, 660, "23 procent rabatt", "23 prosent rabatt", VIT)]},
    "E": {"zon": [960, 1130], "rader": [
        (961, 996, 86, 632, "1 129 kronor, spara 340", "1 189 kroner, spar 360", SVART),
        (1057, 1092, 49, 671, "kronor, 23 procent rabatt.", "kroner, 23 prosent rabatt.", SVART)]},
}
VIDEOR = {
    "Takovertrekk_NO_FD_1_H1": "A", "Takovertrekk_NO_FD_1_H2": "A",
    "Takovertrekk_NO_FD_1_H3": "A",
    "Takovertrekk_NO_FD_3_H1": "B", "Takovertrekk_NO_FD_3_H2": "B",
    "Takovertrekk_NO_OB_11_H1": "C",
    "Takovertrekk_NO_OB_13_H1": "D13", "Takovertrekk_NO_OB_14_H1": "D14",
    "Takovertrekk_NO_OB_17_H1": "E", "Takovertrekk_NO_OB_18_H1": "E",
    "Takovertrekk_NO_OB_19_H1": "E",
}
# se forst(): E klipper hårt från captionpillret till prisraden, på samma rad.
MARGINAL = {"A": 0.2, "B": 0.2, "C": 0.2, "D13": 0.2, "D14": 0.2, "E": 0.0}
# Familj E klipper hårt och texten tonar INTE in — där är 25 %-punkten
# facit (avläst bildruta för bildruta 2026-10-02). I alla andra familjer
# tonar texten in efter scenbytet, se forst().
TILL_KLIPP = {"A": True, "B": True, "C": True, "D13": True, "D14": True, "E": False}

# ⛔ **Facit är ögat, inte skriptet.** Tre automatiska mått prövades 2026-10-02 och
# alla tre hade fel på minst en video: Jaccard på 5 fps (en halv sekund för sent),
# täckning mot sista bildrutan (ser inte en halvgenomskinlig toning alls) och
# närmaste scenbyte (OB_11 klipper 1,4 s innan texten börjar tona in, så
# suddrutan hade legat över en ren himmel). Tiderna här är avlästa bildruta för
# bildruta i källan, 0,2 s i taget, och satta strax FÖRE den första bildruta där
# den svenska texten går att ana. Mät om dem när en video dubbas om —
# `elevenlabs-omdubb` tempo-anpassar klippen, så tiderna flyttar sig.
TIDER = {
    "Takovertrekk_NO_FD_1_H1": 13.35,   # klipp 13,4 · text tonar in 13,6
    "Takovertrekk_NO_FD_1_H2": 12.10,   # klipp 12,2 · texten syns i samma bildruta
    "Takovertrekk_NO_FD_1_H3": 12.80,
    "Takovertrekk_NO_OB_11_H1": 10.80,  # klipp 10,2 · text 11,0
    "Takovertrekk_NO_OB_13_H1": 10.70,  # klipp 10,8 · text i samma bildruta
    "Takovertrekk_NO_OB_14_H1": 10.45,
    "Takovertrekk_NO_OB_17_H1": 9.30,   # familj E: hårt klipp från pillret
    "Takovertrekk_NO_OB_18_H1": 11.75,  # omdubbad 2026-10-02, flyttade sig 0,15 s
    "Takovertrekk_NO_OB_19_H1": 9.75,   # omdubbad två gånger; repliken skrevs om, tiden flyttade 0,40 s
}

# Manuella pillerplattor: pillret smälter ihop med en stor vit yta i bilden och
# hittas inte. ⚠️ OB_11 6,1–6,7 s: husbilens vita sida ligger kant i kant med
# pillret, de blir EN vit yta högre än pillerhöjden och gruppen faller på
# h_max — den svenska captionen "210 D Oxfordväv" låg kvar i 20 bildrutor
# (mätt i QA-arket 2026-10-02). Rutan är pillret som det mättes bildrutan före
# hålet, med marginal.
FYLL = {
    "Takovertrekk_NO_OB_11_H1": [{"rect": [160, 815, 600, 906], "t": [6.03, 6.80]}],
    # Samma fälla i E-videorna: sista captionen före prisraden ligger mot husbilens
    # vita sida och sjön, och "luckor är fria." stod kvar i hela glappet mellan
    # sista hittade pillret och prisraden (mätt i kontaktarket 2026-10-02).
    "Takovertrekk_NO_OB_18_H1": [{"rect": [160, 965, 600, 1090], "t": [10.83, 11.78]}],
    "Takovertrekk_NO_OB_19_H1": [{"rect": [165, 965, 560, 1090], "t": [9.13, 9.78]}],
}


def langd(p):
    r = subprocess.run([FF, "-hide_banner", "-i", p], capture_output=True, text=True)
    m = re.search(r"Duration: (\d+):(\d+):(\d+\.\d+)", r.stderr)
    return int(m[1]) * 3600 + int(m[2]) * 60 + float(m[3])


def rutor(p, fps=5):
    r = subprocess.run([FF, "-hide_banner", "-loglevel", "error", "-i", p,
                        "-vf", f"fps={fps},scale=720:1280", "-f", "rawvideo",
                        "-pix_fmt", "rgb24", "-"], capture_output=True)
    buf = np.frombuffer(r.stdout, dtype=np.uint8)
    n = len(buf) // (720 * 1280 * 3)
    return buf[:n * 720 * 1280 * 3].reshape(n, 1280, 720, 3).astype(np.int32), fps


def forst(video, rader, vit_text, marginal, till_klipp):
    """Första sekunden då slutblockets översta rad syns.

    ⚠️ Gissa aldrig starttiden, och mät den aldrig som "mycket bläck i rutan".
    Första försöket gjorde det och gav 0,00 s på fem av elva videor: i rutan
    ligger ett foto som har gott om ljusa och mörka pixlar från första
    bildrutan. Blur-rutan hade då legat över bilden hela videon igenom.
    (2026-10-01 gick felet åt andra hållet: OB_7 sattes till 10,8 s när kortet
    kom 9,25, och två sekunder svenskt pris stod kvar i den färdiga videon.)

    Måttet här är i stället FORMEN: slutblocket är samma text, pixel för pixel,
    från att det tänds tills videon slutar. Textmasken i varje bildruta jämförs
    med sista bildrutans mask, och starten är början på den sammanhängande
    sviten som når ända fram till slutet.

    ⚠️ **Måttet är TÄCKNING (recall), inte Jaccard, och mäts på 10 fps.**
    Jaccard på 5 fps missade med en halv sekund på fem av elva videor
    2026-10-02 — svenska prisrader syntes i QA-arket på OB_11, OB_14 och alla
    tre E-korten. Unionen växer när bara en del av texten tänts, så Jaccard
    håller sig under tröskeln ett par bildrutor för länge; täckningen mot
    facit gör inte det.

    `marginal` dras av efteråt och är inte kosmetik: familj A–D tonar in
    slutblocket över ett foto (täckningen går 0,00 → 0,30 → 0,90 på två
    bildrutor), så de får 0,2 s. Familj E klipper HÅRT från en scen där
    captionpillret sitter på exakt samma rad som prisraden — en marginal där
    stänger av pillersuddningen för tidigt och släpper fram den SVENSKA
    captionen i stället. Mät klippet innan du ger E en marginal.
    """
    fr, fps = rutor(video, fps=10)
    y0, y1, x0, x1 = rader[0][:4]

    def mask(f):
        omr = f[y0:y1 + 1, x0:x1 + 1]
        g = omr.mean(axis=2)
        if not vit_text:
            return g < 120
        ljus, mork = g > 212, g < 108
        nb = np.zeros_like(mork)
        for d in range(1, 5):
            nb[:-d] |= mork[d:]; nb[d:] |= mork[:-d]
            nb[:, :-d] |= mork[:, d:]; nb[:, d:] |= mork[:, :-d]
        return ljus & nb

    facit = mask(fr[-1])
    if facit.sum() < 50:
        return 0.0
    tackning = [float((mask(f) & facit).sum()) / facit.sum() for f in fr]
    i = len(fr) - 1
    while i > 0 and tackning[i - 1] >= 0.25:
        i -= 1

    if not till_klipp:
        return round(max(0.0, i / fps - 0.1 - marginal), 2)

    # ⚠️ **Texten TONAS in efter scenbytet, och masken ser inte toningen.**
    # Halvgenomskinlig vit text på ett ljust foto har varken pixlar över 212
    # eller mörka grannar, så täckningen står på 0,00 ända tills texten är nästan
    # klar. Mätt 2026-10-02: `FD_1_H2` nådde 25 % först 12,90 s medan den
    # SVENSKA texten gick att läsa som ett spöke i kontaktarket vid 12,0 — den
    # stod kvar i den färdiga videon fast starttiden var "uppmätt".
    # Facit är i stället SCENBYTET: slutkortet börjar med ett hårt klipp, och
    # texten tonar in inne i den nya scenen. Här letas det sista klippet före
    # 25 %-punkten (bildrutans skillnad mot en referens 2 s tidigare hoppar
    # > 30 nivåer på EN bildruta).
    y, x = y1 - y0 + 1, x1 - x0 + 1
    ruta = fr[:, y0:y0 + y, x0:x0 + x].mean(axis=3)
    ref = ruta[max(0, i - 20)]
    d = np.abs(ruta - ref).mean(axis=(1, 2))
    j = i
    for k in range(i, 0, -1):
        if d[k] - d[k - 1] > 30:
            j = k
            break
    return round(max(0.0, j / fps - 0.1), 2)


def passa(text, mal_b, mal_h):
    """Fontstorleken vars bläck ligger närmast den uppmätta svenska raden."""
    d = ImageDraw.Draw(Image.new("RGB", (8, 8)))
    bast = None
    for st in range(20, 130):
        f = ImageFont.truetype(FET, st)
        bb = d.textbbox((0, 0), text, font=f)
        w, h = bb[2] - bb[0], bb[3] - bb[1]
        if not w:
            continue
        fel = abs(w - mal_b) / mal_b * 2 + abs(h - mal_h) / mal_h
        if bast is None or fel < bast[0]:
            bast = (fel, st)
    return bast[1]


def main():
    os.makedirs(f"{B}/lager", exist_ok=True)
    os.makedirs(f"{B}/konfig", exist_ok=True)
    os.makedirs(f"{B}/no-video-txt", exist_ok=True)
    tider = {}
    for namn, fam in VIDEOR.items():
        kalla = f"{B}/no-video/{namn}.mp4"
        f = FAMILJER[fam]
        L = langd(kalla)
        t0 = TIDER.get(namn) or forst(kalla, f["rader"], f["rader"][0][6] != SVART,
                                      MARGINAL[fam], TILL_KLIPP[fam])

        png = Image.new("RGBA", (720, 1280), (0, 0, 0, 0))
        d = ImageDraw.Draw(png)
        for (y0, y1, x0, x1, se, no, farg) in f["rader"]:
            st = passa(se, x1 - x0 + 1, y1 - y0 + 1)
            font = ImageFont.truetype(FET, st)
            bb = font.getbbox(no)
            mitt = (x0 + x1) / 2
            # Vit text på foto har en svart skugga i källan; röd text har vit kontur.
            if farg == VIT:
                d.text((mitt, y0 - bb[1]), no, font=font, anchor="ma",
                       fill=farg + (255,), stroke_width=4, stroke_fill=(0, 0, 0, 150))
            elif farg == ROD:
                d.text((mitt, y0 - bb[1]), no, font=font, anchor="ma",
                       fill=farg + (255,), stroke_width=6, stroke_fill=(255, 255, 255, 255))
            else:
                d.text((mitt, y0 - bb[1]), no, font=font, anchor="ma", fill=farg + (255,))
        png.save(f"{B}/lager/{namn}.png")

        blur = [{"rect": [max(0, x0 - 14), max(0, y0 - 12), min(720, x1 + 14), min(1280, y1 + 14)],
                 "t": [t0, L + 0.3]} for (y0, y1, x0, x1, _, _, _) in f["rader"]]
        konf = {
            "in": kalla,
            "ut": f"{B}/no-video-txt/{namn}.mp4",
            "srt": f"{B}/no-video/{namn}.mp4.srt",
            "captions": dict(CAPTIONS, zon=f["zon"],
                             standard_cy=(f["zon"][0] + f["zon"][1]) // 2,
                             av=[[t0, L + 0.3]], fyll=FYLL.get(namn, [])),
            "blur": blur,
            "lager": [{"png": f"{B}/lager/{namn}.png", "t": [t0, L + 0.3]}],
            "qa": f"{B}/qa",
        }
        json.dump(konf, open(f"{B}/konfig/{namn}.json", "w", encoding="utf-8"),
                  ensure_ascii=False, indent=1)
        tider[namn] = {"familj": fam, "slutkort_fran": t0, "langd": round(L, 2)}
        print(f"✓ {namn:30} familj {fam:3}  slutkort {t0:5.2f}..{L:5.2f} s")
    json.dump(tider, open(f"{B}/matt/slutkort-tider.json", "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
