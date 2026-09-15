#!/usr/bin/env python3
"""bild-text.py — textlagret för OPS-butikernas bildannonser.

Bildmodeller stavar fel och kan inte sätta typografi. Därför är en bildannons
två steg (samma tanke som pipeline/compose.mjs för Grillkliniken): kie.ai gör
FOTOT, det här skriptet lägger briefens EXAKTA svenska rader ovanpå som skarp
vektortext med å/ä/ö garanterat. Utan det här steget gick CaraShells fyra
bildannonser live 2026-09-14 utan rubrik, pris och badge — bara fotot.

    python3 factory/bild-text.py --bas <foto.png> --ut <annons.png> --spec <spec.json>
    python3 factory/bild-text.py --bas <foto.png> --ut <annons.png> --spec <spec.json> --json

spec.json:
    {
      "farger": { "mork": "#22282E", "accent": "#1F6F8E", "text": "#1B2026",
                  "yta": "#F1F2EF", "accent_text": "#FFFFFF", "text_pa_mork": "#F1F2EF" },
      "element": [ { "typ": "rubrik", "text": "En present han klarar helt själv" },
                   { "typ": "underrad", "text": "…" }, { "typ": "badge", "text": "…" } ]
    }

Elementtyper och var de hamnar (allt skalas efter bildens bredd):
    rubrik, underrad          → mörkt band överst (rubriken krymps tills den ryms på ≤ 3 rader)
    citat, namn, stjarnor     → ljust citatkort överst (stjärnorna i accentfärg)
    pris + jamforpris/rabatt  → priskort i höger tredjedel (jämförpriset överstruket, rabatten som chip)
    pris ensamt               → liten chip nere till höger
    badge                     → accent-chip nere till höger
    etikett_vanster/_hoger    → chip på vänster resp. höger halva (jämförelsebilder)
    botten                    → mörkt band nederst

Kräver Pillow (`pip3 install pillow`); ops-bild.mjs installerar den om den saknas.
Typsnitt: Liberation Sans (finns i containern) — Barlow/Source Sans ur butikens
brandfil finns inte lokalt, och ett typsnitt som saknas får aldrig bli ett tyst
fallback till något utan å/ä/ö.
"""
import argparse
import json
import os
import sys

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:  # pragma: no cover
    print("PILLOW_SAKNAS: kör `pip3 install pillow` (ops-bild.mjs gör det själv).", file=sys.stderr)
    sys.exit(3)

FET = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
NORMAL = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
RESERV_FET = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
RESERV_NORMAL = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

STANDARDFARGER = {
    "mork": "#22282E", "accent": "#1F6F8E", "text": "#1B2026", "yta": "#F1F2EF",
    "accent_text": "#FFFFFF", "text_pa_mork": "#F1F2EF", "dampad": "#8A9096",
}

# Relativa storlekar (andel av bildens bredd).
STORLEK = {
    "rubrik": 0.072, "underrad": 0.034, "botten": 0.034, "badge": 0.034, "pris": 0.12,
    "jamforpris": 0.046, "rabatt": 0.044, "etikett": 0.031, "citat": 0.056, "namn": 0.036,
    "stjarnor": 0.062, "pris_liten": 0.034,
}


def hex_till_rgba(h, alfa=255):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4)) + (alfa,)


def typsnitt(fet, storlek, symboler=False):
    """symboler=True: DejaVu först — Liberation Sans SAKNAR ★ och ritar en ruta
    fast getlength() ger en bredd (mätt 2026-09-15)."""
    ordning = [RESERV_FET, FET] if symboler else ([FET, RESERV_FET] if fet else [NORMAL, RESERV_NORMAL])
    for sokvag in ordning:
        if os.path.exists(sokvag):
            return ImageFont.truetype(sokvag, max(8, int(storlek)))
    raise SystemExit("TYPSNITT_SAKNAS: varken Liberation Sans eller DejaVu Sans finns i containern.")


