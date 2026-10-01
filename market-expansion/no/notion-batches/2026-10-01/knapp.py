#!/usr/bin/env python3
"""Ritar om CTA-knappen i de byggda norska bilderna.

⚠️ Varför knappen inte kan gå genom `oversatt-bild.py` alls — varken via
detektorn eller via en manuell ruta i overrides.json. Båda vägarna ger en RAK
REKTANGEL i stället för en rundad pill, och det beror på ordningen i `rita_box`:
suddningen körs FÖRE plattan ritas, den läser rutan som en mörk platta (medel 72
på knappblått) och fyller då rutans LJUSA pixlar med rutans median. Pillrets
rundade hörn är ljusa — de är den vita sidan runt knappen — så de blir blå. Den
rundade plattan som sedan ritas ovanpå täcker bara mitten, och de blåfärgade
hörnen blir kvar. Mätt två gånger 2026-10-01, först med detektorn och sedan med
`radie: 51` i en manuell ruta; båda gav samma rektangel. Detektorn läste dessutom
den feta knapptexten som `normal`, så texten kom ut i fel vikt.

Lösningen är att börja om från källbilden: hela knappytan kopieras tillbaka ur
den SVENSKA bilden, och sedan ritas pillen och texten här. Då återställs både
pillrets hörn och det som ligger bakom dem — i Takoverdrag_OB_15_1 är de två
övre hörnen GRUS, inte vit sida (mätt: [120,115,111] mot [255,255,255] i de
tolv andra), så en vit utplåningsruta hade lagt två vita fyrkanter i fotot.

Pillen växer men krymper aldrig: bredden är max(svenska pillens bredd, norska
textens bredd + samma inre luft som svenskan hade), centrerad på samma mitt. Då
täcker den nya pillen alltid den gamla helt.

  python3 market-expansion/no/notion-batches/2026-10-01/knapp.py
"""
import json
import os

from PIL import Image, ImageDraw, ImageFont

B = os.path.dirname(os.path.abspath(__file__))
SP = os.path.join(B, "matt")   # mätningarna ligger i repot, inte i scratchpaden
FET = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
BLA = (24, 72, 120)


def main():
    knapp = json.load(open(f"{SP}/knapp-stil.json", encoding="utf-8"))
    no = json.load(open(f"{B}/oversatt-output.json", encoding="utf-8"))
    se = json.load(open(f"{B}/se-texter.json", encoding="utf-8"))
    jobb = {j["namn"]: j["mal"]["annonsNamn"]
            for j in json.load(open(f"{B}/jobb.json", encoding="utf-8"))["jobb"]}

    for namn, k in knapp.items():
        mal = jobb[namn]
        sfil, nfil = f"{B}/se/{namn}.jpg", f"{B}/no/{mal}.jpg"
        if not os.path.exists(nfil):
            print(f"⚠️  {mal}: den norska bilden saknas, hoppad")
            continue
        # knappen är sista formen i se-texter/oversatt-output
        text = no[namn]["former"][-1]["texter"][0]["text"]
        assert se[namn]["former"][-1]["typ"] == "knapp", namn

        bild = Image.open(nfil).convert("RGB")
        kalla = Image.open(sfil).convert("RGB")
        x0, y0, x1, y1 = k["pill"]
        storlek = k["storlek"]
        font = ImageFont.truetype(FET, storlek)
        bb = font.getbbox(text)
        no_px = bb[2] - bb[0]
        inre = (x1 - x0 + 1 - k["se_textbredd"]) / 2
        br = max(x1 - x0 + 1, int(no_px + 2 * inre))
        px0, px1 = k["mitt"] - br // 2, k["mitt"] + br - br // 2

        # 1) börja om från källbilden i hela det område knappen kan röra
        omr = (max(0, px0 - 6), max(0, y0 - 6),
               min(bild.width, px1 + 7), min(bild.height, y1 + 7))
        bild.paste(kalla.crop(omr), (omr[0], omr[1]))

        # 2) pillen
        d = ImageDraw.Draw(bild)
        d.rounded_rectangle([px0, y0, px1, y1], radius=k["radie"], fill=BLA)

        # 3) texten, med bläcktoppen på exakt samma höjd som svenskan
        d.text((k["mitt"], k["ink_topp"] - bb[1]), text, font=font,
               fill=(255, 255, 255), anchor="ma")
        bild.save(nfil, quality=95)
        print(f"✓ {mal}  pill {px0}..{px1} (SE {x0}..{x1})  «{text}»")


if __name__ == "__main__":
    main()
