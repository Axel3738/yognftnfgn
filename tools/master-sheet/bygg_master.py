"""Slår ihop Axels produktbatch-ark (Google Sheets) till ett master-ark.

    pip install openpyxl Pillow
    cd tools/master-sheet && python3 bygg_master.py            # hämtar + bygger
    python3 bygg_master.py --utan-hamtning                     # bygg om från redan hämtade filer

En flik per batch (klistra-in-som-värden med all formatering, sammanslagna
celler, kolumnbredder, länkar och bilder) + fliken ALLA PRODUKTER med en rad
per produkt, läst ur batchflikarna på rubriknamn. Formler blir värden
(=IMAGE()-celler laddas ner och läggs in som riktiga bilder). Bilderna krymps
till max 500 px så filen håller sig under ~10 MB. Byggt 2026-09-17: 14 ark,
170 produkter, 8,7 MB.
"""
import io
import re
import subprocess
import sys
from copy import copy

import openpyxl
from openpyxl.drawing.image import Image as XlImage
from openpyxl.drawing.spreadsheet_drawing import OneCellAnchor, AnchorMarker
from openpyxl.drawing.xdr import XDRPositiveSize2D
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter, range_boundaries
from PIL import Image as PILImage

# Google Sheets-id + fliknamn. Arken måste vara delade "alla med länken kan visa".
# Lägg till nästa batch sist i listan och kör om — tabben och översikten byggs om.
GOOGLE_ARK = [
    ("1N-5uz6d0_tEVhW5ZuGarG1xrAQl7o0AnoHM8MxWOKaA", "Batch 1"),
    ("1DsnNutLzkDh3MO5A74VwWKF9wLMxzZTevTfOraGEdHE", "Batch 2"),
    ("1grWLaWOI1tO2L0JUKgSBsM_RyH09vNa_uuRLwWuknOw", "Batch 3"),
    ("1PrHS6gkJ230-wQNJNLoiFKuHM2RXYpZ6", "Batch 4"),
    ("1Pcdt9VDHzWgsR3ei1XqTZEn3vYB383ALinZT-wyJ2LM", "Batch 5.1"),
    ("1zGcVdwHVdvTD3t894FdFw--9fL8B5v5oMH5kK2XWM-I", "Batch 6"),
    ("1H7qeSjmba5a5OXkVKC6fHQNYH0Zp7TP7irR5MI0JUGI", "Batch 7"),
    ("1JT9sfbbrFnbBr2FE8iR36Z5xdvZDL7rQrGzIKIIQ6iE", "Batch 8"),
    ("1Zs_KOAd5582aVIHt18g3tVkTWoxS7CrB-gidBrnpGx4", "Batch 9"),
    ("1VJwBWO9Qt9Z7szCVg56-4Vj20BImzeZLhfi2UH-2x8Y", "Batch 10"),
    ("1hQhG7nSeuyaZ3sCc1aIMAqJxJ81_QBDM_dktJk9LeHI", "Batch 11"),
    ("1vgX-s8cXnwpZMqLB92RjlwbD32FZiaUo3SuRsyyYaGU", "Batch 12"),
    ("1R6VlstKQIei4TSLZ8qmzBUzs3V4SyoVsY30AzS-8rWM", "Batch 13"),
    ("149zfEDOpNuxr0Ln8c74R5521hHWZteFjM0u4a_qTTRQ", "Kalenderkungen"),
]
KALLOR = [(f"{i + 1:02d}.xlsx", namn) for i, (_, namn) in enumerate(GOOGLE_ARK)]


def hamta_ark():
    """Exporterar varje Google-ark som xlsx. Stora ark bryts ibland över HTTP/2 — tre försök."""
    for (gid, namn), (fil, _) in zip(GOOGLE_ARK, KALLOR):
        url = f"https://docs.google.com/spreadsheets/d/{gid}/export?format=xlsx"
        for forsok in range(3):
            subprocess.run(["curl", "-sS", "-L", "--http1.1", "-o", fil, url], capture_output=True, timeout=300)
            try:
                openpyxl.load_workbook(fil, read_only=True).close()
                break
            except Exception:
                if forsok == 2:
                    raise SystemExit(f"{namn}: gick inte att hämta {url}")
        print(f"hämtat {namn} → {fil}")
UT = "Master sheet - alla produkter.xlsx"
MAX_PX = 500  # bilderna krymps till max 500 px på längsta sidan (visningsstorleken behålls)
IMAGE_RE = re.compile(r'^=IMAGE\("([^"]+)"', re.I)

logg = []


def krymp(pil_img):
    img = pil_img
    if img.mode in ("RGBA", "LA", "P"):
        img = img.convert("RGBA")
        bg = PILImage.new("RGB", img.size, (255, 255, 255))
        bg.paste(img, mask=img.split()[-1])
        img = bg
    elif img.mode != "RGB":
        img = img.convert("RGB")
    img.thumbnail((MAX_PX, MAX_PX))
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=82, optimize=True)
    buf.seek(0)
    return buf


