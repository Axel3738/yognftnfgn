#!/usr/bin/env python3
"""Norska versioner av CaraShellRoof_OB_115_1 och OB_121_1 (CaraShell NO, 2026-10-02).

Samma väg som US-rundan dagen före (../2026-10-01-us/bygg-us.py): rutorna är
redan mätta i den svenska bilden av Bäverbutikens NO-runda samma vecka
(market-expansion/no/notion-batches/2026-10-01/texter/*.json), så här byts bara
texten mot CaraShells norska copy och rutan breddas när raden blir längre.

⚠️ Priset är CaraShells, inte Bäverbutikens: 1 106 NOK / ord. 1 382,50 NOK ur
factory/produkter/takskyddet.yaml → ekonomi.marknadspriser (NOK), samma tal som
butiken visar på carashell.se/nb. Mätrutornas egen text (1 189 / 1 549 kr) är
Bäverbutikens och används ALDRIG.

Knappen ritas om som i US-rundan: pillret breddas efter den norska texten och
källbilden klistras tillbaka runt det först.
"""
import json, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont

B = os.path.dirname(os.path.abspath(__file__))
ROT = os.path.abspath(os.path.join(B, "../../../.."))
MATT = os.path.join(ROT, "market-expansion/no/notion-batches/2026-10-01")
FET = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
NORMAL = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"

copy = json.load(open(f"{B}/adcopy-NO.json", encoding="utf-8"))
knapp = json.load(open(f"{B}/knapp-stil.json", encoding="utf-8"))

# mätfil (Bäverbutikens namn) → CaraShells SE-fil → målnamn
PAR = {
    "Takoverdrag_OB_15_1": ("CaraShellRoof_OB_115_1", "CaraShellRoof_NO_OB_115_1"),
    "Takoverdrag_OB_21_1": ("CaraShellRoof_OB_121_1", "CaraShellRoof_NO_OB_121_1"),
}


def bredd(t, fet, s):
    bb = ImageFont.truetype(FET if fet else NORMAL, s).getbbox(t)
    return bb[2] - bb[0]


os.makedirs(f"{B}/no", exist_ok=True)
for matt, (se, mal) in PAR.items():
    rutor = json.load(open(f"{MATT}/texter/{matt}.json", encoding="utf-8"))
    rader = copy[mal]["bild"]
    text_rutor, ut = [r for r in rutor if "text" in r], []
    assert len(text_rutor) == len(rader) - 1, (matt, len(text_rutor), len(rader))
    for r, t in zip(text_rutor, rader[:-1]):
        x0, y0, x1, y1 = r["box"]
        mitt = (x0 + x1) / 2
        br = max(x1 - x0, int(bredd(t, r["fet"], r["storlek"]) / 0.88) + 24)
        # pris + jämförpris ligger på vitt: utvidga suddningen så inga spår av
        # den bredare svenska raden blir kvar (samma som US-rundan)
        extra = {"utvidga": 6} if y0 > 900 else {}
        ut.append({**r, **extra,
                   "box": [int(max(0, mitt - br / 2)), y0, int(min(1080, mitt + br / 2)), y1],
                   "text": t})
    if matt == "Takoverdrag_OB_21_1":
        # Priset står på helt vit bakgrund och suddningen lämnar svaga spår;
        # rent vitt först, runt hjulskuggan (mätt: grå x 631..746 ned till y 990).
        VIT = {"fyll": "ljus", "fyllfarg": [255, 255, 255], "alfa": 255, "radie": 0}
        ut = [{**VIT, "box": [330, 958, 630, 994]},
              {**VIT, "box": [330, 994, 760, 1045]},
              {**VIT, "box": [200, 1078, 880, 1140]}] + ut
    json.dump(ut, open(f"{B}/texter-{mal}.json", "w"), ensure_ascii=False, indent=1)

    src = f"{B}/se/{se}/{se}.jpg"
    dst = f"{B}/no/{mal}.jpg"
    subprocess.run([sys.executable, f"{ROT}/pipeline/oversatt-bild.py",
                    "--in", src, "--ut", dst, "--texter", f"{B}/texter-{mal}.json"], check=True)

    # knappen
    k = knapp[matt]
    text = rader[-1]
    bild = Image.open(dst).convert("RGB")
    kalla = Image.open(src).convert("RGB")
    x0, y0, x1, y1 = k["pill"]
    font = ImageFont.truetype(FET, k["storlek"])
    bb = font.getbbox(text)
    inre = (x1 - x0 + 1 - k["se_textbredd"]) / 2
    br = max(x1 - x0 + 1, int(bb[2] - bb[0] + 2 * inre))
    px0, px1 = k["mitt"] - br // 2, k["mitt"] + br - br // 2
    omr = (max(0, px0 - 6), max(0, y0 - 6), min(bild.width, px1 + 7), min(bild.height, y1 + 7))
    bild.paste(kalla.crop(omr), (omr[0], omr[1]))
    d = ImageDraw.Draw(bild)
    d.rounded_rectangle([px0, y0, px1, y1], radius=k["radie"], fill=(24, 72, 120))
    d.text((k["mitt"], k["ink_topp"] - bb[1]), text, font=font, fill=(255, 255, 255), anchor="ma")
    if matt == "Takoverdrag_OB_21_1":
        # "kr" i den svenska prisraden låg på hjulskuggans nedre kant; suddningen
        # lämnar ljusgrå prickar (232..252) där. Skuggan själv är ~225 och rörs inte.
        import numpy as np
        arr = np.asarray(bild).copy()
        omr2 = arr[976:1002, 620:700]
        m = omr2.mean(axis=2)
        omr2[(m > 232) & (m < 253)] = 255
        arr[976:1002, 620:700] = omr2
        bild = Image.fromarray(arr)
    bild.save(dst, quality=95)
    print("✓", dst)
