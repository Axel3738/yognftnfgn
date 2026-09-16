#!/usr/bin/env python3
"""oversatt-us.py — det amerikanska textlagret på batch #3:s sju bildannonser.

Två vägar, per bild:
  bas/<SE-namn>.png finns   → rent basfoto: textlagret ritas från grunden med
                              factory/bild-text.py (samma väg som rendera.mjs).
  annars                    → BASFOTOT ÄR BORTA (nattvaktens container dog med det,
                              och Notion-raden bär bara textversionen). Då byts
                              texten I SAMMA RUTOR: SE-layouten räknas om exakt
                              (bild-text.py:s Duk på en tom duk i samma storlek ger
                              varje bands/chips rektangel), den svenska texten suddas
                              inuti rutan med oversatt-bild.py:s fyllning (pixlar som
                              avviker från plattfärgen fylls från grannarna, så den
                              halvgenomskinliga plattan behåller fotot bakom), och
                              den amerikanska texten ritas i samma ruta med samma
                              typsnitt, storlek, färg och justering. En chip som
                              behöver bli bredare ritas om bredare (samma hörn);
                              en som blir smalare behåller SE-bredden.
    python3 market-expansion/ops/carashell/2026-09-16-us-3/oversatt-us.py [--bara <SE-namn>]
Läser se-texter.json, textlager-us.json, se/<n>/<n>.png, ev. bas/<n>.png.
Skriver us/<US-namn>.png, us/<US-namn>.png.qa.png (SE | US), resultat-render.json.
"""
import argparse
import importlib.util
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

HAR = Path(__file__).resolve().parent
ROT = HAR.parents[3]


def ladda(namn, fil):
    spec = importlib.util.spec_from_file_location(namn, fil)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


bt = ladda("bild_text", ROT / "factory" / "bild-text.py")
ob = ladda("oversatt_bild", ROT / "pipeline" / "oversatt-bild.py")

FARGER = None  # sätts i main ur butikens yaml (via ops-bild.textFarger-ekvivalent nedan)


def butiksfarger():
    """Samma fält som ops-bild.textFarger läser ur factory/butiker/carashell.yaml."""
    import re
    y = (ROT / "factory" / "butiker" / "carashell.yaml").read_text(encoding="utf-8")
    ut = {}
    for nyckel, ut_nyckel in (("mork", "mork"), ("accent", "accent"), ("text", "text"), ("yta", "yta"),
                              ("accent_text", "accent_text"), ("text_pa_mork", "text_pa_mork"), ("linje_stark", "dampad")):
        m = re.search(rf'^\s+{nyckel}:\s*"?(#[0-9A-Fa-f]{{6}})"?', y, re.M)
        if m:
            ut[ut_nyckel] = m.group(1)
    return ut


# ------------------------------------------------------------ SE-layouten, exakt

class Matduk(bt.Duk):
    """Duk som bara mäter: samma geometri som bild-text.py, men på en tom duk."""

    def __init__(self, W, H, farger):
        self.bild = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        self.W, self.H = W, H
        self.f = dict(bt.STANDARDFARGER, **{k: v for k, v in (farger or {}).items() if v})
        self.lager = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        self.rit = ImageDraw.Draw(self.lager)
        self.m = int(W * 0.05)
        self.topp = 0
        self.botten_y = H
        self.placerade = []


