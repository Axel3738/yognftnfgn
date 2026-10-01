#!/usr/bin/env python3
"""Bygger se-texter.json, oversatt-output.json och overrides.json för 2026-10-01.

⚠️ Varför ALLT är manuella rutor den här gången: i tretton av de femton bilderna
står rubrik, underrad, pris och jämförpris DIREKT på den vita sidan, inte i en
platta. `oversatt-bild.py --analys` hittar då bara CTA-knappen (Taljset_OB_1_1
och Taljset_PD_4_1: "1 textformer"). Automatiken har alltså inget att matcha mot,
och den som litar på detektorns utdata översätter en knapp och lämnar rubriken
svensk.

Varje textrad är därför mätt i bilden själv — bläckets verkliga utsträckning —
och får en egen ruta:

  * `ink_topp` = radens uppmätta y0, så den norska texten börjar på exakt samma
    höjd som den svenska. Utan den centrerar rita_box i rutan, och blockh
    underskattar bläckhöjden (mätt 2026-09-30: 13 px för lågt).
  * `storlek` och `fet` är KALIBRERADE, inte gissade: för varje rad renderades
    den svenska texten i Liberation Sans i varje storlek 18..114, och den
    kombination valdes vars bläckbredd och bläckhöjd ligger närmast mätningen.
    Avvikelsen blev 0-1 px på nästan alla rader.
  * `farg` är medianen av de 15 % mörkaste pixlarna i rutan — textens egen färg.

⚠️ **CTA-knappen får ALDRIG lämnas till detektorn.** Första bygget gjorde det,
och alla tretton knappar kom ut som RAKA REKTANGLAR i stället för rundade
pillar: `sudda()` fyller formens ljusa pixlar med knappfärgen, och pillrets
rundade hörn ÄR ljusa (den vita sidan runt om). Samma fälla som badgen
2026-09-30. Dessutom läste detektorn knapptexten som `normal` fast den är fet,
så texten kom ut i fel vikt och fel storlek. Knappen ritas nu om som en egen
ruta: uppmätt pill (`fyllfarg` [24,72,120], `radie` = halva höjden), fet vit
text i kalibrerad storlek, och pillen BREDDAS symmetriskt om den norska texten
behöver mer plats — aldrig smalare, så den gamla pillen alltid täcks helt.

⚠️ Rutorna är inte heller fullbreda längre. Första bygget satte varje centrerad
rad till [0, …, 1080], och då tog suddningen radmedianen över två bakgrunder i
Takoverdrag_OB_15_1 (prisplattan slutar x 31..1050, utanför den ligger fotot) —
jämförprisraden fick ett synligt ljusare band tvärs över plattan. Rutan är nu
bara så bred som den svenska texten plus det den norska behöver.

Fyra rättelser som huvudsessionen gjorde i subagentens norska (granskningen):
  * "ingenting å fylle på" → "ingenting å fylle selv". Svenskan "inget att
    fylla i" betyder att kalendern kommer färdigfylld, inte att något ska
    fyllas PÅ. (Rättelserna är DELSTRÄNGAR — första bygget hade dem som hela
    rader och raden gick igenom orättad.)
  * "Fra høst til vår, på plass" → "… på din plass". Den svenska raden säger
    var överdraget ligger kvar, och den trognare formen rymdes.
  * Knapptexterna "Kjøp kalender" → "Kjøp kalenderen" och "Vesken: 1 039 kr"
    → "Vesken til 1 039 kr": obestämd form och kolon är inte norsk knapptext.

  python3 market-expansion/no/notion-batches/2026-10-01/bygg-texter.py
"""
import json
import os

from PIL import Image, ImageDraw, ImageFont

B = os.path.dirname(os.path.abspath(__file__))
SP = os.path.join(B, "matt")   # mätningarna ligger i repot, inte i scratchpaden
FET = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
NORMAL = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"

# Delsträngsrättelser i subagentens norska, efter huvudsessionens granskning.
RATTA = [
    ("ingenting å fylle på", "ingenting å fylle selv"),
    ("Fra høst til vår, på plass", "Fra høst til vår, på din plass"),
    ("Kjøp kalender", "Kjøp kalenderen"),
    ("Vesken: 1 039 kr", "Vesken til 1 039 kr"),
]

