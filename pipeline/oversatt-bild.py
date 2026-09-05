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


def hitta_former(im, min_andel=0.003):
    """Enfärgade former som bär text. im = HxWx3 int.
    Tre kandidatmasker, för formerna ser olika ut i pixlarna:
      • platt  — låg lokal variation (knappar, plattor över lugna foton)
      • ljus   — nästan vitt och omättat (den halvgenomskinliga plattan över ett
                 rörigt foto: fotot skymtar, men aldrig under ~195)
      • mörk   — nästan svart och omättat (etiketter, mörka knappar)
    Varje kandidat prövas likadant; texten är hålen (pixlar av EN annan färg).
    Överlappande kandidater slås ihop till den med flest bokstäver."""
    h, w, _ = im.shape
    g = im.astype(np.int32)
    dx = np.abs(g[:, 1:] - g[:, :-1]).sum(axis=2)
    dy = np.abs(g[1:, :] - g[:-1, :]).sum(axis=2)
    platt = np.ones((h, w), dtype=bool)
    platt[:, 1:] &= dx < 18
    platt[:, :-1] &= dx < 18
    platt[1:, :] &= dy < 18
    platt[:-1, :] &= dy < 18
    mx, mn = g.max(axis=2), g.min(axis=2)
    ljus = (mn > 195) & (mx - mn < 30)
    # En vit platta på en gräddvit bakgrund smälter ihop i ljus-masken; den rena
    # vita (>238, nästan omättad) skiljer plattan från bakgrunden.
    vit = (mn > 238) & (mx - mn < 12)
    mork = (mx < 70) & (mx - mn < 30)
    kandidater = []
    for mask in (platt, ljus, vit, mork):
        etik, k = _komponenter(mask)
        min_px = int(min_andel * h * w)
        storlekar = np.bincount(etik.ravel())
        for e in range(1, k + 1):
            if storlekar[e] < min_px:
                continue
            kandidater.append(etik == e)
    former = []
    for m in kandidater:
        antal = int(m.sum())
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
        # Suddmasken ska ta ALL text, inte bara huvudfärgen: en platta kan ha svart
        # rubrik, blått citat och grå avsändare (Batmotor_TR_1_1 — de blå raderna
        # blev spöken, mätt 2026-09-03). Text = omättade avvikande pixlar i
        # komponenter som varken nuddar bbox-kanten (fotot bakom rundade hörn) eller
        # är stora klumpar (produkten som skymtar genom plattan). Mättade färger
        # (gröna bockar) lämnas kvar med flit — de ritas inte om.
        bmx, bmn = box.max(axis=2), box.min(axis=2)
        alla = avvik & (bmx - bmn < 100)
        a_etik, a_k = _komponenter(alla)
        if a_k:
            stor = np.bincount(a_etik.ravel())
            ok = stor <= 6000
            ok[0] = False
            # 10 px kantband: knappens rundade hörn slutar några px innanför bbox:en
            # (MC-Kapell_RE_1_1 / Kranskydd_PD_8_1 fick skräprader i hörnet, mätt 2026-09-03);
            # text.py:s marginal till formkanten är aldrig under 24 px.
            for e in np.unique(np.concatenate([a_etik[:10].ravel(), a_etik[-10:].ravel(), a_etik[:, :10].ravel(), a_etik[:, -10:].ravel()])):
                ok[e] = False
            text = text | ok[a_etik]
        f = dict(y0=int(y0), y1=int(y1), x0=int(x0), x1=int(x1), farg=[int(c) for c in farg],
                 ljus=bool(ljus), mask=m, text=text, andel_text=float(text.mean()))
        rader = _textrader(f)
        if not rader or max(r["y1"] - r["y0"] for r in rader) > 140:
            continue
        f["glyfer"] = int(len(glyfer))
        former.append(f)
    # Samma form kan hittas av två masker — behåll den med flest bokstäver.
    former.sort(key=lambda f: -f["glyfer"])
    unika = []
    for f in former:
        dubbel = False
        for u in unika:
            ox = max(0, min(f["x1"], u["x1"]) - max(f["x0"], u["x0"]))
            oy = max(0, min(f["y1"], u["y1"]) - max(f["y0"], u["y0"]))
            yta = ox * oy
            minsta = min((f["x1"] - f["x0"]) * (f["y1"] - f["y0"]), (u["x1"] - u["x0"]) * (u["y1"] - u["y0"]))
            if minsta and yta / minsta > 0.6:
                dubbel = True
                break
        if not dubbel:
            unika.append(f)
    unika.sort(key=lambda f: (f["y0"], f["x0"]))
    return unika


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