def layout(W, H, element, farger):
    """Kör bild-text.py:s rita()-ordning och returnerar rektangel + radgeometri per
    element. Speglar rita() steg 1–5 (botten, topp, pris, badge, etiketter)."""
    el = {}
    for e in element:
        el.setdefault(e["typ"], []).append(e["text"])
    forsta = lambda k: el.get(k, [None])[0]
    duk = Matduk(W, H, farger)
    f = duk.f
    ut = {}
    S = bt.STORLEK
    if forsta("botten"):
        ut["botten"] = {"rekt": duk.band_botten(forsta("botten"), W * S["botten"], f["mork"], f["text_pa_mork"]),
                        "fet": True, "storlek": W * S["botten"], "farg": f["text_pa_mork"], "just": "mitt", "maxrader": 2, "min": W * S["botten"] * 0.6}
    if forsta("citat"):
        rader = [(forsta("citat"), True, W * S["citat"], f["mork"], 4)]
        if forsta("namn"):
            rader.append((forsta("namn"), False, W * S["namn"], f["text"], 1))
        if forsta("stjarnor"):
            rader.append((forsta("stjarnor"), True, W * S["stjarnor"], f["accent"], 1))
        rekt = duk.band_topp(rader, f["yta"], alfa=236)
        ut["citat"] = {"rekt": rekt, "rader_spec": rader, "typer": [t for t in ("citat", "namn", "stjarnor") if forsta(t)]}
    elif forsta("rubrik"):
        rader = [(forsta("rubrik"), True, W * S["rubrik"], f["text_pa_mork"], 3)]
        if forsta("underrad"):
            rader.append((forsta("underrad"), False, W * S["underrad"], f["text_pa_mork"], 2))
        rekt = duk.band_topp(rader, f["mork"])
        ut["rubrik"] = {"rekt": rekt, "rader_spec": rader, "typer": [t for t in ("rubrik", "underrad") if forsta(t)]}
    pris = forsta("pris")
    if pris and (forsta("jamforpris") or forsta("rabatt")):
        raise SystemExit("priskort stöds inte i in-place-vägen (ingen av batch #3:s bilder har det)")
    hoger_y = duk.botten_y - int(W * 0.03)
    if pris:
        r = duk.chip(pris, W * S["pris_liten"], f["yta"], f["mork"], W - duk.m, hoger_y, maxbredd=int(W * 0.9), maxrader=1)
        ut["pris"] = {"rekt": r, "fet": True, "storlek": W * S["pris_liten"], "bak": f["yta"], "farg": f["mork"], "ankare": "nere-hoger", "maxbredd": int(W * 0.9), "maxrader": 1}
        hoger_y = r[1] - int(W * 0.015)
    if forsta("badge"):
        r = duk.chip(forsta("badge"), W * S["badge"], f["accent"], f["accent_text"], W - duk.m, hoger_y, maxbredd=int(W * 0.9), maxrader=1)
        ut["badge"] = {"rekt": r, "fet": True, "storlek": W * S["badge"], "bak": f["accent"], "farg": f["accent_text"], "ankare": "nere-hoger", "maxbredd": int(W * 0.9), "maxrader": 1}
    if forsta("etikett_vanster") or forsta("etikett_hoger"):
        y = duk.botten_y - int(W * 0.04)
        halv = W // 2 - int(W * 0.06)
        if forsta("etikett_vanster"):
            r = duk.chip(forsta("etikett_vanster"), W * S["etikett"], f["mork"], f["text_pa_mork"], duk.m, y, ankare="nere-vanster", maxbredd=halv)
            ut["etikett_vanster"] = {"rekt": r, "fet": True, "storlek": W * S["etikett"], "bak": f["mork"], "farg": f["text_pa_mork"], "ankare": "nere-vanster", "maxbredd": halv, "maxrader": 3}
        if forsta("etikett_hoger"):
            r = duk.chip(forsta("etikett_hoger"), W * S["etikett"], f["accent"], f["accent_text"], W - duk.m, y, ankare="nere-hoger", maxbredd=halv)
            ut["etikett_hoger"] = {"rekt": r, "fet": True, "storlek": W * S["etikett"], "bak": f["accent"], "farg": f["accent_text"], "ankare": "nere-hoger", "maxbredd": halv, "maxrader": 3}
    return ut, duk.f


# ------------------------------------------------------------ sudda inuti en ruta

