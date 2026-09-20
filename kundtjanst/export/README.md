# Exporten: SOP-mappen → .docx och PDF

Axels önskemål 2026-09-20: *"riktiga PDF:er eller Google-dokument så att jag kan
ändra på dem."*

**Google Docs går inte att skapa härifrån** — ingen Drive-connector i
containern. Men en `.docx` gör samma sak: **släpp filen i Google Drive, öppna
den, och den blir ett redigerbart Google-dokument.** PDF:en är läsversionen.

⚠️ **Exporten går åt ett håll.** Ändrar någon i Word eller Google Docs kommer
det inte tillbaka till `kundtjanst/sop/`. Repot är facit — ändra där, och
exportera om.

## Köra

```bash
pip install python-docx                       # enda beroendet
python3 kundtjanst/export/sop-till-docx.py kundtjanst/sop <utmapp>
node kundtjanst/export/sop-till-html.mjs <utmapp>          # HTML, mellansteg till PDF
```

PDF görs av HTML:en med den förinstallerade Chromium:

```bash
CH=$(ls -d /opt/pw-browsers/chromium-*/chrome-linux/chrome | head -1)
"$CH" --headless --disable-gpu --no-sandbox --no-pdf-header-footer \
  --print-to-pdf=<utmapp>/pdf/Chargeback-SOP-handboken.pdf \
  "file://$PWD/<utmapp>/Chargeback-SOP-handboken.html"
```

Utdata: **en samlad handbok** (allt + innehåll + beslutsbladen som bilaga, 97
sidor) och **en fil per SOP** i `enskilda/` — den som VA:n får enskilt.

## Varför det ser ut så här

- **LibreOffice går inte att använda.** Bara `libreoffice-core` är installerat,
  inte `libreoffice-writer`, så alla dokumentfilter saknas: `soffice --convert-to
  docx` svarar `Error: source file could not be loaded` även på en tom `.txt`.
  Mätt 2026-09-20. Installera inte om det — python-docx + Chromium räcker.
- **Markdown-omvandlarna är egna och avsiktligt små.** Ingen pandoc i
  containern. De täcker exakt det SOP-filerna använder: rubriker, tabeller,
  listor, checkboxar (`[ ]` → ☐), citat, kodblock, fet/kursiv/kod/genomstruket,
  länkar, linjer. HTML-kommentarerna (granskningsnoterna i `00-MASTER.md`) tas
  bort — de är arbetsanteckningar, inte dokumenttext.
- **Tre fällor som redan kostat en omkörning**, rättade i båda omvandlarna:
  1. **Ombruten rad i ett citat** är ingen ny paragraf. Utan hopslagningen bryts
     `**fetstil**` som spänner över två rader, och stjärnorna hamnar i texten.
  2. **Samma sak för en ombruten listrad** — fortsättningen hamnade som egen
     paragraf utanför punkten.
  3. **Fetstil kan bära kursiv inuti sig** (`**en *viktig* sak**). Mönstret
     `\*\*[^*]+\*\*` slutade mitt i och lämnade `**` i texten på tre ställen.

## Kontroll före leverans

Sök efter `**` och `~~` i utdatan. Enda tillåtna träffen är den maskerade
adressen `ka***@gmail.com` i `60-ESCALATION` — allt annat är en markdown-rest.

```bash
python3 - <<'PY'
from docx import Document
import re, glob
for f in glob.glob('<utmapp>/**/*.docx', recursive=True):
    d = Document(f); txt = '\n'.join(p.text for p in d.paragraphs)
    for t in d.tables:
        for r in t.rows:
            for c in r.cells: txt += '\n' + c.text
    rest = [x for x in re.findall(r'.{15}\*\*.{15}', txt) if 'ka***@' not in x]
    if rest: print(f, rest[:2])
PY
```
