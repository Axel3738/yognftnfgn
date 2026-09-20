#!/usr/bin/env python3
"""bildmarknad-mat.py — MÄTER källans inbrända text i en BILDANNONS. Dömer inget.

Steg 1 av tre i `factory/bildmarknad.mjs` (samma arbetsdelning som
`pipeline/omdubb/inbrand.mjs`: mäta → döma → rita). Här mäts bara, och varje
tal som skrivs ut går att räkna efter i bilden.

    python3 factory/bildmarknad-mat.py <bild.jpg> [--konf=0.45] [--pad=6]
    python3 factory/bildmarknad-mat.py --belopp 250 --valuta DKK   # ett tal, formaterat

Skriver JSON på stdout: {W, H, rader:[…]}. Per rad mäts

  box/ruta      OCR-radens axelriktade ruta, och den vadderade ruta som suddas
  bakgrund      klass + färg + fyllfel — se `klassa_bakgrund` nedan
  stil          textfärg, ink-mått, strecktjocklek, vikt (fet/normal), storlek,
                centrering och överstrykning

⚠️ VARFÖR INTE `pipeline/oversatt-bild.py`: den letar text på ENFÄRGADE FORMER
(plattor, knappar). Mätt 2026-09-20 på CaraShellRoof_BOF_101_1.jpg hittade den
fem "former" som inte motsvarar den synliga texten — i den bilden ligger tre av
fyra rader DIREKT på en gradientbakgrund, och bara knappen är en form. Därför
mäter det här skriptet bakgrunden lokalt runt varje rad i stället.

Beroenden: Pillow + numpy + rapidocr-onnxruntime (samma OCR som
factory/brand-text.py). cv2 används BARA för fotobakgrunder och är valfritt —
saknas den rapporteras fyllnaden som HOPPAD, aldrig som gjord.
"""
import argparse
import json
import os
import sys

try:
    import numpy as np
    from PIL import Image, ImageDraw, ImageFont
except ImportError:  # pragma: no cover
    sys.exit("BEROENDE_SAKNAS: Pillow och numpy krävs (pip3 install pillow numpy).")

FET = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
NORMAL = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
RESERV_FET = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
RESERV_NORMAL = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

# --------------------------------------------------------------------------
# Trösklar — alla avlästa 2026-09-20 på CaraShells 44 svenska bildannonser i
# /tmp/dk-bild/kalla (1080×1350, 896×1152 och 1024×1024). Siffrorna som ledde
# fram till dem står i kommentaren vid varje konstant. Det här är en mätning på
# EN produkts annonser, inte en evig lag: en ny bildstil kan kräva nya tal, och
# då ska de mätas om på samma sätt.
# --------------------------------------------------------------------------

# Ringen strax utanför raden. 5 px valdes för att den ligger NÄRA texten: med
# 16 px drog ringen in plattkanter och grannrader och gjorde enfärgade plattor
# till "foto" (mätt: "MED – 6,5 × 3 m svart väv" fick std 1,68 vid r=5 men
# 28,46 vid r=16 — den senare mäter plattans kant, inte bakgrunden bakom texten).
RING_PX = 5

# std under detta = enfärgad platta. Avläst: mörka band 0,02–0,12, blå knapp
# 0,00, vitt priskort 4,68, turkos badge 2,47 — mot gradient 9,88 och foto
# 35,7–44,8. Gränsen 6 ligger i glappet mellan 4,94 och 9,88.
ENFARGAD_STD = 6.0

# Gradientmodellens leave-one-out-fel (RMS per kanal). Avläst: ren gradient
# 2,45 och platt vit 0,27–0,36, mot foto 59,9–78,0. Gränsen 8 ligger i glappet.
GRADIENT_FEL = 8.0

# De fyra sidornas ringmedelvärden får skilja så här mycket och ändå räknas som
# EN platta. Utan kravet blev en lokalt jämn fotoyta (träbordet i
# CaraShellRoof_GT_2_1.jpg, std 2,27) klassad som platta och fylldes platt.
SIDOSKILLNAD_MAX = 10.0

