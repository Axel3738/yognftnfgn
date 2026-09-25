#!/usr/bin/env python3
"""bygg-cap.py — lagren och konfigen för de amerikanska videorna (US-runda 2026-09-23, 13 st).

Samma tre sorters inbränd text som 2026-09-20, men mätt om för den här batchen:
  1. ordcaptions i vitt piller nederst      → no-precis.py suddar pillret och lägger den
     engelska cuen. Pillrets y-band skiljer sig mellan videorna (825–891 i OB_102,
     975–1035 i TR_103) — `standard_cy` och `zon` sätts därför PER VIDEO, aldrig ärvt.
  2. stora röda pop-texter mitt i bild → förbehandling (blur + mörk platta) + en PNG med
     den amerikanska texten i samma stil. Fönstren och rutorna är mätta med rodtext.py och
     innehållet avlyssnat var 0,4 s med tidslinje.py — ett fönster kan byta text inuti sig
     (CS_108: 210D-väv → pris → pris + jämförpris), och då behövs ETT lager per delfönster.
  3. Bäverbutikens slutkort i elva av tretton → helt nytt US-slutkort som PNG-lager.
     CS_107_H1 och GT_110_H1 saknar slutkort helt (kön dömde dem "ren") och får inget.

⚠️ Texten i lagren säger bara det som är sant på den amerikanska sidan: 199 dollar från 249
(`ekonomi.marknadspriser`), 21 × 10 ft, 210D. Svenska betyg och recensionsantal ("5,0/5")
skrivs ALDRIG om till engelska — de stryks, precis som i manuset, för de går inte att
verifiera på marknaden. OB_102:s "ryms i en påse" stryks av samma skäl som i manuset:
produktminnet förbjuder påståendet om förvaringspåse.

    python3 bygg-cap.py            # skriver cap/<n>.json, lager/*.png, forbehandla.json
"""
import json, os
from PIL import Image, ImageDraw, ImageFont

HÄR = os.path.dirname(os.path.abspath(__file__))
FET = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
NORMAL = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
STJARNA = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
os.makedirs(os.path.join(HÄR, "lager"), exist_ok=True)
os.makedirs(os.path.join(HÄR, "cap"), exist_ok=True)

RÖD = (214, 30, 30, 255)


def passa(text, font_path, storlek, maxbredd):
    f = ImageFont.truetype(font_path, storlek)
    while f.getlength(text) > maxbredd and storlek > 20:
        storlek -= 2; f = ImageFont.truetype(font_path, storlek)
    return f


