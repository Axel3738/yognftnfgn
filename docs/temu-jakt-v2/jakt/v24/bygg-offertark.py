#!/usr/bin/env python3
"""Bygger leverantörens offertark (Supplier Quote) ur Axels mall med NYA produkter.

    python3 bygg-offertark.py --mall <fil.xlsx> --produkter <fil.json> --ut <fil.xlsx>

Axels mall är ett offertark där leverantören fyller i pris. Varje produkt är ett block om fyra rader
(tre kvantitetsnivåer + en tunn skiljerad), med:
  A  produktbild   =IMAGE("<url>")   — A:C sammanslagna över blockets tre rader
  D  produktnamn
  E  anteckning till leverantören (E:G)
  I  marknad (SWEDEN)
  J/K/L  produktkostnad / frakt / totalt — LÄMNAS TOMMA, det är leverantören som fyller dem
  N  produktlänken (N:P)
  Q  variant / referens

Skriptet tömmer varje gammal produktrad och alla offertsiffror, och skriver in de nya produkterna
med bild, namn och länk. Rubrikrader, kolumnbredder, format och de andra marknadernas kolumner
lämnas orörda — leverantören ska känna igen sitt eget ark.
"""
import argparse
import json
import os
import shutil

import openpyxl
from openpyxl.utils import get_column_letter

FORSTA_RAD = 5          # första produktraden i mallen
RADER_PER_BLOCK = 4     # 3 kvantitetsnivåer + 1 tunn skiljerad
KOL_SLUT = 47           # AU — sista kolumnen (US-marknaden)


def rensa(ws, forsta, sista):
    """Tömmer alla produkt- och offertrader utan att röra rubrikerna (rad 1–4)."""
    for m in list(ws.merged_cells.ranges):
        if m.min_row >= forsta:
            ws.unmerge_cells(str(m))
    for r in range(forsta, sista + 1):
        for c in range(1, KOL_SLUT + 1):
            ws.cell(row=r, column=c).value = None


def skriv_block(ws, i, p, mall_block):
    """Ett produktblock: bild, namn, marknad och länk. Prisfälten lämnas tomma åt leverantören."""
    r = FORSTA_RAD + i * RADER_PER_BLOCK
    topp, bott = r, r + 2          # de tre kvantitetsraderna
    for kol, bredd in (("A", "C"), ("E", "G"), ("H", "H"), ("I", "I"), ("M", "M"), ("N", "P"), ("Q", "Q")):
        ws.merge_cells(f"{kol}{topp}:{bredd}{bott}")
    if p.get("bild"):
        ws.cell(row=topp, column=1).value = f'=IMAGE("{p["bild"]}")'
    ws.cell(row=topp, column=4).value = p["namn_sv"]           # D
    ws.cell(row=topp, column=9).value = "SWEDEN"               # I
    ws.cell(row=topp, column=14).value = p["url"]              # N
    if p.get("notering"):
        ws.cell(row=topp, column=5).value = p["notering"]      # E
    if p.get("variant"):
        ws.cell(row=topp, column=17).value = p["variant"]      # Q
    # Kvantitetstrappan i kolumn R (samma tre nivåer som mallen använder)
    for j, qty in enumerate(p.get("kvantiteter") or [100, 200, 300]):
        ws.cell(row=topp + j, column=18).value = qty           # R = Qty
    # Formatet ärvs från mallens första block, cell för cell
    for j in range(RADER_PER_BLOCK):
        ws.row_dimensions[r + j].height = mall_block["hojder"][j]
        for c in range(1, KOL_SLUT + 1):
            st = mall_block["stilar"][j].get(c)
            if st:
                cell = ws.cell(row=r + j, column=c)
                cell.font, cell.fill, cell.border, cell.alignment, cell.number_format = st
    return r


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--mall", required=True)
    ap.add_argument("--produkter", required=True)
    ap.add_argument("--ut", required=True)
    a = ap.parse_args()

    shutil.copy(a.mall, a.ut)
    wb = openpyxl.load_workbook(a.ut)
    ws = wb["Supplier Quote"]
    produkter = json.load(open(a.produkter, encoding="utf-8"))

    # Spara mallens första block som formatmall INNAN vi rensar
    import copy
    mall_block = {"hojder": [], "stilar": []}
    for j in range(RADER_PER_BLOCK):
        rr = FORSTA_RAD + j
        mall_block["hojder"].append(ws.row_dimensions[rr].height)
        stilar = {}
        for c in range(1, KOL_SLUT + 1):
            cell = ws.cell(row=rr, column=c)
            stilar[c] = (copy.copy(cell.font), copy.copy(cell.fill), copy.copy(cell.border),
                         copy.copy(cell.alignment), cell.number_format)
        mall_block["stilar"].append(stilar)

    sista = ws.max_row
    rensa(ws, FORSTA_RAD, sista)
    for i, p in enumerate(produkter):
        skriv_block(ws, i, p, mall_block)

    # Rader efter sista blocket får standardhöjd så arket inte har en lång tom svans
    slut = FORSTA_RAD + len(produkter) * RADER_PER_BLOCK
    for r in range(slut, sista + 1):
        ws.row_dimensions[r].height = None

    ws.cell(row=1, column=1).value = len(produkter)
    wb.save(a.ut)
    print(f"{a.ut}: {len(produkter)} produkter, rad {FORSTA_RAD}–{slut - 1}, {os.path.getsize(a.ut)//1024} KB")
    for i, p in enumerate(produkter):
        print(f"  rad {FORSTA_RAD + i * RADER_PER_BLOCK:>3}  {p['namn_sv'][:52]:52} {p['url']}")


if __name__ == "__main__":
    main()