def hamta_url(url):
    """Laddar ner en bild-URL via curl (proxyn). None om det inte gick."""
    try:
        r = subprocess.run(
            ["curl", "-sS", "-L", "--max-time", "25", "-A", "Mozilla/5.0", url],
            capture_output=True, timeout=40)
        if r.returncode != 0 or len(r.stdout) < 500:
            return None
        return PILImage.open(io.BytesIO(r.stdout))
    except Exception:
        return None


def kopiera_flik(fil, namn, master):
    wbf = openpyxl.load_workbook(fil)                   # formler + bilder
    wbv = openpyxl.load_workbook(fil, data_only=True)   # värden
    src, srcv = wbf.active, wbv.active
    dst = master.create_sheet(namn)

    n_form, n_img_url, n_img_url_ok = 0, 0, 0
    for row in src.iter_rows():
        for c in row:
            v = srcv[c.coordinate].value
            raw = c.value
            if isinstance(raw, str) and raw.startswith("="):
                n_form += 1
                m = IMAGE_RE.match(raw)
                if m:
                    url = m.group(1)
                    n_img_url += 1
                    pil = hamta_url(url)
                    if pil is not None:
                        n_img_url_ok += 1
                        xi = XlImage(krymp(pil))
                        # visas i cellen: ca 120 x 90 px
                        xi.width, xi.height = 120, 90
                        xi.anchor = c.coordinate
                        dst.add_image(xi)
                        v = None
                    else:
                        v = url
                        logg.append(f"{namn} {c.coordinate}: bild-URL gick inte att hämta, länken står kvar i cellen")
            d = dst.cell(row=c.row, column=c.column, value=v)
            if c.has_style:
                d.font = copy(c.font)
                d.fill = copy(c.fill)
                d.border = copy(c.border)
                d.alignment = copy(c.alignment)
                d.number_format = c.number_format
                d.protection = copy(c.protection)
            if c.hyperlink is not None and c.hyperlink.target:
                d.hyperlink = c.hyperlink.target
            elif isinstance(v, str) and v.startswith("http") and c.hyperlink is None:
                d.hyperlink = v

    for rng in src.merged_cells.ranges:
        dst.merge_cells(str(rng))

    for key, dim in src.column_dimensions.items():
        lo = dim.min or openpyxl.utils.column_index_from_string(key)
        hi = dim.max or lo
        for ci in range(lo, hi + 1):
            nd = dst.column_dimensions[get_column_letter(ci)]
            if dim.width:
                nd.width = dim.width
            nd.hidden = dim.hidden
    for r, dim in src.row_dimensions.items():
        nd = dst.row_dimensions[r]
        if dim.height:
            nd.height = dim.height
        nd.hidden = dim.hidden
    dst.freeze_panes = src.freeze_panes
    dst.sheet_format.defaultColWidth = src.sheet_format.defaultColWidth

    for img in src._images:
        pil = PILImage.open(img.ref) if not isinstance(img.ref, str) else PILImage.open(img.ref)
        xi = XlImage(krymp(pil))
        xi.anchor = img.anchor          # samma cell + samma visningsstorlek
        dst.add_image(xi)

    rader = sum(1 for r in srcv.iter_rows(values_only=True) if any(x not in (None, "") for x in r))
    print(f"{namn:15s} rader={rader:4d} bilder={len(src._images):3d} formler→värden={n_form:3d} IMAGE-url={n_img_url_ok}/{n_img_url}")
    return dst, srcv


# ---------- översikten ----------
def _lank(c):
    if c is None:
        return None
    if c.hyperlink is not None and c.hyperlink.target:
        return c.hyperlink.target
    v = c.value
    return v if isinstance(v, str) and v.startswith("http") else (v if v not in (None, "") else None)


def _num(v):
    if v in (None, ""):
        return None
    if isinstance(v, (int, float)):
        return v
    try:
        return float(str(v).replace(",", "."))
    except ValueError:
        return v  # t.ex. "439 SEK" eller "oversize" — behålls som text