def sudda(arr, rekt, ljus_platta):
    """Text inuti rekt suddas: per rad är plattfärgen 80:e (ljus) / 20:e (mörk)
    percentilen; pixlar som avviker ≥ 60 åt textens håll maskas, utvidgas 3 px och
    fylls från grannarna (oversatt-bild.fyll). Samma recept som rita_box."""
    x0, y0, x1, y1 = [int(v) for v in rekt]
    box = arr[y0:y1, x0:x1]
    if not box.size:
        return
    rm = np.percentile(box, 80 if ljus_platta else 20, axis=1)
    summa = box.sum(axis=2)
    diff = summa - rm.sum(axis=1)[:, None]
    t = ((diff < -60) & (summa < 560)) if ljus_platta else ((diff > 60) & (summa > 300))
    for _ in range(3):
        t2 = t.copy()
        t2[1:] |= t[:-1]; t2[:-1] |= t[1:]; t2[:, 1:] |= t[:, :-1]; t2[:, :-1] |= t[:, 1:]
        t = t2
    fyll_radvis(box, t, np.median(box.reshape(-1, 3), axis=0))
    arr[y0:y1, x0:x1] = box


def fyll_radvis(box, mask, reserv):
    """Maskade pixlar får RADENS median av de omaskade pixlarna (följer bandets
    lodräta gradient utan brus). oversatt-bild.fyll lägger på plattans eget brus,
    och på en halvgenomskinlig platta över ett foto blev det ett synligt spräckligt
    fält där den svenska raden stått (PD_7_1:s bottenband, provkört 2026-09-16)."""
    h = box.shape[0]
    for y in range(h):
        m = mask[y]
        if not m.any():
            continue
        rena = box[y][~m]
        farg = np.median(rena, axis=0) if len(rena) >= 8 else reserv
        box[y][m] = farg.astype(box.dtype)


# ------------------------------------------------------------ rita US i SE-rutan

def rita_band_topp(lager, rit, W, rekt, rader_spec_se, texter_us, farger_f):
    """Samma block som band_topp men i en given ruta: raderna ritas uppifrån med
    samma pad, varje rad passas in i SE-radens antal rader (krymps vid behov)."""
    pad = int(W * 0.045)
    m = int(W * 0.05)
    inner = W - 2 * m
    y = rekt[1] + pad
    for (se_text, fet, storlek, farg, maxrader), us_text in zip(rader_spec_se, texter_us):
        symboler = se_text.strip() != "" and all(c in "★☆✓ " for c in se_text.strip())
        f_se, r_se = bt.passa(se_text, fet, storlek, inner, maxrader, storlek * 0.55, symboler)
        rh = bt.radhojd(f_se)
        if us_text is None:  # rör inte (stjärnorna)
            y += rh * len(r_se) + int(rh * 0.25)
            continue
        # US-texten: börja på SE:s faktiska storlek, samma antal rader som SE fick.
        f_us, r_us = bt.passa(us_text, fet, f_se.size, inner, len(r_se), storlek * 0.5, symboler)
        for rad in r_us:
            rit.text((m, y), rad, font=f_us, fill=bt.hex_till_rgba(farg))
            y += rh
        y += int(rh * 0.25)


def rita_band_botten(rit, W, rekt, se_text, us_text, storlek, farg):
    pad = int(W * 0.035)
    m = int(W * 0.05)
    inner = W - 2 * m
    f_se, r_se = bt.passa(se_text, True, storlek, inner, 2, storlek * 0.6)
    rh = bt.radhojd(f_se)
    f_us, r_us = bt.passa(us_text, True, f_se.size, inner, len(r_se), storlek * 0.5)
    y = rekt[1] + pad
    for rad in r_us:
        w = f_us.getlength(rad)
        rit.text(((W - w) / 2, y), rad, font=f_us, fill=bt.hex_till_rgba(farg))
        y += rh