def radbryt(text, font, maxbredd):
    """Bryter texten i rader som ryms i maxbredd. Ett enda ord som är för långt
    får stå ensamt på sin rad — det klipps aldrig."""
    rader = []
    for stycke in str(text).split("\n"):
        ord_ = stycke.split()
        rad = ""
        for o in ord_:
            prov = (rad + " " + o).strip()
            if font.getlength(prov) <= maxbredd or not rad:
                rad = prov
            else:
                rader.append(rad)
                rad = o
        rader.append(rad)
    return rader


def passa(text, fet, storlek, maxbredd, maxrader, minstorlek, symboler=False):
    """Krymper texten tills den ryms på maxrader. Returnerar (font, rader).
    Balanserar sedan: blir det en rad färre med upp till 18 % mindre stil tas
    det — ett ensamt ord på sista raden ser ut som ett fel, inte som en rubrik."""
    s = storlek
    while True:
        font = typsnitt(fet, s, symboler)
        rader = radbryt(text, font, maxbredd)
        if len(rader) <= maxrader or s <= minstorlek:
            break
        s = s * 0.92
    if len(rader) > 1 and len(rader[-1].split()) == 1:
        s2 = s
        while s2 > s * 0.82:
            s2 = s2 * 0.96
            f2 = typsnitt(fet, s2, symboler)
            r2 = radbryt(text, f2, maxbredd)
            if len(r2) < len(rader):
                return f2, r2
    return font, rader


def radhojd(font):
    asc, desc = font.getmetrics()
    return int((asc + desc) * 1.12)


