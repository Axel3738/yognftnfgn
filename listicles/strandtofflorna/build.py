#!/usr/bin/env python3
"""
Bygger Strandtofflor-listiclen ur Motorhölje-listiclen.
Följer docs/os/LISTICLE-FRAMEWORK.md, del 3: klona sidan, byt innehåll 1:1,
rör aldrig strukturen.
"""
import json, re, os, shutil, zipfile, sys, collections

SRC_DIR = os.path.dirname(os.path.abspath(__file__))
PAGE_JSON = os.path.join(SRC_DIR, 'page', '1_631451887748514611.json')
OUT_DIR = os.path.join(SRC_DIR, 'out')
PAGE_ID = '1_631451887748514611'

CDN = 'https://cdn.shopify.com/s/files/1/1013/0322/2621/files/'

# ---------------------------------------------------------------- steg 1: kartor

# IMG: gammal bild -> ny bild. Profilbilden (hf_20260217...) byts INTE:
# samma avsändare, Anders från Bäverbutiken.
IMG = {
    # footer
    CDN + 'Namnlos_design_3_73a88cf4-155f-4812-918a-58fb0506d6c0.png?v=1785867932':
        CDN + '27a7652d916e45ab98b9e219f7397c60-goods.jpg?v=1782032234',
    # punkt 5, billiga alternativet
    CDN + '5356038fe3c34db47ab9c207eff55e6e_6a785764-48c8-4b4a-b295-945377a11c88.jpg?v=1785867476':
        CDN + 'Namnlosdesign-2026-07-27T131614.320.png?v=1785150988',
    # punkt 2, falsk lösning A
    CDN + 'hf_20260804_181516_14681779-aec6-4f94-8437-7ac7e62f8fee.png?v=1785867408':
        CDN + '27a7652d916e45ab98b9e219f7397c60-goods.jpg?v=1782032234',
    # punkt 3, oåterkallelighet
    CDN + 'hf_20260804_181405_57bc961b-e6ad-4294-8b48-7490c3725ca8.png?v=1785867415':
        CDN + 'dc2b9648-2cb4-480d-b0f1-5826118049aa.jpg?v=1782032233',
    # punkt 1, förnekelse
    CDN + 'Skarmavbild_2026-08-04_kl._20.08.25.png?v=1785866914':
        CDN + '4d880f2a-ec91-462a-8bb3-8a0cbf0c11c2.jpg?v=1782032232',
    # punkt 4, ackumulerad kostnad (tyngsta punkten, starkaste bilden)
    CDN + 'hf_20260804_181313_69545631-2c76-4489-a389-6f2baa6b7ec1.png?v=1785867263':
        CDN + 'Namnlosdesign-2026-07-27T131715.079.png?v=1785151048',
    # lösningssektionen
    CDN + 'Namnlos_design_2.png?v=1785867580':
        CDN + 'Namnlosdesign-2026-07-27T131006.829.png?v=1785150943',
    # ärlighetssektionen
    CDN + 'hf_20260804_174634_099ca39f-dda5-4839-94b5-418823c5d1fe_1.png?v=1785902565':
        CDN + 'Namnlosdesign-2026-07-27T131715.079.png?v=1785151048',
}

LINKS = {
    'https://baverbutiken.se/products/marin-motorholje-420d-universellt-skydd':
        'https://baverbutiken.se/products/strandtofflor-for-herr-halkfria-tradgardsskor',
}

# M fylls av copy.py
from copy_sv import M  # noqa: E402

# ---------------------------------------------------------------- steg 2: applicera

hit = collections.Counter()
img_hit = collections.Counter()


def swap(node):
    if isinstance(node, dict):
        return {k: swap(v) for k, v in node.items()}
    if isinstance(node, list):
        return [swap(v) for v in node]
    if isinstance(node, str):
        s = node
        if s in M:
            hit[s] += 1
            return M[s]
        if s in LINKS:
            hit[s] += 1
            return LINKS[s]
        for old, new in LINKS.items():
            if old in s:
                hit[old] += 1
                s = s.replace(old, new)
        for old, new in IMG.items():
            if old in s:
                img_hit[old] += 1
                s = s.replace(old, new)
        # säkerhetsnät: samma bild kan förekomma med annan ?v=-parameter
        for old, new in IMG.items():
            base = re.escape(old.split('/')[-1].split('?')[0])
            pat = re.compile(re.escape(CDN) + base + r'(\?v=\d+)?')
            if pat.search(s):
                img_hit[old] += 1
                s = pat.sub(new, s)
        return s
    return node