def rodtext(W, H, rader, panel):
    """rader: [(text, storlek, box[x0,y0,x1,y1], stryk)] — vit fet versal text med röd kant,
    centrerad i sin ruta. panel: [x0,y0,x1,y1] mörk halvgenomskinlig platta bakom."""
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    x0, y0, x1, y1 = panel
    d.rounded_rectangle([x0, y0, x1, y1], radius=28, fill=(10, 12, 16, 215))
    for text, storlek, box, stryk in rader:
        bx0, by0, bx1, by1 = box
        f = passa(text, FET, storlek, bx1 - bx0 - 20)
        w = f.getlength(text); asc, desc = f.getmetrics()
        x = (bx0 + bx1) / 2 - w / 2; y = (by0 + by1) / 2 - asc * 0.72 / 2 - (asc - asc * 0.72) * 0.15
        kant = max(4, storlek // 14)
        d.text((x, y), text, font=f, fill=(255, 255, 255, 255), stroke_width=kant, stroke_fill=RÖD)
        if stryk:
            ym = y + asc * 0.72 / 2
            d.line([(x - 10, ym), (x + w + 10, ym)], fill=RÖD, width=max(6, storlek // 9))
    return im


def slutkort(W, H, produktbild, ut):
    """US-slutkort: vit bakgrund, blå badge, produktbilden ur källans slutkort, titel,
    stjärnor + reviews, $249 överstruket + $199 + Sale, fotrad. Butikens namn står inte
    på kortet — produkten, priset och länken pekar ut butiken ändå."""
    sk = W / 720
    im = Image.new("RGBA", (W, H), (255, 255, 255, 255))
    d = ImageDraw.Draw(im)
    f = ImageFont.truetype(NORMAL, int(40 * sk)); t = "90-DAY GUARANTEE"; w = f.getlength(t)
    bw, bh = w + 60 * sk, 72 * sk; bx = (W - bw) / 2; by = 250 * sk
    d.rounded_rectangle([bx, by, bx + bw, by + bh], radius=int(10 * sk), fill=(44, 95, 138, 255))
    d.text((W / 2 - w / 2, by + bh / 2 - f.getmetrics()[0] * 0.72 / 2 - 4 * sk), t, font=f, fill=(255, 255, 255, 255))
    p = Image.open(produktbild).convert("RGBA")
    mål_b = int(600 * sk); p = p.resize((mål_b, int(p.height * mål_b / p.width)))
    im.alpha_composite(p, (int((W - p.width) / 2), int(400 * sk)))
    y = int(400 * sk) + p.height + int(50 * sk)
    f = ImageFont.truetype(FET, int(34 * sk))
    for rad in ["Roof Cover for Travel Trailers", "& Motorhomes · 21 × 10 ft"]:
        d.text((int(60 * sk), y), rad, font=f, fill=(20, 22, 26, 255)); y += int(44 * sk)
    y += int(14 * sk)
    fs = ImageFont.truetype(STJARNA, int(24 * sk)); d.text((int(60 * sk), y), "★★★★★", font=fs, fill=(33, 150, 83, 255))
    fr = ImageFont.truetype(NORMAL, int(22 * sk)); d.text((int(60 * sk) + fs.getlength("★★★★★") + 12 * sk, y + 2 * sk), "16 reviews · 5.0 average", font=fr, fill=(70, 74, 80, 255))
    y += int(48 * sk)
    fj = ImageFont.truetype(NORMAL, int(26 * sk)); t = "$249"; d.text((int(60 * sk), y + 8 * sk), t, font=fj, fill=(130, 134, 140, 255))
    wj = fj.getlength(t); ym = y + 8 * sk + fj.getmetrics()[0] * 0.5
    d.line([(int(60 * sk), ym), (int(60 * sk) + wj, ym)], fill=(130, 134, 140, 255), width=max(2, int(2 * sk)))
    fp = ImageFont.truetype(FET, int(38 * sk)); d.text((int(60 * sk) + wj + 18 * sk, y), "$199", font=fp, fill=(20, 22, 26, 255))
    xs = int(60 * sk) + wj + 18 * sk + fp.getlength("$199") + 18 * sk
    fb = ImageFont.truetype(FET, int(18 * sk)); d.rounded_rectangle([xs, y + 8 * sk, xs + fb.getlength("Sale") + 20 * sk, y + 8 * sk + 30 * sk], radius=int(4 * sk), fill=(20, 22, 26, 255))
    d.text((xs + 10 * sk, y + 12 * sk), "Sale", font=fb, fill=(255, 255, 255, 255))
    y += int(66 * sk)
    ff = ImageFont.truetype(NORMAL, int(19 * sk)); d.text((int(60 * sk), y), "Free shipping to the US · 90-day guarantee · 5–10 business days", font=ff, fill=(90, 94, 100, 255))
    im.save(ut)


# ------------------------------------------------------------ produktbilden ur källans slutkort
# Mätt 2026-09-23: 720-kortet har produktbilden y 467–807, x 61–659 (identiskt med 2026-09-20).
Image.open(os.path.join(HÄR, "rod", "OB_101_H1-slutkort.png")).convert("RGBA").crop((61, 467, 660, 808)).save(os.path.join(HÄR, "lager", "produkt-720.png"))
slutkort(720, 1280, os.path.join(HÄR, "lager", "produkt-720.png"), os.path.join(HÄR, "lager", "slutkort-720.png"))


def mitt(box, marginal=18):
    """Textrutan inuti panelen — panelen är boxen plus marginal."""
    x0, y0, x1, y1 = box
    return [x0 - marginal, y0 - marginal, x1 + marginal, y1 + marginal]


def rad(text, box, andel=0.72, stryk=False):
    """En textrad som fyller `andel` av rutans höjd."""
    return (text, max(28, int((box[3] - box[1]) * andel)), box, stryk)


# ------------------------------------------------------------ ett lager per delfönster
# (namn, [t0,t1], panelruta, [rader]) — rutorna mätta med rodtext.py + tidslinje.py 2026-09-23
LAGER = {
    "co103-pris":      ([130, 450, 589, 585], [rad("$199", [130, 455, 589, 580])]),
    "co103-spara":     ([130, 450, 589, 772], [rad("$199", [130, 455, 589, 578], 0.80),
                                               rad("SAVE $50", [130, 596, 589, 676], 0.78),
                                               rad("$249", [190, 692, 530, 768], 0.72, True)]),
    "cs107-pris":      ([64, 250, 651, 436], [rad("$199", [64, 258, 651, 428], 0.80)]),
    "cs108-pris1":     ([128, 428, 592, 565], [rad("$199", [128, 434, 592, 560])]),
    "cs108-vav":       ([108, 271, 613, 477], [rad("210D FABRIC", [108, 279, 613, 395], 0.80),
                                               rad("FULL WINTER", [108, 400, 613, 470], 0.72)]),
    "cs108-jampris":   ([128, 325, 591, 600], [rad("$199", [128, 333, 591, 498], 0.80),
                                               rad("$249", [190, 512, 530, 594], 0.72, True)]),
    "gt-pris-spara":   ([128, 325, 591, 578], [rad("$199", [128, 331, 591, 470], 0.80),
                                               rad("SAVE $50", [128, 486, 591, 572], 0.78)]),
    "gt110-storlek":   ([112, 294, 609, 471], [rad("NINE SIZES", [112, 300, 609, 386], 0.80),
                                               rad("FROM $199", [112, 392, 609, 466], 0.80)]),
    "ob101-vav":       ([111, 335, 611, 505], [rad("210D FABRIC", [111, 341, 611, 500], 0.72)]),
    "ob101-pris":      ([120, 588, 607, 757], [rad("$199", [120, 594, 607, 752], 0.80)]),
    "ob102-pris":      ([114, 138, 606, 337], [rad("$199", [114, 144, 606, 252], 0.86),
                                               rad("PACKS DOWN SMALL", [114, 262, 606, 332], 0.62)]),
    "pd106-pris":      ([128, 370, 591, 505], [rad("$199", [128, 376, 591, 500])]),
    "storlek-21x10":   ([150, 290, 573, 397], [rad("21 x 10 FT", [150, 296, 573, 392], 0.76)]),
    "storlek-21x10-ri":([150, 470, 569, 580], [rad("21 x 10 FT", [150, 476, 569, 575], 0.76)]),
    "pris-spara-lag":  ([128, 450, 591, 703], [rad("$199", [128, 456, 591, 592], 0.82),
                                               rad("SAVE $50", [128, 606, 591, 698], 0.78)]),
    "tr103-tak":       ([100, 402, 619, 583], [rad("JUST THE ROOF", [100, 408, 619, 492], 0.76),
                                               rad("NOT THE WHOLE TRAILER", [100, 500, 619, 578], 0.58)]),
    "tr103-jampris":   ([128, 566, 591, 822], [rad("$199", [128, 572, 591, 716], 0.82),
                                               rad("$249", [190, 730, 530, 816], 0.72, True)]),
    "ri102-pris-spara":([128, 325, 591, 578], [rad("$199", [128, 331, 591, 470], 0.80),
                                               rad("SAVE $50", [128, 486, 591, 572], 0.78)]),
}
for namn, (panel, rader) in LAGER.items():
    rodtext(720, 1280, rader, panel).save(os.path.join(HÄR, "lager", f"{namn}.png"))

# ------------------------------------------------------------ per video
# rod: (lagernamn, [t0,t1], förbehandlingsruta). slut: slutkortets starttid (None = inget kort).
# cy/zon/h: pillrets mitt, sökband och HÖJDINTERVALL — mätt med pillerhojd.py PER VIDEO.
# ⚠️ Höjden är det som fäller batchen tyst. no-precis.py:s standardtak är 40–85 px, och
# samma mall förekommer i en hög variant: mätt 2026-09-23 är CS_107:s piller 94 px och
# GT_110:s 107 px, och utan eget tak hittades de i 265 av 620 respektive 181 av 507 frames.
# I resten stod svenskan kvar ("och dragsko", "Betyg", "stödben") under en engelsk dubb.
# Ögat på sex frames såg det inte — svenskkoll.py:s OCR över hela videon gjorde det.
VIDEOR = {
    "CO_103_H1": {"cy": 946, "zon": [816, 1086], "h": [40, 85], "slut": 16.8,
                  "rod": [("co103-pris", [11.4, 13.8], [112, 432, 607, 603]),
                          ("co103-spara", [13.8, 16.8], [112, 432, 607, 790])]},
    # Lagret går till 22,5 fast rodtext.py mätte fönstret till 22,2: videon är 22,4 s, och
    # de sista två tiondelarna låg utanför lagret med "1 129 kronor." kvar. Sluttiden på ett
    # lager som når videons slut sätts alltid FÖRBI slutet.
    "CS_107_H1": {"cy": 928, "zon": [630, 1010], "h": [35, 120], "slut": None,
                  "rod": [("cs107-pris", [18.0, 22.5], [46, 232, 669, 454])]},
    "CS_108_H1": {"cy": 996, "zon": [900, 1060], "h": [30, 95], "slut": 17.0,
                  "rod": [("cs108-pris1", [0.0, 3.4], [110, 410, 610, 583]),
                          ("cs108-vav", [8.2, 12.5], [90, 253, 631, 495]),
                          ("cs108-jampris", [12.5, 17.0], [110, 307, 609, 618])]},
    "GT_107_H1": {"cy": 946, "zon": [816, 1086], "h": [40, 85], "slut": 15.0,
                  "rod": [("gt-pris-spara", [11.2, 15.0], [110, 307, 609, 596])]},
    "GT_108_H1": {"cy": 946, "zon": [816, 1086], "h": [40, 85], "slut": 11.2,
                  "rod": [("gt-pris-spara", [7.4, 11.2], [110, 307, 609, 596])]},
    "GT_110_H1": {"cy": 998, "zon": [660, 1090], "h": [35, 130], "slut": None,
                  "rod": [("gt110-storlek", [14.0, 17.8], [94, 276, 627, 489])]},
    "OB_101_H1": {"cy": 946, "zon": [870, 1010], "h": [30, 100], "slut": 15.0,
                  "rod": [("ob101-vav", [9.4, 10.9], [93, 317, 629, 523]),
                          ("ob101-pris", [13.0, 15.0], [102, 570, 625, 775])]},
    "OB_102_H1": {"cy": 858, "zon": [728, 998], "h": [40, 85], "slut": 12.6,
                  "rod": [("ob102-pris", [8.8, 12.6], [96, 120, 624, 355])]},
    # 2,7–3,7 s står kameran mot husbilens VITA vägg: pillret smälter in i bakgrunden
    # (mätt 3,0 s: sammanhängande vit yta y 700–1099) och pillerletaren hittar ingen kant
    # att gå på. Då behövs en manuell platta — `fyll` är byggd för just det fallet.
    "PD_106_H1": {"cy": 946, "zon": [750, 1000], "h": [30, 100], "slut": 13.0,
                  "fyll": [{"rect": [160, 905, 560, 990], "t": [2.7, 3.7]}],
                  "rod": [("pd106-pris", [10.8, 13.0], [110, 352, 609, 523])]},
    "PD_107_H1": {"cy": 946, "zon": [870, 1010], "h": [30, 100], "slut": 14.8,
                  "rod": [("storlek-21x10", [0.0, 3.4], [132, 272, 591, 415]),
                          ("pris-spara-lag", [11.0, 14.8], [110, 432, 609, 721])]},
    "RI_102_H1": {"cy": 946, "zon": [870, 1010], "h": [30, 100], "slut": 13.8,
                  "rod": [("ri102-pris-spara", [7.6, 13.8], [110, 307, 609, 596])]},
    # RI_103 har ett RÖTT FÖNSTER 0,4–1,6 s som inte är text utan en röd PIL mot taket —
    # den rörs inte, varken av förbehandlingen eller av ett lager.
    "RI_103_H1": {"cy": 946, "zon": [816, 1086], "h": [40, 85], "slut": 14.2,
                  "rod": [("storlek-21x10-ri", [4.6, 6.2], [132, 452, 587, 598]),
                          ("pris-spara-lag", [10.6, 14.2], [110, 432, 609, 721])]},
    # Slutkortet börjar 21,0 — inte 21,2 som rodtext.py:s vitgräns sa. Skillnaden på två
    # tiondelar räckte för att BÄVERBUTIKEN skulle hinna synas i en frame (mätt 2026-09-23).
    "TR_103_H1": {"cy": 1005, "zon": [930, 1070], "h": [40, 100], "slut": 20.9,
                  "rod": [("tr103-tak", [1.8, 3.4], [82, 384, 637, 601]),
                          ("tr103-jampris", [18.6, 20.9], [110, 548, 609, 840])]},
}
forbehandla = {}
for n, v in VIDEOR.items():
    lager = [{"png": f"../lager/{png}.png", "t": t} for png, t, _ in v["rod"]]
    if v["slut"] is not None:
        lager.append({"png": "../lager/slutkort-720.png", "t": [v["slut"], 999]})
    K = {
        "in": f"../forbehandlad/carashell_{n}.mp4",
        "ut": f"../../us/CaraShellRoof_US_{n}.mp4",
        "srt": f"../srt-us/carashell_{n}.srt",
        "captions": {"zon": v["zon"], "max_chars": 34, "font_px": 30, "standard_cy": v["cy"],
                     "h_min": v["h"][0], "h_max": v["h"][1],
                     "x0": 50, "x1": 670, "bredd_max": 620,
                     **({"av": [[v["slut"], 999]]} if v["slut"] is not None else {}),
                     **({"fyll": v["fyll"]} if v.get("fyll") else {})},
        "lager": lager,
        "qa": f"qa-{n}",
    }
    json.dump(K, open(os.path.join(HÄR, "cap", f"{n}.json"), "w"), indent=1, ensure_ascii=False)
    forbehandla[n] = [{"rect": r, "t": t} for _, t, r in v["rod"]]
json.dump(forbehandla, open(os.path.join(HÄR, "forbehandla.json"), "w"), indent=1)
print(f"{len(LAGER)} lager, {len(VIDEOR)} cap-konfigar, forbehandla.json skrivna")
