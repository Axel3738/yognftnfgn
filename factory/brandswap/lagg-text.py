#!/usr/bin/env python3
"""lagg-text.py — lägger tillbaka skarp vektortext på en bild som kie.ai rensat.

Varför verktyget finns: fyra av IBC-annonserna har texten bränd DIREKT på fotot,
utan enfärgad platta bakom. `pipeline/oversatt-bild.py` kan inte sudda dem —
den fyller textpixlarna med formens egen färg, och ett lövverk har ingen egen
färg. Vägen är då den som står i CLAUDE.md: kie.ai rensar bort texten,
vektortexten läggs tillbaka här. Aldrig tvärtom — bildmodeller stavar fel på
svenska och norska.

`bildannonser/text.py` räcker inte för det här jobbet: den placerar i ZONER
(topp / botten / mitt) och bygger om annonsen till standardmallen. En
brand-swap ska behålla den layout som redan är testad, alltså placeras varje
element på sina egna uppmätta pixelkoordinater.

    python3 factory/brandswap/lagg-text.py \
        --bild ren.png --spec spec.json --ut ut.jpg --kalla original.jpg

`--kalla` är källbilden och ger QA-bilden (källa | resultat, sida vid sida),
samma format som oversatt-bild.py skriver.

Så mäter du koordinaterna: diffa källbilden mot den kie-rensade bilden. Det som
skiljer är exakt det som togs bort.

    d = np.abs(kalla - ren).sum(axis=2) > 110

Spec-format — en lista av element, ritade i ordning:

    {"element": [
      {"typ": "stjarnor", "box": [763, 38, 1020, 76], "antal": 5,
       "farg": [235, 190, 75]},
      {"typ": "text", "box": [520, 85, 985, 155], "text": "…", "rader": 2,
       "fet": false, "storlek": 30, "farg": [250, 252, 240], "just": "hoger",
       "radavstand": 1.25, "kontur": [0, 0, 0], "konturbredd": 4,
       "stryk": "636 kr"},
      {"typ": "bock", "box": [651, 260, 980, 284], "text": "14 dagars ångerrätt",
       "storlek": 26, "farg": [244, 247, 232], "just": "hoger"},
      {"typ": "knapp", "box": [755, 300, 980, 356], "text": "BESTÄLL NU",
       "farg": [30, 150, 72], "textfarg": [255, 255, 255], "storlek": 34,
       "radie": 14}
    ]}

Alla element krymper automatiskt tills texten ryms i sin box — en rad kan
aldrig svämma över, vilket är hela poängen med vektortext.
"""
import argparse
import json
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

FET = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
NORMAL = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
for _f in (FET, NORMAL):
    if not Path(_f).exists():
        sys.exit(f"typsnitt saknas: {_f}")


def _font(fet, storlek):
    return ImageFont.truetype(FET if fet else NORMAL, max(8, int(storlek)))


def _bryt(text, font, maxbredd, rita):
    """Radbryter på ordgränser. Ett ord som är bredare än rutan får stå ensamt —
    krympningen i _passa tar hand om det i nästa varv."""
    rader, cur = [], ""
    for ord_ in text.split():
        prov = (cur + " " + ord_).strip()
        if rita.textlength(prov, font=font) <= maxbredd or not cur:
            cur = prov
        else:
            rader.append(cur)
            cur = ord_
    if cur:
        rader.append(cur)
    return rader


def _passa(text, fet, storlek, maxbredd, maxrader, rita, minsta=12):
    """Största storleken ≤ `storlek` där texten ryms på högst `maxrader` rader."""
    s = int(storlek)
    while s >= minsta:
        font = _font(fet, s)
        rader = _bryt(text, font, maxbredd, rita)
        if len(rader) <= maxrader and all(rita.textlength(r, font=font) <= maxbredd for r in rader):
            return font, rader
        s -= 1
    font = _font(fet, minsta)
    return font, _bryt(text, font, maxbredd, rita)


def _x(just, box, bredd):
    x0, _, x1, _ = box
    if just == "vanster":
        return x0
    if just == "center":
        return (x0 + x1) / 2 - bredd / 2
    return x1 - bredd            # hoger


def _rita_rad(rita, xy, text, font, farg, kontur, konturbredd):
    """Text med valfri kontur. Konturen ritas som stroke — Pillow gör den runt
    hela glyfen, vilket är exakt det som håller vit text läsbar på ett foto."""
    if kontur and konturbredd:
        rita.text(xy, text, font=font, fill=tuple(farg), anchor="la",
                  stroke_width=int(konturbredd), stroke_fill=tuple(kontur))
    else:
        rita.text(xy, text, font=font, fill=tuple(farg), anchor="la")


