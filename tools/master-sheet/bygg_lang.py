"""Alla batcher i EN lång flik, under varandra (Axels beslut 2026-09-17: scrolla + Ctrl+F).

    cd tools/master-sheet && python3 bygg_master.py && python3 bygg_lang.py

Det här är den version Axel vill ha. bygg_master.py (en flik per batch +
översikt) hämtar arken och behålls som hämtsteg. Ny batch: lägg till dess
Google-id sist i GOOGLE_ARK i bygg_master.py och kör båda igen.

Varje batch behåller sina egna rubrikrader, sin formatering, sina bilder och
länkar. Före varje batch ligger en blå bannerrad med batchens namn. Inga
kolumner döljs (Batch 8 och Kalenderkungen hade dolda kolumner i originalet).
"""
import io
import re
import subprocess
from copy import copy, deepcopy

import openpyxl
from openpyxl.drawing.image import Image as XlImage
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter, column_index_from_string
from PIL import Image as PILImage

from bygg_master import KALLOR, krymp, hamta_url, IMAGE_RE

UT = "Master sheet - alla produkter (en flik).xlsx"
BANNER_FILL = PatternFill("solid", fgColor="1F4E78")
BANNER_FONT = Font(name="Arial", bold=True, size=14, color="FFFFFF")

master = openpyxl.Workbook()
ws = master.active
ws.title = "ALLA PRODUKTER"
bredd = {}
rad = 1
innehall = []  # (bannerrad, namn)
logg = []

for fil, namn in KALLOR:
    src = openpyxl.load_workbook(fil).active
    srcv = openpyxl.load_workbook(fil, data_only=True).active

    # bannerrad
    b = ws.cell(rad, 1, f"▶ {namn.upper()}")
    b.font, b.fill = BANNER_FONT, BANNER_FILL
    for c in range(2, 50):
        ws.cell(rad, c).fill = BANNER_FILL
    ws.row_dimensions[rad].height = 24
    innehall.append((rad, namn))
    offset = rad  # källans rad 1 hamnar på rad offset+1

    # Google exporterar 1 000 rader per ark — klipp vid sista raden med innehåll
    sista = max(
        [r[0].row for r in src.iter_rows() if any(c.value not in (None, "") for c in r)]
        + [rng.max_row for rng in src.merged_cells.ranges]
        + [img.anchor._from.row + 3 for img in src._images]
    )
    n_img = 0
    for row in src.iter_rows(max_row=sista):
        for c in row:
            v = srcv[c.coordinate].value
            raw = c.value
            if isinstance(raw, str) and raw.startswith("="):
                m = IMAGE_RE.match(raw)
                if m:
                    pil = hamta_url(m.group(1)) or hamta_url(m.group(1))  # ett omförsök
                    if pil is not None:
                        xi = XlImage(krymp(pil))
                        xi.width, xi.height = 120, 90
                        xi.anchor = f"{get_column_letter(c.column)}{c.row + offset}"
                        ws.add_image(xi)
                        n_img += 1
                        v = None
                    else:
                        v = m.group(1)
                        logg.append(f"{namn} {c.coordinate}: bild-URL gick inte att hämta")
            d = ws.cell(row=c.row + offset, column=c.column, value=v)
            if c.has_style:
                d.font = copy(c.font)
                d.fill = copy(c.fill)
                d.border = copy(c.border)
                d.alignment = copy(c.alignment)
                d.number_format = c.number_format
            if c.hyperlink is not None and c.hyperlink.target:
                d.hyperlink = c.hyperlink.target
            elif isinstance(v, str) and v.startswith("http"):
                d.hyperlink = v

    for rng in src.merged_cells.ranges:
        ws.merge_cells(start_row=rng.min_row + offset, end_row=rng.max_row + offset,
                       start_column=rng.min_col, end_column=rng.max_col)

    for key, dim in src.column_dimensions.items():
        lo = dim.min or column_index_from_string(key)
        hi = dim.max or lo
        for ci in range(lo, hi + 1):
            if dim.width:
                bredd[ci] = max(bredd.get(ci, 0), dim.width)
    for r, dim in src.row_dimensions.items():
        if dim.height:
            ws.row_dimensions[r + offset].height = dim.height

    for img in src._images:
        xi = XlImage(krymp(PILImage.open(img.ref)))
        a = deepcopy(img.anchor)
        a._from.row += offset
        xi.anchor = a
        ws.add_image(xi)
        n_img += 1

    rad = offset + sista + 2  # en tom rad mellan batcherna
    print(f"{namn:15s} rader {offset + 1}–{offset + sista}  bilder={n_img}")

for ci, w in bredd.items():
    ws.column_dimensions[get_column_letter(ci)].width = min(w, 60)

# Innehållsförteckning överst? Nej — Axel vill bara scrolla. Men frys inget och dölj inget.
master.save(UT)
print(f"\n{UT}: {rad - 2} rader, {len(ws._images)} bilder, {len(ws.merged_cells.ranges)} sammanslagna")
for l in logg:
    print("  !", l)
