#!/usr/bin/env python3
"""Bränner skarp svensk text ovanpå en genererad bildannons.

Varför verktyget finns: kie.ai (och alla bildmodeller) stavar fel på svenska.
Körningen 2026-08-30 gav "trå" istället för "trä", "veldlyt" istället för
"väldigt" och en obegriplig kundrecension — i två rundor. Därför genererar
modellen bara BILDEN, och texten läggs på här som riktig vektortext ur briefen.
Då kan stavningen aldrig bli fel.

    python3 bildannonser/text.py --spec spec.json

Spec-formatet (skrivs av rutinen ur Notion-briefen, aldrig för hand):

    {
      "bild": "in.png",
      "ut": "ut.png",
      "bredd": 1080, "hojd": 1350,
      "block": [
        {"text": "Rubrik", "zon": "topp", "stil": "rubrik"},
        {"text": "Stödrad", "zon": "botten", "stil": "brod"},
        {"text": "Handla nu", "zon": "botten", "stil": "knapp"},
        {"text": "FÖRE", "zon": "vanster-mitt", "stil": "etikett"}
      ]
    }

Kräver Pillow och ett typsnitt med å/ä/ö (DejaVu finns i standardmiljön).
"""
import argparse
import json
import re
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

class TextFel(Exception):
    pass


def _valj(*kandidater):
    """Ramverket steg 3.4: Liberation Sans i forsta hand, DejaVu som fallback."""
    for k in kandidater:
        if Path(k).exists():
            return k
    raise TextFel(f"Hittar inget typsnitt bland {kandidater}")


FET = _valj(
    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
)
NORMAL = _valj(
    "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
)

# Stilarna motsvarar rollerna i briefen. Storlekarna är utgångsvärden — texten
# krymps automatiskt tills den får plats, så en lång rad aldrig hamnar utanför.
STILAR = {
    "rubrik":   {"font": FET,    "storlek": 78, "farg": "#141210", "rader": 3},
    "underrub": {"font": NORMAL, "storlek": 40, "farg": "#141210", "rader": 2},
    "brod":     {"font": NORMAL, "storlek": 32, "farg": "#141210", "rader": 3},
    "etikett":  {"font": FET,    "storlek": 30, "farg": "#FFFFFF", "rader": 1},
    "knapp":    {"font": FET,    "storlek": 42, "farg": "#FFFFFF", "rader": 1},
    "citat":    {"font": FET,    "storlek": 46, "farg": "#14304A", "rader": 5},
    "attrib":   {"font": NORMAL, "storlek": 30, "farg": "#14304A", "rader": 1},
    "badge":    {"font": NORMAL, "storlek": 30, "farg": "#14304A", "rader": 2},
    # Punktlistor och kryssbandet i briefarna: fler rader, mindre grad.
    "lista":    {"font": NORMAL, "storlek": 34, "farg": "#141210", "rader": 7},
    "pris":     {"font": FET,    "storlek": 96, "farg": "#141210", "rader": 1},
    "prisover": {"font": NORMAL, "storlek": 44, "farg": "#4A443E", "rader": 1},
}

MARGINAL = 64
KNAPPFARG = "#1B4C7A"
BADGEKANT = "#1B4C7A"


def _font(sokvag, storlek):
    try:
        return ImageFont.truetype(sokvag, storlek)
    except OSError as fel:
        raise TextFel(f"Hittar inte typsnittet {sokvag}: {fel}") from fel


def _blackfarg(stil, block):
    """Vit text på en ljus platta är osynlig. Plattan finns just för att bära
    mörk text, så en ljus stil vänds till mörkt bläck när plattan ritas.
    (Knappen har sin egen mörka pill och går aldrig via plattan.)"""
    if block.get("platta") and stil["farg"].upper() == "#FFFFFF":
        return "#141210"
    return stil["farg"]


def bryt_rader(text, font, maxbredd, rita):
    """Bryter texten på ordgränser så varje rad ryms inom maxbredd."""
    rader = []
    for stycke in text.split("\n"):
        ord_ = stycke.split()
        if not ord_:
            rader.append("")
            continue
        rad = ord_[0]
        for o in ord_[1:]:
            test = f"{rad} {o}"
            if rita.textlength(test, font=font) <= maxbredd:
                rad = test
            else:
                rader.append(rad)
                rad = o
        rader.append(rad)
    return rader


