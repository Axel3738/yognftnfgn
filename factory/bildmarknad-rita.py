#!/usr/bin/env python3
"""bildmarknad-rita.py — RITAR: suddar källans rad och skriver marknadens.

Steg 3 av tre i `factory/bildmarknad.mjs` (mäta → döma → rita). Tar en plan på
stdin eller som fil och skriver bilden. Dömer ingenting: varje text som ritas
är redan beslutad och brandgranskad av bildmarknad.mjs.

    python3 factory/bildmarknad-rita.py <plan.json>

Planen:
    { "in": "<jpg>", "ut": "<jpg>", "atgarder": [
        { "ruta": [x0,y0,x1,y1], "bakgrund": {"klass":"enfargad","farg":[28,76,122]},
          "stil": {…ur bildmarknad-mat.py…}, "ny_text": "819 kr.", "stryk": false } ] }

SUDDNINGEN SKA BLI SKARP, INTE SUDDIG. Bakgrunden i de här annonserna är en
jämn lodrät gradient; en blur hade synts som en oskarp fläck direkt. Därför
återskapas bakgrunden i stället:

    enfargad  rutan fylls med plattans egen färg (knapp, band, priskort)
    gradient  varje kolumn interpoleras mellan sin egen pixel ovanför och under
    foto      bara TEXTENS pixlar målas igen med cv2.inpaint — resten av fotot
              lämnas orört. Saknas cv2 blir raden HOPPAD, aldrig tyst ifylld.
"""
import json
import sys

try:
    import numpy as np
    from PIL import Image, ImageDraw, ImageFont
except ImportError:  # pragma: no cover
    sys.exit("BEROENDE_SAKNAS: Pillow och numpy krävs.")

FET = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
NORMAL = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
RESERV_FET = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
RESERV_NORMAL = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

import importlib.util
import os

# Ink-tröskeln måste vara SAMMA som mätningens, annars suddas en annan mask än
# den som mättes. Den läses därför UR mätskriptet i stället för att skrivas två
# gånger. Filnamnet bär bindestreck och går inte att importera på vanligt vis.
_MAT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "bildmarknad-mat.py")
_spec = importlib.util.spec_from_file_location("bildmarknad_mat", _MAT)
_mat = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_mat)
INK_ANDEL = _mat.INK_ANDEL

# Hur långt utanför textens pixlar fotoinpaintingen målar. 3 px täcker
# kantutjämningen; mätt 2026-09-20 på GT_2 lämnade 1 px kvar en grå spökkontur
# av bokstäverna.
INPAINT_MARGINAL = 3


def _font(fet, storlek):
    for s in ([FET, RESERV_FET] if fet else [NORMAL, RESERV_NORMAL]):
        if os.path.exists(s):
            return ImageFont.truetype(s, max(6, int(round(storlek))))
    raise SystemExit("TYPSNITT_SAKNAS: varken Liberation Sans eller DejaVu Sans finns.")


def _inkmask(a, ruta, bakfarg):
    x0, y0, x1, y1 = ruta
    sub = a[y0:y1 + 1, x0:x1 + 1]
    d = np.sqrt(((sub - np.array(bakfarg, dtype=np.float32)) ** 2).sum(axis=2))
    topp = float(d.max())
    if topp <= 1e-6:
        return np.zeros(sub.shape[:2], bool)
    return d > topp * INK_ANDEL


def sudda_enfargad(a, ruta, farg):
    x0, y0, x1, y1 = ruta
    a[y0:y1 + 1, x0:x1 + 1] = np.array(farg, dtype=np.float32)
    return f"fylld med plattans färg {[round(f) for f in farg]}"


