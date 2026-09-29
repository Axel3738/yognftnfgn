from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.drawing.image import Image as XLImage
from openpyxl.comments import Comment
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.formatting.rule import FormulaRule
from openpyxl.utils import get_column_letter as L

# Bygger cogs-matstrumpor.xlsx ur leverantörens offert (skärmdumpar från Axel 2026-09-29).
# Kör: python3 matstrumpor/cogs-offert/bygg.py  (kräver openpyxl + pillow)
import os
HAR = os.path.dirname(os.path.abspath(__file__))
BILD = HAR + '/bild/'
UT = HAR + '/cogs-matstrumpor.xlsx'
DATUM = '2026-09-29'

F = 'Arial'
KREM = PatternFill('solid', fgColor='FFF2CC')
GUL = PatternFill('solid', fgColor='FFF7DB')
BLA = PatternFill('solid', fgColor='8ED8F8')
BLA_LJ = PatternFill('solid', fgColor='EAF7FD')
MORK = PatternFill('solid', fgColor='1F2937')
TOM = PatternFill('solid', fgColor='FAFAFA')
LINJE = Side(style='thin', color='D9D9D9')
RAM = Border(left=LINJE, right=LINJE, top=LINJE, bottom=LINJE)
TJOCK = Side(style='medium', color='9CA3AF')
MITT = Alignment(horizontal='center', vertical='center', wrap_text=True)
VANSTER = Alignment(horizontal='left', vertical='center', wrap_text=True)
TAL = '0.0;-0.0;"–"'
INPUT = '0000FF'   # blå = siffra från leverantörens offert

S3, S5 = '1 set (3 pairs)', '1 set (5 pairs)'
P = {
    'Sushi': dict(bild='sushi.png', data=[
        ('Sweden', [(S3, 1.7, 5.2, 6.9), ('2 sets (3 pairs)', 3.4, 7.0, 10.4), (S5, 2.6, 5.6, 8.2), ('2 sets (5 pairs)', 5.2, 7.1, 12.3)]),
        ('Norway', [(S3, 1.7, 6.3, 8.0), ('2 sets (3 pairs)', 3.4, 7.9, 11.3), (S5, 2.6, 6.8, 9.4), ('2 sets (5 pairs)', 5.2, 8.5, 13.7)]),
        ('Denmark', [(S3, 2.6, 5.8, 8.4), ('2 sets (3 pairs)', 5.2, 6.2, 11.4), (S5, 2.6, 7.1, 9.7), ('2 sets (5 pairs)', 5.2, 8.4, 13.6)]),
        ('Finland', [(S3, 2.6, 6.3, 8.9), ('2 sets (3 pairs)', 5.2, 7.5, 12.7), (S5, 2.6, 7.7, 10.3), ('2 sets (5 pairs)', 5.2, 10.1, 15.3)]),
    ]),
}
def tva(q1, rader):
    return [(land, [(q1, *a), ('2 sets', *b)]) for land, a, b in rader]
P['Donut'] = dict(bild='donut.png', data=tva(S3, [
    ('Sweden', (2.1, 5.2, 7.3), (4.2, 7.0, 11.3)), ('USA', (2.6, 6.5, 9.1), (5.2, 9.0, 14.2)),
    ('UK', (2.6, 4.5, 7.1), (5.2, 6.2, 11.4)), ('New Zealand', (2.6, 6.2, 8.7), (5.2, 9.4, 14.5)),
    ('Australia', (2.6, 6.5, 9.1), (5.2, 9.8, 14.9)), ('Canada', (2.6, 5.5, 8.1), (5.2, 7.5, 12.6)),
    ('Norway', (2.6, 6.6, 9.2), (5.2, 8.8, 13.9)), ('Denmark', (2.6, 6.8, 9.4), (5.2, 8.9, 14.0)),
    ('Finland', (2.6, 7.3, 9.9), (5.2, 9.4, 14.5))]))
