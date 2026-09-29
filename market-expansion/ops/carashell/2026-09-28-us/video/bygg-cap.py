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
Image.open(os.path.join(HÄR, "rod", "OB_103_H1-slutkort.png")).convert("RGBA").crop((55, 440, 665, 810)).save(os.path.join(HÄR, "lager", "produkt-720.png"))
from slutkort import slutkort as us_slutkort
us_slutkort(720, 1280, os.path.join(HÄR, "lager", "produkt-720.png"), os.path.join(HÄR, "lager", "slutkort-720.png"))


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
    # Rutorna mätta 2026-09-28 med rodtext.py + tidslinje.py och kontrollerade mot frames.
    "sp104-vav":   ([44, 320, 640, 490], [rad("210D FABRIC", [50, 328, 634, 482], 0.74)]),
    "sp104-pris":  ([100, 320, 615, 640], [rad("$199", [100, 328, 615, 490], 0.82),
                                           rad("$249", [175, 505, 540, 632], 0.72, True)]),
    # ⚠️ Panelen täcker HELA det svenska fönstret, inklusive raden "19,5 m²" —
    # kvadratmeter säger en amerikansk köpare ingenting, den blir 210 sq ft.
    "cs109-pris":  ([140, 248, 600, 460], [rad("$199", [146, 254, 594, 350], 0.80),
                                           rad("210 SQ FT", [146, 360, 594, 452], 0.70)]),
    # ⚠️ Panelen sträcker sig ned över "5,0/5" med FLIT: betyget är ett recensions-
    # påstående, och brieferna säger att produkten bara har seedade recensioner.
    # Panelen raderar det och lämnar priset ensamt. Samma sak i CO_105.
    "pd110-pris":  ([120, 320, 600, 590], [rad("$199", [126, 340, 594, 470], 0.82)]),
    "co105-pris":  ([120, 320, 600, 590], [rad("$199", [126, 340, 594, 470], 0.82)]),
    "ob103-pris":  ([120, 272, 600, 545], [rad("$199", [126, 280, 594, 410], 0.82),
                                           rad("$249", [195, 425, 525, 538], 0.70, True)]),
    "ob104-pris":  ([120, 272, 600, 560], [rad("$199", [126, 280, 594, 410], 0.82),
                                           rad("$249", [195, 425, 525, 552], 0.70, True)]),
}
from kort import kort as us_kort
us_kort(ut=os.path.join(HÄR, "lager", "ob103-fraga.png"))

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
    # cy/zon/h mätta PER VIDEO med pillerhojd.py 2026-09-28 (medianhöjd i [ ]):
    # CO 85, CS 79, OB_103 61, OB_104 61, PD 85, SP_H3 62, SP_H4 86. Taket sätts över
    # p90 så de höga varianterna inte tappas tyst — det var felet som fällde 23/9.
    "SP_104_H3": {"cy": 1010, "zon": [640, 1260], "h": [30, 130], "slut": None,
                  "fyll": [{"rect": [0, 962, 720, 1078], "t": [17.4, 18.5]}],
                  "rod": [("sp104-vav",  [19.8, 23.4], [44, 270, 640, 515]),
                          ("sp104-pris", [25.4, 28.8], [110, 330, 615, 635])]},
    "SP_104_H4": {"cy": 1010, "zon": [640, 1260], "h": [30, 140], "slut": None,
                  "rod": [("sp104-vav",  [11.6, 15.2], [44, 180, 700, 515]),
                          ("sp104-pris", [17.0, 20.1], [110, 330, 615, 635])]},
    "CS_109_H1": {"cy": 950, "zon": [620, 1190], "h": [30, 130], "slut": None,
                  "rod": [("cs109-pris", [17.8, 25.5], [110, 245, 719, 800])]},
    "PD_110_H1": {"cy": 950, "zon": [780, 1070], "h": [30, 130], "slut": None,
                  "fyll": [{"rect": [0, 916, 720, 998], "t": [13.7, 14.9]}],
                  "rod": [("pd110-pris", [19.2, 24.1], [76, 230, 600, 600])]},
    "CO_105_H1": {"cy": 950, "zon": [680, 1130], "h": [30, 135], "slut": None,
                  "rod": [("co105-pris", [9.4, 13.5], [120, 230, 600, 600])]},
    # Slutkortet börjar 24,0 resp. 19,4 (rodtext.py): BÄVERBUTIKEN-loggan, 10 recensioner,
    # kr-priser och "Finns i lager - Begränsat antal". Hela kortet byts mot det amerikanska.
    "OB_103_H1": {"cy": 995, "zon": [630, 1060], "h": [25, 175], "slut": 24.0,
                  "rod": [("ob103-fraga", [0.85, 2.95], [140, 545, 630, 720]),
                          ("ob103-pris", [19.6, 24.0], [120, 275, 600, 550])]},
    "OB_104_H1": {"cy": 860, "zon": [630, 1140], "h": [25, 260], "slut": 19.4,
                  "fyll": [{"rect": [0, 812, 720, 902], "t": [12.4, 13.7]}],
                  "rod": [("ob104-pris", [15.0, 19.4], [120, 275, 600, 560])]},
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