# Ink = pixel vars avstånd från bakgrundsfärgen är över denna andel av radens
# största avstånd. 0,45 skiljer glyfen från kantutjämningen (mätt: vid 0,25 kom
# halva gradientbakgrunden med i "210D-väv"-raden).
INK_ANDEL = 0.45

# En rad räknas som ÖVERSTRUKEN när någon bildrad i inkmasken är ifylld över
# denna andel av radens bredd. Avläst 2026-09-20 på CaraShellRoof_CS_4_1.jpg:
# jämförpriset "1 469 kr" har ett streck som fyller 0,93 av bredden, medan
# tätaste raden i icke-överstrukna "1 129 kr" når 0,42.
STRYK_ANDEL = 0.70


def _font(fet, storlek):
    for s in ([FET, RESERV_FET] if fet else [NORMAL, RESERV_NORMAL]):
        if os.path.exists(s):
            return ImageFont.truetype(s, max(6, int(round(storlek))))
    raise SystemExit("TYPSNITT_SAKNAS: varken Liberation Sans eller DejaVu Sans finns.")


def las_ocr(fil, konf):
    try:
        from rapidocr_onnxruntime import RapidOCR
    except ImportError:  # pragma: no cover
        sys.exit("2:rapidocr-onnxruntime saknas (pip install rapidocr-onnxruntime). "
                 "Utan OCR går inbränd text inte att mäta — den blir 'okänd', aldrig 'ren'.")
    resultat, _ = RapidOCR()(str(fil))
    rader = []
    for post in resultat or []:
        b = np.array(post[0], dtype=float)
        text = str(post[1]).strip()
        k = float(post[2])
        if not text or k < konf:
            continue
        rader.append({
            "text": text, "konfidens": round(k, 3),
            "box": [int(b[:, 0].min()), int(b[:, 1].min()), int(b[:, 0].max()), int(b[:, 1].max())],
        })
    rader.sort(key=lambda r: (r["box"][1], r["box"][0]))
    return rader


def _ringpixlar(a, fri, ruta, mr):
    """Pixlarna i en ring runt rutan, med ALLA textrutor bortmaskade.

    Maskningen är inte kosmetisk: utan den läste ringen grannraden och gjorde
    rubrikens std 29,96 i stället för 0,02 (mätt 2026-09-20 på
    CaraShellRoof_CS_4_1.jpg, raderna "Taköverdrag husvagn &" / "husbil · 6,5 × 3 m")."""
    H, W = a.shape[:2]
    x0, y0, x1, y1 = ruta
    ry0, ry1 = max(0, y0 - mr), min(H, y1 + 1 + mr)
    rx0, rx1 = max(0, x0 - mr), min(W, x1 + 1 + mr)
    omr = a[ry0:ry1, rx0:rx1]
    mask = fri[ry0:ry1, rx0:rx1]
    sidor = {
        "topp": (slice(0, max(0, y0 - ry0)), slice(None)),
        "botten": (slice(max(0, y1 + 1 - ry0), None), slice(None)),
        "vanster": (slice(max(0, y0 - ry0), max(0, y1 + 1 - ry0)), slice(0, max(0, x0 - rx0))),
        "hoger": (slice(max(0, y0 - ry0), max(0, y1 + 1 - ry0)), slice(max(0, x1 + 1 - rx0), None)),
    }
    alla, per_sida = [], {}
    for namn, sn in sidor.items():
        bit, bm = omr[sn], mask[sn]
        if bit.size == 0:
            continue
        sel = bit.reshape(-1, 3)[bm.reshape(-1)]
        if len(sel) >= 10:
            per_sida[namn] = sel.mean(axis=0)
            alla.append(sel)
    if not alla:
        return None, {}
    return np.concatenate(alla, 0), per_sida