def produkter(ws, namn):
    """Plockar en rad per produkt ur en batchflik. Kolumner slås upp på rubriknamn."""
    ut = []
    if namn == "Batch 1":
        for r in range(2, ws.max_row + 1):
            if ws.cell(r, 1).value in (None, ""):
                continue
            # kolumn N ("View product") är Temu-länkar, utom en rad som länkar till butiken
            lank = _lank(ws.cell(r, 14))
            butik = lank if isinstance(lank, str) and "baverbutiken" in lank else None
            temu = lank if lank and butik is None else None
            ut.append(dict(produkt=ws.cell(r, 1).value, pris=_num(ws.cell(r, 7).value),
                           kost=_num(ws.cell(r, 8).value), frakt=_num(ws.cell(r, 9).value),
                           tot=_num(ws.cell(r, 11).value), butik=butik,
                           temu=temu, notis=ws.cell(r, 13).value, rad=r))
        return ut
    if namn == "Batch 2":
        for r in range(2, ws.max_row + 1):
            if ws.cell(r, 1).value in (None, ""):
                continue
            if all(ws.cell(r, c).value in (None, "") for c in range(2, 9)):
                continue  # fotnot/förklaring, ingen produkt
            ut.append(dict(produkt=ws.cell(r, 1).value, pris=_num(ws.cell(r, 6).value),
                           kost=_num(ws.cell(r, 3).value), frakt=_num(ws.cell(r, 4).value),
                           tot=_num(ws.cell(r, 5).value), butik=_lank(ws.cell(r, 7)),
                           temu=None, notis=ws.cell(r, 8).value, rad=r))
        return ut
    # Supplier Quote-formatet: rubrikraden är rad 3
    rub = {}
    for c in ws[3]:
        if isinstance(c.value, str):
            t = c.value.strip().lower()
            if t in ("product", "product name") and "namn" not in rub:
                rub["namn"] = c.column
            elif t.startswith("sale price") and "pris" not in rub:
                rub["pris"] = c.column
            elif t == "product cost" and "kost" not in rub:
                rub["kost"] = c.column
            elif t == "shipping cost" and "frakt" not in rub:
                rub["frakt"] = c.column
            elif t == "total tax exclusive" and "tot" not in rub:
                rub["tot"] = c.column
            elif t == "bäverbutiken link":
                rub["butik"] = c.column
            elif t == "temu link":
                rub["temu"] = c.column
            elif t.startswith("quote image"):
                rub["notis"] = c.column
    saknas = {"namn", "pris", "kost", "frakt", "tot"} - set(rub)
    if saknas:
        raise SystemExit(f"{namn}: hittar inte rubrikerna {saknas} på rad 3")
    for r in range(4, ws.max_row + 1):
        nm = ws.cell(r, rub["namn"]).value
        if nm in (None, ""):
            continue
        g = lambda k: ws.cell(r, rub[k]) if k in rub else None
        ut.append(dict(produkt=nm, pris=_num(g("pris").value), kost=_num(g("kost").value),
                       frakt=_num(g("frakt").value), tot=_num(g("tot").value),
                       butik=_lank(g("butik")), temu=_lank(g("temu")),
                       notis=(g("notis").value if g("notis") else None), rad=r))
    return ut


def bygg_oversikt(master, alla):
    ws = master.create_sheet("ALLA PRODUKTER", 0)
    rubriker = ["Batch", "Produkt", "Pris i butiken (SEK)", "Product cost (USD)",
                "Shipping cost (USD)", "Total ex. tax (USD)", "Bäverbutiken-länk",
                "Temu-länk", "Notering / status", "Rad i batchfliken"]
    ws.append(rubriker)
    for c in ws[1]:
        c.font = Font(name="Arial", bold=True, color="FFFFFF")
        c.fill = PatternFill("solid", fgColor="1F4E78")
        c.alignment = Alignment(vertical="center", wrap_text=True)
    for namn, p in alla:
        ws.append([namn, p["produkt"], p["pris"], p["kost"], p["frakt"], p["tot"],
                   p["butik"], p["temu"], p["notis"], None])
        r = ws.max_row
        for c in ws[r]:
            c.font = Font(name="Arial")
        for col in (7, 8):
            c = ws.cell(r, col)
            if isinstance(c.value, str) and c.value.startswith("http"):
                c.hyperlink = c.value
                c.font = Font(name="Arial", color="0563C1", underline="single")
        lc = ws.cell(r, 10, value=f"Rad {p['rad']}")
        lc.hyperlink = f"#'{namn}'!A{p['rad']}"
        lc.font = Font(name="Arial", color="0563C1", underline="single")
        for col in (4, 5, 6):
            if isinstance(ws.cell(r, col).value, (int, float)):
                ws.cell(r, col).number_format = "0.00"
    for col, w in zip("ABCDEFGHIJ", (14, 48, 18, 16, 16, 16, 40, 40, 40, 14)):
        ws.column_dimensions[col].width = w
    ws.freeze_panes = "A2"
    ws.auto_filter.ref = f"A1:J{ws.max_row}"
    n = ws.max_row + 2
    ws.cell(n, 1, "Översikten är läst ur batchflikarna (kvantitet 1-raden per produkt). "
                  "Batchflikarna är originalen, kopierade som värden.").font = Font(name="Arial", italic=True, color="666666")
    return ws


if __name__ == "__main__":
    if "--utan-hamtning" not in sys.argv:
        hamta_ark()
    master = openpyxl.Workbook()
    master.remove(master.active)
    alla = []
    for fil, namn in KALLOR:
        dst, srcv = kopiera_flik(fil, namn, master)
        for p in produkter(srcv, namn):
            alla.append((namn, p))
    ov = bygg_oversikt(master, alla)
    master.save(UT)
    print(f"\nÖversikt: {len(alla)} produkter över {len(KALLOR)} batcher → {UT}")
    for l in logg:
        print("  !", l)