class Duk:
    def __init__(self, bas, farger):
        self.bild = Image.open(bas).convert("RGBA")
        self.W, self.H = self.bild.size
        self.f = dict(STANDARDFARGER, **{k: v for k, v in (farger or {}).items() if v})
        self.lager = Image.new("RGBA", self.bild.size, (0, 0, 0, 0))
        self.rit = ImageDraw.Draw(self.lager)
        self.m = int(self.W * 0.05)
        self.topp = 0          # nästa fria y uppifrån
        self.botten_y = self.H  # nästa fria y nerifrån
        self.placerade = []

    # ---------------------------------------------------------------- band
    def band_topp(self, rader_spec, bakgrund, alfa=222):
        """rader_spec: [(text, fet, storlek, farg, maxrader)] — ritas i ett band överst."""
        pad = int(self.W * 0.045)
        inner = self.W - 2 * self.m
        block = []
        h = pad
        for text, fet, storlek, farg, maxrader in rader_spec:
            symboler = text.strip() != "" and all(c in "★☆✓ " for c in text.strip())
            font, rader = passa(text, fet, storlek, inner, maxrader, storlek * 0.55, symboler)
            rh = radhojd(font)
            block.append((rader, font, farg, rh))
            h += rh * len(rader) + int(rh * 0.25)
        h += pad - int(self.W * 0.01)
        y0 = self.topp
        self.rit.rectangle([0, y0, self.W, y0 + h], fill=hex_till_rgba(bakgrund, alfa))
        y = y0 + pad
        for rader, font, farg, rh in block:
            for rad in rader:
                self.rit.text((self.m, y), rad, font=font, fill=hex_till_rgba(farg))
                y += rh
            y += int(rh * 0.25)
        self.topp = y0 + h
        return (0, y0, self.W, y0 + h)

    def band_botten(self, text, storlek, bakgrund, farg, alfa=222):
        pad = int(self.W * 0.035)
        inner = self.W - 2 * self.m
        font, rader = passa(text, True, storlek, inner, 2, storlek * 0.6)
        rh = radhojd(font)
        h = pad * 2 + rh * len(rader)
        y0 = self.botten_y - h
        self.rit.rectangle([0, y0, self.W, self.botten_y], fill=hex_till_rgba(bakgrund, alfa))
        y = y0 + pad
        for rad in rader:
            w = font.getlength(rad)
            self.rit.text(((self.W - w) / 2, y), rad, font=font, fill=hex_till_rgba(farg))
            y += rh
        self.botten_y = y0
        return (0, y0, self.W, y0 + h)

    # ---------------------------------------------------------------- chips
    def chip(self, text, storlek, bakgrund, farg, x, y, ankare="nere-hoger", maxbredd=None, fet=True, maxrader=3):
        """Rundad etikett. ankare styr vilket hörn (x, y) beskriver."""
        padx, pady = int(self.W * 0.025), int(self.W * 0.016)
        maxbredd = maxbredd or (self.W - 2 * self.m)
        font, rader = passa(text, fet, storlek, maxbredd - 2 * padx, maxrader, storlek * 0.6)
        rh = radhojd(font)
        w = max(font.getlength(r) for r in rader) + 2 * padx
        h = rh * len(rader) + 2 * pady
        if ankare == "nere-hoger":
            x0, y0 = x - w, y - h
        elif ankare == "nere-vanster":
            x0, y0 = x, y - h
        elif ankare == "uppe-hoger":
            x0, y0 = x - w, y
        else:
            x0, y0 = x, y
        self.rit.rounded_rectangle([x0, y0, x0 + w, y0 + h], radius=int(self.W * 0.012), fill=hex_till_rgba(bakgrund, 245))
        yy = y0 + pady
        for rad in rader:
            self.rit.text((x0 + padx, yy), rad, font=font, fill=hex_till_rgba(farg))
            yy += rh
        return (x0, y0, x0 + w, y0 + h)

    # ---------------------------------------------------------------- priskort
    def priskort(self, pris, jamforpris=None, rabatt=None):
        """Höger tredjedel: stort pris, överstruket jämförpris, rabattchip."""
        bredd = int(self.W * 0.40)
        x0 = self.W - self.m - bredd
        pad = int(self.W * 0.03)
        inner = bredd - 2 * pad
        f_pris = typsnitt(True, self.W * STORLEK["pris"])
        while f_pris.getlength(pris) > inner and f_pris.size > 12:
            f_pris = typsnitt(True, f_pris.size * 0.92)
        f_jf = typsnitt(False, self.W * STORLEK["jamforpris"])
        h = pad + radhojd(f_pris)
        if jamforpris:
            h += radhojd(f_jf)
        if rabatt:
            h += int(self.W * 0.075)
        h += pad
        # Vertikalt mitt emellan toppbandet och bottenbandet.
        fritt = self.botten_y - self.topp
        y0 = self.topp + max(int(self.W * 0.04), (fritt - h) // 2)
        self.rit.rounded_rectangle([x0, y0, x0 + bredd, y0 + h], radius=int(self.W * 0.02), fill=hex_till_rgba(self.f["yta"], 242))
        y = y0 + pad
        self.rit.text((x0 + pad, y), pris, font=f_pris, fill=hex_till_rgba(self.f["mork"]))
        y += radhojd(f_pris)
        if jamforpris:
            self.rit.text((x0 + pad, y), jamforpris, font=f_jf, fill=hex_till_rgba(self.f["dampad"]))
            w = f_jf.getlength(jamforpris)
            asc, desc = f_jf.getmetrics()
            ym = y + asc * 0.62
            self.rit.line([(x0 + pad, ym), (x0 + pad + w, ym)], fill=hex_till_rgba(self.f["dampad"]), width=max(2, int(self.W * 0.004)))
            y += radhojd(f_jf)
        if rabatt:
            self.chip(rabatt, self.W * STORLEK["rabatt"], self.f["accent"], self.f["accent_text"], x0 + pad, y + int(self.W * 0.012), ankare="uppe-vanster")
        return (x0, y0, x0 + bredd, y0 + h)

    def spara(self, ut):
        Image.alpha_composite(self.bild, self.lager).convert("RGB").save(ut, quality=95)


def rita(bas, ut, spec):
    el = {}
    for e in spec.get("element", []):
        typ = str(e.get("typ", "")).strip().lower().replace("-", "_")
        text = str(e.get("text", "")).strip()
        if typ and text:
            el.setdefault(typ, []).append(text)
    duk = Duk(bas, spec.get("farger"))
    W = duk.W
    f = duk.f
    placerat = []
    forsta = lambda k: el.get(k, [None])[0]

    # 1. Bottenbandet först, så resten vet var golvet är.
    if forsta("botten"):
        placerat.append(("botten", duk.band_botten(forsta("botten"), W * STORLEK["botten"], f["mork"], f["text_pa_mork"])))

    # 2. Toppen: citatkort ELLER rubrikband.
    if forsta("citat"):
        rader = [(forsta("citat"), True, W * STORLEK["citat"], f["mork"], 4)]
        if forsta("namn"):
            rader.append((forsta("namn"), False, W * STORLEK["namn"], f["text"], 1))
        if forsta("stjarnor"):
            rader.append((forsta("stjarnor"), True, W * STORLEK["stjarnor"], f["accent"], 1))
        placerat.append(("citat", duk.band_topp(rader, f["yta"], alfa=236)))
    elif forsta("rubrik"):
        rader = [(forsta("rubrik"), True, W * STORLEK["rubrik"], f["text_pa_mork"], 3)]
        if forsta("underrad"):
            rader.append((forsta("underrad"), False, W * STORLEK["underrad"], f["text_pa_mork"], 2))
        placerat.append(("rubrik", duk.band_topp(rader, f["mork"])))

    # 3. Pris: kort om jämförpris/rabatt finns, annars liten chip.
    pris = forsta("pris")
    if pris and (forsta("jamforpris") or forsta("rabatt")):
        placerat.append(("priskort", duk.priskort(pris, forsta("jamforpris"), forsta("rabatt"))))
    hoger_y = duk.botten_y - int(W * 0.03)
    if pris and not (forsta("jamforpris") or forsta("rabatt")):
        r = duk.chip(pris, W * STORLEK["pris_liten"], f["yta"], f["mork"], W - duk.m, hoger_y, maxbredd=int(W * 0.9), maxrader=1)
        placerat.append(("pris", r))
        hoger_y = r[1] - int(W * 0.015)

    # 4. Badge nere till höger (ovanför en ev. prischip).
    if forsta("badge"):
        r = duk.chip(forsta("badge"), W * STORLEK["badge"], f["accent"], f["accent_text"], W - duk.m, hoger_y, maxbredd=int(W * 0.9), maxrader=1)
        placerat.append(("badge", r))

    # 5. Etiketter på halvorna (jämförelsebilder).
    if forsta("etikett_vanster") or forsta("etikett_hoger"):
        y = duk.botten_y - int(W * 0.04)
        halv = W // 2 - int(W * 0.06)
        if forsta("etikett_vanster"):
            placerat.append(("etikett_vanster", duk.chip(forsta("etikett_vanster"), W * STORLEK["etikett"], f["mork"], f["text_pa_mork"], duk.m, y, ankare="nere-vanster", maxbredd=halv)))
        if forsta("etikett_hoger"):
            placerat.append(("etikett_hoger", duk.chip(forsta("etikett_hoger"), W * STORLEK["etikett"], f["accent"], f["accent_text"], W - duk.m, y, ankare="nere-hoger", maxbredd=halv)))

    okanda = sorted(k for k in el if k not in {"botten", "citat", "namn", "stjarnor", "rubrik", "underrad", "pris", "jamforpris", "rabatt", "badge", "etikett_vanster", "etikett_hoger"})
    duk.spara(ut)
    return {"ut": ut, "bredd": W, "hojd": duk.H, "placerade": [p[0] for p in placerat], "okanda_typer": okanda}


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--bas", required=True)
    p.add_argument("--ut", required=True)
    p.add_argument("--spec", required=True)
    p.add_argument("--json", action="store_true")
    a = p.parse_args()
    with open(a.spec, encoding="utf-8") as fh:
        spec = json.load(fh)
    if not spec.get("element"):
        raise SystemExit("TOM_SPEC: inga element att rita — kör inte textlagret utan text.")
    r = rita(a.bas, a.ut, spec)
    if r["okanda_typer"]:
        print(f"⚠️ okända elementtyper hoppades över: {', '.join(r['okanda_typer'])}", file=sys.stderr)
    if a.json:
        print(json.dumps(r, ensure_ascii=False))
    else:
        print(f"✓ {r['ut']} ({r['bredd']}×{r['hojd']}) — {', '.join(r['placerade'])}")


if __name__ == "__main__":
    main()
