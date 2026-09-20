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

# Hur långt utanför textens pixlar fotoinpaintingen målar.
#
# ⚠️ INGET VÄRDE ÄR BRA. Mätt 2026-09-20 på CaraShellRoof_GT_2_1.jpg, där
# rubrikerna är vit text med mjuk skugga rakt på ett vardagsrumsfoto, och
# resultatet tittat på i tre körningar (bara suddat, ingen ny text):
#   3 px   skuggan står kvar — "DEN PERFE" och "TILL HUSVA" går att LÄSA
#   7 px   spökena nästan borta, men platta grå fält börjar synas
#   11 px  spökena borta, och fotot med dem: hårda grå rektanglar över
#          fönsterkarm och vägg
# 7 är den minst dåliga kompromissen och är vald därefter — inte för att den
# är bra. Därför rapporteras varje fotorad som UNGEFÄRLIG, och en bild med
# fotorader blir aldrig "REN" utan att en människa sagt --tillat-foto.
# Rotorsaken är skuggan: masken hittar de VITA glyfpixlarna, medan den mörka
# skuggan runt dem är kvar och håller bokstavsformen läsbar.
INPAINT_MARGINAL = 7

# Under den här bredfaktorn räknas källans typsnitt som SMALT och texten pressas
# ihop i stället för att krympas. 0,90 ligger i glappet mellan de fyra annonser
# som mätte 0,91–1,15 (samma bredd som Liberation Sans) och GT_2:s rubriker som
# mätte 0,69–0,77 (mätt 2026-09-20, se bredfaktor i bildmarknad-mat.py).
SMALT_TYPSNITT = 0.90


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


def sudda_enfargad(a, fri, ruta, farg, platta=None):
    """Plattan fylls i första hand med INTERPOLATION, inte med en enda färg.

    ⚠️ Mätt 2026-09-20 på CaraShellRoof_CS_4_1.jpg: priskortet ser enfärgat ut
    men bär en svag lodrät gradient. En platt fyllning lämnade en skarv på 1,64
    resp. 0,94 nivåer vid rutans kant — en syNLIG rektangel på en stor ljus yta,
    precis det en suddning aldrig får ge. De mörka banden hade skarv 0,00 och
    blir lika bra på båda sätten.

    Banden hålls INNANFÖR plattan, annars läser de knappens kant i stället för
    knappens färg (den blå knappen i BOF_101 fick gradientfel 22,15 just så)."""
    gjort = sudda_gradient(a, fri, ruta, granser=platta)
    if gjort:
        return f"{gjort} — inom plattan"
    x0, y0, x1, y1 = ruta
    a[y0:y1 + 1, x0:x1 + 1] = np.array(farg, dtype=np.float32)
    return f"fylld med plattans färg {[round(f) for f in farg]} (ingen plats för band inom plattan)"


