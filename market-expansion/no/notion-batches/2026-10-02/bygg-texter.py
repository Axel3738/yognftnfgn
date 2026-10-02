#!/usr/bin/env python3
"""Bygger se-texter.json, oversatt-output.json och overrides.json för 2026-10-02.

Alla sexton bilderna delar FD_4-mallen, och i var och en hittar
`oversatt-bild.py --analys` exakt EN form: den röda badgen. Rubrik, underrad,
pris och bottenrad står direkt på sidan, inte i en platta. Varje textrad får
därför en egen, uppmätt ruta (matt/blocken.py) och allt går via
`box_for_form` — detektorn matchar ingenting alls.

Tre saker som är mätta, inte gissade:

  * `storlek` och `fet` per rad är KALIBRERADE (matt/kalibrera.py): den svenska
    texten renderades i Liberation Sans i varje storlek 18..114 och den
    kombination valdes vars bläckbredd och bläckhöjd ligger närmast mätningen.
    Avvikelsen blev 0-2 px på 103 av 104 rader.
  * `ink_topp` = radens uppmätta y0, så den norska texten börjar på exakt samma
    höjd som den svenska. Utan den centrerar rita_box i rutan och lägger texten
    för lågt.
  * `fyllfarg` på badgen är pillrets egen röda [192,36,30], avläst av
    detektorn, och texten är VIT. Kalibreringen läser textfärgen som medianen av
    de mörkaste pixlarna i rutan, och i en badge är det pillret — därför är
    badgen handsatt, aldrig kalibrerad.

⚠️ **Badgen får aldrig lämnas till suddningen ensam.** `sudda()` fyller formens
LJUSA pixler med pillrets färg, och pillrets rundade hörn ÄR ljusa (sidan runt
om). Resultatet blir en rak rektangel i stället för ett piller — samma fälla som
2026-09-30 och 2026-10-01. Badgen ritas därför om helt: först en vit ruta som
täcker hela det gamla pillret, sedan pillret på nytt med `radie` = halva höjden.

⚠️ **Rutorna är bara så breda som texten kräver.** `rita_box` suddar genom att
fylla den svenska textens pixlar med RUTANS median, en enda färg för hela rutan.
En fullbred ruta spänner över både den vita sidan och det genomskinliga
produktfotot, och då blir medianen fel på halva rutan — ett synligt band, mätt
på Takoverdrag_OB_15_1 2026-10-01. Rutan centreras därför på den svenska
textens egen mitt och görs precis så bred som den bredaste av svenskan och
norskan behöver.

  python3 market-expansion/no/notion-batches/2026-10-02/bygg-texter.py
"""
import json
import os

from PIL import Image, ImageDraw, ImageFont

B = os.path.dirname(os.path.abspath(__file__))
FET = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
NORMAL = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
_m = ImageDraw.Draw(Image.new("RGB", (8, 8)))

# Badgens piller, avläst av detektorn i alla sexton bilderna: y 27..100,
# x 51..258, färg [192,36,30], bläcktopp y 46. Höjd 74 ⇒ radie 37.
BADGE_PILL = {"x0": 51, "y0": 27, "x1": 258, "y1": 100,
              "farg": [192, 36, 30], "ink_topp": 46, "storlek": 30}

# Kalibreringen valde FET 30px på den här underraden fast alla andra underrader
# är normal 32px. Mätrutan klippte nedhänget ("p", "g") och sökningen tog då
# fet i en mindre storlek — samma kända fall som 2026-10-01. Satt till samma
# stil som de övriga underraderna i batchen.
STIL_OVERSTYR = {("Takoverdrag_FD_4_4", "under"): (False, 32)}


def bredd(text, fet, storlek):
    f = ImageFont.truetype(FET if fet else NORMAL, storlek)
    bb = _m.textbbox((0, 0), text, font=f)
    return bb[2] - bb[0]


