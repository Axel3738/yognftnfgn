#!/usr/bin/env python3
"""Bygger VA:ns UGC-paket som PDF:er ur va-kit/*.md.

Axels dom 2026-09-24 på .md-filerna: "Hur ska jag eller VA kunna läsa nått av
detta?" — Windows öppnar inte .md. Källan är fortfarande markdown i va-kit/,
och det här skriptet gör det läsbara paketet:

  1 - START HERE.pdf
  2 - VA Handbook.pdf                          (alla kapitel, en fil)
  3 - Paste into Claude project instructions.txt
  Google Sheet templates/*.csv

Kräver python-paketet `markdown` (pip install markdown) och Playwright med
Chromium (finns globalt i claude.ai-containern).

Körning:  python3 factory/ugc/bygg-va-paket.py <utmapp>
"""
import html, os, re, shutil, subprocess, sys, tempfile
import markdown

KIT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'va-kit')
KAPITEL = [  # (fil, kapitelnamn i handboken)
    ('SOP.md', 'Your job, step by step'),
    ('TERMS.md', 'Terms'),
    ('VETTING.md', 'Vetting'),
    ('SHEET.md', 'The Google Sheet'),
    ('TEMPLATES.md', 'Templates'),
    ('AGREEMENT.md', 'Agreement'),
]
NAMN = {f: n for f, n in KAPITEL}

CSS = """
@page { size: A4; margin: 18mm 16mm; }
body { font-family: 'DejaVu Sans', Arial, sans-serif; font-size: 11.5pt; line-height: 1.5; color: #111; }
h1 { font-size: 22pt; margin: 0 0 10pt; color: #0b3d2e; }
h2 { font-size: 15pt; margin: 18pt 0 6pt; color: #0b3d2e; border-bottom: 2px solid #0b3d2e; padding-bottom: 2pt; }
h3 { font-size: 12.5pt; margin: 14pt 0 4pt; }
.kapitel { page-break-before: always; }
.kapitel:first-of-type { page-break-before: auto; }
table { border-collapse: collapse; width: 100%; margin: 6pt 0 10pt; font-size: 10pt; }
th, td { border: 1px solid #999; padding: 4pt 6pt; vertical-align: top; text-align: left; }
th { background: #e6f0ec; }
tr { page-break-inside: avoid; }
pre { background: #fff8d6; border: 2px solid #c9a400; padding: 8pt; white-space: pre-wrap; word-wrap: break-word;
      font-family: 'DejaVu Sans Mono', monospace; font-size: 10pt; page-break-inside: avoid; }
code { background: #eee; padding: 0 3pt; border-radius: 3px; font-size: 10pt; }
pre code { background: none; padding: 0; }
blockquote { background: #fff8d6; border-left: 5px solid #c9a400; margin: 6pt 0; padding: 6pt 10pt; }
blockquote p { margin: 2pt 0; }
em { color: #444; }
.titel { text-align: center; margin-top: 70mm; }
.titel h1 { font-size: 30pt; }
.toc li { font-size: 13pt; margin: 4pt 0; }
"""


def byt_filnamn(text):
    """`SOP.md` → kapitelnamnet, så att texten pekar på något som finns i PDF:en."""
    def ers(m):
        f = m.group(1) + '.md'
        return f'the "{NAMN[f]}" chapter' if f in NAMN else m.group(0)
    text = re.sub(r'`?\b([A-Z]+)\.md\b`?', ers, text)
    text = text.replace('`creators-sheet-template.csv`', '"creators-sheet-template.csv" (Google Sheet templates folder)')
    text = text.replace('`deals-sheet-template.csv`', '"deals-sheet-template.csv"')
    return text


def md_html(text):
    return markdown.markdown(byt_filnamn(text), extensions=['tables', 'fenced_code', 'sane_lists'])


def pdf(html_text, ut):
    with tempfile.NamedTemporaryFile('w', suffix='.html', delete=False, encoding='utf-8') as f:
        f.write(html_text)
        src = f.name
    js = f"""
const {{ chromium }} = require('playwright');
(async () => {{
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto('file://{src}');
  await p.pdf({{ path: {ut!r}, format: 'A4', printBackground: true,
    displayHeaderFooter: true, headerTemplate: '<span></span>',
    footerTemplate: '<div style="font-size:8pt;width:100%;text-align:center;color:#666"><span class=pageNumber></span> / <span class=totalPages></span></div>',
    margin: {{ top: '16mm', bottom: '18mm', left: '14mm', right: '14mm' }} }});
  await b.close();
}})();
"""
    miljo = dict(os.environ)
    rot = subprocess.run(['npm', 'root', '-g'], capture_output=True, text=True).stdout.strip()
    miljo['NODE_PATH'] = rot
    subprocess.run(['node', '-e', js], check=True, env=miljo)
    os.unlink(src)


def sida(titel, kropp):
    return f'<!doctype html><html lang="en"><head><meta charset="utf-8"><title>{html.escape(titel)}</title><style>{CSS}</style></head><body>{kropp}</body></html>'


def main():
    ut = sys.argv[1] if len(sys.argv) > 1 else 'ugc-va-paket'
    if os.path.exists(ut):
        shutil.rmtree(ut)
    os.makedirs(os.path.join(ut, 'Google Sheet templates'))

    las = lambda f: open(os.path.join(KIT, f), encoding='utf-8').read()

    pdf(sida('Start here', md_html(las('README.md'))), os.path.join(ut, '1 - START HERE.pdf'))

    toc = ''.join(f'<li>{i}. {html.escape(n)}</li>' for i, (_, n) in enumerate(KAPITEL, 1))
    kropp = f'<div class="titel"><h1>UGC Creator Outreach</h1><p style="font-size:14pt">VA Handbook — Bäverbutiken</p><ol class="toc" style="text-align:left;display:inline-block">{toc}</ol></div>'
    for i, (f, n) in enumerate(KAPITEL, 1):
        text = las(f)
        text = re.sub(r'^# .*\n', f'# {i}. {n}\n', text, count=1)
        kropp += f'<div class="kapitel">{md_html(text)}</div>'
    pdf(sida('VA Handbook', kropp), os.path.join(ut, '2 - VA Handbook.pdf'))

    instr = byt_filnamn(las('CLAUDE.md')).replace('Always read these files before you act:',
                                                  'Always read the VA Handbook (project knowledge, PDF) before you act — its chapters:')
    with open(os.path.join(ut, '3 - Paste into Claude project instructions.txt'), 'w', encoding='utf-8-sig', newline='\r\n') as f:
        f.write(instr)

    for csv in ('creators-sheet-template.csv', 'deals-sheet-template.csv'):
        shutil.copy(os.path.join(KIT, csv), os.path.join(ut, 'Google Sheet templates', csv))
    print('klart:', ut, sorted(os.listdir(ut)))


if __name__ == '__main__':
    main()
