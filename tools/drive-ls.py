#!/usr/bin/env python3
# Listar en länkdelad Google Drive-mapp utan inloggning, via embeddedfolderview.
# Tar med ALLA filtyper — även Docs/Sheets, som länkar till docs.google.com,
# inte drive.google.com (missas de blir mappen till synes utan dokument).
#
#   python3 tools/drive-ls.py <mapp-id>
#
# Utdata, tabbseparerat: typ (mapp/fil/doc/sheet) · id · titel
import re, sys, html, urllib.request

def ls(folder_id):
    url = f"https://drive.google.com/embeddedfolderview?id={folder_id}#list"
    with urllib.request.urlopen(url, timeout=30) as r:
        s = r.read().decode('utf-8', 'ignore')
    out = []
    mönster = r'href="(https://(?:drive|docs)\.google\.com/[^"]+)"[^>]*>.*?flip-entry-title">([^<]*)<'
    for m in re.finditer(mönster, s, re.S):
        u, titel = m.group(1), html.unescape(m.group(2)).strip()
        idm = re.search(r'/(?:folders|d)/([-\w]+)', u)
        if not idm:
            continue
        if '/drive/folders/' in u: typ = 'mapp'
        elif '/document/' in u:    typ = 'doc'
        elif '/spreadsheets/' in u: typ = 'sheet'
        else:                       typ = 'fil'
        out.append((typ, idm.group(1), titel))
    return out

if __name__ == '__main__':
    for typ, fid, titel in ls(sys.argv[1]):
        print(f"{typ}\t{fid}\t{titel}")