def rita_chip(rit, W, spec, se_text, us_text):
    """Chip i samma hörn som SE. Bredd = max(SE-bredd, vad US-texten behöver);
    höjd = SE-höjd (samma radantal krävs — texten krymps annars)."""
    padx, pady = int(W * 0.025), int(W * 0.016)
    x0s, y0s, x1s, y1s = spec["rekt"]
    f_se, r_se = bt.passa(se_text, spec["fet"], spec["storlek"], spec["maxbredd"] - 2 * padx, spec["maxrader"], spec["storlek"] * 0.6)
    rh = bt.radhojd(f_se)
    f_us, r_us = bt.passa(us_text, spec["fet"], f_se.size, spec["maxbredd"] - 2 * padx, len(r_se), spec["storlek"] * 0.5)
    w_us = max(f_us.getlength(r) for r in r_us) + 2 * padx
    w = max(x1s - x0s, w_us)
    h = y1s - y0s
    if spec["ankare"] == "nere-hoger":
        x0, y0 = x1s - w, y0s
    else:
        x0, y0 = x0s, y0s
    rit.rounded_rectangle([x0, y0, x0 + w, y0 + h], radius=int(W * 0.012), fill=bt.hex_till_rgba(spec["bak"], 245))
    yy = y0 + pady
    for rad in r_us:
        rit.text((x0 + padx, yy), rad, font=f_us, fill=bt.hex_till_rgba(spec["farg"]))
        yy += rh
    return (x0, y0, x0 + w, y0 + h)


def in_place(se_fil, ut, se_el, us_el, farger):
    bild = Image.open(se_fil).convert("RGB")
    W, H = bild.size
    lay, f = layout(W, H, se_el, farger)
    se_by = {e["typ"]: e["text"] for e in se_el}
    us_by = {e["typ"]: e["text"] for e in us_el}
    arr = np.asarray(bild).astype(np.int32).copy()
    # 1. Sudda den svenska texten i varje ruta (stjärnraden lämnas orörd).
    for typ, spec in lay.items():
        x0, y0, x1, y1 = [int(v) for v in spec["rekt"]]
        if typ == "citat":
            # bara citat + namn: klipp rutan ovanför stjärnraden
            pad = int(W * 0.045)
            y = y0 + pad
            klipp = y1
            for (t, fet, storlek, farg, maxrader) in spec["rader_spec"]:
                symboler = all(c in "★☆✓ " for c in t.strip())
                fnt, rader = bt.passa(t, fet, storlek, W - 2 * int(W * 0.05), maxrader, storlek * 0.55, symboler)
                rh = bt.radhojd(fnt)
                if symboler:
                    klipp = y - 2
                    break
                y += rh * len(rader) + int(rh * 0.25)
            sudda(arr, (x0, y0, x1, klipp), ljus_platta=True)
        elif typ in ("rubrik", "botten", "etikett_vanster"):
            sudda(arr, (x0, y0, x1, y1), ljus_platta=False)
        elif typ in ("badge", "etikett_hoger"):
            # accentblå chip: vit text — ljusare än plattan ⇒ "mörk platta"-regeln
            sudda(arr, (x0, y0, x1, y1), ljus_platta=False)
        elif typ == "pris":
            sudda(arr, (x0, y0, x1, y1), ljus_platta=True)
    ren = Image.fromarray(arr.astype(np.uint8)).convert("RGBA")
    lager = Image.new("RGBA", ren.size, (0, 0, 0, 0))
    rit = ImageDraw.Draw(lager)
    # 2. Rita US-texten i samma rutor.
    placerade = []
    for typ, spec in lay.items():
        if typ in ("citat", "rubrik"):
            texter = []
            for t in spec["typer"]:
                texter.append(None if t == "stjarnor" else us_by[t])
            rita_band_topp(lager, rit, W, spec["rekt"], spec["rader_spec"], texter, f)
            placerade += spec["typer"]
        elif typ == "botten":
            rita_band_botten(rit, W, spec["rekt"], se_by["botten"], us_by["botten"], spec["storlek"], spec["farg"])
            placerade.append("botten")
        else:
            rita_chip(rit, W, spec, se_by[typ], us_by[typ])
            placerade.append(typ)
    Image.alpha_composite(ren, lager).convert("RGB").save(ut, quality=95)
    return placerade