def sudda_gradient(a, fri, ruta, granser=None):
    """Per kolumn: linjär interpolation mellan bandet ovanför och under rutan.

    På en lodrät gradient återskapar det bakgrunden exakt — resultatet är
    skarpt, utan skarv, eftersom varje kolumn möter sina egna grannpixlar.

    `granser` begränsar var banden får hämtas (plattans egen ruta)."""
    H = a.shape[0]
    x0, y0, x1, y1 = ruta
    tak, golv = (0, H) if granser is None else (max(0, granser[1]), min(H, granser[3] + 1))
    m = max(6, (y1 - y0) // 3)
    ta, tb = max(tak, y0 - m), y0
    ba, bb = y1 + 1, min(golv, y1 + 1 + m)
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


def mat_skarv(a, ruta):
    """Steget mellan pixlarna strax innanför och strax utanför rutans kant.

    Det är måttet på om suddningen SYNS. OCR:en kan inte se det: en utsuddad
    yta är ingen text, så efterkontrollen är nöjd medan bilden bär en
    rektangel. Mäts direkt efter suddningen och FÖRE den nya texten — annars
    mäter man den nya raden i stället för bakgrunden.

    ⚠️ Kanterna mäts var för sig och den största vinner. Slås de ihop tar felen
    ut varandra: en platt fyllning mitt i en gradient ligger för mörkt upptill
    och lika mycket för ljust nedtill. Mätt 2026-09-20 gav den hopslagna
    varianten 0,03 på ett fall som per kant mäter 11,63."""
    H = a.shape[0]
    x0, y0, x1, y1 = ruta

    def steg(i0, i1, u0, u1):
        if u0 < 0 or u1 > H or i1 <= i0 or u1 <= u0:
            return 0.0
        inn = a[i0:i1, x0:x1 + 1].reshape(-1, 3).mean(axis=0)
        ut = a[u0:u1, x0:x1 + 1].reshape(-1, 3).mean(axis=0)
        return float(np.abs(inn - ut).max())

    return round(max(steg(y0 + 1, y0 + 4, y0 - 4, y0 - 1),
                     steg(y1 - 3, y1, y1 + 2, y1 + 5)), 2)


def _otsu(v):
    """Otsus tröskel på en 1D-vektor. Ren numpy — scipy finns inte i containern."""
    hist, kanter = np.histogram(v, bins=64)
    mitt = (kanter[:-1] + kanter[1:]) / 2
    tot = hist.sum()
    if tot == 0:
        return float(v.max())
    w0 = np.cumsum(hist)
    w1 = tot - w0
    s0 = np.cumsum(hist * mitt)
    s1 = s0[-1] - s0
    giltig = (w0 > 0) & (w1 > 0)
    if not giltig.any():
        return float(v.max())
    mellan = np.zeros_like(mitt, dtype=float)
    mellan[giltig] = (w0[giltig] * w1[giltig]
                      * (s0[giltig] / w0[giltig] - s1[giltig] / w1[giltig]) ** 2)
    return float(mitt[int(np.argmax(mellan))])


def _fotomask(a, ruta, textfarg):
    """Textens pixlar på ett FOTO, sedda från TEXTFÄRGEN i stället för bakgrunden.

    ⚠️ Mätt 2026-09-20 på CaraShellRoof_GT_2_1.jpg: masken byggd ur
    bakgrundsfärgen lämnade tydliga spökrester av "DEN PERFEKTA PRESENTEN" i
    vänster- och högerkanten. På en gradient är ringens färg en bra bild av
    bakgrunden; på ett foto är den ett medelvärde av vägg, eld och gran och
    säger inget om någon enskild pixel. Textfärgen är däremot samma överallt i
    raden, så avståndet till DEN skiljer glyf från foto. Tröskeln sätts med
    Otsu i stället för en fast andel, eftersom kontrasten varierar över bilden."""
    x0, y0, x1, y1 = ruta
    sub = a[y0:y1 + 1, x0:x1 + 1]
    d = np.sqrt(((sub - np.array(textfarg, dtype=np.float32)) ** 2).sum(axis=2))
    return d <= _otsu(d.ravel())


def sudda_foto(a, ruta, textfarg):
    """Bara textens pixlar målas igen — fotot runt omkring rörs inte."""
    try:
        import cv2
    except ImportError:
        return None
    x0, y0, x1, y1 = ruta
    ink = _fotomask(a, ruta, textfarg).astype(np.uint8) * 255
    k = np.ones((INPAINT_MARGINAL * 2 + 1,) * 2, np.uint8)
    ink = cv2.dilate(ink, k)
    sub = np.clip(a[y0:y1 + 1, x0:x1 + 1], 0, 255).astype(np.uint8)
    lagad = cv2.inpaint(sub[:, :, ::-1], ink, 7, cv2.INPAINT_TELEA)[:, :, ::-1]
    a[y0:y1 + 1, x0:x1 + 1] = lagad.astype(np.float32)
    return (f"cv2.inpaint (TELEA) på textens pixlar (mask ur textfärgen {list(textfarg)}, Otsu), "
            f"{INPAINT_MARGINAL} px marginal — UNGEFÄRLIG: fotot bakom texten gissas fram")


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

    # Källans typsnitt kan vara SMALARE än vårt. Då pressas texten ihop i sidled
    # i stället för att krympas — så behåller raden rätt höjd och rätt vikt.
    # Containern saknar condensed-snitt (fc-list 2026-09-20), och en rad som
    # krymps i BÅDA led ser mindre ut än originalet, vilket syns direkt bredvid
    # de andra raderna i annonsen.
    bf = stil.get("bredfaktor")
    press = float(bf) if bf and bf < SMALT_TYPSNITT else 1.0

    krympt = None
    f = _font(fet, storlek)
    bb = f.getbbox(text)
    while (bb[2] - bb[0]) * press > maxbredd and storlek > 7:
        storlek *= 0.97
        f = _font(fet, storlek)
        bb = f.getbbox(text)
    if round(storlek, 1) != round(float(stil["storlek"]), 1):
        krympt = {"fran": round(float(stil["storlek"]), 1), "till": round(storlek, 1),
                  "varfor": f'"{text}" var bredare än {maxbredd} px vid källans storlek'}

    # Lodrätt: samma BASLINJE som källan. Origo→baslinje beror bara på
    # typsnittet, så ett prov med KÄLLANS text vid samma storlek ger var källan
    # ritades — och den nya texten ritas från exakt samma origo.
    pbb = f.getbbox(atg.get("kalltext") or text)
    origo_y = ib[1] - pbb[1]

    farg = tuple(int(c) for c in stil["textfarg"])
    lw, lh = max(1, bb[2] - bb[0]), max(1, bb[3] - bb[1])
    lager = Image.new("RGBA", (lw, lh), (0, 0, 0, 0))
    ld = ImageDraw.Draw(lager)
    ld.text((-bb[0], -bb[1]), text, font=f, fill=farg + (255,))
    if atg.get("stryk"):
        # Jämförpriset STRYKS ÖVER. Utan strecket läses raden som ett ANDRA
        # pris i stället för ett överstruket förepris — samma regel som
        # pipeline/omdubb/inbrand.mjs byggPopblock.
        y = lh / 2
        ld.line([(0, y), (lw, y)], fill=farg + (255,), width=max(2, round(storlek * 0.055)))
    if press != 1.0:
        lager = lager.resize((max(1, int(round(lw * press))), lh), Image.LANCZOS)

    # Vågrätt: kanten mätningen läste. Positionen räknas på den FÄRDIGA bredden,
    # alltså efter en eventuell hoppressning.
    slutbredd = lager.size[0]
    if stil.get("justering") == "vanster":
        x = ib[0]
    else:
        x = round((ib[0] + ib[2] + 1) / 2 - slutbredd / 2)
    y = round(origo_y + bb[1])
    bild.paste(lager, (int(x), int(y)), lager)

    return {"storlek": round(storlek, 1), "krympt": krympt,
            "ihoppressad": None if press == 1.0 else round(press, 3),
            "ritad_box": [int(x), int(y), int(x) + slutbredd, int(y) + lh],
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
            post["suddning"] = sudda_enfargad(a, fri, atg["ruta"], farg, atg["bakgrund"].get("platta"))
        elif klass == "gradient":
            post["suddning"] = sudda_gradient(a, fri, atg["ruta"])
            if post["suddning"] is None and farg:
                x0, y0, x1, y1 = atg["ruta"]
                a[y0:y1 + 1, x0:x1 + 1] = np.array(farg, dtype=np.float32)
                post["suddning"] = f"fylld med ringens medelfärg {[round(f) for f in farg]}"
                post["nedgradering"] = "gradientbanden gick inte att läsa"
        else:
            post["suddning"] = sudda_foto(a, atg["ruta"], atg["stil"]["textfarg"])
            if post["suddning"] is None:
                post["suddning"] = "HOPPAD: cv2 saknas i containern — fotobakgrunden kan inte lagas"
                post["hoppad"] = True
        # Mäts HÄR, innan den nya texten ritas: efteråt mäter man den nya raden.
        if not post.get("hoppad"):
            post["skarv"] = mat_skarv(a, atg["ruta"])
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
