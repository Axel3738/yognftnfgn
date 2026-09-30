#!/usr/bin/env python3
"""zonrita.py — skriver om en bildannons text BLOCK FÖR BLOCK (worldwide/annonser).

    python3 worldwide/annonser/zonrita.py <kalla.jpg> <ut.jpg> <rader.json>

rader.json = bildtext.json-postens "rader": [{"sv": "Rad 1\\nRad 2", "en": "Line 1\\nLine 2"}, …]
("en": "" = blocket suddas och lämnas tomt).

Varför block och inte rad för rad (bildrita.mjs första versionen, mätt 2026-09-30): OCR:en
delar en rubrik i ORD-fragment ("Lagger", "du fortfarande", "pa", "handduk", "en", "satet?"),
och en rad-för-rad-ersättning lämnade "en" och "på" kvar, skrev orden i fel ordning och lade
två rader ovanpå varandra. Här paras varje fragment med ett block (långa fragment på text,
korta på läge), hela blockets fragment suddas med factory/bildmarknad-rita.py:s skarpa
suddning, och blockets engelska ritas EN gång i blockets samlade ruta — med källans
radbrytningar, största fragmentets vikt och färg, krympt tills den ryms.

Skriver <ut> och JSON på stdout: {block:[…], oparade:[…]}. Dömer inte om bilden är ren —
bildrita.mjs mäter resultatet med OCR igen.
"""
import importlib.util
import json
import os
import subprocess
import sys
import unicodedata

import numpy as np
from PIL import Image, ImageDraw, ImageFont

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
_spec = importlib.util.spec_from_file_location("bildmarknad_rita", os.path.join(REPO, "factory", "bildmarknad-rita.py"))
rita = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(rita)

FET = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
NORMAL = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"