def qa(se_fil, us_fil, ut):
    a = Image.open(se_fil).convert("RGB"); c = Image.open(us_fil).convert("RGB")
    b = 540
    a = a.resize((b, int(a.height * b / a.width))); c = c.resize((b, int(c.height * b / c.width)))
    q = Image.new("RGB", (2 * b + 12, max(a.height, c.height)), "#202020")
    q.paste(a, (0, 0)); q.paste(c, (b + 12, 0)); q.save(ut)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--bara")
    a = p.parse_args()
    se = json.loads((HAR / "se-texter.json").read_text(encoding="utf-8"))
    us = json.loads((HAR / "textlager-us.json").read_text(encoding="utf-8"))
    farger = butiksfarger()
    (HAR / "us").mkdir(exist_ok=True)
    resultat = {}
    for namn in [k for k in se if not k.startswith("_")]:
        if a.bara and namn != a.bara:
            continue
        mal = namn.replace("CaraShellRoof_", "CaraShellRoof_US_")
        se_el = se[namn]["element"]
        us_el = us.get(namn, {}).get("element")
        if not us_el:
            resultat[namn] = {"status": "FEL", "skal": "saknas i textlager-us.json"}; continue
        if [e["typ"] for e in se_el] != [e["typ"] for e in us_el]:
            resultat[namn] = {"status": "FEL", "skal": f"typordning: SE {[e['typ'] for e in se_el]} ≠ US {[e['typ'] for e in us_el]}"}; continue
        kvar = [e["text"] for e in us_el if e["typ"] != "stjarnor" and __import__("re").search(r"\bkr\b|1 129|1 469|23 %|340|[åäöÅÄÖ]|carashell\.se", e["text"])]
        if kvar:
            resultat[namn] = {"status": "FEL", "skal": f"svenska/kr kvar: {' | '.join(kvar)}"}; continue
        se_fil = HAR / "se" / namn / f"{namn}.png"
        ut = HAR / "us" / f"{mal}.png"
        bas = HAR / "bas" / f"{namn}.png"
        try:
            if bas.exists():
                spec = {"farger": farger, "element": us_el}
                (HAR / "us" / f"{mal}.png.spec.json").write_text(json.dumps(spec, ensure_ascii=False, indent=2), encoding="utf-8")
                info = bt.rita(str(bas), str(ut), spec)
                resultat[namn] = {"status": "OK", "mal": mal, "vag": "basfoto + textlager", "fil": f"us/{mal}.png", "placerade": info["placerade"], "okanda": info["okanda_typer"]}
            else:
                placerade = in_place(se_fil, ut, se_el, us_el, farger)
                resultat[namn] = {"status": "OK", "mal": mal, "vag": "in-place (basfoto saknas)", "fil": f"us/{mal}.png", "placerade": placerade}
            qa(se_fil, ut, str(ut) + ".qa.png")
        except Exception as e:
            resultat[namn] = {"status": "FEL", "skal": f"{type(e).__name__}: {e}"}
        r = resultat[namn]
        print(f"{namn} → {r.get('mal', '?')}: {r['status']} {r.get('vag', '')} {r.get('skal', '')} {', '.join(r.get('placerade', []))}")
    (HAR / "resultat-render.json").write_text(json.dumps(resultat, ensure_ascii=False, indent=2), encoding="utf-8")
    fel = [n for n, r in resultat.items() if r["status"] != "OK"]
    if fel:
        print("FEL:", fel, file=sys.stderr); sys.exit(1)


if __name__ == "__main__":
    main()
