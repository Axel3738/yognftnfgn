#!/usr/bin/env python3
"""bygg-cap.py — lagren och konfigen för de amerikanska videorna (US-runda 2026-09-29, 3 st).

Tre sorters inbränd svenska i källorna, alla mätta om för den här batchen:
  1. ordcaptions i vitt piller nederst → no-precis.py suddar pillret och lägger den
     engelska cuen. Pillrets y-band och HÖJD sätts PER VIDEO (pillerhojd.py 2026-09-29:
     CS_112 median 74 px / y 912–985, SP_104_H2 65 px / 977–1049, UG_102 60 px / 857–916).
  2. stora röda pop-texter → förbehandling (blur + mörk platta) + PNG med den amerikanska
     texten i samma stil. Fönstren mätta med rodtext.py + tidslinje.py PÅ RENDERN, inte på
     källan: HeyGens precision-render har egen längd, så källans tider ligger fel.
  3. slutkort: INGEN av de tre har ett (rodtext.py: slutkort_frames 0 i alla tre, och
     leveranskön dömde alla tre "ren"). Inget slutkortslager byggs den här rundan.

⚠️ Texten i lagren säger bara det som är sant på den amerikanska sidan, läst live
2026-09-29: 199 dollar från 249 (schema.org på carashell.com), 21 × 10 ft, 210D.
⚠️ CS_112_H1:s röda block bär "5,0/5" under priset — ett betyg. Panelen raderar det och
priset står ensamt med jämförpriset under. Produkten har bara seedade recensioner
(brieferna säger det uttryckligen), så betyget översätts aldrig, det stryks.

    python3 bygg-cap.py            # skriver cap/<n>.json, lager/*.png, forbehandla.json
"""
import json, os
from PIL import Image, ImageDraw, ImageFont

HÄR = os.path.dirname(os.path.abspath(__file__))
FET = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
NORMAL = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
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


def rad(text, box, andel=0.72, stryk=False):
    """En textrad som fyller `andel` av rutans höjd."""
    return (text, max(28, int((box[3] - box[1]) * andel)), box, stryk)


# ------------------------------------------------------------ ett lager per delfönster
# Rutorna mätta 2026-09-29 med rodtext.py + tidslinje.py och kontrollerade mot frames.
LAGER = {
    # UG_102: "1 129 kr." över "Ord. 1 469 kr." — samma två rader, dollar i stället.
    "ug102-pris":   ([110, 200, 610, 420], [rad("$199", [150, 214, 570, 326], 0.82),
                                            rad("WAS $249", [160, 334, 560, 404], 0.70)]),
    # ⚠️ CS_112: panelen går ned till 590 med FLIT — där står "5,0/5" i källan.
    # Betyget stryks, jämförpriset tar dess plats.
    "cs112-pris":   ([100, 296, 620, 592], [rad("$199", [120, 312, 600, 470], 0.82),
                                            rad("$249", [225, 484, 475, 578], 0.70, True)]),
    "sp104h2-vav":  ([40, 266, 646, 522], [rad("210D WEAVE", [48, 276, 638, 512], 0.74)]),
    "sp104h2-pris": ([106, 322, 624, 654], [rad("$199", [124, 334, 606, 502], 0.82),
                                            rad("$249", [180, 516, 546, 642], 0.70, True)]),
}
for namn, (panel, rader) in LAGER.items():
    rodtext(720, 1280, rader, panel).save(os.path.join(HÄR, "lager", f"{namn}.png"))

# ------------------------------------------------------------ per video
# rod: (lagernamn, [t0,t1], förbehandlingsruta). slut: None — ingen av de tre har slutkort.
# cy/zon/h: pillrets mitt, sökband och HÖJDINTERVALL — mätt med pillerhojd.py PER VIDEO.
# ⚠️ Tiderna nedan är mätta PÅ RENDERN (rodtext.py mot render/carashell_<n>.mp4).
VIDEOR = json.load(open(os.path.join(HÄR, "videor.json")))

forbehandla = {}
for n, v in VIDEOR.items():
    lager = [{"png": f"../lager/{png}.png", "t": t} for png, t, _ in v["rod"]]
    K = {
        "in": f"../forbehandlad/carashell_{n}.mp4",
        "ut": f"../../us/CaraShellRoof_US_{n}.mp4",
        "srt": f"../srt-us/carashell_{n}.srt",
        "captions": {"zon": v["zon"], "max_chars": 34, "font_px": 30, "standard_cy": v["cy"],
                     "h_min": v["h"][0], "h_max": v["h"][1],
                     "x0": 50, "x1": 670, "bredd_max": 620,
                     **({"fyll": v["fyll"]} if v.get("fyll") else {})},
        "lager": lager,
        "qa": f"qa-{n}",
    }
    json.dump(K, open(os.path.join(HÄR, "cap", f"{n}.json"), "w"), indent=1, ensure_ascii=False)
    forbehandla[n] = [{"rect": r, "t": t} for _, t, r in v["rod"]]
json.dump(forbehandla, open(os.path.join(HÄR, "forbehandla.json"), "w"), indent=1)
print(f"{len(LAGER)} lager, {len(VIDEOR)} cap-konfigar, forbehandla.json skrivna")