def vik(s):
    s = unicodedata.normalize("NFD", str(s or "").lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return "".join(c for c in s if c.isalnum() or c == "%")


TACKER = {}  # fragment-id → övriga block som samma fragment bär


def para(fragment, block):
    """Fragment → blockindex. Långa fragment på text, korta (≤3 tecken) på läge."""
    tilldelat = {}
    for f in fragment:
        v = vik(f["text"])
        if len(v) < 4:
            continue
        kand = [j for j, b in enumerate(block) if v in vik(b["sv"])]
        if not kand:
            # Ett fragment som spänner över FLERA block (OCR läste "1469 kr 1129 kr" som en rad).
            inne = [j for j, b in enumerate(block) if len(vik(b["sv"])) >= 2 and vik(b["sv"]) in v]
            if inne:
                kand = [inne[0]]
                for j in inne[1:]:
                    TACKER.setdefault(f["i"], set()).add(j)
        if not kand:
            # OCR-fel: bästa bigramlikhet
            def lik(a, b):
                A = {a[i:i + 2] for i in range(len(a) - 1)}
                B = {b[i:i + 2] for i in range(len(b) - 1)}
                return len(A & B) / max(1, len(A))
            poang = [(lik(v, vik(b["sv"])), j) for j, b in enumerate(block)]
            p, j = max(poang)
            if p >= 0.6:
                kand = [j]
        if kand:
            tilldelat[f["i"]] = kand[0]
    rutor = {}
    for f in fragment:
        if f["i"] in tilldelat:
            rutor.setdefault(tilldelat[f["i"]], []).append(f["ruta"])
    for f in fragment:
        if f["i"] in tilldelat or len(vik(f["text"])) >= 4:
            continue
        v = vik(f["text"])
        x0, y0, x1, y1 = f["ruta"]
        cy = (y0 + y1) / 2
        bast, avst = None, 1e9
        for j, rs in rutor.items():
            if v and v not in vik(block[j]["sv"]):
                continue
            uy0, uy1 = min(r[1] for r in rs), max(r[3] for r in rs)
            d = 0 if uy0 - 20 <= cy <= uy1 + 20 else min(abs(cy - uy0), abs(cy - uy1))
            if d < avst:
                bast, avst = j, d
        if bast is not None and avst <= (y1 - y0) * 1.5:
            tilldelat[f["i"]] = bast
            rutor[bast].append(f["ruta"])
    return tilldelat


def font(fet, storlek):
    return ImageFont.truetype(FET if fet else NORMAL, max(8, int(round(storlek))))


def rad_bredd(f, t):
    bb = f.getbbox(t)
    return bb[2] - bb[0]


def rita_block(bild, ruta, text, stil, W):
    """Blockets engelska i rutan: källans radbrytningar, krymper tills det ryms."""
    x0, y0, x1, y1 = ruta
    bredd = max(x1 - x0, 1)
    hojd = max(y1 - y0, 1)
    rader_in = [r.strip() for r in text.split("\n") if r.strip()]
    fet = bool(stil.get("fet"))
    storlek = float(stil.get("storlek", 40))
    farg = tuple(int(c) for c in stil.get("textfarg", [0, 0, 0]))
    # Får bli lite bredare än källans ruta (engelskan är sällan exakt lika lång), aldrig utanför bilden.
    maxbredd = min(W - 2 * max(12, int(W * 0.03)), max(bredd, int(bredd * 1.15)))
    while True:
        f = font(fet, storlek)
        # Radbrytning: källans rader, och en rad som inte ryms bryts på ord.
        rader = []
        for r in rader_in:
            ord_ = r.split()
            akt = ""
            for o in ord_:
                prov = (akt + " " + o).strip()
                if rad_bredd(f, prov) <= maxbredd or not akt:
                    akt = prov
                else:
                    rader.append(akt)
                    akt = o
            if akt:
                rader.append(akt)
        radhojd = storlek * 1.18
        total = radhojd * len(rader)
        if (total <= hojd * 1.08 and all(rad_bredd(f, r) <= maxbredd for r in rader)) or storlek <= 10:
            break
        storlek *= 0.95
    d = ImageDraw.Draw(bild)
    just = stil.get("justering", "center")
    mitt = (x0 + x1) / 2
    y = y0 + (hojd - total) / 2
    for r in rader:
        bb = f.getbbox(r)
        w = bb[2] - bb[0]
        if just == "vanster":
            x = x0
        else:
            x = mitt - w / 2
        x = max(8, min(W - w - 8, x))
        d.text((x - bb[0], y + (radhojd - (bb[3] - bb[1])) / 2 - bb[1]), r, font=f, fill=farg)
        y += radhojd
    return {"storlek": round(storlek, 1), "rader": rader}


def main():
    kalla, ut, rfil = sys.argv[1], sys.argv[2], sys.argv[3]
    block = json.load(open(rfil, encoding="utf-8"))
    m = subprocess.run(["python3", os.path.join(REPO, "factory", "bildmarknad-mat.py"), kalla, "--konf=0.4", "--pad=6"], capture_output=True, text=True)
    if m.returncode != 0:
        sys.exit(f"mätningen: {m.stderr[-400:]}")
    matning = json.loads(m.stdout)
    fragment = matning["rader"]
    W, H = matning["W"], matning["H"]
    tilldelat = para(fragment, block)

    bild = Image.open(kalla).convert("RGB")
    a = np.asarray(bild).astype(np.float32).copy()
    fri = np.ones((H, W), bool)
    for f in fragment:
        if f["i"] in tilldelat:
            x0, y0, x1, y1 = f["ruta"]
            fri[max(0, y0 - 3):min(H, y1 + 4), max(0, x0 - 3):min(W, x1 + 4)] = False
    suddade = []
    for f in fragment:
        if f["i"] not in tilldelat:
            continue
        b = f["bakgrund"]
        if b["klass"] == "enfargad" and b.get("farg"):
            s = rita.sudda_enfargad(a, fri, f["ruta"], b["farg"], b.get("platta"))
        elif b["klass"] == "gradient":
            s = rita.sudda_gradient(a, fri, f["ruta"])
            if s is None and b.get("farg"):
                x0, y0, x1, y1 = f["ruta"]
                a[y0:y1 + 1, x0:x1 + 1] = np.array(b["farg"], dtype=np.float32)
                s = "fylld med ringens färg"
        else:
            s = rita.sudda_foto(a, f["ruta"], (f.get("stil") or {}).get("textfarg", [0, 0, 0]))
        suddade.append({"i": f["i"], "text": f["text"], "suddning": s})
    bild = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), "RGB")

    ut_block = []
    tackta = {j for s in TACKER.values() for j in s}
    for j, b in enumerate(block):
        fr = [f for f in fragment if tilldelat.get(f["i"]) == j]
        if not fr:
            ut_block.append({"block": j, "sv": b["sv"], "hittad": j in tackta, "tackt": j in tackta})
            continue
        # Block som delar fragment med det här: deras engelska ritas i samma ruta.
        extra = [block[k].get("en", "") for f in fr for k in sorted(TACKER.get(f["i"], ()))]
        b = {**b, "en": "\n".join(x for x in [b.get("en", "")] + extra if x)}
        ruta = [min(f["ruta"][0] for f in fr), min(f["ruta"][1] for f in fr), max(f["ruta"][2] for f in fr), max(f["ruta"][3] for f in fr)]
        stil = max((f for f in fr if f.get("stil")), key=lambda f: f["stil"].get("storlek", 0), default={"stil": {}})["stil"]
        just = [f["stil"].get("justering") for f in fr if f.get("stil")]
        stil = {**stil, "justering": "vanster" if just and all(x == "vanster" for x in just) else "center"}
        post = {"block": j, "sv": b["sv"], "en": b.get("en", ""), "ruta": ruta, "fragment": [f["text"] for f in fr]}
        if b.get("en"):
            post["ritning"] = rita_block(bild, ruta, b["en"], stil, W)
        ut_block.append(post)

    if ut.lower().endswith((".jpg", ".jpeg")):
        bild.save(ut, quality=95, subsampling=0)
    else:
        bild.save(ut)
    json.dump({"ut": ut, "block": ut_block, "suddade": suddade,
               "oparade": [f["text"] for f in fragment if f["i"] not in tilldelat]}, sys.stdout, ensure_ascii=False)


if __name__ == "__main__":
    main()