def _gradientmodell(a, fri, ruta, m):
    """Per-kolumn linjär interpolation mellan bandet ovanför och under rutan.

    Bakgrunden i de här annonserna är en LODRÄT gradient, så en kolumn som
    interpoleras mellan sin egen pixel ovanför och sin egen pixel under
    återskapar den exakt. En oskarp fyllning (blur) hade synts direkt på en ren
    gradient — det är hela skälet att modellen ser ut så här."""
    H = a.shape[0]
    x0, y0, x1, y1 = ruta
    ta, tb = max(0, y0 - m), y0
    ba, bb = y1 + 1, min(H, y1 + 1 + m)
    if tb - ta < 2 or bb - ba < 2:
        return None
    mt = fri[ta:tb, x0:x1 + 1]
    mb = fri[ba:bb, x0:x1 + 1]
    if mt.mean() < 0.5 or mb.mean() < 0.5:
        return None
    topp = np.where(mt[..., None], a[ta:tb, x0:x1 + 1], np.nan)
    bot = np.where(mb[..., None], a[ba:bb, x0:x1 + 1], np.nan)
    with np.errstate(invalid="ignore"):
        topp = np.nanmean(topp, axis=0)
        bot = np.nanmean(bot, axis=0)
    if np.isnan(topp).any() or np.isnan(bot).any():
        return None
    n = y1 - y0 + 1
    w = np.linspace(0, 1, n + 2)[1:-1][:, None, None]
    return topp[None] * (1 - w) + bot[None] * w


def _loo_fel(a, fri, ruta, m):
    """Leave-one-out: förutsäg de KÄNDA banden närmast rutan med de yttre banden.

    Felet mäts alltså på pixlar vi faktiskt kan facit-jämföra, och säger hur
    nära gradientmodellen kommer PRECIS där fyllnaden ska ligga."""
    H = a.shape[0]
    x0, y0, x1, y1 = ruta
    yttre = (x0, y0 - m, x1, y1 + m)
    if yttre[1] - m < 0 or yttre[3] + 1 + m > H:
        return None
    pred = _gradientmodell(a, fri, yttre, m)
    if pred is None:
        return None
    oy0 = yttre[1]
    kA, pA = a[oy0:y0, x0:x1 + 1], pred[:y0 - oy0]
    kB, pB = a[y1 + 1:yttre[3] + 1, x0:x1 + 1], pred[(y1 + 1 - oy0):]
    n = min(len(kB), len(pB))
    bitar = [(kA - pA).reshape(-1, 3)]
    if n:
        bitar.append((kB[:n] - pB[:n]).reshape(-1, 3))
    e = np.concatenate(bitar)
    return float(np.sqrt((e ** 2).mean()))