P['Pizza'] = dict(bild='pizza.png', data=tva('1 set (4 pairs)', [
    ('Sweden', (2.7, 5.4, 8.1), (5.4, 7.7, 13.1)), ('USA', (2.7, 7.1, 9.8), (5.4, 10.7, 16.1)),
    ('UK', (2.7, 4.9, 7.6), (5.4, 7.0, 12.4)), ('New Zealand', (2.7, 7.2, 9.9), (5.4, 11.4, 16.8)),
    ('Australia', (2.7, 7.6, 10.3), (5.4, 11.8, 17.2)), ('Canada', (2.7, 6.1, 8.8), (5.4, 8.9, 14.3)),
    ('Norway', (2.7, 6.8, 9.5), (5.4, 8.9, 14.3)), ('Denmark', (2.7, 6.9, 9.6), (5.4, 8.9, 14.3)),
    ('Finland', (2.7, 7.4, 10.1), (5.4, 10.5, 15.9))]))
P['Hamburger'] = dict(bild='burger.png', data=tva(S3, [
    ('Sweden', (2.5, 5.2, 7.6), (4.9, 7.3, 12.2)), ('USA', (2.5, 6.4, 8.9), (4.9, 9.5, 14.4)),
    ('UK', (2.5, 4.6, 7.0), (4.9, 6.4, 11.3)), ('New Zealand', (2.5, 6.4, 8.9), (4.9, 9.9, 14.8)),
    ('Australia', (2.5, 6.8, 9.2), (4.9, 10.3, 15.2)), ('Canada', (2.5, 5.7, 8.2), (4.9, 7.9, 12.8)),
    ('Norway', (2.5, 6.4, 8.9), (4.9, 8.3, 13.2)), ('Denmark', (2.5, 6.5, 9.0), (4.9, 8.4, 13.3)),
    ('Finland', (2.5, 7.1, 9.5), (4.9, 9.8, 14.7))]))

TOMMA_LANDER = 20   # förberedda tomma block per produktflik
LANDER = ['Sweden', 'Norway', 'Denmark', 'Finland', 'USA', 'UK', 'Canada', 'Australia', 'New Zealand']
TOMMA_OVERSIKT = 20

wb = Workbook()
ov = wb.active
ov.title = 'Overview'

def cell(ws, r, c, v=None, font=None, fill=None, align=MITT, fmt=None, border=RAM):
    x = ws.cell(r, c, v)
    x.font = font or Font(name=F, size=11)
    if fill: x.fill = fill
    x.alignment = align
    if fmt: x.number_format = fmt
    if border: x.border = border
    return x

def rubrik(ws, text, under, bredd):
    ws.merge_cells(start_row=1, start_column=2, end_row=1, end_column=bredd)
    cell(ws, 1, 2, text, Font(name=F, size=18, bold=True, color='FFFFFF'), MORK, VANSTER, border=None)
    for c in range(3, bredd + 1): ws.cell(1, c).fill = MORK
    ws.row_dimensions[1].height = 38
    ws.merge_cells(start_row=2, start_column=2, end_row=2, end_column=bredd)
    cell(ws, 2, 2, under, Font(name=F, size=10, italic=True, color='6B7280'), None, VANSTER, border=None)
    ws.row_dimensions[2].height = 20
    ws.column_dimensions['A'].width = 2