def dela_meningar(text):
    """Delar 'A. B.' i egna rader så rubriker inte bryts mitt i en mening."""
    delar = re.findall(r"[^.!?]+[.!?]*\s*", text)
    delar = [d.strip() for d in delar if d.strip()]
    # Ramverket steg 3.4: aldrig ordflottar. En bit utan bokstäver (t.ex. ett
    # ensamt avslutande citattecken) slås ihop med raden före.
    hopslaget = []
    for d in delar:
        if hopslaget and not any(t.isalnum() for t in d):
            hopslaget[-1] += d
        else:
            hopslaget.append(d)
    return "\n".join(hopslaget) if len(hopslaget) > 1 else text


def passa_in(text, sokvag, storlek, maxbredd, maxrader, rita, minsta=18):
    """Krymper texten tills den ryms på maxrader rader. Returnerar (font, rader)."""
    while storlek >= minsta:
        font = _font(sokvag, storlek)
        rader = bryt_rader(text, font, maxbredd, rita)
        if len(rader) <= maxrader:
            return font, rader
        storlek -= 2
    font = _font(sokvag, minsta)
    return font, bryt_rader(text, font, maxbredd, rita)


def _radhojd(font):
    return int((font.getbbox("Åjg")[3] - font.getbbox("Åjg")[1]) * 1.45)


def rita_scrim(bild, overst, hojd, uppifran=True, styrka=210):
    """Mörk toning bakom texten så vit text blir läsbar mot vilken bild som helst."""
    if hojd <= 0:
        return
    scrim = Image.new("RGBA", (bild.width, hojd), (0, 0, 0, 0))
    rita = ImageDraw.Draw(scrim)
    for y in range(hojd):
        andel = (1 - y / hojd) if uppifran else (y / hojd)
        rita.line([(0, y), (bild.width, y)], fill=(10, 14, 18, int(styrka * andel)))
    bild.alpha_composite(scrim, (0, overst))