def klassa_bakgrund(a, fri, ruta):
    """enfargad | gradient | foto — med regeln som ledde dit, i klartext.

    Ordningen är mätt, inte vald: plattan testas FÖRST, eftersom ringen strax
    utanför en knapp är knappens egen färg medan gradientmodellens band skär
    genom knappkanten (den blå knappen i BOF_101 fick loo-fel 22,15 men
    ringstd 0,00)."""
    ring, sidor = _ringpixlar(a, fri, ruta, RING_PX)
    if ring is None:
        return {"klass": "foto", "farg": None, "fyllfel": None,
                "regel": "ingen ren bakgrundspixel runt raden — rutan rör bildkanten eller grannrader"}
    std = float(ring.std(axis=0).mean())
    farg = ring.mean(axis=0)
    spridning = 0.0
    if len(sidor) >= 2:
        sv = np.stack(list(sidor.values()))
        spridning = float(np.abs(sv - sv.mean(axis=0)).max())
    if std < ENFARGAD_STD and spridning < SIDOSKILLNAD_MAX:
        return {"klass": "enfargad", "farg": [round(float(c), 1) for c in farg], "fyllfel": round(std, 2),
                "regel": f"ringens std {std:.2f} < {ENFARGAD_STD} och sidorna skiljer {spridning:.1f} < {SIDOSKILLNAD_MAX}"}
    m = max(6, (ruta[3] - ruta[1]) // 3)
    fel = _loo_fel(a, fri, ruta, m)
    if fel is not None and fel < GRADIENT_FEL:
        return {"klass": "gradient", "farg": [round(float(c), 1) for c in farg], "fyllfel": round(fel, 2),
                "regel": f"gradientmodellens leave-one-out-fel {fel:.2f} < {GRADIENT_FEL} (ringstd {std:.2f})"}
    return {"klass": "foto", "farg": [round(float(c), 1) for c in farg],
            "fyllfel": None if fel is None else round(fel, 2),
            "regel": (f"ringstd {std:.2f} ≥ {ENFARGAD_STD} eller sidorna skiljer {spridning:.1f}, "
                      f"och gradientfelet {'kunde inte mätas' if fel is None else f'{fel:.2f} ≥ {GRADIENT_FEL}'}")}


def plattans_utbredning(a, fri, ruta, farg, tolerans):
    """Hur långt åt varje håll plattan (bandet, knappen, priskortet) sträcker sig.

    Behövs för att veta hur BRED den nya raden får bli. Utan måttet blev
    maxbredden källradens egen ruta, och en dansk rad som är längre än den
    svenska krymptes i onödan fast det fanns gott om tom platta kvar (mätt
    2026-09-20: "210D-väv …" → "210D-væv – tåler en hel vintersæson udendørs"
    krympte 32,5 → 25,5 px trots 250 px ledigt åt vardera hållet).

    Går utåt en linje i taget och stannar när linjens medelfärg lämnar plattans.
    Andra textrutor hoppas över — de är text på plattan, inte plattans kant."""
    H, W = a.shape[:2]
    x0, y0, x1, y1 = ruta
    mal = np.array(farg, dtype=np.float32)

    def linje_ok(bit, mask):
        sel = bit.reshape(-1, 3)[mask.reshape(-1)]
        if len(sel) < 3:
            return True  # bara text på raden — säger inget om plattans kant
        return float(np.abs(sel.mean(axis=0) - mal).max()) <= tolerans

    vx0 = x0
    while vx0 - 1 >= 0 and linje_ok(a[y0:y1 + 1, vx0 - 1:vx0], fri[y0:y1 + 1, vx0 - 1:vx0]):
        vx0 -= 1
    vx1 = x1
    while vx1 + 1 < W and linje_ok(a[y0:y1 + 1, vx1 + 1:vx1 + 2], fri[y0:y1 + 1, vx1 + 1:vx1 + 2]):
        vx1 += 1
    vy0 = y0
    while vy0 - 1 >= 0 and linje_ok(a[vy0 - 1:vy0, x0:x1 + 1], fri[vy0 - 1:vy0, x0:x1 + 1]):
        vy0 -= 1
    vy1 = y1
    while vy1 + 1 < H and linje_ok(a[vy1 + 1:vy1 + 2, x0:x1 + 1], fri[vy1 + 1:vy1 + 2, x0:x1 + 1]):
        vy1 += 1
    return [int(vx0), int(vy0), int(vx1), int(vy1)]


def _inkmask(sub, bakgrund):
    d = np.sqrt(((sub - bakgrund) ** 2).sum(axis=2))
    topp = float(d.max())
    if topp <= 1e-6:
        return None, d
    return d > topp * INK_ANDEL, d


def _strecktjocklek(ink):
    """Median vågrät sammanhängande inklängd — måttet på hur tjock pennan var."""
    runs = []
    for rad in ink:
        d = np.diff(np.concatenate(([0], rad.view(np.int8), [0])))
        start = np.where(d == 1)[0]
        slut = np.where(d == -1)[0]
        runs.extend((slut - start).tolist())
    return float(np.median(runs)) if runs else 0.0


def _rendera_prov(text, fet, storlek):
    """Ritar texten på svart botten och mäter den som bilden mäts — samma mått,
    samma kod, så jämförelsen källa/prov är äpplen mot äpplen."""
    f = _font(fet, storlek)
    bb = f.getbbox(text)
    W = max(4, int(bb[2] - bb[0]) + 20)
    H = max(4, int(bb[3] - bb[1]) + 20)
    im = Image.new("L", (W, H), 0)
    ImageDraw.Draw(im).text((10 - bb[0], 10 - bb[1]), text, font=f, fill=255)
    a = np.asarray(im)
    # 115 av 255 ≈ samma andel av full styrka som INK_ANDEL använder i bilden,
    # så kantutjämningen räknas bort på samma sätt i prov och källa.
    ink = a > 115
    if not ink.any():
        return None
    ys, xs = np.where(ink)
    kropp = ink[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    return {
        "h": int(ys.max() - ys.min() + 1),
        "w": int(xs.max() - xs.min() + 1),
        "stroke": _strecktjocklek(kropp),
        "tathet": float(kropp.mean()),
    }


def _passa_storlek(text, fet, ink_h):
    """Minsta stilstorlek vars renderade ink-höjd når källans ink-höjd."""
    lo, hi = 6.0, max(20.0, ink_h * 3.0)
    for _ in range(26):
        mitt = (lo + hi) / 2
        p = _rendera_prov(text, fet, mitt)
        if p is None or p["h"] < ink_h:
            lo = mitt
        else:
            hi = mitt
    return (lo + hi) / 2


def passa_stil(text, ink_h, stroke, tathet):
    """Vilken VIKT och STORLEK återskapar källans rad?

    I stället för att gissa en tröskel för "fet" ritas BÅDA vikterna och den som
    liknar källan mest vinner. Storleken passas efter ink-HÖJDEN, och vikten
    döms sedan på STRECKTJOCKLEKEN vid den storleken.

    ⚠️ Varför just den ordningen, mätt 2026-09-20 på BOF_101 + CS_4 (10 rader
    med facit avläst för hand i bilderna): att passa storleken efter strecket
    och döma vikten på höjd+bredd gav 6 av 8 rätt, täthet gav 8 av 10, och den
    här ordningen 9 av 10. Skillnaden är att OCR:en tappar mellanslag
    ("husbil· 6,5x3m", "-23%"), vilket ändrar BREDD och TÄTHET men varken
    höjd eller strecktjocklek.

    Tätheten är kvar som skiljedomare när strecket är lika nära båda vikterna
    (inom 0,5 px) — det fallet är den tionde raden, "210D-väv …", där källans
    streck 4,0 låg mitt emellan normal 3,0 och fet 5,0.
    """
    kandidater = []
    for fet in (False, True):
        storlek = _passa_storlek(text, fet, ink_h)
        p = _rendera_prov(text, fet, storlek)
        if p is None:
            continue
        kandidater.append({"fet": fet, "storlek": round(storlek, 1),
                           "prov_h": p["h"], "prov_bredd": p["w"],
                           "prov_stroke": round(p["stroke"], 1), "prov_tathet": round(p["tathet"], 3),
                           "streckfel": abs(p["stroke"] - stroke),
                           "tathetsfel": abs(p["tathet"] - tathet)})
    if not kandidater:
        return None
    bast = min(kandidater, key=lambda k: k["streckfel"])
    nara = [k for k in kandidater if abs(k["streckfel"] - bast["streckfel"]) <= 0.5]
    regel = f"strecket {stroke:.1f} px närmast {'fet' if bast['fet'] else 'normal'} ({bast['prov_stroke']:.1f})"
    if len(nara) > 1:
        bast = min(nara, key=lambda k: k["tathetsfel"])
        regel = (f"strecket {stroke:.1f} px lika nära båda vikterna — tätheten {tathet:.3f} "
                 f"avgjorde till {'fet' if bast['fet'] else 'normal'} ({bast['prov_tathet']:.3f})")
    # Marginalen: hur mycket bättre vinnaren passade än förloraren, i px streck.
    # 0 betyder "kunde lika gärna varit den andra vikten" — läs den siffran
    # innan du litar på fet/normal på en liten rad.
    forlorare = [k for k in kandidater if k is not bast]
    marginal = round(min(k["streckfel"] for k in forlorare) - bast["streckfel"], 2) if forlorare else None
    return {**bast, "regel": regel, "marginal_px": marginal}


def mat_rad(a, fri, rad, W, H, pad):
    x0, y0, x1, y1 = rad["box"]
    ruta = [max(0, x0 - pad), max(0, y0 - pad), min(W - 1, x1 + pad), min(H - 1, y1 + pad)]
    rad["ruta"] = ruta
    bak = klassa_bakgrund(a, fri, ruta)
    # Plattans mått bara när det FINNS en platta. På gradient och foto finns
    # ingen kant att mäta, och då bestämmer bilden gränsen i stället.
    if bak["klass"] == "enfargad" and bak["farg"]:
        bak["platta"] = plattans_utbredning(a, fri, ruta, bak["farg"],
                                            max(8.0, 3.0 * (bak["fyllfel"] or 0.0)))
    else:
        bak["platta"] = None
    rad["bakgrund"] = bak
    sub = a[ruta[1]:ruta[3] + 1, ruta[0]:ruta[2] + 1]
    bakfarg = np.array(bak["farg"], dtype=np.float32) if bak["farg"] else sub.reshape(-1, 3).mean(axis=0)
    ink, d = _inkmask(sub, bakfarg)
    if ink is None or ink.sum() < 8:
        rad["stil"] = None
        rad["varning"] = "ingen text kunde skiljas från bakgrunden — raden mäts inte"
        return rad
    ys, xs = np.where(ink)
    ink_h = int(ys.max() - ys.min() + 1)
    ink_b = int(xs.max() - xs.min() + 1)
    # Textfärgen tas ur de STARKASTE inkpixlarna, inte ur hela masken:
    # kantutjämningen blandar glyf och bakgrund och skulle dra färgen grå.
    grans = float(np.quantile(d[ink], 0.7))
    stark = d >= grans
    farg = sub[stark].mean(axis=0) if stark.sum() else sub[ink].mean(axis=0)
    kropp = ink[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    stroke = _strecktjocklek(kropp)
    tathet = float(kropp.mean())
    # Överstrykning: en bildrad som är nästan helt ifylld är ett streck, inte text.
    stryk_andel = float(kropp.sum(axis=1).max()) / max(1, ink_b)
    stil = passa_stil(rad["text"], ink_h, stroke, tathet) if stroke > 0 else None
    cx = (ruta[0] + ruta[2]) / 2
    rad["stil"] = {
        "textfarg": [int(round(float(c))) for c in farg],
        "bakfarg": [int(round(float(c))) for c in bakfarg],
        "ink_box": [int(ruta[0] + xs.min()), int(ruta[1] + ys.min()),
                    int(ruta[0] + xs.max()), int(ruta[1] + ys.max())],
        "ink_hojd": ink_h, "ink_bredd": ink_b,
        "strecktjocklek": round(stroke, 1), "tathet": round(tathet, 3),
        "stryk": stryk_andel >= STRYK_ANDEL,
        "stryk_andel": round(stryk_andel, 2),
        "cx": round(cx, 1),
        "centrerad_i_bild": abs(cx - W / 2) <= max(6, W * 0.02),
        "fet": None if stil is None else stil["fet"],
        "storlek": None if stil is None else stil["storlek"],
        "passform": stil,
    }
    return rad


# Två rader räknas som satta i samma kant när kanterna ligger inom så här många
# px. Avläst 2026-09-20 på CaraShellRoof_CS_4_1.jpg: rubrikens två rader börjar
# på x 42 och 45 (3 px isär, vänsterställda), och priskortets "1 129 kr" / "1 469 kr"
# på x 522 och 517 (5 px). Mitterna i samma par ligger 105 resp. 82 px isär.
JUSTERING_PX = 8


def bedom_justering(rader, W):
    """vanster | center — mätt på hur raderna ligger mot VARANDRA.

    ⚠️ Att alltid centrera vore fel: CS_4:s rubrik och priskort är
    vänsterställda, och en centrerad dansk rad hade hoppat i sidled när texten
    bytte längd. Att alltid vänsterställa vore lika fel för BOF_101, där varje
    rad är centrerad i bilden. Därför avgör mätningen, inte en tumregel."""
    for r in rader:
        s = r.get("stil")
        if not s:
            continue
        ib = s["ink_box"]
        vanster, mitt = ib[0], (ib[0] + ib[2]) / 2
        grannar = [o for o in rader if o is not r and o.get("stil")]
        delar_vanster = [o for o in grannar if abs(o["stil"]["ink_box"][0] - vanster) <= JUSTERING_PX]
        delar_mitt = [o for o in grannar
                      if abs((o["stil"]["ink_box"][0] + o["stil"]["ink_box"][2]) / 2 - mitt) <= JUSTERING_PX]
        if len(delar_vanster) > len(delar_mitt):
            s["justering"] = "vanster"
            s["justering_regel"] = (f"{len(delar_vanster)} annan rad börjar på samma x "
                                    f"({vanster}±{JUSTERING_PX}), fler än de {len(delar_mitt)} som delar mitt")
        elif s["centrerad_i_bild"] or delar_mitt:
            s["justering"] = "center"
            s["justering_regel"] = ("raden är centrerad i bilden" if s["centrerad_i_bild"]
                                    else f"{len(delar_mitt)} annan rad delar mitt ({mitt:.0f}±{JUSTERING_PX})")
        else:
            s["justering"] = "center"
            s["justering_regel"] = "ensam rad utan granne att jämföra med — centrerad i sin egen ruta (antagande)"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("bild", nargs="?")
    ap.add_argument("--konf", type=float, default=0.45)
    ap.add_argument("--pad", type=int, default=6)
    ap.add_argument("--belopp", type=float, default=None)
    ap.add_argument("--valuta", default=None)
    args = ap.parse_args()

    # Ett tal, formaterat i marknadens valuta. Formatet bor på ETT ställe
    # (factory/slutkort.py → VALUTAFORMAT) så priser och rabatter aldrig kan
    # skrivas olika i samma annons.
    if args.belopp is not None:
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        import slutkort
        print(json.dumps({"text": slutkort.formatera_pris(args.belopp, args.valuta)}, ensure_ascii=False))
        return

    if not args.bild:
        sys.exit("Användning: bildmarknad-mat.py <bild.jpg> [--konf=…] [--pad=…]")
    im = Image.open(args.bild).convert("RGB")
    a = np.asarray(im).astype(np.float32)
    H, W = a.shape[:2]
    rader = las_ocr(args.bild, args.konf)
    # Alla textrutor maskas bort innan EN ENDA rad mäts — grannraden är
    # bakgrund för ingen.
    fri = np.ones((H, W), bool)
    for r in rader:
        x0, y0, x1, y1 = r["box"]
        fri[max(0, y0 - 3):min(H, y1 + 4), max(0, x0 - 3):min(W, x1 + 4)] = False
    for i, r in enumerate(rader):
        r["i"] = i
        mat_rad(a, fri, r, W, H, args.pad)
    bedom_justering(rader, W)
    json.dump({"W": W, "H": H, "fil": str(args.bild), "rader": rader}, sys.stdout, ensure_ascii=False)


if __name__ == "__main__":
    main()