# Fyra rader kalibrerades fel av bredd/höjd-sökningen, för att mätrutan klippte
# nedhänget ("p", "g") och sökningen då valde FET i en mindre storlek. De är
# satta till samma stil som den rad de hör ihop med i samma bild.
STIL_OVERSTYR = {
    ("Takoverdrag_OB_21_1", "räcker."): (False, 32, [19, 19, 17]),
    ("Taljset_BOF_1_1", "Ordinarie 1 139 kr. Spara 270 kr."): (False, 32, [19, 18, 16]),
    ("Taljset_CS_4_1", "Ordinarie 1 139 kr. Spara 270 kr."): (False, 32, [19, 18, 16]),
    ("Taljset_CS_4_1", "30 delar i en väska: 6 knivar och 6 järn"): (False, 32, [19, 18, 17]),
    ("Golfkalender_BOF_1_1", "ordinarie 719 kr. Spara 170 kr."): (False, 32, [19, 18, 16]),
    ("Golfkalender_CS_4_1", "ordinarie 719 kr. Spara 170 kr."): (False, 32, [19, 18, 16]),
}

# Rader som är vänsterställda: svensk rad → (vänsterkant, rutans x0, rutans x1).
# Listorna ligger till höger om produktfotot, som slutar x≈506 i båda bilderna.
VANSTER = {}
for namn, rader in [
    ("Golfkalender_LI_1_1", ["Golfbollar", "Peggar, plast och trä", "Bollmarkeringar",
                             "Greenlagare med spegel", "Klubbrengöringsborste",
                             "Golfhandduk med clips"]),
    ("Taljset_LI_1_1", ["6 knivar", "6 järn", "Bladskydd till varje blad",
                        "Läderstrop och polermedel", "Slippapper och träbit",
                        "Skärskyddade handskar"]),
]:
    VANSTER[namn] = {r: (573, 530, 1070) for r in rader}
for namn in ("Golfkalender_FD_2_1", "Golfkalender_FD_2_2"):
    VANSTER[namn] = {"549 kr,": (282, 250, 580), "ord. 719 kr": (592, 584, 1000)}

# Badgen: röd pill, uppmätt y 398..480 (h 83 ⇒ radie 41), x 62..350,
# färg [200,15,46], bläcktopp y 419. Pillret breddas till x 372 eftersom
# "Farsdagssalg" är bredare än "Fars dag-rea" vid samma fontstorlek.
BADGE = [
    {"box": [52, 388, 382, 490], "fyll": "ljus", "fyllfarg": [255, 255, 255],
     "radie": 0, "alfa": 255},
    {"post": 0, "box": [62, 398, 372, 481], "fyll": "mork",
     "fyllfarg": [200, 15, 46], "radie": 41, "alfa": 255,
     "fet": True, "storlek": 40, "farg": [255, 255, 255], "ink_topp": 419},
]

CTA = {
    "Golfkalender_BOF_1_1": "Köp kalendern", "Golfkalender_BOF_2_1": "Se villkoren",
    "Golfkalender_CS_4_1": "Se priset", "Golfkalender_LI_1_1": "Se hela listan",
    "Golfkalender_PD_4_1": "Se hela kalendern",
    "Takoverdrag_OB_15_1": "Se remmarna i detalj",
    "Takoverdrag_OB_21_1": "Se kanten hänga ner",
    "Taljset_BOF_1_1": "Väskan för 869 kr", "Taljset_CS_4_1": "270 kr att spara",
    "Taljset_LI_1_1": "Allt i väskan", "Taljset_OB_1_1": "Handskarna som skyddar",
    "Taljset_OB_2_1": "Träbiten för att öva", "Taljset_PD_4_1": "Väskan med 30 delar",
}

_matare = ImageDraw.Draw(Image.new("RGB", (8, 8)))


def bredd(text, fet, storlek):
    """Bläckbredden i px — samma mått som rita_box mäter texten med."""
    f = ImageFont.truetype(FET if fet else NORMAL, storlek)
    bb = f.getbbox(text)
    return bb[2] - bb[0]


def ruta_bredd(se_px, no_px):
    """rita_box räknar maxbredd som rutan minus 6 % i varje kant. Rutan måste
    alltså rymma den norska texten med den marginalen, och samtidigt täcka hela
    den svenska raden plus antialias."""
    return max(se_px + 100, int(no_px / 0.88) + 24)


