#!/usr/bin/env python3
"""Bygger sätesöverdrags-listiclen genom att klona motorhölje-listiclen och byta
allt innehåll, aldrig strukturen. Följer docs/os/LISTICLE-FRAMEWORK.md del 3."""
import json, re, sys, zipfile, shutil, os

SRC_DIR = os.path.dirname(os.path.abspath(__file__))
SRC_JSON = os.path.join(SRC_DIR, 'ex_1_631451887748514611.zip/1_631451887748514611.json')
OLD_ID = '631451887748514611'
NEW_ID = '631451887748514777'          # ny sid-identitet så importen inte skriver över motorhöljet
NEW_NAME = 'Sätesöverdrag för åkgräsklippare (listicle)'
NEW_HANDLE = 'satesoverdrag-akgrasklippare'

OLD_LINK = '/products/marin-motorholje-420d-universellt-skydd'
NEW_LINK = '/products/satesoverdrag-for-akgrasklippare-slittaligt-600d-oxford'

CDN = 'https://cdn.shopify.com/s/files/1/1013/0322/2621/files/'
# sektion -> ny produktbild. Profilbilden (hf_20260217, Anders) och footer-logotypen
# (Namnlos_design_3) rörs inte: de är avsändare/varumärke, inte produkt.
IMG = {
  'Skarmavbild_2026-08-04_kl._20.08.25.png?v=1785866914':                      'dc72d185-eb2a-4b3b-83fd-8c32ebd0a502.jpg?v=1781962959',  # punkt 1
  'hf_20260804_181516_14681779-aec6-4f94-8437-7ac7e62f8fee.png?v=1785867408':  '7cd7b402-132a-4f4f-8b9a-06e15ec2aeaa.jpg?v=1781962960',  # punkt 2
  'hf_20260804_181405_57bc961b-e6ad-4294-8b48-7490c3725ca8.png?v=1785867415':  'faab8a98-428b-4129-b11c-777252f71d2a.jpg?v=1781962959',  # punkt 3
  'hf_20260804_181313_69545631-2c76-4489-a389-6f2baa6b7ec1.png?v=1785867263':  'ea5c10c1-6f0c-46fa-a2c4-02097aeaa1e9.jpg?v=1781962960',  # punkt 4
  '5356038fe3c34db47ab9c207eff55e6e_6a785764-48c8-4b4a-b295-945377a11c88.jpg?v=1785867476': '0d5c10ca-0994-4b04-b273-9bb96296a1c3.jpg?v=1781962960',  # punkt 5
  'Namnlos_design_2.png?v=1785867580':                                         '0f0c537d-522e-4e1a-b9f7-653c141d8dc5.jpg?v=1781962959',  # lösningen
  'hf_20260804_174634_099ca39f-dda5-4839-94b5-418823c5d1fe_1.png?v=1785902565':'24e2ec09-cf44-4b0b-97b8-e1296735ecc2.jpg?v=1781962959',  # ärlighetssektionen
}

# markör i källsträngen -> nyckel i copy.json. Markören används för att slå upp den
# EXAKTA källsträngen ur JSON:en, så inga taggar eller &nbsp; går sönder.
MARKERS = [
  ('Vi beställde in för många motorhöljen',              'h1',            'raw'),
  ('Din motor, och dess andrahandsvärde, tjänar på det',  'dek',           'p'),
  ('Visa lagerrensningen',                               'hero_cta',      'p'),
  ('Senast uppdaterad 4 augusti 2026.',                  'updated',       'p'),
  ('<strong>Sammanfattning:</strong>',                   'summary',       'summary'),
  ('1. Din kåpa ser fin ut',                             'p1_title',      'raw'),
  ('Ingen bestämmer sig för att slita ut sin motor',     'p1_body',       'p'),
  ('Skydda kåpan medan den fortfarande är fin',          'p1_cta',        'p'),
  ('2. En vaxning om året',                              'p2_title',      'raw'),
  ('Handen på hjärtat: ingen spolar av utombordaren',    'p2_body',       'p'),
  ('Ge motorn ett skydd som håller hela säsongen',       'p2_cta',        'p'),
  ('3. Glans går att bevara',                            'p3_title',      'raw'),
  ('Det här är det dolda misstaget',                     'p3_body',       'p'),
  ('Bevara glansen medan den finns kvar',                'p3_cta',        'p'),
  ('4. Värdet försvinner inte på en dag',                'p4_title',      'raw'),
  ('Det här är misstaget som kostar dig mest',           'p4_body',       'p'),
  ('Behåll värdet till den dag du säljer',               'p4_cta',        'p'),
  ('5. Ett billigt hölje är dyrare än inget',            'p5_title',      'strong'),
  ('Många som väl bestämmer sig beställer reflexmässigt','p5_body',       'p'),
  ('Se höljet i 420D Oxfordtyg',                         'p5_cta',        'p'),
  ('Så vad gör båtägarna som lyckas?',                   'solution_title','raw'),
  ('De slutar skjuta upp det och ger motorn',            'solution_body', 'twopara'),
  ('Gör som dem',                                        'solution_cta',  'p'),
  ('vi köpte in för mycket',                             'honesty_body',  'multipara'),
  ('Vill du ha ett är det bara att trycka',              'risk_body',     'p'),
  ('Ja tack, ett hölje för 299 kr',                      'risk_cta',      'p'),
]