def ruta_bredd(se_px, no_px):
    """rita_box räknar maxbredd som rutan minus 6 % i varje kant (minst 16 px)."""
    return max(se_px + 40, int(no_px / 0.88) + 32)


def main():
    blocken = json.load(open(f"{B}/matt/blocken.json", encoding="utf-8"))
    stil = json.load(open(f"{B}/matt/stil.json", encoding="utf-8"))
    no = json.load(open(f"{B}/oversatt-subagent.json", encoding="utf-8"))

    se_texter, ut_no, overrides = {}, {}, {}
    for namn, rader in blocken.items():
        st = {(r["se"], tuple(r["matt"])): r for r in stil[namn]}
        former, nformer, boxar = [], [], {}
        for k, r in enumerate(rader):
            s = st[(r["se"], tuple(r["matt"]))]
            text_no = no[namn]["rader"][str(k)]
            y0, y1, x0, x1 = r["matt"]
            former.append({"typ": "badge" if r["roll"] == "badge" else "platta",
                           "rader": [r["se"]]})
            nformer.append({"texter": [{"rader": [0], "text": text_no}]})

            if r["roll"] == "badge":
                p = BADGE_PILL
                b_no = bredd(text_no, True, p["storlek"])
                b_se = bredd(r["se"], True, p["storlek"])
                # pillret breddas symmetriskt om norskan behöver mer plats,
                # aldrig smalare — annars sticker den gamla röda kanten fram
                vidd = max(p["x1"] - p["x0"], ruta_bredd(b_se, b_no))
                mitt = (p["x0"] + p["x1"]) / 2
                px0, px1 = int(mitt - vidd / 2), int(mitt + vidd / 2)
                boxar[str(k)] = [
                    {"box": [px0 - 8, p["y0"] - 8, px1 + 8, p["y1"] + 8],
                     "fyll": "ljus", "fyllfarg": [255, 255, 255], "radie": 0, "alfa": 255},
                    {"post": 0, "box": [px0, p["y0"], px1, p["y1"]],
                     "fyll": "mork", "fyllfarg": p["farg"], "radie": (p["y1"] - p["y0"]) // 2,
                     "alfa": 255, "fet": True, "storlek": p["storlek"],
                     "farg": [255, 255, 255], "ink_topp": p["ink_topp"]},
                ]
                continue

            fet, storlek = s["fet"], s["storlek"]
            if (namn, r["roll"]) in STIL_OVERSTYR:
                fet, storlek = STIL_OVERSTYR[(namn, r["roll"])]
            b_se, b_no = bredd(r["se"], fet, storlek), bredd(text_no, fet, storlek)
            vidd = ruta_bredd(b_se, b_no)
            mitt = (x0 + x1) / 2
            bx0, bx1 = int(mitt - vidd / 2), int(mitt + vidd / 2)
            # håll rutan innanför sidan; flytta den i stället för att klippa den
            if bx0 < 0:
                bx1 -= bx0; bx0 = 0
            if bx1 > 1080:
                bx0 -= bx1 - 1080; bx1 = 1080
            boxar[str(k)] = [{"post": 0, "box": [max(0, bx0), y0 - 8, min(1080, bx1), y1 + 8],
                              "fet": fet, "storlek": storlek,
                              "farg": s["farg"], "ink_topp": y0, "utvidga": 4}]

        se_texter[namn] = {"former": former}
        ut_no[namn] = {"former": nformer}
        overrides[namn] = {"box_for_form": boxar}

    for fil, data in [("se-texter.json", se_texter), ("oversatt-output.json", ut_no),
                      ("overrides.json", overrides)]:
        json.dump(data, open(f"{B}/{fil}", "w", encoding="utf-8"),
                  ensure_ascii=False, indent=1)
    print(f"{len(se_texter)} bilder · {sum(len(v['former']) for v in se_texter.values())} rutor")


if __name__ == "__main__":
    main()