def main():
    data = json.load(open(PAGE_JSON, encoding='utf-8'))

    for sec in data['pageSections']:
        comp = json.loads(sec['component'])
        sec['component'] = json.dumps(swap(comp), ensure_ascii=False, separators=(',', ':'))

    # ------------------------------------------------------------ steg 3: identitet
    data['name'] = 'Strandtofflor – Halkfria trädgårdsskor (listicle)'
    data['handle'] = 'strandtofflor-halkfria'
    # meta[] är en lista av nyckel/värde-poster, inte ett objekt.
    # Sidtiteln och GemPages egna förhandsbilder pekar fortfarande på källsidan.
    for entry in data.get('meta') or []:
        if not isinstance(entry, dict):
            continue
        key = entry.get('key', '')
        if key == 'global-meta-title':
            entry['value'] = 'Strandtofflor för herr, halkfria trädgårdsskor'
        elif key == 'global-meta-description':
            entry['value'] = ('Halkfria strandtofflor för herr i mjuk EVA med tjock, mönstrad '
                              'sula för blöta underlag. Storlek 36 till 47. 349 kr.')
        elif isinstance(entry.get('value'), str) and 'motorholje-lagerrensning' in entry['value']:
            # cachad skärmbild av källsidan, skulle visa fel sida i GemPages
            entry['value'] = ''

    blob = json.dumps(data, ensure_ascii=False)

    # ------------------------------------------------------------ steg 4: verifiera
    print('=' * 64)
    ok = True

    missed = [k for k in M if hit[k] == 0]
    print(f'texter ersatta : {sum(1 for k in M if hit[k])}/{len(M)}')
    for k in missed:
        print(f'  MISSED: {k[:90]}')
        ok = False

    missed_img = [k for k in IMG if img_hit[k] == 0]
    print(f'bilder ersatta : {sum(1 for k in IMG if img_hit[k])}/{len(IMG)}')
    for k in missed_img:
        print(f'  MISSED IMG: {k.split("/")[-1]}')
        ok = False

    em = blob.count('—')
    en = blob.count('–')
    # produktnamnet i titeln får innehålla tankstreck, inget annat
    print(f'em-dash (—)    : {em}')
    print(f'en-dash (–)    : {en}  (endast sidnamnet)')
    if em:
        ok = False
    if en > 1:
        ok = False

    # brygga/bryggan star kvar med flit: det ar legitim kontext for strandtofflor
    for w in ['motorhölj', 'kåpa', 'kåpan', 'utombordare', 'akterspegel', 'båtägar',
              '420D', 'Oxford', 'hölje', 'höljet', 'sjösättning', 'polermedel',
              'andrahandsvärde', 'dragsko', '299 kr', '367 kr', 'lagerrensning']:
        n = len(re.findall(w, blob, re.IGNORECASE))
        if n:
            print(f'  KVARLEVA: "{w}" x{n}')
            ok = False
    print('källproduktens ord: 0' if ok else 'källproduktens ord: SE OVAN')

    old_imgs = [u.split('/')[-1].split('?')[0] for u in IMG]
    for f in old_imgs:
        n = blob.count(f)
        if n:
            print(f'  GAMMAL BILD KVAR: {f} x{n}')
            ok = False

    for new in set(IMG.values()):
        n = blob.count(new.split('/')[-1].split('?')[0])
        print(f'  ny bild {new.split("/")[-1][:44]:46s} x{n}')
        if n == 0:
            ok = False

    print('=' * 64)
    if not ok:
        print('BYGGET STOPPAT. Fixa ovanstående.')
        sys.exit(1)
    print('Alla kontroller gröna.')

    # ------------------------------------------------------------ steg 5: paketera
    os.makedirs(OUT_DIR, exist_ok=True)
    inner = os.path.join(OUT_DIR, f'{PAGE_ID}.zip')
    with zipfile.ZipFile(inner, 'w', zipfile.ZIP_DEFLATED) as z:
        z.writestr(f'{PAGE_ID}.json', json.dumps(data, ensure_ascii=False))

    pinfo = os.path.join(OUT_DIR, 'pages_info.zip')
    info = [{'id': 631451887748514611, 'name': data['name'], 'type': 'GP_STATIC'}]
    with zipfile.ZipFile(pinfo, 'w', zipfile.ZIP_DEFLATED) as z:
        z.writestr('pages_info.json', json.dumps(info, ensure_ascii=False))

    manifest = {
        'export_version': 'export_v2',
        'theme_page_count': 1,
        'theme_section_count': 0,
        'image_url_count': len(set(IMG.values())),
        'shop_curr_version': 337000602,
    }

    out = os.path.join(OUT_DIR, 'Strandtofflor_Halkfria_listicle.gempages')
    with zipfile.ZipFile(out, 'w', zipfile.ZIP_STORED) as z:
        z.write(inner, f'{PAGE_ID}.zip')
        z.writestr('manifest.json', json.dumps(manifest))
        z.write(pinfo, 'pages_info.zip')
    os.remove(inner)
    os.remove(pinfo)
    print('Skrev', out, os.path.getsize(out), 'bytes')


if __name__ == '__main__':
    main()