FORBIDDEN_WORDS = ['motorhölj', 'motorhöl', 'kåpa', 'kåpan', 'utombordar', 'båt', 'brygga',
                   'salt', 'vax', 'poler', 'glans', '420D', 'hk', 'dragsko', 'akterspegel',
                   'sjösättning', 'lagerrens', '299 kr', '367 kr', 'stuvfack']


def collect(node, out):
    if isinstance(node, dict):
        for v in node.values(): collect(v, out)
    elif isinstance(node, list):
        for v in node: collect(v, out)
    elif isinstance(node, str): out.append(node)


def wrap(kind, val):
    if kind == 'raw':      return val
    if kind == 'strong':   return f'<strong>{val}</strong>'
    if kind == 'p':        return f'<p>{val}</p>'
    if kind == 'twopara':
        a, b = val.split('\n\n', 1)
        return f'<p>{a}</p><p>&nbsp;</p><p>{b}</p>'
    if kind == 'multipara':
        parts = val.split('\n\n')
        return '<p>&nbsp;</p>'.join(f'<p>{p}</p>' for p in parts)
    if kind == 'summary':
        a, b = val.split('\n\n', 1)
        return ('<p><span style="color:#000000;"><strong>Sammanfattning:</strong> '
                f'{a}&nbsp;</span><br><span style="color:#000000;">{b}</span></p>')
    raise ValueError(kind)