def rita_knapp(bild, rita, text, font, mitt_y):
    bredd = int(rita.textlength(text, font=font))
    hoj = _radhojd(font)
    pad_x, pad_y = 44, 22
    x0 = (bild.width - bredd) // 2 - pad_x
    x1 = (bild.width + bredd) // 2 + pad_x
    y0 = mitt_y - hoj // 2 - pad_y
    y1 = mitt_y + hoj // 2 + pad_y
    rita.rounded_rectangle([x0, y0, x1, y1], radius=(y1 - y0) // 2, fill=KNAPPFARG)
    rita.text(((x0 + x1) / 2, (y0 + y1) / 2), text, font=font, fill="#FFFFFF", anchor="mm")
    return y1 - y0 + 24


def rita_platta(bild, x0, y0, x1, y1, alpha=225):
    """Ljus platta bakom mörk text. Ramverket kräver kontrast ≥ 4,5:1, och
    mörk text över ett mörkt produktfoto klarar aldrig det."""
    platta = Image.new("RGBA", (max(1, int(x1 - x0)), max(1, int(y1 - y0))),
                       (255, 255, 255, alpha))
    bild.alpha_composite(platta, (int(x0), int(y0)))


def rita_stryk(rita, text, stryk, font, mitt_x, y):
    """Ritar ett streck över delsträngen `stryk`. Ramverket steg 7:
    överstrykning är ett ritat streck, aldrig ordet."""
    if not stryk or stryk not in text:
        return
    full = rita.textlength(text, font=font)
    fore = rita.textlength(text[:text.index(stryk)], font=font)
    bredd = rita.textlength(stryk, font=font)
    x0 = mitt_x - full / 2 + fore
    hoj = font.getbbox("X")[3] - font.getbbox("X")[1]
    mitt_y = y + hoj * 0.62
    rita.line([(x0, mitt_y), (x0 + bredd, mitt_y)], fill="#141210",
              width=max(3, int(hoj * 0.09)))


BOCKFARG = "#1E9E4A"


def rita_bock(rita, x, y, storlek):
    """Ritar en grön bock. Briefarna skriver ✅, men den glyfen finns inte i
    Liberation Sans och skulle bli en tom ruta — så vi ritar den i stället."""
    b = storlek * 0.62
    rita.line([(x, y + b * 0.55), (x + b * 0.36, y + b * 0.9)],
              fill=BOCKFARG, width=max(3, int(b * 0.16)))
    rita.line([(x + b * 0.36, y + b * 0.9), (x + b, y + b * 0.12)],
              fill=BOCKFARG, width=max(3, int(b * 0.16)))


def rita_lista(rita, rader, font, bredd, y, farg):
    """Vänsterställd lista, centrerad som block. Rader som börjar med ✅ får en
    ritad bock och texten flyttas in — bocken är ett grafiskt element, inte
    ett tecken, så den kan aldrig bli en tom ruta."""
    rensade = [(r[1:].lstrip() if r.startswith(("\u2705", "\u2713")) else r,
                r.startswith(("\u2705", "\u2713"))) for r in rader]
    indrag = int(_radhojd(font) * 0.85)
    maxbredd = max(rita.textlength(t, font=font) for t, _ in rensade)
    x0 = (bredd - (maxbredd + indrag)) / 2
    rh = _radhojd(font)
    for i, (t, harbock) in enumerate(rensade):
        ry = y + i * rh
        if harbock:
            rita_bock(rita, x0, ry, rh)
        rita.text((x0 + indrag, ry), t, font=font, fill=farg)
    return rh * len(rensade)


def rita_etikett(bild, rita, text, font, x, y):
    bredd = int(rita.textlength(text, font=font))
    hoj = _radhojd(font)
    pad = 14
    rita.rounded_rectangle(
        [x - pad, y - pad, x + bredd + pad, y + hoj + pad], radius=8, fill=(10, 14, 18, 190)
    )
    rita.text((x, y), text, font=font, fill="#FFFFFF")


ZONER = {"topp", "topp-under", "botten", "botten-over", "mitt",
         "vanster-mitt", "hoger-mitt", "vanster-nere", "hoger-nere"}


def lagg_pa_text(spec):
    inbild = Path(spec["bild"])
    if not inbild.exists():
        raise TextFel(f"Bilden saknas: {inbild}")

    bredd = int(spec.get("bredd", 1080))
    hojd = int(spec.get("hojd", 1350))

    bild = Image.open(inbild).convert("RGBA")
    # Beskär mitten till exakt annonsformat istället för att sträcka bilden.
    mal = bredd / hojd
    kalla = bild.width / bild.height
    if kalla > mal:
        ny = int(bild.height * mal)
        bild = bild.crop(((bild.width - ny) // 2, 0, (bild.width + ny) // 2, bild.height))
    elif kalla < mal:
        ny = int(bild.width / mal)
        bild = bild.crop((0, (bild.height - ny) // 2, bild.width, (bild.height + ny) // 2))
    bild = bild.resize((bredd, hojd), Image.LANCZOS)

    rita = ImageDraw.Draw(bild)
    maxbredd = bredd - 2 * MARGINAL

    block = spec.get("block", [])
    for b in block:
        if b.get("zon") not in ZONER:
            raise TextFel(f"Okänd zon: {b.get('zon')}. Tillåtna: {sorted(ZONER)}")
        if b.get("stil") not in STILAR:
            raise TextFel(f"Okänd stil: {b.get('stil')}. Tillåtna: {sorted(STILAR)}")

    # Scrim bara där det faktiskt ligger text, och bara när stilen är ljus.
    toppblock = [b for b in block if b["zon"].startswith("topp")]
    bottenblock = [b for b in block if b["zon"].startswith("botten")]
    if any(_blackfarg(STILAR[b["stil"]], b).upper() == "#FFFFFF" for b in toppblock):
        rita_scrim(bild, 0, int(hojd * 0.34), uppifran=True)
    if any(_blackfarg(STILAR[b["stil"]], b).upper() == "#FFFFFF" for b in bottenblock):
        rita_scrim(bild, int(hojd * 0.66), int(hojd * 0.34), uppifran=False)
    rita = ImageDraw.Draw(bild)

    y_topp = MARGINAL
    y_botten = hojd - MARGINAL

    # Botten ritas nerifrån och upp, så blocken staplas i angiven ordning.
    for b in reversed(bottenblock):
        stil = STILAR[b["stil"]]
        kalla = dela_meningar(b["text"]) if b["stil"] in ("rubrik", "citat") else b["text"]
        font, rader = passa_in(kalla, stil["font"], stil["storlek"],
                               maxbredd, stil["rader"], rita)
        if b["stil"] == "knapp":
            y_botten -= rita_knapp(bild, rita, b["text"], font, y_botten - _radhojd(font) // 2)
            continue
        rh = _radhojd(font)
        y_botten -= rh * len(rader) + 16
        if b.get("platta"):
            rita_platta(bild, MARGINAL // 2, y_botten - 18,
                        bredd - MARGINAL // 2, y_botten + rh * len(rader) + 12)
            rita = ImageDraw.Draw(bild)
        farg = _blackfarg(stil, b)
        if b["stil"] == "lista":
            rita_lista(rita, rader, font, bredd, y_botten, farg)
        else:
            for i, rad in enumerate(rader):
                rita.text((bredd / 2, y_botten + i * rh), rad, font=font,
                          fill=farg, anchor="ma")

    for b in toppblock:
        stil = STILAR[b["stil"]]
        kalla = dela_meningar(b["text"]) if b["stil"] in ("rubrik", "citat") else b["text"]
        font, rader = passa_in(kalla, stil["font"], stil["storlek"],
                               maxbredd, stil["rader"], rita)
        rh = _radhojd(font)
        if b.get("platta"):
            rita_platta(bild, MARGINAL // 2, y_topp - 18,
                        bredd - MARGINAL // 2, y_topp + rh * len(rader) + 12)
            rita = ImageDraw.Draw(bild)
        farg = _blackfarg(stil, b)
        if b["stil"] == "lista":
            rita_lista(rita, rader, font, bredd, y_topp, farg)
        else:
            for i, rad in enumerate(rader):
                rita.text((bredd / 2, y_topp + i * rh), rad, font=font,
                          fill=farg, anchor="ma")
                rita_stryk(rita, rad, b.get("stryk"), font, bredd / 2, y_topp + i * rh)
        y_topp += rh * len(rader) + 20

    for b in block:
        zon = b["zon"]
        if zon.startswith(("topp", "botten")):
            continue
        stil = STILAR[b["stil"]]
        font, rader = passa_in(b["text"], stil["font"], stil["storlek"],
                               maxbredd // 2, stil["rader"], rita)
        rh = _radhojd(font)
        if zon == "mitt":
            for i, rad in enumerate(rader):
                rita.text((bredd / 2, hojd / 2 + i * rh), rad, font=font,
                          fill=stil["farg"], anchor="ma")
        else:
            x = MARGINAL if zon.startswith("vanster") else bredd // 2 + MARGINAL // 2
            y = int(hojd * (0.46 if zon.endswith("mitt") else 0.775))
            if b["stil"] == "etikett":
                rita_etikett(bild, rita, b["text"], font, x, y)
            elif b["stil"] == "badge":
                b_bredd = maxbredd // 2 - MARGINAL // 2
                rita.rounded_rectangle([x, y, x + b_bredd, y + rh * len(rader) + 36],
                                       radius=24, outline=BADGEKANT, width=3)
                for i, rad in enumerate(rader):
                    rita.text((x + b_bredd / 2, y + 18 + i * rh), rad, font=font,
                              fill=stil["farg"], anchor="ma")
            else:
                for i, rad in enumerate(rader):
                    rita.text((x, y + i * rh), rad, font=font, fill=stil["farg"])

    ut = Path(spec["ut"]).with_suffix(".jpg")
    ut.parent.mkdir(parents=True, exist_ok=True)
    rgb = bild.convert("RGB")
    for kvalitet in (92, 88, 84, 80, 76):
        rgb.save(ut, "JPEG", quality=kvalitet, subsampling=0, optimize=True)
        if ut.stat().st_size < 2 * 1024 * 1024:
            break
    return ut


def main():
    p = argparse.ArgumentParser(description="Bränner svensk text på en bildannons.")
    p.add_argument("--spec", required=True, help="JSON-fil med bild, ut och block")
    args = p.parse_args()

    data = json.loads(Path(args.spec).read_text(encoding="utf-8"))
    specar = data if isinstance(data, list) else [data]
    for spec in specar:
        try:
            ut = lagg_pa_text(spec)
            print(f"  ✓ {ut}")
        except TextFel as fel:
            print(f"  ✗ {spec.get('ut', '?')} — {fel}", file=sys.stderr)
            sys.exit(1)


if __name__ == "__main__":
    main()