def _karna(im, form, rader):
    """Kärnmask: textpixlar nära radens egen textfärg. Suddmasken tar med de
    antialiasade kanterna (så att inget spökar), men streckbredden ska mätas på
    kärnan — annars ser normal text fet ut (mätt 2026-09-03, hela batchen)."""
    t = form["text"]
    ut = np.zeros_like(t)
    for r in rader:
        sub = t[r["y0"]:r["y1"]]
        px = im[form["y0"] + r["y0"]:form["y0"] + r["y1"], form["x0"]:form["x1"]]
        vals = px[sub]
        if len(vals) < 10:
            ut[r["y0"]:r["y1"]] = sub
            continue
        ljus = vals.sum(axis=1)
        sel = vals[ljus <= np.median(ljus)] if form["ljus"] else vals[ljus >= np.median(ljus)]
        farg = np.median(sel, axis=0)
        ut[r["y0"]:r["y1"]] = sub & (np.abs(px - farg).sum(axis=2) < 70)
    return ut


def _fet(form, rader, im=None):
    """Grov fetkoll: genomsnittlig horisontell körlängd av textpixlar mot radhöjden.
    Fungerar per rad också (skicka [rad])."""
    t = form["text"] if im is None else _karna(im, form, rader)
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
    # kanterna är ljusare/mörkare än texten — ta den halva som ligger närmast textens extrem
    ljus = px.sum(axis=1)
    sel = px[ljus <= np.median(ljus)] if form["ljus"] else px[ljus >= np.median(ljus)]
    return [int(v) for v in np.median(sel if len(sel) else px, axis=0)]