def main():
    copy = json.load(open(os.path.join(SRC_DIR, 'copy.json')))
    data = json.load(open(SRC_JSON))

    # --- steg 1: bygg textkartan ur EXAKTA källsträngar --------------------
    allstr = []
    for s in data['pageSections']:
        c = s.get('component')
        collect(json.loads(c) if isinstance(c, str) else c, allstr)
    allstr = list(dict.fromkeys(allstr))

    M, problems = {}, []
    for marker, key, kind in MARKERS:
        hits = [t for t in allstr if marker in t and not t.startswith('<svg')]
        if len(hits) != 1:
            problems.append(f'MARKER {"MISSED" if not hits else "AMBIGUOUS"}: {marker!r} ({len(hits)} träffar)')
            continue
        if key not in copy:
            problems.append(f'SAKNAS I copy.json: {key}')
            continue
        M[hits[0]] = wrap(kind, copy[key])
    if problems:
        print('\n'.join(problems)); sys.exit(1)

    hits_count = {k: 0 for k in M}
    img_count = {v: 0 for v in IMG.values()}

    def sub(node):
        if isinstance(node, dict):  return {k: sub(v) for k, v in node.items()}
        if isinstance(node, list):  return [sub(v) for v in node]
        if isinstance(node, str):
            if node in M:
                hits_count[node] += 1
                return M[node]
            s = node
            for old, new in IMG.items():
                if old in s:
                    s = s.replace(old, new); img_count[new] += 1
                else:  # säkerhetsnät: samma bild kan ligga med annan ?v=-parameter
                    base = old.split('?')[0]
                    if base in s:
                        s = re.sub(re.escape(base) + r'(\?v=\d+)?', new, s); img_count[new] += 1
            s = s.replace(OLD_LINK, NEW_LINK)
            return s
        return node

    for sec in data['pageSections']:
        c = sec.get('component')
        if isinstance(c, str):
            sec['component'] = json.dumps(sub(json.loads(c)), ensure_ascii=False)
        else:
            sec['component'] = sub(c)

    # --- steg 3: identitet ------------------------------------------------
    data['name'], data['handle'] = NEW_NAME, NEW_HANDLE
    raw = json.dumps(data, ensure_ascii=False).replace(OLD_ID, NEW_ID)
    data = json.loads(raw)

    # --- steg 4: verifiera, stoppa vid fel --------------------------------
    fails = []
    missed = [k for k, v in hits_count.items() if v == 0]
    for m in missed: fails.append(f'MISSED (ersattes aldrig): {m[:70]!r}')
    for img, n in img_count.items():
        if n == 0: fails.append(f'NY BILD ANVÄNDS INTE: {img}')
    body = json.dumps(data, ensure_ascii=False)
    texts = []
    for s in data['pageSections']:
        collect(json.loads(s['component']) if isinstance(s['component'], str) else s['component'], texts)
    texts = [t for t in texts if not t.startswith('<svg') and not t.startswith('http')]
    joined = '\n'.join(texts)
    if '—' in joined: fails.append(f'EM-DASH hittad: {joined.count("—")} st')
    for t in texts:
        if '–' in t and 'font' not in t.lower(): fails.append(f'TANKSTRECK i text: {t[:70]!r}')
    if 'överstruket' in joined.lower(): fails.append('ordet "överstruket" finns i sidan')
    for w in FORBIDDEN_WORDS:
        pat = re.escape(w) if len(w) > 3 else r'\b' + re.escape(w) + r'\b'
        n = len(re.findall(pat, joined, re.I))
        if n: fails.append(f'KÄLLPRODUKTENS ORD kvar: {w!r} x{n}')
    for old in IMG:
        if old.split('?')[0] in body: fails.append(f'GAMMAL BILD kvar: {old[:50]}')
    if OLD_LINK in body: fails.append('GAMMAL PRODUKTLÄNK kvar')
    if NEW_LINK not in body: fails.append('NY PRODUKTLÄNK saknas')
    for must in ['649 kr', '811 kr', '600D', 'OBS: Detta är reklam.']:
        if must not in joined: fails.append(f'OBLIGATORISK STRÄNG saknas: {must!r}')

    print(f'texter ersatta: {len(M) - len(missed)}/{len(M)} · missade: {len(missed)}')
    print(f'bilder bytta:   {sum(1 for v in img_count.values() if v)}/{len(img_count)}')
    if fails:
        print('\nBYGGET STOPPAT:'); print('\n'.join(' ! ' + f for f in fails)); sys.exit(1)
    print('alla kontroller OK')

    # --- steg 5: paketera tillbaka ----------------------------------------
    out_json = f'{NEW_ID}.json'
    open(os.path.join(SRC_DIR, out_json), 'w').write(json.dumps(data, ensure_ascii=False))
    inner = os.path.join(SRC_DIR, f'{NEW_ID}.zip')
    with zipfile.ZipFile(inner, 'w', zipfile.ZIP_DEFLATED) as z:
        z.write(os.path.join(SRC_DIR, out_json), out_json)
    pages_info = json.dumps([{"id": int(NEW_ID), "name": NEW_NAME, "type": "GP_STATIC"}], ensure_ascii=False)
    open(os.path.join(SRC_DIR, 'pages_info.json'), 'w').write(pages_info)
    pi = os.path.join(SRC_DIR, 'pages_info_new.zip')
    with zipfile.ZipFile(pi, 'w', zipfile.ZIP_DEFLATED) as z:
        z.write(os.path.join(SRC_DIR, 'pages_info.json'), 'pages_info.json')
    manifest = json.dumps({"export_version": "export_v2", "theme_page_count": 1,
                           "theme_section_count": 0, "image_url_count": len(IMG),
                           "shop_curr_version": 337000602})
    open(os.path.join(SRC_DIR, 'manifest_new.json'), 'w').write(manifest)

    out = os.path.join(SRC_DIR, 'Satesoverdrag_listicle.gempages')
    with zipfile.ZipFile(out, 'w', zipfile.ZIP_STORED) as z:
        z.write(inner, f'{NEW_ID}.zip')
        z.write(os.path.join(SRC_DIR, 'manifest_new.json'), 'manifest.json')
        z.write(pi, 'pages_info.zip')
    print('skrev', out, os.path.getsize(out), 'bytes')


if __name__ == '__main__':
    main()