def sudda_gradient(a, fri, ruta):
    """Per kolumn: linjär interpolation mellan bandet ovanför och under rutan.

    På en lodrät gradient återskapar det bakgrunden exakt — resultatet är
    skarpt, utan skarv, eftersom varje kolumn möter sina egna grannpixlar."""
    H = a.shape[0]
    x0, y0, x1, y1 = ruta
    m = max(6, (y1 - y0) // 3)
    ta, tb = max(0, y0 - m), y0
    ba, bb = y1 + 1, min(H, y1 + 1 + m)
    if tb - ta < 2 or bb - ba < 2:
        return None
    mt, mb = fri[ta:tb, x0:x1 + 1], fri[ba:bb, x0:x1 + 1]
    with np.errstate(invalid="ignore"):
        topp = np.nanmean(np.where(mt[..., None], a[ta:tb, x0:x1 + 1], np.nan), axis=0)
        bot = np.nanmean(np.where(mb[..., None], a[ba:bb, x0:x1 + 1], np.nan), axis=0)
    if np.isnan(topp).any() or np.isnan(bot).any():
        return None
    n = y1 - y0 + 1
    w = np.linspace(0, 1, n + 2)[1:-1][:, None, None]
    a[y0:y1 + 1, x0:x1 + 1] = topp[None] * (1 - w) + bot[None] * w
    return f"gradient interpolerad kolumnvis mellan {m} px ovanför och {m} px under"


def sudda_foto(a, ruta, bakfarg):
    """Bara textens pixlar målas igen — fotot runt omkring rörs inte."""
    try:
        import cv2
    except ImportError:
        return None
    x0, y0, x1, y1 = ruta
    ink = _inkmask(a, ruta, bakfarg).astype(np.uint8) * 255
    k = np.ones((INPAINT_MARGINAL * 2 + 1,) * 2, np.uint8)
    ink = cv2.dilate(ink, k)
    sub = np.clip(a[y0:y1 + 1, x0:x1 + 1], 0, 255).astype(np.uint8)
    lagad = cv2.inpaint(sub[:, :, ::-1], ink, 7, cv2.INPAINT_TELEA)[:, :, ::-1]
    a[y0:y1 + 1, x0:x1 + 1] = lagad.astype(np.float32)
    return f"cv2.inpaint (TELEA) på textens pixlar, {INPAINT_MARGINAL} px marginal — ungefärlig på foto"


def rita_rad(bild, atg):
    """Skriver den nya texten där den gamla stod: samma storlek, vikt, färg och
    kant. Ryms den inte krymps stilen — och det RAPPORTERAS."""
    stil = atg["stil"]
    text = atg["ny_text"]
    ruta = atg["ruta"]
    ib = stil["ink_box"]
    fet = bool(stil.get("fet"))
    storlek = float(stil["storlek"])
    maxbredd = atg.get("maxbredd") or (ruta[2] - ruta[0] + 1)

    krympt = None
    f = _font(fet, storlek)
    bb = f.getbbox(text)
    while (bb[2] - bb[0]) > maxbredd and storlek > 7:
        storlek *= 0.97
        f = _font(fet, storlek)
        bb = f.getbbox(text)
    if round(storlek, 1) != round(float(stil["storlek"]), 1):
        krympt = {"fran": round(float(stil["storlek"]), 1), "till": round(storlek, 1),
                  "varfor": f'"{text}" var bredare än {maxbredd} px vid källans storlek'}

    # Lodrätt: samma BASLINJE som källan. Origo→baslinje beror bara på
    # typsnittet, så ett prov med KÄLLANS text vid samma storlek ger var källan
    # ritades — och den nya texten ritas från exakt samma origo.
    prov_f = _font(fet, storlek)
    pbb = prov_f.getbbox(atg.get("kalltext") or text)
    origo_y = ib[1] - pbb[1]

    # Vågrätt: kanten mätningen läste.
    bredd = bb[2] - bb[0]
    if stil.get("justering") == "vanster":
        origo_x = ib[0] - bb[0]
    else:
        mitt = (ib[0] + ib[2] + 1) / 2
        origo_x = mitt - bredd / 2 - bb[0]

    d = ImageDraw.Draw(bild)
    farg = tuple(int(c) for c in stil["textfarg"])
    d.text((origo_x, origo_y), text, font=prov_f, fill=farg)

    if atg.get("stryk"):
        # Jämförpriset STRYKS ÖVER. Utan strecket läses raden som ett ANDRA
        # pris i stället för ett överstruket förepris — samma regel som
        # pipeline/omdubb/inbrand.mjs byggPopblock.
        ny = prov_f.getbbox(text)
        y = origo_y + (ny[1] + ny[3]) / 2
        tj = max(2, round(storlek * 0.055))
        d.line([(origo_x + ny[0], y), (origo_x + ny[2], y)], fill=farg, width=tj)

    return {"storlek": round(storlek, 1), "krympt": krympt,
            "origo": [round(origo_x, 1), round(origo_y, 1)],
            "justering": stil.get("justering", "center")}


def main():
    plan = json.load(open(sys.argv[1], encoding="utf-8")) if len(sys.argv) > 1 else json.load(sys.stdin)
    bild = Image.open(plan["in"]).convert("RGB")
    a = np.asarray(bild).astype(np.float32).copy()
    H, W = a.shape[:2]

    # Alla rutor maskas bort innan en enda kolumn samplas — grannraden är
    # bakgrund för ingen (samma regel som i mätningen).
    fri = np.ones((H, W), bool)
    for atg in plan["atgarder"]:
        x0, y0, x1, y1 = atg["ruta"]
        fri[max(0, y0 - 3):min(H, y1 + 4), max(0, x0 - 3):min(W, x1 + 4)] = False

    rapport = []
    for atg in plan["atgarder"]:
        klass = atg["bakgrund"]["klass"]
        farg = atg["bakgrund"].get("farg")
        post = {"i": atg.get("i"), "klass": klass, "ny_text": atg.get("ny_text")}
        if klass == "enfargad" and farg:
            post["suddning"] = sudda_enfargad(a, atg["ruta"], farg)
        elif klass == "gradient":
            post["suddning"] = sudda_gradient(a, fri, atg["ruta"])
            if post["suddning"] is None:
                post["suddning"] = sudda_enfargad(a, atg["ruta"], farg) if farg else None
                post["nedgradering"] = "gradientbanden gick inte att läsa — fyllde med ringens medelfärg"
        else:
            post["suddning"] = sudda_foto(a, atg["ruta"], farg or [0, 0, 0])
            if post["suddning"] is None:
                post["suddning"] = "HOPPAD: cv2 saknas i containern — fotobakgrunden kan inte lagas"
                post["hoppad"] = True
        rapport.append(post)

    bild = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), "RGB")
    for atg, post in zip(plan["atgarder"], rapport):
        if post.get("hoppad") or not atg.get("ny_text"):
            continue
        post["ritning"] = rita_rad(bild, atg)

    ut = plan["ut"]
    if ut.lower().endswith((".jpg", ".jpeg")):
        bild.save(ut, quality=95, subsampling=0)
    else:
        bild.save(ut)
    json.dump({"ut": ut, "atgarder": rapport}, sys.stdout, ensure_ascii=False)


if __name__ == "__main__":
    main()
