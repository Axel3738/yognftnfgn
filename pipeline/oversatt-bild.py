#!/usr/bin/env python3
"""oversatt-bild.py — översätter en bildannons byggd av /bildannonser till en ny marknad.

Bilderna är gjorda så: kie.ai ritar fotot, bildannonser/text.py lägger all text som
vektortext på ENFÄRGADE former (vit platta, blå knapp, mörk etikett). Det här
verktyget gör samma sak baklänges: hittar formerna, suddar texten INUTI formen
(fyller textpixlarna med formens egen färg, rad för rad — så en halvgenomskinlig
platta över fotot behåller sitt utseende) och ritar den nya texten i samma ruta
med samma stil. 0 krediter, pixelstabilt, ingen handmätning per bild.

Två pass:

    python3 pipeline/oversatt-bild.py --in se.jpg --analys
        → skriver ut formerna uppifrån och ned: index, typ (platta/knapp/etikett),
          y0–y1, antal textrader, fet/normal, textfärg. Rutinen läser bilden och
          skriver texter.json med en post per form (samma index).

    python3 pipeline/oversatt-bild.py --in se.jpg --ut no.jpg --texter texter.json
        texter.json = [{"form": 0, "text": "Beskytter sykkelen godt ute."}, {"form": 1, "text": "349 kr"}, ...]
        (form saknas i listan = formen lämnas orörd; text "" = texten tas bort)
        → no.jpg + no.jpg.qa.png (SE | NO sida vid sida). Exit 3 om text hittas
          utanför formerna (text direkt på fotot → Kie-reserven behövs).

Beroenden: numpy, pillow (pip install numpy pillow). Font: LiberationSans (samma som text.py).
"""
import argparse
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

FET = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
NORMAL = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
for f in (FET, NORMAL):
    if not Path(f).exists():
        sys.exit(f"typsnitt saknas: {f}")

# ------------------------------------------------------------------ analys


def _komponenter(mask):
    """Sammanhängande områden (4-grannskap) i en boolsk mask. Returnerar
    (etiketter, antal). Ren numpy — ingen scipy i containern."""
    h, w = mask.shape
    etiketter = np.zeros((h, w), dtype=np.int32)
    n = 0
    # Radvis segmentering + union-find över rader — snabbt nog för 1080×1350.
    foraldrar = {}

    def hitta(x):
        while foraldrar[x] != x:
            foraldrar[x] = foraldrar[foraldrar[x]]
            x = foraldrar[x]
        return x

    def forena(a, b):
        ra, rb = hitta(a), hitta(b)
        if ra != rb:
            foraldrar[max(ra, rb)] = min(ra, rb)

    forra_rad = []  # [(x0, x1, etikett)]
    for y in range(h):
        rad = mask[y]
        segment = []
        x = 0
        while x < w:
            if rad[x]:
                x0 = x
                while x < w and rad[x]:
                    x += 1
                n += 1
                foraldrar[n] = n
                segment.append((x0, x, n))
                etiketter[y, x0:x] = n
            else:
                x += 1
        for (a0, a1, e) in segment:
            for (b0, b1, f) in forra_rad:
                if a0 < b1 and b0 < a1:
                    forena(e, f)
        forra_rad = segment
    if n == 0:
        return etiketter, 0
    # Slå ihop till rotetiketter, numrera om 1..k
    rot = {e: hitta(e) for e in range(1, n + 1)}
    unika = {}
    ut = np.zeros_like(etiketter)
    for e, r in rot.items():
        if r not in unika:
            unika[r] = len(unika) + 1
    lut = np.zeros(n + 1, dtype=np.int32)
    for e, r in rot.items():
        lut[e] = unika[r]
    ut = lut[etiketter]
    return ut, len(unika)