def rita_text(lager, e):
    rita = ImageDraw.Draw(lager)
    box = [int(v) for v in e["box"]]
    x0, y0, x1, y1 = box
    maxbredd = x1 - x0
    maxrader = int(e.get("rader", 1))
    fet = bool(e.get("fet"))
    kontur = e.get("kontur")
    kb = int(e.get("konturbredd", 0))
    font, rader = _passa(e["text"], fet, e.get("storlek", 32), maxbredd - 2 * kb, maxrader, rita)
    asc, desc = font.getmetrics()
    lh = int(font.size * float(e.get("radavstand", 1.28)))
    blockh = lh * (len(rader) - 1) + asc
    ytop = y0 + ((y1 - y0) - blockh) / 2
    just = e.get("just", "center")
    farg = e.get("farg", [255, 255, 255])
    for i, rad in enumerate(rader):
        bredd = rita.textlength(rad, font=font)
        xs = _x(just, box, bredd)
        y = ytop + i * lh
        _rita_rad(rita, (xs, y), rad, font, farg, kontur, kb)
        stryk = e.get("stryk")
        if stryk and stryk in rad:
            i0 = rad.index(stryk)
            sx0 = xs + rita.textlength(rad[:i0], font=font)
            sx1 = sx0 + rita.textlength(stryk, font=font)
            ym = y + asc * 0.72 / 2
            rita.line([(sx0 - 4, ym), (sx1 + 4, ym)], fill=tuple(farg),
                      width=max(2, font.size // 12))


def rita_stjarnor(lager, e):
    """Fem fyllda stjärnor i rutan. Ritas som polygoner, inte som tecken —
    stjärnglyfen finns inte i Liberation Sans."""
    rita = ImageDraw.Draw(lager)
    x0, y0, x1, y1 = [int(v) for v in e["box"]]
    n = int(e.get("antal", 5))
    farg = tuple(e.get("farg", [235, 190, 75]))
    steg = (x1 - x0) / n
    r = min(steg * 0.46, (y1 - y0) * 0.5)
    cy = (y0 + y1) / 2
    import math
    for k in range(n):
        cx = x0 + steg * (k + 0.5)
        punkter = []
        for i in range(10):
            rad = r if i % 2 == 0 else r * 0.42
            v = -math.pi / 2 + i * math.pi / 5
            punkter.append((cx + rad * math.cos(v), cy + rad * math.sin(v)))
        rita.polygon(punkter, fill=farg)


def rita_bock(lager, e):
    """Grön eller vit bock följd av text — samma form som oversatt-bild.py ritar."""
    rita = ImageDraw.Draw(lager)
    box = [int(v) for v in e["box"]]
    x0, y0, x1, y1 = box
    farg = e.get("farg", [255, 255, 255])
    bockfarg = tuple(e.get("bockfarg", farg))
    h = y1 - y0
    bredd_bock = int(h * 1.05)
    font, rader = _passa(e["text"], bool(e.get("fet")), e.get("storlek", h),
                         (x1 - x0) - bredd_bock - 12, 1, rita)
    tb = rita.textlength(rader[0], font=font)
    asc, _ = font.getmetrics()
    total = tb + bredd_bock + 12
    xs = _x(e.get("just", "hoger"), box, total)
    cy = (y0 + y1) / 2
    rita.line([(xs, cy), (xs + h * 0.34, cy + h * 0.32), (xs + h * 0.95, cy - h * 0.38)],
              fill=bockfarg, width=max(2, int(h * 0.16)), joint="curve")
    _rita_rad(rita, (xs + bredd_bock + 12, cy - asc * 0.72), rader[0], font, farg,
              e.get("kontur"), int(e.get("konturbredd", 0)))


def rita_knapp(lager, e):
    rita = ImageDraw.Draw(lager)
    x0, y0, x1, y1 = [int(v) for v in e["box"]]
    rita.rounded_rectangle([x0, y0, x1, y1], radius=int(e.get("radie", 14)),
                           fill=tuple(e.get("farg", [30, 150, 72])))
    marg = max(14, int((x1 - x0) * 0.06))
    font, rader = _passa(e["text"], bool(e.get("fet", True)), e.get("storlek", 34),
                         (x1 - x0) - 2 * marg, 1, rita)
    asc, _ = font.getmetrics()
    rita.text(((x0 + x1) / 2, (y0 + y1) / 2 - asc * 0.72 / 2), rader[0], font=font,
              fill=tuple(e.get("textfarg", [255, 255, 255])), anchor="ma")


RITARE = {"text": rita_text, "stjarnor": rita_stjarnor, "bock": rita_bock, "knapp": rita_knapp}


def qa_bild(kalla, ny, ut):
    """Källa till vänster, resultat till höger — samma QA-format som
    pipeline/oversatt-bild.py skriver, så granskningen ser likadan ut."""
    b = 540
    a = kalla.resize((b, int(kalla.height * b / kalla.width)))
    c = ny.resize((b, int(ny.height * b / ny.width)))
    q = Image.new("RGB", (2 * b + 12, max(a.height, c.height)), "#202020")
    q.paste(a, (0, 0))
    q.paste(c, (b + 12, 0))
    q.save(ut)


def main():
    p = argparse.ArgumentParser(description="Lägger vektortext på en kie-rensad bild.")
    p.add_argument("--bild", required=True, help="den kie-rensade bilden")
    p.add_argument("--spec", required=True)
    p.add_argument("--ut", required=True)
    p.add_argument("--kalla", help="källbilden — ger QA-bilden <ut>.qa.png")
    a = p.parse_args()

    spec = json.loads(Path(a.spec).read_text(encoding="utf-8"))
    bild = Image.open(a.bild).convert("RGB")
    lager = bild.convert("RGBA")
    for e in spec["element"]:
        typ = e.get("typ", "text")
        if typ not in RITARE:
            sys.exit(f"okänd elementtyp: {typ}. Tillåtna: {sorted(RITARE)}")
        RITARE[typ](lager, e)
    ut_bild = lager.convert("RGB")

    ut = Path(a.ut)
    ut.parent.mkdir(parents=True, exist_ok=True)
    for kvalitet in (92, 88, 84, 80):
        ut_bild.save(ut, "JPEG", quality=kvalitet, subsampling=0, optimize=True)
        if ut.stat().st_size < 2 * 1024 * 1024:
            break
    if a.kalla:
        qa_bild(Image.open(a.kalla).convert("RGB"), ut_bild, str(ut) + ".qa.png")
    print(f"✓ {ut} ({len(spec['element'])} element)")


if __name__ == "__main__":
    main()