def main():
    blocken = json.load(open(f"{SP}/blocken.json", encoding="utf-8"))
    no = json.load(open(f"{SP}/no-text.json", encoding="utf-8"))
    stil = json.load(open(f"{SP}/stil.json", encoding="utf-8"))
    knapp = json.load(open(f"{SP}/knapp-stil.json", encoding="utf-8"))

    se_ut, no_ut, ov_ut = {}, {}, {}
    for namn, block in blocken.items():
        norad = {}
        for r in no[namn]["rader"]:
            t = r["no"]
            for fran, till in RATTA:
                t = t.replace(fran, till)
            norad[r["se"]] = t
        former, nformer, boxar = [], [], []

        def lagg(s, y0, y1, x0, x1, fet, storlek, farg):
            no_px = bredd(norad[s], fet, storlek)
            v = VANSTER.get(namn, {}).get(s)
            if v:
                vx, bx0, bx1 = v
            else:
                br = ruta_bredd(x1 - x0 + 1, no_px)
                mitt = (x0 + x1) / 2
                bx0, bx1 = int(max(0, mitt - br / 2)), int(min(1080, mitt + br / 2))
                vx = None
            ruta = {"box": [bx0, y0 - 9, bx1, y1 + 9], "fet": fet, "storlek": storlek,
                    "farg": list(farg), "ink_topp": y0, "post": 0}
            if vx is not None:
                ruta["vanster_x"] = vx
            former.append({"typ": "platta", "rader": [s]})
            nformer.append({"texter": [{"rader": [0], "text": norad[s]}]})
            boxar.append([ruta])

        for b in block:
            s = b["se"]
            y0, y1, x0, x1 = b["matt"]
            fet, storlek, farg = STIL_OVERSTYR.get((namn, s)) or tuple(stil[namn][s])
            lagg(s, y0, y1, x0, x1, fet, storlek, farg)

        if namn in ("Golfkalender_FD_2_1", "Golfkalender_FD_2_2"):
            k = [i for i, b in enumerate(block) if b["se"] == "Fars dag-rea"][0]
            boxar[k] = [dict(BADGE[0]), dict(BADGE[1])]
            for txt, (y0, y1) in [("549 kr,", (1118, 1199)), ("ord. 719 kr", (1153, 1184))]:
                fet, storlek, farg = stil[namn][txt]
                lagg(txt, y0, y1, *VANSTER[namn][txt][1:], fet=fet, storlek=storlek, farg=farg)
            # ⚠️ Prisplattans två delar ligger så tätt att den grå rutans suddning
            # annars äter den fetas sista tecken: en gemensam utplåning först,
            # i samma ordning som 2026-09-30.
            boxar[-2].insert(0, {"box": [250, 1109, 1000, 1208], "fyll": "ljus",
                                 "fyllfarg": [255, 255, 255], "radie": 0, "alfa": 255})
        else:
            k = knapp[namn]
            x0, y0, x1, y1 = k["pill"]
            inre = (x1 - x0 + 1 - k["se_textbredd"]) / 2          # pillens egen luft
            no_px = bredd(norad[CTA[namn]], True, k["storlek"])
            br = max(x1 - x0 + 1, int(no_px + 2 * inre))
            px0, px1 = k["mitt"] - br // 2, k["mitt"] + br - br // 2
            former.append({"typ": "knapp", "rader": [CTA[namn]]})
            nformer.append({"texter": [{"rader": [0], "text": norad[CTA[namn]]}]})
            # ⚠️ Rutan ritar INGET: den är bara en tom plats så att formerna
            # matchar, och knappen ritas av knapp.py efteråt (se den filen om
            # varför rita_box inte kan göra en rundad pill).
            boxar.append([{"box": [px0, y0, px1, y1]}])

        se_ut[namn] = {"former": former}
        no_ut[namn] = {"former": nformer, "copy": no[namn]["copy"]}
        ov_ut[namn] = {"box_for_form": {str(i): b for i, b in enumerate(boxar) if b}}

    hdr = ("Varje rad är mätt i bilden och ritas om som en egen ruta — detektorn "
           "hittar bara CTA-knappen i de flesta bilderna, och gör en rektangel av "
           "den. Se bygg-texter.py.")
    se_ut["_kommentar"] = hdr
    no_ut["_kommentar"] = ("Norsk bokmål av sonnet-subagent 2026-10-01 mot "
                           "docs/copy-regler.md och priser lästa ur beverbutikken.no "
                           "samma dag. Huvudsessionen har granskat och rättat fyra rader.")
    ov_ut["_kommentar"] = hdr
    for fil, data in [("se-texter.json", se_ut), ("oversatt-output.json", no_ut),
                      ("overrides.json", ov_ut)]:
        json.dump(data, open(f"{B}/{fil}", "w", encoding="utf-8"),
                  ensure_ascii=False, indent=1)
        print("skrev", fil)


if __name__ == "__main__":
    main()