produktinfo = {}  # namn -> (sista rad, varianter)
for namn, p in P.items():
    ws = wb.create_sheet(namn)
    ws.sheet_view.showGridLines = False
    rubrik(ws, f'{namn.upper()} SOCKS — COGS per country', f'Supplier quote, read {DATUM}. All amounts in USD per order. Blue numbers = supplier quote. Grey rows at the bottom = add a new country.', 7)
    hdr = ['Picture', 'Country', 'Quantity', 'COST ($)', 'SHIPPING FEE ($)', 'PRICE ($)']
    for i, h in enumerate(hdr):
        f = BLA if h == 'PRICE ($)' else KREM
        cell(ws, 4, 2 + i, h, Font(name=F, size=13 if h == 'PRICE ($)' else 11, bold=True, color='111827' if h == 'PRICE ($)' else '4B5563'), f)
    ws.row_dimensions[4].height = 34
    varianter = [q for q, *_ in p['data'][0][1]]
    r = 5
    avvik = 0
    for bi, (land, rader) in enumerate(p['data']):
        topp = r
        for q, c, s, t in rader:
            cell(ws, r, 4, q)
            cell(ws, r, 5, c, Font(name=F, size=11, color=INPUT), fmt=TAL)
            cell(ws, r, 6, s, Font(name=F, size=11, color=INPUT), GUL, fmt=TAL)
            x = cell(ws, r, 7, t, Font(name=F, size=12, bold=True, color=INPUT), BLA_LJ, fmt=TAL)
            if abs(c + s - t) > 0.051:
                avvik += 1
                x.comment = Comment(f'Supplier price as quoted. Cost + shipping = {c + s:.1f} (supplier rounding).', 'COGS')
            cell(ws, r, 8, f'=$C${topp}', Font(name=F, size=9, color='9CA3AF'), border=None)
            ws.row_dimensions[r].height = 24
            r += 1
        ws.merge_cells(start_row=topp, start_column=3, end_row=r - 1, end_column=3)
        cell(ws, topp, 3, land, Font(name=F, size=13, bold=True, color='111827'))
        for rr in range(topp, r): ws.cell(rr, 3).border = RAM
        for cc in range(3, 8): ws.cell(r - 1, cc).border = Border(left=LINJE, right=LINJE, top=LINJE, bottom=TJOCK)
    sista_data = r - 1
    ws.merge_cells(start_row=5, start_column=2, end_row=sista_data, end_column=2)
    cell(ws, 5, 2, None)
    img = XLImage(BILD + p['bild'])
    sk = 190 / img.width
    img.width, img.height = int(img.width * sk), int(img.height * sk)
    ws.add_image(img, 'B5')

    # förberedda tomma block för nya länder
    r += 1
    ws.merge_cells(start_row=r, start_column=2, end_row=r, end_column=7)
    cell(ws, r, 2, '➕  NEW COUNTRIES — type the country in the grey box, then cost and shipping. Price fills itself (overwrite it with the supplier price if it differs).',
         Font(name=F, size=10, bold=True, color='374151'), KREM, VANSTER)
    ws.row_dimensions[r].height = 30
    r += 1
    for _ in range(TOMMA_LANDER):
        topp = r
        for q in varianter:
            cell(ws, r, 4, q, Font(name=F, size=11, color='6B7280'), TOM)
            cell(ws, r, 5, None, Font(name=F, size=11, color=INPUT), TOM, fmt=TAL)
            cell(ws, r, 6, None, Font(name=F, size=11, color=INPUT), GUL, fmt=TAL)
            cell(ws, r, 7, f'=IF(COUNT(E{r}:F{r})=2,E{r}+F{r},"")', Font(name=F, size=12, bold=True), BLA_LJ, fmt=TAL)
            cell(ws, r, 8, f'=IF($C${topp}="","",$C${topp})', Font(name=F, size=9, color='9CA3AF'), border=None)
            ws.row_dimensions[r].height = 22
            r += 1
        ws.merge_cells(start_row=topp, start_column=3, end_row=r - 1, end_column=3)
        cell(ws, topp, 3, None, Font(name=F, size=13, bold=True), TOM)
        for rr in range(topp, r): ws.cell(rr, 3).border = RAM
        for cc in range(3, 8): ws.cell(r - 1, cc).border = Border(left=LINJE, right=LINJE, top=LINJE, bottom=TJOCK)
    produktinfo[namn] = (r - 1, varianter, avvik)
    for kol, w in zip('BCDEFGH', [30, 18, 20, 13, 18, 15, 12]):
        ws.column_dimensions[kol].width = w
    ws.column_dimensions['H'].hidden = True
    ws.freeze_panes = 'C5'
    ws.print_title_rows = '4:4'
    ws.page_setup.orientation = 'portrait'
    ws.page_setup.fitToWidth = 1
    ws.page_setup.fitToHeight = 0
    ws.sheet_properties.pageSetUpPr.fitToPage = True
    ws.sheet_properties.tabColor = {'Sushi': 'F97316', 'Donut': 'EC4899', 'Pizza': 'EF4444', 'Hamburger': 'A16207'}[namn]