def _dominant_farg(pixlar):
    q = (pixlar // 6) * 6
    vals, cnt = np.unique(q.reshape(-1, 3), axis=0, return_counts=True)
    return vals[cnt.argmax()].astype(int)


def hitta_former(im, min_andel=0.012):
    """Enfärgade former som bär text. im = HxWx3 int.
    En form = stort sammanhängande område med låg lokal variation vars färg
    dominerar området; texten är hålen (pixlar som avviker från formens färg)."""
    h, w, _ = im.shape
    g = im.astype(np.int32)
    # Lokal variation: skillnad mot grannen till höger/nedåt.
    dx = np.abs(g[:, 1:] - g[:, :-1]).sum(axis=2)
    dy = np.abs(g[1:, :] - g[:-1, :]).sum(axis=2)
    platt = np.ones((h, w), dtype=bool)
    platt[:, 1:] &= dx < 18
    platt[:, :-1] &= dx < 18
    platt[1:, :] &= dy < 18
    platt[:-1, :] &= dy < 18
    etik, k = _komponenter(platt)
    former = []
    min_px = int(min_andel * h * w)
    for e in range(1, k + 1):
        m = etik == e
        antal = int(m.sum())
        if antal < min_px:
            continue
        ys, xs = np.where(m)
        y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        farg = _dominant_farg(g[m])
        # Fotobakgrunder är också platta (himmel, vägg) — en textform ska ha text i sig.
        # Text = HÅL i formen: pixlar som inte hör till komponenten och som är
        # inneslutna av den (når inte bbox-kanten). Rundade hörn och fotot som
        # skymtar genom en halvgenomskinlig platta når kanten och räknas bort.
        # Fotot självt (en platt vägg) och produkten är också "platta" — bbox:en
        # över halva bilden är aldrig en textform.
        if (y1 - y0) * (x1 - x0) > 0.6 * h * w:
            continue
        # Bbox-täckning: en rektangulär form fyller sin bbox nästan helt (minus text).
        tackning = antal / float((y1 - y0) * (x1 - x0))
        if tackning < 0.55:
            continue
        box = g[y0:y1, x0:x1]
        inne = m[y0:y1, x0:x1]
        diff = np.abs(box - farg).sum(axis=2)
        avvik = (~inne) & (diff > 90)
        # Text har EN färg. Kärnpixlarna (tydligt avvikande) ger färgen; allt som
        # ligger långt från den (rundade hörn = fotot bakom, produkten som skymtar)
        # är inte text.
        karna = avvik & (diff > 120)
        if int(karna.sum()) < 30:
            continue
        textfarg = np.median(box[karna], axis=0)
        text = avvik & (np.abs(box - textfarg).sum(axis=2) < 70)
        # Bokstäver = många små komponenter av liknande storlek. Ett foto som
        # skymtar, en produkt, en platta = ett fåtal stora klumpar.
        t_etik, t_k = _komponenter(text)
        if t_k == 0:
            continue
        storlekar = np.bincount(t_etik.ravel())[1:]
        glyfer = storlekar[storlekar >= 6]
        if len(glyfer) < 4 or len(glyfer) > 600:
            continue
        # största klumpen får inte dominera (en stor klump = inte text)
        if glyfer.max() > 0.6 * glyfer.sum() and len(glyfer) < 12:
            continue
        ljus = farg.mean() > 160
        f = dict(y0=int(y0), y1=int(y1), x0=int(x0), x1=int(x1), farg=[int(c) for c in farg],
                 ljus=bool(ljus), mask=m, text=text, andel_text=float(text.mean()))
        rader = _textrader(f)
        if not rader or max(r["y1"] - r["y0"] for r in rader) > 140:
            continue
        former.append(f)
    former.sort(key=lambda f: (f["y0"], f["x0"]))
    return former


def _textrader(form):
    """Textrader inuti formen ur radprojektionen av avvikande pixlar."""
    t = form["text"]
    rader_med_text = t.sum(axis=1) > 0
    rader = []
    y = 0
    n = len(rader_med_text)
    while y < n:
        if rader_med_text[y]:
            y0 = y
            while y < n and (rader_med_text[y] or (y + 4 < n and rader_med_text[y:y + 5].any())):
                y += 1
            if y - y0 >= 8:
                xs = np.where(t[y0:y].any(axis=0))[0]
                rader.append(dict(y0=y0, y1=y, x0=int(xs.min()), x1=int(xs.max()) + 1))
        else:
            y += 1
    return rader


def _typ(form, bredd):
    w = form["x1"] - form["x0"]
    if form["ljus"]:
        return "platta"
    return "knapp" if w < bredd * 0.85 else "band"


def _fet(form, rader):
    """Grov fetkoll: genomsnittlig horisontell körlängd av textpixlar mot radhöjden.
    Fungerar per rad också (skicka [rad])."""
    t = form["text"]
    if not rader:
        return False
    radh = np.median([r["y1"] - r["y0"] for r in rader])
    langder = []
    for r in rader:
        for y in range(r["y0"], r["y1"]):
            rad = t[y]
            x = 0
            while x < len(rad):
                if rad[x]:
                    x0 = x
                    while x < len(rad) and rad[x]:
                        x += 1
                    langder.append(x - x0)
                else:
                    x += 1
    if not langder:
        return False
    return float(np.median(langder)) / max(1.0, radh) > 0.11


def _textfarg(im, form, rad=None):
    t = form["text"]
    if rad is not None:
        t = np.zeros_like(t); t[rad["y0"]:rad["y1"]] = form["text"][rad["y0"]:rad["y1"]]
    ys, xs = np.where(t)
    if len(ys) == 0:
        return [20, 20, 20]
    px = im[form["y0"] + ys, form["x0"] + xs]
    return [int(v) for v in np.median(px, axis=0)]


def analysera(im):
    h, w, _ = im.shape
    former = hitta_former(im)
    ut = []
    for i, f in enumerate(former):
        rader = _textrader(f)
        radinfo = []
        for k, r in enumerate(rader):
            radinfo.append(dict(rad=k, y0=f["y0"] + r["y0"], y1=f["y0"] + r["y1"], hojd=r["y1"] - r["y0"],
                                x0=f["x0"] + r["x0"], x1=f["x0"] + r["x1"],
                                fet=_fet(f, [r]), textfarg=_textfarg(im, f, r), centrerad=_centrerad(f, [r])))
        ut.append(dict(form=i, typ=_typ(f, w), y0=f["y0"], y1=f["y1"], x0=f["x0"], x1=f["x1"],
                       farg=f["farg"], rader=len(rader), radhojd=int(np.median([r["y1"] - r["y0"] for r in rader])) if rader else 0,
                       fet=_fet(f, rader), textfarg=_textfarg(im, f),
                       centrerad=_centrerad(f, rader), radinfo=radinfo, _form=f, _rader=rader))
    return ut


def _centrerad(form, rader):
    if not rader:
        return True
    w = form["x1"] - form["x0"]
    diffar = []
    for r in rader:
        v = r["x0"]
        h_ = w - r["x1"]
        diffar.append(abs(v - h_) / max(1, w))
    return float(np.median(diffar)) < 0.08


def text_utanfor(im, former):
    """Text direkt på fotot = avvikande, kantrika pixlar utanför alla former.
    Grov kontroll: andel starka kanter utanför formerna i topp-/bottenzonen."""
    h, w, _ = im.shape
    g = im.astype(np.int32)
    kant = (np.abs(g[:, 1:] - g[:, :-1]).sum(axis=2) > 200)
    tack = np.zeros((h, w - 1), dtype=bool)
    for f in former:
        tack[f["y0"]:f["y1"], f["x0"]:f["x1"] - 1] = True
    return kant & ~tack


# --------------------------------------------------------------- rendering


def _font(fet, storlek):
    return ImageFont.truetype(FET if fet else NORMAL, storlek)


def _bryt(text, font, maxbredd, rita):
    ord_ = text.split()
    rader, cur = [], ""
    for o in ord_:
        prov = (cur + " " + o).strip()
        if rita.textlength(prov, font=font) <= maxbredd or not cur:
            cur = prov
        else:
            rader.append(cur)
            cur = o
    if cur:
        rader.append(cur)
    return rader


def _passa(text, fet, start, maxbredd, maxrader, rita, minsta=16):
    storlek = start
    while storlek >= minsta:
        font = _font(fet, storlek)
        rader = _bryt(text, font, maxbredd, rita)
        if len(rader) <= maxrader and all(rita.textlength(r, font=font) <= maxbredd for r in rader):
            return font, rader
        storlek -= 2
    font = _font(fet, minsta)
    return font, _bryt(text, font, maxbredd, rita)


def sudda(im, form):
    """Fyll textpixlarna (utvidgade 2 px) med formens lokala färg, rad för rad."""
    y0, y1, x0, x1 = form["y0"], form["y1"], form["x0"], form["x1"]
    box = im[y0:y1, x0:x1]
    t = form["text"].copy()
    # utvidga 2 px så kantskuggan runt bokstäverna följer med
    for _ in range(2):
        t2 = t.copy()
        t2[1:] |= t[:-1]; t2[:-1] |= t[1:]; t2[:, 1:] |= t[:, :-1]; t2[:, :-1] |= t[:, 1:]
        t = t2
    for y in range(box.shape[0]):
        rad_t = t[y]
        if not rad_t.any():
            continue
        rena = box[y][~rad_t]
        if len(rena) < 8:
            fyll = np.array(form["farg"])
        else:
            fyll = np.median(rena, axis=0)
        box[y][rad_t] = fyll
    im[y0:y1, x0:x1] = box


def rita_text(bild, form, analys, text):
    rita = ImageDraw.Draw(bild)
    y0, y1, x0, x1 = form["y0"], form["y1"], form["x0"], form["x1"]
    w = x1 - x0
    marg = max(24, int(w * 0.05))
    maxbredd = w - 2 * marg
    rader_se = analys["_rader"]
    radh = analys["radhojd"] or 40
    start = max(18, int(round(radh * 1.05)))
    maxrader = max(1, len(rader_se) + 1) if rader_se else 3
    font, rader = _passa(text, analys["fet"], start, maxbredd, maxrader, rita)
    asc, desc = font.getmetrics()
    lh = int((asc + desc) * 1.12)
    blockh = lh * len(rader)
    # Vertikal placering: SE-textens mitt (eller formens mitt om ingen text hittades).
    if rader_se:
        mitt = y0 + (rader_se[0]["y0"] + rader_se[-1]["y1"]) / 2
    else:
        mitt = (y0 + y1) / 2
    ytop = int(mitt - blockh / 2)
    # Håll texten inom formen.
    ytop = max(y0 + 6, min(ytop, y1 - blockh - 6))
    farg = tuple(analys["textfarg"])
    for i, rad in enumerate(rader):
        y = ytop + i * lh
        if analys["centrerad"]:
            rita.text(((x0 + x1) / 2, y), rad, font=font, fill=farg, anchor="ma")
        else:
            xv = x0 + (rader_se[0]["x0"] if rader_se else marg)
            rita.text((xv, y), rad, font=font, fill=farg, anchor="la")


def rita_rad(bild, form, ri, text):
    """En textrad i sin egen ruta: samma höjd, fet/normal, färg och justering som
    SE-raden. Krymper tills den får plats på EN rad."""
    rita = ImageDraw.Draw(bild)
    x0, x1 = form["x0"], form["x1"]
    w = x1 - x0
    marg = max(24, int(w * 0.05))
    maxbredd = w - 2 * marg
    storlek = max(16, int(round(ri["hojd"] * 1.08)))
    font = _font(ri["fet"], storlek)
    while storlek > 16 and rita.textlength(text, font=font) > maxbredd:
        storlek -= 2
        font = _font(ri["fet"], storlek)
    asc, desc = font.getmetrics()
    # SE-radens mitt (pixelmått) ↔ nya radens visuella mitt (versalhöjd ≈ 0,72·asc)
    mitt = (ri["y0"] + ri["y1"]) / 2
    y = int(mitt - asc * 0.72 / 2)
    farg = tuple(ri["textfarg"])
    if ri["centrerad"]:
        rita.text(((x0 + x1) / 2, y), text, font=font, fill=farg, anchor="la" if False else "ma")
    else:
        rita.text((ri["x0"], y), text, font=font, fill=farg, anchor="la")


def qa_bild(se, no, ut):
    b = 540
    a = se.resize((b, int(se.height * b / se.width)))
    c = no.resize((b, int(no.height * b / no.width)))
    q = Image.new("RGB", (2 * b + 12, max(a.height, c.height)), "#202020")
    q.paste(a, (0, 0)); q.paste(c, (b + 12, 0))
    q.save(ut)


# ------------------------------------------------------------------- main


def main():
    p = argparse.ArgumentParser(description="Översätter en /bildannonser-bild till en ny marknad.")
    p.add_argument("--in", dest="inp", required=True)
    p.add_argument("--ut")
    p.add_argument("--texter")
    p.add_argument("--analys", action="store_true")
    p.add_argument("--json", action="store_true", help="analysen som JSON")
    a = p.parse_args()

    bild = Image.open(a.inp).convert("RGB")
    im = np.asarray(bild).astype(np.int32)
    analys = analysera(im)
    utanfor = text_utanfor(im, [x["_form"] for x in analys])
    h, w, _ = im.shape
    # kanttäthet utanför formerna i topp 30 % / botten 30 % (där text brukar sitta)
    zon = np.zeros_like(utanfor); zon[: int(h * 0.3)] = True; zon[int(h * 0.7):] = True
    kant_andel = float((utanfor & zon).mean())

    if a.analys or not a.ut:
        if a.json:
            print(json.dumps([{k: v for k, v in x.items() if not k.startswith("_")} for x in analys] +
                             [{"kant_utanfor": kant_andel}], ensure_ascii=False))
        else:
            print(f"{a.inp}: {w}×{h}, {len(analys)} textformer")
            for x in analys:
                print(f"  form {x['form']}: {x['typ']:<6} y={x['y0']}..{x['y1']} x={x['x0']}..{x['x1']} "
                      f"rader={x['rader']} färg={x['farg']}")
                for r in x["radinfo"]:
                    print(f"      rad {r['rad']}: y={r['y0']}..{r['y1']} h={r['hojd']} x={r['x0']}..{r['x1']} "
                          f"{'FET' if r['fet'] else 'normal'} textfärg={r['textfarg']} {'centrerad' if r['centrerad'] else 'vänster'}")
            print(f"  kanttäthet utanför formerna (topp/botten): {kant_andel:.4f} {'⚠ trolig text på fotot' if kant_andel > 0.012 else 'ok'}")
        return

    if not a.texter:
        sys.exit("--texter krävs tillsammans med --ut")
    texter = json.loads(Path(a.texter).read_text(encoding="utf-8"))
    # Två lägen per post: {"form": i, "rad": k, "text": ...} ritar raden i sin egen
    # ruta (behåller blandade stilar i en platta); {"form": i, "text": ...} ritar
    # om hela formen som ett block (radbrytning tillåten).
    per_form = {}
    per_rad = {}
    for t in texter:
        fi = int(t["form"])
        if "rad" in t and t["rad"] is not None:
            per_rad.setdefault(fi, {})[int(t["rad"])] = t.get("text", "")
        else:
            per_form[fi] = t.get("text", "")
    berorda = set(per_form) | set(per_rad)

    ny = im.copy()
    for x in analys:
        if x["form"] in berorda:
            sudda(ny, x["_form"])
    ut_bild = Image.fromarray(ny.astype(np.uint8))
    for x in analys:
        if x["form"] in per_rad:
            for k, text in per_rad[x["form"]].items():
                if k >= len(x["radinfo"]):
                    sys.exit(f"form {x['form']} har bara {len(x['radinfo'])} rader, rad {k} finns inte")
                if text.strip():
                    rita_rad(ut_bild, x["_form"], x["radinfo"][k], text.strip())
        elif x["form"] in per_form:
            text = per_form[x["form"]].strip()
            if text:
                rita_text(ut_bild, x["_form"], x, text)
    per_form = {**per_form, **{k: '' for k in per_rad}}

    ut = Path(a.ut)
    ut.parent.mkdir(parents=True, exist_ok=True)
    for kvalitet in (92, 88, 84, 80):
        ut_bild.save(ut, "JPEG", quality=kvalitet, subsampling=0, optimize=True)
        if ut.stat().st_size < 2 * 1024 * 1024:
            break
    qa_bild(bild, ut_bild, str(ut) + ".qa.png")
    saknade = [x["form"] for x in analys if x["form"] not in per_form and x["rader"] > 0]
    print(f"✓ {ut} ({len(per_form)} former översatta{', ' + str(len(saknade)) + ' former med text lämnade orörda: ' + str(saknade) if saknade else ''})")
    if kant_andel > 0.012:
        print("❌ trolig text direkt på fotot utanför formerna — kör Kie-reserven på den här bilden", file=sys.stderr)
        sys.exit(3)


if __name__ == "__main__":
    main()