def analysera(im):
    h, w, _ = im.shape
    former = hitta_former(im)
    ut = []
    for i, f in enumerate(former):
        rader = _textrader(f)
        # Radens x-spann ur kärnmasken: den inkluderande masken tar med bockarnas
        # ljusa kantpixlar och skjuter x0 åt vänster (Batmotor_LI_1_1 rad 4–5, 2026-09-03).
        for r in rader:
            kx = np.where(_karna(im, f, [r])[r["y0"]:r["y1"]].any(axis=0))[0]
            if len(kx):
                r["x0"], r["x1"] = int(kx.min()), int(kx.max()) + 1
        radinfo = []
        for k, r in enumerate(rader):
            radinfo.append(dict(rad=k, y0=f["y0"] + r["y0"], y1=f["y0"] + r["y1"], hojd=r["y1"] - r["y0"],
                                x0=f["x0"] + r["x0"], x1=f["x0"] + r["x1"],
                                fet=_fet(f, [r], im), textfarg=_textfarg(im, f, r), centrerad=_centrerad(f, [r])))
        ut.append(dict(form=i, typ=_typ(f, w), y0=f["y0"], y1=f["y1"], x0=f["x0"], x1=f["x1"],
                       farg=f["farg"], rader=len(rader), radhojd=int(np.median([r["y1"] - r["y0"] for r in rader])) if rader else 0,
                       fet=_fet(f, rader, im), textfarg=_textfarg(im, f),
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


def fyll(box, mask, reserv):
    """Väljer fyllning: en PLAN platta (rena pixlar med liten spridning) fylls med
    plattans median plus samma brus som plattan har — en utbredningsfyllning ärver
    JPEG-ringningen runt bokstäverna och blev en svag spökrad på Batmotor_TR_1_1
    (2026-09-03). En platta med foto bakom (stor spridning) fylls med fyll_2d."""
    rena = box[~mask]
    if len(rena) >= 64:
        std = rena.std(axis=0)
        if std.mean() < 8:
            med = np.median(rena, axis=0)
            brus = np.random.default_rng(0).normal(0.0, std, size=(int(mask.sum()), 3))
            box[mask] = np.clip(med + brus, 0, 255).astype(box.dtype)
            return
    fyll_2d(box, mask, reserv)


def fyll_2d(box, mask, reserv):
    """Fyller maskade pixlar (text) inifrån kanten: varje omgång får de maskade
    pixlarna som har en känd granne medelvärdet av sina kända grannar (8-grannskap),
    tills allt är fyllt. Ger en lokal, mjuk fyllning utan de horisontella ränder som
    radvis interpolation gav på en badge över ett tegelfoto (Kranskydd_SP_3_1,
    2026-09-03). På en enfärgad platta blir resultatet exakt plattfärgen.
    box = (h, w, 3) int-vy som ändras på plats. reserv = färg om inget är känt."""
    m = mask.copy()
    if (~m).sum() < 8:
        box[m] = reserv
        return
    for _ in range(400):
        if not m.any():
            break
        kand = ~m
        v = np.pad(np.where(kand[..., None], box, 0).astype(np.float64), ((1, 1), (1, 1), (0, 0)), mode="edge")
        c = np.pad(kand.astype(np.int32), 1, mode="edge")
        s = np.zeros(box.shape, dtype=np.float64)
        n = np.zeros(box.shape[:2], dtype=np.int32)
        h, w = m.shape
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                if dy == 0 and dx == 0:
                    continue
                s += v[1 + dy:1 + dy + h, 1 + dx:1 + dx + w]
                n += c[1 + dy:1 + dy + h, 1 + dx:1 + dx + w]
        fyll = m & (n > 0)
        if not fyll.any():
            break
        box[fyll] = (s[fyll] / n[fyll][:, None]).astype(box.dtype)
        m &= ~fyll
    if m.any():
        box[m] = reserv


def sudda(im, form, klipp_y=None):
    """Fyll textpixlarna (utvidgade 2 px) med formens lokala färg, rad för rad.
    klipp_y (absolut) = sudda inget nedanför den raden (skräprader vid formens kant)."""
    y0, y1, x0, x1 = form["y0"], form["y1"], form["x0"], form["x1"]
    box = im[y0:y1, x0:x1]
    t = form["text"].copy()
    if klipp_y is not None:
        t[max(0, klipp_y - y0):] = False
    # utvidga 3 px så kantskuggan och JPEG-ringningen runt bokstäverna följer med
    # (2 px lämnade en svag spökrad på Batmotor_TR_1_1, 2026-09-03)
    for _ in range(3):
        t2 = t.copy()
        t2[1:] |= t[:-1]; t2[:-1] |= t[1:]; t2[:, 1:] |= t[:, :-1]; t2[:, :-1] |= t[:, 1:]
        t = t2
    fyll(box, t, np.array(form["farg"]))
    im[y0:y1, x0:x1] = box


def storlek_ur_se(ri, se_text, fet, rita):
    """Fontstorleken som SE-raden sattes i. Två oberoende mått ur den svenska texten:
    bredden (linjär i storleken) och bläckhöjden (getbbox tar hänsyn till å/g/versaler).
    Stämmer de inom 10 % används breddmåttet (finast); annars höjdmåttet — radens
    bbox kan ha smält ihop med något i kanten på bredden (Batmotor_PD_5_1: x=15..781
    för 'Kåpa till rigg.'). Utan SE-text: gamla skattningen 1,08 × radhöjd."""
    gissning = max(16, int(round(ri["hojd"] * 1.08)))
    if not se_text or "x0" not in ri:
        return gissning
    f100 = _font(fet, 100)
    b100 = rita.textlength(se_text, font=f100)
    bb = f100.getbbox(se_text)
    h100 = bb[3] - bb[1]
    if b100 <= 0 or h100 <= 0:
        return gissning
    s_b = (ri["x1"] - ri["x0"]) * 100 / b100
    s_h = ri["hojd"] * 100 / h100
    if abs(s_b - s_h) <= 0.10 * s_h:
        s = s_b
    else:
        s = s_h
    s = int(round(s))
    return s if 14 <= s <= 160 else gissning


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


def rita_rad(bild, form, ri, text, stryk=False, vanster=None, se_text=None):
    """En textrad i sin egen ruta: samma storlek (mätt ur SE-raden), fet/normal, färg
    och justering som SE-raden. Krymper tills den får plats på EN rad. stryk=True
    drar ett streck genom texten (överstruket jämförpris)."""
    rita = ImageDraw.Draw(bild)
    x0, x1 = form["x0"], form["x1"]
    w = x1 - x0
    marg = max(24, int(w * 0.05))
    maxbredd = w - 2 * marg
    storlek = storlek_ur_se(ri, se_text, ri["fet"], rita)
    font = _font(ri["fet"], storlek)
    while storlek > 16 and rita.textlength(text, font=font) > maxbredd:
        storlek -= 2
        font = _font(ri["fet"], storlek)
    asc, desc = font.getmetrics()
    # SE-radens mitt (pixelmått) ↔ nya radens visuella mitt (versalhöjd ≈ 0,72·asc)
    mitt = (ri["y0"] + ri["y1"]) / 2
    y = int(mitt - asc * 0.72 / 2)
    farg = tuple(ri["textfarg"])
    bredd = rita.textlength(text, font=font)
    centrerad = ri["centrerad"] if vanster is None else (not vanster)
    if centrerad:
        xs = (x0 + x1) / 2 - bredd / 2
        rita.text(((x0 + x1) / 2, y), text, font=font, fill=farg, anchor="ma")
    else:
        xs = ri["x0"]
        rita.text((ri["x0"], y), text, font=font, fill=farg, anchor="la")
    if stryk:
        # stryk=True: hela raden. stryk="1 169 kr": bara den delsträngen (första träffen).
        ym = y + asc * 0.72 / 2
        sx0, sx1 = xs, xs + bredd
        if isinstance(stryk, str) and stryk in text:
            i = text.index(stryk)
            sx0 = xs + rita.textlength(text[:i], font=font)
            sx1 = sx0 + rita.textlength(stryk, font=font)
        rita.line([(sx0 - 4, ym), (sx1 + 4, ym)], fill=farg, width=max(2, storlek // 14))


def rita_block(bild, form, radinfo, text, vanster=None, se_rader=None, stryk=False):
    """Flera SE-rader som EN text (en rubrik som radbrutits): radbryts om inom
    samma vertikala spann, med första radens stil. Får bli lika många rader som
    SE, eller en färre; krymper tills det får plats. stryk="586 kr" stryker den
    delsträngen på den rad där den hamnar (jämförpris i en radbruten rubrik,
    IBC_CS_3_1 2026-09-05)."""
    rita = ImageDraw.Draw(bild)
    x0, x1 = form["x0"], form["x1"]
    w = x1 - x0
    marg = max(24, int(w * 0.05))
    maxbredd = w - 2 * marg
    forsta = radinfo[0]
    storlek = max(16, int(round(forsta["hojd"] * 1.08)))
    if se_rader and len(se_rader) == len(radinfo):
        bredast = max(range(len(radinfo)), key=lambda i: radinfo[i]["x1"] - radinfo[i]["x0"])
        storlek = storlek_ur_se(radinfo[bredast], se_rader[bredast], forsta["fet"], rita)
    maxrader = len(radinfo)
    font, rader = _passa(text, forsta["fet"], storlek, maxbredd, maxrader, rita)
    asc, desc = font.getmetrics()
    # radavstånd = SE-radernas avstånd om flera, annars 1,25 × höjd
    if len(radinfo) > 1:
        lh = int((radinfo[-1]["y0"] - radinfo[0]["y0"]) / (len(radinfo) - 1))
    else:
        lh = int((asc + desc) * 1.15)
    ytop_se = radinfo[0]["y0"]
    ybot_se = radinfo[-1]["y1"]
    mitt = (ytop_se + ybot_se) / 2
    blockh = lh * (len(rader) - 1) + asc * 0.72
    ytop = int(mitt - blockh / 2)
    farg = tuple(forsta["textfarg"])
    centrerad = forsta["centrerad"] if vanster is None else (not vanster)
    xv = min(r["x0"] for r in radinfo)
    for i, rad in enumerate(rader):
        y = ytop + i * lh
        if centrerad:
            rita.text(((x0 + x1) / 2, y), rad, font=font, fill=farg, anchor="ma")
            xs = (x0 + x1) / 2 - rita.textlength(rad, font=font) / 2
        else:
            rita.text((xv, y), rad, font=font, fill=farg, anchor="la")
            xs = xv
        if stryk and isinstance(stryk, str) and stryk in rad:
            i0 = rad.index(stryk)
            sx0 = xs + rita.textlength(rad[:i0], font=font)
            sx1 = sx0 + rita.textlength(stryk, font=font)
            ym = y + asc * 0.72 / 2
            rita.line([(sx0 - 4, ym), (sx1 + 4, ym)], fill=farg, width=max(2, storlek // 14))


def rita_box(bild, im, b):
    """Manuell ruta för det detektorn inte hittar (badge med text direkt på fotot,
    en platta som smälter ihop med bakgrunden). b = {"box": [x0,y0,x1,y1],
    "text": ..., "fet": bool, "farg": [r,g,b], "fyll": "ljus"|"mork"|null,
    "outline": [r,g,b]|null, "radie": px, "storlek": px}. fyll=ljus lägger en
    nästan vit platta (som text.py:s platta) över rutan, mork en mörk."""
    x0, y0, x1, y1 = [int(v) for v in b["box"]]
    # Sudda befintlig text i rutan först: pixlar som avviker mörkt (ljus platta)
    # eller ljust (mörk platta) från radens median fylls med radens median.
    # Badge med "outline": SE-ramen behålls (den ritas aldrig om exakt på samma
    # pixlar — dubbel ram på Kranskydd_SP_3_1, 2026-09-03); bara insidan suddas.
    arr = np.asarray(bild).astype(np.int32).copy()
    inset = int(b.get("kant", 3)) + 6 if b.get("outline") else 0
    box = arr[y0 + inset:y1 - inset, x0 + inset:x1 - inset]
    if box.size:
        med = np.median(box.reshape(-1, 3), axis=0)
        # "textljus": true = vit text direkt på ett mellangrått foto (fraktraden under
        # produkten i BOF-mallen, median ~150, mätt 2026-09-05): då ska de LJUSA
        # pixlarna suddas fast bakgrunden räknas som ljus platta.
        ljus_platta = (not b["textljus"]) if "textljus" in b else med.mean() > 128
        # Textmask i 2D: pixlar som avviker ≥ 90 (RGB-summa) från radens plattfärg,
        # utvidgade 2 px åt alla håll — annars blir de antialiasade topp-/bottenkanterna
        # kvar som streckade spöklinjer (Batmotor_BF_3_1, mätt 2026-09-03).
        # Plattfärgen per rad = 80:e percentilen (ljus platta) / 20:e (mörk): på
        # E/F/T:s tvärstreck täcker texten över halva rutan och medianen blev text
        # (Kranskydd_PD_3_1 "EFTER"). Bara textljusa pixlar räknas: vitt på mörk
        # platta, mörkt på ljus — så det grå bandet i knappens rundade hörn inte
        # fylls med knappblått (Kranskydd_PD_4_1).
        rm = np.percentile(box, 80 if ljus_platta else 20, axis=1)   # (h, 3)
        summa = box.sum(axis=2)
        diff = summa - rm.sum(axis=1)[:, None]
        t = ((diff < -60) & (summa < 500)) if ljus_platta else ((diff > 60) & (summa > 450))
        for _ in range(3):
            t2 = t.copy()
            t2[1:] |= t[:-1]; t2[:-1] |= t[1:]; t2[:, 1:] |= t[:, :-1]; t2[:, :-1] |= t[:, 1:]
            t = t2
        fyll(box, t, np.median(box.reshape(-1, 3), axis=0))
        arr[y0 + inset:y1 - inset, x0 + inset:x1 - inset] = box
    bild = Image.fromarray(arr.astype(np.uint8))
    lager = bild.convert("RGBA")
    if b.get("fyll"):
        platta = Image.new("RGBA", (x1 - x0, y1 - y0),
                           (248, 248, 248, 225) if b["fyll"] == "ljus" else (10, 14, 18, 200))
        mask = Image.new("L", platta.size, 0)
        ImageDraw.Draw(mask).rounded_rectangle([0, 0, platta.width - 1, platta.height - 1],
                                               radius=int(b.get("radie", 24)), fill=255)
        platta.putalpha(Image.fromarray((np.asarray(mask) * (225 if b["fyll"] == "ljus" else 200) // 255).astype(np.uint8)))
        lager.alpha_composite(platta, (x0, y0))
    rita = ImageDraw.Draw(lager)
    if b.get("outline") and b.get("rita_ram"):
        rita.rounded_rectangle([x0, y0, x1, y1], radius=int(b.get("radie", 24)),
                               outline=tuple(b["outline"]), width=int(b.get("kant", 3)))
    text = b.get("text", "").strip()
    if text:
        storlek = int(b.get("storlek", 32))
        maxrader = int(b.get("rader", 1))
        maxbredd = (x1 - x0) - 2 * max(16, int((x1 - x0) * 0.06))
        font, rader = _passa(text, bool(b.get("fet")), storlek, maxbredd, maxrader, rita, minsta=14)
        asc, desc = font.getmetrics()
        lh = int(font.size * float(b.get("radavstand", 1.35)))
        blockh = lh * (len(rader) - 1) + asc * 0.72
        ytop = (y0 + y1) / 2 - blockh / 2
        farg = tuple(b.get("farg", [20, 48, 74]))
        xv = int(b.get("vanster_x", x0 + max(16, int((x1 - x0) * 0.06))))
        for i, rad in enumerate(rader):
            y = ytop + i * lh
            if b.get("vanster") or b.get("vanster_x"):
                rita.text((xv, y), rad, font=font, fill=farg, anchor="la")
                xs = xv
            else:
                rita.text(((x0 + x1) / 2, y), rad, font=font, fill=farg, anchor="ma")
                xs = (x0 + x1) / 2 - rita.textlength(rad, font=font) / 2
            if b.get("bock"):
                # grön bock (två linjer) 44 px till vänster om texten, som text.py/compose-no
                cy = y + asc * 0.72 / 2
                bx = xs - 44
                rita.line([(bx, cy), (bx + 10, cy + 10), (bx + 28, cy - 12)], fill=(34, 160, 107), width=5, joint="curve")
            if b.get("stryk"):
                st = b["stryk"] if isinstance(b["stryk"], str) and b["stryk"] in rad else rad
                i0 = rad.index(st)
                sx0 = xs + rita.textlength(rad[:i0], font=font)
                sx1 = sx0 + rita.textlength(st, font=font)
                ym = y + asc * 0.72 / 2
                rita.line([(sx0 - 4, ym), (sx1 + 4, ym)], fill=farg, width=max(2, font.size // 14))
    return lager.convert("RGB")


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
            def _ren(o):
                if isinstance(o, (np.bool_,)):
                    return bool(o)
                if isinstance(o, (np.integer,)):
                    return int(o)
                if isinstance(o, (np.floating,)):
                    return float(o)
                raise TypeError(str(type(o)))
            print(json.dumps([{k: v for k, v in x.items() if not k.startswith("_")} for x in analys] +
                             [{"kant_utanfor": kant_andel}], ensure_ascii=False, default=_ren))
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
    # Tre lägen per post:
    #   {"form": i, "rad": k, "text": ...}        raden i sin egen ruta
    #   {"form": i, "rader": [k0, k1], "text": ...}  flera SE-rader som ETT block (radbruten rubrik)
    #   {"form": i, "text": ...}                  hela formen som ett block
    # "se" (rad) / "se_rader" (block) = den svenska texten på raden — ger exakt fontstorlek.
    per_form = {}
    per_rad = {}
    per_block = {}
    klipp = {}
    boxar = [t for t in texter if t.get("box")]
    for t in texter:
        if t.get("box"):
            continue
        fi = int(t["form"])
        if "klipp_efter_rad" in t:
            klipp[fi] = int(t["klipp_efter_rad"])
        if t.get("rader"):
            per_block.setdefault(fi, []).append((sorted(int(k) for k in t["rader"]), t.get("text", ""), t.get("vanster"), t.get("se_rader"), t.get("stryk") or False))
        elif "rad" in t and t["rad"] is not None:
            per_rad.setdefault(fi, {})[int(t["rad"])] = (t.get("text", ""), t.get("stryk") or False, t.get("vanster"), t.get("se"))
        else:
            per_form[fi] = t.get("text", "")
    berorda = set(per_form) | set(per_rad) | set(per_block)

    ny = im.copy()
    for x in analys:
        if x["form"] in berorda:
            ky = None
            if x["form"] in klipp and klipp[x["form"]] < len(x["radinfo"]) - 1:
                ky = x["radinfo"][klipp[x["form"]]]["y1"] + 6
            sudda(ny, x["_form"], klipp_y=ky)
    ut_bild = Image.fromarray(ny.astype(np.uint8))
    for x in analys:
        if x["form"] in per_rad or x["form"] in per_block:
            for k, (text, stryk, vanster, se_text) in per_rad.get(x["form"], {}).items():
                if k >= len(x["radinfo"]):
                    sys.exit(f"form {x['form']} har bara {len(x['radinfo'])} rader, rad {k} finns inte")
                if text.strip():
                    rita_rad(ut_bild, x["_form"], x["radinfo"][k], text.strip(), stryk=stryk, vanster=vanster, se_text=se_text)
            for ks, text, vanster, se_rader, stryk in per_block.get(x["form"], []):
                if ks[-1] >= len(x["radinfo"]):
                    sys.exit(f"form {x['form']} har bara {len(x['radinfo'])} rader, rad {ks[-1]} finns inte")
                if text.strip():
                    rita_block(ut_bild, x["_form"], [x["radinfo"][k] for k in ks], text.strip(), vanster=vanster, se_rader=se_rader, stryk=stryk)
        elif x["form"] in per_form:
            text = per_form[x["form"]].strip()
            if text:
                rita_text(ut_bild, x["_form"], x, text)
    for b in boxar:
        ut_bild = rita_box(ut_bild, im, b)
    per_form = {**per_form, **{k: '' for k in per_rad}, **{k: '' for k in per_block}}

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