# ---------- Översikt ----------
ov.sheet_view.showGridLines = False
kolumner = [(n, v) for n, (_, vs, _) in produktinfo.items() for v in vs]
sistakol = 2 + len(kolumner)
rubrik(ov, 'MATSTRUMPOR — COGS OVERVIEW (USD per order)', f'Supplier price per country and pack, read {DATUM}. Pulled automatically from the product tabs. "–" = no quote yet.', sistakol)
cell(ov, 4, 2, 'Country', Font(name=F, size=11, bold=True, color='4B5563'), KREM)
ov.merge_cells('B4:B5')
c = 3
for namn, (_, vs, _) in produktinfo.items():
    ov.merge_cells(start_row=4, start_column=c, end_row=4, end_column=c + len(vs) - 1)
    cell(ov, 4, c, namn.upper(), Font(name=F, size=12, bold=True, color='FFFFFF'),
         PatternFill('solid', fgColor={'Sushi': 'F97316', 'Donut': 'EC4899', 'Pizza': 'EF4444', 'Hamburger': 'A16207'}[namn]))
    for i, v in enumerate(vs):
        cell(ov, 5, c + i, v, Font(name=F, size=10, bold=True, color='374151'), KREM)
    c += len(vs)
ov.row_dimensions[4].height = 28
ov.row_dimensions[5].height = 34
r = 6
for i in range(len(LANDER) + TOMMA_OVERSIKT):
    land = LANDER[i] if i < len(LANDER) else None
    cell(ov, r, 2, land, Font(name=F, size=12, bold=True), TOM if land is None else None, VANSTER)
    for j, (namn, v) in enumerate(kolumner):
        sista = produktinfo[namn][0]
        fl = f"'{namn}'!$H$5:$H${sista}"
        fq = f"'{namn}'!$D$5:$D${sista}"
        fp = f"'{namn}'!$G$5:$G${sista}"
        kl = L(3 + j)
        formel = (f'=IF($B{r}="","",IF(COUNTIFS({fl},$B{r},{fq},{kl}$5,{fp},">0")=0,"–",'
                  f'SUMIFS({fp},{fl},$B{r},{fq},{kl}$5)))')
        cell(ov, r, 3 + j, formel, Font(name=F, size=11), BLA_LJ if r % 2 == 0 else None, fmt=TAL)
    ov.row_dimensions[r].height = 22
    r += 1
sista_ov = r - 1
ov.conditional_formatting.add(f'C6:{L(sistakol)}{sista_ov}',
    FormulaRule(formula=['C6="–"'], font=Font(name=F, color='C0C0C0')))
ov.column_dimensions['A'].width = 2
ov.column_dimensions['B'].width = 18
for j in range(len(kolumner)):
    ov.column_dimensions[L(3 + j)].width = 13
ov.freeze_panes = 'C6'

r = sista_ov + 2
ov.merge_cells(start_row=r, start_column=2, end_row=r, end_column=sistakol)
cell(ov, r, 2, 'SÅ LÄGGER DU TILL ETT NYTT LAND', Font(name=F, size=12, bold=True, color='FFFFFF'), MORK, VANSTER, border=None)
for cc in range(3, sistakol + 1): ov.cell(r, cc).fill = MORK
steg = [
    '1. Gå till produktens flik (Sushi, Donut, Pizza eller Hamburger) och scrolla ner till de grå raderna under ➕ NEW COUNTRIES.',
    '2. Skriv landet i den grå rutan under Country, t.ex. Germany.',
    '3. Skriv COST och SHIPPING FEE ur leverantörens offert. PRICE räknas själv. Skriver leverantören ett annat pris: skriv över PRICE.',
    '4. Skriv samma landsnamn i en grå rad här i Overview (kolumn B). Hela raden fylls i av sig själv. Stava exakt likadant.',
    'Blå siffror = leverantörens offert. Kommentar på en pris-ruta = leverantörens pris skiljer 0,1 från kostnad + frakt (deras avrundning).',
]
for s in steg:
    r += 1
    ov.merge_cells(start_row=r, start_column=2, end_row=r, end_column=sistakol)
    cell(ov, r, 2, s, Font(name=F, size=10, color='374151'), None, VANSTER, border=None)
    ov.row_dimensions[r].height = 20
ov.sheet_properties.tabColor = '1F2937'
ov.page_setup.orientation = 'landscape'
ov.page_setup.fitToWidth = 1
ov.page_setup.fitToHeight = 0
ov.sheet_properties.pageSetUpPr.fitToPage = True

import os
os.makedirs(os.path.dirname(UT), exist_ok=True)
from openpyxl.workbook.properties import CalcProperties
wb.calculation = CalcProperties(fullCalcOnLoad=True)
wb.save(UT)
print(UT, {k: (v[0], v[2]) for k, v in produktinfo.items()})
